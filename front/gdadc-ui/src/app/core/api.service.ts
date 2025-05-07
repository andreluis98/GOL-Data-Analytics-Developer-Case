import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private headerToken = inject(AuthService);

  private baseURL = environment.apiUrl;

  // List all Bookings
  getBookings(){
    return this.http.get(`${this.baseURL}/api/v1/booking`, { headers: this.headerToken.headers})
  }

  //Download
  downloadFile(): Observable<Blob> {
    return this.http.get(`${this.baseURL}/api/v1/booking/file/download`, {headers: this.headerToken.headers, responseType: 'blob'});
  }

  //Upload
  uploadFile(file: File) {
    const data = new FormData();
    data.append('content', file);
    return this.http.post(`${this.baseURL}/api/v1/booking/file/upload`, data, { headers: this.headerToken.headers});
  }

  //Create the booking
  createBooking(    
    first_name: string,
    last_name: string,
    birthday: string,
    document: string,
    departure_date: string,
    departure_iata: string,
    arrival_iata: string,
    arrival_date: string,
  ){
    const body = {
      first_name: first_name,
      last_name: last_name, 
      birthday: birthday,
      document: document,
      departure_date: departure_date,
      departure_iata: departure_iata,
      arrival_iata: arrival_iata,
      arrival_date: arrival_date,
    }
    return this.http.post(`${this.baseURL}/api/v1/booking`, body, { headers: this.headerToken.headers });
  }

  //Set data for charts
  getChartData(chartId: number){
    return this.http.get(`${this.baseURL}/api/v1/dashboard/chart/data/${chartId}`, { headers: this.headerToken.headers });
  }

  // List air travel data
  getDashboardTable(){
    return this.http.get(`${this.baseURL}/api/v1/dashboard/data`, { headers: this.headerToken.headers })
  }

}
