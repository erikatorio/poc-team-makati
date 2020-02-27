import { Routes } from '@angular/router';

import { UsersComponent } from '../../pages/users/users.component';
import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { ProfileComponent } from '../../pages/profile/profile.component';
import { IncidentListComponent } from '../../pages/incidentList/incidentList.component';
import { HistoryComponent } from '../../pages/history/history.component';
import { ChartComponent } from '../../pages/chart/chart.component';
import { UserListComponent } from '../../pages/userList/userList.component';
import { NotificationsComponent } from '../../pages/notifications/notifications.component';
import { UpgradeComponent } from '../../pages/upgrade/upgrade.component';

export const AdminLayoutRoutes: Routes = [
    // { path : 'index',         component: UsersComponent},
    { path: 'dashboard',      component: DashboardComponent },
    { path: 'profile',           component: ProfileComponent },
    { path: 'incidentList',          component: IncidentListComponent },
    { path: 'history',     component: HistoryComponent },
    { path: 'chart',          component: ChartComponent },
    { path: 'userList',           component: UserListComponent },
    { path: 'chat',  component: NotificationsComponent }
    // { path: 'upgrade',        component: UpgradeComponent }
];
