import React, {useEffect, useState} from 'react';
import { SafeAreaView, StyleSheet ,Text} from 'react-native';
import { FlatList , View, Image} from 'react-native';
import axios from 'axios';
import base64 from 'react-native-base64';
import {Card} from 'react-native-elements'

import { black, primary, white } from '../../values/colors';
import { getBooksOfAReader } from "../../values/config";
import { ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native';

export default function ReaderPage({route, navigation}) {
    const currentReader= route.params;
    const encodedReaderId = base64.encode(currentReader.id.toString());
    const [booksCurrentlyReading, setCurrentBooks] = useState([])
    const [booksStoppedReading, setStoppedBooks] = useState([])
    const [isLoading, setLoading] = useState(false)

    useEffect(()=>{
        setLoading(true)
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
            setStoppedBooks(data.FinishedAndStopedBooks)
            setLoading(false)
        });

    },[])//navigation, currentReader

    const renderCurrentBooks = (item, index) => {
        return(
            <Card containerStyle={styles.bookContainer}>
                <Card.Image style={styles.cardImage} 
                source={{uri:item.thumbnail_image}}//'https://picsum.photos/700'}}//
                resizeMode='stretch'
                ></Card.Image>
                <Card.FeaturedSubtitle style={styles.cardText}>{item.name}</Card.FeaturedSubtitle>
            </Card>
            )
    }

    return isLoading ? (
        <ActivityIndicator 
            style={{
            flex: 1,
            justifyContent: 'center',
          }}
          size="large"
          color={primary}/>
    ):(
        <ScrollView>
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
                    data={booksStoppedReading}
                    renderItem={({item, index}) => renderCurrentBooks(item, index)}
                    keyExtractor={(item, index) => index}
                    key={item => item}
                >
                </FlatList>
            </View>
            
        </SafeAreaView>
        </ScrollView>
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
    parentContainer:{
        backgroundColor:white, 
        flex:1,
        padding:10
    },
    bookContainer:{elevation:4,padding:0, borderRadius:7, width:150},
    cardImage:{borderTopLeftRadius:5,borderTopRightRadius:5},
    cardText:{color:black, minHeight:40, alignSelf:'center',textAlignVertical:'center'}
})
/*
{"avatar": null, "created_at": "2021-04-05T12:14:00.000000Z", "dob": "2017-02-23", "dra": "0"
, "first_name": "raja", "gender": "0", "gra": "0", "grade": "0", "id": 31, "last_name": "babu", "lexel": "0",
 "lower_seek": 2, "performance": 0, "rbsr": 4, "rbsr_update_session_id": 0, "reminder_time": "20:00:00",
 "school_id": "102385", "status": "1"
, "type": "general", "updated_at": "2021-04-05T12:14:00.000000Z", "upper_seek": 5, "user_id": 29}*/