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
    });

    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotificationNavigation(getRemoteMessageData(remoteMessage), user.role).catch(
        () => {},
      );
    });

    const unsubscribeForegroundEvents = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        handleNotificationNavigation(
          normalizeNotificationData(detail.notification.data),
          user.role,
        ).catch(() => {});
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