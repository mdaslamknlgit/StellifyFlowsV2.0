import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FullScreen } from '../../../shared/shared';
@Component({
  selector: 'app-disposal-approvals',
  templateUrl: './disposal-approvals.component.html',
  styleUrls: ['./disposal-approvals.component.css']
})
export class DisposalApprovalsComponent implements OnInit {
  hidetext: boolean = true;
  hideinput: boolean = false;
  savedsucess: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  htmlContent: string;
  closeResult: string;
  signupForm: FormGroup;
  slideactive: boolean = false;
  billingto: boolean = false;
  scrollbarOptions:any;
  showfilters:boolean=false;
    showfilterstext:string="Show List" ;
    public screenWidth: any;
  @ViewChild('rightPanel') rightPanelRef;


  constructor() { }

  ngOnInit() {
     
      this.screenWidth = window.innerWidth-180;
      
  }

  
showFullScreen(){
  FullScreen(this.rightPanelRef.nativeElement);
}

  editdata() {
    this.hidetext = false;
    this.hideinput = true;
    this.savedsucess = false;
  }
  onClickedOutside(e: Event) {
    this.showfilters= false; 
    if(this.showfilters == false){ 
      this.showfilterstext="Show List"
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

}
