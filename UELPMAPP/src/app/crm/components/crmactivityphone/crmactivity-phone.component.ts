import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CRMService } from '../../services/crm.service';
import { ContactDTO } from '../../models/ContactDTO';
import { Observable } from 'rxjs';
import { Currency, LeadsName, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatSnackBar } from '@angular/material';
import { MaritalStatus } from '../../models/MaritalStatus';
import { NgbDatepickerConfig, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { AccountsDomainItem } from '../../models/AccountsDTO';
import { P } from '@angular/core/src/render3';
import { MarketingList } from '../../models/crm.models';
import { ContactGroups, ListIds } from '../../models/LeadsDTO';
import { ActivityDTO } from '../../models/ActivityDTO';
import { DomainItems, MyDomainItem } from '../../models/DomainItem';
import { MyDomainItems } from '../../models/DomainItems';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-crmactivity-phone',
  templateUrl: './crmactivity-phone.component.html',
  styleUrls: ['./crmactivity-phone.component.css']
})
export class CrmactivityPhoneComponent implements OnInit {
  private result;
  userDetails: UserDetails = null;
  ReturnLink:string;
  FormMode: string;
  ActivityId:number;
  ActivityType:string;
  ReturnEntityId:number;
  @BlockUI() blockUI: NgBlockUI;
  StartDate:string;
  StartDateD:Date;

  EndDate:string;
  EndDateD:Date;

  DueDate:string;
  DueDateD:Date;

  StartTime:string;
  EndTime:string;
  DueTime:string;


  ActivityCallToItems:MyDomainItems[];

  hideInput?: boolean = null;
  IsClose:boolean=false;
  isAddMode: boolean = true;
  isEditMode: boolean = false;
  UserId:number;
  UserName:string;
  showLoadingIcon: boolean = false;
  ActivityForm: FormGroup;
  AtivityInfo : ActivityDTO;
  rightsection: boolean = false;
  MyStartDate:Date = new Date();
  formError: string;
  constructor(
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private formBuilderObj: FormBuilder,
    private CRMService: CRMService,
    private sessionService: SessionStorageService,
    public snackBar: MatSnackBar,
    private datePipe: DatePipe,
    //config: NgbDatepickerConfig,
        ) 
        {
          
          this.userDetails = <UserDetails>this.sessionService.getUser();
          this.UserName=this.userDetails.FullName;
          //config.maxDate = { "year": 2018, "month": 7, "day": 4} ;
         }
  transform(value) {
  return this.sanitizer.bypassSecurityTrustHtml(value);
}
  //#region  Form Functions
  IntialForm()
  {
      this.ActivityForm = this.formBuilderObj.group({
          'ActivityId':[0],
          'ActivityId_FK':[0],
          'ActivityTypeId': [0],
          'ActivitySubject': [null, [Validators.required]],
          'ActivityDesc': [''],
          'RegardingId':[null, [Validators.required]],
          'RegarId':[null, [Validators.required]],
          'PriorityId':[0],
          'ActivityActionID':[0],
          'LeadID':[0],
          'OppID':[0],
          'QuoteID':[0],
          'AccountId':[0],
          'ContactID':[0],
          'StartDate': [null, [Validators.required]],
          'EndDate': [null, [Validators.required]],
          'DueDate': [null, [Validators.required]],
          'StartTime': [null, [Validators.required]],
          'EndTime': [null, [Validators.required]],
          'DueTime': [null, [Validators.required]],
          'StatReasonId':[0],
          'ActivityStatusId':[0],
          'IsClosed':[0],
          'OwnerId':[0],
          'CreatedById':[0],
          'UpdatedById':[0]

      });

  }
  //#endregion
  timeLine = [{UserId:808, year: '2015', detail: '<p>This is a paragraph.</p>  <p>This is another paragraph.</p>' },
  {UserId:1,year: '2015', detail: 'Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.'},
  {UserId:2,year: '2017', detail: 'Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.'},
  {UserId:2,year: '2018', detail: 'Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.' },
  {UserId:1,year: '2019', detail: 'Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.'}
  
  ]

