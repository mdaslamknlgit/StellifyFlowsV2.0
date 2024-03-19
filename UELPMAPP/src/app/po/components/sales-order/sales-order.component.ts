import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { SalesOrderList, SalesOrderDisplayResult, SalesInvoiceDisplayResult, TicketList, SalesInvoiceList } from "../../models/so-creation.model";
import { PagerConfig, Messages, MessageTypes, UserDetails, Facilities, WorkFlowStatus } from "../../../shared/models/shared.model";
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { FullScreen } from '../../../shared/shared';
import { SortEvent } from 'primeng/primeng';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SoApprovalUpdateStatus, SoApproval } from '../../models/so-approval.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { SOCreationService } from "../../services/so-creation.service";
import { Customer } from "../../../administration/models/customer";
import { WorkflowAuditTrail } from "../../models/workflow-audittrail.model";
@Component({
    selector: 'app-sales-order-creation',
    templateUrl: './sales-order.component.html',
    styleUrls: ['./sales-order.component.css'],
    providers: [SOCreationService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class SalesOrderCreationComponent implements OnInit {
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('soCode') private sorCodeRef: any;
    selectedSalesOrderId: number = -1;
    selectedInvoiceId: number = -1;
    salesOrdersList: Array<SalesOrderList> = [];
    salesOrderPagerConfig: PagerConfig;
    salesOrderSearchKey: string;
    leftsection: boolean = false;
    rightsection: boolean = false;
    slideactive: boolean = false;
    hidetext?: boolean = null;
    companyId: number;
    isApprovalPage: boolean = false;
    remarks: string = "";
    showLeftPanelLoadingIcon: boolean = false;
    errorMessage: string = Messages.NoRecordsToDisplay;
    showFilterPopUp: boolean = false;
    isFilterApplied: boolean = false;
    soFilterInfoForm: FormGroup;
    salesInvoiceFilterInfoForm: FormGroup;
    filterMessage: string = "";
    pageTitle: string = "";
    isApproval: boolean = false;
    leftSection: boolean = false;
    rightSection: boolean = false;
    auditTrailComments: Array<WorkflowAuditTrail> = [];
    type: string = "";
    //sales invoice
    salesInvoiceList: Array<SalesInvoiceList> = [];
    salesInvoicePagerConfig: PagerConfig;
    supplierInvoiceSearchKey: string;
    slideActive: boolean = false;
    salesInvoiceSearchKey: string;
    selectedSalesInvoiceId: number = -1;
    deletedInvoiceItems: Array<number> = [];
    salesInvoices: Array<SalesInvoiceList> = [];
    @ViewChild('SalesInvoiceCode') private soInvoiceCodeRef: any;
    initDone = false;
    filteredSupplierInvoice = [];
    workFlowStatus:any;
    public innerWidth: any;
    constructor(private soCreationObj: SOCreationService,
        public sessionService: SessionStorageService,
        private sharedServiceObj: SharedService,
        public activatedRoute: ActivatedRoute,
        private renderer: Renderer,
        private formBuilderObj: FormBuilder,
        public router: Router
    ) {

        this.companyId = this.sessionService.getCompanyId();
        this.soFilterInfoForm = this.formBuilderObj.group({
            SOCode: [''],
            Customer: [''],
            Ticket: [''],
            Facilities: ['']
        });

        this.salesInvoiceFilterInfoForm = this.formBuilderObj.group({
            SalesInvoiceCode: [''],
            Customer: ['']
        });

        this.workFlowStatus = WorkFlowStatus;
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            if (param.get('type') != undefined) {
                this.type = this.activatedRoute.snapshot.paramMap.get('type');
                this.generatePageTitle(this.type);
            }
        });

        this.salesOrderPagerConfig = new PagerConfig();
        this.salesOrderPagerConfig.RecordsToSkip = 0;
        this.salesOrderPagerConfig.RecordsToFetch = 10;
        this.salesOrderSearchKey = "";
        this.salesInvoiceSearchKey = "";
        this.salesOrdersList = [];
        this.salesInvoicePagerConfig = new PagerConfig();
        this.salesInvoicePagerConfig.RecordsToSkip = 0;
        this.salesInvoicePagerConfig.RecordsToFetch = 10;
        this.salesInvoiceSearchKey = "";


        this.activatedRoute.paramMap.subscribe((data) => {
            if (this.type === "approval") {
                this.salesInvoiceList = [];
            }
            let type = this.activatedRoute.snapshot.queryParamMap.get('type');
            this.generatePageTitle(type);
            const id: number = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
            this.salesOrderSearchKey = this.activatedRoute.snapshot.paramMap.get('soCode');
            if (this.salesOrderSearchKey != "" && this.salesOrderSearchKey != null) {
                let processId = Number(this.activatedRoute.snapshot.paramMap.get('processId'));
                let soId = Number(this.activatedRoute.snapshot.paramMap.get('soId'));
                if (this.isApproval) {
                    this.searchForSalesOrdersApprovals(0, processId, soId);
                }
                else {
                    this.getAllSearchSalesOrders("", soId, processId, "");
                }

            }
            else if (id != undefined && id != 0 && id != null) {
                if (this.isApproval) {
                    this.searchForSalesOrdersApprovals(0, 0, id);
                }
            }
            else {
                // this.getSalesOrders(0);
                if (this.type.toLowerCase() != "invoice") {
                    this.getSalesOrders(0);
                }
                else {
                    this.getSalesInvoices(0);
                }
            }
        });

        if (!this.isApproval) {
            this.sharedServiceObj.CompanyId$
                .subscribe((data) => {                  
                    this.companyId = data;
                    this.selectedSalesOrderId = 0;
                    this.selectedSalesInvoiceId = 0;                                       
                    if (this.type.toLowerCase() != "invoice") {
                        this.getSalesOrders(0);
                    }
                    else {
                        this.getSalesInvoices(0);
                    }
                });
        }

    }

    generatePageTitle(type: string) {
        if (type != undefined && type != null && type != "") {
            this.type = type;
            if (this.type.toLowerCase() === "approval") {
                this.pageTitle = "Sales Order Approval";
                this.isApproval = true;
                this.isApprovalPage = true;
            }
            else {
                this.pageTitle = "Sales Order Invoice";
                this.isApproval = false;
                this.isApprovalPage = false;
            }
        }
        else {
            if (this.type === "") {
                this.pageTitle = "Sales Order";
                this.isApproval = false;
                this.isApprovalPage = false;
            }
        }
    }
    //to get  the sales orders..
    getSalesOrders(salesOrderIdToBeSelected: number) {
        this.showLeftPanelLoadingIcon = true;
        if (!this.isApproval) {
            let salesOrderDisplayInput = {
                Skip: this.salesOrderPagerConfig.RecordsToSkip,
                Take: this.salesOrderPagerConfig.RecordsToFetch,
                CompanyId: this.companyId
            };

            this.soCreationObj.getSalesOrders(salesOrderDisplayInput)
                .subscribe((data: SalesOrderDisplayResult) => {
                    this.salesOrdersList = data.SalesOrders;
                    this.salesOrderPagerConfig.TotalRecords = data.TotalRecords;
                    this.showLeftPanelLoadingIcon = false;
                    if (this.salesOrdersList.length > 0) {
                        if (salesOrderIdToBeSelected == 0) {
                            this.onRecordSelection(this.salesOrdersList[0].SalesOrderId);
                        }
                        else {
                            this.onRecordSelection(salesOrderIdToBeSelected);
                        }
                    }
                    else {                      
                        this.addRecord();
                    }
                }, (error) => {
                    this.showLeftPanelLoadingIcon = false;
                });
        }
        else {
            let userDetails = <UserDetails>this.sessionService.getUser();
            let salesOrderDisplayInput = {
                Skip: this.salesOrderPagerConfig.RecordsToSkip,
                Take: this.salesOrderPagerConfig.RecordsToFetch,
                CompanyId: this.companyId,
                UserId: userDetails.UserID
            };

            this.soCreationObj.getSalesOrdersApprovals(salesOrderDisplayInput)
                .subscribe((data: SalesOrderDisplayResult) => {
                    this.salesOrdersList = data.SalesOrders;
                    this.salesOrderPagerConfig.TotalRecords = data.TotalRecords;
                    this.showLeftPanelLoadingIcon = false;
                    if (this.salesOrdersList.length > 0) {
                        if (salesOrderIdToBeSelected == 0) {
                            this.onRecordSelection(this.salesOrdersList[0].SalesOrderId);
                        }
                        else {
                            this.onRecordSelection(salesOrderIdToBeSelected);
                        }
                    }
                    else {
                        salesOrderIdToBeSelected = -1;
                        this.onRecordSelection(salesOrderIdToBeSelected);
                    }
                }, (error) => {
                    this.showLeftPanelLoadingIcon = false;
                });
        }
    }

    getSalesInvoices(InvoiceIdToBeSelected: number) {
        let salesInvoiceDisplayInput = {
            Skip: this.salesOrderPagerConfig.RecordsToSkip,
            Take: this.salesOrderPagerConfig.RecordsToFetch,
            Search: "",
            CompanyId: this.companyId
        };
        this.soCreationObj.getSalesInvoices(salesInvoiceDisplayInput)
            .subscribe((data: SalesInvoiceDisplayResult) => {
                this.salesInvoiceList = data.SalesInvoices;
                this.salesOrderPagerConfig.TotalRecords = data.TotalRecords;
                if (this.salesInvoiceList.length > 0) {
                    if (InvoiceIdToBeSelected == 0) {
                        this.onRecordSelection(this.salesInvoiceList[0].SalesInvoiceId);
                    }
                    else {
                        this.onRecordSelection(InvoiceIdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            });
    }

    //to get list of sales orders..
    getAllSearchSalesOrders(searchKey: string, salesOrderIdToBeSelected: number, processId: number, unitNo: string, soCode: string = "", customerName: string = "", ticketNo: string = "") {
        let salesOrderDisplayInput = {
            Skip: this.salesOrderPagerConfig.RecordsToSkip,
            Take: this.salesOrderPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId: this.companyId,
            SalesOrderId: salesOrderIdToBeSelected,
            WorkFlowProcessId: processId,
            SoCode: soCode,
            CustomerName: customerName,
            TicketNo: ticketNo,
            UnitNumber: unitNo
        };
        this.showLeftPanelLoadingIcon = true;
        this.soCreationObj.getAllSearchSalesOrders(salesOrderDisplayInput)
            .subscribe((data: SalesOrderDisplayResult) => {
                if (data != null) {
                    if (data.SalesOrders.length > 0) {
                        this.salesOrdersList = data.SalesOrders;
                        this.salesOrderPagerConfig.TotalRecords = data.TotalRecords;
                        this.showLeftPanelLoadingIcon = false;
                        this.isFilterApplied = true;
                        this.showFilterPopUp = false;
                        if (this.salesOrdersList.length > 0) {
                            if (salesOrderIdToBeSelected == 0) {
                                this.onRecordSelection(this.salesOrdersList[0].SalesOrderId);
                            }
                            else {
                                this.onRecordSelection(salesOrderIdToBeSelected);
                            }
                        }
                        else {
                            this.addRecord();
                        }
                    }
                    else {
                        this.showLeftPanelLoadingIcon = false;
                        this.isFilterApplied = true;
                        this.showFilterPopUp = false;
                        this.salesOrdersList = data.SalesOrders;
                        this.salesOrderPagerConfig.TotalRecords = data.TotalRecords;
                        //this.filterMessage = "No records are found";
                    }
                }

            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }

    searchForSalesOrdersApprovals(salesOrderIdToBeSelected: number, processId?: number, soId?: number, soCode: string = "", customerName: string = "") {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let salesOrderDisplayInput = {
            Skip: this.salesOrderPagerConfig.RecordsToSkip,
            Take: this.salesOrderPagerConfig.RecordsToFetch,
            Search: this.salesOrderSearchKey == null || this.salesOrderSearchKey == "null" ? "" : this.salesOrderSearchKey,
            CompanyId: this.companyId,
            SalesOrderId: soId,
            WorkFlowProcessId: processId,
            UserId: userDetails.UserID,
            ProcessId: processId,
            SoCode: soCode,
            CustomerName: customerName

        };

        this.showLeftPanelLoadingIcon = true;
        this.soCreationObj.searchSalesOrdersForApproval(salesOrderDisplayInput)
            .subscribe((data: SalesOrderDisplayResult) => {
                this.salesOrdersList = data.SalesOrders;
                this.salesOrderPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.salesOrdersList.length > 0) {
                    if (salesOrderIdToBeSelected == 0) {
                        this.onRecordSelection(this.salesOrdersList[0].SalesOrderId);
                    }
                    else {
                        this.onRecordSelection(salesOrderIdToBeSelected);
                    }
                }
                else {

                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    };

    //to get list of purchase orders..
    getAllSearchSalesInvoices(searchKey: string, salesInvoiceIdToBeSelected: number, salesInvoiceCode: string = "", customerName: string = "") {
        //getting the list of purchase orders...
        let salesInvoiceDisplayInput = {
            Skip: this.salesOrderPagerConfig.RecordsToSkip,
            Take: this.salesOrderPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId: this.companyId,
            SalesInvoiceCode: salesInvoiceCode,
            CustomerName: customerName,
        };
        this.soCreationObj.getAllSearchSalesInvoices(salesInvoiceDisplayInput)
            .subscribe((data: SalesInvoiceDisplayResult) => {
                this.salesInvoiceList = data.SalesInvoices;
                this.salesOrderPagerConfig.TotalRecords = data.TotalRecords;
                if (this.salesInvoiceList.length > 0) {
                    if (salesInvoiceIdToBeSelected == 0) {
                        this.onRecordSelection(this.salesInvoiceList[0].SalesInvoiceId);
                    }
                    else {
                        this.onRecordSelection(salesInvoiceIdToBeSelected);
                    }
                }
                else {
                    this.hidetext = true;
                    //this.hideInput = false;
                }
            });
    }
    /**
     * this method will be called on sales order record selection.
     */
    onRecordSelection(salesOrderId: number) {      
        // if (this.type != "invoice") {
        this.selectedSalesOrderId = -1;
        this.selectedInvoiceId = -1
        setTimeout(() => {          
            if (this.type != "invoice") {
                this.selectedSalesOrderId = salesOrderId;
            }
            else {
                this.selectedSalesOrderId = salesOrderId;
                this.selectedInvoiceId = salesOrderId;
            }

            if (!this.isApproval) {
                this.hidetext = true;
            }
        }, 50);
        // }
    }

    addRecord() {      
        this.selectedSalesOrderId = -1;
        setTimeout(() => {
            this.selectedSalesOrderId = 0;
            this.selectedSalesInvoiceId = 0;
            this.hidetext = true;
        }, 50);
    }

    showFullScreen() {
        this.innerWidth = window.innerWidth;       
 if(this.innerWidth > 1000){ 
        FullScreen(this.rightPanelRef.nativeElement);
 }
    }

    hideFullScreen() {
        // this.hideLeftPanel = false;
        // this.sharedServiceObj.hideAppBar(false);//hiding the app bar..
    }

    cancelChanges(event) {
        if (this.type != "invoice") {
            if (this.salesOrdersList.length > 0 && (this.selectedSalesOrderId != undefined && this.selectedSalesOrderId != 0)) {
                this.onRecordSelection(this.selectedSalesOrderId);
                //setting this variable to true so as to show the sales details
                this.hidetext = true;
            }
            else if (this.salesOrdersList.length > 0) {
                this.hidetext = null;
                this.onRecordSelection(this.salesOrdersList[0].SalesOrderId);
            }
            else {
                this.hidetext = true;
            }
        }
        else {
            if (this.salesInvoiceList.length > 0 && (this.selectedInvoiceId != undefined && this.selectedInvoiceId != 0)) {
                this.onRecordSelection(this.selectedInvoiceId);
            }
            else if (this.salesInvoiceList.length > 0) {
                this.hidetext = null;
                this.onRecordSelection(this.salesInvoiceList[0].SalesInvoiceId);
            }
            else {
                this.hidetext = true;
            }
        }

        this.hideFullScreen();
    }
    /**
     * to delete the selected record...
     */
    deleteRecord() {

    }

    editRecord() {
        this.hidetext = false;
        this.showFullScreen();
    }

    split() {
        this.leftsection = !this.leftsection;
        this.rightsection = !this.rightsection;
    }

    matselect(event) {
        if (event.checked == true) {
            this.slideactive = true;
        }
        else {
            this.slideactive = false;
        }
    }
    //for custome sort
    customSort(event: SortEvent) {
        event.data.sort((data1, data2) => {
            let value1;
            let value2;
            if (event.field == "Name") {
                value1 = data1["Item"]["ItemName"];
                value2 = data2["Item"]["ItemName"];
            }
            else if (event.field == "MeasurementUnitID") {
                value1 = data1["Item"]["MeasurementUnitCode"];
                value2 = data2["Item"]["MeasurementUnitCode"];
            }
            else if (event.field == "ItemTotal") {
                value1 = data1["ItemQty"] * data1["Unitprice"];
                value2 = data2["ItemQty"] * data2["Unitprice"];
            }
            else {
                value1 = data1[event.field];
                value2 = data2[event.field];
            }
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

    onSearchClick() {
        if (this.type != "invoice") {
            if (this.salesOrderSearchKey != "") {
                if (this.salesOrderSearchKey.length >= 3) {
                    if (!this.isApproval) {
                        this.getAllSearchSalesOrders(this.salesOrderSearchKey, 0, 0, "");
                    }
                    else {
                        this.searchForSalesOrdersApprovals(0, 0, 0);
                    }
                }
            }
            else {
                this.getSalesOrders(0);
            }
        }
        else {
            if (this.salesInvoiceSearchKey != "") {
                if (this.salesInvoiceSearchKey.length >= 3) {
                    this.getAllSearchSalesInvoices(this.salesInvoiceSearchKey, 0);
                }
            }
            else {
                this.getSalesInvoices(0);
            }
        }
    }

    onSearchInputChange(event: any, type) {
        if (type.toLowerCase() != "invoice") {
            if (event.target.value != "") {
                if (event.target.value.length >= 3) {
                    if (!this.isApproval) {
                        this.getAllSearchSalesOrders(event.target.value, 0, 0, "");
                    }
                    else {
                        this.salesOrderSearchKey = event.target.value;
                        this.searchForSalesOrdersApprovals(0, 0, 0);
                    }
                }
            }
            else {
                this.getSalesOrders(0);
            }
        }
        else {
            if (this.salesInvoiceSearchKey != "") {
                if (event.target.value.length >= 3) {
                    this.salesInvoiceSearchKey = event.target.value;
                    this.getAllSearchSalesInvoices(this.salesInvoiceSearchKey, 0);
                }
            }
            else {
                this.getSalesInvoices(0);
            }
        }
    }

    readListView(recordId: number) {
        this.hidetext = false;
        this.hideFullScreen();
        this.salesOrderPagerConfig.RecordsToSkip = 0;
        if (this.type != "invoice") {
            this.getSalesOrders(0);
        }
        else {
            this.getSalesInvoices(0);
        }
    }

    pageChange(currentPageNumber: any, type: string) {
        if (type.toLowerCase() != "invoice") {
            this.salesOrderPagerConfig.RecordsToSkip = this.salesOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            if (this.salesOrderSearchKey != "" && this.salesOrderSearchKey != null) {
                if (this.salesOrderSearchKey.length >= 3) {
                    if (!this.isApproval) {
                        this.getAllSearchSalesOrders(this.salesOrderSearchKey, 0, 0, "");
                    }
                    else {
                        this.searchForSalesOrdersApprovals(0, 0, 0);
                    }
                }
            }
            else {
                this.getSalesOrders(0);
            }
        }
        else {

            this.salesOrderPagerConfig.RecordsToSkip = this.salesOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            this.getSalesInvoices(0);
        }
    }

    onPDFPrint() {
        let id = 0;
        let type = "";      
        if (this.selectedSalesOrderId > 0 || this.selectedInvoiceId > 0) {
            if (this.type != "invoice") {
                type = "salesorder";
                id = this.selectedSalesOrderId;
            }
            else {
                type = this.type;
                id = this.selectedInvoiceId;
            }
            let pdfDocument = this.soCreationObj.printDetails(id, this.companyId, type);
            pdfDocument.subscribe((data) => {
                let result = new Blob([data], { type: 'application/pdf' });
                const fileUrl = URL.createObjectURL(result);
                let tab = window.open();
                tab.location.href = fileUrl;
            });
        }
    }

    sendMailtoCustomer() {
        let result = <Observable<Array<any>>>this.soCreationObj.sendSalesOrderMailtoCustomer(this.selectedSalesOrderId, this.companyId);
        result.subscribe((data) => {
            if (data) {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.EmailResponse,
                    MessageType: MessageTypes.Success
                });
            }
        });
    }

    updateStatus(data: SoApprovalUpdateStatus) {
        if (!this.isApproval) {
            let remarks = data;
            let workFlowStatus: SoApproval = {
                SalesOrderId: this.selectedSalesOrderId,
                UserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
                WorkFlowStatusId: data.StatusId,
                Remarks: data.Remarks,
                SalesOrderRequestUserId: this.salesOrdersList.find(j => j.SalesOrderId == this.selectedSalesOrderId).CreatedBy,
                ApproverUserId: data.ApproverUserId,
                ProcessId: data.ProcessId,
                SalesOrderCode: data.SoCode,
                CompanyId:data.CompanyId
            };
            this.remarks = data.Remarks;
            this.soCreationObj.updateSalesOrderStatus(workFlowStatus)
                .subscribe((response) => {
                    this.remarks = "";
                    this.salesOrderSearchKey = "";
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.EmailResponse,
                        MessageType: MessageTypes.Success
                    });
                    this.getSalesOrders((data.StatusId == 4 || data.StatusId == 5) ? 0 : workFlowStatus.SalesOrderId);
                });
        }
        else {
            let remarks = "";
            let successMessage = "";
            if (data.StatusId == 4) {
                if (data.Remarks != "" && data.Remarks != null) {
                    remarks = data.Remarks;
                }
                else {
                    remarks = "Approved";
                }
                successMessage = Messages.Approved;
            }
            else if (data.StatusId == 5) {
                if (data.Remarks != "" && data.Remarks != null) {
                    remarks = data.Remarks;
                }
                else {
                    remarks = "Rejected";
                }
                successMessage = Messages.Rejected;
            }
            else {
                remarks = data.Remarks;
                successMessage = Messages.SentForClarification;
            }
            let workFlowStatus: SoApproval = {
                SalesOrderId: this.selectedSalesOrderId,
                UserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
                WorkFlowStatusId: data.StatusId,
                Remarks: data.Remarks,
                SalesOrderRequestUserId: this.salesOrdersList.find(j => j.SalesOrderId == this.selectedSalesOrderId).CreatedBy,
                ApproverUserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
                ProcessId: data.ProcessId,
                SalesOrderCode: data.SoCode,
                CompanyId:data.CompanyId
            };
            this.remarks = remarks;
            this.soCreationObj.updateSalesOrderApprovalStatus(workFlowStatus)
                .subscribe((response) => {
                    this.remarks = "";
                    this.salesOrderSearchKey = "";
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: successMessage,
                        MessageType: MessageTypes.Success
                    });

                    this.getSalesOrders((data.StatusId == 4 || data.StatusId == 5) ? 0 : workFlowStatus.SalesOrderId);
                });
        }
    }

    openDialog() {
        this.showFilterPopUp = true;
        if (this.sorCodeRef != undefined) {
            this.sorCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.sorCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.showFilterPopUp = false;
        this.initDone = true;
        this.resetFilters();
    }

    resetFilters() {
        if (this.type != "invoice") {
            this.soFilterInfoForm.get('SOCode').setValue("");
            this.soFilterInfoForm.get('Customer').setValue("");
            this.soFilterInfoForm.get('Facilities').setValue("");
            this.soFilterInfoForm.get('Ticket').setValue("");
            this.filterMessage = "";

            if (this.salesOrdersList.length > 0) {
                this.getSalesOrders(0);
            }
            else {
                this.getSalesOrders(0);
            }

            this.isFilterApplied = false;
            this.showFilterPopUp = false;

            if (this.sorCodeRef != undefined) {
                this.sorCodeRef.nativeElement.focus();
                this.renderer.invokeElementMethod(this.sorCodeRef.nativeElement, 'focus'); // NEW VERSION
            }

        }
        else {
            this.salesInvoiceFilterInfoForm.get('SalesInvoiceCode').setValue("");
            this.salesInvoiceFilterInfoForm.get('Customer').setValue("");
            this.filterMessage = "";
            if (this.salesInvoiceList.length > 0) {
                this.getSalesInvoices(0);
            }

            this.isFilterApplied = false;
            if (this.soInvoiceCodeRef != undefined) {
                this.soInvoiceCodeRef.nativeElement.focus();
                this.renderer.invokeElementMethod(this.soInvoiceCodeRef.nativeElement, 'focus'); // NEW VERSION
            }
        }
    }

    filterData() {
        let soCode: string = "";
        let customer: Customer = new Customer();
        let ticketNo: string = '';
        let unitNo: string = "";
        let salesInoiceCode = "";
        this.filterMessage = "";
        if (this.type != "invoice") {
            if (this.soFilterInfoForm.get('SOCode').value != "") {
                soCode = this.soFilterInfoForm.get('SOCode').value;
            }
            if (this.soFilterInfoForm.get('Customer').value != "") {
                customer = this.soFilterInfoForm.get('Customer').value;
            }
            if (this.soFilterInfoForm.get('Ticket').value != "") {
                ticketNo = this.soFilterInfoForm.get('Ticket').value.TicketNo;
            }
            if (this.soFilterInfoForm.get('Facilities').value != "") {
                unitNo = this.soFilterInfoForm.get('Facilities').value.UnitNumber;
            }

            if (soCode === '' && customer.CustomerName === '' && ticketNo === '' && (unitNo == "" || unitNo == null)) {
                if (open) {
                    this.filterMessage = "Please select any filter criteria";
                }
                return;
            }

            if (this.salesOrderSearchKey == null) {
                this.salesOrderSearchKey = "";
            }

            //this.isFilterApplied = true;
            //this.showFilterPopUp = false;
            if (!this.isApproval) {
                this.getAllSearchSalesOrders(this.salesOrderSearchKey, 0, 0, unitNo, soCode, customer.CustomerName, ticketNo);
            }
            else {
                this.searchForSalesOrdersApprovals(0, 0, 0, soCode, customer.CustomerName);
            }
        }
        else {
            if (this.salesInvoiceFilterInfoForm.get('SalesInvoiceCode').value != "") {
                salesInoiceCode = this.salesInvoiceFilterInfoForm.get('SalesInvoiceCode').value;
            }

            if (this.salesInvoiceFilterInfoForm.get('Customer').value != "") {
                customer = this.salesInvoiceFilterInfoForm.get('Customer').value.SupplierName;
            }

            if (salesInoiceCode === '' && customer.CustomerName === '') {
                if (open) {
                    this.filterMessage = "Please select any filter criteria";
                }
                return;
            }

            if (this.salesInvoiceSearchKey == null) {
                this.salesInvoiceSearchKey = "";
            }

            this.isFilterApplied = true;
            this.showFilterPopUp = false;

            this.getAllSearchSalesInvoices(this.salesInvoiceSearchKey, 0, salesInoiceCode, customer.CustomerName);
        }
    }

    //this method is used to format the content to be display in the autocomplete textbox after selection..
    customerInputFormater = (x: Customer) => x.CustomerName;
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    customerSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getAllSearchCustomers({
                    searchKey: term,
                    customerCategoryId: 0,  //this.salesOrderForm.get('CustomerCategoryId').value,
                    companyId: this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
        );

    tucketInputFormater = (x: TicketList) => x.TicketNo;
    ticketSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.soCreationObj.getAllSearchTickets({
                    Search: term,
                    companyId: this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
        );

    facilityInputFormater = (x: Facilities) => x.UnitNumber;
    facilitySearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getFacilities({
                    searchKey: term,
                    companyId: this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
        );
}    
