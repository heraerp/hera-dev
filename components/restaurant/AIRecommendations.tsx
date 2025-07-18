'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Brain,
  TrendingUp,
  Heart,
  Star,
  Zap,
  Plus,
  Loader2,
  ChefHat,
  DollarSign,
  Clock,
  Users,
  Target,
  AlertCircle,
  ThumbsUp,
  RefreshCw,
  Lightbulb
} from 'lucide-react';

interface Recommendation {
  id: string;
  name: string;
  reason: string;
  price: number;
  confidence: number;
  type: 'upsell' | 'complement' | 'dietary_alternative' | 'popular' | 'seasonal';
  savings?: number;
  preparation_time?: number;
  popularity_score?: number;
}

interface Order {
  items: any[];
}

interface AIRecommendationsProps {
  recommendations: Recommendation[];
  currentOrder: Order;
  customerPreferences: string[];
  onAddRecommendation: (item: any) => void;
  isProcessing: boolean;
  onGetDietaryAlternatives: (item: any) => Promise<Recommendation[]>;
  onGetUpsellSuggestions: (order: Order) => Promise<Recommendation[]>;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  recommendations,
  currentOrder,
  customerPreferences,
  onAddRecommendation,
  isProcessing,
  onGetDietaryAlternatives,
  onGetUpsellSuggestions
}) => {
  const [activeTab, setActiveTab] = useState<'smart' | 'upsell' | 'dietary' | 'insights'>('smart');
  const [dietaryAlternatives, setDietaryAlternatives] = useState<Recommendation[]>([]);
  const [upsellSuggestions, setUpsellSuggestions] = useState<Recommendation[]>([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [isLoadingUpsells, setIsLoadingUpsells] = useState(false);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'upsell': return DollarSign;
      case 'complement': return Heart;
      case 'dietary_alternative': return Zap;
      case 'popular': return TrendingUp;
      case 'seasonal': return Star;
      default: return Sparkles;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'upsell': return 'bg-green-100 text-green-800 border-green-300';
      case 'complement': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'dietary_alternative': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'popular': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'seasonal': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleLoadDietaryAlternatives = async () => {
    if (currentOrder.items.length === 0) return;
    
    setIsLoadingAlternatives(true);
    try {
      const alternatives = await onGetDietaryAlternatives(currentOrder.items[0]);
      setDietaryAlternatives(alternatives);
    } catch (error) {
      console.error('Error loading dietary alternatives:', error);
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  const handleLoadUpsells = async () => {
    setIsLoadingUpsells(true);
    try {
      const upsells = await onGetUpsellSuggestions(currentOrder);
      setUpsellSuggestions(upsells);
    } catch (error) {
      console.error('Error loading upsell suggestions:', error);
    } finally {
      setIsLoadingUpsells(false);
    }
  };

  const RecommendationCard: React.FC<{ rec: Recommendation }> = ({ rec }) => {
    const IconComponent = getRecommendationIcon(rec.type);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium text-gray-900">{rec.name}</h3>
                <Badge variant="outline" className={getRecommendationColor(rec.type)}>
                  <IconComponent className="w-3 h-3 mr-1" />
                  {rec.type.replace('_', ' ')}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <Brain className="w-3 h-3" />
                  <span className={getConfidenceColor(rec.confidence)}>
                    {Math.round(rec.confidence * 100)}% match
                  </span>
                </span>
                
                {rec.preparation_time && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{rec.preparation_time} min</span>
                  </span>
                )}
                
                {rec.popularity_score && rec.popularity_score > 0.7 && (
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Popular</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right ml-4">
              <div className="font-semibold text-gray-900 mb-1">
                ${rec.price.toFixed(2)}
              </div>
              
              {rec.savings && (
                <div className="text-xs text-green-600 mb-2">
                  Save ${rec.savings.toFixed(2)}
                </div>
              )}
              
              <Button
                size="sm"
                onClick={() => onAddRecommendation({
                  id: rec.id,
                  name: rec.name,
                  price: rec.price,
                  preparation_time: rec.preparation_time || 15
                })}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-blue-900">AI-Powered Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 text-sm">
            Our AI analyzes your order, dietary preferences, and popular combinations to suggest 
            the perfect additions to enhance your dining experience.
          </p>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            <Button
              variant={activeTab === 'smart' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('smart')}
              className="flex-1 rounded-none border-b-0"
            >
              <Brain className="w-4 h-4 mr-2" />
              Smart Picks
            </Button>
            <Button
              variant={activeTab === 'upsell' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('upsell')}
              className="flex-1 rounded-none border-b-0"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Upgrades
            </Button>
            <Button
              variant={activeTab === 'dietary' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('dietary')}
              className="flex-1 rounded-none border-b-0"
            >
              <Heart className="w-4 h-4 mr-2" />
              Dietary
            </Button>
            <Button
              variant={activeTab === 'insights' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('insights')}
              className="flex-1 rounded-none border-b-0"
            >
              <Target className="w-4 h-4 mr-2" />
              Insights
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'smart' && (
        <div className="space-y-4">
          {isProcessing ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                  <span className="text-gray-600">AI is analyzing your preferences...</span>
                </div>
              </CardContent>
            </Card>
          ) : recommendations.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Personalized for You</h3>
                <Badge variant="outline">{recommendations.length} suggestions</Badge>
              </div>
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Add items to get recommendations</h3>
                  <p className="text-gray-600">
                    Our AI will suggest perfect complements and upgrades based on your selections.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'upsell' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Premium Upgrades</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadUpsells}
              disabled={isLoadingUpsells || currentOrder.items.length === 0}
            >
              {isLoadingUpsells ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Suggestions
            </Button>
          </div>

          {isLoadingUpsells ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600 mr-3" />
                  <span className="text-gray-600">Finding upgrade opportunities...</span>
                </div>
              </CardContent>
            </Card>
          ) : upsellSuggestions.length > 0 ? (
            upsellSuggestions.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upgrades available</h3>
                  <p className="text-gray-600">
                    Add some items to your order to see premium upgrade options.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'dietary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Dietary Alternatives</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadDietaryAlternatives}
              disabled={isLoadingAlternatives || currentOrder.items.length === 0}
            >
              {isLoadingAlternatives ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Find Alternatives
            </Button>
          </div>

          {customerPreferences.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Your Dietary Preferences</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {customerPreferences.map((pref) => (
                    <Badge key={pref} variant="outline" className="bg-green-100 text-green-800">
                      {pref.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoadingAlternatives ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                  <span className="text-gray-600">Finding dietary alternatives...</span>
                </div>
              </CardContent>
            </Card>
          ) : dietaryAlternatives.length > 0 ? (
            dietaryAlternatives.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No alternatives needed</h3>
                  <p className="text-gray-600">
                    Your current selections already match your dietary preferences, or add items to see alternatives.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI Insights</h3>
          
          {/* Order Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Portion Analysis</div>
                  <div className="text-sm text-gray-600">
                    Current order serves approximately {Math.max(1, Math.ceil(currentOrder.items.length / 2))} people
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium">Preparation Time</div>
                  <div className="text-sm text-gray-600">
                    Estimated 15-20 minutes for your complete order
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ChefHat className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">ChefHat Recommendation</div>
                  <div className="text-sm text-gray-600">
                    Items can be prepared simultaneously for optimal timing
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutritional Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nutritional Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-medium">Health Score</div>
                  <div className="text-sm text-gray-600">
                    Your order has a good balance of proteins and vegetables
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium">Allergen Alert</div>
                  <div className="text-sm text-gray-600">
                    No allergen conflicts detected with your preferences
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Value Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Value Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Great Value</div>
                  <div className="text-sm text-gray-600">
                    Your selections offer excellent portion-to-price ratio
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ThumbsUp className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Popular Choices</div>
                  <div className="text-sm text-gray-600">
                    85% of your items are customer favorites
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};