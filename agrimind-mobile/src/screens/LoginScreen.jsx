import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AgriHeader from '../components/common/AgriHeader';
import AgriButton from '../components/common/AgriButton';
import AgriInput from '../components/common/AgriInput';
import AgriCard from '../components/common/AgriCard';
import ErrorMessage from '../components/common/ErrorMessage';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { login, apiUrl, updateApiUrl } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API Config Modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t('validation_email_pass'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigation.replace('MainTabs');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiUrl = async () => {
    await updateApiUrl(tempApiUrl);
    setShowConfigModal(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <AgriHeader
        title="AgriMind"
        showLanguage={true}
        variant="navbar"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Branding */}
        <View style={styles.brandHeader}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>AgriMind</Text>
          <Text style={styles.tagline}>Smart Agriculture Platform</Text>
        </View>

        {/* Login Card */}
        <AgriCard style={styles.loginCard}>
          <Text style={styles.welcomeTitle}>{t('welcome_agrimind')}</Text>
          <Text style={styles.welcomeSubtitle}>
            {t('signin_continue')}
          </Text>

          <ErrorMessage message={error} />

          <AgriInput
            label={t('email_address')}
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
          />

          <AgriInput
            label={t('password')}
            placeholder="password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError('');
            }}
            secureTextEntry={!showPassword}
            icon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
            rightComponent={
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            }
          />

          <AgriButton
            title={t('continue_email')}
            onPress={handleSubmit}
            loading={loading}
            style={styles.loginButton}
          />

          <Text style={styles.termsNotice}>
            {t('terms_notice')}{' '}
            <Text style={{ color: colors.primary }}>{t('terms_service')}</Text> and{' '}
            <Text style={{ color: colors.primary }}>{t('privacy_policy')}</Text>.
          </Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signupPromptRow}>
            <Text style={styles.promptText}>{t('dont_have_account')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLinkText}>{t('create_account')}</Text>
            </TouchableOpacity>
          </View>
        </AgriCard>

        {/* Backend API Configuration Helper Button */}
        <TouchableOpacity
          style={styles.configLink}
          onPress={() => {
            setTempApiUrl(apiUrl);
            setShowConfigModal(true);
          }}
        >
          <Ionicons name="settings-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
          <Text style={styles.configLinkText}>
            Server URL: {apiUrl}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Backend API URL Modal */}
      <Modal visible={showConfigModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Backend Server Connection</Text>
            <Text style={styles.modalDesc}>
              Enter your backend address. For Android emulator use 10.0.2.2:3000. For physical phone use your computer's LAN IP (e.g. 192.168.1.5:3000).
            </Text>
            <AgriInput
              label="Backend API URL"
              value={tempApiUrl}
              onChangeText={setTempApiUrl}
              placeholder="http://192.168.1.x:3000"
              autoCapitalize="none"
            />
            <View style={styles.modalButtonsRow}>
              <AgriButton
                title={t('cancel')}
                variant="outline"
                onPress={() => setShowConfigModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AgriButton
                title={t('save')}
                variant="primary"
                onPress={handleSaveApiUrl}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 36,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.primaryLight,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  loginCard: {
    padding: 22,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary, // matching web .login-modal h2 color: var(--primary-color)
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  loginButton: {
    marginTop: 8,
  },
  termsNotice: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: colors.textMuted,
  },
  signupPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  signupLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  configLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 6,
  },
  configLinkText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

export default LoginScreen;
