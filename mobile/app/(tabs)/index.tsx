import React, { useState, useEffect } from 'react';
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
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  LineChart as LineChartIcon,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Target,
  Users,
  PieChart,
  ShieldCheck,
  ChevronRight,
  Activity,
  Award,
  CircleDot
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#4f46e5',
  secondary: '#7c3aed',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, error, refresh } = useDashboard();

  if (isLoading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Synthesizing your finances...</Text>
      </View>
    );
  }

  const summary = {
    income: data?.summary?.totalIncome ?? 0,
    expenses: data?.summary?.totalExpenses ?? 0,
    balance: data?.summary?.balance ?? 0
  };
  const savingsRate = summary.income > 0 ? Math.round(((summary.income - summary.expenses) / summary.income) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeLabel}>Good Afternoon</Text>
          <Text style={styles.userName}>{user?.name || 'Explorer'}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/two')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Balance Card */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>${summary.balance.toLocaleString()}</Text>

        <View style={styles.balanceStats}>
          <View style={styles.balanceStatItem}>
            <View style={styles.statIconContainer}>
              <ArrowUpRight size={16} color={COLORS.success} />
            </View>
            <View>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>+${summary.income.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.balanceStatDivider} />

          <View style={styles.balanceStatItem}>
            <View style={styles.statIconContainer}>
              <ArrowDownRight size={16} color={COLORS.danger} />
            </View>
            <View>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statValue}>-${summary.expenses.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/expenses')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
              <Plus size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/income')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <TrendingUp size={24} color={COLORS.success} />
            </View>
            <Text style={styles.actionLabel}>Income</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/voice')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Zap size={24} color={COLORS.warning} />
            </View>
            <Text style={styles.actionLabel}>Voice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/reports')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
              <Activity size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionLabel}>Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Financial Health */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Financial Health</Text>
          <Award size={18} color={COLORS.warning} />
        </View>
        <View style={styles.healthCard}>
          <View style={styles.healthProgressContainer}>
            <View style={styles.healthProgressInfo}>
              <Text style={styles.healthScoreText}>{data?.healthScore || 85}</Text>
              <Text style={styles.healthScoreLabel}>Score</Text>
            </View>
            <CircleDot size={80} color={COLORS.primary} strokeWidth={2} style={styles.healthRing} />
          </View>
          <View style={styles.healthDetails}>
            <Text style={styles.healthStatus}>Strong</Text>
            <Text style={styles.healthDesc}>Your savings rate is {savingsRate}% this month. You're doing better than 75% of users!</Text>
          </View>
        </View>
      </View>

      {/* Feature Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modules</Text>
        <View style={styles.featureGrid}>
          {[
            { label: 'Budgets', icon: LineChartIcon, color: COLORS.primary, route: '/budgets' },
            { label: 'Goals', icon: Target, color: COLORS.secondary, route: '/goals' },
            { label: 'Invest', icon: PieChart, color: COLORS.warning, route: '/investments' },
            { label: 'Tax', icon: ShieldCheck, color: COLORS.success, route: '/tax' },
            { label: 'Family', icon: Users, color: '#ec4899', route: '/family' },
            { label: 'Analytics', icon: Receipt, color: '#06b6d4', route: '/reports' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.featureCard}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: `${item.color}10` }]}>
                <item.icon size={22} color={item.color} />
              </View>
              <Text style={styles.featureLabel}>{item.label}</Text>
              <View style={styles.featureArrow}>
                <ChevronRight size={14} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* AI Insight Banner */}
      {data?.primaryInsight && (
        <TouchableOpacity style={styles.aiInsightCard} onPress={() => router.push('/reports')}>
          <LinearGradient
            colors={['#1e1b4b', '#312e81']}
            style={styles.aiInsightGradient}
          >
            <View style={styles.aiInsightIconCol}>
              <View style={styles.aiIconContainer}>
                <Sparkles size={20} color="#fff" />
              </View>
            </View>
            <View style={styles.aiInsightContent}>
              <Text style={styles.aiInsightTitle}>AI Recommendation</Text>
              <Text style={styles.aiInsightText}>{data.primaryInsight.description}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  profileButton: {
    padding: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  balanceCard: {
    padding: 24,
    borderRadius: 28,
    marginBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  balanceValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: '800',
    marginVertical: 8,
    letterSpacing: -1,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  balanceStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  healthCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 20,
  },
  healthProgressContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthRing: {
    position: 'absolute',
  },
  healthProgressInfo: {
    alignItems: 'center',
  },
  healthScoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  healthScoreLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  healthDetails: {
    flex: 1,
  },
  healthStatus: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  healthDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  featureArrow: {
    opacity: 0.5,
  },
  aiInsightCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
  },
  aiInsightGradient: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  aiInsightIconCol: {
    justifyContent: 'center',
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiInsightContent: {
    flex: 1,
  },
  aiInsightTitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  aiInsightText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 20,
  },
});
