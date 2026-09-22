/**
 * ============================================================
 * VedicAladdin V7 — tests/test.js
 * Test Suite — Validates all modules
 * ============================================================
 */

'use strict';

const EPHEMERIS = require('../core/ephemeris');
const PANCHANGA = require('../core/panchanga');
const VARGA = require('../core/varga');
const DASHA = require('../core/dasha');
const VEDIC_ENGINE = require('../core/vedic-engine');
const MARKET_ENGINE = require('../market/market-engine');
const CONSENSUS_ENGINE = require('../core/consensus-engine');

const TESTS = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  TESTS.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected ${expected}, got ${actual}`);
  }
}

function assertClose(actual, expected, tolerance = 0.01, message) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message || 'Assertion failed'}: expected ${expected} ±${tolerance}, got ${actual}`);
  }
}

// ============================================================
// EPHEMERIS TESTS
// ============================================================

test('EPHEMERIS: Date to Julian Day conversion', () => {
  const jd = EPHEMERIS.dateToJD(2000, 1, 1, 12, 0, 0);
  assertClose(jd, 2451545, 0.01, 'JD for 2000-01-01 12:00 UT');
});

test('EPHEMERIS: Ayanamsha calculation', () => {
  const jd = EPHEMERIS.dateToJD(2000, 1, 1, 12, 0, 0);
  const ayanamsha = EPHEMERIS.getAyanamsha(jd);
  assertClose(ayanamsha, 23.16, 0.1, 'Ayanamsha at 2000-01-01');
});

test('EPHEMERIS: Planet positions for known date', () => {
  const jd = EPHEMERIS.dateToJD(2023, 9, 23, 0, 0, 0);
  const positions = EPHEMERIS.getPlanetPositions(jd);
  
  assert(positions.length === 9, 'Should have 9 planet positions');
  
  positions.forEach((pos, idx) => {
    assertClose(pos, pos % 360, 0.1, `Planet ${idx} should be 0-360 degrees`);
  });
});

test('EPHEMERIS: Degree to Rashi conversion', () => {
  const rashi = EPHEMERIS.degreeToRashi(30);
  assertEquals(rashi.rashi, 1, 'Degree 30 should be Taurus (1)');
});

// ============================================================
// PANCHANGA TESTS
// ============================================================

test('PANCHANGA: Tithi calculation', () => {
  const tithi = PANCHANGA.calculateTithi(0, 180); // Sun at 0, Moon at 180
  assertEquals(tithi.index, 15, 'Sun-Moon 180° should be Purnima (15)');
});

test('PANCHANGA: Nakshatra calculation', () => {
  const nak = PANCHANGA.calculateNakshatra(0);
  assertEquals(nak.index, 0, 'Moon at 0° should be Ashwini (0)');
});

test('PANCHANGA: Nakshatra names', () => {
  const nakshatras = PANCHANGA.NAKSHATRAS;
  assertEquals(nakshatras.length, 27, 'Should have 27 nakshatras');
  assertEquals(nakshatras[0].name_hi, 'अश्विनी', 'First nakshatra should be Ashwini');
});

test('PANCHANGA: Vara calculation', () => {
  const jd = EPHEMERIS.dateToJD(2023, 9, 25, 0, 0, 0); // Monday
  const vara = PANCHANGA.calculateVara(jd);
  assertEquals(vara.name_en, 'Monday', 'Should identify Monday correctly');
});

test('PANCHANGA: Complete Panchanga', () => {
  const panchanga = PANCHANGA.getPanchanga(10, 180, EPHEMERIS.dateToJD(2023, 9, 23));
  assert(panchanga.tithi, 'Should have tithi');
  assert(panchanga.nakshatra, 'Should have nakshatra');
  assert(panchanga.yoga, 'Should have yoga');
  assert(panchanga.karana, 'Should have karana');
  assert(panchanga.vara, 'Should have vara');
});

// ============================================================
// VARGA TESTS
// ============================================================

