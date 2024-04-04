import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { VALID } from '@angular/forms/src/model';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { AccountsDTO, AccountsDomainItem, IndustryDomainItem } from '../../models/AccountsDTO';
import { SortEvent, TreeNode } from "primeng/api";

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  public selectedItems: any[];
  TotalSelectedContacts: number = 0;
  ContactsListsCols: any[];
  ContactsLists: any[] = [];
  filterMessage: string = "";
  showLeftPanelLoadingIcon: boolean = false;
  ContactsListsPagerConfig: PagerConfig;
  TotalRecords: number = 0;
  @BlockUI() blockUI: NgBlockUI;
  scrollbarOptions: any;
  MyAccountInfo: AccountsDTO;
  UserId: number;
  private result;
  formError: string;
  ReturnLink: string;
  FormMode: string;
  rightsection: boolean = false;
  AccountId: number;
  AccountForm: FormGroup;
  showLoadingIcon: boolean = false;
  MaritalStatusList: Array<MaritalStatus> = [];
  AccountsDomainItemList: Array<AccountsDomainItem> = [];
  IndustryDomainItemList: Array<IndustryDomainItem> = [];
  hideText?: boolean = null;
  hideInput?: boolean = null;
  isAddMode: boolean = true;
  isEditMode: boolean = false;
  AccountInfo: AccountsDTO;
  userDetails: UserDetails = null;
  minDate: moment.Moment;
  maxDate: moment.Moment;
  SelectedContacts: string = '';

  DateOfBirth: string;
  AnniversaryDate: string;

  DateOfBirthD: Date;
  AnniversaryDateD: Date;

  DateOfBirthJSON: string;
  AnniversaryDateJSON: string;

  MyMinDate: Date;
  MyMaxDate: Date;
  currentYear = moment().year();
  //Disable only past dates
  // myDateFilter = (m: moment.Moment | null): boolean => {
  //   const year = (m || moment()).year();
  //   return year >= this.currentYear -1;
  // } 

  firstDate: string = "";
  lastDate: string = "";

  FromDateStr: string;
  ToDateStr: string;
  currentPage: number = 1;
  currentDate: string;
  priorDate: Date;
  todayDate = new Date();
  //Disable only future dates
  // myDateFilter = (m: moment.Moment | null): boolean => {
  //   const year = (m || moment()).year();
  //   return year <= this.currentYear + 1;
  // } 



  constructor(private router: Router,
    private renderer: Renderer2,
    public activatedRoute: ActivatedRoute,
    private formBuilderObj: FormBuilder,
    private CRMService: CRMService,
    private sessionService: SessionStorageService,
    public snackBar: MatSnackBar,
    private datePipe: DatePipe,
    //config: NgbDatepickerConfig,
  ) {

    this.userDetails = <UserDetails>this.sessionService.getUser();
    //config.maxDate = { "year": 2018, "month": 7, "day": 4} ;
  }

  ResetPagerConfig() {
    this.ContactsListsPagerConfig.RecordsToSkip = 0;
    this.ContactsListsPagerConfig.RecordsToFetch = 25;

    this.currentPage = 1;
  }
  ngOnInit() {
    this.ContactsListsPagerConfig = new PagerConfig();
    // const currentYear = moment().year();
    // this.minDate = moment([currentYear - 1, 0, 1]);
    // this.maxDate = moment([currentYear + 1, 12, 31]);

    //this.SetDates();

    this.GetIndustryDomainItem();
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      if (param.get('mode') != undefined) {
        this.FormMode = param.get('mode');
      }
      if (param.get('Id') != undefined) {
        this.AccountId = parseInt(param.get('Id'));
      }
      if (param.get('return') != undefined) {
        this.ReturnLink = param.get('return');
      }
      //alert(" Purchase Order Creation \n  Purchase Order ID : " + this.pPurchaseOrderId + "\n Purchase Order Type : " + this.pPurchaseOrderTypeId + "\n Supplier Id: " + this.SupplierID);
      this.IntialForm();

      //this.GetAccountsDomainItem();
      if (this.AccountId > 0) {
        //debugger;
        //this.GetLeadInfo(this.LeadId)
        this.isEditMode = true;
        this.isAddMode = false
        this.hideInput = true;
        this.GetAccountInfo(this.AccountId);

      }
      else {
        this.FormMode = "NEW";

        this.isAddMode = true;
        this.isEditMode = false;
        this.hideInput = true;
      }



    });
  }

  IntialForm() {
    this.AccountForm = this.formBuilderObj.group({
      'Id': [0],
      'AcctNo': [''],
      'AccountName': [null,[Validators.required]],
      'MainPhone': [''],
      'OtherPhone': [''],
      'Mobile': [''],
      'EmailId': [''],
      'IndsId':[0],
      'NoOfEmployees':[''],
      'Website':[''],
    });

  }

  GetIndustryDomainItem() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetIndustryDomainItem();
    lead.subscribe((IndustryDomainItems) => {
      //debugger;
      if (IndustryDomainItems != null) {
        this.IndustryDomainItemList = IndustryDomainItems;
        this.showLoadingIcon=false;
      }

    });
  }
  OnIndustryChange(e)
  {
    console.log(e);
  }
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  ClickBack(e) {
    this.router.navigate([`/crm/accountslist/${this.getRandomInt(100)}`]);
    if (this.ReturnLink == "1") {
      this.router.navigate([`/crm/accountslist/${this.getRandomInt(100)}`]);
    }
    else {
      this.router.navigate([`/crm/accountslist/${this.getRandomInt(100)}`]);
    }
  }

  editRecord() {

    //setting this variable to false so as to show the category details in edit mod
    this.hideText = false;
    this.hideInput = true;
    this.isAddMode = false;
    this.isEditMode = true;
  }

  saveRecord(e) {

  }

  cancelRecord(e) {
    //crm/accountslist/20
    this.ClickBack(e);
  }
  GetAccountsDomainItem() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetAccountsDomainItem();
    lead.subscribe((AccountsDomainItemLists) => {
      //debugger;
      if (AccountsDomainItemLists != null) {
        this.AccountsDomainItemList = AccountsDomainItemLists;
        this.showLoadingIcon = false;
      }

      // setTimeout(() => {
      //   //this.blockUI.stop(); // Stop blocking
      // }, 500);
    });
  }
  GetContactByAccountId(AccountId: any) {

    this.showLeftPanelLoadingIcon = true;
    this.CRMService.GetContactsByAccountId(AccountId)
      .subscribe((data: any) => {
        debugger;
        //myPanel.expanded = true; 
        this.showLeftPanelLoadingIcon = false;
        this.TotalRecords = data.TotalRecords;
        debugger;
        if (data.TotalRecords > 0) {
          this.TotalRecords = data.TotalRecords;
          this.ContactsLists = data.Contacts;
          //this.ContactsListsPagerConfig.TotalRecords = data.TotalRecords;

        }
        else {
          this.TotalRecords = data.TotalRecords;
          this.ContactsLists = data.Contacts;
          //this.ContactsListsPagerConfig.TotalRecords = data.TotalRecords;
          this.filterMessage = "No matching records are found";
        }
      }, (error) => {
        this.showLeftPanelLoadingIcon = false;
      });
  }

  GetAccountInfo(AccountId: any) {
    //this.blockUI.start("Loading..."); // Start blocking

    this.UserId = this.userDetails.UserID;

    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetAccountById(AccountId, this.UserId);
    lead.subscribe((AccountInfoRes) => {
      debugger;
      this.AccountInfo = AccountInfoRes;


      this.GetContactByAccountId(this.AccountId);
      if (AccountInfoRes != null) {
        setTimeout(() => {
          //this.blockUI.stop(); // Stop blocking
        }, 500);
        this.showLoadingIcon = false;

        // ExpectedDeliveryDate: new Date(response.ExpectedDeliveryDate),

        // this.LeadTopic=LeadInfoRes.Topic;
        debugger;
        this.AccountForm.controls["Id"].setValue(AccountInfoRes.Id);
        this.AccountForm.controls["AccountName"].setValue(AccountInfoRes.AccountName);
        this.AccountForm.controls["MainPhone"].setValue(AccountInfoRes.MainPhone);
        this.AccountForm.controls["OtherPhone"].setValue(AccountInfoRes.OtherPhone);
        this.AccountForm.controls["Mobile"].setValue(AccountInfoRes.Mobile);
        this.AccountForm.controls["EmailId"].setValue(AccountInfoRes.EmailId);

        this.AccountForm.controls["IndsId"].setValue(AccountInfoRes.IndsId);

        this.AccountForm.controls["NoOfEmployees"].setValue(AccountInfoRes.NoOfEmployees);
        this.AccountForm.controls["Website"].setValue(AccountInfoRes.Website);

        // this.AccountForm.controls["JobTitle"].setValue(ContactInfoRes.JobTitle);
        // this.AccountForm.controls["BusinessPhone"].setValue(ContactInfoRes.BusinessPhone);

        // this.AccountForm.controls["Mobile"].setValue(ContactInfoRes.Mobile);
        // this.AccountForm.controls["EmailId"].setValue(ContactInfoRes.EmailId);
        // this.AccountForm.controls["MaritalStatusId"].setValue(ContactInfoRes.MaritalStatusId);

        // this.AccountForm.controls["AnniversaryDate"].setValue(new Date(ContactInfoRes.AnniversaryDate));
        // this.AccountForm.controls["DateOfBirth"].setValue(new Date(ContactInfoRes.DateOfBirth));
        // this.AccountForm.controls["GenderId"].setValue(ContactInfoRes.GenderId);


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
  }
  onSubmit(MyAccountForm: any, myPanel, e) {

    //debugger;
    this.MyAccountInfo = new AccountsDTO();
    this.MyAccountInfo.Id = this.AccountId;
    this.MyAccountInfo.AcctNo = MyAccountForm.AcctNo;
    this.MyAccountInfo.AccountName = MyAccountForm.AccountName;
    this.MyAccountInfo.MainPhone = MyAccountForm.MainPhone;
    this.MyAccountInfo.OtherPhone = MyAccountForm.OtherPhone;
    this.MyAccountInfo.Mobile = MyAccountForm.Mobile;
    this.MyAccountInfo.EmailId = MyAccountForm.EmailId;

    this.MyAccountInfo.IndsId = MyAccountForm.IndsId;
    this.MyAccountInfo.NoOfEmployees = MyAccountForm.NoOfEmployees;
    this.MyAccountInfo.Website = MyAccountForm.Website;

    this.MyAccountInfo.CreatedBy=this.userDetails.UserID;
    this.MyAccountInfo.UpdatedBy=this.userDetails.UserID;
    this.MyAccountInfo.UserId=this.userDetails.UserID;

    // this.MyContactInfo.UpdatedBy =this.UserId;
    // this.MyContactInfo.CreatedBy = this.UserId;
    debugger;
    if(this.AccountForm.invalid)
    {
      if(MyAccountForm.AccountName == null){
        this.AccountForm.controls["AccountName"].setErrors({required: true});
        this.AccountForm.controls["AccountName"].markAsTouched();
        this.renderer.selectRootElement('#AccountName').focus();
        return;
      }
    }

  
    if (this.AccountForm.valid) {

      debugger;
      if (this.FormMode == "NEW") {

        this.MyAccountInfo.CreatedBy = this.userDetails.UserID;
        this.CreateAccount(this.MyAccountInfo, e);
      }
      else {

        this.MyAccountInfo.UpdatedBy = this.userDetails.UserID;
        this.UpdateAccount(this.MyAccountInfo, e)
      }



    }
    else {
      myPanel.expanded = true;
    }
  }
  ClickNewContact(e) {
    this.router.navigate([`/crm/contacts/${'NEW'}/${0}/2/${this.AccountId}`]);
  }

  CliekEditContact(e) {
    this.router.navigate([`/crm/contacts/${'EDIT'}/${10}/2`]);
  }
  EditContact(contactid) {
    this.router.navigate([`/crm/contacts/${'EDIT'}/${contactid}/2/${this.AccountId}`]);
  }

  CreateAccount(Account: any, e) {
    const self = this;
    this.blockUI.start('Creating Account...'); // Start blocking 


    Account.CreatedBy = this.userDetails.UserID;
    Account.UserID=this.userDetails.UserID;


    this.result = this.CRMService.CreateAccount(Account).subscribe(
      (data: any) => {

        debugger;

        if (data.Status == "SUCCESS") {
          this.AccountId = data.Data;
          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Account Created successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });


          //this.router.navigate([`/crm/accountslist/${this.getRandomInt(100)}`]);
          this.ClickBack(e);
        }
        else if (data.Status == "EXISTS") {
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
  UpdateAccount(Account: any, e) {
    const self = this;
    this.blockUI.start('Updating Account...'); // Start blocking 
    // CreatedBy: {
    //   UserID: this.userDetails.UserID,
    //   UserName: this.userDetails.UserName
    // },
    // UpdatedBy: {
    //   UserID: this.userDetails.UserID,
    //   UserName: this.userDetails.UserName
    // },

    Account.UpdatedBy = this.userDetails.UserID;
    Account.UserID=this.userDetails.UserID;

    this.result = this.CRMService.UpdateAccount(Account).subscribe(
      (data: any) => {
        debugger;
        if (data.Status == "SUCCESS") {

          this.blockUI.stop(); // Stop blocking
          // setTimeout(() => {
          //   this.blockUI.stop(); // Stop blocking
          // }, 300);

          self.snackBar.open("Account updated successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          //this.router.navigate(['/crm/leads/`{0}`']);
          //this.router.navigate([`/crm/contacts/${this.FormMode}/${this.ContactId}/2`]);

          //this.router.navigate([`/crm/contactslist/${this.getRandomInt(100)}`]);
          this.ClickBack(e);
        }
        else if (data.Status == "FAIL") {

          debugger;
          this.blockUI.stop(); // Stop blocking
          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open(data.Message, null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }
        else if (data.Status == "ERROR") {

          this.blockUI.stop(); // Stop blocking
          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open(data.Message, null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }
        else if(data.Status=="EXISTS")
        {
          this.blockUI.stop(); // Stop blocking
          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open(data.Message, null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }
        else {
          this.blockUI.stop(); // Stop blocking
          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open("Problem in Updating Account please try again", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }
      },
      // Errors will call this callback instead:
      err => {
        ////
        debugger;
        this.blockUI.stop(); // Stop blocking
        if (err.error == "FAIL") {
          //this.formError = err.error.ExceptionMessage;

          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open("Problem in updateing lead please try again", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });


        }
        else {
          this.formError = err.statusText;
        }
      });
  }

  customSort(event: SortEvent) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      let result = null;
      if (value1 == null && value2 != null)
        result = -1;
      else if (value1 != null && value2 == null)
        result = 1;
      else if (value1 == null && value2 == null)
        result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

      return (event.order * result);
    });
  }


  sortTableData(event) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      let result = null;
      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

      return event.order * result;
    });
  }
  onRowUnselect(event) {
    let i = 0;
    this.SelectedContacts = "";
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
      if (this.SelectedContacts == "") {
        this.SelectedContacts = this.selectedItems[i].Id;
      }
      else {
        this.SelectedContacts = this.SelectedContacts + "," + this.selectedItems[i].Id;
      }
    }
    this.TotalSelectedContacts = this.selectedItems.length;
    if (this.TotalSelectedContacts == 0) {
      this.SelectedContacts = "";
    }
    //alert("Un Selected Leads : " + this.SelectedContacts + "\n Total Un Selected Leads : " + this.TotalSelectedContacts);
  }

  onRowSelect(event) {
    let i = 0;
    this.SelectedContacts = "";
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
      if (this.SelectedContacts == "") {
        this.SelectedContacts = this.selectedItems[i].Id;
      }
      else {
        this.SelectedContacts = this.SelectedContacts + "," + this.selectedItems[i].Id;
      }
    }
    this.TotalSelectedContacts = this.selectedItems.length;
    //alert("Selected Leads : " + this.SelectedContacts + "\n Total Selected Leads : " + this.TotalSelectedContacts);
  }
}
