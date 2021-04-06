import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, FlatList, Image} from 'react-native';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import {Button, Text} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import base64 from 'react-native-base64';

import {Context as AuthContext} from '../../hoc/AuthContext';
import {
  darkGray,
  lightGray,
  white,
  readerBackground,
  black,
} from '../../values/colors';
import {getReadersUrl, getUserCredit} from '../../values/config';
import {TouchableOpacity} from 'react-native';

export default function HomeScreen({navigation}) {
  const {state, signout} = useContext(AuthContext);

  const encodedUserId = base64.encode(state.userId.toString()); //(state.userId ? state.userId.toString() : '29')
  const [readers, setReaders] = useState([]);
  const [userCredit, setUserCredit] = useState(0);
  const [popularBooks, setPopularBooks] = useState([
    {name: 'a', url: 'https://reactnative.dev/img/tiny_logo.png'},
    {name: 'a', url: 'https://reactnative.dev/img/tiny_logo.png'},
    {name: 'a', url: 'https://reactnative.dev/img/tiny_logo.png'},
    {name: 'a', url: 'https://reactnative.dev/img/tiny_logo.png'},
    {name: 'a', url: 'https://reactnative.dev/img/tiny_logo.png'},
    {name: 'a', url: 'https://reactnative.dev/img/tiny_logo.png'},
    {name: 'a', url: 'https://reactnative.dev/img/tiny_logo.png'},
    {name: 'a', url: 'https://reactnative.dev/img/tiny_logo.png'},
    {name: 'a', url: 'https://reactnative.dev/img/tiny_logo.png'},
  ]);

  useEffect(() => {
    const creditUrl = getUserCredit + '/' + encodedUserId;
    //API TO FETCH User Credit
    axios
      .get(creditUrl)
      .then(response2 => {
        setUserCredit(response2.data);
      })
      .then(() => {
        navigation.setOptions({
          headerTitle: 'Home',
          headerStyle: {
            backgroundColor: lightGray,
          },
          headerRight: () => (
            <View
              style={{margin: 10, flexDirection: 'row', alignItems: 'center'}}>
              <Image
                style={{width: 15, height: 15, margin: 5}}
                source={{
                  uri:
                    'https://thereadbettercompany.com/public/cdn/assets/media/avatars/credit.png',
                }}></Image>
              <View
                style={{
                  backgroundColor: '#F5A500',
                  padding: 3,
                  borderRadius: 10,
                }}>
                <Text>{'' + userCredit.credits}</Text>
              </View>
            </View>
          ),
        });
      });
  }, [navigation, userCredit]);

  useEffect(() => {
    const readersUrl = getReadersUrl + '/' + encodedUserId;
    //API TO FETCH READERS
    axios.get(readersUrl).then(response => {
      setReaders(response.data);
    });
  }, []);

  async function handleSignOut(e) {
    e.preventDafault();
    signout();
  }
  const handleReaderSelection = (e, reader) => {
    // e.preventDefault()
    console.log('clik');
    navigation.navigate('Reader', reader);
  };
  const readersListView = readers.map((reader, i) => (
    <TouchableOpacity key={i} onPress={e => handleReaderSelection(e, reader)}>
      <View
        style={{
          height: 100,
          width: 80,
          backgroundColor: readerBackground[i]
            ? readerBackground[i]
            : readerBackground[Math.floor(Math.random() * 4)],
          alignItems: 'center',
          borderRadius: 8,
          marginRight: 5,
        }}>
        <View style={styles.readerIcon}>
          <Icon1 name="face-outline" size={40} color={white} />
        </View>
        <Text style={styles.readerName}>{reader.first_name}</Text>
      </View>
    </TouchableOpacity>
  ));
  const headerRender = () => {
    return (
      <>
        <View style={styles.welcomeContainer}>
          <Text style={styles.textHello}>Hello ,</Text>
          <Text h3>current User name</Text>
        </View>
        <View style={styles.welcomeContainer}>
          <Text style={styles.grayHeading}>Here are your readers...</Text>
          <View
            style={{
              width: '100%',
              height: 'auto',
              flexDirection: 'row',
              marginTop: 10,
            }}>
            <ScrollView horizontal={true}>{readersListView}</ScrollView>
            <View
              style={{
                width: 80,
                height: 100,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon2 name="plus" size={30} color={darkGray} />
            </View>
          </View>
        </View>
        <Text h4 style={styles2.popularBookHeading}>
          Popular Books
        </Text>
      </>
    );
  };
  const footerRender = () => {
    return (
      <TouchableWithoutFeedback onPress={e => handleSignOut(e)}>
        <Button title="SignOut" />
      </TouchableWithoutFeedback>
    );
  };
  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* <View style={styles2.popularContainer}> */}
      <FlatList
        data={popularBooks}
        renderItem={({item}) => (
          <View style={styles2.popularGridItem}>
            <Image
              source={{uri: item.url}}
              style={styles2.imagePopularBook}></Image>
            <Text>{item.name}</Text>
          </View>
        )}
        //Setting the number of column
        numColumns={3}
        key={item => item}
        keyExtractor={(item, index) => index}
        ListHeaderComponent={headerRender}
        ListFooterComponent={footerRender}
      />
      {/* </View> */}
    </SafeAreaView>
  );
}
const styles2 = StyleSheet.create({
  popularBookHeading: {
    margin: 10,
  },
  imagePopularBook: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  popularGridItem: {
    flex: 1,
    flexDirection: 'column',
    margin: 5,
    // height:100,
    // width:80,
    // backgroundColor:lightGray,
    alignItems: 'center',
    borderRadius: 8,
  },
  popularContainer: {
    margin: 10,
  },
});
const styles = StyleSheet.create({
  readerName: {
    color: white,
    fontSize: 15,
    margin: 2,
    fontWeight: 'bold',
  },
  readerIcon: {
    flex: 1,
    justifyContent: 'center',
  },
  mainContainer: {
    backgroundColor: white,
    flex: 1,
  },
  welcomeContainer: {
    margin: 10,
  },
  textHello: {
    fontSize: 18,
    color: darkGray,
  },
  grayHeading: {
    color: darkGray,
    marginBottom: 5,
  },
});
