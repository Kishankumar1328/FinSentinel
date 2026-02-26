import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

export function useIncome() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchIncome = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/income`, {
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
        fetchIncome();
    }, [fetchIncome]);

    const addIncome = async (incomeData: any) => {
        const response = await fetch(`${API_URL}/api/income`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(incomeData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        fetchIncome();
        return result.data;
    };

    return { data, isLoading, error, refresh: fetchIncome, addIncome };
}
