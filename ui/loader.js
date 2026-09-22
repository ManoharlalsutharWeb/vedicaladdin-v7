/**
 * ============================================================
 * VedicAladdin V7 — ui/loader.js
 * Automatic Module Loader for Browser
 * ============================================================
 */

'use strict';

const VEDIC_LOADER = (function() {
  const MODULE = {};
  const loaded = {};
  const failed = [];

  /**
   * Load script dynamically
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Load all modules in order
   */
  async function loadAllModules() {
    const modules = [
      { name: 'ephemeris', path: '../core/ephemeris.js' },
      { name: 'panchanga', path: '../core/panchanga.js' },
      { name: 'varga', path: '../core/varga.js' },
      { name: 'dasha', path: '../core/dasha.js' },
      { name: 'vedic-engine', path: '../core/vedic-engine.js' },
      { name: 'market-engine', path: '../market/market-engine.js' },
      { name: 'consensus-engine', path: '../core/consensus-engine.js' },
      { name: 'database', path: '../data/database.js' }
    ];

    console.log('\n🔱 वैदिक अलादीन V7 — Module Loading\n');

    for (const module of modules) {
      try {
        await loadScript(module.path);
        loaded[module.name] = true;
        
        // Verify module is actually loaded
        const globalName = module.name.toUpperCase().replace(/-/g, '_');
        if (typeof window[globalName] !== 'undefined' || module.name === 'database') {
          console.log(`✅ ${module.name}`);
        } else {
          throw new Error(`Module didn't expose global: ${globalName}`);
        }
      } catch (error) {
        failed.push(module.name);
        console.error(`❌ ${module.name}: ${error.message}`);
      }
    }

    console.log(`\n📊 Loaded: ${Object.keys(loaded).length}/${modules.length}\n`);

    if (failed.length > 0) {
      console.warn(`⚠️ Failed modules: ${failed.join(', ')}`);
    }

    return {
      success: failed.length === 0,
      loaded: loaded,
      failed: failed
    };
  }

  /**
   * Check if all modules are loaded
   */
  function isReady() {
    return (
      typeof EPHEMERIS !== 'undefined' &&
      typeof PANCHANGA !== 'undefined' &&
      typeof VARGA !== 'undefined' &&
      typeof DASHA !== 'undefined' &&
      typeof VEDIC_ENGINE !== 'undefined' &&
      typeof MARKET_ENGINE !== 'undefined' &&
      typeof CONSENSUS_ENGINE !== 'undefined' &&
      typeof DATABASE !== 'undefined'
    );
  }

  /**
   * Get module statistics
   */
  function getStats() {
    return {
      ephemeris: typeof EPHEMERIS !== 'undefined',
      panchanga: typeof PANCHANGA !== 'undefined',
      varga: typeof VARGA !== 'undefined',
      dasha: typeof DASHA !== 'undefined',
      vedic_engine: typeof VEDIC_ENGINE !== 'undefined',
      market_engine: typeof MARKET_ENGINE !== 'undefined',
      consensus_engine: typeof CONSENSUS_ENGINE !== 'undefined',
      database: typeof DATABASE !== 'undefined'
    };
  }

  /**
   * Wait for modules to be ready
   */
  function waitUntilReady(timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (isReady()) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Module loading timeout'));
        } else {
          setTimeout(check, 100);
        }
      };
      
      check();
    });
  }

  MODULE.loadAllModules = loadAllModules;
  MODULE.isReady = isReady;
  MODULE.getStats = getStats;
  MODULE.waitUntilReady = waitUntilReady;
  MODULE.loaded = loaded;
  MODULE.failed = failed;

  return MODULE;
})();

// Auto-load on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await VEDIC_LOADER.loadAllModules();
  });
} else {
  // Already loaded
  (async () => {
    await VEDIC_LOADER.loadAllModules();
  })();
}
