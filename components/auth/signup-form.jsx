import { useState } from 'react'
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react'

export default function SignupForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [emailValid, setEmailValid] = useState(null)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  })

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let score = 0
    const feedback = []

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('At least 8 characters')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One uppercase letter')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One lowercase letter')
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('One number')
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('One special character')
    }

    return { score, feedback }
  }

  const handleEmailChange = (e) => {
    const email = e.target.value
    setFormData({ ...formData, email })
    
    if (email.length > 0) {
      setEmailValid(validateEmail(email))
    } else {
      setEmailValid(null)
    }
  }

  const handlePasswordChange = (e) => {
    const password = e.target.value
    setFormData({ ...formData, password })
    setPasswordStrength(calculatePasswordStrength(password))
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score < 2) return '#ef4444' // red
    if (passwordStrength.score < 4) return '#f59e0b' // yellow
    return '#10b981' // green
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score < 2) return 'Weak'
    if (passwordStrength.score < 4) return 'Medium'
    return 'Strong'
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '32px 24px',
        position: 'relative'
      }}>
        {/* Progress Indicator - Disabled for single step */}
        <div style={{
          height: '4px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px',
          marginBottom: '32px',
          opacity: '0.3'
        }}>
          <div style={{
            height: '100%',
            width: '100%',
            backgroundColor: '#3b82f6',
            borderRadius: '2px'
          }} />
        </div>

        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px',
            lineHeight: '1.2'
          }}>
            Start your free trial
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0'
          }}>
            No credit card required
          </p>
        </div>

        {/* SSO Buttons */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <button style={{
              padding: '12px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: '44px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            
            <button style={{
              padding: '12px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: '44px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                <path fill="#f25022" d="M1 1h10v10H1z"/>
                <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                <path fill="#7fba00" d="M1 13h10v10H1z"/>
                <path fill="#ffb900" d="M13 13h10v10H13z"/>
              </svg>
              Microsoft
            </button>
            
            <button style={{
              padding: '12px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: '44px'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '6px' }}>
                <path fill="#000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
                <path fill="#000" d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
              Apple
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '24px 0'
          }}>
            <div style={{
              flex: '1',
              height: '1px',
              backgroundColor: '#e5e7eb'
            }} />
            <span style={{
              padding: '0 16px',
              fontSize: '14px',
              color: '#6b7280',
              backgroundColor: 'white'
            }}>
              or continue with email
            </span>
            <div style={{
              flex: '1',
              height: '1px',
              backgroundColor: '#e5e7eb'
            }} />
          </div>
        </div>

        {/* Form Fields */}
        <form style={{ marginBottom: '24px' }}>
          {/* Email Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Work Email *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '40px',
                  border: `2px solid ${
                    emailValid === false ? '#ef4444' : 
                    emailValid === true ? '#10b981' : '#d1d5db'
                  }`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  minHeight: '44px'
                }}
              />
              {emailValid !== null && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}>
                  {emailValid ? (
                    <Check size={18} color="#10b981" />
                  ) : (
                    <X size={18} color="#ef4444" />
                  )}
                </div>
              )}
            </div>
            {emailValid === false && (
              <p style={{
                fontSize: '12px',
                color: '#ef4444',
                margin: '4px 0 0 0'
              }}>
                Please enter a valid email address
              </p>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="Create a strong password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  paddingRight: '40px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  minHeight: '44px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#6b7280" />
                ) : (
                  <Eye size={18} color="#6b7280" />
                )}
              </button>
            </div>
            
            {/* Password Strength Meter */}
            {formData.password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: getPasswordStrengthColor(),
                    fontWeight: '500'
                  }}>
                    {getPasswordStrengthText()}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    {passwordStrength.score}/5
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(passwordStrength.score / 5) * 100}%`,
                    backgroundColor: getPasswordStrengthColor(),
                    borderRadius: '3px',
                    transition: 'all 0.3s'
                  }} />
                </div>
                {passwordStrength.feedback.length > 0 && (
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    marginTop: '4px'
                  }}>
                    Missing: {passwordStrength.feedback.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Company Field (Optional) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Company (optional)
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Your company name"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                minHeight: '44px'
              }}
            />
          </div>

          {/* Primary CTA */}
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              minHeight: '48px',
              marginBottom: '16px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            Start Free Trial
          </button>

          {/* Terms Agreement */}
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
            margin: '0 0 24px 0',
            lineHeight: '1.5'
          }}>
            By signing up, you agree to our{' '}
            <a href="/terms" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Privacy Policy
            </a>
          </p>
        </form>

        {/* Footer Microcopy */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertCircle size={14} style={{ marginRight: '6px' }} />
            We only send product updates
          </p>
        </div>

        {/* Customer Logos/Trust Badges */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '20px'
        }}>
          <p style={{
            fontSize: '11px',
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Trusted by 10,000+ businesses
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            opacity: '0.6'
          }}>
            {/* Mock company logos */}
            <div style={{
              width: '60px',
              height: '24px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#6b7280',
              fontWeight: '600'
            }}>
              ACME
            </div>
            <div style={{
              width: '60px',
              height: '24px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#6b7280',
              fontWeight: '600'
            }}>
              BETA
            </div>
            <div style={{
              width: '60px',
              height: '24px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#6b7280',
              fontWeight: '600'
            }}>
              GAMMA
            </div>
          </div>
        </div>

        {/* Sign In Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0'
          }}>
            Already have an account?{' '}
            <a 
              href="/signin" 
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}