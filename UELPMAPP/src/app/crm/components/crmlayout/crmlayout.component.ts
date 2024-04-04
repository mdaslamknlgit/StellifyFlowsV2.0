import { Component, OnInit } from '@angular/core';
import { SharedService } from "../../../shared/services/shared.service";

@Component({
  selector: 'app-crmlayout',
  templateUrl: './crmlayout.component.html',
  styleUrls: ['./crmlayout.component.css']
})
export class CrmlayoutComponent implements OnInit {

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
