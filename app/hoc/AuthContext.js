import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {sha1} from 'react-native-sha1';
import {
  authBaseUrl,
  loginUrl,
  checkAuthUrl,
  googleAuthUrl,
  ourWebClientId,
  rememberMeUrl,
} from '../values/config';
import React, {useReducer} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

var dataInitialized = false;
const blankData = {
  token: null,
  email: '',
  id: '',
  name: '',
  showOnboard: false,
  remember_me: null,
  isReader: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signout':
      return action.payload;

    case 'initials':
      return {
        ...state,
        token: action.payload.token,
        email: action.payload.email,
        id: action.payload.id,
        name: action.payload.name,
        remember_me: action.payload.remember_me,
        isReader: action.payload.isReader,
      };
    case 'onboarding':
      return {
        ...state,
        showOnboard: action.payload.showOnboard,
      };
    case 'signin':
      return {
        ...state,
        token: action.payload.token,
        email: action.payload.email,
        id: action.payload.id,
        name: action.payload.name,
        remember_me: action.payload.remember_me,
        isReader: action.payload.isReader,
        showOnboard: action.payload.showOnboard,
      };
    case 'signinGoogle':
      return {
        ...state,
        token: action.payload.token,
        email: action.payload.email,
        id: action.payload.id,
        name: action.payload.name,
        remember_me: action.payload.remember_me,
        isReader: action.payload.isReader,
        showOnboard: action.payload.showOnboard,
      };
    default:
      return state;
  }
};

const signin = dispatch => {
  return async ({email, password, flagRememberMe}) => {
    const apicall = await new Promise((resolve, reject) => {
      getNew_Csrf_token()
        .then(response => {
          //RESPONSE IS AUTH TOKEN AND WE SEND THIS WITH LOGIN URL
          const currentAuthToken = response.csrf_token;
          console.log('got csrf token =', currentAuthToken);

          // API CALL TO CHECK USER WITH ENTERED EMAIL ID / PHONE
          axios
            .post(loginUrl, {
              access: email, // EMAIL OR PHONE NUMBER BOTH ALLOWED
              password: password,
              _token: currentAuthToken,
            })
            .then(async res => {
              console.log('login response = ', res.data);
              if (res.data?.isUserVerified && res.data?.isUserAuthenticated) {
                dataInitialized = true;
                const newObj = {
                  token: currentAuthToken,
                  email: email,
                  id: res.data?.isReaderAccount
                    ? res.data.User.self_reader_id
                    : res.data.User.id,
                  name: res.data.User.name,
                  remember_me: flagRememberMe ? res.data.remember_me : null,
                  isReader: res.data?.isReaderAccount ? true : false,
                  showOnboard: false,
                };
                //SENDING IN TO THIS USER AND SETTING LOCAL STORAGE FOR SESSION
                await AsyncStorage.setItem(
                  '@CurrentUser',
                  JSON.stringify(newObj),
                );
                dispatch({
                  type: 'signin',
                  payload: newObj,
                });
                return resolve('success');
              } else return reject('Wrong Id Password');
            })
            .catch(error => {
              console.log('login url response error = ', error);
              return reject(error);
            });
        })
        .catch(error => {
          console.log('getToken url response error = ', error);
          return reject(error);
        });
    });
    return apicall;
  };
};
const googleSignOut = async () => {
  GoogleSignin.configure({
    webClientId: ourWebClientId,
    offlineAccess: true,
  });
  //CHECK IS SIGNED IN
  const isSignedIn = await GoogleSignin.isSignedIn();
  if (isSignedIn) {
    //LOGOUT FROM GOOGLE THEN REMOVE DATA FROM LOCAL
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('google signout error: ', error);
    }
  }
};
const signinGoogle = dispatch => {
  return async ({googleData, flagRememberMe}) => {
    const apicall = await new Promise((resolve, reject) => {
      getNew_Csrf_token()
        .then(response => {
          //RESPONSE IS AUTH TOKEN AND WE SEND THIS WITH LOGIN URL
          const currentAuthToken = response.csrf_token;
          if (currentAuthToken) {
            // API CALL TO VARIFY GOOGLE AUTHENTICATED DATA
            axios
              .post(googleAuthUrl, {
                Id_token: googleData.idToken,
                _token: currentAuthToken,
              })
              .then(response => response.data)
              .then(async res => {
                console.log('server google res =', res);
                if (!res.isUserVerified || !res.isUserAuthenticated) {
                  googleSignOut();
                  return reject('User not authenticated');
                } else {
                  dataInitialized = true;
                  const newObj = {
                    token: currentAuthToken,
                    email: res.User.access,
                    id: res.User.id,
                    name: res.User.name,
                    remember_me: flagRememberMe ? res.remember_me : null,
                    isReader: false,
                    showOnboard: false,
                  };
                  //SENDING IN TO THIS USER AND SETTING LOCAL STORAGE FOR SESSION
                  await AsyncStorage.setItem(
                    '@CurrentUser',
                    JSON.stringify(newObj),
                  );
                  dispatch({
                    type: 'signin',
                    payload: newObj,
                  });
                  return resolve('success');
                }
              })
              .catch(error => {
                console.log('google login url response error = ', error);
                return reject(error);
              });
          }
        })
        .catch(error => {
          console.log('getToken url response error 2 = ', error);
          return reject(error);
        });
    });
    return apicall;
  };
};

