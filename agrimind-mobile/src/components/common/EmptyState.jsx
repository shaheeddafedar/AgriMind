import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { useTranslation } from '../../i18n';

export const EmptyState = ({
  icon = 'seedling',
  title,
  description,
  action = null,
}) => {
  const { t } = useTranslation();
  const displayTitle = title || t('no_history_title', 'No Data Available');
  const displayDesc = description || t('no_history_desc', 'There is no information to display right now.');

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <FontAwesome5 name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.description}>{displayDesc}</Text>
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: 18,
  },
});

export default EmptyState;
