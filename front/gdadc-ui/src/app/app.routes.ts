import { Routes } from '@angular/router';
import { BookingsComponent } from './pages/booking/bookings/bookings.component';
import { DashboardComponent } from './pages/dashboard/dashboard/dashboard.component';

export const routes: Routes = [
        { path: '', redirectTo: 'bookings', pathMatch: 'full' },
        { path: 'bookings', component: BookingsComponent },
        { path: 'dashboard', component: DashboardComponent },
];
