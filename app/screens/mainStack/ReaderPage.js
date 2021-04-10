import React, {useEffect, useState} from 'react';
import { SafeAreaView, StyleSheet ,Text} from 'react-native';
import { FlatList , View, Image} from 'react-native';
import axios from 'axios';
import base64 from 'react-native-base64';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';

import { darkGray, lightGray, white } from '../../values/colors';
import { getBooksOfAReader } from "../../values/config";

export default function ReaderPage({route, navigation}) {
    const currentReader= route.params;
    const encodedReaderId = base64.encode(currentReader.id.toString());
    const [booksCurrentlyReading, setCurrentBooks] = useState([])

    useEffect(()=>{
        navigation.setOptions({
            headerTitle: currentReader?.first_name +' '+ currentReader?.last_name+ '\'s Track',
        })
        const bookURL = getBooksOfAReader + '/' + encodedReaderId
        //FETCH BOOKS FROM API
        axios.get(bookURL)
        .then(response => response.data)
        .then(data=>{
            console.log('books = ', data);
            setCurrentBooks(data.StartedBooks)
        });

    },[])//navigation, currentReader

    const renderCurrentBooks = (item, index) => {
        return(
            // <View style={styles.bookContainer}>
            //      <Image
            //         source={{uri: item.thumbnail_image}}
            //         style={styles.imagePopularBook}></Image>
            //     <Text style={styles.bookName}>{item.name}</Text>
            // </View>
            <Card>
                <Card.Title title="Card Title" subtitle="Card Subtitle"  />
                <Card.Content>
                <Title>Card title</Title>
                <Paragraph>Card content</Paragraph>
                </Card.Content>
                <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />

            </Card>
            )
    }

    return(
        <SafeAreaView style={styles.parentContainer}>
            {/* CURRENTLY READING BOOKS */}
            <Text style={styles.heading}>{'Currently Reading ...'}</Text>
            <View style={styles.flatlistContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={booksCurrentlyReading}
                    renderItem={({item, index}) => renderCurrentBooks(item, index)}
                    keyExtractor={(item, index) => index}
                    key={item => item}
                >
                </FlatList>
            </View>
            {/* BOOK SUGGESTIONS */}
            <Text style={styles.heading}>{'Book Suggestions'}</Text>
            <View style={styles.flatlistContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={booksCurrentlyReading}
                    renderItem={({item, index}) => renderCurrentBooks(item, index)}
                    keyExtractor={(item, index) => index}
                    key={item => item}
                >
                </FlatList>
            </View>
            {/* BOOKS READ */}
            <Text style={styles.heading}>{'Already Read Books'}</Text>
            <View style={styles.flatlistContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={booksCurrentlyReading}
                    renderItem={({item, index}) => renderCurrentBooks(item, index)}
                    keyExtractor={(item, index) => index}
                    key={item => item}
                >
                </FlatList>
            </View>
            
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    heading:{
        marginTop:10,
        fontSize:20
    },
    flatlistContainer:{
        height:'auto',
    width: '100%'
    },
    imagePopularBook:{
        width:'100%', 
        height:100, 
        resizeMode: 'cover'
    },
    bookName:{
        fontWeight:'bold', 
        fontSize: 16
    },
    parentContainer:{
        backgroundColor:white, 
        flex:1,
        padding:10
    },
    bookContainer:{
        width:90, 
        margin:5, 
        alignItems: 'center'
    }
})
/*
{"avatar": null, "created_at": "2021-04-05T12:14:00.000000Z", "dob": "2017-02-23", "dra": "0"
, "first_name": "raja", "gender": "0", "gra": "0", "grade": "0", "id": 31, "last_name": "babu", "lexel": "0",
 "lower_seek": 2, "performance": 0, "rbsr": 4, "rbsr_update_session_id": 0, "reminder_time": "20:00:00",
 "school_id": "102385", "status": "1"
, "type": "general", "updated_at": "2021-04-05T12:14:00.000000Z", "upper_seek": 5, "user_id": 29}*/