import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import '../assets/css/smart-irrigation.css';

const SmartIrrigation = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        crop: '',
        moisture: ''
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const crops = [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'barley', label: 'Barley' },
        { value: 'blackgram', label: 'Blackgram' },
        { value: 'blackpepper', label: 'Black Pepper' },
        { value: 'brinjal', label: 'Brinjal' },
        { value: 'cabbage', label: 'Cabbage' },
        { value: 'cardamom', label: 'Cardamom' },
        { value: 'cauliflower', label: 'Cauliflower' },
        { value: 'chickpea', label: 'Chickpea' },
        { value: 'coconut', label: 'Coconut' },
        { value: 'coffee', label: 'Coffee' },
        { value: 'coriander', label: 'Coriander' },
        { value: 'cotton', label: 'Cotton' },
        { value: 'garlic', label: 'Garlic' },
        { value: 'grapes', label: 'Grapes' },
        { value: 'horsegram', label: 'Horsegram' },
        { value: 'jute', label: 'Jute' },
        { value: 'kidneybeans', label: 'Kidney Beans' },
        { value: 'lentil', label: 'Lentil' },
        { value: 'maize', label: 'Maize' },
        { value: 'mango', label: 'Mango' },
        { value: 'mothbeans', label: 'Moth Beans' },
        { value: 'mungbean', label: 'Mung Bean' },
        { value: 'muskmelon', label: 'Muskmelon' },
        { value: 'okra', label: 'Okra' },
        { value: 'onion', label: 'Onion' },
        { value: 'orange', label: 'Orange' },
        { value: 'papaya', label: 'Papaya' },
        { value: 'pigeonpeas', label: 'Pigeon Peas' },
        { value: 'pomegranate', label: 'Pomegranate' },
        { value: 'potato', label: 'Potato' },
        { value: 'ragi', label: 'Ragi' },
        { value: 'rapeseed', label: 'Rapeseed' },
        { value: 'rice', label: 'Rice' },
        { value: 'sorghum', label: 'Sorghum' },
        { value: 'soybean', label: 'Soybean' },
        { value: 'sunflower', label: 'Sunflower' },
        { value: 'sweet_potato', label: 'Sweet Potato' },
        { value: 'tomato', label: 'Tomato' },
        { value: 'turmeric', label: 'Turmeric' },
        { value: 'watermelon', label: 'Watermelon' },
        { value: 'wheat', label: 'Wheat' }
    ];

    const handleCropChange = (e) => {
        setFormData({
            ...formData,
            crop: e.target.value
        });
    };

    const handleMoistureChange = (e) => {
        setFormData({
            ...formData,
            moisture: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setResult(null);

        try {
            const response = await api.post(
                '/irrigation/check',
                formData
            );

            if (response.data.success) {
                setResult(response.data);
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                'Unable to check irrigation.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page-content">
            <div className="page-header irrigation-page-header">
                <div className="container">
                    <h1>
                        <i className="fas fa-tint irrigation-title-icon"></i>
                        {' '}{t('irrigation_title', 'Smart Irrigation')}
                    </h1>

                    <p>
                        {t('irrigation_desc', 'Monitor soil moisture and determine whether irrigation is required.')}
                    </p>
                </div>
            </div>

            <div className="container irrigation-content">
                <div className="irrigation-card">
                    <div className="irrigation-card-header">
                        <i className="fas fa-water"></i>

                        <div>
                            <h2>
                                {t('irrigation_check_title', 'Check Irrigation Requirement')}
                            </h2>

                            <p>
                                {t('irrigation_check_desc', 'Enter the crop and current soil moisture level.')}
                            </p>
                        </div>
                    </div>

                    <form
                        id="irrigation-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label htmlFor="irrigation-crop">
                                <i className="fas fa-seedling"></i>
                                {' '}{t('crop', 'Crop')}
                            </label>

                            <select
                                id="irrigation-crop"
                                required
                                value={formData.crop}
                                onChange={handleCropChange}
                            >
                                <option value="">
                                    {t('select_crop', 'Select Crop')}
                                </option>

                                {crops.map((crop) => (
                                    <option
                                        key={crop.value}
                                        value={crop.value}
                                    >
                                        {crop.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="soil-moisture">
                                <i className="fas fa-tint"></i>
                                {' '}{t('soil_moisture', 'Soil Moisture (%)')}
                            </label>

                            <input
                                type="number"
                                id="soil-moisture"
                                min="0"
                                max="100"
                                step="0.1"
                                placeholder={t('soil_moisture_placeholder', 'e.g. 28')}
                                required
                                value={formData.moisture}
                                onChange={handleMoistureChange}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn irrigation-check-btn"
                            id="irrigation-check-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fas fa-search"></i>
                            )}

                            {' '}
                            {loading
                                ? t('checking', 'Checking...')
                                : t('check_irrigation', 'Check Irrigation')}
                        </button>
                    </form>
                </div>

                {result && (
                    <div id="irrigation-result" className="irrigation-card irrigation-result">
                        <div
                            id="result-status-icon"
                            className={`result-status-icon ${
                                result.irrigationRequired
                                    ? 'irrigation-required'
                                    : 'irrigation-not-required'
                            }`}
                        >
                            <i
                                className={
                                    result.irrigationRequired
                                        ? 'fas fa-tint'
                                        : 'fas fa-check-circle'
                                }
                            ></i>
                        </div>

                        <h2 id="irrigation-status">
                            {t('irrigation_status', 'Irrigation Status')}
                        </h2>

                        <p id="irrigation-message" className="irrigation-message">
                            {result.message}
                        </p>

                        <div className="irrigation-metrics">
                            <div className="irrigation-metric">
                                <span className="metric-label">
                                    {t('crop', 'Crop')}
                                </span>

                                <strong id="result-crop">
                                    {result.crop}
                                </strong>
                            </div>

                            <div className="irrigation-metric">
                                <span className="metric-label">
                                    {t('current_moisture', 'Soil Moisture')}
                                </span>

                                <strong>
                                    <span id="result-moisture">{result.soilMoisture}</span>%
                                </strong>
                            </div>

                            <div className="irrigation-metric">
                                <span className="metric-label">
                                    {t('required_threshold', 'Required Threshold')}
                                </span>

                                <strong>
                                    <span id="result-threshold">{result.threshold}</span>%
                                </strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default SmartIrrigation;