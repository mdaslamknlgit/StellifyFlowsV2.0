import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { FullScreen } from '../../../shared/shared';
@Component({
  selector: 'app-vendor-billingentry',
  templateUrl: './vendor-billingentry.component.html',
  styleUrls: ['./vendor-billingentry.component.css']
})
export class VendorBillingentryComponent implements OnInit {
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
showfilters:boolean=false;
    showfilterstext:string="Show List" ;
@ViewChild('rightPanel') rightPanelRef;



  constructor(private modalService: NgbModal) { 
 }
  

  ngOnInit() {
    this.signupForm = new FormGroup({
            'tickettno': new FormControl(null, [Validators.required]),
          
        });
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
split() {
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
