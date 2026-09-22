/**
 * ============================================================
 * VedicAladdin V7 — core/vedic-engine.js
 * Main Vedic Calculation Engine
 * Coordinates: Ephemeris + Panchanga + Varga + Dasha
 * ============================================================
 */

'use strict';

const VEDIC_ENGINE = (function() {
  const MODULE = {};

  // Load dependencies (Node.js)
  let EPHEMERIS, PANCHANGA, VARGA, DASHA;
  
  if (typeof require !== 'undefined') {
    try {
      EPHEMERIS = require('./ephemeris');
      PANCHANGA = require('./panchanga');
      VARGA = require('./varga');
      DASHA = require('./dasha');
    } catch (e) {
      console.warn('Some modules not available in this environment');
    }
  }

  /**
   * Complete Vedic analysis for a given date and time
   */
  function analyzeDate(year, month, day, hour = 0, minute = 0, second = 0, timezone = 'UTC') {
    if (!EPHEMERIS) throw new Error('EPHEMERIS module not loaded');
    
    // Convert to UTC if timezone provided
    let utcHour = hour;
    const tzOffsets = {
      'UTC': 0, 'IST': -5.5, 'EST': 5, 'EDT': 4, 'America/New_York': 4
    };
    if (tzOffsets[timezone] !== undefined) {
      utcHour = hour + tzOffsets[timezone];
    }
    
    // Calculate Julian Day
    const jd = EPHEMERIS.dateToJD(year, month, day, utcHour, minute, second);
    
    // Get planet positions
    const planetPositions = EPHEMERIS.getPlanetPositions(jd);
    const sunLong = planetPositions[0];
    const moonLong = planetPositions[1];
    
    // Get Panchanga
    const panchanga = PANCHANGA.getPanchanga(sunLong, moonLong, jd);
    
    // Get Varga positions
    const planetVargas = {
      sun: VARGA.getPlanetVargas(sunLong),
      moon: VARGA.getPlanetVargas(moonLong)
    };
    
    // Get Dasha
    const dasha = DASHA.calculateVimshottari(panchanga.nakshatra);
    const yogini = DASHA.calculateYogini(panchanga.nakshatra.index);
    
    return {
      date: new Date(year, month - 1, day, hour, minute, second),
      jd: jd,
      ayanamsha: EPHEMERIS.getAyanamsha(jd),
      planets: {
        sun: planetPositions[0],
        moon: planetPositions[1],
        mercury: planetPositions[2],
        venus: planetPositions[3],
        mars: planetPositions[4],
        jupiter: planetPositions[5],
        saturn: planetPositions[6],
        rahu: planetPositions[7],
        ketu: planetPositions[8]
      },
      planetDetails: {
        sun: VARGA.getRashiDetails(sunLong),
        moon: VARGA.getRashiDetails(moonLong),
        mercury: VARGA.getRashiDetails(planetPositions[2]),
        venus: VARGA.getRashiDetails(planetPositions[3]),
        mars: VARGA.getRashiDetails(planetPositions[4]),
        jupiter: VARGA.getRashiDetails(planetPositions[5]),
        saturn: VARGA.getRashiDetails(planetPositions[6]),
        rahu: VARGA.getRashiDetails(planetPositions[7]),
        ketu: VARGA.getRashiDetails(planetPositions[8])
      },
      panchanga: panchanga,
      vargas: planetVargas,
      dasha: dasha,
      yogini: yogini,
      summary_hi: `${panchanga.vara.name_hi}, ${panchanga.tithi.name_hi}, ${panchanga.nakshatra.name_hi}`,
      summary_en: `${panchanga.vara.name_en}, ${panchanga.tithi.name_hi}, ${panchanga.nakshatra.name_en}`
    };
  }

  /**
   * Quick analysis (cached)
   */
  function quickAnalyze(year, month, day) {
    return analyzeDate(year, month, day, 12, 0, 0);
  }

  /**
   * Get chart for a date (D1 chart)
   */
  function getChart(year, month, day, hour = 0, minute = 0) {
    const analysis = analyzeDate(year, month, day, hour, minute, 0);
    
    return {
      date: `${day}/${month}/${year} ${hour}:${minute}`,
      chart: analysis.planetDetails,
      nakshatra: analysis.panchanga.nakshatra.name_hi,
      tithi: analysis.panchanga.tithi.name_hi,
      yoga: analysis.panchanga.yoga.name_hi,
      summary: analysis.summary_hi
    };
  }

  /**
   * Compare two dates (useful for transit analysis)
   */
  function compareDates(date1, date2) {
    const analysis1 = analyzeDate(date1.year, date1.month, date1.day);
    const analysis2 = analyzeDate(date2.year, date2.month, date2.day);
    
    const comparison = {};
    
    Object.keys(analysis1.planets).forEach(planet => {
      const long1 = analysis1.planets[planet];
      const long2 = analysis2.planets[planet];
      let diff = long2 - long1;
      
      if (diff < -180) diff += 360;
      if (diff > 180) diff -= 360;
      
      comparison[planet] = {
        long1: long1,
        long2: long2,
        difference: diff,
        retrograde: diff < 0
      };
    });
    
    return {
      date1: analysis1.date,
      date2: analysis2.date,
      comparison: comparison
    };
  }

  /**
   * Get retrograde planets for a date
   */
  function getRetrogradePlanets(year, month, day) {
    // Simplified retrograde check based on planetary periods
    const retrogrades = {
      mercury: { period: 27, retrograde_days: 21 },
      venus: { period: 584, retrograde_days: 42 },
      mars: { period: 780, retrograde_days: 70 },
      jupiter: { period: 398.88, retrograde_days: 120 },
      saturn: { period: 10765, retrograde_days: 140 }
    };
    
    const jd = EPHEMERIS.dateToJD(year, month, day);
    const retroPlanets = [];
    
    Object.keys(retrogrades).forEach(planet => {
      // Simplified calculation
      const cycle = retrogrades[planet].period;
      const retroPeriod = retrogrades[planet].retrograde_days;
      const position = (jd % cycle) / cycle;
      
      if (position > 0.4 && position < 0.65) {
        retroPlanets.push({
          planet: planet,
          isRetrograde: true,
          strength: Math.sin((position - 0.4) * Math.PI / 0.25)
        });
      }
    });
    
    return retroPlanets;
  }

  /**
   * Get Muhurta (auspicious timing) score for a datetime
   * Returns 0-100 score
   */
  function getMuhurtaScore(year, month, day, hour, minute) {
    const analysis = analyzeDate(year, month, day, hour, minute);
    let score = 50; // Base score
    
    // Tithi adjustment (some tithis are inauspicious)
    const inauspiciousTithis = [8, 14, 23, 29]; // Ashtami, Chaturdashi, Amavasya, etc.
    if (!inauspiciousTithis.includes(analysis.panchanga.tithi.index)) {
      score += 10;
    }
    
    // Nakshatra adjustment
    if (analysis.panchanga.nakshatra.index % 2 === 0) {
      score += 5; // Even nakshatras slightly better
    }
    
    // Yoga adjustment (Sarvartha Siddhi is best)
    if (analysis.panchanga.yoga.index === 27) {
      score += 20;
    }
    
    // Varana (day) adjustment
    const goodDays = [1, 3, 4, 5]; // Mon, Wed, Thu, Fri
    if (goodDays.includes(analysis.panchanga.vara.index)) {
      score += 5;
    }
    
    // Hora adjustment
    const hora = Math.floor((hour + minute / 60) * 24) % 24;
    if (hora >= 6 && hora <= 18) {
      score += 5; // Daytime is generally better
    }
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get list of auspicious dates for next N days
   */
  function getAuspiciousDates(startYear, startMonth, startDay, days = 30) {
    const auspiciousDates = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startYear, startMonth - 1, startDay);
      date.setDate(date.getDate() + i);
      
      const muhurtaScore = getMuhurtaScore(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        12, 0
      );
      
      if (muhurtaScore > 60) {
        auspiciousDates.push({
          date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
          score: muhurtaScore,
          analysis: quickAnalyze(
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
          )
        });
      }
    }
    
    return auspiciousDates.sort((a, b) => b.score - a.score);
  }

  // Public API
  MODULE.analyzeDate = analyzeDate;
  MODULE.quickAnalyze = quickAnalyze;
  MODULE.getChart = getChart;
  MODULE.compareDates = compareDates;
  MODULE.getRetrogradePlanets = getRetrogradePlanets;
  MODULE.getMuhurtaScore = getMuhurtaScore;
  MODULE.getAuspiciousDates = getAuspiciousDates;

  return MODULE;
})();

if (typeof module !== 'undefined') module.exports = VEDIC_ENGINE;
if (typeof window !== 'undefined') window.VEDIC_ENGINE = VEDIC_ENGINE;
