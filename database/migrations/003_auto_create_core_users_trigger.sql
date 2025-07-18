-- Automatic core_users creation trigger
-- This function will automatically create a core_users record when a new auth user is created

-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user into core_users table
  INSERT INTO public.core_users (
    auth_user_id,
    email,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user', -- Default role is 'user'
    true,
    NEW.created_at,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that calls the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to handle user updates (email changes, etc.)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update core_users when auth user is updated
  UPDATE public.core_users
  SET 
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    updated_at = NOW()
  WHERE auth_user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Handle user deletion (soft delete in core_users)
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Soft delete in core_users (set is_active to false)
  UPDATE public.core_users
  SET 
    is_active = false,
    updated_at = NOW()
  WHERE auth_user_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- Test the trigger by creating a test user record for existing users
-- This will ensure your current user gets properly linked
DO $$
DECLARE
    auth_user_record RECORD;
BEGIN
    -- Loop through all auth users that don't have core_users records
    FOR auth_user_record IN 
        SELECT au.* 
        FROM auth.users au
        LEFT JOIN core_users cu ON cu.auth_user_id = au.id
        WHERE cu.auth_user_id IS NULL
    LOOP
        -- Create core_users record for existing auth users
        INSERT INTO core_users (
            auth_user_id,
            email,
            full_name,
            role,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            auth_user_record.id,
            auth_user_record.email,
            COALESCE(auth_user_record.raw_user_meta_data->>'full_name', auth_user_record.email),
            CASE 
                WHEN auth_user_record.email = 'santhoshlal@gmail.com' THEN 'admin'
                ELSE 'user'
            END,
            true,
            auth_user_record.created_at,
            NOW()
        );
    END LOOP;
END $$;

-- Verify all users are properly linked
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created,
    cu.id as core_user_id,
    cu.email as core_email,
    cu.role,
    cu.is_active,
    cu.created_at as core_created
FROM auth.users au
LEFT JOIN core_users cu ON cu.auth_user_id = au.id
ORDER BY au.created_at;