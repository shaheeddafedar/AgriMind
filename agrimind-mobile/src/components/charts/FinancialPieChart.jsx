import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import colors from '../../theme/colors';

export const FinancialPieChart = ({ netProfit = 0, investment = 0 }) => {
  const safeProfit = Math.max(Number(netProfit) || 0, 0);
  const safeInvestment = Math.max(Number(investment) || 0, 0);
  const total = safeProfit + safeInvestment;

  const profitPercent = total > 0 ? Math.round((safeProfit / total) * 100) : 50;
  const investPercent = 100 - profitPercent;

  // SVG Ring calculation
  const radius = 60;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const profitStrokeDashoffset = circumference - (circumference * profitPercent) / 100;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <G rotation="-90" origin="80, 80">
            {/* Background Circle (Investment: #F4A460) */}
            <Circle
              cx="80"
              cy="80"
              r={radius}
              stroke={colors.secondary}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Foreground Circle (Net Profit: #2E8B57) */}
            <Circle
              cx="80"
              cy="80"
              r={radius}
              stroke={colors.primary}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={profitStrokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </G>
        </Svg>
        <View style={styles.innerLabel}>
          <Text style={styles.profitPercentText}>{profitPercent}%</Text>
          <Text style={styles.profitLabelSmall}>Profit Share</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: colors.primary }]} />
          <View>
            <Text style={styles.legendTitle}>Net Profit ({profitPercent}%)</Text>
            <Text style={styles.legendValue}>₹{safeProfit.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: colors.secondary }]} />
          <View>
            <Text style={styles.legendTitle}>Investment Cost ({investPercent}%)</Text>
            <Text style={styles.legendValue}>₹{safeInvestment.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profitPercentText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  profitLabelSmall: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  legendContainer: {
    marginTop: 18,
    width: '100%',
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  legendTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default FinancialPieChart;
