// INSECURE: recursive deepMerge with no __proto__ / constructor filtering (CWE-1321)
// Purpose: demonstrates prototype pollution vulnerability for Fortify SAST/DAST
// Fix: Filter keys like '__proto__', 'constructor', 'prototype' before merging

export function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  for (const key of Object.keys(source)) {
    // INSECURE: no check for __proto__ or constructor keys
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
