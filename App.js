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
import MainIndex from './app/screens/mainStack/Index';
import ReaderScreen from './app/screens/mainStack/ReaderPage';
import BookReading from './app/screens/mainStack/BookReading';
import BookStartRead from './app/screens/mainStack/BookStartRead'
import OnboardingScreen from './app/screens/onboarding/OnboardingScreen'
import {Context as AuthContext} from './app/hoc/AuthContext';
import {Provider as AuthProvider} from './app/hoc/AuthContext';
import {Provider as UserDataProvider} from './app/hoc/UserDataContext';
import {globalStyle, globalTitleBar} from './app/values/constants';
import ViewAllBooks from './app/screens/mainStack/ViewAllBook';
import { ourWebClientId } from './app/values/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { primary } from './app/values/colors';
import * as Sentry from "@sentry/react-native";


const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
//old working sha key = 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
//new sha key = 41:7F:69:B5:83:A8:15:0E:99:5B:7B:EC:6D:12:A5:4C:7E:F0:6F:46
//play console = 18:8C:06:1B:81:B6:C7:81:70:CB:DE:F5:5D:8A:49:A1:6F:69:7D:C3
function App() {

  Sentry.init({
    dsn: "https://8f66f11110ef47098aa466d3f867f5db@sentry.iwynoworks.com//10",
  });
  
  const {value, signout} = useContext(AuthContext);


  useEffect(() => {
    //THIS DELAY WILL RESULT IN SPLASH SCREEN
    setTimeout(() => {
      if (!value.dataInitialized) {
        value.fetchItems();
      }
    }, 1000);
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
  }, []); //value.fetchItems
  // useEffect(() => {
  //   value.checkForOnboarding()
  // },[])
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: ourWebClientId,
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

  // function HomeScreenStack({navigation}) {
  //   return (
  //     <Stack.Navigator initialRouteName={value.state.isReader ? "Reader": "Home"} >
  //       <Stack.Screen
  //         name="Home"
  //         component={HomeScreen}
  //         options={globalTitleBar()}
  //       />
  //       <Stack.Screen 
  //         name="Reader" 
  //         component={ReaderScreen} 
  //         initialParams={{
  //           refreshPage: false,
  //           currentReader: value.state}}
  //         options={globalTitleBar()}
  //       />
  //       <Stack.Screen 
  //         name="BookReading" 
  //         component={BookReading} 
  //         options={globalTitleBar()}
  //         />
  //       <Stack.Screen
  //         name="BookStartRead"
  //         component={BookStartRead}
  //         options={globalTitleBar()}
  //       />
  //       <Stack.Screen
  //         name="ViewAllBooks"
  //         component={ViewAllBooks}
  //         options={globalTitleBar()}
  //       />
  //     </Stack.Navigator>
  //   );
  // }

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
        <DrawerItem label="Log Out" onPress={() => signout_user()} />
      </DrawerContentScrollView>
    );
  }
// console.log('value.state.showOnboard = ',value.state.showOnboard);
  return !value.dataInitialized ? (
    // <ActivityIndicator style={{alignSelf:'center' , flex:1}}  
     <SplashScreen />
    //  size='large'
    // color={primary} />
  ) : (
    <NavigationContainer>
      {value.state.token === null ? (
          <Stack.Navigator>
            {value.state.showOnboard ? 
              <Stack.Screen
                name='Onboarding'
                component={OnboardingScreen}
                options={{headerShown: false}}
              /> : null}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
      ) : (
        <Stack.Navigator //Drawer.Navigator
          // drawerContent={props => <CustomDrawerContent {...props} />}
          >
          {/* <Drawer.Screen */}
          <Stack.Screen 
          name={"Home"} //value.state.isReader ? "Reader": 
          component={MainIndex} 
          options={{headerShown: false}}/>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default () => {
  return (
    <AuthProvider>
      <UserDataProvider>
        <App />
      </UserDataProvider>
    </AuthProvider>
  );
};
