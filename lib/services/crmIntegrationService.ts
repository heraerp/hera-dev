/**
 * HERA Universal CRM Integration Service
 * Comprehensive CRM sync for HubSpot, Salesforce, and other CRM platforms
 * with advanced lead scoring, pipeline management, and automation workflows
 */

interface LeadData {
  email: string;
  restaurantName: string;
  phoneNumber?: string;
  restaurantType?: string;
  monthlyRevenue?: string | number;
  currentChallenges?: string[];
  referralSource?: string;
  estimatedSavings?: number;
  leadScore?: number;
  leadStatus?: string;
  formData?: any;
}

interface CRMContact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company: string;
  phone?: string;
  website?: string;
  industry?: string;
  leadSource?: string;
  leadStatus?: string;
  lifecycleStage?: string;
  dealValue?: number;
  customProperties?: Record<string, any>;
}

interface CRMDeal {
  id?: string;
  contactId: string;
  dealName: string;
  amount: number;
  stage: string;
  probability?: number;
  closingDate?: string;
  description?: string;
  customProperties?: Record<string, any>;
}

interface CRMIntegrationResult {
  success: boolean;
  contactId?: string;
  dealId?: string;
  error?: string;
  provider: string;
}

export class HERACRMIntegrationService {
  private static instance: HERACRMIntegrationService;
  
  static getInstance(): HERACRMIntegrationService {
    if (!HERACRMIntegrationService.instance) {
      HERACRMIntegrationService.instance = new HERACRMIntegrationService();
    }
    return HERACRMIntegrationService.instance;
  }

