/**
 * HERA Universal ERP - Adaptive Quality Manager
 * Intelligent quality adjustment for optimal mobile performance
 */

import { performanceMonitor, DeviceCapabilities, PerformanceMetrics } from './performance-monitor';

// ==================== TYPES ====================

export interface QualitySettings {
  camera: {
    resolution: 'ultra' | 'high' | 'medium' | 'low';
    frame_rate: number;
    auto_focus: boolean;
    torch_enabled: boolean;
    image_compression: number; // 0.1 to 1.0
  };
  ai: {
    model_size: 'full' | 'medium' | 'lite' | 'micro';
    inference_frequency: number; // Hz
    batch_processing: boolean;
    use_web_worker: boolean;
    confidence_threshold: number;
  };
  ui: {
    animation_level: 'full' | 'reduced' | 'minimal' | 'none';
    render_quality: 'high' | 'medium' | 'low';
    blur_effects: boolean;
    particle_effects: boolean;
    haptic_feedback: boolean;
  };
  network: {
    batch_size: number;
    compression_level: number; // 0-9
    retry_attempts: number;
    timeout_ms: number;
    prefetch_enabled: boolean;
  };
  storage: {
    cache_size_mb: number;
    compression_enabled: boolean;
    auto_cleanup: boolean;
    preload_models: boolean;
  };
}

export interface QualityProfile {
  id: string;
  name: string;
  description: string;
  settings: QualitySettings;
  min_device_score: number;
  target_performance: Partial<PerformanceMetrics>;
}

export interface AdaptationRule {
  id: string;
  condition: (metrics: PerformanceMetrics, capabilities: DeviceCapabilities) => boolean;
  action: (currentSettings: QualitySettings) => Partial<QualitySettings>;
  priority: number;
  cooldown_ms: number;
  description: string;
}

// ==================== QUALITY PROFILES ====================

const QUALITY_PROFILES: QualityProfile[] = [
  {
    id: 'ultra_performance',
    name: 'Ultra Performance',
    description: 'Maximum quality for high-end devices',
    min_device_score: 90,
    settings: {
      camera: {
        resolution: 'ultra',
        frame_rate: 60,
        auto_focus: true,
        torch_enabled: true,
        image_compression: 1.0
      },
      ai: {
        model_size: 'full',
        inference_frequency: 10,
        batch_processing: true,
        use_web_worker: true,
        confidence_threshold: 0.85
      },
      ui: {
        animation_level: 'full',
        render_quality: 'high',
        blur_effects: true,
        particle_effects: true,
        haptic_feedback: true
      },
      network: {
        batch_size: 10,
        compression_level: 3,
        retry_attempts: 3,
        timeout_ms: 5000,
        prefetch_enabled: true
      },
      storage: {
        cache_size_mb: 100,
        compression_enabled: false,
        auto_cleanup: false,
        preload_models: true
      }
    },
    target_performance: {
      camera: { frame_rate: 60, processing_latency: 200 },
      ai: { inference_time: 1000, accuracy: 0.95 },
      ui: { animation_fps: 60, interaction_latency: 50 }
    }
  },
  {
    id: 'high_performance',
    name: 'High Performance',
    description: 'Balanced quality for modern devices',
    min_device_score: 70,
    settings: {
      camera: {
        resolution: 'high',
        frame_rate: 30,
        auto_focus: true,
        torch_enabled: true,
        image_compression: 0.9
      },
      ai: {
        model_size: 'medium',
        inference_frequency: 5,
        batch_processing: true,
        use_web_worker: true,
        confidence_threshold: 0.8
      },
      ui: {
        animation_level: 'full',
        render_quality: 'medium',
        blur_effects: true,
        particle_effects: false,
        haptic_feedback: true
      },
      network: {
        batch_size: 5,
        compression_level: 5,
        retry_attempts: 3,
        timeout_ms: 3000,
        prefetch_enabled: true
      },
      storage: {
        cache_size_mb: 50,
        compression_enabled: true,
        auto_cleanup: true,
        preload_models: true
      }
    },
    target_performance: {
      camera: { frame_rate: 30, processing_latency: 500 },
      ai: { inference_time: 1500, accuracy: 0.9 },
      ui: { animation_fps: 30, interaction_latency: 100 }
    }
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Optimized for mid-range devices',
    min_device_score: 50,
    settings: {
      camera: {
        resolution: 'medium',
        frame_rate: 24,
        auto_focus: false,
        torch_enabled: false,
        image_compression: 0.8
      },
      ai: {
        model_size: 'lite',
        inference_frequency: 3,
        batch_processing: false,
        use_web_worker: true,
        confidence_threshold: 0.75
      },
      ui: {
        animation_level: 'reduced',
        render_quality: 'medium',
        blur_effects: false,
        particle_effects: false,
        haptic_feedback: false
      },
      network: {
        batch_size: 3,
        compression_level: 7,
        retry_attempts: 2,
        timeout_ms: 5000,
        prefetch_enabled: false
      },
      storage: {
        cache_size_mb: 25,
        compression_enabled: true,
        auto_cleanup: true,
        preload_models: false
      }
    },
    target_performance: {
      camera: { frame_rate: 24, processing_latency: 1000 },
      ai: { inference_time: 2000, accuracy: 0.85 },
      ui: { animation_fps: 24, interaction_latency: 150 }
    }
  },
  {
    id: 'power_saver',
    name: 'Power Saver',
    description: 'Minimal resource usage for low-end devices',
    min_device_score: 0,
    settings: {
      camera: {
        resolution: 'low',
        frame_rate: 15,
        auto_focus: false,
        torch_enabled: false,
        image_compression: 0.6
      },
      ai: {
        model_size: 'micro',
        inference_frequency: 1,
        batch_processing: false,
        use_web_worker: false,
        confidence_threshold: 0.7
      },
      ui: {
        animation_level: 'minimal',
        render_quality: 'low',
        blur_effects: false,
        particle_effects: false,
        haptic_feedback: false
      },
      network: {
        batch_size: 1,
        compression_level: 9,
        retry_attempts: 1,
        timeout_ms: 10000,
        prefetch_enabled: false
      },
      storage: {
        cache_size_mb: 10,
        compression_enabled: true,
        auto_cleanup: true,
        preload_models: false
      }
    },
    target_performance: {
      camera: { frame_rate: 15, processing_latency: 2000 },
      ai: { inference_time: 3000, accuracy: 0.8 },
      ui: { animation_fps: 15, interaction_latency: 300 }
    }
  }
];

