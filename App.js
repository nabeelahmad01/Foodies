// App.js
import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import store from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotifications, setupNotificationListeners } from './src/services/pushNotifications';
import Analytics from './src/services/analytics';
import { loadLanguage } from './src/utils/i18n';


const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_KEY_HERE';

export default function App() {
   const navigationRef = useRef();
  
    useEffect(() => {
      registerForPushNotifications();
      
      const cleanup = setupNotificationListeners(navigationRef.current);
      return cleanup;
    }, []);
     useEffect(() => {
       // Load language preference
       loadLanguage();
     }, []);
  return (
    <ThemeProvider>
      <Provider store={store}>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <NavigationContainer
            onStateChange={state => {
              // Track screen views
              const currentScreen = state?.routes[state.index]?.name;
              if (currentScreen) {
                Analytics.logScreenView(currentScreen);
              }
            }}
          >
            <AppNavigator />
          </NavigationContainer>
        </StripeProvider>
      </Provider>
    </ThemeProvider>
  );
}
