import React from 'react';
import { View, StyleSheet } from 'react-native';
import AgriHeader from '../components/common/AgriHeader';
import ChatAssistantWidget from '../components/ChatAssistantWidget';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const ChatAssistantScreen = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <AgriHeader
        title={t('chat_title')}
        subtitle={t('chat_subtitle')}
        showBack
        onBack={() => navigation.goBack()}
        showLanguage={true}
      />
      <View style={styles.content}>
        <ChatAssistantWidget isFullPage={true} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});

export default ChatAssistantScreen;