// ==================== ADAPTATION RULES ====================

const ADAPTATION_RULES: AdaptationRule[] = [
  {
    id: 'reduce_camera_quality_high_latency',
    priority: 1,
    cooldown_ms: 5000,
    description: 'Reduce camera quality when processing latency is high',
    condition: (metrics) => metrics.camera.processing_latency > 1000,
    action: (settings) => ({
      camera: {
        ...settings.camera,
        resolution: settings.camera.resolution === 'ultra' ? 'high' :
                   settings.camera.resolution === 'high' ? 'medium' :
                   settings.camera.resolution === 'medium' ? 'low' : 'low',
        frame_rate: Math.max(15, settings.camera.frame_rate - 5)
      }
    })
  },
  {
    id: 'reduce_ai_frequency_slow_inference',
    priority: 2,
    cooldown_ms: 3000,
    description: 'Reduce AI inference frequency when processing is slow',
    condition: (metrics) => metrics.ai.inference_time > 2000,
    action: (settings) => ({
      ai: {
        ...settings.ai,
        inference_frequency: Math.max(1, settings.ai.inference_frequency - 1),
        model_size: settings.ai.model_size === 'full' ? 'medium' :
                   settings.ai.model_size === 'medium' ? 'lite' :
                   settings.ai.model_size === 'lite' ? 'micro' : 'micro'
      }
    })
  },
  {
    id: 'disable_effects_low_fps',
    priority: 3,
    cooldown_ms: 2000,
    description: 'Disable UI effects when animation FPS is low',
    condition: (metrics) => metrics.ui.animation_fps < 20,
    action: (settings) => ({
      ui: {
        ...settings.ui,
        animation_level: 'minimal',
        blur_effects: false,
        particle_effects: false
      }
    })
  },
  {
    id: 'increase_compression_slow_network',
    priority: 4,
    cooldown_ms: 10000,
    description: 'Increase compression on slow networks',
    condition: (metrics, capabilities) => 
      capabilities.network.effective_type === 'slow-2g' || 
      capabilities.network.effective_type === '2g' ||
      metrics.network.api_response_time > 5000,
    action: (settings) => ({
      network: {
        ...settings.network,
        compression_level: Math.min(9, settings.network.compression_level + 2),
        batch_size: Math.max(1, settings.network.batch_size - 1)
      }
    })
  },
  {
    id: 'reduce_cache_low_memory',
    priority: 5,
    cooldown_ms: 15000,
    description: 'Reduce cache size on low memory devices',
    condition: (metrics, capabilities) => 
      capabilities.processor.memory < 2 || metrics.camera.memory_usage > 100 * 1024 * 1024,
    action: (settings) => ({
      storage: {
        ...settings.storage,
        cache_size_mb: Math.max(5, settings.storage.cache_size_mb - 10),
        auto_cleanup: true,
        preload_models: false
      }
    })
  },
  {
    id: 'disable_torch_low_battery',
    priority: 6,
    cooldown_ms: 30000,
    description: 'Disable torch when battery is low',
    condition: (metrics, capabilities) => capabilities.battery.level < 0.2,
    action: (settings) => ({
      camera: {
        ...settings.camera,
        torch_enabled: false
      }
    })
  },
  {
    id: 'enable_web_worker_main_thread_blocking',
    priority: 7,
    cooldown_ms: 5000,
    description: 'Enable Web Worker when main thread is blocked',
    condition: (metrics) => metrics.ui.main_thread_blocking > 100,
    action: (settings) => ({
      ai: {
        ...settings.ai,
        use_web_worker: true,
        batch_processing: false
      }
    })
  },
  {
    id: 'increase_timeout_slow_api',
    priority: 8,
    cooldown_ms: 20000,
    description: 'Increase timeout when API responses are slow',
    condition: (metrics) => metrics.network.api_response_time > 5000,
    action: (settings) => ({
      network: {
        ...settings.network,
        timeout_ms: Math.min(30000, settings.network.timeout_ms + 5000),
        retry_attempts: Math.max(1, settings.network.retry_attempts - 1)
      }
    })
  }
];

