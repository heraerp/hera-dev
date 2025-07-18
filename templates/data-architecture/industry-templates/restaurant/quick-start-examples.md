# Universal Restaurant Migration - Quick Start Examples

**Ready-to-use migration examples for any restaurant type. Copy, customize, and execute in minutes.**

## 🚀 **1-Click Migration Examples**

### **Example 1: Coffee Shop with Square POS**
```typescript
import { UniversalRestaurantMigrator } from '@/templates/data-architecture/industry-templates/restaurant'

// Migrate "Brew & Bean Coffee Co." in under 10 minutes
const coffeeShopMigration = await UniversalRestaurantMigrator.migrate({
  // Restaurant Details
  restaurantName: "Brew & Bean Coffee Co.",
  restaurantType: "coffee_shop",
  cuisineType: "Coffee & Light Fare",
  locationCount: 1,
  
  // Data Sources
  dataSources: [
    {
      sourceType: "square_pos",
      connectionInfo: {
        applicationId: "sq0idp-your-app-id",
        accessToken: "EAAAEOz1ZuCvXJP...", // Your Square access token
        locationId: "L1234567890" // Your location ID
      },
      dataTypes: ["menu_items", "customers", "orders", "payments"],
      priority: 1
    }
  ],
  
  // Migration Settings
  migrationScope: "complete",
  preserveHistoricalData: true,
  migrationSpeed: "fast",
  
  // HERA Configuration
  heraOrganizationId: "org-brew-bean-coffee-001",
  enableRealTimeSync: true,
  setupMobileAccess: true,
  enableAIInsights: true
});

// Expected Result: 8-12 minutes, 100% success rate
console.log(`✅ Coffee shop migrated in ${coffeeShopMigration.duration}`);
```

### **Example 2: Pizza Restaurant with Multiple Sources**
```typescript
// Migrate "Mario's Pizza Palace" with Toast POS + DoorDash + QuickBooks
const pizzaRestaurantMigration = await UniversalRestaurantMigrator.migrate({
  restaurantName: "Mario's Pizza Palace",
  restaurantType: "quick_service",
  cuisineType: "Italian Pizza",
  locationCount: 2,
  
  dataSources: [
    {
      sourceType: "toast_pos",
      connectionInfo: {
        apiKey: "toast_api_key_here",
        restaurantGuid: "12345678-abcd-1234-abcd-123456789abc"
      },
      dataTypes: ["menu_items", "customers", "orders", "staff"],
      priority: 1
    },
    {
      sourceType: "doordash",
      connectionInfo: {
        developerId: "your_developer_id",
        keyId: "your_key_id",
        signingSecret: "your_signing_secret"
      },
      dataTypes: ["menu_items", "orders"],
      priority: 2
    },
    {
      sourceType: "quickbooks",
      connectionInfo: {
        companyId: "123456789",
        accessToken: "qb_access_token_here",
        refreshToken: "qb_refresh_token_here"
      },
      dataTypes: ["customers", "suppliers", "financial_data"],
      priority: 3
    }
  ],
  
  migrationScope: "complete",
  heraOrganizationId: "org-marios-pizza-palace-001",
  enableRealTimeSync: true
});

// Expected Result: 25-35 minutes, consolidates all data sources
```

### **Example 3: Fine Dining with Complex Setup**
```typescript
// Migrate "The Golden Spoon" fine dining restaurant
const fineDiningMigration = await UniversalRestaurantMigrator.migrate({
  restaurantName: "The Golden Spoon",
  restaurantType: "fine_dining",
  cuisineType: "Contemporary American",
  locationCount: 1,
  
  dataSources: [
    {
      sourceType: "lightspeed_pos",
      connectionInfo: {
        apiKey: "lightspeed_api_key",
        shopId: "12345"
      },
      dataTypes: ["menu_items", "customers", "orders", "staff", "inventory"],
      priority: 1
    },
    {
      sourceType: "excel_sheets",
      connectionInfo: {
        files: [
          { 
            name: "wine_inventory.xlsx", 
            type: "inventory",
            path: "/uploads/wine_inventory.xlsx",
            mapping: {
              "Wine Name": "product_name",
              "Vintage": "vintage_year", 
              "Price": "price",
              "Bottles in Stock": "quantity",
              "Cost per Bottle": "cost"
            }
          },
          {
            name: "supplier_contacts.xlsx",
            type: "suppliers", 
            path: "/uploads/suppliers.xlsx",
            mapping: {
              "Company Name": "supplier_name",
              "Contact Person": "contact_name",
              "Phone": "phone",
              "Email": "email",
              "Specialty": "product_category"
            }
          },
          {
            name: "staff_schedule.xlsx",
            type: "staff_schedules",
            path: "/uploads/schedules.xlsx"
          }
        ]
      },
      dataTypes: ["inventory", "suppliers", "staff_schedules"],
      priority: 2
    }
  ],
  
  migrationScope: "complete",
  preserveHistoricalData: true,
  migrationSpeed: "thorough", // More detailed analysis for fine dining
  heraOrganizationId: "org-golden-spoon-001",
  enableRealTimeSync: true,
  setupMobileAccess: true,
  enableAIInsights: true
});

// Expected Result: 45-60 minutes, includes wine inventory and complex staff scheduling
```

