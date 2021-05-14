import React, {useEffect, useState, useContext} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
  ToastAndroid
} from 'react-native';
import {Text, BottomSheet, Button, Input, Overlay,Card,Rating} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import base64 from 'react-native-base64';

import {
  white,
  lightGray,
  tintBackground,
  tintDarkBackground,
  black,
  red,
  green,
  logBackground,
  primary,
} from '../../values/colors';
import {
  getLogsOfABook,
  addLogToABook,
  getUserCredit,
  stopBookReadingUrl,
} from '../../values/config';
import {Context as AuthContext} from '../../hoc/AuthContext';
import {globalStyle, globalTitleBar} from '../../values/constants';
import {default_BookImage} from '../../values/config'

export default function BookReading({route, navigation}) {
  const currentBook = route.params.currentBook;
  const currentReader = route.params.currentReader;
  const encodedReaderId = base64.encode(currentReader.id.toString());
  const encodedBookId = base64.encode(currentBook.id.toString());
  const {value} = useContext(AuthContext);
  const state = value.state;
  const encodedUserId = base64.encode(state.userId.toString());

  const [logs, setlogs] = useState([]);
  const [isBottomSheetVisible, setbottomSheetVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [startPage, setStartPage] = useState(0);
  const [stopPage, setStopPage] = useState(0);
  const [summary, setSummary] = useState('');
  const [flagAddLog, setFlagAddLog] = useState(false);
  // const [userCredit, setUserCredit] = useState(0);
  const [countPagesRead, setPagesRead] = useState(0)
  const [countMinutesRead, setMinutesRead] = useState(0)
  const [flagStopBook, setFlagStopBookOverlay] = useState(false);
  const [stopReadingComment, setStopReadingComment] = useState('');
  const [disableStopButton, setdisableStopButton] = useState(false);
  const [rateFunFactor, setFunFactor] = useState(2);
  const [rateComFactor, setComFactor] = useState(2);
  const [stopReadingType, setStopReadingType] = useState('stop')

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
            state.name.substring(0,1),
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
    const fetchLog =
      getLogsOfABook + '/' + encodedReaderId + '/' + encodedBookId;

    axios
      .get(fetchLog)
      .then(response => response.data)
      .then(data => {
        setlogs(data.datas);
        setTitleBar();
        console.log(currentBook);
        var formatedArray = data.datas
        formatedArray.splice(0, 0, {log_message: 'Started the book on 23 april 2021'})

        var tempPageCount = 0
        var tempMinuteCount = 0
        data.datas.map((item,i)=>{
          tempPageCount = tempPageCount + item.no_of_pages_read;
          tempMinuteCount = tempMinuteCount + item.reading_time;
        })
        setPagesRead(tempPageCount)
        setMinutesRead(tempMinuteCount)
      })
      .catch(error => {
        console.log('fetch log response error = ', error);
      });
  }, [flagAddLog]);

  function logsView(item, index) {
    return (
      <View key={index} style={logStyle.parent}>
        <View style={logStyle.linearChartContainer}>
          {index === 0 ? <View style={logStyle.greenDot} /> : null}
          <View style={logStyle.grayLine} />
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor:
                index === logs.length - 1 ? red : tintDarkBackground,
              borderRadius: 10 / 2,
              margin: 2,
            }}
          />
        </View>
        <View
          style={{
            width: '80%',
            backgroundColor: logBackground[index]
              ? logBackground[index]
              : logBackground[Math.floor(Math.random() * 4)],
            borderRadius: 2,
            padding: 5,
            margin: 5,
          }}>
          <Text style={[logStyle.commentText, index===0 ? globalStyle.fontBold : globalStyle.font]}>
            {item.log_message}
          </Text>
          <View style={logStyle.commentStatusContainer}>
            {item?.reading_time ? 
              <View style={logStyle.readTimeContainer}>
                <View style={logStyle.commentStatusDot} />
                <Text style={[globalStyle.font]}>
                  {item.reading_time + ' mins Read'}
                </Text>
              </View>
            :null}
            
            {item?.from_page ?
              <View style={logStyle.readTimeContainer}>
                <View style={logStyle.commentStatusDot} />
                <Text style={globalStyle.font}>
                  {'Pages ' + item.from_page + ' to ' + item.no_of_pages_read}
                </Text>
              </View>
            :null}
          </View>
        </View>
      </View>
    );
  }
  const addLogBox = () => {
    return (
      <View style={addLogStyle.parent}>
        <View style={addLogStyle.headingContainer}>
          <View style={addLogStyle.headingText}>
            <Text style={[{fontSize: 22}, globalStyle.fontMedium]}>
              Add Your reading Log
            </Text>
          </View>
          <TouchableOpacity
            style={addLogStyle.closeIcon}
            onPress={e => closeAddLog(e)}>
            <Icon name="close" size={17} />
          </TouchableOpacity>
        </View>
        <View>
          <View style={addLogStyle.inputContainer}>
            <Text style={[addLogStyle.inputHeading, globalStyle.font]}>
              Read for (minutes):
            </Text>
            <View style={addLogStyle.inputView}>
              <Input
                inputContainerStyle={addLogStyle.inputStyle}
                keyboardType="number-pad"
                onChangeText={value => setReadingTime(value)}
              />
            </View>
          </View>
          <View style={addLogStyle.inputContainer}>
            <Text style={[addLogStyle.inputHeading, globalStyle.font]}>
              Started reading at page:
            </Text>
            <View style={addLogStyle.inputView}>
              <Input
                inputContainerStyle={addLogStyle.inputStyle}
                keyboardType="number-pad"
                onChangeText={value => setStartPage(value)}
              />
            </View>
          </View>
          <View style={addLogStyle.inputContainer}>
            <Text style={[addLogStyle.inputHeading, globalStyle.font]}>
              Stopped at page:
            </Text>
            <View style={addLogStyle.inputView}>
              <Input
                inputContainerStyle={addLogStyle.inputStyle}
                onChangeText={value => setStopPage(value)}
                keyboardType="number-pad"
              />
            </View>
          </View>
          <View style={addLogStyle.inputContainer}>
            <Text style={[addLogStyle.inputHeading, globalStyle.font]}>
              Describe what you read:
            </Text>
            <View
              style={{
                height: 90,
                backgroundColor: lightGray,
                borderRadius: 3,
                flex: 1,
              }}>
              <Input
                inputStyle={globalStyle.font}
                inputContainerStyle={{borderBottomWidth: 0, height: 90}}
                onChangeText={value => setSummary(value)}
                multiline={true}
                placeholder='Tell us what you understood in this reading session.'
              />
            </View>
          </View>
        </View>
        <View style={addLogStyle.buttonContainer}>
          <Button
            raised
            buttonStyle={{backgroundColor: tintBackground}}
            titleStyle={[{color: black}, globalStyle.fontBold]}
            title="Add Log"
            onPress={e => addNewLog(e)}></Button>
        </View>
      </View>
    );
  };
  function addNewLog(e) {
    const obj = {
      reading_time: readingTime,
      reader_id: currentReader.id,
      book_id: encodedBookId,
      log_message: summary,
      from_page: startPage,
      no_of_pages_read: stopPage,
      _token: state.token,
    };
    setLoading(true);
    console.log('add log', obj);
    axios
      .post(addLogToABook, obj)
      .then(response => response.data)
      .then(data => {
        // console.log('add log response = ', data);
        // setLoading(false); //NO NEED BCZ FLAG UPDATE WILL CALL USEEFFECT->USEEFFECT WILL UPDATE LOADER
        setFlagAddLog(!flagAddLog);
      })
      .catch(error => {
        console.log('addLog url response error = ', error);
      });
    closeAddLog(e);
  }
  function handleAddLog(e) {
    setbottomSheetVisible(true);
  }
  function updateBookOverlay() {
    setFlagStopBookOverlay(false);
    setStopReadingComment('');
    setFunFactor(2)
    setComFactor(2)
  }
  function openStopBookOverlay(stoptype) {
    if(stoptype==='stop'){
      setStopReadingType('stop')
    }else{
      setStopReadingType('finish')
    }
    setFlagStopBookOverlay(true)
  }
  function handleStopReading(e) {
    const stopFinishBookUrl =
      stopBookReadingUrl + '/' 
      + encodedReaderId + (stopReadingType==='stop'? '/stop/reading/book/' : '/finish/reading/book/' )+
      base64.encode(currentBook.id.toString());

      const updatedComFactor = rateComFactor === 1 ? 2 :( rateComFactor === 2 ? 4 : 6)
      const obj = {
        _token: state.token,
        fun_factor: rateFunFactor,
        com_factor: updatedComFactor
      };
      if (stopReadingComment != '') {
        obj.book_comment = stopReadingComment;
      }
      //HIT API TO START BOOK READING
      axios
      .post(stopFinishBookUrl, obj)
      .then(response => response.data)
      .then(data => {
        console.log(data);
        setdisableStopButton(true);
        setFlagStopBookOverlay(false);
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        navigateBackScreen()
      })
      .catch(error => {
        setFlagStopBookOverlay(false);
        ToastAndroid.show(error, ToastAndroid.SHORT);
        console.log('getBooks recommended response error = ', error);
      });
  }
  function navigateBackScreen() {
    navigation.navigate('Reader', {
      refreshPage: true,
      currentReader: currentReader,
    });
  }
  function closeAddLog(e) {
    setbottomSheetVisible(false);
  }
  function handleHeartRateUpdate(rating) {
    setComFactor(rating)
  }
  function handleStarRateUpdate(rating) {
    setFunFactor(rating)
  }

  const headerRender = () => {
    return (
      <>
        <View style={styles.tintBox}>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.bookImageParent}>
              <Image
                style={styles.bookImage}
                source={currentBook.thumbnail_image ? {uri: currentBook.thumbnail_image} : require('../../assets/image_break_100.png')}
                resizeMode={currentBook.thumbnail_image ? "stretch" : "center"}
                //'https://picsum.photos/700'}}//
                ></Image>
            </View>
            <View style={{padding: 5, flex: 1}}>
              <View>
                <Text
                  style={[
                    {fontSize: 10, color: tintDarkBackground},
                    globalStyle.font,
                  ]}>
                  Currently Reading
                </Text>
                <Text
                  style={[{fontSize: 15}, globalStyle.fontMedium]}
                  numberOfLines={3}>
                  {currentBook.name}
                </Text>
              </View>
              <View style={{flexDirection: 'row', flex: 1}}>
                <View style={{flex: 1, justifyContent: 'flex-end'}}>
                  <Text
                    style={[{color: black, opacity: 0.6}, globalStyle.font]}>
                    Total mins read:
                  </Text>
                  <Text style={[globalStyle.fontMedium]}>
                    {countMinutesRead + ' mins'}
                    {/* {currentBook.read_count + ' mins'} */}
                  </Text>
                </View>
                <View style={{flex: 1, justifyContent: 'flex-end'}}>
                  <Text
                    style={[{color: black, opacity: 0.6}, globalStyle.font]}>
                    Total pages read:
                  </Text>
                  <Text style={[globalStyle.fontMedium]}>
                    {countPagesRead}
                    {/* {currentBook.recommended} */}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonStyle}>
            <Button
              buttonStyle={{borderColor: black, opacity:0.20}}
              titleStyle={[{color: black, opacity:0.90}, globalStyle.fontBold]}
              title="Stop Reading"
              type="outline"
              disabled={disableStopButton}
              onPress={e => openStopBookOverlay('stop')}></Button>
          </View>
          <View style={styles.buttonStyle}>
            <Button
              raised
              buttonStyle={{backgroundColor: primary}}
              titleStyle={[{color: black}, globalStyle.fontBold]}
              title="Add Log"
              onPress={e => handleAddLog(e)}></Button>
          </View>
        </View>
        <View style={styles.buttonStyle}>
          <Button
            buttonStyle={{borderColor: black, opacity:0.20}}
            titleStyle={[{color: black, opacity:0.90}, globalStyle.fontBold]}
            title="Finish the book"
            type="outline"
            disabled={disableStopButton}
            onPress={e => openStopBookOverlay('finish')}></Button>
        </View>
        <View>
          <Text style={[{margin: 10}, globalStyle.subHeading]}>Past Logs</Text>
        </View>
      </>
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
    <View style={styles.mainContainer}>
      <FlatList
        data={logs}
        renderItem={({item, index}) => logsView(item, index)}
        keyExtractor={(item, index) => index}
        key={item => item}
        ListHeaderComponent={headerRender}
      />
      <BottomSheet isVisible={isBottomSheetVisible}>{addLogBox()}</BottomSheet>

      <StopBookOverlay
          selectedBook={currentBook}
          flagStopBook={flagStopBook}
          rateFunFactor={rateFunFactor}
          rateComFactor={rateComFactor}
          stopReadingType={stopReadingType}
          updateBookOverlay={updateBookOverlay}
          setStopReadingComment={setStopReadingComment}
          handleStopReading={handleStopReading}
          handleHeartRateUpdate={handleHeartRateUpdate}
          handleStarRateUpdate={handleStarRateUpdate}
        />
    </View>
  );
}

