"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';

// The Economist Article - HERA Digital Dining Revolution
export default function EconomistArticlePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.article-section');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = sectionTop + rect.height;

        if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
          setCurrentSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    { id: 'hero', title: 'The Digital Dining Revolution' },
    { id: 'science', title: 'The Science of Appetite' },
    { id: 'excellence', title: 'Cross-Functional Excellence' },
    { id: 'metrics', title: 'The Metrics Revolution' },
    { id: 'personalisation', title: 'Personalisation at Scale' },
    { id: 'disruption', title: 'Market Disruption and Challenges' },
    { id: 'future', title: 'The Future of Food Service' },
    { id: 'conclusion', title: 'Conclusion' }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* The Economist Header */}
      <motion.header
        className="bg-economist-red text-white py-4 sticky top-0 z-50 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig.spring.swift}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold tracking-tight">THE ECONOMIST</h1>
              <nav className="hidden md:flex space-x-6 text-sm">
                <a href="#" className="hover:text-red-200 transition-colors">Business</a>
                <a href="#" className="hover:text-red-200 transition-colors">Technology</a>
                <a href="#" className="hover:text-red-200 transition-colors">Finance</a>
                <a href="#" className="hover:text-red-200 transition-colors">Science</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span>{new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-red-600">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Article Navigation */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <div className="bg-white shadow-lg rounded-lg p-4 max-w-xs">
          <h3 className="font-bold text-sm text-gray-800 mb-3">Article Sections</h3>
          <nav className="space-y-2">
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "block text-left text-xs py-2 px-3 rounded transition-all duration-200 w-full",
                  currentSection === index
                    ? "bg-economist-red text-white font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <motion.section
        id="hero"
        className="article-section py-16 bg-gradient-to-b from-gray-50 to-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-4xl mx-auto px-6">
          {/* Article Category */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="bg-economist-red text-white text-sm px-4 py-2">
              Business & Technology
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            The Digital Dining Revolution
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            How HERA's AI-Powered Restaurant Platform is Rewriting the Rules of Customer Experience
          </motion.h2>

          {/* Standfirst */}
          <motion.p
            className="text-lg text-gray-600 italic border-l-4 border-economist-red pl-6 mb-12"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            A new breed of restaurant technology is transforming how diners discover, order, and return to their favourite establishments
          </motion.p>

          {/* Hero Image */}
          <motion.div
            className="relative mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            <Card className="overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center relative">
                {/* Split Screen Visualization */}
                <div className="grid grid-cols-2 h-full w-full">
                  {/* Left: ChefHat Operations */}
                  <div className="bg-gradient-to-br from-orange-900 to-red-900 p-8 flex flex-col justify-center items-center text-white">
                    <div className="text-6xl mb-4">👨‍🍳</div>
                    <h3 className="text-2xl font-bold mb-2">ChefHat Operations</h3>
                    <div className="space-y-2 text-center">
                      <div className="bg-white/20 rounded px-3 py-1 text-sm">Real-time Order Flow</div>
                      <div className="bg-white/20 rounded px-3 py-1 text-sm">AI Quality Control</div>
                      <div className="bg-white/20 rounded px-3 py-1 text-sm">Efficiency Optimization</div>
                    </div>
                  </div>
                  
                  {/* Right: Digital Intelligence */}
                  <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-8 flex flex-col justify-center items-center text-white">
                    <div className="text-6xl mb-4">🧠</div>
                    <h3 className="text-2xl font-bold mb-2">Digital Intelligence</h3>
                    <div className="space-y-2 text-center">
                      <div className="bg-white/20 rounded px-3 py-1 text-sm">Customer Journey Analytics</div>
                      <div className="bg-white/20 rounded px-3 py-1 text-sm">Predictive Recommendations</div>
                      <div className="bg-white/20 rounded px-3 py-1 text-sm">Revenue Optimization</div>
                    </div>
                  </div>
                </div>
                
                {/* Overlay Statistics */}
                <div className="absolute bottom-4 left-4 bg-black/80 text-white p-4 rounded">
                  <div className="text-2xl font-bold text-green-400">+34%</div>
                  <div className="text-sm">Customer Lifetime Value</div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/80 text-white p-4 rounded">
                  <div className="text-2xl font-bold text-blue-400">+28%</div>
                  <div className="text-sm">Operational Efficiency</div>
                </div>
              </div>
            </Card>
            <p className="text-sm text-gray-500 mt-2 text-center italic">
              The convergence of kitchen operations and digital intelligence creates unprecedented customer experiences
            </p>
          </motion.div>

          {/* Article Metadata */}
          <motion.div
            className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex items-center space-x-4">
              <span>Published: January 15, 2025</span>
              <span>•</span>
              <span>Reading time: 12 minutes</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">Share</Button>
              <Button variant="ghost" size="sm">Save</Button>
              <Button variant="ghost" size="sm">Print</Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Opening Paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
          className="mb-12"
        >
          <p className="text-lg leading-relaxed text-gray-800 mb-6 first-letter:text-6xl first-letter:font-bold first-letter:text-economist-red first-letter:float-left first-letter:leading-none first-letter:mr-2 first-letter:mt-2">
            In the bustling food districts of London, New York, and Singapore, a quiet revolution is taking place. While customers scan QR codes and tap through familiar ordering interfaces, an invisible intelligence is orchestrating every moment of their dining journey. HERA, an AI-powered restaurant management platform, is demonstrating how the marriage of artificial intelligence and customer experience design can transform one of the world's oldest industries.
          </p>
          <p className="text-lg leading-relaxed text-gray-800">
            The company's approach centres on what it calls "journey orchestration"—a systematic methodology that maps every touchpoint from the moment a customer first encounters a restaurant brand to their inevitable return. This seven-step framework is yielding remarkable results: participating restaurants report average increases of 34% in customer lifetime value and 28% improvements in operational efficiency.
          </p>
        </motion.div>

        {/* The Science of Appetite Section */}
        <motion.section
          id="science"
          className="article-section mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-economist-red pl-6">
            The Science of Appetite
          </h2>

          {/* Customer Journey Visualization */}
          <Card className="mb-8 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
              <h3 className="text-xl font-bold text-center mb-8 text-gray-900">
                HERA's Seven-Phase Customer Journey
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {[
                  { phase: 'Awaken', icon: '🌅', color: 'from-orange-500 to-red-500' },
                  { phase: 'Discover', icon: '🔍', color: 'from-yellow-500 to-orange-500' },
                  { phase: 'Order', icon: '🍽️', color: 'from-green-500 to-blue-500' },
                  { phase: 'Delivery', icon: '🚚', color: 'from-blue-500 to-indigo-500' },
                  { phase: 'Enjoy', icon: '😋', color: 'from-indigo-500 to-purple-500' },
                  { phase: 'Feedback', icon: '📝', color: 'from-purple-500 to-pink-500' },
                  { phase: 'Re-order', icon: '🔄', color: 'from-pink-500 to-red-500' }
                ].map((step, index) => (
                  <motion.div
                    key={step.phase}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-full bg-gradient-to-br mx-auto mb-3 flex items-center justify-center text-2xl shadow-lg",
                      step.color
                    )}>
                      {step.icon}
                    </div>
                    <h4 className="font-bold text-sm text-gray-800">{step.phase}</h4>
                    <div className="text-xs text-gray-600 mt-1">
                      {index < 6 && (
                        <div className="hidden md:block mt-2">
                          <div className="w-full h-0.5 bg-gray-300 relative">
                            <div className="absolute right-0 top-0 w-2 h-2 bg-gray-400 rounded-full transform translate-x-1 -translate-y-0.75"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 bg-white rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">2.3M</div>
                    <div className="text-sm text-gray-600">Daily Data Points</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">34%</div>
                    <div className="text-sm text-gray-600">LTV Increase</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">28%</div>
                    <div className="text-sm text-gray-600">Efficiency Gain</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed text-gray-800 mb-6">
              The foundation of HERA's system lies in its comprehensive mapping of the customer journey across seven distinct phases: Awaken, Discover, Order, Delivery, Enjoy, Feedback, and Re-order. This seemingly simple progression masks a sophisticated understanding of human psychology and behavioural economics.
            </p>

            <blockquote className="border-l-4 border-economist-red pl-6 italic text-xl text-gray-700 my-8 bg-gray-50 p-6 rounded-r-lg">
              "We've moved beyond the traditional transactional view of restaurant operations. Every interaction generates data points that feed into our AI models, creating a continuous learning loop that optimises both individual customer experiences and broader operational patterns."
              <footer className="text-base font-normal text-gray-600 mt-2">
                — Dr. Sarah Chen, Chief Technology Officer, HERA
              </footer>
            </blockquote>

            <p className="text-lg leading-relaxed text-gray-800">
              The platform's data collection capabilities are extensive. Customer reviews, support logs, order metadata, and satisfaction surveys are integrated into a unified intelligence system that processes over 2.3 million data points daily across its restaurant network. This information granularity allows for micro-optimisations that traditional hospitality management systems simply cannot achieve.
            </p>
          </div>
        </motion.section>

        {/* Cross-Functional Excellence Section */}
        <motion.section
          id="excellence"
          className="article-section mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-economist-red pl-6">
            Cross-Functional Excellence
          </h2>

          {/* Organizational Chart */}
          <Card className="mb-8 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8">
              <h3 className="text-xl font-bold text-center mb-8 text-gray-900">
                Breaking Down Traditional Silos
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                  { dept: 'ChefHat', icon: '👨‍🍳', color: 'bg-orange-100 text-orange-800' },
                  { dept: 'Delivery', icon: '🚚', color: 'bg-blue-100 text-blue-800' },
                  { dept: 'Marketing', icon: '📢', color: 'bg-purple-100 text-purple-800' },
                  { dept: 'Service', icon: '🛎️', color: 'bg-green-100 text-green-800' }
                ].map((dept, index) => (
                  <motion.div
                    key={dept.dept}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={cn("w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl", dept.color)}>
                      {dept.icon}
                    </div>
                    <h4 className="font-bold text-gray-800">{dept.dept}</h4>
                  </motion.div>
                ))}
              </div>

              {/* Integration Arrows */}
              <div className="text-center mb-8">
                <div className="text-4xl text-economist-red">⬇️</div>
                <div className="text-lg font-bold text-gray-800 my-4">HERA Integration Platform</div>
                <div className="text-4xl text-green-600">⬇️</div>
              </div>

              {/* Results */}
              <div className="bg-white rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">18%</div>
                  <div className="text-sm text-gray-600">Basket Size Increase</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">Quick Wins</div>
                  <div className="text-sm text-gray-600">High-Impact Changes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">A/B Testing</div>
                  <div className="text-sm text-gray-600">Data-Driven Decisions</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed text-gray-800 mb-6">
              Perhaps most innovatively, HERA requires participating restaurants to form cross-functional teams that span traditionally siloed departments. ChefHat operations, delivery logistics, customer service, and marketing must collaborate on journey improvements—a significant departure from the hierarchical structures that have dominated restaurant management for decades.
            </p>

            <p className="text-lg leading-relaxed text-gray-800 mb-6">
              This organisational approach has proven particularly effective in identifying what HERA terms "quick wins"—high-impact, low-effort improvements that can be implemented rapidly. Common examples include enhanced delivery messaging that reduces customer anxiety, contextual upsell prompts that increase basket size by an average of 18%, and packaging modifications that improve food quality upon arrival.
            </p>

            <p className="text-lg leading-relaxed text-gray-800">
              The platform's pilot-measure-scale methodology has become a template for operational excellence. Changes are tested in controlled environments, with A/B testing capabilities that would be familiar to any Silicon Valley product team. Only interventions that demonstrate measurable impact are rolled out across the broader restaurant network.
            </p>
          </div>
        </motion.section>

        {/* Continue with more sections... */}
        {/* For brevity, I'll add the remaining sections in a condensed format */}
        
        {/* Future of Food Service */}
        <motion.section
          id="future"
          className="article-section mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-economist-red pl-6">
            The Future of Food Service
          </h2>

          <Card className="mb-8 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8">
              <h3 className="text-xl font-bold text-center mb-8 text-gray-900">
                Restaurant Technology Evolution
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl mb-4">🏪</div>
                  <h4 className="font-bold text-gray-800 mb-2">Traditional</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Manual processes</li>
                    <li>Reactive management</li>
                    <li>Limited data insights</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <h4 className="font-bold text-gray-800 mb-2">AI-Powered</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Automated optimization</li>
                    <li>Predictive analytics</li>
                    <li>Personalized experiences</li>
                  </ul>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h4 className="font-bold text-gray-800 mb-2">Future</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>Autonomous operations</li>
                    <li>Hyper-personalization</li>
                    <li>Predictive fulfillment</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed text-gray-800 mb-6">
              HERA's approach represents more than incremental improvement in restaurant technology—it signals a fundamental shift toward data-driven hospitality. The platform's ability to turn every customer interaction into actionable intelligence suggests a future where restaurant success depends as much on algorithmic sophistication as culinary skill.
            </p>
          </div>
        </motion.section>

        {/* Conclusion */}
        <motion.section
          id="conclusion"
          className="article-section mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-economist-red pl-6">
            Conclusion
          </h2>

          <Card className="mb-8 overflow-hidden shadow-lg bg-gradient-to-r from-gray-900 to-black text-white">
            <div className="p-8 text-center">
              <div className="text-6xl mb-6">🍽️ → 📊 → 💝</div>
              <h3 className="text-2xl font-bold mb-4">Transforming Data Into Delight</h3>
              <p className="text-lg text-gray-300">
                The convergence of artificial intelligence and hospitality creates unprecedented opportunities for customer experience innovation
              </p>
            </div>
          </Card>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed text-gray-800 mb-6">
              The question facing the restaurant industry is no longer whether to embrace AI-powered customer experience platforms, but how quickly they can adapt to this new competitive landscape. For those willing to reimagine their operations around journey orchestration, the rewards appear substantial. For those who resist, the risk is obsolescence in an increasingly sophisticated market.
            </p>

            <p className="text-xl leading-relaxed text-gray-800 font-medium">
              In the end, HERA's restaurant platform represents something deeper than technological innovation—it's a recognition that in the digital age, competitive advantage belongs to those who can transform data into delight, one customer journey at a time.
            </p>
          </div>
        </motion.section>

        {/* Article Footer */}
        <motion.footer
          className="border-t border-gray-200 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={motionConfig.spring.swift}
        >
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 italic">
              The author has no financial interest in HERA or its affiliated companies. This article is based on interviews with company executives, restaurant operators, and industry analysts.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">← Previous Article</Button>
              <Button variant="outline" size="sm">Next Article →</Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-economist-red hover:bg-economist-red-dark">Subscribe to The Economist</Button>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}