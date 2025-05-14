import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LoadingService, LoadingState } from './core/loading/loading.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gdadc-ui';
  private loadingService = inject(LoadingService);

  isLoading = false;
  currentPage = '';

  constructor() {
    this.loadingService.loading$.subscribe((state: LoadingState) => {
      setTimeout(() => {
        this.isLoading = state.loading;
        this.currentPage = state.page;
      });
    });
  }
}
