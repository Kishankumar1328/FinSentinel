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
    Alert
} from 'react-native';
import {
    LineChart as LineChartIcon,
    Plus,
    AlertTriangle,
    ChevronRight,
    TrendingDown,
    Wallet,
    Calendar,
    Zap
} from 'lucide-react-native';
import { useBudgets } from '../../hooks/useBudgets';

const COLORS = {
    primary: '#4f46e5',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
};

export default function BudgetsScreen() {
    const { budgets, isLoading, error, refresh, addBudget } = useBudgets();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newBudget, setNewBudget] = useState({
        category: '',
        limit_amount: '',
    });

    const handleAddBudget = async () => {
        if (!newBudget.category || !newBudget.limit_amount) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            await addBudget({
                category: newBudget.category,
                limit_amount: parseFloat(newBudget.limit_amount),
                period: 'monthly',
                start_date: Date.now()
            });
            setIsModalVisible(false);
            setNewBudget({ category: '', limit_amount: '' });
            Alert.alert('Success', 'Budget created successfully');
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const renderBudgetItem = (budget: any) => {
        const percentage = Math.min(100, (budget.spent_amount / budget.limit_amount) * 100);
        const isNearLimit = percentage >= 80 && percentage < 100;
        const isOverLimit = percentage >= 100;

        let statusColor = COLORS.success;
        if (isOverLimit) statusColor = COLORS.danger;
        else if (isNearLimit) statusColor = COLORS.warning;

        return (
            <View key={budget.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                    <View style={[styles.iconBox, { backgroundColor: `${statusColor}10` }]}>
                        <Wallet size={20} color={statusColor} />
                    </View>
                    <View style={styles.budgetInfo}>
                        <Text style={styles.budgetTitle}>{budget.category}</Text>
                        <Text style={styles.budgetSubtitle}>Monthly Budget</Text>
                    </View>
                    <View style={styles.budgetAmountContainer}>
                        <Text style={styles.amountSpent}>${budget.spent_amount.toLocaleString()}</Text>
                        <Text style={styles.amountLimit}>/ ${budget.limit_amount.toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={[styles.progressBarBase, { backgroundColor: `${statusColor}20` }]}>
                        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: statusColor }]} />
                    </View>
                    <View style={styles.progressLabelRow}>
                        <Text style={[styles.percentageText, { color: statusColor }]}>{Math.round(percentage)}% used</Text>
                        <Text style={styles.remainingText}>
                            ${(budget.limit_amount - budget.spent_amount).toLocaleString()} left
                        </Text>
                    </View>
                </View>

                {(isNearLimit || isOverLimit) && (
                    <View style={[styles.alertBanner, { backgroundColor: isOverLimit ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                        <AlertTriangle size={14} color={isOverLimit ? COLORS.danger : COLORS.warning} />
                        <Text style={[styles.alertText, { color: isOverLimit ? COLORS.danger : COLORS.warning }]}>
                            {isOverLimit ? 'Budget exceeded!' : 'Approaching budget limit'}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Budgets</Text>
                <TouchableOpacity style={styles.headerAddButton} onPress={() => setIsModalVisible(true)}>
                    <Plus size={20} color="white" />
                    <Text style={styles.headerAddButtonText}>Add Budget</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
            >
                {isLoading && budgets.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : budgets.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <LineChartIcon size={48} color={COLORS.border} />
                        </View>
                        <Text style={styles.emptyTitle}>No Budgets Set</Text>
                        <Text style={styles.emptySubtitle}>Start managing your spending by creating your first budget.</Text>
                        <TouchableOpacity style={styles.emptyAddButton} onPress={() => setIsModalVisible(true)}>
                            <Text style={styles.emptyAddButtonText}>Create Budget</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.budgetList}>
                        {budgets.map(renderBudgetItem)}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Set New Budget</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.closeModalText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formItem}>
                            <Text style={styles.inputLabel}>Category</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Food, Transport"
                                value={newBudget.category}
                                onChangeText={(text) => setNewBudget({ ...newBudget, category: text })}
                            />
                        </View>

                        <View style={styles.formItem}>
                            <Text style={styles.inputLabel}>Monthly Limit</Text>
                            <View style={styles.amountInputContainer}>
                                <Text style={styles.currencySymbol}>$</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={newBudget.limit_amount}
                                    onChangeText={(text) => setNewBudget({ ...newBudget, limit_amount: text })}
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleAddBudget}>
                            <Text style={styles.submitButtonText}>Create Budget</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.text,
    },
    headerAddButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerAddButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    centerContainer: {
        paddingTop: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: 16,
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center',
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 40,
        marginBottom: 24,
        lineHeight: 20,
    },
    emptyAddButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
    },
    emptyAddButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    budgetList: {
        gap: 16,
    },
    budgetCard: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    budgetInfo: {
        flex: 1,
        marginLeft: 16,
    },
    budgetTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    budgetSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    budgetAmountContainer: {
        alignItems: 'flex-end',
    },
    amountSpent: {
        fontSize: 18,
        fontWeight: '800',
        color: COLORS.text,
    },
    amountLimit: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: '700',
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBarBase: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    percentageText: {
        fontSize: 12,
        fontWeight: '800',
    },
    remainingText: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        padding: 10,
        borderRadius: 12,
        gap: 8,
    },
    alertText: {
        fontSize: 12,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    closeModalText: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    formItem: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textSecondary,
        marginBottom: 10,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 20,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 20,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
});
