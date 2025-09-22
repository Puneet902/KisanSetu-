import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../components/HomeScreen';
import MarketScreen from '../components/MarketScreen';
import CommunityScreen from '../components/CommunityScreen';
import AdvisoryScreen from '../components/AdvisoryScreen';
import ProfileScreen from '../components/ProfileScreen';
import { HomeIcon, MarketIcon, CommunityIcon, ChatBubbleIcon, ProfileIcon } from '../components/Icons';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: HomeIcon }} />
      <Tab.Screen name="Advisory" component={AdvisoryScreen} options={{ tabBarIcon: ChatBubbleIcon }} />
      <Tab.Screen name="Market" component={MarketScreen} options={{ tabBarIcon: MarketIcon }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarIcon: CommunityIcon }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ProfileIcon }} />
    </Tab.Navigator>
  );
}
