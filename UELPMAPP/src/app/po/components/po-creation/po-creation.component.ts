import { Component, OnInit, ViewChild, Renderer, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { SortEvent } from 'primeng/primeng';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { PurchaseOrderList, PurchaseOrderDisplayResult, PurchaseOrderTypes, POFilterModel } from "../../models/po-creation.model";
import { POCreationService } from "../../services/po-creation.service";
import { PagerConfig, Messages, MessageTypes, PurchaseOrderType, WorkFlowProcess, Suppliers, WorkFlowStatus, WorkFlowStatusModel, UserDetails } from "../../../shared/models/shared.model";
import { FullScreen, PrintScreen, getProcessId, HideFullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { PoApprovalUpdateStatus, PoApproval } from '../../models/po-approval.model';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-po-creation',
    templateUrl: './po-creation.component.html',
    styleUrls: ['./po-creation.component.css'],
    providers: [POCreationService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class PoCreationComponent implements OnInit {
    userDetails: UserDetails = null;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('poCode') private porCodeRef: any;
    showPurchaseOrderTypeDialog: boolean = false;
    selectedPurchaseOrderTypeId: number = 0;
    selectedPurchaseOrderId: number = 0;
    selectedPurchaseOrderCode: string;
    purchaseOrdersList: Array<PurchaseOrderList> = [];
    purchaseOrderPagerConfig: PagerConfig;
    purchaseOrderSearchKey: string;
    leftsection: boolean = false;
    rightsection: boolean = false;
    slideactive: boolean = false;
    hideText?: boolean = null;
    purchaseOrderTypes: Array<PurchaseOrderTypes> = [];
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
    showEmailButton: boolean = false;
    showPrintButton: boolean = false;
    currentPage: number = 1;
    workFlowStatus: any;
    scrollbarOptions: any;
    showEmailPopUp: boolean = false;
    showLogPopUp: boolean = false;
    SupplierId: number = 0;
    PurchaseOrderId: number = 0;
    PurchaseOrderTypeId: number = 0;
    newPermission: boolean;
    PoTypeId:any;
    PurchaseOrderTypeS:string;
    emailPermission: boolean;
    printPermission: boolean;
    isCompanyChanged: boolean = false;
    viewLogPermission: boolean = false;
    SupplierNameValidate: string = "";
    showfilters: boolean = false;
    showfilterstext: string = "Hide List";

    pPurchaseOrderId: string = "0";
    pPurchaseOrderTypeId: string = "0";
    pSupplierId: string = "0";

    POOrderId: number = 0;
    POOrderTypeId: number = 0;
    SupplierID: number = 0;


    public innerWidth: any;


    type:string;
    id:any;
    code:any;
    processId:any;
    dat:any;

    constructor(
        private router: Router,
        private pocreationObj: POCreationService,
        public sessionService: SessionStorageService,
        private sharedServiceObj: SharedService,
        public activatedRoute: ActivatedRoute,
        private renderer: Renderer,
        private formBuilderObj: FormBuilder,
        private reqDateFormatPipe: RequestDateFormatPipe) {
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();
        this.poFilterInfoForm = this.formBuilderObj.group({
            POCode: [''],
            SupplierName: [''],
            PoTypeId: [0],
            WorkFlowStatusId: [0],
            FromDate: [],
            ToDate: []
        });
        this.workFlowStatus = WorkFlowStatus;
    }
    ngOnInit() {
        //poorderid/:poordertypeid
        debugger;
        this.activatedRoute.queryParamMap.subscribe(params => console.log(params)); // output:

        this.activatedRoute.queryParamMap.subscribe((params: ParamMap) =>
        {
            console.log(params);
            this.type=params.get("type");
            this.id=params.get("id");
            this.code=params.get("code");
            this.processId=params.get("processId");
            this.dat=params.get("dat");

            let PDate=new Date(this.dat);

            console.log(`type=${this.type}--id=${this.id}--code=${this.code}--processid=${this.processId}--dat=${this.dat}`)
            console.log(PDate);
            
        });
        debugger;
        if(this.id!=="")
        {
            this.POOrderId = parseInt(this.id);
        }
        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            if (param.get('poorderid') != undefined) {
                this.pPurchaseOrderId = param.get('poorderid');
                this.POOrderId = parseInt(this.pPurchaseOrderId);
            }
            if (param.get('poordertypeid') != undefined) {
                this.pPurchaseOrderTypeId = param.get('poordertypeid');
                this.POOrderTypeId = parseInt(this.pPurchaseOrderTypeId);
                this.selectedPurchaseOrderTypeId=this.POOrderTypeId;

                if(this.POOrderTypeId==1)
                {
                    this.PurchaseOrderTypeS="Inventory Po";
                }
                if(this.POOrderTypeId==2)
                {
                    this.PurchaseOrderTypeS="Fixed Asset PO";
                }
                if(this.POOrderTypeId==3)
                {
                    this.PurchaseOrderTypeS="Expense PO";
                }

            }
            if (param.get('supplierid') != undefined) {
                this.pSupplierId = param.get('supplierid');
                this.SupplierID = parseInt(this.pSupplierId);
            }
            //alert(" Purchase Order Creation \n  Purchase Order ID : " + this.pPurchaseOrderId + "\n Purchase Order Type : " + this.pPurchaseOrderTypeId + "\n Supplier Id: " + this.SupplierID);
        });

        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "po")[0];
            let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
            if (auditLogRole != null)
                this.viewLogPermission = auditLogRole.IsView;
            this.newPermission = formRole.IsAdd;
            this.printPermission = formRole.IsPrint;
            this.emailPermission = formRole.IsEmail;
        }
        else {
            this.newPermission = true;
            this.printPermission = true;
            this.emailPermission = true;
        }
        this.purchaseOrderPagerConfig = new PagerConfig();
        this.sharedServiceObj.PoDraftVisible = false;
        this.resetPagerConfig();
        //getting the purchase order types.
        this.pocreationObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                this.purchaseOrderTypes = data.filter(data => data.PurchaseOrderTypeId != PurchaseOrderType.ContractPoFixed && data.PurchaseOrderTypeId != PurchaseOrderType.ContractPoVariable && data.PurchaseOrderTypeId != PurchaseOrderType.ProjectPo);
                // this.purchaseOrderTypes.push({ PurchaseOrderTypeId:PurchaseOrderType.ContractPoFixed,PurchaseOrderType:"Contract PO" });
            });
        //getting the purchase orders list..
        this.sharedServiceObj.IsCompanyChanged$
            .subscribe((data) => {
                this.isCompanyChanged = data;
                if (this.isCompanyChanged) {
                    this.getPurchaseOrders(0, 0);
                    this.sharedServiceObj.updateCompany(false);
                }
            });
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                //getting the purchase orders list..
                if (this.companyId != data) {
                    this.companyId = data;
                    // this.navigate();
                    //  this.getPurchaseOrders(0,0);
                }
            });
        //   this.activatedRoute.queryParamMap.subscribe((data)=>{  
        //             this.navigate();
        //     });
        //     this.activatedRoute.queryParamMap.subscribe((data) => {
        //         if (this.activatedRoute.snapshot.queryParamMap.get('code') != null || Number(this.activatedRoute.snapshot.queryParamMap.get('id')) > 0) {     
        //             this.navigate();
        //         }
        //     });

        this.sharedServiceObj.getWorkFlowStatus(WorkFlowProcess.InventoryPO).subscribe((data: Array<WorkFlowStatusModel>) => {
            this.workFlowStatuses = data;
            // this.defaultStatus();
        });

        //Get Purchase Order
        

        let processId = Number(this.activatedRoute.snapshot.queryParamMap.get('processId'));
        let poModel: POFilterModel = new POFilterModel();
        poModel.PoTypeId = this.getPoTypeId(processId);
        poModel.PoTypeId = this.POOrderTypeId;

        if (this.POOrderId > 0) {
            debugger;
            //Edit Record

            //Get Purchase Order By PurchaseOrderId,PurchaseOrderType
            //this.getPurchaseOrders(this.POOrderId,this.POOrderTypeId);
            this.getAllSearchPurchaseOrder("", this.POOrderId, this.POOrderTypeId, true, poModel);

            this.editRecord();
        }
        else {
            //debugger;
            //Adding New Record
            //this.addRecord();
        }
    }


    navigate() {
        const id: number = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        this.purchaseOrderSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');
        let processId = Number(this.activatedRoute.snapshot.queryParamMap.get('processId'));

        if (this.purchaseOrderSearchKey != "" && this.purchaseOrderSearchKey != null) {

            let poModel: POFilterModel = new POFilterModel();
            poModel.PoTypeId = this.getPoTypeId(processId);
            this.getAllSearchPurchaseOrder("", id, this.getPoTypeId(processId), true, poModel);
        }
        else if (id != undefined && id != 0 && id != null) {

            let poModel: POFilterModel = new POFilterModel();
            poModel.PoTypeId = this.getPoTypeId(processId);
            this.getAllSearchPurchaseOrder("", id, poModel.PoTypeId, true, poModel);
        }
        else if (id == undefined || id == null) {
            this.getPurchaseOrders(0, 0);
        }
        else {
            // this.poFilterInfoForm.get('WorkFlowStatusId').setValue(WorkFlowStatus.Draft)
            let poModel: POFilterModel = new POFilterModel();
            // poModel.WorkFlowStatusId=WorkFlowStatus.Draft;
            this.getAllSearchPurchaseOrder("", 0, 0, false, poModel);
        }
    }

    getPoTypeId(processId: number) {
        if (processId == WorkFlowProcess.InventoryPO) {
            return PurchaseOrderType.InventoryPo
        }
        else if (processId == WorkFlowProcess.FixedAssetPO) {
            return PurchaseOrderType.FixedAssetPo
        }
        else if (processId == WorkFlowProcess.ExpensePO) {
            return PurchaseOrderType.ExpensePo
        }
    }
    //to get  the purchase orders..
    getPurchaseOrders(purchaseOrderIdToBeSelected: number, poTypeId: number) {
        // console.log(purchaseOrderIdToBeSelected,poTypeId);
        this.companyId = this.sessionService.getCompanyId();
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            UserId: this.userDetails.UserID,
            CompanyId: this.companyId
        };
        this.showLeftPanelLoadingIcon = true;
        this.pocreationObj.getPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.purchaseOrdersList.length > 0) {
                    debugger;
                    if (purchaseOrderIdToBeSelected == 0) {
                        this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId, this.purchaseOrdersList[0].POTypeId);
                    }
                    else {
                        this.onRecordSelection(purchaseOrderIdToBeSelected, poTypeId);
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
    getAllSearchPurchaseOrder(searchKey: string, purchaseOrderIdToBeSelected: number, potypeId: number, isNotification: boolean = false, poFilterData?: POFilterModel) {
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            Search: (searchKey == null || searchKey == "null") ? "" : searchKey,
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID,
            PurchaseOrderId: isNotification == true ? purchaseOrderIdToBeSelected : 0,
            //   WorkFlowProcessId:(poFilterData==undefined||poFilterData==null||poFilterData.PoTypeId==null)?getProcessId(potypeId):getProcessId(poFilterData.PoTypeId),
            WorkFlowProcessId: (poFilterData == undefined || poFilterData == null || poFilterData.PoTypeId == null) ? 0 : getProcessId(poFilterData.PoTypeId),
            PoCode: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.POCode,
            SupplierName: (poFilterData == undefined || poFilterData == null || poFilterData.SupplierName == undefined) ? null : poFilterData.SupplierName,
            //SupplierName:(poFilterData==undefined||poFilterData==null)?null:poFilterData.SupplierName,
            WorkFlowStatusId: (poFilterData == undefined || poFilterData == null) ? 0 : poFilterData.WorkFlowStatusId,
            FromDate: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.FromDate == null ? null : this.reqDateFormatPipe.transform(poFilterData.FromDate),
            ToDate: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.ToDate == null ? null : this.reqDateFormatPipe.transform(poFilterData.ToDate)
        };
        this.showLeftPanelLoadingIcon = true;
        this.pocreationObj.getAllSearchPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                this.showLeftPanelLoadingIcon = false;
                this.showFilterPopUp = false;
                this.sharedServiceObj.PORecordslength = data.PurchaseOrders.length;
                if (data.PurchaseOrders.length > 0) {
                    this.purchaseOrdersList = data.PurchaseOrders;
                    this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                    if (purchaseOrderIdToBeSelected == 0) {
                        this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId, this.purchaseOrdersList[0].POTypeId);
                    }
                    else {
                        this.onRecordSelection(purchaseOrderIdToBeSelected, potypeId);
                        //   this.onRecordSelection(purchaseOrderIdToBeSelected,this.purchaseOrdersList[0].POTypeId);
                    }
                }
                else {

                    this.hideText = true;
                    this.filterMessage = "No matching records are found";
                    this.showFilterPopUp = true;
                    this.hideFullScreen();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId: number, purchaseOrderTypeId: number) {
        debugger;
        this.split();
        // console.log(purchaseOrderId,purchaseOrderTypeId);
        this.selectedPurchaseOrderId = this.POOrderId;
        this.selectedPurchaseOrderTypeId = this.POOrderTypeId;
        this.PurchaseOrderId = this.POOrderId;
        this.PurchaseOrderTypeId = this.POOrderTypeId;

        this.SupplierId = this.SupplierID;
        this.showEmailButton = true;
        let record = this.purchaseOrdersList.find(j => j.PurchaseOrderId == purchaseOrderId && j.POTypeId == purchaseOrderTypeId);
        if (record != undefined && record != null && ((record.WorkFlowStatusId == WorkFlowStatus.Approved) || (record.WorkFlowStatusId == WorkFlowStatus.SendToSupplier))) {
            this.SupplierId = record.SupplierId;
            this.PurchaseOrderId = record.PurchaseOrderId;
            this.PurchaseOrderTypeId = record.POTypeId;
            this.showEmailButton = true;
        }
        else {
            this.showEmailButton = false;
        }

        if (record != undefined && record != null && ((record.WorkFlowStatusId == WorkFlowStatus.Draft) || (record.WorkFlowStatusId == WorkFlowStatus.WaitingForApproval) || (record.WorkFlowStatusId == WorkFlowStatus.Rejected) || (record.WorkFlowStatusId == WorkFlowStatus.Void) || (record.WorkFlowStatusId == WorkFlowStatus.AskedForClarification) || (record.WorkFlowStatusId == WorkFlowStatus.CancelledApproval))) {
            this.showPrintButton = false;
        }
        else {
            this.SupplierId = record.SupplierId;
            this.PurchaseOrderId = record.PurchaseOrderId;
            this.PurchaseOrderTypeId = record.POTypeId;
            this.showPrintButton = true;
        }
        this.selectedPurchaseOrderCode = record.PurchaseOrderCode;
        setTimeout(() => {
            this.selectedPurchaseOrderId = purchaseOrderId;
            this.hideText = true;
        }, 50);
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

        // this.hideText = true;
        // this.showPurchaseOrderTypeDialog = true;

        // this.showfilters = false;
        // this.showfilterstext = "Show List";
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
            this.onRecordSelection(this.selectedPurchaseOrderId, this.selectedPurchaseOrderTypeId);
            //setting this variable to true so as to show the purchase details
            this.hideText = true;
        }
        else if (this.purchaseOrdersList.length > 0) {
            this.hideText = null;
            this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId, this.purchaseOrdersList[0].POTypeId);
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
        //this.showFullScreen();
    }
    onClickedOutside(e: Event) {
        //  this.showfilters= false; 
        if (this.showfilters == false) {
            //  this.showfilterstext="Show List"
        }
    }
    split() {
        // this.showfilters = !this.showfilters;
        // if (this.showfilters == true) {
        //     this.showfilterstext = "Hide List"
        // }
        // else {
        //     this.showfilterstext = "Show List"
        // }
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
            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0, 0);
        }
        else {
            this.getPurchaseOrders(0, 0);
        }
    }
    // onPrintScreen(event:any)
    // {
    //     let windowObj = event.view;
    //     this.pocreationObj.printDetails(this.selectedPurchaseOrderId).subscribe((data:string)=>{

    //         PrintScreen(data,windowObj,"","Purchase Order");
    //     });
    // }

    purchaseOrderSelectionOk(purchaseOrderTypeId: number) {
        // console.log("potypeid",purchaseOrderTypeId);
        this.selectedPurchaseOrderTypeId = purchaseOrderTypeId;
        this.showPurchaseOrderTypeDialog = false;
        this.hideText = true;
        this.selectedPurchaseOrderId = -1;
        setTimeout(() => {
            this.selectedPurchaseOrderId = 0;
            this.hideText = false;
        }, 50);

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

                this.getAllSearchPurchaseOrder(event.target.value, 0, 0);
            }
        }
        else {
            this.getPurchaseOrders(0, 0);
        }
    }

    readListView(record: { PoId: number, PotypeId: number }) {
        //console.log(record);
        this.hideText = false;
        //this.hideFullScreen();
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        let filterData: POFilterModel = this.poFilterInfoForm.value;
        if ((this.purchaseOrderSearchKey != "" && this.purchaseOrderSearchKey != null) ||
            ((filterData.POCode != "" && filterData.POCode != null) || Number(filterData.PoTypeId) > 0 || (filterData.SupplierName != null && filterData.SupplierName != "")
                || (filterData.FromDate != null && filterData.ToDate != null))
        ) {
            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, record.PoId, record.PotypeId, false, filterData);
        }
        else {
            if (!this.sharedServiceObj.PoDraftVisible) {
                this.getPurchaseOrders(record.PoId, record.PotypeId);
            }
            else {
                this.getPurchaseOrders(record.PoId, record.PotypeId);
                this.getAllSearchPurchaseOrder("", record.PoId, record.PotypeId, false, filterData);
            }
        }
    }
    pageChange(currentPageNumber: any) {
        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.purchaseOrderPagerConfig.RecordsToSkip = this.purchaseOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            let filterData: POFilterModel = this.poFilterInfoForm.value;
            // console.log(filterData);
            if ((this.purchaseOrderSearchKey != "" && this.purchaseOrderSearchKey != null) ||
                (filterData.POCode != "" || Number(filterData.PoTypeId) > 0 || filterData.SupplierName != "" || filterData.WorkFlowStatusId > 0
                    || (filterData.FromDate != null && filterData.ToDate != null))
            ) {
                this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0, 0, false, filterData);
            }
            else {

                if (!this.sharedServiceObj.PoDraftVisible) {
                    this.getAllSearchPurchaseOrder("", 0, 0, false, filterData);
                }
                else {
                    this.getPurchaseOrders(0, 0);
                }
            }
        }
        this.showfilters = false;
        this.showfilterstext = "Hide List";
    }

    onPDFPrint() {
        //this.hideText=false;            
        // if(this.selectedPurchaseOrderId > 0 ){
        //     let pdfDocument = this.pocreationObj.printDetails(this.selectedPurchaseOrderId, this.selectedPurchaseOrderTypeId, this.companyId);
        //     pdfDocument.subscribe((data) => {

        //         let result = new Blob([data], { type: 'application/pdf' });
        //         const fileUrl = URL.createObjectURL(result);
        //         let tab = window.open();
        //         tab.location.href = fileUrl;
        //     });
        //  }      
        //this.hideText=false;            
        if (this.selectedPurchaseOrderId > 0) {
            let pdfDocument = this.pocreationObj.printDetails(this.selectedPurchaseOrderId, this.selectedPurchaseOrderTypeId, this.companyId);
            pdfDocument.subscribe((data) => {
                let record = this.purchaseOrdersList.find(j => j.PurchaseOrderId == this.selectedPurchaseOrderId && j.POTypeId == this.selectedPurchaseOrderTypeId);
                if (record.PurchaseOrderCode == null) {
                    saveAs(new Blob([(data)], { type: 'application/pdf' }), "PO" + record.DraftCode + ".pdf");
                }
                else
                    saveAs(new Blob([(data)], { type: 'application/pdf' }), "PO" + record.PurchaseOrderCode + ".pdf");

                // let result = new Blob([data], { type: 'application/pdf' });

                // if (window.navigator && window.navigator.msSaveOrOpenBlob) {//IE
                //   window.navigator.msSaveOrOpenBlob(result, "PurchaseOrder.pdf");                
                // } else{
                //     const fileUrl = URL.createObjectURL(result);
                // let tab = window.open();
                // tab.location.href = fileUrl;
                // }
            });
        }
    }

    sendMailtoSupplier() {
        let poTypeId = this.selectedPurchaseOrderTypeId;
        let poId = this.selectedPurchaseOrderId;
        //if(this.selectedPurchaseOrderTypeId === 1){  // currently for inventory po type
        let result = <Observable<Array<any>>>this.pocreationObj.sendPurchaseOrderMailtoSupplier(poId, this.companyId, poTypeId);
        result.subscribe((data) => {
            if (data) {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.EmailResponse,
                    MessageType: MessageTypes.Success
                });
                this.getPurchaseOrders(this.selectedPurchaseOrderId, poTypeId);
            }
        });
        //}
    }
    updateStatus(data: PoApprovalUpdateStatus) {
        let remarks = data;
        let workFlowStatus: PoApproval = {
            PurchaseOrderId: this.selectedPurchaseOrderId,
            UserId: this.userDetails.UserID,
            WorkFlowStatusId: data.StatusId,
            Remarks: data.Remarks,
            PurchaseOrderRequestUserId: this.purchaseOrdersList.find(j => j.PurchaseOrderId == this.selectedPurchaseOrderId).CreatedBy,
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
                this.getPurchaseOrders((data.StatusId == WorkFlowStatus.Approved || data.StatusId == WorkFlowStatus.Rejected) ? 0 : workFlowStatus.PurchaseOrderId, this.selectedPurchaseOrderTypeId);
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
    resetFilters() {
        this.SupplierNameValidate = "";
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
    suppliernamechange(event) {
        this.SupplierNameValidate = event.target.value;
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

        if ((poFilterData.POCode === '' || poFilterData.POCode == null)
            && (poFilterData.SupplierName === '' || poFilterData.SupplierName == null)
            && (poFilterData.PoTypeId == 0 || poFilterData.PoTypeId == null)
            && (poFilterData.WorkFlowStatusId == null || poFilterData.WorkFlowStatusId == 0)
            && (poFilterData.FromDate == null && poFilterData.ToDate == null)) {
            if (open) {
                if ((this.poFilterInfoForm.get('SupplierName').value == null || this.poFilterInfoForm.get('SupplierName').value == "") && this.SupplierNameValidate != "") {
                    this.hideText = true;
                    this.filterMessage = "No matching records are found";
                    this.showFilterPopUp = true;
                }
                else {
                    this.filterMessage = "Please select any filter criteria";
                }
                this.resetPagerConfig();
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
                this.filterMessage = "Please select From Date & To Date";
            }
            return;
        }

        else if ((poFilterData.FromDate != null && poFilterData.ToDate != null && poFilterData.FromDate > poFilterData.ToDate)) {
            if (open) {
                this.filterMessage = "From Date Should be less than To Date";
            }
            return;
        }
        if (Number(poFilterData.PoTypeId) == 4) {
            this.hideText = true;
            this.filterMessage = "No matching records are found";
            this.showFilterPopUp = true;
        }
        else {
            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0, 0, false, poFilterData);
            if (this.purchaseOrdersList.length > 0) {
                this.isFilterApplied = true;
                if (open) {
                    this.showFilterPopUp = true;
                }
            }
        }

    }
    //this method is used to format the content to be display in the autocomplete textbox after selection..
    //supplierInputFormater = (x: Suppliers) => x.SupplierName;
    supplierInputFormater = (x: Suppliers) => x.WorkFlowStatus === "Approved" ? x.SupplierName : "";
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

    displayEmailPopUp() {
        //this.isVoid = isVoid;
        //this.purchaseOrderCode = this.selectedPODetails.PurchaseOrderCode;
        //this.hideText=false;
        this.showEmailPopUp = true;
    }

    displayLogPopUp() {
        this.showLogPopUp = true;
    }
    hideLogPopUp(hidePopUp: boolean) {
        this.showLogPopUp = false;
    }

    hideEmailPopUp(hidePopUp: boolean) {
        this.showEmailPopUp = false;
    }

    onSupplierFilterChange(event: any) {
        if (event.item != null && event.item != undefined) {
            if (event.item.WorkFlowStatus != "Approved") {
                this.poFilterInfoForm.get('SupplierName').setValue(null);
                event.preventDefault();
            }
            else if (event.item.IsFreezed) {
                this.poFilterInfoForm.get('SupplierName').setValue(null);
                event.preventDefault();
            }
        }
    }

    onStatusUpdate(poDetails: { PurchaseOrderId: number, PurchaseOrderTypeId: number }) {
        this.showEmailPopUp = false;
        this.getPurchaseOrders(poDetails.PurchaseOrderId, poDetails.PurchaseOrderTypeId);
        // this.onRecordSelection(purchaseOrderId);
    }


    // defaultStatus(){
    //     if(this.workFlowStatuses!=null && this.workFlowStatuses.length>0){
    //         this.poFilterInfoForm.controls["WorkFlowStatusId"].setValue(this.workFlowStatuses.find(x=>x.WorkFlowStatusid==WorkFlowStatus.Draft).WorkFlowStatusid);
    //         this.filterData();
    //     }
    // }

    ClickBack(e)
    {
        this.router.navigate([`po/polist`]);
    }

}
