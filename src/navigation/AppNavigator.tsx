import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme/colors';
import { AuthProvider, useAuth } from '../context/AuthContext';
import NotificationBootstrap from '../notifications/NotificationBootstrap';
import { rootNavigationRef } from './navigationRef';

// Owner screens
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerBookingsScreen from '../screens/owner/OwnerBookingsScreen';
import OwnerStaffScreen from '../screens/owner/OwnerStaffScreen';
import OwnerServicesScreen from '../screens/owner/OwnerServicesScreen';
import OwnerProfileScreen from '../screens/owner/OwnerProfileScreen';
import OwnerMessagesScreen from '../screens/owner/OwnerMessagesScreen';
import OwnerChatScreen from '../screens/owner/OwnerChatScreen';
import OwnerPromotionsScreen from '../screens/owner/OwnerPromotionsScreen';
import OwnerSalonProfileScreen from '../screens/owner/OwnerSalonProfileScreen';
import OwnerCustomersScreen from '../screens/owner/OwnerCustomersScreen';
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';
import StaffBookingsScreen from '../screens/staff/StaffBookingsScreen';
import StaffServicesScreen from '../screens/staff/StaffServicesScreen';
import StaffProfileScreen from '../screens/staff/StaffProfileScreen';

// Onboarding / Auth
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import EnableLocationScreen from '../screens/auth/EnableLocationScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import CreateNewPasswordScreen from '../screens/auth/CreateNewPasswordScreen';

// Main
import HomeScreen from '../screens/main/HomeScreen';
import CategoriesScreen from '../screens/main/CategoriesScreen';
import SalonListScreen from '../screens/main/SalonListScreen';
import SalonDetailScreen from '../screens/main/SalonDetailScreen';
import LocationScreen from '../screens/main/LocationScreen';
import BookingScreen from '../screens/main/BookingScreen';
import MessageScreen from '../screens/main/MessageScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ChatScreen from '../screens/main/ChatScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';

// Booking Flow
import BookingFlowScreen from '../screens/booking/BookingFlowScreen';
import OrderSummaryScreen from '../screens/booking/OrderSummaryScreen';
import PaymentScreen from '../screens/booking/PaymentScreen';

// Profile Sub-screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MyReviewsScreen from '../screens/profile/MyReviewsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import AddCardScreen from '../screens/profile/AddCardScreen';
import FavoriteSalonsScreen from '../screens/profile/FavoriteSalonsScreen';

// Settings
import LanguageScreen from '../screens/settings/LanguageScreen';
import PrivacyPolicyScreen from '../screens/settings/PrivacyPolicyScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';
import RateReviewScreen from '../screens/settings/RateReviewScreen';
import AboutUsScreen from '../screens/settings/AboutUsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const OWNER_TABS = [
  { name: 'OwnerDashboardTab', label: 'Home',     icon: '⊞' },
  { name: 'OwnerBookingsTab',  label: 'Bookings', icon: '◫' },
  { name: 'OwnerStaffTab',     label: 'Staff',    icon: '◉' },
  { name: 'OwnerServicesTab',  label: 'Services', icon: '✦' },
  { name: 'OwnerProfileTab',   label: 'Profile',  icon: '◎' },
];

const STAFF_TABS = [
  { name: 'StaffDashboardTab', label: 'Home', icon: '🏠' },
  { name: 'StaffBookingsTab', label: 'Bookings', icon: '📋' },
  { name: 'StaffServicesTab', label: 'Services', icon: '✂️' },
  { name: 'StaffProfileTab', label: 'Profile', icon: '👤' },
];

function OwnerCustomTabBar({ state, navigation }: any) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.container}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const tab = OWNER_TABS[index];
          return (
            <TouchableOpacity
              key={route.key}
              style={tabStyles.tab}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.8}>
              {focused && <View style={tabStyles.activePill} />}
              <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
                <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
                  {getTabSVG(index, focused)}
                </Text>
              </View>
              <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function StaffCustomTabBar({ state, navigation }: any) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.container}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const tab = STAFF_TABS[index];
          return (
            <TouchableOpacity
              key={route.key}
              style={tabStyles.tab}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.8}>
              {focused && <View style={tabStyles.activePill} />}
              <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
                <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
                  {tab.icon}
                </Text>
              </View>
              <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getTabSVG(index: number, focused: boolean) {
  const icons = ['🏠', '📋', '👥', '✂️', '👤'];
  return icons[index] ?? '●';
}

const USER_TABS = [
  { name: 'Home',     label: 'Home',     icon: '🏠' },
  { name: 'Location', label: 'Location', icon: '📍' },
  { name: 'Booking',  label: 'Booking',  icon: '📋' },
  { name: 'Message',  label: 'Message',  icon: '💬' },
  { name: 'Profile',  label: 'Profile',  icon: '👤' },
];

