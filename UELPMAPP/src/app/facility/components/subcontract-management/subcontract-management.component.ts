import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-subcontract-management',
  templateUrl: './subcontract-management.component.html',
  styleUrls: ['./subcontract-management.component.css']
})
export class SubcontractManagementComponent implements OnInit {

 hidetext: boolean=true;
hideinput: boolean=false;
savedsucess: boolean=false;
hidealert:boolean=false;
leftsection:boolean=false;
rightsection:boolean=false;
signupForm: FormGroup;
scrollbarOptions:any;
  constructor() { }

    ngOnInit() { 
        this.signupForm = new FormGroup({
            'name': new FormControl(null, [Validators.required]),
            'lastname': new FormControl(null, [Validators.required]),
            'category': new FormControl(null, [Validators.required]),
            'type': new FormControl(null, [Validators.required]),
            'itemprice': new FormControl(null, [Validators.required]),
            //'itemprice': new FormControl(null, [Validators.required, Validators.email]),
            'status': new FormControl(null, [Validators.required]),
            'manufacturer': new FormControl(null, [Validators.required]),
            'brand': new FormControl(null, [Validators.required]),
            'openingstock': new FormControl(null, [Validators.required]),
            'uom': new FormControl(null, [Validators.required]),
            'orderlevel': new FormControl(null, [Validators.required]),
            'alertqty': new FormControl(null, [Validators.required]),            

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

closewindow(){ 
 this.savedsucess=false;
}
cancledata(){ 
this.hidetext=true;
this.hideinput=false;
}
splite(){ 
this.leftsection= !this.leftsection;
this.rightsection= !this.rightsection;
}
}
