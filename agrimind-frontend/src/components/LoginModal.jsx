import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { rootApi } from '../services/api';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClose = useCallback(() => {
        setError('');
        setLoading(false);
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleClose]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const formData = new URLSearchParams();

            formData.append('email', email);
            formData.append('password', password);

            const response = await rootApi.post(
                '/login',
                formData,
                {
                    headers: {
                        'Content-Type':
                            'application/x-www-form-urlencoded'
                    }
                }
            );

            const responseUrl =
                response.request?.responseURL || '';

            if (responseUrl.endsWith('/dashboard')) {
                const responseUser = response.data?.user;

                const tempUser = {
                    name:
                        responseUser?.name ||
                        email.split('@')[0],
                    email:
                        responseUser?.email ||
                        email,
                    location:
                        responseUser?.location || '',
                    profilePhoto:
                        responseUser?.profilePhoto ||
                        '/images/default-user.png'
                };

                if (onLoginSuccess) {
                    onLoginSuccess(tempUser);
                }

                setEmail('');
                setPassword('');
                setError('');

                handleClose();
            } else {
                setError('Invalid email or password.');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Server error. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div
            id="login-modal-overlay"
            className="login-modal-overlay"
            onClick={handleOverlayClick}
        >
            <div className="login-modal">
                <button
                    className="close-btn"
                    onClick={handleClose}
                    type="button"
                >
                    &times;
                </button>

                <h2>{t('welcome_agrimind', 'Welcome to AgriMind')}</h2>

                <p>
                    {t('signin_continue', 'Sign in to continue to your dashboard.')}
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form
                    id="email-login-form"
                    className="modal-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="modal-email">
                            {t('email_address', 'Email Address')}
                        </label>

                        <input
                            type="email"
                            id="modal-email"
                            name="email"
                            placeholder={t('email_placeholder', 'you@example.com')}
                            required
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="modal-password">
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
                                id="modal-password"
                                name="password"
                                placeholder={t('password_placeholder', 'Min 6 characters')}
                                required
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />

                            <i
                                className={`fas ${
                                    showPassword
                                        ? 'fa-eye-slash'
                                        : 'fa-eye'
                                } toggle-password`}
                                id="toggleLoginPassword"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            ></i>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-full"
                        disabled={loading}
                    >
                        {loading
                            ? t('processing', 'Processing...')
                            : t('continue_email', 'Continue with Email')}
                    </button>
                </form>

                <div className="divider"></div>

                <p className="terms-notice">
                    {t('terms_notice', 'By continuing, you agree to our')}{' '}
                    <a href="#">
                        {t('terms_service', 'Terms of Service')}
                    </a>{' '}
                    and{' '}
                    <a href="#">
                        {t('privacy_policy', 'Privacy Policy')}
                    </a>
                    .
                </p>
            </div>
        </div>
    );
};

export default LoginModal;