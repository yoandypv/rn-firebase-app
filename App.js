import React, {Component} from 'react';
import {
  View,
  Text,
  AsyncStorage,
  StyleSheet,
  Button,
  Clipboard
} from 'react-native';


import firebase, {RemoteMessage} from 'react-native-firebase';

export default class App extends Component {

  state = {
    token: "No hay token",
    appStatus: "-",
    message:"-",
  }

  constructor() {
    super()
  }

  setContent() {
    console.log(this.state.token)
    Clipboard.setString(this.state.token);
  }

  componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners(); //add this line
    //this.readIncomingNotifications()
  }
  
    //1
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    console.log ("Hay permisos ?: " + enabled)
    if (enabled) {
      this.getToken();
    } else {
        this.requestPermission();
    }
  }
  
    //3
  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log(fcmToken )
    this.setState({token: fcmToken});
    if (!fcmToken) {
        fcmToken = await firebase.messaging().getToken();
        if (fcmToken) {
          this.setState({token: fcmToken});
            // user has a device token
            console.log("The token is" + fcmToken)
            await AsyncStorage.setItem('fcmToken', fcmToken);
        }
    }
  }
  
    //2
  async requestPermission() {
    try {
        await firebase.messaging().requestPermission();
        // User has authorised
        this.getToken();
    } catch (error) {
        // User has rejected permissions
        console.log('permission rejected');
    }
  }

  //Remove listeners allocated in createNotificationListeners()
componentWillUnmount() {
  this.notificationListener();
  this.notificationOpenedListener();
 // this.messageListener()
}

readIncomingNotifications() {
  this.messageListener = firebase.messaging().onMessage((message) => {
    console.log(JSON.stringify(message));
});
}

async createNotificationListeners() {
  /*
  * Triggered when a particular notification has been received in foreground
  * */
  this.notificationListener = firebase.notifications().onNotification((notification) => {
      //const { title, body } = notification;
      //console.log("Capturada con la app abierta: titulo : " + title + ", cuerpo: " + body )
      //this.showAlert(title, body);
      this.setState({appStatus: "ABIERTA"});
      this.setState({message:JSON.stringify(notification.data)});
  });

  /*
  * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
  * */
  this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
     // const { title, body } = notificationOpen.notification;
     console.log("APP en BackGround >> " + JSON.stringify(notificationOpen.notification.data))
     this.setState({appStatus: "BACKGROUND"});
     this.setState({message:JSON.stringify(notificationOpen.notification.data)});
      //console.log("Capturada con la app en background: titulo : " + title + ", cuerpo: " + body )
  });

  /*
  * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
  * */
  const notificationOpen = await firebase.notifications().getInitialNotification();
  if (notificationOpen) {
      //const { title, body } = notificationOpen.notification;
      console.log((notificationOpen.notification))
      this.setState({appStatus: "CERRADA [+Click en notificacion]"});
      this.setState({message:JSON.stringify(notificationOpen.notification.data)});
      //console.log("Con app cerrada:  titulo : " + title + ", cuerpo: " + body )
     // this.showAlert(title, body);
  }
 
}

  
 render() {
      return (
        <View style={styles.container}>
        <Text>El token se mostrara debajo:</Text>
        <Text>{this.state.token}</Text>
        <Button
          title="Copiar a clipboard"
          color="#f194ff"
          onPress={() => this.setContent()}
        />
        <Text>______________</Text>
        <Text>Estado app: {this.state.appStatus}</Text>
        <Text>Mensaje real: {this.state.message}</Text>
        </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 16,
      marginHorizontal: 16,
    },
    title: {
      textAlign: 'center',
      marginVertical: 8,
    },
    fixToText: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    separator: {
      marginVertical: 8,
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
  });
  