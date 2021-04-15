import React from 'react';
import { Button, Text, Overlay, Input } from 'react-native-elements';
import { View, StyleSheet } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import Stepper from 'react-native-stepper-ui';
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { RadioButton } from 'react-native-paper';
import Datetimepicker from '@react-native-community/datetimepicker';
import moment from "moment";

import { darkGray, lightGray, primary, red, white } from '../../values/colors';
import { ToastAndroid } from 'react-native';
import { globalStyle } from '../../values/constants';

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
      monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      reminderTime: new Date(),
      showTimePicker: false, //PICKER FOR REMINDER TIME
      grade: 0,
      gradeArray: ['Kindergarten', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
      school: 1,
      draLevel: 0,
      draArray: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
      graLevel: 0,
      graArray: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      lexelLevel: 0,
      lexelArray: [25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700, 725, 750, 775, 800, 825, 850, 875, 900, 925, 950, 975, 1000, 1025, 1050, 1075, 1100, 1125, 1150, 1175, 1200, 1225, 1250, 1275, 1300],
      errorField:''
    };
  }
  /*
      gradeArray: ['Kindergarten', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
      school: 'dummy',
      draLevel: 1,
      draArray: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
      graLevel: 1,
      graArray: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
      lexelLevel: 25,
      lexelArray: [25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700, 725, 750, 775, 800, 825, 850, 875, 900, 925, 950, 975, 1000, 1025, 1050, 1075, 1100, 1125, 1150, 1175, 1200, 1225, 1250, 1275, 1300],
*/
  setActivePage = value => {
    console.log('setting current stepper page = ', value);
    this.setState({
      activePage: value,
    });
  };
  handleAddNewReader = e => {
    const { firstName, lastName, gender, dob, reminderTime, grade, school, draLevel, graLevel, lexelLevel } = this.state;
    const formated_dob = moment(dob).format('YYYY-MM-DD')
    const formated_time = moment(reminderTime).format('HH-mm-ss')
    const obj = {
      firstname_reader: firstName,
      lastname_reader: lastName,
      gender: gender === 'male' ? 0 : 1,
      dob_picker: formated_dob,
      grade: grade,
      time_picker: formated_time,
      mynewschool: school,
      dra: draLevel,
      gra: graLevel,
      lexel: lexelLevel
    }
    console.log(obj);
    if(firstName === ''){
      this.setState({
        errorField: 'firstName',
        activePage:0
      })
    }else if(lastName === ''){
      this.setState({
        errorField: 'lastName',
        activePage:0
      })
    }else{
      this.props.addNewReader(obj)
      .then((response) => {
        console.log('add reader promise res = ', response);
        ToastAndroid.show('Reader Created', ToastAndroid.SHORT)
        this.deleteStateValues()
      })
      .catch((error) => {
        console.log('add reader error',error);
        ToastAndroid.show(error, ToastAndroid.SHORT)
      })
      this.props.cancelAddReader(e);
    }

  };
  deleteStateValues = () => {
    this.setState({
      activePage: 0,
      firstName: '',
      lastName: '',
      gender: 'male',
      dob: new Date(),
      showDatePicker: false, //PICKER FOR DOB
      reminderTime: new Date(),
      showTimePicker: false, //PICKER FOR REMINDER TIME
      grade: 0,
      school: 'dummy',
      draLevel: 1,
      graLevel: 1,
      lexelLevel: 25,
    })
  }
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
      reminderTime: time ? time : this.state.reminderTime,
      showTimePicker: false,
    });
  };
  render() {
    const { openAddOverlay, cancelAddReader, addNewReader } = this.props;
    const { activePage } = this.state;
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
      <StepperPage3
        updateStateValue={this.updateStateValue}
        states={this.state}
        setPickerItem={this.setPickerItem}
      />,
    ];

    return (
      <Overlay
        isVisible={openAddOverlay}//{true} //
        overlayStyle={styles.overlayStyle}
        // fullScreen
        onBackdropPress={e => cancelAddReader(e)}>
        <View style={styles.parentContainer}>
          <View style={styles.headingContainer}>
            <Text style={[styles.heading, globalStyle.h3Style]}>
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
              buttonStyle={[{
                marginLeft: 'auto',
                width: 100,
                alignItems: 'center',
              }]}
              wrapperStyle={{ width: '100%', height: '95%' }} //STYLE FROM CENTER CONTENT OF PAGE
              stepTextStyle={[{ color: white }]}
            />
          </View>
        </View>
      </Overlay>
    );
  }
}

