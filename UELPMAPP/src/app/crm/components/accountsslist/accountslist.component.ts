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
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { AccountsFilterModel, ContactsFilterModel, DateObj, LeadsFilterModel } from '../../models/crm.models';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SharedService } from '../../../shared/services/shared.service';
import { trigger, state, style, animate, transition, query, group } from '@angular/animations';
import { fadeAnimation } from '../../services/fadeAnimation';
import { Fade } from '../../animations/fade.animation';
import { SlideInOutAnimation, fader } from '../../animations/animations';
import { LeadsearchComponent } from '../../leadsearch/leadsearch.component';
import { MatDialog } from '@angular/material';
import { LeadsearchmodalComponent } from '../../leadsearchmodal/leadsearchmodal.component';
import { LeadfilterComponent } from '../leadfilter/leadfilter.component';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';

import { ExportToCsv } from 'export-to-csv';
import { ExcelJson } from '../../../../app/po/components/interfaces/excel-json.interface';
import { ExportService } from '../../../../app/po/services/export.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';  
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Contacts } from '../../models/ContactDTO';
import { Accounts } from '../../models/AccountsDTO';

interface People {
    firstname?: string;
    lastname?: string;
    age?: string;
}

@Component({
    selector: 'app-accountslist',
    templateUrl: './accountslist.component.html',
    styleUrls: ['./accountslist.component.css'],
 })
export class AccountslistComponent implements OnInit,AfterViewInit  {

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
    UserId:any;

    DealsListsPagerConfig: PagerConfig;
    AppViewsList = [];
    ModuleId:number;
    FormId:number;
    ViewId:number;
    
    DefaultViewId:number=0;
    @ViewChild('ContactsListTable') dt: Table;
    i:number=0;
    LeadSourceListSettings = {};
    SelectedAccountsourceId:string="";
    SelectedAccountsourceName:string="";
    @ViewChild('LeadSearchDiv') ELeadSearchDiv: ElementRef;
    //@ViewChild('LeadSearchDiv') divHello: ElementRef;
    @ViewChild('hello') divHello: ElementRef;
    LeadSourceList = [];
    Skip:number=0;
    Take:number=0;
    SearchAccountName:string="";
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
    AccountsListsCols: any[];
    AccountsLists: any[] = [];
    FilterAccountsLists:Accounts[] = [];
    ExportAccountsLists:Accounts[] = [];
    AccountInfo:Accounts;
    LeadId: any;
    TotalRecords: number = 0;
    AccountFilterInfoForm: FormGroup;
    public selectedItems: any[];
    SelectedAccounts: string = '';
    TotalSelectedAccounts: number = 0;
    ExportTotalContacts:boolean=false;
    AccountsListsPagerConfig: PagerConfig;
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
        this.AccountsListsPagerConfig.RecordsToSkip = 0;
        this.AccountsListsPagerConfig.RecordsToFetch = 25;

        this.currentPage = 1;
    }


    initializeFilterForm(): void {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        //FromDate: [oneMonthAgo.toISOString().substring(0, 10)],
        //ToDate: [today.toISOString().substring(0, 10)],

        this.AccountFilterInfoForm = this.formBuilderObj.group({
            AccountName:[''],
            MainPhone:[''],
            Mobile:[''],
            EmailId:[''],
            ViewId:[0]
        });

        // this.companyFilterInfoForm = this.formBuilderObj.group({
        //     CompanyName: [''],
        //     CompanyCode: [''],
        //     Country: [''],
        //     FromDate: [],
        //     ToDate: []
        //   });
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

        this.ModuleId=1;
        this.FormId=1;
        this.ViewId=17;
        this.DefaultViewId=1;

        this.initializeFilterForm();

        //TotalSelectedAccounts
        this.TotalSelectedAccounts=0;
      
        this.AccountsListsPagerConfig = new PagerConfig();
        this.ResetPagerConfig();
        this.AccountsListsCols = [
            //{ field: '', header: '', width: '30px' },
            { field: 'AccountName', header: 'Account', width: '100px' },
            { field: 'MainPhone', header: 'Main Phone', width: '100px' },
            { field: 'Mobile', header: 'Mobile', width: '100px' },
            { field: 'EmailId', header: 'EmailId', width: '100px' },
            { field: 'CreatedDate', header: 'Created on', width: '100px' },
            { field: '', header: 'Action', width: '50px' },
        ];

        this.SearchAppViews();

        //this.FilterData();

    }
