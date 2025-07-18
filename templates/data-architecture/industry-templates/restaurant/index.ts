/**
 * HERA Universal Restaurant Migration Tool - Main Export
 * 
 * One-click migration system that instantly brings any restaurant's data into HERA Universal.
 * Supports all major POS systems, delivery platforms, and restaurant management tools.
 */

// Main restaurant migrator
export { UniversalRestaurantMigrator } from './universal-restaurant-migrator';

// Type exports
export type {
  RestaurantMigrationConfig,
  RestaurantMigrationResult,
  RestaurantMigrationSummary,
  DataSourceMigrationResult,
  RestaurantSetupResult
} from './universal-restaurant-migrator';

// Restaurant-specific templates and presets
export const restaurantTemplates = {
  // Migration templates by restaurant type
  restaurantTypes: {
    quickService: {
      name: 'Quick Service Restaurant',
      description: 'Fast food, counter service, food trucks',
      estimatedMigrationTime: '10-20 minutes',
      commonDataSources: ['square_pos', 'toast_pos', 'delivery_platforms'],
      keyFeatures: ['speed_optimization', 'mobile_ordering', 'delivery_integration'],
      defaultConfig: {
        migrationSpeed: 'fast',
        migrationScope: 'essential_only',
        focusAreas: ['menu_items', 'orders', 'basic_customers']
      }
    },
    
    casualDining: {
      name: 'Casual Dining Restaurant',
      description: 'Full-service restaurants with table service',
      estimatedMigrationTime: '25-40 minutes',
      commonDataSources: ['lightspeed_pos', 'toast_pos', 'reservation_systems', 'accounting'],
      keyFeatures: ['table_management', 'reservation_system', 'staff_scheduling'],
      defaultConfig: {
        migrationSpeed: 'balanced',
        migrationScope: 'complete',
        focusAreas: ['menu_items', 'customers', 'orders', 'tables', 'staff']
      }
    },
    
    fineDining: {
      name: 'Fine Dining Restaurant',
      description: 'Upscale restaurants with premium service',
      estimatedMigrationTime: '45-75 minutes',
      commonDataSources: ['custom_pos', 'reservation_systems', 'wine_inventory', 'accounting'],
      keyFeatures: ['wine_management', 'reservation_preferences', 'cost_analysis'],
      defaultConfig: {
        migrationSpeed: 'thorough',
        migrationScope: 'complete',
        focusAreas: ['menu_items', 'customers', 'reservations', 'inventory', 'wine', 'suppliers']
      }
    },
    
    coffeeShop: {
      name: 'Coffee Shop / Cafe',
      description: 'Coffee shops, cafes, bakeries',
      estimatedMigrationTime: '8-15 minutes',
      commonDataSources: ['square_pos', 'loyalty_systems', 'inventory_sheets'],
      keyFeatures: ['loyalty_program', 'mobile_ordering', 'inventory_tracking'],
      defaultConfig: {
        migrationSpeed: 'fast',
        migrationScope: 'complete',
        focusAreas: ['menu_items', 'customers', 'loyalty', 'inventory']
      }
    },
    
    foodTruck: {
      name: 'Food Truck / Mobile',
      description: 'Mobile food vendors and food trucks',
      estimatedMigrationTime: '12-18 minutes',
      commonDataSources: ['square_pos', 'mobile_pos', 'location_tracking'],
      keyFeatures: ['location_management', 'mobile_payments', 'schedule_tracking'],
      defaultConfig: {
        migrationSpeed: 'fast',
        migrationScope: 'essential_only',
        focusAreas: ['menu_items', 'orders', 'locations', 'schedules']
      }
    },
    
    cloudKitchen: {
      name: 'Cloud Kitchen / Ghost Kitchen',
      description: 'Delivery-only virtual restaurants',
      estimatedMigrationTime: '15-25 minutes',
      commonDataSources: ['delivery_platforms', 'kitchen_display', 'inventory_systems'],
      keyFeatures: ['delivery_optimization', 'multi_brand_management', 'efficiency_tracking'],
      defaultConfig: {
        migrationSpeed: 'balanced',
        migrationScope: 'complete',
        focusAreas: ['menu_items', 'orders', 'delivery', 'inventory', 'efficiency']
      }
    },
    
    barPub: {
      name: 'Bar / Pub',
      description: 'Bars, pubs, sports bars',
      estimatedMigrationTime: '20-35 minutes',
      commonDataSources: ['pos_systems', 'beverage_inventory', 'event_management'],
      keyFeatures: ['beverage_management', 'event_booking', 'entertainment_scheduling'],
      defaultConfig: {
        migrationSpeed: 'balanced',
        migrationScope: 'complete',
        focusAreas: ['menu_items', 'beverages', 'customers', 'events', 'inventory']
      }
    }
  },
  
  // Data source templates
  dataSources: {
    posSystemTemplates: {
      square: {
        sourceType: 'square_pos',
        displayName: 'Square POS',
        description: 'Square Point of Sale system',
        dataTypes: ['menu_items', 'customers', 'orders', 'payments', 'employees'],
        estimatedTime: '10-15 minutes',
        connectionFields: ['applicationId', 'accessToken', 'locationId'],
        commonUseCase: 'Small to medium restaurants, coffee shops, retail'
      },
      
      toast: {
        sourceType: 'toast_pos',
        displayName: 'Toast POS',
        description: 'Toast restaurant management platform',
        dataTypes: ['menuItems', 'customers', 'orders', 'employees', 'timeEntries'],
        estimatedTime: '15-25 minutes',
        connectionFields: ['apiKey', 'restaurantGuid', 'managementGroupGuid'],
        commonUseCase: 'Full-service restaurants, multi-location chains'
      },
      
      clover: {
        sourceType: 'clover_pos',
        displayName: 'Clover POS',
        description: 'Clover point of sale system',
        dataTypes: ['items', 'customers', 'orders', 'employees', 'inventory'],
        estimatedTime: '12-20 minutes',
        connectionFields: ['apiToken', 'merchantId'],
        commonUseCase: 'Retail and restaurant businesses'
      },
      
      lightspeed: {
        sourceType: 'lightspeed_pos',
        displayName: 'Lightspeed Restaurant',
        description: 'Lightspeed restaurant POS',
        dataTypes: ['Item', 'Customer', 'Sale', 'Employee', 'Inventory'],
        estimatedTime: '18-28 minutes',
        connectionFields: ['apiKey', 'shopId'],
        commonUseCase: 'Casual and fine dining restaurants'
      }
    },
    
    deliveryPlatformTemplates: {
      doordash: {
        sourceType: 'doordash',
        displayName: 'DoorDash',
        description: 'DoorDash delivery platform',
        dataTypes: ['menu', 'orders', 'deliveries'],
        estimatedTime: '5-10 minutes',
        connectionFields: ['developerId', 'keyId', 'signingSecret'],
        commonUseCase: 'Restaurants with delivery service'
      },
      
      grubhub: {
        sourceType: 'grubhub',
        displayName: 'Grubhub',
        description: 'Grubhub delivery platform',
        dataTypes: ['menu_items', 'orders', 'customers'],
        estimatedTime: '6-12 minutes',
        connectionFields: ['apiKey', 'restaurantId'],
        commonUseCase: 'Restaurants with delivery service'
      },
      
      ubereats: {
        sourceType: 'ubereats',
        displayName: 'Uber Eats',
        description: 'Uber Eats delivery platform',
        dataTypes: ['menu', 'orders'],
        estimatedTime: '4-8 minutes',
        connectionFields: ['clientId', 'clientSecret'],
        commonUseCase: 'Restaurants with delivery service'
      }
    },
    
    accountingSystemTemplates: {
      quickbooks: {
        sourceType: 'quickbooks',
        displayName: 'QuickBooks',
        description: 'QuickBooks accounting software',
        dataTypes: ['customers', 'suppliers', 'financial_data', 'items'],
        estimatedTime: '8-15 minutes',
        connectionFields: ['companyId', 'accessToken', 'refreshToken'],
        commonUseCase: 'Small to medium businesses'
      },
      
      xero: {
        sourceType: 'xero',
        displayName: 'Xero',
        description: 'Xero accounting software',
        dataTypes: ['customers', 'suppliers', 'transactions', 'items'],
        estimatedTime: '10-18 minutes',
        connectionFields: ['tenantId', 'accessToken'],
        commonUseCase: 'Small to medium businesses'
      }
    },
    
    fileBasedTemplates: {
      excel: {
        sourceType: 'excel_sheets',
        displayName: 'Excel/CSV Files',
        description: 'Excel spreadsheets and CSV files',
        dataTypes: ['any_structured_data'],
        estimatedTime: '2-8 minutes',
        connectionFields: ['files', 'mappings'],
        commonUseCase: 'Custom data, inventory lists, staff schedules'
      },
      
      googleSheets: {
        sourceType: 'google_sheets',
        displayName: 'Google Sheets',
        description: 'Google Sheets spreadsheets',
        dataTypes: ['any_structured_data'],
        estimatedTime: '3-10 minutes',
        connectionFields: ['spreadsheetId', 'apiKey'],
        commonUseCase: 'Collaborative data management'
      }
    }
  }
};

