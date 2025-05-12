import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LoadingState {
  page: string;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({ page: '', loading: false });
  loading$ = this.loadingSubject.asObservable();
  constructor() { }

  setLoading(state: LoadingState) {
    this.loadingSubject.next(state);
  }
}
