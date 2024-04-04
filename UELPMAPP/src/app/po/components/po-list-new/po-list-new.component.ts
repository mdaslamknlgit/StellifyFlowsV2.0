import { Component, OnInit, ViewChild, Renderer, Input, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { SortEvent } from 'primeng/primeng';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { PurchaseOrderList, PurchaseOrderDisplayResult, PurchaseOrderTypes, PurchaseOrderFilterModel, DateObj } from "../../models/po-creation.model";
import { POCreationService } from "../../services/po-creation.service";
import { PagerConfig, Messages, MessageTypes, PurchaseOrderType, WorkFlowProcess, Suppliers, WorkFlowStatus, WorkFlowStatusModel, UserDetails, PTableColumn } from "../../../shared/models/shared.model";
import { FullScreen, PrintScreen, getProcessId, HideFullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { PoApprovalUpdateStatus, PoApproval } from '../../models/po-approval.model';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';
import { MatMenuModule } from '@angular/material/menu';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ExportToCsv } from 'export-to-csv';

import { ExportService } from '../../services/export.service';
import { ExcelJson } from '../interfaces/excel-json.interface';

import * as moment from 'moment';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-po-list-new',
  templateUrl: './po-list-new.component.html',
  styleUrls: ['./po-list-new.component.css']
})
export class PoListNewComponent implements OnInit {
    exportColumns;
    SelexportColumns;
    /* the table reference */
    @ViewChild('PurchaseOrderListTable') PurchaseOrderListTable: ElementRef;
    //purchaseOrdersListColumns: Array<{ field: string, header: string, width?: string }> = [];
    PurchaseOrdersListsCols: any[];
    userDetails: UserDetails = null;
    HideTable: boolean = false;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('poCode') private porCodeRef: any;
    showPurchaseOrderTypeDialog: boolean = false;
    selectedPurchaseOrderTypeId: number = 0;
    selectedPurchaseOrderId: number = 0;
    selectedPurchaseOrderCode: string;
    purchaseOrdersList: Array<PurchaseOrderList> = [];

    FilterPurchaseOrdersList: Array<PurchaseOrderList> = [];
    IsFilterDataArrive: boolean = false;
    interval;


    purchaseOrderPagerConfig: PagerConfig;
    FilterPurchaseOrderPagerConfig: PagerConfig;
    purchaseOrderSearchKey: string;
    TotalRecords: number = 0;
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
    seletedValue: string = "";
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
    emailPermission: boolean;
    printPermission: boolean;
    isCompanyChanged: boolean = false;
    viewLogPermission: boolean = false;
    SupplierNameValidate: string = "";
    showfilters: boolean = false;
    showdilogbox: boolean = false;
    purchasesubmenu = false;
    showfilterstext: string = "Hide List";
    faPlus = faPlus;

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
    //*****************************************************************************************************************/

    public innerWidth: any;

    constructor(private pocreationObj: POCreationService,
        private exportService: ExportService,
        public sessionService: SessionStorageService,
        private sharedServiceObj: SharedService,
        public activatedRoute: ActivatedRoute,
        private renderer: Renderer,
        private formBuilderObj: FormBuilder,
        private reqDateFormatPipe: RequestDateFormatPipe,
        private router: Router,
        private datePipe: DatePipe) {
        this.jsonObj = JSON.parse(this.jsonString);
        this.jsonString = JSON.stringify(this.jsonObj2);

        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();

        this.workFlowStatus = WorkFlowStatus;
    }

    initializeFilterForm(): void {
        // Here also we can set the intial value Like dob:[ {year:1989 ,month:06, day: 10  }, ..... 
        //   this.profileForm = this.fb.group({
        //     userInfo: this.fb.group({
        //       dob: ['', [Validators.required]],
        //     }),
        //   });
        this.poFilterInfoForm = this.formBuilderObj.group({
            POCode: [''],
            SupplierName: [''],
            FromDate: [],
            ToDate: [],
            PoTypeId: [0],
            WorkFlowStatusId: [0]
        });

    }
    public myVariable;

