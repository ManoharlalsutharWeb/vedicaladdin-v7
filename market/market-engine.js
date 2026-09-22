/**
 * ============================================================
 * VedicAladdin V7 — market/market-engine.js
 * Market Engine — NASDAQ Futures (NQ) analysis
 * Session management, timezone handling, market hours
 * ============================================================
 */

'use strict';

const MARKET_ENGINE = (function() {
  const MODULE = {};

  // NASDAQ Birth Data
  const NASDAQ_BIRTH = {
    date: new Date(1971, 1, 8, 15, 0, 0), // Feb 8, 1971, 10:00 AM EST = 15:00 UTC
    latitude: 40.714,
    longitude: -74.006,
    timezone: 'America/New_York'
  };

  /**
   * Market Sessions for NY timezone
   */
  const SESSIONS = {
    PRE_MARKET: {
      name_hi: 'प्री-मार्केट',
      name_en: 'Pre-Market',
      startET: 4,      // 4:00 AM ET
      endET: 9.5,      // 9:30 AM ET (market open)
      duration: 5.5
    },
    REGULAR: {
      name_hi: 'नियमित सत्र',
      name_en: 'Regular Session',
      startET: 9.5,    // 9:30 AM ET
      endET: 16,       // 4:00 PM ET (market close)
      duration: 6.5
    },
    AFTER_MARKET: {
      name_hi: 'आफ्टर-मार्केट',
      name_en: 'After Market',
      startET: 16,     // 4:00 PM ET
      endET: 20,       // 8:00 PM ET
      duration: 4
    },
    ASIAN: {
      name_hi: 'एशियन सत्र',
      name_en: 'Asian Session',
      startIST: 9.5,   // 9:30 AM IST (15:00 UTC-1 = 20:00 IST prev day)
      endIST: 16,      // 4:00 PM IST (starts for next NY session)
      duration: 6.5
    }
  };

  /**
   * Convert UTC to NY timezone (EST/EDT)
   */
  function utcToNY(date) {
    const offset = getNYOffset(date);
    return new Date(date.getTime() + offset * 60 * 60 * 1000);
  }

  /**
   * Get NY timezone offset in hours (EST = -5, EDT = -4)
   */
  function getNYOffset(date) {
    const year = date.getFullYear();
    const march = new Date(year, 2, 14);
    const november = new Date(year, 10, 1);
    
    // DST: Second Sunday of March to First Sunday of November
    const secondMarchSunday = new Date(march);
    secondMarchSunday.setDate(14);
    while (secondMarchSunday.getDay() !== 0) {
      secondMarchSunday.setDate(secondMarchSunday.getDate() + 1);
    }
    
    const firstNovemberSunday = new Date(november);
    while (firstNovemberSunday.getDay() !== 0) {
      firstNovemberSunday.setDate(firstNovemberSunday.getDate() + 1);
    }
    
    if (date >= secondMarchSunday && date < firstNovemberSunday) {
      return -4; // EDT
    } else {
      return -5; // EST
    }
  }

  /**
   * Determine current session and time till next session
   */
  function getCurrentSession(date = null) {
    const now = date || new Date();
    const nyDate = utcToNY(now);
    const hourET = nyDate.getHours() + nyDate.getMinutes() / 60;
    
    let currentSession = null;
    let nextSession = null;
    
    if (hourET >= 4 && hourET < 9.5) {
      currentSession = SESSIONS.PRE_MARKET;
      nextSession = SESSIONS.REGULAR;
    } else if (hourET >= 9.5 && hourET < 16) {
      currentSession = SESSIONS.REGULAR;
      nextSession = SESSIONS.AFTER_MARKET;
    } else if (hourET >= 16 && hourET < 20) {
      currentSession = SESSIONS.AFTER_MARKET;
      nextSession = SESSIONS.PRE_MARKET;
    } else {
      currentSession = SESSIONS.ASIAN; // Market closed
      nextSession = SESSIONS.PRE_MARKET;
    }
    
    return {
      current: currentSession,
      next: nextSession,
      hourET: hourET,
      isMarketOpen: hourET >= 9.5 && hourET < 16
    };
  }

  /**
   * Gap Analysis - compare previous day close to current open
   */
  function analyzeGap(previousClose, currentOpen) {
    if (!previousClose || previousClose === 0) return null;
    
    const gapPoints = currentOpen - previousClose;
    const gapPercent = (gapPoints / previousClose) * 100;
    
    let gapType = 'गैप फ्लैट'; // Flat
    let gapTypeEn = 'Flat Gap';
    
    if (Math.abs(gapPercent) <= 0.1) {
      gapType = 'गैप फ्लैट';
      gapTypeEn = 'Flat Gap';
    } else if (gapPercent > 0.1) {
      gapType = 'ऊपर गैप';
      gapTypeEn = 'Gap Up';
    } else if (gapPercent < -0.1) {
      gapType = 'नीचे गैप';
      gapTypeEn = 'Gap Down';
    }
    
    return {
      points: gapPoints,
      percent: gapPercent,
      type: gapType,
      type_en: gapTypeEn,
      strength: Math.abs(gapPercent)
    };
  }

  /**
   * Opening candle analysis (first 5 minutes)
   */
  function analyzeOpeningCandle(open, high, low, close, volume = 0) {
    const range = high - low;
    const rangePercent = (range / open) * 100;
    const closePos = ((close - low) / range) * 100;
    const bodySize = Math.abs(close - open);
    const upperWick = high - Math.max(open, close);
    const lowerWick = Math.min(open, close) - low;
    
    let pattern = 'तटस्थ';
    let patternEn = 'Neutral';
    
    if (closePos > 70) {
      pattern = 'तेजी';
      patternEn = 'Bullish';
    } else if (closePos < 30) {
      pattern = 'मंदी';
      patternEn = 'Bearish';
    }
    
    if (upperWick > bodySize * 2) {
      pattern += ' (विक्षिप्त)';
      patternEn = patternEn + ' (Whipsaw)';
    }
    
    return {
      open: open,
      high: high,
      low: low,
      close: close,
      range: range,
      rangePercent: rangePercent,
      pattern: pattern,
      pattern_en: patternEn,
      bodySize: bodySize,
      upperWick: upperWick,
      lowerWick: lowerWick,
      closePercent: closePos,
      volume: volume
    };
  }

  /**
   * Market behavior classification
   */
  function classifyMarketBehavior(dayOpen, dayHigh, dayLow, dayClose) {
    const range = dayHigh - dayLow;
    const movement = dayClose - dayOpen;
    const rangePct = (range / dayOpen) * 100;
    
    let behavior = 'विश्लेषण अधूरा'; // Need more data
    let behaviorEn = 'Incomplete Analysis';
    
    if (movement > 0) {
      if (rangePct > 2) {
        behavior = 'एक तरफा तेजी';
        behaviorEn = 'One-Sided Bullish';
      } else {
        behavior = 'मामूली तेजी';
        behaviorEn = 'Slight Bullish';
      }
    } else if (movement < 0) {
      if (rangePct > 2) {
        behavior = 'एक तरफा मंदी';
        behaviorEn = 'One-Sided Bearish';
      } else {
        behavior = 'मामूली मंदी';
        behaviorEn = 'Slight Bearish';
      }
    } else {
      behavior = 'दो तरफा लड़ाई';
      behaviorEn = 'Two-Sided Battle';
    }
    
    return {
      type: behavior,
      type_en: behaviorEn,
      range: range,
      rangePercent: rangePct,
      direction: movement > 0 ? 'UP' : movement < 0 ? 'DOWN' : 'FLAT'
    };
  }

  /**
   * Support/Resistance levels (simplified)
   */
  function calculateLevels(high, low, close) {
    const pivot = (high + low + close) / 3;
    const r1 = (2 * pivot) - low;
    const r2 = pivot + (high - low);
    const s1 = (2 * pivot) - high;
    const s2 = pivot - (high - low);
    
    return {
      pivot: pivot,
      resistance: {
        r1: r1,
        r2: r2,
        strength: 'R1 = मध्यम, R2 = मजबूत'
      },
      support: {
        s1: s1,
        s2: s2,
        strength: 'S1 = मध्यम, S2 = मजबूत'
      }
    };
  }

  /**
   * Intraday timing windows (5-minute intervals throughout session)
   */
  function getIntradayWindows(hourET = 9.5) {
    const windows = [];
    const quality = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'];
    
    // Simplified: First 30 min and last hour are best
    if (hourET >= 9.5 && hourET <= 10) {
      return 'A+'; // Opening hour best quality
    } else if (hourET >= 15 && hourET < 16) {
      return 'A'; // Last hour good quality
    } else if (hourET >= 11 && hourET < 14) {
      return 'B'; // Midday okay
    } else if (hourET >= 14 && hourET < 15) {
      return 'B+'; // Pre-close pickup
    } else {
      return 'C'; // Other times moderate
    }
  }

  /**
   * Market volatility index (simplified VIX proxy)
   */
  function estimateVolatility(range, volume, avgVolume) {
    const rangeRatio = (volume || avgVolume) > 0 ? (volume || avgVolume) / avgVolume : 1;
    const volatility = range * rangeRatio;
    
    let level = 'सामान्य';
    let levelEn = 'Normal';
    
    if (volatility > 2.5) {
      level = 'अत्यधिक';
      levelEn = 'Very High';
    } else if (volatility > 1.5) {
      level = 'उच्च';
      levelEn = 'High';
    } else if (volatility < 0.5) {
      level = 'निम्न';
      levelEn = 'Low';
    }
    
    return {
      level: level,
      level_en: levelEn,
      value: volatility,
      volume_ratio: rangeRatio
    };
  }

  // Public API
  MODULE.NASDAQ_BIRTH = NASDAQ_BIRTH;
  MODULE.SESSIONS = SESSIONS;
  MODULE.utcToNY = utcToNY;
  MODULE.getNYOffset = getNYOffset;
  MODULE.getCurrentSession = getCurrentSession;
  MODULE.analyzeGap = analyzeGap;
  MODULE.analyzeOpeningCandle = analyzeOpeningCandle;
  MODULE.classifyMarketBehavior = classifyMarketBehavior;
  MODULE.calculateLevels = calculateLevels;
  MODULE.getIntradayWindows = getIntradayWindows;
  MODULE.estimateVolatility = estimateVolatility;

  return MODULE;
})();

if (typeof module !== 'undefined') module.exports = MARKET_ENGINE;
if (typeof window !== 'undefined') window.MARKET_ENGINE = MARKET_ENGINE;