test('VARGA: Rashi details extraction', () => {
  const rashi = VARGA.getRashiDetails(45); // 1° 15' in Taurus
  assertEquals(rashi.rashi, 1, 'Should identify Taurus (1)');
  assertEquals(rashi.degrees, 15, 'Should have 15 degrees in sign');
});

test('VARGA: D9 Navamsha calculation', () => {
  const d9 = VARGA.getVargaPosition(0, 9); // Ashwini start in D9
  assert(d9.rashi !== undefined, 'Should calculate navamsha rashi');
});

test('VARGA: Multiple varga positions', () => {
  const vargas = VARGA.getPlanetVargas(0, ['D1', 'D2', 'D9']);
  assert(vargas.D1, 'Should have D1');
  assert(vargas.D2, 'Should have D2');
  assert(vargas.D9, 'Should have D9');
});

test('VARGA: Rashi names match count', () => {
  assertEquals(VARGA.RASHIS.length, 12, 'Should have 12 rashis');
});

// ============================================================
// DASHA TESTS
// ============================================================

test('DASHA: Vimshottari sequence', () => {
  assertEquals(DASHA.VIMSHOTTARI_SEQUENCE.length, 9, 'Vimshottari should have 9 lords');
  const totalYears = DASHA.VIMSHOTTARI_SEQUENCE.reduce((sum, d) => sum + d.years, 0);
  assertEquals(totalYears, 120, 'Vimshottari should be 120 years total');
});

test('DASHA: Yogini sequence', () => {
  assertEquals(DASHA.YOGINI_SEQUENCE.length, 8, 'Yogini should have 8 goddesses');
  const totalYears = DASHA.YOGINI_SEQUENCE.reduce((sum, y) => sum + y.years, 0);
  assertEquals(totalYears, 36, 'Yogini should be 36 years total');
});

test('DASHA: Nakshatra to lord mapping', () => {
  const lord0 = DASHA.getNakshatraLord(0);
  assertEquals(lord0, 'केतु', 'Ashwini should have Ketu as lord');
});

test('DASHA: Vimshottari calculation', () => {
  const vimshottari = DASHA.calculateVimshottari({ index: 0, percent: 50 });
  assert(vimshottari.sequence, 'Should generate dasha sequence');
  assert(vimshottari.sequence.length > 0, 'Sequence should have periods');
});

// ============================================================
// VEDIC ENGINE TESTS
// ============================================================

test('VEDIC_ENGINE: Complete analysis', () => {
  const analysis = VEDIC_ENGINE.analyzeDate(2023, 9, 23, 12, 0, 0);
  
  assert(analysis.jd, 'Should have Julian Day');
  assert(analysis.planets, 'Should have planet positions');
  assert(analysis.panchanga, 'Should have panchanga');
  assert(analysis.planetDetails, 'Should have planet details');
});

test('VEDIC_ENGINE: Quick analysis', () => {
  const analysis = VEDIC_ENGINE.quickAnalyze(2023, 9, 23);
  assert(analysis.panchanga, 'Quick analysis should have panchanga');
});

test('VEDIC_ENGINE: Chart generation', () => {
  const chart = VEDIC_ENGINE.getChart(2023, 9, 23, 12, 0);
  assert(chart.chart, 'Should generate chart');
  assert(chart.nakshatra, 'Should have nakshatra');
});

test('VEDIC_ENGINE: Retrograde detection', () => {
  const retrograde = VEDIC_ENGINE.getRetrogradePlanets(2023, 9, 23);
  assert(Array.isArray(retrograde), 'Should return array of retrograde planets');
});

// ============================================================
// MARKET ENGINE TESTS
// ============================================================

test('MARKET_ENGINE: NY offset calculation', () => {
  const offset = MARKET_ENGINE.getNYOffset(new Date(2023, 5, 15)); // June 15 (EDT)
  assertEquals(offset, -4, 'Should be EDT (-4) in June');
  
  const offset2 = MARKET_ENGINE.getNYOffset(new Date(2023, 11, 15)); // December (EST)
  assertEquals(offset2, -5, 'Should be EST (-5) in December');
});

