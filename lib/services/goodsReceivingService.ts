/**
 * HERA Universal - Goods Receiving Service
 * 
 * Handles all goods receiving operations using HERA Universal Schema
 * Integrates with inventory management and supplier performance analytics
 * 
 * AI-Native Features:
 * - Supplier performance analytics
 * - Quality variance detection  
 * - Automated inventory adjustments
 * - Predictive delivery insights
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service key client for bypassing RLS
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
      }
    }
  }
);

// Core TypeScript interfaces following HERA Universal patterns
export interface ReceiptLineItem {
  id: string;
  itemId: string;
  itemName: string;
  itemSku?: string;
  purchaseOrderId?: string;
  purchaseOrderLineId?: string;
  expectedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  unit: string;
  qualityStatus: 'accepted' | 'rejected' | 'partial' | 'damaged' | 'pending_inspection';
  expiryDate?: string;
  batchNumber?: string;
  supplierSku?: string;
  storageLocation?: string;
  qualityNotes?: string;
  varianceReason?: string;
  temperatureReading?: number;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  deliveryDate: string;
  receivedDate: string;
  receivedBy: string;
  receivedByName?: string;
  status: 'draft' | 'received' | 'inspected' | 'completed' | 'disputed';
  items: ReceiptLineItem[];
  totalValue: number;
  currency: string;
  qualityMetrics: {
    overallQuality: number; // 1-5 scale
    deliveryRating: number; // 1-5 scale
    packagingRating: number; // 1-5 scale
    temperatureCompliant?: boolean;
    documentsComplete: boolean;
  };
  deliveryNotes?: string;
  qualityInspectionNotes?: string;
  imageUrls?: string[];
  receivingLocation?: string;
  varianceRate: number;
  qualityScore: number;
  aiInsights?: ReceiptAIInsights;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptAIInsights {
  supplierTrends: {
    qualityTrend: 'improving' | 'declining' | 'stable';
    deliveryTrend: 'improving' | 'declining' | 'stable';
    historicalAverageQuality: number;
    historicalAverageDelivery: number;
  };
  performanceVsHistorical: {
    qualityChange: number;
    deliveryChange: number;
  };
  predictiveInsights: {
    nextDeliveryQualityPrediction: number;
    reliabilityScore: number;
    recommendedOrderFrequency: string;
  };
  recommendations: string[];
  alerts: QualityAlert[];
}

export interface QualityAlert {
  type: 'quality_rejection' | 'damage_detected' | 'temperature_violation' | 'variance_high' | 'expiry_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  itemId?: string;
  action_required?: boolean;
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  qualityScore: number;
  averageDeliveryTime: number;
  varianceRate: number;
  lastDeliveryDate: string;
  monthlyTrend: 'improving' | 'declining' | 'stable';
  aiRecommendations: string[];
  criticalAlerts: QualityAlert[];
}

export interface ReceivingDashboardMetrics {
  totalReceipts: number;
  totalValue: number;
  avgQualityScore: number;
  pendingInspections: number;
  qualityAlerts: number;
  topSuppliers: Array<{
    name: string;
    receipts: number;
    qualityScore: number;
  }>;
  recentActivity: GoodsReceipt[];
}

export interface CreateReceiptRequest {
  organizationId: string;
  supplierId: string;
  supplierName?: string;
  purchaseOrderId?: string;
  deliveryDate: string;
  receivedBy: string;
  items: Omit<ReceiptLineItem, 'id' | 'createdAt' | 'updatedAt'>[];
  overallQualityRating: number;
  deliveryRating: number;
  packagingRating: number;
  temperatureCompliant?: boolean;
  documentsComplete: boolean;
  deliveryNotes?: string;
  qualityInspectionNotes?: string;
  imageUrls?: string[];
  receivingLocation?: string;
}

export class GoodsReceivingService {
  private static supabase = createClient();

  /**
   * Get all goods receipts for an organization
   */
  static async getGoodsReceipts(
    organizationId: string,
    options: {
      supplierId?: string;
      purchaseOrderId?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    success: boolean;
    data?: GoodsReceipt[];
    pagination?: any;
    error?: string;
  }> {
    try {
      if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
        return {
          success: false,
          error: 'Valid organizationId is required'
        };
      }

      console.log('🚚 Fetching goods receipts for organization:', organizationId);

      const searchParams = new URLSearchParams({
        organizationId,
        ...(options.supplierId && { supplierId: options.supplierId }),
        ...(options.purchaseOrderId && { purchaseOrderId: options.purchaseOrderId }),
        ...(options.status && { status: options.status }),
        ...(options.dateFrom && { dateFrom: options.dateFrom }),
        ...(options.dateTo && { dateTo: options.dateTo }),
        ...(options.page && { page: options.page.toString() }),
        ...(options.limit && { limit: options.limit.toString() })
      });

      const response = await fetch(`/api/receiving/receipts?${searchParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log(`✅ Found ${result.data?.length || 0} goods receipts`);
      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };

    } catch (error) {
      console.error('❌ Error fetching goods receipts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch goods receipts'
      };
    }
  }

  /**
   * Create a new goods receipt
   */
  static async createGoodsReceipt(
    receiptData: CreateReceiptRequest
  ): Promise<{
    success: boolean;
    data?: {
      id: string;
      receiptNumber: string;
      status: string;
      totalValue: number;
      qualityScore: number;
      aiRecommendations: string[];
    };
    error?: string;
  }> {
    try {
      console.log('🚚 Creating goods receipt:', JSON.stringify(receiptData, null, 2));

      const response = await fetch('/api/receiving/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ Goods receipt created successfully:', result.data);
      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Error creating goods receipt:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create goods receipt'
      };
    }
  }

  /**
   * Get receiving dashboard metrics
   */
  static async getReceivingMetrics(
    organizationId: string,
    dateRange?: { from: string; to: string }
  ): Promise<{
    success: boolean;
    data?: ReceivingDashboardMetrics;
    error?: string;
  }> {
    try {
      if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
        return {
          success: false,
          error: 'Valid organizationId is required'
        };
      }

      console.log('📊 Calculating receiving metrics for organization:', organizationId);

      // Get recent receipts
      const receiptsResult = await this.getGoodsReceipts(organizationId, {
        limit: 100,
        ...(dateRange && { dateFrom: dateRange.from, dateTo: dateRange.to })
      });

      if (!receiptsResult.success || !receiptsResult.data) {
        throw new Error('Failed to fetch receipts for metrics calculation');
      }

      const receipts = receiptsResult.data;

      // Calculate metrics
      const metrics: ReceivingDashboardMetrics = {
        totalReceipts: receipts.length,
        totalValue: receipts.reduce((sum, receipt) => sum + receipt.totalValue, 0),
        avgQualityScore: receipts.length > 0 
          ? receipts.reduce((sum, receipt) => sum + receipt.qualityScore, 0) / receipts.length 
          : 0,
        pendingInspections: receipts.filter(r => r.status === 'received').length,
        qualityAlerts: receipts.reduce((sum, receipt) => 
          sum + (receipt.aiInsights?.alerts?.filter(alert => alert.severity === 'high' || alert.severity === 'critical').length || 0), 0
        ),
        topSuppliers: this.calculateTopSuppliers(receipts),
        recentActivity: receipts.slice(0, 10)
      };

      console.log('📊 Receiving metrics calculated:', metrics);
      return {
        success: true,
        data: metrics
      };

    } catch (error) {
      console.error('❌ Error calculating receiving metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate receiving metrics'
      };
    }
  }

  /**
   * Get supplier performance analytics
   */
  static async getSupplierPerformance(
    organizationId: string,
    supplierId?: string
  ): Promise<{
    success: boolean;
    data?: SupplierPerformance[];
    error?: string;
  }> {
    try {
      if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
        return {
          success: false,
          error: 'Valid organizationId is required'
        };
      }

      console.log('📈 Fetching supplier performance for organization:', organizationId);

      // Get receipts for analysis
      const receiptsResult = await this.getGoodsReceipts(organizationId, {
        ...(supplierId && { supplierId }),
        limit: 500 // Get more data for better analytics
      });

      if (!receiptsResult.success || !receiptsResult.data) {
        throw new Error('Failed to fetch receipts for performance analysis');
      }

      const receipts = receiptsResult.data;

      // Group by supplier
      const supplierGroups = receipts.reduce((groups, receipt) => {
        const key = receipt.supplierId;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(receipt);
        return groups;
      }, {} as Record<string, GoodsReceipt[]>);

      // Calculate performance for each supplier
      const performanceData: SupplierPerformance[] = Object.entries(supplierGroups).map(([supplierId, supplierReceipts]) => {
        const totalDeliveries = supplierReceipts.length;
        const onTimeDeliveries = supplierReceipts.filter(r => r.qualityMetrics.deliveryRating >= 4).length;
        const avgQualityScore = supplierReceipts.reduce((sum, r) => sum + r.qualityScore, 0) / totalDeliveries;
        const avgVarianceRate = supplierReceipts.reduce((sum, r) => sum + r.varianceRate, 0) / totalDeliveries;
        
        // Calculate delivery time (simplified)
        const avgDeliveryTime = supplierReceipts.reduce((sum, r) => {
          // This would need actual delivery time calculation
          return sum + (r.qualityMetrics.deliveryRating === 5 ? 1 : r.qualityMetrics.deliveryRating === 4 ? 2 : 3);
        }, 0) / totalDeliveries;

        const lastDelivery = supplierReceipts.sort((a, b) => 
          new Date(b.deliveredDate).getTime() - new Date(a.deliveredDate).getTime()
        )[0];

        // Generate AI recommendations
        const aiRecommendations = this.generateSupplierRecommendations(supplierReceipts, avgQualityScore, avgVarianceRate);

        // Extract critical alerts
        const criticalAlerts = supplierReceipts
          .flatMap(r => r.aiInsights?.alerts || [])
          .filter(alert => alert.severity === 'critical')
          .slice(0, 5); // Latest 5 critical alerts

        return {
          supplierId,
          supplierName: lastDelivery.supplierName,
          totalDeliveries,
          onTimeDeliveries,
          qualityScore: avgQualityScore,
          averageDeliveryTime: avgDeliveryTime,
          varianceRate: avgVarianceRate,
          lastDeliveryDate: lastDelivery.deliveredDate,
          monthlyTrend: this.calculateMonthlyTrend(supplierReceipts),
          aiRecommendations,
          criticalAlerts
        };
      });

      console.log(`📈 Performance calculated for ${performanceData.length} suppliers`);
      return {
        success: true,
        data: performanceData
      };

    } catch (error) {
      console.error('❌ Error fetching supplier performance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch supplier performance'
      };
    }
  }

  /**
   * Get quality alerts across all receipts
   */
  static async getQualityAlerts(
    organizationId: string,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<{
    success: boolean;
    data?: QualityAlert[];
    error?: string;
  }> {
    try {
      if (!organizationId || organizationId === 'null' || organizationId === 'undefined') {
        return {
          success: false,
          error: 'Valid organizationId is required'
        };
      }

      console.log('🚨 Fetching quality alerts for organization:', organizationId);

      const receiptsResult = await this.getGoodsReceipts(organizationId, { limit: 100 });
      
      if (!receiptsResult.success || !receiptsResult.data) {
        throw new Error('Failed to fetch receipts for alerts');
      }

      let alerts = receiptsResult.data
        .flatMap(receipt => receipt.aiInsights?.alerts || [])
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        });

      if (severity) {
        alerts = alerts.filter(alert => alert.severity === severity);
      }

      console.log(`🚨 Found ${alerts.length} quality alerts`);
      return {
        success: true,
        data: alerts
      };

    } catch (error) {
      console.error('❌ Error fetching quality alerts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch quality alerts'
      };
    }
  }

  /**
   * Update receipt status
   */
  static async updateReceiptStatus(
    receiptId: string,
    status: GoodsReceipt['status'],
    notes?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('📝 Updating receipt status:', receiptId, 'to', status);

      // This would be implemented with a PUT endpoint
      const response = await fetch('/api/receiving/receipts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: receiptId,
          status,
          notes
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Receipt status updated successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Error updating receipt status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update receipt status'
      };
    }
  }

  // Helper methods
  private static calculateTopSuppliers(receipts: GoodsReceipt[]): Array<{
    name: string;
    receipts: number;
    qualityScore: number;
  }> {
    const supplierStats = receipts.reduce((stats, receipt) => {
      const key = receipt.supplierId;
      if (!stats[key]) {
        stats[key] = {
          name: receipt.supplierName,
          receipts: 0,
          totalQuality: 0
        };
      }
      stats[key].receipts++;
      stats[key].totalQuality += receipt.qualityScore;
      return stats;
    }, {} as Record<string, { name: string; receipts: number; totalQuality: number }>);

    return Object.values(supplierStats)
      .map(stat => ({
        name: stat.name,
        receipts: stat.receipts,
        qualityScore: stat.totalQuality / stat.receipts
      }))
      .sort((a, b) => b.receipts - a.receipts)
      .slice(0, 5);
  }

  private static generateSupplierRecommendations(
    receipts: GoodsReceipt[],
    avgQualityScore: number,
    avgVarianceRate: number
  ): string[] {
    const recommendations = [];

    if (avgQualityScore < 3.5) {
      recommendations.push('Schedule quality improvement meeting with supplier');
    }

    if (avgVarianceRate > 0.15) {
      recommendations.push('Review order accuracy and fulfillment processes');
    }

    const recentQualityIssues = receipts
      .slice(0, 5) // Last 5 receipts
      .filter(r => r.qualityScore < 3.5).length;

    if (recentQualityIssues >= 2) {
      recommendations.push('Consider supplier audit for quality standards');
    }

    const temperatureViolations = receipts.filter(r => r.qualityMetrics.temperatureCompliant === false).length;
    if (temperatureViolations > 0) {
      recommendations.push('Implement enhanced cold chain monitoring');
    }

    return recommendations;
  }

  private static calculateMonthlyTrend(receipts: GoodsReceipt[]): 'improving' | 'declining' | 'stable' {
    if (receipts.length < 4) return 'stable';

    const sorted = receipts.sort((a, b) => new Date(a.deliveredDate).getTime() - new Date(b.deliveredDate).getTime());
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstAvg = firstHalf.reduce((sum, r) => sum + r.qualityScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.qualityScore, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    
    if (difference > 0.3) return 'improving';
    if (difference < -0.3) return 'declining';
    return 'stable';
  }
}

export default GoodsReceivingService;