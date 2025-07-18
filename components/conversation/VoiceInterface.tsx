/**
 * HERA Voice Interface Component
 * Advanced voice input/output for conversational AI
 */

"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, MicOff, Volume2, VolumeX, Play, Pause, 
  RefreshCw, Settings, Waveform, Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationStore } from '@/stores/conversationStore'
import type { VoiceInput, SpeechResult, TTSOptions } from '@/types/conversation'

// ================================================================================================
// VOICE INTERFACE COMPONENT
// ================================================================================================

interface VoiceInterfaceProps {
  className?: string
  showWaveform?: boolean
  autoSpeak?: boolean
  continuousMode?: boolean
  onVoiceCommand?: (command: string) => void
}

export function VoiceInterface({
  className,
  showWaveform = true,
  autoSpeak = false,
  continuousMode = false,
  onVoiceCommand
}: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Voice preferences
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [speechRate, setSpeechRate] = useState(1)
  const [speechPitch, setSpeechPitch] = useState(1)
  const [language, setLanguage] = useState('en-US')

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Store integration
  const sendVoiceMessage = useConversationStore(state => state.sendVoiceMessage)
  const isConversationListening = useConversationStore(state => state.isListening)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    initializeSpeechAPIs()
    return cleanup
  }, [])

  // Handle continuous mode
  useEffect(() => {
    if (continuousMode && voiceEnabled && !isListening) {
      startListening()
    }
  }, [continuousMode, voiceEnabled])

  const initializeSpeechAPIs = () => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        setupSpeechRecognition()
      } else {
        setError('Speech recognition not supported in this browser')
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        synthesisRef.current = window.speechSynthesis
        loadVoices()
      }
    }
  }

  const setupSpeechRecognition = () => {
    if (!recognitionRef.current) return

    const recognition = recognitionRef.current

    recognition.continuous = continuousMode
    recognition.interimResults = true
    recognition.lang = language
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setupAudioVisualization()
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence

        if (event.results[i].isFinal) {
          finalTranscript += transcript
          setConfidence(confidence)
        } else {
          interimTranscript += transcript
        }
      }

      setCurrentTranscript(finalTranscript || interimTranscript)

      // Process final transcript
      if (finalTranscript) {
        handleSpeechResult(finalTranscript, event.results[event.results.length - 1][0].confidence)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
      cleanup()
    }

    recognition.onend = () => {
      setIsListening(false)
      cleanup()
      
      // Restart if in continuous mode
      if (continuousMode && voiceEnabled) {
        setTimeout(() => startListening(), 1000)
      }
    }
  }

  const setupAudioVisualization = async () => {
    if (!showWaveform) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      updateAudioLevel()
    } catch (error) {
      console.warn('Audio visualization setup failed:', error)
    }
  }

  const updateAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    setAudioLevel(average / 255)

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
  }

  const loadVoices = () => {
    if (!synthesisRef.current) return

    const voices = synthesisRef.current.getVoices()
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en'))
    
    if (englishVoices.length > 0 && !selectedVoice) {
      setSelectedVoice(englishVoices[0].name)
    }
  }

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return

    try {
      setIsProcessing(true)
      setCurrentTranscript('')
      setError(null)
      
      recognitionRef.current.start()
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setError('Failed to start listening')
      setIsProcessing(false)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    cleanup()
  }, [isListening])

  const handleSpeechResult = async (transcript: string, confidence: number) => {
    if (!transcript.trim()) return

    setIsProcessing(true)

    try {
      // Check for voice commands
      const command = parseVoiceCommand(transcript)
      if (command && onVoiceCommand) {
        onVoiceCommand(command)
        return
      }

      // Create voice input object
      const voiceInput: VoiceInput = {
        transcript,
        confidence,
        language,
        duration: 0 // Would be calculated from actual audio
      }

      // Send to conversation store
      await sendVoiceMessage(new Blob([], { type: 'audio/wav' }))
      
    } catch (error) {
      console.error('Voice processing error:', error)
      setError('Failed to process voice input')
    } finally {
      setIsProcessing(false)
      setCurrentTranscript('')
    }
  }

  const parseVoiceCommand = (transcript: string): string | null => {
    const lowerTranscript = transcript.toLowerCase()
    
    // System commands
    if (lowerTranscript.includes('stop listening')) return 'stop_listening'
    if (lowerTranscript.includes('clear conversation')) return 'clear_conversation'
    if (lowerTranscript.includes('new conversation')) return 'new_conversation'
    
    // Navigation commands
    if (lowerTranscript.includes('show dashboard')) return 'navigate_dashboard'
    if (lowerTranscript.includes('show transactions')) return 'navigate_transactions'
    if (lowerTranscript.includes('show customers')) return 'navigate_customers'
    
    return null
  }

  const speakText = useCallback(async (text: string, options?: TTSOptions) => {
    if (!synthesisRef.current || !voiceEnabled || isSpeaking) return

    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Configure utterance
      const voices = synthesisRef.current!.getVoices()
      const voice = voices.find(v => v.name === selectedVoice) || voices[0]
      
      if (voice) utterance.voice = voice
      utterance.rate = options?.rate || speechRate
      utterance.pitch = options?.pitch || speechPitch
      utterance.volume = options?.volume || 1
      utterance.lang = options?.language || language

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }
      utterance.onerror = (event) => {
        setIsSpeaking(false)
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      synthesisRef.current!.speak(utterance)
    })
  }, [voiceEnabled, isSpeaking, selectedVoice, speechRate, speechPitch, language])

  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setAudioLevel(0)
    setIsProcessing(false)
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (voiceEnabled && isListening) {
      stopListening()
    }
  }

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Voice Controls */}
      <div className="flex items-center space-x-3">
        {/* Main Voice Button */}
        <motion.button
          className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
            isListening 
              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" 
              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700",
            !voiceEnabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={toggleListening}
          disabled={!voiceEnabled}
          whileHover={{ scale: voiceEnabled ? 1.05 : 1 }}
          whileTap={{ scale: voiceEnabled ? 0.95 : 1 }}
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
            boxShadow: isListening 
              ? [
                  '0 0 20px rgba(239, 68, 68, 0.3)',
                  '0 0 40px rgba(239, 68, 68, 0.5)',
                  '0 0 20px rgba(239, 68, 68, 0.3)'
                ]
              : [
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                  '0 0 30px rgba(147, 51, 234, 0.4)',
                  '0 0 20px rgba(59, 130, 246, 0.3)'
                ]
          }}
          transition={{
            scale: { duration: 1, repeat: Infinity },
            boxShadow: { duration: 2, repeat: Infinity }
          }}
        >
          {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          
          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              className="absolute inset-0 border-4 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.button>

        {/* Voice Settings */}
        <motion.button
          className="p-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={toggleVoice}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </motion.button>

        {/* Speaking Indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.button
              className="p-3 text-green-500 rounded-full bg-green-100 dark:bg-green-900/30"
              onClick={stopSpeaking}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Pause className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Audio Waveform Visualization */}
      <AnimatePresence>
        {showWaveform && isListening && (
          <motion.div
            className="flex items-center justify-center space-x-1 h-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-full"
                animate={{
                  height: [
                    4,
                    Math.max(4, audioLevel * 60 + Math.random() * 20),
                    4
                  ]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Transcript */}
      <AnimatePresence>
        {currentTranscript && (
          <motion.div
            className="max-w-md p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-start space-x-2">
              <Brain className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Listening... {Math.round(confidence * 100)}% confident
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  "{currentTranscript}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="max-w-md p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Status */}
      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-1">
          <div className={cn(
            "w-2 h-2 rounded-full",
            voiceEnabled ? "bg-green-500" : "bg-red-500"
          )} />
          <span>{voiceEnabled ? "Voice On" : "Voice Off"}</span>
        </div>
        
        {isListening && (
          <div className="flex items-center space-x-1">
            <motion.div
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>Listening</span>
          </div>
        )}
        
        {isSpeaking && (
          <div className="flex items-center space-x-1">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <span>Speaking</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ================================================================================================
// VOICE SETTINGS PANEL
// ================================================================================================

interface VoiceSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function VoiceSettingsPanel({ isOpen, onClose }: VoiceSettingsPanelProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [speechRate, setSpeechRate] = useState(1)
  const [speechPitch, setSpeechPitch] = useState(1)
  const [language, setLanguage] = useState('en-US')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)
        
        if (availableVoices.length > 0 && !selectedVoice) {
          setSelectedVoice(availableVoices[0].name)
        }
      }

      loadVoices()
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      }
    }
  }, [selectedVoice])

  const testVoice = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance("Hello! This is how I sound with these settings.")
      const voice = voices.find(v => v.name === selectedVoice)
      
      if (voice) utterance.voice = voice
      utterance.rate = speechRate
      utterance.pitch = speechPitch
      utterance.lang = language
      
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
        
        <div className="space-y-4">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Speech Rate: {speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechRate}
              onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Speech Pitch */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Speech Pitch: {speechPitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speechPitch}
              onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="pt-BR">Portuguese (Brazil)</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
              <option value="zh-CN">Chinese (Mandarin)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={testVoice}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Test Voice
          </button>
          
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}