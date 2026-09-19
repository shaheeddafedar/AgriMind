import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import AgriButton from '../components/common/AgriButton';
import AgriInput from '../components/common/AgriInput';
import ErrorMessage from '../components/common/ErrorMessage';
import farmService from '../services/farmService';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

const CROPS_LIST = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'barley', label: 'Barley' },
  { value: 'blackgram', label: 'Blackgram' },
  { value: 'blackpepper', label: 'Black Pepper' },
  { value: 'brinjal', label: 'Brinjal' },
  { value: 'cabbage', label: 'Cabbage' },
  { value: 'cardamom', label: 'Cardamom' },
  { value: 'cauliflower', label: 'Cauliflower' },
  { value: 'chickpea', label: 'Chickpea' },
  { value: 'coconut', label: 'Coconut' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'coriander', label: 'Coriander' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'garlic', label: 'Garlic' },
  { value: 'grapes', label: 'Grapes' },
  { value: 'horsegram', label: 'Horsegram' },
  { value: 'jute', label: 'Jute' },
  { value: 'kidneybeans', label: 'Kidney Beans' },
  { value: 'lentil', label: 'Lentil' },
  { value: 'maize', label: 'Maize' },
  { value: 'mango', label: 'Mango' },
  { value: 'mothbeans', label: 'Moth Beans' },
  { value: 'mungbean', label: 'Mung Bean' },
  { value: 'muskmelon', label: 'Muskmelon' },
  { value: 'okra', label: 'Okra' },
  { value: 'onion', label: 'Onion' },
  { value: 'orange', label: 'Orange' },
  { value: 'papaya', label: 'Papaya' },
  { value: 'pigeonpeas', label: 'Pigeon Peas' },
  { value: 'pomegranate', label: 'Pomegranate' },
  { value: 'potato', label: 'Potato' },
  { value: 'ragi', label: 'Ragi' },
  { value: 'rapeseed', label: 'Rapeseed' },
  { value: 'rice', label: 'Rice' },
  { value: 'sorghum', label: 'Sorghum' },
  { value: 'soybean', label: 'Soybean' },
  { value: 'sunflower', label: 'Sunflower' },
  { value: 'sweet_potato', label: 'Sweet Potato' },
  { value: 'tomato', label: 'Tomato' },
  { value: 'turmeric', label: 'Turmeric' },
  { value: 'watermelon', label: 'Watermelon' },
  { value: 'wheat', label: 'Wheat' },
];

export const SmartIrrigationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState('');
  const [moisture, setMoisture] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [cropModalVisible, setCropModalVisible] = useState(false);

  const selectedCropLabel = CROPS_LIST.find((c) => c.value === selectedCrop)?.label || t('select_crop');

  const handleCheck = async () => {
    if (!selectedCrop) {
      setError(t('validation_crop_name') || 'Please select a crop.');
      return;
    }
    const val = Number(moisture);
    if (isNaN(val) || val < 0 || val > 100 || moisture === '') {
      setError('Soil moisture must be a valid percentage between 0 and 100%.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const data = await farmService.checkIrrigation(selectedCrop, val);
      if (data && data.success) {
        setResult(data);
      } else {
        setError(data?.message || 'Unable to check irrigation.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to check irrigation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AgriHeader
        title="AgriMind"
        subtitle={t('irrigation_title')}
        showLanguage={true}
      />
      {/* Web Page Header Banner */}
      <View style={styles.pageHeader}>
        <View style={styles.titleRow}>
          <FontAwesome5 name="tint" size={24} color="#2878ff" style={{ marginRight: 10 }} />
          <Text style={styles.pageHeaderTitle}>{t('irrigation_title')}</Text>
        </View>
        <Text style={styles.pageHeaderSubtitle}>
          {t('irrigation_desc')}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Form Card */}
        <View style={styles.irrigationCard}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="water" size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeaderTitle}>{t('irrigation_check_title')}</Text>
              <Text style={styles.cardHeaderSubtitle}>
                {t('irrigation_check_desc')}
              </Text>
            </View>
          </View>

          <ErrorMessage message={error} />

          {/* Crop Selector */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <FontAwesome5 name="seedling" size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.formLabel}>{t('crop')}</Text>
            </View>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setCropModalVisible(true)}
            >
              <Text style={selectedCrop ? styles.selectedCropText : styles.placeholderCropText}>
                {selectedCropLabel}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Soil Moisture Input */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <FontAwesome5 name="tint" size={14} color="#2878ff" style={{ marginRight: 6 }} />
              <Text style={styles.formLabel}>{t('soil_moisture')}</Text>
            </View>
            <AgriInput
              placeholder={t('soil_moisture_placeholder')}
              value={moisture}
              onChangeText={(text) => {
                setMoisture(text);
                if (error) setError('');
              }}
              keyboardType="numeric"
            />
          </View>

          <AgriButton
            title={loading ? t('checking') : t('check_irrigation')}
            onPress={handleCheck}
            loading={loading}
            icon={!loading ? <FontAwesome5 name="search" size={14} color="#FFFFFF" /> : undefined}
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Result Card (exact web styling with circular status icon) */}
        {result && (
          <View style={[styles.irrigationCard, styles.resultCard]}>
            <View
              style={[
                styles.resultStatusIcon,
                result.irrigationRequired
                  ? styles.iconRequired
                  : styles.iconNotRequired,
              ]}
            >
              <FontAwesome5
                name={result.irrigationRequired ? 'tint' : 'check-circle'}
                size={30}
                color={result.irrigationRequired ? '#2878ff' : '#2e8b57'}
              />
            </View>

            <Text style={styles.resultStatusTitle}>{t('irrigation_status')}</Text>

            <Text style={styles.resultMessage}>{result.message}</Text>

            {/* Metrics Breakdown */}
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>{t('crop')}</Text>
                <Text style={styles.metricValue}>
                  {result.crop ? result.crop.charAt(0).toUpperCase() + result.crop.slice(1) : ''}
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>{t('current_moisture') || t('soil_moisture')}</Text>
                <Text style={[styles.metricValue, result.irrigationRequired ? { color: '#2878ff' } : { color: '#2e8b57' }]}>
                  {result.soilMoisture}%
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>{t('required_threshold')}</Text>
                <Text style={styles.metricValue}>{result.threshold}%</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Crop Selection Modal */}
      <Modal visible={cropModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_crop')}</Text>
              <TouchableOpacity onPress={() => setCropModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }}>
              {CROPS_LIST.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.cropListItem,
                    selectedCrop === c.value && styles.cropListItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCrop(c.value);
                    setCropModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.cropListText,
                      selectedCrop === c.value && styles.cropListTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                  {selectedCrop === c.value && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  pageHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pageHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pageHeaderSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  irrigationCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectedCropText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  placeholderCropText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  resultCard: {
    alignItems: 'center',
  },
  resultStatusIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconRequired: {
    backgroundColor: '#E6EFFF',
  },
  iconNotRequired: {
    backgroundColor: '#E6F7ED',
  },
  resultStatusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  resultMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  metricsContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 10,
  },
  metricItem: {
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cropListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cropListItemActive: {
    backgroundColor: colors.successLight,
  },
  cropListText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  cropListTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default SmartIrrigationScreen;
