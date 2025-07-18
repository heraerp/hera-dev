'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useConversionTracking } from '@/lib/analytics/conversion-tracking';
import { 
  Star, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock,
  MapPin,
  Quote,
  CheckCircle,
  Award,
  Zap,
  BarChart3,
  ThumbsUp,
  MessageCircle,
  Heart,
  Eye,
  Timer
} from 'lucide-react';

interface SocialProofProps {
  variant?: 'testimonials' | 'live_activity' | 'stats' | 'reviews' | 'notifications';
  className?: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  restaurant: string;
  location: string;
  quote: string;
  rating: number;
  savings: string;
  timeframe: string;
  beforeAfter: {
    metric: string;
    before: string;
    after: string;
  }[];
  avatar: string;
  verified: boolean;
  featured: boolean;
}

interface LiveActivity {
  id: string;
  type: 'signup' | 'savings' | 'achievement' | 'review';
  message: string;
  location: string;
  timestamp: Date;
  amount?: string;
  restaurant?: string;
}

interface SocialStats {
  totalRestaurants: number;
  totalSavings: string;
  averageRating: number;
  totalReviews: number;
  thisWeek: {
    newSignups: number;
    totalSavings: string;
  };
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Tony Marinelli',
    role: 'Owner',
    restaurant: 'Tony\'s Pizza Kitchen',
    location: 'Chicago, IL',
    quote: 'HERA cut our food costs by 28% in just 3 weeks. The AI predictions are incredibly accurate - we never run out of our popular items anymore, and waste is practically zero.',
    rating: 5,
    savings: '$2,400',
    timeframe: '3 weeks',
    beforeAfter: [
      { metric: 'Food Cost %', before: '35%', after: '25%' },
      { metric: 'Waste Reduction', before: '12%', after: '3%' },
      { metric: 'Order Accuracy', before: '92%', after: '99%' }
    ],
    avatar: '🍕',
    verified: true,
    featured: true
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    role: 'Manager',
    restaurant: 'Casa Maria Mexican Grill',
    location: 'Austin, TX',
    quote: 'The inventory predictions saved us during Cinco de Mayo. HERA knew exactly how much we needed. Best investment we ever made for our restaurant.',
    rating: 5,
    savings: '$1,800',
    timeframe: '1 month',
    beforeAfter: [
      { metric: 'Stockouts', before: '8/month', after: '0/month' },
      { metric: 'Inventory Costs', before: '$12K', after: '$8.5K' },
      { metric: 'Customer Satisfaction', before: '4.1★', after: '4.8★' }
    ],
    avatar: '🌮',
    verified: true,
    featured: true
  },
  {
    id: '3',
    name: 'David Chen',
    role: 'Owner',
    restaurant: 'Golden Dragon Asian Fusion',
    location: 'San Francisco, CA',
    quote: 'The voice control is a game-changer. Just saying \'How much salmon?\' and getting instant answers saves hours. ROI was immediate.',
    rating: 5,
    savings: '$3,200',
    timeframe: '2 weeks',
    beforeAfter: [
      { metric: 'Time Saved', before: '0 hrs', after: '15 hrs/week' },
      { metric: 'Premium Waste', before: '18%', after: '5%' },
      { metric: 'Profit Margin', before: '12%', after: '18%' }
    ],
    avatar: '🥡',
    verified: true,
    featured: true
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    role: 'Owner',
    restaurant: 'The Corner Bistro',
    location: 'Portland, OR',
    quote: 'I was hesitant about AI, but HERA delivered on every promise. The learning curve was zero, and results were immediate.',
    rating: 5,
    savings: '$1,950',
    timeframe: '1 week',
    beforeAfter: [
      { metric: 'Setup Time', before: 'N/A', after: '5 minutes' },
      { metric: 'Daily Reports', before: '2 hours', after: '5 minutes' },
      { metric: 'Stress Level', before: 'High', after: 'Low' }
    ],
    avatar: '☕',
    verified: true,
    featured: false
  }
];

