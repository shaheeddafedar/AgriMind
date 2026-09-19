import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = ({ user, onLogin, onLogout }) => {
    const { t, i18n } = useTranslation();
    const location = useLocation();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const userProfileRef = useRef(null);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // Close user dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userProfileRef.current &&
                !userProfileRef.current.contains(event.target)
            ) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <header className="navbar">
            <div className="container">
                <Link to="/" className="logo" onClick={closeMobileMenu}>
                    <i className="fas fa-leaf"></i> AgriMind
                </Link>

                <button
                    className="mobile-menu-toggle"
                    id="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle navigation"
                >
                    <i
                        className={
                            mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'
                        }
                    ></i>
                </button>

                <ul
                    className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}
                    id="nav-links"
                >
                    <li>
                        <Link
                            to="/"
                            className={isActive('/') ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            {t('nav_home', 'Home')}
                        </Link>
                    </li>

                    {user ? (
                        <>
                            <li id="dashboard-link">
                                <Link
                                    to="/dashboard"
                                    className={
                                        isActive('/dashboard') ? 'active' : ''
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav_dashboard', 'Dashboard')}
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/irrigation"
                                    className={
                                        isActive('/irrigation') ? 'active' : ''
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav_irrigation', 'Irrigation')}
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/feedback"
                                    className={
                                        isActive('/feedback') ? 'active' : ''
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    {t('nav_feedback', 'Feedback')}
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li id="dashboard-link" style={{ display: 'none' }}>
                            <Link to="/dashboard">
                                {t('nav_dashboard', 'Dashboard')}
                            </Link>
                        </li>
                    )}

                    <li>
                        <Link
                            to="/about"
                            className={isActive('/about') ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            {t('nav_about', 'About')}
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/analytics"
                            className={isActive('/analytics') ? 'active' : ''}
                            onClick={closeMobileMenu}
                        >
                            {t('nav_analytics', 'Analytics')}
                        </Link>
                    </li>
                </ul>

                <div className="auth-buttons">
                    {user ? (
                        <div
                            className="user-nav-profile"
                            ref={userProfileRef}
                            onClick={() =>
                                setUserDropdownOpen(!userDropdownOpen)
                            }
                        >
                            <img
                                src={
                                    user.profilePhoto ||
                                    '/images/default-user.png'
                                }
                                alt="User"
                                className="nav-avatar"
                            />

                            <span className="nav-username">
                                {user.name}{' '}
                                <i className="fas fa-caret-down"></i>
                            </span>

                            <div
                                className={`user-dropdown-menu ${
                                    userDropdownOpen ? 'show' : ''
                                }`}
                            >
                                <Link
                                    to="/profile"
                                    onClick={() => {
                                        setUserDropdownOpen(false);
                                        closeMobileMenu();
                                    }}
                                >
                                    <i className="fas fa-user-circle"></i> {t('view_profile', 'View Profile')}
                                </Link>

                                <Link
                                    to="/dashboard"
                                    onClick={() => {
                                        setUserDropdownOpen(false);
                                        closeMobileMenu();
                                    }}
                                >
                                    <i className="fas fa-seedling"></i> {t('nav_dashboard', 'Dashboard')}
                                </Link>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        setUserDropdownOpen(false);
                                        closeMobileMenu();
                                        onLogout();
                                    }}
                                    style={{ margin: 0 }}
                                >
                                    <button
                                        type="submit"
                                        style={{ fontFamily: 'inherit' }}
                                    >
                                        <i className="fas fa-sign-out-alt"></i>{' '}
                                        {t('nav_logout', 'Logout')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                id="login-btn"
                                onClick={() => {
                                    closeMobileMenu();
                                    onLogin();
                                }}
                            >
                                {t('nav_login', 'Log In')}
                            </button>

                            <Link
                                to="/signup"
                                className="btn"
                                id="register-btn"
                                onClick={closeMobileMenu}
                            >
                                {t('nav_signup', 'Sign Up')}
                            </Link>
                        </>
                    )}
                </div>

                <div className="dropdown" style={{ marginLeft: '20px' }}>
                    <a
                        href="#"
                        className="dropbtn"
                        onClick={(e) => e.preventDefault()}
                    >
                        <i className="fas fa-globe"></i>{' '}
                        {t('language', 'Language')}
                    </a>

                    <div className="dropdown-content">
                        <a
                            href="#en"
                            onClick={(e) => {
                                e.preventDefault();
                                changeLanguage('en');
                            }}
                        >
                            English
                        </a>

                        <a
                            href="#hi"
                            onClick={(e) => {
                                e.preventDefault();
                                changeLanguage('hi');
                            }}
                        >
                            हिंदी
                        </a>

                        <a
                            href="#kn"
                            onClick={(e) => {
                                e.preventDefault();
                                changeLanguage('kn');
                            }}
                        >
                            ಕನ್ನಡ
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;