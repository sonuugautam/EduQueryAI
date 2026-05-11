import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('eduquery_token'));
  const [user, setUser] = useState({
    name: localStorage.getItem('eduquery_user_name') || 'Guest',
    email: localStorage.getItem('eduquery_user_email') || '',
    role: localStorage.getItem('eduquery_user_role') || 'Student',
    avatar: null,
    tier: 'Academic Pro',
    since: '2024'
  });

  const [aiSettings, setAiSettings] = useState({
    deepRag: JSON.parse(localStorage.getItem('eduquery_ai_deep_rag')) ?? true,
    autoSummarize: JSON.parse(localStorage.getItem('eduquery_ai_auto_summarize')) ?? false
  });

  const updateAiSettings = (newSettings) => {
    setAiSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.deepRag !== undefined) localStorage.setItem('eduquery_ai_deep_rag', JSON.stringify(newSettings.deepRag));
      if (newSettings.autoSummarize !== undefined) localStorage.setItem('eduquery_ai_auto_summarize', JSON.stringify(newSettings.autoSummarize));
      return updated;
    });
  };

  const login = async (credentials) => {
    try {
      const response = await fetch('http://localhost:8001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) throw new Error('Invalid credentials');

      const data = await response.json();
      localStorage.setItem('eduquery_token', data.access_token);
      localStorage.setItem('eduquery_user_name', data.user.name);
      localStorage.setItem('eduquery_user_email', data.user.email);
      localStorage.setItem('eduquery_user_role', data.user.role);
      
      setUser(prev => ({ 
        ...prev, 
        name: data.user.name, 
        email: data.user.email, 
        role: data.user.role 
      }));
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('eduquery_token');
    localStorage.removeItem('eduquery_user_name');
    localStorage.removeItem('eduquery_user_email');
    localStorage.removeItem('eduquery_user_role');
    setIsAuthenticated(false);
  };

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser, 
      isAuthenticated, 
      login, 
      logout,
      aiSettings,
      updateAiSettings
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
