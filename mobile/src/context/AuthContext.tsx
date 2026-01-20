import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface AuthContextData {
  userToken: string | null;
  username: string | null;
  isLoading: boolean;
  isManager: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const managerStatus = await SecureStore.getItemAsync('isManager');
      const name = await SecureStore.getItemAsync('username');
      
      if (token) {
        setUserToken(token);
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
      }
      if (managerStatus) {
        setIsManager(managerStatus === 'true');
      }
      if (name) {
        setUsername(name);
      }
    } catch (e) {
      console.log('Failed to load storage data', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (un: string, password: string) => {
    try {
      const response = await api.post('/users/login/', { username: un, password });
      const { token, is_manager, user_id } = response.data;

      setUserToken(token);
      setIsManager(is_manager);
      setUsername(un);

      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('isManager', String(is_manager));
      await SecureStore.setItemAsync('userId', String(user_id));
      await SecureStore.setItemAsync('username', un);
      
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  };

  const signOut = async () => {
    setUserToken(null);
    setIsManager(false);
    setUsername(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('isManager');
    await SecureStore.deleteItemAsync('userId');
    await SecureStore.deleteItemAsync('username');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ userToken, username, isLoading, isManager, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
