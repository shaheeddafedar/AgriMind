import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import BottomTabNavigator from './BottomTabNavigator';

import RecommendationScreen from '../screens/RecommendationScreen';
import FertilizerResultScreen from '../screens/FertilizerResultScreen';
import SmartIrrigationScreen from '../screens/SmartIrrigationScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import ChatAssistantScreen from '../screens/ChatAssistantScreen';
import AboutScreen from '../screens/AboutScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import MarketPricesScreen from '../screens/MarketPricesScreen';

import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.SPLASH}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
        <Stack.Screen name={ROUTES.MAIN_TABS} component={BottomTabNavigator} />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />

        {/* Feature Stacks */}
        <Stack.Screen name={ROUTES.RECOMMENDATION} component={RecommendationScreen} />
        <Stack.Screen name={ROUTES.FERTILIZER_RESULT} component={FertilizerResultScreen} />
        <Stack.Screen name={ROUTES.SMART_IRRIGATION} component={SmartIrrigationScreen} />
        <Stack.Screen name={ROUTES.HISTORY} component={HistoryScreen} />
        <Stack.Screen name={ROUTES.HISTORY_DETAIL} component={HistoryDetailScreen} />
        <Stack.Screen name={ROUTES.CHAT_ASSISTANT} component={ChatAssistantScreen} />
        <Stack.Screen name={ROUTES.ABOUT} component={AboutScreen} />
        <Stack.Screen name={ROUTES.FEEDBACK} component={FeedbackScreen} />
        <Stack.Screen name={ROUTES.MARKET_TAB} component={MarketPricesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
