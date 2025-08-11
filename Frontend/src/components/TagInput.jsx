import React, { useState, useMemo } from 'react';
import { X, Hash } from 'lucide-react';

function TagInput({ tags, setTags, allTags = [], placeholder = "Add tags..." }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!inputValue) return [];
    const lowercasedInput = inputValue.toLowerCase();
    return allTags.filter(
      (tag) =>
        !tags.includes(tag) &&
        tag.toLowerCase().startsWith(lowercasedInput)
    ).slice(0, 5); // Limit to 5 suggestions
  }, [inputValue, allTags, tags]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const addTag = (tagToAdd) => {
    const formattedTag = tagToAdd.trim().toLowerCase().replace(/\s+/g, '-');
    if (formattedTag && !tags.includes(formattedTag)) {
      setTags([...tags, formattedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <Hash className="h-5 w-5 text-gray-400 ml-2" />
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md px-2 py-1 text-sm font-medium"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // Delay to allow click on suggestions
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-w-[120px] py-1"
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <ul className="py-1">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion}
                onMouseDown={() => addTag(suggestion)}
                className="px-4 py-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TagInput;