  ngOnInit() {

    // Create instances of MyClass and add items
    const item1 = new MyDomainItems(5, 'Contact');
    const item2 = new MyDomainItems(8, 'Lead');

    // Create an array to hold the items
    const itemList: MyDomainItems[] = [item1, item2];
    this.ActivityCallToItems = itemList;


    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      if (param.get('mode') != undefined) {
        this.FormMode = param.get('mode');
      }
      if (param.get('Id') != undefined) {
        this.ActivityId = parseInt(param.get('Id'));
      }
      if (param.get('activitytype') != undefined) {
        this.ActivityType = param.get('activitytype');
      }
      if (param.get('return') != undefined) {
        this.ReturnLink = param.get('return');
      }
      //debugger;
      if (param.get('returnid') != undefined) {
        this.ReturnEntityId = parseInt(param.get('returnid'));
      }
    });


    //Initialie Form
    this.IntialForm();
    
    if (this.ActivityId > 0) {
      //debugger;
      //this.GetLeadInfo(this.LeadId)
      this.isEditMode=true;
      this.isAddMode=false
      this.hideInput=true;

      this.GetActivityInfo(this.ActivityId);

    }
    else 
    {
      this.FormMode = "NEW";

      this.isAddMode=true;
      this.isEditMode=false;

    }


  }
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  ClickBack(e)
  {
    //this.router.navigate([`/crm/crmactivities/${this.getRandomInt(100)}`]);
    if(this.ReturnLink=="1")
    {
      this.router.navigate([`/crm/crmactivities/${this.getRandomInt(100)}`]);
    }
    else
    {
      if(this.ReturnEntityId>0)
      {
        this.router.navigate([`/crm/accounts/EDIT/${this.ReturnEntityId}/2`]);  
      }
      else
      {
        this.router.navigate([`/crm/accountslist/${this.getRandomInt(100)}`]);
      }
    }
  }

  ClickNewNote(e)
  {
    //TODO Click New Note
  }
  //#region Functions
  GetActivityInfo(ActivityId:any) {
    //this.blockUI.start("Loading..."); // Start blocking

    this.UserId=this.userDetails.UserID;

    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetActivityById(ActivityId,this.UserId);
    lead.subscribe((ActivityInfoRes) => {
       debugger;
       this.AtivityInfo=ActivityInfoRes;

     
        if (ActivityInfoRes != null) {
          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
          }, 500);
          this.showLoadingIcon = false;

          this.IsClose=this.AtivityInfo.IsClosed;
          //debugger;
          // this.ActivityForm.patchValue({
          //   ActivityId:ActivityInfoRes.ActivityId,
          //   ActivitySubject:ActivityInfoRes.ActivitySubject,
          //   ActivityDesc:ActivityInfoRes.ActiviyDesc,
          // });

          this.ActivityForm.controls['ActivityId'].setValue(ActivityInfoRes.ActivityId);
          this.ActivityForm.controls['ActivitySubject'].setValue(ActivityInfoRes.ActivitySubject);
          this.ActivityForm.controls['ActivityDesc'].setValue(ActivityInfoRes.ActivityDesc);
          
          this.ActivityForm.controls['RegardingId'].setValue(ActivityInfoRes.RegardingId);
          this.ActivityForm.controls['RegarId'].setValue(ActivityInfoRes.RegarId);

          this.ActivityForm.controls['StartDate'].setValue(ActivityInfoRes.StartDate);
          this.ActivityForm.controls['EndDate'].setValue(ActivityInfoRes.EndDate);
          this.ActivityForm.controls['DueDate'].setValue(ActivityInfoRes.DueDate);

          this.ActivityForm.controls['StartTime'].setValue(ActivityInfoRes.StartTime);
          this.ActivityForm.controls['DueTime'].setValue(ActivityInfoRes.DueTime);
          this.ActivityForm.controls['EndTime'].setValue(ActivityInfoRes.EndTime);


          this.StartDate=ActivityInfoRes.StartDate;
          this.EndDate=ActivityInfoRes.EndDate;
          this.DueDate=ActivityInfoRes.DueDate;
         
          debugger;
          //Start Date
          if(this.StartDate!=null)
          {
            if (ActivityInfoRes.StartDate != "1900-01-01") {

              this.StartDateD = new Date(ActivityInfoRes.StartDate);
  
              const StartDateYear = Number(this.datePipe.transform(this.StartDateD, 'yyyy'));
              const StartDateMonth = Number(this.datePipe.transform(this.StartDateD, 'MM'));
              const StartDateDay = Number(this.datePipe.transform(this.StartDateD, 'dd'));
  
              this.ActivityForm.controls.StartDate.setValue({
                year: StartDateYear,
                month: StartDateMonth,
                day: StartDateDay
              });
  
            }
          }


          //End Date
          if(this.EndDate!=null)
          {
            if (ActivityInfoRes.EndDate != "1900-01-01") {

              this.EndDateD=new Date(ActivityInfoRes.EndDate);
              
              const EndDateYear = Number(this.datePipe.transform(this.EndDateD, 'yyyy'));
              const EndDateMonth = Number(this.datePipe.transform(this.EndDateD, 'MM'));
              const EndDateDay = Number(this.datePipe.transform(this.EndDateD, 'dd'));
  
              this.ActivityForm.controls.EndDate.setValue({
                year: EndDateYear,
                month: EndDateMonth,
                day: EndDateDay
              });
            }
          }

          //Due Date
          if(this.DueDate!=null)
          {
            if (ActivityInfoRes.DueDate != "1900-01-01") {

              this.DueDateD=new Date(ActivityInfoRes.DueDate);
              
              const DueDateYear = Number(this.datePipe.transform(this.DueDateD, 'yyyy'));
              const DueDateMonth = Number(this.datePipe.transform(this.DueDateD, 'MM'));
              const DueDateDay = Number(this.datePipe.transform(this.DueDateD, 'dd'));
  
              this.ActivityForm.controls.DueDate.setValue({
                year: DueDateYear,
                month: DueDateMonth,
                day: DueDateDay
              });
            }
          }
         
        }
      
      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
        
      }, 300);
    });
    
  }
  onDatePickerFocus(element: NgbInputDatepicker, event: any) {
    if (!element.isOpen()) {
        element.open();
    }

    // onTimePickerFocus(element: HTMLInputElement, event:any)
    // {

    // }
}
  //#endregion
  OnRegardingChange(e)
  {
    //TODO
    console.log(e.currentTarget.value);
  }
  onSubmit(MyContactForm: any, myPanel, e) {
    debugger;
    if(this.ActivityForm.invalid)
    {
      this.ActivityForm.controls["RegardingId"].setErrors({ required: true });
      this.ActivityForm.controls["RegardingId"].markAsTouched();
      //this.renderer.selectRootElement('#RegardingId').focus();
      //return;
    }  
    this.AtivityInfo= new ActivityDTO();

    this.AtivityInfo.ActivityId=this.ActivityForm.controls['ActivityId'].value;
    this.AtivityInfo.ActivitySubject=this.ActivityForm.controls['ActivitySubject'].value;
    this.AtivityInfo.ActivityDesc=this.ActivityForm.controls['ActivityDesc'].value;
    this.AtivityInfo.RegardingId=this.ActivityForm.controls['RegardingId'].value;
    this.AtivityInfo.RegarId=this.ActivityForm.controls['RegarId'].value;
    this.AtivityInfo.StartDate=this.ActivityForm.controls['StartDate'].value;
    this.AtivityInfo.EndDate=this.ActivityForm.controls['EndDate'].value;
    this.AtivityInfo.DueDate=this.ActivityForm.controls['DueDate'].value;
    this.AtivityInfo.StartTime=this.ActivityForm.controls['StartTime'].value;
    this.AtivityInfo.EndTime=this.ActivityForm.controls['EndTime'].value;
    this.AtivityInfo.DueTime=this.ActivityForm.controls['DueTime'].value;
    this.AtivityInfo.ActivityStatusId=1;


    if (this.FormMode == "NEW") {
        
      this.AtivityInfo.CreatedBy=this.userDetails.UserID;
      this.CreateActivity(this.AtivityInfo,e);
    }
    else {

      this.AtivityInfo.UpdatedBy=this.userDetails.UserID;
      this.UpdateActivity(this.AtivityInfo,e)
    }







    }

    CreateActivity(AtivityInfo: any,e){
      const self = this;
      this.blockUI.start('Creating Contact...'); // Start blocking 
      this.result = this.CRMService.CreateActivity(AtivityInfo).subscribe(
        (data: any) => {
  
          //debugger;
          
          if (data.Status == "SUCCESS") {
            this.ActivityId=data.Data;
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 300);
  
            self.snackBar.open("Activity Created successfully", null, {
              duration: 5000, verticalPosition: 'top',
              horizontalPosition: 'right', panelClass: 'stellify-snackbar',
            });
  
            //this.router.navigate(['/crm/leadlists']);
            //this.router.navigate([`/crm/contacts/${this.FormMode}/${this.ContactId}/2`]);
            //contactslist
           
            //this.router.navigate([`/crm/contactslist/${this.getRandomInt(100)}`]);
            this.ClickBack(e);
          }
          else if(data.Status == "EXISTS")
          {
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 500);
  
            self.snackBar.open(data.Message, null, {
              duration: 5000, verticalPosition: 'top',
              horizontalPosition: 'right', panelClass: 'stellify-snackbar',
            });
          }
          else if (data.Status == "ERROR") {
  
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 500);
  
            self.snackBar.open(data.Message, null, {
              duration: 5000, verticalPosition: 'top',
              horizontalPosition: 'right', panelClass: 'stellify-snackbar',
            });
          }
          else {
  
            setTimeout(() => {
              //this.blockUI.stop(); // Stop blocking
            }, 500);
  
            // self.snackBar.open("Problem in Creating lead please try again", null, {
            //   duration: 5000, verticalPosition: 'top',
            //   horizontalPosition: 'right', panelClass: 'stellify-snackbar',
            // });
          }
        },
        // Errors will call this callback instead:
        err => {
          ////
          if (err.error == "FAIL") {
            //this.formError = err.error.ExceptionMessage;
  
            setTimeout(() => {
              //this.blockUI.stop(); // Stop blocking
            }, 500);
  
            // self.snackBar.open("Problem in Creating lead please try again", null, {
            //   duration: 5000, verticalPosition: 'top',
            //   horizontalPosition: 'right', panelClass: 'stellify-snackbar',
            // });
  
  
          }
          else {
            this.formError = err.statusText;
          }
        });
    }


    UpdateActivity(AtivityInfo: any,e)
    {

    }

  }


