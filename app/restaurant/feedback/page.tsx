"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';

// Customer Feedback Portal - Collect and manage customer feedback
export default function FeedbackManagementPage() {
  const [feedbackData, setFeedbackData] = useState({
    lastUpdate: new Date().toLocaleTimeString(),
    recentFeedback: [
      {
        id: 'FB-001',
        customer: 'Priya Sharma',
        orderNumber: 'ORD-113',
        tableNumber: 4,
        date: '2025-01-15',
        time: '2:15 PM',
        rating: 5,
        category: 'food_quality',
        comments: 'Absolutely amazing! The butter chicken was perfect and the service was excellent. Will definitely come back!',
        sentiment: 'positive',
        status: 'responded',
        response: 'Thank you so much for your wonderful feedback! We\'re delighted you enjoyed your experience.',
        responseTime: '15 minutes',
        tags: ['food_quality', 'service', 'repeat_customer']
      },
      {
        id: 'FB-002',
        customer: 'Rajesh Kumar',
        orderNumber: 'ORD-112',
        tableNumber: 20,
        date: '2025-01-15',
        time: '1:45 PM',
        rating: 3,
        category: 'service',
        comments: 'Food was good but service was a bit slow. Had to wait 25 minutes for our order.',
        sentiment: 'neutral',
        status: 'pending',
        tags: ['service_speed', 'wait_time']
      },
      {
        id: 'FB-003',
        customer: 'Anita Gupta',
        orderNumber: 'ORD-111',
        tableNumber: 6,
        date: '2025-01-15',
        time: '1:30 PM',
        rating: 4,
        category: 'food_quality',
        comments: 'Great taste! Loved the biryani. Only suggestion is to make the raita a bit more tangy.',
        sentiment: 'positive',
        status: 'pending',
        tags: ['food_quality', 'suggestion', 'biryani']
      },
      {
        id: 'FB-004',
        customer: 'Mohammed Ali',
        orderNumber: 'ORD-110',
        tableNumber: 12,
        date: '2025-01-15',
        time: '1:20 PM',
        rating: 2,
        category: 'food_quality',
        comments: 'The curry was too spicy despite ordering medium spice level. Also, the naan was cold.',
        sentiment: 'negative',
        status: 'escalated',
        tags: ['spice_level', 'temperature', 'complaint']
      }
    ],
    analytics: {
      totalFeedback: 147,
      averageRating: 4.3,
      responseRate: 89.2,
      averageResponseTime: 22,
      sentimentBreakdown: {
        positive: 78,
        neutral: 45,
        negative: 24
      },
      categoryBreakdown: {
        food_quality: 89,
        service: 38,
        ambience: 15,
        price: 5
      },
      ratingDistribution: [
        { stars: 5, count: 67 },
        { stars: 4, count: 41 },
        { stars: 3, count: 25 },
        { stars: 2, count: 10 },
        { stars: 1, count: 4 }
      ]
    },
    trends: [
      { period: 'Today', rating: 4.3, change: '+0.2' },
      { period: 'This Week', rating: 4.1, change: '+0.1' },
      { period: 'This Month', rating: 4.0, change: '-0.1' }
    ]
  });

  const [responseText, setResponseText] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  const respondToFeedback = (feedbackId: string, response: string) => {
    setFeedbackData(prev => ({
      ...prev,
      recentFeedback: prev.recentFeedback.map(feedback =>
        feedback.id === feedbackId
          ? {
              ...feedback,
              status: 'responded',
              response,
              responseTime: 'Just now'
            }
          : feedback
      )
    }));
    setResponseText('');
    setSelectedFeedback(null);
  };

  const escalateFeedback = (feedbackId: string) => {
    setFeedbackData(prev => ({
      ...prev,
      recentFeedback: prev.recentFeedback.map(feedback =>
        feedback.id === feedbackId
          ? { ...feedback, status: 'escalated' }
          : feedback
      )
    }));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-amber-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'neutral':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'responded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'escalated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig.spring.swift}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <span className="text-xl">←</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Customer Feedback</h1>
                  <p className="text-sm text-gray-600">💬 Feedback Management & Analytics • Last update: {feedbackData.lastUpdate}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{feedbackData.analytics.totalFeedback}</div>
                  <div className="text-gray-600">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{feedbackData.analytics.averageRating}</div>
                  <div className="text-gray-600">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-amber-600">{feedbackData.analytics.responseRate}%</div>
                  <div className="text-gray-600">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{feedbackData.analytics.averageResponseTime}m</div>
                  <div className="text-gray-600">Avg Response</div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700">
                <span className="text-lg mr-1">📊</span>
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-4 space-y-6">
        {/* Analytics Dashboard */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          {/* Sentiment Analysis */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>😊</span>
              <span>SENTIMENT ANALYSIS</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(feedbackData.analytics.sentimentBreakdown).map(([sentiment, count]) => (
                <div key={sentiment} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-3 h-3 rounded-full", 
                      sentiment === 'positive' ? 'bg-green-500' :
                      sentiment === 'neutral' ? 'bg-amber-500' : 'bg-red-500'
                    )}></div>
                    <span className="capitalize font-medium">{sentiment}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{count}</div>
                    <div className="text-xs text-gray-600">
                      {Math.round((count / feedbackData.analytics.totalFeedback) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Rating Distribution */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>⭐</span>
              <span>RATING BREAKDOWN</span>
            </h3>
            <div className="space-y-2">
              {feedbackData.analytics.ratingDistribution.reverse().map((rating) => (
                <div key={rating.stars} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-12">
                    <span>{rating.stars}</span>
                    <span className="text-yellow-400">⭐</span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(rating.count / feedbackData.analytics.totalFeedback) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium w-8 text-right">{rating.count}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trends */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>📈</span>
              <span>RATING TRENDS</span>
            </h3>
            <div className="space-y-4">
              {feedbackData.trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{trend.period}</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{trend.rating}</div>
                    <div className={cn("text-sm font-medium", 
                      trend.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    )}>
                      {trend.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.1 }}
        >
          <Card variant="glass" className="shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">RECENT FEEDBACK</h2>
                    <p className="text-sm text-gray-600">Latest customer reviews and responses</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <span className="text-lg mr-1">🔔</span>
                    Auto-notify
                  </Button>
                  <Button variant="outline" size="sm">
                    <span className="text-lg mr-1">📱</span>
                    SMS Alerts
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {feedbackData.recentFeedback.map((feedback, index) => (
                <motion.div 
                  key={feedback.id} 
                  className="p-6 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...motionConfig.spring.swift, delay: 0.1 + index * 0.1 }}
                >
                  <div className="space-y-4">
                    {/* Feedback Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-800">{feedback.customer}</h3>
                            <Badge variant="outline" className="text-xs">
                              {feedback.orderNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Table {feedback.tableNumber}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>📅 {feedback.date}</span>
                            <span>🕐 {feedback.time}</span>
                            <span>📂 {feedback.category.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            {renderStars(feedback.rating)}
                          </div>
                          <div className={cn("text-lg font-bold", getRatingColor(feedback.rating))}>
                            {feedback.rating}/5
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Badge className={cn("text-xs", getSentimentColor(feedback.sentiment))}>
                            {feedback.sentiment.toUpperCase()}
                          </Badge>
                          <Badge className={cn("text-xs", getStatusColor(feedback.status))}>
                            {feedback.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Content */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800">{feedback.comments}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {feedback.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Response Section */}
                    {feedback.status === 'responded' && feedback.response ? (
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">🏪</span>
                          <span className="font-medium text-blue-800">Restaurant Response</span>
                          <Badge variant="outline" className="text-xs">
                            {feedback.responseTime}
                          </Badge>
                        </div>
                        <p className="text-blue-700">{feedback.response}</p>
                      </div>
                    ) : feedback.status === 'pending' ? (
                      <div className="space-y-3">
                        {selectedFeedback === feedback.id ? (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Type your response to the customer..."
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              rows={3}
                              className="w-full"
                            />
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => respondToFeedback(feedback.id, responseText)}
                                disabled={!responseText.trim()}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                📤 Send Response
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedFeedback(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedFeedback(feedback.id)}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              💬 Respond
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => escalateFeedback(feedback.id)}
                              className="bg-amber-50 border-amber-200 text-amber-700"
                            >
                              ⚠️ Escalate
                            </Button>
                            <Button size="sm" variant="outline">
                              📞 Call Customer
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : feedback.status === 'escalated' ? (
                      <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">🚨</span>
                          <span className="font-medium text-red-800">Escalated to Management</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.3 }}
        >
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>⚡</span>
              <span>QUICK ACTIONS</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <span className="text-2xl">📧</span>
                <span className="text-sm font-medium">Email Survey</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <span className="text-2xl">📱</span>
                <span className="text-sm font-medium">SMS Follow-up</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <span className="text-2xl">🎁</span>
                <span className="text-sm font-medium">Send Coupon</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col items-center space-y-1">
                <span className="text-2xl">📊</span>
                <span className="text-sm font-medium">Generate Report</span>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}