import { useState, useCallback, useEffect, useMemo } from 'react';
import { ProductService } from '@/lib/services/productService';
import { ProductWithDetails, ProductSearchFilters } from '@/types/product';

export interface UseProductSearchReturn {
  searchResults: ProductWithDetails[];
  searchQuery: string;
  filters: ProductSearchFilters;
  loading: boolean;
  error: string | null;
  totalResults: number;
  facets: {
    categories: Array<{ name: string; count: number }>;
    statuses: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
  };
  setSearchQuery: (query: string) => void;
  setFilters: (filters: ProductSearchFilters) => void;
  updateFilter: (key: keyof ProductSearchFilters, value: any) => void;
  clearFilters: () => void;
  search: (query?: string, filters?: ProductSearchFilters) => Promise<void>;
  clearSearch: () => void;
}

const DEFAULT_FILTERS: ProductSearchFilters = {
  category: undefined,
  status: undefined,
  product_type: undefined,
  price_min: undefined,
  price_max: undefined,
  in_stock_only: false
};

export function useProductSearch(
  organizationId: string,
  initialResults: ProductWithDetails[] = []
): UseProductSearchReturn {
  const [searchResults, setSearchResults] = useState<ProductWithDetails[]>(initialResults);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFiltersState] = useState<ProductSearchFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<ProductWithDetails[]>(initialResults);

  // Calculate facets from all products
  const facets = useMemo(() => {
    const categories = allProducts.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statuses = allProducts.reduce((acc, product) => {
      acc[product.status] = (acc[product.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priceRanges = {
      '0-50': 0,
      '50-100': 0,
      '100-200': 0,
      '200-500': 0,
      '500+': 0
    };

    allProducts.forEach(product => {
      const price = product.price;
      if (price === 0) return; // Skip non-selling items
      
      if (price < 50) priceRanges['0-50']++;
      else if (price < 100) priceRanges['50-100']++;
      else if (price < 200) priceRanges['100-200']++;
      else if (price < 500) priceRanges['200-500']++;
      else priceRanges['500+']++;
    });

    return {
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
      statuses: Object.entries(statuses).map(([name, count]) => ({ name, count })),
      priceRanges: Object.entries(priceRanges)
        .filter(([_, count]) => count > 0)
        .map(([range, count]) => ({ range, count }))
    };
  }, [allProducts]);

  // Filter products locally
  const filterProducts = useCallback((
    products: ProductWithDetails[],
    query: string,
    searchFilters: ProductSearchFilters
  ): ProductWithDetails[] => {
    let filtered = [...products];

    // Text search
    if (query.trim()) {
      const queryLower = query.toLowerCase();
      filtered = filtered.filter(product => 
        product.entity_name.toLowerCase().includes(queryLower) ||
        product.entity_code.toLowerCase().includes(queryLower) ||
        product.description.toLowerCase().includes(queryLower) ||
        product.allergens.toLowerCase().includes(queryLower) ||
        product.origin.toLowerCase().includes(queryLower) ||
        product.supplier_name.toLowerCase().includes(queryLower)
      );
    }

    // Category filter
    if (searchFilters.category && searchFilters.category !== 'all') {
      filtered = filtered.filter(product => product.category === searchFilters.category);
    }

    // Status filter
    if (searchFilters.status && searchFilters.status !== 'all') {
      filtered = filtered.filter(product => product.status === searchFilters.status);
    }

    // Product type filter
    if (searchFilters.product_type && searchFilters.product_type !== 'all') {
      filtered = filtered.filter(product => product.product_type === searchFilters.product_type);
    }

    // Price range filter
    if (searchFilters.price_min !== undefined) {
      filtered = filtered.filter(product => product.price >= searchFilters.price_min!);
    }

    if (searchFilters.price_max !== undefined) {
      filtered = filtered.filter(product => product.price <= searchFilters.price_max!);
    }

    // In stock only filter
    if (searchFilters.in_stock_only) {
      filtered = filtered.filter(product => product.status === 'in_stock');
    }

    return filtered;
  }, []);

  // Perform search
  const search = useCallback(async (
    query?: string,
    searchFilters?: ProductSearchFilters
  ) => {
    const finalQuery = query !== undefined ? query : searchQuery;
    const finalFilters = searchFilters || filters;

    setLoading(true);
    setError(null);

    try {
      // If we have a query or specific filters, use the API search
      if (finalQuery.trim() || Object.values(finalFilters).some(v => v !== undefined && v !== false)) {
        const results = await ProductService.searchProducts(
          organizationId,
          finalQuery,
          finalFilters
        );
        setSearchResults(results);
      } else {
        // If no query or filters, show all products
        const allResults = await ProductService.fetchProducts(organizationId);
        setAllProducts(allResults);
        setSearchResults(allResults);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId, searchQuery, filters]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string, searchFilters: ProductSearchFilters) => {
      search(query, searchFilters);
    }, 300),
    [search]
  );

  // Set search query
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query, filters);
  }, [filters, debouncedSearch]);

  // Set filters
  const setFilters = useCallback((newFilters: ProductSearchFilters) => {
    setFiltersState(newFilters);
    debouncedSearch(searchQuery, newFilters);
  }, [searchQuery, debouncedSearch]);

  // Update single filter
  const updateFilter = useCallback((key: keyof ProductSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  }, [filters, setFilters]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, [setFilters]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilters(DEFAULT_FILTERS);
    setSearchResults(allProducts);
  }, [allProducts, setFilters]);

  // Load initial data
  useEffect(() => {
    if (organizationId && allProducts.length === 0) {
      search('', DEFAULT_FILTERS);
    }
  }, [organizationId, allProducts.length, search]);

  // Filter results when allProducts changes
  useEffect(() => {
    if (allProducts.length > 0 && !loading) {
      const filtered = filterProducts(allProducts, searchQuery, filters);
      setSearchResults(filtered);
    }
  }, [allProducts, searchQuery, filters, filterProducts, loading]);

  return {
    searchResults,
    searchQuery,
    filters,
    loading,
    error,
    totalResults: searchResults.length,
    facets,
    setSearchQuery: handleSetSearchQuery,
    setFilters,
    updateFilter,
    clearFilters,
    search,
    clearSearch
  };
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}