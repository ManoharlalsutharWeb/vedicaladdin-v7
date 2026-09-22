# 🔱 वैदिक अलादीन V7 

## दुनिया का पहला पूर्ण ऑफलाइन NASDAQ ज्योतिष बुद्धिमत्ता प्रणाली
### World's First Complete Offline NASDAQ Vedic Intelligence System

---

## ✨ नई विशेषताएं (V7.0)

### ✅ पूर्ण ऑफलाइन समर्थन
- **Zero Internet Required** — सब कुछ ऑफलाइन काम करता है
- **Self-Contained** — कोई बाहरी API dependency नहीं
- **Embedded Data** — 1900-2050 की सभी गणना में शामिल
- **Browser-First** — HTML5 app, कहीं भी चलता है

### ✅ सभी टूटे हुए features Fixed
- Ephemeris (ग्रह स्थिति) — 100% सटीक
- Panchanga (पंचांग) — सभी 5 elements
- Nakshatras (27) — सही नामकरण
- Vargas (D1-D60) — सभी charts
- Dashas — Vimshottari + Yogini
- NQ Market Analysis — Session management
- Consensus Engine — Vedic + Market merge

### ✅ Hindi/Devanagari Only Interface
- पूर्ण हिंदी UI
- सभी नाम हिंदी में
- भारतीय समय (IST)
- NY timezone automatic (EST/EDT/DST)

### ✅ Browser + Server दोनों
- **Browser Mode**: कोई server की जरूरत नहीं
- **Server Mode**: Node.js server (optional optimization)
- **Hybrid**: Online/offline dynamic switching

---

## 📦 Installation Guide

### विकल्प 1: Browser में सीधा चलाएं (कोई Setup नहीं)
```bash
# बस ui/index.html को अपने browser में खोलें
# या
python -m http.server 8000
# फिर http://localhost:8000/ui/index.html खोलें
```

### विकल्प 2: Node.js के साथ (Optional)
```bash
# Dependencies install करें (ज़रूरी नहीं)
npm install

# Core modules load करें
node -e "require('./core/ephemeris'); require('./core/panchanga'); console.log('✅ Ready');"

# Tests run करें
npm test

# Server शुरू करें (optional)
npm start
```

### विकल्प 3: Docker में
```bash
docker build -t vedicaladdin-v7 .
docker run -p 3000:3000 vedicaladdin-v7
```

---

## 🎯 Core Modules

### 📍 `/core/ephemeris.js`
**ग्रहों की सटीक स्थिति (1900-2050)**

```javascript
const EPHEMERIS = require('./core/ephemeris');

// किसी भी तारीख़ के लिए Julian Day
const jd = EPHEMERIS.dateToJD(2026, 9, 22, 12, 0, 0);

// सभी 9 ग्रहों की स्थिति
const positions = EPHEMERIS.getPlanetPositions(jd);

// Ayanamsha (सायन संशोधन)
const ayanamsha = EPHEMERIS.getAyanamsha(jd);

// राशि विवरण
const rashi = EPHEMERIS.degreeToRashi(30);
// Output: { rashi: 1, name_hi: 'वृष', degrees: 0, ... }
```

### 📅 `/core/panchanga.js`
**पंचांग — दिन के 5 तत्व**

```javascript
const PANCHANGA = require('./core/panchanga');

// 27 Nakshatras (नक्षत्र)
const nak = PANCHANGA.calculateNakshatra(45); // Moon longitude

// 30 Tithis (तिथि)
const tithi = PANCHANGA.calculateTithi(10, 180); // Sun-Moon diff

// 27 Yogas (योग)
const yoga = PANCHANGA.calculateYoga(10, 180);

// 7 Days (वार)
const vara = PANCHANGA.calculateVara(jd);

// पूरा Panchanga एक साथ
const panchanga = PANCHANGA.getPanchanga(sunLong, moonLong, jd);
```

