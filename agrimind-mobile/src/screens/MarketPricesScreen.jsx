import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import ErrorMessage from '../components/common/ErrorMessage';
import farmService from '../services/farmService';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const MarketPricesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Belagavi');
  const [prices, setPrices] = useState([]);
  const [latestDate, setLatestDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await farmService.getKarnatakaDistricts();
        if (res && res.districts) {
          setDistricts(res.districts);
        }
      } catch (err) {
        console.warn('Failed to load districts:', err);
      }
    };
    fetchDistricts();
  }, []);

  const fetchPrices = async () => {
    if (!selectedDistrict) return;
    setLoading(true);
    setError('');
    try {
      const res = await farmService.getMarketPrices(selectedDistrict);
      setPrices(res.prices || []);
      setLatestDate(res.latestDate || '');
    } catch (err) {
      console.error('Market prices fetch error:', err);
      setError('Could not retrieve market prices. Please check backend connection.');
      setPrices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [selectedDistrict]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrices();
  };

  return (
    <View style={styles.container}>
      <AgriHeader
        title="AgriMind"
        subtitle={t('live_market_prices')}
        showLanguage={true}
      />

      {/* District Selector Banner */}
      <View style={styles.districtBar}>
        <View>
          <Text style={styles.districtBarLabel}>{t('market_district')}</Text>
          <Text style={styles.districtBarValue}>{selectedDistrict}</Text>
        </View>

        <TouchableOpacity
          style={styles.changeDistrictBtn}
          onPress={() => setDistrictModalVisible(true)}
        >
          <Ionicons name="location-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.changeDistrictBtnText}>{t('select_district')}</Text>
        </TouchableOpacity>
      </View>

      {latestDate ? (
        <View style={styles.dateNotice}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
          <Text style={styles.dateNoticeText}>Latest available market data: {latestDate}</Text>
        </View>
      ) : null}

      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('market_loading')}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          <ErrorMessage message={error} onRetry={fetchPrices} />

          {prices.length > 0 ? (
            prices.map((item, idx) => (
              <AgriCard key={idx} style={styles.priceCard}>
                <View style={styles.priceCardHeader}>
                  <View style={styles.cropTitleRow}>
                    <Text style={styles.cropIcon}>🌾</Text>
                    <View>
                      <Text style={styles.commodityName}>{item.commodity}</Text>
                      <Text style={styles.varietyText}>{t('market_variety')}: {item.variety}</Text>
                    </View>
                  </View>

                  <View style={styles.modalPriceBadge}>
                    <Text style={styles.modalPriceText}>
                      ₹{Number(item.modalPrice || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.modalPriceUnit}>{t('market_modal_price')}</Text>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>{t('market_market')}</Text>
                    <Text style={styles.detailVal}>{item.market}</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>Arrival Date</Text>
                    <Text style={styles.detailVal}>{item.arrivalDate || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.priceRangeRow}>
                  <Text style={styles.rangeText}>
                    Min: ₹{Number(item.minPrice || item.modalPrice || 0).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.rangeDivider}>•</Text>
                  <Text style={styles.rangeText}>
                    Max: ₹{Number(item.maxPrice || item.modalPrice || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </AgriCard>
            ))
          ) : (
            <AgriCard style={{ padding: 24, alignItems: 'center' }}>
              <FontAwesome5 name="store-slash" size={32} color={colors.textMuted} style={{ marginBottom: 10 }} />
              <Text style={styles.emptyTitle}>{t('market_no_data')} {selectedDistrict}</Text>
              <Text style={styles.emptySub}>
                {t('market_select_district')}
              </Text>
            </AgriCard>
          )}
        </ScrollView>
      )}

      {/* District Selection Modal */}
      <Modal visible={districtModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_karnataka_district')}</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 400 }}>
              {districts.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.districtItem, selectedDistrict === d && styles.districtItemActive]}
                  onPress={() => {
                    setSelectedDistrict(d);
                    setDistrictModalVisible(false);
                  }}
                >
                  <Text style={[styles.districtItemText, selectedDistrict === d && styles.districtItemTextActive]}>
                    {d}
                  </Text>
                  {selectedDistrict === d && (
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
  districtBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  districtBarLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  districtBarValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  changeDistrictBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changeDistrictBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
  },
  dateNoticeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  loadingBox: {
    padding: 36,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  priceCard: {
    marginBottom: 12,
    padding: 14,
  },
  priceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  commodityName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  varietyText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalPriceBadge: {
    alignItems: 'flex-end',
  },
  modalPriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  modalPriceUnit: {
    fontSize: 10,
    color: colors.textMuted,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priceRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rangeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  rangeDivider: {
    marginHorizontal: 8,
    color: colors.textMuted,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  districtItemActive: {
    backgroundColor: colors.successLight,
    borderRadius: 6,
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

export default MarketPricesScreen;