    ngOnInit() {
        //debugger;
        this.PurchaseOrdersListsCols = [
            { field: 'DraftCode', header: 'Draft Code', width: '100px' },
            { field: 'SupplierName', header: 'Supplier', width: '200px' },
            { field: 'CreatedDate', header: 'Created On', width: '150px' },
            { field: 'WorkFlowStatusText', header: 'PO Status', width: '150px' },
            { field: '', header: 'Action', width: '100px' },
        ];

        this.initializeFilterForm();

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

        //**********************************************************************************************************************
        //this.purchaseOrdersListColumns =PurchaseOrdersListColumns.filter(item => item);
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
        this.FilterPurchaseOrderPagerConfig = new PagerConfig();
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
                    debugger;
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
        this.activatedRoute.queryParamMap.subscribe((data) => {
            debugger;
            //this.filterData();
            this.navigate();
        });
        this.activatedRoute.queryParamMap.subscribe((data) => {
            if (this.activatedRoute.snapshot.queryParamMap.get('code') != null || Number(this.activatedRoute.snapshot.queryParamMap.get('id')) > 0) {
                debugger;
                this.navigate();
            }
        });
        this.sharedServiceObj.getWorkFlowStatus(WorkFlowProcess.InventoryPO).subscribe((data: Array<WorkFlowStatusModel>) => {
            this.workFlowStatuses = data;
            // this.defaultStatus();
        });

    }

