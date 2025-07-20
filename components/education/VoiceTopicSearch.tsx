'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Search, 
  Brain,
  MessageCircle,
  Sparkles,
  Volume2
} from 'lucide-react';
import useVoiceControls from '@/hooks/useVoiceControls';

interface VoiceTopicSearchProps {
  onTopicSelect: (topic: string) => void;
  onQuestionSubmit?: (question: string) => void;
  availableTopics?: string[];
  className?: string;
}

export default function VoiceTopicSearch({ 
  onTopicSelect, 
  onQuestionSubmit,
  availableTopics = [],
  className = '' 
}: VoiceTopicSearchProps) {
  const [searchMode, setSearchMode] = useState<'topic' | 'question'>('topic');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    startListening,
    stopListening,
    isListening,
    transcript,
    clearTranscript,
    speechSupportedSTT,
    speak,
    speechSupportedTTS,
    error
  } = useVoiceControls();

  // Process voice input when transcript changes
  useEffect(() => {
    if (transcript && !isProcessing) {
      setIsProcessing(true);
      processVoiceInput(transcript);
    }
  }, [transcript]);

  const processVoiceInput = async (input: string) => {
    const lowerInput = input.toLowerCase().trim();
    
    if (searchMode === 'topic') {
      // Try to match with available topics
      const matchedTopic = findBestTopicMatch(lowerInput);
      
      if (matchedTopic) {
        if (speechSupportedTTS) {
          speak(`Great! Let me explain ${matchedTopic} for you.`);
        }
        onTopicSelect(matchedTopic);
        clearTranscript();
      } else {
        // Generate suggestions
        const topicSuggestions = generateTopicSuggestions(lowerInput);
        setSuggestions(topicSuggestions);
        
        if (speechSupportedTTS && topicSuggestions.length > 0) {
          speak(`I found some related topics: ${topicSuggestions.slice(0, 3).join(', ')}. Would you like to learn about any of these?`);
        }
      }
    } else if (searchMode === 'question' && onQuestionSubmit) {
      // Process as a question
      if (speechSupportedTTS) {
        speak('Let me help you with that question.');
      }
      onQuestionSubmit(input);
      clearTranscript();
    }
    
    setIsProcessing(false);
  };

  const findBestTopicMatch = (input: string): string | null => {
    // Direct matches
    for (const topic of availableTopics) {
      if (topic.toLowerCase().includes(input) || input.includes(topic.toLowerCase())) {
        return topic;
      }
    }

    // Keyword-based matching
    const keywordMatches: Record<string, string[]> = {
      'marketing': ['Marketing mix', 'The market', 'Meeting customer needs'],
      'finance': ['Raising finance', 'Financial planning', 'Managing finance'],
      'people': ['Managing people', 'Entrepreneurs and leaders'],
      'business': ['Business objectives and strategy', 'Business growth', 'Business decisions'],
      'global': ['Globalisation', 'Global markets and business expansion', 'Global marketing'],
      'money': ['Raising finance', 'Financial planning', 'Managing finance'],
      'staff': ['Managing people'],
      'employees': ['Managing people'],
      'strategy': ['Business objectives and strategy', 'Decision-making techniques'],
      'competition': ['Assessing competitiveness'],
      'change': ['Managing change'],
      'resources': ['Resource management'],
      'external': ['External influences']
    };

    for (const [keyword, topics] of Object.entries(keywordMatches)) {
      if (input.includes(keyword)) {
        const matchingTopic = topics.find(topic => availableTopics.includes(topic));
        if (matchingTopic) return matchingTopic;
      }
    }

    return null;
  };

  const generateTopicSuggestions = (input: string): string[] => {
    const suggestions: string[] = [];
    
    // Find partial matches
    for (const topic of availableTopics) {
      const topicWords = topic.toLowerCase().split(' ');
      const inputWords = input.split(' ');
      
      const hasCommonWord = topicWords.some(word => 
        inputWords.some(inputWord => 
          inputWord.length > 2 && (word.includes(inputWord) || inputWord.includes(word))
        )
      );
      
      if (hasCommonWord) {
        suggestions.push(topic);
      }
    }

    return suggestions.slice(0, 5);
  };

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      setSuggestions([]);
      startListening();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onTopicSelect(suggestion);
    setSuggestions([]);
    clearTranscript();
  };

  const getVoicePrompt = () => {
    if (searchMode === 'topic') {
      return "Say a topic you'd like to learn about, like 'marketing mix' or 'business finance'";
    } else {
      return "Ask me any business question, like 'What is a limited company?'";
    }
  };

  if (!speechSupportedSTT) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Voice Search Interface */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="text-blue-400" size={24} />
          <h3 className="text-xl font-bold text-white">Ask by Voice</h3>
          <Sparkles className="text-yellow-400" size={20} />
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSearchMode('topic')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              searchMode === 'topic'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            🎯 Learn Topic
          </button>
          <button
            onClick={() => setSearchMode('question')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              searchMode === 'question'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ❓ Ask Question
          </button>
        </div>

        {/* Voice Input Area */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleVoiceClick}
            disabled={isProcessing}
            className={`p-4 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-red-500/30 text-red-400 animate-pulse border-2 border-red-400'
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-2 border-blue-400/30'
            } disabled:opacity-50`}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <div className="flex-1">
            <div className="text-sm text-gray-300 mb-1">
              {isListening ? 'Listening...' : getVoicePrompt()}
            </div>
            
            {transcript && (
              <div className="p-3 bg-white/10 rounded-lg border border-white/20">
                <div className="text-white font-medium">"{transcript}"</div>
                {isProcessing && (
                  <div className="text-sm text-blue-300 mt-1">Processing...</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Example Commands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-300 mb-2">🎯 Try saying:</div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>"Explain marketing mix"</div>
              <div>"Tell me about business finance"</div>
              <div>"I want to learn about globalisation"</div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-sm font-medium text-purple-300 mb-2">❓ Or ask:</div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>"What is a limited company?"</div>
              <div>"How does marketing work?"</div>
              <div>"Why is finance important?"</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-400/30">
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <Search className="text-yellow-400" size={20} />
            <h4 className="font-bold text-white">Did you mean one of these?</h4>
          </div>
          
          <div className="grid gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-left group"
              >
                <span className="text-white">{suggestion}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Volume2 size={16} className="text-blue-400" />
                  <Brain size={16} className="text-green-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Status Indicator */}
      {isListening && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">Listening for {searchMode}...</span>
          </div>
        </div>
      )}
    </div>
  );
}