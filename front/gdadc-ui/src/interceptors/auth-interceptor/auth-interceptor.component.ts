import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth-interceptor',
  imports: [],
  templateUrl: './auth-interceptor.component.html',
  styleUrl: './auth-interceptor.component.css'
})
export class AuthInterceptorComponent implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    throw new Error('Method not implemented.');
  }

}