    navigate() {
        const id: number = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        this.purchaseOrderSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');
        let processId = Number(this.activatedRoute.snapshot.queryParamMap.get('processId'));

        debugger;
        this.SetDates();
        console.log(this.FromDateStr + '  ' + this.ToDateDayStr);

        debugger;
        if (this.purchaseOrderSearchKey != "" && this.purchaseOrderSearchKey != null) {

            let poModel: PurchaseOrderFilterModel = new PurchaseOrderFilterModel();
            poModel.PoTypeId = this.getPoTypeId(processId);
            this.getAllSearchPurchaseOrder("", id, this.getPoTypeId(processId), true, poModel);
        }
        else if (id != undefined && id != 0 && id != null) {

            let poModel: PurchaseOrderFilterModel = new PurchaseOrderFilterModel();
            poModel.PoTypeId = this.getPoTypeId(processId);
            this.getAllSearchPurchaseOrder("", id, poModel.PoTypeId, true, poModel);
        }
        else if (id == undefined || id == null) {
            this.getPurchaseOrders(0, 0);
        }
        else {
            // this.poFilterInfoForm.get('WorkFlowStatusId').setValue(WorkFlowStatus.Draft)
            let poModel: PurchaseOrderFilterModel = new PurchaseOrderFilterModel();
            // poModel.WorkFlowStatusId=WorkFlowStatus.Draft;
            //debugger;
            //poModel.FromDate=this.FromDateDayStr;

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
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            UserId: this.userDetails.UserID,
            CompanyId: this.companyId
        };
        this.showLeftPanelLoadingIcon = true;
        this.pocreationObj.getPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                debugger;
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords = data.TotalRecords;
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
    getAllSearchPurchaseOrder(searchKey: string, purchaseOrderIdToBeSelected: number, potypeId: number, isNotification: boolean = false, poFilterData?: PurchaseOrderFilterModel) {
        debugger;

        //   const FDate=new Date(poFilterData.FromDate);
        //   const CDate= new Date(poFilterData.ToDate);

        //   const k1 = poFilterData.FromDate.getUTCFullYear();
        //   const k2 = poFilterData.FromDate.getUTCMonth();
        //   const k3 = poFilterData.FromDate.getUTCDay();

        //   let fa=moment.utc(poFilterData.FromDate);
        //   let ta=moment.utc(poFilterData.ToDate);

        //   const FDate = new Date(fa.toString());
        //   const TDate = new Date(ta.toString());

        //   //From Date
        //   const FirstDateYear =  FDate.getFullYear();
        //   const FirstDateMonth =  FDate.getMonth();
        //   const FirstDateDay = FDate.getDay();

        //To Date
        //   const CurrentDateYear =  TDate.getFullYear();
        //   const CurrentDateMonth = TDate.getMonth();
        //   const CurrentDateDay =  TDate.getDay();


        //   this.FormDateStr=FirstDateYear.toString() + "-"+ FirstDateMonth.toString() + "-" + FirstDateDay.toString();
        //   this.ToDateStr=CurrentDateYear.toString() + "-"+ CurrentDateMonth.toString() + "-" + CurrentDateDay.toString();


        //   const fds=moment(FDate).format('DD-MM-YYYY');
        //   const tds=moment(TDate).format('DD-MM-YYYY');
        //   debugger;

        //  const b=moment.utc(poFilterData.FromDate).format('YYYY-MM-DD');

        //  const c= new Date(poFilterData.FromDate);

        //  const d = moment(poFilterData.FromDate);
        //  const e = moment(d).format("YYYYMMDD");

        //  const f= moment(d).format("YYYYMMDD");

        //const g =moment(a).format('YYYY-MM-DD');

        //this.FormDateStr=moment(poFilterData.FromDate).format('YYYY-MM-DD');
        //this.ToDateStr=moment(poFilterData.ToDate).format('YYYY-MM-DD');

        //   //From Date
        //   const FirstDateYear =  poFilterData.FromDate.getFullYear();
        //   const FirstDateMonth =  poFilterData.FromDate.getMonth();
        //   const FirstDateDay = poFilterData.FromDate.getDay();

        //   //To Date
        //   const CurrentDateYear =  poFilterData.ToDate.getFullYear();
        //   const CurrentDateMonth = poFilterData.ToDate.getMonth();
        //   const CurrentDateDay =  poFilterData.ToDate.getDay();

        //   //Make Date String in YYYY-MM-DD format
        //   this.FormDateStr=FirstDateYear.toString() + "-"+ FirstDateMonth.toString() + "-" + FirstDateDay.toString();
        //   this.ToDateStr=CurrentDateYear.toString() + "-"+ CurrentDateMonth.toString() + "-" + CurrentDateDay.toString();


        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            Search: (searchKey == null || searchKey == "null") ? "" : searchKey,
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID,
            PurchaseOrderId: isNotification == true ? purchaseOrderIdToBeSelected : 0,
            WorkFlowProcessId: (poFilterData == undefined || poFilterData == null || poFilterData.PoTypeId == null) ? 0 : getProcessId(poFilterData.PoTypeId),
            PoCode: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.POCode,
            SupplierName: (poFilterData == undefined || poFilterData == null || poFilterData.SupplierName == undefined) ? null : poFilterData.SupplierName,
            WorkFlowStatusId: (poFilterData == undefined || poFilterData == null) ? 0 : poFilterData.WorkFlowStatusId,
            POTypeId: poFilterData.PoTypeId,
            FromDate: this.FromDateStr,
            ToDate: this.ToDateStr

        };
        this.showLeftPanelLoadingIcon = true;
        this.pocreationObj.getAllSearchPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                this.showLeftPanelLoadingIcon = false;
                this.showFilterPopUp = false;
                this.sharedServiceObj.PORecordslength = data.PurchaseOrders.length;
                debugger;
                if (data.PurchaseOrders.length > 0) {
                    debugger;
                    this.HideTable = false;
                    this.TotalRecords = data.TotalRecords;
                    this.purchaseOrdersList = data.PurchaseOrders;
                    this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                    if (this.purchaseOrdersList.length > 0) {
                        this.HideTable = false;
                        if (purchaseOrderIdToBeSelected == 0) {
                            this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId, this.purchaseOrdersList[0].POTypeId);
                        }
                        else {
                            this.onRecordSelection(purchaseOrderIdToBeSelected, potypeId);
                            //   this.onRecordSelection(purchaseOrderIdToBeSelected,this.purchaseOrdersList[0].POTypeId);
                        }
                    }
                }
                else {
                    this.HideTable = true;
                    this.hideText = true;
                    this.purchaseOrdersList = data.PurchaseOrders;
                    this.filterMessage = "No matching records are found";
                    this.myVariable = "No matching records are found";
                    //this.showFilterPopUp = true;
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
        this.selectedPurchaseOrderTypeId = purchaseOrderTypeId;
        this.selectedPurchaseOrderId = -1;
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
    //*********************************************************************************************************************/
    //Export Code Starts Here
    //*********************************************************************************************************************/
    ExportToExcel() {
        //alert("Export To CSV");
        debugger;

        this.SetFilterData();
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
                    this.exportService.exportJsonToExcel(edata, 'PurchaseOrderLists');
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
                        title: 'Purchase Orders List',
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
        this.exportService.exportJsonToExcel(edata, 'PurchaseOrderLists');
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
        this.SetFilterData();

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
                    doc.save('PurchaseOrdersList.pdf');
                    this.IsFilterDataArrive = false;
                    this.stopTime();
                }
            }
        }, 1000);
    }
    //*********************************************************************************************************************/
    //Export Code Ends Here
    //*********************************************************************************************************************/
    ClickNewRecord() {
        //this.showdilogbox = !this.showdilogbox ;
        this.innerWidth = window.innerWidth;
        if (this.innerWidth < 550) {
            $(".leftdiv").addClass("hideleftcol");
            $(".rightPanel").addClass("showrightcol");
        }

        this.hideText = true;
        this.showPurchaseOrderTypeDialog = true;
        //'pocreation/:poorderid/:poordertypeid/:supplierid',
        
        //this.router.navigate([`/po/pocreation/${0}/${value}/${0}`]);
        // this.showfilters = false;
        // this.showfilterstext = "Show List";

    }
    onOptionsSelected(value: string) {

        //alert(value) ;
        //this.purchaseOrderSelectionOk(value);
        this.router.navigate([`/po/pocreation/${0}/${value}/${0}`]);

    }

    purchaseorderclick(e) {
        this.purchasesubmenu = !this.purchasesubmenu;
    }
    RedirectPurchaseOrder(PurchaseOrderId, PurchaseOrderTypeId, SupplierId) {
        //alert(" Purchase Order ID : " + PurchaseOrderId + "\n Purchase Order Type : " + PurchaseOrderTypeId + "\n Supplier Id: " + SupplierId);
        debugger;
        //this.onRecordSelection(PurchaseOrderId,PurchaseOrderTypeId);
        this.router.navigate([`/po/pocreation/${PurchaseOrderId}/${PurchaseOrderTypeId}/${SupplierId}`]);
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
        this.showFullScreen();
    }
    onClickedOutside(e: Event) {
        //  this.showfilters= false; 
        if (this.showfilters == false) {
            //  this.showfilterstext="Show List"
        }
    }
    split() {
        this.showfilters = !this.showfilters;
        if (this.showfilters == true) {
            this.showfilterstext = "Hide List"
        }
        else {
            this.showfilterstext = "Show List"
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
            debugger;
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

    //Purchase order selection 
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

        //this.addRecord(purchaseOrderTypeId);
        //alert(" Purchase Order ID : " + "0" + "\n Purchase Order Type : " + purchaseOrderTypeId + "\n Supplier Id: " + "0");
        debugger;
        //this.onRecordSelection(PurchaseOrderId,PurchaseOrderTypeId);
        this.router.navigate([`/po/pocreation/${0}/${purchaseOrderTypeId}/${0}`]);

    }

    resetPagerConfig() {
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderPagerConfig.RecordsToFetch = 25;
        //this.purchaseOrderPagerConfig.RecordsToFetch = 400;
        this.currentPage = 1;
    }

    onSearchInputChange(event: any) {
        this.resetPagerConfig();
        if (event.target.value != "") {
            if (event.target.value.length >= 3) {
                debugger;
                this.getAllSearchPurchaseOrder(event.target.value, 0, 0);
            }
        }
        else {
            this.getPurchaseOrders(0, 0);
        }
    }

    readListView(record: { PoId: number, PotypeId: number }) {
        console.log(record);
        debugger;
        this.hideText = false;
        //this.hideFullScreen();
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        let filterData: PurchaseOrderFilterModel = this.poFilterInfoForm.value;
        if ((this.purchaseOrderSearchKey != "" && this.purchaseOrderSearchKey != null) ||
            ((filterData.POCode != "" && filterData.POCode != null) || Number(filterData.PoTypeId) > 0 || (filterData.SupplierName != null && filterData.SupplierName != "")
                || (filterData.FromDate != null && filterData.ToDate != null))
        ) {
            console.log("getAllSearchPurchaseOrder A");
            debugger;
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
            let filterData: PurchaseOrderFilterModel = this.poFilterInfoForm.value;
            // console.log(filterData);
            if ((this.purchaseOrderSearchKey != "" && this.purchaseOrderSearchKey != null) ||
                (filterData.POCode != "" || Number(filterData.PoTypeId) > 0 || filterData.SupplierName != "" || filterData.WorkFlowStatusId > 0
                    || (filterData.FromDate != null && filterData.ToDate != null))
            ) {
                this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0, 0, false, filterData);
            }
            else {

                if (!this.sharedServiceObj.PoDraftVisible) {
                    debugger;
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
        this.FromDateStr = "";
        this.ToDateStr = "";
        this.SupplierNameValidate = "";
        this.poFilterInfoForm.reset();
        this.filterMessage = "";
        this.purchaseOrderSearchKey = "";
        this.resetPagerConfig();
        this.getPurchaseOrders(0, 0);
        this.isFilterApplied = false;
        this.HideTable = false;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    suppliernamechange(event) {
        this.SupplierNameValidate = event.target.value;
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
    SetFilterData() {
        let poFilterData: PurchaseOrderFilterModel = this.poFilterInfoForm.value;
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
        debugger;

        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderPagerConfig.RecordsToFetch = this.TotalRecords;
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            Search: (this.purchaseOrderSearchKey == null || this.purchaseOrderSearchKey == "null") ? "" : this.purchaseOrderSearchKey,
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID,
            WorkFlowProcessId: (poFilterData == undefined || poFilterData == null || poFilterData.PoTypeId == null) ? 0 : getProcessId(poFilterData.PoTypeId),
            PoCode: (poFilterData == undefined || poFilterData == null) ? null : poFilterData.POCode,
            SupplierName: (poFilterData == undefined || poFilterData == null || poFilterData.SupplierName == undefined) ? null : poFilterData.SupplierName,
            WorkFlowStatusId: (poFilterData == undefined || poFilterData == null) ? 0 : poFilterData.WorkFlowStatusId,
            FromDate: this.FromDateStr,
            ToDate: this.ToDateStr
  
        };
  
        this.showLeftPanelLoadingIcon = true;
        this.pocreationObj.getAllSearchPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                //this.showLeftPanelLoadingIcon = false;
                this.showFilterPopUp = false;
                this.sharedServiceObj.PORecordslength = data.PurchaseOrders.length;
                //this.showLeftPanelLoadingIcon=false;
                debugger;
                this.IsFilterDataArrive = true;
                if (data.PurchaseOrders.length > 0) {
                    debugger;
                    this.HideTable=false;
                    this.TotalRecords = data.TotalRecords;
                    this.FilterPurchaseOrdersList = data.PurchaseOrders;
                    this.FilterPurchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
  
                }
                else {
                    this.HideTable=true;
                    this.hideText = true;
                    this.filterMessage = "No matching records are found";
                    //this.showFilterPopUp = true;
                    this.hideFullScreen();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
      //   if ((poFilterData.POCode === '' || poFilterData.POCode == null)
      //       && (poFilterData.SupplierName === '' || poFilterData.SupplierName == null)
      //       && (poFilterData.PoTypeId == 0 || poFilterData.PoTypeId == null)
      //       && (poFilterData.WorkFlowStatusId == null || poFilterData.WorkFlowStatusId == 0)
      //       && (poFilterData.FromDate == null || poFilterData.ToDate == null)) {
      //       if (open) {
      //           if ((this.poFilterInfoForm.get('SupplierName').value == null || this.poFilterInfoForm.get('SupplierName').value == "") && this.SupplierNameValidate != "") {
      //               this.hideText = true;
      //               this.filterMessage = "No matching records are found";
      //               //this.showFilterPopUp = true;
      //           }
      //           else {
      //               this.filterMessage = "Please select any filter criteria";
      //           }
      //           this.resetPagerConfig();
      //       }
      //       return;
      //   }
      //   else if (poFilterData.FromDate != null && poFilterData.ToDate == null) {
      //       if (open) {
      //           this.filterMessage = "Please select To Date";
      //       }
      //       return;
      //   }
      //   else if (poFilterData.FromDate == null && poFilterData.ToDate != null) {
      //       if (open) {
      //           this.filterMessage = "Please select From Date";
      //       }
      //       return;
      //   }
  
      //   else if ((poFilterData.FromDate != null && poFilterData.ToDate != null && poFilterData.FromDate > poFilterData.ToDate)) {
      //       if (open) {
      //           this.filterMessage = "From Date Should be less than To Date";
      //       }
      //       return;
      //   }
      //   if (Number(poFilterData.PoTypeId) == 4) {
      //       this.hideText = true;
      //       this.filterMessage = "No matching records are found";
      //       //this.showFilterPopUp = true;
      //   }
      //   else {
            
  
      //   }  
       
    }


    filterData() {
        debugger;
        this.filterMessage = "";
        //let poFilterData:PurchaseOrderFilterModel = this.poFilterInfoForm.value;
        let poFilterData: PurchaseOrderFilterModel = this.poFilterInfoForm.value;
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
            // poFilterData.FromDate = this.reqDateFormatPipe.transform(this.poFilterInfoForm.get('FromDate').value);
            //poFilterData.FromDate = this.reqDateFormatPipe.transformYYYYMMDD(this.poFilterInfoForm.get('FromDate').value);

            const a1 = this.poFilterInfoForm.get('FromDate').value.toString();
            const a2 = this.poFilterInfoForm.get('FromDate').value;

            poFilterData.FromDate = this.poFilterInfoForm.get('FromDate').value;
            //poFilterData.FDate =this.poFilterInfoForm.get('FromDate').value;
        }

        if (this.poFilterInfoForm.get('ToDate').value != null) {
            //poFilterData.ToDate = this.reqDateFormatPipe.transform(this.poFilterInfoForm.get('ToDate').value);
            //poFilterData.ToDate = this.reqDateFormatPipe.transformYYYYMMDD(this.poFilterInfoForm.get('ToDate').value);
            poFilterData.ToDate = this.poFilterInfoForm.get('ToDate').value;
            //poFilterData.TDate =this.poFilterInfoForm.get('ToDate').value;
        }

        debugger;
        //*************************************************************************************************************/
        //From Date Str
        //*************************************************************************************************************/
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


        if ((poFilterData.POCode === '' || poFilterData.POCode == null)
            && (poFilterData.SupplierName === '' || poFilterData.SupplierName == null)
            && (poFilterData.PoTypeId == 0 || poFilterData.PoTypeId == null)
            && (poFilterData.WorkFlowStatusId == null || poFilterData.WorkFlowStatusId == 0)
            && (poFilterData.FromDate == null && poFilterData.ToDate == null)) {
            if (open) {
                if ((this.poFilterInfoForm.get('SupplierName').value == null || this.poFilterInfoForm.get('SupplierName').value == "") && this.SupplierNameValidate != "") {
                    this.hideText = true;
                    this.filterMessage = "No matching records are found";
                    //this.showFilterPopUp = true;
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
        if (Number(poFilterData.PoTypeId) == 4) {
            this.hideText = true;
            this.filterMessage = "No matching records are found";
            //this.showFilterPopUp = true;
        }
        else {
            debugger;
            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0, 0, false, poFilterData);
            if (this.purchaseOrdersList.length > 0) {
                this.isFilterApplied = true;
                this.filterMessage == "";
                //   if (open) {
                //       this.showFilterPopUp = true;
                //   }
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
}