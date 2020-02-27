import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { User } from '../../../../User';

@Component({
    selector: 'user-cmp',
    moduleId: module.id,
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.css']
})

export class ProfileComponent implements OnInit{
    users: User[];
    user: User;
    user_name: string;
    user_password: string;
    user_grp: string;
    user_firstname: string;
    user_lastname: string;
    user_type: number;

    constructor(private registerService:RegisterService){
        this.registerService.getUsers()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

    ngOnInit() {

    }
}
