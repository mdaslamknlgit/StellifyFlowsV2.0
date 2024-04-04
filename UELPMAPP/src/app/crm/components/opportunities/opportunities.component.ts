import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { AccountsDTO, AccountsDomainItem, IndustryDomainItem } from '../../models/AccountsDTO';
import { SortEvent, TreeNode } from "primeng/api";
import { ContactsAccountsList, OpportunityDTO, ProbabilityDomainItem } from '../../models/OpportunityDTO';

import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { DatePipe } from '@angular/common';
import { OpportunityProductsDTO, OpportunityProductsInput, OpportunityProductsResult } from '../../models/OpportunityProductsDTO';
import { SearchProducts } from '../../models/ProductsDTO';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-opportunities',
  templateUrl: './opportunities.component.html',
  styleUrls: ['./opportunities.component.css']
})
export class OpportunitiesComponent implements OnInit {

  selectedAccountContact = 'Nicolás'
  accountscontacts = [
    { Id: 1, contactname: 'Adam', email: 'adam@email.com', age: 12, account: 'United States', accountid: 1 },
    { Id: 2, contactname: 'Samantha', email: 'samantha@email.com', age: 30, account: 'United States', accountid: 1 },
    { Id: 3, contactname: 'Amalie', email: 'amalie@email.com', age: 12, account: 'Argentclsina', accountid: 2 },
    { Id: 4, contactname: 'Estefanía', email: 'estefania@email.com', age: 21, account: 'Argentina', accountid: 3 },
    { Id: 5, contactname: 'Adrian', email: 'adrian@email.com', age: 21, account: 'Ecuador', accountid: 4 },
    { Id: 6, contactname: 'Wladimir', email: 'wladimir@email.com', age: 30, account: 'Ecuador', accountid: 4 },
    { Id: 7, contactname: 'Natasha', email: 'natasha@email.com', age: 54, account: 'Ecuador', accountid: 5 },
    { Id: 8, contactname: 'Nicole', email: 'nicole@email.com', age: 43, account: 'Colombia', accountid: 6 },
    { Id: 9, contactname: 'Michael', email: 'michael@email.com', age: 15, account: 'Colombia', accountid: 6 },
    { Id: 10, contactname: 'Nicolás', email: 'nicole@email.com', age: 43, account: 'Colombia', accountid: 6 },
    { Id: 11, contactname: 'Md Aslam', email: 'nicole@email.com', age: 43, account: '', accountid: 0 },
    { Id: 0, contactname: 'Sparsh', email: 'nicole@email.com', age: 43, account: 'Sparsh', accountid: 7 }
  ];
  currentPage: number = 1;
  ProductsListsCols: any[];
  ProductsLists: any[] = [];

  OpportunityProductsListsCols: any[];
  OpportunityProductsLists: any[] = [];


  filterMessage: string = "";

  SelectedProducts: string = '';
  SelectedProductName: string = '';
  TotalSelectedProducts: number = 0;
  public selectedItems: any[];


  SelectedOppProducts: string = '';
  SelectedOppProductName: string = '';
  TotalSelectedOppProducts: number = 0;
  public selectedItemsOpp: any[];


  ShowConfirmForOpportunityPopop:boolean=false;

  ProductIsActive: boolean = true;
  SearchProductInfo: SearchProducts;
  ProductsListsPagerConfig: PagerConfig;
  OpportunityProductsListsPagerConfig: PagerConfig;
  showLeftPanelLoadingIcon: boolean = false;
  TotalRecords: number = 0;
  @BlockUI() blockUI: NgBlockUI;
  ShowProductsPopUp: boolean = false;
  RemarksForm: FormGroup;
  private result;
  rightsection: boolean = false;
  ReturnLink: string;
  AccountId: number = 0;
  ContactId: number = 0;
  IndustryDomainItemList: IndustryDomainItem[] = [];

  OpportunityProductsInputInfo: OpportunityProductsInput;
  OpportunityProductsDTOList: OpportunityProductsDTO[] = [];
  OpportunityProductsInfo1: OpportunityProductsDTO;
  OpportunityProductsInfo2: OpportunityProductsDTO;

