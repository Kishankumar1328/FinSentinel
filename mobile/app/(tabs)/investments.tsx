import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Platform,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import {
    TrendingUp,
    Landmark,
    ArrowUpRight,
    ArrowDownRight,
    Briefcase,
    Wallet,
    Coins,
    Building2,
    Globe,
    Plus,
    X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useInvestments } from '../../hooks/useInvestments';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: '#0ea5e9',
    secondary: '#6366f1',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
};

const TYPE_ICONS: Record<string, any> = {
    stock: Briefcase,
    etf: Globe,
    crypto: Coins,
    bond: Landmark,
    real_estate: Building2,
    other: Wallet,
};

const TYPE_COLORS: Record<string, string> = {
    stock: '#6366f1',
    etf: '#0ea5e9',
    crypto: '#f59e0b',
    bond: '#10b981',
    real_estate: '#ec4899',
    other: '#64748b',
};

const ASSET_TYPES = ['stock', 'etf', 'crypto', 'bond', 'real_estate', 'other'];

export default function InvestmentsScreen() {
    const { data, isLoading, error, refresh, addInvestment } = useInvestments();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newInvestment, setNewInvestment] = useState({
        name: '',
        ticker: '',
        type: 'stock',
        shares: '',
        buy_price: '',
        current_price: '',
    });

    const handleAddInvestment = async () => {
        if (!newInvestment.name || !newInvestment.ticker || !newInvestment.shares || !newInvestment.buy_price) {
            Alert.alert('Missing Fields', 'Please fill in Name, Ticker, Shares, and Buy Price.');
            return;
        }
        setIsSubmitting(true);
        try {
            await addInvestment({
                name: newInvestment.name,
                ticker: newInvestment.ticker.toUpperCase(),
                type: newInvestment.type,
                shares: parseFloat(newInvestment.shares),
                buy_price: parseFloat(newInvestment.buy_price),
                current_price: parseFloat(newInvestment.current_price || newInvestment.buy_price),
                purchase_date: Date.now(),
            });
            setIsModalVisible(false);
            setNewInvestment({ name: '', ticker: '', type: 'stock', shares: '', buy_price: '', current_price: '' });
            Alert.alert('Added!', 'Investment tracked successfully.');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to add investment. Check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && !data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading Portfolio...</Text>
            </View>
        );
    }

    if (error && !data) {
        return (
            <View style={styles.loadingContainer}>
                <TrendingUp size={48} color={COLORS.border} />
                <Text style={styles.errorTitle}>Connection Error</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refresh}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const summary = data?.summary || { totalValue: 0, totalGain: 0, totalGainPct: 0 };
    const investments = data?.investments || [];
    const allocation = data?.allocation || [];

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Portfolio</Text>
                    <Text style={styles.subtitle}>{investments.length} assets tracked</Text>
                </View>
                <TouchableOpacity style={styles.addHeaderBtn} onPress={() => setIsModalVisible(true)}>
                    <Plus size={20} color="white" />
                    <Text style={styles.addHeaderBtnText}>Add</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
            >
                {/* Portfolio Card */}
                <LinearGradient
                    colors={['#0f172a', '#1e293b']}
                    style={styles.portfolioCard}
                >
                    <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
                    <Text style={styles.portfolioValue}>${(summary.totalValue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>

                    <View style={[styles.gainBadge, { backgroundColor: (summary.totalGain ?? 0) >= 0 ? `${COLORS.success}20` : `${COLORS.danger}20` }]}>
                        {(summary.totalGain ?? 0) >= 0 ? <ArrowUpRight size={14} color={COLORS.success} /> : <ArrowDownRight size={14} color={COLORS.danger} />}
                        <Text style={[styles.gainText, { color: (summary.totalGain ?? 0) >= 0 ? COLORS.success : COLORS.danger }]}>
                            {(summary.totalGain ?? 0) >= 0 ? '+' : ''}{(summary.totalGainPct ?? 0).toFixed(2)}% (${Math.abs(summary.totalGain ?? 0).toLocaleString()})
                        </Text>
                    </View>
                </LinearGradient>

                {/* Allocation */}
                {allocation.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Asset Allocation</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.allocationContent}>
                            {allocation.map((item: any, i: number) => (
                                <View key={i} style={styles.allocationBox}>
                                    <View style={[styles.allocationDot, { backgroundColor: TYPE_COLORS[item.type] || COLORS.primary }]} />
                                    <Text style={styles.allocationType}>{item.type}</Text>
                                    <Text style={styles.allocationPct}>{Math.round(item.percentage ?? 0)}%</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Assets */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Assets</Text>
                    <View style={styles.assetList}>
                        {investments.map((inv: any) => {
                            const Icon = TYPE_ICONS[inv.type] || Wallet;
                            const color = TYPE_COLORS[inv.type] || COLORS.primary;
                            const gain = ((inv.current_price ?? 0) - (inv.buy_price ?? 0)) * (inv.shares ?? 0);
                            const isGainPositive = gain >= 0;

                            return (
                                <View key={inv.id} style={styles.assetItem}>
                                    <View style={[styles.assetIconBox, { backgroundColor: `${color}10` }]}>
                                        <Icon size={22} color={color} />
                                    </View>
                                    <View style={styles.assetMain}>
                                        <Text style={styles.assetSymbol}>{inv.ticker}</Text>
                                        <Text style={styles.assetName}>{inv.name}</Text>
                                    </View>
                                    <View style={styles.assetPriceCol}>
                                        <Text style={styles.assetPrice}>${((inv.current_price ?? 0) * (inv.shares ?? 0)).toLocaleString()}</Text>
                                        <Text style={[styles.assetGain, { color: isGainPositive ? COLORS.success : COLORS.danger }]}>
                                            {isGainPositive ? '+' : ''}${gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                        {investments.length === 0 && (
                            <TouchableOpacity style={styles.emptyAssets} onPress={() => setIsModalVisible(true)}>
                                <TrendingUp size={40} color={COLORS.border} />
                                <Text style={styles.emptyAssetsTitle}>No Investments Yet</Text>
                                <Text style={styles.emptyAssetsText}>Tap to track your first asset</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Add Investment Modal */}
            <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Track Investment</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <X size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Type Selector */}
                        <Text style={styles.inputLabel}>Asset Type</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow}>
                            {ASSET_TYPES.map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.typeChip, newInvestment.type === t && styles.typeChipActive]}
                                    onPress={() => setNewInvestment({ ...newInvestment, type: t })}
                                >
                                    <Text style={[styles.typeChipText, newInvestment.type === t && styles.typeChipTextActive]}>
                                        {t.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.row}>
                            <View style={[styles.formItem, { flex: 2, marginRight: 8 }]}>
                                <Text style={styles.inputLabel}>Name</Text>
                                <TextInput style={styles.input} placeholder="Apple Inc." value={newInvestment.name} onChangeText={t => setNewInvestment({ ...newInvestment, name: t })} />
                            </View>
                            <View style={[styles.formItem, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Ticker</Text>
                                <TextInput style={styles.input} placeholder="AAPL" autoCapitalize="characters" value={newInvestment.ticker} onChangeText={t => setNewInvestment({ ...newInvestment, ticker: t })} />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formItem, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.inputLabel}>Shares / Units</Text>
                                <TextInput style={styles.input} placeholder="10" keyboardType="numeric" value={newInvestment.shares} onChangeText={t => setNewInvestment({ ...newInvestment, shares: t })} />
                            </View>
                            <View style={[styles.formItem, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>Buy Price ($)</Text>
                                <TextInput style={styles.input} placeholder="150.00" keyboardType="numeric" value={newInvestment.buy_price} onChangeText={t => setNewInvestment({ ...newInvestment, buy_price: t })} />
                            </View>
                        </View>

                        <View style={styles.formItem}>
                            <Text style={styles.inputLabel}>Current Price ($) <Text style={styles.optionalText}>(optional)</Text></Text>
                            <TextInput style={styles.input} placeholder="Same as buy price if not known" keyboardType="numeric" value={newInvestment.current_price} onChangeText={t => setNewInvestment({ ...newInvestment, current_price: t })} />
                        </View>

                        <TouchableOpacity style={[styles.submitButton, isSubmitting && { opacity: 0.6 }]} onPress={handleAddInvestment} disabled={isSubmitting}>
                            {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Add to Portfolio</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: COLORS.background },
    loadingText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 14 },
    errorTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 12 },
    errorText: { color: COLORS.danger, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
    retryButton: { marginTop: 16, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
    retryText: { color: 'white', fontWeight: '700' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: COLORS.border },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -1 },
    subtitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
    addHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    addHeaderBtnText: { color: 'white', fontWeight: '800', fontSize: 14 },
    portfolioCard: { padding: 28, borderRadius: 32, marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
    portfolioLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    portfolioValue: { color: 'white', fontSize: 36, fontWeight: '800', marginVertical: 8, letterSpacing: -1 },
    gainBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
    gainText: { fontSize: 14, fontWeight: '800' },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3, marginBottom: 16 },
    allocationContent: { gap: 12 },
    allocationBox: { backgroundColor: 'white', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 120 },
    allocationDot: { width: 8, height: 8, borderRadius: 4 },
    allocationType: { fontSize: 14, fontWeight: '700', color: COLORS.text, textTransform: 'capitalize', flex: 1 },
    allocationPct: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },
    assetList: { gap: 12 },
    assetItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
    assetIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    assetMain: { flex: 1, marginLeft: 16 },
    assetSymbol: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    assetName: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
    assetPriceCol: { alignItems: 'flex-end' },
    assetPrice: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    assetGain: { fontSize: 12, fontWeight: '700', marginTop: 2 },
    emptyAssets: { alignItems: 'center', padding: 40, backgroundColor: 'white', borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
    emptyAssetsTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
    emptyAssetsText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
    typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
    typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    typeChipText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'capitalize' },
    typeChipTextActive: { color: 'white' },
    row: { flexDirection: 'row' },
    formItem: { marginBottom: 16 },
    inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8 },
    optionalText: { fontWeight: '500', color: '#94a3b8' },
    input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, height: 52, paddingHorizontal: 16, fontSize: 15, fontWeight: '600', color: COLORS.text },
    submitButton: { backgroundColor: COLORS.primary, height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    submitButtonText: { color: 'white', fontSize: 17, fontWeight: '800' },
});
