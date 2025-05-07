import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  headers = new HttpHeaders({
    Authorization: `Bearer ${this.getAuthToken()}`
  });

  
  private getAuthToken(): string {
    const authTokenPass = environment.authTokenPass;
    const authTokenKey = CryptoJS.enc.Base64.parse(environment.authTokenKey);
    const authTokenIv = CryptoJS.enc.Utf8.parse(environment.authTokenIv);

    const encryptedToken = CryptoJS.AES.encrypt(authTokenPass, authTokenKey, {
      iv: authTokenIv,
      mode: CryptoJS.mode.CBC
    }).toString();

    return encryptedToken;
  }
}
