import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-layout',
  templateUrl: './project-layout.component.html',
  styleUrls: ['./project-layout.component.css']
})
export class ProjectLayoutComponent implements OnInit {
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
