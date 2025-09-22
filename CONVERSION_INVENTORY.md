Conversion inventory - web-only files to convert to React Native

This file lists web-only files and notes for converting them into React Native equivalents.

Files using HTML tags, className, <img>, <input type="file">, or DOM APIs:

- components/widgets/WeatherWidget.tsx
  - Uses HTML structure, Tailwind classes, and inline SVG icons. Replace with RN View/Text/Image and icons from react-native-vector-icons or react-native-svg. Convert layout to RN StyleSheet.

- components/widgets/MarketPriceWidget.tsx
  - Uses <div>, <span>, Tailwind classes. Replace list rendering with RN Views/Text and RN icons/emoji for trends.

- components/widgets/DiseaseDetectionWidget.tsx
  - Uses <input type="file"> and <img> for displaying uploaded images. Replace with Expo ImagePicker and RN Image.

- components/widgets/ChatbotWidget.tsx
  - Uses web chat layout, scrollable div, and buttons. Convert to RN ScrollView, TextInput, TouchableOpacity. Handle auto-scroll to bottom using refs.

- components/Onboarding.tsx
  - Uses divs and buttons and Tailwind classes. Convert to RN View/Text/Button. Replace icons with RN icons.

- components/ProfileScreen.tsx
  - Uses many divs and Tailwind styles. Convert to RN layout and replace img tags with RN Image.

- components/OfflineScreen.tsx
  - Uses divs and buttons. Convert to RN Views and Buttons.

- components/*.tsx (general)
  - Many components use `className` (Tailwind) and HTML elements. All need conversion to RN primitives and StyleSheet.

- index.tsx & index.html
  - These are web entry points and not used in mobile. Skip or keep for web build only.

- Any file using `sessionStorage`, `localStorage`, `document`, `querySelector` or `addEventListener`
  - Replace with RN equivalents (AsyncStorage, refs, RN event handlers).

Conversion notes:
- For image upload (DiseaseDetectionWidget), use `expo-image-picker` and read the file URI.
- For icons, initially continue using `mobile/components/Icons.js` emoji placeholders. After conversion is functional, replace them with `react-native-vector-icons` or `react-native-svg`.

Next steps:
1. Mark inventory done in the todo list.
2. Start converting widgets: WeatherWidget -> RN, MarketPriceWidget -> RN, DiseaseDetectionWidget -> RN (with Expo ImagePicker), ChatbotWidget -> RN.
3. Run Expo and fix runtime issues iteratively.