// ==================== ADAPTIVE QUALITY MANAGER ====================

class AdaptiveQualityManager {
  private currentProfile: QualityProfile;
  private currentSettings: QualitySettings;
  private lastAdaptations: Map<string, number> = new Map();
  private isAdaptationEnabled: boolean = true;
  private adaptationInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(settings: QualitySettings) => void> = [];

  constructor() {
    // Start with balanced profile
    this.currentProfile = QUALITY_PROFILES.find(p => p.id === 'balanced')!;
    this.currentSettings = { ...this.currentProfile.settings };
    
    this.setupAdaptation();
  }

  // ==================== INITIALIZATION ====================

  private setupAdaptation(): void {
    // Start adaptive management when performance monitoring starts
    performanceMonitor.startMonitoring();
    
    this.startAdaptation();
    console.log('🎯 HERA: Adaptive Quality Manager initialized');
  }

  // ==================== PROFILE MANAGEMENT ====================

  async initializeForDevice(): Promise<void> {
    const capabilities = await performanceMonitor.detectDeviceCapabilities();
    const deviceScore = this.calculateDeviceScore(capabilities);
    
    // Select best profile for device
    const suitableProfile = this.selectBestProfile(deviceScore);
    this.setProfile(suitableProfile.id);
    
    console.log(`🎯 HERA: Initialized with ${suitableProfile.name} profile (device score: ${deviceScore})`);
  }

  setProfile(profileId: string): void {
    const profile = QUALITY_PROFILES.find(p => p.id === profileId);
    if (!profile) {
      console.error(`Profile not found: ${profileId}`);
      return;
    }

    this.currentProfile = profile;
    this.currentSettings = { ...profile.settings };
    this.notifyListeners();
    
    console.log(`🎯 HERA: Quality profile changed to ${profile.name}`);
  }

  selectBestProfile(deviceScore: number): QualityProfile {
    // Find the highest quality profile that meets device requirements
    return QUALITY_PROFILES
      .filter(profile => profile.min_device_score <= deviceScore)
      .sort((a, b) => b.min_device_score - a.min_device_score)[0] || 
      QUALITY_PROFILES[QUALITY_PROFILES.length - 1]; // Fallback to power saver
  }

  // ==================== DEVICE SCORING ====================

