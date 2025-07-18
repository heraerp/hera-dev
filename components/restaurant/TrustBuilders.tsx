'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  Phone, 
  MessageCircle,
  Download,
  Clock,
  DollarSign,
  Users,
  Star,
  Award,
  FileText,
  Zap,
  Globe,
  Database,
  Headphones,
  Video,
  BookOpen,
  Heart,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export function TrustBuilders() {
  const [selectedTab, setSelectedTab] = useState('guarantee');

  const securityFeatures = [
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'SSL encryption, SOC 2 Type II certified, GDPR compliant',
      status: 'Certified'
    },
    {
      icon: Lock,
      title: 'Data Privacy',
      description: 'Your data never shared, local storage options available',
      status: 'Guaranteed'
    },
    {
      icon: Database,
      title: 'Data Ownership',
      description: 'You own your data, export anytime, no lock-in',
      status: 'Always Yours'
    }
  ];

  const supportOptions = [
    {
      icon: Phone,
      title: '24/7 Phone Support',
      description: 'Speak to a restaurant expert anytime',
      response: 'Under 30 seconds',
      availability: 'Always'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Instant help with AI-powered responses',
      response: 'Instant',
      availability: '24/7'
    },
    {
      icon: Video,
      title: 'Screen Sharing Help',
      description: 'We\'ll walk you through any issue',
      response: '5 minutes',
      availability: 'Business hours'
    },
    {
      icon: BookOpen,
      title: 'Learning Center',
      description: '500+ tutorials and guides',
      response: 'Self-serve',
      availability: 'Always'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Owner, The Corner Bistro',
      rating: 5,
      quote: 'Hesitant at first, but HERA delivered on every promise. ROI in 3 weeks.',
      beforeAfter: { waste: '15% → 4%', profit: '12% → 18%' },
      timeframe: '6 months using HERA'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Manager, Fast Fuel Burgers',
      rating: 5,
      quote: 'The AI predictions are uncanny. Never run out of popular items anymore.',
      beforeAfter: { stockouts: '12/month → 0', sales: '$45K → $52K' },
      timeframe: '4 months using HERA'
    },
    {
      name: 'Lisa Chen',
      role: 'Owner, Dragon Palace',
      rating: 5,
      quote: 'Best investment we ever made. The time savings alone are worth it.',
      beforeAfter: { hours: '60hrs/week → 45hrs/week', stress: 'High → Low' },
      timeframe: '8 months using HERA'
    }
  ];

  const certifications = [
    { name: 'SOC 2 Type II', icon: Shield, status: 'Certified' },
    { name: 'PCI DSS Level 1', icon: Lock, status: 'Compliant' },
    { name: 'GDPR Compliant', icon: Globe, status: 'Verified' },
    { name: 'HIPAA Ready', icon: FileText, status: 'Available' }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Risk-Free Restaurant Transformation
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We understand trying new software is risky. That's why we've eliminated every risk 
              with industry-leading guarantees, support, and security.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guarantee">Money-Back Guarantee</TabsTrigger>
          <TabsTrigger value="security">Security & Privacy</TabsTrigger>
          <TabsTrigger value="support">24/7 Support</TabsTrigger>
          <TabsTrigger value="testimonials">Success Stories</TabsTrigger>
        </TabsList>

        <TabsContent value="guarantee" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>30-Day Money-Back Guarantee</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">
                  Our Promise to You
                </h3>
                <p className="text-green-700 mb-4">
                  If HERA doesn't save you money within 30 days, we'll refund every penny 
                  and help you export all your data. No questions asked.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700">Full refund guaranteed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700">Keep all your data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700">No cancellation fees</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700">No long-term contracts</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="text-center p-4">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">Try Risk-Free</h4>
                  <p className="text-sm text-gray-600">30 days to see results</p>
                </Card>
                
                <Card className="text-center p-4">
                  <Download className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">Keep Your Data</h4>
                  <p className="text-sm text-gray-600">Export anytime, any format</p>
                </Card>
                
                <Card className="text-center p-4">
                  <RefreshCw className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800">Cancel Anytime</h4>
                  <p className="text-sm text-gray-600">No hidden fees or penalties</p>
                </Card>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">95% of customers see savings in week 1</h4>
                    <p className="text-sm text-blue-700">
                      Average customer saves $2,400/month, with many seeing results in just 7 days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    <Badge className="bg-green-100 text-green-800">{feature.status}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-gold-600" />
                <span>Security Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {certifications.map((cert) => (
                  <div key={cert.name} className="text-center p-4 bg-gray-50 rounded-lg">
                    <cert.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-gray-800 text-sm">{cert.name}</h4>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {cert.status}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Data Protection Promise</h4>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Your restaurant data is encrypted at rest and in transit. We never share, 
                  sell, or use your data for any purpose other than providing our service.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {supportOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <option.icon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">{option.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Response time:</span>
                          <span className="font-medium text-green-600">{option.response}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500">Availability:</span>
                          <span className="font-medium text-blue-600">{option.availability}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-600" />
                <span>Customer Success Team</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">JM</span>
                  </div>
                  <h4 className="font-semibold text-gray-800">Jessica Martinez</h4>
                  <p className="text-sm text-gray-600">Restaurant Success Manager</p>
                  <p className="text-xs text-gray-500 mt-1">15 years restaurant experience</p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">RP</span>
                  </div>
                  <h4 className="font-semibold text-gray-800">Robert Park</h4>
                  <p className="text-sm text-gray-600">Technical Support Lead</p>
                  <p className="text-xs text-gray-500 mt-1">Expert in POS integrations</p>
                </div>
                
                <div className="text-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AS</span>
                  </div>
                  <h4 className="font-semibold text-gray-800">Amanda Smith</h4>
                  <p className="text-sm text-gray-600">AI Training Specialist</p>
                  <p className="text-xs text-gray-500 mt-1">Helps optimize your AI setup</p>
                </div>
              </div>
              
              <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Headphones className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">Dedicated Onboarding</h4>
                </div>
                <p className="text-sm text-orange-700 mt-2">
                  Every new customer gets a dedicated success manager for the first 30 days 
                  to ensure you're getting maximum value from HERA.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500 mt-1">{testimonial.timeframe}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 italic mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    {Object.entries(testimonial.beforeAfter).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-sm text-gray-600 capitalize">{key}</p>
                        <p className="font-semibold text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Join 500+ Happy Restaurant Owners
              </h3>
              <p className="text-gray-600 mb-4">
                Average customer satisfaction: 4.8/5 stars
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <div>
                  <p className="font-bold text-2xl text-blue-600">98%</p>
                  <p className="text-gray-600">Success Rate</p>
                </div>
                <div>
                  <p className="font-bold text-2xl text-green-600">$2,400</p>
                  <p className="text-gray-600">Avg Monthly Savings</p>
                </div>
                <div>
                  <p className="font-bold text-2xl text-purple-600">7 days</p>
                  <p className="text-gray-600">To See Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Final CTA */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Transform Your Restaurant Risk-Free?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Join hundreds of restaurants saving money with HERA's AI-powered system
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              <Zap className="h-5 w-5 mr-2" />
              Start 30-Day Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Phone className="h-5 w-5 mr-2" />
              Talk to Expert
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm opacity-75">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>30-day guarantee</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>24/7 support</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>No setup fees</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}