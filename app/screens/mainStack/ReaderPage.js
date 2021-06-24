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
} from 'react-native';
import Toast from 'react-native-simple-toast';
import axios from 'axios';
import base64 from 'react-native-base64';
import {Card} from 'react-native-elements';
import {Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Feather';
import moment from 'moment';
import Datetimepicker from '@react-native-community/datetimepicker';
import { NavigationContainer, useIsFocused , useFocusEffect} from '@react-navigation/native';

import {Context as AuthContext} from '../../hoc/AuthContext';
import {Context as UserContext} from '../../hoc/UserDataContext';
import {black, darkGray, primary, white} from '../../values/colors';
import {
  getBooksOfAReader,
  getUserCredit,
  getBookRecommendedForAReader,
  updateReminderTimeUrl,
} from '../../values/config';
import {globalStyle, globalTitleBar} from '../../values/constants';
import NotificationService from '../../../NotificationService';
import { ourWebClientId } from '../../values/config';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export default function ReaderPage({route, navigation}) {
  const {value, signout} = useContext(AuthContext);
  const {state1, fetchAllReaders } = useContext(UserContext);
  const state = value.state;
  const encodedUserId = base64.encode(state.id.toString());

  const currentReaderId = state.isReader ? route.params.currentReader.id : route.params.currentReaderId;
  const [currentReader, setCurrentReader] = useState(state.isReader ? route.params.currentReader : state1.allReaders.find(obj => obj.id === currentReaderId)) 
  console.log('current reader = ',currentReader);
  const encodedReaderId = base64.encode(currentReaderId.toString());
  // const refreshPage = route.params.refreshPage;
  // var refreshPage = route.params.refreshPage
  // const [refreshState, setRefreshState] = useState(route.params.refreshPage)
  const [booksCurrentlyReading, setCurrentBooks] = useState([]);
  const [booksStoppedReading, setStoppedBooks] = useState([]);
  const [booksFinishedeading, setFinishedBooks] = useState([]);
  const [booksRecommended, setbooksRecommended] = useState([]);
  const [isLoading, setLoading] = useState(false);
  {
    /*CURRENT BOOK SCROLL*/
  }
  const [scrollWidthCurrentBooks, setScrollWidthCurrentBooks] = useState(0);
  const [contentWidthCurrentBooks, setContentWidthCurrentBooks] = useState(0);
  const [scrollPercentCurrentBooks, setScrollPercentCurrentBooks] = useState(0);
  const [scrollElementWidthPercent, setPercentWidth] = useState(50);
  {
    /*RECOMMENDED BOOK SCROLL*/
  }
  const [
    scrollWidthRecommendedBooks,
    setScrollWidthRecommendedBooks,
  ] = useState(0);
  const [
    contentWidthRecommendedBooks,
    setContentWidthRecommendedBooks,
  ] = useState(0);
  const [
    scrollPercentRecommendedBooks,
    setScrollPercentRecommendedBooks,
  ] = useState(0);
  {
    /*ALREADY READ BOOK SCROLL*/
  }
  const [scrollWidthReadBooks, setScrollWidthReadBooks] = useState(0);
  const [contentWidthReadooks, setContentWidthReadBooks] = useState(0);
  const [scrollPercentReadBooks, setScrollPercentReadBooks] = useState(0);
  const [notification, setNotification] = useState(
    new NotificationService(onNotification),
  );

  var todayDate = moment(new Date()).format('YYYY-MM-DD');
  var time = currentReader.reminder_time
  var tempTime = moment(todayDate + ' ' + time);//? currentReader?.reminder_time: '00:00:00'
  const [reminderTime, setReminderTime] = useState(new Date(tempTime));
  const [showTimer, setShowTimer] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      console.log('hi we r inside foucs');
      setLoading(true);
      fetchMyBooks()
      fetchRecommendedBooks()
      setLoading(false);
      return () => {
        console.log('reached return  of focus');
      };
    }, [])
  );

  function onNotification(notif) {
    console.log('called on notification of reader page');
    // Alert.alert(notif.title, notif.message);
  }
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: ourWebClientId,
      offlineAccess: true,
    });
    // isSignedIn();
  }, []);
  const logOut = async() => {
    console.log('log out called');
    const isSignedIn = await GoogleSignin.isSignedIn();
    if(isSignedIn){
      //LOGOUT FROM GOOGLE THEN REMOVE DATA FROM LOCAL
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (error) {
        console.error('google signout error: ',error);
      }
    }
    signout()
  }

  function setTitleBar() {
    // const creditUrl = getUserCredit + '/' + encodedUserId;
    // //API TO FETCH User Credit
    // axios
    //   .get(creditUrl)
    //   .then(response2 => response2.data)
    //   .then(result => {
    //     // setUserCredit(result);
        navigation.setOptions(
          globalTitleBar(
            state.name.substring(0, 1),
            currentReader?.first_name + "'s Bookshelf",
            null,
            navigation,
            value.state.isReader ? true : false,
            logOut
          )
        );
      // })
      // .catch(error => {
      //   console.log('credit error = ', error);
      //   Toast.show(
      //     "Server Error! can't fetch credit"
      //   );
      // });
  }

  function fetchMyBooks(params) {
    const bookURL = getBooksOfAReader + '/' + encodedReaderId;
     //FETCH BOOKS FROM API
    axios
    .get(bookURL)
    .then(response => response.data)
    .then(data => {
      setCurrentBooks(data.StartedBooks);
      setFinishedBooks(data.FinishedBooks);
      setStoppedBooks(data.StoppedBooks);
    })
    .catch(error => {
      console.log('getBooks url response error = ', error);
      Toast.show(
        "Server Error! can't fetch books"
      );
    });
  }
  function fetchRecommendedBooks(params) {
    const bookRecommendedURL =
    getBookRecommendedForAReader + '/' + encodedReaderId + '/start/reading';
        //API TO GET RECOMMENDED BOOKS FOR THIS READER
        axios
          .get(bookRecommendedURL)
          .then(response => response.data)
          .then(data => {
            // console.log('recommended books = ', data);
            setbooksRecommended(data);
          })
          .catch(error => {
            console.log('getBooks recommended response error = ', error);
            Toast.show(
              "Server Error! can't fetch recommendations"
            );
          });
  }
  useEffect(() => {
    // setLoading(true);
    // fetchMyBooks()
    setTitleBar();
    // setLoading(false);
    // fetchRecommendedBooks()
  }, []);//refreshPage

  function handleBookClick(book) {
    navigation.navigate('BookReading', {
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
              source={
                item.thumbnail_image
                  ? {uri: item.thumbnail_image}
                  : require('../../assets/image_break.png')
              }
              resizeMode={'stretch'}
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
  function handleStoppedBookClick(book) {
    navigation.navigate('BookStartRead', {
      currentBook: book,
      currentReader: currentReader,
      haveReader: true,
      noActionButtons: true
    });
  }
  const renderAlreadyReadBooks = (item, index) => {
    return (
      <TouchableOpacity onPress={e => handleStoppedBookClick(item)}>
        <Card containerStyle={styles.bookContainer}>
          <View style={styles.cardImageContainer}>
            <Card.Image
              style={styles.cardImage}
              source={
                item.thumbnail_image
                  ? {uri: item.thumbnail_image}
                  : require('../../assets/image_break.png')
              }
              resizeMode={'stretch'}
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
    navigation.navigate('BookStartRead', {
      currentBook: book,
      currentReader: currentReader,
      haveReader: true,
    });
  }
  const renderRecommendedBooks = (item, index) => {
    return (
      <TouchableOpacity onPress={e => handleRecommendedBookClick(item)}>
        <Card containerStyle={styles.bookContainer}>
          <View style={styles.cardImageContainer}>
            <Card.Image
              style={styles.cardImage}
              source={
                item.thumbnail_image
                  ? {uri: item.thumbnail_image}
                  : require('../../assets/image_break.png')
              }
              resizeMode={'stretch'}
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
  function handleViewMoreClick() {
    navigation.navigate('ViewAllBooks', {
      bookType: 'recommended',
      currentReader: currentReader,
    });
  }

  function updateReminderTime(e) {
    setShowTimer(true);
  }
  function updateLocalNotification(userName, reminderTime) {
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

    //GET ID OF OLD EVENT OF THIS READER
    var id = Math.floor(Math.random() * 1000);
    notification.getAllScheduledNotification().then(res => {
      var currentReaderEvent = res?.find(obj => obj.message === userName);
      if (currentReaderEvent) {
        id = currentReaderEvent.id;
      }
      console.log('id=', id, 'data = ', currentReaderEvent);
      notification.scheduleNotification(userName, eventStartDate, id);
      Toast.show('Hey! Reminder time updated');
    });
  }
  const onTimeChange = (event, time) => {
    setShowTimer(false);

    if (time) {
      setReminderTime(time);
      //UPDATE TIME IN SERVER HIT API
      const updateTimeUrl = updateReminderTimeUrl + '/' + encodedReaderId;
      const obj = {
        reminder_time: moment(time).format('HH:mm:SS'),
        _token: state.token,
      };
      //FETCH BOOKS FROM API
      axios
        .post(updateTimeUrl, obj)
        .then(response => response.data)
        .then(data => {
          if(!value.state.isReader) fetchAllReaders({userid: state.id})
          //UPDATE NOTIFICATION EVENT
          updateLocalNotification(
            currentReader?.first_name,
            moment(time).format('HH:mm:SS'),
          );
          // Toast.show('Reminder time updated')
        })
        .catch(error => {
          console.log('update reminder time error = ', error);
          Toast.show(
            "Server Error! can't update time"
          );
        });
    }
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
  const handleRecommendedScrollView = event => {
    if (event) {
      const scrollPerc =
        (event.nativeEvent.contentOffset.x /
          (contentWidthRecommendedBooks - scrollWidthRecommendedBooks)) *
        (100 - scrollElementWidthPercent);
      setScrollPercentRecommendedBooks(scrollPerc);
    }
  };
  const handleReadScrollView = event => {
    if (event) {
      const scrollPerc =
        (event.nativeEvent.contentOffset.x /
          (contentWidthReadooks - scrollWidthReadBooks)) *
        (100 - scrollElementWidthPercent);
      setScrollPercentReadBooks(scrollPerc);
    }
  };
  const setScrollViewWidth = e => {
    if (e) setScrollWidthCurrentBooks(e.nativeEvent.layout.width);
  };
  const setContentSize = width => {
    if (width) setContentWidthCurrentBooks(width);
  };
  const setRecommendedScrollViewWidth = e => {
    if (e) setScrollWidthRecommendedBooks(e.nativeEvent.layout.width);
  };
  const setRecommendedContentSize = width => {
    if (width) setContentWidthRecommendedBooks(width);
  };
  const setReadScrollViewWidth = e => {
    if (e) setScrollWidthReadBooks(e.nativeEvent.layout.width);
  };
  const setReadContentSize = width => {
    if (width) setContentWidthReadBooks(width);
  };

  return isLoading ? (
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
    <ScrollView style={{backgroundColor: white}}>
      <SafeAreaView style={styles.parentContainer}>
        {/* REMINDER */}
        <View style={[styles.heading, {marginTop: 0}]}>
          <Text style={[globalStyle.font, {fontSize:13, width:'90%'}]}>{currentReader.first_name + ' gets daily reading reminders at ' + moment(reminderTime).format('hh:mm a')}</Text>
          {/* <Chip style={{margin: 10, backgroundColor: primary}}>
            {moment(reminderTime).format('hh:mm a')}
          </Chip> */}
          <TouchableOpacity
            style={{alignItems: 'flex-end', flex: 1}}
            onPress={e => updateReminderTime()}>
            <Icon2 name="edit" size={20} />
          </TouchableOpacity>
        </View>

        {/* CURRENTLY READING BOOKS */}
        <View style={styles.heading}>
          <Text style={globalStyle.subHeading}>Reading now</Text>
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
          <Text style={globalStyle.subHeading}>Our recommendations</Text>
          <TouchableOpacity
            style={{alignItems: 'flex-end', flex: 1}}
            onPress={e => {
              handleViewMoreClick();
            }}>
            <Text style={[{fontSize: 14}, globalStyle.font]}>View all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.flatlistContainer}>
          {scrollPercentRecommendedBooks > 10 ? (
            <View style={styles.scrollIconLeft}>
              <Icon name="left" size={14} color={darkGray}></Icon>
            </View>
          ) : null}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={booksRecommended}
            renderItem={({item, index}) => renderRecommendedBooks(item, index)}
            keyExtractor={(item, index) => index}
            key={item => item}
            onScroll={e => handleRecommendedScrollView(e)}
            onLayout={ew => setRecommendedScrollViewWidth(ew)}
            onContentSizeChange={(width, _) => {
              setRecommendedContentSize(width);
            }}></FlatList>
          {scrollPercentRecommendedBooks < scrollElementWidthPercent - 10 ? (
            <View style={styles.scrollIconLeft}>
              <Icon name="right" size={14} color={darkGray}></Icon>
            </View>
          ) : null}
        </View>
        {/* BOOKS READ */}
        <View style={styles.heading}>
          <Text style={globalStyle.subHeading}>Already read</Text>
        </View>
        <View style={styles.flatlistContainer}>
          {scrollPercentReadBooks > 10 ? (
            <View style={styles.scrollIconLeft}>
              <Icon name="left" size={14} color={darkGray}></Icon>
            </View>
          ) : null}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={booksFinishedeading}
            renderItem={({item, index}) => renderAlreadyReadBooks(item, index)}
            keyExtractor={(item, index) => index}
            key={item => item}
            onScroll={e => handleReadScrollView(e)}
            onLayout={ew => setReadScrollViewWidth(ew)}
            onContentSizeChange={(width, _) => {
              setReadContentSize(width);
            }}></FlatList>
          {scrollPercentReadBooks < scrollElementWidthPercent - 10 ? (
            <View style={styles.scrollIconLeft}>
              <Icon name="right" size={14} color={darkGray}></Icon>
            </View>
          ) : null}
        </View>
        {/* BOOKS READ */}
        <View style={styles.heading}>
          <Text style={globalStyle.subHeading}>Not reading anymore</Text>
        </View>
        <View style={styles.flatlistContainer}>
          {scrollPercentReadBooks > 10 ? (
            <View style={styles.scrollIconLeft}>
              <Icon name="left" size={14} color={darkGray}></Icon>
            </View>
          ) : null}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={booksStoppedReading}
            renderItem={({item, index}) => renderAlreadyReadBooks(item, index)}
            keyExtractor={(item, index) => index}
            key={item => item}
            onScroll={e => handleReadScrollView(e)}
            onLayout={ew => setReadScrollViewWidth(ew)}
            onContentSizeChange={(width, _) => {
              setReadContentSize(width);
            }}></FlatList>
          {scrollPercentReadBooks < scrollElementWidthPercent - 10 ? (
            <View style={styles.scrollIconLeft}>
              <Icon name="right" size={14} color={darkGray}></Icon>
            </View>
          ) : null}
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
