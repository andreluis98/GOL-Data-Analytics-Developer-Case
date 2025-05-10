import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BookingTable } from '../../models/booking-table/booking-table.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { catchError, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-create-booking',
  imports: [ReactiveFormsModule],
  templateUrl: './create-booking.component.html',
  styleUrl: './create-booking.component.scss'
})
export class CreateBookingComponent implements OnInit {
  dialogRef = inject(MatDialogRef<CreateBookingComponent>);

  bookingTable!: BookingTable;
  bookingForm!: FormGroup;
  apiService = inject(ApiService);
  fb = inject(FormBuilder);
  datePipe = inject(DatePipe);
  today: string | null = null;
  
  ngOnInit(): void {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  this.bookingForm = this.fb.group({
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        birthday: ['', Validators.required],
        document: ['', Validators.required],
        departure_date: ['', Validators.required],
        departure_iata: ['', Validators.required],
        arrival_iata: ['', Validators.required],
        arrival_date: ['', Validators.required],
      });  
  }

  createBooking(){
    if (this.bookingForm.valid) {
      this.bookingTable = this.bookingForm.value;
      this.apiService.createBooking(this.bookingTable).pipe(
        tap(() => {
          Swal.fire({
            icon: 'success',
            title: 'Sucess',
            text: 'Booking successfully made',
          }).then((result) => {
            if (result.isConfirmed) {;
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
