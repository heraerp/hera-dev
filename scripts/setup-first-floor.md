# First Floor Restaurant Setup Guide

This guide helps you set up the First Floor Indian multi-cuisine restaurant data in your Supabase database.

## Prerequisites

1. **Supabase Project**: Ensure you have a Supabase project with the HERA Universal Schema tables:
   - `core_organizations`
   - `core_entities`
   - `core_dynamic_data`
   - `ai_schema_registry`
   - `ai_schema_components`
   - `universal_transactions`
   - `universal_transaction_lines`

2. **Database Access**: You need admin access to your Supabase database.

## Setup Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the "SQL Editor" tab

2. **Execute the Data Script**
   - Copy the contents of `first-floor-data.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute all the INSERT statements

3. **Verify the Data**
   ```sql
   -- Check organization
   SELECT * FROM core_organizations WHERE id = 'first-floor-restaurant';
   
   -- Check menu items
   SELECT COUNT(*) FROM core_entities WHERE organization_id = 'first-floor-restaurant' AND entity_type = 'menu_item';
   
   -- Check dynamic data
   SELECT COUNT(*) FROM core_dynamic_data WHERE entity_id LIKE 'menu-%';
   ```

### Option 2: Using psql Command Line

1. **Get Database Connection Details**
   - From Supabase Dashboard → Settings → Database
   - Copy the connection string

2. **Execute Script**
   ```bash
   psql "your-connection-string" -f scripts/first-floor-data.sql
   ```

### Option 3: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login and Link Project**
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Execute Script**
   ```bash
   supabase db push
   ```

## Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Data Overview

The script creates the following data:

### Restaurant Organization
- **Name**: First Floor
- **Type**: Indian Multi-Cuisine
- **ID**: `first-floor-restaurant`

### Menu Items (20 items total)
- **Appetizers**: Paneer Tikka, Chicken 65, Vegetable Samosa, Fish Tikka, Mutton Seekh Kebab
- **Soups**: Tomato Soup, Sweet Corn Soup
- **Main Courses**: Butter Chicken, Palak Paneer, Dal Makhani, Fish Curry, Mutton Curry, Chicken Curry
- **Rice**: Vegetable Biryani, Chicken Biryani, Mutton Biryani
- **Breads**: Garlic Naan, Tandoori Roti
- **Desserts**: Gulab Jamun, Kulfi
- **Beverages**: Mango Lassi, Masala Chai

### Staff (6 members)
- Rajesh Kumar (Head Waiter)
- Priya Sharma (Waiter)
- Amit Singh (Chef)
- Sunita Devi (Sous Chef)
- Ravi Gupta (Waiter)
- Meera Joshi (Cashier)

### Tables (10 tables)
- Various capacities (2, 4, 6, 8 people)
- Different locations (window, center, corner, private)

### Sample Customers (5 customers)
- With dietary preferences and allergies
- Spice tolerance levels

### Sample Orders (3 orders)
- Complete order history with transaction lines
- Demonstrates order workflow

### Inventory Items (5 items)
- Basic ingredients with quantities and suppliers

## Verification Queries

After setup, run these queries to verify everything is working:

```sql
-- 1. Check menu categories
SELECT 
    JSON_EXTRACT_PATH_TEXT(metadata, 'category') as category,
    COUNT(*) as item_count
FROM core_entities 
WHERE organization_id = 'first-floor-restaurant' 
    AND entity_type = 'menu_item'
GROUP BY JSON_EXTRACT_PATH_TEXT(metadata, 'category');

-- 2. Check menu items with prices
SELECT 
    e.name,
    d.field_value as price,
    JSON_EXTRACT_PATH_TEXT(e.metadata, 'category') as category
FROM core_entities e
JOIN core_dynamic_data d ON e.id = d.entity_id
WHERE e.organization_id = 'first-floor-restaurant' 
    AND e.entity_type = 'menu_item'
    AND d.field_name = 'price'
ORDER BY category, e.name;

-- 3. Check AI recommended items
SELECT 
    e.name,
    d.field_value as ai_recommended,
    JSON_EXTRACT_PATH_TEXT(e.metadata, 'category') as category
FROM core_entities e
JOIN core_dynamic_data d ON e.id = d.entity_id
WHERE e.organization_id = 'first-floor-restaurant' 
    AND e.entity_type = 'menu_item'
    AND d.field_name = 'ai_recommended'
    AND d.field_value = 'true'
ORDER BY category;

-- 4. Check staff and their roles
SELECT 
    e.name,
    JSON_EXTRACT_PATH_TEXT(e.metadata, 'role') as role
FROM core_entities e
WHERE e.organization_id = 'first-floor-restaurant' 
    AND e.entity_type = 'staff'
ORDER BY e.name;
```

## Next Steps

1. **Test the Restaurant Order System**
   - Navigate to `/restaurant/order` in your app
   - Verify menu items load from the database
   - Test order placement and AI recommendations

2. **Customize the Data**
   - Add more menu items as needed
   - Update prices and descriptions
   - Add more staff members or tables

3. **Configure Real-time Updates**
   - Enable Supabase Realtime for live order updates
   - Set up webhooks for order status changes

## Troubleshooting

### Common Issues

1. **Tables Don't Exist**
   - Ensure you've created the HERA Universal Schema tables first
   - Check the database schema in Supabase Dashboard

2. **Permission Errors**
   - Verify your Supabase service role key has the correct permissions
   - Check RLS (Row Level Security) policies

3. **Data Not Loading in App**
   - Verify environment variables are correct
   - Check browser console for Supabase connection errors
   - Ensure the organization_id matches in your app

### Support

If you encounter issues:
1. Check Supabase logs in the Dashboard
2. Verify all environment variables
3. Test database connection with simple queries
4. Check network connectivity to Supabase

The First Floor restaurant is now ready to demonstrate the power of HERA's Universal Schema Architecture!