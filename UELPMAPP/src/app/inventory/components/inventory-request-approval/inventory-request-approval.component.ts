import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-inventory-request-approval',
  templateUrl: './inventory-request-approval.component.html',
  styleUrls: ['./inventory-request-approval.component.css']
})
export class InventoryRequestApprovalComponent implements OnInit {

  showfilters:boolean=true;
  showfilterstext:string="Hide List" ;
hidetext: boolean=true;
hideinput: boolean=false;
savedsucess: boolean=false;
leftsection:boolean=false;
rightsection:boolean=false;
htmlContent:string;
scrollbarOptions:any;
inventoryReqApprovalForm:FormGroup;
@ViewChild('rightPanel') rightPanelRef;


 event: MouseEvent;
    clientX = 0;
    clientY = 0;

  constructor(private formBuilderObj:FormBuilder) { 
   
    this.inventoryReqApprovalForm = this.formBuilderObj.group({
        requestiid:[0],
        location:[null],
        remarks:[""],
        inspectionremarks:[""]
    });
  }

  ngOnInit() {
   
  }

  showFullScreen(){
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
canledata(){ 
this.hidetext=true;
this.hideinput=false;
}
rowhover(){
//this.htmlContent = `<div class='edit-list'><i class="fa fa-plus-circle" aria-hidden="true"></i>  <i class="fa fa-minus-circle" aria-hidden="true"></i></div>`
}
rowhout(){
//this.htmlContent = `<div class='edit-list'>  </div>`
}


onEvent(event: MouseEvent): void {
        this.event = event;
    }
    
coordinates(event: MouseEvent): void {
        this.clientX = event.clientX;
        this.clientY = event.clientY;
    }

    
}
