import { Component, OnInit } from '@angular/core';

export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/admin/dashboard',     title: 'Home',         icon:'nc-bank',       class: '' },
    { path: '/admin/chart',         title: 'Chart',             icon:'nc-chart-pie-36',    class: '' },
    { path: '/admin/chat',          title: 'Chat',     icon:'nc-chat-33',    class: '' },
    { path: '/admin/incidentList',         title: 'Incident List',        icon:'nc-bullet-list-67',    class: '' },
    { path: '/admin/userList',         title: 'User List',        icon:'nc-tile-56',    class: '' },
    { path: '/admin/profile',          title: 'Profile',      icon:'nc-single-02',  class: '' },
    { path: '/admin/history',    title: 'History',        icon:'nc-book-bookmark', class: '' },
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
    styleUrls: ['sidebar.component.css']
})

export class SidebarComponent implements OnInit {
    public menuItems: any[];
    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
