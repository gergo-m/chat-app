import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { GuestGuard } from './guards/guest-guard';
import { UserGuard } from './guards/user-guard';

export const routes: Routes = [
    {
        path: 'register', title: 'Register',
        loadComponent: () => import('./auth/register/register').then(m => m.Register),
        canActivate: [GuestGuard]
    },
    {
        path: 'login', title: 'Login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login),
        canActivate: [GuestGuard]
    },
    {
        path: 'profile', title: 'Profile',
        loadComponent: () => import('./profile/profile').then(m => m.Profile),
        canActivate: [UserGuard]
    },
    {
        path: 'chatroom/:id',
        loadComponent: () => import('./chatroom/chatroom').then(m => m.Chatroom),
        canActivate: [UserGuard]
    },
    {
        path: 'users', title: 'Users',
        loadComponent: () => import('./user-list/user-list').then(m => m.UserList),
        canActivate: [UserGuard]
    },
    {
        path: '',
        loadComponent: () => import('./chat/chat').then(m => m.Chat),
        canActivate: [UserGuard]
    }
];
