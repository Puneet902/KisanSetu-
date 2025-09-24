import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalization } from '../hooks/useLocalization';
import { HomeIcon, ChatBubbleIcon, MarketIcon, CommunityIcon, ProfileIcon } from './Icons';

const { width: screenWidth } = Dimensions.get('window');

const BottomNav = ({ activeTab, setActiveTab }) => {
  const { t } = useLocalization();
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef({}).current;
  const opacityAnims = useRef({}).current;
  
  const navItems = [
    { id: 'home', label: t('home'), icon: <HomeIcon width={22} height={22} /> },
    { id: 'advisory', label: t('advisory'), icon: <ChatBubbleIcon width={22} height={22} /> },
    { id: 'market', label: t('market'), icon: <MarketIcon width={22} height={22} /> },
    { id: 'community', label: t('community'), icon: <CommunityIcon width={22} height={22} /> },
    { id: 'profile', label: t('profile'), icon: <ProfileIcon width={22} height={22} /> },
  ];

  // Initialize animations
  useEffect(() => {
    navItems.forEach((item) => {
      if (!scaleAnims[item.id]) {
        scaleAnims[item.id] = new Animated.Value(activeTab === item.id ? 1.1 : 1);
      }
      if (!opacityAnims[item.id]) {
        opacityAnims[item.id] = new Animated.Value(activeTab === item.id ? 1 : 0.6);
      }
    });
  }, []);

  // Update animations when active tab changes
  useEffect(() => {
    const activeIndex = navItems.findIndex(item => item.id === activeTab);
    const tabWidth = (screenWidth - 40) / navItems.length; // Account for container padding
    const indicatorPosition = 20 + (activeIndex * tabWidth) + (tabWidth / 2) - 20; // Center the indicator
    
    // Animate floating indicator
    Animated.spring(indicatorAnim, {
      toValue: indicatorPosition,
      useNativeDriver: true,
      tension: 120,
      friction: 9,
    }).start();

    // Animate all tabs
    navItems.forEach((item) => {
      const isActive = activeTab === item.id;
      
      // Scale animation with bounce
      Animated.spring(scaleAnims[item.id], {
        toValue: isActive ? 1.1 : 1,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }).start();

      // Opacity animation
      Animated.timing(opacityAnims[item.id], {
        toValue: isActive ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab]);

  const handleTabPress = (itemId) => {
    // Add haptic feedback
    if (Platform.OS === 'ios') {
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(itemId);
  };

  return (
    <View style={styles.container}>
      {/* Main glass container */}
      <BlurView intensity={100} tint="systemUltraThinMaterialDark" style={styles.blurContainer}>
        {/* Glass overlay with gradient */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.1)',
            'rgba(255, 255, 255, 0.05)',
            'rgba(0, 0, 0, 0.1)'
          ]}
          style={styles.glassOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Floating active indicator */}
          <Animated.View
            style={[
              styles.floatingIndicator,
              {
                transform: [{ translateX: indicatorAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']}
              style={styles.indicatorGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            {/* Inner glow */}
            <View style={styles.indicatorInnerGlow} />
          </Animated.View>

          {/* Navigation items */}
          <View style={styles.nav}>
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleTabPress(item.id)}
                  style={styles.navItem}
                  activeOpacity={0.8}
                >
                  <Animated.View
                    style={[
                      styles.navItemContent,
                      {
                        transform: [{ scale: scaleAnims[item.id] || 1 }],
                        opacity: opacityAnims[item.id] || 0.6,
                      },
                    ]}
                  >
                    {/* Icon container with glass morphism */}
                    <View style={[
                      styles.iconContainer,
                      isActive && styles.activeIconContainer
                    ]}>
                      {/* Background blur for active state */}
                      {isActive && (
                        <BlurView 
                          intensity={20} 
                          tint="light" 
                          style={styles.iconBlur}
                        />
                      )}
                      
                      {/* Icon with enhanced styling */}
                      <View style={styles.iconWrapper}>
                        {React.cloneElement(item.icon, {
                          color: isActive ? '#ffffff' : 'rgba(255,255,255,0.8)',
                        })}
                      </View>
                      
                      {/* Active state glow effect */}
                      {isActive && (
                        <View style={styles.iconGlow}>
                          {React.cloneElement(item.icon, {
                            color: 'rgba(102, 126, 234, 0.6)',
                          })}
                        </View>
                      )}
                    </View>

                    {/* Enhanced label */}
                    <Animated.Text
                      style={[
                        styles.label,
                        { 
                          color: isActive ? '#ffffff' : 'rgba(255,255,255,0.8)',
                          opacity: opacityAnims[item.id] || 0.6,
                        },
                        isActive && styles.activeLabel,
                      ]}
                    >
                      {item.label}
                    </Animated.Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Top border with rainbow effect */}
          <View style={styles.topBorder}>
            <LinearGradient
              colors={[
                'transparent', 
                'rgba(102, 126, 234, 0.3)', 
                'rgba(118, 75, 162, 0.3)',
                'rgba(240, 147, 251, 0.3)',
                'transparent'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topBorderGradient}
            />
          </View>

          {/* Bottom accent line */}
          <View style={styles.bottomAccent} />
        </LinearGradient>
      </BlurView>

      {/* Shadow container for iOS-like depth */}
      <View style={styles.shadowContainer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  shadowContainer: {
    position: 'absolute',
    top: -10,
    left: 15,
    right: 15,
    bottom: Platform.OS === 'ios' ? 3 : 7,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
    borderRadius: 28,
  },
  blurContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassOverlay: {
    position: 'relative',
    backdropFilter: 'blur(20px)',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  topBorderGradient: {
    flex: 1,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingIndicator: {
    position: 'absolute',
    top: 12,
    width: 40,
    height: 3,
    borderRadius: 2,
    zIndex: 1,
  },
  indicatorGradient: {
    flex: 1,
    borderRadius: 2,
  },
  indicatorInnerGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
  },
  nav: {
    flexDirection: 'row',
    height: 75,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 15 : 12,
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
    borderRadius: 16,
    marginBottom: 6,
    overflow: 'hidden',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  iconBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  iconWrapper: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1.8 }],
    zIndex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  activeLabel: {
    fontWeight: '700',
    textShadowColor: 'rgba(102, 126, 234, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default BottomNav;