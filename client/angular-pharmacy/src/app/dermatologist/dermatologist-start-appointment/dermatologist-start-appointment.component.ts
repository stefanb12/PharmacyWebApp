import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatAccordion} from '@angular/material/expansion';
import { MatSelectionListChange } from '@angular/material/list';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MedicineSpecificationModalDialogComponent } from './medicine-specification-modal-dialog/medicine-specification-modal-dialog.component';
import { Patient } from '../../models/patient.model';
import { Appointment } from '../../models/appointment.model';
import { AppointmentService } from '../../services/schedule/appointment.service';
import { AuthenticationService } from '../../services/users/authentication.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MedicineService } from '../../services/medicines/medicine.service';
import { SubscriptionMedicinesModalDialogComponent } from './subscription-medicines-modal-dialog/subscription-medicines-modal-dialog.component';
import { Medicine } from '../../models/medicine.model';
import { PrescriptionService } from '../../services/medicines/prescription.service';

export interface ModalDialogData {
  madicine: Medicine;
  therapyDay: number;
}

@Component({
  selector: 'app-dermatologist-start-appointment',
  templateUrl: './dermatologist-start-appointment.component.html',
  styleUrls: ['./dermatologist-start-appointment.component.scss']
})

export class DermatologistStartAppointmentComponent implements OnInit {
    @ViewChild('searchInput') searchInput: ElementRef;
    @ViewChild(MatAccordion) accordion: MatAccordion;
    isLinear = false;
    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;
    thirdFormGroup: FormGroup;
    fourthFormGroup: FormGroup;
    
    public patientFlag: Boolean = false;
    public patientAppointments : Appointment[] = [];
    public selectedAppointment : Appointment;
    public medicinesForPharmacy : Medicine[] = [];
    public therapyDay : number;
    public selectedMedicine : Medicine;
    public medicineForPrescription : Medicine;
    
    displayedColumns: string[] = ['name', 'manufacturer', 'type', 'specification', 'prescribe'];
    dataSource = new MatTableDataSource<Medicine>(this.medicinesForPharmacy);

    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'top';

    constructor(private appointmentService : AppointmentService, private authenticationService : AuthenticationService, private medicineService : MedicineService,
       private _formBuilder: FormBuilder, public dialog: MatDialog, private snackBar: MatSnackBar, private prescriptionService : PrescriptionService) {}

    ngOnInit() {
        this.firstFormGroup = this._formBuilder.group({
            firstCtrl: ['', Validators.required]
        });
        this.secondFormGroup = this._formBuilder.group({
            secondCtrl: ['', Validators.required]
        });
        this.thirdFormGroup = this._formBuilder.group({
            thirdCtrl: ['', Validators.required]
        });
        this.fourthFormGroup = this._formBuilder.group({
            fourthCtrl: ['', Validators.required]
        });
    }

    onChange(change: MatSelectionListChange) {
        console.log(change.option.value, change.option.selected);
    }

  onChangeAppointment(appointment) {
    this.selectedAppointment = appointment[0];
  }

  firstNextButtonClicked() : void {
    // PREBACI NA DRUGO MESTO
    if (!this.firstFormGroup.valid) {
      this.openSnackBar('Morate selektovati pregled da bi ga započeli!', 'Zatvori', 3000);
    } 
    this.medicineService.getAllMedicinesForPharmacy(this.selectedAppointment.workDay.pharmacy.id).subscribe(
      data => {
        this.medicinesForPharmacy = data;
        this.dataSource.data = this.medicinesForPharmacy;
      },
      error => {
        if (error.status == 404){
          this.patientFlag = false;
          this.openSnackBar('Trenutno nema lekova u apoteci!', 'Zatvori', 3000);
        }
      }
    )
  }