  rightSection: boolean = false;
  FormMode: string;
  MyOppForm: OpportunityDTO;
  EstCloseDate: Date;
  EstCloseDateStr: string;
  EstCloseDateStrA: string;
  EstCloseDateStrB: string;

  EstCloseDateDay: number = 0;
  EstCloseDateMonth: number = 0;
  EstCloseDateYear: number = 0;

  ReturnEntityId: any;
  OppId: number = 0;
  TotalProductsSend: number = 0;
  TotalProductsExists: number = 0;
  formError: string;
  OpportunityForm: FormGroup;
  hideInput?: boolean = null;
  isAddMode: boolean = true;
  isEditMode: boolean = false;
  UserId: number;
  userDetails: UserDetails = null;

  IsSummaryExpand: boolean = true;
  IsDetailsExpand: boolean = true;
  IsProductsExpand: boolean = true;

  IsSummaryDisable: boolean = true;
  IsDetailsDisable: boolean = true;
  IsProductsDisable: boolean = true;

  CreatedBy: number;
  CreatedDateStr: string;
  OpportunityOwner: string;
  OriginatingLead: string;

  showLoadingIcon: boolean = false;
  OpportunityInfo: OpportunityDTO;
  AccountsDomainItemList: Array<AccountsDomainItem> = [];

  firstDay: string = "";
  currentDay: string = "";
  lastDay: string = "";
  currentDate: string;
  priorDate: Date;
  todayDate = new Date();

  firstDate: string = "";
  lastDate: string = "";

  FromDateStr: string;
  ToDateStr: string;


  OpportunityProductsResult:OpportunityProductsResult;

