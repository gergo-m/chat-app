import { Routes } from '@angular/router';
import { Register } from './register/register';
import { GuestGuard } from './guards/guest-guard';
import { UserGuard } from './guards/user-guard';

export const routes: Routes = [
    {
        path: 'register', title: 'Register',
        loadComponent: () => import('./register/register').then(m => m.Register),
        canActivate: [GuestGuard]
    },
    {
        path: 'login', title: 'Login',
        loadComponent: () => import('./login/login').then(m => m.Login),
        canActivate: [GuestGuard]
    },
    {
        path: 'profile', title: 'Profile',
        loadComponent: () => import('./profile/profile').then(m => m.Profile),
        canActivate: [UserGuard]
    },
    {
        path: '',
        loadComponent: () => import('./chat/chat').then(m => m.Chat)
    }
];
