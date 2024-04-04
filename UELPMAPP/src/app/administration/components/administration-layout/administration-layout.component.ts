import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-administration-layout',
  templateUrl: './administration-layout.component.html',
  styleUrls: ['./administration-layout.component.css']
})
export class AdministrationLayoutComponent implements OnInit {
title = 'app';
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
