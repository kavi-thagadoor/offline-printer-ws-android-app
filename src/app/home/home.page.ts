import { Component } from '@angular/core';
import { io } from 'socket.io-client';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { Platform } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonCardHeader, IonList, IonItem } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [BluetoothSerial],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonCardHeader, IonList, IonItem, CommonModule],
})
export class HomePage {
  socket: any;
  receivedData: string = '';
  devices: any[] = [];
  errorLogs: string[] = [];

  constructor(private bluetoothSerial: BluetoothSerial, private platform: Platform) {
    this.platform.ready().then(() => {
      this.setupSocket();
      this.listBluetoothDevices();
    });
  }

  setupSocket() {
    this.socket = io('https://disturbed-abbey-pttm-88f96613.koyeb.app');
  
    this.socket.on('connect', () => {
      console.log('Connected to socket:', this.socket.id);
    });
  
    this.socket.on('connect_error', (err: any) => {
      console.error('Socket connection error:', err);
    });
  
    this.socket.on('receive_data', (data: any) => {
      console.log('Received data:', data);
      this.receivedData = data;
      this.sendToPrinter(data);
    });
  }


  listBluetoothDevices() {
    this.bluetoothSerial.list().then(devices => {
      this.devices = devices;
      console.log('Devices:', devices);
    }).catch(err => {
      this.errorLogs.push(`Error listing devices: ${JSON.stringify(err)}`);
    });
  }

  sendToPrinter(data: string) {
    // Replace with real device MAC or select dynamically
    const deviceAddress = this.devices[0]?.id;
    if (deviceAddress) {
      this.bluetoothSerial.connect(deviceAddress).subscribe(() => {
        this.bluetoothSerial.write(data + '\n').then(() => {
          console.log('Printed successfully');
        }).catch(err => this.errorLogs.push('Print error: ' + JSON.stringify(err)));
      }, err => {
        this.errorLogs.push('Connection error: ' + JSON.stringify(err));
      });
    }
  }
}
