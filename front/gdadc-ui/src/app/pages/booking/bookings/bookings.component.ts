import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { CommonModule } from '@angular/common';
import { catchError, Observable, Subscription, take, tap, throwError } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { BookingTable } from '../../../models/booking-table/booking-table.model';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CreateBookingComponent } from '../../../modals/create-booking/create-booking.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-bookings',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  displayedColumns: string[] = [
    'first_name',
    'last_name',
    'birthday',
    'document',
    'departure_date',
    'departure_iata',
    'arrival_iata',
    'arrival_date',
    'created_at',
    'updated_at'];


  apiService = inject(ApiService);
  fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  bookings!: Observable<BookingTable[]>;
  file: File | null = null;
  isLoading: boolean = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource<BookingTable>();


  ngOnInit() {
    this.getBookings();
  }

  getBookings() {
    this.apiService.getBookings().pipe(
      tap((resp: any) => {
        this.dataSource.data = resp.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (data: BookingTable, col: string) => this.sorts(data, col);
        this.dataSource.filterPredicate = (data: BookingTable, filter: string) => this.adjustFiltersTable(data, filter);
        this.isLoading = false;
      }),
      catchError((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error loading bookings',
          text: `Failed to load bookings: ${err}`,
        });
        return '';
      })
    ).subscribe()
  }


  download() {
    Swal.fire({
      title: 'Downloading file...',
      text: 'Please wait while the download is being processed.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.apiService.downloadFile().pipe(
      tap((blob: Blob | MediaSource) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'bookings.xlsx';
        a.click();
        URL.revokeObjectURL(objectUrl);

        Swal.close();

        Swal.fire({
          icon: 'success',
          title: 'Download completed!',
          showConfirmButton: false,
          timer: 1500
        });
      }),
      catchError((err) => {
        Swal.close();

        Swal.fire({
          icon: 'error',
          title: 'Download error',
          text: 'The file could not be downloaded.',
        });
        return '';
      })
    ).subscribe();
  }


  onFileInput(files: FileList | null): void {
    if (files) {
      this.file = files.item(0);
      this.upload();
    }
  }


  upload() {
    if (this.file) {
      Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while the file is being uploaded.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.apiService.uploadFile(this.file).pipe(
        tap(() => {

          this.getBookings();

          this.file = null;
          Swal.close();

          Swal.fire({
            icon: 'success',
            title: 'Upload completed!',
            showConfirmButton: false,
            timer: 1500
          });                  
        }),
        catchError((err) => {
          Swal.close();

          Swal.fire({
            icon: 'error',
            title: 'Upload error',
            text: 'The file could not be uploaded.',
          });
          return '';
        })
      ).subscribe();
    }
  }


  createBookingModal(): void {
    const dialogRef = this.dialog.open(CreateBookingComponent, {
      width: '600px',
      height: '500px',
      panelClass: 'custom-dialog-container',
      data: this.dataSource.data
    });
    dialogRef.afterClosed().subscribe(result => {
      result == true ? this.getBookings() : null;
    });
  }

  formatDateString(dateStr: string | Date): Date | null {
    if (dateStr instanceof Date) {
      return isNaN(dateStr.getTime()) ? null : dateStr;
    }

    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      const date = new Date(+year, +month - 1, +day);
      return isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  sorts(data: any, col: string) {
    const datas = data[col];
    const convertString = (text: string): string => {
      // Convertendo strings com acentos para que conseguia realizar o sort corretamente.
      return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    switch (col) {
      case 'birthday':
      case 'departure_date':
      case 'arrival_date':
        // Formatar strings invalidas em data exemplo "15-12-1998"
        if (typeof datas === 'string' && datas.includes('/')) {
          const [day, month, year] = datas.split('/')
          return new Date(Number(year), Number(month) - 1, Number(day))
        } else {
          return new Date(datas);
        }
      case 'first_name':
      case 'last_name':
        return convertString(datas);
      default:
        return datas
    }
  };

  adjustFiltersTable(record: BookingTable, filter: string) {
    const normalize = (text: string) => text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const filterValue = normalize(filter);
    const fields = [
      record.first_name,
      record.last_name,
      record.birthday,
      record.document,
      record.departure_date,
      record.arrival_date,
      record.departure_iata,
      record.arrival_iata
    ];
    return fields.some((field) => normalize(field).includes(filterValue));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
