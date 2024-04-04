import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterOutlet } from '@angular/router';
import { CRMService } from '../../services/crm.service';
import { Observable, forkJoin, of } from 'rxjs';
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
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { ActivityFilterModel,  DateObj, LeadsFilterModel } from '../../models/crm.models';
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
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ValidateFileType, FullScreen, restrictMinus, HideFullScreen } from "../../../shared/shared";
import { ExportToCsv } from 'export-to-csv';
import { ExcelJson } from '../../../po/components/interfaces/excel-json.interface';
import { ExportService } from '../../../po/services/export.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';  

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { HttpClient } from '@angular/common/http';
import { ActivityDTO } from '../../models/ActivityDTO';
import { ContactDTO } from '../../models/ContactDTO';
import { CrmactivityLogACallComponent } from '../crmactivitylogacall/crmactivity-logacall.component';

interface People {
    firstname?: string;
    lastname?: string;
    age?: string;
}

@Component({
    selector: 'app-crmactivitieslist',
    templateUrl: './crmactivitieslist.component.html',
    styleUrls: ['./crmactivitieslist.component.css'],
 })
export class CRMActivitiesListComponent implements OnInit,AfterViewInit  {

    RegardingId:number;
    RegarId:number;
    ContactId: number;
    FormMode: string;
    ActivityFormMode:string;
    ShowToolBar:boolean=false;
    ContactInfo : ContactDTO;
    HeaderTitle: string;
    
    _baseUrl = 'https://jsonplaceholder.typicode.com';
    post : Post;
    comment: Comment;
    user: User;

    //Variable Starts
    // prepareRoute(outlet: RouterOutlet) {
    //     return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    //   }
    FileName:string="";
    FileNo:number=0;
    CurrentDate:string="";
    exportColumns;
    SelexportColumns;
    interval;
    IsFilterDataArrive: boolean = false;
    @BlockUI() blockUI: NgBlockUI;
    private result;
    
    showLoadingIcon: boolean = false;
    MyLead: Lead;
    MyLeadIds = [];
    userDetails: UserDetails = null;
    CompanyId: number;
    FileType: any;
    file: any;
    uploadedFiles: Array<File> = [];
    UserId:any;
    @ViewChild('ActivityListTable') dt: Table;
    i:number=0;
    LeadSourceListSettings = {};
    SelectedActivitiessourceId:string="";
    SelectedActivitiessourceName:string="";
    @ViewChild('LeadSearchDiv') ELeadSearchDiv: ElementRef;
    //@ViewChild('LeadSearchDiv') divHello: ElementRef;
    @ViewChild('hello') divHello: ElementRef;
    LeadSourceList = [];
    Skip:number=0;
    Take:number=0;
    SearchActivitySubjectOrDesc:string="";
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
    showtest:boolean=false;
    tableData: People[] = [];
    cols: any[] = [];
    currencyTypes: Currency[] = [];
    filterMessage: string = "";
    SelectedName: string;
    NameValidate: string = "";
    seletedValue: string = "";
    showLeftPanelLoadingIcon: boolean = false;
    ActivityListsCols: any[];
    ActivityLists: any[] = [];
    ModuleId:number;
    FormId:number;
    ViewId:number;

    FilterActivityLists: ActivityDTO[] = [];
    ExportActivityLists:ActivityDTO[]=[];

    //ActivityInfo:Contacts;
    ActivityInfo:ActivityDTO;

    LeadId: any;
    TotalRecords: number = 0;
    ActivityFilterInfoForm: FormGroup;
    // purchaseOrdersList: Array<PurchaseOrderList> = [];
   
    //initialValue: Product[];
    public selectedItems: any[];
    SelectedActivities: string = '';
    TotalSelectedActivities: number = 0;
    ExportTotalActivities:boolean=false;
    AppViewsList = [];
    DefaultViewId:number=0;
    SearchAppViewsListsPagerConfig: PagerConfig;

