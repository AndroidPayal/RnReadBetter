import React, {useEffect, useState, useContext} from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import {
  Text,
  Button,
  Input,
  Overlay,
  Card,
  ListItem,
  Avatar,
  Rating,
} from 'react-native-elements';
import {Chip} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import Icon3 from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import base64 from 'react-native-base64';
import {Picker} from '@react-native-picker/picker';
import moment from 'moment';

import {
  white,
  lightGray,
  tintBackground,
  black,
  red,
  primary,
  secondary,
  secondaryLight,
  darkGray,
  fourthGreen,
} from '../../values/colors';
import {
  getUserCredit,
  setBookStartReading,
  fetchBookTagsUrl,
  getReadersUrl,
  voteApi,
  bookReviewApi,
  fetchReaderDetailFromID,
  getReaderDetailFromId,
} from '../../values/config';
import {Context as AuthContext} from '../../hoc/AuthContext';
import {globalStyle, globalTitleBar} from '../../values/constants';
import {Context as UserContext} from '../../hoc/UserDataContext';

export default function BookStartRead({route, navigation}) {
  const currentBook = route.params.currentBook;
  const haveReader = route.params.haveReader;
  const noActionButtons = route.params?.noActionButtons;
  const [currentReader, setCurrentReader] = useState(
    route.params.currentReader,
  );
  const [encodedReaderId, setEncodedReaderId] = useState(
    currentReader ? base64.encode(currentReader.id.toString()) : '',
  );
  const encodedBookId = base64.encode(currentBook.id.toString());
  const {value} = useContext(AuthContext);
  const state = value.state;
  const {state1} = useContext(UserContext);

  const encodedUserId = base64.encode(state.id.toString());

  const [isLoading, setLoading] = useState(false);
  const [startBookOverlay, setStartBookOverlay] = useState(false);
  const [startReadingComment, setStartReadingComment] = useState('');
  const [disableStartButton, setdisableStartButton] = useState(false);
  const [bookTags, setBookTags] = useState([]);
  const [allReaders, setReaders] = useState(state1.allReaders);
  const [reviewsList, setReviews] = useState([]);
  const [actionType, setActionType] = useState('start');
  const [rateFunFactor, setFunFactor] = useState(2);
  const [rateComFactor, setComFactor] = useState(2);
  const [isOverlayActionLoading, setLoadingOverlayAction] = useState(false);
  const [likeDislikeStatus, setlikeDislikeStatus] = useState(null);

  console.log('book=', currentBook);
  function setTitleBar() {
    // const creditUrl = getUserCredit + '/' + encodedUserId;
    // //API TO FETCH User Credit
    // axios
    //   .get(creditUrl)
    //   .then(response2 => response2.data)
    //   .then(result => {
    // setUserCredit(result);
    navigation.setOptions(
      globalTitleBar(
        state.name.substring(0, 1),
        currentReader
          ? currentReader.first_name + "'s Bookshelf"
          : 'Book Detail',
        null, //result.credits,
        navigation,
        false,
      ),
    );
    setLoading(false);
    // })
    // .catch(error => {
    //   console.log('credit error = ', error);
    //   Toast.show(
    //     "Server Error! can't fetch credit",
    //     Toast.SHORT,
    //   );
    // });
  }
  useEffect(() => {
    setLoading(true);
    setTitleBar();
    fetchBookTags();
    fetchReviews();
  }, []);

  function fetchReviews() {
    const booksReview = bookReviewApi + '/' + currentBook.id;
    //API TO FETCH READERS
    // console.log(booksReview);
    axios
      .get(booksReview)
      .then(res => res.data)
      .then(response => {
        // [
        //   {
        //     "id": 13,
        //     "bookid": 9490,
        //     "comment": "Read",
        //     "reader_id": 56,
        //     "user_id": 84,
        //     "event": "3",
        //     "created_at": "2021-05-13T16:03:21.000000Z",
        //     "updated_at": "2021-05-13T16:03:21.000000Z"
        // }
        // ]
        setReviews(response);
        fetchReaderDetailOfReview(response);
      })
      .catch(error => {
        console.log('get book tags error =', error);
        Toast.show("Server Error! can't fetch tags");
      });
  }
  function fetchReaderDetail(readerId) {
    const apiCall = new Promise((resolve, reject) => {
      const readerDetail =
        getReaderDetailFromId + '/' + base64.encode(readerId.toString());
      //API TO FETCH READERS
      console.log('reader url =', readerDetail);
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
  async function fetchReaderDetailOfReview(tempReviews) {
    if (tempReviews.length > 0) {
      var newReviewArray = tempReviews;
      tempReviews.map(async (item, i) => {
        fetchReaderDetail(item.reader_id)
          .then(res => {
            newReviewArray[i].commentBy =
              res[0].first_name + ' ' + res[0].last_name;
            // console.log('setting nrew array =', newReviewArray);
            setReviews(newReviewArray);
          })
          .catch(error => console.log('error ', error));
      });
    }
  }
  function fetchBookTags() {
    const booksTag = fetchBookTagsUrl + '/' + encodedBookId + '/tags';
    //API TO FETCH READERS
    axios
      .get(booksTag)
      .then(res => res.data)
      .then(response => {
        var tagArray = response;
        if (tagArray.length > 10) {
          var randomIndex = Math.floor(Math.random() * (tagArray.length - 10));
          tagArray = tagArray.slice(randomIndex, randomIndex + 10);
        }
        tagArray[tagArray.length] = '+ Suggest';
        setBookTags(tagArray);
      })
      .catch(error => {
        console.log('get book tags error =', error);
        Toast.show("Server Error! can't fetch tags");
      });
  }
  function handleStartBook(type) {
    if (allReaders.length > 0) {
      setActionType(type);
      setStartBookOverlay(true);
    } else {
      Toast.show("You don't have any reader!");
    }
  }
  function updateBookOverlay() {
    setStartBookOverlay(false);
    setStartReadingComment('');
    setFunFactor(2);
    setComFactor(2);
  }
  function handleHeartRateUpdate(rating) {
    setComFactor(rating);
  }
  function handleStarRateUpdate(rating) {
    setFunFactor(rating);
  }
  function navigateBackScreen(reader) {
    navigation.navigate(haveReader ? 'Reader' : 'Home', {
      refreshPage: true, //!flagRefreshPage
      currentReader: reader,
    });
  }
  function handleBookStartReading() {
    setLoadingOverlayAction(true);
    var reader = currentReader;
    var readerId = encodedReaderId;
    if (!currentReader) {
      if (allReaders.length > 0) {
        reader = allReaders[0];
        readerId = base64.encode(allReaders[0].id.toString());
      }
    }

    const startOrAlreadyBookUrl =
      setBookStartReading +
      '/' +
      readerId +
      (actionType === 'start'
        ? '/start/reading/book/'
        : '/already/reading/book/') +
      encodedBookId;
    const obj = {
      _token: state.token,
    };
    if (actionType != 'start') {
      const updatedComFactor =
        rateComFactor === 1 ? 2 : rateComFactor === 2 ? 4 : 6;
      obj.fun_factor = rateFunFactor;
      obj.com_factor = updatedComFactor;
    }
    if (startReadingComment != '') {
      obj.book_comment = startReadingComment;
    }
    console.log(
      'url=',
      startOrAlreadyBookUrl,
      ' obj=',
      obj,
      ' reader = ',
      reader,
      'id=',
      readerId,
    );
    //HIT API TO START BOOK READING
    axios
      .post(startOrAlreadyBookUrl, obj)
      .then(response => response.data)
      .then(data => {
        console.log('res=', data);
        setdisableStartButton(true);
        setLoadingOverlayAction(false);
        setStartBookOverlay(false);
        Toast.show(data.message);
        navigateBackScreen(reader);
      })
      .catch(error => {
        setStartBookOverlay(false);
        Toast.show(error);
        console.log('getBooks recommended response error = ', error);
      });
  }
  function updateSelectedReader(item) {
    console.log('selected reader =', item);
    setCurrentReader(item);
    setEncodedReaderId(base64.encode(item.id.toString()));
  }
  const rendertags = bookTags.map((tag, i) => (
    <View key={i} style={{margin: 2}}>
      <View
        style={{
          backgroundColor: i === bookTags.length - 1 ? black : darkGray,
          paddingHorizontal: 2,
          borderRadius: 2,
        }}>
        <Text style={{color: i === bookTags.length - 1 ? white : black}}>
          {tag}
        </Text>
      </View>
    </View>
  ));

  const headerBookBox = () => {
    return (
      <View style={{flexDirection: 'row'}}>
        <View style={styles.bookImageParent}>
          <Image
            style={styles.bookImage}
            source={
              currentBook.thumbnail_image
                ? {uri: currentBook.thumbnail_image}
                : require('../../assets/image_break.png')
            }
            resizeMode={'stretch'}></Image>
        </View>
        <View style={{padding: 5, flex: 1}}>
          <View style={{flexDirection: 'row'}}>
            <View style={{flex: 1}}>
              <Text
                style={[{fontSize: 15}, globalStyle.fontMedium]}
                numberOfLines={3}>
                {currentBook.name}
              </Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', flex: 1}}>
            {currentBook.like ? (
              <View style={{flex: 1, justifyContent: 'flex-end'}}>
                <Text style={[{color: black, opacity: 0.6}, globalStyle.font]}>
                  Book rating:
                </Text>
                <Text style={[globalStyle.fontMedium]}>
                  {currentBook.like ? currentBook.like : 0}
                </Text>
              </View>
            ) : null}
            <View style={{flex: 1, justifyContent: 'flex-end'}}>
              <Text style={[{color: black, opacity: 0.6}, globalStyle.font]}>
                Total pages:
              </Text>
              <Text style={[globalStyle.fontMedium]}>{currentBook.pages}</Text>
            </View>
          </View>
          <View style={{margin: 10}}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={{flex: 1}}
                onPress={() => handleVotes(1)}>
                <Icon3
                  name="caret-up-circle"
                  size={24}
                  color={likeDislikeStatus === 'like' ? fourthGreen : black}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{flex: 1}}
                onPress={() => handleVotes(0)}>
                <Icon3
                  name="md-caret-down-circle"
                  size={24}
                  color={likeDislikeStatus === 'dislike' ? red : black}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={{flex: 1, alignItems: 'center'}}
                onPress={() => handleHumanVotes()}>
                <Icon1 name="human-male-male" size={24}></Icon1>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  const renderBookDetail = () => {
    return (
      <View>
        <View style={styleBookDetail.detailContainer}>
          <Text style={[styleBookDetail.detailText, globalStyle.fontBold]}>
            ISBN 10
          </Text>
          <Text style={[styleBookDetail.detailText, globalStyle.font]}>
            {currentBook.isbn_10}
          </Text>
        </View>
        <View style={styleBookDetail.detailContainer}>
          <Text style={[styleBookDetail.detailText, globalStyle.fontBold]}>
            ISBN 13
          </Text>
          <Text style={[styleBookDetail.detailText, globalStyle.font]}>
            {currentBook.isbn_13}
          </Text>
        </View>
        <View style={styleBookDetail.detailContainer}>
          <Text style={[styleBookDetail.detailText, globalStyle.fontBold]}>
            Format
          </Text>
          <Text style={[styleBookDetail.detailText, globalStyle.font]}>
            {currentBook.format}
          </Text>
        </View>
        {currentBook.publication_date != '0000-00-00' ? (
          <View style={styleBookDetail.detailContainer}>
            <Text style={[styleBookDetail.detailText, globalStyle.fontBold]}>
              Publication Date
            </Text>
            <Text style={[styleBookDetail.detailText, globalStyle.font]}>
              {currentBook.publication_date}
            </Text>
          </View>
        ) : null}
        <View style={styleBookDetail.detailContainer}>
          <Text style={[styleBookDetail.detailText, globalStyle.fontBold]}>
            Publisher
          </Text>
          <Text style={[styleBookDetail.detailText, globalStyle.font]}>
            {currentBook.publisher}
          </Text>
        </View>
        <View style={styleBookDetail.detailContainer}>
          <Text style={[styleBookDetail.detailText, globalStyle.fontBold]}>
            Author
          </Text>
          <Text style={[styleBookDetail.detailText, globalStyle.font]}>
            {currentBook.publisher}
          </Text>
        </View>
      </View>
    );
  };

  const renderBookReviews = () => {
    return (
      <>
        <View style={{flexDirection: 'row', marginBottom: 20}}>
          <Text style={[{fontSize: 14}, globalStyle.fontBold]}>Reviews</Text>
        </View>
        <View>
          {reviewsList.map((item, index) => (
            <View key={index}>
              <View style={{marginTop: 10}}>
                <View
                  style={{
                    margin: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Avatar
                    rounded
                    title={item?.commentBy?.substring(0, 1)}
                    size="small"
                    titleStyle={globalStyle.fontMedium}
                    overlayContainerStyle={{
                      backgroundColor: secondary,
                      marginStart: 0,
                    }}
                  />

                  <ListItem.Content style={{marginHorizontal: 10}}>
                    <ListItem.Title style={globalStyle.fontMedium}>
                      {item?.commentBy}
                    </ListItem.Title>
                    <ListItem.Subtitle style={globalStyle.font}>
                      {moment(item.created_at).format('DD/MM/YYYY')}
                    </ListItem.Subtitle>
                  </ListItem.Content>
                </View>
                <View style={{marginTop: 5}}>
                  <Text style={[globalStyle.font]}>{item.comment}</Text>
                </View>
              </View>
              {reviewsList.length - 1 != index ? (
                <View style={styleBookDetail.listDevider}></View>
              ) : null}
            </View>
          ))}
        </View>
      </>
    );
  };
  const handleVotes = voteType => {
    if (voteType === 0) {
      setlikeDislikeStatus('dislike');
    } else {
      setlikeDislikeStatus('like');
    }
    // VOTE TYPE = 0 FOR DISLIKE AND 1 FOR LIKE
    const obj = {
      book_id: currentBook.id,
      vote_type: voteType,
      _token: state.token,
    };
    //API TO FETCH READERS
    axios
      .post(voteApi, obj)
      .then(res => res.data)
      .then(response => {
        if (response.status === 'success') {
          if (voteType === 0) {
            Toast.show('You down voted this book');
          } else {
            Toast.show('You up voted this book');
          }
        }
      })
      .catch(error => {
        setlikeDislikeStatus(null);
        console.log('error handling votes =', error);
        Toast.show('Server Error!');
      });
  };
  const handleHumanVotes = () => {};
  let readerPickerItems = allReaders.map((s, i) => {
    return (
      <Picker.Item key={i} value={s} label={s.first_name + ' ' + s.last_name} />
    );
  });

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
      <View style={styles.mainContainer}>
        <View style={styles.tintBox}>{headerBookBox()}</View>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonStyle}>
            <Button
              buttonStyle={{borderColor: red}}
              titleStyle={[{color: red}, globalStyle.fontBold]}
              title="Start reading"
              icon={
                <Icon
                  name="caretright"
                  color={red}
                  size={18}
                  style={{marginHorizontal: 5}}
                />
              }
              type="outline"
              disabled={disableStartButton}
              onPress={e => handleStartBook('start')}
            />
          </View>
          {noActionButtons ? null : (
            <View style={styles.buttonStyle}>
              <Button
                buttonStyle={{borderColor: black, opacity: 0.6}}
                titleStyle={[{color: black}, globalStyle.fontBold]}
                title="Already read"
                icon={
                  <Icon1
                    name="check-all"
                    // color={red}
                    size={18}
                    style={{marginHorizontal: 5}}
                  />
                }
                type="outline"
                disabled={disableStartButton}
                onPress={() => handleStartBook('alreadyRead')}
              />
            </View>
          )}
        </View>
        {currentBook.description ? (
          <View>
            <Text style={[{margin: 10}, globalStyle.subHeading]}>
              Description
            </Text>
            <Text style={[{margin: 10, opacity: 0.6}, globalStyle.font]}>
              {currentBook.description}
            </Text>
          </View>
        ) : null}

        <View style={styleBookDetail.tagsParent}>{rendertags}</View>
        <View style={styleBookDetail.parent}>{renderBookDetail()}</View>
        {reviewsList.length > 0 ? (
          <View style={{marginHorizontal: 10, marginTop: 20}}>
            {renderBookReviews()}
          </View>
        ) : null}

        <StartBook
          updateBookOverlay={updateBookOverlay}
          selectedRecommendedBook={currentBook}
          startBookOverlay={startBookOverlay}
          allReaders={allReaders}
          currentReader={currentReader}
          haveReader={haveReader}
          actionType={actionType}
          rateFunFactor={rateFunFactor}
          rateComFactor={rateComFactor}
          isOverlayActionLoading={isOverlayActionLoading}
          setStartReadingComment={setStartReadingComment}
          handleBookStartReading={handleBookStartReading}
          updateSelectedReader={updateSelectedReader}
          handleHeartRateUpdate={handleHeartRateUpdate}
          handleStarRateUpdate={handleStarRateUpdate}
        />
      </View>
    </ScrollView>
  );
}

const StartBook = props => {
  let readerItems = props.allReaders.map((s, i) => {
    return (
      <Picker.Item key={i} value={s} label={s.first_name + ' ' + s.last_name} />
    );
  });

  return (
    <Overlay
      isVisible={props.startBookOverlay}
      overlayStyle={styleBookStart.overlayStyle}
      onBackdropPress={e => props.updateBookOverlay()}>
      <ScrollView>
        <View style={styleBookStart.parentContainer2}>
          <View style={styleBookStart.headingContainer}>
            <Text style={[styleBookStart.heading, globalStyle.subHeading]}>
              {props.actionType === 'start' ? 'Start Reading' : 'Already Read'}
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
                source={
                  props.selectedRecommendedBook?.thumbnail_image
                    ? {uri: props.selectedRecommendedBook?.thumbnail_image}
                    : require('../../assets/image_break.png')
                }
                resizeMode={'stretch'}
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

          {!props.haveReader ? (
            <View>
              <Text style={[globalStyle.fontMedium, {marginTop: 10}]}>
                Select Reader:
              </Text>
              <View style={[styleBookStart.pickerContainer, {marginTop: 5}]}>
                <Picker
                  selectedValue={props.currentReader}
                  style={[{height: '100%', width: '100%'}]}
                  mode="dropdown"
                  onValueChange={itemValue =>
                    props.updateSelectedReader(itemValue)
                  }>
                  {readerItems}
                </Picker>
              </View>
            </View>
          ) : null}

          {props.actionType != 'start' ? (
            <View style={styleBookStart.rateParent}>
              <View style={styleBookStart.singleRateContainer}>
                {/* <View style={{height: 50}}> */}
                  <Text style={[globalStyle.fontMedium, {opacity: 0.6}]}>
                    Tell us how much fun was this book?
                  </Text>
                {/* </View> */}
                <View style={{alignItems: 'flex-start'}}>
                  <Rating
                    style={{marginTop: 5}}
                    image
                    ratingCount={3}
                    imageSize={30}
                    startingValue={props.rateFunFactor}
                    onFinishRating={rate => props.handleStarRateUpdate(rate)}
                  />
                </View>
              </View>
              <View style={{width:3}}></View>
              <View style={styleBookStart.singleRateContainer}>
                {/* <View style={{height: 50}}> */}
                  <Text style={[globalStyle.fontMedium, {opacity: 0.6}]}>
                    Did you understand this book?
                  </Text>
                {/* </View> */}

                <View style={{alignItems: 'flex-start'}}>
                  <Rating
                    style={{marginTop: 5}}
                    type="heart"
                    ratingCount={3}
                    imageSize={30}
                    startingValue={props.rateComFactor}
                    // showRating
                    onFinishRating={rate => props.handleHeartRateUpdate(rate)}
                  />
                </View>
              </View>
            </View>
          ) : null}

          <View style={styleBookStart.inputContainer}>
            <Text style={[globalStyle.fontMedium]}>
              Your comments on this book (optional)
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
              icon={
                props.actionType === 'start' ? (
                  <Icon name="caretright" style={{marginHorizontal: 8}} />
                ) : (
                  <Icon1
                    name="check-all"
                    style={{marginHorizontal: 8}}
                    size={17}
                  />
                )
              }
              buttonStyle={{backgroundColor: primary, minWidth: 100}}
              titleStyle={[{color: black, fontSize: 14}, globalStyle.fontBold]}
              title={
                props.actionType === 'start'
                  ? 'Move to "Reading now" bookshelf'
                  : 'Move to "Already read" bookshelf'
              }
              onPress={e => props.handleBookStartReading(e)}
              disabled={props.isOverlayActionLoading}
              loading={props.isOverlayActionLoading}
            />
          </View>
        </View>
      </ScrollView>
    </Overlay>
  );
};

const styleBookDetail = StyleSheet.create({
  listDevider: {
    height: 1,
    width: '90%',
    backgroundColor: black,
    opacity: 0.2,
    alignSelf: 'center',
    marginTop: 10,
  },
  parent: {
    width: '100%',
    height: 'auto',
    backgroundColor: white,
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    padding: 10,
    paddingBottom: 20,
  },
  detailContainer: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  detailText: {flex: 1, fontSize: 14},
  tagsParent: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    margin: 10,
  },
});
const styleBookStart = StyleSheet.create({
  rateParent: {flexDirection: 'row', flex: 1, marginTop: 10},
  singleRateContainer: {flex: 1},
  pickerContainer: {
    width: '100%',
    height: 60,
    borderRadius: 5,
    borderColor: lightGray,
    borderWidth: 2,
    padding: 5,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
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
    // alignItems: 'center',
    marginBottom: 10,
    marginRight: 10,
  },
  heading: {
    flex: 1,
    // textAlign: 'center',
    fontSize: 22,
  },
  overlayStyle: {
    width: '80%',
    // height: '80%',
  },
  buttonContainer: {marginVertical: 20, flex: 1, alignSelf: 'center'},
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
    height: 180,
    alignSelf: 'center',
    marginTop: 10,
  },
  bookImageParent: {justifyContent: 'center', margin: 7},
  bookImage: {width: 130, height: 170, borderRadius: 3},

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