  calculateDeviceScore(capabilities: DeviceCapabilities): number {
    let score = 0;

    // CPU score (0-30 points)
    const cores = capabilities.processor.cores;
    score += Math.min(30, cores * 5);

    // Memory score (0-25 points)
    const memory = capabilities.processor.memory;
    if (memory >= 8) score += 25;
    else if (memory >= 4) score += 20;
    else if (memory >= 2) score += 15;
    else if (memory >= 1) score += 10;
    else score += 5;

    // GPU score (0-15 points)
    if (capabilities.processor.gpu_acceleration) score += 15;
    else if (capabilities.processor.webgl_support) score += 10;
    else score += 5;

    // Network score (0-15 points)
    const networkType = capabilities.network.effective_type;
    if (networkType === '4g') score += 15;
    else if (networkType === '3g') score += 10;
    else if (networkType === '2g') score += 5;
    else score += 2;

    // Battery score (0-15 points)
    const batteryLevel = capabilities.battery.level;
    if (batteryLevel > 0.8) score += 15;
    else if (batteryLevel > 0.5) score += 12;
    else if (batteryLevel > 0.2) score += 8;
    else score += 3;

    return Math.min(100, score);
  }

  // ==================== ADAPTIVE MANAGEMENT ====================

  startAdaptation(): void {
    if (this.adaptationInterval) return;

    this.adaptationInterval = setInterval(() => {
      this.performAdaptation();
    }, 2000); // Check every 2 seconds

    console.log('🎯 HERA: Adaptive quality management started');
  }

  stopAdaptation(): void {
    if (this.adaptationInterval) {
      clearInterval(this.adaptationInterval);
      this.adaptationInterval = null;
    }

    console.log('🎯 HERA: Adaptive quality management stopped');
  }

  private performAdaptation(): void {
    if (!this.isAdaptationEnabled) return;

    const metrics = performanceMonitor.getMetrics();
    const capabilities = performanceMonitor.getDeviceCapabilities();
    
    if (!capabilities) return;

    // Apply adaptation rules
    const applicableRules = this.getApplicableRules(metrics, capabilities);
    
    for (const rule of applicableRules) {
      if (this.canApplyRule(rule)) {
        const adaptations = rule.action(this.currentSettings);
        this.applyAdaptations(adaptations);
        this.lastAdaptations.set(rule.id, Date.now());
        
        console.log(`🎯 HERA: Applied adaptation rule: ${rule.description}`);
        break; // Apply one rule at a time to avoid overcorrection
      }
    }
  }

  private getApplicableRules(
    metrics: PerformanceMetrics, 
    capabilities: DeviceCapabilities
  ): AdaptationRule[] {
    return ADAPTATION_RULES
      .filter(rule => rule.condition(metrics, capabilities))
      .sort((a, b) => a.priority - b.priority);
  }

  private canApplyRule(rule: AdaptationRule): boolean {
    const lastApplied = this.lastAdaptations.get(rule.id);
    if (!lastApplied) return true;
    
    return Date.now() - lastApplied >= rule.cooldown_ms;
  }

  private applyAdaptations(adaptations: Partial<QualitySettings>): void {
    // Deep merge adaptations into current settings
    this.currentSettings = this.deepMerge(this.currentSettings, adaptations);
    this.notifyListeners();
  }

  // ==================== MANUAL OVERRIDES ====================

  overrideCameraSettings(settings: Partial<QualitySettings['camera']>): void {
    this.currentSettings.camera = { ...this.currentSettings.camera, ...settings };
    this.notifyListeners();
    console.log('🎯 HERA: Camera settings overridden');
  }

  overrideAISettings(settings: Partial<QualitySettings['ai']>): void {
    this.currentSettings.ai = { ...this.currentSettings.ai, ...settings };
    this.notifyListeners();
    console.log('🎯 HERA: AI settings overridden');
  }

  overrideUISettings(settings: Partial<QualitySettings['ui']>): void {
    this.currentSettings.ui = { ...this.currentSettings.ui, ...settings };
    this.notifyListeners();
    console.log('🎯 HERA: UI settings overridden');
  }

  overrideNetworkSettings(settings: Partial<QualitySettings['network']>): void {
    this.currentSettings.network = { ...this.currentSettings.network, ...settings };
    this.notifyListeners();
    console.log('🎯 HERA: Network settings overridden');
  }

