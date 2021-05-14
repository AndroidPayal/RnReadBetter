import React, {useEffect, useState, useContext} from 'react';
import {
  StyleSheet,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  FlatList
} from 'react-native';
import {
  Text,
  Button,
  Input,
  Overlay,
  Card,
  ListItem,
  Avatar,
  Rating
} from 'react-native-elements';
import {Chip} from 'react-native-paper'
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import axios from 'axios';
import base64 from 'react-native-base64';
import { Picker } from "@react-native-picker/picker";

import {
  white,
  lightGray,
  tintBackground,
  black,
  red,
  primary,
  darkGray,
  secondary,
} from '../../values/colors';
import {
  getUserCredit,
  default_BookImage,
  setBookStartReading,
  fetchBookTagsUrl,
  getReadersUrl
} from '../../values/config';
import {Context as AuthContext} from '../../hoc/AuthContext';
import {globalStyle, globalTitleBar} from '../../values/constants';

export default function BookStartRead({route, navigation}) {
  const currentBook = route.params.currentBook;
  const haveReader = route.params.haveReader
  const [currentReader, setCurrentReader] = useState(route.params.currentReader)
  const [encodedReaderId, setEncodedReaderId] = useState( currentReader? base64.encode(currentReader.id.toString()) : '')
  const encodedBookId = base64.encode(currentBook.id.toString());
  const {value} = useContext(AuthContext);
  const state = value.state;
  const encodedUserId = base64.encode(state.userId.toString());

  const [isLoading, setLoading] = useState(false);
  const [startBookOverlay, setStartBookOverlay] = useState(false);
  const [startReadingComment, setStartReadingComment] = useState('');
  const [disableStartButton, setdisableStartButton] = useState(false);
  const [flagRefreshPage, setFlagRefreshPage] = useState(false)
  const [bookTags, setBookTags] = useState([])
  const [allReaders, setReaders] = useState([])
  const [reviewsList, setReviews] = useState(['a', 'b'])
  const [actionType, setActionType] = useState('start')
  const [rateFunFactor, setFunFactor] = useState(2);
  const [rateComFactor, setComFactor] = useState(2);

  // const [userCredit, setUserCredit] = useState(0);

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
            currentReader ? currentReader.first_name + "'s Bookshelf" : 'Book Detail',
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
    setTitleBar();
    fetchBookTags()

    //IF CURRENTREADER IS BLANK THEN FETCH ALL READERS OF CURRENT USER
    // if(!currentReader){
      const readersUrl = getReadersUrl + '/' + encodedUserId;
      //API TO FETCH READERS
      axios
        .get(readersUrl)
        .then(res=> res.data)
        .then(response => {
          setReaders(response)
        })
        .catch(error => {
          console.log('get reader error =', error);
        });
    // }
  }, []);

  function fetchBookTags() {
    const booksTag = fetchBookTagsUrl + '/' + encodedBookId + '/tags';
    //API TO FETCH READERS
    axios
    .get(booksTag)
    .then(res=> res.data)
    .then(response => {
      var tagArray = response
      if(tagArray.length> 10){
        var randomIndex = Math.floor(Math.random() * (tagArray.length-10))
        tagArray = tagArray.slice(randomIndex,randomIndex+10)
      }
      tagArray[tagArray.length] = '+ Suggest'
      setBookTags(tagArray)
    })
    .catch(error => {
      console.log('get book tags error =', error);
    });
  }
  function handleStartBook(type) {
    if(allReaders.length > 0){
      setActionType(type)
      setStartBookOverlay(true);
    }else{
      ToastAndroid.show('You don\'t have any reader!',ToastAndroid.SHORT)
    }
  }
  function updateBookOverlay() {
    setStartBookOverlay(false);
    setStartReadingComment('');
    setFunFactor(2)
    setComFactor(2)
  }
  function handleHeartRateUpdate(rating) {
    setComFactor(rating)
  }
  function handleStarRateUpdate(rating) {
    setFunFactor(rating)
  }
  function navigateBackScreen(reader) {
    navigation.navigate(haveReader ? 'Reader' : 'Home', {
      refreshPage: !flagRefreshPage,
      currentReader: reader,
    });
  }
  function handleBookStartReading() {
    // setLoading(true)
    console.log('handle action');
    var reader = currentReader
    var readerId = encodedReaderId
    if(!currentReader){
      if(allReaders.length>0){
        reader = allReaders[0]
        readerId = base64.encode(allReaders[0].id.toString())
      }
    }

    const startOrAlreadyBookUrl =
      setBookStartReading +
      '/' +  readerId +
      (actionType==='start' ? '/start/reading/book/' : '/already/reading/book/') 
      + encodedBookId
    const obj = {
      _token: state.token,
    };
    if(actionType != 'start'){
      const updatedComFactor = rateComFactor === 1 ? 2 :( rateComFactor === 2 ? 4 : 6)
      obj.fun_factor = rateFunFactor;
      obj.com_factor = updatedComFactor;
    }
    if (startReadingComment != '') {
      obj.book_comment = startReadingComment;
    }
    console.log('url=', startOrAlreadyBookUrl, ' obj=', obj, ' reader = ', reader, 'id=', readerId);
    //HIT API TO START BOOK READING
    axios
      .post(startOrAlreadyBookUrl, obj)
      .then(response => response.data)
      .then(data => {
        console.log('res=', data);
        setdisableStartButton(true)
        setStartBookOverlay(false);
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        navigateBackScreen(reader)
      })
      .catch(error => {
        setStartBookOverlay(false);
        ToastAndroid.show(error, ToastAndroid.SHORT);
        console.log('getBooks recommended response error = ', error);
      });
  }
  function updateSelectedReader(item) {
    console.log('selected reader =', item);
    setCurrentReader(item)
    setEncodedReaderId(base64.encode(item.id.toString()) )
  }
  const rendertags =bookTags.map((tag,i)=> (
    <View key={i} style={{margin:2}}>
      <Chip style={{ backgroundColor: primary}} >
        <Text style={{color: i===bookTags.length-1 ? black : white}}>{tag}</Text>
      </Chip>
    </View>
  ))

  const headerBookBox = () => {
    return(
      <View style={{flexDirection: 'row'}}>
            <View style={styles.bookImageParent}>
              <Image
                style={styles.bookImage}
                source={currentBook.thumbnail_image ? {uri: currentBook.thumbnail_image} : require('../../assets/image_break_100.png')}
                resizeMode={currentBook.thumbnail_image ? "stretch" : "center"}
                ></Image>
            </View>
            <View style={{padding: 5, flex: 1}}>
              <View style={{flexDirection:'row'}}>
                <View style={{ flex:1}}>
                  <Text
                    style={[{fontSize: 15}, globalStyle.fontMedium]}
                    numberOfLines={3}>
                    {currentBook.name}
                  </Text>
                </View>
                <View >
                  <TouchableOpacity onPress={e=>handleStartBook('alreadyRead')}
                    style={{backgroundColor:primary, margin:5, padding:5, borderRadius:5}}>
                    <Text style={[{fontSize: 10}, globalStyle.fontBold]}>
                      Already read
                    </Text>
                  </TouchableOpacity>
                </View>
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
    )
  }
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
          <View style={styleBookDetail.detailContainer}>
            <Text style={[styleBookDetail.detailText, globalStyle.fontBold]}>
              Publication Date
            </Text>
            <Text style={[styleBookDetail.detailText, globalStyle.font]}>
              {currentBook.publication_date}
            </Text>
          </View>
        </View>
    )
  }

  const renderBookReviews = () => {
    return(
      <>
        <View style={{flexDirection:'row', marginBottom:20}}>
          <Text style={[{fontSize:14}, globalStyle.fontBold]}>Reviews</Text>
          <Text style={[{ flex:1, textAlign:'right', fontSize:12}, globalStyle.fontBold]}>Write a review</Text>
        </View>
        <View>
         { reviewsList.map((item,index)=>(
              <View key={index}>
                <View style={{marginTop:10}}>
                  <View style={{margin:0, flexDirection:'row', alignItems:'center'}}>
                      <Avatar 
                        rounded 
                        title="R" 
                        size='small' 
                        titleStyle={globalStyle.fontMedium}
                        overlayContainerStyle={{backgroundColor: secondary, marginStart:0}}/>
          
                      <ListItem.Content style={{marginHorizontal:10}}>
                          <ListItem.Title style={globalStyle.fontMedium}>
                            {'Rehman'}
                          </ListItem.Title>
                          <ListItem.Subtitle style={globalStyle.font}>
                            {'oct 12, 2020'}
                          </ListItem.Subtitle>
                      </ListItem.Content>
          
                      <Chip style={{ backgroundColor: primary}} >
                        <Text style={{color: black}}>{'4/5'}</Text>
                      </Chip>
                  </View>
                  <View style={{marginTop:5}}>
                    <Text style={[globalStyle.font]}>This book is really engaging. Must read for any toddler! It is full of suspenses and tragedies.</Text>
                  </View>
                </View>
                {reviewsList.length-1 != index ?
                  <View style={styleBookDetail.listDevider}></View>
                :null}
              </View>
         ))}
        </View>

      </>
    )
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
          {headerBookBox()}
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonStyle}>
            <Button
              buttonStyle={{borderColor: red}}
              titleStyle={[{color: red}, globalStyle.fontBold]}
              title="Start Reading"
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
        <View style={styleBookDetail.tagsParent}>
          {rendertags}
        </View>
        <View style={styleBookDetail.parent}>
          {renderBookDetail()}
        </View>
        <View style={{marginHorizontal:10, marginTop:20}}>
          {renderBookReviews()}
        </View>

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
    return <Picker.Item key={i} value={s} label={s.first_name} />;
  });

  return (
    <Overlay
      isVisible={props.startBookOverlay}
      overlayStyle={styleBookStart.overlayStyle}
      onBackdropPress={e => props.updateBookOverlay()}>
      <ScrollView>
        <View style={styleBookStart.parentContainer2}>
          <View style={styleBookStart.headingContainer}>
            <Text style={[styleBookStart.heading, globalStyle.fontMedium]}>
              {props.actionType==='start' ? 'Start Reading' : 'Already Read'}
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
                source={props.selectedRecommendedBook?.thumbnail_image ? {uri: props.selectedRecommendedBook?.thumbnail_image} : require('../../assets/image_break_100.png')}
                resizeMode={props.selectedRecommendedBook?.thumbnail_image ? "stretch" : "center"}
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
          
          {!props.haveReader ? 
          <View>
              <Text style={[globalStyle.fontMedium,{marginTop:10}]}>
                Select Reader:
              </Text>
              <View style={[styleBookStart.pickerContainer,{marginTop:5}]}>
                  <Picker
                    selectedValue={props.currentReader}
                    style={[{ height: '100%', width: '100%' }]}
                    mode="dropdown"
                    onValueChange={(itemValue) =>
                      props.updateSelectedReader( itemValue)
                    }
                    >
                    {readerItems}
                  </Picker>
              </View>
            </View>
          :null}


          {props.actionType != 'start' ?
          <View style={styleBookStart.rateParent}>
              <View style={styleBookStart.singleRateContainer}>
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
              <View style={styleBookStart.singleRateContainer}>
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
          :null}

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
              title={props.actionType==='start' ? "Start Reading" : "Already read"}
              onPress={e => props.handleBookStartReading(e)}
            />
          </View>
        </View>
      </ScrollView>
    </Overlay>
  );
};

const styleBookDetail = StyleSheet.create({
  listDevider:{height:1, width:'90%', backgroundColor:black, opacity:0.20, alignSelf:'center', marginTop:10},
  parent: {
    width: '100%',
    height: 'auto',
    backgroundColor: white,
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    padding: 10,
    paddingBottom: 20,
  },
  detailContainer: {flexDirection: 'row', alignItems: 'center', marginTop:5},
  detailText: {flex: 1, fontSize: 14},
  tagsParent:{flexWrap:'wrap', flexDirection:'row', justifyContent:'flex-start', margin:10},

})
const styleBookStart = StyleSheet.create({
  rateParent:{flexDirection:'row', flex:1, marginTop:10},
  singleRateContainer:{flex:1}, 
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
