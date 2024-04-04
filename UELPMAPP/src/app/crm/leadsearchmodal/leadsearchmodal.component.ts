import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Component({
  selector: 'app-leadsearchmodal',
  templateUrl: './leadsearchmodal.component.html',
  styleUrls: ['./leadsearchmodal.component.css']
})
export class LeadsearchmodalComponent implements OnInit {

  form: FormGroup;

  constructor() {
    this.form = new FormGroup({
      $key: new FormControl(null),
      fullName: new FormControl("", Validators.required),
      email: new FormControl("", Validators.email),
      mobile: new FormControl("", [
        Validators.required,
        Validators.minLength(8)
      ]),
      city: new FormControl(""),
      gender: new FormControl("1"),
      department: new FormControl(0),
      hireDate: new FormControl(""),
      isPermanent: new FormControl(false)
    });
  }

  ngOnInit() {
  }

}
