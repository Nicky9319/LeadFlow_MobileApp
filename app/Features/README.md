# Features Directory

This directory contains all the features of the DonnaAI Mobile app, organized in a feature-based architecture similar to the Desktop app.

## Structure

```
Features/
├── home/                    # Home feature - Welcome screen with start chat button
│   ├── components/         # Home-specific components
│   │   └── WelcomeScreen.js
│   └── index.js           # Feature exports
├── chatInterface/          # Chat interface feature
│   ├── components/        # Chat-specific components
│   │   ├── ChatScreen.js
│   │   ├── MessageItem.js
│   │   └── ChatInput.js
│   └── index.js          # Feature exports
├── common/                # Shared components and utilities
│   └── components/
│       └── ui/           # Reusable UI components
├── navigation/            # Navigation-related components
│   └── components/
└── index.js              # Main Features exports
```

## Features

### Home Feature
- **WelcomeScreen**: The main landing page with the DonnaAI logo and "Start Chat" button
- Located in: `Features/home/components/WelcomeScreen.js`

### Chat Interface Feature
- **ChatScreen**: Main chat interface with message list and input
- **MessageItem**: Individual message component for user and AI messages
- **ChatInput**: Input component with send button
- Located in: `Features/chatInterface/components/`

### Common Feature
- Shared components and utilities used across multiple features
- UI components, hooks, and utilities

### Navigation Feature
- Navigation-related components and logic

## Usage

Import features from the main Features directory:

```javascript
import { WelcomeScreen } from '@/app/Features/home';
import { ChatScreen, MessageItem, ChatInput } from '@/app/Features/chatInterface';
```

Or import from the main Features index:

```javascript
import { WelcomeScreen, ChatScreen } from '@/app/Features';
```

## Benefits

1. **Modularity**: Each feature is self-contained with its own components
2. **Scalability**: Easy to add new features without affecting existing ones
3. **Maintainability**: Clear separation of concerns
4. **Reusability**: Components can be easily shared between features
5. **Consistency**: Follows the same pattern as the Desktop app
