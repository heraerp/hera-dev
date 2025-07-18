"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Sparkles,
  Download,
  Upload,
  Settings,
  MoreVertical
} from "lucide-react"
import { NavigationProvider } from "@/components/providers/navigation-provider"
import { Sidebar } from "@/components/navigation/sidebar"
import { Breadcrumbs } from "@/components/navigation/breadcrumbs"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import motionConfig from "@/lib/motion"
import { useUniversalClientManagement } from "@/hooks/useUniversalClientManagement"
import { UniversalClientForm } from "@/components/clients/UniversalClientForm"
import { UniversalClientDetails } from "@/components/clients/UniversalClientDetails"
import { ClientAnalytics } from "@/components/clients/ClientAnalytics"

// Sample navigation items (would come from context)
const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: TrendingUp,
    category: "main"
  },
  {
    id: "clients",
    label: "Clients",
    href: "/clients",
    icon: Users,
    category: "business"
  }
]

const navigationCategories = [
  {
    id: "business",
    label: "Business",
    icon: Building2,
    items: navigationItems.filter(item => item.category === "business")
  }
]

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedType, setSelectedType] = React.useState("all")
  const [selectedClient, setSelectedClient] = React.useState<string | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')
  
  const {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refreshClients,
    getClientAnalytics,
    searchClients
  } = useUniversalClientManagement()

  // Filter clients based on search and type
  const filteredClients = React.useMemo(() => {
    let filtered = clients

    if (searchQuery) {
      filtered = filtered.filter(client =>
        client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.client_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.client_type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedType && selectedType !== "all") {
      filtered = filtered.filter(client => client.client_type === selectedType)
    }

    return filtered
  }, [clients, searchQuery, selectedType])

  // Get unique client types for filter
  const clientTypes = React.useMemo(() => {
    const types = [...new Set(clients.map(client => client.client_type))]
    return types.sort()
  }, [clients])

  const handleCreateClient = () => {
    setFormMode('create')
    setSelectedClient(null)
    setShowForm(true)
  }

  const handleEditClient = (clientId: string) => {
    setFormMode('edit')
    setSelectedClient(clientId)
    setShowForm(true)
  }

  const handleViewClient = (clientId: string) => {
    setSelectedClient(clientId)
    setShowForm(false)
  }

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(clientId)
      } catch (error) {
        console.error('Error deleting client:', error)
      }
    }
  }

  const handleFormSubmit = async (clientData: any) => {
    try {
      if (formMode === 'create') {
        await createClient(clientData)
      } else if (selectedClient) {
        await updateClient(selectedClient, clientData)
      }
      setShowForm(false)
      setSelectedClient(null)
    } catch (error) {
      console.error('Error saving client:', error)
    }
  }

  return (
    <NavigationProvider
      initialItems={navigationItems}
      initialCategories={navigationCategories}
      enableAI={true}
      enableAnalytics={true}
    >
      <div className="min-h-screen bg-background flex">
        {/* Revolutionary Sidebar */}
        <Sidebar
          enableGestures={true}
          enableAI={true}
          showLogo={true}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {/* Header */}
          <motion.header
            className="p-6 border-b border-border/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.swift}
          >
            <div className="flex items-center justify-between">
              <div>
                <motion.h1
                  className="text-3xl font-bold text-foreground flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={motionConfig.spring.bounce}
                >
                  <Users className="w-8 h-8 text-primary" />
                  Client Management
                </motion.h1>
                <p className="text-muted-foreground mt-1">
                  Manage your business relationships with intelligent automation
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  interaction="magnetic"
                >
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Upload className="w-4 h-4" />}
                  interaction="magnetic"
                >
                  Import
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={handleCreateClient}
                  interaction="magnetic"
                >
                  Add Client
                </Button>
              </div>
            </div>
          </motion.header>

          {/* Breadcrumbs */}
          <div className="px-6 py-3 border-b border-border/50">
            <Breadcrumbs
              showHome={true}
              showBack={false}
              enableAI={true}
              showContextualInfo={true}
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-180px)]">
            <AnimatePresence mode="wait">
              {showForm ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={motionConfig.spring.swift}
                >
                  <UniversalClientForm
                    mode={formMode}
                    client={selectedClient ? clients.find(c => c.id === selectedClient) : null}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                      setShowForm(false)
                      setSelectedClient(null)
                    }}
                  />
                </motion.div>
              ) : selectedClient ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={motionConfig.spring.swift}
                >
                  <UniversalClientDetails
                    clientId={selectedClient}
                    onEdit={() => handleEditClient(selectedClient)}
                    onClose={() => setSelectedClient(null)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={motionConfig.spring.swift}
                  className="space-y-6"
                >
                  {/* Analytics Overview */}
                  <ClientAnalytics />

                  {/* Search and Filters */}
                  <Card variant="glass" className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex flex-1 gap-4 items-center">
                        <div className="relative flex-1 max-w-md">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger className="w-48">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {clientTypes.map(type => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
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

                  {/* Client List/Grid */}
                  {isLoading ? (
                    <Card variant="glass" className="p-12">
                      <div className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-8 h-8 text-primary" />
                        </motion.div>
                        <span className="ml-3 text-muted-foreground">Loading clients...</span>
                      </div>
                    </Card>
                  ) : error ? (
                    <Card variant="glass" className="p-12">
                      <div className="text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={refreshClients} variant="outline">
                          Retry
                        </Button>
                      </div>
                    </Card>
                  ) : filteredClients.length === 0 ? (
                    <Card variant="glass" className="p-12">
                      <div className="text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No clients found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchQuery || selectedType !== "all" 
                            ? "Try adjusting your search or filters" 
                            : "Get started by adding your first client"}
                        </p>
                        <Button onClick={handleCreateClient} leftIcon={<Plus className="w-4 h-4" />}>
                          Add First Client
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div className={cn(
                      viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "space-y-4"
                    )}>
                      {filteredClients.map((client, index) => (
                        <motion.div
                          key={client.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...motionConfig.spring.swift, delay: index * 0.05 }}
                        >
                          {viewMode === 'grid' ? (
                            <ClientCard
                              client={client}
                              onView={() => handleViewClient(client.id)}
                              onEdit={() => handleEditClient(client.id)}
                              onDelete={() => handleDeleteClient(client.id)}
                            />
                          ) : (
                            <ClientListItem
                              client={client}
                              onView={() => handleViewClient(client.id)}
                              onEdit={() => handleEditClient(client.id)}
                              onDelete={() => handleDeleteClient(client.id)}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </NavigationProvider>
  )
}

// Client Card Component for Grid View
interface ClientCardProps {
  client: any
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

function ClientCard({ client, onView, onEdit, onDelete }: ClientCardProps) {
  return (
    <Card
      variant="glass"
      interaction="hover"
      className="p-6 cursor-pointer group"
      onClick={onView}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-foreground line-clamp-1">
              {client.client_name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {client.client_code}
            </p>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {client.client_type}
          </Badge>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            Created {new Date(client.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 flex justify-between items-center">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            client.is_active 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          )}>
            {client.is_active ? "Active" : "Inactive"}
          </span>
          
          <div className="flex gap-1">
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

// Client List Item Component for List View
function ClientListItem({ client, onView, onEdit, onDelete }: ClientCardProps) {
  return (
    <Card
      variant="glass"
      interaction="hover"
      className="p-4 cursor-pointer group"
      onClick={onView}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-foreground">
              {client.client_name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{client.client_code}</span>
              <Badge variant="secondary" className="text-xs">
                {client.client_type}
              </Badge>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(client.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            client.is_active 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          )}>
            {client.is_active ? "Active" : "Inactive"}
          </span>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onView()
              }}
            >
              <Eye className="w-4 h-4" />
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