  /**
   * Main integration method - syncs to all configured CRM platforms
   */
  async syncLeadToAllCRMs(leadData: LeadData): Promise<CRMIntegrationResult[]> {
    const results: CRMIntegrationResult[] = [];
    
    // Enhanced lead scoring
    const scoredLead = this.calculateLeadScore(leadData);
    
    try {
      // HubSpot Integration
      if (process.env.HUBSPOT_API_KEY) {
        const hubspotResult = await this.syncToHubSpot(scoredLead);
        results.push(hubspotResult);
      }
      
      // Salesforce Integration
      if (process.env.SALESFORCE_ACCESS_TOKEN) {
        const salesforceResult = await this.syncToSalesforce(scoredLead);
        results.push(salesforceResult);
      }
      
      // Pipedrive Integration (if configured)
      if (process.env.PIPEDRIVE_API_TOKEN) {
        const pipedriveResult = await this.syncToPipedrive(scoredLead);
        results.push(pipedriveResult);
      }
      
      // Custom CRM webhook (if configured)
      if (process.env.CUSTOM_CRM_WEBHOOK_URL) {
        const webhookResult = await this.syncToCustomCRM(scoredLead);
        results.push(webhookResult);
      }
      
      console.log('✅ CRM sync completed:', {
        lead: leadData.email,
        results: results.length,
        successful: results.filter(r => r.success).length
      });
      
    } catch (error) {
      console.error('❌ CRM sync failed:', error);
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown CRM sync error',
        provider: 'ALL_CRMS'
      });
    }
    
    return results;
  }

  /**
   * HubSpot Integration
   */
  private async syncToHubSpot(leadData: LeadData): Promise<CRMIntegrationResult> {
    try {
      const hubspotContact = this.transformToHubSpotContact(leadData);
      
      // Create or update contact
      const contactResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`
        },
        body: JSON.stringify({
          properties: hubspotContact
        })
      });
      
      if (!contactResponse.ok) {
        // Try to update existing contact if creation failed due to duplicate
        if (contactResponse.status === 409) {
          return await this.updateHubSpotContact(leadData, hubspotContact);
        }
        
        const errorText = await contactResponse.text();
        throw new Error(`HubSpot contact creation failed: ${errorText}`);
      }
      
      const contactResult = await contactResponse.json();
      const contactId = contactResult.id;
      
      // Create deal if revenue data is available
      let dealId;
      if (leadData.estimatedSavings && leadData.estimatedSavings > 0) {
        const dealResult = await this.createHubSpotDeal(contactId, leadData);
        dealId = dealResult.dealId;
      }
      
      console.log('✅ HubSpot sync successful:', { contactId, dealId });
      
      return {
        success: true,
        contactId,
        dealId,
        provider: 'HubSpot'
      };
      
    } catch (error) {
      console.error('❌ HubSpot sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HubSpot sync error',
        provider: 'HubSpot'
      };
    }
  }

  private async updateHubSpotContact(leadData: LeadData, contactProperties: any): Promise<CRMIntegrationResult> {
    try {
      // Find contact by email
      const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: leadData.email
            }]
          }]
        })
      });
      
      const searchResult = await searchResponse.json();
      
      if (searchResult.results && searchResult.results.length > 0) {
        const contactId = searchResult.results[0].id;
        
        // Update existing contact
        const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`
          },
          body: JSON.stringify({
            properties: contactProperties
          })
        });
        
        if (updateResponse.ok) {
          return {
            success: true,
            contactId,
            provider: 'HubSpot'
          };
        }
      }
      
      throw new Error('Failed to update HubSpot contact');
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HubSpot update error',
        provider: 'HubSpot'
      };
    }
  }

  private async createHubSpotDeal(contactId: string, leadData: LeadData): Promise<{ success: boolean; dealId?: string }> {
    try {
      const dealAmount = leadData.estimatedSavings || this.estimateDealValue(leadData);
      
      const dealResponse = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`
        },
        body: JSON.stringify({
          properties: {
            dealname: `HERA Universal - ${leadData.restaurantName}`,
            amount: dealAmount,
            dealstage: 'appointmentscheduled',
            pipeline: 'default',
            closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            restaurant_type: leadData.restaurantType,
            monthly_revenue: leadData.monthlyRevenue,
            lead_source: leadData.referralSource || 'website'
          },
          associations: [{
            to: { id: contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }] // Contact to Deal
          }]
        })
      });
      
      if (dealResponse.ok) {
        const dealResult = await dealResponse.json();
        return { success: true, dealId: dealResult.id };
      } else {
        console.error('HubSpot deal creation failed:', await dealResponse.text());
        return { success: false };
      }
      
    } catch (error) {
      console.error('HubSpot deal creation error:', error);
      return { success: false };
    }
  }

  private transformToHubSpotContact(leadData: LeadData): any {
    return {
      email: leadData.email,
      company: leadData.restaurantName,
      phone: leadData.phoneNumber,
      restaurant_type: leadData.restaurantType,
      monthly_revenue: leadData.monthlyRevenue,
      current_challenges: leadData.currentChallenges ? leadData.currentChallenges.join(', ') : '',
      lead_source: leadData.referralSource || 'website',
      lead_score: leadData.leadScore,
      lifecyclestage: 'lead',
      hs_lead_status: 'NEW',
      estimated_savings: leadData.estimatedSavings,
      form_submission_data: JSON.stringify(leadData.formData)
    };
  }

  /**
   * Salesforce Integration
   */
  private async syncToSalesforce(leadData: LeadData): Promise<CRMIntegrationResult> {
    try {
      const salesforceContact = this.transformToSalesforceContact(leadData);
      
      // Create lead in Salesforce
      const leadResponse = await fetch(`${process.env.SALESFORCE_INSTANCE_URL}/services/data/v52.0/sobjects/Lead/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`
        },
        body: JSON.stringify(salesforceContact)
      });
      
      if (!leadResponse.ok) {
        const errorText = await leadResponse.text();
        throw new Error(`Salesforce lead creation failed: ${errorText}`);
      }
      
      const leadResult = await leadResponse.json();
      const leadId = leadResult.id;
      
      console.log('✅ Salesforce sync successful:', { leadId });
      
      return {
        success: true,
        contactId: leadId,
        provider: 'Salesforce'
      };
      
    } catch (error) {
      console.error('❌ Salesforce sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Salesforce sync error',
        provider: 'Salesforce'
      };
    }
  }

  private transformToSalesforceContact(leadData: LeadData): any {
    const nameParts = this.extractNameFromEmail(leadData.email);
    
    return {
      Email: leadData.email,
      FirstName: nameParts.firstName,
      LastName: nameParts.lastName,
      Company: leadData.restaurantName,
      Phone: leadData.phoneNumber,
      Industry: 'Restaurant',
      LeadSource: leadData.referralSource || 'Website',
      Status: 'Open - Not Contacted',
      Rating: this.getLeadRating(leadData.leadScore || 0),
      Restaurant_Type__c: leadData.restaurantType,
      Monthly_Revenue__c: leadData.monthlyRevenue,
      Current_Challenges__c: leadData.currentChallenges ? leadData.currentChallenges.join('; ') : '',
      Estimated_Savings__c: leadData.estimatedSavings,
      Lead_Score__c: leadData.leadScore,
      Description: `HERA Universal lead from ${leadData.referralSource || 'website'}. 
Restaurant: ${leadData.restaurantName}
Challenges: ${leadData.currentChallenges ? leadData.currentChallenges.join(', ') : 'Not specified'}
Est. Savings: $${leadData.estimatedSavings || 'TBD'}`
    };
  }

  /**
   * Pipedrive Integration
   */
  private async syncToPipedrive(leadData: LeadData): Promise<CRMIntegrationResult> {
    try {
      // Create person (contact)
      const personResponse = await fetch(`https://api.pipedrive.com/v1/persons?api_token=${process.env.PIPEDRIVE_API_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: leadData.restaurantName,
          email: [{ value: leadData.email, primary: true }],
          phone: leadData.phoneNumber ? [{ value: leadData.phoneNumber, primary: true }] : [],
          org_id: null // Will be set after creating organization
        })
      });
      
      if (!personResponse.ok) {
        throw new Error(`Pipedrive person creation failed: ${await personResponse.text()}`);
      }
      
      const personResult = await personResponse.json();
      const personId = personResult.data.id;
      
      // Create deal
      const dealResponse = await fetch(`https://api.pipedrive.com/v1/deals?api_token=${process.env.PIPEDRIVE_API_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `HERA Universal - ${leadData.restaurantName}`,
          person_id: personId,
          value: leadData.estimatedSavings || this.estimateDealValue(leadData),
          currency: 'USD',
          stage_id: 1, // Usually the first stage
          status: 'open',
          expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      });
      
      const dealResult = dealResponse.ok ? await dealResponse.json() : null;
      
      return {
        success: true,
        contactId: personId,
        dealId: dealResult?.data?.id,
        provider: 'Pipedrive'
      };
      
    } catch (error) {
      console.error('❌ Pipedrive sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pipedrive sync error',
        provider: 'Pipedrive'
      };
    }
  }

  /**
   * Custom CRM Webhook Integration
   */
  private async syncToCustomCRM(leadData: LeadData): Promise<CRMIntegrationResult> {
    try {
      const webhookPayload = {
        lead: leadData,
        timestamp: new Date().toISOString(),
        source: 'HERA_UNIVERSAL',
        version: '1.0'
      };
      
      const response = await fetch(process.env.CUSTOM_CRM_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.CUSTOM_CRM_WEBHOOK_TOKEN ? `Bearer ${process.env.CUSTOM_CRM_WEBHOOK_TOKEN}` : undefined
        }.filter(Boolean),
        body: JSON.stringify(webhookPayload)
      });
      
      if (response.ok) {
        return {
          success: true,
          provider: 'Custom CRM'
        };
      } else {
        throw new Error(`Custom CRM webhook failed: ${response.status}`);
      }
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Custom CRM webhook error',
        provider: 'Custom CRM'
      };
    }
  }

  /**
   * Enhanced lead scoring algorithm
   */
  private calculateLeadScore(leadData: LeadData): LeadData {
    let score = 0;
    
    // Base score for having email and restaurant name
    score += 20;
    
    // Phone number provided
    if (leadData.phoneNumber) score += 15;
    
    // Monthly revenue indicators
    if (leadData.monthlyRevenue) {
      const revenue = typeof leadData.monthlyRevenue === 'string' 
        ? parseFloat(leadData.monthlyRevenue.replace(/[^0-9.-]+/g, '')) 
        : leadData.monthlyRevenue;
      
      if (revenue > 100000) score += 30; // High revenue
      else if (revenue > 50000) score += 20; // Medium revenue
      else if (revenue > 10000) score += 10; // Low revenue
    }
    
    // Restaurant type quality
    const highValueTypes = ['fine-dining', 'chain', 'franchise'];
    if (leadData.restaurantType && highValueTypes.includes(leadData.restaurantType)) {
      score += 15;
    }
    
    // Challenges indicate pain points
    if (leadData.currentChallenges && leadData.currentChallenges.length > 0) {
      score += leadData.currentChallenges.length * 5;
    }
    
    // Referral source quality
    if (leadData.referralSource) {
      const highQualitySources = ['referral', 'demo_request', 'sales_contact'];
      if (highQualitySources.includes(leadData.referralSource)) {
        score += 20;
      }
    }
    
    // Estimated savings indicates serious interest
    if (leadData.estimatedSavings && leadData.estimatedSavings > 0) {
      score += 25;
    }
    
    return {
      ...leadData,
      leadScore: Math.min(score, 100), // Cap at 100
      leadStatus: score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold'
    };
  }

  /**
   * Utility methods
   */
  private extractNameFromEmail(email: string): { firstName: string; lastName: string } {
    const localPart = email.split('@')[0];
    const nameParts = localPart.split(/[._-]/);
    
    return {
      firstName: nameParts[0] ? this.capitalize(nameParts[0]) : 'Unknown',
      lastName: nameParts[1] ? this.capitalize(nameParts[1]) : 'Contact'
    };
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  private getLeadRating(score: number): string {
    if (score >= 80) return 'Hot';
    if (score >= 60) return 'Warm';
    if (score >= 40) return 'Cold';
    return 'Unqualified';
  }

  private estimateDealValue(leadData: LeadData): number {
    // Base annual subscription value
    let value = 12000; // $1,000/month base
    
    // Adjust based on monthly revenue
    if (leadData.monthlyRevenue) {
      const revenue = typeof leadData.monthlyRevenue === 'string' 
        ? parseFloat(leadData.monthlyRevenue.replace(/[^0-9.-]+/g, '')) 
        : leadData.monthlyRevenue;
      
      if (revenue > 100000) value = 24000; // $2,000/month for high revenue
      else if (revenue > 50000) value = 18000; // $1,500/month for medium revenue
    }
    
    // Restaurant type multiplier
    const highValueTypes = ['fine-dining', 'chain', 'franchise'];
    if (leadData.restaurantType && highValueTypes.includes(leadData.restaurantType)) {
      value *= 1.5;
    }
    
    return Math.round(value);
  }

  /**
   * Validate CRM configurations
   */
  async validateCRMConfigurations(): Promise<{
    hubspot: boolean;
    salesforce: boolean;
    pipedrive: boolean;
    customCRM: boolean;
    errors: string[];
  }> {
    const results = {
      hubspot: false,
      salesforce: false,
      pipedrive: false,
      customCRM: false,
      errors: [] as string[]
    };
    
    // Test HubSpot
    if (process.env.HUBSPOT_API_KEY) {
      try {
        const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`
          },
          body: JSON.stringify({ inputs: [] })
        });
        results.hubspot = response.ok;
        if (!response.ok) results.errors.push('HubSpot API key invalid');
      } catch (error) {
        results.errors.push(`HubSpot connection failed: ${error}`);
      }
    }
    
    // Test Salesforce
    if (process.env.SALESFORCE_ACCESS_TOKEN && process.env.SALESFORCE_INSTANCE_URL) {
      try {
        const response = await fetch(`${process.env.SALESFORCE_INSTANCE_URL}/services/data/v52.0/limits`, {
          headers: {
            'Authorization': `Bearer ${process.env.SALESFORCE_ACCESS_TOKEN}`
          }
        });
        results.salesforce = response.ok;
        if (!response.ok) results.errors.push('Salesforce access token invalid');
      } catch (error) {
        results.errors.push(`Salesforce connection failed: ${error}`);
      }
    }
    
    // Test Pipedrive
    if (process.env.PIPEDRIVE_API_TOKEN) {
      try {
        const response = await fetch(`https://api.pipedrive.com/v1/users/me?api_token=${process.env.PIPEDRIVE_API_TOKEN}`);
        results.pipedrive = response.ok;
        if (!response.ok) results.errors.push('Pipedrive API token invalid');
      } catch (error) {
        results.errors.push(`Pipedrive connection failed: ${error}`);
      }
    }
    
    // Test Custom CRM
    if (process.env.CUSTOM_CRM_WEBHOOK_URL) {
      results.customCRM = true; // Assume valid if configured
    }
    
    return results;
  }
}

// Export singleton instance
export const crmIntegrationService = HERACRMIntegrationService.getInstance();
export default crmIntegrationService;