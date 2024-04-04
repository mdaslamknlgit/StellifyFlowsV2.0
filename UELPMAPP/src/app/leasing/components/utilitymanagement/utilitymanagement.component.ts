import { Component, OnInit, ViewChild } from '@angular/core';
import { ValidateFileType,FullScreen } from "../../../shared/shared";

@Component({
  selector: 'app-utilitymanagement',
  templateUrl: './utilitymanagement.component.html',
  styleUrls: ['./utilitymanagement.component.css']
})
export class UtilitymanagementComponent implements OnInit {
  hidetext: boolean=true;
  hideinput: boolean=false;
  savedsucess: boolean=false;
  leftsection:boolean=false;
  rightsection:boolean=false;
  scrollbarOptions:any;
  @ViewChild('rightPanel') rightPanelRef;
    constructor() { }
  
    ngOnInit() {
    }
  editdata(){
  this.hidetext=false;
  this.hideinput=true;
  this.savedsucess=false;
  }
  savedata(){
  this.savedsucess=true;
  this.hidetext=true;
  this.hideinput=false;
  }
  splite(){ 
  this.leftsection= !this.leftsection;
  this.rightsection= !this.rightsection;
  }
  canledata(){ 
  this.hidetext=true;
  this.hideinput=false;
  }
   showFullScreen()
    {
        FullScreen(this.rightPanelRef.nativeElement);
        //  this.hideLeftPanel = true;
        // this.sharedServiceObj.hideAppBar(true);//hiding the app bar..
    }

}