// Quick start utilities
export const restaurantQuickStart = {
  // Get recommended configuration for restaurant type
  getRecommendedConfig: (restaurantType: string, dataSources: string[]) => {
    const template = restaurantTemplates.restaurantTypes[restaurantType];
    if (!template) {
      throw new Error(`Unknown restaurant type: ${restaurantType}`);
    }
    
    return {
      ...template.defaultConfig,
      estimatedTime: template.estimatedMigrationTime,
      recommendedDataSources: template.commonDataSources.filter(source => 
        dataSources.includes(source)
      )
    };
  },
  
  // Validate data source configuration
  validateDataSourceConfig: (sourceType: string, connectionInfo: any) => {
    const allTemplates = {
      ...restaurantTemplates.dataSources.posSystemTemplates,
      ...restaurantTemplates.dataSources.deliveryPlatformTemplates,
      ...restaurantTemplates.dataSources.accountingSystemTemplates,
      ...restaurantTemplates.dataSources.fileBasedTemplates
    };
    
    const template = Object.values(allTemplates).find(t => t.sourceType === sourceType);
    if (!template) {
      return { valid: false, error: `Unknown source type: ${sourceType}` };
    }
    
    const missingFields = template.connectionFields.filter(field => 
      !connectionInfo[field]
    );
    
    if (missingFields.length > 0) {
      return { 
        valid: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      };
    }
    
    return { valid: true };
  },
  
  // Estimate migration time based on configuration
  estimateMigrationTime: (config: any) => {
    let totalMinutes = 0;
    
    // Base time for restaurant setup
    totalMinutes += 5;
    
    // Add time for each data source
    for (const dataSource of config.dataSources) {
      const allTemplates = {
        ...restaurantTemplates.dataSources.posSystemTemplates,
        ...restaurantTemplates.dataSources.deliveryPlatformTemplates,
        ...restaurantTemplates.dataSources.accountingSystemTemplates,
        ...restaurantTemplates.dataSources.fileBasedTemplates
      };
      
      const template = Object.values(allTemplates).find(t => t.sourceType === dataSource.sourceType);
      if (template) {
        const [min, max] = template.estimatedTime.split('-').map(t => parseInt(t));
        totalMinutes += (min + max) / 2;
      }
    }
    
    // Adjust for migration speed
    const speedMultipliers = {
      fast: 0.8,
      balanced: 1.0,
      thorough: 1.3
    };
    totalMinutes *= speedMultipliers[config.migrationSpeed] || 1.0;
    
    // Adjust for migration scope
    const scopeMultipliers = {
      essential_only: 0.6,
      complete: 1.0,
      custom: 0.8
    };
    totalMinutes *= scopeMultipliers[config.migrationScope] || 1.0;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  },
  
  // Generate quick migration command
  generateQuickMigration: (restaurantName: string, restaurantType: string, dataSources: any[]) => {
    const organizationId = `org-${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-001`;
    
    return {
      restaurantName,
      restaurantType,
      heraOrganizationId: organizationId,
      dataSources,
      migrationScope: 'complete',
      preserveHistoricalData: true,
      migrationSpeed: 'balanced',
      enableRealTimeSync: true,
      setupMobileAccess: true,
      enableAIInsights: true
    };
  }
};

