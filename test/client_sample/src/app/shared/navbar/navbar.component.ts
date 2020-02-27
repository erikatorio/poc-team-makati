import { Component, OnInit, Renderer, ViewChild, ElementRef } from '@angular/core';
import { ROUTES } from '../../sidebar/sidebar.component';
import { Router } from '@angular/router';
import { Location} from '@angular/common';
import { RegisterService } from '../../services/register.service';
import { Logs } from '../../../../Logs';
import { Chat } from '../../../../Chat';
import { ToastrService } from "ngx-toastr";
import { IncidentRecord } from '../../../../IncidentRecord';
import * as $ from 'jquery';

@Component({
    moduleId: module.id,
    selector: 'navbar-cmp',
    templateUrl: 'navbar.component.html',
    styleUrls:['navbar.component.css']
})

export class NavbarComponent implements OnInit{

    private listTitles: any[];
    location: Location;
    private nativeElement: Node;
    private toggleButton;
    private sidebarVisible: boolean;

    chats: Chat[];
    unviewedChats: Chat[];
    chat: Chat;
    sender: string;
    viewed: boolean;

    logs: Logs[];
    unviewed: Logs[];
    log: Logs;
    user_id: string;
    user_name: string;
    action_id: number;
    action_name: string;
    action_date: string;
    action_viewed: Boolean;
    action_removed: Boolean;

    records: IncidentRecord[];
    audio;

    public isCollapsed = true;
    @ViewChild("navbar-cmp", {static: false}) button;

    constructor(location:Location, private renderer : Renderer, private element : ElementRef, 
                private router: Router, private registerService:RegisterService, 
                private toastr: ToastrService) {
        this.location = location;
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;

        this.audio = new Audio();
        this.audio.src = '../../../assets/sounds/definite.mp3';
        this.audio.load();

        this.registerService.getAllPendingRecords()
            .subscribe((records: any[]) => {
            this.records = records;

        const color = Math.floor(Math.random() * 5 + 1);
    
        for(var i = 0; i < this.records.length; i++){
              this.toastr.success(
                '<span data-notify="icon" class="nc-icon nc-bell-55"></span><b>'+ this.records[i]._id +'</b>' + '<br>'+ this.records[i].incident_type +'<br>' + this.records[i].record_date,
                'New Report!',
                {
                  timeOut: 6000,
                  closeButton: true,
                  enableHtml: true,
                  tapToDismiss: true,
                  toastClass: "alert alert-success alert-with-icon",
                  positionClass: "toast-" + 'bottom' + "-" + 'right'
                }
              );
              this.updateDisplayed(records[i]);
              this.audio.play();
        }
        });

        this.registerService.getSentRecords()
            .subscribe((logs: any[]) => {
            this.logs = logs;
        });

        this.registerService.getUnviewedChats()
            .subscribe((chats: any[]) => {
            this.chats = chats;

             for(var i = 0; i < this.chats.length; i++){
                  this.toastr.info(
                    '<span data-notify="icon" class="nc-icon nc-bell-55"></span><b>'+ this.chats[i].sender +'</b><br>' + this.chats[i].messages + '<br>' +this.chats[i].dateTime,
                    'New Message!',
                    {
                      timeOut: 6000,
                      closeButton: true,
                      enableHtml: true,
                      tapToDismiss: true,
                      toastClass: "alert alert-info alert-with-icon",
                      positionClass: "toast-" + 'bottom' + "-" + 'right'
                    }
                  );
                  this.updateViewed(chats[i]);
                  this.audio.play();
            }
            
        });

        this.registerService.countUnviewed()
            .subscribe((unviewed: any[]) => {
            this.unviewed = unviewed;
        });

        this.registerService.countUnviewedChat()
            .subscribe((unviewedChats: any[]) => {
            this.unviewedChats = unviewedChats;
        });

    }

    ngOnInit(){
        this.listTitles = ROUTES.filter(listTitle => listTitle);
        var navbar : HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        this.router.events.subscribe((event) => {
          this.sidebarClose();
       });

       if(sessionStorage.getItem("admin_id") == "" || sessionStorage.getItem("admin_id") == undefined){
         alert('You are not logged in');
         this.router.navigate(['/login']);
       } 

    }

    logout(){
      sessionStorage.setItem("admin_id", "");
      this.router.navigate(['/login']);
    }

    updateDisplayed(records){
      var tbl_incidentrecord = this.records;

        var details = { 
            _id: records._id,
            displayed: true,
        };

      this.registerService.updateDisplayed(details).subscribe(data => {
              records._id = details._id;
              records.displayed = true;
          });
    }

    updateViewed(chats){
      var tbl_chat = this.chats;

        var details = { 
            _id: chats._id,
            viewed: true,
        };

      this.registerService.updateChatViewed(details).subscribe(data => {
              chats._id = details._id;
              chats.viewed = true;
          });
    }

    viewedChat(log){
      var tbl_log = this.logs;

        var details = { 
            _id: log._id,
            action_viewed: true,
            action_removed: true
        };

        $('#navbarDropdownMenuLink').load(document.URL);

      this.registerService.updateLogsRemoved(details).subscribe(data => {
              log._id = details._id;
              log.action_viewed = true;
              log.action_removed = true;
          });
    }

    viewedLog(log){
      var tbl_log = this.logs;

        var details = { 
            _id: log._id,
            action_viewed: true
        };

        $('#navbarDropdownMenuLink').load(document.URL);
    
      this.registerService.updateLogsViewed(details).subscribe(data => {
              log._id = details._id;
              log.action_viewed = true;
          });
    }

    removed(log){
      var tbl_log = this.logs;

        var details = { 
            _id: log._id,
            action_removed: true
        };

        $('#navbarDropdownMenuLink').load(document.URL);

      this.registerService.updateLogsRemoved(details).subscribe(data => {
              log._id = details._id;
              log.action_removed = true;
          });
    }

    getTitle(){
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }
      for(var item = 0; item < this.listTitles.length; item++){
          
          if(this.listTitles[item].path === titlee){
              return this.listTitles[item].title;
          }
      }
      return 'Dashboard';
    }
    sidebarToggle() {
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
      }
      sidebarOpen() {
          const toggleButton = this.toggleButton;
          const html = document.getElementsByTagName('html')[0];
          const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];
          setTimeout(function(){
              toggleButton.classList.add('toggled');
          }, 500);

          html.classList.add('nav-open');
          if (window.innerWidth < 991) {
            mainPanel.style.position = 'fixed';
          }
          this.sidebarVisible = true;
      };
      sidebarClose() {
          const html = document.getElementsByTagName('html')[0];
          const mainPanel =  <HTMLElement>document.getElementsByClassName('main-panel')[0];
          if (window.innerWidth < 991) {
            setTimeout(function(){
              mainPanel.style.position = '';
            }, 500);
          }
          this.toggleButton.classList.remove('toggled');
          this.sidebarVisible = false;
          html.classList.remove('nav-open');
      };
      collapse(){
        this.isCollapsed = !this.isCollapsed;
        const navbar = document.getElementsByTagName('nav')[0];
        
        if (!this.isCollapsed) {
          navbar.classList.remove('navbar-transparent');
          navbar.classList.add('bg-white');
        }else{
          navbar.classList.add('navbar-transparent');
          navbar.classList.remove('bg-white');
        }

      }
}
