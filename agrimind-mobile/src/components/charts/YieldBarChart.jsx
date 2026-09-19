import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export const YieldBarChart = ({
  recommendedCrop = '',
  recommendedYield = 0,
  comparisonCrops = [],
}) => {
  const safeRecommendedYield = Number(recommendedYield) || 0;

  const items = [
    {
      name: recommendedCrop ? (recommendedCrop.charAt(0).toUpperCase() + recommendedCrop.slice(1).toLowerCase()) : 'Recommended',
      yield: safeRecommendedYield,
      isRecommended: true,
    },
    ...comparisonCrops.map(item => ({
      name: item.crop ? (item.crop.charAt(0).toUpperCase() + item.crop.slice(1).toLowerCase() + ' (Avg)') : 'Crop',
      yield: Number(item.yieldPerHectare) || 0,
      isRecommended: false,
    }))
  ];

  const maxYield = Math.max(...items.map(i => i.yield), 1);

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const percent = Math.min(Math.round((item.yield / maxYield) * 100), 100);
        return (
          <View key={index} style={styles.barRow}>
            <View style={styles.labelRow}>
              <Text
                style={[
                  styles.cropName,
                  item.isRecommended && styles.recommendedCropName,
                ]}
                numberOfLines={1}
              >
                {item.isRecommended ? '⭐ ' : ''}{item.name}
              </Text>
              <Text
                style={[
                  styles.yieldValue,
                  item.isRecommended && styles.recommendedYieldValue,
                ]}
              >
                {item.yield.toFixed(2)} t/ha
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.max(percent, 4)}%`,
                    backgroundColor: item.isRecommended ? colors.primary : '#a9a9a9',
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 4,
  },
  barRow: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cropName: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    flex: 1,
  },
  recommendedCropName: {
    fontWeight: '700',
    color: colors.primary,
  },
  yieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recommendedYieldValue: {
    color: colors.primary,
    fontWeight: '700',
  },
  barTrack: {
    height: 12,
    backgroundColor: '#EDF2F7',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
});

export default YieldBarChart;
