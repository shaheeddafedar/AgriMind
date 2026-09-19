import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link to="/" className="logo">
                            <i className="fas fa-leaf"></i> AgriMind
                        </Link>
                        <p>{t('footer_desc')}</p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>{t('footer_quick_links', 'Quick Links')}</h4>
                            <ul>
                                <li><Link to="/">{t('nav_home')}</Link></li>
                                <li><Link to="/dashboard">{t('nav_dashboard')}</Link></li>
                                <li><Link to="/about">{t('nav_about')}</Link></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>{t('footer_resources', 'Resources')}</h4>
                            <ul>
                                <li><Link to="/analytics">{t('nav_analytics')}</Link></li>
                                <li><Link to="/feedback">{t('nav_feedback')}</Link></li>
                                <li><a href="#">{t('footer_help', 'Help Center')}</a></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h4>{t('footer_contact', 'Contact')}</h4>
                            <ul>
                                <li><a href="mailto:support@agrimind.dev">support@agrimind.dev</a></li>
                                <li><a href="tel:+911234567890">+91 123 456 7890</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>{t('footer_copyright', '© 2026 AgriMind. All Rights Reserved.')}</p>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
                        <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                        <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;