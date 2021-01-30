import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Dermatologist } from "../../models/dermatologist.model";
import { Pharmacy } from "../../models/pharmacy.model";
import { User } from "../../models/user.model";

@Injectable({
    providedIn: 'root'
  })
  export class DermatologistService {
    private readonly dermatologistUrl = 'http://localhost:8081/api/dermatologists/'
  
    constructor(private http: HttpClient) { }
  
  
    public registerDermatologist(user : User): Observable<User> {
        const body = { firstName: user.firstName, lastName: user.lastName, city: user.city, country: user.country,
          street: user.street, email: user.email, password: user.password, phoneNumber: user.phoneNumber, 
        };  
    
        return this.http
        .post<User>(this.dermatologistUrl + 'register', body);
      }

      public getDermatologistById(id: number): Observable<Dermatologist> {
        return this.http
            .get<Dermatologist>(this.dermatologistUrl + 'findById/' + id);
      } 
    
      public updateDermatologist(id: number, dermatologist: Dermatologist): Observable<Dermatologist> {
        const body = { id: id, firstName: dermatologist.firstName, lastName: dermatologist.lastName, city: dermatologist.city, country: dermatologist.country,
                     street: dermatologist.street, email: dermatologist.email, password: dermatologist.password, phoneNumber: dermatologist.phoneNumber
        };
    
        return this.http
            .put<Dermatologist>(this.dermatologistUrl + 'updateProfile/' + id, body);
      }
    
      public getPharmaciesForDermatologist(id: number): Observable<Pharmacy[]> {
        return this.http
            .get<Pharmacy[]>(this.dermatologistUrl + 'pharmaciesForDermatologist/' + id);
      } 
  }
  