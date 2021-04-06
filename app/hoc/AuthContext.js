import createDataContext from './createDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect} from 'react';
import axios from 'axios';
import {sha1} from 'react-native-sha1';
import { authBaseUrl, loginUrl } from "../values/config";

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signout':
      return {token: null, email: '',userId:''};

    case 'signin':
      return {
        token: action.payload.token,
        email: action.payload.email,
        userId:action.payload.userId
      }; //due to return no need of break;
    default:
      return state;
  }
};

const signin = dispatch => {
  return async ({email, password}) => {
    const timestamp = +new Date();
    console.log('timestamp = ',timestamp);
    //GET SHA1 HASH OF TIMESTAMP
    sha1(timestamp.toString()).then(hash => {
      hash = hash.toLowerCase(); // TO LOWER CASE BCZ URL NOT ACCEPTING UPPER CASE HASH
      console.log('hash of timestamp = ',hash);

      const authUrl =
        authBaseUrl+ '/' + timestamp.toString() + '/' + hash.toString();
      axios
        .get(authUrl)
        .then(response => {
          //RESPONSE IS AUTH TOKEN AND WE SEND THIS WITH LOGIN URL
          // console.log('current auth token = ', response.data);
          const currentAuthToken = response.data.csrf_token;

          // API CALL TO CHECK USER WITH ENTERED EMAIL ID / PHONE
          axios
            .post(loginUrl, {
              access: email, // EMAIL OR PHONE NUMBER BOTH ALLOWED
              password: password,
              _token: currentAuthToken,
            })
            .then(async res => {
              // console.log('login response = ', res.data);
              if (res.data?.isUserVerified && res.data?.isUserAuthenticated) {
                //SENDING IN TO THIS USER AND SETTING LOCAL STORAGE FOR SESSION
                await AsyncStorage.setItem(
                  '@CurrentUser',
                  JSON.stringify({
                    token: currentAuthToken,
                    email: email,
                    userId: res.data.User.id
                  }),
                );
                dispatch({
                  type: 'signin',
                  payload: {
                    token: currentAuthToken,
                    email,
                    userId:res.data.User.id
                  },
                });
              }
            })
            .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
    });
  };
};

const signout = dispatch => {
  return async () => {
    await AsyncStorage.removeItem('@CurrentUser');
    dispatch({type: 'signout'});
  };
};

export const {Provider, Context} = //async()=>{
  // const res = await AsyncStorage.getItem('@CurrentUser')
  // let token = null
  // let email = ''
  // if(res){
  // const data = await JSON.parse(res)
  //   token = data.token
  //   email = data.email
  // }
  // console.log('data = ', data);
  // return await new 
  // createDataContext(authReducer, {signin, signout}, {token : null, email: '',userId:null})//data);
  createDataContext(authReducer, {signin, signout}, {token : 1, email: 'sf',userId:'29'})//data);
// }