// Common migration patterns
export const migrationPatterns = {
  // Single POS system migration
  singlePOS: (posType: string, connectionInfo: any, restaurantName: string) => {
    return restaurantQuickStart.generateQuickMigration(
      restaurantName,
      'casual_dining',
      [{
        sourceType: posType,
        connectionInfo,
        dataTypes: ['menu_items', 'customers', 'orders', 'staff'],
        priority: 1
      }]
    );
  },
  
  // Multi-platform restaurant migration
  multiPlatform: (posConfig: any, deliveryConfigs: any[], restaurantName: string) => {
    const dataSources = [
      {
        sourceType: posConfig.sourceType,
        connectionInfo: posConfig.connectionInfo,
        dataTypes: ['menu_items', 'customers', 'orders', 'staff'],
        priority: 1
      },
      ...deliveryConfigs.map((config, index) => ({
        sourceType: config.sourceType,
        connectionInfo: config.connectionInfo,
        dataTypes: ['menu_items', 'orders'],
        priority: index + 2
      }))
    ];
    
    return restaurantQuickStart.generateQuickMigration(
      restaurantName,
      'quick_service',
      dataSources
    );
  },
  
  // Full restaurant ecosystem migration
  fullEcosystem: (configs: any, restaurantName: string, restaurantType: string) => {
    return restaurantQuickStart.generateQuickMigration(
      restaurantName,
      restaurantType,
      configs.dataSources
    );
  }
};

