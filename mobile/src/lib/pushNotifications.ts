import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from './api'; // import api directly — avoids circular: auth→pushNotifications→notifications→auth

// Show alert + play sound for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/** Returns true when running inside Expo Go (SDK 53+ removed remote push support). */
const isExpoGo = () =>
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

export async function setupPushNotifications(): Promise<void> {
  // Remote push tokens don't work in Expo Go ≥ SDK 53 — need a dev build
  if (isExpoGo()) {
    console.info('[push] Expo Go detected — skipping push token registration. Use a dev build for push.');
    return;
  }

  // Push tokens only work on real devices
  if (!Device.isDevice) return;

  // Android: create default notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Avyuktha Fashions',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C8A97E',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : {}
    );

    if (tokenData.data) {
      await api.post('/notifications/push-token', { token: tokenData.data });
    }
  } catch (err) {
    // Non-blocking — server may be unreachable on first launch
    console.warn('[push] Token registration failed:', err);
  }
}
