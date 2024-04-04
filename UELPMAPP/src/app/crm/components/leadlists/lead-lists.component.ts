import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterOutlet } from '@angular/router';
import { CRMService } from '../../services/crm.service';
import { Observable, of } from 'rxjs';
import { Lead } from '../../models/Lead';
import { NodeService } from '../../services/node-service';
import { TreeTableModule, TreeTable } from "primeng/treetable";
import { SortEvent, TreeNode } from "primeng/api";
import { SelectionModel } from "@angular/cdk/collections";
import { Email } from '../../models/Emails';
import { PageTreeNode, RoleAccessLevel, RolePageModule } from '../../../administration/models/role';
import { RoleManagementApiService } from '../../../administration/services/role-management-api.service';
import { Table } from 'jspdf-autotable';
import { ModalDismissReasons, NgbActiveModal, NgbModal, NgbModalRef, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Currency, LeadsName, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { DateObj, LeadsFilterModel, MarketingList } from '../../models/crm.models';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SharedService } from '../../../shared/services/shared.service';
import { trigger, state, style, animate, transition, query, group } from '@angular/animations';
import { fadeAnimation } from '../../services/fadeAnimation';
import { Fade } from '../../animations/fade.animation';
import { SlideInOutAnimation, fader } from '../../animations/animations';
import { LeadsearchComponent } from '../../leadsearch/leadsearch.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { LeadsearchmodalComponent } from '../../leadsearchmodal/leadsearchmodal.component';
import { LeadfilterComponent } from '../leadfilter/leadfilter.component';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

import { ExportToCsv } from 'export-to-csv';
import { ExcelJson } from '../../../../app/po/components/interfaces/excel-json.interface';
import { ExportService } from '../../../../app/po/services/export.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ControlValidator } from './../../../shared/classes/control-validator';

// import { ExportService } from 'src/app/po/services/export.service';
// import { ExcelJson } from '../interfaces/excel-json.interface';
// interface People {
//     firstname?: string;
//     lastname?: string;
//     age?: string;
// }

interface People { 
    firstname?: string; 
    lastname?: string; 
    age?: string; 
  } 

@Component({
    selector: 'app-lead-lists',
    templateUrl: './lead-lists.component.html',
    styleUrls: ['./lead-lists.component.css'],
    animations: [
        trigger('fadeInOut', [
          transition('void => *', [
            style({opacity:0}), //style only for transition transition (after transiton it removes)
            animate(500, style({opacity:1})) // the new state of the transition(after transiton it removes)
          ]),
          transition('* => void', [
            animate(500, style({opacity:0})) // the new state of the transition(after transiton it removes)
          ])
        ]),
            trigger('flyInOut', [
              state('in', style({transform: 'translateX(0)'})),
              transition('void => *', [
                style({transform: 'translateX(-100%)'}),//
                animate(100)
              ]),
              transition('* => void', [
                animate(100, style({transform: 'translateX(100%)'}))
              ])
            ]),
            trigger('slideInOut', [
                state('in', style({
                    'max-height': '500px', 'opacity': '1', 'visibility': 'visible'
                })),
                state('out', style({
                    'max-height': '0px', 'opacity': '0', 'visibility': 'hidden'
                })),
                transition('in => out', [group([
                    
                    animate('700ms ease-in-out', style({
                        'visibility': 'hidden'
                    })),
                  
                    animate('300ms ease-in-out', style({
                        'max-height': '0px'
                    })),
                      animate('400ms ease-in-out', style({
                        'opacity': '0'
                    }))
                ]
                )]),
                transition('out => in', [group([
                    animate('1ms ease-in-out', style({
                        'visibility': 'visible'
                    })),
                    animate('600ms ease-in-out', style({
                        'max-height': '500px'
                    })),
                    animate('500ms ease-in-out', style({
                        'opacity': '1'
                    }))
                ]
                )])
            ]),    
      ],
})
export class LeadListsComponent implements OnInit,AfterViewInit  {

    tableData: People[] = []; 


    //Variable Starts
    // prepareRoute(outlet: RouterOutlet) {
    //     return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    //   }

    showLeftPanelLoadingIcon: boolean = false;
    ConnectionsPagerConfig: PagerConfig;
    ConnectionsListsCols: any[];
    ConnectionsLists: MarketingList[] = [];
    FilterConnectionsLists: MarketingList[] = [];


    ModuleId:number;
    FormId:number;
    ViewId:number;
    
    DefaultViewId:number=0;
    ShowListDialog: boolean = false;
    RemarksForm: FormGroup;

    AppViewsList = [];
    FileName:string="";
    FileNo:number=0;
    CurrentDate:string="";
    exportColumns;
    SelexportColumns;
    interval;
    IsFilterDataArrive: boolean = false;
    @BlockUI() blockUI: NgBlockUI;

    highlighted: any;
    private result;
    MyLead: Lead;
    MyLeadIds = [];
    userDetails: UserDetails = null;
    CompanyId: number;
    UserId:any;
    @ViewChild('PurchaseOrderListTable') dt: Table;
    i:number=0;
    LeadSourceListSettings = {};
    SelectedLeadSourceId:string="";
    SelectedLeadSourceName:string="";
    @ViewChild('LeadSearchDiv') ELeadSearchDiv: ElementRef;
    //@ViewChild('LeadSearchDiv') divHello: ElementRef;
    @ViewChild('hello') divHello: ElementRef;
    LeadSourceList = [];
    Skip:number=0;
    Take:number=0;
    SearchLeadName:string="";
    animationState = 'out';
    showFilterPopUp: boolean = true;
    closeResult: string;
    isOpen = true;
    isMenuOpen = false;
    show:boolean = false;
    clickedDivState = 'start';
    isSorted: boolean = null;
    state = "closed";
    items = [];
    ShowToolBar:boolean=false;
    showtest:boolean=false;
    //tableData: People[] = [];
    cols: any[] = [];
    currencyTypes: Currency[] = [];
    filterMessage: string = "";
    SelectedName: string;
    NameValidate: string = "";
    seletedValue: string = "";
    LeadsListsCols: any[];
    LeadId: any;
    TotalRecords: number = 0;
    LeadFilterInfoForm: FormGroup;
    LeadFilterInfoFormA: FormGroup;
    companyFilterInfoForm: FormGroup;
    // purchaseOrdersList: Array<PurchaseOrderList> = [];
    
