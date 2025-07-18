'use client';

/**
 * HERA Universal - Conversion Tracking System
 * 
 * Advanced analytics and A/B testing framework for rapid market entry
 * Tracks user behavior, conversion funnels, and optimization metrics
 */

interface ConversionEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  variantId?: string;
}

interface ABTestVariant {
  id: string;
  name: string;
  traffic: number; // percentage 0-100
  config: Record<string, any>;
}

interface ConversionFunnel {
  name: string;
  steps: string[];
  conversionRates: number[];
  dropoffPoints: string[];
}

class ConversionTracker {
  private sessionId: string;
  private userId?: string;
  private variantId?: string;
  private events: ConversionEvent[] = [];

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.initializeVariant();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      // Server-side: return a temporary ID
      return `ssr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    let sessionId = sessionStorage.getItem('hera_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('hera_session_id', sessionId);
    }
    return sessionId;
  }

  private initializeVariant(): void {
    if (typeof window === 'undefined') {
      // Server-side: use default variant
      this.variantId = 'control';
      return;
    }
    
    // A/B test assignment
    const variants: ABTestVariant[] = [
      { id: 'control', name: 'Original Landing', traffic: 50, config: {} },
      { id: 'savings_focus', name: 'Savings-Focused', traffic: 25, config: { 
        heroTitle: 'Save $2,400/Month with AI Restaurant Management',
        ctaColor: 'green',
        testimonialRotation: 'fast'
      }},
      { id: 'ai_focus', name: 'AI-Focused', traffic: 25, config: {
        heroTitle: 'AI-Powered Restaurant Revolution',
        ctaColor: 'blue', 
        testimonialRotation: 'slow'
      }}
    ];

    const random = Math.random() * 100;
    let cumulativeTraffic = 0;
    
    for (const variant of variants) {
      cumulativeTraffic += variant.traffic;
      if (random <= cumulativeTraffic) {
        this.variantId = variant.id;
        localStorage.setItem('hera_ab_variant', variant.id);
        localStorage.setItem('hera_ab_config', JSON.stringify(variant.config));
        break;
      }
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  track(event: string, properties: Record<string, any> = {}): void {
    const conversionEvent: ConversionEvent = {
      event,
      properties: {
        ...properties,
        page: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      },
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      variantId: this.variantId
    };

    this.events.push(conversionEvent);
    this.sendToAnalytics(conversionEvent);
    
    // Store locally for offline analysis
    this.storeLocalEvent(conversionEvent);
  }

  private async sendToAnalytics(event: ConversionEvent): Promise<void> {
    try {
      // Multiple analytics services
      await Promise.allSettled([
        this.sendToGoogleAnalytics(event),
        this.sendToHotjar(event),
        this.sendToMixpanel(event),
        this.sendToHeraAnalytics(event)
      ]);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  private sendToGoogleAnalytics(event: ConversionEvent): void {
    if (typeof gtag !== 'undefined') {
      gtag('event', event.event, {
        event_category: 'conversion',
        event_label: event.variantId,
        custom_parameters: event.properties
      });
    }
  }

  private sendToHotjar(event: ConversionEvent): void {
    if (typeof hj !== 'undefined') {
      hj('event', event.event);
    }
  }

  private sendToMixpanel(event: ConversionEvent): void {
    if (typeof mixpanel !== 'undefined') {
      mixpanel.track(event.event, {
        ...event.properties,
        variant: event.variantId,
        session_id: event.sessionId
      });
    }
  }

  private async sendToHeraAnalytics(event: ConversionEvent): Promise<void> {
    // Analytics disabled - using direct Supabase instead
    console.log('📊 Analytics event (disabled):', event.event);
    return;
  }

  private storeLocalEvent(event: ConversionEvent): void {
    if (typeof window === 'undefined') {
      // Server-side: skip local storage
      return;
    }
    
    const stored = localStorage.getItem('hera_analytics_events');
    const events = stored ? JSON.parse(stored) : [];
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('hera_analytics_events', JSON.stringify(events));
  }

  // Conversion funnel tracking
  trackFunnelStep(funnel: string, step: string): void {
    this.track('funnel_step', {
      funnel,
      step,
      step_number: this.getFunnelStepNumber(funnel, step)
    });
  }

  private getFunnelStepNumber(funnel: string, step: string): number {
    const funnels: Record<string, string[]> = {
      'trial_signup': [
        'landing_view',
        'form_focus',
        'form_submit',
        'email_confirm',
        'onboarding_start',
        'first_login'
      ],
      'demo_request': [
        'demo_button_click',
        'form_view',
        'form_submit',
        'calendar_view',
        'demo_scheduled'
      ],
      'sales_conversion': [
        'trial_start',
        'feature_usage',
        'value_realization',
        'sales_contact',
        'contract_signed'
      ]
    };

    const steps = funnels[funnel] || [];
    return steps.indexOf(step) + 1;
  }

  // Real-time conversion analytics
  getConversionMetrics(): ConversionFunnel[] {
    if (typeof window === 'undefined') {
      return [];
    }
    
    const stored = localStorage.getItem('hera_analytics_events');
    if (!stored) return [];

    const events: ConversionEvent[] = JSON.parse(stored);
    
    return [
      this.calculateFunnelMetrics('trial_signup', events),
      this.calculateFunnelMetrics('demo_request', events),
      this.calculateFunnelMetrics('sales_conversion', events)
    ];
  }

  private calculateFunnelMetrics(funnelName: string, events: ConversionEvent[]): ConversionFunnel {
    const funnelEvents = events.filter(e => 
      e.event === 'funnel_step' && e.properties.funnel === funnelName
    );

    const stepCounts = new Map<string, number>();
    funnelEvents.forEach(event => {
      const step = event.properties.step;
      stepCounts.set(step, (stepCounts.get(step) || 0) + 1);
    });

    const steps = Array.from(stepCounts.keys()).sort();
    const counts = steps.map(step => stepCounts.get(step) || 0);
    const conversionRates = counts.map((count, index) => 
      index === 0 ? 100 : (count / counts[0]) * 100
    );

    const dropoffPoints = steps.filter((_, index) => 
      index > 0 && conversionRates[index] < conversionRates[index - 1] * 0.7
    );

    return {
      name: funnelName,
      steps,
      conversionRates,
      dropoffPoints
    };
  }

  // A/B test configuration
  getVariantConfig(): Record<string, any> {
    if (typeof window === 'undefined') {
      return {};
    }
    
    const stored = localStorage.getItem('hera_ab_config');
    return stored ? JSON.parse(stored) : {};
  }

  getVariantId(): string | undefined {
    return this.variantId;
  }

  // Page performance tracking
  trackPagePerformance(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.track('page_performance', {
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        server_response: navigation.responseEnd - navigation.requestStart,
        dom_processing: navigation.domComplete - navigation.domLoading
      });
    }
  }

  // User engagement tracking
  trackEngagement(): void {
    let startTime = Date.now();
    let isActive = true;
    let scrollDepth = 0;
    let maxScrollDepth = 0;

    // Scroll depth tracking
    const trackScroll = () => {
      scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
    };

    window.addEventListener('scroll', trackScroll);

    // Activity tracking
    const trackActivity = () => {
      isActive = true;
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, trackActivity);
    });

    // Send engagement data on page unload
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - startTime;
      
      this.track('page_engagement', {
        time_on_page: timeOnPage,
        max_scroll_depth: maxScrollDepth,
        was_active: isActive,
        page_views: 1
      });
    });

    // Track engagement every 30 seconds
    setInterval(() => {
      if (isActive) {
        this.track('engagement_heartbeat', {
          current_scroll: scrollDepth,
          time_active: Date.now() - startTime
        });
        isActive = false;
      }
    }, 30000);
  }
}

// Global instance
export const conversionTracker = new ConversionTracker();

// React hooks for easy integration
export function useConversionTracking() {
  return {
    track: (event: string, properties?: Record<string, any>) => 
      conversionTracker.track(event, properties),
    trackFunnelStep: (funnel: string, step: string) => 
      conversionTracker.trackFunnelStep(funnel, step),
    getVariantConfig: () => conversionTracker.getVariantConfig(),
    getVariantId: () => conversionTracker.getVariantId(),
    setUserId: (userId: string) => conversionTracker.setUserId(userId)
  };
}

// Auto-initialize page tracking
if (typeof window !== 'undefined') {
  // Track page load
  conversionTracker.track('page_view');
  
  // Track performance when page fully loads
  window.addEventListener('load', () => {
    conversionTracker.trackPagePerformance();
    conversionTracker.trackEngagement();
  });
}