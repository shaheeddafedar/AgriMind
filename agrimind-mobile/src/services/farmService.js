import api from './api';

export const farmService = {
  // Fetch farm data by ID (e.g. FARM101)
  getFarmById: async (farmId) => {
    const cleanId = (farmId || '').trim().toUpperCase();
    const response = await api.get(`/farm/${cleanId}`);
    return response.data;
  },

  // Seasonal weather fetches
  getSeasonalTemperature: async (state, city, season) => {
    const response = await api.get('/seasonal-temperature', {
      params: { state, city, season },
    });
    return response.data;
  },

  getSeasonalHumidity: async (state, city, season) => {
    const response = await api.get('/seasonal-humidity', {
      params: { state, city, season },
    });
    return response.data;
  },

  getHistoricalRainfall: async (state, city, season) => {
    const response = await api.get('/historical-rainfall', {
      params: { state, city, season },
    });
    return response.data;
  },

  // AI Crop Recommendation
  getRecommendation: async (payload) => {
    const response = await api.post('/recommend', payload);
    return response.data;
  },

  // Fertilizer Recommendation
  getFertilizerRecommendation: async (payload) => {
    const response = await api.post('/fertilizer/recommend', payload);
    return response.data;
  },

  // Smart Irrigation Check
  checkIrrigation: async (crop, moisture) => {
    const response = await api.post('/irrigation/check', {
      crop,
      moisture: Number(moisture),
    });
    return response.data;
  },

  // Market Prices
  getKarnatakaDistricts: async () => {
    const response = await api.get('/market-prices/districts');
    return response.data;
  },

  getMarketPrices: async (district) => {
    const response = await api.get('/market-prices', {
      params: { district },
    });
    return response.data;
  },

  // Recommendation History
  getRecentRecommendations: async (userId) => {
    if (!userId || typeof userId !== 'string' || userId === 'temp_user_id' || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return [];
    }
    const response = await api.get(`/recommend/${userId}`);
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await api.get('/analytics');
    return response.data;
  },

  getFeedback: async () => {
    const response = await api.get('/feedback');
    return response.data;
  },

  postFeedback: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  },


  // Platform Stats
  getHomeStats: async () => {
    const response = await api.get('/home-stats');
    return response.data;
  },

  // User Profile
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
};

export default farmService;
