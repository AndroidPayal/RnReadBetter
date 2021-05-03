import React, {useEffect, useState, useContext} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import {
  Text,
  BottomSheet,
  Button,
  Input,
  Overlay,
  Card,
} from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
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
  default_BookImage,
  setBookStartReading,
} from '../../values/config';
import {Context as AuthContext} from '../../hoc/AuthContext';
import {globalStyle, globalTitleBar} from '../../values/constants';

export default function BookDescription({route, navigation}) {
  const currentBook = route.params.currentBook;
  const currentReader = route.params.currentReader;
  const encodedReaderId = base64.encode(currentReader.id.toString());
  const encodedBookId = base64.encode(currentBook.id.toString());
  const {value} = useContext(AuthContext);
  const state = value.state;
  const encodedUserId = base64.encode(state.userId.toString());

  const [isLoading, setLoading] = useState(false);
  const [startBookOverlay, setStartBookOverlay] = useState(false);
  const [startReadingComment, setStartReadingComment] = useState('');
  const [disableStartButton, setdisableStartButton] = useState(false);

  // const [userCredit, setUserCredit] = useState(0);

  console.log('selected book: ', currentBook);

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
    // const fetchLog =
    //     getLogsOfABook + '/' + encodedReaderId + '/' + encodedBookId;

    // axios
    //     .get(fetchLog)
    //     .then(response => response.data)
    //     .then(data => {
    //         console.log('logs = ', data.datas);
    //         setlogs(data.datas);
    setTitleBar();
    // })
    // .catch(error => {
    //     console.log('fetch log response error = ', error);
    // });
  }, []);

  function handleStartBook() {
    setStartBookOverlay(true);
  }
  function updateBookOverlay() {
    setStartBookOverlay(false);
    setStartReadingComment('');
  }
  function handleBookStartReading() {
    // setLoading(true)
    setdisableStartButton(true);

    const startBookUrl =
      setBookStartReading +
      '/' +
      encodedReaderId +
      '/start/reading/book/' +
      base64.encode(currentBook.id.toString());
    const obj = {
      _token: state.token,
    };
    if (startReadingComment != '') {
      obj.book_comment = startReadingComment;
    }

    //HIT API TO START BOOK READING
    axios
      .post(startBookUrl, obj)
      .then(response => response.data)
      .then(data => {
        setdisableStartButton(false);
        setStartBookOverlay(false);
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
      })
      .catch(error => {
        setLoading(false);
        console.log('getBooks recommended response error = ', error);
      });
  }

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
      <View style={styles.mainContainer}>
        <View style={styles.tintBox}>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.bookImageParent}>
              <Image
                style={styles.bookImage}
                source={{
                  uri: currentBook.thumbnail_image
                    ? currentBook.thumbnail_image
                    : default_BookImage,
                }}
                resizeMode="stretch"></Image>
            </View>
            <View style={{padding: 5, flex: 1}}>
              <View>
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
                    Book rating:
                  </Text>
                  <Text style={[globalStyle.fontMedium]}>
                    {currentBook.like ? currentBook.like : 0}
                  </Text>
                </View>
                <View style={{flex: 1, justifyContent: 'flex-end'}}>
                  <Text
                    style={[{color: black, opacity: 0.6}, globalStyle.font]}>
                    Total pages:
                  </Text>
                  <Text style={[globalStyle.fontMedium]}>
                    {currentBook.pages}
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
              title="Start Read"
              icon={
                <Icon
                  name="caretright"
                  color={red}
                  size={18}
                  style={{marginHorizontal: 5}}
                />
              }
              type="outline"
              loading={disableStartButton}
              onPress={e => handleStartBook()}
            />
          </View>
          <View style={styles.buttonStyle}>
            <View style={{flexDirection: 'row'}}>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Icon name="staro" size={24} />
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Icon name="like2" size={24} />
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Icon name="dislike2" size={24} />
              </View>
              <View style={{flex: 1, alignItems: 'center'}}>
                <Icon2 name="people" size={24} />
              </View>
            </View>
          </View>
        </View>
        <View>
          <Text style={[{margin: 10}, globalStyle.subHeading]}>
            Description
          </Text>
        </View>
        <View>
          <Text style={[{margin: 10, opacity: 0.6}, globalStyle.font]}>
            {currentBook.description}
          </Text>
        </View>

        <StartBook
          updateBookOverlay={updateBookOverlay}
          selectedRecommendedBook={currentBook}
          startBookOverlay={startBookOverlay}
          setStartReadingComment={setStartReadingComment}
          handleBookStartReading={handleBookStartReading}
        />
      </View>
    </ScrollView>
  );
}

