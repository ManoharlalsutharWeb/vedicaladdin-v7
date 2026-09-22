/**
 * ============================================================
 * VedicAladdin V7 — core/modules.js
 * Universal Module System (Node.js + Browser)
 * ============================================================
 */

'use strict';

const MODULE_REGISTRY = {};

function defineModule(name, factory) {
  MODULE_REGISTRY[name] = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports[name] = MODULE_REGISTRY[name];
  }
  return MODULE_REGISTRY[name];
}

function getModule(name) {
  if (!MODULE_REGISTRY[name]) {
    throw new Error(`Module not found: ${name}`);
  }
  return MODULE_REGISTRY[name];
}

function requireModule(name) {
  return getModule(name);
}

// Export system
if (typeof module !== 'undefined') {
  module.exports = {
    defineModule,
    getModule,
    requireModule,
    MODULE_REGISTRY
  };
}

if (typeof window !== 'undefined') {
  window.VedicModules = {
    defineModule,
    getModule,
    requireModule,
    MODULE_REGISTRY
  };
}
