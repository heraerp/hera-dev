import { useState, useEffect } from 'react'
import { Eye, EyeOff, Check, X, AlertCircle, Shield } from 'lucide-react'

export default function MobileOptimizedSignup() {
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
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  // Detect virtual keyboard on mobile
  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport?.height || window.innerHeight
      const wh = window.innerHeight
      
      if (vh < wh * 0.75) {
        setIsKeyboardVisible(true)
        setKeyboardHeight(wh - vh)
      } else {
        setIsKeyboardVisible(false)
        setKeyboardHeight(0)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      } else {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

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
      feedback.push('8+ chars')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Uppercase')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Lowercase')
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('Number')
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('Symbol')
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
    if (passwordStrength.score < 2) return '#ef4444'
    if (passwordStrength.score < 4) return '#f59e0b'
    return '#10b981'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score < 2) return 'Weak'
    if (passwordStrength.score < 4) return 'Good'
    return 'Strong'
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Fixed Header for Mobile */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px 12px 20px',
        zIndex: 100
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 4px 0',
            lineHeight: '1.2'
          }}>
            Start your free trial
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0'
          }}>
            No credit card required
          </p>
        </div>

        {/* Progress Indicator - Mobile Friendly */}
        <div style={{
          height: '3px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px',
          marginTop: '16px',
          opacity: '0.3'
        }}>
          <div style={{
            height: '100%',
            width: '100%',
            backgroundColor: '#3b82f6',
            borderRadius: '2px'
          }} />
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '20px',
        paddingBottom: isKeyboardVisible ? `${keyboardHeight + 20}px` : '120px'
      }}>
        <div style={{
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          {/* SSO Buttons - Mobile Optimized */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <button style={{
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: '52px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <button style={{
                  padding: '14px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minHeight: '52px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                    <path fill="#f25022" d="M1 1h10v10H1z"/>
                    <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                    <path fill="#7fba00" d="M1 13h10v10H1z"/>
                    <path fill="#ffb900" d="M13 13h10v10H13z"/>
                  </svg>
                  Microsoft
                </button>
                
                <button style={{
                  padding: '14px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  minHeight: '52px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                    <path fill="#000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
                    <path fill="#000" d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  Apple
                </button>
              </div>
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
                backgroundColor: '#f8fafc',
                fontWeight: '500'
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

          {/* Form Fields - Mobile Optimized */}
          <form style={{ marginBottom: '24px' }}>
            {/* Email Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
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
                    padding: '16px 20px',
                    paddingRight: '50px',
                    border: `3px solid ${
                      emailValid === false ? '#ef4444' : 
                      emailValid === true ? '#10b981' : '#e5e7eb'
                    }`,
                    borderRadius: '12px',
                    fontSize: '17px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    minHeight: '56px',
                    backgroundColor: 'white'
                  }}
                />
                {emailValid !== null && (
                  <div style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    {emailValid ? (
                      <Check size={22} color="#10b981" />
                    ) : (
                      <X size={22} color="#ef4444" />
                    )}
                  </div>
                )}
              </div>
              {emailValid === false && (
                <p style={{
                  fontSize: '14px',
                  color: '#ef4444',
                  margin: '6px 0 0 0',
                  fontWeight: '500'
                }}>
                  Please enter a valid email address
                </p>
              )}
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
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
                    padding: '16px 20px',
                    paddingRight: '50px',
                    border: '3px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '17px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    minHeight: '56px',
                    backgroundColor: 'white'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={22} color="#6b7280" />
                  ) : (
                    <Eye size={22} color="#6b7280" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Meter - Mobile */}
              {formData.password && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      color: getPasswordStrengthColor(),
                      fontWeight: '600'
                    }}>
                      {getPasswordStrengthText()}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {passwordStrength.score}/5
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(),
                      borderRadius: '4px',
                      transition: 'all 0.3s'
                    }} />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginTop: '6px'
                    }}>
                      Missing: {passwordStrength.feedback.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Company Field (Optional) */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
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
                  padding: '16px 20px',
                  border: '3px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '17px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  minHeight: '56px',
                  backgroundColor: 'white'
                }}
              />
            </div>
          </form>

          {/* Trust Badge */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '2px solid #bfdbfe',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <Shield size={20} color="#3b82f6" style={{ marginRight: '8px' }} />
              <span style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#1e40af'
              }}>
                Enterprise Security
              </span>
            </div>
            <p style={{
              fontSize: '13px',
              color: '#1e40af',
              margin: '0',
              lineHeight: '1.4'
            }}>
              Your data is protected with bank-grade encryption. We only send product updates and never share your information.
            </p>
          </div>

          {/* Customer Logos - Mobile */}
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              Trusted by 10,000+ businesses
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              opacity: '0.7'
            }}>
              <div style={{
                width: '70px',
                height: '28px',
                backgroundColor: '#e5e7eb',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                ACME
              </div>
              <div style={{
                width: '70px',
                height: '28px',
                backgroundColor: '#e5e7eb',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                BETA
              </div>
              <div style={{
                width: '70px',
                height: '28px',
                backgroundColor: '#e5e7eb',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
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
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '15px',
              color: '#6b7280',
              margin: '0'
            }}>
              Already have an account?{' '}
              <a 
                href="/signin" 
                style={{ 
                  color: '#3b82f6', 
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Fixed CTA Button - Always Above Keyboard */}
      <div style={{
        position: 'fixed',
        bottom: isKeyboardVisible ? `${keyboardHeight + 20}px` : '20px',
        left: '20px',
        right: '20px',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        transition: 'bottom 0.3s ease',
        zIndex: 1000
      }}>
        <button
          type="submit"
          style={{
            width: '100%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 24px',
            fontSize: '17px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            minHeight: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Start Free Trial
        </button>
        
        {/* Terms - Mobile Compact */}
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
          margin: '12px 0 0 0',
          lineHeight: '1.4'
        }}>
          By signing up, you agree to our{' '}
          <a href="/terms" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            Terms
          </a>{' '}
          and{' '}
          <a href="/privacy" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}