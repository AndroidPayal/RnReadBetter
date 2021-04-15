import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Text, Button, Input} from 'react-native-elements';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/EvilIcons';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Context as AuthContext} from '../../hoc/AuthContext';
import {darkGray, white} from '../../values/colors';
import {ToastAndroid} from 'react-native';
import {globalStyle} from '../../values/constants';

export default function LoginScreen(props) {
  const [emailphone, setEmailPhone] = useState('8962607775');
  const [password, setPassword] = useState('payalpalash');
  const [user, setUser] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [passwordInputError, setPasswordError] = useState('');
  const [accessInputError, setAccessError] = useState('');

  const {state, signin} = useContext(AuthContext);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '994684385038-u7eni5obrpt4p72ojr75tvm5efudisb4.apps.googleusercontent.com',
      offlineAccess: true,
      // forceCodeForRefreshToken: true,
    });
    isSignedIn();
  }, []);

  const isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!!isSignedIn) {
      getCurrentUserInfo();
    } else {
      console.log('Please Login');
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      setUser(userInfo);
      console.log('setting user:', userInfo);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        alert('User has not signed in yet');
        console.log('User has not signed in yet');
      } else {
        alert("Something went wrong. Unable to get user's info");
        console.log("Something went wrong. Unable to get user's info");
      }
    }
  };
  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUser({}); // Remember to remove the user from your app's state as well
    } catch (error) {
      console.error(error);
    }
  };
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('signedIn setting user:', userInfo);
      setUser(userInfo);
    } catch (error) {
      console.log('Message', error.message, 'error:', error.code);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play Services Not Available or Outdated');
      } else {
        console.log('Some Other Error Happened');
      }
    }
  };
  const handleUserLogin = e => {
    console.log('handling login');
    e.preventDefault();
    if (emailphone == '') {
      setAccessError('Required field!');
    } else if (password == '') {
      setAccessError(''); //TO DISAPPEAR ERROR MESSAGE
      setPasswordError('Password required!');
    } else {
      setPasswordError('');
      setLoading(true);
      signin({email: emailphone, password: password})
        .then(res => {
          console.log('sign in successfull = ', res);
          // if(res != 'success'){
          //   setLoading(false)
          //   ToastAndroid.show('Some Error Occured!',ToastAndroid.SHORT)
          // }
        })
        .catch(error => {
          console.log('sign in error = ', error);
          if (error == 'Wrong Id Password') {
            ToastAndroid.show('Incorrect Id/Password !', ToastAndroid.SHORT);
          } else {
            ToastAndroid.show('Some Error Occured!', ToastAndroid.SHORT);
          }
          setLoading(false);
        });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles1.loginContainer}>
        <Image
          source={require('../../assets/read_better.png')}
          style={styles1.logoImage}
        />
        <View style={styles1.loginSubContainer}>
          <View style={styles1.inputContainer}>
            <Input
              style={[styles1.inputBox, globalStyle.font]}
              placeholder="E-mail / Phone no."
              value={emailphone}
              leftIcon={<Icon2 name="user" size={30} color="gray" />}
              onChangeText={setEmailPhone}
              errorMessage={accessInputError}
            />
          </View>
          <View style={styles1.inputContainer}>
            <Input
              style={[styles1.inputBox, globalStyle.font]}
              placeholder="password" //label
              value={password}
              leftIcon={
                <Icon1 name="shield-key-outline" size={24} color="gray" />
              } //{{ type: 'font-awesome', name: 'chevron-left' }}
              onChangeText={value => setPassword(value)}
              secureTextEntry
              errorMessage={passwordInputError}
            />
          </View>
          <View style={[styles1.loginButton]}>
            <Button
              titleStyle={globalStyle.fontBold}
              title="LOGIN"
              onPress={e => handleUserLogin(e)}
              loading={!state.token && isLoading ? true : false}
              disabled={!state.token && isLoading ? true : false}
            />
          </View>
        </View>
      </View>
      <View style={styles.saperator}>
        <View style={styles.grayLine}></View>
        <View style={styles.saperatorText}>
          <Text style={[styles.textStyle, globalStyle.font]}>
            Or Connect With
          </Text>
        </View>
        <View style={styles.grayLine}></View>
      </View>
      <View style={styles.gooleContainer}>
        <View style={styles.termsButtonContainer}>
          <Button
            titleStyle={globalStyle.font}
            title="Terms & Conditions"
            type="clear"
          />
        </View>
        <View style={styles.googleButtonContainer}>
          {/* <Button title='google' /> */}
          {/* <View style={styles.main}> */}
          {!user.idToken ? (
            <GoogleSigninButton
              style={{width: 190, height: 48}}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={signIn}
            />
          ) : (
            <TouchableOpacity onPress={signOut}>
              <Text>Logout</Text>
            </TouchableOpacity>
          )}
          {/* </View> */}
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles1 = StyleSheet.create({
  loginContainer: {
    flex: 1,
  },
  logoImage: {
    height: 100,
    width: '100%',
    resizeMode: 'contain',
    marginTop: 70,
    marginBottom: 10,
  },
  loginSubContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 10,
  },
  inputContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  inputBox: {
    marginHorizontal: 10,
  },
  loginButton: {
    margin: 10,
  },
});
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: white,
  },
  saperator: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    flexDirection: 'row',
  },
  grayLine: {
    flex: 1,
    height: 1,
    backgroundColor: darkGray,
    margin: 10,
  },
  textStyle: {
    color: darkGray,
  },
  saperatorText: {
    margin: 10,
  },
  gooleContainer: {
    height: 'auto',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  googleButtonContainer: {
    flex: 1,
    marginLeft: 0,
  },
  termsButtonContainer: {
    flex: 1,
    marginRight: 0,
  },
});
