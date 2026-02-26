import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
    TextInput,
    Platform,
    Alert,
} from 'react-native';
import {
    Target,
    Plus,
    Award,
    Calendar,
    TrendingUp,
    ChevronRight,
    X,
    DollarSign,
} from 'lucide-react-native';
import { useGoals } from '../../hooks/useGoals';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../constants/Config';

const COLORS = {
    primary: '#7c3aed',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
};

export default function GoalsScreen() {
    const { goals, isLoading, error, refresh, addGoal } = useGoals();
    const { token } = useAuth();
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isContributeModalVisible, setIsContributeModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<any>(null);
    const [contributeAmount, setContributeAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: '',
        target_amount: '',
        category: 'Saving',
    });

    const handleAddGoal = async () => {
        if (!newGoal.title || !newGoal.target_amount) {
            Alert.alert('Missing Fields', 'Please fill in all fields');
            return;
        }
        setIsSubmitting(true);
        try {
            await addGoal({
                title: newGoal.title,
                target_amount: parseFloat(newGoal.target_amount),
                current_amount: 0,
                deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
                category: newGoal.category,
            });
            setIsAddModalVisible(false);
            setNewGoal({ title: '', target_amount: '', category: 'Saving' });
            Alert.alert('Goal Created!', 'Time to start saving 🎯');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create goal.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openContribute = (goal: any) => {
        setSelectedGoal(goal);
        setContributeAmount('');
        setIsContributeModalVisible(true);
    };

    const handleContribute = async () => {
        const amount = parseFloat(contributeAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
            return;
        }
        if (!selectedGoal) return;
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/goals/${selectedGoal.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_amount: (selectedGoal.current_amount || 0) + amount,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to update goal.');
            setIsContributeModalVisible(false);
            setSelectedGoal(null);
            refresh();
            Alert.alert('Added!', `$${amount.toLocaleString()} added to "${selectedGoal.title}"`);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not add funds. Check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderGoalItem = (goal: any) => {
        const percentage = Math.min(100, ((goal.current_amount ?? 0) / (goal.target_amount ?? 1)) * 100);
        const isCompleted = percentage >= 100;

        return (
            <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: isCompleted ? `${COLORS.success}20` : `${COLORS.primary}10` }]}>
                        <Text style={[styles.categoryText, { color: isCompleted ? COLORS.success : COLORS.primary }]}>{goal.category}</Text>
                    </View>
                    {isCompleted && (
                        <View style={styles.completedBadge}>
                            <Award size={14} color={COLORS.success} />
                            <Text style={styles.completedText}>Completed!</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.goalTitle}>{goal.title}</Text>

                <View style={styles.amountRow}>
                    <View>
                        <Text style={styles.amountLabel}>Saved</Text>
                        <Text style={styles.amountValue}>${(goal.current_amount ?? 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.amountDivider} />
                    <View>
                        <Text style={styles.amountLabel}>Target</Text>
                        <Text style={styles.targetValue}>${(goal.target_amount ?? 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.amountDivider} />
                    <View>
                        <Text style={styles.amountLabel}>Left</Text>
                        <Text style={[styles.remainingValue, { color: isCompleted ? COLORS.success : COLORS.text }]}>
                            ${Math.max(0, (goal.target_amount ?? 0) - (goal.current_amount ?? 0)).toLocaleString()}
                        </Text>
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: isCompleted ? COLORS.success : COLORS.primary }]} />
                    </View>
                    <Text style={styles.percentageLabel}>{Math.round(percentage)}% toward goal</Text>
                </View>

                <View style={styles.goalFooter}>
                    <View style={styles.dateRow}>
                        <Calendar size={14} color={COLORS.textSecondary} />
                        <Text style={styles.dateText}>{new Date(goal.deadline).toLocaleDateString()}</Text>
                    </View>
                    {!isCompleted && (
                        <TouchableOpacity style={styles.contributeButton} onPress={() => openContribute(goal)}>
                            <DollarSign size={14} color="white" />
                            <Text style={styles.contributeText}>Add Funds</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Goals</Text>
                    <Text style={styles.subtitle}>Track your dreams</Text>
                </View>
                <TouchableOpacity style={styles.plusButton} onPress={() => setIsAddModalVisible(true)}>
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
            >
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <TrendingUp size={20} color={COLORS.primary} />
                        <Text style={styles.statVal}>{goals.length}</Text>
                        <Text style={styles.statLab}>Active</Text>
                    </View>
                    <View style={[styles.statBox, { borderColor: `${COLORS.success}40` }]}>
                        <Award size={20} color={COLORS.success} />
                        <Text style={styles.statVal}>{goals.filter(g => (g.current_amount ?? 0) >= (g.target_amount ?? 1)).length}</Text>
                        <Text style={styles.statLab}>Achieved</Text>
                    </View>
                    <View style={[styles.statBox, { borderColor: `${COLORS.warning}40` }]}>
                        <Target size={20} color={COLORS.warning} />
                        <Text style={styles.statVal}>${goals.reduce((s: number, g: any) => s + (g.target_amount ?? 0), 0).toLocaleString()}</Text>
                        <Text style={styles.statLab}>Target</Text>
                    </View>
                </View>

                {isLoading && goals.length === 0 ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
                ) : goals.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Target size={60} color={COLORS.border} />
                        <Text style={styles.emptyTitle}>No Goals Set</Text>
                        <Text style={styles.emptyDesc}>Create a goal to start tracking your savings journey.</Text>
                        <TouchableOpacity style={styles.emptyButton} onPress={() => setIsAddModalVisible(true)}>
                            <Text style={styles.emptyButtonText}>Create First Goal</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.goalsList}>
                        {goals.map(renderGoalItem)}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add Goal Modal */}
            <Modal visible={isAddModalVisible} animationType="slide" transparent onRequestClose={() => setIsAddModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Financial Goal</Text>
                            <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                <X size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>What are you saving for?</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. New Laptop, Emergency Fund"
                                value={newGoal.title}
                                onChangeText={t => setNewGoal({ ...newGoal, title: t })}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Target Amount</Text>
                            <View style={styles.priceInputContainer}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={newGoal.target_amount}
                                    onChangeText={t => setNewGoal({ ...newGoal, target_amount: t })}
                                />
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAddModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, isSubmitting && { opacity: 0.6 }]} onPress={handleAddGoal} disabled={isSubmitting}>
                                {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Create Goal</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Contribute Modal */}
            <Modal visible={isContributeModalVisible} animationType="slide" transparent onRequestClose={() => setIsContributeModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Funds</Text>
                            <TouchableOpacity onPress={() => setIsContributeModalVisible(false)}>
                                <X size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {selectedGoal && (
                            <View style={styles.selectedGoalInfo}>
                                <Text style={styles.selectedGoalName}>{selectedGoal.title}</Text>
                                <Text style={styles.selectedGoalProgress}>
                                    ${(selectedGoal.current_amount ?? 0).toLocaleString()} / ${(selectedGoal.target_amount ?? 0).toLocaleString()} saved
                                </Text>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Amount to Add</Text>
                            <View style={styles.priceInputContainer}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.priceInput}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={contributeAmount}
                                    onChangeText={setContributeAmount}
                                    autoFocus
                                />
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsContributeModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.saveBtn, isSubmitting && { opacity: 0.6 }]} onPress={handleContribute} disabled={isSubmitting}>
                                {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Add Funds</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 70 : 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: COLORS.border },
    title: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -1 },
    subtitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
    plusButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    statBox: { flex: 1, backgroundColor: 'white', padding: 14, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', gap: 4 },
    statVal: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    statLab: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
    goalsList: { gap: 16 },
    goalCard: { backgroundColor: 'white', padding: 20, borderRadius: 28, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    categoryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    categoryText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${COLORS.success}10`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    completedText: { color: COLORS.success, fontSize: 11, fontWeight: '800' },
    goalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 20 },
    amountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
    amountLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', textTransform: 'uppercase', marginBottom: 2 },
    amountValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    targetValue: { fontSize: 20, fontWeight: '800', color: COLORS.textSecondary },
    remainingValue: { fontSize: 20, fontWeight: '800' },
    amountDivider: { width: 1, height: 30, backgroundColor: COLORS.border, marginHorizontal: 8 },
    progressSection: { marginBottom: 20 },
    progressTrack: { height: 12, backgroundColor: '#f1f5f9', borderRadius: 6, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 6 },
    percentageLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginTop: 10 },
    goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    contributeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    contributeText: { fontSize: 13, fontWeight: '800', color: 'white' },
    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 24 },
    emptyDesc: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 8, lineHeight: 22 },
    emptyButton: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 20, marginTop: 32 },
    emptyButtonText: { color: 'white', fontWeight: '800', fontSize: 16 },
    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    selectedGoalInfo: { backgroundColor: COLORS.background, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
    selectedGoalName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    selectedGoalProgress: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginTop: 4 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
    input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, height: 56, paddingHorizontal: 16, fontSize: 16, fontWeight: '600', color: COLORS.text },
    priceInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, height: 60, paddingHorizontal: 20 },
    currencySymbol: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginRight: 8 },
    priceInput: { flex: 1, fontSize: 22, fontWeight: '800', color: COLORS.text },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, height: 56, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
    cancelBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.textSecondary },
    saveBtn: { flex: 2, height: 56, borderRadius: 18, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { fontSize: 16, fontWeight: '800', color: 'white' },
});