// Export utilities
export const utils = {
  // Generate restaurant organization ID
  generateOrganizationId: (restaurantName: string) => {
    return `org-${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-001`;
  },
  
  // Validate restaurant configuration
  validateRestaurantConfig: (config: any) => {
    const errors = [];
    
    if (!config.restaurantName || config.restaurantName.trim().length === 0) {
      errors.push('Restaurant name is required');
    }
    
    if (!config.restaurantType) {
      errors.push('Restaurant type is required');
    }
    
    if (!config.dataSources || config.dataSources.length === 0) {
      errors.push('At least one data source is required');
    }
    
    if (!config.heraOrganizationId) {
      errors.push('HERA organization ID is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },
  
  // Calculate migration complexity
  calculateComplexity: (config: any) => {
    let complexity = 'simple';
    
    const sourceCount = config.dataSources?.length || 0;
    const hasMultipleLocations = config.locationCount > 1;
    const hasComplexInventory = config.dataSources?.some(ds => 
      ds.dataTypes.includes('inventory') || ds.dataTypes.includes('suppliers')
    );
    
    if (sourceCount > 3 || hasMultipleLocations || hasComplexInventory) {
      complexity = 'complex';
    } else if (sourceCount > 1) {
      complexity = 'moderate';
    }
    
    return complexity;
  }
};

// Export everything for easy access
export default {
  // Main migrator
  UniversalRestaurantMigrator,
  
  // Templates and presets
  restaurantTemplates,
  
  // Quick start utilities
  restaurantQuickStart,
  
  // Common patterns
  migrationPatterns,
  
  // Utilities
  utils
};

/**
 * HERA Universal Restaurant Migration Tool
 * 
 * Revolutionary Features:
 * ✅ One-Click Migration
 *   - Migrate any restaurant in 10-60 minutes
 *   - Support for all major POS systems
 *   - Automatic data source detection
 *   - Zero downtime migration
 * 
 * ✅ Universal Data Consolidation
 *   - Consolidate data from multiple sources
 *   - Intelligent deduplication
 *   - Conflict resolution
 *   - Data quality validation
 * 
 * ✅ Restaurant-Specific Intelligence
 *   - Industry-specific entity mappings
 *   - Restaurant workflow optimization
 *   - Menu structure analysis
 *   - Customer behavior insights
 * 
 * ✅ Real-Time Sync
 *   - Bi-directional data synchronization
 *   - Gradual cutover capability
 *   - Conflict resolution
 *   - Backup and rollback
 * 
 * ✅ Mobile-First Operations
 *   - Staff mobile app setup
 *   - Customer mobile ordering
 *   - Management dashboard
 *   - Offline capability
 * 
 * ✅ AI-Powered Insights
 *   - Customer analytics
 *   - Operational optimization
 *   - Financial insights
 *   - Predictive analytics
 * 
 * Usage Examples:
 * 
 * // Quick coffee shop migration
 * const coffeeShop = await UniversalRestaurantMigrator.migrate({
 *   restaurantName: "Brew & Bean Coffee Co.",
 *   restaurantType: "coffee_shop",
 *   dataSources: [{ sourceType: "square_pos", connectionInfo: {...} }],
 *   heraOrganizationId: "org-brew-bean-001"
 * });
 * 
 * // Multi-platform restaurant migration
 * const restaurant = await UniversalRestaurantMigrator.migrate({
 *   restaurantName: "Mario's Pizza Palace",
 *   restaurantType: "quick_service",
 *   dataSources: [
 *     { sourceType: "toast_pos", connectionInfo: {...} },
 *     { sourceType: "doordash", connectionInfo: {...} },
 *     { sourceType: "quickbooks", connectionInfo: {...} }
 *   ],
 *   heraOrganizationId: "org-marios-pizza-001"
 * });
 */