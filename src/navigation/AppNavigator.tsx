import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <OwnerTab.Screen
        name="OwnerDashboardTab"
        component={OwnerDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Dashboard" emoji="🏠" focused={focused} />
          ),
        }}
      />
      <OwnerTab.Screen
        name="OwnerBookingsTab"
        component={OwnerBookingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Bookings" emoji="📋" focused={focused} />
          ),
        }}
      />
      <OwnerTab.Screen
        name="OwnerStaffTab"
        component={OwnerStaffScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Staff" emoji="👥" focused={focused} />
          ),
        }}
      />
      <OwnerTab.Screen
        name="OwnerServicesTab"
        component={OwnerServicesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Services" emoji="✂️" focused={focused} />
          ),
        }}
      />
      <OwnerTab.Screen
        name="OwnerProfileTab"
        component={OwnerProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" emoji="👤" focused={focused} />
          ),
        }}
      />
    </OwnerTab.Navigator>
  );
}

function OwnerApp() {
  return (
    <OwnerStack.Navigator screenOptions={{ headerShown: false }}>
      <OwnerStack.Screen name="OwnerTabs" component={OwnerTabs} />
      <OwnerStack.Screen name="OwnerMessages" component={MessageScreen} />
      <OwnerStack.Screen name="OwnerNotifications" component={NotificationsScreen} />
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
