/**
 * HERA Universal Form Builder - Existing Schemas Display
 * Shows all registered schemas in the organization
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Search, 
  Layers, 
  Calendar,
  BarChart3,
  Brain,
  Eye,
  Copy,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegisteredSchema, schemaRegistry } from '@/lib/services/schema-registry-service';
import { motion } from 'framer-motion';

interface ExistingSchemasDisplayProps {
  organizationId: string;
  onSelectSchema?: (schema: RegisteredSchema) => void;
  onCreateVariant?: (baseSchema: RegisteredSchema) => void;
  className?: string;
}

export function ExistingSchemasDisplay({
  organizationId,
  onSelectSchema,
  onCreateVariant,
  className
}: ExistingSchemasDisplayProps) {
  const [schemas, setSchemas] = useState<RegisteredSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState<string>('all');

  useEffect(() => {
    loadSchemas();
  }, [organizationId]);

  const loadSchemas = async () => {
    try {
      setLoading(true);
      const registeredSchemas = await schemaRegistry.getRegisteredSchemas(organizationId);
      setSchemas(registeredSchemas);
    } catch (error) {
      console.error('Error loading schemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemas = schemas.filter(schema => {
    const matchesSearch = searchTerm === '' || 
      schema.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schema.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schema.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesDomain = filterDomain === 'all' || schema.business_domain === filterDomain;
    
    return matchesSearch && matchesDomain;
  });

  const domains = ['all', ...new Set(schemas.map(s => s.business_domain).filter(Boolean))];

  const getDomainColor = (domain?: string) => {
    const colors: Record<string, string> = {
      finance: 'from-green-500 to-emerald-600',
      crm: 'from-blue-500 to-indigo-600',
      inventory: 'from-purple-500 to-indigo-600',
      hr: 'from-orange-500 to-red-600',
      project: 'from-teal-500 to-cyan-600',
      restaurant: 'from-amber-500 to-orange-600',
      retail: 'from-pink-500 to-rose-600',
      general: 'from-gray-500 to-slate-600'
    };
    return colors[domain || 'general'] || colors.general;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Existing Schemas ({schemas.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSchemas}
          >
            Refresh
          </Button>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search schemas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <div className="flex gap-2">
              {domains.map(domain => (
                <Badge
                  key={domain}
                  variant={filterDomain === domain ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterDomain(domain)}
                >
                  {domain === 'all' ? 'All Domains' : domain}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredSchemas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No schemas found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchemas.map((schema, index) => (
              <motion.div
                key={schema.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-white',
                        getDomainColor(schema.business_domain)
                      )}>
                        <Database className="h-5 w-5" />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {schema.ai_generated && (
                          <Badge variant="secondary" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                        {schema.confidence_score && (
                          <Badge variant="outline" className="text-xs">
                            {(schema.confidence_score * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-1">{schema.entity_name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{schema.entity_type}</p>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Layers className="h-3 w-3" />
                          Fields
                        </span>
                        <span className="font-medium">{schema.field_count}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-600">
                          <BarChart3 className="h-3 w-3" />
                          Records
                        </span>
                        <span className="font-medium">{schema.usage_count}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-3 w-3" />
                          Created
                        </span>
                        <span className="font-medium">
                          {new Date(schema.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {schema.keywords && schema.keywords.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {schema.keywords.slice(0, 3).map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {schema.keywords.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{schema.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 flex gap-2">
                      {onSelectSchema && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => onSelectSchema(schema)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                      {onCreateVariant && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => onCreateVariant(schema)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Variant
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}