## 📊 **Industry-Specific Quick Starts**

### **Food Truck Migration**
```typescript
const foodTruckMigration = await UniversalRestaurantMigrator.migrate({
  restaurantName: "Gourmet on Wheels",
  restaurantType: "food_truck",
  cuisineType: "Fusion Tacos",
  locationCount: 1, // Mobile location
  
  dataSources: [
    {
      sourceType: "square_pos",
      connectionInfo: {
        // Mobile Square Reader setup
        applicationId: "sq0idp-mobile-app-id",
        accessToken: "mobile_access_token",
        locationId: "mobile_location_id"
      },
      dataTypes: ["menu_items", "customers", "orders", "payments"],
      priority: 1
    },
    {
      sourceType: "excel_sheets",
      connectionInfo: {
        files: [
          {
            name: "locations_schedule.xlsx",
            type: "locations",
            mapping: {
              "Date": "service_date",
              "Location": "location_name",
              "Start Time": "start_time",
              "End Time": "end_time",
              "Expected Sales": "sales_forecast"
            }
          }
        ]
      },
      dataTypes: ["locations", "schedules"],
      priority: 2
    }
  ],
  
  migrationScope: "essential_only", // Focus on core operations
  heraOrganizationId: "org-gourmet-wheels-001",
  enableRealTimeSync: true,
  setupMobileAccess: true // Critical for food trucks
});
```

### **Cloud Kitchen Migration**
```typescript
const cloudKitchenMigration = await UniversalRestaurantMigrator.migrate({
  restaurantName: "Virtual Eats Kitchen",
  restaurantType: "cloud_kitchen",
  cuisineType: "Multi-Concept Virtual Brands",
  locationCount: 1,
  
  dataSources: [
    {
      sourceType: "grubhub",
      connectionInfo: {
        apiKey: "grubhub_api_key",
        restaurantId: "12345"
      },
      dataTypes: ["menu_items", "orders"],
      priority: 1
    },
    {
      sourceType: "doordash",
      connectionInfo: {
        developerId: "doordash_dev_id",
        keyId: "doordash_key"
      },
      dataTypes: ["menu_items", "orders"],
      priority: 1
    },
    {
      sourceType: "ubereats",
      connectionInfo: {
        clientId: "uber_client_id",
        clientSecret: "uber_client_secret"
      },
      dataTypes: ["menu_items", "orders"],
      priority: 1
    },
    {
      sourceType: "custom_website",
      connectionInfo: {
        apiEndpoint: "https://api.virtualeats.com",
        apiKey: "website_api_key"
      },
      dataTypes: ["menu_items", "orders", "customers"],
      priority: 2
    }
  ],
  
  migrationScope: "complete",
  heraOrganizationId: "org-virtual-eats-001",
  enableRealTimeSync: true, // Critical for multiple delivery platforms
  enableAIInsights: true // Important for delivery optimization
});
```

## 🔧 **Data Source Connection Examples**

### **Square POS Connection**
```typescript
const squareConnection = {
  sourceType: "square_pos",
  connectionInfo: {
    // From Square Developer Dashboard
    applicationId: "sq0idp-ABC123DEF456",
    accessToken: "EAAAEOz1ZuCvXJP1234567890abcdef",
    locationId: "L1234567890ABCDEF", // Your specific location
    
    // Optional: Environment
    environment: "production", // or "sandbox" for testing
    
    // Optional: Specific data date ranges
    dateRange: {
      startDate: "2024-01-01",
      endDate: "2024-12-31"
    }
  },
  dataTypes: ["menu_items", "customers", "orders", "payments", "employees"],
  priority: 1
};
```

