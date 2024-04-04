import { AfterViewInit, Component, ContentChildren, ElementRef, EventEmitter, Inject, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { CRMService } from '../../services/crm.service';
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
import { ActivityFilterModel, MarketingList } from '../../models/crm.models';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserManagement } from '../../../administration/models/usermanagement';
import { AccountsDTO, AccountsDomainItem, ContactsAccountsDomainItems } from '../../models/AccountsDTO';
import { data } from '../../models/data';
import { LeadconvertComponent } from '../leadconvert/leadconvert.component';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { ContactsAccountDetailsDTO, DealDTO } from '../../models/DealDTO';
import { DatePipe } from '@angular/common';
import { Deal } from '../../models/Deal';
import { RegarDomainItems } from '../../models/RegarDomainItems';
import { ActivityDTO } from '../../models/ActivityDTO';
import { CrmactivityLogACallComponent } from '../crmactivitylogacall/crmactivity-logacall.component';
import { Button } from 'primeng/primeng';

import { Subject, Observable, of } from 'rxjs';
import {
  distinctUntilChanged,
  debounceTime,
  switchMap,
  tap,
  catchError,
  filter,
  map,
} from 'rxjs/operators';
import { DealReasonForLossDTO } from '../../models/DealReasonForLossDTO';

//import { FocusInvalidInputDirective } from '../../directives/FocusInvalidInputDirective';
//import { CurrencyService } from '../../services/currency.service';
//'src/app/administration/services/role-management-api.service';

@Component({
  selector: 'app-deal-list',
  templateUrl: './deal.component.html',
  styleUrls: ['./deal.component.css']
})
export class DealComponent implements OnInit, AfterViewInit 
{

  cities = [
    {id: 1, name: 'City1'},
    {id: 2, name: 'City2'},
    {id: 3, name: 'City3'},
    {id: 4, name: 'City4'},
    {id: 5, name: 'City5'}
];

DealStageId:number;
CurrentDealStage:string;
DealCloseButtonText:string="Close ";
DealStageName:string="";
ModuleId:number;
FormId:number;
ViewId:number;
LeadSourceList = [];
TLeadSourceList = [];
IsDealClose:boolean=false;
IsDealLost:boolean=false;
IsShowSave:boolean=false;

DealStageClose:boolean=false;
DealStageLost:boolean=false;

ActivityFormMode:string;
RegardingId:number;
RegarId:number;

@ViewChild('NGBAccountId') NGBAccountIdRef;
@ViewChild('NGBContactId') NGBContactIdRef;
IsAccountOpen:boolean=false;

ActivityListsCols: any[];
ActivityLists: any[] = [];
FilterActivityLists: ActivityDTO[] = [];
ExportActivityLists:ActivityDTO[]=[];
ActivityListsPagerConfig: PagerConfig;
currentPage: number = 1;

RegarDomainItemsList:RegarDomainItems[];
ContactsLists: any[] = [];
filterMessage:string;
AssignedUserId:number;
AssignedUserName:string;
ClosingMinDate:Date=new Date();
ClosingMaxDate:Date=new Date();
ClosingDate:string;
ClosingDateD:Date;

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
  IsExpandActiviesDetails: boolean=true;
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
  IsAccountsLoaded:boolean=false;
  gridColumns: Array<{ field: string, header: string }> = [];
  pageModules: PageTreeNode[];
  loading: boolean;
  roleAccessLevels: RoleAccessLevel[];
  hideInput: boolean = false;

  // ClosingDate:string;
  // ClosingDateD:Date;

  SelectedListId: number = 0;
  SelectedList: number;
  Listss: Array<any> = [];
  //MyLists: Lists[] = [];

  @ViewChild("MyDealsTable") public MyDealsTableEl: ElementRef;
  @ViewChild("MyDealsTable") public MyDealsTableElTbl: TreeTable;

  @ViewChild("CloseWonLost") public MyCloseWonLost: Button;
  //@ViewChildren('Topic','FirstName') inputElements: QueryList<ElementRef>;

  // @ViewChild('treeTable') table: TreeTable;

  @ViewChild("MyDealsTable") MyDealsTableT: TreeTable;
  //MyDealsTable

  DealId: number;
  LeadMode: string;
  DealInfo: DealDTO;



  MyDealQualifyRequest:LeadQualifyRequest;
  MyDealQualifyDetails:LeadQualifyDetail;

  ReturnLink: number;

  DealForm: FormGroup;
  ContactForm: FormGroup;
  AccountForm: FormGroup;
  DealCloseForm:FormGroup;


  LeadQualifyForm: FormGroup;

  photos = [];
  photosBuffer = [];
  bufferSize = 10;
  //loading = false;
  input$ = new Subject<string>();
  photosBuffer$:Observable<any>;

  AccountsDomainItemList: Array<AccountsDomainItem> = [];

  ContactsAccountDetailsDTOListItem:ContactsAccountDetailsDTO;
  ContactsAccountDetailsDTOList: Array<ContactsAccountDetailsDTO>=[];

  ContactsAccountDomainItemList: Array<ContactsAccountsDomainItems> =[];
  ContactsAccountsDomainItemsInfo:ContactsAccountsDomainItems;
  FormMode: string;
  formError: string;
  DisabledAccount:boolean=false;

  IsShowAccount:boolean=false;
  IsShowContact:boolean=false;

  MyDeal: Deal;
  MyDealQualifyInput:LeadQualifyInput;
  
  ContactInfo:ContactDTO;
  AccountInfo:AccountsDTO;

  MyDealIds = [];
  private result;
  //CurrencyList = [];
  DealStageList = [];
  DealTypeList = [];
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
  //selectedCityName = 'Vilnius';

  cities3 = [
    {
      id: 1,
      name: 'Vilnius',
      avatar:
        '//www.gravatar.com/avatar/b0d8c6e5ea589e6fc3d3e08afb1873bb?d=retro&r=g&s=30 2x',
    },
    {
      id: 2,
      name: 'Kaunas',
      avatar:
        '//www.gravatar.com/avatar/ddac2aa63ce82315b513be9dc93336e5?d=retro&r=g&s=15',
    },
    {
      id: 3,
      name: 'Pavilnys',
      avatar:
        '//www.gravatar.com/avatar/6acb7abf486516ab7fb0a6efa372042b?d=retro&r=g&s=15',
    },
    {
      id: 4,
      name: 'Hyderabad',
      avatar:
        '//www.gravatar.com/avatar/6acb7abf486516ab7fb0a6efa372042b?d=retro&r=g&s=15',
    },
  ];

  constructor(
    private datePipe: DatePipe,
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
    ////debugger;
    // const firstInvalidField = this.inputElements.find((el) => this.invalidFields.includes(el.nativeElement.name));
    // if (firstInvalidField) {
    //   firstInvalidField.nativeElement.focus();
    // }

  }

  InitializeAccountForm()
  {
    this.AccountForm = this.fb.group({
      AccouontId:[0],
      AccountName: [null, [Validators.required]],
      MainPhone: [null],
      Website: [null],
      CreatedBy:[0]
    });
  }
  InitializeDealCloseForm()
  {
    this.DealCloseForm = this.fb.group({
      DealId:[0],
      DealStageId: [null, [Validators.required]],
      DealStageName:[null],
      Amount: [null, [Validators.required]],
      ClosingDate: [null, [Validators.required]],
      TotalAmount: [null, [Validators.required]],
      UpfrontOrAdvance: [null, [Validators.required]],
      PoNumber: [null, [Validators.required]],
      Balance: [null, [Validators.required]],
      Remarks: [null, [Validators.required]],
      DealReasonId:[null, [Validators.required]],
      CreatedBy:[null],
      UserId:[0],
    });

  }

  InitializeContactForm()
  {
    this.ContactForm = this.fb.group({
      ContactId:[0],
      FirstName: [null, [Validators.required]],
      LastName: [null, [Validators.required]],
      AccountId: [null, [Validators.required]],
      CreatedBy:[0]
    });

  }


