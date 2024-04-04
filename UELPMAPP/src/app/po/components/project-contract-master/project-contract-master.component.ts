import { element } from 'protractor';
import { PreventiveMaintenanceComponent } from './../../../facility/components/preventive-maintenance/preventive-maintenance.component';
import { DiscountLineItems, POPDistributionSummary, ProjectMasterContractItems, } from './../../models/project-contract-master.model';
import { Component, OnInit, ViewChild, Renderer, ElementRef, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ProjectMasterContract, POPCostCategory, POPApportionment, ProjectMasterContractDisplayResult, CostTypes, ProjectContractMasterFilterModel } from '../../models/project-contract-master.model';
import { SharedService } from '../../../shared/services/shared.service';
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { ExpensesType } from '../../models/expense-master.model';
import {
    Suppliers, BillingFrequency, Months, Taxes, PagerConfig, Messages, MessageTypes, UserDetails,
    WorkFlowStatus, Location, WorkFlowProcess, WorkFlowApproval, WorkFlowStatusModel,
    PurchaseOrderType, Companies, COAAccountType, BillingType, ItemGLCode
} from '../../../shared/models/shared.model';
import { ProjectContractMasterService } from '../../services/project-contract-master.service';
import { FullScreen, HideFullScreen, restrictMinus, ValidateFileType } from '../../../shared/shared';
import { AccountCodeMaster } from '../../models/account-code.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { CostCentre } from '../../../inventory/models/cost-centre.model';
import { TaxGroup } from '../../models/tax.model';
import { TaxService } from '../../services/tax.service';
import { ServiceType } from '../../models/service-type.model';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import * as moment from 'moment';
import _ from "lodash";
import { Supplier, SupplierSubCode } from '../../models/supplier';
import { SupplierApiService } from "../../services/supplier-api.service";
import { SupplierServices } from '../../models/supplier-service.model';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { AccountCodeAPIService } from '../../services/account-code-api.service';
import { AccountType, AccountCode } from '../../models/account-code.model';
import { POCreationService } from "../../services/po-creation.service";
import { WorkFlowApiService } from '../../../administration/services/workflow-api.service';
import { ConfirmationService } from "primeng/components/common/api";
import { faLessThanEqual } from '../../../../../node_modules/@fortawesome/free-solid-svg-icons';
import { UtilService } from '../../../shared/services/util.service';
import { environment } from '../../../../environments/environment';
import { CurrencyMaskInputMode } from 'ngx-currency';
import { PageAccessLevel, Roles } from '../../../administration/models/role';
import { CMPaymentColumns, CMVOColumns, ProjectPayment, PTableColumn } from '../../models/project-payment-history.model';
import { ProjectPaymentMasterService } from '../../services/project-payment-history.service';
import { VariationOrder } from '../../models/project-variation-order.model';
import { ProjectContractVariationApiService } from '../../services/project-contract-variation.api.service';


