import { useContext } from 'react';
import { LocalizationContext } from '../localization/LocalizationProvider';

export const useLocalization = () => {
  return useContext(LocalizationContext);
};

export default useLocalization;
