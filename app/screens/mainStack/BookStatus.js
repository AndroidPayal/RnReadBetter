import React, {useEffect, useState, useContext} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {Text, BottomSheet, Button, Input} from 'react-native-elements';
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
} from '../../values/config';
import {Context as AuthContext} from '../../hoc/AuthContext';
import {globalStyle, globalTitleBar} from '../../values/constants';

export default function BookStatus({route, navigation}) {
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
  const [userCredit, setUserCredit] = useState(0);

  console.log('book=', currentBook);
  function setTitleBar() {
    const creditUrl = getUserCredit + '/' + encodedUserId;
    //API TO FETCH User Credit
    axios
      .get(creditUrl)
      .then(response2 => response2.data)
      .then(result => {
        setUserCredit(result);
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
          <Text style={[logStyle.commentText, globalStyle.font]}>
            {item.log_message}
          </Text>
          <View style={logStyle.commentStatusContainer}>
            <View style={logStyle.readTimeContainer}>
              <View style={logStyle.commentStatusDot} />
              <Text style={[globalStyle.font]}>
                {item.reading_time + ' mins Read'}
              </Text>
            </View>
            <View style={logStyle.readTimeContainer}>
              <View style={logStyle.commentStatusDot} />
              <Text style={globalStyle.font}>
                {'Pages ' + item.from_page + ' to ' + item.no_of_pages_read}
              </Text>
            </View>
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
              Add Your Log
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
              Read for (mins):
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
              Started at page:
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
              Summarise:
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
  function closeAddLog(e) {
    setbottomSheetVisible(false);
  }
  const headerRender = () => {
    return (
      <>
        <View style={styles.tintBox}>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.bookImageParent}>
              <Image
                style={styles.bookImage}
                source={{
                  uri: currentBook.thumbnail_image
                    ? currentBook.thumbnail_image
                    : default_BookImage,
                }} //'https://picsum.photos/700'}}//
                resizeMode="stretch"></Image>
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
                    {currentBook.read_count + ' mins'}
                  </Text>
                </View>
                <View style={{flex: 1, justifyContent: 'flex-end'}}>
                  <Text
                    style={[{color: black, opacity: 0.6}, globalStyle.font]}>
                    Total pages read:
                  </Text>
                  <Text style={[globalStyle.fontMedium]}>
                    {currentBook.recommended}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonStyle}>
            <Button
              buttonStyle={{borderColor: red}}
              titleStyle={[{color: red}, globalStyle.fontBold]}
              title="Stop Reading"
              type="outline"></Button>
          </View>
          <View style={styles.buttonStyle}>
            <Button
              raised
              buttonStyle={{backgroundColor: tintBackground}}
              titleStyle={[{color: black}, globalStyle.fontBold]}
              title="Add Log"
              onPress={e => handleAddLog(e)}></Button>
          </View>
        </View>
        <View>
          <Text style={[{margin: 10}, globalStyle.subHeading]}>Past Logs</Text>
        </View>
      </>
    );
  };
  useEffect(() => {
    setLoading(true);
    const fetchLog =
      getLogsOfABook + '/' + encodedReaderId + '/' + encodedBookId;

    axios
      .get(fetchLog)
      .then(response => response.data)
      .then(data => {
        // console.log('logs = ', data.datas);
        setlogs(data.datas);
        setTitleBar();
      })
      .catch(error => {
        console.log('fetch log response error = ', error);
      });
  }, [flagAddLog]);

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
    </View>
  );
}
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
  parent: {width: '100%', minHeight: 100, flexDirection: 'row'},
  linearChartContainer: {width: 50, alignItems: 'center'},
  greenDot: {
    width: 10,
    height: 10,
    backgroundColor: green,
    borderRadius: 10 / 2,
    margin: 2,
  },
  grayLine: {flex: 1, width: 2, backgroundColor: lightGray},
  commentText: {flex: 1, fontSize: 12},
  commentStatusContainer: {flexDirection: 'row'},
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
