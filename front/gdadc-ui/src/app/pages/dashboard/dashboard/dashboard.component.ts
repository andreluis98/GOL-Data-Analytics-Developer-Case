import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ChartComponent } from "../../../chart/chart.component";
import { ApiService } from '../../../core/api.service';
import { ChartData } from '../../../models/chart-data/chart-data.model';
import { catchError, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { DashboardTable } from '../../../models/dashboard-table/dashboard-table.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    ChartComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['date', 'iatapair', 'departures', 'arrivals'];
  activeTab = 'dashboard';
  private apiService = inject(ApiService);
  charts: ChartData[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<DashboardTable>();
  ngOnInit(): void {
    this.getDashboardTable();
    this.loadChartsData();
  }

  getDashboardTable() {
    this.apiService.getDashboardTable().pipe(
      tap((resp: any) => {
        this.dataSource.data = resp.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // this.dataSource.filterPredicate = (data: DashboardTable, filter: string) => this.adjustFiltersTable(data, filter);
      }),
      catchError((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error loading table dashboard',
          text: `Failed to load table dashboard: ${err}`,
        });
        return '';
      })
    ).subscribe()
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

  // adjustFiltersTable(record: DashboardTable, filter: string) {
  //   const normalize = (text: string) => text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  //   const filterValue = normalize(filter);

  //   const fields = [
  //     normalize(record.arrivals.toString()),
  //     normalize(record.date),
  //     normalize(record.departures.toString()),
  //     normalize(record.iatapair)
  //   ];

  //   return fields.some((field) => field.includes(filterValue));
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
