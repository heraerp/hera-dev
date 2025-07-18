/**
 * HERA Universal ERP - Universal Client Details Component
 * Comprehensive client view with universal master data integration
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Edit, 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Activity,
  FileText,
  Database,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  BarChart3,
  PieChart,
  Sparkles
} from 'lucide-react'
import { Card } from '@/components/ui/revolutionary-card'
import { Button } from '@/components/ui/revolutionary-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import motionConfig from '@/lib/motion'
import { useUniversalClientManagement } from '@/hooks/useUniversalClientManagement'
import type { UniversalClient } from '@/lib/services/universal-client-service'

interface UniversalClientDetailsProps {
  clientId: string
  onEdit: () => void
  onClose: () => void
}

export function UniversalClientDetails({ clientId, onEdit, onClose }: UniversalClientDetailsProps) {
  const { getUniversalClient, getClientAnalytics } = useUniversalClientManagement()
  const [client, setClient] = useState<UniversalClient | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadClientData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const [clientData, analyticsData] = await Promise.all([
          getUniversalClient(clientId),
          getClientAnalytics(clientId)
        ])
        
        setClient(clientData)
        setAnalytics(analyticsData)
      } catch (err) {
        console.error('Error loading client data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load client data')
      } finally {
        setIsLoading(false)
      }
    }

    loadClientData()
  }, [clientId, getUniversalClient, getClientAnalytics])

  if (isLoading) {
    return (
      <Card variant="glass" className="p-12">
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <span className="ml-3 text-muted-foreground">Loading client details...</span>
        </div>
      </Card>
    )
  }

  if (error || !client) {
    return (
      <Card variant="glass" className="p-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Client</h3>
          <p className="text-muted-foreground mb-4">{error || 'Client not found'}</p>
          <Button onClick={onClose} variant="outline">
            Go Back
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={motionConfig.spring.swift}
      className="space-y-6"
    >
      {/* Header */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {client.client_name}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-muted-foreground font-mono">
                    {client.client_code}
                  </span>
                  <Badge variant="secondary">
                    {client.client_type}
                  </Badge>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    client.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}>
                    {client.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onEdit}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit Client
          </Button>
        </div>
      </Card>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalOrganizations}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary/60" />
            </div>
          </Card>
          
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entities</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalEntities}</p>
              </div>
              <Database className="w-8 h-8 text-primary/60" />
            </div>
          </Card>
          
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalTransactions}</p>
              </div>
              <FileText className="w-8 h-8 text-primary/60" />
            </div>
          </Card>
          
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${analytics.totalTransactionAmount.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/60" />
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <Card variant="glass" className="p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Basic Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Client Name</p>
                    <p className="font-medium">{client.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client Code</p>
                    <p className="font-mono">{client.client_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client Type</p>
                    <Badge variant="secondary">{client.client_type}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs",
                      client.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    )}>
                      {client.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Updated</p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(client.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card variant="glass" className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Metadata Fields</span>
                    <span>{analytics?.metadataCount || 0}</span>
                  </div>
                  <Progress value={(analytics?.metadataCount || 0) * 10} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dynamic Fields</span>
                    <span>{analytics?.dynamicFieldsCount || 0}</span>
                  </div>
                  <Progress value={(analytics?.dynamicFieldsCount || 0) * 20} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Organizations</span>
                    <span>{analytics?.totalOrganizations || 0}</span>
                  </div>
                  <Progress value={(analytics?.totalOrganizations || 0) * 25} className="h-2" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Organizations ({client.organizations?.length || 0})
            </h3>
            
            {client.organizations && client.organizations.length > 0 ? (
              <div className="space-y-4">
                {client.organizations.map(org => (
                  <Card key={org.id} variant="outline" className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{org.name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">{org.org_code}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{org.industry}</span>
                          <span>{org.country}</span>
                          <span>{org.currency}</span>
                        </div>
                      </div>
                      <Badge variant={org.is_active ? "default" : "secondary"}>
                        {org.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No organizations found for this client</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Entities ({client.entities?.length || 0})
            </h3>
            
            {client.entities && client.entities.length > 0 ? (
              <div className="space-y-4">
                {client.entities.map(entity => (
                  <Card key={entity.id} variant="outline" className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{entity.entity_name}</h4>
                        <p className="text-sm text-muted-foreground font-mono">{entity.entity_code}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{entity.entity_type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entity.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant={entity.is_active ? "default" : "secondary"}>
                        {entity.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No entities found for this client</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Metadata ({client.metadata?.length || 0})
            </h3>
            
            {client.metadata && client.metadata.length > 0 ? (
              <div className="space-y-4">
                {client.metadata.map(meta => (
                  <Card key={meta.id} variant="outline" className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{meta.metadata_key}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{meta.metadata_category}</Badge>
                          {meta.ai_generated && (
                            <Badge variant="outline" className="text-primary">
                              AI Generated ({Math.round(meta.ai_confidence_score * 100)}%)
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {JSON.stringify(meta.metadata_value)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {meta.metadata_type} • Updated {new Date(meta.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No metadata found for this client</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Recent Transactions ({client.transactions?.recent_transactions?.length || 0})
            </h3>
            
            {client.transactions?.recent_transactions && client.transactions.recent_transactions.length > 0 ? (
              <div className="space-y-4">
                {client.transactions.recent_transactions.map(txn => (
                  <Card key={txn.id} variant="outline" className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{txn.transaction_number}</h4>
                        <p className="text-sm text-muted-foreground">{txn.transaction_type}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(txn.transaction_date).toLocaleDateString()}</span>
                          <span>{txn.currency} {txn.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge variant={
                        txn.status === 'completed' ? 'default' : 
                        txn.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {txn.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions found for this client</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activity Timeline
            </h3>
            
            {analytics?.activityTimeline && analytics.activityTimeline.length > 0 ? (
              <div className="space-y-4">
                {analytics.activityTimeline.map((event: any, index: number) => (
                  <Card key={index} variant="outline" className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="font-medium">{event.event_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        {event.event_data && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {JSON.stringify(event.event_data)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activity timeline available</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}

export default UniversalClientDetails