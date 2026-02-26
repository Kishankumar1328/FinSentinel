import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    // 1. Web Environment
    if (Platform.OS === 'web') {
        return __DEV__ ? 'http://localhost:3000' : 'https://finsentinel.vercel.app';
    }

    // 2. Mobile Development
    // Using live Vercel backend to bypass local Windows Firewall issues
    if (__DEV__) {
        return `https://finsentinel.vercel.app`;
    }

    // 3. Production
    return 'https://finsentinel.vercel.app';
};

export const API_URL = getBaseUrl();
