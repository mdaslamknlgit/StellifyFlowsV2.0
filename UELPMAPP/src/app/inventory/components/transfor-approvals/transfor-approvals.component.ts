import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-transfor-approvals',
  templateUrl: './transfor-approvals.component.html',
  styleUrls: ['./transfor-approvals.component.css']
})
export class TransforApprovalsComponent implements OnInit {
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

  
showFullScreen(){
  FullScreen(this.rightPanelRef.nativeElement);
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
editdata(){
  this.hidetext=false;
  this.hideinput=true;
  this.savedsucess=false;
  }
}
