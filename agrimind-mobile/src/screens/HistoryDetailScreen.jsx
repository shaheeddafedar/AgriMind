import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import AgriButton from '../components/common/AgriButton';
import LoadingIndicator from '../components/common/LoadingIndicator';
import farmService from '../services/farmService';
import pdfService from '../services/pdfService';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const HistoryDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { recId } = route.params || {};
  const { user } = useAuth();

  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user?._id || user._id === 'temp_user_id' || !/^[0-9a-fA-F]{24}$/.test(user._id) || !recId) return;
      try {
        const list = await farmService.getRecentRecommendations(user._id);
        const item = (list || []).find((r) => r._id === recId);
        setRec(item || null);
      } catch (err) {
        console.warn('History detail fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [user?._id, recId]);

  const handleDownloadPdf = async () => {
    if (!rec?._id) return;
    setDownloading(true);
    try {
      await pdfService.downloadAndShareReport(rec._id, rec.recommendedCrop);
    } catch (err) {
      Alert.alert(t('error'), 'Failed to download PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AgriHeader title={t('consultation_details')} showBack onBack={() => navigation.goBack()} showLanguage={true} />
        <LoadingIndicator message={t('loading')} />
      </View>
    );
  }

  if (!rec) {
    return (
      <View style={styles.container}>
        <AgriHeader title={t('consultation_details')} showBack onBack={() => navigation.goBack()} showLanguage={true} />
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{t('record_not_found')}</Text>
        </View>
      </View>
    );
  }

  const crop = rec.recommendedCrop || 'Crop';

  return (
    <View style={styles.container}>
      <AgriHeader
        title={t('consultation_details')}
        subtitle={`Report ID: ${rec._id.slice(-6).toUpperCase()}`}
        showBack
        onBack={() => navigation.goBack()}
        showLanguage={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Banner */}
        <View style={styles.topBanner}>
          <Text style={styles.bannerTag}>{t('official_recommendation')}</Text>
          <Text style={styles.cropTitle}>
            {crop.charAt(0).toUpperCase() + crop.slice(1)}
          </Text>
          <Text style={styles.bannerDate}>
            Generated on {new Date(rec.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        <AgriButton
          title={t('download_pdf_cert')}
          onPress={handleDownloadPdf}
          loading={downloading}
          variant="secondary"
          icon={<FontAwesome5 name="file-pdf" size={16} color="#FFFFFF" />}
          style={{ marginBottom: 16 }}
        />

        {/* Financial Projections */}
        {(rec.investment || rec.grossRevenue || rec.netProfit) && (
          <AgriCard>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="rupee-sign" size={15} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>{t('estimated_financials')}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('investment')}:</Text>
              <Text style={[styles.statVal, { color: colors.danger }]}>
                ₹{Number(rec.investment || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('gross_revenue')}:</Text>
              <Text style={[styles.statVal, { color: colors.primary }]}>
                ₹{Number(rec.grossRevenue || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={[styles.statRow, styles.profitHighlight]}>
              <Text style={styles.profitLabel}>{t('net_profit')}:</Text>
              <Text style={styles.profitVal}>
                ₹{Number(rec.netProfit || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </AgriCard>
        )}

        {/* Soil & Environmental Parameters */}
        <AgriCard>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="seedling" size={15} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>{t('soil_env_params')}</Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Nitrogen (N)</Text>
              <Text style={styles.gridValue}>{rec.nitrogen ?? 'N/A'} kg/ha</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Phosphorus (P)</Text>
              <Text style={styles.gridValue}>{rec.phosphorus ?? 'N/A'} kg/ha</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Potassium (K)</Text>
              <Text style={styles.gridValue}>{rec.potassium ?? 'N/A'} kg/ha</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Soil pH</Text>
              <Text style={styles.gridValue}>{rec.soilPh ?? 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Rainfall</Text>
              <Text style={styles.gridValue}>{rec.rainfall ?? 'N/A'} mm</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Temperature</Text>
              <Text style={styles.gridValue}>{rec.temperature ? `${rec.temperature}°C` : 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Humidity</Text>
              <Text style={styles.gridValue}>{rec.humidity ? `${rec.humidity}%` : 'N/A'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Area</Text>
              <Text style={styles.gridValue}>{rec.area ? `${rec.area} ha` : 'N/A'}</Text>
            </View>
          </View>
        </AgriCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  topBanner: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTag: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
  },
  cropTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  bannerDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  profitHighlight: {
    backgroundColor: colors.successLight,
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  profitLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  profitVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  gridLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
});

export default HistoryDetailScreen;