  ContactsAccountsList: Array<ContactsAccountsList> = [];
  ProbabilityDomainItemList: ProbabilityDomainItem[] = [];
  CurrencyList: Currency[] = [];
  constructor(
    private datePipe: DatePipe,
    private reqDateFormatPipe: RequestDateFormatPipe,
    private renderer: Renderer2,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private formBuilderObj: FormBuilder,
    private CRMService: CRMService,
    private sessionService: SessionStorageService,
    public snackBar: MatSnackBar,
  ) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
  }

  onDatePickerFocus(element: NgbInputDatepicker, e) {
    if (!element.isOpen()) {
      element.open();
    }
  }
  InitializeForm() {
    this.OpportunityForm = this.formBuilderObj.group({
      'Id': [0],
      'OppNo': [''],
      'OppTopic': [null, [Validators.required]],
      'AccountId': [null, [Validators.required]],
      'ContactId': [0],
      'RegardingId': [0],
      'RegarId': [0],
      'RelId': [0],
      'PriceListId': [0],
      'CurId': [0],
      'LeadId': [0],
      'CloseRevenue': [0],
      'CloseDate': [null],
      'EstRevenue': [0],
      'EstCloseDate': [null, [Validators.required]],
      'ProbabilityId': [null, [Validators.required]],
      'ActualRevenue': [0],
      'OppStatReasonId': [0],
      'WonLost': [false],
      'CampaignId': [0],
      'OppCloseDesc': [''],
      'OppDesc': [''],
      'IsActive': [true],
      'IsClose': [false],
      'CreatedBy': [0],
      'CreatedDate': [null],
      'OpportunityOwner': [null],
      'OriginatingLead': [null],
    });

  }


  ngOnInit() {
    this.OpportunityProductsListsCols = [
      //{ field: '', header: '', width: '30px' },
      { field: 'ProductCode', header: 'Product Code', width: '100px' },
      { field: 'ProductName', header: 'Product Name', width: '100px' },
      { field: 'ProductDescription', header: 'ProductDes cription', width: '100px' },
      { field: 'CreatedDate', header: 'Created on', width: '100px' },
      { field: '', header: 'Action', width: '50px' },
  ];

    this.ProductsListsPagerConfig = new PagerConfig();
    this.OpportunityProductsListsPagerConfig= new PagerConfig();

    this.ResetPagerConfig();
    this.RemarksForm = this.formBuilderObj.group({
      Reasons: new FormControl('', [Validators.required]),
      DocumentId: [0],
      IsActive: ['']
    });
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      if (param.get('mode') != undefined) {
        this.FormMode = param.get('mode');
      }
      if (param.get('Id') != undefined) {
        this.OppId = parseInt(param.get('Id'));
      }
      // if (param.get('return') != undefined) {
      //   this.ReturnLink = param.get('return');
      // }
      if (param.get('returnentityid') != undefined) {
        this.ReturnEntityId = parseInt(param.get('returnentityid'));
      }
    });
    this.InitializeForm();
    this.GetAccountsDomainItem();
    this.GetProbabilityDomainItem();
    this.GetAllCurrencies();


    this.GetContactsByAccounts("");



    if (this.OppId > 0) {
      //debugger;
      //this.GetLeadInfo(this.LeadId)
      this.isEditMode = true;
      this.isAddMode = false
      this.hideInput = true;
      this.GetOpportunityInfo(this.OppId);

      this.IsSummaryExpand = true;
      this.IsDetailsExpand = true;
      this.IsProductsExpand = true;

      this.IsSummaryDisable = false;
      this.IsDetailsDisable = false;
      this.IsProductsDisable = false;
    }
    else {
      this.FormMode = "NEW";

      this.isAddMode = true;
      this.isEditMode = false;
      this.hideInput = true;

      this.IsSummaryExpand = true;
      this.IsDetailsExpand = false;
      this.IsProductsExpand = false;

      this.IsSummaryDisable = false;
      this.IsDetailsDisable = true;
      this.IsProductsDisable = true;

      this.OpportunityForm.controls["ProbabilityId"].setValue(3);
    }

  }
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  
  ClickBack(e) {
    if (this.ReturnEntityId == "1") {
      //this.router.navigate([`/crm/opportunities/EDIT/${this.ReturnEntityId}/2`]);  
      this.router.navigate([`/crm/opportunities`]);
    }
    else {
      //this.router.navigate([`/crm/opportunities/${this.getRandomInt(100)}`]);
      this.router.navigate([`/crm/opportunities`]);
    }
  }
  SetDates(InDate: Date) {
    //**********************************************************************************************************************
    //Set Dates
    //**********************************************************************************************************************
    //debugger;
    this.todayDate = new Date(InDate);

    const FDate = this.todayDate;

    const FirstDateYear = Number(this.datePipe.transform(FDate, 'yyyy'));
    const FirstDateMonth = Number(this.datePipe.transform(FDate, 'MM'));
    const FirstDateDay = Number(this.datePipe.transform(FDate, 'dd'));

    this.OpportunityForm.controls.EstCloseDate.setValue({
      year: FirstDateYear,
      month: FirstDateMonth,
      day: FirstDateDay
    });
    //**********************************************************************************************************************

  }
  GetOpportunityInfo(OppId: any) {
    //this.blockUI.start("Loading..."); // Start blocking

    this.UserId = this.userDetails.UserID;

    this.showLoadingIcon = true;
    let Opp = <Observable<any>>this.CRMService.GetOpportunityInfo(OppId, this.UserId);
    Opp.subscribe((OpportunityInfoRes) => {
      //debugger;
      this.OpportunityInfo = OpportunityInfoRes;


      if (OpportunityInfoRes != null) {
        setTimeout(() => {
          //this.blockUI.stop(); // Stop blocking
        }, 500);
        this.showLoadingIcon = false;

        // ExpectedDeliveryDate: new Date(response.ExpectedDeliveryDate),

        // this.LeadTopic=LeadInfoRes.Topic;


        this.OpportunityForm.controls["Id"].setValue(OpportunityInfoRes.Id);
        this.OpportunityForm.controls["OppTopic"].setValue(OpportunityInfoRes.OppTopic);

        this.OpportunityForm.controls["AccountId"].setValue(OpportunityInfoRes.AccountId);
        this.OpportunityForm.controls["ContactId"].setValue(OpportunityInfoRes.ContactId);


        this.AccountId = OpportunityInfoRes.AccountId;
        this.ContactId = OpportunityInfoRes.ContactId;


        this.OpportunityForm.controls["RegardingId"].setValue(OpportunityInfoRes.RegardingId);
        this.OpportunityForm.controls["RegarId"].setValue(OpportunityInfoRes.RegarId);
        this.OpportunityForm.controls["RelId"].setValue(OpportunityInfoRes.RelId);

        this.OpportunityForm.controls["PriceListId"].setValue(OpportunityInfoRes.PriceListId);

        this.OpportunityForm.controls["ProbabilityId"].setValue(OpportunityInfoRes.ProbabilityId);
        this.OpportunityForm.controls["CurId"].setValue(OpportunityInfoRes.CurId);

        debugger;
        if(OpportunityInfoRes.EstCloseDate!= null)
        {
          this.EstCloseDate = OpportunityInfoRes.EstCloseDate;

          this.SetDates(this.EstCloseDate);
        }
        //this.OpportunityForm.controls["EstCloseDate"].setValue(EstCloseDateF);

        // this.OpportunityForm.controls["OpportunityOwner"].setValue('2');
        // this.OpportunityForm.controls["OriginatingLead"].setValue('1');

        this.CreatedBy = OpportunityInfoRes.CreatedBy;
        this.CreatedDateStr = moment(OpportunityInfoRes.CreatedDate).format('YYYY-MM-DD');


        //Opportunity Owner
        if (this.CreatedBy == this.UserId) {
          this.OpportunityOwner = this.userDetails.FullName;
          this.OpportunityForm.controls["OpportunityOwner"].setValue(this.OpportunityOwner);
        }

        //Originating Lead
        if (OpportunityInfoRes.LeadId > 0) {
          this.OriginatingLead = OpportunityInfoRes.LeadId.toString();
          this.OpportunityForm.controls["OriginatingLead"].setValue(this.OriginatingLead);

        }

        //Created Date
        this.OpportunityForm.controls["CreatedDate"].setValue(this.CreatedDateStr);


        //Get Opportunity Products
        this.GetOpportunityProducts(this.OppId);
      }


    });

  }
  ClickNewContact(e) {
    //TODO
  }

  OnIndustryChange(e) {
    //TODO
  }

  onSubmit(MyOpportunityForm: any, myPanel, e) {
    debugger;
    if (this.OpportunityForm.invalid) {
      if (MyOpportunityForm.OppTopic == null) {
        this.OpportunityForm.controls["OppTopic"].setErrors({ required: true });
        this.OpportunityForm.controls["OppTopic"].markAsTouched();
        this.renderer.selectRootElement('#OppTopic').focus();
        return;
      }
      if (MyOpportunityForm.AccountId == null) {
        this.OpportunityForm.controls["AccountId"].setErrors({ required: true });
        this.OpportunityForm.controls["AccountId"].markAsTouched();
        //this.renderer.selectRootElement('#AccountId').focus();
        //return;
      }

      if (MyOpportunityForm.ProbabilityId == null) {
        this.OpportunityForm.controls["ProbabilityId"].setErrors({ required: true });
        this.OpportunityForm.controls["ProbabilityId"].markAsTouched();
        this.renderer.selectRootElement('#ProbabilityId').focus();
        return;
      }
      else {
        this.OpportunityForm.controls["ProbabilityId"].setErrors({ required: false });
        //this.OpportunityForm.controls["EstCloseDate"].status
      }

      if (MyOpportunityForm.EstCloseDate == null) {
        this.OpportunityForm.controls["EstCloseDate"].setErrors({ required: true });
        this.OpportunityForm.controls["EstCloseDate"].markAsTouched();
        this.renderer.selectRootElement('#EstCloseDate').focus();
        return;
      }
      else {
        this.OpportunityForm.controls["EstCloseDate"].setErrors({ required: false });
      }

    }

    //debugger;
    this.MyOppForm = new OpportunityDTO();

    this.MyOppForm.Id = this.OppId;
    this.MyOppForm.OppTopic = MyOpportunityForm.OppTopic;

    this.MyOppForm.AccountId = MyOpportunityForm.AccountId;
    this.MyOppForm.ContactId = MyOpportunityForm.ContactId;

    this.EstCloseDate = new Date(MyOpportunityForm.EstCloseDate);
    debugger;
  

    if(this.OpportunityForm.controls["EstCloseDate"].status=="VALID")
    {
      this.EstCloseDateStr=MyOpportunityForm.EstCloseDate;
      if(this.EstCloseDateStr !=null)
      {
        this.EstCloseDateDay=MyOpportunityForm.EstCloseDate.day;
        this.EstCloseDateMonth=MyOpportunityForm.EstCloseDate.month;
        this.EstCloseDateYear=MyOpportunityForm.EstCloseDate.year;

        this.EstCloseDateStrA=MyOpportunityForm.EstCloseDate.year+"-"+MyOpportunityForm.EstCloseDate.month+"-"+MyOpportunityForm.EstCloseDate.day;
        this.EstCloseDateStrB=new Date(MyOpportunityForm.EstCloseDate.day,MyOpportunityForm.EstCloseDate.month,MyOpportunityForm.EstCloseDate.year).toString();

        this.EstCloseDate=new Date(MyOpportunityForm.EstCloseDate.day,MyOpportunityForm.EstCloseDate.month,MyOpportunityForm.EstCloseDate.year);
        //this.MyContactInfo.AnniversaryDate=this.AnniversaryDate;
      }
      else
      {
        this.EstCloseDateStrA=MyOpportunityForm.EstCloseDate.toString();
      }
    }

    //this.EstCloseDate = this.reqDateFormatPipe.transform(MyOpportunityForm.EstCloseDate);


    this.MyOppForm.EstCloseDate = this.EstCloseDateStrA;
    this.MyOppForm.ProbabilityId = MyOpportunityForm.ProbabilityId;
    this.MyOppForm.EstRevenue = MyOpportunityForm.EstRevenue;
    this.MyOppForm.OppDesc = MyOpportunityForm.OppDescription;
    this.MyOppForm.CurId = MyOpportunityForm.CurId;
    this.MyOppForm.ActualRevenue = MyOpportunityForm.ActualRevenue;
    //this.MyOppForm.OwnerId=this.userDetails.UserID;
    if (this.OpportunityForm.valid) {
      //TODO
      //debugger;
      if (this.FormMode == "NEW") {

        this.MyOppForm.CreatedBy = this.userDetails.UserID;
        this.CreateOpportunity(this.MyOppForm);

      }
      else {

        this.MyOppForm.UpdatedBy = this.userDetails.UserID;
        this.UpdateOpportunity(this.MyOppForm)
      }

    }
  }

  CreateOpportunity(OpportunityInfo: any) {
    const self = this;
    this.blockUI.start('Creating lead...'); // Start blocking 
    this.result = this.CRMService.CreateOpportunity(OpportunityInfo).subscribe(
      (data: any) => {

        debugger;

        if (data.Status == "SUCCESS") {
          this.OppId = data.Data;
          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Lead Created successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          this.router.navigate([`/crm/opportunities/`]);
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


  UpdateOpportunity(OpportunityInfo: any) {
    const self = this;
    //this.blockUI.start('Updateing lead...'); // Start blocking 

    OpportunityInfo.UpdatedBy = this.userDetails.UserID;

    this.result = this.CRMService.UpdateOpportunity(OpportunityInfo).subscribe(
      (data: any) => {

        if (data.Status == "SUCCESS") {

          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Lead updated successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          this.router.navigate([`/crm/opportunities/`]);
          //this.router.navigate(['/crm/leads/`{0}`']);
          //this.router.navigate([`/crm/leads/${this.FormMode}/${this.LeadId}/2`]);

          //this.GetLeadInfo(this.LeadId);
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

          self.snackBar.open("Problem in updateing lead please try again", null, {
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
          }, 300);

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

  

  GetProbabilityDomainItem() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetProbabilityDomainItem();
    lead.subscribe((ProbabilityDomainItemRes) => {
      //debugger;
      if (ProbabilityDomainItemRes != null) {
        this.ProbabilityDomainItemList = ProbabilityDomainItemRes;
        this.showLoadingIcon = false;
      }

      // setTimeout(() => {
      //   //this.blockUI.stop(); // Stop blocking
      // }, 500);
    });
  }
  GetAllCurrencies() {
    this.CRMService.GetAllCurrencies().subscribe((data: Currency[]) => {
      //debugger;
      this.CurrencyList = data;

    });
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
  OnAccountChange(e) {
    console.log(e.currentTarget.value);
  }

  GetContactsByAccount() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetContactsByAccount();
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
  GetContactsByAccounts(searchTerm: any) {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    //http://localhost/StellifyFlowsAPI/api/accounts/GetContactsByAccounts?SearchTerm=spa
    let ContactAccountsR = <Observable<any>>this.CRMService.GetContactsByAccounts(searchTerm);
    ContactAccountsR.subscribe((ContactsAccountsListRes) => {
      //debugger;
      if (ContactsAccountsListRes != null) {
        this.ContactsAccountsList = ContactsAccountsListRes;
        this.showLoadingIcon = false;
      }

      // setTimeout(() => {
      //   //this.blockUI.stop(); // Stop blocking
      // }, 500);
    });
  }

  OnCurrencyChange(e) {
    console.log(e.currentTarget.value);
  }

  onSelectAccountContact(e) {
    debugger;
    this.selectedAccountContact = e.AccountId + '-' + e.AccountName + '-' + e.ContactId + '-' + e.ContactName;
    console.log(e);
    this.AccountId = e.AccountId;
    this.ContactId = e.ContactId;


    this.OpportunityForm.controls["AccountId"].setValue(this.AccountId);
    this.OpportunityForm.controls["ContactId"].setValue(this.ContactId);


  }

  ResetPagerConfig() {
    this.ProductsListsPagerConfig.RecordsToSkip = 0;
    this.ProductsListsPagerConfig.RecordsToFetch = 25;

    this.OpportunityProductsListsPagerConfig.RecordsToSkip=0;
    this.OpportunityProductsListsPagerConfig.RecordsToFetch=100;

    this.currentPage = 1;
  }

  GetProductsList() {
    debugger;
    this.SearchProductInfo = new SearchProducts();

    this.SearchProductInfo.ProductCode = "";
    this.SearchProductInfo.ProductName = "";
    this.SearchProductInfo.ProductIsActive = true;
    this.SearchProductInfo.Skip = 0;
    this.SearchProductInfo.Take = 1000;
    this.SearchProductInfo.UserId = this.UserId;
    this.SearchProductInfo.CreatedBy = this.UserId;
    this.SearchProductInfo.FromDate = "2023-09-10";
    this.SearchProductInfo.ToDate = "";

    this.SearchAllProducts(this.SearchProductInfo);


  }
  ProductsListPageChange(currentPageNumber: any) {
    debugger;
    if (currentPageNumber != null && currentPageNumber != undefined) {
      this.ProductsListsPagerConfig.RecordsToSkip = this.ProductsListsPagerConfig.RecordsToFetch * (currentPageNumber - 1);

      this.GetProductsList();
    }

  }

  SearchAllProducts(ProductFilterData?: SearchProducts) {
    debugger;

    if (ProductFilterData.ProductIsActive) {
      this.ProductIsActive = true;
    }
    else {
      this.ProductIsActive = false;
    }
    this.UserId = this.userDetails.UserID;
    let ProductSearchInput = {
      ProductCode: ProductFilterData.ProductCode,
      ProductName: ProductFilterData.ProductName,
      ProductisActive: ProductFilterData.ProductIsActive,
      Skip: ProductFilterData.Skip,
      Take: ProductFilterData.Take,
      CreatedBy: ProductFilterData.CreatedBy,
      UserId: ProductFilterData.UserId,
      FromDate: ProductFilterData.FromDate,
      ToDate: ProductFilterData.ToDate

    };
    this.showLeftPanelLoadingIcon = true;
    this.CRMService.SearchProducts(ProductSearchInput)
      .subscribe((data: any) => {
        debugger;
        this.showLeftPanelLoadingIcon = false;
        this.TotalRecords = data.TotalRecords;
        debugger;
        this.ShowProductsPopUp=true; 
        if (data.TotalRecords > 0) {
          //debugger;
          this.TotalRecords = data.TotalRecords;
          this.ProductsLists = data.ProductsList;
          this.ProductsListsPagerConfig.TotalRecords = data.TotalRecords;

        }
        else {
          this.TotalRecords = data.TotalRecords;
          this.ProductsLists = data.ProductsList;
          this.ProductsListsPagerConfig.TotalRecords = data.TotalRecords;
          this.filterMessage = "No matching records are found";
        }
      }, (error) => {
        this.showLeftPanelLoadingIcon = false;
      });
  }

//Opportunity Grid Functions
DeleteOpportunityProduct(OpportunityProductId,OpportunityId,e)
{
  alert(OpportunityProductId + '  ' +OpportunityId );
  this.ShowConfirmForOpportunityPopop=true;
}
onOppProductRowSelect(event) {
  let i = 0;
  debugger;
  this.SelectedOppProducts = "";
  for (i = 0; i <= this.selectedItemsOpp.length - 1; i++) {
      if (this.SelectedOppProducts == "") {
          this.SelectedOppProducts = this.selectedItemsOpp[i].ProductId;
          this.SelectedOppProductName= this.selectedItemsOpp[i].ProductName;
      }
      else {
          this.SelectedProducts = this.SelectedProducts + "," + this.selectedItemsOpp[i].ProductId;
          this.SelectedProductName = this.SelectedProductName + "," + this.selectedItemsOpp[i].ProductName;
      }
  }
  this.TotalSelectedOppProducts = this.selectedItemsOpp.length;
  //alert("Selected Leads : " + this.SelectedProducts + "\n Total Selected Leads : " + this.TotalSelectedProducts);
}
onOppProductRowUnselect(event) {
  let i = 0;
  debugger;
  this.SelectedOppProducts = "";
  for (i = 0; i <= this.selectedItemsOpp.length - 1; i++) {
      if (this.SelectedOppProducts == "") {
          this.SelectedOppProducts = this.selectedItemsOpp[i].ProductId;
          this.SelectedOppProductName= this.selectedItemsOpp[i].ProductName;
      }
      else {
          this.SelectedOppProducts = this.SelectedOppProducts + "," + this.selectedItemsOpp[i].ProductId;
          this.SelectedOppProductName = this.SelectedOppProductName + "," + this.selectedItemsOpp[i].ProductName;
      }
  }
  this.TotalSelectedOppProducts = this.selectedItemsOpp.length;
  if(this.TotalSelectedOppProducts==0)
  {
      this.SelectedOppProducts="";
      this.SelectedOppProductName="";
  }
  //alert("Un Selected Leads : " + this.SelectedProducts + "\n Total Un Selected Leads : " + this.TotalSelectedProducts);
}


//*********************************************************************************************************************/
//Grid Functions
//*********************************************************************************************************************/
onRowSelect(event) {
  let i = 0;
  this.SelectedProducts = "";
  for (i = 0; i <= this.selectedItems.length - 1; i++) {
      if (this.SelectedProducts == "") {
          this.SelectedProducts = this.selectedItems[i].ProductID;
          this.SelectedProductName= this.selectedItems[i].ProductName;
      }
      else {
          this.SelectedProducts = this.SelectedProducts + "," + this.selectedItems[i].ProductID;
          this.SelectedProductName = this.SelectedProductName + "," + this.selectedItems[i].ProductName;
      }
  }
  this.TotalSelectedProducts = this.selectedItems.length;
  //alert("Selected Leads : " + this.SelectedProducts + "\n Total Selected Leads : " + this.TotalSelectedProducts);
}
onRowUnselect(event) {
  let i = 0;
  this.SelectedProducts = "";
  for (i = 0; i <= this.selectedItems.length - 1; i++) {
      if (this.SelectedProducts == "") {
          this.SelectedProducts = this.selectedItems[i].ProductID;
          this.SelectedProductName= this.selectedItems[i].ProductName;
      }
      else {
          this.SelectedProducts = this.SelectedProducts + "," + this.selectedItems[i].ProductID;
          this.SelectedProductName = this.SelectedProductName + "," + this.selectedItems[i].ProductName;
      }
  }
  this.TotalSelectedProducts = this.selectedItems.length;
  if(this.TotalSelectedProducts==0)
  {
      this.SelectedProducts="";
      this.SelectedProductName="";
  }
  //alert("Un Selected Leads : " + this.SelectedProducts + "\n Total Un Selected Leads : " + this.TotalSelectedProducts);
}




ClickSelected(event) {
  debugger;
  let i = 0;

  this.SelectedProducts = "";
  if(this.selectedItems !=null)
  {
      for (i = 0; i <= this.selectedItems.length - 1; i++) {
          if (this.SelectedProducts == "") {
              this.SelectedProducts = this.selectedItems[i].Id;
          }
          else {
              this.SelectedProducts = this.SelectedProducts + "," + this.selectedItems[i].Id;
          }
      }
      this.TotalSelectedProducts = this.selectedItems.length;

      //alert("Selected Leads : " + this.SelectedProducts + "\n Total Selected Leads : " + this.TotalSelectedProducts);

  }
}
//*************************************************************************************************************/
GetOpportunityProducts(OppId: any) {
  //this.blockUI.start("Loading..."); // Start blocking

  //debugger;
  this.UserId = this.userDetails.UserID;

  this.showLoadingIcon = true;
  let Opp = <Observable<any>>this.CRMService.GetOpportunityProducts(OppId, this.UserId);
  Opp.subscribe((OpportunityProductoRes) => {
    //debugger;
    if (OpportunityProductoRes != null) 
    {
      debugger;
      this.OpportunityProductsResult=OpportunityProductoRes;

      this.OpportunityProductsLists=OpportunityProductoRes.OpportunityProductsLists
      //OpportunityProductsLists


      setTimeout(() => {
        this.blockUI.stop(); // Stop blocking
      }, 200);
      this.showLoadingIcon = false;



    }


  });

}
//*************************************************************************************************************/
//Saving Products
//*************************************************************************************************************/
ClickAddProducts(e)
{

  //Refresh Products List
  this.ProductsLists=[];
  this.selectedItems=[];
  this.GetProductsList();
  
  // setTimeout(() => {
  //   this.ShowProductsPopUp=true;  
  // }, 300);

}
ClickCloseProducts(e) {
  console.log("Click Close Products " + this.SelectedProducts);
  this.ShowProductsPopUp = false;
}
ClickAddToOpportunity(e) {
  console.log("Click Save Products " + this.SelectedProducts);
  //alert("Selected Products .. " + this.SelectedProducts);
  debugger;
  console.log(this.selectedItems);

  //Refresh Products List

  this.AddOpportunityProduct(e);
}
AddOpportunityProduct(e) {
  debugger;
  //New Code
  
  let SelectedProducts = this.selectedItems;
  this.OpportunityProductsInputInfo = new OpportunityProductsInput();

  this.OpportunityProductsInputInfo.createdBy = this.UserId;
  this.OpportunityProductsInputInfo.opportunityId = this.OppId;

  for(var i=0;i<=SelectedProducts.length-1;i++)
  {
  //Product 1
    this.OpportunityProductsInfo1 = new OpportunityProductsDTO();
    this.OpportunityProductsInfo1.productId = SelectedProducts[i].ProductID;;
    this.OpportunityProductsInfo1.writePName = " Write Nmae " + SelectedProducts[i].ProductID.toString();
    this.OpportunityProductsDTOList.push(this.OpportunityProductsInfo1);

    this.OpportunityProductsInputInfo.opportunityProductsDTOs.push(this.OpportunityProductsInfo1);
  }

  //Using Interface to add 


  //Call API
  this.AddOpportunityProducts(this.OpportunityProductsInputInfo);


}
AddOpportunityProducts(OpportunityInfo: any) {
  const self = this;
  this.blockUI.start('Adding Products To Opportunity ...'); // Start blocking 
  //alert(OpportunityInfo.opportunityId);
  this.result = this.CRMService.AddOpportunityProducts(OpportunityInfo).subscribe(
    (data: any) => {

      debugger;

      if (data.Status == "SUCCESS") {
        setTimeout(() => {
          this.blockUI.stop(); // Stop blocking
        }, 300);

        this.TotalProductsSend = 2;
        this.TotalProductsExists = data.TotalProductsExists;
        this.ShowProductsPopUp=false;

        if (this.TotalProductsSend == this.TotalProductsExists) 
        {
          self.snackBar.open("Products Already Exists", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }

        else {
          self.snackBar.open("Products Added successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });
        }

        //Refresh Opportunity Products
        this.GetOpportunityProducts(this.OppId);        


        //this.router.navigate([`/crm/opportunities/`]);
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

//*************************************************************************************************************/
//*************************************************************************************************************/
//Sorting Functions
//*************************************************************************************************************/

CustomSortOppProducts(event: SortEvent) {
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
CustomSortProductsList(event: SortEvent) {
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
  //*************************************************************************************************************/
  ChangeStatus(e)
  {
    console.log(e);
  }



}
