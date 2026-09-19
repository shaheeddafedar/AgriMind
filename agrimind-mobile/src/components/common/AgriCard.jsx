import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

export const AgriCard = ({
  children,
  style = null,
  variant = 'default',
  accentLeft = false,
  topBar = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'outlined' && styles.outlined,
        accentLeft && styles.accentLeft,
        style,
      ]}
    >
      {topBar && <View style={styles.topGradientBar} />}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  outlined: {
    shadowOpacity: 0,
    elevation: 0,
    borderColor: '#CBD5E1',
  },
  accentLeft: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  topGradientBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
});

export default AgriCard;
