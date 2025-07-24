'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Plus, X, Check, AlertCircle, Users, Moon, Sun, ChevronRight, Loader2, Sparkles, Building2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
interface TeamMember {
  id: string
  userId: string
  organizationId: string
  role: 'owner' | 'manager' | 'staff' | 'accountant' | 'viewer'
  isActive: boolean
  user?: {
    id: string
    email: string
    fullName: string
  }
}

interface HookEngagement {
  trigger: string
  action: string
  reward: string
  investment: string
}

// REFACTORING UI: Clean, minimal design tokens
const designTokens = {
  colors: {
    primary: 'bg-teal-500 hover:bg-teal-600',
    primaryText: 'text-white',
    neutral: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      300: 'bg-gray-300',
      600: 'text-gray-600',
      700: 'text-gray-700',
      900: 'text-gray-900'
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200'
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200'
    }
  },
  typography: {
    pageTitle: 'text-xl font-semibold',
    sectionTitle: 'text-lg font-medium',
    bodyText: 'text-sm',
    captionText: 'text-xs'
  },
  spacing: {
    card: 'p-4',
    section: 'p-6',
    gap: 'gap-4'
  }
}

// Hook Model reward messages (will be customized with organization name)
const rewardMessages = [
  "🎉 Great! {orgName} team is growing. You're building a real business empire!",
  "💪 Smart move! Businesses with dedicated teams are 40% more profitable.",
  "🚀 {orgName} is building a stronger team than 73% of businesses!",
  "⭐ Another team member for {orgName}! You're on track for exponential growth.",
  "🏆 Team Builder achievement unlocked! Keep growing {orgName}."
]

// Demo organization ID (Mario's Restaurant)
const DEMO_ORG_ID = '123e4567-e89b-12d3-a456-426614174000'

interface Organization {
  id: string
  name: string
}

