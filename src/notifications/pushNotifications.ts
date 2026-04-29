import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {AndroidImportance} from '@notifee/react-native';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  registerPushToken,
  unregisterPushToken,
} from '../api/notifications';
import {navigateToNotificationTarget} from '../navigation/navigationRef';

const PUSH_CHANNEL_ID = 'saloon-updates';
const PUSH_TOKEN_STORAGE_KEY = 'push_device_token';
const PENDING_NOTIFICATION_NAVIGATION_KEY = 'pending_notification_navigation';

type NotificationData = Record<string, string>;

function normalizeData(
  data?: {[key: string]: string | number | object} | null,
): NotificationData {
  if (!data) {
    return {};
  }

  return Object.entries(data).reduce<NotificationData>((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }

    acc[key] = typeof value === 'string' ? value : JSON.stringify(value);
    return acc;
  }, {});
}

export function normalizeNotificationData(
  data?: {[key: string]: string | number | object} | null,
) {
  return normalizeData(data);
}

export async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await notifee.createChannel({
    id: PUSH_CHANNEL_ID,
    name: 'Salon Updates',
    importance: AndroidImportance.HIGH,
  });
}

export async function requestPushPermission() {
  if (Platform.OS === 'ios') {
    await messaging().registerDeviceForRemoteMessages();
    const status = await messaging().requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}

export async function syncCurrentDevicePushToken(nextToken?: string) {
  const hasPermission = await requestPushPermission();
  if (!hasPermission) {
    return null;
  }

  await ensureNotificationChannel();

  const token = nextToken || (await messaging().getToken());
  if (!token) {
    return null;
  }

  const currentToken = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  if (currentToken === token) {
    return token;
  }

  await registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
  return token;
}

export async function unregisterCurrentDevicePushToken() {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  if (!token) {
    return;
  }

  try {
    await unregisterPushToken(token);
  } finally {
    await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
  }
}

export async function displayForegroundNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) {
  if (Platform.OS !== 'android') {
    return;
  }

  const title =
    remoteMessage.notification?.title ||
    normalizeData(remoteMessage.data).title ||
    'Salon update';
  const body =
    remoteMessage.notification?.body || normalizeData(remoteMessage.data).body || '';

  const notificationData = normalizeData(remoteMessage.data);

  await ensureNotificationChannel();
  await notifee.displayNotification({
    title,
    body,
    data: notificationData,
    android: {
      channelId: PUSH_CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: {id: 'default'},
    },
  });
}

export async function savePendingNotificationNavigation(data: NotificationData) {
  if (Object.keys(data).length === 0) {
    return;
  }

  await AsyncStorage.setItem(
    PENDING_NOTIFICATION_NAVIGATION_KEY,
    JSON.stringify(data),
  );
}

export async function consumePendingNotificationNavigation() {
  const raw = await AsyncStorage.getItem(PENDING_NOTIFICATION_NAVIGATION_KEY);
  if (!raw) {
    return null;
  }

  await AsyncStorage.removeItem(PENDING_NOTIFICATION_NAVIGATION_KEY);
  return JSON.parse(raw) as NotificationData;
}

export async function handleNotificationNavigation(
  data: NotificationData,
  role: string | undefined,
) {
  if (!data || Object.keys(data).length === 0) {
    return;
  }

  const didNavigate = navigateToNotificationTarget(data.targetScreen, role);
  if (!didNavigate) {
    await savePendingNotificationNavigation(data);
  }
}

export function getRemoteMessageData(
  remoteMessage?: FirebaseMessagingTypes.RemoteMessage | null,
) {
  return normalizeData(remoteMessage?.data);
}