const LIVE_ACTIVITIES: LiveActivity[] = [
  { id: '1', type: 'signup', message: 'just started their free trial', location: 'New York, NY', timestamp: new Date(Date.now() - 2 * 60 * 1000), restaurant: 'Mario\'s Bistro' },
  { id: '2', type: 'savings', message: 'saved', location: 'Los Angeles, CA', timestamp: new Date(Date.now() - 5 * 60 * 1000), amount: '$340', restaurant: 'Sunset Grill' },
  { id: '3', type: 'achievement', message: 'achieved 0% waste this week', location: 'Chicago, IL', timestamp: new Date(Date.now() - 8 * 60 * 1000), restaurant: 'Deep Dish Palace' },
  { id: '4', type: 'review', message: 'left a 5-star review', location: 'Miami, FL', timestamp: new Date(Date.now() - 12 * 60 * 1000), restaurant: 'Ocean View Cafe' },
  { id: '5', type: 'signup', message: 'just started their free trial', location: 'Seattle, WA', timestamp: new Date(Date.now() - 15 * 60 * 1000), restaurant: 'Pike Place Kitchen' }
];

const SOCIAL_STATS: SocialStats = {
  totalRestaurants: 547,
  totalSavings: '$1.2M',
  averageRating: 4.8,
  totalReviews: 1203,
  thisWeek: {
    newSignups: 23,
    totalSavings: '$48K'
  }
};

