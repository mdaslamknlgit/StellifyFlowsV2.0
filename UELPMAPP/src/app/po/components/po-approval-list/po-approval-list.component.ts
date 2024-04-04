import { Component, OnInit, ViewChild, Renderer } from "@angular/core";
import { POApprovalService } from "../../services/po-approval.service";
import { PurchaseOrderList, PurchaseOrderDisplayResult, PurchaseOrderTypes } from "../../models/po-creation.model";
import { PagerConfig, Messages, MessageTypes, UserDetails, Suppliers, WorkFlowStatus, PurchaseOrderType } from "../../../shared/models/shared.model";
import { WorkflowAuditTrail } from "../../models/workflow-audittrail.model";
import { SharedService } from "../../../shared/services/shared.service";
import { PoApproval, PoApprovalUpdateStatus } from "../../models/po-approval.model";
import { SessionStorageService } from "../../../shared/services/sessionstorage.service";
import { ActivatedRoute, Router } from "@angular/router";
import { POCreationService } from "../../services/po-creation.service";
import { Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap, catchError } from "rxjs/operators";
import { FormGroup, FormBuilder } from "@angular/forms";
import { getProcessId } from "../../../shared/shared";
import { PageAccessLevel, Roles } from "../../../administration/models/role";
import { PurchaseOrderFilterModel, DateObj } from "../../models/po-creation.model";
import * as moment from 'moment';
import { DatePipe } from '@angular/common';

import { ExportService } from '../../services/export.service';
import { ExcelJson } from '../interfaces/excel-json.interface';
import { ExportToCsv } from 'export-to-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
@Component({
    selector: 'app-po-approval-list',
    templateUrl: './po-approval-list.component.html',
    styleUrls: ['./po-approval-list.component.css'],
    providers: [POApprovalService, POCreationService]
})
export class PoApprovalListComponent implements OnInit {
    FileName:string="";
    FileNo:number=0;
    CurrentDate:string="";
    exportColumns;
    SelexportColumns;
    PurchaseOrderType:any;
    IsFilterDataArrive: boolean = false;
    interval;
    HideTable: boolean = false;
    hideText?: boolean = null;
    @ViewChild('poCode') private porCodeRef: any;
    errorMessage: string = Messages.NoRecordsToDisplay;
    purchaseOrdersList: Array<PurchaseOrderList> = [];
    FilterPurchaseOrdersList: Array<PurchaseOrderList> = [];
    PurchaseOrdersListsCols: any[];
    purchaseOrderPagerConfig: PagerConfig;
    FilterPurchaseOrderPagerConfig: PagerConfig;

    companyId: number;
    selectedPurchaseOrderTypeId: number = 0;
    selectedPurchaseOrderId: number = 0;
    purchaseOrderSearchKey: string = "";
    leftSection: boolean = false;
    IsList:boolean=true;
    showdilogbox:boolean=false;
    auditTrailComments: Array<WorkflowAuditTrail> = [];
    remarks: string = "";
    TotalRecords:number;
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
    //***

    isApprovalPage: boolean = true;
    showLeftPanelLoadingIcon: boolean = false;
    purchaseOrderTypes: Array<PurchaseOrderTypes> = [];
    filterMessage: string = "";
    poFilterInfoForm: FormGroup;
    showFilterPopUp: boolean = false;
    isFilterApplied: boolean = false;
    purchaseOrderType = PurchaseOrderType;
    currentPage: number = 1;
    workFlowStatus: any;
    approvePermission: boolean;
    printPermission: boolean;
    showPrintButton: boolean = false;
    SupplierNameValidate: string = "";
    viewLogPermission: boolean = false;
    showLogPopUp: boolean = false;
    public innerWidth: any;
    userDetails: UserDetails = null;
    userRoles = [];
    rolesAccessList = [];
    showfilters:boolean=true;
    showfilterstext:string="Show List" ;

