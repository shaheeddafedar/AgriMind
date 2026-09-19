import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getApiBaseUrl, getSessionCookie } from './api';

export const pdfService = {
  downloadAndShareReport: async (recommendationId, cropName = 'Report') => {
    try {
      const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
      const downloadUrl = `${baseUrl}/recommendation/pdf/${recommendationId}`;

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.open(downloadUrl, '_blank');
          return { success: true, uri: downloadUrl };
        }
      }

      const safeCrop = cropName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `AgriMind_Report_${safeCrop}_${recommendationId.slice(-6)}.pdf`;
      const localUri = `${FileSystem.documentDirectory}${filename}`;

      const headers = {};
      const cookie = getSessionCookie();
      if (cookie) {
        headers['Cookie'] = cookie;
      }

      const downloadRes = await FileSystem.downloadAsync(downloadUrl, localUri, {
        headers,
      });

      if (downloadRes.status !== 200) {
        throw new Error(`Server returned status ${downloadRes.status}`);
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `AgriMind Report - ${cropName}`,
          UTI: 'com.adobe.pdf',
        });
      }

      return { success: true, uri: downloadRes.uri };
    } catch (error) {
      console.error('PDF download error:', error);
      throw error;
    }
  },
};

export default pdfService;
