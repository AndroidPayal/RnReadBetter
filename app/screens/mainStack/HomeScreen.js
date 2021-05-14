import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, FlatList} from 'react-native';
import {View, StyleSheet, SafeAreaView} from 'react-native';
import {Text} from 'react-native-elements';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import base64 from 'react-native-base64';
import {Card} from 'react-native-elements';
import RNCalendarEvents from 'react-native-calendar-events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

import {Context as AuthContext} from '../../hoc/AuthContext';
import {
  white,
  readerBackground,
  primary,
  black,
  mediumGray,
  lightGray,
} from '../../values/colors';
import {
  getReadersUrl,
  getUserCredit,
  addNewReaderUrl,
  getBooksRecommendedForAll,
  default_BookImage
} from '../../values/config';
import {TouchableOpacity} from 'react-native';
import AddReader from './AddReader';
import {ActivityIndicator} from 'react-native';
import {globalStyle, globalTitleBar} from '../../values/constants';

export default function HomeScreen({navigation}) {
  const {value, signout} = useContext(AuthContext);
  const state = value.state;
  const encodedUserId = base64.encode(state.userId.toString());
  const [readers, setReaders] = useState([]);
  const [flagNewReader, setFlagNewReader] = useState(false);
  const [userCredit, setUserCredit] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [popularBooks, setPopularBooks] = useState([]);
  const [openAddOverlay, setToggleOverlay] = useState(false);

  function createEventInLocalStorage(localDataArray, newEventId, formatedDate, reminderAt, name) {
    if (!localDataArray) {
      localDataArray = {events: []};
    }
    const temp = {
      reminderTime: reminderAt,
      readerName: name,
      createdAt: formatedDate,
      eventId: newEventId,
    };
    localDataArray.events.push(temp);
    console.log('final data adding to local = ', localDataArray);
    AsyncStorage.setItem(
      '@ReminderEvents',
      JSON.stringify(localDataArray),
    );
  }
  async function createEventInCalender(title, start, end){
    const createEvent = await new Promise((resolve, reject) => {
      RNCalendarEvents.saveEvent(title, {
          startDate: start,
          endDate: end,
          alarms: [
            {
              date: 5, //ALARM 5 MINUTE BRFORE TO START TIME
            },
          ],
        },
      )              
      .then(eventId => {
        console.log('new event id= ', eventId);
        resolve(eventId)
      })
      .catch(error=>reject(error))
    })
    return createEvent;
  }
  function removeEventFromLocalStorage(localArray, data1) {
    const index = localArray?.events?.findIndex(
      obj => obj.readerName === data1,
    );
    localArray.events.splice(index, 1); //Remove item of this index
  }

  useEffect(() => {
    const readerReminder = new Promise(async (resolve, reject) => {
      const permission = await RNCalendarEvents.checkPermissions(
        (readOnly = false),
      );

      if (permission === 'authorized') {
        if (readers.length > 0) {
          const today = moment(new Date()).toISOString();
          const endDate = moment(today).add(3, 'days').toISOString();
          const calenderCurrentEvents = await RNCalendarEvents.fetchAllEvents(
            today,
            endDate,
          );
          var localEvents = JSON.parse(
            await AsyncStorage.getItem('@ReminderEvents'),
          );

          readers.map((reader, i) => {
            var todayDate = moment(new Date()).format('YYYY-MM-DD');
            var startDay = moment(todayDate + ' ' + reader.reminder_time);
            var eventStartDate = moment(startDay).toISOString();
            var eventEndDate = moment(startDay).add(3, 'days').toISOString();
            // console.log('event start --> ', eventStartDate);
            // console.log('event end --> ', eventEndDate);

            var currentReaderEvent = localEvents?.events?.find(
              obj => obj.readerName === reader.first_name,
            );

            //If NO EVENT EXIST FOR THIS READER IN LOCAL STORAGE
            if (currentReaderEvent) {
              console.log(
                'event of this reader found in storage:',
                currentReaderEvent.readerName,
              );

              //CHECK CALENDER EVENT OF THIS READER WITH LOCAL STORAGE DATA EXIST OR NOT
              const calenderData = calenderCurrentEvents.find(
                obj => obj.id === currentReaderEvent.eventId,
              );

              //MEANS THIS EVENT IS PRESENT IN CALENDER TOO
              if (calenderData) {
                console.log('event present in calender too!!!!!');
                //CHECK IF REMINDER TIME OF THIS READER UPDATED (FROM WEB)
                if (currentReaderEvent.reminderTime != reader.reminder_time) {
                  //CREATE THIS READER EVENT IN CALENDER
                  createEventInCalender(reader.first_name + ' Lets Read Book', eventStartDate, eventEndDate)
                  .then(res=>{
                    //AND UPDATE LOCAL STORAGE DATA WITH NEW EVENT ID
                    removeEventFromLocalStorage(localEvents, reader.first_name)
  
                    createEventInLocalStorage(localEvents, res, todayDate, reader.reminder_time, reader.first_name)
                  })
                  .catch(error=>{console.log('error: ',error)})
                }
              } else {
                console.log(
                  'no event in calender for ',
                  currentReaderEvent.readerName,
                );
                //CREATE THIS READER EVENT IN CALENDER
                createEventInCalender(reader.first_name + ' Lets Read Book', eventStartDate, eventEndDate)
                .then(res=>{
                  //AND UPDATE LOCAL STORAGE DATA WITH NEW EVENT ID
                  removeEventFromLocalStorage(localEvents, reader.first_name)

                  createEventInLocalStorage(localEvents, res, todayDate, reader.reminder_time, reader.first_name)
                })
                .catch(error=>{console.log('error: ',error)})
              }
            } else {
              console.log('event not found for reader=', reader.first_name);
              //CREATE AN EVENT
              createEventInCalender(reader.first_name + ' Lets Read Book', eventStartDate, eventEndDate)
              .then((res)=>{
                //ADD NEW USER REMINDER TIME TO LOCAL STORAGE
                createEventInLocalStorage(localEvents, res, todayDate, reader.reminder_time, reader.first_name)
              })
              .catch(error=>console.log('error event creation: ', error))
            }
          });
        }
      } else {
        reject('calender permission denied');
        RNCalendarEvents.requestPermissions((readOnly = false));
      }
      return resolve(permission);
    });
  }, [readers]);

  function setTitleBar() {
    const creditUrl = getUserCredit + '/' + encodedUserId;
    //API TO FETCH User Credit
    axios
      .get(creditUrl)
      .then(response2 => response2.data)
      .then(result => {
        setUserCredit(result);
        navigation.setOptions(
          globalTitleBar(state.name.substring(0,1), '', result.credits, navigation, true),
        );
        setLoading(false);
      })
      .catch(error => console.log('credit error = ', error));
  }
  function fetchRecommendedBooks() {
    const recommendedBookUrl = getBooksRecommendedForAll;
    //API TO FETCH READERS
    axios
    .get(recommendedBookUrl)
    .then(res=>res.data)
    .then(response => {
      setRecommendedBooks(response)
      var tagArray = response

      var randomIndex = Math.floor(Math.random() * (tagArray.length-10))
      tagArray = tagArray.slice(randomIndex,randomIndex+10)
      setPopularBooks(tagArray)
  })
    .catch(error => {
      console.log('get recommended books error =', error);
    });
  }
  useEffect(() => {
    setLoading(true);
    const readersUrl = getReadersUrl + '/' + encodedUserId;
    //API TO FETCH READERS
    axios
      .get(readersUrl)
      .then(response => {
        setReaders(response.data);
        fetchRecommendedBooks()
        setTitleBar();
      })
      .catch(error => {
        console.log('get reader error =', error);
      });
  }, [flagNewReader]);

  function handleRecommendedBookClick(item) {
    navigation.navigate('BookStartRead', {
      currentBook: item,
      currentReader: null,
      haveReader: false
    });
  }
  const renderRecommendedBooks = (item, index) => {
    return (
      <TouchableOpacity onPress={e => handleRecommendedBookClick(item)}
      >
        <Card containerStyle={styleBookList.bookContainer}>
          <View style={styleBookList.cardImageContainer}>
            <Card.Image
              style={styleBookList.cardImage}
              source={item.thumbnail_image ? {uri: item.thumbnail_image} : require('../../assets/image_break_100.png')}
              resizeMode={item.thumbnail_image ? "stretch" : "center"}
            />
          </View>
          <View style={styleBookList.cartTextContainer}>
            <Text
              style={[styleBookList.cardText, globalStyle.fontBold]}
              numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const handleReaderSelection = (e, reader) => {
    navigation.navigate('Reader',{
      refreshPage: false,
      currentReader: reader,
    });
  };
  const readersListView = readers.map((reader, i) => (
    <TouchableOpacity key={i} onPress={e => handleReaderSelection(e, reader)}>
      <View
        style={{
          height: 100,
          width: 80,
          backgroundColor: readerBackground[i]
            ? readerBackground[i]
            : readerBackground[Math.floor(Math.random() * 4)],
          alignItems: 'center',
          borderRadius: 8,
          marginRight: 5,
        }}>
        <View style={styles.readerIcon}>
          <Icon1 name="face-outline" size={40} color={white} />
        </View>
        <Text style={[styles.readerName, globalStyle.fontBold]}>
          {reader.first_name}
        </Text>
      </View>
    </TouchableOpacity>
  ));
  function handleAddReader() {
    setToggleOverlay(true);
  }
  function cancelAddReader(e) {
    setToggleOverlay(false);
  }
  function addNewReader(obj) {
    setLoading(true);
    obj._token = state.token; //ADDING CSRF TOKEN TO URL
    console.log('add reader url=', addNewReaderUrl, '\nobj = ', obj);

    // API TO ADD NEW READER
    const apicall = new Promise((resolve, reject) => {
      axios
        .post(addNewReaderUrl, obj)
        .then(response => response.data)
        .then(data => {
          console.log('add reader response = ', data);
          setLoading(false);
          setFlagNewReader(flagNewReader === true ? false : true);

          //CREATE CALENDER EVENT
          var todayDate = moment(new Date()).format('YYYY-MM-DD');
          var startDay = moment(todayDate + ' ' + obj.time_picker);
          var eventStartDate = moment(startDay).toISOString();
          var eventEndDate = moment(startDay).add(3, 'days').toISOString(); //months/ years
          console.log('event start --> ', eventStartDate);
          console.log('event end --> ', eventEndDate);

          createEventInCalender(obj.firstname_reader + ' lets read Book', eventStartDate, eventEndDate)
          .then((res)=>{
            //ADD NEW USER REMINDER TIME TO LOCAL STORAGE
            AsyncStorage.getItem('@ReminderEvents')
            .then(eventData => {
              var newEventData = eventData
                ? JSON.parse(eventData)
                : {events: []};
              createEventInLocalStorage(newEventData, res, todayDate, obj.time_picker, obj.firstname_reader)
            })
            .catch(error => console.log('storage error:', error));
          });

          return resolve(data.message.toString());
        })
        .catch(error => {
          console.log('error adding new log:', error);
          return reject(error);
        });
    });
    return apicall;
  }
  const headerRender = () => {
    return (
      <View style={styles.welcomeContainer}>
        <Text style={[styles.grayHeading, globalStyle.subHeading]}>
          Reader Profiles
        </Text>
        <View style={styles.readerContainer}>
          <ScrollView horizontal={true}>{readersListView}</ScrollView>
          <TouchableOpacity onPress={e => handleAddReader()}>
            <View style={styles2.readerBox1}>
              <Icon2 name="plus" size={28} color={mediumGray} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return isLoading ? (
    <ActivityIndicator
      style={{
        flex: 1,
        justifyContent: 'center',
        backgroundColor: white
      }}
      size="large"
      color={primary}
    />
  ) : (
    <ScrollView style={styles.mainContainer}>
      <SafeAreaView style={styles.mainContainer}>
        {headerRender()}
        <View>
          <View style={styles2.popularBookHeading}>
            <Text style={globalStyle.subHeading}>Recommended Books</Text>
            {/* <View style={{alignItems: 'flex-end', flex: 1}}>
              <Text style={[{fontSize: 14}, globalStyle.font]}>Show more</Text>
            </View> */}
          </View>

          <View style={styles2.flatlistContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recommendedBooks}
              renderItem={({item, index}) =>
                renderRecommendedBooks(item, index)
              }
              keyExtractor={(item, index) => index}
              key={item => item}></FlatList>
          </View>
        </View>

        <View>
          <View style={styles2.popularBookHeading}>
            <Text style={globalStyle.subHeading}>Most Rated Books</Text>
            {/* <View style={{alignItems: 'flex-end', flex: 1}}>
              <Text style={[{fontSize: 14}, globalStyle.font]}>Show more</Text>
            </View> */}
          </View>
          <View style={styles2.flatlistContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={popularBooks}
              renderItem={({item, index}) =>
                renderRecommendedBooks(item, index)
              }
              keyExtractor={(item, index) => index}
              key={item => item}></FlatList>
          </View>
        </View>

        <AddReader
          openAddOverlay={openAddOverlay}
          cancelAddReader={cancelAddReader}
          addNewReader={addNewReader}
        />
      </SafeAreaView>
    </ScrollView>
  );
}

const styleBookList = StyleSheet.create({
  bookContainer: {
    elevation: 4,
    padding: 0,
    borderRadius: 7,
    width: 150,
    height: 200,
  }, //3 line = , width: 160, height: 220
  cardImage: {borderTopLeftRadius: 5, borderTopRightRadius: 5, height: '100%'},
  cardImageContainer: {
    height: '80%',
  },
  cardText: {
    textAlign: 'center',
    fontSize: 12,
  },
  cartTextContainer: {
    height: '20%',
    justifyContent: 'space-around',
  },
});
const styles2 = StyleSheet.create({
  flatlistContainer: {
    height: 'auto',
    width: '100%',
    flexDirection: 'row',
  },
  readerBox1: {
    width: 80,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularBookHeading: {
    marginTop: 10,
    marginStart: 10,
    marginEnd: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardText: {
    color: black,
    minHeight: 30,
    alignSelf: 'center',
    textAlignVertical: 'center',
  },
});
const styles = StyleSheet.create({
  readerContainer: {
    width: '100%',
    height: 'auto',
    flexDirection: 'row',
    marginTop: 10,
  },
  readerName: {
    color: white,
    fontSize: 14,
    margin: 2,
  },
  readerIcon: {
    flex: 1,
    justifyContent: 'center',
  },
  mainContainer: {
    backgroundColor: white,
    flex: 1,
    paddingBottom: 5,
  },
  welcomeContainer: {
    margin: 10,
    // flex: 0.6,
  },
  grayHeading: {
    color: black,
    marginBottom: 5,
  },
});
