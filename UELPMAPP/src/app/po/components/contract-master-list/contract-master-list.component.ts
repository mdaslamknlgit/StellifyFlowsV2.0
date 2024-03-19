import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { SortEvent } from 'primeng/primeng';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { POFilterModel, PurchaseOrderList } from "../../models/po-creation.model";
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
import * as moment from 'moment';
import { DatePipe } from '@angular/common';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ExportToCsv } from 'export-to-csv';

import { ExportService } from '../../services/export.service';
import { ExcelJson } from '../interfaces/excel-json.interface';

@Component({
    selector: 'app-contract-mater-list',
    templateUrl: './contract-master-list.component.html',
    styleUrls: ['./contract-master-list.component.css'],
    providers: [ContractMasterService, POCreationService]
})
export class ContractMasterListComponent implements OnInit {
    TotalRecords:number=0;
    exportColumns;
    SelexportColumns;
    interval;
    DateToJsonString:string;
    DateFromJsonString:string;
    ContractMasterId:number;
    ContractMasterType:string;
    FromDateDayStr:string;
    ToDateDayStr:string;
    validityMinDate = undefined;
    toDay = new Date();
    FromDateStr:string;
    ToDateStr:string;
    PurchaseOrdersListsCols: any[];
    HideTable:boolean=false;
    FilterPurchaseOrderPagerConfig:PagerConfig;
    showPurchaseOrderTypeDialog:boolean = false;
    IsFilterDataArrive:boolean=false;
    showdilogbox:boolean=false;
    userDetails: UserDetails = null;
    POCListsCols: any[];
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('poCode') private porCodeRef: any;
    selectedPurchaseOrderTypeId: number = PurchaseOrderType.ContractPoFixed;
    selectedPurchaseOrderId: number = -1;
    purchaseOrdersList: Array<ContractPurchaseOrder> = [];
    FilterPurchaseOrdersList: Array<ContractPurchaseOrder> = [];
    purchaseOrderPagerConfig: PagerConfig;
    purchaseOrderSearchKey: string;
    leftsection: boolean = false;
    HideDetails:boolean=false;
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
    showfilters:boolean=true;
    showfilterstext:string="Show List" ;
    firstDate:string="";
    lastDate:string="";
    firstDay:string="";
    currentDay:string="";
    lastDay:string="";
    currentDate:string;
    priorDate:Date;
    todayDate = new Date();
    constructor(private pocreationObj: POCreationService,
        private exportService: ExportService,
        private contractMasterObj: ContractMasterService,
        public sessionService: SessionStorageService,
        private sharedServiceObj: SharedService,
        public activatedRoute: ActivatedRoute,
        private renderer: Renderer,
        private formBuilderObj: FormBuilder,
        private reqDateFormatPipe: RequestDateFormatPipe,
        private router: Router,
        private datePipe: DatePipe
    ) {
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();
        this.validityMinDate = {
            year: this.toDay.getFullYear(),
            month: this.toDay.getMonth() + 1,
            day: this.toDay.getDate()
          };
        console.log("companyid", this.companyId);

    }
    intilizeFilterForm(): void {
        // Here also we can set the intial value Like dob:[ {year:1989 ,month:06, day: 10  }, ..... 
        //   this.profileForm = this.fb.group({
        //     userInfo: this.fb.group({
        //       dob: ['', [Validators.required]],
        //     }),
        //   });
        this.poFilterInfoForm = this.formBuilderObj.group({
            POCode: [''],
            SupplierName: [''],
            PoTypeId: [0],
            WorkFlowStatusId: [0],
            FromDate: [],
            ToDate: []
        });
        debugger;
          //**********************************************************************************************************************
        //Set Date
        //**********************************************************************************************************************
        //this.firstDate = moment().startOf('month').format('YYYY-MM-DD');
        this.firstDate =moment().subtract(1, 'months').format('YYYY-MM-DD');
        this.currentDate = moment().format('YYYY-MM-DD').toString();
        this.lastDate=moment().endOf('month').format("YYYY-MM-DD");
        this.priorDate = new Date(new Date().setDate(this.todayDate.getDate() - 30));
        //const FDate=new Date(this.firstDate);
        const FDate=this.priorDate;
        const CDate= new Date(this.currentDate);
    
        const FirstDateYear =  Number(this.datePipe.transform(FDate, 'yyyy'));
        const FirstDateMonth =  Number(this.datePipe.transform(FDate, 'MM'));
        const FirstDateDay =  Number(this.datePipe.transform(FDate, 'dd'));
    
        const CurrentDateYear =  Number(this.datePipe.transform(CDate, 'yyyy'));
        const CurrentDateMonth =  Number(this.datePipe.transform(CDate, 'MM'));
        const CurrentDateDay =  Number(this.datePipe.transform(CDate, 'dd'));
    
        var _savedStartDate = moment(this.currentDate).toObject();
    
        var _savedStartDateObject = {day:0,month:0,year:0};
    
        _savedStartDateObject.day = _savedStartDate.date;
        _savedStartDateObject.month = _savedStartDate.months;
        _savedStartDateObject.year = _savedStartDate.years;
        // this.poFilterInfoForm.controls.FromDate.patchValue({
        //     START_DATE: _savedStartDateObject
        //   })
        
        //this.poFilterInfoForm.controls.POCode.setValue(1);
        this.poFilterInfoForm.controls.FromDate.setValue(FirstDateYear+"-"+('0' + FirstDateMonth).slice(-2)+"-"+('0' + FirstDateDay).slice(-2));
        this.poFilterInfoForm.controls.ToDate.setValue(CurrentDateYear+"-"+('0' + CurrentDateMonth).slice(-2)+"-"+('0' + CurrentDateDay).slice(-2));

        this.FromDateStr=FirstDateYear+"-"+('0' + FirstDateMonth).slice(-2)+"-"+('0' + FirstDateDay).slice(-2);
        this.ToDateStr=CurrentDateYear+"-"+('0' + CurrentDateMonth).slice(-2)+"-"+('0' + CurrentDateDay).slice(-2);

        console.log("From Date : " + this.FromDateStr + " -- " + " To Date : " + this.ToDateDayStr);
        this.poFilterInfoForm.controls.FromDate.setValue({
            year: FirstDateYear,
            month:FirstDateMonth,
            day: FirstDateDay
          });
    
          this.poFilterInfoForm.controls.ToDate.setValue({
            year: CurrentDateYear,
            month:CurrentDateMonth,
            day: CurrentDateDay
          });
        // this.poFilterInfoForm.controls.FromDate.valueChanges
        //     .map((value) => {
        //         if (value) {

        //             alert("Value Changes ...");
        //             debugger;
        //             //if (typeof value.getMonth === 'function') {
        //             this.poFilterInfoForm.controls.FromDate.patchValue({
        //                 date: {
        //                     day: value.getUTCDay(),
        //                     month: value.getUTCMonth(),
        //                     year: value.getUTCFullYear()
        //                 }
        //             });
        //             //}
        //         }
        //         return value;
        //     })
        //     .subscribe((value) => {

        //     });

    }

