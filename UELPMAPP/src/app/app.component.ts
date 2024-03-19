import { Component } from '@angular/core';
import { NgbTypeaheadConfig } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  constructor(private ngTypeAheadServiceObj:  NgbTypeaheadConfig)
  {
    this.ngTypeAheadServiceObj.editable = false;

  }

}
