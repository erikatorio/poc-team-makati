import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { Freq } from '../../../../Freq';
import { Incident } from '../../../../Incident';
import { IncidentRecord } from '../../../../IncidentRecord';
import { User } from '../../../../User'; 
import { Dept } from '../../../../Dept';
import * as Highcharts from 'highcharts/highcharts';
import Highcharts3d from "highcharts/highcharts-3d";
import HighchartsExporting from "highcharts/modules/exporting";
import * as $ from 'jquery';
import { ChatAdapter } from 'ng-chat';
import { HttpClient } from '@angular/common/http';


declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');
let threeD = require('highcharts/highcharts-3d');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);
Highcharts3d(Highcharts);
HighchartsExporting(Highcharts);

@Component({
    selector: 'dashboard-cmp',
    moduleId: module.id,
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css'],
    providers: [RegisterService]
})

export class DashboardComponent implements OnInit{
    depts: Dept[];

    incidentRecords: IncidentRecord[];
    incidentRecordsPending: IncidentRecord[];
    incidentRecordsToday: IncidentRecord[];
    users: User[];

    incidents: Incident[] = [];
    incident_type: string;

    freqs: Freq[] = [];
    freq: Freq;
    user_grp: string;
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

    maxCount: number;

    chart;
    updateFromInput = false;
    Highcharts = Highcharts;
    chartConstructor = "chart";
    chartCallback;
    chartOptions;

