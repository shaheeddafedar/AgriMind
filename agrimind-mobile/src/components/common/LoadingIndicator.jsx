import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import { useTranslation } from '../../i18n';

export const LoadingIndicator = ({ message, size = 'large' }) => {
  const { t } = useTranslation();
  const displayMsg = message !== undefined ? message : t('loading', 'Loading...');

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      {displayMsg ? <Text style={styles.text}>{displayMsg}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
});

export default LoadingIndicator;
