"use client"

import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, Check, ArrowRight, Sparkles, Zap, Heart, Globe, Shield, Rocket } from 'lucide-react';
import { AuthRedirect } from '@/components/auth-redirect';
import UniversalCrudService from '@/lib/services/universalCrudService';

const HERALandingPage = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.warn('Auth check error:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // If user is authenticated, show the auth redirect component
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <AuthRedirect />;
  }

  // Landing page state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});
  const [currentDemo, setCurrentDemo] = useState(0);

  // Landing page effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const demos = [
    { type: "Restaurant", time: "2.3s", color: "from-amber-500 to-orange-500" },
    { type: "Law Firm", time: "1.8s", color: "from-blue-500 to-indigo-500" },
    { type: "Medical Clinic", time: "2.1s", color: "from-emerald-500 to-green-500" },
    { type: "Architecture Firm", time: "1.9s", color: "from-violet-500 to-purple-500" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [demos.length]);

  const testimonials = [
    {
      quote: "HERA understood my dog grooming business better than software costing 100x more.",
      author: "Sarah Chen",
      company: "Pawsome Grooming",
      result: "40% more bookings, 60% less admin time"
    },
    {
      quote: "Built our entire architecture firm's system during lunch break.",
      author: "Marcus Rodriguez", 
      company: "Rodriguez & Associates",
      result: "$50K saved, 3x faster delivery"
    },
    {
      quote: "It's like having a CTO who actually understands restaurants.",
      author: "Kim Patel",
      company: "Spice Route Restaurants",
      result: "25% cost reduction, zero stockouts"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 overflow-hidden">
      {/* Floating cursor effect */}
      <div 
        className="fixed w-6 h-6 pointer-events-none z-50 mix-blend-difference"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, transparent 70%)',
          borderRadius: '50%',
          transition: 'transform 0.1s ease-out'
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/icons/hera-logo.png" 
              alt="HERA Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-semibold tracking-tight text-slate-800">HERA</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-600 hover:text-slate-800 transition-colors font-medium">Demo</a>
            <a href="#" className="text-slate-600 hover:text-slate-800 transition-colors font-medium">Pricing</a>
            <a href="#" className="text-slate-600 hover:text-slate-800 transition-colors font-medium">Support</a>
          </div>
          <a href="/auth/sign-up" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-medium inline-block">
            Start Building
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-2.5 rounded-full border border-slate-200/50 mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700 tracking-wide">Any Business. One HERA.</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 leading-none text-slate-800">
            Business Software
            <br />
            <span className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 bg-clip-text text-transparent font-medium">
              That Actually Thinks
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-12 font-light leading-relaxed max-w-3xl mx-auto">
            Stop forcing your business into rigid software. Start with software that molds to your business in minutes, not months.
          </p>

          {/* Demo Interface */}
          <div className="relative max-w-2xl mx-auto mb-12">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg px-4 py-2">
                  <span className="text-sm text-slate-500 font-medium">hera.build</span>
                </div>
              </div>
              
              <div className="text-left space-y-4">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-blue-100/70">
                  <p className="text-slate-700 italic font-medium">
                    "I run a boutique law firm specializing in intellectual property cases."
                  </p>
                </div>
                
                <div className="flex items-center justify-center py-4">
                  <div className="bg-gradient-to-r from-slate-700 to-slate-600 w-8 h-8 rounded-full flex items-center justify-center animate-spin shadow-lg">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Complete case management",
                    "Client billing & time tracking", 
                    "Document management with AI",
                    "Court deadline tracking",
                    "Compliance reporting",
                    "Financial dashboards"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center space-x-2 bg-emerald-50 px-3 py-2.5 rounded-lg border border-emerald-100/50">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center pt-4">
                  <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg">
                    <Check className="w-5 h-5" />
                    <span>Ready to use in 3 minutes</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="/auth/sign-up" className="group bg-gradient-to-r from-slate-800 to-slate-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center space-x-2">
              <span>Start Building Your System</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <button className="group flex items-center space-x-3 text-slate-600 hover:text-slate-800 transition-colors">
              <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow border border-slate-200/50">
                <Play className="w-5 h-5 ml-1 text-slate-600" />
              </div>
              <span className="font-semibold">Watch 90-Second Demo</span>
            </button>
          </div>
          
          <p className="text-sm text-slate-500 mt-6 font-medium">
            Free forever for small businesses. No credit card required.
          </p>
        </div>
      </section>

      {/* Real-time Demo Carousel */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-white">
              Watch HERA Build
              <span className="block bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent">
                Any Business System
              </span>
            </h2>
            <p className="text-xl text-slate-300 font-light">Live examples building in real-time</p>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {demos.map((demo, index) => (
                <div 
                  key={index}
                  className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/10 transition-all duration-500 ${
                    currentDemo === index ? 'scale-105 shadow-2xl' : 'scale-95 opacity-60'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${demo.color} opacity-15`}></div>
                  <div className="relative p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Globe className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{demo.type}</h3>
                    <div className="text-2xl font-light mb-2 text-slate-200">{demo.time}</div>
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-white transition-all duration-3000 ${
                          currentDemo === index ? 'w-full' : 'w-0'
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-slate-800">
              Real Businesses,
              <span className="block text-slate-600">Real Results</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="flex items-center space-x-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Heart key={i} className="w-5 h-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-lg text-slate-700 mb-6 font-light leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="border-t border-slate-100 pt-6">
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500 mb-3 font-medium">{testimonial.company}</div>
                    <div className="text-sm font-semibold text-emerald-600">{testimonial.result}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50/50 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-slate-800">
              Why HERA Changes
              <span className="block text-slate-600">Everything</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "3-Minute Setup",
                description: "Describe your business. Watch it build itself. Start working immediately.",
                color: "from-amber-500 to-orange-500"
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Any Business Type",
                description: "Restaurants, law firms, hospitals, consulting. HERA adapts to everything.",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Enterprise Security",
                description: "Bank-grade security, SOC 2 compliance, automatic backups included.",
                color: "from-emerald-500 to-green-500"
              },
              {
                icon: <Rocket className="w-8 h-8" />,
                title: "Grows With You",
                description: "Add new services, locations, or workflows instantly. Never outgrow HERA.",
                color: "from-slate-600 to-slate-700"
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Zero Learning Curve",
                description: "Works exactly like you think. No training manuals or confusing interfaces.",
                color: "from-rose-500 to-pink-500"
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "AI-Powered Intelligence",
                description: "Invisible AI that makes everything smarter, faster, and more efficient.",
                color: "from-violet-500 to-purple-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-6 text-slate-800">
              Pricing That
              <span className="block text-emerald-600">Makes Sense</span>
            </h2>
            <p className="text-xl text-slate-600 font-light">No contracts. Cancel anytime. 30-day money-back guarantee.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free Forever",
                price: "$0",
                description: "Perfect for solo entrepreneurs & small teams",
                features: ["Up to 2 team members", "1,000 transactions/month", "Core business management", "Mobile & web access", "Community support"],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Professional",
                price: "$29",
                period: "/user/month",
                description: "Growing businesses that need more power",
                features: ["Unlimited team members", "Unlimited transactions", "Advanced analytics", "API access & integrations", "Priority support", "Custom workflows"],
                cta: "Start Professional",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "Large organizations & complex requirements",
                features: ["Multi-location management", "Advanced compliance", "Custom integrations", "Dedicated success manager", "SLA guarantees", "White-label options"],
                cta: "Book Demo",
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`relative rounded-3xl p-8 ${plan.popular ? 'bg-gradient-to-br from-slate-800 to-slate-700 text-white scale-105 shadow-2xl border border-slate-600' : 'bg-white shadow-lg border border-slate-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-light ${plan.popular ? 'text-white' : 'text-slate-800'}`}>{plan.price}</span>
                    {plan.period && <span className={`text-lg ${plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>{plan.period}</span>}
                  </div>
                  <p className={`${plan.popular ? 'text-slate-300' : 'text-slate-600'} font-medium`}>{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-slate-300' : 'text-emerald-500'}`} />
                      <span className={`${plan.popular ? 'text-slate-300' : 'text-slate-700'} font-medium`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a href="/auth/sign-up" className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg block text-center ${
                  plan.popular 
                    ? 'bg-white text-slate-800 hover:shadow-xl' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-light mb-6 leading-tight text-white">
            Ready to Stop Fighting
            <span className="block bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent">
              Your Software?
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 font-light leading-relaxed">
            Join 50,000+ businesses who chose evolution over frustration.
          </p>

          <div className="relative max-w-lg mx-auto mb-12">
            <input 
              type="text" 
              placeholder="My business is..."
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-6 py-4 text-white placeholder-slate-300 text-lg focus:outline-none focus:border-white/40 transition-all"
            />
            <a href="/auth/sign-up" className="absolute right-2 top-2 bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2 shadow-lg">
              <span className="font-semibold">Build</span>
              <Rocket className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm text-slate-400 font-medium">
            Takes 3 minutes. Free forever for small businesses.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-16 px-6 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  src="/icons/hera-logo.png" 
                  alt="HERA Logo" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <div className="text-2xl font-semibold text-white mb-1">HERA</div>
                  <div className="text-sm text-slate-400 font-medium">by Hanaset, Inc</div>
                </div>
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-6 max-w-md font-medium">
                The first business platform that actually thinks like you do. 
                Making enterprise software feel like your favorite mobile app.
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="text-slate-400 font-medium">Hanaset, Inc</div>
                <div className="text-slate-300">8 The Green STE B</div>
                <div className="text-slate-300">Dover, Delaware, DE - 19901</div>
                <div className="text-slate-300">United States</div>
              </div>
            </div>
            
            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Features</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Pricing</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Demo</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">API Documentation</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Integration</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Security</a></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Support</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Help Center</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Contact Support</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">System Status</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Community</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Training</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors font-medium">Changelog</a></li>
              </ul>
            </div>
          </div>
          
          {/* Newsletter Signup */}
          <div className="border-t border-slate-700/50 pt-12 mb-12">
            <div className="max-w-2xl">
              <h3 className="text-white font-semibold mb-3 text-xl">Stay Updated</h3>
              <p className="text-slate-300 mb-6 font-medium">
                Get the latest updates on new features, industry insights, and product announcements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Enter your email address"
                  className="flex-1 bg-white/5 backdrop-blur-xl border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 transition-all font-medium"
                />
                <button className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-8 py-3 rounded-xl hover:scale-105 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-slate-700/50 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              {/* Legal Links */}
              <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Data Processing</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Accessibility</a>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center hover:bg-slate-600/50 transition-colors">
                  <span className="text-slate-300 text-sm font-bold">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center hover:bg-slate-600/50 transition-colors">
                  <span className="text-slate-300 text-sm font-bold">in</span>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center hover:bg-slate-600/50 transition-colors">
                  <span className="text-slate-300 text-sm font-bold">yt</span>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center hover:bg-slate-600/50 transition-colors">
                  <span className="text-slate-300 text-sm font-bold">gh</span>
                </a>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="mt-8 pt-6 border-t border-slate-700/30 text-center">
              <p className="text-slate-400 text-sm font-medium">
                © 2024 Hanaset, Inc. All rights reserved. 
                <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                  Built by a team that believes technology should work for humans, not the other way around.
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HERALandingPage;