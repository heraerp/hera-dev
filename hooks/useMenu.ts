'use client';

import { useState, useEffect, useCallback } from 'react';
import UniversalCrudService from '@/lib/services/universalCrudService';
import { createClient } from '@/lib/supabase/client';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  preparation_time: number;
  dietary_options: string[];
  allergens: string[];
  spice_level: number;
  popularity_score?: number;
  ai_recommended?: boolean;
  ingredients: string[];
  availability: boolean;
}

export const useMenu = (restaurantId: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const loadMenu = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch menu items from universal schema
      const { data: entities, error: entitiesError } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_dynamic_data!inner(
            field_name,
            field_value,
            field_type
          )
        `)
        .eq('organization_id', restaurantId)
        .eq('entity_type', 'menu_item')
        .eq('status', 'active');

      if (entitiesError) throw entitiesError;

      // Transform the data into menu items
      const transformedItems: MenuItem[] = entities?.map(entity => {
        const dynamicData = entity.core_dynamic_data || [];
        const dataMap = dynamicData.reduce((acc: any, item: any) => {
          acc[item.field_name] = item.field_value;
          return acc;
        }, {});

        return {
          id: entity.id,
          name: entity.name,
          description: dataMap.description || '',
          price: parseFloat(dataMap.price || '0'),
          category: dataMap.category || 'other',
          image_url: dataMap.image_url,
          preparation_time: parseInt(dataMap.preparation_time || '15'),
          dietary_options: dataMap.dietary_options ? JSON.parse(dataMap.dietary_options) : [],
          allergens: dataMap.allergens ? JSON.parse(dataMap.allergens) : [],
          spice_level: parseInt(dataMap.spice_level || '0'),
          popularity_score: parseFloat(dataMap.popularity_score || '0'),
          ai_recommended: dataMap.ai_recommended === 'true',
          ingredients: dataMap.ingredients ? JSON.parse(dataMap.ingredients) : [],
          availability: dataMap.availability !== 'false'
        };
      }) || [];

      // If no real data, use mock data for demo
      if (transformedItems.length === 0) {
        const mockMenuItems = await generateMockMenuItems();
        setMenuItems(mockMenuItems);
        setCategories(['appetizer', 'soup', 'main_course', 'rice', 'bread', 'dessert', 'beverage']);
      } else {
        setMenuItems(transformedItems);
        const uniqueCategories = [...new Set(transformedItems.map(item => item.category))];
        setCategories(uniqueCategories);
      }

    } catch (err) {
      console.error('Error loading menu:', err);
      setError('Failed to load menu');
      
      // Fallback to mock data
      const mockMenuItems = await generateMockMenuItems();
      setMenuItems(mockMenuItems);
      setCategories(['appetizer', 'soup', 'main_course', 'rice', 'bread', 'dessert', 'beverage']);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, supabase]);

  const generateMockMenuItems = async (): Promise<MenuItem[]> => {
    // First Floor Restaurant - Indian Multi-Cuisine Menu
    return [
      // Appetizers
      {
        id: 'paneer-tikka',
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese cubes marinated in spices and yogurt',
        price: 8.99,
        category: 'appetizer',
        image_url: '/images/paneer-tikka.jpg',
        preparation_time: 15,
        dietary_options: ['vegetarian', 'gluten_free'],
        allergens: ['dairy'],
        spice_level: 2,
        popularity_score: 0.9,
        ai_recommended: true,
        ingredients: ['paneer', 'yogurt', 'spices', 'bell peppers', 'onions'],
        availability: true
      },
      {
        id: 'chicken-65',
        name: 'Chicken 65',
        description: 'Deep-fried spicy chicken appetizer from South India',
        price: 9.99,
        category: 'appetizer',
        image_url: '/images/chicken-65.jpg',
        preparation_time: 20,
        dietary_options: ['gluten_free'],
        allergens: [],
        spice_level: 4,
        popularity_score: 0.95,
        ai_recommended: true,
        ingredients: ['chicken', 'curry leaves', 'ginger', 'garlic', 'red chilli'],
        availability: true
      },
      {
        id: 'vegetable-samosa',
        name: 'Vegetable Samosa',
        description: 'Crispy pastry filled with spiced vegetables',
        price: 5.99,
        category: 'appetizer',
        image_url: '/images/samosa.jpg',
        preparation_time: 10,
        dietary_options: ['vegetarian', 'vegan'],
        allergens: ['gluten'],
        spice_level: 2,
        popularity_score: 0.85,
        ai_recommended: false,
        ingredients: ['flour', 'potatoes', 'peas', 'spices'],
        availability: true
      },
      // Soups
      {
        id: 'tomato-soup',
        name: 'Tomato Soup',
        description: 'Fresh tomato soup with herbs and cream',
        price: 6.99,
        category: 'soup',
        image_url: '/images/tomato-soup.jpg',
        preparation_time: 8,
        dietary_options: ['vegetarian'],
        allergens: ['dairy'],
        spice_level: 0,
        popularity_score: 0.8,
        ai_recommended: false,
        ingredients: ['tomatoes', 'cream', 'herbs', 'garlic'],
        availability: true
      },
      {
        id: 'sweet-corn-soup',
        name: 'Sweet Corn Soup',
        description: 'Creamy corn soup with vegetables',
        price: 7.99,
        category: 'soup',
        image_url: '/images/corn-soup.jpg',
        preparation_time: 10,
        dietary_options: ['vegetarian'],
        allergens: [],
        spice_level: 0,
        popularity_score: 0.75,
        ai_recommended: false,
        ingredients: ['sweet corn', 'vegetables', 'cornstarch'],
        availability: true
      },
      // Main Courses
      {
        id: 'butter-chicken',
        name: 'Butter Chicken',
        description: 'Tender chicken in creamy tomato sauce',
        price: 16.99,
        category: 'main_course',
        image_url: '/images/butter-chicken.jpg',
        preparation_time: 25,
        dietary_options: ['gluten_free'],
        allergens: ['dairy', 'nuts'],
        spice_level: 1,
        popularity_score: 0.95,
        ai_recommended: true,
        ingredients: ['chicken', 'tomato sauce', 'cream', 'butter', 'spices'],
        availability: true
      },
      {
        id: 'palak-paneer',
        name: 'Palak Paneer',
        description: 'Cottage cheese cubes in spinach gravy',
        price: 14.99,
        category: 'main_course',
        image_url: '/images/palak-paneer.jpg',
        preparation_time: 20,
        dietary_options: ['vegetarian', 'gluten_free'],
        allergens: ['dairy'],
        spice_level: 1,
        popularity_score: 0.9,
        ai_recommended: true,
        ingredients: ['paneer', 'spinach', 'cream', 'spices'],
        availability: true
      },
      {
        id: 'dal-makhani',
        name: 'Dal Makhani',
        description: 'Creamy black lentils slow-cooked overnight',
        price: 12.99,
        category: 'main_course',
        image_url: '/images/dal-makhani.jpg',
        preparation_time: 30,
        dietary_options: ['vegetarian', 'gluten_free'],
        allergens: ['dairy'],
        spice_level: 1,
        popularity_score: 0.85,
        ai_recommended: false,
        ingredients: ['black lentils', 'cream', 'butter', 'tomatoes', 'spices'],
        availability: true
      },
      {
        id: 'fish-curry',
        name: 'Fish Curry',
        description: 'Fresh fish in coconut-based curry',
        price: 17.99,
        category: 'main_course',
        image_url: '/images/fish-curry.jpg',
        preparation_time: 20,
        dietary_options: ['gluten_free', 'dairy_free'],
        allergens: ['fish'],
        spice_level: 3,
        popularity_score: 0.8,
        ai_recommended: false,
        ingredients: ['fish', 'coconut milk', 'curry leaves', 'spices'],
        availability: true
      },
      // Rice
      {
        id: 'vegetable-biryani',
        name: 'Vegetable Biryani',
        description: 'Fragrant basmati rice with mixed vegetables and spices',
        price: 13.99,
        category: 'rice',
        image_url: '/images/veg-biryani.jpg',
        preparation_time: 25,
        dietary_options: ['vegetarian', 'vegan', 'gluten_free'],
        allergens: [],
        spice_level: 2,
        popularity_score: 0.88,
        ai_recommended: true,
        ingredients: ['basmati rice', 'vegetables', 'spices', 'herbs'],
        availability: true
      },
      {
        id: 'chicken-biryani',
        name: 'Chicken Biryani',
        description: 'Aromatic rice with tender chicken pieces',
        price: 15.99,
        category: 'rice',
        image_url: '/images/chicken-biryani.jpg',
        preparation_time: 30,
        dietary_options: ['gluten_free'],
        allergens: [],
        spice_level: 2,
        popularity_score: 0.92,
        ai_recommended: true,
        ingredients: ['basmati rice', 'chicken', 'spices', 'saffron'],
        availability: true
      },
      // Breads
      {
        id: 'garlic-naan',
        name: 'Garlic Naan',
        description: 'Soft bread topped with garlic and butter',
        price: 3.99,
        category: 'bread',
        image_url: '/images/garlic-naan.jpg',
        preparation_time: 10,
        dietary_options: ['vegetarian'],
        allergens: ['gluten', 'dairy'],
        spice_level: 0,
        popularity_score: 0.9,
        ai_recommended: true,
        ingredients: ['flour', 'yogurt', 'garlic', 'butter'],
        availability: true
      },
      {
        id: 'tandoori-roti',
        name: 'Tandoori Roti',
        description: 'Whole wheat flat bread from clay oven',
        price: 2.99,
        category: 'bread',
        image_url: '/images/tandoori-roti.jpg',
        preparation_time: 8,
        dietary_options: ['vegetarian', 'vegan'],
        allergens: ['gluten'],
        spice_level: 0,
        popularity_score: 0.8,
        ai_recommended: false,
        ingredients: ['whole wheat flour', 'water', 'salt'],
        availability: true
      },
      // Desserts
      {
        id: 'gulab-jamun',
        name: 'Gulab Jamun',
        description: 'Deep fried milk dumplings in sugar syrup',
        price: 6.99,
        category: 'dessert',
        image_url: '/images/gulab-jamun.jpg',
        preparation_time: 5,
        dietary_options: ['vegetarian'],
        allergens: ['dairy', 'gluten'],
        spice_level: 0,
        popularity_score: 0.95,
        ai_recommended: true,
        ingredients: ['milk powder', 'flour', 'sugar syrup', 'cardamom'],
        availability: true
      },
      {
        id: 'kulfi',
        name: 'Kulfi',
        description: 'Traditional Indian ice cream with pistachios',
        price: 5.99,
        category: 'dessert',
        image_url: '/images/kulfi.jpg',
        preparation_time: 3,
        dietary_options: ['vegetarian', 'gluten_free'],
        allergens: ['dairy', 'nuts'],
        spice_level: 0,
        popularity_score: 0.85,
        ai_recommended: false,
        ingredients: ['milk', 'sugar', 'pistachios', 'cardamom'],
        availability: true
      },
      // Beverages
      {
        id: 'mango-lassi',
        name: 'Mango Lassi',
        description: 'Sweet yogurt drink with mango pulp',
        price: 5.99,
        category: 'beverage',
        image_url: '/images/mango-lassi.jpg',
        preparation_time: 5,
        dietary_options: ['vegetarian', 'gluten_free'],
        allergens: ['dairy'],
        spice_level: 0,
        popularity_score: 0.9,
        ai_recommended: true,
        ingredients: ['yogurt', 'mango pulp', 'sugar', 'cardamom'],
        availability: true
      },
      {
        id: 'masala-chai',
        name: 'Masala Chai',
        description: 'Spiced Indian tea with milk',
        price: 3.99,
        category: 'beverage',
        image_url: '/images/masala-chai.jpg',
        preparation_time: 5,
        dietary_options: ['vegetarian'],
        allergens: ['dairy'],
        spice_level: 1,
        popularity_score: 0.88,
        ai_recommended: false,
        ingredients: ['tea', 'milk', 'ginger', 'cardamom', 'cinnamon'],
        availability: true
      }
    ];
  };

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const filterByCategory = useCallback((category: string) => {
    return menuItems.filter(item => item.category === category);
  }, [menuItems]);

  const searchMenu = useCallback((query: string, items?: MenuItem[]) => {
    const searchItems = items || menuItems;
    const lowercaseQuery = query.toLowerCase();
    
    return searchItems.filter(item =>
      item.name.toLowerCase().includes(lowercaseQuery) ||
      item.description?.toLowerCase().includes(lowercaseQuery) ||
      item.ingredients.some(ingredient => ingredient.toLowerCase().includes(lowercaseQuery)) ||
      item.category.toLowerCase().includes(lowercaseQuery)
    );
  }, [menuItems]);

  const getPopularItems = useCallback(() => {
    return menuItems
      .filter(item => item.popularity_score && item.popularity_score > 0.8)
      .sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
  }, [menuItems]);

  const getItemsByDietaryPreference = useCallback((preferences: string[]) => {
    return menuItems.filter(item =>
      preferences.some(pref => item.dietary_options.includes(pref))
    );
  }, [menuItems]);

  const getItemsAvoidingAllergens = useCallback((allergens: string[]) => {
    return menuItems.filter(item =>
      !allergens.some(allergen => 
        item.allergens.some(itemAllergen => 
          itemAllergen.toLowerCase().includes(allergen.toLowerCase())
        )
      )
    );
  }, [menuItems]);

  return {
    menuItems,
    categories,
    isLoading,
    error,
    filterByCategory,
    searchMenu,
    getPopularItems,
    getItemsByDietaryPreference,
    getItemsAvoidingAllergens,
    refreshMenu: loadMenu
  };
};