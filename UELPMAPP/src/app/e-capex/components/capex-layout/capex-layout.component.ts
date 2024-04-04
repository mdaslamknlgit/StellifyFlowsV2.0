import { Component,  OnInit,Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-inventory-layout',
  templateUrl: './capex-layout.component.html',
  styleUrls: ['./capex-layout.component.css']
})
export class CapexLayoutComponent implements OnInit {

  showMenu : boolean = false; 
  mainData : boolean = false;
  

  constructor() { }
 
  ngOnInit() {
  }
 onMenuClick(eventArgs){      
   this.showMenu = !this.showMenu;      
  } 
}
