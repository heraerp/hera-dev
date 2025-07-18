'use client'

import { useState } from 'react'

export default function TestSyntax() {
  const [test, setTest] = useState('hello')

  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Test Page</h1>
      <p>This is a test to isolate syntax issues</p>
    </div>
  )
}