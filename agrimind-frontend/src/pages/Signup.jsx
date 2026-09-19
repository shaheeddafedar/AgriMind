import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { rootApi } from '../services/api';
import '../assets/css/signup.css';

const Signup = ({ onLoginSuccess, onOpenLogin }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        location: '',
        phone: '',
        email: '',
        password: ''
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        setProfilePhoto(
            e.target.files?.[0] || null
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const data = new FormData();

            data.append(
                'name',
                formData.name
            );

            data.append(
                'location',
                formData.location
            );

            data.append(
                'phone',
                formData.phone
            );

            data.append(
                'email',
                formData.email
            );

            data.append(
                'password',
                formData.password
            );

            if (profilePhoto) {
                data.append(
                    'profilePhoto',
                    profilePhoto
                );
            }

            const response = await rootApi.post(
                '/signup',
                data
            );

            const user = {
                name: formData.name,
                email: formData.email,
                location: formData.location,
                phone: formData.phone,
                profilePhoto: '/images/default-user.png'
            };

            if (profilePhoto) {
                user.profilePhoto =
                    URL.createObjectURL(
                        profilePhoto
                    );
            }

            if (response.data?.user) {
                Object.assign(
                    user,
                    response.data.user
                );
            }

            if (onLoginSuccess) {
                onLoginSuccess(user);
            }

            navigate('/dashboard');

        } catch (err) {
            console.error(
                'Signup error:',
                err
            );

            if (
                err.response?.data?.message
            ) {
                setError(
                    err.response.data.message
                );
            } else {
                setError(
                    'Signup failed. Please try again or use a different email.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="signup-hero">
                <div className="container">
                    <h1>
                        {t('signup_hero_title', 'Join the Smart Farming Revolution')}
                    </h1>

                    <p>
                        {t('signup_hero_desc', 'Create your account and unlock AI-powered crop recommendations')}
                    </p>
                </div>
            </section>

            <main className="container page-content">
                <div
                    className="form-container"
                    style={{
                        maxWidth: '500px',
                        margin: '4rem auto'
                    }}
                >
                    <div className="form-header">
                        <div className="form-header-icon">
                            <i className="fas fa-seedling"></i>
                        </div>

                        <h1>
                            {t('create_account_title', 'Create Your AgriMind Account')}
                        </h1>

                        <p>
                            {t('signup_start', 'Start your smart farming journey today.')}
                        </p>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form
                        className="auth-form"
                        encType="multipart/form-data"
                        onSubmit={handleSubmit}
                    >
                        <div className="form-group">
                            <label htmlFor="name">
                                <i className="fas fa-user"></i>{' '}
                                {t('full_name', 'Full Name')}
                            </label>

                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder={t('name_placeholder', 'John Doe')}
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">
                                <i className="fas fa-map-marker-alt"></i>{' '}
                                {t('location', 'Location')}
                            </label>

                            <input
                                type="text"
                                id="location"
                                name="location"
                                placeholder={t('location_placeholder', 'e.g. Punjab, India')}
                                required
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">
                                <i className="fas fa-phone"></i>{' '}
                                {t('phone_number', 'Phone Number')}
                            </label>

                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder={t('phone_placeholder', '10 Digit Mobile Number')}
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                <i className="fas fa-envelope"></i>{' '}
                                {t('email_address', 'Email Address')}
                            </label>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder={t('email_placeholder', 'you@example.com')}
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="profilePhoto">
                                <i className="fas fa-camera"></i>{' '}
                                {t('profile_photo', 'Profile Photo')}
                            </label>

                            <input
                                type="file"
                                id="profilePhoto"
                                name="profilePhoto"
                                accept="image/*"
                                style={{
                                    padding: '10px',
                                    border: '1px dashed #adb5bd',
                                    width: '100%'
                                }}
                                onChange={handlePhotoChange}
                            />
                        </div>

                        <div className="form-group password-group">
                            <label htmlFor="password">
                                <i className="fas fa-lock"></i>{' '}
                                {t('password', 'Password')}
                            </label>

                            <div
                                style={{
                                    position: 'relative'
                                }}
                            >
                                <input
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    id="password"
                                    name="password"
                                    placeholder={t('password_placeholder', 'Min 6 characters')}
                                    style={{
                                        width: '100%'
                                    }}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />

                                <i
                                    className={`fas ${
                                        showPassword
                                            ? 'fa-eye-slash'
                                            : 'fa-eye'
                                    } toggle-password`}
                                    id="toggleSignupPassword"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    style={{
                                        cursor: 'pointer'
                                    }}
                                ></i>
                            </div>
                        </div>

                        <div
                            className="form-features"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '10px',
                                margin: '1.5rem 0'
                            }}
                        >
                            <div
                                className="feature-item"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <i
                                    className="fas fa-check-circle"
                                    style={{
                                        color: '#2E8B57'
                                    }}
                                ></i>

                                <span>
                                    {t('ai_recommendations', 'AI Recommendations')}
                                </span>
                            </div>

                            <div
                                className="feature-item"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <i
                                    className="fas fa-check-circle"
                                    style={{
                                        color: '#2E8B57'
                                    }}
                                ></i>

                                <span>
                                    {t('farm_analytics', 'Farm Analytics')}
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-full"
                            disabled={loading}
                        >
                            <i className="fas fa-rocket"></i>{' '}

                            {loading
                                ? t('creating_account', 'Creating Account...')
                                : t('create_account', 'Create Account')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {t('already_account', 'Already have an account?')}
                            {' '}
                            <a
                                href="#"
                                id="login-link"
                                onClick={(e) => {
                                    e.preventDefault();

                                    if (onOpenLogin) {
                                        onOpenLogin();
                                    } else {
                                        navigate('/');
                                    }
                                }}
                            >
                                {t('login_here', 'Log In here')}
                            </a>
                        </p>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Signup;