import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import { WeatherIcon, MarketIcon, DiseaseIcon, AdvisoryIcon } from './Icons';

const steps = [
  {
    key: 'weather',
    icon: 'weather',
    titleKey: 'onboardingWeatherTitle',
    descKey: 'onboardingWeatherDesc',
  },
  {
    key: 'market',
    icon: 'market',
    titleKey: 'onboardingMarketTitle',
    descKey: 'onboardingMarketDesc',
  },
  {
    key: 'disease',
    icon: 'disease',
    titleKey: 'onboardingDiseaseTitle',
    descKey: 'onboardingDiseaseDesc',
  },
  {
    key: 'advisory',
    icon: 'advisory',
    titleKey: 'onboardingAdvisoryTitle',
    descKey: 'onboardingAdvisoryDesc',
  },
];

const renderIcon = (iconType) => {
  const iconStyle = { fontSize: 80 };
  
  switch (iconType) {
    case 'weather':
      return <WeatherIcon style={iconStyle} />;
    case 'market':
      return <MarketIcon style={iconStyle} />;
    case 'disease':
      return <DiseaseIcon style={iconStyle} />;
    case 'advisory':
      return <AdvisoryIcon style={iconStyle} />;
    default:
      return null;
  }
};

export default function MultiStepOnboarding({ onDone, onSkip }) {
  const { t } = useLocalization();
  const [step, setStep] = useState(0);
  const last = step === steps.length - 1;

  const handleNext = () => {
    if (last) onDone && onDone();
    else setStep((s) => s + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        {renderIcon(steps[step].icon)}
      </View>
      <Text style={styles.title}>{t(steps[step].titleKey)}</Text>
      <Text style={styles.desc}>{t(steps[step].descKey)}</Text>
      <View style={styles.dots}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>{t('skip')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
          <Text style={styles.nextText}>{last ? t('getStarted') : t('next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  iconWrapper: { 
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 16, 
    textAlign: 'center',
    color: '#111827'
  },
  desc: { 
    fontSize: 16, 
    color: '#6b7280', 
    textAlign: 'center', 
    marginBottom: 48,
    lineHeight: 24,
    paddingHorizontal: 20
  },
  dots: { 
    flexDirection: 'row', 
    marginBottom: 48,
    alignItems: 'center'
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#d1d5db', 
    marginHorizontal: 4 
  },
  dotActive: { 
    backgroundColor: '#22c55e' 
  },
  buttonRow: { 
    flexDirection: 'row', 
    width: '100%', 
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  skipBtn: { 
    padding: 12 
  },
  skipText: { 
    color: '#374151', 
    fontWeight: '600', 
    fontSize: 16 
  },
  nextBtn: { 
    backgroundColor: '#22c55e', 
    borderRadius: 12, 
    paddingHorizontal: 32, 
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#22c55e'
  },
  nextText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
});
