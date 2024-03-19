import { Component, OnInit, ViewChild } from '@angular/core';
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-adjustment-approvals',
  templateUrl: './adjustment-approvals.component.html',
  styleUrls: ['./adjustment-approvals.component.css']
})
export class AdjustmentApprovalsComponent implements OnInit {

hidetext: boolean=true;
hideinput: boolean=false;
savedsucess: boolean=false;
leftsection:boolean=false;
rightsection:boolean=false;
scrollbarOptions:any;
showfilters:boolean=false;
showfilterstext:string="Show List" ;
@ViewChild('rightPanel') rightPanelRef;


constructor() { }

 ngOnInit() {
 }

 
showFullScreen(){
  FullScreen(this.rightPanelRef.nativeElement);
}
 
savedata(){
this.savedsucess=true;
this.hidetext=true;
this.hideinput=false;
}
onClickedOutside(e: Event) {
 // this.showfilters= false; 
  if(this.showfilters == false){ 
   // this.showfilterstext="Show List"
}
}
split(){ 
  this.showfilters=!this.showfilters;
  if(this.showfilters == true){ 
      this.showfilterstext="Hide List" 
  }
      else{
          this.showfilterstext="Show List" 
      }
}
editdata(){
  this.hidetext=false;
  this.hideinput=true;
  this.savedsucess=false;
  }
}
