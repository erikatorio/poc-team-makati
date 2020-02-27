import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Response }  from '@angular/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';

@Injectable({
    providedIn: "root"
})
export class RegisterService{


    constructor(private http:HttpClient, private router:Router){
        console.log('Registration Service Initialized');
    }

    getUsers(){
        return this.http.get('http://localhost:3000/api/userModel/users')
            .pipe(map(res=>res));
    }

    getUsernameSortA(){
        return this.http.get('http://localhost:3000/api/userModel/usernameSortA')
        .pipe(map(res=>res));
    }

    getUsernameSortD(){
        return this.http.get('http://localhost:3000/api/userModel/usernameSortD')
        .pipe(map(res=>res));
    }

    getFirstnameSortA(){
        return this.http.get('http://localhost:3000/api/userModel/firstnameSortA')
        .pipe(map(res=>res));
    }

    getFirstnameSortD(){
        return this.http.get('http://localhost:3000/api/userModel/firstnameSortD')
        .pipe(map(res=>res));
    }

    getLastnameSortA(){
        return this.http.get('http://localhost:3000/api/userModel/lastnameSortA')
        .pipe(map(res=>res));
    }

    getLastnameSortD(){
        return this.http.get('http://localhost:3000/api/userModel/lastnameSortD')
        .pipe(map(res=>res));
    }

    getDeptSortA(){
        return this.http.get('http://localhost:3000/api/userModel/deptSortA')
        .pipe(map(res=>res));
    }

    getDeptSortD(){
        return this.http.get('http://localhost:3000/api/userModel/deptSortD')
        .pipe(map(res=>res));
    }

    getUsersOnly(){
        return this.http.get('http://localhost:3000/api/userModel/usersOnly')
            .pipe(map(res=>res));
    }

    countAllUsers(){
        return this.http.get('http://localhost:3000/api/userModel/usersAll')
            .pipe(map(res=>res));
    }
    
    getFreq(){
        return this.http.get('http://localhost:3000/api/tallyModel')
            .pipe(map(res=>res));
    }

    updateFreq(details){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'my-auth-token'
            })
        };
        var url = 'http://localhost:3000/api/tallyModel/freq';
        return this.http.put(url, JSON.stringify(details), httpOptions)
            .pipe(map(res=>JSON.stringify(details)));
    }

    getIncidentRecord(){
        return this.http.get('http://localhost:3000/api/incidentRecordModel/incidentRecords')
            .pipe(map(res=>res));
    }

    countAllRecords(){
        return this.http.get('http://localhost:3000/api/incidentRecordModel/incidentRecordsAll')
            .pipe(map(res=>res));
    }

    countAllPendingRecords(){
        return this.http.get('http://localhost:3000/api/incidentRecordModel/incidentRecordsPending')
            .pipe(map(res=>res));
    }

    getAllPendingRecords(){
        return this.http.get('http://localhost:3000/api/incidentRecordModel/PendingRecords')
            .pipe(map(res=>res));
    }

    countAllRecordsToday(){
        return this.http.get('http://localhost:3000/api/incidentRecordModel/incidentRecordsToday')
            .pipe(map(res=>res));
    }

    updatePendingStatus(details){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'my-auth-token'
            })
        };
        var url = 'http://localhost:3000/api/incidentRecordModel/incidentRecord/'+details._id;
        return this.http.put(url, JSON.stringify(details), httpOptions)
            .pipe(map(res=>JSON.stringify(details)));
    }

    updateDisplayed(details){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'my-auth-token'
            })
        };
        var url = 'http://localhost:3000/api/incidentRecordModel/displayed/'+details._id;
        return this.http.put(url, JSON.stringify(details), httpOptions)
            .pipe(map(res=>JSON.stringify(details)));
    }

    getRecord(incident_id){
        return this.http.get('http://localhost:3000/api/incidentRecordModel/incidentRecords/' + incident_id)
            .pipe(map(res=>res));
    }

    getLogs(){
        return this.http.get('http://localhost:3000/api/logModel')
            .pipe(map(res=>res));
    }

    getSentRecords(){
        return this.http.get('http://localhost:3000/api/logModel/sentRecords')
            .pipe(map(res=>res));
    }

    countUnviewed(){
        return this.http.get('http://localhost:3000/api/logModel/unviewed')
            .pipe(map(res=>res));
    }

    updateLogsViewed(details){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'my-auth-token'
            })
        };
        var url = 'http://localhost:3000/api/logModel/log/'+details._id;
        return this.http.put(url, JSON.stringify(details), httpOptions)
            .pipe(map(res=>JSON.stringify(details)));
    }

    updateLogsRemoved(details){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'my-auth-token'
            })
        };
        var url = 'http://localhost:3000/api/logModel/removed/'+details._id;
        return this.http.put(url, JSON.stringify(details), httpOptions)
            .pipe(map(res=>JSON.stringify(details)));
    }

    getIncident(){
        return this.http.get('http://localhost:3000/api/incidentModel')
            .pipe(map(res=>res));
    }

    getDept(){
        return this.http.get('http://localhost:3000/api/deptModel')
            .pipe(map(res=>res));
    }
    
    addUser(newUser){
        var headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        this.router.navigate(['/index']);
        return this.http.post('http://localhost:3000/api/user', JSON.stringify(newUser), {headers: headers})
            .pipe(map(res=>res));
    }

    updateStatus(newUser){
        var headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        this.router.navigate(['/index']);
        return this.http.post('http://localhost:3000/api/user', JSON.stringify(newUser), {headers: headers})
            .pipe(map(res=>res));
    }

    getAdminChats(){
        return this.http.get('http://localhost:3000/api/chatModel/admin')
        .pipe(map(res => res));
    }

    getUnviewedChats(){
        return this.http.get('http://localhost:3000/api/chatModel/unviewedChats')
        .pipe(map(res => res));
    }

    updateChatViewed(details){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'my-auth-token'
            })
        };
        var url = 'http://localhost:3000/api/chatModel/chat/'+details._id;
        return this.http.put(url, JSON.stringify(details), httpOptions)
            .pipe(map(res=>JSON.stringify(details)));
    }

    countUnviewedChat(){
        return this.http.get('http://localhost:3000/api/chatModel/unviewed')
            .pipe(map(res=>res));
    }

    sendNewMessage(message_content){
        
    console.log(message_content);
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'my-auth-token'
            })
        };
        return this.http.post('http://localhost:3000/api/chatModel', JSON.stringify(message_content), httpOptions)
            .pipe(map(res => res));
    }

    getChats(){
        return this.http.get('http://localhost:3000/api/chatModel')
        .pipe(map(res => res));
    }

    getUserChats(user_id){
        return this.http.get('http://localhost:3000/api/chatModel/'+user_id)
        .pipe(map(res => res));
    }

    addFiles(newUser){
        var headers = new HttpHeaders();
        return this.http.post('http://localhost:3000/api/create-user', JSON.stringify(newUser), {headers: headers})
            .pipe(map(res=>res));
    }

    getFiles(){
        return this.http.get('http://localhost:3000/api')
        .pipe(map(res => res));
    }

    recordLog(log){
        var httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': 'my-auth-token'
            })
        };
        return this.http.post('http://localhost:3000/api/logModel', JSON.stringify(log), httpOptions)
            .pipe(map(res => res));
    }

}

