import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

export function useBudgets() {
    const [budgets, setBudgets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchBudgets = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/budgets`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch budgets');
            }

            setBudgets(result.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchBudgets();
    }, [fetchBudgets]);

    const addBudget = async (budgetData: any) => {
        const response = await fetch(`${API_URL}/api/budgets`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(budgetData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        fetchBudgets();
        return result.data;
    };

    return { budgets, isLoading, error, refresh: fetchBudgets, addBudget };
}
