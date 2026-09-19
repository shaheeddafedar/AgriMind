import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import LoginModal from '../components/LoginModal';

const Home = ({ user, onRequireLogin }) => {
    const { t } = useTranslation();

    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('Belagavi');
    const [marketPrices, setMarketPrices] = useState([]);
    const [loadingMarket, setLoadingMarket] = useState(false);
    const [marketDate, setMarketDate] = useState('');

    const [showLoginModal, setShowLoginModal] = useState(false);

    const [stats, setStats] = useState({
        farmers: 0,
        crops: 0,
        accuracy: 95
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/home-stats');

                console.log('HOME STATS:', response.data);

                if (response.data?.success) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error('HOME STATS ERROR:', error);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await api.get(
                    '/market-prices/districts'
                );

                setDistricts(
                    response.data.districts || []
                );
            } catch (error) {
                console.error(
                    'Failed to fetch districts:',
                    error
                );
            }
        };

        fetchDistricts();
    }, []);

    useEffect(() => {
        const fetchPrices = async () => {
            if (!selectedDistrict) {
                return;
            }

            setLoadingMarket(true);
            setMarketDate('');

            try {
                const response = await api.get(
                    '/market-prices',
                    {
                        params: {
                            district: selectedDistrict
                        }
                    }
                );

                setMarketPrices(
                    response.data.prices || []
                );

                if (response.data.latestDate) {
                    setMarketDate(
                        `Latest available market data: ${response.data.latestDate}`
                    );
                }
            } catch (error) {
                console.error(
                    'Failed to fetch market prices:',
                    error
                );

                setMarketPrices([]);
            } finally {
                setLoadingMarket(false);
            }
        };

        fetchPrices();
    }, [selectedDistrict]);

    const handleProtectedClick = (e) => {
        if (!user) {
            e.preventDefault();

            if (onRequireLogin) {
                onRequireLogin();
            } else {
                setShowLoginModal(true);
            }
        }
    };

    return (
        <>
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>
                            {t(
                                'hero_title',
                                'Intelligent Crop Recommendations for Modern Farmers'
                            )}
                        </h1>

                        <p>
                            {t(
                                'hero_desc',
                                'Empowering agriculture with AI-driven insights.'
                            )}
                        </p>

                        <Link
                            to="/dashboard"
                            className="btn btn-large"
                            id="hero-cta-btn"
                            onClick={handleProtectedClick}
                        >
                            {t(
                                'hero_cta',
                                'Get Recommendation'
                            )}
                        </Link>
                    </div>

                    <div className="hero-visual">
                        <div className="floating-card">
                            <i className="fas fa-seedling"></i>

                            <h4>
                                {t(
                                    'card_smart_title',
                                    'Smart Farming'
                                )}
                            </h4>

                            <p>
                                {t(
                                    'card_smart_desc',
                                    'AI powered insights'
                                )}
                            </p>
                        </div>

                        <div className="floating-card">
                            <i className="fas fa-chart-line"></i>

                            <h4>
                                {t(
                                    'card_yield_title',
                                    'Higher Yield'
                                )}
                            </h4>

                            <p>
                                {t(
                                    'card_yield_desc',
                                    'Maximize your profits'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="market-section">
                <div className="container">
                    <div className="market-card">
                        <div className="market-header">
                            <div>
                                <h3>
                                    <i className="fas fa-chart-line"></i>
                                    {' '}{t('live_market_prices', 'Live Karnataka Market Prices')}
                                </h3>

                                <p id="market-date">
                                    {marketDate ||
                                        t('market_select_district', 'Select a district to view the latest market prices')}
                                </p>
                            </div>

                            <div className="district-selector">
                                <label htmlFor="district-select">
                                    <i className="fas fa-map-marker-alt"></i>
                                    {' '}{t('market_district', 'District')}
                                </label>

                                <select
                                    id="district-select"
                                    value={selectedDistrict}
                                    onChange={(e) =>
                                        setSelectedDistrict(
                                            e.target.value
                                        )
                                    }
                                >
                                    {districts.length === 0 ? (
                                        <option value="">
                                            {t('loading_districts', 'Loading districts...')}
                                        </option>
                                    ) : (
                                        districts.map(
                                            (district) => (
                                                <option
                                                    key={district}
                                                    value={district}
                                                >
                                                    {district}
                                                </option>
                                            )
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        <div id="market-prices-container">
                            {loadingMarket ? (
                                <p className="market-loading">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    {' '}{t('market_loading', 'Loading live market rates...')}
                                </p>
                            ) : marketPrices.length > 0 ? (
                                marketPrices.map(
                                    (item, index) => (
                                        <div
                                            key={index}
                                            className="market-price-item"
                                        >
                                            <div className="market-crop">
                                                <span className="crop-icon">
                                                    🌾
                                                </span>

                                                <span>
                                                    {item.commodity}
                                                </span>
                                            </div>

                                            <div className="market-price">
                                                ₹
                                                {Number(
                                                    item.modalPrice
                                                ).toLocaleString(
                                                    'en-IN'
                                                )}

                                                <small>
                                                    {t('market_modal_price', 'Modal price per quintal')}
                                                </small>
                                            </div>

                                            <small
                                                style={{
                                                    display: 'block',
                                                    marginTop: '10px',
                                                    color: '#718096'
                                                }}
                                            >
                                                <i className="fas fa-store"></i>
                                                {' '}{item.market}
                                            </small>

                                            <small
                                                style={{
                                                    display: 'block',
                                                    marginTop: '5px',
                                                    color: '#718096'
                                                }}
                                            >
                                                {t('market_variety', 'Variety')}: {item.variety}
                                            </small>
                                        </div>
                                    )
                                )
                            ) : (
                                <p className="market-empty">
                                    {t('market_no_data', 'No market price data available for')}{' '}
                                    {selectedDistrict}.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="stats">
                <div className="container">
                    <div className="stat-item">
                        <i className="fas fa-users"></i>

                        <h3>
                            {stats.farmers}+
                        </h3>

                        <p>
                            {t(
                                'stat_farmers',
                                'Farmers Helped'
                            )}
                        </p>
                    </div>

                    <div className="stat-item">
                        <i className="fas fa-tractor"></i>

                        <h3>
                            {stats.crops}+
                        </h3>

                        <p>
                            {t(
                                'stat_crops',
                                'Crops Recommended'
                            )}
                        </p>
                    </div>

                    <div className="stat-item">
                        <i className="fas fa-bullseye"></i>

                        <h3>
                            {stats.accuracy}%
                        </h3>

                        <p>
                            {t(
                                'stat_accuracy',
                                'Accuracy Rate'
                            )}
                        </p>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2>
                        {t('feat_title', 'Features')}
                    </h2>

                    <p className="section-subtitle">
                        {t(
                            'feat_subtitle',
                            'Everything you need to grow better.'
                        )}
                    </p>

                    <div className="features-grid">
                        <Link
                            to="/dashboard"
                            className="feature-card-link"
                            onClick={handleProtectedClick}
                        >
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-brain"></i>
                                </div>

                                <h3>
                                    {t(
                                        'feat_ai_title',
                                        'AI Crop Recommendation'
                                    )}
                                </h3>

                                <p>
                                    {t(
                                        'feat_ai_desc',
                                        'Get the best crop suggestions based on soil and weather.'
                                    )}
                                </p>

                                <div className="feature-cta">
                                    {user
                                        ? t(
                                            'feat_ai_btn',
                                            'Try Now'
                                        )
                                        : t('login_to_access', 'Log In to Access')}

                                    <i
                                        className={
                                            user
                                                ? 'fas fa-arrow-right'
                                                : 'fas fa-lock'
                                        }
                                    ></i>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/feedback"
                            className="feature-card-link"
                        >
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-language"></i>
                                </div>

                                <h3>
                                    {t(
                                        'feat_fb_title',
                                        'Multilingual Support'
                                    )}
                                </h3>

                                <p>
                                    {t(
                                        'feat_fb_desc',
                                        'Available in English, Hindi, and Kannada.'
                                    )}
                                </p>

                                <div className="feature-cta">
                                    {t(
                                        'feat_fb_btn',
                                        'Provide Feedback'
                                    )}

                                    <i className="fas fa-arrow-right"></i>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/dashboard"
                            className="feature-card-link"
                            onClick={handleProtectedClick}
                        >
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-comments"></i>
                                </div>

                                <h3>
                                    {t(
                                        'feat_chat_title',
                                        'AI Farming Assistant'
                                    )}
                                </h3>

                                <p>
                                    {t(
                                        'feat_chat_desc',
                                        'Chat with our AI bot for quick farming tips.'
                                    )}
                                </p>

                                <div className="feature-cta">
                                    {user
                                        ? t(
                                            'feat_chat_btn',
                                            'Ask Now'
                                        )
                                        : t('login_to_access', 'Log In to Access')}

                                    <i
                                        className={
                                            user
                                                ? 'fas fa-arrow-right'
                                                : 'fas fa-lock'
                                        }
                                    ></i>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/about"
                            className="feature-card-link"
                        >
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-users"></i>
                                </div>

                                <h3>
                                    {t(
                                        'feat_about_title',
                                        'About AgriMind'
                                    )}
                                </h3>

                                <p>
                                    {t(
                                        'feat_about_desc',
                                        'Learn more about our mission and vision.'
                                    )}
                                </p>

                                <div className="feature-cta">
                                    {t(
                                        'feat_about_btn',
                                        'Read More'
                                    )}

                                    <i className="fas fa-arrow-right"></i>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/analytics"
                            className="feature-card-link"
                        >
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-chart-pie"></i>
                                </div>

                                <h3>
                                    {t(
                                        'feat_data_title',
                                        'Farm Analytics'
                                    )}
                                </h3>

                                <p>
                                    {t(
                                        'feat_data_desc',
                                        'View platform statistics and trends.'
                                    )}
                                </p>

                                <div className="feature-cta">
                                    {t(
                                        'feat_data_btn',
                                        'View Analytics'
                                    )}

                                    <i className="fas fa-arrow-right"></i>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/fertilization"
                            className="feature-card-link"
                            onClick={handleProtectedClick}
                        >
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-seedling"></i>
                                </div>

                                <h3>
                                    {t(
                                        'feat_fertilization_title',
                                        'Smart Fertilization'
                                    )}
                                </h3>

                                <p>
                                    {t(
                                        'feat_fertilization_desc',
                                        'Get tailored fertilizer recommendations.'
                                    )}
                                </p>

                                <div className="feature-cta">
                                    {user
                                        ? t(
                                            'feat_fertilization_btn',
                                            'Try Now'
                                        )
                                        : t('login_to_access', 'Log In to Access')}

                                    <i
                                        className={
                                            user
                                                ? 'fas fa-arrow-right'
                                                : 'fas fa-lock'
                                        }
                                    ></i>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/irrigation"
                            className="feature-card-link"
                            onClick={handleProtectedClick}
                        >
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-tint"></i>
                                </div>

                                <h3>
                                    {t(
                                        'feat_irrigation_title',
                                        'Smart Irrigation'
                                    )}
                                </h3>

                                <p>
                                    {t(
                                        'feat_irrigation_desc',
                                        'Check if your crops need watering today.'
                                    )}
                                </p>

                                <div className="feature-cta">
                                    {user
                                        ? t(
                                            'feat_irrigation_btn',
                                            'Check Status'
                                        )
                                        : t('login_to_access', 'Log In to Access')}

                                    <i
                                        className={
                                            user
                                                ? 'fas fa-arrow-right'
                                                : 'fas fa-lock'
                                        }
                                    ></i>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/"
                            className="feature-card-link"
                        >
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-microchip"></i>
                                </div>

                                <h3>
                                    {t(
                                        'feat_iot_title',
                                        'IoT Integration'
                                    )}
                                </h3>

                                <p>
                                    {t(
                                        'feat_iot_desc',
                                        'Connect farm sensors directly to the app.'
                                    )}
                                </p>

                                <div className="feature-cta">
                                    {t(
                                        'feat_iot_btn',
                                        'Learn More'
                                    )}

                                    <i className="fas fa-arrow-right"></i>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {!onRequireLogin && (
                <LoginModal
                    isOpen={showLoginModal}
                    onClose={() =>
                        setShowLoginModal(false)
                    }
                />
            )}
        </>
    );
};

export default Home;