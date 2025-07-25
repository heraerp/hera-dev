'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, TrendingUp, DollarSign, Users, Zap, Globe, Brain, Mail, User, ExternalLink, FileText } from 'lucide-react';

export default function InvestorPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '' });
  const [contactError, setContactError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper authentication
    if (password === 'NextDecade') {
      setShowContactForm(true);
      setError('');
    } else {
      setError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.name.trim() || !contactInfo.email.trim()) {
      setContactError('Please provide both name and email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      setContactError('Please enter a valid email address.');
      return;
    }
    
    // Store contact info (in production, send to backend/CRM)
    console.log('Investor Contact Info:', contactInfo);
    
    setIsAuthenticated(true);
    setContactError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
              {showContactForm ? <Mail className="h-8 w-8 text-white" /> : <Lock className="h-8 w-8 text-white" />}
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">HERA Investor Portal</h2>
            <p className="text-gray-400">
              {showContactForm ? 'Please provide your contact information' : 'Confidential - Authorized Access Only'}
            </p>
          </div>

          {!showContactForm ? (
            <form onSubmit={handleLogin} className="mt-8 space-y-6">
              <div className="relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter investor password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 px-4 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
              >
                Continue to Contact Form
              </button>
            </form>
          ) : (
            <form onSubmit={handleContactSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="name" className="sr-only">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Full Name"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="email" className="sr-only">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Email Address"
                    />
                  </div>
                </div>
              </div>

              {contactError && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 px-4 rounded-lg">
                  {contactError}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 py-3 px-4 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200"
                >
                  Access Dashboard
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-gray-500">
            Protected by enterprise-grade security
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">HERA Universal Platform</h1>
                <p className="text-gray-400 text-sm">Investor Dashboard - Confidential</p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-4">🚀 Investment Opportunity</h2>
          <p className="text-xl mb-6">World's First Self-Evolving Universal ERP Platform</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">$170B+</div>
              <div className="text-blue-200">Potential Market Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">547x</div>
              <div className="text-blue-200">Faster Than SAP Implementation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">136</div>
              <div className="text-blue-200">AI-Powered Systems Built</div>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <a
              href="/empire"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FileText className="w-5 h-5 mr-2" />
              View Interactive Pitch Deck
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-teal-400" />
              <span className="text-2xl font-bold text-white">99.9%</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Cost Disruption</h3>
            <p className="text-gray-400">vs SAP implementations</p>
            <div className="mt-4 text-sm">
              <div className="text-green-400">HERA: $0 implementation</div>
              <div className="text-red-400">SAP: $2M+ average</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">24 hrs</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Deployment Speed</h3>
            <p className="text-gray-400">Complete ERP system deployment</p>
            <div className="mt-4 text-sm">
              <div className="text-green-400">vs 18+ months SAP</div>
              <div className="text-teal-400">Immediate ROI</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Globe className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">∞</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Scalability</h3>
            <p className="text-gray-400">Universal business adaptability</p>
            <div className="mt-4 text-sm">
              <div className="text-blue-400">Any industry, any size</div>
              <div className="text-purple-400">5 tables handle everything</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Brain className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">AI-Native</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Intelligence</h3>
            <p className="text-gray-400">Built-in across all systems</p>
            <div className="mt-4 text-sm">
              <div className="text-purple-400">Self-evolving capabilities</div>
              <div className="text-pink-400">Autonomous digital accountant</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">$850B</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Market Size</h3>
            <p className="text-gray-400">Total addressable market</p>
            <div className="mt-4 text-sm">
              <div className="text-green-400">Growing 8-12% annually</div>
              <div className="text-emerald-400">Multiple disruption vectors</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-emerald-400" />
              <span className="text-2xl font-bold text-white">2-3yr</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Moat Duration</h3>
            <p className="text-gray-400">Competitive response window</p>
            <div className="mt-4 text-sm">
              <div className="text-emerald-400">Technical complexity barrier</div>
              <div className="text-cyan-400">Network effects advantage</div>
            </div>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6">📊 Market Analysis & Valuation</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Market Segments</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">ERP Market</span>
                  <span className="text-teal-400 font-bold">$50B+</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Business Software</span>
                  <span className="text-blue-400 font-bold">$200B+</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Digital Transformation</span>
                  <span className="text-purple-400 font-bold">$400B+</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">AI/ML Enterprise</span>
                  <span className="text-pink-400 font-bold">$200B+</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Valuation Scenarios</h4>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-green-900/50 to-green-800/50 rounded-lg border border-green-600">
                  <div className="flex justify-between items-center">
                    <span className="text-green-300">Conservative (1%)</span>
                    <span className="text-green-400 font-bold text-xl">$8.5B</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-900/50 to-blue-800/50 rounded-lg border border-blue-600">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">Moderate (5%)</span>
                    <span className="text-blue-400 font-bold text-xl">$42.5B</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-lg border border-purple-600">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300">Aggressive (10%)</span>
                    <span className="text-purple-400 font-bold text-xl">$85B</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-pink-900/50 to-pink-800/50 rounded-lg border border-pink-600">
                  <div className="flex justify-between items-center">
                    <span className="text-pink-300">Transformative (20%)</span>
                    <span className="text-pink-400 font-bold text-xl">$170B</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitive Advantages */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6">🏆 Competitive Advantages</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Universal Architecture</h4>
                  <p className="text-gray-400 text-sm">5 tables handle infinite business complexity vs 200+ rigid ERP tables</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Self-Evolving Intelligence</h4>
                  <p className="text-gray-400 text-sm">System manages its own development using its own architecture</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Zero Implementation Cost</h4>
                  <p className="text-gray-400 text-sm">Template-based deployment vs $2M+ SAP implementations</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Network Effects</h4>
                  <p className="text-gray-400 text-sm">Each deployment improves AI intelligence for all users</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Mobile-First Operations</h4>
                  <p className="text-gray-400 text-sm">Complete ERP operations offline-capable on mobile devices</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="text-white font-semibold">Autonomous Digital Accountant</h4>
                  <p className="text-gray-400 text-sm">World's first CFO assistant with minimal human intervention</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Thesis */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-600">
          <h3 className="text-2xl font-bold text-white mb-6">💎 Investment Thesis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Category Creator</h4>
              <p className="text-gray-300 text-sm">First self-evolving universal ERP platform creates new market category</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Winner-Take-All</h4>
              <p className="text-gray-300 text-sm">Universal architecture creates defensible moat against competition</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Exponential Growth</h4>
              <p className="text-gray-300 text-sm">Zero marginal cost scaling with network effects amplification</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-black/30 rounded-lg">
            <p className="text-white text-lg text-center">
              <strong>HERA represents a once-in-a-decade opportunity to invest in the fundamental transformation of enterprise software—from tools to intelligence.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}