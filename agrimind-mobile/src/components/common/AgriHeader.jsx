import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import colors from '../../theme/colors';
import useTranslation from '../../i18n';

export const AgriHeader = ({
  title,
  subtitle = null,
  showBack = false,
  onBack = null,
  showLanguage = true,
  rightAction = null,
  showLogo = false,
  icon = null,
  variant = 'primary', // 'primary' | 'gradient' | 'navbar'
}) => {
  const { language, setLanguage, availableLanguages } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLangLabel = availableLanguages.find(l => l.code === language)?.label || 'English';
  const isNavbar = variant === 'navbar';

  return (
    <View style={[styles.headerContainer, isNavbar && styles.navbarContainer]}>
      <View style={styles.topRow}>
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color={isNavbar ? colors.primary : '#FFFFFF'}
              />
            </TouchableOpacity>
          )}

          {showLogo && (
            <View style={styles.logoRow}>
              <FontAwesome5
                name="leaf"
                size={20}
                color={isNavbar ? colors.primary : '#FFFFFF'}
                style={{ marginRight: 7 }}
              />
            </View>
          )}

          {icon && !showLogo && (
            <View style={{ marginRight: 8 }}>
              {icon}
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.headerTitle,
                isNavbar && styles.navbarTitle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.headerSubtitle,
                  isNavbar && styles.navbarSubtitle,
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rightContainer}>
          {rightAction}
          {showLanguage && (
            <TouchableOpacity
              style={[
                styles.langButton,
                isNavbar && styles.navbarLangBtn,
              ]}
              onPress={() => setLangModalVisible(true)}
              activeOpacity={0.8}
            >
              <FontAwesome5
                name="globe"
                size={13}
                color={isNavbar ? colors.primary : '#FFFFFF'}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.langText,
                  isNavbar && styles.navbarLangText,
                ]}
              >
                {currentLangLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Language Selector Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Language / भाषा चुनें / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ</Text>
            {availableLanguages.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langOption,
                  language === item.code && styles.langOptionActive,
                ]}
                onPress={() => {
                  setLanguage(item.code);
                  setLangModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.langOptionText,
                    language === item.code && styles.langOptionTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                {language === item.code && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.primary,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  navbarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navbarTitle: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 0.3,
  },
  navbarSubtitle: {
    color: colors.textMuted,
  },
  navbarLangBtn: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  navbarLangText: {
    color: colors.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginLeft: 8,
  },
  langText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  langOptionActive: {
    backgroundColor: colors.successLight,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  langOptionText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  langOptionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default AgriHeader;