function UserCustomTabBar({ state, navigation }: any) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.container}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const tab = USER_TABS[index];
          return (
            <TouchableOpacity
              key={route.key}
              style={tabStyles.tab}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.8}>
              {focused && <View style={tabStyles.activePill} />}
              <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
                <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
                  {tab?.icon ?? '●'}
                </Text>
              </View>
              <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
                {tab?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const MessageStackNav = createNativeStackNavigator();

function MessageStack() {
  return (
    <MessageStackNav.Navigator screenOptions={{ headerShown: false }}>
      <MessageStackNav.Screen name="MessageMain" component={MessageScreen} />
      <MessageStackNav.Screen name="Chat" component={ChatScreen} />
    </MessageStackNav.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <UserCustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home"     component={HomeStack} />
      <Tab.Screen name="Location" component={LocationScreen} />
      <Tab.Screen name="Booking"  component={BookingScreen} />
      <Tab.Screen name="Message"  component={MessageStack} />
      <Tab.Screen name="Profile"  component={ProfileStack} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="SalonList" component={SalonListScreen} />
      <Stack.Screen name="SalonDetail" component={SalonDetailScreen} />
      <Stack.Screen name="BookingFlow" component={BookingFlowScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="AddCard" component={AddCardScreen} />
      <Stack.Screen name="FavoriteSalons" component={FavoriteSalonsScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="RateReview" component={RateReviewScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
    </Stack.Navigator>
  );
}

const ProfileStackNav = createNativeStackNavigator();

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStackNav.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStackNav.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <ProfileStackNav.Screen name="AddCard" component={AddCardScreen} />
      <ProfileStackNav.Screen name="MyReviews" component={MyReviewsScreen} />
      <ProfileStackNav.Screen name="FavoriteSalons" component={FavoriteSalonsScreen} />
      <ProfileStackNav.Screen name="Notifications" component={NotificationsScreen} />
      <ProfileStackNav.Screen name="Language" component={LanguageScreen} />
      <ProfileStackNav.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <ProfileStackNav.Screen name="HelpSupport" component={HelpSupportScreen} />
      <ProfileStackNav.Screen name="RateReview" component={RateReviewScreen} />
      <ProfileStackNav.Screen name="AboutUs" component={AboutUsScreen} />
      <ProfileStackNav.Screen name="SalonDetail" component={SalonDetailScreen} />
      <ProfileStackNav.Screen name="BookingFlow" component={BookingFlowScreen} />
      <ProfileStackNav.Screen name="Chat" component={ChatScreen} />
    </ProfileStackNav.Navigator>
  );
}

// ─── Owner Navigator ─────────────────────────────────────────────────────────

const OwnerStack = createNativeStackNavigator();
const OwnerTab = createBottomTabNavigator();
const StaffStack = createNativeStackNavigator();
const StaffTab = createBottomTabNavigator();

function OwnerTabs() {
  return (
    <OwnerTab.Navigator
      tabBar={props => <OwnerCustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <OwnerTab.Screen name="OwnerDashboardTab" component={OwnerDashboardScreen} />
      <OwnerTab.Screen name="OwnerBookingsTab"  component={OwnerBookingsScreen} />
      <OwnerTab.Screen name="OwnerStaffTab"     component={OwnerStaffScreen} />
      <OwnerTab.Screen name="OwnerServicesTab"  component={OwnerServicesScreen} />
      <OwnerTab.Screen name="OwnerProfileTab"   component={OwnerProfileScreen} />
    </OwnerTab.Navigator>
  );
}

function OwnerApp() {
  return (
    <OwnerStack.Navigator screenOptions={{ headerShown: false }}>
      <OwnerStack.Screen name="OwnerTabs" component={OwnerTabs} />
      <OwnerStack.Screen name="OwnerMessages" component={OwnerMessagesScreen} />
      <OwnerStack.Screen name="OwnerChat" component={OwnerChatScreen} />
      <OwnerStack.Screen name="OwnerPromotions" component={OwnerPromotionsScreen} />
      <OwnerStack.Screen name="OwnerCustomers" component={OwnerCustomersScreen} />
      <OwnerStack.Screen name="OwnerNotifications" component={NotificationsScreen} />
      <OwnerStack.Screen name="OwnerSalonProfile" component={OwnerSalonProfileScreen} />
      <OwnerStack.Screen name="Chat" component={ChatScreen} />
      <OwnerStack.Screen name="EditProfile" component={EditProfileScreen} />
      <OwnerStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <OwnerStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <OwnerStack.Screen name="AboutUs" component={AboutUsScreen} />
    </OwnerStack.Navigator>
  );
}

function StaffTabs() {
  return (
    <StaffTab.Navigator
      tabBar={props => <StaffCustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <StaffTab.Screen name="StaffDashboardTab" component={StaffDashboardScreen} />
      <StaffTab.Screen name="StaffBookingsTab" component={StaffBookingsScreen} />
      <StaffTab.Screen name="StaffServicesTab" component={StaffServicesScreen} />
      <StaffTab.Screen name="StaffProfileTab" component={StaffProfileScreen} />
    </StaffTab.Navigator>
  );
}

function StaffApp() {
  return (
    <StaffStack.Navigator screenOptions={{ headerShown: false }}>
      <StaffStack.Screen name="StaffTabs" component={StaffTabs} />
      <StaffStack.Screen name="StaffNotifications" component={NotificationsScreen} />
      <StaffStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <StaffStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <StaffStack.Screen name="AboutUs" component={AboutUsScreen} />
    </StaffStack.Navigator>
  );
}

export default function AppNavigator() {
  const [navigationReady, setNavigationReady] = useState(false);

  return (
    <AuthProvider>
      <NavigationContainer
        ref={rootNavigationRef}
        onReady={() => setNavigationReady(true)}>
        <>
          <RootNavigator />
          <NotificationBootstrap navigationReady={navigationReady} />
        </>
      </NavigationContainer>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isOwner = user?.role === 'owner';
  const isStaff = user?.role === 'staff';

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={isAuthenticated ? 'MainApp' : 'Onboarding'}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="EnableLocation" component={EnableLocationScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
        </>
      ) : isOwner ? (
        <Stack.Screen name="MainApp" component={OwnerApp} />
      ) : isStaff ? (
        <Stack.Screen name="MainApp" component={StaffApp} />
      ) : (
        <Stack.Screen name="MainApp" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
    paddingBottom: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.greyBorder,
    elevation: 20,
    shadowColor: '#6C3FC5',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  container: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  iconWrap: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: Colors.primary + '18',
  },
  icon: {
    fontSize: 20,
    opacity: 0.45,
  },
  iconActive: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});


