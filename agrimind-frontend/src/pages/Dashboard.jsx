import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import api from '../services/api';
import ChatAssistant from '../components/ChatAssistant';
import '../assets/css/dashboard.css';

const Dashboard = ({ user }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [mode, setMode] = useState('crop');

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
        fertilizerCrop: ''
    });

    const [locationsData, setLocationsData] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);
    const [recentRecommendations, setRecentRecommendations] = useState([]);

    const [isFetchingFarm, setIsFetchingFarm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get('/data/indian-states-cities.json');
                setLocationsData(response.data);
            } catch (error) {
                console.error('Failed to fetch locations:', error);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchRecent = async () => {
            if (!user?._id) return;

            try {
                const response = await api.get(`/recommend/${user._id}`);
                setRecentRecommendations(response.data || []);
            } catch (error) {
                console.error('Error fetching recent recommendations:', error);
            }
        };

        fetchRecent();
    }, [user]);

    const handleStateChange = (e) => {
        const selectedState = e.target.value;

        setFormData(prev => ({
            ...prev,
            state: selectedState,
            city: '',
            temperature: '',
            humidity: '',
            rainfall: ''
        }));

        const stateObj = locationsData.find(
            location => location.state === selectedState
        );

        setAvailableCities(stateObj ? stateObj.cities : []);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const { state, city, season } = formData;

    useEffect(() => {
        const fetchWeather = async () => {
            if (!state || !city || !season) return;

            try {
                const tempRes = await api.get('/seasonal-temperature', {
                    params: {
                        state,
                        city,
                        season
                    }
                });

                if (tempRes.data.success) {
                    setFormData(prev => ({
                        ...prev,
                        temperature: tempRes.data.temperature
                    }));
                }

                const humRes = await api.get('/seasonal-humidity', {
                    params: {
                        state,
                        city,
                        season
                    }
                });

                if (humRes.data.success) {
                    setFormData(prev => ({
                        ...prev,
                        humidity: humRes.data.humidity
                    }));
                }

                const rainRes = await api.get('/historical-rainfall', {
                    params: {
                        state,
                        city,
                        season
                    }
                });

                if (rainRes.data.success) {
                    setFormData(prev => ({
                        ...prev,
                        rainfall: rainRes.data.rainfall
                    }));
                }
            } catch (error) {
                console.error('Weather fetch error:', error);
                alert('Unable to fetch some weather data. Please enter manually if needed.');
            }
        };

        fetchWeather();
    }, [state, city, season]);

    const handleFetchFarm = async () => {
        const farmId = formData.farmId.trim().toUpperCase();

        if (!farmId) {
            alert('Please enter a Farm ID.');
            return;
        }

        setIsFetchingFarm(true);

        try {
            const response = await api.get(`/farm/${farmId}`);
            const data = response.data;

            setFormData(prev => ({
                ...prev,
                soilPh: data.soilPh || '',
                nitrogen: data.nitrogen || '',
                phosphorus: data.phosphorus || '',
                potassium: data.potassium || ''
            }));
        } catch (error) {
            if (error.response?.status === 404) {
                alert('Farm ID not found. Please check the ID and try again.');
            } else {
                alert('Failed to fetch farm data.');
            }
        } finally {
            setIsFetchingFarm(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Error: User session not found. Please log in again.');
            return;
        }

        setIsSubmitting(true);

        try {
            if (mode === 'fertilizer') {
                if (!formData.fertilizerCrop) {
                    alert('Please enter the crop name.');
                    setIsSubmitting(false);
                    return;
                }

                const payload = {
                    crop: formData.fertilizerCrop.trim(),
                    nitrogen: formData.nitrogen,
                    phosphorus: formData.phosphorus,
                    potassium: formData.potassium
                };

                const response = await api.post(
                    '/fertilizer/recommend',
                    payload
                );

                if (response.data.success) {
                    localStorage.removeItem('recommendationResult');

                    localStorage.setItem(
                        'fertilizerRecommendationResult',
                        JSON.stringify(response.data)
                    );

                    navigate('/recommend');
                } else {
                    alert(
                        response.data.message ||
                        'Failed to get fertilizer recommendation.'
                    );
                }
            } else {
                const payload = {
                    userId: user._id,
                    soilPh: formData.soilPh,
                    humidity: formData.humidity,
                    nitrogen: formData.nitrogen,
                    phosphorus: formData.phosphorus,
                    potassium: formData.potassium,
                    temperature: formData.temperature,
                    area: formData.area,
                    rainfall: formData.rainfall,
                    season: formData.season,
                    state: formData.state,
                    city: formData.city,
                    pastCrop: formData.pastCrop
                };

                const response = await api.post('/recommend', payload);

                if (response.data) {
                    localStorage.removeItem(
                        'fertilizerRecommendationResult'
                    );

                    localStorage.setItem(
                        'recommendationResult',
                        JSON.stringify(response.data)
                    );

                    navigate('/recommend');
                } else {
                    alert(
                        'Failed to get a recommendation. Please try again.'
                    );
                }
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <main className="container">
            <div className="dashboard-grid">
                <section className="main-content">
                    <div className="recommendation-mode">
                        <button
                            type="button"
                            id="crop-mode-btn"
                            className={`recommendation-mode-btn ${
                                mode === 'crop' ? 'active' : ''
                            }`}
                            onClick={() => setMode('crop')}
                        >
                            <span className="mode-icon">🌾</span>

                            <span className="mode-content">
                                <strong>{t('dashboard_crop_mode', 'Crop Recommendation')}</strong>
                                <small>
                                    {t('dashboard_crop_mode_desc', 'Find the best crop for your farm')}
                                </small>
                            </span>
                        </button>

                        <button
                            type="button"
                            id="fertilizer-mode-btn"
                            className={`recommendation-mode-btn ${
                                mode === 'fertilizer' ? 'active' : ''
                            }`}
                            onClick={() => setMode('fertilizer')}
                        >
                            <span className="mode-icon">🧪</span>

                            <span className="mode-content">
                                <strong>{t('dashboard_fertilizer_mode', 'Fertilizer Recommendation')}</strong>
                                <small>
                                    {t('dashboard_fertilizer_mode_desc', 'Find the right fertilizer for your crop')}
                                </small>
                            </span>
                        </button>
                    </div>

                    <br />

                    <h2 id="recommendation-title">
                        {mode === 'crop'
                            ? t('dashboard_crop_title', 'Get a New Crop Recommendation')
                            : t('dashboard_fertilizer_title', 'Get a New Fertilizer Recommendation')}
                    </h2>

                    <p id="recommendation-description">
                        {mode === 'crop'
                            ? t('dashboard_crop_desc', 'Fill in the details below to get an AI-powered crop suggestion.')
                            : t('dashboard_fertilizer_desc', 'Fill in the details below to get an AI-powered fertilizer recommendation.')}
                    </p>

                    <div className="farm-id-fetch">
                        <div className="form-group">
                            <label htmlFor="farmId">
                                {t('farm_id_fetch', 'Have a Farm Land ID? Fetch Details')}
                            </label>

                            <div className="input-with-button">
                                <input
                                    type="text"
                                    id="farmId"
                                    placeholder={t('farm_id_placeholder', 'e.g., FARM101')}
                                    value={formData.farmId}
                                    onChange={handleInputChange}
                                />

                                <button
                                    type="button"
                                    id="fetch-farm-details-btn"
                                    className="btn btn-secondary"
                                    onClick={handleFetchFarm}
                                    disabled={isFetchingFarm}
                                >
                                    {isFetchingFarm
                                        ? t('fetching', 'Fetching...')
                                        : t('fetch', 'Fetch')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <form
                        id="recommendation-form"
                        className="form-grid"
                        onSubmit={handleSubmit}
                    >
                        <div
                            className="form-group crop-only-field"
                            style={{ display: mode === 'crop' ? '' : 'none' }}
                        >
                            <label htmlFor="soilPh">
                                {t('soil_ph', 'Soil pH (0-14)')}
                            </label>

                            <input
                                type="number"
                                id="soilPh"
                                step="0.1"
                                min="0"
                                max="14"
                                required={mode === 'crop'}
                                value={formData.soilPh}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div
                            className="form-group crop-only-field"
                            style={{ display: mode === 'crop' ? '' : 'none' }}
                        >
                            <label htmlFor="humidity">
                                {t('humidity', 'Humidity (%)')}
                            </label>

                            <input
                                type="number"
                                id="humidity"
                                min="0"
                                max="100"
                                step="0.01"
                                required={mode === 'crop'}
                                disabled
                                value={formData.humidity}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="nitrogen">
                                {t('nitrogen', 'Nitrogen (kg/ha)')}
                            </label>

                            <input
                                type="number"
                                id="nitrogen"
                                min="0"
                                required
                                value={formData.nitrogen}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phosphorus">
                                {t('phosphorus', 'Phosphorus (0-150 kg/ha)')}
                            </label>

                            <input
                                type="number"
                                id="phosphorus"
                                min="0"
                                required
                                value={formData.phosphorus}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="potassium">
                                {t('potassium', 'Potassium (0-200 kg/ha)')}
                            </label>

                            <input
                                type="number"
                                id="potassium"
                                min="0"
                                required
                                value={formData.potassium}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div
                            className="form-group crop-only-field"
                            style={{ display: mode === 'crop' ? '' : 'none' }}
                        >
                            <label htmlFor="temperature">
                                {t('temperature', 'Temperature (°C)')}
                            </label>

                            <input
                                type="number"
                                id="temperature"
                                min="1"
                                max="75"
                                required={mode === 'crop'}
                                disabled
                                value={formData.temperature}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div
                            className="form-group crop-only-field"
                            style={{ display: mode === 'crop' ? '' : 'none' }}
                        >
                            <label htmlFor="rainfall">
                                {t('rainfall', 'Annual Rainfall (0-5000 mm)')}
                            </label>

                            <input
                                type="number"
                                id="rainfall"
                                min="0"
                                max="5000"
                                required={mode === 'crop'}
                                disabled
                                value={formData.rainfall}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div
                            className="form-group crop-only-field"
                            style={{ display: mode === 'crop' ? '' : 'none' }}
                        >
                            <label htmlFor="area">
                                {t('area', 'Area (hectares)')}
                            </label>

                            <input
                                type="number"
                                id="area"
                                step="0.1"
                                min="0.1"
                                required={mode === 'crop'}
                                value={formData.area}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div
                            className="form-group crop-only-field"
                            style={{ display: mode === 'crop' ? '' : 'none' }}
                        >
                            <label htmlFor="city">
                                {t('city', 'City')}
                            </label>

                            <select
                                id="city"
                                required={mode === 'crop'}
                                disabled={!formData.state}
                                value={formData.city}
                                onChange={handleInputChange}
                            >
                                <option value="">
                                    {t('select_city', 'Select City')}
                                </option>

                                {availableCities.map(city => (
                                    <option
                                        key={city}
                                        value={city}
                                    >
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div
                            className="form-group crop-only-field"
                            style={{ display: mode === 'crop' ? '' : 'none' }}
                        >
                            <label htmlFor="state">
                                {t('state', 'State')}
                            </label>

                            <select
                                id="state"
                                required={mode === 'crop'}
                                value={formData.state}
                                onChange={handleStateChange}
                            >
                                <option value="">
                                    {t('select_state', 'Select State')}
                                </option>

                                {locationsData.map(location => (
                                    <option
                                        key={location.state}
                                        value={location.state}
                                    >
                                        {location.state}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div
                            className="form-group crop-only-field"
                            style={{ display: mode === 'crop' ? '' : 'none' }}
                        >
                            <label htmlFor="season">
                                {t('season', 'Season')}
                            </label>

                            <select
                                id="season"
                                required={mode === 'crop'}
                                value={formData.season}
                                onChange={handleInputChange}
                            >
                                <option value="">
                                    {t('select_season', 'Select Season')}
                                </option>

                                <option value="Kharif">
                                    {t('kharif', 'Kharif (Monsoon Season)')}
                                </option>

                                <option value="Rabi">
                                    {t('rabi', 'Rabi (Winter Season)')}
                                </option>

                                <option value="Zaid">
                                    {t('zaid', 'Zaid (Short Summer Season)')}
                                </option>
                            </select>
                        </div>

                        <div
                            className="form-group crop-only-field"
                            style={{ display: mode === 'crop' ? '' : 'none' }}
                        >
                            <label htmlFor="pastCrop">
                                {t('past_crop', 'Past Crop Grown')}
                            </label>

                            <input
                                type="text"
                                id="pastCrop"
                                placeholder={t('past_crop_placeholder', 'e.g., Wheat')}
                                value={formData.pastCrop}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div
                            className="form-group fertilizer-only-field"
                            id="fertilizer-crop-field"
                            style={{ display: mode === 'fertilizer' ? '' : 'none' }}
                        >
                            <label htmlFor="fertilizerCrop">
                                {t('fertilizer_crop', 'Crop')}
                            </label>

                            <input
                                type="text"
                                id="fertilizerCrop"
                                placeholder={t('fertilizer_crop_placeholder', 'e.g., Tomato')}
                                required={mode === 'fertilizer'}
                                value={formData.fertilizerCrop}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group full-width">
                            <button
                                type="submit"
                                className="btn"
                                id="recommendation-submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? t('processing', 'Processing...')
                                    : mode === 'crop'
                                    ? t('get_crop_recommendation', 'Get Crop Recommendation')
                                    : t('get_fertilizer_recommendation', 'Get Fertilizer Recommendation')}
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="sidebar">
                    <div className="sidebar-widget">
                        <h3>
                            <i className="fas fa-history"></i>
                            {' '}{t('recent_recommendations', 'Recent Recommendations')}
                        </h3>

                        <div id="recent-recommendations">
                            {recentRecommendations.length > 0 ? (
                                recentRecommendations.map(rec => (
                                    <div
                                        key={rec._id}
                                        className="recommendation-card"
                                    >
                                        <strong>
                                            {rec.recommendedCrop
                                                .charAt(0)
                                                .toUpperCase() +
                                                rec.recommendedCrop
                                                    .slice(1)
                                                    .toLowerCase()}
                                        </strong>

                                        <span>
                                            {new Date(
                                                rec.createdAt
                                            ).toLocaleDateString(
                                                'en-IN',
                                                {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }
                                            )}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p>{t('no_recent_history', 'No recent history found.')}</p>
                            )}
                        </div>
                    </div>

                    <ChatAssistant />
                </aside>
            </div>
        </main>
    );
};

export default Dashboard;