// performanceMonitoring.js - Tools for monitoring app performance
import { InteractionManager } from 'react-native';

// Performance measurement cache
const measurements = new Map();
const interactionMeasurements = new Map();
const memorySnapshots = [];

// Maximum memory snapshots to keep (to avoid memory leaks)
const MAX_MEMORY_SNAPSHOTS = 20;

/**
 * Start measuring a performance event
 * 
 * @param {string} name - The name of the event to measure
 * @returns {void}
 */
export const startMeasure = (name) => {
  if (!__DEV__) return; // Only measure in development
  
  measurements.set(name, {
    startTime: Date.now(),
    name,
  });
};

/**
 * End measuring a performance event and log the result
 * 
 * @param {string} name - The name of the event to end measurement for
 * @param {boolean} logResult - Whether to log the result to console
 * @returns {number|null} - The duration of the measurement in ms, or null if not found
 */
export const endMeasure = (name, logResult = true) => {
  if (!__DEV__) return null;
  
  const measurement = measurements.get(name);
  if (!measurement) {
    console.warn(`No measurement found for: ${name}`);
    return null;
  }
  
  const endTime = Date.now();
  const duration = endTime - measurement.startTime;
  
  // Log result if requested
  if (logResult) {
    console.log(`[PERF] ${name}: ${duration}ms`);
  }
  
  // Clean up measurement
  measurements.delete(name);
  
  return duration;
};

/**
 * Measure a function's execution time
 * 
 * @param {Function} fn - The function to measure
 * @param {string} name - The name of the measurement
 * @returns {any} - The result of the function
 */
export const measureFunction = (fn, name) => {
  if (!__DEV__) return fn();
  
  startMeasure(name);
  const result = fn();
  
  // For promises, measure when they resolve
  if (result instanceof Promise) {
    return result.finally(() => {
      endMeasure(name);
    });
  }
  
  endMeasure(name);
  return result;
};

/**
 * Measure an async function's execution time
 * 
 * @param {Function} asyncFn - The async function to measure
 * @param {string} name - The name of the measurement
 * @returns {Promise<any>} - The result of the async function
 */
export const measureAsync = async (asyncFn, name) => {
  if (!__DEV__) return asyncFn();
  
  startMeasure(name);
  try {
    const result = await asyncFn();
    return result;
  } finally {
    endMeasure(name);
  }
};

/**
 * Measure a render interaction (from mount to first paint)
 * 
 * @param {string} componentName - The name of the component being rendered
 * @returns {Function} - A function to call when rendering is complete
 */
export const measureRender = (componentName) => {
  if (!__DEV__) return () => {};
  
  const interactionId = `render_${componentName}_${Date.now()}`;
  interactionMeasurements.set(interactionId, {
    startTime: Date.now(),
    name: componentName,
  });
  
  return () => {
    const measurement = interactionMeasurements.get(interactionId);
    if (!measurement) return;
    
    const endTime = Date.now();
    const duration = endTime - measurement.startTime;
    
    console.log(`[RENDER] ${componentName}: ${duration}ms`);
    interactionMeasurements.delete(interactionId);
  };
};

/**
 * Take a memory usage snapshot
 * 
 * @param {string} label - A label for the memory snapshot
 * @returns {object|null} - The memory snapshot data or null if not supported
 */