export default function TeamManagementPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [formData, setFormData] = useState({ fullName: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [currentReward, setCurrentReward] = useState('')

  // Memoized values to prevent unnecessary re-renders
  const teamCount = useMemo(() => teamMembers.length, [teamMembers.length])
  const teamCountText = useMemo(() => 
    `${teamCount} member${teamCount !== 1 ? 's' : ''}`, 
    [teamCount]
  )

  // Theme management
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      let shouldBeDark = false
      
      if (savedTheme === 'dark') {
        shouldBeDark = true
      } else if (savedTheme === 'light') {
        shouldBeDark = false
      } else {
        // No saved theme, use system preference
        shouldBeDark = prefersDark
      }
      
      
      setIsDarkMode(shouldBeDark)
      
      // Force class update
      if (shouldBeDark) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
      }
    }
    
    // Initialize immediately and also with a small delay
    initializeTheme()
    setTimeout(initializeTheme, 50)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    
    // Force class update on both html and body
    if (newTheme) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
    
    // Track theme toggle as investment
    trackHookEngagement({
      trigger: 'theme_toggle',
      action: 'toggle_theme',
      reward: 'visual_preference_saved',
      investment: 'theme_preference'
    })
  }

  // Fetch organization and team members
  useEffect(() => {
    fetchOrganizationData()
  }, [])

  const fetchOrganizationData = async () => {
    try {
      // Fetch organization details
      const orgResponse = await fetch(`/api/organizations/${DEMO_ORG_ID}`)
      const orgData = await orgResponse.json()
      
      if (orgData.success) {
        setOrganization(orgData.data)
      }

      // Fetch team members
      const teamResponse = await fetch(`/api/user-organizations?organizationId=${DEMO_ORG_ID}&includeDetails=true`)
      const teamData = await teamResponse.json()
      
      if (teamData.success) {
        setTeamMembers(teamData.data || [])
      }
    } catch (error) {
      console.error('Error fetching organization data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Separate function to refresh team data only (prevents organization context from re-rendering)
  const refreshTeamData = async () => {
    try {
      const teamResponse = await fetch(`/api/user-organizations?organizationId=${DEMO_ORG_ID}&includeDetails=true`)
      const teamData = await teamResponse.json()
      
      if (teamData.success) {
        setTeamMembers(teamData.data || [])
      }
    } catch (error) {
      console.error('Error refreshing team data:', error)
    }
  }

  // Track Hook Model engagement
  const trackHookEngagement = async (engagement: HookEngagement) => {
    try {
      await fetch('/api/analytics/hook-engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(engagement)
      })
    } catch (error) {
      // Silent fail for analytics
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRole || !formData.fullName || !formData.email) {
      setNotification({ type: 'error', message: 'Please fill in all fields' })
      return
    }

    setIsSubmitting(true)

    // First create the user
    try {
      // Create user in core_users
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          userRole: selectedRole
        })
      })

      if (!userResponse.ok) {
        throw new Error('Failed to create user')
      }

      const userData = await userResponse.json()

      // Add user to organization
      const orgResponse = await fetch('/api/user-organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.data.id,
          organizationId: DEMO_ORG_ID,
          role: selectedRole
        })
      })

      if (!orgResponse.ok) {
        throw new Error('Failed to add user to organization')
      }

      // Variable reward with organization context
      const randomReward = rewardMessages[Math.floor(Math.random() * rewardMessages.length)]
      const personalizedReward = randomReward.replace('{orgName}', organization?.name || 'your organization')
      setCurrentReward(personalizedReward)
      setNotification({ type: 'success', message: personalizedReward })

      // Track successful addition
      trackHookEngagement({
        trigger: 'add_team_member_button',
        action: 'submit_team_member_form',
        reward: 'team_growth_celebration',
        investment: 'team_member_added'
      })

      // Reset form
      setFormData({ fullName: '', email: '' })
      setSelectedRole('')
      setShowAddForm(false)
      
      // Refresh team list (only team data, not organization context)
      refreshTeamData()

    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to add team member' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Role selector component
  const RoleSelector = () => {
    const roles = [
      { id: 'owner', label: 'Owner', description: 'Full access', icon: '👑' },
      { id: 'manager', label: 'Manager', description: 'Team leadership', icon: '📊' },
      { id: 'staff', label: 'Staff', description: 'Daily operations', icon: '👥' },
      { id: 'accountant', label: 'Accountant', description: 'Financial access', icon: '🧮' }
    ]

    return (
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole(role.id)}
            className={`
              border-2 rounded-lg p-3 cursor-pointer transition-all
              ${selectedRole === role.id 
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
              }
            `}
          >
            <div className="text-2xl mb-1">{role.icon}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{role.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{role.description}</div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Team member card component - memoized to prevent unnecessary re-renders
  const TeamMemberCard = React.memo(({ member }: { member: TeamMember }) => {
    const initials = member.user?.fullName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || '??'

    const roleColors = {
      owner: 'bg-teal-50 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      manager: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      staff: 'bg-gray-50 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300',
      accountant: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      viewer: 'bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    }

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {member.user?.fullName || 'Unknown'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {member.user?.email || 'No email'}
            </div>
          </div>
          <div className={`px-2 py-0.5 text-xs rounded uppercase tracking-wide ${roleColors[member.role] || roleColors.viewer}`}>
            {member.role}
          </div>
        </div>
      </div>
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header - REFACTORING UI: Simple, clean hierarchy */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Team Management</h1>
              {organization && (
                <div className="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-full">
                  <span className="text-sm font-medium text-teal-800 dark:text-teal-300">
                    {organization.name}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {organization 
                ? `Managing team members for ${organization.name}`
                : 'Add team members to your organization'
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* SINGLE PRIMARY ACTION - HERA Teal */}
            <button
              onClick={() => {
                setShowAddForm(true)
                trackHookEngagement({
                  trigger: 'add_team_member_button_visible',
                  action: 'click_add_team_member',
                  reward: 'form_opened',
                  investment: 'intent_to_add_member'
                })
              }}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Team Member
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Mobile sticky add button */}
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-10">
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-medium shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Team Member
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team list - 2/3 width on desktop */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className={designTokens.typography.sectionTitle}>Current Team</h2>
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  {teamCountText}
                </span>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading team members...</p>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {organization ? `No team members in ${organization.name} yet` : 'No team members yet'}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Add your first team member to get started
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {teamMembers.map((member) => (
                      <TeamMemberCard key={member.id} member={member} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Psychology hint - SUBTLE, not prominent */}
            {teamMembers.length > 0 && teamMembers.length < 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                      Did you know?
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      {organization 
                        ? `Teams like ${organization.name} with 3-5 members are 40% more productive. You're on the right track!`
                        : 'Teams with 3-5 members are 40% more productive. You\'re on the right track!'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Add form - 1/3 width on desktop */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <AnimatePresence>
              {showAddForm ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={designTokens.typography.sectionTitle}>Add Team Member</h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Organization Context */}
                  {organization && (
                    <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-800 dark:text-blue-300">
                          Adding to: <strong>{organization.name}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                        placeholder="John Smith"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                        placeholder="john@example.com"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Role
                      </label>
                      <RoleSelector />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedRole || !formData.fullName || !formData.email}
                      className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending Invitation...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Send Invitation
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center"
                >
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {teamCount === 0 ? 'Ready to build your team?' : 'Ready to add another team member?'}
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium text-sm flex items-center gap-1 mx-auto"
                  >
                    {teamCount === 0 ? 'Add your first member' : 'Add team member'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Notification system */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 max-w-md z-50"
          >
            <div className={`
              rounded-lg p-4 shadow-lg flex items-start gap-3
              ${notification.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
              }
            `}>
              {notification.type === 'success' ? (
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`text-sm ${
                  notification.type === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className={`
                  p-1 rounded transition-colors
                  ${notification.type === 'success'
                    ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200'
                    : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200'
                  }
                `}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}