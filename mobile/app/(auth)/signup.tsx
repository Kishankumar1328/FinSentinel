import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { User as UserIcon, Mail, Lock, ArrowRight, Shield, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../constants/Config';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            let result;
            try {
                result = await response.json();
            } catch (e) {
                throw new Error(response.ok ? 'Invalid response format' : `Server error: ${response.status}`);
            }

            if (!response.ok) {
                throw new Error(result?.error || 'Failed to create account');
            }

            await signIn(result.data.token, {
                id: result.data.userId,
                email: result.data.email,
                name: result.data.name,
            });

            router.replace('/(tabs)');
        } catch (err: any) {
            Alert.alert('Signup Failed', err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.auroraContainer}>
                    <LinearGradient
                        colors={['rgba(79, 70, 229, 0.15)', 'transparent']}
                        style={styles.orb1}
                    />
                    <LinearGradient
                        colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
                        style={styles.orb2}
                    />
                </View>

                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <LinearGradient
                            colors={['#6366f1', '#8b5cf6']}
                            style={styles.logoIcon}
                        >
                            <TrendingUp size={20} color="white" />
                        </LinearGradient>
                        <Text style={styles.logoText}>FinSentinel</Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Join the elite</Text>
                        <Text style={styles.subtitle}>Start your financial transformation today</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>FULL NAME</Text>
                        <View style={styles.inputWrapper}>
                            <UserIcon size={18} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="John Doe"
                                placeholderTextColor="#94a3b8"
                                value={name}
                                onChangeText={setName}
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>EMAIL ADDRESS</Text>
                        <View style={styles.inputWrapper}>
                            <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>PASSWORD</Text>
                        <View style={styles.inputWrapper}>
                            <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.signupButton, loading && styles.disabledButton]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View style={styles.buttonInner}>
                                <Text style={styles.buttonText}>Create Free Account</Text>
                                <ArrowRight size={18} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footerInfo}>
                        <Text style={styles.termsText}>
                            By creating an account, you agree to our Terms and Privacy Policy.
                        </Text>
                    </View>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>ALREADY HAVE AN ACCOUNT?</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity style={styles.loginButton}>
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    auroraContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
        zIndex: -1,
    },
    orb1: {
        position: 'absolute',
        top: -100,
        left: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    orb2: {
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
    },
    header: {
        marginBottom: 40,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    formContainer: {
        gap: 20,
    },
    titleSection: {
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000000',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginTop: 8,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    signupButton: {
        height: 52,
        backgroundColor: '#000',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    footerInfo: {
        alignItems: 'center',
        marginVertical: 4,
    },
    termsText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
        fontWeight: '500',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748b',
    },
    loginButton: {
        height: 48,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    }
});
