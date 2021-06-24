import { Platform } from 'react-native';
import PushNotification,{Importance} from 'react-native-push-notification';
import moment from 'moment'
export default class NotificationService {
	
	//onNotificaitn is a function passed in that is to be called when a
	//notification is to be emitted.
  constructor(onNotification) {
    this.configure(onNotification);
    this.lastId = 0;
    this.channelManagement()
    this.headings = ['aaju', 'bac', 'dabbo'],
    this.subText = ['kaaju', 'bhigu', 'motoji']
  }
  channelManagement(){
    // console.log('creating a channel');
    PushNotification.createChannel(
      {
        channelId: "1", // (required)
        channelName: "Daily Reminder", // (required)
        channelDescription: "A channel dedicated for readers reading time.", // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
      },
      (created) => {
      // console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    }
    );
    // console.log('current notifications -------- >');
    // this.getAllScheduledNotification()
    // .then((res) =>{
    //   console.log('got schedules --->', res);
    // })
  }

  configure(onNotification) {
    PushNotification.configure({
      onNotification: onNotification,
      requestPermissions: Platform.OS === 'ios',
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      popInitialNotification: true,
    });
  }

	//Appears right away 
  localNotification() {
    this.lastId++;
    console.log('sending local notitfication');
    PushNotification.localNotification({
      channelId: "1",
      title: "Local Notification", 
      message: "My Notification Message", 
      playSound: false, 
      soundName: 'default', 
      actions: '["Yes", "No"]'
    });
  }

	//Appears after a specified time. App does not have to be open.
  scheduleNotification(userName, eventDate, id) {
    // var todayDate = moment(new Date()).format('YYYY-MM-DD');
    // var date = moment(todayDate).set({"hour": 15, "minute": 52});
    // var eventStartDate = moment(date).toISOString();
    // console.log('eventStartDate2 =', eventStartDate);
    var headings = [
      'Hey '+userName+', your reading log wants to know what happened next in that book you are reading.'
      , userName+', Its time to add to your reading log'
      , userName+', How did today\'s reading session go!'
      , userName+', That book you\'re reading is so cool.']

    var subText = [
      'Just add to your reading log, it takes 5 min'
      , 'Log your reading daily and you can win free stuff!'
      , 'I so want to know... Add to your reading log'
      , 'Take 2 minutes to tell your reading log what you read today.']

     var index = Math.floor(Math.random() * headings.length)
     var title = headings[index]
     var text = subText[index]
    PushNotification.localNotificationSchedule({
      channelId: "1",
      date: new Date(eventDate),
      title: title, 
      bigText: text, // (optional) default: "message" prop
      subText: "Reading time",
      message: userName,// we are using field message as identifier of username
      id: id,//id must be number
      // color: "red",
      largeIcon: "ic_launcher",
    // priority: "high",
      playSound: true, 
      soundName: 'default', 
      repeatType: "day",//"minute",
      smallIcon: "ic_notify",
    });
  }

  getAllScheduledNotification(){
    const allCurrent = new Promise((resolve, reject) => {
      PushNotification.getScheduledLocalNotifications((res)=> {
        resolve(res)
      });
    })
    return allCurrent;
  }

  checkPermission(cbk) {
    return PushNotification.checkPermissions(cbk);
  }

  cancelNotif(notif_id) {
    PushNotification.cancelLocalNotifications({id: notif_id});
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}