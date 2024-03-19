import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators,FormBuilder } from '@angular/forms';
import { SharedService } from "../../../shared/services/shared.service";
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-approval-limit-profile',
  templateUrl: './approval-limit-profile.component.html',
  styleUrls: ['./approval-limit-profile.component.css']
})
export class ApprovalLimitProfileComponent implements OnInit {

  hidetext: boolean=true;
  hideinput: boolean=false;
  savedsucess: boolean=false;
  leftsection:boolean=false;
  rightsection:boolean=false;
  scrollbarOptions:any;
  approvalLimitProfileForm: FormGroup;

  constructor(private formBuilderObj:FormBuilder,
              private sharedServiceObj:SharedService) { 
    this.approvalLimitProfileForm = this.formBuilderObj.group({
      'ApprovalTypeId': [1, [Validators.required]],
      'Approver': [null,[Validators.required]],
      'ApprovalLowerLimitBudgeted': [0,Validators.required],
      'ApprovalUpperLimitBudgeted': [0,Validators.required],
      'ApprovalLowerLimitNonBudgeted': [0],
      'ApprovalUpperLimitNonBudgeted': [0],
    });  
  }
  userInputFormater = (x: any) => x.CompanyName;

  userSearch = (text$: Observable<string>) =>
      text$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(term =>
              this.sharedServiceObj.getCompaniesbykey(term).pipe(
                  catchError(() => {
                      return of([]);
                  }))
          )
  );

  onApproverChange(event:any)
  {

  }
  onApprovalTypeChange(event:any)
  {


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
    saveRecord()
    {

      
    }
}