### 🔢 `/core/varga.js`
**Divisional Charts (D1-D60)**

```javascript
const VARGA = require('./core/varga');

// किसी भी varga में ग्रह की स्थिति
const navamsha = VARGA.getVargaPosition(longitude, 9); // D9 = 9x division

// Multiple vargas एक साथ
const vargas = VARGA.getPlanetVargas(longitude, ['D1', 'D2', 'D9', 'D27', 'D60']);

// Varga alignment check
const alignment = VARGA.checkVargaAlignment(long1, long2, ['D1', 'D9', 'D27']);
```

### ⏱️ `/core/dasha.js`
**Dasha System (Vimshottari + Yogini)**

```javascript
const DASHA = require('./core/dasha');

// Vimshottari Dasha (120 साल)
const vimshottari = DASHA.calculateVimshottari(
  { index: 3, percent: 45 }, // Moon's nakshatra
  birthDate
);

// Yogini Dasha (36 साल)
const yogini = DASHA.calculateYogini(nakshatraIndex, currentDate);

// Sub-dasha (Bhukti)
const bhukti = DASHA.getSubDasha(mainLord, mainYears);

// Current dasha period
const current = DASHA.getCurrentDasha(dashaSequence, birthDate);
```

### 🔮 `/core/vedic-engine.js`
**मास्टर Vedic Engine — सब कुछ एक साथ**

```javascript
const VEDIC_ENGINE = require('./core/vedic-engine');

// किसी भी तारीख़ का पूरा analysis
const analysis = VEDIC_ENGINE.analyzeDate(2026, 9, 22, 12, 0, 0, 'IST');

// Output:
// {
//   date: Date,
//   jd: 2451234.5,
//   ayanamsha: 23.16,
//   planets: { sun, moon, mercury, ... },
//   planetDetails: { sun: { rashi, degrees, ... }, ... },
//   panchanga: { tithi, nakshatra, yoga, ... },
//   vargas: { d1, d2, d9, ... },
//   dasha: { sequence: [...] },
//   yogini: { sequence: [...] },
//   summary_hi: "सोमवार, प्रतिपदा, अश्विनी नक्षत्र, विष्कुम्भ योग"
// }

// Quick analysis (कोई sub-दिन नहीं)
const quick = VEDIC_ENGINE.quickAnalyze(2026, 9, 22);

// Muhurta (मुहूर्त) स्कोर
const muhurta = VEDIC_ENGINE.getMuhurtaScore(2026, 9, 22, 12, 0);
// Returns: 0-100 score

// आने वाले शुभ दिन
const auspicious = VEDIC_ENGINE.getAuspiciousDates(2026, 9, 22, 30); // अगले 30 दिन
```

### 📈 `/market/market-engine.js`
**Market Analysis (NQ-specific)**

```javascript
const MARKET_ENGINE = require('./market/market-engine');

// NY timezone conversion (automatic EST/EDT)
const nyDate = MARKET_ENGINE.utcToNY(new Date());

// Current session
const session = MARKET_ENGINE.getCurrentSession();
// { current: { name_hi: "नियमित सत्र" }, isMarketOpen: true }

// Gap analysis
const gap = MARKET_ENGINE.analyzeGap(previousClose, currentOpen);
// { points, percent, type, strength }

// Opening candle (first 5 min)
const candle = MARKET_ENGINE.analyzeOpeningCandle(open, high, low, close);
// { range, pattern, bodySize, upperWick, ... }

// Market behavior classification
const behavior = MARKET_ENGINE.classifyMarketBehavior(open, high, low, close);
// { type: "एक तरफा तेजी", direction: "UP" }

// Volatility estimate
const vol = MARKET_ENGINE.estimateVolatility(range, volume, avgVolume);
// { level: "उच्च", value: 2.1 }

// Support/Resistance
const levels = MARKET_ENGINE.calculateLevels(high, low, close);
// { pivot, r1, r2, s1, s2 }
```

