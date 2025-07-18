'use client'

import { useState } from 'react'
import SignupForm from '@/components/auth/signup-form'
import SigninForm from '@/components/auth/signin-form'

export default function AuthDemo() {
  const [currentForm, setCurrentForm] = useState('signup')

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      position: 'relative'
    }}>
      {/* Navigation Tabs */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '4px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setCurrentForm('signup')}
          style={{
            padding: '8px 24px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: currentForm === 'signup' ? '#3b82f6' : 'transparent',
            color: currentForm === 'signup' ? 'white' : '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginRight: '4px'
          }}
        >
          Sign Up Form
        </button>
        <button
          onClick={() => setCurrentForm('signin')}
          style={{
            padding: '8px 24px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: currentForm === 'signin' ? '#3b82f6' : 'transparent',
            color: currentForm === 'signin' ? 'white' : '#6b7280',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Sign In Form
        </button>
      </div>

      {/* Form Content */}
      <div style={{ paddingTop: '80px' }}>
        {currentForm === 'signup' ? <SignupForm /> : <SigninForm />}
      </div>

      {/* Design Notes */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        maxWidth: '300px',
        fontSize: '12px',
        color: '#6b7280',
        border: '1px solid #e5e7eb'
      }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Design Features ✨
        </h4>
        <ul style={{
          margin: '0',
          paddingLeft: '16px',
          lineHeight: '1.4'
        }}>
          <li>Mobile-responsive single-column layout</li>
          <li>Real-time email validation & password strength</li>
          <li>SSO buttons for Google, Microsoft, Apple</li>
          <li>Progressive profiling (optional company)</li>
          <li>High-contrast CTA & accessibility</li>
          <li>Privacy microcopy & trust badges</li>
          <li>Keyboard-safe design (CTA above keyboard)</li>
          <li>44px+ touch targets for mobile</li>
        </ul>
      </div>
    </div>
  )
}