/**
 * ============================================================
 * VedicAladdin V7 — core/dasha.js
 * Dasha Engine — Vimshottari & Yogini Dasha
 * ============================================================
 */

'use strict';

const DASHA = (function() {
  const MODULE = {};

  /**
   * Vimshottari Dasha - 120 years cycle
   * Starts from Ketu (if Moon in Ashwini) = 7 years
   */
  const VIMSHOTTARI_SEQUENCE = [
    { lord_hi: 'केतु', lord_en: 'Ketu', years: 7 },
    { lord_hi: 'शुक्र', lord_en: 'Venus', years: 20 },
    { lord_hi: 'सूर्य', lord_en: 'Sun', years: 6 },
    { lord_hi: 'चन्द्र', lord_en: 'Moon', years: 10 },
    { lord_hi: 'मंगल', lord_en: 'Mars', years: 7 },
    { lord_hi: 'राहु', lord_en: 'Rahu', years: 18 },
    { lord_hi: 'बृहस्पति', lord_en: 'Jupiter', years: 16 },
    { lord_hi: 'शनि', lord_en: 'Saturn', years: 19 },
    { lord_hi: 'बुध', lord_en: 'Mercury', years: 17 }
  ];

  const TOTAL_VIMSHOTTARI_YEARS = 120;

  /**
   * Yogini Dasha - 36 years cycle
   * Starts from specific nakshatra
   */
  const YOGINI_SEQUENCE = [
    { name_hi: 'मंदगा', name_en: 'Mandaga', years: 1 },
    { name_hi: 'पिङ्गला', name_en: 'Pingala', years: 2 },
    { name_hi: 'धन्या', name_en: 'Dhanya', years: 3 },
    { name_hi: 'शीघ्रा', name_en: 'Shighra', years: 4 },
    { name_hi: 'रक्ता', name_en: 'Rakta', years: 5 },
    { name_hi: 'मल्लिका', name_en: 'Mallika', years: 6 },
    { name_hi: 'चण्डा', name_en: 'Chanda', years: 7 },
    { name_hi: 'भ्रामरी', name_en: 'Bramari', years: 8 }
  ];

  const TOTAL_YOGINI_YEARS = 36;

  /**
   * Nakshatra to Vimshottari lord mapping
   */
  function getNakshatraLord(nakshatraIndex) {
    const lords = [
      'केतु', 'केतु', 'केतु', 'शुक्र', 'शुक्र', 'शुक्र', 'सूर्य', 'सूर्य', 'सूर्य',
      'चन्द्र', 'चन्द्र', 'चन्द्र', 'मंगल', 'मंगल', 'मंगल', 'राहु', 'राहु', 'राहु',
      'बृहस्पति', 'बृहस्पति', 'बृहस्पति', 'शनि', 'शनि', 'शनि', 'बुध', 'बुध', 'बुध'
    ];
    return lords[nakshatraIndex % 27];
  }

  /**
   * Calculate Vimshottari Dasha from Moon's Nakshatra
   * Moon's position in nakshatra determines starting point and remaining dasha
   */
  function calculateVimshottari(moonNakshatra, birthDate, currentDate = null) {
    const now = currentDate || new Date();
    
    // Determine starting Dasha Lord
    const startLordIndex = getNakshatraLord(moonNakshatra.index) === 'केतु' ? 0 :
                          getNakshatraLord(moonNakshatra.index) === 'शुक्र' ? 1 :
                          getNakshatraLord(moonNakshatra.index) === 'सूर्य' ? 2 :
                          getNakshatraLord(moonNakshatra.index) === 'चन्द्र' ? 3 :
                          getNakshatraLord(moonNakshatra.index) === 'मंगल' ? 4 :
                          getNakshatraLord(moonNakshatra.index) === 'राहु' ? 5 :
                          getNakshatraLord(moonNakshatra.index) === 'बृहस्पति' ? 6 :
                          getNakshatraLord(moonNakshatra.index) === 'शनि' ? 7 : 8;
    
    // Calculate remaining dasha years (simplified)
    const remainingPercentage = moonNakshatra.percent;
    const lordYears = VIMSHOTTARI_SEQUENCE[startLordIndex].years;
    const remainingYears = (remainingPercentage / 100) * lordYears;
    
    // Build dasha sequence
    const dashaSequence = [];
    let totalYears = 0;
    let currentIndex = startLordIndex;
    
    for (let i = 0; i < 9; i++) {
      let yearsForThisPeriod = VIMSHOTTARI_SEQUENCE[currentIndex].years;
      
      if (i === 0) {
        yearsForThisPeriod = remainingYears;
      }
      
      dashaSequence.push({
        sequence: i,
        lord_hi: VIMSHOTTARI_SEQUENCE[currentIndex].lord_hi,
        lord_en: VIMSHOTTARI_SEQUENCE[currentIndex].lord_en,
        years: yearsForThisPeriod,
        startYear: totalYears,
        endYear: totalYears + yearsForThisPeriod,
        isActive: false
      });
      
      totalYears += yearsForThisPeriod;
      currentIndex = (currentIndex + 1) % 9;
    }
    
    return {
      type: 'Vimshottari',
      sequence: dashaSequence,
      totalCycle: TOTAL_VIMSHOTTARI_YEARS,
      moonNakshatra: moonNakshatra.index,
      moonNakshatraName: moonNakshatra.name_hi
    };
  }

  /**
   * Calculate Yogini Dasha from Nakshatra
   */
  function calculateYogini(nakshatraIndex, currentDate = null) {
    const now = currentDate || new Date();
    
    // Yogini Dasha starts from Mandaga for Ashwini, Bharani, Krittika
    // Each nakshatra group (3 nakshatras) = 1 yogini
    const yoginiIndex = Math.floor(nakshatraIndex / 3);
    
    const yoginiSequence = [];
    let totalYears = 0;
    
    for (let i = 0; i < 8; i++) {
      const currentYogini = (yoginiIndex + i) % 8;
      yoginiSequence.push({
        sequence: i,
        name_hi: YOGINI_SEQUENCE[currentYogini].name_hi,
        name_en: YOGINI_SEQUENCE[currentYogini].name_en,
        years: YOGINI_SEQUENCE[currentYogini].years,
        startYear: totalYears,
        endYear: totalYears + YOGINI_SEQUENCE[currentYogini].years,
        isActive: false
      });
      
      totalYears += YOGINI_SEQUENCE[currentYogini].years;
    }
    
    return {
      type: 'Yogini',
      sequence: yoginiSequence,
      totalCycle: TOTAL_YOGINI_YEARS,
      nakshatraGroup: yoginiIndex
    };
  }

  /**
   * Get sub-dasha (Bhukti) periods for a main dasha
   */
  function getSubDasha(mainDashaLord, mainDashaYears) {
    const subSequence = [];
    let totalYears = 0;
    
    VIMSHOTTARI_SEQUENCE.forEach(dasha => {
      const ratio = dasha.years / TOTAL_VIMSHOTTARI_YEARS;
      const subYears = mainDashaYears * ratio;
      
      subSequence.push({
        lord_hi: dasha.lord_hi,
        lord_en: dasha.lord_en,
        years: subYears,
        months: subYears * 12,
        days: subYears * 365.25,
        startYear: totalYears,
        endYear: totalYears + subYears
      });
      
      totalYears += subYears;
    });
    
    return subSequence;
  }

  /**
   * Get Pratyantar Dasha (sub-sub-dasha) for more precise predictions
   */
  function getPratyantarDasha(subDashaLord, subDashaYears) {
    // Pratyantar dasha = sub-dasha divided by 9 planets
    const pratyantarSequence = [];
    let totalDays = 0;
    
    VIMSHOTTARI_SEQUENCE.forEach(dasha => {
      const ratio = dasha.years / TOTAL_VIMSHOTTARI_YEARS;
      const pratyantarDays = subDashaYears * 365.25 * ratio;
      
      pratyantarSequence.push({
        lord_hi: dasha.lord_hi,
        lord_en: dasha.lord_en,
        days: pratyantarDays,
        months: pratyantarDays / 30.44,
        startDay: totalDays,
        endDay: totalDays + pratyantarDays
      });
      
      totalDays += pratyantarDays;
    });
    
    return pratyantarSequence;
  }

  /**
   * Determine current Dasha period
   */
  function getCurrentDasha(dashaSequence, birthDate, currentDate = null) {
    const now = currentDate || new Date();
    
    // Calculate total days since birth
    const diffTime = now - birthDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const diffYears = diffDays / 365.25;
    
    let currentDasha = null;
    
    dashaSequence.forEach(dasha => {
      const startYear = dasha.startYear || 0;
      const endYear = dasha.endYear || dasha.startYear + dasha.years;
      
      if (diffYears >= startYear && diffYears < endYear) {
        currentDasha = {
          ...dasha,
          isActive: true,
          remainingYears: endYear - diffYears,
          elapsedYears: diffYears - startYear,
          elapsedPercent: ((diffYears - startYear) / dasha.years) * 100
        };
      }
    });
    
    return currentDasha;
  }

  /**
   * Get Dasha lord characteristics
   */
  function getDashaCharacteristics(lordName) {
    const characteristics = {
      'केतु': { nature: 'Spiritual', color_hi: 'धूसर', element: 'Ether' },
      'शुक्र': { nature: 'Materialistic', color_hi: 'सफ़ेद', element: 'Water' },
      'सूर्य': { nature: 'Authoritative', color_hi: 'सुनहरा', element: 'Fire' },
      'चन्द्र': { nature: 'Emotional', color_hi: 'सफ़ेद', element: 'Water' },
      'मंगल': { nature: 'Aggressive', color_hi: 'लाल', element: 'Fire' },
      'राहु': { nature: 'Deceptive', color_hi: 'काला', element: 'Ether' },
      'बृहस्पति': { nature: 'Benevolent', color_hi: 'पीला', element: 'Fire' },
      'शनि': { nature: 'Restrictive', color_hi: 'नीला', element: 'Earth' },
      'बुध': { nature: 'Intellectual', color_hi: 'हरा', element: 'Earth' }
    };
    
    return characteristics[lordName] || null;
  }

  // Public API
  MODULE.VIMSHOTTARI_SEQUENCE = VIMSHOTTARI_SEQUENCE;
  MODULE.YOGINI_SEQUENCE = YOGINI_SEQUENCE;
  MODULE.calculateVimshottari = calculateVimshottari;
  MODULE.calculateYogini = calculateYogini;
  MODULE.getSubDasha = getSubDasha;
  MODULE.getPratyantarDasha = getPratyantarDasha;
  MODULE.getCurrentDasha = getCurrentDasha;
  MODULE.getDashaCharacteristics = getDashaCharacteristics;
  MODULE.getNakshatraLord = getNakshatraLord;

  return MODULE;
})();

if (typeof module !== 'undefined') module.exports = DASHA;
if (typeof window !== 'undefined') window.DASHA = DASHA;
