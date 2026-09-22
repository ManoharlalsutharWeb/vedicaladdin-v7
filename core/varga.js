/**
 * ============================================================
 * VedicAladdin V7 — core/varga.js
 * Varga Engine — D1 to D60 Divisional Charts
 * ============================================================
 */

'use strict';

const VARGA = (function() {
  const MODULE = {};

  /**
   * Varga definitions with their multipliers and meanings
   */
  const VARGAS = {
    D1:  { name_hi: 'राशि', name_en: 'Rashi', multiplier: 1, use: 'General Life' },
    D2:  { name_hi: 'होरा', name_en: 'Hora', multiplier: 2, use: 'Wealth, Finance' },
    D3:  { name_hi: 'ढ़्रेक्कणा', name_en: 'Drekkana', multiplier: 3, use: 'Siblings, Valor' },
    D4:  { name_hi: 'चतुर्थांश', name_en: 'Chaturthamsha', multiplier: 4, use: 'Property, Vehicles' },
    D7:  { name_hi: 'सप्तांश', name_en: 'Saptamsha', multiplier: 7, use: 'Children' },
    D9:  { name_hi: 'नवांश', name_en: 'Navamsha', multiplier: 9, use: 'Karma, Fortune' },
    D10: { name_hi: 'दशांश', name_en: 'Dasamsha', multiplier: 10, use: 'Career, Profession' },
    D12: { name_hi: 'द्वादशांश', name_en: 'Dwadashamsha', multiplier: 12, use: 'Parents, Lineage' },
    D16: { name_hi: 'षोड़शांश', name_en: 'Shodashamsha', multiplier: 16, use: 'Vehicles, Comforts' },
    D20: { name_hi: 'विंशांश', name_en: 'Vimshamsha', multiplier: 20, use: 'Spiritual Knowledge' },
    D24: { name_hi: 'चतुर्विंशांश', name_en: 'Chaturvimshamsha', multiplier: 24, use: 'Learning, Education' },
    D27: { name_hi: 'सप्तविंशांश', name_en: 'Saptavimshamsha', multiplier: 27, use: 'Strength, Vitality' },
    D30: { name_hi: 'त्रिंशांश', name_en: 'Trimshamsha', multiplier: 30, use: 'Misfortune, Obstacles' },
    D40: { name_hi: 'खण्डांश', name_en: 'Khandamsha', multiplier: 40, use: 'Suffering, Difficulties' },
    D45: { name_hi: 'चतुःचत्वारिंशांश', name_en: 'Chatusthamsha', multiplier: 45, use: 'Ishta Devta, Spirituality' },
    D60: { name_hi: 'षष्ठ्यांश', name_en: 'Shashtamsha', multiplier: 60, use: 'Perfect Division' }
  };

  /**
   * Rashi names (12 zodiac signs)
   */
  const RASHIS = [
    { index: 0, name_hi: 'मेष', name_en: 'Aries' },
    { index: 1, name_hi: 'वृष', name_en: 'Taurus' },
    { index: 2, name_hi: 'मिथुन', name_en: 'Gemini' },
    { index: 3, name_hi: 'कर्क', name_en: 'Cancer' },
    { index: 4, name_hi: 'सिंह', name_en: 'Leo' },
    { index: 5, name_hi: 'कन्या', name_en: 'Virgo' },
    { index: 6, name_hi: 'तुला', name_en: 'Libra' },
    { index: 7, name_hi: 'वृश्चिक', name_en: 'Scorpio' },
    { index: 8, name_hi: 'धनु', name_en: 'Sagittarius' },
    { index: 9, name_hi: 'मकर', name_en: 'Capricorn' },
    { index: 10, name_hi: 'कुम्भ', name_en: 'Aquarius' },
    { index: 11, name_hi: 'मीन', name_en: 'Pisces' }
  ];

  /**
   * Convert longitude to Rashi (0-11)
   */
  function longitudeToRashi(longitude) {
    return Math.floor(longitude / 30) % 12;
  }

  /**
   * Get exact degrees and minutes within a sign
   */
  function getRashiDetails(longitude) {
    const rashi = longitudeToRashi(longitude);
    const degreesInSign = longitude % 30;
    const degrees = Math.floor(degreesInSign);
    const minutes = Math.floor((degreesInSign - degrees) * 60);
    const seconds = Math.floor(((degreesInSign - degrees) * 60 - minutes) * 60);
    
    return {
      rashi: rashi,
      name_hi: RASHIS[rashi].name_hi,
      name_en: RASHIS[rashi].name_en,
      degrees: degrees,
      minutes: minutes,
      seconds: seconds,
      degreesInSign: degreesInSign,
      displayDMS: `${degrees}°${minutes}'${seconds}"`
    };
  }

  /**
   * Calculate varga position
   * Formula: (Longitude - 1 + Remainder) × Multiplier / 12
   * Simplified: Direct multiplication of zodiac position
   */
  function getVargaPosition(longitude, vargaMultiplier) {
    const rashi = Math.floor(longitude / 30);
    const degreesInSign = longitude % 30;
    
    // Divide the sign into (vargaMultiplier) equal parts
    const partSize = 30 / vargaMultiplier;
    const partIndex = Math.floor(degreesInSign / partSize);
    
    // New rashi in the varga
    const vargaRashi = (rashi * vargaMultiplier + partIndex) % 12;
    const vargaDegrees = ((degreesInSign % partSize) / partSize) * 30;
    const vargaLongitude = vargaRashi * 30 + vargaDegrees;
    
    return getRashiDetails(vargaLongitude);
  }

  /**
   * Calculate all relevant vargas for a planet
   */
  function getPlanetVargas(planetLongitude, primaryVargas = ['D1', 'D2', 'D9', 'D10', 'D27', 'D30', 'D60']) {
    const vargas = {};
    
    vargas.D1 = getRashiDetails(planetLongitude);
    
    primaryVargas.forEach(vargaKey => {
      if (VARGAS[vargaKey]) {
        vargas[vargaKey] = getVargaPosition(planetLongitude, VARGAS[vargaKey].multiplier);
      }
    });
    
    return vargas;
  }

  /**
   * Check if planet is in same rashi in two vargas (alignment)
   */
  function checkVargaAlignment(longitude1, longitude2, vargas = ['D1', 'D9', 'D27']) {
    const alignment = {};
    
    vargas.forEach(vargaKey => {
      const v1 = getVargaPosition(longitude1, VARGAS[vargaKey].multiplier);
      const v2 = getVargaPosition(longitude2, VARGAS[vargaKey].multiplier);
      
      alignment[vargaKey] = {
        same_rashi: v1.rashi === v2.rashi,
        difference: Math.abs(v1.degreesInSign - v2.degreesInSign)
      };
    });
    
    return alignment;
  }

  /**
   * Count planets in each rashi across all vargas (Varga Strength)
   */
  function getVargaStrength(planetPositions, vargaKey = 'D9') {
    const rashiCount = new Array(12).fill(0);
    const rashiPlanets = new Array(12).fill(null).map(() => []);
    
    Object.keys(planetPositions).forEach(planetName => {
      const varga = getVargaPosition(planetPositions[planetName], VARGAS[vargaKey].multiplier);
      rashiCount[varga.rashi]++;
      rashiPlanets[varga.rashi].push(planetName);
    });
    
    return {
      varga: vargaKey,
      rashiCount: rashiCount,
      rashiPlanets: rashiPlanets,
      strongestRashi: rashiCount.indexOf(Math.max(...rashiCount))
    };
  }

  /**
   * Determine varga strength category
   */
  function getVargaStrengthCategory(alignment) {
    const alignmentCount = Object.values(alignment).filter(a => a.same_rashi).length;
    
    if (alignmentCount === 3) return { strength: 'अत्यंत बली', strength_en: 'Very Strong', score: 10 };
    if (alignmentCount === 2) return { strength: 'बली', strength_en: 'Strong', score: 7 };
    if (alignmentCount === 1) return { strength: 'मध्यम', strength_en: 'Moderate', score: 5 };
    return { strength: 'दुर्बल', strength_en: 'Weak', score: 2 };
  }

  /**
   * Get all varga characteristics for quick reference
   */
  function getVargaReference() {
    return VARGAS;
  }

  // Public API
  MODULE.VARGAS = VARGAS;
  MODULE.RASHIS = RASHIS;
  MODULE.longitudeToRashi = longitudeToRashi;
  MODULE.getRashiDetails = getRashiDetails;
  MODULE.getVargaPosition = getVargaPosition;
  MODULE.getPlanetVargas = getPlanetVargas;
  MODULE.checkVargaAlignment = checkVargaAlignment;
  MODULE.getVargaStrength = getVargaStrength;
  MODULE.getVargaStrengthCategory = getVargaStrengthCategory;
  MODULE.getVargaReference = getVargaReference;

  return MODULE;
})();

if (typeof module !== 'undefined') module.exports = VARGA;
if (typeof window !== 'undefined') window.VARGA = VARGA;
