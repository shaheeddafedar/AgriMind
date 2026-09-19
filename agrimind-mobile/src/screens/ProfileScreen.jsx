import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import AgriHeader from '../components/common/AgriHeader';
import AgriButton from '../components/common/AgriButton';
import AgriInput from '../components/common/AgriInput';
import farmService from '../services/farmService';
import pdfService from '../services/pdfService';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, updateUser, logout, apiUrl, updateApiUrl } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    email: user?.email || '',
  });

  const [photoAsset, setPhotoAsset] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  // Settings Modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(apiUrl);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        location: user.location || '',
        email: user.email || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchUserHistory = async () => {
      if (!user?._id || user._id === 'temp_user_id' || !/^[0-9a-fA-F]{24}$/.test(user._id)) return;
      try {
        const data = await farmService.getRecentRecommendations(user._id);
        setRecommendations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('Profile history fetch error:', err);
      }
    };
    fetchUserHistory();
  }, [user?._id]);

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), 'Please grant gallery permissions to change photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setPhotoAsset(result.assets[0]);
      }
    } catch (err) {
      console.warn('Photo selection error:', err);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert(t('error'), 'Name and Email cannot be empty.');
      return;
    }

    setUpdating(true);
    try {
      await updateUser(formData, photoAsset);
      setPhotoAsset(null);
      Alert.alert(t('success'), 'Profile updated successfully.');
    } catch (err) {
      Alert.alert(t('error'), err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadPdf = async (rec) => {
    setDownloadingId(rec._id);
    try {
      await pdfService.downloadAndShareReport(rec._id, rec.recommendedCrop);
    } catch (err) {
      Alert.alert(t('error'), 'Could not download report.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleLogout = async () => {
    Alert.alert(t('logout_confirm_title'), t('logout_confirm_desc'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout_confirm_title'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  const getAvatarUri = () => {
    if (photoAsset?.uri) return photoAsset.uri;
    if (user?.profilePhoto) {
      if (user.profilePhoto.startsWith('http')) return user.profilePhoto;
      if (user.profilePhoto.startsWith('/uploads')) {
        return `${apiUrl.replace(/\/+$/, '')}${user.profilePhoto}`;
      }
    }
    return null;
  };

  const avatarUri = getAvatarUri();

  return (
    <View style={styles.container}>
      <AgriHeader
        title="AgriMind"
        subtitle={t('user_profile')}
        showLanguage={true}
        rightAction={
          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => {
              setTempApiUrl(apiUrl);
              setShowSettingsModal(true);
            }}
          >
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Details Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.profileImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#94A3B8" />
              </View>
            )}

            <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickPhoto}>
              <FontAwesome5 name="camera" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.changePhotoText}>{t('change_photo')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name || 'Farmer'}</Text>
          <Text style={styles.userLocation}>
            <FontAwesome5 name="map-marker-alt" size={13} color={colors.primary} />{' '}
            {user?.location || 'Not set'}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.editHeading}>{t('edit_details')}</Text>

          <View style={styles.formGroup}>
            <AgriInput
              placeholder={t('full_name')}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <AgriInput
              placeholder={t('city_state')}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <AgriInput
              placeholder={t('email_address')}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <AgriButton
            title={updating ? t('updating') : t('update_profile')}
            onPress={handleUpdate}
            loading={updating}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* Recent Recommendations Card */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <FontAwesome5 name="history" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.historyHeading}>{t('profile_recommendations')}</Text>
          </View>

          {recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <View key={rec._id} style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cropTitle}>
                    {rec.recommendedCrop
                      ? rec.recommendedCrop.charAt(0).toUpperCase() + rec.recommendedCrop.slice(1).toLowerCase()
                      : 'Crop'}
                  </Text>
                  <View style={styles.historyMetaRow}>
                    <Text style={styles.historyMeta}>
                      <FontAwesome5 name="flask" size={11} color="#666" /> pH: {rec.soilPh || 'N/A'}
                    </Text>
                    <Text style={styles.metaDivider}> | </Text>
                    <Text style={styles.historyMeta}>
                      <FontAwesome5 name="cloud-rain" size={11} color="#666" /> {rec.rainfall || '0'}mm
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.pdfButton}
                  onPress={() => handleDownloadPdf(rec)}
                  disabled={downloadingId === rec._id}
                >
                  <FontAwesome5 name="download" size={11} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.pdfButtonText}>
                    {downloadingId === rec._id ? t('saving') : t('pdf')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              {t('no_recommendations')}
            </Text>
          )}
        </View>

        {/* Sign Out Button */}
        <AgriButton
          title={t('logout_confirm_title')}
          variant="outline"
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={18} color={colors.danger} />}
          style={styles.logoutBtn}
          textStyle={{ color: colors.danger }}
        />
      </ScrollView>

      {/* Backend Host Configuration Modal */}
      <Modal visible={showSettingsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Server Configuration</Text>
            <Text style={styles.modalDesc}>
              Set the backend API host address for network connectivity.
            </Text>
            <AgriInput
              label="Backend Host Address"
              value={tempApiUrl}
              onChangeText={setTempApiUrl}
              autoCapitalize="none"
              placeholder="http://192.168.x.x:3000"
            />

            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              <AgriButton
                title={t('cancel')}
                variant="outline"
                onPress={() => setShowSettingsModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <AgriButton
                title={t('save')}
                onPress={async () => {
                  await updateApiUrl(tempApiUrl);
                  setShowSettingsModal(false);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  settingsIconBtn: {
    padding: 6,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 14,
  },
  profileImg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 5,
    borderColor: '#e8f5e9', // matching web border: 5px solid #e8f5e9
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E2E8F0',
    borderWidth: 5,
    borderColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2e7d32', // matching web .profile-card h2 color: #2e7d32
    marginBottom: 6,
  },
  userLocation: {
    fontSize: 14,
    color: '#666666', // matching web .text-muted color: #666
    marginBottom: 14,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e0e0e0', // matching web hr background-color: #e0e0e0
    marginVertical: 18,
  },
  editHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32', // matching web .profile-card h3 color: #2e7d32
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  formGroup: {
    width: '100%',
    marginBottom: 10,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
    marginBottom: 12,
  },
  historyHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32', // matching web .profile-card h3 color: #2e7d32
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cropTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  historyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyMeta: {
    fontSize: 12,
    color: '#666666',
  },
  metaDivider: {
    color: '#CCCCCC',
  },
  historyDate: {
    fontSize: 11,
    color: '#888888',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pdfButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
    lineHeight: 18,
  },
  logoutBtn: {
    borderColor: colors.danger,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 14,
    lineHeight: 16,
  },
});

export default ProfileScreen;
