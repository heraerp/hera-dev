'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  ChefHat,
  Users,
  CreditCard,
  Settings,
  Crown,
  UserCheck
} from 'lucide-react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { RestaurantRole } from '@/types/restaurant-auth';

interface StaffLoginProps {
  onLoginSuccess?: () => void;
  redirectTo?: string;
}

const StaffLogin: React.FC<StaffLoginProps> = ({ onLoginSuccess, redirectTo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RestaurantRole | null>(null);

  const { login, isAuthenticated } = useRestaurantAuth();

  useEffect(() => {
    if (isAuthenticated && onLoginSuccess) {
      onLoginSuccess();
    }
  }, [isAuthenticated, onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await login({ email, password });
      
      if (!result.success) {
        setError(result.error?.message || 'Login failed');
      } else {
        // Success handled by useEffect
        if (redirectTo) {
          window.location.href = redirectTo;
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (role: RestaurantRole) => {
    const demoCredentials = {
      admin: { email: 'admin@restaurant.demo', password: 'demo123' },
      manager: { email: 'manager@restaurant.demo', password: 'demo123' },
      waiter: { email: 'waiter@restaurant.demo', password: 'demo123' },
      chef: { email: 'chef@restaurant.demo', password: 'demo123' },
      cashier: { email: 'cashier@restaurant.demo', password: 'demo123' },
      host: { email: 'host@restaurant.demo', password: 'demo123' }
    };

    const credentials = demoCredentials[role];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setSelectedRole(role);

    // Auto-submit after a brief delay
    setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 500);
  };

  const getRoleIcon = (role: RestaurantRole) => {
    switch (role) {
      case 'admin': return <Crown className="w-5 h-5" />;
      case 'manager': return <Settings className="w-5 h-5" />;
      case 'waiter': return <Users className="w-5 h-5" />;
      case 'chef': return <ChefHat className="w-5 h-5" />;
      case 'cashier': return <CreditCard className="w-5 h-5" />;
      case 'host': return <UserCheck className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: RestaurantRole) => {
    switch (role) {
      case 'admin': return 'from-purple-500 to-purple-600';
      case 'manager': return 'from-blue-500 to-blue-600';
      case 'waiter': return 'from-green-500 to-green-600';
      case 'chef': return 'from-orange-500 to-orange-600';
      case 'cashier': return 'from-emerald-500 to-emerald-600';
      case 'host': return 'from-cyan-500 to-cyan-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const roleDescriptions = {
    admin: 'Full system access and management',
    manager: 'Oversee operations and staff',
    waiter: 'Take orders and serve customers',
    chef: 'Manage kitchen and prepare orders',
    cashier: 'Process payments and transactions',
    host: 'Greet customers and manage seating'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/icons/hera-logo.png" 
              alt="HERA Logo" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-bold text-white">HERA Restaurant</h1>
          </div>
          <p className="text-slate-300 text-lg">Staff Portal</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Login Options */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-white/10 backdrop-blur-xl border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">
                Quick Login (Demo)
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {(['admin', 'manager', 'waiter', 'chef', 'cashier', 'host'] as RestaurantRole[]).map((role) => (
                  <motion.button
                    key={role}
                    onClick={() => quickLogin(role)}
                    disabled={isLoading}
                    className={`relative p-4 rounded-xl bg-gradient-to-r ${getRoleColor(role)} text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedRole === role ? 'ring-2 ring-white/50 scale-105' : ''
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {getRoleIcon(role)}
                      <span className="font-semibold capitalize">{role}</span>
                      <span className="text-xs opacity-90 text-center">
                        {roleDescriptions[role]}
                      </span>
                    </div>
                    
                    {selectedRole === role && isLoading && (
                      <motion.div
                        className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                <p className="text-blue-200 text-sm text-center">
                  <strong>Demo Mode:</strong> Click any role above to instantly login with that user's permissions
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Manual Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 bg-white/10 backdrop-blur-xl border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6 text-center">
                Staff Login
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <span className="text-red-200 text-sm">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold"
                  leftIcon={
                    isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-5 h-5" />
                    )
                  }
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-400 text-sm">
                  Forgot your password?{' '}
                  <button className="text-blue-400 hover:text-blue-300 font-medium">
                    Contact your manager
                  </button>
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-slate-400 text-sm"
        >
          <p>HERA Restaurant Management System</p>
          <p>© 2024 All rights reserved</p>
        </motion.div>
      </div>
    </div>
  );
};

export default StaffLogin;