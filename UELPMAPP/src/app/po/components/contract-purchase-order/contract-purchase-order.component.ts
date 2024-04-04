import { Component, OnInit, ViewChild, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { ContractPurchaseOrder, ContractPurchaseOrderItems } from "../../models/contract-purchase-order.model";
import { ContractPurchaseOrderService } from "../../services/contract-purchase-order.service";
import { SharedService } from "../../../shared/services/shared.service";
import { PagerConfig, Suppliers, ItemMaster, MessageTypes, Taxes, UserDetails, WorkFlowStatus, WorkFlowProcess, PurchaseOrderType, COAAccountType } from "../../../shared/models/shared.model";
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { GridOperations, ResponseStatusTypes, Messages, Currency } from "../../../shared/models/shared.model";
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { ValidateFileType, FullScreen,HideFullScreen, restrictMinus } from "../../../shared/shared";
import { environment } from '../../../../environments/environment';
import { Supplier, SupplierSubCode } from '../../models/supplier';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { DEFAULT_CURRENCY_ID } from '../../../shared/constants/generic';
import { PoApprovalUpdateStatus } from '../../models/po-approval.model';
import { DISABLED } from '@angular/forms/src/model';
import { PurchaseOrderStatus } from '../../models/po-creation.model';
import { AccountCode } from '../../models/account-code.model';
import { PurchaseOrderTypes } from '../../models/purchase-order-request.model';
import { PurchaseOrderRequestService } from '../../services/purchase-order-request.service';
import { POCreationService } from "../../services/po-creation.service";
import { SupplierApiService } from "../../services/supplier-api.service";
import { SupplierServices } from '../../models/supplier-service.model';
import { AccountCodeAPIService } from '../../services/account-code-api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkFlowApiService } from '../../../administration/services/workflow-api.service';
import { TaxService } from '../../services/tax.service';
import * as moment from 'moment';
import { UtilService } from '../../../shared/services/util.service';
import { faLeaf } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-contract-purchase-order',
    templateUrl: './contract-purchase-order.component.html',
    styleUrls: ['./contract-purchase-order.component.css'],
    providers: [POCreationService, ContractPurchaseOrderService, TaxService, PurchaseOrderRequestService, SupplierApiService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ContractPurchaseOrderComponent implements OnInit {
    userDetails: UserDetails = null;
    @Input('selectedPoId') selectedPoId: number;
    @Input('isApprovalPage') isApprovalPage: boolean;
    @Input('remarks') remarks: string;
    @Input('selectedPurchaseOrderTypeId') selectedPurchaseOrderTypeId: number = 0;
    @Input('purchaseOrderSearchKey') purchaseOrderSearchKey: string;
    @Input('isMaster') isMaster: boolean = false;
    @Output()
    cancelChanges: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output()
    readListView: EventEmitter<{ PoId: number, PotypeId: number }> = new EventEmitter<{ PoId: number, PotypeId: number }>(); //creating an output event
    @Output()
    updateStatus: EventEmitter<PoApprovalUpdateStatus> = new EventEmitter<PoApprovalUpdateStatus>();
    contractPurchaseOrderForm: FormGroup;
    backButtonVisible:boolean=true;
    purchaseOrderPagerConfig: PagerConfig;
    purchaseOrderItemsGridConfig: PagerConfig;
    selectedPODetails: ContractPurchaseOrder;
    billingFrequenceTypes: Array<{ FrequencyId: Number, FrequencyName: string }> = [];
    expenseCategories: Array<{ AccountCodeId: Number, AccountCodeName: string, Description: string, IsAdded?: boolean }> = [];
    accrualAccountCode: Array<{ Name: string, AccountCodeName: string, Amount: string }> = [];
    suppliers: Suppliers[] = [];
    currencies: Currency[] = [];
    gridColumns: Array<{ field: string, header: string }> = [];
    accrualgridColumns: Array<{ field: string, header: string }> = [];
    recordInEditMode: number;
    operation: string;
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    uploadedFiles: Array<File> = [];
    showGridErrorMessage: boolean = false;
    scrollbarOptions: any;
    apiEndPoint: string;
    hideLeftPanel: boolean = false;
    linesToAdd: number = 2;
    deletedPurchaseOrderItems: Array<number> = [];
    taxTypes: Array<Taxes> = [];
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    showLoadingIcon: boolean = false;
    companyId: number;
    departments: Location[] = [];
    contractPoTypeIds: Array<number> = [];
    workFlowStatus: any;
    showVoidPopUp: boolean = false;
    purchaseOrderStatus: any;
    ShowErrorMessage: boolean = false;
    check: string = "";
    count: number = 0;
    purchaseOrderTypes: Array<PurchaseOrderTypes> = [];
    isVoid: boolean = false;
    previousAccountId: number = 0;
    supplierServices: Array<SupplierServices> = [];
    hideMargin?: boolean = null;
    hideGLCode: boolean = false;
    showbutton: boolean = true;
    isSupplierSelected: boolean = false;
    supplierid: number;
    showSplitbyMonth: boolean = true;
    supplierSubCodes = [];
    accountTypes: Array<AccountCode> = [];
    editPermission: boolean;
    approvePermission: boolean;
    voidPermission: boolean;
    terminatePermission: boolean;
    verifyPermission: boolean;
    generatepocPermission: boolean;
    AccraulCodeVisible: boolean;
    SplitByMonthVisible: boolean;
    AccureTheExpenseVisible: boolean;
    TaxTypeVisible: boolean;
    TaxGroupVisible: boolean;
    accountCodeCategories = [];
    accountCategoryId: number = 0;
    selectedRowId: number = -1;
    ExpenseVisible: boolean = false;
    ExpenseCodeVisible: boolean = true;
    isCompanyChanged: boolean = false;
    doApproveReject: boolean = true;
    processId: number = 0;
    deptId: number = 0;
    hasWorkFlow: boolean = true;
    isSameUSer: boolean = false;
    isApproverUser: boolean = false;
    taxGroups = [];
    checktax: boolean = false;
    TaxGroupId: number;
    TaxId: number;
    Description: string;
    public innerWidth: any;
    IsVerifier: boolean = false;
    showReverify: boolean = false;
    public screenWidth: any;
    constructor(private contractPoServiceObj: ContractPurchaseOrderService,
        private formBuilderObj: FormBuilder,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        private reqDateFormatPipe: RequestDateFormatPipe,
        public sessionService: SessionStorageService,
        private purchaseOrderRequestObj: PurchaseOrderRequestService,
        private purchaseOrderCreationObj: POCreationService,
        private workFlowService: WorkFlowApiService,
        private taxService: TaxService,
        private utilService: UtilService,
        private supplierApiServiceObj: SupplierApiService, private router: Router, private accountCodeAPIService: AccountCodeAPIService, public activatedRoute: ActivatedRoute) {

        this.contractPoTypeIds = [PurchaseOrderType.ContractPoFixed, PurchaseOrderType.ContractPoVariable];
        this.companyId = this.sessionService.getCompanyId();
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.gridColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'AccountCodeCategoryId', header: 'Category' },
            { field: 'Name', header: 'Expense' },
            { field: 'Description', header: 'Description' },
            { field: 'Amount', header: 'Amount' },

        ];

        this.accrualgridColumns = [
            // { field: 'Sno', header: '' },
            { field: 'AccountCode', header: 'Account Code' },
            { field: 'Amount', header: 'Amount' },
        ];


        this.apiEndPoint = environment.apiEndpoint;

        this.purchaseOrderPagerConfig = new PagerConfig();
        this.purchaseOrderPagerConfig.RecordsToFetch = 100;

        this.purchaseOrderItemsGridConfig = new PagerConfig();
        this.purchaseOrderItemsGridConfig.RecordsToFetch = 20;

        this.selectedPODetails = new ContractPurchaseOrder();
        this.contractPurchaseOrderForm = this.formBuilderObj.group({
            'CPOID': [0],
            'POTypeId': [0, [Validators.required, Validators.min(1)]],
            'ContractName': ["", { validators: [Validators.required, this.noWhitespaceValidator] }],
            //'ContractSignedDate':[new Date(), [Validators.required]],
            'LocationId': [null, [Validators.required]],
            'Supplier': [null, [Validators.required]],
            'StartDate': [new Date(), [Validators.required]],
            'EndDate': [new Date(), [Validators.required]],
            'PODate': [new Date(), [Validators.required]],
            'TotalContractSum': [0, [Validators.required]],
            'BillingFrequencyId': [1, [Validators.required]],
            'CurrencyId': [0, [Validators.required, Validators.min(1)]],
            'ContractPurchaseOrderItems': this.formBuilderObj.array([]),
            'TenureAmount': [{ value: 0, disabled: true }],
            'TenureAmountHidden': [{ value: 0 }],
            "SupplierAddress":[""],
            'Discount': [0],
            'SubTotal': [0],
            'TotalTax': [0],
            "TaxAmount": [0],
            "TotalAmount": [0],
            "TaxId": [0],
            "TaxGroupId": [0],
            "Remarks": [""],
            "AccruetheExpense": [false],
            "SplitByMonthly": [false],
            "ContractTerms": [""],
            "Margin": [0, [Validators.required]],
            'ServiceType': [0, [Validators.required, Validators.min(1)]],
            'AccrualCode': [0],
            'SupplierSubCodeId': [null, [Validators.required]],
            'SupplierSubCode': [null],
            'TenureAmountToDisplay': [0],
            'CPORemarks': ['']
        });

        //getting the purchase order types.
        this.purchaseOrderRequestObj.getPurchaseOrderTypes()
            .subscribe((data: PurchaseOrderTypes[]) => {
                this.purchaseOrderTypes = data.filter(x => x.PurchaseOrderTypeId == PurchaseOrderType.ContractPoFixed
                    || x.PurchaseOrderTypeId == PurchaseOrderType.ContractPoVariable);
                if (this.purchaseOrderTypes.length > 0) {
                    this.contractPurchaseOrderForm.get('POTypeId').setValue(this.purchaseOrderTypes[0].PurchaseOrderTypeId);
                }
            });

        this.getTaxTypes();
        this.billingFrequenceTypes = [{
            FrequencyId: 1,
            FrequencyName: "Monthly"
        },
        {
            FrequencyId: 5,
            FrequencyName: "Bi-monthly"
        },
        {
            FrequencyId: 2,
            FrequencyName: "Quarterly"
        }, {
            FrequencyId: 3,
            FrequencyName: "Half Yearly"
        },
        {
            FrequencyId: 4,
            FrequencyName: "Yearly"
        }];
        this.workFlowStatus = WorkFlowStatus;
        this.purchaseOrderStatus = PurchaseOrderStatus;

    }

    @ViewChild('rightPanel') rightPanelRef;

    ngOnInit() {
        //getting role access levels  
        this.checkPermission();
        this.activatedRoute.paramMap.subscribe((data) => {
            let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
            if (Number(companyId) != 0)
                this.companyId = companyId;
        });

        this.sharedServiceObj.IsCompanyChanged$
            .subscribe((data) => {
                this.isCompanyChanged = data;
                if (this.isCompanyChanged) {
                    this.getAccountCodeCategories(this.companyId);
                    //s.getDepartments(this.companyId);
                    // this.getCompanyDetails(this.companyId);

                    this.sharedServiceObj.updateCompany(false);
                }
            });
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                //this.getDepartments(this.companyId);
            });

        this.sharedServiceObj.getCurrencies()
            .subscribe((data: Currency[]) => {
                this.currencies = data;
            });
        this.operation = GridOperations.Display;
        this.getDepartments(this.companyId);
        this.getAccountCode();
        this.GetAccountCodesByCategory();
        this.getAccountCodeCategories(this.companyId);
        this.getTaxGroups();

          this.screenWidth = window.innerWidth-180;
         
          this.addRecord();
    }

    public noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
    }

    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched));
    }

    checkPermission() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (this.isMaster) {
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "contractmaster")[0];
                this.editPermission = formRole.IsEdit;
                this.approvePermission = formRole.IsApprove;
                this.terminatePermission = formRole.IsVoid;
                this.generatepocPermission = formRole.IsGeneratePOC;
                this.IsVerifier = formRole.IsVerify;
            }
            else {
                this.editPermission = true;
                this.approvePermission = true;
                this.terminatePermission = true;
                this.generatepocPermission = true;
                this.IsVerifier = false;
            }
        }
        else {
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "purchaseorderapproval")[0];
                this.editPermission = formRole.IsEdit;
                this.approvePermission = formRole.IsApprove;
                // this.voidPermission = formRole.IsVoid;
                this.verifyPermission = formRole.IsVerify;
                this.IsVerifier = formRole.IsVerify;
                this.generatepocPermission = formRole.IsGeneratePOC;

            }
            else {
                this.editPermission = true;
                this.approvePermission = true;
                //  this.voidPermission = true;
                this.verifyPermission = true;
                this.generatepocPermission = true;
                this.IsVerifier = false;
            }
        }
    }

    ngOnChanges(simpleChange: SimpleChanges) {
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
            this.contractPurchaseOrderForm.get('Remarks').setValue("");
        }
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
    onCategoryChange(categoryId: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        this.accountCategoryId = itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').value;

        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('CPOItemid').value;
        let amount = itemGroupControl.controls[rowIndex].get('Amount').value;
        if (purchaseOrderItemId > 0) {
            this.deletedPurchaseOrderItems.push(purchaseOrderItemId);
        }

        if (itemGroupControl.controls[rowIndex] != undefined) {
            itemGroupControl.controls[rowIndex].reset();
        }
        if (this.showReverify) {
            itemGroupControl.controls[rowIndex].get('Amount').setValue(Number(amount));
            itemGroupControl.controls[rowIndex].get('CPOItemid').setValue(Number(purchaseOrderItemId));
        }
        itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').setValue(Number(this.accountCategoryId));
    }

    onVerifyCategoryChange(categoryId: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        this.accountCategoryId = itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').value;

        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('CPOItemid').value;
        if (purchaseOrderItemId > 0) {
            this.deletedPurchaseOrderItems.push(purchaseOrderItemId);
        }

        if (itemGroupControl.controls[rowIndex] != undefined) {
            itemGroupControl.controls[rowIndex].get('Expense').reset();
            itemGroupControl.controls[rowIndex].get('Description').reset();
        }

        itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').setValue(Number(this.accountCategoryId));
    }

    // checkPermission(){
    //  
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

    getAccountCode() {
        this.sharedServiceObj.GetAccountCodesByAccountType(this.companyId).subscribe((data: Array<AccountCode>) => {
            this.accountTypes = data;
        });
    }

    GetAccountCodesByCategory(): void {
        let accountCodesDisplayInput = {
            categoryId: 2, // Expenses
            companyId: this.companyId,

        };

        let accountCodesResult = <Observable<Array<{ AccountCodeId: Number, AccountCodeName: string, Description: string }>>>this.sharedServiceObj.getAccountCodesByCategory(accountCodesDisplayInput);
        accountCodesResult.subscribe((data) => {
            if (data != null) {
                if (data.length > 0) {
                    this.expenseCategories = data;
                }
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

    getTaxTypeByTaxGroup(taxGroupId: number) {
        let taxResult = <Observable<Array<any>>>this.taxService.getTaxesByTaxGroup(taxGroupId);
        taxResult.subscribe((data: any) => {
            if (data != null) {
                this.taxTypes = data;
                if (data.length > 0) {
                    this.selectedPODetails.Description = data[0].Description;
                    this.contractPurchaseOrderForm.get('TaxId').setValue(data[0].TaxId);
                    this.calculateTotalPrice();

                }
            }
        });
    }
    getTaxTypeByTaxGroupForVerify(taxGroupId: number) {
        let taxResult = <Observable<Array<any>>>this.taxService.getTaxesByTaxGroup(taxGroupId);
        taxResult.subscribe((data: any) => {
            if (data != null) {
                this.taxTypes = data;
                if (data.length > 0) {
                    this.selectedPODetails.Description = data[0].Description;
                    this.calculateTotalPrice();
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
    //             supplierTypeId:0,
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
                    this.contractPurchaseOrderForm.patchValue({
                        "SupplierAddress": "",
                        "ShippingFax": "",
                        "SupplierCode": "",
                        "IsGstRequired": false,
                        "SupplierTypeID": 1
                    });

                    this.isSupplierSelected = false;
                    return of([]);
                }
                return this.sharedServiceObj.getActiveSuppliers({
                    searchKey: term,
                    supplierTypeId: 0,
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

    accrualCodeInputFormater = (x: COAAccountType) => x.AccountType;
    accrualCodeSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getAccountTypes().pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
        );


    //   getAccountTypes() {
    //     this.sharedServiceObj.getAccountTypes().subscribe((data: Array<COAAccountType>) => {
    //         this.accountTypes = data;
    //     });
    // }

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
    //   );

    supplierTypeChange(event) {
        let purchaseOrderTypeId = event.target.value;
        this.contractPurchaseOrderForm.get('Supplier').setValue(null);
    }
    /**
     * this method will be called on purchase order record selection.
     */

    onRecordSelection(purchaseOrderId: number) {
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.contractPurchaseOrderForm.reset();
        this.contractPurchaseOrderForm.setErrors(null);
        this.AccraulCodeVisible = false;
        this.TaxTypeVisible = false;
        this.SplitByMonthVisible = false;
        this.AccureTheExpenseVisible = false;
        this.TaxGroupVisible = false;
        this.showLoadingIcon = true;
        this.hideGLCode = false;
        this.showReverify = false;
        this.selectedPODetails.TaxAmount = this.contractPurchaseOrderForm.get('TaxAmount').value;
        this.selectedPODetails.TotalTax = this.contractPurchaseOrderForm.get('TotalTax').value;
        this.selectedPODetails.TotalAmount = this.contractPurchaseOrderForm.get('TotalAmount').value;
        this.contractPoServiceObj.getPurchaseOrderDetails(purchaseOrderId)
            .subscribe((data: ContractPurchaseOrder) => {
                this.isSameUSer = (data.CreatedBy == userDetails.UserID) ? true : false;
                this.isApproverUser = (data.CurrentApproverUserId == this.userDetails.UserID) ? true : false;
                this.selectedPODetails = data;
                this.showLoadingIcon = false;
                this.selectedPODetails.BillingFrequency = this.billingFrequenceTypes.find(j => j.FrequencyId == this.selectedPODetails.BillingFrequencyId).FrequencyName;
                // this.selectedPODetails.ContractPurchaseOrderItems.forEach(data => {
                //     let record = this.expenseCategories.find(j => j.AccountCodeId == data.Expense.AccountCodeId != undefined);
                //     if (record != undefined) {
                //         data.ExpenseCategory = this.expenseCategories.find(j => j.AccountCodeId == data.Expense.AccountCodeId).AccountCodeName;
                //     }
                // });              
                this.getPoType(data.POTypeId);
                if (this.selectedPODetails.SupplierSubCode != null) {
                    this.isSupplierSelected = true;
                }
                else {
                    this.isSupplierSelected = false;
                }
                this.operation = GridOperations.Display;
                this.contractPurchaseOrderForm.patchValue(data);
                if (this.selectedPODetails.AccruetheExpense == true) {
                    this.hideGLCode = true;
                }
                this.accrualAccountCode = [];
                if (this.selectedPODetails.AccountCodeName != null) {
                    for (let i = 0; i < this.selectedPODetails.ContractPurchaseOrderItems.length; i++) {
                        this.accrualAccountCode.push({
                            Name: "Item A",
                            AccountCodeName: this.selectedPODetails.ContractPurchaseOrderItems[i].AccountCode,
                            Amount: this.selectedPODetails.ContractPurchaseOrderItems[i].Amount.toFixed(2)
                        });
                        this.accrualAccountCode.push({
                            Name: "accrual",
                            AccountCodeName: this.selectedPODetails.AccountCodeName,
                            Amount: "(" + this.selectedPODetails.ContractPurchaseOrderItems[i].Amount.toFixed(2) + ")",
                        });
                    }
                }
                this.hidetext = true;
                this.hideinput = false;
                this.checkPermission();
                this.cancelReverify();
            }, () => {
                this.showLoadingIcon = false;
            });
    }
    /**
     * this method will be called on the supplier dropdown change event.
     */
    onSupplierChange(event?: any, isEdit: boolean = false) {
        debugger
        let supplierDetails: Supplier;
        let itemGroupControl1 = <FormArray>this.contractPurchaseOrderForm.controls['PurchaseOrderItems'];
        if (event != null && event != undefined) {
            supplierDetails = event.item;
            this.supplierid = event.item.SupplierId;
            this.TaxGroupId = supplierDetails.TaxGroupId;
            this.TaxId = event.item.defaulttaxgroup;
            this.selectedPODetails.Description = supplierDetails.Description;
            this.contractPurchaseOrderForm.get('CurrencyId').setValue(event.item.CurrencyId);
            this.contractPurchaseOrderForm.get('SupplierAddress').setValue(supplierDetails.SupplierAddress);
        }
        else {
            supplierDetails = this.contractPurchaseOrderForm.get('Supplier').value;
        }

        if (supplierDetails != undefined) {
            if ((supplierDetails.WorkFlowStatus != null) && (supplierDetails.WorkFlowStatus === "Approved") && (!supplierDetails.IsFreezed)) {
                this.contractPurchaseOrderForm.patchValue({
                    // "SupplierAddress": supplierDetails.BillingAddress1,
                    "DeliveryAddress": supplierDetails.BillingAddress1,
                    "ShippingFax": supplierDetails.BillingFax,
                    "ServiceType": 0
                });



                this.supplierApiServiceObj.getSupplierServices(supplierDetails.SupplierId)
                    .subscribe((data: Array<SupplierServices>) => {

                        this.supplierServices = data;
                        if (isEdit == true) {
                            this.contractPurchaseOrderForm.get('ServiceType').setValue(this.selectedPODetails.ServiceType);
                        }
                    });

                if (event != null && event != undefined) {
                    // for (let i = 0; i < itemGroupControl1.length; i++) {
                    this.contractPurchaseOrderForm.get('TaxGroupId').setValue(supplierDetails.TaxGroupId);
                    this.contractPurchaseOrderForm.get('TaxId').setValue(event.item.defaulttaxgroup);

                    this.getTaxesByTaxGroupsupplierChange(supplierDetails.TaxGroupId);

                }

                if (supplierDetails.SubCodeCount > 0 || this.contractPurchaseOrderForm.get("SupplierSubCode").value != null) {
                    this.isSupplierSelected = true;
                    this.contractPurchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
                    this.contractPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
                }
                else {
                    this.isSupplierSelected = false;
                    this.contractPurchaseOrderForm.get('SupplierSubCodeId').clearValidators();
                    this.contractPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
                }

                //getting Supplier sub Codes
                this.getSupplierSubCodes(supplierDetails.SupplierId, this.companyId);
            }
            else {
                this.isSupplierSelected = false;
                this.contractPurchaseOrderForm.get('Supplier').setValue(null);
                event.preventDefault();
            }
        }
        else {
            this.contractPurchaseOrderForm.patchValue({
                "SupplierAddress": "",
                "DeliveryAddress": "",
                "ShippingFax": "",
                "ServiceType": 0
            });

            this.isSupplierSelected = false;
            this.contractPurchaseOrderForm.get('SupplierSubCodeId').clearValidators();
            this.contractPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
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
            switchMap(term =>
                this.sharedServiceObj.getItemMasterByKey({
                    searchKey: term,
                    CompanyId: this.companyId,
                    LocationID: null
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            )
        );
    /**
     * this method will be called on "item master" autocomplete value selection.
     */
    itemMasterSelection(eventData: any, index: number) {
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        //setting the existing qty based on user selection 
        itemGroupControl.controls[index].patchValue({
            ItemDescription: eventData.item.Description,
            MeasurementUnitID: eventData.item.MeasurementUnitID
        });
    }

    itemClick(rowId: number) {

        this.selectedRowId = rowId;
    }
    ExpenseInputFormater = (x: AccountCode) => x.Code;
    ExpenseitemMasterSearch = (text$: Observable<string>) => {
        let accountCategoryId;
        if (text$ == undefined) {
            return of([]);
        }
        return text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];

                accountCategoryId = itemGroupControl.controls[this.selectedRowId].get('AccountCodeCategoryId').value;

                return this.sharedServiceObj.getServicesByKeyforExpense({
                    searchKey: term,
                    companyId: this.companyId,
                    categoryId: accountCategoryId
                }).map((data: AccountCode[]) => {

                    return this.getAccountCodeList(data);

                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }

    getAccountCodeList(data: AccountCode[]) {
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCode>control.get('Expense').value;
        });
        return data;
    }

    getTaxesByTaxGroupsupplierChange(taxGroupId: number) {
        let taxResult = <Observable<Array<any>>>this.taxService.getTaxesByTaxGroup(taxGroupId);
        taxResult.subscribe((data: any) => {
            if (data != null) {
                this.taxTypes = data;
                // this.contractPurchaseOrderForm.get('Description').setValue(data.Description);
            }
        });
        return taxResult;
    }

    // onSubCodeChange(event){

    // }

    initGridRows() {
        return this.formBuilderObj.group({
            'CPOItemid': 0,
            'Description': [""],
            'AccountCodeCategoryId': [0, [Validators.required, Validators.min(1)]],
            'Expense': [null, Validators.required],
            'Amount': [0, [Validators.required, Validators.min(1)]],
        });
    }
    //adding row to the grid..
    addGridItem(noOfLines: number) {
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        for (let i = 0; i < noOfLines; i++) {
            itemGroupControl.push(this.initGridRows());
        }
    }
    /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex: number) {
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('CPOItemid').value;
        let accountCodeId = itemGroupControl.controls[rowIndex].get('Expense').value;
        if (purchaseOrderItemId > 0) {
            this.deletedPurchaseOrderItems.push(purchaseOrderItemId);
        }
        for (let i = 0; i < itemGroupControl.length; i++) {
            if (accountCodeId == itemGroupControl.controls[i].get('Expense').value && i != rowIndex) {
                itemGroupControl.controls[i].get('Expense').setErrors(null);
                itemGroupControl.controls[i].get('Expense').markAsTouched();
                break;
            }
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
        this.hidetext = false;
        this.hideinput = true;
        this.ShowErrorMessage = false;
        this.linesToAdd = 2;
        this.hideMargin = false;
        this.isSupplierSelected = false;
        this.selectedPODetails = new ContractPurchaseOrder();
        this.hideGLCode = false;
        //resetting the purchase order form..
        this.contractPurchaseOrderForm.reset();
        this.contractPurchaseOrderForm.setErrors(null);
        this.contractPurchaseOrderForm.get('Remarks').setErrors(null);
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        this.supplierid = 0;
        this.contractPurchaseOrderForm.patchValue({
            SupplierTypeID: "1",
            POTypeId: 0,
            IsGstRequired: false,
            CurrencyId: DEFAULT_CURRENCY_ID,
            BillingFrequencyId: this.billingFrequenceTypes[0].FrequencyId,
            AccruetheExpense: false,
            SplitByMonthly: false,
            ServiceType: 0
            //POTypeId:PurchaseOrderType.ContractPoFixed
        });
        this.addGridItem(this.linesToAdd);
        this.showFullScreen();
        
    }
    subCodeChange(value: number) {
        let supplierCode = this.utilService.getSupplierCode(this.contractPurchaseOrderForm.get('Supplier').value.SupplierCode, '00');
        if (this.supplierSubCodes.length > 0 && value > 0) {
            let supplier = this.supplierSubCodes.find(s => s.SubCodeId == value);
            if (supplier) {
                let supplierCode = this.contractPurchaseOrderForm.get('Supplier').value.SupplierCode;
                this.contractPurchaseOrderForm.get('Supplier').value.SupplierCode = this.utilService.getSupplierCode(supplierCode, supplier.SubCode);
            }
            else {
                this.contractPurchaseOrderForm.get('Supplier').value.SupplierCode = supplierCode;
            }
        }
        else {
            this.contractPurchaseOrderForm.get('Supplier').value.SupplierCode = supplierCode;
        }
    }
    showFullScreen() {
        this.innerWidth = window.innerWidth;

        if (this.innerWidth > 1000) {
            FullScreen(this.rightPanelRef.nativeElement);
        }

    }
    hideFullScreen() {

    }
    onExpenseFocus(expenseId: number) {
        this.previousAccountId = expenseId;
    }
    onExpenseChange(eventData: any, index: number) {

        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        itemGroupControl.controls[index].patchValue({
            Description: eventData.item.Description

        });
    }

    // onExpenseChange1(eventData: any, rowIndex: number) {
    //     let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
    //     let expenseItem = this.expenseCategories.find(j => j.AccountCodeId == itemGroupControl.controls[rowIndex].get('ExpenseCategoryId').value);
    //     for (let i = 0; i < itemGroupControl.length; i++) {
    //         // if(expenseItem.AccountCodeId==itemGroupControl.controls[i].get('ExpenseCategoryId').value&&i!=rowIndex)
    //         // {
    //         //     itemGroupControl.controls[rowIndex].get('ExpenseCategoryId').setErrors({ duplicate:true });
    //         //     itemGroupControl.controls[rowIndex].get('ExpenseCategoryId').markAsTouched();
    //         //     break;
    //         // }
    //     }
    //     ///removing the duplicate message for items with previous selection...
    //     for (let i = 0; i < itemGroupControl.length; i++) {
    //         if (this.previousAccountId == itemGroupControl.controls[i].get('ExpenseCategoryId').value) {
    //             itemGroupControl.controls[i].get('ExpenseCategoryId').setErrors(null);
    //             itemGroupControl.controls[i].get('ExpenseCategoryId').markAsTouched();
    //             break;
    //         }
    //     }
    //     itemGroupControl.controls[rowIndex].get('Description').setValue(expenseItem.Description);
    // }

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

    validateContractSum(isSave: boolean) {
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        let amount = 0;
        for (let i = 0; i < itemGroupControl.length; i++) {
            amount += itemGroupControl.controls[i].get('Amount').value;
            if (itemGroupControl.controls[i].get('Amount').value == 0 && isSave == true) {
                itemGroupControl.controls[i].get('Amount').setErrors({ 'qtyerror2': true });
            }
        }
        debugger;
        if (Number(amount).toFixed(2) != Number(this.contractPurchaseOrderForm.get('TenureAmountHidden').value).toFixed(2)) {
            this.contractPurchaseOrderForm.get('TenureAmountHidden').setErrors({ 'invalid': true });
            return false;
        }
        else {
            this.contractPurchaseOrderForm.get('TenureAmountHidden').setErrors(null);
        }
        return true;
    }


    markAsTouched() {
        Object.keys(this.contractPurchaseOrderForm.controls).forEach((key: string) => {
            if (this.contractPurchaseOrderForm.controls[key].status == "INVALID" && this.contractPurchaseOrderForm.controls[key].touched == false) {
                this.contractPurchaseOrderForm.controls[key].markAsTouched();
            }
        });
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        itemGroupControl.controls.forEach(controlObj => {
            Object.keys(controlObj["controls"]).forEach((key: string) => {
                let itemGroupControl = controlObj.get(key);
                if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
                    itemGroupControl.markAsTouched();
                }
            });
        });
    }
    Accrualcodechange(event) {
        this.contractPurchaseOrderForm.value.AccrualCode = event;
    }
    PocVerify() {
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        this.contractPurchaseOrderForm.get('TenureAmountHidden').setValue(this.selectedPODetails.SubTotal);
        let frequencyId = this.contractPurchaseOrderForm.get('BillingFrequencyId').value;

        if (frequencyId == 1) {
            this.showSplitbyMonth = false;
            this.contractPurchaseOrderForm.get('SplitByMonthly').setValue(false);
        }
        else {
            this.showSplitbyMonth = true;
        }
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        this.addGridItem(this.selectedPODetails.ContractPurchaseOrderItems.length);
        this.contractPurchaseOrderForm.patchValue(this.selectedPODetails);
        this.AccraulCodeVisible = true;
        this.TaxTypeVisible = true;
        this.AccureTheExpenseVisible = true;
        this.SplitByMonthVisible = true;
        this.ExpenseVisible = true;
        this.ExpenseCodeVisible = false;
        this.TaxGroupVisible = true;
        this.doApproveReject = false;
    }

    Reverify() {
        // if (this.uploadedFiles.length == 0) {
        //     this.confirmationServiceObj.confirm({
        //         message: "Please Attach Documents",
        //         header: "Attachments Validation",
        //         rejectVisible: false,
        //         acceptLabel: "OK"
        //     });
        // }
        // else {
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            rejectVisible: true,
            acceptLabel: "OK",
            accept: () => {
                this.saveRecord('verify');
            }
        });
        //}
    }

    /**
     * to save the given purchase order details
     */
    saveRecord(action: string) {
        let contractPurchaseOrderDetails: ContractPurchaseOrder = this.contractPurchaseOrderForm.value;
        if (action == 'verify') {
            if (this.AccureTheExpenseVisible == true && this.contractPurchaseOrderForm.get('AccruetheExpense').value == true) {
                if (contractPurchaseOrderDetails.AccrualCode != null && Number(contractPurchaseOrderDetails.AccrualCode) == 0) {
                    this.contractPurchaseOrderForm.get('AccrualCode').setValidators([Validators.required, Validators.min(1)]);
                    this.contractPurchaseOrderForm.get('AccrualCode').updateValueAndValidity();
                    return;
                }
                else {
                    this.contractPurchaseOrderForm.get('AccrualCode').clearValidators();
                    this.contractPurchaseOrderForm.get('AccrualCode').updateValueAndValidity();
                }

            }

            // if(this.AccureTheExpenseVisible==false ||( contractPurchaseOrderDetails.AccrualCode !=null  &&  Number(contractPurchaseOrderDetails.AccrualCode) == 0))
            // {
            //     this.contractPurchaseOrderForm.get('AccrualCode').clearValidators();
            //     this.contractPurchaseOrderForm.get('AccrualCode').updateValueAndValidity();
            //     return;
            // }
            // else
            // {
            //     this.contractPurchaseOrderForm.get('AccrualCode').setValidators([Validators.required, Validators.min(1)]);
            //     this.contractPurchaseOrderForm.get('AccrualCode').updateValueAndValidity();
            //     return;
            // }
            this.doApproveReject = true;

        }
        if (this.contractPurchaseOrderForm.get('Discount').value > this.contractPurchaseOrderForm.get('SubTotal').value) {
            this.markAsTouched;
            return;
        }
        let purchaseOrderFormStatus;
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        itemGroupControl.controls.forEach(element => {
            if (element.get('Expense').value == null || '') {
                element.get('Expense').setValidators([Validators.required]);
                element.get('Expense').updateValueAndValidity();
                this.markAsTouched();
                return;
            }

        });
        if ((action == 'send' && this.hidetext == true && this.selectedPODetails.CPOID > 0) || action == 'void') {
            if (this.validateAttachments() == false && action == 'send') {
                this.markAsTouched();
                return;
            }
            let workFlowDetails =
            {
                TotalAmount: this.selectedPODetails.TotalAmount,
                TotalContractSum: this.selectedPODetails.TotalContractSum,
                CPOID: this.selectedPODetails.CPOID,
                CreatedBy: this.selectedPODetails.CreatedBy,
                CPONumber: this.selectedPODetails.CPONumber,
                WorkFlowStatusId: action == 'void' ? WorkFlowStatus.PendingForTerminationApproval : WorkFlowStatus.WaitingForApproval,
                POTypeId: this.selectedPODetails.POTypeId,
                CompanyId: this.selectedPODetails.CompanyId,
                LocationID: this.selectedPODetails.LocationID,
                PurchaseOrderStatusId: this.selectedPODetails.WorkFlowStatusId
            };
            HideFullScreen(null);
            this.contractPoServiceObj.sendForApproval(workFlowDetails)
                .subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.SentForApproval,
                        MessageType: MessageTypes.Success
                    });
                    this.readListView.emit({ PoId: workFlowDetails.CPOID, PotypeId: this.selectedPurchaseOrderTypeId });
                });
            return;
        }
        this.showGridErrorMessage = false;

        if (action == "verify") {
            this.contractPurchaseOrderForm.get('LocationId').setValue(this.selectedPODetails.LocationID);
            purchaseOrderFormStatus = itemGroupControl.status;
        }
        else {
            this.validateDates('save');
            purchaseOrderFormStatus = this.contractPurchaseOrderForm.status;

        }
        if (itemGroupControl.controls.length == 0 && action != "verify") {
            this.showGridErrorMessage = true;
            this.markAsTouched();
            return;
        }
        else if (action != "verify" && this.validateContractSum(true) == false && !this.showReverify) {
            this.markAsTouched();
            return;
        }
        if (purchaseOrderFormStatus != "INVALID") {
            if (action == 'send' && this.validateAttachments() == false) {
                this.markAsTouched();
                return;
            }
            //getting the purchase order form details...
            contractPurchaseOrderDetails.TenureAmount = this.contractPurchaseOrderForm.get('TenureAmount').value;
            contractPurchaseOrderDetails.TotalAmount = this.contractPurchaseOrderForm.get('TotalAmount').value;
            contractPurchaseOrderDetails.TotalTax = this.contractPurchaseOrderForm.get('TotalTax').value;

            contractPurchaseOrderDetails["StartDate"] = this.reqDateFormatPipe.transform(contractPurchaseOrderDetails.StartDate);
            contractPurchaseOrderDetails["EndDate"] = this.reqDateFormatPipe.transform(contractPurchaseOrderDetails.EndDate);
            contractPurchaseOrderDetails["PODate"] = this.reqDateFormatPipe.transform(contractPurchaseOrderDetails.PODate);
            contractPurchaseOrderDetails["ContractSignedDate"] = this.reqDateFormatPipe.transform(contractPurchaseOrderDetails.ContractSignedDate);
            contractPurchaseOrderDetails.POTypeId = this.contractPurchaseOrderForm.get('POTypeId').value;
            let userDetails = <UserDetails>this.sessionService.getUser();
            contractPurchaseOrderDetails.RequestedBy = userDetails.UserID;
            contractPurchaseOrderDetails.CreatedBy = userDetails.UserID;
            contractPurchaseOrderDetails.CompanyId = this.companyId;
            contractPurchaseOrderDetails.TaxGroupId = this.contractPurchaseOrderForm.get('TaxGroupId').value;
            contractPurchaseOrderDetails.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
            contractPurchaseOrderDetails.ContractPurchaseOrderItems.forEach(i => {
                if (contractPurchaseOrderDetails.Discount == null) {
                    contractPurchaseOrderDetails.Discount = 0;
                }
                if (i.CPOItemid > 0) {
                    let previousRecord = this.selectedPODetails.ContractPurchaseOrderItems.find(j => j.CPOItemid == i.CPOItemid);

                    if (
                        i.Description != previousRecord.Description ||
                        i.Expense.AccountCodeId != previousRecord.Expense.AccountCodeId ||
                        i.PaymentValuation != previousRecord.PaymentValuation ||
                        i.Amount != previousRecord.Amount) {
                        i.IsModified = true;
                    }
                }
                else {
                    i.CPOItemid = 0;
                }
            });
            contractPurchaseOrderDetails.ContractPurchaseOrderItems = contractPurchaseOrderDetails.ContractPurchaseOrderItems.filter(i => i.CPOItemid == 0 || i.CPOItemid == null || i.IsModified == true);
            HideFullScreen(null);
            if (this.selectedPODetails.CPOID == 0 || this.selectedPODetails.CPOID == null) {
                contractPurchaseOrderDetails.CPOID = 0;
                this.contractPoServiceObj.createPurchaseOrder(contractPurchaseOrderDetails, this.uploadedFiles)
                    .subscribe((purchaseOrderId: number) => {
                        this.readListView.emit({ PoId: 0, PotypeId: this.selectedPurchaseOrderTypeId });
                        this.hidetext = true;
                        this.hideinput = false;
                        this.uploadedFiles.length = 0;
                        this.uploadedFiles = [];
                        this.recordInEditMode = -1;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.showGridErrorMessage = false;
                        this.ShowErrorMessage = false;
                    }, (data: { ExceptionMessage: string }) => {

                        if (data.ExceptionMessage == ResponseStatusTypes.Duplicate) {

                        }
                    });
                if (this.sharedServiceObj.PORecordslength == 0) {
                    this.hideFullScreen();
                }
            }
            else {
                contractPurchaseOrderDetails.TaxAmount = this.contractPurchaseOrderForm.get('TaxAmount').value;
                contractPurchaseOrderDetails.TotalAmount = this.contractPurchaseOrderForm.get('TotalAmount').value;
                contractPurchaseOrderDetails.TotalTax = this.contractPurchaseOrderForm.get('TotalTax').value;
                contractPurchaseOrderDetails.CPOID = this.selectedPODetails.CPOID;
                contractPurchaseOrderDetails.UpdatedBy = this.userDetails.UserID;
                contractPurchaseOrderDetails.PurchaseOrderItemsToDelete = this.deletedPurchaseOrderItems;
                contractPurchaseOrderDetails.Attachments = this.selectedPODetails.Attachments.filter(i => i.IsDelete == true);
                if (action == "verify") {
                    if (this.showReverify) {
                        contractPurchaseOrderDetails.WorkFlowStatusId = WorkFlowStatus.Approved;
                    }
                    this.contractPoServiceObj.updateAccraulCode(contractPurchaseOrderDetails, this.uploadedFiles)
                        .subscribe((purchaseOrderId: number) => {
                            this.readListView.emit({ PoId: contractPurchaseOrderDetails.CPOID, PotypeId: this.selectedPurchaseOrderTypeId });
                            if (purchaseOrderId == 1) {
                                this.sharedServiceObj.showMessage({
                                    ShowMessage: true,
                                    Message: Messages.VerifierMessage,
                                    MessageType: MessageTypes.Success
                                });
                            }
                            this.AccraulCodeVisible = false;
                            this.TaxTypeVisible = false;
                            this.AccureTheExpenseVisible = false;
                            this.SplitByMonthVisible = false;
                            this.ExpenseVisible = false;
                            this.TaxGroupVisible = false;
                            this.selectedPODetails.AccrualCode = contractPurchaseOrderDetails.AccrualCode;
                            this.showGridErrorMessage = false;
                            this.ExpenseCodeVisible = true;
                            this.ShowErrorMessage = false;
                            this.cancelReverify();
                            this.onRecordSelection(contractPurchaseOrderDetails.CPOID);

                        });

                }
                else {
                    this.contractPoServiceObj.updatePurchaseOrder(contractPurchaseOrderDetails, this.uploadedFiles)
                        .subscribe((purchaseOrderId: number) => {
                            this.hidetext = true;
                            this.hideinput = false;
                            this.uploadedFiles.length = 0;
                            this.uploadedFiles = [];
                            this.deletedPurchaseOrderItems = [];
                            this.deletedPurchaseOrderItems.length = 0;
                            this.recordInEditMode = -1;
                            this.readListView.emit({ PoId: contractPurchaseOrderDetails.CPOID, PotypeId: this.selectedPurchaseOrderTypeId });
                            this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.UpdatedSuccessFully,
                                MessageType: MessageTypes.Success
                            });


                            this.showGridErrorMessage = false;
                            this.ShowErrorMessage = false;
                        }, (data: { ExceptionMessage: string }) => {
                            if (data.ExceptionMessage == ResponseStatusTypes.Duplicate) {

                            }
                        });
                }
            }
        }
        else {
            this.markAsTouched();
        }
       
    }
    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the purchase order details on cancel button click event..
     */
    cancelRecord() {
        //setting this variable to true so as to show the purchase details
        this.hasWorkFlow = true;
        this.contractPurchaseOrderForm.reset();
        this.contractPurchaseOrderForm.setErrors(null);
        let contractSumControl = this.contractPurchaseOrderForm.get('TenureAmountHidden');
        contractSumControl.setErrors(null);
        this.cancelChanges.emit(true);
        this.hideinput = false;
        this.hidetext = true;
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.ShowErrorMessage = false;
        this.isSupplierSelected = false;
        this.supplierid = 0;
        
    }
    cancel() {
        this.contractPurchaseOrderForm.get('AccrualCode').setValue(this.selectedPODetails.AccrualCode);
        this.AccraulCodeVisible = false;
        this.TaxTypeVisible = false;
        this.AccureTheExpenseVisible = false;
        this.SplitByMonthVisible = false;
        this.TaxGroupVisible = false;
        this.doApproveReject = true;
        this.cancelChanges.emit(true);
        // this.ExpenseVisible = false;
    }

    onDepChage(event: any, department: any) {
        this.deptId = event.target.value;
        this.getWorkFlowConfiguration(department.selectedOptions[0].label);
    }

    getWorkFlowConfiguration(deptName: String) {
        this.processId = this.contractPurchaseOrderForm.get('POTypeId').value;
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
     * 

     * to delete the selected record...
     */
    deleteRecord() {
        let recordId = this.selectedPODetails.CPOID;
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                this.contractPoServiceObj.deletePurchaseOrder(recordId, userDetails.UserID).subscribe((data) => {
                    this.readListView.emit({ PoId: 0, PotypeId: this.selectedPurchaseOrderTypeId });
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });
                    // this.getPurchaseOrders(0);
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
        this.supplierid = 0;
        //resetting the item category form.
        this.contractPurchaseOrderForm.reset();
        this.contractPurchaseOrderForm.get('ContractPurchaseOrderItems').reset();
        this.contractPurchaseOrderForm.setErrors(null);
        this.contractPurchaseOrderForm.get('Remarks').setErrors(null);
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        this.addGridItem(this.selectedPODetails.ContractPurchaseOrderItems.length);
        this.contractPurchaseOrderForm.patchValue(this.selectedPODetails);
        this.contractPurchaseOrderForm.get('StartDate').setValue(new Date(this.selectedPODetails.StartDate));
        this.contractPurchaseOrderForm.get('EndDate').setValue(new Date(this.selectedPODetails.EndDate));
        this.contractPurchaseOrderForm.get('PODate').setValue(new Date(this.selectedPODetails.PODate));
        this.contractPurchaseOrderForm.get('LocationId').setValue(this.selectedPODetails.LocationID);
        this.contractPurchaseOrderForm.get('TenureAmountHidden').setValue(this.selectedPODetails.SubTotal);
        this.onSupplierChange(null, true);
        this.calculateTotalPrice();
        this.showFullScreen();
        if (this.selectedPODetails.AccrualCode > "0") {
            this.hideGLCode = true;
            this.contractPurchaseOrderForm.get('AccrualCode').setValidators([Validators.required, Validators.min(1)]);
            this.contractPurchaseOrderForm.get('AccrualCode').updateValueAndValidity();

        }
        this.supplierid = this.selectedPODetails.Supplier.SupplierId;
        if (this.selectedPODetails.SupplierSubCodeId === null) {
            this.isSupplierSelected = true;
            this.contractPurchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
            this.contractPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
        }

        if (this.selectedPODetails.StartDate != null && this.selectedPODetails.EndDate != null) {
            this.setContractDate(this.selectedPODetails.StartDate, this.selectedPODetails.EndDate);
        }

        this.CalculatePOAmount()
    }
    /**
     * this method will be called on currency change event...
     */
    onCurrencyChange() {
        let currencyId = this.contractPurchaseOrderForm.get('CurrencyId').value;
        this.selectedPODetails.CurrencySymbol = this.currencies.find(i => i.Id == currencyId).Symbol;
    }
    //to get the sub totalprice..
    getSubTotal() {
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        if (itemGroupControl != undefined) {
            let subTotal = 0;
            itemGroupControl.controls.forEach(data => {
                subTotal = subTotal + data.get('Amount').value;
            });
            return subTotal;
        }
    }
    //getting the total tax..
    getTotalTax(taxId: number) {
        let taxRate = 0;
        if (this.taxTypes.find(j => j.TaxId == taxId) != undefined) {
            taxRate = this.taxTypes.find(j => j.TaxId == taxId).TaxAmount;
        }
        let discount = this.contractPurchaseOrderForm.get('Discount').value;
        let totalTax = ((this.getSubTotal() - discount) * taxRate) / 100;
        this.contractPurchaseOrderForm.get('TotalTax').setValue(totalTax);
        this.contractPurchaseOrderForm.get('TaxAmount').setValue(taxRate);
        return totalTax;
    }
    //to get total price..
    calculateTotalPrice() {
        let subTotal = this.getSubTotal();
        let contractSumControl = this.contractPurchaseOrderForm.get('TenureAmountHidden');
        let contractSum = contractSumControl.value;

        if (contractSum != subTotal) {
            contractSumControl.setErrors({ 'invalid': true });
            contractSumControl.markAsTouched();
        }
        else {
            contractSumControl.setErrors(null);
        }
        this.contractPurchaseOrderForm.get('SubTotal').setValue(subTotal);
        let discount = this.contractPurchaseOrderForm.get('Discount').value;
        let totalTax = this.getTotalTax(this.contractPurchaseOrderForm.get('TaxId').value);
        totalTax = Number(totalTax.toFixed(2));
        this.contractPurchaseOrderForm.get('TotalTax').setValue(totalTax);
        let totalPrice = (subTotal - discount) + totalTax;
        this.contractPurchaseOrderForm.get('TotalAmount').setValue(totalPrice);
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
    update(status: number, rejectRemarks: string = "") {
        this.AccraulCodeVisible = false;
        this.TaxTypeVisible = false;
        this.AccureTheExpenseVisible = false;
        this.SplitByMonthVisible = false;
        this.TaxGroupVisible = false;
        let remarks = "";
        let successMessage = "";
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
        let PendingTApproval: number = 0;
        let isAccepted: boolean = true;
        if (status != WorkFlowStatus.Rejected) {
            remarks = this.contractPurchaseOrderForm.get('Remarks').value;
            remarks = (this.IsVerifier && status == WorkFlowStatus.Approved) ? "Verified" : remarks;
            if (status == WorkFlowStatus.AskedForClarification || status == WorkFlowStatus.WaitingForApproval) {
                if (remarks.trim() == "" || remarks.trim() == null) {
                    this.contractPurchaseOrderForm.get('Remarks').setErrors({ "required": true });
                    return;
                }
            }
        }
        else {
            remarks = rejectRemarks;
        }
        if (this.selectedPODetails.WorkFlowStatusId == WorkFlowStatus.ReturnForVoidClarifications && this.isMaster) {
            status = WorkFlowStatus.ReturnForVoidClarifications;
        }
        // if (this.selectedPODetails.WorkFlowStatusId == WorkFlowStatus.AskedForClarification && this.isMaster) {
        //     status = WorkFlowStatus.AskedForClarification;
        // }
        if ((this.isApprovalPage == true) && (status == WorkFlowStatus.AskedForClarification)
            && (this.selectedPODetails.WorkFlowStatusId == WorkFlowStatus.PendingForTerminationApproval || this.selectedPODetails.WorkFlowStatusId == WorkFlowStatus.ReturnForVoidClarifications)) {
            status = WorkFlowStatus.ReturnForVoidClarifications;
        }
        else if ((Number(status) == WorkFlowStatus.WaitingForApproval) && (this.selectedPODetails.WorkFlowStatusId == WorkFlowStatus.PendingForTerminationApproval)) {
            status = WorkFlowStatus.PendingForTerminationApproval;
        }
        else if ((Number(status) == WorkFlowStatus.Rejected) && (this.selectedPODetails.WorkFlowStatusId == WorkFlowStatus.PendingForTerminationApproval)) {
            status = WorkFlowStatus.Rejected;
            PendingTApproval = WorkFlowStatus.PendingForTerminationApproval;
            isAccepted = false;
        }
        else if ((Number(status) == WorkFlowStatus.Rejected) && (this.selectedPODetails.WorkFlowStatusId === WorkFlowStatus.ReturnForVoidClarifications)) {
            PendingTApproval = WorkFlowStatus.PendingForTerminationApproval;
            isAccepted = false;

        }
        let statusObj: PoApprovalUpdateStatus = {
            StatusId: status,
            Remarks: remarks,
            ProcessId: this.selectedPODetails.POTypeId == PurchaseOrderType.ContractPoFixed ? WorkFlowProcess.ContractPOFixed : WorkFlowProcess.ContractPOVariable,
            PoCode: this.selectedPODetails.CPONumber,
            ApproverUserId: this.selectedPODetails.CurrentApproverUserId,
            StartDate: this.selectedPODetails.StartDate,
            EndDate: this.selectedPODetails.EndDate,
            BillingFrequencyId: this.selectedPODetails.BillingFrequencyId,
            PODate: this.selectedPODetails.PODate,
            CompanyId: this.selectedPODetails.CompanyId,
            //IsAccept:isAccepted,
            PendingTA: PendingTApproval,
            IsVoid: (this.selectedPODetails.WorkFlowStatusId == WorkFlowStatus.PendingForTerminationApproval || this.selectedPODetails.WorkFlowStatusId == WorkFlowStatus.ReturnForVoidClarifications) ? true : false,
            IsAccept: isAccepted//((status==WorkFlowStatus.Rejected)?false:true)

        };
        this.updateStatus.emit(statusObj);
    }
    validateDates(from: string) {
        debugger
        let startDateControl = this.contractPurchaseOrderForm.get('StartDate');
        let endDateControl = this.contractPurchaseOrderForm.get('EndDate');
        let poDateControl = this.contractPurchaseOrderForm.get('PODate');
        let startDate = <Date>startDateControl.value;
        let endDate = <Date>endDateControl.value;
        let poDate = <Date>poDateControl.value;
        if (startDate != null && endDate != null) {
            if (from == "start") {
                if (endDate != null && startDate >= endDate) {
                    startDateControl.setErrors({
                        'invalid_date': true
                    });
                    startDateControl.markAsTouched();
                    return;
                }
            }
            else if (from == "end") {
                if (startDate != null && startDate >= endDate) {
                    endDateControl.setErrors({
                        'invalid_date': true
                    });
                    endDateControl.markAsTouched();
                    return;
                }
            }
        }
        if (startDate != null && endDate != null && poDate != null && (startDate > poDate || endDate < poDate)) {
            poDateControl.setErrors({
                'invalid_date': true
            });
            poDateControl.markAsTouched();
            return;
        }
        let frequencyId = this.contractPurchaseOrderForm.get('BillingFrequencyId').value;

        if (frequencyId == 1) {
            this.showSplitbyMonth = false;
            this.contractPurchaseOrderForm.get('SplitByMonthly').setValue(false);
        }
        else {
            this.showSplitbyMonth = true;
        }
        if (startDate != null && endDate != null) {

            let splitByMonthly = this.contractPurchaseOrderForm.get('SplitByMonthly').value;
            let monthsDiff = this.monthDiff(startDate, endDate);
            let diffc = endDate.getTime() - startDate.getTime();
            let daysDiff = Math.round(Math.abs(diffc / (1000 * 60 * 60 * 24)));
            let freqInMonths = this.getFrequencyInMonths(frequencyId, splitByMonthly);
            // if (monthsDiff < freqInMonths || daysDiff < 30) {
            if (monthsDiff < freqInMonths) {
                this.contractPurchaseOrderForm.get('BillingFrequencyId').setErrors({
                    'invalid_date': true
                });
            }
            else {
                this.contractPurchaseOrderForm.get('BillingFrequencyId').setErrors(null);
            }
            this.contractPurchaseOrderForm.get('BillingFrequencyId').markAsTouched();
            this.CalculatePOAmount();
            //this.setContractDate(endDate, startDate);
            this.contractPurchaseOrderForm.get('ContractTerms').setValue(monthsDiff + (monthsDiff == 1 ? " Month " : " Months "));
        }
    }

    setContractDate(endDate: Date, startDate: Date) {
        // let totalDays = Math.abs((endDate.getTime()-startDate.getTime())/(24*60*60*1000));   
        // let years = Math.floor(totalDays/365.25);
        // let months = (totalMonths) - (years*12);
        //  let days = Math.floor(totalDays-((years*365.25)+(months*30)));
        // if(days>0)
        // {
        //     contractTerms+= days +(months==1?" Day ":" Days ");
        // }
        //let totalMonths = Math.ceil(moment(endDate).diff(moment(startDate),'months',true));

        //let years = moment(endDate).diff(moment(startDate),'years');
        let totalDays = Math.abs((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        let monthss = Math.round(totalDays / 30);
        let totalMonths = this.monthDiff(startDate, endDate);
        //let months = (totalMonths) - (years*12);   
        let contractTerms: string = "";
        // if(years > 0)
        // {
        //     contractTerms = years+(years==1?" Year ":" Years ");
        // }
        if (monthss > 0) {
            contractTerms += monthss + (monthss == 1 ? " Month " : " Months ");
        }
        //if(endDate.getDate())
        this.contractPurchaseOrderForm.get('ContractTerms').setValue(contractTerms);
    }

    // monthDiff(endDate: Date, startDate: Date) {
    //     if (endDate != null && startDate != null) {
    //         let months;
    //         months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    //         months += months == 0 ? (endDate.getMonth() - startDate.getMonth()) + 1 : (endDate.getMonth() - startDate.getMonth());
    //         if (months == 11 || months == 23 || months == 35 || months == 47 || months == 59 || months == 71)
    //             months = months + 1;
    //         return months <= 0 ? 0 : months;
    //     }
    // }
    monthDiff(firstDate, secondDate) {
        var startDate = moment(firstDate, 'DD-MM-YYYY');
        var endDate = moment(secondDate, 'DD-MM-YYYY');
        var result = endDate.diff(startDate, 'months');
        var months = (result) + 1;
        return months;
    }
    getFrequencyInMonths(frequencyId: number, splitByMonth: boolean): number {
        let months = 0;
        if (frequencyId == 1 || splitByMonth == true)//monthly
        {
            months = 1;
        }
        else if (frequencyId == 2)//quarterly
        {
            months = 3;
        }
        else if (frequencyId == 3)//half yearly
        {
            months = 6;
        }
        else if (frequencyId == 4)//yearly
        {
            months = 12;
        }
        else if (frequencyId == 5)//Bi-monthly
        {
            months = 2;
        }
        return months;
    }
    restrictMinus(e: any) {
        restrictMinus(e);
    }
    CalculatePOAmount() {

        debugger;
        let Amount = this.contractPurchaseOrderForm.get('TotalContractSum').value;
        let splitByMonthly = this.contractPurchaseOrderForm.get('SplitByMonthly').value;
        let frequency = this.getFrequencyInMonths(this.contractPurchaseOrderForm.get('BillingFrequencyId').value, splitByMonthly);
        let f2 = this.getFrequencyInMonths(this.contractPurchaseOrderForm.get('BillingFrequencyId').value, false);
        let totalDays = Math.abs((this.contractPurchaseOrderForm.get('EndDate').value.getTime() - this.contractPurchaseOrderForm.get('StartDate').value.getTime()) / (24 * 60 * 60 * 1000));
        let diff = this.monthDiff(this.contractPurchaseOrderForm.get('StartDate').value, this.contractPurchaseOrderForm.get('EndDate').value);
        let mnts = Math.round(totalDays / 30);
        let tenureAmount: number = Amount / (diff / frequency);
        let tenureToDisplay: number = Amount / (diff / f2);
        this.contractPurchaseOrderForm.get('TenureAmount').setValue(tenureToDisplay.toFixed(2));
        this.contractPurchaseOrderForm.get('TenureAmountToDisplay').setValue(tenureAmount.toFixed(2));
        this.contractPurchaseOrderForm.get('TenureAmountHidden').setValue(tenureToDisplay.toFixed(2));
        this.validateContractSum(false);
    }
    displayVoidPopUp(isVoid: boolean) {
        this.isVoid = isVoid;
        let userDetails = <UserDetails>this.sessionService.getUser();
        let statusid = this.workFlowStatus.Rejected;
        if (statusid == WorkFlowStatus.Rejected) {
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
        this.showVoidPopUp = true;
    }
    onStatusUpdate(purchaseOrderId: number) {
        this.showVoidPopUp = false;
        this.readListView.emit({ PoId: purchaseOrderId, PotypeId: this.selectedPurchaseOrderTypeId });
        //this.onRecordSelection(purchaseOrderId);
    }
    hideVoidPopUp(hidePopUp: boolean) {
        this.showVoidPopUp = false;
    }
    getDepartments(companyId: number) {
        this.sharedServiceObj.getUserDepartments(companyId, this.contractPurchaseOrderForm.get('POTypeId').value, this.userDetails.UserID)
            .subscribe((data: Location[]) => {
                this.departments = data;
            });
    }
    recallPoApproval() {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let poId = this.selectedPODetails.CPOID;
        let approvalObj = {
            PurchaseOrderId: poId,
            POTypeId: this.selectedPODetails.POTypeId,
            CreatedBy: userDetails.UserID,
            PurchaseOrderCode: this.selectedPODetails.CPONumber,
            PurchaseOrderType: this.selectedPODetails.POTypeId == PurchaseOrderType.ContractPoFixed ? "Contract PO Fixed" : "Contract PO Variable",
            Supplier: this.selectedPODetails.Supplier,
            TotalAmount: this.selectedPODetails.TotalAmount,
            ExpectedDeliveryDate: this.selectedPODetails.EndDate,
            CurrentApproverUserName: this.selectedPODetails.CurrentApproverUserName,
            CreatedByUserName: userDetails.UserName,
            CurrentApproverUserId: this.selectedPODetails.CurrentApproverUserId,
            PurchaseOrderStatusText: this.selectedPODetails.PurchaseOrderStatusText,
            CompanyId: this.companyId,
            CurrencySymbol: this.selectedPODetails.CurrencySymbol,
            ContractStartDate: this.selectedPODetails.StartDate
        };
        HideFullScreen(null);
        this.purchaseOrderCreationObj.recallPoApproval(approvalObj)
            .subscribe(() => {
                this.readListView.emit({ PoId: poId, PotypeId: this.selectedPurchaseOrderTypeId });
            });
            this.cancelChanges.emit(true);    
    }
    reject(remarks: string) {
        this.update(WorkFlowStatus.Rejected, remarks);
    }
    generatePoc() {
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedGeneratePOC,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let poObj = {
                    CPOID: this.selectedPODetails.CPOID,
                    CreatedBy: userDetails.UserID,
                    StartDate: this.selectedPODetails.StartDate,
                    EndDate: this.selectedPODetails.EndDate,
                    PoDate: this.selectedPODetails.PODate,
                    BillingFrequencyId: this.selectedPODetails.BillingFrequencyId,
                    SplitByMonthly: this.selectedPODetails.SplitByMonthly,
                    SupplierSubCodeId: this.selectedPODetails.SupplierSubCodeId,
                    Discount: this.selectedPODetails.Discount,
                    TaxGroupId: this.selectedPODetails.TaxGroupId
                };
                this.contractPoServiceObj.generatePoc(poObj).subscribe((data) => {
                    if (data !=null) {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.PocGenerationSuccessfully,
                            MessageType: MessageTypes.Success
                        });
                    }
                    else if (data == 0) {
                        this.confirmationServiceObj.confirm({
                            message: Messages.PoGenerationNotAllowd,
                            header: Messages.ActionNotAllowed,
                            rejectVisible: false,
                            accept: () => {

                            },
                            acceptLabel: "Ok"
                        });
                    }
                });
            },
            reject: () => {
            }
        });


    }

    ShowList() {
        let showlistcount;
        this.contractPoServiceObj.GetPocCount(this.selectedPODetails.CPOID).subscribe((count: number) => {
            showlistcount = count;

            if (showlistcount > 0) {

                this.router.navigate(['/po/contractpo'], {
                    queryParams: {
                        type: 'child', code: this.selectedPODetails.CPONumber.replace('-', ''),
                        processId: this.selectedPODetails.POTypeId,
                        Id: this.selectedPODetails.CPOID,
                        Permission: this.voidPermission,
                        dat: new Date().toJSON()
                    }

                });
                let roleAccessLevels = this.sessionService.getRolesAccess();
                if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                    let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "poc")[0];
                    this.editPermission = formRole.IsEdit;
                    this.approvePermission = formRole.IsApprove;
                    this.voidPermission = formRole.IsVoid;

                }
                else {
                    this.editPermission = true;
                    this.approvePermission = true;
                    this.voidPermission = true;

                }
            }
            else {
                this.confirmationServiceObj.confirm({
                    message: "No POC's Generated",
                    header: Messages.PopupHeader,
                    accept: () => {
                    },
                    rejectVisible: false,
                    acceptLabel: "Ok"
                });
            }
        });
    }

    getPoType(PotypeId: number) {
        if (PotypeId == 5) {
            this.hideMargin = false;
            this.contractPurchaseOrderForm.get('Margin').setValue(0);
        }
        else {
            this.hideMargin = true;
            this.contractPurchaseOrderForm.get('Margin').setValue('');
        }
        this.getDepartments(this.companyId);
    }
    showHideCode() {
        let isAccured = this.contractPurchaseOrderForm.get('AccruetheExpense').value;
        console.log(isAccured);
        this.contractPurchaseOrderForm.get('AccrualCode').setValue(0);
        if (isAccured) {
            this.hideGLCode = true;
            this.contractPurchaseOrderForm.get('AccrualCode').setValidators([Validators.required, Validators.min(1)]);
        }
        else {
            this.hideGLCode = false;
            this.contractPurchaseOrderForm.get('AccrualCode').clearValidators();
        }
        this.contractPurchaseOrderForm.get('AccrualCode').updateValueAndValidity();
        this.contractPurchaseOrderForm.get('AccrualCode').markAsTouched();
    }

    recallTerminateApproval() {
        let userDetails = <UserDetails>this.sessionService.getUser();
        let poId = this.selectedPODetails.CPOID;
        let approvalObj = {
            PurchaseOrderId: poId,
            POTypeId: this.selectedPODetails.POTypeId,
            CreatedBy: userDetails.UserID,
            PurchaseOrderCode: this.selectedPODetails.CPONumber,
            PurchaseOrderType: this.selectedPODetails.POTypeId == PurchaseOrderType.ContractPoFixed ? "Contract PO Fixed" : "Contract PO Variable",
            Supplier: this.selectedPODetails.Supplier,
            TotalAmount: this.selectedPODetails.TotalAmount,
            ExpectedDeliveryDate: this.selectedPODetails.EndDate,
            CurrentApproverUserName: this.selectedPODetails.CurrentApproverUserName,
            CreatedByUserName: userDetails.UserName,
            CurrentApproverUserId: this.selectedPODetails.CurrentApproverUserId,
            PurchaseOrderStatusText: this.selectedPODetails.PurchaseOrderStatusText,
            WorkFlowStatusId: WorkFlowStatus.Approved,
            CompanyId: this.companyId,
            CurrencySymbol: this.selectedPODetails.CurrencySymbol,
            TerminateStatusId: this.selectedPODetails.WorkFlowStatusId
        };
        this.purchaseOrderCreationObj.recallPoApproval(approvalObj)
            .subscribe(() => {
                this.readListView.emit({ PoId: poId, PotypeId: this.selectedPurchaseOrderTypeId });
            });
    }
    enableReverify() {
        this.showReverify = true;
        this.AccraulCodeVisible = true;
        this.TaxTypeVisible = true;
        this.AccureTheExpenseVisible = true;
        // this.SplitByMonthVisible = true;
        this.ExpenseVisible = true;
        this.ExpenseCodeVisible = false;
        this.TaxGroupVisible = true;
        this.contractPurchaseOrderForm.reset();
        this.contractPurchaseOrderForm.get('ContractPurchaseOrderItems').reset();
        this.contractPurchaseOrderForm.setErrors(null);
        this.contractPurchaseOrderForm.get('Remarks').setErrors(null);
        let itemGroupControl = <FormArray>this.contractPurchaseOrderForm.controls['ContractPurchaseOrderItems'];
        itemGroupControl.controls = [];
        itemGroupControl.controls.length = 0;
        this.addGridItem(this.selectedPODetails.ContractPurchaseOrderItems.length);
        this.contractPurchaseOrderForm.patchValue(this.selectedPODetails);
        this.contractPurchaseOrderForm.get('StartDate').setValue(new Date(this.selectedPODetails.StartDate));
        this.contractPurchaseOrderForm.get('EndDate').setValue(new Date(this.selectedPODetails.EndDate));
        this.contractPurchaseOrderForm.get('PODate').setValue(new Date(this.selectedPODetails.PODate));
        this.contractPurchaseOrderForm.get('LocationId').setValue(this.selectedPODetails.LocationID);
        this.contractPurchaseOrderForm.get('TenureAmountHidden').setValue(this.selectedPODetails.SubTotal);
        this.onSupplierChange(null, true);
        this.calculateTotalPrice();
        if (this.selectedPODetails.AccrualCode > "0") {
            this.hideGLCode = true;
            this.contractPurchaseOrderForm.get('AccrualCode').setValidators([Validators.required, Validators.min(1)]);
            this.contractPurchaseOrderForm.get('AccrualCode').updateValueAndValidity();

        }
        this.getTaxTypeByTaxGroupForVerify(this.selectedPODetails.TaxGroupId);
        this.supplierid = this.selectedPODetails.Supplier.SupplierId;
        if (this.selectedPODetails.SupplierSubCodeId === null) {
            this.isSupplierSelected = true;
            this.contractPurchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
            this.contractPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
        }
        // if (this.selectedPODetails.StartDate != null && this.selectedPODetails.EndDate != null) {
        //     this.setContractDate(this.selectedPODetails.StartDate, this.selectedPODetails.EndDate);
        // }
        this.CalculatePOAmount();
    }
    cancelReverify() {
        this.showReverify = false;
        this.uploadedFiles = [];
        this.AccraulCodeVisible = false;
        this.TaxTypeVisible = false;
        this.AccureTheExpenseVisible = false;
        this.SplitByMonthVisible = false;
        this.ExpenseVisible = false;
        this.ExpenseCodeVisible = false;
        this.TaxGroupVisible = false;
    }
    getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }
    ClickBack(e)
    {
        //po/contractpolist/child/2
        this.router.navigate([`po/contractpolist/${'master'}/${this.getRandomInt(10)}`]);
    }
}
