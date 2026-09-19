import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const ChatAssistantWidget = ({ isFullPage = false }) => {
  const { t } = useTranslation();

  const SUGGESTIONS = [
    t('chat_fertilizer_wheat', 'Fertilizer for wheat'),
    t('chat_rice_time', 'Best time to plant rice'),
    t('chat_soil_ph', 'What is soil pH?'),
    t('chat_kharif', 'What is kharif season?'),
    t('chat_rabi', 'What is rabi season?'),
    t('chat_increase_ph', 'How to increase soil pH?'),
    t('chat_decrease_ph', 'How to decrease soil pH?'),
  ];

  const [messages, setMessages] = useState([
    { text: t('chat_greeting', 'Hello! How can I help you today?'), sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const getBotResponse = (msg) => {
    const text = msg.toLowerCase();

    if (text.includes('increase soil ph') || text.includes('ph')) {
      return 'To increase soil pH (make it less acidic), you can add lime (calcium carbonate).';
    }
    if (text.includes('decrease soil ph')) {
      return 'To decrease soil pH (make it more acidic), you can add sulfur or aluminum sulfate.';
    }
    if (text.includes('soil ph')) {
      return 'Soil pH is a measure of soil acidity or alkalinity. Most crops prefer a pH between 6.0 and 7.5.';
    }
    if (text.includes('wheat') && text.includes('fertilizer')) {
      return 'For wheat, NPK (Nitrogen, Phosphorus, Potassium) in a balanced ratio (e.g., 12:32:16) is usually recommended at sowing.';
    }
    if (text.includes('wheat')) {
      return 'Wheat is a Rabi crop, typically sown in winter (October-December) and harvested in spring (February-May).';
    }
    if (text.includes('rice')) {
      return 'Rice is a Kharif crop that requires high rainfall and high humidity. It is usually grown in the monsoon season.';
    }
    if (text.includes('kharif')) {
      return 'Kharif crops (monsoon crops) are grown from June to October. Examples include rice, maize, and cotton.';
    }
    if (text.includes('rabi')) {
      return 'Rabi crops (winter crops) are sown from October to December. Examples include wheat, barley, and mustard.';
    }
    if (text.includes('hello') || text.includes('hi')) {
      return 'Hello! Ask me about crops, seasons, or soil health.';
    }

    return "Sorry, I'm just a simple bot. Try asking about 'soil ph', 'wheat', or 'kharif season'.";
  };

  const handleSend = (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    setMessages((prev) => [...prev, { text: query, sender: 'user' }]);
    if (!textToSend) setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: getBotResponse(query), sender: 'bot' },
      ]);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, isFullPage && styles.fullPageContainer]}
    >
      <View style={styles.cardHeader}>
        <FontAwesome5 name="comments" size={16} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>{t('chat_title', 'AgriMind AI Assistant')}</Text>
      </View>

      {/* Messages List */}
      <ScrollView
        ref={scrollViewRef}
        style={[styles.chatWindow, isFullPage ? styles.chatWindowFull : styles.chatWindowCompact]}
        contentContainerStyle={styles.chatWindowContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m, idx) => (
          <View
            key={idx}
            style={[
              styles.messageBubble,
              m.sender === 'user' ? styles.userBubble : styles.botBubble,
            ]}
          >
            {m.sender === 'bot' && (
              <FontAwesome5 name="robot" size={12} color={colors.primary} style={styles.botIcon} />
            )}
            <Text
              style={[
                styles.messageText,
                m.sender === 'user' ? styles.userMessageText : styles.botMessageText,
              ]}
            >
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Suggested Quick Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {SUGGESTIONS.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.chip}
              onPress={() => handleSend(s)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={t('chat_placeholder', 'Ask about crops, seasons, or soil...')}
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => handleSend()}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  fullPageContainer: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chatWindow: {
    backgroundColor: '#FAFBFD',
  },
  chatWindowCompact: {
    height: 220,
  },
  chatWindowFull: {
    flex: 1,
  },
  chatWindowContent: {
    padding: 14,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  botIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: colors.textPrimary,
  },
  chipsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 6,
  },
  chipText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.textPrimary,
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatAssistantWidget;
