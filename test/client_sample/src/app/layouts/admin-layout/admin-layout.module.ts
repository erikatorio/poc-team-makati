import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminLayoutRoutes } from './admin-layout.routing';
// import { UsersComponent } from '../../pages/users/users.component';

import { DashboardComponent }       from '../../pages/dashboard/dashboard.component';
import { ProfileComponent }            from '../../pages/profile/profile.component';
import { IncidentListComponent }           from '../../pages/incidentList/incidentList.component';
import { HistoryComponent }      from '../../pages/history/history.component';
import { ChartComponent }           from '../../pages/chart/chart.component';
import { UserListComponent }            from '../../pages/userList/userList.component';
import { NotificationsComponent }   from '../../pages/notifications/notifications.component';
import { UpgradeComponent }         from '../../pages/upgrade/upgrade.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule
  ],
  declarations: [
    DashboardComponent,
    ProfileComponent,
    IncidentListComponent,
    UpgradeComponent,
    HistoryComponent,
    ChartComponent,
    UserListComponent,
    NotificationsComponent
    // UsersComponent
  ]
})

export class AdminLayoutModule {}
