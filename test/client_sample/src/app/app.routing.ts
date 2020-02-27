import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { UsersComponent } from './pages/users/users.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ChartComponent } from './pages/chart/chart.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { IncidentListComponent } from './pages/incidentList/incidentList.component';
import { UserListComponent } from './pages/userList/userList.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { HistoryComponent } from './pages/history/history.component';

export const AppRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: UsersComponent,
    // redirectTo: 'login',
    pathMatch: 'full',
  },
   {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
        { path: 'dashboard',      component: DashboardComponent },
        { path: 'chart', component: ChartComponent },
        { path: 'chat', component: NotificationsComponent },
        { path: 'incidentList', component: IncidentListComponent },
        { path: 'userList', component: UserListComponent },
        { path: 'profile', component: ProfileComponent },
        { path: 'history', component: HistoryComponent },
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
]
