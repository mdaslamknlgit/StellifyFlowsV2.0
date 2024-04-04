import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { Observable, of } from 'rxjs';
import { GoodsReceivedNotesService } from "../../services/goods-received-notes.service";
import { SharedService } from "../../../shared/services/shared.service";
import { PagerConfig, MessageTypes, GridOperations, ResponseStatusTypes, Messages, Suppliers, UserDetails, WorkFlowStatus, PurchaseOrderType, Assets, UserProfile } from "../../../shared/models/shared.model";
import { POCreationService } from "../../services/po-creation.service";
import { FullScreen, restrictMinus, ValidateFileType, getProcessId } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { GoodsReceivedNotes, GoodsReceivedNotesDisplayResult, GoodsReceivedNotesList, GoodsReceivedNotesItems, GRNFilterDisplayInput, GRNVoid } from '../../models/goods-received-notes.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DateObj, PurchaseOrderFilterModel, PurchaseOrderList, PurchaseOrderTypes } from '../../models/po-creation.model';
import { Asset } from '../../../fixedassets/models/asset.model';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { ActivatedRoute, Router,ParamMap } from '@angular/router';
import { Roles } from '../../../administration/models/role';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ExportToCsv } from 'export-to-csv';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { ExportService } from '../../services/export.service';
import { ExcelJson } from '../interfaces/excel-json.interface';

