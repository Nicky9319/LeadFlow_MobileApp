# DonnaAI - React Native App

A modern React Native application built with Expo, converted from TypeScript to JavaScript with a comprehensive boilerplate page.

## Features

- **JavaScript-based**: Fully converted from TypeScript to JavaScript
- **Modern UI**: Clean, responsive design with proper theming
- **Boilerplate Page**: Interactive todo app demonstrating common React Native patterns
- **Cross-platform**: Works on iOS, Android, and Web
- **Expo Router**: File-based routing for easy navigation
- **Theming**: Light and dark mode support
- **Animations**: Smooth animations using react-native-reanimated

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- Expo CLI

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Start the development server:
```bash
npm start
# or
yarn start
# or
pnpm start
```

3. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser

## Project Structure

```
donnaai/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.js       # Home screen
│   │   ├── explore.js     # Explore screen
│   │   ├── boilerplate.js # Boilerplate todo app
│   │   └── _layout.js     # Tab navigation layout
│   ├── _layout.js         # Root layout
│   └── +not-found.js      # 404 page
├── components/            # Reusable components
│   ├── ui/               # UI-specific components
│   ├── HelloWave.js      # Animated wave component
│   ├── ThemedText.js     # Themed text component
│   ├── ThemedView.js     # Themed view component
│   └── ...
├── constants/            # App constants
│   └── Colors.js         # Color definitions
├── hooks/               # Custom React hooks
│   ├── useColorScheme.js
│   ├── useColorScheme.web.js
│   └── useThemeColor.js
└── assets/              # Static assets
```

## Boilerplate Page

The boilerplate page (`app/(tabs)/boilerplate.js`) demonstrates:

- **State Management**: Using React hooks (useState)
- **User Input**: Text input with validation
- **List Rendering**: Dynamic list with key props
- **Touch Interactions**: Tap, long press, and button interactions
- **Alerts**: Confirmation dialogs
- **Styling**: Modern CSS-in-JS with StyleSheet
- **Icons**: Using Expo Vector Icons
- **Layout**: Flexbox and proper spacing

### Features of the Boilerplate:

- Add new todo items
- Toggle item completion
- Delete items with confirmation
- Clear all completed items
- Responsive design
- Modern UI with shadows and animations

## Key Components

### ThemedText
A text component that automatically adapts to light/dark themes.

### ThemedView
A view component with theme-aware background colors.

### HelloWave
An animated component using react-native-reanimated for smooth animations.

### ParallaxScrollView
A scroll view with parallax header effects.

## Navigation

The app uses Expo Router with file-based routing:

- `/` - Home tab
- `/explore` - Explore tab
- `/boilerplate` - Boilerplate todo app

## Theming

The app supports both light and dark modes:

- Automatic theme detection
- Manual theme switching
- Theme-aware components
- Consistent color palette

## Scripts

- `npm start` - Start the development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint

## Conversion Notes

This project was converted from TypeScript to JavaScript:

- Removed TypeScript dependencies
- Converted all `.tsx` and `.ts` files to `.js`
- Removed type annotations
- Updated import/export statements
- Maintained all functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## License

This project is licensed under the MIT License.
