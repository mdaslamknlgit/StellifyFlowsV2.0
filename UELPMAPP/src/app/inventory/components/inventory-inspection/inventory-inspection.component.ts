import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { FullScreen } from '../../../shared/shared';
@Component({
  selector: 'app-inventory-inspection',
  templateUrl: './inventory-inspection.component.html',
  styleUrls: ['./inventory-inspection.component.css']
})
export class InventoryInspectionComponent implements OnInit {
hidetext: boolean=true;
hideinput: boolean=false;
savedsucess: boolean=false;
leftsection:boolean=false;
rightsection:boolean=false;
htmlContent:string;
closeResult: string;
signupForm: FormGroup;
slideactive:boolean=false;
billingto:boolean=false;
scrollbarOptions:any;
@ViewChild('rightPanel') rightPanelRef;


showFullScreen(){
          FullScreen(this.rightPanelRef.nativeElement);
      }
  constructor(private modalService: NgbModal) { 
 }
 
   
  ngOnInit() {
    this.signupForm = new FormGroup({
            'tickettno': new FormControl(null, [Validators.required]),
          
        });
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
rowhover(){
//this.htmlContent = `<div class='edit-list'><i class="fa fa-plus-circle" aria-hidden="true"></i>  <i class="fa fa-minus-circle" aria-hidden="true"></i></div>`
}
rowhout(){
//this.htmlContent = `<div class='edit-list'>  </div>`
}


matselect(event){ 
 if(event.checked==true){
this.slideactive=true;  
}
else{
   this.slideactive=false;   
}
}

billto(event){ 

 if(event.checked==true){
this.billingto=true;  
}
else{
   this.billingto=false;   
}
}

}
