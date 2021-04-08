import React from 'react';
import {Button, Text, Overlay, Input} from 'react-native-elements';
import {View, StyleSheet} from 'react-native';
import Stepper from 'react-native-stepper-ui';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Ionicons';
import {RadioButton} from 'react-native-paper';
import Datetimepicker from '@react-native-community/datetimepicker';

import {darkGray, lightGray, primary, red, white} from '../../values/colors';

export default class AddReader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: 0,
      firstName: '',
      lastName: '',
      gender: 'male',
      dob: new Date(),
      showDatePicker: false, //PICKER FOR DOB
      monthNames: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      reminderTime: new Date(),
      showTimePicker: false, //PICKER FOR REMINDER TIME
    };
  }
  setActivePage = value => {
    console.log('setting current stepper page = ', value);
    this.setState({
      activePage: value,
    });
  };
  handleAddNewReader = e => {
    this.props.cancelAddReader(e);
    const {firstName, lastName} = this.state;
    this.props.addNewReader({
      name: firstName,
    });
  };
  updateStateValue = (fieldName, value) => {
    console.log('updating ', fieldName, ' val=', value);
    this.setState({
      [fieldName]: value,
    });
  };
  onDOBChange = (event, date) => {
    console.log('changed date', date ? date : this.state.dob);
    this.setState({
      dob: date ? date : this.state.dob,
      showDatePicker: false,
    });
  };
  onReminderTimeChange = (event, time) => {
    console.log('updated time =', time ? time : this.state.reminderTime);
    this.setState({
      reminderTime: time ? time : reminderTime,
      showTimePicker: false,
    });
  };
  render() {
    const {openAddOverlay, cancelAddReader, addNewReader} = this.props;
    const {activePage} = this.state;
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
      stepperContainer: {
        width: '100%',
        height: '94%',
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
      },
    });

    const content = [
      <StepperPage1
        updateStateValue={this.updateStateValue}
        states={this.state}
        onChange={this.onDOBChange}
      />,
      <StepperPage2
        updateStateValue={this.updateStateValue}
        states={this.state}
        onChange={this.onReminderTimeChange}
      />,
      <MyComponent title="Component 3" />,
    ];

    return (
      <Overlay
        isVisible={true} //{openAddOverlay}//
        overlayStyle={styles.overlayStyle}
        // fullScreen
        onBackdropPress={e => cancelAddReader(e)}>
        <View style={styles.parentContainer}>
          <View style={styles.headingContainer}>
            <Text h4 style={styles.heading}>
              Add New Reader
            </Text>
            <Icon
              name="close"
              size={20}
              onPress={e => cancelAddReader(e)}></Icon>
          </View>
          <View style={styles.stepperContainer}>
            <Stepper
              active={activePage}
              content={content}
              onNext={() => this.setActivePage(activePage + 1)}
              onBack={() => this.setActivePage(activePage - 1)}
              onFinish={e => this.handleAddNewReader(e)}
              buttonStyle={{
                marginLeft: 'auto',
                width: 100,
                alignItems: 'center',
              }}
              wrapperStyle={{width: '100%', height: '95%'}} //STYLE FROM CENTER CONTENT OF PAGE
              stepTextStyle={{color: white}}
            />
          </View>
        </View>
      </Overlay>
    );
  }
}

const StepperPage1 = props => {
  return (
    <View style={{marginTop: 40}}>
      <Input
        label={
          <View style={{flexDirection: 'row'}}>
            <Text>First Name</Text>
            <Text style={{color: red}}>{' *'}</Text>
          </View>
        }
        leftIcon={<Icon2 size={17} name="person" />}
        onChangeText={value => props.updateStateValue('firstName', value)}
        value={props.states.firstName}
      />

      <Input
        label={
          <View style={{flexDirection: 'row'}}>
            <Text>Last Name</Text>
            <Text style={{color: red}}>{' *'}</Text>
          </View>
        }
        leftIcon={<Icon2 size={17} name="person" />}
        onChangeText={value => props.updateStateValue('lastName', value)}
        value={props.states.lastName}
      />

      <View style={stylesSteppers.headingContainer}>
        <Text>Gender</Text>
        <Text style={{color: red}}>{' *'}</Text>
      </View>
      <RadioButton.Group
        onValueChange={newValue => props.updateStateValue('gender', newValue)}
        value={props.states.gender}>
        <View style={stylesSteppers.radioGrupParent}>
          <View style={stylesSteppers.radioButtonParent}>
            <RadioButton color={primary} value="male" />
            <Text>Male</Text>
          </View>
          <View style={stylesSteppers.radioButtonParent}>
            <RadioButton color={primary} value="female" />
            <Text>Female</Text>
          </View>
        </View>
      </RadioButton.Group>

      <View style={stylesSteppers.headingContainer}>
        <Text>DOB</Text>
        <Text style={{color: red}}>{' *'}</Text>
      </View>
      {!props.states.showDatePicker ? (
        <View style={stylesSteppers.dateTimeContainer}>
          <Icon2
            style={stylesSteppers.dateTimeIcon}
            name="ios-calendar-outline"
            size={30}/>
          <Text
            style={stylesSteppers.dateTimeText}
            onPress={e => props.updateStateValue('showDatePicker', true)}>
            {props.states.dob.getDate() +
              ' ' +
              props.states.monthNames[props.states.dob.getMonth()] +
              ' ' +
              props.states.dob.getFullYear()}
          </Text>
        </View>
      ) : (
        <Datetimepicker
          value={props.states.dob}
          display="default"
          mode="date"
          onChange={props.onChange}
          // dateFormat="day month year"//FORMAT ADJUST FROM MOMENT.JS
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};
const StepperPage2 = props => {
  return (
    <View style={stylesSteppers.parentContainer}>
      <View style={stylesSteppers.headingContainer}>
        <Text>Reminder Time</Text>
        <Text style={{color: red}}>{' *'}</Text>
      </View>
      {!props.states.showTimePicker ? (
        <View>
          <View style={stylesSteppers.dateTimeContainer}>
            <Icon
              style={stylesSteppers.dateTimeIcon}
              name="clockcircleo"
              size={30}></Icon>
            <Text
              style={stylesSteppers.dateTimeText}
              onPress={e => props.updateStateValue('showTimePicker', true)}>
              {props.states.reminderTime.getHours() +
                ' : ' +
                props.states.reminderTime.getMinutes()}
            </Text>
          </View>
        </View>
      ) : (
        <Datetimepicker
          value={props.states.reminderTime}
          display="default"
          mode="time"
          onChange={props.onChange}
          is24Hour={true}
          // dateFormat="day month year"//FORMAT ADJUST FROM MOMENT.JS
        />
      )}
    </View>
  );
};
const MyComponent = props => {
  return (
    <View>
      <Text>{props.title}</Text>
    </View>
  );
};
const stylesSteppers = StyleSheet.create({
  radioButtonParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  radioGrupParent: {flexDirection: 'row', flex: 1},
  dateTimeContainer: {
    width: '100%',
    height: 60,
    borderRadius: 5,
    borderColor: darkGray,
    borderWidth: 2,
    padding: 5,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeIcon: {margin: 5},
  dateTimeText: {flex: 1, textAlign: 'center'},
  parentContainer: {marginTop: 40},
  headingContainer: {flexDirection: 'row', marginStart: 10, marginTop: 10},
});
