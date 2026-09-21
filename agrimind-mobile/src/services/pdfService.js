import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { getApiBaseUrl, getSessionCookie } from './api';
export const pdfService = {
  downloadAndShareReport: async (
    recommendationId,
    cropName = 'Report'
  ) => {
    try {
      const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
      const downloadUrl =
        `${baseUrl}/recommendation/pdf/${recommendationId}`;

      // Web
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') {
          window.open(downloadUrl, '_blank');

          return {
            success: true,
            uri: downloadUrl,
          };
        }
      }

      const safeCrop = cropName.replace(
        /[^a-zA-Z0-9_-]/g,
        '_'
      );

      const filename =
        `AgriMind_Report_${safeCrop}_${recommendationId.slice(-6)}.pdf`;

      const cookie = getSessionCookie();

      const headers = {};

      if (cookie) {
        headers.Cookie = cookie;
      }

      console.log('Downloading PDF from:', downloadUrl);

      // Fetch the PDF from the EXISTING backend
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers,
      });

      console.log('PDF response status:', response.status);
      console.log(
        'PDF response content-type:',
        response.headers.get('content-type')
      );

      if (!response.ok) {
        throw new Error(
          `Server returned status ${response.status}`
        );
      }

      const contentType =
        response.headers.get('content-type') || '';

      if (!contentType.includes('application/pdf')) {
        throw new Error(
          `Expected PDF but received: ${contentType}`
        );
      }

      // Get the actual binary PDF data
      const arrayBuffer = await response.arrayBuffer();

      const bytes = new Uint8Array(arrayBuffer);

      console.log('Downloaded PDF bytes:', bytes.length);

      // Verify PDF signature
      const header = String.fromCharCode(
        ...bytes.slice(0, 5)
      );

      console.log('PDF header:', header);

      if (header !== '%PDF-') {
        throw new Error(
          `Invalid PDF file. Header received: ${header}`
        );
      }

      // Create local PDF file
      const destination = new File(
        Paths.document,
        filename
      );

      // Write the actual PDF bytes
      destination.write(bytes);

      console.log(
        'PDF saved:',
        destination.uri
      );

      console.log(
        'PDF exists:',
        destination.exists
      );

      console.log(
        'PDF size:',
        destination.size
      );

      // Share PDF
      const canShare =
        await Sharing.isAvailableAsync();

      if (!canShare) {
        return {
          success: true,
          uri: destination.uri,
        };
      }

      await Sharing.shareAsync(
        destination.uri,
        {
          mimeType: 'application/pdf',
          dialogTitle:
            `AgriMind Report - ${cropName}`,
          UTI: 'com.adobe.pdf',
        }
      );

      return {
        success: true,
        uri: destination.uri,
      };

    } catch (error) {
      console.error(
        'PDF download error:',
        error
      );

      throw error;
    }
  },
};

export default pdfService;