    constructor(private poApprovalServiceObj: POApprovalService,
        private router: Router,
        private exportService: ExportService,
        private sharedServiceObj: SharedService,
        public sessionService: SessionStorageService,
        public activatedRoute: ActivatedRoute,
        private pocreationObj: POCreationService,
        private formBuilderObj: FormBuilder,
        private datePipe: DatePipe,
        private renderer: Renderer) {
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();
        this.purchaseOrderSearchKey = "";
        
        this.workFlowStatus = WorkFlowStatus;
    }

    navigate() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels == null || roleAccessLevels == false) {
            this.sharedServiceObj.getUserRolesByCompany(this.userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
                this.userRoles = roles;
                this.userDetails.Roles = this.userRoles;
                this.sessionService.setUser(this.userDetails);
                let roleIds = Array.prototype.map.call(this.userDetails.Roles, s => s.RoleID).toString();
                if (roleIds != '') {
                    this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
                        this.rolesAccessList = data;
                        this.sessionService.setRolesAccess(this.rolesAccessList);
                        this.setRoles();
                    });
                }
            });
        }
        this.setRoles();

        this.activatedRoute.queryParamMap.subscribe((data) => {
            console.log("param change", data);
            const id: number = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
            this.purchaseOrderSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');
            let processId = Number(this.activatedRoute.snapshot.queryParamMap.get('processId'));
            let cId = this.companyId;//Number(this.activatedRoute.snapshot.queryParamMap.get('cId'));  
            if (this.purchaseOrderSearchKey != "" && this.purchaseOrderSearchKey != null) {
                // this.searchForPurchaseOrdersApprovals(0,processId,id,cId);             
                this.searchForPurchaseOrdersApprovals(0, processId, id);
            }
            else if (id != undefined && id != 0 && id != null) {
                //this.searchForPurchaseOrdersApprovals(0,processId,id,cId);
                this.searchForPurchaseOrdersApprovals(0, processId, id);
            }
            else {
                this.getPurchaseOrders(0, 0);
            }
        });
    }
    setRoles(){
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "purchaseorderapproval")[0];
            let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
            if (auditLogRole != null)
                this.viewLogPermission = auditLogRole.IsView;
            this.approvePermission = formRole.IsApprove;
            this.printPermission = formRole.IsPrint;
        }
        else {
            this.approvePermission = true;
            this.printPermission = true;
        }
    }

    initializeFilterForm(): void {
        this.poFilterInfoForm = this.formBuilderObj.group({
            POCode: [''],
            SupplierName: [''],
            FromDate: [],
            ToDate: [],
            PoTypeId: [0]
        });

    }
    ngOnInit() {
        this.initializeFilterForm();
        this.PurchaseOrdersListsCols = [
            { field: 'DraftCode', header: 'Draft Code', width: '100px' },
            { field: 'SupplierName', header: 'Supplier', width: '200px' },
            { field: 'CreatedDate', header: 'Created On', width: '150px' },
            { field: 'POTypeId', header: 'Type', width: '150px' },
            { field: '', header: 'Action', width: '100px' },
        ];
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

        this.poFilterInfoForm.controls.FromDate.setValue({
            year: FirstDateYear,
            month: FirstDateMonth,
            day: FirstDateDay
        });

        this.poFilterInfoForm.controls.ToDate.setValue({
            year: CurrentDateYear,
            month: CurrentDateMonth,
            day: CurrentDateDay
        });
        //**********************************************************************************************************************

        this.purchaseOrderPagerConfig = new PagerConfig();
        this.resetPagerConfig();

        //getting the purchase order types.
        this.pocreationObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                //debugger;
                this.purchaseOrderTypes = data;
            });
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                //getting the purchase orders list..
                if (this.companyId != data) {
                    this.companyId = data;
                    this.navigate();
                }
            });
        this.activatedRoute.queryParamMap.subscribe((data) => {
            this.navigate();
        });
        this.showfilters =true;
        this.showfilterstext="Hide List" ;
    

    }
    getPoTypeName(POTypeId :any)
    {
        // let ItemValue = this.data.filter(item => item.srcUrl == srcUrl)[0];
        this.debugger;
        let ItemValue = this.purchaseOrderTypes.filter(item => item.PurchaseOrderTypeId == POTypeId)[0];
        this.PurchaseOrderType=ItemValue.PurchaseOrderType.toString();
        return this.PurchaseOrderType;

    }
    //to get  the purchase orders..
    getPurchaseOrders(purchaseOrderIdToBeSelected: number, potypeId: number) {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            CompanyId: this.companyId,
            UserId: userDetails.UserID
        };
        this.showLeftPanelLoadingIcon = true;
        this.poApprovalServiceObj.getPurchaseOrdersApprovals(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                this.debugger;
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.purchaseOrdersList.length > 0) {
                    // if (purchaseOrderIdToBeSelected == 0) {
                    //     this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId, this.purchaseOrdersList[0].POTypeId);
                    // }
                    // else {
                    //     this.onRecordSelection(purchaseOrderIdToBeSelected, potypeId);
                    // }
                }
                else {

                }
            }, () => { this.showLeftPanelLoadingIcon = false; });
    }
    //to get  the purchase orders..
    debugger;
    searchForPurchaseOrdersApprovals(purchaseOrderIdToBeSelected: number, processId?: number, poId?: number, cId?: number, poCode: string = "", supplierName: string = "", poTypeId?: number) {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            Search: this.purchaseOrderSearchKey == null || this.purchaseOrderSearchKey == "null" ? "" : this.purchaseOrderSearchKey,
            CompanyId: cId,
            UserId: userDetails.UserID,
            ProcessId: processId,
            PurchaseOrderId: poId,
            PoCode: poCode,
            SupplierName: supplierName,
            poTypeId: poTypeId,
            FromDate: this.FromDateStr,
            ToDate: this.ToDateStr
        };
        this.showLeftPanelLoadingIcon = true;
        this.poApprovalServiceObj.searchForPurchaseOrdersApprovals(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                debugger;
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                this.IsFilterDataArrive=true;
                this.FilterPurchaseOrdersList=data.PurchaseOrders;
                // if (this.purchaseOrdersList.length > 0) {
                //     if (purchaseOrderIdToBeSelected == 0) {
                //         this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId, this.purchaseOrdersList[0].POTypeId);
                //     }
                //     else {
                //         this.onRecordSelection(purchaseOrderIdToBeSelected, this.purchaseOrdersList.find(i => i.PurchaseOrderId == purchaseOrderIdToBeSelected).POTypeId);
                //     }
                // }
                // else {

                // }
            }, () => { }, () => { this.showLeftPanelLoadingIcon = false; });
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId: number, purchaseOrderTypeId: number) {

        this.selectedPurchaseOrderId=purchaseOrderId;
        this.selectedPurchaseOrderTypeId=purchaseOrderTypeId;
        //alert("Purchase Order Id : " + purchaseOrderId +" \n Purchase Order Type Id : " + purchaseOrderTypeId);
        this.router.navigate([`/po/poapproval/${purchaseOrderId}/${purchaseOrderTypeId}`]);
        //alert("Purchase Order Id : " + purchaseOrderId +" \n " + "Purchase Order Type Id : " +purchaseOrderTypeId );
        // this.IsList=false;
        // this.split();
        // this.selectedPurchaseOrderTypeId = purchaseOrderTypeId;
        // this.selectedPurchaseOrderId = -1;
        // if (this.workFlowStatus.WorkFlowStatusId = WorkFlowStatus.WaitingForApproval) {
        //     this.showPrintButton = false;
        // }
        // else
        //     this.showPrintButton = true;

        // setTimeout(() => {
        //     this.selectedPurchaseOrderId = purchaseOrderId;
        // }, 50);
    }
    pageChange(currentPageNumber: any) {
        this.purchaseOrderPagerConfig.RecordsToSkip = this.purchaseOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getPurchaseOrders(0, 0);
    }
  
    
    onClickedOutside(e: Event) {
       // this.showfilters= false; 
        if(this.showfilters == false){ 
           // this.showfilterstext="Show List"
        }
      }
    split() {
    this.showfilters=!this.showfilters;
    if(this.showfilters == true){ 
    this.showfilterstext="Hide List" 
    }
    else{
      this.showfilterstext="Show List" 
    }
    }
    
    hidefilter() {
        this.innerWidth = window.innerWidth;
        if (this.innerWidth < 550) {
            $(".filter-scroll tr").click(function () {
                $(".leftdiv").addClass("hideleftcol");
                $(".rightPanel").addClass("showrightcol");
                $(".rightcol-scrroll").height("100%");
            });
        }
    }

    showLeftCol(event) {
        $(".leftdiv").removeClass("hideleftcol");
        $(".rightPanel").removeClass("showrightcol");
    }
    showFullScreen() {

    }
    displayLogPopUp() {
        this.showLogPopUp = true;
    }
    hideLogPopUp(hidePopUp: boolean) {
        this.showLogPopUp = false;
    }
    updateStatus(data: PoApprovalUpdateStatus) {
        let remarks = "";
        let successMessage = "";
        let WorkFlowStatusPTApp: number = 0;
        if (data.StatusId == WorkFlowStatus.Approved) {
            if (data.Remarks != "" && data.Remarks != null) {
                remarks = data.Remarks;
            }
            else {
                remarks = "Approved";
            }
            successMessage = Messages.Approved;
        }
        else if (data.StatusId == WorkFlowStatus.Rejected) {
            if (data.Remarks != "" && data.Remarks != null) {
                remarks = data.Remarks;
            }
            else {
                remarks = "Rejected";
            }
            successMessage = Messages.Rejected;
            if (Number(data.PendingTA) == WorkFlowStatus.PendingForTerminationApproval) {
                // data.StatusId = WorkFlowStatus.Approved;
                WorkFlowStatusPTApp = WorkFlowStatus.PendingForTerminationApproval;
            }
        }
        else {
            remarks = data.Remarks;
            successMessage = Messages.SentForClarification;
        }

        // console.log(data.StatusId);
        let workFlowStatus: PoApproval = {
            PurchaseOrderId: this.selectedPurchaseOrderId,
            UserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
            WorkFlowStatusId: data.StatusId,
            Remarks: remarks,
            PurchaseOrderRequestUserId: this.purchaseOrdersList.find(j => j.PurchaseOrderId == this.selectedPurchaseOrderId).CreatedBy,
            ApproverUserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
            ProcessId: data.ProcessId,
            PurchaseOrderCode: data.PoCode,
            StartDate: data.StartDate,
            EndDate: data.EndDate,
            BillingFrequencyId: data.BillingFrequencyId,
            PODate: data.PODate,
            CompanyId: data.CompanyId,
            IsVoid: data.IsVoid,
            IsAccept: data.IsAccept,
            WorkFlowStatusPTA: WorkFlowStatusPTApp
        };
        this.remarks = remarks;
        this.poApprovalServiceObj.updatePurchaseOrderApprovalStatus(workFlowStatus)
            .subscribe((response) => {
                this.remarks = "";
                this.purchaseOrderSearchKey = "";
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: successMessage,
                    MessageType: MessageTypes.Success
                });
                this.getPurchaseOrders((data.StatusId == 4 || data.StatusId == 5) ? 0 : workFlowStatus.PurchaseOrderId, this.selectedPurchaseOrderTypeId);
            });
    }
    onSupplierFilterChange(event:any)
    {          
        if(event.item!=null && event.item!=undefined){        
            if(event.item.WorkFlowStatus!= "Approved"){
                this.poFilterInfoForm.get('SupplierName').setValue(null);    
                event.preventDefault();
            }
            else if(event.item.IsFreezed){
                this.poFilterInfoForm.get('SupplierName').setValue(null);
                event.preventDefault();
            }
        }     
    }
    resetPagerConfig() {
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderPagerConfig.RecordsToFetch = 500;
        this.currentPage = 1;
    }

    onSearchInputChange(event: any) {
        this.resetPagerConfig();
        if (event.target.value != "") {
            if (event.target.value.length >= 3) {

                this.purchaseOrderSearchKey = event.target.value;
                this.searchForPurchaseOrdersApprovals(0, 0, 0);
            }
        }
        else {
            this.getPurchaseOrders(0, 0);
        }
    }
    onPDFPrint() {
        // if(this.selectedPurchaseOrderTypeId === 1){  // currently for inventory po type
        let pdfDocument = this.pocreationObj.printDetails(this.selectedPurchaseOrderId, this.selectedPurchaseOrderTypeId, this.sessionService.getCompanyId());
        pdfDocument.subscribe((data) => {
            let record = this.purchaseOrdersList.find(j => j.PurchaseOrderId == this.selectedPurchaseOrderId && j.POTypeId == this.selectedPurchaseOrderTypeId)
            if (record.PurchaseOrderCode == null) {
                saveAs(new Blob([(data)], { type: 'application/pdf' }), "POA" + record.DraftCode + ".pdf");
            }
            else
                saveAs(new Blob([(data)], { type: 'application/pdf' }), "POA" + record.PurchaseOrderCode + ".pdf");

            //     let result = new Blob([data], { type: 'application/pdf' });
            //   if (window.navigator && window.navigator.msSaveOrOpenBlob) {//IE
            //     window.navigator.msSaveOrOpenBlob(result, "POApproval.pdf");


            //   } else {
            //     const fileUrl = URL.createObjectURL(result);
            //     let tab = window.open();
            //     tab.location.href = fileUrl;
            //   }
        });
        //}
    }
    //this method is used to format the content to be display in the autocomplete textbox after selection..
    supplierInputFormater = (x: Suppliers) => x.SupplierName;
    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {

                }
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: 0,
                    companyId: this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
        );

    openDialog() {
        this.showFilterPopUp = true;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    resetData() {
        this.isFilterApplied = false;
        this.showFilterPopUp = true;
        this.purchaseOrderSearchKey = "";
        this.resetFilters();
    }
    resetFilters() {
        this.SupplierNameValidate = "";
        this.purchaseOrderSearchKey = "";
        this.poFilterInfoForm.get('POCode').setValue("");
        this.poFilterInfoForm.get('SupplierName').setValue("");
        this.poFilterInfoForm.get('PoTypeId').setValue(0);
        this.filterMessage = "";
        this.getPurchaseOrders(0, 0);
        this.isFilterApplied = false;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    suppliernamechange(event) {
        this.SupplierNameValidate = event.target.value;
    }
    filterData() {
        debugger;
        let poCode: string = "";
        let supplierName: string = "";
        let poTypeId: number = 0;
        this.filterMessage = "";
        if (this.poFilterInfoForm.get('POCode').value != "") {
            poCode = this.poFilterInfoForm.get('POCode').value;
        }
        if (this.poFilterInfoForm.get('SupplierName').value != "") {
            supplierName = this.poFilterInfoForm.get('SupplierName').value.SupplierName;
        }
        if (this.poFilterInfoForm.get('PoTypeId').value != "") {
            poTypeId = this.poFilterInfoForm.get('PoTypeId').value;
        }
        // if (poCode === '' && supplierName === '' && (poTypeId == 0 || poTypeId == null)) {
        //     if (open) {
        //         if ((this.poFilterInfoForm.get('SupplierName').value == null || this.poFilterInfoForm.get('SupplierName').value == "") && this.SupplierNameValidate != "") {
        //             this.filterMessage = "No matching records are found";
        //             this.showFilterPopUp = true;
        //         }
        //         else {
        //             this.filterMessage = "Please select any filter criteria";
        //         }
        //     }
        //     return;
        // }
        debugger;
        this.SetDates();
        this.searchForPurchaseOrdersApprovals(0, getProcessId(poTypeId), 0, this.companyId, poCode, supplierName, poTypeId);
        if (this.purchaseOrdersList.length > 0) {
            this.isFilterApplied = true;
            if (open) {
                this.showFilterPopUp = false;
            }
        }
        else {
            this.showFilterPopUp = false;
            this.errorMessage = Messages.NoRecordsToDisplay;
        }
    }
    SetDates() {
        let poFilterData: PurchaseOrderFilterModel = this.poFilterInfoForm.value;
        //*************************************************************************************************************/
        //From Date Str
        //*************************************************************************************************************/
        this.DateFromJsonString = JSON.stringify(poFilterData.FromDate);

        let jsonFromObj = JSON.parse(this.DateFromJsonString); // string to "any" object first
        let FromDateObj = jsonFromObj as DateObj;


        //let a = employee.year;
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

        console.log(this.FromDateStr);
        //*************************************************************************************************************/
        //*************************************************************************************************************/
        //To Date Str
        //*************************************************************************************************************/
        this.DateToJsonString = JSON.stringify(poFilterData.ToDate);

        let jsonToObj = JSON.parse(this.DateToJsonString); // string to "any" object first
        let ToDateObj = jsonToObj as DateObj;


        //let a = employee.year;
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

        console.log(this.ToDateStr);
    }
    // SetFilterData() {
    //     let poFilterData: PurchaseOrderFilterModel = this.poFilterInfoForm.value;
    //     if (this.poFilterInfoForm.get('SupplierName').value != null) {
    //         poFilterData.SupplierName = this.poFilterInfoForm.get('SupplierName').value.SupplierName;
    //     }
    //     if (this.poFilterInfoForm.get('POCode').value != null) {
    //         poFilterData.POCode = this.poFilterInfoForm.get('POCode').value;
    //     }
    //     if (this.poFilterInfoForm.get('PoTypeId').value != null) {
    //         poFilterData.PoTypeId = this.poFilterInfoForm.get('PoTypeId').value;
    //     }
    //     if (this.poFilterInfoForm.get('WorkFlowStatusId').value != null) {
    //         poFilterData.WorkFlowStatusId = this.poFilterInfoForm.get('WorkFlowStatusId').value;
    //     }
    //     if (this.poFilterInfoForm.get('FromDate').value != null) {
    //         const a1 = this.poFilterInfoForm.get('FromDate').value.toString();
    //         const a2 = this.poFilterInfoForm.get('FromDate').value;

    //         poFilterData.FromDate = this.poFilterInfoForm.get('FromDate').value;
    //     }

    //     if (this.poFilterInfoForm.get('ToDate').value != null) {
    //         poFilterData.ToDate = this.poFilterInfoForm.get('ToDate').value;
    //     }

    //     debugger;
    //     //*************************************************************************************************************/
    //     //From Date Str
    //     //*************************************************************************************************************/
    //     this.DateFromJsonString = JSON.stringify(poFilterData.FromDate);

    //     let jsonFromObj = JSON.parse(this.DateFromJsonString); // string to "any" object first
    //     let FromDateObj = jsonFromObj as DateObj;

    //     if (FromDateObj != null) {
    //         if (FromDateObj.month.toString().length > 0) {
    //             //Day
    //             let FromDateDay = Number(FromDateObj.day);
    //             if (FromDateDay <= 9) {
    //                 this.FromDateDayStr = "0" + FromDateDay;
    //             }
    //             else {
    //                 this.FromDateDayStr = FromDateDay.toString();
    //             }
    //             //Month
    //             let FromDateMonth = Number(FromDateObj.month);
    //             if (FromDateMonth <= 9) {
    //                 this.FromDateStr = FromDateObj.year + "-0" + FromDateObj.month + "-" + this.FromDateDayStr;
    //             }
    //             else {
    //                 this.FromDateStr = FromDateObj.year + "-" + FromDateObj.month + "-" + this.FromDateDayStr;
    //             }
    //         }
    //     }

    //     console.log(this.FromDateStr);
    //     //*************************************************************************************************************/
    //     //*************************************************************************************************************/
    //     //To Date Str
    //     //*************************************************************************************************************/
    //     this.DateToJsonString = JSON.stringify(poFilterData.ToDate);

    //     let jsonToObj = JSON.parse(this.DateToJsonString); // string to "any" object first
    //     let ToDateObj = jsonToObj as DateObj;


    //     if (ToDateObj != null) {
    //         if (ToDateObj.month.toString().length > 0) {
    //             let ToDateDay = Number(ToDateObj.day);
    //             if (ToDateDay <= 9) {
    //                 this.ToDateDayStr = "0" + ToDateDay;
    //             }
    //             else {
    //                 this.ToDateDayStr = ToDateDay.toString();
    //             }

    //             let ToDateMonth = Number(ToDateObj.month);
    //             if (ToDateMonth <= 9) {
    //                 this.ToDateStr = ToDateObj.year + "-0" + ToDateObj.month + "-" + this.ToDateDayStr;
    //             }
    //             else {
    //                 this.ToDateStr = ToDateObj.year + "-" + ToDateObj.month + "-" + this.ToDateDayStr;
    //             }
    //         }
    //     }

    //     console.log(this.ToDateStr);
    //     //*************************************************************************************************************/
    //     debugger;

    //     this.purchaseOrderPagerConfig.RecordsToSkip = 0;
    //     this.purchaseOrderPagerConfig.RecordsToFetch = this.TotalRecords;
    //     let purchaseOrderDisplayInput = {
    //         Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
    //         Take: this.purchaseOrderPagerConfig.RecordsToFetch,
    //         Search: (this.purchaseOrderSearchKey == null || this.purchaseOrderSearchKey == "null") ? "" : this.purchaseOrderSearchKey,
    //         CompanyId: this.companyId,
    //         UserId: this.userDetails.UserID,
    //         WorkFlowProcessId: (poFilterData == undefined || poFilterData == null || poFilterData.PoTypeId == null) ? 0 : getProcessId(poFilterData.PoTypeId),
    //         PoCode: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.POCode,
    //         SupplierName: (poFilterData == undefined || poFilterData == null || poFilterData.SupplierName == undefined) ? null : poFilterData.SupplierName,
    //         WorkFlowStatusId: (poFilterData == undefined || poFilterData == null) ? 0 : poFilterData.WorkFlowStatusId,
    //         FromDate: this.FromDateStr,
    //         ToDate: this.ToDateStr
  
    //     };
  
    //     this.showLeftPanelLoadingIcon = true;
    //     this.pocreationObj.getAllSearchPurchaseOrders(purchaseOrderDisplayInput)
    //         .subscribe((data: PurchaseOrderDisplayResult) => {
    //             //this.showLeftPanelLoadingIcon = false;
    //             this.showFilterPopUp = false;
    //             this.sharedServiceObj.PORecordslength = data.PurchaseOrders.length;
    //             //this.showLeftPanelLoadingIcon=false;
    //             debugger;
    //             this.IsFilterDataArrive = true;
    //             if (data.PurchaseOrders.length > 0) {
    //                 debugger;
    //                 this.HideTable=false;
    //                 this.TotalRecords = data.TotalRecords;
    //                 this.FilterPurchaseOrdersList = data.PurchaseOrders;
    //                 this.FilterPurchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
  
    //             }
    //             else {
    //                 this.HideTable=true;
    //                 this.hideText = true;
    //                 this.filterMessage = "No matching records are found";
    //                 //this.showFilterPopUp = true;
    //                 //this.hideFullScreen();
    //             }
    //         }, (error) => {
    //             this.showLeftPanelLoadingIcon = false;
    //         });
    
       
    // }
   //*********************************************************************************************************************/
    //Export Code Starts Here
    //*********************************************************************************************************************/
    ExportToExcel() {
        //alert("Export To CSV");
        debugger;

        //this.SetFilterData();
        this.filterData();
        this.interval = setTimeout(() => {
            //alert("Alert activated")
            debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                if (this.FilterPurchaseOrdersList.length > 0) {
                    //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                    //this.exportToExcel();
                    const edata: Array<ExcelJson> = [];
                    const udt: ExcelJson = {
                        data: [
                            { A: 'User Data' }, // title
                            { A: 'Draft Code', B: 'Supplier', C: 'Created On', D: 'PO Status' }, // table header
                        ],
                        skipHeader: true
                    };
                    this.FilterPurchaseOrdersList.forEach(polist => {
                        udt.data.push({
                            A: polist.DraftCode,
                            B: polist.SupplierName,
                            C: polist.CreatedDate,
                            D: polist.WorkFlowStatusText
                        });
                    });
                    edata.push(udt);

                    // // adding more data just to show "how we can keep on adding more data"
                    // const bd = {
                    //   data: [
                    //     // chart title
                    //     { A: 'Some more data', B: '' },
                    //     { A: '#', B: 'First Name', C: 'Last Name', D: 'Handle' }, // table header
                    //   ],
                    //   skipHeader: true
                    // };
                    // this.users.forEach(user => {
                    //   bd.data.push({
                    //     A: String(user.id),
                    //     B: user.firstName,
                    //     C: user.lastName,
                    //     D: user.handle
                    //   });
                    // });
                    // edata.push(bd);
                    this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                    this.FileNo=Math.ceil(Math.random() * 10);
                    this.FileName="PurchaseOrderApprovalLists_" + this.CurrentDate+"_"+this.FileNo.toString();

                    this.exportService.exportJsonToExcel(edata, this.FileName);
                    this.stopTime();
                }
            }
        }, 1000);

    }
    ExportToCSV() 
    {
        //alert("Export To CSV");
        //alert("Total Records CSV : " +this.TotalRecords);
        this.filterData();
        this.interval = setTimeout(() => {
            //alert("Alert activated")
            debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                if (this.FilterPurchaseOrdersList.length > 0) {
                    //alert("Total Records CSV : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                    const options = {
                        fieldSeparator: ',',
                        quoteStrings: '"',
                        decimalSeparator: '.',
                        showLabels: true,
                        showTitle: true,
                        title: 'Purchase Orders Approval List',
                        useTextFile: false,
                        useBom: true,
                        headers: ['DraftCode', 'SupplierName', 'CreatedDate', 'WorkFlowStatusText']
                    };
                    const csvExporter = new ExportToCsv(options);
                    csvExporter.generateCsv(this.FilterPurchaseOrdersList);
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
        this.purchaseOrdersList.forEach(user => {
            udt.data.push({
                A: user.DraftCode,
                B: user.SupplierName,
                C: user.WorkFlowStatusText
            });
        });
        edata.push(udt);

        // // adding more data just to show "how we can keep on adding more data"
        // const bd = {
        //   data: [
        //     // chart title
        //     { A: 'Some more data', B: '' },
        //     { A: '#', B: 'First Name', C: 'Last Name', D: 'Handle' }, // table header
        //   ],
        //   skipHeader: true
        // };
        // this.users.forEach(user => {
        //   bd.data.push({
        //     A: String(user.id),
        //     B: user.firstName,
        //     C: user.lastName,
        //     D: user.handle
        //   });
        // });
        // edata.push(bd);
        this.exportService.exportJsonToExcel(edata, 'PurchaseOrderApprovalLists');
    }

    stopTime() {
        clearInterval(this.interval);
        this.showLeftPanelLoadingIcon = false;
    }
    ExportToPDF() {
        //alert("Export To PDF");
        // const doc = new jsPDF();
        //alert("Total Records PDF : " +this.TotalRecords);
        debugger;

        //Get Filter Data
        //this.SetFilterData();
        this.filterData();

        this.interval = setTimeout(() => {
            //alert("Alert activated")
            debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                if (this.FilterPurchaseOrdersList.length > 0) {
                    //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

                    this.exportColumns = this.PurchaseOrdersListsCols.map((col) => ({
                        title: col.header,
                        dataKey: col.field,
                    }));

                    //Remove Action Column
                    this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                    const doc = new jsPDF('p', 'pt');
                    doc['autoTable'](this.SelexportColumns, this.FilterPurchaseOrdersList);
                    // doc.autoTable(this.exportColumns, this.products);

                    this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                    this.FileNo=Math.ceil(Math.random() * 10);
                    this.FileName="PurchaseOrderApprovalLists_" + this.CurrentDate+"_"+this.FileNo.toString();

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
 


}
