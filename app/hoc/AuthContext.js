import createDataContext from './createDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect} from 'react';
import axios from 'axios';
import {sha1} from 'react-native-sha1';
import {authBaseUrl, loginUrl} from '../values/config';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'signout':
      return {token: null, email: '', userId: '', name: ''};

    case 'signin':
      return {
        token: action.payload.token,
        email: action.payload.email,
        userId: action.payload.userId,
        name: action.payload.name
      }; //due to return no need of break;
    default:
      return state;
  }
};

const signin = dispatch => {
  return async ({email, password}) => {
    const timestamp = +new Date(); //'1617995738'//
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
                //SENDING IN TO THIS USER AND SETTING LOCAL STORAGE FOR SESSION
                await AsyncStorage.setItem(
                  '@CurrentUser',
                  JSON.stringify({
                    token: currentAuthToken,
                    email: email,
                    userId: res.data.User.id,
                    name: res.data.User.Name
                  }),
                );
                dispatch({
                  type: 'signin',
                  payload: {
                    token: currentAuthToken,
                    email,
                    userId: res.data.User.id,
                    name: res.data.User.name
                  },
                });
                return resolve('success');
              }else return reject('Wrong Id Password')
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
  createDataContext(
    authReducer,
    {signin, signout},
    {token: null, email: '', userId: null, name:''},
  ); //data);
// createDataContext(authReducer, {signin, signout}, {token : 1, email: 'sf',userId:'29',name:'test'})//data);
// }

/* ********** lOGIN RESPONSE JSON ************
{
    "isUserAuthenticated": true,
    "isUserVerified": true,
    "User": {
        "id": 29,
        "name": "Payal",
        "access": "8962607775",
        "access_type": "1",
        "access_verified_at": "2021-03-22 16:48:03",
        "country": "0",
        "alt_email": "",
        "verify_alt_email": null,
        "verify_alt_mobile": null,
        "verification_code": "9f5c8fab9e2839ea68b77fe30733f5fd669266b9",
        "alt_mobile": "",
        "refferal_link": "Payal1885380904",
        "refferal_from": null,
        "profile_picture": "https://thereadbettercompany.com/public/cdn/assets/media/avatars/avatar16.jpg",
        "status": "1",
        "created_at": "2021-03-22T11:15:20.000000Z",
        "updated_at": "2021-03-22T11:18:03.000000Z"
    }
}
*/
