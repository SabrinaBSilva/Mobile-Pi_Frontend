import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const storedUser = await AsyncStorage.getItem('@user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }

  function decodeToken(token) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (e) {
      return null;
    }
  }

  async function login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    const { token, tipo_usuario } = response.data;

    if (tipo_usuario !== 'aluno') {
      throw new Error('Acesso permitido apenas para alunos.');
    }

    const payload = decodeToken(token);
    console.log('PAYLOAD JWT:', JSON.stringify(payload));

    await AsyncStorage.setItem('@token', token);

    const userData = {
      email,
      tipo_usuario,
      matricula: payload?.matricula,
      idusuario: payload?.idusuario,
    };

    await AsyncStorage.setItem('@user', JSON.stringify(userData));
    setUser(userData);
  }

  async function logout() {
    await AsyncStorage.removeItem('@token');
    await AsyncStorage.removeItem('@user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}