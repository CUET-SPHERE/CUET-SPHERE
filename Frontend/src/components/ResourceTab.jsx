import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ResourceTab = ({ semester, subjects }) => {
  const { colors, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);

  const toggleSubject = (subjectIndex) => {
    setExpandedSubject(expandedSubject === subjectIndex ? null : subjectIndex);
  };

  return (
    <div className={`${colors?.border || 'border-gray-200 dark:border-gray-700'} border rounded-lg overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 ${colors?.cardSecondary || 'bg-gray-50 dark:bg-gray-800'} ${colors?.hover || 'hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors duration-200 flex items-center justify-between`}
      >
        <span className={`text-lg font-semibold ${colors?.textPrimary || 'text-gray-900 dark:text-white'}`}>
          {semester}
        </span>
        {isOpen ? (
          <ChevronUp className={`h-5 w-5 ${colors?.textSecondary || 'text-gray-500'}`} />
        ) : (
          <ChevronDown className={`h-5 w-5 ${colors?.textSecondary || 'text-gray-500'}`} />
        )}
      </button>

      {isOpen && (
        <div className={`${colors?.borderLight || 'divide-gray-200 dark:divide-gray-700'} divide-y`}>
          {subjects.map((subject, index) => (
            <div key={index} className={`${colors?.surface || 'bg-white dark:bg-gray-900'}`}>
              <button
                onClick={() => toggleSubject(index)}
                className={`w-full px-6 py-3 ${colors?.hover || 'hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200 flex items-center justify-between`}
              >
                <span className={`${colors?.textPrimary || 'text-gray-900 dark:text-white'} font-medium`}>
                  {subject.name}
                </span>
                {expandedSubject === index ? (
                  <ChevronUp className={`h-4 w-4 ${colors?.textSecondary || 'text-gray-500'}`} />
                ) : (
                  <ChevronDown className={`h-4 w-4 ${colors?.textSecondary || 'text-gray-500'}`} />
                )}
              </button>

              {expandedSubject === index && (
                <div className="px-6 pb-4">
                  <div className="grid gap-2">
                    {subject.resources.map((resource, resourceIndex) => (
                      <div
                        key={resourceIndex}
                        className={`flex items-center justify-between p-3 ${colors?.cardSecondary || 'bg-gray-50 dark:bg-gray-800'} rounded-lg ${colors?.hover || 'hover:bg-gray-100 dark:hover:bg-gray-700'} transition-colors duration-200`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className={`h-4 w-4 ${colors?.primary || 'text-blue-600'}`} />
                          <div>
                            <span className={`text-sm font-medium ${colors?.textPrimary || 'text-gray-900 dark:text-white'}`}>
                              {resource.name}
                            </span>
                            <p className={`text-xs ${colors?.textSecondary || 'text-gray-500 dark:text-gray-400'}`}>
                              {resource.type} • {resource.size}
                            </p>
                          </div>
                        </div>
                        <button className={`p-1 ${colors?.hover || 'hover:bg-gray-200 dark:hover:bg-gray-600'} rounded`}>
                          <Download className={`h-4 w-4 ${colors?.textSecondary || 'text-gray-600 dark:text-gray-400'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceTab;
