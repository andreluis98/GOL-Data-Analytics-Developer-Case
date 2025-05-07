import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookingsComponent } from './pages/booking/bookings/bookings.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'gdadc-ui';
  
}
