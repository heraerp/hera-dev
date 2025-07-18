/**
 * HERA Universal ERP - Mobile Optimization Index
 * Export all mobile optimization services for the scanner ecosystem
 */

export { performanceMonitor } from './performance-monitor';
export { adaptiveQualityManager } from './adaptive-quality-manager';

// Types and interfaces
export type {
  PerformanceMetrics,
  PerformanceAlert,
  DeviceCapabilities
} from './performance-monitor';

export type {
  QualitySettings,
  QualityProfile,
  AdaptationRule
} from './adaptive-quality-manager';

// Utility functions for mobile optimization
export function initializeMobileOptimization(): Promise<void> {
  return new Promise(async (resolve) => {
    console.log('📱 HERA: Initializing mobile optimization...');
    
    // Start performance monitoring
    const { performanceMonitor } = await import('./performance-monitor');
    performanceMonitor.startMonitoring();
    
    // Initialize adaptive quality management
    const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
    await adaptiveQualityManager.initializeForDevice();
    
    console.log('✅ HERA: Mobile optimization initialized');
    resolve();
  });
}

export function getOptimizationStatus(): {
  performance_monitoring: boolean;
  adaptive_quality: boolean;
  device_score: number;
  performance_score: number;
} {
  const { performanceMonitor } = require('./performance-monitor');
  const { adaptiveQualityManager } = require('./adaptive-quality-manager');
  
  const capabilities = performanceMonitor.getDeviceCapabilities();
  const deviceScore = capabilities ? adaptiveQualityManager.calculateDeviceScore(capabilities) : 0;
  
  return {
    performance_monitoring: performanceMonitor.isMonitoring,
    adaptive_quality: adaptiveQualityManager.isAdaptationActive(),
    device_score: deviceScore,
    performance_score: performanceMonitor.getPerformanceScore()
  };
}

export function generateOptimizationReport(): string {
  const { performanceMonitor } = require('./performance-monitor');
  const { adaptiveQualityManager } = require('./adaptive-quality-manager');
  
  const perfReport = performanceMonitor.generatePerformanceReport();
  const qualityReport = adaptiveQualityManager.generateQualityReport();
  
  return `${perfReport}\n\n${qualityReport}`;
}

// Auto-optimization utility
export async function autoOptimize(): Promise<void> {
  const { performanceMonitor } = await import('./performance-monitor');
  const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
  
  const metrics = performanceMonitor.getMetrics();
  const capabilities = performanceMonitor.getDeviceCapabilities();
  
  if (!capabilities) {
    console.warn('📱 HERA: Cannot auto-optimize without device capabilities');
    return;
  }
  
  // Apply optimization based on current conditions
  if (capabilities.battery.level < 0.3) {
    adaptiveQualityManager.setBatteryOptimized();
  } else if (metrics.ui.animation_fps < 20 || metrics.camera.processing_latency > 1000) {
    adaptiveQualityManager.setPerformanceOptimized();
  } else if (capabilities.network.effective_type === '2g' || capabilities.network.effective_type === 'slow-2g') {
    adaptiveQualityManager.setNetworkOptimized();
  }
  
  console.log('📱 HERA: Auto-optimization applied');
}

// Quick optimization presets
export async function setBatteryMode(): Promise<void> {
  const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
  adaptiveQualityManager.setBatteryOptimized();
}

export async function setPerformanceMode(): Promise<void> {
  const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
  adaptiveQualityManager.setPerformanceOptimized();
}

export async function setNetworkMode(): Promise<void> {
  const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
  adaptiveQualityManager.setNetworkOptimized();
}

// Performance monitoring utilities
export async function startPerformanceMonitoring(): Promise<void> {
  const { performanceMonitor } = await import('./performance-monitor');
  performanceMonitor.startMonitoring();
}

export async function stopPerformanceMonitoring(): Promise<void> {
  const { performanceMonitor } = await import('./performance-monitor');
  performanceMonitor.stopMonitoring();
}

export async function getPerformanceAlerts(): Promise<PerformanceAlert[]> {
  const { performanceMonitor } = await import('./performance-monitor');
  return performanceMonitor.getAlerts();
}

export async function clearPerformanceAlerts(): Promise<void> {
  const { performanceMonitor } = await import('./performance-monitor');
  performanceMonitor.clearAlerts();
}

// Quality management utilities
export async function enableAdaptiveQuality(): Promise<void> {
  const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
  adaptiveQualityManager.enableAdaptation();
}

export async function disableAdaptiveQuality(): Promise<void> {
  const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
  adaptiveQualityManager.disableAdaptation();
}

export async function getCurrentQualitySettings(): Promise<QualitySettings> {
  const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
  return adaptiveQualityManager.getCurrentSettings();
}

export async function setQualityProfile(profileId: string): Promise<void> {
  const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
  adaptiveQualityManager.setProfile(profileId);
}

// Device detection utilities
export async function detectDeviceCapabilities(): Promise<DeviceCapabilities | null> {
  const { performanceMonitor } = await import('./performance-monitor');
  return performanceMonitor.detectDeviceCapabilities();
}

export async function calculateDeviceScore(): Promise<number> {
  const { performanceMonitor } = await import('./performance-monitor');
  const { adaptiveQualityManager } = await import('./adaptive-quality-manager');
  
  const capabilities = await performanceMonitor.detectDeviceCapabilities();
  return capabilities ? adaptiveQualityManager.calculateDeviceScore(capabilities) : 0;
}

// React hook utilities for mobile optimization
export function useMobileOptimization() {
  // This would be implemented as a React hook
  return {
    initializeMobileOptimization,
    getOptimizationStatus,
    autoOptimize,
    setBatteryMode,
    setPerformanceMode,
    setNetworkMode
  };
}

// Export the main optimization services
export { performanceMonitor as default } from './performance-monitor';