const StopBookOverlay = props => {
  return (
    <Overlay
      isVisible={props.flagStopBook}
      overlayStyle={styleBookOverlay.overlayStyle}
      onBackdropPress={e => props.updateBookOverlay()}>
      <ScrollView>
        <View style={styleBookOverlay.parentContainer2}>
          <View style={styleBookOverlay.headingContainer}>
            <Text style={[styleBookOverlay.heading, globalStyle.fontMedium]}>
              {props.stopReadingType==='stop' ? 'Stop Reading' : 'Finish Reading'}
            </Text>
            <Icon
              name="close"
              size={20}
              onPress={e => props.updateBookOverlay()}></Icon>
          </View>
          <Card containerStyle={styleBookOverlay.bookContainer}>
            <View style={styleBookOverlay.cardImageContainer}>
              <Card.Image
                style={styleBookOverlay.cardImage}
                source={props.selectedBook?.thumbnail_image ? {uri: props.selectedBook?.thumbnail_image} : require('../../assets/image_break_100.png')}
                resizeMode={props.selectedBook?.thumbnail_image ? "stretch" : "center"}
               
              />
            </View>
            <View style={styleBookOverlay.cartTextContainer}>
              <Text
                style={[styleBookOverlay.cardText, globalStyle.fontBold]}
                numberOfLines={2}>
                {props.selectedBook?.name}
              </Text>
            </View>
          </Card>
          <View style={styleBookOverlay.rateParent}>
              <View style={styleBookOverlay.singleRateContainer}>
                <Text style={[globalStyle.fontMedium, {opacity:0.60}]}>
                  How much fun was this book?
                </Text>
                <View style={{alignItems:'flex-start'}}>
                  <Rating
                    style={{ marginTop:5 }}
                    image
                    ratingCount={3}
                    imageSize={30}
                    startingValue={props.rateFunFactor}
                    onFinishRating={rate => props.handleStarRateUpdate(rate)}
                  />
                </View>
              </View>
              <View style={styleBookOverlay.singleRateContainer}>
                <Text style={[globalStyle.fontMedium, {opacity:0.60}]}>
                  Did you understand this book?
                </Text>
                <View style={{alignItems:'flex-start'}}>
                  <Rating
                    style={{ marginTop:5 }}
                    type='heart'
                    ratingCount={3}
                    imageSize={30}
                    startingValue={props.rateComFactor}
                    // showRating
                    onFinishRating={rate => props.handleHeartRateUpdate(rate)}
                  />
                </View>
              </View>
          </View>
          <View style={styleBookOverlay.inputContainer}>
            <Text style={[globalStyle.fontMedium]}>
              Your comments on this book? (Optional):
            </Text>
            <View style={styleBookOverlay.inputParent}>
              <Input
                inputStyle={globalStyle.font}
                inputContainerStyle={{borderBottomWidth: 0, height: 90}}
                onChangeText={value => props.setStopReadingComment(value)}
                multiline={true}
              />
            </View>
          </View>
          <View style={styleBookOverlay.buttonContainer}>
            <Button
              raised
              // icon={<Icon name="caretright" style={{marginHorizontal: 8}} />}
              buttonStyle={{backgroundColor: primary}}
              titleStyle={[{color: black}, globalStyle.fontBold]}
              title={props.stopReadingType==='stop' ? "Stop Reading" : 'Finish Reading'}
              onPress={e => props.handleStopReading(e)}
            />
          </View>
        </View>
      </ScrollView>
    </Overlay>
  );
};