  InitializeDealForm() {
    this.DealForm = this.fb.group({
      DealId:[0],
      DealName: [null, [Validators.required]],
      AccountId: [null, [Validators.required]],
      AccountName:[null, [Validators.required]],
      ContactId: [null, [Validators.required]],
      ContactName:[null, [Validators.required]],
      DealTypeId: [3, [Validators.required]],
      NextStep: [''],
      LeadSourceId: [null],
      RatingId:[0],
      Amount: [0],
      ClosingDate: [null, [Validators.required]],
      NoOfEmployee: [''],
      SourceCampaign: [''],
      PipelineId: [null],
      DealStageId: [1],
      DealStageName:[null],
      Probability: [''],
      ExpectedRevenue:[0],
      CampaignSource: [''],
      DealDescription: [''],
      CreatedBy: [''],
      selectedCityName:['Vilnius'],
      DealClose:[0],
      DealLost:[0],
      TotalAmount: [''],
      UpfrontOrAdvance: [''],
      PoNumber: [''],
      Balance: [''],
      Remarks: [''],
      ClosedBy: [''],
      ClosedDate: [''],

    });
  }

  IntializeLeadQualifyForm()
  {
    this.LeadQualifyForm = this.fb.group({
      DealId:[0],
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
  ResetActivityPagerConfig() {
    this.ActivityListsPagerConfig.RecordsToSkip = 0;
    this.ActivityListsPagerConfig.RecordsToFetch = 125;

    this.currentPage = 1;
}

  ngOnInit() {
    // var a=this.CRMHlperService.formatCurrency(100);
    // alert(this.Currency);
    // alert(a);
    this.photos = data;
    this.onSearch();

    this.ModuleId=1;
    this.FormId=2;
    this.ViewId=10;
    
    this.ActivityListsPagerConfig = new PagerConfig();
    this.ResetActivityPagerConfig();

    this.ConnectionsListsCols = [
      { field: 'ListName', header: 'List Name', width: '200px' },
      { field: 'ListDesc', header: 'List Desc', width: '200px' },
    ];

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

    this.InitializeDealForm();

    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      if (param.get('mode') != undefined) {
        this.LeadMode = param.get('mode');
        this.FormMode = param.get('mode');
      }
      if (param.get('Id') != undefined) {
        this.DealId = parseInt(param.get('Id'));
      }
      if (param.get('return') != undefined) {
        this.ReturnLink =parseInt(param.get('return'));
      }

      //Get ContactId,AccountId
      if (param.get('ContactId') != undefined) {
        this.ContactId =parseInt(param.get('ContactId'));
      }
      if (param.get('AccountId') != undefined) {
        this.AccountId =parseInt(param.get('AccountId'));
      }

    });

    this.RegardingId=18;
    this.RegarId=this.DealId;

    //this.GetSalutation();
    //this.GetAllCurrencies();

    // this.service.getEmployerListFromService();
    //debugger;
    let leadsource=this.CRMService.GetLeadSource();

    //http://localhost:49266/api/leads/GetLeadSource
    // let result = this.http.get('http://localhost:49266/api/leads/GetLeadSource').pipe(map((user: any) => console.log(this.TLeadSourceList=user) ));

    // let result = this.http.get('http://localhost:49266/api/leads/GetLeadSource')
    //             .toPromise()
    //             .then(res=>
    //               {
    //                 console.log(res);
    //               }
    //               );
    


    // getFiles() {
    //   return this.http.get<any>('assets/showcase/data/files.json')
    //     .toPromise()
    //     .then(res => <TreeNode[]>res.data);
    // }


    this.GetLeadSource();
    this.GetLeadRatingDomainItem();
    this.GetDealStage();
    this.GetDealType();


    if (this.DealId > 0) {

      this.FormMode = "EDIT";
    }
    else {
      this.FormMode = "NEW";
    }
  

    if (this.FormMode == "NEW") {

      this.IsSummaryExpand = true;
      this.IsDetailsExpand = true;
      this.IsContactGroupsExpand=true;

      this.ShowQualify = false;
      this.ShowDisQualify=false;
      this.disabledselect=false;

      this.GetUserInfoByUserId(this.UserId);
      this.HideAssignedTo=true;

      //debugger;
    
      this.GetAccountsDomainItem(this.AccountId);
      this.GetContactsByAccountsId(this.AccountId,this.ContactId);

      this.DisabledAccount=true;

      if(this.ReturnLink==3)
      {
        this.IsShowAccount = false;
        this.IsShowContact = false;
      }
      else
      {
        this.IsShowAccount = true;
        this.IsShowContact = true;
      }
      
    }
    else {

      this.HideAssignedTo=false;
      this.IsSummaryExpand = true;
      this.IsDetailsExpand = true;
      this.IsContactGroupsExpand=true;
      this.IsReadOnly="";
      this.disabledselect=true;

      setTimeout(() => {
        this.GetDealInfo(this.DealId);
      }, 200);
    
      if(this.ReturnLink==3)
      {
        this.IsShowAccount = false;
        this.IsShowContact = false;
      }
      else
      {
        this.IsShowAccount = true;
        this.IsShowContact = true;
      }

    }

    
  }
  fetchMore(term) {
    //debugger;
    const len = this.photosBuffer.length;
    if (term) {
      term = term.toLowerCase();
    }
    const more = this.photos
      .filter((x) => x.title.toLowerCase().includes(term))
      .slice(len, this.bufferSize + len);
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.photosBuffer = this.photosBuffer.concat(more);
      this.photosBuffer$ = of(this.photosBuffer);
    }, 200);
  }

  onSearch() {
    this.photosBuffer = this.photos.slice(0, 10);
    this.photosBuffer$ = of(this.photosBuffer);
    this.input$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((term) => this.fakeService(term))
      )
      .subscribe((data) => {
        this.photosBuffer = data.slice(0, this.bufferSize);
        this.photosBuffer$ = of(this.photosBuffer);
      });
  }
  GetUserInfoByUserId(UserId: number) {
    let userId = UserId;
    this.CRMService.GetUserInfoByUserId(userId)
        .subscribe((data: UserManagement) => {
          ////debugger;
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
  CustomTemplatesClick(e) {
    //debugger;
    console.log('click new');
  }
  ClickTest(e)
  {
    //debugger;
    
    this.DisabledAccount = !this.DisabledAccount;
    this.IsShowAccount = !this.IsShowAccount;
    this.IsShowContact = !this.IsShowContact;
    
    // if(this.IsAccountOpen)
    // {
    //   this.NGBAccountIdRef.close();
    //   this.IsAccountOpen=false;
    // }
    // else
    // {
    //   this.NGBAccountIdRef.open();
    //   this.IsAccountOpen=true;
    // }

  }
  ClickBack(e) {
    if (this.ReturnLink == 1) {
      this.router.navigate([`/crm/deallist/9`]);
    }
    else if (this.ReturnLink == 2) {
      this.router.navigate([`/crm/deallist/${this.getRandomInt(10)}`]);
    }
    else if (this.ReturnLink == 3)
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
      ////debugger;
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
      ////debugger;
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
      ////debugger;
      if (LeadSourceInfoRes != null) {
        this.LeadSourceList = LeadSourceInfoRes;
        this.showLoadingIcon = false;
      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
      }, 500);
    });
  }

  GetDealStage() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetDealStage();
    lead.subscribe((DealStareRes) => {
      ////debugger;
      if (DealStareRes != null) {
        this.DealStageList = DealStareRes;
        this.showLoadingIcon = false;
      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking
      }, 500);
    });
  }
  
  GetDealType() {
    //this.blockUI.start('Loading...'); // Start blocking   
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetDealType();
    lead.subscribe((DealTypeRes) => {
      ////debugger;
      if (DealTypeRes != null) {
        this.DealTypeList = DealTypeRes;
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
      ////debugger;
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
      ////debugger;
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
    ////debugger;
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
      ////debugger;
      if (LeadStatusDomainItemRes != null) {
        this.LeadStatusDomainItemList = LeadStatusDomainItemRes;
        this.showLoadingIcon = false;

        ////debugger;
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

  GetDealInfo(DealId: any) {
    //this.blockUI.start("Loading..."); // Start blocking
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetDealById(DealId);
    lead.subscribe((DealInfoRes) => {
      //debugger;
      this.DealInfo = DealInfoRes;
      if (DealInfoRes != null) {
        
        this.GetAccountsDomainItem(0);

        this.showLoadingIcon = false;    

        this.DealForm.controls["DealId"].setValue(DealId);
        this.DealForm.controls["DealName"].setValue(this.DealInfo.DealName);
        this.DealForm.controls["AccountId"].setValue(this.DealInfo.AccountId);
        this.DealForm.controls["AccountName"].setValue(this.DealInfo.AccountName );
        this.DealForm.controls["ContactId"].setValue(this.DealInfo.ContactId);
        this.DealForm.controls["ContactName"].setValue(this.DealInfo.ContactName);

         this.DealForm.controls["Amount"].setValue(this.DealInfo.Amount);
         this.DealForm.controls["ClosingDate"].setValue(this.DealInfo.ClosingDate);
         this.DealForm.controls["DealStageId"].setValue(this.DealInfo.DealStageId);


        //Set Deal Stages Close & Lost
        let DealStageInfo=this.DealStageList.filter(x=>x.DealStageId==this.DealInfo.DealStageId)[0];

        this.DealStageClose=DealStageInfo.IsClose;
        this.DealStageLost=DealStageInfo.IsLost;
        this.DealCloseButtonText=DealStageInfo.DealStageName;


         this.DealForm.controls["DealClose"].setValue(this.DealInfo.DealClose);
         this.DealForm.controls["DealLost"].setValue(this.DealInfo.DealLost);

         this.DealForm.controls["TotalAmount"].setValue(this.DealInfo.TotalAmount);
         this.DealForm.controls["UpfrontOrAdvance"].setValue(this.DealInfo.UpfrontOrAdvance);
         this.DealForm.controls["PoNumber"].setValue(this.DealInfo.PoNumber);
         this.DealForm.controls["Balance"].setValue(this.DealInfo.Balance);
         this.DealForm.controls["Remarks"].setValue(this.DealInfo.Remarks);
         this.DealForm.controls["ClosedBy"].setValue(this.DealInfo.ClosedBy);
         this.DealForm.controls["ClosedDate"].setValue(this.DealInfo.ClosedDate);

         //debugger;
         this.DealForm.controls["LeadSourceId"].setValue(DealInfoRes.LeadSourceId);
         this.DealForm.controls["RatingId"].setValue(DealInfoRes.RatingId);



         //Check Deal Close
        //debugger;
        this.IsDealClose=DealInfoRes.DealClose;
        this.IsDealLost=DealInfoRes.DealLost;

        if(this.IsDealClose==true)
        {
          this.IsShowSave=true;
        }
        else
        {
          this.IsShowSave=false;
        }

        // if(this.IsDealClose==true && this.IsDealLost==false)
        // {   
        //   this.DealCloseButtonText=" Close Won";
        // }
    
        // else if(this.IsDealClose==true && this.IsDealLost==true)
        // {
        //   this.DealCloseButtonText=" Close Lost";
        // }
        // else
        // {
        //   this.DealCloseButtonText=" Close";
        // }


         if(this.DealInfo.AccountId>0)
         {
          this.GetContactsByAccountsId(this.DealInfo.AccountId);
         }

         if(this.DealInfo.ClosingDate=="1900-01-01")
         {
           this.ClosingDate="";
         }
         else
         {
           this.ClosingDate=this.DealInfo.ClosingDate;
         }
         //Closing Date
         if(this.ClosingDate!=null)
         {
           if (DealInfoRes.ClosingDate != "1900-01-01") {

             this.ClosingDateD = new Date(DealInfoRes.ClosingDate);
 
             const AnniversaryYear = Number(this.datePipe.transform(this.ClosingDateD, 'yyyy'));
             const AnniversaryMonth = Number(this.datePipe.transform(this.ClosingDateD, 'MM'));
             const AnniversaryDay = Number(this.datePipe.transform(this.ClosingDateD, 'dd'));
 
             this.DealForm.controls.ClosingDate.setValue({
               year: AnniversaryYear,
               month: AnniversaryMonth,
               day: AnniversaryDay
             });
 
           }
         }
         
       
   
        //debugger;

        this.CreatedBy=this.DealInfo.CreatedBy;
        this.CreatedUser=this.userDetails.FullName;

        this.OwnerId=this.DealInfo.OwnerId;
        this.OwnerName=this.userDetails.FullName;

        this.AssignedUserId=this.OwnerId;
        this.AssignedUserName=this.OwnerName;

        // if (this.LeadStatusDomainItemList.length > 0) {
        //   this.SetLeadStatus(this.LeadStatusId);
        // }


        // this.LeadSourceSelected = this.DealInfo.LeadSourceId;
        // this.SelectedLeadSourceId = this.DealInfo.LeadSourceId;
        
        //Get Activities
        let poFilterData: ActivityFilterModel = null;

        poFilterData = new ActivityFilterModel();
        
        poFilterData.ModuleId=this.ModuleId;
        poFilterData.FormId=this.FormId;
        poFilterData.ViewId=this.ViewId;
        poFilterData.RegardingId=this.RegardingId;

        poFilterData.RegarId=DealInfoRes.ContactId;

        //Call API 
        this.SearchActivities(poFilterData);

      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking

      }, 300);
    });

  }

  GetLeadsById(DealId: any) {
    //this.blockUI.start("Loading..."); // Start blocking
    this.showLoadingIcon = true;
    let lead = <Observable<any>>this.CRMService.GetLeadsById(DealId);
    lead.subscribe((DealInfoRes) => {
      ////debugger;
      this.DealInfo = DealInfoRes;


      if (DealInfoRes != null) {

        
        this.showLoadingIcon = false;       

        //debugger;
        this.LeadTopic = DealInfoRes.Topic;
        this.DealForm.controls["DealId"].setValue(DealId);
        this.DealForm.controls["Topic"].setValue(DealInfoRes.Topic);
        this.DealForm.controls["SalutationId"].setValue(DealInfoRes.SalutationId);
        this.DealForm.controls["FirstName"].setValue(DealInfoRes.FirstName);
        this.DealForm.controls["LastName"].setValue(DealInfoRes.LastName);
        this.DealForm.controls["JobTitle"].setValue(DealInfoRes.JobTitle);
        this.DealForm.controls["BusinessPhone"].setValue(DealInfoRes.BusPhone);
        this.DealForm.controls["Mobile"].setValue(DealInfoRes.Mobile);
        this.DealForm.controls["Email"].setValue(DealInfoRes.EmailId);
        this.DealForm.controls["SourceCampaign"].setValue(DealInfoRes.SourceCampaign);
        this.DealForm.controls["CompanyName"].setValue(DealInfoRes.CompName);
        this.DealForm.controls["AnnualRevenue"].setValue(DealInfoRes.AnnualRevenue);
        this.DealForm.controls["EstBudget"].setValue(DealInfoRes.EstBudget);
        this.DealForm.controls["NoOfEmployee"].setValue(DealInfoRes.NoOfEmployees);
        this.DealForm.controls["WebSite"].setValue(DealInfoRes.WebSite);
        this.DealForm.controls["Street1"].setValue(DealInfoRes.Street1);
        this.DealForm.controls["Street2"].setValue(DealInfoRes.Street2);
        this.DealForm.controls["Street3"].setValue(DealInfoRes.Street3);
        this.DealForm.controls["Country"].setValue(DealInfoRes.Country);
        this.DealForm.controls["City"].setValue(DealInfoRes.City);
        this.DealForm.controls["Locality"].setValue(DealInfoRes.Locality);
        this.DealForm.controls["LandMark"].setValue(DealInfoRes.LandMark);
        this.DealForm.controls["PinCode"].setValue(DealInfoRes.PinCode);
        //this.DealForm.controls["LeadSource"].setValue(DealInfoRes.LeadSourceId);
        this.DealForm.controls["LeadSourceId"].setValue(DealInfoRes.LeadSourceId);
        this.DealForm.controls["CurId"].setValue(DealInfoRes.CurId);
        this.DealForm.controls["LeadStatId"].setValue(DealInfoRes.LeadStatId);

        this.DealForm.controls["CreatedBy"].setValue(DealInfoRes.CreatedBy);
        this.DealForm.controls["OwnerId"].setValue(DealInfoRes.OwnerId);

        this.CreatedBy=DealInfoRes.CreatedBy;
        this.CreatedUser=this.userDetails.FullName;

        this.OwnerId=DealInfoRes.OwnerId;
        this.OwnerName=this.userDetails.FullName;

        this.LeadStatusId = DealInfoRes.LeadStatId;
        ////debugger;


        if (this.LeadStatusDomainItemList.length > 0) {
          this.SetLeadStatus(this.LeadStatusId);
        }


        this.LeadSourceSelected = DealInfoRes.LeadSourceId;
        this.SelectedLeadSourceId = DealInfoRes.LeadSourceId;
        this.IsClose = DealInfoRes.Converted;
        this.DealForm.controls["IsConvert"].setValue(DealInfoRes.Converted);
        this.DealForm.controls["CreatedDate"].setValue(DealInfoRes.CreatedDate);
        this.DealForm.controls["UpdatedDate"].setValue(DealInfoRes.UpdatedDate);
        this.CurrencyIdSelected = DealInfoRes.CurId;
        this.SalutationId = DealInfoRes.SalutationId;
        //this.LeadSourceSelected = +DealInfoRes.LeadSource;

        ////debugger;

        //Lead Status
        this.IsQualified = DealInfoRes.IsQualified;
        this.ConvertedBy = DealInfoRes.ConvertedBy;
        this.ConvertedDate = DealInfoRes.ConvertedDate;
        this.IsClose = DealInfoRes.IsClose;


        if (DealInfoRes.CompName = "" || DealInfoRes.CompName != null) {
          this.ShowQualify = true;
          this.ShowDisQualify=true;
        }


      }

      setTimeout(() => {
        //this.blockUI.stop(); // Stop blocking

      }, 300);
    });

  }

  ClickCloseDeal(e,ButtonText:any)
  {
    //this.HeaderTitle = "Close Deal " + ButtonText;

    this.HeaderTitle = "Close Deal [ " + ButtonText + "]";

    this.InitializeDealCloseForm();


    //Set Amount And Closing Date
    
    let DealId=this.DealForm.controls["DealId"].value;
    let Amount=this.DealForm.controls["Amount"].value;;
    let ClosingDate=this.DealForm.controls["ClosingDate"].value;
    let DealStageId=this.DealForm.controls["DealStageId"].value;
    let TotalAmount=this.DealForm.controls["TotalAmount"].value;
    let UpfrontOrAdvance=this.DealForm.controls["UpfrontOrAdvance"].value;
    let PoNumber=this.DealForm.controls["PoNumber"].value;
    let Balance=this.DealForm.controls["Balance"].value;
    let Remarks=this.DealForm.controls["Remarks"].value;
    let ReasonForLoss="";
    let CreatedBy=this.UserId;
    let DealStageName=this.DealForm.controls["DealStageName"].value;

    let ClosedBy=this.DealForm.controls["ClosedBy"].value;
    let ClosedDate=this.DealForm.controls["ClosedDate"].value;
    
    this.DealCloseForm.controls["DealId"].setValue(DealId);
    this.DealCloseForm.controls["Amount"].setValue(Amount);
    this.DealCloseForm.controls["ClosingDate"].setValue(ClosingDate);
    this.DealCloseForm.controls["DealStageId"].setValue(DealStageId);
    this.DealCloseForm.controls["CreatedBy"].setValue(CreatedBy);
    this.DealCloseForm.controls["UserId"].setValue(CreatedBy);
    this.DealCloseForm.controls["DealStageName"].setValue(CreatedBy);

    this.DealCloseForm.controls["TotalAmount"].setValue(TotalAmount);
    this.DealCloseForm.controls["UpfrontOrAdvance"].setValue(UpfrontOrAdvance);
    this.DealCloseForm.controls["PoNumber"].setValue(PoNumber);
    this.DealCloseForm.controls["Balance"].setValue(Balance);
    this.DealCloseForm.controls["Remarks"].setValue(Remarks);
    

    //debugger;
    if(this.DealStageClose==true && this.DealStageLost==false)
    {
      this.DealCloseForm.controls["DealReasonId"].setValue(0);
    }
    else
    {
      this.DealCloseForm.controls["DealReasonId"].setValue(null);
    }

    //Dialog starts here
    let DialogAssignToRef = this.DialogAssignTo.open(DealCloseWonDialog, {
      width: '650px',
      height: '650px',
      disableClose: true,
      data: { HeaderTitle: this.HeaderTitle,DealCloseForm:this.DealCloseForm,
        UserId:CreatedBy,DealStageId:this.DealStageId, DealStageName:this.DealStageName,
        DealStages:this.DealStageList,
        DealId: this.DealId,Contactid:this.ContactId,AccountId:this.AccountId }
    });

    //Dialog before close
    DialogAssignToRef.beforeClose().subscribe(result => {
      let mlistname = DialogAssignToRef
    });
    //Dialog after closed
    DialogAssignToRef.afterClosed().subscribe(result => {

      //DialogAssignToRef.componentInstance.data.ContactForm.value;
      //debugger;
      if (DialogAssignToRef.componentInstance.data.SaveClick == "NO") {
        console.log('in No btnClick');
      }
      else if (DialogAssignToRef.componentInstance.data.SaveClick == 'YES') {
        //debugger;
        this.NGBContactIdRef.open();

        // this.AssignedUserId = DialogAssignToRef.componentInstance.data.ManagerId;
        // this.AssignedUserName = DialogAssignToRef.componentInstance.data.ManagerName;

        // this.OwnerId = this.AssignedUserId;
        // this.OwnerName = this.AssignedUserName;

        // DialogAssignToRef.componentInstance.data.ContactId=1;

        //this.DealForm.controls["OwnerId"].setValue(this.AssignedUserId);

        console.log('in Yes btnClick');

        //this.getList()
        //Get the reporting manager list
      }
    });
    //Dialog ends here
  }

  onCancel(e) {
    this.ClickBack(e);
  }
  spew(message) {
    console.log(message);
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
  

  onSubmit(MyDealForm: any, myPanel, e) {

   
    //debugger;
    if (this.DealForm.invalid) 
    {

      this.markAsDirty(this.DealForm);

      return;

    }
    //debugger;
    this.MyDeal = new Deal();
    this.MyDeal.DealId = this.DealId;
    this.MyDeal.DealName = MyDealForm.DealName;
    this.MyDeal.AccountId = MyDealForm.AccountId;
    this.MyDeal.AccountName = MyDealForm.AccountName;
    this.MyDeal.ContactId = MyDealForm.ContactId;
    this.MyDeal.ContactName = MyDealForm.ContactName;
    this.MyDeal.DealTypeId = MyDealForm.DealTypeId;
    this.MyDeal.DealTypeName = MyDealForm.DealTypeName;
    this.MyDeal.NextStep = MyDealForm.NextStep;
    this.MyDeal.LeadSourceId = MyDealForm.LeadSourceId;
    this.MyDeal.RatingId= MyDealForm.RatingId;
    this.MyDeal.Amount = MyDealForm.Amount;

    //debugger;
    //Closing Date
    const ClosingDateControl =this.DealForm.controls["ClosingDate"];

    ////debugger;
    if(ClosingDateControl.status=="VALID")
    {
      if(ClosingDateControl.value !=null)
      {
        this.ClosingDate=MyDealForm.ClosingDate.year+"-"+MyDealForm.ClosingDate.month+"-"+MyDealForm.ClosingDate.day;
        this.MyDeal.ClosingDate=this.ClosingDate;
      }
      else
      {
        this.MyDeal.ClosingDate="";
      }
    }
    else
    {
      this.MyDeal.ClosingDate  ="";
      ClosingDateControl.setErrors(null);
    }


    this.MyDeal.ClosingDate = this.ClosingDate;
    this.MyDeal.PipelineId = MyDealForm.PipelineId;
    this.MyDeal.DealStageId = MyDealForm.DealStageId;
    this.MyDeal.DealStageName = MyDealForm.DealStageName;

    this.MyDeal.Probability = MyDealForm.Probability;
    this.MyDeal.ExpectedRevenue = MyDealForm.ExpectedRevenue;
    this.MyDeal.CampaignSource=MyDealForm.CampaignSource;
    this.MyDeal.DealDescription = MyDealForm.DealDescription;
    this.MyDeal.OwnerId = this.UserId;
    this.MyDeal.CreatedBy= this.UserId;
    this.MyDeal.UpdatedBy = this.UserId;

    //debugger;
    
    if (this.DealForm.valid) {

      //debugger;
      if (this.FormMode == "NEW") {

        this.MyDeal.CreatedBy = this.userDetails.UserID;
        this.CreateDeal(this.MyDeal);

      }
      else {

        this.MyDeal.UpdatedBy = this.userDetails.UserID;
        this.UpdateDeal(this.MyDeal)
      }

    }
    else {
      //myPanel.expanded = true; 
    }
  }


  CreateDeal(MyDeal: any) {
    const self = this;
    this.blockUI.start('Creating Deal ...'); // Start blocking 
    this.result = this.CRMService.CreateDeal(MyDeal).subscribe(
      (data: any) => {

        //debugger;

        if (data.Status == "SUCCESS") {
          this.DealId = data.Data;
          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Deal Created successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          this.router.navigate([`/crm/deallist/${this.getRandomInt(10)}`]);
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

          self.snackBar.open("Problem in Creating Deal please try again", null, {
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



  UpdateDeal(MyDeal: any) {
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

    MyDeal.UpdatedBy = this.userDetails.UserID;

    this.result = this.CRMService.UpdateDeal(MyDeal).subscribe(
      (data: any) => {

        if (data.Status == "SUCCESS") {

          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Deal updated successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          this.router.navigate([`/crm/deallist/${this.getRandomInt(10)}`]);

          //this.GetDealInfo(this.DealId);
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

          self.snackBar.open("Problem in updateing Deal please try again", null, {
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

          self.snackBar.open("Problem in updateing Deal please try again", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });


        }
        else {
          this.formError = err.statusText;
        }
      });
  }
  OnClosingDatePickerFocus(element: NgbInputDatepicker, event: any) {
    if (!element.isOpen()) {
        element.open();
    }
}

  OnDealTypeChange(e)
  {
    console.log(e.currentTarget.value);
  }
  OnAccountOpen(e)
  {
    ////debugger;
    console.log(e);
  }
  OnAccountClose(e)
  {
    ////debugger;
    console.log(e);
  }
  OnAccountSelect(e) {
    ////debugger;
    if (e != null) {
      console.log(e.AccountId);

      this.DealForm.controls["AccountId"].setValue(e.AccountId);
      this.DealForm.controls["AccountName"].setValue(e.AccountName);
      
      this.GetContactsByAccountsId(e.AccountId);
    }
  }

  OnContactOpen(e)
  {
    ////debugger;
    console.log(e);
  }
  OnContactClose(e)
  {
    ////debugger;
    console.log(e);
  }
  OnContactSelect(e) {
    //debugger;
    if (e != null) {
      console.log(e.Contactid);

      if(e.ContactId>0)
      {
        this.DealForm.controls["ContactId"].setValue(e.ContactId);
        this.DealForm.controls["ContactName"].setValue(e.ContactName);

        // if(this.DealForm.controls["AccountId"].value ==null)
        // {
        //   this.DealForm.controls["AccountId"].setValue(e.AccountId);
        //   this.DealForm.controls["AccountName"].setValue(e.AccountName);
        // }
      }
      else
      {

        this.DealForm.controls["ContactId"].setErrors({ required: true });
        this.DealForm.controls["ContactId"].markAsTouched();
        //this.renderer.selectRootElement('#ContactId').focus();

        this.NGBContactIdRef.focus();

        this.DealForm.controls["ContactId"].setValue(null);
        this.DealForm.controls["ContactName"].setValue(null);
        //this.DealForm.controls["ContactId"].setErrors();
        
      }
      //this.GetContactsByAccountsId(e.AccountId);
    }
  }

  ClickNewContact(e)
  {
    this.HeaderTitle = "New Contact";

    this.InitializeContactForm();

    let AccountId=this.DealForm.controls["AccountId"].value;

    //debugger;
    //let a =this.NGBAccountIdRef;
    this.NGBContactIdRef.close();
    //Dialog starts here
    let DialogAssignToRef = this.DialogAssignTo.open(DealContactDialog, {
      width: '550px',
      height: '450px',
      disableClose: true,
      data: { HeaderTitle: this.HeaderTitle,ContactForm:this.ContactForm, DealId: this.DealId,AccountId:AccountId,UserId:this.UserId }
    });

    //Dialog before close
    DialogAssignToRef.beforeClose().subscribe(result => {
      let mlistname = DialogAssignToRef
    });
    //Dialog after closed
    DialogAssignToRef.afterClosed().subscribe(result => {

      //DialogAssignToRef.componentInstance.data.ContactForm.value;
      
      if (DialogAssignToRef.componentInstance.data.SaveClick == "NO") {
        console.log('in No btnClick');
      }
      else if (DialogAssignToRef.componentInstance.data.SaveClick == 'YES') {
        //debugger;
     
        let AccountId=DialogAssignToRef.componentInstance.data.AccountId;
        this.ContactsAccountsDomainItemsInfo = new ContactsAccountsDomainItems();

        this.ContactsAccountsDomainItemsInfo.ContactId=DialogAssignToRef.componentInstance.data.ContactId;
        this.ContactsAccountsDomainItemsInfo.ContactName=DialogAssignToRef.componentInstance.data.ContactName;

        this.ContactsAccountDomainItemList.push(this.ContactsAccountsDomainItemsInfo);

        this.DealForm.controls["ContactId"].setValue(DialogAssignToRef.componentInstance.data.ContactId);
        this.DealForm.controls["ContactName"].setValue(DialogAssignToRef.componentInstance.data.ContactName);

        this.GetContactsByAccountsId(AccountId,DialogAssignToRef.componentInstance.data.ContactId);

        this.NGBContactIdRef.open();

        // this.AssignedUserId = DialogAssignToRef.componentInstance.data.ManagerId;
        // this.AssignedUserName = DialogAssignToRef.componentInstance.data.ManagerName;

        // this.OwnerId = this.AssignedUserId;
        // this.OwnerName = this.AssignedUserName;

        // DialogAssignToRef.componentInstance.data.ContactId=1;

        //this.DealForm.controls["OwnerId"].setValue(this.AssignedUserId);

        console.log('in Yes btnClick');

        //this.getList()
        //Get the reporting manager list
      }
    });
    //Dialog ends here
  }

  ClickNewAccount(e) {
    this.HeaderTitle = "New Account";

    //debugger;
    //let a =this.NGBAccountIdRef;
    this.NGBAccountIdRef.close();

    this.InitializeAccountForm();


    //Dialog starts here
    let DialogAssignToRef = this.DialogAssignTo.open(DealAccountDialog, {
      width: '650px',
      height: '350px',
      disableClose: true,
      data: { HeaderTitle: this.HeaderTitle,AccountForm:this.AccountForm, DealId: this.DealId,UserId:this.UserId }
    });

    //Dialog before close
    DialogAssignToRef.beforeClose().subscribe(result => {
      let mlistname = DialogAssignToRef
    });
    //Dialog after closed
    DialogAssignToRef.afterClosed().subscribe(result => {

      //debugger;
      if (DialogAssignToRef.componentInstance.data.SaveClick == "NO") {
        console.log('in No btnClick');
      }
      else if (DialogAssignToRef.componentInstance.data.SaveClick == 'YES') {
        //debugger;
      

        let AccountId=parseInt(DialogAssignToRef.componentInstance.data.AccountId);
        let AccountName=DialogAssignToRef.componentInstance.data.AccountName;
        if (AccountId > 0) {
          this.GetAccountsDomainItem(AccountId);

          // setTimeout(() => {
          //   this.DealForm.controls["AccountId"].setValue(AccountId);
          //   this.DealForm.controls["AccountName"].setValue(AccountName);
          //   this.NGBAccountIdRef.open();
          // }, 200);

        }
        console.log('in Yes btnClick');

        //this.getList()
        //Get the reporting manager list
      }
    });
    //Dialog ends here

  }

  OnAccountChange(e)
  {
    //debugger;
    console.log(e.currentTarget.value);
    
    this.DealForm.controls["AccountId"].setValue(e.currentTarget.value);

    let AccountName=this.AccountsDomainItemList.filter(x=>x.AccountId==e.currentTarget.value);
    if(AccountName.length>0)
    {
      this.DealForm.controls["AccountName"].setValue(AccountName[0].AccountName);
    }
    else
    {
      this.DealForm.controls["AccountName"].setValue(AccountName);
    }
    this.GetContactsByAccountsId(e.currentTarget.value);
  }
  OnContactChange(e)
  {
    //debugger;
    console.log(e.currentTarget.value);
    let ContactName=this.ContactsAccountDomainItemList.filter(x=>x.ContactId==e.currentTarget.value);
    if(ContactName.length>0)
    {
      this.DealForm.controls["ContactName"].setValue(ContactName[0].ContactName);
    }
    else
    {
      this.DealForm.controls["ContactName"].setValue(ContactName);
    }
    
  }

  OnLeadSourceChange(e)
  {
    console.log(e.currentTarget.value);
  }
  OnLeadRatingChange(e)
  {
    //debugger;
    console.log(e.currentTarget.value);
  }
  OnDealStageChange(e) {
    //debugger;
    console.log(e.currentTarget.value);
    this.DealStageId=e.currentTarget.value;

    let DealStageInfo=this.DealStageList.filter(x=>x.DealStageId==e.currentTarget.value)[0];

    this.DealStageClose=DealStageInfo.IsClose;
    this.DealStageLost=DealStageInfo.IsLost;

    this.CurrentDealStage=DealStageInfo.DealStageName;
    this.DealStageName=DealStageInfo.DealStageName;;


    this.IsDealClose=DealStageInfo.DealClose;
    this.IsDealLost=DealStageInfo.DealLost;

    //alert("Need To Show Close Dialog -- " + DealStageInfo.DealStageName);
    this.DealCloseButtonText =DealStageInfo.DealStageName;

    this.DealForm.controls["DealStageName"].setValue(this.DealCloseButtonText);
   
    if(this.CurrentDealStage.indexOf('Close')==0)
    {
      this.ClickCloseDeal(e,this.DealCloseButtonText);
    }
    else
    {
      this.IsShowSave=false;
    }



  }

  get invalidFields() {
    const fields: string[] = [];
    for (const controlName in this.DealForm.controls) {
      const control = this.DealForm.get(controlName);
      if (control.invalid) {
        fields.push(controlName);
      }
    }
    return fields;
  }
// Assign To Code Starts Here           
SelectReportingManager(OwnerId:any,event): void 
{
  this.HeaderTitle = "Assigned manager";

  let ReportingManager = <Observable<any>>this.CRMService.GetReportingUsers(this.CompanyId);
  ReportingManager.subscribe((ReportingUsers) => {
    //debugger;
    if (ReportingUsers.length > 0) {

      this.ReportingUserList = ReportingUsers;

      //Dialog starts here
      let DialogAssignToRef = this.DialogAssignTo.open(DealAssignedToDialog, {
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
        
        //debugger;
        if (DialogAssignToRef.componentInstance.data.SaveClick == "NO") {
          console.log('in No btnClick');
        }
        else if (DialogAssignToRef.componentInstance.data.SaveClick == 'YES') {
          //debugger;
          this.AssignedUserId = DialogAssignToRef.componentInstance.data.ManagerId;
          this.AssignedUserName = DialogAssignToRef.componentInstance.data.ManagerName;

          this.OwnerId=this.AssignedUserId;
          this.OwnerName=this.AssignedUserName;

          this.DealForm.controls["OwnerId"].setValue(this.AssignedUserId);
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

//Utility Functions Starts here
GetAccountsDomainItem(AccountId:number) {
  //this.blockUI.start('Loading...'); // Start blocking   
  this.showLoadingIcon = true;
  let AccountsDomain = <Observable<any>>this.CRMService.GetAccountsDomainItem();
  AccountsDomain.subscribe((AccountsDomainItemListsRes) => {
    //debugger;
    this.AccountsDomainItemList=null;
    if (AccountsDomainItemListsRes != null) {
      this.AccountsDomainItemList = AccountsDomainItemListsRes;
      this.showLoadingIcon = false;
      this.IsAccountsLoaded=true;
    }

    
    setTimeout(() => {
      if(AccountId>0)
      {
        //debugger;
        let AccountName=AccountsDomainItemListsRes.filter(x=>x.AccountId==AccountId)[0].AccountName;
        this.DealForm.controls["AccountId"].setValue(AccountId);
        this.DealForm.controls["AccountName"].setValue(AccountName);

        this.AccountName=AccountName;

        if(this.FormMode=="EDIT")
        {
          this.NGBAccountIdRef.open();
        }
      }
    }, 200);
    
  });

}

GetContactsByAccountsId(AccountId: any,ContactId?:number) {

  this.showLeftPanelLoadingIcon = true;
  this.CRMService.GetContactsByAccountsId(AccountId)
    .subscribe((data: any) => {
      ////debugger;
      //myPanel.expanded = true; 
      this.showLeftPanelLoadingIcon = false;
      ////debugger;
      if (data.length>0) {
        this.ContactsAccountDomainItemList = data;

        if(ContactId>0)
        {
          //debugger;
          let ContactName = data.filter(x=>x.ContactId==ContactId)[0].ContactName;
          this.DealForm.controls["ContactId"].setValue(ContactId);
          this.DealForm.controls["ContactName"].setValue(ContactName);
          this.ContactName=ContactName;
        }
      }
      else 
      {
        this.ContactsAccountDetailsDTOListItem = new ContactsAccountDetailsDTO();

        this.ContactsAccountDetailsDTOListItem.AccountId=0;
        this.ContactsAccountDetailsDTOListItem.AccountName="NONE";
        this.ContactsAccountDetailsDTOListItem.ContactId=0;
        this.ContactsAccountDetailsDTOListItem.ContactName="... Please Create Contact ...";

        this.ContactsAccountDetailsDTOList.push(this.ContactsAccountDetailsDTOListItem);

        this.ContactsAccountDomainItemList = this.ContactsAccountDetailsDTOList;
        this.filterMessage = "No matching records are found";
      }
    }, (error) => {
      this.showLeftPanelLoadingIcon = false;
    });
}

GetContactDomainItems() {
  //this.blockUI.start('Loading...'); // Start blocking   
  this.showLoadingIcon = true;
  let IndustryR = <Observable<any>>this.CRMService.GetContactDomainItems();
  IndustryR.subscribe((ContactDomainItemsRes) => {
    ////debugger;
    if (ContactDomainItemsRes != null) {
      this.RegarDomainItemsList = ContactDomainItemsRes;
      this.showLoadingIcon = false;
    }

    setTimeout(() => {
      //this.blockUI.stop(); // Stop blocking
    }, 500);
  });
}


//Utility Functions Ends here
//Activities Functions Starts Here
  //****************************************************************************************************************/
  SearchActivities(ActivityFilterData?: ActivityFilterModel) 
  {
    //debugger;

    this.UserId=this.userDetails.UserID;
    let LeadSearchInput = {
        Skip: this.ActivityListsPagerConfig.RecordsToSkip,
        Take: this.ActivityListsPagerConfig.RecordsToFetch,
        ActivitySubject:"",
        ActivityDesc:"",
        StartDate:null,
        EndDate:null,
        DueDate:ActivityFilterData.DueDate,
        UserId:this.UserId,
        RegardingId:18,
        RegarId:ActivityFilterData.RegarId

    };
    this.showLeftPanelLoadingIcon = true;
    //SearchActivitiesByViews
    //this.CRMService.SearchActivities(LeadSearchInput)
    this.CRMService.SearchActivitiesByViews(this.ModuleId,this.FormId,this.ViewId, LeadSearchInput)
        .subscribe((data: any) => {
            //debugger;
            this.showLeftPanelLoadingIcon = false;
            this.TotalRecords = data.TotalRecords;
            //
            this.IsFilterDataArrive=true;
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

  ClickNewPhoneActivity(ActivityId,ActivityTypeId,ActivityTypeName,FormMode,e)
  {
    //alert(ActivityId +' '+ActivityTypeId+' '+ActivityTypeName+' '+FormMode);
    //debugger;
    this.ActivityFormMode="NEW";

    //Set Contact Info
    let Contact = new ContactDTO();

    let ContactId=this.DealForm.controls["ContactId"].value;
    let ContactDetails= this.ContactsAccountDomainItemList.filter(x=>x.ContactId==ContactId)[0];

    Contact.ContactId=ContactDetails.ContactId;
    Contact.FirstName=ContactDetails.ContactName.split(' ')[0];
    Contact.LastName=ContactDetails.ContactName.split(' ')[1];

    this.ContactInfo=Contact;
    this.RegarId=ContactId;

    //TODO   Schedule a call, Log a call
    let ActiityDialogRef = this.dialog.open(CrmactivityLogACallComponent, {
      width: '1000px',
      height: '750px',
      disableClose: false,
      data: { 
        RegardingId: this.RegardingId,
        RegarId:this.RegarId,
        HeaderTitle: this.HeaderTitle, 
        FormMode:this.ActivityFormMode,
        ActivityId:ActivityId,
        ActivityTypeId:ActivityTypeId,
        ActivityTypeName: ActivityTypeName,      
        ContactId: this.ContactId,
        ContactInfo: this.ContactInfo
      }
    });

    //Dialog before close
    ActiityDialogRef.beforeClose().subscribe(result => {
      //debugger;
      console.log(result);
      let mlistname = ActiityDialogRef
    });

    //Dialog After Close
    ActiityDialogRef.afterClosed().subscribe(result => {
      //debugger;
      // if (ActiityDialogRef.componentInstance.data.SaveClick == "NO") {
      //   console.log('No Click');
      // }
      // else if (ActiityDialogRef.componentInstance.data.SaveClick == 'YES') {
      // }

      
      console.log(result);
      let poFilterData: ActivityFilterModel = null;

      poFilterData = new ActivityFilterModel();
      
      poFilterData.ModuleId=this.ModuleId;
      poFilterData.FormId=this.FormId;
      poFilterData.ViewId=this.ViewId;

      poFilterData.RegardingId=this.RegardingId;

      let ContactId=this.DealForm.controls["ContactId"].value;
      poFilterData.RegarId=this.ContactId;
      //poFilterData.RegarId=this.DealId;

      //Call API 
      this.SearchActivities(poFilterData);
      ActiityDialogRef.close();

    });
  }  
//****************************************************************************************************************/
//Activities Functions Ends Here
//****************************************************************************************************************/

//****************************************************************************************************************/
  private fakeService(term) {
    if (term) {
      term = term.toLowerCase();
    }

    return of(this.photos).pipe(
      map((data) =>
        data.filter((x: { title: string }) =>
          x.title.toLowerCase().includes(term)
        )
      )
    );
  }
//****************************************************************************************************************/

}





//****************************************************************************************************************/
//Assigned To Dialog starts here
//****************************************************************************************************************/
@Component({
  selector: 'deal-assignedto-dialog',
  templateUrl: 'deal-assignedto-dialog.html',
  styleUrls: ['deal-assignedto-dialog.css']
})
export class DealAssignedToDialog implements OnInit {
  //Auto mapping variables
  selectedRows: any[];
  AccountTypeahead = new EventEmitter<string>();
  ContactTypeahead = new EventEmitter<string>();
  MyListID: any;
  router: any;
  nodes: any;
  //postComments = comments;
  constructor(
    public dialogRef: MatDialogRef<DealAssignedToDialog>,
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
    //debugger;
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

//****************************************************************************************************************/
//New Account Dialog starts here
//****************************************************************************************************************/
@Component({
  selector: 'deal-account-dialog',
  templateUrl: 'deal-account-dialog.html',
  styleUrls: ['deal-account-dialog.css']
})
export class DealAccountDialog implements OnInit ,AfterViewInit {
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
    public dialogRef: MatDialogRef<DealAccountDialog>,
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
    //debugger;
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
    //debugger;
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

        //debugger;

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

//****************************************************************************************************************/
//New Account Dialog Ends here
//****************************************************************************************************************/

//****************************************************************************************************************/
//New Contact Dialog starts here
//****************************************************************************************************************/
@Component({
  selector: 'deal-contact-dialog',
  templateUrl: 'deal-contact-dialog.html',
  styleUrls: ['deal-contact-dialog.css']
})
export class DealContactDialog implements OnInit {
  //Auto mapping variables
  selectedRows: any[];
  formError:string;
  ContactId:number;
  ContactName:string;
  MyListID: any;
  router: any;
  nodes: any;
  ReturnStr:string;
  result:any;
  @BlockUI() blockUI: NgBlockUI;

  //@ViewChild("CloseWonLost") public MyCloseWonLost: Button;
  //@ViewChildren('Topic','FirstName') inputElements: QueryList<ElementRef>;

  @ViewChild('AccountId') AccountIdRef : HTMLSelectElement;
  AccountsLists: Array<AccountsDomainItem> = [];

  ContactsAccountDetailsDTOListItem:ContactsAccountDetailsDTO;
  ContactsAccountDetailsDTOList: Array<ContactsAccountDetailsDTO>=[];

  ContactsAccountDomainItemList: Array<ContactsAccountsDomainItems> =[];

  //postComments = comments;
  constructor(
    public ContactDialogRef: MatDialogRef<DealAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private CRMService: CRMService,
    public snackBar: MatSnackBar,
    private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute) {
  }
  GetAccountsLists(AccountId?:number) {
    //this.blockUI.start('Loading...'); // Start blocking   
    //this.showLoadingIcon = true;
    let AccountsDomain = <Observable<any>>this.CRMService.GetAccountsDomainItem();
    AccountsDomain.subscribe((AccountListRes) => {
      //debugger;
      this.AccountsLists=null;
      if (AccountListRes != null) {
        this.AccountsLists = AccountListRes;
      } 
      
      setTimeout(() => {
        if(AccountId>0)
        {
          //debugger;
          let AccountName=AccountListRes.filter(x=>x.AccountId==AccountId)[0].AccountName;
          this.data.ContactForm.controls["AccountId"].setValue(AccountId);
          this.data.ContactForm.controls["AccountName"].setValue(AccountName);

          this.AccountIdRef.disabled=true;
        }
      }, 200);
    });
  }
  ngOnInit() {
    let Data=this.data;

      //debugger;
      this.data.ContactForm.controls["AccountId"].setValue(Data.AccountId);
      let timeoutId = setTimeout(() => {
        this.GetAccountsLists(Data.AccountId);
      }, 200);
      

  }

  ContactNoClick(e): void {

    this.data.SaveClick = "NO";
    this.ContactDialogRef.close(this.MyListID);
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
  OnAccountChange(e)
  {
    console.log(e.currentTarget.value);
  }

  OnContactSubmit(MyContactForm:any,e)
  {

    //debugger;
    this.data.ContactForm.controls["AccountId"].setValue(this.data.AccountId);
    this.data.ContactForm.controls["CreatedBy"].setValue(this.data.UserId);

    MyContactForm.FirstName=this.data.ContactForm.value.FirstName;
    MyContactForm.LastName=this.data.ContactForm.value.LastName;
    MyContactForm.AccountId=this.data.ContactForm.value.AccountId;
    MyContactForm.CreatedBy=this.data.UserId;

    if(this.data.ContactForm.invalid)
    {
      this.markAsDirty(this.data.ContactForm)
    }
    else if(this.data.ContactForm.valid)
    {
      //Submit To Save Account

      this.data.ContactForm.controls["CreatedBy"].setValue(this.data.UserId);
      this.CreateQuickContact(MyContactForm);
    }

    // //debugger;
    // this.data.ContactForm.controls["ContactId"].setValue(9999);
    // this.data.ContactForm.controls["ContactName"].setValue("New Contact");
    // this.data.ContactForm.controls["AccountId"].setValue(8);

    // this.ContactsAccountDetailsDTOListItem = new ContactsAccountDetailsDTO();

    // this.ContactsAccountDetailsDTOListItem.AccountId=8;
    // this.ContactsAccountDetailsDTOListItem.AccountName="Account 2";
    // this.ContactsAccountDetailsDTOListItem.ContactId=9990;
    // this.ContactsAccountDetailsDTOListItem.ContactName="New Contact";

    // this.ContactsAccountDetailsDTOList.push(this.ContactsAccountDetailsDTOListItem);

    // this.data.ContactsAccountDomainItemList = this.ContactsAccountDetailsDTOList;

    // this.ContactDialogRef.close(this.data);
  }

  CreateQuickContact(MyAccountForm: any) 
  {
    const self = this;
    this.blockUI.start('Creating Deal ...'); // Start blocking 
    this.result = this.CRMService.CreateQuickContact(MyAccountForm).subscribe(
      (data: any) => {

        //debugger;

        if (data.Status == "SUCCESS") {
          //this.AccountId = data.Data;
          this.ReturnStr=data.Data;

          this.ContactId=parseInt(this.ReturnStr.split('-')[0]);
          this.ContactName=this.ReturnStr.split('-')[1];

          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Contact Created successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          //Successfully Create Account
           //Adding Contacts
          this.data.ContactId = this.ContactId;
          this.data.ContactName=this.ContactName;

          this.data.ContactForm.controls["ContactId"].setValue(this.ContactId);

          this.data.SaveClick="YES";
          this.ContactDialogRef.close(this.data);

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

          self.snackBar.open("Problem in Creating Contact please try again", null, {
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
  ContactYesClick(event, listData): void {
    const self = this;
    //debugger;
    this.data.SaveClick = "YES";

    this.data.ContactId=4;

    //Adding Contacts
    this.ContactsAccountDetailsDTOListItem = new ContactsAccountDetailsDTO();

    this.ContactsAccountDetailsDTOListItem.AccountId=8;
    this.ContactsAccountDetailsDTOListItem.AccountName="Account 2";
    this.ContactsAccountDetailsDTOListItem.ContactId=9990;
    this.ContactsAccountDetailsDTOListItem.ContactName="New Contact";

    this.ContactsAccountDetailsDTOList.push(this.ContactsAccountDetailsDTOListItem);

    this.data.ContactsAccountDomainItemList = this.ContactsAccountDetailsDTOList;
    
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
//New Account Dialog Ends here
//****************************************************************************************************************/

//****************************************************************************************************************/
//Deal Close Dialog starts here
//****************************************************************************************************************/
@Component({
  selector: 'deal-close-won-dialog',
  templateUrl: 'deal-close-won-dialog.html',
  styleUrls: ['deal-close-won-dialog.css']
})
export class DealCloseWonDialog implements OnInit {
  //Auto mapping variables
  selectedRows: any[];
  @BlockUI() blockUI: NgBlockUI;
  DealResonForLossDomainItemsList: Array<DealReasonForLossDTO> =[];
  ClosingMinDate:Date=new Date();
  ClosingMaxDate:Date=new Date();
  SaveClick:any;
  ContactId:number;
  MyListID: any;
  router: any;
  nodes: any;
  ReturnStr:string;
  result:any;
  formError:any;
  ClosingDate:string;
  ClosingDateD:Date;
  DealStageId:number;
  DealStageName:string;
  DealStageList = [];
  ShowReasonForLoss:boolean=false;

  ContactsAccountDetailsDTOListItem:ContactsAccountDetailsDTO;
  ContactsAccountDetailsDTOList: Array<ContactsAccountDetailsDTO>=[];

  ContactsAccountDomainItemList: Array<ContactsAccountsDomainItems> =[];

  private markAsDirty(group: FormGroup): void {
    group.markAsDirty();
    // tslint:disable-next-line:forin
    for (const i in group.controls) {
      console.log(i);
      group.controls[i].markAsDirty();
      group.controls[i].markAsTouched();
    }
  }
  OnClosingDatePickerFocus(element: NgbInputDatepicker, event: any) {
    if (!element.isOpen()) {
        element.open();
    }
  }
  
  constructor(
    private CRMService: CRMService,
    public CloseDealDialogRef: MatDialogRef<DealCloseWonDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private sessionStorageService: SessionStorageService,
    private route: ActivatedRoute) {
  }
  ngOnInit() {
    
    this.GetDealResonForLossDomainItems();
    //debugger;
    this.DealStageId=this.data.DealStageId;
    this.DealStageList=this.data.DealStages;
    this.DealStageName=this.data.DealStageName;


    let DealStageInfo= this.DealStageList.filter(x=>x.DealStageId== this.DealStageId)[0];
    if(DealStageInfo.IsClose==true && DealStageInfo.IsLost==false)
    {
      this.ShowReasonForLoss=false;
      this.data.DealCloseForm.controls["DealReasonId"].setvalue(0);
    }
    else if(DealStageInfo.IsClose==true && DealStageInfo.IsLost==true)
    {
      this.ShowReasonForLoss=true;
    }
  }

  CloseDealNoClick(e): void {

    this.data.SaveClick = "NO";
    this.CloseDealDialogRef.close(this.data);
  }
  OnDealCloseFormSubmit(MyDealCloseForm: any, e) {

    //debugger;
    if (this.data.DealCloseForm.invalid) {
      this.markAsDirty(this.data.DealCloseForm);

      return;
    }
    else if (this.data.DealCloseForm.valid) {

      //debugger;
      this.data.DealCloseForm.controls["DealId"].setValue(this.data.DealId);
      this.data.DealCloseForm.controls["CreatedBy"].setValue(this.data.UserId);


      const ClosingDateControl =this.data.DealCloseForm.controls["ClosingDate"];

      if(ClosingDateControl.status=="VALID")
      {
        if(ClosingDateControl.value !=null)
        {
          this.ClosingDate=this.data.DealCloseForm.value.ClosingDate.year+"-"+this.data.DealCloseForm.value.ClosingDate.month+"-"+this.data.DealCloseForm.value.ClosingDate.day;
          MyDealCloseForm.ClosingDate=this.ClosingDate;
        }
        else
        {
          MyDealCloseForm.ClosingDate="";
        }
      }
      else
      {
        MyDealCloseForm.ClosingDate  ="";
      }


      MyDealCloseForm.CreatedBy=this.data.Userid;
      MyDealCloseForm.UserId=this.data.UserId;

      MyDealCloseForm.DealStagename=this.data.DealStageName;

      this.DealClose(MyDealCloseForm);
      this.CloseDealDialogRef.close(this.data);

    }



  }

  DealClose(MyDealCloseForm: any)
  {
    const self = this;
    this.blockUI.start('Closing Deal ...'); // Start blocking 
    this.result = this.CRMService.CloseDeal(MyDealCloseForm).subscribe(
      (data: any) => {

        //debugger;

        if (data.Status == "SUCCESS") {
          //this.AccountId = data.Data;
          this.ReturnStr=data.Data;

          this.ContactId=parseInt(this.ReturnStr.split('-')[0]);
          //this.ContactName=this.ReturnStr.split('-')[1];

          setTimeout(() => {
            this.blockUI.stop(); // Stop blocking
          }, 300);

          self.snackBar.open("Deal Closed successfully", null, {
            duration: 5000, verticalPosition: 'top',
            horizontalPosition: 'right', panelClass: 'stellify-snackbar',
          });

          //Successfully Close Deal

          this.data.SaveClick="YES";
          this.CloseDealDialogRef.close(this.data);

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

          self.snackBar.open("Problem in Closing Deal please try again", null, {
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

  ContactYesClick(event, listData): void {
    const self = this;
    //debugger;
    this.data.SaveClick = "YES";

    this.data.ContactId=4;

    //Adding Contacts
    this.ContactsAccountDetailsDTOListItem = new ContactsAccountDetailsDTO();

    this.ContactsAccountDetailsDTOListItem.AccountId=8;
    this.ContactsAccountDetailsDTOListItem.AccountName="Account 2";
    this.ContactsAccountDetailsDTOListItem.ContactId=9990;
    this.ContactsAccountDetailsDTOListItem.ContactName="New Contact";

    this.ContactsAccountDetailsDTOList.push(this.ContactsAccountDetailsDTOListItem);

    this.data.ContactsAccountDomainItemList = this.ContactsAccountDetailsDTOList;
    
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

  OnDealReasonChange(e)
  {
    //debugger;
    console.log(e.currentTarget.value);
  }
  GetDealResonForLossDomainItems(AccountId?:number) {
    //this.blockUI.start('Loading...'); // Start blocking   
    
    let AccountsDomain = <Observable<any>>this.CRMService.GetDealResonForLossDomainItems();
    AccountsDomain.subscribe((DealResonForLossDomainItemsRes) => {
      //debugger;
      this.DealResonForLossDomainItemsList=null;
      if (DealResonForLossDomainItemsRes != null) {
        this.DealResonForLossDomainItemsList = DealResonForLossDomainItemsRes;
        // this.showLoadingIcon = false;
        // this.IsAccountsLoaded=true;
      }

    });
  }
}
//****************************************************************************************************************/
//Deal Close Dialog Ends here
//****************************************************************************************************************/
