import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingTable } from '../../models/booking-table/booking-table.model';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ApiService } from '../../core/api/api.service';
import { catchError, debounceTime, Subject, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule, DatePipe } from '@angular/common';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { IataCodesService } from '../../core/iata-code/iata-codes.service';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-create-booking',
  imports: [
    ReactiveFormsModule,
    MatError,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-booking.component.html',
  styleUrl: './create-booking.component.scss'
})
export class CreateBookingComponent implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);
  private data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<CreateBookingComponent>);
  private iataCodesService = inject(IataCodesService);
  bookingTable!: BookingTable;
  bookingForm!: FormGroup;
  today: string | null = null;
  airports: any[] = [];
  filteredDeparture: any[] = [];
  filteredArrival: any[] = [];
  searchDeparture$ = new Subject<string>();
  searchArrival$ = new Subject<string>();

  ngOnInit(): void {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.bookingForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      birthday: ['', Validators.required],
      document: ['', [Validators.required, this.documentAlreadyExistsValidator(this.data.bookings), Validators.minLength(7), Validators.maxLength(11)]],
      departure_date: ['', Validators.required],
      departure_iata: ['', Validators.required],
      arrival_iata: ['', Validators.required],
      arrival_date: ['', Validators.required],
    });
    this.loadingAirports();
  }

  documentAlreadyExistsValidator(existingDocs: BookingTable[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const input = control.value.trim();
      const documentExists = existingDocs.some(doc => doc.document === input);
      return documentExists ? { documentExists: true } : null;
    };
  }

  createBooking() {
    if (this.bookingForm.valid) {
      this.bookingTable = this.bookingForm.value;
      this.apiService.createBooking(this.bookingTable).pipe(
        tap(() => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Reservation created successfully!',
            showConfirmButton: false,
            showCloseButton: true,
            timer: 5000,
            timerProgressBar: true,
          }).then((result) => {
          });
          this.dialogRef.close(true);
        }),
        catchError((error) => {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: `Error creating the reservation ${error.message}.`,
            showConfirmButton: false,
            showCloseButton: true,
            timer: 3000,
            timerProgressBar: true
          });
          return ''
        })
      ).subscribe();
    }
  }

  loadingAirports() {
    this.iataCodesService.getCodesIata().subscribe(data => {
      this.airports = data;

      this.bookingForm.get('departure_iata')?.valueChanges
        .pipe(debounceTime(300))
        .subscribe(value => {
          this.filteredDeparture = this.filterAirports(value).slice(0, 20);
        });

      this.bookingForm.get('arrival_iata')?.valueChanges
        .pipe(debounceTime(300))
        .subscribe(value => {
          this.filteredArrival = this.filterAirports(value).slice(0, 20);
        });
    });
  }

  filterIATA(event: Event, isDeparture: boolean): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (isDeparture) {
      this.searchDeparture$.next(value);
    } else {
      this.searchArrival$.next(value);
    }
  }

  filterAirports(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.airports.filter(airport =>
      airport.iata_code.toLowerCase().includes(filterValue) ||
      airport.name.toLowerCase().includes(filterValue)
    );
  }

  clearForm(): void {
    this.bookingForm.reset();
  }
}
