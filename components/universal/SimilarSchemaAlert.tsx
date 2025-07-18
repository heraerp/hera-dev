/**
 * HERA Universal Form Builder - Similar Schema Alert Component
 * Displays when similar existing schemas are found
 */

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  Database, 
  CheckCircle, 
  ArrowRight,
  Layers,
  RefreshCw
} from 'lucide-react';
import { SimilarityResult } from '@/lib/services/schema-registry-service';

interface SimilarSchemaAlertProps {
  similarSchemas: SimilarityResult[];
  onUseExisting: (entityType: string) => void;
  onCreateNew: () => void;
  onCreateVariant: (baseEntityType: string) => void;
}

export function SimilarSchemaAlert({
  similarSchemas,
  onUseExisting,
  onCreateNew,
  onCreateVariant
}: SimilarSchemaAlertProps) {
  if (similarSchemas.length === 0) return null;

  const topMatch = similarSchemas[0];
  const percentage = (topMatch.similarity_score * 100).toFixed(0);

  return (
    <Alert className={
      topMatch.recommendation === 'use_existing' 
        ? 'border-green-500 bg-green-50' 
        : 'border-yellow-500 bg-yellow-50'
    }>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-lg font-semibold">
        Similar Schema Found!
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-4">
          <p className="text-sm">
            We found existing schemas that match your requirement:
          </p>

          {similarSchemas.slice(0, 3).map((schema, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <h4 className="font-semibold">{schema.entity_name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {schema.entity_type}
                      </Badge>
                      <Badge 
                        className={
                          schema.similarity_score > 0.8 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {(schema.similarity_score * 100).toFixed(0)}% Match
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {schema.reason}
                    </p>

                    {schema.matching_fields.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Matching fields:</span>
                        <div className="flex flex-wrap gap-1">
                          {schema.matching_fields.map((field, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {schema.recommendation === 'use_existing' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onUseExisting(schema.entity_type)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Use Existing
                      </Button>
                    )}
                    
                    {schema.recommendation === 'create_variant' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCreateVariant(schema.entity_type)}
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Create Variant
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-600">
              {topMatch.recommendation === 'use_existing' 
                ? 'Recommended: Use the existing schema to avoid duplication.'
                : 'Consider if you need a new schema or can extend an existing one.'}
            </p>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onCreateNew}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Create New Anyway
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}