### 🔀 `/core/consensus-engine.js`
**Vedic + Market Consensus**

```javascript
const CONSENSUS_ENGINE = require('./core/consensus-engine');

// Vedic signal score
const vScore = CONSENSUS_ENGINE.scoreVedicSignal(vedicAnalysis);
// 0-100

// Market signal score
const mScore = CONSENSUS_ENGINE.scoreMarketSignal(marketData);
// 0-100

// Merged consensus
const consensus = CONSENSUS_ENGINE.buildConsensus(vedicAnalysis, marketData);
// {
//   consensusScore: 72,
//   direction: "तेजी (मजबूत)",
//   layers: { vedic, market, historical },
//   agreement: { vedicMarket, confidence }
// }

// Detailed report
const report = CONSENSUS_ENGINE.generateDetailedReport(consensus, vedicAnalysis);

// HTML report
const html = CONSENSUS_ENGINE.generateHTMLReport(consensus, vedicAnalysis);
```

---

## 🧪 Testing

### सभी Tests चलाएं:
```bash
npm test
```

### Test Coverage:
- ✅ **Ephemeris**: Julian Day, Ayanamsha, Planetary positions
- ✅ **Panchanga**: Tithi, Nakshatra, Yoga, Karana, Vara
- ✅ **Varga**: D1-D60 calculations, Varga alignment
- ✅ **Dasha**: Vimshottari, Yogini, Sub-dasha
- ✅ **Vedic Engine**: Complete analysis workflow
- ✅ **Market Engine**: Session, Gap, Candles, Behavior
- ✅ **Consensus**: Signal merging, Scoring

### Known Date Validation:
```
📊 2000-03-10 (डॉट-कॉम पीक)    ← Bearish prediction
📊 2008-09-15 (लेहमैन क्रैश)    ← Strong Bearish prediction
📊 2020-03-23 (COVID तल)        ← Bullish reversal
```

---

## 📁 File Structure

```
vedicaladdin-v7/
├── core/                        ← वैदिक कोर
│   ├── modules.js              (मॉड्यूल सिस्टम)
│   ├── ephemeris.js            (ग्रह स्थिति)
│   ├── panchanga.js            (पंचांग)
│   ├── varga.js                (विभाजन चार्ट)
│   ├── dasha.js                (दशा)
│   ├── vedic-engine.js         (मास्टर इंजन)
│   └── consensus-engine.js     (सहमति)
├── market/
│   └── market-engine.js        (NQ विश्लेषण)
├── ui/
│   └── index.html              (मुख्य interface)
├── server/
│   └── index.js                (Express server - optional)
├── tests/
│   └── test.js                 (परीक्षा सूट)
├── docs/
│   └── ARCHITECTURE.md         (System design)
├── package.json                (Node.js config)
└── README.md                   (यह फाइल)
```

---

## 🌐 API Usage

### Browser से:
```html
<script src="core/modules.js"></script>
<script src="core/ephemeris.js"></script>
<script src="core/panchanga.js"></script>
<script src="core/vedic-engine.js"></script>

<script>
  const analysis = VEDIC_ENGINE.analyzeDate(2026, 9, 22, 12, 0, 0);
  console.log(analysis);
</script>
```

### Node.js से:
```javascript
const VEDIC_ENGINE = require('./core/vedic-engine');
const MARKET_ENGINE = require('./market/market-engine');
const CONSENSUS_ENGINE = require('./core/consensus-engine');

const analysis = VEDIC_ENGINE.analyzeDate(2026, 9, 22, 12, 0, 0);
const consensus = CONSENSUS_ENGINE.buildConsensus(analysis);
console.log(consensus);
```

---

## 🚀 Deployment

### Option 1: Standalone HTML
```bash
# कहीं भी खोलें
open ui/index.html
```

### Option 2: Local Server
```bash
npm start
# localhost:3000 पर खुलेगा
```

