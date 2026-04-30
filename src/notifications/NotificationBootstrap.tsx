import notifee, {EventType} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import React, {useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import {
  consumePendingNotificationNavigation,
  displayForegroundNotification,
  getRemoteMessageData,
  handleNotificationNavigation,
  normalizeNotificationData,
  syncCurrentDevicePushToken,
} from './pushNotifications';
import { bookingEventEmitter } from './notificationEvents';

type Props = {
  navigationReady: boolean;
};

export default function NotificationBootstrap({navigationReady}: Props) {
  const {isAuthenticated, user} = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    syncCurrentDevicePushToken().catch(() => {});

    const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
      syncCurrentDevicePushToken(token).catch(() => {});
    });

    const unsubscribeForegroundMessage = messaging().onMessage(async remoteMessage => {
      await displayForegroundNotification(remoteMessage);
      // Emit booking event so open screens can refresh
      const data = getRemoteMessageData(remoteMessage) as any;
      if (data?.type === 'booking' || data?.bookingId) {
        bookingEventEmitter.emit({ bookingId: data.bookingId, status: data.status, raw: data });
      }
    });

    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      const data = getRemoteMessageData(remoteMessage) as any;
      if (data?.type === 'booking' || data?.bookingId) {
        bookingEventEmitter.emit({ bookingId: data.bookingId, status: data.status, raw: data });
      }
      handleNotificationNavigation(getRemoteMessageData(remoteMessage), user.role).catch(() => {});
    });

    const unsubscribeForegroundEvents = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        const d = normalizeNotificationData(detail.notification.data) as any;
        if (d?.type === 'booking' || d?.bookingId) {
          bookingEventEmitter.emit({ bookingId: d.bookingId, status: d.status, raw: d });
        }
        handleNotificationNavigation(d, user.role).catch(() => {});
      }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          return handleNotificationNavigation(
            getRemoteMessageData(remoteMessage),
            user.role,
          );
        }
      })
      .catch(() => {});

    notifee
      .getInitialNotification()
      .then(initialNotification => {
        if (initialNotification?.notification?.data) {
          return handleNotificationNavigation(
            normalizeNotificationData(initialNotification.notification.data),
            user.role,
          );
        }
      })
      .catch(() => {});

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForegroundMessage();
      unsubscribeOpenedApp();
      unsubscribeForegroundEvents();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!navigationReady || !isAuthenticated || !user) {
      return;
    }

    consumePendingNotificationNavigation()
      .then(data => {
        if (data) {
          return handleNotificationNavigation(data, user.role);
        }
      })
      .catch(() => {});
  }, [navigationReady, isAuthenticated, user]);

  return null;
}