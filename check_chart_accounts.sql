-- Check Chart of Accounts in HERA
SELECT 
  ce.id,
  ce.entity_name,
  ce.entity_code,
  ce.entity_type,
  STRING_AGG(
    CONCAT(cdd.field_name, ': ', cdd.field_value),
    ', '
  ) as account_details
FROM core_entities ce
LEFT JOIN core_dynamic_data cdd ON ce.id = cdd.entity_id
WHERE ce.entity_type LIKE '%account%' 
  OR ce.entity_type = 'chart_of_account'
  OR ce.entity_name ILIKE '%account%'
  OR ce.entity_code ILIKE '%acc%'
GROUP BY ce.id, ce.entity_name, ce.entity_code, ce.entity_type
ORDER BY ce.entity_code;
EOF < /dev/null