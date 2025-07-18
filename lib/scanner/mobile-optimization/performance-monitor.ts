/**
 * HERA Universal ERP - Mobile Performance Monitor
 * Real-time performance monitoring and optimization for mobile scanning
 */

// ==================== TYPES ====================

export interface PerformanceMetrics {
  camera: {
    initialization_time: number;
    frame_rate: number;
    processing_latency: number;
    memory_usage: number;
    battery_drain: number;
  };
  ai: {
    inference_time: number;
    model_load_time: number;
    accuracy: number;
    throughput: number;
  };
  ui: {
    render_time: number;
    interaction_latency: number;
    animation_fps: number;
    main_thread_blocking: number;
  };
  network: {
    api_response_time: number;
    offline_queue_size: number;
    sync_performance: number;
    bandwidth_usage: number;
  };
  storage: {
    read_performance: number;
    write_performance: number;
    storage_usage: number;
    cache_hit_ratio: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  category: keyof PerformanceMetrics;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
  suggestion?: string;
}

export interface DeviceCapabilities {
  camera: {
    max_resolution: string;
    supports_torch: boolean;
    supports_autofocus: boolean;
    frame_rates: number[];
  };
  processor: {
    cores: number;
    memory: number;
    gpu_acceleration: boolean;
    webgl_support: boolean;
  };
  network: {
    connection_type: string;
    downlink: number;
    effective_type: string;
    rtt: number;
  };
  battery: {
    level: number;
    charging: boolean;
    discharge_rate: number;
  };
}

// ==================== PERFORMANCE MONITOR ====================

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private deviceCapabilities: DeviceCapabilities | null = null;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private observers: PerformanceObserver[] = [];
  
  // Thresholds for performance alerts
  private thresholds = {
    camera: {
      initialization_time: 3000, // 3 seconds
      frame_rate: 15, // minimum FPS
      processing_latency: 500, // 500ms
      memory_usage: 100 * 1024 * 1024, // 100MB
      battery_drain: 10 // 10% per hour
    },
    ai: {
      inference_time: 2000, // 2 seconds
      model_load_time: 5000, // 5 seconds
      accuracy: 0.85, // 85% minimum
      throughput: 1 // 1 inference per second
    },
    ui: {
      render_time: 16, // 16ms for 60fps
      interaction_latency: 100, // 100ms
      animation_fps: 30, // minimum 30fps
      main_thread_blocking: 50 // 50ms
    },
    network: {
      api_response_time: 3000, // 3 seconds
      offline_queue_size: 100, // 100 operations
      sync_performance: 5000, // 5 seconds
      bandwidth_usage: 10 * 1024 * 1024 // 10MB per session
    },
    storage: {
      read_performance: 100, // 100ms
      write_performance: 200, // 200ms
      storage_usage: 50 * 1024 * 1024, // 50MB
      cache_hit_ratio: 0.8 // 80% minimum
    }
  };

  constructor() {
    this.metrics = this.initializeMetrics();
    this.setupPerformanceObservers();
  }

  // ==================== INITIALIZATION ====================

  private initializeMetrics(): PerformanceMetrics {
    return {
      camera: {
        initialization_time: 0,
        frame_rate: 0,
        processing_latency: 0,
        memory_usage: 0,
        battery_drain: 0
      },
      ai: {
        inference_time: 0,
        model_load_time: 0,
        accuracy: 0,
        throughput: 0
      },
      ui: {
        render_time: 0,
        interaction_latency: 0,
        animation_fps: 0,
        main_thread_blocking: 0
      },
      network: {
        api_response_time: 0,
        offline_queue_size: 0,
        sync_performance: 0,
        bandwidth_usage: 0
      },
      storage: {
        read_performance: 0,
        write_performance: 0,
        storage_usage: 0,
        cache_hit_ratio: 0
      }
    };
  }

