import { Component, OnInit, ViewChild, Renderer, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { CostOfService, InvoiceList, InvoiceDisplayResult, InvoiceDetails, InvoiceTypes, InvoiceCount, InvoiceVoid, InvoiceSubTotal, SINVFilterDisplayInput } from "../../models/supplier-invoice.model";
import { SupplierInvoiceService } from "../../services/supplier-invoice.service";
import { SharedService } from "../../../shared/services/shared.service";
import { PagerConfig, Suppliers, MessageTypes, Taxes, ResponseStatusTypes, UserDetails, WorkFlowStatus, PurchaseOrderType, WorkFlowProcess, WorkFlowApproval, ITEM_TYPE, ItemMaster, ItemGLCode, ITEM_TYPEWPO } from "../../../shared/models/shared.model";
import { Observable, of, Subject } from 'rxjs';
import { GridOperations, Messages, Currency, PaymentTerms } from "../../../shared/models/shared.model";
import { ValidateFileType, FullScreen, PrintScreen, restrictMinus, HideFullScreen } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { Supplier } from '../../models/supplier';
import { GoodsReceivedNotes } from '../../models/goods-received-notes.model';
import { PurchaseOrderDetails, PurchaseOrderList, PurchaseOrderDisplayResult } from '../../models/po-creation.model';
import { PaymentTerm } from '../../models/payment-terms.model';
import { FixedAssetDetails } from '../../models/fixed-asset-purchase-order.model';
import { ContractPurchaseOrder } from '../../models/contract-purchase-order.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { DEFAULT_CURRENCY_ID } from '../../../shared/constants/generic';
import { ExpensePurchaseOrder } from '../../models/expense-purchase-order.model';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { WorkBook, utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { forEach } from '@angular/router/src/utils/collection';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { PoApprovalUpdateStatus } from '../../models/po-approval.model';
import { POCreationService } from '../../services/po-creation.service';
import { NUMBER_PATERN } from '../../../shared/constants/generic';
import { Company } from '../../../administration/models/company';
import { AccountCodeMaster } from '../../models/account-code.model';
import { TaxService } from '../../services/tax.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { PurchaseOrderTypes } from '../../models/po-creation.model';
import { ViewChildren, QueryList } from '@angular/core';
import { MultiSelect } from 'primeng/multiselect';
import { ElementSchemaRegistry } from '../../../../../node_modules/@angular/compiler';
import * as XLSX from 'xlsx';
import { AccountCodeAPIService } from '../../services/account-code-api.service';
import { AccountType, AccountCode } from '../../models/account-code.model';
import { Payment } from '../../models/Payment.model';
import { PaymentService } from '../../services/payment.service';
import { Roles } from '../../../administration/models/role';
import { SchedulerNoService } from '../../services/scheduler-no.service';
import { SchedulerNo } from '../../models/scheduler-no.model';
import { CreditNote } from '../../models/credit-note.model';

import * as moment from 'moment';
import { DatePipe } from '@angular/common';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { ExportToCsv } from 'export-to-csv';
import { ExportService } from '../../services/export.service';
import { ExcelJson } from '../interfaces/excel-json.interface';

@Component({
    selector: 'app-supplier-invoice-list',
    templateUrl: './supplier-invoice-list.component.html',
    styleUrls: ['./supplier-invoice-list.component.css'],
    providers: [SupplierInvoiceService, POCreationService, TaxService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class SupplierInvoiceListComponent implements OnInit, OnChanges {
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
    InvoiceForm: FormGroup;
    FromDateStr: string;
    ToDateStr: string;
    TotalRecords:number=0;

    jsonString: string = '[{"year":2023,"month":3,"day":1}]';
    jsonObj: Array<object>;
    jsonObj2: Array<object> = [{ title: 'test' }, { title: 'test2' }];

    DateToJsonString: string;
    DateFromJsonString: string;
    showdilogbox:boolean=true;
    FromDateDayStr: string;
    ToDateDayStr: string;
    //*****************************************************************************************************************/

    FromDateMonthStr:string;
    
    ToDateMonthStr:string;


    userDetails: UserDetails = null;
    @Input() SelectedInvoiceId: number = 0;
    @Input() hideLeftPanel: boolean = false;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild("InvoiceCode") nameInput: ElementRef;
    @ViewChild("selectedSupplierName") selectedSupplierNameInput: ElementRef;
    @ViewChild('sinvCode') private supplierInvoiceRef: any;
    @ViewChild('AccountType')
    optionIst: ElementRef;
    @ViewChild('SubCategory')
    optionSec: ElementRef;
    changingValue: Subject<number> = new Subject();

    showInvoiceTypeDialog: boolean = false;
    showGlCodeDialog: boolean = false;
    invoicesList: Array<InvoiceList> = [];
    invoicesListCols: any[];
    invoicePagerConfig: PagerConfig;
    InvoiceItemsGridConfig: PagerConfig;
    selectedInvoiceDetails: InvoiceDetails;
    FileName:string="";
    InvoiceTypes: Array<InvoiceTypes> = [];
    //goodsReceivedNotesList:Array<{ label:string,value:GoodsReceivedNotes,disabled:boolean }> =[];   
    goodsReceivedNotesList: Array<{ label: string, value: any, disabled: boolean }> = [];
    poList: Array<{ label: string, value: any, disabled: boolean }> = [];
    suppliers: Suppliers[] = [];
    currencies: Currency[] = [];
    departments: Location[] = [];
    //this array will hold the list of columns to display in the grid..
    gridColumns: Array<{ field: string, header: string, width: string }> = [];
    grnGridColumns: Array<{ field: string, header: string }> = [];
    cpoGridColumns: Array<{ field: string, header: string }> = [];
    //this variable will hold the record in edit mode...
    recordInEditMode: number;
    supplierInvoiceSearchKey: string;
    errorMessage: string = Messages.NoRecordsToDisplay;
    //this will tell whether we are using add/edit/delete mode the grid..
    operation: string;
    costOfServiceType: CostOfService[] = [];
    hideText?: boolean = null;
    hideInput?: boolean = null;
    uploadedFiles: Array<File> = [];
    leftSection: boolean = false;
    rightSection: boolean = false;
    slideActive: boolean = false;
    showGridErrorMessage: boolean = false;
    scrollbarOptions: any;
    InvoiceSearchKey: string;
    apiEndPoint: string;
    linesToAdd: number = 2;
    deletedInvoiceItems: Array<number> = [];
    Invoices: Array<InvoiceList> = [];
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    selectedInvoiceTypeId: number = 0;
    paymentTerms: Array<PaymentTerm> = [];
    purchaseOrderDetails: any;
    taxTypes: Array<Taxes> = [];
    defaultDeliveryAddress: string = "";
    isFilterApplied: boolean = false;
    initDone = false;
    enableOnVerify: boolean = false;
    filteredSupplierInvoice = [];
    sinvFilterInfoForm: FormGroup;
    GlcodeInfoForm: FormGroup;
    invoiceVoidForm: FormGroup;
    filterMessage: string = "";
    filteredSupplierPayment = [];
    initSettingsDone = true;
    companyId: number;
    showdropdown: boolean = false;
    disableDelete: boolean;
    SelectedPOs: Array<PurchaseOrderList> = [];
    selectedGrns: Array<GoodsReceivedNotes> = [];
    SelectedCPOs: Array<ContractPurchaseOrder> = [];
    workFlowStatus: any;
    showVoidPopUp: boolean = false;
    voidPopUpTabId: number = 1;
    purchaseOrderTypeId: number = 0;
    title: string;
    isNewRecord: boolean = false;
    isPORecord: boolean = false;
    isCPORecord: boolean = false;
    invoiceItemDetails = [];
    isEdit: boolean;
    canVoid: boolean = false;
    isSubmit: boolean = false;
    ExcelExportFileName: string;
    requestType: string = "";
    moduleHeading: string = "";
    requestSearchKey: string = "";
    isApprovalPage: boolean = false;
    isVoid: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    showRightPanelLoadingIcon: boolean = false;
    pmoduleHeading: string = "";
    pmoduleMessage: string = "";
    sumSubtotal: number = 0;
    subTotal: number = 0;
    POSubtotal: number = 0;
    totalbeforgstamount: string;
    IsGstBeforeDiscount: boolean = false;
    company: Company;
    rows: number = 2;
    itemTYpes = ITEM_TYPEWPO;
    deliveryAddress = "";
    selectedRowId: number = -1;
    taxGroups = [];
    TaxGroupId: number;
    poTypeId: number;
    poId: string;
    purchaseOrderCode: string;
    purchaseOrderTypes: Array<PurchaseOrderTypes> = [];
    purchaseOrderTypesList: Array<PurchaseOrderTypes> = [];
    currentPage: number = 1;
    newPermission: boolean;
    editPermission: boolean;
    approvePermission: boolean;
    voidPermission: boolean;
    verifyPermission: boolean;
    printPermission: boolean;
    cancelDraftPermission: boolean = false;
    dropdownList = [];
    

    interval
    IsFilterDataArrive: boolean = false;
    FilterInvoicesList: Array<InvoiceList> = [];
    exportColumns;
    SelexportColumns;

    dropdownSettings = {};
    facilitydropdownList = [];
    facilitydropdownSettings = {};
    checkgoodsReceivedNotes: Array<GoodsReceivedNotes> = [];
    PurchaseOrderTypeIds: number;
    accrualgridColumns: Array<{ field: string, header: string }> = [];
    accrualAccountCode: Array<{ Name: string, AccountCodeName: string, Amount: string, Color: string }> = [];
    isCompanyChanged: boolean = false;
    itemTypeGlCode: string = "";
    serialNumber: number;
    Itemdescription: string;
    potypeidGl: number;
    TypeidGl: number;
    invoiceIdGl: number;
    InvoiceItemIdGl: number;
    InvoiceTypeIdgl: number;
    AccountCodeNameGl: string;
    AccountTypeid: number;
    AccountCodeCategoryId: number;
    errmesagevisible: boolean = false;
    TaxID: number;
    supplierSubCodes = [];
    isSupplierSelected: boolean = false;
    exportPermission: boolean;
    isSameUSer: boolean = false;
    viewLogPermission: boolean = false;
    showLogPopUp: boolean = false;
    InvoiceCode: string = '';
    accountTypes = [];
    accountCodeCategories = [];
    defaultAccountType: number = 0;
    @ViewChildren('cmp') components: QueryList<MultiSelect>;
    @ViewChildren('CPOPMS') CPOPMS: QueryList<MultiSelect>;
    OldTotalAmount: number = 0;
    public innerWidth: any;
    IsVerifier: boolean = false;
    CNColumns: Array<{ field: string, header: string }> = [];
    creditNotes: any = [];
    totalPaid: number = 0;
    totalOS: number = 0;
    isApproverUser: boolean = false;
    showfilters: boolean = true;
    showfilterstext: string = "Hide List";
    public screenWidth: any;
    schedulerNoDetails: SchedulerNo[] = [];
    constructor(private invoiceReqObj: SupplierInvoiceService,
        private datePipe: DatePipe,
        private exportService: ExportService,
        private formBuilderObj: FormBuilder,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        public sessionService: SessionStorageService, private pocreationObj: POCreationService,
        private renderer: Renderer, public activatedRoute: ActivatedRoute,
        private reqDateFormatPipe: RequestDateFormatPipe,
        private accountCodeAPIService: AccountCodeAPIService,
        private taxService: TaxService,
        private router: Router,
        private SchedulerMasterServiceObj: SchedulerNoService) {
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();
        this.pocreationObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                console.log(data);
                this.purchaseOrderTypes = data.filter(data => data.PurchaseOrderTypeId != PurchaseOrderType.ProjectPo);
            });
        //   this.gridColumns = [
        //     { field: 'Sno', header: 'S.no.' },
        //     { field: 'ItemType', header: 'Item Type' },
        //     // { field: 'CPONumber', header: 'POC Id' },
        //     { field: 'ItemDescription', header: 'Description' },
        //     { field: 'ItemQty', header: 'Qty' },
        //     { field: 'Unitprice', header: 'Price' },
        //     { field: 'Discount', header: 'Discount' },
        //     { field: 'GstType', header: 'Gst Type' },
        //     { field: 'GstAmount', header: 'Gst Amount' },
        //     { field: 'ItemTotal', header: 'Total' }        

        //   ];  
        this.CNColumns = [
            { field: 'DocumentCode', header: 'Credit Note ID' },
            { field: 'SupplierCreditNoteNo', header: 'Supplier’s CN No.' },
            { field: 'CreatedDate', header: 'Created Date' },
            { field: 'CreditNoteTotal', header: 'Amount' },
            { field: 'WorkFlowStatus', header: 'Status' }
        ];
        this.apiEndPoint = environment.apiEndpoint;


        this.GlcodeInfoForm = this.formBuilderObj.group({
            Item: [''],
            AccountCodeCategoryId: [''],
            AccountTypeId: ["", { validators: [Validators.required] }]

        });
        this.invoiceVoidForm = this.formBuilderObj.group({
            Reasons: [""]
        });
        this.workFlowStatus = WorkFlowStatus;
        this.title = "Goods Received Notes";
    }

    ngOnChanges(change: SimpleChanges) {

        if (this.SelectedInvoiceId > 0) {
            this.onRecordSelection(this.SelectedInvoiceId, 0);
        }
    }


    onResetAll(event) {
        this.components['_results'].forEach(ds => {
            ds.value = null;
            ds.updateLabel();
        });
    }

    initializeFilterForm(): void {
        this.sinvFilterInfoForm = this.formBuilderObj.group({
            SInvCode: [''],
            SupplierCategory: [''],
            Status: [0],
            FromDate: [new Date()],
            ToDate: [new Date()],
            PoTypeId: [0],
            PoNumber: ['']
        });

    }
    ngOnInit() {
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

        debugger;
        this.sinvFilterInfoForm.controls.FromDate.setValue({
            year: FirstDateYear,
            month: FirstDateMonth,
            day: FirstDateDay
        });

        this.sinvFilterInfoForm.controls.ToDate.setValue({
            year: CurrentDateYear,
            month: CurrentDateMonth,
            day: CurrentDateDay
        });

        this.sinvFilterInfoForm.controls.FromDate.setValue(FDate);
        this.sinvFilterInfoForm.controls.ToDate.setValue(TDate);

        //this.sinvFilterInfoForm.controls.SupplierCategory.setValue('Test');
        //**********************************************************************************************************************

        this.moduleHeading = "Supplier Invoice List";
        //this.requestType = this.activatedRoute.snapshot.params.type;
        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            if (param.get('type') != undefined) {
                this.requestType = param.get('type');
            }
            // alert("Request Type : " + this.requestType);
        });

        this.invoicesListCols = [
            { field: 'DraftCode', header: 'Draft Code', width: '100px' },
            { field: 'SupplierName', header: 'Supplier', width: '200px' },
            { field: 'WorkFlowStatusText', header: 'Status', width: '150px' },
            { field: '', header: 'Action', width: '100px' },
        ];

        let invoiceId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        //getting role access levels  
        let roleAccessLevels = this.sessionService.getRolesAccess();

        if (roleAccessLevels != null && roleAccessLevels.length > 0) {

            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "supplierinvoice")[0];
            let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
            if (auditLogRole != null)
                this.viewLogPermission = auditLogRole.IsView;
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.approvePermission = formRole.IsApprove;
            this.voidPermission = formRole.IsVoid;
            this.verifyPermission = formRole.IsVerify;
            this.exportPermission = formRole.IsExport;
            this.printPermission = formRole.IsPrint;
            this.IsVerifier = formRole.IsVerify;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.approvePermission = true;
            this.voidPermission = true;
            this.verifyPermission = true;
            this.exportPermission = true;
            this.printPermission = true;
            this.IsVerifier = false;
        }
        this.sharedServiceObj.getUserRolesByCompany(this.userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
            if (roles != null) {
                this.cancelDraftPermission = roles.some(x => x.RoleName.toLowerCase() == 'admin');
            }
        });

        this.invoicePagerConfig = new PagerConfig();
        this.invoicePagerConfig.RecordsToSkip = 0;
        this.invoicePagerConfig.RecordsToFetch = 25;
        
        this.InvoiceItemsGridConfig = new PagerConfig();
        this.InvoiceItemsGridConfig.RecordsToSkip = 0;
        this.InvoiceItemsGridConfig.RecordsToFetch = 25;
        this.selectedInvoiceDetails = new InvoiceDetails();

        this.activatedRoute.paramMap.subscribe((data) => {
            let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
            if (Number(companyId) != 0)
                this.companyId = companyId;
        });
        this.getSchedulerDetails();
        this.getDepartments(this.companyId);
        this.sharedServiceObj.getCurrencies()
            .subscribe((data: Currency[]) => {
                this.currencies = data;
            });
        this.operation = GridOperations.Display;
        this.getTaxTypes();
        this.getPaymentTerms();
        this.getTaxGroups();
        //this.setColumns();
        this.getAccountTypes(this.companyId);

        this.activatedRoute.paramMap.subscribe((data) => {
            debugger;
            this.navigateToPage();
        });
        this.activatedRoute.queryParamMap.subscribe((data) => {
            if (this.activatedRoute.snapshot.queryParamMap.get('code') != null || Number(this.activatedRoute.snapshot.queryParamMap.get('id')) > 0) {
                this.navigateToPage();
            }
        });
        this.GlcodeInfoForm.reset();

        this.screenWidth = window.innerWidth - 180;
        this.showfilters = true;
        this.showfilterstext = "Hide List";

    }

    public noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
    }

    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched));
    }

    getSchedulerDetails() {
        this.SchedulerMasterServiceObj.GetSchedulerNo().subscribe((result) => {
            if (result != null) {
                this.schedulerNoDetails = result['SchedulerNos']
            }
        })
    }
    getDepartments(companyId: number) {
        this.sharedServiceObj.getUserDepartments(companyId, WorkFlowProcess.SupplierInvoice, this.userDetails.UserID)
            .subscribe((data: Location[]) => {
                this.departments = data;
            });
    }

    getCompanyDetails(companyId: number) {
        this.sharedServiceObj.getCompanyDetails(companyId)
            .subscribe((data: Company) => {
                this.company = data;
                if (this.company != null) {
                    if (this.company.Fax == null || this.company.Fax == 'null') {
                        this.company.Fax = "";
                    }
                    this.rows = 3;

                    this.deliveryAddress = this.company.Address1 + "," + "\n" +
                        this.company.Address2 + "," + "\n" +
                        this.company.Address3 + "\n" +
                        this.company.CountryName + ":" + " " + this.company.ZipCode + "\n" +
                        "Tel: " + this.company.Telephone + "\n" +
                        "Fax: " + this.company.Fax;
                }
                else {
                    this.rows = 2;
                }


            });
    }
    getTaxTypes() {
        this.sharedServiceObj.getTaxGroups(0)
            .subscribe((data: Taxes[]) => {
                this.taxTypes = data;
            });
    }

    getTaxGroups(): void {
        let taxGroupResult = <Observable<Array<any>>>this.sharedServiceObj.getTaxGroupList();
        taxGroupResult.subscribe((data) => {
            this.taxGroups = data;
        });
    }

    numberOnly(event): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;

    }

    onTypeSelection(accountType: any) {
        this.defaultAccountType = accountType;
        this.GetAccountCodesByAccountType(this.defaultAccountType, this.companyId, " ");
    }

    getAccountTypes(companyId: number): void {
        let accountTypesResult = <Observable<Array<AccountType>>>this.accountCodeAPIService.getAccountTypes(companyId);
        accountTypesResult.subscribe((data: any) => {

            if (data != null) {
                if (data.length > 0) {
                    this.accountTypes = data;
                    if (this.defaultAccountType == 0) {
                        this.defaultAccountType = this.accountTypes[0].AccountTypeId;
                    }
                    this.GlcodeInfoForm.reset();
                    this.GetAccountCodesByAccountType(this.defaultAccountType, companyId, "");

                }
                else {
                    this.accountTypes = [];
                    let accountCodesControl = <FormArray>this.GlcodeInfoForm.controls['AccountCodes'];
                    accountCodesControl.controls = [];
                    accountCodesControl.controls.length = 0;
                }
            }
            else {
                this.accountTypes = [];
                let accountCodesControl = <FormArray>this.GlcodeInfoForm.controls['AccountCodes'];
                accountCodesControl.controls = [];
                accountCodesControl.controls.length = 0;
            }
        });
    }

    GetAccountCodesByAccountType(accountType: number, companyId: number, searchKey: string): void {
        this.accountCodeCategories.length = 0;
        let accountCodesDisplayInput = {
            AccountTypeId: accountType,
            CompanyId: companyId,
            SearchKey: searchKey
        };
        let accountCodesResult = <Observable<Array<AccountCode>>>this.accountCodeAPIService.getAllSearchSubCategory(accountCodesDisplayInput);
        accountCodesResult.subscribe((data) => {
            let accountCodesControl = <FormArray>this.GlcodeInfoForm.controls['AccountCodeCategoryName'];

            if (data != null) {
                if (data.length > 0) {
                    this.accountCodeCategories = data;

                }

            }
        });
    }

    getAccountCodeCategories(companyId: number): void {
        let accountCodeCategoriesResult = <Observable<Array<any>>>this.accountCodeAPIService.getAccountCodeCategories(companyId);
        accountCodeCategoriesResult.subscribe((data) => {
            if (data != null) {
                this.accountCodeCategories = data;
            }
        });
    }

    OpenGlcodepopup(index: number, Itemname: string, ServiceName, item: string,
        masterid: string, potypeid: number, Typeid: number,
        invoiceId: number, InvoiceItemId: number, InvoiceTypeId: number
        , AccountCodeName: string, AccountType: number, Subcategpryid: number) {
        this.errmesagevisible = false;
        this.itemTypeGlCode = item;
        this.showGlCodeDialog = true;
        this.serialNumber = index;
        if (potypeid == 1 && Typeid == 1) {
            this.Itemdescription = Itemname;
        }
        else if (InvoiceTypeId == 2 && Typeid == 1) {

            this.Itemdescription = Itemname;
        }
        else {
            this.Itemdescription = ServiceName;
        }
        this.potypeidGl = potypeid;
        this.TypeidGl = Typeid;
        this.invoiceIdGl = invoiceId;
        this.InvoiceItemIdGl = InvoiceItemId;
        this.InvoiceTypeIdgl = InvoiceTypeId;
        this.AccountCodeNameGl = AccountCodeName;
        this.GlcodeInfoForm.reset();
    }
    SaveGlcode(action: string) {
        let Itemmaster = this.GlcodeInfoForm.get('Item').value;
        let accounttype = this.GlcodeInfoForm.get('AccountTypeId').value;
        let subcategory = this.GlcodeInfoForm.get('AccountCodeCategoryId').value;
        if ((Itemmaster != null || Itemmaster != undefined) || (accounttype != undefined || accounttype != null) || (subcategory != undefined || subcategory != null)) {
            let ItemMasterId = Itemmaster.ItemMasterId;
            this.errmesagevisible = false;
            let InvoiceGlCode = {
                PotypeId: this.potypeidGl,
                TypeId: this.TypeidGl,
                ItemMasterId: ItemMasterId,
                InvoiceId: this.invoiceIdGl,
                InvoiceItemId: this.InvoiceItemIdGl,
                InvoiceTypeId: this.InvoiceTypeIdgl,
                AccountType: this.AccountTypeid,
                AccountCodeCategoryId: this.AccountCodeCategoryId,
                CurrentUserId: this.userDetails.UserID

            }
            HideFullScreen(null);
            this.invoiceReqObj.SaveInvoiceGlCode(InvoiceGlCode)
                .subscribe((data: any) => {
                    if (data != null) {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.GlcodeInfoForm.reset();
                        this.showGlCodeDialog = false;
                        // if (this.selectedInvoiceTypeId == 2) {
                        //     this.onRecordSelection(this.invoiceIdGl, this.InvoiceTypeIdgl, 0);
                        // }
                        // else {
                        //     this.onRecordSelection(this.invoiceIdGl, this.InvoiceTypeIdgl, this.potypeidGl);
                        // }
                        this.potypeidGl = 0;
                        this.TypeidGl = 0;
                        this.invoiceIdGl = 0;
                        this.InvoiceItemIdGl = 0;
                        this.InvoiceTypeIdgl = 0;
                        this.errmesagevisible = false;
                    }
                });

        }
        else {
            this.errmesagevisible = true;
            this.GlcodeInfoForm.reset();
        }
    }

    navigateToPage() {
        debugger;
        this.requestType = this.activatedRoute.snapshot.params.type;
        this.requestSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');
        let invoiceId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        this.isFilterApplied = false;
        this.InvoiceSearchKey = "";
        if (this.activatedRoute.snapshot.params.type == "request") {//if it is "Supplier Invoice request 
            this.moduleHeading = "Supplier Invoice List";
            this.isApprovalPage = false;
            if (invoiceId > 0) {
                this.SearchInvoice(invoiceId);
            }
            else {
                this.getInvoices(0, 0);
            }
        }
        else if (this.activatedRoute.snapshot.params.type == "approval") {//if request is for "Supplier Invoice request approval"
            let roleAccessLevels = this.sessionService.getRolesAccess();

            if (roleAccessLevels != null && roleAccessLevels.length > 0) {

                let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "supplierinvoiceapproval")[0];
                let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
                if (auditLogRole != null)
                    this.viewLogPermission = auditLogRole.IsView;
                this.approvePermission = formRole.IsApprove;
            }
            else {
                this.approvePermission = true;
            }
            this.moduleHeading = "Supplier Invoice Approval";
            this.isApprovalPage = true;
            if (invoiceId > 0) {
                this.SearchInvoice(invoiceId);
            }
            else {
                this.getInvoicesForApprovals(0, invoiceId);
            }
        }
    }

    ;

    getAllPoDetails() {

        let poDisplayInput = {
            //Search:term,
            //SupplierId: this.poSupplierId,
            // SupplierId:this.InvoiceForm.get('Supplier').value==null?0:this.InvoiceForm.get('Supplier').value.SupplierId,
            companyId: this.companyId,
            UserId: this.userDetails.UserID,
            POTypeId: this.PurchaseOrderTypeIds,//this.InvoiceForm.get('PurchaseOrderTypeId').value,
            //IsPOC: this.InvoiceForm.get('IsPOC').value == "1" ? true : false,
            From: "SUPPLIERINVOICE",//this is used to avoid getting po whose status is void...
            WorkFlowStatusId: WorkFlowStatus.Approved//getting only those purchase orders which are approved..
        };
        this.sharedServiceObj.getAllSearchPurchaseOrders(poDisplayInput)
            .subscribe((data: Array<any>) => {

                this.poList = [];
                this.poList.length = 0;
                this.poList.push({
                    label: "",
                    value: null,
                    disabled: true
                });
                data.forEach(data => {
                    this.poList.push({
                        label: data.PurchaseOrderCode,
                        value: data,
                        disabled: false
                    });
                });
            });
    }



    click(selected: string) {
        setTimeout(function () {

            $(".goodsreceived").click(function () {
                // $(".goodsreceived  ul li:first-child").trigger('click');           
                $(".goodsreceived  ul li:contains(" + selected + ")").addClass("ui-state-highlight");
                $(".goodsreceived .ui-state-highlight .ui-chkbox-icon").addClass("pi pi-check");
                $(".goodsreceived .ui-state-highlight .ui-chkbox-box").addClass("ui-state-active");
            });

        }, 1000);


    }

    initGRNGridRows() {
        return this.formBuilderObj.group({
            'Checked': [false],
            'goodsReceivedNotes': [],
            'contractPOCList': []
        });
    }

    setStandardPurchaseOrderDetails(purchaseOrderDetails: PurchaseOrderDetails, poTypeId: number) {
        let description = "";
        let recordId = 0;
        let InvoiceItems = [];
        purchaseOrderDetails.PurchaseOrderItems.map(data => {
            recordId = data.PurchaseOrderItemId;
            if (data.TypeId === 1) {
                description = data.Item.ItemName;


            }
            if (data.TypeId === 2) {
                description = data.Service.Description;
                // recordId = data.Service.AccountCodeId;
            }
            InvoiceItems.push({
                //RecordId:data.PurchaseOrderItemId,
                //ItemTypeId: recordId,
                RecordId: recordId,
                InvoiceItemId: 0,
                //ItemDescription:data.Item.ItemName,
                ItemDescription: data.ItemDescription,
                GlDescription: description,
                ItemQty: 0,//data.ItemQty,
                Unitprice: data.Unitprice,
                Totalprice: data.Totalprice,
                TotalbefTax: data.TotalbefTax,
                IsModified: false,
                Discount: data.Discount,
                TaxGroupId: data.TaxGroupId,
                TaxID: data.TaxID,
                TaxName: data.TaxName,
                TaxAmount: data.TaxAmount,
                TaxTotal: data.TaxTotal,
                TypeId: data.TypeId,
                ItemType: data.ItemType,
                Service: data.Service,
                Item: data.Item,
                PurchaseOrderId: data.PurchaseOrderId,
                PurchaseOrderCode: data.PurchaseOrderCode

            });
        });

        let invoiceDetails = {
            InvoiceId: 0,
            InvoiceCode: "",
            SupplierTypeID: purchaseOrderDetails.Supplier.SupplierTypeID,
            PurchaseOrderId: purchaseOrderDetails.PurchaseOrderId,
            PurchaseOrderCode: purchaseOrderDetails.PurchaseOrderCode,
            POTypeId: poTypeId,
            LocationId: purchaseOrderDetails.LocationId,
            Supplier: purchaseOrderDetails.Supplier,
            CurrencyId: purchaseOrderDetails.CurrencyId,
            SupplierAddress: purchaseOrderDetails.Supplier.SupplierAddress,
            DeliveryAddress: this.deliveryAddress,
            ShippingFax: purchaseOrderDetails.Supplier.BillingFax,
            InvoiceItems: InvoiceItems,
            Discount: purchaseOrderDetails.Discount,
            TaxRate: purchaseOrderDetails.TaxRate,
            TotalTax: purchaseOrderDetails.TotalTax,
            OtherCharges: purchaseOrderDetails.OtherCharges,
            ShippingCharges: purchaseOrderDetails.ShippingCharges,
            SubTotal: purchaseOrderDetails.SubTotal,
            TotalAmount: purchaseOrderDetails.TotalAmount,
            PaymentTermId: purchaseOrderDetails.PaymentTermId,
            PaymentTerms: purchaseOrderDetails.PaymentTerms,
            Adjustment: 0,
            GSTAdjustment: 0,
            InvoiceDescription: "",
            IsPOC: "2",
            IsGstBeforeDiscount: purchaseOrderDetails.IsGstBeforeDiscount,
            InvoiceLimit: purchaseOrderDetails.InvoiceLimit,
            RemarksInvoice: ""

        };
        return invoiceDetails;
    }

    setAssetPurchaseOrderDetails(purchaseOrderDetails: FixedAssetDetails, poTypeId: number) {
        let description = "";
        let recordId = 0;
        let InvoiceItems = [];
        purchaseOrderDetails.PurchaseOrderItems.map(data => {
            recordId = data.FixedAssetPOItemId;
            if (data.TypeId === 1) {
                description = data.AssetSubCategory.AssetSubcategory;
                data.Service.AccountCodeId = data.AssetSubCategory.AssetSubcategoryId;
                data.Service.AccountCodeName = data.AssetSubCategory.AssetSubcategory;

            }
            if (data.TypeId === 2) {
                description = data.Service.Description;
            }

            InvoiceItems.push(
                {
                    RecordId: recordId,
                    InvoiceItemId: 0,
                    //ItemDescription:data.Asset.AssetName,
                    ItemDescription: data.AssetDescription,
                    GlDescription: description,
                    ItemQty: 0,//data.AssetQty,
                    Unitprice: data.Unitprice,
                    Totalprice: data.Totalprice,
                    TotalbefTax: data.TotalbefTax,
                    IsModified: false,
                    Discount: data.Discount,
                    TaxID: data.TaxID,
                    TaxGroupId: data.TaxGroupId,
                    TaxName: data.TaxName,
                    TaxAmount: data.TaxAmount,
                    TaxTotal: data.TaxTotal,
                    TypeId: data.TypeId,
                    ItemType: data.ItemType,
                    //item : data.AssetSubCategory
                    AsseAssetSubCategory: data.AssetSubCategory,
                    Service: data.Service,
                    PurchaseOrderId: data.PurchaseOrderId,
                    PurchaseOrderCode: data.PurchaseOrderCode
                });
        });
        let invoiceDetails = {
            InvoiceId: 0,
            InvoiceCode: "",
            SupplierTypeID: purchaseOrderDetails.Supplier.SupplierTypeID,
            POTypeId: poTypeId,
            PurchaseOrderId: purchaseOrderDetails.FixedAssetPurchaseOrderId,
            PurchaseOrderCode: purchaseOrderDetails.FixedAssetPurchaseOrderCode,
            LocationId: purchaseOrderDetails.LocationId,
            Supplier: purchaseOrderDetails.Supplier,
            CurrencyId: purchaseOrderDetails.CurrencyId,
            SupplierAddress: purchaseOrderDetails.Supplier.SupplierAddress,
            DeliveryAddress: this.deliveryAddress,
            ShippingFax: purchaseOrderDetails.Supplier.BillingFax,
            InvoiceItems: InvoiceItems,
            Discount: purchaseOrderDetails.Discount,
            TaxRate: purchaseOrderDetails.TaxRate,
            TotalTax: purchaseOrderDetails.TotalTax,
            OtherCharges: purchaseOrderDetails.OtherCharges,
            ShippingCharges: purchaseOrderDetails.ShippingCharges,
            SubTotal: purchaseOrderDetails.SubTotal,
            TotalAmount: purchaseOrderDetails.TotalAmount,
            PaymentTermId: purchaseOrderDetails.PaymentTermId,
            PaymentTerms: purchaseOrderDetails.PaymentTerms,
            Adjustment: 0,
            GSTAdjustment: 0,
            InvoiceDescription: "",
            IsPOC: "2",
            IsGstBeforeDiscount: purchaseOrderDetails.IsGstBeforeDiscount,
            InvoiceLimit: purchaseOrderDetails.InvoiceLimit,
            RemarksInvoice: ""
        };
        return invoiceDetails;

    }

    setContractPurchaseOrderDetails(purchaseOrderDetails: ContractPurchaseOrder, poTypeId: number) {
        // let InvoiceItems = purchaseOrderDetails.ContractPurchaseOrderItems.map(data=>{       
        //     return {
        //         RecordId:data.CPOItemid,
        //         InvoiceItemId:0,
        //         ItemDescription:data.Description,
        //         ItemQty:1,
        //         Unitprice:data.Amount,
        //         IsModified:false,
        //         CPONumber: data.CPONumber,
        //         ItemType: "Expense",
        //         CPOItemid: data.CPOItemid,
        //         CPOID: data.CPOID,
        //         AccountCode: data.AccountCode            
        //     };
        // });

        // InvoiceItems.forEach(rec=>{   
        //     this.masterContactItems.push(rec);
        // });
        let InvoiceItems = [];

        let invoiceDetails = {
            InvoiceId: 0,
            InvoiceCode: "",
            SupplierTypeID: purchaseOrderDetails.Supplier.SupplierTypeID,
            POTypeId: poTypeId,
            PurchaseOrderId: purchaseOrderDetails.CPOID,
            PurchaseOrderCode: purchaseOrderDetails.CPONumber,
            LocationId: purchaseOrderDetails.LocationID,
            Supplier: purchaseOrderDetails.Supplier,
            CurrencyId: purchaseOrderDetails.CurrencyId,
            SupplierAddress: purchaseOrderDetails.Supplier.SupplierAddress,
            DeliveryAddress: this.deliveryAddress,
            ShippingFax: purchaseOrderDetails.Supplier.BillingFax,
            InvoiceItems: InvoiceItems,
            // Discount:purchaseOrderDetails.Discount,
            Discount: 0,
            TaxRate: 0,
            TaxGroupId: purchaseOrderDetails.TaxGroupId,
            TaxId: purchaseOrderDetails.TaxId,
            TotalTax: purchaseOrderDetails.TotalTax,
            OtherCharges: purchaseOrderDetails.OtherCharges,
            ShippingCharges: 0,
            SubTotal: purchaseOrderDetails.SubTotal,
            TotalAmount: purchaseOrderDetails.TotalAmount,
            TenureAmount: purchaseOrderDetails.TenureAmount,
            PaymentTermId: 0,
            PaymentTerms: "",
            Adjustment: 0,
            GSTAdjustment: 0,
            InvoiceDescription: "",
            Margin: purchaseOrderDetails.Margin,
            IsPOC: "1",
            Service: purchaseOrderDetails.ContractPurchaseOrderItems,
            RemarksInvoice: ""
        };
        return invoiceDetails;
    }

    setExpensePurchaseOrderDetails(purchaseOrderDetails: ExpensePurchaseOrder, poTypeId: number) {
        let recordId = 0;
        let InvoiceItems = [];
        purchaseOrderDetails.PurchaseOrderItems.map(data => {
            recordId = data.Expense.AccountCodeId;
            InvoiceItems.push({
                RecordId: data.ExpensesPOItemId,
                //RecordId:recordId,
                //ItemTypeId: recordId,
                InvoiceItemId: 0,
                ItemDescription: data.ExpensesDescription,
                GlDescription: data.Expense.Description,
                ItemQty: 0,//data.ExpensesQty,
                Unitprice: data.Unitprice,
                Totalprice: data.Totalprice,
                TotalbefTax: data.TotalbefTax,
                IsModified: false,
                Discount: data.Discount,
                TaxGroupId: data.TaxGroupId,
                TaxID: data.TaxID,
                TaxName: data.TaxName,
                TaxAmount: data.TaxAmount,
                TaxTotal: data.TaxTotal,
                Category: data.Expense.AccountCodeCategoryId,
                Service: data.Expense,
                TypeId: 2,
                ItemType: data.Expense.AccountCodeName,
                PurchaseOrderId: data.PurchaseOrderId,
                PurchaseOrderCode: data.PurchaseOrderCode
            });
        });

        let invoiceDetails = {
            InvoiceId: 0,
            InvoiceCode: "",
            SupplierTypeID: purchaseOrderDetails.Supplier.SupplierTypeID,
            PurchaseOrderId: purchaseOrderDetails.ExpensesPurchaseOrderId,
            PurchaseOrderCode: purchaseOrderDetails.ExpensesPurchaseOrderCode,
            POTypeId: poTypeId,
            LocationId: purchaseOrderDetails.LocationId,
            Supplier: purchaseOrderDetails.Supplier,
            CurrencyId: purchaseOrderDetails.CurrencyId,
            SupplierAddress: purchaseOrderDetails.Supplier.SupplierAddress,
            DeliveryAddress: this.deliveryAddress,
            ShippingFax: purchaseOrderDetails.Supplier.BillingFax,
            InvoiceItems: InvoiceItems,
            Discount: purchaseOrderDetails.Discount,
            TaxRate: purchaseOrderDetails.TaxRate,
            TotalTax: purchaseOrderDetails.TotalTax,
            OtherCharges: purchaseOrderDetails.OtherCharges,
            ShippingCharges: purchaseOrderDetails.ShippingCharges,
            SubTotal: purchaseOrderDetails.SubTotal,
            TotalAmount: purchaseOrderDetails.TotalAmount,
            PaymentTermId: purchaseOrderDetails.PaymentTermId,
            PaymentTerms: purchaseOrderDetails.PaymentTerms,
            Adjustment: 0,
            GSTAdjustment: 0,
            InvoiceDescription: "",
            IsPOC: "2",
            IsGstBeforeDiscount: purchaseOrderDetails.IsGstBeforeDiscount,
            InvoiceLimit: purchaseOrderDetails.InvoiceLimit,
            RemarksInvoice: ""
        };
        return invoiceDetails;
    }


    getPOCTaxId(grnItem: any): number {
        let _taxId = 0;
        grnItem.forEach(rec => {
            rec.ContractPurchaseOrderItems.forEach(element => {
                _taxId = element.TaxID;
                return _taxId;
            });
            //return _taxId;
        });
        return _taxId;
    }

    getPaymentTerms() {
        this.sharedServiceObj.getPaymentTerms(this.sessionService.getCompanyId())
            .subscribe((data: PaymentTerm[]) => {
                this.paymentTerms = data;
            });
    }
    //to get  the purchase orders..
    getInvoices(InvoiceIdToBeSelected: number, InvoiceId: number) {

        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let InvoiceDisplayInput = {
            Skip: this.invoicePagerConfig.RecordsToSkip,
            Take: this.invoicePagerConfig.RecordsToFetch,
            Search: "",
            UserId: this.userDetails.UserID,
            CompanyId: this.companyId,
            InvoiceId: InvoiceId
        };
        this.invoiceReqObj.getInvoices(InvoiceDisplayInput)
            .subscribe((data: InvoiceDisplayResult) => {
                this.invoicesList = data.Invoice;
                this.invoicePagerConfig.TotalRecords = data.TotalRecords;
                if (this.invoicesList.length > 0) {
                    this.IsFilterDataArrive=true;
                    this.FilterInvoicesList=data.Invoice;
                    this.TotalRecords=data.TotalRecords;
                    // if (InvoiceIdToBeSelected == 0) {

                    //     this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                    // }
                    // else {

                    //     this.onRecordSelection(InvoiceIdToBeSelected, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                    // }
                }
                else {
                    this.IsFilterDataArrive=false;
                    this.hideText = true;
                    this.hideInput = false;
                }
            });
    }

    getInvoicesForApprovals(InvoiceIdToBeSelected: number, InvoiceId: number) {
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let InvoiceDisplayInput = {
            Skip: this.invoicePagerConfig.RecordsToSkip,
            Take: this.invoicePagerConfig.RecordsToFetch,
            Search: "",
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID,
            InvoiceId: InvoiceId
        };
        this.invoiceReqObj.getInvoicesForApprovals(InvoiceDisplayInput)
            .subscribe((data: InvoiceDisplayResult) => {

                this.invoicesList = data.Invoice;
                this.invoicePagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                if (this.invoicesList.length > 0) {
                    // if (InvoiceIdToBeSelected == 0) {
                    //     this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                    // }
                    // else {
                    //     this.onRecordSelection(InvoiceIdToBeSelected, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                    // }
                }
                else {
                    this.hideText = true;
                    this.hideInput = false;
                }
            });
    }

    getInvoiceCount(InvoiceId: number) {
        this.invoiceReqObj.getInvoiceCount(InvoiceId)
            .subscribe((data: InvoiceCount) => {
                if (data.Count > 0) {
                    this.disableDelete = true;
                }
                else {
                    this.disableDelete = false;
                }

            });
    }




    //to get list of purchase orders..
    getAllSearchInvoice(searchKey: string, InvoiceIdToBeSelected: number) {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let InvoiceDisplayInput = {
            Skip: this.invoicePagerConfig.RecordsToSkip,
            Take: this.invoicePagerConfig.RecordsToFetch,
            Search: searchKey,
            UserId: this.userDetails.UserID,
            CompanyId: this.companyId
        };
        this.invoiceReqObj.getInvoices(InvoiceDisplayInput)
            .subscribe((data: InvoiceDisplayResult) => {
                this.invoicesList = data.Invoice;
                this.invoicePagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                if (this.invoicesList.length > 0) {
                    // if (InvoiceIdToBeSelected == 0) {
                    //     this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                    // }
                    // else {
                    //     this.onRecordSelection(InvoiceIdToBeSelected, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                    // }
                }
                else {
                    this.hideText = true;
                    this.hideInput = false;
                }
            });
    }

    SearchInvoice(invoiceId: number, fromUserId: number = 0) {

        let userDetails = <UserDetails>this.sessionService.getUser();
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let InvoiceDisplayInput = {
            Skip: this.invoicePagerConfig.RecordsToSkip,
            Take: this.invoicePagerConfig.RecordsToFetch,
            IsApprovalPage: this.isApprovalPage,
            Search: this.requestSearchKey,
            RequestFromUserId: fromUserId,
            CreditNoteId: invoiceId,
            UserId: this.userDetails.UserID,
            CompanyId: this.companyId,
            InvoiceId: invoiceId
        };
        this.showLeftPanelLoadingIcon = true;
        this.invoiceReqObj.searchInvoice(InvoiceDisplayInput)
            .subscribe((data: InvoiceDisplayResult) => {

                this.showLeftPanelLoadingIcon = false;
                this.invoicesList = data.Invoice;
                this.invoicePagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                // if (this.invoicesList.length > 0) {
                //     this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                // }
                // else {
                //     this.addRecord();
                // }
            }, () => {
                this.showLeftPanelLoadingIcon = false;
            });
    }



    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(invoiceId: number, invoiceTypeId: number, poTypeId?: number) {

        //alert("Invoice Id : " + invoiceId + " \n Invoice Type : " + invoiceTypeId + " \n Po Type Id : " + poTypeId);

        this.router.navigate([`/po/supplierinvoice/${this.requestType}/${invoiceId}/${invoiceTypeId}/${poTypeId}`]);


    }

    onSupplierFilterChange(event: any) {
        debugger;
        if (event.item != null && event.item != undefined) {
            if (event.item.WorkFlowStatus != "Approved") {
                this.sinvFilterInfoForm.get('SupplierCategory').setValue(null);
                //event.preventDefault();
                return false;
            }
            else if (event.item.IsFreezed) {
                this.sinvFilterInfoForm.get('SupplierCategory').setValue(null);
                //event.preventDefault();
                return false;
            }
        }
    }


    getSupplierSubCodes(supplierId: number, companyId: number) {
        let subCodesDisplayInput = {
            SupplierId: supplierId,
            CompanyId: companyId
        };

        let subCodesResult = <Observable<Array<any>>>this.sharedServiceObj.getSupplierSubCodes(subCodesDisplayInput);
        subCodesResult.subscribe((data) => {
            this.supplierSubCodes = data;
        });
    }

    initGridRows() {
        let formGrouObj = this.formBuilderObj.group({
            'AccountCode': [''],
            'RecordId': [0],
            'InvoiceItemId': 0,
            'ItemTypeId': [0],
            "CPONumber": [''],
            'ItemType': [''],
            'Category': [0],
            'TypeId': [1],
            'ItemDescription': [""],
            "ItemQty": [0],
            "Unitprice": [0, [Validators.min(0.00000001)]],
            "Totalprice": [0],
            "TotalbefTax": [0],
            "IsModified": false,
            "TaxGroupId": [0, [Validators.required, Validators.min(1)]],
            "TaxID": [0, [Validators.required]],
            "TaxName": [""],
            "TaxAmount": [0],
            "Discount": [0, [Validators.required]],
            "TaxTotal": [0],
            "Item": [""],
            "Service": [""],
            'Taxes': [],
            'Expense': [],
            'AccountType': [''],
            'AccountCodeName': [''],
            'POTypeId': [0],
            'PurchaseOrderId': [0],
            'WorkFlowStatusId': [0],
            'PurchaseOrderCode': [''],
            'GlDescription': [""]
        });

        // if(this.selectedInvoiceTypeId==1)
        // {
        //     formGrouObj.get('ItemQty').disable();
        // }
        // else
        // {
        //     formGrouObj.get('ItemQty').enable();
        // }
        return formGrouObj;
    }
    //adding row to the grid..

    showInvoiceDialog() {
        this.showInvoiceTypeDialog = true;
        this.changingValue.next(0);
    }
    ClickNewRecord()
    {
        //Click New Record 
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

        this.showfilterstext = "Show List";
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
    }
    hideFullScreen() {
        // this.hideLeftPanel = false;
        // this.sharedServiceObj.hideAppBar(false);//hiding the app bar..
        HideFullScreen(this.rightPanelRef.nativeElement);
    }




    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the purchase order details on cancel button click event..
     */
    cancelRecord() {
        //setting this variable to true so as to show the purchase details     


        if (this.invoicesList.length > 0 && this.selectedInvoiceDetails != undefined) {
            if (this.selectedInvoiceDetails.InvoiceId != undefined) {
                this.onRecordSelection(this.selectedInvoiceDetails.InvoiceId, this.selectedInvoiceTypeId, this.selectedInvoiceDetails.POTypeId);
            }
            else {
                this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
            }
        }
        else if (this.invoicesList.length == 0) {
            this.hideFullScreen();
        }
        this.hideInput = false;
        this.hideText = true;
        this.isSupplierSelected = false;
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];

        this.invoiceItemDetails = [];
        this.purchaseOrderTypeId = 1;


        //this.setColumns();
        this.isNewRecord = false;
        this.isCPORecord = false;
        this.isPORecord = false;
        this.TaxGroupId = 0;
        //this.poSupplierId = 0;
        this.sharedServiceObj.hideAppBar(false);//showing the app bar..
    }
    /**
     * to delete the selected record...
     */
    deleteRecord() {
        let recordId = this.selectedInvoiceDetails.InvoiceId;
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                this.invoiceReqObj.deleteInvoice(recordId, userDetails.UserID).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });
                    this.getInvoices(0, 0);
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
        this.isNewRecord = false;
        this.isCPORecord = false;
        this.isPORecord = false;
        this.isEdit = true;
        //this.poSupplierId = 0;
        //resetting the item category form.
        //this.resetForm();
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
            this.slideActive = true;
        }
        else {
            this.slideActive = false;
        }
    }

    //to get the sub totalprice..

    /**
     * this method will be called on file upload change event...
     */
    onFileUploadChange(event: any) {
        let files: FileList = event.target.files;
        for (let i = 0; i < files.length; i++) {
            let fileItem = files.item(i);
            if (ValidateFileType(fileItem.name)) {
                this.uploadedFiles.push(fileItem);
            }
            else {
                //event.preventDefault();
                return false;
                break;
            }
        }
    }
    /**
     * this method will be called on file close icon click event..
     */
    onFileClose(fileIndex: number) {
        this.uploadedFiles = this.uploadedFiles.filter((file, index) => index != fileIndex);
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

    attachmentDelete(attachmentIndex: number) {

        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let attachmentRecord = this.selectedInvoiceDetails.Attachments[attachmentIndex];
                attachmentRecord.IsDelete = true;
                this.selectedInvoiceDetails.Attachments = this.selectedInvoiceDetails.Attachments.filter((obj, index) => index > -1);
            },
            reject: () => {
            }
        });

    }
    //
    onSearchInputChange(event: any) {
        if (this.InvoiceSearchKey != "") {
            if (this.isApprovalPage == false) {
                this.getAllSearchInvoice(this.InvoiceSearchKey, 0);
            }
            else {
                this.getAllSearchInvoiceforApproval(this.InvoiceSearchKey, 0);
            }
        }
        else {
            if (this.isApprovalPage == false) {
                this.getInvoices(0, 0);
            }
            else {
                this.getInvoicesForApprovals(0, 0);
            }
        }
    }


    // onInvoiceDateSelect()
    // {
    // }
    onSearchClick() {
        if (this.InvoiceSearchKey != "") {
            if (this.InvoiceSearchKey.length >= 3) {
                if (this.isApprovalPage == false) {
                    this.getAllSearchInvoice(this.InvoiceSearchKey, 0);
                }
                else {
                    this.getAllSearchInvoiceforApproval(this.InvoiceSearchKey, 0);
                }
            }
        }
        else {
            if (this.isApprovalPage == false) {
                this.getInvoices(0, 0);
            }
            else {
                this.getInvoicesForApprovals(0, 0);
            }
        }
    }
    // invoiceSelectionOk(invoiceTypeId: number) {
    //     this.subTotal = 0;
    //     this.sumSubtotal = 0;
    //     this.POSubtotal = 0;
    //     this.selectedInvoiceTypeId = invoiceTypeId;
    //     this.showInvoiceTypeDialog = false;
    //     this.addRecord();
    //     if (this.selectedInvoiceTypeId == 2) {
    //         this.addGridItem(this.linesToAdd, null);
    //         this.supplierSubCodes = [];
    //     }
    //     this.creditNotes = [];
    //     this.canVoid = false;
    // }

    pageChange(currentPageNumber: any) {
        debugger;
        this.invoicePagerConfig.RecordsToSkip = this.invoicePagerConfig.RecordsToFetch * (currentPageNumber - 1);
        if (this.isFilterApplied == true) {
            this.filterData();
        }
        if (currentPageNumber != null && currentPageNumber != undefined) {
            if ((this.requestSearchKey == null || this.requestSearchKey == "")) {
                if (this.isApprovalPage === false) {
                    this.getInvoices(0, 0);
                }
                else if (this.isApprovalPage === true) {
                    this.getInvoicesForApprovals(0, 0);
                }
            }
            else {
                this.SearchInvoice(0);
            }
        }
        // this.showfilters = false;
        // this.showfilterstext = "Hide List";
    }

    onPrintScreen(event: any) {
        let windowObj = event.view;
        this.invoiceReqObj.printDetails(this.selectedInvoiceDetails.InvoiceId, this.selectedInvoiceTypeId, this.selectedInvoiceDetails.POTypeId, this.companyId).subscribe((data: string) => {
            PrintScreen(data, windowObj, "", "Supplier Invoice");
        });
    }

    //start filter code


    openDialog() {
        this.isFilterApplied = false;
        this.initDone = true;
        if (this.supplierInvoiceRef != undefined) {
            this.supplierInvoiceRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.supplierInvoiceRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }
    resetPagerConfig() {
        this.invoicePagerConfig.RecordsToSkip = 0;
        this.invoicePagerConfig.RecordsToFetch = 25;
        this.currentPage = 1;
    }

    resetFilters() {
        this.sinvFilterInfoForm.get('SInvCode').setValue("");
        this.sinvFilterInfoForm.get('SupplierCategory').setValue("");
        this.sinvFilterInfoForm.get('FromDate').setValue(null);
        this.sinvFilterInfoForm.get('ToDate').setValue(null);
        this.sinvFilterInfoForm.get('PoTypeId').setValue('');
        this.sinvFilterInfoForm.get('Status').setValue('');
        this.sinvFilterInfoForm.get('PoNumber').setValue('');
        this.filterMessage = "";
        this.InvoiceSearchKey = "";
        this.resetPagerConfig();
        this.filteredSupplierPayment = this.invoicesList;
        // if (this.filteredSupplierPayment.length > 0) {
        if (this.isApprovalPage == false) {
            this.getInvoices(0, 0);
        }
        else {
            this.getInvoicesForApprovals(0, 0);
        }
        //}
        if (this.supplierInvoiceRef != undefined) {
            this.supplierInvoiceRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.supplierInvoiceRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    openSettingsMenu() {
        this.initSettingsDone = true;
    }
    
    supplierInputFormater = (x: Suppliers) => (x.WorkFlowStatus === "Approved" && !x.IsFreezed) ? x.SupplierName : "";
    InvoiceFormater = (x: InvoiceList) => x.InvoiceCode;
    
    supplierSearch = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        // switchMap(term =>
        //     this.sharedServiceObj.getSuppliers({
        //         searchKey: term,
        //         supplierTypeId: (this.InvoiceForm.get('SupplierTypeID').value != null ? this.InvoiceForm.get('SupplierTypeID').value : 0),
        //         companyId: this.companyId
        //     }).pipe(
        //         catchError(() => {
        //             return of([]);
        //         }))
        // )
        switchMap(term => {
            let params = {
                searchKey: term,
                supplierTypeId: (this.InvoiceForm.get('SupplierTypeID').value != null ? this.InvoiceForm.get('SupplierTypeID').value : 0),
                companyId: this.companyId
            };
            if (this.selectedInvoiceTypeId == 1) {
                return this.sharedServiceObj.getSuppliers(params).pipe(catchError(() => { return of([]); }));
            }
            if (this.selectedInvoiceTypeId == 2) {
                return this.sharedServiceObj.getActiveSuppliers(params).pipe(catchError(() => { return of([]); }));
            }
        })
    );
    filterData() {
        debugger;
        this.isFilterApplied = true;
        let sinvCode = "";
        let supplierName = "";
        this.filterMessage = "";
        let poNumber = '';
        let poTypeId = "";
        let status = "";
        let fromDate = null; let toDate = null;
        if (this.sinvFilterInfoForm.get('SInvCode').value != "") {
            sinvCode = this.sinvFilterInfoForm.get('SInvCode').value;
        }

        if (this.sinvFilterInfoForm.get('SupplierCategory').value != null) {
            supplierName = this.sinvFilterInfoForm.get('SupplierCategory').value.SupplierName;
        }
        if (supplierName === undefined) {
            supplierName = '';
        }
        if (this.sinvFilterInfoForm.get('PoNumber').value != "") {
            poNumber = this.sinvFilterInfoForm.get('PoNumber').value;
        }

        if (this.sinvFilterInfoForm.get('Status').value != "") {
            status = this.sinvFilterInfoForm.get('Status').value;
        }

        if (this.sinvFilterInfoForm.get('FromDate').value != null) {
            fromDate = this.reqDateFormatPipe.transform(this.sinvFilterInfoForm.get('FromDate').value);
        }

        if (this.sinvFilterInfoForm.get('ToDate').value != null) {
            toDate = this.reqDateFormatPipe.transform(this.sinvFilterInfoForm.get('ToDate').value);
        }

        //**************************************************************************************************************/
        //From Date
        //**************************************************************************************************************/
        const FromDateYearS = Number(this.datePipe.transform(fromDate, 'yyyy'));
        const FromDateMonthS = Number(this.datePipe.transform(fromDate, 'MM'));
        const FromDateDayS = Number(this.datePipe.transform(fromDate, 'dd'));
        
        //Day
        if (FromDateDayS <= 9) {
            this.FromDateDayStr = "0" + FromDateDayS;
        }
        else {
            this.FromDateDayStr = FromDateDayS.toString();
        }
        //Month
        if (FromDateMonthS <= 9) {
            this.FromDateMonthStr =  "0" + FromDateMonthS;
        }
        else {
            this.FromDateMonthStr =   FromDateMonthS.toString();
        }

        this.FromDateStr = FromDateYearS + "-"+ this.FromDateMonthStr + "-" + this.FromDateDayStr;
        //**************************************************************************************************************/
        //**************************************************************************************************************/
        //To Date
        //**************************************************************************************************************/
        const ToDateYearS = Number(this.datePipe.transform(toDate, 'yyyy'));
        const ToDateMonthS = Number(this.datePipe.transform(toDate, 'MM'));
        const ToDateDayS = Number(this.datePipe.transform(toDate, 'dd'));
        //First Commit
        //Day
        if (ToDateDayS <= 9) {
            this.ToDateDayStr = "0" + ToDateDayS;
        }
        else {
            this.ToDateDayStr = ToDateDayS.toString();
        }
        //Month
        if (ToDateMonthS <= 9) {
            this.ToDateMonthStr =  "0" + ToDateMonthS;
        }
        else {
            this.ToDateMonthStr =  ToDateMonthS.toString();
        }

        this.ToDateStr = ToDateYearS + "-" + this.ToDateMonthStr + "-" + this.ToDateDayStr;
        //**************************************************************************************************************/

        if (this.sinvFilterInfoForm.get('PoTypeId').value != "") {
            poTypeId = this.sinvFilterInfoForm.get('PoTypeId').value;
        }


        if (sinvCode === "" && (supplierName === '' || supplierName === undefined) && poNumber === '' && status === '' && (fromDate == null && toDate == null) && poTypeId === "") {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
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
        this.resetPagerConfig();
        let sinvFilterDisplayInput: SINVFilterDisplayInput = {
            Skip: this.invoicePagerConfig.RecordsToSkip,
            Take: this.invoicePagerConfig.RecordsToFetch,
            SINVCodeFilter: sinvCode,
            SupplierNameFilter: supplierName,
            PoNumberFilter: poNumber,
            StatusFilter: status,
            CompanyID: this.companyId,
            UserId: this.userDetails.UserID,
            // FromDateFilter: fromDate == null ? null : this.reqDateFormatPipe.transform(fromDate),
            // ToDateFilter: toDate == null ? null : this.reqDateFormatPipe.transform(toDate),
            FromDateFilter: this.FromDateStr,
            ToDateFilter: this.ToDateStr,
            PoTypeIdFilter: poTypeId
        };
        this.invoiceReqObj.getFilterSIC(sinvFilterDisplayInput).subscribe((data: InvoiceDisplayResult) => {
            debugger;
            if (data.Invoice.length > 0) {
                this.showLeftPanelLoadingIcon = false;
                this.invoicesList = data.Invoice;
                this.invoicePagerConfig.TotalRecords = data.TotalRecords;
                this.selectedInvoiceDetails.InvoiceId = this.invoicesList[0].InvoiceId;
                this.TotalRecords=data.TotalRecords;
                // this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                // if (open) {
                //     this.initDone = false;
                // }
            }
            else {
                this.showLeftPanelLoadingIcon = false;
                this.filterMessage = "No matching records are found";
                this.TotalRecords=0;
                this.invoicesList=new Array<InvoiceList>();
                //this.invoicesList =null;
            }
        });
    }


    restrictMinus(e: any) {
        restrictMinus(e);
    }


    ExportAsExcel() {
        let accountcode;
        let invoiceDetials: Array<InvoiceDetails> = new Array<InvoiceDetails>();
        invoiceDetials.push(this.selectedInvoiceDetails);
        const ws1_name = 'Invoices';
        const ws2_name = 'Invoice_Details';
        const ws3_name = 'Invoice_Payment_Schedules';
        const ws4_name = 'Invoice_Optional_Fields';
        const ws5_name = 'Invoice_Detail_Optional_Fields';
        let ws1DataDetails = [];
        let ws2DataDetails = [];
        let PurchaseorderId: number;
        let contractponumber = "";

        let Lists = new Array<InvoiceDetails>();
        Lists.push(this.selectedInvoiceDetails);
        let codeCount: number = 0;
        let cpovalue = [];
        let Cntitem = 0;
        let ws1cntitem = 0;
        let cponumber;
        let basetax = 0;
        let cpoNumberval = [];
        let invoicecodeid = 0;
        if (this.selectedInvoiceDetails.POTypeId == 5 || this.selectedInvoiceDetails.POTypeId == 6) {
            basetax = this.selectedInvoiceDetails.SubTotal - this.selectedInvoiceDetails.Discount;
        }
        else {
            basetax = this.selectedInvoiceDetails.SubTotal - this.selectedInvoiceDetails.TotalTax;
        }

        let netTotal = this.selectedInvoiceDetails.TotalAmount;
        if (this.selectedInvoiceDetails.SelectedCPOs != null && (this.selectedInvoiceDetails.POTypeId == 5 || this.selectedInvoiceDetails.POTypeId == 6)) {
            for (let i = 0; i < this.selectedInvoiceDetails.SelectedCPOs.length; i++) {
                let cposplit = this.selectedInvoiceDetails.SelectedCPOs[i].CPONumber.split('-');
                cpovalue.push(cposplit[0]);
            }
        }
        else {
            if (this.selectedInvoiceDetails.PurchaseOrderCode != null)
                cpovalue.push(this.selectedInvoiceDetails.PurchaseOrderCode);
        }
        if (cpovalue.length > 0)
            cpoNumberval = cpovalue[0].split(',');
        if (this.selectedInvoiceDetails.PurchaseOrderCode != null && this.selectedInvoiceDetails.PurchaseOrderCode.length > 20) {
            let cpoval = cpovalue[0].split(',');
            if (cpoval.length > 1) {
                Lists.map((x) => {
                    let _supplier = x.Supplier;
                    let _INVCDESC = x.InvoiceDescription;
                    if (_supplier.SupplierShortName != null && _supplier.SupplierShortName != undefined) {
                        if (_supplier.SupplierShortName.length > 0) {
                            _INVCDESC = _supplier.SupplierShortName + '/' + x.InvoiceDescription;
                        }
                        else {
                            _INVCDESC = x.InvoiceDescription;
                        }
                    }
                    for (let i = 0; i < cpoval.length; i++) {
                        let j = i + 1;
                        ws1DataDetails.push(
                            {
                                'CNTBTCH': '1',
                                'CNTITEM': j,
                                'IDVEND': x.Supplier.SupplierCode,
                                'IDINVC': x.SupplierRefNo,
                                'TEXTTRX': '1',
                                'ORDRNBR': '',
                                'PONBR': cpoval[i],
                                'INVCDESC': _INVCDESC,
                                'INVCAPPLTO': '',
                                'IDACCTSET': x.AccountSetId,
                                'DATEINVC': x.InvoiceDateString,
                                'FISCYR': new Date().getFullYear(),
                                'FISCPER': new Date().getMonth() + 1,
                                'CODECURN': x.CurrencyCode,
                                'EXCHRATE': '',
                                'TERMCODE': x.PaymentTermsCode,
                                'DATEDUE': x.DueDateString,
                                'CODETAXGRP': x.InvoiceItems[0].TaxGroupName,
                                'TAXCLASS1': x.InvoiceItems[0].TaxClass,
                                'BASETAX1': basetax.toFixed(2),
                                'AMTTAX1': x.TotalTax.toFixed(2),
                                'AMTTAXDIST': x.TotalTax.toFixed(2),
                                'AMTINVCTOT': (x.TotalAmount - x.TotalTax).toFixed(2),
                                'AMTTOTDIST': (x.TotalAmount - x.TotalTax).toFixed(2),
                                'AMTGROSDST': netTotal.toFixed(2),
                                'AMTDUE': netTotal.toFixed(2),
                                'AMTTAXTOT': x.TotalTax.toFixed(2),
                                'AMTGROSTOT': netTotal.toFixed(2),
                            })
                    }
                })
            }
        }
        else {

            Lists.map((x) => {
                let _supplier = x.Supplier;
                let _INVCDESC = x.InvoiceDescription;
                if (_supplier.SupplierShortName != null && _supplier.SupplierShortName != undefined) {
                    if (_supplier.SupplierShortName.length > 0) {
                        _INVCDESC = _supplier.SupplierShortName + '/' + x.InvoiceDescription;
                    }
                    else {
                        _INVCDESC = x.InvoiceDescription;
                    }
                }
                if (this.selectedInvoiceDetails.SelectedCPOs != null && (this.selectedInvoiceDetails.POTypeId == 5 || this.selectedInvoiceDetails.POTypeId == 6)) {
                    for (let i = 0; i < this.selectedInvoiceDetails.SelectedCPOs.length; i++) {
                        let cposplit = this.selectedInvoiceDetails.SelectedCPOs[i].CPONumber.split('-');
                        if (contractponumber != cposplit[0]) {
                            ws1cntitem++;
                            contractponumber = cposplit[0];

                            ws1DataDetails.push(
                                {
                                    'CNTBTCH': '1',
                                    'CNTITEM': ws1cntitem,
                                    'IDVEND': x.Supplier.SupplierCode,
                                    'IDINVC': x.SupplierRefNo,
                                    'TEXTTRX': '1',
                                    'ORDRNBR': '',
                                    //'PONBR': x.PurchaseOrderCode,
                                    'PONBR': cposplit[0],//(cpovalue != undefined || cpovalue != null) ? cpovalue[0]:x.PurchaseOrderCode,
                                    'INVCDESC': _INVCDESC,
                                    'INVCAPPLTO': '',
                                    'IDACCTSET': x.AccountSetId,
                                    'DATEINVC': x.InvoiceDateString,
                                    'FISCYR': new Date().getFullYear(),
                                    'FISCPER': new Date().getMonth() + 1,
                                    'CODECURN': x.CurrencyCode,
                                    'EXCHRATE': '',
                                    'TERMCODE': x.PaymentTermsCode,
                                    'DATEDUE': x.DueDateString,
                                    'CODETAXGRP': x.InvoiceItems[0].TaxGroupName,
                                    'TAXCLASS1': x.InvoiceItems[0].TaxClass,
                                    //'BASETAX1': x.TotalAmount - x.TotalTax,
                                    'BASETAX1': basetax.toFixed(2),
                                    'AMTTAX1': x.TotalTax.toFixed(2),
                                    'AMTTAXDIST': x.TotalTax.toFixed(2),
                                    'AMTINVCTOT': (x.TotalAmount - x.TotalTax).toFixed(2),
                                    'AMTTOTDIST': (x.TotalAmount - x.TotalTax).toFixed(2),
                                    'AMTGROSDST': netTotal.toFixed(2),                 //x.TotalAmount,
                                    'AMTDUE': netTotal.toFixed(2),
                                    'AMTTAXTOT': x.TotalTax.toFixed(2),
                                    'AMTGROSTOT': netTotal.toFixed(2),
                                });
                        }
                        else {
                            ws1cntitem;
                            contractponumber = cposplit[0];
                        }
                    }
                }
                else {
                    ws1DataDetails.push(
                        {
                            'CNTBTCH': '1',
                            'CNTITEM': '1',
                            'IDVEND': x.Supplier.SupplierCode,
                            'IDINVC': x.SupplierRefNo,
                            'TEXTTRX': '1',
                            'ORDRNBR': '',
                            //'PONBR': x.PurchaseOrderCode,
                            'PONBR': cpovalue[0],//(cpovalue != undefined || cpovalue != null) ? cpovalue[0]:x.PurchaseOrderCode,
                            'INVCDESC': _INVCDESC,
                            'INVCAPPLTO': '',
                            'IDACCTSET': x.AccountSetId,
                            'DATEINVC': x.InvoiceDateString,
                            'FISCYR': new Date().getFullYear(),
                            'FISCPER': new Date().getMonth() + 1,
                            'CODECURN': x.CurrencyCode,
                            'EXCHRATE': '',
                            'TERMCODE': x.PaymentTermsCode,
                            'DATEDUE': x.DueDateString,
                            'CODETAXGRP': x.InvoiceItems[0].TaxGroupName,
                            'TAXCLASS1': x.InvoiceItems[0].TaxClass,
                            'BASETAX1': basetax.toFixed(2),
                            'AMTTAX1': x.TotalTax.toFixed(2),
                            'AMTTAXDIST': x.TotalTax.toFixed(2),
                            'AMTINVCTOT': (x.TotalAmount - x.TotalTax).toFixed(2),
                            'AMTTOTDIST': (x.TotalAmount - x.TotalTax).toFixed(2),
                            'AMTGROSDST': netTotal.toFixed(2),
                            'AMTDUE': netTotal.toFixed(2),
                            'AMTTAXTOT': x.TotalTax.toFixed(2),
                            'AMTGROSTOT': netTotal.toFixed(2),
                        })
                }

            })
        }
        var ws1Data = ws1DataDetails;

        this.selectedInvoiceDetails.InvoiceItems.map((item) => {
            if (this.purchaseOrderTypeId == PurchaseOrderType.InventoryPo
                || this.purchaseOrderTypeId == PurchaseOrderType.FixedAssetPo || this.purchaseOrderTypeId == PurchaseOrderType.ExpensePo) {
                if (item.TypeId == 1 && this.purchaseOrderTypeId == PurchaseOrderType.FixedAssetPo) {
                    // let splitted = item.ItemDescription.split(" - "); 
                    // accountcode = splitted[1];
                    accountcode = item.Service.Code;
                }
                else {
                    accountcode = item.Item.GLCode != null ? item.Item.GLCode : item.Service.Code;
                }
            }
            else if (item.TypeId == 1 && this.selectedInvoiceTypeId == 2) {
                accountcode = item.Item.GLCode;
                item.ItemDescription = item.ItemDescription;
            }
            else {
                accountcode = item.Service.Code;
            }
            if (item.PurchaseOrderId != null && (this.selectedInvoiceDetails.SelectedCPOs == null || this.selectedInvoiceDetails.SelectedCPOs.length == 0)) {
                if (cpoNumberval.length > 1) {
                    if (PurchaseorderId != item.PurchaseOrderId) {
                        Cntitem = Cntitem + 1;
                        PurchaseorderId = item.PurchaseOrderId;
                    }
                    else {
                        Cntitem = Cntitem;
                        PurchaseorderId = item.PurchaseOrderId;
                    }
                    if (item.InvoiceId != invoicecodeid) {
                        codeCount = codeCount + 20;
                        invoicecodeid = item.InvoiceId;
                    }
                    else {
                        codeCount = codeCount + 20;
                        invoicecodeid = item.InvoiceId;
                    }
                }
                else {
                    if (PurchaseorderId == undefined) {
                        PurchaseorderId = item.InvoiceId;
                        Cntitem = Cntitem + 1;
                        codeCount = 10 * 2;
                    }
                    else if (PurchaseorderId != item.InvoiceId) {
                        PurchaseorderId = item.InvoiceId;
                        Cntitem = Cntitem + 1;
                        codeCount = 10 * 2;

                    }
                    else if (PurchaseorderId == item.InvoiceId) {
                        PurchaseorderId = item.InvoiceId;
                        Cntitem = Cntitem;
                        codeCount = codeCount + 20;

                    }
                }
                ws2DataDetails.push(
                    {
                        'CNTBTCH': '1',
                        'CNTITEM': Cntitem,
                        'CNTLINE': codeCount,
                        'IDDIST': '',
                        'TEXTDESC': item.ItemDescription,
                        'AMTTOTTAX': item.CurrentTaxTotal.toFixed(2),
                        'BASETAX1': (Math.round(((item.Unitprice * item.ItemQty) - item.Discount) * 100) / 100).toFixed(2),
                        'TAXCLASS1': item.TaxClass,
                        'RATETAX1': item.TaxAmount,
                        'AMTTAX1': item.CurrentTaxTotal.toFixed(2),
                        'IDGLACCT': accountcode,
                        'AMTDIST': ((item.Unitprice * item.ItemQty) - item.Discount).toFixed(2),
                        'COMMENT': '',
                        'SWIBT': '0',

                    })
            }
            else if (this.selectedInvoiceDetails.SelectedCPOs != null && (this.selectedInvoiceDetails.POTypeId == 5 || this.selectedInvoiceDetails.POTypeId == 6)) {
                if (cponumber == undefined) {
                    let cposplit = item.CPONumber.toString().split('-');
                    cponumber = cposplit[0];
                    Cntitem = Cntitem + 1;
                    codeCount = 0;
                }
                else if (cponumber != item.CPONumber.toString().split('-')[0]) {
                    let cposplit = item.CPONumber.toString().split('-');
                    cponumber = cposplit[0];
                    Cntitem = Cntitem + 1;
                    codeCount = 0;
                }
                else if (cponumber == item.CPONumber.toString().split('-')[0]) {
                    let cposplit = item.CPONumber.toString().split('-');
                    cponumber = cposplit[0];
                    Cntitem = Cntitem;

                }
                codeCount = codeCount + 20;
                let _itemType: string = item.ItemType;
                ws2DataDetails.push(
                    {
                        'CNTBTCH': '1',
                        'CNTITEM': Cntitem,
                        'CNTLINE': codeCount,
                        'IDDIST': '',
                        'TEXTDESC': item.ItemDescription,
                        'AMTTOTTAX': item.CurrentTaxTotal.toFixed(2),
                        'BASETAX1': (Math.round(((item.Unitprice * item.ItemQty) - item.Discount) * 100) / 100).toFixed(2),
                        'TAXCLASS1': item.TaxClass,
                        'RATETAX1': item.TaxAmount,
                        'AMTTAX1': item.CurrentTaxTotal.toFixed(2),
                        'IDGLACCT': accountcode,
                        'AMTDIST': ((item.Unitprice * item.ItemQty) - item.Discount).toFixed(2),
                        'COMMENT': '',
                        'SWIBT': '0',

                    })

                if (this.selectedInvoiceDetails.JVs != null && this.selectedInvoiceDetails.JVs.length > 0) {
                    this.selectedInvoiceDetails.JVs.map((jv) => {
                        var jvs = jv.ContractPurchaseOrderItems.filter(x => x.CPOID == item.CPOID);
                        if (jv.AccruetheExpense) {
                            jvs.map((cpoitem) => {
                                if (jv.CPOJVACode != null && _itemType == cpoitem.AccountCode) {
                                    codeCount = codeCount + 20;
                                    ws2DataDetails.push(
                                        {
                                            'CNTBTCH': '1',
                                            'CNTITEM': Cntitem,
                                            'CNTLINE': codeCount,
                                            'IDDIST': '',
                                            'TEXTDESC': jv.CPOJVACode,
                                            'AMTTOTTAX': 0,
                                            'BASETAX1': 0,
                                            'TAXCLASS1': item.TaxClass,
                                            'RATETAX1': item.TaxAmount,
                                            'AMTTAX1': 0,
                                            'IDGLACCT': cpoitem.AccountCode,
                                            'AMTDIST': - cpoitem.Amount.toFixed(2),
                                            'COMMENT': '',
                                            'SWIBT': '0'
                                        })
                                    codeCount = codeCount + 20;
                                    ws2DataDetails.push(
                                        {
                                            'CNTBTCH': '1',
                                            'CNTITEM': Cntitem,
                                            'CNTLINE': codeCount,
                                            'IDDIST': '',
                                            'TEXTDESC': jv.CPOJVACode,
                                            'AMTTOTTAX': 0,
                                            'BASETAX1': 0,
                                            'TAXCLASS1': item.TaxClass,
                                            'RATETAX1': item.TaxAmount,
                                            'AMTTAX1': 0,
                                            'IDGLACCT': jv.AccountCodeName,
                                            'AMTDIST': cpoitem.Amount.toFixed(2),
                                            'COMMENT': '',
                                            'SWIBT': '0'
                                        })
                                }
                            });
                        }
                    });
                }
            }

            else if (this.selectedInvoiceDetails.InvoiceTypeId == 2) {
                let WpoCntitem = 1;
                codeCount = codeCount + 20;
                ws2DataDetails.push(
                    {
                        'CNTBTCH': '1',
                        'CNTITEM': WpoCntitem,
                        'CNTLINE': codeCount,
                        'IDDIST': '',
                        'TEXTDESC': item.ItemDescription,
                        'AMTTOTTAX': item.CurrentTaxTotal.toFixed(2),
                        'BASETAX1': (Math.round(((item.Unitprice * item.ItemQty) - item.Discount) * 100) / 100).toFixed(2),
                        'TAXCLASS1': item.TaxClass,
                        'RATETAX1': item.TaxAmount,
                        'AMTTAX1': item.CurrentTaxTotal.toFixed(2),
                        'IDGLACCT': accountcode,
                        'AMTDIST': ((item.Unitprice * item.ItemQty) - item.Discount).toFixed(2),
                        'COMMENT': '',
                        'SWIBT': '0',

                    })
            }
        })

        var ws2Data = ws2DataDetails;

        var ws3Data = Lists.map((x) => {
            return {
                'CNTBTCH': '',
                'CNTITEM': '',
                'CNTPAYM': '',
                'DATEDUE': '',
                'AMTDUE': ''

            };
        })
        var ws4Data = Lists.map((x) => {
            return {
                'CNTBTCH': '',
                'CNTITEM': '',
                'OPTFIELD': '',
                'VALUE': '',
                'TYPE': '',
                'LENGTH': '',
                'DECIMALS': '',
                'ALLOWNULL': '',
                'VALIDATE': '',
                'VALINDEX': '',
                'VALIFTEXT': '',
                'VALIFMONEY': '',
                'VALIFNUM': '',
                'VALIFLONG': '',
                'VALIFBOOL': '',
                'VALIFDATE': '',
                'VALIFTIME': '',
                'FDESC': '',
                'VDESC': '',
            };
        })

        var ws5Data = Lists.map((x) => {
            return {
                'CNTBTCH': '',
                'CNTITEM': '',
                'CNTLINE': '',
                'OPTFIELD': '',
                'VALUE': '',
                'TYPE': '',
                'LENGTH': '',
                'DECIMALS': '',
                'ALLOWNULL': '',
                'VALIDATE': '',
                'VALINDEX': '',
                'VALIFTEXT': '',
                'VALIFMONEY': '',
                'VALIFNUM': '',
                'VALIFLONG': '',
                'VALIFBOOL': '',
                'VALIFDATE': '',
                'VALIFTIME': '',
                'FDESC': '',
                'VDESC': '',
            };
        })

        let url = "/assets/ExcelTemplates/AP Invoice.xlsx";
        let req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "arraybuffer";
        req.onload = (e) => {
            let data = new Uint8Array(req.response);
            let wb = XLSX.read(data, { type: "array" });
            const ws1: any = utils.json_to_sheet(ws1Data);
            const ws2: any = utils.json_to_sheet(ws2Data);
            const ws3: any = utils.json_to_sheet(ws3Data);
            const ws4: any = utils.json_to_sheet(ws4Data);
            const ws5: any = utils.json_to_sheet(ws5Data);
            wb.Sheets[ws1_name] = ws1;
            wb.Sheets[ws2_name] = ws2;
            wb.Sheets[ws3_name] = ws3;
            wb.Sheets[ws4_name] = ws4;
            wb.Sheets[ws5_name] = ws5;
            const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
            this.ExcelExportFileName = "Exportinvoice_" + (new Date().getDate()) + ".xlsx";
            saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), this.ExcelExportFileName);
            this.invoiceReqObj.ChangeInvoiceStatus(this.selectedInvoiceDetails.InvoiceId, this.selectedInvoiceDetails.CreatedBy, WorkFlowStatus.Exported, this.userDetails.UserID).subscribe(() => {
                this.getInvoices(0, 0);
            });
        };
        req.send();
        function s2ab(s) {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i !== s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            };
            return buf;
        }
    }

    displayVoidPopUp(isVoid: boolean) {
        if (isVoid == true) {
            this.pmoduleHeading = "Supplier Invoice Void Confirmation";
            this.pmoduleMessage = "Are you sure to void this Invoice ?";
        }
        else {
            let userDetails = <UserDetails>this.sessionService.getUser();
            let statusid = this.workFlowStatus.Rejected;
            if (statusid == WorkFlowStatus.Rejected && !isVoid) {
                if (this.selectedInvoiceDetails.CreatedBy == this.selectedInvoiceDetails.CurrentApproverUserId &&
                    this.selectedInvoiceDetails.CreatedBy == userDetails.UserID) {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.PoApprovesameValidationMessage,
                        MessageType: MessageTypes.Error
                    });
                    return;
                }
                this.showVoidPopUp = false;
            }
            this.pmoduleHeading = "Supplier Invoice Reject Confirmation";
            this.pmoduleMessage = "Are you sure to Reject this Invoice ?";
        }
        this.showVoidPopUp = true;
        this.voidPopUpTabId = 1;
        this.invoiceVoidForm.patchValue({
            Reasons: ""
        });
    }

    voidRecord() {
        let reasonData = this.invoiceVoidForm.value;
        if (this.invoiceVoidForm.status != "INVALID") {
            if (this.invoiceVoidForm.get('Reasons').value.trim() == "" || this.invoiceVoidForm.get('Reasons').value.trim() == null) {
                this.invoiceVoidForm.get('Reasons').setErrors({
                    'required': true
                });
                return;
            }
            let userDetails = <UserDetails>this.sessionService.getUser();
            let displayInput: InvoiceVoid = {
                UserId: userDetails.UserID,
                Reasons: reasonData.Reasons,
                InvoiceId: this.selectedInvoiceDetails.InvoiceId,
                SelectedGRNs: this.selectedInvoiceDetails.SelectedGRNs,
                SelectedCPOs: this.selectedInvoiceDetails.SelectedCPOs,
                SelectedPOs: this.selectedInvoiceDetails.SelectedPOs,
                POTypeId: this.selectedInvoiceDetails.POTypeId,
                StatusId: 0,
                InvoiceCode: this.selectedInvoiceDetails.InvoiceCode,
                CompanyId: this.companyId
                // PurchaseOrderId:this.selectedInvoiceDetails.PurchaseOrderId
            };
            // this.invoiceReqObj.voidSuppplierInvoice(this.selectedInvoiceDetails.InvoiceId,
            //                                         userDetails.UserID,
            //                                         reasonData.Reasons,this.selectedInvoiceDetails.SelectedGRNs)
            HideFullScreen(null);
            this.invoiceReqObj.voidSuppplierInvoice(displayInput)
                .subscribe((count: number) => {
                    //    if(count==0)
                    //    {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.InvoiceVoidRecord,
                        MessageType: MessageTypes.Success
                    });
                    this.showVoidPopUp = false;
                    // this.onRecordSelection(this.selectedInvoiceDetails.InvoiceId);
                    this.getInvoices(0, 0);
                    //   }
                    //   else
                    //   {
                    //     this.voidPopUpTabId = 3;
                    //   }
                }, (data: HttpErrorResponse) => {

                });
        }
        else {
            this.invoiceVoidForm.controls["Reasons"].markAsTouched();
        }
    }






    itemMasterSelectionGlCode(eventData: any) {
        this.GlcodeInfoForm.get('Item').setValue(eventData);
        this.errmesagevisible = false;
    }
    serviceMasterSelectionGlCode(eventData: any, index: number) {
        this.GlcodeInfoForm.get('Service').setValue(eventData);
    }

    getSelectedItemsListGlcode(data: ItemGLCode[]) {
        return data;
    }
    /*
        onClickedOutside(e: Event) {
            $(".tablescroll").removeClass("hidescroll")
    
        } */

    itemClick(rowId: number) {
        setTimeout(function () {
            $(".tablescroll").addClass("hidescroll")
        }, 1000);
        this.selectedRowId = rowId;
    }


    getAllSearchInvoiceforApproval(searchKey: string, InvoiceIdToBeSelected: number) {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let InvoiceDisplayInput = {
            Skip: this.invoicePagerConfig.RecordsToSkip,
            Take: this.invoicePagerConfig.RecordsToFetch,
            Search: searchKey,
            UserId: this.userDetails.UserID,
            CompanyId: this.companyId
        };
        this.invoiceReqObj.getInvoicesForApprovals(InvoiceDisplayInput)
            .subscribe((data: InvoiceDisplayResult) => {
                this.invoicesList = data.Invoice;
                this.invoicePagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                if (this.invoicesList.length > 0) {
                    if (InvoiceIdToBeSelected == 0) {
                        this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                    }
                    else {
                        this.onRecordSelection(InvoiceIdToBeSelected, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                    }
                }
                else {
                    this.hideText = true;
                    this.hideInput = false;
                }
            });
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
        if (this.SelectedInvoiceId > 0) {

            this.poTypeId = this.selectedInvoiceDetails.POTypeId;
            let pdfDocument = this.invoiceReqObj.supplierInvoicePrintDetails(this.SelectedInvoiceId, this.selectedInvoiceTypeId, this.poTypeId, this.companyId);
            pdfDocument.subscribe((data: any) => {
                let record = this.invoicesList.find(j => j.InvoiceId == this.SelectedInvoiceId && j.InvoiceTypeId == this.selectedInvoiceTypeId && j.POTypeId == this.poTypeId);
                if (record.InvoiceCode == null) {
                    saveAs(new Blob([(data)], { type: 'application/pdf' }), "PO" + record.InvoiceCode + ".pdf");
                }
                else
                    saveAs(new Blob([(data)], { type: 'application/pdf' }), "PO" + record.InvoiceCode + ".pdf");


            });
        }
    }
    displayLogPopUp() {
        this.showLogPopUp = true;
    }
    hideLogPopUp(hidePopUp: boolean) {
        this.showLogPopUp = false;
    }
    redirectToCNDetails(creditNote: any) {
        this.router.navigate(['po/CreditNote/request/' + creditNote.DocumentId], { queryParams: { from: 'inv' } });
    }
    editVerify() {
        this.enableOnVerify = true;
    }

    SetFilterData() {
        this.navigateToPage();
    }
    //*********************************************************************************************************************/
    //Export Code Starts Here
    //*********************************************************************************************************************/
    pad2(n) { return n < 10 ? '0' + n : n }
    ExportToExcel() {
        //alert("Export To CSV");
        debugger;

        this.SetFilterData();
        this.interval = setTimeout(() => {
            //alert("Alert activated")
            debugger;
            if (this.IsFilterDataArrive) {
                debugger;
                if (this.FilterInvoicesList.length > 0) {
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
                    this.FilterInvoicesList.forEach(polist => {
                        udt.data.push({
                            A: polist.InvoiceCode,
                            B: polist.SupplierName,
                            D: polist.WorkFlowStatusId
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

                    debugger;
                    let date = new Date();
    
                    this.FileName= "SalesInvoicesList_" + date.getFullYear().toString() + this.pad2(date.getMonth() + 1) + this.pad2( date.getDate()) + this.pad2( date.getHours() ) + this.pad2( date.getMinutes() ) + this.pad2( date.getSeconds());
                    //this.ExcelExportFileName = this.FileName + ".xlsx";
                    this.ExcelExportFileName = this.FileName;

                    this.exportService.exportJsonToExcel(edata, this.ExcelExportFileName);
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
                if (this.FilterInvoicesList.length > 0) {
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
                    csvExporter.generateCsv(this.FilterInvoicesList);
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
        this.FilterInvoicesList.forEach(user => {
            udt.data.push({
                A: user.InvoiceCode,
                B: user.SupplierName,
                C: user.WorkFlowStatusId
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
                if (this.FilterInvoicesList.length > 0) {
                    //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

                    this.exportColumns = this.invoicesListCols.map((col) => ({
                        title: col.header,
                        dataKey: col.field,
                    }));

                    //Remove Action Column
                    this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                    const doc = new jsPDF('p', 'pt');
                    doc['autoTable'](this.SelexportColumns, this.FilterInvoicesList);
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

}