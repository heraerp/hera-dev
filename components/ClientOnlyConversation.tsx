/**
 * Client-only wrapper for conversation components to prevent SSR hydration issues
 */

"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

interface ClientOnlyConversationProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnlyConversation({ children, fallback }: ClientOnlyConversationProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            HERA AI Assistant
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Initializing your conversational AI experience...
          </p>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

export default ClientOnlyConversation