import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ToastAndroid,
  ActivityIndicator
} from 'react-native';
import {Text, Button, Input, SocialIcon, Card} from 'react-native-elements';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/EvilIcons';
import Icon3 from 'react-native-vector-icons/AntDesign';
import Icon4 from 'react-native-vector-icons/Fontisto';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {Context as AuthContext} from '../../hoc/AuthContext';
import {darkGray, primary, white, secondary, lightGray, black} from '../../values/colors';
import {globalStyle} from '../../values/constants';

export default function Login(props){
    const [emailphone, setEmailPhone] = useState('');//8962607775
    const [password, setPassword] = useState('');//12345678
    const [user, setUser] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [passwordInputError, setPasswordError] = useState('');
    const [accessInputError, setAccessError] = useState('');
  
    const {value, signin, signinGoogle} = useContext(AuthContext);
    const state = value.state;
    const windowHeight = Dimensions.get('window').height;

    useEffect(() => {
        GoogleSignin.configure({
          webClientId:
            '994684385038-lua3v4tnr6dm2cnpvg5fc9dmrpqluvvp.apps.googleusercontent.com',
          //994684385038-lua3v4tnr6dm2cnpvg5fc9dmrpqluvvp.apps.googleusercontent.com ID IS WORKING FOR DEBUG AND RELEASE APK WITH SHA1 -> 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
          offlineAccess: true,
        });
        // isSignedIn();
      }, []);

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log('signedIn setting user:', userInfo);
            setUser(userInfo);
            signinGoogle({googleData: userInfo})
            .then(res => {
              console.log('sign in successfull = ', res);
            })
            .catch(error => {
              console.log('sign in error = ', error);
              ToastAndroid.show(error, ToastAndroid.SHORT);
              setLoading(false);
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

    const Saperator = () => {
        return(
            <View style={stylesSaperator.container}>
                <View style={stylesSaperator.grayLine}></View>
                <View style={stylesSaperator.saperatorText}>
                    <Text style={ globalStyle.font}>
                    Or Sign in with
                    </Text>
                </View>
                <View style={stylesSaperator.grayLine}></View>
            </View>
        )
    }
    const GoogleLoginView = () => {
        return(
            <View style={styleFooter.container}>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity style={styleFooter.googleView}
                      onPress={signIn}>
                        <Image
                            style={styleFooter.googleImage}
                            source={{
                            uri: 'https://www.freepnglogos.com/uploads/google-logo-png/google-logo-png-google-logos-vector-eps-cdr-svg-download-10.png'
                            }}
                            resizeMode="stretch"/>
                    </TouchableOpacity>
                    <View style={styleFooter.googleText}>
                        <Text style={globalStyle.fontMedium}>One tap google sign in</Text>
                    </View>
                </View>
                <View style={{height:40}}>
                    {/* VIEW FOR SIGN UP TEXT IN FUTURE */}
                </View>
            </View>
            )
    }
    const LoginView = () =>{
        return( 
            <View style={{flex:3}}>
                <View style={{flex:1}}>
                    <Image
                        source={require('../../assets/read_better.png')}
                        style={styles.logoImage}
                    />
                </View>
                <View style={{flex:2, marginHorizontal:30}}>
                    <View style={{flex:1, justifyContent:'center'}}>
                        <Text style={[{fontSize:24}, globalStyle.fontMedium]}>Let’s get started!</Text>
                  </View>
                     {/*  <View style={{flex:1, justifyContent:'center'}}> */}
                        <Text style={[{fontSize:12, opacity:0.50}, globalStyle.fontMedium]}>Enter your registered ID</Text>
                    {/* </View> */}
                    <View style={{flex:1, justifyContent:'center'}}>
                        <View style={styles.inputView}>
                            <Input
                                inputContainerStyle={styles.inputStyle}
                                inputStyle={globalStyle.font}
                                placeholder='Email / Phone'
                                value={emailphone}
                                onChangeText={setEmailPhone}
                                errorMessage={accessInputError}
                            />
                        </View>
                    </View>
                    <View style={{flex:1, justifyContent:'center'}}>
                        <View style={styles.inputView}>
                            <Input
                                inputContainerStyle={styles.inputStyle}
                                inputStyle={globalStyle.font}
                                placeholder='Password'
                                value={password}
                                onChangeText={value => setPassword(value)}
                                secureTextEntry
                                errorMessage={passwordInputError}
                            />
                        </View>
                    </View>
                    <View style={{flex:1, justifyContent:'center'}}>
                        <Text style={[{fontSize:12, opacity:0.50}, globalStyle.fontMedium]}>
                            Forgot password?
                        </Text>
                    </View>
                    <View style={{flex:1, justifyContent:'center'}}>
                        <View style={{flexDirection:'row'}}>
                        <View>
                            <Text style={[{fontSize:16, color:primary}, globalStyle.fontMedium]}>
                                Submit
                            </Text>
                        </View>
                        {!state.token && isLoading ?
                           <ActivityIndicator style={{width:24, height:24,flex:1, alignItems:'flex-end' }}  
                           size="small"
                           color={primary} />
                        :
                            <TouchableOpacity onPress={e => handleUserLogin(e) }
                                style={{flex:1, alignItems:'flex-end'}}>
                                <Icon4 name='arrow-right-l' size={24} color={primary} />
                            </TouchableOpacity>
                             
                        }
                        
                    </View>
                    </View>
                </View>
                {/* <View style={{height:20}}></View> */}
            </View>
        )
    }
    return(
        <View style={styles.safeArea}>
            <View style={styleBackground.container}>
                <View style={[styleBackground.topCircle,{width: windowHeight/2, height: windowHeight/2, borderRadius:windowHeight/(2*2)}]}
                />
            </View>
            <View style={styleBackground.container}>
                <View style={[styleBackground.bottomCircle, {top:windowHeight-130}]}/>
            </View>

            {LoginView()}
            {Saperator()}
            {GoogleLoginView()}
        </View>
    )
}
const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: white,
    },
    logoImage: {
        height: 51,
        width: '100%',
        resizeMode: 'contain',
        marginTop: 36,
        marginBottom: 10,
      },
      inputView: {
        width: '100%',
        height: 50,
        backgroundColor: white,
        borderRadius: 4,
        elevation:4,
      },
      inputStyle: {borderBottomWidth: 0},
})

const styleFooter = StyleSheet.create({
    container: {flex:1, justifyContent:'center', alignItems:'center'},
    googleView: {width: 50, height: 50, backgroundColor:white, elevation:4, justifyContent:'center'},
    googleImage: {width:30, height:30, marginHorizontal:10},
    googleText:{ justifyContent:'center', marginHorizontal:20, opacity:0.40},

})
const stylesSaperator = StyleSheet.create({
    container:{
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
        opacity:0.20,
        margin: 10,
      },
      saperatorText: {
        margin: 10,
      },
})
const styleBackground = StyleSheet.create({
    container:{position:'absolute'},
    bottomCircle: {width:150, height: 150, borderRadius: 150/2
        , left:-50, opacity:0.20, backgroundColor:primary},
    topCircle: { top:-11, left:62, backgroundColor: primary , opacity:0.1}
})