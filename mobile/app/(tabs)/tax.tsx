import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
    Dimensions
} from 'react-native';
import {
    ShieldCheck,
    Receipt,
    Sparkles,
    ArrowRight,
    Calculator,
    Calendar,
    AlertCircle,
    FileText,
    TrendingDown,
    Info
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTax } from '../../hooks/useTax';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#059669',
    secondary: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
};

export default function TaxScreen() {
    const [activeYear, setActiveYear] = useState(new Date().getFullYear());
    const { data, isLoading, error, refresh } = useTax(activeYear);

    if (isLoading && !data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const summary = data?.summary || { totalDeductible: 0, estimatedTaxSaving: 0 };
    const events = data?.events || [];
    const tips = data?.tips || [];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Tax Center</Text>
                <View style={styles.yearPicker}>
                    <TouchableOpacity onPress={() => setActiveYear(activeYear - 1)}>
                        <ArrowRight size={18} color={COLORS.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                    <Text style={styles.yearText}>{activeYear}</Text>
                    <TouchableOpacity onPress={() => setActiveYear(activeYear + 1)}>
                        <ArrowRight size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.mainCard}>
                <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    style={styles.mainGradient}
                >
                    <View style={styles.mainInfo}>
                        <Text style={styles.mainLabel}>Total Deductible Found</Text>
                        <Text style={styles.mainValue}>${summary.totalDeductible.toLocaleString()}</Text>
                        <View style={styles.savingRow}>
                            <Sparkles size={16} color="#fff" />
                            <Text style={styles.savingText}>Est. Saving: ${summary.estimatedTaxSaving.toLocaleString()}</Text>
                        </View>
                    </View>
                    <View style={styles.headerIcon}>
                        <ShieldCheck size={60} color="rgba(255,255,255,0.2)" />
                    </View>
                </LinearGradient>
            </View>

            {/* AI Tips Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Sparkles size={18} color={COLORS.warning} />
                    <Text style={styles.sectionTitle}>AI Optimization Tips</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsContainer}>
                    {tips.slice(0, 3).map((tip: string, i: number) => (
                        <View key={i} style={styles.tipCard}>
                            <Info size={16} color={COLORS.primary} />
                            <Text style={styles.tipText} numberOfLines={3}>{tip}</Text>
                            <TouchableOpacity>
                                <Text style={styles.tipLink}>Learn More</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Deductions Record */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tracked Deductions</Text>
                {events.map((event: any) => (
                    <View key={event.id} style={styles.eventCard}>
                        <View style={styles.eventIcon}>
                            <Receipt size={22} color={COLORS.primary} />
                        </View>
                        <View style={styles.eventInfo}>
                            <Text style={styles.eventTitle}>{event.description || event.category}</Text>
                            <Text style={styles.eventDate}>{new Date(event.created_at).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.eventAmount}>${event.amount.toLocaleString()}</Text>
                    </View>
                ))}
                {events.length === 0 && (
                    <View style={styles.emptyCard}>
                        <FileText size={40} color={COLORS.border} />
                        <Text style={styles.emptyText}>No tax events recorded for this year.</Text>
                        <TouchableOpacity style={styles.addButton}>
                            <Text style={styles.addButtonText}>Record Deduction</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.calculateButton}>
                <Calculator size={20} color="white" />
                <Text style={styles.calculateButtonText}>Full Tax Estimation Report</Text>
            </TouchableOpacity>

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
    yearPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
    yearText: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    mainCard: { borderRadius: 28, overflow: 'hidden', marginBottom: 32, elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15 },
    mainGradient: { padding: 28, flexDirection: 'row', alignItems: 'center' },
    mainInfo: { flex: 1 },
    mainLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    mainValue: { color: 'white', fontSize: 38, fontWeight: '800', marginVertical: 6 },
    savingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    savingText: { color: 'white', fontSize: 14, fontWeight: '700' },
    headerIcon: { opacity: 0.8 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    tipsContainer: { gap: 12, paddingRight: 20 },
    tipCard: { backgroundColor: 'white', width: width * 0.7, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
    tipText: { fontSize: 14, color: COLORS.text, lineHeight: 20, fontWeight: '600' },
    tipLink: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
    eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    eventIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: `${COLORS.primary}10`, justifyContent: 'center', alignItems: 'center' },
    eventInfo: { flex: 1, marginLeft: 16 },
    eventTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textTransform: 'capitalize' },
    eventDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    eventAmount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
    emptyCard: { backgroundColor: 'white', padding: 32, borderRadius: 24, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.border },
    emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
    addButton: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary },
    addButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '800' },
    calculateButton: { backgroundColor: COLORS.text, height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
    calculateButtonText: { color: 'white', fontSize: 16, fontWeight: '800' },
});
