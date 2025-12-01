import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    effectiveTheme: EffectiveTheme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>('auto');
    const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

    // Get system preference
    const getSystemTheme = (): EffectiveTheme => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Calculate effective theme
    const calculateEffectiveTheme = (themeValue: Theme): EffectiveTheme => {
        if (themeValue === 'auto') {
            return getSystemTheme();
        }
        return themeValue;
    };

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
            setThemeState(savedTheme);
            setEffectiveTheme(calculateEffectiveTheme(savedTheme));
        } else {
            // Default to auto
            setThemeState('auto');
            setEffectiveTheme(getSystemTheme());
        }
    }, []);

    // Listen for system theme changes when in auto mode
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === 'auto') {
                setEffectiveTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    // Apply theme changes to document
    useEffect(() => {
        if (effectiveTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [effectiveTheme, theme]);

    // Update effective theme when theme setting changes
    useEffect(() => {
        setEffectiveTheme(calculateEffectiveTheme(theme));
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        // Cycle through: light -> dark -> auto -> light
        setThemeState(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'auto';
            return 'light';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
