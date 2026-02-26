import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Platform
} from 'react-native';
import {
    BarChart3,
    TrendingDown,
    TrendingUp,
    Download,
    Calendar,
    ChevronRight,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    Sparkles,
    ArrowUp,
    ArrowDown
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReports } from '../../hooks/useReports';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#0ea5e9',
    secondary: '#818cf8',
    success: '#10b981',
    danger: '#ef4444',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
};

export default function ReportsScreen() {
    const { data, isLoading, generateReport } = useReports();
    const [period, setPeriod] = useState('Month');

    useEffect(() => {
        generateReport();
    }, [generateReport]);

    if (isLoading && !data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const summary = data?.summary || { totalIncome: 0, totalExpenses: 0, netIncome: 0 };
    const categories = data?.expensesByCategory || {};
    const sortedCategories = Object.entries(categories).sort((a: any, b: any) => b[1] - a[1]);
    const savingsRate = summary.totalIncome > 0 ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome) * 100 : 0;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={generateReport} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Analytics</Text>
                    <Text style={styles.subtitle}>Financial Insight</Text>
                </View>
                <TouchableOpacity style={styles.exportButton}>
                    <Download size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.periodSwitcher}>
                {['Week', 'Month', 'Year'].map(p => (
                    <TouchableOpacity
                        key={p}
                        style={[styles.periodTab, period === p && styles.periodTabActive]}
                        onPress={() => setPeriod(p)}
                    >
                        <Text style={[styles.periodTabText, period === p && styles.periodTabTextActive]}>{p}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Main Stats */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={[styles.statIconBox, { backgroundColor: `${COLORS.success}10` }]}>
                        <TrendingUp size={20} color={COLORS.success} />
                    </View>
                    <Text style={styles.statLabel}>Income</Text>
                    <Text style={styles.statValue}>${summary.totalIncome.toLocaleString()}</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={[styles.statIconBox, { backgroundColor: `${COLORS.danger}10` }]}>
                        <TrendingDown size={20} color={COLORS.danger} />
                    </View>
                    <Text style={styles.statLabel}>Expenses</Text>
                    <Text style={styles.statValue}>${summary.totalExpenses.toLocaleString()}</Text>
                </View>
            </View>

            {/* Net Income Card */}
            <View style={styles.netWorthCard}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.netWorthGradient}
                >
                    <View>
                        <Text style={styles.netWorthLabel}>Monthly Savings</Text>
                        <Text style={styles.netWorthValue}>${summary.netIncome.toLocaleString()}</Text>
                    </View>
                    <View style={styles.savingsBadge}>
                        <ArrowUp size={14} color={COLORS.success} />
                        <Text style={styles.savingsRate}>{Math.round(savingsRate)}%</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Spending Breakdown */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Spending Breakdown</Text>
                    <BarChart3 size={18} color={COLORS.textSecondary} />
                </View>
                <View style={styles.breakdownCard}>
                    {sortedCategories.map(([category, amount]: any, i) => {
                        const percentage = (amount / summary.totalExpenses) * 100;
                        return (
                            <View key={category} style={styles.breakdownItem}>
                                <View style={styles.breakdownHeader}>
                                    <Text style={styles.breakdownLabel}>{category}</Text>
                                    <Text style={styles.breakdownAmount}>${amount.toLocaleString()}</Text>
                                </View>
                                <View style={styles.progressBase}>
                                    <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: i === 0 ? COLORS.primary : COLORS.secondary }]} />
                                </View>
                            </View>
                        );
                    })}
                    {sortedCategories.length === 0 && (
                        <Text style={styles.emptyText}>No data for this period</Text>
                    )}
                </View>
            </View>

            {/* AI Intelligence */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Smart Recommendations</Text>
                <View style={styles.aiCard}>
                    <View style={styles.aiHeader}>
                        <Sparkles size={20} color={COLORS.primary} />
                        <Text style={styles.aiTitle}>AI Analysis</Text>
                    </View>
                    <Text style={styles.aiText}>
                        Your spending on {sortedCategories[0]?.[0] || 'Entertainment'} is 15% higher than last month.
                        Consider reducing non-essential expenses to reach your Saving Goal faster.
                    </Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -1 },
    subtitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    exportButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    periodSwitcher: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 14, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
    periodTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    periodTabActive: { backgroundColor: COLORS.primary },
    periodTabText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
    periodTabTextActive: { color: 'white' },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    statCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
    statIconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
    statValue: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 4 },
    netWorthCard: { borderRadius: 28, overflow: 'hidden', marginBottom: 32, elevation: 4 },
    netWorthGradient: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    netWorthLabel: { color: 'white', opacity: 0.8, fontSize: 13, fontWeight: '700' },
    netWorthValue: { color: 'white', fontSize: 28, fontWeight: '800', marginTop: 4 },
    savingsBadge: { backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
    savingsRate: { fontSize: 14, fontWeight: '800', color: COLORS.success },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    breakdownCard: { backgroundColor: 'white', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
    breakdownItem: { marginBottom: 16 },
    breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    breakdownLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    breakdownAmount: { fontSize: 14, fontWeight: '800', color: COLORS.text },
    progressBase: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    aiCard: { backgroundColor: 'white', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    aiTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    aiText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, lineHeight: 22 },
    emptyText: { color: COLORS.textSecondary, fontStyle: 'italic', textAlign: 'center' }
});
