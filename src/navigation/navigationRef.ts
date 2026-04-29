import {createNavigationContainerRef} from '@react-navigation/native';

export const rootNavigationRef = createNavigationContainerRef<any>();

export function navigateToNotificationTarget(
  targetScreen: string | undefined,
  role: string | undefined,
) {
  if (!rootNavigationRef.isReady()) {
    return false;
  }

  if (role === 'staff') {
    if (targetScreen === 'StaffBookings') {
      rootNavigationRef.navigate('MainApp', {
        screen: 'StaffTabs',
        params: {screen: 'StaffBookingsTab'},
      });
      return true;
    }

    if (targetScreen === 'StaffNotifications') {
      rootNavigationRef.navigate('MainApp', {screen: 'StaffNotifications'});
      return true;
    }

    rootNavigationRef.navigate('MainApp');
    return true;
  }

  if (role === 'owner') {
    if (targetScreen === 'OwnerBookings') {
      rootNavigationRef.navigate('MainApp', {
        screen: 'OwnerTabs',
        params: {screen: 'OwnerBookingsTab'},
      });
      return true;
    }

    if (targetScreen === 'OwnerMessages') {
      rootNavigationRef.navigate('MainApp', {screen: 'OwnerMessages'});
      return true;
    }

    if (targetScreen === 'OwnerNotifications') {
      rootNavigationRef.navigate('MainApp', {screen: 'OwnerNotifications'});
      return true;
    }

    rootNavigationRef.navigate('MainApp');
    return true;
  }

  if (targetScreen === 'Booking') {
    rootNavigationRef.navigate('MainApp', {screen: 'Booking'});
    return true;
  }

  if (targetScreen === 'Message') {
    rootNavigationRef.navigate('MainApp', {
      screen: 'Message',
      params: {screen: 'MessageMain'},
    });
    return true;
  }

  if (targetScreen === 'Notifications') {
    rootNavigationRef.navigate('MainApp', {
      screen: 'Profile',
      params: {screen: 'Notifications'},
    });
    return true;
  }

  rootNavigationRef.navigate('MainApp');
  return true;
}