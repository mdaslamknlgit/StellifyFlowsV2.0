import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap, catchError, distinct } from 'rxjs/operators';
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { Observable, of } from 'rxjs';
import { CostOfService, PurchaseOrderList, PurchaseOrderDisplayResult, PurchaseOrderDetails, PurchaseOrderTypes, PurchaseOrderStatus } from "../../models/po-creation.model";
import { POCreationService } from "../../services/po-creation.service";
import { SharedService } from "../../../shared/services/shared.service";
import {
    PagerConfig, Suppliers, ItemMaster, MessageTypes, Taxes,
    GridOperations, Messages, Currency, PaymentTerms, UserDetails, WorkFlowStatus, WorkFlowProcess, PurchaseOrderType, ResponseStatusTypes, ITEM_TYPE, ItemType
} from "../../../shared/models/shared.model";
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { ValidateFileType, FullScreen, HideFullScreen, restrictMinus, getProcessId } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { Supplier, SupplierSubCode } from '../../models/supplier';
import { DeliveryTerms } from '../../models/delivery-terms.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { DEFAULT_CURRENCY_ID, NUMBER_PATERN, EMAIL_PATTERN } from '../../../shared/constants/generic';
import { PurchaseOrderRequestService } from '../../services/purchase-order-request.service';
import { PurchaseOrderRequestList, PurchaseOrderRequestDetails } from '../../models/purchase-order-request.model';
import { PoApprovalUpdateStatus } from '../../models/po-approval.model';
import { WorkFlowApiService } from '../../../administration/services/workflow-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AccountCodeMaster } from '../../models/account-code.model';
import { TaxService } from '../../services/tax.service';
import { Company } from '../../../administration/models/company';
import { Locations } from '../../../inventory/models/item-master.model';
import { ActivatedRoute, Router } from '../../../../../node_modules/@angular/router';
import { UtilService } from '../../../shared/services/util.service';
@Component({
    selector: 'app-standard-purchase-order',
    templateUrl: './standard-purchase-order.component.html',
    styleUrls: ['./standard-purchase-order.component.css'],
    providers: [POCreationService, PurchaseOrderRequestService, TaxService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class StandardPurchaseOrderComponent implements OnInit, OnChanges {
    userDetails: UserDetails = null;
    @Input('selectedPoId') selectedPoId: number;
    @Input('isApprovalPage') isApprovalPage: boolean;
    @Input('remarks') remarks: string;
    @Output()
    readListView: EventEmitter<{ PoId: number, PotypeId: number }> = new EventEmitter<{ PoId: number, PotypeId: number }>(); //creating an output event
    @Output()
    cancelChanges: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output()
    updateStatus: EventEmitter<PoApprovalUpdateStatus> = new EventEmitter<PoApprovalUpdateStatus>();
    purchaseOrdersList: Array<PurchaseOrderList> = [];
    purchaseOrderPagerConfig: PagerConfig;
    purchaseOrderItemsGridConfig: PagerConfig;
    purchaseOrderForm: FormGroup;
    selectedPODetails: PurchaseOrderDetails;
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
    showGridErrorMessage1: boolean = false;
    showGridErrorMessage2: boolean = false;
    scrollbarOptions: any;
    purchaseOrderSearchKey: string;
    apiEndPoint: string;
    hideLeftPanel: boolean = false;
    linesToAdd: number = 2;
    paymentTerms: PaymentTerms[] = [];
    deliveryTerms: DeliveryTerms[] = [];
    measurementUnits: MeasurementUnit[] = [];
    deletedPurchaseOrderItems: Array<number> = [];
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    selectedRowId: number = -1;
    @ViewChild('instructions') instructionsRef: ElementRef;
    @ViewChild('justifications') justificationsRef: ElementRef;
    workFlowStatus: any;
    purchaseOrderStatus: any;
    showLoadingIcon: boolean = false;
    showVoidPopUp: boolean = false;
    itemTYpes = ITEM_TYPE;
    isVoid: boolean = false;
    taxGroups = [];
    quotationUploadedFiles: Array<{ File: File, RowIndex: number }> = [];
    gridQuotationColumns: Array<{ field: string, header: string }> = [];
    deletedSPOQuotationItems: Array<number> = [];
    selectedFileRowIndex: number = 1;
    selectedSupplierRowId: number = -1;
    purchaseOrderCode: string = "";
    supplierid: number;
    TaxGroupId: number;
    TaxID: number;
    GSTType: number;
    isSupplierSelected: boolean = false;
    supplierSubCodes = [];
    company: Company;
    rows: number = 2;
    showdropdown: boolean = false;
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
    isSameUSer: boolean = false;
    hasWorkFlow: boolean = true;
    public innerWidth: any;
    IsVerifier: boolean = false;
    isApproverUser: boolean = false;
    onFileChoose(index: number, fileInput: any) {
        this.selectedFileRowIndex = index;
        fileInput.click();
    }

    constructor(private pocreationObj: POCreationService,
        private router: Router,
        private formBuilderObj: FormBuilder,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        private reqDateFormatPipe: RequestDateFormatPipe,
        public sessionService: SessionStorageService,
        private poReqServiceObj: PurchaseOrderRequestService,
        private workFlowService: WorkFlowApiService,
        private taxService: TaxService,
        private utilService: UtilService,
        public activatedRoute: ActivatedRoute) {
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.companyId = this.sessionService.getCompanyId();
        this.gridColumns = [
            { field: 'Sno', header: '#' },
            //   { field: 'ItemCode' ,header:'Item Code' },
            { field: 'TypeId', header: 'Type' },
            { field: 'Name', header: 'Item/Service' },
            { field: 'ItemDescription', header: 'Description' },
            { field: 'MeasurementUnitID', header: 'UOM' },
            { field: 'ItemQty', header: 'Qty' },
            { field: 'Unitprice', header: 'Price' },
            { field: 'Totalprice', header: 'Total Price' },
            { field: 'Discount', header: 'Discount' },
            { field: 'TotalbefTax', header: 'Total bef Tax' },
            { field: 'TaxGroup', header: 'Tax Group' },
            { field: 'GstType', header: 'GST Type' },
            { field: 'GstAmount', header: 'GST Amount' },
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
        this.selectedPODetails = new PurchaseOrderDetails();
        this.company = new Company();
        //getting the purchase order types.
        this.pocreationObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                this.purchaseOrderTypes = data;
            });
        //getting the list of cost of service types.
        this.pocreationObj.getCostOfServiceTypes()
            .subscribe((data: CostOfService[]) => {
                this.costOfServiceType = data;
            });
        //    this.pocreationObj.getDepartments()
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

                    this.sharedServiceObj.updateCompany(false);
                }
            });


        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                //   this.getDepartments(this.companyId);
                //   this.getCompanyDetails(this.companyId);
            });

        this.operation = GridOperations.Display;
        this.getPaymentTerms();
        this.getMeasurementUnits();
        this.getTaxTypes();
        this.getDeliveryTerms();
        this.getTaxGroups();

        var windowwidth =  window.innerWidth - 170;
        debugger;
        $(".tablescroll").css("width",windowwidth);
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
        this.sharedServiceObj.getUserDepartments(companyId, WorkFlowProcess.InventoryPO, this.userDetails.UserID).subscribe((data: Array<Locations>) => {
            this.departments = data.filter(item => item.Name != 'Inventory');
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
                    "DeliveryAddress": deliveryAddress,
                });
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
    getTaxesByTaxGroupsupplierChange(taxGroupId: number, rowIndex: number): void {
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

    getformgroup() {
        this.purchaseOrderForm = this.formBuilderObj.group({
            'PurchaseOrderId': [0],
            'PurchaseOrderCode': [""],
            'DraftCode': [""],
            'SupplierTypeID': [1, { validators: [Validators.required] }],
            'POTypeId': [0],
            'LocationId': [null, [Validators.required]],
            'Supplier': [null, [Validators.required]],
            'ExpectedDeliveryDate': [new Date()],
            'VendorReferences': ["", { validators: [Validators.required, this.noWhitespaceValidator] }],
            'CurrencyId': [null, [Validators.required]],
            'SupplierAddress': new FormControl({ value: ''}),
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
            'PriceSubTotal': [0],
            'DiscountSubTotal': [0],
            'TotalbefTaxSubTotal': [0],
            'IsGstBeforeDiscount': [false],
            'PaymentTermId': [null, [Validators.required]],
            'PaymentTerms': [{ value: "", disabled: true }],
            'DeliveryTermId': [null],
            'DeliveryTerm': [{ value: "", disabled: true }],
            "Reasons": ["", { validators: [Validators.required, this.noWhitespaceValidator] }],
            'Remarks': [""],
            'RemarksQuotation': [""],
            'SupplierSubCodeId': [null, [Validators.required]],
            'SPOQuotationItem': this.formBuilderObj.array([]),
            'SupplierSubCode': [null],
            'ContactPersonName': [null],
            'ContactNo': [null, { validators: [Validators.pattern(NUMBER_PATERN)] }],
            'ContactEmail': [null, { validators: [Validators.pattern(EMAIL_PATTERN)] }],
            'InventoryRequestId': [""]
        });
    }
    ngOnChanges(simpleChange: SimpleChanges) {
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
    supplierInputFormater = (x: Suppliers) => (x.WorkFlowStatus === "Approved" && !x.IsFreezed) ? x.SupplierName : "";
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
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
                        "SupplierTypeID": "2"
                    });

                    this.isSupplierSelected = false;
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

    poSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    this.clearForm();
                    this.addGridItem(this.linesToAdd);
                    this.selectedPODetails = new PurchaseOrderDetails();
                    return of([]);
                }
                return this.poReqServiceObj.getAllSearchPurchaseOrdersRequest({
                    Search: term,
                    WorkFlowStatusId: WorkFlowStatus.Approved,
                    CompanyId: this.companyId,
                    POTypeId: PurchaseOrderType.InventoryPo//to fetch only inventory purchase order requests..
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

    poInputFormatter = (x: PurchaseOrderRequestList) => x.PurchaseOrderRequestCode;


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


    clearForm() {
        this.purchaseOrderForm.reset();
        this.purchaseOrderForm.setErrors(null);
        this.purchaseOrderForm.get('Remarks').setErrors(null);
        this.purchaseOrderForm.get('ExpectedDeliveryDate').setValue(new Date());
        let itemGroupControl1 = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
        itemGroupControl1.controls = [];
        itemGroupControl1.controls.length = 0;
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;

        this.purchaseOrderForm.patchValue({
            SupplierTypeID: "2",
            IsGstRequired: false,
            POTypeId: PurchaseOrderType.InventoryPo,
            CurrencyId: DEFAULT_CURRENCY_ID

        });
        this.supplierid = 0;
        this.TaxGroupId = 0;
        this.TaxID = 0;
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
        this.pocreationObj.getAllSearchPurchaseOrders(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderDisplayResult) => {
                this.purchaseOrdersList = data.PurchaseOrders;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;

                if (this.purchaseOrdersList.length > 0) {
                    if (purchaseOrderIdToBeSelected == 0) {
                        this.onRecordSelection(this.purchaseOrdersList[0].PurchaseOrderId);
                    }
                    else {
                        this.onRecordSelection(purchaseOrderIdToBeSelected);
                    }
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
        this.purchaseOrderForm.reset();
        this.purchaseOrderForm.setErrors(null);
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.showLoadingIcon = true;
        this.pocreationObj.getPurchaseOrderDetails(purchaseOrderId, this.companyId, this.isApprovalPage, userDetails.UserID)
            .subscribe((data: PurchaseOrderDetails) => {
                this.isSameUSer = (data.RequestedBy == userDetails.UserID) ? true : false;
                this.isApproverUser = (data.CurrentApproverUserId == this.userDetails.UserID) ? true : false;
                this.selectedPODetails = data;
                this.purchaseOrderForm.get('SupplierAddress').setValue(data.SupplierAddress);
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
                // if(this.selectedPODetails.PurchaseOrderId > 0 ){
                //   this.getSupplierSubCodes(this.selectedPODetails.Supplier.SupplierId, this.selectedPODetails.CompanyId);
                // }


            }, (err) => { }, () => this.showLoadingIcon = false);
    }
    /**
     * this method will be called on the supplier dropdown change event.
     */
    onSupplierChange(event?: any) {
        let supplierDetails: Suppliers;
        //let supplierDetails:Supplier;
        let itemGroupControl1 = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (event != null && event != undefined) {
            supplierDetails = event.item;
            this.supplierid = event.item.SupplierId;
            this.TaxGroupId = supplierDetails.TaxGroupId;
            this.TaxID = supplierDetails.TaxID;
            this.purchaseOrderForm.get('CurrencyId').setValue(event.item.CurrencyId);
        }
        else {
            supplierDetails = this.purchaseOrderForm.get('Supplier').value;
            supplierDetails.PaymentTermsId = this.purchaseOrderForm.get('PaymentTermId').value;
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
                        this.getTaxesByTaxGroupsupplierChange(supplierDetails.TaxGroupId, i);

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

                    response.PurchaseOrderRequestItems.forEach(item => {
                        if (item.TypeId === ItemType.Item) {
                            item.TypeId = 1;
                        }
                        else if (item.TypeId === ItemType.Services) {
                            item.TypeId = 2;
                        }
                    });

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
                        PurchaseOrderItems: response.PurchaseOrderRequestItems,
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
                    //console.log("purchase order details..",this.purchaseOrderForm.value);

                });


        }
    }
    /**
     * this method is used to format the content to be display in the autocomplete textbox after selection..
     */
    itemMasterInputFormater = (x: ItemMaster) => x.ItemName;

    /**
     * this mehtod will be called when user gives contents to the  "item master" autocomplete...
     */
    itemMasterSearch = (text$: Observable<string>) => {
        //  let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];    
        //  let type= itemGroupControl.controls[rowIndex].get('TypeId').value;
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
                    let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        let PurchaseOrderItemId = itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderItemId').setValue(PurchaseOrderItemId);
                        itemGroupControl.controls[this.selectedRowId].get('TypeId').setValue(typeId);
                        if (this.TaxGroupId != 0) {
                            this.getTaxesByTaxGroupsupplierChange(this.TaxGroupId, this.selectedRowId);
                            itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(this.TaxID);
                            itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(this.TaxGroupId);
                            itemGroupControl.controls[this.selectedRowId].get('MeasurementUnitID').setValue(0);
                        }
                        else {
                            itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(0);
                            itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(0);
                            itemGroupControl.controls[this.selectedRowId].get('MeasurementUnitID').setValue(0);
                        }
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
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <ItemMaster>control.get('Item').value;
            // if(item!=undefined)
            // {                 
            //     data = data.filter(i=>i.ItemMasterId!=item.ItemMasterId);
            // }
        });
        return data;
    }

    /**
       * this method is used to format the content to be display in the autocomplete textbox after selection..
       */
    serviceMasterInputFormater = (x: AccountCodeMaster) => x.Code;

    /**
     * this mehtod will be called when user gives contents to the  "service master" autocomplete...
     */
    serviceMasterSearch = (text$: Observable<string>) => {
        if (text$ == undefined) {
            return of([]);
        }
        return text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        let PurchaseOrderItemId = itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderItemId').setValue(PurchaseOrderItemId);
                        itemGroupControl.controls[this.selectedRowId].get('TypeId').setValue(typeId);
                        if (this.TaxGroupId != 0) {
                            this.getTaxesByTaxGroupsupplierChange(this.TaxGroupId, this.selectedRowId);
                            itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(this.TaxID);
                            itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(this.TaxGroupId);
                            itemGroupControl.controls[this.selectedRowId].get('MeasurementUnitID').setValue(0);
                        }
                        else {
                            itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(0);
                            itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(0);
                            itemGroupControl.controls[this.selectedRowId].get('MeasurementUnitID').setValue(0);
                        }
                    }
                    return of([]);
                }

                return this.sharedServiceObj.getServicesByKey({
                    searchKey: term,
                    companyId: this.companyId,
                    categoryId: 1 // Services
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
                    return this.getSelectedServicesList(data);
                    // }
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }

    //supplierQuotationInputFormater = (J: Suppliers) => J.SupplierName;
    supplierQuotationInputFormater = (j: Suppliers) => j.WorkFlowStatus === "Approved" ? j.SupplierName : "";
    supplierQuotationItemSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
                    itemGroupControl.controls[this.selectedSupplierRowId].reset();
                    return of([]);
                }
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: this.purchaseOrderForm.get('SupplierTypeID').value,
                    CompanyId: this.companyId
                }).map((data: Array<Suppliers>) => {
                    let gridData = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
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

    // onSubCodeChange(event){

    // }

    getSelectedServicesList(data: AccountCodeMaster[]) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCodeMaster>control.get('Service').value;
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
            ItemDescription: eventData.item.ItemName,
            MeasurementUnitID: eventData.item.MeasurementUnitID,
            ItemQty: 1,
            Unitprice: 0,
            Totalprice: 0,
            TaxGroupId: this.TaxGroupId,
            // TaxAmount:0,
            Discount: 0,
            TotalbefTax: 0,
            TaxID: this.TaxID
        });
    }

    serviceMasterSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            ItemDescription: eventData.item.Description,
            ItemName: eventData.item.Code,
            MeasurementUnitID: 0,
            ItemQty: 1,
            Unitprice: 0,
            Totalprice: 0,
            TaxGroupId: this.TaxGroupId,
            TaxID: this.TaxID,
            //TaxAmount:0,
            Discount: 0,
            TotalbefTax: 0
        });
    }

    initGridRows() {
        return this.formBuilderObj.group({
            'PurchaseOrderItemId': 0,
            'ItemDescription': [""],
            'MeasurementUnitID': [0, [Validators.required]],
            'MeasurementUnitCode': [""],
            // 'Item':["",Validators.required],
            'Item': [""],
            'TypeId': [1, Validators.required],
            "ItemQty": [0, [Validators.required, Validators.min(1)]],
            "Unitprice": [0, [Validators.required, Validators.min(0.00000001)]],
            "Totalprice": [0, [Validators.required, Validators.min(0.00000001)]],
            "IsModified": false,
            "TaxID": [0, [Validators.required, Validators.min(1)]],
            "TaxGroupId": [0, [Validators.required, Validators.min(1)]],
            "TaxName": [""],
            "TaxAmount": [0],
            "Discount": [0, [Validators.required]],
            "TotalbefTax": [0],
            "TaxTotal": [0],
            // 'Service':["",Validators.required],
            'Service': [""],
            'Taxes': [],
        });
    }

    initGridRows1() {
        return this.formBuilderObj.group({
            'Sno': 0,
            'QuotationId': 0,
            'QuotationAmount': [0],
            'QuotationRemarks': [null],
            'Supplier': [null, [Validators.required]],
            "IsModified": false,
            "RowIndex": 0
        });
    }

    //adding row to the grid..
    addGridItem(noOfLines: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGridRows());
            let lastIndex = itemGroupControl.length - 1;
            itemGroupControl.controls[lastIndex].get('Item').setValidators([Validators.required]);
            itemGroupControl.controls[lastIndex].get('Item').updateValueAndValidity();
            if (this.supplierid > 0) {
                itemGroupControl.controls[lastIndex].get('TaxGroupId').setValue(this.TaxGroupId);
                itemGroupControl.controls[lastIndex].get('TaxID').setValue(this.TaxID);

                this.getTaxesByTaxGroupsupplierChange(this.TaxGroupId, lastIndex);
            }

        }
    }

    addGridItem1(noOfLines: number) {
        let itemGroupControl1 = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl1.push(this.initGridRows1());
        }
    }



    /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('PurchaseOrderItemId').value;
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
        this.hideText = false;
        this.hideInput = true;
        this.isSupplierSelected = false;
        this.isAddMode = true;
        this.isEditMode = false;
        this.selectedPODetails = new PurchaseOrderDetails();
        //console.log("selected po",this.selectedPODetails);
        this.clearForm();
        this.getCompanyDetails(this.companyId);
        this.addGridItem(this.linesToAdd);
        
        //this.showFullScreen();
        
        this.quotationUploadedFiles.length = 0;
        this.quotationUploadedFiles = [];

    }

    getWorkFlowConfiguration(deptName: String) {
        this.processId = 1;
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
    /**
     * to save the given purchase order details
     */
    saveRecord(action: string) {
        debugger
        let count = 0;
        var uniqueNames = [];
        this.showGridErrorMessage = false;
        this.showGridErrorMessage1 = false;
        this.showGridErrorMessage2 = false;
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        let itemGroupQuotationControl = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
        if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
            this.showGridErrorMessage = true;
        }
        if (itemGroupControl != undefined) {
            for (let i = 0; i < itemGroupControl.length; i++) {
                let total = (itemGroupControl.controls[i].get('ItemQty').value * itemGroupControl.controls[i].get('Unitprice').value) + (itemGroupControl.controls[i].get('TaxTotal').value);
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
        if (this.selectedPODetails.PurchaseOrderId > 0 && this.hideText == true) {
            RemarksControl.setValue(this.selectedPODetails.RemarksQuotation);
        }
        if (action == 'send') {
            if (this.selectedPODetails.SPOQuotationItem == undefined) {
                this.selectedPODetails.SPOQuotationItem = [];
                this.selectedPODetails.SPOQuotationItem.length = 0;
                this.selectedPODetails.SPOQuotationAttachment = [];
                this.selectedPODetails.SPOQuotationAttachment.length = 0;
            }

            if (((this.selectedPODetails.SPOQuotationItem.length < 3 && this.hideText == true) || (itemGroupQuotationControl.length < 3 && this.hideText != true))) {
                if (RemarksControl.value == "" || RemarksControl.value == null) {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.QuotationAttachmentForPO,
                        MessageType: MessageTypes.NoChange
                    });

                    this.router.navigate([`/po/polist`]);

                    return;
                }
            }

            if (itemGroupQuotationControl.length != 0 || this.selectedPODetails.SPOQuotationItem.length != 0) {
                if (this.selectedPODetails.SPOQuotationItem.length > 0 && this.hideText == true) {
                    count = this.selectedPODetails.SPOQuotationItem.length;
                }
                else {
                    count = itemGroupQuotationControl.length;
                }
                let attCount = 0;
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        if ((this.selectedPODetails.SPOQuotationAttachment != undefined &&
                            this.selectedPODetails.SPOQuotationAttachment.findIndex(j => j.RowId == i && j.IsDelete != true) > -1)
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

            if ((this.selectedPODetails.SPOQuotationItem.length >= 3 || itemGroupQuotationControl.length >= 3) && (RemarksControl.value == "" || RemarksControl.value == null)) {
                if (this.selectedPODetails.SPOQuotationAttachment.length > 0) {
                    for (let i = 0; i < this.selectedPODetails.SPOQuotationAttachment.length; i++) {
                        if (uniqueNames.indexOf(this.selectedPODetails.SPOQuotationAttachment[i].RowId) === -1) {
                            uniqueNames.push(this.selectedPODetails.SPOQuotationAttachment[i].RowId);
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

        if (action == 'send' && this.hideText == true && this.selectedPODetails.PurchaseOrderId > 0) {
            let workFlowDetails =
            {
                TotalAmount: this.selectedPODetails.TotalAmount,
                PurchaseOrderId: this.selectedPODetails.PurchaseOrderId,
                CreatedBy: this.selectedPODetails.CreatedBy,
                PurchaseOrderCode: this.selectedPODetails.PurchaseOrderCode,
                WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
                CompanyId: this.selectedPODetails.CompanyId,
                LocationId: this.selectedPODetails.LocationId,
                PurchaseOrderStatusId: this.selectedPODetails.WorkFlowStatusId,
                RemarksQuotation: this.selectedPODetails.RemarksQuotation
            };
            HideFullScreen(null);
            this.pocreationObj.sendForApproval(workFlowDetails)
                .subscribe((data) => {

                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.SentForApproval,
                        MessageType: MessageTypes.Success
                    });
                    this.sharedServiceObj.PoDraftVisible = false;
                    this.readListView.emit({ PoId: workFlowDetails.PurchaseOrderId, PotypeId: PurchaseOrderType.InventoryPo });
                });
            return;
        }


        //getting the purchase order form details...
        let purchaseOrderDetails: PurchaseOrderDetails = this.purchaseOrderForm.value;
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
                if (i.PurchaseOrderItemId > 0) {
                    if (this.selectedPODetails.PurchaseOrderItems != undefined) {
                        let previousRecord = this.selectedPODetails.PurchaseOrderItems.find(j => j.PurchaseOrderItemId == i.PurchaseOrderItemId);
                        if (i.Item.ItemMasterId != previousRecord.Item.ItemMasterId ||
                            (i.Item.ItemMasterId == 0 && (i.Item.ItemName != previousRecord.Item.ItemName)) ||
                            i.ItemDescription != previousRecord.ItemDescription ||
                            i.ItemQty != previousRecord.ItemQty ||
                            i.Unitprice != previousRecord.Unitprice ||
                            i.MeasurementUnitID != previousRecord.MeasurementUnitID ||
                            i.TaxID != previousRecord.TaxID ||
                            i.Discount != previousRecord.Discount) {
                            i.IsModified = true;
                        }
                    }
                }
                else {
                    i.PurchaseOrderItemId = 0;
                }
            });
            purchaseOrderDetails.SPOQuotationItem.forEach(i => {
                if (i.QuotationId > 0) {
                    let previousRecord = this.selectedPODetails.SPOQuotationItem.find(j => j.QuotationId == i.QuotationId);
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
            purchaseOrderDetails.PurchaseOrderItems = purchaseOrderDetails.PurchaseOrderItems.filter(i => i.PurchaseOrderItemId == 0 || i.PurchaseOrderItemId == null || i.IsModified == true);
            purchaseOrderDetails.SPOQuotationItem = purchaseOrderDetails.SPOQuotationItem.filter(i => i.QuotationId == 0 || i.QuotationId == null || i.IsModified == true);

            let userDetails = <UserDetails>this.sessionService.getUser();
            purchaseOrderDetails.RequestedBy = userDetails.UserID;
            purchaseOrderDetails.CreatedBy = userDetails.UserID;
            purchaseOrderDetails.CompanyId = this.sessionService.getCompanyId();
            purchaseOrderDetails.POTypeId = PurchaseOrderType.InventoryPo;

            purchaseOrderDetails.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
            purchaseOrderDetails.ProcessId = WorkFlowProcess.InventoryPO;
            if (purchaseOrderDetails.PurchaseOrderId == 0 || purchaseOrderDetails.PurchaseOrderId == null) {
                purchaseOrderDetails.PurchaseOrderId = 0;
                HideFullScreen(null);
                this.pocreationObj.createPurchaseOrder(purchaseOrderDetails, this.uploadedFiles, this.quotationUploadedFiles)
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
                        this.readListView.emit({ PoId: poId, PotypeId: PurchaseOrderType.InventoryPo });
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage1 = false;
                        this.showGridErrorMessage2 = false;
                        itemGroupQuotationControl.controls = [];
                        itemGroupQuotationControl.controls.length = 0;
                        if (this.sharedServiceObj.PORecordslength == 0) {
                            this.hideFullScreen();
                        }
                    });
            }
            else {
                //console.log(this.quotationUploadedFiles);
                //purchaseOrderDetails.WorkFlowStatusId = this.selectedPODetails.WorkFlowStatusId;     
                purchaseOrderDetails.PurchaseOrderId = this.selectedPODetails.PurchaseOrderId;
                purchaseOrderDetails.SPOQuotationItemToDelete = this.deletedSPOQuotationItems;

                purchaseOrderDetails.SPOQuotationAttachmentDelete = this.selectedPODetails.SPOQuotationAttachmentDelete;
                purchaseOrderDetails.PurchaseOrderItemsToDelete = this.deletedPurchaseOrderItems;
                purchaseOrderDetails.Attachments = this.selectedPODetails.Attachments.filter(i => i.IsDelete == true);
                purchaseOrderDetails.SPOQuotationAttachmentUpdateRowId = this.selectedPODetails.SPOQuotationAttachmentUpdateRowId;
                HideFullScreen(null);
                this.pocreationObj.updatePurchaseOrder(purchaseOrderDetails, this.uploadedFiles, this.quotationUploadedFiles)
                    .subscribe((response) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];

                        this.quotationUploadedFiles.length = 0;
                        this.quotationUploadedFiles = [];
                        this.deletedSPOQuotationItems.length = 0;
                        this.deletedSPOQuotationItems = [];
                        this.selectedPODetails.SPOQuotationAttachmentDelete = [];
                        this.selectedPODetails.SPOQuotationAttachmentDelete.length = 0;
                        this.deletedPurchaseOrderItems = [];
                        this.deletedPurchaseOrderItems.length = 0;
                        this.recordInEditMode = -1;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.sharedServiceObj.PoDraftVisible = true;
                        this.readListView.emit({ PoId: purchaseOrderDetails.PurchaseOrderId, PotypeId: PurchaseOrderType.InventoryPo });
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage1 = false;
                        this.showGridErrorMessage2 = false;
                        itemGroupQuotationControl.controls = [];
                        itemGroupQuotationControl.controls.length = 0;
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
            let itemGroupControl1 = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
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
        //debugger;
        // this.hasWorkFlow = true;
        // this.purchaseOrderForm.reset();
        // this.purchaseOrderForm.setErrors(null);
        // this.cancelChanges.emit(true);
        // this.showGridErrorMessage1 = false;
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
        this.router.navigate([`/po/polist`]);
    }
    /**
     * to delete the selected record...
     */
    deleteRecord() {
        let recordId = this.selectedPODetails.PurchaseOrderId;

        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                this.pocreationObj.deletePurchaseOrder(recordId, userDetails.UserID).subscribe((data) => {
                    this.readListView.emit({ PoId: 0, PotypeId: PurchaseOrderType.InventoryPo });
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
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        let itemGroupControl1 = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
        itemGroupControl1.controls = [];
        itemGroupControl1.controls.length = 0;
        this.addGridItem(this.selectedPODetails.PurchaseOrderItems.length);
        this.addGridItem1(this.selectedPODetails.SPOQuotationItem.length);

        this.purchaseOrderForm.patchValue(this.selectedPODetails);
        this.getTaxTypes();
        itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        for (let i = 0; i < itemGroupControl.length; i++) {
            let taxgroupId = itemGroupControl.controls[i].get('TaxGroupId').value;
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

        // if(this.selectedPODetails.SPOQuotationAttachment.length>0)
        // {
        //     for(let i=0;i<this.selectedPODetails.SPOQuotationAttachment.length;i++ )
        //     {
        //         this.quotationUploadedFiles.push.apply(this.selectedPODetails.SPOQuotationAttachment[i].FileName,this.selectedPODetails.SPOQuotationAttachment[i].RowId);
        //     }
        // }

        this.supplierid = this.selectedPODetails.Supplier.SupplierId;
        //console.log(this.purchaseOrderForm);
        //console.log(this.quotationUploadedFiles);
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
                subTotal = subTotal + ((data.get('ItemQty').value * data.get('Unitprice').value) + data.get('TaxTotal').value - data.get('Discount').value);
            });
            return subTotal;
        }
    }

    getTotalPrice() {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let totalnewprice = 0;
            itemGroupControl.controls.forEach(data => {
                totalnewprice = (data.get('ItemQty').value * data.get('Unitprice').value);
                data.get('Totalprice').setValue(totalnewprice);
            });

        }
    }



    setTaxAmount(taxType: number, rowIndex: number) {
        this.checktax = true;
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        this.getTaxTypesByTaxGroup(itemGroupControl.controls[rowIndex].get('TaxGroupId').value, rowIndex);
        console.log(this.taxTypes);
        let taxAmount = 0;
        if (itemGroupControl.controls[rowIndex].get('Taxes').value.find(i => i.TaxId == taxType) != undefined)
        //if(this.taxTypes.find(i=>i.TaxId==taxType)!=undefined)
        {
            //taxAmount =  this.taxTypes.find(i=>i.TaxId==taxType).TaxAmount;
            taxAmount = itemGroupControl.controls[rowIndex].get('Taxes').value.find(i => i.TaxId == taxType).TaxAmount;
        }
        itemGroupControl.controls[rowIndex].get('TaxAmount').setValue(taxAmount);
        this.calculateTotalPrice();
        this.checktax = false;
    }

    getTaxTypesByTaxGroup(taxGroupId: number, rowIndex: number) {

        //   if(taxGroupId == 0)
        //   {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (this.checktax == false) {
            itemGroupControl.controls[rowIndex].get('TaxTotal').setValue(0);
            itemGroupControl.controls[rowIndex].get('TaxID').setValue(0);
        }
        //}
        this.getTaxesByTaxGroup(taxGroupId, rowIndex);
    }

    onItemTypeChange(itemType: number, rowIndex: number) {

        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('PurchaseOrderItemId').value;
        if (purchaseOrderItemId > 0) {
            this.deletedPurchaseOrderItems.push(purchaseOrderItemId);
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
    calculateTotalTax() {
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            if (this.purchaseOrderForm.get('IsGstBeforeDiscount').value == true) {
                itemGroupControl.controls.forEach(data => {
                    let itemTotal = (data.get('ItemQty').value * data.get('Unitprice').value) * (data.get('TaxAmount').value) / 100;
                    data.get('TaxTotal').setValue(itemTotal);
                });
            }
            else {
                itemGroupControl.controls.forEach(data => {
                    let itemTotal = ((data.get('ItemQty').value * data.get('Unitprice').value) - data.get('Discount').value) * (data.get('TaxAmount').value) / 100;
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
        //this.purchaseOrderForm.get('TotalTax').setValue(totalTax);
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
                priceSubTotal = priceSubTotal + (data.get('ItemQty').value * data.get('Unitprice').value);
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
            this.readListView.emit({ PoId: 0, PotypeId: PurchaseOrderType.InventoryPo });
        }
    }
    onPaymentTermChange(event: any) {
        let paymentTermId = this.purchaseOrderForm.get('PaymentTermId').value;
        let description = "";
        if (this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId) != undefined) {
            description = this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).Description
        }
        this.purchaseOrderForm.get('PaymentTerms').setValue(description);
        if (paymentTermId > 0) {
            this.updateExpireDate();
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
            this.readListView.emit({ PoId: 0, PotypeId: PurchaseOrderType.InventoryPo });
        }
    }
    // onPrintScreen(event:any)
    // {
    //     let windowObj = event.view;
    //     this.pocreationObj.printDetails(this.selectedPODetails.PurchaseOrderId).subscribe((data:string)=>{

    //         PrintScreen(data,windowObj,"Purchase Order Details");
    //     });
    //     //  PrintScreen("",windowObj,`http://localhost:49266/api/purchaseOrderPrint/${this.selectedPODetails.PurchaseOrderId}`);
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
            ProcessId: WorkFlowProcess.InventoryPO,
            PoCode: this.selectedPODetails.PurchaseOrderCode,
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
        this.purchaseOrderCode = this.selectedPODetails.PurchaseOrderCode;
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
    onStatusUpdate(purchaseOrderId: number) {
        this.showVoidPopUp = false;
        this.readListView.emit({ PoId: purchaseOrderId, PotypeId: PurchaseOrderType.InventoryPo });
        // this.onRecordSelection(purchaseOrderId);
    }
    hideVoidPopUp(hidePopUp: boolean) {
        this.showVoidPopUp = false;
    }
    onDepChage(event: any, department: any) {

        //let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['PurchaseOrderItems'];
        //itemGroupControl.reset();

        this.deptId = event.target.value;
        this.getWorkFlowConfiguration(department.selectedOptions[0].label);

    }
    recallPoApproval() {
        debugger;
        let userDetails = <UserDetails>this.sessionService.getUser();
        let poId = this.selectedPODetails.PurchaseOrderId;
        let approvalObj = {
            PurchaseOrderId: poId,
            POTypeId: this.selectedPODetails.POTypeId,
            CreatedBy: userDetails.UserID,
            PurchaseOrderCode: this.selectedPODetails.PurchaseOrderCode,
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
        this.pocreationObj.recallPoApproval(approvalObj)
            .subscribe(() => {
                this.readListView.emit({ PoId: poId, PotypeId: PurchaseOrderType.InventoryPo });
            });
    }


    updateExpireDate() {
        let expectedDeliveryDate: Date = this.purchaseOrderForm.get('ExpectedDeliveryDate').value;
        let paymentTermId = this.purchaseOrderForm.get('PaymentTermId').value;
        let noOfDays = 0;
        if (this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId) != undefined) {
            noOfDays = this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).NoOfDays;
        }
        if (expectedDeliveryDate != null && noOfDays >= 0) {
            this.purchaseOrderForm.get('ExpectedDeliveryDate').setValue(new Date(new Date().getTime() + (noOfDays * 24 * 60 * 60 * 1000)));
        }
        else {
            this.purchaseOrderForm.get('ExpectedDeliveryDate').setValue(null);
        }
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
            if (this.selectedPODetails.SPOQuotationAttachment != null) {
                let uploadFile;
                let attchmentile = this.selectedPODetails.SPOQuotationAttachment.filter(i => i.FileName.toLowerCase() === fileName.toLowerCase() && i.RowId === rowIndex)[0];
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
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
        itemGroupControl.controls[rowIndex].get('RowIndex').setValue(rowIndex);
    }

    onFileQuotationUploadChange(event: any) {
        let files: FileList = event.target.files;
        let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
        for (let i = 0; i < files.length; i++) {
            let fileItem = files.item(i);
            if (ValidateFileType(fileItem.name)) {
                if (!this.checkDuplicateFile(fileItem.name, this.selectedFileRowIndex)) {
                    this.quotationUploadedFiles.push({ File: fileItem, RowIndex: this.selectedFileRowIndex });
                    itemGroupControl.controls[this.selectedFileRowIndex].get('RowIndex').setValue(this.selectedFileRowIndex);

                    try {
                        let selectedRow = this.selectedPODetails.SPOQuotationItem[this.selectedFileRowIndex];
                        if (selectedRow != undefined) {
                            if (selectedRow.QuotationId > 0) {
                                selectedRow.IsModified = true;
                                let itemGroupControl = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
                                itemGroupControl.controls[this.selectedFileRowIndex].get('IsModified').setValue(true);
                                this.selectedPODetails.SPOQuotationItem = this.selectedPODetails.SPOQuotationItem.filter((i, index) => index > -1);
                            }
                        }
                    }
                    catch (error) {
                    }
                }
            }
            else {
                // event.preventDefault();
                return;
                break;
            }
        }
    }


    SPOQuotationAttachmentDelete(SelectedIndex: number) {
        let attachmentRecord = this.selectedPODetails.SPOQuotationAttachment[SelectedIndex];
        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header: Messages.DeletePopupHeader,
            accept: () => {
                if (this.selectedPODetails.SPOQuotationAttachmentDelete == null) {
                    this.selectedPODetails.SPOQuotationAttachmentDelete = [];
                }
                this.selectedPODetails.SPOQuotationAttachmentDelete.push(attachmentRecord);
                attachmentRecord.IsDelete = true;
                this.selectedPODetails.SPOQuotationAttachment = this.selectedPODetails.SPOQuotationAttachment.filter(i => i.IsDelete != true);
            },
            reject: () => {
            }
        });
    }



    removeSupplierGridItem(rowIndex: number) {
        let attachmentRecord = null;
        let itemGroupVendorControl = <FormArray>this.purchaseOrderForm.controls['SPOQuotationItem'];
        let QuotationId = itemGroupVendorControl.controls[rowIndex].get('QuotationId').value;
        if (QuotationId > 0) {
            this.deletedSPOQuotationItems.push(QuotationId);

            this.selectedPODetails.SPOQuotationAttachment.forEach(data => {

                if (data.RowId == rowIndex) {
                    data.IsDelete = true;
                    attachmentRecord = data;
                } else {
                    data.IsDelete = false;
                }

            });
            //console.log( this.quotationUploadedFiles);
            if (this.selectedPODetails.SPOQuotationAttachmentDelete == null) {
                this.selectedPODetails.SPOQuotationAttachmentDelete = [];
            }
            // this.selectedPODetails.QuotationAttachmentDelete.push(this.selectedPODetails.QuotationAttachment[rowIndex]);

            this.selectedPODetails.SPOQuotationAttachmentDelete.push(attachmentRecord);
            //this.selectedPODetails.SPOQuotationAttachmentDelete=this.selectedPODetails.SPOQuotationAttachment.filter(i => i.IsDelete == true);
            this.selectedPODetails.SPOQuotationAttachment = this.selectedPODetails.SPOQuotationAttachment.filter(i => i.IsDelete != true).map((data, index) => {

                if (data.RowId > rowIndex) {
                    data.RowId = data.RowId - 1;
                }
                return data;
            });
            this.selectedPODetails.SPOQuotationAttachmentUpdateRowId = this.selectedPODetails.SPOQuotationAttachment;
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
        // console.log(this.selectedPODetails.SPOQuotationAttachment);
        // console.log(this.selectedPODetails.SPOQuotationAttachmentDelete);
    }


}
