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
import { AccountsFilterModel, ContactsFilterModel, DateObj, LeadsFilterModel, OpportunityFilterModel } from '../../models/crm.models';
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

@Component({
  selector: 'app-opportunitieslist',
  templateUrl: './opportunitieslist.component.html',
  styleUrls: ['./opportunitieslist.component.css']
})
export class OpportunitieslistComponent implements OnInit {

    //Variable Starts
    // prepareRoute(outlet: RouterOutlet) {
    //     return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
    //   }
    private result;
    showLoadingIcon: boolean = false;
    MyLead: Lead;
    MyLeadIds = [];
    userDetails: UserDetails = null;
    CompanyId: number;
    UserId:any;
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
    cols: any[] = [];
    currencyTypes: Currency[] = [];
    filterMessage: string = "";
    SelectedName: string;
    NameValidate: string = "";
    seletedValue: string = "";
    showLeftPanelLoadingIcon: boolean = false;
    OpportunityListsCols: any[];
    OpportunityLists: any[] = [];
    LeadId: any;
    TotalRecords: number = 0;
    OpportunityFilterInfoForm: FormGroup;
    public selectedItems: any[];
    SelectedAccounts: string = '';
    TotalSelectedAccounts: number = 0;
    ExportTotalContacts:boolean=false;
    FilterLeadsLists: any[] = [];
    OpportunityListsPagerConfig: PagerConfig;
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
        this.OpportunityListsPagerConfig.RecordsToSkip = 0;
        this.OpportunityListsPagerConfig.RecordsToFetch = 25;

