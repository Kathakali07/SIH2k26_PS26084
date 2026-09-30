import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Settings,
  Server,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
  Zap,
} from 'lucide-react-native';
import {
  DEFAULT_API_BASE,
  LOCAL_API_BASE,
  ANDROID_EMULATOR_API_BASE,
} from '../config/api';

export default function SettingsScreen({
  apiBase,
  onSaveApiBase,
}) {
  const [customUrl, setCustomUrl] = useState(apiBase);
  const [pingStatus, setPingStatus] = useState(null); // 'checking' | 'ok' | 'error'
  const [pingLatency, setPingLatency] = useState(null);

  const testConnection = async (urlToTest) => {
    setPingStatus('checking');
    const start = Date.now();
    try {
      const res = await fetch(`${urlToTest}/api/health`, {
        headers: { Accept: 'application/json' },
      });
      const end = Date.now();
      if (res.ok) {
        setPingStatus('ok');
        setPingLatency(end - start);
      } else {
        setPingStatus('error');
      }
    } catch (e) {
      setPingStatus('error');
    }
  };

  const handleSelectPreset = (url) => {
    setCustomUrl(url);
    onSaveApiBase(url);
    testConnection(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <Text style={styles.title}>Settings & API Connection</Text>
        <Text style={styles.subtitle}>
          Configure your backend nowcasting engine target URL
        </Text>
      </View>

      {/* Connection Presets Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Server size={16} color="#3b82f6" style={{ marginRight: 6 }} />
          <Text style={styles.cardTitle}>BACKEND SERVER TARGET</Text>
        </View>

        {/* Preset 1: Cloud Render Deployment */}
        <TouchableOpacity
          style={[
            styles.presetOption,
            apiBase === DEFAULT_API_BASE && styles.presetOptionActive,
          ]}
          onPress={() => handleSelectPreset(DEFAULT_API_BASE)}
          activeOpacity={0.7}
        >
          <View style={styles.presetTop}>
            <Text style={styles.presetName}>Live Cloud Deployment (Recommended)</Text>
            {apiBase === DEFAULT_API_BASE && (
              <CheckCircle2 size={16} color="#10b981" />
            )}
          </View>
          <Text style={styles.presetUrl}>{DEFAULT_API_BASE}</Text>
          <Text style={styles.presetDesc}>
            Connects to your free 24/7 Render cloud container with DGMR nowcasting API
          </Text>
        </TouchableOpacity>

        {/* Preset 2: Localhost Development */}
        <TouchableOpacity
          style={[
            styles.presetOption,
            apiBase === LOCAL_API_BASE && styles.presetOptionActive,
          ]}
          onPress={() => handleSelectPreset(LOCAL_API_BASE)}
          activeOpacity={0.7}
        >
          <View style={styles.presetTop}>
            <Text style={styles.presetName}>Local Machine (Vite / Dev Server)</Text>
            {apiBase === LOCAL_API_BASE && (
              <CheckCircle2 size={16} color="#10b981" />
            )}
          </View>
          <Text style={styles.presetUrl}>{LOCAL_API_BASE}</Text>
          <Text style={styles.presetDesc}>
            For testing when running `python backend/main.py` on the same laptop
          </Text>
        </TouchableOpacity>

        {/* Preset 3: Android Emulator Loopback */}
        <TouchableOpacity
          style={[
            styles.presetOption,
            apiBase === ANDROID_EMULATOR_API_BASE && styles.presetOptionActive,
          ]}
          onPress={() => handleSelectPreset(ANDROID_EMULATOR_API_BASE)}
          activeOpacity={0.7}
        >
          <View style={styles.presetTop}>
            <Text style={styles.presetName}>Android Emulator Loopback</Text>
            {apiBase === ANDROID_EMULATOR_API_BASE && (
              <CheckCircle2 size={16} color="#10b981" />
            )}
          </View>
          <Text style={styles.presetUrl}>{ANDROID_EMULATOR_API_BASE}</Text>
          <Text style={styles.presetDesc}>
            Routes through the 10.0.2.2 host alias inside the Android Studio emulator
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom URL Input & Ping Box */}
      <View style={styles.card}>
        <Text style={styles.inputTitle}>CUSTOM ENDPOINT URL</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={customUrl}
            onChangeText={setCustomUrl}
            placeholder="http://192.168.1.X:8000"
            placeholderTextColor="#475569"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={() => {
              onSaveApiBase(customUrl);
              setOfflineMode(false);
              testConnection(customUrl);
            }}
          >
            <Text style={styles.saveBtnText}>Connect</Text>
          </TouchableOpacity>
        </View>

        {/* Ping status output */}
        {pingStatus && (
          <View style={styles.pingRow}>
            {pingStatus === 'checking' && (
              <View style={styles.pingTag}>
                <ActivityIndicator size="small" color="#3b82f6" style={{ marginRight: 6 }} />
                <Text style={styles.pingChecking}>Pinging /api/health...</Text>
              </View>
            )}
            {pingStatus === 'ok' && (
              <View style={styles.pingTag}>
                <CheckCircle2 size={14} color="#10b981" style={{ marginRight: 5 }} />
                <Text style={styles.pingOk}>
                  Connected! Server online ({pingLatency}ms latency)
                </Text>
              </View>
            )}
            {pingStatus === 'error' && (
              <View style={styles.pingTag}>
                <XCircle size={14} color="#ef4444" style={{ marginRight: 5 }} />
                <Text style={styles.pingError}>
                  Unable to reach server. Auto-falling back to offline mode.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Project About Information */}
      <View style={styles.aboutCard}>
        <View style={styles.aboutHeader}>
          <Zap size={16} color="#3b82f6" style={{ marginRight: 6 }} />
          <Text style={styles.aboutTitle}>ClimaX Mobile Edition</Text>
        </View>
        <Text style={styles.aboutText}>
          Smart India Hackathon 2026 | Problem Statement PS26084
        </Text>
        <Text style={styles.aboutText}>
          Team: <Text style={styles.aboutHighlight}>502 BAD GATEWAY</Text>
        </Text>
        <Text style={styles.aboutVersion}>Version 0.4.0 • React Native & Expo</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060b17',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerBox: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 3,
  },
  card: {
    backgroundColor: '#0c1324',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  presetOption: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 11,
    marginBottom: 8,
  },
  presetOptionActive: {
    borderColor: 'rgba(59, 130, 246, 0.45)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  presetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
  },
  presetUrl: {
    fontSize: 10,
    color: '#38bdf8',
    fontFamily: 'monospace',
    marginTop: 3,
  },
  presetDesc: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 3,
  },
  inputTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  pingRow: {
    marginTop: 10,
  },
  pingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pingChecking: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: '600',
  },
  pingOk: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  pingError: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 14,
    padding: 14,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  aboutTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  aboutText: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 3,
  },
  aboutHighlight: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  aboutVersion: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 6,
  },
});
