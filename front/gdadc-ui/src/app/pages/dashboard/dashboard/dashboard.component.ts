import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class DashboardComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['date', 'departure_iata', 'arrival_iata', 'departures', 'arrivals'];
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  loadingService = inject(LoadingService);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<DashboardTable>();

  charts: ChartData[] = [];
  isLoading: boolean = true;
  disableAllControls = true;
  noChartData!: boolean[];
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
        this.isLoading = false;
        this.cdr.detectChanges();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.filterPredicate = (data: DashboardTable, filter: string) => this.customFiltersTable(data, filter);
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
          showCloseButton: true,
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
          this.noChartData = this.charts.map(chart => chart.data.length === 0);
          this.isLoading = false;
        }),
        catchError((err) => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: `Failed to load dashboard charts ${err.message}.`,
            showConfirmButton: false,
            showCloseButton: true,
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

    // Separa código IATA ex: GRUSDU
    if (/^[A-Z]{6}$/.test(trimmed)) {
      const departure = trimmed.slice(0, 3);
      const arrival = trimmed.slice(3, 6);
      return `${departure} → ${arrival}`;
    }

    // trata data no formato ISO ou similar
    const isoDateMatch = trimmed.match(/(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch) {
      const [year, month, day] = isoDateMatch[0].split("-");
      return `${day}/${month}`;
    }

    // trata data truncada tipo '20T03:00:00.000Z/05'
    const truncatedDateMatch = trimmed.match(/^(\d{2})T.*\/(\d{2})$/);
    if (truncatedDateMatch) {
      const day = truncatedDateMatch[1];
      const month = truncatedDateMatch[2];
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
      normalize(formatDateToDisplay(record.date)),
      normalize(record.iatapair)
    ];

    return fields.some((field) => field.includes(filterValue));
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
