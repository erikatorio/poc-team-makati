import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../../services/register.service';
import { User } from '../../../../User';

@Component({
  moduleId: module.id,
  selector: 'users',
  templateUrl: 'users.component.html',
  styleUrls: ['users.component.css']
})

export class UsersComponent { 
  users: User[];
  user_name: string;
  user_password: string;
  user_grp: string;
  user_firstname: string;
  user_lastname: string;
  user_type: number;

  constructor(private registerService:RegisterService, private router:Router){
    this.registerService.getUsers()
      .subscribe((users: any[]) => {
        this.users = users;
      });
  }

  tryLogin(event: { preventDefault: () => void; }){
    var creds = {
      user_name: this.user_name,
      user_password: this.user_password
    }
    var users = this.users;
    var user_id = '';
    
    for(var i = 0; i<users.length; i++){
      if(users[i].user_name == creds.user_name){
        console.log('Found username match');
        if(users[i].user_password == creds.user_password){
          if(users[i].user_type == 2){
            user_id = users[i]._id;
            console.log('Admin LOGGED IN!');
            sessionStorage.setItem("admin_id", "1");
            this.router.navigate(['/admin/dashboard']);
            break;
          }else{
            sessionStorage.setItem('user_id', users[i]._id);
            user_id = users[i]._id;
            console.log('user LOGGED IN!');
            this.router.navigate(['/login']);
            break;
          }
        } else {
          console.log('Invalid Credentials [Password Mismatch]');
          break;
        }
      } else {
        console.log('Invalid Credentials [Username Not Found]');
      }
    }
  }
 }