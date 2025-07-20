'use client';

import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import useVoiceControls from '@/hooks/useVoiceControls';

interface VoiceControlsProps {
  text?: string;
  onVoiceInput?: (transcript: string) => void;
  className?: string;
  showSettings?: boolean;
  autoRead?: boolean;
}

export default function VoiceControls({ 
  text, 
  onVoiceInput, 
  className = '',
  showSettings = false,
  autoRead = false 
}: VoiceControlsProps) {
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  
  const {
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    isSpeaking,
    isPaused,
    startListening,
    stopListening,
    isListening,
    transcript,
    clearTranscript,
    voiceSettings,
    updateVoiceSettings,
    availableVoices,
    speechSupportedTTS,
    speechSupportedSTT,
    error,
    clearError
  } = useVoiceControls();

  // Auto-read functionality
  React.useEffect(() => {
    if (autoRead && text && voiceSettings.autoRead && !isSpeaking) {
      speak(text);
    }
  }, [text, autoRead, voiceSettings.autoRead, speak, isSpeaking]);

  // Handle voice input
  React.useEffect(() => {
    if (transcript && onVoiceInput) {
      onVoiceInput(transcript);
      clearTranscript();
    }
  }, [transcript, onVoiceInput, clearTranscript]);

  const handleSpeakClick = () => {
    if (!text) return;
    
    if (isSpeaking) {
      if (isPaused) {
        resumeSpeaking();
      } else {
        pauseSpeaking();
      }
    } else {
      speak(text);
    }
  };

  const handleStopClick = () => {
    stopSpeaking();
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!speechSupportedTTS && !speechSupportedSTT) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <AlertCircle size={16} />
        <span className="text-sm">Voice features not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Text-to-Speech Controls */}
      {speechSupportedTTS && text && (
        <div className="flex items-center gap-1">
          <button
            onClick={handleSpeakClick}
            disabled={!text}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isSpeaking 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={
              isSpeaking 
                ? (isPaused ? 'Resume reading' : 'Pause reading')
                : 'Read aloud'
            }
          >
            {isSpeaking ? (isPaused ? <Play size={18} /> : <Pause size={18} />) : <Volume2 size={18} />}
          </button>

          {isSpeaking && (
            <button
              onClick={handleStopClick}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
              title="Stop reading"
            >
              <Square size={16} />
            </button>
          )}
        </div>
      )}

      {/* Speech-to-Text Controls */}
      {speechSupportedSTT && onVoiceInput && (
        <button
          onClick={handleMicClick}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isListening 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse' 
              : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
      )}

      {/* Settings Button */}
      {showSettings && (speechSupportedTTS || speechSupportedSTT) && (
        <button
          onClick={() => setShowVoiceSettings(!showVoiceSettings)}
          className="p-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-all duration-200"
          title="Voice settings"
        >
          <Settings size={18} />
        </button>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-lg border border-red-400/30">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-300">Listening...</span>
        </div>
      )}

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-lg border border-green-400/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-300">
            {isPaused ? 'Paused' : 'Speaking...'}
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-lg border border-red-400/30">
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-sm text-red-300">{error}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300"
            title="Clear error"
          >
            ×
          </button>
        </div>
      )}

      {/* Voice Settings Panel */}
      {showVoiceSettings && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-gray-800/95 backdrop-blur-md rounded-xl border border-gray-600/30 shadow-xl z-50 min-w-[300px]">
          <h3 className="text-lg font-bold text-white mb-4">Voice Settings</h3>
          
          {speechSupportedTTS && (
            <>
              {/* Auto-read Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={voiceSettings.autoRead}
                    onChange={(e) => updateVoiceSettings({ autoRead: e.target.checked })}
                    className="rounded"
                  />
                  Auto-read AI responses
                </label>
              </div>

              {/* Voice Selection */}
              {availableVoices.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm text-gray-300 mb-2">Voice</label>
                  <select
                    value={voiceSettings.voice?.name || ''}
                    onChange={(e) => {
                      const voice = availableVoices.find(v => v.name === e.target.value);
                      updateVoiceSettings({ voice: voice || null });
                    }}
                    className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
                  >
                    {availableVoices
                      .filter(voice => voice.lang.startsWith('en'))
                      .map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Speed Control */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">
                  Speed: {voiceSettings.rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => updateVoiceSettings({ rate: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Volume Control */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">
                  Volume: {Math.round(voiceSettings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => updateVoiceSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Pitch Control */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">
                  Pitch: {voiceSettings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setShowVoiceSettings(false)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}