        this.currentPage = 1;
    }

    initializeFilterForm(): void {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        //FromDate: [oneMonthAgo.toISOString().substring(0, 10)],
        //ToDate: [today.toISOString().substring(0, 10)],

        this.OpportunityFilterInfoForm = this.formBuilderObj.group({
            OppNo:[''],
            OppTopic:['',[Validators.required]],
            AccountId:[''],
            ContactId:[''],
            CreatedBy:[0],
            UserId:[0],
            AccountName:[''],
            Mobile:[''],
            EmailId:['']

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
        this.initializeFilterForm();

        //TotalSelectedAccounts
        this.TotalSelectedAccounts=0;
      
        this.OpportunityListsPagerConfig = new PagerConfig();
        this.ResetPagerConfig();
        this.OpportunityListsCols = [
            //{ field: '', header: '', width: '30px' },
            { field: 'FirstName', header: 'First Name', width: '100px' },
            { field: 'LastName', header: 'Last Name', width: '100px' },
            { field: 'CompName', header: 'Company', width: '100px' },
            { field: 'CreatedDate', header: 'Created on', width: '100px' },
            { field: '', header: 'Action', width: '50px' },
        ];


        
        //this.SetIntialDates();

        this.FilterData();

    }

    //*********************************************************************************************************/
    //Sorting Functions
    //*********************************************************************************************************/
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
    //*********************************************************************************************************/

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
        this.SearchOpportunity();
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

        this.OpportunityFilterInfoForm.controls.FromDate.setValue({
            year: FirstDateYear,
            month: FirstDateMonth,
            day: FirstDateDay
        });

        this.OpportunityFilterInfoForm.controls.ToDate.setValue({
            year: CurrentDateYear,
            month: CurrentDateMonth,
            day: CurrentDateDay
        });
        //**********************************************************************************************************************

    }

    SearchOpportunity(OpportunityFilterData?: OpportunityFilterModel) {
        //debugger;
        if(OpportunityFilterData.OppNo!=null)
        {
            this.SearchAccountName=OpportunityFilterData.OppNo;
        }

        if(OpportunityFilterData.OppTopic!=null)
        {
            this.SearchAccountName=OpportunityFilterData.OppTopic;
        }
        this.UserId=this.userDetails.UserID;
        let OpportunitySearchInput = {
            Skip: this.OpportunityListsPagerConfig.RecordsToSkip,
            Take: this.OpportunityListsPagerConfig.RecordsToFetch,
            OppNo:OpportunityFilterData.OppNo,
            OppTopic:OpportunityFilterData.OppTopic,
            UserId:this.UserId

        };
        this.showLeftPanelLoadingIcon = true;
        this.CRMService.SearchOpportunity(OpportunitySearchInput)
            .subscribe((data: any) => {
                //debugger;
                this.showLeftPanelLoadingIcon = false;
                this.TotalRecords = data.TotalRecords;
                debugger;
                if (data.TotalRecords > 0) {
                    //debugger;
                    this.TotalRecords = data.TotalRecords;
                    this.OpportunityLists = data.Opportunities;
                    this.FilterLeadsLists = data.Opportunities;
                    this.OpportunityListsPagerConfig.TotalRecords = data.TotalRecords;

                }
                else {
                    this.TotalRecords = data.TotalRecords;
                    this.OpportunityLists = data.Opportunities;
                    this.FilterLeadsLists = data.Opportunities;
                    this.OpportunityListsPagerConfig.TotalRecords = data.TotalRecords;
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
        debugger;
        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.OpportunityListsPagerConfig.RecordsToSkip = this.OpportunityListsPagerConfig.RecordsToFetch * (currentPageNumber - 1);
         
            this.FilterData();
        }
       
    }
    EditOpportunity(OppId) 
    {
        const self = this;
        this.router.navigate([`/crm/opportunities/${'EDIT'}/${OppId}/1`]);
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
        if(this.TotalSelectedAccounts==0)
        {
            this.SelectedAccounts="";
        }
        //alert("Un Selected Leads : " + this.SelectedAccounts + "\n Total Un Selected Leads : " + this.TotalSelectedAccounts);
    }

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
    ClickNewOpportunity(event) {
        this.router.navigate([`/crm/opportunities/${'NEW'}/${0}/1`]);
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

    FilterData() {
        //debugger;

        this.filterMessage = "";
        //let poFilterData:PurchaseOrderFilterModel = this.ContactFilterInfoForm.value;
        let poFilterData: OpportunityFilterModel = this.OpportunityFilterInfoForm.value;
       
        if (this.OpportunityFilterInfoForm.get('OppNo').value != null) {
            poFilterData.OppNo = this.OpportunityFilterInfoForm.get('OppNo').value;
        }
        if (this.OpportunityFilterInfoForm.get('OppTopic').value != null) {
            poFilterData.OppTopic = this.OpportunityFilterInfoForm.get('OppTopic').value;
        }
        if (this.OpportunityFilterInfoForm.get('AccountId').value != null) {
            poFilterData.AccountId = this.OpportunityFilterInfoForm.get('AccountId').value;
        }
        if (this.OpportunityFilterInfoForm.get('ContactId').value != null) {
            poFilterData.ContactId = this.OpportunityFilterInfoForm.get('ContactId').value;
        }
        //Call API 
        this.SearchOpportunity(poFilterData);

    }

    //*********************************************************************************************************************/
    //Export Code Starts Here
    //*********************************************************************************************************************/
    ExportToCSV() {
        if (this.TotalSelectedAccounts == 0) {

            this.ExportTotalContacts=true;
            //alert("Please Select atleast 1 contact ");
        }
        else
        {
            this.ExportTotalContacts=false;
        }
       
        if(this.ExportTotalContacts)
        {
            alert("Exporting CSV All Contacts " + this.TotalRecords);
        }
        else
        {
            alert("Exporting CSV Selected Contacts " + this.TotalSelectedAccounts);
        }
    }

    ExportToExcel() {
        if (this.TotalSelectedAccounts == 0) {
            this.ExportTotalContacts=true;
            //alert("Please Select atleast 1 contact ");
        }
        else
        {
            this.ExportTotalContacts=false;
        }
        if(this.ExportTotalContacts)
        {
            alert("Exporting Excel All Contacts " + this.TotalRecords);
        }
        else
        {
            alert("Exporting Excel Selected Contacts " + this.TotalSelectedAccounts);
        }
    }

    ExportToPDF() {
        if (this.TotalSelectedAccounts == 0) {
            this.ExportTotalContacts=true;
            //alert("Please Select atleast 1 contact ");
        }
        else
        {
            this.ExportTotalContacts=false;
        }

        if(this.ExportTotalContacts)
        {
            alert("Exporting PDF All Contacts " + this.TotalRecords);
        }
        else
        {
            alert("Exporting PDF Selected Contacts " + this.TotalSelectedAccounts);
        }
    }
    //*********************************************************************************************************************/
    //Export Code Ends Here
    //*********************************************************************************************************************/
    OnNameFilterChange(event: any) {
        debugger;
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


}
