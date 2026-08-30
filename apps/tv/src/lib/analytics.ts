import { createPlausibleClient } from '@vibes/api';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';
import appConfig from '../../app.json';

export const tvAnalytics = createPlausibleClient({
  fetcher: expoFetch,
  userAgent: `ZoffTV/${appConfig.expo.version} (Android TV ${Platform.Version})`,
});
