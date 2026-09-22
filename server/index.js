/**
 * ============================================================
 * VedicAladdin V7 — server/index.js
 * Optional Express Server
 * Serves app + provides REST API for analysis
 * ============================================================
 */

'use strict';

const path = require('path');
const fs = require('fs');

// Load core modules
const EPHEMERIS = require('../core/ephemeris');
const PANCHANGA = require('../core/panchanga');
const VARGA = require('../core/varga');
const DASHA = require('../core/dasha');
const VEDIC_ENGINE = require('../core/vedic-engine');
const MARKET_ENGINE = require('../market/market-engine');
const CONSENSUS_ENGINE = require('../core/consensus-engine');

// Try to load Express (optional)
let express, cors, app, PORT;
try {
  express = require('express');
  cors = require('cors');
  app = express();
  PORT = process.env.PORT || 3000;
} catch (e) {
  console.warn('⚠️ Express not installed. Server mode disabled.');
  console.warn('    App runs fully offline in browser without server.');
  process.exit(0);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../ui')));

// ============================================================
// API ROUTES
// ============================================================

/**
 * GET / — Serve main app
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../ui/index.html'));
});

/**
 * GET /api/health — Health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '7.0.0',
    modules: {
      ephemeris: !!EPHEMERIS,
      panchanga: !!PANCHANGA,
      varga: !!VARGA,
      dasha: !!DASHA,
      vedic_engine: !!VEDIC_ENGINE,
      market_engine: !!MARKET_ENGINE,
      consensus_engine: !!CONSENSUS_ENGINE
    }
  });
});

/**
 * POST /api/analyze — Complete Vedic analysis
 * Body: { year, month, day, hour, minute, second, timezone }
 */
app.post('/api/analyze', (req, res) => {
  try {
    const { year, month, day, hour = 0, minute = 0, second = 0, timezone = 'IST' } = req.body;
    
    if (!year || !month || !day) {
      return res.status(400).json({ error: 'Missing required fields: year, month, day' });
    }
    
    const analysis = VEDIC_ENGINE.analyzeDate(year, month, day, hour, minute, second, timezone);
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/consensus — Build consensus with market data
 * Body: { year, month, day, hour, minute, marketData }
 */
app.post('/api/consensus', (req, res) => {
  try {
    const { year, month, day, hour = 0, minute = 0, marketData } = req.body;
    
    const vedicAnalysis = VEDIC_ENGINE.analyzeDate(year, month, day, hour, minute);
    const consensus = CONSENSUS_ENGINE.buildConsensus(vedicAnalysis, marketData);
    
    res.json({
      success: true,
      data: consensus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/panchanga/:year/:month/:day — Get Panchanga for a date
 */
app.get('/api/panchanga/:year/:month/:day', (req, res) => {
  try {
    const { year, month, day } = req.params;
    const analysis = VEDIC_ENGINE.analyzeDate(parseInt(year), parseInt(month), parseInt(day));
    
    res.json({
      success: true,
      data: analysis.panchanga,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/chart/:year/:month/:day/:hour/:minute — Get natal chart
 */
app.get('/api/chart/:year/:month/:day/:hour/:minute', (req, res) => {
  try {
    const { year, month, day, hour, minute } = req.params;
    const chart = VEDIC_ENGINE.getChart(
      parseInt(year), parseInt(month), parseInt(day),
      parseInt(hour), parseInt(minute)
    );
    
    res.json({
      success: true,
      data: chart,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/muhurta/:year/:month/:day/:hour/:minute — Muhurta score
 */
app.get('/api/muhurta/:year/:month/:day/:hour/:minute', (req, res) => {
  try {
    const { year, month, day, hour, minute } = req.params;
    const score = VEDIC_ENGINE.getMuhurtaScore(
      parseInt(year), parseInt(month), parseInt(day),
      parseInt(hour), parseInt(minute)
    );
    
    res.json({
      success: true,
      data: { score },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/session — Current NY market session
 */
app.get('/api/session', (req, res) => {
  try {
    const session = MARKET_ENGINE.getCurrentSession();
    
    res.json({
      success: true,
      data: session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/market/gap — Analyze gap
 */
app.post('/api/market/gap', (req, res) => {
  try {
    const { previousClose, currentOpen } = req.body;
    
    if (!previousClose || !currentOpen) {
      return res.status(400).json({ error: 'Missing: previousClose, currentOpen' });
    }
    
    const gap = MARKET_ENGINE.analyzeGap(previousClose, currentOpen);
    
    res.json({
      success: true,
      data: gap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/market/candle — Analyze opening candle
 */
app.post('/api/market/candle', (req, res) => {
  try {
    const { open, high, low, close, volume } = req.body;
    
    if (!open || !high || !low || !close) {
      return res.status(400).json({ error: 'Missing: open, high, low, close' });
    }
    
    const candle = MARKET_ENGINE.analyzeOpeningCandle(open, high, low, close, volume);
    
    res.json({
      success: true,
      data: candle,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/auspicious/:year/:month/:day/:days — Get auspicious dates
 */
app.get('/api/auspicious/:year/:month/:day/:days', (req, res) => {
  try {
    const { year, month, day, days } = req.params;
    const dates = VEDIC_ENGINE.getAuspiciousDates(
      parseInt(year), parseInt(month), parseInt(day),
      parseInt(days)
    );
    
    res.json({
      success: true,
      data: dates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// ============================================================
// START SERVER
// ============================================================

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🔱 वैदिक अलादीन V7 — Server Started');
  console.log('='.repeat(60));
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ App: http://localhost:${PORT}/`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('📚 API Endpoints:');
  console.log('  POST /api/analyze — Complete analysis');
  console.log('  POST /api/consensus — Vedic + Market consensus');
  console.log('  GET /api/panchanga/:year/:month/:day');
  console.log('  GET /api/chart/:year/:month/:day/:hour/:minute');
  console.log('  GET /api/muhurta/:year/:month/:day/:hour/:minute');
  console.log('  GET /api/session — Current NY session');
  console.log('  POST /api/market/gap — Gap analysis');
  console.log('  POST /api/market/candle — Candle analysis');
  console.log('  GET /api/auspicious/:year/:month/:day/:days');
  console.log('');
  console.log('💾 Mode: Server + Offline-First');
  console.log('📖 Docs: See README.md');
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
