import React, {useContext, useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import moment from 'moment';
import axios from 'axios';
import base64 from 'react-native-base64';

import {
  getReadersUrl,
  getUserCredit,
  addNewReaderUrl,
  getBooksRecommendedForAll,
  getReaderDetailFromId,
} from '../../values/config';
import NotificationService from '../../../NotificationService';
import HomeScreen from './HomeScreen';
import ReaderScreen from './ReaderPage';
import BookReading from './BookReading';
import BookStartRead from './BookStartRead';
import {Context as AuthContext} from '../../hoc/AuthContext';
import {Context as UserContext} from '../../hoc/UserDataContext';
// import {Provider as AuthProvider} from '../../hoc/AuthContext';
import {globalStyle, globalTitleBar} from '../../values/constants';
import ViewAllBooks from './ViewAllBook';
import {primary, white} from '../../values/colors';
import {ActivityIndicator} from 'react-native';
import DataCrashed from './DataCrashed';

const Stack = createStackNavigator();

export default function Index({navigation}) {
  const {value, signout} = useContext(AuthContext);
  const {state1, fetchAllReaders} = useContext(UserContext);
  const [readers, setReaders] = useState([]);
  const [flagReadersFetched, setFlagReadersFetched]  = useState(false)
  const encodedUserId = base64.encode(
    value.state.id ? value.state.id.toString() : '',
  );

  const [notification, setNotification] = useState(
    new NotificationService(onNotification),
  );

  function onNotification(notif) {
    console.log('called on notification');
    // Alert.alert(notif.title, notif.message);
  }

  function createLocalNotification(userName, reminderTime) {
    var todayDate = moment(new Date()).format('YYYY-MM-DD');
    var startDay = moment(todayDate + ' ' + reminderTime);
    var eventStartDate = moment(startDay).toISOString();

    //CHECK IF EVENT TIME HAS PASSED FOR TODAY
    if (!moment(new Date()).isBefore(eventStartDate)) {
      //THIS MEANS NOTIFICATION TIME HAS GONE SO WE ADD THIS NOTIFICATION FOR TMROW
      todayDate = moment(new Date()).add(1, 'day').format('YYYY-MM-DD');
      startDay = moment(todayDate + ' ' + reminderTime);
      eventStartDate = moment(startDay).toISOString();
    }

    var id = Math.floor(Math.random() * 1000);
    notification.scheduleNotification(userName, eventStartDate, id);
  }
  function fetchReaderDetail(readerId) {
    const apiCall = new Promise((resolve, reject) => {
      const readerDetail =
        getReaderDetailFromId + '/' + base64.encode(readerId.toString());
      //API TO FETCH READERS
      axios
        .get(readerDetail)
        .then(res => res.data)
        .then(response => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
    return apiCall;
  }
  useEffect(() => {
    if (value.state.isReader) {
      if (value.state?.id) {
        fetchReaderDetail(value.state?.id)
          .then(res => {
            setReaders(res);
            setFlagReadersFetched(true)
            console.log('routing user to home screen with reader data =', res);
          })
          .catch(error => console.log(error));
      }
    } else {
      fetchAllReaders({userid: value.state.id})
        .then(res => {
          setReaders(res);
          setFlagReadersFetched(true)
          console.log('sending user to homw screen with readers=', res);
        })
        .catch(error => {
          console.log('error feching readers = ', error);
        });
    }
  }, []);

  useEffect(() => {
    if (readers.length > 0) {
      notification.getAllScheduledNotification().then(res => {
        //GOT ALL CURRENT NOTIFICATIONS
        console.log('our current scheduled notifications are --->', res);
        readers.map((reader, i) => {
          // console.log('CHECKING data of reader ', reader.first_name);
          var currentReaderEvent = res?.find(
            obj => obj.message === reader.first_name,
          );
          //IF CURRENTREADEREVENT IS NULL || RES === []
          if (!currentReaderEvent || res === []) {
            //CREATE NOTIFICATION EVENT
            console.log(
              'create this readers notification -',
              reader.first_name,
            );
            createLocalNotification(reader.first_name, reader.reminder_time);
          } else {
            console.log('hey ! we fount event for you -', reader.first_name);
          }
        });
      });
    }
  }, [readers]);

  return value.state?.id && value.state?.name ? (
    !flagReadersFetched ? (
      <ActivityIndicator
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: white,
        }}
        size="large"
        color={primary}
      />
    ) : (
      <Stack.Navigator
        initialRouteName={value.state.isReader ? 'Reader' : 'Home'}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={globalTitleBar()}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          initialParams={{
            refreshPage: false,
            currentReader: readers[0],
          }}
          options={globalTitleBar()}
        />
        <Stack.Screen
          name="BookReading"
          component={BookReading}
          options={globalTitleBar()}
        />
        <Stack.Screen
          name="BookStartRead"
          component={BookStartRead}
          options={globalTitleBar()}
        />
        <Stack.Screen
          name="ViewAllBooks"
          component={ViewAllBooks}
          options={globalTitleBar()}
        />
      </Stack.Navigator>
    )
  ) : (
    <DataCrashed />
  );
}
