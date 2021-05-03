import 'react-native-gesture-handler';
import React, {useContext, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { BackHandler } from 'react-native';

import SplashScreen from './app/screens/SplashScreen';
import LoginScreen from './app/screens/loginStack/LoginScreen';
import HomeScreen from './app/screens/mainStack/HomeScreen';
import ReaderScreen from './app/screens/mainStack/ReaderPage';
import BookStatusScreen from './app/screens/mainStack/BookStatus';
import BookDescription from './app/screens/mainStack/BookDescription'
import {Context as AuthContext} from './app/hoc/AuthContext';
import {Provider as AuthProvider} from './app/hoc/AuthContext';
import {globalStyle, globalTitleBar} from './app/values/constants';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function App() {
  const {value, signout} = useContext(AuthContext);

  useEffect(() => {
    //THIS DELAY WILL RESULT IN SPLASH SCREEN
    setTimeout(() => {
      if (!value.dataInitialized) value.fetchItems();
    }, 2000);
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  }, []); //value.fetchItems

  function handleBackButton() {
    value.updateInitializedFlag();
  }
  console.log(
    'state= ',
    value.state,
    'data initialized =',
    value.dataInitialized,
  );

  function HomeScreenStack({navigation}) {
    return (
      <Stack.Navigator initialRouteName="Home" >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={globalTitleBar()}
        />
        <Stack.Screen 
          name="Reader" 
          component={ReaderScreen} 
          options={globalTitleBar()}
        />
        <Stack.Screen 
          name="BookStatus" 
          component={BookStatusScreen} 
          options={globalTitleBar()}
          />
        <Stack.Screen
          name="BookDescription"
          component={BookDescription}
          options={globalTitleBar()}
        />
      </Stack.Navigator>
    );
  }

  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem label="LogOut" onPress={() => signout()} />
      </DrawerContentScrollView>
    );
  }

  return !value.dataInitialized ? (
    <SplashScreen />
  ) : (
    <NavigationContainer>
      {value.state.token === null ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      ) : (
        <Drawer.Navigator
          drawerContent={props => <CustomDrawerContent {...props} />}>
          <Drawer.Screen name="Home" component={HomeScreenStack} />
        </Drawer.Navigator>
      )}
    </NavigationContainer>
  );
}

export default () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};