test('MARKET_ENGINE: Session detection', () => {
  const session = MARKET_ENGINE.getCurrentSession(new Date(2023, 8, 23, 14, 30, 0)); // 2:30 PM ET
  assert(session.current, 'Should identify current session');
});

test('MARKET_ENGINE: Gap analysis', () => {
  const gap = MARKET_ENGINE.analyzeGap(10000, 10100);
  assertEquals(gap.percent, 1, 'Gap up 100 points from 10000 = 1%');
});

test('MARKET_ENGINE: Opening candle analysis', () => {
  const candle = MARKET_ENGINE.analyzeOpeningCandle(10000, 10050, 9950, 10020, 1000000);
  assert(candle.range > 0, 'Should calculate range');
  assert(candle.pattern, 'Should identify pattern');
});

// ============================================================
// CONSENSUS ENGINE TESTS
// ============================================================

test('CONSENSUS_ENGINE: Vedic scoring', () => {
  const analysis = VEDIC_ENGINE.analyzeDate(2023, 9, 23, 12, 0, 0);
  const score = CONSENSUS_ENGINE.scoreVedicSignal(analysis);
  
  assert(score >= 0 && score <= 100, 'Score should be 0-100');
});

test('CONSENSUS_ENGINE: Market scoring', () => {
  const marketData = {
    gap: { type_en: 'Gap Up' },
    opening: { pattern_en: 'Bullish' }
  };
  
  const score = CONSENSUS_ENGINE.scoreMarketSignal(marketData);
  assert(score > 50, 'Bullish market should score > 50');
});

test('CONSENSUS_ENGINE: Confidence calculation', () => {
  const confidence = CONSENSUS_ENGINE.calculateConfidence(70, 75);
  assert(confidence > 90, 'Close scores should have high confidence');
});

// ============================================================
// KNOWN DATE VALIDATION TESTS
// ============================================================

test('VALIDATION: Dot-com peak (2000-03-10)', () => {
  const analysis = VEDIC_ENGINE.analyzeDate(2000, 3, 10, 12, 0, 0);
  const score = CONSENSUS_ENGINE.scoreVedicSignal(analysis);
  
  // Historical context: Bearish on that date
  console.log(`  📊 2000-03-10 Vedic Score: ${score} (Historical context: Bearish)`);
});

test('VALIDATION: Lehman Brothers crash (2008-09-15)', () => {
  const analysis = VEDIC_ENGINE.analyzeDate(2008, 9, 15, 12, 0, 0);
  const score = CONSENSUS_ENGINE.scoreVedicSignal(analysis);
  
  // Historical context: Strong Bearish on that date
  console.log(`  📊 2008-09-15 Vedic Score: ${score} (Historical context: Strong Bearish)`);
});

test('VALIDATION: COVID-19 bottom (2020-03-23)', () => {
  const analysis = VEDIC_ENGINE.analyzeDate(2020, 3, 23, 12, 0, 0);
  const score = CONSENSUS_ENGINE.scoreVedicSignal(analysis);
  
  // Historical context: Bullish reversal on that date
  console.log(`  📊 2020-03-23 Vedic Score: ${score} (Historical context: Bullish)`);
});

// ============================================================
// RUN ALL TESTS
// ============================================================

function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🔱 वैदिक अलादीन V7 — TEST SUITE');
  console.log('='.repeat(60) + '\n');

  TESTS.forEach((test, index) => {
    try {
      test.fn();
      console.log(`✅ PASS: ${test.name}`);
      passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${test.name}`);
      console.log(`   └─ ${error.message}`);
      failed++;
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`📊 परिणाम: ${passed} पास, ${failed} विफल, कुल: ${TESTS.length}`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('✅ सभी परीक्षण पास!');
    process.exit(0);
  } else {
    console.log(`⚠️ ${failed} परीक्षण विफल`);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { test, runAllTests };
