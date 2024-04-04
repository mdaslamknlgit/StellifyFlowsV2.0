import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-filter-lead',
  templateUrl: './filter-lead.component.html',
  styleUrls: ['./filter-lead.component.css']
})
export class FilterLeadComponent implements OnInit {
  LeadFilterInfoForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    this.LeadFilterInfoForm = this.fb.group({
      Name: [''],
      FromDate: [oneMonthAgo.toISOString().substring(0, 10)],
      ToDate: [today.toISOString().substring(0, 10)]
    });
  }

  onSubmit(): void {
    // Handle form submission here
    const formData = this.LeadFilterInfoForm.value;
    console.log(formData);
  }
  onReset(): void {
    this.LeadFilterInfoForm.reset({
      Name: '',
      FromDate: this.LeadFilterInfoForm.get('FromDate').value,
      ToDate: this.LeadFilterInfoForm.get('ToDate').value
    });
  }
}
