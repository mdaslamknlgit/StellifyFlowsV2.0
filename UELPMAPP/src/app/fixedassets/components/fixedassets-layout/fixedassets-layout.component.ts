import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fixedassets-layout',
  templateUrl: './fixedassets-layout.component.html',
  styleUrls: ['./fixedassets-layout.component.css']
})
export class FixedassetsLayoutComponent implements OnInit {
  showMenu : boolean = false; 
  mainData : boolean = false;
  constructor() { }
  ngOnInit() {

  }
  onMenuClick(eventArgs) {      
    this.showMenu = !this.showMenu;      
   } 
}
