import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit {
  hidetext: boolean=true;
  hideinput: boolean=false;
  savedsucess: boolean=false;
  hidealert:boolean=false;
  leftsection:boolean=false;
  rightsection:boolean=false;
  signupForm: FormGroup;
  scrollbarOptions:any;  
  @ViewChild('rightPanel') rightPanelRef;
  users =  
 [
    {
    sno: '1',
    servicetype: '12323155553',
    description: 'service1',
    cost: '$210'
    },
    {
        sno: '2',
        servicetype: '12323155554',
        description: 'service2',
        cost: '$220'
    },
    {
        sno: '3',
        servicetype: '123231555535',
        description: 'service3',
        cost: '$230'
    },
    {
        sno: '4',
        servicetype: '12323155556',
        description: 'service4',
        cost: '$240'
    },
  ]
    constructor() { }
  
    ngOnInit() {
      this.signupForm = new FormGroup({
        'name': new FormControl(null, [Validators.required]),
        'orderlevel': new FormControl(null, [Validators.required]),
        'alertqty': new FormControl(null, [Validators.required]),
        'startdate': new FormControl(null, [Validators.required]),     
        'enddate': new FormControl(null, [Validators.required]),


    });
    }

    showFullScreen(){
      FullScreen(this.rightPanelRef.nativeElement);
  }

    deleteRow (index:number) {
      this.users.splice(index, 1); //replace your Model here instead of this.user
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