    ngOnInit() {
        //this.ActivateRoute.paramMap.subscribe((param: ParamMap) => {
        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            debugger;
            //this.ContractMasterId=isNaN(Number(param.get('Id'))) ? 0 : Number(param.get('Id'));
            this.ContractMasterType=param.get('type');
            // alert("Project Contract Master ID A : " + this.ContractMasterId + "\n Type : " + this.ContractMasterType);
            //alert("Project Contract Master Type : " + this.ContractMasterType);
            if(this.ContractMasterType=="master")
            {
                this.backButtonVisible=false;
            }
            else if(this.ContractMasterType=="child")
            {
                this.backButtonVisible=true;
            }
        });
        debugger;
        this.POCListsCols = [
            { field: 'DraftCode', header: 'Record Name', width: '200px' },
            { field: 'SupplierName', header: 'Supplier', width: '400px' },
            { field: 'CreatedDate', header: 'Created On', width: '200px' },
            { field: 'WorkFlowStatusText', header: 'PO Status',  width: '200px'  },
            { field: '', header: 'Action', width: '100px'   },
        ];
        let cpoid = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        let roleAccessLevels = this.sessionService.getRolesAccess();

        //Initize FilterForm
        this.intilizeFilterForm();
        debugger;

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
                    debugger;
                    this.getPurchaseOrders(0, cpoid);
                }
            });
        // this.activatedRoute.paramMap.subscribe((data) => {
        //     debugger;
        //     this.navigateToPage();
        //     this.GetWorkFlowStatus();
        // });



        this.activatedRoute.queryParamMap.subscribe((data) => {
            debugger;
            //if (this.activatedRoute.snapshot.queryParamMap.get('type') != null) {
                if (this.ContractMasterType != null) {
                debugger;
                this.navigateToPage();
                this.GetWorkFlowStatus();
            }
        });

        this.workFlowStatus = WorkFlowStatus;

        this.showfilters =true;
        this.showfilterstext="Hide List" ;
        
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
        debugger;
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');
        let assetTransferId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        console.log(this.activatedRoute.snapshot.queryParams);
        //this.ContractMasterType
        // if (this.activatedRoute.snapshot.queryParams.type == "master") {//if it is "asset transfer request      
        if (this.ContractMasterType == "master") {//if it is "asset transfer request      
            this.isMaster = true;
            this.backButtonVisible = false;
        }
        //else if (this.activatedRoute.snapshot.queryParams.type == "child") {//if request is for "asset transfer request approval"
        else if (this.ContractMasterType == "child") {//if request is for "asset transfer request approval"
            this.isMaster = false;
            this.backButtonVisible = true;

        }
        if (this.isMaster == false && assetTransferId == 0) {
            this.purchaseOrderPagerConfig.RecordsToSkip = 0;
            //this.SetFilterData();
            this.filterData();
            //this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, assetTransferId,this.poFilterInfoForm);
            //this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, assetTransferId);
            this.GetWorkFlowStatus();

        }
        console.log("navigateddd", assetTransferId, this.isMaster);
        if (assetTransferId > 0) {
            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, assetTransferId);
        }
        else {
            if (this.purchaseOrderSearchKey === "" || this.purchaseOrderSearchKey === null) {
                //this.getPurchaseOrders(0, 0);
                //this.filterData();
            }
        }
    }
    getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }
    onCpoBack() {
        this.backButtonVisible = false;
        // this.router.navigate(['/po/contractpo'], {
        //     queryParams: {
        //         type: 'master'
        //     }
        // });
        
        // this.router.navigate(['/po/contractpolist/master'], {
        //     queryParams: {
        //         type: 'master'
        //     }
        // });

        this.router.navigate(['/po/contractpolist/master/'+ this.getRandomInt(100)]);

    }
    //to get  the purchase orders..
    getPurchaseOrders(purchaseOrderIdToBeSelected: number, CPOID: number) {
        debugger;
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            CompanyId: this.companyId,
            IsMasterPo: this.isMaster,
            IsSelectAll: false,
            UserId: this.userDetails.UserID,
            CPOID: CPOID,
            FromDate:this.FromDateStr,
            ToDate:this.ToDateStr
        };
        this.showLeftPanelLoadingIcon = true;
        this.contractMasterObj.getContractPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: ContractPoDisplayResult) => {
                debugger;
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.purchaseOrdersList.length > 0) {
                    this.HideTable=false;
                    if (purchaseOrderIdToBeSelected == 0) {
                        //this.onRecordSelection(this.purchaseOrdersList[0].CPOID);
                        //this.onRecordSelection(this.ContractMasterId);
                        //alert("Project Contract Master ID A : " + this.ContractMasterId + "\n Type : " + this.ContractMasterType);
                    }
                    else {
                        //this.onRecordSelection(purchaseOrderIdToBeSelected);
                        //alert("Project Contract Master ID A : " + purchaseOrderIdToBeSelected + "\n Type : " + this.ContractMasterType);
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
            FromDate:this.FromDateStr,
            ToDate:this.ToDateStr
            // FromDate: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.FromDate == null ? null : this.reqDateFormatPipe.transform(poFilterData.FromDate),
            // ToDate: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.ToDate == null ? null : this.reqDateFormatPipe.transform(poFilterData.ToDate)
        };
        debugger;
        this.showLeftPanelLoadingIcon = true;
        this.contractMasterObj.getAllSearchContractPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: ContractPoDisplayResult) => {
                this.showLeftPanelLoadingIcon = false;
                this.IsFilterDataArrive = true;
                if (data.PurchaseOrders.length > 0) {
                    this.HideTable=false;
                    this.showFilterPopUp = false;
                    this.purchaseOrdersList = data.PurchaseOrders;
                    this.FilterPurchaseOrdersList=data.PurchaseOrders;
                    this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                    this.TotalRecords=data.TotalRecords;
                    // if (purchaseOrderIdToBeSelected == 0) {
                    //     this.onRecordSelection(this.purchaseOrdersList[0].CPOID);
                    // }
                    // else {
                    //     this.onRecordSelection(purchaseOrderIdToBeSelected);
                    // }
                }
                else {
                    this.showFilterPopUp = true;
                    this.hideText = true;
                    this.HideTable=true;
                    this.purchaseOrdersList=data.PurchaseOrders;
                    this.filterMessage = "No matching records are found";
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }

    RedirectPurchaseOrder(CPOID: number)
    {
        //(click)="onRecordSelection(record.CPOID)
        //debugger;
        //this.onRecordSelection(PurchaseOrderId,PurchaseOrderTypeId);
        //this.router.navigate([`/po/pocreation/${PurchaseOrderId}/${PurchaseOrderTypeId}/${SupplierId}`]);
        //alert("Contract POC Id: " +CPOID);
        this.HideDetails=true;
        this.onRecordSelection(CPOID);

        this.router.navigate([`/po/contractpo/${CPOID}`]);
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId: number) {
        this.split();
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
        alert("Add Record");
        debugger;
        this.router.navigate([`/po/contractpo/${this.ContractMasterType}/${0}`]);
        // this.innerWidth = window.innerWidth;
        // if (this.innerWidth < 550) {
        //     $(".leftdiv").addClass("hideleftcol");
        //     $(".rightPanel").addClass("showrightcol");
        // }

        // this.hideText = true;
        // this.selectedPurchaseOrderId = -1;
        // setTimeout(() => {
        //     this.selectedPurchaseOrderId = 0;
        //     this.hideText = false;
        // }, 50);

        // this.showfilters = false;
        // this.showfilterstext = "Show List";
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
        debugger;
        this.HideDetails=false;
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
    onClickedOutside(e: Event) {
      //  this.showfilters= false; 
        if(this.showfilters == false){ 
          //  this.showfilterstext="Show List"
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
        this.purchaseOrderPagerConfig.RecordsToFetch = 25;
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
        this.showfilters =false;
    this.showfilterstext="Hide List" ;
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
    suppliernamechange(event)
    {
      //this.SupplierNameValidate = event.target.value;
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
        this.FromDateStr="";
        this.ToDateStr="";
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
    filterData() 
    {
        debugger;
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
        this.SetFilterData();
        // this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0, poFilterData);
        // if (this.purchaseOrdersList.length > 0) {
        //     this.isFilterApplied = true;
        //     if (open) {
        //         this.showFilterPopUp = true;
        //     }
        // }
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

        ExportToExcel()
        {
          //alert("Export To Excel");
          debugger;
      
          this.SetFilterData();
          this.interval = setTimeout(() => {
              //alert("Alert activated")
              debugger;
              if(this.IsFilterDataArrive)
              {
                  debugger;
                  if (this.FilterPurchaseOrdersList.length > 0) {
                      //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                      //this.exportToExcel();
                      const edata: Array<ExcelJson> = [];
                      const udt: ExcelJson = {
                      data: [
                          { A: 'User Data' }, // title
                          { A: 'Draft Code', B: 'Supplier',C:'Created On', D: 'PO Status' }, // table header
                      ],
                      skipHeader: true
                      };
                      this.FilterPurchaseOrdersList.forEach(polist => {
                      udt.data.push({
                          A: polist.DraftCode,
                          B: polist.Supplier.SupplierName,
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
                      this.exportService.exportJsonToExcel(edata, 'ContractMaster');
                      this.stopTime();
                  }
              }
            }, 1000);
          
        }
        ExportToCSV()
        {
          //alert("Export To CSV");
          //alert("Total Records CSV : " +this.TotalRecords);
          this.SetFilterData();
          this.interval = setTimeout(() => {
              //alert("Alert activated")
              debugger;
              if(this.IsFilterDataArrive)
              {
                  debugger;
                  if (this.FilterPurchaseOrdersList.length > 0) {
                      //alert("Total Records CSV : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                      const options = { 
                          fieldSeparator: ',',
                          quoteStrings: '"',
                          decimalSeparator: '.',
                          showLabels: true, 
                          showTitle: true,
                          title: 'Purchase Orders List',
                          useTextFile: false,
                          useBom: true,
                          headers: ['DraftCode', 'SupplierName','CreatedDate', 'WorkFlowStatusText']
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
              //B: user.SupplierName,
              C: user.WorkFlowStatusText
            });
          });
          edata.push(udt);
      
       
          this.exportService.exportJsonToExcel(edata, 'PurchaseOrderLists');
        }
        stopTime() {
          clearInterval(this.interval);
          this.showLeftPanelLoadingIcon=false;
        }
        ExportToPDF()
        {
          //alert("Export To PDF");
          // const doc = new jsPDF();
          //alert("Total Records PDF : " +this.TotalRecords);
          debugger;
      
          //Get Filter Data
          this.SetFilterData();
      
            this.interval = setTimeout(() => {
              //alert("Alert activated")
              debugger;
              if(this.IsFilterDataArrive)
              {
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
                      doc.save('PurchaseOrdersList.pdf');
                      this.IsFilterDataArrive=false;
                      this.stopTime();
                  }
              }
            }, 1000);
          }
        
          ClickNewRecord() {
              //this.showdilogbox = !this.showdilogbox ;
              debugger;
              this.innerWidth = window.innerWidth;
              if (this.innerWidth < 550) {
                  $(".leftdiv").addClass("hideleftcol");
                  $(".rightPanel").addClass("showrightcol");
              }
      
              this.hideText = true;
              this.showPurchaseOrderTypeDialog = true;
      
              this.router.navigate([`/po/contractpo//${this.ContractMasterType}/${0}`]);

             // this.showfilters = false;
             // this.showfilterstext = "Show List";
          
          }

          //Set Filter Data
    SetFilterData() {
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
            const a1 = this.poFilterInfoForm.get('FromDate').value.toString();
            const a2 = this.poFilterInfoForm.get('FromDate').value;

            poFilterData.FromDate = this.poFilterInfoForm.get('FromDate').value;
        }

        if (this.poFilterInfoForm.get('ToDate').value != null) {
            poFilterData.ToDate = this.poFilterInfoForm.get('ToDate').value;
        }

        debugger;
        //*************************************************************************************************************/
        //From Date Str
        //*************************************************************************************************************/
        this.DateFromJsonString = JSON.stringify(poFilterData.FromDate);

        let jsonFromObj = JSON.parse(this.DateFromJsonString); // string to "any" object first
        let FromDateObj = jsonFromObj as DateObj;
        console.log("DateFromJsonString " + this.DateFromJsonString);
        console.log("JSON From Obj " + jsonFromObj);
        if(typeof(FromDateObj) === 'object')
        {
            console.log("This is object from " + FromDateObj );
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
            else
            {
                console.log("This is not object " + FromDateObj );
                this.FromDateStr=this.DateFromJsonString;
            }
        }
        
        //this.FromDateStr=jsonFromObj;
        //console.log("From Date : " +this.FromDateStr);
        debugger;
        //*************************************************************************************************************/
        //To Date Str
        //*************************************************************************************************************/
        this.DateToJsonString = JSON.stringify(poFilterData.ToDate);

        let jsonToObj = JSON.parse(this.DateToJsonString); // string to "any" object first
        let ToDateObj = jsonToObj as DateObj;
        console.log("DateToJsonString " + this.DateToJsonString);
        console.log("JSON To Obj " + jsonToObj);
        if(typeof(ToDateObj) === 'object')
        {
            console.log("This is object to" + ToDateObj );
            if (FromDateObj != null) {
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
            else
            {
                console.log("This is not object " + ToDateObj );
                this.ToDateStr=this.DateToJsonString;
            }
        }
        //this.ToDateStr=jsonToObj;
        //console.log("To Date : " + this.ToDateStr);

        console.log("From Date : " + this.FromDateStr +" --- " + " To Date : " + this.ToDateStr);
        //      //*************************************************************************************************************/
        //       debugger;
        //       this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        //       this.purchaseOrderPagerConfig.RecordsToFetch = this.TotalRecords;
        //       let purchaseOrderDisplayInput = {
        //           Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
        //           Take: this.purchaseOrderPagerConfig.RecordsToFetch,
        //           Search: (this.purchaseOrderSearchKey == null || this.purchaseOrderSearchKey == "null") ? "" : this.purchaseOrderSearchKey,
        //           CompanyId: this.companyId,
        //           UserId: this.userDetails.UserID,
        //           WorkFlowProcessId: (poFilterData == undefined || poFilterData == null || poFilterData.PoTypeId == null) ? 0 : getProcessId(poFilterData.PoTypeId),
        //           PoCode: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.POCode,
        //           SupplierName: (poFilterData == undefined || poFilterData == null || poFilterData.SupplierName == undefined) ? null : poFilterData.SupplierName,
        //           WorkFlowStatusId: (poFilterData == undefined || poFilterData == null) ? 0 : poFilterData.WorkFlowStatusId,
        //           FromDate: this.FromDateStr,
        //           ToDate: this.ToDateStr

        //       };

        this.resetPagerConfig();
        debugger;
        this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0, poFilterData);
        if (this.purchaseOrdersList.length > 0) {
            this.isFilterApplied = true;
            if (open) {
                this.showFilterPopUp = true;
            }
        }

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
        
}


export class DateObj {
    year:string;
    month:string;
    day:string;
}