import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-engineer-ticket-montoring',
  templateUrl: './engineer-ticket-montoring.component.html',
  styleUrls: ['./engineer-ticket-montoring.component.css']
})
export class EngineerTicketMontoringComponent implements OnInit {
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


  constructor(private modalService: NgbModal) { 
 }
open(assignengineer) {
    this.modalService.open(assignengineer, { size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  showFullScreen(){
    FullScreen(this.rightPanelRef.nativeElement);
}

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  ngOnInit() {
    this.signupForm = new FormGroup({
            'tickettno': new FormControl(null, [Validators.required]),
          
        });
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
