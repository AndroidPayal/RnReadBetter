import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, FlatList} from 'react-native';
import {View, StyleSheet, SafeAreaView, Button} from 'react-native';
import {Text} from 'react-native-elements';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import base64 from 'react-native-base64';
import {Card, Overlay} from 'react-native-elements';
import moment from 'moment';
import { NavigationContainer, useIsFocused , useFocusEffect} from '@react-navigation/native';

import {Context as AuthContext} from '../../hoc/AuthContext';
import {
  white,
  readerBackground,
  primary,
  black,
  mediumGray,
  fourthGreen,
  red,
  secondaryBlue,
} from '../../values/colors';
import {
  getReadersUrl,
  getUserCredit,
  addNewReaderUrl,
  getBooksRecommendedForAll,
} from '../../values/config';
import {TouchableOpacity} from 'react-native';
import AddReader from './AddReader';
import {ActivityIndicator} from 'react-native';
import {globalStyle, globalTitleBar} from '../../values/constants';
import NotificationService from '../../../NotificationService';
import Toast from 'react-native-simple-toast';
import {Context as UserContext} from '../../hoc/UserDataContext';
import {ourWebClientId} from '../../values/config';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

function HomeScreen({navigation}) {
  const {value, signout} = useContext(AuthContext);
  const state = value.state;
  const {state1, addAReader, fetchAllReaders} = useContext(UserContext);

  const encodedUserId = base64.encode(state.id.toString());
  const [readers, setReaders] = useState(state1.allReaders);
  // const [flagNewReader, setFlagNewReader] = useState(false);
  const [userCredit, setUserCredit] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [openAddOverlay, setToggleOverlay] = useState(false);
  const [showLogOutDialog, setShowLogoutDialog] = useState(false)
  const dialogHeading = 'Are you sure to logout?'
  const [notification, setNotification] = useState(
    new NotificationService(onNotification),
  );

  function onNotification(notif) {
    console.log('called on notification');
    // Alert.alert(notif.title, notif.message);
  }

  function setTitleBar() {
    const creditUrl = getUserCredit + '/' + encodedUserId;
    //API TO FETCH User Credit
    axios
      .get(creditUrl)
      .then(response2 => response2.data)
      .then(result => {
        setUserCredit(result.credits);
        navigation.setOptions(
          globalTitleBar(
            state.name.substring(0, 1),
            '',
            result.credits,
            navigation,
            true,
            logOut,
          ),
        );
        setLoading(false);
      })
      .catch(error => {
        // setLoading(false);
        console.log('credit error = ', error);
        Toast.show(
          "Server Error! can't fetch credit"
        );
      });
  }
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: ourWebClientId,
      offlineAccess: true,
    });
    // isSignedIn();
  }, []);
  const logOut = async () => {
    console.log('log out button pressed');
    setShowLogoutDialog(true)
  };
  const handleYesPress = async () => {
    console.log('logging out user');
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
    signout();
  };
  const handleNoPress = async () => {
    setShowLogoutDialog(false)
  }
  function fetchRecommendedBooks() {
    const recommendedBookUrl = getBooksRecommendedForAll;
    //API TO FETCH READERS
    axios
      .get(recommendedBookUrl)
      .then(res => res.data)
      .then(response => {
        setRecommendedBooks(response);
        var tagArray = response;

        var randomIndex = Math.floor(Math.random() * (tagArray.length - 10));
        tagArray = tagArray.slice(randomIndex, randomIndex + 10);
        setPopularBooks(tagArray);
      })
      .catch(error => {
        console.log('get recommended books error =', error);
        Toast.show(
          "Server Error! can't fetch recommendations"
        );
      });
  }
  useFocusEffect(
    React.useCallback(() => {
      console.log('hi we r inside foucs');
      setLoading(true);
      fetchRecommendedBooks();
      setLoading(false);
      return () => {
        console.log('reached return  of focus');
      };
    }, [])
  );
  useEffect(() => {
    setTitleBar();
  }, []);//flagNewReader

  function handleRecommendedBookClick(item) {
    navigation.navigate('BookStartRead', {
      currentBook: item,
      currentReader: null,
      haveReader: false,
    });
  }
  const renderRecommendedBooks = (item, index) => {
    return (
      <TouchableOpacity onPress={e => handleRecommendedBookClick(item)}>
        <Card containerStyle={styleBookList.bookContainer}>
          <View style={styleBookList.cardImageContainer}>
            <Card.Image
              style={styleBookList.cardImage}
              source={
                item.thumbnail_image
                  ? {uri: item.thumbnail_image}
                  : require('../../assets/image_break.png')
              }
              resizeMode={'stretch'}
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
    navigation.navigate('Reader', {
      refreshPage: false,
      currentReaderId: reader.id,
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
    if (userCredit >= 300) {
      setToggleOverlay(true);
    } else {
      Toast.show("You don't have enough credit");
    }
  }
  function cancelAddReader(e) {
    setToggleOverlay(false);
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
  function addNewReader(obj) {
    setLoading(true);
    obj._token = state.token; //ADDING CSRF TOKEN TO URL

    // API TO ADD NEW READER
    const apicall = new Promise((resolve, reject) => {
      axios
        .post(addNewReaderUrl, obj)
        .then(response => response.data)
        .then(data => {
          console.log('add reader res =', data);
          //--------------
          // setFlagNewReader(flagNewReader === true ? false : true);
          setTitleBar();
          fetchAllReaders({userid: value.state.id})
            .then(res => {
              setLoading(false);
              console.log('fetch reader res =', res);
              createLocalNotification(obj.firstname_reader, obj.time_picker);
              setReaders(res);
              return resolve(data.message.toString());
            })
            .catch(err => console.log(err));
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
        backgroundColor: white,
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

        <Overlay isVisible={showLogOutDialog} onBackdropPress={ e => setShowLogoutDialog(false)}>
          <View style={{minWidth:'85%'}}>
              <Text style={[{marginTop:10, marginBottom:20, marginHorizontal:10, textAlign:'center', fontSize:17}, globalStyle.font]}>
                  {dialogHeading}
              </Text>
              <View style={{flexDirection:'row', justifyContent:'space-around', marginBottom:10}}>
                  <TouchableOpacity style={styles.loginTouchable}
                      onPress={e => handleNoPress()} >
                      <View style={[styles.buttonStyle, {backgroundColor: fourthGreen}]}>
                          <Text style={[{color:white, fontSize:16}, globalStyle.fontBold]}>Cancel</Text>
                      </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.loginTouchable}
                      onPress={e => handleYesPress()} >
                      <View style={[styles.buttonStyle,  {backgroundColor: red}]}>
                          <Text style={[{color:white, fontSize:16}, globalStyle.fontBold]}>Yes</Text>
                      </View>
                  </TouchableOpacity>
              </View>
          </View>
        </Overlay>
      </SafeAreaView>
    </ScrollView>
  );
}
export default HomeScreen;

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
  loginTouchable:{flexDirection:'row', justifyContent:'center'},
  buttonStyle:{flexDirection:'row',width:100, height:45, backgroundColor:secondaryBlue, borderRadius:30, justifyContent:'center', alignItems:'center'},

});