### **Toast POS Connection**
```typescript
const toastConnection = {
  sourceType: "toast_pos",
  connectionInfo: {
    // From Toast Integration Partner Portal
    apiKey: "sk_test_1234567890abcdef",
    restaurantGuid: "12345678-abcd-1234-abcd-123456789abc",
    managementGroupGuid: "87654321-dcba-4321-dcba-987654321fed",
    
    // Authentication
    clientId: "toast_client_id",
    clientSecret: "toast_client_secret",
    
    // Data scope
    includeClosedOrders: true,
    includeVoidedOrders: false,
    maxOrderAge: 90 // days
  },
  dataTypes: ["menuItems", "customers", "orders", "employees", "timeEntries"],
  priority: 1
};
```

### **DoorDash Connection**
```typescript
const doorDashConnection = {
  sourceType: "doordash",
  connectionInfo: {
    // From DoorDash Developer Portal
    developerId: "your_developer_id",
    keyId: "your_key_id",
    signingSecret: "your_signing_secret",
    
    // Store information
    storeId: "12345",
    businessId: "67890",
    
    // API configuration
    baseUrl: "https://openapi.doordash.com",
    version: "v1"
  },
  dataTypes: ["menu", "orders", "deliveries"],
  priority: 2
};
```

### **Excel/CSV File Connection**
```typescript
const excelConnection = {
  sourceType: "excel_sheets",
  connectionInfo: {
    files: [
      {
        name: "menu_items.xlsx",
        type: "menu_items",
        path: "/uploads/menu_items.xlsx",
        sheetName: "Menu", // Optional: specific sheet
        headerRow: 1, // Row containing column headers
        dataStartRow: 2, // First row of data
        mapping: {
          // Excel Column -> HERA Field
          "Item Name": "product_name",
          "Description": "description", 
          "Price": "price",
          "Category": "category",
          "Available": "is_available",
          "Cost": "cost",
          "Prep Time": "prep_time_minutes"
        }
      },
      {
        name: "customer_list.csv",
        type: "customers",
        path: "/uploads/customers.csv",
        delimiter: ",", // CSV delimiter
        encoding: "utf-8",
        mapping: {
          "First Name": "first_name",
          "Last Name": "last_name",
          "Email": "email",
          "Phone": "phone",
          "Join Date": "created_date",
          "Loyalty Points": "loyalty_points"
        }
      }
    ]
  },
  dataTypes: ["menu_items", "customers"],
  priority: 3
};
```

## 🎯 **Quick Setup by Restaurant Size**

### **Small Restaurant (1 location, <50 items)**
```typescript
const smallRestaurantSetup = {
  migrationScope: "essential_only",
  migrationSpeed: "fast",
  dataSources: ["primary_pos"], // Usually just one POS system
  estimatedTime: "5-15 minutes",
  
  focusAreas: [
    "menu_items",
    "basic_customers", 
    "recent_orders"
  ],
  
  skipAreas: [
    "detailed_analytics",
    "complex_inventory",
    "advanced_staff_scheduling"
  ]
};
```

### **Medium Restaurant (2-3 locations, 50-200 items)**
```typescript
const mediumRestaurantSetup = {
  migrationScope: "complete",
  migrationSpeed: "balanced",
  dataSources: ["pos", "delivery_platform", "accounting"],
  estimatedTime: "20-40 minutes",
  
  focusAreas: [
    "complete_menu_structure",
    "customer_database",
    "order_history",
    "basic_inventory",
    "staff_management"
  ],
  
  advancedFeatures: [
    "multi_location_reporting",
    "delivery_integration",
    "loyalty_program"
  ]
};
```

### **Large Restaurant (4+ locations, 200+ items)**
```typescript
const largeRestaurantSetup = {
  migrationScope: "complete",
  migrationSpeed: "thorough",
  dataSources: ["multiple_pos", "delivery_platforms", "accounting", "inventory", "scheduling"],
  estimatedTime: "45-90 minutes",
  
  focusAreas: [
    "complex_menu_structure",
    "complete_customer_profiles",
    "full_order_history", 
    "detailed_inventory",
    "advanced_staff_management",
    "financial_integration"
  ],
  
  enterpriseFeatures: [
    "multi_location_analytics",
    "centralized_inventory",
    "franchise_reporting",
    "advanced_forecasting"
  ]
};
```

