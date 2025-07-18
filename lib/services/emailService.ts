/**
 * HERA Universal Email Service
 * Comprehensive email integration using Resend with beautiful templates
 * and advanced email automation workflows
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email template configurations
const EMAIL_TEMPLATES = {
  WELCOME_ONBOARDING: 'welcome_onboarding',
  DEMO_INVITATION: 'demo_invitation',
  SETUP_REMINDER: 'setup_reminder',
  FEATURE_ANNOUNCEMENT: 'feature_announcement',
  SUPPORT_FOLLOW_UP: 'support_follow_up',
  TRIAL_EXPIRY: 'trial_expiry',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  MONTHLY_REPORT: 'monthly_report',
  SECURITY_ALERT: 'security_alert',
  ONBOARDING_COMPLETE: 'onboarding_complete'
} as const;

export type EmailTemplate = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];

interface EmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface TemplateData {
  restaurant_name?: string;
  manager_name?: string;
  onboarding_link?: string;
  demo_link?: string;
  dashboard_link?: string;
  support_link?: string;
  unsubscribe_link?: string;
  app_url?: string;
  current_date?: string;
  [key: string]: any;
}

export class HERAEmailService {
  private static instance: HERAEmailService;
  private defaultFrom = process.env.RESEND_FROM_EMAIL || 'HERA Universal <noreply@hera-universal.com>';
  private appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hera-universal.com';

  static getInstance(): HERAEmailService {
    if (!HERAEmailService.instance) {
      HERAEmailService.instance = new HERAEmailService();
    }
    return HERAEmailService.instance;
  }

  /**
   * Send welcome email to new restaurant leads
   */
  async sendWelcomeEmail(
    email: string, 
    restaurantName: string, 
    managerName?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const templateData: TemplateData = {
        restaurant_name: restaurantName,
        manager_name: managerName || 'Manager',
        onboarding_link: `${this.appUrl}/setup/restaurant`,
        demo_link: `${this.appUrl}/restaurant/demo`,
        dashboard_link: `${this.appUrl}/restaurant/dashboard`,
        support_link: `${this.appUrl}/support`,
        unsubscribe_link: `${this.appUrl}/unsubscribe?email=${encodeURIComponent(email)}`,
        app_url: this.appUrl,
        current_date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };

      const emailHtml = this.generateWelcomeEmailHtml(templateData);
      const emailText = this.generateWelcomeEmailText(templateData);

      const result = await resend.emails.send({
        from: this.defaultFrom,
        to: [email],
        subject: `Welcome to HERA Universal, ${restaurantName}! 🚀`,
        html: emailHtml,
        text: emailText,
        replyTo: 'support@hera-universal.com',
        tags: [
          { name: 'campaign', value: 'welcome_onboarding' },
          { name: 'restaurant_name', value: restaurantName }
        ]
      });

      console.log('✅ Welcome email sent successfully:', {
        messageId: result.data?.id,
        recipient: email,
        restaurant: restaurantName
      });

      return {
        success: true,
        messageId: result.data?.id
      };

    } catch (error) {
      console.error('❌ Welcome email failed:', {
        error: error instanceof Error ? error.message : error,
        email,
        restaurantName
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  /**
   * Send demo invitation email
   */
  async sendDemoInvitation(
    email: string, 
    restaurantName: string, 
    scheduledTime?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const templateData: TemplateData = {
        restaurant_name: restaurantName,
        demo_link: `${this.appUrl}/restaurant/demo`,
        scheduled_time: scheduledTime,
        calendar_link: `${this.appUrl}/schedule-demo`,
        support_link: `${this.appUrl}/support`,
        unsubscribe_link: `${this.appUrl}/unsubscribe?email=${encodeURIComponent(email)}`,
        app_url: this.appUrl
      };

      const emailHtml = this.generateDemoInvitationHtml(templateData);
      const emailText = this.generateDemoInvitationText(templateData);

      const result = await resend.emails.send({
        from: this.defaultFrom,
        to: [email],
        subject: `Your HERA Universal Demo is Ready! 🎯`,
        html: emailHtml,
        text: emailText,
        replyTo: 'demo@hera-universal.com',
        tags: [
          { name: 'campaign', value: 'demo_invitation' },
          { name: 'restaurant_name', value: restaurantName }
        ]
      });

      return {
        success: true,
        messageId: result.data?.id
      };

    } catch (error) {
      console.error('❌ Demo invitation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  /**
   * Send setup reminder email
   */
  async sendSetupReminder(
    email: string, 
    restaurantName: string, 
    daysElapsed: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const templateData: TemplateData = {
        restaurant_name: restaurantName,
        days_elapsed: daysElapsed,
        setup_link: `${this.appUrl}/setup/restaurant`,
        support_link: `${this.appUrl}/support`,
        unsubscribe_link: `${this.appUrl}/unsubscribe?email=${encodeURIComponent(email)}`,
        app_url: this.appUrl
      };

      const emailHtml = this.generateSetupReminderHtml(templateData);
      const emailText = this.generateSetupReminderText(templateData);

      const result = await resend.emails.send({
        from: this.defaultFrom,
        to: [email],
        subject: `Complete Your HERA Setup - ${restaurantName} 📋`,
        html: emailHtml,
        text: emailText,
        replyTo: 'support@hera-universal.com',
        tags: [
          { name: 'campaign', value: 'setup_reminder' },
          { name: 'days_elapsed', value: daysElapsed.toString() }
        ]
      });

      return {
        success: true,
        messageId: result.data?.id
      };

    } catch (error) {
      console.error('❌ Setup reminder failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  /**
   * Send custom email with template
   */
  async sendCustomEmail(
    emailData: EmailData,
    templateData?: TemplateData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await resend.emails.send({
        from: emailData.from || this.defaultFrom,
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        cc: emailData.cc,
        bcc: emailData.bcc,
        replyTo: emailData.replyTo,
        attachments: emailData.attachments,
        tags: templateData ? [
          { name: 'template_data', value: JSON.stringify(templateData) }
        ] : undefined
      });

      return {
        success: true,
        messageId: result.data?.id
      };

    } catch (error) {
      console.error('❌ Custom email failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  /**
   * Generate beautiful HTML email templates
   */
  private generateWelcomeEmailHtml(data: TemplateData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to HERA Universal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .welcome-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; transition: background 0.3s; }
        .cta-button:hover { background: #2563eb; }
        .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .feature { text-align: center; padding: 20px; border: 1px solid #e5e7eb; border-radius: 6px; }
        .feature-icon { font-size: 24px; margin-bottom: 10px; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .footer a { color: #3b82f6; text-decoration: none; }
        @media (max-width: 600px) {
            .features { grid-template-columns: 1fr; }
            .container { margin: 10px; }
            .header, .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to HERA Universal!</h1>
            <p>Your AI-Powered Restaurant Management Journey Begins</p>
        </div>
        
        <div class="content">
            <div class="welcome-box">
                <h2>Hello ${data.restaurant_name}! 👋</h2>
                <p>Congratulations on taking the first step towards revolutionizing your restaurant operations with the world's most advanced AI-powered management system.</p>
            </div>
            
            <h3>🎯 What's Next?</h3>
            <p>Let's get your restaurant set up with HERA Universal in just 5 minutes:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.onboarding_link}" class="cta-button">Complete Restaurant Setup 🚀</a>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🧠</div>
                    <h4>AI-Powered Intelligence</h4>
                    <p>Smart inventory, predictive analytics, and automated optimization</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h4>Mobile-First Design</h4>
                    <p>Manage everything from your phone with our revolutionary scanner system</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">💰</div>
                    <h4>1,950% ROI</h4>
                    <p>Reduce food costs by 30% and increase efficiency by 250%</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <h4>Real-Time Processing</h4>
                    <p>Universal transaction system with instant updates</p>
                </div>
            </div>
            
            <h3>🎬 See It In Action</h3>
            <p>Want to see how HERA Universal works? Try our interactive demo:</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <a href="${data.demo_link}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Try Interactive Demo 🎯</a>
            </div>
            
            <h3>📞 Need Help?</h3>
            <p>Our expert team is here to ensure your success:</p>
            <ul style="margin: 15px 0; padding-left: 20px;">
                <li>📧 Email: <a href="mailto:support@hera-universal.com">support@hera-universal.com</a></li>
                <li>💬 Live Chat: Available 24/7 in your dashboard</li>
                <li>📞 Phone: 1-800-HERA-ERP</li>
                <li>📚 Documentation: <a href="${data.support_link}">Complete Setup Guide</a></li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>HERA Universal</strong> - The World's First Universal Restaurant Management System</p>
            <p style="margin: 10px 0;">
                <a href="${data.dashboard_link}">Dashboard</a> | 
                <a href="${data.support_link}">Support</a> | 
                <a href="${data.unsubscribe_link}">Unsubscribe</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px;">${data.current_date}</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateWelcomeEmailText(data: TemplateData): string {
    return `
Welcome to HERA Universal, ${data.restaurant_name}!

Your AI-Powered Restaurant Management Journey Begins

Congratulations on taking the first step towards revolutionizing your restaurant operations with the world's most advanced AI-powered management system.

What's Next?
Complete your restaurant setup in just 5 minutes: ${data.onboarding_link}

Key Features:
🧠 AI-Powered Intelligence - Smart inventory, predictive analytics, automated optimization
📱 Mobile-First Design - Revolutionary scanner system for complete mobile management
💰 1,950% ROI - Reduce food costs by 30%, increase efficiency by 250%
⚡ Real-Time Processing - Universal transaction system with instant updates

Try Interactive Demo: ${data.demo_link}

Need Help?
📧 Email: support@hera-universal.com
💬 Live Chat: Available 24/7 in your dashboard
📞 Phone: 1-800-HERA-ERP
📚 Documentation: ${data.support_link}

HERA Universal - The World's First Universal Restaurant Management System
Dashboard: ${data.dashboard_link} | Support: ${data.support_link}

To unsubscribe: ${data.unsubscribe_link}
`;
  }

  private generateDemoInvitationHtml(data: TemplateData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your HERA Demo is Ready</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .demo-box { background: #ecfdf5; border: 2px solid #10b981; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0; }
        .cta-button { display: inline-block; background: #10b981; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .features { margin: 30px 0; }
        .feature { display: flex; align-items: center; margin: 15px 0; padding: 15px; background: #f9fafb; border-radius: 6px; }
        .feature-icon { margin-right: 15px; font-size: 20px; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Your HERA Demo is Ready!</h1>
            <p>Experience the future of restaurant management</p>
        </div>
        
        <div class="content">
            <div class="demo-box">
                <h2>🚀 Live Demo for ${data.restaurant_name}</h2>
                <p>Your personalized HERA Universal demo environment is now ready. Experience how our AI-powered system can transform your restaurant operations.</p>
                ${data.scheduled_time ? `<p><strong>⏰ Scheduled Time:</strong> ${data.scheduled_time}</p>` : ''}
            </div>
            
            <div style="text-align: center;">
                <a href="${data.demo_link}" class="cta-button">Launch Interactive Demo 🎯</a>
            </div>
            
            <h3>🎬 What You'll Experience:</h3>
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🧠</div>
                    <div>
                        <h4>AI-Powered Order Processing</h4>
                        <p>See how our intelligent system optimizes order workflow</p>
                    </div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <div>
                        <h4>Mobile Scanner System</h4>
                        <p>Revolutionary document processing and inventory management</p>
                    </div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div>
                        <h4>Real-Time Analytics</h4>
                        <p>Live insights and automated reporting dashboards</p>
                    </div>
                </div>
                <div class="feature">
                    <div class="feature-icon">💰</div>
                    <div>
                        <h4>Cost Optimization</h4>
                        <p>See immediate savings and efficiency improvements</p>
                    </div>
                </div>
            </div>
            
            <p><strong>💡 Pro Tip:</strong> Have your menu and current POS data ready to see maximum personalization during the demo.</p>
        </div>
        
        <div class="footer">
            <p>Questions? Reply to this email or visit <a href="${data.support_link}">our support center</a></p>
            <p><a href="${data.unsubscribe_link}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateDemoInvitationText(data: TemplateData): string {
    return `
Your HERA Demo is Ready! 🎯

Experience the future of restaurant management

Live Demo for ${data.restaurant_name}

Your personalized HERA Universal demo environment is now ready. Experience how our AI-powered system can transform your restaurant operations.

${data.scheduled_time ? `Scheduled Time: ${data.scheduled_time}` : ''}

Launch Interactive Demo: ${data.demo_link}

What You'll Experience:
🧠 AI-Powered Order Processing - Intelligent order workflow optimization
📱 Mobile Scanner System - Revolutionary document processing and inventory management
📊 Real-Time Analytics - Live insights and automated reporting dashboards
💰 Cost Optimization - Immediate savings and efficiency improvements

Pro Tip: Have your menu and current POS data ready to see maximum personalization during the demo.

Questions? Reply to this email or visit: ${data.support_link}
To unsubscribe: ${data.unsubscribe_link}
`;
  }

  private generateSetupReminderHtml(data: TemplateData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your HERA Setup</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .reminder-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0; }
        .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .stat { text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #f59e0b; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Complete Your Setup</h1>
            <p>Your HERA Universal system is waiting</p>
        </div>
        
        <div class="content">
            <div class="reminder-box">
                <h2>⏰ ${data.restaurant_name} Setup Reminder</h2>
                <p>It's been ${data.days_elapsed} days since you started your HERA Universal setup. Complete your configuration to start saving costs and increasing efficiency immediately.</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${data.setup_link}" class="cta-button">Complete Setup Now 📋</a>
            </div>
            
            <h3>🚀 Why Complete Your Setup Today?</h3>
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">30%</div>
                    <div>Food Cost Reduction</div>
                </div>
                <div class="stat">
                    <div class="stat-number">250%</div>
                    <div>Efficiency Increase</div>
                </div>
            </div>
            
            <p>Every day without HERA Universal is money left on the table. Complete your setup to:</p>
            <ul style="margin: 20px 0; padding-left: 20px;">
                <li>🧠 Activate AI-powered inventory optimization</li>
                <li>📱 Enable mobile scanner system for document processing</li>
                <li>📊 Start receiving real-time analytics and insights</li>
                <li>💰 Begin tracking cost savings and ROI improvements</li>
                <li>⚡ Access universal transaction processing</li>
            </ul>
            
            <p><strong>⏱️ Setup takes just 5 minutes</strong> and our support team is standing by to help if needed.</p>
        </div>
        
        <div class="footer">
            <p>Need help? Contact us at <a href="mailto:support@hera-universal.com">support@hera-universal.com</a></p>
            <p><a href="${data.unsubscribe_link}">Unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateSetupReminderText(data: TemplateData): string {
    return `
Complete Your HERA Setup 📋

${data.restaurant_name} Setup Reminder

It's been ${data.days_elapsed} days since you started your HERA Universal setup. Complete your configuration to start saving costs and increasing efficiency immediately.

Complete Setup Now: ${data.setup_link}

Why Complete Your Setup Today?
• 30% Food Cost Reduction
• 250% Efficiency Increase

Every day without HERA Universal is money left on the table. Complete your setup to:
🧠 Activate AI-powered inventory optimization
📱 Enable mobile scanner system for document processing  
📊 Start receiving real-time analytics and insights
💰 Begin tracking cost savings and ROI improvements
⚡ Access universal transaction processing

Setup takes just 5 minutes and our support team is standing by to help if needed.

Need help? Contact us at: support@hera-universal.com
To unsubscribe: ${data.unsubscribe_link}
`;
  }

  /**
   * Email automation workflows
   */
  async scheduleFollowUpEmails(email: string, restaurantName: string, leadId: string): Promise<void> {
    try {
      // Schedule 24-hour follow-up
      setTimeout(async () => {
        await this.sendSetupReminder(email, restaurantName, 1);
      }, 24 * 60 * 60 * 1000); // 24 hours

      // Schedule 7-day follow-up
      setTimeout(async () => {
        await this.sendSetupReminder(email, restaurantName, 7);
      }, 7 * 24 * 60 * 60 * 1000); // 7 days

      console.log('✅ Follow-up emails scheduled for:', { email, restaurantName, leadId });
    } catch (error) {
      console.error('❌ Failed to schedule follow-up emails:', error);
    }
  }

  /**
   * Validate email service configuration
   */
  async validateConfiguration(): Promise<{ isValid: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        return {
          isValid: false,
          error: 'RESEND_API_KEY environment variable is not configured'
        };
      }

      // Test email sending capability
      const testResult = await resend.emails.send({
        from: this.defaultFrom,
        to: ['test@example.com'],
        subject: 'HERA Email Service Test',
        html: '<p>This is a test email to validate the email service configuration.</p>',
        text: 'This is a test email to validate the email service configuration.'
      });

      return {
        isValid: true
      };

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
    }
  }
}

// Export singleton instance
export const emailService = HERAEmailService.getInstance();
export default emailService;