    constructor(private registerService:RegisterService, private http: HttpClient){

      this.registerService.getDept()
      .subscribe((depts: any[]) => {
      this.depts = depts;

       });

      this.registerService.getFreq()
          .subscribe((freqs:any[]) => {
          this.freqs = freqs;

        var sumAssault= 0;
        var sumSh = 0;
        var sumBully = 0;
        var sumSelfharm = 0;
        var sumDruguse = 0;
        var sumHatespeech = 0;
        var sumIths = 0;
        var sumHarassment = 0;
        var sumTheft = 0;
        var sumVerbalAbuse = 0;
        for(var i=0; i<freqs.length; i++){
          sumAssault = sumAssault + freqs[i].assault;
        }

        for(var i=0; i<freqs.length; i++){
          sumSh = sumSh + freqs[i].sh;
        }

        for(var i=0; i<freqs.length; i++){
          sumBully = sumBully + freqs[i].bullying;
        }

        for(var i=0; i<freqs.length; i++){
          sumSelfharm = sumSelfharm + freqs[i].selfHarm;
        }

        for(var i=0; i<freqs.length; i++){
          sumDruguse = sumDruguse + freqs[i].drugUse;
        }

        for(var i=0; i<freqs.length; i++){
          sumHatespeech = sumHatespeech + freqs[i].hateSpeech;
        }

        for(var i=0; i<freqs.length; i++){
          sumIths = sumIths + freqs[i].iths;
        }

        for(var i=0; i<freqs.length; i++){
          sumHarassment = sumHarassment + freqs[i].harassment;
        }

        for(var i=0; i<freqs.length; i++){
          sumTheft = sumTheft + freqs[i].theft;
        }

        for(var i=0; i<freqs.length; i++){
          sumVerbalAbuse = sumVerbalAbuse + freqs[i].verbalAbuse;
        }

        var sums = new Array(10);
        sums = [[sumAssault, "Assault"], [sumSh, "Sexual Harassment"], [sumBully, "Bullying"], 
                    [sumSelfharm, "Self Harm"], [sumDruguse, "Drug Use"], [sumHatespeech, "Hate Speech"], 
                    [sumIths, "Intent to Hurt Someone"], [sumHarassment, "Harassment"],
                    [sumTheft, "Theft"], [sumVerbalAbuse, "Verbal Abuse"]];

        var max = new Array(2);
        max = [0, "", 0, "", 0, ""];

        var temp_num = 0;
        var temp_val = "";
        for(var j = 0; j < sums.length; j++){
          if(sums[j][0] > max[4]){
            max[4] = sums[j][0];
            max[5] = sums[j][1];
            if(max[4] > max[2]){
              temp_num = max[2];
              temp_val = max[3];
              max[2] = max[4];
              max[3] = max[5];
              max[4] = temp_num;
              max[5] = temp_val;
              if(max[2] > max[0]){
                temp_num = max[0];
                temp_val = max[1];
                max[0] = max[2];
                max[1] = max[3];
                max[2] = temp_num;
                max[3] = temp_val;
              }
            }
          }
        }
        
        this.maxCount = max[0];
        document.getElementById("firstMax").innerHTML = max[0];
        document.getElementById("first").innerHTML = max[1];
        document.getElementById("secondMax").innerHTML = max[2];
        document.getElementById("second").innerHTML = max[3];
        document.getElementById("thirdMax").innerHTML = max[4];
        document.getElementById("third").innerHTML = max[5];

      });

      this.registerService.countAllRecords()
          .subscribe((incidentRecords: any[]) => {
          this.incidentRecords = incidentRecords;
      });

      this.registerService.countAllUsers()
          .subscribe((users: any[]) => {
          this.users = users;
      });

      this.registerService.countAllPendingRecords()
          .subscribe((incidentRecordsPending: any[]) => {
          this.incidentRecordsPending = incidentRecordsPending;
      });

      this.registerService.countAllRecordsToday()
          .subscribe((incidentRecordsToday: any[]) => {
          this.incidentRecordsToday = incidentRecordsToday;
      });

      this.registerService.getIncident()
        .subscribe((incidents:any[]) => {
        this.incidents = incidents;

        this.chartOptions = {
          chart: {
            renderTo: 'container',
            type: 'column',
            animation: false,
            height: 600,
            options3d: {
              enabled: true,
              alpha: 20,
              beta: 30,
              depth: 900,
              viewDistance: 5,
              frame: {
                bottom: {
                  size: 1,
                  color: 'rgba(0,0,0,0.05)'
                }
              }
            }
          },
          title: {
            text: ''
          },
          credits: {
            enabled: false
          },
          yAxis: {
            title: {
              text: 'Number'
            },
            min: 0,
            max: 10
          },
          xAxis: {
            title: {
              text: 'Incident',
              skew3d: true
            },
            min: 0,
            max: 9,
            categories: [this.incidents[0].incident_type, this.incidents[1].incident_type, this.incidents[2].incident_type,
                        this.incidents[3].incident_type, this.incidents[4].incident_type,this.incidents[5].incident_type, 
                        this.incidents[6].incident_type, this.incidents[7].incident_type, this.incidents[8].incident_type,
                        this.incidents[9].incident_type],
          },
          zAxis: {
            title: {
              text: 'Department',
              skew3d: true
            },
            min: 0,
            max: 7,
            categories: [this.freqs[0].user_grp, this.freqs[1].user_grp , this.freqs[2].user_grp, this.freqs[3].user_grp,
                        this.freqs[4].user_grp, this.freqs[5].user_grp, this.freqs[6].user_grp, this.freqs[7].user_grp],
          },
          plotOptions: {
            series: {
              groupZPadding: 10,
              depth: 100,
              groupPadding: 0,
              grouping: false,
            }
          },
          series: [{
            name: this.freqs[0].user_grp,
            data:[
              [0, this.freqs[0].assault],
              [1, this.freqs[0].sh],
              [2, this.freqs[0].bullying],
              [3, this.freqs[0].selfHarm],
              [4, this.freqs[0].drugUse],
              [5, this.freqs[0].hateSpeech],
              [6, this.freqs[0].iths],
              [7, this.freqs[0].harassment],
              [8, this.freqs[0].theft],
              [9, this.freqs[0].verbalAbuse]
            ]
          }, {
            name: this.freqs[1].user_grp,
            data: [
              [0, this.freqs[1].assault],
              [1, this.freqs[1].sh],
              [2, this.freqs[1].bullying],
              [3, this.freqs[1].selfHarm],
              [4, this.freqs[1].drugUse],
              [5, this.freqs[1].hateSpeech],
              [6, this.freqs[1].iths],
              [7, this.freqs[1].harassment],
              [8, this.freqs[1].theft],
              [9, this.freqs[1].verbalAbuse]
            ]
          }, {
            name: this.freqs[2].user_grp,
            data: [
              [0, this.freqs[2].assault],
              [1, this.freqs[2].sh],
              [2, this.freqs[2].bullying],
              [3, this.freqs[2].selfHarm],
              [4, this.freqs[2].drugUse],
              [5, this.freqs[2].hateSpeech],
              [6, this.freqs[2].iths],
              [7, this.freqs[2].harassment],
              [8, this.freqs[2].theft],
              [9, this.freqs[2].verbalAbuse]
            ]
          },{
            name: this.freqs[3].user_grp,
            data: [
              [0, this.freqs[3].assault],
              [1, this.freqs[3].sh],
              [2, this.freqs[3].bullying],
              [3, this.freqs[3].selfHarm],
              [4, this.freqs[3].drugUse],
              [5, this.freqs[3].hateSpeech],
              [6, this.freqs[3].iths],
              [7, this.freqs[3].harassment],
              [8, this.freqs[3].theft],
              [9, this.freqs[3].verbalAbuse]
            ]
          },{
            name: this.freqs[4].user_grp,
            data: [
              [0, this.freqs[4].assault],
              [1, this.freqs[4].sh],
              [2, this.freqs[4].bullying],
              [3, this.freqs[4].selfHarm],
              [4, this.freqs[4].drugUse],
              [5, this.freqs[4].hateSpeech],
              [6, this.freqs[4].iths],
              [7, this.freqs[4].harassment],
              [8, this.freqs[4].theft],
              [9, this.freqs[4].verbalAbuse]
            ]
          },{
            name: this.freqs[5].user_grp,
            data: [
              [0, this.freqs[5].assault],
              [1, this.freqs[5].sh],
              [2, this.freqs[5].bullying],
              [3, this.freqs[5].selfHarm],
              [4, this.freqs[5].drugUse],
              [5, this.freqs[5].hateSpeech],
              [6, this.freqs[5].iths],
              [7, this.freqs[5].harassment],
              [8, this.freqs[5].theft],
              [9, this.freqs[5].verbalAbuse]
            ]
          },{
            name: this.freqs[6].user_grp,
            data: [
              [0, this.freqs[6].assault],
              [1, this.freqs[6].sh],
              [2, this.freqs[6].bullying],
              [3, this.freqs[6].selfHarm],
              [4, this.freqs[6].drugUse],
              [5, this.freqs[6].hateSpeech],
              [6, this.freqs[6].iths],
              [7, this.freqs[6].harassment],
              [8, this.freqs[6].theft],
              [9, this.freqs[6].verbalAbuse]
            ]
          },{
            name: this.freqs[7].user_grp,
            data: [
              [0, this.freqs[7].assault],
              [1, this.freqs[7].sh],
              [2, this.freqs[7].bullying],
              [3, this.freqs[7].selfHarm],
              [4, this.freqs[7].drugUse],
              [5, this.freqs[7].hateSpeech],
              [6, this.freqs[7].iths],
              [7, this.freqs[7].harassment],
              [8, this.freqs[7].theft],
              [9, this.freqs[7].verbalAbuse]
            ]
          }
         ]
        }
        

      });
      const self = this;
        this.chartCallback = chart => {
          self.chart = chart;
          self.addChartRotation();
        };
        
    }

