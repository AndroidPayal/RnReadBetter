import React,{useState, useContext, useEffect} from 'react'
import {StyleSheet, Image, SafeAreaView, FlatList, View, TouchableOpacity, ActivityIndicator} from 'react-native'
import {Text, Card} from 'react-native-elements'
import base64 from 'react-native-base64';
import axios from 'axios';

import {Context as AuthContext} from '../../hoc/AuthContext';
import {darkGray, white, primary} from '../../values/colors'
import { default_BookImage, getBookRecommendedForAReader, getUserCredit} from "../../values/config";
import { globalStyle, globalTitleBar } from "../../values/constants";

export default function ViewAllBooks({route, navigation}) {
    const {value, signout} = useContext(AuthContext);
    const state = value.state;
    const encodedUserId = base64.encode(state.userId.toString());
    const currentReader = route.params.currentReader;
    const encodedReaderId = base64.encode(currentReader.id.toString());

    const[isLoading, setLoading] = useState(false)
    const[books, setBooks] = useState([])
    
    useEffect(()=>{
        setLoading(true)
        fetchAllRecommendedBooks();
        setTitleBar();
    },[])

    function setTitleBar() {
        const creditUrl = getUserCredit + '/' + encodedUserId;
        //API TO FETCH User Credit
        axios
          .get(creditUrl)
          .then(response2 => response2.data)
          .then(result => {
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
    function fetchAllRecommendedBooks(){
        const bookRecommendedURL =
        getBookRecommendedForAReader + '/' + encodedReaderId + '/start/reading';
  
        //API TO GET RECOMMENDED BOOKS FOR THIS READER
        axios
        .get(bookRecommendedURL)
        .then(response => response.data)
        .then(data => {
            setBooks(data);
        })
        .catch(error => {
            console.log('getBooks recommended response error = ', error);
        });
    }
    function handleRecommendedBookClick(book) {
      navigation.navigate('BookStartRead', {
        currentBook: book,
        currentReader: currentReader,
        haveReader: true
      });
    }
    const renderBooks = (item, index) => {
    return (
        <View style={{width:'50%'}}>
            <TouchableOpacity  onPress={e => handleRecommendedBookClick(item)}>
                <Card containerStyle={styles.bookContainer}>
                <View style={styles.cardImageContainer}>
                    <Card.Image
                    style={styles.cardImage}
                    source={item.thumbnail_image ? {uri: item.thumbnail_image} : require('../../assets/image_break_100.png')}
                    resizeMode={item.thumbnail_image ? "stretch" : "center"}
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
    )}

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
        <SafeAreaView style={styles.parentContainer}>
            <FlatList 
                data={books}
                numColumns={2}
                renderItem={({item, index}) => renderBooks(item, index)}
                keyExtractor={(item, index) => index}
                key={item => item}></FlatList>
        </SafeAreaView>
    )
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
      }
})