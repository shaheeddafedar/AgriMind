import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import '../assets/css/feedback.css';

const Feedback = () => {
    const { t } = useTranslation();
    const [feedbacks, setFeedbacks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        rating: 0,
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const feedbacksPerPage = 6;

    const fetchFeedbacks = async () => {
        try {
            const response = await api.get('/feedback');
            setFeedbacks(response.data || []);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    };

    useEffect(() => {
        let isMounted = true;
        api.get('/feedback')
            .then((response) => {
                if (isMounted) {
                    setFeedbacks(response.data || []);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('Error fetching feedback:', error);
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.rating === 0) {
            alert('Please select a rating.');
            return;
        }

        setSubmitting(true);

        try {
            await api.post('/feedback', formData);

            alert('Thank you for your feedback!');

            setFormData({
                name: '',
                rating: 0,
                comment: ''
            });

            setCurrentPage(1);
            await fetchFeedbacks();
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Could not submit feedback.');
        } finally {
            setSubmitting(false);
        }
    };

    const totalPages = Math.ceil(
        feedbacks.length / feedbacksPerPage
    );

    const startIndex =
        (currentPage - 1) * feedbacksPerPage;

    const paginatedFeedbacks = feedbacks.slice(
        startIndex,
        startIndex + feedbacksPerPage
    );

    return (
        <main className="page-content">
            <div className="page-header feedback-page-header">
                <div className="container">
                    <h1>{t('feedback_title', 'Share Your Feedback')}</h1>

                    <p>
                        {t('feedback_desc', 'Help us improve our service for farmers everywhere.')}
                    </p>
                </div>
            </div>

            <div className="container feedback-content-container">
                <div className="feedback-form-container">
                    <h3>{t('feedback_submit_title', 'Submit Your Feedback')}</h3>

                    <form id="feedback-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">
                                {t('feedback_name', 'Your Name')}
                            </label>

                            <input
                                type="text"
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('feedback_rating', 'Rating')}</label>

                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        className={`star ${
                                            formData.rating >= star
                                                ? 'active'
                                                : ''
                                        }`}
                                        data-value={star}
                                        onClick={() =>
                                            setFormData(prev => ({
                                                ...prev,
                                                rating: star
                                            }))
                                        }
                                    >
                                        {formData.rating >= star
                                            ? '★'
                                            : '☆'}
                                    </span>
                                ))}
                            </div>

                            <input
                                type="hidden"
                                id="rating"
                                value={formData.rating}
                                required
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="comment">
                                {t('feedback_comment', 'Comment')}
                            </label>

                            <textarea
                                id="comment"
                                rows="4"
                                required
                                value={formData.comment}
                                onChange={(e) =>
                                    setFormData(prev => ({
                                        ...prev,
                                        comment: e.target.value
                                    }))
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-submit"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <div className="btn-loading">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    {' '}{t('feedback_processing', 'Processing...')}
                                </div>
                            ) : (
                                <span className="btn-text">
                                    {t('feedback_submit', 'Submit Feedback')}
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                <section className="recent-feedback-section">
                    <div className="section-header">
                        <h2>
                            {t('feedback_recent_title', 'What Other Farmers Are Saying')}
                        </h2>
                    </div>

                    <div
                        id="recent-feedback"
                        className="feedback-grid"
                    >
                        {loading ? (
                            <div className="loading-spinner">
                                <i className="fas fa-spinner fa-spin"></i>

                                <p>
                                    {t('feedback_loading', 'Loading feedback...')}
                                </p>
                            </div>
                        ) : paginatedFeedbacks.length > 0 ? (
                            paginatedFeedbacks.map(feedback => (
                                <div
                                    key={feedback._id}
                                    className="feedback-card"
                                >
                                    <div className="rating">
                                        {'★'.repeat(feedback.rating)}
                                        {'☆'.repeat(
                                            5 - feedback.rating
                                        )}
                                    </div>

                                    <p className="comment">
                                        "{feedback.comment}"
                                    </p>

                                    <small>
                                        <strong>
                                            - {feedback.name}
                                        </strong>{' '}
                                        on{' '}
                                        {new Date(
                                            feedback.createdAt
                                        ).toLocaleDateString()}
                                    </small>
                                </div>
                            ))
                        ) : (
                            <p>
                                {t('no_feedback_yet', 'No feedback available yet. Be the first!')}
                            </p>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div
                            className="pagination"
                            id="pagination"
                            style={{ display: 'flex' }}
                        >
                            <button
                                type="button"
                                id="prev-page"
                                className="pagination-btn"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage(prev => prev - 1)
                                }
                            >
                                {t('feedback_previous', 'Previous')}
                            </button>

                            <span id="page-info">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                type="button"
                                id="next-page"
                                className="pagination-btn"
                                disabled={
                                    currentPage === totalPages
                                }
                                onClick={() =>
                                    setCurrentPage(prev => prev + 1)
                                }
                            >
                                {t('feedback_next', 'Next')}
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default Feedback;