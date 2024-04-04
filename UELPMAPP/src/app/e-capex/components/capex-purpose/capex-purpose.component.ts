import { Component, OnInit, ViewChild } from '@angular/core';
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-capex-purpose',
  templateUrl: './capex-purpose.component.html',
  styleUrls: ['./capex-purpose.component.css']
})
export class CapexPurposeComponent implements OnInit {

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


showFullScreen()
      {
          FullScreen(this.rightPanelRef.nativeElement);
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
  split(){ 
  this.leftsection= !this.leftsection;
  this.rightsection= !this.rightsection;
  }
  canledata(){ 
  this.hidetext=true;
  this.hideinput=false;
  }

}
