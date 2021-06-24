import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {Text, Input} from 'react-native-elements';
import Icon1 from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-simple-toast';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {Context as AuthContext} from '../../hoc/AuthContext';
import {darkGray, primary, white, secondary, black} from '../../values/colors';
import {globalStyle} from '../../values/constants';
import {ourWebClientId} from '../../values/config';

export default function Login(props) {
  const [emailphone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [isGoogleLoading, setLoadingGoogle] = useState(false);
  const [passwordInputError, setPasswordError] = useState('');
  const [accessInputError, setAccessError] = useState('');
  const [flagRememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {value, signin, signinGoogle} = useContext(AuthContext);
  const state = value.state;
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: ourWebClientId,
      offlineAccess: true,
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('signedIn setting user:', userInfo);
      setUser(userInfo);
      setLoadingGoogle(true);
      signinGoogle({googleData: userInfo, flagRememberMe})
        .then(res => {
          console.log('sign in successfull = ', res);
        })
        .catch(error => {
          console.log('sign in error = ', error);
          Toast.show(error);
        });
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
    e.preventDefault();
    if (emailphone == '') {
      setAccessError('Required field!');
    } else if (password == '') {
      setAccessError(''); //TO DISAPPEAR ERROR MESSAGE
      setPasswordError('Password required!');
    } else {
      setPasswordError(''); //TO DISAPPEAR ERROR MESSAGE
      setLoading(true);
      console.log('flagRememberMe = ', flagRememberMe);
      signin({
        email: emailphone,
        password: password,
        flagRememberMe: flagRememberMe,
      })
        .then(res => {
          console.log('sign in successfull = ', res);
        })
        .catch(error => {
          console.log('sign in error = ', error);
          if (error == 'Wrong Id Password') {
            Toast.show('Incorrect Id/Password !');
          } else {
            Toast.show('Some Error Occured!');
          }
          setLoading(false);
        });
    }
  };

  const Saperator = () => {
    return (
      <View style={stylesSaperator.container}>
        <View style={stylesSaperator.grayLine}></View>
        <View style={stylesSaperator.saperatorText}>
          <Text style={globalStyle.font}>Or</Text>
        </View>
        <View style={stylesSaperator.grayLine}></View>
      </View>
    );
  };
  const GoogleLoginView = () => {
    return (
      <View style={styleFooter.container}>
        <View style={{flexDirection: 'row'}}>
          {!state.token && isGoogleLoading ? (
            <ActivityIndicator
              style={{width: 24, height: 24, alignSelf: 'center'}}
              size="small"
              color={primary}
            />
          ) : (
            <TouchableOpacity
              style={styleFooter.googleView}
              onPress={isLoading ? null : signIn}>
              {/* BCZ ISLOADING = TRUE MEANS ALREADY WORKING FOR PHONE LOGIN */}
              <Image
                style={styleFooter.googleImage}
                source={{
                  uri:
                    'https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-google-logos-vector-eps-cdr-svg-download-10.png',
                }}
                resizeMode="stretch"
              />
            </TouchableOpacity>
          )}
          <View style={styleFooter.googleText}>
            <Text style={[{fontSize: 15}, globalStyle.fontMedium]}>
              One tap Google sign-in
            </Text>
          </View>
        </View>
        <View style={{height: 40}}>
          {/* VIEW FOR SIGN UP TEXT IN FUTURE */}
        </View>
      </View>
    );
  };
  const LoginView = () => {
    return (
      <View style={{flex: 3}}>
        <View style={{flex: 1}}>
          <Image
            source={require('../../assets/read_better.png')}
            style={styles.logoImage}
          />
        </View>
        <View style={{flex: 2, marginHorizontal: 30}}>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <Text style={[{fontSize: 24}, globalStyle.fontMedium]}>
              Let’s get started!
            </Text>
          </View>
          {/*  <View style={{flex:1, justifyContent:'center'}}> */}
          {/* <Text style={[{fontSize:12, opacity:0.50}, globalStyle.fontMedium]}>Enter your registered ID</Text> */}
          {/* </View> */}
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={styles.inputView}>
              <Input
                inputContainerStyle={styles.inputStyle}
                inputStyle={globalStyle.font}
                placeholder="Email / Phone"
                value={emailphone}
                onChangeText={setEmailPhone}
                errorMessage={accessInputError}
              />
            </View>
          </View>
          <View style={{flex: 1, justifyContent: 'center', marginTop: 15}}>
            <View style={styles.inputView}>
              <View style={{width: '90%'}}>
                <Input
                  inputContainerStyle={[styles.inputStyle, globalStyle.font]}
                  inputStyle={globalStyle.font}
                  labelStyle={globalStyle.font}
                  placeholder="Password"
                  value={password}
                  onChangeText={value => setPassword(value)}
                  secureTextEntry={showPassword ? false : true}
                  errorMessage={passwordInputError}
                />
              </View>
              <TouchableOpacity
                style={styles.showPasswordParent}
                onPress={e => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <Icon1 name="eye" style={{width: 50, opacity:.5}} size={17} />
                ) : (
                  <Icon1 name="eye-slash" style={{width: 50, opacity:.50}} size={17} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <View style={{flexDirection: 'row'}}>
              <View style={{flexDirection: 'row'}}>
                <CheckBox
                  tintColors={{true: primary, false: darkGray}}
                  value={flagRememberMe}
                  onValueChange={newValue => setRememberMe(newValue)}
                />
                <View style={{justifyContent: 'center'}}>
                  <Text
                    style={[
                      {fontSize: 15, opacity: 0.5},
                      globalStyle.fontMedium,
                    ]}>
                    Remember me
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}>
                <Text
                  style={[
                    {fontSize: 15, opacity: 0.5},
                    globalStyle.fontMedium,
                  ]}>
                  Forgot password?
                </Text>
              </View>
            </View>
          </View>
          <View style={{flex: 1, justifyContent: 'center'}}>
            {
              !state.token && isLoading ? (
                <ActivityIndicator
                  style={{width: 24, height: 24, alignSelf: 'center'}}
                  size="small"
                  color={primary}
                />
              ) : (
                <TouchableOpacity
                  style={styles.loginTouchable}
                  onPress={e => (isGoogleLoading ? null : handleUserLogin(e))}>
                  <View style={styles.loginButton}>
                    <Text style={[{color: white}, globalStyle.fontBold]}>
                      Login
                    </Text>
                  </View>
                </TouchableOpacity>
              )
              //     <View>
              //         <Text style={[{fontSize:16, color:primary}, globalStyle.fontMedium]}>
              //             Login
              //         </Text>
              //     </View>
              //     <View
              //         style={{flex:1, alignItems:'flex-end'}}>
              //         <Icon4 name='arrow-right-l' size={24} color={primary} />
              //     </View>
            }
          </View>
        </View>
        {/* <View style={{height:20}}></View> */}
      </View>
    );
  };
  return (
    <View style={styles.safeArea}>
      <View style={styleBackground.container}>
        <View
          style={[
            styleBackground.topCircle,
            {
              width: windowHeight / 2,
              height: windowHeight / 2,
              borderRadius: windowHeight / (2 * 2),
            },
          ]}
        />
      </View>
      <View style={[styleBackground.container,{bottom:-30, left:-45}]}>
        <View
          style={[styleBackground.bottomCircle]}
        />
      </View>
      <View style={{position:'absolute', right: 2, bottom: 2}}>
          <Text style={[{color: secondary}, globalStyle.font]}>
            v 21.06.22
          </Text>
      </View>
      {LoginView()}
      {Saperator()}
      {GoogleLoginView()}
    </View>
  );
}
const styles = StyleSheet.create({
  showPasswordParent: {justifyContent: 'center', alignItems: 'center'},
  loginTouchable: {flexDirection: 'row', justifyContent: 'center'},
  loginButton: {
    width: 150,
    height: 50,
    backgroundColor: primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: white,
  },
  logoImage: {
    height: 70,
    width: '100%',
    resizeMode: 'contain',
    marginTop: 36,
    marginBottom: 10,
  },
  inputView: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    backgroundColor: white,
    borderRadius: 4,
    elevation: 4,
  },
  inputStyle: {borderBottomWidth: 0},
});

const styleFooter = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  googleView: {
    width: 50,
    height: 50,
    backgroundColor: white,
    elevation: 4,
    justifyContent: 'center',
  },
  googleImage: {width: 40, height: 40, alignSelf: 'center'},
  googleText: {justifyContent: 'center', marginHorizontal: 20, opacity: 0.5},
});
const stylesSaperator = StyleSheet.create({
  container: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    flexDirection: 'row',
  },
  grayLine: {
    flex: 1,
    height: 1,
    backgroundColor: black,
    opacity: 0.2,
    margin: 10,
  },
  saperatorText: {
    margin: 10,
  },
});
const styleBackground = StyleSheet.create({
  container: {position: 'absolute'},
  bottomCircle: {
    width: 150,
    height: 150,
    borderRadius: 150 / 2,
    opacity: 0.2,
    backgroundColor: primary,
  },
  topCircle: {top: -11, left: 62, backgroundColor: primary, opacity: 0.1},
});
