import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, Text} from 'react-native';
import {FlatList, View, Image} from 'react-native';
import axios from 'axios';
import base64 from 'react-native-base64';
import {Card} from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign'

import {black, darkGray, lightGray, primary, white} from '../../values/colors';
import {getBooksOfAReader} from '../../values/config';
import {ActivityIndicator} from 'react-native';
import {ScrollView} from 'react-native';
import { TouchableOpacity } from 'react-native';
import { globalStyle } from '../../values/constants';

export default function ReaderPage({route, navigation}) {
  const currentReader = route.params;
  const encodedReaderId = base64.encode(currentReader.id.toString());
  const [booksCurrentlyReading, setCurrentBooks] = useState([]);
  const [booksStoppedReading, setStoppedBooks] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [scrollWidthCurrentBooks, setScrollWidthCurrentBooks] = useState(0);
  const [contentWidthCurrentBooks, setContentWidthCurrentBooks] = useState(0);
  const [scrollPercentCurrentBooks, setScrollPercentCurrentBooks] = useState(0);
  const [scrollElementWidthPercent,setPercentWidth] = useState(50)


  useEffect(() => {
    setLoading(true);
    navigation.setOptions({
      headerTitle:
        currentReader?.first_name + ' ' + currentReader?.last_name + "'s Track",
    });
    const bookURL = getBooksOfAReader + '/' + encodedReaderId;
    //FETCH BOOKS FROM API
    axios
      .get(bookURL)
      .then(response => response.data)
      .then(data => {
        // console.log('books = ', data);
        setCurrentBooks(data.StartedBooks);
        setStoppedBooks(data.FinishedAndStopedBooks);
        setLoading(false);
      });
  }, []); //navigation, currentReader

  function handleBookClick(book) {
    // console.log('clicked Book');
    navigation.navigate('BookStatus', {
      currentBook: book,
      currentReader: currentReader
    });
  }
  const renderCurrentBooks = (item, index) => {
    return (
        <TouchableOpacity  onPress={e=>handleBookClick(item)}>
            <Card containerStyle={styles.bookContainer} >
                <Card.Image
                style={styles.cardImage}
                source={{uri: item.thumbnail_image}} //'https://picsum.photos/700'}}//
                resizeMode="stretch"></Card.Image>
                <Text style={[styles.cardText, globalStyle.font]}>
                {item.name}
                </Text>
            </Card>
        </TouchableOpacity>
    );
  };
  const handleScrollView= (event) =>{
    if(event){
    // console.log('offset = ', event.nativeEvent.contentOffset );
    const scrollPerc = (event.nativeEvent.contentOffset.x  / (contentWidthCurrentBooks - scrollWidthCurrentBooks)) * (100 - scrollElementWidthPercent);
    setScrollPercentCurrentBooks(scrollPerc)
    // console.log('scroll percent =', scrollPerc);
    }
  }
  const setScrollViewWidth=(e)=>{
    if(e)
    setScrollWidthCurrentBooks(e.nativeEvent.layout.width)
    // console.log('scrollwidth = ', e.nativeEvent.layout);
  }
  const setContentSize=(width)=>{
    if(width)
    setContentWidthCurrentBooks(width)
    // console.log('content width = ',width);

  }
  return isLoading ? (
    <ActivityIndicator
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
      size="large"
      color={primary}
    />
  ) : (
    <ScrollView style={styles.parentContainer}>
      <SafeAreaView style={styles.parentContainer}>
        {/* CURRENTLY READING BOOKS */}
        <Text style={[styles.heading, globalStyle.fontBold]}>{'Currently Reading'}</Text>
        <View style={styles.flatlistContainer}>
          {scrollPercentCurrentBooks>10 ?
              <View style={{width:12, alignItems:'center', justifyContent:'center',marginLeft:-7}}>
                <Icon name='left' size={14} color={darkGray}></Icon>
              </View>
            :null}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={booksCurrentlyReading}
            renderItem={({item, index}) => renderCurrentBooks(item, index)}
            keyExtractor={(item, index) => index}
            onScroll={e=>handleScrollView(e)}
            onLayout={ew=>setScrollViewWidth(ew)}
            onContentSizeChange={( width,_) => {
              setContentSize(width);
            }}
            key={item => item}/>
            {scrollPercentCurrentBooks<scrollElementWidthPercent-10 ?
              <View style={{width:12, alignItems:'center', justifyContent:'center',marginRight:-7}}>
                <Icon name='right' size={14} color={darkGray}></Icon>
              </View>
            :null}
            
        </View>
        {/* BOOK SUGGESTIONS */}
        <Text style={[styles.heading, globalStyle.fontBold]}>{'Book Suggestions'}</Text>
        <View style={styles.flatlistContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={booksCurrentlyReading}
            renderItem={({item, index}) => renderCurrentBooks(item, index)}
            keyExtractor={(item, index) => index}
            key={item => item}></FlatList>
        </View>
        {/* BOOKS READ */}
        <Text style={[styles.heading, globalStyle.fontBold]}>{'Already Read Books'}</Text>
        <View style={styles.flatlistContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={booksStoppedReading}
            renderItem={({item, index}) => renderCurrentBooks(item, index)}
            keyExtractor={(item, index) => index}
            key={item => item}></FlatList>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  heading: {
    marginTop: 10,
    fontSize: 20,
  },
  flatlistContainer: {
    height: 'auto',
    width: '100%',
    flexDirection:'row'
  },
  parentContainer: {
    backgroundColor: white,
    flex: 1,
    padding: 10,
    marginBottom:10
  },
  bookContainer: {elevation: 4, padding: 0, borderRadius: 7, width: 150},
  cardImage: {borderTopLeftRadius: 5, borderTopRightRadius: 5},
  cardText: {
    color: black,
    minHeight: 40,
    alignSelf: 'center',
    textAlignVertical: 'center',
  },
});