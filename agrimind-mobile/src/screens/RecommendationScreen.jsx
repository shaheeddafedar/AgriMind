import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import AgriButton from '../components/common/AgriButton';
import FinancialPieChart from '../components/charts/FinancialPieChart';
import YieldBarChart from '../components/charts/YieldBarChart';
import pdfService from '../services/pdfService';
import colors from '../theme/colors';
import useTranslation from '../i18n';

export const RecommendationScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { result } = route.params || {};

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!result) {
    return (
      <View style={styles.container}>
        <AgriHeader title="AgriMind" subtitle={t('recommendation_page_title', 'AI Crop Recommendation')} showBack={true} onBack={() => navigation.goBack()} showLanguage={true} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('no_rec_data', 'No recommendation data found. Please go back to the dashboard and submit the form.')}</Text>
          <AgriButton
            title={t('back_dashboard', 'Back to Dashboard')}
            onPress={() => navigation.navigate('DashboardTab')}
            style={{ marginTop: 16 }}
            icon={<FontAwesome5 name="arrow-left" size={14} color="#FFFFFF" />}
          />
        </View>
      </View>
    );
  }

  const recommendedCrop = result.recommendedCrop || 'Crop';
  const eco = result.cropEconomics;
  const yieldPerHectare = Number(eco?.yieldPerHectare || 0);
  const investment = Number(eco?.investment || result.investment || 0);
  const grossRevenue = eco?.grossRevenue !== null && eco?.grossRevenue !== undefined
    ? Number(eco.grossRevenue)
    : (result.grossRevenue !== null && result.grossRevenue !== undefined ? Number(result.grossRevenue) : null);
  const netProfit = eco?.netProfit !== null && eco?.netProfit !== undefined
    ? Number(eco.netProfit)
    : (result.netProfit !== null && result.netProfit !== undefined ? Number(result.netProfit) : null);

  let profitPotential = 'Not Available';
  if (netProfit !== null && investment > 0) {
    const profitPercentage = (netProfit / investment) * 100;
    if (profitPercentage >= 50) profitPotential = 'High';
    else if (profitPercentage >= 20) profitPotential = 'Medium';
    else if (profitPercentage >= 0) profitPotential = 'Low';
    else profitPotential = 'Negative';
  }

  const comparisonCrops = (eco?.yieldComparison || []).filter(
    (item) => (item.crop || '').toLowerCase().trim() !== recommendedCrop.toLowerCase().trim()
  ).slice(0, 3);

  const handleDownloadPdf = async () => {
    if (!result._id) {
      Alert.alert('Notice', 'Report ID not available for direct PDF export.');
      return;
    }
    setDownloadingPdf(true);
    try {
      await pdfService.downloadAndShareReport(result._id, recommendedCrop);
    } catch (err) {
      Alert.alert('PDF Export', 'Could not download PDF report. Ensure you are connected to the AgriMind server.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <View style={styles.container}>
      <AgriHeader
        title="AgriMind"
        subtitle={t('recommendation_page_title', 'AI Crop Recommendation')}
        showBack={true}
        onBack={() => navigation.goBack()}
        showLanguage={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Web Result Header */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultHeaderTitle}>
            {t('recommendation_ready', 'Your AI-Powered Recommendation is Ready!')}
          </Text>
          <Text style={styles.resultHeaderSubtitle}>
            {t('recommendation_desc', 'Based on your inputs, we recommend the following crop for optimal results.')}
          </Text>
        </View>

        {/* Recommended Crop Card (Solid Green - exact web style) */}
        <View style={styles.recommendedCropCard}>
          <Text style={styles.recommendedCropHeading}>
            {t('recommended_crop', 'Recommended Crop')}:{' '}
            <Text style={styles.cropNameHighlight}>
              {recommendedCrop}
            </Text>
          </Text>

          <View style={styles.reasonBox}>
            <View style={styles.reasonHeaderRow}>
              <FontAwesome5 name="lightbulb" size={16} color="#FFD700" style={{ marginRight: 8 }} />
              <Text style={styles.reasonHeading}>{t('why_crop', 'Why was this crop recommended?')}</Text>
            </View>

            {result.reasons && result.reasons.length > 0 ? (
              result.reasons.map((reason, idx) => (
                <View key={idx} style={styles.reasonItem}>
                  <Text style={styles.reasonBullet}>•</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reasonTitle}>{reason.title}: </Text>
                    <Text style={styles.reasonText}>{reason.text}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.reasonDefaultText}>
                Optimal balance between soil pH, nutrients, seasonal temperature, and rainfall.
              </Text>
            )}
          </View>
        </View>

        {/* AI Model Explanation Card */}
        <AgriCard style={styles.resultCard}>
          <View style={styles.cardHeaderRow}>
            <FontAwesome5 name="brain" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>{t('ai_model_explanation', 'AI Model Explanation')}</Text>
          </View>

          {result.modelXAI && result.modelXAI.length > 0 ? (
            result.modelXAI.map((exp, idx) => (
              <View key={idx} style={styles.xaiRow}>
                <Text style={styles.xaiBullet}>•</Text>
                <Text style={styles.xaiText}>{exp}</Text>
              </View>
            ))
          ) : result.shapContributions && result.shapContributions.length > 0 ? (
            result.shapContributions.map((item, idx) => (
              <View key={idx} style={styles.xaiRow}>
                <Text style={styles.xaiBullet}>•</Text>
                <Text style={styles.xaiText}>
                  <Text style={{ fontWeight: '700' }}>{item.feature}</Text>{' '}
                  {Number(item.shapValue) >= 0 ? 'positively supported' : 'negatively influenced'} the {recommendedCrop} prediction.
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.defaultInfoText}>
              Model explanation is not available for this prediction.
            </Text>
          )}
        </AgriCard>

        {/* Key Metrics (Estimated) */}
        <AgriCard style={styles.resultCard}>
          <View style={styles.cardHeaderRow}>
            <FontAwesome5 name="chart-line" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>{t('key_metrics', 'Key Metrics (Estimated)')}</Text>
          </View>

          <View style={styles.metricList}>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>{t('yield', 'Yield')}: </Text>
              <Text style={styles.metricValue}>
                {yieldPerHectare.toFixed(2)} {t('tonnes_hectare', 'Tonnes/Hectare')}
              </Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>{t('profit_potential', 'Profit Potential')}: </Text>
              <Text style={[
                styles.metricValue,
                profitPotential === 'High' && { color: colors.primary, fontWeight: '700' },
                profitPotential === 'Medium' && { color: colors.secondary, fontWeight: '700' },
                profitPotential === 'Negative' && { color: colors.danger, fontWeight: '700' },
              ]}>
                {profitPotential === 'High'
                  ? t('profit_high', 'High')
                  : profitPotential === 'Medium'
                  ? t('profit_medium', 'Medium')
                  : profitPotential === 'Low'
                  ? t('profit_low', 'Low')
                  : profitPotential === 'Negative'
                  ? t('profit_negative', 'Negative')
                  : t('profit_na', 'Not Available')}
              </Text>
            </View>
          </View>
        </AgriCard>

        {/* Financial Projections Card */}
        <AgriCard style={styles.resultCard}>
          <View style={styles.cardHeaderRow}>
            <FontAwesome5 name="dollar-sign" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>{t('financial_projections', 'Financial Projections')}</Text>
          </View>

          <View style={styles.estimateNoteRow}>
            <FontAwesome5 name="info-circle" size={13} color="#666666" style={{ marginRight: 6, marginTop: 2 }} />
            <Text style={styles.estimateNote}>
              {t('estimate_note', 'Approximate estimate based on the selected crop, farm area, estimated cultivation costs and latest available market price. Actual values may vary.')}
            </Text>
          </View>

          <View style={styles.financialsBox}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>{t('gross_revenue', 'Gross Revenue')}:</Text>
              <Text style={styles.financialValue}>
                ₹{grossRevenue !== null ? grossRevenue.toLocaleString('en-IN') : 'Not available'}
              </Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>{t('investment', 'Investment')}:</Text>
              <Text style={styles.financialValue}>
                ₹{investment.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>{t('net_profit', 'Net Profit')}:</Text>
              <Text style={[styles.financialValue, { color: colors.primary, fontWeight: '700' }]}>
                ₹{netProfit !== null ? netProfit.toLocaleString('en-IN') : 'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.chartWrapper}>
            <FinancialPieChart netProfit={netProfit} investment={investment} />
          </View>
        </AgriCard>

        {/* Yield Comparison Card */}
        <AgriCard style={styles.resultCard}>
          <View style={styles.cardHeaderRow}>
            <FontAwesome5 name="tractor" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>{t('yield_comparison', 'Yield Comparison (Tonnes per Hectare)')}</Text>
          </View>

          <View style={styles.chartWrapper}>
            <YieldBarChart
              recommendedCrop={recommendedCrop}
              recommendedYield={yieldPerHectare}
              comparisonCrops={comparisonCrops}
            />
          </View>
        </AgriCard>

        {/* PDF Download Button (if report is persisted) */}
        {result._id && (
          <AgriButton
            title={downloadingPdf ? t('saving', 'Saving...') : t('download_official_pdf', 'Download Official PDF Report')}
            onPress={handleDownloadPdf}
            loading={downloadingPdf}
            variant="primary"
            icon={<FontAwesome5 name="download" size={14} color="#FFFFFF" />}
            style={{ marginBottom: 12 }}
          />
        )}

        {/* Back to Dashboard Button */}
        <AgriButton
          title={t('back_dashboard', 'Back to Dashboard')}
          variant="outline"
          onPress={() => navigation.navigate('DashboardTab')}
          icon={<FontAwesome5 name="arrow-left" size={14} color={colors.primary} />}
          style={{ marginBottom: 24 }}
        />
      </ScrollView>
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
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  resultHeader: {
    alignItems: 'center',
    marginVertical: 18,
    paddingHorizontal: 8,
  },
  resultHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  resultHeaderSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  recommendedCropCard: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
  },
  recommendedCropHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  cropNameHighlight: {
    fontWeight: '800',
    textTransform: 'capitalize',
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
  },
  reasonBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  reasonBullet: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 6,
  },
  reasonTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reasonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  reasonDefaultText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  xaiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  xaiBullet: {
    color: colors.primary,
    fontSize: 14,
    marginRight: 8,
  },
  xaiText: {
    flex: 1,
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
  },
  defaultInfoText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  metricList: {
    paddingVertical: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  metricValue: {
    fontSize: 14,
    color: '#444444',
  },
  estimateNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
  },
  estimateNote: {
    flex: 1,
    fontSize: 11,
    color: '#666666',
    lineHeight: 15,
    fontStyle: 'italic',
  },
  financialsBox: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  financialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  financialLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444444',
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  chartWrapper: {
    marginTop: 8,
  },
});

export default RecommendationScreen;
