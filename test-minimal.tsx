'use client'

import { useState } from 'react'

export default function TestMinimal() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <div className="min-h-screen">
      {currentStep === 1 && (
        <div>
          <h1>Step 1</h1>
          <div className="mt-6 p-4">
            <div className="flex items-start gap-3">
              <div>
                <span className="text-blue-600">i</span>
              </div>
              <div>
                <h4>Quick Tips:</h4>
                <ul>
                  <li>• Choose a memorable restaurant name that reflects your style</li>
                  <li>• Be specific about your cuisine (e.g., &quot;Italian Fine Dining&quot; vs just &quot;Italian&quot;)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}