## 📱 **Mobile App Quick Setup**

### **Enable Mobile Access During Migration**
```typescript
const mobileSetup = {
  setupMobileAccess: true,
  mobileFeatures: {
    // Staff mobile app
    staffApp: {
      orderTaking: true,
      inventoryManagement: true,
      scheduleViewing: true,
      salesReporting: true
    },
    
    // Customer mobile experience
    customerApp: {
      mobileOrdering: true,
      loyaltyProgram: true,
      reservations: true, // If applicable
      orderTracking: true
    },
    
    // Management mobile dashboard
    managementApp: {
      realTimeAnalytics: true,
      staffManagement: true,
      inventoryAlerts: true,
      financialReporting: true
    }
  }
};
```

## 🔄 **Real-Time Sync Configuration**

### **Bi-Directional Sync Setup**
```typescript
const realTimeSyncConfig = {
  enableRealTimeSync: true,
  syncConfiguration: {
    // What to sync
    syncEntities: [
      "menu_items",     // Menu changes appear everywhere
      "inventory",      // Stock levels stay current
      "orders",         // New orders appear in all systems
      "customers",      // Customer updates reflected everywhere
      "staff"           // Staff schedule changes sync
    ],
    
    // How often to sync
    syncFrequency: "real-time", // or "every_5_minutes", "hourly"
    
    // Conflict resolution
    conflictResolution: {
      menu_items: "hera_wins",     // HERA overrides other systems
      inventory: "last_write_wins", // Most recent update wins
      orders: "source_wins",       // Original system wins
      customers: "merge"           // Merge data from all sources
    },
    
    // Backup sync for reliability
    backupSync: {
      frequency: "hourly",
      fullSync: "daily_at_3am"
    }
  }
};
```

## 🚀 **One-Command Migration**

### **Complete Restaurant Migration (Any Size)**
```typescript
// Universal migration command that works for any restaurant
const quickMigration = await UniversalRestaurantMigrator.migrate({
  // Basic info (customize these 3 lines)
  restaurantName: "Your Restaurant Name",
  restaurantType: "casual_dining", // quick_service, fine_dining, coffee_shop, etc.
  heraOrganizationId: "org-your-restaurant-001",
  
  // Data sources (add your connections)
  dataSources: [
    // Add your POS system
    {
      sourceType: "square_pos", // or toast_pos, clover_pos, etc.
      connectionInfo: {
        // Your POS connection details here
      },
      dataTypes: ["menu_items", "customers", "orders"],
      priority: 1
    },
    // Add additional sources as needed
  ],
  
  // Smart defaults (works for most restaurants)
  migrationScope: "complete",
  preserveHistoricalData: true,
  migrationSpeed: "balanced",
  enableRealTimeSync: true,
  setupMobileAccess: true,
  enableAIInsights: true
});

// That's it! Your restaurant is now powered by HERA Universal
console.log(`🎉 ${quickMigration.restaurantName} migrated successfully!`);
console.log(`📊 ${quickMigration.summary.recordsMigrated} records migrated in ${quickMigration.duration}`);
console.log(`🚀 Ready to serve customers with AI-powered efficiency!`);
```

## 📞 **Support & Troubleshooting**

### **Common Issues & Solutions**

**Connection Failed**
```typescript
// If POS connection fails, try:
const retryConnection = {
  connectionInfo: {
    // ... your connection details
    timeout: 30000, // Increase timeout
    retryAttempts: 3,
    retryDelay: 5000
  }
};
```

**Partial Data Migration**
```typescript
// If some data doesn't migrate, check:
const dataValidation = {
  validateBeforeMigration: true,
  skipInvalidRecords: true,
  generateDataReport: true,
  logMissingFields: true
};
```

**Performance Optimization**
```typescript
// For large datasets, optimize with:
const performanceConfig = {
  migrationSpeed: "fast", // Prioritize speed over thoroughness
  batchSize: 500, // Smaller batches for slower connections
  parallelProcessing: false, // Disable for stability
  skipHistoricalData: true // Only migrate recent data
};
```

The Universal Restaurant Migration Tool makes it effortless to bring any restaurant into HERA Universal. Choose the example that matches your restaurant type, customize the connection details, and execute the migration. Your restaurant will be serving customers with AI-powered efficiency in minutes, not months.