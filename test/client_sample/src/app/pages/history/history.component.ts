import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { Logs } from '../../../../Logs';

@Component({
    selector: 'typography-cmp',
    moduleId: module.id,
    templateUrl: 'history.component.html',
    styleUrls: ['history.component.css']
})

export class HistoryComponent implements OnInit{

    logs: Logs[];
    log: Logs;
    user_id: string;
    user_name: string;
    action_id: number;
    action_name: string;
    action_date: string;

    constructor(private registerService:RegisterService){
        this.registerService.getLogs()
            .subscribe((logs: any[]) => {
            this.logs = logs;
        });
    }

    ngOnInit(){
    
    }
}
