import React, {useEffect, useState, useContext} from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Text,
  ToastAndroid,
} from 'react-native';
import axios from 'axios';
import base64 from 'react-native-base64';
import {Card} from 'react-native-elements';
import {Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Feather';
import moment from 'moment';
import Datetimepicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNCalendarEvents from 'react-native-calendar-events';

import {Context as AuthContext} from '../../hoc/AuthContext';
import {black, darkGray, primary, white} from '../../values/colors';
import {
  getBooksOfAReader,
  getUserCredit,
  getBookRecommendedForAReader,
  setBookStartReading,
  updateReminderTimeUrl,
  default_BookImage,
} from '../../values/config';
import {globalStyle, globalTitleBar} from '../../values/constants';

export default function ReaderPage({route, navigation}) {
  const {value, signout} = useContext(AuthContext);
  const state = value.state;
  const encodedUserId = base64.encode(state.userId.toString());

  const currentReader = route.params;
  const encodedReaderId = base64.encode(currentReader.id.toString());
  const [booksCurrentlyReading, setCurrentBooks] = useState([]);
  const [booksStoppedReading, setStoppedBooks] = useState([]);
  const [booksRecommended, setbooksRecommended] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [scrollWidthCurrentBooks, setScrollWidthCurrentBooks] = useState(0);
  const [contentWidthCurrentBooks, setContentWidthCurrentBooks] = useState(0);
  const [scrollPercentCurrentBooks, setScrollPercentCurrentBooks] = useState(0);
  const [scrollElementWidthPercent, setPercentWidth] = useState(50);
  // const [userCredit, setUserCredit] = useState(0);

  var todayDate = moment(new Date()).format('YYYY-MM-DD');
  var tempTime = moment(todayDate + ' ' + currentReader.reminder_time);
  const [reminderTime, setReminderTime] = useState(new Date(tempTime));
  const [showTimer, setShowTimer] = useState(false);

  function setTitleBar() {
    const creditUrl = getUserCredit + '/' + encodedUserId;
    //API TO FETCH User Credit
    axios
      .get(creditUrl)
      .then(response2 => response2.data)
      .then(result => {
        // setUserCredit(result);
        navigation.setOptions(
          globalTitleBar(
            state.name,
            currentReader.first_name + "'s Bookshelf",
            result.credits,
            navigation,
            false,
          ),
        );
        setLoading(false);
      })
      .catch(error => console.log('credit error = ', error));
  }

  useEffect(() => {
    setLoading(true);
    const bookURL = getBooksOfAReader + '/' + encodedReaderId;
    const bookRecommendedURL =
      getBookRecommendedForAReader + '/' + encodedReaderId + '/start/reading';
    //FETCH BOOKS FROM API
    axios
      .get(bookURL)
      .then(response => response.data)
      .then(data => {
        setCurrentBooks(data.StartedBooks);
        setStoppedBooks(data.FinishedAndStopedBooks);
        //API TO GET RECOMMENDED BOOKS FOR THIS READER
        axios
          .get(bookRecommendedURL)
          .then(response => response.data)
          .then(data => {
            setbooksRecommended(data);
            setTitleBar();
          })
          .catch(error => {
            console.log('getBooks recommended response error = ', error);
          });
      })
      .catch(error => {
        console.log('getBooks url response error = ', error);
      });
  }, []);

  function handleBookClick(book) {
    navigation.navigate('BookStatus', {
      currentBook: book,
      currentReader: currentReader,
    });
  }
  const renderCurrentBooks = (item, index) => {
    return (
      <TouchableOpacity onPress={e => handleBookClick(item)}>
        <Card containerStyle={styles.bookContainer}>
          <View style={styles.cardImageContainer}>
            <Card.Image
              style={styles.cardImage}
              source={{
                uri: item.thumbnail_image
                  ? item.thumbnail_image
                  : default_BookImage,
              }}
              resizeMode="stretch"
            />
          </View>
          <View style={styles.cartTextContainer}>
            <Text
              style={[styles.cardText, globalStyle.fontBold]}
              numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  const renderAlreadyReadBooks = (item, index) => {
    return (
      <TouchableOpacity>
        <Card containerStyle={styles.bookContainer}>
          <View style={styles.cardImageContainer}>
            <Card.Image
              style={styles.cardImage}
              source={{
                uri: item.thumbnail_image
                  ? item.thumbnail_image
                  : default_BookImage,
              }}
              resizeMode="stretch"
            />
          </View>
          <View style={styles.cartTextContainer}>
            <Text
              style={[styles.cardText, globalStyle.fontBold]}
              numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };
  function handleRecommendedBookClick(book) {
    navigation.navigate('BookDescription', {
      currentBook: book,
      currentReader: currentReader,
    });
  }
  const renderRecommendedBooks = (item, index) => {
    return (
      <TouchableOpacity onPress={e => handleRecommendedBookClick(item)}>
        <Card containerStyle={styles.bookContainer}>
          <View style={styles.cardImageContainer}>
            <Card.Image
              style={styles.cardImage}
              source={{
                uri: item.thumbnail_image
                  ? item.thumbnail_image
                  : default_BookImage,
              }}
              resizeMode="stretch"
            />
          </View>
          <View style={styles.cartTextContainer}>
            <Text
              style={[styles.cardText, globalStyle.fontBold]}
              numberOfLines={2}>
              {item.name}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const handleScrollView = event => {
    if (event) {
      const scrollPerc =
        (event.nativeEvent.contentOffset.x /
          (contentWidthCurrentBooks - scrollWidthCurrentBooks)) *
        (100 - scrollElementWidthPercent);
      setScrollPercentCurrentBooks(scrollPerc);
    }
  };
  function updateReminderTime(e) {
    // console.log('update reminder time')
    RNCalendarEvents.requestPermissions((readOnly = false))
      .then(res => {
        if (res === 'authorized') {
          setShowTimer(true);
        } else {
          ToastAndroid.show('Calender permission denied', ToastAndroid.SHORT);
        }
      })
      .catch(error => {
        console.log('request permission error:', error);
      });
  }

  const onTimeChange = (event, time) => {
    setShowTimer(false);

    if (time) {
      setReminderTime(time);
      // setLoading(true);
      //UPDATE TIME IN SERVER HIT API
      const updateTimeUrl = updateReminderTimeUrl + '/' + encodedReaderId;
      const obj = {
        reminder_time: moment(time).format('HH:mm:SS'),
        _token: state.token,
      };
      console.log('url = ', updateTimeUrl, ' obj=', obj);
      //FETCH BOOKS FROM API
      axios
        .post(updateTimeUrl, obj)
        .then(response => response.data)
        .then(data => {
          console.log('updatetime res =', data);

          //UPDATE LOCAL STORAGE
          AsyncStorage.getItem('@ReminderEvents')
            .then(eventData => {
              var parsedStorage = JSON.parse(eventData);
              var tempi = parsedStorage.events.findIndex(
                obj => obj.readerName === currentReader.first_name,
              );
              parsedStorage.events[tempi].reminderTime = moment(time).format(
                'HH:mm:SS',
              );
              AsyncStorage.setItem(
                '@ReminderEvents',
                JSON.stringify(parsedStorage),
              );

              // console.log('local data =', parsedStorage);
              // console.log('old time =', parsedStorage.events[tempi].reminderTime );
              // console.log('new time =', moment(time).format('HH:mm:SS'));

              var todayDate = moment(new Date()).format('YYYY-MM-DD');
              var startDay = moment(
                todayDate + ' ' + moment(time).format('HH:mm:SS'),
              );
              var eventStartDate = moment(startDay).toISOString();
              var eventEndDate = moment(startDay).add(3, 'days').toISOString();

              // UPDATE CALENDER EVENT WITH NEW TIME
              RNCalendarEvents.saveEvent(
                parsedStorage.events[tempi].readerName + ' Lets Read Book',
                {
                  id: parsedStorage.events[tempi].eventId,
                  startDate: eventStartDate,
                  endDate: eventEndDate,
                  alarms: [
                    {
                      date: 5, //ALARM 5 MINUTE BRFORE TO START TIME
                    },
                  ],
                },
              )
                .then(res => {
                  ToastAndroid.show('Reminder time updated', ToastAndroid.SHORT,
                  );
                  // setLoading(false);
                })
                .catch(error => {
                  console.log('event update error: ', error);
                  ToastAndroid.show( 'Calender permission denied!', ToastAndroid.SHORT,
                  );
                  // setLoading(false);
                });
            })
            .catch(error => console.log('storage time update error:', error));
        })
        .catch(error => {
          console.log('update reminder time error = ', error);
          // setLoading(false);
        });
    }
  };
  const setScrollViewWidth = e => {
    if (e) setScrollWidthCurrentBooks(e.nativeEvent.layout.width);
  };
  const setContentSize = width => {
    if (width) setContentWidthCurrentBooks(width);
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
    <ScrollView>
      <SafeAreaView style={styles.parentContainer}>
        {/* REMINDER */}
        <View style={styles.heading}>
          <Text style={globalStyle.subHeading}>Daily Reminder</Text>
          <Chip style={{margin: 10, backgroundColor: primary}}>
            {moment(reminderTime).format('hh:mm a')}
          </Chip>
          <View style={{alignItems: 'flex-end', flex: 1}}>
            <Icon2 name="edit" size={20} onPress={e => updateReminderTime() } />
          </View>
        </View>

        {/* CURRENTLY READING BOOKS */}
        <View style={styles.heading}>
          <Text style={globalStyle.subHeading}>Books I'm reading</Text>
        </View>
        <View style={styles.flatlistContainer}>
          {scrollPercentCurrentBooks > 10 ? (
            <View style={styles.scrollIconLeft}>
              <Icon name="left" size={14} color={darkGray}></Icon>
            </View>
          ) : null}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={booksCurrentlyReading}
            renderItem={({item, index}) => renderCurrentBooks(item, index)}
            keyExtractor={(item, index) => index}
            onScroll={e => handleScrollView(e)}
            onLayout={ew => setScrollViewWidth(ew)}
            onContentSizeChange={(width, _) => {
              setContentSize(width);
            }}
            key={item => item}
          />
          {scrollPercentCurrentBooks < scrollElementWidthPercent - 10 ? (
            <View style={styles.scrollIconLeft}>
              <Icon name="right" size={14} color={darkGray}></Icon>
            </View>
          ) : null}
        </View>
        {/* BOOK SUGGESTIONS */}
        <View style={styles.heading}>
          <Text style={globalStyle.subHeading}>Recommended books</Text>
          <View style={{alignItems: 'flex-end', flex: 1}}>
            <Text style={[{fontSize: 14}, globalStyle.font]}>Show more</Text>
          </View>
        </View>
        <View style={styles.flatlistContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={booksRecommended}
            renderItem={({item, index}) => renderRecommendedBooks(item, index)}
            keyExtractor={(item, index) => index}
            key={item => item}></FlatList>
        </View>
        {/* BOOKS READ */}
        <View style={styles.heading}>
          <Text style={globalStyle.subHeading}>Books Read</Text>
        </View>
        <View style={styles.flatlistContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={booksStoppedReading}
            renderItem={({item, index}) => renderAlreadyReadBooks(item, index)}
            keyExtractor={(item, index) => index}
            key={item => item}></FlatList>
        </View>

        {showTimer ? (
          <Datetimepicker
            value={reminderTime}
            display="default"
            mode="time"
            onChange={onTimeChange}
            is24Hour={false} //SETTING THIS TRUE REMOVED AM/PM OPTION FROM PICKER
          />
        ) : null}
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  miniHeading: {
    fontSize: 14,
    color: black,
    opacity: 0.5,
  },
  scrollIconLeft: {
    width: 12,
    justifyContent: 'center',
  },
  heading: {
    marginTop: 20,
    marginStart: 10,
    marginEnd: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flatlistContainer: {
    height: 'auto',
    width: '100%',
    flexDirection: 'row',
  },
  parentContainer: {
    backgroundColor: white,
    flex: 1,
    padding: 10,
    paddingBottom: 10,
  },
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
