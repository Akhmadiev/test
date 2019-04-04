import { Component } from '@angular/core';
import { ChatService } from './chat.service';
import { ImageUploadService } from './image-upload.service';
import { NotificationsService } from 'angular2-notifications';
import { FormControl } from '@angular/forms';
import { PushNotificationsService } from './push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
    user: string;

    room: string;

    messageArray: Array<{ user: string, private: boolean, message: string }> = [];

    users: Array<any> = [];

    myControl = new FormControl();

    rooms: string[] = [
        'Room1',
        'Room2',
        'Room3'
    ];

    constructor(
        private chatService: ChatService,
        private imageService: ImageUploadService,
        private notifier: NotificationsService,
        private notificationService: PushNotificationsService) {

        this.chatService.newUserJoined()
            .subscribe(x => {
                this.messageArray.push(x);
                this.users = x.users;
            });

        this.chatService.newMessageReceived()
            .subscribe(x => {
                if (this.user !== x.user) {
                    this.notifier.info(x.user + '<br>sent a message');
                    this.notify(x.user, x.message);
                }
                this.messageArray.push(x);
            });
    }

    join(user, room) {
        this.notificationService.requestPermission();

        this.user = user;
        this.room = room;
        this.chatService.joinRoom({user, room});
    }

    leave() {
        this.chatService.leaveRoom({user: this.user, room: this.room});
    }

    sendMessage(message) {
        if (message.startsWith('@')) {
            const messageSplit = message.split(' ');
            const userTo = messageSplit[0].substring(1, messageSplit[0].length);
            const socketId = this.users.filter(x => x.user === userTo)[0].socketId;
            console.log(`user: ${this.user}; userTo: ${userTo}; userToSocket: ${socketId}; message: ${message}`);

            const newMessage = { user: this.user, message, private: true };
            this.messageArray.push(newMessage);
            this.chatService.sendPrivateMessage({user: this.user, socketId, userTo, message});
        } else {
            this.chatService.sendMessage({user: this.user, room: this.room, message});
        }
    }

    notify(user, message) {
        var data: Array <any> = [];

        data.push({
            title: user,
            alertContent: message
        });
        
        this.notificationService.generateNotification(data);
    }

    // processFile(imageInput: any) {
    //     const file: File = imageInput.files[0];
    //     const reader = new FileReader();

    //     reader.addEventListener('load', (event: any) => {

    //       this.selectedFile = new ImageSnippet(event.target.result, file);

    //       this._imageService.uploadImage(this.selectedFile.file).subscribe(
    //         (res) => {

    //         },
    //         (err) => {

    //         })
    //     });

    //     reader.readAsDataURL(file);
    // }

    // uploadImage() {
    //     if (this.selectedFile) {
    //       const reader = new FileReader();

    //       reader.addEventListener('load', (event: any) => {
    //         this.selectedFile.src = event.target.result;

    //         this._imageService.uploadImage(this.selectedFile.file).subscribe(
    //             (res) => {

    //             },
    //             (err) => {

    //             })
    //       });

    //     reader.readAsDataURL(this.selectedFile.file);
    //     }
    // }
}
