-- ============================================================================
-- Add Test Analytics Function
-- ============================================================================

-- Create a simple test analytics function
CREATE OR REPLACE FUNCTION public.get_test_analytics(
  p_organization_id UUID,
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL
)
RETURNS TABLE(
  total_executions BIGINT,
  total_passed BIGINT,
  total_failed BIGINT,
  average_duration NUMERIC,
  success_rate NUMERIC
) AS $$
BEGIN
  -- For now, return simple mock analytics
  -- In the full implementation, this would query actual test execution data
  RETURN QUERY
  SELECT 
    3::BIGINT as total_executions,
    15::BIGINT as total_passed,
    0::BIGINT as total_failed,
    1245.5::NUMERIC as average_duration,
    100.0::NUMERIC as success_rate;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_test_analytics TO authenticated;