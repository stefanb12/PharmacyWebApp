import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CalendarOptions, EventClickArg, EventApi, EventInput } from '@fullcalendar/angular';
import { Appointment } from '../../models/appointment.model';
import { ResetPassword } from '../../models/reset-password.model';
import { AppointmentService } from '../../services/schedule/appointment.service';
import { AuthenticationService } from '../../services/users/authentication.service';
import { UserService } from '../../services/users/user.service';
import { ChangePasswordModalDialogPharmacistComponent } from './change-password-modal-dialog-pharmacist/change-password-modal-dialog-pharmacist.component';

@Component({
  selector: 'app-pharmacist-work-calendar',
  templateUrl: './pharmacist-work-calendar.component.html',
  styleUrls: ['./pharmacist-work-calendar.component.scss']
})

export class PharmacistWorkCalendarComponent implements OnInit {
  
  //public today = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
  public INITIAL_EVENTS: EventInput[] = [];
  public pharmacistCounselings : Appointment[] = [];
  public selectedAppointment : Appointment;
  public resetPasswordData : ResetPassword;

  constructor(private appointmentService : AppointmentService, private authenticationService : AuthenticationService,
      private userService : UserService, private router : Router, private snackBar: MatSnackBar, public dialog: MatDialog) {
        this.userService.getPasswordResetDataForUser(authenticationService.getLoggedUserId()).subscribe(
          data => {
            this.resetPasswordData = data;
            this.appointmentService.getCounselingsForPharmacistWorkCalendar(authenticationService.getLoggedUserId()).subscribe(
              data => {
                this.pharmacistCounselings = data;
                for(var pharmacistCounseling of this.pharmacistCounselings) {
                  this.INITIAL_EVENTS.push(
                    { 
                      id : pharmacistCounseling.id.toString(),
                      title : pharmacistCounseling.patient.firstName + ' ' + pharmacistCounseling.patient.lastName,
                      start: pharmacistCounseling.startTime,
                      end : pharmacistCounseling.endTime,
                    })
                    this.calendarOptions.events = this.INITIAL_EVENTS;
                }
              }
            );
            if(this.resetPasswordData.passwordReset == false) { // First login
              this.openDialog();
            }
          }
        ); 
  }

  ngOnInit(): void {}

  calendarVisible = true;
  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth dayGridWeek dayGridDay listWeek'
    },
    // customButtons: {
    //   myCustomButton: {
    //     text: 'custom!',
    //     click: function () {
    //       alert('clicked the custom button!');
    //     }
    //   }
    // },
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)
    //select: this.handleDateSelect.bind(this),
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  };

  currentEvents: EventApi[] = [];

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.appointmentService.getAppointmentById(Number(clickInfo.event.id)).subscribe(
      data => {
        this.selectedAppointment = data;
        if(this.selectedAppointment.appointmentState == 0) {
          this.openSnackBar('Savetovanje koje ste izabrali još uvek nije zakazano!', 'Zatvori', 3000);
        } else if(this.selectedAppointment.appointmentState == 1) {
          if (confirm(`Da li ste sigurni da želite da započnete savetovanje za pacijenta ${clickInfo.event.title}`)) {
            this.router.navigate(['/auth/pharmacist/start-appointment'], { queryParams: { appointmentId: clickInfo.event.id } } );
            //clickInfo.event.remove();
          }
        } else if(this.selectedAppointment.appointmentState == 2) {
          this.openSnackBar('Savetovanje koje ste izabrali je završeno ' + this.convertDate(new Date(clickInfo.event.end)), 'Zatvori', 3000);
        } else if(this.selectedAppointment.appointmentState == 3) {
          this.openSnackBar('Pacijent se nije pojavio na savetovanju koje ste izabrali!', 'Zatvori', 3000);
        } else if(this.selectedAppointment.appointmentState == 4) {
          this.openSnackBar('Pacijent je otkazao savetovanje koje ste izabrali!', 'Zatvori', 3000);
        } 
      },
      error => {
        if (error.status == 404){ 
        }
      }
    );   
  }

  // handleDateSelect(selectInfo: DateSelectArg) {
  //   const title = prompt('Please enter a new title for your event');
  //   const calendarApi = selectInfo.view.calendar;

  //   calendarApi.unselect(); // clear date selection

  //   if (title) {
  //     calendarApi.addEvent({
  //       //id: 1,
  //       title,
  //       start: selectInfo.startStr,
  //       end: selectInfo.endStr,
  //       allDay: selectInfo.allDay
  //     });
  //   }
  // }

  convertDate(date : Date): string {
    let d = new Date(date);
    let year = d.getFullYear();
    let month = d.getMonth() + 1;
    let day = d.getDate(); 
    return  (day > 9 ? '' : '0') + day + '.' + (month > 9 ? '' : '0') + month + '.' + year + '.';
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordModalDialogPharmacistComponent,{
      panelClass: 'my-centered-dialog',
      width: '550px',
      height: '365px',
      position: {left: '600px'},
      disableClose: true
    });
  }

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  openSnackBar(message: string, action: string, duration: number) {
    this.snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
  
}