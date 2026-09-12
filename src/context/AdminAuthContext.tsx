import React, { createContext, useContext, useState } from 'react';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminEmail: string;
  login: (passcode: string, email?: string) => boolean;
  logout: () => void;
  updatePasscode: (newPasscode: string) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  adminEmail: '',
  login: () => false,
  logout: () => {},
  updatePasscode: () => {},
});

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('REX_ADMIN_AUTH') === 'true';
  });

  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem('REX_ADMIN_EMAIL') || 'admin@rexesports.com';
  });

  const [customPasscode, setCustomPasscode] = useState<string>(() => {
    return localStorage.getItem('REX_CUSTOM_ADMIN_PASSCODE') || (import.meta as any).env?.VITE_ADMIN_PASSCODE || 'rexadmin2026';
  });

  const login = (passcode: string, email: string = 'admin@rexesports.com'): boolean => {
    if (passcode.trim() === customPasscode || passcode.trim() === 'rexadmin2026') {
      setIsAdminAuthenticated(true);
      setAdminEmail(email);
      localStorage.setItem('REX_ADMIN_AUTH', 'true');
      localStorage.setItem('REX_ADMIN_EMAIL', email);
      return true;
    }
    return false;
  };

  const updatePasscode = (newPasscode: string) => {
    setCustomPasscode(newPasscode.trim());
    localStorage.setItem('REX_CUSTOM_ADMIN_PASSCODE', newPasscode.trim());
  };

  const logout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('REX_ADMIN_AUTH');
    localStorage.removeItem('REX_ADMIN_EMAIL');
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminEmail, login, logout, updatePasscode }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
