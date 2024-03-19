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
import { ActivatedRoute, Router,ParamMap } from '@angular/router';
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

@Component({
    selector: 'app-supplier-invoice',
    templateUrl: './supplier-invoice.component.html',
    styleUrls: ['./supplier-invoice.component.css'],
    providers: [SupplierInvoiceService, POCreationService, TaxService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class SupplierInvoiceComponent implements OnInit, OnChanges {
    InvoiceId: any;
    InvoiceTypeId: any;
    PoTypeId:any;

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
    InvoiceForm: FormGroup;
    selectedInvoiceDetails: InvoiceDetails;
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
    showfilters:boolean=true;
    showfilterstext:string="Hide List" ;
    public screenWidth: any;
    schedulerNoDetails: SchedulerNo[] = [];
    constructor(private invoiceReqObj: SupplierInvoiceService,
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
        this.sharedServiceObj.deliveryAddress$.subscribe((data) => {
            this.InvoiceForm.patchValue({
                "DeliveryAddress": data,
            });
            this.defaultDeliveryAddress = data;
        });

        this.sinvFilterInfoForm = this.formBuilderObj.group({
            SInvCode: [''],
            SupplierCategory: [''],
            Status: [0],
            FromDate: [],
            ToDate: [],
            PoTypeId: [0],
            PoNumber: ['']
        });
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


    ngOnInit() {
        //path: 'supplierinvoicelist/:type/:InvoiceId/:InvoideTypeId/:PoTypeId',
        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            if (param.get('type') != undefined) {
                this.requestType = param.get('type');
            }
            if (param.get('InvoiceId') != undefined) {
                this.InvoiceId = param.get('InvoiceId');
            }
            if (param.get('InvoiceTypeId') != undefined) {
                this.InvoiceTypeId = param.get('InvoiceTypeId');
            }
            if (param.get('PoTypeId') != undefined) {
                this.PoTypeId = param.get('PoTypeId');
            }
            //alert("Request Type : " +  this.requestType + " \n Invoice Id : " + this.InvoiceId + " \n Invoice Type : " + this.InvoiceTypeId + " \n Po Type Id : " + this.PoTypeId);

        });

        
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
        this.invoicePagerConfig.RecordsToFetch = 10;
        this.InvoiceItemsGridConfig = new PagerConfig();
        this.InvoiceItemsGridConfig.RecordsToFetch = 20;
        this.selectedInvoiceDetails = new InvoiceDetails();
        this.InvoiceForm = this.formBuilderObj.group({
            'InvoiceId': [0],
            'InvoiceCode': [""],
            'SupplierTypeID': [1, { validators: [Validators.required] }],
            'PurchaseOrderId': [0],
            'PurchaseOrderTypeId': [1],
            'POTypeId': [0],
            'LocationId': [0, [Validators.required]],
            'Supplier': [0, [Validators.required]],
            'CurrencyId': [0, [Validators.required]],
            'SupplierAddress': [""],
            'DeliveryAddress': ["", [Validators.required]],
            'ShippingFax': [{ value: "", disabled: true }],
            'InvoiceItems': this.formBuilderObj.array([]),
            'Discount': [0],
            'TaxId': [0],
            'TaxRate': [0],
            'TotalTax': [0],
            'OtherCharges': [0],
            'ShippingCharges': [0],
            'SubTotal': [0],
            'Adjustment': [0, [Validators.max(0.99)]],
            'TotalAmount': [0],
            'NetTotal': [0],
            'PaymentTermId': [0, [Validators.required]],
            'PaymentTerms': [{ value: "", disabled: true }],
            'InvoiceDescription': ["", { validators: [Validators.required, this.noWhitespaceValidator] }],
            'GSTAdjustment': [0, [Validators.max(0.99)]],
            'WorkFlowStatusId': [0],
            'Reasons': [""],
            'SupplierRefNo': ["", { validators: [Validators.required, this.noWhitespaceValidator] }],
            'InvoiceDate': [new Date(), [Validators.required]],
            'DueDate': [new Date()],
            'IsPOC': ["2"],
            'SelectedPOs': [],
            'selectedGrns': [],
            'SelectedCPOs': [],
            'Remarks': [""],
            'SupplierInvoiceGRNDetails': this.formBuilderObj.array([]),
            'Checked': 0,
            'SupplierSubCodeId': [],
            'RemarksInvoice': [""],
            'PriceSubTotal': [0],
            'TotalbefTaxSubTotal': [0],
            'SchedulerId': [{ value: 0 }]
        });
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
        this.setColumns();
        this.getAccountTypes(this.companyId);
        // this.getAccountCodeCategories(this.companyId);
        this.sharedServiceObj.IsCompanyChanged$
            .subscribe((data) => {
                this.isCompanyChanged = data;
                if (this.isCompanyChanged) {
                    if (!this.isApprovalPage) {
                        this.getInvoices(0, invoiceId);
                    }
                    else {
                        this.getInvoicesForApprovals(0, invoiceId);
                    }
                    this.sharedServiceObj.updateCompany(false);
                }
            });
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                if (!this.isApprovalPage) {
                    this.getInvoices(0, invoiceId);
                }
                else {
                    this.getInvoicesForApprovals(0, invoiceId);
                }
            });


        this.activatedRoute.paramMap.subscribe((data) => {
            this.navigateToPage();
        });
        this.activatedRoute.queryParamMap.subscribe((data) => {
            if (this.activatedRoute.snapshot.queryParamMap.get('code') != null || Number(this.activatedRoute.snapshot.queryParamMap.get('id')) > 0) {
                this.navigateToPage();
            }
        });
        this.GlcodeInfoForm.reset();
        
         this.screenWidth = window.innerWidth-180;
          this.showfilters =true;
             this.showfilterstext="Hide List" ;

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

                this.InvoiceForm.patchValue({
                    "DeliveryAddress": this.deliveryAddress,
                });
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
                        if (this.selectedInvoiceTypeId == 2) {
                            this.onRecordSelection(this.invoiceIdGl, this.InvoiceTypeIdgl, 0);
                        }
                        else {
                            this.onRecordSelection(this.invoiceIdGl, this.InvoiceTypeIdgl, this.potypeidGl);
                        }
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
        this.requestType = this.activatedRoute.snapshot.params.type;
        this.requestSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');
        let invoiceId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
        this.isFilterApplied = false;
        this.InvoiceSearchKey = "";
        if (this.activatedRoute.snapshot.params.type == "request") {//if it is "Supplier Invoice request 
            this.moduleHeading = "Supplier Invoice Form";
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

    setColumns() {
        this.gridColumns = [];
        this.grnGridColumns = [];
        this.cpoGridColumns = [];
        if (this.selectedInvoiceTypeId == 1) {
            if (this.purchaseOrderTypeId === 5 || this.purchaseOrderTypeId === 6) {
                if (this.selectedInvoiceDetails.WorkFlowStatus == 'Open' && this.verifyPermission) {
                    this.gridColumns = [
                        { field: 'Sno', header: 'S.no.', width: '5%' },
                        { field: 'ItemCategory', header: 'Item Category', width: '20%' },
                        { field: 'ItemType', header: 'Item Type', width: '20%' },
                        { field: 'CPONumber', header: 'POC ID', width: '20%' },
                        { field: 'ItemDescription', header: 'Description', width: '30%' },
                        { field: 'Unitprice', header: 'Price', width: '25%' },
                        { field: '', header: 'Edit', width: '10%' }
                        // { field: 'ItemTotal', header: 'Total', width:'20%' }        
                    ];
                }
                else {
                    this.gridColumns = [
                        { field: 'Sno', header: 'S.no.', width: '5%' },
                        { field: 'ItemCategory', header: 'Item Category', width: '20%' },
                        { field: 'ItemType', header: 'Item Type', width: '20%' },
                        { field: 'CPONumber', header: 'POC ID', width: '20%' },
                        { field: 'ItemDescription', header: 'Description', width: '30%' },
                        { field: 'Unitprice', header: 'Price', width: '25%' }
                    ];
                }
            }
            else {
                if (this.selectedInvoiceDetails.WorkFlowStatus == 'Open' && this.verifyPermission) {
                    this.gridColumns = [
                        { field: 'Sno', header: 'S.no.', width: '70px' },
                        { field: 'ItemType', header: 'Item Type', width: '100px' },
                        { field: 'GlDescription', header: 'Name (GLCode)', width: '150px' },
                        { field: 'ItemDescription', header: 'Description', width: '150px' },
                        { field: 'ItemQty', header: 'Qty', width: '100px' },
                        { field: 'Unitprice', header: 'Price', width: '150px' },
                        { field: 'Totalprice', header: 'Total Price', width: '150px' },
                        { field: 'Discount', header: 'Discount', width: '150px' },
                        { field: 'TotalbefTax', header: 'Total bef Tax', width: '150px' },
                        { field: 'TaxGroup', header: 'Tax Group', width: '100px' },
                        { field: 'GstType', header: 'Gst Type', width: '100px' },
                        { field: 'GstAmount', header: 'Gst Amount', width: '150px' },
                        { field: 'ItemTotal', header: 'LineTotal', width: '150px' },
                        { field: '', header: 'Edit', width: '100px' }
                    ];
                }
                else {
                    this.gridColumns = [
                        { field: 'Sno', header: 'S.no.', width: '70px' },
                        { field: 'ItemType', header: 'Item Type', width: '100px' },
                        { field: 'GlDescription', header: 'Name (GLCode)', width: '150px' },
                        { field: 'ItemDescription', header: 'Description', width: '150px' },
                        { field: 'ItemQty', header: 'Qty', width: '100px' },
                        { field: 'Unitprice', header: 'Price', width: '150px' },
                        { field: 'Totalprice', header: 'Total Price', width: '150px' },
                        { field: 'Discount', header: 'Discount', width: '150px' },
                        { field: 'TotalbefTax', header: 'Total bef Tax', width: '150px' },
                        { field: 'TaxGroup', header: 'Tax Group', width: '100px' },
                        { field: 'GstType', header: 'Gst Type', width: '100px' },
                        { field: 'GstAmount', header: 'Gst Amount', width: '150px' },
                        { field: 'ItemTotal', header: 'LineTotal', width: '150px' }
                    ];
                }
            }
        }
        else {
            if (this.selectedInvoiceDetails.WorkFlowStatus == 'Open' && this.verifyPermission) {
                this.gridColumns = [
                    { field: 'Sno', header: 'S.no.', width: '70px' },
                    { field: 'TypeId', header: 'Type', width: '100px' },
                    { field: 'Name', header: 'Name (GLCode)', width: '150px' },
                    { field: 'ItemDescription', header: 'Description', width: '150px' },
                    { field: 'ItemQty', header: 'Qty', width: '100px' },
                    { field: 'Unitprice', header: 'Price', width: '150px' },
                    { field: 'Totalprice', header: 'Total Price', width: '150px' },
                    { field: 'Discount', header: 'Discount', width: '150px' },
                    { field: 'TotalbefTax', header: 'Total bef Tax', width: '150px' },
                    { field: 'TaxGroup', header: 'Tax Group', width: '100px' },
                    { field: 'GstType', header: 'Gst Type', width: '100px' },
                    { field: 'GstAmount', header: 'Gst Amount', width: '150px' },
                    { field: 'ItemTotal', header: 'LineTotal', width: '150px' },
                    { field: '', header: 'Edit', width: '100px' }
                ];
            }
            else {
                this.gridColumns = [
                    { field: 'Sno', header: 'S.no.', width: '70px' },
                    { field: 'TypeId', header: 'Type', width: '150px' },
                    { field: 'Name', header: 'Name (GLCode)', width: '150px' },
                    { field: 'ItemDescription', header: 'Description', width: '150px' },
                    { field: 'ItemQty', header: 'Qty', width: '150px' },
                    { field: 'Unitprice', header: 'Price', width: '150px' },
                    { field: 'Totalprice', header: 'Total Price', width: '150px' },
                    { field: 'Discount', header: 'Discount', width: '150px' },
                    { field: 'TotalbefTax', header: 'Total bef Tax', width: '150px' },
                    { field: 'TaxGroup', header: 'Tax Group', width: '150px' },
                    { field: 'GstType', header: 'Gst Type', width: '150px' },
                    { field: 'GstAmount', header: 'Gst Amount', width: '150px' },
                    { field: 'ItemTotal', header: 'LineTotal', width: '150px' }
                ];
            }
        }

        this.grnGridColumns = [
            { field: '', header: '' },
            { field: 'PONo.', header: 'PO No.' },
            { field: 'GRNNumber', header: 'GRN Number' },
            { field: 'SupplierDoNumber', header: 'Supplier Do Number' }
        ];


        this.cpoGridColumns = [
            { field: '', header: '' },
            { field: 'CPONo', header: 'CPO No.' },
            { field: 'CPONumber', header: 'POC Id' },
            { field: 'PODate', header: 'POC Date' }
        ];

        this.accrualgridColumns = [
            { field: '', header: 'Title' },
            { field: 'AccountCode', header: 'Account Code' },
            { field: 'Amount', header: 'Amount' }
        ];

    }
    //this method is used to format the content to be display in the autocomplete textbox after selection..
    //supplierInputFormater = (x: Suppliers) => x.SupplierName;    
    supplierInputFormater = (x: Suppliers) => (x.WorkFlowStatus === "Approved" && !x.IsFreezed) ? x.SupplierName : "";
    InvoiceFormater = (x: InvoiceList) => x.InvoiceCode;
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
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

    poInputFormatter = (x: PurchaseOrderList) => x.PurchaseOrderCode;
    poSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {

                if (term == "") {
                    let isPOC = this.InvoiceForm.get('IsPOC').value;
                    this.resetForm();
                    this.goodsReceivedNotesList = [];
                    this.goodsReceivedNotesList.length = 0;
                    this.InvoiceForm.get('IsPOC').setValue(isPOC);
                    return of([]);
                }
                return this.sharedServiceObj.getAllSearchPurchaseOrders({
                    Search: term,
                    //SupplierId:0,                       
                    SupplierId: this.InvoiceForm.get('Supplier').value == null ? 0 : this.InvoiceForm.get('Supplier').value.SupplierId,
                    companyId: this.companyId,
                    UserId: this.userDetails.UserID,
                    IsPOC: this.InvoiceForm.get('IsPOC').value == "1" ? true : false,
                    From: "SUPPLIERINVOICE",//this is used to avoid getting po whose status is void...
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

    resetForm() {
        //resetting the purchase order form..
        this.InvoiceForm.reset();
        this.InvoiceForm.setErrors(null);
        let sleectedSupplier = this.InvoiceForm.get('Supplier').value;
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        this.InvoiceForm.patchValue({
            SupplierTypeID: "2",
            IsPOC: "2",
            PurchaseOrderTypeId: 1,
            Supplier: sleectedSupplier,
            SchedulerId: 0
        });
    }




    getAllPoDetails() {

        let poDisplayInput = {
            //Search:term,
            SupplierId: this.poSupplierId,
            // SupplierId:this.InvoiceForm.get('Supplier').value==null?0:this.InvoiceForm.get('Supplier').value.SupplierId,
            companyId: this.companyId,
            UserId: this.userDetails.UserID,
            POTypeId: this.PurchaseOrderTypeIds,//this.InvoiceForm.get('PurchaseOrderTypeId').value,
            IsPOC: this.InvoiceForm.get('IsPOC').value == "1" ? true : false,
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

    getPoType() {
        this.pocreationObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                if (this.InvoiceForm.get('IsPOC').value == 2) {
                    this.purchaseOrderTypesList = data.filter(data => data.PurchaseOrderTypeId != PurchaseOrderType.ContractPoFixed &&
                        data.PurchaseOrderTypeId != PurchaseOrderType.ContractPoVariable && data.PurchaseOrderTypeId != PurchaseOrderType.ProjectPo);
                    this.PurchaseOrderTypeIds = PurchaseOrderType.InventoryPo;
                }
                else {
                    this.purchaseOrderTypesList = data.filter(data => data.PurchaseOrderTypeId != PurchaseOrderType.InventoryPo && data.PurchaseOrderTypeId != PurchaseOrderType.FixedAssetPo
                        && data.PurchaseOrderTypeId != PurchaseOrderType.ExpensePo && data.PurchaseOrderTypeId != PurchaseOrderType.ProjectPo);
                    this.PurchaseOrderTypeIds = PurchaseOrderType.ContractPoFixed;
                }
            });
    }

    onPoTypeChange() {
        let poTypeId = this.InvoiceForm.get('PurchaseOrderTypeId').value;
        this.onResetAll(this.poList);
        this.PurchaseOrderTypeIds = poTypeId;
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        this.SelectedPOs = [];
        this.SelectedPOs.length = 0;
        this.selectedGrns = [];
        this.selectedGrns.length = 0;
        if (this.poSupplierId != null || this.poSupplierId != undefined) {
            this.getAllPoDetails();
            this.isNewRecord = false;
            this.isCPORecord = false;
        }
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


    addGRNGridItem(noOfLines: number) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['SupplierInvoiceGRNDetails'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGRNGridRows());
        }
    }

    initGRNGridRows() {
        return this.formBuilderObj.group({
            'Checked': [false],
            'goodsReceivedNotes': [],
            'contractPOCList': []
        });
    }

    cpoSelection(poRecord: any) {
        this.IsGstBeforeDiscount = false;
        this.invoiceReqObj.getGoodsReceivedNotes(poRecord.PurchaseOrderId, poRecord.POTypeId, this.companyId)
            .subscribe((data: { goodsReceivedNotes: Array<GoodsReceivedNotes>, contractPOCList: Array<ContractPurchaseOrder>, purchaseOrderDetails: any }) => {
                this.resetForm();
                this.goodsReceivedNotesList = [];
                this.purchaseOrderTypeId = 0;
                this.goodsReceivedNotesList.length = 0;
                this.goodsReceivedNotesList.push({
                    label: "",
                    value: null,
                    disabled: true
                })

                if (poRecord.POTypeId == PurchaseOrderType.ContractPoFixed || poRecord.POTypeId == PurchaseOrderType.ContractPoVariable) {
                    this.TaxGroupId = data.purchaseOrderDetails.TaxGroupId;
                    data.contractPOCList.forEach(data => {
                        this.goodsReceivedNotesList.push({
                            label: data.CPONumber,
                            value: data,
                            disabled: false
                        });
                    });
                }

                this.purchaseOrderTypeId = poRecord.POTypeId;
                this.isNewRecord = true;
                this.poTypeId = poRecord.POTypeId;
                this.poId = poRecord.PurchaseOrderId;
                this.purchaseOrderCode = poRecord.PurchaseOrderCode;

                if (poRecord.POTypeId == PurchaseOrderType.ContractPoFixed || poRecord.POTypeId == PurchaseOrderType.ContractPoVariable) {
                    this.setColumns();
                    this.title = "POC list";
                    this.purchaseOrderDetails = this.setContractPurchaseOrderDetails(data.purchaseOrderDetails, poRecord.POTypeId);

                }

                if (this.purchaseOrderDetails.InvoiceItems != undefined) {
                    this.addGridItem(this.purchaseOrderDetails.InvoiceItems.length, this.purchaseOrderDetails);
                }

                this.InvoiceForm.patchValue(this.purchaseOrderDetails);
                this.InvoiceForm.get('SupplierTypeID').setValue(this.purchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "1" : "2");
                this.InvoiceForm.get('IsPOC').setValue(this.purchaseOrderDetails.POTypeId === 5 || this.purchaseOrderDetails.POTypeId === 6 ? "1" : "2");
                this.InvoiceForm.get('SupplierRefNo').setValue(this.purchaseOrderDetails.VendorReferences);
                this.IsGstBeforeDiscount = this.purchaseOrderDetails.IsGstBeforeDiscount;
                this.calculateTotalPrice();
                console.log(this.purchaseOrderDetails);
                if (poRecord.POTypeId == PurchaseOrderType.ContractPoFixed || poRecord.POTypeId == PurchaseOrderType.ContractPoVariable) {
                    this.InvoiceForm.get('TaxId').setValue(0);
                }
            });
    }

    poSelection(poRecord: any) {
        let isCheck: boolean;
        this.SelectedPOs = poRecord;
        let poid = ""; let lastPoid = 0; var selectedPotext = "";
        poRecord.forEach(element => {
            poid += element.PurchaseOrderId + ",";
            lastPoid = element.PurchaseOrderId
        });
        poid = poid.slice(0, -1);

        if (poid != "") {
            this.IsGstBeforeDiscount = false;
            this.invoiceReqObj.getGoodsReceivedNotes(poid, poRecord[0].POTypeId, this.companyId)
                .subscribe((data: { goodsReceivedNotes: Array<GoodsReceivedNotes>, contractPOCList: Array<ContractPurchaseOrder>, purchaseOrderDetails: any }) => {
                    this.resetForm();
                    // if(this.goodsReceivedNotesList.length==0)
                    // {
                    this.goodsReceivedNotesList = [];
                    this.goodsReceivedNotesList.length = 0;
                    // this.goodsReceivedNotesList.push({
                    //     label:"",
                    //     value:null,
                    //     disabled:true
                    // });  

                    //}

                    this.purchaseOrderTypeId = 0;
                    let itemGroupControl = <FormArray>this.InvoiceForm.controls['SupplierInvoiceGRNDetails'];
                    itemGroupControl.controls = [];
                    itemGroupControl.controls.length = 0;

                    if (poRecord[0].POTypeId == PurchaseOrderType.ContractPoFixed || poRecord[0].POTypeId == PurchaseOrderType.ContractPoVariable) {
                        // this.addGRNGridItem(data.contractPOCList.length);
                        // // data.goodsReceivedNotes.forEach(data=>{ 
                        //     itemGroupControl.controls[0].patchValue({
                        //         contractPOCList:data.contractPOCList
                        //     });

                        //     let itemGroupControl1 = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
                        //     console.log(itemGroupControl1);
                        //     for(let i=0 ; i < itemGroupControl1.length; i++)
                        //     {

                        //     }

                        data.contractPOCList.forEach(data => {
                            this.goodsReceivedNotesList.push({
                                label: data.CPONumber,
                                value: data,
                                disabled: false
                            });
                        });
                    }
                    else {
                        console.log(data.goodsReceivedNotes);
                        if (data.goodsReceivedNotes.length > 0) {
                            this.addGRNGridItem(data.goodsReceivedNotes.length);
                            // data.goodsReceivedNotes.forEach(data=>{ 
                            itemGroupControl.controls[0].patchValue({
                                goodsReceivedNotes: data.goodsReceivedNotes
                            });
                        }
                        // this.InvoiceForm.controls['SupplierInvoiceGRNDetails'].patchValue({
                        //     goodsReceivedNotes:data.goodsReceivedNotes
                        // });

                        //  this.InvoiceForm.patchValue({                        
                        //     goodsReceivedNotes:data.goodsReceivedNotes

                        //  });
                        //  data.goodsReceivedNotes.forEach(data=>{   
                        //     this.goodsReceivedNotesList.push({
                        //         label:data.GRNCode,
                        //         value:data,
                        //         disabled:false
                        //     });
                        //  });





                        // if(this.goodsReceivedNotesList.length > 0)
                        // {
                        //     for(let i=0;i < data.goodsReceivedNotes.length;i++){
                        //         if(data.goodsReceivedNotes[i].GRNCode == this.selectedGrns[i].GRNCode){
                        //             itemGroupControl.controls[i].get('Checked').setValue(true);   
                        //         }
                        //     }
                        // }






                    }
                    this.purchaseOrderTypeId = poRecord[0].POTypeId;
                    this.poTypeId = poRecord[0].POTypeId;
                    this.poId = poid;//poRecord[0].PurchaseOrderId;

                    this.purchaseOrderCode = poRecord[0].PurchaseOrderCode;


                    if (poRecord[0].POTypeId == PurchaseOrderType.InventoryPo) {
                        this.isNewRecord = true;
                        this.isCPORecord = false;
                        this.setColumns();
                        this.title = "Goods Received Notes";
                        this.purchaseOrderDetails = this.setStandardPurchaseOrderDetails(data.purchaseOrderDetails, poRecord[0].POTypeId);
                    }
                    else if (poRecord[0].POTypeId == PurchaseOrderType.FixedAssetPo)//for fixed asset purchase order
                    {
                        this.isNewRecord = true;
                        this.isCPORecord = false;
                        this.setColumns();
                        this.title = "Goods Received Notes";
                        this.purchaseOrderDetails = this.setAssetPurchaseOrderDetails(data.purchaseOrderDetails, poRecord[0].POTypeId);

                    }
                    else if (poRecord[0].POTypeId == PurchaseOrderType.ContractPoFixed || poRecord[0].POTypeId == PurchaseOrderType.ContractPoVariable) {
                        this.isNewRecord = false;
                        // this.isCPORecord=true;
                        this.setColumns();

                        this.title = "POC list";

                        this.purchaseOrderDetails = this.setContractPurchaseOrderDetails(data.purchaseOrderDetails, poRecord[0].POTypeId);

                    }
                    else if (poRecord[0].POTypeId == PurchaseOrderType.ExpensePo) {
                        this.isNewRecord = true;
                        this.isCPORecord = false;
                        this.setColumns();
                        this.title = "Goods Received Notes";
                        this.purchaseOrderDetails = this.setExpensePurchaseOrderDetails(data.purchaseOrderDetails, poRecord[0].POTypeId);
                    }

                    if (this.purchaseOrderDetails.InvoiceItems != undefined) {
                        this.addGridItem(this.purchaseOrderDetails.InvoiceItems.length, this.purchaseOrderDetails);
                    }

                    this.InvoiceForm.patchValue(this.purchaseOrderDetails);
                    if (this.selectedInvoiceTypeId == 1) {
                        this.InvoiceForm.get('PurchaseOrderTypeId').setValue(this.PurchaseOrderTypeIds);
                    }
                    this.InvoiceForm.get('SupplierTypeID').setValue(this.purchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "1" : "2");
                    this.InvoiceForm.get('IsPOC').setValue(this.purchaseOrderDetails.POTypeId === 5 || this.purchaseOrderDetails.POTypeId === 6 ? "1" : "2");
                    this.InvoiceForm.get('SupplierRefNo').setValue(this.purchaseOrderDetails.VendorReferences);
                    this.IsGstBeforeDiscount = this.purchaseOrderDetails.IsGstBeforeDiscount;

                    if (this.selectedGrns.length > 0) {
                        let selectedGrns3 = this.selectedGrns;
                        this.selectedGrns = [];
                        this.selectedGrns.length = 0;
                        for (let s = 0; s < selectedGrns3.length; s++) {
                            let aa = data.goodsReceivedNotes.filter(i => i.GRNCode == selectedGrns3[s].GRNCode);

                            if (aa.length > 0) {
                                for (let m = 0; m < data.goodsReceivedNotes.length; m++) {

                                    if (data.goodsReceivedNotes[m].GRNCode == aa[0].GRNCode) {
                                        itemGroupControl.controls[m].get('Checked').setValue(true);
                                        this.onGRNSelection(true, aa[0]);
                                    }
                                }
                            }
                        }
                    }



                    // if(this.selectedGrns.length > 0)
                    // {
                    //     for(let s=0;s<data.goodsReceivedNotes.length;s++){
                    //         let aa=this.selectedGrns.filter(i=>i.GRNCode==data.goodsReceivedNotes[s].GRNCode);
                    //         if(aa.length >0)
                    //         {
                    //             for(let m=0;m < data.goodsReceivedNotes.length;m++){
                    //                 if(data.goodsReceivedNotes[m].GRNCode==aa[0].GRNCode){
                    //                     itemGroupControl.controls[m].get('Checked').setValue(true);
                    //                     this.onGRNSelection(true,aa[0]);
                    //                 }
                    //             }
                    //         }
                    //     }
                    // }  
                    // if(this.SelectedCPOs.length > 0)
                    // {
                    //     let SelectedCPOs3= this.SelectedCPOs;
                    //     this.SelectedCPOs=[];
                    //     this.SelectedCPOs.length=0;
                    //     for(let s=0;s<data.contractPOCList.length;s++){
                    //          
                    //         let aa=SelectedCPOs3.filter(i=>i.CPONumber==data.contractPOCList[s].CPONumber);
                    //         if(aa.length >0)
                    //         {
                    //             for(let m=0;m < data.contractPOCList.length;m++){
                    //                  
                    //                 if(data.contractPOCList[m].CPONumber==aa[0].CPONumber){
                    //                     itemGroupControl.controls[m].get('Checked').setValue(true);
                    //                     this.onGRNSelection(true,aa[0]);
                    //                 }
                    //             }
                    //         }
                    //     }
                    // }  

                    this.calculateTotalPrice();
                    console.log("poselection", this.purchaseOrderDetails);
                });
        }
        else {
            this.isNewRecord = false;
            this.isCPORecord = false;
            this.SelectedPOs = [];
            this.SelectedPOs.length = 0;
            this.selectedGrns = [];
            this.selectedGrns.length = 0;
            let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
            itemGroupControl.controls = [];
            itemGroupControl.controls.length = 0;
        }
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


    onCPOSelection(grnItem: any) {
        let InvoiceItems = [];
        let subTotal = 0;
        let totalTax = 0;
        this.purchaseOrderDetails.InvoiceItems = [];
        this.invoiceItemDetails = [];
        let _TaxId: number = this.InvoiceForm.get('TaxId').value;
        let _taxId: number = this.getPOCTaxId(grnItem);
        if ((_TaxId != _taxId) && (_TaxId > 0 && _taxId > 0)) {
            this.CPOPMS['_results'].forEach(ds => {
                ds.value = null;
                ds.updateLabel();
                this.InvoiceForm.get('TaxId').setValue(0);
                this.confirmationServiceObj.confirm({
                    message: "POC's with Different Taxes cannot be selected",
                    header: "Tax Validation",
                    accept: () => {
                    },
                    rejectVisible: false,
                    acceptLabel: "Ok"
                });
                this.removeAllGridItems();
            });
        }
        else {
            if (this.purchaseOrderDetails.POTypeId == PurchaseOrderType.ContractPoFixed || this.purchaseOrderDetails.POTypeId == PurchaseOrderType.ContractPoVariable) {
                this.SelectedCPOs = grnItem;
                if (grnItem.length > 0) {
                    grnItem.forEach(rec => {
                        if (rec.ContractPurchaseOrderItems != null) {
                            InvoiceItems = rec.ContractPurchaseOrderItems.map(data => {

                                return {
                                    RecordId: data.CPOItemid,
                                    InvoiceItemId: 0,
                                    ItemDescription: data.Description,
                                    GlDescription: data.Description,
                                    ItemQty: 1,
                                    Unitprice: data.Amount,
                                    IsModified: false,
                                    CPONumber: data.CPONumber,
                                    ItemType: data.AccountCode,//"Expense",
                                    CPOItemid: data.CPOItemid,
                                    CPOID: data.CPOID,
                                    TaxGroupId: this.TaxGroupId,
                                    //TaxTotal:data.TotalTax,
                                    TaxAmount: data.TaxAmount,
                                    TaxID: data.TaxID,
                                    AccountType: data.AccountType,
                                    AccountCodeName: data.AccountCodeName,
                                    AccountCode: data.AccountCodeId.toString(),
                                    PurchaseOrderId: data.CPOID,
                                    WorkFlowStatusId: data.WorkFlowStatusId
                                };
                            });
                            InvoiceItems.forEach(rec => {
                                let existItem = this.purchaseOrderDetails.InvoiceItems.filter(j => j.RecordId === rec.RecordId && j.CPONumber === rec.CPONumber)[0];
                                if (existItem === undefined) {
                                    this.purchaseOrderDetails.InvoiceItems.push(rec);
                                    this.invoiceItemDetails.push(rec);
                                }
                            });
                        }

                    });

                }

                let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
                itemGroupControl.controls = [];
                itemGroupControl.controls.length = 0;

                if (this.purchaseOrderDetails.InvoiceItems != undefined) {
                    this.addGridItem(this.purchaseOrderDetails.InvoiceItems.length, this.purchaseOrderDetails);
                }

                this.InvoiceForm.patchValue(this.purchaseOrderDetails);
                this.InvoiceForm.get('SupplierAddress').setValue(grnItem[0].SupplierAddress);
                this.InvoiceForm.get('SupplierTypeID').setValue(this.purchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "1" : "2");

                //setting sub total  
                let _taxId = 0;
                this.purchaseOrderDetails.InvoiceItems.forEach(rec => {
                    _taxId = rec.TaxID;
                    subTotal += rec.Unitprice;
                    totalTax += (rec.Unitprice * rec.TaxAmount / 100);
                });

                this.InvoiceForm.get('SubTotal').setValue(subTotal);
                this.InvoiceForm.get('TotalTax').setValue(totalTax);
                this.InvoiceForm.get('NetTotal').setValue(subTotal + this.InvoiceForm.get('TotalTax').value);
                this.InvoiceForm.get('TotalAmount').setValue(subTotal + this.InvoiceForm.get('TotalTax').value);
                this.sumSubtotal = (this.purchaseOrderDetails.Margin != undefined) ? subTotal + this.purchaseOrderDetails.Margin : subTotal;
                console.log(this.InvoiceForm.value);
                console.log(this.purchaseOrderDetails.InvoiceItems);
                this.OldTotalAmount = this.InvoiceForm.get('NetTotal').value;
                this.POSubtotal = this.sumSubtotal + 0.05;
                this.InvoiceForm.get('TaxId').setValue(_taxId);
            }
        }
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


    onGRNSelection(event, grnItem1: any) {
        let InvoiceItems = [];
        this.subTotal = 0;
        let grnItem = [];
        this.purchaseOrderDetails.InvoiceItems = [];
        this.invoiceItemDetails = [];
        if (this.purchaseOrderDetails.POTypeId == PurchaseOrderType.ContractPoFixed || this.purchaseOrderDetails.POTypeId == PurchaseOrderType.ContractPoVariable) {
            if (this.SelectedCPOs.length >= 1) {
                if (event == true) {
                    let SelectedCPOs2 = this.SelectedCPOs;
                    grnItem = SelectedCPOs2;
                    grnItem.push(grnItem1);
                    // this.SelectedCPOs.push(grnItem1);
                }
                else if (event == false) {
                    for (let i = 0; i < this.SelectedCPOs.length; i++) {
                        if (this.SelectedCPOs[i].CPONumber != grnItem1.CPONumber) {
                            grnItem.push(this.SelectedCPOs[i]);
                        }
                    }
                    this.SelectedCPOs = [];
                    this.SelectedCPOs.length = 0;
                    this.SelectedCPOs = grnItem;
                }
            }
            else {
                grnItem.push(grnItem1);
                this.SelectedCPOs = grnItem;
            }


            if (grnItem.length > 0) {
                grnItem.forEach(rec => {
                    if (rec.ContractPurchaseOrderItems != null) {
                        InvoiceItems = rec.ContractPurchaseOrderItems.map(data => {
                            return {
                                RecordId: data.CPOItemid,
                                InvoiceItemId: 0,
                                ItemDescription: data.Description,
                                GlDescription: data.item.Itemname,
                                ItemQty: 1,
                                Unitprice: data.Amount,
                                IsModified: false,
                                CPONumber: data.CPONumber,
                                ItemType: "Expense",
                                CPOItemid: data.CPOItemid,
                                CPOID: data.CPOID,
                                //  TaxGroupId: data.TaxGroupId,
                                //TaxTotal:data.TotalTax,
                                TaxAmount: data.TaxAmount,
                                TaxID: data.TaxID
                            };
                        });
                        InvoiceItems.forEach(rec => {
                            let existItem = this.purchaseOrderDetails.InvoiceItems.filter(j => j.RecordId === rec.RecordId && j.CPONumber === rec.CPONumber)[0];
                            if (existItem === undefined) {
                                this.purchaseOrderDetails.InvoiceItems.push(rec);

                                this.invoiceItemDetails.push(rec);
                            }
                        });
                    }
                });
            }

            let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
            itemGroupControl.controls = [];
            itemGroupControl.controls.length = 0;

            if (this.purchaseOrderDetails.InvoiceItems != undefined) {
                this.addGridItem(this.purchaseOrderDetails.InvoiceItems.length, this.purchaseOrderDetails);
            }

            this.InvoiceForm.patchValue(this.purchaseOrderDetails);
            this.InvoiceForm.get('SupplierTypeID').setValue(this.purchaseOrderDetails.Supplier.SupplierTypeID == 1 ? "1" : "2");

            //setting sub total    
            this.purchaseOrderDetails.InvoiceItems.forEach(rec => {
                this.subTotal += rec.Unitprice;

            });

            this.InvoiceForm.get('SubTotal').setValue(this.subTotal);
            this.InvoiceForm.get('NetTotal').setValue(this.subTotal + this.InvoiceForm.get('TotalTax').value);
            this.sumSubtotal = (this.purchaseOrderDetails.Margin != undefined) ? this.purchaseOrderDetails.TenureAmount + this.purchaseOrderDetails.Margin : this.purchaseOrderDetails.TenureAmount;
            this.POSubtotal = this.sumSubtotal + 0.05;
        }
        else {

            let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
            // if(event!=null)
            // {                     
            //     this.selectedGrns = grnItem;
            // }
            let itemType = "";
            let percentage = 0.0;
            let discount = 0.0;
            if (event == true) {
                if (this.selectedGrns.length >= 1) {
                    let selectedGrns2 = this.selectedGrns;
                    grnItem.push(grnItem1);
                    grnItem = (selectedGrns2);
                    this.selectedGrns.push(grnItem1);
                }
                else {
                    grnItem.push(grnItem1);
                    this.selectedGrns = grnItem;
                }


                if (grnItem.length > 0) {          //console.log("total grn",itemGroupControl,grnItem);   

                    for (let i = 0; i < itemGroupControl.length; i++) {
                        let count = 0;
                        let totalGrnQty = 0;
                        let PurchaseOrderId = 0;
                        let recordId = itemGroupControl.controls[i].get('RecordId').value;
                        grnItem.forEach(rec => {
                            rec.ItemsList.filter(j => j.RecordId == itemGroupControl.controls[i].get('RecordId').value)
                                .forEach(k => {
                                    totalGrnQty += k.GRNQty;
                                    PurchaseOrderId = rec.PurchaseOrderId;
                                    percentage = (totalGrnQty / k.OriginalQty) * 100;
                                    discount = k.Discount * percentage / 100;
                                    count = 1;
                                });
                        });
                        if (count == 1) {
                            itemGroupControl.controls[i].get('PurchaseOrderId').setValue(PurchaseOrderId);
                            itemGroupControl.controls[i].get('ItemQty').setValue(totalGrnQty);
                            itemGroupControl.controls[i].get('Discount').setValue(discount);
                        }
                        this.getTaxesByTaxGroup(itemGroupControl.controls[i].get('TaxGroupId').value, i);
                    }
                }
            }
            else if (event == false) {

                let aa = grnItem1.ItemsList[0].RecordId;
                let check = this.selectedGrns.findIndex(order => order.GRNCode === grnItem1.GRNCode);
                this.selectedGrns.splice(check, 1);
                grnItem = this.selectedGrns;
                // for (let i = 0; i < itemGroupControl.length; i++) {
                //     let totalGrnQty = 0;
                //     this.purchaseOrderDetails.InvoiceItems.filter(j => j.RecordId == itemGroupControl.controls[i].get('RecordId').value)
                //         .forEach(k => {
                //             totalGrnQty += k.ItemQty;
                //         });

                //     itemGroupControl.controls[i].get('ItemQty').setValue(totalGrnQty);
                //     this.getTaxesByTaxGroup(itemGroupControl.controls[i].get('TaxGroupId').value, i);
                // }


                for (let i = 0; i < itemGroupControl.length; i++) {
                    let count = 0;
                    let totalGrnQty = 0;
                    grnItem.forEach(rec => {

                        rec.ItemsList.filter(j => j.RecordId == itemGroupControl.controls[i].get('RecordId').value)
                            .forEach(k => {
                                totalGrnQty += k.GRNQty;
                                percentage = (totalGrnQty / k.OriginalQty) * 100;
                                discount = k.Discount * percentage / 100;
                                count = 1;
                            });

                    });
                    itemGroupControl.controls[i].get('ItemQty').setValue(totalGrnQty);
                    itemGroupControl.controls[i].get('Discount').setValue(discount);
                    this.getTaxesByTaxGroup(itemGroupControl.controls[i].get('TaxGroupId').value, i);
                }
            }
            //po total amount -sumSubtotal
            this.sumSubtotal = (this.purchaseOrderDetails.InvoiceLimit != undefined) ? this.purchaseOrderDetails.SubTotal + this.purchaseOrderDetails.InvoiceLimit : this.purchaseOrderDetails.SubTotal;
            this.POSubtotal = this.sumSubtotal + 0.05;
            this.calculateTotalPrice();
        }
        this.OldTotalAmount = this.InvoiceForm.get('NetTotal').value;
        this.InvoiceForm.get('SupplierAddress').setValue(grnItem1.SupplierAddress);

        //    $(".goodsreceived ul li").click(function(){       

        //         if ($(this).hasClass("ui-state-highlight")) {
        //            // alert("44");
        //             $(this).removeClass("ui-state-highlight");            

        //     }
        //     }); 





        //console.log(this.purchaseOrderDetails);
        //console.log("this.InvoiceForm",this.InvoiceForm,this.sumSubtotal,this.subTotal);


        //    alert("aa")   ;

        //     $(".goodsreceived").click(function(){
        //         alert("The paragraph was clicked.");
        //       });
    }
    getPaymentTerms() {
        this.sharedServiceObj.getPaymentTerms(this.sessionService.getCompanyId())
            .subscribe((data: PaymentTerm[]) => {
                this.paymentTerms = data;
            });
    }
    IsPOCTypeChange(event) {
        this.hideText = false;
        this.hideInput = true;
        this.isEdit = false;
        this.disableDelete = false;
        this.selectedInvoiceDetails = new InvoiceDetails();
        this.setColumns();
        this.poSupplierId = 0;
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        this.InvoiceForm.patchValue({
            SupplierTypeID: "2",
            PurchaseOrderTypeId: 1,
            Supplier: "",
            CurrencyId: DEFAULT_CURRENCY_ID,
        });
        this.sharedServiceObj.deliveryAddress$.subscribe((data) => {
            this.defaultDeliveryAddress = data;
        });
        this.getCompanyDetails(this.companyId);
        this.getPoType();
        this.onPoTypeChange();
        this.selectedGrns = [];
        this.selectedGrns.length = 0;
        this.SelectedCPOs = [];
        this.SelectedCPOs.length = 0;
        this.goodsReceivedNotesList = [];
        this.goodsReceivedNotesList.length = 0;
        this.isPORecord = false;
        this.isNewRecord = false;
        this.isCPORecord = false;
    }

    supplierTypeChange(event) {
        let InvoiceTypeId = event.target.value;
        let isPOC = this.InvoiceForm.get('IsPOC').value;
        this.InvoiceForm.reset();
        this.InvoiceForm.setErrors(null);
        this.InvoiceForm.get('Supplier').setValue(null);
        // this.sharedServiceObj.deliveryAddress$.subscribe((data)=>{
        //     this.defaultDeliveryAddress = data;
        // });
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        this.InvoiceForm.patchValue({
            SupplierTypeID: InvoiceTypeId,
            PurchaseOrderTypeId: this.PurchaseOrderTypeIds,
            CurrencyId: DEFAULT_CURRENCY_ID,
            IsPOC: isPOC
        });
        this.getCompanyDetails(this.companyId);
        this.selectedGrns = [];
        this.selectedGrns.length = 0;
        this.SelectedPOs = [];
        this.SelectedPOs.length = 0;
        this.onResetAll(this.poList);
        this.poSupplierId = null;
        this.isNewRecord = false;
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
                if (this.invoicesList.length > 0) {
                    this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                }
                else {
                    this.addRecord();
                }
            }, () => {
                this.showLeftPanelLoadingIcon = false;
            });
    }



    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(invoiceId: number, invoiceTypeId: number, poTypeId?: number) {
        this.split();
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.selectedInvoiceTypeId = 0;
        this.enableOnVerify = false;
        this.InvoiceForm.reset();
        this.InvoiceForm.setErrors(null);
        this.invoiceReqObj.getInvoiceDetails(invoiceId, invoiceTypeId, poTypeId, this.companyId)
            .subscribe((data: InvoiceDetails) => {
                this.changingValue.next(0);
                this.isSameUSer = (data.RequestedBy == userDetails.UserID) ? true : false;
                this.isApproverUser = (this.userDetails.UserID == data.CurrentApproverUserId) ? true : false;
                let total = 0;
                this.hideText = true;
                this.hideInput = false;
                if (data != null) {
                    this.InvoiceForm.get('SupplierAddress').setValue(data.SupplierAddress);
                    this.selectedInvoiceDetails = data;
                    this.OldTotalAmount = data.TotalAmount;
                    this.InvoiceCode = this.selectedInvoiceDetails.InvoiceCode;
                    this.purchaseOrderTypeId = this.selectedInvoiceDetails.POTypeId;
                    this.selectedInvoiceTypeId = this.selectedInvoiceDetails.InvoiceTypeId;
                    this.setColumns();
                    if (this.selectedInvoiceDetails.POTypeId == PurchaseOrderType.ContractPoFixed || this.selectedInvoiceDetails.POTypeId == PurchaseOrderType.ContractPoVariable) {
                        this.selectedInvoiceDetails.IsPOC = true;
                        this.selectedInvoiceDetails.InvoiceItems.forEach(rec => {
                            this.invoiceItemDetails.push(rec);
                        });
                    }
                    else {
                        this.selectedInvoiceDetails.IsPOC = false;
                    }


                    this.operation = GridOperations.Display;
                    // if (this.selectedInvoiceDetails.PurchaseOrderId > 0) {
                    //     this.selectedInvoiceTypeId = 1;
                    // }
                    // else {
                    //     this.selectedInvoiceTypeId = 2;
                    // }
                    if (this.selectedInvoiceDetails.SupplierSubCode != null) {
                        this.isSupplierSelected = true;
                    }
                    else {
                        this.isSupplierSelected = false;
                    }
                    this.accrualAccountCode = [];
                    // Anuj code backup Dt: 22/08/2019
                    if (this.selectedInvoiceDetails.CPOSelected != null) {
                        var sum = 0; let total = "";
                        let isEven = false;
                        let colorCode = "";
                        for (let i = 0; i < this.selectedInvoiceDetails.CPOSelected.length; i++) {
                            //Accrued
                            isEven = false;
                            let number = 0;
                            number = i + 1;
                            if (number % 2 == 0) {
                                isEven = true;
                            }
                            if (isEven) {
                                colorCode = "#fff5e6";
                            }
                            else {
                                colorCode = "#d3edff";
                            }

                            if (this.selectedInvoiceDetails.CPOSelected[i].WorkFlowStatusId == 16 || this.selectedInvoiceDetails.CPOSelected[i].WorkFlowStatusId == 11) {
                                this.accrualAccountCode.push({
                                    Name: "Item",
                                    AccountCodeName: this.selectedInvoiceDetails.CPOSelected[i].AccountCodeName,
                                    Amount: this.selectedInvoiceDetails.CPOSelected[i].Amount.toFixed(2),
                                    Color: colorCode
                                });
                                this.accrualAccountCode.push({
                                    Name: "Accrual",
                                    AccountCodeName: this.selectedInvoiceDetails.CPOSelected[i].AccrualCode,
                                    Amount: this.selectedInvoiceDetails.CPOSelected[i].Amount.toFixed(2),
                                    Color: colorCode
                                });
                                this.accrualAccountCode.push({
                                    Name: "Item Reversal",
                                    AccountCodeName: this.selectedInvoiceDetails.CPOSelected[i].AccountCodeName,
                                    Amount: "(" + this.selectedInvoiceDetails.CPOSelected[i].Amount.toFixed(2) + ")",
                                    Color: colorCode
                                });

                                sum += this.selectedInvoiceDetails.CPOSelected[i].Amount;
                            }
                            else {
                                //Non Accrued
                                this.accrualAccountCode.push({
                                    Name: "Item(Non Accrued)",
                                    AccountCodeName: this.selectedInvoiceDetails.CPOSelected[i].AccountCodeName,
                                    Amount: this.selectedInvoiceDetails.CPOSelected[i].Amount.toFixed(2),
                                    Color: colorCode
                                });
                                sum += this.selectedInvoiceDetails.CPOSelected[i].Amount;
                            }
                        }
                        total = sum.toFixed(2);
                        this.accrualAccountCode.push({
                            Name: "Reversal Total",
                            AccountCodeName: "AP",
                            Amount: "(" + total + ")",
                            Color: colorCode
                        });
                    }


                    //sreedhar
                    // if(this.selectedInvoiceDetails.CPOSelected !=null)
                    // {
                    //     var sum=0; let total="";
                    //     let isEven = false;
                    //     let colorCode = "";

                    //     for(let i=0; i< this.selectedInvoiceDetails.CPOSelected.length; i++)
                    //     {
                    //         //Accrued
                    //         let number = 0;                          
                    //         number=i+1;
                    //        if(number % 2 == 0){
                    //           isEven = true;
                    //        }        
                    //        if(isEven){
                    //         colorCode = "#fff5e6";
                    //        }   
                    //        else{
                    //         colorCode = "#d3edff";  
                    //        }       

                    //         if(this.selectedInvoiceDetails.CPOSelected[i].WorkFlowStatusId==16 || this.selectedInvoiceDetails.CPOSelected[i].WorkFlowStatusId==11)
                    //         {
                    //             this.accrualAccountCode.push({
                    //                 Name:"Item",
                    //                 AccountCodeName: this.selectedInvoiceDetails.CPOSelected[i].AccountCodeName,
                    //                 Amount:this.selectedInvoiceDetails.CPOSelected[i].Amount.toFixed(2),
                    //                 Color:colorCode
                    //             });
                    //             this.accrualAccountCode.push({
                    //                 Name:"Accrual",
                    //                 AccountCodeName: this.selectedInvoiceDetails.CPOSelected[i].AccrualCode,
                    //                 Amount: this.selectedInvoiceDetails.CPOSelected[i].Amount.toFixed(2),
                    //                 Color:colorCode
                    //             });
                    //             this.accrualAccountCode.push({
                    //                 Name:"Item Reversal",
                    //                 AccountCodeName: this.selectedInvoiceDetails.CPOSelected[i].AccountCodeName,
                    //                 Amount:"("+this.selectedInvoiceDetails.CPOSelected[i].Amount.toFixed(2)+")",
                    //                 Color:colorCode
                    //             });

                    //             isEven = false;

                    //             sum += this.selectedInvoiceDetails.CPOSelected[i].Amount;
                    //         }
                    //         else
                    //         {                              
                    //             //Non Accrued
                    //             this.accrualAccountCode.push({
                    //                 Name:"Item(Non Accrued)",
                    //                 AccountCodeName: this.selectedInvoiceDetails.CPOSelected[i].AccountCodeName,
                    //                 Amount:this.selectedInvoiceDetails.CPOSelected[i].Amount.toFixed(2),
                    //                 Color:colorCode
                    //             });
                    //             sum += this.selectedInvoiceDetails.CPOSelected[i].Amount;

                    //             isEven = false;
                    //         }                            
                    //     }
                    //     total=sum.toFixed(2);
                    //         this.accrualAccountCode.push({
                    //             Name:"Reversal Total",
                    //             AccountCodeName: "AP",
                    //             Amount: "("+ total +")",
                    //             Color:"#fff"
                    //         });
                    // }

                    if (this.selectedInvoiceDetails.POTypeId === PurchaseOrderType.ContractPoVariable) {
                        // total = this.selectedInvoiceDetails.CPOAmount;
                        //total = this.selectedInvoiceDetails.SubTotal;
                        this.sumSubtotal = this.selectedInvoiceDetails.Margin != null ? this.selectedInvoiceDetails.Margin + this.selectedInvoiceDetails.SubTotalAmount : this.selectedInvoiceDetails.SubTotalAmount;
                        this.subTotal = this.selectedInvoiceDetails.SubTotal;
                    }
                    if (this.selectedInvoiceDetails.POTypeId === PurchaseOrderType.ContractPoFixed) {
                        //total = this.selectedInvoiceDetails.CPOAmount;         
                        this.sumSubtotal = this.selectedInvoiceDetails.SubTotal;
                        this.subTotal = this.selectedInvoiceDetails.SubTotal;
                    }
                    else if (this.selectedInvoiceDetails.POTypeId === PurchaseOrderType.InventoryPo) {
                        total = this.selectedInvoiceDetails.IPOAmount;
                        this.sumSubtotal = this.selectedInvoiceDetails.InvoiceLimit != null ? this.selectedInvoiceDetails.InvoiceLimit + total : total;
                        this.subTotal = this.selectedInvoiceDetails.SubTotalAmount;
                    }
                    else if (this.selectedInvoiceDetails.POTypeId === PurchaseOrderType.FixedAssetPo) {
                        total = this.selectedInvoiceDetails.APOAmount;
                        this.sumSubtotal = this.selectedInvoiceDetails.InvoiceLimit != null ? this.selectedInvoiceDetails.InvoiceLimit + total : total;
                        this.subTotal = this.selectedInvoiceDetails.SubTotalAmount;
                    }
                    else if (this.selectedInvoiceDetails.POTypeId === PurchaseOrderType.ExpensePo) {
                        total = this.selectedInvoiceDetails.EXPOAmount;
                        this.sumSubtotal = this.selectedInvoiceDetails.InvoiceLimit != null ? this.selectedInvoiceDetails.InvoiceLimit + total : total;
                        this.subTotal = this.selectedInvoiceDetails.SubTotalAmount;
                    }
                    this.POSubtotal = this.sumSubtotal + 0.05;
                    this.subTotal = Number(this.subTotal.toFixed(2));
                    //console.log("totalsub", this.sumSubtotal, this.subTotal)

                    // console.log(total,"sub",this.sumSubtotal,"purchaseOrderTypeId",this.purchaseOrderTypeId );
                    // if(this.selectedInvoiceDetails.InvoiceTypeId==1 && (this.selectedInvoiceDetails.POTypeId==PurchaseOrderType.InventoryPo|| this.selectedInvoiceDetails.POTypeId==PurchaseOrderType.FixedAssetPo|| this.selectedInvoiceDetails.POTypeId==PurchaseOrderType.ExpensePo))
                    // {          
                    //     this.invoiceReqObj.getPreviousInvoiceSubTotal(this.selectedInvoiceDetails.PurchaseOrderId,this.companyId)
                    //     .subscribe((data:number)=>{
                    //         this.subTotal = data;
                    //         console.log("totalsub",this.sumSubtotal,this.subTotal, data);
                    //     });        
                    // }
                    this.getInvoiceCount(data.InvoiceId);
                    //console.log(this.purchaseOrderTypeId,this.InvoiceForm.get('SubTotal').value,this.InvoiceForm.get('Discount').value);
                    //console.log(this.selectedInvoiceDetails);
                    let priceSubTotal = 0;
                    this.selectedInvoiceDetails.InvoiceItems.forEach(data => {
                        priceSubTotal = priceSubTotal + data.Totalprice;
                    });
                    this.selectedInvoiceDetails.PriceSubTotal = priceSubTotal;

                    let totalbefTaxSubTotal = 0;
                    this.selectedInvoiceDetails.InvoiceItems.forEach(data => {
                        totalbefTaxSubTotal = totalbefTaxSubTotal + data.TotalbefTax;
                    });
                    this.selectedInvoiceDetails.TotalbefTaxSubTotal = totalbefTaxSubTotal;

                    this.getSupplierSubCodes(this.selectedInvoiceDetails.Supplier.SupplierId, this.companyId);
                    this.changingValue.next(invoiceId);
                    this.creditNotes = [];
                    this.creditNotes = this.selectedInvoiceDetails.CreditNotes;
                    this.canVoid = this.selectedInvoiceDetails.CanVoid;
                    // if (this.selectedInvoiceDetails.WorkFlowStatus == "Exported") {
                    
                    // }
                }
            });

        setTimeout(() => {
            this.SelectedInvoiceId = invoiceId;
            this.hideText = true;
        }, 50);
    }

    onSupplierFilterChange(event: any) {
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
    /**
     * this method will be called on the supplier dropdown change event.
     */
    poSupplierId: number;
    onSupplierChange(event?: any) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        let supplierDetails: Suppliers;
        this.isPORecord = true;
        if (event != null && event != undefined) {
            supplierDetails = event.item;
            this.poSupplierId = supplierDetails.SupplierId;
            this.TaxGroupId = supplierDetails.TaxGroupId;
            this.TaxID = supplierDetails.TaxID;
            this.InvoiceForm.get('CurrencyId').setValue(event.item.CurrencyId);
        }
        else {
            supplierDetails = this.InvoiceForm.get('Supplier').value;
            this.poSupplierId = supplierDetails.SupplierId;
            supplierDetails.PaymentTermsId = this.InvoiceForm.get('PaymentTermId').value;
        }
        if (event != null && event != undefined) {
            for (let i = 0; i < itemGroupControl.length; i++) {
                itemGroupControl.controls[i].get('TaxGroupId').setValue(supplierDetails.TaxGroupId);
                itemGroupControl.controls[i].get('TaxID').setValue(supplierDetails.TaxID);
                if (supplierDetails.TaxGroupId != null) {
                    this.getTaxesByTaxGroupsupplierChange(supplierDetails.TaxGroupId, i);
                }
            }

        }
        if (supplierDetails != undefined) {
            if ((supplierDetails.WorkFlowStatus != null) && (supplierDetails.WorkFlowStatus === "Approved")) {
                this.InvoiceForm.patchValue({
                    "SupplierAddress": supplierDetails.SupplierAddress,
                    "ShippingFax": supplierDetails.BillingFax,
                    "SupplierTypeID": supplierDetails.SupplierTypeID == 1 ? "1" : "2",
                    "PaymentTermId": supplierDetails.PaymentTermsId
                });
                this.onPaymentTermChange(null);
                if (this.selectedInvoiceTypeId == 2) {
                    if (supplierDetails.SubCodeCount > 0 || this.InvoiceForm.get("SupplierSubCode").value != null) {
                        this.isSupplierSelected = true;
                    }
                    else {
                        this.isSupplierSelected = false;
                    }

                    //getting Supplier sub Codes    
                    this.getSupplierSubCodes(supplierDetails.SupplierId, this.companyId);
                }
            }
            else {
                this.isSupplierSelected = false;
                if (!this.isEdit) {
                    this.InvoiceForm.get('Supplier').setValue(null);
                    //event.preventDefault();
                    return false;
                }
            }
        }
        else {
            this.InvoiceForm.patchValue({
                "SupplierAddress": "",
                "ShippingFax": "",
                "SupplierTypeID": 2
            });
            this.isSupplierSelected = false;
            // this.InvoiceForm.get('SupplierSubCodeId').clearValidators();
            // this.InvoiceForm.get('SupplierSubCodeId').updateValueAndValidity();               
        }
        this.getAllPoDetails();
    }
    getTaxesByTaxGroupsupplierChange(taxGroupId: number, rowIndex: number): void {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        let taxResult = <Observable<Array<any>>>this.taxService.getTaxesByTaxGroup(taxGroupId);
        taxResult.subscribe((data) => {
            if (data != null) {

                this.taxTypes = data;
                itemGroupControl.controls[rowIndex].value.Taxes = [];
                itemGroupControl.controls[rowIndex].patchValue({
                    Taxes: this.taxTypes
                });

                //this.TaxID = this.InvoiceForm.controls['TaxId'].value;         
                if (itemGroupControl != null) {
                    if (itemGroupControl.controls[rowIndex].get('TaxID').value != null) {
                        this.setTaxAmount(itemGroupControl.controls[rowIndex].get('TaxID').value, rowIndex);
                    }
                }
            }
        });
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
    addGridItem(noOfLines: number, Invoices: any) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGridRows());
            let lastIndex = itemGroupControl.length - 1;
            if (Invoices != null && Invoices.InvoiceItems[i].TaxGroupId != null)
                this.TaxGroupId = Invoices.InvoiceItems[i].TaxGroupId;
            else
                this.TaxGroupId = Invoices.TaxGroupId;
            if (this.poSupplierId > 0) {
                itemGroupControl.controls[lastIndex].get('TaxGroupId').setValue(this.TaxGroupId);
                itemGroupControl.controls[lastIndex].get('TaxID').setValue(this.TaxID);
                this.getTaxesByTaxGroupsupplierChange(this.TaxGroupId, lastIndex);
            }
        }
    }
    /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex: number) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        let InvoiceItemId = itemGroupControl.controls[rowIndex].get('InvoiceItemId').value;
        if (InvoiceItemId > 0) {
            this.deletedInvoiceItems.push(InvoiceItemId);
        }
        itemGroupControl.removeAt(rowIndex);
        if (itemGroupControl.controls.length == 0)
            this.addGridItem(1, null);
        this.calculateTotalPrice();
    }
    removeAllGridItems() {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        itemGroupControl.controls = [];
        this.calculateTotalPrice();
    }
    showInvoiceDialog() {
        this.showInvoiceTypeDialog = true;
        this.changingValue.next(0);
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
        //setting this variable to false so as to show the purchase order details in edit mode
        this.hideText = false;
        this.hideInput = true;
        this.isSupplierSelected = false;
        this.isEdit = false;
        this.disableDelete = false;
        this.selectedInvoiceDetails = new InvoiceDetails();
        this.setColumns();
        this.resetForm();
        this.getCompanyDetails(this.companyId);
        this.InvoiceForm.patchValue({
            'CurrencyId': DEFAULT_CURRENCY_ID,
        });
        this.getPoType();
        this.onPoTypeChange();
        this.selectedGrns = [];
        this.selectedGrns.length = 0;
        this.SelectedCPOs = [];
        this.SelectedCPOs.length = 0;
        this.goodsReceivedNotesList = [];
        this.goodsReceivedNotesList.length = 0;
        this.poSupplierId = 0;
        this.OldTotalAmount = 0;
        //this.showFullScreen();
        //console.log("this.purchaseOrderTypeId",this.purchaseOrderTypeId,this.selectedInvoiceTypeId);
        this.creditNotes = [];
        this.canVoid = false;
        this.enableOnVerify = false;
        this.showfilters =false;
    this.showfilterstext="Show List" ;
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

    validateForm(statusId: number) {

        this.showGridErrorMessage = false;
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        if (this.selectedInvoiceDetails.InvoiceId > 0 && this.hideText == true) {
            return true;
        }
        if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
            this.showGridErrorMessage = true;
        }
        let InvoiceFormStatus = this.InvoiceForm.status;
        if (InvoiceFormStatus != "INVALID" && this.showGridErrorMessage == false) {
            if (this.InvoiceForm.get('PaymentTermId').value == 0 || this.selectedInvoiceDetails.PaymentTermId === null) {
                this.confirmationServiceObj.confirm({
                    message: "Please select Payment terms",
                    header: Messages.DeletePopupHeader,
                    accept: () => {
                    },
                    rejectVisible: false,
                    acceptLabel: "Ok"
                });
                return false;
            }
            if (statusId == WorkFlowStatus.Completed && this.uploadedFiles.length == 0 && (this.selectedInvoiceDetails.Attachments == undefined || this.selectedInvoiceDetails.Attachments.filter(i => i.IsDelete != true).length == 0)) {
                this.confirmationServiceObj.confirm({
                    message: "Please Attach Original Scanned Invoice",
                    header: Messages.DeletePopupHeader,
                    accept: () => {
                    },
                    rejectVisible: false,
                    acceptLabel: "Ok"
                });
                return false;
            }//if with po is selected.....
            else if (this.selectedGrns.length <= 0 && this.isEdit == false && this.selectedInvoiceTypeId && this.selectedInvoiceTypeId == 1) {
                if (Number(this.InvoiceForm.value.POTypeId) === PurchaseOrderType.ContractPoFixed || Number(this.InvoiceForm.value.POTypeId) === PurchaseOrderType.ContractPoVariable) {
                    return true;
                }
                else {
                    this.confirmationServiceObj.confirm({
                        message: "Please Select a GRN to create invoice",
                        header: Messages.DeletePopupHeader,
                        accept: () => {
                        },
                        rejectVisible: false,
                        acceptLabel: "Ok"
                    });
                    return false;
                }
            }
            return true;
        }
        else {
            Object.keys(this.InvoiceForm.controls).forEach((key: string) => {
                if (this.InvoiceForm.controls[key].status == "INVALID" && this.InvoiceForm.controls[key].touched == false) {
                    this.InvoiceForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
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

    saveInvoiceDetails(statusId: number) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        if (itemGroupControl != undefined) {
            for (let i = 0; i < itemGroupControl.length; i++) {
                if (itemGroupControl.controls[i].get('ItemQty').value > 0) {
                    let total = (itemGroupControl.controls[i].get('ItemQty').value * itemGroupControl.controls[i].get('Unitprice').value) + (itemGroupControl.controls[i].get('TaxTotal').value);
                    let discount = itemGroupControl.controls[i].get('Discount').value;
                    if (total < discount) {
                        itemGroupControl.controls[i].get('Discount').setValidators([Validators.required]);
                        itemGroupControl.controls[i].get('Discount').updateValueAndValidity();
                        return;
                    }
                }
            }
        }
        if (this.InvoiceForm.value.POTypeId == PurchaseOrderType.ContractPoFixed || this.InvoiceForm.value.POTypeId == PurchaseOrderType.ContractPoVariable) {
            this.InvoiceForm.value.selectedGrns = [];
            this.InvoiceForm.value.SelectedPOs = [];

        }
        else {

        }
        let invoiceDetails: InvoiceDetails = this.InvoiceForm.value;
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        if (statusId == 3 && this.hideText == true && this.selectedInvoiceDetails.InvoiceId > 0) {
            let workFlowDetails: WorkFlowParameter =
            {
                ProcessId: WorkFlowProcess.SupplierInvoice,
                CompanyId: this.companyId,
                LocationId: this.selectedInvoiceDetails.LocationId,
                FieldName: "",
                Value: this.selectedInvoiceDetails.TotalAmount,
                DocumentId: this.selectedInvoiceDetails.InvoiceId,
                CreatedBy: this.selectedInvoiceDetails.CreatedBy,
                WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
                CurrentWorkFlowStatusId: this.selectedInvoiceDetails.WorkFlowStatusId
            };
            HideFullScreen(null);
            this.sharedServiceObj.sendForApproval(workFlowDetails)
                .subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.SentForApproval,
                        MessageType: MessageTypes.Success
                    });
                    this.getInvoices(workFlowDetails.DocumentId, 0);
                });
            return;
        }
        if (this.isSubmit) {
            this.selectedGrns.forEach(element => {
                element.WorkFlowStatusId = WorkFlowStatus.Invoiced;
            });

        }
        else {
            this.selectedGrns.forEach(element => {
                element.WorkFlowStatusId = WorkFlowStatus.Completed;
            });
        }

        invoiceDetails.SelectedGRNs = this.selectedGrns;
        invoiceDetails.SelectedCPOs = this.SelectedCPOs;
        invoiceDetails.SelectedPOs = this.SelectedPOs;

        invoiceDetails.RequestedBy = userDetails.UserID;
        invoiceDetails.CreatedBy = userDetails.UserID;
        invoiceDetails.CompanyId = this.sessionService.getCompanyId();
        invoiceDetails.WorkFlowStatusId = statusId;
        if (invoiceDetails.Discount == null) {
            invoiceDetails.Discount = 0;
        }
        if (invoiceDetails.GSTAdjustment == null) {
            invoiceDetails.GSTAdjustment = 0;
        }
        if (invoiceDetails.Adjustment == null) {
            invoiceDetails.Adjustment = 0;
        }
        if (invoiceDetails.ShippingCharges == null) {
            invoiceDetails.ShippingCharges = 0;
        }
        if (invoiceDetails.OtherCharges == null) {
            invoiceDetails.OtherCharges = 0;
        }
        if (invoiceDetails.TotalAmount == null) {
            invoiceDetails.TotalAmount = 0;
        }
        invoiceDetails.OldTotalAmount = this.OldTotalAmount;
        if (invoiceDetails.TaxId == null) {
            invoiceDetails.TaxRate = 0;
            invoiceDetails.TaxId = 0;
        }
        if (invoiceDetails.TotalTax == null) {
            invoiceDetails.TotalTax = 0;
        }
        if (invoiceDetails.PurchaseOrderId == "") {
            invoiceDetails.PurchaseOrderId = "";
        }
        if (invoiceDetails.POTypeId == null) {
            invoiceDetails.POTypeId = 0;
        }
        if (invoiceDetails.TaxRate == null) {
            invoiceDetails.TaxRate = 0;
        }
        if (this.selectedInvoiceTypeId == 1) {
            invoiceDetails.InvoiceItems.forEach(i => {
                if (i.InvoiceItemId > 0) {
                    let previousRecord = this.selectedInvoiceDetails.InvoiceItems.find(j => j.InvoiceItemId == i.InvoiceItemId);
                    if (i.ItemDescription != previousRecord.ItemDescription ||
                        i.ItemQty != previousRecord.ItemQty ||
                        i.Unitprice != previousRecord.Unitprice ||
                        i.TaxID != previousRecord.TaxID ||
                        i.PurchaseOrderId != previousRecord.PurchaseOrderId ||
                        i.Discount != previousRecord.Discount ||
                        i.GlDescription != previousRecord.GlDescription) {
                        i.IsModified = true;
                    }
                }
                else {
                    i.InvoiceItemId = 0;
                }
                if (i.ItemQty == null) {
                    i.ItemQty = 0;
                }
            });
        }
        else {
            invoiceDetails.InvoiceItems.forEach(i => {
                if (i.InvoiceItemId > 0) {
                    let previousRecord = this.selectedInvoiceDetails.InvoiceItems.find(j => j.InvoiceItemId == i.InvoiceItemId);
                    if (i.TypeId == 1) {
                        if (i.Item.ItemMasterId != previousRecord.Item.ItemMasterId ||
                            (i.Item.ItemMasterId == 0 && (i.Item.ItemName != previousRecord.Item.ItemName)) ||
                            i.ItemDescription != previousRecord.ItemDescription ||
                            i.ItemQty != previousRecord.ItemQty ||
                            i.Unitprice != previousRecord.Unitprice ||
                            i.TaxID != previousRecord.TaxID ||
                            i.PurchaseOrderId != previousRecord.PurchaseOrderId ||
                            i.Discount != previousRecord.Discount ||
                            i.GlDescription != previousRecord.GlDescription) {
                            i.IsModified = true;
                        }
                    }
                    if (i.TypeId == 2 || i.TypeId == 3) {
                        if (i.Service.AccountCodeId != previousRecord.Service.AccountCodeId ||
                            (i.Service.AccountCodeId == 0 && (i.Service.AccountCodeName != previousRecord.Service.AccountCodeName)) ||
                            i.ItemDescription != previousRecord.ItemDescription ||
                            i.ItemQty != previousRecord.ItemQty ||
                            i.Unitprice != previousRecord.Unitprice ||
                            i.TaxID != previousRecord.TaxID ||
                            i.PurchaseOrderId != previousRecord.PurchaseOrderId ||
                            i.Discount != previousRecord.Discount ||
                            i.GlDescription != previousRecord.GlDescription) {
                            i.IsModified = true;
                        }
                    }

                }
                else {
                    i.InvoiceItemId = 0;
                }
                if (i.ItemQty == null) {
                    i.ItemQty = 0;
                }
            });
        }


        if (invoiceDetails.POTypeId == PurchaseOrderType.ContractPoFixed || invoiceDetails.POTypeId == PurchaseOrderType.ContractPoVariable) {

            invoiceDetails.InvoiceItems.forEach(item => {
                let record = this.invoiceItemDetails.find(j => j.CPONumber == item.CPONumber);
                item.CPOID = record.CPOID;
                item.IsModified = true;
            });

            invoiceDetails.SelectedCPOs = this.SelectedCPOs;
        }
        invoiceDetails.InvoiceItems = invoiceDetails.InvoiceItems.filter(i => i.InvoiceItemId == 0 || i.InvoiceItemId == null || i.IsModified == true);
        invoiceDetails.RequestedBy = userDetails.UserID;
        invoiceDetails.CreatedBy = userDetails.UserID;
        invoiceDetails.InvoiceTypeId = this.selectedInvoiceTypeId;
        invoiceDetails.InvoiceDate = this.reqDateFormatPipe.transform(invoiceDetails.InvoiceDate);
        invoiceDetails.IsGstBeforeDiscount = this.IsGstBeforeDiscount;
        invoiceDetails.PurchaseOrderCode = this.purchaseOrderCode;
        if (invoiceDetails.InvoiceId == 0 || invoiceDetails.InvoiceId == null) {
            invoiceDetails.InvoiceId = 0;
            invoiceDetails.InvoiceItems = invoiceDetails.InvoiceItems.filter(item => item.ItemQty !== 0);
            //console.log(invoiceDetails);
            HideFullScreen(null);
            this.invoiceReqObj.createInvoice(invoiceDetails, this.uploadedFiles)
                .subscribe((invoiceId: number) => {
                    if (invoiceId == -1) {
                        this.confirmationServiceObj.confirm({
                            message: Messages.DuplicateSupplierInvoiceNumber,
                            header: Messages.PopupHeader,
                            rejectVisible: false,
                            acceptLabel: "OK"
                        });
                    } else {
                        this.hideText = true;
                        this.hideInput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.recordInEditMode = -1;
                        this.invoiceItemDetails = [];
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.getInvoices(invoiceId, 0);
                        this.showGridErrorMessage = false;
                    }
                    // this.hideFullScreen();
                }, (data: HttpErrorResponse) => {
                    if (data.error.Message == ResponseStatusTypes.Duplicate) {
                        this.displayDuplicateErrorMessage();
                    }
                });
        }
        else {
            // console.log(invoiceDetails.InvoiceItems);
            invoiceDetails.InvoiceId = this.selectedInvoiceDetails.InvoiceId;
            invoiceDetails.InvoiceItemsToDelete = this.deletedInvoiceItems;
            invoiceDetails.Attachments = this.selectedInvoiceDetails.Attachments.filter(i => i.IsDelete == true);
            invoiceDetails.SelectedGRNs = this.selectedInvoiceDetails.SelectedGRNs;
            invoiceDetails.SelectedCPOs = this.selectedInvoiceDetails.SelectedCPOs;
            invoiceDetails.SelectedPOs = this.selectedInvoiceDetails.SelectedPOs;
            HideFullScreen(null);
            this.invoiceReqObj.updateInvoice(invoiceDetails, this.uploadedFiles)
                .subscribe((response) => {
                    if (response == -1) {
                        this.confirmationServiceObj.confirm({
                            message: Messages.DuplicateSupplierInvoiceNumber,
                            header: Messages.PopupHeader,
                            rejectVisible: false,
                            acceptLabel: "OK"
                        });
                    }
                    else {
                        this.hideText = true;
                        this.hideInput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.deletedInvoiceItems = [];
                        this.invoiceItemDetails = [];
                        this.deletedInvoiceItems.length = 0;
                        this.recordInEditMode = -1;
                        this.InvoiceForm.get('Supplier').setValue(null);
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.getInvoices(invoiceDetails.InvoiceId, 0);
                        this.showGridErrorMessage = false;
                        // this.hideFullScreen();
                    }
                }, (data: HttpErrorResponse) => {
                    if (data.error.Message == ResponseStatusTypes.Duplicate) {
                        this.displayDuplicateErrorMessage();
                    }
                });
        }
    }
    /**
     * to save the given purchase order details
     */
    saveRecord(statusId: number) {
        //validating supplier subcode
        if (this.selectedInvoiceTypeId == 2) {
            let count = this.supplierSubCodes.length;

            if (this.supplierSubCodes != null && this.supplierSubCodes.length > 0) {
                this.InvoiceForm.get('SupplierSubCodeId').setValidators([Validators.required]);
                this.InvoiceForm.get('SupplierSubCodeId').updateValueAndValidity();
            }
            else {
                this.InvoiceForm.get('SupplierSubCodeId').clearValidators();
                this.InvoiceForm.get('SupplierSubCodeId').updateValueAndValidity();
            }

        }
        else {
            this.isSupplierSelected = false;
            this.InvoiceForm.get('SupplierSubCodeId').clearValidators();
            this.InvoiceForm.get('SupplierSubCodeId').updateValueAndValidity();
        }

        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        if (itemGroupControl != undefined) {
            for (let i = 0; i < itemGroupControl.length; i++) {
                if (itemGroupControl.controls[i].get('ItemQty').value > 0) {
                    let total = (itemGroupControl.controls[i].get('ItemQty').value * itemGroupControl.controls[i].get('Unitprice').value) + (itemGroupControl.controls[i].get('TaxTotal').value);
                    let discount = itemGroupControl.controls[i].get('Discount').value;
                    if (total < discount) {
                        itemGroupControl.controls[i].get('Discount').setValidators([Validators.required]);
                        itemGroupControl.controls[i].get('Discount').updateValueAndValidity();
                        return;
                    }
                }
            }
        }
        let RemarksControl = this.InvoiceForm.get('RemarksInvoice');
        if (this.selectedInvoiceDetails.InvoiceId > 0 && this.hideText == true) {
            RemarksControl.setValue(this.selectedInvoiceDetails.RemarksInvoice);
        }
        if (this.validateForm(statusId) == true) {
            if ((this.hideText && this.selectedInvoiceDetails.PaymentTermId === null) || this.hideInput && this.InvoiceForm.get('PaymentTermId').value == 0) {
                this.confirmationServiceObj.confirm({
                    message: "Please select Payment terms",
                    header: Messages.DeletePopupHeader,
                    accept: () => {
                    },
                    rejectVisible: false,
                    acceptLabel: "Ok"
                });
                return false;
            }

            if (statusId == WorkFlowStatus.WaitingForApproval) {
                if (this.uploadedFiles.length == 0 && (this.selectedInvoiceDetails.Attachments == undefined || this.selectedInvoiceDetails.Attachments.filter(i => i.IsDelete != true).length == 0)) {
                    this.confirmationServiceObj.confirm({
                        message: "Please Attach Original Scanned Invoice",
                        header: Messages.DeletePopupHeader,
                        accept: () => {
                        },
                        rejectVisible: false,
                        acceptLabel: "Ok"
                    });
                    return false;
                }
                else {
                    if (this.selectedInvoiceTypeId == 1) {
                        //if (this.InvoiceForm.get('SubTotal').value>this.sumSubtotal||this.selectedInvoiceDetails.SubTotal>this.sumSubtotal)
                        if (this.subTotal > this.sumSubtotal) {
                            this.confirmationServiceObj.confirm({
                                message: this.poTypeId == 6 ? "If the total exceeds the sum of PO Value and margin. It will go through workflow process" :
                                    "If the total exceeds the sum of PO Value and Invoice Limit. It will go through workflow process",
                                header: "Information",
                                acceptLabel: "OK",
                                rejectVisible: false,
                                accept: () => {
                                    HideFullScreen(null);
                                    this.saveInvoiceDetails(statusId);
                                },
                                reject: () => {
                                }
                            });

                        }
                    }
                    else {
                        this.saveInvoiceDetails(statusId);
                    }
                }
            }
            else {
                this.saveInvoiceDetails(statusId);
            }
        }

    }


    displayDuplicateErrorMessage() {
        //setting the error for the "Name" control..so as to show the duplicate validation message..
        this.InvoiceForm.get('InvoiceCode').setErrors({
            'Duplicate': true
        });
    }

    cancelDraft() {
        //setting this variable to true so as to show the purchase details     
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.InvoiceForm.reset();
        this.InvoiceForm.setErrors(null);

        let displayInput: InvoiceVoid = {
            UserId: userDetails.UserID,
            Reasons: "",
            InvoiceId: this.selectedInvoiceDetails.InvoiceId,
            SelectedGRNs: this.selectedInvoiceDetails.SelectedGRNs,
            SelectedCPOs: this.selectedInvoiceDetails.SelectedCPOs,
            SelectedPOs: this.selectedInvoiceDetails.SelectedPOs,
            POTypeId: this.selectedInvoiceDetails.POTypeId,
            StatusId: 0,
            InvoiceCode: "",
            CompanyId: this.companyId
        };
        HideFullScreen(null);
        this.invoiceReqObj.cancelDraftInvoice(displayInput)
            .subscribe((count: number) => {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.CancelDraft,
                    MessageType: MessageTypes.Success
                });
                this.showVoidPopUp = false;
                this.getInvoices(0, 0);
            }, (data: HttpErrorResponse) => {

            });
        // if (this.invoicesList.length > 0 && this.selectedInvoiceDetails != undefined) {
        //     if (this.selectedInvoiceDetails.InvoiceId != undefined) {
        //         this.onRecordSelection(this.selectedInvoiceDetails.InvoiceId, this.selectedInvoiceTypeId, this.selectedInvoiceDetails.POTypeId);
        //     }
        //     else {
        //         this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId,this.invoicesList[0].POTypeId);
        //     }
        // }
        // else if (this.invoicesList.length == 0) {
        //     this.hideFullScreen();
        // }
        this.hideInput = false;
        this.hideText = true;
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];

        this.invoiceItemDetails = [];
        this.purchaseOrderTypeId = 1;

        this.setColumns();
        this.isNewRecord = false;
        this.isCPORecord = false;
        this.isPORecord = false;
        this.TaxGroupId = 0;
        this.sharedServiceObj.hideAppBar(false);//showing the app bar..
    }


    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the purchase order details on cancel button click event..
     */
    cancelRecord() {
        //setting this variable to true so as to show the purchase details     

        this.router.navigate([`/po/supplierinvoicelist/${this.requestType}`]);

        // this.InvoiceForm.reset();
        // this.InvoiceForm.setErrors(null);
        // if (this.invoicesList.length > 0 && this.selectedInvoiceDetails != undefined) {
        //     if (this.selectedInvoiceDetails.InvoiceId != undefined) {
        //         this.onRecordSelection(this.selectedInvoiceDetails.InvoiceId, this.selectedInvoiceTypeId, this.selectedInvoiceDetails.POTypeId);
        //     }
        //     else {
        //         this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
        //     }
        // }
        // else if (this.invoicesList.length == 0) {
        //     this.hideFullScreen();
        // }
        // this.hideInput = false;
        // this.hideText = true;
        // this.isSupplierSelected = false;
        // this.uploadedFiles.length = 0;
        // this.uploadedFiles = [];

        // this.invoiceItemDetails = [];
        // this.purchaseOrderTypeId = 1;


        // this.setColumns();
        // this.isNewRecord = false;
        // this.isCPORecord = false;
        // this.isPORecord = false;
        // this.TaxGroupId = 0;
        // this.poSupplierId = 0;
        // this.sharedServiceObj.hideAppBar(false);//showing the app bar..
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
        this.poSupplierId = 0;
        //resetting the item category form.
        this.resetForm();
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        if (this.selectedInvoiceDetails.InvoiceItems != undefined) {
            this.addGridItem(this.selectedInvoiceDetails.InvoiceItems.length, this.selectedInvoiceDetails);
        }

        //this.selectedInvoiceTypeId=this.selectedInvoiceDetails.InvoiceTypeId;
        this.InvoiceForm.patchValue(this.selectedInvoiceDetails);
        this.poTypeId = this.selectedInvoiceDetails.POTypeId;
        this.poId = this.selectedInvoiceDetails.PurchaseOrderId;
        // console.log("edit", this.selectedInvoiceDetails);
        if (this.selectedInvoiceTypeId == 2 || (this.selectedInvoiceTypeId == 1 && this.selectedInvoiceDetails.POTypeId === 1 || this.selectedInvoiceDetails.POTypeId === 2 || this.selectedInvoiceDetails.POTypeId === 3)) {
            for (let i = 0; i < itemGroupControl.length; i++) {
                this.getTaxesByTaxGroup(itemGroupControl.controls[i].get('TaxGroupId').value, i);
            }
        }
        this.InvoiceForm.get('SupplierTypeID').setValue(this.selectedInvoiceDetails.Supplier.SupplierTypeID == 1 ? "1" : "2");
        this.InvoiceForm.get('InvoiceDate').setValue(new Date(this.selectedInvoiceDetails.InvoiceDate));
        this.InvoiceForm.get('IsPOC').setValue(this.selectedInvoiceDetails.POTypeId === 5 || this.selectedInvoiceDetails.POTypeId === 6 ? "1" : "2");

        //console.log( this.InvoiceForm.get('IsPOC').value);
        this.IsGstBeforeDiscount = this.selectedInvoiceDetails.IsGstBeforeDiscount;
        this.getPoType();
        //this.sumSubtotal= (this.purchaseOrderDetails.Margin!= undefined) ? subTotal+this.purchaseOrderDetails.Margin : subTotal;

        // if(this.selectedInvoiceDetails.POTypeId===6)
        // {
        //     let total = this.selectedInvoiceDetails.CPOAmount;
        //     this.sumSubtotal = this.selectedInvoiceDetails.Margin != null ? this.selectedInvoiceDetails.Margin+total : total; 
        //     console.log(total,"sub",this.sumSubtotal );
        // }

        this.onSupplierChange();

        this.selectedInvoiceDetails.SubTotal = null;
        // if(this.selectedInvoiceTypeId==1 && (this.selectedInvoiceDetails.POTypeId==PurchaseOrderType.ContractPoFixed)){
        //     this.sumSubtotal=this.selectedInvoiceDetails.TotalAmount;
        // }      
        this.calculateTotalPrice();
        //this.showFullScreen();   
        if (this.selectedInvoiceDetails.SupplierSubCode != null) {
            if (this.selectedInvoiceDetails.SupplierSubCode.SubCodeId === null) {
                this.isSupplierSelected = true;
                this.InvoiceForm.get('SupplierSubCodeId').setValidators([Validators.required]);
                this.InvoiceForm.get('SupplierSubCodeId').updateValueAndValidity();
            }
        }
        this.InvoiceForm.get('SupplierAddress').setValue(this.selectedInvoiceDetails.SupplierAddress);

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
            this.slideActive = true;
        }
        else {
            this.slideActive = false;
        }
    }
    /**
     * this method will be called on currency change event...
     */
    onCurrencyChange() {
        let currencyId = this.InvoiceForm.get('CurrencyId').value;
        this.selectedInvoiceDetails.CurrencySymbol = this.currencies.find(i => i.Id == currencyId).Symbol;
    }
    //to get the sub totalprice..
    getSubTotal() {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        if (itemGroupControl != undefined) {
            this.subTotal = 0;
            if (this.poTypeId == PurchaseOrderType.InventoryPo || this.poTypeId == PurchaseOrderType.FixedAssetPo || this.poTypeId == PurchaseOrderType.ExpensePo) {
                itemGroupControl.controls.forEach(data => {
                    if (data.get('ItemQty').value > 0) {
                        this.subTotal = this.subTotal + ((data.get('ItemQty').value * data.get('Unitprice').value) + data.get('TaxTotal').value - data.get('Discount').value);
                    }
                });
            }
            else if (this.selectedInvoiceTypeId == 2) {
                itemGroupControl.controls.forEach(data => {
                    if (data.get('ItemQty').value > 0) {
                        this.subTotal = this.subTotal + ((data.get('ItemQty').value * data.get('Unitprice').value) + data.get('TaxTotal').value - data.get('Discount').value);
                    }
                });
            }
            else {
                itemGroupControl.controls.forEach(data => {
                    if (data.get('ItemQty').value > 0) {
                        this.subTotal = this.subTotal + ((data.get('ItemQty').value * data.get('Unitprice').value));
                    }
                });
            }
            return this.subTotal;
        }
    }
    getTaxTotal() {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        if (itemGroupControl != undefined) {
            let taxTotal = 0;
            itemGroupControl.controls.forEach(data => {
                taxTotal = taxTotal + (data.get('TaxTotal').value);
            });
            return taxTotal;
        }
    }

    getTotalTaxCPO(taxId: number) {
        let totalTax = 0;
        // if (this.taxTypes.find(j => j.TaxId == taxId) != undefined) {
        //     taxRate = this.taxTypes.find(j => j.TaxId == taxId).TaxAmount;
        // }
        // let discount = this.InvoiceForm.get('Discount').value;
        // let totalTax = ((this.subTotal - discount) * taxRate) / 100;
        // return totalTax;
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];

        itemGroupControl.controls.forEach(data => {
            totalTax += (data.get('Unitprice').value * data.get('TaxAmount').value / 100);
            // if (data.get('ItemQty').value > 0)//19-2-2019
            // {
            //     let itemTotal = ((data.get('ItemQty').value * data.get('Unitprice').value) - data.get('Discount').value) * (data.get('TaxAmount').value) / 100;
            //     data.get('TaxTotal').setValue(itemTotal);
            // }
            // else {
            //     data.get('TaxTotal').setValue(0);
            // }
        });
        // this.purchaseOrderDetails.InvoiceItems.forEach(rec => {
        //     totalTax += (rec.Unitprice * rec.TaxAmount / 100);
        // });
        return totalTax;
    }


    getDiscountTotal() {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        if (itemGroupControl != undefined) {
            let discount = 0;
            itemGroupControl.controls.forEach(data => {
                discount = discount + (data.get('Discount').value);
            });
            return discount;
        }
    }


    //getting the total tax..
    getTotalTax(taxId: number) {
        if (taxId == null || taxId == 0) {
            return 0;
        }
        let taxRate = this.taxTypes.find(j => j.TaxId == taxId).TaxAmount;
        let totalTax = (this.getSubTotal() * taxRate) / 100;
        return totalTax;
    }

    getTotalPrice() {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        if (itemGroupControl != undefined) {
            let totalnewprice = 0;
            itemGroupControl.controls.forEach(data => {
                totalnewprice = (data.get('ItemQty').value * data.get('Unitprice').value);
                data.get('Totalprice').setValue(totalnewprice);
            });

        }
    }

    //to get total price..   

    calculateTotalPrice() {
        this.calculateTotalTax();
        this.subTotal = Number(this.getSubTotal().toFixed(2));
        this.getTotalPrice();
        this.InvoiceForm.get('SubTotal').setValue(this.subTotal);
        //console.log(this.sumSubtotal,subTotal);     
        if (this.selectedInvoiceTypeId == 1 && (this.poTypeId == PurchaseOrderType.InventoryPo || this.poTypeId == PurchaseOrderType.FixedAssetPo || this.poTypeId == PurchaseOrderType.ExpensePo)) {
            let displayInput: InvoiceSubTotal = {
                PurchaseOrderId: this.poId,
                CompanyId: this.companyId,
                InvoiceId: this.selectedInvoiceDetails.InvoiceId,
                POTypeId: this.poTypeId
            };
            //this.subTotal=0;
            this.invoiceReqObj.getPreviousInvoiceSubTotal(displayInput)
                .subscribe((data: number) => {
                    // invoice subtotal
                    this.subTotal += data;
                    //console.log("totalsub", this.sumSubtotal, this.subTotal, data);
                });
        }
        // if(this.purchaseOrderDetails !=undefined)
        // {
        //     if(this.purchaseOrderDetails.POTypeId==PurchaseOrderType.InventoryPo||this.purchaseOrderDetails.POTypeId==PurchaseOrderType.FixedAssetPo||this.purchaseOrderDetails.POTypeId==PurchaseOrderType.ExpensePo){
        //        // this.sumSubtotal=subTotal;
        //         this.sumSubtotal= (this.purchaseOrderDetails.InvoiceLimit!= undefined) ? subTotal+this.purchaseOrderDetails.InvoiceLimit : subTotal;
        //     }
        // }    
        // console.log("calculateTotalPrice", this.sumSubtotal, this.subTotal);
        let discount = 0.0;
        let totalTax = 0.0;
        let shippingCharges = 0;//this.InvoiceForm.get('ShippingCharges').value;
        let OtherCharges = 0;//this.InvoiceForm.get('OtherCharges').value;
        if (this.selectedInvoiceTypeId == 1 && (this.poTypeId == PurchaseOrderType.InventoryPo || this.poTypeId == PurchaseOrderType.FixedAssetPo || this.poTypeId == PurchaseOrderType.ExpensePo)) {
            let totalDiscount = this.getDiscountTotal();
            this.InvoiceForm.get('Discount').setValue(totalDiscount);
            discount = totalDiscount;
            totalTax = this.getTaxTotal();
        }
        else if (this.selectedInvoiceTypeId == 2) {
            let totalDiscount = this.getDiscountTotal();
            this.InvoiceForm.get('Discount').setValue(totalDiscount);
            discount = totalDiscount;
            totalTax = this.getTaxTotal();
        }
        else {
            discount = this.InvoiceForm.get('Discount').value;
            let taxid = this.InvoiceForm.get('TaxId').value;
            totalTax = this.getTotalTaxCPO(taxid);//(this.subTotal-discount);
        }
        this.InvoiceForm.get('TotalTax').setValue(totalTax);
        let gstAdjustment = this.InvoiceForm.get('GSTAdjustment').value;
        let netTotal = 0;
        if (this.poTypeId == PurchaseOrderType.InventoryPo || this.poTypeId == PurchaseOrderType.FixedAssetPo || this.poTypeId == PurchaseOrderType.ExpensePo) {
            // netTotal = (this.subTotal - discount) + shippingCharges + OtherCharges + gstAdjustment;
            netTotal = (this.subTotal) + shippingCharges + OtherCharges + gstAdjustment;
        }
        else if (this.selectedInvoiceTypeId == 2) {
            netTotal = this.subTotal + shippingCharges + OtherCharges + gstAdjustment;
        }
        else {
            netTotal = (this.subTotal - discount) + shippingCharges + OtherCharges + gstAdjustment + totalTax;
        }
        this.InvoiceForm.get('NetTotal').setValue(netTotal);
        let Adjustment = this.InvoiceForm.get('Adjustment').value;
        let totalPrice = netTotal + (Adjustment);
        this.InvoiceForm.get('TotalAmount').setValue(totalPrice);
        if (this.selectedInvoiceTypeId == 1 && this.poTypeId == 6) {
            this.totalbeforgstamount = (this.subTotal - discount).toFixed(2);
        }

        if (this.selectedInvoiceTypeId == 1 && (this.poTypeId == PurchaseOrderType.InventoryPo || this.poTypeId == PurchaseOrderType.FixedAssetPo || this.poTypeId == PurchaseOrderType.ExpensePo)) {
            let priceSubTotal = 0;
            priceSubTotal = this.getPriceSubTotal();
            this.InvoiceForm.get('PriceSubTotal').setValue(priceSubTotal);

            let totalbefTaxSubTotal = 0;
            totalbefTaxSubTotal = this.getTotalbefTaxSubTotal();
            this.InvoiceForm.get('TotalbefTaxSubTotal').setValue(totalbefTaxSubTotal);
        }
        else (this.selectedInvoiceTypeId == 2)
        {
            let priceSubTotal = 0;
            priceSubTotal = this.getPriceSubTotal();
            this.InvoiceForm.get('PriceSubTotal').setValue(priceSubTotal);

            let totalbefTaxSubTotal = 0;
            totalbefTaxSubTotal = this.getTotalbefTaxSubTotal();
            this.InvoiceForm.get('TotalbefTaxSubTotal').setValue(totalbefTaxSubTotal);
        }
    }

    //Get Total before tax sub total
    getTotalbefTaxSubTotal() {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        if (itemGroupControl != undefined) {
            let totalbefTaxSubTotal = 0;
            itemGroupControl.controls.forEach(data => {
                totalbefTaxSubTotal = totalbefTaxSubTotal + (data.get('Totalprice').value - data.get('Discount').value);
            });
            return totalbefTaxSubTotal;
        }
    }

    //get sub Total Price
    getPriceSubTotal() {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        if (itemGroupControl != undefined) {
            let priceSubTotal = 0;
            itemGroupControl.controls.forEach(data => {
                priceSubTotal = priceSubTotal + (data.get('ItemQty').value * data.get('Unitprice').value);
            });
            return priceSubTotal;
        }
    }



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
    onPaymentTermChange(event: any) {
        let paymentTermId = this.InvoiceForm.get('PaymentTermId').value;
        if (paymentTermId > 0) {
            this.InvoiceForm.get('PaymentTerms').setValue(this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).Description);
            this.updateDueDate();
        }
        else {
            this.InvoiceForm.get('PaymentTerms').setValue("");
        }
    }

    updateDueDate() {
        let invoiceDate: Date = this.InvoiceForm.get('InvoiceDate').value;
        let paymentTermId = this.InvoiceForm.get('PaymentTermId').value;
        let noOfDays = 0;
        if (this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId) != undefined) {
            noOfDays = this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).NoOfDays;
        }
        if (invoiceDate != null && noOfDays >= 0) {
            this.InvoiceForm.get('DueDate').setValue(new Date(invoiceDate.getTime() + (noOfDays * 24 * 60 * 60 * 1000)));
        }
        else {
            this.InvoiceForm.get('DueDate').setValue(null);
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

    invoiceSelectionOk(invoiceTypeId: number) {
        this.subTotal = 0;
        this.sumSubtotal = 0;
        this.POSubtotal = 0;
        this.selectedInvoiceTypeId = invoiceTypeId;
        this.showInvoiceTypeDialog = false;
        this.addRecord();
        if (this.selectedInvoiceTypeId == 2) {
            this.addGridItem(this.linesToAdd, null);
            this.supplierSubCodes = [];
        }
        this.creditNotes = [];
        this.canVoid = false;
    }

    pageChange(currentPageNumber: any) {
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
        this.showfilters =false;
    this.showfilterstext="Hide List" ;
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
        this.invoicePagerConfig.RecordsToFetch = 10;
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

    filterData() {
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
            FromDateFilter: fromDate == null ? null : this.reqDateFormatPipe.transform(fromDate),
            ToDateFilter: toDate == null ? null : this.reqDateFormatPipe.transform(toDate),
            PoTypeIdFilter: poTypeId
        };
        this.invoiceReqObj.getFilterSIC(sinvFilterDisplayInput).subscribe((data: InvoiceDisplayResult) => {
            if (data.Invoice.length > 0) {
                this.invoicesList = data.Invoice;
                this.invoicePagerConfig.TotalRecords = data.TotalRecords;
                this.selectedInvoiceDetails.InvoiceId = this.invoicesList[0].InvoiceId;
                this.onRecordSelection(this.invoicesList[0].InvoiceId, this.invoicesList[0].InvoiceTypeId, this.invoicesList[0].POTypeId);
                if (open) {
                    this.initDone = false;
                }
            }
            else {
                this.filterMessage = "No matching records are found";
            }
        });
    }

    setTaxAmount(taxType: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        this.getTaxTypesByTaxGroup(itemGroupControl.controls[rowIndex].get('TaxGroupId').value, rowIndex);
        let taxAmount = 0;
        if (itemGroupControl.controls[rowIndex].get('Taxes').value.find(i => i.TaxId == taxType) != undefined) {
            taxAmount = itemGroupControl.controls[rowIndex].get('Taxes').value.find(i => i.TaxId == taxType).TaxAmount;
        }
        itemGroupControl.controls[rowIndex].get('TaxAmount').setValue(taxAmount);

        this.calculateTotalPrice();

    }
    calculateTotalTax() {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        // if(itemGroupControl!=undefined)
        // {
        if (this.IsGstBeforeDiscount == true) {
            itemGroupControl.controls.forEach(data => {
                let itemTotal = ((data.get('ItemQty').value * data.get('Unitprice').value)) * (data.get('TaxAmount').value) / 100;
                data.get('TaxTotal').setValue(itemTotal);
            });
        }
        else {
            itemGroupControl.controls.forEach(data => {
                if (data.get('ItemQty').value > 0)//19-2-2019
                {
                    let itemTotal = ((data.get('ItemQty').value * data.get('Unitprice').value) - data.get('Discount').value) * (data.get('TaxAmount').value) / 100;
                    data.get('TaxTotal').setValue(itemTotal);
                }
                else {
                    data.get('TaxTotal').setValue(0);
                }
            });
        }
        //}
    }
    // end filter code

    restrictMinus(e: any) {
        restrictMinus(e);
    }

    submit() {
        if (this.validateForm(WorkFlowStatus.Completed) == true) {
            this.confirmationServiceObj.confirm({
                message: "Details once submitted cannot be changed.Do you want to continue ??",
                header: "Confirmation",
                accept: () => {
                    this.isSubmit = true;
                    this.saveInvoiceDetails(WorkFlowStatus.Completed);
                },
                reject: () => {
                }
            });

        }
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

    updateStatus(statusId: number) {
        let userDetails = <UserDetails>this.sessionService.getUser();

        if (this.moduleHeading == "Supplier Invoice" && (statusId === WorkFlowStatus.AskedForClarification || statusId === 3)) {
            statusId = WorkFlowStatus.AskedForClarification;
        }
        let remarks = "";
        if (statusId == WorkFlowStatus.Completed) {
            if (this.selectedInvoiceDetails.CreatedBy == this.selectedInvoiceDetails.CurrentApproverUserId &&
                this.selectedInvoiceDetails.CreatedBy == userDetails.UserID) {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.PoApprovesameValidationMessage,
                    MessageType: MessageTypes.Error
                });
                return;
            }
        }
        let successMessage = "";
        let formRemarks = this.InvoiceForm.get('Remarks').value;
        if ((formRemarks === "" || formRemarks === null) && (statusId === WorkFlowStatus.AskedForClarification || statusId === WorkFlowStatus.WaitingForApproval)) {
            this.InvoiceForm.get('Remarks').setErrors({ "required": true });
            this.InvoiceForm.get('Remarks').markAsTouched();
            return;
        }
        if (statusId === WorkFlowStatus.Completed) {
            if (formRemarks != "" && formRemarks != null) {
                remarks = formRemarks;
            }
            else {
                remarks = "Approved";
                remarks = (this.IsVerifier) ? "Verified" : remarks;
            }
            successMessage = Messages.Approved;
        }
        else if (statusId === WorkFlowStatus.Rejected) {
            if (formRemarks != "" && formRemarks != null) {
                remarks = formRemarks;
            }
            else {
                remarks = "Rejected";
            }
            successMessage = Messages.Rejected;
        }
        else {
            remarks = formRemarks;
            successMessage = Messages.SentForClarification;
        }

        let workFlowStatus: WorkFlowApproval = {
            DocumentId: this.selectedInvoiceDetails.InvoiceId,
            UserId: userDetails.UserID,
            WorkFlowStatusId: statusId,
            Remarks: remarks,
            RequestUserId: this.selectedInvoiceDetails.CreatedBy,
            DocumentCode: this.selectedInvoiceDetails.InvoiceCode.toString(),//need to update to document coee
            ProcessId: WorkFlowProcess.SupplierInvoice,
            CompanyId: this.companyId,
            ApproverUserId: 0,
            IsReApproval: false,
            InvoiceTypeId: this.selectedInvoiceTypeId
        };
        if (this.isApprovalPage == true)//if it is workflow approval page...
        {
            HideFullScreen(null);
            this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
                .subscribe((data) => {
                    this.InvoiceForm.get('Remarks').setValue("");
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: successMessage,
                        MessageType: MessageTypes.Success
                    });
                    this.requestSearchKey = "";
                    // this.getInvoicesForApprovals((statusId === WorkFlowStatus.Completed || statusId === WorkFlowStatus.Rejected) ? 0 : workFlowStatus.DocumentId);
                    this.getInvoicesForApprovals(0, 0);
                });
        }
        else {
            workFlowStatus.ApproverUserId = this.selectedInvoiceDetails.CurrentApproverUserId;
            HideFullScreen(null);
            this.sharedServiceObj.workFlowClarificationReply(workFlowStatus)
                .subscribe((data) => {
                    this.InvoiceForm.get('Remarks').setValue("");
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: successMessage,
                        MessageType: MessageTypes.Success
                    });
                    this.requestSearchKey = "";
                    this.getInvoices(workFlowStatus.DocumentId, 0);
                });
        }
    }


    updateRejectStatus(statusId: number) {
        let remarks = "";
        let successMessage = "";
        let userDetails = <UserDetails>this.sessionService.getUser();
        if (statusId == WorkFlowStatus.Completed || statusId == WorkFlowStatus.Rejected) {
            this.showVoidPopUp = false;
            this.voidPopUpTabId = 0;
            if (this.selectedInvoiceDetails.CreatedBy == this.selectedInvoiceDetails.CurrentApproverUserId &&
                this.selectedInvoiceDetails.CreatedBy == userDetails.UserID) {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.PoApprovesameValidationMessage,
                    MessageType: MessageTypes.Error
                });
                return;
            }
        }
        let formRemarks = this.invoiceVoidForm.get('Reasons').value;
        if (formRemarks.trim() == "" || formRemarks.trim() == null) {
            this.invoiceVoidForm.get('Reasons').setErrors({
                'required': true
            });
            return;
        }
        if (statusId === WorkFlowStatus.Rejected) {
            if (formRemarks != "" && formRemarks != null) {
                remarks = formRemarks;
            }
            else {
                remarks = "Rejected";
            }
            successMessage = Messages.Rejected;
        }

        //let userDetails = <UserDetails>this.sessionService.getUser();
        let workFlowStatus: WorkFlowApproval = {
            DocumentId: this.selectedInvoiceDetails.InvoiceId,
            UserId: userDetails.UserID,
            WorkFlowStatusId: statusId,
            Remarks: remarks,
            RequestUserId: this.selectedInvoiceDetails.CreatedBy,
            DocumentCode: this.selectedInvoiceDetails.InvoiceCode.toString(),//need to update to document coee
            ProcessId: WorkFlowProcess.SupplierInvoice,
            CompanyId: this.companyId,
            ApproverUserId: 0,
            IsReApproval: false
        };
        if (this.isApprovalPage == true)//if it is workflow approval page...
        {
            HideFullScreen(null);
            this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
                .subscribe((data) => {
                    this.InvoiceForm.get('Remarks').setValue("");
                    // this.sharedServiceObj.showMessage({
                    //     ShowMessage: true,
                    //     Message: successMessage,
                    //     MessageType: MessageTypes.Success
                    // });
                    this.requestSearchKey = "";
                });

            //saving reasong for rejection

            let displayInput: InvoiceVoid = {
                UserId: userDetails.UserID,
                Reasons: formRemarks,
                InvoiceId: this.selectedInvoiceDetails.InvoiceId,
                SelectedGRNs: this.selectedInvoiceDetails.SelectedGRNs,
                SelectedCPOs: this.selectedInvoiceDetails.SelectedCPOs,
                SelectedPOs: this.selectedInvoiceDetails.SelectedPOs,
                POTypeId: this.selectedInvoiceDetails.POTypeId,
                StatusId: 0,
                InvoiceCode: "",
                CompanyId: this.companyId
            };
            this.invoiceReqObj.rejectInvoice(displayInput)
                .subscribe((count: number) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.Rejected,
                        MessageType: MessageTypes.Success
                    });
                    this.showVoidPopUp = false;
                    this.getInvoicesForApprovals(0, 0);
                }, (data: HttpErrorResponse) => {

                });

        }

    }

    recallInvoiceApproval() {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let approvalObj = {
            InvoiceId: this.selectedInvoiceDetails.InvoiceId,
            InvoiceCode: this.selectedInvoiceDetails.InvoiceCode,
            PurchaseOrderCode: this.selectedInvoiceDetails.PurchaseOrderCode,
            PurchaseOrderType: this.selectedInvoiceDetails.PurchaseOrderType,
            POTypeId: this.selectedInvoiceDetails.POTypeId,
            CreatedDate: this.selectedInvoiceDetails.CreatedDate,
            CreatedBy: userDetails.UserID,
            Supplier: this.selectedInvoiceDetails.Supplier,
            TotalAmount: this.selectedInvoiceDetails.TotalAmount,
            CurrentApproverUserName: this.selectedInvoiceDetails.CurrentApproverUserName,
            CreatedByUserName: userDetails.UserName,
            CompanyId: this.companyId,
            CurrencySymbol: this.selectedInvoiceDetails.CurrencySymbol,
            WorkFlowStatus: this.selectedInvoiceDetails.WorkFlowStatus,
            CurrentApproverUserId: this.selectedInvoiceDetails.CurrentApproverUserId,
        };
        HideFullScreen(null);
        this.invoiceReqObj.recallInvoiceApproval(approvalObj)
            .subscribe(() => {
                this.getInvoices(this.selectedInvoiceDetails.InvoiceId, 0);
            });
    }


    onItemTypeChange(itemType: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        let InvoiceItemId = itemGroupControl.controls[rowIndex].get('InvoiceItemId').value;
        if (InvoiceItemId > 0) {
            this.deletedInvoiceItems.push(InvoiceItemId);
        }

        if (itemGroupControl.controls[rowIndex] != undefined) {
            itemGroupControl.controls[rowIndex].reset();
        }
        if (Number(itemType) === 1) {
            itemGroupControl.controls[rowIndex].get('Service').clearValidators();
            itemGroupControl.controls[rowIndex].get('Service').updateValueAndValidity();

            itemGroupControl.controls[rowIndex].get('Item').setValidators([Validators.required]);
            itemGroupControl.controls[rowIndex].get('Item').updateValueAndValidity();
        }
        else {
            itemGroupControl.controls[rowIndex].get('Item').clearValidators();
            itemGroupControl.controls[rowIndex].get('Item').updateValueAndValidity();

            itemGroupControl.controls[rowIndex].get('Service').setValidators([Validators.required]);
            itemGroupControl.controls[rowIndex].get('Service').updateValueAndValidity();
        }
        itemGroupControl.controls[rowIndex].get('TypeId').setValue(Number(itemType));
        itemGroupControl.controls[rowIndex].get('TaxGroupId').setValue(this.TaxGroupId);
        itemGroupControl.controls[rowIndex].get('TaxID').setValue(this.TaxID);
        this.getTaxesByTaxGroupsupplierChange(this.TaxGroupId, rowIndex);

    }
    itemMasterSelectionGlCode(eventData: any) {
        this.GlcodeInfoForm.get('Item').setValue(eventData);
        this.errmesagevisible = false;
    }
    serviceMasterSelectionGlCode(eventData: any, index: number) {
        this.GlcodeInfoForm.get('Service').setValue(eventData);
    }

    itemMasterSelection(eventData: any, index: number) {
        // console.log(this.TaxGroupId);
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            ItemDescription: eventData.item.ItemName,
            MeasurementUnitID: eventData.item.MeasurementUnitID,
            ItemQty: 1,
            Unitprice: 0,
            Totalprice: 0,
            TotalbefTax: 0,
            TaxGroupId: this.TaxGroupId,
            // TaxAmount: 0,
            Discount: 0,
            TaxID: this.TaxID
        });
    }
    ExpenseMasterSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            ItemDescription: eventData.item.Description,
            ItemName: eventData.item.Code,
            MeasurementUnitID: 0,
            ItemQty: 1,
            Unitprice: 0,
            Totalprice: 0,
            TotalbefTax: 0,
            TaxGroupId: this.TaxGroupId,
            Discount: 0,
            TaxID: this.TaxID
        });
    }

    serviceMasterSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            ItemDescription: eventData.item.Description,
            ItemName: eventData.item.Code,
            MeasurementUnitID: 0,
            ItemQty: 1,
            Unitprice: 0,
            Totalprice: 0,
            TotalbefTax: 0,
            TaxGroupId: this.TaxGroupId,
            // TaxAmount: 0,
            Discount: 0,
            TaxID: this.TaxID
        });
    }

    itemMasterInputFormater = (x: ItemMaster) => x.ItemName;
    itemMasterSearch = (text$: Observable<string>) => {
        if (text$ == undefined) {
            return of([]);
        }
        return text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                //let selectedDepartmentId = this.purchaseOrderForm.get('LocationId').value;
                if (term == "")//||(selectedDepartmentId==0||selectedDepartmentId==null))
                {
                    let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        let InvoiceItemId = itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').setValue(InvoiceItemId);
                        itemGroupControl.controls[this.selectedRowId].get('TypeId').setValue(typeId);
                    }
                    if (this.TaxGroupId != 0) {
                        this.getTaxesByTaxGroupsupplierChange(this.TaxGroupId, this.selectedRowId);
                        itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(this.TaxID);
                        itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(this.TaxGroupId);
                    }
                    else {
                        itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(0);
                        itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(0);
                    }
                    return of([]);
                }

                return this.sharedServiceObj.getItemMasterByKey({
                    searchKey: term,
                    CompanyId: this.companyId,
                    LocationID: null  //selectedDepartmentId
                }).map((data: ItemMaster[]) => {
                    // if(data==null||data.length==0)
                    // {
                    //     let itemObj:ItemMaster = {
                    //         ItemMasterId:0,
                    //         ItemName:term,
                    //         Description:"",
                    //         MeasurementUnitCode:""
                    //     };
                    //     return [itemObj];
                    // }
                    // else
                    // {
                    return this.getSelectedItemsList(data);
                    // }
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }

    getSelectedItemsList(data: ItemMaster[]) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <ItemMaster>control.get('Item').value;
        });
        return data;
    }
    itemInputFormater = (x: ItemGLCode) => x.ItemName;
    itemMasterSearchGlCode = (text$: Observable<string>) => {
        if (text$ == undefined) {
            return of([]);
        }
        return text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {

                if (term == "") {
                    return of([]);
                }

                if ((this.selectedInvoiceDetails.POTypeId == 3 || this.selectedInvoiceDetails.POTypeId == 5 || this.selectedInvoiceDetails.POTypeId == 6) && this.selectedInvoiceDetails.InvoiceTypeId == 1) {
                    const AccountType = this.optionIst.nativeElement.value;
                    const SubCategory = this.optionSec.nativeElement.value;
                    this.AccountTypeid = AccountType;
                    this.AccountCodeCategoryId = SubCategory;
                }
                else {
                    this.AccountTypeid = 0;
                    this.AccountCodeCategoryId = 0;
                }

                return this.sharedServiceObj.GetGlcodes({
                    searchKey: term,
                    CompanyId: this.companyId,
                    InvoiceTypeId: this.InvoiceTypeIdgl,
                    PoTypeId: this.potypeidGl,
                    Typeid: this.TypeidGl,
                    AccountCodeName: this.AccountCodeNameGl,
                    AccountType: this.AccountTypeid,
                    AccountCodeCategoryId: this.AccountCodeCategoryId

                }).map((data: ItemGLCode[]) => {

                    return this.getSelectedItemsListGlcode(data);
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
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


    serviceMasterInputFormater = (x: AccountCodeMaster) => x.Code;
    serviceMasterSearch = (text$: Observable<string>) => {
        if (text$ == undefined) {
            return of([]);
        }
        return text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        let InvoiceItemId = itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').setValue(InvoiceItemId);
                        itemGroupControl.controls[this.selectedRowId].get('TypeId').setValue(typeId);
                    }
                    return of([]);
                }

                return this.sharedServiceObj.getServicesByKey({
                    searchKey: term,
                    companyId: this.companyId,
                    categoryId: 1
                }).map((data: AccountCodeMaster[]) => {

                    return this.getSelectedServicesList(data);
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }
    ExpenseMasterInputFormater = (x: AccountCodeMaster) => x.AccountCodeName;
    ExpenseMasterSearch = (text$: Observable<string>) => {

        if (text$ == undefined) {
            return of([]);
        }
        return text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        let InvoiceItemId = itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').setValue(InvoiceItemId);
                        itemGroupControl.controls[this.selectedRowId].get('TypeId').setValue(typeId);
                    }
                    return of([]);
                }

                return this.sharedServiceObj.getExpenseByKey({
                    searchKey: term,
                    companyId: this.companyId,
                    categoryId: 1
                }).map((data: AccountCodeMaster[]) => {

                    return this.getSelectedExpenseList(data);
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }
    getSelectedExpenseList(data: AccountCodeMaster[]) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCodeMaster>control.get('Service').value;
        });
        return data;
    }


    getSelectedServicesList(data: AccountCodeMaster[]) {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCodeMaster>control.get('Service').value;
        });
        return data;
    }

    getTaxTypesByTaxGroup(taxGroupId: number, rowIndex: number) {
        this.getTaxesByTaxGroup(taxGroupId, rowIndex);
    }

    getTaxesByTaxGroup(taxGroupId: number, rowIndex: number): void {
        let itemGroupControl = <FormArray>this.InvoiceForm.controls['InvoiceItems'];
        let taxResult = <Observable<Array<any>>>this.taxService.getTaxesByTaxGroup(taxGroupId);
        taxResult.subscribe((data) => {
            if (data != null) {
                this.taxTypes = data;
                itemGroupControl.controls[rowIndex].value.Taxes = [];
                itemGroupControl.controls[rowIndex].patchValue({
                    Taxes: this.taxTypes
                });

            }
        });
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
    VerifyInvoice() {
        this.selectedInvoiceDetails.UpdatedBy = this.userDetails.UserID;
        let invoice: InvoiceDetails = this.InvoiceForm.value;
        if (invoice.SupplierAddress.trim() != '') {
            this.confirmationServiceObj.confirm({
                message: Messages.ReverifyConfirmation,
                header: "Confirmation",
                accept: () => {
                    this.selectedInvoiceDetails.SupplierAddress = invoice.SupplierAddress.trim();
                    this.invoiceReqObj.VerifyInvoice(this.selectedInvoiceDetails).subscribe((x: any) => {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SubmitSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.resetFilters();
                        this.enableOnVerify = false;
                    });
                },
                acceptLabel: "Yes"
            });
        }
        else {
            this.InvoiceForm.get('SupplierAddress').setValidators([Validators.required]);
            this.InvoiceForm.get('SupplierAddress').updateValueAndValidity();
        }
    }
}