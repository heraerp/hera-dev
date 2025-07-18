import UniversalCrudService from '@/lib/services/universalCrudService';
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    
    if (!error && data.user) {
      // For email confirmations, we need to determine the redirect path
      // If next is specified and it's not default, use it
      if (next !== "/") {
        redirect(next);
      } else {
        // Check if user has existing organizations
        const { data: organizations, error: orgError } = await supabase
          .from('user_organizations')
          .select('organization_id')
          .eq('user_id', data.user.id)
          .eq('is_active', true)
          .limit(1);
        
        if (orgError) {
          console.warn('Error checking organizations:', orgError.message);
          redirect('/setup'); // Default to setup on error
        } else if (organizations && organizations.length > 0) {
          // User has organizations, redirect to restaurant (or could be made smarter)
          redirect('/restaurant');
        } else {
          // New user, redirect to solution selector
          redirect('/setup');
        }
      }
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
