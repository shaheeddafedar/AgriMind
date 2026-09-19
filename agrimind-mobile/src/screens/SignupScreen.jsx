import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import AgriHeader from '../components/common/AgriHeader';
import AgriButton from '../components/common/AgriButton';
import AgriInput from '../components/common/AgriInput';
import AgriCard from '../components/common/AgriCard';
import ErrorMessage from '../components/common/ErrorMessage';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const SignupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    password: '',
  });

  const [photoAsset, setPhotoAsset] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), 'Camera roll permission is required to select a profile photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoAsset(result.assets[0]);
      }
    } catch (err) {
      console.warn('Image picker error:', err);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), 'Camera permission is required to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoAsset(result.assets[0]);
      }
    } catch (err) {
      console.warn('Camera error:', err);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.password) {
      setError(t('validation_required'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('validation_pass_len'));
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signup(formData, photoAsset);
      navigation.replace('MainTabs');
    } catch (err) {
      setError(err.message || t('signup_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <AgriHeader
        title="AgriMind"
        showBack
        onBack={() => navigation.goBack()}
        showLanguage={true}
        variant="navbar"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroTitle}>{t('signup_hero_title')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('signup_hero_desc')}
          </Text>
        </View>

        <AgriCard style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="seedling" size={26} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>{t('create_account_title')}</Text>
            <Text style={styles.cardSubtitle}>{t('signup_start')}</Text>
            <View style={styles.headerUnderline} />
          </View>

          <ErrorMessage message={error} />

          {/* Photo Picker */}
          <View style={styles.photoContainer}>
            {photoAsset ? (
              <Image source={{ uri: photoAsset.uri }} style={styles.avatarPreview} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#94A3B8" />
              </View>
            )}
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
                <Ionicons name="images-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.photoBtnText}>{t('gallery')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
                <Ionicons name="camera-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.photoBtnText}>{t('camera')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <AgriInput
            label={t('name_placeholder')}
            placeholder="John Doe"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            icon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
          />

          <AgriInput
            label={t('location_placeholder')}
            placeholder="e.g. Belagavi, Karnataka"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            icon={<Ionicons name="location-outline" size={18} color={colors.textMuted} />}
          />

          <AgriInput
            label={t('phone_placeholder')}
            placeholder="10 Digit Mobile Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            icon={<Ionicons name="call-outline" size={18} color={colors.textMuted} />}
          />

          <AgriInput
            label={t('email_placeholder')}
            placeholder="you@example.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
          />

          <AgriInput
            label={t('password_placeholder')}
            placeholder="Choose a strong password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
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

          {/* Features Highlights */}
          <View style={styles.featuresRow}>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.featurePillText}>{t('ai_recommendations')}</Text>
            </View>
            <View style={styles.featurePill}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.featurePillText}>{t('farm_analytics')}</Text>
            </View>
          </View>

          <AgriButton
            title={t('create_account')}
            onPress={handleSubmit}
            loading={loading}
            icon={<FontAwesome5 name="rocket" size={15} color="#FFFFFF" />}
            style={styles.createBtn}
          />

          <View style={styles.loginFooter}>
            <Text style={styles.footerText}>{t('already_account')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>{t('login_here')}</Text>
            </TouchableOpacity>
          </View>
        </AgriCard>
      </ScrollView>
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
    paddingBottom: 36,
  },
  heroBanner: {
    backgroundColor: colors.primary, // exact web .signup-hero background color
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 28,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 18,
    textAlign: 'center',
  },
  formCard: {
    marginHorizontal: 16,
    marginTop: -16,
    padding: 24,
    borderRadius: 16,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f5ea', // matching web .form-header-icon
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e2a1e',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6c7a6c',
    marginTop: 4,
    textAlign: 'center',
  },
  headerUnderline: {
    width: 70,
    height: 3,
    backgroundColor: colors.primary, // matching web .form-header::after
    borderRadius: 3,
    marginTop: 14,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPreview: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: colors.successLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  photoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f6faf7', // matching web .form-features
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e3f0e6',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3d5240',
  },
  createBtn: {
    marginTop: 8,
  },
  loginFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default SignupScreen;
