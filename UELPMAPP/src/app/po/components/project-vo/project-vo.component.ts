import { element } from 'protractor';
import { PreventiveMaintenanceComponent } from './../../../facility/components/preventive-maintenance/preventive-maintenance.component';
import { DiscountLineItems, POPDistributionSummary, ProjectMasterContractItems, } from './../../models/project-contract-master.model';
import { Component, OnInit, ViewChild, Renderer, ElementRef, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ProjectMasterContract, POPCostCategory, POPApportionment, ProjectMasterContractDisplayResult, CostTypes, ProjectContractMasterFilterModel } from '../../models/project-contract-master.model';
import { SharedService } from '../../../shared/services/shared.service';
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { ExpensesType } from '../../models/expense-master.model';
import {
  Suppliers, BillingFrequency, Months, Taxes, PagerConfig, Messages, MessageTypes, UserDetails,
  WorkFlowStatus, WorkFlowProcess, WorkFlowApproval, WorkFlowStatusModel,
  PurchaseOrderType, Companies, COAAccountType, BillingType, ItemGLCode
} from '../../../shared/models/shared.model';
import { ProjectContractMasterService } from '../../services/project-contract-master.service';
import { FullScreen, restrictMinus, ValidateFileType } from '../../../shared/shared';
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
import { PageAccessLevel, Roles } from '../../../administration/models/role';
import { ProjectContractVariationOrder } from '../../models/project-variation-order.model';
import { ProjectContractVariationApiService } from '../../services/project-contract-variation.api.service';
import { GenericService } from '../../../shared/sevices/generic.service';
import { CurrencyMaskInputMode } from 'ngx-currency';
import { Location } from '@angular/common';
@Component({
  selector: 'app-project-vo',
  templateUrl: './project-vo.component.html',
  styleUrls: ['./project-vo.component.css'],
  providers: [POCreationService, ProjectContractMasterService, TaxService, SupplierApiService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ProjectVOComponent implements OnInit {
  options2precision = { prefix: '', precision: 2, inputMode: CurrencyMaskInputMode.NATURAL };
  options4precision = { prefix: '', precision: 4, inputMode: CurrencyMaskInputMode.NATURAL };
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
  moduleHeading = "";
  StatusId: number = 0;
  companyId: number = 0;
  supplierid: number;
  currentPage: number = 0;
  errorMessage: string = Messages.NoRecordsToDisplay;
  hideText?: boolean = null;
  hideInput?: boolean = null;
  linesToAdd: number = 2;
  linesToAdd1: number = 2;
  // // linesToAddCostCategory: number = 2;
  // // linesToAddApportionment: number = 2;
  // // linesToAddDistribution: number = 2;
  selectedProjectContractMasterId = -1;
  adHocContractTypes: Array<{ Id: number, Value: string }> = [];
  billingMonths: Array<{ Id: number, Value: string }> = [];
  costCentres: Array<CostCentre> = [];
  costTypes: Array<CostTypes> = [];
  departments: Array<any> = [];
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
  projectPurchaseOrderForm: FormGroup;
  selectedPODetails: ProjectMasterContract;
  purchaseOrderPagerConfig: PagerConfig;
  requestSearchKey: string = "";
  requestType: string = "";
  isSameUSer: boolean = false;
  isApproverUser: boolean = false;
  workFlowStatus: any;
  isApprovalPage: boolean = false;
  showLeftPanelLoadingIcon: boolean = false;
  // // poFilterInfoForm: FormGroup;
  workFlowStatuses: Array<WorkFlowStatusModel> = [];
  filterMessage: string = "";
  isFilterApplied: boolean = false;
  showFilterPopUp: boolean = false;
  showGridErrorMessage1: boolean = false;
  showGridErrorMessage2: boolean = false;
  showGridErrorMessage3: boolean = false;
  showVoidPopUp: boolean = false;
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
  // // isRetentionApplicable: boolean = false;
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
  // // showRetentionPer: boolean = false;
  // // showRetentionMaxLimit: boolean = false;
  // // showRetentionType: boolean = false;
  purchaseOrderType: string;
  typeofCostCategaries = [];
  typeofApportionmentMethods = [];
  doApproveReject: boolean = true;
  hideCancelinVerify: boolean = false;
  viewLogPermission: boolean = false;
  deptId: number = 0;
  processId: number = 0;
  hasWorkFlow: boolean = true;
  departmentsWorkflow: Array<any> = [];
  newPermission: boolean;
  userRoles = [];
  rolesAccessList = [];
  emailPermission: boolean;
  printPermission: boolean;
  editPermission: boolean = false;
  verifyPermission: boolean;
  approvePermission: boolean;
  sendForApprovalPermission: boolean = false;
  exportPermission: boolean;
  // // hasCostData: boolean = false;
  // // hasApportimentData: boolean = false;
  // // hasDistributionData: boolean = false;
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
  totalVOSumDiscountSubTotal: number = 0;
  rcvSubTotal: number = 0;
  rcvTotalBefTax: number = 0;
  rcvTax: number = 0;
  rcvTotal: number = 0;
  cvsTax: number = 0;
  vsTax: number = 0;
  cvsTotal: number = 0;
  vsTotal: number = 0;
  VSTotalBeforeTax: number = 0;
  voId: number = 0;
  cumVOSumSubTotal: number = 0;
  cumVoSumTotalBeforeTax: number = 0;
  pageType: string = '';
  IsViewMode: boolean = true;
  projectMasterContractId: number = 0;
  doUpdate: boolean = false;
  VoidOrRejectHeader: string = "";
  showVoidOrRejectPopup: boolean = false;
  showValidationPopup: boolean = false;
  ValidationMessage: string = "";
  constructor(private formbuilderObj: FormBuilder,
    private sharedServiceObj: SharedService,
    private projectContractMasterServiceObj: ProjectContractMasterService,
    private sessionService: SessionStorageService,
    private taxService: TaxService,
    private reqDateFormatPipe: RequestDateFormatPipe,
    public activatedRoute: ActivatedRoute,
    private workFlowService: WorkFlowApiService,
    private projectContractVariationAPIService: ProjectContractVariationApiService,
    private supplierApiServiceObj: SupplierApiService,
    private accountCodeAPIService: AccountCodeAPIService,
    private projectPOCreationObj: POCreationService,
    private confirmationServiceObj: ConfirmationService,
    public route: ActivatedRoute,
    // private location: Location,
    private genericService: GenericService,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer,
    private utilService: UtilService) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.projectPurchaseOrderForm = this.formbuilderObj.group({
      ProjectMasterContractId: [0],
      POPMasterCode: [""],
      ProjectName: [""],
      ContractStartDate: [new Date()],
      ContractEndDate: [new Date()],
      ContractTerms: [""],
      OriginalContractSum: [0],
      TotalVOSum: [0],
      AdjustedContractSum: [0],
      IsRetentionApplicable: [false],
      RetentionPercentage: [0],
      RetentionMaxLimit: [0],
      TaxAuthorityId: [0],
      TaxId: [0],
      TaxGroupId: [0],
      Remarks: [""],
      LocationId: [0],
      WorkFlowStatusId: [0],
      Departments: [[]],
      Supplier: [null],
      SupplierSubCodeId: [null],
      ServiceType: [null],
      RetentionSupplierCode: [""],
      ExpensesTypeId: [0],
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
      VODescription: ['', [Validators.required]]
      // TaxRate:[0, [Validators.required]]
    });
    // // this.poFilterInfoForm = this.formbuilderObj.group({
    // //   DocumentCode: [''],
    // //   WorkFlowStatusId: [0],
    // //   FromDate: [],
    // //   ToDate: [],
    // //   Supplier: [null]
    // // });
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
    this.projectMasterContractItemColumns = [
      { field: 'Sno', header: 'S.no.', width: "5%" },
      { field: 'ItemDescription', header: 'Description', width: "13%" },
      // { field: 'AccountCodeCategoryId', header: 'Expense Category', width: "12%" },
      // { field: 'AccountCode', header: 'Account Code', width: "10%" },
      // { field: 'ContractValue', header: 'Contract Value', width: "10%" },
      // { field: 'POPCostCategoryId', header: 'Type Of Cost', width: "10%" },
      { field: 'POPApportionmentId', header: 'Apportionment Method', width: "10%" },
      { field: 'ContractValue', header: 'Original Contract Value', width: "10%" },
      { field: 'PreviousVOSum', header: 'Cumulative VO Sum', width: "10%" },
      { field: 'VOSum', header: 'VO sum', width: "10%" },
      { field: 'RevisedContractValue', header: 'Revised Contract Value', width: "10%" }
    ];
    this.POPCostCategoryColumns = [
      { field: 'Sno', header: 'S.no.', width: "5%", },
      { field: 'TypeOfCost', header: 'Type Of Cost', width: "7%" },
      { field: 'CostDescription', header: 'Type Of Cost Description', width: "18%" },
      { field: 'GL_Cost', header: 'GL-COST', width: "10%" },
      { field: 'GL_Cost_Description', header: 'GL-COST Description', width: "10%" },
      { field: 'GST_Group', header: 'GST Group', width: "10%" },
      { field: 'GST_Class', header: 'GST Class', width: "10%" },
      { field: 'GL_Retention', header: 'GL-Retention', width: "10%" },
      { field: 'GL_Retention_Description', header: 'GL-Retention Description', width: "10%" },
      { field: 'GL_GroupRetention', header: 'Gst Group (retention)', width: "10%" },
      { field: 'GL_ClassRetention', header: 'GL Class (retention)', width: "10%" },
      { field: 'Prefix', header: 'suffix for Invoice No', width: "10%" }
    ];
    this.POPApportionmentColumns = [
      { field: 'Sno', header: 'S.no.', width: "10%", },
      { field: 'Method', header: 'Method', width: "10%" },
      { field: 'Total', header: 'Total', width: "10%" },
      { field: 'Remarks', header: 'Remarks', width: "10%" }
    ];
    this.POPDistributionSummaryColumns = [{ field: 'Sno', header: 'S.no.', width: "5%", },
    { field: 'DepartmentId', header: 'Department', width: "20%" },
    { field: 'DistributionPercentage', header: 'Distribution%', width: "25%" },
    { field: 'ContractAmount', header: 'Retention%', width: "25%" },
    { field: 'RetentionCode', header: 'Retention Code', width: "25%" }
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
    // this.sharedServiceObj.getExpenseTypes().subscribe((data: Array<ExpensesType>) => {
    //   this.expenseTypes = data;
    // });

    // this.sharedServiceObj.getBillingFrequencies().subscribe((data: Array<BillingFrequency>) => {
    //   this.frequencyTypes = data;
    // });
    debugger
    this.route.queryParams.subscribe((params) => {
      if (params['cid'] != null && params['cid'] != undefined) {
        this.companyId = isNaN(Number(params['cid'])) ? this.companyId : Number(params['cid']);
      }
      this.getRoles();
    });
    this.sharedServiceObj.IsCompanyChanged$.subscribe((data) => {
      if (data) {
        this.sharedServiceObj.updateCompany(false);
      }
    });
    this.sharedServiceObj.CompanyId$.subscribe((data) => {
      let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
      if (Number(companyId) != 0) {
        this.companyId = companyId;
        this.getRoles();
      }
      else
        this.companyId = data;
    });

    this.route.paramMap.subscribe((param: ParamMap) => {
      this.projectMasterContractId = Number(param.get('popid'));
      this.voId = Number(param.get('id'));
      this.pageType = param.get('type');
      if (param.get('cid') != null && param.get('cid') != undefined) {
        this.companyId = Number(param.get('cid'));
      }
      this.moduleHeading = this.pageType == "request" ? "Variation Order" : "Variation Order Approval";
      this.isApprovalPage = this.pageType == "approval" ? true : false;
      this.sessionService.setCompanyId(this.companyId);
      this.getRoles();
    });

    //this.getProjectContractVariationOrderList(0);

    this.sharedServiceObj.CompanyId$.subscribe((data) => {
      if (this.companyId != data) {
        this.companyId = data;
      }
    });

    //this.getProjectPOList(0);



    this.onRecordSelection(this.projectMasterContractId);
    //this.getAccountTypes(this.companyId);
    //this.getAccountTypes();
    //this.getBillingTypes();
    //this.getCostCentres();
    //this.getCostTypes();
    this.getDepartments(this.companyId);
    //this.getExpenses();
    //this.getServiceTypes();
    //this.getTaxGroups();
    this.getWorkFlowStatus();
    //this.getAccountCodeCategories(this.companyId);
    this.getDepartmentsbyWorkFlow(this.companyId);


  }

  getRoles() {
    let userDetails = <UserDetails>this.sessionService.getUser();
    if (this.companyId > 0) {
      this.sharedServiceObj.getUserRolesByCompany(userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
        this.userRoles = roles;
        userDetails.Roles = this.userRoles;
        this.sessionService.setUser(userDetails);
        let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
        if (roleIds != '') {
          this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
            this.rolesAccessList = data;
            this.sessionService.setRolesAccess(this.rolesAccessList);
            let roleAccessLevels = this.sessionService.getRolesAccess();
            if (roleAccessLevels != false) {
              if (roleAccessLevels != null && roleAccessLevels.length > 0) {
                if (this.isApprovalPage) {
                  let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectvariationorderapproval")[0];
                  this.verifyPermission = formRole.IsVerify;
                  this.approvePermission = formRole.IsApprove;
                  this.voidPermission = false;
                  this.sendForApprovalPermission = false;
                }
                else {
                  let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectvariationorder")[0];
                  this.voidPermission = formRole.IsVoid;
                  this.sendForApprovalPermission = formRole.IsApprove;
                  this.verifyPermission = false;
                  this.approvePermission = false;
                  this.editPermission = formRole.IsEdit;
                }
              }
            }
          });
        }
      });
    }
  }

  // // navigateToPage() {
  // //   this.requestType = this.activatedRoute.snapshot.params.type;
  // //   let poCode = this.activatedRoute.snapshot.queryParamMap.get('code');
  // //   let projectMasterContractId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));

  // //   let poFilterData: ProjectContractMasterFilterModel = {
  // //     DocumentCode: poCode,
  // //   };
  // //   if (this.activatedRoute.snapshot.params.type == "request") {//if it is "asset disposal request"
  // //     this.moduleHeading = "Project Contract Master";
  // //     this.isApprovalPage = false;
  // //     let roleAccessLevels = this.sessionService.getRolesAccess();
  // //     // if (this.isApprovalPage==false) {
  // //     if (roleAccessLevels != null && roleAccessLevels.length > 0) {
  // //       let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectcontractmaster")[0];
  // //       let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
  // //       if (auditLogRole != null)
  // //         this.viewLogPermission = auditLogRole.IsView;
  // //       this.newPermission = formRole.IsAdd;
  // //       this.editPermission = formRole.IsEdit;
  // //       // this.emailPermission = formRole.IsEmail;
  // //       this.printPermission = formRole.IsPrint;
  // //       this.approvePermission = formRole.IsApprove;
  // //       this.exportPermission = formRole.IsExport;
  // //       this.voidPermission = formRole.IsVoid;
  // //     }
  // //     else {
  // //       this.newPermission = true;
  // //       this.editPermission = true;
  // //       // this.emailPermission = true;
  // //       this.printPermission = true;
  // //       this.approvePermission = true;
  // //       this.exportPermission = true;
  // //       this.voidPermission = true;
  // //     }
  // //     // }
  // //     if (projectMasterContractId > 0) {
  // //       this.searchProjectMasterContract(projectMasterContractId, true, poFilterData);
  // //     }
  // //     else {
  // //       this.getProjectPOList(0);
  // //     }
  // //   }
  // //   else if (this.activatedRoute.snapshot.params.type == "approval") {//if request is for "asset disposal request approval"
  // //     this.moduleHeading = "Project Contract Master Approval";
  // //     this.isApprovalPage = true;

  // //     let roleAccessLevels = this.sessionService.getRolesAccess();

  // //     if (roleAccessLevels != null && roleAccessLevels.length > 0) {
  // //       let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectcontractmasterapproval")[0];
  // //       let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
  // //       if (auditLogRole != null)
  // //         this.viewLogPermission = auditLogRole.IsView;
  // //       this.approvePermission = formRole.IsApprove;
  // //       this.verifyPermission = formRole.IsVerify;
  // //       this.printPermission = formRole.IsPrint;
  // //     }
  // //     else {
  // //       this.viewLogPermission == false;
  // //       this.approvePermission = false;
  // //       this.verifyPermission = false;
  // //       this.printPermission = false;


  // //     }

  // //     this.hideVerifyButton = true;
  // //     this.hideText = true;
  // //     this.hideInput = false;

  // //     if (projectMasterContractId > 0) {

  // //       this.searchProjectMasterContract(projectMasterContractId, true, poFilterData);
  // //     }
  // //     else {

  // //       this.getProjectMasterContractsForApproval(0);
  // //     }
  // //   }

  // // }

  getAccountCodeCategories(companyId: number): void {
    if (!isNaN(Number(companyId)) && companyId > 0) {
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
  }

  onCategoryChange(categoryId: number, rowIndex: number) {
    let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
    this.accountCategoryId = itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').value;

    let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('ProjectMasterContractItemId').value;


    // if (itemGroupControl.controls[rowIndex] != undefined) {
    //   itemGroupControl.controls[rowIndex].reset();
    // }

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


  // // getBillingTypes() {
  // //   this.sharedServiceObj.getBillingTypes().subscribe((data: Array<BillingType>) => {
  // //     this.billingTypes = data;
  // //   });
  // // }

  // // onRetentionChange() {
  // //   this.isRetentionApplicable = this.projectPurchaseOrderForm.get('IsRetentionApplicable').value;
  // //   this.projectPurchaseOrderForm.get('RetentionPercentage').setValue(0);
  // //   this.projectPurchaseOrderForm.get('RetentionTypeId').setValue(0);
  // //   if (this.isRetentionApplicable) {
  // //     this.showRetentionPer = true;
  // //     this.showRetentionMaxLimit = true;
  // //     this.showRetentionType = true;
  // //     this.projectPurchaseOrderForm.get('RetentionPercentage').setValidators([Validators.required, Validators.max(100)]);

  // //   }
  // //   else {
  // //     this.showRetentionPer = false;
  // //     this.showRetentionMaxLimit = false;
  // //     this.showRetentionType = false;
  // //     this.projectPurchaseOrderForm.get('RetentionPercentage').clearValidators();
  // //     this.projectPurchaseOrderForm.get('RetentionMaxLimit').clearValidators();
  // //     this.projectPurchaseOrderForm.get('RetentionMaxLimit').setValue(0);
  // //     this.projectPurchaseOrderForm.get('RetentionPercentage').setValue(0);
  // //   }
  // //   this.projectPurchaseOrderForm.get('RetentionPercentage').updateValueAndValidity();
  // //   this.projectPurchaseOrderForm.get('RetentionPercentage').markAsTouched();
  // // }
  // // newRecord() {
  // //   this.hideText = false;
  // //   this.hideInput = true;
  // //   this.linesToAdd = 2;
  // //   this.linesToAdd1 = 1;
  // //   // // this.linesToAddCostCategory = 2;
  // //   // // this.linesToAddApportionment = 2;
  // //   // // this.linesToAddDistribution = 2;
  // //   // // this.isRetentionApplicable = false;
  // //   this.selectedPODetails = new ProjectMasterContract();
  // //   this.selectedPODetails.TotalVOSum = 0;
  // //   this.clearForm();
  // //   //this.addGridItem(this.linesToAdd);
  // //   this.addGridItem(this.linesToAdd, "ProjectMasterContractItems");
  // //   // this.addGridItem(this.linesToAdd1, "POPCostCategory");
  // //   // this.addGridItem(this.linesToAdd1, "POPApportionment");
  // //   // this.addGridItem(this.linesToAdd1, "POPDistributionSummaryItems");
  // //   this.addGridItem(this.linesToAdd1, "DiscountLineItems");
  // //   this.showFullScreen();
  // // }

  // // addRecord() {
  // //   this.hideText = false;
  // //   this.hideInput = true;
  // //   this.supplierid = 0;
  // //   this.verifyPermission = false;
  // //   // // this.showRetentionMaxLimit = false;
  // //   // // this.showRetentionType = false;
  // //   // // this.showRetentionPer = false;
  // //   // // this.hasCostData = false;
  // //   // // this.hasApportimentData = false;
  // //   // // this.hasDistributionData = false;
  // //   this.projectPurchaseOrderForm.patchValue({
  // //     SupplierTypeID: "1",
  // //     IsGstRequired: false
  // //   });
  // //   setTimeout(() => {
  // //     this.newRecord();
  // //   }, 500);
  // //   //setting this variable to false so as to show the purchase order details in edit mode
  // //   this.totalVOSumSubTotal = 0;
  // //   this.rcvSubTotal = 0;
  // //   this.rcvTotalBefTax = 0;
  // //   this.rcvTax = 0;
  // //   this.rcvTotal = 0;
  // // }


  //adding row to the grid..
  addGridItem(noOfLines: number, gridFAName: string, isEdit: boolean = false) {
    let itemGroupControl = new FormArray([]);
    itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls[gridFAName];
    for (let i = 0; i < noOfLines; i++) {
      if (gridFAName == "ProjectMasterContractItems") {
        itemGroupControl.push(this.initGridRows());
      }
      else if (gridFAName == "DiscountLineItems") {
        itemGroupControl.push(this.initGridRows4());
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
    let itemGroupControl3 = <FormArray>this.projectPurchaseOrderForm.controls['POPApportionment'];
    itemGroupControl3.controls = [];
    itemGroupControl3.controls.length = 0;
    let itemGroupControl4 = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
    itemGroupControl4.controls = [];
    itemGroupControl4.controls.length = 0;
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
    this.IsViewMode = false;
    // this.supplierid = 0;
    // this.linesToAdd = 2;
    // // this.linesToAddCostCategory = 2;
    // // this.linesToAddApportionment = 2;
    // // this.linesToAddDistribution = 2;
    //resetting the item category form.
    //this.clearForm();
    //this.addGridItem(this.selectedPODetails.ProjectMasterContractItems.length, "ProjectMasterContractItems");
    //this.addGridItem(this.selectedPODetails.DiscountLineItems.length, "DiscountLineItems");
    //this.addGridItem(this.selectedPODetails.POPCostCategory.length, "POPCostCategory", true);
    //this.addGridItem(this.selectedPODetails.POPApportionment.length, "POPApportionment");
    //this.addGridItem(this.selectedPODetails.POPDistributionSummaryItems.length, "POPDistributionSummaryItems");

    // this.projectPurchaseOrderForm.patchValue(this.selectedPODetails);
    // this.getTaxesByTaxAuthority(this.selectedPODetails.TaxAuthorityId);
    // //this.getTaxTypes();
    // let popGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
    // for (let i = 0; i < popGroupControl.length; i++) {
    //   let taxgroupId = popGroupControl.controls[i].get('GST_Group').value;
    //   this.getTaxesByTaxGroup(popGroupControl.controls[i].get('GST_Group').value, i, true);
    //   this.getTaxesByTaxGroup(popGroupControl.controls[i].get('GL_GroupRetention').value, i, false);

    // }
    // this.projectPurchaseOrderForm.get('LocationId').setValue(this.selectedPODetails.LocationId);
    // this.projectPurchaseOrderForm.get('TaxId').setValue(this.selectedPODetails.TaxId);

    // // this.projectPurchaseOrderForm.get('ContractStartDate').setValue(new Date(this.selectedPODetails.ContractStartDate));
    // // this.projectPurchaseOrderForm.get('ContractEndDate').setValue(new Date(this.selectedPODetails.ContractEndDate));
    //this.supplierChange(null, true);
    //this.calculateTotalPrice(0, 0);


    // if (this.selectedPODetails.ContractStartDate != null && this.selectedPODetails.ContractEndDate != null) {
    //   this.setContractDate(new Date(this.selectedPODetails.ContractEndDate), new Date(this.selectedPODetails.ContractStartDate));
    // }

    this.supplierid = this.selectedPODetails.Supplier.SupplierId;
    // // if (this.selectedPODetails.SupplierSubCodeId === null) {
    // //    this.isSupplierSelected = true;
    // //   this.projectPurchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
    // //   this.projectPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
    // // }

    //this.projectPurchaseOrderForm.get('AdjustedContractSum').disable();
  }

  onRejectClick(statusId: number) {
    this.showVoidOrRejectPopup = true;
    this.StatusId = statusId;
    if (statusId == WorkFlowStatus.Rejected)
      this.VoidOrRejectHeader = "Reject Reasons";
    if (statusId == WorkFlowStatus.Void)
      this.VoidOrRejectHeader = "Void Reasons";
    if (statusId == WorkFlowStatus.CancelledApproval)
      this.VoidOrRejectHeader = "Cancel Approval Reasons";
  }

  // // filterData() {
  // //   this.isFilterApplied = true;
  // //   this.filterMessage = "";
  // //   let poFilterData: ProjectContractMasterFilterModel = this.poFilterInfoForm.value;
  // //   if (this.poFilterInfoForm.get('Supplier').value != null) {
  // //     poFilterData.Supplier['SupplierName'] = this.poFilterInfoForm.get('Supplier').value.SupplierName;
  // //   }
  // //   if ((poFilterData.DocumentCode === '' || poFilterData.DocumentCode === null) && poFilterData.Supplier === null
  // //     && (poFilterData.WorkFlowStatusId == null || poFilterData.WorkFlowStatusId == 0)
  // //     && (poFilterData.FromDate == null && poFilterData.ToDate == null)) {
  // //     if (open) {
  // //       this.filterMessage = "Please select any filter criteria";
  // //     }
  // //     return;
  // //   }
  // //   else if (poFilterData.FromDate != null && poFilterData.ToDate == null) {
  // //     if (open) {
  // //       this.filterMessage = "Please select To Date";
  // //     }
  // //     return;
  // //   }
  // //   else if (poFilterData.FromDate == null && poFilterData.ToDate != null) {
  // //     if (open) {
  // //       this.filterMessage = "Please select From Date";
  // //     }
  // //     return;
  // //   }
  // //   else if ((poFilterData.FromDate != null && poFilterData.ToDate != null && poFilterData.FromDate > poFilterData.ToDate)) {
  // //     if (open) {
  // //       this.filterMessage = "From Date Should be less than To Date";
  // //     }
  // //     return;
  // //   }
  // //   this.searchProjectMasterContract(0, false, poFilterData);
  // //   if (this.projectPoList.length > 0) {
  // //     if (open) {
  // //       this.showFilterPopUp = true;
  // //     }
  // //   }
  // //   this.resetPagerConfig();
  // // }
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
    this.sharedServiceObj.getDepartmentsWorkFlow(companyId, WorkFlowProcess.ProjectContractVariationOrder).subscribe((data: Array<any>) => {
      this.departmentsWorkflow = data;
    });
  }

  getDepartments(companyId: number) {

    this.sharedServiceObj.GetUserCompanyDepartments(companyId, this.userDetails.UserID)
      .subscribe((data: any[]) => {
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
      this.retentionSubcode = data.filter(x => x.SubCodeDescription.toLowerCase() == "retention");

      //this.retentionSubcode=data.find(i=>i.SubCodeDescription=="Retention");

      // if(this.retentionSubcode.length > 0)
      // {
      //     this.retentionSupplierSubCodes=this.retentionSubcode;
      // }

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
          this.projectPurchaseOrderForm.get('TaxId').setValue(data[0].TaxId);
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
  initGridRows() {
    return this.formbuilderObj.group({
      ProjectMasterContractItemId: [0],
      ItemId: [0],
      ItemDescription: ["", [Validators.required]],
      AccountCodeId: [0],
      POPCostCategoryId: [""],
      POPApportionmentId: [""],
      ContractValue: [0],
      PreviousVOSum: [0],
      Expense: [0],
      VOSum: [0],
      RevisedContractValue: [0],
      TypeOfCostName: [""],
      ApportionmentMethod: [""],
      AccountCodeCategoryId: [0, [Validators.required]],
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
      TypeOfCostId: [0, [Validators.required]],
      TypeOfCost: ["", [Validators.required, Validators.maxLength(2)]],
      CostDescription: ["", [Validators.required]],
      GL_Cost: ["", [Validators.required]],
      GST_Group: [0, [Validators.required]],
      GST_Class: [0, [Validators.required]],
      GL_Retention: ["", [Validators.required]],
      GL_GroupRetention: [0, [Validators.required]],
      GL_ClassRetention: [0, [Validators.required]],
      Prefix: ["", [Validators.required]],
      Taxes: [],
      RetentionTaxes: [],
      RowIndex: [""],
      isControlName: false,
      GST_GroupName: [""],
      GST_ClassName: [""],
      GL_GroupRetentionName: [""],
      GL_ClassRetentionName: [""],

    });
  }
  initGridRows2() {
    let apportionmentGridControl = this.formbuilderObj.group({
      POPApportionmentId: [0],
      POPId: [0],
      Method: ["", [Validators.required]],
      ApportionmentDetails: this.formbuilderObj.array([]),
      Total: [0],
      Remarks: ["", [Validators.required]]


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
      // AccountCodeId: [0],
      // POPCostCategoryId: [0],
      ApportionmentMethod: [0],
      DiscountValue: [0],
      // Expense: [],
      PreviousVOSum: [0],
      VOSum: [0],
      RevisedContractValue: [0],
      // DisTypeOfCostName: [""],
      DisApportionmentMethod: [""]
      // AccountCodeCategoryId: [0]
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
  }

  monthDiff(endDate: Date, startDate: Date) {
    if (endDate != null && startDate != null) {
      let months;
      months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
      months += (endDate.getMonth() - startDate.getMonth());
      return months <= 0 ? 0 : months;
    }
  }
  ClearGrids() {
    (<FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems']).controls = [];
    (<FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems']).controls = [];
  }
  onRecordSelection(projectMasterContractId: number) {

    this.hideVerifyButton = true;
    this.doApproveReject = true;
    this.hideCancelinVerify = false;
    this.selectedProjectContractMasterId = projectMasterContractId;
    this.showGridErrorMessage1 = false;
    this.showGridErrorMessage2 = false;
    this.showGridErrorMessage3 = false;
    this.IsViewMode = this.voId == 0 ? false : true;
    this.projectContractVariationAPIService.getVODetailsbyId(projectMasterContractId, this.voId).subscribe((data: ProjectMasterContract) => {
      this.selectedPODetails = data;
      this.selectedPODetails.Supplier.SupplierCode = this.utilService.getSupplierCode(data.Supplier.SupplierCode, data.SupplierSubCode.SubCode);
      this.isSameUSer = ((data.CreatedBy == this.userDetails.UserID) || this.voId == 0) ? true : false;
      this.isApproverUser = (data.CurrentApproverUserId == this.userDetails.UserID) ? true : false;
      if (this.selectedPODetails.ContractStartDate != null && this.selectedPODetails.ContractEndDate != null) {
        this.setContractDate(new Date(this.selectedPODetails.ContractEndDate), new Date(this.selectedPODetails.ContractStartDate));
      }
      this.ClearGrids();
      let itemGroupControl1 = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
      itemGroupControl1.controls = [];
      this.addGridItem(this.selectedPODetails.ProjectMasterContractItems.length, "ProjectMasterContractItems");
      this.addGridItem(this.selectedPODetails.DiscountLineItems.length, "DiscountLineItems");
      this.projectPurchaseOrderForm.get('ProjectMasterContractItems').patchValue(this.selectedPODetails.ProjectMasterContractItems);
      this.projectPurchaseOrderForm.get('DiscountLineItems').patchValue(this.selectedPODetails.DiscountLineItems);
      this.projectPurchaseOrderForm.get('VODescription').setValue(data.VODescription);
      this.typeofCostCategaries = this.selectedPODetails.POPCostCategory.map(value => value.TypeOfCost);
      this.typeofApportionmentMethods = this.selectedPODetails.POPApportionment.map(value => value.Method);
      this.hideText = true;
      this.hideInput = false;
      this.calculateRevisedSum();
      this.projectPurchaseOrderForm.get('SupplierAddress').setValue(data.SupplierAddress); 
    });
  }
  calculateRevisedSum() {
    this.totalVOSumSubTotal = 0;
    this.totalVOSumDiscountSubTotal = 0;
    this.rcvSubTotal = 0;
    this.rcvTotalBefTax = 0;
    this.rcvTax = 0;
    this.rcvTotal = 0;
    this.cvsTax = 0;
    this.cvsTotal = 0;
    this.vsTax = 0;
    this.vsTotal = 0;
    this.VSTotalBeforeTax = 0;
    let discountSum: number = 0;
    let revisedContractVal: number = 0;
    let revisedContractSum: number = 0;
    this.cumVOSumSubTotal = 0;
    this.cumVoSumTotalBeforeTax = 0;
    let disPreviousVOSum: number = 0;
    (<FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems']).controls.forEach(lineitem => {
      revisedContractVal = 0;
      this.cumVOSumSubTotal = this.cumVOSumSubTotal + Number(lineitem.get('PreviousVOSum').value);
      this.totalVOSumSubTotal += Number(lineitem.get('VOSum').value);
      revisedContractVal = Number(lineitem.get('ContractValue').value) + Number(lineitem.get('PreviousVOSum').value) + Number(lineitem.get('VOSum').value);
      if (revisedContractVal < 0) {
        lineitem.get('VOSum').setValue(0);
        this.showValidationPopup = true;
        this.ValidationMessage = "Provide valid VO Amount. VO Sum should not be greater than Revised contract value.";
        return;
      }
      lineitem.get('RevisedContractValue').setValue(revisedContractVal);
      this.rcvSubTotal += revisedContractVal;
    });
    (<FormArray>this.projectPurchaseOrderForm.controls['DiscountLineItems']).controls.forEach(disLineItem => {
      revisedContractVal = 0;
      disPreviousVOSum = disPreviousVOSum + Number(disLineItem.get('PreviousVOSum').value);
      this.totalVOSumDiscountSubTotal += Number(disLineItem.get('VOSum').value);
      discountSum += Number(disLineItem.get('DiscountValue').value);
      revisedContractVal = Number(disLineItem.get('DiscountValue').value) - Number(disLineItem.get('PreviousVOSum').value) - Number(disLineItem.get('VOSum').value);
      disLineItem.get('VOSum').setErrors(null);
      if (revisedContractVal > 0) {
        disLineItem.get('VOSum').setErrors({ "discountcrossed": true });
        disLineItem.get('VOSum').markAsTouched();
      }
      disLineItem.get('RevisedContractValue').setValue(revisedContractVal);
      revisedContractSum += revisedContractVal;
    });
    this.cumVoSumTotalBeforeTax = this.cumVOSumSubTotal - disPreviousVOSum;
    // this.rcvTotalBefTax = this.rcvSubTotal + discountSum - this.totalVOSumDiscountSubTotal;
    this.VSTotalBeforeTax = this.totalVOSumSubTotal - this.totalVOSumDiscountSubTotal;
    this.rcvTotalBefTax = this.rcvSubTotal + revisedContractSum;
    this.rcvTax = (this.rcvTotalBefTax * this.selectedPODetails.TaxAmount) / 100;
    this.rcvTotal = this.rcvTotalBefTax + this.rcvTax;
    this.cvsTax = (this.cumVoSumTotalBeforeTax * this.selectedPODetails.TaxAmount) / 100;
    this.cvsTotal = this.cumVoSumTotalBeforeTax + this.cvsTax;
    this.vsTax = (this.VSTotalBeforeTax * this.selectedPODetails.TaxAmount) / 100;
    this.vsTotal = this.VSTotalBeforeTax + this.vsTax;
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

  removeGridItem(rowIndex: number, gridFAName: string) {
    let itemGroupControl = new FormArray([]);
    itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls[gridFAName];
    itemGroupControl.removeAt(rowIndex);
    if (itemGroupControl.controls.length == 0 && gridFAName != 'DiscountLineItems')
      this.addGridItem(1, gridFAName);
    this.calculateTotalPrice(null, null);
    this.calculateRevisedSum();
  }

  reject(remarks: string) {

    this.updateStatus(WorkFlowStatus.Rejected, remarks);
  }
  restrictMinusValue(e: any) {
    restrictMinus(e);
  }

  cancelRecord() {
    this.route.queryParams.subscribe((params) => {
      if (params['from'] == 'cm') {
        this.router.navigate(['po/projectcontractmaster/' + this.pageType]);
      }
      else {
        this.router.navigate(['po/projectvariationorderlist/' + this.pageType]);
      }
    });
    // this.location.back();
  }
  onVerify() {
    this.editRecord();
    this.doUpdate = true;
  }

  onContractSumChange(value: any) {
    let lineSum = this.getSubTotal();
    let adjsum = this.getSumValue();
    let retentionMaxLimit = this.getRetentionMaxValue();
    let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
    let distributionControl = <FormArray>this.projectPurchaseOrderForm.controls['POPDistributionSummaryItems'];
    // if (lineSum != value) {
    //   for (let i = 0; i < itemGroupControl.length; i++) {
    //     itemGroupControl.controls[i].get('ContractValue').setErrors({ 'totalError': true });
    //   }
    // }
    // else {
    //   for (let i = 0; i < itemGroupControl.length; i++) {
    //     itemGroupControl.controls[i].get('ContractValue').setErrors({ 'totalError': false });
    //     itemGroupControl.controls[i].get('ContractValue').setErrors(null);
    //   }
    // }

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
  // validateRetentionPercentage(value: number) {
  //   this.InvalidRententionPercentage = (value < 0 || value > 100) ? true : false;
  // }
  getSumValue() {
    let contractSum = this.projectPurchaseOrderForm.get('OriginalContractSum').value;
    let voSum = this.projectPurchaseOrderForm.get('TotalVOSum').value;
    let adjustSum = contractSum + voSum;
    this.projectPurchaseOrderForm.get('AdjustedContractSum').setValue(adjustSum);

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

  calculateTotalPrice(rowIndex: number, gridRow: any) {
    let subTotal = this.getSubTotal();
    let disSubTotal = this.getDisSubTotal();
    let totalBefTax = subTotal - disSubTotal;
    this.projectPurchaseOrderForm.get('SubTotal').setValue(subTotal);
    this.projectPurchaseOrderForm.get('TotalBefTax').setValue(totalBefTax);
    let totalTax = this.getTotalTax(this.projectPurchaseOrderForm.get('TaxId').value);
    let totalAmount = totalTax + totalBefTax;
    this.projectPurchaseOrderForm.get('TotalAmount').setValue(totalAmount);
    //let lineContractValue = gridRow.get('ContractValue');
    let itemGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['ProjectMasterContractItems'];
    let contractSum = this.projectPurchaseOrderForm.get('OriginalContractSum').value;
    // for (let i = 0; i < itemGroupControl.length; i++) {
    //   if (itemGroupControl.controls[i].get('ContractValue').value == 0) {
    //     itemGroupControl.controls[i].get('ContractValue').setErrors({ 'griderror': true });
    //   }
    // }

    // if (subTotal != this.projectPurchaseOrderForm.get('OriginalContractSum').value) {
    //   if (rowIndex != null) {
    //     itemGroupControl.controls[rowIndex].get('ContractValue').setErrors({ 'totalError': true });
    //   }
    // }
    // else {
    //   for (let i = 0; i < itemGroupControl.length; i++) {
    //     itemGroupControl.controls[i].get('ContractValue').setErrors({ 'totalError': false });
    //     itemGroupControl.controls[i].get('ContractValue').setErrors(null);
    //   }
    // }
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
  split() {
    this.leftSection = !this.leftSection;
    this.rightsection = !this.rightsection;
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
          GL_Cost: accountCode.Code

        });
      }
      if (isGLCost == "GLRetention") {
        popCostCatControl.controls[rowindex].patchValue({
          GL_Retention: accountCode.Code

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

  // // PocVerify() {
  // //   ;
  // //   this.hideText = false;
  // //   this.hideInput = true;
  // //   // this.hidePOType
  // //   this.hideCancelinVerify = true;
  // //   this.hideVerifyButton = false;
  // //   this.supplierid = 0;
  // //   this.linesToAdd1 = 1;

  // //   //resetting the item category form.
  // //   this.clearForm();
  // //   if (this.selectedPODetails.POPCostCategory.length > 0 || this.selectedPODetails.POPCostCategory.length == null) {
  // //     this.addGridItem(this.selectedPODetails.POPCostCategory.length, "POPCostCategory");
  // //     this.addGridItem(this.selectedPODetails.POPApportionment.length, "POPApportionment");
  // //     this.addGridItem(this.selectedPODetails.POPDistributionSummaryItems.length, "POPDistributionSummaryItems");
  // //   }
  // //   else {
  // //     this.addGridItem(this.linesToAdd1, "POPCostCategory");
  // //     this.addGridItem(this.linesToAdd1, "POPApportionment");
  // //     this.addGridItem(this.linesToAdd1, "POPDistributionSummaryItems");

  // //   }

  // //   this.addGridItem(this.selectedPODetails.ProjectMasterContractItems.length, "ProjectMasterContractItems");
  // //   this.addGridItem(this.selectedPODetails.DiscountLineItems.length, "DiscountLineItems");
  // //   // this.addGridItem(this.selectedPODetails.POPCostCategory.length, "POPCostCategory", true);
  // //   // this.addGridItem(this.selectedPODetails.POPApportionment.length, "POPApportionment");
  // //   // this.addGridItem(this.selectedPODetails.POPDistributionSummaryItems.length, "POPDistributionSummaryItems");

  // //   this.projectPurchaseOrderForm.patchValue(this.selectedPODetails);
  // //   this.getTaxesByTaxAuthority(this.selectedPODetails.TaxAuthorityId);
  // //   //this.getTaxTypes();
  // //   let popGroupControl = <FormArray>this.projectPurchaseOrderForm.controls['POPCostCategory'];
  // //   for (let i = 0; i < popGroupControl.length; i++) {
  // //     let taxgroupId = popGroupControl.controls[i].get('GST_Group').value;
  // //     this.getTaxesByTaxGroup(popGroupControl.controls[i].get('GST_Group').value, i, true);
  // //     this.getTaxesByTaxGroup(popGroupControl.controls[i].get('GL_GroupRetention').value, i, false);

  // //   }


  // //   this.projectPurchaseOrderForm.get('LocationId').setValue(this.selectedPODetails.LocationId);
  // //   this.projectPurchaseOrderForm.get('TaxId').setValue(this.selectedPODetails.TaxId);

  // //   this.projectPurchaseOrderForm.get('ContractStartDate').setValue(new Date(this.selectedPODetails.ContractStartDate));
  // //   this.projectPurchaseOrderForm.get('ContractEndDate').setValue(new Date(this.selectedPODetails.ContractEndDate));
  // //   this.supplierChange(null, true);
  // //   this.calculateTotalPrice(0, 0);

  // //   // this.showFullScreen();
  // //   // if (this.selectedPODetails.ContractStartDate != null && this.selectedPODetails.ContractEndDate != null) {
  // //   //   this.setContractDate(new Date(this.selectedPODetails.ContractEndDate), new Date(this.selectedPODetails.ContractStartDate));
  // //   // }

  // //   this.supplierid = this.selectedPODetails.Supplier.SupplierId;
  // //   if (this.selectedPODetails.SupplierSubCodeId === null) {
  // //     // this.isSupplierSelected = true;
  // //     this.projectPurchaseOrderForm.get('SupplierSubCodeId').setValidators([Validators.required]);
  // //     this.projectPurchaseOrderForm.get('SupplierSubCodeId').updateValueAndValidity();
  // //   }
  // //   this.doApproveReject = false;

  // // }

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
  prepareVariationOrderObject(action: string): ProjectMasterContract {
    let projectVariationOrderDetails: ProjectMasterContract = this.projectPurchaseOrderForm.value;
    projectVariationOrderDetails.Action = action;
    projectVariationOrderDetails.CompanyId = this.companyId;
    projectVariationOrderDetails.ProjectMasterContractId = this.selectedPODetails.ProjectMasterContractId;
    projectVariationOrderDetails.TotalVOSum = this.VSTotalBeforeTax;
    projectVariationOrderDetails.CMTotalVOSum = this.selectedPODetails.TotalVOSum;
    projectVariationOrderDetails.CMAdjustedContractSum = this.selectedPODetails.AdjustedContractSum;
    projectVariationOrderDetails.CMRetentionMaxLimit = this.selectedPODetails.RetentionMaxLimit;
    projectVariationOrderDetails.SubTotalRevisedContractValue = this.rcvTotalBefTax;
    projectVariationOrderDetails.CreatedBy = this.userDetails.UserID;
    projectVariationOrderDetails.UpdatedBy = this.userDetails.UserID;
    projectVariationOrderDetails.IsVerifier = this.verifyPermission;
    projectVariationOrderDetails.WorkFlowStatusId = (action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval);
    projectVariationOrderDetails.CompanyId = this.sessionService.getCompanyId();
    projectVariationOrderDetails.LocationId = this.selectedPODetails.LocationId;
    if (this.selectedPODetails.Attachments != null && this.selectedPODetails.Attachments.length > 0) {
      projectVariationOrderDetails.Attachments = this.selectedPODetails.Attachments.filter(i => i.IsDelete == true);
    }
    if (this.voId > 0) {
      projectVariationOrderDetails.VOId = this.voId;
    }
    projectVariationOrderDetails.ProjectMasterContractItems.forEach(i => {
      i.Expense = new AccountCode();
    });
    // projectVariationOrderDetails.ProjectContractVariationOrderItems= this.selectedPODetails.ProjectMasterContractItems;
    return projectVariationOrderDetails;
  }
  onVoidOrRejectClick(control, statusId) {
    if (control.value != null && control.value != '') {
      if (statusId == WorkFlowStatus.CancelledApproval) {
        this.recallPoApproval(control.value);
      }
      else {
        this.confirmationServiceObj.confirm({
          message: Messages.ProceedDelete,
          header: Messages.DeletePopupHeader,
          accept: () => {
            this.updateStatus(WorkFlowStatus.Rejected, control.value);
            this.closeValidationPopUp();
            this.cancelRecord();
          },
          reject: () => {
          }
        });
      }
    }
  }
  closeValidationPopUp() {
    this.showVoidOrRejectPopup = false;
    this.showValidationPopup = false;
  }
  validateVOGrid(action: string) {
    let voDesc = this.projectPurchaseOrderForm.get('VODescription');
    voDesc.setErrors(null);
    if (action == 'send' || action == 'approve') {
      if (voDesc.value == '' || voDesc.value == null) {
        voDesc.setErrors({ 'required': true });
        voDesc.markAsTouched();
      }
    }
    (<FormArray>this.projectPurchaseOrderForm.get('ProjectMasterContractItems')).controls.forEach((x) => {
      this.setValidations(x, 'ProjectMasterContractItems', action);
    });
    (<FormArray>this.projectPurchaseOrderForm.get('DiscountLineItems')).controls.forEach((x) => {
      this.setValidations(x, 'DiscountLineItems', action);
    });
  }
  setValidations(x: any, type: string, action: string) {
    let apportionmentControl: string = type == 'ProjectMasterContractItems' ? 'ApportionmentMethod' : 'DisApportionmentMethod';
    let valControl: string = type == 'ProjectMasterContractItems' ? 'ContractValue' : 'DiscountValue';
    let desControl: string = type == 'ProjectMasterContractItems' ? 'ItemDescription' : 'DisItemDescription';
    if (action == 'approve' && x.get(apportionmentControl).value == '' || x.get(apportionmentControl).value == null) {
      x.get(apportionmentControl).setErrors({ 'required': true });
      x.get(apportionmentControl).markAsTouched();
    }
    else {
      x.get(apportionmentControl).setErrors(null);
    }
    if ((x.get(desControl).value == '' || x.get(desControl).value == null) && (x.get('ProjectMasterContractItemId').value == null || x.get('ProjectMasterContractItemId').value == '')) {
      x.get(desControl).setErrors({ 'required': true });
      x.get(desControl).markAsTouched();
    }
    else {
      x.get(desControl).setErrors(null);
    }
    // if (x.get('VOSum').value == 0 && x.get('PreviousVOSum').value == 0 && x.get(valControl).value == 0) {
    //   x.get('VOSum').setErrors({ 'required': true });
    //   x.get('VOSum').markAsTouched();
    // }
    // else {
    // x.get('VOSum').setErrors(null);
    // }
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
  ValidateVOAmount(): boolean {
    let hasVOValue: boolean = false;
    let hasNewItem: boolean = false;//free of cost item
    (<FormArray>this.projectPurchaseOrderForm.get('ProjectMasterContractItems')).controls.forEach((x) => {
      hasNewItem = x.get('ProjectMasterContractItemId').value == 0 ? true : false;
      hasVOValue = (!hasVOValue) ? hasNewItem : hasVOValue;
      if (x.get('VOSum').value != 0 && !hasVOValue) {
        hasVOValue = true;
      }
    });
    (<FormArray>this.projectPurchaseOrderForm.get('DiscountLineItems')).controls.forEach((x) => {
      hasNewItem = x.get('ProjectMasterContractItemId').value == 0 ? true : false;
      hasVOValue = (!hasVOValue) ? hasNewItem : hasVOValue;
      if (x.get('VOSum').value != 0 && !hasVOValue) {
        hasVOValue = true;
      }
    });
    return hasVOValue;
  }
  saveRecord(action: string) {
    this.validateVOGrid(action);
    if (this.projectPurchaseOrderForm.valid) {
      if (this.ValidateVOAmount()) {
        let variationOrderObj: ProjectMasterContract = this.prepareVariationOrderObject(action);
        if ((action == 'send') ? this.validateAttachments() : true) {
          this.projectContractVariationAPIService.createProjectContractVariationOrder(variationOrderObj, this.uploadedFiles).subscribe((voId: number) => {
            if (voId > 0) {
              this.uploadedFiles = [];
              this.voId = voId;
              this.IsViewMode = true;
              if (action == 'send') {   //|| action == 'approve'|| action == 'verify'
                let workFlowDetails: WorkFlowParameter = {
                  ProcessId: WorkFlowProcess.ProjectContractVariationOrder,
                  CompanyId: this.selectedPODetails.CompanyId,
                  LocationId: this.selectedPODetails.LocationId,
                  FieldName: "",
                  Value: this.VSTotalBeforeTax,
                  DocumentId: this.voId,
                  UserId: this.userDetails.UserID,
                  CreatedBy: this.userDetails.UserID,
                  WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
                  DocumentCode: this.selectedPODetails.VODocumentCode,
                  PurchaseOrderStatusId: this.selectedPODetails.WorkFlowStatusId
                };
                this.sharedServiceObj.sendForApproval(workFlowDetails).subscribe((data) => {
                  this.onRecordSelection(this.projectMasterContractId);
                  this.IsViewMode = true;
                  this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.SentForApproval,
                    MessageType: MessageTypes.Success
                  });
                  this.cancelRecord();
                });
              }
              if (action == 'approve') {
                this.updateStatus(WorkFlowStatus.Approved);
              }
              else {
                this.onRecordSelection(this.projectMasterContractId);
                this.IsViewMode = true;
                this.sharedServiceObj.showMessage({
                  ShowMessage: true,
                  Message: Messages.SavedSuccessFully,
                  MessageType: MessageTypes.Success
                });
              }
            }
          });
        }
      }
      else {
        this.confirmationServiceObj.confirm({
          message: "Select VO Amount",
          header: "Validations",
          accept: () => {
          },
          rejectVisible: false,
          acceptLabel: "Ok"
        });
      }
    }
    else {
      Object.keys(this.projectPurchaseOrderForm.controls).forEach((key: string) => {
        if (this.projectPurchaseOrderForm.controls[key].status == "INVALID" && this.projectPurchaseOrderForm.controls[key].touched == false) {
          this.projectPurchaseOrderForm.controls[key].markAsTouched();
        }
      });
      this.scrollToFirstInvalidControl();
    }
  }
  scrollToFirstInvalidControl() {
    const firstInvalidControl: HTMLElement = this.el.nativeElement.querySelector(
      "form .ng-invalid"
    );
    if (firstInvalidControl)
      firstInvalidControl.focus();
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
    if (statusId == WorkFlowStatus.Approved) {
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
    let workFlowStatus: WorkFlowApproval = {
      DocumentId: this.voId,
      UserId: this.userDetails.UserID,
      WorkFlowStatusId: statusId,
      Remarks: remarks,
      RequestUserId: this.selectedPODetails.CreatedBy,
      DocumentCode: this.selectedPODetails.VODocumentCode,
      ProcessId: WorkFlowProcess.ProjectContractVariationOrder,
      CompanyId: this.sessionService.getCompanyId(),
      ApproverUserId: 0,
      IsReApproval: false
    };
    if (this.isApprovalPage) { //if it is workflow approval page...
      this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus).subscribe((data) => {
        this.projectPurchaseOrderForm.get('ApprovalRemarks').setValue("");
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: successMessage,
          MessageType: MessageTypes.Success
        });
        this.cancelRecord();
      });
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
        this.onRecordSelection(this.projectMasterContractId);
      });
    }
  }
  onApproveClick(status: string) {
    if (this.verifyPermission && this.isApprovalPage) {
      this.saveRecord(status);
    }
    else {
      this.updateStatus(WorkFlowStatus.Approved);
    }
  }
  recallPoApproval(remarks) {
    let approvalObj = {
      DocumentId: this.voId,
      CreatedBy: this.userDetails.UserID,
      DocumentCode: this.selectedPODetails.VODocumentCode,
      DocumentValue: this.VSTotalBeforeTax,
      DocumentTypeId: WorkFlowProcess.ProjectContractVariationOrder,
      TotalAmount: this.VSTotalBeforeTax,
      CurrentApproverUserName: this.selectedPODetails.CurrentApproverUserName,
      CreatedByUserName: this.selectedPODetails.CreatedBy,
      CurrentApproverUserId: this.selectedPODetails.CurrentApproverUserId,
      CompanyId: this.selectedPODetails.CompanyId,
      DocumentWFStatusId: WorkFlowStatus.CancelledApproval,
      CurrencySymbol: this.selectedPODetails.CurrencySymbol,
      Remarks: remarks
    };
    this.genericService.RecallDocumentApproval(approvalObj).subscribe(() => {
      this.onRecordSelection(this.projectMasterContractId);
      this.closeValidationPopUp();
      this.cancelRecord();
    });
  }
  setContractDate(endDate: Date, startDate: Date) {
    let contractTerms: string = this.utilService.getContractDuration(startDate, endDate);
    this.projectPurchaseOrderForm.get('ContractTerms').setValue(contractTerms);
    this.selectedPODetails.ContractTerms = contractTerms;
  }
}