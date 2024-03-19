import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
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
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { ContactsFilterModel, DateObj, LeadsFilterModel, MarketingList } from '../../models/crm.models';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SharedService } from '../../../shared/services/shared.service';
import { trigger, state, style, animate, transition, query, group } from '@angular/animations';
import { fadeAnimation } from '../../services/fadeAnimation';
import { Fade } from '../../animations/fade.animation';
import { SlideInOutAnimation, fader } from '../../animations/animations';
import { LeadsearchComponent } from '../../leadsearch/leadsearch.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { LeadsearchmodalComponent } from '../../leadsearchmodal/leadsearchmodal.component';
import { LeadfilterComponent } from '../leadfilter/leadfilter.component';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { ValidateFileType, FullScreen, restrictMinus, HideFullScreen } from "../../../shared/shared";
import { ExportToCsv } from 'export-to-csv';
import { ExcelJson } from '../../../../app/po/components/interfaces/excel-json.interface';
import { ExportService } from '../../../../app/po/services/export.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';  
import * as XLSX from 'xlsx';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Contacts } from '../../models/ContactDTO';
import { HttpClient } from '@angular/common/http';
import { MyDomainItems } from '../../models/DomainItems';
import { environment } from '../../../../environments/environment';
import { CSVRecord } from '../../models/CSVRecord';

interface People {
    firstname?: string;
    lastname?: string;
    age?: string;
}

@Component({
    selector: 'app-contactslist',
    templateUrl: './contactslist.component.html',
    styleUrls: ['./contactslist.component.css'],
 })
export class ContactslistComponent implements OnInit,AfterViewInit  {
    ShowToolBar:boolean=false;
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
    @ViewChild('ContactsListTable') dt: Table;
    i:number=0;
    LeadSourceListSettings = {};
    SelectedContactsourceId:string="";
    SelectedContactsourceName:string="";
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
    showtest:boolean=false;
    tableData: People[] = [];
    cols: any[] = [];
    currencyTypes: Currency[] = [];
    filterMessage: string = "";
    SelectedName: string;
    NameValidate: string = "";
    seletedValue: string = "";
    showLeftPanelLoadingIcon: boolean = false;
    ContactsListsCols: any[];
    ContactsLists: any[] = [];
    //FilterContactsLists: any[] = [];

    ModuleId:number;
    FormId:number;
    ViewId:number;

    FilterContactsLists: Contacts[] = [];
    ExportContactsLists:Contacts[]=[];

    ContactInfo:Contacts;
    HeaderTitle: string;

    LeadId: any;
    TotalRecords: number = 0;
    ContactFilterInfoForm: FormGroup;
    ContactFilterInfoFormA: FormGroup;
    companyFilterInfoForm: FormGroup;


    // purchaseOrdersList: Array<PurchaseOrderList> = [];

    
    //initialValue: Product[];
    public selectedItems: any[];
    SelectedContacts: string = '';
    TotalSelectedContacts: number = 0;
    ExportTotalContacts:boolean=false;
    AppViewsList = [];
    DefaultViewId:number=0;
    SearchAppViewsListsPagerConfig: PagerConfig;

    ContactsListsPagerConfig: PagerConfig;
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
        public DialogAssignTo: MatDialog,
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
        this.ContactsListsPagerConfig.RecordsToSkip = 0;
        this.ContactsListsPagerConfig.RecordsToFetch = 25;

