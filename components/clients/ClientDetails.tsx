'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Activity,
  TrendingUp,
  FileText,
  ExternalLink,
  Copy,
  Check,
  MoreVertical,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';
import { useClientManagement } from '@/hooks/useClientManagement';

interface ClientDetailsProps {
  clientId: string;
  onEdit: () => void;
  onClose: () => void;
}

interface Client {
  id: string;
  client_name: string;
  client_code: string;
  client_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  website?: string;
  notes?: string;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({
  clientId,
  onEdit,
  onClose
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { getClientById } = useClientManagement();

  useEffect(() => {
    const loadClient = async () => {
      setIsLoading(true);
      const clientData = await getClientById(clientId);
      setClient(clientData);
      setIsLoading(false);
    };

    loadClient();
  }, [clientId, getClientById]);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-12"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-muted-foreground">Loading client details...</p>
        </div>
      </motion.div>
    );
  }

  if (!client) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-12"
      >
        <div className="text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Client not found</h3>
          <p className="text-muted-foreground mb-4">The requested client could not be loaded.</p>
          <Button onClick={onClose} variant="outline">
            Go Back
          </Button>
        </div>
      </motion.div>
    );
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
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Clients
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<MoreVertical className="w-4 h-4" />}
            >
              More
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-6">
          <motion.div
            className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={motionConfig.spring.swift}
          >
            <Building2 className="w-8 h-8 text-primary" />
          </motion.div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {client.client_name}
                </h1>
                <Badge variant={client.is_active ? "default" : "secondary"}>
                  {client.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-muted-foreground">
                <CopyableField
                  value={client.client_code}
                  field="client_code"
                  copiedField={copiedField}
                  onCopy={handleCopy}
                  className="font-mono"
                />
                <Badge variant="outline" className="text-xs">
                  {client.client_type.charAt(0).toUpperCase() + client.client_type.slice(1)}
                </Badge>
                {client.industry && (
                  <span className="text-sm">{client.industry}</span>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {client.email && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Mail className="w-4 h-4" />}
                  onClick={() => window.open(`mailto:${client.email}`, '_blank')}
                >
                  Email
                </Button>
              )}
              {client.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Phone className="w-4 h-4" />}
                  onClick={() => window.open(`tel:${client.phone}`, '_blank')}
                >
                  Call
                </Button>
              )}
              {client.website && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Globe className="w-4 h-4" />}
                  rightIcon={<ExternalLink className="w-3 h-3" />}
                  onClick={() => window.open(client.website, '_blank')}
                >
                  Website
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <InfoRow label="Client Name" value={client.client_name} />
                <InfoRow 
                  label="Client Code" 
                  value={client.client_code} 
                  copyable
                  onCopy={() => handleCopy(client.client_code, 'client_code')}
                  copied={copiedField === 'client_code'}
                />
                <InfoRow label="Type" value={client.client_type} />
                {client.industry && <InfoRow label="Industry" value={client.industry} />}
                <InfoRow 
                  label="Status" 
                  value={
                    <Badge variant={client.is_active ? "default" : "secondary"}>
                      {client.is_active ? "Active" : "Inactive"}
                    </Badge>
                  }
                />
              </div>
            </Card>

            {/* Timeline */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Timeline
              </h3>
              
              <div className="space-y-4">
                <InfoRow 
                  label="Created" 
                  value={new Date(client.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                />
                <InfoRow 
                  label="Last Updated" 
                  value={new Date(client.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                />
                <InfoRow 
                  label="Days Active" 
                  value={Math.floor((Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                />
              </div>
            </Card>
          </div>

          {/* Notes */}
          {client.notes && (
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Notes
              </h3>
              <div className="prose prose-sm max-w-none text-foreground">
                <p className="whitespace-pre-wrap">{client.notes}</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {client.contact_person && (
                  <InfoRow label="Contact Person" value={client.contact_person} />
                )}
                {client.email && (
                  <InfoRow 
                    label="Email" 
                    value={client.email}
                    copyable
                    onCopy={() => handleCopy(client.email!, 'email')}
                    copied={copiedField === 'email'}
                    action={() => window.open(`mailto:${client.email}`, '_blank')}
                    actionIcon={<Mail className="w-4 h-4" />}
                  />
                )}
                {client.phone && (
                  <InfoRow 
                    label="Phone" 
                    value={client.phone}
                    copyable
                    onCopy={() => handleCopy(client.phone!, 'phone')}
                    copied={copiedField === 'phone'}
                    action={() => window.open(`tel:${client.phone}`, '_blank')}
                    actionIcon={<Phone className="w-4 h-4" />}
                  />
                )}
                {client.website && (
                  <InfoRow 
                    label="Website" 
                    value={client.website}
                    copyable
                    onCopy={() => handleCopy(client.website!, 'website')}
                    copied={copiedField === 'website'}
                    action={() => window.open(client.website, '_blank')}
                    actionIcon={<ExternalLink className="w-4 h-4" />}
                  />
                )}
              </div>
              
              {client.address && (
                <div className="space-y-4">
                  <InfoRow 
                    label="Address" 
                    value={
                      <div className="whitespace-pre-wrap">{client.address}</div>
                    }
                    copyable
                    onCopy={() => handleCopy(client.address!, 'address')}
                    copied={copiedField === 'address'}
                    action={() => window.open(`https://maps.google.com/search/${encodeURIComponent(client.address!)}`, '_blank')}
                    actionIcon={<MapPin className="w-4 h-4" />}
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </h3>
            
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">No recent activity</h4>
              <p className="text-muted-foreground">
                Client activity and interaction history will appear here.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Client Settings
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div>
                  <h4 className="font-medium">Client Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {client.is_active ? 'This client is currently active' : 'This client is inactive'}
                  </p>
                </div>
                <Badge variant={client.is_active ? "default" : "secondary"}>
                  {client.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-800">Danger Zone</h4>
                  <p className="text-sm text-red-600">
                    Permanently delete this client and all associated data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Client
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

// Helper Components
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  copied?: boolean;
  onCopy?: () => void;
  action?: () => void;
  actionIcon?: React.ReactNode;
}

function InfoRow({ 
  label, 
  value, 
  copyable, 
  copied, 
  onCopy, 
  action, 
  actionIcon 
}: InfoRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <dt className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </dt>
        <dd className="text-sm text-foreground">
          {value}
        </dd>
      </div>
      
      {(copyable || action) && (
        <div className="flex items-center gap-1">
          {copyable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-6 w-6 p-0"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          )}
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action}
              className="h-6 w-6 p-0"
            >
              {actionIcon}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

interface CopyableFieldProps {
  value: string;
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  className?: string;
}

function CopyableField({ 
  value, 
  field, 
  copiedField, 
  onCopy, 
  className 
}: CopyableFieldProps) {
  return (
    <span 
      className={cn(
        "cursor-pointer hover:text-foreground transition-colors flex items-center gap-1",
        className
      )}
      onClick={() => onCopy(value, field)}
    >
      {value}
      {copiedField === field ? (
        <Check className="w-3 h-3 text-green-600" />
      ) : (
        <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </span>
  );
}