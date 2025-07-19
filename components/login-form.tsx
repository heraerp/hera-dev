"use client";

import { cn } from "@/lib/utils";
import UniversalCrudService from '@/lib/services/universalCrudService';
import { createClient } from "@/lib/supabase/client";
import { UniversalThemeButton } from "@/components/theme/UniversalThemeButton";
import { UniversalCard, UniversalCardContent, UniversalCardHeader, UniversalCardTitle } from "@/components/theme/UniversalCard";
import { UniversalInput } from "@/components/theme/UniversalInput";
import { useMobileTheme } from "@/hooks/useMobileTheme";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { colors } = useMobileTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // First, try regular Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Check if we have a development mode user in localStorage
        const devUserData = localStorage.getItem('dev_user_data');
        if (devUserData) {
          const devUser = JSON.parse(devUserData);
          if (devUser.email === email) {
            console.log('🧪 Development mode: Using simulated login');
            console.log('👤 Dev user:', devUser);
            
            // Store dev session in localStorage
            localStorage.setItem('dev_session', JSON.stringify({
              user: devUser,
              access_token: `dev_token_${Date.now()}`,
              expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            }));
            
            // Redirect to dashboard
            router.push('/dashboard');
            return;
          }
        }
        
        throw error;
      }
      
      // Regular Supabase login successful
      // Import auth utils dynamically to avoid circular dependencies
      const { AuthUtils } = await import("@/lib/auth/auth-utils");
      
      // Get the appropriate redirect path based on user's organizations
      const redirectPath = await AuthUtils.getPostAuthRedirectPath(data.user?.id);
      router.push(redirectPath);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <UniversalCard variant="elevated" padding="lg">
        <UniversalCardHeader>
          <UniversalCardTitle className="text-2xl">Login</UniversalCardTitle>
          <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
            Enter your email below to login to your account
          </p>
        </UniversalCardHeader>
        <UniversalCardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <UniversalInput
                  type="email"
                  label="Email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm underline-offset-4 hover:underline"
                    style={{ color: colors.orange }}
                  >
                    Forgot your password?
                  </Link>
                </div>
                <UniversalInput
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: colors.error }}>
                  {error}
                </p>
              )}
              {/* Development mode notice */}
              {typeof window !== 'undefined' && localStorage.getItem('dev_user_data') && (
                <div className="text-xs p-2 rounded border" style={{ 
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.textSecondary 
                }}>
                  🧪 <strong>Development Mode:</strong> Use the email from your recent signup to login
                </div>
              )}
              <UniversalThemeButton
                variant="primary"
                size="lg"
                fullWidth
                loading={isLoading}
                onClick={handleLogin}
              >
                {isLoading ? "Logging in..." : "Login"}
              </UniversalThemeButton>
            </div>
            <div className="mt-4 text-center text-sm">
              <span style={{ color: colors.textSecondary }}>
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4 hover:underline"
                style={{ color: colors.orange }}
              >
                Sign up
              </Link>
            </div>
          </form>
        </UniversalCardContent>
      </UniversalCard>
    </div>
  );
}
