import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookingTable } from '../../models/booking-table/booking-table.model';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { catchError, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-create-booking',
  imports: [ReactiveFormsModule, MatError],
  templateUrl: './create-booking.component.html',
  styleUrl: './create-booking.component.scss'
})
export class CreateBookingComponent implements OnInit {
  apiService = inject(ApiService);
  dialogRef = inject(MatDialogRef<CreateBookingComponent>);
  fb = inject(FormBuilder);
  datePipe = inject(DatePipe);
  data = inject(MAT_DIALOG_DATA);
  bookingTable!: BookingTable;
  bookingForm!: FormGroup;
  today: string | null = null;

  ngOnInit(): void {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.bookingForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      birthday: ['', Validators.required],
      document: ['', [Validators.required, this.documentAlreadyExistsValidator(this.data)]],
      departure_date: ['', Validators.required],
      departure_iata: ['', Validators.required],
      arrival_iata: ['', Validators.required],
      arrival_date: ['', Validators.required],
    });
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
            icon: 'success',
            title: 'Sucess',
            text: 'Booking successfully made',
          }).then((result) => {
            if (result.isConfirmed) {
              ;
              this.dialogRef.close(true);
            }
          });
        }),
        catchError((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erro!',
            text: `${error.error.message}`,
          })
          return ''
        })
      ).subscribe();
    }
  }

  clearForm(): void {
    this.bookingForm.reset();
  }
}
