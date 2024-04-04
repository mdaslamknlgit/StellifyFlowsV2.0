import { AfterViewInit, Component, Inject, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CRMService } from '../../services/crm.service';
import { ContactDTO } from '../../models/ContactDTO';
import { Observable } from 'rxjs';
import { Currency, LeadsName, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { MaritalStatus } from '../../models/MaritalStatus';
import { NgbDatepickerConfig, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { AccountsDomainItem } from '../../models/AccountsDTO';
import { P } from '@angular/core/src/render3';
import { ActivityFilterModel, MarketingList } from '../../models/crm.models';
import { ContactGroups, ListIds } from '../../models/LeadsDTO';
import { CrmactivityLogACallComponent } from '../crmactivitylogacall/crmactivity-logacall.component';
import { CrmactivityComponent } from '../crmactivity/crmactivity.component';
import { ActivityDTO } from '../../models/ActivityDTO';
import { SortEvent } from 'primeng/api';


@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit, OnChanges {
  @ViewChild('NGBAccountId') NGBAccountIdRef;
  public selectedItems: any[];
  SelectedActivities: string = '';
  TotalSelectedActivities: number = 0;
  ExportTotalActivities: boolean = false;

  ContactData: any;
  SelectedAccount: any;
  TotalSelectedConnections: number = 0;
  SelectedListItems: any[] = [];
  SelectedConnectionsIds = [];
  ConnectionsPagerConfig: PagerConfig;
  ConnectionsListsCols: any[];
  ConnectionsLists: MarketingList[] = [];
  FilterConnectionsLists: MarketingList[] = [];
  IsFilterDataArrive: boolean = false;
  TotalRecords: number;
  showLeftPanelLoadingIcon: boolean = false;
  ShowContactGroups: boolean = false;
  IsContactGroupsExpand: boolean = false;
  SelectedConnections: string = '';
  ContactGroupsList: ContactGroups;
  ListIdss: ListIds[] = [];
  ContactIdss: ListIds[] = [];

  LeadListIdss: ListIds[] = [];



  IsExpandPersonalDetails: boolean = true;
  IsExpandActiviesDetails: boolean = true;
  IsExpandLeads: boolean = true;
  IsExpandActivities: boolean = true;
  ContactTypeName: string = "Individual";
  @BlockUI() blockUI: NgBlockUI;
  scrollbarOptions: any;
  MyContactInfo: ContactDTO;
  AccountId: number;
  AccountName: string;
  ContactId: number;
  ContactName: string;
  UserId: number;
  private result;
  formError: string;
  ReturnLink: string;
  FormMode: string;
  ActivityFormMode: string;

  ReturnEntityId: number = 0;
  rightsection: boolean = false;
  RegardingId: number;
  RegarId: number;

  ContactForm: FormGroup;
  AccountForm: FormGroup;
  showLoadingIcon: boolean = false;
  MaritalStatusList: Array<MaritalStatus> = [];
  AccountsDomainItemList: Array<AccountsDomainItem> = [];
  hideText?: boolean = null;
  hideInput?: boolean = null;
  isAddMode: boolean = true;
  ShowAccountDropDown: boolean = true;
  isEditMode: boolean = false;
  ContactInfo: ContactDTO;
  userDetails: UserDetails = null;
  minDate: moment.Moment;
  maxDate: moment.Moment;

  DateOfBirth: string;
  AnniversaryDate: string;

  DateOfBirthD: Date;
  AnniversaryDateD: Date;

  DateOfBirthJSON: string;
  AnniversaryDateJSON: string;
  UserName: string;

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

  currentDate: string;
  priorDate: Date;
  todayDate = new Date();

  HeaderTitle: string;
  //Disable only future dates
  // myDateFilter = (m: moment.Moment | null): boolean => {
  //   const year = (m || moment()).year();
  //   return year <= this.currentYear + 1;
  // } 
  filterMessage: string = "";
  ActivityListsCols: any[];
  ActivityLists: any[] = [];
  FilterActivityLists: ActivityDTO[] = [];
  ExportActivityLists: ActivityDTO[] = [];
  ActivityListsPagerConfig: PagerConfig;
  currentPage: number = 1;
  ModuleId: number;
  FormId: number;
  ViewId: number;
  constructor(
    public DialogAssignTo: MatDialog,
    public dialog: MatDialog,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private formBuilderObj: FormBuilder,
    private CRMService: CRMService,
    private sessionService: SessionStorageService,
    public snackBar: MatSnackBar,
    private datePipe: DatePipe,
    //config: NgbDatepickerConfig,
  ) {

    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.UserName = this.userDetails.FullName;
    //config.maxDate = { "year": 2018, "month": 7, "day": 4} ;
  }
  //**********************************************************************************************************************
  //Set Dates
  //**********************************************************************************************************************
  // SetDates()
  // {
  //   this.firstDate = moment().startOf('month').format('YYYY-MM-DD');
  //   this.currentDate = moment().format('YYYY-MM-DD').toString();
  //   this.priorDate = new Date(new Date().setDate(this.todayDate.getDate() - 30));
  //   this.lastDate = moment().endOf('month').format("YYYY-MM-DD");

  //   const FDate = this.priorDate;
  //   const TDate = new Date(this.currentDate);

  //   const FirstDateYear = Number(this.datePipe.transform(FDate, 'yyyy'));
  //   const FirstDateMonth = Number(this.datePipe.transform(FDate, 'MM'));
  //   const FirstDateDay = Number(this.datePipe.transform(FDate, 'dd'));

  //   const CurrentDateYear = Number(this.datePipe.transform(TDate, 'yyyy'));
  //   const CurrentDateMonth = Number(this.datePipe.transform(TDate, 'MM'));
  //   const CurrentDateDay = Number(this.datePipe.transform(TDate, 'dd'));

  //   // this.LeadFilterInfoForm.controls.FromDate.setValue({
  //   //   year: FirstDateYear,
  //   //   month: FirstDateMonth,
  //   //   day: FirstDateDay
  //   // });

  //   // this.LeadFilterInfoForm.controls.ToDate.setValue({
  //   //   year: CurrentDateYear,
  //   //   month: CurrentDateMonth,
  //   //   day: CurrentDateDay
  //   // });
  //   const currentYear = moment().year();
  //   this.minDate = moment([currentYear - 40, 0, 1]);
  //   this.maxDate = moment([currentYear + 1, CurrentDateMonth, CurrentDateDay]);

  //   //alert(" Min Date : " + this.minDate.toDate() +" \n Max Date : " + this.maxDate.toDate());

  //   //this.minDate=this.minDate.toDate.toString();
  //   this.MyMinDate=this.minDate.toDate();
  //   this.MyMaxDate=this.maxDate.toDate();

  // }
  timeLine = [{ UserId: 808, year: '2015', detail: '<p>This is a paragraph.</p>  <p>This is another paragraph.</p>' },
  { UserId: 1, year: '2015', detail: 'Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.' },
  { UserId: 2, year: '2017', detail: 'Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.' },
  { UserId: 2, year: '2018', detail: 'Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.' },
  { UserId: 1, year: '2019', detail: 'Lorem ipsum dolor sit amet, quo ei simul congue exerci, ad nec admodum perfecto mnesarchum, vim ea mazim fierent detracto. Ea quis iuvaret expetendis his, te elit voluptua dignissim per, habeo iusto primis ea eam.' }

  ]
  ngOnChanges(change: SimpleChanges) {
    debugger;
    console.log(change);
  }
  ngOnInit() {

    this.ActivityListsPagerConfig = new PagerConfig();
    this.ResetPagerConfig();
    this.ModuleId = 1;
    this.FormId = 2;
    this.ViewId = 10;

    this.ActivityListsCols = [
      { field: 'ActivityTypeName', header: 'Activity Type', width: '200px' },
      { field: 'ActivitySubject', header: 'Activity Subject', width: '150px' },
      { field: 'PriorityID', header: 'Priority', width: '150px' },
      { field: 'StartDate', header: 'Start Date', width: '100px' },
      { field: 'EndDate', header: 'End Date', width: '150px' },
      { field: 'DueDate', header: 'Due Date', width: '150px' },
      { field: 'Status', header: 'Status', width: '150px' },
      { field: '', header: 'Action', width: '100px' },
    ];

    this.RegardingId = 5;
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      if (param.get('mode') != undefined) {
        this.FormMode = param.get('mode');
      }
      if (param.get('Id') != undefined) {
        this.ContactId = parseInt(param.get('Id'));
      }
      if (param.get('return') != undefined) {
        this.ReturnLink = param.get('return');
      }
      //debugger;
      if (param.get('returnid') != undefined) {
        this.ReturnEntityId = parseInt(param.get('returnid'));
      }
    });
    this.IntialForm();
    //alert(" Purchase Order Creation \n  Purchase Order ID : " + this.pPurchaseOrderId + "\n Purchase Order Type : " + this.pPurchaseOrderTypeId + "\n Supplier Id: " + this.SupplierID);
    this.GetMaritalStatus();
    this.GetAccountsDomainItem(0);
    debugger;
    if (this.ContactId > 0) {
      //debugger;
      //this.GetLeadInfo(this.LeadId)
      this.IsExpandActivities = true;
      this.isEditMode = true;
      this.isAddMode = false
      this.hideInput = true;

      this.GetContactInfo(this.ContactId);
      //this.GetMarketingList();
      //this.GetContactInfo(this.ContactId);

      if (this.ReturnEntityId > 0) {
        this.ShowAccountDropDown = true;
      }
      else {
        this.ShowAccountDropDown = false;
      }
    }
    else {
      this.IsExpandActivities = false;
      this.FormMode = "NEW";

      this.isAddMode = true;
      this.isEditMode = false;
      this.hideInput = true;


      //Set Account Dropdown
      //this.ContactForm.controls["AccountId"].setValue(this.ReturnEntityId);
      if (this.ReturnEntityId > 0) {
        this.ShowAccountDropDown = true;
        this.ContactForm.controls["AccountId"].setValue(this.ReturnEntityId);
      }
      else {
        this.ShowAccountDropDown = false;
      }
    }



  }
  InitializeAccountForm()
  {
    this.AccountForm = this.formBuilderObj.group({
      AccouontId:[0],
      AccountName: [null, [Validators.required]],
      MainPhone: [null],
      Website: [null],
      CreatedBy:[0]
    });
  }

  IntialForm() {
    this.ContactForm = this.formBuilderObj.group({
      'Id': [0],
      'ContactType': [0],
      'CustomeTypeId': [0],
      'RegardingId': [0],
      'RegarId': [0],
      'SalId': [1],
      'FirstName': [null, [Validators.required]],
      'ContactMidtName': [''],
      'LastName': [null, [Validators.required]],
      'FullName': [null],
      'JobTitle': [''],
      'BusinessPhone': [''],
      'HomePhone': [''],
      'Mobile': [''],
      'EmailId': [''],
      'AccountId': [''],
      'AccountName':[''],
      'ContactId': [0],
      'GenderId': ['1'],
      'MaritalStatusId': [0],
      'AnniversaryDate': null,
      'DateOfBirth': null,
      "PrimaryContactId": [0],
      "IsPrimary": [false],
      "EmailOpt": [true],
      "SkypeId": ['']
    });

  }
  OnAccountChange(e) {
    console.log(e);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  ClickBack(e) {
    this.router.navigate([`/admin/currencieslist/${this.getRandomInt(100)}`]);
    if (this.ReturnLink == "1") {
      this.router.navigate([`/crm/contactslist/${this.getRandomInt(100)}`]);
    }
    else {
      if (this.ReturnEntityId > 0) {
        this.router.navigate([`/crm/accounts/EDIT/${this.ReturnEntityId}/2`]);
      }
      else {
        this.router.navigate([`/crm/accountslist/${this.getRandomInt(100)}`]);
      }
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
    //crm/contactslist/20
    this.ClickBack(e);
  }
  GetMaritalStatus() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetMaritalStatus();
    lead.subscribe((MaritalStatusList) => {
      //debugger;
      if (MaritalStatusList != null) {
        this.MaritalStatusList = MaritalStatusList;
        this.showLoadingIcon = false;
      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
      }, 500);
    });
  }
  //**************************************************************************************************************************/
  //Account Selectiong & New Account Creationg Functions Starts Here
  //**************************************************************************************************************************/
  ClickNewAccount(e) 
  {
    this.HeaderTitle = "New Account";

    debugger;
    //let a =this.NGBAccountIdRef;
    this.NGBAccountIdRef.close();

    this.InitializeAccountForm();


    //Dialog starts here
    let DialogAssignToRef = this.DialogAssignTo.open(DealAccountCDialog, {
      width: '650px',
      height: '350px',
      disableClose: true,
      data: { HeaderTitle: this.HeaderTitle,
        AccountForm:this.AccountForm,
        ContactForm:this.ContactForm, ContactId: this.ContactId,UserId:this.UserId }
    });

    //Dialog before close
    DialogAssignToRef.beforeClose().subscribe(result => {
      let mlistname = DialogAssignToRef
    });
    //Dialog after closed
    DialogAssignToRef.afterClosed().subscribe(result => {

      debugger;
      if (DialogAssignToRef.componentInstance.data.SaveClick == "NO") {
        console.log('in No btnClick');
      }
      else if (DialogAssignToRef.componentInstance.data.SaveClick == 'YES') {
        debugger;
    
        let AccountId=parseInt(DialogAssignToRef.componentInstance.data.AccountId);
        let AccountName=DialogAssignToRef.componentInstance.data.AccountName;
        if (AccountId > 0) {
          this.GetAccountsDomainItem(AccountId);

        }
        console.log('in Yes btnClick');

        //this.getList()
        //Get the reporting manager list
      }
    });
    //Dialog ends here

  }
  OnAccountOpen(e)
  {
    //debugger;
    console.log(e);
  }
  OnAccountClose(e)
  {
    //debugger;
    console.log(e);
  }
  OnAccountSelect(e) {
    //debugger;
    if (e != null) {
      console.log(e.AccountId);

      this.ContactForm.controls["AccountId"].setValue(e.AccountId);
      this.ContactForm.controls["AccountName"].setValue(e.AccountName);
      
      //this.GetContactsByAccountsId(e.AccountId);
    }
  }
  GetAccountsDomainItem(AccountId:number) {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetAccountsDomainItem();
    lead.subscribe((AccountsDomainItemListsRes) => {
      //debugger;
      if (AccountsDomainItemListsRes != null) {
        this.AccountsDomainItemList = AccountsDomainItemListsRes;
        this.showLoadingIcon = false;
      }

      //debugger;
      if (this.ReturnEntityId > 0) {
        var AccountInfo = this.AccountsDomainItemList.filter(x => x.AccountId == this.ReturnEntityId)[0].AccountName;
        this.AccountName = AccountInfo.toString();

      }
      setTimeout(() => {
        if(AccountId>0)
        {
          debugger;
          let AccountName=AccountsDomainItemListsRes.filter(x=>x.AccountId==AccountId)[0].AccountName;
          this.ContactForm.controls["AccountId"].setValue(AccountId);
          this.ContactForm.controls["AccountName"].setValue(AccountName);
  
          this.AccountName=AccountName;
  
          if(this.FormMode=="EDIT")
          {
            this.NGBAccountIdRef.open();
          }
        }
      }, 200);
      // setTimeout(() => {
      //   //this.blockUI.stop(); // Stop blocking
      // }, 500);
    });
  }
  //**************************************************************************************************************************/
  //Account Selectiong & New Account Creationg Functions Ends Here
  //**************************************************************************************************************************/
  customSearchFn(term: string, item) {
    //debugger;
    //item.name = item.title.replace(',', '');
    term = term.toLocaleLowerCase();
    return item.AccountName.toLocaleLowerCase().indexOf(term) > -1;
  }
  ResetPagerConfig() {
    this.ActivityListsPagerConfig.RecordsToSkip = 0;
    this.ActivityListsPagerConfig.RecordsToFetch = 125;

    this.currentPage = 1;
  }



  SearchActivities(ActivityFilterData?: ActivityFilterModel) {
    debugger;

    this.UserId = this.userDetails.UserID;
    let LeadSearchInput = {
      Skip: this.ActivityListsPagerConfig.RecordsToSkip,
      Take: this.ActivityListsPagerConfig.RecordsToFetch,
      ActivitySubject: "",
      ActivityDesc: "",
      StartDate: null,
      EndDate: null,
      DueDate: ActivityFilterData.DueDate,
      UserId: this.UserId,
      RegardingId: 5,
      RegarId: this.ContactId

    };
    this.showLeftPanelLoadingIcon = true;
    //SearchActivitiesByViews
    //this.CRMService.SearchActivities(LeadSearchInput)
    this.CRMService.SearchActivitiesByViews(this.ModuleId, this.FormId, this.ViewId, LeadSearchInput)
      .subscribe((data: any) => {
        debugger;
        this.showLeftPanelLoadingIcon = false;
        this.TotalRecords = data.TotalRecords;
        //
        this.IsFilterDataArrive = true;
        if (data.TotalRecords > 0) {
          //
          this.TotalRecords = data.TotalRecords;
          this.ActivityLists = data.ActivityList;
          this.FilterActivityLists = data.ActivityList;
          this.ActivityListsPagerConfig.TotalRecords = data.TotalRecords;

        }
        else {
          this.TotalRecords = data.TotalRecords;
          this.ActivityLists = data.ActivityList;
          this.FilterActivityLists = data.ActivityList;
          this.ActivityListsPagerConfig.TotalRecords = data.TotalRecords;
          this.filterMessage = "No matching records are found";
        }
      }, (error) => {
        this.showLeftPanelLoadingIcon = false;
      });
  }


  GetContactInfo(ContactId: any) {
    //this.blockUI.start("Loading..."); // Start blocking

    this.UserId = this.userDetails.UserID;

    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetContactByContactId(ContactId, this.UserId);
    lead.subscribe((ContactInfoRes) => {
      debugger;
      this.ContactInfo = ContactInfoRes.Contact;


      if (ContactInfoRes != null) {
        let poFilterData: ActivityFilterModel = null;

        poFilterData = new ActivityFilterModel();

        poFilterData.ModuleId = this.ModuleId;
        poFilterData.FormId = this.FormId;
        poFilterData.ViewId = this.ViewId;

        //Call API 
        this.SearchActivities(poFilterData);


      }

      //*******************************************************************************************************/
      //Set Contact Groups
      //*******************************************************************************************************/
      this.LeadListIdss = ContactInfoRes.ListIds;

      let LListIds = ContactInfoRes.ListIds;

      this.TotalSelectedConnections = ContactInfoRes.ListIds.length;

      let LeadContactGroups = this.LeadListIdss.map(e => e.ListId).join(",")
      let MyConnectionsList = this.ConnectionsLists;
      //*******************************************************************************************************/

      debugger;
      this.TotalSelectedConnections = LListIds.length;
      for (let i = 0; i < LListIds.length; i++) {
        let a = MyConnectionsList.filter(x => x.Id == LListIds[i].ListId)[0];

        this.SelectListById(a);
      }

      //this.ShowContactGroups=true;
      this.ShowContactGroups = false;
      if (ContactInfoRes != null) {
        setTimeout(() => {
          //this.blockUI.stop(); // Stop blocking
        }, 500);
        this.showLoadingIcon = false;

        // ExpectedDeliveryDate: new Date(response.ExpectedDeliveryDate),

        // this.LeadTopic=LeadInfoRes.Topic;
        //debugger;
        this.AccountName = ContactInfoRes.Contact.AccountName;
        if (ContactInfoRes.AnniversaryDate == "1900-01-01") {
          this.AnniversaryDate = "";
        }
        else {
          this.AnniversaryDate = ContactInfoRes.Contact.AnniversaryDate;
        }
        if (ContactInfoRes.Contact.DateOfBirth == "1900-01-01") {
          this.DateOfBirth = "";
        }
        else {
          this.DateOfBirth = ContactInfoRes.Contact.DateOfBirth;
        }

        //debugger;
        this.ContactForm.patchValue({
          Id: ContactInfoRes.Id,
          FirstName: ContactInfoRes.Contact.FirstName,
          LastName: ContactInfoRes.Contact.LastName,
          FullName: ContactInfoRes.Contact.FirstName + ' ' + ContactInfoRes.Contact.LastName,
          JobTitle: ContactInfoRes.Contact.JobTitle,
          BusinessPhone: ContactInfoRes.Contact.BusinessPhone,
          Mobile: ContactInfoRes.Contact.Mobile,
          EmailId: ContactInfoRes.Contact.EmailId,
          MaritalStatusId: ContactInfoRes.Contact.MaritalStatusId,
          GenderId: ContactInfoRes.Contact.GenderId,
          AccountId: ContactInfoRes.Contact.AccountId,
          IsPrimary: ContactInfoRes.Contact.Isprimary,
          EmailOpt: ContactInfoRes.Contact.EmailOpt,
          SkypeId: ContactInfoRes.Contact.SkypeId,
          ContactType: ContactInfoRes.Contact.ContactType
        });

        this.AccountId = ContactInfoRes.Contact.AccountId;
        this.ContactId = ContactInfoRes.Id;

        this.ContactId = ContactInfoRes.Contact.Id;
        this.RegarId = this.ContactId;

        // if(ContactInfoRes.Contact.AccountId==0)
        // {
        //   this.ContactForm.controls["AccountId"].setValue("Select Account");
        // }
        if (ContactInfoRes.Contact.ContactType) {
          this.ContactTypeName = "Business";
        }
        else {
          this.ContactTypeName = "Individual";
        }
        //Anniversary Date
        if (this.AnniversaryDate != null) {
          if (ContactInfoRes.Contact.AnniversaryDate != "1900-01-01") {

            this.AnniversaryDateD = new Date(ContactInfoRes.Contact.AnniversaryDate);

            const AnniversaryYear = Number(this.datePipe.transform(this.AnniversaryDateD, 'yyyy'));
            const AnniversaryMonth = Number(this.datePipe.transform(this.AnniversaryDateD, 'MM'));
            const AnniversaryDay = Number(this.datePipe.transform(this.AnniversaryDateD, 'dd'));

            this.ContactForm.controls.AnniversaryDate.setValue({
              year: AnniversaryYear,
              month: AnniversaryMonth,
              day: AnniversaryDay
            });

          }
        }


        //Date Of Birth
        if (this.DateOfBirth != null) {
          if (ContactInfoRes.Contact.DateOfBirth != "1900-01-01") {

            this.DateOfBirthD = new Date(ContactInfoRes.Contact.DateOfBirth);

            const DateOfBirthYear = Number(this.datePipe.transform(this.DateOfBirthD, 'yyyy'));
            const DateOfBirthMonth = Number(this.datePipe.transform(this.DateOfBirthD, 'MM'));
            const DateOfBirthDay = Number(this.datePipe.transform(this.DateOfBirthD, 'dd'));

            this.ContactForm.controls.DateOfBirth.setValue({
              year: DateOfBirthYear,
              month: DateOfBirthMonth,
              day: DateOfBirthDay
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
  }
  onSubmit(MyContactForm: any, myPanel, e) {

    debugger;
    this.AccountId = MyContactForm.AccountId;
    this.MyContactInfo = new ContactDTO();
    this.MyContactInfo.Id = this.ContactId;
    this.MyContactInfo.ContactName = MyContactForm.ContactName;
    this.MyContactInfo.ContactTypeId = MyContactForm.ContactTypeId;
    this.MyContactInfo.RegardingId = MyContactForm.RegardingId;
    this.MyContactInfo.RegarId = MyContactForm.RegarId;
    this.MyContactInfo.SalId = MyContactForm.SalId;
    this.MyContactInfo.FirstName = MyContactForm.FirstName;
    this.MyContactInfo.LastName = MyContactForm.LastName;
    this.MyContactInfo.JobTitle = MyContactForm.JobTitle;
    this.MyContactInfo.LeadId = 0;
    this.MyContactInfo.LeadNo = "0";
    this.MyContactInfo.AccountId = this.AccountId;
    this.MyContactInfo.CurId = MyContactForm.CurId;
    debugger;

    this.MyContactInfo.BusinessPhone = MyContactForm.BusinessPhone;
    this.MyContactInfo.HomePhone = MyContactForm.HomePhone;
    this.MyContactInfo.Mobile = MyContactForm.Mobile;
    this.MyContactInfo.EmailId = MyContactForm.EmailId;
    this.MyContactInfo.Manager = MyContactForm.Manager;
    this.MyContactInfo.MaritalStatusId = MyContactForm.MaritalStatusId;
    this.MyContactInfo.ContactType = MyContactForm.ContactType;

    this.MyContactInfo.IsPrimary = MyContactForm.IsPrimary;
    //debugger;
    if (this.FormMode == "EDIT") {
      if (MyContactForm.IsPrimary) {
        this.MyContactInfo.PrimaryContactId = this.ContactId;
      }
      else {
        this.MyContactInfo.PrimaryContactId = 0;
      }
    }

    const AnniversaryDateControl = this.ContactForm.controls["AnniversaryDate"];
    const DateOfBirthControl = this.ContactForm.controls["DateOfBirth"];

    //debugger;
    if (AnniversaryDateControl.status == "VALID") {
      if (AnniversaryDateControl.value != null) {
        this.AnniversaryDate = MyContactForm.AnniversaryDate.year + "-" + MyContactForm.AnniversaryDate.month + "-" + MyContactForm.AnniversaryDate.day;
        this.MyContactInfo.AnniversaryDate = this.AnniversaryDate;
      }
      else {
        this.MyContactInfo.AnniversaryDate = "";
      }
    }
    else {
      this.MyContactInfo.AnniversaryDate = "";
      AnniversaryDateControl.setErrors(null);
    }

    if (DateOfBirthControl.status == "VALID") {
      if (DateOfBirthControl.value != null) {
        this.DateOfBirth = MyContactForm.DateOfBirth.year + "-" + MyContactForm.DateOfBirth.month + "-" + MyContactForm.DateOfBirth.day;
        this.MyContactInfo.DateOfBirth = this.DateOfBirth
      }
      else {
        this.MyContactInfo.DateOfBirth = "";
      }
    }
    else {
      this.MyContactInfo.DateOfBirth = "";
      DateOfBirthControl.setErrors(null);
    }

    //this.MyContactInfo.AnniversaryDate=MyContactForm.AnniversaryDate;
    //this.MyContactInfo.DateOfBirth=MyContactForm.DateOfBirth;
    this.MyContactInfo.GenderId = MyContactForm.GenderId;

    // this.MyContactInfo.ManagerPhone = MyContactForm.ManagerPhone;
    // this.MyContactInfo.Assistant = MyContactForm.Assistant;
    // this.MyContactInfo.AssistantPhone = MyContactForm.AssistantPhone;

    // this.MyContactInfo.UpdatedBy =this.UserId;
    // this.MyContactInfo.CreatedBy = this.UserId;

    //debugger;
    if (this.ContactForm.valid) {

      //debugger;
      if (this.FormMode == "NEW") {

        this.MyContactInfo.CreatedBy = this.userDetails.UserID;
        this.CreateContact(this.MyContactInfo, e);
      }
      else {

        this.MyContactInfo.UpdatedBy = this.userDetails.UserID;
        this.UpdateContact(this.MyContactInfo, e)
      }



    }
    else {
      myPanel.expanded = true;
    }
  }
  EditActivity(ActivityId, ActivityTypeId, ActivityTypeName, FormMode, e) {
    const self = this;
    //'crmactivity/:mode/:Id/:return/:returnid',
    //this.router.navigate([`/crm/crmactivity/${'EDIT'}/${ActivityId}//${ActivityType}/1/0`]);
    this.ActivityFormMode = FormMode;
    // if(ActivityTypeName=="Phone")
    // {
    //   this.ClickNewPhoneActivity(e,ActivityId,ActivityTypeId,ActivityTypeName,1);
    // }
    // else
    // {
    //   this.ClickNewPhoneActivity(e,ActivityId,ActivityTypeId,ActivityTypeName,2);
    // }
    //ClickNewPhoneActivity(0,1,'Phone','NEW',$event)
    //alert(ActivityId +' '+ActivityTypeId+' '+ActivityTypeName+' '+FormMode);
    debugger;
    this.ClickNewPhoneActivity(ActivityId, ActivityTypeId, ActivityTypeName, this.ActivityFormMode, e);
  }
  ClickNewLead(e) {
    //this.router.navigate([`/crm/contacts/${this.FormMode}/${this.ContactId}/2`]);
    this.router.navigate([`/crm/leads/NEW/0/3/${this.ContactId}/${this.AccountId}`]);
  }
  ClickNewDeal(e) {
    this.router.navigate([`/crm/deal/NEW/0/3/${this.ContactId}/${this.AccountId}`]);
  }
  ClickNewPhoneActivity(ActivityId, ActivityTypeId, ActivityTypeName, FormMode, e) {
    //alert(ActivityId +' '+ActivityTypeId+' '+ActivityTypeName+' '+FormMode);
    this.ActivityFormMode = FormMode;
    //TODO   Schedule a call, Log a call
    let ActiityDialogRef = this.dialog.open(CrmactivityLogACallComponent, {
      width: '1000px',
      height: '750px',
      disableClose: false,
      data: {
        RegardingId: this.RegardingId,
        RegarId: this.RegarId,
        HeaderTitle: this.HeaderTitle,
        FormMode: this.ActivityFormMode,
        ActivityId: ActivityId,
        ActivityTypeId: ActivityTypeId,
        ActivityTypeName: ActivityTypeName,
        ContactId: this.ContactId,
        ContactInfo: this.ContactInfo
      }
    });

    //Dialog before close
    ActiityDialogRef.beforeClose().subscribe(result => {
      debugger;
      console.log(result);
      let mlistname = ActiityDialogRef
    });

    //Dialog After Close
    ActiityDialogRef.afterClosed().subscribe(result => {
      debugger;
      // if (ActiityDialogRef.componentInstance.data.SaveClick == "NO") {
      //   console.log('No Click');
      // }
      // else if (ActiityDialogRef.componentInstance.data.SaveClick == 'YES') {
      // }


      console.log(result);
      let poFilterData: ActivityFilterModel = null;

      poFilterData = new ActivityFilterModel();

      poFilterData.ModuleId = this.ModuleId;
      poFilterData.FormId = this.FormId;
      poFilterData.ViewId = this.ViewId;

      poFilterData.RegardingId = this.RegardingId;
      poFilterData.RegarId = this.ContactId;

      //Call API 
      this.SearchActivities(poFilterData);
      ActiityDialogRef.close();

    });
  }

  ClickNewActivity(e, ActivityType) {
    let ActiityDialogRef = this.dialog.open(CrmactivityComponent, {
      width: '1100px',
      height: '600px',
      disableClose: false,
      data: {
        HeaderTitle: this.HeaderTitle,
        ActivityType: ActivityType,
        ContactId: this.ContactId,
        ContactInfo: this.ContactInfo
      }
    });

    //Dialog before close
    ActiityDialogRef.beforeClose().subscribe(result => {
      debugger;
      let mlistname = ActiityDialogRef
    });

    //Dialog After Close
    ActiityDialogRef.afterClosed().subscribe(result => {
      debugger;
      // if (ActiityDialogRef.componentInstance.data.SaveClick == "NO") {
      //   console.log('No Click');
      // }
      // else if (ActiityDialogRef.componentInstance.data.SaveClick == 'YES') {
      // }
    });




  }
  CreateContact(ContactInfo: any, e) {
    const self = this;
    this.blockUI.start('Creating Contact...'); // Start blocking 
    this.result = this.CRMService.CreateContact(ContactInfo).subscribe(
      (data: any) => {

        //debugger;

        if (data.Status == "SUCCESS") {
          this.ContactId = data.Data;
          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Contact Created successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          //this.router.navigate(['/crm/leadlists']);
          //this.router.navigate([`/crm/contacts/${this.FormMode}/${this.ContactId}/2`]);
          //contactslist

          //this.router.navigate([`/crm/contactslist/${this.getRandomInt(100)}`]);
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
  UpdateContact(Lead: any, e) {
    const self = this;
    this.blockUI.start('Updating Contact...'); // Start blocking 
    // CreatedBy: {
    //   UserID: this.userDetails.UserID,
    //   UserName: this.userDetails.UserName
    // },
    // UpdatedBy: {
    //   UserID: this.userDetails.UserID,
    //   UserName: this.userDetails.UserName
    // },

    Lead.UpdatedBy = this.userDetails.UserID;

    this.result = this.CRMService.UpdateContact(Lead).subscribe(
      (data: any) => {
        //debugger;
        if (data.Status == "SUCCESS") {

          this.blockUI.stop(); // Stop blocking
          // setTimeout(() => {
          //   this.blockUI.stop(); // Stop blocking
          // }, 300);

          self.snackBar.open("Contact updated successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          //this.router.navigate(['/crm/leads/`{0}`']);
          //this.router.navigate([`/crm/contacts/${this.FormMode}/${this.ContactId}/2`]);

          //this.router.navigate([`/crm/contactslist/${this.getRandomInt(100)}`]);
          this.ClickBack(e);
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
        else {

          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
          }, 500);

          // self.snackBar.open("Problem in updateing lead please try again", null, {
          //   duration: 5000, verticalPosition: 'top',
          //   horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          // });
        }
      },
      // Errors will call this callback instead:
      err => {
        ////
        //debugger;
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
  OnContactTypeChange(e) {
    //debugger;
    if (e.target.checked) {
      this.ContactTypeName = "Business";
    } else {
      this.ContactTypeName = "Individual";
    }
  }
  //**************************************************************************************************************/
  //Contact Groups Code Starts Here
  //**************************************************************************************************************/
  SelectListById(mail: MarketingList) {
    this.SelectedListItems.push(mail);
  }
  OnMarketingRowUnSelect(event) {
    let i = 0;
    this.SelectedConnections = "";
    debugger;
    for (i = 0; i <= this.SelectedListItems.length - 1; i++) {
      if (this.SelectedConnections == "") {
        this.SelectedConnections = this.SelectedListItems[i].Id;
      }
      else {
        this.SelectedConnections = this.SelectedConnections + "," + this.SelectedListItems[i].Id;
      }
    }
    this.TotalSelectedConnections = this.SelectedListItems.length;
    if (this.TotalSelectedConnections == 0) {
      this.SelectedConnections = "";
    }
    //alert("Un Selected Leads : " + this.SelectedConnections + "\n Total Un Selected Leads : " + this.TotalSelectedConnections);
    //this.ShowHideToolBar();
  }

  OnMarketingRowSelect(event) {
    let i = 0;
    this.SelectedConnections = "";
    debugger;
    for (i = 0; i <= this.SelectedListItems.length - 1; i++) {
      if (this.SelectedConnections == "") {
        this.SelectedConnections = this.SelectedListItems[i].Id;
      }
      else {
        this.SelectedConnections = this.SelectedConnections + "," + this.SelectedListItems[i].Id;
      }
    }
    this.TotalSelectedConnections = this.SelectedListItems.length;
    //alert("Selected Leads : " + this.SelectedConnections + "\n Total Selected Leads : " + this.TotalSelectedConnections);
    //this.ShowHideToolBar();
  }
  GetMarketingList() {
    const self = this;
    //let a = this.CRMService.GetList();

    this.CRMService.GetList()
      .subscribe((data: any) => {
        ////debugger;
        this.IsFilterDataArrive = true;
        this.ConnectionsLists = data;
        this.FilterConnectionsLists = data;
        this.TotalRecords = this.ConnectionsLists.length;
        //debugger;
        this.GetContactInfo(this.ContactId);

      }, (error) => {
        this.showLeftPanelLoadingIcon = false;
        //debugger;
      });
  }

  UpdateContactGroups(e) {

    const self = this;
    if (this.ShowContactGroups) {
      this.ContactGroupsList = new ContactGroups();

      //this.ListIdss=new ListIds[];
      //debugger;
      this.ListIdss = [];
      if (this.TotalSelectedConnections > 1) {
        let Ids = this.SelectedConnections.split(',');
        for (let i = 0; i < Ids.length; i++) {
          this.ListIdss.push(new ListIds(parseInt(Ids[i])));
        }
      }
      else {
        let Ids = this.SelectedConnections;
        this.ListIdss.push(new ListIds(parseInt(Ids)));
      }


      this.ContactGroupsList.ContactId = this.ContactId;
      this.ContactGroupsList.RegardingId = 5;
      this.ContactGroupsList.RegarId = this.ContactId;
      this.ContactGroupsList.UserId = this.UserId;
      this.ContactGroupsList.ListIds = this.ListIdss;

      console.log(this.ContactGroupsList);

      console.log(JSON.stringify(this.ContactGroupsList));

      //debugger;
      this.result = this.CRMService.UpdateContactGroupsOfContact(this.ContactGroupsList).subscribe(
        (data: any) => {

          debugger;

          if (data.Status == "SUCCESS") {
            this.ContactId = data.Data;
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 300);

            self.snackBar.open("Updated successfully ...", null, {
              duration: 3000, verticalPosition: 'top',
              horizontalPosition: 'right', panelClass: 'stellify-snackbar',
            });
            this.TotalSelectedConnections = 0;

            //this.GetMarketingList();

            //this.router.navigate([`/crm/leadlists/${this.getRandomInt(10)}`]);
            //this.router.navigate([`/crm/leads/${this.FormMode}/${this.LeadId}/2`]);
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
              this.blockUI.stop(); // Stop blocking
            }, 300);

            self.snackBar.open("Problem in Creating lead please try again", null, {
              duration: 5000, verticalPosition: 'top',
              horizontalPosition: 'right', panelClass: 'stellify-snackbar',
            });
          }
        },
        // Errors will call this callback instead:
        err => {
          ////
          if (err.error == "FAIL") {
            //this.formError = err.error.ExceptionMessage;

            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 500);

            self.snackBar.open("Problem in Creating lead please try again", null, {
              duration: 5000, verticalPosition: 'top',
              horizontalPosition: 'right', panelClass: 'stellify-snackbar',
            });


          }
          else {
            this.formError = err.statusText;
          }
        });
    }


  }
  //**************************************************************************************************************/
  //Contact Groups Code Starts Here
  //**************************************************************************************************************/

  //Activities Grid Functions
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
    this.SelectedActivities = "";
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
      if (this.SelectedActivities == "") {
        this.SelectedActivities = this.selectedItems[i].Id;
      }
      else {
        this.SelectedActivities = this.SelectedActivities + "," + this.selectedItems[i].Id;
      }
    }
    this.TotalSelectedActivities = this.selectedItems.length;
    if (this.TotalSelectedActivities == 0) {
      this.SelectedActivities = "";
    }
    //alert("Un Selected Leads : " + this.SelectedActivities + "\n Total Un Selected Leads : " + this.TotalSelectedActivities);
  }

  onRowSelect(event) {
    let i = 0;
    this.SelectedActivities = "";
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
      if (this.SelectedActivities == "") {
        this.SelectedActivities = this.selectedItems[i].Id;
      }
      else {
        this.SelectedActivities = this.SelectedActivities + "," + this.selectedItems[i].Id;
      }
    }
    this.TotalSelectedActivities = this.selectedItems.length;
    //alert("Selected Leads : " + this.SelectedActivities + "\n Total Selected Leads : " + this.TotalSelectedActivities);
  }

  ClickSelected(event) {

    let i = 0;

    this.SelectedActivities = "";
    if (this.selectedItems != null) {
      for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedActivities == "") {
          this.SelectedActivities = this.selectedItems[i].Id;
        }
        else {
          this.SelectedActivities = this.SelectedActivities + "," + this.selectedItems[i].Id;
        }
      }
      this.TotalSelectedActivities = this.selectedItems.length;

      //alert("Selected Leads : " + this.SelectedActivities + "\n Total Selected Leads : " + this.TotalSelectedActivities);

    }
  }
}

//****************************************************************************************************************/
//New Account Dialog starts here
//****************************************************************************************************************/
@Component({
  selector: 'deal-account-c-dialog',
  templateUrl: 'deal-account-c-dialog.html',
  styleUrls: ['deal-account-c-dialog.css']
})
export class DealAccountCDialog implements OnInit ,AfterViewInit {
  //Auto mapping variables
  
  selectedRows: any[];
  formError: string;
  MyListID: any;
  router: any;
  nodes: any;
  SaveClick:any;
 
  AccountId:number;
  AccountName:string;
  ReturnStr:string;
  result:any;
  @BlockUI() blockUI: NgBlockUI;
  //postComments = comments;
  constructor(
    public dialogRef: MatDialogRef<DealAccountCDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private renderer: Renderer2,
    private sessionStorageService: SessionStorageService,
    private CRMService: CRMService,
    private route: ActivatedRoute) {
    

    this.data.AccountForm.controls["CreatedBy"].setValue(this.data.UserId);
  }
  ngAfterViewInit(): void {
    //this.renderer.selectRootElement('#AccountName').focus();
  }
  
  ngOnInit() {
    // this.nodes=this.data.ManagerList;
    // let timeoutId = setTimeout(() => {
    //     this.exapandORcollapse(this.nodes);
    //   }, 200);
  }

  onNoClick(e): void {

    this.data.SaveClick = "NO";
    this.dialogRef.close(this.MyListID);
  }
  YesClick(event, listData): void {
    const self = this;
    debugger;
    this.data.SaveClick = "YES";
   
    if(this.selectedRows)
    {
      this.data.ManagerId=listData.data.UserId;
      this.data.ManagerName=listData.data.UserName;
    }
    if (this.data.FormMode == 1) {
      //Create
    }
    else {
      //Update
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
  OnAccountFormSubmit(MyAccountForm,e)
  {
    debugger;
    if(this.data.AccountForm.invalid)
    {
      this.markAsDirty(this.data.AccountForm)
    }
    else if(this.data.AccountForm.valid)
    {
      //Submit To Save Account

      this.data.AccountForm.controls["CreatedBy"].setValue(this.data.UserId);
      this.CreateQuickAccount(MyAccountForm);


    }
  }

  CreateQuickAccount(MyAccountForm: any) 
  {
    const self = this;
    this.blockUI.start('Creating Deal ...'); // Start blocking 
    this.result = this.CRMService.CreateQuickAccount(MyAccountForm).subscribe(
      (data: any) => {

        debugger;

        if (data.Status == "SUCCESS") {
          //this.AccountId = data.Data;
          this.ReturnStr=data.Data;

          this.AccountId=parseInt(this.ReturnStr.split('-')[0]);
          this.AccountName=this.ReturnStr.split('-')[1];

          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Account Created successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          //Successfully Create Account
           //Adding Contacts
          this.data.AccountId = this.AccountId;
          this.data.AccountName=this.AccountName;
          this.data.SaveClick="YES";
          this.dialogRef.close(this.data);

          //this.router.navigate([`/crm/deallist/${this.getRandomInt(10)}`]);
        }
        else if (data.Status == "ERROR") {

          this.data.SaveClick="NO";
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
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Problem in Creating Account please try again", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }
      },
      // Errors will call this callback instead:
      err => {
        ////
        if (err.error == "FAIL") {
          //this.formError = err.error.ExceptionMessage;

          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 500);

          self.snackBar.open("Problem in Creating Deal please try again", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });


        }
        else {
          this.formError = err.statusText;
        }
      });
  }
}


