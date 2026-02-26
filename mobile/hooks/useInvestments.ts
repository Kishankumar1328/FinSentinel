import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

export function useInvestments() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchInvestments = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/investments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            setData(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchInvestments();
    }, [fetchInvestments]);

    const addInvestment = async (investmentData: any) => {
        const response = await fetch(`${API_URL}/api/investments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(investmentData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        fetchInvestments();
        return result.data;
    };

    return { data, isLoading, error, refresh: fetchInvestments, addInvestment };
}
