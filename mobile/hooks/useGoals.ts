import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

export function useGoals() {
    const [goals, setGoals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchGoals = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/goals`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            setGoals(result.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const addGoal = async (goalData: any) => {
        const response = await fetch(`${API_URL}/api/goals`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(goalData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        fetchGoals();
        return result.data;
    };

    return { goals, isLoading, error, refresh: fetchGoals, addGoal };
}