  overrideStorageSettings(settings: Partial<QualitySettings['storage']>): void {
    this.currentSettings.storage = { ...this.currentSettings.storage, ...settings };
    this.notifyListeners();
    console.log('🎯 HERA: Storage settings overridden');
  }

  // ==================== PRESET ADJUSTMENTS ====================

  setBatteryOptimized(): void {
    const batterySettings: Partial<QualitySettings> = {
      camera: {
        ...this.currentSettings.camera,
        resolution: 'low',
        frame_rate: 15,
        torch_enabled: false
      },
      ai: {
        ...this.currentSettings.ai,
        model_size: 'micro',
        inference_frequency: 1
      },
      ui: {
        ...this.currentSettings.ui,
        animation_level: 'minimal',
        blur_effects: false,
        particle_effects: false,
        haptic_feedback: false
      }
    };

    this.applyAdaptations(batterySettings);
    console.log('🎯 HERA: Battery optimization applied');
  }

  setPerformanceOptimized(): void {
    const performanceSettings: Partial<QualitySettings> = {
      camera: {
        ...this.currentSettings.camera,
        resolution: 'high',
        frame_rate: 30
      },
      ai: {
        ...this.currentSettings.ai,
        model_size: 'medium',
        inference_frequency: 5,
        use_web_worker: true
      },
      ui: {
        ...this.currentSettings.ui,
        animation_level: 'full',
        render_quality: 'high'
      }
    };

    this.applyAdaptations(performanceSettings);
    console.log('🎯 HERA: Performance optimization applied');
  }

  setNetworkOptimized(): void {
    const networkSettings: Partial<QualitySettings> = {
      network: {
        ...this.currentSettings.network,
        compression_level: 7,
        batch_size: 3,
        timeout_ms: 10000
      },
      storage: {
        ...this.currentSettings.storage,
        compression_enabled: true,
        cache_size_mb: 30
      }
    };

    this.applyAdaptations(networkSettings);
    console.log('🎯 HERA: Network optimization applied');
  }

  // ==================== LISTENERS ====================

  addSettingsListener(listener: (settings: QualitySettings) => void): void {
    this.listeners.push(listener);
  }

  removeSettingsListener(listener: (settings: QualitySettings) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentSettings);
      } catch (error) {
        console.error('Error in quality settings listener:', error);
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  // ==================== PUBLIC API ====================

  getCurrentSettings(): QualitySettings {
    return { ...this.currentSettings };
  }

  getCurrentProfile(): QualityProfile {
    return { ...this.currentProfile };
  }

  getAvailableProfiles(): QualityProfile[] {
    return [...QUALITY_PROFILES];
  }

  isAdaptationActive(): boolean {
    return this.isAdaptationEnabled && this.adaptationInterval !== null;
  }

  enableAdaptation(): void {
    this.isAdaptationEnabled = true;
    if (!this.adaptationInterval) {
      this.startAdaptation();
    }
  }

  disableAdaptation(): void {
    this.isAdaptationEnabled = false;
  }

  resetToProfile(): void {
    this.currentSettings = { ...this.currentProfile.settings };
    this.notifyListeners();
    console.log('🎯 HERA: Settings reset to profile defaults');
  }

  getOptimalSettingsFor(deviceCapabilities: DeviceCapabilities): QualitySettings {
    const deviceScore = this.calculateDeviceScore(deviceCapabilities);
    const optimalProfile = this.selectBestProfile(deviceScore);
    return { ...optimalProfile.settings };
  }

  generateQualityReport(): string {
    const profile = this.currentProfile;
    const settings = this.currentSettings;
    
    return `
HERA Adaptive Quality Report
===========================
Current Profile: ${profile.name}
Description: ${profile.description}
Adaptation: ${this.isAdaptationActive() ? 'Active' : 'Inactive'}

Current Settings:
- Camera: ${settings.camera.resolution} @ ${settings.camera.frame_rate}fps
- AI Model: ${settings.ai.model_size} (${settings.ai.inference_frequency}Hz)
- UI Animation: ${settings.ui.animation_level}
- Network Compression: Level ${settings.network.compression_level}
- Cache Size: ${settings.storage.cache_size_mb}MB

Recent Adaptations: ${this.lastAdaptations.size}
    `.trim();
  }
}

// ==================== SINGLETON EXPORT ====================

export const adaptiveQualityManager = new AdaptiveQualityManager();
export default adaptiveQualityManager;