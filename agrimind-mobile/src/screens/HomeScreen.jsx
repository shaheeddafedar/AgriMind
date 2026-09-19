import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
    Platform,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import useTranslation from '../i18n';
import farmService from '../services/farmService';
import { getApiBaseUrl } from '../services/api';
import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import AgriButton from '../components/common/AgriButton';
import colors from '../theme/colors';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { t, setLanguage } = useTranslation();

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Belagavi');
  const [marketPrices, setMarketPrices] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [marketDate, setMarketDate] = useState('');
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  // Dynamic platform stats from /api/home-stats
  const [stats, setStats] = useState({
    farmers: 0,
    crops: 0,
    accuracy: 95,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await farmService.getHomeStats();
        if (res?.success && res?.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.warn('Home stats fetch error:', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await farmService.getKarnatakaDistricts();
        if (data && data.districts) {
          setDistricts(data.districts);
        }
      } catch (err) {
        console.warn('Failed to fetch districts:', err);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      if (!selectedDistrict) return;
      setLoadingMarket(true);
      setMarketDate('');
      try {
        const data = await farmService.getMarketPrices(selectedDistrict);
        setMarketPrices(data.prices || []);
        if (data.latestDate) {
          setMarketDate(`${t('latest_market_data', 'Latest available market data:')} ${data.latestDate}`);
        }
      } catch (err) {
        console.warn('Failed to fetch market prices:', err);
        setMarketPrices([]);
      } finally {
        setLoadingMarket(false);
      }
    };
    fetchPrices();
  }, [selectedDistrict]);

  const handleProtectedClick = (destination, params = {}) => {
    if (user) {
      navigation.navigate(destination, params);
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <AgriHeader
        title="AgriMind"
        showLogo={true}
        showLanguage={true}
        variant="navbar"
        rightAction={
          user ? (
            <TouchableOpacity
              style={styles.navUserBadge}
              onPress={() => navigation.navigate('ProfileTab')}
              activeOpacity={0.8}
            >
             <Image
  source={
    user.profilePhoto
      ? {
          uri: user.profilePhoto.startsWith('http')
            ? user.profilePhoto
            : Platform.OS === 'web'
              ? `/agrimind-api${user.profilePhoto}`
              : `${getApiBaseUrl()}${user.profilePhoto}`,
        }
      : require('../../assets/images/logo.png')
  }
  style={styles.navAvatar}
/>
              <Text style={styles.navUserName} numberOfLines={1}>
                {user.name?.split(' ')[0] || 'User'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.navLoginBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.navLoginText}>{t('nav_login', 'Log In')}</Text>
            </TouchableOpacity>
          )
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {t('hero_title', 'Intelligent Crop Recommendations for Modern Farmers')}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t('hero_desc', 'Empowering agriculture with AI-driven insights.')}
          </Text>

          <AgriButton
            title={t('hero_cta', 'Get Recommendation')}
            onPress={() => handleProtectedClick('DashboardTab')}
            icon={<FontAwesome5 name="seedling" size={16} color={colors.primary} />}
            style={styles.heroCtaBtn}
            textStyle={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}
          />

          {/* Floating Highlights (Exact Web frosted cards with white text/icons) */}
          <View style={styles.heroHighlights}>
            <View style={styles.highlightCard}>
              <FontAwesome5 name="seedling" size={24} color="#FFFFFF" />
              <Text style={styles.highlightTitle}>{t('card_smart_title', 'Smart Farming')}</Text>
              <Text style={styles.highlightDesc}>{t('card_smart_desc', 'AI powered insights')}</Text>
            </View>
            <View style={styles.highlightCard}>
              <FontAwesome5 name="chart-line" size={24} color="#FFFFFF" />
              <Text style={styles.highlightTitle}>{t('card_yield_title', 'Higher Yield')}</Text>
              <Text style={styles.highlightDesc}>{t('card_yield_desc', 'Maximize your profits')}</Text>
            </View>
          </View>
        </View>

        {/* LIVE KARNATAKA MARKET PRICES SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.marketCardWrapper}>
            <View style={styles.marketHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.marketHeaderTitle}>
                  <FontAwesome5 name="chart-line" size={16} color={colors.primary} />
                  {'  '}{t('live_market_prices', 'Live Karnataka Market Prices')}
                </Text>
                <Text style={styles.marketDateText}>
                  {marketDate || t('market_select_district', 'Select a district to view the latest market prices')}
                </Text>
              </View>

              {/* District Selector Button */}
              <View style={styles.districtSelectCol}>
                <Text style={styles.districtLabel}>
                  <FontAwesome5 name="map-marker-alt" size={12} color={colors.textSecondary} /> {t('market_district', 'District')}
                </Text>
                <TouchableOpacity
                  style={styles.districtSelectorBtn}
                  onPress={() => setDistrictModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.districtBtnText}>{selectedDistrict}</Text>
                  <Ionicons name="chevron-down" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>

            {loadingMarket ? (
              <View style={styles.marketLoadingBox}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.marketLoadingText}>{t('market_loading', 'Loading live market rates...')}</Text>
              </View>
            ) : marketPrices.length > 0 ? (
              <View style={styles.marketPricesGrid}>
                {marketPrices.slice(0, 6).map((item, idx) => (
                  <View key={idx} style={styles.marketPriceItem}>
                    <View style={styles.marketCropRow}>
                      <Text style={styles.cropIcon}>🌾</Text>
                      <Text style={styles.cropCommodity} numberOfLines={1}>
                        {item.commodity}
                      </Text>
                    </View>

                    <Text style={styles.marketPriceNumber}>
                      ₹{Number(item.modalPrice || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.marketPriceSub}>{t('market_modal_price', 'Modal price per quintal')}</Text>

                    <View style={styles.marketStoreRow}>
                      <FontAwesome5 name="store" size={11} color="#718096" style={{ marginRight: 5 }} />
                      <Text style={styles.marketStoreText} numberOfLines={1}>
                        {item.market}
                      </Text>
                    </View>

                    <Text style={styles.marketVarietyText} numberOfLines={1}>
                      {t('market_variety', 'Variety')}: {item.variety}
                    </Text>
                  </View>
                ))}

                {marketPrices.length > 6 && (
                  <TouchableOpacity
                    style={styles.viewMoreMarketBtn}
                    onPress={() => navigation.navigate('MarketTab')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewMoreMarketText}>
                      {t('view_all_apmc_rates', 'View All APMC Rates for')} {selectedDistrict} →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.marketEmptyBox}>
                <Text style={styles.marketEmptyText}>
                  {t('market_no_data', 'No market price data available for')} {selectedDistrict}.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* STATS SECTION (Exact Web green background #2E8B57, white text) */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <FontAwesome5 name="users" size={24} color="#FFFFFF" style={{ marginBottom: 6 }} />
            <Text style={styles.statNumber}>{stats.farmers}+</Text>
            <Text style={styles.statLabel}>{t('stat_farmers', 'Farmers Helped')}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <FontAwesome5 name="tractor" size={22} color="#FFFFFF" style={{ marginBottom: 6 }} />
            <Text style={styles.statNumber}>{stats.crops}+</Text>
            <Text style={styles.statLabel}>{t('stat_crops', 'Crops Recommended')}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <FontAwesome5 name="bullseye" size={24} color="#FFFFFF" style={{ marginBottom: 6 }} />
            <Text style={styles.statNumber}>{stats.accuracy}%</Text>
            <Text style={styles.statLabel}>{t('stat_accuracy', 'Accuracy Rate')}</Text>
          </View>
        </View>

        {/* ALL 8 FEATURES FROM WEB */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresHeading}>{t('feat_title', 'Features')}</Text>
          <Text style={styles.featuresSubtitle}>
            {t('feat_subtitle', 'Everything you need to grow better.')}
          </Text>

          <View style={styles.featuresGrid}>
            {/* 1. AI Crop Recommendation */}
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => handleProtectedClick('DashboardTab')}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <FontAwesome5 name="brain" size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{t('feat_ai_title', 'AI Crop Recommendation')}</Text>
              <Text style={styles.featureDesc}>
                {t('feat_ai_desc', 'Get the best crop suggestions based on soil and weather.')}
              </Text>
              <View style={styles.featureCtaRow}>
                <Text style={styles.featureCtaText}>
                  {user ? t('feat_ai_btn', 'Try Now') : t('login_to_access', 'Log In to Access')}
                </Text>
                <FontAwesome5
                  name={user ? 'arrow-right' : 'lock'}
                  size={12}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            {/* 2. Multilingual Support */}
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => navigation.navigate('Feedback')}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <FontAwesome5 name="language" size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{t('feat_fb_title', 'Multilingual Support')}</Text>
              <Text style={styles.featureDesc}>
                {t('feat_fb_desc', 'Available in English, Hindi, and Kannada.')}
              </Text>
              <View style={styles.featureCtaRow}>
                <Text style={styles.featureCtaText}>{t('feat_fb_btn', 'Provide Feedback')}</Text>
                <FontAwesome5 name="arrow-right" size={12} color={colors.primary} />
              </View>
            </TouchableOpacity>

            {/* 3. AI Farming Assistant */}
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => handleProtectedClick('ChatAssistant')}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <FontAwesome5 name="comments" size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{t('feat_chat_title', 'AI Farming Assistant')}</Text>
              <Text style={styles.featureDesc}>
                {t('feat_chat_desc', 'Chat with our AI bot for quick farming tips.')}
              </Text>
              <View style={styles.featureCtaRow}>
                <Text style={styles.featureCtaText}>
                  {user ? t('feat_chat_btn', 'Ask Now') : t('login_to_access', 'Log In to Access')}
                </Text>
                <FontAwesome5
                  name={user ? 'arrow-right' : 'lock'}
                  size={12}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            {/* 4. About AgriMind */}
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => navigation.navigate('About')}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <FontAwesome5 name="users" size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{t('feat_about_title', 'About AgriMind')}</Text>
              <Text style={styles.featureDesc}>
                {t('feat_about_desc', 'Learn more about our mission and vision.')}
              </Text>
              <View style={styles.featureCtaRow}>
                <Text style={styles.featureCtaText}>{t('feat_about_btn', 'Read More')}</Text>
                <FontAwesome5 name="arrow-right" size={12} color={colors.primary} />
              </View>
            </TouchableOpacity>

            {/* 5. Farm Analytics */}
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => navigation.navigate('AnalyticsTab')}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <FontAwesome5 name="chart-pie" size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{t('feat_data_title', 'Farm Analytics')}</Text>
              <Text style={styles.featureDesc}>
                {t('feat_data_desc', 'View platform statistics and trends.')}
              </Text>
              <View style={styles.featureCtaRow}>
                <Text style={styles.featureCtaText}>{t('feat_data_btn', 'View Analytics')}</Text>
                <FontAwesome5 name="arrow-right" size={12} color={colors.primary} />
              </View>
            </TouchableOpacity>

            {/* 6. Smart Fertilization */}
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => handleProtectedClick('DashboardTab')}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <FontAwesome5 name="seedling" size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{t('feat_fertilization_title', 'Smart Fertilization')}</Text>
              <Text style={styles.featureDesc}>
                {t('feat_fertilization_desc', 'Get tailored fertilizer recommendations.')}
              </Text>
              <View style={styles.featureCtaRow}>
                <Text style={styles.featureCtaText}>
                  {user ? t('feat_fertilization_btn', 'Try Now') : t('login_to_access', 'Log In to Access')}
                </Text>
                <FontAwesome5
                  name={user ? 'arrow-right' : 'lock'}
                  size={12}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            {/* 7. Smart Irrigation */}
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => handleProtectedClick('IrrigationTab')}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <FontAwesome5 name="tint" size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{t('feat_irrigation_title', 'Smart Irrigation')}</Text>
              <Text style={styles.featureDesc}>
                {t('feat_irrigation_desc', 'Check if your crops need watering today.')}
              </Text>
              <View style={styles.featureCtaRow}>
                <Text style={styles.featureCtaText}>
                  {user ? t('feat_irrigation_btn', 'Check Status') : t('login_to_access', 'Log In to Access')}
                </Text>
                <FontAwesome5
                  name={user ? 'arrow-right' : 'lock'}
                  size={12}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>

            {/* 8. IoT Integration */}
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => {
                Alert.alert(
                  t('feat_iot_title', 'IoT Smart Farming'),
                  t('feat_iot_desc', 'Connect farm sensors directly to the app.')
                );
              }}
              activeOpacity={0.8}
            >
              <View style={styles.featureIcon}>
                <FontAwesome5 name="microchip" size={28} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{t('feat_iot_title', 'IoT Smart Farming')}</Text>
              <Text style={styles.featureDesc}>
                {t('feat_iot_desc', 'Connect farm sensors directly to the app.')}
              </Text>
              <View style={styles.featureCtaRow}>
                <Text style={styles.featureCtaText}>{t('feat_iot_btn', 'Learn More')}</Text>
                <FontAwesome5 name="arrow-right" size={12} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* WEB-MATCHING FOOTER */}
        <View style={styles.footerSection}>
          <View style={styles.footerBrandRow}>
            <FontAwesome5 name="leaf" size={18} color={colors.primaryLight} style={{ marginRight: 8 }} />
            <Text style={styles.footerBrandTitle}>AgriMind</Text>
          </View>
          <Text style={styles.footerDesc}>
            {t('footer_desc', 'Empowering agriculture with AI-driven insights and sustainable practices.')}
          </Text>

          <View style={styles.footerLinksGrid}>
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>{t('footer_quick_links', 'Quick Links')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HomeTab')}>
                <Text style={styles.footerLinkText}>{t('nav_home', 'Home')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleProtectedClick('DashboardTab')}>
                <Text style={styles.footerLinkText}>{t('nav_dashboard', 'Dashboard')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('About')}>
                <Text style={styles.footerLinkText}>{t('nav_about', 'About')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>{t('footer_resources', 'Resources')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AnalyticsTab')}>
                <Text style={styles.footerLinkText}>{t('nav_analytics', 'Analytics')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Feedback')}>
                <Text style={styles.footerLinkText}>{t('nav_feedback', 'Feedback')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('IrrigationTab')}>
                <Text style={styles.footerLinkText}>{t('nav_irrigation', 'Irrigation')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>{t('footer_contact', 'Contact')}</Text>
              <Text style={styles.footerContactText}>support@agrimind.dev</Text>
              <Text style={styles.footerContactText}>+91 123 456 7890</Text>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>
              {t('footer_copyright', '© 2026 AgriMind. All Rights Reserved.')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* District Selector Modal */}
      <Modal visible={districtModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_karnataka_district', 'Select Karnataka District')}</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              {districts.map((district) => (
                <TouchableOpacity
                  key={district}
                  style={[
                    styles.districtItem,
                    selectedDistrict === district && styles.districtItemActive,
                  ]}
                  onPress={() => {
                    setSelectedDistrict(district);
                    setDistrictModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.districtItemText,
                      selectedDistrict === district && styles.districtItemTextActive,
                    ]}
                  >
                    {district}
                  </Text>
                  {selectedDistrict === district && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  navUserBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  navAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  navUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    maxWidth: 70,
  },
  navLoginBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  navLoginText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  heroSection: {
    backgroundColor: colors.primary, // Exact Web SeaGreen #2E8B57
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 32,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.92)',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },
  heroCtaBtn: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  heroHighlights: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 26,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  highlightDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 3,
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  marketCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  marketHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
  },
  marketDateText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
  },
  districtSelectCol: {
    alignItems: 'flex-end',
  },
  districtLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 3,
  },
  districtSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  districtBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  marketLoadingBox: {
    padding: 24,
    alignItems: 'center',
  },
  marketLoadingText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
  marketPricesGrid: {
    marginTop: 14,
  },
  marketPriceItem: {
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  marketCropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cropIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  cropCommodity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
  },
  marketPriceNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  marketPriceSub: {
    fontSize: 10,
    color: '#718096',
    marginBottom: 6,
  },
  marketStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  marketStoreText: {
    fontSize: 11,
    color: '#718096',
    flex: 1,
  },
  marketVarietyText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  viewMoreMarketBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewMoreMarketText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  marketEmptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  marketEmptyText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.primary, // SeaGreen matching web .stats
    marginTop: 28,
    paddingVertical: 32,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 16,
  },
  featuresHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  featuresSubtitle: {
    fontSize: 14,
    color: colors.mediumGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresGrid: {
    gap: 18,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8, // matching web var(--border-radius)
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 2,
  },
  featureIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(46, 139, 87, 0.1)', // exact web .feature-icon
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  featureDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  featureCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  featureCtaText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  footerSection: {
    backgroundColor: '#212529',
    marginTop: 36,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerBrandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 20,
  },
  footerLinksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  footerCol: {
    flex: 1,
  },
  footerColTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerLinkText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 6,
  },
  footerContactText: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 4,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 14,
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 10,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  districtItemActive: {
    backgroundColor: colors.successLight,
  },
  districtItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  districtItemTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default HomeScreen;
