import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Mic, X, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function VoiceEntryScreen() {
    const [isListening, setIsListening] = useState(false);
    const router = useRouter();
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        if (isListening) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isListening]);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <X size={24} color="#0f172a" />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.aiBadge}>
                    <Sparkles size={16} color="#4f46e5" />
                    <Text style={styles.aiBadgeText}>AI VOICE ASSISTANT</Text>
                </View>

                <Text style={styles.instruction}>
                    {isListening ? "Listening..." : "Tap the mic and say something like:"}
                </Text>

                {!isListening && (
                    <Text style={styles.example}>"I spent $45 on groceries at Costco yesterday"</Text>
                )}

                <View style={styles.micContainer}>
                    {isListening && (
                        <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
                    )}
                    <TouchableOpacity
                        style={[styles.micButton, isListening && styles.micButtonActive]}
                        onPress={() => setIsListening(!isListening)}
                    >
                        <Mic size={40} color={isListening ? "white" : "#4f46e5"} />
                    </TouchableOpacity>
                </View>

                {isListening && (
                    <Text style={styles.status}>Processing your request...</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    closeButton: { position: 'absolute', top: 60, right: 20, zIndex: 10 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(79, 70, 229, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 24 },
    aiBadgeText: { color: '#4f46e5', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    instruction: { fontSize: 20, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginBottom: 12 },
    example: { fontSize: 16, color: '#64748b', textAlign: 'center', fontStyle: 'italic', marginBottom: 40 },
    micContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
    micButton: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#f1f5f9', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
    micButtonActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
    pulse: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(79, 70, 229, 0.2)' },
    status: { marginTop: 20, color: '#4f46e5', fontWeight: '600' }
});
