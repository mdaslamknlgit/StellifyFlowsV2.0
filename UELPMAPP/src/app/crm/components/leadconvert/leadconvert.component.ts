import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-leadconvert',
  templateUrl: './leadconvert.component.html',
  styleUrls: ['./leadconvert.component.css']
})
export class LeadconvertComponent implements OnInit {
  LeadQualifyForm: FormGroup;
  HeaderTitle:string;
  hideInput:boolean=false;


  constructor(
    public dialogRef: MatDialogRef<LeadconvertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
  ) { }
  IntializeLeadQualifyForm()
  {
    this.LeadQualifyForm = this.fb.group({
      LeadId:[0],
      ContactId: [0],
      ContactName: [''],
      CreateNewContact:[1, [Validators.required]],
      AccountExists:[1],
      ContactExists:[1],
      AccountId: [0],
      AccountName: [''],
      CreateNewAccount:[1, [Validators.required]], 
      CreateOpportunity:[1, [Validators.required]],
      DontCreateOpportunity:[false, [Validators.required]],
      OpportunityId: [0],
      OpportunityName: ['',[Validators.required]],
      TotalAmount:[null,[Validators.required]],
      UpfrontOrAdvance:[null,[Validators.required]],
      PoNumber:[0,[Validators.required]],
      Balance:[0],
      Remarks:[null]
    });
  }
  ngOnInit() {
    debugger;
    this.IntializeLeadQualifyForm();
  }
  onNoClick(e): void {

    this.data.SaveClick = "NO";
    this.dialogRef.close();
  }
  private markAsDirty(group: FormGroup): void {
    group.markAsDirty();
    // tslint:disable-next-line:forin
    for (const i in group.controls) {
      console.log(i);
      group.controls[i].markAsDirty();
      group.controls[i].markAsTouched();
    }
  }

  SaveClick(e)
  {
    //TODO
  }
  onConvertNewSubmit(NewConvertForm,e)
  {
    debugger;
    if(this.LeadQualifyForm.invalid)
    {

      this.markAsDirty(this.LeadQualifyForm);
      // if (NewConvertForm.TotalAmount == null) {
      //   this.data.LeadQualifyForm.controls["TotalAmount"].setErrors({ required: true });
      //   this.data.LeadQualifyForm.controls["TotalAmount"].markAsTouched();
      //   //this.data.LeadQualifyForm.selectRootElement('#TotalAmount').focus();
      //   //return;
      // }

      this.data.SaveClick = "NO";
      //return;
      
    }
  }




}
