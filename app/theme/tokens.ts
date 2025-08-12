export const colors = {
  primary: '#4A90E2',
  primaryDark: '#1E90FF',
  secondary: '#FF6B35',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  surface: 'rgba(255,255,255,0.9)',
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  white: '#FFFFFF',
};

export const gradients = {
  sky: ['#87CEEB', '#98D8E8', '#B0E0E6'] as const,
  gold: ['#FFD700', '#FFA500', '#FF8C00'] as const,
  violet: ['#9B59B6', '#8E44AD', '#BF55EC'] as const,
  green: ['#58D68D', '#27AE60', '#7DCEA0'] as const,
  glass: ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)'] as const,
  glassBlue: ['rgba(74,144,226,0.8)', 'rgba(30,144,255,0.4)'] as const,
  glassGreen: ['rgba(88,214,141,0.8)', 'rgba(39,174,96,0.4)'] as const,
  glassRed: ['rgba(255,71,87,0.9)', 'rgba(255,55,71,0.5)'] as const,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
};

export const typography = {
  title: 28,
  subtitle: 16,
  body: 14,
  button: 18,
};

export const glassmorphism = {
  backdrop: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backdropFilter: 'blur(10px)',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(20px)',
  },
};

export const bubble = {
  size: {
    small: 60,
    medium: 80,
    large: 100,
  },
  colors: {
    blue: ['#3498DB', '#2980B9'],
    green: ['#2ECC71', '#27AE60'],
    red: ['#E74C3C', '#C0392B'],
    yellow: ['#F1C40F', '#F39C12'],
    purple: ['#9B59B6', '#8E44AD'],
    orange: ['#E67E22', '#D35400'],
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  }
};


