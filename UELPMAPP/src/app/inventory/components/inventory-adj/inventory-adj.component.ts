import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-inventory-adj',
  templateUrl: './inventory-adj.component.html',
  styleUrls: ['./inventory-adj.component.css']
})
export class InventoryAdjComponent implements OnInit {
  ContactForm: FormGroup;
  hidetext: boolean = true;
  hideinput: boolean = false;
  savedsucess: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  scrollbarOptions: any;
  @ViewChild('rightPanel') rightPanelRef;



  constructor() { }

  ngOnInit() {
  }

  showFullScreen() {
    FullScreen(this.rightPanelRef.nativeElement);
  }
  editdata() {
    this.hidetext = false;
    this.hideinput = true;
    this.savedsucess = false;
  }
  savedata() {
    this.savedsucess = true;
    this.hidetext = true;
    this.hideinput = false;
  }
  split() {
    this.leftsection = !this.leftsection;
    this.rightsection = !this.rightsection;
  }
  canledata() {
    this.hidetext = true;
    this.hideinput = false;
  }
  onSubmit(MyContactForm: any,e) {
    console.log("Submit");
  }

}