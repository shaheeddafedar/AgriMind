import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SmartIrrigationScreen from '../screens/SmartIrrigationScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import { ROUTES } from './routes';
import colors from '../theme/colors';
import useTranslation from '../i18n';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.HOME_TAB}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME_TAB}
        component={HomeScreen}
        options={{
          tabBarLabel: t('nav_home', 'Home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.DASHBOARD_TAB}
        component={DashboardScreen}
        options={{
          tabBarLabel: t('nav_dashboard', 'Dashboard'),
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="seedling"
              size={19}
              color={color}
              solid={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.IRRIGATION_TAB}
        component={SmartIrrigationScreen}
        options={{
          tabBarLabel: t('nav_irrigation', 'Irrigation'),
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome5
              name="tint"
              size={19}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.ANALYTICS_TAB}
        component={AnalyticsScreen}
        options={{
          tabBarLabel: t('nav_analytics', 'Analytics'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          tabBarLabel: t('nav_feedback', 'Feedback'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubble' : 'chatbubble-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.PROFILE_TAB}
        component={ProfileScreen}
        options={{
          tabBarLabel: t('nav_profile', 'Profile'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
