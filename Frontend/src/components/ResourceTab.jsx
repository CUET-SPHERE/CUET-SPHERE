import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';

const ResourceTab = ({ semester, subjects }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState(null);

  const toggleSubject = (subjectIndex) => {
    setExpandedSubject(expandedSubject === subjectIndex ? null : subjectIndex);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-between"
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {semester}
        </span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {subjects.map((subject, index) => (
            <div key={index} className="bg-white dark:bg-gray-900">
              <button
                onClick={() => toggleSubject(index)}
                className="w-full px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 flex items-center justify-between"
              >
                <span className="text-gray-900 dark:text-white font-medium">
                  {subject.name}
                </span>
                {expandedSubject === index ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {expandedSubject === index && (
                <div className="px-6 pb-4">
                  <div className="grid gap-2">
                    {subject.resources.map((resource, resourceIndex) => (
                      <div
                        key={resourceIndex}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {resource.name}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {resource.type} • {resource.size}
                            </p>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                          <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
