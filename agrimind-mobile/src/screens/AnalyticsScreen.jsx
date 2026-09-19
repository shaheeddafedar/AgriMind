import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import LoadingIndicator from '../components/common/LoadingIndicator';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  CropsDistributionChart,
  SeasonsChart,
  FertilizerAnalysisChart,
  NpkAnalysisChart,
} from '../components/charts/AnalyticsCharts';
import farmService from '../services/farmService';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const AnalyticsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await farmService.getAnalytics();
      setData(res);
      setError('');
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Unable to load analytics data. Please check backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  return (
    <View style={styles.container}>
      <AgriHeader
        title="AgriMind"
        subtitle={t('analytics_title')}
        showLanguage={true}
      />
      {/* Web Gradient Page Header */}
      <View style={styles.pageHeader}>
        <View style={styles.titleRow}>
          <FontAwesome5 name="chart-line" size={24} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.pageHeaderTitle}>{t('analytics_title')}</Text>
        </View>
        <Text style={styles.pageHeaderSubtitle}>
          {t('analytics_desc')}
        </Text>
      </View>

      {loading ? (
        <LoadingIndicator message={t('loading')} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        >
          <ErrorMessage message={error} onRetry={fetchAnalytics} />

          {/* 1. Most Recommended Crops */}
          <AgriCard accentLeft={true} style={styles.chartCard}>
            <View style={styles.chartHeadingRow}>
              <FontAwesome5 name="seedling" size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.chartHeading}>{t('analytics_crops')}</Text>
            </View>
            <CropsDistributionChart crops={data?.mostRecommendedCrops || []} />
          </AgriCard>

          {/* 2. Recommendations by Season */}
          <AgriCard accentLeft={true} style={styles.chartCard}>
            <View style={styles.chartHeadingRow}>
              <FontAwesome5 name="calendar-alt" size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.chartHeading}>{t('analytics_season')}</Text>
            </View>
            <SeasonsChart seasons={data?.recommendationsBySeason || []} />
          </AgriCard>

          {/* 3. Fertilizer Analysis */}
          <AgriCard accentLeft={true} style={styles.chartCard}>
            <View style={styles.chartHeadingRow}>
              <FontAwesome5 name="flask" size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.chartHeading}>{t('analytics_fertilizer')}</Text>
            </View>
            <FertilizerAnalysisChart fertilizers={data?.fertilizerAnalysis || []} />
          </AgriCard>

          {/* 4. NPK Nutrient Analysis */}
          <AgriCard accentLeft={true} style={styles.chartCard}>
            <View style={styles.chartHeadingRow}>
              <FontAwesome5 name="chart-bar" size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.chartHeading}>{t('analytics_npk')}</Text>
            </View>
            <NpkAnalysisChart npk={data?.npkAnalysis || {}} />
          </AgriCard>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  pageHeader: {
    backgroundColor: colors.primary,
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pageHeaderSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 340,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  chartCard: {
    marginBottom: 20,
    padding: 18,
  },
  chartHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default AnalyticsScreen;