### Option 3: Docker
```bash
docker build -t vedicaladdin-v7 .
docker run -p 3000:3000 vedicaladdin-v7
```

### Option 4: GitHub Pages
```bash
cp -r ui/* docs/
git add docs/
git commit -m "Deploy V7"
git push
# https://username.github.io/vedicaladdin
```

---

## ⚙️ Configuration

### Timezone Settings
```javascript
// Default: IST (भारतीय समय)
VEDIC_ENGINE.analyzeDate(2026, 9, 22, 12, 0, 0, 'IST');

// NY Timezone (automatic EST/EDT)
MARKET_ENGINE.utcToNY(new Date());
```

### Ayanamsha
```javascript
// Default: Lahiri (लाहिरी)
// 23°11'2023.79" at 2000 Jan 1.5
// Rate: 50.24 arcseconds/year
```

### Data Range
```javascript
// Ephemeris: 1900-2050
// Panchanga: Complete
// Market: NQ since 1971
```

---

## 📊 Example Workflows

### Complete Daily Analysis
```javascript
const date = new Date();
const analysis = VEDIC_ENGINE.analyzeDate(
  date.getFullYear(),
  date.getMonth() + 1,
  date.getDate(),
  date.getHours(),
  date.getMinutes()
);

const marketData = {
  gap: MARKET_ENGINE.analyzeGap(previousClose, currentOpen),
  opening: MARKET_ENGINE.analyzeOpeningCandle(o, h, l, c),
  behavior: MARKET_ENGINE.classifyMarketBehavior(o, h, l, c)
};

const consensus = CONSENSUS_ENGINE.buildConsensus(analysis, marketData);
console.log(consensus.direction); // "तेजी (मजबूत)" या "मंदी (कमजोर)"
```

### Find Auspicious Dates
```javascript
const dates = VEDIC_ENGINE.getAuspiciousDates(2026, 9, 22, 30);
// अगले 30 दिनों में शुभ तारीखें
dates.forEach(d => {
  console.log(`${d.date}: Score ${d.score}`);
});
```

### Dasha Periods
```javascript
const analysis = VEDIC_ENGINE.analyzeDate(2026, 9, 22, 12, 0, 0);
const dasha = analysis.dasha;
dasha.sequence.forEach(period => {
  console.log(`${period.lord_hi}: ${period.years} साल`);
});
```

---

## ⚠️ Disclaimer (अस्वीकरण)

यह प्रणाली **शुद्ध वैदिक ज्योतिषीय गणना** पर आधारित है।

⚠️ **यह कोई निश्चित निवेश सलाह या भविष्यवाणी नहीं है।**

✅ **वाणिज्यिक निर्णय लेने से पहले पेशेवर सलाह लें।**

**बाजार जोखिमों के अधीन है। अपने विवेक से निर्णय लें।**

---

## 🤝 Contributing

Issues और PRs स्वागत हैं!

```bash
git clone https://github.com/vedicaladdin/v7.git
cd vedicaladdin-v7
npm install
npm test
```

---

## 📝 License

MIT License — Commercial use allowed with attribution

---

## 🔱 About

**VedicAladdin** — Vedic Astrology meets Modern Technology

- 📖 Classical Vedic texts + Modern algorithms
- 🌍 Global NQ market + Indian time system
- 💻 Offline-first + Browser native
- 🎓 Educational + Professional

---

## 📞 Support

- 📧 GitHub Issues
- 🌐 Website: vedicaladdin.com
- 📱 Hindi Interface: 100% Devanagari

---

## 🔱 ॐ नमः शिवाय — माता चामुंडा को प्रणाम 🔱

**VedicAladdin V7.0** | Schema: 7.0 | © 2026 | All Rights Reserved

*दुनिया का पहला पूर्ण ऑफलाइन NASDAQ ज्योतिष बुद्धिमत्ता प्रणाली*
