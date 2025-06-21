import { useLocalStorage } from 'react-use';

export const useAuthToken = () => {
    const [token, setToken, removeToken] = useLocalStorage<string | undefined>('auth-token', undefined);
    return { token, setToken, removeToken };
  };