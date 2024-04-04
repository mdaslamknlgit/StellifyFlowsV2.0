import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { FullScreen } from '../../../shared/shared';
@Component({
  selector: 'app-po-vendor',
  templateUrl: './po-vendor.component.html',
  styleUrls: ['./po-vendor.component.css']
})
export class PoVendorComponent implements OnInit {
 hidetext: boolean=true;
hideinput: boolean=false;
savedsucess: boolean=false;
hidealert:boolean=false;
leftsection:boolean=false;
rightsection:boolean=false;
signupForm: FormGroup;
scrollbarOptions:any;
showfilters:boolean=false;
showfilterstext:string="Show List" ;
@ViewChild('rightPanel') rightPanelRef;


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

closewindow(){ 
 this.savedsucess=false;
}
cancledata(){ 
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
 


}
