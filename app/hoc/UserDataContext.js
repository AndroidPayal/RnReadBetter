import axios from 'axios';
import React, {useReducer} from 'react';
import {getReadersUrl} from '../values/config';
import base64 from 'react-native-base64';

const blankData = {allReaders: []};

const authReducer = (state1, action) => {
  switch (action.type) {
    case 'getAllReaders':
      return {
        ...state1,
        allReaders: action.payload.allReaders,
      };
    default:
      return state1;
  }
};

const fetchAllReaders = dispatch => {
  //FETCHING ALL READERS OF AN USER
  return async ({userid}) => {
    console.log('fetch readeers called');
    const apicall = await new Promise((resolve, reject) => {
      const encodedUserId = base64.encode(userid.toString());
      const readersUrl = getReadersUrl + '/' + encodedUserId;
      //API TO FETCH READERS
      axios
        .get(readersUrl)
        .then(response => {
          dispatch({
            type: 'getAllReaders',
            payload: {allReaders: response.data},
          });
          return resolve(response.data);
        })
        .catch(error => {
          console.log('get reader error =', error);
          return reject(error);
        });
    });
    return apicall;
  };
};

export const Context = React.createContext();

export const Provider = ({children}) => {
  const [state1, dispatch] = useReducer(authReducer, blankData);

  const boundActions = {};
  const action = {fetchAllReaders};
  for (let key in action) {
    boundActions[key] = action[key](dispatch);
  }

  const data = {
    state1,
    // fetchItems: async () => {
    //   //FETCH FUNCTION TO INITIALLISE SESSION WITH LOCAL STORAGE
    // },
  };

  return (
    <Context.Provider value={{state1, ...boundActions}}>
      {children}
    </Context.Provider>
  );
};
