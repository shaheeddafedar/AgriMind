import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { useTranslation } from '../../i18n';

export const ErrorMessage = ({ message, onRetry = null }) => {
  const { t } = useTranslation();
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={22} color={colors.danger} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.text}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryText}>{t('btn_try_again', 'Try Again')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  text: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default ErrorMessage;
