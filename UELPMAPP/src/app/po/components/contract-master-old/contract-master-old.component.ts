import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { SortEvent } from 'primeng/primeng';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { POFilterModel } from "../../models/po-creation.model";
import { PagerConfig, Messages, MessageTypes, PurchaseOrderType, Suppliers, WorkFlowStatus, WorkFlowStatusModel, WorkFlowProcess, UserDetails } from "../../../shared/models/shared.model";
import { FullScreen, getProcessId, HideFullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { PoApprovalUpdateStatus, PoApproval } from '../../models/po-approval.model';
import { ContractPoDisplayResult, ContractPurchaseOrder } from "../../models/contract-purchase-order.model";
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { ContractMasterService } from '../../services/contract-master.service';
import { POCreationService } from "../../services/po-creation.service";
import { runInThisContext } from 'vm';
import { Router } from '@angular/router';
@Component({
    selector: 'app-contract-mater-old',
    templateUrl: './contract-master-old.component.html',
    styleUrls: ['./contract-master-old.component.css'],
    providers: [ContractMasterService, POCreationService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ContractMasterOldComponent implements OnInit {
    userDetails: UserDetails = null;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('poCode') private porCodeRef: any;
    selectedPurchaseOrderTypeId: number = PurchaseOrderType.ContractPoFixed;
    selectedPurchaseOrderId: number = -1;
    purchaseOrdersList: Array<ContractPurchaseOrder> = [];
    purchaseOrderPagerConfig: PagerConfig;
    purchaseOrderSearchKey: string;
    leftsection: boolean = false;
    rightsection: boolean = false;
    slideactive: boolean = false;
    hideText?: boolean = null;
    companyId: number;
    isApprovalPage: boolean = false;
    remarks: string = "";
    showLeftPanelLoadingIcon: boolean = false;
    errorMessage: string = Messages.NoRecordsToDisplay;
    showFilterPopUp: boolean = false;
    isFilterApplied: boolean = false;
    poFilterInfoForm: FormGroup;
    filterMessage: string = "";
    purchaseOrderType = PurchaseOrderType;
    workFlowStatuses: Array<WorkFlowStatusModel> = [];
    workFlowStatusesPoc: Array<WorkFlowStatusModel> = [];
    showEmailButton: boolean = false;
    showPrintButton: boolean = false;
    currentPage: number = 1;
    isMaster: boolean = true;
    workFlowStatus: any;
    newPermission: boolean;
    printPermission: boolean;
    editPermission: boolean;
    approvePermission: boolean;
    voidPermission: boolean;
    terminatePermission: boolean;
    backButtonVisible: boolean = false;
    viewLogPermission: boolean = false;
    showLogPopUp: boolean = false;
    selectedPurchaseOrderCode: string;
    public innerWidth: any;
    constructor(private pocreationObj: POCreationService,
        private contractMasterObj: ContractMasterService,
        public sessionService: SessionStorageService,
        private sharedServiceObj: SharedService,
        public activatedRoute: ActivatedRoute,
        private renderer: Renderer,
        private formBuilderObj: FormBuilder,
        private reqDateFormatPipe: RequestDateFormatPipe,
        private router: Router
    ) {
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();
        console.log("companyid", this.companyId);
        this.poFilterInfoForm = this.formBuilderObj.group({
            POCode: [''],
            SupplierName: [''],
            PoTypeId: [0],
            WorkFlowStatusId: [0],
            FromDate: [],
            ToDate: []
        });
    }
    ngOnInit() {
        let cpoid = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (this.isMaster) {
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "contractmaster")[0];
                let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
                if (auditLogRole != null)
                    this.viewLogPermission = auditLogRole.IsView;
                this.newPermission = formRole.IsAdd;
                this.printPermission = formRole.IsPrint;
                this.terminatePermission = formRole.IsVoid;
            }
            else {
                this.newPermission = true;
                this.printPermission = true;
                this.terminatePermission = true;
            }
        }
        else {
            // if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            //     let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "poc")[0];
            //     this.editPermission = formRole.IsEdit;
            //     this.approvePermission = formRole.IsApprove;
            //     this.voidPermission=formRole.IsVoid;
            // }
            // else {
            //     this.editPermission = true;
            //     this.approvePermission = true;
            //     this.voidPermission=true;
            // }
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "purchaseorderapproval")[0];
                this.approvePermission = formRole.IsApprove;
            }
            else {
                this.approvePermission = true;
            }
        }

        //this.checkPermission();
        this.purchaseOrderPagerConfig = new PagerConfig();
        this.resetPagerConfig();
        //getting the purchase orders list..
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                //getting the purchase orders list..
                if (this.companyId != data) {
                    this.companyId = data;
                    //getting the purchase orders list..
                    this.getPurchaseOrders(0, cpoid);
                }
            });
        this.activatedRoute.paramMap.subscribe((data) => {
            this.navigateToPage();
            this.GetWorkFlowStatus();
        });
        this.activatedRoute.queryParamMap.subscribe((data) => {
            if (this.activatedRoute.snapshot.queryParamMap.get('type') != null) {
                this.navigateToPage();
                this.GetWorkFlowStatus();
            }
        });

        this.workFlowStatus = WorkFlowStatus;
    }
    GetWorkFlowStatus() {
        this.sharedServiceObj.getWorkFlowStatus(WorkFlowProcess.ContractPOFixed).subscribe((data: Array<WorkFlowStatusModel>) => {
            if (this.isMaster == false) {
                this.workFlowStatusesPoc = data.filter(data => data.WorkFlowStatusid != WorkFlowStatus.Draft && data.WorkFlowStatusid != WorkFlowStatus.ReturnForVoidClarifications && data.WorkFlowStatusid != WorkFlowStatus.Rejected
                    && data.WorkFlowStatusid != WorkFlowStatus.PendingForTerminationApproval && data.WorkFlowStatusid != WorkFlowStatus.SendToSupplier && data.WorkFlowStatusid != WorkFlowStatus.PreTerminate
                    && data.WorkFlowStatusid != WorkFlowStatus.ReturnForVoidClarifications && data.Statustext != 'Pending Approval' && data.Statustext != 'Return for Clarifications');
            }
            else {
                this.workFlowStatuses = data.filter(data => data.Statustext == 'Open' ? data.Statustext = 'Approved' : data.Statustext &&
                    data.WorkFlowStatusid != WorkFlowStatus.Accrued && data.WorkFlowStatusid != WorkFlowStatus.Invoiced && data.WorkFlowStatusid != WorkFlowStatus.SendToSupplier
                    && data.WorkFlowStatusid != WorkFlowStatus.Expired && data.WorkFlowStatusid != WorkFlowStatus.Void);
            }
        });
    }

    // checkPermission(){
    //     debugger;
    //     let roleAccessLevels = this.sessionService.getRolesAccess();
    //     if(this.isMaster){
    //     if (roleAccessLevels != null && roleAccessLevels.length > 0) {
    //         let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "contractmaster")[0];
    //         this.editPermission = formRole.IsEdit;
    //         this.approvePermission = formRole.IsApprove;
    //         this.terminatePermission=formRole.IsVoid;          
    //     }
    //     else {
    //         this.editPermission = true;
    //         this.approvePermission = true;
    //         this.terminatePermission=true;
    //     }
    //   }
    //   else{
    //     if (roleAccessLevels != null && roleAccessLevels.length > 0) {
    //         let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "poc")[0];
    //         this.editPermission = formRole.IsEdit;
    //         this.approvePermission = formRole.IsApprove;
    //         this.voidPermission=formRole.IsVoid;
    //     }
    //     else {
    //         this.editPermission = true;
    //         this.approvePermission = true;
    //         this.voidPermission=true;
    //     }
    //   }
    // }

    navigateToPage() {
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');
        let assetTransferId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        console.log(this.activatedRoute.snapshot.queryParams);
        if (this.activatedRoute.snapshot.queryParams.type == "master") {//if it is "asset transfer request      
            this.isMaster = true;
            this.backButtonVisible = false;
        }
        else if (this.activatedRoute.snapshot.queryParams.type == "child") {//if request is for "asset transfer request approval"
            this.isMaster = false;
            this.backButtonVisible = true;

        }
        if (this.isMaster == false && assetTransferId == 0) {
            this.purchaseOrderPagerConfig.RecordsToSkip = 0;
            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, assetTransferId);
            this.GetWorkFlowStatus();

        }
        console.log("navigateddd", assetTransferId, this.isMaster);
        if (assetTransferId > 0) {
            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, assetTransferId);
        }
        else {
            if (this.purchaseOrderSearchKey === "" || this.purchaseOrderSearchKey === null) {
                this.getPurchaseOrders(0, 0);
            }
        }
    }
    onCpoBack() {
        this.backButtonVisible = false;
        this.router.navigate(['/po/contractpo'], {
            queryParams: {
                type: 'master'
            }
        });

    }
    //to get  the purchase orders..
    getPurchaseOrders(purchaseOrderIdToBeSelected: number, CPOID: number) {
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            CompanyId: this.companyId,
            IsMasterPo: this.isMaster,
            IsSelectAll: false,
            UserId: this.userDetails.UserID,
            CPOID: CPOID
        };
        this.showLeftPanelLoadingIcon = true;
        this.contractMasterObj.getContractPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: ContractPoDisplayResult) => {
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.purchaseOrdersList.length > 0) {
                    if (purchaseOrderIdToBeSelected == 0) {
                        this.onRecordSelection(this.purchaseOrdersList[0].CPOID);
                    }
                    else {
                        this.onRecordSelection(purchaseOrderIdToBeSelected);
                    }
                }
                else {
                    this.hideText = true;
                    // this.addRecord();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    //to get list of purchase orders..
    getAllSearchPurchaseOrder(searchKey: string, purchaseOrderIdToBeSelected: number, poFilterData?: POFilterModel) {
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            Search: (searchKey == null || searchKey == "null") ? "" : searchKey,
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID,
            PurchaseOrderId: purchaseOrderIdToBeSelected,
            IsMasterPo: this.isMaster,
            PoCode: (poFilterData == undefined || poFilterData == null || poFilterData.POCode == undefined) ? "" : poFilterData.POCode,
            SupplierName: (poFilterData == undefined || poFilterData == null || poFilterData.SupplierName == undefined || poFilterData.SupplierName == null) ? "" : poFilterData.SupplierName,
            WorkFlowStatusId: (poFilterData == undefined || poFilterData == null) ? 0 : poFilterData.WorkFlowStatusId,
            FromDate: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.FromDate == null ? null : this.reqDateFormatPipe.transform(poFilterData.FromDate),
            ToDate: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.ToDate == null ? null : this.reqDateFormatPipe.transform(poFilterData.ToDate)
        };
        this.showLeftPanelLoadingIcon = true;
        this.contractMasterObj.getAllSearchContractPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: ContractPoDisplayResult) => {
                this.showLeftPanelLoadingIcon = false;
                if (data.PurchaseOrders.length > 0) {
                    this.showFilterPopUp = false;
                    this.purchaseOrdersList = data.PurchaseOrders;
                    this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                    if (purchaseOrderIdToBeSelected == 0) {
                        this.onRecordSelection(this.purchaseOrdersList[0].CPOID);
                    }
                    else {
                        this.onRecordSelection(purchaseOrderIdToBeSelected);
                    }
                }
                else {
                    this.showFilterPopUp = true;
                    this.hideText = true;
                    this.filterMessage = "No matching records are found";
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId: number) {
        // this.selectedPurchaseOrderTypeId = PurchaseOrderType.ContractPoFixed;
        this.selectedPurchaseOrderId = -1;
        if (this.purchaseOrdersList.find(j => j.CPOID == purchaseOrderId).WorkFlowStatusId == WorkFlowStatus.Approved) {
            this.showEmailButton = true;
        }
        else {
            this.showEmailButton = false;
        }



        let record = this.purchaseOrdersList.find(j => j.CPOID == purchaseOrderId);
        this.selectedPurchaseOrderCode = record.CPONumber || record.DraftCode;
        if (record != null && record != undefined) {
            this.selectedPurchaseOrderTypeId = record.POTypeId;
        }
        if (record != undefined && record != null && ((record.WorkFlowStatusId == WorkFlowStatus.Draft) || (record.WorkFlowStatusId == WorkFlowStatus.WaitingForApproval) || (record.WorkFlowStatusId == WorkFlowStatus.Rejected))) {
            this.showPrintButton = false;
        }
        else {
            this.showPrintButton = true;
        }

        setTimeout(() => {
            this.selectedPurchaseOrderId = purchaseOrderId;
            this.hideText = true;
        }, 50);
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
    /**
     * to hide the category details and show in add mode..
     */
    addRecord() {

        this.innerWidth = window.innerWidth;
        if (this.innerWidth < 550) {
            $(".leftdiv").addClass("hideleftcol");
            $(".rightPanel").addClass("showrightcol");
        }

        this.hideText = true;
        this.selectedPurchaseOrderId = -1;
        setTimeout(() => {
            this.selectedPurchaseOrderId = 0;
            this.hideText = false;
        }, 50);
    }

    showLeftCol(event) {
        $(".leftdiv").removeClass("hideleftcol");
        $(".rightPanel").removeClass("showrightcol");
    }

    showFullScreen() {
        //console.log("came here...");
        this.innerWidth = window.innerWidth;

        if (this.innerWidth > 1000) {
            FullScreen(this.rightPanelRef.nativeElement);
        }

        //  this.hideLeftPanel = true;
        // this.sharedServiceObj.hideAppBar(true);//hiding the app bar..
    }
    hideFullScreen() {
        HideFullScreen(this.rightPanelRef.nativeElement);
        // this.hideLeftPanel = false;
        // this.sharedServiceObj.hideAppBar(false);//hiding the app bar..
    }

    cancelChanges() {
        if (this.purchaseOrdersList.length > 0 && (this.selectedPurchaseOrderId != undefined && this.selectedPurchaseOrderId != 0)) {
            this.onRecordSelection(this.selectedPurchaseOrderId);
            //setting this variable to true so as to show the purchase details
            this.hideText = true;
        }
        else if (this.purchaseOrdersList.length > 0) {
            this.hideText = null;
            this.onRecordSelection(this.purchaseOrdersList[0].CPOID);
        }
        else {
            this.hideText = true;
            this.hideFullScreen();
        }

    }
    /**
     * to delete the selected record...
     */
    deleteRecord() {

    }
    /**
     * to show the purchase order details in edit mode....
     */
    editRecord() {
        this.hideText = false;
        this.showFullScreen();
    }
    splite() {
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
        if (this.purchaseOrderSearchKey != "") {
            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0);
        }
        else {
            this.getPurchaseOrders(0, 0);
        }
    }
    resetPagerConfig() {
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderPagerConfig.RecordsToFetch = 10;
        this.currentPage = 1;
    }
    onSearchInputChange(event: any) {
        this.resetPagerConfig();
        if (event.target.value != "") {
            if (event.target.value.length >= 3) {

                this.getAllSearchPurchaseOrder(event.target.value, 0);
            }
        }
        else {
            this.getPurchaseOrders(0, 0);
        }
    }
    readListView(recordId: number) {
        this.hideText = false;
        //this.hideFullScreen();
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.getPurchaseOrders(0, 0);
    }
    pageChange(currentPageNumber: any) {
        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.purchaseOrderPagerConfig.RecordsToSkip = this.purchaseOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            let filterData: POFilterModel = this.poFilterInfoForm.value;
            //  console.log(filterData);
            if ((this.purchaseOrderSearchKey != "" && this.purchaseOrderSearchKey != null) ||
                (filterData.POCode != "" || Number(filterData.PoTypeId) > 0 || filterData.SupplierName != "" || filterData.WorkFlowStatusId > 0
                    || (filterData.FromDate != null && filterData.ToDate != null))
            ) {
                this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0, filterData);
            }
            else {
                this.getPurchaseOrders(0, 0);
            }
        }
    }
    onPDFPrint() {
        if (this.selectedPurchaseOrderId > 0) {
            let pdfDocument = this.pocreationObj.printDetails(this.selectedPurchaseOrderId, this.selectedPurchaseOrderTypeId, this.companyId);
            pdfDocument.subscribe((data) => {

                let record = this.purchaseOrdersList.find(j => j.CPOID === this.selectedPurchaseOrderId && j.POTypeId === this.selectedPurchaseOrderTypeId);
                if (record.CPONumber == null && record.CPONumber == undefined) {
                    saveAs(new Blob([(data)], { type: 'application/pdf' }), "CPO" + record.DraftCode + ".pdf");
                }
                else
                    saveAs(new Blob([(data)], { type: 'application/pdf' }), "CPO" + record.CPONumber + ".pdf");
                // let result = new Blob([data], { type: 'application/pdf' });
                // if (window.navigator && window.navigator.msSaveOrOpenBlob) {//IE
                //     window.navigator.msSaveOrOpenBlob(result, "ContractPO.pdf");


                //   } else{
                // const fileUrl = URL.createObjectURL(result);
                // let tab = window.open();
                // tab.location.href = fileUrl;
                //   }
            });
        }
    }
    sendMailtoSupplier() {
        let poTypeId = this.selectedPurchaseOrderTypeId;
        let poId = this.selectedPurchaseOrderId;
        let result = <Observable<Array<any>>>this.pocreationObj.sendPurchaseOrderMailtoSupplier(poId, this.companyId, poTypeId);
        result.subscribe((data) => {
            if (data) {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.EmailResponse,
                    MessageType: MessageTypes.Success
                });
                this.getPurchaseOrders(this.selectedPurchaseOrderId, 0);
            }
        });
    }
    updateStatus(data: PoApprovalUpdateStatus) {
        let remarks = data;
        let workFlowStatus: PoApproval = {
            PurchaseOrderId: this.selectedPurchaseOrderId,
            UserId: JSON.parse(sessionStorage.getItem('userDetails')).UserID,
            WorkFlowStatusId: data.StatusId,
            Remarks: data.Remarks,
            PurchaseOrderRequestUserId: this.purchaseOrdersList.find(j => j.CPOID == this.selectedPurchaseOrderId).CreatedBy,
            ApproverUserId: data.ApproverUserId,
            ProcessId: data.ProcessId,
            PurchaseOrderCode: data.PoCode,
            CompanyId: data.CompanyId
        };
        this.remarks = data.Remarks;
        this.pocreationObj.updatePurchaseOrderApprovalStatus(workFlowStatus)
            .subscribe((response) => {
                this.remarks = "";
                this.purchaseOrderSearchKey = "";
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.EmailResponse,
                    MessageType: MessageTypes.Success
                });
                this.getPurchaseOrders((data.StatusId == WorkFlowStatus.Approved || data.StatusId == WorkFlowStatus.Rejected) ? 0 : workFlowStatus.PurchaseOrderId, 0);
            });
    }
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
        this.resetFilters();
    }
    displayLogPopUp() {
        this.showLogPopUp = true;
    }
    hideLogPopUp(hidePopUp: boolean) {
        this.showLogPopUp = false;
    }
    resetFilters() {
        this.poFilterInfoForm.reset();
        this.filterMessage = "";
        this.purchaseOrderSearchKey = "";
        this.resetPagerConfig();
        this.getPurchaseOrders(0, 0);
        this.isFilterApplied = false;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    filterData() {
        this.filterMessage = "";
        let poFilterData: POFilterModel = this.poFilterInfoForm.value;
        if (this.poFilterInfoForm.get('SupplierName').value != null) {
            poFilterData.SupplierName = this.poFilterInfoForm.get('SupplierName').value.SupplierName;
        }
        if (this.poFilterInfoForm.get('POCode').value != null) {
            poFilterData.POCode = this.poFilterInfoForm.get('POCode').value;
        }
        if (this.poFilterInfoForm.get('PoTypeId').value != null) {
            poFilterData.PoTypeId = this.poFilterInfoForm.get('PoTypeId').value;
        }
        if (this.poFilterInfoForm.get('WorkFlowStatusId').value != null) {
            poFilterData.WorkFlowStatusId = this.poFilterInfoForm.get('WorkFlowStatusId').value;
        }
        if (this.poFilterInfoForm.get('FromDate').value != null) {
            poFilterData.FromDate = this.reqDateFormatPipe.transform(this.poFilterInfoForm.get('FromDate').value);
        }
        if (this.poFilterInfoForm.get('ToDate').value != null) {
            poFilterData.ToDate = this.reqDateFormatPipe.transform(this.poFilterInfoForm.get('ToDate').value);
        }

        if ((poFilterData.POCode === '' || poFilterData.POCode === null)
            && (poFilterData.SupplierName === '' || poFilterData.SupplierName === null)
            && (poFilterData.PoTypeId == 0 || poFilterData.PoTypeId == null)
            && (poFilterData.WorkFlowStatusId == null || poFilterData.WorkFlowStatusId == 0)
            && (poFilterData.FromDate == null && poFilterData.ToDate == null)) {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
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
        this.resetPagerConfig();
        this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0, poFilterData);
        if (this.purchaseOrdersList.length > 0) {
            this.isFilterApplied = true;
            if (open) {
                this.showFilterPopUp = true;
            }
        }
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
}
