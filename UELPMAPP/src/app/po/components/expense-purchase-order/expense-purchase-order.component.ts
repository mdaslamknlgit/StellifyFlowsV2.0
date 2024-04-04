
import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { Observable, of } from 'rxjs';
import { CostOfService, PurchaseOrderTypes, PurchaseOrderStatus } from "../../models/po-creation.model";
import { ExpensePOService } from "../../services/expense-purchase-order.service";
import { POCreationService } from "../../services/po-creation.service";
import { SharedService } from "../../../shared/services/shared.service";
import {
    PagerConfig, Suppliers, MessageTypes, Taxes,
    GridOperations, Messages, Currency, PaymentTerms, UserDetails, WorkFlowStatus, WorkFlowProcess, PurchaseOrderType
} from "../../../shared/models/shared.model";
import { ExpensePurchaseOrder, ExpensePurchaseOrderDisplayResult } from "../../models/expense-purchase-order.model";
import { ValidateFileType, FullScreen, restrictMinus, getProcessId, HideFullScreen } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { Supplier, SupplierSubCode } from '../../models/supplier';
import { DeliveryTerms } from '../../models/delivery-terms.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { DEFAULT_CURRENCY_ID, NUMBER_PATERN, EMAIL_PATTERN } from '../../../shared/constants/generic';
import { PurchaseOrderRequestService } from '../../services/purchase-order-request.service';
import { PurchaseOrderRequestList, PurchaseOrderRequestDetails } from '../../models/purchase-order-request.model';
import { PoApprovalUpdateStatus } from '../../models/po-approval.model';
import { ExpenseMaster } from '../../models/expense-master.model';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { ExpenseMasterService } from '../../services/expense-master.service';
import { AccountCodeMaster } from '../../models/account-code.model';
import { AccountCodeAPIService } from '../../services/account-code-api.service';
import { TaxService } from '../../services/tax.service';
import { Company } from '../../../administration/models/company';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { Locations } from '../../../inventory/models/item-master.model';
import { ActivatedRoute, Router } from '../../../../../node_modules/@angular/router';
import { WorkFlowApiService } from '../../../administration/services/workflow-api.service';
import { UtilService } from '../../../shared/services/util.service';
@Component({
    selector: 'app-expense-purchase-order',
    templateUrl: './expense-purchase-order.component.html',
    styleUrls: ['./expense-purchase-order.component.css'],
    providers: [ExpenseMasterService, ExpensePOService, PurchaseOrderRequestService,
        POCreationService, TaxService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ExpensePurchaseOrderComponent implements OnInit, OnChanges {
    userDetails: UserDetails = null;
    @Input('selectedPoId') selectedPoId: number;
    @Input('isApprovalPage') isApprovalPage: boolean;
    @Input('remarks') remarks: string;
    @Output()
    readListView: EventEmitter<{ PoId: number, PotypeId: number }> = new EventEmitter<{ PoId: number, PotypeId: number }>(); //creating an output event
    @Output()
    cancelChanges: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output()

    PurchaseOrderId:any;
    updateStatus: EventEmitter<PoApprovalUpdateStatus> = new EventEmitter<PoApprovalUpdateStatus>();
    purchaseOrdersList: Array<ExpensePurchaseOrder> = [];
    purchaseOrderPagerConfig: PagerConfig;
    purchaseOrderItemsGridConfig: PagerConfig;
    purchaseOrderForm: FormGroup;
    selectedPODetails: ExpensePurchaseOrder;
    purchaseOrderTypes: Array<PurchaseOrderTypes> = [];
    suppliers: Suppliers[] = [];
    currencies: Currency[] = [];
    departments: Locations[] = [];
    taxTypes: Array<Taxes> = [];
    gridColumns: Array<{ field: string, header: string }> = [];
    recordInEditMode: number;
    operation: string;
    companyId: number;
    costOfServiceType: CostOfService[] = [];
    hideText?: boolean = null;
    hideInput?: boolean = null;
    uploadedFiles: Array<File> = [];
    leftsection: boolean = false;
    rightsection: boolean = false;
    slideactive: boolean = false;
    showGridErrorMessage: boolean = false;
    scrollbarOptions: any;
    purchaseOrderSearchKey: string;
    apiEndPoint: string;
    showdropdown: boolean = false;
    hideLeftPanel: boolean = false;
    linesToAdd: number = 2;
    paymentTerms: PaymentTerms[] = [];
    deliveryTerms: DeliveryTerms[] = [];
    measurementUnits: MeasurementUnit[] = [];
    deletedPurchaseOrderItems: Array<number> = [];
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    selectedRowId: number = -1;
    accountCodeCategories = [];
    @ViewChild('instructions') instructionsRef: ElementRef;
    @ViewChild('justifications') justificationsRef: ElementRef;
    workFlowStatus: any;
    showLoadingIcon: boolean = false;
    showVoidPopUp: boolean = false;
    purchaseOrderStatus: any;
    accountCategoryId: number = 0;
    isVoid: boolean = false;
    taxGroups = [];
    quotationUploadedFiles: Array<{ File: File, RowIndex: number }> = [];
    gridQuotationColumns: Array<{ field: string, header: string }> = [];
    deletedEXPOQuotationItems: Array<number> = [];
    selectedFileRowIndex: number = 1;
    showGridErrorMessage2: boolean = false;
    selectedSupplierRowId: number = -1;
    supplierid: number;
    TaxGroupId: number;
    TaxID: number;
    isSupplierSelected: boolean = false;
    supplierSubCodes = [];
    company: Company;
    rows: number = 2;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    displayPermission: boolean;
    verifyPermission: boolean;
    approvePermission: boolean;
    emailPermission: boolean;
    printPermission: boolean;
    voidPermission: boolean;
    isAddMode: boolean = true;
    isEditMode: boolean = false;
    checktax: boolean = false;
    isCompanyChanged: boolean = false;
    processId: number = 0;
    deptId: number = 0;
    hasWorkFlow: boolean = true;
    isSameUSer: boolean = false;
    isApproverUser: boolean = false;
    public innerWidth: any;
    IsVerifier: boolean = false;
    public screenWidth: any;
    onFileChoose(index: number, fileInput: any) {
        this.selectedFileRowIndex = index;
        fileInput.click();
    }

    purchaseOrderCode: string = "";
    constructor(private expensePoCreationObj: ExpensePOService,
        private router: Router,
        private formBuilderObj: FormBuilder,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        public sessionService: SessionStorageService,
        private poReqServiceObj: PurchaseOrderRequestService,
        private poCreationObj: POCreationService,
        private reqDateFormatPipe: RequestDateFormatPipe,
        private expenseMasterObj: ExpenseMasterService,
        private accountCodeAPIService: AccountCodeAPIService,
        private taxService: TaxService,
        private utilService: UtilService,
        private workFlowService: WorkFlowApiService,
        private activatedRoute: ActivatedRoute) {
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();
        this.gridColumns = [
            { field: 'Sno', header: 'S.no.' },
            //   { field: 'ItemCode' ,header:'Item Code' },
            { field: 'AccountCodeCategoryId', header: 'Category' },
            { field: 'Name', header: 'Expense' },
            { field: 'ExpensesDescription', header: 'Description' },
            { field: 'MeasurementUnitID', header: 'UOM' },
            { field: 'ExpensesQty', header: 'Qty' },
            { field: 'Unitprice', header: 'Price' },
            { field: 'Totalprice', header: 'Total Price' },
            { field: 'Discount', header: 'Discount' },
            { field: 'TotalbefTax', header: 'Total bef Tax' },
            { field: 'TaxGroup', header: 'Tax Group' },
            { field: 'GstType', header: 'Gst Type' },
            { field: 'GstAmount', header: 'Gst Amount' },
            { field: 'ItemTotal', header: 'LineTotal' }
        ];

        this.gridQuotationColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'Name', header: 'Supplier Name' },
            { field: 'QuotationAmount', header: 'Quotation Amount' },
            { field: 'Remarks', header: 'Remarks' },
            { field: 'Attachment', header: 'Attachment' },
            { field: '', header: 'Choose' },
            { field: 'RowIndex', header: 'Default' }
        ];

        this.apiEndPoint = environment.apiEndpoint;
        this.sharedServiceObj.deliveryAddress$.subscribe((data) => {
            this.purchaseOrderForm.patchValue({
                "DeliveryAddress": data,
            });
        }
        );
        this.getformgroup();
        this.workFlowStatus = WorkFlowStatus;
        this.purchaseOrderStatus = PurchaseOrderStatus;
    }
    @ViewChild('rightPanel') rightPanelRef;
    ngOnInit() {
        debugger;
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (!this.isApprovalPage) {
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "po")[0];
                this.newPermission = formRole.IsAdd;
                this.editPermission = formRole.IsEdit;
                this.deletePermission = formRole.IsDelete;

                this.verifyPermission = formRole.IsVerify;
                this.approvePermission = formRole.IsApprove;
                this.emailPermission = formRole.IsEmail;
                this.printPermission = formRole.IsPrint;
                this.voidPermission = formRole.IsVoid;
            }
            else {
                this.newPermission = true;
                this.editPermission = true;
                this.deletePermission = true;

                this.verifyPermission = true;
                this.approvePermission = true;
                this.emailPermission = true;
                this.printPermission = true;
                this.voidPermission = true;
            }
        }
        else {
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "purchaseorderapproval")[0];
                this.approvePermission = formRole.IsApprove;
                this.IsVerifier = formRole.IsVerify;
            }
            else {
                this.approvePermission = true;
                this.IsVerifier = false;
            }
        }

        this.purchaseOrderPagerConfig = new PagerConfig();
        this.purchaseOrderPagerConfig.RecordsToFetch = 100;
        this.purchaseOrderItemsGridConfig = new PagerConfig();
        this.purchaseOrderItemsGridConfig.RecordsToFetch = 20;
        this.selectedPODetails = new ExpensePurchaseOrder();
        this.company = new Company();
        //getting the purchase order types.
        this.poCreationObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                this.purchaseOrderTypes = data;
            });
        //getting the list of cost of service types.
        this.poCreationObj.getCostOfServiceTypes()
            .subscribe((data: CostOfService[]) => {
                this.costOfServiceType = data;
            });
        //    this.poCreationObj.getDepartments()
        //         .subscribe((data:Location[])=>{
        //             this.departments = data;
        //         });
        this.getDepartments(this.companyId);
        this.sharedServiceObj.getCurrencies()
            .subscribe((data: Currency[]) => {
                this.currencies = data;
            });
        this.activatedRoute.paramMap.subscribe((data) => {
            let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
            if (Number(companyId) != 0)
                this.companyId = companyId;
        });
        this.sharedServiceObj.IsCompanyChanged$
            .subscribe((data) => {
                this.isCompanyChanged = data;
                if (this.isCompanyChanged) {

                    this.getDepartments(this.companyId);
                    this.getCompanyDetails(this.companyId);
                    this.getAccountCodeCategories(this.companyId);
                    this.sharedServiceObj.updateCompany(false);
                }
            });
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                //this.getDepartments(this.companyId);
            });

        this.operation = GridOperations.Display;
        this.getPaymentTerms();
        this.getMeasurementUnits();
        this.getTaxTypes();
        this.getDeliveryTerms();
        this.getAccountCodeCategories(this.companyId);
        this.getTaxGroups();

      var screenwidth = window.innerWidth-205;
      $(".tablescroll").css("width",screenwidth)
    }



    public noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
    }

    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched));
    }


    getDepartments(companyId: number) {
        this.sharedServiceObj.getUserDepartments(companyId, WorkFlowProcess.ExpensePO, this.userDetails.UserID).subscribe((data: Array<Locations>) => {
            this.departments = data.filter(item => item.Name != 'Inventory');
        });
    }
    getTaxGroups(): void {
        let taxGroupResult = <Observable<Array<any>>>this.sharedServiceObj.getTaxGroupList();
        taxGroupResult.subscribe((data) => {
            this.taxGroups = data;
        });
    }

    getTaxesByTaxGroup(taxGroupId: number, rowIndex: number): void {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
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
    getTaxesByTaxGroupSupplierChange(taxGroupId: number, rowIndex: number): void {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        let taxResult = <Observable<Array<any>>>this.taxService.getTaxesByTaxGroup(taxGroupId);
        taxResult.subscribe((data) => {
            if (data != null) {
                this.taxTypes = data;
                itemGroupControl.controls[rowIndex].value.Taxes = [];
                itemGroupControl.controls[rowIndex].patchValue({
                    Taxes: this.taxTypes
                });
                this.setTaxAmount(this.TaxID, rowIndex);

            }
        });
    }

    getCompanyDetails(companyId: number) {
        this.sharedServiceObj.getCompanyDetails(companyId)
            .subscribe((data: Company) => {
                this.company = data;
                let deliveryAddress = "";
                if (this.company != null) {
                    this.rows = 3;
                    if (this.company.Fax == null) {
                        this.company.Fax = "";
                    }
                    deliveryAddress = this.company.Address1 + "," + "\n" +
                        this.company.Address2 + "," + "\n" +
                        this.company.Address3 + "\n" +
                        this.company.CountryName + ":" + " " + this.company.ZipCode + "\n" +
                        "Tel: " + this.company.Telephone + "\n" +
                        "Fax: " + this.company.Fax;

                }
                else {
                    this.rows = 2;
                }

                this.purchaseOrderForm.patchValue({
                    DeliveryAddress: deliveryAddress
                });
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

    getAccountCodeCategories(companyId: number): void {
        let accountCodeCategoriesResult = <Observable<Array<any>>>this.accountCodeAPIService.getAccountCodeCategories(companyId);
        accountCodeCategoriesResult.subscribe((data) => {
            if (data != null) {
                this.accountCodeCategories = data;
                // this.accountCodeCategories = this.accountCodeCategories.filter(x => x.AccountCodeName.toLowerCase().indexOf('expenses') !== -1 || x.AccountCodeName.toLowerCase().indexOf('insurance') !== -1)  

                this.accountCategoryId = this.accountCodeCategories[0].AccountCodeCategoryId;
            }
        });
    }


    getformgroup() {
        this.purchaseOrderForm = this.formBuilderObj.group({
            'ExpensesPurchaseOrderId': [0],
            'ExpensesPurchaseOrderCode': [""],
            'DraftCode': [""],
            'SupplierTypeID': [1, { validators: [Validators.required] }],
            'POTypeId': [0],
            'LocationId': [null, [Validators.required]],
            'Supplier': [null, [Validators.required]],
            'ExpectedDeliveryDate': [new Date()],
            'VendorReferences': ["", { validators: [Validators.required, this.noWhitespaceValidator] }],
            'CurrencyId': [null, [Validators.required]],
            'SupplierAddress': [""],
            'SupplierCode': [{ value: "", disabled: true }],
            'DeliveryAddress': ["", Validators.required],
            'ShippingFax': [{ value: "", disabled: true }],
            'CostOfServiceId': [null, Validators.required],
            'Instructions': [""],
            'Justifications': [""],
            'PurchaseOrderItems': this.formBuilderObj.array([]),
            'Discount': [0, [Validators.min(0)]],
            'OtherCharges': [0],
            'ShippingCharges': [0],
            'SubTotal': [0],
            'TotalAmount': [0],
            'IsGstRequired': [false],
            'TotalTax': [0],
            'IsGstBeforeDiscount': [false],
            'PaymentTermId': [null, [Validators.required]],
            'PaymentTerms': [{ value: "", disabled: true }],
            'DeliveryTermId': [null],
            'DeliveryTerm': [{ value: "", disabled: true }],
            "Reasons": ["", { validators: [Validators.required, this.noWhitespaceValidator] }],
            'Remarks': [""],
            "RemarksQuotation": [""],
            "EXPOQuotationItem": this.formBuilderObj.array([]),
            'SupplierSubCodeId': [null, [Validators.required]],
            'SupplierSubCode': [null],
            'ContactPersonName': [null],
            'ContactNo': [null, { validators: [Validators.pattern(NUMBER_PATERN)] }],
            'ContactEmail': [null, { validators: [Validators.pattern(EMAIL_PATTERN)] }],
            'PriceSubTotal': [0],
            'DiscountSubTotal': [0],
            'TotalbefTaxSubTotal': [0],
            'InventoryRequestId': [""]
        });
    }

    ngOnChanges(simpleChange: SimpleChanges) {
        //debugger;
        //Old Code Comments on 10-10-2023
        // let change = simpleChange["selectedPoId"];
        // if (!change.firstChange) {
        //     debugger;
        //     this.PurchaseOrderId = parseInt(simpleChange["selectedPoId"].currentValue);

        //     //alert("ngOnChanges : " + simpleChange["selectedPoId"].currentValue + " \nP ID : " + this.PurchaseOrderId);
        //     if (simpleChange["selectedPoId"]) {
        //         let currentValue: number = simpleChange["selectedPoId"].currentValue;
        //         if (currentValue == 0) {
        //             this.addRecord();
        //         }
        //         else if (currentValue > 0) {
        //             this.onRecordSelection(currentValue);
        //         }
        //     }
        //     else if (simpleChange["remarks"] && simpleChange["remarks"].currentValue == "") {
        //         this.purchaseOrderForm.get('Remarks').setValue("");
        //     }
        // }

        //new code 10-10-2023
        debugger;
        if (simpleChange["selectedPoId"]) {
            let currentValue: number = simpleChange["selectedPoId"].currentValue;
            if (currentValue == 0) {
                this.addRecord();
            }
            else if (currentValue > 0) {
                this.onRecordSelection(currentValue);
            }
        }
        else if (simpleChange["remarks"] && simpleChange["remarks"].currentValue == "") {
            this.purchaseOrderForm.get('Remarks').setValue("");
        }
    }
    //this method is used to format the content to be display in the autocomplete textbox after selection..
    //supplierInputFormater = (x: Suppliers) => x.SupplierName;   
    supplierInputFormater = (x: Suppliers) => (x.WorkFlowStatus === "Approved" && !x.IsFreezed) ? x.SupplierName : "";
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    // supplierSearch = (text$: Observable<string>) =>
    //   text$.pipe(
    //     debounceTime(300),
    //     distinctUntilChanged(),
    //     switchMap(term =>
    //         this.sharedServiceObj.getSuppliers({
    //             searchKey:term,
    //             supplierTypeId:this.purchaseOrderForm.get('SupplierTypeID').value,
    //             companyId:this.companyId
    //         }).pipe(
    //         catchError(() => {
    //             return of([]);
    //         }))
    //    )
    // );

    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    this.purchaseOrderForm.patchValue({
                        "SupplierAddress": "",
                        "ShippingFax": "",
                        "SupplierCode": "",
                        "IsGstRequired": false,
                        "SupplierTypeID": 2
                    });
                    let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
                    if (this.isAddMode) {
                        itemGroupControl.controls = [];
                        itemGroupControl.controls.length = 0;
                        this.addGridItem(this.linesToAdd);
                    }
                    else {
                        for (let i = 0; i < itemGroupControl.length; i++) {
                            itemGroupControl.controls[i].get('TaxGroupId').setValue(0);
                            itemGroupControl.controls[i].get('TaxID').setValue(0);
                            itemGroupControl.controls[i].value.Taxes = [];
                        }
                    }

                    this.isSupplierSelected = false;
                    return of([]);
                }
                return this.sharedServiceObj.getActiveSuppliers({
                    searchKey: term,
                    supplierTypeId: this.purchaseOrderForm.get('SupplierTypeID').value,
                    companyId: this.companyId
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

    //supplierQuotationInputFormater = (J: Suppliers) => J.SupplierName;
    supplierQuotationInputFormater = (j: Suppliers) => j.WorkFlowStatus === "Approved" ? j.SupplierName : "";
    supplierQuotationItemSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];
                    itemGroupControl.controls[this.selectedSupplierRowId].reset();
                    return of([]);
                }
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: this.purchaseOrderForm.get('SupplierTypeID').value,
                    CompanyId: this.companyId
                }).map((data: Array<Suppliers>) => {
                    let gridData = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];
                    gridData.controls.forEach((rowdata) => {
                        let supplierRec: Supplier = rowdata.get('Supplier').value;
                        console.log("dss", supplierRec);
                        if (supplierRec != undefined) {
                            data = data.filter(i => i.SupplierId != supplierRec.SupplierId);
                        }
                    });
                    return data;

                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
        );

    onSupplierQuotationItemChange(eventData: any, rowId: number) {
        if (eventData.item != null && eventData.item != undefined) {
            if (eventData.item.WorkFlowStatus != "Approved") {
                //eventData.preventDefault();
                return false;
            }
        }
    }

    onQuotationItemSupplierClick(rowId: number) {
        this.selectedSupplierRowId = rowId;
    }


    poSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    this.clearForm();
                    this.addGridItem(this.linesToAdd);
                    this.selectedPODetails = new ExpensePurchaseOrder();
                    return of([]);
                }
                return this.poReqServiceObj.getAllSearchPurchaseOrdersRequest({
                    Search: term,
                    WorkFlowStatusId: WorkFlowStatus.Approved,
                    CompanyId: this.companyId,
                    POTypeId: PurchaseOrderType.ExpensePo//to fetch only inventory purchase order requests..
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
    poInputFormatter = (x: PurchaseOrderRequestList) => (x.PurchaseOrderRequestCode);

    //     subCodeInputFormatter = (x: SupplierSubCode) =>x.SubCodeDescription;

    //     subCodeSearch = (text$: Observable<string>) =>
    //     text$.pipe(
    //       debounceTime(300),
    //       distinctUntilChanged(),
    //       switchMap((term) =>{
    //         if(term=="")
    //         {        
    //            return of([]);
    //         }
    //         return this.sharedServiceObj.getSupplierSubCodes({       
    //              SearchKey: term,    
    //              SupplierId: this.supplierid,
    //              CompanyId:this.companyId           
    //           }).map((data:Array<any>)=>{

    //             data.forEach((item,index)=>{
    //                 item.index= index;
    //             });
    //             return data;
    //          }).pipe(
    //           catchError((data) => {
    //               return of([]);
    //           }))
    //       })
    // );

    //  onSubCodeChange(event){

    //  }

    clearForm() {
        this.purchaseOrderForm.reset();
        this.purchaseOrderForm.setErrors(null);
        this.purchaseOrderForm.get('Remarks').setErrors(null);
        this.purchaseOrderForm.get('ExpectedDeliveryDate').setValue(new Date());
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        let itemGroupControl1 = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];
        itemGroupControl1.controls = [];
        itemGroupControl1.controls.length = 0;
        this.supplierid = 0;
        this.TaxGroupId = 0;
        this.TaxID = 0;

        this.purchaseOrderForm.patchValue({
            SupplierTypeID: "2",
            IsGstRequired: false,
            POTypeId: PurchaseOrderType.ExpensePo,
            CurrencyId: DEFAULT_CURRENCY_ID
        });
    }
    getDeliveryTerms() {
        this.sharedServiceObj.getAllDeliveryTerms(this.sessionService.getCompanyId())
            .subscribe((data: DeliveryTerms[]) => {
                this.deliveryTerms = data;
            });
    }
    getTaxTypes() {
        this.sharedServiceObj.getTaxGroups(0)
            .subscribe((data: Taxes[]) => {
                this.taxTypes = data;
            });
    }
    getPaymentTerms() {
        this.sharedServiceObj.getPaymentTerms(this.sessionService.getCompanyId())
            .subscribe((data: PaymentTerms[]) => {
                this.paymentTerms = data;
            });
    }
    getMeasurementUnits() {
        this.sharedServiceObj.getUOMList()
            .subscribe((data: MeasurementUnit[]) => {
                this.measurementUnits = data;
            });
    }
    supplierTypeChange(event) {
        let purchaseOrderTypeId = event.target.value;
        this.purchaseOrderForm.get('Supplier').setValue(null);
    }

    //to get list of purchase orders..
    getAllSearchPurchaseOrder(searchKey: string, purchaseOrderIdToBeSelected: number) {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId: this.companyId
        };
        this.showLoadingIcon = true;
        this.expensePoCreationObj.getAllSearchPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: ExpensePurchaseOrderDisplayResult) => {
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;

                if (this.purchaseOrdersList.length > 0) {
                    // if (purchaseOrderIdToBeSelected == 0) {
                    //     this.onRecordSelection(this.purchaseOrdersList[0].ExpensesPurchaseOrderId);
                    // }
                    // else {
                    //     this.onRecordSelection(purchaseOrderIdToBeSelected);
                    // }
                }
                else {
                    this.addRecord();
                }
            }, (err) => { }, () => this.showLoadingIcon = false);
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId: number) {
        //alert("onRecordSelection Purchase Order Id : " + purchaseOrderId);
        console.log("onRecordSelection Purchase Order Id : " + purchaseOrderId);
        this.purchaseOrderForm.reset();
        this.purchaseOrderForm.setErrors(null);
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.showLoadingIcon = true;
        this.expensePoCreationObj.getPurchaseOrderDetails(purchaseOrderId, this.companyId, this.isApprovalPage, userDetails.UserID)
            .subscribe((data: ExpensePurchaseOrder) => {
                debugger;
                this.isSameUSer = (data.RequestedBy == userDetails.UserID) ? true : false;
                this.isApproverUser = (data.CurrentApproverUserId == this.userDetails.UserID) ? true : false;
                this.selectedPODetails = data;
                this.purchaseOrderForm.get('SupplierAddress').setValue(data.SupplierAddress);
                if (data.EXPOQuotationItem == null) {
                    data.EXPOQuotationItem = [];
                }
                let taxTotal = 0;
                this.selectedPODetails.PurchaseOrderItems.forEach(data => {
                    taxTotal = taxTotal + data.TaxTotal;
                });

                this.selectedPODetails.TotalTax = taxTotal;
                if (this.selectedPODetails.SupplierSubCode != null) {
                    this.isSupplierSelected = true;
                }
                else {
                    this.isSupplierSelected = false;
                }

                let priceSubTotal = 0;
                this.selectedPODetails.PurchaseOrderItems.forEach(data => {
                    priceSubTotal = priceSubTotal + data.Totalprice;
                });
                this.selectedPODetails.PriceSubTotal = priceSubTotal;

                let discountSubTotal = 0;
                this.selectedPODetails.PurchaseOrderItems.forEach(data => {
                    discountSubTotal = discountSubTotal + data.Discount;
                });
                this.selectedPODetails.DiscountSubTotal = discountSubTotal;

                let totalbefTaxSubTotal = 0;
                this.selectedPODetails.PurchaseOrderItems.forEach(data => {
                    totalbefTaxSubTotal = totalbefTaxSubTotal + data.TotalbefTax;
                });
                this.selectedPODetails.TotalbefTaxSubTotal = totalbefTaxSubTotal;

                this.operation = GridOperations.Display;
                this.hideText = true;
                this.hideInput = false;
            }, (err) => { }, () => this.showLoadingIcon = false);
    }
    /**
     * this method will be called on the supplier dropdown change event.
     */
    onSupplierChange(event?: any) {
        let itemGroupControl1 = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        let supplierDetails: Suppliers;
        if (event != null && event != undefined) {
            supplierDetails = event.item;
            this.supplierid = event.item.SupplierId;
            this.TaxGroupId = supplierDetails.TaxGroupId;
            this.TaxID = supplierDetails.TaxID;
            this.purchaseOrderForm.get('CurrencyId').setValue(event.item.CurrencyId);
        }
        else {
            supplierDetails = this.purchaseOrderForm.get('Supplier').value;
            supplierDetails.PaymentTermsId = this.purchaseOrderForm.get('PaymentTermsId').value;
        }
        if (supplierDetails != undefined) {
            if ((supplierDetails.WorkFlowStatus != null) && (supplierDetails.WorkFlowStatus === "Approved") && (!supplierDetails.IsFreezed)) {
                this.purchaseOrderForm.patchValue({
                    "SupplierAddress": supplierDetails.SupplierAddress,
                    "ShippingFax": supplierDetails.BillingFax,
                    "SupplierCode": supplierDetails.SupplierCode,
                    "IsGstRequired": supplierDetails.GSTStatusId == 1 ? true : false,
                    "SupplierTypeID": supplierDetails.SupplierTypeID == 1 ? "1" : "2",
                    "PaymentTermId": supplierDetails.PaymentTermsId
                });
                this.onPaymentTermChange(null);
                if (event != null && event != undefined) {
                    for (let i = 0; i < itemGroupControl1.length; i++) {
                        itemGroupControl1.controls[i].get('TaxGroupId').setValue(supplierDetails.TaxGroupId);
                        itemGroupControl1.controls[i].get('TaxID').setValue(supplierDetails.defaulttaxgroup);
                        this.getTaxesByTaxGroupSupplierChange(supplierDetails.TaxGroupId, i);
                    }
                }

                if (supplierDetails.SubCodeCount > 0 || this.purchaseOrderForm.get("SupplierSubCode").value != null) {
                    this.isSupplierSelected = true;
                    this.purchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
                    this.purchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
                }
                else {
                    this.isSupplierSelected = false;
                    this.purchaseOrderForm.get('SupplierSubCodeId').clearValidators();
                    this.purchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
                }

                //getting Supplier sub Codes
                this.getSupplierSubCodes(supplierDetails.SupplierId, this.companyId);
            }
            else {
                this.isSupplierSelected = false;
                this.purchaseOrderForm.get('Supplier').setValue(null);
                //event.preventDefault();
                return false;
            }
        }
        else {
            this.purchaseOrderForm.patchValue({
                "SupplierAddress": "",
                "ShippingFax": "",
                "SupplierCode": "",
                "IsGstRequired": false,
                "SupplierTypeID": 2
            });

            this.isSupplierSelected = false;
            this.purchaseOrderForm.get('SupplierSubCodeId').clearValidators();
            this.purchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
        }
    }
    onPOChange(event?: any) {
        let purchaseOrderDetails: PurchaseOrderRequestList;
        if (event != null && event != undefined) {
            purchaseOrderDetails = event.item;
        }
        if (purchaseOrderDetails != undefined) {
            this.poReqServiceObj.getPurchaseOrderRequestDetails(purchaseOrderDetails.PurchaseOrderRequestId, getProcessId(purchaseOrderDetails.POTypeId, true))
                .subscribe((response: PurchaseOrderRequestDetails) => {
                    this.clearForm();
                    this.addGridItem(response.PurchaseOrderRequestItems.length);
                    let supplierDetails = null;
                    if (response.Supplier != null && response.Supplier.SupplierId > 0) {
                        supplierDetails = response.Supplier;
                    }
                    this.purchaseOrderForm.patchValue({
                        SupplierTypeID: response.Supplier.SupplierTypeID.toString(),
                        POTypeId: response.POTypeId,
                        LocationId: response.LocationId,
                        Supplier: supplierDetails,
                        ExpectedDeliveryDate: new Date(response.ExpectedDeliveryDate),
                        VendorReferences: response.VendorReferences,
                        CurrencyId: response.CurrencyId,
                        SupplierAddress: response.Supplier.SupplierAddress,
                        DeliveryAddress: response.DeliveryAddress,
                        ShippingFax: response.Supplier.BillingFax,
                        CostOfServiceId: response.CostOfServiceId,
                        Instructions: response.Instructions,
                        Justifications: response.Justifications,
                        PurchaseOrderItems: response.PurchaseOrderRequestItems.map((data) => {
                            data["ExpensesDescription"] = data.ItemDescription;
                            data["ExpensesQty"] = data.ItemQty
                            return data;
                        }),
                        Discount: response.Discount,
                        OtherCharges: response.OtherCharges,
                        ShippingCharges: response.ShippingCharges,
                        SubTotal: response.SubTotal,
                        TotalAmount: response.TotalAmount,
                        IsGstRequired: response.IsGstRequired,
                        IsGstBeforeDiscount: false,
                        PaymentTermId: response.PaymentTermId,
                        PaymentTerms: response.PaymentTerms,
                        DeliveryTermId: response.DeliveryTermId,
                        DeliveryTerm: response.DeliveryTerm,
                        Reasons: response.Reasons
                    });
                    // console.log("purchase order details..",this.purchaseOrderForm.value);

                });


        }
    }
    /**
     * this method is used to format the content to be display in the autocomplete textbox after selection..
     */
    //itemMasterInputFormater = (x: ExpenseMaster) => x.ExpensesDetail;

    /**
     * this mehtod will be called when user gives contents to the  "item master" autocomplete...
     */
    //     itemMasterSearch = (text$: Observable<string>) =>{
    //         if(text$==undefined)
    //          {
    //             return of([]);
    //          }
    //          return text$.pipe(
    //                 debounceTime(300),
    //                 distinctUntilChanged(),
    //                 switchMap((term) =>{
    //                     if(term=="")
    //                     {
    //                        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
    //                        if(itemGroupControl.controls[this.selectedRowId]!=undefined)
    //                        {
    //                           // initGridRows
    //                            let ExpensesPOItemId = itemGroupControl.controls[this.selectedRowId].get('ExpensesPOItemId').value;   
    //                            itemGroupControl.controls[this.selectedRowId].reset();
    //                            itemGroupControl.controls[this.selectedRowId].get('ExpensesPOItemId').setValue(ExpensesPOItemId);   
    //                         }
    //                         return of([]);
    //                     }
    //                     return this.expenseMasterObj.searchExpenseMaster({                    
    //                         Search:term
    //                     }).map((data:ExpenseMaster[])=>{
    //                         if(data==null||data.length==0)
    //                         {
    //                             let itemObj:ExpenseMaster = {
    //                                 ExpensesMasterId:0,
    //                                 ExpensesDetail:term,
    //                                 ExpensesType:"",
    //                                 ExpensesTypeId:0,
    //                                 Location:null,
    //                                 Skip:0,
    //                                 Take:0,
    //                                 CreatedBy:0,
    //                                 CreatedDate:new Date()
    //                             };
    //                             return [itemObj];
    //                         }
    //                         else
    //                         {
    //                             return data;
    //                         }
    //                     }).pipe(
    //                     catchError(() => {

    //                         return of([]);
    //                     }))
    //                 })
    //     );
    // }

    itemMasterInputFormater = (x: AccountCodeMaster) => x.Code;
    itemMasterSearch = (text$: Observable<string>) => {

        if (text$ == undefined) {
            return of([]);
        }
        return text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
                if (term == "") {
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        let ExpensesPOItemId = itemGroupControl.controls[this.selectedRowId].get('ExpensesPOItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('AccountCodeCategoryId').value;
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('ExpensesPOItemId').setValue(ExpensesPOItemId);
                        itemGroupControl.controls[this.selectedRowId].get('AccountCodeCategoryId').setValue(typeId);
                        if (this.TaxGroupId != 0) {
                            this.getTaxesByTaxGroupSupplierChange(this.TaxGroupId, this.selectedRowId);
                            itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(this.TaxID);
                            itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(this.TaxGroupId);
                            itemGroupControl.controls[this.selectedRowId].get('MeasurementUnitID').setValue(undefined);
                        }
                        else {
                            itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(0);
                            itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(0);
                            itemGroupControl.controls[this.selectedRowId].get('MeasurementUnitID').setValue(undefined);
                        }
                    }
                    return of([]);
                }
                let accountCategoryId = itemGroupControl.controls[this.selectedRowId].get('AccountCodeCategoryId').value;
                return this.sharedServiceObj.getServicesByKeyforExpense({
                    searchKey: term,
                    companyId: this.companyId,
                    categoryId: accountCategoryId  //this.accountCategoryId              
                }).map((data: AccountCodeMaster[]) => {
                    // if(data==null||data.length==0)
                    // {
                    //     let objAccountCode:AccountCodeMaster = {
                    //         AccountCodeId:0,
                    //         AccountCodeCategoryId:0,
                    //         AccountType:'',       
                    //         Code:'',                        
                    //         AccountCodeName:term,                                
                    //         Description:""                                
                    //     };
                    //     return [objAccountCode];
                    // }
                    // else
                    // {
                    return this.getAccountCodeList(data);
                    // }
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }

    getAccountCodeList(data: AccountCodeMaster[]) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCodeMaster>control.get('Expense').value;
            // if(item!=undefined)
            // {                 
            //     data = data.filter(i=>i.AccountCodeId!=item.AccountCodeId);
            // }
        });
        return data;
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
    /**
     * this method will be called on "item master" autocomplete value selection.
     */
    itemMasterSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            ExpensesDescription: eventData.item.Description,
            MeasurementUnitID: 0, //eventData.item.MeasurementUnitID,
            ExpensesQty: 1,
            Unitprice: 0,
            Totalprice: 0,
            Discount: 0,
            TotalbefTax: 0,
            TaxTotal: 0,
            TaxGroupId: this.TaxGroupId,
            TaxID: this.TaxID
        });
    }

    initGridRows() {
        return this.formBuilderObj.group({
            'ExpensesPOItemId': 0,
            'ExpensesDescription': [""],
            'AccountCodeCategoryId': [0, [Validators.required, Validators.min(1)]],
            'MeasurementUnitID': [0, [Validators.required]],
            'MeasurementUnitCode': [""],
            'Expense': ["", Validators.required],
            "ExpensesQty": [0, [Validators.required, Validators.min(1)]],
            "Unitprice": [0, [Validators.required, Validators.min(0.00000001)]],
            "Totalprice": [0],
            "TotalbefTax": [0],
            "IsModified": false,
            "TaxID": [0, [Validators.required, Validators.min(1)]],
            "TaxGroupId": [0, [Validators.required, Validators.min(1)]],
            "TaxName": [""],
            "TaxAmount": [0],
            "Discount": [0, [Validators.required]],
            "TaxTotal": [0],
            'Taxes': [],
        });
    }

    initGridRows1() {
        return this.formBuilderObj.group({
            'Sno': 0,
            'QuotationId': 0,
            'QuotationAmount': [0],
            'QuotationRemarks': [null],
            'SupplierName': '',
            'Supplier': [null, [Validators.required]],
            "IsModified": false,
            "RowIndex": 0
        });
    }

    onCategoryChange(categoryId: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        this.accountCategoryId = itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').value;

        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('ExpensesPOItemId').value;
        if (purchaseOrderItemId > 0) {
            this.deletedPurchaseOrderItems.push(purchaseOrderItemId);
        }

        if (itemGroupControl.controls[rowIndex] != undefined) {
            itemGroupControl.controls[rowIndex].reset();
        }
        itemGroupControl.controls[rowIndex].get('TaxGroupId').setValue(this.TaxGroupId);
        itemGroupControl.controls[rowIndex].get('TaxID').setValue(this.TaxID);
        this.getTaxesByTaxGroupSupplierChange(this.TaxGroupId, rowIndex);
        itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').setValue(Number(this.accountCategoryId));
    }
    //adding row to the grid..
    addGridItem(noOfLines: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGridRows());
            let lastIndex = itemGroupControl.length - 1;
            if (this.supplierid > 0) {
                itemGroupControl.controls[lastIndex].get('TaxGroupId').setValue(this.TaxGroupId);
                itemGroupControl.controls[lastIndex].get('TaxID').setValue(this.TaxID);
                this.getTaxesByTaxGroupSupplierChange(this.TaxGroupId, lastIndex);
            }
        }
    }

    addGridItem1(noOfLines: number) {
        let itemGroupControl1 = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl1.push(this.initGridRows1());
        }
    }

    /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('ExpensesPOItemId').value;
        if (purchaseOrderItemId > 0) {
            this.deletedPurchaseOrderItems.push(purchaseOrderItemId);
        }
        itemGroupControl.removeAt(rowIndex);
        if (itemGroupControl.controls.length == 0)
            this.addGridItem(1);
        this.calculateTotalPrice();
    }

    /**
     * to hide the category details and show in add mode..
     */
    addRecord() {
        //setting this variable to false so as to show the purchase order details in edit mode
        debugger;
        this.hideText = false;
        this.hideInput = true;
        this.isAddMode = true;
        this.isEditMode = false;
        this.selectedPODetails = new ExpensePurchaseOrder();
        this.clearForm();
        this.getCompanyDetails(this.companyId);
        this.addGridItem(this.linesToAdd);
        //this.showFullScreen();
        this.isSupplierSelected = false;
    }
    showFullScreen() {
        this.innerWidth = window.innerWidth;
        if (this.innerWidth > 1000) {
            FullScreen(this.rightPanelRef.nativeElement);
        }
    }
    hideFullScreen() {
    }

    validateAttachments() {
        if (this.uploadedFiles.length == 0 && (this.selectedPODetails.Attachments == undefined || this.selectedPODetails.Attachments.filter(i => i.IsDelete != true).length == 0)) {
            this.confirmationServiceObj.confirm({
                message: "Please Attach Documents",
                header: "Attachments Validation",
                accept: () => {
                },
                rejectVisible: false,
                acceptLabel: "Ok"
            });
            return false;
        }
        return true;
    }
    /**
     * to save the given purchase order details
     */
    saveRecord(action: string) {
        let count = 0;
        var uniqueNames = [];
        this.showGridErrorMessage = false;
        this.showGridErrorMessage2 = false;
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        let itemGroupQuotationControl = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];

        if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
            this.showGridErrorMessage = true;
        }
        if (itemGroupControl != undefined) {
            for (let i = 0; i < itemGroupControl.length; i++) {
                let total = (itemGroupControl.controls[i].get('ExpensesQty').value * itemGroupControl.controls[i].get('Unitprice').value) + (itemGroupControl.controls[i].get('TaxTotal').value);
                let discount = itemGroupControl.controls[i].get('Discount').value;
                if (total < discount) {
                    itemGroupControl.controls[i].get('Discount').setValidators([Validators.required]);
                    itemGroupControl.controls[i].get('Discount').updateValueAndValidity();
                    return;
                }
            }
        }
        let purchaseOrderFormStatus = this.purchaseOrderForm.status;
        let RemarksControl = this.purchaseOrderForm.get('RemarksQuotation');
        if (this.selectedPODetails.ExpensesPurchaseOrderId > 0 && this.hideText == true) {
            RemarksControl.setValue(this.selectedPODetails.RemarksQuotation);
        }
        if (action == 'send') {
            if (this.selectedPODetails.EXPOQuotationItem == undefined) {
                this.selectedPODetails.EXPOQuotationItem = [];
                this.selectedPODetails.EXPOQuotationItem.length = 0;
                this.selectedPODetails.EXPOQuotationAttachment = [];
                this.selectedPODetails.EXPOQuotationAttachment.length = 0;
            }
            if (((this.selectedPODetails.EXPOQuotationItem.length < 3 && this.hideText == true) || (itemGroupQuotationControl.length < 3 && this.hideText != true))) {
                if (RemarksControl.value == "" || RemarksControl.value == null) {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.QuotationAttachmentForPO,
                        MessageType: MessageTypes.NoChange
                    });
                    return;
                }
            }
            if (itemGroupQuotationControl.length != 0 || this.selectedPODetails.EXPOQuotationItem.length != 0) {
                if (this.selectedPODetails.EXPOQuotationItem.length > 0 && this.hideText == true) {
                    count = this.selectedPODetails.EXPOQuotationItem.length;
                }
                else {
                    count = itemGroupQuotationControl.length;
                }
                let attCount = 0;
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        if ((this.selectedPODetails.EXPOQuotationAttachment != undefined &&
                            this.selectedPODetails.EXPOQuotationAttachment.findIndex(j => j.RowId == i && j.IsDelete != true) > -1)
                            || (this.quotationUploadedFiles.findIndex(j => j.RowIndex == i) > -1)) {
                            console.log(i);
                            attCount++;
                        }
                    }
                    if (attCount != count) {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.CheckQuotationAttachmentForPO,
                            MessageType: MessageTypes.NoChange
                        });
                        return;
                    }
                }
            }
            if ((this.selectedPODetails.EXPOQuotationItem.length >= 3 || itemGroupQuotationControl.length >= 3) && (RemarksControl.value == "" || RemarksControl.value == null)) {
                if (this.selectedPODetails.EXPOQuotationAttachment.length > 0) {
                    for (let i = 0; i < this.selectedPODetails.EXPOQuotationAttachment.length; i++) {
                        if (uniqueNames.indexOf(this.selectedPODetails.EXPOQuotationAttachment[i].RowId) === -1) {
                            uniqueNames.push(this.selectedPODetails.EXPOQuotationAttachment[i].RowId);
                        }
                    }
                }
                for (let i = 0; i < this.quotationUploadedFiles.length; i++) {
                    if (uniqueNames.indexOf(this.quotationUploadedFiles[i].RowIndex) === -1) {
                        uniqueNames.push(this.quotationUploadedFiles[i].RowIndex);
                    }
                }
                if (uniqueNames.length < 3) {
                    this.showGridErrorMessage2 = true;
                    purchaseOrderFormStatus = 'INVALID';
                    RemarksControl.setErrors({ 'required': true });
                    RemarksControl.markAsTouched();
                    itemGroupQuotationControl.controls = [];
                    itemGroupQuotationControl.controls.length = 0;
                    return;
                }
            }
            else {
                RemarksControl.setErrors(null);
                RemarksControl.markAsUntouched();
            }
        }

        if (action == 'send' && this.hideText == true && this.selectedPODetails.ExpensesPurchaseOrderId > 0) {
            let workFlowDetails: WorkFlowParameter =
            {
                ProcessId: WorkFlowProcess.ExpensePO,
                CompanyId: this.selectedPODetails.CompanyId,
                LocationId: this.selectedPODetails.LocationId,
                FieldName: "",
                Value: this.selectedPODetails.TotalAmount,
                DocumentId: this.selectedPODetails.ExpensesPurchaseOrderId,
                CreatedBy: this.selectedPODetails.CreatedBy,
                WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
                DocumentCode: this.selectedPODetails.ExpensesPurchaseOrderCode,
                PurchaseOrderStatusId: this.selectedPODetails.WorkFlowStatusId,
                RemarksQuotation: this.selectedPODetails.RemarksQuotation
            };
            HideFullScreen(null);
            this.sharedServiceObj.sendForApproval(workFlowDetails)
                .subscribe((data) => {

                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.SentForApproval,
                        MessageType: MessageTypes.Success
                    });
                    this.sharedServiceObj.PoDraftVisible = false;
                    this.readListView.emit({ PoId: workFlowDetails.DocumentId, PotypeId: PurchaseOrderType.ExpensePo });
                });
            return;
        }

        //getting the purchase order form details...
        let purchaseOrderDetails: ExpensePurchaseOrder = this.purchaseOrderForm.value;
        if (purchaseOrderFormStatus != "INVALID" && this.showGridErrorMessage == false) {
            // if(action=='send' && this.validateAttachments()==false)
            // {
            //     return;
            // }
            purchaseOrderDetails["ExpectedDeliveryDate"] = this.reqDateFormatPipe.transform(purchaseOrderDetails.ExpectedDeliveryDate);
            purchaseOrderDetails.IsGstBeforeDiscount = purchaseOrderDetails.IsGstBeforeDiscount == null ? false : purchaseOrderDetails.IsGstBeforeDiscount;
            purchaseOrderDetails.DeliveryTermId = 0;
            if (purchaseOrderDetails.Discount == null) {
                purchaseOrderDetails.Discount = 0;
            }
            if (purchaseOrderDetails.ShippingCharges == null) {
                purchaseOrderDetails.ShippingCharges = 0;
            }
            if (purchaseOrderDetails.OtherCharges == null) {
                purchaseOrderDetails.OtherCharges = 0;
            }
            if (purchaseOrderDetails.TotalAmount == null) {
                purchaseOrderDetails.TotalAmount = 0;
            }
            if (purchaseOrderDetails.TaxRate == null) {
                purchaseOrderDetails.TaxRate = 0;
            }
            // if(purchaseOrderDetails.TotalTax==null)
            // {
            //     purchaseOrderDetails.TotalTax=0;
            // }
            if (purchaseOrderDetails.TaxTotal == null) {
                purchaseOrderDetails.TaxTotal = 0;
            }
            purchaseOrderDetails.PurchaseOrderItems.forEach(i => {
                if (i.ExpensesPOItemId > 0) {
                    let previousRecord = this.selectedPODetails.PurchaseOrderItems.find(j => j.ExpensesPOItemId == i.ExpensesPOItemId);
                    //console.log(i,previousRecord);
                    if (i.Expense.AccountCodeId != previousRecord.Expense.AccountCodeId ||
                        (i.Expense.AccountCodeId == 0 && (i.Expense.AccountCodeName != previousRecord.Expense.AccountCodeName)) ||
                        i.ExpensesDescription != previousRecord.ExpensesDescription ||
                        i.ExpensesQty != previousRecord.ExpensesQty ||
                        i.Unitprice != previousRecord.Unitprice ||
                        i.MeasurementUnitID != previousRecord.MeasurementUnitID ||
                        i.TaxID != previousRecord.TaxID ||
                        i.Discount != previousRecord.Discount) {
                        i.IsModified = true;
                    }

                }
                else {
                    i.ExpensesPOItemId = 0;
                    if (i.MeasurementUnitID === null) {
                        i.MeasurementUnitID = 0;
                    }
                }
            });
            purchaseOrderDetails.EXPOQuotationItem.forEach(i => {
                if (i.QuotationId > 0) {
                    let previousRecord = this.selectedPODetails.EXPOQuotationItem.find(j => j.QuotationId == i.QuotationId);
                    if (i.QuotationRemarks != previousRecord.QuotationRemarks ||
                        i.Supplier != previousRecord.Supplier ||
                        //   i.Supplier.SupplierId != previousRecord.Supplier.SupplierId||
                        i.QuotationAmount != previousRecord.QuotationAmount) {
                        i.IsModified = true;
                    }
                } else {
                    i.QuotationId = 0;
                }
                if (i.QuotationAmount == null) {
                    i.QuotationAmount = 0;
                }
            });

            purchaseOrderDetails.PurchaseOrderItems = purchaseOrderDetails.PurchaseOrderItems.filter(i => i.ExpensesPOItemId == 0 || i.ExpensesPOItemId == null || i.IsModified == true);
            purchaseOrderDetails.EXPOQuotationItem = purchaseOrderDetails.EXPOQuotationItem.filter(i => i.QuotationId == 0 || i.QuotationId == null || i.IsModified == true);


            let userDetails = <UserDetails>this.sessionService.getUser();
            purchaseOrderDetails.RequestedBy = userDetails.UserID;
            purchaseOrderDetails.CreatedBy = userDetails.UserID;
            purchaseOrderDetails.CompanyId = this.sessionService.getCompanyId();
            purchaseOrderDetails.POTypeId = PurchaseOrderType.ExpensePo;
            purchaseOrderDetails.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
            purchaseOrderDetails.ProcessId = WorkFlowProcess.ExpensePO;
            if (purchaseOrderDetails.ExpensesPurchaseOrderId == 0 || purchaseOrderDetails.ExpensesPurchaseOrderId == null) {
                purchaseOrderDetails.ExpensesPurchaseOrderId = 0;
                HideFullScreen(null);
                this.expensePoCreationObj.createPurchaseOrder(purchaseOrderDetails, this.uploadedFiles, this.quotationUploadedFiles)
                    .subscribe((poId: number) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.quotationUploadedFiles.length = 0;
                        this.quotationUploadedFiles = [];
                        this.recordInEditMode = -1;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.sharedServiceObj.PoDraftVisible = true;
                        this.readListView.emit({ PoId: poId, PotypeId: PurchaseOrderType.ExpensePo });
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage2 = false;
                    });
                if (this.sharedServiceObj.PORecordslength == 0) {
                    this.hideFullScreen();
                }
            }
            else {
                purchaseOrderDetails.ExpensesPurchaseOrderId = this.selectedPODetails.ExpensesPurchaseOrderId;
                purchaseOrderDetails.PurchaseOrderItemsToDelete = this.deletedPurchaseOrderItems;
                purchaseOrderDetails.Attachments = this.selectedPODetails.Attachments.filter(i => i.IsDelete == true);
                purchaseOrderDetails.EXPOQuotationItemToDelete = this.deletedEXPOQuotationItems;
                purchaseOrderDetails.EXPOQuotationAttachmentDelete = this.selectedPODetails.EXPOQuotationAttachmentDelete;
                purchaseOrderDetails.EXPOQuotationAttachmentUpdateRowId = this.selectedPODetails.EXPOQuotationAttachmentUpdateRowId;
                HideFullScreen(null);
                this.expensePoCreationObj.updatePurchaseOrder(purchaseOrderDetails, this.uploadedFiles, this.quotationUploadedFiles)
                    .subscribe((response) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.deletedPurchaseOrderItems = [];
                        this.deletedPurchaseOrderItems.length = 0;
                        this.quotationUploadedFiles.length = 0;
                        this.quotationUploadedFiles = [];
                        this.deletedEXPOQuotationItems.length = 0;
                        this.deletedEXPOQuotationItems = [];
                        this.selectedPODetails.EXPOQuotationAttachmentDelete = [];
                        this.selectedPODetails.EXPOQuotationAttachmentDelete.length = 0;
                        this.recordInEditMode = -1;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.sharedServiceObj.PoDraftVisible = true;
                        this.readListView.emit({ PoId: purchaseOrderDetails.ExpensesPurchaseOrderId, PotypeId: PurchaseOrderType.ExpensePo });
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage2 = false;
                        this.hideFullScreen();
                    });
            }
        }
        else {
            Object.keys(this.purchaseOrderForm.controls).forEach((key: string) => {
                if (this.purchaseOrderForm.controls[key].status == "INVALID" && this.purchaseOrderForm.controls[key].touched == false) {
                    this.purchaseOrderForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
            itemGroupControl.controls.forEach(controlObj => {
                Object.keys(controlObj["controls"]).forEach((key: string) => {
                    let itemGroupControl = controlObj.get(key);
                    if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
                        itemGroupControl.markAsTouched();
                    }
                });
            });
            let itemGroupControl1 = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];
            itemGroupControl1.controls.forEach(controlObj => {
                Object.keys(controlObj["controls"]).forEach((key: string) => {
                    let itemGroupControl1 = controlObj.get(key);
                    if (itemGroupControl1.status == "INVALID" && itemGroupControl1.touched == false) {
                        itemGroupControl1.markAsTouched();
                    }
                });
            });
        }
    }
    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the purchase order details on cancel button click event..
     */
    cancelRecord() {

        //setting this variable to true so as to show the purchase details
        // this.hasWorkFlow = true;
        // this.purchaseOrderForm.reset();
        // this.purchaseOrderForm.setErrors(null);
        // this.cancelChanges.emit(true);
        // this.showGridErrorMessage2 = false;
        // this.hideInput = false;
        // this.hideText = true;
        // this.uploadedFiles.length = 0;
        // this.uploadedFiles = [];
        // this.quotationUploadedFiles.length = 0;
        // this.quotationUploadedFiles = [];
        // this.supplierid = 0;
        // this.TaxGroupId = 0;
        // this.TaxID = 0;
        // this.isSupplierSelected = false;
        // this.isAddMode = true;
        // this.isEditMode = false;
        this.router.navigate([`/po/poapproval`]);
    }

    onDepChage(event: any, department: any) {
        this.deptId = event.target.value;
        this.getWorkFlowConfiguration(department.selectedOptions[0].label);
    }

    getWorkFlowConfiguration(deptName: String) {
        this.processId = 15;
        let workFlowResult = <Observable<any>>this.workFlowService.getWorkFlowConfiguationId(this.processId, this.companyId, this.deptId);
        workFlowResult.subscribe((data) => {
            if (data != null) {
                if (data.WorkFlowProcess.length == 0) {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.PoWorkflowValidationMessage + deptName,
                        MessageType: MessageTypes.Error

                    });
                    this.hasWorkFlow = false;
                }
                else {
                    this.hasWorkFlow = true;
                }
            }
            else if (data == null) {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.PoWorkflowValidationMessage + deptName,
                    MessageType: MessageTypes.Error

                });
                this.hasWorkFlow = false;
            }
            else {
                this.hasWorkFlow = true;
            }
        });
    }

    /**
     * to delete the selected record...
     */
    deleteRecord() {
        let recordId = this.selectedPODetails.ExpensesPurchaseOrderId;

        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                this.expensePoCreationObj.deletePurchaseOrder(recordId, userDetails.UserID).subscribe((data) => {
                    this.readListView.emit({ PoId: 0, PotypeId: PurchaseOrderType.ExpensePo });
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });
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
        //setting this variable to false so as to show the category details in edit mod
        this.hideText = false;
        this.hideInput = true;
        this.isAddMode = false;
        this.isEditMode = true;
        //resetting the item category form.
        this.clearForm();
        this.addGridItem(this.selectedPODetails.PurchaseOrderItems.length);
        this.addGridItem1(this.selectedPODetails.EXPOQuotationItem.length);
        this.purchaseOrderForm.patchValue(this.selectedPODetails);
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        for (let i = 0; i < itemGroupControl.length; i++) {
            this.getTaxesByTaxGroup(itemGroupControl.controls[i].get('TaxGroupId').value, i);
        }
        this.TaxGroupId = this.selectedPODetails.Supplier.TaxGroupId;
        this.TaxID = this.selectedPODetails.Supplier.TaxID;

        this.purchaseOrderForm.get('ExpectedDeliveryDate').setValue(new Date(this.selectedPODetails.ExpectedDeliveryDate));
        this.purchaseOrderForm.get('SupplierTypeID').setValue(this.selectedPODetails.Supplier.SupplierTypeID == 1 ? "1" : "2");
        this.onSupplierChange();
        this.calculateTotalPrice();
        //this.showFullScreen();
        if (this.selectedPODetails.SupplierSubCodeId === null) {
            this.isSupplierSelected = true;
            this.purchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
            this.purchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
        }

        this.supplierid = this.selectedPODetails.Supplier.SupplierId;
        this.purchaseOrderForm.get('SupplierAddress').setValue(this.selectedPODetails.SupplierAddress);
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
    /**
     * this method will be called on currency change event...
     */
    onCurrencyChange() {
        let currencyId = this.purchaseOrderForm.get('CurrencyId').value;
        this.selectedPODetails.CurrencySymbol = this.currencies.find(i => i.Id == currencyId).Symbol;
    }
    //to get the sub totalprice..
    getSubTotal() {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];

        if (itemGroupControl != undefined) {
            let subTotal = 0;
            itemGroupControl.controls.forEach(data => {
                subTotal = subTotal + ((data.get('ExpensesQty').value * data.get('Unitprice').value) + data.get('TaxTotal').value - data.get('Discount').value);
            });
            return subTotal;
        }
    }
    getTotalPrice() {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let totalnewprice = 0;
            itemGroupControl.controls.forEach(data => {
                totalnewprice = (data.get('ExpensesQty').value * data.get('Unitprice').value);
                data.get('Totalprice').setValue(totalnewprice);
            });

        }
    }
    setTaxAmount(taxType: number, rowIndex: number) {
        this.checktax = true;
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        let taxAmount = 0;
        if (itemGroupControl.controls[rowIndex].get('Taxes').value.find(i => i.TaxId == taxType) != undefined) {
            taxAmount = itemGroupControl.controls[rowIndex].get('Taxes').value.find(i => i.TaxId == taxType).TaxAmount;
        }
        itemGroupControl.controls[rowIndex].get('TaxAmount').setValue(taxAmount);
        this.calculateTotalPrice();
        this.checktax = false;
    }
    getTaxTypesByTaxGroup(taxGroupId: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (this.checktax == false) {
            itemGroupControl.controls[rowIndex].get('TaxTotal').setValue(0);
            itemGroupControl.controls[rowIndex].get('TaxID').setValue(0);
        }
        this.getTaxesByTaxGroup(taxGroupId, rowIndex);
    }

    calculateTotalTax() {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            if (this.purchaseOrderForm.get('IsGstBeforeDiscount').value == true) {
                itemGroupControl.controls.forEach(data => {
                    let itemTotal = (data.get('ExpensesQty').value * data.get('Unitprice').value) * (data.get('TaxAmount').value) / 100;
                    data.get('TaxTotal').setValue(itemTotal);
                });
            }
            else {
                itemGroupControl.controls.forEach(data => {
                    let itemTotal = ((data.get('ExpensesQty').value * data.get('Unitprice').value) - data.get('Discount').value) * (data.get('TaxAmount').value) / 100;
                    data.get('TaxTotal').setValue(itemTotal);
                });
            }
        }
    }
    //to get total price..
    calculateTotalPrice() {
        this.calculateTotalTax();
        let subTotal = this.getSubTotal();
        this.purchaseOrderForm.get('SubTotal').setValue(subTotal);
        let discount = this.purchaseOrderForm.get('Discount').value;
        let shippingCharges = this.purchaseOrderForm.get('ShippingCharges').value;
        let OtherCharges = this.purchaseOrderForm.get('OtherCharges').value;
        let totalTax = 0;
        let totalPrice = (subTotal - discount) + totalTax + shippingCharges + OtherCharges;
        this.purchaseOrderForm.get('TotalAmount').setValue(totalPrice);
        totalTax = this.getTaxTotal();
        this.purchaseOrderForm.get('TotalTax').setValue(totalTax);
        this.getTotalPrice();
        let priceSubTotal = 0;
        priceSubTotal = this.getPriceSubTotal();
        this.purchaseOrderForm.get('PriceSubTotal').setValue(priceSubTotal);
        let discountSubTotal = 0;
        discountSubTotal = this.getDiscountSubTotal();
        this.purchaseOrderForm.get('DiscountSubTotal').setValue(discountSubTotal);
        let totalbefTaxSubTotal = 0;
        totalbefTaxSubTotal = this.getTotalbefTaxSubTotal();
        this.purchaseOrderForm.get('TotalbefTaxSubTotal').setValue(totalbefTaxSubTotal);
    }

    //Get Total before tax sub total
    getTotalbefTaxSubTotal() {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let totalbefTaxSubTotal = 0;
            itemGroupControl.controls.forEach(data => {
                totalbefTaxSubTotal = totalbefTaxSubTotal + (data.get('Totalprice').value - data.get('Discount').value);
            });
            return totalbefTaxSubTotal;
        }
    }

    //Get discount total
    getDiscountSubTotal() {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let discountSubTotal = 0;
            itemGroupControl.controls.forEach(data => {
                discountSubTotal = discountSubTotal + (data.get('Discount').value);
            });
            return discountSubTotal;
        }
    }
    //get sub Total Price
    getPriceSubTotal() {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let priceSubTotal = 0;
            itemGroupControl.controls.forEach(data => {
                priceSubTotal = priceSubTotal + (data.get('ExpensesQty').value * data.get('Unitprice').value);
            });
            return priceSubTotal;
        }
    }

    getTaxTotal() {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let taxTotal = 0;
            itemGroupControl.controls.forEach(data => {
                taxTotal = taxTotal + (data.get('TaxTotal').value);
            });
            return taxTotal;
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
                value1 = data1["Expense"]["ItemName"];
                value2 = data2["Expense"]["ItemName"];
            }
            else if (event.field == "MeasurementUnitID") {
                value1 = data1["Expense"]["MeasurementUnitCode"];
                value2 = data2["Expense"]["MeasurementUnitCode"];
            }
            else if (event.field == "ItemTotal") {
                value1 = data1["ExpensesQty"] * data1["Unitprice"];
                value2 = data2["ExpensesQty"] * data2["Unitprice"];
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
                let attachmentRecord = this.selectedPODetails.Attachments[attachmentIndex];
                attachmentRecord.IsDelete = true;
                this.selectedPODetails.Attachments = this.selectedPODetails.Attachments.filter((obj, index) => index > -1);
            },
            reject: () => {
            }
        });

    }
    //this method will be called on date picker focus event..
    onDatePickerFocus(element: NgbInputDatepicker, event: any) {
        if (!element.isOpen()) {
            element.open();
        }
    }
    //
    onSearchInputChange(event: any) {
        if (this.purchaseOrderSearchKey != "") {
            {
                this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0);
            }
        }
        else {
            this.readListView.emit({ PoId: 0, PotypeId: PurchaseOrderType.ExpensePo });
        }
    }
    onPaymentTermChange(event: any) {
        let paymentTermId = this.purchaseOrderForm.get('PaymentTermId').value;
        let description = "";
        if (this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId) != undefined) {
            description = this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).Description

            this.updateExpectedDeliveryDate();

        }
        this.purchaseOrderForm.get('PaymentTerms').setValue(description);
    }
    updateExpectedDeliveryDate() {
        let paymentTermId = this.purchaseOrderForm.get('PaymentTermId').value;
        let noOfDays = 0;
        if (this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId) != undefined) {
            noOfDays = this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).NoOfDays;
        }
        if (noOfDays >= 0) {
            this.purchaseOrderForm.get('ExpectedDeliveryDate').setValue(new Date(new Date().getTime() + (noOfDays * 24 * 60 * 60 * 1000)));
        }
        else {
            this.purchaseOrderForm.get('ExpectedDeliveryDate').setValue(null);
        }
    }
    onDeliveryTermChange() {
        let deliveryTermId = this.purchaseOrderForm.get('DeliveryTermId').value;
        let description = "";
        if (this.paymentTerms.find(i => i.PaymentTermsId == deliveryTermId) != undefined) {
            description = this.deliveryTerms.find(i => i.DeliveryTermsId == deliveryTermId).Description;
        }
        this.purchaseOrderForm.get('DeliveryTerm').setValue(description);
    }
    onSearchClick() {
        if (this.purchaseOrderSearchKey != "") {

            this.getAllSearchPurchaseOrder(this.purchaseOrderSearchKey, 0);

        }
        else {
            this.readListView.emit({ PoId: 0, PotypeId: PurchaseOrderType.ExpensePo });
        }
    }
    // onPrintScreen(event:any)
    // {
    //     let windowObj = event.view;
    //     this.expensePoCreationObj.printDetails(this.selectedPODetails.ExpensesPurchaseOrderId).subscribe((data:string)=>{

    //         PrintScreen(data,windowObj,"Purchase Order Details");
    //     });
    //     //  PrintScreen("",windowObj,`http://localhost:49266/api/purchaseOrderPrint/${this.selectedPODetails.ExpensesPurchaseOrderId}`);
    // }
    update(status: number, rejectRemarks: string = "") {
        let remarks = "";
        let userDetails = <UserDetails>this.sessionService.getUser();
        if (status == WorkFlowStatus.Approved) {
            if (this.selectedPODetails.CreatedBy == this.selectedPODetails.CurrentApproverUserId &&
                this.selectedPODetails.CreatedBy == userDetails.UserID) {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.PoApprovesameValidationMessage,
                    MessageType: MessageTypes.Error
                });
                return;
            }
        }
        if (status != WorkFlowStatus.Rejected) {
            remarks = this.purchaseOrderForm.get('Remarks').value;
            remarks = (this.IsVerifier && status == WorkFlowStatus.Approved) ? "Verified" : remarks;
            if (status == WorkFlowStatus.AskedForClarification || status == WorkFlowStatus.WaitingForApproval) {
                if (remarks.trim() == "" || remarks.trim() == null) {
                    this.purchaseOrderForm.get('Remarks').setErrors({ "required": true });
                    return;
                }
            }
        }
        else {
            remarks = rejectRemarks;
        }
        let statusObj: PoApprovalUpdateStatus = {
            StatusId: status,
            Remarks: remarks,
            ProcessId: WorkFlowProcess.ExpensePO,
            PoCode: this.selectedPODetails.ExpensesPurchaseOrderCode,
            ApproverUserId: this.selectedPODetails.CurrentApproverUserId,
            CompanyId: this.selectedPODetails.CompanyId
        };
        this.updateStatus.emit(statusObj);
    }
    restrictMinus(e: any) {
        restrictMinus(e);
    }
    avoidNegativeValues(event) {
        if (event.target.value < 0) {
            return;
        }
    }
    displayVoidPopUp(isVoid: boolean) {
        this.isVoid = isVoid;
        this.purchaseOrderCode = this.selectedPODetails.ExpensesPurchaseOrderCode;
        let userDetails = <UserDetails>this.sessionService.getUser();
        let statusid = this.workFlowStatus.Rejected;
        if (statusid == WorkFlowStatus.Rejected && !isVoid) {
            if (this.selectedPODetails.CreatedBy == this.selectedPODetails.CurrentApproverUserId &&
                this.selectedPODetails.CreatedBy == userDetails.UserID) {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.PoApprovesameValidationMessage,
                    MessageType: MessageTypes.Error
                });
                return;
            }
            this.showVoidPopUp = false;
        }
        this.showVoidPopUp = true;
    }
    subCodeChange(value: number) {
        let supplierCode = this.utilService.getSupplierCode(this.purchaseOrderForm.get('Supplier').value.SupplierCode, '00');
        if (this.supplierSubCodes.length > 0 && value > 0) {
            let supplier = this.supplierSubCodes.find(s => s.SubCodeId == value);
            if (supplier) {
                let supplierCode = this.purchaseOrderForm.get('Supplier').value.SupplierCode;
                this.purchaseOrderForm.get('SupplierCode').setValue(this.utilService.getSupplierCode(supplierCode, supplier.SubCode));
            }
            else {
                this.purchaseOrderForm.get('SupplierCode').setValue(supplierCode);
            }
        }
        else {
            this.purchaseOrderForm.get('SupplierCode').setValue(supplierCode);
        }
    }
    onStatusUpdate(purchaseOrderId: number) {
        this.showVoidPopUp = false;
        this.readListView.emit({ PoId: purchaseOrderId, PotypeId: PurchaseOrderType.ExpensePo });
        //this.onRecordSelection(purchaseOrderId);
    }
    hideVoidPopUp(hidePopUp: boolean) {
        this.showVoidPopUp = false;
    }
    recallPoApproval() {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let poId = this.selectedPODetails.ExpensesPurchaseOrderId;
        let approvalObj = {
            PurchaseOrderId: poId,
            POTypeId: this.selectedPODetails.POTypeId,
            CreatedBy: userDetails.UserID,
            PurchaseOrderCode: this.selectedPODetails.ExpensesPurchaseOrderCode,
            PurchaseOrderType: this.selectedPODetails.PurchaseOrderType,
            Supplier: this.selectedPODetails.Supplier,
            TotalAmount: this.selectedPODetails.TotalAmount,
            ExpectedDeliveryDate: this.selectedPODetails.ExpectedDeliveryDate,
            CurrentApproverUserName: this.selectedPODetails.CurrentApproverUserName,
            CreatedByUserName: userDetails.UserName,
            CurrentApproverUserId: this.selectedPODetails.CurrentApproverUserId,
            PurchaseOrderStatusText: this.selectedPODetails.PurchaseOrderStatusText,
            CurrencySymbol: this.selectedPODetails.CurrencySymbol,
            CompanyId: this.companyId
        };
        HideFullScreen(null);
        this.poCreationObj.recallPoApproval(approvalObj)
            .subscribe(() => {
                this.readListView.emit({ PoId: poId, PotypeId: PurchaseOrderType.ExpensePo });
            });
    }
    reject(remarks: string) {
        this.update(WorkFlowStatus.Rejected, remarks);
    }

    // Quotation File Attachment

    onVendorFileClose(fileIndex: number) {
        this.quotationUploadedFiles = this.quotationUploadedFiles.filter((file, index) => index != fileIndex);
    }

    checkDuplicateFile(fileName: string, rowIndex: number): boolean {
        //let file = this.uploadedFiles.filter(i => i.name.toLowerCase() === fileName.toLowerCase())[0];
        if (this.isEditMode) {
            if (this.selectedPODetails.EXPOQuotationAttachment != null) {
                let uploadFile;
                let attchmentile = this.selectedPODetails.EXPOQuotationAttachment.filter(i => i.FileName.toLowerCase() === fileName.toLowerCase() && i.RowId === rowIndex)[0];
                if (attchmentile != null && attchmentile != undefined) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            if (this.quotationUploadedFiles.length > 0) {
                let uploadFile = this.quotationUploadedFiles.filter(i => i.File.name.toLowerCase() == fileName.toLowerCase() && i.RowIndex === rowIndex)[0];
                if (uploadFile != null && uploadFile != undefined) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
    }

    onSupplierChanged(rowIndex: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];
        itemGroupControl.controls[rowIndex].get('RowIndex').setValue(rowIndex);
    }

    onFileQuotationUploadChange(event: any) {
        let files: FileList = event.target.files;
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];
        for (let i = 0; i < files.length; i++) {
            let fileItem = files.item(i);
            if (ValidateFileType(fileItem.name)) {
                if (!this.checkDuplicateFile(fileItem.name, this.selectedFileRowIndex)) {
                    this.quotationUploadedFiles.push({ File: fileItem, RowIndex: this.selectedFileRowIndex });
                    itemGroupControl.controls[this.selectedFileRowIndex].get('RowIndex').setValue(this.selectedFileRowIndex);
                    try {
                        let selectedRow = this.selectedPODetails.EXPOQuotationItem[this.selectedFileRowIndex];
                        if (selectedRow != undefined) {
                            if (selectedRow.QuotationId > 0) {
                                selectedRow.IsModified = true;
                                let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];
                                itemGroupControl.controls[this.selectedFileRowIndex].get('IsModified').setValue(true);
                                this.selectedPODetails.EXPOQuotationItem = this.selectedPODetails.EXPOQuotationItem.filter((i, index) => index > -1);
                            }
                        }
                    }
                    catch (error) {
                    }
                }
            }
            else {
                //event.preventDefault();
                return false;
                break;
            }
        }
    }


    EXPOQuotationAttachmentDelete(SelectedIndex: number) {
        let attachmentRecord = this.selectedPODetails.EXPOQuotationAttachment[SelectedIndex];
        // if (this.selectedPODetails.EXPOQuotationAttachmentDelete == null) {
        //     this.selectedPODetails.EXPOQuotationAttachmentDelete = [];
        // }
        // this.selectedPODetails.EXPOQuotationAttachmentDelete.push(this.selectedPODetails.EXPOQuotationAttachment[SelectedIndex]);
        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header: Messages.DeletePopupHeader,
            accept: () => {
                if (this.selectedPODetails.EXPOQuotationAttachmentDelete == null) {
                    this.selectedPODetails.EXPOQuotationAttachmentDelete = [];
                }
                this.selectedPODetails.EXPOQuotationAttachmentDelete.push(attachmentRecord);
                attachmentRecord.IsDelete = true;
                this.selectedPODetails.EXPOQuotationAttachment = this.selectedPODetails.EXPOQuotationAttachment.filter(i => i.IsDelete != true);
            },
            reject: () => {
            }
        });
    }



    removeSupplierGridItem(rowIndex: number) {

        //console.log("Delete is working",rowIndex);
        let attachmentRecord = null;
        let itemGroupVendorControl = <FormArray>this.purchaseOrderForm.controls['EXPOQuotationItem'];
        let QuotationId = itemGroupVendorControl.controls[rowIndex].get('QuotationId').value;
        if (QuotationId > 0) {
            this.deletedEXPOQuotationItems.push(QuotationId);

            this.selectedPODetails.EXPOQuotationAttachment.forEach(data => {

                if (data.RowId == rowIndex) {
                    data.IsDelete = true;
                    attachmentRecord = data;
                } else {
                    data.IsDelete = false;
                }

            });
            //console.log( this.quotationUploadedFiles);
            if (this.selectedPODetails.EXPOQuotationAttachmentDelete == null) {
                this.selectedPODetails.EXPOQuotationAttachmentDelete = [];
            }
            // this.selectedPODetails.QuotationAttachmentDelete.push(this.selectedPODetails.QuotationAttachment[rowIndex]);
            this.selectedPODetails.EXPOQuotationAttachmentDelete.push(attachmentRecord);
            //this.selectedPODetails.EXPOQuotationAttachmentDelete=this.selectedPODetails.EXPOQuotationAttachment.filter(i => i.IsDelete == true);
            this.selectedPODetails.EXPOQuotationAttachment = this.selectedPODetails.EXPOQuotationAttachment.filter(i => i.IsDelete != true).map((data, index) => {

                if (data.RowId > rowIndex) {
                    data.RowId = data.RowId - 1;
                }
                return data;
            });
            this.selectedPODetails.EXPOQuotationAttachmentUpdateRowId = this.selectedPODetails.EXPOQuotationAttachment;
        }
        else {
            this.quotationUploadedFiles = this.quotationUploadedFiles.filter(data => data.RowIndex != rowIndex);

            this.quotationUploadedFiles.forEach((element, index) => {
                if (element.RowIndex > rowIndex) {
                    element.RowIndex = (element.RowIndex - 1);
                }
            });
        }
        itemGroupVendorControl.removeAt(rowIndex);
        // console.log(this.selectedPODetails.EXPOQuotationAttachment);
        // console.log(this.selectedPODetails.EXPOQuotationAttachmentDelete);
    }




}