        this.currentPage = 1;
    }
    private initForm(): void {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
    
        this.ContactFilterInfoFormA = this.formBuilderObj.group({
          Name: [''],
          FromDate: [oneMonthAgo.toISOString().substring(0, 10)],
          ToDate: [today.toISOString().substring(0, 10)],
          ViewId:[0]
        });
      }

    initializeFilterForm(): void {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        //FromDate: [oneMonthAgo.toISOString().substring(0, 10)],
        //ToDate: [today.toISOString().substring(0, 10)],

        this.ContactFilterInfoForm = this.formBuilderObj.group({
            FirstName:[''],
            LastName:[''],
            Mobile:[''],
            Email:[''],
            ViewId:[0]
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
      }



    ngOnInit() {
        this.FileType = "CSV";
        this.ModuleId=1;
        this.FormId=13;
        this.ViewId=5;

       
        this.ContactsListsCols = [            
            { field: 'FirstName', header: 'First Name', width: '200px' },
            { field: 'LastName', header: 'Last Name', width: '150px' },
            { field: 'JobTitle', header: 'Job Title', width: '150px' },
            { field: 'Account', header: 'Draft Code', width: '100px' },
            { field: 'Mobile', header: 'Mobile', width: '150px' },
            { field: 'EmailId', header: 'Email', width: '150px' },
            { field: 'CreatedDate', header: 'Created On', width: '150px' },
            { field: '', header: 'Action', width: '100px' },
        ];

        this.initializeFilterForm();
        this.initForm();

        //TotalSelectedContacts
        this.TotalSelectedContacts=0;
      
        this.ContactsListsPagerConfig = new PagerConfig();
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

        //LeadListsComponent.resetForm(this.ContactFilterInfoForm);
        this.initializeFilterForm();

        //this.ContactFilterInfoForm.reset();
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
        //this.ContactFilterInfoForm.reset();
        //LeadListsComponent.resetForm(this.ContactFilterInfoForm);
        this.initializeFilterForm();
        this.SetIntialDates();
        //this.GetLeadsList();
        this.SearchContacts();
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

        this.ContactFilterInfoForm.controls.FromDate.setValue({
            year: FirstDateYear,
            month: FirstDateMonth,
            day: FirstDateDay
        });

        this.ContactFilterInfoForm.controls.ToDate.setValue({
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

                this.ContactFilterInfoForm.controls["ViewId"].setValue(this.ViewId);
    
                //this.SearchLeadsViews();
                this.FilterData();
                
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    SearchContacts(ContactsFilterData?: ContactsFilterModel) {
        //
        if(ContactsFilterData.FirstName!=null)
        {
            this.SearchLeadName=ContactsFilterData.FirstName;
        }
        if(ContactsFilterData.FirstName!=null)
        {
            this.SearchLeadName=ContactsFilterData.LastName;
        }

        if (ContactsFilterData.FirstName!=null && ContactsFilterData.LastName !=null)
        {
            this.SearchLeadName=ContactsFilterData.FirstName + " " + ContactsFilterData.LastName;
        }

        this.UserId=this.userDetails.UserID;
        let LeadSearchInput = {
            Skip: this.ContactsListsPagerConfig.RecordsToSkip,
            Take: this.ContactsListsPagerConfig.RecordsToFetch,
            FirstName:ContactsFilterData.FirstName,
            LastName:ContactsFilterData.LastName,
            Mobile:ContactsFilterData.Mobile,
            EMail:ContactsFilterData.Email,
            UserId:this.UserId,
            ModuleId:this.ModuleId,
            FormId:this.FormId,
            ViewId:this.ViewId

        };
        this.showLeftPanelLoadingIcon = true;
        this.CRMService.SearchContacts(LeadSearchInput)
            .subscribe((data: any) => {
                //
                this.showLeftPanelLoadingIcon = false;
                this.TotalRecords = data.TotalRecords;
                //
                this.IsFilterDataArrive=true;
                if (data.TotalRecords > 0) {
                    //
                    this.TotalRecords = data.TotalRecords;
                    this.ContactsLists = data.Contacts;
                    this.FilterContactsLists = data.Contacts;
                    this.ContactsListsPagerConfig.TotalRecords = data.TotalRecords;

                }
                else {
                    this.TotalRecords = data.TotalRecords;
                    this.ContactsLists = data.Contacts;
                    this.FilterContactsLists = data.Contacts;
                    this.ContactsListsPagerConfig.TotalRecords = data.TotalRecords;
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
        
        let SelLeadSource=this.ContactFilterInfoForm.get('LeadSource').value.map(x=>x.SourceName).toString();
        this.SelectedContactsourceName=SelLeadSource;

        let SelLeadSourceIds=this.ContactFilterInfoForm.get('LeadSource').value.map(x=>x.LeadSourceId).toString();
        this.SelectedContactsourceId=SelLeadSourceIds;
      }
      onDeSelectAll(items: any) {
        console.log(items);
        //
        this.SelectedContactsourceName="";
        this.ContactFilterInfoForm.get('LeadSource').setValue("");

        this.SelectedContactsourceId="";

      }
      onSelectAll(items: any) {
        console.log(items);
        
        let SelLeadSource=items.map(x=>x.SourceName).toString();
        this.SelectedContactsourceName=SelLeadSource;

        let SelLeadSourceIds=items.map(x=>x.LeadSourceId).toString();
        this.SelectedContactsourceId=SelLeadSourceIds;

      }
      onItemDeSelect(item: any) {
        console.log(item);
        
        let SelLeadSource=this.ContactFilterInfoForm.get('LeadSource').value.map(x=>x.SourceName).toString();
        this.SelectedContactsourceName=SelLeadSource;

        let SelLeadSourceIds=this.ContactFilterInfoForm.get('LeadSource').value.map(x=>x.LeadSourceId).toString();
        this.SelectedContactsourceId=SelLeadSourceIds;

      }

    OnLeadSourceChange(e) {
        
        let SelectLeadSourceId=this.ContactFilterInfoForm.get("LeadSource").value;
        // let role = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "bankmaster")[0];
        let LeadSourceName=this.LeadSourceList.filter(x=>x.LeadSourceId==SelectLeadSourceId)[0].SourceName;
        
        if(this.SelectedContactsourceName == "")
        {
            this.SelectedContactsourceName = LeadSourceName;
        }
        else
        {
            this.SelectedContactsourceName = this.SelectedContactsourceName + "," + LeadSourceName;
        }
        //this.SelectedContactsourceId = this.ContactFilterInfoForm.get("LeadSource").value;

        console.log("Selected Lead Source ID   : " + this.SelectedContactsourceId);
        console.log("Selected Lead Source Name : " + this.SelectedContactsourceName);
    }  
    GetLeadsList() {
        //this.blockUI.start("Loading..."); // Start blocking

        let lead = <Observable<any>>this.CRMService.GetLeadsList();
        lead.subscribe((LeadsListResult) => {
            //
            if (LeadsListResult != null) {
                this.ContactsLists = LeadsListResult;
                this.ContactsListsPagerConfig.TotalRecords = LeadsListResult.length;
                this.TotalRecords = LeadsListResult.length;

            }
            setTimeout(() => {
                //this.blockUI.stop(); // Stop blocking

            }, 300);
        });
    }
    pageChange(currentPageNumber: any) {
        
        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.ContactsListsPagerConfig.RecordsToSkip = this.ContactsListsPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            debugger;
            this.FilterData();
        }
       
    }
        EditContact(leadid) {
        const self = this;
        this.router.navigate([`/crm/contacts/${'EDIT'}/${leadid}/1/0`]);
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
        if(this.TotalSelectedContacts==0)
        {
            this.SelectedContacts="";
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

    ClickSelected(event) {
        
        let i = 0;

        this.SelectedContacts = "";
        if(this.selectedItems !=null)
        {
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
    ClickShow(event)
    {
        this.showtest=!this.showtest;
    }
    ClickNewContact(event) {
        this.router.navigate([`/crm/contacts/${'NEW'}/${0}/1/0`]);
    }
    ClickImport(e) {
        this.HeaderTitle = "Contact Import";

        debugger;

        //Dialog starts here
        let DialogAssignToRef = this.DialogAssignTo.open(ContactImportDoalog, {
            width: '850px',
            height: '550px',
            disableClose: true,
            data: {
                HeaderTitle: this.HeaderTitle,
                EntityId: 5,
                EntityName: 'Contact',
                UserId: this.UserId
            }
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

                this.SearchAppViews();
                console.log('in Yes btnClick');

            }
        });
        //Dialog ends here

    }



    CloseLeadSearch(event,message:any)
    {
        alert("Close Lead Search : " + message);
        //this.activeModal.close();
        //
        let poFilterData: LeadsFilterModel = this.ContactFilterInfoForm.value;
        if (this.ContactFilterInfoForm.get('Name').value != null) {
            poFilterData.Name = this.ContactFilterInfoForm.get('Name').value;;
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

        this.filterMessage = "";
        //let poFilterData:PurchaseOrderFilterModel = this.ContactFilterInfoForm.value;
        let poFilterData: ContactsFilterModel = this.ContactFilterInfoForm.value;
       
        if (this.ContactFilterInfoForm.get('FirstName').value != null) {
            poFilterData.FirstName = this.ContactFilterInfoForm.get('FirstName').value;
        }
        if (this.ContactFilterInfoForm.get('LastName').value != null) {
            poFilterData.LastName = this.ContactFilterInfoForm.get('LastName').value;
        }
       
        poFilterData.ModuleId=this.ModuleId;
        poFilterData.FormId=this.FormId;
        poFilterData.ViewId=this.ViewId;

        //Call API 
        this.SearchContacts(poFilterData);

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
    this.ContactsListsPagerConfig.RecordsToSkip = 0;
    this.ContactsListsPagerConfig.RecordsToFetch = 0;
  
    this.FilterData();
    this.interval = setTimeout(() => {
        //alert("Alert activated")
        //
        if (this.IsFilterDataArrive) {
            //
            this.ResetPagerConfig();
            if (this.FilterContactsLists.length > 0) {
                this.ExportContactsLists= new Array<Contacts>();
                debugger;
                let vSelectedContacts=this.SelectedContacts;

                // let newArray = array.filter(function (item) {
                //     return conditional_statement;
                // });
                for(var i=0;i<=this.FilterContactsLists.length-1;i++)
                {
                   
                    const contact=this.FilterContactsLists[i];
                    
                    this.ContactInfo=new Contacts();
                    this.ContactInfo.Id=contact.Id;
                    this.ContactInfo.AccountName=contact.AccountName;
                    this.ContactInfo.FirstName=contact.FirstName;
                    this.ContactInfo.LastName=contact.LastName;
                    this.ContactInfo.JobTitle=contact.JobTitle;
                    this.ContactInfo.Mobile=contact.Mobile;
                    this.ContactInfo.EmailId=contact.EmailId;
                    this.ContactInfo.CreatedDate=contact.CreatedDate;

                    this.ExportContactsLists.push(this.ContactInfo);
                }

                // this.FilterContactsLists.forEach(element => {
                //     console.log(element);
                //     //
                //     // this.ContactInfo=null;

                //     // this.ContactInfo.Id=element.Id;
                //     // this.ContactInfo.AccountName=element.AccountName;
                //     // this.ContactInfo.FirstName=element.FirstName;
                //     // this.ContactInfo.LastName=element.LastName;
                //     // this.ContactInfo.JobTitle=element.JobTitle;
                //     // this.ContactInfo.Mobile=element.Mobile;
                //     // this.ContactInfo.EmailId=element.EmailId;
                //     // this.ContactInfo.CreatedDate=element.CreatedDate;

                //     this.ExportContactsLists.push(element);

                //   });
                
                
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
                csvExporter.generateCsv(this.ExportContactsLists);
                this.stopTime();
            }
        }
    }, 1000);

}
exportToExcel(): void {

    const edata: Array<ExcelJson> = [];
    const udt: ExcelJson = {
        data: [
            { A: 'Contacts Lists' }, // title
            { A: 'Account', B: 'First Name', C: 'Last Name',D: 'Job Title',E: 'Mobile',F:'Email',G:'Created On' }, // table header
        ],
        skipHeader: true
    };
    this.FilterContactsLists.forEach(contact => {
        udt.data.push({
            A: contact.AccountName,
            B: contact.FirstName,
            C: contact.LastName,
            D: contact.JobTitle,
            E: contact.Mobile,
            F: contact.EmailId,
            G: contact.CreatedDate
        });
    });
    edata.push(udt);

    this.exportService.exportJsonToExcel(edata, 'ContactsLists');
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
            if (this.FilterContactsLists.length > 0) {
                //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                //this.exportToExcel();
                const edata: Array<ExcelJson> = [];
                const udt: ExcelJson = {
                    data: [
                        { A: 'Leads Lists' }, // title
                        { A: 'Account', B: 'First Name', C: 'Last Name',D: 'Job Title',E: 'Mobile',F:'Email',G:'Created On' }, // table header
                    ],
                    skipHeader: true
                };
                this.FilterContactsLists.forEach(polist => {
                    udt.data.push({
                        A: polist.AccountName,
                        B: polist.FirstName,
                        C: polist.LastName,
                        D: polist.JobTitle,
                        E: polist.Mobile,
                        F: polist.EmailId,
                        G: polist.CreatedDate
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
            
            if (this.FilterContactsLists.length > 0) {
                //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

                this.exportColumns = this.ContactsListsCols.map((col) => ({
                    title: col.header,
                    dataKey: col.field,
                }));

                //Remove Action Column
                this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                const doc = new jsPDF('p', 'pt');
                doc['autoTable'](this.SelexportColumns, this.FilterContactsLists);
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
        //this.ContactFilterInfoForm.get('Name').setValue(this.SelectedName);
        alert("Selected Name : " + this.SelectedName);
        setTimeout(() => {
            this.FilterData();

        }, 300);

        // if (event.item != null && event.item != undefined) {
        //     if (event.item.WorkFlowStatus != "Approved") {
        //         this.ContactFilterInfoForm.get('Name').setValue(null);
        //         event.preventDefault();
        //     }
        //     else if (event.item.IsFreezed) {
        //         this.ContactFilterInfoForm.get('Name').setValue(null);
        //         event.preventDefault();
        //     }
        // }
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

                // if (term == "") {

                // }
                if (term.length > 3) {
                    //
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
    if (this.TotalSelectedContacts == 0) {
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
    if (this.TotalSelectedContacts == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Assiging Selected Leads ");
    }
}
ClickDelete(event)
{
    if (this.TotalSelectedContacts == 0) {
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
    ClickQualify(event) {
        if (this.TotalSelectedContacts == 0) {
            alert("Please Select atleast 1 lead ");
        }
        else {
            //alert("Converting Qualify Selected Leads ");

            
            let SelectedContacts = this.selectedItems;
            for (var i = 0; i < this.selectedItems.length; i++) {
                this.MyLead = new Lead();

                this.MyLead.Id = this.selectedItems[i].Id;
                this.MyLead.OppId = this.selectedItems[i].OppId;

                this.MyLead.PreviousProbabilityId=this.selectedItems[i].ProbabilityId;
                // this.MyLead.ProbabilityId = this.selectedItems[i].ProbabilityId;
                this.MyLead.ProbabilityId = 3;

                this.MyLead.CreatedDate = this.selectedItems[i].CreatedDate;
                this.MyLead.UpdatedDate = this.selectedItems[i].UpdatedDate;
                this.MyLead.EstBudget = this.selectedItems[i].EstBudget;

                this.MyLead.UserId=this.UserId;

                if (this.MyLead.Id != undefined) {
                    this.MyLeadIds.push(this.MyLead);
                }
            }
            //this.blockUI.start("Updating Status...!!!"); // Start blocking

            this.result = this.CRMService.ChangeLeadStatus(this.MyLeadIds)
              .subscribe(
                (data: any) => {
                    
                  if (data.Status == "SUCCESS") {
                    alert("Leads Converted Successfully ...");
                    //this.resetFilters(event);
                    this.TotalSelectedContacts=0;
                    this.SearchContacts();

                  } else if (data.Status == "ERROR") {
                    setTimeout(() => {
                      //this.blockUI.stop(); // Stop blocking
                    }, 500);
    
                    alert(data.Message);
                    // self.snackBar.open(data.Message, null, {
                    //   duration: 5000,
                    //   verticalPosition: "top",
                    //   horizontalPosition: "right",
                    //   panelClass: "stellify-snackbar",
                    // });

                  } 
                  else 
                  {
                    setTimeout(() => {
                      //this.blockUI.stop(); // Stop blocking
                    }, 500);
                    alert("Problem in  Updating lead please try again");
                    // self.snackBar.open(
                    //   "Problem in  Updating lead please try again",
                    //   null,
                    //   {
                    //     duration: 5000,
                    //     verticalPosition: "top",
                    //     horizontalPosition: "right",
                    //     panelClass: "stellify-snackbar",
                    //   }
                    // );

                  }
                },
                // Errors will call this callback instead:
                (err) => {
                  ////
                  if (err.error == "FAIL") {
                    //this.formError = err.error.ExceptionMessage;
    
                    // setTimeout(() => {
                    //   this.blockUI.stop(); // Stop blocking
                    // }, 500);
    
                    // self.snackBar.open(
                    //   "Problem in  Updating lead please try again",
                    //   null,
                    //   {
                    //     duration: 5000,
                    //     verticalPosition: "top",
                    //     horizontalPosition: "right",
                    //     panelClass: "stellify-snackbar",
                    //   }
                    // );
                    alert("Problem in  Updating lead please try again");
                  } 
                  else 
                  {
                    //this.formError = err.statusText;
                  }
                }
              );
        }
    
    

    
}
ClickDisQualify(event)
{
    if (this.TotalSelectedContacts == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Dis Qualifying Selected Leads ");
    }
}
ClickQuickCampaign(event)
{
    if (this.TotalSelectedContacts == 0) {
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

//*******************************************************************************************************************************/
//Contacts Import Starts Here
//*******************************************************************************************************************************/
@Component({
    selector: "app-contacts-import",
    templateUrl: "./contacts-import.component.html",
    styleUrls: ["./contacts-import.component.css"],
  })
  export class ContactImportDoalog implements OnInit {
    //Auto map csv variables
    @ViewChild("ListName", { read: ElementRef }) MyListNameRef: ElementRef;
    @ViewChild("fileImportInput", { read: ElementRef })
    fileImportInputREf: ElementRef;
    @ViewChild("fileUpload") fileUploadVar: any;
    //@ViewChild('fileImportInput')
    // Decorator wires up blockUI instance
    @BlockUI() blockUI: NgBlockUI;
    uploadedFiles: Array<File> = [];
    SelectedListName:string="";
    fileImportInput: any;
    //listsControl = new FormControl('', [Validators.required]);
    arrayBuffer: any;
    ExcelFile: File;
    ListId:any;
    EntityItemsList:MyDomainItems[];
  
    listname: string;
    listsControl = new FormControl("");
    SelectedList: number=0;
    SelectedEntityName:string;
  
    EntityId:number=0;
    EntityName:string;
  
    lists = [
      { value: "1", viewValue: "Default" },
      { value: "2", viewValue: "Programmers" },
      { value: "3", viewValue: "Test" },
    ];
    invalid: boolean = false;
    IsMapped: boolean = false;
    OnlySelectedList: boolean = false;
    Listss: Array<any> = [];
    MyLists: MarketingList[] = [];
    searchTerm: FormControl = new FormControl();
    file: any;
    FileType: any;
    IsCSV:boolean=false;
    IsExcel:boolean=false;
    DisplayWarning: boolean = false;
    gridData: any;
    EntityFieldsList: any;
    settings: any;
    userDetails: UserDetails = null;
    UserId: any;
    CompanyId: number;
    temp: any;
    cols: any[] = [];
    objectKeys = Object.keys;
    objList: any[] = [];
    FileMapped: boolean = true;
    myobjlist: CSVRecord[] = [];
    itemsEndpoint: string = `${environment.apiEndpoint}`;
    ListNameFormControl = new FormControl("", [Validators.required]);
    ImportCSVForm: FormGroup;
  
    //matcher = new MyErrorStateMatcher();
    name = 'This is XLSX TO JSON CONVERTER';
    willDownload = false;
    constructor(
    public ImportDialogRef: MatDialogRef<ContactImportDoalog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
      private renderer: Renderer2,
      public httpClient: HttpClient,
      public snackBar: MatSnackBar,
      private CRMService: CRMService,
      private router: Router,
      private route: ActivatedRoute,
      private sessionService: SessionStorageService,
      private fb: FormBuilder,
    ) {
  

      this.userDetails = <UserDetails>this.sessionService.getUser();
      this.CompanyId = this.sessionService.getCompanyId();
  
      this.FileType = "CSV";
    }
    // ngAfterViewInit() {
    //   //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //   //Add 'implements AfterViewInit' to the class.
    //   this.getList();
    // }
  
    InitializeImportCSVForm() {
      this.ImportCSVForm = this.fb.group({
        EntityId: [0, [Validators.required]],
        EntityName: [null, [Validators.required]],
      });
    }
    OnEntityChange(e)
    {
      debugger;
      this.SelectedList = e.currentTarget.value;
  
      this.EntityId=e.currentTarget.value;
  
      if (this.SelectedList > 0) 
      {
        let EntityName=this.EntityItemsList.filter(x=>x.Id==this.SelectedList)[0].Name;
        this.SelectedEntityName=EntityName;
  
        this.ImportCSVForm.controls["EntityName"].setValue(EntityName);
  
        this.EntityName=EntityName;
  
      } else {
        this.SelectedEntityName="";
        this.EntityId=0;
        this.EntityName="";
      }
    }
  
    onListChange(event) {
      //debugger;
      this.SelectedList = event.value;
  
      if (this.SelectedList > 0) {
        this.OnlySelectedList = true;
      } else {
        this.OnlySelectedList = false;
      }
      //this.listname=this.Listss.filter(x=>x.ListId==this.SelectedList)[0].ListName;
    }
    ClickClose(e)
    {
        this.ImportDialogRef.close();
    }
    ngOnInit() {
  
      // Create instances of MyClass and add items
      const item1 = new MyDomainItems(2, 'Accounts');
      const item2 = new MyDomainItems(5, 'Contact');
      const item3 = new MyDomainItems(8, 'Lead');
  
      // Create an array to hold the items
      const itemList: MyDomainItems[] = [item1, item2,item3];
      this.EntityItemsList = itemList;
   
          
      this.InitializeImportCSVForm();

      if(this.data.EntityId>0)
      {
       this.ImportCSVForm.controls["EntityId"].setValue(this.data.EntityId); 
       this.ImportCSVForm.controls["EntityName"].setValue(this.data.EntityName);
       this.EntityName=this.data.EntityName;

       this.SelectedList=this.data.EntityId;
       this.SelectedListName=this.data.EntityName;
      }
      this.userDetails = <UserDetails>this.sessionService.getUser();
      this.CompanyId = this.sessionService.getCompanyId();
      this.UserId = this.userDetails.UserID;
  
      let csvinfo = new CSVRecord();
      csvinfo.Id = 1;
      csvinfo.Name = "First Name";
    
      this.EntityFieldsList = [
        {
          name: "select",
          value: "0",
        },
        {
          name: "FirstName",
          value: "1",
        },
        {
          name: "LastName",
          value: "2",
        },
        {
          name: "Title",
          value: "3",
        },
        {
          name: "Department",
          value: "4",
        },
        {
          name: "Email",
          value: "5",
        },
        {
          name: "Mobile",
          value: "6",
        },
        {
          name: "CreatedDate",
          value: "7",
        },
        {
          name: "Source",
          value: "8",
        },
  
        {
          name: "AccountName",
          value: "9",
        },
        {
          name: "Website",
          value: "10",
        },
        {
          name: "AnnualRevenue",
          value: "11",
        },
        {
          name: "Industry",
          value: "12",
        },
  
        {
          name: "LinkedinURL",
          value: "13",
        },
        {
          name: "MainPhone",
          value: "14",
        },
        {
          name: "Fax",
          value: "15",
        },
        {
          name: "Street",
          value: "16",
        },
        {
          name: "City",
          value: "17",
        },
        {
          name: "State",
          value: "18",
        },
        {
          name: "PostalCode",
          value: "19",
        },
        {
          name: "Country",
          value: "20",
        },
        {
          name: "Response",
          value: "21",
        },
        {
          name: "Status",
          value: "22",
        },
        {
          name: "Rating",
          value: "23",
        },
      ];
  
      //this.myobjlist=this.fieldsList;
    }
    //**************************************************************************************************************************/
    //Auto mapping CSV code starts here
    //**************************************************************************************************************************/
    MapCSVFields(e) 
    {
      const self = this;
      console.log("mapFields ");
      // if (this.ListNameFormControl.value == "" && this.OnlySelectedList == false) {
      //   this.MyListNameRef.nativeElement.focus();
      //   return false;
      // }
      if (this.file == null) {
        self.snackBar.open("Please Choose File", null, {
          duration: 5000,
          verticalPosition: "top",
          horizontalPosition: "right",
          panelClass: "stellify-snackbar",
        });
        return false;
      }
      this.FileMapped = false;
      //Read CSV
      //debugger;
      if (this.FileType == "CSV") {
        var reader = new FileReader();
        reader.onload = () => {
          console.log(reader.result);
          //debugger;
          this.gridData = this.CSV2JSON(reader.result);
  
          var obj = { a: this.gridData };
          this.gridData = JSON.parse(obj.a);
          this.temp = this.gridData[0];
        };
        reader.readAsText(this.file);
      }
      //Read Excel
      else if (this.FileType == "EXCEL") {
        //alert("Excel");
      }
      this.IsMapped = true;
    }
  
    MapExcelFields(e) 
    {
      const self = this;
      console.log("mapFields ");
      // if (this.ListNameFormControl.value == "" && this.OnlySelectedList == false) {
      //   this.MyListNameRef.nativeElement.focus();
      //   return false;
      // }
      if (this.file == null) {
        self.snackBar.open("Please Choose File", null, {
          duration: 5000,
          verticalPosition: "top",
          horizontalPosition: "right",
          panelClass: "stellify-snackbar",
        });
        return false;
      }
      this.FileMapped = false;
      //Read ExcelFile
      //debugger;
      if (this.FileType == "EXCEL") {
        let workBook = null;
      let jsonData = null;
      const reader = new FileReader();
      //const file = e.target.files[0];
      const file = this.file;
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary' });
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet);
          return initial;
        }, {});
        const dataString = JSON.stringify(jsonData);
  
        //debugger;
  
        let a =dataString;
        let b= {a: a};
        let c=JSON.parse(b.a);
        let d= c.Sheet1[0];
  
        this.temp=null;
        this.temp=d;
  
        console.log(this.temp);
        //debugger;
        // this.gridData=dataString;
        // var obj = { a: this.gridData };
        // this.gridData = JSON.parse(obj.a);
        // this.temp = this.gridData[0];
  
        this.IsMapped = true;
  
        document.getElementById('output').innerHTML = dataString.slice(0, 300).concat("...");
        this.setDownload(dataString);
  
  
  
      }
  
      reader.readAsBinaryString(file);
      }
      //Read Excel
      else if (this.FileType == "EXCEL") {
        //alert("Excel");
      }
      this.IsMapped = true;
    }
  
    onChange(event, k: any) 
    {
      debugger;
      let myvalue = event.target.value;
      console.log(myvalue);
      console.log(k);
      if (myvalue == 1) {
        this.objList.push({
          id: 1,
          Text: "FirstName=" + k,
        });
      }
      if (myvalue == 2) {
        this.objList.push({
          id: 2,
          Text: "LastName=" + k,
        });
      }
  
      if (myvalue == 3) {
        this.objList.push({
          id: 3,
          Text: "Title=" + k,
        });
      }
  
      if (myvalue == 4) {
        this.objList.push({
          id: 4,
          Text: "Department=" + k,
        });
      }
      if (myvalue == 5) {
        this.objList.push({
          id: 5,
          Text: "EmailId=" + k,
        });
      }
  
      if (myvalue == 6) {
        this.objList.push({
          id: 6,
          Text: "Mobile=" + k,
        });
      }
      if (myvalue == 7) {
        this.objList.push({
          id: 7,
          Text: "CreatedDate=" + k,
        });
      }
  
      if (myvalue == 8) {
        this.objList.push({
          id: 8,
          Text: "Source=" + k,
        });
      }
  
      if (myvalue == 9) {
        this.objList.push({
          id: 9,
          Text: "AccountName=" + k,
        });
      }
  
      if (myvalue == 10) {
        this.objList.push({
          id: 10,
          Text: "Website=" + k,
        });
      }
      if (myvalue == 11) {
        this.objList.push({
          id: 11,
          Text: "AnnualRevenue=" + k,
        });
      }
      if (myvalue == 12) {
        this.objList.push({
          id: 12,
          Text: "Industry=" + k,
        });
      }
   
      if (myvalue == 13) {
        this.objList.push({
          id: 13,
          Text: "LinkedinURL=" + k,
        });
      }
      if (myvalue == 14) {
        this.objList.push({
          id: 14,
          Text: "MainPhone=" + k,
        });
      }
  
      if (myvalue == 15) {
        this.objList.push({
          id: 15,
          Text: "Fax=" + k,
        });
      }
     
      if (myvalue == 16) {
        this.objList.push({
          id: 16,
          Text: "Street=" + k,
        });
      }
  
      if (myvalue == 17) {
        this.objList.push({
          id: 17,
          Text: "City=" + k,
        });
      }
  
      if (myvalue == 18) {
        this.objList.push({
          id: 18,
          Text: "State=" + k,
        });
      }
  
      if (myvalue == 19) {
        this.objList.push({
          id: 19,
          Text: "PostalCode=" + k,
        });
      }
  
      if (myvalue == 20) {
        this.objList.push({
          id: 20,
          Text: "Country=" + k,
        });
      }
  
  
      if (myvalue == 21) {
        this.objList.push({
          id: 21,
          Text: "Response=" + k,
        });
      }
  
      if (myvalue == 22) {
        this.objList.push({
          id: 22,
          Text: "Status=" + k,
        });
      }
  
      if (myvalue == 23) {
        this.objList.push({
          id: 23,
          Text: "Rating=" + k,
        });
      }
  
  
      console.log(this.objList);
    }
    
    uploadDocument() {
      debugger;
      const self = this;
      if (this.SelectedList == 0) 
      {
        if(this.ImportCSVForm.controls["EntityName"].value==null)
        {
          //this.ImportCSVForm.controls["EntityName"].markAsTouched();
          //this.renderer.selectRootElement('#EntityName').focus();
          //alert("Please Select Entity ");
          self.snackBar.open("Please Select Entity", null, {
            duration: 3000,
            verticalPosition: "top",
            horizontalPosition: "right",
            panelClass: "stellify-snackbar",
          });
  
          return false;
        }
        else{
          this.SelectedListName=this.ImportCSVForm.controls["EntityName"].value;
        }
      }
   
  
      let file1 = this.file;
  
      if (this.IsMapped) 
      {
        //Filter by list name
        let ExistedList = this.Listss.filter(
          (x) => x.ListName == this.SelectedListName
        );
        if (ExistedList.length > 0) {
          self.snackBar.open("List already existed", null, {
            duration: 5000,
            verticalPosition: "top",
            horizontalPosition: "right",
            panelClass: "stellify-snackbar",
          });
          return false;
        }
  
        //Check file choosen
        if (this.file == undefined) {
          self.snackBar.open("Please Choose The File To Upload", null, {
            duration: 5000,
            verticalPosition: "top",
            horizontalPosition: "right",
            panelClass: "stellify-snackbar",
          });
          return false;
        }
  
        console.log(file1);
        if (this.objList.length == 0) {
          self.snackBar.open("Please Map Fields", null, {
            duration: 5000,
            verticalPosition: "top",
            horizontalPosition: "right",
            panelClass: "stellify-snackbar",
          });
          return false;
        }
        var b = JSON.stringify(this.objList);
  
  
        //this.blockUI.start("Accessing The CSV "); // Start blocking
        //debugger;
  
        let formData: FormData = new FormData();
        formData.append("uploadFile", file1, file1.name);
        formData.append("csdata", b);
        formData.append("EntityId", this.data.EntityId.toString());
        formData.append("EntityName", this.data.EntityName);
        formData.append("FileType", this.FileType);
  
        let fileUploadRoute = environment.apiEndpoint + "CSVAutomapUpload" + `/${0}/${this.UserId}`;
        //debugger;
        this.CRMService.UploadEntity(formData, this.uploadedFiles,this.EntityId,this.EntityName, this.UserId, this.CompanyId)
          .subscribe((data:any) => {
            debugger;
            //ErrorMessage
  
            this.blockUI.stop();
            if (data.Status == "SUCCESS") {
              this.ListId=data.Data;
              console.log("success"),
                self.snackBar.open("Uploaded Successfully", null, {
                  duration: 3000,
                  verticalPosition: "top",
                  horizontalPosition: "right",
                  panelClass: "stellify-snackbar",
                });
              this.blockUI.start("Uploaded Successfully..."); // Start blocking
              setTimeout(() => {
                this.blockUI.stop(); // Stop blocking
                //crm/crmconnectionsdetails/VIEW/2014
               
                this.data.SaveClick="YES";
                this.ImportDialogRef.close(this.data);
                // let n =Math.ceil(Math.random() * 10);
                
                // this.router.navigate([`/crm/contactslist/${n}`]);

                
                //this.router.navigate(["/email/view"]);
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
  
       
      } 
      else 
      {
        self.snackBar.open("Please map the field 1st before upload", null, {
          duration: 5000,
          verticalPosition: "top",
          horizontalPosition: "right",
          panelClass: "stellify-snackbar",
        });
      }
    }
  
    // this.http.post(`${this.apiEndPoint}`, formData, options)
    // .map(res => res.json())
    // .catch(error => Observable.throw(error))
    // .subscribe(
    //     data => console.log('success'),
    //     error => console.log(error)
    // )
  
    myUploader(event: any) {
      console.log(event);
    }
  
    showFile(event: any) {
      console.log(event);
    }
    //***********************************************************************************************************************/
    //Excel File read
    //***********************************************************************************************************************/
    incomingfile(event) {
      this.ExcelFile = event.target.files[0];
    }
  
    // Upload() {
    //   let fileReader = new FileReader();
    //   fileReader.onload = (e) => {
    //     this.arrayBuffer = fileReader.result;
    //     var data = new Uint8Array(this.arrayBuffer);
    //     var arr = new Array();
    //     for (var i = 0; i != data.length; ++i)
    //       arr[i] = String.fromCharCode(data[i]);
    //     var bstr = arr.join("");
    //     var workbook = XLSX.read(bstr, { type: "binary" });
    //     var first_sheet_name = workbook.SheetNames[0];
    //     var worksheet = workbook.Sheets[first_sheet_name];
    //     console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
    //   };
    //   fileReader.readAsArrayBuffer(this.ExcelFile);
    // }
  
    //***********************************************************************************************************************/
    fileReset() {
      this.fileUploadVar.nativeElement.value = "";
      this.file = null;
    }
    onFileChange(ev) {
      let workBook = null;
      let jsonData = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      reader.onload = (event) => {
        const data = reader.result;
        workBook = XLSX.read(data, { type: 'binary' });
        jsonData = workBook.SheetNames.reduce((initial, name) => {
          const sheet = workBook.Sheets[name];
          initial[name] = XLSX.utils.sheet_to_json(sheet);
          return initial;
        }, {});
        const dataString = JSON.stringify(jsonData);
        document.getElementById('output').innerHTML = dataString.slice(0, 300).concat("...");
        this.setDownload(dataString);
      }
      reader.readAsBinaryString(file);
    }
    setDownload(data) {
      this.willDownload = true;
      setTimeout(() => {
        const el = document.querySelector("#download");
        el.setAttribute("href", `data:text/json;charset=utf-8,${encodeURIComponent(data)}`);
        el.setAttribute("download", 'xlsxtojson.json');
      }, 1000)
    }
    public changeListener(files: FileList){
      console.log(files);
      debugger;
      if(files && files.length > 0) {
         let file : File = files.item(0); 
           console.log(file.name);
           console.log(file.size);
           console.log(file.type);
           let reader: FileReader = new FileReader();
           reader.readAsText(file);
           reader.onload = (e) => {
              let csv: string = reader.result as string;
              console.log(csv);
           }
        }
    }
    fileChanged(e: any) {
      const self = this;
      const elem = e.target;
  
      this.objList = [];
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
  
      //debugger;
      if(this.FileType=="EXCEL")
      {
        this.IsExcel=true;
        this.IsCSV=false;
      }
      else
      {
        this.IsCSV=true;
        this.IsExcel=false;
  
      }
  
      //**********************************************************************************************************/
      //Display Warning If File Attached is Not CSV
      //**********************************************************************************************************/
      // if (this.FileType != "CSV") 
      // {
  
      //  this.DisplayWarning = true;
      //   self.snackBar.open("Only CSV File Allowed", null, {
      //     duration: 3000,
      //     verticalPosition: "top",
      //     horizontalPosition: "right",
      //     panelClass: "stellify-snackbar",
      //   });
  
      //   setTimeout(() => {
      //     this.DisplayWarning = false;
      //   }, 500);
      //   return false;
      // }
      //**********************************************************************************************************/
  
    }
  //**********************************************************************************************************/
  //CSV 2 JSON Conversion
  //**********************************************************************************************************/
    CSV2JSON(csv: any) {
      var array = this.CSVToArray(csv);
      var objArray = [];
      for (var i = 1; i < array.length - 1; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
          var key = array[0][k];
          objArray[i - 1][key] = array[i][k];
        }
      }
  
      var json = JSON.stringify(objArray);
      var str = json.replace(/},/g, "},\r\n");
  
      return str;
    }
  //**********************************************************************************************************/
  //CSV to Array
  //**********************************************************************************************************/
    CSVToArray(strData: any) {
      // Check to see if the delimiter is defined. If not,
      // then default to comma.
      let strDelimiter = ",";
      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp(
        // Delimiters.
        "(\\" +
        strDelimiter +
        "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        '(?:"([^"]*(?:""[^"]*)*)"|' +
        // Standard fields.
        '([^"\\' +
        strDelimiter +
        "\\r\\n]*))",
        "gi"
      );
      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData: Array<any> = [[]];
      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;
      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while ((arrMatches = objPattern.exec(strData))) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
          // Since we have reached a new row of data,
          // add an empty row to our data array.
          arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
          // We found a quoted value. When we capture
          // this value, unescape any double quotes.
          var strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
        } else {
          // We found a non-quoted value.
          var strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
      }
      // Return the parsed data.
      return arrData;
    }
  //**********************************************************************************************************/
  //**************************************************************************************************************************/
  //Auto mappint CSV code starts here
  //**************************************************************************************************************************/
  onSubmit(ImportCSVForm: any,  e) {
    console.log(ImportCSVForm);
  }
  
  
  }
//*******************************************************************************************************************************/
//Contacts Import Ends Here
//*******************************************************************************************************************************/









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