import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AgriHeader from '../components/common/AgriHeader';
import AgriCard from '../components/common/AgriCard';
import AgriButton from '../components/common/AgriButton';
import AgriInput from '../components/common/AgriInput';
import ErrorMessage from '../components/common/ErrorMessage';
import farmService from '../services/farmService';
import colors from '../theme/colors';
import { useTranslation } from '../i18n';

export const FeedbackScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [feedbacks, setFeedbacks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const feedbacksPerPage = 6;

  const fetchFeedbackList = async () => {
    try {
      const data = await farmService.getFeedback();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Feedback fetch warning:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeedbackList();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t('feedback_name_placeholder') || 'Please enter your name.');
      return;
    }
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (!comment.trim()) {
      setError(t('feedback_comment_placeholder') || 'Please enter your comment.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await farmService.postFeedback({
        name: name.trim(),
        rating,
        comment: comment.trim(),
      });

      Alert.alert(t('success'), t('feedback_success'));
      setName(user?.name || '');
      setRating(0);
      setComment('');
      setCurrentPage(1);
      fetchFeedbackList();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(feedbacks.length / feedbacksPerPage) || 1;
  const startIndex = (currentPage - 1) * feedbacksPerPage;
  const paginatedFeedbacks = feedbacks.slice(startIndex, startIndex + feedbacksPerPage);

  return (
    <View style={styles.container}>
      <AgriHeader
        title="AgriMind"
        subtitle={t('feedback_title')}
        showLanguage={true}
      />
      {/* Web Page Header Banner */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>{t('feedback_title')}</Text>
        <Text style={styles.pageHeaderSubtitle}>
          {t('feedback_desc')}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchFeedbackList(); }}
            colors={[colors.primary]}
          />
        }
      >
        {/* Feedback Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formHeading}>{t('feedback_submit_title')}</Text>

          <ErrorMessage message={error} />

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>{t('feedback_name')}</Text>
            <AgriInput
              placeholder={t('feedback_name_placeholder')}
              value={name}
              onChangeText={(tVal) => { setName(tVal); if (error) setError(''); }}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>{t('feedback_rating')}</Text>
            <View style={styles.starRatingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Text style={[styles.starIcon, rating >= star ? styles.starActive : styles.starInactive]}>
                    {rating >= star ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>{t('feedback_comment')}</Text>
            <AgriInput
              placeholder={t('feedback_comment_placeholder')}
              value={comment}
              onChangeText={(tVal) => { setComment(tVal); if (error) setError(''); }}
              multiline
              numberOfLines={4}
            />
          </View>

          <AgriButton
            title={submitting ? t('feedback_processing') : t('feedback_submit')}
            onPress={handleSubmit}
            loading={submitting}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* What Other Farmers Are Saying Section */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionHeading}>{t('feedback_recent_title')}</Text>

          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.primary }}>{t('feedback_loading')}</Text>
            </View>
          ) : paginatedFeedbacks.length > 0 ? (
            paginatedFeedbacks.map((fb) => (
              <View key={fb._id || Math.random().toString()} style={styles.feedbackCard}>
                {/* 3px gradient top line */}
                <View style={styles.topGradientBar} />

                <Text style={styles.cardStars}>
                  {'★'.repeat(fb.rating || 0)}
                  {'☆'.repeat(Math.max(0, 5 - (fb.rating || 0)))}
                </Text>

                <Text style={styles.cardComment}>"{fb.comment}"</Text>

                <Text style={styles.cardAuthor}>
                  <Text style={{ fontWeight: '700' }}>- {fb.name}</Text>
                  {' on '}
                  {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : 'Recent'}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('no_feedback_yet')}</Text>
            </View>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.paginationRow}>
              <TouchableOpacity
                style={[styles.paginationBtn, currentPage === 1 && styles.paginationBtnDisabled]}
                disabled={currentPage === 1}
                onPress={() => setCurrentPage((prev) => prev - 1)}
              >
                <Text style={[styles.paginationBtnText, currentPage === 1 && styles.paginationTextDisabled]}>
                  {t('feedback_previous')}
                </Text>
              </TouchableOpacity>

              <Text style={styles.pageInfoText}>
                Page {currentPage} of {totalPages}
              </Text>

              <TouchableOpacity
                style={[styles.paginationBtn, currentPage === totalPages && styles.paginationBtnDisabled]}
                disabled={currentPage === totalPages}
                onPress={() => setCurrentPage((prev) => prev + 1)}
              >
                <Text style={[styles.paginationBtnText, currentPage === totalPages && styles.paginationTextDisabled]}>
                  {t('feedback_next')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  pageHeader: {
    backgroundColor: colors.primary,
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pageHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  pageHeaderSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 18,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(46, 139, 87, 0.1)',
  },
  formHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 18,
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  starRatingRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  starButton: {
    padding: 4,
  },
  starIcon: {
    fontSize: 32,
  },
  starActive: {
    color: '#FFD700',
  },
  starInactive: {
    color: '#CBD5E1',
  },
  recentSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(46, 139, 87, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 18,
  },
  feedbackCard: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  topGradientBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.secondary,
  },
  cardStars: {
    fontSize: 18,
    color: '#FFD700',
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 4,
  },
  cardComment: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  cardAuthor: {
    fontSize: 12,
    color: '#777777',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  paginationBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  paginationBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  paginationBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paginationTextDisabled: {
    color: '#94A3B8',
  },
  pageInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default FeedbackScreen;