const StartBook = props => {
  return (
    <Overlay
      isVisible={props.startBookOverlay}
      overlayStyle={styleBookStart.overlayStyle}
      onBackdropPress={e => props.updateBookOverlay()}>
      <ScrollView>
        <View style={styleBookStart.parentContainer2}>
          <View style={styleBookStart.headingContainer}>
            <Text style={[styleBookStart.heading, globalStyle.fontMedium]}>
              Start Reading
            </Text>
            <Icon
              name="close"
              size={20}
              onPress={e => props.updateBookOverlay()}></Icon>
          </View>
          <Card containerStyle={styles.bookContainer}>
            <View style={styles.cardImageContainer}>
              <Card.Image
                style={styles.cardImage}
                source={{
                  uri: props.selectedRecommendedBook?.thumbnail_image
                    ? props.selectedRecommendedBook?.thumbnail_image
                    : default_BookImage,
                }}
                resizeMode="stretch"
              />
            </View>
            <View style={styles.cartTextContainer}>
              <Text
                style={[styles.cardText, globalStyle.fontBold]}
                numberOfLines={2}>
                {props.selectedRecommendedBook?.name}
              </Text>
            </View>
          </Card>
          <View style={styleBookStart.inputContainer}>
            <Text style={[globalStyle.fontMedium]}>
              Your comments on this book? (Optional):
            </Text>
            <View style={styleBookStart.inputParent}>
              <Input
                inputStyle={globalStyle.font}
                inputContainerStyle={{borderBottomWidth: 0, height: 90}}
                onChangeText={value => props.setStartReadingComment(value)}
                multiline={true}
              />
            </View>
          </View>
          <View style={styleBookStart.buttonContainer}>
            <Button
              raised
              icon={<Icon name="caretright" style={{marginHorizontal: 8}} />}
              buttonStyle={{backgroundColor: primary}}
              titleStyle={[{color: black}, globalStyle.fontBold]}
              title="Start Reading"
              onPress={e => props.handleBookStartReading(e)}
            />
          </View>
        </View>
      </ScrollView>
    </Overlay>
  );
};

const styleBookStart = StyleSheet.create({
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
  buttonContainer: {marginVertical: 20, flex: 1, alignSelf: 'flex-end'},
});

const styles = StyleSheet.create({
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
  buttonStyle: {flex: 1, margin: 10, justifyContent: 'center'},
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

{
  /*
{"Genres": null, "Subjects": null, "accelerated_reader_bl": null, "accelerated_reader_il": null, "accelerated_reader_pts": 0, "amazon_link": "https://www.amazon.in/gp/product/1844285138/ref=as_li_tl?ie=UTF8&tag=readbetter0d-21&camp=3638&creative=24630&linkCode=as2&creativeASIN=1844285138", "author": "", "author_id": "0", "average_rbs": 0, "bestseller_rank": 290, "booklist_count": null, "comments_count": null, "description": "", "dimension": "230x230x5mm", "dislike": null, "dra": 0, "edition_statement": "UK ed.", "file_size": 0, "finish_count": null, "fontas": null, "format": "Paperback", "full_author": "", "full_title": "", "gender_preffered": 0, "gender_preffered_percent": null, "grl": null, "id": 12, "illustrations_note": "", "imprint": "", "is_processed": 0, "isbn_10": "1844285138", "isbn_13": "9781844285136", "language": "English", "lexile": 0, "like": null, "max_age": 8, "min_age": 4, "name": "Don't Let the Pigeon Drive the Bus!", "pages": 40, "publication_date": "0000-00-00", "publication_location": "London, United Kingdom", "publisher": "Walker Books Ltd", "rating": 0, "rbsb": 4.5, "rbsb_initial": 4.5, "read_count": 0, "recommended": 0, "source": "1", "start_count": null, "stop_count": null, "subject_rbsb": null, "thumbnail_image": "https://d1w7fb2mkkr3kw.cloudfront.net/assets/images/book/lrg/9781/8442/9781844285136.jpg", "thumbnail_link": null, "to_display": 1}
*/
}
