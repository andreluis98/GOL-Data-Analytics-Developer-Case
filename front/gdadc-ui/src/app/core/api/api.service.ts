import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { BookingTable } from '../../models/booking-table/booking-table.model';
import { DashboardTable } from '../../models/dashboard-table/dashboard-table.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private headerToken = inject(AuthService);
  private baseURL = `${environment.apiUrl}/api/v1/`;
  private bookings$: Observable<BookingTable[]> | null = null;

  // List all Bookings
  getBookings(){
    return this.http.get<BookingTable>(`${this.baseURL}booking`, { headers: this.headerToken.headers})
  }

  // getBookings(){
  //   if(!this.bookings$){
  //     this.bookings$ = this.http.get<BookingTable[]>(`${this.baseURL}booking`, { headers: this.headerToken.headers}).pipe(
  //       shareReplay(1)
  //     );
  //   }
  //   return this.bookings$;
  // }

  //Download
  downloadFile(): Observable<Blob> {
    return this.http.get(`${this.baseURL}booking/file/download`, {headers: this.headerToken.headers, responseType: 'blob'});
  }

  //Upload
  uploadFile(file: File) {
    const data = new FormData();
    data.append('content', file);
    return this.http.post(`${this.baseURL}booking/file/upload`, data, { headers: this.headerToken.headers});
  }
  
  //Create the booking
  createBooking(bookingTable :BookingTable){
    return this.http.post(`${this.baseURL}booking`, bookingTable, { headers: this.headerToken.headers });
  }

  //Set data for charts
  getChartData(chartId: number){
    return this.http.get(`${this.baseURL}dashboard/chart/data/${chartId}`, { headers: this.headerToken.headers });
  }

  // List air travel data
  getDashboardTable(){
    return this.http.get<DashboardTable>(`${this.baseURL}dashboard/data`, { headers: this.headerToken.headers })
  }
}
