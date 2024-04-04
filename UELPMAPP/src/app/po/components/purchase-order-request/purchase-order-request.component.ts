import { Component, OnInit, ViewChild, ElementRef, Renderer, AfterViewInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { SharedService } from "../../../shared/services/shared.service";
import { PagerConfig, Suppliers, ItemMaster, MessageTypes, WorkFlowStatus, UserDetails, Assets, WorkFlowProcess, PurchaseOrderType, Taxes, ItemType } from "../../../shared/models/shared.model";
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker, NgbDropdownConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { GridOperations, Messages, Currency, PaymentTerms } from "../../../shared/models/shared.model";
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { ValidateFileType, FullScreen, restrictMinus, getProcessId } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { MeasurementUnit } from '../../../inventory/models/uom.model';
import { Supplier } from '../../models/supplier';
import { PurchaseOrderRequestDetails, CostOfService, PurchaseOrderTypes, PurchaseOrderRequestDisplayResult, PurchaseOrderRequestList, PORFilterDisplayInput, PORSearch } from '../../models/purchase-order-request.model';
import { PurchaseOrderRequestService } from '../../services/purchase-order-request.service';
import { DeliveryTerms } from '../../models/delivery-terms.model';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { PurchaseOrderRequestApproval } from '../../models/purchase-order-request-approval.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/finally';
import { FixedAssetPurchaseOrderService } from '../../services/fixed-asset-purchase-order.service';
import { ExpenseMaster } from '../../models/expense-master.model';
import { ExpenseMasterService } from '../../services/expense-master.service';
import { AccountCodeAPIService } from '../../services/account-code-api.service';
import { AccountCodeMaster } from '../../models/account-code.model';

@Component({
    selector: 'app-purchase-order-request',
    templateUrl: './purchase-order-request.component.html',
    styleUrls: ['./purchase-order-request.component.css'],
    providers: [PurchaseOrderRequestService, FixedAssetPurchaseOrderService, ExpenseMasterService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class PurchaseOrderRequestComponent implements OnInit, AfterViewInit {
    purchaseOrdersRequestList: Array<PurchaseOrderRequestList> = [];
    purchaseOrderRequestPagerConfig: PagerConfig;
    PurchaseOrderRequestItemsGridConfig: PagerConfig;
    WorkFlowParameterlist: WorkFlowParameter;
    purchaseOrderRequestForm: FormGroup;
    selectedPORequestDetails: PurchaseOrderRequestDetails;
    purchaseOrderTypes: Array<PurchaseOrderTypes> = [];
    suppliers: Suppliers[] = [];
    currencies: Currency[] = [];
    departments: Location[] = [];
    PurchaseOrderRequestId: number = 0;
    gridColumns: Array<{ field: string, header: string }> = [];
    gridVendorColumns: Array<{ field: string, header: string }> = [];
    recordInEditMode: number;
    operation: string;
    costOfServiceType: CostOfService[] = [];
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    hideQuotation?: boolean = null;
    vendoruploadedFiles: Array<{ File: File, RowIndex: number }> = [];
    uploadedFiles: Array<File> = [];
    leftsection: boolean = false;
    rightsection: boolean = false;
    slideactive: boolean = false;
    showGridErrorMessage: boolean = false;
    showGridVendorErrorMessage: boolean = false;
    scrollbarOptions: any;
    filteredSuppliers = [];
    initDone = false;
    initSettingsDone = true;
    isFilterApplied: boolean = false;
    porFilterInfoForm: FormGroup;
    filterMessage: string = "";
    purchaseOrderRequestSearchKey: string;
    apiEndPoint: string;
    hideLeftPanel: boolean = false;
    linesToAdd: number = 2;
    linesToAdd1: number = 2;
    paymentTerms: PaymentTerms[] = [];
    deliveryTerms: DeliveryTerms[] = [];
    measurementUnits: MeasurementUnit[] = [];
    deletedPurchaseOrderRequestItems: Array<number> = [];
    deletedPurchaseOrderRequestVendorItems: Array<number> = [];
    selectedFileRowIndex: number = 1;
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    selectedRowId: number = -1;
    selectedSupplierRowId: number = -1;
    companyId: number = 0;
    taxTypes: Array<Taxes> = [];
    returnUrl: string;
    accountCodeCategories = [];
    allAccountCodeCategories = [];
    showLeftPanelLoadingIcon: boolean = false;
    showRightPanelLoadingIcon: boolean = false;
    errorMessage: string = Messages.NoRecordsToDisplay;
    @ViewChild('instructions') instructionsRef: ElementRef;
    @ViewChild('justifications') justificationsRef: ElementRef;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('porCode') private porCodeRef: any;
    purchaseOrderType;
    accountCategoryId: any;
    itemType: ItemType;
    isTypeSelected: boolean = false;
    workFlowStatus:any;
    public innerWidth: any;
    constructor(private purchaseOrderRequestObj: PurchaseOrderRequestService,
        private formBuilderObj: FormBuilder,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        private reqDateFormatPipe: RequestDateFormatPipe,
        private modalService: NgbModal,
        private renderer: Renderer,
        public route: ActivatedRoute,
        private router: Router,
        config: NgbDropdownConfig,
        public sessionService: SessionStorageService,
        public activatedRoute: ActivatedRoute,
        private fixedAssetPoCreationObj: FixedAssetPurchaseOrderService,
        private expenseMasterObj: ExpenseMasterService,
        private accountCodeAPIService: AccountCodeAPIService,) {
        this.gridColumns = [
            { field: 'IsDetailed', header: 'Is Detailed' },
            { field: 'Sno', header: 'S.no.' },
            { field: 'AccountCodeName', header: 'Category' },
            { field: 'Name', header: 'Item' },
            { field: 'ItemDescription', header: 'Description' },
            { field: 'MeasurementUnitID', header: 'UOM' },
            { field: 'ItemQty', header: 'Qty' },
            { field: 'Unitprice', header: 'Price' },
            { field: 'GstType', header: 'Tax Name' },
            { field: 'GstAmount', header: 'Tax Amount' },
            { field: 'ItemTotal', header: 'Total' }
        ];
        this.gridVendorColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'Name', header: 'Supplier Name' },
            { field: 'QuotationAmount', header: 'Quotation Amount' },
            { field: 'IsSelected', header: '' },
            { field: 'Attachment', header: 'Attachment' }
        ];
        this.apiEndPoint = environment.apiEndpoint;
        this.initDone = true;
        this.sharedServiceObj.deliveryAddress$.subscribe((data) => {

            this.purchaseOrderRequestForm.patchValue({

                "DeliveryAddress": data,

            });
        }
        );

        this.companyId = this.sessionService.getCompanyId();
        this.purchaseOrderType = PurchaseOrderType;
        this.workFlowStatus = WorkFlowStatus;
    }
    ngAfterViewInit() {

    }

    ngOnInit() {
        if (this.porCodeRef != undefined) {
            let result = this.porCodeRef.nativeElement().value;
        }
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        let userid = userDetails.UserID;
        this.purchaseOrderRequestPagerConfig = new PagerConfig();
        this.purchaseOrderRequestPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderRequestPagerConfig.RecordsToFetch = 10;

        this.PurchaseOrderRequestItemsGridConfig = new PagerConfig();
        this.PurchaseOrderRequestItemsGridConfig.RecordsToSkip = 0;
        this.PurchaseOrderRequestItemsGridConfig.RecordsToFetch = 20;

        this.WorkFlowParameterlist = new WorkFlowParameter();
        this.selectedPORequestDetails = new PurchaseOrderRequestDetails();
        this.purchaseOrderRequestForm = this.formBuilderObj.group({
            'SupplierTypeID': [1, { validators: [Validators.required] }],
            'POTypeId': [0, [Validators.required]],
            'LocationId': [0, [Validators.required]],
            'Supplier': [0],
            'ExpectedDeliveryDate': [null],
            'VendorReferences': [""],
            'CurrencyId': [0, [Validators.required]],
            'SupplierAddress': [{ value: "", disabled: true }],
            'DeliveryAddress': [""],
            'BillingFax': [{ value: "", disabled: true }],
            'CostOfServiceId': [0, Validators.required],
            'Instructions': [""],
            'Justifications': [""],
            'PurchaseOrderRequestItems': this.formBuilderObj.array([]),
            'PurchaseOrderRequestVendorItems': this.formBuilderObj.array([]),
            'Discount': [0],
            
            //'TaxRate': [0],
            //'TotalTax': [0],
            'OtherCharges': [0],
            'ShippingCharges': [0],
            'SubTotal': [0],
            'TotalAmount': [0],
            'IsGstRequired': [false],
            'PaymentTermId': [0, Validators.required],
            'PaymentTerms': [{ value: "", disabled: true }],
            'DeliveryTermId': [0, Validators.required],
            'DeliveryTerm': [{ value: "", disabled: true }],
            "Reasons": ["", [Validators.required]],
            "WorkFlowStatusText": [""],
            "remarks": [""],
            "PurchaseOrderRequestId": [0],
            "QuotationRequestRemarks": [""]
        });
        this.porFilterInfoForm = this.formBuilderObj.group({
            PORCode: [''],
            SupplierCategory: ['']
        });

        this.sharedServiceObj.getTaxGroups(0)
            .subscribe((data: Taxes[]) => {
                this.taxTypes = data;
            });

        //getting the purchase order types.
        this.purchaseOrderRequestObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                this.purchaseOrderTypes = data.filter(x => x.PurchaseOrderTypeId == PurchaseOrderType.InventoryPo
                    || x.PurchaseOrderTypeId == PurchaseOrderType.FixedAssetPo
                    || x.PurchaseOrderTypeId == PurchaseOrderType.ExpensePo);// inventory po and asset po
         if(this.purchaseOrderTypes.length > 0){
             this.purchaseOrderRequestForm.get('POTypeId').setValue(this.purchaseOrderTypes[0].PurchaseOrderTypeId);   
           }             
            });
        //getting the list of cost of service types.
        this.purchaseOrderRequestObj.getCostOfServiceTypes()
            .subscribe((data: CostOfService[]) => {
                this.costOfServiceType = data;
            });
        // this.sharedServiceObj.getAllDepartments()
        //     .subscribe((data: Location[]) => {
        //         this.departments = data;
        //     });
         this.getDepartments(this.companyId);
        this.sharedServiceObj.getCurrencies()
            .subscribe((data: Currency[]) => {
                this.currencies = data;

            });
        this.operation = GridOperations.Display;
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                this.getDepartments(this.companyId);
                this.getPurchaseOrdersRequest(0);
            });
        this.getPaymentTerms();
        this.getMeasurementUnits();
        this.getDeliveryTerms();
        this.getAccountCodeCategories();
        this.activatedRoute.queryParamMap.subscribe((data) => {
            this.purchaseOrderRequestSearchKey = this.activatedRoute.snapshot.paramMap.get('code');
            let poId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
            if (isNaN(poId) == false && poId > 0) {
                let processId = Number(this.activatedRoute.snapshot.queryParamMap.get('processId'));
                this.getAllSearchPurchaseOrderRequest("", poId, isNaN(processId) ? 0 : processId);
            }
            else {
                this.getPurchaseOrdersRequest(0);
            }
        });
    }

    getDepartments(companyId: number) {
        this.sharedServiceObj.getDepartmentsByCompany(companyId)
            .subscribe((data: Location[]) => {
                this.departments = data;
            });
    }
    //this method is used to format the content to be display in the autocomplete textbox after selection..
    supplierInputFormater = (x: Suppliers) => x.SupplierName;
    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    this.purchaseOrderRequestForm.patchValue({
                        "SupplierAddress": "",
                        "BillingFax": "",
                        "DeliveryAddress": ""
                    });
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
    supplierItemSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestVendorItems'];
                    itemGroupControl.controls[this.selectedSupplierRowId].reset();
                    return of([]);
                }
                return this.sharedServiceObj.getSuppliers({
                    searchKey: term,
                    supplierTypeId: 0
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
        );
    /**
     * this method is used to format the content to be display in the autocomplete textbox after selection..
     */
    assestInputFormater = (x: Assets) => x.AssetName;
    /**
     * this mehtod will be called when user gives contents to the  "item master" autocomplete...
     */
    assetSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                let selectedDepartmentId = this.purchaseOrderRequestForm.get('LocationId').value;
                if (term == "") {
                    let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        let fixedAssetId = itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderRequestItemId').value;
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderRequestItemId').setValue(fixedAssetId);
                    }
                    return of([]);
                }
                return this.fixedAssetPoCreationObj.getAssets({
                    searchKey: term,
                    LocationID: selectedDepartmentId
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );

    onDepChage(event:any)
    {
        // if(this.purchaseOrderRequestForm.get('POTypeId').value==PurchaseOrderType.InventoryPo)
        // {
        //     let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        //     itemGroupControl.reset();
        // }
    }
    /**
     * this method will be called on "assest" autocomplete value selection.
     */
    assestSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            ItemDescription: eventData.item.Description,
            ItemQty: 1,
            Unitprice:0,
            TaxAmount:0,          
            TaxTotal:0
        });
    }

    /**
     * this method is used to format the content to be display in the autocomplete textbox after selection..
    */
    //expenseInputFormater = (x: ExpenseMaster) => x.ExpensesDetail;
    
    expenseInputFormater = (x: AccountCodeMaster) => x.Code;
    /**
     * this mehtod will be called when user gives contents to the  "expense search" autocomplete...
     */
   
        expenseSearch = (text$: Observable<string>) =>{  
            let typeId = 0;    
            if(text$==undefined)
             {
                return of([]);
             }
             return text$.pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap((term) =>{                  
                        if(term=="")
                        {
                           let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
                           if(itemGroupControl.controls[this.selectedRowId]!=undefined)
                           {
                            let purchaseOrderRequestItemId = itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderRequestItemId').value;
                            typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;  
                            
                            itemGroupControl.controls[this.selectedRowId].reset();
                            itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderRequestItemId').setValue(purchaseOrderRequestItemId);
                            itemGroupControl.controls[this.selectedRowId].get('TypeId').setValue(typeId);
                             
                           }
                           return of([]);
                        }
                        
                        return this.sharedServiceObj.getServicesByKey({                    
                            searchKey:term,
                            companyId:this.companyId,
                            categoryId: this.accountCategoryId
                        }).map((data:AccountCodeMaster[])=>{
                            if(data==null||data.length==0)
                            {
                                let objAccountCode:AccountCodeMaster = {
                                    AccountCodeId:0,
                                    AccountCodeCategoryId:0,
                                    AccountType:'',       
                                    Code:'',                        
                                    AccountCodeName:term,                                
                                    Description:"",
                                    AccountCodeCategoryName:""                                
                                };
                                return [objAccountCode];
                            }
                            else
                            {
                                return data;
                            }
                        }).pipe(
                        catchError(() => {
    
                            return of([]);
                        }))
                    })
        );
    }
    /**
     * this method will be called on "assest" autocomplete value selection.
     */
    expenseSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            ItemDescription: eventData.item.Description,
            ItemQty: 1,
            Unitprice:0,
            TaxAmount:0,          
            TaxTotal:0
        });
    }
    getAccountCodeCategories(): void {
        let accountCodeCategoriesResult = <Observable<Array<any>>>this.accountCodeAPIService.getAllAccountCodeCategories();
        accountCodeCategoriesResult.subscribe((data) => {
          if (data != null) {
            this.accountCodeCategories = data;
            this.allAccountCodeCategories = data;
          }
        });
      }
    onItemSupplierClick(rowId: number) {
        this.selectedSupplierRowId = rowId;
    }
    onItemClick(rowId: number) {
        this.selectedRowId = rowId;
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
        this.purchaseOrderRequestForm.get('Supplier').setValue(null);
    }
    getDeliveryTerms() {
        this.sharedServiceObj.getAllDeliveryTerms(this.sessionService.getCompanyId())
            .subscribe((data: DeliveryTerms[]) => {
                this.deliveryTerms = data;
            });
    }
    //to get  the purchase orders..
    getPurchaseOrdersRequest(PurchaseOrderRequestIdToBeSelected: number) {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.vendoruploadedFiles.length = 0;
        this.vendoruploadedFiles = [];
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput = {
            Skip: this.purchaseOrderRequestPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderRequestPagerConfig.RecordsToFetch,
            CompanyId: this.companyId
        };
        this.showLeftPanelLoadingIcon = true;
        this.purchaseOrderRequestObj.getPurchaseOrdersRequest(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderRequestDisplayResult) => {
                this.purchaseOrdersRequestList = data.PurchaseOrdersRequest;
                this.purchaseOrderRequestPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.purchaseOrdersRequestList.length > 0) {
                    if (PurchaseOrderRequestIdToBeSelected == 0) {
                        this.onRecordSelection(this.purchaseOrdersRequestList[0].PurchaseOrderRequestId, this.purchaseOrdersRequestList[0].POTypeId);
                    }
                    else {
                        this.onRecordSelection(PurchaseOrderRequestIdToBeSelected, this.purchaseOrdersRequestList.find(j => j.PurchaseOrderRequestId == PurchaseOrderRequestIdToBeSelected).POTypeId);
                    }
                }
                else {
                    this.addRecord();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    //to get list of purchase orders..
    getAllSearchPurchaseOrderRequest(searchKey: string, PurchaseOrderRequestIdToBeSelected: number, processId: number, poCode: string = "", supplierName: string = "") {
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.vendoruploadedFiles.length = 0;
        this.vendoruploadedFiles = [];
        //getting the list of purchase orders...
        let purchaseOrderDisplayInput:PORSearch = {
            Skip: this.purchaseOrderRequestPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderRequestPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId: this.companyId,
            ProcessId: processId,
            PurchaseOrderReqId: PurchaseOrderRequestIdToBeSelected,
            PORCodeFilter: poCode,
            SupplierNameFilter: supplierName
        };
        this.showLeftPanelLoadingIcon = true;
        this.purchaseOrderRequestObj.getAllSearchPurchaseOrdersRequest(purchaseOrderDisplayInput)
            .subscribe((data: PurchaseOrderRequestDisplayResult) => {
                this.showLeftPanelLoadingIcon = false;
                this.purchaseOrdersRequestList = data.PurchaseOrdersRequest;
                this.purchaseOrderRequestPagerConfig.TotalRecords = data.TotalRecords;
                if (this.purchaseOrdersRequestList.length > 0) {
                    if (PurchaseOrderRequestIdToBeSelected == 0) {
                        this.onRecordSelection(this.purchaseOrdersRequestList[0].PurchaseOrderRequestId, this.purchaseOrdersRequestList[0].POTypeId);
                    }
                    else {
                        this.onRecordSelection(PurchaseOrderRequestIdToBeSelected, this.purchaseOrdersRequestList.find(j => j.PurchaseOrderRequestId == PurchaseOrderRequestIdToBeSelected).POTypeId);
                    }
                }
                else {
                    this.addRecord();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    /**
     * this method will be called on purchase order record selection.
     */
    onRecordSelection(purchaseOrderRequestId: number, poTypeId: number) {       
        this.showRightPanelLoadingIcon = true;
        this.purchaseOrderRequestObj.getPurchaseOrderRequestDetails(purchaseOrderRequestId, getProcessId(poTypeId, true))
            .subscribe((data: PurchaseOrderRequestDetails) => {
                this.selectedPORequestDetails = data;               
                this.resetCategories(poTypeId);
                this.operation = GridOperations.Display;
                if (data.PurchaseOrderRequestVendorItems == null) {
                    data.PurchaseOrderRequestVendorItems = [];
                }
                if (data.POTypeId == PurchaseOrderType.FixedAssetPo) {
                    this.selectedPORequestDetails.PurchaseOrderRequestItems.forEach((data, index) => {
                        this.setSerialNumber(index, data.IsDetailed, false);
                    });
                    this.selectedPORequestDetails.PurchaseOrderRequestItems = this.selectedPORequestDetails.PurchaseOrderRequestItems.filter((data, index) => index > -1);
                }
                this.purchaseOrderRequestForm.patchValue(data);
                this.hidetext = true;
                this.hideinput = false;
                this.hideQuotation = true;
                this.showRightPanelLoadingIcon = false;
            }, (error) => {
                this.showRightPanelLoadingIcon = false;
            });

    }
    createQuotation() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '#/po/quotationrequest?id=22';
        this.router.navigateByUrl(this.returnUrl);
    }
    /**
     * this method will be called on the supplier dropdown change event.
     */

    onSupplierChange(event?: any) {

        let supplierDetails: Supplier;
        if (event != null && event != undefined) {
            supplierDetails = event.item;
        }
        else {
            supplierDetails = this.purchaseOrderRequestForm.get('Supplier').value;
        }
        if (supplierDetails != undefined) {
            this.purchaseOrderRequestForm.patchValue({
                "SupplierAddress": supplierDetails.BillingAddress1,
                "BillingFax": supplierDetails.BillingFax
            });
        }
        else {
            this.purchaseOrderRequestForm.patchValue({
                "SupplierAddress": "",
                "BillingFax": ""
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
    itemMasterSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                //let selectedDepartmentId = this.purchaseOrderRequestForm.get('LocationId').value;
                if (term == "")//||(selectedDepartmentId==0||selectedDepartmentId==null)) 
                {
                    let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
                    if (itemGroupControl.controls[this.selectedRowId] != undefined) {
                        let purchaseOrderRequestItemId = itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderRequestItemId').value;
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderRequestItemId').setValue(purchaseOrderRequestItemId);
                    }
                    return of([]);
                }
                return this.sharedServiceObj.getItemMasterByKey({
                    searchKey: term,
                    CompanyId:this.companyId,
                    LocationID: null   //selectedDepartmentId
                }).pipe(
                    catchError(() => {
                        return of([]);
                }));
            })
        );
    /**
     * this method will be called on "item master" autocomplete value selection.
     */
    itemMasterSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        //setting the existing qty based on user selection
        itemGroupControl.controls[index].patchValue({
            ItemDescription: eventData.item.Description,
            MeasurementUnitID: eventData.item.MeasurementUnitID,
            ItemQty: 1,
            Unitprice:0,
            TaxAmount:0,          
            TaxTotal:0
        });
    }

    initGridRows() {
        return this.formBuilderObj.group({
            'Sno': 0,
            'IsDetailed': false,
            'PurchaseOrderRequestItemId': 0,
            'ItemDescription': [""],
            'MeasurementUnitID': [0],
            'Item': [null],
            'Asset': [null],
            'Expense': [null],
            "ItemQty": [0, [Validators.required, Validators.min(1)]],
            "Unitprice": [0],
            "TaxID": [undefined, [Validators.required]],
            "TaxName": [""],
            "TaxAmount": [0],
            "TotalTax": [0],
            'Service': [null],
            "TypeId":[4],
            "IsModified": false
        });
    }

    initGridRows1() {
        return this.formBuilderObj.group({
            'QuotationId': 0,
            'QuotationSupplier': [null],
            'QuotatedAmount': [0],
            "IsModified": false,
        });
    }
    //adding row to the grid..
    addGridItem(noOfLines: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGridRows());
        }
        this.onIsDetailedCheck();
    }

    addVendorGridItem(noOfLines: number) {
        let itemGroupVendorControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestVendorItems'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupVendorControl.push(this.initGridRows1());
        }
    }
    /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        let PurchaseOrderRequestItemId = itemGroupControl.controls[rowIndex].get('PurchaseOrderRequestItemId').value;
        if (PurchaseOrderRequestItemId > 0) {
            this.deletedPurchaseOrderRequestItems.push(PurchaseOrderRequestItemId);
        }
        itemGroupControl.removeAt(rowIndex);
        this.calculateTotalPrice();
        this.onIsDetailedCheck();//calling this function to reset serial numbers for each record
    }

    removeVendorGridItem(rowIndex: number) {
        let itemGroupVendorControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestVendorItems'];
        let QuotationId = itemGroupVendorControl.controls[rowIndex].get('QuotationId').value;
        if (QuotationId > 0) {
            this.deletedPurchaseOrderRequestVendorItems.push(QuotationId);
        }
        itemGroupVendorControl.removeAt(rowIndex);
    }
    restrictMinus(e: any) {
        restrictMinus(e);
    }

    /**
     * to hide the category details and show in add mode..
     */
    addRecord() {
        //setting this variable to false so as to show the purchase order details in edit mode
        this.hidetext = false;
        this.hideinput = true;
        this.hideQuotation = false;
        this.selectedPORequestDetails = new PurchaseOrderRequestDetails();
        //resetting the purchase order form..
        this.purchaseOrderRequestForm.reset();
        this.purchaseOrderRequestForm.setErrors(null);
        this.purchaseOrderRequestForm.get('remarks').setErrors(null);
        this.purchaseOrderRequestForm.get('ExpectedDeliveryDate').setValue(new Date());
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        let itemGroupVendorControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestVendorItems'];
        itemGroupVendorControl.controls = [];
        itemGroupVendorControl.controls.length = 0;
        this.purchaseOrderRequestForm.patchValue({
            SupplierTypeID: "1",
            IsGstRequired: false,
            CurrencyId: this.currencies[0].Id
        });
        this.addGridItem(this.linesToAdd);
        //this.showFullScreen();
    }
    showFullScreen() {
 
this.innerWidth = window.innerWidth;       
if(this.innerWidth > 1000){  
        FullScreen(this.rightPanelRef.nativeElement);
}
 
    }
    hideFullScreen() {
        // this.hideLeftPanel = false;
        // this.sharedServiceObj.hideAppBar(false);//hiding the app bar..
    }
    /**
     * to save the given purchase order details
     */

    saveRecord(action: string) {     
        if (action == 'send' && this.hidetext == true && this.selectedPORequestDetails.PurchaseOrderRequestId > 0) {
            let check;
            if (this.selectedPORequestDetails.PurchaseOrderRequestVendorItems.length > 0) {
                check = this.selectedPORequestDetails.PurchaseOrderRequestVendorItems.filter(data => data.IsSelected == true).length;
            }
            else {
                check = 0;
            }

            if (check > 0) {
                let workFlowDetails =
                    {
                        TotalAmount: this.selectedPORequestDetails.TotalAmount,
                        PurchaseOrderRequestId: this.selectedPORequestDetails.PurchaseOrderRequestId,
                        CreatedBy: this.selectedPORequestDetails.CreatedBy,
                        PurchaseOrderRequestCode: this.selectedPORequestDetails.PurchaseOrderRequestCode,
                        WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
                        POTypeId: this.selectedPORequestDetails.POTypeId,
                        CompanyId: this.selectedPORequestDetails.CompanyId,
                        LocationId: this.selectedPORequestDetails.LocationId
                    };
                this.purchaseOrderRequestObj.sendForApproval(workFlowDetails)
                    .subscribe((data) => {

                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SentForApproval,
                            MessageType: MessageTypes.Success
                        });
                        this.getPurchaseOrdersRequest(workFlowDetails.PurchaseOrderRequestId);
                    });
            }
            else {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.QuotationSentForApproval,
                    MessageType: MessageTypes.NoChange
                });
            }
            return;
        }
        this.showGridErrorMessage = false;
        this.showGridVendorErrorMessage = false;
        let status: boolean = true;
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        let itemGroupVendorControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestVendorItems'];
        if (itemGroupControl == undefined || itemGroupControl.controls.length == 0) {
            this.showGridErrorMessage = true;
        }
        let purchaseOrderRequestFormStatus = this.purchaseOrderRequestForm.status;
      //  console.log(this.purchaseOrderRequestForm)
        if (purchaseOrderRequestFormStatus != "INVALID" && this.showGridErrorMessage == false) {
            //getting the purchase order form details...
            let purchaseOrderReqDetails: PurchaseOrderRequestDetails = this.purchaseOrderRequestForm.value;
            let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
            purchaseOrderReqDetails.RequestedBy = userDetails.UserID;
            purchaseOrderReqDetails.CreatedBy = userDetails.UserID;
            purchaseOrderReqDetails.CompanyId = this.sessionService.getCompanyId();
            purchaseOrderReqDetails["ExpectedDeliveryDate"] = this.reqDateFormatPipe.transform(purchaseOrderReqDetails.ExpectedDeliveryDate);
            if (purchaseOrderReqDetails.Discount == null) {
                purchaseOrderReqDetails.Discount = 0;
            }
            if (purchaseOrderReqDetails.ShippingCharges == null) {
                purchaseOrderReqDetails.ShippingCharges = 0;
            }
            if (purchaseOrderReqDetails.OtherCharges == null) {
                purchaseOrderReqDetails.OtherCharges = 0;
            }
            if (purchaseOrderReqDetails.TotalAmount == null) {
                purchaseOrderReqDetails.TotalAmount = 0;
            }
            if (purchaseOrderReqDetails.TaxRate == null) {
                purchaseOrderReqDetails.TaxRate = 0;
            }
            if (purchaseOrderReqDetails.TotalTax == null) {
                purchaseOrderReqDetails.TotalTax = 0;
            }
            purchaseOrderReqDetails.PurchaseOrderRequestItems.forEach(i => {
                i.Unitprice  = i.Unitprice==null?0:i.Unitprice
                if (i.PurchaseOrderRequestItemId > 0) {
                    let previousRecord = this.selectedPORequestDetails.PurchaseOrderRequestItems.find(j => j.PurchaseOrderRequestItemId == i.PurchaseOrderRequestItemId);

                    if (purchaseOrderReqDetails.POTypeId == PurchaseOrderType.InventoryPo) {
                        if (i.Item.ItemMasterId != previousRecord.Item.ItemMasterId ||
                            i.ItemDescription != previousRecord.ItemDescription ||
                            i.ItemQty != previousRecord.ItemQty ||
                            i.Unitprice != previousRecord.Unitprice ||
                            i.MeasurementUnitID != previousRecord.MeasurementUnitID) {
                            i.IsModified = true;
                        }
                    }
                    else if (purchaseOrderReqDetails.POTypeId == PurchaseOrderType.FixedAssetPo) {
                        if (i.Asset.AssetId != previousRecord.Asset.AssetId ||
                            i.ItemDescription != previousRecord.ItemDescription ||
                            i.ItemQty != previousRecord.ItemQty ||
                            i.Unitprice != previousRecord.Unitprice) {
                            i.IsModified = true;
                        }
                    }
                    else if (purchaseOrderReqDetails.POTypeId == PurchaseOrderType.ExpensePo) {
                        if (i.Expense.AccountCodeId != previousRecord.Expense.AccountCodeId ||
                            i.ItemDescription != previousRecord.ItemDescription ||
                            i.ItemQty != previousRecord.ItemQty ||
                            i.Unitprice != previousRecord.Unitprice) {
                            i.IsModified = true;
                        }
                    }
                }
                else {
                    i.PurchaseOrderRequestItemId = 0;
                }
                
            });
            purchaseOrderReqDetails.PurchaseOrderRequestVendorItems.forEach(i => {
                if (i.QuotationId > 0) {
                    let previousRecord1 = this.selectedPORequestDetails.PurchaseOrderRequestVendorItems.find(j => j.QuotationId == i.QuotationId);

                    if (i.QuotationSupplier.SupplierId != previousRecord1.QuotationSupplier.SupplierId ||
                        i.QuotatedAmount != previousRecord1.QuotatedAmount) {
                        i.IsModified = true;
                    }
                }
                else {
                    i.QuotationId = 0;
                }
            });
            purchaseOrderReqDetails.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
            purchaseOrderReqDetails.PurchaseOrderRequestItems = purchaseOrderReqDetails.PurchaseOrderRequestItems.filter(i => i.PurchaseOrderRequestItemId == 0 || i.PurchaseOrderRequestItemId == null || i.IsModified == true);
            purchaseOrderReqDetails.PurchaseOrderRequestVendorItems = purchaseOrderReqDetails.PurchaseOrderRequestVendorItems.filter(i => i.QuotationId == 0 || i.QuotationId == null || i.IsModified == true);
            if (this.selectedPORequestDetails.PurchaseOrderRequestId == 0 || this.selectedPORequestDetails.PurchaseOrderRequestId == null) {
                purchaseOrderReqDetails.PurchaseOrderRequestId = 0;
               // console.log(purchaseOrderReqDetails);
                this.purchaseOrderRequestObj.createPurchaseOrderRequest(purchaseOrderReqDetails, this.uploadedFiles, this.vendoruploadedFiles)
                    .subscribe((poRequestId: number) => {
                        if (poRequestId != null) {
                            this.hidetext = true;
                            this.hideinput = false;
                            this.hideQuotation = true;
                            this.uploadedFiles.length = 0;
                            this.uploadedFiles = [];
                            this.vendoruploadedFiles.length = 0;
                            this.vendoruploadedFiles = [];
                            this.recordInEditMode = -1;
                            this.getPurchaseOrdersRequest(poRequestId);
                            this.showGridErrorMessage = false;
                            this.showGridVendorErrorMessage = false;
                            this.hideFullScreen();
                            this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.SavedSuccessFully,
                                MessageType: MessageTypes.Success
                            });
                        }
                    });

            }
            else {
                purchaseOrderReqDetails.PurchaseOrderRequestId = this.selectedPORequestDetails.PurchaseOrderRequestId;
                purchaseOrderReqDetails.PurchaseOrderRequestItemsToDelete = this.deletedPurchaseOrderRequestItems;
                purchaseOrderReqDetails.PurchaseOrderRequestVendorItemsToDelete = this.deletedPurchaseOrderRequestVendorItems;
                purchaseOrderReqDetails.QuotationAttachment = this.selectedPORequestDetails.QuotationAttachment.filter(i => i.IsDelete == true);
                purchaseOrderReqDetails.QuotationAttachmentDelete = this.selectedPORequestDetails.QuotationAttachmentDelete;
                purchaseOrderReqDetails.AttachmentsDelete = this.selectedPORequestDetails.AttachmentsDelete;
                purchaseOrderReqDetails.Attachments = this.selectedPORequestDetails.Attachments.filter(i => i.IsDelete == true);
                this.purchaseOrderRequestObj.updatePurchaseOrderRequest(purchaseOrderReqDetails, this.uploadedFiles, this.vendoruploadedFiles)
                    .subscribe((response: any) => {
                        //if status is success then we will insert a new record into the array...
                        if (response) {
                            this.hidetext = true;
                            this.hideinput = false;
                            this.hideQuotation = true;
                            this.uploadedFiles.length = 0;
                            this.uploadedFiles = [];
                            this.vendoruploadedFiles.length = 0;
                            this.vendoruploadedFiles = [];
                            this.deletedPurchaseOrderRequestItems = [];
                            this.deletedPurchaseOrderRequestItems.length = 0;
                            this.deletedPurchaseOrderRequestVendorItems = [];
                            this.deletedPurchaseOrderRequestVendorItems.length = 0;
                            this.recordInEditMode = -1;
                            this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.UpdatedSuccessFully,
                                MessageType: MessageTypes.Success
                            });
                            this.getPurchaseOrdersRequest(purchaseOrderReqDetails.PurchaseOrderRequestId);
                            this.showGridErrorMessage = false;
                            this.showGridVendorErrorMessage = false;
                            this.hideFullScreen();
                        }
                    });
            }
        }
        else {
            Object.keys(this.purchaseOrderRequestForm.controls).forEach((key: string) => {
                if (this.purchaseOrderRequestForm.controls[key].status == "INVALID" && this.purchaseOrderRequestForm.controls[key].touched == false) {
                    this.purchaseOrderRequestForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
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
    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the purchase order details on cancel button click event..
     */
    cancelRecord() {
        //setting this variable to true so as to show the purchase details
        this.isTypeSelected = false;
        this.purchaseOrderRequestForm.reset();
        this.purchaseOrderRequestForm.setErrors(null);
        if (this.purchaseOrdersRequestList.length > 0 && this.selectedPORequestDetails != undefined) {
            if (this.selectedPORequestDetails.PurchaseOrderRequestId == undefined) {
                this.onRecordSelection(this.purchaseOrdersRequestList[0].PurchaseOrderRequestId, this.purchaseOrdersRequestList[0].POTypeId);
            }
            else {
                this.onRecordSelection(this.selectedPORequestDetails.PurchaseOrderRequestId, this.purchaseOrdersRequestList.find(j => j.PurchaseOrderRequestId == this.selectedPORequestDetails.PurchaseOrderRequestId).POTypeId);
            }
            //setting this variable to true so as to show the purchase details
            this.hideinput = false;
            this.hidetext = true;
            this.hideQuotation = true;
        }
        else {
            this.hideinput = null;
            this.hidetext = null;
            this.hideQuotation = null;
        }
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.vendoruploadedFiles.length = 0;
        this.vendoruploadedFiles = [];
        this.sharedServiceObj.hideAppBar(false);//showing the app bar..
        this.hideFullScreen();
    }
    /**
     * to delete the selected record...
     */
    deleteRecord() {
        let recordId = this.selectedPORequestDetails.PurchaseOrderRequestId;
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                this.purchaseOrderRequestObj.deletePurchaseOrderRequest(recordId, userDetails.UserID).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });
                    this.getPurchaseOrdersRequest(0);
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
        this.hideinput = true;
        this.hidetext = false;
        this.hideQuotation = true;
        //resetting the item category form.       
        this.purchaseOrderRequestForm.reset();
        this.purchaseOrderRequestForm.get('PurchaseOrderRequestItems').reset();
        this.purchaseOrderRequestForm.get('PurchaseOrderRequestVendorItems').reset();
        this.purchaseOrderRequestForm.get('remarks').setErrors(null);
        this.purchaseOrderRequestForm.setErrors(null);
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        let itemGroupVendorControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestVendorItems'];
        itemGroupVendorControl.controls = [];
        itemGroupVendorControl.controls.length = 0;
        this.addGridItem(this.selectedPORequestDetails.PurchaseOrderRequestItems.length);
        this.addVendorGridItem(this.selectedPORequestDetails.PurchaseOrderRequestVendorItems.length);
        this.purchaseOrderRequestForm.patchValue(this.selectedPORequestDetails);
        this.purchaseOrderRequestForm.get('ExpectedDeliveryDate').setValue(new Date(this.selectedPORequestDetails.ExpectedDeliveryDate));
        this.purchaseOrderRequestForm.get('SupplierTypeID').setValue(this.selectedPORequestDetails.Supplier.SupplierTypeID == 1 ? "1" : "2");
        this.onSupplierChange();
        this.calculateTotalPrice();
        //this.showFullScreen();

    }
    split() {
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
        let currencyId = this.purchaseOrderRequestForm.get('CurrencyId').value;
        this.selectedPORequestDetails.CurrencySymbol = this.currencies.find(i => i.Id == currencyId).Symbol;
    }
    //to get the sub totalprice..
    getSubTotal() {
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        if (itemGroupControl != undefined) {
            let subTotal = 0;
            itemGroupControl.controls.forEach(data => {
                subTotal = subTotal + (data.get('ItemQty').value * data.get('Unitprice').value) + data.get('TotalTax').value;
            });
            return subTotal;
        }
    }

    calculateTotalTax() {
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        if (itemGroupControl != undefined) {
            itemGroupControl.controls.forEach(data => {
                let itemTotal = (data.get('ItemQty').value * data.get('Unitprice').value) * (data.get('TaxAmount').value) / 100;
                data.get('TotalTax').setValue(itemTotal);
            });
        }
    }
    //getting the total tax..
    // getTotalTax(taxRate: number) {
    //     let totalTax = (this.getSubTotal() * taxRate) / 100;
    //     return totalTax;
    // }
    //to get total price..
    calculateTotalPrice() {
        this.calculateTotalTax();
        let subTotal = this.getSubTotal();
        this.purchaseOrderRequestForm.get('SubTotal').setValue(subTotal);
        let discount = this.purchaseOrderRequestForm.get('Discount').value;
        let shippingCharges = this.purchaseOrderRequestForm.get('ShippingCharges').value;
        let OtherCharges = this.purchaseOrderRequestForm.get('OtherCharges').value;
        let totalTax = 0;
        // let totalTax = this.getTotalTax(this.purchaseOrderRequestForm.get('TaxRate').value);
        // this.purchaseOrderRequestForm.get('TotalTax').setValue(totalTax);
        let totalPrice = (subTotal - discount) + totalTax + shippingCharges + OtherCharges;
        this.purchaseOrderRequestForm.get('TotalAmount').setValue(totalPrice);
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
                event.preventDefault();
                break;
            }
        }
    }

    onFileVendorUploadChange(event: any) {

        let files: FileList = event.target.files;
        for (let i = 0; i < files.length; i++) {
            let fileItem = files.item(i);
            if (ValidateFileType(fileItem.name)) {
                this.vendoruploadedFiles.push({ File: fileItem, RowIndex: this.selectedFileRowIndex });
                try {
                    let selectedRow = this.selectedPORequestDetails.PurchaseOrderRequestVendorItems[this.selectedFileRowIndex];
                    if (selectedRow.QuotationId > 0) {
                        selectedRow.IsModified = true;
                        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestVendorItems'];
                        itemGroupControl.controls[this.selectedFileRowIndex].get('IsModified').setValue(true);
                        this.selectedPORequestDetails.PurchaseOrderRequestVendorItems = this.selectedPORequestDetails.PurchaseOrderRequestVendorItems.filter((i, index) => index > -1);
                    }
                }
                catch (error) {
                }
            }
            else {
                event.preventDefault();
                break;
            }
        }
    }

    attachmentDelete(attachmentIndex: number) {
        let attachmentRecord1 = this.selectedPORequestDetails.Attachments[attachmentIndex];
        if (this.selectedPORequestDetails.AttachmentsDelete == null) {
            this.selectedPORequestDetails.AttachmentsDelete = [];
        }
        this.selectedPORequestDetails.AttachmentsDelete.push(attachmentRecord1);

        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let attachmentRecord = this.selectedPORequestDetails.Attachments[attachmentIndex];
                attachmentRecord.IsDelete = true;
                this.selectedPORequestDetails.Attachments = this.selectedPORequestDetails.Attachments.filter(i => i.IsDelete != true);
            },
            reject: () => {
            }
        });

    }

    quotationAttachmentDelete(SelectedIndex: number) {
        let attachmentRecord = this.selectedPORequestDetails.QuotationAttachment[SelectedIndex];
        if (this.selectedPORequestDetails.QuotationAttachmentDelete == null) {
            this.selectedPORequestDetails.QuotationAttachmentDelete = [];
        }
        this.selectedPORequestDetails.QuotationAttachmentDelete.push(this.selectedPORequestDetails.QuotationAttachment[SelectedIndex]);
        this.confirmationServiceObj.confirm({
            message: Messages.AttachmentDeleteConfirmation,
            header: Messages.DeletePopupHeader,
            accept: () => {
                attachmentRecord.IsDelete = true;
                this.selectedPORequestDetails.QuotationAttachment = this.selectedPORequestDetails.QuotationAttachment.filter(i => i.IsDelete != true);
            },
            reject: () => {
            }
        });

    }

    /**
     * this method will be called on file close icon click event..
     */
    onFileClose(fileIndex: number) {
        this.uploadedFiles = this.uploadedFiles.filter((file, index) => index != fileIndex);
    }
    onVendorFileClose(fileIndex: number) {
        this.vendoruploadedFiles = this.vendoruploadedFiles.filter((file, index) => index != fileIndex);
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



    //this method will be called on date picker focus event..
    onDatePickerFocus(element: NgbInputDatepicker, event: any) {
        if (!element.isOpen()) {
            element.open();
        }
    }
    //
    onSearchInputChange(event: any) {
        if (event.target.value != "") {

            this.getAllSearchPurchaseOrderRequest(event.target.value, 0, 0);

        }
        else {
            this.getPurchaseOrdersRequest(0);
        }
    }
    onPaymentTermChange(event: any) {
        let paymentTermId = this.purchaseOrderRequestForm.get('PaymentTermId').value;
        this.purchaseOrderRequestForm.get('PaymentTerms').setValue(this.paymentTerms.find(i => i.PaymentTermsId == paymentTermId).Description);
    }

    onDeliveryTermChange() {
        let deliveryTermId = this.purchaseOrderRequestForm.get('DeliveryTermId').value;
        this.purchaseOrderRequestForm.get('DeliveryTerm').setValue(this.deliveryTerms.find(i => i.DeliveryTermsId == deliveryTermId).Description);
    }

    onSearchClick() {
        if (this.purchaseOrderRequestSearchKey != "") {

            this.getAllSearchPurchaseOrderRequest(this.purchaseOrderRequestSearchKey, 0, 0);

        }
        else {
            this.getPurchaseOrdersRequest(0);
        }
    }

    openDialog() {
        this.initDone = true;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    openSettingsMenu() {
        this.initSettingsDone = true;
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    filterData() {
        let porCode = "";
        let supplierCategory = "";
        this.filterMessage = "";
        if (this.porFilterInfoForm.get('PORCode').value != "") {
            porCode = this.porFilterInfoForm.get('PORCode').value;
        }
        if (this.porFilterInfoForm.get('SupplierCategory').value != "") {
            supplierCategory = this.porFilterInfoForm.get('SupplierCategory').value.SupplierName;
        }
        if (porCode === '' && supplierCategory === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }
        this.getAllSearchPurchaseOrderRequest(this.purchaseOrderRequestSearchKey, 0, 0, porCode, supplierCategory);
        if (this.purchaseOrdersRequestList.length > 0) {
            this.isFilterApplied = true;
            if (open) {
                this.initDone = false;
            }
        }
    }

    resetFilters() {
        this.porFilterInfoForm.get('PORCode').setValue("");
        this.porFilterInfoForm.get('SupplierCategory').setValue("");
        this.filterMessage = "";
        this.filteredSuppliers = this.purchaseOrdersRequestList;
        if (this.filteredSuppliers.length > 0) {
            this.getPurchaseOrdersRequest(0);
        }

        this.isFilterApplied = false;
        if (this.porCodeRef != undefined) {
            this.porCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.porCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    onPrintScreen(event: any) {
        if (this.selectedPORequestDetails.PurchaseOrderRequestId > 0) {
            let pdfDocument = this.purchaseOrderRequestObj.printDetails(
                this.selectedPORequestDetails.PurchaseOrderRequestId,
                this.companyId,
                this.selectedPORequestDetails.POTypeId == PurchaseOrderType.InventoryPo ? WorkFlowProcess.InventoryPurchaseRequest : WorkFlowProcess.AssetPurchaseRequest
            );
            pdfDocument.subscribe((data) => {
                let result = new Blob([data], { type: 'application/pdf' });
                const fileUrl = URL.createObjectURL(result);
                let tab = window.open();
                tab.location.href = fileUrl;
            });
        }
    }




    setTaxAmount(taxType: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        let taxAmount = 0;
        if (this.taxTypes.find(i => i.TaxId == taxType) != undefined) {
            taxAmount = this.taxTypes.find(i => i.TaxId == taxType).TaxAmount;
        }
        itemGroupControl.controls[rowIndex].get('TaxAmount').setValue(taxAmount);
        this.calculateTotalPrice();
    }

    pageChange(currentPageNumber: any) {
        if (!isNaN(currentPageNumber)) {
            this.purchaseOrderRequestPagerConfig.RecordsToSkip = this.purchaseOrderRequestPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            this.getPurchaseOrdersRequest(0);
        }
    }
    updateStatus(statusId: number) {
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        let remarks = this.purchaseOrderRequestForm.get('remarks').value;
        if ((remarks == "" || remarks == null)) {
            this.purchaseOrderRequestForm.get('remarks').setErrors({ "required": true });
            this.purchaseOrderRequestForm.get('remarks').markAsTouched();
            return;
        }
        let workFlowStatus: PurchaseOrderRequestApproval = {
            PurchaseOrderRequestId: this.selectedPORequestDetails.PurchaseOrderRequestId,
            UserId: userDetails.UserID,
            WorkFlowStatusId: statusId,
            Remarks: remarks,
            PurchaseOrderRequestUserId: this.selectedPORequestDetails.CreatedBy,
            ApproverUserId: this.selectedPORequestDetails.CurrentApproverUserId,
            PurchaseOrderRequestCode: this.selectedPORequestDetails.PurchaseOrderRequestCode,
            ProcessId: getProcessId(this.selectedPORequestDetails.POTypeId, true),
            CompanyId:this.selectedPORequestDetails.CompanyId
        };
        this.purchaseOrderRequestObj.updatePurchaseOrderStatus(workFlowStatus)
            .subscribe((data) => {
                this.purchaseOrderRequestForm.get('remarks').setValue("");
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.SentForClarification,
                    MessageType: MessageTypes.Success
                });
                this.getPurchaseOrdersRequest(0);
            });
    }

    itemClick(rowId: number) {
        this.selectedRowId = rowId;
    }

    sendMailtoSupplier() {
        if (this.selectedPORequestDetails.WorkFlowStatusText.toLowerCase() === "approved") {
            let result = <Observable<Array<any>>>this.purchaseOrderRequestObj.sendPurchaseOrderMailtoSupplier(
                this.selectedPORequestDetails.PurchaseOrderRequestId,
                this.companyId,
                this.selectedPORequestDetails.POTypeId == PurchaseOrderType.InventoryPo ? WorkFlowProcess.InventoryPurchaseRequest : WorkFlowProcess.AssetPurchaseRequest
            );
            result.subscribe((data) => {
                if (data) {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.EmailResponse,
                        MessageType: MessageTypes.Success
                    });
                }
            });
        }
    }

    onPoTypeChange(poTypeId: number) {
        this.isTypeSelected = true;       
        let purchaseOrderReqItems = <FormArray>this.purchaseOrderRequestForm.get('PurchaseOrderRequestItems');
        purchaseOrderReqItems.controls.forEach((data, index: number) => {
            if (poTypeId == PurchaseOrderType.InventoryPo)//inventory po
            {
                this.accountCodeCategories = this.allAccountCodeCategories;
                purchaseOrderReqItems.controls[index].get('Item').setValidators([Validators.required]);
                purchaseOrderReqItems.controls[index].get('Asset').setValidators(null);
                purchaseOrderReqItems.controls[index].get('Asset').setErrors(null);            
                this.accountCodeCategories = this.accountCodeCategories.filter(x => x.AccountCodeName.toLowerCase().indexOf('item') !== -1 || x.AccountCodeName.toLowerCase().indexOf('service') !== -1)
            }
            else if (poTypeId == PurchaseOrderType.FixedAssetPo)//asset po
            {
                this.accountCodeCategories = this.allAccountCodeCategories;
                purchaseOrderReqItems.controls[index].get('Asset').setValidators([Validators.required]);
                purchaseOrderReqItems.controls[index].get('Item').setValidators(null);
                purchaseOrderReqItems.controls[index].get('Item').setErrors(null);             
                this.accountCodeCategories = this.accountCodeCategories.filter(x => x.AccountCodeName.toLowerCase().indexOf('asset') !== -1 || x.AccountCodeName.toLowerCase().indexOf('service') !== -1)
                this.onIsDetailedCheck();//calling this function to reset serial numbers for each record
            }
            else if (poTypeId == PurchaseOrderType.ExpensePo)
            {

                this.accountCodeCategories = this.allAccountCodeCategories;               
                this.accountCodeCategories = this.accountCodeCategories.filter(x => x.AccountCodeName.toLowerCase().indexOf('expenses') !== -1 || x.AccountCodeName.toLowerCase().indexOf('insurance') !== -1)
            }
        });
    }

    resetCategories(poTypeId: number){      
        this.accountCodeCategories = this.allAccountCodeCategories;
        if (poTypeId == PurchaseOrderType.InventoryPo)//inventory po
        {           
            this.accountCodeCategories = this.accountCodeCategories.filter(x => x.AccountCodeName.toLowerCase().indexOf('item') !== -1 || x.AccountCodeName.toLowerCase().indexOf('service') !== -1)
        }
        else if (poTypeId == PurchaseOrderType.FixedAssetPo)//asset po
        {                    
            this.accountCodeCategories = this.accountCodeCategories.filter(x => x.AccountCodeName.toLowerCase().indexOf('asset') !== -1 || x.AccountCodeName.toLowerCase().indexOf('service') !== -1)
        }
        else if (poTypeId == PurchaseOrderType.ExpensePo)
        {             
            this.accountCodeCategories = this.accountCodeCategories.filter(x => x.AccountCodeName.toLowerCase().indexOf('expenses') !== -1 || x.AccountCodeName.toLowerCase().indexOf('insurance') !== -1)
        }
    }

    onIsDetailedCheck(isChecked?: boolean, rowId?: number) {
        let assetGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        assetGroupControl.controls.forEach((control, index) => {
            this.setSerialNumber(index, control.get('IsDetailed').value, true)
        });
        if (rowId != null) {
            let assetControl = assetGroupControl.controls[rowId].get('Asset');
            let assetQtyControl = assetGroupControl.controls[rowId].get('ItemQty');
            let unitPriceControl = assetGroupControl.controls[rowId].get('Unitprice');
            if (isChecked == true) {
                assetControl.setValidators(null);
                assetControl.setErrors(null);
                assetQtyControl.setValidators(null);
                assetQtyControl.setErrors(null);
                unitPriceControl.setValidators(null);
                unitPriceControl.setErrors(null);
            }
            else if (isChecked == false) {
                assetControl.setValidators(Validators.required);
                assetQtyControl.setValidators([Validators.required, Validators.min(1)]);
                unitPriceControl.setValidators([Validators.required, Validators.min(1)]);
            }
        }
    }
    onCategoryChange(categoryId: number, rowIndex: number) {  
        let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
        this.accountCategoryId = itemGroupControl.controls[rowIndex].get('TypeId').value;
      
        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('PurchaseOrderRequestItemId').value;
        if(purchaseOrderItemId > 0)
        {
            //this.deletedPurchaseOrderItems.push(purchaseOrderItemId);
        }
        if(this.accountCategoryId == 4)
        {
           itemGroupControl.controls[rowIndex].get('Service').clearValidators();
           itemGroupControl.controls[rowIndex].get('Service').updateValueAndValidity();
           itemGroupControl.controls[rowIndex].get('Asset').clearValidators();
           itemGroupControl.controls[rowIndex].get('Asset').updateValueAndValidity();
           itemGroupControl.controls[rowIndex].get('Expense').clearValidators();
           itemGroupControl.controls[rowIndex].get('Expense').updateValueAndValidity();
      

           itemGroupControl.controls[rowIndex].get('Item').setValidators([Validators.required]);
           itemGroupControl.controls[rowIndex].get('Item').updateValueAndValidity();
        }
        else if(this.accountCategoryId == 5)
        {
            itemGroupControl.controls[rowIndex].get('Service').clearValidators();
            itemGroupControl.controls[rowIndex].get('Service').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('Item').clearValidators();
            itemGroupControl.controls[rowIndex].get('Item').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('Expense').clearValidators();
            itemGroupControl.controls[rowIndex].get('Expense').updateValueAndValidity();
      
            itemGroupControl.controls[rowIndex].get('Asset').setValidators([Validators.required]);
            itemGroupControl.controls[rowIndex].get('Asset').updateValueAndValidity();
        }
        else if(this.accountCategoryId == 1)
        {
            itemGroupControl.controls[rowIndex].get('Asset').clearValidators();
            itemGroupControl.controls[rowIndex].get('Asset').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('Item').clearValidators();
            itemGroupControl.controls[rowIndex].get('Item').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('Expense').clearValidators();
            itemGroupControl.controls[rowIndex].get('Expense').updateValueAndValidity();
 
            itemGroupControl.controls[rowIndex].get('Service').setValidators([Validators.required]);
            itemGroupControl.controls[rowIndex].get('Service').updateValueAndValidity();
        }
        else
        {
            itemGroupControl.controls[rowIndex].get('Asset').clearValidators();
            itemGroupControl.controls[rowIndex].get('Asset').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('Item').clearValidators();
            itemGroupControl.controls[rowIndex].get('Item').updateValueAndValidity();
            itemGroupControl.controls[rowIndex].get('Service').clearValidators();
            itemGroupControl.controls[rowIndex].get('Service').updateValueAndValidity();
 
            itemGroupControl.controls[rowIndex].get('Expense').setValidators([Validators.required]);
            itemGroupControl.controls[rowIndex].get('Expense').updateValueAndValidity();
        }
    
        if(itemGroupControl.controls[rowIndex]!=undefined)
        {        
            itemGroupControl.controls[rowIndex].reset();     
        }   
    
        itemGroupControl.controls[rowIndex].get('TypeId').setValue(Number(this.accountCategoryId));
      }

    
     serviceInputFormater = (x: AccountCodeMaster) => x.Code;
      serviceMasterSearch = (text$: Observable<string>) =>{      
        if(text$==undefined)
         {
            return of([]);
         }
         return text$.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((term) =>{                  
                    if(term=="")
                    {
                       let itemGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
                       if(itemGroupControl.controls[this.selectedRowId]!=undefined)
                       {
                        let purchaseOrderRequestItemId = itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderRequestItemId').value;
                        let typeId = itemGroupControl.controls[this.selectedRowId].get('TypeId').value;  
                        itemGroupControl.controls[this.selectedRowId].reset();
                        itemGroupControl.controls[this.selectedRowId].get('PurchaseOrderRequestItemId').setValue(purchaseOrderRequestItemId);
                        itemGroupControl.controls[this.selectedRowId].get('TypeId').setValue(typeId);
                         
                       }
                       return of([]);
                    }
                    
                    return this.sharedServiceObj.getServicesByKey({                    
                        searchKey:term,
                        companyId:this.companyId,
                        categoryId: 1 // Services
                    }).map((data:AccountCodeMaster[])=>{
                        if(data==null||data.length==0)
                        {
                            let objAccountCode:AccountCodeMaster = {
                                AccountCodeId:0,
                                AccountCodeCategoryId:0,
                                AccountType:'',       
                                Code:'',                        
                                AccountCodeName:term,                                
                                Description:"",
                                AccountCodeCategoryName:""                                
                            };
                            return [objAccountCode];
                        }
                        else
                        {
                            return data;
                        }
                    }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
                })
    );
}

    setSerialNumber(currentIndex: number, isDetailed: boolean, isEdit: boolean) {
        let lastParentSNos: number[] = [];
        let serialNumber: any = 0;
        if (isEdit == true) {
            let assetGroupControl = <FormArray>this.purchaseOrderRequestForm.controls['PurchaseOrderRequestItems'];
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
            lastParentSNos = this.selectedPORequestDetails.PurchaseOrderRequestItems.filter((rec, index) => rec.IsDetailed != true && index < currentIndex).map((data) => data.Sno);
            if (lastParentSNos.length > 0) {
                let lastParentSerialNumber = Math.max.apply(null, lastParentSNos);
                let currentRecordSerialNumber = lastParentSerialNumber + 1;
                if (isDetailed == true) {
                    let lastParentIndexs: number[] = [];
                    this.selectedPORequestDetails.PurchaseOrderRequestItems.forEach((rec, index) => {
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
            this.selectedPORequestDetails.PurchaseOrderRequestItems[currentIndex].Sno = serialNumber;
        }
    }
}
