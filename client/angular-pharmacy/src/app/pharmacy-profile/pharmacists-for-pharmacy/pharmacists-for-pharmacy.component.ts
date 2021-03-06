import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Dermatologist } from '../../models/dermatologist.model';
import { Pharmacist } from '../../models/pharmacist.model';
import { Pharmacy } from '../../models/pharmacy.model';
import { PharmacyService } from '../../services/pharmacy/pharmacy.service';
import { AuthenticationService } from '../../services/users/authentication.service';
import { DermatologistService } from '../../services/users/dermatologist.service';
import { PharmacistService } from '../../services/users/pharmacist.service';

@Component({
  selector: 'app-pharmacists-for-pharmacy',
  templateUrl: './pharmacists-for-pharmacy.component.html',
  styleUrls: ['./pharmacists-for-pharmacy.component.scss']
})
export class PharmacistsForPharmacyComponent implements OnInit, AfterViewInit  {

  dataSourceChangeIn = 1;
  searchInputLenght = 0;

  selectedGradeRange = 'Ništa od navedenog';

  public pharmacy: Pharmacy;
  public pharmacistsForPharmacy: Pharmacist[] = [];
  public dermatologistsAfterFilter: Pharmacist[] = [];
  public pharmaciesForDermatologist: Pharmacy[];
  public allPharmacies: Pharmacy[] = [];
  public testPharmacies: string[] = ['Jankovic', 'Zegin', 'asd'];
  public pharmaciesForSending: string[] = [];
  dataSource = new MatTableDataSource(this.pharmacistsForPharmacy);
  dataSourceAfterSearch = new MatTableDataSource(this.pharmacistsForPharmacy);
  public pharmacyName: string;

  gradeRanges: string[] = ['5 - 6', '6 - 7', '7 - 8', '8 - 9', '9 - 10', '10'];

  displayedColumns: string[] = ['name', 'lastname', 'averageGrade', 'pharmacies'];

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  @Input() pharmacyId: number;

  constructor(private snackBar: MatSnackBar, private pharmacistService: PharmacistService, private pharmacyService: PharmacyService, 
              private authService: AuthenticationService, public dialog: MatDialog) { 

  }

  getPharmacistsForPharmacy(id){
    this.pharmacistService.getPharmacistsForPharmacy(id).subscribe(
      data => {
        this.pharmacistsForPharmacy = data;
        this.dataSource.data = this.pharmacistsForPharmacy;
        this.dataSourceAfterSearch.data = this.pharmacistsForPharmacy;
      }
    );
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.pharmacyService.getPharmacyById(this.pharmacyId).subscribe(
      data => {
        this.pharmacy = data;
        this.pharmacyName = this.pharmacy.name;
        console.log(this.pharmacy.id);
        this.getPharmacistsForPharmacy(this.pharmacy.id);
      }
    );

    this.pharmacyService.getAllPharmacies().subscribe(
      data => {
        this.allPharmacies = data;
      }
    );
  }

  applySearch(event: Event) {
    this.dataSource = new MatTableDataSource(this.pharmacistsForPharmacy);
    this.dataSourceChangeIn = 1;
    const filter = (event.target as HTMLInputElement).value
    this.searchInputLenght = filter.length;
    this.dataSource.filter = filter.trim().toLowerCase();
    this.dataSource = new MatTableDataSource(this.dataSource.filteredData);
    this.dataSourceAfterSearch = new MatTableDataSource(this.dataSource.filteredData);
  }

  setFilterPreditct() {
    this.dataSource.filterPredicate = (data, filter: string) => {
      if (this.dataSourceChangeIn == 2) {
        return true;
      } else if (this.dataSourceChangeIn == 3) {
        return data.averageGrade.toString().startsWith(filter);
      }   
    };
  }

  onChangeGradeRangeFilter(value) {

    if (this.searchInputLenght > 0) {
      this.dataSource.filter = this.dataSourceAfterSearch.filter;
      this.setFilterPreditct();
      this.dataSourceChangeIn = 3;
      this.selectedGradeRange = value;

      if (this.selectedGradeRange === undefined) {
        this.dataSource.filter = this.dataSourceAfterSearch.filter;
      } else if (this.selectedGradeRange === '5 - 6') {
        this.dataSource.filter = '5';
      } else if (this.selectedGradeRange === '6 - 7') {
        this.dataSource.filter = '6';
      } else if (this.selectedGradeRange === '7 - 8') {
        this.dataSource.filter = '7';
      } else if (this.selectedGradeRange === '8 - 9') {
        this.dataSource.filter = '8';
      } else if (this.selectedGradeRange === '9 - 10') {
        this.dataSource.filter = '9';
      } else  {
        this.dataSource.filter = '10';
      }
    } else {
      //this.setDefaultValuesForFilter();
      this.openSnackBar('Fltraciju je moguće vršiti samo nakon pretrage!', 'Zatvori');
    }  
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3500,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }

}
