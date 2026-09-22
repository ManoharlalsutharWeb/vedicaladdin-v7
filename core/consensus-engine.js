/**
 * ============================================================
 * VedicAladdin V7 — core/consensus-engine.js
 * Consensus Engine — Merge Vedic + Market signals
 * Keeps all layers transparent for analysis
 * ============================================================
 */

'use strict';

const CONSENSUS_ENGINE = (function() {
  const MODULE = {};

  /**
   * Score Vedic signal (0-100)
   */
  function scoreVedicSignal(analysis) {
    let score = 50; // Neutral base
    
    // Tithi influence
    const bullishTithis = [1, 2, 3, 10, 11, 12]; // Shukla paksha generally bullish
    if (bullishTithis.includes(analysis.panchanga.tithi.index)) {
      score += 15;
    } else {
      score -= 5;
    }
    
    // Nakshatra influence
    if (analysis.panchanga.nakshatra.index === 21) { // Shravan (Jupiter's nakshatra)
      score += 10; // Good for wealth/trading
    }
    
    // Yoga influence  
    if (analysis.panchanga.yoga.index === 27) { // Sarvartha Siddhi
      score += 15;
    }
    
    // Day of week influence
    const favorableDays = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri
    if (favorableDays.includes(analysis.panchanga.vara.index)) {
      score += 5;
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score Market signal (0-100)
   */
  function scoreMarketSignal(marketData) {
    if (!marketData) return 50;
    
    let score = 50; // Neutral base
    
    // Gap analysis
    if (marketData.gap && marketData.gap.type_en === 'Gap Up') {
      score += 10;
    } else if (marketData.gap && marketData.gap.type_en === 'Gap Down') {
      score -= 10;
    }
    
    // Opening candle
    if (marketData.opening && marketData.opening.pattern_en === 'Bullish') {
      score += 10;
    } else if (marketData.opening && marketData.opening.pattern_en === 'Bearish') {
      score -= 10;
    }
    
    // Volatility
    if (marketData.volatility) {
      if (marketData.volatility.level_en === 'High') {
        score -= 5; // High volatility = more uncertainty
      }
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Create multi-layer consensus
   */
  function buildConsensus(vedicAnalysis, marketData = null) {
    const vedicScore = scoreVedicSignal(vedicAnalysis);
    const marketScore = scoreMarketSignal(marketData);
    
    // Calculate consensus
    const weights = {
      vedic: 0.4,
      market: 0.4,
      historical: 0.2
    };
    
    const consensusScore = (vedicScore * weights.vedic) + 
                          (marketScore * weights.market) + 
                          (50 * weights.historical);
    
    // Determine direction
    let direction = 'निरपेक्ष';
    let directionEn = 'Neutral';
    
    if (consensusScore > 65) {
      direction = 'तेजी (मजबूत)';
      directionEn = 'Bullish (Strong)';
    } else if (consensusScore > 55) {
      direction = 'तेजी (कमजोर)';
      directionEn = 'Bullish (Weak)';
    } else if (consensusScore < 35) {
      direction = 'मंदी (मजबूत)';
      directionEn = 'Bearish (Strong)';
    } else if (consensusScore < 45) {
      direction = 'मंदी (कमजोर)';
      directionEn = 'Bearish (Weak)';
    }
    
    // Build layer details
    const layers = {
      vedic: {
        score: vedicScore,
        signals: extractVedicSignals(vedicAnalysis),
        weight: weights.vedic,
        influence: vedicScore > 55 ? 'तेजी' : vedicScore < 45 ? 'मंदी' : 'तटस्थ'
      },
      market: {
        score: marketScore,
        signals: marketData ? extractMarketSignals(marketData) : [],
        weight: weights.market,
        influence: marketScore > 55 ? 'तेजी' : marketScore < 45 ? 'मंदी' : 'तटस्थ'
      },
      historical: {
        score: 50,
        signals: ['कोई ऐतिहासिक डेटा उपलब्ध नहीं'],
        weight: weights.historical,
        influence: 'तटस्थ'
      }
    };
    
    // Agreement analysis
    const agreement = {
      vedicMarket: vedicScore > 55 && marketScore > 55 ? 'सहमति (तेजी)' :
                  vedicScore < 45 && marketScore < 45 ? 'सहमति (मंदी)' :
                  'असहमति',
      confidence: calculateConfidence(vedicScore, marketScore)
    };
    
    return {
      date: new Date(),
      consensusScore: Math.round(consensusScore),
      direction: direction,
      direction_en: directionEn,
      layers: layers,
      agreement: agreement,
      summary_hi: `${direction} | आत्मविश्वास: ${agreement.confidence}% | वैदिक: ${Math.round(vedicScore)} | बाजार: ${Math.round(marketScore)}`,
      summary_en: `${directionEn} | Confidence: ${agreement.confidence}% | Vedic: ${Math.round(vedicScore)} | Market: ${Math.round(marketScore)}`
    };
  }

  /**
   * Extract Vedic signals
   */
  function extractVedicSignals(analysis) {
    const signals = [];
    
    // Tithi signal
    const bullishTithis = [1, 2, 3, 10, 11, 12];
    if (bullishTithis.includes(analysis.panchanga.tithi.index)) {
      signals.push(`तिथि: ${analysis.panchanga.tithi.name_hi} (तेजी)`);
    } else {
      signals.push(`तिथि: ${analysis.panchanga.tithi.name_hi} (मंदी)`);
    }
    
    // Nakshatra signal
    signals.push(`नक्षत्र: ${analysis.panchanga.nakshatra.name_hi}`);
    
    // Yoga signal
    signals.push(`योग: ${analysis.panchanga.yoga.name_hi}`);
    
    // Vara signal
    signals.push(`वार: ${analysis.panchanga.vara.name_hi}`);
    
    return signals;
  }

  /**
   * Extract Market signals
   */
  function extractMarketSignals(marketData) {
    const signals = [];
    
    if (marketData.gap) {
      signals.push(`गैप: ${marketData.gap.type} (${marketData.gap.percent.toFixed(2)}%)`);
    }
    
    if (marketData.opening) {
      signals.push(`खोलने: ${marketData.opening.pattern}`);
    }
    
    if (marketData.behavior) {
      signals.push(`व्यवहार: ${marketData.behavior.type}`);
    }
    
    if (marketData.volatility) {
      signals.push(`अस्थिरता: ${marketData.volatility.level}`);
    }
    
    return signals;
  }

  /**
   * Calculate confidence score (0-100)
   */
  function calculateConfidence(vedicScore, marketScore) {
    // Higher confidence when scores agree
    const diff = Math.abs(vedicScore - marketScore);
    const confidence = Math.max(0, 100 - diff);
    return Math.round(confidence);
  }

  /**
   * Detailed analysis report
   */
  function generateDetailedReport(consensus, vedicAnalysis) {
    return {
      timestamp: consensus.date.toISOString(),
      consensusScore: consensus.consensusScore,
      direction: consensus.direction,
      direction_en: consensus.direction_en,
      
      layers: {
        vedic: {
          summary: `Vedic Score: ${consensus.layers.vedic.score.toFixed(0)}`,
          tithi: vedicAnalysis.panchanga.tithi.name_hi,
          nakshatra: vedicAnalysis.panchanga.nakshatra.name_hi,
          yoga: vedicAnalysis.panchanga.yoga.name_hi,
          vara: vedicAnalysis.panchanga.vara.name_hi,
          signals: consensus.layers.vedic.signals
        }
      },
      
      recommendation: consensus.consensusScore > 70 ? 
        'तेजी की प्रवृत्ति | लंबी स्थिति पर विचार करें' :
        consensus.consensusScore > 55 ?
        'हल्की तेजी | सावधानी से आगे बढ़ें' :
        consensus.consensusScore < 30 ?
        'मंदी की प्रवृत्ति | छोटी स्थिति पर विचार करें' :
        consensus.consensusScore < 45 ?
        'हल्की मंदी | सावधानी से आगे बढ़ें' :
        'तटस्थ | प्रतीक्षा करें',
      
      disclaimer: 'यह विश्लेषण शुद्ध ज्योतिषीय और तकनीकी संभावनाओं पर आधारित है। निवेश निर्णय लेने से पहले पेशेवर सलाह लें।'
    };
  }

  /**
   * Generate HTML report (for display)
   */
  function generateHTMLReport(consensus, vedicAnalysis) {
    const html = `
      <div class="consensus-report">
        <h2>वैदिक अलादीन V7 — सहमति विश्लेषण</h2>
        
        <div class="consensus-score">
          <span class="score">${consensus.consensusScore}</span>
          <span class="direction">${consensus.direction}</span>
        </div>
        
        <div class="layers">
          <div class="layer vedic-layer">
            <h3>वैदिक (${consensus.layers.vedic.score.toFixed(0)})</h3>
            <ul>
              ${consensus.layers.vedic.signals.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          
          <div class="layer market-layer">
            <h3>बाजार (${consensus.layers.market.score.toFixed(0)})</h3>
            <ul>
              ${consensus.layers.market.signals.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="agreement">
          <strong>सहमति:</strong> ${consensus.agreement.vedicMarket}
          <br/>
          <strong>विश्वास:</strong> ${consensus.agreement.confidence}%
        </div>
      </div>
    `;
    
    return html;
  }

  // Public API
  MODULE.scoreVedicSignal = scoreVedicSignal;
  MODULE.scoreMarketSignal = scoreMarketSignal;
  MODULE.buildConsensus = buildConsensus;
  MODULE.extractVedicSignals = extractVedicSignals;
  MODULE.extractMarketSignals = extractMarketSignals;
  MODULE.calculateConfidence = calculateConfidence;
  MODULE.generateDetailedReport = generateDetailedReport;
  MODULE.generateHTMLReport = generateHTMLReport;

  return MODULE;
})();

if (typeof module !== 'undefined') module.exports = CONSENSUS_ENGINE;
if (typeof window !== 'undefined') window.CONSENSUS_ENGINE = CONSENSUS_ENGINE;
