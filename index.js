/**
 * @format
 */

import notifee, {EventType} from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { savePendingNotificationNavigation } from './src/notifications/pushNotifications';

notifee.onBackgroundEvent(async ({type, detail}) => {
	if (type === EventType.PRESS && detail.notification?.data) {
		await savePendingNotificationNavigation(detail.notification.data);
	}
});

AppRegistry.registerComponent(appName, () => App);