export function SocialProofEngine({ variant = 'testimonials', className }: SocialProofProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLive, setIsLive] = useState(true);
  
  const { track } = useConversionTracking();

  // Auto-rotate testimonials
  useEffect(() => {
    if (variant === 'testimonials') {
      const timer = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [variant]);

  // Auto-rotate live activities
  useEffect(() => {
    if (variant === 'live_activity') {
      const timer = setInterval(() => {
        setCurrentActivity((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [variant]);

  // Simulate live stats updates
  useEffect(() => {
    if (variant === 'stats') {
      const timer = setInterval(() => {
        setVisibleCount(prev => prev + 1);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [variant]);

  // Track social proof interactions
  const handleTestimonialClick = (testimonial: Testimonial) => {
    track('testimonial_clicked', {
      testimonial_id: testimonial.id,
      restaurant: testimonial.restaurant,
      savings: testimonial.savings
    });
  };

  const handleStatsView = () => {
    track('social_stats_viewed', {
      total_restaurants: SOCIAL_STATS.totalRestaurants,
      total_savings: SOCIAL_STATS.totalSavings
    });
  };

  if (variant === 'testimonials') {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              onClick={() => handleTestimonialClick(TESTIMONIALS[currentTestimonial])}
              className="cursor-pointer"
            >
              <TestimonialCard testimonial={TESTIMONIALS[currentTestimonial]} />
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'live_activity') {
    return (
      <Card className={`${className} border-green-200 bg-green-50`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Live Activity</span>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentActivity}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LiveActivityItem activity={LIVE_ACTIVITIES[currentActivity]} />
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'stats') {
    return (
      <Card className={`${className}`} onClick={handleStatsView}>
        <CardContent className="p-6">
          <SocialStatsDisplay stats={SOCIAL_STATS} />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'reviews') {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <ReviewsGrid testimonials={TESTIMONIALS.slice(0, 4)} />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'notifications') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 space-y-2 ${className}`}>
        <AnimatePresence>
          {LIVE_ACTIVITIES.slice(0, 3).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ delay: index * 2 }}
              className="bg-white shadow-lg border border-gray-200 rounded-lg p-3 max-w-sm"
            >
              <NotificationItem activity={activity} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <div className="text-4xl">{testimonial.avatar}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
            {testimonial.verified && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {testimonial.featured && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                <Award className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">{testimonial.role} • {testimonial.restaurant}</p>
          <div className="flex items-center space-x-1 mt-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">{testimonial.location}</span>
          </div>
        </div>
        <div className="text-right">
          <Badge className="bg-green-100 text-green-800">
            <DollarSign className="h-3 w-3 mr-1" />
            {testimonial.savings}/mo
          </Badge>
          <p className="text-xs text-gray-500 mt-1">in {testimonial.timeframe}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 mb-3">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      
      <blockquote className="text-gray-700 italic relative">
        <Quote className="h-4 w-4 text-gray-400 absolute -top-1 -left-1" />
        <span className="ml-3">"{testimonial.quote}"</span>
      </blockquote>
      
      <div className="grid grid-cols-3 gap-3 mt-4">
        {testimonial.beforeAfter.map((metric, index) => (
          <div key={index} className="text-center p-2 bg-gray-50 rounded">
            <p className="text-xs text-gray-600">{metric.metric}</p>
            <p className="text-sm">
              <span className="text-red-600">{metric.before}</span>
              <span className="text-gray-400 mx-1">→</span>
              <span className="text-green-600 font-semibold">{metric.after}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveActivityItem({ activity }: { activity: LiveActivity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'signup': return <Users className="h-4 w-4 text-blue-600" />;
      case 'savings': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'achievement': return <Award className="h-4 w-4 text-yellow-600" />;
      case 'review': return <Star className="h-4 w-4 text-purple-600" />;
      default: return <Zap className="h-4 w-4 text-orange-600" />;
    }
  };

  const timeAgo = Math.floor((Date.now() - activity.timestamp.getTime()) / 60000);

  return (
    <div className="flex items-center space-x-3">
      {getIcon()}
      <div className="flex-1">
        <p className="text-sm text-gray-800">
          <span className="font-medium">{activity.restaurant}</span> {activity.message}
          {activity.amount && <span className="text-green-600 font-semibold"> {activity.amount}</span>}
        </p>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span>{activity.location}</span>
          <Clock className="h-3 w-3 ml-2" />
          <span>{timeAgo}m ago</span>
        </div>
      </div>
    </div>
  );
}

function SocialStatsDisplay({ stats }: { stats: SocialStats }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Join the Restaurant Revolution
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 bg-blue-50 rounded-lg"
        >
          <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-800">{stats.totalRestaurants}+</p>
          <p className="text-sm text-blue-600">Restaurants Trust HERA</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center p-4 bg-green-50 rounded-lg"
        >
          <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-800">{stats.totalSavings}</p>
          <p className="text-sm text-green-600">Total Customer Savings</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center p-4 bg-yellow-50 rounded-lg"
        >
          <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-800">{stats.averageRating}</p>
          <p className="text-sm text-yellow-600">Average Rating</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center p-4 bg-purple-50 rounded-lg"
        >
          <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-800">{stats.totalReviews}</p>
          <p className="text-sm text-purple-600">Customer Reviews</p>
        </motion.div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-800 mb-2">This Week</h4>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">New signups: <span className="font-semibold text-blue-600">{stats.thisWeek.newSignups}</span></span>
          <span className="text-gray-600">Savings: <span className="font-semibold text-green-600">{stats.thisWeek.totalSavings}</span></span>
        </div>
      </div>
    </div>
  );
}

function ReviewsGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800 text-center mb-4">
        What Restaurant Owners Say
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="p-3 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{testimonial.avatar}</span>
              <div>
                <p className="font-medium text-sm text-gray-800">{testimonial.name}</p>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 italic">"{testimonial.quote.slice(0, 100)}..."</p>
            <Badge className="bg-green-100 text-green-800 text-xs mt-2">
              <DollarSign className="h-2 w-2 mr-1" />
              {testimonial.savings}/mo saved
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function NotificationItem({ activity }: { activity: LiveActivity }) {
  return (
    <div className="flex items-center space-x-3">
      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
        <Users className="h-4 w-4 text-green-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">
          {activity.restaurant} {activity.message}
        </p>
        <p className="text-xs text-gray-500">{activity.location} • Just now</p>
      </div>
      <button className="text-gray-400 hover:text-gray-600">
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );
}