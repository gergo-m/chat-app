import { Routes } from '@angular/router';
import { Register } from './register/register';
import { GuestGuard } from './guards/guest-guard';

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
        path: '',
        loadComponent: () => import('./chat/chat').then(m => m.Chat)
    }
];
