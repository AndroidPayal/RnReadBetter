import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {sha1} from 'react-native-sha1';
import {authBaseUrl, loginUrl} from '../values/config';
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
      }; //due to return no need of break;
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
                dataInitialized = true
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
              return reject(error);
            });
        })
        .catch(error => {
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
  const action = {signin, signout, initials};
  for (let key in action) {
    boundActions[key] = action[key](dispatch);
  }

  const value = {
    state,
    dataInitialized,
    fetchItems: async () => {//FETCH FUNCTION TO INITIALLISE SESSION WITH LOCAL STORAGE
      dispatch({type: ''});
      // axios
      // .get("https://jsonplaceholder.typicode.com/todos")
      // .then(function(response) {
      //   console.log('dispaching initial');
      //   dataInitialized = true
      //   dispatch({ type: 'initials', payload: {token: 1, email: 'ab', userId: 1, name:'bd'} });
      // });

      try {
        const val = await AsyncStorage.getItem('@CurrentUser');
        if (val !== null) {
          const localData = JSON.parse(val);
          dataInitialized = true;
          
          const timestamp = +new Date();
          console.log('timestamp1 = ', timestamp);
          //GET SHA1 HASH OF TIMESTAMP
          let hash = '';
          await sha1(timestamp.toString()).then(hash2 => {
            hash = hash2.toLowerCase(); // TO LOWER CASE BCZ URL NOT ACCEPTING UPPER CASE HASH
            console.log('hash of timestamp1 = ', hash);
          });
      
          const authUrl =
            authBaseUrl + '/' + timestamp.toString() + '/' + hash.toString();

            
            axios
              .get(authUrl)
              .then(function(response) {
                console.log('old token =', localData.token);
                localData.token = response.data.csrf_token
                console.log('new token =', response.data.csrf_token);
                 AsyncStorage.setItem(
                  '@CurrentUser',
                  JSON.stringify({
                    token: response.data.csrf_token,
                    email: localData.email,
                    userId: localData.userId,
                    name: localData.name,
                  }),
                );
                dispatch({type: 'initials', payload: localData});
              });
        }
      } catch (error) {
        console.log('error : ', error);
      }
    },
  };

  return (
    <Context.Provider value={{value, ...boundActions}}>
      {children}
    </Context.Provider>
  );
};

// export const {Provider, Context} =
//   createDataContext(
//     authReducer,
//     {signin, signout},
//     {token: null, email: '', userId: null, name:''},
//   );
