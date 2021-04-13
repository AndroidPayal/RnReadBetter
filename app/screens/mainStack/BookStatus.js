import React, {useEffect, useState} from 'react';
import {StyleSheet, View, SafeAreaView, Image, ScrollView,TouchableOpacity} from 'react-native';
import {Text, BottomSheet, Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome'
import axios from 'axios';
import base64 from 'react-native-base64';

import {
  white,
  darkGray,
  lightGray,
  tintBackground,
  tintDarkBackground,
  black,
  red,
  green,
  logBackground,
  primary
} from '../../values/colors';
import { getLogsOfABook } from "../../values/config";
import { ActivityIndicator } from 'react-native';

export default function BookStatus({route, navigation}) {
  const currentBook = route.params.currentBook;
  const currentReader = route.params.currentReader;
  const encodedReaderId = base64.encode(currentReader.id.toString());
  const encodedBookId = base64.encode(currentBook.id.toString());
  const [logs, setlogs] = useState(['a', 'b', 'b', 'b', 'b']);
  const[isBottomSheetVisible, setbottomSheetVisible] = useState(false)
  const[isLoading, setLoading] = useState(false)

  const logsView = logs.map((log, index) => {
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
          <Text style={logStyle.commentText}>{log.log_message}</Text>
          <View style={logStyle.commentStatusContainer}>
            <View style={logStyle.readTimeContainer}>
              <View style={logStyle.commentStatusDot} />
              <Text>{ log.reading_time +' mins Read'}</Text>
            </View>
            <View style={logStyle.readTimeContainer}>
              <View style={logStyle.commentStatusDot} />
              <Text>{'Pages ' + log.from_page + ' to ' + log.no_of_pages_read}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  });

  function handleAddLog(e){
    setbottomSheetVisible(true)
  }
  function closeAddLog(e) {
    setbottomSheetVisible(false)
  }
  useEffect(()=>{
    setLoading(true)
    const fetchLog = getLogsOfABook + '/' + encodedReaderId + '/' + encodedBookId

    axios
    .get(fetchLog)
    .then(response => response.data)
    .then(data => {
      console.log('logs = ', data.datas);
      setlogs(data.datas)
      setLoading(false);
    });

  },[])

  return isLoading?
  <ActivityIndicator
  style={{
    flex: 1,
    justifyContent: 'center',
  }}
  size="large"
  color={primary}/>
  :(
    <ScrollView style={styles.mainContainer}>
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.textHello}>Hello ,</Text>
          <Text h3>{currentReader.first_name}</Text>
        </View>
        <View style={styles.tintBox}>
          <View style={styles.bookImageParent}>
            <Image
              style={styles.bookImage}
              source={{uri: currentBook.thumbnail_image}} //'https://picsum.photos/700'}}//
              resizeMode="stretch"></Image>
          </View>
          <View style={{padding: 5}}>
            <View style={{width: '90%'}}>
              <Text style={{fontSize: 16}} numberOfLines={2}>
                {'You are reading book "' + currentBook.name + '"'}
              </Text>
            </View>
            <View style={{flexDirection: 'row', flex: 1}}>
              <View style={{flex: 1}}>
                <Text style={{color: darkGray}}>Total mins read:</Text>
                <Text>{currentBook.read_count + ' mins'}</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={{color: darkGray}}>Recommendation:</Text>
                <Text>{currentBook.recommended}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonStyle}>
            <Button
              buttonStyle={{borderColor: red}}
              titleStyle={{color: red}}
              title="Stop Reading"
              type="outline"></Button>
          </View>
          <View style={styles.buttonStyle}>
            <Button
              raised
              buttonStyle={{backgroundColor: tintBackground}}
              titleStyle={{color: black}}
              title="Add Log"
              onPress={e=>handleAddLog(e)}
              ></Button>
          </View>
        </View>
        <View>
          <Text style={{margin: 10, fontSize: 20}}>Past Logs</Text>
        </View>
        {logsView}
        
        {/* <BottomSheet isVisible={isBottomSheetVisible} >
          <View style={{width:'100%', height:250, backgroundColor:white, borderTopEndRadius:10, borderTopStartRadius:10, padding:10}}>
            <View style={{width:'100%', flexDirection:'row'}}>
              <View style={{flex:1}}>
                <Text h4 >Add Your Log</Text>
              </View>
              <TouchableOpacity style={{width:40,height:40, alignItems:'center',justifyContent:'center'}}
              onPress={e=>closeAddLog(e)}>
                <Icon name='close' size={17}/>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheet> */}
      </SafeAreaView>
    </ScrollView>
  );
}
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
    flexDirection: 'row',
    alignSelf: 'center',
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
    fontSize: 15,
    color: darkGray,
    marginBottom: -5,
  },
});

/* GET LOGS OF A BOOK
 "datas": [{"book_id": 4507, "created_at": "2021-04-13T13:59:55.000000Z", "from_page": 11, "id": 32, "log_message": "The Great Gatsby is a story about the impossibility of recapturing the past and also the difficulty of altering one's future. The protagonist of the novel is Jay Gatsby", "no_of_pages_read": 15, "page_no_exist": 0, "reader_id": 31, "reading_time": 10, "updated_at": "2021-04-13T13:59:55.000000Z"}, {"book_id": 4507, "created_at": "2021-04-13T13:59:16.000000Z", "from_page": 1, "id": 31, "log_message": "Three witches tell the Scottish general Macbeth that he will be King of Scotland. Encouraged by his wife, Macbeth kills the king, becomes the new king, and kills more people out of paranoia.", "no_of_pages_read": 10, "page_no_exist": 0, "reader_id": 31, "reading_time": 20, "updated_at": "2021-04-13T13:59:16.000000Z"}], "reader": {"avatar": null, "created_at": "2021-04-05T12:14:00.000000Z", "dob": "2017-02-23", "dra": "0", "first_name": "raja", "gender": "0", "gra": "0", "grade": "0", "id": 31, "last_name": "babu", "lexel": "0", "lower_seek": 3.4, "performance": 1, "rbsr": 4, "rbsr_update_session_id": 75, "reminder_time": "20:00:00", "school_id": "102385", "status": "1", "type": "general", "updated_at": "2021-04-10T14:20:24.000000Z", "upper_seek": 5, "user_id": 29}}*/
