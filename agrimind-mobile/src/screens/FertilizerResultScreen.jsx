import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import AgriButton from '../components/common/AgriButton';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const FertilizerResultScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { result } = route.params || {};

  if (!result) {
    return (
      <View style={styles.container}>
        <AgriHeader title={t('fertilizer_recommendation')} showBack onBack={() => navigation.goBack()} showLanguage={true} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('no_history_desc') || 'No recommendation data found. Please go back to the dashboard and submit the form.'}</Text>
          <AgriButton
            title={t('back_dashboard')}
            onPress={() => navigation.navigate('DashboardTab')}
            style={{ marginTop: 16 }}
            icon={<FontAwesome5 name="arrow-left" size={14} color="#FFFFFF" />}
          />
        </View>
      </View>
    );
  }

  const crop = result.crop || 'Crop';
  const recommendations = result.recommendations || {};
  const recList = recommendations.recommendedFertilizers || [];
  const soilStatus = result.soilStatus || {};
  const priority = result.priority || {};
  const xai = result.xaiExplanation || [];

  return (
    <View style={styles.container}>
      <AgriHeader
        title="AgriMind"
        subtitle={t('fertilizer_title')}
        showBack
        onBack={() => navigation.goBack()}
        showLanguage={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Result Header */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultHeaderTitle}>
            {t('fertilizer_recommendation_ready')}
          </Text>
          <Text style={styles.resultHeaderSubtitle}>
            {t('fertilizer_recommendation_desc')}
          </Text>
        </View>

        {/* Recommended Crop & Fertilizer Card (Solid Green - exact web style) */}
        <View style={styles.recommendedCropCard}>
          <Text style={styles.recommendedCropHeading}>
            {t('crop')}:{' '}
            <Text style={styles.cropNameHighlight}>
              {crop}
            </Text>
          </Text>

          <View style={styles.reasonBox}>
            <View style={styles.reasonHeaderRow}>
              <FontAwesome5 name="flask" size={16} color="#FFD700" style={{ marginRight: 8 }} />
              <Text style={styles.reasonHeading}>{t('recommended_fertilizer')}</Text>
            </View>

            {recommendations.overallRecommendation && (
              <View style={styles.overallRow}>
                <Text style={styles.overallTitle}>{t('overall_recommendation')}: </Text>
                <Text style={styles.overallText}>{recommendations.overallRecommendation}</Text>
              </View>
            )}

            {recList.map((rec, index) => (
              <View key={index} style={styles.fertilizerItem}>
                <Text style={styles.fertilizerNutrient}>{rec.nutrient}</Text>
                <Text style={styles.fertilizerDetail}>
                  <Text style={styles.detailLabel}>{t('fertilizer_label')}: </Text>
                  {rec.fertilizer}
                </Text>
                {rec.alternatives && rec.alternatives.length > 0 && (
                  <Text style={styles.fertilizerDetail}>
                    <Text style={styles.detailLabel}>{t('alternative_label')}: </Text>
                    {rec.alternatives.join(', ')}
                  </Text>
                )}
                {rec.why ? (
                  <Text style={styles.fertilizerDetail}>
                    <Text style={styles.detailLabel}>{t('why_label')}: </Text>
                    {rec.why}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* Soil Status Card */}
        <AgriCard style={styles.resultCard}>
          <View style={styles.cardHeaderRow}>
            <FontAwesome5 name="seedling" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>{t('soil_status')}</Text>
          </View>

          <View style={styles.listContainer}>
            {Object.entries(soilStatus).map(([nutrient, status]) => (
              <View key={nutrient} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.itemLabel}>
                  <Text style={{ fontWeight: '700', textTransform: 'capitalize' }}>{nutrient}: </Text>
                  {status}
                </Text>
              </View>
            ))}
          </View>
        </AgriCard>

        {/* Nutrient Priority Card */}
        <AgriCard style={styles.resultCard}>
          <View style={styles.cardHeaderRow}>
            <FontAwesome5 name="exclamation-circle" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>{t('nutrient_priority')}</Text>
          </View>

          <View style={styles.listContainer}>
            {Object.entries(priority).map(([nutrient, value]) => (
              <View key={nutrient} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.itemLabel}>
                  <Text style={{ fontWeight: '700', textTransform: 'capitalize' }}>{nutrient}: </Text>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </AgriCard>

        {/* Why this recommendation? Card */}
        <AgriCard style={styles.resultCard}>
          <View style={styles.cardHeaderRow}>
            <FontAwesome5 name="brain" size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>{t('why_recommendation')}</Text>
          </View>

          <View style={styles.listContainer}>
            {xai.length > 0 ? (
              xai.map((explanation, index) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.itemText}>{explanation.trim()}</Text>
                </View>
              ))
            ) : (
              <View style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.itemText}>
                  {t('ai_crop_explanation_desc') || 'The recommendation is based on the crop requirement and soil nutrient status.'}
                </Text>
              </View>
            )}
          </View>
        </AgriCard>

        {/* Back to Dashboard Button */}
        <AgriButton
          title={t('back_dashboard')}
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    borderRadius: 6,
    marginTop: 4,
  },
  reasonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reasonHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overallRow: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  overallTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  overallText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 18,
  },
  fertilizerItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  fertilizerNutrient: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  fertilizerDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: '700',
    color: '#FFFFFF',
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
  listContainer: {
    paddingVertical: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    color: colors.primary,
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  itemLabel: {
    flex: 1,
    fontSize: 13,
    color: '#444444',
    lineHeight: 18,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
  },
});

export default FertilizerResultScreen;