  findPatientAppointments(): void {
    this.patientAppointments = [];
    if(this.searchInput.nativeElement.value == '') {
      this.openSnackBar('Morate popuniti polje za pretragu!', 'Zatvori', 3000);
      this.patientFlag = false;
      return;
    }
    this.appointmentService.getOccupiedAppointmentsByPatientEmail(this.searchInput.nativeElement.value, this.authenticationService.getLoggedUserId().toString()).subscribe(
      data => {
        this.patientAppointments = data;
        this.patientFlag = true;
      },
      error => {
        if (error.status == 400){
          this.patientFlag = false;
          this.openSnackBar('Ne postoji pacijenta sa e-mail adresom koju ste uneli!', 'Zatvori', 3000);
        }
        if (error.status == 404){
          this.patientFlag = false;
          this.openSnackBar('Ne postoje pregledi za pacijenta kog ste pronašli!', 'Zatvori', 3000);
        }
      }
    )
  }

  patientNotHeldOnAppointment() : void {
    if(this.selectedAppointment == null) {
      this.openSnackBar('Morate selektovati pregled pacijenta!', 'Zatvori', 3000);
      return;
    }
    this.appointmentService.patientNotHeldOnAppointment(this.selectedAppointment).subscribe(
      data => {
        this.patientFlag = false;
        this.selectedAppointment = null;
        this.patientAppointments = [];
        this.searchInput.nativeElement.value = '';
        this.openSnackBar('Uspešno ste završili pregled', 'Zatvori', 3000);
      },
      error => {
        if (error.status = 404){
          this.openSnackBar('Neuspešan završetak pregleda!', 'Zatvori', 3000);
        } 
      });
  }

  prescriptMedicine(medicineId : number) : void {  
    this.medicineService.isMedicineAvailable(medicineId.toString(), this.selectedAppointment.workDay.pharmacy.id.toString()).subscribe(
      data => {
        this.selectedMedicine = data;
        this.prescriptionService.savePrescription(this.selectedMedicine.id, this.selectedAppointment.patient.id,
           this.selectedAppointment.workDay.pharmacy.id, this.therapyDay) 
            .subscribe( data => {
              this.openSnackBar('Uspešno ste prepisali lek pacijentu!', 'Zatvori', 3000);
            },
            error => {
              if (error.status == 400){ // Pacijent je alergican na lek
                this.openSubscriptionMedicinesDialog(this.selectedMedicine);
              }
        });
      },
      error => {
        if (error.status = 404){
          // DODATI DA SACUVA U BAYU
          this.openSnackBar('Izabrani lek trenutno nije na stanju u apoteci! Uspešno ste obavestili administratora apoteke!', 'Zatvori', 4000);
        } 
      });
  }

  displayAppointmentRow(appointment : Appointment): string {
    return appointment.workDay.pharmacy.name + ', ' + this.convertDate(appointment.startTime) + ' ' + this.convertTime(appointment.startTime) + ' - ' + this.convertTime(appointment.endTime) + ', '
      + appointment.patient.firstName + ' ' + appointment.patient.lastName + ', ' + appointment.patient.email;
  }

  convertDate(date : Date): string {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate(); 
    return  (day > 9 ? '' : '0') + day + '.' + (month > 9 ? '' : '0') + month + '.' + year + '.';
  }

  convertTime(dateTime : Date): string {
    let d = new Date(dateTime);
    let hours = d.getHours();
    let minutes = d.getMinutes();
    return (hours > 9 ? '' : '0') + hours + ":" + (minutes > 9 ? '' : '0') + minutes;
  }

  openMedicineSpecificationDialog(medicine : Medicine): void {
    const dialogRef = this.dialog.open(MedicineSpecificationModalDialogComponent, {
      panelClass: 'my-centered-dialog',
      width: '400px',
      height: '220px',
      position: {left: '650px'},
      data: { medicine : medicine, therapyDay : this.therapyDay }
    });
    dialogRef.afterClosed().subscribe(result => {
      this.therapyDay = result;
    });
  }

  openSubscriptionMedicinesDialog(selectedMedicine : Medicine): void {
    const dialogRef = this.dialog.open(SubscriptionMedicinesModalDialogComponent, {
      panelClass: 'my-centered-dialog',
      width: '390px',
      height: '350px',
      position: {left: '650px'},
      data: { selectedMedicine : selectedMedicine }
    });
  }

  openSnackBar(message: string, action: string, duration: number) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

}
