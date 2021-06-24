import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, Button} from 'react-native-elements';
import {primary, white} from '../../values/colors';
import {Context as AuthContext} from '../../hoc/AuthContext';
import {TouchableOpacity} from 'react-native';
import {globalStyle} from '../../values/constants';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function DataCrashed() {
  const {value, signout} = useContext(AuthContext);

  function handleLogout() {
    console.log('handle logout');
    signout();
  }
  return (
    <View style={styles.background}>
      <Text style={[globalStyle.font]}>Some error encountered!</Text>
      <Icon name="exclamation-circle" size={25} />

      <TouchableOpacity
        style={{backgroundColor: primary, margin: 50}}
        onPress={e => handleLogout()}>
        <View style={{backgroundColor: primary, margin: 10}}>
          <Text style={[{color: white}, globalStyle.fontBold]}>Log Out</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  background: {
    backgroundColor: white,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
