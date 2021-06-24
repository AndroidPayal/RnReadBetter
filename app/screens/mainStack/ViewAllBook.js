import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  FlatList,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Text, Card} from 'react-native-elements';
import base64 from 'react-native-base64';
import axios from 'axios';

import {Context as AuthContext} from '../../hoc/AuthContext';
import {white, primary} from '../../values/colors';
import {getUserCredit, infiniteBookRecommendation} from '../../values/config';
import {globalStyle, globalTitleBar} from '../../values/constants';
import Toast from 'react-native-simple-toast';

export default function ViewAllBooks({route, navigation}) {
  const {value, signout} = useContext(AuthContext);
  const state = value.state;
  const encodedUserId = base64.encode(state.id.toString());
  const currentReader = route.params.currentReader;
  const encodedReaderId = base64.encode(currentReader.id.toString());

  const [isLoading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [page, setCurrrentPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setTitleBar();
  }, []);
  useEffect(() => {
    fetchAllRecommendedBooks();
  }, [page]);

  function setTitleBar() {
    // const creditUrl = getUserCredit + '/' + encodedUserId;
    // //API TO FETCH User Credit
    // axios
    //   .get(creditUrl)
    //   .then(response2 => response2.data)
    //   .then(result => {
        navigation.setOptions(
          globalTitleBar(
            state.name.substring(0, 1),
            currentReader.first_name + "'s Bookshelf",
            null,//result.credits,
            navigation,
            false,
          ),
        );
        setLoading(false);
      // })
      // .catch(error => {
      //   console.log('credit error = ', error);
      //   Toast.show(
      //     "Server Error! can't fetch credit"
      //   );
      //   setLoading(false);
      // });
  }
  function fetchAllRecommendedBooks() {
    const bookRecommendedURL =
      infiniteBookRecommendation +
      '/' +
      encodedReaderId +
      '/recommended/' +
      page;

    //API TO GET RECOMMENDED BOOKS FOR THIS READER
    axios
      .get(bookRecommendedURL)
      .then(response => response.data)
      .then(data => {
        //   var obj ={
        //     "1":{
        //     "id":1,
        //     "name":"Dear Zoo : A Lift-the-flap Book",
        //     "thumbnail_image":"https:\/\/d1w7fb2mkkr3kw.cloudfront.net\/assets\/images\/book\/lrg\/9781\/4169\/9781416947370.jpg",
        //  },
        //  "3":{
        //     "id":16,
        //     "name":"In My Heart:A Book of Feelings : A Book of Feelings",
        //     "thumbnail_image":"https:\/\/d1w7fb2mkkr3kw.cloudfront.net\/assets\/images\/book\/lrg\/9781\/4197\/9781419713101.jpg",
        //  }}

        countProperties(data.books);
      })
      .catch(error => {
        console.log('getBooks recommended response error = ', error);
        Toast.show(
          "Server Error! can't fetch recommendations"
        );
      });
  }
  function countProperties(obj) {
    var arrayOfBooks = [];
    for (var prop in obj) {
      var element = obj[prop];
      arrayOfBooks.push(element);
    }
    setBooks(page === 0 ? arrayOfBooks : [...books, ...arrayOfBooks]);
  }

  function handleRecommendedBookClick(book) {
    navigation.navigate('BookStartRead', {
      currentBook: book,
      currentReader: currentReader,
      haveReader: true,
    });
  }

  const renderBooks = (item, index) => {
    return (
      <View style={{width: '50%', justifyContent:'center'}} key={index}>
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
      </View>
    );
  };

  const loadMoreBooks = () => {
    console.log('loading page no=', page + 1);
    setCurrrentPage(page + 1);
  };

  const renderLoader = () => {
    return (
      <ActivityIndicator
        style={{width: 24, height: 24, alignSelf: 'center', margin: 5}}
        size="small"
        color={primary}
      />
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
    <SafeAreaView style={styles.parentContainer}>
      <FlatList
        data={books}
        numColumns={2}
        renderItem={({item, index}) => renderBooks(item, index)}
        keyExtractor={(item, index) => index}
        key={item => item}
        onEndReachedThreshold={0}
        onEndReached={e => {
          loadMoreBooks();
        }}
        ListFooterComponent={e => renderLoader()}></FlatList>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
