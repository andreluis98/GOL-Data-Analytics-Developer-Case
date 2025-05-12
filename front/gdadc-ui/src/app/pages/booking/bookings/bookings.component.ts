import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import { CommonModule, DatePipe } from '@angular/common';
import { catchError, Observable, Subject, tap } from 'rxjs';
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
import { LoadingService } from '../../../core/loading/loading.service';
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

  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private loadingService = inject(LoadingService);
  private datePipe = inject(DatePipe);
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
      this.loadingService.setLoading({ page: 'bookings', loading: true });
      this.apiService.getBookings().pipe(
        tap((resp: any) => {
          this.dataSource = new MatTableDataSource(resp.data);
          this.dataSource.sortingDataAccessor = (data: BookingTable, col: string) => this.sorts(data, col);
          this.dataSource.filterPredicate = (data: BookingTable, filter: string) => this.adjustFiltersTable(data, filter);
          this.isLoading = false;
          
          this.cdr.detectChanges();
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.loadingService.setLoading({ page: 'bookings', loading: false });
        }),
        catchError((err) => {
          this.loadingService.setLoading({ page: 'bookings', loading: false });
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: `Unable to load bookings. Please try again later ${err.message}.`,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true
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
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Bookings downloaded successfully!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }),
      catchError((err) => {
        Swal.close();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: `Failed to download bookings ${err.message}.`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
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
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Bookings uploaded successfully!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });               
        }),
        catchError((err) => {
          Swal.close();
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: `Failed to upload bookings ${err.message}.`,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
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

  sorts(data: any, col: string) {
    console.log(data, col);
    
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
    const normalize = (text: string) =>
      text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  
    const filterValue = normalize(filter);
  
    const formatDateToDisplay = (dateStr: string): string => {
      if (!dateStr) return '';
      return this.datePipe.transform(dateStr, 'dd/MM/yyyy') || ''; 
    };
  
    const fields = [
      normalize(record.first_name),
      normalize(record.last_name),
      normalize(formatDateToDisplay(record.birthday)),
      normalize(record.document),
      normalize(formatDateToDisplay(record.departure_date)),
      normalize(formatDateToDisplay(record.arrival_date)),
      normalize(record.departure_iata),
      normalize(record.arrival_iata),
    ];
  
    return fields.some((field) => field.includes(filterValue));
  }
  
  
  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
