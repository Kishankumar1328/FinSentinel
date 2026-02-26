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
    Alert
} from 'react-native';
import {
    Users,
    Plus,
    Crown,
    Share2,
    Mail,
    ArrowRight,
    ShieldCheck,
    UserPlus,
    ChevronRight,
    Receipt,
    Heart
} from 'lucide-react-native';
import { useFamily } from '../../hooks/useFamily';

const COLORS = {
    primary: '#db2777',
    secondary: '#f472b6',
    background: '#fff1f2',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#fbcfe8',
};

export default function FamilyScreen() {
    const { data, isLoading, error, refresh, familyAction } = useFamily();
    const [isCreating, setIsCreating] = useState(false);

    if (isLoading && !data) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const group = data?.group;
    const owner = data?.owner;
    const members = data?.members || [];
    const sharedExpenses = data?.sharedExpenses || [];

    if (!group && !isCreating) {
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBox}>
                    <Users size={60} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>Family Sentinel</Text>
                <Text style={styles.emptyDesc}>Manage shared finances with your family. Track group spending and optimize taxes together.</Text>
                <TouchableOpacity style={styles.createButton} onPress={() => familyAction('create', { name: 'Our Family' })}>
                    <Text style={styles.createButtonText}>Create Family Group</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>I have an invite</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{group?.name || 'Family'}</Text>
                    <Text style={styles.subtitle}>{members.length + 1} members</Text>
                </View>
                <TouchableOpacity style={styles.shareButton}>
                    <Share2 size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Members Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Family Members</Text>
                <View style={styles.membersList}>
                    {/* Owner */}
                    <View style={styles.memberCard}>
                        <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
                            <Text style={styles.avatarText}>{owner?.name?.[0] || 'O'}</Text>
                        </View>
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{owner?.name || 'Owner'}</Text>
                            <View style={styles.roleBadge}>
                                <Crown size={10} color="#fff" />
                                <Text style={styles.roleText}>Owner</Text>
                            </View>
                        </View>
                    </View>

                    {/* Members */}
                    {members.map((member: any) => (
                        <View key={member.id} style={styles.memberCard}>
                            <View style={[styles.avatar, { backgroundColor: COLORS.secondary }]}>
                                <Text style={styles.avatarText}>{member.name?.[0] || 'M'}</Text>
                            </View>
                            <View style={styles.memberInfo}>
                                <Text style={styles.memberName}>{member.name}</Text>
                                <Text style={styles.memberEmail}>{member.email}</Text>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.inviteCard} onPress={() => Alert.alert('Invite', 'Send invitation email')}>
                        <View style={styles.inviteIcon}>
                            <UserPlus size={22} color={COLORS.primary} />
                        </View>
                        <Text style={styles.inviteText}>Invite Member</Text>
                        <ChevronRight size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Shared Activity */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Receipt size={18} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>Shared Activity</Text>
                </View>
                <View style={styles.expenseList}>
                    {sharedExpenses.map((exp: any) => (
                        <View key={exp.id} style={styles.expenseItem}>
                            <View style={styles.expenseDot} />
                            <View style={styles.expenseMain}>
                                <Text style={styles.expenseDesc}>{exp.description || exp.category}</Text>
                                <Text style={styles.expenseUser}>Paid by {exp.member_name || 'You'}</Text>
                            </View>
                            <Text style={styles.expenseAmount}>${exp.amount.toLocaleString()}</Text>
                        </View>
                    ))}
                    {sharedExpenses.length === 0 && (
                        <Text style={styles.noActivity}>No shared activity yet</Text>
                    )}
                </View>
            </View>

            <View style={styles.familyPerks}>
                <Heart size={20} color={COLORS.primary} fill={COLORS.primary} />
                <Text style={styles.perksText}>Shared Premium Features Active</Text>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
    loadingContainer: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -1 },
    subtitle: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
    shareButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    membersList: { gap: 12 },
    memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
    avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontSize: 18, fontWeight: '800' },
    memberInfo: { flex: 1, marginLeft: 16 },
    memberName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    memberEmail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    roleBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4, marginTop: 4 },
    roleText: { color: 'white', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    inviteCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.primary },
    inviteIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: `${COLORS.primary}10`, justifyContent: 'center', alignItems: 'center' },
    inviteText: { flex: 1, marginLeft: 16, fontSize: 16, fontWeight: '700', color: COLORS.primary },
    expenseList: { backgroundColor: 'white', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: COLORS.border },
    expenseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    expenseDot: { width: 4, height: 16, backgroundColor: COLORS.primary, borderRadius: 2 },
    expenseMain: { flex: 1, marginLeft: 12 },
    expenseDesc: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    expenseUser: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    expenseAmount: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    noActivity: { color: COLORS.textSecondary, fontStyle: 'italic', textAlign: 'center', padding: 20 },
    familyPerks: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center', marginTop: 20, opacity: 0.8 },
    perksText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
    emptyContainer: { flex: 1, backgroundColor: COLORS.background, padding: 40, justifyContent: 'center', alignItems: 'center' },
    emptyIconBox: { width: 120, height: 120, borderRadius: 40, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 32, elevation: 5 },
    emptyTitle: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: -1 },
    emptyDesc: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 24, marginTop: 12, marginBottom: 40 },
    createButton: { backgroundColor: COLORS.primary, width: '100%', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    createButtonText: { color: 'white', fontSize: 18, fontWeight: '800' },
    joinButton: { marginTop: 20 },
    joinButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
});
