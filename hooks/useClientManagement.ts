'use client';

import { useState, useEffect, useCallback } from 'react';
import UniversalCrudService from '@/lib/services/universalCrudService';

interface Client {
  id: string;
  client_name: string;
  client_code: string;
  client_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Extended fields from dynamic data
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  website?: string;
  notes?: string;
}

interface ClientAnalytics {
  total_clients: number;
  active_clients: number;
  inactive_clients: number;
  clients_by_type: { [key: string]: number };
  recent_clients: number;
  growth_rate: number;
}

export const useClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load clients from database
  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      // First get clients from core_clients table
      const { data: clientsData, error: clientsError } = await supabase
        .from('core_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // For now, we'll use the basic client data
      // In production, you might want to join with additional tables for extended data
      setClients(clientsData || []);

    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Failed to load clients');
      
      // Fallback to mock data for demo
      setClients(generateMockClients());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new client
  const createClient = useCallback(async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('core_clients')
        .insert([{
          client_name: clientData.client_name,
          client_code: clientData.client_code,
          client_type: clientData.client_type,
          is_active: clientData.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh the clients list
      await loadClients();
      
      return data;
    } catch (err) {
      console.error('Error creating client:', err);
      throw new Error('Failed to create client');
    }
  }, [loadClients]);

  // Update an existing client
  const updateClient = useCallback(async (clientId: string, clientData: Partial<Client>) => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('core_clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;

      // Refresh the clients list
      await loadClients();
      
      return data;
    } catch (err) {
      console.error('Error updating client:', err);
      throw new Error('Failed to update client');
    }
  }, [loadClients]);

  // Delete a client
  const deleteClient = useCallback(async (clientId: string) => {
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('core_clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      // Refresh the clients list
      await loadClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      throw new Error('Failed to delete client');
    }
  }, [loadClients]);

  // Get client by ID
  const getClientById = useCallback(async (clientId: string): Promise<Client | null> => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('core_clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error getting client:', err);
      return null;
    }
  }, []);

  // Get client analytics
  const getClientAnalytics = useCallback((): ClientAnalytics => {
    const total_clients = clients.length;
    const active_clients = clients.filter(c => c.is_active).length;
    const inactive_clients = total_clients - active_clients;
    
    // Count clients by type
    const clients_by_type = clients.reduce((acc, client) => {
      acc[client.client_type] = (acc[client.client_type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Count recent clients (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent_clients = clients.filter(c => 
      new Date(c.created_at) > thirtyDaysAgo
    ).length;

    // Calculate growth rate (mock calculation)
    const growth_rate = recent_clients > 0 ? (recent_clients / total_clients) * 100 : 0;

    return {
      total_clients,
      active_clients,
      inactive_clients,
      clients_by_type,
      recent_clients,
      growth_rate
    };
  }, [clients]);

  // Search clients
  const searchClients = useCallback(async (query: string) => {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('core_clients')
        .select('*')
        .or(`client_name.ilike.%${query}%,client_code.ilike.%${query}%,client_type.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching clients:', err);
      return [];
    }
  }, []);

  // Generate client code automatically
  const generateClientCode = useCallback((clientName: string, clientType: string): string => {
    // Convert name to uppercase, remove spaces and special characters
    const nameCode = clientName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 15);

    // Add type suffix
    const typeCode = clientType.toUpperCase().substring(0, 3);
    
    return `${nameCode}-${typeCode}`;
  }, []);

  // Validate client data
  const validateClientData = useCallback((clientData: Partial<Client>): string[] => {
    const errors: string[] = [];

    if (!clientData.client_name || clientData.client_name.trim().length < 2) {
      errors.push('Client name must be at least 2 characters long');
    }

    if (!clientData.client_code || clientData.client_code.trim().length < 3) {
      errors.push('Client code must be at least 3 characters long');
    }

    if (!clientData.client_type || clientData.client_type.trim().length < 2) {
      errors.push('Client type is required');
    }

    // Check for duplicate client codes
    const existingClient = clients.find(c => 
      c.client_code === clientData.client_code && c.id !== clientData.id
    );
    if (existingClient) {
      errors.push('Client code already exists');
    }

    return errors;
  }, [clients]);

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
    getClientById,
    getClientAnalytics,
    searchClients,
    generateClientCode,
    validateClientData,
    refreshClients: loadClients
  };
};

// Mock data for demo purposes
function generateMockClients(): Client[] {
  return [
    {
      id: '1',
      client_name: 'Pizza Palace Restaurant',
      client_code: 'PIZZA-PALACE',
      client_type: 'restaurant',
      is_active: true,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      contact_person: 'Mario Rossi',
      email: 'mario@pizzapalace.com',
      phone: '+1-555-0123',
      address: '123 Main St, City, State 12345'
    },
    {
      id: '2',
      client_name: 'Fashion Store Inc',
      client_code: 'FASHION-STORE',
      client_type: 'retail',
      is_active: true,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      contact_person: 'Sarah Johnson',
      email: 'sarah@fashionstore.com',
      phone: '+1-555-0124'
    },
    {
      id: '3',
      client_name: 'Tech Solutions Inc',
      client_code: 'TECH-SOL',
      client_type: 'technology',
      is_active: true,
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      contact_person: 'John Doe',
      email: 'john@techsolutions.com',
      phone: '+1-555-0125'
    },
    {
      id: '4',
      client_name: 'Green Market Store',
      client_code: 'GREEN-MKT',
      client_type: 'retail',
      is_active: false,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      contact_person: 'Alice Green',
      email: 'alice@greenmarket.com',
      phone: '+1-555-0126'
    },
    {
      id: '5',
      client_name: 'Legal Partners LLC',
      client_code: 'LEGAL-PART',
      client_type: 'legal',
      is_active: true,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      contact_person: 'Robert Smith',
      email: 'robert@legalpartners.com',
      phone: '+1-555-0127'
    },
    {
      id: '6',
      client_name: 'Modern Cafe & Bistro',
      client_code: 'MOD-CAFE',
      client_type: 'restaurant',
      is_active: true,
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      contact_person: 'Emma Wilson',
      email: 'emma@moderncafe.com',
      phone: '+1-555-0128'
    }
  ];
}