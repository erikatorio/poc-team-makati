import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { IncidentRecord } from '../../../../IncidentRecord';  
import { User } from '../../../../User';
import { Freq } from '../../../../Freq';
import { Logs } from '../../../../Logs';
import { takeLast } from 'rxjs/operators';
import { AngularCsv} from 'angular7-csv/dist/Angular-csv';
import { File } from '../../../../File';


@Component({
    selector: 'table-cmp',
    moduleId: module.id,
    templateUrl: 'incidentList.component.html',
    styleUrls: ['incidentList.component.css']
})

export class IncidentListComponent implements OnInit{

    files:File[];
    file:File;
    file0;

    freqs: Freq[];
    assault: number;
    sh: number;
    bullying: number;
    selfHarm: number;
    drugUse: number;
    hateSpeech: number;
    iths: number;
    harassment: number;
    theft: number;
    verbalAbuse: number;

    incidentRecords: IncidentRecord[];
    incidentRecord: IncidentRecord;
    record_no: number;
    incident_type: string;
    incident_who: string;
    incident_when: string;
    incident_comments: string;
    incident_attachment: File;
    incident_complainant_id: string;
    incident_status: string;
    incident_reason: string;
    record_date: string;
    anonymous: boolean;

    users: User[];
    user: User;
    user_name: string;
    user_password: string;
    user_grp: string;
    user_firstname: string;
    user_lastname: string;
    user_type: number;

    logs: Logs[];
    user_id: string;
    action_id: number;
    action_name: string;
    action_date: string;
    action_viewed:boolean;
    action_removed: boolean;
    
    dtHolidays :any[] = [];

    csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    showTitle: true,
    title: 'Incident List :',
    useBom: true,
    noDownload: false,
    headers: ["Incident ID", "Record No", "Incident Type", "Who", "When", "Comments", "Attachments",
                "Complainant ID", "Status", "Reason why Rejected", "Date Sent", "Anonymous"]
  };

    constructor(private registerService:RegisterService){
        this.registerService.getIncidentRecord()
            .subscribe((incidentRecords: any[]) => {
            this.incidentRecords = incidentRecords;

            for(var i = 0; i<this.incidentRecords.length; i++)
            {
                this.dtHolidays[i]=
                    {"_id": this.incidentRecords[i]._id, "record_no": i+1, "incident_type": 
                    this.incidentRecords[i].incident_type, "incident_who": this.incidentRecords[i].incident_who, "incident_when": this.incidentRecords[i].incident_when,
                    "incident_comments": this.incidentRecords[i].incident_comments, "incident_attachment":this.incidentRecords[i].incident_attachment, 
                    "incident_complainant_id": this.incidentRecords[i].incident_complainant_id, "incident_status": this.incidentRecords[i].incident_status,
                    "incident_reason": this.incidentRecords[i].incident_reason, "record_date": this.incidentRecords[i].record_date, "anonymous": this.incidentRecords[i].anonymous }
                
            }
        });

        this.registerService.getUsers()
            .subscribe((users: any[]) => {
            this.users = users;
        });

        this.registerService.getFreq()
            .subscribe((freqs: any[]) => {
            this.freqs = freqs;
        });

        this.registerService.getLogs()
            .subscribe((logs: any[]) => {
            this.logs = logs;
        });

        this.registerService.getFiles()
            .subscribe((files: any[]) => {
            this.files = files;
        });
    }

    ngOnInit(){     
        
    }

    collapsed(){
        var coll = document.getElementsByClassName("collapsible");
        for (var i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
                this.classList.add("active");
            this.nextElementSibling.classList.remove("closed");
            });
        }
    }

    downloadCSV(){
        new  AngularCsv(this.dtHolidays, "Incident List", this.csvOptions);
      }

    updateStatus(record){
        var tbl_incidentRecord = this.incidentRecords;

        var details = { 
            _id: record._id,
            incident_status: "Completed"
        };
        
        var user_name = "";
        var user_grp = "";
        for(var i=0; i<this.users.length; i++){
            if(record.anonymous == true) {
                user_name = "Anonymous";
                user_grp = "Anonymous";
                break;
            } else {
                //report not anonymous
                if(this.users[i]._id == record.incident_complainant_id){
                    user_name = this.users[i].user_name;
                    user_grp = this.users[i].user_grp;
                    break;
                }
            }
        }

        //find user grp to upd
        var increment = {
            user_grp: "",
            assault: 0,
            sh: 0,
            bullying: 0,
            selfHarm: 0,
            drugUse: 0,
            hateSpeech: 0,
            iths: 0,
            harassment:0,
            theft:0,
            verbalAbuse:0
        };
        var grp_arrId = 0;
        for(var i=0; i<this.freqs.length; i++){
            //in this user grp
            if(this.freqs[i].user_grp == user_grp){
                grp_arrId = i;
                switch(record.incident_type){
                    case "Assault":
                        console.log("Assault");
                        increment.user_grp = user_grp;
                        increment.assault = this.freqs[i].assault + 1;
                        increment.sh = this.freqs[i].sh;
                        increment.bullying = this.freqs[i].bullying;
                        increment.selfHarm = this.freqs[i].selfHarm;
                        increment.drugUse = this.freqs[i].drugUse;
                        increment.hateSpeech = this.freqs[i].hateSpeech;
                        increment.iths = this.freqs[i].iths;
                        increment.harassment = this.freqs[i].harassment;
                        increment.theft = this.freqs[i].theft;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse;
                        break;
                    case "Sexual Harassment":
                        console.log("SH");
                        increment.user_grp = user_grp;
                        increment.sh = this.freqs[i].sh + 1;
                        increment.assault = this.freqs[i].assault;
                        increment.bullying = this.freqs[i].bullying;
                        increment.selfHarm = this.freqs[i].selfHarm;
                        increment.drugUse = this.freqs[i].drugUse;
                        increment.hateSpeech = this.freqs[i].hateSpeech;
                        increment.iths = this.freqs[i].iths;
                        increment.harassment = this.freqs[i].harassment;
                        increment.theft = this.freqs[i].theft;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse;
                        break;
                    case "Bullying":
                        console.log("Bullying");
                        increment.user_grp = user_grp;
                        increment.bullying = this.freqs[i].bullying + 1;
                        increment.assault = this.freqs[i].assault;
                        increment.sh = this.freqs[i].sh;
                        increment.selfHarm = this.freqs[i].selfHarm;
                        increment.drugUse = this.freqs[i].drugUse;
                        increment.hateSpeech = this.freqs[i].hateSpeech;
                        increment.iths = this.freqs[i].iths;
                        increment.harassment = this.freqs[i].harassment;
                        increment.theft = this.freqs[i].theft;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse;
                        break;
                    case "Self Harm":
                        console.log("Self Harm");
                        increment.user_grp = user_grp;
                        increment.selfHarm = this.freqs[i].selfHarm + 1;
                        increment.bullying = this.freqs[i].bullying;
                        increment.assault = this.freqs[i].assault;
                        increment.sh = this.freqs[i].sh;
                        increment.drugUse = this.freqs[i].drugUse;
                        increment.hateSpeech = this.freqs[i].hateSpeech;
                        increment.iths = this.freqs[i].iths;
                        increment.harassment = this.freqs[i].harassment;
                        increment.theft = this.freqs[i].theft;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse;
                        break;
                    case "Drug Use":
                        console.log("DU");
                        increment.user_grp = user_grp;
                        increment.drugUse = this.freqs[i].drugUse + 1;
                        increment.bullying = this.freqs[i].bullying;
                        increment.assault = this.freqs[i].assault;
                        increment.sh = this.freqs[i].sh;
                        increment.selfHarm = this.freqs[i].selfHarm;
                        increment.hateSpeech = this.freqs[i].hateSpeech;
                        increment.iths = this.freqs[i].iths;
                        increment.harassment = this.freqs[i].harassment;
                        increment.theft = this.freqs[i].theft;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse;
                        break;
                    case "Hate Speech":
                        console.log("HS");
                        increment.user_grp = user_grp;
                        increment.hateSpeech = this.freqs[i].hateSpeech + 1;
                        increment.bullying = this.freqs[i].bullying;
                        increment.assault = this.freqs[i].assault;
                        increment.sh = this.freqs[i].sh;
                        increment.selfHarm = this.freqs[i].selfHarm;
                        increment.drugUse = this.freqs[i].drugUse;
                        increment.iths = this.freqs[i].iths;
                        increment.harassment = this.freqs[i].harassment;
                        increment.theft = this.freqs[i].theft;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse;
                        break;
                    case "Intent to Harm Someone":
                        console.log("ITHS");
                        increment.user_grp = user_grp;
                        increment.iths = this.freqs[i].iths + 1;
                        increment.bullying = this.freqs[i].bullying;
                        increment.assault = this.freqs[i].assault;
                        increment.sh = this.freqs[i].sh;
                        increment.selfHarm = this.freqs[i].selfHarm;
                        increment.drugUse = this.freqs[i].drugUse;
                        increment.hateSpeech = this.freqs[i].hateSpeech;
                        increment.harassment = this.freqs[i].harassment;
                        increment.theft = this.freqs[i].theft;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse;
                        break;
                    case "Harassment":
                        console.log("Harassment");
                        increment.user_grp = user_grp;
                        increment.harassment = this.freqs[i].harassment + 1;
                        increment.bullying = this.freqs[i].bullying;
                        increment.assault = this.freqs[i].assault;
                        increment.sh = this.freqs[i].sh;
                        increment.selfHarm = this.freqs[i].selfHarm;
                        increment.drugUse = this.freqs[i].drugUse;
                        increment.hateSpeech = this.freqs[i].hateSpeech;
                        increment.iths = this.freqs[i].iths;
                        increment.theft = this.freqs[i].theft;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse;
                        break;
                    case "Theft":
                        console.log("Theft");
                        increment.user_grp = user_grp;
                        increment.theft = this.freqs[i].theft + 1;
                        increment.bullying = this.freqs[i].bullying;
                        increment.assault = this.freqs[i].assault;
                        increment.sh = this.freqs[i].sh;
                        increment.selfHarm = this.freqs[i].selfHarm;
                        increment.drugUse = this.freqs[i].drugUse;
                        increment.hateSpeech = this.freqs[i].hateSpeech;
                        increment.iths = this.freqs[i].iths;
                        increment.harassment = this.freqs[i].harassment;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse;
                        break;
                    case "Verbal Abuse":
                        console.log("VA");
                        increment.user_grp = user_grp;
                        increment.verbalAbuse = this.freqs[i].verbalAbuse + 1;
                        increment.bullying = this.freqs[i].bullying;
                        increment.assault = this.freqs[i].assault;
                        increment.sh = this.freqs[i].sh;
                        increment.selfHarm = this.freqs[i].selfHarm;
                        increment.drugUse = this.freqs[i].drugUse;
                        increment.hateSpeech = this.freqs[i].hateSpeech;
                        increment.iths = this.freqs[i].iths;
                        increment.harassment = this.freqs[i].harassment;
                        increment.theft = this.freqs[i].theft;
                        break;
                }
                break;
            }
        }

        console.log(increment);

        this.registerService.updatePendingStatus(details).subscribe(data => {
            record._id = details._id;
            record.incident_status = "Completed";
        });

        this.registerService.updateFreq(increment).subscribe(data => {
            this.freqs[grp_arrId].assault = increment.assault;
            this.freqs[grp_arrId].bullying = increment.bullying;
            this.freqs[grp_arrId].drugUse = increment.drugUse;
            this.freqs[grp_arrId].harassment = increment.harassment;
            this.freqs[grp_arrId].hateSpeech = increment.hateSpeech;
            this.freqs[grp_arrId].iths = increment.iths;
            this.freqs[grp_arrId].selfHarm = increment.selfHarm;
            this.freqs[grp_arrId].sh = increment.sh;
            this.freqs[grp_arrId].theft = increment.theft;
            console.log("in ts...");
            console.log(this.freqs[grp_arrId]);
        });

        //Log Action
        var options = { hour12: false, year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute: '2-digit' };
        var newLog = {
          user_id: record.incident_complainant_id,
          user_name: user_name,
          action_id: 7,
          action_name: "Report Status Updated: [Completed]",
          action_date: new Date().toLocaleDateString("en-US", options),
          action_viewed: false,
          action_removed: false
        }

        this.registerService.recordLog(newLog)
          .subscribe((log: Logs) => {
            this.logs.push(log);
            this.user_id = newLog.user_id;
            this.user_name = newLog.user_name;
            this.action_id = 7;
            this.action_name = "Report Status Updated: [Completed]";
            this.action_date = new Date().toLocaleDateString("en-US", options);
            this.action_viewed = false;
            this.action_removed = false;
          });
    }


    verifyStatus(record){
        var tbl_incidentRecord = this.incidentRecords;
        var user_name = "";
        for(var i=0; i<this.users.length; i++){
            if(record.anonymous == true) {
                user_name = "Anonymous";
                break;
            } else {
                //report not anonymous
                if(this.users[i]._id == record.incident_complainant_id){
                    user_name = this.users[i].user_name;
                    break;
                }
            }
        }

        var details = { 
            _id: record._id,
            incident_status: "Verified"
        };

        this.registerService.updatePendingStatus(details).subscribe(data => {
            record._id = details._id;
            record.incident_status = "Verified";
        });

        //Log Action
        var options = { hour12: false, year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute: '2-digit' };
        var newLog = {
          user_id: record.incident_complainant_id,
          user_name: user_name,
          action_id: 7,
          action_name: "Report Status Updated: [Verified]",
          action_date: new Date().toLocaleDateString("en-US", options),
          action_viewed: false,
          action_removed: false
        }

        this.registerService.recordLog(newLog)
          .subscribe((log: Logs) => {
            this.logs.push(log);
            this.user_id = newLog.user_id;
            this.user_name = newLog.user_name;
            this.action_id = 7;
            this.action_name = "Report Status Updated: [Verified]";
            this.action_date = new Date().toLocaleDateString("en-US", options);
            this.action_viewed = false;
            this.action_removed = false;
          });
    }

    rejectStatus(record){
        var tbl_incidentRecord = this.incidentRecords;
        var user_name = "";
        for(var i=0; i<this.users.length; i++){
            if(record.anonymous == true) {
                user_name = "Anonymous";
                break;
            } else {
                //report not anonymous
                if(this.users[i]._id == record.incident_complainant_id){
                    user_name = this.users[i].user_name;
                    break;
                }
            }
        }

        var details = { 
            _id: record._id,
            incident_status: "Rejected",
            incident_reason: this.incident_reason
        };

        if(details.incident_reason == undefined || details.incident_reason == ""){
            alert("Please write reason why rejected.");
        } else {
            this.registerService.updatePendingStatus(details).subscribe(data => {
                record._id = details._id;
                record.incident_status = "Rejected";
                record.incident_reason = details.incident_reason;
            });
            //Log Action
            var options = { hour12: false, year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute: '2-digit' };
            var newLog = {
            user_id: record.incident_complainant_id,
            user_name: user_name,
            action_id: 7,
            action_name: "Report Status Updated: [Rejected]",
            action_date: new Date().toLocaleDateString("en-US", options),
            action_viewed: false,
            action_removed: false
            }

            this.registerService.recordLog(newLog)
            .subscribe((log: Logs) => {
                this.logs.push(log);
                this.user_id = newLog.user_id;
                this.user_name = newLog.user_name;
                this.action_id = 7;
                this.action_name = "Report Status Updated: [Rejected]";
                this.action_date = new Date().toLocaleDateString("en-US", options);
                this.action_viewed = false;
                this.action_removed = false;
            });
        }
    }
}
