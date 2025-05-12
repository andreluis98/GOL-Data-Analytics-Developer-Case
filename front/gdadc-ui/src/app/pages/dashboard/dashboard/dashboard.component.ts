import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ChartComponent } from "../../../chart/chart.component";
import { ApiService } from '../../../core/api/api.service';
import { ChartData } from '../../../models/chart-data/chart-data.model';
import { catchError, Subject, takeUntil, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { DashboardTable } from '../../../models/dashboard-table/dashboard-table.model';
import { LoadingService } from '../../../core/loading/loading.service';

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
export class DashboardComponent implements OnInit, OnDestroy  {
  displayedColumns: string[] = ['date', 'iatapair', 'departures', 'arrivals'];
  activeTab = 'dashboard';
  private apiService = inject(ApiService);
  private destroy$ = new Subject<void>();
  loadingService = inject(LoadingService);
  charts: ChartData[] = [];
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<DashboardTable>();
  ngOnInit(): void {
    this.getDashboardTable();
    this.loadChartsData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getDashboardTable() {
    this.loadingService.setLoading({ page: 'dashboard', loading: true });
    this.apiService.getDashboardTable().pipe(
      takeUntil(this.destroy$),
      tap((resp: any) => {
        this.dataSource.data = resp.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data: DashboardTable, filter: string) => this.customFiltersTable(data, filter);
        this.isLoading = false;
        this.loadingService.setLoading({ page: 'dashboard', loading: false });
      }),
      catchError((err) => {
        this.loadingService.setLoading({ page: 'dashboard', loading: false });
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: `Failed to load dashboard data ${err.message}.`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        return '';
      })
    ).subscribe()
  }

  loadChartsData() {
    for (let i = 1; i <= 3; i++) {
      this.apiService.getChartData(i).pipe(
        takeUntil(this.destroy$),
        tap((response: any) => {
          const formattedData = response.data.map((item: any) => ({
            category: item.category.trim(),
            value: item.value
          }));

          this.charts[i - 1] = {
            labels: formattedData.map((item: { category: string; }) => this.formatCategoryLabel(item.category)),
            data: formattedData.map((item: { value: any; }) => item.value)
          };

          this.isLoading = false;
        }),
        catchError((err) => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: `Failed to load dashboard charts ${err.message}.`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
          return [];
        })
      ).subscribe();
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

  customFiltersTable(record: DashboardTable, filter: string) {
    const normalize = (text: string | number) => text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filterValue = normalize(filter);
    
    const formatDateToDisplay = (dateStr: string): string => {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    };
  
    const fields = [
      normalize(record.arrivals),
      normalize(formatDateToDisplay(record.date)),
      normalize(String(record.departures)),
      normalize(record.iatapair)
    ];

    return fields.some((field) => field.includes(filterValue));
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
