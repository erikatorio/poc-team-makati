import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastrModule } from "ngx-toastr";
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
// import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { HighchartsChartModule } from "highcharts-angular";

import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule} from './shared/navbar/navbar.module';
import { FixedPluginModule} from './shared/fixedplugin/fixedplugin.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AngularFileUploaderModule } from 'angular-file-uploader';
import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';
import { ReactiveFormsModule } from '@angular/forms';
import { NgChatModule } from 'ng-chat';

import { AppComponent } from './app.component';
import { AppRoutes } from './app.routing';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { UsersComponent } from './pages/users/users.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChartComponent } from './pages/chart/chart.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { IncidentListComponent } from './pages/incidentList/incidentList.component';
import { UserListComponent } from './pages/userList/userList.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HistoryComponent } from './pages/history/history.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    UsersComponent,
    DashboardComponent,
    ChartComponent,
    NotificationsComponent,
    IncidentListComponent,
    UserListComponent,
    ProfileComponent,
    HistoryComponent,
    FileSelectDirective
  ],
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot(AppRoutes,{
      useHash: true
    }),
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot(),
    FooterModule,
    FixedPluginModule,
    FormsModule, 
    BrowserModule,
    HttpClientModule,
    Ng2SearchPipeModule,
    HighchartsChartModule,
    AngularFileUploaderModule,
    ReactiveFormsModule, 
    NgChatModule, 
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