export const takeMemorySnapshot = (label) => {
  if (!__DEV__) return null;
  
  try {
    let memoryInfo = null;
    
    // Try to get memory info from standard performance API
    if (global.performance && global.performance.memory) {
      memoryInfo = {
        totalJSHeapSize: global.performance.memory.totalJSHeapSize,
        usedJSHeapSize: global.performance.memory.usedJSHeapSize,
        jsHeapSizeLimit: global.performance.memory.jsHeapSizeLimit,
      };
    } 
    // Try to get memory info from Hermes
    else if (global.HermesInternal && global.HermesInternal.getHeapInfo) {
      const hermesHeapInfo = global.HermesInternal.getHeapInfo();
      memoryInfo = {
        allocatedBytes: hermesHeapInfo.allocatedBytes,
        freeBytes: hermesHeapInfo.freeBytes,
        totalSize: hermesHeapInfo.totalSize,
      };
    }
    
    if (memoryInfo) {
      const snapshot = {
        timestamp: Date.now(),
        label,
        memory: memoryInfo,
      };
      
      // Add to snapshots, maintaining maximum size
      memorySnapshots.push(snapshot);
      if (memorySnapshots.length > MAX_MEMORY_SNAPSHOTS) {
        memorySnapshots.shift();
      }
      
      console.log(`[MEMORY] ${label}:`, memoryInfo);
      return snapshot;
    }
    
    return null;
  } catch (error) {
    console.error('Error taking memory snapshot:', error);
    return null;
  }
};

/**
 * Get all memory snapshots
 * 
 * @returns {Array} - All collected memory snapshots
 */
export const getMemorySnapshots = () => {
  return [...memorySnapshots];
};

/**
 * Monitor JS thread frame rate
 * 
 * @param {number} duration - How long to monitor in ms
 * @param {Function} callback - Callback with results
 * @returns {void}
 */
export const monitorFrameRate = (duration = 3000, callback) => {
  if (!__DEV__) return;
  
  let frameCount = 0;
  let lastFrameTime = Date.now();
  const frameRates = [];
  const startTime = Date.now();
  
  const measureFrame = () => {
    const now = Date.now();
    frameCount++;
    
    // Calculate instantaneous fps
    const delta = now - lastFrameTime;
    if (delta > 0) {
      const fps = Math.round(1000 / delta);
      frameRates.push(fps);
    }
    
    lastFrameTime = now;
    
    // Continue measuring if duration not exceeded
    if (now - startTime < duration) {
      requestAnimationFrame(measureFrame);
    } else {
      // Calculate average FPS
      const totalFrames = frameRates.length;
      const avgFps = totalFrames > 0 
        ? Math.round(frameRates.reduce((sum, fps) => sum + fps, 0) / totalFrames) 
        : 0;
        
      console.log(`[FPS] Average: ${avgFps} FPS over ${duration}ms`);
      
      if (callback) {
        callback({
          averageFps: avgFps,
          frameRates,
          duration,
          frameCount,
        });
      }
    }
  };
  
  requestAnimationFrame(measureFrame);
};

/**
 * Run a function after all UI interactions complete, with timeout
 * 
 * @param {Function} fn - Function to run
 * @param {number} timeout - Maximum time to wait in ms
 * @returns {Promise<any>} - Result of function
 */
export const runAfterInteractions = (fn, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    // Set timeout to ensure fn runs even if interactions never complete
    const timeoutId = setTimeout(() => {
      console.warn(`Interaction timeout after ${timeout}ms`);
      try {
        const result = fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, timeout);
    
    // Run after interactions complete
    InteractionManager.runAfterInteractions(() => {
      clearTimeout(timeoutId);
      try {
        const result = fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
};

/**
 * Create a performance monitoring HOC for React components
 * 
 * @param {React.Component} Component - The component to wrap
 * @param {string} name - Name for the performance monitoring
 * @returns {React.Component} - Wrapped component with performance monitoring
 */
export const withPerformanceMonitoring = (Component, name = Component.displayName || Component.name) => {
  if (!__DEV__) return Component;
  
  return function PerformanceMonitoredComponent(props) {
    const renderComplete = measureRender(name);
    
    // Take memory snapshot before render
    takeMemorySnapshot(`${name}_before_render`);
    
    // Capture render time
    startMeasure(`${name}_render`);
    const result = Component(props);
    endMeasure(`${name}_render`);
    
    // Signal when component has been painted
    InteractionManager.runAfterInteractions(() => {
      renderComplete();
      takeMemorySnapshot(`${name}_after_paint`);
    });
    
    return result;
  };
};