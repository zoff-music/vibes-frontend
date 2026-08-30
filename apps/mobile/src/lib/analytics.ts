import { createPlausibleClient } from '@vibes/api';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';
import appConfig from '../../app.json';

const nativeFetch = Platform.OS === 'ios' ? globalThis.fetch : expoFetch;

export const mobileAnalytics = createPlausibleClient({
  fetcher: nativeFetch,
  userAgent: `ZoffMobile/${appConfig.expo.version} (${Platform.OS} ${Platform.Version})`,
});
