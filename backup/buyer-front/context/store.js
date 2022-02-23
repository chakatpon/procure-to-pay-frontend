import { createContext, useState, useRef, useEffect, useCallback } from 'react';
import { useCookies } from 'react-cookie';

export const StoreContext = createContext({});

export const StoreContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState('');
  const [test, setTest] = useState('');

  const store = {
    loading,
    setLoading,
    user,
    setUser,
    test,
    setTest,
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};
