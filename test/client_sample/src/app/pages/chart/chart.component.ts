import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../../services/register.service';
import { Freq } from '../../../../Freq';
import Chart from 'chart.js';
import { positionElements } from '@ng-bootstrap/ng-bootstrap/util/positioning';
import { FormBuilder, FormGroup, FormArray } from "@angular/forms";
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { File } from '../../../../File';
import {FileUploader } from 'ng2-file-upload';


@Component({
    selector: 'icons-cmp',
    moduleId: module.id,
    templateUrl: 'chart.component.html',
    styleUrls: ['chart.component.css']
})

export class ChartComponent implements OnInit{
  public canvas : any;
  public ctx;
  public datasets: any[] = [];
  public data: any;
  public myChartData;
  public clicked: boolean = false;
  public clicked1: boolean = false;
  public clicked2: boolean = false;
  public clicked3: boolean = false;
  public clicked4: boolean = false;
  public clicked5: boolean = false;
  public clicked6: boolean = false;
  public clicked7: boolean = false;

  freqs: Freq[];
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

  afuConfig;
  token;

  files: File[];
  avatar: string[] = [];

  constructor(public fb: FormBuilder,
    private sanitizer: DomSanitizer, private registerService:RegisterService){

      this.registerService.getFiles()
        .subscribe((files: any[]) => {
          this.files = files;
        });

      this.registerService.getFreq()
        .subscribe((freqs: any[]) => {
          this.freqs = freqs;

          
          var chart_labels = ['Assault', 'Sexual Harrasment', 'Bullying', 'Self Harm', 'Drug Use', 'Hate Speech', 
                              'Intent to Hurt Someone', 'Harassment', 'Theft', 'Verbal Abuse'];
            for(var i=0; i<this.freqs.length; i++){
              this.datasets[i] = [
                freqs[i].assault, freqs[i].sh, freqs[i].bullying, freqs[i].selfHarm, freqs[i].drugUse,
                freqs[i].hateSpeech, freqs[i].iths, freqs[i].harassment, freqs[i].theft, freqs[i].verbalAbuse
              ];
            }

            // console.log(this.datasets);
          this.data = this.datasets;
      
      
      
          this.canvas = document.getElementById("chartBig1");
          this.ctx = this.canvas.getContext("2d");
      
          var config = {
            type: 'doughnut',
            data: {
              labels: chart_labels,
              datasets: [{
                label: "Incidents",
                fill: true,
                backgroundColor: [
                            '#e3e3e3',
                            '#4acccd',
                            '#fcc468',
                            '#ef8157',
                            '#616f39',
                            '#f46060',
                            '#caadde',
                            '#f0f69f',
                            '#df7599',
                            '#c9d99e',
                          ],
                
                borderWidth: 0,
                pointRadius: 4,
                data: this.data,
              }]
            }
          };
          this.myChartData = new Chart(this.ctx, config);
      
        });
      }

  ngOnInit() {
    
  }


  public updateOptions() {
    this.myChartData.data.datasets[0].data = this.data;
    this.myChartData.update()
  } 

}

















