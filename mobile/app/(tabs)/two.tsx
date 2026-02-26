import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { User, Bell, Shield, CircleHelp, LogOut, ChevronRight, Moon, Star, CreditCard, LayoutDashboard } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const COLORS = {
  primary: '#4f46e5',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  danger: '#ef4444',
};

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Explorer'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'explorer@finsentinel.com'}</Text>
          <View style={styles.proBadge}>
            <Star size={10} color="#fff" fill="#fff" />
            <Text style={styles.proText}>Premium Account</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
              <Moon size={20} color="#475569" />
            </View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#e2e8f0', true: COLORS.primary }}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
              <Bell size={20} color="#475569" />
            </View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <TouchableOpacity style={styles.card}>
          <View style={styles.settingItem}>
            <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
              <CreditCard size={20} color="#475569" />
            </View>
            <Text style={styles.settingLabel}>Billing & Plan</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
              <Shield size={20} color="#475569" />
            </View>
            <Text style={styles.settingLabel}>Security & Privacy</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingItem}>
            <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
              <CircleHelp size={20} color="#475569" />
            </View>
            <Text style={styles.settingLabel}>FAQ & Feedback</Text>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <LogOut size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>FinSentinel Pro v1.2.0 • Build 240</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: Platform.OS === 'ios' ? 70 : 50 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text, marginBottom: 24, letterSpacing: -1 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 20, borderRadius: 28, marginBottom: 32, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 28, fontWeight: '800' },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  profileEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2, fontWeight: '500' },
  proBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#f59e0b', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 5, marginTop: 8 },
  proText: { color: 'white', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  card: { backgroundColor: 'white', borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { flex: 1, marginLeft: 16, fontSize: 15, fontWeight: '700', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 72 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#fee2e2', marginTop: 8 },
  logoutText: { color: COLORS.danger, fontSize: 16, fontWeight: '800' },
  versionText: { textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 32, marginBottom: 40, fontWeight: '600' }
});
