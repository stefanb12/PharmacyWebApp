import { Component, OnInit, Input } from '@angular/core';
import { menus } from './menu-element';
import { dermatologistMenus } from './menu-element-dermatologist';
import { patientMenus } from './menu-element-patient';

@Component({
  selector: 'cdk-sidemenu',
  templateUrl: './sidemenu.component.html',
  styleUrls: ['./sidemenu.component.scss']
})

export class SidemenuComponent implements OnInit {

    @Input() iconOnly:boolean = false;
    
    public menus = menus;
    public patientMenus = patientMenus;
    public dermatologistMenus = dermatologistMenus;
    
    public userRole : String = '';

    constructor() { 
      this.userRole = 'Patient';
    }

    ngOnInit() {
    }

}