    addChartRotation() {
      const chart = this.chart;
      const H = this.Highcharts;
  
      function dragStart(eStart) {
        eStart = chart.pointer.normalize(eStart);
  
        var posX = eStart.chartX,
          posY = eStart.chartY,
          alpha = chart.options.chart.options3d.alpha,
          beta = chart.options.chart.options3d.beta,
          sensitivity = 5,
          handlers = [];
  
        function drag(e) {
          e = chart.pointer.normalize(e);
  
          chart.update(
            {
              chart: {
                options3d: {
                  alpha: alpha + (e.chartY - posY) / sensitivity,
                  beta: beta + (posX - e.chartX) / sensitivity
                }
              }
            },
            undefined,
            undefined,
            false
          );
        }
  
        function unbindAll() {
          handlers.forEach(function(unbind) {
            if (unbind) {
              unbind();
            }
          });
          handlers.length = 0;
        }
  
        handlers.push(H.addEvent(document, "mousemove", drag));
        handlers.push(H.addEvent(document, "touchmove", drag));
  
        handlers.push(H.addEvent(document, "mouseup", unbindAll));
        handlers.push(H.addEvent(document, "touchend", unbindAll));
      }
  
      H.addEvent(chart.container, "mousedown", dragStart);
      H.addEvent(chart.container, "touchstart", dragStart);
    }

    ngOnInit(){
    
    }

    refreshDash(){
      $('#refreshHome').load(document.URL);
    }

  
}