const StepperPage1 = props => {
  return (
    <View style={{ marginTop: 40 }}>
      <Input
        label={
          <View style={{ flexDirection: 'row' }}>
            <Text style={globalStyle.font}>First Name</Text>
            <Text style={{ color: red }}>{' *'}</Text>
          </View>
        }
        leftIcon={<Icon2 size={17} name="person" />}
        onChangeText={value => props.updateStateValue('firstName', value)}
        value={props.states.firstName}
        errorMessage={props.states.errorField==='firstName' ? 'First Name Required !' : ''}
      />

      <Input
        label={
          <View style={{ flexDirection: 'row' }}>
            <Text style={globalStyle.font}>Last Name</Text>
            <Text style={{ color: red }}>{' *'}</Text>
          </View>
        }
        leftIcon={<Icon2 size={17} name="person" />}
        onChangeText={value => props.updateStateValue('lastName', value)}
        value={props.states.lastName}
        errorMessage={props.states.errorField==='lastName' ? 'Last Name Required !' : ''}
      />

      <View style={stylesSteppers.headingContainer}>
        <Text style={globalStyle.font}>Gender</Text>
        <Text style={{ color: red }}>{' *'}</Text>
      </View>
      <RadioButton.Group
        onValueChange={newValue => props.updateStateValue('gender', newValue)}
        value={props.states.gender}>
        <View style={stylesSteppers.radioGrupParent}>
          <View style={stylesSteppers.radioButtonParent}>
            <RadioButton color={primary} value="male" />
            <Text style={globalStyle.font}>Male</Text>
          </View>
          <View style={stylesSteppers.radioButtonParent}>
            <RadioButton color={primary} value="female" />
            <Text style={globalStyle.font}>Female</Text>
          </View>
        </View>
      </RadioButton.Group>

      <View style={stylesSteppers.headingContainer}>
        <Text style={globalStyle.font}>DOB</Text>
        <Text style={{ color: red }}>{' *'}</Text>
      </View>
      {!props.states.showDatePicker ? (
        <View style={stylesSteppers.dateTimeContainer}>
          <Icon2
            style={stylesSteppers.dateTimeIcon}
            name="ios-calendar-outline"
            size={30}
          />
          <Text
            style={[stylesSteppers.dateTimeText, globalStyle.font]}
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
  let gradeItems = props.states.gradeArray.map((s, i) => {
    return <Picker.Item key={i} value={i} label={s} />;
  });
  return (
    <View style={stylesSteppers.parentContainer}>
      <View style={stylesSteppers.headingContainer}>
        <Text style={globalStyle.font}>Grade</Text>
        <Text style={{ color: red }}>{' *'}</Text>
      </View>
      <View style={stylesSteppers.dateTimeContainer}>
        <Picker
          selectedValue={props.states.grade}
          style={[{ height: '100%', width: '100%' }]}
          mode="dropdown"
          onValueChange={(itemValue, itemIndex) =>
            props.updateStateValue('grade', itemValue)
          }>
          {gradeItems}
        </Picker>
      </View>

      <View style={stylesSteppers.headingContainer}>
        <Text style={globalStyle.font}>Reminder Time</Text>
        <Text style={{ color: red }}>{' *'}</Text>
      </View>
      {!props.states.showTimePicker ? (
        <View>
          <View style={stylesSteppers.dateTimeContainer}>
            <Icon
              style={stylesSteppers.dateTimeIcon}
              name="clockcircleo"
              size={30}></Icon>
            <Text
              style={[stylesSteppers.dateTimeText, globalStyle.font]}
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
          is24Hour={false} //SETTING THIS TRUE REMOVED AM/PM OPTION FROM PICKER

        // dateFormat="day month year"//FORMAT ADJUST FROM MOMENT.JS
        />
      )}
    </View>
  );
};
const StepperPage3 = props => {
  // let draArray = new Array[5]
  let draLevelItems = props.states.draArray.map((s, i) => {
    return <Picker.Item key={i} value={i + 1} label={s} />; //EITHER PROVIDE STRING ARRAY OR SET LABEL AS TOSTRING()
  });
  let graLevelItems = props.states.graArray.map((s, i) => {
    return <Picker.Item key={i} value={i + 1} label={s} />; //EITHER PROVIDE STRING ARRAY OR SET LABEL AS TOSTRING()
  });
  let lexelLevelItems = props.states.lexelArray.map((s, i) => {
    return <Picker.Item key={i} value={s} label={s.toString()} />; //EITHER PROVIDE STRING ARRAY OR SET LABEL AS TOSTRING()
  });

  return (
    <View style={stylesSteppers.parentContainer}>
      <View style={stylesSteppers.headingContainer}>
        <Text style={globalStyle.font}>DRA Level (Optional)</Text>
        {/* <Text style={{color: red}}>{' *'}</Text> */}
      </View>
      <View style={stylesSteppers.dateTimeContainer}>
        <Picker
          selectedValue={props.states.draLevel}
          style={{ height: '100%', width: '100%' }}
          mode="dropdown"
          onValueChange={(itemValue, itemIndex) =>
            props.updateStateValue('draLevel', itemValue)
          }>
          {draLevelItems}
        </Picker>
      </View>

      <View style={stylesSteppers.headingContainer}>
        <Text style={globalStyle.font}>GRA Level (Optional)</Text>
        {/* <Text style={{color: red}}>{' *'}</Text> */}
      </View>
      <View style={stylesSteppers.dateTimeContainer}>
        <Picker
          selectedValue={props.states.graLevel}
          style={{ height: '100%', width: '100%' }}
          mode="dropdown"
          onValueChange={(itemValue, itemIndex) =>
            props.updateStateValue('graLevel', itemValue)
          }>
          {graLevelItems}
        </Picker>
      </View>

      <View style={stylesSteppers.headingContainer}>
        <Text style={globalStyle.font}>Lexel Level (Optional)</Text>
        {/* <Text style={{color: red}}>{' *'}</Text> */}
      </View>
      <View style={stylesSteppers.dateTimeContainer}>
        <Picker
          selectedValue={props.states.lexelLevel}
          style={{ height: '100%', width: '100%' }}
          mode="dropdown"
          onValueChange={(itemValue, itemIndex) =>
            props.updateStateValue('lexelLevel', itemValue)
          }>
          {lexelLevelItems}
        </Picker>
      </View>
    </View>
  );
};
const stylesSteppers = StyleSheet.create({
  radioButtonParent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  radioGrupParent: { flexDirection: 'row', flex: 1 },
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
  dateTimeIcon: { margin: 5 },
  dateTimeText: { flex: 1, textAlign: 'center', fontSize:17 },
  parentContainer: { marginTop: 40 },
  headingContainer: { flexDirection: 'row', marginStart: 10, marginTop: 15 },
});
