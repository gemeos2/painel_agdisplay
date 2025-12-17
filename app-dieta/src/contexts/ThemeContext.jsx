import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app_theme') || 'original';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old theme classes
        root.classList.remove('theme-orange', 'theme-pink', 'theme-green');

        // Add new theme class if not original
        if (theme !== 'original') {
            root.classList.add(`theme-${theme}`);
        }

        // Save to storage
        localStorage.setItem('app_theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
