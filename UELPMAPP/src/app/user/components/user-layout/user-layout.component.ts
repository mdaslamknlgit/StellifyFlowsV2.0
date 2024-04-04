import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.css']
})
export class UserLayoutComponent implements OnInit {

  showMenu: boolean = false;
  mainData: boolean = false;
  currentYear: any = (new Date()).getFullYear();
  buildVersion: string = '';
  constructor() { }

  ngOnInit() {
    this.buildVersion = environment.buildVersion;
  }
  onMenuClick(eventArgs) {
    this.showMenu = !this.showMenu;
  }
}
