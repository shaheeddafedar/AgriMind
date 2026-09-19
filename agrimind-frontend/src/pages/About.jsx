import { useTranslation } from 'react-i18next';
import '../assets/css/about.css';

const About = () => {
    const { t } = useTranslation();

    return (
        <main className="page-content">
            <div className="page-header">
                <div className="container">
                    <h1>{t('about_title')}</h1>

                    <p>{t('about_subtitle')}</p>

                    <div className="header-decoration">
                        <div className="decoration-item">
                            <i className="fas fa-seedling"></i>
                        </div>

                        <div className="decoration-item">
                            <i className="fas fa-brain"></i>
                        </div>

                        <div className="decoration-item">
                            <i className="fas fa-chart-line"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container about-content">
                <section className="about-section">
                    <div className="section-icon">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>

                    <div className="section-content">
                        <h2>{t('problem_title')}</h2>

                        <p>{t('problem_desc')}</p>

                        <div className="problem-stats">
                            <div className="stat">
                                <h3>60%</h3>
                                <p>{t('problem_stat_1')}</p>
                            </div>

                            <div className="stat">
                                <h3>40%</h3>
                                <p>{t('problem_stat_2')}</p>
                            </div>

                            <div className="stat">
                                <h3>30%</h3>
                                <p>{t('problem_stat_3')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <div className="section-icon">
                        <i className="fas fa-bullseye"></i>
                    </div>

                    <div className="section-content">
                        <h2>{t('mission_title')}</h2>

                        <p>{t('mission_desc')}</p>

                        <div className="mission-features">
                            <div className="feature">
                                <i className="fas fa-robot"></i>

                                <h4>{t('mission_ai_title')}</h4>

                                <p>{t('mission_ai_desc')}</p>
                            </div>

                            <div className="feature">
                                <i className="fas fa-database"></i>

                                <h4>{t('mission_data_title')}</h4>

                                <p>{t('mission_data_desc')}</p>
                            </div>

                            <div className="feature">
                                <i className="fas fa-leaf"></i>

                                <h4>{t('mission_sustainable_title')}</h4>

                                <p>{t('mission_sustainable_desc')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <div className="section-icon">
                        <i className="fas fa-lightbulb"></i>
                    </div>

                    <div className="section-content">
                        <h2>{t('helps_title')}</h2>

                        <p>{t('helps_desc')}</p>

                        <div className="benefits-grid">
                            <div className="benefit">
                                <i className="fas fa-seedling"></i>

                                <h4>{t('benefit_crop_title')}</h4>

                                <p>{t('benefit_crop_desc')}</p>
                            </div>

                            <div className="benefit">
                                <i className="fas fa-cloud-sun"></i>

                                <h4>{t('benefit_weather_title')}</h4>

                                <p>{t('benefit_weather_desc')}</p>
                            </div>

                            <div className="benefit">
                                <i className="fas fa-chart-line"></i>

                                <h4>{t('benefit_productivity_title')}</h4>

                                <p>{t('benefit_productivity_desc')}</p>
                            </div>

                            <div className="benefit">
                                <i className="fas fa-language"></i>

                                <h4>{t('benefit_accessible_title')}</h4>

                                <p>{t('benefit_accessible_desc')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="team-section">
                    <h2>{t('vision_title')}</h2>

                    <p className="vision-text">
                        {t('vision_desc')}
                    </p>
                </section>
            </div>
        </main>
    );
};

export default About;