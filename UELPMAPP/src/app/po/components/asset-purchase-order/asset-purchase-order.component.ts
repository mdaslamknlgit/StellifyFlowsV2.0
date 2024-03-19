import { Component, OnInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { FixedAssetDetails } from "../../models/fixed-asset-purchase-order.model";
import { CostOfService, PurchaseOrderStatus } from "../../models/po-creation.model";
import { FixedAssetPurchaseOrderService } from "../../services/fixed-asset-purchase-order.service";
import { POCreationService } from "../../services/po-creation.service";
import { SharedService } from "../../../shared/services/shared.service";
import { PagerConfig, Suppliers, MessageTypes, Assets, Taxes, UserDetails, WorkFlowStatus, WorkFlowProcess, PurchaseOrderType, ASSET_TYPE, ItemType, AssetSubCategory } from "../../../shared/models/shared.model";
import { GridOperations, Messages, Currency, PaymentTerms } from "../../../shared/models/shared.model";
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { ValidateFileType, FullScreen, HideFullScreen, PrintScreen, restrictMinus } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { Supplier, SupplierSubCode } from '../../models/supplier';
import { DeliveryTerms } from '../../models/delivery-terms.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { DEFAULT_CURRENCY_ID, NUMBER_PATERN, EMAIL_PATTERN } from '../../../shared/constants/generic';
import { PoApprovalUpdateStatus } from '../../models/po-approval.model';
import { PurchaseOrderRequestList, PurchaseOrderRequestDetails } from '../../models/purchase-order-request.model';
import { PurchaseOrderRequestService } from '../../services/purchase-order-request.service';
import { AccountCodeMaster } from '../../models/account-code.model';
import { TaxService } from '../../services/tax.service';
import { Company } from '../../../administration/models/company';
import { Locations } from '../../../inventory/models/item-master.model';
import { ActivatedRoute, Router } from '../../../../../node_modules/@angular/router';
import { WorkFlowApiService } from '../../../administration/services/workflow-api.service';
import { UtilService } from '../../../shared/services/util.service';
@Component({
    selector: 'app-asset-purchase-order',
    templateUrl: './asset-purchase-order.component.html',
    styleUrls: ['./asset-purchase-order.component.css'],
    providers: [FixedAssetPurchaseOrderService, POCreationService, PurchaseOrderRequestService, TaxService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class AssetPurchaseOrderComponent implements OnInit, OnChanges {
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
    purchaseOrderPagerConfig: PagerConfig;
    purchaseOrderItemsGridConfig: PagerConfig;
    assestPurchaseOrderForm: FormGroup;
    selectedPODetails: FixedAssetDetails;
    suppliers: Suppliers[] = [];
    currencies: Currency[] = [];
    departments: Locations[] = [];
    taxTypes: Array<any> = [];
    gridColumns: Array<{ field: string, header: string }> = [];
    recordInEditMode: number;
    operation: string;
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
    hideLeftPanel: boolean = false;
    linesToAdd: number = 2;
    paymentTerms: PaymentTerms[] = [];
    measurementUnits: MeasurementUnit[] = [];
    deletedPurchaseOrderItems: Array<number> = [];
    deliveryTerms: DeliveryTerms[] = [];
    @ViewChild('instructions') instructionsRef: ElementRef;
    @ViewChild('justifications') justificationsRef: ElementRef;
    letters: string[] = ["a", "b", "c", "d", "e", "f"];
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    selectedRowId: number = 0;
    showLoadingIcon: boolean = false;
    companyId: number;
    workFlowStatus: any;
    showVoidPopUp: boolean = false;
    purchaseOrderStatus: any;
    assetTYpes = ASSET_TYPE;
    isVoid: boolean = false;
    taxGroups = [];
    quotationUploadedFiles: Array<{ File: File, RowIndex: number }> = [];
    gridQuotationColumns: Array<{ field: string, header: string }> = [];
    deletedAPOQuotationItems: Array<number> = [];
    selectedFileRowIndex: number = 1;
    showGridErrorMessage2: boolean = false;
    selectedSupplierRowId: number = -1;
    purchaseOrderCode: string = "";
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
    showdropdown: boolean = false;
    isCompanyChanged: boolean = false;
    processId: number = 0;
    deptId: number = 0;
    hasWorkFlow: boolean = true;
    isSameUSer: boolean = false;
    isApproverUser: boolean = false;
    public innerWidth: any;
    IsVerifier: boolean = false;
    onFileChoose(index: number, fileInput: any) {
        this.selectedFileRowIndex = index;
        fileInput.click();
    }
    constructor(private fixedAssetPoCreationObj: FixedAssetPurchaseOrderService,
        private router: Router,
        private formBuilderObj: FormBuilder,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        private reqDateFormatPipe: RequestDateFormatPipe,
        private poCreationObj: POCreationService,
        public sessionService: SessionStorageService,
        private poReqServiceObj: PurchaseOrderRequestService,
        private taxService: TaxService,
        private workFlowService: WorkFlowApiService,
        private utilService: UtilService,
        public activatedRoute: ActivatedRoute) {
        this.companyId = this.sessionService.getCompanyId();
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.gridColumns = [
            { field: 'IsDetailed', header: 'Is Detailed' },
            { field: 'Sno', header: 'S.No.' },
            //   { field: 'AssetCode', header: 'Asset Code' },
            { field: 'TypeId', header: 'Type' },
            { field: 'Name', header: 'Asset/Service' },
            //{ field: '',header:'Warranty' },
            { field: 'AssetDescription', header: 'Description' },
            { field: 'AssetQty', header: 'Qty' },
            { field: 'Unitprice', header: 'Price' },
            { field: 'Totalprice', header: 'Total Price' },
            { field: 'Discount', header: 'Discount' },
            { field: 'TotalbefTax', header: 'Total bef Tax' },
            { field: 'TaxGroup', header: 'Tax Group' },
            { field: 'TaxID', header: 'GST Type' },
            { field: 'TaxRate', header: 'GST Amount' },
            { field: 'ItemTotal', header: 'LineTotal' },
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
        this.purchaseOrderPagerConfig = new PagerConfig();
        this.purchaseOrderPagerConfig.RecordsToFetch = 100;
        this.purchaseOrderItemsGridConfig = new PagerConfig();
        this.purchaseOrderItemsGridConfig.RecordsToFetch = 20;
        this.selectedPODetails = new FixedAssetDetails();
        this.getformGroup();
        this.getTaxTypes();
        this.assestPurchaseOrderForm.get('IsGstBeforeDiscount').setValue(true);
        this.sharedServiceObj.deliveryAddress$.subscribe((data) => {
            this.assestPurchaseOrderForm.patchValue({
                "DeliveryAddress": data,
            });
        });
        this.workFlowStatus = WorkFlowStatus;
        this.purchaseOrderStatus = PurchaseOrderStatus;
    }

    @ViewChild('rightPanel') rightPanelRef;

    ngOnInit() {
        debugger;
        var screenwidth = window.innerWidth-175;
        $(".tablescroll").css("width",screenwidth)
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
        this.activatedRoute.paramMap.subscribe((data) => {
            let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
            if (Number(companyId) != 0)
                this.companyId = companyId;
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
        this.company = new Company();
        this.sharedServiceObj.getCurrencies()
            .subscribe((data: Currency[]) => {
                this.currencies = data;
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
                //this.getDepartments(this.companyId);
                //this.getCompanyDetails(this.companyId);
            });

        this.operation = GridOperations.Display;
        this.getPaymentTerms();
        this.getMeasurementUnits();
        this.getDeliveryTerms();
        this.getTaxGroups();
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
        this.sharedServiceObj.getUserDepartments(companyId, WorkFlowProcess.FixedAssetPO, this.userDetails.UserID).subscribe((data: Array<Locations>) => {
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
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
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
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
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

                this.assestPurchaseOrderForm.patchValue({
                    "DeliveryAddress": deliveryAddress,
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

    getformGroup() {
        this.assestPurchaseOrderForm = this.formBuilderObj.group({
            'SupplierTypeID': [1, { validators: [Validators.required] }],
            'LocationId': [null, [Validators.required]],
            'Supplier': [null, [Validators.required]],
            'ExpectedDeliveryDate': [new Date()],
            'VendorReferences': ["", { validators: [Validators.required, this.noWhitespaceValidator] }],
            'CurrencyId': [0, [Validators.required, Validators.min(1)]],
            'SupplierAddress': [""],
            'SupplierCode': [{ value: "", disabled: true }],
            'DeliveryAddress': ["", [Validators.required]],
            'ShippingFax': [{ value: "", disabled: true }],
            'CostOfServiceId': [0, Validators.required],
            'Instructions': [""],
            'Justifications': [""],
            'PurchaseOrderItems': this.formBuilderObj.array([]),
            'Discount': [{ value: 0 }],
            'TaxRate': [0],
            'TotalTax': [0],
            'OtherCharges': [0],
            'ShippingCharges': [0],
            'SubTotal': [0],
            'TotalAmount': [0],
            'IsGstRequired': [false],
            'IsGstBeforeDiscount': [false],
            'PaymentTermId': [null, [Validators.required]],
            'PaymentTerms': [{ value: "", disabled: true }],
            'DeliveryTerm': [{ value: "", disabled: true }],
            'DeliveryTermId': [null],
            "Reasons": ["", { validators: [Validators.required, this.noWhitespaceValidator] }],
            "Remarks": [],
            "RemarksQuotation": [""],
            "APOQuotationItem": this.formBuilderObj.array([]),
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
            this.assestPurchaseOrderForm.get('Remarks').setValue("");
        }
    }
    //this method is used to format the content to be display in the autocomplete textbox after selection..
    //supplierInputFormater = (x: Suppliers) => x.SupplierName;
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    // supplierSearch = (text$: Observable<string>) =>
    //   text$.pipe(
    //     debounceTime(300),
    //     distinctUntilChanged(),
    //     switchMap(term =>
    //         this.sharedServiceObj.getSuppliers({
    //             searchKey:term,
    //             supplierTypeId:this.assestPurchaseOrderForm.get('SupplierTypeID').value,
    //             companyId:this.companyId
    //         }).pipe(
    //         catchError(() => {
    //             return of([]);
    //         }))
    //    )
    // );   

    supplierInputFormater = (x: Suppliers) => (x.WorkFlowStatus === "Approved" && !x.IsFreezed) ? x.SupplierName : "";
    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    this.assestPurchaseOrderForm.patchValue({
                        "SupplierAddress": "",
                        "ShippingFax": "",
                        "SupplierCode": "",
                        "IsGstRequired": false,
                        "SupplierTypeID": 2
                    });
                    let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
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
                    supplierTypeId: this.assestPurchaseOrderForm.get('SupplierTypeID').value,
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
                    let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
                    itemGroupControl.controls[this.selectedSupplierRowId].reset();
                    return of([]);
                }
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: this.assestPurchaseOrderForm.get('SupplierTypeID').value,
                    CompanyId: this.companyId
                }).map((data: Array<Suppliers>) => {
                    let gridData = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
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

    getPaymentTerms() {
        this.sharedServiceObj.getPaymentTerms(this.sessionService.getCompanyId())
            .subscribe((data: PaymentTerms[]) => {
                this.paymentTerms = data;
            });
    }
    getTaxTypes() {
        this.sharedServiceObj.getTaxGroups(0)
            .subscribe((data: Taxes[]) => {
                this.taxTypes = data;
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
        this.assestPurchaseOrderForm.get('Supplier').setValue(null);
    }
    getDeliveryTerms() {
        this.sharedServiceObj.getAllDeliveryTerms(this.sessionService.getCompanyId())
            .subscribe((data: DeliveryTerms[]) => {
                this.deliveryTerms = data;
            });
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderId: number) {
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.assestPurchaseOrderForm.reset();
        this.assestPurchaseOrderForm.setErrors(null);
        this.showLoadingIcon = true;
        this.fixedAssetPoCreationObj.getPurchaseOrderDetails(purchaseOrderId, this.companyId)
            .subscribe((data: FixedAssetDetails) => {
                this.isSameUSer = (data.RequestedBy == userDetails.UserID) ? true : false;
                this.isApproverUser = (data.CurrentApproverUserId == this.userDetails.UserID) ? true : false;
                this.selectedPODetails = data;
                this.assestPurchaseOrderForm.get('SupplierAddress').setValue(data.SupplierAddress);
                if (data.APOQuotationItem == null) {
                    data.APOQuotationItem = [];
                }
                let taxTotal = 0;
                this.selectedPODetails.PurchaseOrderItems.forEach(data => {
                    taxTotal = taxTotal + data.TaxTotal;
                });

                this.selectedPODetails.TotalTax = taxTotal;
                this.showLoadingIcon = false;
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
                this.assestPurchaseOrderForm.patchValue(data);
                this.hideText = true;
                this.hideInput = false;
                this.selectedPODetails.PurchaseOrderItems.forEach((data, index) => {
                    this.setSerialNumber(index, data.IsDetailed, false);
                });
                this.selectedPODetails.PurchaseOrderItems = this.selectedPODetails.PurchaseOrderItems.filter((data, index) => index > -1);
            }, () => {
                this.showLoadingIcon = false;
            });
    }
    /**
     * this method will be called on the supplier dropdown change event.
     */
    onSupplierChange(event?: any) {
        let supplierDetails: Suppliers;
        let itemGroupControl1 = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        //let supplierDetails:Suppliers;
        if (event != null && event != undefined) {
            supplierDetails = event.item;
            this.supplierid = event.item.SupplierId;
            this.TaxGroupId = supplierDetails.TaxGroupId;
            this.TaxID = supplierDetails.TaxID;
            this.assestPurchaseOrderForm.get('CurrencyId').setValue(event.item.CurrencyId);
        }
        else {
            supplierDetails = this.assestPurchaseOrderForm.get('Supplier').value;
            supplierDetails.PaymentTermsId = this.assestPurchaseOrderForm.get('PaymentTermId').value;
        }
        if (supplierDetails != undefined) {
            if ((supplierDetails.WorkFlowStatus != null) && (supplierDetails.WorkFlowStatus === "Approved") && (!supplierDetails.IsFreezed)) {
                this.assestPurchaseOrderForm.patchValue({
                    "SupplierAddress": supplierDetails.SupplierAddress,
                    // "DeliveryAddress":"",
                    "SupplierCode": supplierDetails.SupplierCode,
                    "ShippingFax": supplierDetails.BillingFax,
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

                this.isSupplierSelected = true;
                if (supplierDetails.SubCodeCount > 0 || this.assestPurchaseOrderForm.get("SupplierSubCode").value != null) {
                    this.isSupplierSelected = true;
                    this.assestPurchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
                    this.assestPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
                }
                else {
                    this.isSupplierSelected = false;
                    this.assestPurchaseOrderForm.get('SupplierSubCodeId').clearValidators();
                    this.assestPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
                }

                //getting Supplier sub Codes
                this.getSupplierSubCodes(supplierDetails.SupplierId, this.companyId);

            }
            else {
                this.isSupplierSelected = false;
                this.assestPurchaseOrderForm.get('Supplier').setValue(null);
                return false;
            }
        }
        else {
            this.assestPurchaseOrderForm.patchValue({
                "SupplierAddress": "",
                //  "DeliveryAddress":"",
                "SupplierCode": "",
                "ShippingFax": "",
                "IsGstRequired": false,
                "SupplierTypeID": 2

            });

            this.isSupplierSelected = false;
            this.assestPurchaseOrderForm.get('SupplierSubCodeId').clearValidators();
            this.assestPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
        }

    }
    subCodeChange(value: number) {
        let supplierCode = this.utilService.getSupplierCode(this.assestPurchaseOrderForm.get('Supplier').value.SupplierCode, '00');
        if (this.supplierSubCodes.length > 0 && value > 0) {
            let supplier = this.supplierSubCodes.find(s => s.SubCodeId == value);
            if (supplier) {
                let supplierCode = this.assestPurchaseOrderForm.get('Supplier').value.SupplierCode;
                this.assestPurchaseOrderForm.get('SupplierCode').setValue(this.utilService.getSupplierCode(supplierCode, supplier.SubCode));
            }
            else {
                this.assestPurchaseOrderForm.get('SupplierCode').setValue(supplierCode);
            }
        }
        else {
            this.assestPurchaseOrderForm.get('SupplierCode').setValue(supplierCode);
        }
    }
    /**
     * this method is used to format the content to be display in the autocomplete textbox after selection..
     */
    // assestInputFormater = (x: Assets) => x.AssetName;

    assestInputFormater = (x: AssetSubCategory) => x.AssetSubcategory;
    /**
     * this mehtod will be called when user gives contents to the  "item master" autocomplete...
     */
    assetSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                let selectedDepartmentId = this.assestPurchaseOrderForm.get('LocationId').value;
                if (term == "") {
                    let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
                    let fixedAssetId = itemGroupControl.controls[this.selectedRowId].get('FixedAssetPOItemId').value;
                    let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;
                    itemGroupControl.controls[this.selectedRowId].reset();
                    itemGroupControl.controls[this.selectedRowId].get('FixedAssetPOItemId').setValue(fixedAssetId);
                    itemGroupControl.controls[this.selectedRowId].get('TypeId').setValue(typeId);
                    if (this.TaxGroupId != 0) {
                        this.getTaxesByTaxGroupSupplierChange(this.TaxGroupId, this.selectedRowId);
                        itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(this.TaxID);
                        itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(this.TaxGroupId);
                    }
                    else {
                        itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(0);
                        itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(0);
                    }
                    return of([]);
                }
                return this.sharedServiceObj.getAssetSubcatgories({
                    searchKey: term,
                    companyId: this.companyId
                }).map((data: AssetSubCategory[]) => {
                    return this.getAssetsubcategory(data);

                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })

        );

    getAssetsubcategory(data: AssetSubCategory[]) {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AssetSubCategory>control.get('AssetSubCategory').value;
        });
        console.log(data);
        return data;
    }

    getSelectedItemsList(data: Assets[]) {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <Assets>control.get('AssetSubCategory').value;
            // if(item!=undefined)
            // {                 
            //     data = data.filter(i=>i.AssetId!=item.AssetId);
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
                    let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        let FixedAssetPOItemId = itemGroupControl.controls[this.selectedRowId].get('FixedAssetPOItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('FixedAssetPOItemId').setValue(FixedAssetPOItemId);
                        itemGroupControl.controls[this.selectedRowId].get('TypeId').setValue(typeId);
                        if (this.TaxGroupId != 0) {
                            this.getTaxesByTaxGroupSupplierChange(this.TaxGroupId, this.selectedRowId);
                            itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(this.TaxID);
                            itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(this.TaxGroupId);
                        }
                        else {
                            itemGroupControl.controls[this.selectedRowId].get('TaxID').setValue(0);
                            itemGroupControl.controls[this.selectedRowId].get('TaxGroupId').setValue(0);
                        }
                    }
                    return of([]);
                }

                return this.sharedServiceObj.getServicesByKey({
                    searchKey: term,
                    companyId: this.companyId,
                    categoryId: 1 //services
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
                    //}
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }

    getSelectedServicesList(data: AccountCodeMaster[]) {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCodeMaster>control.get('Service').value;
            // if(item!=undefined)
            // {                 
            //     data = data.filter(i=>i.AccountCodeId!=item.AccountCodeId);
            // }
        });
        console.log(data);
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
     * this method will be called on "assest" autocomplete value selection.
     */
    assestSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            AssetDescription: eventData.item.Description,
            MeasurementUnitID: eventData.item.MeasurementUnitID,
            AssetQty: 1,
            Unitprice: 0,
            Totalprice: 0,
            Discount: 0,
            TotalbefTax: 0,
            TaxTotal: 0,
            TaxGroupId: this.TaxGroupId,
            TaxID: this.TaxID
        });
    }

    serviceMasterSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            AssetDescription: eventData.item.Description,
            ItemName: eventData.item.AccountCodeName,
            MeasurementUnitID: 0,
            AssetQty: 1,
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
            'Sno': [0],
            'IsDetailed': [false],
            'FixedAssetPOItemId': 0,
            'AssetDescription': [""],
            //   'Asset':[null,Validators.required],
            'AssetSubCategory': [null],
            'Asset': [null],
            'TypeId': [1, Validators.required],
            "AssetQty": [0, [Validators.required, Validators.min(1)]],
            "Unitprice": [0, [Validators.required, Validators.min(0.00000001)]],
            "IsModified": false,
            "TaxID": [0, [Validators.required, Validators.min(1)]],
            "TaxGroupId": [0, [Validators.required, Validators.min(1)]],
            "Discount": [0, [Validators.required]],
            //"TotalTax":[0],
            "TaxTotal": [0],
            "TaxAmount": [0],
            // 'Service':["",Validators.required],
            'Service': [null],
            'Taxes': [],
            "Totalprice": [0],
            "TotalbefTax": [0],
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
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGridRows());
            let lastIndex = itemGroupControl.length - 1;
            this.setSerialNumber(lastIndex, false, true);
            itemGroupControl.controls[lastIndex].get('AssetSubCategory').setValidators([Validators.required]);
            itemGroupControl.controls[lastIndex].get('AssetSubCategory').updateValueAndValidity();
            if (this.supplierid > 0) {
                itemGroupControl.controls[lastIndex].get('TaxGroupId').setValue(this.TaxGroupId);
                itemGroupControl.controls[lastIndex].get('TaxID').setValue(this.TaxID);
                this.getTaxesByTaxGroupSupplierChange(this.TaxGroupId, lastIndex);
            }
        }
    }

    addGridItem1(noOfLines: number) {
        let itemGroupControl1 = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl1.push(this.initGridRows1());
        }
    }

    setSerialNumber(currentIndex: number, isDetailed: boolean, isEdit: boolean) {
        let lastParentSNos: number[] = [];
        let serialNumber: any = 0;
        if (isEdit == true) {
            let assetGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
            lastParentSNos = assetGroupControl.controls.filter((control, index) => control.get('IsDetailed').value != true && index < currentIndex).map((data) => data.get('Sno').value);
            if (lastParentSNos.length > 0) {
                let lastParentSerialNumber = Math.max.apply(null, lastParentSNos);
                let currentRecordSerialNumber = lastParentSerialNumber + 1;
                if (isDetailed == true) {
                    let lastParentIndexs: number[] = [];
                    assetGroupControl.controls.forEach((control, index) => {
                        if (control.get('IsDetailed').value != true && index < currentIndex) {
                            lastParentIndexs.push(index);
                        }
                    });
                    let lastParentIndex = Math.max.apply(null, lastParentIndexs);
                    serialNumber = lastParentSerialNumber + "." + (currentIndex - lastParentIndex);
                }
                else {
                    serialNumber = currentRecordSerialNumber;
                }
            }
            else {
                serialNumber = 1;
            }
            assetGroupControl.controls[currentIndex].get('Sno').setValue(serialNumber);
        }
        else {
            lastParentSNos = this.selectedPODetails.PurchaseOrderItems.filter((rec, index) => rec.IsDetailed != true && index < currentIndex).map((data) => data.Sno);
            if (lastParentSNos.length > 0) {
                let lastParentSerialNumber = Math.max.apply(null, lastParentSNos);
                let currentRecordSerialNumber = lastParentSerialNumber + 1;
                if (isDetailed == true) {
                    let lastParentIndexs: number[] = [];
                    this.selectedPODetails.PurchaseOrderItems.forEach((rec, index) => {
                        if (rec.IsDetailed != true && index < currentIndex) {
                            lastParentIndexs.push(index);
                        }
                    });
                    let lastParentIndex = Math.max.apply(null, lastParentIndexs);
                    serialNumber = lastParentSerialNumber + "." + (currentIndex - lastParentIndex);
                }
                else {
                    serialNumber = currentRecordSerialNumber;
                }
            }
            else {
                serialNumber = 1;
            }
            this.selectedPODetails.PurchaseOrderItems[currentIndex].Sno = serialNumber;
        }
    }
    /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex: number) {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        let assetPoItemId = itemGroupControl.controls[rowIndex].get('FixedAssetPOItemId').value;
        if (assetPoItemId > 0) {
            this.deletedPurchaseOrderItems.push(assetPoItemId);
        }
        itemGroupControl.removeAt(rowIndex);
        if (itemGroupControl.controls.length == 0)
            this.addGridItem(1);
        this.calculateTotalPrice();
        this.onIsDetailedCheck();//calling this function to reset serial numbers for each record

    }

    /**
     * to hide the category details and show in add mode..
     */
    addRecord() {
        console.log("currencies", this.currencies, this.currencies[0]);
        //setting this variable to false so as to show the purchase order details in edit mode
        this.hideText = false;
        this.hideInput = true;
        this.isAddMode = true;
        this.isEditMode = false;
        this.isSupplierSelected = false;
        this.linesToAdd = 2;
        this.selectedPODetails = new FixedAssetDetails();
        this.clearForm();
        this.getCompanyDetails(this.companyId);
        this.addGridItem(this.linesToAdd);
        //this.showFullScreen();
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
        let status: boolean = true;
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        let itemGroupQuotationControl = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
        if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
            this.showGridErrorMessage = true;
        }
        if (itemGroupControl != undefined) {
            for (let i = 0; i < itemGroupControl.length; i++) {
                let total = (itemGroupControl.controls[i].get('AssetQty').value * itemGroupControl.controls[i].get('Unitprice').value) + (itemGroupControl.controls[i].get('TaxTotal').value);
                let discount = itemGroupControl.controls[i].get('Discount').value;
                if (total < discount) {
                    itemGroupControl.controls[i].get('Discount').setValidators([Validators.required]);
                    itemGroupControl.controls[i].get('Discount').updateValueAndValidity();
                    return;
                }
            }
        }
        let purchaseOrderFormStatus = this.assestPurchaseOrderForm.status;
        let RemarksControl = this.assestPurchaseOrderForm.get('RemarksQuotation');
        if (this.selectedPODetails.FixedAssetPurchaseOrderId > 0 && this.hideText == true) {
            RemarksControl.setValue(this.selectedPODetails.RemarksQuotation);
        }
        if (action == 'send') {
            if (this.selectedPODetails.APOQuotationItem == undefined) {
                this.selectedPODetails.APOQuotationItem = [];
                this.selectedPODetails.APOQuotationItem.length = 0;
                this.selectedPODetails.APOQuotationAttachment = [];
                this.selectedPODetails.APOQuotationAttachment.length = 0;
            }

            if (((this.selectedPODetails.APOQuotationItem.length < 3 && this.hideText == true) || (itemGroupQuotationControl.length < 3 && this.hideText != true))) {
                if (RemarksControl.value == "" || RemarksControl.value == null) {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.QuotationAttachmentForPO,
                        MessageType: MessageTypes.NoChange
                    });
                    return;
                }
            }
            if (itemGroupQuotationControl.length != 0 || this.selectedPODetails.APOQuotationItem.length != 0) {
                if (this.selectedPODetails.APOQuotationItem.length > 0 && this.hideText == true) {
                    count = this.selectedPODetails.APOQuotationItem.length;
                }
                else {
                    count = itemGroupQuotationControl.length;
                }
                let attCount = 0;
                if (count > 0) {
                    for (let i = 0; i < count; i++) {
                        if ((this.selectedPODetails.APOQuotationAttachment != undefined &&
                            this.selectedPODetails.APOQuotationAttachment.findIndex(j => j.RowId == i && j.IsDelete != true) > -1)
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

            if ((this.selectedPODetails.APOQuotationItem.length >= 3 || itemGroupQuotationControl.length >= 3) && (RemarksControl.value == "" || RemarksControl.value == null)) {
                if (this.selectedPODetails.APOQuotationAttachment.length > 0) {
                    for (let i = 0; i < this.selectedPODetails.APOQuotationAttachment.length; i++) {
                        if (uniqueNames.indexOf(this.selectedPODetails.APOQuotationAttachment[i].RowId) === -1) {
                            uniqueNames.push(this.selectedPODetails.APOQuotationAttachment[i].RowId);
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



        if (action == 'send' && this.hideText == true && this.selectedPODetails.FixedAssetPurchaseOrderId > 0) {
            let workFlowDetails =
            {
                TotalAmount: this.selectedPODetails.TotalAmount,
                FixedAssetPurchaseOrderId: this.selectedPODetails.FixedAssetPurchaseOrderId,
                CreatedBy: this.selectedPODetails.CreatedBy,
                FixedAssetPurchaseOrderCode: this.selectedPODetails.FixedAssetPurchaseOrderCode,
                WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
                CompanyId: this.selectedPODetails.CompanyId,
                LocationId: this.selectedPODetails.LocationId,
                PurchaseOrderStatusId: this.selectedPODetails.WorkFlowStatusId,
                RemarksQuotation: this.selectedPODetails.RemarksQuotation
            };
            HideFullScreen(null);
            this.fixedAssetPoCreationObj.sendForApproval(workFlowDetails)
                .subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.SentForApproval,
                        MessageType: MessageTypes.Success
                    });
                    this.sharedServiceObj.PoDraftVisible = false;
                    this.readListView.emit({ PoId: workFlowDetails.FixedAssetPurchaseOrderId, PotypeId: PurchaseOrderType.FixedAssetPo });
                    if (this.sharedServiceObj.PORecordslength == 0) {
                        this.hideFullScreen();
                    }
                });
            return;
        }

        if (purchaseOrderFormStatus != "INVALID") {
            let fixedAssetDetails: FixedAssetDetails = this.assestPurchaseOrderForm.value;
            fixedAssetDetails.IsGstBeforeDiscount = fixedAssetDetails.IsGstBeforeDiscount == null ? false : fixedAssetDetails.IsGstBeforeDiscount;
            fixedAssetDetails.DeliveryTermId = 0;
            fixedAssetDetails["ExpectedDeliveryDate"] = this.reqDateFormatPipe.transform(fixedAssetDetails.ExpectedDeliveryDate);
            if (fixedAssetDetails.Discount == null) {
                fixedAssetDetails.Discount = 0;
            }
            if (fixedAssetDetails.ShippingCharges == null) {
                fixedAssetDetails.ShippingCharges = 0;
            }
            if (fixedAssetDetails.OtherCharges == null) {
                fixedAssetDetails.OtherCharges = 0;
            }
            if (fixedAssetDetails.TotalAmount == null) {
                fixedAssetDetails.TotalAmount = 0;
            }
            if (fixedAssetDetails.TaxRate == null) {
                fixedAssetDetails.TaxRate = 0;
            }
            if (fixedAssetDetails.TaxTotal == null) {
                fixedAssetDetails.TaxTotal = 0;
            }
            fixedAssetDetails.PurchaseOrderItems.forEach(i => {
                if (i.FixedAssetPOItemId > 0) {
                    let previousRecord = this.selectedPODetails.PurchaseOrderItems.find(j => j.FixedAssetPOItemId == i.FixedAssetPOItemId);

                    if (i.AssetSubCategory.AssetSubcategoryId != previousRecord.AssetSubCategory.AssetSubcategoryId ||
                        (i.AssetSubCategory.AssetSubcategoryId == 0 && (i.AssetSubCategory.AssetSubcategory != previousRecord.AssetSubCategory.AssetSubcategory)) ||
                        i.AssetDescription != previousRecord.AssetDescription ||
                        i.AssetQty != previousRecord.AssetQty ||
                        i.Unitprice != previousRecord.Unitprice ||
                        i.Discount != previousRecord.Discount ||
                        i.TaxID != previousRecord.TaxID || i.IsDetailed != previousRecord.IsDetailed) {

                        i.IsModified = true;
                    }
                }
                else {
                    i.FixedAssetPOItemId = 0;
                }
                if (i.IsDetailed == null) {
                    i.IsDetailed = false;
                }
            });
            fixedAssetDetails.APOQuotationItem.forEach(i => {
                if (i.QuotationId > 0) {
                    let previousRecord = this.selectedPODetails.APOQuotationItem.find(j => j.QuotationId == i.QuotationId);
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


            fixedAssetDetails.PurchaseOrderItems = fixedAssetDetails.PurchaseOrderItems.filter(i => i.FixedAssetPOItemId == 0 || i.FixedAssetPOItemId == null || i.IsModified == true);
            fixedAssetDetails.APOQuotationItem = fixedAssetDetails.APOQuotationItem.filter(i => i.QuotationId == 0 || i.QuotationId == null || i.IsModified == true);

            fixedAssetDetails.POTypeId = PurchaseOrderType.FixedAssetPo;
            let userDetails = <UserDetails>this.sessionService.getUser();
            fixedAssetDetails.RequestedBy = userDetails.UserID;
            fixedAssetDetails.CreatedBy = userDetails.UserID;
            fixedAssetDetails.CompanyId = this.companyId;
            fixedAssetDetails.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
            HideFullScreen(null);
            if (this.selectedPODetails.FixedAssetPurchaseOrderId == 0 || this.selectedPODetails.FixedAssetPurchaseOrderId == null) {
                this.fixedAssetPoCreationObj.createPurchaseOrder(fixedAssetDetails, this.uploadedFiles, this.quotationUploadedFiles)
                    .subscribe((purchaseOrderId: number) => {
                        this.readListView.emit({ PoId: 0, PotypeId: 0 });
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.sharedServiceObj.PoDraftVisible = true;
                        this.hideText = true;
                        this.hideInput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.quotationUploadedFiles.length = 0;
                        this.quotationUploadedFiles = [];
                        this.recordInEditMode = -1;
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage2 = false;

                    });
            }
            else {
                fixedAssetDetails.FixedAssetPurchaseOrderId = this.selectedPODetails.FixedAssetPurchaseOrderId;
                fixedAssetDetails.PurchaseOrderItemsToDelete = this.deletedPurchaseOrderItems;
                fixedAssetDetails.Attachments = this.selectedPODetails.Attachments.filter(i => i.IsDelete == true);
                fixedAssetDetails.APOQuotationItemToDelete = this.deletedAPOQuotationItems;
                fixedAssetDetails.APOQuotationAttachmentDelete = this.selectedPODetails.APOQuotationAttachmentDelete;
                fixedAssetDetails.APOQuotationAttachmentUpdateRowId = this.selectedPODetails.APOQuotationAttachmentUpdateRowId;
                this.fixedAssetPoCreationObj.updatePurchaseOrder(fixedAssetDetails, this.uploadedFiles, this.quotationUploadedFiles)
                    .subscribe((purchaseOrderId: number) => {
                        this.readListView.emit({ PoId: fixedAssetDetails.FixedAssetPurchaseOrderId, PotypeId: PurchaseOrderType.FixedAssetPo });
                        this.hideText = true;
                        this.hideInput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.deletedPurchaseOrderItems = [];
                        this.deletedPurchaseOrderItems.length = 0;
                        this.quotationUploadedFiles.length = 0;
                        this.quotationUploadedFiles = [];
                        this.deletedAPOQuotationItems.length = 0;
                        this.deletedAPOQuotationItems = [];
                        this.selectedPODetails.APOQuotationAttachmentDelete = [];
                        this.selectedPODetails.APOQuotationAttachmentDelete.length = 0;
                        this.recordInEditMode = -1;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.sharedServiceObj.PoDraftVisible = true;
                        this.showGridErrorMessage = false;
                        this.showGridErrorMessage2 = false;

                    });
            }
        }
        else {
            Object.keys(this.assestPurchaseOrderForm.controls).forEach((key: string) => {
                if (this.assestPurchaseOrderForm.controls[key].status == "INVALID" && this.assestPurchaseOrderForm.controls[key].touched == false) {
                    this.assestPurchaseOrderForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
            itemGroupControl.controls.forEach(controlObj => {
                Object.keys(controlObj["controls"]).forEach((key: string) => {
                    let itemGroupControl = controlObj.get(key);
                    if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
                        itemGroupControl.markAsTouched();
                    }
                });
            });
            let itemGroupControl1 = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
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
        // this.assestPurchaseOrderForm.reset();
        // this.assestPurchaseOrderForm.setErrors(null);
        // this.cancelChanges.emit(true);
        // this.showGridErrorMessage2 = false;
        // this.hideInput = false;
        // this.hideText = true;
        // this.uploadedFiles.length = 0;
        // this.uploadedFiles = [];
        // this.quotationUploadedFiles.length = 0;
        // this.quotationUploadedFiles = [];
        // this.selectedPODetails.APOQuotationAttachment = [];
        // this.selectedPODetails.APOQuotationAttachment.length = 0;
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
        let recordId = this.selectedPODetails.FixedAssetPurchaseOrderId;
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                this.fixedAssetPoCreationObj.deletePurchaseOrder(recordId, userDetails.UserID).subscribe((data) => {

                    this.readListView.emit({ PoId: 0, PotypeId: 0 });
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
        //setting this variable to false so as to show the category details in edit mode
        this.hideInput = true;
        this.hideText = false;
        this.isAddMode = false;
        this.isEditMode = true;
        //resetting the item category form.
        this.clearForm();
        this.addGridItem(this.selectedPODetails.PurchaseOrderItems.length);
        this.addGridItem1(this.selectedPODetails.APOQuotationItem.length);

        this.assestPurchaseOrderForm.patchValue(this.selectedPODetails);
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        for (let i = 0; i < itemGroupControl.length; i++) {
            this.getTaxesByTaxGroup(itemGroupControl.controls[i].get('TaxGroupId').value, i);
        }
        this.TaxGroupId = this.selectedPODetails.Supplier.TaxGroupId;
        this.TaxID = this.selectedPODetails.Supplier.TaxID;

        console.log(this.selectedPODetails.DeliveryAddress);
        //this.assestPurchaseOrderForm.get('DeliveryAddress').setValue(this.selectedPODetails.DeliveryAddress);
        this.assestPurchaseOrderForm.get('ExpectedDeliveryDate').setValue(new Date(this.selectedPODetails.ExpectedDeliveryDate));
        this.assestPurchaseOrderForm.get('SupplierTypeID').setValue(this.selectedPODetails.Supplier.SupplierTypeID == 1 ? "1" : "2");
        this.onSupplierChange();
        this.calculateTotalPrice();
        //this.showFullScreen();
        this.supplierid = this.selectedPODetails.Supplier.SupplierId;
        if (this.selectedPODetails.SupplierSubCodeId === null) {
            this.isSupplierSelected = true;
            this.assestPurchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
            this.assestPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
        }
        this.assestPurchaseOrderForm.get('SupplierAddress').setValue(this.selectedPODetails.SupplierAddress);
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
        let currencyId = this.assestPurchaseOrderForm.get('CurrencyId').value;
        this.selectedPODetails.CurrencySymbol = this.currencies.find(i => i.Id == currencyId).Symbol;
    }
    //to get the sub totalprice..
    getSubTotal() {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let subTotal = 0;
            itemGroupControl.controls.forEach(data => {
                subTotal = subTotal + ((data.get('AssetQty').value * data.get('Unitprice').value) + data.get('TaxTotal').value - data.get('Discount').value);
            });
            return subTotal;
        }
    }
    //to get total price
    getTotalPrice() {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let totalnewprice = 0;
            itemGroupControl.controls.forEach(data => {
                totalnewprice = (data.get('AssetQty').value * data.get('Unitprice').value);
                data.get('Totalprice').setValue(totalnewprice);
            });

        }
    }
    setTaxAmount(taxType: number, rowIndex: number) {
        this.checktax = true;
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        let taxAmount = 0;
        if (itemGroupControl.controls[rowIndex].get('Taxes').value.find(i => i.TaxId == taxType) != undefined) {
            taxAmount = itemGroupControl.controls[rowIndex].get('Taxes').value.find(i => i.TaxId == taxType).TaxAmount;
        }
        itemGroupControl.controls[rowIndex].get('TaxAmount').setValue(taxAmount);
        this.calculateTotalPrice();
        this.checktax = false;
    }
    getTaxTypesByTaxGroup(taxGroupId: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        if (this.checktax == false) {
            itemGroupControl.controls[rowIndex].get('TaxTotal').setValue(0);
            itemGroupControl.controls[rowIndex].get('TaxID').setValue(0);
        }
        this.getTaxesByTaxGroup(taxGroupId, rowIndex);
    }


    calculateTotalTax() {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            if (this.assestPurchaseOrderForm.get('IsGstBeforeDiscount').value == true) {
                itemGroupControl.controls.forEach(data => {
                    let itemTotal = (data.get('AssetQty').value * data.get('Unitprice').value) * (data.get('TaxAmount').value) / 100;
                    data.get('TaxTotal').setValue(itemTotal);
                });
            }
            else {
                itemGroupControl.controls.forEach(data => {
                    let itemTotal = ((data.get('AssetQty').value * data.get('Unitprice').value) - data.get('Discount').value) * (data.get('TaxAmount').value) / 100;
                    data.get('TaxTotal').setValue(itemTotal);
                });
            }
        }
    }


    onAssetTypeChange(itemType: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        let assetPoItemId = itemGroupControl.controls[rowIndex].get('FixedAssetPOItemId').value;
        if (assetPoItemId > 0) {
            this.deletedPurchaseOrderItems.push(assetPoItemId);
        }

        //itemGroupControl.removeAt(rowIndex);

        let sno = itemGroupControl.controls[rowIndex].get('Sno').value;
        let isDetailed = itemGroupControl.controls[rowIndex].get('IsDetailed').value;

        if (itemGroupControl.controls[rowIndex] != undefined) {
            itemGroupControl.controls[rowIndex].reset();
            itemGroupControl.controls[rowIndex].get('Sno').setValue(sno);
            itemGroupControl.controls[rowIndex].get('IsDetailed').setValue(isDetailed);
        }
        if (Number(itemType) === 1) {  //if asset....
            itemGroupControl.controls[rowIndex].get('Service').clearValidators();
            itemGroupControl.controls[rowIndex].get('Service').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('AssetSubCategory').setValidators([Validators.required]);
            itemGroupControl.controls[rowIndex].get('AssetSubCategory').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('AssetSubCategory').reset();
        }
        else {
            itemGroupControl.controls[rowIndex].get('AssetSubCategory').clearValidators();
            itemGroupControl.controls[rowIndex].get('AssetSubCategory').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('Service').setValidators([Validators.required]);
            itemGroupControl.controls[rowIndex].get('Service').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('Service').reset();
        }

        itemGroupControl.controls[rowIndex].get('TypeId').setValue(Number(itemType));
        itemGroupControl.controls[rowIndex].get('TaxGroupId').setValue(this.TaxGroupId);
        itemGroupControl.controls[rowIndex].get('TaxID').setValue(this.TaxID);
        this.getTaxesByTaxGroupSupplierChange(this.TaxGroupId, rowIndex);

    }
    //to get total price..
    calculateTotalPrice() {
        this.calculateTotalTax();
        let subTotal = this.getSubTotal();
        this.assestPurchaseOrderForm.get('SubTotal').setValue(subTotal);
        let discount = this.assestPurchaseOrderForm.get('Discount').value;
        let shippingCharges = this.assestPurchaseOrderForm.get('ShippingCharges').value;
        let OtherCharges = this.assestPurchaseOrderForm.get('OtherCharges').value;
        let totalTax = 0;
        let totalPrice = (subTotal - discount) + totalTax + shippingCharges + OtherCharges;
        this.assestPurchaseOrderForm.get('TotalAmount').setValue(totalPrice);
        totalTax = this.getTaxTotal();
        this.assestPurchaseOrderForm.get('TotalTax').setValue(totalTax);
        this.getTotalPrice();
        let priceSubTotal = 0;
        priceSubTotal = this.getPriceSubTotal();
        this.assestPurchaseOrderForm.get('PriceSubTotal').setValue(priceSubTotal);
        let discountSubTotal = 0;
        discountSubTotal = this.getDiscountSubTotal();
        this.assestPurchaseOrderForm.get('DiscountSubTotal').setValue(discountSubTotal);
        let totalbefTaxSubTotal = 0;
        totalbefTaxSubTotal = this.getTotalbefTaxSubTotal();
        this.assestPurchaseOrderForm.get('TotalbefTaxSubTotal').setValue(totalbefTaxSubTotal);
    }

    //Get Total before tax sub total
    getTotalbefTaxSubTotal() {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
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
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
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
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let priceSubTotal = 0;
            itemGroupControl.controls.forEach(data => {
                priceSubTotal = priceSubTotal + (data.get('AssetQty').value * data.get('Unitprice').value);
            });
            return priceSubTotal;
        }
    }

    getTaxTotal() {
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
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
                // return false;
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
            else if (event.field == "ItemTotal") {
                value1 = data1["AssetQty"] * data1["Unitprice"];
                value2 = data2["AssetQty"] * data2["Unitprice"];
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
    onPaymentTermChange(event: any) {
        let paymentTermId = this.assestPurchaseOrderForm.get('PaymentTermId').value;
        let description = "";
        if (this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId) != undefined) {
            description = this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).Description;
        }
        this.assestPurchaseOrderForm.get('PaymentTerms').setValue(description);
        if (paymentTermId > 0) {
            this.updateExpireDate();
        }
    }
    onPrintScreen(event: any) {
        let windowObj = event.view;
        this.fixedAssetPoCreationObj.printDetails(this.selectedPODetails.FixedAssetPurchaseOrderId).subscribe((data: string) => {

            PrintScreen(data, windowObj);
        });
    }
    onDeliveryTermChange() {
        let deliveryTermId = this.assestPurchaseOrderForm.get('DeliveryTermId').value;
        let description = "";
        if (this.deliveryTerms.find(i => i.DeliveryTermsId == deliveryTermId) != undefined) {
            description = this.deliveryTerms.find(i => i.DeliveryTermsId == deliveryTermId).Description;
        }
        this.assestPurchaseOrderForm.get('DeliveryTerm').setValue(description);
    }
    onIsDetailedCheck(isChecked?: boolean, rowId?: number) {
        let assetGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        assetGroupControl.controls.forEach((control, index) => {
            this.setSerialNumber(index, control.get('IsDetailed').value, true)
        });
        if (rowId != null) {
            let assetControl = assetGroupControl.controls[rowId].get('AssetSubCategory');
            let assetQtyControl = assetGroupControl.controls[rowId].get('AssetQty');
            let unitPriceControl = assetGroupControl.controls[rowId].get('Unitprice');
            let taxControl = assetGroupControl.controls[rowId].get('TaxID');
            let discountControl = assetGroupControl.controls[rowId].get('Discount');
            if (isChecked == true) {
                assetControl.setValidators(null);
                assetControl.setErrors(null);
                assetQtyControl.setValidators(null);
                assetQtyControl.setErrors(null);
                unitPriceControl.setValidators(null);
                unitPriceControl.setErrors(null);
                taxControl.setValidators(null);
                taxControl.setErrors(null);
                discountControl.setValidators(null);
                discountControl.setErrors(null);
            }
            else if (isChecked == false) {
                assetControl.setValidators(Validators.required);
                assetQtyControl.setValidators([Validators.required, Validators.min(1)]);
                unitPriceControl.setValidators([Validators.required, Validators.min(1)]);
                taxControl.setValidators([Validators.required]);
                discountControl.setValidators([Validators.required]);
            }
        }
    }
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
            remarks = this.assestPurchaseOrderForm.get('Remarks').value;
            remarks = (this.IsVerifier && status == WorkFlowStatus.Approved) ? "Verified" : remarks;
            if (status == WorkFlowStatus.AskedForClarification || status == WorkFlowStatus.WaitingForApproval) {
                if (remarks.trim() == "" || remarks.trim() == null) {
                    this.assestPurchaseOrderForm.get('Remarks').setErrors({ "required": true });
                    return;
                }
            }
        }
        else {
            remarks = rejectRemarks;
        }
        console.log(status);
        let statusObj: PoApprovalUpdateStatus = {
            StatusId: status,
            Remarks: remarks,
            ProcessId: WorkFlowProcess.FixedAssetPO,
            PoCode: this.selectedPODetails.FixedAssetPurchaseOrderCode,
            ApproverUserId: this.selectedPODetails.CurrentApproverUserId,
            CompanyId: this.selectedPODetails.CompanyId
        };
        this.updateStatus.emit(statusObj);
    }
    reject(remarks: string) {
        this.update(WorkFlowStatus.Rejected, remarks);
    }

    poInputFormatter = (x: PurchaseOrderRequestList) => x.PurchaseOrderRequestCode;
    poSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    this.clearForm();
                    this.addGridItem(this.linesToAdd);
                    this.selectedPODetails = new FixedAssetDetails();
                    return of([]);
                }
                return this.poReqServiceObj.getAllSearchPurchaseOrdersRequest({
                    Search: term,
                    WorkFlowStatusId: WorkFlowStatus.Approved,
                    POTypeId: PurchaseOrderType.FixedAssetPo,//to fetch only asset purchase order requests...
                    CompanyId: this.companyId
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
    onPOChange(event?: any) {
        let purchaseOrderDetails: PurchaseOrderRequestList;
        if (event != null && event != undefined) {
            purchaseOrderDetails = event.item;
        }
        if (purchaseOrderDetails != undefined) {
            this.poReqServiceObj.getPurchaseOrderRequestDetails(
                purchaseOrderDetails.PurchaseOrderRequestId,
                purchaseOrderDetails.POTypeId == PurchaseOrderType.InventoryPo ? WorkFlowProcess.InventoryPurchaseRequest : WorkFlowProcess.AssetPurchaseRequest
            )
                .subscribe((response: PurchaseOrderRequestDetails) => {
                    this.clearForm();
                    response.PurchaseOrderRequestItems.forEach(item => {
                        if (item.TypeId === ItemType.Asset) {
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
                    this.assestPurchaseOrderForm.patchValue({
                        SupplierTypeID: response.Supplier.SupplierTypeID.toString(),
                        POTypeId: response.POTypeId,
                        LocationId: response.LocationId,
                        Supplier: supplierDetails,
                        ExpectedDeliveryDate: new Date(response.ExpectedDeliveryDate),
                        VendorReferences: response.VendorReferences,
                        CurrencyId: response.CurrencyId,
                        SupplierAddress: response.Supplier.SupplierAddress,//
                        DeliveryAddress: response.DeliveryAddress,//
                        ShippingFax: response.Supplier.BillingFax,
                        CostOfServiceId: response.CostOfServiceId,//
                        Instructions: response.Instructions,
                        Justifications: response.Justifications,
                        PurchaseOrderItems: response.PurchaseOrderRequestItems.map(data => {
                            data["AssetQty"] = data.ItemQty;
                            data["AssetDescription"] = data.ItemDescription
                            return data;
                        }),
                        Discount: response.Discount,//
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
                        Reasons: response.Reasons,
                        Remarks: "",
                        TaxRate: response.TaxRate,
                        TotalTax: response.TotalTax,
                    });
                    console.log("purchase order details..", this.assestPurchaseOrderForm.value);
                });
        }
    }
    clearForm() {
        this.assestPurchaseOrderForm.reset();
        this.assestPurchaseOrderForm.setErrors(null);
        this.assestPurchaseOrderForm.get('Remarks').setErrors(null);
        this.assestPurchaseOrderForm.get('ExpectedDeliveryDate').setValue(new Date());
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        let itemGroupControl1 = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
        itemGroupControl1.controls = [];
        itemGroupControl1.controls.length = 0;
        this.supplierid = 0;
        this.TaxGroupId = 0;
        this.TaxID = 0;
        this.assestPurchaseOrderForm.patchValue({
            SupplierTypeID: "2",
            IsGstRequired: false,
            POTypeId: PurchaseOrderType.FixedAssetPo,
            CurrencyId: DEFAULT_CURRENCY_ID
        });
    }
    restrictMinus(e: any) {
        restrictMinus(e);
    }
    displayVoidPopUp(isVoid: boolean) {
        this.isVoid = isVoid;
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
        this.purchaseOrderCode = this.selectedPODetails.FixedAssetPurchaseOrderCode;
        this.showVoidPopUp = true;
    }
    onStatusUpdate(purchaseOrderId: number) {
        this.showVoidPopUp = false;
        this.readListView.emit({ PoId: purchaseOrderId, PotypeId: PurchaseOrderType.FixedAssetPo });
        // this.onRecordSelection(purchaseOrderId);
    }
    hideVoidPopUp(hidePopUp: boolean) {
        this.showVoidPopUp = false;
    }
    onDepChage(event: any, department: any) {
        // let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['PurchaseOrderItems'];
        // itemGroupControl.reset();
        this.deptId = event.target.value;
        this.getWorkFlowConfiguration(department.selectedOptions[0].label);
    }

    getWorkFlowConfiguration(deptName: String) {
        this.processId = 2;
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

    recallPoApproval() {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let poId = this.selectedPODetails.FixedAssetPurchaseOrderId;
        let approvalObj = {
            PurchaseOrderId: poId,
            POTypeId: this.selectedPODetails.POTypeId,
            CreatedBy: userDetails.UserID,
            PurchaseOrderCode: this.selectedPODetails.FixedAssetPurchaseOrderCode,
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
                this.readListView.emit({ PoId: poId, PotypeId: PurchaseOrderType.FixedAssetPo });
            });
    }
    updateExpireDate() {
        let expectedDeliveryDate: Date = this.assestPurchaseOrderForm.get('ExpectedDeliveryDate').value;
        let paymentTermId = this.assestPurchaseOrderForm.get('PaymentTermId').value;
        let noOfDays = 0;
        if (this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId) != undefined) {
            noOfDays = this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).NoOfDays;
        }
        if (expectedDeliveryDate != null && noOfDays >= 0) {
            this.assestPurchaseOrderForm.get('ExpectedDeliveryDate').setValue(new Date(new Date().getTime() + (noOfDays * 24 * 60 * 60 * 1000)));
        }
        else {
            this.assestPurchaseOrderForm.get('ExpectedDeliveryDate').setValue(null);
        }
    }

    // Quotation File Attachment

    onVendorFileClose(fileIndex: number) {
        this.quotationUploadedFiles = this.quotationUploadedFiles.filter((file, index) => index != fileIndex);
    }

    checkDuplicateFile(fileName: string, rowIndex: number): boolean {
        //let file = this.uploadedFiles.filter(i => i.name.toLowerCase() === fileName.toLowerCase())[0];
        if (this.isEditMode) {
            if (this.selectedPODetails.APOQuotationAttachment != null) {
                let uploadFile;
                let attchmentile = this.selectedPODetails.APOQuotationAttachment.filter(i => i.FileName.toLowerCase() === fileName.toLowerCase() && i.RowId === rowIndex)[0];
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
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
        itemGroupControl.controls[rowIndex].get('RowIndex').setValue(rowIndex);
    }

    onFileQuotationUploadChange(event: any) {
        let files: FileList = event.target.files;
        let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
        for (let i = 0; i < files.length; i++) {
            let fileItem = files.item(i);
            if (ValidateFileType(fileItem.name)) {
                if (!this.checkDuplicateFile(fileItem.name, this.selectedFileRowIndex)) {
                    this.quotationUploadedFiles.push({ File: fileItem, RowIndex: this.selectedFileRowIndex });
                    itemGroupControl.controls[this.selectedFileRowIndex].get('RowIndex').setValue(this.selectedFileRowIndex);
                    try {
                        let selectedRow = this.selectedPODetails.APOQuotationItem[this.selectedFileRowIndex];
                        if (selectedRow != undefined) {
                            if (selectedRow.QuotationId > 0) {
                                selectedRow.IsModified = true;
                                let itemGroupControl = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
                                itemGroupControl.controls[this.selectedFileRowIndex].get('IsModified').setValue(true);
                                this.selectedPODetails.APOQuotationItem = this.selectedPODetails.APOQuotationItem.filter((i, index) => index > -1);
                            }
                        }
                    }
                    catch (error) {
                    }
                }
            }
            else {
                return false;
                break;
            }
        }
    }


    APOQuotationAttachmentDelete(SelectedIndex: number) {
        // if (this.selectedPODetails.APOQuotationAttachmentDelete == null) {
        //     this.selectedPODetails.APOQuotationAttachmentDelete = [];
        // }
        let attachmentRecord = this.selectedPODetails.APOQuotationAttachment[SelectedIndex];
        //this.selectedPODetails.APOQuotationAttachmentDelete.push(this.selectedPODetails.APOQuotationAttachment[SelectedIndex]);
        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header: Messages.DeletePopupHeader,
            accept: () => {
                if (this.selectedPODetails.APOQuotationAttachmentDelete == null) {
                    this.selectedPODetails.APOQuotationAttachmentDelete = [];
                }
                this.selectedPODetails.APOQuotationAttachmentDelete.push(attachmentRecord);
                attachmentRecord.IsDelete = true;

                this.selectedPODetails.APOQuotationAttachment = this.selectedPODetails.APOQuotationAttachment.filter(i => i.IsDelete != true);
            },
            reject: () => {
            }
        });
    }



    removeSupplierGridItem(rowIndex: number) {

        //console.log("Delete is working",rowIndex);
        let attachmentRecord = null;
        let itemGroupVendorControl = <FormArray>this.assestPurchaseOrderForm.controls['APOQuotationItem'];
        let QuotationId = itemGroupVendorControl.controls[rowIndex].get('QuotationId').value;
        if (QuotationId > 0) {
            this.deletedAPOQuotationItems.push(QuotationId);

            this.selectedPODetails.APOQuotationAttachment.forEach(data => {

                if (data.RowId == rowIndex) {
                    data.IsDelete = true;
                    attachmentRecord = data;
                } else {
                    data.IsDelete = false;
                }

            });
            //console.log( this.quotationUploadedFiles);
            if (this.selectedPODetails.APOQuotationAttachmentDelete == null) {
                this.selectedPODetails.APOQuotationAttachmentDelete = [];
            }
            // this.selectedPODetails.QuotationAttachmentDelete.push(this.selectedPODetails.QuotationAttachment[rowIndex]);
            //this.selectedPODetails.APOQuotationAttachmentDelete=this.selectedPODetails.APOQuotationAttachment.filter(i => i.IsDelete == true);
            this.selectedPODetails.APOQuotationAttachmentDelete.push(attachmentRecord);
            this.selectedPODetails.APOQuotationAttachment = this.selectedPODetails.APOQuotationAttachment.filter(i => i.IsDelete != true).map((data, index) => {

                if (data.RowId > rowIndex) {
                    data.RowId = data.RowId - 1;
                }
                return data;
            });
            this.selectedPODetails.APOQuotationAttachmentUpdateRowId = this.selectedPODetails.APOQuotationAttachment;
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
        // console.log(this.selectedPODetails.APOQuotationAttachment);
        // console.log(this.selectedPODetails.APOQuotationAttachmentDelete);
    }




}
