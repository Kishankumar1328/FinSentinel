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
    TrendingUp,
    Plus,
    Calendar,
    Wallet,
    Building2,
    DollarSign,
    ChevronRight,
    ArrowRight
} from 'lucide-react-native';
import { useIncome } from '../../hooks/useIncome';

const COLORS = {
    primary: '#10b981',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
};

export default function IncomeScreen() {
    const { data, isLoading, error, refresh, addIncome } = useIncome();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        category: 'Salary',
    });

    const handleAdd = async () => {
        if (!formData.source || !formData.amount) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            await addIncome({
                source: formData.source,
                amount: parseFloat(formData.amount),
                category: formData.category,
                date: Date.now()
            });
            setIsModalVisible(false);
            setFormData({ source: '', amount: '', category: 'Salary' });
            Alert.alert('Success', 'Income recorded');
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const incomeList = data?.income || [];
    const totalIncome = incomeList.reduce((acc: number, item: any) => acc + parseFloat(item.amount), 0);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>All Income</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                    <Plus size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
            >
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Total This Month</Text>
                    <Text style={styles.summaryValue}>${totalIncome.toLocaleString()}</Text>
                </View>

                {isLoading && incomeList.length === 0 ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.list}>
                        {incomeList.map((item: any) => (
                            <View key={item.id} style={styles.itemCard}>
                                <View style={[styles.iconBox, { backgroundColor: `${COLORS.primary}10` }]}>
                                    <TrendingUp size={20} color={COLORS.primary} />
                                </View>
                                <View style={styles.itemMain}>
                                    <Text style={styles.itemSource}>{item.source}</Text>
                                    <Text style={styles.itemMeta}>{item.category} · {new Date(item.date).toLocaleDateString()}</Text>
                                </View>
                                <Text style={styles.itemAmount}>+${parseFloat(item.amount).toLocaleString()}</Text>
                            </View>
                        ))}
                        {incomeList.length === 0 && (
                            <View style={styles.emptyState}>
                                <Wallet size={48} color={COLORS.border} />
                                <Text style={styles.emptyText}>No income records found</Text>
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
                            <Text style={styles.modalTitle}>Add Income</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <ArrowRight size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Income Source</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Freelance, Rent"
                                value={formData.source}
                                onChangeText={t => setFormData({ ...formData, source: t })}
                            />
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
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleAdd}>
                            <Text style={styles.saveButtonText}>Save Transaction</Text>
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
    title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
    addButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20 },
    summaryCard: { backgroundColor: COLORS.primary, padding: 24, borderRadius: 24, marginBottom: 24 },
    summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
    summaryValue: { color: 'white', fontSize: 32, fontWeight: '800', marginTop: 4 },
    list: { gap: 12 },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    itemMain: { flex: 1, marginLeft: 16 },
    itemSource: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    itemMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    itemAmount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8 },
    input: { backgroundColor: COLORS.background, borderRadius: 12, height: 56, paddingHorizontal: 16, fontSize: 16, fontWeight: '600' },
    amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, height: 56, paddingHorizontal: 16 },
    dollarSign: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginRight: 8 },
    amountInput: { flex: 1, fontSize: 20, fontWeight: '800', color: COLORS.text },
    saveButton: { backgroundColor: COLORS.primary, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: '800' },
});
