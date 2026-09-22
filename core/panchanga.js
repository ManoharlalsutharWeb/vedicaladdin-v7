/**
 * ============================================================
 * VedicAladdin V7 — core/panchanga.js
 * Panchanga Engine — 5 elements: Tithi, Nakshatra, Yoga, Karana, Vara
 * ============================================================
 */

'use strict';

const PANCHANGA = (function() {
  const MODULE = {};

  // Nakshatras (27)
  const NAKSHATRAS = [
    { index: 0, name_hi: 'अश्विनी', name_en: 'Ashwini', lord: 'केतु', deity: 'अश्विनी कुमार' },
    { index: 1, name_hi: 'भरणी', name_en: 'Bharani', lord: 'शुक्र', deity: 'यम' },
    { index: 2, name_hi: 'कृत्तिका', name_en: 'Krittika', lord: 'सूर्य', deity: 'अग्नि' },
    { index: 3, name_hi: 'रोहिणी', name_en: 'Rohini', lord: 'चन्द्र', deity: 'ब्रह्मा' },
    { index: 4, name_hi: 'मृगशिरा', name_en: 'Mrigashira', lord: 'मंगल', deity: 'सोम' },
    { index: 5, name_hi: 'आर्द्रा', name_en: 'Ardra', lord: 'राहु', deity: 'रुद्र' },
    { index: 6, name_hi: 'पुनर्वसु', name_en: 'Punarvasu', lord: 'बुध', deity: 'अदिति' },
    { index: 7, name_hi: 'पुष्य', name_en: 'Pushya', lord: 'शनि', deity: 'बृहस्पति' },
    { index: 8, name_hi: 'आश्लेष', name_en: 'Aslesha', lord: 'बुध', deity: 'सर्प' },
    { index: 9, name_hi: 'मघा', name_en: 'Magha', lord: 'केतु', deity: 'पितृ' },
    { index: 10, name_hi: 'पूर्वाफाल्गुनी', name_en: 'Purva Phalguni', lord: 'शुक्र', deity: 'अग्नि' },
    { index: 11, name_hi: 'उत्तराफाल्गुनी', name_en: 'Uttara Phalguni', lord: 'सूर्य', deity: 'अर्यमन' },
    { index: 12, name_hi: 'हस्त', name_en: 'Hasta', lord: 'चन्द्र', deity: 'सवितृ' },
    { index: 13, name_hi: 'चित्रा', name_en: 'Chitra', lord: 'मंगल', deity: 'त्वष्टृ' },
    { index: 14, name_hi: 'स्वाती', name_en: 'Swati', lord: 'राहु', deity: 'वायु' },
    { index: 15, name_hi: 'विशाखा', name_en: 'Vishakha', lord: 'बुध', deity: 'इंद्र-अग्नि' },
    { index: 16, name_hi: 'अनुराधा', name_en: 'Anuradha', lord: 'शनि', deity: 'मित्र' },
    { index: 17, name_hi: 'ज्येष्ठा', name_en: 'Jyeshta', lord: 'बुध', deity: 'इंद्र' },
    { index: 18, name_hi: 'मूल', name_en: 'Mula', lord: 'केतु', deity: 'निरृति' },
    { index: 19, name_hi: 'पूर्वाषाढ़', name_en: 'Purva Ashadha', lord: 'शुक्र', deity: 'अप:' },
    { index: 20, name_hi: 'उत्तरषाढ़', name_en: 'Uttara Ashadha', lord: 'सूर्य', deity: 'विश्वदेव' },
    { index: 21, name_hi: 'श्रवण', name_en: 'Shravan', lord: 'चन्द्र', deity: 'विष्णु' },
    { index: 22, name_hi: 'धनिष्ठा', name_en: 'Dhanishta', lord: 'मंगल', deity: 'वसु' },
    { index: 23, name_hi: 'शतभिषा', name_en: 'Shatabhisha', lord: 'राहु', deity: 'वरुण' },
    { index: 24, name_hi: 'पूर्वाभाद्रपद', name_en: 'Purva Bhadrapada', lord: 'बुध', deity: 'अज एकपाद' },
    { index: 25, name_hi: 'उत्तरभाद्रपद', name_en: 'Uttara Bhadrapada', lord: 'शनि', deity: 'अहिर्बुध्न्य' },
    { index: 26, name_hi: 'रेवती', name_en: 'Revati', lord: 'बुध', deity: 'पूषा' }
  ];

  // Tithis (30 lunar days)
  const TITHIS = [
    'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
    'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा', 'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी',
    'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'अमावस्या'
  ];

  // Yogas (27)
  const YOGAS = [
    'विष्कुम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्म', 'धृति', 'शूल', 'गण्ड',
    'वृद्धि', 'ध्रुव', 'व्यघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव',
    'सिद्ध', 'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इंद्र', 'वैधृति'
  ];

  // Karanas (8, repeating 60 times in lunar month)
  const KARANAS = [
    'बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि', 'शकुनि'
  ];

  // Varas (7 days of week)
  const VARAS = [
    { index: 0, name_hi: 'रविवार', name_en: 'Sunday', lord: 'सूर्य' },
    { index: 1, name_hi: 'सोमवार', name_en: 'Monday', lord: 'चन्द्र' },
    { index: 2, name_hi: 'मंगलवार', name_en: 'Tuesday', lord: 'मंगल' },
    { index: 3, name_hi: 'बुधवार', name_en: 'Wednesday', lord: 'बुध' },
    { index: 4, name_hi: 'गुरुवार', name_en: 'Thursday', lord: 'बृहस्पति' },
    { index: 5, name_hi: 'शुक्रवार', name_en: 'Friday', lord: 'शुक्र' },
    { index: 6, name_hi: 'शनिवार', name_en: 'Saturday', lord: 'शनि' }
  ];

  /**
   * Calculate Tithi (lunar day) from Sun-Moon longitude difference
   * Each tithi = 12 degrees of Sun-Moon separation
   */
  function calculateTithi(sunLong, moonLong) {
    let diff = moonLong - sunLong;
    if (diff < 0) diff += 360;
    
    const tithi = Math.floor(diff / 12);
    const tithiPercent = ((diff % 12) / 12) * 100;
    
    return {
      index: tithi,
      name_hi: TITHIS[tithi],
      percent: tithiPercent,
      isWaxing: tithi < 15
    };
  }

  /**
   * Calculate Nakshatra from Moon's longitude
   * Each nakshatra = 13.33 degrees (800 minutes of arc)
   */
  function calculateNakshatra(moonLong) {
    const nakIndex = Math.floor(moonLong / 13.33333);
    const nakPercent = ((moonLong % 13.33333) / 13.33333) * 100;
    
    return {
      index: nakIndex,
      name_hi: NAKSHATRAS[nakIndex].name_hi,
      name_en: NAKSHATRAS[nakIndex].name_en,
      lord: NAKSHATRAS[nakIndex].lord,
      deity: NAKSHATRAS[nakIndex].deity,
      percent: nakPercent
    };
  }

  /**
   * Calculate Yoga from Sun + Moon longitude
   * Each yoga = 13.33 degrees of combined longitude
   */
  function calculateYoga(sunLong, moonLong) {
    const sum = (sunLong + moonLong) % 360;
    const yogaIndex = Math.floor(sum / 13.33333);
    const yogaPercent = ((sum % 13.33333) / 13.33333) * 100;
    
    return {
      index: yogaIndex,
      name_hi: YOGAS[yogaIndex],
      percent: yogaPercent
    };
  }

  /**
   * Calculate Karana from Tithi index
   * Each tithi has 2 karanas (except last tithi of dark half which has 1)
   */
  function calculateKarana(tithi) {
    const kIndex = (tithi * 2) % KARANAS.length;
    return {
      name: KARANAS[kIndex],
      index: kIndex
    };
  }

  /**
   * Calculate Vara (day of week) from Julian Day Number
   */
  function calculateVara(jd) {
    const dayOfWeek = Math.floor((jd + 1.5) % 7);
    const vara = VARAS[dayOfWeek];
    return vara;
  }

  /**
   * Complete Panchanga calculation
   */
  function getPanchanga(sunLong, moonLong, jd) {
    const tithi = calculateTithi(sunLong, moonLong);
    const nakshatra = calculateNakshatra(moonLong);
    const yoga = calculateYoga(sunLong, moonLong);
    const karana = calculateKarana(tithi.index);
    const vara = calculateVara(jd);
    
    return {
      tithi,
      nakshatra,
      yoga,
      karana,
      vara,
      summary_hi: `${vara.name_hi}, ${tithi.name_hi}, ${nakshatra.name_hi} नक्षत्र, ${yoga.name_hi} योग`,
      summary_en: `${vara.name_en}, ${tithi.name_hi}, ${nakshatra.name_en} Nakshatra, ${yoga.name_hi} Yoga`
    };
  }

  /**
   * Check if a nakshatra is auspicious for specific work
   */
  function isNakshatraAuspicious(nakIndex, workType) {
    // Simplified rules (can be expanded)
    const auspicious = {
      'travel': [1, 2, 4, 6, 11, 13, 16, 18, 20, 21, 23, 26],
      'business': [2, 3, 4, 6, 10, 13, 14, 16, 18, 20, 22, 26],
      'marriage': [1, 2, 4, 6, 10, 13, 14, 18, 20, 22, 26],
      'learning': [2, 3, 5, 6, 13, 15, 16, 20, 26]
    };
    
    if (!auspicious[workType]) return null;
    return auspicious[workType].includes(nakIndex);
  }

  /**
   * Get lunar month name
   */
  function getLunarMonth(tithi, vara) {
    const months_hi = [
      'चैत्र', 'वैशाख', 'ज्येष्ठ', 'आषाढ़', 'श्रावण', 'भाद्रपद',
      'आश्विन', 'कार्तिक', 'मार्गशीर्ष', 'पौष', 'माघ', 'फाल्गुन'
    ];
    
    // Simplified calculation based on tithi
    const month = Math.floor(tithi / 2.5);
    return {
      index: month,
      name_hi: months_hi[month % 12]
    };
  }

  MODULE.NAKSHATRAS = NAKSHATRAS;
  MODULE.TITHIS = TITHIS;
  MODULE.YOGAS = YOGAS;
  MODULE.KARANAS = KARANAS;
  MODULE.VARAS = VARAS;
  MODULE.calculateTithi = calculateTithi;
  MODULE.calculateNakshatra = calculateNakshatra;
  MODULE.calculateYoga = calculateYoga;
  MODULE.calculateKarana = calculateKarana;
  MODULE.calculateVara = calculateVara;
  MODULE.getPanchanga = getPanchanga;
  MODULE.isNakshatraAuspicious = isNakshatraAuspicious;
  MODULE.getLunarMonth = getLunarMonth;

  return MODULE;
})();

if (typeof module !== 'undefined') module.exports = PANCHANGA;
if (typeof window !== 'undefined') window.PANCHANGA = PANCHANGA;
