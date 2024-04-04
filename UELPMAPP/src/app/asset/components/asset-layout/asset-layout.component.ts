import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-asset-layout',
  templateUrl: './asset-layout.component.html',
  styleUrls: ['./asset-layout.component.css']
})
export class AssetLayoutComponent implements OnInit {

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
