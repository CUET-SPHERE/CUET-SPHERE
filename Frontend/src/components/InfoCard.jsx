import React from 'react';

const InfoCard = ({ title, value, icon: Icon, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800',
    green: 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800',
    red: 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800'
  };

  return (
    <div 
      className={`
        p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer
        hover:shadow-lg hover:scale-105
        ${colorClasses[color]}
        ${onClick ? 'hover:bg-opacity-80' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-2xl font-bold">
            {value}
          </p>
        </div>
        {Icon && (
          <Icon className="h-8 w-8 opacity-70" />
        )}
      </div>
    </div>
  );
};

export default InfoCard;