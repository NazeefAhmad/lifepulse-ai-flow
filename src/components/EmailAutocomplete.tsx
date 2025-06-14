
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, User } from 'lucide-react';
import { useEmailSuggestions } from '@/hooks/useEmailSuggestions';

interface EmailAutocompleteProps {
  emailValue: string;
  nameValue: string;
  onEmailChange: (email: string) => void;
  onNameChange: (name: string) => void;
  emailPlaceholder?: string;
  namePlaceholder?: string;
}

const EmailAutocomplete = ({
  emailValue,
  nameValue,
  onEmailChange,
  onNameChange,
  emailPlaceholder = "Enter email address",
  namePlaceholder = "Enter name (optional)"
}: EmailAutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const { filterSuggestions } = useEmailSuggestions();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredSuggestions = filterSuggestions(emailValue);

  const handleEmailInputChange = (value: string) => {
    onEmailChange(value);
    setShowSuggestions(value.length > 0);
    setFocusedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: any) => {
    onEmailChange(suggestion.email);
    onNameChange(suggestion.name || '');
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && suggestionRefs.current[focusedIndex]) {
      suggestionRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex]);

  return (
    <div className="relative space-y-3">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="email"
          placeholder={emailPlaceholder}
          value={emailValue}
          onChange={(e) => handleEmailInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(emailValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.email}
                ref={el => suggestionRefs.current[index] = el}
                className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                  index === focusedIndex 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{suggestion.email}</div>
                    {suggestion.name && (
                      <div className="text-sm text-gray-600">{suggestion.name}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={namePlaceholder}
          value={nameValue}
          onChange={(e) => onNameChange(e.target.value)}
          className="pl-10 bg-white border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      </div>
    </div>
  );
};

export default EmailAutocomplete;
