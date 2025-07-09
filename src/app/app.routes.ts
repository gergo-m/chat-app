import { Routes } from '@angular/router';
import { GuestGuard } from './shared/guards/guest-guard';
import { UserGuard } from './shared/guards/user-guard';
import { ChatroomGuard } from './shared/guards/chatroom-guard-guard';

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
        canActivate: [ChatroomGuard]
    },
    {
        path: '',
        loadComponent: () => import('./chat/chat').then(m => m.Chat),
        canActivate: [UserGuard],
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
