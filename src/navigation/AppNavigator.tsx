import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../theme/colors';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Owner screens
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerBookingsScreen from '../screens/owner/OwnerBookingsScreen';
import OwnerStaffScreen from '../screens/owner/OwnerStaffScreen';
import OwnerServicesScreen from '../screens/owner/OwnerServicesScreen';
import OwnerProfileScreen from '../screens/owner/OwnerProfileScreen';

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

function getTabSVG(index: number, focused: boolean) {
  const icons = ['🏠', '📋', '👥', '✂️', '👤'];
  return icons[index] ?? '●';
}

function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" emoji="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Location"
        component={LocationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Location" emoji="📍" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Booking" emoji="📋" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Message"
        component={MessageScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Message" emoji="💬" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreenWithNav}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" emoji="👤" focused={focused} />
          ),
        }}
      />
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

function ProfileScreenWithNav({ navigation }: any) {
  return <ProfileScreen navigation={navigation} />;
}

// ─── Owner Navigator ─────────────────────────────────────────────────────────

const OwnerStack = createNativeStackNavigator();
const OwnerTab = createBottomTabNavigator();

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
      <OwnerStack.Screen name="OwnerMessages" component={MessageScreen} />
      <OwnerStack.Screen name="OwnerNotifications" component={NotificationsScreen} />
      <OwnerStack.Screen name="OwnerSalonProfile" component={EditProfileScreen} />
      <OwnerStack.Screen name="Chat" component={ChatScreen} />
      <OwnerStack.Screen name="EditProfile" component={EditProfileScreen} />
      <OwnerStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <OwnerStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <OwnerStack.Screen name="AboutUs" component={AboutUsScreen} />
    </OwnerStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
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

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: Colors.greyBorder,
    backgroundColor: Colors.white,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
  },
  tabIconContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 8 },
  tabEmoji: { fontSize: 22, opacity: 0.4 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  tabLabelActive: { color: Colors.primary, fontWeight: '700' },
});
