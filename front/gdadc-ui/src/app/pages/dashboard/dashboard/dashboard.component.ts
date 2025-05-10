import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ChartComponent } from "../../../chart/chart.component";
import { ApiService } from '../../../core/api.service';
import { ChartData } from '../../../models/chart-data/chart-data.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['data', 'origem', 'destino', 'passageiros_partida', 'passageiros_chegada'];
  activeTab = 'dashboard';
  private apiService = inject(ApiService);
  charts: ChartData[] = [];
  
  ngOnInit(): void {
    this.loadChartsData();
  }
  

  loadChartsData(): void {
    for (let i = 1; i <= 3; i++) {
      this.apiService.getChartData(i).subscribe((response: any) => {
        const formattedData = response.data.map((item: any) => ({
          category: item.category.trim(),
          value: item.value
        }));
        this.charts[i - 1] = {
          labels: formattedData.map((item: { category: string; }) => this.formatCategoryLabel(item.category)),
          data: formattedData.map((item: { value: any; }) => item.value)
        };
      });
    }
  }

  
  formatCategoryLabel(raw: string): string {
    const trimmed = raw.trim();
    if (/^[A-Z]{6}$/.test(trimmed)) {
      const origem = trimmed.slice(0, 3);
      const destino = trimmed.slice(3, 6);
      return `${origem} → ${destino}`;
    }

    const dateOnly = trimmed.split(" ")[0];
    const [year, month, day] = dateOnly.split("-");
    if (year && month && day) {
      return `${day}/${month}`;
    }

    return trimmed;
  }

}