    SelectedConnections: string = '';
    TotalSelectedConnections: number = 0;
    public SelectedListItems : any[];
    
    LeadsLists: any[] = [];
    LeadList:Lead;
    //initialValue: Product[];
    public selectedItems: any[];
    
    SelectedLeads: string = '';
    TotalSelectedLeads: number = 0;
    FilterLeadsLists: any[] = [];
    LeadsListsPagerConfig: PagerConfig;
    currentPage: number = 1;
    //*****************************************************************************************************************/
    //Dates Related Variables
    //*****************************************************************************************************************/
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

    jsonString: string = '[{"year":2023,"month":3,"day":1}]';
    jsonObj: Array<object>;
    jsonObj2: Array<object> = [{ title: 'test' }, { title: 'test2' }];

    DateToJsonString: string;
    DateFromJsonString: string;

    FromDateDayStr: string;
    ToDateDayStr: string;
    modalReference : NgbModalRef;
    //*****************************************************************************************************************/
    public leadSearch = {
        Topic:'Topic',
        FirstName:'First Name',
        LastName:'Last Name',
        Company:'Company',
        LeadSouce:'Lead Source',
      }
    constructor(
        private fb: FormBuilder,
        private exportService: ExportService,
        public snackBar: MatSnackBar,
        public dialog: MatDialog,
        private modalService: NgbModal,
        public activeModal: NgbActiveModal,
        private router: Router,
        private roleApiService: RoleManagementApiService,
        private CRMService: CRMService,
        private nodeService: NodeService,
        private route: ActivatedRoute,
        private formBuilderObj: FormBuilder,
        private datePipe: DatePipe,
        private sharedServiceObj: SharedService,
        private sessionService: SessionStorageService,
    ) { 
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.CompanyId = this.sessionService.getCompanyId();
    }
    ngAfterViewInit() {
        //this.divHello.nativeElement.innerHTML = "Hello Angular";
        this.showFilterPopUp=false;
      }
    changeState(): void {
        (this.state == "closed") ? this.state = "open" : this.state = "closed";
        console.log(this.state);
      }
    toggleList() {
        this.items = this.items.length ? [] : [0,1,2,3,4,5,6,7,8,9,10];
      }
      toggle(e)
      {
        this.show = !this.show;
      }
    ResetPagerConfig() {
        this.LeadsListsPagerConfig.RecordsToSkip = 0;
        this.LeadsListsPagerConfig.RecordsToFetch = 25;

        this.currentPage = 1;
    }
    private initForm(): void {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
    
        this.LeadFilterInfoFormA = this.formBuilderObj.group({
          Name: [''],
          FromDate: [oneMonthAgo.toISOString().substring(0, 10)],
          ToDate: [today.toISOString().substring(0, 10)]
        });
      }

    initializeFilterForm(): void {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        //FromDate: [oneMonthAgo.toISOString().substring(0, 10)],
        //ToDate: [today.toISOString().substring(0, 10)],

        this.LeadFilterInfoForm = this.formBuilderObj.group({
            Topic:[''],
            FirstName:[''],
            LastName:[''],
            Company:[''],
            Mobile:[''],
            Email:[''],
            Rating:[''],
            LeadSource:[''],
            RatindId:[''],
            LeadSourceId:[''],
            Industry:[''],
            Name: [''],
            FromDate: [''],
            ToDate: [''],
            WorkFlowStatusId: [0],
            ViewId:[1]
        });

        this.companyFilterInfoForm = this.formBuilderObj.group({
            CompanyName: [''],
            CompanyCode: [''],
            Country: [''],
            FromDate: [],
            ToDate: []
          });
    }
    changeDivState() {
        this.clickedDivState = 'end';
        setTimeout(() => {
          this.clickedDivState = 'start';
        }, 2000);
      }
    
      toggleMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;
        this.ShowToolBar= !this.ShowToolBar;
      }

    ngOnInit() {
        // this.route.paramMap.subscribe((param: ParamMap) => {
        //   this.LeadPipelineId = +param.get("PipelineId");
        //   //alert("Lead Pipeline :" + this.LeadPipelineId);
        // });
        //this.InitTempCols();
        this.LeadsListsPagerConfig = new PagerConfig();
        this.ResetPagerConfig();
        this.ConnectionsListsCols = [
            { field: 'ListName', header: 'List Name', width: '200px' },
            { field: 'ListDesc', header: 'List Desc', width: '200px' },
          ];

        this.RemarksForm = this.fb.group({
            Reasons: new FormControl('', [Validators.required, ControlValidator.Validator]),
            StatusId: [0]
          });

        this.ModuleId=1;
        this.FormId=26;
        this.ViewId=1;
        this.DefaultViewId=1;

        this.LeadSourceListSettings = {
            singleSelection: false,
            maxHeight: 100,
            idField: 'LeadSourceId',
            textField: 'SourceName',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 2,
            allowSearchFilter: false
          };
        this.initializeFilterForm();
        this.initForm();

        //TotalSelectedLeads
        this.TotalSelectedLeads=0;

        this.cols = [
            { field: "firstname", header: "First Name" },
            { field: "lastname", header: "Last Name" },
            { field: "age", header: "Age" },
        ];
       

        this.LeadsListsCols = [
            //{ field: '', header: '', width: '30px' },
            { field: 'Topic', header: 'Topic', width: '100px' },
            { field: 'FirstName', header: 'First Name', width: '100px' },
            { field: 'LastName', header: 'Last Name', width: '100px' },
            { field: 'CompName', header: 'Company', width: '100px' },
            { field: 'LeadStatName', header: 'Lead Status', width: '100px' },
            { field: 'ProbabilityName', header: 'Probability', width: '100px' },
            { field: 'SourceName', header: 'Source', width: '100px' },
            { field: 'CreatedDate', header: 'Created on', width: '100px' },
            { field: '', header: 'Action', width: '50px' },
        ];

        //Get Views
        this.SearchAppViews();
        
        this.SetIntialDates();

        this.GetLeadSource();

        //this.GetLeadsList();

        //this.GetLeadsByPagination();
        //this.FilterData();

    }
    customSortA(event: SortEvent) {
        debugger;
        console.log(event);
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
      

    static resetForm(formGroup: FormGroup) {
        let control: AbstractControl = null;
        formGroup.reset();
        formGroup.markAsUntouched();
        Object.keys(formGroup.controls).forEach((name) => {
          control = formGroup.controls[name];
          control.setErrors(null);
        });
      }
      
    resetFiltersMain(event) {
        this.FromDateStr = "";
        this.ToDateStr = "";
        this.SelectedName = "";
        this.filterMessage = "";
        this.ResetPagerConfig();
        // If this flag is set, the control will instead reset to the initial value.
        // const cat = new FormControl('tabby', {nonNullable: true});
        // cat.reset(); // cat.value is "tabby"

        //LeadListsComponent.resetForm(this.LeadFilterInfoForm);
        this.initializeFilterForm();

        this.SearchAppViews();

        //this.LeadFilterInfoForm.reset();
        setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
            this.SetIntialDates();
        }, 1000);

        
        //this.GetLeadsList();
        this.GetLeadsByPagination();
        //this.CloseLeadSearchForm(event);
    }
    resetFilters(event) {
        this.FromDateStr = "";
        this.ToDateStr = "";
        this.SelectedName = "";
        this.filterMessage = "";
        this.ResetPagerConfig();
        //this.LeadFilterInfoForm.reset();
        //LeadListsComponent.resetForm(this.LeadFilterInfoForm);
        this.initializeFilterForm();

        this.SetIntialDates();
        //this.GetLeadsList();
        
        //this.GetLeadsByPagination();
        this.SearchAppViews();

        this.CloseLeadSearchForm(event);
    }

    SetIntialDates() {
        //**********************************************************************************************************************
        //Set Dates
        //**********************************************************************************************************************

        this.firstDate = moment().startOf('month').format('YYYY-MM-DD');
        this.currentDate = moment().format('YYYY-MM-DD').toString();
        this.priorDate = new Date(new Date().setDate(this.todayDate.getDate() - 30));
        this.lastDate = moment().endOf('month').format("YYYY-MM-DD");

        const FDate = this.priorDate;
        const TDate = new Date(this.currentDate);

        const FirstDateYear = Number(this.datePipe.transform(FDate, 'yyyy'));
        const FirstDateMonth = Number(this.datePipe.transform(FDate, 'MM'));
        const FirstDateDay = Number(this.datePipe.transform(FDate, 'dd'));

        const CurrentDateYear = Number(this.datePipe.transform(TDate, 'yyyy'));
        const CurrentDateMonth = Number(this.datePipe.transform(TDate, 'MM'));
        const CurrentDateDay = Number(this.datePipe.transform(TDate, 'dd'));

        this.LeadFilterInfoForm.controls.FromDate.setValue({
            year: FirstDateYear,
            month: FirstDateMonth,
            day: FirstDateDay
        });

        this.LeadFilterInfoForm.controls.ToDate.setValue({
            year: CurrentDateYear,
            month: CurrentDateMonth,
            day: CurrentDateDay
        });
        //**********************************************************************************************************************

    }

    SearchAppViews() {
        
        //debugger;

        this.UserId=this.userDetails.UserID;
        let AppViewsInput = {
            Skip: this.LeadsListsPagerConfig.RecordsToSkip,
            Take: this.LeadsListsPagerConfig.RecordsToFetch,
            UserId:this.UserId,
            FormId:this.FormId

        };
        this.showLeftPanelLoadingIcon = true;
        this.CRMService.SearchAppViews(AppViewsInput)
            .subscribe((data: any) => {
                debugger;
                this.AppViewsList=data.AppViews;
                this.showLeftPanelLoadingIcon = false;
                this.TotalRecords = data.TotalRecords;
                this.IsFilterDataArrive=true;

                let DefaultViewId= this.AppViewsList.filter(x=>x.IsPinned==true)[0].ViewId;

                this.DefaultViewId=DefaultViewId;
                this.ViewId=this.DefaultViewId;

                //this.SearchLeadsViews();
                this.FilterData();
                
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }

    SearchLeadsViews(LeadFilterData?: LeadsFilterModel) {
        
        //debugger;
        if(LeadFilterData.FirstName!=null)
        {
            this.SearchLeadName=LeadFilterData.FirstName;
        }
        if(LeadFilterData.FirstName!=null)
        {
            this.SearchLeadName=LeadFilterData.LastName;
        }

        if (LeadFilterData.FirstName!=null && LeadFilterData.LastName !=null)
        {
            this.SearchLeadName=LeadFilterData.FirstName + " " + LeadFilterData.LastName;
        }

        this.UserId=this.userDetails.UserID;
        let LeadSearchInput = {
            Skip: this.LeadsListsPagerConfig.RecordsToSkip,
            Take: this.LeadsListsPagerConfig.RecordsToFetch,
            Topic: LeadFilterData.Topic,
            Name: this.SearchLeadName,
            FirstName:LeadFilterData.FirstName,
            LastName:LeadFilterData.LastName,
            EMail:LeadFilterData.Email,
            LeadSourceId:this.SelectedLeadSourceId,
            // FromDate: this.FromDateStr,
            // ToDate: this.ToDateStr,
            UserId:this.UserId

        };
        this.showLeftPanelLoadingIcon = true;
        this.CRMService.SearchLeadsByViews(this.ModuleId,this.FormId,this.ViewId, LeadSearchInput)
            .subscribe((data: any) => {
                this.showLeftPanelLoadingIcon = false;
                this.TotalRecords = data.TotalRecords;
                debugger;
                this.IsFilterDataArrive=true;
                if (data.TotalRecords > 0) {
                    //debugger;
                    this.TotalRecords = data.TotalRecords;
                    this.LeadsLists = data.Leads;
                    this.FilterLeadsLists = data.Leads;
                    this.LeadsListsPagerConfig.TotalRecords = data.TotalRecords;

                }
                else {
                    this.TotalRecords = data.TotalRecords;
                    this.LeadsLists = data.Leads;
                    this.FilterLeadsLists = data.Leads;
                    this.LeadsListsPagerConfig.TotalRecords = data.TotalRecords;
                    this.filterMessage = "No matching records are found";
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    SearchLeads(LeadFilterData?: LeadsFilterModel) {
        
        //debugger;

        
        if(LeadFilterData.FirstName!=null)
        {
            this.SearchLeadName=LeadFilterData.FirstName;
        }
        if(LeadFilterData.FirstName!=null)
        {
            this.SearchLeadName=LeadFilterData.LastName;
        }

        if (LeadFilterData.FirstName!=null && LeadFilterData.LastName !=null)
        {
            this.SearchLeadName=LeadFilterData.FirstName + " " + LeadFilterData.LastName;
        }

        this.UserId=this.userDetails.UserID;
        let LeadSearchInput = {
            Skip: this.LeadsListsPagerConfig.RecordsToSkip,
            Take: this.LeadsListsPagerConfig.RecordsToFetch,
            Topic: LeadFilterData.Topic,
            Name: this.SearchLeadName,
            FirstName:LeadFilterData.FirstName,
            LastName:LeadFilterData.LastName,
            EMail:LeadFilterData.Email,
            LeadSourceId:this.SelectedLeadSourceId,
            FromDate: this.FromDateStr,
            ToDate: this.ToDateStr,
            UserId:this.UserId

        };
        this.showLeftPanelLoadingIcon = true;
        this.CRMService.SearchLeads(LeadSearchInput)
            .subscribe((data: any) => {
                this.showLeftPanelLoadingIcon = false;
                this.TotalRecords = data.TotalRecords;
                debugger;
                this.IsFilterDataArrive=true;
                if (data.TotalRecords > 0) {
                    //debugger;
                    this.TotalRecords = data.TotalRecords;
                    this.LeadsLists = data.Leads;
                    this.FilterLeadsLists = data.Leads;
                    this.LeadsListsPagerConfig.TotalRecords = data.TotalRecords;

                }
                else {
                    this.TotalRecords = data.TotalRecords;
                    this.LeadsLists = data.Leads;
                    this.FilterLeadsLists = data.Leads;
                    this.LeadsListsPagerConfig.TotalRecords = data.TotalRecords;
                    this.filterMessage = "No matching records are found";
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }

    GetAllCurrencies() {
        this.CRMService.GetAllCurrencies().subscribe((data: Currency[]) => {
            this.currencyTypes = data;
            // if (this.CustomerIPSId == 0) {
            //   let selectedcc = this.currencyTypes.find(x => x.Id == this.company.Currency.Id);
            //   this.f.Currency.setValue(selectedcc);
            // }
        });
    }
    // this.sharedServiceObj.getCurrencies()
    // .subscribe((data: Currency[]) => {
    //     this.currencies = data;
    // });
    onItemSelect(item: any) {
        console.log(item);
        debugger;
        let SelLeadSource=this.LeadFilterInfoForm.get('LeadSource').value.map(x=>x.SourceName).toString();
        this.SelectedLeadSourceName=SelLeadSource;

        let SelLeadSourceIds=this.LeadFilterInfoForm.get('LeadSource').value.map(x=>x.LeadSourceId).toString();
        this.SelectedLeadSourceId=SelLeadSourceIds;
      }
      onItemDeSelect(item: any) {
        console.log(item);
        debugger;
        let SelLeadSource=this.LeadFilterInfoForm.get('LeadSource').value.map(x=>x.SourceName).toString();
        this.SelectedLeadSourceName=SelLeadSource;

        let SelLeadSourceIds=this.LeadFilterInfoForm.get('LeadSource').value.map(x=>x.LeadSourceId).toString();
        this.SelectedLeadSourceId=SelLeadSourceIds;

      }
      onSelectAll(items: any) {
        console.log(items);
        debugger;
        let SelLeadSource=items.map(x=>x.SourceName).toString();
        this.SelectedLeadSourceName=SelLeadSource;

        let SelLeadSourceIds=items.map(x=>x.LeadSourceId).toString();
        this.SelectedLeadSourceId=SelLeadSourceIds;

      }
      onDeSelectAll(items: any) {
        console.log(items);
        //debugger;
        this.SelectedLeadSourceName="";
        this.LeadFilterInfoForm.get('LeadSource').setValue("");

        this.SelectedLeadSourceId="";

      }


    GetLeadSource() {
        let lead = <Observable<any>>this.CRMService.GetLeadSource();
        lead.subscribe((LeadSourceInfoRes) => {
          //debugger;
          if (LeadSourceInfoRes != null) {
            this.LeadSourceList = LeadSourceInfoRes;
          }
    
            // setTimeout(() => {
            //     //this.blockUI.stop(); // Stop blocking
            // }, 500);
        });
      }
    OnViewChange(e)
    {
        debugger;
        this.ViewId=e.currentTarget.value;
        this.FilterData();
    }
    OnLeadSourceChange(e) {
        debugger;
        let SelectLeadSourceId=this.LeadFilterInfoForm.get("LeadSource").value;
        // let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "bankmaster")[0];
        let LeadSourceName=this.LeadSourceList.filter(x=>x.LeadSourceId==SelectLeadSourceId)[0].SourceName;
        
        if(this.SelectedLeadSourceName == "")
        {
            this.SelectedLeadSourceName = LeadSourceName;
        }
        else
        {
            this.SelectedLeadSourceName = this.SelectedLeadSourceName + "," + LeadSourceName;
        }
        //this.SelectedLeadSourceId = this.LeadFilterInfoForm.get("LeadSource").value;

        console.log("Selected Lead Source ID   : " + this.SelectedLeadSourceId);
        console.log("Selected Lead Source Name : " + this.SelectedLeadSourceName);
    }  
    GetLeadsList() {
        //this.blockUI.start("Loading..."); // Start blocking

        let lead = <Observable<any>>this.CRMService.GetLeadsList();
        lead.subscribe((LeadsListResult) => {
            //debugger;
            if (LeadsListResult != null) {
                this.LeadsLists = LeadsListResult;
                this.LeadsListsPagerConfig.TotalRecords = LeadsListResult.length;
                this.TotalRecords = LeadsListResult.length;

            }
            setTimeout(() => {
                //this.blockUI.stop(); // Stop blocking

            }, 300);
        });
    }
    pageChange(currentPageNumber: any) {
        debugger;
        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.LeadsListsPagerConfig.RecordsToSkip = this.LeadsListsPagerConfig.RecordsToFetch * (currentPageNumber - 1);
         
            this.FilterData();
        }
       
    }
    GetLeadsByPagination() {
        //this.blockUI.start("Loading..."); // Start blocking
        this.UserId=this.userDetails.UserID;
       this.Skip=this.LeadsListsPagerConfig.RecordsToSkip;
       this.Take= this.LeadsListsPagerConfig.RecordsToFetch;

        let lead = <Observable<any>>this.CRMService.GetLeadsByPagination(this.Skip,this.Take,this.UserId);
        lead.subscribe((LeadsListResult) => {
            debugger;
            if (LeadsListResult != null) {
                // this.LeadsLists = LeadsListResult;
                // this.LeadsListsPagerConfig.TotalRecords = LeadsListResult.length;
                // this.TotalRecords = LeadsListResult.length;

                this.TotalRecords = LeadsListResult.TotalRecords;
                this.LeadsLists = LeadsListResult.Leads;
                this.FilterLeadsLists = LeadsListResult.Leads;
                this.LeadsListsPagerConfig.TotalRecords = LeadsListResult.TotalRecords;

            }
            setTimeout(() => {
                //this.blockUI.stop(); // Stop blocking

            }, 300);
        });
    }

    RedirectLead(leadid) {
        const self = this;
        this.router.navigate([`/crm/leads/${'EDIT'}/${leadid}/2`]);
    }
    onRowUnselect(event) {
        let i = 0;
        this.SelectedLeads = "";
        //debugger;
        for (i = 0; i <= this.selectedItems.length - 1; i++) {
            if (this.SelectedLeads == "") {
                this.SelectedLeads = this.selectedItems[i].Id;
            }
            else {
                this.SelectedLeads = this.SelectedLeads + "," + this.selectedItems[i].Id;
            }
        }
        this.TotalSelectedLeads = this.selectedItems.length;
        if(this.TotalSelectedLeads==0)
        {
            this.SelectedLeads="";
        }
        //alert("Un Selected Leads : " + this.SelectedLeads + "\n Total Un Selected Leads : " + this.TotalSelectedLeads);
        this.ShowHideToolBar();
    }

    onRowSelect(event) {
        let i = 0;
        this.SelectedLeads = "";
        //debugger;
        for (i = 0; i <= this.selectedItems.length - 1; i++) {
            if (this.SelectedLeads == "") {
                this.SelectedLeads = this.selectedItems[i].Id;
            }
            else {
                this.SelectedLeads = this.SelectedLeads + "," + this.selectedItems[i].Id;
            }
        }
        this.TotalSelectedLeads = this.selectedItems.length;
        //alert("Selected Leads : " + this.SelectedLeads + "\n Total Selected Leads : " + this.TotalSelectedLeads);
        this.ShowHideToolBar();
    }
    ShowHideToolBar()
    {
        
        //this.changeDivState();
         
        this.clickedDivState = 'end';
        setTimeout(() => {
          this.clickedDivState = 'start';
            if (this.TotalSelectedLeads > 0) {
                this.ShowToolBar = true;
            }
            else {
                this.ShowToolBar = false;
            }
        }, 100);

    }
    ClickSelected(event) {
        debugger;
        let i = 0;

        this.SelectedLeads = "";
        if(this.selectedItems !=null)
        {
            for (i = 0; i <= this.selectedItems.length - 1; i++) {
                if (this.SelectedLeads == "") {
                    this.SelectedLeads = this.selectedItems[i].Id;
                }
                else {
                    this.SelectedLeads = this.SelectedLeads + "," + this.selectedItems[i].Id;
                }
            }
            this.TotalSelectedLeads = this.selectedItems.length;

            //alert("Selected Leads : " + this.SelectedLeads + "\n Total Selected Leads : " + this.TotalSelectedLeads);
            this.ShowHideToolBar();
        }
    }
    ClickShow(event)
    {
        this.showtest=!this.showtest;
    }
    ClickNewLead(event) {
        this.router.navigate([`/crm/leads/${'NEW'}/${0}/2`]);
    }
    
    ClickViewPin(e)
    {
        alert("Current View : " + this.ViewId);
    }

    ClickAddToList(e)
    {
        this.ShowListDialog =!this.ShowListDialog;
        this.GetMarketingList();
        //alert("Add to List : " + e);
    }
// editDocumentRow = function (documentId, modal) {
//   this.http
//     .get(ConstantComponent.url + "/documentmanagerapi/Get/" + documentId)
//     .map((res: Response) => res.json())
//     .subscribe((data) => {
//       this.documentsRowDetails = data;
//       this.modalService.open(modal);
//       this.modalReference = this.modalService.open(modal);
//       this.modalReference.result.then(
//         (result) => {
//           this.closeResult = `Closed with: ${result}`;
//         },
//         (reason) => {
//           this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
//         }
//       );
//     });
// };

    CloseLeadSearch(event,message:any)
    {
        alert("Close Lead Search : " + message);
        //this.activeModal.close();
        //debugger;
        let poFilterData: LeadsFilterModel = this.LeadFilterInfoForm.value;
        if (this.LeadFilterInfoForm.get('Name').value != null) {
            poFilterData.Name = this.LeadFilterInfoForm.get('Name').value;;
        }
        console.log(poFilterData);
        this.modalReference.close();
        
    }
    SearchApply(event)
    {
        //this.CloseLeadSearchForm(event);
        this.toggleShowDiv('divA');
        this.FilterData();
    }
    CloseLeadSearchForm(event)
    {
        //debugger;
        // if(this.ELeadSearchDiv.nativeElement.style.visibility=="visible")
        // {
        //     this.ELeadSearchDiv.nativeElement.style.visibility="hidden";
        // }
        this.toggleShowDiv('divA');
        //this.ELeadSearchDiv.nativeElement.style.visibility="visible";
    }
    toggleShowDiv(divName: string) {
        if (divName === 'divA') {
          console.log(this.animationState);
          this.animationState = this.animationState === 'out' ? 'in' : 'out';
          console.log(this.animationState);
        }
      }
    OpenLeadFilter(event) {
        //debugger;
        //var a=this.ELeadSearchDiv;
        //debugger;
        //this.changeDivState();
        this.showFilterPopUp = !this.showFilterPopUp;
        // setTimeout(() => {
        //     this.FilterData();

        // }, 300);
        if(this.ELeadSearchDiv.nativeElement.style.visibility=="" || this.ELeadSearchDiv.nativeElement.style.visibility=="hidden")
        {
            this.ELeadSearchDiv.nativeElement.style.visibility="visible";
            this.ELeadSearchDiv.nativeElement.style.top=(event.clientY+15)+'px';
        }
        else if (this.ELeadSearchDiv.nativeElement.style.visibility=="visible")
        {
            this.ELeadSearchDiv.nativeElement.style.visibility="hidden";
            //this.ELeadSearchDiv.nativeElement.style.top=(event.clientY+15)+'px'; 
        }
      }
    openDialog() {
        const dialogRef = this.dialog.open(LeadsearchmodalComponent, {
            width: "650px",
            height: "380px"
          });
      }
      openDialogfilter() {
        const dialogRef = this.dialog.open(LeadfilterComponent, {
            width: "650px",
            height: "380px"
          });
      }
    OpenModal(content) {
        debugger;
        this.modalReference=this.modalService.open(content);
		//this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
        this.modalReference.result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
	}

    ClickSearchAdvance(event)
    {
        //You have to catch it to prevent the error
        //modal.promise.then(hideFn, hideFn).catch((res) => {});

        // makePizza(['cheese', 'pineapple'])
        //     .then(pizza => {
        //         console.log(pizza);
        //     })
        //     .catch(err => {
        //         console.log('Oh noooo!!');
        //         console.log(err);
        //     })


        // modal.open(MyModal)
        //     .then(dialog => { })
        //     .catch(() => { }); // this is the workaround

        const modalRef = this.modalService.open(LeadsearchComponent);
        modalRef.componentInstance.LeadSearch = this.leadSearch;
        // modalRef.result.then((result) => {
        //     if (result) {
        //         console.log("Results In leadlists");
        //         console.log(result);
        //     }
        // });
        modalRef.result.then((result) => {
            if (result) {
                debugger;
                console.log("Results In leadlists");
                console.log(result);
            }
        }).catch(err => {
                debugger;
                alert(err);
        });

        // modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
        //   console.log(receivedEntry);
        // })

    }

    FilterData() {
       //debugger;

        this.filterMessage = "";
        //let poFilterData:PurchaseOrderFilterModel = this.LeadFilterInfoForm.value;
        let poFilterData: LeadsFilterModel = this.LeadFilterInfoForm.value;
        if (this.LeadFilterInfoForm.get('Name').value != "") {
            poFilterData.Name = this.LeadFilterInfoForm.get('Name').value;;
        }
        if (this.LeadFilterInfoForm.get('FromDate').value != null) {

            poFilterData.FromDate = this.LeadFilterInfoForm.get('FromDate').value;
        }

        if (this.LeadFilterInfoForm.get('ToDate').value != null) {
            poFilterData.ToDate = this.LeadFilterInfoForm.get('ToDate').value;
        }
        if (this.LeadFilterInfoForm.get('FirstName').value != null) {
            poFilterData.FirstName = this.LeadFilterInfoForm.get('FirstName').value;
        }
        if (this.LeadFilterInfoForm.get('LastName').value != null) {
            poFilterData.LastName = this.LeadFilterInfoForm.get('LastName').value;
        }


        poFilterData.Moduleid=this.ModuleId;
        poFilterData.FormId=this.FormId;
        poFilterData.ViewId=this.ViewId;
        
        //Get Leadsource Id
        //debugger;
        if(this.LeadFilterInfoForm.get("LeadSource").value!=null)
        {
            if(this.LeadFilterInfoForm.get("LeadSource").value!="")
            {
                let SelLeadSource=this.LeadFilterInfoForm.get('LeadSource').value.map(x=>x.LeadSourceId).toString();
                this.SelectedLeadSourceId=SelLeadSource;
                console.log(this.SelectedLeadSourceId);

                this.LeadFilterInfoForm.controls.LeadSourceId.setValue(this.SelectedLeadSourceId);

                //this.LeadFilterInfoForm.get('LeadSource').setValue(this.SelectedLeadSourceId);

            }
        }
        
        //*************************************************************************************************************/
        //From Date Str
        //*************************************************************************************************************/
        //debugger;
        this.DateFromJsonString = JSON.stringify(poFilterData.FromDate);

        let jsonFromObj = JSON.parse(this.DateFromJsonString); // string to "any" object first
        let FromDateObj = jsonFromObj as DateObj;


        if (FromDateObj != null) {
            if (FromDateObj.month.toString().length > 0) {
                //Day
                let FromDateDay = Number(FromDateObj.day);
                if (FromDateDay <= 9) {
                    this.FromDateDayStr = "0" + FromDateDay;
                }
                else {
                    this.FromDateDayStr = FromDateDay.toString();
                }
                //Month
                let FromDateMonth = Number(FromDateObj.month);
                if (FromDateMonth <= 9) {
                    this.FromDateStr = FromDateObj.year + "-0" + FromDateObj.month + "-" + this.FromDateDayStr;
                }
                else {
                    this.FromDateStr = FromDateObj.year + "-" + FromDateObj.month + "-" + this.FromDateDayStr;
                }
            }
        }
        console.log(this.FromDateStr);
        //*************************************************************************************************************/
        //*************************************************************************************************************/
        //To Date Str
        //*************************************************************************************************************/
        this.DateToJsonString = JSON.stringify(poFilterData.ToDate);

        let jsonToObj = JSON.parse(this.DateToJsonString); // string to "any" object first
        let ToDateObj = jsonToObj as DateObj;


        if (ToDateObj != null) {
            if (ToDateObj.month.toString().length > 0) {
                let ToDateDay = Number(ToDateObj.day);
                if (ToDateDay <= 9) {
                    this.ToDateDayStr = "0" + ToDateDay;
                }
                else {
                    this.ToDateDayStr = ToDateDay.toString();
                }

                let ToDateMonth = Number(ToDateObj.month);
                if (ToDateMonth <= 9) {
                    this.ToDateStr = ToDateObj.year + "-0" + ToDateObj.month + "-" + this.ToDateDayStr;
                }
                else {
                    this.ToDateStr = ToDateObj.year + "-" + ToDateObj.month + "-" + this.ToDateDayStr;
                }
            }
        }
        console.log(this.ToDateStr);
        //*************************************************************************************************************/


        if ((poFilterData.Name === '' || poFilterData.Name == null)
            && (poFilterData.FromDate == null && poFilterData.ToDate == null)) {
            if (open) {
                if ((this.LeadFilterInfoForm.get('Name').value == null || this.LeadFilterInfoForm.get('Name').value == "")) {
                    this.filterMessage = "No matching records are found";
                }
                else {
                    this.filterMessage = "Please select any filter criteria";
                }
                this.ResetPagerConfig();
            }
            return;
        }
        else if (poFilterData.FromDate != null && poFilterData.ToDate == null) {
            if (open) {
                this.filterMessage = "Please select To Date";
            }
            return;
        }
        else if (poFilterData.FromDate == null && poFilterData.ToDate != null) {
            if (open) {
                this.filterMessage = "Please select From Date";
            }
            return;
        }

        else if ((poFilterData.FromDate != null && poFilterData.ToDate != null && poFilterData.FromDate > poFilterData.ToDate)) {
            if (open) {
                this.filterMessage = "From Date Should be less than To Date";
            }
            return;
        }

        //Call API 
        //this.SearchLeads(poFilterData);
        this.SearchLeadsViews(poFilterData);

    }

    stopTime() {
        clearInterval(this.interval);
        this.showLeftPanelLoadingIcon = false;
        this.blockUI.start("Done Data...!!!"); // Start blocking
        this.blockUI.stop();
    }
    //*********************************************************************************************************************/
    //Export Code Starts Here
    //*********************************************************************************************************************/
    ExportToCSV() {
        //TODO
        // if (this.TotalSelectedLeads == 0) {
        //     alert("Please Select atleast 1 lead ");
        // }
        // else
        // {
        //     alert("Exporting to CSV ");
        // }

        debugger;
        //Set Records To Fetch
        this.LeadsListsPagerConfig.RecordsToSkip = 0;
        this.LeadsListsPagerConfig.RecordsToFetch = 0;

        this.FilterData();
        this.interval = setTimeout(() => {
            //alert("Alert activated")
            debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                this.ResetPagerConfig();
                if (this.FilterLeadsLists.length > 0) {
                    //alert("Total Records CSV : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                    const options = {
                        fieldSeparator: ',',
                        quoteStrings: '"',
                        decimalSeparator: '.',
                        showLabels: true,
                        showTitle: true,
                        title: 'Leads List',
                        useTextFile: false,
                        useBom: true,
                        filename:'LeadsLists',
                        headers: ['Topic', 'First Name', 'Last Name', 'Company','Lead Status','Probability','Lead Source','CreatedOn']
                    };
                    const csvExporter = new ExportToCsv(options);
                    csvExporter.generateCsv(this.FilterLeadsLists);
                    this.stopTime();
                }
            }
        }, 1000);

    }
    exportToExcel(): void {

        const edata: Array<ExcelJson> = [];
        const udt: ExcelJson = {
            data: [
                { A: 'User Data' }, // title
                { A: 'Draft Code', B: 'Supplier', C: 'PO Status' }, // table header
            ],
            skipHeader: true
        };
        this.FilterLeadsLists.forEach(user => {
            udt.data.push({
                A: user.DraftCode,
                B: user.SupplierName,
                C: user.WorkFlowStatusText
            });
        });
        edata.push(udt);

        this.exportService.exportJsonToExcel(edata, 'PurchaseOrderLists');
    }
    ExportToExcel() {
        const self=this;
        // if (this.TotalSelectedLeads == 0) {
        //     alert("Please Select atleast 1 lead ");
        // }
        // else
        // {
        //     alert("Exporting to Excel ");
        // }
       //alert("Export To CSV");
       debugger;

       this.blockUI.start("Preparing Data...!!!"); // Start blocking
       this.FilterData();
       this.interval = setTimeout(() => {
           //alert("Alert activated")
           debugger;
           if (this.IsFilterDataArrive) {
               debugger;
               this.blockUI.start("Exporting Data...!!!"); // Start blocking
               if (this.FilterLeadsLists.length > 0) {
                   //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                   //this.exportToExcel();
                   const edata: Array<ExcelJson> = [];
                   const udt: ExcelJson = {
                       data: [
                           { A: 'Leads Lists' }, // title
                           { 
                            A: 'Topic', B: 'First Name', C: 'Last Name', D: 'Compant' ,
                            E: 'Lead Status',
                            F: 'Probabbility',
                            G: 'Lead Source',
                            H: 'Created On'
                        }, // table header
                       ],
                       skipHeader: true
                   };
                   this.FilterLeadsLists.forEach(polist => {
                       udt.data.push({
                           A: polist.Topic,
                           B: polist.FirstName,
                           C: polist.LastName,
                           D: polist.CompName,
                           E: polist.LeadStatName,
                           F: polist.ProbabilityName,
                           G: polist.SourceName,
                           H: polist.CreatedDate
                       });
                   });
                   edata.push(udt);

                   this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                   this.FileNo=Math.ceil(Math.random() * 10);
                   this.FileName="LeadsLists_" + this.CurrentDate+"_"+this.FileNo.toString();

                   this.exportService.exportJsonToExcel(edata, this.FileName);
                   this.stopTime();
               }
           }
       }, 1000);
    }

    ExportToPDF() {
        // if (this.TotalSelectedLeads == 0) {
        //     alert("Please Select atleast 1 lead ");
        // }
        // else
        // {
        //     alert("Exporting to Pdf ");
        // }
        debugger;

        //Get Filter Data
        this.blockUI.start("Preparing Data...!!!"); // Start blocking
        this.FilterData();

        this.interval = setTimeout(() => {
            //alert("Alert activated")
            debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                if (this.FilterLeadsLists.length > 0) {
                    //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

                    this.exportColumns = this.LeadsListsCols.map((col) => ({
                        title: col.header,
                        dataKey: col.field,
                    }));

                    //Remove Action Column
                    this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                    const doc = new jsPDF('p', 'pt');
                    doc['autoTable'](this.SelexportColumns, this.FilterLeadsLists);
                    // doc.autoTable(this.exportColumns, this.products);

                    this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                    this.FileNo=Math.ceil(Math.random() * 10);
                    this.FileName="LeadsList_" + this.CurrentDate+"_"+this.FileNo.toString();

                    doc.save(this.FileName+ '.pdf');

                    //doc.save('PurchaseOrdersList.pdf');
                    this.IsFilterDataArrive = false;
                    this.stopTime();
                }
            }
        }, 1000);
    }
    //*********************************************************************************************************************/
    //Export Code Ends Here
    //*********************************************************************************************************************/
    OnNameFilterChange(event: any) {
        debugger;
        console.log(event);
        // this.SelectedName = event.item.firstName +' '+  event.item.lastName;
        this.SelectedName = event.item.Name.value;
        //this.LeadFilterInfoForm.get('Name').setValue(this.SelectedName);
        alert("Selected Name : " + this.SelectedName);
        setTimeout(() => {
            this.FilterData();

        }, 300);

        // if (event.item != null && event.item != undefined) {
        //     if (event.item.WorkFlowStatus != "Approved") {
        //         this.LeadFilterInfoForm.get('Name').setValue(null);
        //         event.preventDefault();
        //     }
        //     else if (event.item.IsFreezed) {
        //         this.LeadFilterInfoForm.get('Name').setValue(null);
        //         event.preventDefault();
        //     }
        // }
    }

    Namechange(event) {
        //debugger;
        this.NameValidate = event.target.value;
    }
    // NameInputFormater = (x: LeadsName) => x.FirstName +' ' + x.Lastname;
    NameInputFormater = (x: LeadsName) => x.Name;
    NameSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {

                // if (term == "") {

                // }
                if (term.length > 3) {
                    //debugger;
                    // return this.sharedServiceObj.getSuppliers({
                    //     searchKey: term,
                    //     supplierTypeId: 0,
                    //     companyId: 2
                    // }).pipe(
                    //     catchError(() => {
                    //         return of([]);
                    //     }))
                    let LeadSearchInput = {
                        Skip: 0,
                        Take: 1000,
                        Name: term

                    };
                    return this.CRMService.SearchLeadNames(LeadSearchInput).pipe(
                        catchError(() => {
                            return of([]);
                        }))
                }
            })
        );
//***********************************************************************************************************************/        
// Toolbar Code Starts Here
//***********************************************************************************************************************/        
ClickPrint(event)
{
    if (this.TotalSelectedLeads == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Printing Selected Leads ");
    }
}
ClickExport(event)
{
    alert("Click Export" );
}
ClickAssignTo(event)
{
    if (this.TotalSelectedLeads == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Assiging Selected Leads ");
    }
}
ClickDelete(event)
{
    if (this.TotalSelectedLeads == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Deleting Selected Leads ");
    }
}
getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
ClickQualify(event) {
    const self = this;
    debugger;
    if (this.TotalSelectedLeads == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else {
        //alert("Converting Qualify Selected Leads ");

        debugger;
        let SelectedLeads = this.selectedItems;
        for (var i = 0; i < this.selectedItems.length; i++) {
            this.MyLead = new Lead();

            this.MyLead.Id = this.selectedItems[i].Id;
            this.MyLead.OppId = this.selectedItems[i].OppId;

            this.MyLead.PreviousProbabilityId = this.selectedItems[i].ProbabilityId;
            // this.MyLead.ProbabilityId = this.selectedItems[i].ProbabilityId;
            this.MyLead.ProbabilityId = 3;

            this.MyLead.CreatedDate = this.selectedItems[i].CreatedDate;
            this.MyLead.UpdatedDate = this.selectedItems[i].UpdatedDate;
            this.MyLead.EstBudget = this.selectedItems[i].EstBudget;

            this.MyLead.UserId = this.UserId;

            if (this.MyLead.Id != undefined) {
                this.MyLeadIds.push(this.MyLead);
            }
        }
        this.blockUI.start("Updating Status...!!!"); // Start blocking

        this.result = this.CRMService.ChangeLeadStatus(this.MyLeadIds)
            .subscribe(
                (data: any) => {
                    debugger;
                    if (data.Status == "SUCCESS") {
                        //alert("Leads Converted Successfully ...");
                        //this.resetFilters(event);
                        this.TotalSelectedLeads = 0;
                        this.GetLeadsByPagination();

                        this.ShowHideToolBar();
                        //   setTimeout(() => {
                        //     this.CloseLeadSearchForm(event);
                        //   }, 200);

                        setTimeout(() => {
                            this.blockUI.stop(); // Stop blocking
                        }, 300);

                        self.snackBar.open("Lead Updated Successfully", null, {
                            duration: 5000,
                            verticalPosition: "top",
                            horizontalPosition: "right",
                            panelClass: "stellify-snackbar",
                        });

                        this.FilterData();

                    } else if (data.Status == "ERROR") {
                        setTimeout(() => {
                            //this.blockUI.stop(); // Stop blocking
                        }, 500);

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
}
ClickDisQualify(event)
{
    if (this.TotalSelectedLeads == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Dis Qualifying Selected Leads ");
    }
}
ClickQuickCampaign(event)
{
    if (this.TotalSelectedLeads == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Creating Quick Campaign Selected Leads ");
    }
}
//***********************************************************************************************************************/        

//***********************************************************************************************************************/        
// Modal Code Starts Here
//***********************************************************************************************************************/        
passBack() {
    //this.activeModal.close();
}
open(content) {

    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {

      this.closeResult = `Closed with: ${result}`;

    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;

    });

  }
  private getDismissReason(reason: any): string {

    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
//***********************************************************************************************************************/        
// Modal Code Starts Here
//***********************************************************************************************************************/        

//Connections Lists Marketing Lists
GetMarketingList()
  {
    const self = this;
    this.CRMService.GetList()
    .subscribe((data:any) => {
        ////debugger;
        this.IsFilterDataArrive=true;
        this.ConnectionsLists=data;
        this.FilterConnectionsLists=data;
        this.TotalRecords=this.ConnectionsLists.length;
        

    }, (error) => {
        this.showLeftPanelLoadingIcon = false;
        //debugger;
    });
  }

  //**************************************************************************************************************/
  //Marketing List Code
  //**************************************************************************************************************/
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
    alert(" Total Leads Selected : " + this.SelectedLeads + "\n Total Marketing Lists Selected : " + this.SelectedConnections);

}
//**************************************************************************************************************/

    InitTempCols() {
        this.cols = [
            { field: "firstname", header: "First Name" },
            { field: "lastname", header: "Last Name" },
            { field: "age", header: "Age" },
        ];
        this.tableData = [
            {
                firstname: "David",
                lastname: "ace",
                age: "40",
            },
            {
                firstname: "AJne",
                lastname: "west",
                age: "40",
            },
            {
                firstname: "Mak",
                lastname: "Lame",
                age: "40",
            },
            {
                firstname: "Peter",
                lastname: "raw",
                age: "40",
            },
            {
                firstname: "Kane",
                lastname: "James",
                age: "40",
            },
            {
                firstname: "Peter",
                lastname: "raw",
                age: "40",
            },
            {
                firstname: "Kane",
                lastname: "James",
                age: "40",
            },
            {
                firstname: "Peter",
                lastname: "raw",
                age: "40",
            },
            {
                firstname: "Kane",
                lastname: "James",
                age: "40",
            },
            {
                firstname: "Peter",
                lastname: "raw",
                age: "40",
            },
            {
                firstname: "Kane",
                lastname: "James",
                age: "40",
            },
            {
                firstname: "Peter",
                lastname: "raw",
                age: "40",
            },
            {
                firstname: "Kane",
                lastname: "James",
                age: "40",
            },
        ];
    } 


}


