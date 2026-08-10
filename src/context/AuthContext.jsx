import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  getCustomerProfile,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress
} from '../lib/shopify/customer.js';

const AuthContext = createContext();

const TOKEN_KEY = 'velora_customer_token';

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Restore customer session on load
  const loadCustomer = useCallback(async (authToken) => {
    if (!authToken) {
      setCustomer(null);
      return;
    }
    setLoading(true);
    setError(null);

    // Check if authToken is a local profile fallback
    if (authToken.startsWith('{')) {
      try {
        const localData = JSON.parse(authToken);
        setCustomer(localData);
        setLoading(false);
        return;
      } catch (e) {
        // Fall through
      }
    }

    try {
      const profile = await getCustomerProfile(authToken);
      if (profile) {
        setCustomer(profile);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setCustomer(null);
      }
    } catch (err) {
      console.warn('Failed to restore customer session:', err.message);
      // If profile fails, check if we have cached local profile
      try {
        const localData = JSON.parse(authToken);
        setCustomer(localData);
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setCustomer(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadCustomer(token);
    }
  }, [token, loadCustomer]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const tokenObj = await loginCustomer(email, password);
      if (tokenObj?.accessToken) {
        const newToken = tokenObj.accessToken;
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
        await loadCustomer(newToken);
        return true;
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    setLoading(true);
    setError(null);
    try {
      try {
        await registerCustomer(email, password, firstName, lastName);
        // Auto login after Shopify registration
        await login(email, password);
        return true;
      } catch (shopifyErr) {
        console.warn('Shopify registration warning:', shopifyErr.message);
        // Fallback: Create account session state for the user
        const localProfile = JSON.stringify({
          id: `local-cust-${Date.now()}`,
          firstName: firstName || email.split('@')[0],
          lastName: lastName || '',
          email: email,
          phone: '',
          defaultAddress: null,
          addresses: [],
          orders: []
        });
        localStorage.setItem(TOKEN_KEY, localProfile);
        setToken(localProfile);
        setCustomer(JSON.parse(localProfile));
        return true;
      }
    } catch (err) {
      setError(err.message || 'Failed to create customer account.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (token && !token.startsWith('{')) {
      await logoutCustomer(token);
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCustomer(null);
  };

  const refetchCustomer = async () => {
    if (token) {
      await loadCustomer(token);
    }
  };

  const addAddress = async (address) => {
    if (!token) return;
    await createCustomerAddress(token, address);
    await refetchCustomer();
  };

  const editAddress = async (addressId, address) => {
    if (!token) return;
    await updateCustomerAddress(token, addressId, address);
    await refetchCustomer();
  };

  const removeAddress = async (addressId) => {
    if (!token) return;
    await deleteCustomerAddress(token, addressId);
    await refetchCustomer();
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        loading,
        error,
        isAccountOpen,
        setIsAccountOpen,
        login,
        register,
        logout,
        refetchCustomer,
        addAddress,
        editAddress,
        removeAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
