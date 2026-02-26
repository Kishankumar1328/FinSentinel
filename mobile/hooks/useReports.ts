import { useState, useCallback } from 'react';
import { API_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';

export function useReports() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const generateReport = useCallback(async (params: { startDate?: string; endDate?: string; format?: string } = {}) => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/api/reports/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to generate report');
            setData(result);
            return result;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    return { data, isLoading, error, generateReport };
}
