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
    Receipt,
    Plus,
    Search,
    Filter,
    ArrowRight,
    TrendingDown,
    ShoppingBag,
    Home,
    Coffee,
    Car
} from 'lucide-react-native';
import { useExpenses } from '../../hooks/useExpenses';

const COLORS = {
    primary: '#ef4444',
    secondary: '#f87171',
    background: '#fef2f2',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#fee2e2',
};

const CAT_ICONS: Record<string, any> = {
    Food: Coffee,
    Rent: Home,
    Transport: Car,
    Shopping: ShoppingBag,
};

export default function ExpensesScreen() {
    const { data, isLoading, error, refresh, addExpense } = useExpenses();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        category: 'General',
        amount: '',
        description: '',
    });

    const handleAdd = async () => {
        if (!formData.amount || !formData.category) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }
        try {
            await addExpense({
                ...formData,
                amount: parseFloat(formData.amount),
                date: Date.now()
            });
            setIsModalVisible(false);
            setFormData({ category: 'General', amount: '', description: '' });
            Alert.alert('Success', 'Expense logged');
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const expenseList = data?.expenses || [];
    const totalExpenses = expenseList.reduce((acc: number, item: any) => acc + parseFloat(item.amount), 0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Spending</Text>
                    <Text style={styles.subtitle}>Recent Outgoings</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
            >
                <View style={styles.summaryCard}>
                    <View style={styles.summaryInfo}>
                        <Text style={styles.summaryLabel}>Total Spent</Text>
                        <Text style={styles.summaryValue}>${totalExpenses.toLocaleString()}</Text>
                    </View>
                    <TrendingDown size={32} color="rgba(255,255,255,0.4)" />
                </View>

                {isLoading && expenseList.length === 0 ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.list}>
                        {expenseList.map((item: any) => {
                            const Icon = CAT_ICONS[item.category] || Receipt;
                            return (
                                <View key={item.id} style={styles.itemCard}>
                                    <View style={[styles.iconBox, { backgroundColor: `${COLORS.primary}10` }]}>
                                        <Icon size={20} color={COLORS.primary} />
                                    </View>
                                    <View style={styles.itemMain}>
                                        <Text style={styles.itemTitle}>{item.category}</Text>
                                        <Text style={styles.itemMeta}>{item.description || 'No notes'} · {new Date(item.date).toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={styles.itemAmount}>-${parseFloat(item.amount).toLocaleString()}</Text>
                                </View>
                            );
                        })}
                        {expenseList.length === 0 && (
                            <View style={styles.emptyState}>
                                <Receipt size={48} color={COLORS.border} />
                                <Text style={styles.emptyText}>No expenses yet</Text>
                            </View>
                        )}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Expense</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeModal}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Amount</Text>
                            <View style={styles.amountInputContainer}>
                                <Text style={styles.dollarSign}>$</Text>
                                <TextInput
                                    style={styles.amountInput}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={formData.amount}
                                    onChangeText={t => setFormData({ ...formData, amount: t })}
                                    autoFocus
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Category</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Food, Rent, Transport"
                                value={formData.category}
                                onChangeText={t => setFormData({ ...formData, category: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="What did you buy?"
                                value={formData.description}
                                onChangeText={t => setFormData({ ...formData, description: t })}
                            />
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                            <Text style={styles.saveButtonText}>Add Expense</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
    subtitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    addButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20 },
    summaryCard: { backgroundColor: COLORS.primary, padding: 24, borderRadius: 28, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    summaryInfo: { flex: 1 },
    summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
    summaryValue: { color: 'white', fontSize: 32, fontWeight: '800', marginTop: 4 },
    list: { gap: 12 },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    itemMain: { flex: 1, marginLeft: 16 },
    itemTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    itemMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    itemAmount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
    closeModal: { padding: 4 },
    closeText: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
    inputGroup: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
    input: { backgroundColor: '#fdf2f2', borderRadius: 16, height: 56, paddingHorizontal: 16, fontSize: 16, fontWeight: '600' },
    amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdf2f2', borderRadius: 16, height: 60, paddingHorizontal: 20 },
    dollarSign: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginRight: 8 },
    amountInput: { flex: 1, fontSize: 24, fontWeight: '800', color: COLORS.text },
    saveButton: { backgroundColor: COLORS.primary, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: '800' },
});
