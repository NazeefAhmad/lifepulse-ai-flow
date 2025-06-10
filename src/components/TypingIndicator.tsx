
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 text-purple-600">
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce"></div>
      </div>
      <span className="text-xs ml-1">Processing...</span>
    </div>
  );
};

export default TypingIndicator;
