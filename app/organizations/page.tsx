/**
 * HERA Universal ERP - Organizations Management Page
 * Multi-tenancy management using core_organizations as main tenant key
 */

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  BarChart3,
  Globe,
  MapPin,
  Calendar,
  TrendingUp,
  Sparkles,
  Settings,
  ArrowRight,
  Shield,
  Database
} from "lucide-react"
import { Card } from "@/components/ui/revolutionary-card"
import { Button } from "@/components/ui/revolutionary-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import motionConfig from "@/lib/motion"
import { useOrganizationManagement } from "@/hooks/useOrganizationManagement"
import type { Organization } from "@/lib/services/organization-service"

export default function OrganizationsPage() {
  const [selectedClientId, setSelectedClientId] = React.useState<string>('2cd7c116-58fd-4860-b548-40cd0960cb4d') // Demo client ID
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedIndustry, setSelectedIndustry] = React.useState("all")
  const [selectedOrganization, setSelectedOrganization] = React.useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  
  const {
    organizations,
    currentOrganization,
    isLoading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,
    getOrganizationStats,
    loadClientOrganizations
  } = useOrganizationManagement(selectedClientId)

  // Filter organizations based on search and industry
  const filteredOrganizations = React.useMemo(() => {
    let filtered = organizations

    if (searchQuery) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.org_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedIndustry && selectedIndustry !== "all") {
      filtered = filtered.filter(org => org.industry === selectedIndustry)
    }

    return filtered
  }, [organizations, searchQuery, selectedIndustry])

  // Get unique industries for filter
  const industries = React.useMemo(() => {
    const industrySet = [...new Set(organizations.map(org => org.industry))]
    return industrySet.sort()
  }, [organizations])

  const handleCreateOrganization = async (orgData: any) => {
    try {
      await createOrganization({
        client_id: selectedClientId,
        ...orgData
      })
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating organization:', error)
    }
  }

  const handleSwitchOrganization = async (organizationId: string) => {
    try {
      await switchOrganization(organizationId)
      // Optionally redirect to dashboard with new organization context
    } catch (error) {
      console.error('Error switching organization:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary" />
                Organization Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage multi-tenant organizations with core_organizations as primary tenant key
              </p>
              {currentOrganization && (
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Current: {currentOrganization.name}
                  </Badge>
                  <Badge variant="secondary">
                    {currentOrganization.org_code}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Settings className="w-4 h-4" />}
              >
                Tenant Settings
              </Button>
              <Button
                variant="default"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateForm(true)}
              >
                Add Organization
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Analytics Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Organizations</p>
                <p className="text-2xl font-bold text-foreground">{organizations.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary/60" />
            </div>
          </Card>
          
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
                <p className="text-2xl font-bold text-foreground">
                  {organizations.filter(org => org.is_active).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-primary/60" />
            </div>
          </Card>
          
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Industries</p>
                <p className="text-2xl font-bold text-foreground">{industries.length}</p>
              </div>
              <Globe className="w-8 h-8 text-primary/60" />
            </div>
          </Card>
          
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Tenant</p>
                <p className="text-lg font-bold text-foreground">
                  {currentOrganization ? currentOrganization.org_code : 'None'}
                </p>
              </div>
              <Database className="w-8 h-8 text-primary/60" />
            </div>
          </Card>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
          className="mb-6"
        >
          <Card variant="glass" className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry.charAt(0).toUpperCase() + industry.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Organizations Grid/List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <Card variant="glass" className="p-12">
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <span className="ml-3 text-muted-foreground">Loading organizations...</span>
              </div>
            </Card>
          ) : error ? (
            <Card variant="glass" className="p-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => loadClientOrganizations(selectedClientId)} variant="outline">
                  Retry
                </Button>
              </div>
            </Card>
          ) : filteredOrganizations.length === 0 ? (
            <Card variant="glass" className="p-12">
              <div className="text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No organizations found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedIndustry !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Get started by adding your first organization"}
                </p>
                <Button onClick={() => setShowCreateForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
                  Add First Organization
                </Button>
              </div>
            </Card>
          ) : (
            <div className={cn(
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}>
              {filteredOrganizations.map((organization, index) => (
                <motion.div
                  key={organization.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...motionConfig.spring.swift, delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    <OrganizationCard
                      organization={organization}
                      isCurrent={currentOrganization?.id === organization.id}
                      onSwitch={() => handleSwitchOrganization(organization.id)}
                      onEdit={() => console.log('Edit', organization.id)}
                      onDelete={() => deleteOrganization(organization.id)}
                    />
                  ) : (
                    <OrganizationListItem
                      organization={organization}
                      isCurrent={currentOrganization?.id === organization.id}
                      onSwitch={() => handleSwitchOrganization(organization.id)}
                      onEdit={() => console.log('Edit', organization.id)}
                      onDelete={() => deleteOrganization(organization.id)}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Create Organization Form Modal */}
        {showCreateForm && (
          <CreateOrganizationModal
            onSubmit={handleCreateOrganization}
            onCancel={() => setShowCreateForm(false)}
          />
        )}
      </div>
    </div>
  )
}

// Organization Card Component
interface OrganizationCardProps {
  organization: Organization
  isCurrent: boolean
  onSwitch: () => void
  onEdit: () => void
  onDelete: () => void
}

function OrganizationCard({ organization, isCurrent, onSwitch, onEdit, onDelete }: OrganizationCardProps) {
  return (
    <Card
      variant="glass"
      interaction="hover"
      className={cn(
        "p-6 cursor-pointer group relative",
        isCurrent && "ring-2 ring-primary"
      )}
      onClick={onSwitch}
    >
      {isCurrent && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary text-primary-foreground">
            Current Tenant
          </Badge>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-foreground line-clamp-1">
              {organization.name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {organization.org_code}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {organization.industry}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {organization.country}
            </Badge>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mr-1" />
            {organization.country} • {organization.currency}
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            Created {new Date(organization.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 flex justify-between items-center">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            organization.is_active 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          )}>
            {organization.is_active ? "Active" : "Inactive"}
          </span>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Organization List Item Component
function OrganizationListItem({ organization, isCurrent, onSwitch, onEdit, onDelete }: OrganizationCardProps) {
  return (
    <Card
      variant="glass"
      interaction="hover"
      className={cn(
        "p-4 cursor-pointer group",
        isCurrent && "ring-2 ring-primary"
      )}
      onClick={onSwitch}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isCurrent ? "bg-primary/20" : "bg-primary/10"
          )}>
            <Building2 className={cn(
              "w-5 h-5",
              isCurrent ? "text-primary" : "text-primary/60"
            )} />
          </div>
          
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">
                {organization.name}
              </h3>
              {isCurrent && (
                <Badge variant="default" className="text-xs">
                  Current
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{organization.org_code}</span>
              <Badge variant="secondary" className="text-xs">
                {organization.industry}
              </Badge>
              <span>{organization.country} • {organization.currency}</span>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(organization.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            organization.is_active 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          )}>
            {organization.is_active ? "Active" : "Inactive"}
          </span>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onSwitch()
              }}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Simple Create Organization Modal (would be more complex in real implementation)
function CreateOrganizationModal({ onSubmit, onCancel }: {
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = React.useState({
    name: '',
    org_code: '',
    industry: 'technology',
    country: 'US',
    currency: 'USD'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card variant="glass" className="w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Create Organization</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter organization name"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Organization Code</label>
            <Input
              value={formData.org_code}
              onChange={(e) => setFormData(prev => ({ ...prev, org_code: e.target.value.toUpperCase() }))}
              placeholder="ORG-CODE"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Industry</label>
              <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium">Country</label>
              <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}