'use client'

import { useState } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, User, Building, Shield, Bell, Palette, 
  Database, Save, Sun, Moon, Monitor
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [saveStatus, setSaveStatus] = useState('')
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      phone: '',
      role: '',
      timezone: 'America/New_York',
      language: 'en'
    },
    restaurant: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      cuisine_type: '',
      operating_hours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '23:00', closed: false },
        saturday: { open: '10:00', close: '23:00', closed: false },
        sunday: { open: '10:00', close: '21:00', closed: false }
      }
    },
    security: {
      two_factor_enabled: false,
      session_timeout: 30,
      login_notifications: true
    },
    notifications: {
      email_notifications: true,
      push_notifications: true,
      order_notifications: true,
      inventory_alerts: true,
      staff_notifications: true,
      system_updates: true
    },
    appearance: {
      theme: 'light',
      color_scheme: 'blue',
      animations_enabled: true
    },
    system: {
      auto_backup: true,
      backup_frequency: 'daily',
      data_retention: 365,
      analytics_enabled: true
    }
  })

  const handleSave = async (section: string) => {
    setSaveStatus('saving')
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (error) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      restaurant: {
        ...prev.restaurant,
        operating_hours: {
          ...prev.restaurant.operating_hours,
          [day]: {
            ...prev.restaurant.operating_hours[day],
            [field]: value
          }
        }
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-600 via-blue-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Settings
              </h1>
              <p className="text-xl text-blue-100 mb-4">
                Manage your account and restaurant preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 -mt-8 relative z-10">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gray-50/50">
              <TabsList className="grid w-full grid-cols-6 bg-transparent border-none">
                <TabsTrigger value="profile" className="py-4 px-6">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="restaurant" className="py-4 px-6">
                  <Building className="w-4 h-4 mr-2" />
                  Restaurant
                </TabsTrigger>
                <TabsTrigger value="security" className="py-4 px-6">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="py-4 px-6">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance" className="py-4 px-6">
                  <Palette className="w-4 h-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="system" className="py-4 px-6">
                  <Database className="w-4 h-4 mr-2" />
                  System
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Profile Settings */}
            <TabsContent value="profile" className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                  <Button 
                    onClick={() => handleSave('profile')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => handleInputChange('profile', 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={settings.profile.role}
                      onChange={(e) => handleInputChange('profile', 'role', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Role</option>
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Restaurant Settings */}
            <TabsContent value="restaurant" className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Restaurant Settings</h2>
                  <Button 
                    onClick={() => handleSave('restaurant')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                    <input
                      type="text"
                      value={settings.restaurant.name}
                      onChange={(e) => handleInputChange('restaurant', 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter restaurant name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={settings.restaurant.address}
                      onChange={(e) => handleInputChange('restaurant', 'address', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter restaurant address"
                    />
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Hours</h3>
                  <div className="space-y-3">
                    {Object.entries(settings.restaurant.operating_hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-gray-700 capitalize">{day}</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => handleOperatingHoursChange(day, 'closed', !e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">Open</span>
                        </div>
                        {!hours.closed && (
                          <>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </>
                        )}
                        {hours.closed && (
                          <span className="text-gray-500 text-sm">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                  <Button 
                    onClick={() => handleSave('security')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        <Badge className={settings.security.two_factor_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {settings.security.two_factor_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleInputChange('security', 'two_factor_enabled', !settings.security.two_factor_enabled)}
                      >
                        {settings.security.two_factor_enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                  <Button 
                    onClick={() => handleSave('notifications')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'push_notifications', label: 'Push Notifications', description: 'Receive browser push notifications' },
                    { key: 'order_notifications', label: 'Order Notifications', description: 'Get notified about new orders' },
                    { key: 'inventory_alerts', label: 'Inventory Alerts', description: 'Low stock and inventory warnings' },
                    { key: 'staff_notifications', label: 'Staff Notifications', description: 'Staff-related updates and alerts' },
                    { key: 'system_updates', label: 'System Updates', description: 'System maintenance and update notifications' }
                  ].map(({ key, label, description }) => (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{label}</p>
                            <p className="text-sm text-gray-600">{description}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.notifications[key]}
                            onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Appearance Settings</h2>
                  <Button 
                    onClick={() => handleSave('appearance')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Theme Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                        <div className="flex gap-3">
                          {[
                            { value: 'light', label: 'Light', icon: Sun },
                            { value: 'dark', label: 'Dark', icon: Moon },
                            { value: 'system', label: 'System', icon: Monitor }
                          ].map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              onClick={() => handleInputChange('appearance', 'theme', value)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                                settings.appearance.theme === value
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
                  <Button 
                    onClick={() => handleSave('system')}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Data Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto Backup</p>
                          <p className="text-sm text-gray-600">Automatically backup your data</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.auto_backup}
                          onChange={(e) => handleInputChange('system', 'auto_backup', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Analytics</p>
                          <p className="text-sm text-gray-600">Enable usage analytics and insights</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.system.analytics_enabled}
                          onChange={(e) => handleInputChange('system', 'analytics_enabled', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Save Status */}
        {saveStatus && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
              saveStatus === 'saving' ? 'bg-blue-500' : 
              saveStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <span>
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'success' && 'Settings saved successfully!'}
                {saveStatus === 'error' && 'Error saving settings'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}