const signout = dispatch => {
  return async () => {
    await AsyncStorage.removeItem('@CurrentUser');
    console.log('logiing out with ', blankData);
    dispatch({type: 'signout', payload: { ...blankData, showOnboard: false}});
  };
};
const onboarding = dispatch => {
  return async () => {
    dispatch({
      type: 'onboarding',
      payload: {showOnboard: false},
    });
  };
};

const initials = dispatch => {
  return async () => {
    dispatch({type: 'initials'});
  };
};
function getNew_Csrf_token(params) {
  const newcsrf = new Promise(async (resolve, reject) => {
    //REMEMBER ME OPTION CHECK
    const timestamp = +new Date();
    console.log('inside function timestamp = ', timestamp);
    //GET SHA1 HASH OF TIMESTAMP
    let hash = '';
    await sha1(timestamp.toString()).then(hash2 => {
      hash = hash2.toLowerCase(); // TO LOWER CASE BCZ URL NOT ACCEPTING UPPER CASE HASH
      console.log('inisde hash of timestamp = ', hash);
    });

    const authUrl =
      authBaseUrl + '/' + timestamp.toString() + '/' + hash.toString();
    axios
      .get(authUrl)
      .then(response => {
        //RESPONSE IS AUTH TOKEN AND WE SEND THIS WITH LOGIN URL
        const currentAuthToken = response.data.csrf_token;
        console.log('inside got csrf token =', currentAuthToken);
        resolve({
          csrf_token: currentAuthToken,
          timestamp: timestamp,
          hash: hash,
        });
      })
      .catch(error => {
        console.log('error gene. csrf =', error);
        reject(error);
      });
  });
  return newcsrf;
}

export const Context = React.createContext();

export const Provider = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, blankData);

  const boundActions = {};
  const action = {signin, signout, signinGoogle, initials, onboarding};
  for (let key in action) {
    boundActions[key] = action[key](dispatch);
  }

  const value = {
    state,
    dataInitialized,
    updateInitializedFlag: () => {
      dataInitialized = false;
    },
    fetchItems: async () => {
      //FETCH FUNCTION TO INITIALLISE SESSION WITH LOCAL STORAGE
      dataInitialized = true;
      const oldUserFlag = await AsyncStorage.getItem('@NewUser');
      try {
        const val = await AsyncStorage.getItem('@CurrentUser');
        if (val !== null) {
          const localData = JSON.parse(val);
          //CHECK LOCALDATA.CSRF EXPIRED OF NOT  -> IF EXPIRED GENERATE NEW CSRF AND HIT CHECK AUTH
          //BUT HERE FETCHING NEW TOKEN TO AVOID TOKEN EXPIRATION
          getNew_Csrf_token()
            .then(res => {
              console.log('response csrf function =', res);
              const obj = {_token: res.csrf_token};
              //UPDATE LOCAL STORAGE WITH NEW TOKEN
              localData.token = res.csrf_token;
              AsyncStorage.setItem('@CurrentUser', JSON.stringify(localData));

              axios
                .post(checkAuthUrl, obj)
                .then(async function (response) {
                  console.log('check auth response =', response.data);
                  if (response.data.status === 'authenticated') {
                    //SEND USER TO HOME SCREEN
                    dispatch({type: 'initials', payload: localData});
                  } else if (localData.remember_me != null) {
                    const rememberCheckUrl =
                      rememberMeUrl +
                      '/' +
                      res.timestamp.toString() +
                      '/' +
                      localData.remember_me.toString() +
                      '/' +
                      res.hash.toString();

                    //CHECK IF WE HAVE REMEMBER ME TOKEN
                    axios
                      .post(rememberCheckUrl, obj)
                      .then(function (response) {
                        console.log('remember me res = ', response.data);
                        if (
                          response.data.isUserAuthenticated &&
                          response.data.isUserVerified
                        ) {
                          //SEND USER TO HOME SCREEN
                          dispatch({type: 'initials', payload: localData});
                        } else {
                          //SEND USER TO LOGIN SCREEN
                          AsyncStorage.removeItem('@CurrentUser');
                          dispatch({type: 'initials', payload: blankData});
                        }
                      })
                      .catch(error => {
                        //SEND USER TO LOGIN SCREEN
                        AsyncStorage.removeItem('@CurrentUser');
                        dispatch({type: 'initials', payload: blankData});
                      });
                  } else {
                    //SEND TO LOGIN SCREEN
                    dispatch({type: 'initials', payload: blankData});
                  }
                })
                .catch(error => {
                  console.log('check auth url error response:', error);
                  dispatch({type: 'initials', payload: blankData});
                });
            })
            .catch(error => {
              console.log('response error = ', error);
            });
        } else {
          //LOCAL STORAGE IS BLANK MEANS SEND USER TO LOGIN SCREEN
          if (!oldUserFlag) {
            blankData.showOnboard = true;
          }
          console.log('local storage empty', ' blank data =', blankData);
          dispatch({type: 'initials', payload: blankData});
        }
      } catch (error) {
        if (!oldUserFlag) {
          blankData.showOnboard = true;
        }
        console.log('error : ', error, 'blank data =', blankData);
        dispatch({type: 'initials', payload: blankData});
      }
    },
  };

  return (
    <Context.Provider value={{value, ...boundActions}}>
      {children}
    </Context.Provider>
  );
};
