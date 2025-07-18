'use client';

import { useState, useCallback } from 'react';

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

interface RecommendationRequest {
  current_order: any[];
  customer_preferences: string[];
  restaurant_id: string;
}

export const useAI = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = useCallback(async (request: RecommendationRequest) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // For demo purposes, we'll generate mock recommendations
      // In production, this would call your AI service
      const mockRecommendations = generateMockRecommendations(request);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRecommendations(mockRecommendations);
    } catch (err) {
      console.error('Error getting AI recommendations:', err);
      setError('Failed to get recommendations');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const getDietaryAlternatives = useCallback(async (item: any): Promise<Recommendation[]> => {
    // Mock dietary alternatives for Indian cuisine
    const alternatives: Recommendation[] = [
      {
        id: 'tandoori-roti',
        name: 'Tandoori Roti',
        reason: 'Vegan bread alternative without dairy, made with whole wheat',
        price: 2.99,
        confidence: 0.92,
        type: 'dietary_alternative',
        preparation_time: 8
      },
      {
        id: 'vegetable-biryani',
        name: 'Vegetable Biryani',
        reason: 'Plant-based main course with aromatic rice and fresh vegetables',
        price: 13.99,
        confidence: 0.88,
        type: 'dietary_alternative',
        preparation_time: 25
      },
      {
        id: 'dal-tadka',
        name: 'Dal Tadka',
        reason: 'Protein-rich vegan lentil curry without dairy',
        price: 10.99,
        confidence: 0.9,
        type: 'dietary_alternative',
        preparation_time: 20
      }
    ];
    
    return alternatives;
  }, []);

  const getUpsellSuggestions = useCallback(async (order: any): Promise<Recommendation[]> => {
    // Mock upsell suggestions for Indian cuisine
    const upsells: Recommendation[] = [
      {
        id: 'chicken-biryani',
        name: 'Chicken Biryani',
        reason: 'Upgrade to our premium aromatic rice dish with tender chicken',
        price: 15.99,
        confidence: 0.92,
        type: 'upsell',
        preparation_time: 30
      },
      {
        id: 'mixed-platter',
        name: 'Mixed Appetizer Platter',
        reason: 'Great for sharing, includes samosa, tikka, and chutneys',
        price: 16.99,
        confidence: 0.85,
        type: 'upsell',
        savings: 4.00,
        preparation_time: 15
      },
      {
        id: 'thali-combo',
        name: 'Special Thali Combo',
        reason: 'Complete meal with curry, dal, rice, bread, and dessert',
        price: 22.99,
        confidence: 0.88,
        type: 'upsell',
        savings: 8.00,
        preparation_time: 25
      }
    ];
    
    return upsells;
  }, []);

  const generateMockRecommendations = (request: RecommendationRequest): Recommendation[] => {
    const baseRecommendations: Recommendation[] = [
      {
        id: 'garlic-naan',
        name: 'Garlic Naan',
        reason: 'Perfect complement to curry dishes, customer favorite',
        price: 3.99,
        confidence: 0.94,
        type: 'complement',
        preparation_time: 10,
        popularity_score: 0.9
      },
      {
        id: 'paneer-tikka',
        name: 'Paneer Tikka',
        reason: 'Popular appetizer that pairs well with main courses',
        price: 8.99,
        confidence: 0.9,
        type: 'complement',
        preparation_time: 15
      },
      {
        id: 'butter-chicken',
        name: 'Butter Chicken',
        reason: 'Upgrade to our signature dish with creamy tomato sauce',
        price: 16.99,
        confidence: 0.95,
        type: 'upsell',
        preparation_time: 25
      },
      {
        id: 'mango-lassi',
        name: 'Mango Lassi',
        reason: 'Sweet yogurt drink that complements spicy Indian food perfectly',
        price: 5.99,
        confidence: 0.88,
        type: 'complement',
        preparation_time: 5
      },
      {
        id: 'gulab-jamun',
        name: 'Gulab Jamun',
        reason: 'Traditional Indian dessert to complete your authentic experience',
        price: 6.99,
        confidence: 0.85,
        type: 'complement',
        preparation_time: 5
      }
    ];

    // Filter recommendations based on current order and preferences
    let filteredRecommendations = baseRecommendations;

    // If customer has dietary preferences, suggest appropriate items
    if (request.customer_preferences.includes('vegetarian')) {
      // All our base recommendations are vegetarian-friendly
      filteredRecommendations = filteredRecommendations;
    }

    if (request.customer_preferences.includes('vegan')) {
      filteredRecommendations = filteredRecommendations.filter(rec => 
        !['garlic-naan', 'mango-lassi', 'gulab-jamun'].includes(rec.id) // These contain dairy
      );
    }

    // Add seasonal recommendations
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 9 || currentMonth <= 2) { // Fall/Winter
      filteredRecommendations.push({
        id: 'dal-makhani',
        name: 'Dal Makhani',
        reason: 'Warm, creamy lentil dish perfect for the season',
        price: 12.99,
        confidence: 0.85,
        type: 'seasonal',
        preparation_time: 30
      });
    } else { // Spring/Summer
      filteredRecommendations.push({
        id: 'kulfi',
        name: 'Kulfi',
        reason: 'Refreshing traditional ice cream perfect for warm weather',
        price: 5.99,
        confidence: 0.8,
        type: 'seasonal',
        preparation_time: 3
      });
    }

    // Sort by confidence score
    return filteredRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Return top 5 recommendations
  };

  const analyzeMealBalance = useCallback((orderItems: any[]) => {
    // Analyze nutritional balance, portion sizes, etc.
    const analysis = {
      protein_score: 0.8,
      vegetable_score: 0.6,
      carb_score: 0.9,
      overall_balance: 0.75,
      suggestions: [
        'Consider adding a salad for better nutritional balance',
        'Your order has a good protein to carb ratio'
      ]
    };
    
    return analysis;
  }, []);

  const predictPreparationTime = useCallback((orderItems: any[]) => {
    // AI-powered preparation time prediction
    const maxPrepTime = Math.max(...orderItems.map(item => item.preparation_time || 15));
    const complexityFactor = orderItems.length > 3 ? 1.2 : 1.0;
    const kitchenLoad = 1.1; // Mock kitchen load factor
    
    return Math.ceil(maxPrepTime * complexityFactor * kitchenLoad);
  }, []);

  const optimizeOrderSequence = useCallback((orderItems: any[]) => {
    // Suggest optimal cooking sequence for kitchen efficiency
    return orderItems.sort((a, b) => {
      // Sort by preparation time (longest first)
      return (b.preparation_time || 0) - (a.preparation_time || 0);
    });
  }, []);

  return {
    recommendations,
    isProcessing,
    error,
    getRecommendations,
    getDietaryAlternatives,
    getUpsellSuggestions,
    analyzeMealBalance,
    predictPreparationTime,
    optimizeOrderSequence
  };
};