  private setupPerformanceObservers(): void {
    if ('PerformanceObserver' in window) {
      // Monitor navigation and resource loading
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.updateNetworkMetrics(entry as PerformanceNavigationTiming);
          } else if (entry.entryType === 'resource') {
            this.updateResourceMetrics(entry as PerformanceResourceTiming);
          }
        }
      });
      
      navObserver.observe({ entryTypes: ['navigation', 'resource'] });
      this.observers.push(navObserver);

      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.ui.main_thread_blocking = Math.max(
            this.metrics.ui.main_thread_blocking,
            entry.duration
          );
          this.checkThreshold('ui', 'main_thread_blocking', entry.duration);
        }
      });
      
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);

      // Monitor paint metrics
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.ui.render_time = entry.startTime;
          }
        }
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }
  }

  // ==================== DEVICE CAPABILITIES ====================

  async detectDeviceCapabilities(): Promise<DeviceCapabilities> {
    const capabilities: DeviceCapabilities = {
      camera: {
        max_resolution: 'unknown',
        supports_torch: false,
        supports_autofocus: false,
        frame_rates: []
      },
      processor: {
        cores: navigator.hardwareConcurrency || 1,
        memory: (navigator as any).deviceMemory || 0,
        gpu_acceleration: this.checkWebGLSupport(),
        webgl_support: this.checkWebGLSupport()
      },
      network: {
        connection_type: this.getNetworkType(),
        downlink: this.getNetworkDownlink(),
        effective_type: this.getNetworkEffectiveType(),
        rtt: this.getNetworkRTT()
      },
      battery: {
        level: await this.getBatteryLevel(),
        charging: await this.getBatteryCharging(),
        discharge_rate: 0
      }
    };

    // Detect camera capabilities
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const track = stream.getVideoTracks()[0];
      const trackCapabilities = track.getCapabilities();
      
      capabilities.camera.supports_torch = 'torch' in trackCapabilities;
      capabilities.camera.supports_autofocus = 'focusMode' in trackCapabilities;
      
      if (trackCapabilities.width && trackCapabilities.height) {
        const maxWidth = Math.max(...(trackCapabilities.width.max ? [trackCapabilities.width.max] : [640]));
        const maxHeight = Math.max(...(trackCapabilities.height.max ? [trackCapabilities.height.max] : [480]));
        capabilities.camera.max_resolution = `${maxWidth}x${maxHeight}`;
      }
      
      if (trackCapabilities.frameRate) {
        capabilities.camera.frame_rates = trackCapabilities.frameRate.max ? 
          [trackCapabilities.frameRate.max] : [30];
      }
      
      track.stop();
    } catch (error) {
      console.warn('Could not detect camera capabilities:', error);
    }

    this.deviceCapabilities = capabilities;
    return capabilities;
  }

  // ==================== MONITORING CONTROL ====================

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('📊 HERA: Performance monitoring started');

    // Initialize device capabilities detection
    this.detectDeviceCapabilities();

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkAllThresholds();
      this.optimizePerformance();
    }, 1000); // Check every second

    // Monitor memory usage
    this.startMemoryMonitoring();
    
    // Monitor battery usage
    this.startBatteryMonitoring();
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    console.log('📊 HERA: Performance monitoring stopped');
  }

  // ==================== METRIC COLLECTION ====================

  private collectMetrics(): void {
    // Update UI metrics
    this.metrics.ui.render_time = this.calculateRenderTime();
    this.metrics.ui.animation_fps = this.calculateAnimationFPS();

    // Update storage metrics
    this.updateStorageMetrics();

    // Update network metrics from current state
    this.updateCurrentNetworkMetrics();
  }

  recordCameraMetric(metric: keyof PerformanceMetrics['camera'], value: number): void {
    this.metrics.camera[metric] = value;
    this.checkThreshold('camera', metric, value);
    
    if (metric === 'initialization_time' && value > this.thresholds.camera.initialization_time) {
      this.addAlert('warning', 'camera', metric, value, 'Consider reducing camera resolution or disabling auto-focus');
    }
  }

  recordAIMetric(metric: keyof PerformanceMetrics['ai'], value: number): void {
    this.metrics.ai[metric] = value;
    this.checkThreshold('ai', metric, value);
    
    if (metric === 'inference_time' && value > this.thresholds.ai.inference_time) {
      this.addAlert('warning', 'ai', metric, value, 'Consider using a smaller AI model or reducing image size');
    }
  }

  recordUIMetric(metric: keyof PerformanceMetrics['ui'], value: number): void {
    this.metrics.ui[metric] = value;
    this.checkThreshold('ui', metric, value);
  }

  recordNetworkMetric(metric: keyof PerformanceMetrics['network'], value: number): void {
    this.metrics.network[metric] = value;
    this.checkThreshold('network', metric, value);
  }

  recordStorageMetric(metric: keyof PerformanceMetrics['storage'], value: number): void {
    this.metrics.storage[metric] = value;
    this.checkThreshold('storage', metric, value);
  }

  // ==================== PERFORMANCE OPTIMIZATION ====================

  private optimizePerformance(): void {
    const capabilities = this.deviceCapabilities;
    if (!capabilities) return;

    // Optimize based on device capabilities and current performance
    this.optimizeCameraSettings(capabilities);
    this.optimizeAISettings(capabilities);
    this.optimizeUISettings(capabilities);
    this.optimizeNetworkSettings(capabilities);
  }

  private optimizeCameraSettings(capabilities: DeviceCapabilities): void {
    // Reduce camera resolution on low-end devices
    if (capabilities.processor.memory < 2 || this.metrics.camera.memory_usage > this.thresholds.camera.memory_usage) {
      this.suggestCameraOptimization('medium'); // Reduce to medium resolution
    }

    // Reduce frame rate if processing is slow
    if (this.metrics.camera.processing_latency > this.thresholds.camera.processing_latency) {
      this.suggestCameraOptimization('low_fps'); // Reduce frame rate
    }

    // Disable torch if battery is low
    if (capabilities.battery.level < 0.2) {
      this.suggestCameraOptimization('disable_torch');
    }
  }

  private optimizeAISettings(capabilities: DeviceCapabilities): void {
    // Use smaller model on low-end devices
    if (!capabilities.processor.gpu_acceleration || capabilities.processor.memory < 4) {
      this.suggestAIOptimization('lightweight_model');
    }

    // Reduce inference frequency if slow
    if (this.metrics.ai.inference_time > this.thresholds.ai.inference_time) {
      this.suggestAIOptimization('reduce_frequency');
    }

    // Use Web Workers for processing
    if (this.metrics.ui.main_thread_blocking > this.thresholds.ui.main_thread_blocking) {
      this.suggestAIOptimization('use_web_worker');
    }
  }

  private optimizeUISettings(capabilities: DeviceCapabilities): void {
    // Reduce animations on low-end devices
    if (this.metrics.ui.animation_fps < this.thresholds.ui.animation_fps) {
      this.suggestUIOptimization('reduce_animations');
    }

    // Simplify UI on small memory devices
    if (capabilities.processor.memory < 2) {
      this.suggestUIOptimization('simplified_ui');
    }
  }

  private optimizeNetworkSettings(capabilities: DeviceCapabilities): void {
    // Optimize for slow networks
    if (capabilities.network.effective_type === 'slow-2g' || capabilities.network.effective_type === '2g') {
      this.suggestNetworkOptimization('compress_data');
    }

    // Increase offline queue processing on fast networks
    if (capabilities.network.downlink > 10) {
      this.suggestNetworkOptimization('increase_batch_size');
    }
  }

  // ==================== THRESHOLD CHECKING ====================

  private checkThreshold(
    category: keyof PerformanceMetrics,
    metric: string,
    value: number
  ): void {
    const threshold = this.getThreshold(category, metric);
    if (threshold && this.isThresholdExceeded(category, metric, value, threshold)) {
      this.addAlert('warning', category, metric, value);
    }
  }

  private checkAllThresholds(): void {
    Object.entries(this.metrics).forEach(([category, categoryMetrics]) => {
      Object.entries(categoryMetrics).forEach(([metric, value]) => {
        this.checkThreshold(category as keyof PerformanceMetrics, metric, value as number);
      });
    });
  }

  private getThreshold(category: keyof PerformanceMetrics, metric: string): number | undefined {
    return (this.thresholds[category] as any)?.[metric];
  }

  private isThresholdExceeded(
    category: keyof PerformanceMetrics,
    metric: string,
    value: number,
    threshold: number
  ): boolean {
    // Some metrics are "lower is better", others are "higher is better"
    const lowerIsBetter = [
      'initialization_time', 'processing_latency', 'memory_usage', 'battery_drain',
      'inference_time', 'model_load_time', 'render_time', 'interaction_latency',
      'main_thread_blocking', 'api_response_time', 'offline_queue_size',
      'sync_performance', 'bandwidth_usage', 'read_performance', 'write_performance',
      'storage_usage'
    ];

    if (lowerIsBetter.includes(metric)) {
      return value > threshold;
    } else {
      return value < threshold;
    }
  }

  // ==================== ALERT MANAGEMENT ====================

  private addAlert(
    type: 'warning' | 'critical',
    category: keyof PerformanceMetrics,
    metric: string,
    value: number,
    suggestion?: string
  ): void {
    const threshold = this.getThreshold(category, metric);
    if (!threshold) return;

    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      category,
      metric,
      value,
      threshold,
      timestamp: new Date().toISOString(),
      suggestion
    };

    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    console.warn(`⚠️ HERA Performance Alert: ${category}.${metric} = ${value} (threshold: ${threshold})`);
    
    if (suggestion) {
      console.log(`💡 HERA Suggestion: ${suggestion}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  private calculateRenderTime(): number {
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : 0;
    }
    return 0;
  }

  private calculateAnimationFPS(): number {
    // This would need to be implemented with requestAnimationFrame monitoring
    return 60; // Placeholder
  }

  private updateStorageMetrics(): void {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        this.metrics.storage.storage_usage = estimate.usage || 0;
      });
    }
  }

  private updateNetworkMetrics(entry: PerformanceNavigationTiming): void {
    this.metrics.network.api_response_time = entry.responseEnd - entry.requestStart;
  }

  private updateResourceMetrics(entry: PerformanceResourceTiming): void {
    if (entry.name.includes('/api/')) {
      this.metrics.network.api_response_time = entry.responseEnd - entry.requestStart;
    }
  }

  private updateCurrentNetworkMetrics(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.network.bandwidth_usage = connection.downlink || 0;
    }
  }

  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      this.metrics.camera.memory_usage = memInfo.usedJSHeapSize;
    }
  }

  private startBatteryMonitoring(): void {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBatteryMetrics = () => {
          this.metrics.camera.battery_drain = (1 - battery.level) * 100;
        };

        battery.addEventListener('levelchange', updateBatteryMetrics);
        battery.addEventListener('chargingchange', updateBatteryMetrics);
        updateBatteryMetrics();
      });
    }
  }

  // Device capability detection helpers
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  private getNetworkType(): string {
    const connection = (navigator as any).connection;
    return connection?.type || 'unknown';
  }

  private getNetworkDownlink(): number {
    const connection = (navigator as any).connection;
    return connection?.downlink || 0;
  }

  private getNetworkEffectiveType(): string {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  }

  private getNetworkRTT(): number {
    const connection = (navigator as any).connection;
    return connection?.rtt || 0;
  }

  private async getBatteryLevel(): Promise<number> {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return battery.level;
    }
    return 1; // Assume full battery if API not available
  }

  private async getBatteryCharging(): Promise<boolean> {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return battery.charging;
    }
    return false;
  }

  // Optimization suggestion methods
  private suggestCameraOptimization(type: string): void {
    console.log(`📸 HERA Camera Optimization: ${type}`);
  }

  private suggestAIOptimization(type: string): void {
    console.log(`🧠 HERA AI Optimization: ${type}`);
  }

  private suggestUIOptimization(type: string): void {
    console.log(`🎨 HERA UI Optimization: ${type}`);
  }

  private suggestNetworkOptimization(type: string): void {
    console.log(`🌐 HERA Network Optimization: ${type}`);
  }

  // ==================== PUBLIC API ====================

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getDeviceCapabilities(): DeviceCapabilities | null {
    return this.deviceCapabilities;
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  getPerformanceScore(): number {
    // Calculate overall performance score (0-100)
    const scores = {
      camera: this.calculateCameraScore(),
      ai: this.calculateAIScore(),
      ui: this.calculateUIScore(),
      network: this.calculateNetworkScore(),
      storage: this.calculateStorageScore()
    };

    const weights = { camera: 0.25, ai: 0.25, ui: 0.2, network: 0.15, storage: 0.15 };
    
    return Object.entries(scores).reduce((total, [category, score]) => {
      return total + score * weights[category as keyof typeof weights];
    }, 0);
  }

  private calculateCameraScore(): number {
    const metrics = this.metrics.camera;
    let score = 100;
    
    if (metrics.initialization_time > this.thresholds.camera.initialization_time) score -= 20;
    if (metrics.frame_rate < this.thresholds.camera.frame_rate) score -= 20;
    if (metrics.processing_latency > this.thresholds.camera.processing_latency) score -= 20;
    if (metrics.memory_usage > this.thresholds.camera.memory_usage) score -= 20;
    if (metrics.battery_drain > this.thresholds.camera.battery_drain) score -= 20;
    
    return Math.max(0, score);
  }

  private calculateAIScore(): number {
    const metrics = this.metrics.ai;
    let score = 100;
    
    if (metrics.inference_time > this.thresholds.ai.inference_time) score -= 25;
    if (metrics.model_load_time > this.thresholds.ai.model_load_time) score -= 25;
    if (metrics.accuracy < this.thresholds.ai.accuracy) score -= 25;
    if (metrics.throughput < this.thresholds.ai.throughput) score -= 25;
    
    return Math.max(0, score);
  }

  private calculateUIScore(): number {
    const metrics = this.metrics.ui;
    let score = 100;
    
    if (metrics.render_time > this.thresholds.ui.render_time) score -= 25;
    if (metrics.interaction_latency > this.thresholds.ui.interaction_latency) score -= 25;
    if (metrics.animation_fps < this.thresholds.ui.animation_fps) score -= 25;
    if (metrics.main_thread_blocking > this.thresholds.ui.main_thread_blocking) score -= 25;
    
    return Math.max(0, score);
  }

  private calculateNetworkScore(): number {
    const metrics = this.metrics.network;
    let score = 100;
    
    if (metrics.api_response_time > this.thresholds.network.api_response_time) score -= 25;
    if (metrics.offline_queue_size > this.thresholds.network.offline_queue_size) score -= 25;
    if (metrics.sync_performance > this.thresholds.network.sync_performance) score -= 25;
    if (metrics.bandwidth_usage > this.thresholds.network.bandwidth_usage) score -= 25;
    
    return Math.max(0, score);
  }

  private calculateStorageScore(): number {
    const metrics = this.metrics.storage;
    let score = 100;
    
    if (metrics.read_performance > this.thresholds.storage.read_performance) score -= 20;
    if (metrics.write_performance > this.thresholds.storage.write_performance) score -= 20;
    if (metrics.storage_usage > this.thresholds.storage.storage_usage) score -= 20;
    if (metrics.cache_hit_ratio < this.thresholds.storage.cache_hit_ratio) score -= 20;
    
    return Math.max(0, score);
  }

  generatePerformanceReport(): string {
    const score = this.getPerformanceScore();
    const capabilities = this.deviceCapabilities;
    const alerts = this.alerts.length;

    return `
HERA Mobile Performance Report
=============================
Overall Score: ${score.toFixed(1)}/100

Device Capabilities:
- CPU Cores: ${capabilities?.processor.cores || 'unknown'}
- Memory: ${capabilities?.processor.memory || 'unknown'}GB
- GPU Acceleration: ${capabilities?.processor.gpu_acceleration ? 'Yes' : 'No'}
- Network: ${capabilities?.network.effective_type || 'unknown'}
- Battery: ${Math.round((capabilities?.battery.level || 0) * 100)}%

Current Performance:
- Camera Init: ${this.metrics.camera.initialization_time}ms
- AI Inference: ${this.metrics.ai.inference_time}ms
- UI Render: ${this.metrics.ui.render_time}ms
- API Response: ${this.metrics.network.api_response_time}ms

Active Alerts: ${alerts}
Monitoring: ${this.isMonitoring ? 'Active' : 'Inactive'}
    `.trim();
  }
}

// ==================== SINGLETON EXPORT ====================

export const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;