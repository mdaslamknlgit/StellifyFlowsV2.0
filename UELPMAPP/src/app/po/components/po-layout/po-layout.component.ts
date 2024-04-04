import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { SharedService } from "../../../shared/services/shared.service";
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-po-layout',
  templateUrl: './po-layout.component.html',
  styleUrls: ['./po-layout.component.css'],
  providers:[SharedService]
})
export class PoLayoutComponent implements OnInit {

  showMenu : boolean = false; 
  mainData : boolean = false;
  hideAppBar:boolean = false;
  // @ViewChild('cnfDialog')
  // cnfDialog;

  constructor(private sharedServiceObj:SharedService) { 

      this.sharedServiceObj.hideAppBar$.subscribe((hide:boolean)=>{
          this.hideAppBar = hide;
      });
      // this.sharedServiceObj.showFullScreen$.subscribe((hide:boolean)=>{
      //     FullScreen(this.cnfDialog);
      // });
  }
  ngOnInit() {

  }
  onMenuClick(eventArgs){    
   this.showMenu = !this.showMenu;      
  } 
}
