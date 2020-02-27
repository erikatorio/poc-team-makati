import { Component } from '@angular/core';
import { ToastrService } from "ngx-toastr";
import { User } from '../../../../User';
import { Chat } from '../../../../Chat';
import { Logs } from '../../../../Logs';
import { RegisterService } from '../../services/register.service';
import * as $ from 'jquery';

@Component({
    selector: 'notifications-cmp',
    moduleId: module.id,
    templateUrl: 'notifications.component.html',
    styleUrls: ['notifications.component.css'],
    providers:[RegisterService]
})

export class NotificationsComponent{

  users: User[];
  user: User;
  user_name: string;
  user_password: string;
  user_grp: string;
  user_firstname: string;
  user_lastname: string;
  user_type: number;

  allUsers: User[];
  user_id: string;

  chats: Chat[];
  allChats: Chat[];
  adminChats: Chat[];

  logs: Logs[];
  action_id: number;
  action_name: string;
  action_date: string;
  action_viewed:boolean;
  action_removed: boolean;

  sender: string;
  receiver: string;
  messages: string;
  dateTime: string;
  viewed: boolean;

  constructor(private registerService:RegisterService){
    this.registerService.getUsersOnly()
      .subscribe((users: any[]) => {
        this.users = users;
      });

      this.registerService.getUsers()
          .subscribe((users: any[]) => {
          this.allUsers = users;
      });

      this.registerService.getChats()
          .subscribe((allChats: any[]) => {
          this.allChats= allChats;
      });

      this.registerService.getAdminChats()
          .subscribe((adminChats: any[]) => {
          this.adminChats= adminChats;
      });

      this.registerService.getLogs()
      .subscribe((logs: any[]) => {
      this.logs = logs;
  });
  }

  scrollHere(){
    window.scrollTo(0, document.querySelector("#chatbox").scrollHeight);
  }

  refreshChat(){
    $('#chatbox').load(document.URL);
  }

  sendMessage(){
    var tbl_user = this.allUsers;
    var receiver_name = "";
    for(var i=0; i<this.allUsers.length; i++){
      if(this.receiver == this.allUsers[i]._id){
        receiver_name = this.allUsers[i].user_name;
        break;
      }
    }

    var options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    var message_details = {
        user_id: this.receiver,
        sender: "Admin",
        receiver: receiver_name,
        messages: this.messages,
        dateTime: new Date().toLocaleDateString("en-US", options),
        viewed: false,
    }

    var allChats = this.allChats;
        //ADD NEW
        this.registerService.sendNewMessage(message_details)
        .subscribe((chat: Chat) => {
            this.allChats.push(chat);
            this.user_id = message_details.user_id;
            this.sender = "Admin";
            this.receiver = message_details.receiver;
            this.dateTime = message_details.dateTime;
            this.messages = message_details.messages;
            this.viewed = message_details.viewed;
            console.log(message_details);
        });

        //Log Action
        var options2 = { hour12: false, year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute: '2-digit' };
        var newLog = {
          user_id: message_details.user_id,
          user_name: "Admin",
          action_id: 8,
          action_name: "New Message",
          action_date: new Date().toLocaleDateString("en-US", options2),
          action_viewed: false,
          action_removed: false
        }

        this.registerService.recordLog(newLog)
          .subscribe((log: Logs) => {
            this.logs.push(log);
            this.user_id = newLog.user_id;
            this.user_name = newLog.user_name;
            this.action_id = 8;
            this.action_name = "New Message";
            this.action_date = new Date().toLocaleDateString("en-US", options2);
            this.action_viewed = false;
            this.action_removed = false;
          });
        
          $('#chatbox').load(document.URL);
  }
}
