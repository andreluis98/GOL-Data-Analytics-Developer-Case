import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'bookings', pathMatch: 'full' },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./pages/booking/bookings/bookings.component').then(m => m.BookingsComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
];
