import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CRMService } from '../../services/crm.service';
import { ContactDTO } from '../../models/ContactDTO';
import { Observable } from 'rxjs';
import { Currency, LeadsName, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
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
import { ActivityStatusDomainItems } from '../../models/ActivityStatusDomainItems';
import { RegarDomainItems } from '../../models/RegarDomainItems';

@Component({
  selector: 'app-crmactivity-logacall',
  templateUrl: './crmactivity-logacall.component.html',
  styleUrls: ['./crmactivity-logacall.component.css']
})
export class CrmactivityLogACallComponent implements OnInit {
  isDropdownDisabled: boolean = true;
  inputCtrl = new FormControl();
  private result;
  userDetails: UserDetails = null;
  ReturnLink:string;
  FormMode: string;
  TypeId:string;

  ActivityId:number;
  ActivityTypeId:number;
  ActivityTypeName:string;
  TypeName:string;

  ActivityStatusDomainItemsList:ActivityStatusDomainItems[];
  RegarDomainItemsList:RegarDomainItems[];
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

  public mask = {
    guide: true,
    showMask: true,
    mask: [/\d/, /\d/, ':', /\d/, /\d/]
  };
  
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
  ContactData:any;
  RegardingId:number;
  RegarId:number;
  ActivitySubject:string;
  RelatedToDisabled:boolean=true;

  StartDateText:string;
  StartTimeText:string;

  IsHideStartDate:boolean=false;
  IsHideStartTime:boolean=false;

  IsHideEndDate:boolean=false;
  IsHideEndTime:boolean=false;

  IsHideDueDate:boolean=false;
  IsHideDueTime:boolean=false;

  constructor(
    public dialogRef: MatDialogRef<CrmactivityLogACallComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
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
          'Duration': ["10", [Validators.required]],
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

    debugger;
    //Initialie Form
    this.IntialForm();
    if(this.data !=null)
    {
      this.ContactData=this.data.ContactInfo
    }
    this.FormMode = this.data.FormMode;
    this.ActivityId=this.data.ActivityId;
    this.ActivityTypeId=this.data.ActivityTypeId;
    this.ActivityTypeName=this.data.ActivityTypeName;

    this.RegardingId=this.data.RegardingId;
    this.RegarId=this.data.RegarId;

    if(this.ActivityTypeId==1)
    {
      this.TypeName="Schedule a call";

      this.IsHideEndDate=false;
      this.IsHideEndTime=false;
    
      this.IsHideDueDate=false;
      this.IsHideDueTime=false;
    }
    if(this.ActivityTypeId==2)
    {
      this.TypeName="Log a call";
      this.IsHideEndDate=true;
      this.IsHideEndTime=true;
    
      this.IsHideDueDate=true;
      this.IsHideDueTime=true;
    }

    
    // Create instances of MyClass and add items
    const item1 = new MyDomainItems(2, 'Account');
    const item2 = new MyDomainItems(5, 'Contact');
    const item3 = new MyDomainItems(8, 'Lead');
    const item4 = new MyDomainItems(18, 'Deal');

    // Create an array to hold the items
    //const itemList: MyDomainItems[] = [item1, item2,item3];
    const itemList: MyDomainItems[] = [item2,item4];
    this.ActivityCallToItems = itemList;



    debugger;
    //Set The Form Intial Values
    this.ActivityForm.controls['RegardingId'].setValue(this.RegardingId);
    if(this.ContactData !=null)
    {
      this.ActivitySubject ="Outgoing call to " + this.ContactData.FirstName + " " + this.ContactData.LastName;
    }
    else
    {
      this.ActivitySubject ="Outgoing call to " ;
    }
    this.ActivityForm.controls['ActivitySubject'].setValue(this.ActivitySubject);
    
    this.GetContactDomainItems();
    //alert(this.RegardingId +' '+ this.RegarId);
    if (this.data.RegardingId == undefined) {
      this.ActivityForm.controls['RegardingId'].setValue(5);
    }
    else
    {
      this.ActivityForm.controls['RegardingId'].setValue(this.RegardingId);
      this.ActivityForm.controls['RegarId'].setValue(this.RegarId);


    }


    if (this.ActivityId > 0) {
      //debugger;
      //this.GetLeadInfo(this.LeadId)
      this.isEditMode=true;
      this.isAddMode=false
      this.hideInput=true;

      this.FormMode="EDIT";

      this.GetActivityInfo(this.ActivityId);

    }
    else 
    {
      

      this.GetActivityStatusDomainItem();

      this.FormMode = "NEW";

      setTimeout(() => {
        if (this.ActivityTypeId == 1) {
          this.ActivityForm.controls['ActivityStatusId'].setValue(1);
        }
        else {
          this.ActivityForm.controls['ActivityStatusId'].setValue(3);
        }
      }, 300);



      this.isAddMode=true;
      this.isEditMode=false;

      debugger;
      //Start Date
      if(this.StartDate==null)
      {

          this.StartDateD = new Date();

          const StartYear = Number(this.datePipe.transform(this.StartDateD, 'yyyy'));
          const StartMonth = Number(this.datePipe.transform(this.StartDateD, 'MM'));
          const StartDay = Number(this.datePipe.transform(this.StartDateD, 'dd'));

          this.ActivityForm.controls.StartDate.setValue({
            year: StartYear,
            month: StartMonth,
            day: StartDay
          });
      }
      //End Date
      if(this.EndDate==null)
      {

          this.EndDateD = new Date();

          const EndDateYear = Number(this.datePipe.transform(this.EndDateD, 'yyyy'));
          const EndDateMonth = Number(this.datePipe.transform(this.EndDateD, 'MM'));
          const EndDateDay = Number(this.datePipe.transform(this.EndDateD, 'dd'));

          this.ActivityForm.controls.EndDate.setValue({
            year: EndDateYear,
            month: EndDateMonth,
            day: EndDateDay
          });
      }

      //this.datepipe.transform((new Date), 'MM/dd/yyyy h:mm:ss');
      //Start Time
      this.StartTime=this.datePipe.transform(this.StartDateD, 'hh:mm a');
      this.ActivityForm.controls['StartTime'].setValue(this.StartTime);

      //End Time
      this.EndTime=this.datePipe.transform(this.EndDateD, 'hh:mm a');
      this.ActivityForm.controls['EndTime'].setValue(this.EndTime);


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
  OnActivityStatusChange(e)
  {
    //TODO
  }
  GetActivityStatusDomainItem() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let IndustryR = <Observable<any>>this.CRMService.GetActivityStatusDomainItem();
    IndustryR.subscribe((ActivityStatusRes) => {
      //debugger;
      if (ActivityStatusRes != null) {
        this.ActivityStatusDomainItemsList = ActivityStatusRes;
        this.showLoadingIcon = false;
      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
      }, 500);
    });
  }
  GetContactDomainItems() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let IndustryR = <Observable<any>>this.CRMService.GetContactDomainItems();
    IndustryR.subscribe((ContactDomainItemsRes) => {
      //debugger;
      if (ContactDomainItemsRes != null) {
        this.RegarDomainItemsList = ContactDomainItemsRes;
        this.showLoadingIcon = false;
      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
      }, 500);
    });
  }

  GetActivityInfo(ActivityId:any) {
    //this.blockUI.start("Loading..."); // Start blocking

    this.UserId=this.userDetails.UserID;

    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetActivityById(ActivityId,this.UserId);
    lead.subscribe((ActivityInfoRes) => {
       debugger;
       this.AtivityInfo=ActivityInfoRes;

     
        if (ActivityInfoRes != null) {
          this.GetActivityStatusDomainItem();
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
          this.ActivityForm.controls['ActivityStatusId'].setValue(ActivityInfoRes.ActivityStatusId);
          
          this.ActivityForm.controls['RegardingId'].setValue(ActivityInfoRes.RegardingId);
          this.ActivityForm.controls['RegarId'].setValue(ActivityInfoRes.RegarId);

          this.ActivityForm.controls['StartDate'].setValue(ActivityInfoRes.StartDate);
          this.ActivityForm.controls['EndDate'].setValue(ActivityInfoRes.EndDate);
          this.ActivityForm.controls['DueDate'].setValue(ActivityInfoRes.DueDate);

          this.ActivityForm.controls['StartTime'].setValue(ActivityInfoRes.StartTime);
          this.ActivityForm.controls['DueTime'].setValue(ActivityInfoRes.DueTime);
          this.ActivityForm.controls['EndTime'].setValue(ActivityInfoRes.EndTime);

          this.ActivityForm.controls['Duration'].setValue(ActivityInfoRes.Duration);

          this.ActivityForm.controls['RegardingId'].setValue(ActivityInfoRes.RegardingId);
          this.ActivityForm.controls['RegarId'].setValue(ActivityInfoRes.RegarId);


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
    debugger;
    console.log(e.currentTarget.value);
    alert(e.currentTarget.value);
  }
  OnRegarChange(e)
  {
    console.log(e.currentTarget.value);
    this.RegardingId=e.currentTarget.value;
    if(this.RegardingId==5)
    {
      this.GetContactDomainItems();
    }
    else if(this.RegardingId==8)
    {
      //Get From Lead
    }
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

  onSubmit(MyActivityForm: any, myPanel, e) {
    debugger;

    this.ActivityForm.controls['DueDate'].setValue(MyActivityForm.EndDate);
    this.ActivityForm.controls['DueTime'].setValue(MyActivityForm.EndTime);
    //this.ActivityForm.controls['RegarId'].setValue(this.RegarId);
    this.ActivityForm.controls['ActivityTypeId'].setValue(this.ActivityTypeId);
    
    if(this.ActivityForm.invalid)
    {


      this.markAsDirty(this.ActivityForm);
      // if (MyActivityForm.ActivitySubject == null) {
      //   this.ActivityForm.controls["ActivitySubject"].setErrors({ required: true });
      //   this.ActivityForm.controls["ActivitySubject"].markAsTouched();
      //   //this.renderer.selectRootElement('#RegardingId').focus();
      //   //return;
      // }


      // if (MyActivityForm.RegardingId == null) {
      //   this.ActivityForm.controls["RegardingId"].setErrors({ required: true });
      //   this.ActivityForm.controls["RegardingId"].markAsTouched();
      //   //this.renderer.selectRootElement('#RegardingId').focus();
      //   //return;
      // }

      // if (MyActivityForm.Duration == null) {
      //   this.ActivityForm.controls["Duration"].setErrors({ required: true });
      //   this.ActivityForm.controls["Duration"].markAsTouched();
      //   //this.renderer.selectRootElement('#RegardingId').focus();
      //   //return;
      // }
      return;


    }  
    else  if(this.ActivityForm.valid)
    {
      //alert("Valid Form");

    debugger;
    this.AtivityInfo= new ActivityDTO();

    this.AtivityInfo.ActivityId=this.ActivityForm.controls['ActivityId'].value;
    this.AtivityInfo.ActivityTypeId=this.ActivityForm.controls['ActivityTypeId'].value;
    this.AtivityInfo.ActivitySubject=this.ActivityForm.controls['ActivitySubject'].value;
    this.AtivityInfo.ActivityDesc=this.ActivityForm.controls['ActivityDesc'].value;
    this.AtivityInfo.RegardingId=this.ActivityForm.controls['RegardingId'].value;
    this.AtivityInfo.RegarId=this.ActivityForm.controls['RegarId'].value;

    this.AtivityInfo.PriorityId=this.ActivityForm.controls['PriorityId'].value;
    this.AtivityInfo.ContactID=this.ActivityForm.controls['RegarId'].value;

    // this.AtivityInfo.StartDate=this.ActivityForm.controls['StartDate'].value;
    // this.AtivityInfo.EndDate=this.ActivityForm.controls['EndDate'].value;
    // this.AtivityInfo.DueDate=this.ActivityForm.controls['DueDate'].value;

    this.AtivityInfo.StartTime=this.ActivityForm.controls['StartTime'].value;
    this.AtivityInfo.EndTime=this.ActivityForm.controls['EndTime'].value;
    this.AtivityInfo.DueTime=this.ActivityForm.controls['DueTime'].value;

    this.AtivityInfo.Duration=this.ActivityForm.controls['Duration'].value;
    this.AtivityInfo.StatReasonId=1;
    this.AtivityInfo.ActivityStatusId=this.ActivityForm.controls['ActivityStatusId'].value;

    const StartDateateControl =this.ActivityForm.controls["StartDate"];
    const EndDateateControl =this.ActivityForm.controls["EndDate"];
    const DueDateateControl =this.ActivityForm.controls["DueDate"];
    

    //debugger;
    if(StartDateateControl.status=="VALID")
    {
      if(StartDateateControl.value !=null)
      {
        this.StartDate=MyActivityForm.StartDate.year+"-"+MyActivityForm.StartDate.month+"-"+MyActivityForm.StartDate.day;
        this.AtivityInfo.StartDate=this.StartDate;
      }
      else
      {
        this.AtivityInfo.StartDate="";
      }
    }
    if(EndDateateControl.status=="VALID")
    {
      if(EndDateateControl.value !=null)
      {
        this.EndDate=MyActivityForm.EndDate.year+"-"+MyActivityForm.EndDate.month+"-"+MyActivityForm.EndDate.day;
        this.AtivityInfo.EndDate=this.EndDate;
      }
      else
      {
        this.AtivityInfo.EndDate="";
      }
    }
    this.AtivityInfo.StartDate=this.StartDate;
    this.AtivityInfo.EndDate=this.EndDate;
    this.AtivityInfo.DueDate=this.EndDate;

    if (this.FormMode == "NEW") {
        
      this.AtivityInfo.CreatedBy=this.userDetails.UserID;
      this.AtivityInfo.OwnerId=this.userDetails.UserID;
      this.CreateActivity(this.AtivityInfo,e);
    }
    else {

      this.AtivityInfo.UpdatedBy=this.userDetails.UserID;
      this.AtivityInfo.OwnerId=this.userDetails.UserID;
      this.UpdateActivity(this.AtivityInfo,e)
    }


    }
 
  }

  CancelRecord(e)
  {
    this.dialogRef.close();
  }
    CreateActivity(AtivityInfo: any,e){
      const self = this;
      this.blockUI.start('Creating Activity...'); // Start blocking 
      this.result = this.CRMService.CreateActivity(AtivityInfo).subscribe(
        (data: any) => {
  
          debugger;
          
          if (data.Status == "SUCCESS") {
            this.ActivityId=data.Data;
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 300);
  
            self.snackBar.open("Activity Created successfully", null, {
              duration: 5000, verticalPosition: 'top',
              horizontalPosition: 'right', panelClass: 'stellify-snackbar',
            });

            this.dialogRef.close();
  
            //this.router.navigate(['/crm/leadlists']);
            //this.router.navigate([`/crm/contacts/${this.FormMode}/${this.ContactId}/2`]);
            //contactslist
           
            //this.router.navigate([`/crm/contactslist/${this.getRandomInt(100)}`]);
            //this.ClickBack(e);
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


