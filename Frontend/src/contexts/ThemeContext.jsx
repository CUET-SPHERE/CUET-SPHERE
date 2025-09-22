import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Centralized color palette based on MyGroupPage design
const colorPalette = {
  // Primary colors
  primary: {
    blue: '#2563eb', // blue-600 - main primary color from MyGroupPage
    blueHover: '#1d4ed8', // blue-700
    blueLight: '#dbeafe', // blue-100
    blueDark: '#1e3a8a', // blue-800
  },

  // Background colors
  background: {
    light: '#f8fafc', // slate-50 - softer than gray-50
    dark: '#0f172a', // slate-900 - deeper, richer dark
    cardLight: '#ffffff', // white
    cardDark: '#1e293b', // slate-800 - warmer dark cards
    cardDarkSecondary: '#334155', // slate-700 - lighter secondary cards for better contrast
  },

  // Text colors
  text: {
    primaryLight: '#0f172a', // slate-900 - better contrast
    primaryDark: '#f8fafc', // slate-50 - softer white
    secondaryLight: '#64748b', // slate-500 - better readability
    secondaryDark: '#cbd5e1', // slate-300 - improved contrast
    mutedLight: '#94a3b8', // slate-400 - subtle text
    mutedDark: '#94a3b8', // slate-400 - consistent muted
  },

  // Status colors (from notice types)
  status: {
    urgent: {
      light: '#fef2f2', // red-50
      lightText: '#991b1b', // red-800
      dark: 'rgba(185, 28, 28, 0.2)', // red-900/20
      darkText: '#fca5a5', // red-400
    },
    academic: {
      light: '#eff6ff', // blue-50
      lightText: '#1e40af', // blue-800
      dark: 'rgba(30, 58, 138, 0.2)', // blue-900/20
      darkText: '#60a5fa', // blue-400
    },
    event: {
      light: '#f0fdf4', // green-50
      lightText: '#166534', // green-800
      dark: 'rgba(20, 83, 45, 0.2)', // green-900/20
      darkText: '#4ade80', // green-400
    },
    general: {
      light: '#f9fafb', // gray-50
      lightText: '#374151', // gray-700
      dark: '#374151', // gray-700
      darkText: '#d1d5db', // gray-300
    },
    success: {
      light: '#d1fae5', // green-100
      lightText: '#065f46', // green-800
      dark: 'rgba(6, 95, 70, 0.2)', // green-900/20
      darkText: '#34d399', // green-400
    },
    error: {
      light: '#fee2e2', // red-100
      lightText: '#991b1b', // red-800
      dark: 'rgba(153, 27, 27, 0.2)', // red-900/20
      darkText: '#fca5a5', // red-400
    }
  },

  // Interactive elements
  interactive: {
    hover: '#f1f5f9', // slate-100 - softer hover
    hoverDark: '#475569', // slate-600 - better dark hover
    border: '#e2e8f0', // slate-200 - softer borders
    borderDark: '#64748b', // slate-500 - improved dark borders
    focus: '#2563eb', // blue-600
    // New gradient and shadow colors for modern UI
    gradientStart: '#3b82f6', // blue-500
    gradientEnd: '#8b5cf6', // violet-500
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.25)',
  },

  // Connection status
  connection: {
    connected: {
      light: '#d1fae5', // green-100
      lightText: '#065f46', // green-800
      dark: 'rgba(6, 95, 70, 0.2)', // green-900/20
      darkText: '#34d399', // green-400
      indicator: '#10b981', // green-500
    },
    disconnected: {
      light: '#fee2e2', // red-100
      lightText: '#991b1b', // red-800
      dark: 'rgba(153, 27, 27, 0.2)', // red-900/20
      darkText: '#fca5a5', // red-400
      indicator: '#ef4444', // red-500
    }
  }
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Create theme-aware colors object
  const colors = {
    // Primary colors
    primary: {
      base: colorPalette.primary.blue,
      hover: colorPalette.primary.blueHover,
      light: colorPalette.primary.blueLight,
      dark: colorPalette.primary.blueDark,
      text: 'text-blue-600', // Tailwind class for text
      bg: 'bg-blue-600', // Tailwind class for background
      blue: colorPalette.primary.blue,
      blueHover: colorPalette.primary.blueHover,
      blueLight: colorPalette.primary.blueLight,
      blueDark: colorPalette.primary.blueDark,
    },

    // Success colors
    success: {
      bg: 'bg-green-600',
      text: 'text-green-600',
      light: 'bg-green-100',
      dark: 'bg-green-800',
    },

    // Warning colors  
    warning: {
      bg: 'bg-yellow-600',
      text: 'text-yellow-600',
      light: 'bg-yellow-100',
      dark: 'bg-yellow-800',
    },

    // Danger colors
    danger: {
      bg: 'bg-red-600',
      text: 'text-red-600',
      light: 'bg-red-100',
      dark: 'bg-red-800',
    },

    // Interactive elements
    interactive: {
      hover: '#f3f4f6', // gray-100
      hoverDark: '#4b5563', // gray-600
      border: '#e5e7eb', // gray-200
      borderDark: '#6b7280', // gray-500
      focus: '#2563eb', // blue-600
    },

    // Background colors
    background: {
      main: theme === 'light' ? colorPalette.background.light : colorPalette.background.dark,
      surface: theme === 'light' ? colorPalette.background.cardLight : colorPalette.background.cardDark,
      secondary: theme === 'light' ? colorPalette.background.cardLight : colorPalette.background.cardDarkSecondary,
      subtle: theme === 'light' ? 'bg-gray-100' : 'bg-gray-700',
      muted: theme === 'light' ? 'bg-gray-200' : 'bg-gray-600',
      urgent: theme === 'light' ? colorPalette.status.urgent.light : colorPalette.status.urgent.dark,
      primary: theme === 'light' ? colorPalette.primary.blueLight : 'bg-blue-500/10',
      // Backward compatibility
      light: colorPalette.background.light,
      dark: colorPalette.background.dark,
      cardLight: colorPalette.background.cardLight,
      cardDark: colorPalette.background.cardDark,
      cardDarkSecondary: colorPalette.background.cardDarkSecondary,
    },

    // Input and form colors
    inputBackground: theme === 'light' ? 'bg-white' : 'bg-slate-700',
    cardSecondary: theme === 'light' ? 'bg-slate-50' : 'bg-slate-600',
    commentsBackground: theme === 'light' ? 'bg-slate-50' : 'bg-slate-800',

    // Enhanced surface colors for better visual hierarchy
    surface: theme === 'light' ? 'bg-white' : 'bg-slate-800',
    surfaceSecondary: theme === 'light' ? 'bg-slate-50' : 'bg-slate-700',
    surfaceTertiary: theme === 'light' ? 'bg-slate-100' : 'bg-slate-600',

    // Common color utilities with improved contrast
    border: theme === 'light' ? 'border-slate-200' : 'border-slate-600',
    borderLight: theme === 'light' ? 'border-slate-100' : 'border-slate-700',
    textPrimary: theme === 'light' ? 'text-slate-900' : 'text-slate-50',
    textSecondary: theme === 'light' ? 'text-slate-600' : 'text-slate-300',
    textMuted: theme === 'light' ? 'text-slate-500' : 'text-slate-400',
    placeholder: theme === 'light' ? 'placeholder-slate-400' : 'placeholder-slate-500',
    focusRing: 'focus:ring-blue-500',
    primary: theme === 'light' ? 'text-blue-600' : 'text-blue-400',
    primaryBg: theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/20',
    primaryHover: theme === 'light' ? 'text-blue-700' : 'text-blue-300',
    hover: theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-slate-700',
    hoverSecondary: theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-slate-600',
    hoverBackground: theme === 'light' ? 'bg-slate-100' : 'bg-slate-700',
    cardBackground: theme === 'light' ? 'bg-white' : 'bg-slate-800',
    modalBackground: theme === 'light' ? 'bg-white' : 'bg-slate-800',
    voteActive: theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400',
    bookmarkActive: theme === 'light' ? 'text-blue-600 bg-blue-100' : 'text-blue-400 bg-blue-900/30',
    tagSelected: theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white',
    tagDefault: theme === 'light' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-700 text-slate-300 hover:bg-slate-600',
    tagHighlighted: theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900/30 text-blue-200',
    skeletonBase: theme === 'light' ? 'bg-slate-300' : 'bg-slate-600',

    // Add new gradient and glass effect utilities
    gradient: theme === 'light'
      ? 'bg-gradient-to-br from-white to-slate-50'
      : 'bg-gradient-to-br from-slate-800 to-slate-900',
    gradientHover: theme === 'light'
      ? 'hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100'
      : 'hover:bg-gradient-to-br hover:from-slate-700 hover:to-slate-800',
    glass: theme === 'light'
      ? 'bg-white/80 backdrop-blur-sm'
      : 'bg-slate-800/80 backdrop-blur-sm',
    shadow: theme === 'light'
      ? 'shadow-lg shadow-slate-200/50'
      : 'shadow-lg shadow-slate-900/50',
    shadowHover: theme === 'light'
      ? 'hover:shadow-xl hover:shadow-slate-200/60'
      : 'hover:shadow-xl hover:shadow-slate-900/60',

    // Text colors
    text: {
      primary: theme === 'light' ? colorPalette.text.primaryLight : colorPalette.text.primaryDark,
      secondary: theme === 'light' ? colorPalette.text.secondaryLight : colorPalette.text.secondaryDark,
      disabled: theme === 'light' ? 'text-gray-400' : 'text-gray-500',
      // Backward compatibility
      primaryLight: colorPalette.text.primaryLight,
      primaryDark: colorPalette.text.primaryDark,
      secondaryLight: colorPalette.text.secondaryLight,
      secondaryDark: colorPalette.text.secondaryDark,
    },

    // Border colors
    border: {
      default: theme === 'light' ? colorPalette.interactive.border : colorPalette.interactive.borderDark,
      urgent: theme === 'light' ? 'border-red-300' : 'border-red-700',
    },

    // Button colors - Standardized button system
    button: {
      // Primary button (main actions)
      primary: {
        base: 'bg-blue-600 hover:bg-blue-700 text-white',
        classes: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md',
      },
      // Secondary button (less important actions)
      secondary: {
        base: theme === 'light'
          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
          : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600',
        classes: theme === 'light'
          ? 'px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-medium transition-all duration-200'
          : 'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 rounded-lg font-medium transition-all duration-200',
      },
      // Success button (save, confirm actions)
      success: {
        base: 'bg-green-600 hover:bg-green-700 text-white',
        classes: 'px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md',
      },
      // Danger button (delete, destructive actions)
      danger: {
        base: 'bg-red-600 hover:bg-red-700 text-white',
        classes: 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md',
      },
      // Warning button (caution actions)
      warning: {
        base: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        classes: 'px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors shadow-sm',
      },
      // Icon button (small, icon-only buttons)
      icon: {
        base: theme === 'light'
          ? 'bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200'
          : 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700',
        classes: theme === 'light'
          ? 'p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg transition-colors'
          : 'p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700 rounded-lg transition-colors',
      },
    },

    // Status colors
    status: {
      // Backward compatibility - full status objects
      urgent: {
        light: colorPalette.status.urgent.light,
        lightText: colorPalette.status.urgent.lightText,
        dark: colorPalette.status.urgent.dark,
        darkText: colorPalette.status.urgent.darkText,
      },
      academic: {
        light: colorPalette.status.academic.light,
        lightText: colorPalette.status.academic.lightText,
        dark: colorPalette.status.academic.dark,
        darkText: colorPalette.status.academic.darkText,
      },
      event: {
        light: colorPalette.status.event.light,
        lightText: colorPalette.status.event.lightText,
        dark: colorPalette.status.event.dark,
        darkText: colorPalette.status.event.darkText,
      },
      general: {
        light: colorPalette.status.general.light,
        lightText: colorPalette.status.general.lightText,
        dark: colorPalette.status.general.dark,
        darkText: colorPalette.status.general.darkText,
      },
      success: {
        light: colorPalette.status.success.light,
        lightText: colorPalette.status.success.lightText,
        dark: colorPalette.status.success.dark,
        darkText: colorPalette.status.success.darkText,
      },
      error: {
        light: colorPalette.status.error.light,
        lightText: colorPalette.status.error.lightText,
        dark: colorPalette.status.error.dark,
        darkText: colorPalette.status.error.darkText,
      },
    },

    // Interactive elements
    interactive: {
      hover: theme === 'light' ? colorPalette.interactive.hover : colorPalette.interactive.hoverDark,
      border: theme === 'light' ? colorPalette.interactive.border : colorPalette.interactive.borderDark,
      focus: colorPalette.interactive.focus,
      // Backward compatibility
      hoverDark: colorPalette.interactive.hoverDark,
      borderDark: colorPalette.interactive.borderDark,
    },

    // Connection status
    connection: {
      connected: theme === 'light' ? colorPalette.connection.connected.lightText : colorPalette.connection.connected.darkText,
      disconnected: theme === 'light' ? colorPalette.connection.disconnected.lightText : colorPalette.connection.disconnected.darkText,
    }
  };

  // Create buttonClasses object for easy access
  const buttonClasses = {
    primary: colors.button.primary.classes,
    secondary: colors.button.secondary.classes,
    success: colors.button.success.classes,
    danger: colors.button.danger.classes,
    warning: colors.button.warning.classes,
    icon: colors.button.icon.classes,
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    colors,
    buttonClasses
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