@Component({
    selector: 'app-project-contract-master',
    templateUrl: './project-contract-master.component.html',
    styleUrls: ['./project-contract-master.component.css'],
    providers: [POCreationService, ProjectContractMasterService, TaxService, SupplierApiService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ProjectContractMasterComponent implements OnInit {
    options2precision = { prefix: '', precision: 2, inputMode: CurrencyMaskInputMode.NATURAL };
    options4precision = { prefix: '', precision: 4, inputMode: CurrencyMaskInputMode.NATURAL };
    options8precision = { prefix: '', precision: 8, inputMode: CurrencyMaskInputMode.NATURAL };
    userDetails: UserDetails = null;
    @Output()
    readListView: EventEmitter<{ PoId: number, PotypeId: number }> = new EventEmitter<{ PoId: number, PotypeId: number }>(); //creating an output event
    @Output()
    cancelChanges: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('documentCode') private docCodeRef: any;
    @ViewChild('AccountType')
    optionIst: ElementRef;
    @ViewChild('SubCategory')
    optionSec: ElementRef;
    moduleHeading = "Project Contract Master";
    companyId: number = 0;
    supplierid: number;
    currentPage: number = 0;
    errorMessage: string = Messages.NoRecordsToDisplay;
    hideText?: boolean = null;
    hideInput?: boolean = null;
    linesToAdd: number = 2;
    linesToAdd1: number = 2;
    linesToAddCostCategory: number = 2;
    linesToAddApportionment: number = 2;
    linesToAddDistribution: number = 2;
    selectedProjectContractMasterId = -1;
    adHocContractTypes: Array<{ Id: number, Value: string }> = [];
    billingMonths: Array<{ Id: number, Value: string }> = [];
    costCentres: Array<CostCentre> = [];
    costTypes: Array<CostTypes> = [];
    departments: Array<Location> = [];
    expenses: Array<AccountCodeMaster> = [];
    expenseTypes: Array<ExpensesType> = [];
    frequencyTypes: Array<BillingFrequency> = [];
    projectMasterContractItemColumns: Array<{ field: string, header: string, width?: string }> = [];
    POPCostCategoryColumns: Array<{ field: string, header: string, width: string }> = [];
    POPApportionmentColumns: Array<{ field: string, header: string, width: string }> = [];
    POPDistributionSummaryColumns: Array<{ field: string, header: string, width: string }> = [];
    projectPoList: Array<ProjectMasterContract> = [];
    serviceTypes: Array<ServiceType> = [];
    taxGroups: Array<TaxGroup> = [];
    taxTypes: Array<Taxes> = [];
    taxRateTypes: Array<Taxes> = [];
    uploadedFiles: Array<File> = [];
    isSameUSer: boolean = false;
    isApproverUser: boolean = false;
    projectPurchaseOrderForm: FormGroup;
    selectedPODetails: ProjectMasterContract;
    purchaseOrderPagerConfig: PagerConfig;
    requestSearchKey: string = "";
    requestType: string = "";
    workFlowStatus: any;
    isApprovalPage: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    poFilterInfoForm: FormGroup;
    workFlowStatuses: Array<WorkFlowStatusModel> = [];
    filterMessage: string = "";
    isFilterApplied: boolean = false;
    showFilterPopUp: boolean = false;
    showGridErrorMessage1: boolean = false;
    showGridErrorMessage2: boolean = false;
    showGridErrorMessage3: boolean = false;
    showVoidPopUp: boolean = false;
    showRecallPopup: boolean = false;
    isVoid: boolean = false;
    // hidetext?: boolean = null;
    // hideinput?: boolean = null;
    poTypeId: number = 0;
    leftSection: boolean = false;
    rightsection: boolean = false;
    scrollbarOptions: any;
    supplierSubCodes = [];
    retentionSubcode: Array<SupplierSubCode> = [];
    accountTypes: Array<COAAccountType> = [];
    billingTypes: Array<BillingType> = [];
    isRetentionApplicable: boolean = false;
    CostTypes: any[] = [];
    cureencySymbol: string = "S$ ";
    supplierServices: Array<SupplierServices> = [];
    TaxGroupId: number;
    TaxId: number;
    showGlCodeDialog: boolean = false;
    showLogPopUp: boolean = false;
    AccountCodeInfoForm: FormGroup;
    accountCodeCategories = [];
    defaultAccountType: number = 0;
    AccountTypeid: number;
    AccountCodeCategoryId: number;
    accountCodes: any[] = [];
    //verifyPermission: boolean = false;
    accountCategoryId: number = 0;
    expenseAccountCodeCategories = [];
    selectedRowId: number = -1;
    showRetentionPer: boolean = false;
    showRetentionMaxLimit: boolean = false;
    showRetentionType: boolean = false;
    purchaseOrderType: string;
    typeofCostCategaries = [];
    typeofApportionmentMethods = [];
    doApproveReject: boolean = true;
    hideCancelinVerify: boolean = false;
    viewLogPermission: boolean = false;
    deptId: number = 0;
    processId: number = 0;
    hasWorkFlow: boolean = true;
    departmentsWorkflow: Array<Location> = [];
    newPermission: boolean;
    emailPermission: boolean;
    printPermission: boolean;
    editPermission: boolean;
    verifyPermission: boolean;
    approvePermission: boolean;
    exportPermission: boolean;
    hasCostData: boolean = false;
    hasApportimentData: boolean = false;
    hasDistributionData: boolean = false;
    POPMasterCode: string = "";
    hideVerifyButton: boolean = true;
    retentionSupplierSubCodes = [];
    errmesagevisible: boolean = false;
    gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
    InvalidRententionPercentage: boolean = false;
    apiEndPoint: string;
    voidPermission: boolean;
    isCompanyChanged: boolean = false;
    public innerWidth: any;
    totalVOSumSubTotal: number = 0;
    rcvSubTotal: number = 0;
    rcvTotalBefTax: number = 0;
    rcvTax: number = 0;
    rcvTotal: number = 0;
    tvsTax: number = 0;
    tvsTotal: number = 0;
    tvsTotalBefTax: number = 0;
    currencies = [];
    paymentTerms = [];
    userRoles = [];
    rolesAccessList = [];
    projectPoListCols: any[];
    Id: number = 0;
    CMPaymentColumns: PTableColumn[] = [];
    CMVOColumns: PTableColumn[] = [];
    payments: any[] = [];
    variationOrders: any[] = [];
    showfilters:boolean=true;
    showfilterstext:string="Hide List" ;
    public screenWidth: any;
    constructor(private formbuilderObj: FormBuilder,
        private supplierApiService: SupplierApiService,
        private sharedServiceObj: SharedService,
        private projectContractMasterServiceObj: ProjectContractMasterService,
        private sessionService: SessionStorageService,
        private taxService: TaxService,
        private router: Router,
        private reqDateFormatPipe: RequestDateFormatPipe,
        public activatedRoute: ActivatedRoute,
        private workFlowService: WorkFlowApiService,
        private supplierApiServiceObj: SupplierApiService,
        private accountCodeAPIService: AccountCodeAPIService,
        private projectPOCreationObj: POCreationService,
        private confirmationServiceObj: ConfirmationService,
        public projectContractPaymentServiceObj: ProjectPaymentMasterService,
        public projectContractVariationAPIService: ProjectContractVariationApiService,
        private renderer: Renderer,
        private utilService: UtilService) {
        this.userDetails = <UserDetails>this.sessionService.getUser();
        this.projectPurchaseOrderForm = this.formbuilderObj.group({
            ProjectMasterContractId: [0],
            POPMasterCode: [""],
            ProjectName: ["", [Validators.required]],
            ContractStartDate: [new Date(), [Validators.required]],
            ContractEndDate: [new Date(), [Validators.required]],
            ContractTerms: [""],
            OriginalContractSum: [0, [Validators.required]],
            CurrencyId: [0],
            PaymentTermsId: [0],
            TotalVOSum: [0],
            AdjustedContractSum: [0],
            IsRetentionApplicable: [false],
            RetentionPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            RetentionMaxLimit: [0],
            TaxAuthorityId: [0, [Validators.required]],
            TaxId: [0, [Validators.required]],
            TaxGroupId: [0],
            Remarks: [""],
            LocationId: [0, [Validators.required]],
            WorkFlowStatusId: [0],
            Departments: [[]],
            Supplier: [null, [Validators.required]],
            SupplierSubCodeId: [null, [Validators.required]],
            ServiceType: [null, [Validators.required]],
            RetentionSupplierCode: [""],
            ExpensesTypeId: [0, [Validators.required]],
            SupplierSubCode: [null],
            SupplierAddress: [""],
            // DepartmentId:[0],
            ProjectMasterContractItems: this.formbuilderObj.array([]),
            DiscountLineItems: this.formbuilderObj.array([]),
            POPCostCategory: this.formbuilderObj.array([]),
            POPApportionment: this.formbuilderObj.array([]),
            POPDistributionSummaryItems: this.formbuilderObj.array([]),

            ApprovalRemarks: [""],
            TotalLineSum: 0,
            SubTotal: [0],
            TotalBefTax: [0],
            GrandTotal: [0],
            TaxAmount: [0],
            TotalAmount: [0],
            TotalTax: [0],
            TaxRate: [0],
            RetentionTypeId: [0],
            ContractDescription: ['', [Validators.required]]
            // TaxRate:[0, [Validators.required]]
        });
        this.poFilterInfoForm = this.formbuilderObj.group({
            DocumentCode: [''],
            WorkFlowStatusId: [0],
            FromDate: [],
            ToDate: [],
            Supplier: [null]
        });
        this.AccountCodeInfoForm = this.formbuilderObj.group({
            Item: ['', [Validators.required]],
            AccountCodeCategoryId: [0, [Validators.required]],
            AccountTypeId: [0, [Validators.required]],
            RowIndex: [""],
            isGLCost: [""]

        });
        this.billingMonths = Months;
        this.selectedPODetails = new ProjectMasterContract();
        this.purchaseOrderPagerConfig = new PagerConfig();
        this.resetPagerConfig();
        this.CMPaymentColumns = CMPaymentColumns.filter(item => item);
        this.CMVOColumns = CMVOColumns.filter(item => item);
        this.projectPoListCols = [
            { field: 'DraftCode', header: 'Draft Code', width: '100px' },
            { field: 'ProjectName', header: 'Name', width: '200px' },
            { field: 'ContractStartDate', header: 'Start Date', width: '150px' },
            { field: 'WorkFlowStatusId', header: 'Status', width: '150px'  },
            { field: '', header: 'Action', width: '100px'  },
        ];
        this.projectMasterContractItemColumns = [
            { field: 'Sno', header: 'S.no.', width: "5%" },
            { field: 'ItemDescription', header: 'Description', width: "13%" },
            // { field: 'AccountCodeCategoryId', header: 'Expense Category', width: "12%" },
            // { field: 'AccountCode', header: 'Account Code', width: "10%" },
            // { field: 'ContractValue', header: 'Contract Value', width: "10%" },
            // { field: 'POPCostCategoryId', header: 'Type Of Cost', width: "10%" },
            { field: 'POPApportionmentId', header: 'Apportionment Method', width: "10%" },
            { field: 'ContractValue', header: 'Original Contract Value', width: "10%" },
            { field: 'TotalVOSum', header: 'Total VO sum', width: "10%" },
            { field: 'RevisedContractValue', header: 'Revised Contract Value', width: "10%" }

        ];
        this.POPCostCategoryColumns = [
            { field: 'Sno', header: 'S.no.', width: "5%", },
            { field: 'TypeOfCost', header: 'Type Of Cost', width: "7%" },
            { field: 'CostDescription', header: 'Type Of Cost Description', width: "18%" },
            { field: 'GL_Cost', header: 'GL-COST', width: "10%" },
            { field: 'GL_Cost_Description', header: 'GL-COST Description', width: "18%" },
            { field: 'GST_Group', header: 'GST Group', width: "10%" },
            { field: 'GST_Class', header: 'GST Class', width: "10%" },
            { field: 'GL_Retention', header: 'GL-Retention', width: "10%" },
            { field: 'GL_Retention_Description', header: 'GL-Retention Description', width: "18%" },
            { field: 'GL_GroupRetention', header: 'Gst Group (retention)', width: "10%" },
            { field: 'GL_ClassRetention', header: 'GL Class (retention)', width: "10%" },
            { field: 'Prefix', header: 'suffix for Invoice No', width: "10%" }];
        this.POPApportionmentColumns = [
            { field: 'Sno', header: 'S.no.', width: "10%", },
            { field: 'Method', header: 'Method', width: "10%" },
            { field: 'Total', header: 'Total', width: "10%" },
            { field: 'Remarks', header: 'Remarks', width: "10%" }];


        this.POPDistributionSummaryColumns = [{ field: 'Sno', header: 'S.no.', width: "5%", },
        { field: 'DepartmentId', header: 'Department', width: "20%" },
        { field: 'DistributionPercentage', header: 'Distribution%', width: "25%" },
        { field: 'ContractAmount', header: 'Retention%', width: "25%" },
        { field: 'RetentionCode', header: 'Retention Code', width: "25%" },
            // { field: 'RetentionAmount', header: 'Retention Amount', width: "20%" }
        ];


        this.companyId = this.sessionService.getCompanyId();
        this.adHocContractTypes = [{ Id: 1, Value: "Fixed" }, { Id: 2, Value: "Variable" }];
        this.workFlowStatus = WorkFlowStatus;
        this.poTypeId = PurchaseOrderType.ProjectPo;
        this.purchaseOrderType = "ProjectPo";
        this.apiEndPoint = environment.apiEndpoint;

    }
    ngOnInit() {               
        this.activatedRoute.paramMap.subscribe((data) => {
            let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
            this.Id = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
            if (Number(companyId) != 0)
                this.companyId = companyId;
        });
        this.sharedServiceObj.getExpenseTypes().subscribe((data: Array<ExpensesType>) => {
            this.expenseTypes = data;
        });

        this.sharedServiceObj.getBillingFrequencies().subscribe((data: Array<BillingFrequency>) => {
            this.frequencyTypes = data;
        });
        debugger;
        //this.getProjectPOList(this.Id);
        this.navigateToPage();
        this.activatedRoute.paramMap.subscribe((data) => {
            this.navigateToPage();
        });

        this.activatedRoute.queryParamMap.subscribe((data) => {
            if (this.activatedRoute.snapshot.queryParamMap.get('id') != null) {
                this.navigateToPage();
            }
        });
        // this.sharedServiceObj.IsCompanyChanged$
        // .subscribe((data) => {
        //   this.isCompanyChanged = data;
        //   if (this.isCompanyChanged) {
        //     this.getProjectPOList(0);
        //     this.sharedServiceObj.updateCompany(false);
        //   }
        // });
        //getting the purchase orders list..
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                //getting the purchase orders list..
                if (this.companyId != data) {
                    this.companyId = data;
                    //  this.getPurchaseOrders(0,0);
                }
            });
        this.getAccountTypes(this.companyId);
        //this.getAccountTypes();
        this.getBillingTypes();
        this.getCostCentres();
        this.getCostTypes();
        this.getDepartments(this.companyId);
        this.getExpenses();
        this.getServiceTypes();
        //this.getTaxGroups();
        this.getWorkFlowStatus();
        this.getAccountCodeCategories(this.companyId);
        this.getDepartmentsbyWorkFlow(this.companyId);

        
            this.screenWidth = window.innerWidth-150;
            
            this.showfilters =false;
    this.showfilterstext="Hide List" ;
    }



    navigateToPage() {
        this.requestType = this.activatedRoute.snapshot.params.type;
        let poCode = this.activatedRoute.snapshot.queryParamMap.get('code');
        let projectMasterContractId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));

        let poFilterData: ProjectContractMasterFilterModel = {
            DocumentCode: poCode,
        };
        this.sharedServiceObj.getUserRolesByCompany(this.userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
            debugger;
            this.userRoles = roles;
            this.userDetails.Roles = this.userRoles;
            this.sessionService.setUser(this.userDetails);
            let roleIds = Array.prototype.map.call(this.userDetails.Roles, s => s.RoleID).toString();
            if (roleIds != '') {
                this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
                    debugger;
                    this.rolesAccessList = data;
                    this.sessionService.setRolesAccess(this.rolesAccessList);
                    let roleAccessLevels = this.sessionService.getRolesAccess();
                    if (roleAccessLevels != false) {
                        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                            if (this.activatedRoute.snapshot.params.type == "request") {//if it is "asset disposal request"
                                this.moduleHeading = "Project Contract Master";
                                this.isApprovalPage = false;
                                let roleAccessLevels = this.sessionService.getRolesAccess();
                                // if (this.isApprovalPage==false) {
                                if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                                    let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectcontractmaster")[0];
                                    let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
                                    if (auditLogRole != null)
                                        this.viewLogPermission = auditLogRole.IsView;
                                    this.newPermission = formRole.IsAdd;
                                    this.editPermission = formRole.IsEdit;
                                    // this.emailPermission = formRole.IsEmail;
                                    this.printPermission = formRole.IsPrint;
                                    this.approvePermission = formRole.IsApprove;
                                    this.exportPermission = formRole.IsExport;
                                    this.voidPermission = formRole.IsVoid;
                                }
                                else {
                                    this.newPermission = true;
                                    this.editPermission = true;
                                    // this.emailPermission = true;
                                    this.printPermission = true;
                                    this.approvePermission = true;
                                    this.exportPermission = true;
                                    this.voidPermission = true;
                                }
                                // }
                                debugger;
                                if (projectMasterContractId > 0) {
                                    this.searchProjectMasterContract(projectMasterContractId, true, poFilterData);
                                }
                                else {
                                    this.getProjectPOList(0);
                                }
                            }
                            else if (this.activatedRoute.snapshot.params.type == "approval") {//if request is for "asset disposal request approval"
                                this.moduleHeading = "Project Contract Master Approval";
                                this.isApprovalPage = true;

                                let roleAccessLevels = this.sessionService.getRolesAccess();

                                if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                                    let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectcontractmasterapproval")[0];
                                    let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
                                    if (auditLogRole != null)
                                        this.viewLogPermission = auditLogRole.IsView;
                                    this.approvePermission = formRole.IsApprove;
                                    this.verifyPermission = formRole.IsVerify;
                                    this.printPermission = formRole.IsPrint;
                                }
                                else {
                                    this.viewLogPermission == false;
                                    this.approvePermission = false;
                                    this.verifyPermission = false;
                                    this.printPermission = false;


                                }

                                this.hideVerifyButton = true;
                                this.hideText = true;
                                this.hideInput = false;

                                debugger;
                                if (projectMasterContractId > 0) {

                                    this.searchProjectMasterContract(projectMasterContractId, true, poFilterData);
                                }
                                else {

                                    this.getProjectMasterContractsForApproval(0);
                                }
                            }
                        }
                    }
                });
            }
        });




    }

    getpaymentTerms(defaultId: number): void {
        let paymentTermsResult = <Observable<Array<any>>>this.sharedServiceObj.getPaymentTerms(this.sessionService.getCompanyId());
        paymentTermsResult.subscribe((data: any[]) => {
            this.paymentTerms = data;
            this.projectPurchaseOrderForm.get('PaymentTermsId').setValue(defaultId);
        });
    }

    getCurrenceis(defaultId: number): void {
        let currenciesResult = <Observable<Array<any>>>this.supplierApiService.getCurrencies();
        currenciesResult.subscribe((data) => {
            this.currencies = data;
            this.projectPurchaseOrderForm.get('CurrencyId').setValue(defaultId);
        });
    }

    getAccountCodeCategories(companyId: number): void {
        let accountCodeCategoriesResult = <Observable<Array<any>>>this.accountCodeAPIService.getAccountCodeCategories(companyId);
        accountCodeCategoriesResult.subscribe((data) => {
            if (data != null) {

                this.expenseAccountCodeCategories = data;
                // this.accountCodeCategories = this.accountCodeCategories.filter(x => x.AccountCodeName.toLowerCase().indexOf('expenses') !== -1 || x.AccountCodeName.toLowerCase().indexOf('insurance') !== -1)  
                if (this.expenseAccountCodeCategories[0] != null && this.expenseAccountCodeCategories[0] != undefined) {
                    this.accountCategoryId = this.expenseAccountCodeCategories[0].AccountCodeCategoryId;
                }
            }
        });
    }

    onCategoryChange(categoryId: number, rowIndex: number) {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
        this.accountCategoryId = itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').value;

        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('ProjectMasterContractItemId').value;


        if (itemGroupControl.controls[rowIndex] != undefined) {
            itemGroupControl.controls[rowIndex].reset();
        }

        itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').setValue(Number(this.accountCategoryId));
    }


    onTypeSelection(accountType: any) {

        this.defaultAccountType = accountType;
        this.GetASubCatByAccountType(this.defaultAccountType, this.companyId, " ");
    }


    GetASubCatByAccountType(accountType: number, companyId: number, searchKey: string): void {
        this.accountCodeCategories.length = 0;
        let accountCodesDisplayInput = {
            AccountTypeId: accountType,
            CompanyId: companyId,
            SearchKey: searchKey
        };
        let accountCodesResult = <Observable<Array<AccountCode>>>this.accountCodeAPIService.getAllSearchSubCategory(accountCodesDisplayInput);
        accountCodesResult.subscribe((data) => {

            this.accountCodeCategories = data;

        });
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
                    this.accountCodes = [];
                    this.AccountCodeInfoForm.reset();
                    this.GetASubCatByAccountType(this.defaultAccountType, companyId, "");
                    this.GetAccountCodesBySubCat();

                }
                else {
                    this.accountTypes = [];
                    let accountCodesControl = <FormArray>this.AccountCodeInfoForm.controls['AccountCodes'];
                    accountCodesControl.controls = [];
                    accountCodesControl.controls.length = 0;
                }
            }
            else {
                this.accountTypes = [];
                let accountCodesControl = <FormArray>this.AccountCodeInfoForm.controls['AccountCodes'];
                accountCodesControl.controls = [];
                accountCodesControl.controls.length = 0;
            }
        });
    }


    GetAccountCodesBySubCat() {
        let searchKey = " ";
        const SubCategory = this.optionSec.nativeElement.value;
        const AccountType = this.optionIst.nativeElement.value;
        this.accountCodeCategories.length = 0;
        let accountCodesDisplayInput = {
            companyId: this.companyId,
            categoryId: SubCategory,
            accountTypeId: AccountType

        };
        let accountCodesResult = <Observable<Array<AccountCodeMaster>>>this.sharedServiceObj.getAccountCodesbySubcat(accountCodesDisplayInput);
        accountCodesResult.subscribe((data) => {

            {
                this.accountCodes = data;
            }
            this.GetASubCatByAccountType(this.defaultAccountType, this.companyId, " ");


        });
    }


    getBillingTypes() {
        this.sharedServiceObj.getBillingTypes().subscribe((data: Array<BillingType>) => {
            this.billingTypes = data;
        });
    }

    onRetentionChange() {
        this.isRetentionApplicable = this.projectPurchaseOrderForm.get('IsRetentionApplicable').value;
        this.selectedPODetails.IsRetentionApplicable = this.isRetentionApplicable;
        this.projectPurchaseOrderForm.get('RetentionPercentage').setValue(0);
        this.projectPurchaseOrderForm.get('RetentionTypeId').setValue(0);
        this.projectPurchaseOrderForm.get('RetentionSupplierCode').setValue(0);
        if (this.isRetentionApplicable) {
            this.showRetentionPer = true;
            this.showRetentionMaxLimit = true;
            this.showRetentionType = true;
            this.projectPurchaseOrderForm.get('RetentionPercentage').setValidators([Validators.required, Validators.max(100)]);

        }
        else {
            this.showRetentionPer = false;
            this.showRetentionMaxLimit = false;
            this.showRetentionType = false;
            this.projectPurchaseOrderForm.get('RetentionPercentage').clearValidators();
            this.projectPurchaseOrderForm.get('RetentionMaxLimit').clearValidators();
            this.projectPurchaseOrderForm.get('RetentionMaxLimit').setValue(0);
            this.projectPurchaseOrderForm.get('RetentionPercentage').setValue(0);
        }
        this.projectPurchaseOrderForm.get('RetentionPercentage').updateValueAndValidity();
        this.projectPurchaseOrderForm.get('RetentionPercentage').markAsTouched();
    }
    newRecord() {
        this.hideText = false;
        this.hideInput = true;
        this.linesToAdd = 2;
        this.linesToAdd1 = 1;
        this.linesToAddCostCategory = 2;
        this.linesToAddApportionment = 2;
        this.linesToAddDistribution = 2;
        this.isRetentionApplicable = false;
        this.selectedPODetails = new ProjectMasterContract();
        this.selectedPODetails.TotalVOSum = 0;
        this.clearForm();
        this.addGridItem(this.linesToAdd, "ProjectMasterContractItems");
        this.addGridItem(this.linesToAdd1, "DiscountLineItems");
        this.showFullScreen();
    }

    addRecord() {
        this.hideText = false;
        this.hideInput = true;
        this.supplierid = 0;
        this.verifyPermission = false;
        this.showRetentionMaxLimit = false;
        this.showRetentionType = false;
        this.showRetentionPer = false;
        this.hasCostData = false;
        this.hasApportimentData = false;
        this.hasDistributionData = false;
        this.projectPurchaseOrderForm.patchValue({
            SupplierTypeID: "1",
            IsGstRequired: false
        });
        this.newRecord();
        //setting this variable to false so as to show the purchase order details in edit mode
        this.totalVOSumSubTotal = 0;
        this.rcvSubTotal = 0;
        this.rcvTotalBefTax = 0;
        this.tvsTotalBefTax = 0;
        this.rcvTax = 0;
        this.rcvTotal = 0;
        this.tvsTax = 0;
        this.tvsTotal = 0;
        this.typeofApportionmentMethods = [];
        this.currencies = [];
        this.paymentTerms = [];

        this.showfilters =false;
    this.showfilterstext="Show List" ;
    }


    //adding row to the grid..
    addGridItem(noOfLines: number, gridFAName: string, isEdit: boolean = false) {
        let itemGroupControl = new FormArray([]);
        itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls[gridFAName];
        for (let i = 0; i < noOfLines; i++) {
            if (gridFAName == "ProjectMasterContractItems") {
                itemGroupControl.push(this.initGridRows());
                // itemGroupControl.get('TypeOfCostName').disable();
            }
            else if (gridFAName == "POPDistributionSummaryItems") {
                itemGroupControl.push(this.initGridRows3());
            }
            else if (gridFAName == "DiscountLineItems") {
                itemGroupControl.push(this.initGridRows4());
            }
            else if (gridFAName == "POPCostCategory") {
                //  for (let i = 0; i < noOfLines; i++) {
                // let categoryObj = this.initGridRows1();
                // categoryObj.get("RowIndex").setValue(itemGroupControl.length);
                itemGroupControl.push(this.initGridRows1());
                if (isEdit == false) {
                    let costCategoryArray = <FormArray>this.projectPurchaseOrderForm.controls[gridFAName];
                    let lastInsertedItemIndex = costCategoryArray.length - 1;
                    let itemGroupControl2 = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
                    itemGroupControl2.controls.forEach((data) => {
                        let apportionmentControl = <FormArray>data.get("ApportionmentDetails");
                        let obj = this.initApportionmentGridColumns();
                        // obj.get("RowIndex").setValue(lastInsertedItemIndex);
                        apportionmentControl.push(obj);
                    });
                }
                // }
            }
            else if (gridFAName == "POPApportionment") {
                // let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls[gridFAName];
                // for (let i = 0; i < noOfLines; i++) {                
                itemGroupControl.push(this.initGridRows2());
                if (isEdit == false) {
                    let apportionmentControl = <FormArray>itemGroupControl.controls[itemGroupControl.length - 1].get("ApportionmentDetails");
                    let costCategoryArray = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
                    costCategoryArray.controls.forEach((data, index) => {
                        let obj = this.initApportionmentGridColumns();
                        obj.patchValue({
                            //RowIndex:data.get("RowIndex").value,
                            TypeOfCost: data.get('TypeOfCost').value,
                            POPCostCategoryId: data.get('POPCostCategoryId').value
                        });
                        apportionmentControl.push(obj);
                    });
                }
                //  }
            }
        }
    }
    companyInputFormater = (x: Companies) => x.CompanyName;
    /**
     * this mehtod will be called when user gives contents to the  "item master" autocomplete...
     */
    companySearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    return of([]);
                }
                return this.sharedServiceObj.getCompaniesbykey(term).map((data: Companies[]) => {
                    //return data;
                    return this.getCompanyList(data);
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );

    getCompanyList(data: Companies[]) {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let company = <Companies>control.get('Company').value;
            if (company != undefined) {
                data = data.filter(i => i.CompanyId != company.CompanyId);
            }
        });
        return data;
    }
    clearForm() {
        this.projectPurchaseOrderForm.reset();
        this.projectPurchaseOrderForm.setErrors(null);
        let itemGroupControl1 = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
        itemGroupControl1.controls = [];
        itemGroupControl1.controls.length = 0;
        let itemGroupControl2 = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
        itemGroupControl2.controls = [];
        itemGroupControl2.controls.length = 0;
        itemGroupControl2.setValue([]);
        let itemGroupControl3 = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
        itemGroupControl3.controls = [];
        itemGroupControl3.controls.length = 0;
        itemGroupControl3.setValue([]);
        let itemGroupControl4 = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        itemGroupControl4.controls = [];
        itemGroupControl4.controls.length = 0;
        itemGroupControl4.setValue([]);
        let itemGroupControl15 = <FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems'];
        itemGroupControl15.controls = [];
        itemGroupControl15.controls.length = 0;
        this.supplierid = 0;
        this.TaxGroupId = 0;
        this.TaxId = 0;
    }
    /**
     * to show the purchase order details in edit mode....
     */
    editRecord() {

        //setting this variable to false so as to show the category details in edit mod
        this.hideText = false;
        this.hideInput = true;
        this.supplierid = 0;
        this.linesToAdd = 2;
        this.linesToAddCostCategory = 2;
        this.linesToAddApportionment = 2;
        this.linesToAddDistribution = 2;
        //resetting the item category form.
        this.clearForm();
        this.addGridItem(this.selectedPODetails.ProjectMasterContractItems.length, "ProjectMasterContractItems");
        this.addGridItem(this.selectedPODetails.DiscountLineItems.length, "DiscountLineItems");
        this.addGridItem(this.selectedPODetails.POPCostCategory.length, "POPCostCategory", true);
        this.addGridItem(this.selectedPODetails.POPApportionment.length, "POPApportionment");
        this.addGridItem(this.selectedPODetails.POPDistributionSummaryItems.length, "POPDistributionSummaryItems");

        this.projectPurchaseOrderForm.patchValue(this.selectedPODetails);
        this.getTaxesByTaxAuthority(this.selectedPODetails.TaxAuthorityId);
        //this.getTaxTypes();
        let popGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
        for (let i = 0; i < popGroupControl.length; i++) {
            let taxgroupId = popGroupControl.controls[i].get('GST_Group').value;
            this.getTaxesByTaxGroup(popGroupControl.controls[i].get('GST_Group').value, i, true);
            this.getTaxesByTaxGroup(popGroupControl.controls[i].get('GL_GroupRetention').value, i, false);

        }
        this.projectPurchaseOrderForm.get('LocationId').setValue(this.selectedPODetails.LocationId);
        this.projectPurchaseOrderForm.get('TaxId').setValue(this.selectedPODetails.TaxId);

        this.projectPurchaseOrderForm.get('ContractStartDate').setValue(new Date(this.selectedPODetails.ContractStartDate));
        this.projectPurchaseOrderForm.get('ContractEndDate').setValue(new Date(this.selectedPODetails.ContractEndDate));
        this.supplierChange(null, true);
        this.calculateTotalPrice(0, 0);

        this.showFullScreen();
        if (this.selectedPODetails.ContractStartDate != null && this.selectedPODetails.ContractEndDate != null) {
            this.setContractDate(new Date(this.selectedPODetails.ContractEndDate), new Date(this.selectedPODetails.ContractStartDate));
        }

        this.supplierid = this.selectedPODetails.Supplier.SupplierId;
        if (this.selectedPODetails.SupplierSubCodeId === null) {
            // this.isSupplierSelected = true;
            this.projectPurchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
            this.projectPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
        }

        //this.projectPurchaseOrderForm.get('AdjustedContractSum').disable();
    }

    displayVoidPopUp(isVoid: boolean) {

        this.isVoid = isVoid;
        this.POPMasterCode = this.selectedPODetails.POPMasterCode;
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

    filterData() {
        debugger
        this.isFilterApplied = true;
        this.filterMessage = "";
        let poFilterData: ProjectContractMasterFilterModel = this.poFilterInfoForm.value;
        if (this.poFilterInfoForm.get('Supplier').value != null) {
            poFilterData.Supplier['SupplierName'] = this.poFilterInfoForm.get('Supplier').value.SupplierName;
        }
        if ((poFilterData.DocumentCode === '' || poFilterData.DocumentCode === null) && poFilterData.Supplier === null
            && (poFilterData.WorkFlowStatusId == null || poFilterData.WorkFlowStatusId == 0)
            && (poFilterData.FromDate == null && poFilterData.ToDate == null)) {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
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
        this.searchProjectMasterContract(0, false, poFilterData);
        if (this.projectPoList.length > 0) {
            if (open) {
                this.showFilterPopUp = true;
            }
        }
        this.resetPagerConfig();
    }
    getCostCentres() {
        this.sharedServiceObj.getCostCentres().subscribe((data: Array<CostCentre>) => {
            this.costCentres = data;
        });
    }
    getCostTypes() {
        this.projectContractMasterServiceObj.getCostTypes().subscribe((data: Array<CostTypes>) => {
            this.costTypes = data;
        });
    }
    // getDepartments() {
    //     
    //     this.sharedServiceObj.getDepartments().subscribe((data: Array<Location>) => {
    //         this.departments = data;
    //     });
    // }
    getDepartmentsbyWorkFlow(companyId: number) {
        this.sharedServiceObj.getUserDepartments(companyId, WorkFlowProcess.ProjectMasterContract, this.userDetails.UserID).subscribe((data: Array<Location>) => {
            this.departmentsWorkflow = data;
        });
    }

    getDepartments(companyId: number) {
        this.sharedServiceObj.GetUserCompanyDepartments(companyId, this.userDetails.UserID).subscribe((data: Location[]) => {
            this.departments = data;
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
            this.retentionSubcode = data.filter(x => x.SubCodeDescription.toLowerCase().indexOf("retention") > -1);
        });
    }
    getExpenses() {
        let accountCodesDisplayInput = {
            categoryId: 2, // Expenses
            companyId: this.companyId,
        };
        let accountCodesResult = <Observable<Array<AccountCodeMaster>>>this.sharedServiceObj.getAccountCodesByCategory(accountCodesDisplayInput);
        accountCodesResult.subscribe((data) => {
            if (data != null) {
                if (data.length > 0) {
                    this.expenses = data;
                }
            }
        });
    }
    getProjectPOList(projectMasterContractId: number) {
        let obj = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID
        };
        this.projectContractMasterServiceObj.getProjectMasterContracts(obj).subscribe((data: ProjectMasterContractDisplayResult) => {
            if (data != null && data.ProjectMasterContractList.length > 0) {

                this.projectPoList = data.ProjectMasterContractList;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                if (projectMasterContractId > 0) {
                    this.onRecordSelection(projectMasterContractId);
                }
                else {
                    this.onRecordSelection(this.projectPoList[0].ProjectMasterContractId);
                }
            }
            this.hideText = true;
        });
    }
    getProjectMasterContractsForApproval(projectMasterContractId: number) {

        //  this.addGridItem(this.linesToAdd, "POPCostCategory");
        let userDetails = <UserDetails>this.sessionService.getUser();//logged in user details...
        let obj = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            CompanyId: this.companyId,
            UserId: userDetails.UserID
        };
        this.projectContractMasterServiceObj.getProjectMasterContractsForApproval(obj).subscribe((data: ProjectMasterContractDisplayResult) => {
            if (data != null) {
                this.projectPoList = data.ProjectMasterContractList;
                this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                if (projectMasterContractId > 0) {
                    this.onRecordSelection(projectMasterContractId);
                }
                else if (data.ProjectMasterContractList.length > 0) {
                    this.onRecordSelection(this.projectPoList[0].ProjectMasterContractId);
                }
                else if (data.ProjectMasterContractList.length == 0) {
                    this.onRecordSelection(0);
                }
            }
        });
    }

    getServiceTypes() {
        this.sharedServiceObj.getAllServiceTypes().subscribe((data: Array<ServiceType>) => {
            this.serviceTypes = data;
        });
    }
    getTaxGroups(): void {
        this.sharedServiceObj.getTaxGroupList().subscribe((data: Array<TaxGroup>) => {
            this.taxGroups = data;
        });
    }

    getTaxTypesByTaxGroup(taxGroupId: number, rowIndex: number, isControlName: boolean) {

        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
        itemGroupControl.controls[rowIndex].get("RowIndex").setValue(rowIndex);
        itemGroupControl.controls[rowIndex].get("isControlName").setValue(isControlName);
        this.getTaxesByTaxGroup(taxGroupId, rowIndex, isControlName);
    }

    getTaxesByTaxGroup(taxGroupId: number, rowIndex: number, isControlName: boolean): void {

        //  isControlName = this.projectPurchaseOrderForm.get('POPCostCategory').get("isControlName").value;
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
        let taxResult = <Observable<Array<any>>>this.taxService.getTaxesByTaxGroup(taxGroupId);
        taxResult.subscribe((data) => {
            if (data != null) {

                this.taxTypes = data;
                itemGroupControl.controls[rowIndex].value.Taxes = [];
                itemGroupControl.controls[rowIndex].value.RetentionTaxes = [];
                if (isControlName) {
                    itemGroupControl.controls[rowIndex].patchValue({
                        Taxes: this.taxTypes

                    });
                }
                else {
                    itemGroupControl.controls[rowIndex].patchValue({
                        RetentionTaxes: this.taxTypes

                    });
                }

            }
        });
    }

    getTaxesByTaxAuthority(taxGroupId: number): void {

        let taxResult = this.taxService.getTaxesByTaxGroup(taxGroupId);
        taxResult.subscribe((data: Array<Taxes>) => {
            if (data != null) {

                this.taxRateTypes = data;
                if (data.length > 0) {
                    // this.projectPurchaseOrderForm.get('TaxId').setValue(data[0].TaxId);
                    this.calculateTotalPrice(0, 0);

                }
            }
        });
    }

    getWorkFlowStatus() {
        this.sharedServiceObj.getWorkFlowStatus(WorkFlowProcess.InventoryPO).subscribe((data: Array<WorkFlowStatusModel>) => {
            this.workFlowStatuses = data;
        });
    }
    hideVoidPopUp(hidePopUp: boolean) {
        this.showVoidPopUp = false;
    }
    closeReCallPopUp() {
        this.showRecallPopup = false;
    }
    initGridRows() {
        return this.formbuilderObj.group({
            ProjectMasterContractItemId: [0],
            ItemId: [0],
            ItemDescription: [""],  //, [Validators.required]
            AccountCodeId: [0],
            POPCostCategoryId: [""],
            POPApportionmentId: [""],
            ContractValue: [0, [Validators.required]],
            Expense: [0],
            TotalVOSum: [0],
            RevisedContractValue: [0],
            TypeOfCostName: [""],
            ApportionmentMethod: [""],
            AccountCodeCategoryId: [0],  //, [Validators.required]
            AccountCodeName: [""],
            // PrevAccumulatedAmount: [0],
            // CurrentPayment: [0],
            // AccumulatedPayment: [0],
            // OverallStatus: [0]
        });
    }
    initGridRows1() {
        return this.formbuilderObj.group({
            POPCostCategoryId: [0],
            POPId: [0],
            TypeOfCostId: [0],
            TypeOfCost: [""],
            CostDescription: [""],
            GL_Cost: [""],
            GL_Cost_Description: [""],
            GST_Group: [0],
            GST_Class: [0],
            GL_Retention: [""],
            GL_Retention_Description: [""],
            GL_GroupRetention: [0],
            GL_ClassRetention: [0],
            Prefix: [""],
            Taxes: [],
            RetentionTaxes: [],
            RowIndex: [""],
            isControlName: false,
            GST_GroupName: [""],
            GST_ClassName: [""],
            GL_GroupRetentionName: [""],
            GL_ClassRetentionName: [""]
        });
    }
    initGridRows2() {
        let apportionmentGridControl = this.formbuilderObj.group({
            POPApportionmentId: [0],
            POPId: [0],
            Method: [""],
            ApportionmentDetails: this.formbuilderObj.array([]),
            Total: [0],
            Remarks: [""]
        });
        return apportionmentGridControl;
    }
    initGridRows3() {
        return this.formbuilderObj.group({
            DisturbutionSummaryId: [0],
            // Company: [null],
            DistributionPercentage: [0],
            ContractAmount: [0],
            RetentionCode: [""],
            DepartmentId: [0],
            Department: [null]
            // ThisCerification: [0, [Validators.required]],
            // RetentionAmount: [0, [Validators.required]]
        });
    }
    initGridRows4() {
        return this.formbuilderObj.group({
            ProjectMasterContractItemId: [0],
            DisItemDescription: [""],
            //DisAccountCodeId: [0],
            AccountCodeId: [0],
            POPCostCategoryId: [0],
            POPApportionmentId: [0],
            DiscountValue: [0],
            Expense: [],
            TotalVOSum: [0],
            RevisedContractValue: [0],
            DisTypeOfCostName: [""],
            DisApportionmentMethod: [""],
            AccountCodeCategoryId: [0]
            // PrevAccumulatedAmount: [0],
            // CurrentPayment: [0],
            // AccumulatedPayment: [0],
            // OverallStatus: [0]
        });
    }
    initApportionmentGridColumns() {
        let gridCols = this.formbuilderObj.group({
            Amount: [0, [Validators.required]],
            // RowIndex:[0],
            TypeOfCost: [""],
            POPCostCategoryId: [0],
            POPApportionmentId: [0]
        });
        return gridCols;
    }
    onMethodChange(event: any) {
        let costOfcategories = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
        var val = costOfcategories.value;
        this.typeofApportionmentMethods = val.map(value => value.Method);
    }
    displayDuplicateErrorMessage() {
        this.projectPurchaseOrderForm.controls['POPCostCategory'].get('TypeOfCost').setValidators([Validators.required]);
    }

    //     onTypeofCostKeyPress(event: any, rowIndex: number, ) {
    //         let typeOfCost = event.target.value;
    //         let costOfcategories = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
    //         var val = costOfcategories.value;

    //         let _categories:string[] = val.map(value => value.TypeOfCost != '');
    //         _categories.forEach(element => {
    //      if(element != '' && element==typeOfCost )
    //      {

    //        event.preventDefault();
    //     }

    // });

    // }

    onTypeOfCostChange(event: any, rowIndex: number,) {

        let typeOfCost = event.target.value;
        let costOfcategories = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];

        var val = costOfcategories.value;

        this.typeofCostCategaries = val.map(value => value.TypeOfCost);
        //let costChangeControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
        let apportionmentControl = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
        apportionmentControl.controls.forEach((rowItem) => {
            let apportionmentDetails = <FormArray>rowItem.get("ApportionmentDetails");
            apportionmentDetails.controls.forEach((detailItem, detailItemIndex) => {
                if (rowIndex == detailItemIndex) {
                    detailItem.get("TypeOfCost").setValue(typeOfCost);
                }
            });
        });

    }


    onDistributionPercentageChange(value: any, rowIndex: number) {

        let distributionControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        let percentageSum = this.getTotalDistributionPercentage();
        if (percentageSum < 100 || percentageSum > 100) {
            distributionControl.controls[rowIndex].get('DistributionPercentage').setErrors({ 'totalPercentageError': true });
        }
        else {
            for (let i = 0; i < distributionControl.length; i++) {
                distributionControl.controls[i].get('DistributionPercentage').setErrors({ 'totalPercentageError': false });
                distributionControl.controls[i].get('DistributionPercentage').setErrors(null);
            }
        }

        // let retentionSum = this.projectPurchaseOrderForm.get('RetentionPercentage').value;
        // let distributionControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        // let retentionAmount = value / 100 * retentionSum;
        // distributionControl.controls[rowIndex].get('ContractAmount').setValue(retentionAmount);

        // let percentageSum = this.getTotalDistributionPercentage();
        // if ((percentageSum != value && percentageSum > 100) || (percentageSum != value && percentageSum < 100)) {
        //     distributionControl.controls[rowIndex].get('DistributionPercentage').setErrors({ 'totalPercentageError': true });

        // }
        // else {
        //     for (let i = 0; i < distributionControl.length; i++) {
        //         distributionControl.controls[i].get('DistributionPercentage').setErrors({ 'totalPercentageError': false });
        //         distributionControl.controls[i].get('DistributionPercentage').setErrors(null);
        //     }
        // }
    }

    onContractAmountChange(value: any, rowIndex: number) {
        let distributionControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];

        let retentionAmountSum = this.getTotalContractAmount();
        if (retentionAmountSum > 100) {
            for (let i = 0; i < distributionControl.length; i++) {
                distributionControl.controls[i].get('ContractAmount').setErrors({ 'totalContractAmountError': true });
            }
        }
        else {
            for (let i = 0; i < distributionControl.length; i++) {
                distributionControl.controls[i].get('ContractAmount').setErrors({ 'totalContractAmountError': false });
                distributionControl.controls[i].get('ContractAmount').setErrors(null);
            }
        }

        // let retentionSum = this.projectPurchaseOrderForm.get('RetentionPercentage').value;
        // let distributionControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        // let retentionAmount = value / retentionSum * 100;
        // distributionControl.controls[rowIndex].get('DistributionPercentage').setValue(Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(retentionAmount));

        // let retentionAmountSum = this.getTotalContractAmount();
        // if (retentionAmountSum != retentionSum) {
        //     for (let i = 0; i < distributionControl.length; i++) {
        //         distributionControl.controls[i].get('ContractAmount').setErrors({ 'totalContractAmountError': true });
        //     }
        // }
        // else {
        //     for (let i = 0; i < distributionControl.length; i++) {
        //         distributionControl.controls[i].get('ContractAmount').setErrors({ 'totalContractAmountError': false });
        //         distributionControl.controls[i].get('ContractAmount').setErrors(null);
        //     }
        // }
    }

    // onContractAmountChange(value: any, rowIndex: number) {
    //     let contractSum = this.projectPurchaseOrderForm.get('OriginalContractSum').value;
    //     let distributionControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
    //     let contractAmount = value / contractSum * 100;
    //     //distributionControl.controls[rowIndex].get('DistributionPercentage').setValue(contractAmount);
    //     distributionControl.controls[rowIndex].get('DistributionPercentage').setValue(Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(contractAmount));

    //     let contractAmountSum = this.getTotalContractAmount();
    //     if (contractAmountSum != contractSum) {
    //         //distributionControl.controls[rowIndex].get('ContractAmount').setErrors({ 'totalContractAmountError': true });
    //         for (let i = 0; i < distributionControl.length; i++) {
    //             distributionControl.controls[i].get('ContractAmount').setErrors({ 'totalContractAmountError': true });
    //         }
    //     }
    //     else {
    //         for (let i = 0; i < distributionControl.length; i++) {
    //             distributionControl.controls[i].get('ContractAmount').setErrors({ 'totalContractAmountError': false });
    //             distributionControl.controls[i].get('ContractAmount').setErrors(null);
    //         }
    //     }
    // }

    onTypeOfCostKeyUp(event: any) {

    }


    monthDiff(endDate: Date, startDate: Date) {
        if (endDate != null && startDate != null) {
            let months;
            months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
            months += (endDate.getMonth() - startDate.getMonth());
            return months <= 0 ? 0 : months;
        }
    }
    onRecordSelection(projectMasterContractId: number) {
        this.split();
        this.hideVerifyButton = true;
        this.doApproveReject = true;
        this.hideCancelinVerify = false;
        this.selectedProjectContractMasterId = projectMasterContractId;
        this.showGridErrorMessage1 = false;
        this.showGridErrorMessage2 = false;
        this.showGridErrorMessage3 = false;
        this.showRetentionMaxLimit = false;
        this.showRetentionType = false;
        this.showRetentionPer = false;
        this.hasCostData = false;
        this.hasApportimentData = false;
        this.hasDistributionData = false;
        this.totalVOSumSubTotal = 0;
        this.tvsTotalBefTax = 0;
        this.rcvSubTotal = 0;
        this.rcvTotalBefTax = 0;
        this.rcvTax = 0;
        this.rcvTotal = 0;
        this.tvsTax = 0;
        this.tvsTotal = 0;
        this.projectContractMasterServiceObj.getProjectMasterContractDetails(projectMasterContractId).subscribe((data: ProjectMasterContract) => {
            this.selectedPODetails = data;
            this.selectedPODetails.Supplier.SupplierCode = this.utilService.getSupplierCode(data.Supplier.SupplierCode, data.SupplierSubCode.SubCode);
            if (data != null) {
                this.clearForm();
                this.addGridItem(this.selectedPODetails.ProjectMasterContractItems.length, "ProjectMasterContractItems");
                this.addGridItem(this.selectedPODetails.DiscountLineItems.length, "DiscountLineItems");
                this.addGridItem(this.selectedPODetails.POPCostCategory.length, "POPCostCategory", true);
                this.addGridItem(this.selectedPODetails.POPApportionment.length, "POPApportionment");
                this.addGridItem(this.selectedPODetails.POPDistributionSummaryItems.length, "POPDistributionSummaryItems");
                this.projectPurchaseOrderForm.patchValue(data);
                this.projectPurchaseOrderForm.get('ContractStartDate').setValue(new Date(this.selectedPODetails.ContractStartDate));
                this.projectPurchaseOrderForm.get('ContractEndDate').setValue(new Date(this.selectedPODetails.ContractEndDate));
                this.onMethodChange(null);
                this.getCurrenceis(this.selectedPODetails.CurrencyId);
                this.getpaymentTerms(this.selectedPODetails.PaymentTermsId);
            }
            this.isSameUSer = ((data.CreatedBy == this.userDetails.UserID) || projectMasterContractId == 0) ? true : false;
            this.isApproverUser = (data.CurrentApproverUserId == this.userDetails.UserID) ? true : false;
            if (this.selectedPODetails.ContractStartDate != null && this.selectedPODetails.ContractEndDate != null) {
                this.setContractDate(new Date(this.selectedPODetails.ContractEndDate), new Date(this.selectedPODetails.ContractStartDate));
            }

            if (this.selectedPODetails.IsRetentionApplicable) {
                this.isRetentionApplicable = true;
                this.showRetentionPer = true;
                this.showRetentionMaxLimit = true;
                this.showRetentionType = true;
            }
            else {
                this.isRetentionApplicable = false;
                this.showRetentionPer = false;
                this.showRetentionMaxLimit = false;
                this.showRetentionType = false;
            }



            this.hideText = true;
            this.hideInput = false;
            if (this.selectedPODetails.POPCostCategory.length > 0) {
                this.hasCostData = this.selectedPODetails.POPCostCategory[0].POPCostCategoryId > 0 ? true : false;
            }
            if (this.selectedPODetails.POPApportionment.length > 0) {
                this.hasApportimentData = this.selectedPODetails.POPApportionment[0].POPApportionmentId > 0 ? true : false;
            }
            if (this.selectedPODetails.POPDistributionSummaryItems.length > 0) {
                this.hasDistributionData = this.selectedPODetails.POPDistributionSummaryItems[0].DisturbutionSummaryId > 0 ? true : false;
            }
            this.calculateRevisedSum();
            if (this.selectedPODetails.WorkFlowStatusId == 4) {
                this.getProjectPaymentContracts(projectMasterContractId);
                this.getVOList(projectMasterContractId);
            }
            //debugger;
            if (this.selectedPODetails.DiscountLineItems.length == 0) {
                this.addGridItem(this.linesToAdd1, "DiscountLineItems");
            }
        });
    }
    calculateRevisedSum() {
        this.totalVOSumSubTotal = 0;
        this.rcvSubTotal = 0;
        this.rcvTotalBefTax = 0;
        this.rcvTax = 0;
        this.rcvTotal = 0;
        this.tvsTax = 0;
        this.tvsTotal = 0;
        this.tvsTotalBefTax = 0;
        let discountVOSum: number = 0;
        let discountRevisedSum: number = 0;
        this.selectedPODetails.ProjectMasterContractItems.forEach((lineitem: ProjectMasterContractItems) => {
            this.totalVOSumSubTotal += Number(lineitem.VOSum);
            this.rcvSubTotal += Number(lineitem.ContractValue) + Number(lineitem.VOSum);
        });
        this.rcvTotalBefTax = this.rcvSubTotal;
        this.selectedPODetails.DiscountLineItems.forEach((lineitem: DiscountLineItems) => {
            discountVOSum += Number(lineitem.VOSum);
            discountRevisedSum += Number(lineitem.VOSum) - Number(lineitem.DiscountValue);
            this.rcvTotalBefTax = this.rcvSubTotal - discountRevisedSum;
        });
        this.tvsTotalBefTax = this.totalVOSumSubTotal - discountVOSum;
        this.rcvTax = (this.rcvTotalBefTax * this.selectedPODetails.TaxAmount) / 100;
        this.rcvTotal = this.rcvTotalBefTax + this.rcvTax;
        this.tvsTax = (this.tvsTotalBefTax * this.selectedPODetails.TaxAmount) / 100;
        this.tvsTotal = this.tvsTotalBefTax + this.tvsTax;
    }
    onSearchInputChange(event: any) {

        this.resetPagerConfig();
        if (event.target.value != "") {
            this.requestSearchKey = event.target.value;
            this.searchProjectMasterContract(0);
        }
        else {
            this.getProjectPOList(0);
        }
    }
    openDialog() {
        this.showFilterPopUp = true;
        if (this.docCodeRef != undefined) {
            this.docCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.docCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    onStatusUpdate(purchaseOrderId: number) {
        this.showVoidPopUp = false;
        this.readListView.emit({ PoId: purchaseOrderId, PotypeId: PurchaseOrderType.ProjectPo });

        // this.getProjectPOList(purchaseOrderId);
    }

    pageChange(currentPageNumber: any) {
        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.purchaseOrderPagerConfig.RecordsToSkip = this.purchaseOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            let filterData: ProjectContractMasterFilterModel = this.poFilterInfoForm.value;
            if ((this.requestSearchKey != "" && this.requestSearchKey != null) ||
                (filterData.DocumentCode != "" || filterData.WorkFlowStatusId > 0
                    || (filterData.FromDate != null && filterData.ToDate != null))
            ) {
                this.searchProjectMasterContract(0, false, filterData);
            }
            else {
                this.getProjectPOList(0);
            }
        }

        this.showfilters =false;
    this.showfilterstext="Hide List" ;

    }
    /**
     * to remove the grid item...
    */
    removeGridItem(rowIndex: number, gridFAName: string) {
        let itemGroupControl = new FormArray([]);
        itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls[gridFAName];
        if (gridFAName == "POPCostCategory") {
            //  let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
            let typeOfCost = itemGroupControl.at(rowIndex).get('TypeOfCost').value;
            itemGroupControl.removeAt(rowIndex);
            let apportionmentControl = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
            apportionmentControl.controls.forEach((rowItem) => {
                let apportionmentDetails = <FormArray>rowItem.get("ApportionmentDetails");
                apportionmentDetails.controls.forEach((detailItem, detailItemIndex) => {
                    if (detailItem.get("TypeOfCost").value == typeOfCost) {
                        apportionmentDetails.removeAt(detailItemIndex);
                    }
                });
            });
            if (itemGroupControl.controls.length == 0)
                this.addGridItem(1, gridFAName);
        }
        else {
            itemGroupControl.removeAt(rowIndex);
            if (itemGroupControl.controls.length == 0 && gridFAName != 'DiscountLineItems')
                this.addGridItem(1, gridFAName);
            this.calculateTotalPrice(null, null);
        }
    }
    // removeGridItem(rowIndex: number) {
    //     let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
    //     itemGroupControl.removeAt(rowIndex);
    // }
    /**
     * to remove the grid item...
    */
    removeGridItem1(rowIndex: number) {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
        let typeOfCost = itemGroupControl.at(rowIndex).get('TypeOfCost').value;
        itemGroupControl.removeAt(rowIndex);
        let apportionmentControl = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
        apportionmentControl.controls.forEach((rowItem) => {
            let apportionmentDetails = <FormArray>rowItem.get("ApportionmentDetails");
            apportionmentDetails.controls.forEach((detailItem, detailItemIndex) => {
                if (detailItem.get("TypeOfCost").value == typeOfCost) {
                    apportionmentDetails.removeAt(detailItemIndex);
                }
            });
        });
    }
    /**
     * to remove the grid item...
    */
    removeGridItem2(rowIndex: number) {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
        itemGroupControl.removeAt(rowIndex);
    }
    /**
    * to remove the grid item...
   */
    removeGridItem3(rowIndex: number, gridFAName: string) {
        let itemGroupControl = new FormArray([]);
        itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls[gridFAName]
        itemGroupControl.removeAt(rowIndex);
        if (itemGroupControl.controls.length == 0)
            this.addGridItem(1, gridFAName);
    }
    // removeGridItem3(rowIndex: number) {
    //     let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
    //     itemGroupControl.removeAt(rowIndex);
    // }
    resetPagerConfig() {
        this.purchaseOrderPagerConfig.RecordsToSkip = 0;
        this.purchaseOrderPagerConfig.RecordsToFetch = 500;
        this.currentPage = 1;
    }
    resetFilters() {
        this.poFilterInfoForm.reset();
        this.requestSearchKey = "";
        this.filterMessage = "";
        debugger;
        this.getProjectPOList(0);
        this.resetPagerConfig();
        if (this.docCodeRef != undefined) {
            this.docCodeRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.docCodeRef.nativeElement, 'focus'); // NEW VERSION
        }
    }
    resetData() {
        this.isFilterApplied = false;
        this.showFilterPopUp = true;
        this.resetFilters();
    }
    reject(remarks: string) {

        this.updateStatus(WorkFlowStatus.Rejected, remarks);
    }
    restrictMinusValue(e: any) {
        restrictMinus(e);
    }

    validateAttachments(): boolean {
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
    SetRequiredValidation(action: string) {
        let _currency = this.projectPurchaseOrderForm.get('CurrencyId');
        let _payTerms = this.projectPurchaseOrderForm.get('PaymentTermsId');
        let _dept = this.projectPurchaseOrderForm.get('LocationId');
        let _contractDescription = this.projectPurchaseOrderForm.get('ContractDescription');
        let _serviceType = this.projectPurchaseOrderForm.get('ServiceType');
        let _taxAuthority = this.projectPurchaseOrderForm.get('TaxAuthorityId');
        let _taxId = this.projectPurchaseOrderForm.get('TaxId');
        let _expenseType = this.projectPurchaseOrderForm.get('ExpensesTypeId');
        let _retSupCode = this.projectPurchaseOrderForm.get('RetentionSupplierCode');
        let _retTypeId = this.projectPurchaseOrderForm.get('RetentionTypeId');
        let _retPercentage = this.projectPurchaseOrderForm.get('RetentionPercentage');
        let _subCode = this.projectPurchaseOrderForm.get('SupplierSubCodeId');
        let lineitems = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
        let tocItems = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
        let appItems = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
        let discItems = <FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems'];
        let TotalBefTax = Number(this.projectPurchaseOrderForm.get('TotalBefTax').value);
        let subTotal = Number(this.projectPurchaseOrderForm.get('SubTotal').value);
        let OCSum = Number(this.projectPurchaseOrderForm.get('OriginalContractSum').value);
        let _retApplicable = this.projectPurchaseOrderForm.get('IsRetentionApplicable');
        _dept.setErrors(null);
        _currency.setErrors(null);
        _payTerms.setErrors(null);
        _retTypeId.setErrors(null);
        _retSupCode.setErrors(null);
        _contractDescription.setErrors(null);
        _serviceType.setErrors(null);
        _taxAuthority.setErrors(null);
        _taxId.setErrors(null);
        _expenseType.setErrors(null);
        _retSupCode.setErrors(null);
        _retTypeId.setErrors(null);
        lineitems.controls.forEach(item => {
            item.get('ItemDescription').setErrors(null);
            item.get('ContractValue').setErrors(null);
        });
        discItems.controls.forEach(item => {
            item.get('DisApportionmentMethod').setErrors(null);
            item.get('DisItemDescription').setErrors(null);
        });
        tocItems.controls.forEach(item => {
            item.get('TypeOfCost').setErrors(null);
            item.get('CostDescription').setErrors(null);
            item.get('GL_Cost').setErrors(null);
            item.get('GL_Cost_Description').setErrors(null);
            item.get('GST_Group').setErrors(null);
            item.get('GST_Class').setErrors(null);
            item.get('GL_Retention').setErrors(null);
            item.get('GL_Retention_Description').setErrors(null);
            item.get('GL_GroupRetention').setErrors(null);
            item.get('GL_ClassRetention').setErrors(null);
            item.get('Prefix').setErrors(null);
        });
        appItems.controls.forEach(item => {
            item.get('Method').setErrors(null);
            item.get('Remarks').setErrors(null);
            (<FormArray>item.get('ApportionmentDetails')).controls.forEach((y) => {
                y.get('Amount').setErrors(null);
            });
        });
        _retPercentage.setValue(_retPercentage.value == null ? 0 : _retPercentage.value);
        if (_dept.value == 0 || _dept.value == null) {
            _dept.setErrors({ 'required': true });
        }
        if (action == 'send' || action == 'approve') {
            _currency.setErrors((_currency.value == 0 || _currency.value == null || _currency.value == undefined) ? { 'required': true } : null);
            _payTerms.setErrors((_payTerms.value == 0 || _payTerms.value == null || _payTerms.value == undefined) ? { 'required': true } : null);
            if (this.projectPurchaseOrderForm.get('IsRetentionApplicable').value == true) {
                _retSupCode.setErrors((_retSupCode.value == 0 || _retSupCode.value == null) ? { 'required': true } : null);
                _retTypeId.setErrors((_retTypeId.value == 0) ? { 'required': true } : null);
            }
            _subCode.setErrors((_subCode.value == null || _subCode.value == 0 || _subCode.value == undefined) ? { 'required': true } : null);
            _contractDescription.setErrors((_contractDescription.value == '' || _contractDescription.value == null) ? { 'required': true } : null);
            _serviceType.setErrors((_serviceType.value == 0 || _serviceType.value == null) ? { 'required': true } : null);
            _taxAuthority.setErrors((_taxAuthority.value == 0 || _taxAuthority.value == null) ? { 'required': true } : null);
            _taxId.setErrors((_taxId.value == 0 || _taxId.value == null) ? { 'required': true } : null);
            _expenseType.setErrors((_expenseType.value == 0 || _expenseType.value == null) ? { 'required': true } : null);
            lineitems.controls.forEach(item => {
                let _itemDesc = item.get('ItemDescription');
                let _contractVal = item.get('ContractValue');
                let _appMethod = item.get('ApportionmentMethod');
                _itemDesc.setErrors(null);
                _contractVal.setErrors(null);
                _appMethod.setErrors(null);
                _itemDesc.setErrors((_itemDesc.value == '' || _itemDesc.value == null) ? { 'required': true } : null);
                _contractVal.setErrors((subTotal == 0 && TotalBefTax == 0) ? { 'griderror': true } : null);
                _contractVal.setErrors(((OCSum == TotalBefTax) && (subTotal != 0 && TotalBefTax != 0)) ? null : { 'totalError': true });
                _appMethod.setErrors(((action == 'approve') && (_appMethod.value == '' || _appMethod.value == null)) ? { 'required': true } : null);
            });
            // discItems.controls.forEach(item => {
            //     let _discItemDesc = item.get('DisItemDescription');
            //     if (item.get('DiscountValue').value != 0 && (_discItemDesc.value == '' || _discItemDesc.value == null)) {
            //         _discItemDesc.setErrors({ 'required': true });
            //     }
            // });
            if (action == 'approve') {
                discItems.controls.forEach(item => {
                    let _appMethod = item.get('DisApportionmentMethod');
                    _appMethod.setErrors(null);
                    if (item.get('DiscountValue').value != 0 && (_appMethod.value == '' || _appMethod.value == null)) {
                        _appMethod.setErrors({ 'required': true });
                    }
                });
                tocItems.controls.forEach(item => {
                    let _toc = item.get('TypeOfCost');
                    let _tocDesc = item.get('CostDescription');
                    let _glCost = item.get('GL_Cost');
                    let _glCostDesc = item.get('GL_Cost_Description');
                    let _gstGroup = item.get('GST_Group');
                    let _gstClass = item.get('GST_Class');
                    let _glRet = item.get('GL_Retention');
                    let _glRetDesc = item.get('GL_Retention_Description');
                    let _glGroupRet = item.get('GL_GroupRetention');
                    let _glClassRet = item.get('GL_ClassRetention');
                    let _prefix = item.get('Prefix');
                    _toc.setErrors((_toc.value == '' || _toc.value == null) ? { 'required': true } : null);
                    _tocDesc.setErrors((_tocDesc.value == 0 || _tocDesc.value == null) ? { 'required': true } : null);
                    _glCost.setErrors((_glCost.value == 0 || _glCost.value == null) ? { 'required': true } : null);
                    _glCostDesc.setErrors((_glCostDesc.value == 0 || _glCostDesc.value == null) ? { 'required': true } : null);
                    _gstGroup.setErrors((_gstGroup.value == 0 || _gstGroup.value == null) ? { 'required': true } : null);
                    _gstClass.setErrors((_gstClass.value == 0 || _gstClass.value == null) ? { 'required': true } : null);
                    _glRet.setErrors(((_glRet.value == 0 || _glRet.value == null) && _retApplicable.value) ? { 'required': true } : null);
                    _glRetDesc.setErrors(((_glRetDesc.value == 0 || _glRetDesc.value == null) && _retApplicable.value) ? { 'required': true } : null);
                    _glGroupRet.setErrors(((_glGroupRet.value == 0 || _glGroupRet.value == null) && _retApplicable.value) ? { 'required': true } : null);
                    _glClassRet.setErrors(((_glClassRet.value == 0 || _glClassRet.value == null) && _retApplicable.value) ? { 'required': true } : null);
                    _prefix.setErrors((_prefix.value == 0 || _prefix.value == null) ? { 'required': true } : null);
                });
                appItems.controls.forEach(item => {
                    let _method = item.get('Method');
                    let _remarks = item.get('Remarks');
                    _method.setErrors((_method.value == '' || _method.value == null) ? { 'required': true } : null);
                    _remarks.setErrors((_remarks.value == '' || _remarks.value == null) ? { 'required': true } : null);
                    (<FormArray>item.get('ApportionmentDetails')).controls.forEach((y) => {
                        y.get('Amount').setErrors((y.get('Amount').value == null) ? { 'griderror': true } : null);
                    });
                })
            }
            this.onContractSumChange();
        }
    }

    saveRecord(action: string) {
        this.showGridErrorMessage1 = false;
        this.showGridErrorMessage2 = false;
        this.showGridErrorMessage3 = false;
        this.SetRequiredValidation(action);
        let projectMasterContractDetails: ProjectMasterContract = this.projectPurchaseOrderForm.value;
        projectMasterContractDetails.Action = action;
        if (action == 'verify') {
            this.doApproveReject = false;
        }
        let formStatus = this.projectPurchaseOrderForm.status;
        if (action == 'send' && formStatus != "INVALID" && this.hideText == true && this.validateAttachments() && this.selectedPODetails.ProjectMasterContractId > 0) {
            let workFlowDetails: WorkFlowParameter = {
                ProcessId: WorkFlowProcess.ProjectMasterContract,
                CompanyId: this.selectedPODetails.CompanyId,
                LocationId: this.selectedPODetails.LocationId,
                FieldName: "",
                Value: this.selectedPODetails.AdjustedContractSum,
                DocumentId: this.selectedPODetails.ProjectMasterContractId,
                CreatedBy: this.selectedPODetails.CreatedBy,
                WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
                DocumentCode: this.selectedPODetails.POPMasterCode
            };
            HideFullScreen(null);
            this.sharedServiceObj.sendForApproval(workFlowDetails).subscribe((data) => {
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.SentForApproval,
                    MessageType: MessageTypes.Success
                });
                this.getProjectPOList(workFlowDetails.DocumentId);
            });
            return;
        }
        if (formStatus != "INVALID" && this.showGridErrorMessage1 == false && this.showGridErrorMessage2 == false && this.showGridErrorMessage3 == false) {
            projectMasterContractDetails.CreatedBy = this.userDetails.UserID;
            projectMasterContractDetails.WorkFlowStatusId = (action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval);
            projectMasterContractDetails["ContractStartDate"] = this.reqDateFormatPipe.transform(projectMasterContractDetails.ContractStartDate);
            projectMasterContractDetails["ContractEndDate"] = this.reqDateFormatPipe.transform(projectMasterContractDetails.ContractEndDate);
            projectMasterContractDetails.OriginalContractSum = this.projectPurchaseOrderForm.get('OriginalContractSum').value;
            projectMasterContractDetails.AdjustedContractSum = this.projectPurchaseOrderForm.get('AdjustedContractSum').value;

            // projectMasterContractDetails.ContractStartDate = this.reqDateFormatPipe.transform(projectMasterContractDetails.ContractStartDate);
            // projectMasterContractDetails.ContractEndDate = this.reqDateFormatPipe.transform(projectMasterContractDetails.ContractEndDate);
            projectMasterContractDetails.CompanyId = this.sessionService.getCompanyId();
            //projectMasterContractDetails.LocationId = 2;
            // if (projectMasterContractDetails.Departments == null) {
            //     projectMasterContractDetails.Departments = [];
            // }
            // if (projectMasterContractDetails.DepartmentsToDelete == null) {
            //     projectMasterContractDetails.DepartmentsToDelete = [];
            // }
            if (projectMasterContractDetails.ProjectMasterContractItems == null) {
                projectMasterContractDetails.ProjectMasterContractItems = [];
            }
            if (projectMasterContractDetails.DiscountLineItems == null) {
                projectMasterContractDetails.DiscountLineItems = [];
            }
            if (projectMasterContractDetails.POPCostCategory == null) {
                projectMasterContractDetails.POPCostCategory = [];
            }
            if (projectMasterContractDetails.POPDistributionSummaryItems == null) {
                projectMasterContractDetails.POPDistributionSummaryItems = [];
            }
            // if (projectMasterContractDetails.ProjectMasterContractItemsToDelete == null) {
            //     projectMasterContractDetails.ProjectMasterContractItemsToDelete = [];
            // }

            if (projectMasterContractDetails.IsRetentionApplicable == null || projectMasterContractDetails.IsRetentionApplicable == undefined) {
                projectMasterContractDetails.IsRetentionApplicable = false;
            }

            //this.projectPurchaseOrderForm.get("TotalVOSum").setValue(0);
            projectMasterContractDetails.RequestedBy = this.userDetails.UserID;
            projectMasterContractDetails.CreatedBy = this.userDetails.UserID;

            projectMasterContractDetails.ProjectMasterContractItems.forEach(i => {
                i.Expense = new AccountCode();
                i.AccountCode = ''
                if (i.ProjectMasterContractItemId > 0) {
                    let previousRecord = this.selectedPODetails.ProjectMasterContractItems.find(j => j.ProjectMasterContractItemId == i.ProjectMasterContractItemId);

                    if (
                        i.ItemDescription != previousRecord.ItemDescription ||
                        // i.Expense.AccountCodeId != previousRecord.Expense.AccountCodeId ||
                        // i.AccountCode != previousRecord.AccountCode ||
                        // i.TypeOfCostName != previousRecord.TypeOfCostName ||
                        i.ApportionmentMethod != previousRecord.ApportionmentMethod ||
                        i.ContractValue != previousRecord.ContractValue) {
                        i.IsModified = true;
                        i.ItemId = 0;
                    }
                }
                else {
                    i.ProjectMasterContractItemId = 0;
                    i.ItemId = 0;
                    i.ApportionmentId = 0;
                    i.AccountCodeCategoryId = 0;

                }
            });
            projectMasterContractDetails.DiscountLineItems.forEach(i => {
                i.AccountCode = '';
                i.Expense = new AccountCode();
                if (i.ProjectMasterContractItemId > 0) {
                    let previousRecord = this.selectedPODetails.DiscountLineItems.find(j => j.ProjectMasterContractItemId == i.ProjectMasterContractItemId);

                    if (
                        i.DisItemDescription != previousRecord.DisItemDescription ||
                        // i.Expense.AccountCodeId != previousRecord.Expense.AccountCodeId ||
                        // i.AccountCode != previousRecord.AccountCode ||
                        // i.DisTypeOfCostName != previousRecord.DisTypeOfCostName ||
                        i.DisApportionmentMethod != previousRecord.DisApportionmentMethod ||
                        i.DiscountValue != previousRecord.DiscountValue) {
                        i.IsModified = true;
                        i.ItemId = 0;
                    }
                }
                else {
                    i.ProjectMasterContractItemId = 0;
                    i.ItemId = 0;
                    i.ApportionmentId = 0;
                    i.AccountCodeCategoryId = 0;

                }
            });
            projectMasterContractDetails.POPCostCategory.forEach(i => {

                if (i.POPCostCategoryId > 0) {
                    let previousRecord = this.selectedPODetails.POPCostCategory.find(j => j.POPCostCategoryId == i.POPCostCategoryId);

                    if (
                        i.TypeOfCost != previousRecord.TypeOfCost ||
                        i.CostDescription != previousRecord.CostDescription ||
                        i.GL_Cost != previousRecord.GL_Cost ||
                        i.GL_Cost_Description != previousRecord.GL_Cost_Description ||
                        i.GST_Group != previousRecord.GST_Group ||
                        i.GST_Class != previousRecord.GST_Class ||
                        i.GL_Retention != previousRecord.GL_Retention ||
                        i.GL_Retention_Description != previousRecord.GL_Retention_Description ||
                        i.GL_GroupRetention != previousRecord.GL_GroupRetention ||
                        i.GL_ClassRetention != previousRecord.GL_ClassRetention ||
                        i.Prefix != previousRecord.Prefix) {
                        i.IsModified = true;

                    }
                    else {
                        i.IsModified = false;
                    }
                }
                else {
                    i.POPCostCategoryId = 0;


                }
            });
            projectMasterContractDetails.POPApportionment.forEach(i => {

                if (i.POPApportionmentId > 0) {
                    let previousRecord = this.selectedPODetails.POPApportionment.find(j => j.POPApportionmentId == i.POPApportionmentId);

                    if (
                        i.Method != previousRecord.Method ||
                        i.Total != previousRecord.Total ||
                        i.Remarks != previousRecord.Remarks
                    ) {
                        i.IsModified = true;
                    }
                    else {
                        i.IsModified = false;
                    }
                }
                else {
                    i.POPApportionmentId = 0;

                }
            });

            projectMasterContractDetails.POPDistributionSummaryItems.forEach(i => {

                if (i.DisturbutionSummaryId > 0) {
                    let previousRecord = this.selectedPODetails.POPDistributionSummaryItems.find(j => j.DisturbutionSummaryId == i.DisturbutionSummaryId);

                    if (
                        i.LocationName != previousRecord.LocationName ||
                        i.DistributionPercentage != previousRecord.DistributionPercentage ||
                        i.ContractAmount != previousRecord.ContractAmount ||
                        i.RetentionCode != previousRecord.RetentionCode
                    ) {
                        i.IsModified = true;
                    }
                }
                else {
                    i.DisturbutionSummaryId = 0;

                }
            });


            projectMasterContractDetails.POPCostCategory = projectMasterContractDetails.POPCostCategory.filter(i => i.POPCostCategoryId == 0 || i.POPCostCategoryId == null || i.IsModified == true || i.IsModified == false);
            projectMasterContractDetails.POPApportionment = projectMasterContractDetails.POPApportionment.filter(i => i.POPApportionmentId == 0 || i.POPApportionmentId == null || i.IsModified == true || i.IsModified == false);
            projectMasterContractDetails.POPDistributionSummaryItems = projectMasterContractDetails.POPDistributionSummaryItems.filter(i => i.DisturbutionSummaryId == 0 || i.DisturbutionSummaryId == null || i.IsModified == true);
            projectMasterContractDetails.RetentionTypeId = this.projectPurchaseOrderForm.get('RetentionTypeId').value;
            projectMasterContractDetails.RetentionTypeId = projectMasterContractDetails.IsRetentionApplicable ? projectMasterContractDetails.RetentionTypeId : 0;
            if (action == 'send' ? this.validateAttachments() : true) {
                if (this.selectedPODetails.ProjectMasterContractId == 0 || this.selectedPODetails.ProjectMasterContractId == null) {
                    projectMasterContractDetails.ProjectMasterContractItems = projectMasterContractDetails.ProjectMasterContractItems.filter(i => i.ProjectMasterContractItemId == 0 || i.ProjectMasterContractItemId == null || i.IsModified == true);
                    projectMasterContractDetails.DiscountLineItems = projectMasterContractDetails.DiscountLineItems.filter(i => i.ProjectMasterContractItemId == 0 || i.ProjectMasterContractItemId == null || i.IsModified == true);
                    projectMasterContractDetails.ProjectMasterContractId = 0;
                    // projectMasterContractDetails.TaxGroupId = this.projectPurchaseOrderForm.get('TaxGroupId').value;
                    projectMasterContractDetails.TotalVOSum = 0;
                    HideFullScreen(null);
                    this.projectContractMasterServiceObj.createProjectMasterContract(projectMasterContractDetails, this.uploadedFiles)
                        .subscribe((poId: number) => {
                            this.hideText = true;
                            this.hideInput = false;
                            this.uploadedFiles.length = 0;
                            this.uploadedFiles = [];
                            this.getProjectPOList(poId);
                            this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.SavedSuccessFully,
                                MessageType: MessageTypes.Success
                            });
                        });
                }
                else {
                    ///we will get deleted departments....
                    projectMasterContractDetails.DepartmentsToDelete = [];
                    // this.selectedPODetails.Departments.forEach((data) => {
                    //     if (projectMasterContractDetails.Departments == null ||
                    //         projectMasterContractDetails.Departments.findIndex(x => x.LocationID == data.LocationID) == -1) {
                    //         projectMasterContractDetails.DepartmentsToDelete.push(data.LocationID);
                    //     }
                    // });
                    //we will get only new departments...
                    // if (projectMasterContractDetails.Departments != null) {
                    //     projectMasterContractDetails.Departments = projectMasterContractDetails.Departments.filter((data) => {
                    //         if (this.selectedPODetails.Departments == null ||
                    //             this.selectedPODetails.Departments.findIndex(x => x.LocationID == data.LocationID) == -1) {
                    //             return data;
                    //         }
                    //     });
                    // }
                    if (projectMasterContractDetails.Departments == null) {
                        projectMasterContractDetails.Departments = [];
                    }
                    //we will get deleted master contract items...
                    projectMasterContractDetails.ProjectMasterContractItemsToDelete = [];

                    this.selectedPODetails.ProjectMasterContractItems.forEach((data) => {
                        if (projectMasterContractDetails.ProjectMasterContractItems == null ||
                            projectMasterContractDetails.ProjectMasterContractItems.findIndex(x => x.ProjectMasterContractItemId == data.ProjectMasterContractItemId) == -1) {
                            projectMasterContractDetails.ProjectMasterContractItemsToDelete.push(data.ProjectMasterContractItemId);
                        }
                    });

                    //  we will get only new master contract items......
                    if (projectMasterContractDetails.ProjectMasterContractItems != null) {
                        projectMasterContractDetails.ProjectMasterContractItems = projectMasterContractDetails.ProjectMasterContractItems.filter((data) => {

                            let index = this.selectedPODetails.ProjectMasterContractItems.findIndex(x => x.ProjectMasterContractItemId == data.ProjectMasterContractItemId);
                            if (this.selectedPODetails.ProjectMasterContractItems == null ||
                                index == -1) {
                                return data;
                            }
                            else if (index > -1) {
                                let previousRecord = this.selectedPODetails.ProjectMasterContractItems[index];
                                if (previousRecord.ItemDescription != data.ItemDescription
                                    // || previousRecord.AccountCodeId != data.AccountCodeId
                                    // || previousRecord.AccountCode != data.AccountCode
                                    // || previousRecord.TypeOfCostName != data.TypeOfCostName
                                    || previousRecord.ApportionmentMethod != data.ApportionmentMethod
                                    || previousRecord.ContractValue != data.ContractValue) {
                                    return data;
                                }
                            }
                        });
                    }
                    if (projectMasterContractDetails.ProjectMasterContractItems == null) {
                        projectMasterContractDetails.ProjectMasterContractItems = [];
                    }

                    //we will get deleted master discount items...
                    projectMasterContractDetails.ProjectMasterDiscountItemsToDelete = [];

                    this.selectedPODetails.DiscountLineItems.forEach((data) => {
                        if (projectMasterContractDetails.DiscountLineItems == null ||
                            projectMasterContractDetails.DiscountLineItems.findIndex(x => x.ProjectMasterContractItemId == data.ProjectMasterContractItemId) == -1) {
                            projectMasterContractDetails.ProjectMasterDiscountItemsToDelete.push(data.ProjectMasterContractItemId);
                        }
                    });

                    if (projectMasterContractDetails.DiscountLineItems != null) {
                        projectMasterContractDetails.DiscountLineItems = projectMasterContractDetails.DiscountLineItems.filter((data) => {

                            let index = this.selectedPODetails.DiscountLineItems.findIndex(x => x.ProjectMasterContractItemId == data.ProjectMasterContractItemId);
                            if (this.selectedPODetails.DiscountLineItems == null ||
                                index == -1) {
                                return data;
                            }
                            else if (index > -1) {
                                let previousRecord = this.selectedPODetails.DiscountLineItems[index];
                                if (previousRecord.DisItemDescription != data.DisItemDescription
                                    // || previousRecord.AccountCodeId != data.AccountCodeId
                                    // || previousRecord.AccountCode != data.AccountCode
                                    // || previousRecord.DisTypeOfCostName != data.DisTypeOfCostName
                                    || previousRecord.DisApportionmentMethod != data.DisApportionmentMethod
                                    || previousRecord.DiscountValue != data.DiscountValue) {
                                    return data;
                                }
                            }
                        });
                    }
                    if (projectMasterContractDetails.DiscountLineItems == null) {
                        projectMasterContractDetails.DiscountLineItems = [];
                    }

                    //we will get deleted master contract items...
                    projectMasterContractDetails.POPCostCategoryToDelete = [];

                    // this.selectedPODetails.POPCostCategory.forEach((data) => {
                    //     if (projectMasterContractDetails.POPCostCategory == null ||
                    //         projectMasterContractDetails.POPCostCategory.findIndex(x => x.POPCostCategoryId == data.POPCostCategoryId) == -1) {
                    //         projectMasterContractDetails.POPCostCategoryToDelete.push(data.POPCostCategoryId);
                    //     }
                    // });

                    //we will get only new master cost categories.........
                    // if (projectMasterContractDetails.POPCostCategory != null) {
                    //     projectMasterContractDetails.POPCostCategory = projectMasterContractDetails.POPCostCategory.filter((data) => {

                    //         let index = this.selectedPODetails.POPCostCategory.findIndex(x => x.POPCostCategoryId == data.POPCostCategoryId);
                    //         if (this.selectedPODetails.POPCostCategory == null ||
                    //             index == -1) {
                    //             return data;
                    //         }
                    //         else if (index > -1) {
                    //             let previousRecord = this.selectedPODetails.POPCostCategory[index];
                    //             if (previousRecord.CostDescription != data.CostDescription
                    //                 || previousRecord.TypeOfCost != data.TypeOfCost
                    //                 || previousRecord.GL_Cost != data.GL_Cost
                    //                 || previousRecord.GL_Cost_Description != data.GL_Cost_Description
                    //                 || previousRecord.GST_Group != data.GST_Group
                    //                 || previousRecord.GL_Retention != data.GL_Retention
                    //                 || previousRecord.GL_Retention_Description != data.GL_Retention_Description
                    //                 || previousRecord.GL_GroupRetention != data.GL_GroupRetention
                    //                 || previousRecord.GL_ClassRetention != data.GL_ClassRetention
                    //                 || previousRecord.Prefix != data.Prefix
                    //             ) {
                    //                 return data;
                    //             }
                    //         }
                    //     });
                    // }
                    if (projectMasterContractDetails.POPCostCategory == null) {
                        projectMasterContractDetails.POPCostCategory = [];
                    }

                    //we will get deleted pop apportionments...
                    // projectMasterContractDetails.POPApportionmentToDelete = [];
                    // this.selectedPODetails.POPApportionment.forEach((data) => {
                    //     if (projectMasterContractDetails.POPApportionment == null ||
                    //         projectMasterContractDetails.POPApportionment.findIndex(x => x.POPApportionmentId == data.POPApportionmentId) == -1) {
                    //         projectMasterContractDetails.POPApportionmentToDelete.push(data.POPApportionmentId);
                    //     }
                    // });
                    //we will get only new pop apportionments.........
                    // if (projectMasterContractDetails.POPApportionment != null) {
                    //     projectMasterContractDetails.POPApportionment = projectMasterContractDetails.POPApportionment.filter((data) => {
                    //         let index = this.selectedPODetails.POPApportionment.findIndex(x => x.POPApportionmentId == data.POPApportionmentId);
                    //         if (this.selectedPODetails.POPApportionment == null ||
                    //             index == -1) {
                    //             return data;
                    //         }
                    //         else if (index > -1) {
                    //             let previousRecord = this.selectedPODetails.POPApportionment[index];
                    //             if (previousRecord.POPApportionmentId != data.POPApportionmentId
                    //                 || previousRecord.Method != data.Method
                    //                 || previousRecord.Remarks != data.Remarks
                    //                 || previousRecord.Total != data.Total
                    //                 || (_.isEqual(previousRecord.ApportionmentDetails, data.ApportionmentDetails) == false)) {
                    //                 return data;
                    //             }
                    //         }
                    //     });
                    // }
                    if (projectMasterContractDetails.POPApportionment == null) {
                        projectMasterContractDetails.POPApportionment = [];
                    }

                    //we will get deleted pop apportionments...
                    projectMasterContractDetails.POPDistributionSummaryToDelete = [];
                    this.selectedPODetails.POPDistributionSummaryItems.forEach((data) => {
                        if (projectMasterContractDetails.POPDistributionSummaryItems == null ||
                            projectMasterContractDetails.POPDistributionSummaryItems.findIndex(x => x.DisturbutionSummaryId == data.DisturbutionSummaryId) == -1) {
                            projectMasterContractDetails.POPDistributionSummaryToDelete.push(data.DisturbutionSummaryId);
                        }
                    });

                    //we will get only new pop distribution summary items...........
                    if (projectMasterContractDetails.POPDistributionSummaryItems != null) {
                        projectMasterContractDetails.POPDistributionSummaryItems = projectMasterContractDetails.POPDistributionSummaryItems.filter((data) => {

                            let index = this.selectedPODetails.POPDistributionSummaryItems.findIndex(x => x.DisturbutionSummaryId == data.DisturbutionSummaryId);
                            if (this.selectedPODetails.POPDistributionSummaryItems == null ||
                                index == -1) {
                                return data;
                            }
                            else if (index > -1) {
                                // || previousRecord.RetentionAmount != data.RetentionAmount
                                // || previousRecord.ThisCerification != data.ThisCerification
                                let previousRecord = this.selectedPODetails.POPDistributionSummaryItems[index];
                                if (previousRecord.DisturbutionSummaryId != data.DisturbutionSummaryId
                                    || previousRecord.DepartmentId != data.DepartmentId
                                    || previousRecord.RetentionCode != data.RetentionCode
                                    || previousRecord.ContractAmount != data.ContractAmount
                                    || previousRecord.DistributionPercentage != data.DistributionPercentage
                                ) {
                                    return data;
                                }
                            }
                        });
                    }
                    if (projectMasterContractDetails.POPDistributionSummaryItems == null) {
                        projectMasterContractDetails.POPDistributionSummaryItems = [];
                    }


                    projectMasterContractDetails.Attachments = this.selectedPODetails.Attachments.filter(i => i.IsDelete == true);
                    projectMasterContractDetails.IsVerifier = this.verifyPermission;
                    HideFullScreen(null);
                    this.projectContractMasterServiceObj.updateProjectMasterContract(projectMasterContractDetails, this.uploadedFiles)
                        .subscribe((poId: number) => {
                            this.hideText = true;
                            this.hideInput = false;
                            this.uploadedFiles.length = 0;
                            this.uploadedFiles = [];
                            this.readListView.emit({ PoId: projectMasterContractDetails.ProjectMasterContractId, PotypeId: this.poTypeId });

                            //  this.getProjectPOList(projectMasterContractDetails.ProjectMasterContractId);
                            this.sharedServiceObj.showMessage({
                                ShowMessage: true,
                                Message: Messages.UpdatedSuccessFully,
                                MessageType: MessageTypes.Success
                            });
                            this.doApproveReject = true;
                            this.hideCancelinVerify = false;
                            this.hideVerifyButton = true;
                            this.getProjectPOList(0);
                            this.onRecordSelection(projectMasterContractDetails.ProjectMasterContractId);
                        });
                }
            }
        }
        else {
            Object.keys(this.projectPurchaseOrderForm.controls).forEach((key: string) => {
                if (this.projectPurchaseOrderForm.controls[key].status == "INVALID" && this.projectPurchaseOrderForm.controls[key].touched == false) {
                    this.projectPurchaseOrderForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
            if (itemGroupControl != undefined) {
                itemGroupControl.controls.forEach(controlObj => {
                    Object.keys(controlObj["controls"]).forEach((key: string) => {
                        let itemGroupControl = controlObj.get(key);
                        if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
                            itemGroupControl.markAsTouched();
                        }
                    });
                });
            }
            let itemGroupControl1 = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
            if (itemGroupControl1 != undefined) {
                itemGroupControl1.controls.forEach(controlObj => {
                    Object.keys(controlObj["controls"]).forEach((key: string) => {
                        let itemGroupControl1 = controlObj.get(key);
                        if (itemGroupControl1.status == "INVALID" && itemGroupControl1.touched == false) {
                            itemGroupControl1.markAsTouched();
                        }
                    });
                });
            }
            let itemGroupControl2 = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
            if (itemGroupControl2 != undefined) {
                itemGroupControl2.controls.forEach(controlObj => {
                    Object.keys(controlObj["controls"]).forEach((key: string) => {
                        let itemGroupControl2 = controlObj.get(key);
                        if (itemGroupControl2.status == "INVALID" && itemGroupControl2.touched == false) {
                            itemGroupControl2.markAsTouched();
                        }
                    });
                });
            }
        }
    }


    searchProjectMasterContract(projectMasterContractId: number = 0, isNotification: boolean = false, poFilterData?: ProjectContractMasterFilterModel) {

        let userDetails = <UserDetails>this.sessionService.getUser();
        let input = {
            Skip: this.purchaseOrderPagerConfig.RecordsToSkip,
            Take: this.purchaseOrderPagerConfig.RecordsToFetch,
            IsApprovalPage: this.isApprovalPage,//if it is approval page..
            Search: this.requestSearchKey,
            ProjectMasterContractId: isNotification == true ? projectMasterContractId : 0,
            UserId: userDetails.UserID,
            CompanyId: this.isApprovalPage == true ? 0 : this.sessionService.getCompanyId(),
            // SupplierName: (poFilterData.Supplier === null || poFilterData.Supplier === undefined) ? '' : poFilterData.Supplier['SupplierName']
        };
        if (poFilterData != null && poFilterData != undefined) {
            input["DocumentCode"] = (poFilterData.DocumentCode == null || poFilterData.DocumentCode == undefined) ? "" : poFilterData.DocumentCode;
            input["SupplierName"] = (poFilterData.Supplier === null || poFilterData.Supplier === undefined) ? '' : poFilterData.Supplier['SupplierName'];
            input["WorkFlowStatusId"] = (poFilterData.WorkFlowStatusId == null || poFilterData.WorkFlowStatusId == undefined) ? "" : poFilterData.WorkFlowStatusId;
            input["FromDate"] = (poFilterData.FromDate == null || poFilterData.FromDate == undefined) ? null : this.reqDateFormatPipe.transform(poFilterData.FromDate);
            input["ToDate"] = (poFilterData.ToDate == null || poFilterData.ToDate == undefined) ? null : this.reqDateFormatPipe.transform(poFilterData.ToDate);
        }
        this.showLeftPanelLoadingIcon = true;
        this.projectContractMasterServiceObj.searchProjectMasterContract(input)
            .subscribe((data: ProjectMasterContractDisplayResult) => {

                this.showLeftPanelLoadingIcon = false;
                if (data.ProjectMasterContractList.length > 0) {
                    this.showFilterPopUp = false;
                    this.projectPoList = data.ProjectMasterContractList;
                    this.purchaseOrderPagerConfig.TotalRecords = data.TotalRecords;
                    this.onRecordSelection(this.projectPoList[0].ProjectMasterContractId);
                }
                else {
                    this.showFilterPopUp = true;
                    this.filterMessage = "No matching records are found";
                    this.selectedPODetails = new ProjectMasterContract();
                }
            }, () => {
                this.showLeftPanelLoadingIcon = false;
            });
    }
    setContractDate(endDate: Date, startDate: Date) {
        let contractTerms: string = this.utilService.getContractDuration(startDate, endDate);
        this.projectPurchaseOrderForm.get('ContractTerms').setValue(contractTerms);
        this.selectedPODetails.ContractTerms = contractTerms;
    }
    //this method is used to format the content to be display in the autocomplete textbox after selection..
    supplierInputFormater = (x: Supplier) => x.SupplierName;
    supplierSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    return of([]);
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

    supplierActiveSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                if (term == "") {
                    this.projectPurchaseOrderForm.patchValue({
                        "SupplierAddress": "",
                        "ShippingFax": "",
                        "SupplierCode": "",
                        "IsGstRequired": false,
                        "SupplierTypeID": 1
                    });

                    // this.isSupplierSelected = false;
                    return of([]);
                }

                return this.sharedServiceObj.getActiveSuppliers({
                    searchKey: term,
                    supplierTypeId: 0,
                    companyId: this.companyId
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
        );
    clearDefaults(control) {
        debugger
        if (control.value == '') {
            this.currencies = [];
            this.projectPurchaseOrderForm.get('CurrencyId').setValue(0);
            this.paymentTerms = [];
            this.projectPurchaseOrderForm.get('PaymentTermsId').setValue(0);
        }
    }
    subCodeChange(value: number) {
        debugger
        let supplierCode = this.utilService.getSupplierCode(this.projectPurchaseOrderForm.get('Supplier').value.SupplierCode, '00');
        if (this.supplierSubCodes.length > 0 && value > 0) {
            let supplier = this.supplierSubCodes.find(s => s.SubCodeId == value);
            if (supplier) {
                let supplierCode = this.projectPurchaseOrderForm.get('Supplier').value.SupplierCode;
                this.projectPurchaseOrderForm.get('Supplier').value.SupplierCode = this.utilService.getSupplierCode(supplierCode, supplier.SubCode);
            }
            else {
                this.projectPurchaseOrderForm.get('Supplier').value.SupplierCode = supplierCode;
            }
        }
        else {
            this.projectPurchaseOrderForm.get('Supplier').value.SupplierCode = supplierCode;
        }
    }

    supplierChange(event?: any, isEdit: boolean = false) {

        let supplierDetails: Suppliers;
        if (isEdit == false && (event != null && event != undefined) && (event.item.WorkFlowStatus != null) && (event.item.WorkFlowStatus != "Approved")) {
            this.projectPurchaseOrderForm.get('Supplier').setValue(null);
            event.preventDefault();
            return false;
        }

        if (event != null && event != undefined) {
            supplierDetails = event.item;
            this.supplierid = event.item.SupplierId;
            this.TaxGroupId = supplierDetails.TaxGroupId;
            this.TaxId = supplierDetails.TaxID;
            this.projectPurchaseOrderForm.get('RetentionSupplierCode').setValue(0);
            this.projectPurchaseOrderForm.get('SupplierSubCodeId').setValue(null);
            this.projectPurchaseOrderForm.get('SupplierAddress').setValue(supplierDetails.SupplierAddress);
            this.getCurrenceis(event.item.CurrencyId);
            this.getpaymentTerms(event.item.PaymentTermsId);
        }
        else {
            supplierDetails = this.projectPurchaseOrderForm.get('Supplier').value;
        }


        this.getSupplierSubCodes(supplierDetails.SupplierId, this.companyId);
        this.getTaxGroups();

        this.supplierApiServiceObj.getSupplierServices(supplierDetails.SupplierId).subscribe((data: Array<SupplierServices>) => {
            this.supplierServices = data;
            if (isEdit == true) {
                this.projectPurchaseOrderForm.get('ServiceType').setValue(this.selectedPODetails.ServiceType);
            }
        });

        if (event != null && event != undefined) {
            // for (let i = 0; i < itemGroupControl1.length; i++) {
            this.projectPurchaseOrderForm.get('TaxAuthorityId').setValue(supplierDetails.TaxGroupId);
            this.projectPurchaseOrderForm.get('TaxGroupId').setValue(supplierDetails.TaxGroupId);
            this.projectPurchaseOrderForm.get('TaxId').setValue(event.item.TaxID);

            this.getTaxesByTaxAuthority(supplierDetails.TaxGroupId);

        }


    }


    showFullScreen() {
        this.innerWidth = window.innerWidth;
        if (this.innerWidth > 1000) {
            FullScreen(this.rightPanelRef.nativeElement);
        }
    }
    cancelRecord() {
        this.hasWorkFlow = true;
        this.projectPurchaseOrderForm.reset();
        this.projectPurchaseOrderForm.setErrors(null);
        this.hideInput = false;
        this.hideText = true;
        this.supplierid = 0;
        this.cancelChanges.emit(true);
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.showGridErrorMessage1 = false;
        this.showGridErrorMessage2 = false;
        this.showGridErrorMessage3 = false;
        if (this.projectPoList.length > 0) {
            this.onRecordSelection(this.projectPoList[0].ProjectMasterContractId);
        }
    }
    updateStatus(statusId: number, rejectionRemarks: string = "") {

        let remarks = "";
        let successMessage = "";
        let formRemarks = this.projectPurchaseOrderForm.get('ApprovalRemarks').value;
        if ((formRemarks == "" || formRemarks == null) && (statusId == WorkFlowStatus.AskedForClarification || statusId == WorkFlowStatus.WaitingForApproval)) {
            this.projectPurchaseOrderForm.get('ApprovalRemarks').setErrors({ "required": true });
            this.projectPurchaseOrderForm.get('ApprovalRemarks').markAsTouched();
            return;
        }

        if (statusId == WorkFlowStatus.Approved && this.verifyPermission) {
            let popdata = this.selectedPODetails.POPCostCategory;
            if (popdata.length == 0) {
                this.showGridErrorMessage2 = true;
                return;
            }
            else {
                this.showGridErrorMessage2 = false;
            }
        }
        if (statusId == WorkFlowStatus.Approved) {
            if (this.verifyPermission) {
                this.SetRequiredValidation('approve');
            }
            if (formRemarks != "" && formRemarks != null) {
                remarks = formRemarks;
            }
            else {
                remarks = "Approved";
            }
            remarks = (this.verifyPermission && statusId == WorkFlowStatus.Approved) ? "Verified" : "Approved";
            successMessage = Messages.Approved;
        }
        else if (statusId == WorkFlowStatus.Rejected) {
            if (rejectionRemarks != "" && rejectionRemarks != null) {
                remarks = rejectionRemarks;
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
        let userDetails = <UserDetails>this.sessionService.getUser();
        let workFlowStatus: WorkFlowApproval = {
            DocumentId: this.selectedPODetails.ProjectMasterContractId,
            UserId: userDetails.UserID,
            WorkFlowStatusId: statusId,
            Remarks: remarks,
            RequestUserId: this.selectedPODetails.CreatedBy,
            DocumentCode: this.selectedPODetails.POPMasterCode,
            ProcessId: WorkFlowProcess.ProjectMasterContract,
            CompanyId: this.sessionService.getCompanyId(),
            ApproverUserId: 0,
            IsReApproval: false
        };
        if (this.isApprovalPage == true) {
            if (this.projectPurchaseOrderForm.valid) {
                this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus).subscribe((data) => {
                    this.projectPurchaseOrderForm.get('ApprovalRemarks').setValue("");
                    if (statusId == WorkFlowStatus.Approved || statusId == WorkFlowStatus.Rejected) {
                        this.confirmationServiceObj.confirm({
                            message: successMessage,
                            header: Messages.PopupHeader,
                            rejectVisible: false,
                            acceptLabel: "OK"
                        });
                    } else {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: successMessage,
                            MessageType: MessageTypes.Success
                        });
                    }
                    this.requestSearchKey = "";
                    this.getProjectMasterContractsForApproval((statusId == WorkFlowStatus.Approved || statusId == WorkFlowStatus.Rejected) ? 0 : workFlowStatus.DocumentId);
                });
            }
        }
        else {
            workFlowStatus.ApproverUserId = this.selectedPODetails.CurrentApproverUserId;
            this.sharedServiceObj.workFlowClarificationReply(workFlowStatus).subscribe((data) => {
                this.projectPurchaseOrderForm.get('ApprovalRemarks').setValue("");
                this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: successMessage,
                    MessageType: MessageTypes.Success
                });
                this.requestSearchKey = "";
                this.getProjectPOList(workFlowStatus.DocumentId);
            });
        }
    }
    validateDates(from: string) {
        let startDateControl = this.projectPurchaseOrderForm.get('ContractStartDate');
        let endDateControl = this.projectPurchaseOrderForm.get('ContractEndDate');
        let startDate = <Date>startDateControl.value;
        let endDate = <Date>endDateControl.value;
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
        if (startDate != null && endDate != null) {
            this.setContractDate(endDate, startDate);
        }
    }
    //this method will be called on date picker focus event..
    onDatePickerFocus(element: NgbInputDatepicker, event: any) {
        if (!element.isOpen()) {
            element.open();
        }
    }

    onContractSumChange() {
        let value = this.projectPurchaseOrderForm.get('OriginalContractSum').value;
        let lineSum = this.getSubTotal();
        let adjsum = this.getSumValue();
        let retentionMaxLimit = this.getRetentionMaxValue();
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
        let distributionControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];

        let contractAmountSum = this.getTotalContractAmount();
        if (contractAmountSum != value) {
            for (let i = 0; i < distributionControl.length; i++) {
                // distributionControl.controls[i].get('ContractAmount').setErrors({ 'totalContractAmountError': true });
            }
        }
        else {
            for (let i = 0; i < distributionControl.length; i++) {
                distributionControl.controls[i].get('ContractAmount').setErrors({ 'totalContractAmountError': false });
                distributionControl.controls[i].get('ContractAmount').setErrors(null);
            }
        }
    }
    validateRetentionPercentage(value: number) {
        this.InvalidRententionPercentage = (value < 0 || value > 100) ? true : false;
    }
    getSumValue() {
        let contractSum = this.projectPurchaseOrderForm.get('OriginalContractSum').value;
        let voSum = this.projectPurchaseOrderForm.get('TotalVOSum').value;
        let adjustSum = contractSum + voSum;
        this.projectPurchaseOrderForm.get('AdjustedContractSum').setValue(adjustSum);
        this.getRetentionMaxValue();
    }
    getRetentionMaxValue() {
        let adjustedSum = this.projectPurchaseOrderForm.get('AdjustedContractSum').value;
        let retentionPer = this.projectPurchaseOrderForm.get('RetentionPercentage').value;
        if (retentionPer == null) {
            this.projectPurchaseOrderForm.get('RetentionPercentage').setValue(0);
        }
        let retentionMaxLimit = ((adjustedSum * retentionPer) / 100).toFixed(2);
        this.projectPurchaseOrderForm.get('RetentionMaxLimit').setValue(retentionMaxLimit);
    }
    setDiscountValue(index: number) {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems'];
        itemGroupControl.controls.forEach((row, rowindex) => {
            if (index == rowindex) {
                let _discountVal = row.get('DiscountValue').value;
                row.get('DiscountValue').setValue(_discountVal > 0 ? (-(_discountVal)) : _discountVal);
                return;
            }
        });
    }

    calculateTotalPrice(rowIndex: number, gridRow: any) {
        let subTotal = this.getSubTotal();
        let disSubTotal = this.getDisSubTotal();
        let totalBefTax = subTotal + disSubTotal;
        this.projectPurchaseOrderForm.get('SubTotal').setValue(subTotal);
        this.projectPurchaseOrderForm.get('TotalBefTax').setValue(totalBefTax);
        let totalTax = this.getTotalTax(this.projectPurchaseOrderForm.get('TaxId').value);
        let totalAmount = totalTax + totalBefTax;
        this.projectPurchaseOrderForm.get('TotalAmount').setValue(totalAmount.toFixed(2));
    }

    getSubTotal() {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
        if (itemGroupControl != undefined) {
            let subTotal = 0;
            itemGroupControl.controls.forEach(data => {
                subTotal = subTotal + data.get('ContractValue').value;
            });
            return subTotal;
        }
    }
    getDisSubTotal() {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems'];
        if (itemGroupControl != undefined) {
            let disSubTotal = 0;
            itemGroupControl.controls.forEach(data => {
                disSubTotal = disSubTotal + data.get('DiscountValue').value;
            });
            return disSubTotal;
        }
    }


    getTotalTax(taxId: number) {

        let taxRate = 0;
        let totalTax = 0;
        if (this.taxRateTypes.find(j => j.TaxId == taxId) != undefined) {
            taxRate = this.taxRateTypes.find(j => j.TaxId == taxId).TaxAmount;
        }
        let discount = this.projectPurchaseOrderForm.get('TotalBefTax').value;
        totalTax = (discount * taxRate) / 100;
        this.projectPurchaseOrderForm.get('TotalTax').setValue(totalTax);
        this.projectPurchaseOrderForm.get('TaxAmount').setValue(taxRate);
        return totalTax;
    }

    getTotalDistributionPercentage() {

        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        if (itemGroupControl != undefined) {
            let distributionPercentage = 0;
            itemGroupControl.controls.forEach(data => {
                distributionPercentage = distributionPercentage + data.get('DistributionPercentage').value;
            });

            return distributionPercentage;
        }
    }

    getTotalContractAmount() {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
        if (itemGroupControl != undefined) {
            let contractAmount = 0;
            itemGroupControl.controls.forEach(data => {
                contractAmount = contractAmount + data.get('ContractAmount').value;
            });

            return contractAmount;
        }
    }

    customSort(event: any) {

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
    onAmountChange(rowIndex: number) {

        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
        let apportionMentDetails = <FormArray>itemGroupControl.at(rowIndex).get('ApportionmentDetails');
        let total = 0;
        apportionMentDetails.controls.forEach(data => {
            total = total + data.get('Amount').value;
        });
        itemGroupControl.at(rowIndex).get('Total').setValue(total);
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
                    return of([]);
                }
                return this.sharedServiceObj.getServicesByKey({
                    searchKey: term,
                    companyId: this.companyId,
                    categoryId: 1 // Services
                }).map((data: AccountCodeMaster[]) => {
                    return data;
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }

    displayAccountCodePopUp(rowIndex: number, isGLCost: string) {

        this.AccountCodeInfoForm.reset();
        this.AccountCodeInfoForm.get("RowIndex").setValue(rowIndex);
        this.AccountCodeInfoForm.get("isGLCost").setValue(isGLCost);
        this.showGlCodeDialog = true;
        this.errmesagevisible = false;

    }
    // displayRetAccountCodePopUp(rowIndex: number, isGLCost: boolean) {

    //     this.AccountCodeInfoForm.reset();
    //     this.AccountCodeInfoForm.get("RowIndex").setValue(rowIndex);
    //     this.AccountCodeInfoForm.get("isGLCost").setValue(isGLCost);
    //     this.showGlCodeDialog = true;

    // }
    displayLogPopUp() {
        this.showLogPopUp = true;
    }


    hideLogPopUp(hidePopUp: boolean) {
        this.showLogPopUp = false;
    }
    //Line Items grid
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
                let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];

                accountCategoryId = itemGroupControl.controls[this.selectedRowId].get('AccountCodeCategoryId').value;

                return this.sharedServiceObj.getServicesByKeyforExpense({
                    searchKey: term,
                    companyId: this.companyId,
                    categoryId: accountCategoryId
                }).map((data: AccountCode[]) => {

                    return this.getAccountCodeList(data);
                    return this.getDiscountAccountCodeList(data);

                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }

    getAccountCodeList(data: AccountCode[]) {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCode>control.get('Expense').value;
        });
        return data;
    }

    onExpenseChange(eventData: any, index: number) {

        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
        itemGroupControl.controls[index].patchValue({
            ItemDescription: eventData.item.Description

        });
    }
    //End line items grid

    //start Discount Line Items grid
    DisExpenseInputFormater = (x: AccountCode) => x.Code;
    DisExpenseitemMasterSearch = (text$: Observable<string>) => {
        let accountCategoryId;
        if (text$ == undefined) {
            return of([]);
        }
        return text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((term) => {
                let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems'];

                accountCategoryId = itemGroupControl.controls[this.selectedRowId].get('AccountCodeCategoryId').value;

                return this.sharedServiceObj.getServicesByKeyforExpense({
                    searchKey: term,
                    companyId: this.companyId,
                    categoryId: accountCategoryId
                }).map((data: AccountCode[]) => {

                    return this.getDiscountAccountCodeList(data);

                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            })
        );
    }

    onDiscountCategoryChange(categoryId: number, rowIndex: number) {

        //let itemGroupControl1 = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];

        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems'];
        this.accountCategoryId = itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').value;

        let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('ProjectMasterContractItemId').value;


        if (itemGroupControl.controls[rowIndex] != undefined) {
            itemGroupControl.controls[rowIndex].reset();
        }

        itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').setValue(Number(this.accountCategoryId));
    }

    getDiscountAccountCodeList(data: AccountCode[]) {
        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems'];
        itemGroupControl.controls.forEach((control, index) => {
            let item = <AccountCode>control.get('Expense').value;
        });
        return data;
    }

    onDiscountExpenseChange(eventData: any, index: number) {

        let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems'];
        itemGroupControl.controls[index].patchValue({
            DisItemDescription: eventData.item.Description

        });
    }

    //End discount line items grid

    SaveAccountcode(action: string) {

        let rowindex = this.AccountCodeInfoForm.get('RowIndex').value;
        let isGLCost = this.AccountCodeInfoForm.get('isGLCost').value;
        let Itemmaster = this.AccountCodeInfoForm.get('Item').value;
        let accounttype = this.AccountCodeInfoForm.get('AccountTypeId').value;
        let subcategory = this.AccountCodeInfoForm.get('AccountCodeCategoryId').value;
        let accountCode = this.accountCodes.filter(x => x.AccountCodeId == Itemmaster)[0];

        if (accounttype != null || subcategory != null || Itemmaster != null) {
            this.errmesagevisible = false;
            let popCostCatControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
            if (isGLCost == "GLCost") {
                popCostCatControl.controls[rowindex].patchValue({
                    GL_Cost: accountCode.Code,
                    GL_Cost_Description: accountCode.Description
                });
            }
            if (isGLCost == "GLRetention") {
                popCostCatControl.controls[rowindex].patchValue({
                    GL_Retention: accountCode.Code,
                    GL_Retention_Description: accountCode.Description
                });
            }
            let distributionSummaryContol = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];

            if (isGLCost == "RetentionCode") {
                distributionSummaryContol.controls[rowindex].patchValue({
                    RetentionCode: accountCode.Code

                });
            }
            this.AccountCodeInfoForm.reset();
            this.showGlCodeDialog = false;

        }
        else {
            this.errmesagevisible = true;
            this.AccountCodeInfoForm.reset();
        }

        // if(accounttype==null )
        // {
        //     this.AccountCodeInfoForm.get('AccountTypeId').setErrors({ "required": true });
        //     this.AccountCodeInfoForm.get('AccountTypeId').markAsTouched();
        //     return;
        // }
        // if(subcategory==null )
        // {
        //     this.AccountCodeInfoForm.get('AccountCodeCategoryId').setErrors({ "required": true });
        //     this.AccountCodeInfoForm.get('AccountCodeCategoryId').markAsTouched();
        //     return;
        // }

        // if(Itemmaster==null )
        // {
        //     this.AccountCodeInfoForm.get('Item').setErrors({ "required": true });
        //     this.AccountCodeInfoForm.get('Item').markAsTouched();
        //     return;
        // }


    }

    // getTaxTypes() {
    //     this.sharedServiceObj.getTaxGroups(0)
    //         .subscribe((data: Taxes[]) => {
    //             this.taxRateTypes = data;
    //         });
    // }

    reCall() {
        this.showRecallPopup = true;
    }

    recallPoApproval(remarks) {
        if (remarks.value != null && remarks.value != '') {
            this.showRecallPopup = false;
            let userDetails = <UserDetails>this.sessionService.getUser();
            let poId = this.selectedPODetails.ProjectMasterContractId;
            let approvalObj = {
                PurchaseOrderId: poId,
                POTypeId: this.poTypeId,
                CreatedBy: userDetails.UserID,
                PurchaseOrderCode: this.selectedPODetails.POPMasterCode,
                PurchaseOrderType: this.purchaseOrderType,
                Supplier: this.selectedPODetails.Supplier,
                TotalAmount: this.selectedPODetails.TotalAmount,
                CurrentApproverUserName: this.selectedPODetails.CurrentApproverUserName,
                CreatedByUserName: userDetails.UserName,
                CurrentApproverUserId: this.selectedPODetails.CurrentApproverUserId,
                CompanyId: this.companyId,
                Reasons: remarks.value
            };
            remarks.value = '';
            this.projectPOCreationObj.recallPoApproval(approvalObj).subscribe(() => {
                this.getProjectPOList(0);
                this.readListView.emit({ PoId: poId, PotypeId: PurchaseOrderType.ProjectPo });
                this.onRecordSelection(poId);
            });
        }
    }

    PocVerify() {
        ;
        this.hideText = false;
        this.hideInput = true;
        // this.hidePOType
        this.hideCancelinVerify = true;
        this.hideVerifyButton = false;
        this.supplierid = 0;
        this.linesToAdd1 = 1;

        //resetting the item category form.
        this.clearForm();
        if (this.selectedPODetails.POPCostCategory.length > 0 || this.selectedPODetails.POPCostCategory.length == null) {
            this.addGridItem(this.selectedPODetails.POPCostCategory.length, "POPCostCategory");
            this.addGridItem(this.selectedPODetails.POPApportionment.length, "POPApportionment");
            this.addGridItem(this.selectedPODetails.POPDistributionSummaryItems.length, "POPDistributionSummaryItems");
        }
        else {
            this.addGridItem(this.linesToAdd1, "POPCostCategory");
            this.addGridItem(this.linesToAdd1, "POPApportionment");
            this.addGridItem(this.linesToAdd1, "POPDistributionSummaryItems");

        }

        this.addGridItem(this.selectedPODetails.ProjectMasterContractItems.length, "ProjectMasterContractItems");
        this.addGridItem(this.selectedPODetails.DiscountLineItems.length, "DiscountLineItems");
        // this.addGridItem(this.selectedPODetails.POPCostCategory.length, "POPCostCategory", true);
        // this.addGridItem(this.selectedPODetails.POPApportionment.length, "POPApportionment");
        // this.addGridItem(this.selectedPODetails.POPDistributionSummaryItems.length, "POPDistributionSummaryItems");

        this.projectPurchaseOrderForm.patchValue(this.selectedPODetails);
        this.getTaxesByTaxAuthority(this.selectedPODetails.TaxAuthorityId);
        //this.getTaxTypes();
        let popGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
        for (let i = 0; i < popGroupControl.length; i++) {
            let taxgroupId = popGroupControl.controls[i].get('GST_Group').value;
            this.getTaxesByTaxGroup(popGroupControl.controls[i].get('GST_Group').value, i, true);
            this.getTaxesByTaxGroup(popGroupControl.controls[i].get('GL_GroupRetention').value, i, false);

        }


        this.projectPurchaseOrderForm.get('LocationId').setValue(this.selectedPODetails.LocationId);
        this.projectPurchaseOrderForm.get('TaxId').setValue(this.selectedPODetails.TaxId);

        this.projectPurchaseOrderForm.get('ContractStartDate').setValue(new Date(this.selectedPODetails.ContractStartDate));
        this.projectPurchaseOrderForm.get('ContractEndDate').setValue(new Date(this.selectedPODetails.ContractEndDate));
        this.supplierChange(null, true);
        this.calculateTotalPrice(0, 0);

        this.showFullScreen();
        if (this.selectedPODetails.ContractStartDate != null && this.selectedPODetails.ContractEndDate != null) {
            this.setContractDate(new Date(this.selectedPODetails.ContractEndDate), new Date(this.selectedPODetails.ContractStartDate));
        }

        this.supplierid = this.selectedPODetails.Supplier.SupplierId;
        if (this.selectedPODetails.SupplierSubCodeId === null) {
            // this.isSupplierSelected = true;
            this.projectPurchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
            this.projectPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
        }
        this.doApproveReject = false;

    }

    cancel() {
        this.showGlCodeDialog = false;
        this.verifyPermission = true;
        this.hideCancelinVerify = false;
        this.hideVerifyButton = true;
        this.doApproveReject = true;
        this.projectPurchaseOrderForm.reset();
        this.projectPurchaseOrderForm.setErrors(null);
        this.hideInput = false;
        this.hideText = true;
        this.supplierid = 0;
        this.cancelChanges.emit(true);
        this.showGridErrorMessage1 = false;
        this.showGridErrorMessage2 = false;
        this.showGridErrorMessage3 = false;
        // this.ExpenseVisible = false;
    }

    onDepChage(event: any, department: any) {
        this.deptId = event.target.value;
        this.getWorkFlowConfiguration(department.selectedOptions[0].label);
    }

    getWorkFlowConfiguration(deptName: String) {
        this.processId = 22;
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
    getProjectPaymentContracts(projectMasterContractId: number) {
        let requestConfig = {
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID,
            FetchFilterData: true,
            ProjectMasterContractId: projectMasterContractId
        };
        this.projectContractPaymentServiceObj.getProjectPaymentContracts(requestConfig).subscribe((data: ProjectPayment[]) => {
            this.payments = data;
        });
    }
    getVOList(projectMasterContractId: number) {
        let requestConfig = {
            CompanyId: this.companyId,
            IsApprovalPage: this.isApprovalPage,
            UserId: this.userDetails.UserID,
            FetchFilterData: true,
            ProjectMasterContractId: projectMasterContractId
        };
        this.projectContractVariationAPIService.getVOList(requestConfig).subscribe((data: VariationOrder[]) => {
            this.variationOrders = data;
        });
    }
    redirectToVODetails(VODetails: any) {
        this.router.navigate(['po/projectcontractvariation/request/' + VODetails.POPId + '/' + VODetails.VOId], { queryParams: { from: 'cm' } });
    }
    redirectToPaymentDetails(paymentDetails: any) {
        this.router.navigate(['po/projectpaymenthistory/request/' + paymentDetails.POPId + '/' + paymentDetails.PaymentContractId], { queryParams: { from: 'cm' } });
    }

}


