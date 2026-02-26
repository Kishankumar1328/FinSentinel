import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

export function useTax(year = new Date().getFullYear()) {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchTax = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/tax?year=${year}`, {
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
    }, [token, year]);

    useEffect(() => {
        fetchTax();
    }, [fetchTax]);

    const addTaxEvent = async (eventData: any) => {
        const response = await fetch(`${API_URL}/api/tax`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        fetchTax();
        return result.data;
    };

    return { data, isLoading, error, refresh: fetchTax, addTaxEvent };
}