import * as moment from 'moment';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-goods-received-order-list',
    templateUrl: './goods-received-notes-list.component.html',
    styleUrls: ['./goods-received-notes-list.component.css'],
    providers: [GoodsReceivedNotesService, POCreationService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class GoodReceivedNotesListComponent implements OnInit {
    //*****************************************************************************************************************/
    //Dates Related Variables
    //*****************************************************************************************************************/
    firstDay: string = "";
    currentDay: string = "";
    lastDay: string = "";
    currentDate: string;
    priorDate: Date;
    todayDate = new Date();
    interval;
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
    showLeftPanelLoadingIcon: boolean = false;
    userDetails: UserDetails = null;
    exportColumns;
    SelexportColumns;
    closeResult: string;
    companyId: number = 0;
    hideText?: boolean = null;
    hideInput?: boolean = null;
    leftSection: boolean = false;
    rightSection: boolean = false;
    slideActive: boolean = false;
    goodsReceivedNotesList: Array<GoodsReceivedNotesList> = [];
    showdilogbox: boolean = false;
    FiltergoodsReceivedNotesList: Array<GoodsReceivedNotesList> = [];
    IsFilterDataArrive:boolean=false;
    IsExportClick:boolean=false;
    TotalRecords: number = 0;
    FileName:string="";
    FileNo:number=0;
    CurrentDate:string="";

    goodsReceivedNotesPagerConfig: PagerConfig;
    goodsReceivedNotesForm: FormGroup;
    assetItemsForm: FormGroup;
    selectedGRNDetails: GoodsReceivedNotes;
    gridColumns: Array<{ field: string, header: string }> = [];
    // assetGridColumns: Array<{ field: string, header: string }> = [];
    recordInEditMode: number;
    operation: string;
    showGridErrorMessage: boolean = false;
    showGridErrorMessage1: boolean = false;
    scrollbarOptions: any;
    goodsReceviedNotesSearchKey: string;
    apiEndPoint: string;
    hideLeftPanel: boolean = false;
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    leftsection: boolean = false;
    showfilters:boolean=true;
    showfilterstext:string="Show List" ;
    rightsection: boolean = false;
    errorMessage: string = Messages.NoRecordsToDisplay;
    showAssetsDialog: boolean = false;
    selectedRowId: number = 0;
    requestType: string = "";
    isReturnPage: boolean = false;
    moduleHeading: string;
    count: number = 0;
    uploadedFiles: Array<File> = [];
    showVoidPopUp: boolean = false;
    voidPopUpTabId: number = 1;
    grnVoidForm: FormGroup;
    workFlowStatus: any;
    grnFilterInfoForm: FormGroup;
    filterMessage: string = "";
    initSettingsDone = true;
    isFilterApplied: boolean = false;
    goodsReceivedNotesListCols: any[];
    initDone = false;
    filteredgrn = [];
    supplierId: number;
    puchaseOrderCode: string;
    purchaseOrderTypes: Array<PurchaseOrderTypes> = [];
    departments: Location[] = [];
    currentPage: number = 1;
    newPermission: boolean;
    editPermission: boolean;
    printPermission: boolean;
    voidPermission: boolean;
    isCompanyChanged: boolean = false;
    SupplierNameValidate: string = "";
    showLogPopUp: boolean = false;
    isSameUSer: boolean = false;
    viewLogPermission: boolean = false;
    public screenWidth: any;
    @ViewChild('grnCode') private grnRef: any;
    @ViewChild("SupplierDoNumber") nameInput: ElementRef;
    public innerWidth: any;
    constructor(private reqDateFormatPipe: RequestDateFormatPipe, 
        private exportService: ExportService,
        private pocreationObj: POCreationService,
        private deliveryCreationObj: GoodsReceivedNotesService,
        private router: Router,
        private formBuilderObj: FormBuilder,
        private sharedServiceObj: SharedService,
        public sessionService: SessionStorageService,
        private renderer: Renderer,
        private confirmationServiceObj: ConfirmationService,
        public activatedRoute: ActivatedRoute,
        private datePipe: DatePipe,
        private modalService: NgbModal) {
        this.gridColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'ItemType', header: 'Item Type' },
            { field: 'Item/Service', header: 'Item' },
            { field: '', header: 'Description' },
            { field: 'MeasurementUnitCode', header: 'UOM' },
            { field: 'OriginalQty', header: 'Original Qty' },
            { field: 'TotalReceivedQty', header: 'Total Qty' },
            { field: 'OpenQty', header: 'Open Qty' },
            { field: 'GRNQty', header: 'GRN Qty' },
        ];
        // this.assetGridColumns = [
        //     { field: 'Sno', header: 'S.no.' },
        //     { field: 'Asset', header: 'Asset Name' },
        //     { field: 'PurchasedDate', header: 'Purchased Date' },
        //     { field: 'ManufacturedBy', header: 'Manufacturer' },
        //     //{ field: 'Warranty', header: 'Warranty' },
        //     { field: 'ManufacturingDate', header: 'Manufacturing Date' },
        // ];

        this.apiEndPoint = environment.apiEndpoint;
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();
        this.workFlowStatus = WorkFlowStatus;
    }

    @ViewChild('rightPanel') rightPanelRef;


    initializeFilterForm(): void {
        this.grnFilterInfoForm = this.formBuilderObj.group({
            GRNCode: [''],
            DoNumber: [''],
            PoNumber: [''],
            Status: [0],
            FromDate: [],
            ToDate: [],
            SupplierName: [null],
            PoTypeId: [0],
            Department: [0],
            SupplierCode: []
        });

    }
    ngOnInit() {

        this.initializeFilterForm();

        this.requestType = this.activatedRoute.snapshot.params.type;
        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            if (param.get('type') != undefined) {
                this.requestType = param.get('type');
            }
            
            //alert(" Purchase Order Creation \n  Purchase Order ID : " + this.pPurchaseOrderId + "\n Purchase Order Type : " + this.pPurchaseOrderTypeId + "\n Supplier Id: " + this.SupplierID);

        });

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

        // this.grnFilterInfoForm.controls.FromDate.setValue({
        //     year: FirstDateYear,
        //     month: FirstDateMonth,
        //     day: FirstDateDay
        // });

        // this.grnFilterInfoForm.controls.ToDate.setValue({
        //     year: CurrentDateYear,
        //     month: CurrentDateMonth,
        //     day: CurrentDateDay
        // });

        this.grnFilterInfoForm.controls.FromDate.setValue(FDate);
        this.grnFilterInfoForm.controls.ToDate.setValue(TDate);
        //**********************************************************************************************************************

        this.goodsReceivedNotesListCols = [
            { field: 'DraftCode', header: 'Draft Code', width: '100px' },
            { field: 'SupplierDoNumber', header: 'Supplier DO No', width: '200px' },
            { field: 'PurchaseOrderCode', header: 'PO Number', width: '150px' },
            { field: 'CreatedDate', header: 'Created On', width: '150px' },
            { field: 'WorkFlowStatusText', header: 'Status', width: '150px'  },
            { field: '', header: 'Action', width: '100px'  },
        ];
        //getting role access levels  
       
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "goodsreceivednotes")[0];
            let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
            if (auditLogRole != null)
                this.viewLogPermission = auditLogRole.IsView;
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.printPermission = formRole.IsPrint;
            this.voidPermission = formRole.IsVoid;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.printPermission = true;
            this.voidPermission = true;
        }
        if (!this.voidPermission) {
            this.sharedServiceObj.getUserRolesByCompany(this.userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
                if (roles != null) {
                    this.voidPermission = roles.some(x => x.RoleName.toLowerCase() == 'admin');
                }
            });
        }
        this.goodsReceivedNotesPagerConfig = new PagerConfig();
        this.goodsReceivedNotesPagerConfig.RecordsToSkip = 0;
        //this.goodsReceivedNotesPagerConfig.RecordsToFetch = 10;
        this.goodsReceivedNotesPagerConfig.RecordsToFetch = 25;
        this.selectedGRNDetails = new GoodsReceivedNotes();
        this.goodsReceivedNotesForm = this.formBuilderObj.group({
            'Supplier': [null],
            'SupplierAddress':[''],
            'PurchaseOrderId': [0, [Validators.required]],
            'POTypeId': [1],
            'PurchaseOrder': [null],
            'GoodsReceivedNoteId': [0],
            'SupplierDoNumber': ["", [Validators.required]],
            'GRNRemarks': [""],
            'ItemsList': new FormArray([]),
            //'IsGstBeforeDiscount':[false],
            'LocationID': [0],
            "Assets": [],
        });
        this.assetItemsForm = this.formBuilderObj.group({
            'Assets': this.formBuilderObj.array([]),
        });
        this.grnVoidForm = this.formBuilderObj.group({
            Reasons: ["", [Validators.required]]
        });

        this.pocreationObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                this.purchaseOrderTypes = data.filter(data => data.PurchaseOrderTypeId != PurchaseOrderType.ProjectPo && data.PurchaseOrderTypeId != PurchaseOrderType.ContractPoFixed && data.PurchaseOrderTypeId != PurchaseOrderType.ContractPoVariable);
                // this.purchaseOrderTypes.push({ PurchaseOrderTypeId:PurchaseOrderType.ContractPoFixed,PurchaseOrderType:"Contract PO" });
            });

        this.sharedServiceObj.IsCompanyChanged$
            .subscribe((data) => {
                this.isCompanyChanged = data;
                if (this.isCompanyChanged) {

                    this.getGoodsReceivedNotes(0);
                    this.sharedServiceObj.updateCompany(false);
                }
            });

        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                //this.getGoodsReceivedNotes(0);
            });


        this.operation = GridOperations.Display;
        this.hideText = true;
        //this.getGoodsReceivedNotes(0);

        this.selectedGRNDetails.CreatedDate = new Date();
        this.activatedRoute.paramMap.subscribe((data) => {
            if (data != null) {
                this.navigateToPage();
                this.getDepartments(this.companyId);
            }
        });

        
            this.screenWidth = window.innerWidth-180;
         
         this.showfilters =true;
         this.showfilterstext="Hide List" ; 
    }

    getDepartments(companyId: number) {
        this.sharedServiceObj.GetUserCompanyDepartments(companyId, this.userDetails.UserID)
            .subscribe((data: Location[]) => {
                this.departments = data;
            });
    }

    navigateToPage() {
        this.requestType = this.activatedRoute.snapshot.params.type;
        this.SetDates();
        if (this.activatedRoute.snapshot.params.type == "request") {
            this.isReturnPage = false;
            this.moduleHeading = "Goods Received Notes List";
            this.getGoodsReceivedNotes(0);
            this.gridColumns.find(data => data.field == "TotalReceivedQty").header = "Total Received Qty";
            this.gridColumns.find(data => data.field == "GRNQty").header = "GRN Qty";

        }
        else if (this.activatedRoute.snapshot.params.type == "return") {
            this.isReturnPage = true;
            this.moduleHeading = "Goods Returned Notes";
            this.getGoodsReceivedNotes(0);
            this.gridColumns.find(data => data.field == "TotalReceivedQty").header = "Total Returned Qty";
            this.gridColumns.find(data => data.field == "GRNQty").header = "RTN Qty";

        }
    }
    //to get  the purchase orders..
    getGoodsReceivedNotes(grndId: number) {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput = {
            Skip: this.goodsReceivedNotesPagerConfig.RecordsToSkip,
            Take: this.goodsReceivedNotesPagerConfig.RecordsToFetch,
            Search: "",
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID,
            FromDateFilter: this.FromDateStr,
            ToDateFilter: this.ToDateStr,
        };
        this.deliveryCreationObj.getGoodsReceivedNotes(purchaseOrderDisplayInput)
            .subscribe((data: GoodsReceivedNotesDisplayResult) => {
                //debugger;
                if (this.isReturnPage) {
                    this.goodsReceivedNotesList = data.GoodsReceivedNotes;
                    this.goodsReceivedNotesList = this.goodsReceivedNotesList.filter(x => x.IsReturn == true);
                }
                else {
                    this.goodsReceivedNotesList = data.GoodsReceivedNotes;
                    this.goodsReceivedNotesList = this.goodsReceivedNotesList.filter(x => x.IsReturn == false);
                }
                this.goodsReceivedNotesPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                if (this.goodsReceivedNotesList.length > 0) {
                    // if (grndId == 0) {
                    //     this.onRecordSelection(this.goodsReceivedNotesList[0].GoodsReceivedNoteId,
                    //         this.goodsReceivedNotesList[0].PurchaseOrderId
                    //         , this.goodsReceivedNotesList[0].POTypeId);
                    // }
                    // else {
                    //     let record = this.goodsReceivedNotesList.find(j => j.GoodsReceivedNoteId == grndId);
                    //     this.onRecordSelection(grndId, record.PurchaseOrderId, record.POTypeId);
                    // }
                }
                else {
                    this.addRecord();
                }
            }, (error) => {

            });
    }
    //to get list of purchase orders..
    searchGoodsReceivedNotes(searchKey: string, grndId: number) {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput = {
            Skip: this.goodsReceivedNotesPagerConfig.RecordsToSkip,
            Take: this.goodsReceivedNotesPagerConfig.RecordsToFetch,
            Search: searchKey,
            UserId: this.userDetails.UserID,
            CompanyId: this.companyId,
            From: "GRN"
        };
        this.deliveryCreationObj.getGoodsReceivedNotes(purchaseOrderDisplayInput)
            .subscribe((data: GoodsReceivedNotesDisplayResult) => {
                this.goodsReceivedNotesList = data.GoodsReceivedNotes;
                this.goodsReceivedNotesPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                if (this.goodsReceivedNotesList.length > 0) {
                    if (grndId == 0) {
                        this.onRecordSelection(this.goodsReceivedNotesList[0].GoodsReceivedNoteId, this.goodsReceivedNotesList[0].PurchaseOrderId, this.goodsReceivedNotesList[0].POTypeId);
                    }
                    else {
                        this.onRecordSelection(grndId, 0, 0);
                    }
                }
                else {
                    this.addRecord();
                }
            });
    }

    addRecord() {

        //http://localhost:4200/#/po/goodsreceivednotes/request/1447
        this.router.navigate([`/po/goodsreceivednotes/${this.requestType}/${0}`]);

        // this.innerWidth = window.innerWidth;
        // if (this.innerWidth < 550) {
        //     $(".leftdiv").addClass("hideleftcol");
        //     $(".rightPanel").addClass("showrightcol");
        // }
        // //setting this variable to false so as to show the purchase order details in edit mode
        // this.hideText = false;
        // this.hideInput = true;
        // this.selectedGRNDetails = new GoodsReceivedNotes();
        // //resetting the purchase order form..
        // this.goodsReceivedNotesForm.reset();
        // this.goodsReceivedNotesForm.setErrors(null);
        // let itemGroupControl = <FormArray>this.goodsReceivedNotesForm.controls['ItemsList'];
        // itemGroupControl.controls = [];
        // itemGroupControl.controls.length = 0;
        // this.goodsReceivedNotesForm.patchValue({
        //     SupplierTypeID: "1",
        //     IsGstRequired: false
        // });
        // //this.showFullScreen();
        // this.showfilters = false;
        // this.showfilterstext = "Show List";
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(grndId: number, poId: number, poTypeId: number) {
        //http://localhost:4200/#/po/goodsreceivednotes/request/1447
        //alert("Grnd Id: " + grndId + " \n Purchase Id : " + poId + " \n Po Type Id : " + poTypeId);

        //po/goodsreceivednoteslist/request
        this.router.navigate([`/po/goodsreceivednotes/${this.requestType}/${grndId}`]);
        // this.split();
        // // console.log("record selection");
        // let userDetails = <UserDetails>this.sessionService.getUser();
        // this.deliveryCreationObj.getGoodsReceivedNotesDetails(grndId, poId, poTypeId, this.companyId)
        //     .subscribe((data: GoodsReceivedNotes) => {
        //         //debugger;
        //         this.isSameUSer = (data.CreatedBy == userDetails.UserID) ? true : false;
        //         this.selectedGRNDetails = data;
        //         this.selectedGRNDetails.POTypeId = poTypeId;
        //         this.operation = GridOperations.Display;
        //         this.goodsReceivedNotesForm.patchValue(data);
        //         this.hideText = true;
        //         this.hideInput = false;
        //     });
    }

    poInputFormatter = (x: PurchaseOrderList) => x.PurchaseOrderCode;
    poSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    let supplier = this.goodsReceivedNotesForm.get('Supplier').value;
                    this.clearForm();
                    this.selectedGRNDetails = new GoodsReceivedNotes();
                    this.goodsReceivedNotesForm.patchValue({
                        'Supplier': supplier
                    });
                    return of([]);
                }
                return this.sharedServiceObj.getAllSearchPurchaseOrders({
                    Search: term,
                    SupplierId: this.goodsReceivedNotesForm.get('Supplier').value == null ? 0 : this.goodsReceivedNotesForm.get('Supplier').value.SupplierId,
                    CompanyId: this.companyId,
                    UserId: this.userDetails.UserID,
                    From: "GRN",
                    WorkFlowStatusId: WorkFlowStatus.Approved//getting only those purchase orders which are approved..
                }).map((data: Array<any>) => {
                    data.forEach((item, index) => {
                        item.index = index;
                    });
                    return data;
                }).pipe(
                    catchError((data) => {
                        return of([]);
                    }))
            })
        );

    //supplierInputFormater = (x: Suppliers) => x.SupplierName;
    supplierInputFormater = (x: Suppliers) => x.WorkFlowStatus === "Approved" ? x.SupplierName : "";
    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    this.clearForm();
                    this.selectedGRNDetails = new GoodsReceivedNotes();
                    return of([]);
                }
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: 0,
                    CompanyId: this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
        );

    //supplierFilterInputFormater = (x: Suppliers) => x.SupplierName;  
    supplierFilterInputFormater = (x: Suppliers) => x.WorkFlowStatus === "Approved" ? x.SupplierName : "";
    supplierFilterSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: 0,
                    CompanyId: this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
        );

    initGridRows() {
        return this.formBuilderObj.group({
            'RecordId': [0],
            'TypeId': [0],
            'Category': [0],
            'POTypeId': [0],
            'ItemType': [0],
            'GRNItemId': 0,
            'ItemDescription': [""],
            'MeasurementUnitID': [0],
            'MeasurementUnitCode': [""],
            'Item': [null],
            'Service': [null],
            "RequestedQty": [0],
            "OriginalQty": [0],
            "TotalReceivedQty": [0],
            "OpenQty": [0],
            "GRNQty": [0, [Validators.required]],
            'PurchaseValue': [0],
            'Discount': [0]
        });
    }

    initAssetGridRows() {
        return this.formBuilderObj.group({
            'AssetDetailsId': [0],
            'SerialNumber': ["", [Validators.required]],
            'Asset': [null],
            'PurchasedDate': [new Date(), [Validators.required]],
            'ManufacturedBy': [""],
            // 'Warranty':[""],
            'ManufacturedDate': [new Date()]
        });
    }

    grnQtyChange(gridRow: any) {
        let grnControl = gridRow.get('GRNQty');
        let orignalQtyControl = gridRow.get('OriginalQty');
        let openQtyControl = gridRow.get('OpenQty');
        if (grnControl.value > orignalQtyControl.value) {
            grnControl.setErrors({ 'qtyerror1': true });
        }
        else if (grnControl.value > openQtyControl.value) {
            grnControl.setErrors({ 'qtyerror2': true });
        }
    }
    //adding row to the grid..
    addGridItem(noOfLines: number) {
        let itemGroupControl = <FormArray>this.goodsReceivedNotesForm.controls['ItemsList'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGridRows());
        }
    }
    /**
     * to hide the category details and show in add mode..
     */
  

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
        // this.hideLeftPanel = false;
        // this.sharedServiceObj.hideAppBar(false);//hiding the app bar..
    }
    /**
     * to save the given purchase order details
    */
    saveGRNDetails(statusId: number) {
        this.count = 0;
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        let userid = userDetails.UserID;
        this.showGridErrorMessage = false;
        this.showGridErrorMessage1 = false;
        let itemGroupControl = <FormArray>this.goodsReceivedNotesForm.controls['ItemsList'];
        if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
            this.showGridErrorMessage = true;
            return;
        }
        else {
            for (let i = 0; i < itemGroupControl.length; i++) {
                if (itemGroupControl.controls[i].get('GRNQty').value != 0) {
                    this.count++;
                }
            }
            if (this.count == 0) {
                this.showGridErrorMessage1 = true;
                return;;
            }
        }
        let formStatus = this.goodsReceivedNotesForm.status;
        if (formStatus != "INVALID") {
            let goodReceivedItem: GoodsReceivedNotes = this.goodsReceivedNotesForm.value;
            goodReceivedItem.WorkFlowStatusId = statusId;
            goodReceivedItem.IsReturn = this.isReturnPage ? true : false;
            goodReceivedItem.ItemsList.forEach(i => {
                if (i.GRNItemId > 0) {
                    let previousRecord = this.selectedGRNDetails.ItemsList.find(j => j.GRNItemId == i.GRNItemId);
                    if (i.GRNQty != previousRecord.GRNQty) {
                        i.IsModified = true;
                    }
                }
                else {
                    i.GRNItemId = 0;
                }
            });
            goodReceivedItem.CreatedBy = userid;
            goodReceivedItem.CompanyId = this.companyId;
            goodReceivedItem.SupplierId = this.supplierId;
            goodReceivedItem.PurchaseOrderCode = this.puchaseOrderCode;
            goodReceivedItem.ItemsList = goodReceivedItem.ItemsList.filter(i => i.GRNItemId == 0 || i.GRNItemId == null || i.IsModified == true);
            if (this.selectedGRNDetails.GoodsReceivedNoteId == 0 || this.selectedGRNDetails.GoodsReceivedNoteId == null) {
                goodReceivedItem.GoodsReceivedNoteId = 0;
                //goodReceivedItem.ItemsList = goodReceivedItem.ItemsList.filter(item => item.GRNQty !== 0);    
                this.deliveryCreationObj.createGoodsReceivedNotes(goodReceivedItem, this.uploadedFiles).subscribe((grndId: number) => {
                    if (grndId > 0) {
                        this.hideText = true;
                        this.hideInput = false;
                        this.recordInEditMode = -1;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.getGoodsReceivedNotes(grndId);
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage1 = false;
                    }
                    else {
                        this.showDuplicateMessage();
                    }
                }
                    // ,
                    //     (data: HttpErrorResponse) => {
                    //         if (data.error.Message == ResponseStatusTypes.Duplicate) {
                    //             this.showDuplicateMessage();
                    //         }
                    //     }
                );
            }
            else {
                goodReceivedItem.GoodsReceivedNoteId = this.selectedGRNDetails.GoodsReceivedNoteId;
                goodReceivedItem.DOAttachments = this.selectedGRNDetails.DOAttachments.filter(i => i.IsDelete == true);

                this.deliveryCreationObj.updateGoodReceivedNotes(goodReceivedItem, this.uploadedFiles)
                    .subscribe((goodsReceivedNoteId: number) => {
                        if (goodsReceivedNoteId > 0) {
                            this.hideText = true;
                            this.hideInput = false;
                            this.recordInEditMode = -1;
                            this.uploadedFiles.length = 0;
                            this.uploadedFiles = [];
                            this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.UpdatedSuccessFully,
                                MessageType: MessageTypes.Success
                            });
                            this.getGoodsReceivedNotes(goodReceivedItem.GoodsReceivedNoteId);
                            this.showGridErrorMessage = false;
                            this.showGridErrorMessage1 = false;
                        }
                        else {
                            this.showDuplicateMessage();
                        }
                    }
                        // , (data: HttpErrorResponse) => {
                        //     if (data.error.Message == ResponseStatusTypes.Duplicate) {
                        //         this.showDuplicateMessage();
                        //     }
                        // }
                    );
            }
        }
        else {
            Object.keys(this.goodsReceivedNotesForm.controls).forEach((key: string) => {
                if (this.goodsReceivedNotesForm.controls[key].status == "INVALID" && this.goodsReceivedNotesForm.controls[key].touched == false) {
                    this.goodsReceivedNotesForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.goodsReceivedNotesForm.controls['ItemsList'];
            itemGroupControl.controls.forEach(controlObj => {
                Object.keys(controlObj["controls"]).forEach((key: string) => {
                    let itemGroupControl = controlObj.get(key);
                    if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
                        itemGroupControl.markAsTouched();
                    }
                });
            });
        }
    }


    saveRecord(statusId: number) {
        if (this.validateForm(statusId) == true) {
            this.saveGRNDetails(statusId);
        }
    }

    submit() {
        if (this.validateForm(WorkFlowStatus.Completed) == true) {
            this.confirmationServiceObj.confirm({
                message: "Details once submitted cannot be changed.Do you want to continue ??",
                header: "Confirmation",
                accept: () => {
                    this.saveGRNDetails(WorkFlowStatus.Completed);
                },
                reject: () => {
                }
            });
        }
    }

    showDuplicateMessage() {
        //setting the error for the "Name" control..so as to show the duplicate validation message..
        this.goodsReceivedNotesForm.get('SupplierDoNumber').setErrors({
            'Duplicate': true
        });
    }
    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the purchase order details on cancel button click event..
     */
    cancelRecord() {
        //setting this variable to true so as to show the purchase details
        this.goodsReceivedNotesForm.reset();
        this.goodsReceivedNotesForm.setErrors(null);
        this.showGridErrorMessage1 = false;
        if (this.goodsReceivedNotesList.length > 0 && this.selectedGRNDetails != undefined) {
            let record;
            if (this.selectedGRNDetails.GoodsReceivedNoteId == undefined || this.selectedGRNDetails.GoodsReceivedNoteId == 0) {
                record = this.goodsReceivedNotesList[0];

            }
            else {

                record = this.selectedGRNDetails;
            }
            this.onRecordSelection(record.GoodsReceivedNoteId,
                record.PurchaseOrderId,
                record.POTypeId);
            //setting this variable to true so as to show the purchase details
            this.hideInput = false;
            this.hideText = true;
        }
        else {
            this.hideInput = null;
            this.hideText = null;
        }
        this.sharedServiceObj.hideAppBar(false);//showing the app bar..
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
    }
    /**
     * to delete the selected record...
     */
    deleteRecord() {
        let recordId = this.selectedGRNDetails.GoodsReceivedNoteId;
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                this.deliveryCreationObj.deleteGoodsReceivedNotes(recordId, userDetails.UserID, this.selectedGRNDetails.PurchaseOrderId, this.selectedGRNDetails.POTypeId).
                    subscribe((data) => {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.DeletedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.getGoodsReceivedNotes(0);
                    });
            },
            reject: () => {
            }
        });
    }
    /**
     * to show the purchase order details in edit mode....
     */
    editRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.hideInput = true;
        this.hideText = false;
        //resetting the item category form.
        this.clearForm();
        this.addGridItem(this.selectedGRNDetails.ItemsList.length);
        this.goodsReceivedNotesForm.patchValue(this.selectedGRNDetails);
        this.supplierId = this.selectedGRNDetails.Supplier.SupplierId;
        this.deliveryCreationObj.getEditGRNDetails(this.selectedGRNDetails.GoodsReceivedNoteId, this.selectedGRNDetails.PurchaseOrderId, this.selectedGRNDetails.POTypeId)
            .subscribe((data: GoodsReceivedNotes) => {
                if (data.gRNQtyTotal.length > 0) {
                    for (let s = 0; s < data.gRNQtyTotal.length; s++) {
                        try {
                            let aa = this.selectedGRNDetails.ItemsList.filter(i => i.RecordId == data.gRNQtyTotal[s].RecordId);
                            for (let m = 0; m < this.selectedGRNDetails.ItemsList.length; m++) {
                                if (this.selectedGRNDetails.ItemsList[m].RecordId == aa[0].RecordId) {
                                    let recQty = Number(data.gRNQtyTotal[s].TotalReceivedQty);
                                    let openQty = Number(data.gRNQtyTotal[s].OpenQty);
                                    this.selectedGRNDetails.ItemsList[m].TotalReceivedQty = recQty;
                                    this.selectedGRNDetails.ItemsList[m].OpenQty = openQty;
                                }
                            }
                        }
                        catch { }
                    }
                }
                else {
                    for (let m = 0; m < this.selectedGRNDetails.ItemsList.length; m++) {
                        let recQty = Number(0);
                        let openQty = Number(this.selectedGRNDetails.ItemsList[m].OriginalQty);
                        this.selectedGRNDetails.ItemsList[m].TotalReceivedQty = recQty;
                        this.selectedGRNDetails.ItemsList[m].OpenQty = openQty;
                    }
                }

                this.goodsReceivedNotesForm.controls['ItemsList'].patchValue(this.selectedGRNDetails.ItemsList);
            });
    }

    clearForm() {
        this.goodsReceivedNotesForm.reset();
        this.goodsReceivedNotesForm.get('ItemsList').reset();
        let itemGroupControl = <FormArray>this.goodsReceivedNotesForm.controls['ItemsList'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
    }

    onSupplierChange(event: any) {
        if (event.item != null && event.item != undefined) {
            if (event.item.WorkFlowStatus != "Approved") {
                this.goodsReceivedNotesForm.get('Supplier').setValue(null);
                event.preventDefault();
            }
            else if (event.item.IsFreezed) {
                this.goodsReceivedNotesForm.get('Supplier').setValue(null);
                event.preventDefault();
            }
        }
    }

    onSupplierFilterChange(event: any) {
        if (event.item != null && event.item != undefined) {
            if (event.item.WorkFlowStatus != "Approved") {
                this.grnFilterInfoForm.get('SupplierName').setValue(null);
                event.preventDefault();
            }
            else if (event.item.IsFreezed) {
                this.grnFilterInfoForm.get('SupplierName').setValue(null);
                event.preventDefault();
            }
        }
    }


    poSelection(eventData: any) {
        let supplier = this.goodsReceivedNotesForm.get('Supplier').value;
        this.clearForm();
        let purchaseOrderTypeId = eventData.item.POTypeId;
        let purchaseOrderId = eventData.item.PurchaseOrderId;
        this.goodsReceivedNotesForm.patchValue({
            'PurchaseOrderId': purchaseOrderId,
            'POTypeId': purchaseOrderTypeId,
            'Supplier': supplier
        });

        this.deliveryCreationObj.getDraftCount(purchaseOrderId, purchaseOrderTypeId, this.companyId).subscribe((data: GoodsReceivedNotesDisplayResult) => {
            if (data.graftGRNlist.length > 0) {
                this.confirmationServiceObj.confirm({
                    message: "Do you want to use the existing GRN ??",
                    header: "Confirmation",
                    acceptLabel: "Yes",
                    rejectLabel: "No",
                    rejectVisible: true,
                    accept: () => {
                        this.deliveryCreationObj.getGoodsReceivedNotesDetails(data.graftGRNlist[0].GoodsReceivedNoteId, purchaseOrderId, purchaseOrderTypeId, this.companyId)
                            .subscribe((data: GoodsReceivedNotes) => {
                                this.selectedGRNDetails = data;
                                this.selectedGRNDetails.POTypeId = purchaseOrderTypeId;
                                this.supplierId = this.selectedGRNDetails.Supplier.SupplierId;
                                this.puchaseOrderCode = this.selectedGRNDetails.PurchaseOrderCode;
                                this.operation = GridOperations.Display;
                                this.goodsReceivedNotesForm.patchValue(data);
                                this.clearForm();
                                this.addGridItem(this.selectedGRNDetails.ItemsList.length);
                                this.goodsReceivedNotesForm.patchValue(this.selectedGRNDetails);
                            });
                    },
                    reject: () => {
                        this.getPoSelectionData(purchaseOrderId, purchaseOrderTypeId);
                    }
                });
            }

            else {
                this.getPoSelectionData(purchaseOrderId, purchaseOrderTypeId);
                this.sharedServiceObj.GetDocumentAddress(purchaseOrderTypeId, purchaseOrderId, this.companyId).subscribe((data: any) => {
                    this.goodsReceivedNotesForm.get('SupplierAddress').setValue(data.Address);
                });
            }
        });
    }

    getPoSelectionData(purchaseOrderId: number, purchaseOrderTypeId: number) {
        this.deliveryCreationObj.getGoodsReceivedNotesDetails(0, purchaseOrderId, purchaseOrderTypeId, this.companyId)
            .subscribe((data: { purchaseOrderDetails: any, totalReceivedQty: Array<GoodsReceivedNotesItems> }) => {
                let purchaseOrderDetails = data.purchaseOrderDetails;
                let goodReceivedItemsList: Array<GoodsReceivedNotesItems> = [];
                let openQty = 0;

                // console.log(purchaseOrderDetails);
                //let receivedQuantity = 0;
                purchaseOrderDetails.PurchaseOrderItems.forEach((rec) => {
                    // console.log(rec);             
                    if ((purchaseOrderTypeId == PurchaseOrderType.InventoryPo && rec.Item.ItemMasterId > 0)
                        || (purchaseOrderTypeId == PurchaseOrderType.FixedAssetPo && rec.AssetSubCategory.AssetSubcategoryId > 0)
                        || (purchaseOrderTypeId == PurchaseOrderType.FixedAssetPo && rec.ItemType == "Service")
                        || (purchaseOrderTypeId == PurchaseOrderType.ExpensePo && rec.Expense.AccountCodeId > 0)) {
                        let originalQty = 0;
                        let itemId = 0;
                        let itemDescription = "";
                        let recordId = 0;
                        let item: any;
                        let purchaseValue = 0;
                        let service;
                        let accountCodeCategoryId = 0;
                        let Discount = 0.0;
                        if (purchaseOrderTypeId == PurchaseOrderType.InventoryPo) {
                            originalQty = rec.ItemQty;
                            itemId = rec.PurchaseOrderItemId;
                            itemDescription = rec.ItemDescription;
                            Discount = rec.Discount;
                            if (rec.TypeId === 2) {
                                //  recordId = rec.Service.AccountCodeId;   
                                recordId = rec.PurchaseOrderItemId;
                            }
                            else {
                                recordId = rec.PurchaseOrderItemId;
                                item = rec.Item;
                            }
                        }
                        else if (purchaseOrderTypeId == PurchaseOrderType.FixedAssetPo) {
                            originalQty = rec.AssetQty;
                            itemId = rec.FixedAssetPOItemId;
                            itemDescription = rec.AssetDescription;
                            Discount = rec.Discount;
                            if (rec.TypeId === 2) {
                                // recordId = rec.Service.AccountCodeId;    
                                recordId = rec.FixedAssetPOItemId;
                            }
                            else {
                                recordId = rec.FixedAssetPOItemId;
                            }
                            if (rec.ItemType == "Service") {
                                item = {
                                    ItemMasterId: rec.Service.AccountCodeCategoryId,
                                    ItemName: rec.Service.AccountCodeName
                                };
                            }
                            else {
                                item = {
                                    ItemMasterId: rec.AssetSubCategory.AssetSubcategoryId,
                                    ItemName: rec.AssetSubCategory.AssetSubcategory
                                };
                            }

                            purchaseValue = rec.PurchaseValue;
                        }
                        else if (purchaseOrderTypeId == PurchaseOrderType.ExpensePo) {
                            originalQty = rec.ExpensesQty;
                            itemId = rec.ExpensesPOItemId;
                            itemDescription = rec.ExpensesDescription;
                            recordId = rec.ExpensesPOItemId;
                            Discount = rec.Discount;
                            item = {
                                ItemMasterId: rec.Expense.AccountCodeId,
                                ItemName: rec.Expense.AccountCodeName
                            };

                            service = rec.Expense;
                            if (rec.Category === null || rec.Category === 0) {
                                rec.ItemType = "Expenses";
                            }
                            else {
                                rec.ItemType = rec.Expense.AccountCodeName;
                                accountCodeCategoryId = rec.Expense.AccountCodeCategoryId;
                            }
                        }
                        //console.log(recordId);     

                        if (data.totalReceivedQty.length > 0 && data.totalReceivedQty.find(j => j.RecordId == recordId) != undefined) {
                            //openQty = data.totalReceivedQty.find(j=>j.RecordId == itemId).OpenQty;
                            openQty = data.totalReceivedQty.find(j => j.RecordId == recordId).OpenQty;
                        }
                        // if(data.totalReceivedQty.length > 0){
                        //     //receivedQuantity = data.totalReceivedQty.find(j=>j.RecordId == itemId).TotalReceivedQty;
                        //     receivedQuantity = data.totalReceivedQty.find(j=>j.RecordId == recordId).TotalReceivedQty;
                        // }                    
                        let originalQuantity = originalQty;

                        if (purchaseOrderDetails.POTypeId === PurchaseOrderType.InventoryPo || purchaseOrderDetails.POTypeId === PurchaseOrderType.FixedAssetPo) {
                            service = rec.Service;
                        }

                        if (openQty > 0 || data.totalReceivedQty.length === 0) {
                            goodReceivedItemsList.push({
                                RecordId: recordId,
                                GRNItemId: 0,
                                TypeId: rec.TypeId,
                                Category: accountCodeCategoryId,
                                ItemType: rec.ItemType,
                                Item: item,
                                Service: service,
                                OriginalQty: originalQty,
                                // TotalReceivedQty:data.totalReceivedQty.length==0?0: data.totalReceivedQty.find(j=>j.RecordId == itemId).TotalReceivedQty,
                                // OpenQty:data.totalReceivedQty.length==0?originalQty: data.totalReceivedQty.find(j=>j.RecordId == itemId).OpenQty,
                                TotalReceivedQty: (data.totalReceivedQty.length == 0 || data.totalReceivedQty.find(j => j.RecordId == recordId) == undefined) ? 0 : data.totalReceivedQty.find(j => j.RecordId == recordId).TotalReceivedQty,
                                OpenQty: (data.totalReceivedQty.length == 0 || data.totalReceivedQty.find(j => j.RecordId == recordId) == undefined) ? originalQty : data.totalReceivedQty.find(j => j.RecordId == recordId).OpenQty,
                                GRNQty: 0,
                                IsModified: false,
                                MeasurementUnitCode: rec.MeasurementUnitCode,
                                ItemDescription: itemDescription,
                                PurchaseValue: purchaseValue,
                                Discount: Discount
                            });
                        }
                        //  else{
                        //     if(openQty==0 && data.totalReceivedQty.find(j=>j.RecordId == recordId)!=undefined){
                        //     //if(data.totalReceivedQty.find(j=> j.TotalReceivedQty==0)){
                        //         goodReceivedItemsList.push({
                        //             RecordId:recordId,
                        //             GRNItemId:0,
                        //             TypeId: rec.TypeId,
                        //             Category: accountCodeCategoryId,
                        //             ItemType:rec.ItemType,
                        //             Item:item, 
                        //             Service:service,
                        //             OriginalQty:originalQty,
                        //             TotalReceivedQty:0,
                        //             OpenQty:originalQty,
                        //             GRNQty:0,
                        //             IsModified:false,
                        //             MeasurementUnitCode:rec.MeasurementUnitCode,
                        //             ItemDescription:itemDescription,
                        //             PurchaseValue:purchaseValue,
                        //         });
                        //     }
                        //  }
                    }

                });
                let purchaseOrderCode = "";
                if (purchaseOrderTypeId == PurchaseOrderType.InventoryPo) {
                    purchaseOrderCode = purchaseOrderDetails.PurchaseOrderCode;
                }
                else if (purchaseOrderTypeId == PurchaseOrderType.FixedAssetPo) {
                    purchaseOrderCode = purchaseOrderDetails.FixedAssetPurchaseOrderCode;
                }
                else if (purchaseOrderTypeId == PurchaseOrderType.ExpensePo) {
                    //purchaseOrderCode =purchaseOrderDetails.AccountCode;
                    purchaseOrderCode = purchaseOrderDetails.ExpensesPurchaseOrderCode;
                }
                this.selectedGRNDetails = {
                    GoodsReceivedNoteId: 0,
                    GRNCode: "",
                    PurchaseOrderId: purchaseOrderId,
                    PurchaseOrderCode: purchaseOrderCode,
                    SupplierDoNumber: 0,
                    GRNRemarks: "",
                    DeliveryAddress: purchaseOrderDetails.DeliveryAddress,
                    Supplier: purchaseOrderDetails.Supplier,
                    CostOfService: purchaseOrderDetails.CostOfService,
                    CurrencyCode: purchaseOrderDetails.CurrencyCode,
                    CurrencySymbol: purchaseOrderDetails.CurrencySymbol,
                    StatusText: "",
                    ItemsList: goodReceivedItemsList,
                    CreatedDate: new Date(),
                    DeliveryTerm: purchaseOrderDetails.DeliveryTerm,
                    Location: purchaseOrderDetails.Location,
                    RequestedByUserName: "",
                    CreatedBy: 0,
                    CompanyId: this.companyId,
                    PurchaseOrderType: purchaseOrderDetails.PurchaseOrderType,
                    Attachments: purchaseOrderDetails.Attachments,
                    IsGstBeforeDiscount: purchaseOrderDetails.IsGstBeforeDiscount,
                    LocationID: purchaseOrderDetails.LocationId,
                    StatusId: 1,
                    IsReturn: false,
                    Assets: [],
                    Designation: "",
                    DOAttachments: purchaseOrderDetails.DOAttachments,
                    DOAttachmentsDelete: [],
                    ReasonstoVoid: purchaseOrderDetails.ReasonstoVoid,
                    WorkFlowStatusId: purchaseOrderDetails.WorkFlowStatusId,
                    WorkFlowStatus: purchaseOrderDetails.WorkFlowStatus,
                    WorkFlowStatusText: purchaseOrderDetails.WorkFlowStatus,
                    gRNQtyTotal: [],
                    SupplierId: 0,
                    PONO: ""

                };
                //  console.log(this.selectedGRNDetails);
                this.supplierId = this.selectedGRNDetails.Supplier.SupplierId;
                this.puchaseOrderCode = this.selectedGRNDetails.PurchaseOrderCode;
                this.addGridItem(this.selectedGRNDetails.ItemsList.length);
                this.goodsReceivedNotesForm.patchValue({
                    "ItemsList": this.selectedGRNDetails.ItemsList,
                    "LocationID": this.selectedGRNDetails.LocationID
                });
            });
    }

    split() {
        this.showfilters=!this.showfilters;
if(this.showfilters == true){ 
    this.showfilterstext="Hide List" 
}
    else{
        this.showfilterstext="Show List" 
    }

       // this.leftsection = !this.leftsection;
      //  this.rightsection = !this.rightsection;
    }

    matselect(event) {
        if (event.checked == true) {
            this.slideActive = true;
        }
        else {
            this.slideActive = false;
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


    onSearchInputChange(event: any) {
        if (event.target.value != "") {
            this.searchGoodsReceivedNotes(event.target.value, 0);
        }
        else {
            this.getGoodsReceivedNotes(0);
        }
    }
    pageChange(currentPageNumber: any) {
        this.goodsReceivedNotesPagerConfig.RecordsToSkip = this.goodsReceivedNotesPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        if (this.isFilterApplied == true) {
            this.filterData();
        }
        else {
            this.getGoodsReceivedNotes(0);
        }
        this.showfilters =false;
    this.showfilterstext="Hide List" ; 
    }

    onPrintPDF() {
        let pdfDocument = this.deliveryCreationObj.printDetails(this.selectedGRNDetails.GoodsReceivedNoteId, this.selectedGRNDetails.POTypeId, this.companyId);
        pdfDocument.subscribe((data) => {

            let record = this.goodsReceivedNotesList.find(j => j.GoodsReceivedNoteId == this.selectedGRNDetails.GoodsReceivedNoteId && j.POTypeId == this.selectedGRNDetails.POTypeId);
            if (record.GRNCode == '') {
                saveAs(new Blob([(data)], { type: 'application/pdf' }), "GRN" + record.DraftCode + ".pdf");
            }
            else
                saveAs(new Blob([(data)], { type: 'application/pdf' }), "GRN" + record.GRNCode + ".pdf");
            // let result = new Blob([data], { type: 'application/pdf' });
            // if (window.navigator && window.navigator.msSaveOrOpenBlob) {//IE
            //     window.navigator.msSaveOrOpenBlob(result, "GoodsReceivedNotes.pdf");


            //   } else{
            // const fileUrl = URL.createObjectURL(result);
            // let tab = window.open();
            // tab.location.href = fileUrl;
            //   }
        });
    }
    restrictMinus(e: any) {
        restrictMinus(e);
    }
    // addAssetDetails(content:any,rowId:number)
    // { 
    //     this.showAssetsDialog = true;
    //     this.assetItemsForm.reset();
    //     let itemGroupControl = <FormArray>this.assetItemsForm.controls['Assets'];
    //     itemGroupControl.controls =[];
    //     itemGroupControl.controls.length =0; 
    //     let itemListControl = <FormArray>this.goodsReceivedNotesForm.controls['ItemsList']; 
    //     this.selectedRowId = rowId;      
    //     for(let i=0;i<itemListControl.controls.length;i++)
    //     {
    //         if(i==rowId)
    //         {
    //             let grnQty:number  = itemListControl.controls[i].get('GRNQty').value;
    //             let item:any  = itemListControl.controls[i].get('Item').value;   
    //             let assetsDetails:Asset[] = itemListControl.controls[i].get('Assets').value;
    //             for(let j=0;j< grnQty ;j++)
    //             {
    //                 itemGroupControl.push(this.initAssetGridRows());     
    //                 if(assetsDetails==null||assetsDetails.length==0||assetsDetails[j]==undefined){
    //                     itemGroupControl.controls[j].patchValue({ Asset:{
    //                         AssetId:item.ItemMasterId,
    //                         AssetName:item.ItemName
    //                     }});
    //                 }
    //                 else{
    //                     assetsDetails[j].PurchasedDate = new Date(assetsDetails[j].PurchasedDate);
    //                     itemGroupControl.controls[j].patchValue(assetsDetails[j]);
    //                 }
    //             }
    //             break;
    //         }
    //     }      
    // }
    // addItems() {
    //     let status = this.assetItemsForm.status;
    //     if (status != 'INVALID') {
    //         let assetsValue: Asset[] = this.assetItemsForm.controls['Assets'].value;
    //         if (this.hideText == true && this.selectedGRNDetails.GoodsReceivedNoteId > 0) {
    //             let currentRecord: GoodsReceivedNotes = JSON.parse(JSON.stringify(this.selectedGRNDetails));
    //             assetsValue.forEach(data => {
    //                 data.PurchasedDate = this.reqDateFormatPipe.transform(data.PurchasedDate);
    //                 data.ManufacturedDate = this.reqDateFormatPipe.transform(data.ManufacturedDate);
    //             })
    //             currentRecord.Assets = assetsValue;
    //             currentRecord.ItemsList = [];
    //             this.deliveryCreationObj.updateGoodReceivedNotes(currentRecord, this.uploadedFiles)
    //                 .subscribe((goodsReceivedNoteId: number) => {
    //                     this.sharedServiceObj.showMessage({
    //                         ShowMessage: true,
    //                         Message: Messages.UpdatedSuccessFully,
    //                         MessageType: MessageTypes.Success
    //                     });
    //                     this.getGoodsReceivedNotes(currentRecord.GoodsReceivedNoteId);
    //                     this.showGridErrorMessage = false;
    //                     this.showGridErrorMessage1 = false;
    //                     this.showAssetsDialog = false;
    //                 });
    //         }
    //         else {
    //             let assetsControl = <FormArray>this.goodsReceivedNotesForm.controls['Assets'];
    //             assetsControl.patchValue(assetsValue);
    //             this.showAssetsDialog = false;
    //         }
    //     }
    //     else {
    //         let itemGroupControl = <FormArray>this.assetItemsForm.controls['Assets'];
    //         itemGroupControl.controls.forEach(controlObj => {
    //             Object.keys(controlObj["controls"]).forEach((key: string) => {
    //                 let itemGroupControl = controlObj.get(key);
    //                 if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
    //                     itemGroupControl.markAsTouched();
    //                 }
    //             });
    //         });
    //     }

    // }
    // showItemsList() {
    //     this.showAssetsDialog = true;
    //     let itemGroupControl = <FormArray>this.assetItemsForm.controls['Assets'];
    //     itemGroupControl.controls = [];
    //     itemGroupControl.controls.length = 0;
    //     this.assetItemsForm.reset();
    //     if (this.hideText == true && this.selectedGRNDetails.GoodsReceivedNoteId > 0)//if it is in display mode and
    //     {
    //         let assetsDetails: Asset[] = this.selectedGRNDetails.Assets;
    //         let counter = 0;
    //         for(let i=0;i<this.selectedGRNDetails.ItemsList.length;i++)
    //         {
    //             let grnQty:number  = this.selectedGRNDetails.ItemsList[i].GRNQty;
    //             let item:any  = this.selectedGRNDetails.ItemsList[i].Item;
    //             for(let j = 0;j<grnQty;j++)
    //             {
    //                 itemGroupControl.push(this.initAssetGridRows());                  
    //                 if(assetsDetails==null||assetsDetails.length==0||assetsDetails[counter]==undefined){

    //                     itemGroupControl.controls[counter].patchValue({ Asset:{
    //                         AssetId:item.ItemMasterId,
    //                         AssetName:item.ItemName                           
    //                     }});

    //                 }
    //                 else {
    //                     assetsDetails[counter].PurchasedDate = new Date(assetsDetails[counter].PurchasedDate);
    //                     itemGroupControl.controls[counter].patchValue(assetsDetails[counter]);
    //                 }
    //                 counter++;
    //             }
    //         }
    //     }
    //     else {
    //         let itemListControl = <FormArray>this.goodsReceivedNotesForm.controls['ItemsList'];
    //         let assetsDetails: Asset[] = this.goodsReceivedNotesForm.controls['Assets'].value;
    //         let counter = 0;
    //         for (let i = 0; i < itemListControl.controls.length; i++) {
    //             let grnQty: number = itemListControl.controls[i].get('GRNQty').value;
    //             let item: any = itemListControl.controls[i].get('Item').value;
    //             for (let j = 0; j < grnQty; j++) {
    //                 itemGroupControl.push(this.initAssetGridRows());
    //                 if (assetsDetails == null || assetsDetails.length == 0 || assetsDetails[counter] == undefined) {

    //                     itemGroupControl.controls[counter].patchValue({
    //                         Asset: {
    //                             AssetId: item.ItemMasterId,
    //                             AssetName: item.ItemName
    //                         }
    //                     });
    //                 }
    //                 else {
    //                     assetsDetails[counter].PurchasedDate = new Date(assetsDetails[counter].PurchasedDate);
    //                     itemGroupControl.controls[counter].patchValue(assetsDetails[counter]);
    //                 }
    //                 counter++;
    //             }
    //         }
    //     }
    // }

    onFileUploadChange(event: any) {
        let files: FileList = event.target.files;
        for (let i = 0; i < files.length; i++) {
            let fileItem = files.item(i);
            if (ValidateFileType(fileItem.name)) {
                this.uploadedFiles.push(fileItem);
            }
            else {
                event.preventDefault();
                break;
            }
        }
    }

    onFileClose(fileIndex: number) {
        this.uploadedFiles = this.uploadedFiles.filter((file, index) => index != fileIndex);
    }

    attachmentDelete(attachmentIndex: number) {

        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header: Messages.DeletePopupHeader,
            acceptLabel: "Yes",
            rejectLabel: "No",
            rejectVisible: true,
            accept: () => {
                let attachmentRecord = this.selectedGRNDetails.DOAttachments[attachmentIndex];
                attachmentRecord.IsDelete = true;
                this.selectedGRNDetails.DOAttachments = this.selectedGRNDetails.DOAttachments.filter((obj, index) => index > -1);
            },
            reject: () => {
            }
        });

    }

    validateForm(statusId: number) {
        this.showGridErrorMessage = false;
        let itemGroupControl = <FormArray>this.goodsReceivedNotesForm.controls['ItemsList'];
        if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
            this.showGridErrorMessage = true;
        }
        let goodsReceivedNotesFormStatus = this.goodsReceivedNotesForm.status;
        if (goodsReceivedNotesFormStatus != "INVALID" && this.showGridErrorMessage == false) {
            if (statusId == WorkFlowStatus.Completed && this.uploadedFiles.length == 0 && (this.selectedGRNDetails.DOAttachments == undefined || this.selectedGRNDetails.DOAttachments.filter(i => i.IsDelete != true).length == 0)) {
                this.confirmationServiceObj.confirm({
                    message: "Please Attach Original Scanned DO",
                    header: Messages.DeletePopupHeader,
                    accept: () => {
                    },
                    rejectVisible: false,
                    acceptLabel: "Ok"
                });
                return false;
            }
            return true;
        }
        else {
            Object.keys(this.goodsReceivedNotesForm.controls).forEach((key: string) => {
                if (this.goodsReceivedNotesForm.controls[key].status == "INVALID" && this.goodsReceivedNotesForm.controls[key].touched == false) {
                    this.goodsReceivedNotesForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.goodsReceivedNotesForm.controls['ItemsList'];
            itemGroupControl.controls.forEach(controlObj => {
                Object.keys(controlObj["controls"]).forEach((key: string) => {
                    let itemGroupControl = controlObj.get(key);
                    if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
                        itemGroupControl.markAsTouched();
                    }
                });
            });
            return false;
        }
    }

    displayVoidPopUp() {
        this.deliveryCreationObj.checkvoidGRN(this.selectedGRNDetails.GoodsReceivedNoteId)
            .subscribe((count: number) => {
                if (count == 0) {
                    this.showVoidPopUp = true;
                    this.voidPopUpTabId = 1;
                    this.grnVoidForm.patchValue({
                        Reasons: " "
                    });
                }
                else {
                    this.confirmationServiceObj.confirm({
                        message: "GRN is already associated with Invoice",
                        header: Messages.PopupHeader,
                        accept: () => {
                        },
                        rejectVisible: false,
                        acceptLabel: "Ok"
                    });
                }
            });
    }

    voidRecord() {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let reasonData = this.grnVoidForm.value;
        if (this.grnVoidForm.status != "INVALID") {
            if (this.grnVoidForm.get('Reasons').value.trim() == "" || this.grnVoidForm.get('Reasons').value.trim() == null) {
                this.grnVoidForm.get('Reasons').setErrors({
                    'required': true
                });
                return;
            }
            let displayInput: GRNVoid = {
                UserId: userDetails.UserID,
                Reasons: reasonData.Reasons,
                GoodsReceivedNoteId: this.selectedGRNDetails.GoodsReceivedNoteId,
                ItemsList: this.selectedGRNDetails.ItemsList,
                POTypeId: this.selectedGRNDetails.POTypeId,
                PurchaseOrderId: this.selectedGRNDetails.PurchaseOrderId,
                GRNCode: this.selectedGRNDetails.GRNCode,
                StatusId: this.selectedGRNDetails.WorkFlowStatusId

            };
            // this.deliveryCreationObj.voidGRN(this.selectedGRNDetails.GoodsReceivedNoteId,
            //                                         userDetails.UserID,
            //                                         reasonData.Reasons,this.selectedGRNDetails.ItemsList)

            this.deliveryCreationObj.voidGRN(displayInput)
                .subscribe((count: number) => {
                    //    if(count==0)
                    //    {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.GRNVoidRecord,
                        MessageType: MessageTypes.Success
                    });
                    this.showVoidPopUp = false;
                    this.onRecordSelection(this.selectedGRNDetails.GoodsReceivedNoteId,
                        this.selectedGRNDetails.PurchaseOrderId, this.selectedGRNDetails.POTypeId);
                    this.getGoodsReceivedNotes(0);
                    // this.goodsReceivedNotesList.emit(this.selectedGRNDetails.GoodsReceivedNoteId);
                    //   }
                    //   else
                    //   {
                    //     this.voidPopUpTabId = 3;
                    //   }
                }, (data: HttpErrorResponse) => {

                });



        }
        else {
            this.grnVoidForm.controls["Reasons"].markAsTouched();
        }
    }


    openDialog() {
        this.initDone = true;
        if (this.grnRef != undefined) {
            this.grnRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.grnRef.nativeElement, 'focus');
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    resetFilters() {
        this.SupplierNameValidate = "";
        this.grnFilterInfoForm.get('GRNCode').setValue("");
        this.grnFilterInfoForm.get('DoNumber').setValue("");
        this.grnFilterInfoForm.get('PoNumber').setValue("");
        this.grnFilterInfoForm.get('Status').setValue(0);
        this.grnFilterInfoForm.get('SupplierName').setValue(null);
        this.grnFilterInfoForm.get('FromDate').setValue(null);
        this.grnFilterInfoForm.get('ToDate').setValue(null);
        this.grnFilterInfoForm.get('PoTypeId').setValue(0);
        this.grnFilterInfoForm.get('Department').setValue(0);
        this.grnFilterInfoForm.get('SupplierCode').setValue('');
        this.filterMessage = "";
        this.goodsReceviedNotesSearchKey = "";
        this.filteredgrn = this.goodsReceivedNotesList;

        this.FromDateStr="";
        this.ToDateStr="";
        //if (this.filteredgrn.length > 0) {
        this.getGoodsReceivedNotes(0);
        //}

        this.isFilterApplied = false;
        if (this.grnRef != undefined) {
            this.grnRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.grnRef.nativeElement, 'focus');
        }
        this.resetPagerConfig();
    }
    resetPagerConfig() {
        this.goodsReceivedNotesPagerConfig.RecordsToSkip = 0;
        this.goodsReceivedNotesPagerConfig.RecordsToFetch = 25;
        this.currentPage = 1;
    }

    openSettingsMenu() {
        this.initSettingsDone = true;
    }
    suppliernamechange(event) {
        this.SupplierNameValidate = event.target.value;
    }
    SetDates() {
        let poFilterData: PurchaseOrderFilterModel = this.grnFilterInfoForm.value;
        this.DateFromJsonString = JSON.stringify(poFilterData.FromDate);
        let fromDate = null; let toDate = null;

        if (this.grnFilterInfoForm.get('FromDate').value != null) {
            fromDate = this.reqDateFormatPipe.transform(this.grnFilterInfoForm.get('FromDate').value);
        }

        if (this.grnFilterInfoForm.get('ToDate').value != null) {
            toDate = this.reqDateFormatPipe.transform(this.grnFilterInfoForm.get('ToDate').value);
        }

        debugger;
        if(poFilterData.FromDate !=null)
        {
            if(poFilterData.FromDate.toString().length>10)
            {
                let a= moment(poFilterData.FromDate).format('YYYY-MM-DD').toString();
                //let b = JSON.parse(a);
                let c= JSON.stringify(a);
                let d= c as any;
                let e=JSON.parse(c);
                let f = e as DateObj;

                this.FromDateStr=a.toString();
            }
            else
            {
                //*************************************************************************************************************/
                //From Date Str
                //*************************************************************************************************************/

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
            }
        }
        debugger;
        if(poFilterData.ToDate !=null)
        {
            if(poFilterData.ToDate.toString().length>10)
            {
                let a= moment(poFilterData.ToDate).format('YYYY-MM-DD').toString();
                //let b = JSON.parse(a);
                let c= JSON.stringify(a);
                let d= c as any;
                let e=JSON.parse(c);
                let f = e as DateObj;

                this.ToDateStr=a.toString();
            }
            else
            {
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
            }
        }

       //*************************************************************************************************************/

    }
    filterData() {
        let grnCode = ""; let poNumber = "";
        let donumber = ""; let poTypeId = "";
        let status = ""; let supplier = "";
        let fromDate = null; let toDate = null;
        let Department = ''; let SupplierCode = "";
        this.filterMessage = "";
        if (this.grnFilterInfoForm.get('GRNCode').value != "") {
            grnCode = this.grnFilterInfoForm.get('GRNCode').value;
        }

        if (this.grnFilterInfoForm.get('DoNumber').value != "") {
            donumber = this.grnFilterInfoForm.get('DoNumber').value;
        }

        if (this.grnFilterInfoForm.get('PoNumber').value != "") {
            poNumber = this.grnFilterInfoForm.get('PoNumber').value;
        }

        if (this.grnFilterInfoForm.get('Status').value != "") {
            status = this.grnFilterInfoForm.get('Status').value;
        }

        debugger;
        if (this.grnFilterInfoForm.get('FromDate').value != null) {
            fromDate = this.reqDateFormatPipe.transform(this.grnFilterInfoForm.get('FromDate').value);
        }

        if (this.grnFilterInfoForm.get('ToDate').value != null) {
            toDate = this.reqDateFormatPipe.transform(this.grnFilterInfoForm.get('ToDate').value);
        }

        if (this.grnFilterInfoForm.get('SupplierName').value != null) {
            supplier = this.grnFilterInfoForm.get('SupplierName').value.SupplierName;
        }
        if (this.grnFilterInfoForm.get('PoTypeId').value != "") {
            poTypeId = this.grnFilterInfoForm.get('PoTypeId').value;
        }
        if (this.grnFilterInfoForm.get('Department').value != "") {
            Department = this.grnFilterInfoForm.get('Department').value;
        }
        if (this.grnFilterInfoForm.get('SupplierCode').value != "") {
            SupplierCode = this.grnFilterInfoForm.get('SupplierCode').value;
        }
        if (Department == null) {
            Department = '';
        }
        if (SupplierCode == null) {
            SupplierCode = '';
        }

        if(!this.IsExportClick)
        {
            if (grnCode === '' && donumber === '' && poNumber === '' && status === '' && (fromDate == null && toDate == null) && (supplier === null || supplier == '') && poTypeId === "" && (Department === null || Department === '') && (SupplierCode === null || SupplierCode === '')) {
                if (open) {
                    if ((this.grnFilterInfoForm.get('SupplierName').value == null || this.grnFilterInfoForm.get('SupplierName').value == "") && this.SupplierNameValidate != "") {
                        this.hideText = true;
                        this.filterMessage = "No matching records are found";
                        this.initDone = true;
                    }
                    else {
                        this.filterMessage = "Please select any filter criteria";
                    }
                    this.resetPagerConfig();
                }
                return;
            }
            else if (fromDate != null && toDate == null) {
                if (open) {
                    this.filterMessage = "Please select To Date";
                }
                return;
            }
            else if (fromDate == null && toDate != null) {
                if (open) {
                    this.filterMessage = "Please select From Date";
                }
                return;
            }
            else if ((fromDate != null && toDate != null && fromDate > toDate)) {
                if (open) {
                    this.filterMessage = "From Date Should be less than To Date";
                }
                return;
            }
        }
        debugger;
        this.SetDates();
        if(this.IsExportClick)
        {
            this.goodsReceivedNotesPagerConfig.RecordsToFetch=this.TotalRecords;
        }
        let grnFilterDisplayInput: GRNFilterDisplayInput = {
            Skip: this.goodsReceivedNotesPagerConfig.RecordsToSkip,
            Take: this.goodsReceivedNotesPagerConfig.RecordsToFetch,
            GRNCodeFilter: grnCode,
            DoNumberFilter: donumber,
            PoNumberFilter: poNumber,
            StatusFilter: status,
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID,
            // FromDateFilter: fromDate == null ? null : this.reqDateFormatPipe.transform(fromDate),
            // ToDateFilter: toDate == null ? null : this.reqDateFormatPipe.transform(toDate),
            FromDateFilter: this.FromDateStr,
            ToDateFilter: this.ToDateStr,
            SupplierNameFilter: supplier,
            PoTypeIdFilter: poTypeId,
            DepartmentFilter: Department,
            SupplierCodeFilter: SupplierCode
        };

        this.deliveryCreationObj.getFilterGRN(grnFilterDisplayInput)
            
            .subscribe((data: GoodsReceivedNotesDisplayResult) => {
                debugger;
                this.IsExportClick=false;
                if (open) {
                    this.initDone = false;
                }
                if (data.TotalRecords > 0) {
                    this.isFilterApplied = true;
                    if (open) {
                        this.initDone = false;
                    }
                    this.goodsReceivedNotesPagerConfig.TotalRecords = data.TotalRecords;
                    this.TotalRecords=data.TotalRecords;
                    // console.log(this.goodsReceivedNotesPagerConfig.TotalRecords);
                    // console.log(data.GoodsReceivedNotes);
                    this.goodsReceivedNotesList = data.GoodsReceivedNotes;
                    this.FiltergoodsReceivedNotesList=data.GoodsReceivedNotes;
                    this.IsFilterDataArrive=true;
                    // this.onRecordSelection(this.goodsReceivedNotesList[0].GoodsReceivedNoteId, 
                    //     this.goodsReceivedNotesList[0].PurchaseOrderId
                    //     , this.goodsReceivedNotesList[0].POTypeId);
                }
                else {
                    this.filterMessage = "No matching records are found";
                    this.IsFilterDataArrive=false;
                    this.TotalRecords=0;
                    this.goodsReceivedNotesList = data.GoodsReceivedNotes;
                    //this.goodsReceivedNotesList=null;
                    // this.addRecord();
                }
            }, (error) => {

                this.hideText = false;
                this.hideInput = true;
            });


    }

    displayLogPopUp() {
        this.showLogPopUp = true;
    }
    hideLogPopUp(hidePopUp: boolean) {
        this.showLogPopUp = false;
    }
    //*********************************************************************************************************************/
    //Export Code Starts Here
    //*********************************************************************************************************************/
   
    ExportToExcel() {
        //alert("Export To CSV");
        debugger;
        this.IsExportClick=true;
        this.filterData();
        this.interval = setTimeout(() => {
            //alert("Alert activated")
            debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                if (this.FiltergoodsReceivedNotesList.length > 0) {
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
                    this.FiltergoodsReceivedNotesList.forEach(polist => {
                        udt.data.push({
                            A: polist.DraftCode,
                            B: polist.SupplierDoNumber,
                            C: polist.CreatedDate,
                            D: polist.CreatedDate
                        });
                    });
                    edata.push(udt);

                    this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                    this.FileNo=Math.ceil(Math.random() * 10);
                    this.FileName="PurchaseOrderLists_" + this.CurrentDate+"_"+this.FileNo.toString();

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
        this.IsExportClick=true;
        this.filterData();
        this.interval = setTimeout(() => {
            //alert("Alert activated")
            debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                if (this.FiltergoodsReceivedNotesList.length > 0) {
                    //alert("Total Records CSV : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                    const options = {
                        fieldSeparator: ',',
                        quoteStrings: '"',
                        decimalSeparator: '.',
                        showLabels: true,
                        showTitle: true,
                        title: 'Good Received Notes',
                        useTextFile: false,
                        useBom: true,
                        headers: ['DraftCode', 'SupplierName', 'CreatedDate', 'WorkFlowStatusText']
                    };
                    const csvExporter = new ExportToCsv(options);
                    csvExporter.generateCsv(this.FiltergoodsReceivedNotesList);
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
        this.FiltergoodsReceivedNotesList.forEach(user => {
            udt.data.push({
                A: user.DraftCode,
                B: user.SupplierDoNumber,
                C: user.DraftCode
            });
        });
        edata.push(udt);

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
        this.IsExportClick=true;
        //Get Filter Data
        this.filterData();

        this.interval = setTimeout(() => {
            //alert("Alert activated")
            debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                if (this.FiltergoodsReceivedNotesList.length > 0) {
                    //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

                    this.exportColumns = this.goodsReceivedNotesListCols.map((col) => ({
                        title: col.header,
                        dataKey: col.field,
                    }));

                    //Remove Action Column
                    this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                    const doc = new jsPDF('p', 'pt');
                    doc['autoTable'](this.SelexportColumns, this.FiltergoodsReceivedNotesList);
                    // doc.autoTable(this.exportColumns, this.products);

                    this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                    this.FileNo=Math.ceil(Math.random() * 10);
                    this.FileName="PurchaseOrdersList_" + this.CurrentDate+"_"+this.FileNo.toString();

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

