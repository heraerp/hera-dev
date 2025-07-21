const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function analyzeAccountHierarchy() {
  console.log('🏗️ Analyzing HERA Chart of Accounts Hierarchy...\n');

  try {
    // Get account hierarchy relationships
    const { data: relationships, error: relError } = await supabase
      .from('core_relationships')
      .select(`
        *,
        parent_entity:core_entities!parent_entity_id(id, entity_name, entity_code),
        child_entity:core_entities!child_entity_id(id, entity_name, entity_code)
      `)
      .eq('relationship_type', 'hera_account_hierarchy')
      .order('parent_entity_id, child_entity_id');

    if (relError) {
      console.error('Error fetching relationships:', relError);
      return;
    }

    console.log(`📊 Found ${relationships?.length || 0} account hierarchy relationships:`);
    
    // Group relationships by parent
    const hierarchyMap = {};
    relationships?.forEach(rel => {
      const parentCode = rel.parent_entity?.entity_code;
      if (!hierarchyMap[parentCode]) {
        hierarchyMap[parentCode] = {
          parent: rel.parent_entity,
          children: []
        };
      }
      hierarchyMap[parentCode].children.push(rel.child_entity);
    });

    // Display hierarchy
    console.log('\n🌳 Account Hierarchy Structure:');
    Object.entries(hierarchyMap).forEach(([parentCode, { parent, children }]) => {
      console.log(`\n${parentCode} - ${parent.entity_name}`);
      children.forEach(child => {
        console.log(`  └── ${child.entity_code} - ${child.entity_name}`);
      });
    });

    // Get number ranges to understand the numbering pattern
    const { data: numberRanges, error: rangeError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'account_number_range')
      .order('entity_code');

    if (!rangeError && numberRanges) {
      console.log('\n📊 Number Range Configuration:');
      for (const range of numberRanges) {
        const { data: rangeData } = await supabase
          .from('core_dynamic_data')
          .select('field_name, field_value')
          .eq('entity_id', range.id);

        const rangeDetails = rangeData?.reduce((acc, field) => {
          acc[field.field_name] = field.field_value;
          return acc;
        }, {});

        console.log(`\n  ${range.entity_code} - ${range.entity_name}:`);
        console.log(`    Range: ${rangeDetails?.range_start} - ${rangeDetails?.range_end}`);
        console.log(`    Current: ${rangeDetails?.current_number}`);
        console.log(`    Classification: ${rangeDetails?.account_classification}`);
      }
    }

    // Analyze main category accounts
    const { data: mainCategories, error: mainError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'hera_account')
      .order('entity_code');

    if (!mainError && mainCategories) {
      const categoryAccounts = mainCategories.filter(acc => 
        ['1000000', '2000000', '3000000', '4000000', '5000000'].includes(acc.entity_code)
      );

      console.log('\n🏛️ Main Account Categories:');
      for (const category of categoryAccounts) {
        const { data: categoryData } = await supabase
          .from('core_dynamic_data')
          .select('field_name, field_value')
          .eq('entity_id', category.id);

        const details = categoryData?.reduce((acc, field) => {
          acc[field.field_name] = field.field_value;
          return acc;
        }, {});

        console.log(`\n  ${category.entity_code} - ${category.entity_name}:`);
        console.log(`    Classification: ${details?.account_classification}`);
        console.log(`    Level: ${details?.hierarchy_level}`);
        console.log(`    Normal Balance: ${details?.normal_balance}`);
        console.log(`    Statement: ${details?.financial_statement}`);
        console.log(`    Posting Allowed: ${details?.posting_allowed}`);
      }
    }

  } catch (error) {
    console.error('Error analyzing hierarchy:', error);
  }
}

analyzeAccountHierarchy();