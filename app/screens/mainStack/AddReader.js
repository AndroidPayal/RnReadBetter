import React from 'react';
import {Button, Text, Overlay} from 'react-native-elements';
import {View, StyleSheet} from 'react-native';

export default class AddReader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {openAddOverlay, cancelAddReader} = this.props;
    {
      console.log('add reader class called');
    }
    const styles = StyleSheet.create({
      overlayStyle: {
        width: '90%',
        height: '90%',
      },
      parentContainer: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
      },
    });
    return (
      <Overlay
        isVisible={openAddOverlay}
        overlayStyle={styles.overlayStyle}
        // fullScreen
        onBackdropPress={e => cancelAddReader(e)}>
        <View style={styles.parentContainer}>
          <Text h4>Add New Reader</Text>
        </View>
      </Overlay>
    );
  }
}
