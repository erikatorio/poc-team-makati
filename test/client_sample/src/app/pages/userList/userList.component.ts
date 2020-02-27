import { Component,OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { User } from '../../../../User';

@Component({
    moduleId: module.id,
    selector: 'maps-cmp',
    templateUrl: 'userList.component.html',
    styleUrls: ['userList.component.css']
})

export class UserListComponent implements OnInit {
    users: User[];
    user: User;
    user_name: string;
    user_password: string;
    user_grp: string;
    user_firstname: string;
    user_lastname: string;
    user_type: number;

    searchText;

    constructor(private registerService:RegisterService){
        this.registerService.getUsersOnly()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

    ngOnInit() {

    }

    usernameSortA(){
        this.registerService.getUsernameSortA()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

    usernameSortD(){
        this.registerService.getUsernameSortD()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

    firstnameSortA(){
        this.registerService.getFirstnameSortA()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

    firstnameSortD(){
        this.registerService.getFirstnameSortD()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

    lastnameSortA(){
        this.registerService.getLastnameSortA()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

    lastnameSortD(){
        this.registerService.getLastnameSortD()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

    deptSortA(){
        this.registerService.getDeptSortA()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

    deptSortD(){
        this.registerService.getDeptSortD()
        .subscribe((users: any[]) => {
            this.users = users;
        });
    }

}
