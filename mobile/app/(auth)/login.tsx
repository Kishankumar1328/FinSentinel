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
import { Eye, EyeOff, ArrowRight, Shield, Sparkles, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../constants/Config';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            console.log(`[LOGIN] Attempting login at URL: ${API_URL}/api/auth/signin`);
            const response = await fetch(`${API_URL}/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            console.log(`[LOGIN] Response status: ${response.status}`);

            let result;
            try {
                result = await response.json();
                console.log(`[LOGIN] Result JSON:`, result);
            } catch (e) {
                console.log(`[LOGIN] Failed to parse JSON response`, e);
                // If it fails to parse JSON, it's likely a server error returning HTML
                throw new Error(response.ok ? 'Invalid response format' : `Server error: ${response.status}`);
            }

            if (!response.ok) {
                throw new Error(result?.error || 'Invalid credentials');
            }

            await signIn(result.data.token, {
                id: result.data.userId,
                email: result.data.email,
                name: result.data.name,
            });

            router.replace('/(tabs)');
        } catch (err: any) {
            console.log(`[LOGIN] Catch Block Error:`, err.message || err);
            Alert.alert(`Login Error Details:`, err.message || 'An error occurred');
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
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>Sign in to your financial command centre</Text>
                    </View>

                    <View style={styles.demoBanner}>
                        <View style={styles.demoIcon}>
                            <Shield size={16} color="#4f46e5" />
                        </View>
                        <View style={styles.demoTextContainer}>
                            <Text style={styles.demoTitle}>Demo Mode Available</Text>
                            <Text style={styles.demoSubtitle}>Enter registered credentials to continue.</Text>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>EMAIL ADDRESS</Text>
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

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <TouchableOpacity>
                                <Text style={styles.forgotPassword}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="••••••••"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View style={styles.buttonInner}>
                                <Text style={styles.buttonText}>Sign In</Text>
                                <ArrowRight size={18} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>DON'T HAVE AN ACCOUNT?</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity style={styles.signupButton}>
                            <Text style={styles.signupButtonText}>Create Free Account</Text>
                        </TouchableOpacity>
                    </Link>

                    <View style={styles.footerInfo}>
                        <View style={styles.infoItem}>
                            <Shield size={12} color="#94a3b8" />
                            <Text style={styles.infoText}>SSL secured</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Sparkles size={12} color="#94a3b8" />
                            <Text style={styles.infoText}>AI powered</Text>
                        </View>
                    </View>
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
        gap: 24,
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
    demoBanner: {
        flexDirection: 'row',
        backgroundColor: 'rgba(79, 70, 229, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.1)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    demoIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    demoTextContainer: {
        flex: 1,
    },
    demoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4338ca',
    },
    demoSubtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginTop: 2,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: 1,
    },
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
        backgroundColor: '#fff',
    },
    forgotPassword: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4f46e5',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 48,
    },
    eyeIcon: {
        position: 'absolute',
        right: 16,
        top: 14,
    },
    loginButton: {
        height: 52,
        backgroundColor: '#000',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
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
    signupButton: {
        height: 48,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    footerInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginTop: 10,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
    }
});
