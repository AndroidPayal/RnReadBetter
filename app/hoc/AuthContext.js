import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {sha1} from 'react-native-sha1';
import {
  authBaseUrl,
  loginUrl,
  checkAuthUrl,
  googleAuthUrl,
} from '../values/config';
import React, {useReducer} from 'react';

var dataInitialized = false;
const blankData = {token: null, email: '', userId: '', name: ''};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signout':
      return blankData;

    case 'initials':
      return {
        token: action.payload.token,
        email: action.payload.email,
        userId: action.payload.userId,
        name: action.payload.name,
      };
    case 'signin':
      return {
        token: action.payload.token,
        email: action.payload.email,
        userId: action.payload.userId,
        name: action.payload.name,
      };
    case 'signinGoogle':
      return {
        token: action.payload.token,
        email: action.payload.email,
        userId: action.payload.userId,
        name: action.payload.name,
      };
    default:
      return state;
  }
};

const signin = dispatch => {
  return async ({email, password}) => {
    const timestamp = +new Date();
    console.log('timestamp = ', timestamp);
    //GET SHA1 HASH OF TIMESTAMP
    let hash = '';
    await sha1(timestamp.toString()).then(hash2 => {
      hash = hash2.toLowerCase(); // TO LOWER CASE BCZ URL NOT ACCEPTING UPPER CASE HASH
      console.log('hash of timestamp = ', hash);
    });

    const authUrl =
      authBaseUrl + '/' + timestamp.toString() + '/' + hash.toString();

    const apicall = await new Promise((resolve, reject) => {
      console.log('promise called with url=', authUrl);
      axios
        .get(authUrl)
        .then(response => {
          //RESPONSE IS AUTH TOKEN AND WE SEND THIS WITH LOGIN URL
          const currentAuthToken = response.data.csrf_token;
          console.log('got csrf token =', currentAuthToken);

          // API CALL TO CHECK USER WITH ENTERED EMAIL ID / PHONE
          axios
            .post(loginUrl, {
              access: email, // EMAIL OR PHONE NUMBER BOTH ALLOWED
              password: password,
              _token: currentAuthToken,
            })
            .then(async res => {
              if (res.data?.isUserVerified && res.data?.isUserAuthenticated) {
                dataInitialized = true;
                //SENDING IN TO THIS USER AND SETTING LOCAL STORAGE FOR SESSION
                await AsyncStorage.setItem(
                  '@CurrentUser',
                  JSON.stringify({
                    token: currentAuthToken,
                    email: email,
                    userId: res.data.User.id,
                    name: res.data.User.name,
                  }),
                );
                dispatch({
                  type: 'signin',
                  payload: {
                    token: currentAuthToken,
                    email,
                    userId: res.data.User.id,
                    name: res.data.User.name,
                  },
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
const signinGoogle = dispatch => {
  return async ({googleData}) => {
    const timestamp = +new Date();
    //GET SHA1 HASH OF TIMESTAMP
    let hash = '';
    await sha1(timestamp.toString()).then(hash2 => {
      hash = hash2.toLowerCase(); // TO LOWER CASE BCZ URL NOT ACCEPTING UPPER CASE HASH
    });
    const authUrl =
      authBaseUrl + '/' + timestamp.toString() + '/' + hash.toString();
    const apicall = await new Promise((resolve, reject) => {
      axios
        .get(authUrl)
        .then(response => {
          //RESPONSE IS AUTH TOKEN AND WE SEND THIS WITH LOGIN URL
          const currentAuthToken = response.data.csrf_token;
          // API CALL TO VARIFY GOOGLE AUTHENTICATED DATA
          axios
            .post(googleAuthUrl, {
              Id_token: googleData.idToken,
              _token: currentAuthToken,
            })
            .then(async res => {
              console.log('server google res =', res);
              // dataInitialized = true;
              // //SENDING IN TO THIS USER AND SETTING LOCAL STORAGE FOR SESSION
              // await AsyncStorage.setItem(
              //   '@CurrentUser',
              //   JSON.stringify({
              //     token: currentAuthToken,
              //     email: email,
              //     userId: googleData.user.id,
              //     name: res.data.User.name,
              //   }),
              // );
              // dispatch({
              //   type: 'signin',
              //   payload: {
              //     token: currentAuthToken,
              //     email,
              //     userId: res.data.User.id,
              //     name: res.data.User.name,
              //   },
              // });
              // return resolve('success');
            })
            .catch(error => {
              console.log('google login url response error = ', error);
              return reject(error);
            });
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
    dispatch({type: 'signout'});
  };
};

const initials = dispatch => {
  return async () => {
    dispatch({type: 'initials'});
  };
};

export const Context = React.createContext();

export const Provider = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, blankData);

  const boundActions = {};
  const action = {signin, signout, signinGoogle, initials};
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
      try {
        const val = await AsyncStorage.getItem('@CurrentUser');
        if (val !== null) {
          const localData = JSON.parse(val);

          //FETCHING NEW TOKEN TO AVOID TOKEN EXPIRATION
          const obj = {_token: localData.token};
          axios
            .post(checkAuthUrl, obj)
            .then(function (response) {
              console.log('check auth response =', response.data);
              if (response.data.status === 'authenticated') {
                //SEND USER TO HOME SCREEN
                dispatch({type: 'initials', payload: localData});
              } else {
                //SEND USER TO LOGIN SCREEN
                AsyncStorage.removeItem('@CurrentUser');
                dispatch({type: 'initials', payload: blankData});
              }
            })
            .catch(error => {
              console.log('check auth url error response:', error);
              dispatch({type: 'initials', payload: blankData});
            });
        } else {
          //LOCAL STORAGE IS BLANK MEANS SEND USER TO LOGIN SCREEN
          console.log('local storage empty');
          dispatch({type: 'initials', payload: blankData});
        }
      } catch (error) {
        console.log('error : ', error);
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
