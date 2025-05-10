import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BookingsComponent } from "./pages/booking/bookings/bookings.component";
import { DashboardComponent } from "./pages/dashboard/dashboard/dashboard.component";

@Component({
  selector: 'app-root',
  imports: [
    // RouterOutlet,
    BookingsComponent,
    RouterLink,
    DashboardComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gdadc-ui';
  activeTab = 'bookings';
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
