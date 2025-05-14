import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IataCodesService {
  private http = inject(HttpClient);
  airports: any[] = [];

getCodesIata(): Observable<any[]> {
  return this.http.get<any[]>('data/airports.json').pipe(
    map(data => data.filter(airport => airport.iata_code))
  );
 }
}
