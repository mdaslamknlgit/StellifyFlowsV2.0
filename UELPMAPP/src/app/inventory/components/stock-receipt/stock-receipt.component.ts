import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-stock-receipt',
  templateUrl: './stock-receipt.component.html',
  styleUrls: ['./stock-receipt.component.css']
})
export class StockReceiptComponent implements OnInit {
  
hidetext: boolean=true;
hideinput: boolean=false;
savedsucess: boolean=false;
leftsection:boolean=false;
rightsection:boolean=false;
htmlContent:string;
scrollbarOptions:any;
 event: MouseEvent;
    clientX = 0;
    clientY = 0;

  constructor() { 
   
  }

  ngOnInit() {
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


onEvent(event: MouseEvent): void {
        this.event = event;
    }
    
coordinates(event: MouseEvent): void {
        this.clientX = event.clientX;
        this.clientY = event.clientY;
    }

}
