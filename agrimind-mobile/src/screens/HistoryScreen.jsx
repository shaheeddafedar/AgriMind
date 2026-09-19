import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import farmService from '../services/farmService';
import pdfService from '../services/pdfService';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const HistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    if (!user?._id || user._id === 'temp_user_id' || !/^[0-9a-fA-F]{24}$/.test(user._id)) {
      setLoading(false);
      return;
    }

    try {
      const data = await farmService.getRecentRecommendations(user._id);
      setHistory(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('History fetch error:', err);
      setError('Failed to fetch recommendation history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user?._id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleDownloadPdf = async (item) => {
    setDownloadingId(item._id);
    try {
      await pdfService.downloadAndShareReport(item._id, item.recommendedCrop);
    } catch (err) {
      Alert.alert(t('error'), 'Unable to download report. Ensure backend is running.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <AgriHeader
        title={t('history_title')}
        subtitle={t('history_subtitle')}
        showBack
        onBack={() => navigation.goBack()}
        showLanguage={true}
      />

      {loading ? (
        <LoadingIndicator message={t('loading_history')} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          <ErrorMessage message={error} onRetry={fetchHistory} />

          {history.length > 0 ? (
            history.map((rec) => (
              <AgriCard key={rec._id} style={styles.historyCard}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('HistoryDetail', { recId: rec._id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.cropTitle}>
                        {rec.recommendedCrop
                          ? rec.recommendedCrop.charAt(0).toUpperCase() + rec.recommendedCrop.slice(1)
                          : t('recommended_crop')}
                      </Text>
                      <Text style={styles.dateText}>
                        {new Date(rec.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.pdfBtn}
                      onPress={() => handleDownloadPdf(rec)}
                      disabled={downloadingId === rec._id}
                    >
                      <FontAwesome5 name="file-pdf" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.pdfBtnText}>
                        {downloadingId === rec._id ? t('saving') : t('pdf')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.metricsRow}>
                    <View style={styles.metricPill}>
                      <FontAwesome5 name="flask" size={11} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.metricPillText}>pH: {rec.soilPh || 'N/A'}</Text>
                    </View>
                    <View style={styles.metricPill}>
                      <Ionicons name="cloud-outline" size={13} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.metricPillText}>{rec.rainfall || '0'} mm</Text>
                    </View>
                    {rec.netProfit ? (
                      <View style={[styles.metricPill, { backgroundColor: colors.successLight }]}>
                        <Text style={[styles.metricPillText, { color: colors.primaryDark, fontWeight: '700' }]}>
                          +₹{rec.netProfit.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </AgriCard>
            ))
          ) : (
            <EmptyState
              icon="history"
              title={t('no_history_title')}
              description={t('no_history_desc')}
            />
          )}
        </ScrollView>
      )}
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
  historyCard: {
    marginBottom: 12,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cropTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  pdfBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metricPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  metricPillText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default HistoryScreen;
