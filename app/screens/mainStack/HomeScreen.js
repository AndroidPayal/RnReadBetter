import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, FlatList, Image} from 'react-native';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import {Button, Text, Overlay} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Entypo';
import axios from 'axios';
import base64 from 'react-native-base64';
import {Card} from 'react-native-elements'

import {Context as AuthContext} from '../../hoc/AuthContext';
import {
  darkGray,
  lightGray,
  white,
  readerBackground,
  primary,
  black,
} from '../../values/colors';
import {
  getReadersUrl,
  getUserCredit,
  addNewReaderUrl,
} from '../../values/config';
import {TouchableOpacity} from 'react-native';
import AddReader from './AddReader';
import {ActivityIndicator} from 'react-native';

export default function HomeScreen({navigation}) {
  const {state, signout} = useContext(AuthContext);

  const encodedUserId = base64.encode(state.userId.toString()); //(state.userId ? state.userId.toString() : '29')
  const [readers, setReaders] = useState([]);
  const [flagNewReader, setFlagNewReader] = useState(false);
  const [userCredit, setUserCredit] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [popularBooks, setPopularBooks] = useState([
    {name: 'a', url: 'https://picsum.photos/600'},
    {name: 'a', url: 'https://picsum.photos/700'},
    {name: 'a', url: 'https://picsum.photos/500'},
    {name: 'a', url: 'https://picsum.photos/400'},
    {name: 'a', url: 'https://picsum.photos/100'},
    {name: 'a', url: 'https://picsum.photos/300'},
    {name: 'a', url: 'https://picsum.photos/200'},
    {name: 'a', url: 'https://picsum.photos/100'},
    {name: 'a', url: 'https://picsum.photos/500'},
  ]);
  const [openAddOverlay, setToggleOverlay] = useState(false);

  useEffect(() => {
    const creditUrl = getUserCredit + '/' + encodedUserId;
    //API TO FETCH User Credit
    axios
      .get(creditUrl)
      .then(response2 => response2.data)
      .then(result => {
        setUserCredit(result);
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
                <Text>{'' + result.credits}</Text>
              </View>
            </View>
          ),
        });
      });
  }, []); //navigation,credits => REMOVED THIS BCZ IT CAUSED INFINITE LOOP OF THIS FUNCTIONAL COMPONENT

  useEffect(() => {
    console.log('called fetch reader useeffect');
    setLoading(true);
    const readersUrl = getReadersUrl + '/' + encodedUserId;
    //API TO FETCH READERS
    axios.get(readersUrl).then(response => {
      setReaders(response.data);
      setLoading(false);
    });
  }, [flagNewReader]);

  function handleSignOut() {
    // e.preventDafault();
    console.log('sign out');
    signout();
  }
  const handleReaderSelection = (e, reader) => {
    // e.preventDefault()
    console.log('clicked reader');
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
  function handleAddReader() {
    console.log('handle add reader function called');
    setToggleOverlay(true);
  }
  function cancelAddReader(e) {
    console.log('close overlay');
    setToggleOverlay(false);
  }
  function addNewReader(obj) {
    setLoading(true);
    obj._token = state.token; //ADDING CSRF TOKEN TO URL
    console.log('add reader url=', addNewReaderUrl, '\nobj = ', obj);

    //API TO ADD NEW READER
    const apicall = new Promise((resolve, reject) => {
      axios
        .post(addNewReaderUrl, obj)
        .then(response=>response.data)
        .then(data => {
          console.log('add reader response = ', data);
          setLoading(false);
          setFlagNewReader(flagNewReader===true ? false : true)
          return resolve(data.message.toString())
        })
        .catch(error => {
          return reject(error);
        });
    });
    return apicall;
  }
  const headerRender = () => {
    return (
      <>
        <View style={styles.welcomeContainer}>
          <Text style={styles.textHello}>Hello ,</Text>
          <Text h3>{state.name}</Text>
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
            <TouchableOpacity onPress={e => handleAddReader()}>
              <View
                style={{
                  width: 80,
                  height: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon2 name="plus" size={30} color={darkGray} />
              </View>
            </TouchableOpacity>
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
      <View style={styles.welcomeContainer}>
      <TouchableOpacity onPress={e => handleSignOut()}>
        <Button title="SignOut" />
      </TouchableOpacity>
      </View>
    );
  };
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
    <SafeAreaView style={styles.mainContainer}>
      {/* <View style={styles2.popularContainer}> */}
      <FlatList
        data={popularBooks}
        renderItem={({item}) => (
          <Card containerStyle={styles2.popularGridItem}>
              <Card.Image style={styles2.imagePopularBook} 
              source={{uri:item.url}}
              resizeMode='stretch'
              ></Card.Image>
              <Card.FeaturedSubtitle style={styles2.cardText}>{item.name}</Card.FeaturedSubtitle>
          </Card>
        )}
        //Setting the number of column
        numColumns={3}
        key={item => item}
        keyExtractor={(item, index) => index}
        ListHeaderComponent={headerRender}
        // ListFooterComponent={footerRender}
      />
      <AddReader
        openAddOverlay={openAddOverlay}
        cancelAddReader={cancelAddReader}
        addNewReader={addNewReader}
      />
      {/* </View> */}
    </SafeAreaView>
  );
}

const styles2 = StyleSheet.create({
  popularBookHeading: {
    margin: 10,
  },
  imagePopularBook: {borderTopLeftRadius:5,borderTopRightRadius:5, height:100},
  popularGridItem: {elevation:1,padding:0, borderRadius:7, width:100
  },
  cardText:{color:black, minHeight:20, alignSelf:'center',textAlignVertical:'center'},

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
    paddingBottom:5
  },
  welcomeContainer: {
    margin: 10,
  },
  textHello: {
    fontSize: 15,
    color: darkGray,
    marginBottom:-5
  },
  grayHeading: {
    color: darkGray,
    marginBottom: 5,
  },
});
