// App.js
import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import store from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_STRIPE_KEY_HERE';

export default function App() {
  return (
    <Provider store={store}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </StripeProvider>
    </Provider>
  );
}
