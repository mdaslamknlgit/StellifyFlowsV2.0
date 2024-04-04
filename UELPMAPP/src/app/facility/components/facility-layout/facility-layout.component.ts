import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-facility-layout',
  templateUrl: './facility-layout.component.html',
  styleUrls: ['./facility-layout.component.css']
})
export class FacilityLayoutComponent implements OnInit {

    showMenu : boolean = false; 
  mainData : boolean = false;
   

  constructor() { }
 
  ngOnInit() {
  }
 onMenuClick(eventArgs){ 
  
    this.showMenu = !this.showMenu;
    this.mainData = !this.mainData;
     
  } 
}
