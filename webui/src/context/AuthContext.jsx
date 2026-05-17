import { createContext, useContext, useState } from 'react';

const TOKEN_KEY = 'poker_token';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));

  const logIn = (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
  };

  const logOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ token, logIn, logOut, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
