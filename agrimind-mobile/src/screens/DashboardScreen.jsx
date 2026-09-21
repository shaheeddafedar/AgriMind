import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';

import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import useTranslation from '../i18n';
import farmService from '../services/farmService';

import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import AgriButton from '../components/common/AgriButton';
import AgriInput from '../components/common/AgriInput';
import ErrorMessage from '../components/common/ErrorMessage';
import ChatAssistantWidget from '../components/ChatAssistantWidget';

import colors from '../theme/colors';

// Bundled locations dataset from web
import statesCitiesData from '../../assets/data/indian-states-cities.json';

export const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { t } = useTranslation();



  const [mode, setMode] = useState('crop');
  // 'crop' | 'fertilizer'

  

  const [farmIdInput, setFarmIdInput] = useState('');
  const [isFetchingFarm, setIsFetchingFarm] = useState(false);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  

  const [formData, setFormData] = useState({
    farmId: '',
    soilPh: '',
    humidity: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    rainfall: '',
    area: '',
    city: '',
    state: '',
    season: '',
    pastCrop: '',
    fertilizerCrop: '',
  });


  const [availableCities, setAvailableCities] = useState([]);
  const [recentRecommendations, setRecentRecommendations] =
    useState([]);

  

  const [stateModalVisible, setStateModalVisible] =
    useState(false);

  const [cityModalVisible, setCityModalVisible] =
    useState(false);

  const [seasonModalVisible, setSeasonModalVisible] =
    useState(false);



  const seasonsList = [
    {
      value: 'Kharif',
      label: t(
        'kharif',
        'Kharif (Monsoon Season)'
      ),
    },
    {
      value: 'Rabi',
      label: t(
        'rabi',
        'Rabi (Winter Season)'
      ),
    },
    {
      value: 'Zaid',
      label: t(
        'zaid',
        'Zaid (Short Summer Season)'
      ),
    },
  ];


  const fetchRecent = async () => {
    if (
      !user?._id ||
      user._id === 'temp_user_id' ||
      !/^[0-9a-fA-F]{24}$/.test(user._id)
    ) {
      return;
    }

    try {
      const data =
        await farmService.getRecentRecommendations(
          user._id
        );

      setRecentRecommendations(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.warn(
        'Recent recommendations fetch error:',
        err
      );
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [user?._id]);



  const handleSelectState = (selectedState) => {
    const stateObj = statesCitiesData.find(
      (loc) => loc.state === selectedState
    );

    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      city: '',
      temperature: '',
      humidity: '',
      rainfall: '',
    }));

    setAvailableCities(
      stateObj ? stateObj.cities : []
    );

    setStateModalVisible(false);
  };



  const { state, city, season } = formData;

  useEffect(() => {
    const fetchWeather = async () => {
      if (!state || !city || !season) {
        return;
      }

      try {
        const [
          tempRes,
          humRes,
          rainRes,
        ] = await Promise.all([
          farmService.getSeasonalTemperature(
            state,
            city,
            season
          ),

          farmService.getSeasonalHumidity(
            state,
            city,
            season
          ),

          farmService.getHistoricalRainfall(
            state,
            city,
            season
          ),
        ]);

        setFormData((prev) => ({
          ...prev,

          temperature:
            tempRes?.success &&
            tempRes.temperature !== undefined
              ? String(tempRes.temperature)
              : prev.temperature,

          humidity:
            humRes?.success &&
            humRes.humidity !== undefined
              ? String(humRes.humidity)
              : prev.humidity,

          rainfall:
            rainRes?.success &&
            rainRes.rainfall !== undefined
              ? String(rainRes.rainfall)
              : prev.rainfall,
        }));
      } catch (err) {
        console.warn(
          'Weather auto-fetch error:',
          err
        );
      }
    };

    fetchWeather();
  }, [state, city, season]);



  const handleFetchFarm = async () => {
    const cleanId =
      farmIdInput.trim().toUpperCase();

    if (!cleanId) {
      Alert.alert(
        'Farm ID',
        'Please enter a valid Farm ID (e.g. FARM101)'
      );
      return;
    }

    setIsFetchingFarm(true);

    try {
      const data =
        await farmService.getFarmById(cleanId);

      if (data) {
        setFormData((prev) => ({
          ...prev,

          farmId: cleanId,

          soilPh:
            data.soilPh !== undefined
              ? String(data.soilPh)
              : prev.soilPh,

          nitrogen:
            data.nitrogen !== undefined
              ? String(data.nitrogen)
              : prev.nitrogen,

          phosphorus:
            data.phosphorus !== undefined
              ? String(data.phosphorus)
              : prev.phosphorus,

          potassium:
            data.potassium !== undefined
              ? String(data.potassium)
              : prev.potassium,
        }));

        Alert.alert(
          'Success',
          `Farm data for ${cleanId} retrieved and filled!`
        );
      }
    } catch (err) {
      if (err.response?.status === 404) {
        Alert.alert(
          'Not Found',
          'Farm ID not found. Please check and try again.'
        );
      } else {
        Alert.alert(
          'Error',
          'Unable to fetch farm details.'
        );
      }
    } finally {
      setIsFetchingFarm(false);
    }
  };


  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        t('error', 'Error'),
        t(
          'validation_login_required',
          'Please login to submit recommendations.'
        )
      );

      navigation.navigate('Login');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {

      if (mode === 'fertilizer') {
        if (!formData.fertilizerCrop.trim()) {
          setError(
            t(
              'validation_crop_name',
              'Please enter the crop name.'
            )
          );

          setIsSubmitting(false);
          return;
        }

        const payload = {
          crop: formData.fertilizerCrop.trim(),

          nitrogen:
            Number(formData.nitrogen) || 0,

          phosphorus:
            Number(formData.phosphorus) || 0,

          potassium:
            Number(formData.potassium) || 0,
        };

        const result =
          await farmService.getFertilizerRecommendation(
            payload
          );

        if (result && result.success) {
          navigation.navigate(
            'FertilizerResult',
            { result }
          );
        } else {
          setError(
            result?.message ||
              'Failed to get fertilizer recommendation.'
          );
        }
      }
      else {
        if (
          !formData.soilPh ||
          !formData.nitrogen ||
          !formData.phosphorus ||
          !formData.potassium ||
          !formData.area ||
          !formData.state ||
          !formData.city ||
          !formData.season
        ) {
          setError(
            t(
              'validation_required_fields',
              'Please fill in all required fields marked with *.'
            )
          );

          setIsSubmitting(false);
          return;
        }

        if (
          !user?._id ||
          user._id === 'temp_user_id'
        ) {
          setError(
            'Please log in to submit a crop recommendation request.'
          );

          setIsSubmitting(false);
          return;
        }

        const payload = {
          userId: user._id,

          soilPh:
            Number(formData.soilPh),

          humidity:
            Number(formData.humidity) || 50,

          nitrogen:
            Number(formData.nitrogen),

          phosphorus:
            Number(formData.phosphorus),

          potassium:
            Number(formData.potassium),

          temperature:
            Number(formData.temperature) || 25,

          area:
            Number(formData.area),

          rainfall:
            Number(formData.rainfall) || 200,

          season:
            formData.season,

          state:
            formData.state,

          city:
            formData.city,

          pastCrop:
            formData.pastCrop || '',
        };

        const result =
          await farmService.getRecommendation(
            payload
          );

        if (
          result &&
          result.recommendedCrop
        ) {
          fetchRecent();

          navigation.navigate(
            'Recommendation',
            { result }
          );
        } else {
          setError(
            'Failed to get a recommendation. Please check your inputs.'
          );
        }
      }
    } catch (err) {
      console.error(
        'Submission error:',
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          'An error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <View style={styles.container}>

    

      <AgriHeader
        title={t(
          'nav_dashboard',
          'Dashboard'
        )}
        subtitle={t(
          'dashboard_crop_mode_desc',
          'AI Crop & Fertilizer Advisory'
        )}
        showLanguage={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >


        <View
          style={
            styles.recommendationSelector
          }
        >
          <Text
            style={styles.selectorTitle}
          >
            {t(
              'recommendation_type',
              'What do you need?'
            )}
          </Text>

          <Text
            style={
              styles.selectorSubtitle
            }
          >
            {t(
              'recommendation_type_desc',
              'Choose an AI-powered farming recommendation'
            )}
          </Text>

          <View
            style={styles.modeContainer}
          >

        

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'crop' &&
                  styles.modeButtonActive,
              ]}
              onPress={() =>
                setMode('crop')
              }
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.modeIconBox,
                  mode === 'crop' &&
                    styles.modeIconBoxActive,
                ]}
              >
                <Text
                  style={styles.modeIcon}
                >
                  🌾
                </Text>
              </View>

              <View
                style={styles.modeTextCol}
              >
                <Text
                  style={[
                    styles.modeTitle,
                    mode === 'crop' &&
                      styles.modeTitleActive,
                  ]}
                >
                  {t(
                    'dashboard_crop_mode',
                    'Crop Recommendation'
                  )}
                </Text>

                <Text
                  style={[
                    styles.modeSubtitle,
                    mode === 'crop' &&
                      styles.modeSubtitleActive,
                  ]}
                >
                  {t(
                    'dashboard_crop_mode_desc',
                    'Find the best crop for your farm'
                  )}
                </Text>
              </View>

              {mode === 'crop' && (
                <View
                  style={
                    styles.selectedCheck
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>

            {/* =========================================
                FERTILIZER RECOMMENDATION
            ========================================= */}

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode ===
                  'fertilizer' &&
                  styles.modeButtonActive,
              ]}
              onPress={() =>
                setMode('fertilizer')
              }
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.modeIconBox,
                  mode ===
                    'fertilizer' &&
                    styles.modeIconBoxActive,
                ]}
              >
                <Text
                  style={styles.modeIcon}
                >
                  🧪
                </Text>
              </View>

              <View
                style={styles.modeTextCol}
              >
                <Text
                  style={[
                    styles.modeTitle,
                    mode ===
                      'fertilizer' &&
                      styles.modeTitleActive,
                  ]}
                >
                  {t(
                    'dashboard_fertilizer_mode',
                    'Fertilizer Recommendation'
                  )}
                </Text>

                <Text
                  style={[
                    styles.modeSubtitle,
                    mode ===
                      'fertilizer' &&
                      styles.modeSubtitleActive,
                  ]}
                >
                  {t(
                    'dashboard_fertilizer_mode_desc',
                    'Find the right fertilizer for your crop'
                  )}
                </Text>
              </View>

              {mode ===
                'fertilizer' && (
                <View
                  style={
                    styles.selectedCheck
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </TouchableOpacity>

          </View>
        </View>


        <AgriCard
          style={styles.formCard}
        >

          <Text
            style={
              styles.sectionHeading
            }
          >
            {mode === 'crop'
              ? t(
                  'dashboard_crop_title',
                  'Get a New Crop Recommendation'
                )
              : t(
                  'dashboard_fertilizer_title',
                  'Get a New Fertilizer Recommendation'
                )}
          </Text>

          <Text
            style={
              styles.sectionSubheading
            }
          >
            {mode === 'crop'
              ? t(
                  'dashboard_crop_desc',
                  'Fill in the details below to get an AI-powered crop suggestion.'
                )
              : t(
                  'dashboard_fertilizer_desc',
                  'Enter your crop and soil nutrient values to get a customized fertilizer plan.'
                )}
          </Text>

          <ErrorMessage
            message={error}
          />

       

          <View
            style={
              styles.farmFetchBlock
            }
          >
            <Text
              style={
                styles.fetchLabel
              }
            >
              {t(
                'farm_id_fetch',
                'Have a Farm Land ID? Fetch Details'
              )}
            </Text>

            <View
              style={styles.fetchRow}
            >
              <AgriInput
                placeholder={t(
                  'farm_id_placeholder',
                  'e.g., FARM101'
                )}
                value={
                  farmIdInput
                }
                onChangeText={
                  setFarmIdInput
                }
                autoCapitalize="characters"
                style={{
                  flex: 1,
                  marginBottom: 0,
                }}
              />

              <AgriButton
                title={t(
                  'fetch',
                  'Fetch'
                )}
                variant="secondary"
                onPress={
                  handleFetchFarm
                }
                loading={
                  isFetchingFarm
                }
                style={
                  styles.fetchBtn
                }
              />
            </View>
          </View>

          
          {mode === 'fertilizer' && (
            <AgriInput
              label={`${t(
                'fertilizer_crop',
                'Crop'
              )} *`}
              placeholder={t(
                'fertilizer_crop_placeholder',
                'e.g., Tomato'
              )}
              value={
                formData.fertilizerCrop
              }
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  fertilizerCrop:
                    text,
                })
              }
              icon={
                <FontAwesome5
                  name="seedling"
                  size={16}
                  color={
                    colors.textMuted
                  }
                />
              }
            />
          )}


          <View
            style={styles.formRow}
          >
            <AgriInput
              label={`${t(
                'nitrogen',
                'Nitrogen (kg/ha)'
              )} *`}
              placeholder="e.g. 90"
              value={
                formData.nitrogen
              }
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  nitrogen: text,
                })
              }
              keyboardType="numeric"
              style={{
                flex: 1,
                marginRight: 8,
              }}
            />

            <AgriInput
              label={`${t(
                'phosphorus',
                'Phosphorus (0-150 kg/ha)'
              )} *`}
              placeholder="e.g. 42"
              value={
                formData.phosphorus
              }
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  phosphorus: text,
                })
              }
              keyboardType="numeric"
              style={{
                flex: 1,
              }}
            />
          </View>

         
          <View
            style={styles.formRow}
          >
            <AgriInput
              label={`${t(
                'potassium',
                'Potassium (0-200 kg/ha)'
              )} *`}
              placeholder="e.g. 43"
              value={
                formData.potassium
              }
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  potassium: text,
                })
              }
              keyboardType="numeric"
              style={{
                flex: 1,
                marginRight: 8,
              }}
            />

            {mode === 'crop' && (
              <AgriInput
                label={`${t(
                  'soil_ph',
                  'Soil pH (0-14)'
                )} *`}
                placeholder="e.g. 6.5"
                value={
                  formData.soilPh
                }
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    soilPh: text,
                  })
                }
                keyboardType="numeric"
                style={{
                  flex: 1,
                }}
              />
            )}
          </View>


          {mode === 'crop' && (
            <>
              {/* LOCATION */}

              <View
                style={styles.formRow}
              >

                {/* STATE */}

                <View
                  style={{
                    flex: 1,
                    marginRight: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={
                      styles.selectorLabel
                    }
                  >
                    {t(
                      'state',
                      'State'
                    )}{' '}
                    *
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.pickerBox
                    }
                    onPress={() =>
                      setStateModalVisible(
                        true
                      )
                    }
                  >
                    <Text
                      style={
                        formData.state
                          ? styles.pickerSelectedText
                          : styles.pickerPlaceholderText
                      }
                      numberOfLines={1}
                    >
                      {formData.state ||
                        t(
                          'select_state',
                          'Select State'
                        )}
                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={
                        colors.textMuted
                      }
                    />
                  </TouchableOpacity>
                </View>

                {/* CITY */}

                <View
                  style={{
                    flex: 1,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={
                      styles.selectorLabel
                    }
                  >
                    {t(
                      'city',
                      'City'
                    )}{' '}
                    *
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.pickerBox,
                      !formData.state &&
                        styles.pickerDisabled,
                    ]}
                    onPress={() =>
                      formData.state &&
                      setCityModalVisible(
                        true
                      )
                    }
                    disabled={
                      !formData.state
                    }
                  >
                    <Text
                      style={
                        formData.city
                          ? styles.pickerSelectedText
                          : styles.pickerPlaceholderText
                      }
                      numberOfLines={1}
                    >
                      {formData.city ||
                        t(
                          'select_city',
                          'Select City'
                        )}
                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={
                        colors.textMuted
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* SEASON + AREA */}

              <View
                style={styles.formRow}
              >

                {/* SEASON */}

                <View
                  style={{
                    flex: 1,
                    marginRight: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={
                      styles.selectorLabel
                    }
                  >
                    {t(
                      'season',
                      'Season'
                    )}{' '}
                    *
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.pickerBox
                    }
                    onPress={() =>
                      setSeasonModalVisible(
                        true
                      )
                    }
                  >
                    <Text
                      style={
                        formData.season
                          ? styles.pickerSelectedText
                          : styles.pickerPlaceholderText
                      }
                      numberOfLines={1}
                    >
                      {formData.season
                        ? seasonsList.find(
                            (s) =>
                              s.value ===
                              formData.season
                          )?.label ||
                          formData.season
                        : t(
                            'select_season',
                            'Select Season'
                          )}
                    </Text>

                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={
                        colors.textMuted
                      }
                    />
                  </TouchableOpacity>
                </View>

                {/* AREA */}

                <AgriInput
                  label={`${t(
                    'area',
                    'Area (hectares)'
                  )} *`}
                  placeholder="e.g. 2.5"
                  value={
                    formData.area
                  }
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      area: text,
                    })
                  }
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                  }}
                />
              </View>

              {/* WEATHER INFO */}

              <View
                style={
                  styles.weatherInfoBanner
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={colors.info}
                  style={{
                    marginRight: 6,
                  }}
                />

                <Text
                  style={
                    styles.weatherBannerText
                  }
                >
                  Weather values auto-fill
                  when State, City, and
                  Season are picked.
                </Text>
              </View>

              {/* WEATHER ROW 1 */}

              <View
                style={styles.formRow}
              >
                <AgriInput
                  label={t(
                    'temperature',
                    'Temperature (°C)'
                  )}
                  placeholder="Auto / Manual"
                  value={
                    formData.temperature
                  }
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      temperature:
                        text,
                    })
                  }
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    marginRight: 8,
                  }}
                />

                <AgriInput
                  label={t(
                    'humidity',
                    'Humidity (%)'
                  )}
                  placeholder="Auto / Manual"
                  value={
                    formData.humidity
                  }
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      humidity: text,
                    })
                  }
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                  }}
                />
              </View>

              {/* WEATHER ROW 2 */}

              <View
                style={styles.formRow}
              >
                <AgriInput
                  label={t(
                    'rainfall',
                    'Annual Rainfall (0-5000 mm)'
                  )}
                  placeholder="Auto / Manual"
                  value={
                    formData.rainfall
                  }
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      rainfall: text,
                    })
                  }
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    marginRight: 8,
                  }}
                />

                <AgriInput
                  label={t(
                    'past_crop',
                    'Past Crop Grown'
                  )}
                  placeholder={t(
                    'past_crop_placeholder',
                    'e.g., Wheat'
                  )}
                  value={
                    formData.pastCrop
                  }
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      pastCrop: text,
                    })
                  }
                  style={{
                    flex: 1,
                  }}
                />
              </View>
            </>
          )}


          <AgriButton
            title={
              isSubmitting
                ? t(
                    'processing',
                    'Processing...'
                  )
                : mode === 'crop'
                ? t(
                    'get_crop_recommendation',
                    'Get Crop Recommendation'
                  )
                : t(
                    'get_fertilizer_recommendation',
                    'Get Fertilizer Recommendation'
                  )
            }
            onPress={handleSubmit}
            loading={isSubmitting}
            icon={
              <FontAwesome5
                name={
                  mode === 'crop'
                    ? 'brain'
                    : 'flask'
                }
                size={16}
                color="#FFFFFF"
              />
            }
            style={
              styles.recommendationButton
            }
          />
        </AgriCard>


        <AgriCard
          style={styles.historyCard}
        >
          <View
            style={
              styles.historyCardHeader
            }
          >
            <FontAwesome5
              name="history"
              size={15}
              color={colors.primary}
              style={{
                marginRight: 8,
              }}
            />

            <Text
              style={
                styles.historyTitle
              }
            >
              {t(
                'recent_recommendations',
                'Recent Recommendations'
              )}
            </Text>
          </View>

          {recentRecommendations.length >
          0 ? (
            recentRecommendations.map(
              (rec) => (
                <TouchableOpacity
                  key={rec._id}
                  style={
                    styles.recItem
                  }
                  onPress={() =>
                    navigation.navigate(
                      'HistoryDetail',
                      {
                        recId:
                          rec._id,
                      }
                    )
                  }
                  activeOpacity={0.7}
                >
                  <View>
                    <Text
                      style={
                        styles.recCropName
                      }
                    >
                      {rec.recommendedCrop
                        ? rec.recommendedCrop
                            .charAt(0)
                            .toUpperCase() +
                          rec.recommendedCrop
                            .slice(1)
                            .toLowerCase()
                        : 'Crop'}
                    </Text>

                    <Text
                      style={
                        styles.recDateText
                      }
                    >
                      {new Date(
                        rec.createdAt
                      ).toLocaleDateString(
                        'en-IN',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.recRight
                    }
                  >
                    <Text
                      style={
                        styles.recPhText
                      }
                    >
                      pH{' '}
                      {rec.soilPh ||
                        'N/A'}
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={
                        colors.textMuted
                      }
                    />
                  </View>
                </TouchableOpacity>
              )
            )
          ) : (
            <Text
              style={
                styles.emptyHistoryText
              }
            >
              {t(
                'no_recent_history',
                'No recent history found.'
              )}
            </Text>
          )}
        </AgriCard>


        <ChatAssistantWidget />

      </ScrollView>

      <Modal
        visible={stateModalVisible}
        transparent
        animationType="slide"
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContent
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                {t(
                  'select_state',
                  'Select State'
                )}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setStateModalVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={
                    colors.textPrimary
                  }
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{
                maxHeight: 380,
              }}
            >
              {statesCitiesData.map(
                (item) => (
                  <TouchableOpacity
                    key={item.state}
                    style={[
                      styles.modalListItem,
                      formData.state ===
                        item.state &&
                        styles.modalListItemActive,
                    ]}
                    onPress={() =>
                      handleSelectState(
                        item.state
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.modalListText,
                        formData.state ===
                          item.state &&
                          styles.modalListTextActive,
                      ]}
                    >
                      {item.state}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>


      <Modal
        visible={cityModalVisible}
        transparent
        animationType="slide"
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContent
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                {t(
                  'select_city',
                  'Select City'
                )}
                {formData.state
                  ? ` (${formData.state})`
                  : ''}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setCityModalVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={
                    colors.textPrimary
                  }
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{
                maxHeight: 380,
              }}
            >
              {availableCities.map(
                (c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.modalListItem,
                      formData.city ===
                        c &&
                        styles.modalListItemActive,
                    ]}
                    onPress={() => {
                      setFormData({
                        ...formData,
                        city: c,
                      });

                      setCityModalVisible(
                        false
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.modalListText,
                        formData.city ===
                          c &&
                          styles.modalListTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>


      <Modal
        visible={seasonModalVisible}
        transparent
        animationType="slide"
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.modalContent
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                {t(
                  'select_season',
                  'Select Season'
                )}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setSeasonModalVisible(
                    false
                  )
                }
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={
                    colors.textPrimary
                  }
                />
              </TouchableOpacity>
            </View>

            {seasonsList.map(
              (s) => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.modalListItem,
                    formData.season ===
                      s.value &&
                      styles.modalListItemActive,
                  ]}
                  onPress={() => {
                    setFormData({
                      ...formData,
                      season:
                        s.value,
                    });

                    setSeasonModalVisible(
                      false
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.modalListText,
                      formData.season ===
                        s.value &&
                        styles.modalListTextActive,
                    ]}
                  >
                    {s.label}
                  </Text>
                </TouchableOpacity>
              )
            )}
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
    padding: 16,
    paddingBottom: 40,
  },



  recommendationSelector: {
    marginBottom: 20,
  },

  selectorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },

  selectorSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 17,
  },

  modeContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  modeButton: {
    flex: 1,
    minHeight: 112,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    padding: 12,

    borderWidth: 1.5,
    borderColor: '#E2E8E2',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,

    elevation: 2,

    position: 'relative',
  },

  modeButtonActive: {
    backgroundColor: '#F0F9F1',

    borderColor: colors.primary,
    borderWidth: 2,

    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 8,

    elevation: 4,
  },

  modeIconBox: {
    width: 44,
    height: 44,

    borderRadius: 13,

    backgroundColor: '#F4F7F4',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 9,
  },

  modeIconBoxActive: {
    backgroundColor: '#DDF1DF',
  },

  modeIcon: {
    fontSize: 23,
  },

  modeTextCol: {
    flex: 1,
  },

  modeTitle: {
    fontSize: 13,
    fontWeight: '800',

    color: '#263326',

    lineHeight: 17,
  },

  modeTitleActive: {
    color: '#1B7A32',
  },

  modeSubtitle: {
    fontSize: 10.5,

    color: '#7A887A',

    lineHeight: 14,

    marginTop: 3,
  },

  modeSubtitleActive: {
    color: '#47704D',
  },

  selectedCheck: {
    position: 'absolute',

    top: 9,
    right: 9,

    width: 22,
    height: 22,

    borderRadius: 11,

    backgroundColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  

  formCard: {
    padding: 22,
    borderRadius: 12,
  },

  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',

    color: colors.primary,

    marginBottom: 6,
  },

  sectionSubheading: {
    fontSize: 13,

    color: colors.textSecondary,

    marginBottom: 20,

    lineHeight: 18,
  },

  

  farmFetchBlock: {
    backgroundColor: '#F9F9F9',

    borderRadius: 10,

    padding: 16,

    borderWidth: 1,
    borderColor: '#EEEEEE',

    marginBottom: 20,
  },

  fetchLabel: {
    fontSize: 13,

    fontWeight: '600',

    color: colors.textPrimary,

    marginBottom: 10,
  },

  fetchRow: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,
  },

  fetchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },


  formRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  

  selectorLabel: {
    fontSize: 13,

    fontWeight: '600',

    color: colors.textPrimary,

    marginBottom: 6,
  },

  pickerBox: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: colors.inputBorder,

    borderRadius: 8,

    paddingHorizontal: 12,

    height: 46,
  },

  pickerDisabled: {
    backgroundColor: '#F1F5F9',
  },

  pickerSelectedText: {
    fontSize: 13,

    color: colors.textPrimary,

    fontWeight: '500',

    flex: 1,
  },

  pickerPlaceholderText: {
    fontSize: 13,

    color: '#94A3B8',

    flex: 1,
  },


  weatherInfoBanner: {
    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#EFF6FF',

    padding: 10,

    borderRadius: 8,

    marginBottom: 14,
  },

  weatherBannerText: {
    fontSize: 11,

    color: '#1E40AF',

    flex: 1,

    lineHeight: 15,
  },

  
  recommendationButton: {
    marginTop: 12,

    minHeight: 52,
  },


  historyCard: {
    padding: 20,

    borderRadius: 10,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },

  historyCardHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    borderBottomWidth: 2,

    borderBottomColor:
      colors.primary,

    paddingBottom: 10,

    marginBottom: 14,
  },

  historyTitle: {
    fontSize: 16,

    fontWeight: '700',

    color: colors.textPrimary,
  },

  recItem: {
    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#E0E0E0',

    borderRadius: 8,

    padding: 12,

    marginBottom: 10,

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',
  },

  recCropName: {
    fontSize: 15,

    fontWeight: '700',

    color: colors.primary,

    marginBottom: 4,
  },

  recDateText: {
    fontSize: 12,

    color: '#777777',

    marginTop: 2,
  },

  recRight: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,
  },

  recPhText: {
    fontSize: 12,

    color: colors.textSecondary,
  },

  emptyHistoryText: {
    fontSize: 12,

    color: colors.textMuted,

    fontStyle: 'italic',
  },

 

  modalOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(0,0,0,0.5)',

    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 20,

    borderTopRightRadius: 20,

    padding: 20,

    maxHeight: '80%',
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

  modalListItem: {
    paddingVertical: 12,

    paddingHorizontal: 8,

    borderBottomWidth: 1,

    borderBottomColor: '#F1F5F9',
  },

  modalListItemActive: {
    backgroundColor:
      colors.successLight,

    borderRadius: 6,
  },

  modalListText: {
    fontSize: 14,

    color: colors.textPrimary,
  },

  modalListTextActive: {
    color: colors.primary,

    fontWeight: '700',
  },
});

export default DashboardScreen;