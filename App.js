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
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import SplashScreen from './app/screens/SplashScreen';
import LoginScreen from './app/screens/loginStack/Login';
import HomeScreen from './app/screens/mainStack/HomeScreen';
import ReaderScreen from './app/screens/mainStack/ReaderPage';
import BookReading from './app/screens/mainStack/BookReading';
import BookStartRead from './app/screens/mainStack/BookStartRead'
import {Context as AuthContext} from './app/hoc/AuthContext';
import {Provider as AuthProvider} from './app/hoc/AuthContext';
import {globalStyle, globalTitleBar} from './app/values/constants';
import ViewAllBooks from './app/screens/mainStack/ViewAllBook';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function App() {
  const {value, signout} = useContext(AuthContext);

  useEffect(() => {
    //THIS DELAY WILL RESULT IN SPLASH SCREEN
    setTimeout(() => {
      if (!value.dataInitialized) value.fetchItems();
    }, 1000);
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  }, []); //value.fetchItems

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '994684385038-lua3v4tnr6dm2cnpvg5fc9dmrpqluvvp.apps.googleusercontent.com',
      //994684385038-lua3v4tnr6dm2cnpvg5fc9dmrpqluvvp.apps.googleusercontent.com ID IS WORKING FOR DEBUG AND RELEASE APK WITH SHA1 -> 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
      offlineAccess: true,
    });
    // isSignedIn();
  }, []);

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
          name="BookReading" 
          component={BookReading} 
          options={globalTitleBar()}
          />
        <Stack.Screen
          name="BookStartRead"
          component={BookStartRead}
          options={globalTitleBar()}
        />
        <Stack.Screen
          name="ViewAllBooks"
          component={ViewAllBooks}
          options={globalTitleBar()}
        />
      </Stack.Navigator>
    );
  }

  async function signout_user() {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if(isSignedIn){
      //LOGOUT FROM GOOGLE THEN REMOVE DATA FROM LOCAL
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (error) {
        console.error('google signout error: ',error);
      }
    }
    signout()
  }

  function CustomDrawerContent(props) {
    return (
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem label="LogOut" onPress={() => signout_user()} />
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
