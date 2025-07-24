/**
 * HERA Universal - Hook Model Analytics API
 * 
 * Tracks Nir Eyal's Hook Model engagement:
 * Trigger -> Action -> Variable Reward -> Investment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for analytics
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
  );
};

interface HookEngagement {
  trigger: string;
  action: string;
  reward: string;
  investment: string;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
}

// POST /api/analytics/hook-engagement
export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient();
    const body: HookEngagement = await request.json();

    // For now, we'll log the engagement (in production, this would go to analytics DB)
    console.log('🎣 Hook Model Engagement:', {
      timestamp: new Date().toISOString(),
      trigger: body.trigger,
      action: body.action,
      reward: body.reward,
      investment: body.investment,
      userId: body.userId,
      organizationId: body.organizationId,
      metadata: body.metadata
    });

    // In production, you would store this in an analytics table:
    /*
    const { error } = await supabase
      .from('hook_analytics')
      .insert({
        id: crypto.randomUUID(),
        trigger: body.trigger,
        action: body.action,
        reward: body.reward,
        investment: body.investment,
        user_id: body.userId,
        organization_id: body.organizationId,
        metadata: body.metadata,
        created_at: new Date().toISOString()
      });
    */

    return NextResponse.json({
      success: true,
      message: 'Hook engagement tracked'
    });

  } catch (error) {
    console.error('Hook engagement tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track engagement' },
      { status: 500 }
    );
  }
}

// GET /api/analytics/hook-engagement - Get engagement metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');

    // Mock analytics data for demonstration
    const mockMetrics = {
      totalEngagements: 156,
      hookCompletionRate: 0.82, // 82% complete full cycle
      averageTimeToReward: 45, // seconds
      topTriggers: [
        { trigger: 'add_team_member_button_visible', count: 89 },
        { trigger: 'team_management_page_view', count: 67 },
        { trigger: 'theme_toggle', count: 34 }
      ],
      investmentMetrics: {
        teamMembersAdded: 23,
        averageTeamSize: 3.2,
        retentionAfterFirstAdd: 0.91
      },
      rewardEffectiveness: {
        'team_growth_celebration': 0.87,
        'social_proof_message': 0.79,
        'achievement_unlock': 0.92
      }
    };

    return NextResponse.json({
      success: true,
      data: mockMetrics,
      organizationId,
      userId
    });

  } catch (error) {
    console.error('Hook analytics GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}