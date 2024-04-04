import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-preventive-maintenance',
  templateUrl: './preventive-maintenance.component.html',
  styleUrls: ['./preventive-maintenance.component.css']
})
export class PreventiveMaintenanceComponent implements OnInit {
  scheduleCreationForm : FormGroup;
  scrollbarOptions:any;
  leftsection:boolean=false;
  rightsection:boolean=false;
  constructor(private fb:FormBuilder) { }

  ngOnInit() {
    this.scheduleCreationForm=this.fb.group({
      ScheduleId : 0,
      FacilityId : 0,
      Facility : ['',{validators : [Validators.required]}],
      MaintenanceFrquency : ['',{validators : [Validators.required]}], 
      StartDate : ['',{validators : [Validators.required]}],
      EndDate : ['',{validators : [Validators.required]}],
      Day : '',
      JobDescription : ''
    });
  }

  onDatePickerFocus(element: NgbInputDatepicker) {
    if (!element.isOpen()) {
      element.open();
    }
  }

  onSubmit(){

  }

}