const styleBookOverlay = StyleSheet.create({
  rateParent:{flexDirection:'row', flex:1, marginTop:10},
  singleRateContainer:{flex:1}, 
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
  inputParent: {
    height: 90,
    borderColor: lightGray,
    borderWidth: 2,
    borderRadius: 3,
    marginTop: 5,
  },
  inputContainer: {marginTop: 20, alignSelf: 'flex-start', width: '100%'},
  parentContainer2: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginRight: 10,
  },
  heading: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
  },
  overlayStyle: {
    width: '80%',
    // height: '80%',
  },
  buttonContainer: {marginVertical: 20, flex: 1, alignSelf: 'center'},
});
const addLogStyle = StyleSheet.create({
  parent: {
    width: '100%',
    height: 'auto',
    backgroundColor: white,
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    padding: 10,
    paddingBottom: 20,
  },
  headingContainer: {width: '100%', flexDirection: 'row', marginBottom: 10},
  headingText: {flex: 1},
  closeIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {flexDirection: 'row', alignItems: 'center', margin: 3},
  inputHeading: {flex: 1, fontSize: 17},
  inputView: {
    width: 100,
    height: 45,
    backgroundColor: lightGray,
    borderRadius: 3,
    flex: 1,
  },
  inputStyle: {borderBottomWidth: 0},
  buttonContainer: {margin: 10, width: 200, flex: 1, alignSelf: 'center'},
});
const logStyle = StyleSheet.create({
  parent: {width: '100%', minHeight: 50, flexDirection: 'row'},
  linearChartContainer: {width: 50, alignItems: 'center'},
  greenDot: {
    width: 10,
    height: 10,
    backgroundColor: green,
    borderRadius: 10 / 2,
    margin: 2,
  },
  grayLine: {flex: 1, width: 2, backgroundColor: lightGray},
  commentText: {flex: 1, fontSize: 12 },
  commentStatusContainer: {flexDirection: 'row', marginTop:5},
  readTimeContainer: {flex: 1, flexDirection: 'row', alignItems: 'center'},
  commentStatusDot: {
    width: 5,
    height: 5,
    backgroundColor: tintDarkBackground,
    borderRadius: 5 / 2,
    margin: 2,
  },
});
const styles = StyleSheet.create({
  buttonStyle: {flex: 1, margin: 10},
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginTop: 5,
  },
  tintBox: {
    backgroundColor: tintBackground,
    width: '95%',
    height: 120,
    alignSelf: 'center',
    marginTop: 10,
  },
  bookImageParent: {justifyContent: 'center', margin: 7},
  bookImage: {width: 90, height: 100, borderRadius: 3},

  mainContainer: {
    backgroundColor: white,
    flex: 1,
    paddingBottom: 5,
  },
  welcomeContainer: {
    margin: 10,
  },
  textHello: {
    fontSize: 20,
    color: black,
    marginBottom: -5,
    opacity: 0.5,
  },
});
