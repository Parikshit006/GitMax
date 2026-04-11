import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('gitmax_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('gitmax_user'));
    } catch { return null; }
  });

  const login = (newToken, userInfo) => {
    sessionStorage.setItem('gitmax_token', newToken);
    sessionStorage.setItem('gitmax_user', JSON.stringify(userInfo));
    setToken(newToken);
    setUser(userInfo);
  };

  const logout = () => {
    sessionStorage.removeItem('gitmax_token');
    sessionStorage.removeItem('gitmax_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
