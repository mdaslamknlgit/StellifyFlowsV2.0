import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationService } from 'primeng/primeng';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CreditNote, CreditNotesDisplayResult, CreditNoteFilterDisplayInput } from '../../models/credit-note.model';
import { InvoiceDetails, InvoiceList } from '../../models/supplier-invoice.model';
import { Supplier } from '../../models/supplier';
import { CreditNoteService } from "../../services/credit-note.service";
import { SupplierInvoiceService } from "../../services/supplier-invoice.service";
import { FullScreen, ValidateFileType, PrintScreen, restrictMinus } from '../../../shared/shared';
import { Messages, MessageTypes, PagerConfig, Suppliers, Taxes, UserDetails, Invoices, WorkFlowProcess, WorkFlowStatus, WorkFlowApproval, ItemMaster, ITEM_TYPEWPO, SupplierCategoryType, TaxGroup, Location, DocumentExportData, InvoiceSection } from '../../../shared/models/shared.model';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { environment } from '../../../../environments/environment';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { GenericService } from '../../../shared/sevices/generic.service';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { AccountCodeAPIService } from '../../services/account-code-api.service';
import * as moment from 'moment';
import { WorkBook, utils, write } from 'xlsx';
import * as XLSX from 'xlsx';
import { AccountCodeMaster } from '../../models/account-code.model';
import { saveAs } from 'file-saver';
import { SupplierApiService } from '../../services/supplier-api.service';
import { PageAccessLevel, Roles } from '../../../administration/models/role';
import { ControlValidator } from '../../../shared/classes/control-validator';
import { CurrencyMaskInputMode } from 'ngx-currency';
import { SchedulerNo } from '../../models/scheduler-no.model';
import { SchedulerNoService } from '../../services/scheduler-no.service';
import { UtilService } from '../../../shared/services/util.service';
import { DocumentData } from '../../models/project-payment-history.model';
import { TaxService } from '../../services/tax.service';
@Component({
    selector: 'app-credit-note',
    templateUrl: './credit-note.component.html',
    styleUrls: ['./credit-note.component.css'],
    providers: [CreditNoteService, TaxService, SupplierInvoiceService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class CreditNoteComponent implements OnInit {
    options2precision = { prefix: '', precision: 2, inputMode: CurrencyMaskInputMode.NATURAL };
    options2precisionMax = { prefix: '', precision: 2, inputMode: CurrencyMaskInputMode.NATURAL, max: 0.99 };
    pageType: string = "";
    moduleHeading = "";
    hasWorkflow: boolean = false;
    isApprovalPage: boolean = false;
    creditNoteForm: FormGroup;
    CreditNoteRemarksForm: FormGroup;
    voidPopUpTabId: number = 1;
    CreditNoteGridColumns: Array<{ field: string, header: string, width: string }> = [];
    crnTypes: Array<{ disable: boolean, value: string, text: string }> = [];
    invoicesList: Array<InvoiceList> = [];
    departments: Location[] = [];
    companyId: number;
    CreditNoteItemsToDelete: Array<number> = [];
    invoiceRequestid: number;
    creditNoteDetails: CreditNote = new CreditNote();
    Service: AccountCodeMaster;
    itemTYpes = ITEM_TYPEWPO;
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    IsViewMode: boolean = true;
    submitted = false;
    hasCRNType: boolean
    showdropdown: boolean = false;
    IsAdditem: boolean
    linesToAddCostCategory: number = 1;
    taxTypes: Array<Taxes> = [];
    IsReturnQuantity: boolean = false
    uploadedFiles: Array<File> = [];
    userDetails: UserDetails = null;
    CreditnoteId: any
    CreditNoteIdResult: any
    InvoiceTotalAmount: any
    SupplierObj: any
    InViewMode: boolean = false
    EditInvoice: string
    hideInput: boolean = false
    Isupdate: boolean = false
    FileName: any
    _Location: any;
    followWorkflow: boolean = false;
    Tax: number = 0
    _Tax: number = 0
    SubDiscount: number = 0
    PrevTax: any
    GSTAdjust: any
    _CNTotal: number = 0
    _Total: number = 0
    PrevTaxSum: any = []
    GSTAdjustSum: any = []
    _InvoiceDetails: any = []
    IsSubmit: boolean = false
    showGridErrorMessage: boolean = false
    pmoduleHeading: string = "";
    pmoduleMessage: string = "";
    showRemarksPopUp: boolean = false;
    OnGSTAdjchange: boolean = false
    OnTotalAdjchange: boolean = false
    _NetTotal: any
    _NetCreditNote: any
    TaxID: any
    TaxAmount: number
    hideInputItem: boolean = false
    HasPOTypeId: number
    scrollbarOptions: any
    accountCodeCategories: any
    InViewModeCategory: boolean = false
    IsEditClicked: boolean = false
    selectedRowId: number = -1
    HasInputError: boolean = false
    // requestType: string = ""
    apiEndPoint: string;
    ItemLength: number;
    workFlowStatus: any;
    RYQORDIUPExists: boolean = false;
    CheckRTQorDUIExist: boolean = false
    CheckDUIExist: boolean = false
    ReasonToVoid: string
    showLogPopUp: boolean = false
    HasTaxChanged: boolean = false
    ChangedTax: any;
    isReVerifing: boolean = false;
    EditPermission: boolean = false;
    VoidPermission: boolean = false;
    sendForApprovalPermission: boolean = false;
    printPermission: boolean = false;
    exportPermission: boolean = false;
    approvePermission: boolean = false;
    verifyPermission: boolean = false;
    reVerifyPermission: boolean = false;
    viewLogPermission: boolean = false;
    mySelectedItem: any
    currencies: any = []
    supplierCategoryType: Array<number> = [];
    taxGroups: Array<TaxGroup> = [];
    HasDiscount: boolean = false
    hideType: boolean = false
    Original_Discount_obj: any = [];
    SupplierTaxAmount: any
    HasExistingSelected: boolean = false
    HasSendforApproval: boolean = false;
    userRoles = [];
    rolesAccessList = [];
    reportData: DocumentExportData;
    schedulerNoDetails: SchedulerNo[] = [];
    supplierSubCodes = [];
    ExistingVal: any;
    IsFormValueChanges: boolean = false;
    constructor(private formBuilderObj: FormBuilder,
        private creditNoteServiceObj: CreditNoteService,
        private sharedServiceObj: SharedService,
        private genricService: GenericService,
        private sessionServiceObj: SessionStorageService,
        private invoiceServiceObj: SupplierInvoiceService,
        private router: Router,
        private taxService: TaxService,
        private SchedulerMasterServiceObj: SchedulerNoService,
        private ActivateRoute: ActivatedRoute,
        private confirmationServiceObj: ConfirmationService,
        private reqDateFormatPipe: RequestDateFormatPipe,
        private accountCodeAPIService: AccountCodeAPIService,
        private supplierApiService: SupplierApiService,
        private utilService: UtilService
    ) {
        this.companyId = this.sessionServiceObj.getCompanyId();
        this.userDetails = <UserDetails>this.sessionServiceObj.getUser();
        this.supplierCategoryType = [SupplierCategoryType.Internal, SupplierCategoryType.External];
        this.workFlowStatus = WorkFlowStatus;
        this.apiEndPoint = environment.apiEndpoint;
    }

    ngOnInit() {
        this.pageType = this.router.url.indexOf('request') > 0 ? 'request' : 'approval';
        this.moduleHeading = this.pageType == "request" ? "Credit Note" : "Credit Note Approval";
        this.isApprovalPage = this.pageType == "approval" ? true : false;
        this.ActivateRoute.paramMap.subscribe((param: ParamMap) => {
            this.CreditnoteId = isNaN(Number(param.get('id'))) ? 0 : Number(param.get('id'));
        });
        this.ActivateRoute.queryParams.subscribe((params) => {
            this.CreditnoteId = isNaN(Number(params['id'])) ? this.CreditnoteId : Number(params['id']);
            if (params['cid'] != null && params['cid'] != undefined) {
                this.companyId = isNaN(Number(params['cid'])) ? this.companyId : Number(params['cid']);
            }
        });
        this.getSchedulerDetails();
        this.getRoles();
        this.getDepartments(this.companyId);

        this.CreditNoteIdResult = [];
        this.creditNoteForm = this.formBuilderObj.group({
            CreditNoteId: [''],
            DocumentCode: [''],
            CompanyId: [],
            Supplier: new FormControl('', Validators.required),
            SupplierId: [0],
            CreditNoteLineItems: this.formBuilderObj.array([]),
            GetItemMasters: this.formBuilderObj.array([]),
            GetServiceMasters: this.formBuilderObj.array([]),
            InvoiceId: [null, Validators.required],
            InvoiceTotalAmount: [0],
            CurrencySymbol: [""],
            SupplierCreditNoteDate: new FormControl(null),
            SupplierCreditNoteNo: new FormControl(''),
            CRNType: ['', Validators.required],
            Reasons: new FormControl(''),
            files: [''],
            SupplierName: [''],
            SubCodeId: new FormControl(''),
            LocationID: ['', Validators.required],
            Name: [0],
            Adjustment: [0],
            GSTAdjustment: [0],
            SubTotal: [0],
            InvoiceCode: [0],
            TotalAdjustment: [0, [Validators.max(0.99)]],
            SubItemGSTAdjustment: [0, ControlValidator.Validator],
            NetTotal: [0],
            CreditNoteTotal: [0],
            ReasonToVoid: [0],
            InvoiceOSAmount: [0],
            SupplierCreditNoteInvoiceNo: [''],
            SupplierType: [this.supplierCategoryType[1], Validators.required],
            SupplierAddress: [''],
            SupplierCreditNoteInvoiceDate: [new Date()],
            CurrencyType: ['', Validators.required],
            CreationDate: [new Date()],
            CreditNoteRequestor: [0],
            TaxGroupName: [''],
            TotalbefTax: [0],
            Code: [''],
            SupplierCode: [''],
            Discount: [''],
            TotalGSTAmount: [''],
            SubTotalDiscount: [''],
            SchedulerNo: [0],
            WorkFlowStatusId: [0],
            CreatedBy: [0],
            Remarks: [''],
            SchedulerNumber: ['']
        });
        this.CreditNoteRemarksForm = this.formBuilderObj.group({
            Reasons: new FormControl('', [Validators.required, ControlValidator.Validator]),
            StatusId: [0]
        });
        if (this.CreditnoteId > 0) {
            this.GetCreditNoteDetails();
        } else {
            this.hasCRNType = true;
            this.IsAdditem = false
            this.hideInputItem = false
            this.setColumns();
        }
        this.creditNoteDetails = new CreditNote();
        this.creditNoteDetails.CreatedBy = this.userDetails.UserID;
        // this.getTaxTypes();
        this.getTaxNameGroups();
        this.getCurrenceis();
        $('.fixed').attr('checked', 'checked');
        this.mySelectedItem = 2;
        this.ExistingVal = this.creditNoteForm.value;
        this.creditNoteForm.valueChanges.subscribe(form => {
            let changes = false;  //(this.IsSaveFlag && this.creditNoteForm.valid) ? true : false;
            for (var key in this.ExistingVal) {
                if (this.ExistingVal[key] != null)
                    if (this.ExistingVal[key].toString().trim() != form[key].toString().trim()) {
                        changes = true;
                        break;
                    }
            }
            this.IsFormValueChanges = changes;
        });
        var panelwidth = $(".rightPanel").width() -30;
        $(".tablescroll").css("width", panelwidth)
    }
    findChanges() {
        this.creditNoteForm.valueChanges.subscribe(form => {
            let changes = false;
            for (var key in this.ExistingVal) {
                if (this.ExistingVal[key] != null)
                    if (this.ExistingVal[key].toString().trim() != form[key].toString().trim()) {
                        changes = true;
                        break;
                    }
            }
            this.IsFormValueChanges = changes;
        });
    }
    getRoles() {
        let userDetails = <UserDetails>this.sessionServiceObj.getUser();
        if (this.companyId > 0) {
            this.sharedServiceObj.getUserRolesByCompany(userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
                this.userRoles = roles;
                userDetails.Roles = this.userRoles;
                this.sessionServiceObj.setUser(userDetails);
                let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
                if (roleIds != '') {
                    this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
                        this.rolesAccessList = data;
                        this.sessionServiceObj.setRolesAccess(this.rolesAccessList);
                        let roleAccessLevels = this.sessionServiceObj.getRolesAccess();
                        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                            this.ClearPermissions();
                            let withInvRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "creditnotewithinvoice")[0];
                            let withOutInvRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "creditnotewithoutinvoice")[0];
                            let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "creditnoteapprovals")[0];
                            let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
                            this.viewLogPermission = auditLogRole.IsView;
                            if (this.isApprovalPage) {
                                this.approvePermission = approvalRole.IsApprove;
                                this.verifyPermission = approvalRole.IsVerify;
                            }
                            if (!this.isApprovalPage) {
                                this.EditPermission = (withInvRole.IsEdit) ? (withInvRole.IsEdit) : (withOutInvRole.IsEdit);
                                this.VoidPermission = (withInvRole.IsVoid) ? (withInvRole.IsVoid) : (withOutInvRole.IsVoid);
                                this.printPermission = (withInvRole.IsPrint) ? (withInvRole.IsPrint) : (withOutInvRole.IsPrint);
                                this.exportPermission = (withInvRole.IsExport) ? (withInvRole.IsExport) : (withOutInvRole.IsExport);
                                this.reVerifyPermission = (withInvRole.IsVerify) ? (withInvRole.IsVerify) : (withOutInvRole.IsVerify);
                                this.sendForApprovalPermission = (withInvRole.IsApprove) ? (withInvRole.IsApprove) : (withOutInvRole.IsApprove);
                            }
                            this.crnTypes = [
                                { disable: !(withInvRole.IsAdd), value: 'Withinvoice', text: 'With Invoice' },
                                { disable: !(withOutInvRole.IsAdd), value: 'WithOutinvoice', text: 'With-out Invoice' }
                            ];
                        }
                    });
                }
            });
        }
    }
    getSchedulerDetails() {
        this.SchedulerMasterServiceObj.GetSchedulerNo().subscribe((result) => {
            if (result != null) {
                this.schedulerNoDetails = result['SchedulerNos']
            }
        })
    }
    GetCreditNoteDetails() {
        this.creditNoteServiceObj.getCreditNoteById(this.CreditnoteId).subscribe((result: CreditNote) => {
            if (result != null) {
                this.creditNoteDetails = result;
                this.SupplierTaxAmount = this.creditNoteDetails.CreditNoteLineItems[0].TaxAmount
                this.InViewMode = true;
                this.getSupplierSubCodes(this.creditNoteDetails.SupplierId, this.companyId);
                this.creditNoteForm.patchValue(result);
                if (result.SupplierCreditNoteDate != null)
                    this.creditNoteForm.get('SupplierCreditNoteDate').setValue(new Date(result.SupplierCreditNoteDate));
                this.creditNoteForm.get('SupplierType').setValue(result.SupplierType == 1 ? this.supplierCategoryType[0] : this.supplierCategoryType[1]);
                this.creditNoteForm.get('CRNType').setValue(result.InvoiceId == 0 ? 'WithOutinvoice' : 'Withinvoice');
            }
            let itemGroupControl = new FormArray([]);
            var noOfLines = this.creditNoteDetails.CreditNoteLineItems.length;
            itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
            itemGroupControl.controls = [];
            itemGroupControl.controls.length = 0;
            for (let i = 0; i < noOfLines; i++) {
                // if (this.HasExistingSelected == false) {
                //     if ((this.creditNoteDetails.CreditNoteLineItems[i].IsDeleted == false || this.creditNoteDetails.CreditNoteLineItems[i].IsDeleted == null) && (this.creditNoteDetails.CreditNoteLineItems[i].ItemQty != 0 || this.creditNoteDetails.CreditNoteLineItems[i].Unitprice != 0)) {
                //         itemGroupControl.push(this.initGridRows());
                //         this.HasPOTypeId = this.creditNoteDetails.CreditNoteLineItems[i].POTypeId
                //         this.BindSubItem(i)
                //     }
                // } else {
                //     if ((this.creditNoteDetails.CreditNoteLineItems[i].IsDeleted == false || this.creditNoteDetails.CreditNoteLineItems[i].IsDeleted == null) && (this.creditNoteDetails.CreditNoteLineItems[i].ReturnQty != 0 || this.creditNoteDetails.CreditNoteLineItems[i].DecreaseInUnitPrice != 0)) {
                //         itemGroupControl.push(this.initGridRows());
                //         this.HasPOTypeId = this.creditNoteDetails.CreditNoteLineItems[i].POTypeId
                //         this.BindSubItem(i)
                //     }
                // }

                if ((this.creditNoteDetails.CreditNoteLineItems[i].IsDeleted == false || this.creditNoteDetails.CreditNoteLineItems[i].IsDeleted == null)) {
                    itemGroupControl.push(this.initGridRows());
                    this.HasPOTypeId = this.creditNoteDetails.CreditNoteLineItems[i].POTypeId;
                    this.BindSubItem(i);
                }
            }
            // if (this.HasExistingSelected == false) {
            //     let LineItem = this.creditNoteDetails.CreditNoteLineItems.filter(i => i.IsDeleted == false || i.IsDeleted == null && i.Unitprice != 0 || (i.ItemQty != 0 || i.Unitprice != 0))
            //     this.creditNoteForm.get('CreditNoteLineItems').patchValue(LineItem)
            // } else {
            //     let LineItem = this.creditNoteDetails.CreditNoteLineItems.filter(i => i.IsDeleted == false || i.IsDeleted == null && (i.ReturnQty != 0 || i.DecreaseInUnitPrice != 0))
            //     this.creditNoteForm.get('CreditNoteLineItems').patchValue(LineItem)
            // }

            let LineItem = this.creditNoteDetails.CreditNoteLineItems.filter(i => i.IsDeleted == false || i.IsDeleted == null)
            this.creditNoteForm.get('CreditNoteLineItems').patchValue(LineItem);

            if (this.creditNoteDetails.InvoiceId == 0) {
                this.hideInputItem = true;
                this.hasCRNType = true;
            } else {
                this.hideInputItem = false
                this.hasCRNType = false;
            }
            this.setColumns();
            this.onDeptChange();
            this.ExistingVal = this.creditNoteForm.value;
        })
    }

    initGridRows() {
        return this.formBuilderObj.group({
            //Description: [0],
            ItemDescription: [''],
            CNId: [0],
            CNDetailsId: [0],
            UpdatedQty: [0],
            UpdatedPrice: [0],
            InvoiceItemId: [0],
            ItemQty: [0],
            TaxGroupId: [0],
            GSTAmount: [0],
            GSTAdjustment: [0],
            Unitprice: [0],
            ReturnQty: [0],
            TaxID: [0, [Validators.required]],
            TaxName: [0],
            ReturnValue: [0],
            DecreaseInUnitPrice: [0],
            CNTotalValue: [0],
            TaxAmount: [0],
            Tax: [0],
            Discount: [0],
            TypeId: [0],
            Item: [0],
            Service: [''],
            ItemName: [0],
            ItemType: ['Item'],
            ItemMasterId: [0],
            AccountCodeId: [0],
            AccountCodeCategoryId: [0],
            AccountCodeName: [0],
            CPONumber: [''],
            POTypeId: [0],
            GlDescription: [''],
            IsDeleted: [0],
            Code: [0],
            TotalbefTax: [0],
            Total: [0],
            TaxGroupName: [''],
            OriginalUnitprice: [0],
            OriginaltemQty: [0],
            OriginalDiscount: [0]
        });
    }

    getCurrenceis(): void {
        let currenciesResult = <Observable<Array<any>>>this.supplierApiService.getCurrencies();
        currenciesResult.subscribe((data) => {
            this.currencies = data;
        });
    }
    setColumns() {
        this.CreditNoteGridColumns = [];
        if (this.hasCRNType) {
            this.CreditNoteGridColumns = [
                { field: 'SNo', header: 'S.no.', width: '40px' },
                { field: 'ItemType', header: 'Item Type', width: '140px' },
                { field: 'Name(GLCode)', header: 'Name (GLCode)', width: '250px' },
                { field: 'Description', header: 'Description', width: '250px' },
                { field: 'Quantity', header: 'Quantity', width: '140px' },
                { field: 'Unitprice', header: 'Unit Price', width: '140px' },
                { field: 'ReturnQuantity', header: 'Return Quantity', width: '140px' },
                { field: 'DecreaseInUnitPrice', header: 'Decrease In Unit Price', width: '140px' },
                { field: 'Total', header: 'Total', width: '85px' },
                { field: 'Discount', header: 'Discount', width: '100px' },
                { field: 'TotalbefTax', header: 'Total bef Tax(Cur)', width: '150px' },
                { field: 'TaxGroup', header: 'TaxGroup', width: '150px' },
                { field: 'TaxType', header: 'Tax Type', width: '150px' },
                { field: 'Tax', header: 'Tax Amount', width: '90px' },
                { field: 'CNTotalValue', header: 'Line Total', width: '180px' },
                // { field: 'PrevTax', header: 'Prev Tax', width: '85px' },
                // { field: 'GST', header: 'GST Adjustment', width: '100px' },
                { field: 'Option', header: 'Action', width: '70px' },

            ];
        } else {
            if (this.HasPOTypeId != null && this.HasPOTypeId != undefined) {
                if (this.HasPOTypeId == 0 || this.HasPOTypeId == 1 || this.HasPOTypeId == 2 || this.HasPOTypeId == 3) {

                    this.CreditNoteGridColumns = [
                        { field: 'SNo', header: 'S.no.', width: '40px' },
                        { field: 'ItemType', header: 'Item Type', width: '140px' },
                        { field: 'Name(GLCode)', header: 'Name (GLCode)', width: '250px' },
                        { field: 'Description', header: 'Description', width: '250px' },
                        { field: 'OriginalQuantity', header: 'Quantity(Orig)', width: '140px' },

                        { field: 'Quantity', header: 'Open Quantity', width: '140px' },
                        { field: 'OriginalUnitprice', header: 'Unit Price(Orig)', width: '140px' },

                        { field: 'Unitprice', header: 'Remaining Unit Price', width: '140px' },
                        { field: 'ReturnQuantity', header: 'Return Quantity', width: '140px' },
                        { field: 'DecreaseInUnitPrice', header: 'Decrease In Unit Price', width: '140px' },
                        { field: 'Total', header: 'Total', width: '200px' },
                        { field: 'Discount', header: 'Discount', width: '100px' },
                        { field: 'TotalbefTax', header: 'Total bef Tax(Cur)', width: '150px' },
                        { field: 'TaxGroup', header: 'TaxGroup', width: '120px' },
                        { field: 'TaxType', header: 'Tax Type', width: '120px' },
                        { field: 'Tax', header: 'Tax Amount', width: '140px' },
                        { field: 'CNTotalValue', header: 'Line Total', width: '180px' },
                        // { field: 'PrevTax', header: 'Prev Tax', width: '140px' },
                        // { field: 'GST', header: 'GST Adjustment', width: '140px' },
                        { field: 'Option', header: 'Action', width: '70px' },

                    ];

                } else if (this.HasPOTypeId == 5 || this.HasPOTypeId == 6) {
                    this.CreditNoteGridColumns = [
                        { field: 'SNo', header: 'S.no.', width: '40px' },
                        { field: 'ItemCategory', header: 'Item Category', width: '140px' },
                        { field: 'ItemType', header: 'Item Type', width: '250px' },
                        { field: 'POCID', header: 'POC ID', width: '250px' },

                        { field: 'Description', header: 'Description', width: '250px' },
                        { field: 'OriginalQuantity', header: 'Quantity(Orig)', width: '140px' },

                        { field: 'Quantity', header: 'Open Quantity', width: '140px' },
                        { field: 'OriginalUnitprice', header: 'Unit Price(Orig)', width: '140px' },

                        { field: 'Unitprice', header: 'Remaining Unit Price', width: '140px' },
                        { field: 'ReturnQuantity', header: 'Return Quantity', width: '140px' },
                        { field: 'DecreaseInUnitPrice', header: 'Decrease In Unit Price', width: '140px' },
                        { field: 'Total', header: 'Total', width: '140px' },
                        // { field: 'Discount', header: 'Discount', width: '100px' },
                        { field: 'TotalbefTax', header: 'Total bef Tax(Cur)', width: '150px' },
                        { field: 'TaxGroup', header: 'TaxGroup', width: '120px' },
                        { field: 'TaxType', header: 'Tax Type', width: '120px' },
                        { field: 'Tax', header: 'Tax Amount', width: '140px' },
                        { field: 'CNTotalValue', header: 'Line Total', width: '180px' },
                        // { field: 'PrevTax', header: 'Prev Tax', width: '140px' },
                        // { field: 'GST', header: 'GST Adjustment', width: '100px' },
                        { field: 'Option', header: 'Action', width: '70px' },

                    ];

                }
            } else {

                this.CreditNoteGridColumns = [
                    { field: 'SNo', header: 'S.no.', width: '40px' },
                    { field: 'ItemType', header: 'Item Type', width: '140px' },
                    { field: 'Name(GLCode)', header: 'Name (GLCode)', width: '250px' },
                    { field: 'Description', header: 'Description', width: '250px' },
                    { field: 'OriginalQuantity', header: 'Quantity(Orig)', width: '140px' },

                    { field: 'Quantity', header: 'Open Quantity', width: '140px' },
                    { field: 'OriginalUnitprice', header: 'Unit Price(Orig)', width: '140px' },

                    { field: 'Unitprice', header: 'Remaining Unit Price', width: '140px' },
                    { field: 'ReturnQuantity', header: 'Return Quantity', width: '140px' },
                    { field: 'DecreaseInUnitPrice', header: 'Decrease In Unit Price', width: '140px' },
                    { field: 'Total', header: 'Total', width: '85px' },
                    { field: 'Discount', header: 'Discount', width: '100px' },
                    { field: 'TotalbefTax', header: 'Total bef Tax(Cur)', width: '150px' },
                    { field: 'TaxGroup', header: 'TaxGroup', width: '150px' },
                    { field: 'TaxType', header: 'Tax Type', width: '150px' },
                    { field: 'Tax', header: 'Tax Amount', width: '90px' },
                    { field: 'CNTotalValue', header: 'Line Total', width: '180px' },
                    // { field: 'PrevTax', header: 'Prev Tax', width: '85px' },
                    // { field: 'GST', header: 'GST Adjustment', width: '100px' },
                    { field: 'Option', header: 'Action', width: '70px' },

                ];
            }
        }



    }


    supplierInputFormater = (x: Suppliers) => x.SupplierName;
    itemMasterInputFormater = (x: ItemMaster) => x.ItemName;

    TaxTypeId: number
    onSupplierChange(event: any) {
        let supplierDetails: Supplier;
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];

        this.ClearControlForm()
        if ((event != null && event != undefined) && (event.item.WorkFlowStatus != null) && (event.item.WorkFlowStatus === "Approved")) {
            if (event != null && event != undefined) {
                supplierDetails = event.item;
                this.getSupplierSubCodes(supplierDetails.SupplierId, this.companyId);
                this.TaxID = supplierDetails.TaxID;
                this.TaxTypeId = supplierDetails.TaxGroupId;
                if (this.hasCRNType)
                    this.SupplierTaxAmount = supplierDetails.TaxAmount;
                if (supplierDetails.TaxAmount)
                    this.TaxAmount = supplierDetails.TaxAmount;
                this.creditNoteForm.controls['SupplierCode'].patchValue(supplierDetails.SupplierCode);
                this.creditNoteForm.controls['SupplierType'].patchValue(supplierDetails.SupplierTypeID);
                this.creditNoteForm.controls['SupplierAddress'].patchValue(supplierDetails.SupplierAddress);
                this.creditNoteForm.get('CurrencyType').setValue(event.item.CurrencyId);
            }

            if (event != null && event != undefined) {
                for (let i = 0; i < itemGroupControl.length; i++) {
                    itemGroupControl.controls[i].get('TaxID').setValue(supplierDetails.TaxID);
                    itemGroupControl.controls[i].get('TaxGroupId').setValue(supplierDetails.TaxGroupId);
                    itemGroupControl.controls[i].get('TaxAmount').setValue(supplierDetails.TaxAmount);
                }
            }

            this.creditNoteServiceObj.getInvoicesBySupplier(supplierDetails.SupplierId, this.companyId).subscribe((data: InvoiceList[]) => {
                this.invoicesList = data;
                console.log(data)
            });
            this.findChanges();
        }
        else {
            this.creditNoteForm.get('Supplier').setValue(null);
            event.preventDefault();
            return false;
        }
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
                    let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        //let InvoiceItemId = itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;
                        // itemGroupControl.controls[this.selectedRowId].reset();
                        //itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').setValue(InvoiceItemId);
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

    subCodeChange(value: number) {
        let supplierCode = this.utilService.getSupplierCode(this.creditNoteForm.get('SupplierCode').value, '00');
        if (this.supplierSubCodes.length > 0 && value > 0) {
            let supplier = this.supplierSubCodes.find(s => s.SubCodeId == value);
            if (supplier) {
                let supplierCode = this.creditNoteForm.get('SupplierCode').value;
                this.creditNoteForm.get('SupplierCode').setValue(this.utilService.getSupplierCode(supplierCode, supplier.SubCode));
            }
            else {
                this.creditNoteForm.get('SupplierCode').setValue(supplierCode);
            }
        }
        else {
            this.creditNoteForm.get('SupplierCode').setValue(supplierCode);
        }
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
                    let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        //let InvoiceItemId = itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;
                        // itemGroupControl.controls[this.selectedRowId].reset();
                        //itemGroupControl.controls[this.selectedRowId].get('InvoiceItemId').setValue(InvoiceItemId);
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
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCodeMaster>control.get('Service').value;
        });
        return data;
    }

    getTaxNameGroups(): void {
        let taxGroupResult = <Observable<Array<any>>>this.sharedServiceObj.getTaxGroupList();
        taxGroupResult.subscribe((groups) => {
            this.taxGroups = groups;
            this.getTaxTypes(this.taxGroups[0].TaxGroupId)
        });
    }

    getSelectedServicesList(data: AccountCodeMaster[]) {
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCodeMaster>control.get('Service').value;
        });
        return data;
    }

    ExpenseMasterSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        this.HasTaxChanged = false
        let cndetailsId: number = Number(itemGroupControl.controls[index].get('CNDetailsId').value);
        //setting the existing qty based on user selection 
        if (cndetailsId == 0) {
            itemGroupControl.controls[index].patchValue({
                ItemDescription: eventData.item.Description,
                AccountCodeId: eventData.item.AccountCodeId,
                GlDescription: eventData.item.AccountCodeName,
                AccountCodeName: eventData.item.AccountCodeName,
                ItemQty: 1,
                ItemType: 'Expense',
                //Unitprice: 0,
                Totalprice: 0,
                TotalbefTax: 0,
                // TaxAmount: 0,
                Discount: 0,
                ReturnQty: 0,
                DecreaseInUnitPrice: 0,
                TaxID: this.TaxID == undefined ? 1 : this.TaxID,
                TaxGroupName: this.TaxTypeId == undefined ? 1 : this.TaxTypeId,
                TaxGroupId: this.TaxTypeId == undefined ? 1 : this.TaxTypeId
            });
        }
        else {
            itemGroupControl.controls[index].patchValue({
                CNDetailsId: cndetailsId,
                ItemType: 'Expense',
                ItemDescription: eventData.item.Description,
                AccountCodeId: eventData.item.AccountCodeId,
                GlDescription: eventData.item.AccountCodeName,
                AccountCodeName: eventData.item.AccountCodeName
            });
        }
        $('.Item' + index).css('border-color', '')
        $('.QTY' + index).css('border-color', '')
    }

    serviceMasterSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        this.HasTaxChanged = false
        let cndetailsId: number = Number(itemGroupControl.controls[index].get('CNDetailsId').value);
        //setting the existing qty based on user selection 
        if (cndetailsId == 0) {
            itemGroupControl.controls[index].patchValue({
                ItemDescription: eventData.item.Description,
                AccountCodeId: eventData.item.AccountCodeId,
                GlDescription: eventData.item.AccountCodeName,
                AccountCodeName: eventData.item.AccountCodeName,
                Code: eventData.item.Code,
                ItemQty: 1,
                //Unitprice: 0,
                ItemType: 'Service',
                Totalprice: 0,
                TotalbefTax: 0,
                // TaxAmount: 0,
                Discount: 0,
                ReturnQty: 0,
                DecreaseInUnitPrice: 0,
                TaxID: this.TaxID == undefined ? 1 : this.TaxID,
                TaxGroupName: this.TaxTypeId == undefined ? 1 : this.TaxTypeId,
                TaxGroupId: this.TaxTypeId == undefined ? 1 : this.TaxTypeId

            });
        }
        else {
            itemGroupControl.controls[index].patchValue({
                CNDetailsId: cndetailsId,
                ItemType: 'Service',
                ItemDescription: eventData.item.Description,
                AccountCodeId: eventData.item.AccountCodeId,
                GlDescription: eventData.item.AccountCodeName,
                AccountCodeName: eventData.item.AccountCodeName,
                Code: eventData.item.Code
            });
        }
        $('.Item' + index).css('border-color', '')
        $('.QTY' + index).css('border-color', '')
    }

    onItemTypeChange(itemType: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        let cnDetailsId = itemGroupControl.controls[rowIndex].get('CNDetailsId').value;
        if (itemGroupControl.controls[rowIndex] != undefined) {
            itemGroupControl.controls[rowIndex].reset();
            if (this.CreditnoteId > 0) {
                itemGroupControl.controls[rowIndex].patchValue({
                    CNDetailsId: cnDetailsId,
                    ItemQty: 1,
                    Totalprice: 0,
                    TotalbefTax: 0,
                    Discount: 0,
                    ReturnQty: 0,
                    DecreaseInUnitPrice: 0,
                    TaxID: this.TaxID == undefined ? 1 : this.TaxID,
                    TaxGroupName: this.TaxTypeId == undefined ? 1 : this.TaxTypeId,
                    TaxGroupId: this.TaxTypeId == undefined ? 1 : this.TaxTypeId
                });
            }
        }
        if (Number(itemType) === 1) {
            itemGroupControl.controls[rowIndex].get('Item').setValidators([Validators.required]);
            itemGroupControl.controls[rowIndex].get('Item').updateValueAndValidity();
        }
        else {
            itemGroupControl.controls[rowIndex].get('Item').clearValidators();
            itemGroupControl.controls[rowIndex].get('Item').updateValueAndValidity();

        }
        itemGroupControl.controls[rowIndex].get('TypeId').setValue(Number(itemType));
        itemGroupControl.controls[rowIndex].get('TaxID').setValue(this.TaxID);

    }

    ClearControlForm() {
        this.creditNoteForm.get('InvoiceTotalAmount').setValue('');
        this.creditNoteForm.get('InvoiceId').setValue('0');
        this.creditNoteForm.get('SupplierCreditNoteInvoiceNo').setValue('');
        this.creditNoteForm.get('SupplierCreditNoteInvoiceDate').setValue('');
        this.creditNoteForm.get('SupplierCode').setValue('');
        this.creditNoteForm.get('SupplierAddress').setValue('');
        this.creditNoteForm.get('CurrencyType').setValue('');

        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        itemGroupControl.reset();
        itemGroupControl.removeAt(0);
        itemGroupControl.controls = []
    }

    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                if (term == "") {
                    this.clearForm();
                    this.ClearControlForm();
                    this.invoicesList = [];
                    this.invoicesList.length = 0;
                    return of([]);
                }
                let params = {
                    searchKey: term,
                    supplierTypeId: (this.creditNoteForm.get('SupplierType').value != null ? this.creditNoteForm.get('SupplierType').value : 0),
                    companyId: this.companyId
                };
                if (this.creditNoteForm.get('CRNType').value == 'Withinvoice') {
                    return this.sharedServiceObj.getSuppliers(params).pipe(catchError(() => { return of([]); }));
                }
                if (this.creditNoteForm.get('CRNType').value == 'WithOutinvoice') {
                    return this.sharedServiceObj.getActiveSuppliers(params).pipe(catchError(() => { return of([]); }));
                }
            })
        );



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
                    return of([]);
                }

                return this.sharedServiceObj.getItemMasterByKey({
                    searchKey: term,
                    CompanyId: this.companyId,
                    LocationID: null  //selectedDepartmentId
                }).map((data: ItemMaster[]) => {
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
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <ItemMaster>control.get('Item').value;
        });
        return data;
    }

    itemMasterSelection(eventData: any, index: number) {
        // console.log(this.TaxGroupId);
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        this.HasTaxChanged = false
        let cndetailsId: number = Number(itemGroupControl.controls[index].get('CNDetailsId').value);
        //setting the existing qty based on user selection 
        if (cndetailsId == 0) {
            itemGroupControl.controls[index].patchValue({
                ItemDescription: eventData.item.ItemName,
                ItemMasterId: eventData.item.ItemMasterId,
                GlDescription: eventData.item.ItemName,
                ItemQty: 1,
                //Unitprice: 0,
                ItemType: 'Item',
                Totalprice: 0,
                TotalbefTax: 0,
                // TaxAmount: 0,
                Discount: 0,
                ReturnQty: 0,
                DecreaseInUnitPrice: 0,
                TaxID: this.TaxID == undefined ? 1 : this.TaxID,
                TaxGroupName: this.TaxTypeId == undefined ? 1 : this.TaxTypeId,
                TaxGroupId: this.TaxTypeId == undefined ? 1 : this.TaxTypeId


            });
        } else {
            itemGroupControl.controls[index].patchValue({
                CNDetailsId: cndetailsId,
                ItemType: 'Item',
                ItemDescription: eventData.item.ItemName,
                ItemMasterId: eventData.item.ItemMasterId,
                GlDescription: eventData.item.ItemName
            });
        }
        $('.Item' + index).css('border-color', '')
        $('.QTY' + index).css('border-color', '')

    }


    onClickedOutside(e: Event) {
        $(".tablescroll").removeClass("hidescroll")
    }
    itemClick(rowId: number) {
        setTimeout(function () {
            $(".tablescroll").addClass("hidescroll")
        }, 1000);
        this.selectedRowId = rowId;
    }


    clearForm() {
        //resetting the item category form.
        //this.creditNoteForm.reset();
        //this.creditNoteForm.get('CreditNoteLineItems').reset();
        this.creditNoteForm.setErrors(null);
        // let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        // itemGroupControl.controls = [];
        // itemGroupControl.setValue([]);
        // itemGroupControl.controls.length = 0;
    }
    porInputFormater = (x: Invoices) => x.InvoiceCode;
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    porSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getINVRequest({
                    Search: term,
                    SupplierId: this.creditNoteForm.get('Supplier').value == null ? 0 : this.creditNoteForm.get('Supplier').value.SupplierId,
                    CompanyId: this.companyId
                }).map((data: Array<any>) => {
                    this.creditNoteForm.get('InvoiceTotalAmount').setValue('');
                    this.creditNoteForm.get('SupplierCreditNoteInvoiceNo').setValue('');
                    this.creditNoteForm.get('SupplierCreditNoteInvoiceDate').setValue('');
                    this.creditNoteForm.get('SchedulerNo').setValue('');
                    let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
                    itemGroupControl.reset();
                    itemGroupControl.removeAt(0);
                    itemGroupControl.controls = []
                    data.forEach((item, index) => {
                        item.index = index;
                    });
                    return data;
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
        );

    onInvoiceSelection(event?: any) {
        this.invoiceRequestid = event.item.InvoiceId;
        this.HasPOTypeId = event.item.POTypeId;
        this.creditNoteForm.get('InvoiceTotalAmount').setValue(event.item.TotalAmount);
        this.creditNoteForm.get('SupplierCreditNoteInvoiceNo').setValue(event.item.SupplierRefNo);
        this.creditNoteForm.get('SupplierCreditNoteInvoiceDate').setValue(event.item.InvoiceDate);
        this.creditNoteForm.get('SupplierCreditNoteInvoiceDate').setValue(event.item.InvoiceDate);
        this.creditNoteForm.get('SchedulerNo').setValue(event.item.SchedulerId);
        this.creditNoteForm.get('SupplierCode').setValue(event.item.SupplierCode);
        this.creditNoteForm.get('SubCodeId').setValue(event.item.SupplierSubCodeId);
        this.creditNoteForm.get('SupplierAddress').setValue(event.item.SupplierAddress);
        let invoiceDetails = this.invoicesList.find(j => j.InvoiceId == this.invoiceRequestid);
        if (invoiceDetails == undefined) {
            this.clearForm();
        }
        else {
            this.creditNoteForm.get('InvoiceTotalAmount').setValue(invoiceDetails.TotalAmount);
            this.creditNoteForm.get('InvoiceOSAmount').setValue(invoiceDetails.OutStandingAmount);
            this.creditNoteForm.get('CurrencySymbol').setValue(invoiceDetails.CurrencySymbol);
            this.creditNoteForm.get('Name').setValue(invoiceDetails.Location);
            this.creditNoteForm.get('CurrencyType').setValue(event.item.CurrencyId);
            this.creditNoteForm.get('LocationID').setValue(event.item.LocationId);
            this.onDeptChange();
            this.creditNoteServiceObj.Get_Existing_InvoiceId(this.invoiceRequestid).subscribe((data: CreditNotesDisplayResult) => {
                if (data.CreditNotes.length > 0) {
                    this.CreditnoteId = data.CreditNotes[0].CreditNoteId
                    this.HasExistingSelected = true
                    this.confirmationServiceObj.confirm({
                        message: "Do you want to use the existing Credit Note ?",
                        header: "Confirmation",
                        acceptLabel: "Yes",
                        rejectLabel: "No",
                        accept: () => {
                            this.IsEditClicked = false;
                            this.GetCreditNoteDetails();
                        }
                        ,
                        reject: () => {
                            this.IsFormValueChanges = false;
                            this.Close();
                        }
                    });
                } else {
                    this.HasExistingSelected = false;
                    this.Get_Invoice_Details();
                }
            })

        }
        this.subCodeChange(event.item.SupplierSubCodeId);
        this.findChanges();
    }

    Get_Invoice_Details() {
        this.creditNoteServiceObj.GetCreditNoteINVDetails(this.invoiceRequestid)
            .subscribe((data: InvoiceDetails) => {
                this._InvoiceDetails = data;
                this.setColumns();
                this.getAccountCodeCategories(this.companyId);
                if (!this.hasCRNType)
                    this.SupplierTaxAmount = this._InvoiceDetails[0].TaxAmount
                this.InViewModeCategory = true
                let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
                itemGroupControl.controls = [];
                itemGroupControl.controls.length = 0;
                var _InvoiceDetails_obj = this._InvoiceDetails.filter(i => i.ItemQty > 0 && i.Unitprice > 0)
                this.addGridItem(_InvoiceDetails_obj.length, _InvoiceDetails_obj, 0);
                this.creditNoteForm.patchValue({
                    CreditNoteLineItems: _InvoiceDetails_obj
                });
                // var lineItem = this.creditNoteDetails.CreditNoteLineItems.filter(i => i.ItemQty > 0)
                // this.creditNoteForm.controls['CreditNoteLineItems'].patchValue(lineItem)

                if (this._InvoiceDetails.length > 0) {
                    this.showGridErrorMessage = false
                }
                for (let i = 0; i < itemGroupControl.length; i++) {

                    if (itemGroupControl.controls[i].get('Discount').value < 0) {
                        itemGroupControl.controls[i].get('Discount').setValue(0)
                        this._InvoiceDetails[i].Discount = 0
                    }

                    this.Original_Discount_obj.push(this._InvoiceDetails[i].Discount)
                    itemGroupControl.controls[i].get('OriginalDiscount').setValue(this._InvoiceDetails[i].OriginalDiscount);
                    itemGroupControl.controls[i].get('GSTAmount').setValue(this._InvoiceDetails[i].CurrentTaxTotal);
                    itemGroupControl.controls[i].get('TaxGroupName').setValue(this.TaxTypeId);

                    if (this.CreditnoteId == 0) {
                        itemGroupControl.controls[i].get('ReturnQty').setValue(0);
                        itemGroupControl.controls[i].get('DecreaseInUnitPrice').setValue(0);
                    }

                    if (this._InvoiceDetails[i].POTypeId == 2) {
                        itemGroupControl.controls[i].get('AccountCodeName').setValue('Assets');
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

    attachmentDelete(attachmentIndex: number) {

        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let attachmentRecord = this.creditNoteDetails.Attachments[attachmentIndex];
                attachmentRecord.IsDelete = true;
                this.creditNoteDetails.Attachments = this.creditNoteDetails.Attachments.filter((obj, index) => index > -1);
            },
            reject: () => {
            }
        });

    }


    getTaxTypes(taxgroupId) {
        this.taxService.getTaxesByTaxGroup(taxgroupId).subscribe((data: Taxes[]) => {
            console.log(data)
            this.taxTypes = data;
        });
    }


    getDepartments(companyId: number) {
        this.sharedServiceObj.getUserDepartments(companyId, WorkFlowProcess.CreditNote, this.userDetails.UserID)
            .subscribe((data: Location[]) => {
                this.departments = data;
            });
    }

    //adding row to the grid..
    addGridItem(noOfLines: number, stringvalue, index: number) {
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        for (let i = 0; i < noOfLines; i++) {
            // if (this.creditNoteDetails.CreditNoteLineItems[i].ItemQty > 0) {
            //     itemGroupControl.push(this.initGridRows());
            // }
            itemGroupControl.push(this.initGridRows());
            itemGroupControl.controls.forEach((data, index) => {
                this.ItemLength = itemGroupControl.length - 1

                if (this.TaxID) {
                    data.get('TaxGroupName').setValue(1);

                    data.get('TaxID').setValue(this.TaxID);
                    data.get('TaxGroupName').setValue(this.TaxTypeId);
                    if (this.TaxAmount)
                        data.get('TaxAmount').setValue(this.TaxAmount);
                    else if (data.get('TaxAmount'))
                        data.get('TaxAmount').setValue(data.get('TaxAmount').value);
                    else
                        data.get('TaxAmount').setValue(7);

                    data.get('ReturnQty').patchValue(itemGroupControl.controls[index].get('ReturnQty').value > 0 ? itemGroupControl.controls[index].get('ReturnQty').value : 0)
                    data.get('DecreaseInUnitPrice').patchValue(0)

                } else {
                    data.get('TaxID').setValue(this.creditNoteDetails.CreditNoteLineItems[index].TaxID);
                    data.get('TaxGroupName').setValue(this.creditNoteDetails.CreditNoteLineItems[index].TaxGroupId);
                    data.get('TaxAmount').setValue(stringvalue[i].TaxAmount);
                }


            })
            itemGroupControl.controls.forEach((data, index) => {
                if (!data.get('TypeId').value) {
                    data.get('TypeId').patchValue(stringvalue[i].TaxID)
                    data.get('TaxGroupName').patchValue(stringvalue[i].TaxGroupId)
                    data.get('TaxAmount').setValue(stringvalue[i].TaxAmount);

                }
                data.get('ReturnQty').patchValue(itemGroupControl.controls[index].get('ReturnQty').value > 0 ? itemGroupControl.controls[index].get('ReturnQty').value : 0)
                data.get('DecreaseInUnitPrice').patchValue(0)


            })
        }

    }

    getTaxesByTaxGroup(taxGroupId: number): void {
        let taxResult = <Observable<Array<any>>>this.taxService.getTaxesByTaxGroup(taxGroupId);
        taxResult.subscribe((data) => {
            if (data != null) {
                this.taxTypes = data;
            }
        });
    }

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


    /**
         * this method will be called on file close icon click event..
         */
    onFileClose(fileIndex: number) {
        this.uploadedFiles = this.uploadedFiles.filter((file, index) => index != fileIndex);
    }

    /**
       * to remove the grid item...
      */
    removeGridItem(rowIndex: number) {
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        var LineItemLength = itemGroupControl.length
        if (rowIndex > 0) {
            let CNDetailsId = itemGroupControl.controls[rowIndex].get('CNDetailsId').value;
            if (CNDetailsId > 0) {
                this.CreditNoteItemsToDelete.push(CNDetailsId);
            }
            itemGroupControl.removeAt(rowIndex);
        } else if (rowIndex == 0 && LineItemLength > 0) {
            let CNDetailsId = itemGroupControl.controls[rowIndex].get('CNDetailsId').value;
            if (CNDetailsId > 0) {
                this.CreditNoteItemsToDelete.push(CNDetailsId);
            }
            itemGroupControl.removeAt(rowIndex);
        }
        else if (rowIndex == 0) {
            itemGroupControl.reset(rowIndex);
            itemGroupControl.controls[rowIndex].get('TypeId').patchValue(1)
        }

        if (rowIndex > 0) {
            if (itemGroupControl.controls[rowIndex - 1].get('ReturnQty').value) {
                this.HasTaxChanged = true
                this.CalculateQTYSubItem(rowIndex - 1)
            } else if (itemGroupControl.controls[rowIndex - 1].get('DecreaseInUnitPrice').value) {
                this.HasTaxChanged = true
                this.CalculatePriceSubItem(rowIndex - 1)
            }
        } else {
            if (itemGroupControl.controls[rowIndex].get('ReturnQty').value) {
                this.HasTaxChanged = true
                this.CalculateQTYSubItem(rowIndex)
            } else if (itemGroupControl.controls[rowIndex].get('DecreaseInUnitPrice').value) {
                this.HasTaxChanged = true
                this.CalculatePriceSubItem(rowIndex)
            }
        }


    }


    customeUpdatedPriceValidator(control: AbstractControl): { [key: string]: boolean } | null {

        // let returnQty = control.parent.controls["ReturnQuantity"].value;
        if (control.parent != undefined) {
            let returnQty = control.parent.controls["ReturnQty"].value;
            console.log(control.value, returnQty);
            if (((control.value == null || control.value == 0) && (returnQty != null && returnQty > 0)) || ((control.value != null && control.value > 0) && (returnQty == null || returnQty == 0))) {
                return null;
            }
            else {
                return { 'UpdatedPrice': true };
            }
        }
        else {
            return null;
        }
    }
    customeUpdatedReturnQtyValidator(control: AbstractControl): { [key: string]: boolean } | null {

        // let returnQty = control.parent.controls["ReturnQuantity"].value;
        if (control.parent != undefined) {
            let returnQty = control.parent.controls["UpdatedPrice"].value;
            console.log(control.value, returnQty);
            if (((control.value == null || control.value == 0) && (returnQty != null && returnQty > 0)) || ((control.value != null && control.value > 0) && (returnQty == null || returnQty == 0))) {
                return null;
            }
            else {
                return { 'UpdatedPrice': true };
            }
        }
        else {
            return null;
        }
    }

    backtoList() {
        this.router.navigate(['/po/CreditNoteList/' + this.pageType + ''])
    }

    Close() {
        let result: boolean = true;
        if (!this.InViewMode && this.IsFormValueChanges) {
            result = confirm(Messages.DiscardWarning);
        }
        if (result) {
            this.ActivateRoute.queryParams.subscribe((params) => {
                if (params['from'] == 'inv') {
                    this.router.navigate(['po/supplierinvoice/request']);
                }
                else {
                    this.router.navigate(['/po/CreditNoteList/' + this.pageType + '']);
                }
            });
        }
    }

    OnChangeDate(value) {
        value = value.replace(/^\s+/g, '')
        this.creditNoteForm.get('SupplierCreditNoteDate').setValue(value)
    }

    AddCreditNote(value: string) {
        debugger
        this.IsSubmit = false;
        this.HasSendforApproval = false;
        this.SetValidators(value);
        this.ValidateLineRowItem();
        //this.SaveCreditNote('Update')
    }
    SetValidators(value: string) {
        var reasons = this.creditNoteForm.get('Reasons');
        var CNNo = this.creditNoteForm.get('SupplierCreditNoteNo');
        var CNDate = this.creditNoteForm.get('SupplierCreditNoteDate');
        var SubCodeId = this.creditNoteForm.get('SubCodeId');
        reasons.clearValidators();
        CNNo.clearValidators();
        CNDate.clearValidators();
        if (this.hasCRNType)
            SubCodeId.setValidators([Validators.required]);
        if (value == 'send' || value == 'submit' || value == 'verify' || this.creditNoteDetails.WorkFlowStatusId == WorkFlowStatus.Completed) {
            reasons.setValidators([Validators.required, ControlValidator.Validator]);
            CNNo.setValidators([Validators.required, ControlValidator.Validator]);
            CNDate.setValidators([Validators.required, ControlValidator.Validator]);
            if (CNDate.value == null) {
                CNDate.setValue('');
            }
        } else {
            if (CNDate.value == "")
                CNDate.setValue(null);
        }
        reasons.updateValueAndValidity();
        CNNo.updateValueAndValidity();

        CNDate.updateValueAndValidity();
        SubCodeId.updateValueAndValidity();
        reasons.markAsTouched();
        CNNo.markAsTouched();
        CNDate.markAsTouched();
        SubCodeId.markAsTouched();
    }

    ValidateLineRowItem() {
        var Check_ItemQTY: boolean = false
        var itemGroupControl1 = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems']
        this.InvalidCreditNoteMassage()
        for (let i = 0; i < itemGroupControl1.length; i++) {
            if (this.hasCRNType) {
                if (!itemGroupControl1.controls[i].get('Item').value && !itemGroupControl1.controls[i].get('Service').value) {
                    $('.Item' + i).css('border-color', 'red')
                    Check_ItemQTY = true
                }
            }

            // if (!itemGroupControl1.controls[i].get('ItemQty').value) {
            //     $('.QTY' + i).css('border-color', 'red')
            //     Check_ItemQTY = true
            // }
            if (!this.hasCRNType) {
                if (this.creditNoteForm.controls['InvoiceId'].value == null) {
                    $('.show').css('border-color', 'red')
                }
            }
            if (!itemGroupControl1.controls[i].get('Unitprice').value) {
                $('.UPrice' + i).css('border-color', 'red')
                Check_ItemQTY = true
                this.showGridErrorMessage = false
            }
        }
        if (Check_ItemQTY == false) {
            if (this.HasSendforApproval)
                this.SaveCreditNote('Send')
            else
                this.SaveCreditNote('Update')
        }
    }

    SaveCreditNote(action: string) {
        this.SetValidators(action);
        if (this.creditNoteForm.valid) {
            //Confirming Submit clicked or not
            this.CheckDUIExist = false;
            var itemGroupControl1 = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];

            this.Check_Item(itemGroupControl1)
            // for (let i = 0; i < itemGroupControl1.length; i++) {
            //     if (itemGroupControl1.controls[i].get('ItemMasterId').value == 1) {
            //         itemGroupControl1.controls[i].get('ItemType').patchValue('Item')
            //     } else if (itemGroupControl1.controls[i].get('AccountCodeId').value == 3) {
            //         itemGroupControl1.controls[i].get('ItemType').patchValue('Expense')
            //     } //else if (itemGroupControl1.controls[i].get('TypeId').value == 2) {
            //     //     itemGroupControl1.controls[i].get('ItemType').patchValue('Service')
            //     // }
            // }
            let creditNoteDetails: CreditNote = this.creditNoteForm.value;
            creditNoteDetails.Action = (this.isReVerifing) ? 'reverify' : action;
            if (creditNoteDetails.SupplierCreditNoteDate != null)
                creditNoteDetails.SupplierCreditNoteDate = new Date(creditNoteDetails.SupplierCreditNoteDate)
            if (this.creditNoteDetails.CreditNoteId > 0) {
                creditNoteDetails.UpdatedBy = this.userDetails.UserID;
                creditNoteDetails.CompanyId = this.companyId;
                creditNoteDetails.InvoiceId = this.creditNoteDetails.InvoiceId;
                creditNoteDetails.SupplierId = this.creditNoteDetails.SupplierId
                creditNoteDetails.CreditNoteId = this.creditNoteDetails.CreditNoteId
                creditNoteDetails.Attachments = this.creditNoteDetails.Attachments.filter(i => i.IsDelete == true)
                creditNoteDetails.CreditNoteItemsToDelete = this.CreditNoteItemsToDelete
                creditNoteDetails.CRNType = 'Withinvoice'
                if (this.CreditnoteId > 0) {
                    creditNoteDetails.CreditNoteId = this.CreditnoteId
                }
                creditNoteDetails.CreditNoteLineItems['CNDetailsId'] = this.creditNoteDetails.CreditNoteLineItems[0].CNDetailsId;

                creditNoteDetails.WorkFlowStatusId = WorkFlowStatus.Draft;
                if (this.IsSubmit || this.isReVerifing)
                    creditNoteDetails.WorkFlowStatusId = WorkFlowStatus.Completed;

                if (this.HasPOTypeId)
                    creditNoteDetails.CreditNoteLineItems['POTypeId'] = this.HasPOTypeId;

            } else {
                creditNoteDetails.CreatedBy = this.userDetails.UserID;
                creditNoteDetails.CompanyId = this.companyId;
                creditNoteDetails.CreditNoteId = 0;
                creditNoteDetails.InvoiceId = this.invoiceRequestid;
                creditNoteDetails.Supplier = this.creditNoteForm.controls['Supplier'].value.SupplierId;
                creditNoteDetails.SupplierId = this.creditNoteForm.controls['Supplier'].value.SupplierId;
                creditNoteDetails.WorkFlowStatusId = (this.IsSubmit) ? WorkFlowStatus.Completed : WorkFlowStatus.Draft;
                if (this.HasPOTypeId)
                    creditNoteDetails.CreditNoteLineItems['POTypeId'] = this.HasPOTypeId;
            }
            if (action == 'Send' || action == 'verify')
                creditNoteDetails.WorkFlowStatusId = WorkFlowStatus.WaitingForApproval;

            if (this.creditNoteForm.controls['CRNType'].value == 'WithOutinvoice') {
                this.creditNoteForm.controls['InvoiceId'].valid
            }
            if (this.creditNoteForm.invalid) {
                this.InvalidCreditNoteMassage()
            }
            else if (this.IsSubmit) {
                this.ValidateLineItem(itemGroupControl1)
                if (!this.CheckDUIExist) {
                    this.ValidateDIUP(itemGroupControl1)
                } else {
                    if (!this.HasInputError) {
                        if (this.uploadedFiles.length == 0 && (this.creditNoteDetails.Attachments == undefined || this.creditNoteDetails.Attachments.length == 0)) {
                            this.confirmationServiceObj.confirm({
                                message: "Please Attach Original Attachment File(s)",
                                header: Messages.DeletePopupHeader,
                                accept: () => {
                                },
                                rejectVisible: false,
                                acceptLabel: "Ok"
                            });
                            return false;
                        } else if (this.creditNoteDetails.Attachments != undefined && this.creditNoteDetails.Attachments.filter(x => x.IsDelete == true).length != 0 && this.uploadedFiles.length == 0) {
                            this.confirmationServiceObj.confirm({
                                message: "Please Attach Original Attachment File(s)",
                                header: Messages.DeletePopupHeader,
                                accept: () => {
                                },
                                rejectVisible: false,
                                acceptLabel: "Ok"
                            });
                            return false;
                        } else {
                            this.confirmationServiceObj.confirm({
                                message: "Details once submitted cannot be changed.Do you want to continue ??",
                                header: "Confirmation",
                                accept: () => {

                                    this.ValidateLineItem(itemGroupControl1);
                                    if (!this.HasInputError) {
                                        if (this.CheckDUIExist)
                                            this.SaveRecord(creditNoteDetails);
                                        else
                                            this.ValidateDIUP(itemGroupControl1);
                                    }
                                },
                                reject: () => {
                                }
                            });
                        }
                    }
                }

            } else {

                creditNoteDetails.SupplierCreditNoteDate = this.reqDateFormatPipe.transformDateWithNull(creditNoteDetails.SupplierCreditNoteDate);
                if (this.IsSubmit == true) {
                    this.ValidateLineItem(itemGroupControl1)
                    if (!this.HasInputError) {
                        this.confirmationServiceObj.confirm({
                            message: "Details once submitted cannot be changed.Do you want to continue ??",
                            header: "Confirmation",
                            accept: () => {
                                if (!this.HasInputError) {
                                    if (this.CheckDUIExist)
                                        this.SaveRecord(creditNoteDetails)
                                    else
                                        this.ValidateDIUP(itemGroupControl1)
                                }
                            },
                            reject: () => {
                            }
                        });
                    }

                } else {
                    if (itemGroupControl1 != undefined) {
                        this.ValidateLineItem(itemGroupControl1)

                        if (!this.HasInputError) {
                            if (this.CheckDUIExist)
                                this.SaveRecord(creditNoteDetails)
                            else
                                this.ValidateDIUP(itemGroupControl1)
                        }
                    }
                }

            }
        }
    }


    ValidateDIUP(itemGroupControl1) {
        if (this.CheckDUIExist == false) {
            for (let i = 0; i < itemGroupControl1.length; i++) {
                if (itemGroupControl1.controls[i].get('DecreaseInUnitPrice').value == 0 || itemGroupControl1.controls[i].get('DecreaseInUnitPrice').value == null) {
                    this.HasInputError = true
                    //itemGroupControl1.controls[i].get('ReturnQty').markAsTouched()
                    this.confirmationServiceObj.confirm({
                        message: "Please enter Decrease In Unit Price",
                        header: Messages.DeletePopupHeader,
                        accept: () => {
                        },
                        rejectVisible: false,
                        acceptLabel: "Ok"
                    });
                    return false;
                } else {
                    this.HasInputError = false
                }
            }
        } else {
            this.HasInputError = false
        }
    }

    ValRTOrDU: any = []
    ValidateLineItem(itemGroupControl1) {
        if (itemGroupControl1 != null) {
            if (this.HasPOTypeId == 5 || this.HasPOTypeId == 6) {
                for (let i = 0; i < itemGroupControl1.length; i++) {
                    if (!this.CheckDUIExist) {
                        if (itemGroupControl1.controls[i].get('DecreaseInUnitPrice').value > 0) {
                            this.CheckDUIExist = true
                            this.HasInputError = false
                        } else {
                            this.CheckDUIExist = false
                            this.HasInputError = false
                        }
                    }
                }
            } else {
                this.ValidateReturnQntORDIUP(itemGroupControl1)
                this.ValidateReturnQntORDIUP2(itemGroupControl1)
                if (!this.RYQORDIUPExists)
                    this.ValidateReturnQntORDIUP3(itemGroupControl1)
            }

        }
    }

    // Checking both Return Qty or DIUP Entered
    ValidateReturnQntORDIUP(itemGroupControl1) {
        this.ValRTOrDU = []
        for (let i = 0; i < itemGroupControl1.length; i++) {

            if (itemGroupControl1.controls[i].get('ReturnQty').value > 0) {
                this.ValRTOrDU.push('R')
            } else if (itemGroupControl1.controls[i].get('DecreaseInUnitPrice').value > 0) {
                this.ValRTOrDU.push('D')
            }
            //console.log(this.ValRTOrDU)
            if (i == itemGroupControl1.length - 1) {
                if (this.ValRTOrDU.includes("R") && this.ValRTOrDU.includes("D"))
                    this.RYQORDIUPExists = true
                else
                    this.RYQORDIUPExists = false
            }
        }

    }

    // Checking Either  Return Qty or DIUP Entered
    ValidateReturnQntORDIUP2(itemGroupControl1) {
        if (this.RYQORDIUPExists == true) {
            this.HasInputError = true
            this.confirmationServiceObj.confirm({
                message: "Please enter either Return quantity or Decrease In Unit Price for line item",
                header: Messages.DeletePopupHeader,
                accept: () => {
                },
                rejectVisible: false,
                acceptLabel: "Ok"
            });
            return false;
        } else if (this.RYQORDIUPExists == false) {
            if (!this.hasCRNType) {
                for (let i = 0; i < itemGroupControl1.length; i++) {
                    if (!this.CheckRTQorDUIExist) {
                        if (itemGroupControl1.controls[i].get('ReturnQty').value > 0 || itemGroupControl1.controls[i].get('DecreaseInUnitPrice').value > 0) {
                            this.CheckRTQorDUIExist = true
                        } else {
                            this.CheckRTQorDUIExist = false
                        }
                    }
                }
            } else {
                this.CheckRTQorDUIExist = false
            }
        }
    }

    ValidateReturnQntORDIUP3(itemGroupControl1) {
        if (this.CheckRTQorDUIExist == false) {
            for (let i = 0; i < itemGroupControl1.length; i++) {
                if ((itemGroupControl1.controls[i].get('ReturnQty').value == 0 || itemGroupControl1.controls[i].get('ReturnQty').value == null) && (itemGroupControl1.controls[i].get('DecreaseInUnitPrice').value == 0 || itemGroupControl1.controls[i].get('DecreaseInUnitPrice').value == null)) {
                    this.HasInputError = true
                    this.CheckDUIExist = true

                    this.confirmationServiceObj.confirm({
                        message: "Please enter the Return quantity or Decrease In Unit Price",
                        header: Messages.DeletePopupHeader,
                        accept: () => {
                        },
                        rejectVisible: false,
                        acceptLabel: "Ok"
                    });
                    return false;
                } else {
                    this.HasInputError = false
                    this.CheckDUIExist = true
                }
            }
        } else {
            this.CheckDUIExist = true
            this.HasInputError = false
        }
    }

    Check_Item(itemGroupControl1) {
        for (let i = 0; i < itemGroupControl1.length; i++) {
            if (itemGroupControl1.controls[i].get('Item').value == null) {
                if (this.CreditnoteId > 0)
                    if (this.creditNoteDetails.GetItemMasters[i] != null)
                        itemGroupControl1.controls[i].get('Item').patchValue(this.creditNoteDetails.GetItemMasters[i])
            }
        }
    }

    SetReasonValidation() {
        this.creditNoteForm.get('Reasons').setErrors(null)
        if (this.creditNoteForm.controls['Reasons'].value == '' || this.creditNoteForm.controls['Reasons'].value == null) {
            this.creditNoteForm.get('Reasons').setErrors({ 'required': true })
        }
    }
    InvalidCreditNoteMassage() {

        if (!this.hasCRNType) {
            if (!this.creditNoteForm.controls['InvoiceId'].value)
                this.creditNoteForm.controls['InvoiceId'].markAsTouched()
        }

        var creditNoteDetails: CreditNote = this.creditNoteForm.value;
        if (creditNoteDetails.CreditNoteLineItems.length == 0) {
            this.showGridErrorMessage = true
        }
        this.creditNoteForm.controls['Supplier'].markAsTouched()
        this.creditNoteForm.controls['CurrencyType'].markAsTouched()
        // this.creditNoteForm.controls['Reasons'].markAsTouched()

        this.creditNoteForm.controls['SupplierType'].markAsTouched()
        this.creditNoteForm.controls['CRNType'].markAsTouched()
        this.creditNoteForm.controls['LocationID'].markAsTouched()
        if (this.creditNoteForm.controls['CRNType'].value == 'Withinvoice')
            this.creditNoteForm.controls['InvoiceId'].markAsTouched()
        return;
    }


    SaveRecord(creditNoteDetails: CreditNote) {
        var itemGroupControl1 = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        if (itemGroupControl1.value.length == 0 && this.hasCRNType) {
            this.showGridErrorMessage = true;
        } else {
            this.showGridErrorMessage = false;
            creditNoteDetails.SupplierCreditNoteDate = this.reqDateFormatPipe.transformDateWithNull(creditNoteDetails.SupplierCreditNoteDate);
            creditNoteDetails.SupplierCreditNoteInvoiceDate = this.reqDateFormatPipe.transformDateWithNull(creditNoteDetails.SupplierCreditNoteInvoiceDate);
            this.creditNoteServiceObj.postCreditNote(creditNoteDetails, this.uploadedFiles).subscribe((creditNoteId: number) => {
                if (creditNoteId == -1) {
                    this.confirmationServiceObj.confirm({
                        message: Messages.DuplicateSupplierCreditNoteNumber,
                        header: Messages.PopupHeader,
                        rejectVisible: false,
                        acceptLabel: "OK"
                    });
                }
                else {
                    if (creditNoteDetails.Action == 'verify') {
                        this.Cancel();
                    }
                    else {
                        this.backtoList();
                    }
                    this.IsViewMode = true;
                    this.uploadedFiles.length = 0;
                    this.uploadedFiles = [];
                    this.CreditNoteItemsToDelete = []
                    this.CreditNoteItemsToDelete.length = 0
                    this.invoiceRequestid = 0;
                    if (this.IsSubmit) {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SubmitSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                    } else {
                        if (this.creditNoteDetails.CreditNoteId > 0) {
                            this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.UpdatedSuccessFully,
                                MessageType: MessageTypes.Success
                            });
                        } else {
                            this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.SavedSuccessFully,
                                MessageType: MessageTypes.Success
                            });
                        }
                    }
                }
            });
        }
    }

    Send_Approval() {
        this.SetValidators('send');
        if (this.creditNoteForm.valid) {
            var ErroCode = false
            this.HasSendforApproval = true
            if (this.CreditnoteId == 0) {
                if (this.creditNoteForm.invalid) {
                    if (this.creditNoteForm.get('CreditNoteLineItems').value.length == 0) {
                        this.showGridErrorMessage = true
                    }
                    this.creditNoteForm.controls['Supplier'].markAsTouched()
                    this.creditNoteForm.controls['CurrencyType'].markAsTouched()
                    this.creditNoteForm.controls['Reasons'].markAsTouched()
                    this.creditNoteForm.controls['SupplierType'].markAsTouched()
                    this.creditNoteForm.controls['CRNType'].markAsTouched()
                    this.creditNoteForm.controls['LocationID'].markAsTouched()
                    if (this.creditNoteForm.controls['CRNType'].value == 'Withinvoice' || this.creditNoteForm.controls['CRNType'].value == '')
                        this.creditNoteForm.controls['InvoiceId'].markAsTouched()
                    return;
                } else {
                    var itemGroupControl1 = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
                    this.ValidateReturnQntORDIUP(itemGroupControl1)
                    this.ValidateReturnQntORDIUP2(itemGroupControl1)
                    if (!this.RYQORDIUPExists) {
                        for (let i = 0; i < itemGroupControl1.length; i++) {
                            if (this.hasCRNType) {
                                if (!itemGroupControl1.controls[i].get('Item').value && !itemGroupControl1.controls[i].get('Service').value) {
                                    $('.Item' + i).css('border-color', 'red')
                                    ErroCode = true
                                }
                            }
                            if (!itemGroupControl1.controls[i].get('ItemQty').value) {
                                $('.QTY' + i).css('border-color', 'red')
                                ErroCode = true
                            }
                            if (!itemGroupControl1.controls[i].get('Unitprice').value) {
                                $('.UPrice' + i).css('border-color', 'red')
                                this.showGridErrorMessage = false
                                ErroCode = true
                            }
                        }

                        if (ErroCode == false) {
                            this.ValidateReturnQntORDIUP3(itemGroupControl1)
                        } else {
                            this.HasInputError = true
                        }
                    }
                    if (this.HasInputError == false) {
                        if (this.uploadedFiles.length == 0 && (this.creditNoteDetails.Attachments == undefined || this.creditNoteDetails.Attachments.length == 0)) {
                            this.confirmationServiceObj.confirm({
                                message: "Please Attach Original Attachment File(s)",
                                header: Messages.DeletePopupHeader,
                                accept: () => {
                                },
                                rejectVisible: false,
                                acceptLabel: "Ok"
                            });
                            this.HasSendforApproval = false
                            return false;
                        }
                        this.SaveCreditNote('Send')
                    }
                }
            } else {
                if (this.uploadedFiles.length == 0 && (this.creditNoteDetails.Attachments == undefined || this.creditNoteDetails.Attachments.length == 0 || this.creditNoteDetails.Attachments.filter(x => x.IsDelete == true).length != 0)) {
                    this.confirmationServiceObj.confirm({
                        message: "Please Attach Original Attachment File(s)",
                        header: Messages.DeletePopupHeader,
                        accept: () => {
                        },
                        rejectVisible: false,
                        acceptLabel: "Ok"
                    });
                    this.HasSendforApproval = false
                    return false;
                }
                if (this.IsEditClicked)
                    this.ValidateLineRowItem();
                else {
                    this.SaveCreditNote('Send');
                }
            }
        }
    }

    SubmitCreditNote() {
        this.SetValidators('submit');
        this.CheckDUIExist = false;
        var ErroCode = false;
        if (this.creditNoteForm.valid) {
            if (this.CreditnoteId == 0) {
                if (this.creditNoteForm.invalid) {
                    if (this.creditNoteForm.get('CreditNoteLineItems').value.length == 0) {
                        this.showGridErrorMessage = true
                    }
                    this.creditNoteForm.controls['Supplier'].markAsTouched()
                    this.creditNoteForm.controls['CurrencyType'].markAsTouched()
                    this.creditNoteForm.controls['Reasons'].markAsTouched()
                    this.creditNoteForm.controls['SupplierType'].markAsTouched()
                    this.creditNoteForm.controls['CRNType'].markAsTouched()
                    this.creditNoteForm.controls['LocationID'].markAsTouched()
                    if (this.creditNoteForm.controls['CRNType'].value == 'Withinvoice' || this.creditNoteForm.controls['CRNType'].value == '')
                        this.creditNoteForm.controls['InvoiceId'].markAsTouched()
                    return;
                } else {
                    this.IsSubmit = true;
                    var itemGroupControl1 = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
                    this.ValidateReturnQntORDIUP(itemGroupControl1)
                    this.ValidateReturnQntORDIUP2(itemGroupControl1)
                    if (!this.RYQORDIUPExists) {
                        for (let i = 0; i < itemGroupControl1.length; i++) {
                            if (this.hasCRNType) {
                                if (!itemGroupControl1.controls[i].get('Item').value && !itemGroupControl1.controls[i].get('Service').value) {
                                    $('.Item' + i).css('border-color', 'red')
                                    ErroCode = true
                                }
                            }
                            if (!itemGroupControl1.controls[i].get('ItemQty').value) {
                                $('.QTY' + i).css('border-color', 'red')
                                ErroCode = true
                            }
                            if (!itemGroupControl1.controls[i].get('Unitprice').value) {
                                $('.UPrice' + i).css('border-color', 'red')
                                this.showGridErrorMessage = false
                                ErroCode = true

                            }
                        }

                        if (ErroCode == false) {
                            this.ValidateReturnQntORDIUP3(itemGroupControl1)
                        } else {
                            this.HasInputError = true
                        }

                    }
                    if (this.HasInputError == false) {
                        if (this.uploadedFiles.length == 0 && (this.creditNoteDetails.Attachments == undefined || this.creditNoteDetails.Attachments.length == 0)) {
                            this.confirmationServiceObj.confirm({
                                message: "Please Attach Original Attachment File(s)",
                                header: Messages.DeletePopupHeader,
                                accept: () => {
                                },
                                rejectVisible: false,
                                acceptLabel: "Ok"
                            });
                            return false;
                        }
                        this.ValidateLineRowItem()
                    }
                }
            } else {
                this.IsSubmit = true;
                if (this.uploadedFiles.length == 0 && (this.creditNoteDetails.Attachments == undefined || this.creditNoteDetails.Attachments.length == 0)) {
                    this.confirmationServiceObj.confirm({
                        message: "Please Attach Original Attachment File(s)",
                        header: Messages.DeletePopupHeader,
                        accept: () => {
                        },
                        rejectVisible: false,
                        acceptLabel: "Ok"
                    });
                    return false;
                }
                if (this.IsEditClicked)
                    this.ValidateLineRowItem()
                else
                    this.SaveCreditNote('Update')

            }
        }
    }

    EditCreditNote() {
        this.InViewMode = false;
        this.hideInput = true;
        this.IsEditClicked = true
        this.Isupdate = true;
        this.hideType = true;
        this.InViewModeCategory = false;
        if (this.hasCRNType) {
            this.hasCRNType = true;
            this.IsAdditem = true;
            this.creditNoteForm.get('CRNType').patchValue('WithOutinvoice');
            this.hideInputItem = false;
        } else {
            this.hasCRNType = false;
            this.IsAdditem = false;
            this.creditNoteForm.get('CRNType').patchValue('Withinvoice');
        }
        if (this.creditNoteDetails.SupplierType == 1) {
            this.creditNoteForm.controls['SupplierType'].patchValue(this.supplierCategoryType[0]);
        } else {
            this.creditNoteForm.controls['SupplierType'].patchValue(this.supplierCategoryType[1]);
        }
        if (this.creditNoteForm.get('SupplierCreditNoteDate').value == null || this.creditNoteForm.get('SupplierCreditNoteDate').value == '')
            this.creditNoteForm.get('SupplierCreditNoteDate').setValue(null);
        else
            this.creditNoteForm.get('SupplierCreditNoteDate').setValue(new Date(this.creditNoteDetails.SupplierCreditNoteDate));
        var itemLinemaster = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems']
        if (itemLinemaster != null) {
            for (let i = 0; i <= itemLinemaster.length - 1; i++) {
                if (this.hasCRNType) {
                    if (itemLinemaster.controls[i].get('ItemMasterId').value > 0) {
                        for (let j = i; j <= this.creditNoteDetails.GetItemMasters.length - 1; j++) {
                            if (this.creditNoteDetails.GetItemMasters[j].ItemMasterId > 0)
                                itemLinemaster.controls[i].get('Item').patchValue(this.creditNoteDetails.GetItemMasters[j])
                        }
                    }
                    else if (itemLinemaster.controls[i].get('AccountCodeId').value > 0) {
                        for (let k = i; k <= this.creditNoteDetails.GetServiceMasters.length - 1; k++) {
                            if (this.creditNoteDetails.GetServiceMasters[k].AccountCodeId > 0)
                                if (itemLinemaster.controls[i].get('TypeId').value == 2)
                                    itemLinemaster.controls[i].get('Service').patchValue(this.creditNoteDetails.GetServiceMasters[k])
                        }
                    }

                }
                itemLinemaster.controls.forEach((data, index) => {
                    if (itemLinemaster.controls[i].get('TypeId').value == 3)
                        data.get('Service').setValue(this.creditNoteDetails.GetServiceMasters[index]);
                })

                //itemLinemaster.controls[i].get('TypeId').patchValue(this.creditNoteDetails.CreditNoteLineItems[i].TypeId)
            }

        }
        this.getDepartments(this.companyId)
        this.creditNoteForm.controls['LocationID'].setValue(this.creditNoteDetails.LocationID);
    }
    Cancel() {
        this.InViewMode = true;
        this.hideInput = false;
        this.Isupdate = false;
        //this.hasCRNType = false
        this.IsAdditem = false;
        this.hideInputItem = true;
        this.IsEditClicked = false;
    }

    setTaxAmount(value, i) {
        this.hasCRNType = true
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        this.getTaxTypesByTaxId(itemGroupControl.controls[i].get('TaxID').value, i);
    }


    getTaxTypesByTaxId(taxId: number, rowIndex: number) {
        this.getTaxesByTaxId(taxId, rowIndex);
    }

    getTaxesByTaxId(taxId: number, rowIndex: number): void {
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        let taxResult = <Observable<Array<any>>>this.creditNoteServiceObj.getTaxesByTaxGroup(taxId);
        taxResult.subscribe((data) => {
            if (data != null) {
                var taxTypes = data;
                this.HasTaxChanged = true
                if (itemGroupControl.length > 0) {
                    itemGroupControl.controls[rowIndex].get('TaxAmount').patchValue(taxTypes[0].TaxAmount)
                    this.ChangedTax = itemGroupControl.controls[rowIndex].get('TaxAmount').value
                }
                this.SupplierTaxAmount = taxTypes[0].TaxAmount
            }
            if (itemGroupControl.controls[rowIndex].get('DecreaseInUnitPrice').value > 0) {
                this.decQtyOrPrice('price', rowIndex, itemGroupControl.controls[rowIndex].get('DecreaseInUnitPrice').value, '')
            } else if (itemGroupControl.controls[rowIndex].get('ReturnQty').value > 0) {
                this.decQtyOrPrice('qty', rowIndex, itemGroupControl.controls[rowIndex].get('ReturnQty').value, '')
            }
        });
    }



    OnChangeCRNType(CRNType) {
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        this.creditNoteForm.get('SubCodeId').setValue('');
        if (CRNType == 'WithOutinvoice') {
            itemGroupControl.reset();
            itemGroupControl.removeAt(0);
            itemGroupControl.controls = []
            itemGroupControl.push(this.initGridRows());
            itemGroupControl.controls[0].get('TypeId').patchValue(1)
            this.HasPOTypeId = 0
            this.hasCRNType = true;
            this.hideInputItem = false
            this.IsAdditem = true
            this.setColumns()
            this.creditNoteForm.controls['InvoiceId'].setValue(0)
            this.creditNoteForm.controls['InvoiceTotalAmount'].setValue(0)
            this.SupplierTaxAmount = this.SupplierTaxAmount
            this.creditNoteForm.controls['SupplierCreditNoteInvoiceNo'].setValue('')
            this.creditNoteForm.controls['InvoiceTotalAmount'].setValue('')
            this.creditNoteForm.controls['SupplierCreditNoteInvoiceDate'].setValue('')

        } else if (CRNType == "") {
            itemGroupControl.reset();
            itemGroupControl.removeAt(0);
            itemGroupControl.controls = []
            // itemGroupControl.push(this.initGridRows());
            this.hasCRNType = true;
            this.creditNoteForm.controls['SupplierCreditNoteInvoiceNo'].setValue('')
            this.creditNoteForm.controls['InvoiceTotalAmount'].setValue('')
            this.creditNoteForm.controls['SupplierCreditNoteInvoiceDate'].setValue('')
            this.creditNoteForm.controls['InvoiceId'].setValue(0)
            this.creditNoteForm.controls['InvoiceTotalAmount'].setValue(0)
        }
        else {
            this.hasCRNType = false;
            this.IsAdditem = false
            this.hideInputItem = false
            itemGroupControl.reset();
            itemGroupControl.removeAt(0);
            this.setColumns()
            this.creditNoteForm.controls['SupplierCreditNoteInvoiceDate'].setValue('')

        }
    }

    restrictMinusValue(e: any, index) {

        restrictMinus(e);
        // let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        // itemGroupControl.controls[index].get('TotalbefTax').setValue('')
    }

    OnChangeItemQty(value, Input: string, index) {
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];

        if (value) {
            if (Input == 'qty') {
                if (value < itemGroupControl.controls[index].get('ReturnQty').value) {
                    itemGroupControl.controls[index].get('ItemQty').setErrors({ 'ItemQtyerror': true });
                } else {
                    $('.QTY' + index).css('border-color', '')
                }

            } else if (Input == 'price') {
                $('.UPrice' + index).css('border-color', '')

                if (Number(itemGroupControl.controls[index].get('ReturnQty').value)) {
                    this.CalculateQTYSubItem(index)
                } else {
                    this.CalculatePriceSubItem(index)
                }

            }
        }
    }

    OnChangeUnitprice(value, index) {
        $('.UPrice' + index).css('border-color', '')
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        if (value) {
            if (itemGroupControl.controls[index].get('DecreaseInUnitPrice').value > 0) {
                if (value < itemGroupControl.controls[index].get('DecreaseInUnitPrice').value) {
                    itemGroupControl.controls[index].get('Unitprice').setErrors({ 'DecreaseInerror': true });
                }
            }
            if (Number(itemGroupControl.controls[index].get('ReturnQty').value)) {
                this.CalculateQTYSubItem(index)
            } else if (Number(itemGroupControl.controls[index].get('DecreaseInUnitPrice').value)) {
                this.CalculatePriceSubItem(index)
            }
        }
    }

    BindSubItem(i) {
        if (this.creditNoteDetails.CreditNoteLineItems[i].DecreaseInUnitPrice) {
            this._Total = this._Total + (Number(this.creditNoteDetails.CreditNoteLineItems[i].ItemQty * this.creditNoteDetails.CreditNoteLineItems[i].DecreaseInUnitPrice))
            this._Tax = this._Tax + (((this.creditNoteDetails.CreditNoteLineItems[i].ItemQty * this.creditNoteDetails.CreditNoteLineItems[i].DecreaseInUnitPrice)) * (this.creditNoteDetails.CreditNoteLineItems[i].TaxAmount / 100))

            this._CNTotal = (this._Total - this.creditNoteDetails.CreditNoteLineItems[i].Discount) + this._Tax
        } else {
            this._Total = this._Total + (Number(this.creditNoteDetails.CreditNoteLineItems[i].ReturnQty * this.creditNoteDetails.CreditNoteLineItems[i].Unitprice))
            this._Tax = this._Tax + (((this.creditNoteDetails.CreditNoteLineItems[i].ReturnQty * this.creditNoteDetails.CreditNoteLineItems[i].Unitprice)) * (this.creditNoteDetails.CreditNoteLineItems[i].TaxAmount / 100))

            this._CNTotal = (this._Total - this.creditNoteDetails.CreditNoteLineItems[i].Discount) + this._Tax
        }
        if (this.creditNoteDetails.TotalAdjustment)
            this._NetCreditNote = Number(this.creditNoteDetails.TotalAdjustment) + this._Total + this._Tax

    }


    OnChangeDiscount(value, index) {
        var itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];

        if (Number(value) < 0) {
            itemGroupControl.controls[index].get('Discount').setErrors({ 'NegativediscountErr': true });
        } else {
            var Erro_Check = false
            if (itemGroupControl.controls[index].get('DecreaseInUnitPrice').value > 0) {
                var Total = itemGroupControl.controls[index].get('ItemQty').value * itemGroupControl.controls[index].get('DecreaseInUnitPrice').value
            } else {
                Total = itemGroupControl.controls[index].get('ReturnQty').value * itemGroupControl.controls[index].get('Unitprice').value
            }

            if (!this.hasCRNType) {
                if (itemGroupControl.controls[index].get('OriginalDiscount').value > 0) {

                    if (Number(itemGroupControl.controls[index].get('Discount').value) == 0 && value > 0) {
                        itemGroupControl.controls[index].get('Discount').setErrors({ 'discountErr': true });
                    }
                    else if (Number(itemGroupControl.controls[index].get('OriginalDiscount').value) == Number(this.Original_Discount_obj[index])) {
                        if ((Number(value) > Number(itemGroupControl.controls[index].get('OriginalDiscount').value))) {
                            itemGroupControl.controls[index].get('Discount').setErrors({ 'discountErr': true });
                            Erro_Check = true
                        } else {
                            this.Dicount_Count(value, index)
                            Erro_Check = false
                        }
                    } else if (Number(itemGroupControl.controls[index].get('OriginalDiscount').value) != Number(this.Original_Discount_obj[index])) {
                        if ((Number(value) > Number(this.Original_Discount_obj[index]))) {
                            itemGroupControl.controls[index].get('Discount').setErrors({ 'discountErr': true });
                            itemGroupControl.controls[index].get('OriginalDiscount').setValue(this.Original_Discount_obj[index])
                            Erro_Check = true
                        } else if (Number(itemGroupControl.controls[index].get('Discount').value) > Number(itemGroupControl.controls[index].get('OriginalDiscount').value)) {
                            itemGroupControl.controls[index].get('Discount').setErrors({ 'discountErr': true });
                            Erro_Check = true
                        }
                        else {
                            this.Dicount_Count(value, index)
                            Erro_Check = false
                        }
                    }
                } else if (itemGroupControl.controls[index].get('OriginalDiscount').value == 0 || itemGroupControl.controls[index].get('OriginalDiscount').value == null) {
                    this.Dicount_Count(value, index)
                } if (Erro_Check == false) {
                    if (Total > 0) {

                        if (Number(itemGroupControl.controls[index].get('Discount').value) > Total) {
                            itemGroupControl.controls[index].get('Discount').setErrors({ 'discountTotalErr': true });
                        }
                    } else {
                        this.Dicount_Count(value, index)
                    }
                }

            } else {
                if (Total > 0) {

                    if (Number(itemGroupControl.controls[index].get('Discount').value) > Total) {
                        itemGroupControl.controls[index].get('Discount').setErrors({ 'discountTotalErr': true });
                    } else {
                        this.Dicount_Count(value, index)
                    }
                }
            }
        }

    }

    Dicount_Count(value, index) {
        this.SubDiscount = 0
        this.HasDiscount = true
        if (value == '')
            value = 0
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];
        if (Number(itemGroupControl.controls[index].get('ReturnQty').value)) {
            this.decQtyOrPrice('qty', index, Number(itemGroupControl.controls[index].get('ReturnQty').value), '1')

        } else if (Number(itemGroupControl.controls[index].get('DecreaseInUnitPrice').value)) {
            this.decQtyOrPrice('price', index, Number(itemGroupControl.controls[index].get('DecreaseInUnitPrice').value), '1')
        }
    }

    IsHasDiscount_Changed: boolean = false
    decQtyOrPrice(from: string, index: number, value: number, hasValue) {
        this._Total = 0
        this._Tax = 0
        if (from == "qty") {

            let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];

            if ((Number(value) == 0 || String(value) == "") && Number(itemGroupControl.controls[index].get('Discount').value) > 0) {
                itemGroupControl.controls[index].get('Discount').setErrors({ 'discountTotalErr': true });
            } else {
                if (itemGroupControl.controls[index].get('DecreaseInUnitPrice').value > 0) {
                    itemGroupControl.controls[index].get('Tax').setValue(0)
                    this.HasDiscount = false
                }
                itemGroupControl.controls[index].get('DecreaseInUnitPrice').setValue(0);
                itemGroupControl.controls[index].get('DecreaseInUnitPrice').setErrors(null);

                if (Number(value) > Number(itemGroupControl.controls[index].get('ItemQty').value)) {
                    itemGroupControl.controls[index].get('ReturnQty').setErrors({ 'qtyerror': true });
                } else if ((Number(value) * itemGroupControl.controls[index].get('Unitprice').value) < Number(itemGroupControl.controls[index].get('Discount').value)) {
                    if (value > 0)
                        itemGroupControl.controls[index].get('ReturnQty').setErrors({ 'qtydisocunterror': true });
                }
                else {
                    this.CalculateQTYSubItem(index)
                    itemGroupControl.controls[index].get('ReturnQty').setErrors(null)
                    itemGroupControl.controls[index].get('Discount').setErrors(null)

                }
            }
        }
        else if (from == "price") {

            let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];

            if ((Number(value) == 0 || String(value) == "") && Number(itemGroupControl.controls[index].get('Discount').value) > 0) {
                itemGroupControl.controls[index].get('Discount').setErrors({ 'discountTotalErr': true });
            } else {
                if (itemGroupControl.controls[index].get('ReturnQty').value > 0) {
                    itemGroupControl.controls[index].get('Tax').setValue(0)
                    this.HasDiscount = false
                }
                itemGroupControl.controls[index].get('ReturnQty').setValue(0);
                itemGroupControl.controls[index].get('ReturnQty').setErrors(null);

                if (Number(value) > Number(itemGroupControl.controls[index].get('Unitprice').value)) {
                    itemGroupControl.controls[index].get('DecreaseInUnitPrice').setErrors({ 'unitpriceerror': true });
                } else if ((Number(value) * itemGroupControl.controls[index].get('ItemQty').value) < Number(itemGroupControl.controls[index].get('Discount').value)) {
                    if (value > 0)
                        itemGroupControl.controls[index].get('DecreaseInUnitPrice').setErrors({ 'discountDIPErr': true });
                }
                else {
                    this.CalculatePriceSubItem(index)
                    itemGroupControl.controls[index].get('DecreaseInUnitPrice').setErrors(null);
                    itemGroupControl.controls[index].get('Discount').setErrors(null);
                }
            }

        }
        //this.calculateTotalPrice()
    }

    CalculateQTYSubItem(index) {
        this._Total = 0
        this._Tax = 0
        this.SubDiscount = 0
        this._CNTotal = 0
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];

        if (!this.HasTaxChanged) {
            if (itemGroupControl.controls[index].get('TaxName').value)
                itemGroupControl.controls[index].get('TaxAmount').setValue(itemGroupControl.controls[index].get('TaxAmount').value)
            else if (this.CreditnoteId == 0 && !this.hasCRNType)
                itemGroupControl.controls[index].get('TaxAmount').setValue(this._InvoiceDetails[index].TaxAmount)
            else if (itemGroupControl.controls[index].get('TaxAmount').value == 0 || itemGroupControl.controls[index].get('TaxAmount').value == null)
                itemGroupControl.controls[index].get('TaxAmount').setValue(this.SupplierTaxAmount)
            else
                itemGroupControl.controls[index].get('TaxAmount').setValue(this.SupplierTaxAmount)

        }

        let ReturnValue = (itemGroupControl.controls[index].get('ReturnQty').value) * (itemGroupControl.controls[index].get('Unitprice').value)
        itemGroupControl.controls[index].get('ReturnValue').setValue(ReturnValue)

        if (!this.hasCRNType && this.CreditnoteId == 0) {
            this.Tax = Number((((itemGroupControl.controls[index].get('ReturnQty').value) * (itemGroupControl.controls[index].get('Unitprice').value)) - (itemGroupControl.controls[index].get('Discount').value)) * (this._InvoiceDetails[index].TaxAmount) / 100)
        } else {
            this.Tax = Number((((itemGroupControl.controls[index].get('ReturnQty').value) * (itemGroupControl.controls[index].get('Unitprice').value)) - (itemGroupControl.controls[index].get('Discount').value)) * (itemGroupControl.controls[index].get('TaxAmount').value) / 100)
        }

        if (this.Tax < 0)
            this.Tax = 0
        itemGroupControl.controls[index].get('Tax').patchValue(Number(this.Tax.toFixed(4)))

        itemGroupControl.controls.forEach((data, index) => {
            this._Total = this._Total + (Number(data.get('ReturnQty').value) * Number(data.get('Unitprice').value))
            this.creditNoteForm.get('SubTotal').setValue(this._Total)

            if (!this.hasCRNType && this.CreditnoteId == 0) {
                var res = (Number(((data.get('ReturnQty').value) * (data.get('Unitprice').value) - (data.get('Discount').value)) * (this._InvoiceDetails[index].TaxAmount) / 100))
            } else {
                res = (Number(((data.get('ReturnQty').value) * (data.get('Unitprice').value) - (data.get('Discount').value)) * (data.get('TaxAmount').value) / 100))
            }
            if (res < 0)
                res = 0
            this._Tax = this._Tax + res
            this.creditNoteForm.controls['TotalGSTAmount'].patchValue(this._Tax)

            if (Number(data.get('ReturnQty').value > 0)) {
                var Dis_obj = Number(data.get('Discount').value)
            } else {
                Dis_obj = 0
            }
            this.SubDiscount = this.SubDiscount + Dis_obj
            this.creditNoteForm.controls['Discount'].patchValue(this.SubDiscount)

            this._CNTotal = (this._Total - this.SubDiscount) + this._Tax
            this.creditNoteForm.controls['SubTotalDiscount'].patchValue(this._CNTotal)


        })


        var M11 = Number(((Number(itemGroupControl.controls[index].get('ReturnQty').value)) * (Number(itemGroupControl.controls[index].get('Unitprice').value))) - Number(itemGroupControl.controls[index].get('Discount').value))

        var P11 = Number(M11 * (itemGroupControl.controls[index].get('TaxAmount').value) / 100)

        itemGroupControl.controls[index].get('CNTotalValue').patchValue(M11 + P11)

        var Taxbefore = (Number(itemGroupControl.controls[index].get('ReturnQty').value) * Number(itemGroupControl.controls[index].get('Unitprice').value) - Number(itemGroupControl.controls[index].get('Discount').value))
        itemGroupControl.controls[index].get('TotalbefTax').patchValue(Taxbefore)

        var Subgst = this.creditNoteForm.controls['SubItemGSTAdjustment'].value
        var SubtotalAdj = this.creditNoteForm.controls['TotalAdjustment'].value

        this.creditNoteForm.controls['NetTotal'].setValue(this._CNTotal + Number(Subgst))
        this.creditNoteForm.controls['CreditNoteTotal'].setValue(this._CNTotal + Number(Subgst) + Number(SubtotalAdj))

        if (!this.hasCRNType) {

            var OutstandingAmount = this.creditNoteForm.controls['InvoiceTotalAmount'].value - this.creditNoteForm.controls['CreditNoteTotal'].value
            this.creditNoteForm.controls['InvoiceOSAmount'].setValue(OutstandingAmount)
        }

    }


    CalculatePriceSubItem(index) {
        this._Total = 0
        this._Tax = 0
        this.SubDiscount = 0
        this._CNTotal = 0
        let itemGroupControl = <FormArray>this.creditNoteForm.controls['CreditNoteLineItems'];

        if (!this.HasTaxChanged) {
            if (!this.hasCRNType && itemGroupControl.controls[index].get('TaxID').value && (itemGroupControl.controls[index].get('TaxAmount').value == 0 || itemGroupControl.controls[index].get('TaxAmount').value == null))
                itemGroupControl.controls[index].get('TaxAmount').setValue(this._InvoiceDetails[index].TaxAmount)
            else if (this.CreditnoteId == 0 && !this.hasCRNType)
                itemGroupControl.controls[index].get('TaxAmount').setValue(this._InvoiceDetails[index].TaxAmount)
            else
                itemGroupControl.controls[index].get('TaxAmount').setValue(this.SupplierTaxAmount)
        }
        if (!this.hasCRNType && this.CreditnoteId == 0) {
            this.Tax = Number(((((itemGroupControl.controls[index].get('ItemQty').value) * (itemGroupControl.controls[index].get('DecreaseInUnitPrice').value)) - Number(itemGroupControl.controls[index].get('Discount').value)) * ((this._InvoiceDetails[index].TaxAmount) / 100)).toFixed(4))
        } else {
            // var Value1 = Number(itemGroupControl.controls[index].get('ItemQty').value) * Number(itemGroupControl.controls[index].get('DecreaseInUnitPrice').value)
            // var DiscountValue = Value1 - ((itemGroupControl.controls[index].get('Discount').value).replace(/,/g, ''))
            // var finalTax = DiscountValue * ((itemGroupControl.controls[index].get('TaxAmount').value) / 100)
            this.Tax = Number(((((itemGroupControl.controls[index].get('ItemQty').value) * (itemGroupControl.controls[index].get('DecreaseInUnitPrice').value)) - Number(itemGroupControl.controls[index].get('Discount').value.toString().replace(/,/g, ''))) * ((itemGroupControl.controls[index].get('TaxAmount').value) / 100)).toFixed(4))
        }
        if (this.Tax < 0)
            this.Tax = 0
        itemGroupControl.controls[index].get('Tax').patchValue(Number(this.Tax))

        itemGroupControl.controls.forEach((data, index) => {
            this._Total = this._Total + ((data.get('ItemQty').value) * (data.get('DecreaseInUnitPrice').value))
            this.creditNoteForm.get('SubTotal').patchValue(this._Total)

            if (!this.hasCRNType && this.CreditnoteId == 0) {
                var res = (Number((((data.get('ItemQty').value) * (data.get('DecreaseInUnitPrice').value)) - Number(data.get('Discount').value)) * (this._InvoiceDetails[index].
                    TaxAmount) / 100))
            } else {
                res = (Number((((data.get('ItemQty').value) * (data.get('DecreaseInUnitPrice').value)) - Number(data.get('Discount').value)) * (data.get('TaxAmount').value) / 100))
            }
            if (res < 0)
                res = 0
            this._Tax = this._Tax + res
            this.creditNoteForm.controls['TotalGSTAmount'].patchValue(this._Tax)


            if (((itemGroupControl.controls[index].get('DecreaseInUnitPrice').value).toString().replace(/,/g, '')) > 0) {
                var Dis_obj = Number(data.get('Discount').value)
            } else {
                Dis_obj = 0
            }
            this.SubDiscount = this.SubDiscount + Dis_obj
            if (this.HasPOTypeId != 5 && this.HasPOTypeId != 6)
                this.creditNoteForm.controls['Discount'].patchValue(this.SubDiscount)

            this._CNTotal = (this._Total - this.SubDiscount) + this._Tax
            this.creditNoteForm.controls['SubTotalDiscount'].patchValue(this._CNTotal)

        })

        itemGroupControl.controls[index].get('Discount').patchValue(itemGroupControl.controls[index].get('Discount').value)
        var M11 = Number(((Number(itemGroupControl.controls[index].get('ItemQty').value)) * (Number(itemGroupControl.controls[index].get('DecreaseInUnitPrice').value))) - Number(itemGroupControl.controls[index].get('Discount').value))

        var P11 = Number(M11 * (itemGroupControl.controls[index].get('TaxAmount').value) / 100)

        itemGroupControl.controls[index].get('CNTotalValue').patchValue(M11 + P11)

        var Taxbefore = (Number(itemGroupControl.controls[index].get('ItemQty').value) * Number(itemGroupControl.controls[index].get('DecreaseInUnitPrice').value) - Number(itemGroupControl.controls[index].get('Discount').value))
        itemGroupControl.controls[index].get('TotalbefTax').patchValue(Taxbefore)

        var Subgst = this.creditNoteForm.controls['SubItemGSTAdjustment'].value
        var SubtotalAdj = this.creditNoteForm.controls['TotalAdjustment'].value

        this.creditNoteForm.controls['NetTotal'].setValue(this._CNTotal + Number(Subgst))
        this.creditNoteForm.controls['CreditNoteTotal'].setValue(this._CNTotal + Number(Subgst) + Number(SubtotalAdj))

        if (!this.hasCRNType) {
            var OutstandingAmount = this.creditNoteForm.controls['InvoiceTotalAmount'].value - this.creditNoteForm.controls['CreditNoteTotal'].value
            this.creditNoteForm.controls['InvoiceOSAmount'].setValue(OutstandingAmount)
        }
    }

    calculateNetTotal(value, Inputstring: string) {
        if (!Number(value) && Number(value) != 0) {
            if (Inputstring == 'NetTotal')
                this.creditNoteForm.get('SubItemGSTAdjustment').setErrors({ 'ProperinputErr': true });
            else
                this.creditNoteForm.get('TotalAdjustment').setErrors({ 'ProperinputErr': true });
        } else {
            if (Inputstring == 'NetTotal') {
                if (value == 0 && value == "") {
                    // this.OnGSTAdjchange = false
                    value = 0
                    this.creditNoteForm.controls['SubItemGSTAdjustment'].setValue(0)
                }
                //} else {
                if (value < -0.99) {
                    this.creditNoteForm.controls['SubItemGSTAdjustment'].setValue(value)
                    this.creditNoteForm.get('SubItemGSTAdjustment').setErrors({ 'TaxAdjustMinusErr': true });
                }
                else if (value >= 1) {
                    // value = 0

                    // this.sharedServiceObj.showMessage({
                    //     ShowMessage: true,
                    //     Message: 'GST Adjustment should not be more than 0.99',
                    //     MessageType: MessageTypes.Error

                    // })
                    this.creditNoteForm.controls['SubItemGSTAdjustment'].setValue(value)
                    this.creditNoteForm.get('SubItemGSTAdjustment').setErrors({ 'TaxAdjustErr': true });
                    // this.creditNoteForm.get('SubItemGSTAdjustment').setValidators([Validators.required]);
                    // this.creditNoteForm.get('SubItemGSTAdjustment').updateValueAndValidity();


                } else {
                    var Taxobj = this.creditNoteForm.controls['TotalGSTAmount'].value
                    var _TotalAdjustment = this.creditNoteForm.controls['TotalAdjustment'].value
                    this._NetTotal = Number(this._Total - this.creditNoteForm.controls['Discount'].value) + Taxobj + Number(value)
                    this.creditNoteForm.controls['SubItemGSTAdjustment'].setValue(value)
                    // this.creditNoteForm.controls['NetTotal'].setValue(this.creditNoteForm.controls['SubTotalDiscount'].value + Number(value))
                    this.creditNoteForm.controls['NetTotal'].setValue(this._NetTotal)
                    this.creditNoteForm.controls['CreditNoteTotal'].setValue(this._NetTotal + Number(_TotalAdjustment))

                    if (!this.hasCRNType) {
                        var OutstandingAmount = this.creditNoteForm.controls['InvoiceTotalAmount'].value - this.creditNoteForm.controls['CreditNoteTotal'].value
                        this.creditNoteForm.controls['InvoiceOSAmount'].setValue(OutstandingAmount)
                    }
                    this.SetValidateCreditNoteTotal(Inputstring)
                    this.OnGSTAdjchange = true
                }

                // }
            } else {
                if (value == 0 && value == "") {
                    //this.OnTotalAdjchange = false
                    value = 0
                    this.creditNoteForm.controls['TotalAdjustment'].setValue(0)
                }
                if (value < -0.99) {
                    this.creditNoteForm.controls['TotalAdjustment'].setValue(value)
                    this.creditNoteForm.get('TotalAdjustment').setErrors({ 'TotalAdjustMinusErr': true });
                }
                else if (value >= 1) {
                    // value = 0
                    // this.sharedServiceObj.showMessage({
                    //     ShowMessage: true,
                    //     Message: 'Total Adjustment should not be more than 0.99',
                    //     MessageType: MessageTypes.Error

                    // })
                    // this.creditNoteForm.get('TotalAdjustment').setValidators([Validators.required]);
                    // this.creditNoteForm.get('TotalAdjustment').updateValueAndValidity();
                    this.creditNoteForm.controls['TotalAdjustment'].setValue(value)
                    this.creditNoteForm.get('TotalAdjustment').setErrors({ 'TotalAdjustErr': true });

                }
                else {
                    if (this.OnGSTAdjchange == true) {
                        this._NetCreditNote = Number(value) + this._NetTotal
                        this.creditNoteForm.controls['TotalAdjustment'].setValue(value)
                        this.creditNoteForm.controls['CreditNoteTotal'].setValue(this.creditNoteForm.controls['NetTotal'].value + Number(value))
                        this.SetValidateCreditNoteTotal(Inputstring)

                    } else if (this.creditNoteDetails.CreditNoteId > 0 && !this.OnGSTAdjchange) {
                        var NetTotalvalue = this.creditNoteForm.controls['NetTotal'].value
                        this._NetCreditNote = Number(value) + NetTotalvalue
                        this.creditNoteForm.controls['TotalAdjustment'].setValue(value)
                        this.creditNoteForm.controls['CreditNoteTotal'].setValue(this.creditNoteForm.controls['NetTotal'].value + Number(value))
                        this.SetValidateCreditNoteTotal(Inputstring)

                    } else {
                        this._NetCreditNote = Number(value) + this._Tax + this._Total
                        this.creditNoteForm.controls['TotalAdjustment'].setValue(value)
                        this.creditNoteForm.controls['CreditNoteTotal'].setValue(this.creditNoteForm.controls['NetTotal'].value + Number(value))
                        this.SetValidateCreditNoteTotal(Inputstring)
                    }

                    if (!this.hasCRNType) {
                        var OutstandingAmount = this.creditNoteForm.controls['InvoiceTotalAmount'].value - this.creditNoteForm.controls['CreditNoteTotal'].value
                        this.creditNoteForm.controls['InvoiceOSAmount'].setValue(OutstandingAmount)
                    }

                    this.OnTotalAdjchange = true
                }
                //}
            }
        }

    }

    SetValidateCreditNoteTotal(Inputstring) {
        if (Inputstring == "NetTotal") {
            var _NetTotal = this.creditNoteForm.controls['NetTotal'].value
            if (_NetTotal < 0) {
                this.creditNoteForm.controls['NetTotal'].setValue(0)
                this.creditNoteForm.controls['CreditNoteTotal'].setValue(0)
                this.creditNoteForm.get('NetTotal').setErrors({ 'NegNettotalErr': true });

            }
        } else {
            var _CRNTotal = this.creditNoteForm.controls['CreditNoteTotal'].value
            if (_CRNTotal < 0) {
                this.creditNoteForm.controls['CreditNoteTotal'].setValue(0)
                this.creditNoteForm.get('CreditNoteTotal').setErrors({ 'CRNnegativeErr': true });
            }
        }

    }

    ShowRemarksPopUp(statusId: number) {
        switch (statusId) {
            case WorkFlowStatus.Rejected: {
                this.pmoduleHeading = "Credit Note Reject Reason";
                break;
            }
            case WorkFlowStatus.CancelledApproval: {
                this.pmoduleHeading = "Credit Note Cancel Approval Reason";
                break;
            }
            case WorkFlowStatus.Void: {
                this.pmoduleHeading = "Credit Note Void Reason";
                break;
            }
            default: {
                break;
            }
        };
        this.showRemarksPopUp = true;
        this.CreditNoteRemarksForm.patchValue({
            Reasons: "",
            StatusId: statusId
        });
    }
    ProceedRemarks() {
        if (this.CreditNoteRemarksForm.invalid) {
            this.CreditNoteRemarksForm.controls['Reasons'].markAsTouched()
            return;
        } else {
            switch (this.CreditNoteRemarksForm.get('StatusId').value) {
                case WorkFlowStatus.Rejected: {
                    this.RejectDocument();
                    break;
                }
                case WorkFlowStatus.Void: {
                    this.VoidDocument();
                    break;
                }
                case WorkFlowStatus.CancelledApproval: {
                    this.CancelApprovalDocument();
                    break;
                }
            }
            this.showRemarksPopUp = false;
        }
    }
    VoidDocument() {
        let workFlowStatus: WorkFlowApproval = {
            DocumentId: this.creditNoteDetails.CreditNoteId,
            UserId: this.userDetails.UserID,
            WorkFlowStatusId: WorkFlowStatus.Void,
            Remarks: this.CreditNoteRemarksForm.controls['Reasons'].value,
            RequestUserId: this.creditNoteDetails.CreatedBy,
            DocumentCode: this.creditNoteForm.get('DocumentCode').value,
            ProcessId: WorkFlowProcess.CreditNote,
            CompanyId: this.companyId,
            ApproverUserId: 0,
            IsReApproval: false,
            ReferenceDocumentId: this.creditNoteForm.get('InvoiceId').value,
            ReferenceProcessId: WorkFlowProcess.SupplierInvoice
        };
        this.genricService.VoidDocument(workFlowStatus).subscribe((data) => {
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: 'Credit Note Status Changed to Void',
                MessageType: MessageTypes.Success
            });
            this.backtoList();
            this.showRemarksPopUp = false;
        });
    }

    CancelDraftRecord() {
        this.confirmationServiceObj.confirm({
            message: "Do you really want to Cancel the Draft ?",
            header: 'Are you sure!',
            accept: () => {
                let workFlowStatus: WorkFlowApproval = {
                    DocumentId: this.creditNoteDetails.CreditNoteId,
                    UserId: this.userDetails.UserID,
                    WorkFlowStatusId: WorkFlowStatus.CancelDraft,
                    Remarks: "",
                    RequestUserId: this.creditNoteDetails.CreatedBy,
                    DocumentCode: this.creditNoteDetails.DocumentCode,
                    ProcessId: WorkFlowProcess.CreditNote,
                    CompanyId: this.companyId,
                    ApproverUserId: 0,
                    IsReApproval: false
                };
                this.genricService.CancelDraftDocument(workFlowStatus).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: 'Credit Note Status Changed to Cancel Draft',
                        MessageType: MessageTypes.Success
                    });
                    this.showRemarksPopUp = false;
                    this.backtoList();
                });
            },
            rejectVisible: false,
            acceptLabel: "Ok"
        });
    }

    displayLogPopUp() {
        this.showLogPopUp = true;
    }
    hideLogPopUp(hidePopUp: boolean) {
        this.showLogPopUp = false;
    }

    onPDFPrint() {
        this.genricService.PrintDocument(this.CreditnoteId, WorkFlowProcess.CreditNote, this.companyId).subscribe((data: any) => {
            saveAs(new Blob([(data)], { type: 'application/pdf' }), "CreditNote" + this.creditNoteDetails.DocumentCode + ".pdf");
        });
    }

    OnChangeSupplierType(value) {
        if (value == 'Internal') {
            this.creditNoteForm.controls['SupplierType'].patchValue(this.supplierCategoryType[0])
        } else {
            this.creditNoteForm.controls['SupplierType'].patchValue(this.supplierCategoryType[1])
        }
    }
    SendForApproval() {
        let workFlowDetails: WorkFlowParameter = {
            ProcessId: WorkFlowProcess.CreditNote,
            CompanyId: this.creditNoteForm.get('CompanyId').value,
            LocationId: this.creditNoteForm.get('LocationID').value,
            FieldName: "",
            Value: this.creditNoteForm.get('SubTotal').value,
            DocumentId: this.creditNoteForm.get('CreditNoteId').value,
            CreatedBy: this.userDetails.UserID,
            WorkFlowStatusId: WorkFlowStatus.WaitingForApproval
        };
        this.genricService.sendForApproval(workFlowDetails).subscribe((data) => {
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: 'Credit Note Send for approval successfully.',
                MessageType: MessageTypes.Success
            });
            this.backtoList();
            this.showRemarksPopUp = false;
        });
    }
    SendForClarification() {
        let workFlowDetails: WorkFlowApproval = {
            DocumentId: this.creditNoteForm.get('CreditNoteId').value,
            CompanyId: this.creditNoteForm.get('CompanyId').value,
            ProcessId: WorkFlowProcess.CreditNote,
            WorkFlowStatusId: WorkFlowStatus.AskedForClarification,
            UserId: this.userDetails.UserID,
            Remarks: this.creditNoteForm.get('Remarks').value,
            RequestUserId: this.creditNoteForm.get('CreatedBy').value,
            DocumentCode: this.creditNoteForm.get('DocumentCode').value,
            IsReApproval: false
        };
        this.genricService.SendForClarificationDocument(workFlowDetails).subscribe((data) => {
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: 'Credit Note Send for clarification successfully',
                MessageType: MessageTypes.Success
            });
            this.backtoList();
            this.showRemarksPopUp = false;
        });
    }
    ReplyForClarification() {
        let workFlowDetails: WorkFlowApproval = {
            DocumentId: this.creditNoteForm.get('CreditNoteId').value,
            CompanyId: this.creditNoteForm.get('CompanyId').value,
            ProcessId: WorkFlowProcess.CreditNote,
            WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
            UserId: this.userDetails.UserID,
            Remarks: this.creditNoteForm.get('Remarks').value,
            ApproverUserId: this.creditNoteDetails.CurrentApproverUserId,
            DocumentCode: this.creditNoteForm.get('DocumentCode').value,
            IsReApproval: false
        };
        this.genricService.ReplyDocument(workFlowDetails).subscribe((data) => {
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: 'Credit Note Replied for clarification successfully.',
                MessageType: MessageTypes.Success
            });
            this.backtoList();
            this.showRemarksPopUp = false;
        });
    }
    onApproveClick() {
        this.SetValidators('verify');
        if (this.creditNoteForm.valid) {
            if (this.IsEditClicked) {
                this.SaveCreditNote('verify');
            }
            this.ApproveDocument();
        }
    }
    ApproveDocument() {
        let workFlowDetails: WorkFlowApproval = {
            ProcessId: WorkFlowProcess.CreditNote,
            CompanyId: this.creditNoteForm.get('CompanyId').value,
            DocumentId: this.creditNoteForm.get('CreditNoteId').value,
            WorkFlowStatusId: WorkFlowStatus.Approved,
            ApproverUserId: this.userDetails.UserID,
            DocumentCode: this.creditNoteForm.get('DocumentCode').value,
            Remarks: '',
            UserId: this.userDetails.UserID,
            RequestUserId: this.creditNoteForm.get('CreatedBy').value,
            ReferenceDocumentId: this.creditNoteForm.get('InvoiceId').value,
            ReferenceProcessId: WorkFlowProcess.SupplierInvoice
        };
        this.genricService.ApproveDocument(workFlowDetails).subscribe((data) => {
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: 'Credit Note approved successfully.',
                MessageType: MessageTypes.Success
            });
            this.backtoList();
            this.showRemarksPopUp = false;
        });
    }
    RejectDocument() {
        let workFlowDetails: WorkFlowApproval = {
            ProcessId: WorkFlowProcess.CreditNote,
            CompanyId: this.creditNoteForm.get('CompanyId').value,
            DocumentId: this.creditNoteForm.get('CreditNoteId').value,
            WorkFlowStatusId: WorkFlowStatus.Rejected,
            ApproverUserId: this.userDetails.UserID,
            DocumentCode: this.creditNoteForm.get('DocumentCode').value,
            Remarks: this.CreditNoteRemarksForm.get('Reasons').value,
            UserId: this.creditNoteDetails.CreatedBy,
            RequestUserId: this.creditNoteDetails.CreatedBy
        };
        this.genricService.RejectDocument(workFlowDetails).subscribe((data) => {
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: 'Credit Note Rejected',
                MessageType: MessageTypes.Error
            });
            this.backtoList();
            this.showRemarksPopUp = false;
        });
    }
    CancelApprovalDocument() {
        let workFlowDetails: WorkFlowApproval = {
            ProcessId: WorkFlowProcess.CreditNote,
            CompanyId: this.creditNoteForm.get('CompanyId').value,
            DocumentId: this.creditNoteForm.get('CreditNoteId').value,
            WorkFlowStatusId: WorkFlowStatus.CancelledApproval,
            ApproverUserId: this.creditNoteDetails.CurrentApproverUserId,
            DocumentCode: this.creditNoteForm.get('DocumentCode').value,
            Remarks: this.CreditNoteRemarksForm.get('Reasons').value,
            UserId: this.userDetails.UserID,
            RequestUserId: this.creditNoteDetails.CreatedBy
        };
        this.genricService.CancelApprovalDocument(workFlowDetails).subscribe((data) => {
            this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: 'Credit Note approval cancelled.',
                MessageType: MessageTypes.Success
            });
            this.backtoList();
            this.showRemarksPopUp = false;
        });
    }
    onDeptChange() {
        this.followWorkflow = false;
        var dept: any = this.departments.filter(x => x.LocationID == this.creditNoteForm.get('LocationID').value);
        if (dept != null && dept.length > 0) {
            this.followWorkflow = (dept[0].IsFollowWorkflow && dept[0].HasWorkflow) ? true : false;
        }
    }
    ClearPermissions() {
        this.EditPermission = false;
        this.VoidPermission = false;
        this.printPermission = false;
        this.exportPermission = false;
        this.approvePermission = false;
        this.verifyPermission = false;
        this.reVerifyPermission = false;
        this.viewLogPermission = false;
        this.sendForApprovalPermission = false;
    }
    Reverify() {
        this.isReVerifing = true;
        this.EditCreditNote();
    }
    exportDocument() {
        const ws1_name = 'Invoices';
        const ws2_name = 'Invoice_Details';
        const ws3_name = 'Invoice_Payment_Schedules';
        const ws4_name = 'Invoice_Optional_Fields';
        const ws5_name = 'Invoice_Detail_Optional_Fields';
        let ws1DataDetails = [];
        let ws2DataDetails = [];
        let ws3DataDetails = [];
        let ws4DataDetails = [];
        let ws5DataDetails = [];
        this.creditNoteServiceObj.ExportCNDocument(this.CreditnoteId).subscribe((result: DocumentExportData) => {
            if (result != null) {
                this.reportData = result;
                this.reportData.Invoices.forEach((e: InvoiceSection, i) => {
                    ws1DataDetails.push(e);
                });
                this.reportData.InvoiceDetails.forEach((e, i) => {
                    ws2DataDetails.push(e);
                });
                this.reportData.InvoicePaymentScheduleSections.forEach((e, i) => {
                    ws3DataDetails.push(e);
                });
                this.reportData.InvoiceOptinalFieldsSections.forEach((e, i) => {
                    ws4DataDetails.push(e);
                });
                this.reportData.InvoiceDetailsOptinalFieldsSections.forEach((e, i) => {
                    ws5DataDetails.push(e);
                });
                let url = "/assets/ExcelTemplates/AP Invoice.xlsx";
                let req = new XMLHttpRequest();
                req.open("GET", url, true);
                req.responseType = "arraybuffer";
                req.onload = (e) => {
                    let data = new Uint8Array(req.response);
                    let wb = XLSX.read(data, { type: "array" });
                    const ws1: any = utils.json_to_sheet(ws1DataDetails);
                    const ws2: any = utils.json_to_sheet(ws2DataDetails);
                    const ws3: any = utils.json_to_sheet(ws3DataDetails);
                    const ws4: any = utils.json_to_sheet(ws4DataDetails);
                    const ws5: any = utils.json_to_sheet(ws5DataDetails);
                    wb.Sheets[ws1_name] = ws1;
                    wb.Sheets[ws2_name] = ws2;
                    wb.Sheets[ws3_name] = ws3;
                    wb.Sheets[ws4_name] = ws4;
                    wb.Sheets[ws5_name] = ws5;
                    const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
                    let ExcelExportFileName = "ExportCreditNote_" + (new Date().getDate()) + ".xlsx";
                    saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), ExcelExportFileName);
                    let workFlowDetails: WorkFlowApproval = {
                        ProcessId: WorkFlowProcess.CreditNote,
                        CompanyId: this.creditNoteForm.get('CompanyId').value,
                        DocumentId: this.creditNoteForm.get('CreditNoteId').value,
                        WorkFlowStatusId: WorkFlowStatus.Exported,
                        ApproverUserId: 0,
                        DocumentCode: '',
                        Remarks: '',
                        UserId: this.userDetails.UserID
                    };
                    this.genricService.UpdateDocumentStatus(workFlowDetails).subscribe((x: boolean) => {
                        this.GetCreditNoteDetails();
                    });
                };
                req.send();
            }
        });
    }

    ValidateCNNo() {
        let creditNoteDetails: CreditNote = new CreditNote();
        creditNoteDetails.SupplierCreditNoteNo = this.creditNoteForm.get('SupplierCreditNoteNo').value;
        creditNoteDetails.CreditNoteId = this.CreditnoteId;
        this.creditNoteServiceObj.ValidateCNNo(creditNoteDetails).subscribe((count: boolean) => {
            if (count == false) {
                this.confirmationServiceObj.confirm({
                    message: Messages.DuplicateSupplierCreditNoteNumber,
                    header: Messages.PopupHeader,
                    rejectVisible: false,
                    acceptLabel: "OK"
                });
            }
        });
    }

    bindInvoiceDetails(element: any, index: number, type: string) {
        let AMTTOTTAX: number = element.GSTAMountCurrentPayment + element.GSTAdjustmentCurrentPayment;
        return {
            'CNTBTCH': '1',
            'CNTITEM': index + 1,
            'CNTLINE': 20,
            'IDDIST': '',
            'TEXTDESC': element.ItemDescription,
            'AMTTOTTAX': type == 'RT' ? 0 : AMTTOTTAX.toFixed(2),
            'BASETAX1': type == 'RT' ? Math.abs(element.NRCurrentPayment).toFixed(2) : (element.ADUCCurrentPayment).toFixed(2),
            'TAXCLASS1': type == 'RT' ? element.RetTaxClass : element.TaxClass,
            'RATETAX1': type == 'RT' ? 0 : element.TaxAmount.toFixed(2),
            'AMTTAX1': type == 'RT' ? 0 : AMTTOTTAX.toFixed(2),
            'IDGLACCT': type == 'RT' ? element.GLRet : element.GLCost,
            'AMTDIST': type == 'RT' ? Math.abs(element.NRCurrentPayment).toFixed(2) : (element.ADUCCurrentPayment).toFixed(2),
            'COMMENT': '',
            'SWIBT': '0'
        }
    }
    bindInvoicePaymentSchedules(x: any): any {
        return {
            'CNTBTCH': '',
            'CNTITEM': '',
            'CNTPAYM': '',
            'DATEDUE': '',
            'AMTDUE': ''

        };
    }
    bindInvoiceOptionalDetails(x: any) {
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
    }
    bindInvoiceDetailsOptionalDetails(x: any) {
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
    }
    s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        };
        return buf;
    }
}
