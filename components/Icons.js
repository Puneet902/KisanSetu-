import React from 'react';
import { Text, View } from 'react-native';

// Simple emoji-based icons as placeholders for the original SVG icons.
// Export every icon name the mobile components expect so imports don't resolve to `undefined`.
export const HomeIcon = ({ style }) => <Text style={style}>🏠</Text>;
export const ChatBubbleIcon = ({ style }) => <Text style={style}>💬</Text>;
export const MarketIcon = ({ style }) => <Text style={style}>🏷️</Text>;
export const CommunityIcon = ({ style }) => <Text style={style}>👥</Text>;
export const ProfileIcon = ({ style }) => <Text style={style}>👤</Text>;

// Additional icons used across the mobile components
export const LogoIcon = ({ style }) => <Text style={style}>🌾</Text>;
export const LocationMarkerIcon = ({ style }) => <Text style={style}>📍</Text>;
export const ChevronLeftIcon = ({ style }) => <Text style={style}>◀️</Text>;
export const MicIcon = ({ style }) => <Text style={style}>🎤</Text>;
export const CameraIcon = ({ style }) => <Text style={style}>📷</Text>;
export const SendIcon = ({ style }) => <Text style={style}>📩</Text>;
export const SettingsIcon = ({ style }) => <Text style={style}>⚙️</Text>;
export const RobotIcon = ({ style }) => <Text style={style}>🤖</Text>;
export const UploadCloudIcon = ({ style }) => <Text style={style}>📤</Text>;
export const OfflineIcon = ({ style }) => <Text style={style}>📴</Text>;
export const CloudIcon = ({ style }) => <Text style={style}>☁️</Text>;
export const SoilHealthIcon = ({ style }) => <Text style={style}>🌱</Text>;
export const AdvisoryDataIcon = ({ style }) => <Text style={style}>📊</Text>;

// Onboarding screen icons - Simple and minimal
export const WeatherIcon = ({ style }) => <Text style={style}>☀️</Text>;
export const DiseaseIcon = ({ style }) => <Text style={style}>🔍</Text>;
export const AdvisoryIcon = ({ style }) => <Text style={style}>💬</Text>;
export const EditIcon = ({ style }) => <Text style={style}>✏️</Text>;
export const StopIcon = ({ style }) => <Text style={style}>⏹️</Text>;
export const RefreshIcon = ({ style }) => <Text style={style}>🔄</Text>;

export default {
  HomeIcon,
  ChatBubbleIcon,
  MarketIcon,
  CommunityIcon,
  ProfileIcon,
  LogoIcon,
  LocationMarkerIcon,
  ChevronLeftIcon,
  MicIcon,
  CameraIcon,
  SendIcon,
  SettingsIcon,
  RobotIcon,
  UploadCloudIcon,
  OfflineIcon,
  CloudIcon,
  SoilHealthIcon,
  AdvisoryDataIcon,
  WeatherIcon,
  DiseaseIcon,
  AdvisoryIcon,
  EditIcon,
  StopIcon,
};
