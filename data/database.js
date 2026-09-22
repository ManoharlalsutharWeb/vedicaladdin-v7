/**
 * ============================================================
 * VedicAladdin V7 — data/database.js
 * Storage Layer — IndexedDB (Browser) + FileSystem (Node.js)
 * ============================================================
 */

'use strict';

const DATABASE = (function() {
  const MODULE = {};
  
  let dbInstance = null;
  let isNode = false;
  let fs = null;
  
  // Detect environment
  if (typeof require !== 'undefined') {
    try {
      fs = require('fs');
      isNode = true;
    } catch (e) {
      isNode = false;
    }
  }

  // ============================================================
  // BROWSER: IndexedDB
  // ============================================================

  function initIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = window.indexedDB.open('VedicAladdinV7', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(dbInstance);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('analyses')) {
          db.createObjectStore('analyses', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('charts')) {
          db.createObjectStore('charts', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('muhurta')) {
          db.createObjectStore('muhurta', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('market')) {
          db.createObjectStore('market', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // ============================================================
  // NODE.JS: FileSystem
  // ============================================================

  const dataDir = isNode ? require('path').join(__dirname, '../.data') : null;

  function ensureDataDir() {
    if (!isNode || !fs) return;
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  function getFilePath(collection) {
    return isNode ? require('path').join(dataDir, `${collection}.json`) : null;
  }

  // ============================================================
  // UNIVERSAL API
  // ============================================================

  /**
   * Save an analysis
   */
  async function saveAnalysis(data) {
    const record = {
      timestamp: new Date().toISOString(),
      date: data.date || new Date(),
      type: data.type || 'analysis',
      data: data
    };

    if (typeof window !== 'undefined' && window.indexedDB) {
      // Browser
      const db = dbInstance || await initIndexedDB();
      const tx = db.transaction(['analyses'], 'readwrite');
      const store = tx.objectStore('analyses');
      return new Promise((resolve, reject) => {
        const request = store.add(record);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } else if (isNode && fs) {
      // Node.js
      ensureDataDir();
      const filePath = getFilePath('analyses');
      let existing = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      existing.push(record);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
      return existing.length;
    }
  }

  /**
   * Get all analyses
   */
  async function getAllAnalyses() {
    if (typeof window !== 'undefined' && window.indexedDB) {
      // Browser
      const db = dbInstance || await initIndexedDB();
      const tx = db.transaction(['analyses'], 'readonly');
      const store = tx.objectStore('analyses');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } else if (isNode && fs) {
      // Node.js
      const filePath = getFilePath('analyses');
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      return [];
    }
  }

  /**
   * Save market data
   */
  async function saveMarketData(date, data) {
    const record = {
      timestamp: new Date().toISOString(),
      date: date,
      data: data
    };

    if (typeof window !== 'undefined' && window.indexedDB) {
      const db = dbInstance || await initIndexedDB();
      const tx = db.transaction(['market'], 'readwrite');
      const store = tx.objectStore('market');
      return new Promise((resolve, reject) => {
        const request = store.add(record);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } else if (isNode && fs) {
      ensureDataDir();
      const filePath = getFilePath('market');
      let existing = [];
      if (fs.existsSync(filePath)) {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      existing.push(record);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
      return existing.length;
    }
  }

  /**
   * Get market data for a date
   */
  async function getMarketData(date) {
    if (typeof window !== 'undefined' && window.indexedDB) {
      const db = dbInstance || await initIndexedDB();
      const tx = db.transaction(['market'], 'readonly');
      const store = tx.objectStore('market');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const data = request.result.find(r => r.date === date);
          resolve(data || null);
        };
        request.onerror = () => reject(request.error);
      });
    } else if (isNode && fs) {
      const filePath = getFilePath('market');
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return data.find(r => r.date === date) || null;
      }
      return null;
    }
  }

  /**
   * Clear all data
   */
  async function clearDatabase() {
    if (typeof window !== 'undefined' && window.indexedDB) {
      const db = dbInstance || await initIndexedDB();
      const stores = ['analyses', 'charts', 'muhurta', 'market'];
      
      for (const store of stores) {
        const tx = db.transaction([store], 'readwrite');
        const objectStore = tx.objectStore(store);
        objectStore.clear();
      }
    } else if (isNode && fs) {
      const collections = ['analyses', 'charts', 'muhurta', 'market'];
      collections.forEach(collection => {
        const filePath = getFilePath(collection);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  }

  /**
   * Get database statistics
   */
  async function getStats() {
    if (typeof window !== 'undefined' && window.indexedDB) {
      const db = dbInstance || await initIndexedDB();
      const stores = ['analyses', 'charts', 'muhurta', 'market'];
      const stats = {};

      for (const store of stores) {
        const tx = db.transaction([store], 'readonly');
        const objectStore = tx.objectStore(store);
        stats[store] = await new Promise((resolve, reject) => {
          const request = objectStore.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }

      return {
        type: 'IndexedDB',
        environment: 'Browser',
        stores: stats,
        timestamp: new Date().toISOString()
      };
    } else if (isNode && fs) {
      const stats = {};
      const collections = ['analyses', 'charts', 'muhurta', 'market'];
      
      collections.forEach(collection => {
        const filePath = getFilePath(collection);
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          stats[collection] = data.length;
        } else {
          stats[collection] = 0;
        }
      });

      return {
        type: 'FileSystem',
        environment: 'Node.js',
        directory: dataDir,
        stores: stats,
        timestamp: new Date().toISOString()
      };
    }

    return {
      type: 'None',
      environment: 'Unknown',
      error: 'No storage available'
    };
  }

  /**
   * Export all data
   */
  async function exportData() {
    const analyses = await getAllAnalyses();
    const market = await getMarketData(new Date().toISOString().split('T')[0]);
    
    return {
      version: '7.0.0',
      exportDate: new Date().toISOString(),
      data: {
        analyses: analyses,
        market: market
      }
    };
  }

  /**
   * Import data
   */
  async function importData(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (data.data && data.data.analyses) {
        for (const analysis of data.data.analyses) {
          await saveAnalysis(analysis.data);
        }
      }
      
      return { success: true, imported: data.data.analyses.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Public API
  MODULE.saveAnalysis = saveAnalysis;
  MODULE.getAllAnalyses = getAllAnalyses;
  MODULE.saveMarketData = saveMarketData;
  MODULE.getMarketData = getMarketData;
  MODULE.clearDatabase = clearDatabase;
  MODULE.getStats = getStats;
  MODULE.exportData = exportData;
  MODULE.importData = importData;
  MODULE.initIndexedDB = initIndexedDB;
  MODULE.isNode = isNode;
  MODULE.isBrowser = typeof window !== 'undefined' && window.indexedDB;

  return MODULE;
})();

if (typeof module !== 'undefined') module.exports = DATABASE;
if (typeof window !== 'undefined') window.DATABASE = DATABASE;
