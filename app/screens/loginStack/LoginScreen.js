import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Text, Button, Input, SocialIcon} from 'react-native-elements';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/EvilIcons';
import Icon3 from 'react-native-vector-icons/AntDesign';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {Context as AuthContext} from '../../hoc/AuthContext';
import {darkGray, primary, white, secondary, lightGray} from '../../values/colors';
import {ToastAndroid} from 'react-native';
import {globalStyle} from '../../values/constants';

export default function LoginScreen(props) {
  const [emailphone, setEmailPhone] = useState('8962607775');
  const [password, setPassword] = useState('payalpalash');
  const [user, setUser] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [passwordInputError, setPasswordError] = useState('');
  const [accessInputError, setAccessError] = useState('');

  const {value, signin, signinGoogle} = useContext(AuthContext);
  const state = value.state;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '994684385038-lua3v4tnr6dm2cnpvg5fc9dmrpqluvvp.apps.googleusercontent.com',
      //994684385038-lua3v4tnr6dm2cnpvg5fc9dmrpqluvvp.apps.googleusercontent.com ID IS WORKING FOR DEBUG AND RELEASE APK WITH SHA1 -> 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
      offlineAccess: true,
    });
    isSignedIn();
  }, []);

  const isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (!!isSignedIn) {
      getCurrentUserInfo();
    } else {
      console.log('User not logged in with google');
    }
  };
  /* GOOGLE SIGN IN RESPONSE AS USER INFO
  {"idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImRlOTU1NmFkNDY4MDMxMmMxMTdhZmFlZjI5MjBmNWY5OWE0Yzc5ZmQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5OTQ2ODQzODUwMzgtdm02bmZsamw0dDByYmQxbXJ1MXMyaDhhNDNlNjdwNGouYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI5OTQ2ODQzODUwMzgtbHVhM3Y0dG5yNmRtMmNucHZnNWZjOWRtcnBxbHV2dnAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTMzNTc1MDAyNDk2OTkxOTI1ODciLCJoZCI6InNzaXBtdC5jb20iLCJlbWFpbCI6InBheWFsLmFncmF3YWxAc3NpcG10LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiUGF5YWwgQWdyYXdhbCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHaFhWVHpEalpGcTY0WnNJdVd4M1QxWUpDXzJYa2FTMno4ZHRjNEhsZz1zOTYtYyIsImdpdmVuX25hbWUiOiJQYXlhbCIsImZhbWlseV9uYW1lIjoiQWdyYXdhbCIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNjE5MTgzOTkzLCJleHAiOjE2MTkxODc1OTN9.Pg-YS2aLmA2eZqckmqEo--5CmLDC3Q9PGakd3eh4CcLYpC3bo47tQH8wotiE4HJD5NxWUc_sNcvITe6QMqjnrFZelBuThsj8mT8koSlOnMOMvgarYKGocTYqTo0Yvm8r9Sdzolkvdg8GwrvKb3Kn0_A1Lhyvznf6q6u_03qe-79VxKHTHMI82NiJOOia9FSFT3DH8vxvKvB9UUKYiSYJ_bE0mwOk0Kq0LE_efqOETq7QToZmw0oCdMxtREKbZ45AeY7q7HgPsFBhxFBWxAa3fRyREzjXlwaIGI5V0Wix12wczcBsKGh7xCAGXak0GXsCR4soQGSeQGAMDDvRYQjfNQ", "scopes": ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"], "serverAuthCode": "4/0AY0e-g79tSbfTINGfaeJZNcDcHVmG5xskeGgsxR93oXWFl6Idtl671MfFco-kHTErxcynw", "user": {"email": "payal.agrawal@ssipmt.com", "familyName": "Agrawal", "givenName": "Payal", "id": "113357500249699192587", "name": "Payal Agrawal", "photo": "https://lh3.googleusercontent.com/a-/AOh14GhXVTzDjZFq64ZsIuWx3T1YJC_2XkaS2z8dtc4Hlg=s96-c"}}
  */
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
      signinGoogle({googleData: userInfo});
      // .then(res => {
      //   console.log('sign in successfull = ', res);
      // })
      // .catch(error => {
      //   console.log('sign in error = ', error);
      //   if (error == 'Wrong Id Password') {
      //     ToastAndroid.show('Incorrect Id/Password !', ToastAndroid.SHORT);
      //   } else {
      //     ToastAndroid.show('Some Error Occured!', ToastAndroid.SHORT);
      //   }
      //   setLoading(false);
      // });
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
      <Image
        source={require('../../assets/read_better.png')}
        style={stylePhoneLogin.logoImage}
      />
      <View style={stylePhoneLogin.loginContainer}>
        <View style={stylePhoneLogin.loginSubContainer}>
          <View style={stylePhoneLogin.inputContainer}>
            <Input
              style={[stylePhoneLogin.inputBox, globalStyle.font]}
              placeholder="E-mail / Phone no."
              value={emailphone}
              leftIcon={<Icon2 name="user" size={30} color="gray" />}
              onChangeText={setEmailPhone}
              errorMessage={accessInputError}
            />
          </View>
          <View style={stylePhoneLogin.inputContainer}>
            <Input
              style={[stylePhoneLogin.inputBox, globalStyle.font]}
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
          <View style={[stylePhoneLogin.loginButton]}>
            <Button
              icon={
                <Icon1
                  name="login"
                  size={20}
                  color={white}
                  style={{marginHorizontal:10}}
                />
              }
              buttonStyle={{backgroundColor:secondary}}
              titleStyle={globalStyle.fontBold}
              title="LOGIN"
              onPress={e => handleUserLogin(e)}
              loading={!state.token && isLoading ? true : false}
              disabled={!state.token && isLoading ? true : false}
            />
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
      
        <View style={styles.googleButtonContainer}>
          {!user.idToken ? (
            // <GoogleSigninButton
            //   style={{width: 190, height: 48}}
            //   size={GoogleSigninButton.Size.Wide}
            //   color={GoogleSigninButton.Color.Dark}
            //   onPress={signIn}
            // />
            <View style={[stylePhoneLogin.loginButton]}>
              <Button
                icon={
                  <Icon3
                    name="google"
                    size={20}
                    color={secondary}
                    style={{marginHorizontal:10}}
                  />
                }
                type='outline'
                buttonStyle={{borderColor:secondary}}
                titleStyle={[{color:secondary},globalStyle.fontBold]}
                title="Sign In With Google"
                onPress={signIn}
                // loading={!state.token && isLoading ? true : false}
                disabled={!state.token && isLoading ? true : false}
              />
          </View>
          ) : (
            <TouchableOpacity onPress={signOut}>
              <Text>Logout</Text>
            </TouchableOpacity>
          )}
          {/* </View> */}
        </View>
      </View>
      <View style={styles.gooleContainer}>
        {/* <View style={styles.termsButtonContainer}> */}
          <Button
            titleStyle={[{color:secondary},globalStyle.font]}
            title="Terms & Conditions"
            type="clear"
          />
        {/* </View> */}
      </View>
    </SafeAreaView>
  );
}
const stylePhoneLogin = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent:'center'
  },
  logoImage: {
    height: 100,
    width: '100%',
    resizeMode: 'contain',
    marginTop: 70,
    marginBottom: 10,
  },
  loginSubContainer: {
    // flex: 1,
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
    width:250,
    alignSelf:'center'
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
    // justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 20,
    marginStart:10
  },
  googleButtonContainer: {
    // flex: 1,
    alignItems:'center'
    // marginLeft: 0,
  },
  termsButtonContainer: {
    flex: 1,
    marginRight: 0,
  },
});
