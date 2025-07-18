'use client'

import { useState } from 'react'
import { FormValidator, createRestaurantValidator, getStepFields, validateStep } from '@/lib/validation/form-validation'

export default function TestValidationPage() {
  const [validator] = useState(() => createRestaurantValidator())
  const [testData, setTestData] = useState({
    businessName: '',
    cuisineType: '',
    businessEmail: '',
    primaryPhone: ''
  })

  const testValidation = () => {
    console.log('🧪 Testing validation...')
    console.log('Validator exists:', !!validator)
    
    const stepValidation = validateStep(1, testData, validator)
    console.log('Step validation result:', stepValidation)
    
    const validationState = validator.validateForm(testData)
    console.log('Full validation state:', validationState)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Validation Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Data</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <input
                type="text"
                value={testData.businessName}
                onChange={(e) => setTestData({...testData, businessName: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter business name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cuisine Type</label>
              <input
                type="text"
                value={testData.cuisineType}
                onChange={(e) => setTestData({...testData, cuisineType: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter cuisine type"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Business Email</label>
              <input
                type="email"
                value={testData.businessEmail}
                onChange={(e) => setTestData({...testData, businessEmail: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter business email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Primary Phone</label>
              <input
                type="text"
                value={testData.primaryPhone}
                onChange={(e) => setTestData({...testData, primaryPhone: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <button
            onClick={testValidation}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Validation (Check Console)
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Current State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({
              testData,
              validatorExists: !!validator
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}