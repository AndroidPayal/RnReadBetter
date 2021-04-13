import 'react-native-gesture-handler';
import React, { useContext }  from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from './app/screens/SplashScreen';
import LoginScreen from './app/screens/loginStack/LoginScreen';
import HomeScreen from './app/screens/mainStack/HomeScreen';
import ReaderScreen from './app/screens/mainStack/ReaderPage'
import BookStatusScreen from './app/screens/mainStack/BookStatus'
import { Context as AuthContext } from "./app/hoc/AuthContext";
import { Provider as AuthProvider } from "./app/hoc/AuthContext";

const Stack = createStackNavigator()

function App(){
  const {state} = useContext(AuthContext)
// console.log(state);
  return (
    <NavigationContainer>
      {state.token=== null? 
          <Stack.Navigator>
            <Stack.Screen
              name='Splash'
              component={SplashScreen}
              options={{title:'Welcome', headerShown: false}}
            />
            <Stack.Screen
              name='Login'
              component={LoginScreen}
              options={{ headerShown: false}}
            />
          </Stack.Navigator>
      :
          <Stack.Navigator>
            <Stack.Screen
              name='Home'
              component={HomeScreen}
            />
            <Stack.Screen
              name='Reader'
              component={ReaderScreen}
              // options={{ headerShown: false}}
            />
            <Stack.Screen
              name='BookStatus'
              component={BookStatusScreen}
              options={{title:'Reading Status', headerShown: true}}
            />
          </Stack.Navigator>
      }
    </NavigationContainer>
  );
};

export default () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};