    ActivityListsPagerConfig: PagerConfig;
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
        public snackBar: MatSnackBar,
        private _http: HttpClient,
        private exportService: ExportService,
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
        this.ActivityListsPagerConfig.RecordsToSkip = 0;
        this.ActivityListsPagerConfig.RecordsToFetch = 25;

        this.currentPage = 1;
    }
    // private initForm(): void {
    //     const today = new Date();
    //     const oneMonthAgo = new Date();
    //     oneMonthAgo.setMonth(today.getMonth() - 1);
    
    //     this.ActivityFilterInfoFormA = this.formBuilderObj.group({
    //       ActivitySubject: [''],
    //       ActivityDesc: [''],
    //       FromDate: [oneMonthAgo.toISOString().substring(0, 10)],
    //       ToDate: [today.toISOString().substring(0, 10)],
    //       ViewId:[0]
    //     });
    //   }

    initializeFilterForm(): void {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        //FromDate: [oneMonthAgo.toISOString().substring(0, 10)],
        //ToDate: [today.toISOString().substring(0, 10)],

        this.ActivityFilterInfoForm = this.formBuilderObj.group({
            ActivitySubject:[''],
            ActivityDesc:[''],
            Mobile:[''],
            Email:[''],
            ModuleId:[0],
            FormId:[0],
            ViewId:[0]
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
      }



    ngOnInit() {
        this.FileType = "CSV";
        this.ModuleId=1;
        this.FormId=2;
        this.ViewId=5;

       
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

        this.initializeFilterForm();
        //this.initForm();

        //TotalSelectedActivities
        this.TotalSelectedActivities=0;
      
        this.ActivityListsPagerConfig = new PagerConfig();
        this.SearchAppViewsListsPagerConfig= new PagerConfig();

        this.SearchAppViewsListsPagerConfig.RecordsToSkip = 0;
        this.SearchAppViewsListsPagerConfig.RecordsToFetch = 999;


        this.ResetPagerConfig();

        //this.SetIntialDates();
        this.SearchAppViews();

        //this.FilterData();

        //this.callMultiple();

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

        //LeadListsComponent.resetForm(this.ActivityFilterInfoForm);
        this.initializeFilterForm();

        //this.ActivityFilterInfoForm.reset();
        setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
            this.SetIntialDates();
        }, 1000);

        this.FilterData();

    }
    resetFilters(event) {
        this.FromDateStr = "";
        this.ToDateStr = "";
        this.SelectedName = "";
        this.filterMessage = "";
        this.ResetPagerConfig();
        //this.ActivityFilterInfoForm.reset();
        //LeadListsComponent.resetForm(this.ActivityFilterInfoForm);
        this.initializeFilterForm();
        this.SetIntialDates();
        //this.GetLeadsList();
        this.SearchActivities();
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

        this.ActivityFilterInfoForm.controls.FromDate.setValue({
            year: FirstDateYear,
            month: FirstDateMonth,
            day: FirstDateDay
        });

        this.ActivityFilterInfoForm.controls.ToDate.setValue({
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
            Skip: this.SearchAppViewsListsPagerConfig.RecordsToSkip,
            Take: this.SearchAppViewsListsPagerConfig.RecordsToFetch,
            UserId:this.UserId,
            FormId:this.FormId
    
        };
        this.showLeftPanelLoadingIcon = true;
        this.CRMService.SearchAppViews(AppViewsInput)
            .subscribe((data: any) => {
                //debugger;
                this.AppViewsList=data.AppViews;
                this.showLeftPanelLoadingIcon = false;
                this.TotalRecords = data.TotalRecords;
                this.IsFilterDataArrive=true;
    
                let DefaultViewId= this.AppViewsList.filter(x=>x.IsPinned==true)[0].ViewId;
    
                this.DefaultViewId=DefaultViewId;
                this.ViewId=this.DefaultViewId;

                this.ActivityFilterInfoForm.controls["ViewId"].setValue(this.ViewId);
    
                //this.SearchLeadsViews();
                this.FilterData();
                
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    SearchActivities(ActivityFilterData?: ActivityFilterModel) {
        debugger;
        if(ActivityFilterData.ActivitySubject!=null)
        {
            this.SearchActivitySubjectOrDesc=ActivityFilterData.ActivitySubject;
        }
        if(ActivityFilterData.ActivityDesc!=null)
        {
            this.SearchActivitySubjectOrDesc=ActivityFilterData.ActivityDesc;
        }

        if (ActivityFilterData.ActivitySubject!=null && ActivityFilterData.ActivityDesc !=null)
        {
            this.SearchActivitySubjectOrDesc=ActivityFilterData.ActivitySubject + " " + ActivityFilterData.ActivityDesc;
        }

        this.UserId=this.userDetails.UserID;
        let LeadSearchInput = {
            Skip: this.ActivityListsPagerConfig.RecordsToSkip,
            Take: this.ActivityListsPagerConfig.RecordsToFetch,
            ActivitySubject:this.SearchActivitySubjectOrDesc,
            ActivityDesc:"",
            StartDate:ActivityFilterData.StartDate,
            EndDate:ActivityFilterData.EndDate,
            DueDate:ActivityFilterData.DueDate,
            UserId:this.UserId,
            ModuleId:this.ModuleId,
            FormId:this.FormId,
            ViewId:this.ViewId

        };
        this.showLeftPanelLoadingIcon = true;
        //SearchActivitiesByViews
        //this.CRMService.SearchActivities(LeadSearchInput)
        this.CRMService.SearchActivitiesByViews(this.ModuleId,this.FormId,this.ViewId, LeadSearchInput)
            .subscribe((data: any) => {
                debugger;
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
        
        let SelLeadSource=this.ActivityFilterInfoForm.get('LeadSource').value.map(x=>x.SourceName).toString();
        this.SelectedActivitiessourceName=SelLeadSource;

        let SelLeadSourceIds=this.ActivityFilterInfoForm.get('LeadSource').value.map(x=>x.LeadSourceId).toString();
        this.SelectedActivitiessourceId=SelLeadSourceIds;
      }
      onDeSelectAll(items: any) {
        console.log(items);
        //
        this.SelectedActivitiessourceName="";
        this.ActivityFilterInfoForm.get('LeadSource').setValue("");

        this.SelectedActivitiessourceId="";

      }
      onSelectAll(items: any) {
        console.log(items);
        
        let SelLeadSource=items.map(x=>x.SourceName).toString();
        this.SelectedActivitiessourceName=SelLeadSource;

        let SelLeadSourceIds=items.map(x=>x.LeadSourceId).toString();
        this.SelectedActivitiessourceId=SelLeadSourceIds;

      }
      onItemDeSelect(item: any) {
        console.log(item);
        
        let SelLeadSource=this.ActivityFilterInfoForm.get('LeadSource').value.map(x=>x.SourceName).toString();
        this.SelectedActivitiessourceName=SelLeadSource;

        let SelLeadSourceIds=this.ActivityFilterInfoForm.get('LeadSource').value.map(x=>x.LeadSourceId).toString();
        this.SelectedActivitiessourceId=SelLeadSourceIds;

      }

    OnLeadSourceChange(e) {
        
        let SelectLeadSourceId=this.ActivityFilterInfoForm.get("LeadSource").value;
        // let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "bankmaster")[0];
        let LeadSourceName=this.LeadSourceList.filter(x=>x.LeadSourceId==SelectLeadSourceId)[0].SourceName;
        
        if(this.SelectedActivitiessourceName == "")
        {
            this.SelectedActivitiessourceName = LeadSourceName;
        }
        else
        {
            this.SelectedActivitiessourceName = this.SelectedActivitiessourceName + "," + LeadSourceName;
        }
        //this.SelectedActivitiessourceId = this.ActivityFilterInfoForm.get("LeadSource").value;

        console.log("Selected Lead Source ID   : " + this.SelectedActivitiessourceId);
        console.log("Selected Lead Source Name : " + this.SelectedActivitiessourceName);
    }  
    GetLeadsList() {
        //this.blockUI.start("Loading..."); // Start blocking

        let lead = <Observable<any>>this.CRMService.GetLeadsList();
        lead.subscribe((LeadsListResult) => {
            //
            if (LeadsListResult != null) {
                this.ActivityLists = LeadsListResult;
                this.ActivityListsPagerConfig.TotalRecords = LeadsListResult.length;
                this.TotalRecords = LeadsListResult.length;

            }
            setTimeout(() => {
                //this.blockUI.stop(); // Stop blocking

            }, 300);
        });
    }
    pageChange(currentPageNumber: any) {
        
        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.ActivityListsPagerConfig.RecordsToSkip = this.ActivityListsPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            debugger;
            this.FilterData();
        }
       
    }
    EditActivity(ActivityId,ActivityType) {
        const self = this;
        //'crmactivity/:mode/:Id/:return/:returnid',
        this.router.navigate([`/crm/crmactivity/${'EDIT'}/${ActivityId}//${ActivityType}/1/0`]);
    }
    ClickEditActivity(ActivityId,ActivityTypeId,ActivityTypeName,FormMode,e) {
        const self = this;
        //'crmactivity/:mode/:Id/:return/:returnid',
        //this.router.navigate([`/crm/crmactivity/${'EDIT'}/${ActivityId}//${ActivityType}/1/0`]);

        this.ContactInfo=this.ActivityLists.find(x=>x.ActivityId==ActivityId);


        this.ActivityFormMode=FormMode;
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
        this.ClickNewPhoneActivity(ActivityId,ActivityTypeId,ActivityTypeName,this.ActivityFormMode,e);
      }
    ClickNewPhoneActivity(ActivityId,ActivityTypeId,ActivityTypeName,FormMode,e)    
    {
        //alert(ActivityId +' '+ActivityTypeId+' '+ActivityTypeName+' '+FormMode);
    this.ActivityFormMode=FormMode;
    //TODO   Schedule a call, Log a call
    let ActiityDialogRef = this.dialog.open(CrmactivityLogACallComponent, {
      width: '1000px',
      height: '650px',
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
      
      poFilterData.ModuleId=this.ModuleId;
      poFilterData.FormId=this.FormId;
      poFilterData.ViewId=this.ViewId;

      poFilterData.RegardingId=this.RegardingId;
      poFilterData.RegarId=this.ContactId;

      //Call API 
      this.SearchActivities(poFilterData);
      ActiityDialogRef.close();

    });
    }
    ClickNewContact(event) {
        //'crmactivity/:mode/:Id/:return/:returnid',
        this.router.navigate([`/crm/crmactivity/${'NEW'}/${0}/1/0`]);
    }
    ClickNewActivity(e,ActivityType)
    {
        //alert("Activity Type : "+ActivityType);
        this.router.navigate([`/crm/crmactivity/${'NEW'}/${0}/${ActivityType}/1/0`]);
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
        if(this.TotalSelectedActivities==0)
        {
            this.SelectedActivities="";
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
        if(this.selectedItems !=null)
        {
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
    ClickShow(event)
    {
        this.showtest=!this.showtest;
    }

    ClickImport(e)
    {
        alert("Click Import");
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
        //
        let poFilterData: LeadsFilterModel = this.ActivityFilterInfoForm.value;
        if (this.ActivityFilterInfoForm.get('Name').value != null) {
            poFilterData.Name = this.ActivityFilterInfoForm.get('Name').value;;
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
        //
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
        //
        //var a=this.ELeadSearchDiv;
        //
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
                
                console.log("Results In leadlists");
                console.log(result);
            }
        }).catch(err => {
                
                alert(err);
        });

        // modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
        //   console.log(receivedEntry);
        // })

    }

    FilterData() {
        //
        debugger;
        this.filterMessage = "";
        //let poFilterData:PurchaseOrderFilterModel = this.ActivityFilterInfoForm.value;
        let poFilterData: ActivityFilterModel = this.ActivityFilterInfoForm.value;
       
        if (this.ActivityFilterInfoForm.get('ActivitySubject').value != null) {
            poFilterData.ActivitySubject = this.ActivityFilterInfoForm.get('ActivitySubject').value;
        }
        if (this.ActivityFilterInfoForm.get('ActivityDesc').value != null) {
            poFilterData.ActivityDesc = this.ActivityFilterInfoForm.get('ActivityDesc').value;
        }
       
        poFilterData.ModuleId=this.ModuleId;
        poFilterData.FormId=this.FormId;
        poFilterData.ViewId=this.ViewId;

        //Call API 
        this.SearchActivities(poFilterData);

    }
onCancel() {
    // this.paymentformArray.controls = [];
    // this.paymentformGroup.reset();
    // this.disableConfirm = true;
}    
fileChanged(e: any) {
    const self = this;
    const elem = e.target;

    this.file = e.target.files[0];

    let files: FileList = e.target.files;
    for (let i = 0; i < files.length; i++) {
      let fileItem = files.item(i);
      if (ValidateFileType(fileItem.name)) {
        this.uploadedFiles.push(fileItem);
      }
      else {
        e.preventDefault();
        break;
      }
    }


    //Check File Extension
    if (this.file.type == "application/vnd.ms-excel") {
      this.FileType = "CSV";
    } 
    else if (this.file.type =="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") 
    {
      this.FileType = "EXCEL";
      //this.fileReset();
    }

}
ImportContacts(e) {
    const self = this;
    console.log("Import Contacts");
    //alert("Import Contacts");
    this.onCancel();
    debugger;
    if (e.target.files.length == 0) {
      return
    }
    let file: File = e.target.files[0];
    let file1 = e.target.files[0];
    let formData: FormData = new FormData();
    formData.append("uploadFile", file1, file1.name);
    formData.append("UserId", this.UserId.toString());
    formData.append("CompanyId", this.CompanyId.toString());
    formData.append("FileType", this.FileType);

      //debugger;
      this.CRMService.UploadFile(formData, this.UserId, this.CompanyId)
        .subscribe((data:any) => {
          debugger;
          //ErrorMessage

          this.blockUI.stop();
          if (data.Status == "SUCCESS") {           
            console.log("success"),
              self.snackBar.open("Uploaded Successfully", null, {
                duration: 5000,
                verticalPosition: "top",
                horizontalPosition: "right",
                panelClass: "stellify-snackbar",
              });
            this.blockUI.start("Uploaded Successfully..."); // Start blocking
            setTimeout(() => {
              this.blockUI.stop(); // Stop blocking
              //crm/crmconnectionsdetails/VIEW/2014
             
              //this.router.navigate([`/crm/crmconnectionsdetails/VIEW/${this.ListId}`]);
              
              this.SearchAppViews();

            }, 300);
            //Navigate to email/view  email/view
          } else data.Status == "ERROR";
          {
            self.snackBar.open(data.Message, null, {
              duration: 5000,
              verticalPosition: "top",
              horizontalPosition: "right",
              panelClass: "stellify-snackbar",
            });
          }
        },
          (error) => {
            this.blockUI.stop();
            console.log(error);
            self.snackBar.open("Error Occured", null, {
              duration: 5000,
              verticalPosition: "top",
              horizontalPosition: "right",
              panelClass: "stellify-snackbar",
            });
          }
        );
    // if (file.type.toLowerCase() == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') 
    // {
    //   this.paymentService.uploadPayments(file).subscribe((data: Payment[]) => {
    //     this.disableConfirm = data.filter((obj) => obj.Status == false).length == 0 ? false : true;
    //     if (data.length == 0) {
    //       this.disableConfirm = true;
    //       this.sharedServiceObj.showMessage({
    //         ShowMessage: true,
    //         Message: Messages.PaymentExcelIncorrect,
    //         MessageType: MessageTypes.Error
    //       });
    //     }
    //     let itemGroupControl = new FormArray([]);
    //     itemGroupControl = <FormArray>this.paymentformGroup.controls['Payments'];
    //     data.forEach((element: Payment) => {
    //       itemGroupControl.push(this.Add(element));
    //     });
    //   });
    // }
    // else {
    //   this.sharedServiceObj.showMessage({
    //     ShowMessage: true,
    //     Message: Messages.AssetSubcategoryAcceptExcel,
    //     MessageType: MessageTypes.Error
    //   });
    // }
}
//*********************************************************************************************************************/
//Export Code Starts Here
//*********************************************************************************************************************/
ExportToCSV() {
    const self=this;
    //TODO
    
    //Set Records To Fetch
    this.ActivityListsPagerConfig.RecordsToSkip = 0;
    this.ActivityListsPagerConfig.RecordsToFetch = 0;
  
    this.FilterData();
    this.interval = setTimeout(() => {
        //alert("Alert activated")
        //
        if (this.IsFilterDataArrive) {
            //
            this.ResetPagerConfig();
            if (this.FilterActivityLists.length > 0) {
                this.ExportActivityLists= new Array<ActivityDTO>();
                debugger;
                let vSelectedActivities=this.SelectedActivities;

                // let newArray = array.filter(function (item) {
                //     return conditional_statement;
                // });
                for(var i=0;i<=this.FilterActivityLists.length-1;i++)
                {
                   
                    const contact=this.FilterActivityLists[i];
                    
                    this.ActivityInfo=new ActivityDTO();
                    this.ActivityInfo.ActivityId        =contact.ActivityId;
                    this.ActivityInfo.ActivitySubject   =contact.ActivitySubject;
                    this.ActivityInfo.ActivityDesc      =contact.ActivityDesc;
                    this.ActivityInfo.StartDate         =contact.StartDate;
                    this.ActivityInfo.EndDate           =contact.EndDate;
                    this.ActivityInfo.DueDate           =contact.DueDate;
                    this.ActivityInfo.ActivityTypeName  =contact.ActivityTypeName;
                    this.ActivityInfo.RegardingName     =contact.RegardingName;

                    this.ExportActivityLists.push(this.ActivityInfo);
                }

                             
                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="ContactsLists_" + this.CurrentDate+"_"+this.FileNo.toString();

                //alert("Total Records CSV : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                const options = {
                    fieldSeparator: ',',
                    quoteStrings: '"',
                    decimalSeparator: '.',
                    showLabels: true,
                    //showTitle: true,
                    //title: 'Contacts List',
                    useTextFile: false,
                    useBom: true,
                    filename:this.FileName,
                    headers: ['Account', 'First Name', 'Last Name', 'Job Title','Mobile','Email','CreatedOn']
                };
                const csvExporter = new ExportToCsv(options);
                csvExporter.generateCsv(this.ExportActivityLists);
                this.stopTime();
            }
        }
    }, 1000);

}
exportToExcel(): void {

    const edata: Array<ExcelJson> = [];
    const udt: ExcelJson = {
        data: [
            { A: 'Activities Lists' }, // title
            { A: 'Activity Type', B: 'Activity Subject', C: 'Activity Desc',D: 'Start Date',E: 'End Date',F:'Due Date',G:'Status' }, 
        ],
        skipHeader: true
    };
    this.FilterActivityLists.forEach(activity => {
        udt.data.push({
            A: activity.ActivityTypeName,
            B: activity.ActivitySubject,
            C: activity.ActivityDesc,
            D: activity.StartDate,
            E: activity.EndDate,
            F: activity.DueDate,
            G: activity.StatReasonId
        });
    });
    edata.push(udt);

    this.exportService.exportJsonToExcel(edata, 'ActivitiesLists');
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
    

    this.blockUI.start("Preparing Data...!!!"); // Start blocking
    this.FilterData();
    this.interval = setTimeout(() => {
        //alert("Alert activated")
        
        if (this.IsFilterDataArrive) {
            
            this.blockUI.update("Exporting Data...!!!");
            this.blockUI.start("Exporting Data...!!!"); // Start blocking
            if (this.FilterActivityLists.length > 0) {
                //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                //this.exportToExcel();
                const edata: Array<ExcelJson> = [];
                const udt: ExcelJson = {
                    data: [
                        { A: 'Activities Lists' }, // title
                        { A: 'Activity Type', B: 'Activity Subject', C: 'Activity Desc',D: 'Start Date',E: 'End Date',F:'Due Date',G:'Status' }, 
                   ],
                    skipHeader: true
                };
                this.FilterActivityLists.forEach(activity => {
                    udt.data.push({
                        A: activity.ActivityTypeName,
                        B: activity.ActivitySubject,
                        C: activity.ActivityDesc,
                        D: activity.StartDate,
                        E: activity.EndDate,
                        F: activity.DueDate,
                        G: activity.StatReasonId
                    });
                });
                edata.push(udt);

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="ContactsLists_" + this.CurrentDate+"_"+this.FileNo.toString();

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
    

    //Get Filter Data
    this.blockUI.start("Preparing Data...!!!"); // Start blocking
    this.FilterData();

    this.interval = setTimeout(() => {
        //alert("Alert activated")
        
        if (this.IsFilterDataArrive) {
            
            if (this.FilterActivityLists.length > 0) {
                //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

                this.exportColumns = this.ActivityListsCols.map((col) => ({
                    title: col.header,
                    dataKey: col.field,
                }));

                //Remove Action Column
                this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                const doc = new jsPDF('p', 'pt');
                doc['autoTable'](this.SelexportColumns, this.FilterActivityLists);
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
stopTime() {
    clearInterval(this.interval);
    this.showLeftPanelLoadingIcon = false;
    this.blockUI.start("Done Data...!!!"); // Start blocking
    this.blockUI.stop();
}
//*********************************************************************************************************************/
//Export Code Ends Here
//*********************************************************************************************************************/
    OnNameFilterChange(event: any) {
        
        console.log(event);
        // this.SelectedName = event.item.firstName +' '+  event.item.lastName;
        this.SelectedName = event.item.Name.value;
        //this.ActivityFilterInfoForm.get('Name').setValue(this.SelectedName);
        alert("Selected Name : " + this.SelectedName);
        setTimeout(() => {
            this.FilterData();

        }, 300);
    }

    Namechange(event) {
        //
        this.NameValidate = event.target.value;
    }
    // NameInputFormater = (x: LeadsName) => x.FirstName +' ' + x.Lastname;
    NameInputFormater = (x: LeadsName) => x.Name;
    NameSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term.length > 3) {

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
    if (this.TotalSelectedActivities == 0) {
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
    if (this.TotalSelectedActivities == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Assiging Selected Leads ");
    }
}
ClickDelete(event)
{
    if (this.TotalSelectedActivities == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Deleting Selected Leads ");
    }
}
OnViewChange(e)
{
    debugger;
    this.ViewId=e.currentTarget.value;
    this.FilterData();
}

getRandomInt(max) {
    return Math.floor(Math.random() * max);
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
public clear(){
    this.post = null;
    this.comment = null;
    this.user = null;
  }
public callMultiple(){
    let post1 = this._http.get<Post>(`${this._baseUrl}/posts/1`);
    let comment1 = this._http.get<Comment>(`${this._baseUrl}/comments/1`);
    let user1 = this._http.get<User>(`${this._baseUrl}/users/1`);
    Observable.forkJoin(post1, comment1, user1).subscribe(
      data => {
        debugger;
        [this.post, this.comment, this.user] = data;
      }
    )
  }
  ClickViewPin(e)
  {
      alert("Current View : " + this.ViewId);
  }
}







export interface Post {  
    userId:number;
    id: number;
    title: string;
    body: string;  
}


export interface Comment {  
    postId:number;
    id: number;
    name: string;
    email: string;
    body: string;  
}


export interface User { 
    id: number;
    name: string;
    email: string;
    phone: string;  
}