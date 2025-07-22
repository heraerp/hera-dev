'use client';

import { useEffect, useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('registrationEmail');
    const storedRestaurantName = localStorage.getItem('restaurantName');
    
    if (!storedEmail) {
      // Redirect to registration if no email found
      router.push('/auth/register-restaurant');
    } else {
      setEmail(storedEmail);
      setRestaurantName(storedRestaurantName || 'Your Restaurant');
    }
  }, [router]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage('');
    setResendError('');

    try {
      // In a real implementation, this would call an API to resend the verification email
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setResendMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setResendError('Failed to resend email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    // Clear stored data and go back to registration
    localStorage.removeItem('registrationEmail');
    localStorage.removeItem('restaurantName');
    router.push('/auth/register-restaurant');
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 Almost There!
            </h1>
            
            <p className="text-lg text-gray-700 mb-6">
              Your restaurant "{restaurantName}" is ready!
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <Mail className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700 mb-2">
                Check your email to verify your account
              </p>
              <p className="text-sm text-gray-600 mb-4">
                We sent a verification link to:
              </p>
              <p className="font-medium text-gray-900 text-lg">
                {email}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isResending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Sending...
                  </>
                ) : (
                  'Resend Email'
                )}
              </button>

              <button
                onClick={handleChangeEmail}
                className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Change Email Address
              </button>
            </div>

            {resendMessage && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{resendMessage}</span>
              </div>
            )}

            {resendError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{resendError}</span>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                This link expires in 24 hours. If you don't see the email, check your spam folder.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Already verified? Sign in →
          </a>
        </div>
      </div>
    </div>
  );
}