'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
  autoRead: boolean;
}

interface UseVoiceControlsReturn {
  // Text-to-Speech
  speak: (text: string) => void;
  stopSpeaking: () => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  
  // Speech-to-Text
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  transcript: string;
  clearTranscript: () => void;
  
  // Voice Settings
  voiceSettings: VoiceSettings;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  availableVoices: SpeechSynthesisVoice[];
  
  // Support Detection
  speechSupportedTTS: boolean;
  speechSupportedSTT: boolean;
  
  // Error Handling
  error: string | null;
  clearError: () => void;
}

export default function useVoiceControls(): UseVoiceControlsReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voice: null,
    autoRead: false
  });

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  const speechSupportedTTS = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const speechSupportedSTT = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Load available voices
  useEffect(() => {
    if (!speechSupportedTTS) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice (prefer English voices)
      if (voices.length > 0 && !voiceSettings.voice) {
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.name.includes('Google')
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        setVoiceSettings(prev => ({ ...prev, voice: englishVoice }));
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [speechSupportedTTS]);

  // Initialize speech recognition
  useEffect(() => {
    if (!speechSupportedSTT) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [speechSupportedSTT]);

  // Text-to-Speech Functions
  const speak = useCallback((text: string) => {
    if (!speechSupportedTTS || !text.trim()) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;
    
    if (voiceSettings.voice) {
      utterance.voice = voiceSettings.voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setError(null);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [speechSupportedTTS, voiceSettings]);

  const stopSpeaking = useCallback(() => {
    if (!speechSupportedTTS) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [speechSupportedTTS]);

  const pauseSpeaking = useCallback(() => {
    if (!speechSupportedTTS || !isSpeaking) return;
    speechSynthesis.pause();
    setIsPaused(true);
  }, [speechSupportedTTS, isSpeaking]);

  const resumeSpeaking = useCallback(() => {
    if (!speechSupportedTTS || !isPaused) return;
    speechSynthesis.resume();
    setIsPaused(false);
  }, [speechSupportedTTS, isPaused]);

  // Speech-to-Text Functions
  const startListening = useCallback(() => {
    if (!speechSupportedSTT || !recognitionRef.current || isListening) return;

    try {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (error) {
      setError('Failed to start speech recognition');
    }
  }, [speechSupportedSTT, isListening]);

  const stopListening = useCallback(() => {
    if (!speechSupportedSTT || !recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      setError('Failed to stop speech recognition');
    }
  }, [speechSupportedSTT]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Settings Functions
  const updateVoiceSettings = useCallback((settings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSupportedTTS) {
        speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [speechSupportedTTS]);

  return {
    // Text-to-Speech
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isSpeaking,
    isPaused,
    
    // Speech-to-Text
    startListening,
    stopListening,
    isListening,
    transcript,
    clearTranscript,
    
    // Voice Settings
    voiceSettings,
    updateVoiceSettings,
    availableVoices,
    
    // Support Detection
    speechSupportedTTS,
    speechSupportedSTT,
    
    // Error Handling
    error,
    clearError
  };
}