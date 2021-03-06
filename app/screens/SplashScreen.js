import React, {useEffect, useContext} from 'react';
import {View, StyleSheet, SafeAreaView, Image} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {Context as AuthContext} from '../hoc/AuthContext';
import { black, white } from '../values/colors';

export default function SplashScreen(props) {
  const {value} = useContext(AuthContext);
  const state = value.state;

  // useEffect(() => {
  //   //SEND TO (HAVE SESSION ? HOME : LOGIN)  SCREEN
  //   const redirectScreen = state.token ? 'Home' : 'Login';
  //   setTimeout(() => {
  //     // props.navigation.navigate('Login')

  //     //THIS DISPACH REMOVES SPLASH SCREEN FROM STACK ONCE WE REACH NEXT SCREEN
  //     props.navigation.dispatch(
  //       CommonActions.reset({
  //         index: 1,
  //         routes: [{name: redirectScreen}],
  //       }),
  //     );
  //   }, 3000);
  // }, []);

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.background}>
        {/* <Image
          style={styles.logo}
          source={require('../assets/logo_loader.gif')}></Image> */}
           <Image
              source={require('../assets/read_better.png')}
              style={styles.logoImage}
          />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    backgroundColor: white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    // height: '30%',
    resizeMode:'contain'
  },
});
