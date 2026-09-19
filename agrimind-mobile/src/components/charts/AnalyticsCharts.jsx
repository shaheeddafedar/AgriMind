import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

const CROP_COLORS = [
  '#2E7D32', '#66BB6A', '#FFA726', '#FFB74D',
  '#8BC34A', '#43A047', '#F9A825', '#7CB342',
  '#FB8C00', '#558B2F', '#EF6C00', '#689F38',
];

const SEASON_COLORS = {
  Kharif: '#2E7D32',
  Rabi: '#FFA726',
  Zaid: '#EF6C00',
};

export const CropsDistributionChart = ({ crops = [] }) => {
  const total = crops.reduce((acc, c) => acc + (c.count || 0), 0) || 1;

  if (crops.length === 0) {
    return <Text style={styles.emptyText}>No crop data recorded yet.</Text>;
  }

  return (
    <View style={styles.chartBlock}>
      {crops.slice(0, 7).map((item, idx) => {
        const count = item.count || 0;
        const percent = Math.round((count / total) * 100);
        const color = CROP_COLORS[idx % CROP_COLORS.length];
        const rawName = item._id || 'Unknown';
        const formattedName = rawName
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());

        return (
          <View key={idx} style={styles.distributionRow}>
            <View style={styles.nameHeader}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.distribName} numberOfLines={1}>
                {formattedName}
              </Text>
              <Text style={styles.distribCount}>
                {count} ({percent}%)
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  { width: `${Math.max(percent, 4)}%`, backgroundColor: color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

export const SeasonsChart = ({ seasons = [] }) => {
  const total = seasons.reduce((acc, s) => acc + (s.count || 0), 0) || 1;

  if (seasons.length === 0) {
    return <Text style={styles.emptyText}>No seasonal data available yet.</Text>;
  }

  return (
    <View style={styles.chartBlock}>
      {/* Segmented bar */}
      <View style={styles.segmentedBar}>
        {seasons.map((s, idx) => {
          const count = s.count || 0;
          const percent = (count / total) * 100;
          const color = SEASON_COLORS[s._id] || colors.primary;
          return (
            <View
              key={idx}
              style={{
                width: `${percent}%`,
                height: '100%',
                backgroundColor: color,
              }}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.seasonLegendRow}>
        {seasons.map((s, idx) => {
          const count = s.count || 0;
          const percent = Math.round((count / total) * 100);
          const color = SEASON_COLORS[s._id] || colors.primary;
          return (
            <View key={idx} style={styles.seasonLegendItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.seasonText}>
                {s._id}: <Text style={{ fontWeight: '700' }}>{count}</Text> ({percent}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const FertilizerAnalysisChart = ({ fertilizers = [] }) => {
  const max = Math.max(...fertilizers.map(f => f.count || 0), 1);

  if (fertilizers.length === 0) {
    return <Text style={styles.emptyText}>No fertilizer recommendations recorded yet.</Text>;
  }

  return (
    <View style={styles.chartBlock}>
      {fertilizers.map((item, idx) => {
        const count = item.count || 0;
        const percent = Math.round((count / max) * 100);
        const color = CROP_COLORS[idx % CROP_COLORS.length];
        return (
          <View key={idx} style={styles.distributionRow}>
            <View style={styles.nameHeader}>
              <Text style={styles.distribName}>{item._id}</Text>
              <Text style={styles.distribCount}>{count} recommendations</Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  { width: `${Math.max(percent, 5)}%`, backgroundColor: color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

export const NpkAnalysisChart = ({ npk = {} }) => {
  const nutrients = [
    { label: 'Nitrogen (N)', data: npk.nitrogen || { low: 0, medium: 0, high: 0 } },
    { label: 'Phosphorus (P)', data: npk.phosphorus || { low: 0, medium: 0, high: 0 } },
    { label: 'Potassium (K)', data: npk.potassium || { low: 0, medium: 0, high: 0 } },
  ];

  return (
    <View style={styles.chartBlock}>
      {/* Legend */}
      <View style={styles.npkLegend}>
        <View style={styles.npkLegendItem}>
          <View style={[styles.dot, { backgroundColor: '#EF6C00' }]} />
          <Text style={styles.npkLegendText}>Low</Text>
        </View>
        <View style={styles.npkLegendItem}>
          <View style={[styles.dot, { backgroundColor: '#FFA726' }]} />
          <Text style={styles.npkLegendText}>Medium</Text>
        </View>
        <View style={styles.npkLegendItem}>
          <View style={[styles.dot, { backgroundColor: '#43A047' }]} />
          <Text style={styles.npkLegendText}>High</Text>
        </View>
      </View>

      {nutrients.map((item, idx) => {
        const total = (item.data.low || 0) + (item.data.medium || 0) + (item.data.high || 0) || 1;
        const lowPct = Math.round(((item.data.low || 0) / total) * 100);
        const medPct = Math.round(((item.data.medium || 0) / total) * 100);
        const highPct = Math.max(0, 100 - lowPct - medPct);

        return (
          <View key={idx} style={styles.npkNutrientBlock}>
            <View style={styles.nameHeader}>
              <Text style={styles.npkTitle}>{item.label}</Text>
              <Text style={styles.npkCount}>Total: {total}</Text>
            </View>
            <View style={styles.stackedBar}>
              <View style={{ width: `${lowPct}%`, backgroundColor: '#EF6C00', height: '100%' }} />
              <View style={{ width: `${medPct}%`, backgroundColor: '#FFA726', height: '100%' }} />
              <View style={{ width: `${highPct}%`, backgroundColor: '#43A047', height: '100%' }} />
            </View>
            <View style={styles.npkValuesRow}>
              <Text style={[styles.npkVal, { color: '#EF6C00' }]}>Low: {item.data.low || 0}</Text>
              <Text style={[styles.npkVal, { color: '#FFA726' }]}>Med: {item.data.medium || 0}</Text>
              <Text style={[styles.npkVal, { color: '#43A047' }]}>High: {item.data.high || 0}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  chartBlock: {
    width: '100%',
    paddingVertical: 6,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  distributionRow: {
    marginBottom: 12,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  distribName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  distribCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  track: {
    height: 10,
    backgroundColor: '#EDF2F7',
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 5,
  },
  segmentedBar: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  seasonLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  seasonLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  seasonText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  npkLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 16,
  },
  npkLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  npkLegendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  npkNutrientBlock: {
    marginBottom: 14,
  },
  npkTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  npkCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  stackedBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#EDF2F7',
    marginVertical: 4,
  },
  npkValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  npkVal: {
    fontSize: 11,
    fontWeight: '600',
  },
});