//*************************************************************************************************************/
//Sorting Functions
//*************************************************************************************************************/
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
      
//*************************************************************************************************************/

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
        this.SearchAccounts();
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

        this.AccountFilterInfoForm.controls.FromDate.setValue({
            year: FirstDateYear,
            month: FirstDateMonth,
            day: FirstDateDay
        });

        this.AccountFilterInfoForm.controls.ToDate.setValue({
            year: CurrentDateYear,
            month: CurrentDateMonth,
            day: CurrentDateDay
        });
        //**********************************************************************************************************************

    }

    SearchAccounts(ContactsFilterData?: AccountsFilterModel) {
        //debugger;
        if(ContactsFilterData.AccountName!=null)
        {
            this.SearchAccountName=ContactsFilterData.AccountName;
        }


        this.UserId=this.userDetails.UserID;
        let LeadSearchInput = {
            Skip: this.AccountsListsPagerConfig.RecordsToSkip,
            Take: this.AccountsListsPagerConfig.RecordsToFetch,
            AccountName:this.SearchAccountName,
            MainPhone:ContactsFilterData.MainPhone,
            Mobile:ContactsFilterData.Mobile,
            EMailId:ContactsFilterData.EmailId,
            UserId:this.UserId,
            ViewId:this.ViewId

        };
        this.showLeftPanelLoadingIcon = true;
        this.CRMService.SearchAccountsWithViews(this.ModuleId,this.FormId,this.ViewId, LeadSearchInput)
            .subscribe((data: any) => {
                debugger;
                this.showLeftPanelLoadingIcon = false;
                this.TotalRecords = data.TotalRecords;
                //debugger;
                this.IsFilterDataArrive=true;
                if (data.TotalRecords > 0) {
                    //debugger;
                    this.TotalRecords = data.TotalRecords;
                    this.AccountsLists = data.Accounts;
                    this.FilterAccountsLists=data.Accounts;
                    this.AccountsListsPagerConfig.TotalRecords = data.TotalRecords;

                }
                else {
                    this.TotalRecords = data.TotalRecords;
                    this.AccountsLists = data.Accounts;
                    this.AccountsListsPagerConfig.TotalRecords = data.TotalRecords;
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
    
    pageChange(currentPageNumber: any) {
        //debugger;
        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.AccountsListsPagerConfig.RecordsToSkip = this.AccountsListsPagerConfig.RecordsToFetch * (currentPageNumber - 1);
         
            this.FilterData();
        }
       
    }
    EditAccount(leadid) 
    {
        const self = this;
        this.router.navigate([`/crm/accounts/${'EDIT'}/${leadid}/2`]);
    }
    
//************************************************************************************************************/
//Grid Functions Multiple Record Selection 
//************************************************************************************************************/
onRowSelect(event) {
    let i = 0;
    this.SelectedAccounts = "";
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedAccounts == "") {
            this.SelectedAccounts = this.selectedItems[i].Id;
        }
        else {
            this.SelectedAccounts = this.SelectedAccounts + "," + this.selectedItems[i].Id;
        }
    }
    this.TotalSelectedAccounts = this.selectedItems.length;
    //alert("Selected Leads : " + this.SelectedAccounts + "\n Total Selected Leads : " + this.TotalSelectedAccounts);
}
onRowUnselect(event) {
    let i = 0;
    this.SelectedAccounts = "";
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedAccounts == "") {
            this.SelectedAccounts = this.selectedItems[i].Id;
        }
        else {
            this.SelectedAccounts = this.SelectedAccounts + "," + this.selectedItems[i].Id;
        }
    }
    this.TotalSelectedAccounts = this.selectedItems.length;
    if (this.TotalSelectedAccounts == 0) {
        this.SelectedAccounts = "";
    }
    //alert("Un Selected Leads : " + this.SelectedAccounts + "\n Total Un Selected Leads : " + this.TotalSelectedAccounts);
}
//************************************************************************************************************/


    ClickSelected(event) {
        debugger;
        let i = 0;

        this.SelectedAccounts = "";
        if(this.selectedItems !=null)
        {
            for (i = 0; i <= this.selectedItems.length - 1; i++) {
                if (this.SelectedAccounts == "") {
                    this.SelectedAccounts = this.selectedItems[i].Id;
                }
                else {
                    this.SelectedAccounts = this.SelectedAccounts + "," + this.selectedItems[i].Id;
                }
            }
            this.TotalSelectedAccounts = this.selectedItems.length;

            //alert("Selected Leads : " + this.SelectedAccounts + "\n Total Selected Leads : " + this.TotalSelectedAccounts);

        }
    }
    ClickShow(event)
    {
        this.showtest=!this.showtest;
    }
    ClickNewAccount(event) {
        this.router.navigate([`/crm/accounts/${'NEW'}/${0}/2`]);
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
    OnViewChange(e)
    {
        debugger;
        this.ViewId=e.currentTarget.value;
        this.FilterData();
    }
    SearchAppViews() {
        
        //debugger;

        this.UserId=this.userDetails.UserID;
        let AppViewsInput = {
            Skip: this.AccountsListsPagerConfig.RecordsToSkip,
            Take: this.AccountsListsPagerConfig.RecordsToFetch,
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

                //et DefaultViewId= this.AppViewsList.filter(x=>x.IsPinned==true)[0].ViewId;

                let DefaultViewId=data.AppViews.filter(x=>x.IsPinned==true)[0].ViewId;

                this.DefaultViewId=DefaultViewId;
                this.ViewId=this.DefaultViewId;

                this.AccountFilterInfoForm.controls["ViewId"].setValue(this.ViewId);

                //this.SearchLeadsViews();
                this.FilterData();
                
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    FilterData() {
        //debugger;

        this.filterMessage = "";
        //let poFilterData:PurchaseOrderFilterModel = this.ContactFilterInfoForm.value;
        let poFilterData: AccountsFilterModel = this.AccountFilterInfoForm.value;
       
        if (this.AccountFilterInfoForm.get('AccountName').value != null) {
            poFilterData.AccountName = this.AccountFilterInfoForm.get('AccountName').value;
        }
        if (this.AccountFilterInfoForm.get('MainPhone').value != null) {
            poFilterData.MainPhone = this.AccountFilterInfoForm.get('MainPhone').value;
        }
        if (this.AccountFilterInfoForm.get('Mobile').value != null) {
            poFilterData.Mobile = this.AccountFilterInfoForm.get('Mobile').value;
        }
        if (this.AccountFilterInfoForm.get('EmailId').value != null) {
            poFilterData.EmailId = this.AccountFilterInfoForm.get('EmailId').value;
        }
        //Call API 
        this.SearchAccounts(poFilterData);

    }

        OnNameFilterChange(event: any) {
        //debugger;
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
    if (this.TotalSelectedAccounts == 0) {
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
    if (this.TotalSelectedAccounts == 0) {
        alert("Please Select atleast 1 lead ");
    }
    else
    {
        alert("Assiging Selected Leads ");
    }
}
ClickDelete(event)
{
    if (this.TotalSelectedAccounts == 0) {
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

        //debugger;
        //Set Records To Fetch
        this.AccountsListsPagerConfig.RecordsToSkip = 0;
        this.AccountsListsPagerConfig.RecordsToFetch = 0;

        this.FilterData();
        this.interval = setTimeout(() => {
            //alert("Alert activated")
            //debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                this.ResetPagerConfig();
                if (this.FilterAccountsLists.length > 0) {
                    //Fill Contacts Lists
                    // this.FilterAccountsLists.forEach(element => {
                    //     console.log(element);
                    //     debugger;

                    //     this.AccountInfo.Id=element.Id;
                    //     this.AccountInfo.AccountName=element.AccountName;

                    //     this.ExportAccountsLists.push(this.AccountInfo);

                    // });
                    

                    //alert("Total Records CSV : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                    const options = {
                        fieldSeparator: ',',
                        quoteStrings: '"',
                        decimalSeparator: '.',
                        showLabels: true,
                        //showTitle: true,
                        //title: 'Accounts List',
                        useTextFile: false,
                        useBom: true,
                        filename:'AccountsLists',
                        headers: ['Id','AcctNo','AccountName','MainPhone','OtherPhone','Mobile','EmailId','IndsId','NoOfEmployees','Website','CreatedBy','CreatedDate','UpdatedBy','UpdatedDate']
                    };
                    const csvExporter = new ExportToCsv(options);
                    csvExporter.generateCsv(this.FilterAccountsLists);
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
                { A: 'Account', B: 'Main Phone', C: 'Mobile',D: 'Email',E:'Created On' }, // table header
            ],
            skipHeader: true
        };
        this.FilterAccountsLists.forEach(account => {
            udt.data.push({
                A: account.AccountName,
                B: account.MainPhone,
                C: account.Mobile,
                D: account.EmailId,
                E: account.CreatedDate
            });
        });
        edata.push(udt);

        this.exportService.exportJsonToExcel(edata, 'FilterAccountsLists');
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
       //debugger;

       this.blockUI.start("Preparing Data...!!!"); // Start blocking
       this.FilterData();
       this.interval = setTimeout(() => {
           //alert("Alert activated")
           //debugger;
           if (this.IsFilterDataArrive) {
               debugger;
               this.blockUI.start("Exporting Data...!!!"); // Start blocking
               if (this.FilterAccountsLists.length > 0) {
                   //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                   //this.exportToExcel();
                   const edata: Array<ExcelJson> = [];
                   const udt: ExcelJson = {
                       data: [
                           { A: 'Leads Lists' }, // title
                           { A: 'Account', B: 'Main Phone', C: 'Mobile',D: 'Email',E:'Created On' }, // table header
                       ],
                       skipHeader: true
                   };
                   this.FilterAccountsLists.forEach(polist => {
                       udt.data.push({
                           A: polist.AccountName,
                           B: polist.MainPhone,
                           C: polist.Mobile,
                           D: polist.EmailId,
                           E: polist.CreatedDate
                       });
                   });
                   edata.push(udt);

                   this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                   this.FileNo=Math.ceil(Math.random() * 10);
                   this.FileName="AccountsLists_" + this.CurrentDate+"_"+this.FileNo.toString();

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
        //debugger;

        //Get Filter Data
        this.blockUI.start("Preparing Data...!!!"); // Start blocking
        this.FilterData();

        this.interval = setTimeout(() => {
            //alert("Alert activated")
           // debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                if (this.FilterAccountsLists.length > 0) {
                    //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

                    this.exportColumns = this.AccountsListsCols.map((col) => ({
                        title: col.header,
                        dataKey: col.field,
                    }));

                    //Remove Action Column
                    this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                    const doc = new jsPDF('p', 'pt');
                    doc['autoTable'](this.SelexportColumns, this.FilterAccountsLists);
                    // doc.autoTable(this.exportColumns, this.products);

                    this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                    this.FileNo=Math.ceil(Math.random() * 10);
                    this.FileName="AccountsList_" + this.CurrentDate+"_"+this.FileNo.toString();

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



}



