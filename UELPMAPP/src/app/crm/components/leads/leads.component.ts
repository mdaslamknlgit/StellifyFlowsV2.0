import { AfterViewInit, Component, ContentChildren, ElementRef, Inject, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { CRMService } from '../../services/crm.service';
import { Observable } from 'rxjs';

import { Lead, LeadQualifyInput, LeadStatusDomainItem } from '../../models/Lead';
import { NodeService } from '../../services/node-service';

import { TreeTableModule, TreeTable } from "primeng/treetable";
import { TreeNode } from "primeng/api";
import { SelectionModel } from "@angular/cdk/collections";
import { Email } from '../../models/Emails';
import { PageTreeNode, RoleAccessLevel, RolePageModule } from '../../../administration/models/role';
import { RoleManagementApiService } from '../../../administration/services/role-management-api.service';
import { Table } from 'jspdf-autotable';
import { ContactGroups, LeadQualifyDetail, LeadQualifyRequest, LeadsDTO,ListIds } from '../../models/LeadsDTO';
import { FormBuilder, FormGroup, NgControl, Validators } from '@angular/forms';
import { Currency, LeadsName, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { ContactDTO } from '../../models/ContactDTO';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { CRMHelperService } from '../../services/crm.helper.service';
import { MarketingList } from '../../models/crm.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs/operators';
import { UserManagement } from '../../../administration/models/usermanagement';
import { AccountsDTO, AccountsDomainItem } from '../../models/AccountsDTO';
import { LeadconvertComponent } from '../leadconvert/leadconvert.component';

//import { FocusInvalidInputDirective } from '../../directives/FocusInvalidInputDirective';
//import { CurrencyService } from '../../services/currency.service';
//'src/app/administration/services/role-management-api.service';

@Component({
  selector: 'app-leads-list',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})
export class LeadsComponent implements OnInit, AfterViewInit {

AssignedUserId:number;
AssignedUserName:string;

  AccountId:number=0;
  AccountName:string;

  LeadRating:number;

  ContactId:number=0;
  ContactName:string;

  ReportingUserList:any;
  type: any;

  HideAssignedTo:boolean=true;
  ShowContactGroups:boolean=false;

  ContactGroupsList: ContactGroups;
  ListIdss:ListIds[]=[];
  LeadListIdss:ListIds[]=[];


  SelectedConnections: string = '';

  UpdatedContactGroups: string='';

  TotalSelectedConnections: number = 0;
  SelectedListItems: any[]=[];
  SelectedConnectionsIds = [];
  ConnectionsPagerConfig: PagerConfig;
  ConnectionsListsCols: any[];
  ConnectionsLists: MarketingList[] = [];
  
  ListInfo:MarketingList;
  FilterConnectionsLists: MarketingList[] = [];
  interval;
  IsFilterDataArrive: boolean = false;
  TotalRecords:number;
  showLeftPanelLoadingIcon: boolean = false;

  CreatedBy:number;
  CreatedUser:string;

  OwnerId:number;
  OwnerName:string;

  @BlockUI() blockUI: NgBlockUI;
  @ViewChild("Topic") TopicF: ElementRef;
  @ContentChildren(NgControl) formControls: QueryList<NgControl>;
  //@ViewChild(FocusInvalidInputDirective) invalidInputDirective: FocusInvalidInputDirective;
  LeadStatusId: number=0;
  LeadStatusName: string;
  IsQualified: boolean = false;
  ConvertedBy: number;
  ConvertedDate: Date;
  IsClose: boolean = false;

  disabledselect:boolean=true;

  ShowQualify: boolean = false;
  ShowDisQualify:boolean=false;

  IsReadOnly:string="readonly";

  IsSummaryExpand: boolean = true;
  IsDetailsExpand: boolean = true;
  IsContactGroupsExpand:boolean=true;

  currencyTypes: Currency[] = [];
  CurrencyList: Currency[] = [];

  LeadStatusDomainItemList: LeadStatusDomainItem[] = [];

  selectedFiles2: any;
  ShowColumn: boolean = true;
  Showother: boolean = false;
  selection = new SelectionModel<Email>(true, []);
  //SelectedEmailsList: Email[] = [];
  SelectedLeadsList: Lead[] = [];

  HeaderTitle: string;
  showLoadingIcon: boolean = false;
  gridColumns: Array<{ field: string, header: string }> = [];
  pageModules: PageTreeNode[];
  loading: boolean;
  roleAccessLevels: RoleAccessLevel[];
  hideInput: boolean = false;

  SelectedListId: number = 0;
  SelectedList: number;
  Listss: Array<any> = [];
  //MyLists: Lists[] = [];

  @ViewChild("MyLeadsTable") public MyLeadsTableEl: ElementRef;
  @ViewChild("MyLeadsTable") public MyLeadsTableElTbl: TreeTable;

  // @ViewChild('treeTable') table: TreeTable;

  @ViewChild("MyLeadsTable") MyLeadsTableT: TreeTable;
  //MyLeadsTable

  LeadId: number;
  LeadMode: string;
  LeadInfo: LeadsDTO;

  MyLeadQualifyRequest:LeadQualifyRequest;
  MyLeadQualifyDetails:LeadQualifyDetail;

  ReturnLink: string;

  LeadForm: FormGroup;
  LeadQualifyForm: FormGroup;
  AccountsDomainItemList: Array<AccountsDomainItem> = [];
  FormMode: string;
  formError: string;
  MyLead: Lead;
  MyLeadQualifyInput:LeadQualifyInput;
  
  ContactInfo:ContactDTO;
  AccountInfo:AccountsDTO;

  MyLeadIds = [];
  private result;
  //CurrencyList = [];
  LeadSourceList = [];
  IndustryList = [];
  LeadRatingDomainItems = [];

  SalutationList = [];

  SalutationId: number;
  FirstName:string;
  LastName:string;
  Mobile:string;
  EmailId:string;
  CompanyName:string;


  CurrencyIdSelected: number;
  IsConvert: boolean;
  LeadTopic: string;
  userDetails: UserDetails = null;
  UserId: number;
  CompanyId: number;
  LeadSourceSelected: number = 0;
  SelectedLeadSourceId: number = 0;
  Currency: any;

  itemsEndpoint : string = `${environment.apiEndpoint}`;
  //@ViewChildren('Topic','FirstName') inputElements: QueryList<ElementRef>;
  //@ViewChildren('topicInput', 'firstNameInput') inputElements: QueryList<ElementRef>;

  //@ViewChildren('topicInput', 'firstNameInput') inputElements: QueryList<any>;

  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
  //emailPattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$";
  constructor(
    public dialog: MatDialog,
    public DialogAssignTo: MatDialog,
    private http: HttpClient,
    private el: ElementRef,
    private renderer: Renderer2,
    public snackBar: MatSnackBar,
    private sessionService: SessionStorageService,
    private router: Router,
    private fb: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private roleApiService: RoleManagementApiService,
    private CRMService: CRMService,
    private CRMHlperService: CRMHelperService,
    //private currencyService: CurrencyService,
    private nodeService: NodeService,
    private route: ActivatedRoute
  ) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.UserId = this.userDetails.UserID;
    this.CompanyId = this.sessionService.getCompanyId();
    //this.Currency=this.sessionService.getBaseCurrency();
  }
  ngAfterViewInit(): void {
    //this.TopicF.nativeElement.focus();
    this.renderer.selectRootElement('#Topic').focus();

    // After the view is initialized, set focus on the first invalid field
    //debugger;
    // const firstInvalidField = this.inputElements.find((el) => this.invalidFields.includes(el.nativeElement.name));
    // if (firstInvalidField) {
    //   firstInvalidField.nativeElement.focus();
    // }

  }
  InitializeLeadForm() {
    this.LeadForm = this.fb.group({
      LeadId:[0],
      SalutationId: [''],
      Topic: [null, [Validators.required]],
      FirstName: [null, [Validators.required]],
      LastName: [null, [Validators.required]],
      JobTitle: [''],
      BusinessPhone: [''],
      Mobile: [''],
      //Rating: new FormControl({value: null, disabled: true}, [Validators.required]),
      LeadRating: [null],
      // Email: ['',[Validators.required,Validators.pattern(this.emailPattern)]],    
      Email: [null, [Validators.required, Validators.pattern(this.emailPattern)]],
      CompanyName: [null, [Validators.required]],
      AnnualRevenue: [0],
      EstBudget: [''],
      NoOfEmployee: [''],
      SourceCampaign: [''],
      LeadSourceId: [null, [Validators.required]],
      LeadStatId: [1],
      RatingId: [''],
      LeadRatingId:[0,[Validators.required]],
      CurId: [''],
      WebSite: [''],
      Street1: [''],
      Street2: [''],
      Street3: [''],
      Country: [''],
      City: [''],
      Locality: [''],
      LandMark: [''],
      PinCode: [''],
      CreatedBy:[0],
      OwnerId:[0],
      CreatedDate: [''],
      UpdatedDate: [''],
      IsConvert: [''],
      AccountId:[0],
      Contactid:[0],
      OpportunityId:[0],
      OpportunityTopic:[''],
      IndsId:[0]

    });
  }

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
      TotalAmount:[1,[Validators.required]],
      UpfrontOrAdvance:[2,[Validators.required]],
      PoNumber:[3,[Validators.required]],
      Balance:[4,[Validators.required]],
      Remarks:['.',[Validators.required]],
      CreatedBy:[0]
    });
  }
  ngOnInit() {
    // var a=this.CRMHlperService.formatCurrency(100);
    // alert(this.Currency);
    // alert(a);
    this.ConnectionsListsCols = [
      { field: 'ListName', header: 'List Name', width: '200px' },
      { field: 'ListDesc', header: 'List Desc', width: '200px' },
    ];

    this.InitializeLeadForm();

    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      if (param.get('mode') != undefined) {
        this.LeadMode = param.get('mode');
        this.FormMode = param.get('mode');
      }
      if (param.get('Id') != undefined) {
        this.LeadId = parseInt(param.get('Id'));
      }
      if (param.get('return') != undefined) {
        this.ReturnLink = param.get('return');
      }

      //Get ContactId,AccountId
      if (param.get('ContactId') != undefined) {
        this.ContactId =parseInt(param.get('ContactId'));
      }
      if (param.get('AccountId') != undefined) {
        this.AccountId =parseInt(param.get('AccountId'));
      }

    });
    this.GetSalutation();
    this.GetAllCurrencies();
    this.GetLeadSource();
    this.GetIndustry();
    this.GetLeadStatusDomainItem();
    this.GetLeadRatingDomainItem();

    //alert(" Purchase Order Creation \n  Purchase Order ID : " + this.pPurchaseOrderId + "\n Purchase Order Type : " + this.pPurchaseOrderTypeId + "\n Supplier Id: " + this.SupplierID);
    if (this.LeadId > 0) {
      //debugger;
      
      const result = this.http.get(`${this.itemsEndpoint}/connection/GetList`).pipe(map((ConnectionsLists: any) => ConnectionsLists));

      //debugger;
      //this.GetMarketingList();
      this.GetLeadInfo(this.LeadId);
    }
    else {
      this.FormMode = "NEW";
    }


    if (this.FormMode == "NEW") {
      this.LeadForm.get('SalutationId').setValue(0);
      this.LeadForm.get('LeadSourceId').setValue(0);
      this.IsSummaryExpand = true;
      this.IsDetailsExpand = true;
      this.IsContactGroupsExpand=true;

      this.ShowQualify = false;
      this.ShowDisQualify=false;
      this.disabledselect=false;

      this.GetUserInfoByUserId(this.UserId);
      this.HideAssignedTo=true;
    }
    else {

      this.HideAssignedTo=false;
      this.IsSummaryExpand = true;
      this.IsDetailsExpand = true;
      this.IsContactGroupsExpand=true;
      this.IsReadOnly="";
      this.disabledselect=true;

    }

    //this.renderer.selectRootElement('#MyTopic').focus();
  }

  GetUserInfoByUserId(UserId: number) {
    let userId = UserId;
    this.CRMService.GetUserInfoByUserId(userId)
        .subscribe((data: UserManagement) => {
          debugger;
            this.CreatedUser=data.FirstName + " " + data.LastName;
        }, (error) => {
           
        });
  }
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  SearchContact(e)
  {
    console.log("Show dropdown");
  }
  ClickBack(e) {
    if (this.ReturnLink == "1") {
      this.router.navigate([`/crm/leadslist`]);
    }
    else if (this.ReturnLink == "2") {
      this.router.navigate([`/crm/leadlists/${this.getRandomInt(10)}`]);
    }
    else if (this.ReturnLink == "3")
    {
      this.router.navigate([`/crm/contacts/EDIT/${this.ContactId}/1/0`]);
    }
  }
  // GetProbabilityList() {
  //   let lead = <Observable<any>>this.probabilityService.GetProbabilityList();
  //   lead.subscribe((ResProbability) => {
  //     if (ResProbability != null) {
  //       this.ProbabilityList = ResProbability;
  //       this.ProbabilityIdSelected = 0;
  //     }
  //   });
  // }
  GetCurrency() {
    //this.blockUI.start('Loading...'); // Start blocking   
    // this.showLoadingIcon=true;

    // let lead = <Observable<any>>this.currencyService.GetCurrencyList();
    // lead.subscribe((CurrencyInfoRes) => {
    //   this.showLoadingIcon=false;
    //   if (CurrencyInfoRes != null) {
    //     this.CurrencyList = CurrencyInfoRes;
    //   }

    //   setTimeout(() => {
    //     //this.blockUI.stop(); // Stop blocking
    //   }, 500);
    // });
  }
  GetAllCurrencies() {
    this.CRMService.GetAllCurrencies().subscribe((data: Currency[]) => {
      //debugger;
      this.currencyTypes = data;
      this.CurrencyList = data;
      // if (this.CustomerIPSId == 0) {
      //   let selectedcc = this.currencyTypes.find(x => x.Id == this.company.Currency.Id);
      //   this.f.Currency.setValue(selectedcc);
      // }
    });
  }
  GetSalutation() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetSalutation();
    lead.subscribe((SalutationInfoRes) => {
      //debugger;
      if (SalutationInfoRes != null) {
        this.SalutationList = SalutationInfoRes;
        this.showLoadingIcon = false;
      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
      }, 500);
    });
  }

  GetLeadSource() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetLeadSource();
    lead.subscribe((LeadSourceInfoRes) => {
      //debugger;
      if (LeadSourceInfoRes != null) {
        this.LeadSourceList = LeadSourceInfoRes;
        this.showLoadingIcon = false;
      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
      }, 500);
    });
  }
  GetIndustry() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let IndustryR = <Observable<any>>this.CRMService.GetIndustryDomainItem();
    IndustryR.subscribe((IndustryRes) => {
      //debugger;
      if (IndustryRes != null) {
        this.IndustryList = IndustryRes;
        this.showLoadingIcon = false;
      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
      }, 500);
    });
  }

  GetLeadRatingDomainItem() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let IndustryR = <Observable<any>>this.CRMService.GetLeadRatingDomainItem();
    IndustryR.subscribe((LeadRatingRes) => {
      //debugger;
      if (LeadRatingRes != null) {
        this.LeadRatingDomainItems = LeadRatingRes;
        this.showLoadingIcon = false;
      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
      }, 500);
    });
  }

  SetLeadStatus(leadStatId: number) {
    //debugger;
    if (this.LeadStatusDomainItemList.length > 0) {
      var selectedLeadStatus = this.LeadStatusDomainItemList.find(x => x.LeadStatId == leadStatId);
      this.LeadStatusName = selectedLeadStatus.LeadStatName;
    }

  }
  GetLeadStatusDomainItem() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let LeadStatusDomain = <Observable<any>>this.CRMService.GetLeadStatusDomainItem();
    LeadStatusDomain.subscribe((LeadStatusDomainItemRes) => {
      //debugger;
      if (LeadStatusDomainItemRes != null) {
        this.LeadStatusDomainItemList = LeadStatusDomainItemRes;
        this.showLoadingIcon = false;

        //debugger;
        if (this.LeadStatusId != 0) {
          var selectedLeadStatus = this.LeadStatusDomainItemList.find(x => x.LeadStatId == this.LeadStatusId);
          this.LeadStatusName = selectedLeadStatus.LeadStatName;
        }

      }
      
      // setTimeout(() => {
      //   //this.blockUI.stop(); // Stop blocking
      // }, 500);
    });
  }

  GetLeadInfo(leadid: any) {
    //this.blockUI.start("Loading..."); // Start blocking
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetLeadById(leadid);
    lead.subscribe((LeadInfoRes) => {
      
      //Check If Need to show Contact Groups
      //this.ShowContactGroups=true;
      // if(this.ShowContactGroups)
      // {
      //   this.GetMarketingList();
      // }

      //this.LeadInfo = LeadInfoRes;
      this.LeadInfo = LeadInfoRes.Lead;
      this.LeadListIdss=LeadInfoRes.ListIds;

      let LListIds=LeadInfoRes.ListIds;

      this.TotalSelectedConnections=LeadInfoRes.ListIds.length;

      let LeadContactGroups = this.LeadListIdss.map(e => e.ListId).join(",")
      let MyConnectionsList=this.ConnectionsLists;

      //debugger;
      this.TotalSelectedConnections=LListIds.length;
      for(let i=0;i<LListIds.length;i++)
      {
        let a = MyConnectionsList.filter(x=>x.Id==LListIds[i].ListId)[0];

        this.SelectListById(a);
      }
     

      this.UpdatedContactGroups=LeadContactGroups;
      if (LeadInfoRes != null) {
        
        this.showLoadingIcon = false;    

        this.LeadTopic = this.LeadInfo.Topic;
        this.LeadForm.controls["LeadId"].setValue(leadid);
        this.LeadForm.controls["Topic"].setValue(this.LeadInfo.Topic);
        this.LeadForm.controls["SalutationId"].setValue(this.LeadInfo.SalutationId);
        this.LeadForm.controls["FirstName"].setValue(this.LeadInfo.FirstName);
        this.LeadForm.controls["LastName"].setValue(this.LeadInfo.LastName);
        this.LeadForm.controls["JobTitle"].setValue(this.LeadInfo.JobTitle);
        this.LeadForm.controls["BusinessPhone"].setValue(this.LeadInfo.BusPhone);
        this.LeadForm.controls["Mobile"].setValue(this.LeadInfo.Mobile);
        this.LeadForm.controls["Email"].setValue(this.LeadInfo.EmailId);
        this.LeadForm.controls["SourceCampaign"].setValue(this.LeadInfo.SourceCampaign);
        this.LeadForm.controls["CompanyName"].setValue(this.LeadInfo.CompName);
        this.LeadForm.controls["AnnualRevenue"].setValue(this.LeadInfo.AnnualRevenue);
        this.LeadForm.controls["EstBudget"].setValue(this.LeadInfo.EstBudget);
        this.LeadForm.controls["NoOfEmployee"].setValue(this.LeadInfo.NoOfEmployees);
        this.LeadForm.controls["WebSite"].setValue(this.LeadInfo.WebSite);
        this.LeadForm.controls["Street1"].setValue(this.LeadInfo.Street1);
        this.LeadForm.controls["Street2"].setValue(this.LeadInfo.Street2);
        this.LeadForm.controls["Street3"].setValue(this.LeadInfo.Street3);
        this.LeadForm.controls["Country"].setValue(this.LeadInfo.Country);
        this.LeadForm.controls["City"].setValue(this.LeadInfo.City);
        this.LeadForm.controls["Locality"].setValue(this.LeadInfo.Locality);
        this.LeadForm.controls["LandMark"].setValue(this.LeadInfo.LandMark);
        this.LeadForm.controls["PinCode"].setValue(this.LeadInfo.PinCode);
        //this.LeadForm.controls["LeadSource"].setValue(this.LeadInfo.LeadSourceId);
        this.LeadForm.controls["LeadSourceId"].setValue(this.LeadInfo.LeadSourceId);
        this.LeadForm.controls["CurId"].setValue(this.LeadInfo.CurId);
        this.LeadForm.controls["LeadStatId"].setValue(this.LeadInfo.LeadStatId);

        this.LeadForm.controls["CreatedBy"].setValue(this.LeadInfo.CreatedBy);
        this.LeadForm.controls["OwnerId"].setValue(this.LeadInfo.OwnerId);
        this.LeadForm.controls["IndsId"].setValue(this.LeadInfo.IndsId);

        this.LeadForm.controls["LeadRating"].setValue(this.LeadInfo.LeadRating);
        this.LeadForm.controls["LeadRatingId"].setValue(this.LeadInfo.LeadRatingId);
        
        debugger;
        //this.LeadQualifyForm.controls['LeadRating'].setValue(3);
        let ratingControl = this.LeadForm.get('LeadRating');
   
        debugger;
        this.LeadRating=ratingControl.value;

        ratingControl.enable();
        ratingControl.patchValue(this.LeadRating);

        this.CreatedBy=this.LeadInfo.CreatedBy;
        this.CreatedUser=this.userDetails.FullName;

        this.OwnerId=this.LeadInfo.OwnerId;
        this.OwnerName=this.userDetails.FullName;

        this.AssignedUserId=this.OwnerId;
        this.AssignedUserName=this.OwnerName;

        this.LeadStatusId = this.LeadInfo.LeadStatId;
        //debugger;


        if (this.LeadStatusDomainItemList.length > 0) {
          this.SetLeadStatus(this.LeadStatusId);
        }


        this.LeadSourceSelected = this.LeadInfo.LeadSourceId;
        this.SelectedLeadSourceId = this.LeadInfo.LeadSourceId;
        this.IsConvert = this.LeadInfo.Converted;
        this.LeadForm.controls["IsConvert"].setValue(this.LeadInfo.Converted);
        this.LeadForm.controls["CreatedDate"].setValue(this.LeadInfo.CreatedDate);
        this.LeadForm.controls["UpdatedDate"].setValue(this.LeadInfo.UpdatedDate);
        this.CurrencyIdSelected = this.LeadInfo.CurId;
        this.SalutationId = this.LeadInfo.SalutationId;



        //this.LeadSourceSelected = +this.LeadInfo.LeadSource;

        //debugger;

        //Lead Status
        this.IsQualified = this.LeadInfo.IsQualified;
        this.ConvertedBy = this.LeadInfo.ConvertedBy;
        this.ConvertedDate = this.LeadInfo.ConvertedDate;
        this.IsClose = this.LeadInfo.IsClose;


        if (this.LeadInfo.CompName == "" || this.LeadInfo.CompName != null) {
          this.ShowQualify = true;
          this.ShowDisQualify=true;
        }


      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking

      }, 300);
    });

  }

  GetLeadsById(leadid: any) {
    //this.blockUI.start("Loading..."); // Start blocking
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetLeadsById(leadid);
    lead.subscribe((LeadInfoRes) => {
      //debugger;
      this.LeadInfo = LeadInfoRes;


      if (LeadInfoRes != null) {

        
        this.showLoadingIcon = false;       

        debugger;
        this.LeadTopic = LeadInfoRes.Topic;
        this.LeadForm.controls["LeadId"].setValue(leadid);
        this.LeadForm.controls["Topic"].setValue(LeadInfoRes.Topic);
        this.LeadForm.controls["SalutationId"].setValue(LeadInfoRes.SalutationId);
        this.LeadForm.controls["FirstName"].setValue(LeadInfoRes.FirstName);
        this.LeadForm.controls["LastName"].setValue(LeadInfoRes.LastName);
        this.LeadForm.controls["JobTitle"].setValue(LeadInfoRes.JobTitle);
        this.LeadForm.controls["BusinessPhone"].setValue(LeadInfoRes.BusPhone);
        this.LeadForm.controls["Mobile"].setValue(LeadInfoRes.Mobile);
        this.LeadForm.controls["Email"].setValue(LeadInfoRes.EmailId);
        this.LeadForm.controls["SourceCampaign"].setValue(LeadInfoRes.SourceCampaign);
        this.LeadForm.controls["CompanyName"].setValue(LeadInfoRes.CompName);
        this.LeadForm.controls["AnnualRevenue"].setValue(LeadInfoRes.AnnualRevenue);
        this.LeadForm.controls["EstBudget"].setValue(LeadInfoRes.EstBudget);
        this.LeadForm.controls["NoOfEmployee"].setValue(LeadInfoRes.NoOfEmployees);
        this.LeadForm.controls["WebSite"].setValue(LeadInfoRes.WebSite);
        this.LeadForm.controls["Street1"].setValue(LeadInfoRes.Street1);
        this.LeadForm.controls["Street2"].setValue(LeadInfoRes.Street2);
        this.LeadForm.controls["Street3"].setValue(LeadInfoRes.Street3);
        this.LeadForm.controls["Country"].setValue(LeadInfoRes.Country);
        this.LeadForm.controls["City"].setValue(LeadInfoRes.City);
        this.LeadForm.controls["Locality"].setValue(LeadInfoRes.Locality);
        this.LeadForm.controls["LandMark"].setValue(LeadInfoRes.LandMark);
        this.LeadForm.controls["PinCode"].setValue(LeadInfoRes.PinCode);
        //this.LeadForm.controls["LeadSource"].setValue(LeadInfoRes.LeadSourceId);
        this.LeadForm.controls["LeadSourceId"].setValue(LeadInfoRes.LeadSourceId);
        this.LeadForm.controls["CurId"].setValue(LeadInfoRes.CurId);
        this.LeadForm.controls["LeadStatId"].setValue(LeadInfoRes.LeadStatId);

        this.LeadForm.controls["CreatedBy"].setValue(LeadInfoRes.CreatedBy);
        this.LeadForm.controls["OwnerId"].setValue(LeadInfoRes.OwnerId);

        this.CreatedBy=LeadInfoRes.CreatedBy;
        this.CreatedUser=this.userDetails.FullName;

        this.OwnerId=LeadInfoRes.OwnerId;
        this.OwnerName=this.userDetails.FullName;

        this.LeadStatusId = LeadInfoRes.LeadStatId;
        //debugger;


        if (this.LeadStatusDomainItemList.length > 0) {
          this.SetLeadStatus(this.LeadStatusId);
        }


        this.LeadSourceSelected = LeadInfoRes.LeadSourceId;
        this.SelectedLeadSourceId = LeadInfoRes.LeadSourceId;
        this.IsConvert = LeadInfoRes.Converted;
        this.LeadForm.controls["IsConvert"].setValue(LeadInfoRes.Converted);
        this.LeadForm.controls["CreatedDate"].setValue(LeadInfoRes.CreatedDate);
        this.LeadForm.controls["UpdatedDate"].setValue(LeadInfoRes.UpdatedDate);
        this.CurrencyIdSelected = LeadInfoRes.CurId;
        this.SalutationId = LeadInfoRes.SalutationId;
        //this.LeadSourceSelected = +LeadInfoRes.LeadSource;

        //debugger;

        //Lead Status
        this.IsQualified = LeadInfoRes.IsQualified;
        this.ConvertedBy = LeadInfoRes.ConvertedBy;
        this.ConvertedDate = LeadInfoRes.ConvertedDate;
        this.IsClose = LeadInfoRes.IsClose;


        if (LeadInfoRes.CompName = "" || LeadInfoRes.CompName != null) {
          this.ShowQualify = true;
          this.ShowDisQualify=true;
        }


      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking

      }, 300);
    });

  }
  onCancel(e) {
    this.ClickBack(e);
  }
  spew(message) {
    console.log(message);
  }
  onSubmit(MyLeadForm: any, myPanel, e) {

    debugger;
    // this.invalidInputDirective.check(this.formControls);
    //this.invalidInputDirective.check();

    if (this.LeadForm.invalid) {

      //this.LeadForm.markAsTouched();
      // for (const key of Object.keys(this.LeadForm.controls)) {
      //   debugger;
      //   if (this.LeadForm.controls[key].invalid) {
      //     const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');
      //     invalidControl.focus();
      //     break;
      //   }
      // }

      if (MyLeadForm.Topic == null) {
        this.LeadForm.controls["Topic"].setErrors({ required: true });
        this.LeadForm.controls["Topic"].markAsTouched();
        this.renderer.selectRootElement('#Topic').focus();
        //return;
      }
      if (MyLeadForm.FirstName == null) {
        this.LeadForm.controls["FirstName"].setErrors({ required: true });
        this.LeadForm.controls["FirstName"].markAsTouched();
        this.renderer.selectRootElement('#FirstName').focus();
        //return;
      }

      if (MyLeadForm.LastName == null) {
        this.LeadForm.controls["LastName"].setErrors({ required: true });
        this.LeadForm.controls["LastName"].markAsTouched();
        this.renderer.selectRootElement('#LastName').focus();
        //return;
      }

      debugger;
      if (MyLeadForm.LeadSourceId == null || MyLeadForm.LeadSourceId == 0) {
        this.LeadForm.controls["LeadSourceId"].setErrors({ required: true });
        this.LeadForm.controls["LeadSourceId"].markAsTouched();
        //this.renderer.selectRootElement('#LeadSourceId').focus();
        //return;
      }

      if (MyLeadForm.Email == null) {
        this.LeadForm.controls["Email"].setErrors({ required: true });
        this.LeadForm.controls["Email"].markAsTouched();
        this.renderer.selectRootElement('#Email').focus();
        //return;
      }
      if (MyLeadForm.CompanyName == null || MyLeadForm.CompanyName == "") {
        this.LeadForm.controls["CompanyName"].setErrors({ required: true });
        this.LeadForm.controls["CompanyName"].markAsTouched();
        this.renderer.selectRootElement('#CompanyName').focus();
        //return;
      }

      // debugger;
      // const invalidControl = this.el.nativeElement.querySelector('.ng-invalid');

      // invalidControl.querySelector('input, select, textarea').focus();
      // var a =invalidControl.querySelector('input');

      // if (invalidControl) {
      //   invalidControl.focus();
      // }


      //return;
    }
    this.MyLead = new Lead();
    this.MyLead.Id = this.LeadId;
    this.MyLead.Topic = MyLeadForm.Topic;
    this.MyLead.SalutationId = MyLeadForm.SalutationId;
    this.MyLead.FirstName = MyLeadForm.FirstName;
    this.MyLead.LastName = MyLeadForm.LastName;
    this.MyLead.EmailId = MyLeadForm.Email;
    this.MyLead.Mobile = MyLeadForm.Mobile;
    this.MyLead.JobTitle = MyLeadForm.JobTitle;
    this.MyLead.BusPhone = MyLeadForm.BusinessPhone;
    this.MyLead.CompName = MyLeadForm.CompanyName;
    this.MyLead.AnnualRevenue = MyLeadForm.AnnualRevenue;

    this.MyLead.EstBudget = MyLeadForm.EstBudget;
    this.MyLead.NoOfEmployees = MyLeadForm.NoOfEmployee;

    this.MyLead.SourceCampaign = MyLeadForm.SourceCampaign;

    //this.MyLead.LeadSource = MyLeadForm.LeadSource;
    this.MyLead.LeadSourceId = MyLeadForm.LeadSourceId;
    this.MyLead.RatingId = 1;
    this.MyLead.LeadRatingId=1;
    this.MyLead.CurId = MyLeadForm.CurId;
    this.MyLead.WebSite = MyLeadForm.WebSite;
    this.MyLead.Street1 = MyLeadForm.Street1;
    this.MyLead.Street2 = MyLeadForm.Street2;
    this.MyLead.Street3 = MyLeadForm.Street3;
    this.MyLead.Country = MyLeadForm.Country;
    this.MyLead.City = MyLeadForm.City;
    this.MyLead.Locality = MyLeadForm.Locality;
    this.MyLead.LandMark = MyLeadForm.LandMark;
    this.MyLead.PinCode = MyLeadForm.PinCode;
    this.MyLead.CreatedDate = MyLeadForm.CreatedDate;

    this.MyLead.CompanyId = this.CompanyId;
    this.MyLead.LeadStatId = MyLeadForm.LeadStatId;
    this.MyLead.UpdatedDate = MyLeadForm.UpdatedDate;
    this.MyLead.IndsId=MyLeadForm.IndsId;
    this.MyLead.LeadRating=MyLeadForm.LeadRating;
    this.MyLead.LeadRatingId=MyLeadForm.LeadRatingId;

    this.MyLead.OwnerId = this.AssignedUserId;
    debugger;
    // const lead: Lead = {
    //   Id: this.LeadId,
    //   Topic: leadForm.Topic,
    //   SalutationId: leadForm.SalutationId,
    //   FirstName: leadForm.FirstName,
    //   LastName: leadForm.LastName,
    //   EmailId: leadForm.Email,
    //   Mobile: leadForm.Mobile,
    //   JobTitle: leadForm.JobTitle,
    //   BusPhone: leadForm.BusinessPhone,
    //   CompName: leadForm.CompanyName,
    //   AnnualRevenue: leadForm.AnnualRevenue,
    //   EstBudget: leadForm.EstBudget,
    //   NoOfEmployees: leadForm.NoOfEmployee,
    //   SourceCampaign: leadForm.SourceCampaign,
    //   LeadSource: leadForm.LeadSource,
    //   LeadSourceId: leadForm.LeadSource,
    //   RatingId: 1,
    //   CurId: leadForm.CurId,
    //   WebSite: leadForm.WebSite,
    //   Street1: leadForm.Street1,
    //   Street2: leadForm.Street2,
    //   Street3: leadForm.Street3,
    //   Country: leadForm.Country,
    //   City: leadForm.City,
    //   Locality: leadForm.Locality,
    //   LandMark: leadForm.LandMark,
    //   PinCode: leadForm.PinCode,
    //   CreatedDate: leadForm.CreatedDate,
    //   UpdatedDate: leadForm.UpdatedDate,
    // };
    //debugger;
    if (this.LeadForm.valid) {

      debugger;
      if (this.FormMode == "NEW") {

        this.MyLead.CreatedBy = this.userDetails.UserID;
        this.CreateLead(this.MyLead);

      }
      else {

        this.MyLead.UpdatedBy = this.userDetails.UserID;
        this.UpdateLead(this.MyLead)
      }



    }
    else {
      //myPanel.expanded = true; 
    }
  }


  CreateLead(Lead: any) {
    const self = this;
    this.blockUI.start('Creating lead...'); // Start blocking 
    this.result = this.CRMService.CreateLead(Lead).subscribe(
      (data: any) => {

        debugger;

        if (data.Status == "SUCCESS") {
          this.LeadId = data.Data;
          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Lead Created successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          this.router.navigate([`/crm/leadlists/${this.getRandomInt(10)}`]);
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



  UpdateLead(Lead: any) {
    const self = this;
    //this.blockUI.start('Updateing lead...'); // Start blocking 
    // CreatedBy: {
    //   UserID: this.userDetails.UserID,
    //   UserName: this.userDetails.UserName
    // },
    // UpdatedBy: {
    //   UserID: this.userDetails.UserID,
    //   UserName: this.userDetails.UserName
    // },

    Lead.UpdatedBy = this.userDetails.UserID;

    this.result = this.CRMService.UpdateLead(Lead).subscribe(
      (data: any) => {

        if (data.Status == "SUCCESS") {

          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Lead updated successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          this.router.navigate([`/crm/leadlists/${this.getRandomInt(10)}`]);
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

  OnLeadSourceChange(e) {
    debugger;
    console.log(e.currentTarget.value);
  }

  OnLeadRatingChange(e){
    console.log(e.currentTarget.value);
  }
  OnLeadStatusChange(e) {
    debugger;
    console.log(e.currentTarget.value);
    var StatusName=this.LeadStatusDomainItemList.filter(x => x.LeadStatId == e.currentTarget.value);
    this.LeadStatusName=StatusName[0].LeadStatName;
    this.LeadStatusId=StatusName[0].LeadStatId;
  }
  OnCurrencyChange(e) {
    debugger;
    console.log(e.currentTarget.value);
  }
  OnSalutationChange(e) {
    console.log(e.currentTarget.value);
  }


  get invalidFields() {
    const fields: string[] = [];
    for (const controlName in this.LeadForm.controls) {
      const control = this.LeadForm.get(controlName);
      if (control.invalid) {
        fields.push(controlName);
      }
    }
    return fields;
  }
  ClickDisQualify(e)
  {
    alert("Disqualify Selected");
  }
  onSubmitLeadQualifyform(MyLeadQualifyForm: any,  e)
  {
    debugger;
    console.log(MyLeadQualifyForm);
  }
  ClickConvertNewa(e)
  {

    let ActiityDialogRef = this.dialog.open(LeadconvertComponent, {
      width: '1000px',
      height: '750px',
      disableClose: false,
      data: { 
        HeaderTitle: this.HeaderTitle,   
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
      
      console.log(result);
      ActiityDialogRef.close();

    });
  }
  ClickConvertNew(e)
  {
    const self = this;
    //debugger;
    //Get Lead Info

    //Get Salutation Name from SalutationId
    let SalutationName=this.SalutationList.filter(x=>x.SalutationId==this.LeadForm.value.SalutationId)[0];


    this.SalutationId   = this.LeadForm.value.SalutationId;
    this.FirstName      = this.LeadForm.value.FirstName;
    this.LastName       = this.LeadForm.value.LastName;
    this.ContactName    = SalutationName + ' ' + this.LeadForm.value.FirstName + ' ' + this.LeadForm.value.LastName;
    this.Mobile         = this.LeadForm.value.Mobile;
    this.EmailId        = this.LeadForm.value.Email;
    this.CompanyName    = this.LeadForm.value.CompanyName;

    //Convert Lead Before Show the dialog
    this.HeaderTitle = "Lead Qualify .";  

    //Set LeadQualify Request  
    this.MyLeadQualifyRequest= new LeadQualifyRequest();

    this.MyLeadQualifyRequest.LeadId=this.LeadId;
    this.MyLeadQualifyRequest.UserId=this.UserId;
    this.MyLeadQualifyRequest.SalutationId=this.SalutationId;
    this.MyLeadQualifyRequest.FirstName=this.FirstName;
    this.MyLeadQualifyRequest.LastName=this.LastName;
    this.MyLeadQualifyRequest.Mobile=this.Mobile;
    this.MyLeadQualifyRequest.EmailId=this.EmailId;
    this.MyLeadQualifyRequest.CompanyName=this.CompanyName;


    //LeadQualifyDetails
    this.MyLeadQualifyDetails= new LeadQualifyDetail();
    this.MyLeadQualifyDetails.ContactId           = 0;
    this.MyLeadQualifyDetails.ContactName         = "";
    this.MyLeadQualifyDetails.AccountId           = 0;
    this.MyLeadQualifyDetails.AccountName         = "";
    this.MyLeadQualifyDetails.CanCreateContact    = "NO";
    this.MyLeadQualifyDetails.CanCreateAccount    = "NO";
    this.MyLeadQualifyDetails.CanCreateOpportunity = "YES";
    this.MyLeadQualifyDetails.DontCreateOpportunity=false;

    this.MyLeadQualifyDetails.OpportunityTopic = "";

    this.MyLeadQualifyRequest.LeadQualifyDetail=this.MyLeadQualifyDetails;

    //http://localhost/StellifyFlowsAPI/api/leads/GetLeadInfoToConvert
    let ReportingManager = <Observable<any>>this.CRMService.GetLeadInfoToConvert(this.MyLeadQualifyRequest);
    ReportingManager.subscribe((ReportingUsers) => {
      
      if (ReportingUsers !=null) 
      {

        this.ReportingUserList = ReportingUsers;

        this.AccountId=ReportingUsers.LeadQualifyDetail.AccountId;
        this.AccountName=ReportingUsers.LeadQualifyDetail.AccountName;
        this.ContactId=ReportingUsers.LeadQualifyDetail.ContactId;
        this.ContactName=ReportingUsers.LeadQualifyDetail.ContactName;

        let AccountId=ReportingUsers.LeadQualifyDetail.AccountId;
        let ContactId=ReportingUsers.LeadQualifyDetail.ContactId;

        this.IntializeLeadQualifyForm();

        debugger;
        //Check If Account Domain Items
        this.AccountsDomainItemList=ReportingUsers.Accounts;
        debugger;

        this.LeadQualifyForm.controls['LeadId'].setValue(this.LeadId);
        
        this.LeadQualifyForm.controls['AccountId'].setValue(AccountId);
        this.LeadQualifyForm.controls['AccountName'].setValue(this.CompanyName);
        this.LeadQualifyForm.controls['ContactId'].setValue(ContactId);
        this.LeadQualifyForm.controls['ContactName'].setValue(this.ContactName);

        this.LeadQualifyForm.controls['OpportunityName'].setValue(this.LeadForm.value.Topic);
        
        if(ReportingUsers.LeadQualifyDetail.AccountName=='')
        {
          this.LeadQualifyForm.controls['AccountName'].setValue(this.LeadForm.value.CompanyName);
        }
        if(ReportingUsers.LeadQualifyDetail.ContactName=='')

        {
          this.LeadQualifyForm.controls['ContactName'].setValue(this.LeadForm.value.FirstName+' ' + this.LeadForm.value.LastName);
        }

        //Account
        if(ReportingUsers.LeadQualifyDetail.AccountId>0)
        {
          this.LeadQualifyForm.controls['AccountExists'].setValue(ReportingUsers.LeadQualifyDetail.CanCreateAccount);
          this.LeadQualifyForm.controls['CreateNewAccount'].setValue("NO");
        }
        else
        {
          this.LeadQualifyForm.controls['AccountExists'].setValue(!ReportingUsers.LeadQualifyDetail.CanCreateAccount);
          this.LeadQualifyForm.controls['CreateNewAccount'].setValue("YES");
          
        }

        //Contact
        if(ReportingUsers.LeadQualifyDetail.ContactId>0)
        {
          this.LeadQualifyForm.controls['ContactExists'].setValue(ReportingUsers.LeadQualifyDetail.CanCreateContact);
          this.LeadQualifyForm.controls['CreateNewContact'].setValue("NO");
        }
        else
        {
          this.LeadQualifyForm.controls['ContactExists'].setValue(!ReportingUsers.LeadQualifyDetail.CanCreateContact);
          this.LeadQualifyForm.controls['CreateNewContact'].setValue("YES");
          
        }

        //Opportunity
        this.LeadQualifyForm.controls['CreateOpportunity'].setValue("YES");

        this.LeadQualifyForm.controls['DontCreateOpportunity'].setValue(false);

        //debugger;
        //Dialog starts here
        this.LeadQualifyForm.controls["CreatedBy"].setValue(this.UserId);
        let LeadConvertDialogRef = this.dialog.open(LeadConvertDialog, {
          width: '900px',
          height: '600px',
          disableClose: true,
          data: { 
            HeaderTitle: this.HeaderTitle, 
            ManagerList: this.ReportingUserList, 
            Type: this.type,
            LeadQualifyForm: this.LeadQualifyForm,
            LeadQualifyRequest: ReportingUsers,
            AccountsDomainItemList: this.AccountsDomainItemList,
            LeadQualifyInput:this.MyLeadQualifyInput,
            LeadForm:this.LeadForm,
          }
        });

        //Dialog before close
        LeadConvertDialogRef.beforeClose().subscribe(result => {
          debugger;
          let mlistname = LeadConvertDialogRef;
        });
        //Dialog after closed
        LeadConvertDialogRef.afterClosed().subscribe(result => {
          debugger;
          if (LeadConvertDialogRef.componentInstance.data.SaveClick == "NO") {
            console.log('No Click');
          }
          else if (LeadConvertDialogRef.componentInstance.data.SaveClick == 'YES') {
          
            //Run Yes code here
            debugger;
            console.log('Yes Click');
            console.log(this.MyLeadQualifyDetails);

            //Qualify Code Goes Here
            debugger;
            let SelectedLeads = this.LeadInfo;
        
            if (SelectedLeads.CompName == "") {
              self.snackBar.open("Please Enter Company Name To Qualify This Lead ..", null, {
                duration: 1000,
                verticalPosition: "top",
                horizontalPosition: "right",
                panelClass: "stellify-snackbar",
              });
              return;
            }
            this.MyLead = new Lead();
        
            this.MyLead.Id = this.LeadInfo.Id;
            this.MyLead.OppId = this.LeadInfo.OppId;
        
            this.MyLead.PreviousProbabilityId = this.LeadInfo.ProbabilityId;
            // this.MyLead.ProbabilityId = this.selectedItems[i].ProbabilityId;
            this.MyLead.ProbabilityId = 3;
        
            this.MyLead.CreatedDate = this.LeadInfo.CreatedDate;
            this.MyLead.UpdatedDate = this.LeadInfo.UpdatedDate;
            this.MyLead.EstBudget = this.LeadInfo.EstBudget;
        
            this.MyLead.UserId = this.UserId;
        
            if (this.MyLead.Id != undefined) {
              this.MyLeadIds.push(this.MyLead);
            }
        
            this.blockUI.start("Updating Status...!!!"); // Start blocking
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
              return;
            }, 2000);

        
            //this.result = this.CRMService.ChangeLeadStatus(this.MyLeadIds)

            this.LeadInfo.AccountId=this.LeadQualifyForm.value.AccountId;
            this.LeadInfo.ContactId=this.LeadQualifyForm.value.Contactid;
            this.LeadInfo.OpportunityId=this.LeadQualifyForm.value.OpportunityId;
            this.LeadInfo.OpportunityTopic=this.LeadQualifyForm.value.OpportunityTopic;

            //Set lead Info
            this.MyLead = new Lead();
        
            this.MyLead.Id = this.LeadInfo.Id;
            this.MyLead.OppId = this.LeadInfo.OppId;
        
            this.MyLead.PreviousProbabilityId = this.LeadInfo.ProbabilityId;
            // this.MyLead.ProbabilityId = this.selectedItems[i].ProbabilityId;
            this.MyLead.ProbabilityId = 3;
        
            this.MyLead.CreatedDate = this.LeadInfo.CreatedDate;
            this.MyLead.UpdatedDate = this.LeadInfo.UpdatedDate;
            this.MyLead.EstBudget = this.LeadInfo.EstBudget;
        
            this.MyLead.UserId = this.UserId;

            this.MyLead.AccountId=this.LeadQualifyForm.value.AccountId;
            this.MyLead.ContactId=this.LeadQualifyForm.value.Contactid;
            this.MyLead.OpportunityId=this.LeadQualifyForm.value.OpportunityId;
            this.MyLead.OpportunityTopic=this.LeadQualifyForm.value.OpportunityTopic;


            if (this.MyLead.Id != undefined) {
              this.MyLeadIds.push(this.MyLead);
            }

            //Set Lead Qualify
            this.MyLeadQualifyInput = new LeadQualifyInput();

            this.MyLeadQualifyInput.LeadId              = this.LeadId;     
            this.MyLeadQualifyInput.LeadTopic           = this.LeadForm.value.Topic;
            this.MyLeadQualifyInput.AccountId           = this.LeadQualifyForm.value.AccountId;
            this.MyLeadQualifyInput.ContactId           = this.LeadQualifyForm.value.ContactId;
            this.MyLeadQualifyInput.OportunityId        = this.LeadQualifyForm.value.OpportunityId;
            this.MyLeadQualifyInput.OpportunityTopic    = this.LeadQualifyForm.value.OpportunityName;
            this.MyLeadQualifyInput.CreatedBy           = this.userDetails.UserID;
            this.MyLeadQualifyInput.ConvertedBy         = this.userDetails.UserID;
            this.MyLeadQualifyInput.OpportunityStageId  = 1;

            this.MyLeadQualifyInput.CreateAccount       = this.LeadQualifyForm.value.CreateNewAccount;
            this.MyLeadQualifyInput.CreateContact       = this.LeadQualifyForm.value.CreateNewContact;
            this.MyLeadQualifyInput.CreateOpportunity   = this.LeadQualifyForm.value.CreateOpportunity;
            debugger;
            if(this.LeadQualifyForm.value.DontCreateOpportunity)
            {
              this.MyLeadQualifyInput.DontCreateOpportunity=true;
            }
            else
            {
              this.MyLeadQualifyInput.DontCreateOpportunity=false;
            }

            this.MyLeadQualifyInput.TotalAmount = this.LeadQualifyForm.value.TotalAmount;
            this.MyLeadQualifyInput.UpfrontOrAdvance=this.LeadQualifyForm.value.UpfrontOrAdvance;
            this.MyLeadQualifyInput.PoNumber=this.LeadQualifyForm.value.PoNumber;
            this.MyLeadQualifyInput.Balance=this.LeadQualifyForm.value.Balance;
            this.MyLeadQualifyInput.Remarks=this.LeadQualifyForm.value.Remarks;
            
            //alert(this.MyLeadQualifyInput.DontCreateOpportunity);

            //Contact Details
            this.ContactInfo= new ContactDTO();
            this.ContactInfo.ContactId=this.LeadQualifyForm.value.ContactId;
            this.ContactInfo.SalId=this.LeadForm.value.SalutationId;
            this.ContactInfo.FirstName=this.LeadForm.value.FirstName;
            this.ContactInfo.LeadId=this.LeadId;
            this.ContactInfo.CurId=this.LeadForm.value.CurrencyId;
            this.ContactInfo.LastName=this.LeadForm.value.LastName;
            this.ContactInfo.JobTitle=this.LeadForm.value.JobTitle;
            this.ContactInfo.BusinessPhone=this.LeadForm.value.BusinessPhone;
            this.ContactInfo.RegardingId=8;
            this.ContactInfo.CreatedBy=this.userDetails.UserID;
            this.ContactInfo.Mobile=this.LeadForm.value.Mobile;
            this.ContactInfo.EmailId=this.LeadForm.value.Email;

            //Account Details
            this.AccountInfo= new AccountsDTO();
            this.AccountInfo.Id=this.LeadQualifyForm.value.AccountId;
            this.AccountInfo.AccountName=this.LeadQualifyForm.value.AccountName;
            this.AccountInfo.AnnualRevenue=this.LeadQualifyForm.value.AnnualRevenue;
            this.AccountInfo.NoOfEmployees=this.LeadQualifyForm.value.NoOfEmployees;
            this.AccountInfo.CreatedBy=this.userDetails.UserID;
         


            this.MyLeadQualifyInput.Account=this.AccountInfo;
            this.MyLeadQualifyInput.Contact=this.ContactInfo;

            debugger;
            //return;
            //this.result = this.CRMService.ChangeLeadStatus(this.MyLeadIds)
            this.result = this.CRMService.QualifyLead(this.MyLeadQualifyInput)
              .subscribe(
                (data: any) => {
                  debugger;
                  if (data.Status == "SUCCESS") {
        
                    setTimeout(() => {
                      this.blockUI.stop(); // Stop blocking
                    }, 300);
        
                    self.snackBar.open("Lead Converted Successfully", null, {
                      duration: 5000,
                      verticalPosition: "top",
                      horizontalPosition: "right",
                      panelClass: "stellify-snackbar",
                    });
        
                    //this.GetLeadInfo(this.LeadId);
                    this.router.navigate([`/crm/leadlists/${this.getRandomInt(10)}`]);
        
                  } else if (data.Status == "ERROR") {
                    setTimeout(() => {
                      this.blockUI.stop(); // Stop blocking
                    }, 300);
        
                    //alert(data.Message);
                    self.snackBar.open(data.Message, null, {
                      duration: 3000,
                      verticalPosition: "top",
                      horizontalPosition: "right",
                      panelClass: "stellify-snackbar",
                    });
        
                  }
                  else {
                    setTimeout(() => {
                      this.blockUI.stop(); // Stop blocking
                    }, 300);
        
                    self.snackBar.open(
                      "Problem in  Updating lead please try again",
                      null,
                      {
                        duration: 5000,
                        verticalPosition: "top",
                        horizontalPosition: "right",
                        panelClass: "stellify-snackbar",
                      }
                    );
        
                  }
                },
                // Errors will call this callback instead:
                (err) => {
                  ////
                  if (err.error == "FAIL") {
                    //this.formError = err.error.ExceptionMessage;
        
                    setTimeout(() => {
                      this.blockUI.stop(); // Stop blocking
                    }, 300);
        
                    self.snackBar.open(
                      "Problem in  Updating lead please try again",
                      null,
                      {
                        duration: 5000,
                        verticalPosition: "top",
                        horizontalPosition: "right",
                        panelClass: "stellify-snackbar",
                      }
                    );
        
                  }
                  else {
                    //this.formError = err.statusText;
                  }
                }
              );

            //this.getList()
            //Get the reporting manager list
          }
        });
        //Dialog ends here
      }
    });
  }
  ClickConvert(e)
  {
    const self = this;
    //debugger;
    //Get Lead Info

    //Get Salutation Name from SalutationId
    let SalutationName=this.SalutationList.filter(x=>x.SalutationId==this.LeadForm.value.SalutationId)[0];


    this.SalutationId   = this.LeadForm.value.SalutationId;
    this.FirstName      = this.LeadForm.value.FirstName;
    this.LastName       = this.LeadForm.value.LastName;
    this.ContactName    = SalutationName + ' ' + this.LeadForm.value.FirstName + ' ' + this.LeadForm.value.LastName;
    this.Mobile         = this.LeadForm.value.Mobile;
    this.EmailId        = this.LeadForm.value.Email;
    this.CompanyName    = this.LeadForm.value.CompanyName;

    //Convert Lead Before Show the dialog
    this.HeaderTitle = "Lead Qualify ";  

    //Set LeadQualify Request  
    this.MyLeadQualifyRequest= new LeadQualifyRequest();

    this.MyLeadQualifyRequest.LeadId=this.LeadId;
    this.MyLeadQualifyRequest.UserId=this.UserId;
    this.MyLeadQualifyRequest.SalutationId=this.SalutationId;
    this.MyLeadQualifyRequest.FirstName=this.FirstName;
    this.MyLeadQualifyRequest.LastName=this.LastName;
    this.MyLeadQualifyRequest.Mobile=this.Mobile;
    this.MyLeadQualifyRequest.EmailId=this.EmailId;
    this.MyLeadQualifyRequest.CompanyName=this.CompanyName;


    //LeadQualifyDetails
    this.MyLeadQualifyDetails= new LeadQualifyDetail();
    this.MyLeadQualifyDetails.ContactId           = 0;
    this.MyLeadQualifyDetails.ContactName         = "";
    this.MyLeadQualifyDetails.AccountId           = 0;
    this.MyLeadQualifyDetails.AccountName         = "";
    this.MyLeadQualifyDetails.CanCreateContact    = "NO";
    this.MyLeadQualifyDetails.CanCreateAccount    = "NO";
    this.MyLeadQualifyDetails.CanCreateOpportunity = "YES";
    this.MyLeadQualifyDetails.DontCreateOpportunity=false;

    this.MyLeadQualifyDetails.OpportunityTopic = "";

    this.MyLeadQualifyRequest.LeadQualifyDetail=this.MyLeadQualifyDetails;

    //http://localhost/StellifyFlowsAPI/api/leads/GetLeadInfoToConvert
    let ReportingManager = <Observable<any>>this.CRMService.GetLeadInfoToConvert(this.MyLeadQualifyRequest);
    ReportingManager.subscribe((ReportingUsers) => {
      
      if (ReportingUsers !=null) 
      {

        this.ReportingUserList = ReportingUsers;

        this.AccountId=ReportingUsers.LeadQualifyDetail.AccountId;
        this.AccountName=ReportingUsers.LeadQualifyDetail.AccountName;
        this.ContactId=ReportingUsers.LeadQualifyDetail.ContactId;
        this.ContactName=ReportingUsers.LeadQualifyDetail.ContactName;

        let AccountId=ReportingUsers.LeadQualifyDetail.AccountId;
        let ContactId=ReportingUsers.LeadQualifyDetail.ContactId;

        this.IntializeLeadQualifyForm();

        debugger;
        //Check If Account Domain Items
        this.AccountsDomainItemList=ReportingUsers.Accounts;
        debugger;

        this.LeadQualifyForm.controls['LeadId'].setValue(this.LeadId);
        
        this.LeadQualifyForm.controls['AccountId'].setValue(AccountId);
        this.LeadQualifyForm.controls['AccountName'].setValue(this.CompanyName);
        this.LeadQualifyForm.controls['ContactId'].setValue(ContactId);
        this.LeadQualifyForm.controls['ContactName'].setValue(this.ContactName);

        this.LeadQualifyForm.controls['OpportunityName'].setValue(this.LeadForm.value.Topic);
        
        if(ReportingUsers.LeadQualifyDetail.AccountName=='')
        {
          this.LeadQualifyForm.controls['AccountName'].setValue(this.LeadForm.value.CompanyName);
        }
        if(ReportingUsers.LeadQualifyDetail.ContactName=='')

        {
          this.LeadQualifyForm.controls['ContactName'].setValue(this.LeadForm.value.FirstName+' ' + this.LeadForm.value.LastName);
        }

        //Account
        if(ReportingUsers.LeadQualifyDetail.AccountId>0)
        {
          this.LeadQualifyForm.controls['AccountExists'].setValue(ReportingUsers.LeadQualifyDetail.CanCreateAccount);
          this.LeadQualifyForm.controls['CreateNewAccount'].setValue("NO");
        }
        else
        {
          this.LeadQualifyForm.controls['AccountExists'].setValue(!ReportingUsers.LeadQualifyDetail.CanCreateAccount);
          this.LeadQualifyForm.controls['CreateNewAccount'].setValue("YES");
          
        }

        //Contact
        if(ReportingUsers.LeadQualifyDetail.ContactId>0)
        {
          this.LeadQualifyForm.controls['ContactExists'].setValue(ReportingUsers.LeadQualifyDetail.CanCreateContact);
          this.LeadQualifyForm.controls['CreateNewContact'].setValue("NO");
        }
        else
        {
          this.LeadQualifyForm.controls['ContactExists'].setValue(!ReportingUsers.LeadQualifyDetail.CanCreateContact);
          this.LeadQualifyForm.controls['CreateNewContact'].setValue("YES");
          
        }

        //Opportunity
        this.LeadQualifyForm.controls['CreateOpportunity'].setValue("YES");

        this.LeadQualifyForm.controls['DontCreateOpportunity'].setValue(false);

        //debugger;
        //Dialog starts here
        let LeadQualifyDialogRef = this.dialog.open(LeadQualifyDialog, {
          width: '950px',
          height: '600px',
          disableClose: true,
          data: { 
            HeaderTitle: this.HeaderTitle, 
            ManagerList: this.ReportingUserList, 
            Type: this.type,
            LeadQualifyForm: this.LeadQualifyForm,
            LeadQualifyRequest: ReportingUsers,
            AccountsDomainItemList: this.AccountsDomainItemList,
          }
        });

        //Dialog before close
        LeadQualifyDialogRef.beforeClose().subscribe(result => {
          let mlistname = LeadQualifyDialogRef
        });
        //Dialog after closed
        LeadQualifyDialogRef.afterClosed().subscribe(result => {
          //
          if (LeadQualifyDialogRef.componentInstance.data.SaveClick == "NO") {
            console.log('No Click');
          }
          else if (LeadQualifyDialogRef.componentInstance.data.SaveClick == 'YES') {
          
            //Run Yes code here

            console.log('Yes Click');
            console.log(this.MyLeadQualifyDetails);

            //Qualify Code Goes Here
            debugger;
            let SelectedLeads = this.LeadInfo;
        
            if (SelectedLeads.CompName == "") {
              self.snackBar.open("Please Enter Company Name To Qualify This Lead ..", null, {
                duration: 1000,
                verticalPosition: "top",
                horizontalPosition: "right",
                panelClass: "stellify-snackbar",
              });
              return;
            }
            this.MyLead = new Lead();
        
            this.MyLead.Id = this.LeadInfo.Id;
            this.MyLead.OppId = this.LeadInfo.OppId;
        
            this.MyLead.PreviousProbabilityId = this.LeadInfo.ProbabilityId;
            // this.MyLead.ProbabilityId = this.selectedItems[i].ProbabilityId;
            this.MyLead.ProbabilityId = 3;
        
            this.MyLead.CreatedDate = this.LeadInfo.CreatedDate;
            this.MyLead.UpdatedDate = this.LeadInfo.UpdatedDate;
            this.MyLead.EstBudget = this.LeadInfo.EstBudget;
        
            this.MyLead.UserId = this.UserId;
        
            if (this.MyLead.Id != undefined) {
              this.MyLeadIds.push(this.MyLead);
            }
        
            this.blockUI.start("Updating Status...!!!"); // Start blocking
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
              return;
            }, 2000);

        
            //this.result = this.CRMService.ChangeLeadStatus(this.MyLeadIds)

            this.LeadInfo.AccountId=this.LeadQualifyForm.value.AccountId;
            this.LeadInfo.ContactId=this.LeadQualifyForm.value.Contactid;
            this.LeadInfo.OpportunityId=this.LeadQualifyForm.value.OpportunityId;
            this.LeadInfo.OpportunityTopic=this.LeadQualifyForm.value.OpportunityTopic;

            //Set lead Info
            this.MyLead = new Lead();
        
            this.MyLead.Id = this.LeadInfo.Id;
            this.MyLead.OppId = this.LeadInfo.OppId;
        
            this.MyLead.PreviousProbabilityId = this.LeadInfo.ProbabilityId;
            // this.MyLead.ProbabilityId = this.selectedItems[i].ProbabilityId;
            this.MyLead.ProbabilityId = 3;
        
            this.MyLead.CreatedDate = this.LeadInfo.CreatedDate;
            this.MyLead.UpdatedDate = this.LeadInfo.UpdatedDate;
            this.MyLead.EstBudget = this.LeadInfo.EstBudget;
        
            this.MyLead.UserId = this.UserId;

            this.MyLead.AccountId=this.LeadQualifyForm.value.AccountId;
            this.MyLead.ContactId=this.LeadQualifyForm.value.Contactid;
            this.MyLead.OpportunityId=this.LeadQualifyForm.value.OpportunityId;
            this.MyLead.OpportunityTopic=this.LeadQualifyForm.value.OpportunityTopic;


            if (this.MyLead.Id != undefined) {
              this.MyLeadIds.push(this.MyLead);
            }

            //Set Lead Qualify
            this.MyLeadQualifyInput = new LeadQualifyInput();

            this.MyLeadQualifyInput.LeadId              = this.LeadId;     
            this.MyLeadQualifyInput.LeadTopic           = this.LeadForm.value.Topic;
            this.MyLeadQualifyInput.AccountId           = this.LeadQualifyForm.value.AccountId;
            this.MyLeadQualifyInput.ContactId           = this.LeadQualifyForm.value.ContactId;
            this.MyLeadQualifyInput.OportunityId        = this.LeadQualifyForm.value.OpportunityId;
            this.MyLeadQualifyInput.OpportunityTopic    = this.LeadQualifyForm.value.OpportunityName;
            this.MyLeadQualifyInput.CreatedBy           = this.userDetails.UserID;
            this.MyLeadQualifyInput.ConvertedBy         = this.userDetails.UserID;
            this.MyLeadQualifyInput.OpportunityStageId  = 1;

            this.MyLeadQualifyInput.CreateAccount       = this.LeadQualifyForm.value.CreateNewAccount;
            this.MyLeadQualifyInput.CreateContact       = this.LeadQualifyForm.value.CreateNewContact;
            this.MyLeadQualifyInput.CreateOpportunity   = this.LeadQualifyForm.value.CreateOpportunity;
            debugger;
            if(this.LeadQualifyForm.value.DontCreateOpportunity)
            {
              this.MyLeadQualifyInput.DontCreateOpportunity=true;
            }
            else
            {
              this.MyLeadQualifyInput.DontCreateOpportunity=false;
            }
            
            //alert(this.MyLeadQualifyInput.DontCreateOpportunity);

            //Contact Details
            this.ContactInfo= new ContactDTO();
            this.ContactInfo.ContactId=this.LeadQualifyForm.value.ContactId;
            this.ContactInfo.SalId=this.LeadForm.value.SalutationId;
            this.ContactInfo.FirstName=this.LeadForm.value.FirstName;
            this.ContactInfo.LeadId=this.LeadId;
            this.ContactInfo.CurId=this.LeadForm.value.CurrencyId;
            this.ContactInfo.LastName=this.LeadForm.value.LastName;
            this.ContactInfo.JobTitle=this.LeadForm.value.JobTitle;
            this.ContactInfo.BusinessPhone=this.LeadForm.value.BusinessPhone;
            this.ContactInfo.RegardingId=8;
            this.ContactInfo.CreatedBy=this.userDetails.UserID;
            this.ContactInfo.Mobile=this.LeadForm.value.Mobile;
            this.ContactInfo.EmailId=this.LeadForm.value.Email;

            //Account Details
            this.AccountInfo= new AccountsDTO();
            this.AccountInfo.Id=this.LeadQualifyForm.value.AccountId;
            this.AccountInfo.AccountName=this.LeadQualifyForm.value.AccountName;
            this.AccountInfo.AnnualRevenue=this.LeadQualifyForm.value.AnnualRevenue;
            this.AccountInfo.NoOfEmployees=this.LeadQualifyForm.value.NoOfEmployees;
            this.AccountInfo.CreatedBy=this.userDetails.UserID;
         


            this.MyLeadQualifyInput.Account=this.AccountInfo;
            this.MyLeadQualifyInput.Contact=this.ContactInfo;

            debugger;
            //return;
            //this.result = this.CRMService.ChangeLeadStatus(this.MyLeadIds)
            this.result = this.CRMService.QualifyLead(this.MyLeadQualifyInput)
              .subscribe(
                (data: any) => {
                  debugger;
                  if (data.Status == "SUCCESS") {
        
                    setTimeout(() => {
                      this.blockUI.stop(); // Stop blocking
                    }, 300);
        
                    self.snackBar.open("Lead Converted Successfully", null, {
                      duration: 5000,
                      verticalPosition: "top",
                      horizontalPosition: "right",
                      panelClass: "stellify-snackbar",
                    });
        
                    //this.GetLeadInfo(this.LeadId);
                    this.router.navigate([`/crm/leadlists/${this.getRandomInt(10)}`]);
        
                  } else if (data.Status == "ERROR") {
                    setTimeout(() => {
                      this.blockUI.stop(); // Stop blocking
                    }, 300);
        
                    //alert(data.Message);
                    self.snackBar.open(data.Message, null, {
                      duration: 3000,
                      verticalPosition: "top",
                      horizontalPosition: "right",
                      panelClass: "stellify-snackbar",
                    });
        
                  }
                  else {
                    setTimeout(() => {
                      this.blockUI.stop(); // Stop blocking
                    }, 300);
        
                    self.snackBar.open(
                      "Problem in  Updating lead please try again",
                      null,
                      {
                        duration: 5000,
                        verticalPosition: "top",
                        horizontalPosition: "right",
                        panelClass: "stellify-snackbar",
                      }
                    );
        
                  }
                },
                // Errors will call this callback instead:
                (err) => {
                  ////
                  if (err.error == "FAIL") {
                    //this.formError = err.error.ExceptionMessage;
        
                    setTimeout(() => {
                      this.blockUI.stop(); // Stop blocking
                    }, 300);
        
                    self.snackBar.open(
                      "Problem in  Updating lead please try again",
                      null,
                      {
                        duration: 5000,
                        verticalPosition: "top",
                        horizontalPosition: "right",
                        panelClass: "stellify-snackbar",
                      }
                    );
        
                  }
                  else {
                    //this.formError = err.statusText;
                  }
                }
              );

            //this.getList()
            //Get the reporting manager list
          }
        });
        //Dialog ends here
      }
    });
  }
  ClickQualify(event) {
    const self = this;

    debugger;
    let SelectedLeads = this.LeadInfo;

    if (SelectedLeads.CompName == "") {
      self.snackBar.open("Please Enter Company Name To Qualify This Lead ..", null, {
        duration: 1000,
        verticalPosition: "top",
        horizontalPosition: "right",
        panelClass: "stellify-snackbar",
      });
      return;
    }
    this.MyLead = new Lead();

    this.MyLead.Id = this.LeadInfo.Id;
    this.MyLead.OppId = this.LeadInfo.OppId;

    this.MyLead.PreviousProbabilityId = this.LeadInfo.ProbabilityId;
    // this.MyLead.ProbabilityId = this.selectedItems[i].ProbabilityId;
    this.MyLead.ProbabilityId = 1;

    this.MyLead.CreatedDate = this.LeadInfo.CreatedDate;
    this.MyLead.UpdatedDate = this.LeadInfo.UpdatedDate;
    this.MyLead.EstBudget = this.LeadInfo.EstBudget;

    this.MyLead.UserId = this.UserId;

    if (this.MyLead.Id != undefined) {
      this.MyLeadIds.push(this.MyLead);
    }

    this.blockUI.start("Updating Status...!!!"); // Start blocking

    this.result = this.CRMService.ChangeLeadStatus(this.MyLeadIds)
      .subscribe(
        (data: any) => {
          debugger;
          if (data.Status == "SUCCESS") {

            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 300);

            self.snackBar.open("Lead Converted Successfully", null, {
              duration: 5000,
              verticalPosition: "top",
              horizontalPosition: "right",
              panelClass: "stellify-snackbar",
            });

            //this.GetLeadInfo(this.LeadId);
            this.router.navigate([`/crm/leadlists/${this.getRandomInt(10)}`]);

          } else if (data.Status == "ERROR") {
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 300);

            //alert(data.Message);
            self.snackBar.open(data.Message, null, {
              duration: 3000,
              verticalPosition: "top",
              horizontalPosition: "right",
              panelClass: "stellify-snackbar",
            });

          }
          else {
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 300);

            self.snackBar.open(
              "Problem in  Updating lead please try again",
              null,
              {
                duration: 5000,
                verticalPosition: "top",
                horizontalPosition: "right",
                panelClass: "stellify-snackbar",
              }
            );

          }
        },
        // Errors will call this callback instead:
        (err) => {
          ////
          if (err.error == "FAIL") {
            //this.formError = err.error.ExceptionMessage;

            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
            }, 300);

            self.snackBar.open(
              "Problem in  Updating lead please try again",
              null,
              {
                duration: 5000,
                verticalPosition: "top",
                horizontalPosition: "right",
                panelClass: "stellify-snackbar",
              }
            );

          }
          else {
            //this.formError = err.statusText;
          }
        }
      );

  }
  ClickAssignOwner(OwnerId,e)
  {
    alert("Current Owner : " + OwnerId + "\n Lead Id : " + this.LeadId);
  }
  //**************************************************************************************************************/
  //Contact Groups List Code Starts Here
  //**************************************************************************************************************/
  //Connections Lists Marketing Lists
 


  GetMarketingList()
  {
    const self = this;
    //let a = this.CRMService.GetList();

    this.CRMService.GetList()
    .subscribe((data:any) => {
        ////debugger;
        this.IsFilterDataArrive=true;
        this.ConnectionsLists=data;
        this.FilterConnectionsLists=data;
        this.TotalRecords=this.ConnectionsLists.length;
        //debugger;
        this.GetLeadInfo(this.LeadId);

    }, (error) => {
        this.showLeftPanelLoadingIcon = false;
        //debugger;
    });
  }


  SelectListById(mail: MarketingList)
  {
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
    if(this.TotalSelectedConnections==0)
    {
        this.SelectedConnections="";
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
ProcessMarketingListAdd(e)
{
    alert(" Total Leads Selected : " + this.LeadId + "\n Total Marketing Lists Selected : " + this.SelectedConnections);

}

UpdateContactGroups(e)
{
  
  const self = this;
  if(this.ShowContactGroups)
  {
   this.ContactGroupsList= new ContactGroups();

   //this.ListIdss=new ListIds[];
   //debugger;
   this.ListIdss=[];
   if(this.TotalSelectedConnections>1)
   {
    let Ids=this.SelectedConnections.split(',');
    for(let i=0;i<Ids.length;i++)
    {
     this.ListIdss.push(new ListIds(parseInt(Ids[i])));
    }
   }
   else
   {
    let Ids=this.SelectedConnections;
     this.ListIdss.push(new ListIds(parseInt(Ids)));
   }

   
   this.ContactGroupsList.Leadid=this.LeadId;
   this.ContactGroupsList.UserId=this.UserId;
   this.ContactGroupsList.ListIds = this.ListIdss;

   console.log(this.ContactGroupsList);

   console.log(JSON.stringify(this.ContactGroupsList));

   //debugger;
   this.result = this.CRMService.UpdateContactGroupsOfLead(this.ContactGroupsList).subscribe(
    (data: any) => {

      debugger;

      if (data.Status == "SUCCESS") {
        this.LeadId = data.Data;
        setTimeout(() => {
          this.blockUI.stop(); // Stop blocking
        }, 300);

        self.snackBar.open("Updated successfully ...", null, {
          duration: 3000, verticalPosition: 'top',
          horizontalPosition: 'right', panelClass: 'stellify-snackbar',
        });
        this.TotalSelectedConnections=0;
        
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
  //Contact Groups List Code Starts Here
  //**************************************************************************************************************/
  // Assign To Code Starts Here           
SelectReportingManager(OwnerId:any,event): void {
  this.HeaderTitle = "Assigned manager";

  let ReportingManager = <Observable<any>>this.CRMService.GetReportingUsers(this.CompanyId);
  ReportingManager.subscribe((ReportingUsers) => {
    debugger;
    if (ReportingUsers.length > 0) {

      this.ReportingUserList = ReportingUsers;

      //Dialog starts here
      let DialogAssignToRef = this.DialogAssignTo.open(AssignedToDialog, {
        width: '550px',
        height: '450px',
        disableClose: true,
        data: { HeaderTitle: this.HeaderTitle, ManagerList: this.ReportingUserList, Type: this.type }
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
          this.AssignedUserId = DialogAssignToRef.componentInstance.data.ManagerId;
          this.AssignedUserName = DialogAssignToRef.componentInstance.data.ManagerName;

          this.OwnerId=this.AssignedUserId;
          this.OwnerName=this.AssignedUserName;

          this.LeadForm.controls["OwnerId"].setValue(this.AssignedUserId);
          // this.userManagementForm.controls["ManagerId"].setValue(this.ManagerId);
          // this.userManagementForm.controls["ManagerName"].setValue(this.ManagerName);

          console.log('in Yes btnClick');

          //this.getList()
          //Get the reporting manager list
        }
      });
      //Dialog ends here
    }
  });
}
// Assign To Code Ends Here   

}



//****************************************************************************************************************/
//Lead Qualify Manager Dialog starts here
//****************************************************************************************************************/
@Component({
  selector: 'lead-qualify-dialog',
  templateUrl: 'lead-qualify-dialog.html',
  styleUrls: ['lead-qualify-dialog.css']
})
export class LeadQualifyDialog implements OnInit {
  //Auto mapping variables
  AccountDisabled:boolean=false;
  ContactsLists: any[] = [];
  selectedRows: any[];
  showLeftPanelLoadingIcon: boolean = false;
  MyListID: any;
  marked = false;
  router: any;
  AccountShow:boolean=false;
  ContactShow:boolean=false;
  ContactInfo:ContactDTO;
  AccountInfo:AccountsDTO;
  nodes: any;

  //postComments = comments;
  constructor(
    private CRMService: CRMService,
    public dialogRef: MatDialogRef<LeadQualifyDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute) {
  }
  ngOnInit() {
 

    this.nodes=this.data.ManagerList;
    let timeoutId = setTimeout(() => {
        this.exapandORcollapse(this.nodes);
      }, 200);

      //this.AccountDisabled=true;
      debugger;
      let a= this.data.LeadQualifyRequest;
      if(this.data.LeadQualifyRequest.LeadQualifyDetail.ContactId>0)
      {
        this.ContactShow=true;
      }
      if(this.data.LeadQualifyRequest.LeadQualifyDetail.AccountId>0)
      {
        this.AccountShow=true;
      }
  }
  OnAccountSelectChange(e)
  {
    console.log(e.currentTarget.value);
    if(e.currentTarget.value=="NO")
    {
      this.AccountShow=true;
    }
    else
    {
      this.AccountShow=false;
    }
  }
  OnContactSelectChange(e)
  {
    console.log(e.currentTarget.value);
    if(e.currentTarget.value=="NO")
    {
      this.ContactShow=true;
    }
    else
    {
      this.ContactShow=false;
    }
  }
  OnAccountChange(e)
  {
    console.log(e.currentTarget.value);
    this.GetContactByAccountId(e.currentTarget.value);
    //debugger;
  }
  OnContactChange(e)
  {
    console.log(e.currentTarget.value);
  }
  OnCanCreateOpportunitySelect(e)
  {
    this.marked= e.target.checked;
    console.log(e.currentTarget.value +'  '+ this.marked +' --  ' + this.data.LeadQualifyForm.value.CanCreateOpportunity);
    
  }
  GetContactByAccountId(AccountId: any) {

    this.showLeftPanelLoadingIcon = true;
    this.CRMService.GetContactsByAccountId(AccountId)
      .subscribe((data: any) => {
        debugger;
        //myPanel.expanded = true; 
        this.showLeftPanelLoadingIcon = false;
        //this.TotalRecords = data.TotalRecords;
        debugger;
        if (data.TotalRecords > 0) {
          //this.TotalRecords = data.TotalRecords;
          this.ContactsLists = data.Contacts;
          //this.ContactsListsPagerConfig.TotalRecords = data.TotalRecords;

        }
        else {
          //this.TotalRecords = data.TotalRecords;
          this.ContactsLists = data.Contacts;
          //this.ContactsListsPagerConfig.TotalRecords = data.TotalRecords;
          //this.filterMessage = "No matching records are found";
        }
      }, (error) => {
        this.showLeftPanelLoadingIcon = false;
      });
  }

  exapandORcollapse(nodes) {
    for (let node of nodes) {
      if (node.children) {
        if (node.expanded == true)
          node.expanded = false;
        else
          node.expanded = true;
        for (let cn of node.children) {
          this.exapandORcollapse(node.children);
        }
      }
    }
  }

  nodeSelect(event) {
    //
    console.log(event)
  }
  onNoClick(e): void {

    this.data.SaveClick = "NO";
    this.dialogRef.close(this.MyListID);
  }
  YesClick(event, MyLeadQualifyForm): void {
    const self = this;
    debugger;
    this.data.SaveClick = "YES";

    this.data.LeadQualify=MyLeadQualifyForm;
    
    // if(this.selectedRows)
    // {
    //   this.data.ManagerId=listData.data.UserId;
    //   this.data.ManagerName=listData.data.UserName;
    // }
    // if (this.data.FormMode == 1) {
    //   //Create
    // }
    // else {
    //   //Update
    // }
  }
}
//****************************************************************************************************************/
//Lead Qualify Reporting Manager Dialog ends here
//****************************************************************************************************************/

//****************************************************************************************************************/
//Lead Qualify Manager Dialog starts here
//****************************************************************************************************************/
@Component({
  selector: 'lead-convert-dialog',
  templateUrl: 'lead-convert-dialog.html',
  styleUrls: ['lead-convert-dialog.css']
})
export class LeadConvertDialog implements OnInit {
  //Auto mapping variables
  AccountDisabled:boolean=false;
  ContactsLists: any[] = [];
  selectedRows: any[];
  showLeftPanelLoadingIcon: boolean = false;
  MyListID: any;
  marked = false;
  AccountShow:boolean=false;
  ContactShow:boolean=false;
  ContactInfo:ContactDTO;
  AccountInfo:AccountsDTO;

  nodes: any;

  //postComments = comments;
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  constructor(
    private CRMService: CRMService,
    public dialogRef: MatDialogRef<LeadConvertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private router: Router,
    private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute) {
  }
  ngOnInit() {
 

    this.nodes=this.data.ManagerList;
    let timeoutId = setTimeout(() => {
        this.exapandORcollapse(this.nodes);
      }, 200);

      //this.AccountDisabled=true;
      debugger;
      let a= this.data.LeadQualifyRequest;
      if(this.data.LeadQualifyRequest.LeadQualifyDetail.ContactId>0)
      {
        this.ContactShow=true;
      }
      if(this.data.LeadQualifyRequest.LeadQualifyDetail.AccountId>0)
      {
        this.AccountShow=true;
      }
  }
  OnAccountSelectChange(e)
  {
    console.log(e.currentTarget.value);
    if(e.currentTarget.value=="NO")
    {
      this.AccountShow=true;
    }
    else
    {
      this.AccountShow=false;
    }
  }
  OnContactSelectChange(e)
  {
    console.log(e.currentTarget.value);
    if(e.currentTarget.value=="NO")
    {
      this.ContactShow=true;
    }
    else
    {
      this.ContactShow=false;
    }
  }
  OnAccountChange(e)
  {
    console.log(e.currentTarget.value);
    this.GetContactByAccountId(e.currentTarget.value);
    //debugger;
  }
  OnContactChange(e)
  {
    console.log(e.currentTarget.value);
  }
  OnCanCreateOpportunitySelect(e)
  {
    this.marked= e.target.checked;
    console.log(e.currentTarget.value +'  '+ this.marked +' --  ' + this.data.LeadQualifyForm.value.CanCreateOpportunity);
    
  }
  GetContactByAccountId(AccountId: any) {

    this.showLeftPanelLoadingIcon = true;
    this.CRMService.GetContactsByAccountId(AccountId)
      .subscribe((data: any) => {
        debugger;
        //myPanel.expanded = true; 
        this.showLeftPanelLoadingIcon = false;
        //this.TotalRecords = data.TotalRecords;
        debugger;
        if (data.TotalRecords > 0) {
          //this.TotalRecords = data.TotalRecords;
          this.ContactsLists = data.Contacts;
          //this.ContactsListsPagerConfig.TotalRecords = data.TotalRecords;

        }
        else {
          //this.TotalRecords = data.TotalRecords;
          this.ContactsLists = data.Contacts;
          //this.ContactsListsPagerConfig.TotalRecords = data.TotalRecords;
          //this.filterMessage = "No matching records are found";
        }
      }, (error) => {
        this.showLeftPanelLoadingIcon = false;
      });
  }

  exapandORcollapse(nodes) {
    for (let node of nodes) {
      if (node.children) {
        if (node.expanded == true)
          node.expanded = false;
        else
          node.expanded = true;
        for (let cn of node.children) {
          this.exapandORcollapse(node.children);
        }
      }
    }
  }

  nodeSelect(event) {
    //
    console.log(event)
  }
  onNoClick(e): void {

    this.data.SaveClick = "NO";
    this.dialogRef.close(this.MyListID);
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
  onConvertNewSubmit(NewConvertForm,e)
  {
    const self=this;
    debugger;
    if(this.data.LeadQualifyForm.invalid)
    {

      this.markAsDirty(this.data.LeadQualifyForm);

      // if (NewConvertForm.TotalAmount == null) {
      //   this.data.LeadQualifyForm.controls["TotalAmount"].setErrors({ required: true });
      //   this.data.LeadQualifyForm.controls["TotalAmount"].markAsTouched();
      //   //this.data.LeadQualifyForm.selectRootElement('#TotalAmount').focus();
      //   //return;
      // }

      this.data.SaveClick = "NO";
      return;
      
    }
    else if(this.data.LeadQualifyForm.valid)
    {
      debugger;
      //Qualify Code Starts Here
      //this.data.MyLeadQualifyInput.CreatedBy=this.data.LeadQualifyRequest.UserId;
                  //Set Lead Qualify
                  this.data.MyLeadQualifyInput = new LeadQualifyInput();

                  this.data.MyLeadQualifyInput.LeadId              = this.data.LeadForm.value.LeadId;     
                  this.data.MyLeadQualifyInput.LeadTopic           = this.data.LeadForm.value.Topic;
                  this.data.MyLeadQualifyInput.AccountId           = this.data.LeadQualifyForm.value.AccountId;
                  this.data.MyLeadQualifyInput.ContactId           = this.data.LeadQualifyForm.value.ContactId;
                  this.data.MyLeadQualifyInput.OportunityId        = this.data.LeadQualifyForm.value.OpportunityId;
                  this.data.MyLeadQualifyInput.OpportunityTopic    = this.data.LeadQualifyForm.value.OpportunityName;
                  this.data.MyLeadQualifyInput.CreatedBy           = this.data.LeadQualifyRequest.UserId;
                  this.data.MyLeadQualifyInput.ConvertedBy         = this.data.LeadQualifyRequest.UserId;
                  this.data.MyLeadQualifyInput.OpportunityStageId  = 1;
      
                  this.data.MyLeadQualifyInput.CreateAccount       = this.data.LeadQualifyForm.value.CreateNewAccount;
                  this.data.MyLeadQualifyInput.CreateContact       = this.data.LeadQualifyForm.value.CreateNewContact;
                  this.data.MyLeadQualifyInput.CreateOpportunity   = this.data.LeadQualifyForm.value.CreateOpportunity;
                  debugger;
                  if(this.data.LeadQualifyForm.value.DontCreateOpportunity)
                  {
                    this.data.MyLeadQualifyInput.DontCreateOpportunity=true;
                  }
                  else
                  {
                    this.data.MyLeadQualifyInput.DontCreateOpportunity=false;
                  }
      
                  this.data.MyLeadQualifyInput.TotalAmount = this.data.LeadQualifyForm.value.TotalAmount;
                  this.data.MyLeadQualifyInput.UpfrontOrAdvance=this.data.LeadQualifyForm.value.UpfrontOrAdvance;
                  this.data.MyLeadQualifyInput.PoNumber=this.data.LeadQualifyForm.value.PoNumber;
                  this.data.MyLeadQualifyInput.Balance=this.data.LeadQualifyForm.value.Balance;
                  this.data.MyLeadQualifyInput.Remarks=this.data.LeadQualifyForm.value.Remarks;
                  
                  //alert(this.MyLeadQualifyInput.DontCreateOpportunity);
      
                  //Contact Details
                   this.ContactInfo= new ContactDTO();
                  this.ContactInfo.ContactId=this.data.LeadQualifyForm.value.ContactId;
                  this.ContactInfo.SalId=this.data.LeadForm.value.SalutationId;
                  this.ContactInfo.FirstName=this.data.LeadForm.value.FirstName;
                  this.ContactInfo.LeadId=this.data.LeadId;
                  this.ContactInfo.CurId=this.data.LeadForm.value.CurrencyId;
                  this.ContactInfo.LastName=this.data.LeadForm.value.LastName;
                  this.ContactInfo.JobTitle=this.data.LeadForm.value.JobTitle;
                  this.ContactInfo.BusinessPhone=this.data.LeadForm.value.BusinessPhone;
                  this.ContactInfo.RegardingId=8;
                  this.ContactInfo.CreatedBy=this.data.LeadQualifyRequest.UserId;
                  this.ContactInfo.Mobile=this.data.LeadForm.value.Mobile;
                  this.ContactInfo.EmailId=this.data.LeadForm.value.Email;
      
                  //Account Details
                  this.AccountInfo= new AccountsDTO();
                  this.AccountInfo.Id=this.data.LeadForm.value.AccountId;
                  this.AccountInfo.AccountName=this.data.LeadForm.value.CompanyName;
                  this.AccountInfo.AnnualRevenue=this.data.LeadForm.value.AnnualRevenue;
                  this.AccountInfo.NoOfEmployees=this.data.LeadForm.value.NoOfEmployees;
                  this.AccountInfo.CreatedBy=this.data.LeadQualifyRequest.UserId;
               
      
      
                  this.data.MyLeadQualifyInput.Account=this.AccountInfo;
                  this.data.MyLeadQualifyInput.Contact=this.ContactInfo;
      
      
      var result = this.CRMService.QualifyLead(this.data.MyLeadQualifyInput)
        .subscribe(
          (data: any) => {
            debugger;
            if (data.Status == "SUCCESS") {

              setTimeout(() => {
                //this.blockUI.stop(); // Stop blocking
              }, 300);

              self.snackBar.open("Lead Converted Successfully", null, {
                duration: 5000,
                verticalPosition: "top",
                horizontalPosition: "right",
                panelClass: "stellify-snackbar",
              });

              debugger;
              
              //this.GetLeadInfo(this.LeadId);
              this.router.navigate([`/crm/leadlists/${this.getRandomInt(10)}`]);
              this.dialogRef.close();
              
              
              

            } else if (data.Status == "ERROR") {
              setTimeout(() => {
                //this.blockUI.stop(); // Stop blocking
              }, 300);

              //alert(data.Message);
              self.snackBar.open(data.Message, null, {
                duration: 3000,
                verticalPosition: "top",
                horizontalPosition: "right",
                panelClass: "stellify-snackbar",
              });

            }
            else {
              setTimeout(() => {
                //this.blockUI.stop(); // Stop blocking
              }, 300);

              self.snackBar.open(
                "Problem in  Updating lead please try again",
                null,
                {
                  duration: 5000,
                  verticalPosition: "top",
                  horizontalPosition: "right",
                  panelClass: "stellify-snackbar",
                }
              );

            }
          },
          // Errors will call this callback instead:
          (err) => {
            ////
            if (err.error == "FAIL") {
              //this.formError = err.error.ExceptionMessage;

              setTimeout(() => {
                //this.blockUI.stop(); // Stop blocking
              }, 300);

              self.snackBar.open(
                "Problem in  Updating lead please try again",
                null,
                {
                  duration: 5000,
                  verticalPosition: "top",
                  horizontalPosition: "right",
                  panelClass: "stellify-snackbar",
                }
              );

            }
            else {
              //this.formError = err.statusText;
            }
          }
        );




      //Qualify Code Ends Here


    }
  }
  YesConvertNewClick(event, MyLeadQualifyForm): void {
    const self = this;
    debugger;
    this.data.SaveClick = "YES";



    this.data.LeadQualify=MyLeadQualifyForm;

  }
}
//****************************************************************************************************************/
//Lead Qualify Reporting Manager Dialog ends here
//****************************************************************************************************************/

//****************************************************************************************************************/
//Assigned To Dialog starts here
//****************************************************************************************************************/
@Component({
  selector: 'assignedto-dialog',
  templateUrl: 'assignedto-dialog.html',
  styleUrls: ['assignedto-dialog.css']
})
export class AssignedToDialog implements OnInit {
  //Auto mapping variables
  selectedRows: any[];

  MyListID: any;
  router: any;
  nodes: any;
  //postComments = comments;
  constructor(
    public dialogRef: MatDialogRef<AssignedToDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute) {
  }
  ngOnInit() {
    this.nodes=this.data.ManagerList;
    let timeoutId = setTimeout(() => {
        this.exapandORcollapse(this.nodes);
      }, 200);
  }
  exapandORcollapse(nodes) {
    for (let node of nodes) {
      if (node.children) {
        if (node.expanded == true)
          node.expanded = false;
        else
          node.expanded = true;
        for (let cn of node.children) {
          this.exapandORcollapse(node.children);
        }
      }
    }
  }

  nodeSelect(event) {
    //
    console.log(event)
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
}
//****************************************************************************************************************/
//Assigned To Dialog Ends here
//****************************************************************************************************************/

