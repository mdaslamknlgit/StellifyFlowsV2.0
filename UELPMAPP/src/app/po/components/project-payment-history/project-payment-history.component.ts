import { POPDistributionSummaryColumns, ProjectPaymentExport, ProjectPaymentHistory, ProjectPaymentItems, ProjectPaymentRetentions, ProjectPOInterimColumns, ReportParams, TypeOfCostLineItem } from './../../models/project-payment-history.model';
import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { FullScreen, restrictMinus, ValidateFileType } from '../../../shared/shared';
import { ProjectMasterContract, ProjectMasterContractDisplayResult, POPDistributionSummary, ProjectPaymentMasterFilterModel, ProjectMasterContractItems, DiscountLineItems } from '../../models/project-contract-master.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { Suppliers, UserDetails, WorkFlowProcess, WorkFlowStatus, Messages, MessageTypes, PurchaseOrderType, WorkFlowApproval } from '../../../shared/models/shared.model';
import { ProjectContractMasterService } from '../../services/project-contract-master.service'
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { SharedService } from "../../../shared/services/shared.service";
import { POPHelperService } from '../../helpers/pop-helper.service';
import { ProjectPaymentMasterService } from '../../services/project-payment-history.service';
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import * as moment from 'moment';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { PageAccessLevel, Roles } from '../../../../app/administration/models/role';
import { ConfirmationService } from 'primeng/api';
import { GenericService } from '../../../shared/sevices/generic.service';
import { Locations } from '../../../inventory/models/item-master.model';
import { environment } from '../../../../environments/environment';
import { CurrencyMaskInputMode } from 'ngx-currency';
import { WorkBook, utils, write } from 'xlsx';
import * as XLSX from 'xlsx';
import { UtilService } from '../../../shared/services/util.service';
import { Location } from '@angular/common';
import { WorkFlowApiService } from '../../../administration/services/workflow-api.service';
@Component({
  selector: 'app-project-payment-history',
  templateUrl: './project-payment-history.component.html',
  styleUrls: ['./project-payment-history.component.css'],
  providers: [ProjectContractMasterService, ProjectPaymentMasterService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ProjectPaymentHistoryComponent implements OnInit {
  options2precision = { prefix: '', precision: 2, inputMode: CurrencyMaskInputMode.NATURAL };
  options4precision = { prefix: '', precision: 4, inputMode: CurrencyMaskInputMode.NATURAL };
  apiEndPoint = environment.apiEndpoint;
  userDetails: UserDetails = null;
  IsViewMode: boolean = true;
  doUpdate: boolean = false;
  scrollbarOptions: any;
  projectPOInterimColumns: Array<{ field: string, header: string, width?: string }> = [];
  projectDescriptionSummaryColumns: Array<{ field: string, header: string, width?: string }> = [];
  POPDistributionSummaryColumns: Array<{ field: string, header: string, width?: string }> = [];
  model: any;
  changingValue: Subject<number> = new Subject();
  noOfLines: number = 2;
  PaymentHistoryOrderForm: FormGroup;
  companyId: number = 0;
  moduleHeading: string = "";
  selectedPOPDetails: ProjectMasterContract = new ProjectMasterContract();
  selectedPPCDetails: ProjectPaymentHistory = new ProjectPaymentHistory();;
  projectMasterContractId: number = 0;
  paymentContractId: number = 0;
  departmentsWorkflow: Array<Location> = [];
  hasWorkFlow: boolean = true;
  workFlowStatus: any;
  totalFormat: string = "";
  isSameUSer: boolean = false;
  isApproverUser: boolean = false;
  uploadedFiles: Array<File> = [];
  statusErrorMessage: string = "";
  RetentionValidationMessage: string = "";
  userRoles = [];
  rolesAccessList = [];
  showGridErrorMessage1: boolean = false;
  isApprovalPage: boolean = false;
  pageType: string = "";
  editPermission: boolean = false;
  newPermission: boolean = true;
  sendForApprovalPermission: boolean = false;
  viewLogPermission: boolean = true;
  approvePermission: boolean = false;
  verifyPermission: boolean = false;
  voidPermission: boolean = false;
  printPermission: boolean = false;
  reportPermission: boolean = false;
  exportPermission: boolean = false;
  distributionPercentageSum: number = 0;
  certificationSum: number = 0;
  payContractSum: number = 0;
  retentionSum: number = 0;
  IsPaymentSummaryValid: boolean = false;
  showValidationPopup: boolean = false;
  showMandatoryPopup: boolean = false;
  showRetentionReleasePopup: boolean = false;
  showLogPopUp: boolean = false;
  currentRetentionSum: number = 0;
  previousRetentionSum: number = 0;
  VoidOrRejectHeader: string = "";
  showVoidOrRejectPopup: boolean = false;
  StatusId: number = 0;
  PreviousPaymentWOTax: number = 0;
  reportParams: ReportParams = new ReportParams();
  reportData: ProjectPaymentExport = new ProjectPaymentExport();
  constructor(private formbuilderObj: FormBuilder,
    private el: ElementRef,
    private sessionService: SessionStorageService,
    private sharedServiceObj: SharedService,
    private popHelperService: POPHelperService,
    private utilService: UtilService,
    private reqDateFormatPipe: RequestDateFormatPipe,
    private projectContractPaymentServiceObj: ProjectPaymentMasterService,
    private genericService: GenericService,
    // private location: Location,
    private workFlowService: WorkFlowApiService,
    public route: ActivatedRoute,
    private router: Router,
    private confirmationServiceObj: ConfirmationService,
    public activatedRoute: ActivatedRoute) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.companyId = this.sessionService.getCompanyId();
    this.workFlowStatus = WorkFlowStatus;
  }

  ngOnInit() {
    debugger
    this.projectPOInterimColumns = ProjectPOInterimColumns.filter(item => item);
    this.POPDistributionSummaryColumns = POPDistributionSummaryColumns.filter(item => item);
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
      this.pageType = param.get('type');
      this.moduleHeading = this.pageType == "request" ? "Project Invoice" : "Project Invoice Approval";
      this.isApprovalPage = this.pageType == "approval" ? true : false;
      this.paymentContractId = Number(param.get('id'));
      if (param.get('cid') != null && param.get('cid') != undefined) {
        this.companyId = Number(param.get('cid'));
      }
      this.projectMasterContractId = Number(param.get('popid'));
      this.sessionService.setCompanyId(this.companyId);
      this.getRoles();
    });
    this.getRoles();
    this.PaymentHistoryOrderForm = this.formbuilderObj.group({
      'PaymentContractId': [0],
      'ProjectMasterContractId': [0],
      'PreviousPaymentContractId': [0],
      'Requsestor': [''],
      'ContractName': [''],
      'ContractStartDate': [],
      'ContractEndDate': [],
      'ContractTerms': [''],
      'OriginalContractSum': [0],
      'TotalVOSum': [0],
      'AdjustedContractedSum': [0],
      'IsRetentionApplicable': [false],
      'Retention': [0],
      'RetentionMaxLimit': [0],
      'TaxAuthority': [''],
      'TaxRate': [0],
      'Remarks': [''],
      'ContractId': [0],
      'Status': [''],
      'CreatedDate': [new Date()],
      'Department': [''],
      'SupplierId': [''],
      'SupplierSubCodes': [''],
      'SupplierAddress': [''],
      'TypeofService': [''],
      'retentionSupplierId': [''],
      'ExpenseType': [''],
      'ProjectMasterContractItems': this.formbuilderObj.array([]),
      'DiscountLineItems': this.formbuilderObj.array([]),
      'POPDistributionSummaryItems': this.formbuilderObj.array([]),
      'POPInterimCertificationItems': this.formbuilderObj.array([]),
      'POPPaymentHistory': this.formbuilderObj.array([]),
      'POPDesriptioSummary': this.formbuilderObj.array([]),
      'ApprovalRemarks': [''],
      'CompanyId': [0],
      'IsDeleted': false,
      'POPMasterCode': [''],
      'ProjectName': [''],
      'AdjustedContractSum': [0],
      'RetentionPercentage': [0],
      'TaxAuthorityId': [0],
      'TaxId': [0],
      'TaxGroupId': [0],
      'LocationId': [0],
      'WorkFlowStatusId': [0],
      'Departments': [[]],
      'Supplier': [null],
      'SupplierSubCodeId': [null],
      'ServiceType': [null],
      'RetentionSupplierCode': [''],
      'ExpensesTypeId': [0],
      'SupplierSubCode': [null],
      'SubTotal': [0],
      'TotalBefTax': [0],
      'GrandTotal': [0],
      'TaxAmount': [0],
      'TotalAmount': [0],
      'TotalTax': [0],
      'TotalStatus': [0],
      'TotalAccPayment': [0],
      'TotalCurrentPayment': [0],
      'TotalPrevAccPayment': [0],
      'SubTotalCurrentPayment': [0],
      'SubTotalAccPayment': [0],
      'SubTotalStatus': [0],
      'SubTotalPrevAccumulatedAmount': [0],
      'TotalBefTaxCurrentPayment': [0],
      'TotalBefTaxAccPayment': [0],
      'TotalBefTaxStatus': [0],
      'CurrentPaymentTotalAmount': [0],
      'AccPaymentTotalAmount': [0],
      'StatusTotalAmount': [0],
      'PrevAccumulatedAmount': [0],
      'PrevAccPayTotalBefTax': [0],
      'PrevAccPayTotalAmount': [0],
      'NoOfRetentions': [0],
      'PaymentSummary': this.formbuilderObj.array([]),
      'PaymentNo': [1],
      'CertificateNo': [''],
      'DateOfValuation': [''],
      'DateOfCertification': [''],
      'DateOfDocument': [''],
      'SupplierInvoiceNumber': [''],
      'PaymentDescription': [''],
      'CMTotalVOSum': [0],
      'CMAdjustedContractSum': [0],
      'CMRetentionMaxLimit': [0]
    });
    this.initPaymentSummary();
    this.getProjectContractMasterDetails(this.projectMasterContractId);
    this.sharedServiceObj.CompanyId$
      .subscribe((data) => {
        //getting the purchase orders list..
        if (this.companyId != data) {
          this.companyId = data;
          //  this.getPurchaseOrders(0,0);
        }
      });
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
                  let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectinvoiceapproval")[0];
                  this.verifyPermission = formRole.IsVerify;
                  this.approvePermission = formRole.IsApprove;
                  this.voidPermission = false;
                  this.sendForApprovalPermission = false;
                  this.printPermission = false;
                  this.reportPermission = false;
                  this.exportPermission = false;
                }
                else {
                  let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectinvoice")[0];
                  this.voidPermission = formRole.IsVoid;
                  this.verifyPermission = false;
                  this.approvePermission = false;
                  this.exportPermission = formRole.IsExport;
                  this.printPermission = formRole.IsPrint;
                  this.editPermission = formRole.IsEdit;
                  this.sendForApprovalPermission = formRole.IsApprove;
                  this.reportPermission = formRole.IsGenerateReport;
                }
              }
            }
          });
        }
      });
    }
  }
  initGridRows() {
    return this.formbuilderObj.group({
      POPInterimCertificationId: [0],
      ProjectMasterContractItemId: [0],
      ItemDescription: [''],
      AccountCodeId: [0],
      POPCostCategoryId: [''],
      POPApportionmentId: [''],
      ContractValue: [0],
      Expense: [0],
      TotalVOSum: [0],
      RevisedContractValue: [0],
      TypeOfCostName: [''],
      ApportionmentMethod: [''],
      AccountCodeCategoryId: [0],
      AccountCodeName: [''],
      PrevAccumulatedAmount: [0],
      CurrentPayment: [0],
      AccumulatedPayment: [0],
      OverallStatus: [0, Validators.max(100)]
    });
  }

  initGridRows3() {
    return this.formbuilderObj.group({
      POPInterimCertificationId: [0],
      ProjectMasterContractItemId: [0],
      DisItemDescription: [''],
      AccountCodeId: [0],
      POPCostCategoryId: [0],
      POPApportionmentId: [0],
      DiscountValue: [0],
      Expense: [],
      TotalVOSum: [0],
      RevisedContractValue: [0],
      DisTypeOfCostName: [''],
      DisApportionmentMethod: [''],
      AccountCodeCategoryId: [0],
      PrevAccumulatedAmount: [0],
      CurrentPayment: [0],
      AccumulatedPayment: [0],
      OverallStatus: [0, Validators.max(100)],
      Status: [0]
    });
  }

  initGridRows1() {
    return this.formbuilderObj.group({
      'PaymentDisturbutionSummaryId': [0],
      'DisturbutionSummaryId': [0],
      'Department': [''],
      'DepartmentId': [0],
      'DistributionPercentage': [0],
      'PayContractAmount': [0],
      'ThisCertification': [0],
      'RetentionAmount': [0]
    });
  }
  getDepartmentsbyWorkFlow(companyId: number) {
    this.sharedServiceObj.getUserDepartments(companyId, WorkFlowProcess.ProjectPaymentContract, this.userDetails.UserID).subscribe((data: Array<Location>) => {
      this.departmentsWorkflow = data;
    });
  }
  onDepChage(event: any, department: any) {
    this.getWorkFlowConfiguration(department.selectedOptions[0].label);
  }

  getWorkFlowConfiguration(deptName: String) {
    let deptId: number = this.PaymentHistoryOrderForm.get('LocationId').value;
    let workFlowResult = <Observable<any>>this.workFlowService.getWorkFlowConfiguationId(24, this.companyId, deptId);
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
  getProjectContractMasterDetails(ProjectMasterContractId: any) {
    this.newPermission = false;
    this.projectMasterContractId = ProjectMasterContractId;
    this.IsViewMode = this.paymentContractId == 0 ? false : true;
    this.projectContractPaymentServiceObj.getCertificatesByPaymentContractId(this.projectMasterContractId, this.paymentContractId).subscribe((result: ProjectPaymentHistory) => {
      if (result != null) {
        this.selectedPOPDetails = <ProjectMasterContract>result.ProjectMasterContract;
        this.selectedPOPDetails.Supplier.SupplierCode = this.utilService.getSupplierCode(this.selectedPOPDetails.Supplier.SupplierCode, this.selectedPOPDetails.SupplierSubCode.SubCode);
        if (this.selectedPOPDetails.ContractStartDate != null && this.selectedPOPDetails.ContractEndDate != null) {
          this.setContractDate(new Date(this.selectedPOPDetails.ContractEndDate), new Date(this.selectedPOPDetails.ContractStartDate));
        }
        if (this.selectedPOPDetails.ProjectMasterContractItems.length > 0 || this.selectedPOPDetails.ProjectMasterContractItems.length == null) {
          this.addGridItem(this.selectedPOPDetails.ProjectMasterContractItems.length, "ProjectMasterContractItems");
        }
        if (this.selectedPOPDetails.DiscountLineItems.length > 0 || this.selectedPOPDetails.DiscountLineItems.length == null) {
          this.addGridItem(this.selectedPOPDetails.DiscountLineItems.length, "DiscountLineItems");
        }
        if (this.selectedPOPDetails.POPDistributionSummaryItems.length > 0 || this.selectedPOPDetails.POPDistributionSummaryItems.length == null) {
          this.addGridItem(this.selectedPOPDetails.POPDistributionSummaryItems.length, "POPDistributionSummaryItems");
        }
        this.PaymentHistoryOrderForm.patchValue({
          "ProjectMasterContractItems": this.selectedPOPDetails.ProjectMasterContractItems,
          "DiscountLineItems": this.selectedPOPDetails.DiscountLineItems,
          "POPDistributionSummaryItems": this.selectedPOPDetails.POPDistributionSummaryItems,
          "CMTotalVOSum": result.CMTotalVOSum,
          "CMAdjustedContractSum": result.CMAdjustedContractSum,
          "CMRetentionMaxLimit": result.CMRetentionMaxLimit,
          "SupplierAddress": this.selectedPOPDetails.SupplierAddress
        });
        let paymentSummary = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
        this.selectedPPCDetails = <ProjectPaymentHistory>result;
        this.isSameUSer = ((this.selectedPPCDetails.CreatedBy == this.userDetails.UserID) || this.paymentContractId == 0) ? true : false;
        this.isApproverUser = (this.selectedPPCDetails.CurrentApproverUserId == this.userDetails.UserID) ? true : false;
        this.PaymentHistoryOrderForm.get('PaymentContractId').setValue(this.selectedPPCDetails.PaymentContractId);
        if (result.Certificate != null) {
          this.PaymentHistoryOrderForm.get('SupplierAddress').setValue(result.SupplierAddress);
          this.PaymentHistoryOrderForm.get('NoOfRetentions').setValue(result.Certificate.Retentions.length - 1);
          this.initPaymentSummary();
          paymentSummary.controls[0].get('Retentions').patchValue(result.Certificate.Retentions);
          result.Certificate.Retentions.forEach((data, index) => {
            data.RetentionAmount = data.RetentionSum;
          });
          paymentSummary.controls[1].get('Retentions').patchValue(result.Certificate.Retentions);
          paymentSummary.controls.forEach((data, index) => {
            // data.get('Retentions').patchValue(result.Certificate.Retentions);
            switch (index) {
              case 0:
                data.get('Total').setValue(Number(result.Certificate.TotalValueOfWorkDone).toFixed(2));
                data.get('CurrentPayment').setValue(Number(result.Certificate.CPTotalValueOfWorkDone).toFixed(2));
                break;
              case 1:
                data.get('Total').setValue(Number(result.Certificate.RetentionSumCalculated).toFixed(2));
                data.get('CurrentPayment').setValue(Number(result.Certificate.CPRetentionSumCalculated).toFixed(2));
                break;
              case 2:
                data.get('Total').setValue(Number(result.Certificate.RetentionSumReleaseInTheMonth).toFixed(2));
                data.get('CurrentPayment').setValue(Number(result.Certificate.CPRetentionSumReleaseInTheMonth).toFixed(2));
                break;
              case 3:
                data.get('Total').setValue(Number(result.Certificate.NettRetention).toFixed(2));
                data.get('CurrentPayment').setValue(Number(result.Certificate.CPNettRetention).toFixed(2));
                break;
              case 4:
                data.get('Total').setValue(Number(result.Certificate.AmountDueUnderThisCerificate).toFixed(2));
                data.get('CurrentPayment').setValue(Number(result.Certificate.CPAmountDueUnderThisCerificate).toFixed(2));
                break;
              case 5:
                data.get('Total').setValue(Number(result.Certificate.GST).toFixed(2));
                data.get('CurrentPayment').setValue(Number(result.Certificate.CPGST).toFixed(2));
                break;
              case 6:
                data.get('Total').setValue(Number(result.Certificate.GSTAdjustment).toFixed(2));
                data.get('CurrentPayment').setValue(Number(result.Certificate.CPGSTAdjustment).toFixed(2));
                break;
              case 7:
                data.get('Total').setValue(Number(result.Certificate.GrandTotal).toFixed(2));
                data.get('CurrentPayment').setValue(Number(result.Certificate.CPGrandTotal).toFixed(2));
                break;
            }
          });
        }
        if (result.PreviousCertificate != null) {
          this.PaymentHistoryOrderForm.get('PreviousPaymentContractId').setValue(result.PreviousPaymentContractId);
          this.PreviousPaymentWOTax = result.PreviousCertificate.CPAmountDueUnderThisCerificate;
          this.previousRetentionSum = result.PreviousRetentionSum;
          paymentSummary.controls.forEach((data, index) => {
            switch (index) {
              case 0:
                data.get('PrevPaid').setValue(Number(result.PreviousCertificate.TotalValueOfWorkDone).toFixed(2));
                break;
              case 1:
                data.get('PrevPaid').setValue(Number(result.PreviousCertificate.RetentionSumCalculated).toFixed(2));
                break;
              case 2:
                data.get('PrevPaid').setValue(Number(result.PreviousCertificate.RetentionSumReleaseInTheMonth).toFixed(2));
                break;
              case 3:
                data.get('PrevPaid').setValue(Number(result.PreviousCertificate.NettRetention).toFixed(2));
                break;
              case 4:
                data.get('PrevPaid').setValue(Number(result.PreviousCertificate.AmountDueUnderThisCerificate).toFixed(2));
                break;
              case 5:
                data.get('PrevPaid').setValue(Number(result.PreviousCertificate.GST).toFixed(2));
                break;
              case 6:
                data.get('PrevPaid').setValue(Number(result.PreviousCertificate.GSTAdjustment).toFixed(2));
                break;
              case 7:
                data.get('PrevPaid').setValue(Number(result.PreviousCertificate.GrandTotal).toFixed(2));
                break;
            }
          });
        }
        else {
          this.PaymentHistoryOrderForm.get('PreviousPaymentContractId').setValue(0);
          this.PreviousPaymentWOTax = 0;
        }
        if (result.POPDistributionSummaryItems != null) {
          this.selectedPOPDetails.POPDistributionSummaryItems = result.POPDistributionSummaryItems;
          this.CalculateDistributionSummary();
        }
        if (this.paymentContractId == 0) {
          this.PaymentHistoryOrderForm.get('PaymentNo').setValue(Number(result.PaymentNo) + 1);
          if (result.PreviousCertificate != null) {
            this.PaymentHistoryOrderForm.get('NoOfRetentions').setValue(result.PreviousCertificate.Retentions.length - 1);
          }
          else {
            this.PaymentHistoryOrderForm.get('NoOfRetentions').setValue(this.selectedPOPDetails.IsRetentionApplicable ? 1 : 0);
          }
          this.PrepareRetentions();
        }
        else {
          this.PaymentHistoryOrderForm.get('DateOfValuation').setValue(result.DateOfValuation == null ? '' : new Date(result.DateOfValuation));
          this.PaymentHistoryOrderForm.get('DateOfDocument').setValue(result.DateOfDocument == null ? '' : new Date(result.DateOfDocument));
          this.PaymentHistoryOrderForm.get('DateOfCertification').setValue(result.DateOfCertification == null ? '' : new Date(result.DateOfCertification));
          this.PaymentHistoryOrderForm.get('PaymentNo').setValue(Number(result.PaymentNo));
          this.PaymentHistoryOrderForm.get('SupplierInvoiceNumber').setValue(result.SupplierInvoiceNumber);
          this.PaymentHistoryOrderForm.get('CertificateNo').setValue(result.CertificateNo);
          this.PaymentHistoryOrderForm.get('PaymentDescription').setValue(result.PaymentDescription);
          this.PaymentHistoryOrderForm.get('LocationId').setValue(result.LocationId);
        }
        if (this.paymentContractId == 0 && result.PreviousCertificate != null) {
          paymentSummary.controls[0].get('Retentions').patchValue(result.PreviousCertificate.Retentions);
          paymentSummary.controls[1].get('Retentions').patchValue(result.PreviousCertificate.Retentions);
          this.CalculatePaymentSummary();
        }
        this.calculatePrevAccumlatedTotal();
        this.calculateTotalPrice(0, null);
        //if (this.paymentContractId > 0) {
        //this.calculateCurrentPayment(0, null);
        //}
        this.calculateOriginalContract();
        this.validatePaymentSummary();
        this.changingValue.next(this.paymentContractId);
      }
    });
  }
  calculateOriginalContract() {
    let OCVSubTotal: number = 0;
    let OCVDiscountSum: number = 0;
    let OCVTotalBeforeTax: number = 0;
    let OCVTax: number = 0;
    let OCVTotal: number = 0;
    this.selectedPOPDetails.ProjectMasterContractItems.forEach((lineitem: ProjectMasterContractItems) => {
      OCVSubTotal += Number(lineitem.ContractValue);
    });
    this.selectedPOPDetails.DiscountLineItems.forEach((lineitem: DiscountLineItems) => {
      OCVDiscountSum += Number(lineitem.DiscountValue);
    });
    OCVTotalBeforeTax = OCVSubTotal + OCVDiscountSum;
    this.selectedPOPDetails.SubTotal = OCVSubTotal;
    this.selectedPOPDetails.TotalBefTax = OCVTotalBeforeTax;
    let taxRate: number = Number(this.selectedPOPDetails.TaxAmount);
    OCVTax = (OCVTotalBeforeTax * taxRate) / 100;
    OCVTotal = OCVTotalBeforeTax + OCVTax;
    this.selectedPOPDetails.TotalTax = OCVTax;
    this.selectedPOPDetails.TotalAmount = OCVTotal;
    let tbtAccPay = this.PaymentHistoryOrderForm.get('TotalBefTaxAccPayment').value;
    let tbtAccPayStatus = (tbtAccPay / this.selectedPOPDetails.TotalBefTax) * 100;
    this.PaymentHistoryOrderForm.get('TotalBefTaxStatus').setValue(tbtAccPayStatus.toFixed(2));
    let AccPay = this.PaymentHistoryOrderForm.get('AccPaymentTotalAmount').value;
    let AccpayStatus = (AccPay / this.selectedPOPDetails.TotalAmount) * 100;
    this.PaymentHistoryOrderForm.get('StatusTotalAmount').setValue(AccpayStatus.toFixed(2));
  }
  setDiscountValue(index: number, control: string) {
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['DiscountLineItems'];
    itemGroupControl.controls.forEach((row, rowindex) => {
      if (index == rowindex) {
        let _discountVal = row.get(control).value;
        row.get(control).setValue(_discountVal > 0 ? (-(_discountVal)) : _discountVal);
        return;
      }
    });
  }

  clearForm() {
    this.PaymentHistoryOrderForm.reset();
    this.PaymentHistoryOrderForm.setErrors(null);
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['ProjectMasterContractItems'];
    itemGroupControl.controls = [];
    itemGroupControl.controls.length = 0;

    let itemGroupControl1 = <FormArray>this.PaymentHistoryOrderForm.controls['DiscountLineItems'];
    itemGroupControl1.controls = [];
    itemGroupControl1.controls.length = 0;

    let itemGroupControl2 = <FormArray>this.PaymentHistoryOrderForm.controls['POPDistributionSummaryItems'];
    itemGroupControl2.controls = [];
    itemGroupControl2.controls.length = 0;


  }
  validateDates(type: string) {

  }

  addGridItem(noOfLines: number, gridFAName: string) {
    //this.showGridErrorMessage = false;
    let itemGroupControl = new FormArray([]);
    itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls[gridFAName];
    for (let i = 0; i < noOfLines; i++) {
      if (gridFAName == "ProjectMasterContractItems") {
        itemGroupControl.push(this.initGridRows());
      }
      else if (gridFAName == "POPDistributionSummaryItems") {
        itemGroupControl.push(this.initGridRows1());
      }
      else if (gridFAName == "DiscountLineItems") {
        itemGroupControl.push(this.initGridRows3());
      }
    }


  }
  onDatePickerFocus(element: NgbInputDatepicker, event: any) {
    if (!element.isOpen()) {
      element.open();
    }
  }
  PaymentSummarySelection(event) {
    this.editRecord();
  }

  restrictMinusValue(e: any) {
    restrictMinus(e);
  }
  editRecord() {
    this.SetRequiredValidation('');
    this.IsViewMode = false;
  }
  onCancelClick() {
    this.route.queryParams.subscribe((params) => {
      if (params['from'] == 'cm') {
        this.router.navigate(['po/projectcontractmaster/' + this.pageType]);
      }
      else {
        this.router.navigate(['po/projectpaymentlist/' + this.pageType]);
      }
    });
    // this.location.back();
  }
  onVerify() {
    this.editRecord();
    this.doUpdate = true;
  }
  onClickedOutside(e: Event) {
    $(".tablescroll").removeClass("hidescroll")
  }

  itemClick(rowId: number) {
    setTimeout(function () {
      $(".tablescroll").addClass("hidescroll")
    }, 1000);
  }

  calculateCurrentPayment(rowIndex: number, gridRow: any) {
    debugger
    let currentPaySubTotal = this.getCurPaySubTotal(rowIndex);
    let accSubTotal = this.getAccPaymentSubTotal();
    let statSubTotal = this.getStatusSubTotal();
    let statusSubTotal = statSubTotal.toFixed(2);

    let disCurrentPaySubTotal = this.getCurrentDisSubTotal();
    let disAccPaySubTotal = this.getAccPayDisSubTotal();
    let disStatusSubTotal = this.getStatusDisSubTotal();
    let currentPayTotalBefTax = currentPaySubTotal + disCurrentPaySubTotal;
    let accPaymentTotalBefTax = accSubTotal + disAccPaySubTotal;
    let statusTotalBefTax = ((accPaymentTotalBefTax / this.selectedPOPDetails.TotalBefTax) * 100).toFixed(2);


    let statusTotalAmount = ((accPaymentTotalBefTax / this.selectedPOPDetails.TotalAmount) * 100).toFixed(2);



    this.PaymentHistoryOrderForm.get('SubTotalCurrentPayment').setValue(currentPaySubTotal);
    this.PaymentHistoryOrderForm.get('SubTotalAccPayment').setValue(accSubTotal);
    this.PaymentHistoryOrderForm.get('SubTotalStatus').setValue(statusSubTotal);

    this.PaymentHistoryOrderForm.get('TotalBefTaxCurrentPayment').setValue(currentPayTotalBefTax);
    this.PaymentHistoryOrderForm.get('TotalBefTaxAccPayment').setValue(accPaymentTotalBefTax);
    this.PaymentHistoryOrderForm.get('TotalBefTaxStatus').setValue(statusTotalBefTax);

    this.PaymentHistoryOrderForm.get('CurrentPaymentTotalAmount').setValue(currentPayTotalBefTax);
    this.PaymentHistoryOrderForm.get('AccPaymentTotalAmount').setValue(accPaymentTotalBefTax);
    this.PaymentHistoryOrderForm.get('StatusTotalAmount').setValue(statusTotalAmount);
  }
  getCurrentDisSubTotal() {
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['DiscountLineItems'];

    let disSubTotal = 0;
    itemGroupControl.controls.forEach((data, index) => {

      let prevAccPayment = data.get('PrevAccumulatedAmount').value;
      let currentPayment = data.get('CurrentPayment').value;
      //if (currentPayment > 0) {
      let accumulatedValue = (currentPayment + prevAccPayment);
      data.get('AccumulatedPayment').setValue(accumulatedValue);
      disSubTotal = disSubTotal + currentPayment;
      // }
      // else {
      //   data.get('AccumulatedPayment').setValue(0);
      //   disSubTotal = disSubTotal + data.get('AccumulatedPayment').value;
      // }



    });
    return disSubTotal;

  }
  getCurPaySubTotal(rowIndex: number) {
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['ProjectMasterContractItems'];
    // let contractValue = this.selectedPOPDetails.ProjectMasterContractItems[rowIndex].ContractValue;

    if (itemGroupControl != undefined) {
      let subTotal = 0;
      let prevAccPayment = itemGroupControl.controls[rowIndex].get('PrevAccumulatedAmount').value;
      let currentPayment = itemGroupControl.controls[rowIndex].get('CurrentPayment').value;
      //if (currentPayment > 0) {
      let accumulatedValue = (currentPayment + prevAccPayment);
      itemGroupControl.controls[rowIndex].get('AccumulatedPayment').setValue(accumulatedValue);
      itemGroupControl.controls.forEach(data => {
        subTotal = subTotal + data.get('CurrentPayment').value;
      });
      //}
      // else {
      //   itemGroupControl.controls[rowIndex].get('AccumulatedPayment').setValue(0);
      //   itemGroupControl.controls.forEach(data => {
      //     subTotal = subTotal + data.get('CurrentPayment').value;
      //   });
      // }

      return subTotal;
    }
  }
  calculatePrevAccumlatedTotal() {
    let lineItems = <FormArray>this.PaymentHistoryOrderForm.controls['ProjectMasterContractItems'];
    let discountItems = <FormArray>this.PaymentHistoryOrderForm.controls['DiscountLineItems'];
    let prevAccTotal = 0;
    let prevDisTotal = 0;
    let prevBefTax = 0;
    if (lineItems != undefined) {
      lineItems.controls.forEach(data => {
        prevAccTotal += data.get('PrevAccumulatedAmount').value;
      });
    }
    if (discountItems != undefined) {
      discountItems.controls.forEach(data => {
        prevDisTotal += data.get('PrevAccumulatedAmount').value;
      });
    }
    prevBefTax = prevAccTotal + prevDisTotal;
    this.PaymentHistoryOrderForm.get('SubTotalPrevAccumulatedAmount').setValue(prevAccTotal.toFixed(2));
    this.PaymentHistoryOrderForm.get('PrevAccPayTotalBefTax').setValue(prevBefTax.toFixed(2));
    this.PaymentHistoryOrderForm.get('PrevAccPayTotalAmount').setValue(prevBefTax.toFixed(2));
  }
  calculateTotalPrice(rowIndex: number, gridRow: any) {
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['ProjectMasterContractItems'];

    let currentPaySubTotal = this.getCurrentPaymentSubTotal(rowIndex);
    let accSubTotal = this.getAccPaymentSubTotal();
    let statSubTotal = this.getStatusSubTotal();
    let statusSubTotal = statSubTotal.toFixed(2);

    this.PaymentHistoryOrderForm.get('SubTotalCurrentPayment').setValue(currentPaySubTotal);
    this.PaymentHistoryOrderForm.get('SubTotalAccPayment').setValue(accSubTotal);
    this.PaymentHistoryOrderForm.get('SubTotalStatus').setValue(statusSubTotal);


    let disCurrentPaySubTotal = this.getCurrentPayDisSubTotal();
    let disAccPaySubTotal = this.getAccPayDisSubTotal();
    let disStatusSubTotal = this.getStatusDisSubTotal();


    let currentPayTotalBefTax = currentPaySubTotal + disCurrentPaySubTotal;
    let accPaymentTotalBefTax = accSubTotal + disAccPaySubTotal;

    let statusTotalBefTax = ((accPaymentTotalBefTax / this.selectedPOPDetails.TotalBefTax) * 100).toFixed(2);


    let statusTotalAmount = ((accPaymentTotalBefTax / this.selectedPOPDetails.TotalAmount) * 100).toFixed(2);



    this.PaymentHistoryOrderForm.get('TotalBefTaxCurrentPayment').setValue(currentPayTotalBefTax);
    this.PaymentHistoryOrderForm.get('TotalBefTaxAccPayment').setValue(accPaymentTotalBefTax);
    this.PaymentHistoryOrderForm.get('TotalBefTaxStatus').setValue(statusTotalBefTax);

    this.PaymentHistoryOrderForm.get('CurrentPaymentTotalAmount').setValue(currentPayTotalBefTax);
    this.PaymentHistoryOrderForm.get('AccPaymentTotalAmount').setValue(accPaymentTotalBefTax);
    this.PaymentHistoryOrderForm.get('StatusTotalAmount').setValue(statusTotalAmount);


    // let totalTax = this.getTotalTax(this.projectPurchaseOrderForm.get('TaxId').value);
    // let totalAmount = totalTax + totalBefTax;
    // this.projectPurchaseOrderForm.get('TotalAmount').setValue(totalAmount);

    let discountItemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['DiscountLineItems'];
    if (discountItemGroupControl != undefined) {
      let delStatusValue = 0;
      discountItemGroupControl.controls.forEach(data => {
        delStatusValue = ((data.get('AccumulatedPayment').value) / (data.get('DiscountValue').value)) * 100;
        if (delStatusValue > 100) {  //|| data.get('CurrentPayment').value < 0
          data.get('OverallStatus').setValue(delStatusValue);
          data.get('OverallStatus').setErrors({ 'statusError': true });
          this.statusErrorMessage = delStatusValue > 100 ? "Accumulated Payment should not be greater than contract value"
            : "Accumulated Payment should be greater than or equal to Prev. Accumulated Payment";
          return;
        }
        else {
          data.get('OverallStatus').setErrors({ 'statusError': false });
          data.get('OverallStatus').setValue(delStatusValue);
        }
      });
    }
  }
  getCurrentPaymentSubTotal(rowIndex: number) {
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['ProjectMasterContractItems'];
    // let contractValue = this.selectedPOPDetails.ProjectMasterContractItems[rowIndex].ContractValue;

    if (itemGroupControl != undefined) {
      let subTotal = 0;
      let accPayment = itemGroupControl.controls[rowIndex].get('AccumulatedPayment').value;
      let prevAccPayment = itemGroupControl.controls[rowIndex].get('PrevAccumulatedAmount').value;
      if (accPayment > 0) {
        let currentPaymentValue = (accPayment - prevAccPayment);
        itemGroupControl.controls[rowIndex].get('CurrentPayment').setValue(currentPaymentValue);
        itemGroupControl.controls.forEach(data => {

          subTotal = subTotal + data.get('CurrentPayment').value;
        });
      }
      else {
        itemGroupControl.controls[rowIndex].get('CurrentPayment').setValue(0);
        itemGroupControl.controls.forEach(data => {

          subTotal = subTotal + data.get('CurrentPayment').value;
        });
      }


      return subTotal;
    }
  }
  getAccPaymentSubTotal() {
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['ProjectMasterContractItems'];
    if (itemGroupControl != undefined) {
      let subTotal = 0;
      itemGroupControl.controls.forEach(data => {
        subTotal = subTotal + data.get('AccumulatedPayment').value;
      });
      return subTotal;
    }
  }
  getStatusSubTotal() {

    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['ProjectMasterContractItems'];
    if (itemGroupControl != undefined) {
      let subTotal = 0;
      let accPayTotal = 0;
      let contractValueTotal = 0;
      let statusValue = 0;
      itemGroupControl.controls.forEach(data => {
        statusValue = ((data.get('AccumulatedPayment').value) / (data.get('ContractValue').value)) * 100;
        if (statusValue > 100 || data.get('CurrentPayment').value < 0 || (data.get('AccumulatedPayment').value == 0 && data.get('PrevAccumulatedAmount').value > 0)) {
          data.get('OverallStatus').setValue(statusValue);
          data.get('OverallStatus').setErrors({ 'statusError': true });
          this.statusErrorMessage = statusValue > 100 ? "Accumulated Payment should not be greater than contract value"
            : "Accumulated Payment should be greater than or equal to Prev. Accumulated Payment";
          return;
        }
        else {
          data.get('OverallStatus').setErrors({ 'statusError': false });
          data.get('OverallStatus').setValue(isNaN(statusValue) ? 0 : statusValue);
        }
        accPayTotal = accPayTotal + (data.get('AccumulatedPayment').value);
        contractValueTotal = contractValueTotal + data.get('ContractValue').value;
      });
      subTotal = (accPayTotal / contractValueTotal) * 100;
      return subTotal;
    }
  }
  getCurrentPayDisSubTotal() {
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['DiscountLineItems'];
    let disSubTotal = 0;
    itemGroupControl.controls.forEach((data, index) => {

      let accPayment = data.get('AccumulatedPayment').value;
      let prevAccPayment = data.get('PrevAccumulatedAmount').value;
      //if (accPayment > 0) {
      let currentPaymentValue = (accPayment - prevAccPayment);
      data.get('CurrentPayment').setValue(currentPaymentValue);
      disSubTotal = disSubTotal + data.get('CurrentPayment').value;
      // }
      // else {
      //   data.get('CurrentPayment').setValue(0);
      //   disSubTotal = disSubTotal + data.get('CurrentPayment').value;
      // }



    });
    return disSubTotal;
  }
  getAccPayDisSubTotal() {
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['DiscountLineItems'];
    if (itemGroupControl != undefined) {
      let disSubTotal = 0;
      itemGroupControl.controls.forEach(data => {
        disSubTotal = disSubTotal + data.get('AccumulatedPayment').value;
      });
      return disSubTotal;
    }
  }
  getStatusDisSubTotal() {
    let itemGroupControl = <FormArray>this.PaymentHistoryOrderForm.controls['DiscountLineItems'];
    if (itemGroupControl != undefined) {

      let disSubTotal = 0;
      let accPayTotal = 0;
      let contractValueTotal = 0;
      let statusValue = 0;
      itemGroupControl.controls.forEach(data => {
        statusValue = ((data.get('AccumulatedPayment').value) / (data.get('DiscountValue').value)) * 100;
        data.get('OverallStatus').setValue(statusValue);

        accPayTotal = accPayTotal + (data.get('AccumulatedPayment').value);
        contractValueTotal = contractValueTotal + data.get('DiscountValue').value;
      });
      disSubTotal = (accPayTotal / contractValueTotal) * 100;
      // let disSubTotal = 0;
      // itemGroupControl.controls.forEach(data => {
      //     disSubTotal = disSubTotal + data.get('Status').value;
      // });
      return disSubTotal;
    }
  }
  preparePaymentObject(action: string): ProjectPaymentHistory {
    let certificate = new ProjectPaymentItems();
    let projectPaymentContractDetails: ProjectPaymentHistory = this.PaymentHistoryOrderForm.value;
    projectPaymentContractDetails.Action = action;
    projectPaymentContractDetails.CompanyId = this.companyId;
    projectPaymentContractDetails.POPId = this.selectedPOPDetails.ProjectMasterContractId;
    //Total start
    certificate.TotalValueOfWorkDone = projectPaymentContractDetails.PaymentSummary[0].Total;
    certificate.RetentionSumCalculated = projectPaymentContractDetails.PaymentSummary[1].Total;
    certificate.RetentionSumReleaseInTheMonth = projectPaymentContractDetails.PaymentSummary[2].Total;
    certificate.NettRetention = projectPaymentContractDetails.PaymentSummary[3].Total;
    certificate.AmountDueUnderThisCerificate = projectPaymentContractDetails.PaymentSummary[4].Total;
    certificate.GST = projectPaymentContractDetails.PaymentSummary[5].Total;
    certificate.GSTAdjustment = projectPaymentContractDetails.PaymentSummary[6].Total;
    certificate.GrandTotal = projectPaymentContractDetails.PaymentSummary[7].Total;
    //Total end
    //Current Payment start
    certificate.CPTotalValueOfWorkDone = projectPaymentContractDetails.PaymentSummary[0].CurrentPayment;
    certificate.CPRetentionSumCalculated = projectPaymentContractDetails.PaymentSummary[1].CurrentPayment;
    certificate.CPRetentionSumReleaseInTheMonth = projectPaymentContractDetails.PaymentSummary[2].CurrentPayment;
    certificate.CPNettRetention = projectPaymentContractDetails.PaymentSummary[3].CurrentPayment;
    certificate.CPAmountDueUnderThisCerificate = projectPaymentContractDetails.PaymentSummary[4].CurrentPayment;
    certificate.CPGST = projectPaymentContractDetails.PaymentSummary[5].CurrentPayment;
    certificate.CPGSTAdjustment = projectPaymentContractDetails.PaymentSummary[6].CurrentPayment;
    certificate.CPGrandTotal = projectPaymentContractDetails.PaymentSummary[7].CurrentPayment;
    //current payment end
    let certificateRetentions: ProjectPaymentRetentions[] = [];
    let workdone = projectPaymentContractDetails.PaymentSummary[0].Retentions;
    for (let j = 0; j < workdone.length; j++) {
      let certificateRetention = new ProjectPaymentRetentions();
      certificateRetention.ProjectPaymentRetentionId = projectPaymentContractDetails.PaymentSummary[0].Retentions[j].ProjectPaymentRetentionId;
      certificateRetention.ProjectPaymentItemId = projectPaymentContractDetails.PaymentSummary[0].Retentions[j].ProjectPaymentItemId;
      certificateRetention.RetentionAmount = projectPaymentContractDetails.PaymentSummary[0].Retentions[j].RetentionAmount;
      certificateRetention.RetentionPercentage = projectPaymentContractDetails.PaymentSummary[0].Retentions[j].RetentionPercentage;
      certificateRetention.IsRetention = projectPaymentContractDetails.PaymentSummary[0].Retentions[j].IsRetention;
      certificateRetentions.push(certificateRetention);
    }
    let retentionSum = projectPaymentContractDetails.PaymentSummary[1].Retentions;
    for (let j = 0; j < retentionSum.length; j++) {
      certificateRetentions[j].RetentionSum = projectPaymentContractDetails.PaymentSummary[1].Retentions[j].RetentionAmount;
    }
    certificate.Retentions = certificateRetentions;
    projectPaymentContractDetails.Certificate = certificate;
    projectPaymentContractDetails.DateOfValuation = this.reqDateFormatPipe.transformDateWithNull(projectPaymentContractDetails.DateOfValuation);
    projectPaymentContractDetails.DateOfCertification = this.reqDateFormatPipe.transformDateWithNull(projectPaymentContractDetails.DateOfCertification);
    projectPaymentContractDetails.DateOfDocument = this.reqDateFormatPipe.transformDateWithNull(projectPaymentContractDetails.DateOfDocument);
    projectPaymentContractDetails.CreatedBy = this.userDetails.UserID;
    projectPaymentContractDetails.UpdatedBy = this.userDetails.UserID;
    projectPaymentContractDetails.WorkFlowStatusId = (action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval);

    // projectPaymentContractDetails.CompanyId = this.sessionService.getCompanyId();
    projectPaymentContractDetails.LocationId = this.PaymentHistoryOrderForm.get('LocationId').value;
    projectPaymentContractDetails.POPDistributionSummaryItems = this.selectedPOPDetails.POPDistributionSummaryItems;
    if (this.selectedPPCDetails.Attachments != null && this.selectedPPCDetails.Attachments.length > 0) {
      projectPaymentContractDetails.Attachments = this.selectedPPCDetails.Attachments.filter(i => i.IsDelete == true);
    }
    projectPaymentContractDetails.IsVerifier = this.verifyPermission;
    return projectPaymentContractDetails;
  }
  ValidatePayments(): boolean {
    let isValid = true;
    let currentPayment: number = this.PaymentHistoryOrderForm.get('SubTotalCurrentPayment').value;
    let itemGroupControl2 = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
    let retentionReleaseAmount: number = itemGroupControl2.controls[2].get('Total').value;
    this.showMandatoryPopup = (currentPayment == 0 && retentionReleaseAmount == 0);
    isValid = !this.showMandatoryPopup;
    return isValid;
  }
  validateAttachments() {
    if (this.uploadedFiles.length == 0 && (this.selectedPPCDetails.Attachments == undefined || this.selectedPPCDetails.Attachments.filter(i => i.IsDelete != true).length == 0)) {
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
    let _dept = this.PaymentHistoryOrderForm.get('LocationId');
    let _paymentDesc = this.PaymentHistoryOrderForm.get('PaymentDescription');
    let _dtOfCertification = this.PaymentHistoryOrderForm.get('DateOfCertification');
    let _dtOfVal = this.PaymentHistoryOrderForm.get('DateOfValuation');
    let _suppInvNum = this.PaymentHistoryOrderForm.get('SupplierInvoiceNumber');
    let _dtOfDoc = this.PaymentHistoryOrderForm.get('DateOfDocument');
    _paymentDesc.setErrors(null);
    _dtOfCertification.setErrors(null);
    _dtOfVal.setErrors(null);
    _suppInvNum.setErrors(null);
    _dtOfDoc.setErrors(null);
    _dept.setErrors((_dept.value == 0 || _dept.value == null || _dept.value == undefined) ? { 'required': true } : null);
    if (action == 'send' || action == 'approve') {
      if (_paymentDesc.value == '' || _paymentDesc.value == null) {
        _paymentDesc.setErrors({ 'required': true });
      }
      if (_dtOfVal.value == '' || _dtOfVal.value == null) {
        _dtOfVal.setErrors({ 'required': true });
      }
      if (_suppInvNum.value == '' || _suppInvNum.value == null) {
        _suppInvNum.setErrors({ 'required': true });
      }
      if (_dtOfDoc.value == '' || _dtOfDoc.value == null) {
        _dtOfDoc.setErrors({ 'required': true });
      }
    }
  }
  saveRecord(action: string) {
    this.SetRequiredValidation(action);
    this.validatePaymentSummary();
    this.showGridErrorMessage1 = this.PaymentHistoryOrderForm.get('AccPaymentTotalAmount').value == 0 ? true : false;
    if (this.PaymentHistoryOrderForm.valid && this.validateRetention() && this.validateRetentionRelease() && this.IsPaymentSummaryValid && this.ValidatePayments() && !this.showGridErrorMessage1) {
      if ((action == 'send') ? this.validateAttachments() : true) {
        this.confirmationServiceObj.confirm({
          message: Messages.ProceedDelete,
          header: Messages.DeletePopupHeader,
          accept: () => {
            let paymentObj: ProjectPaymentHistory = this.preparePaymentObject(action);
            this.projectContractPaymentServiceObj.createProjectPaymentContract(paymentObj, this.uploadedFiles).subscribe((poId: number) => {
              if (poId > 0) {
                this.paymentContractId = poId;
                this.uploadedFiles = [];
                this.IsViewMode = true;
                if (action == 'send') {  //|| action == 'approve' || action == 'verify'
                  let workFlowDetails: WorkFlowParameter = {
                    ProcessId: WorkFlowProcess.ProjectPaymentContract,
                    CompanyId: this.selectedPOPDetails.CompanyId,
                    LocationId: this.PaymentHistoryOrderForm.get('LocationId').value,
                    FieldName: "",
                    Value: paymentObj.Certificate.CPGrandTotal,
                    DocumentId: this.paymentContractId,
                    CreatedBy: this.userDetails.UserID,
                    WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
                    DocumentCode: this.selectedPPCDetails.DocumentCode,
                    PurchaseOrderStatusId: this.selectedPPCDetails.WorkFlowStatusId
                  };
                  this.sharedServiceObj.sendForApproval(workFlowDetails).subscribe((data) => {
                    this.getProjectContractMasterDetails(this.projectMasterContractId);
                    this.IsViewMode = true;
                    this.sharedServiceObj.showMessage({
                      ShowMessage: true,
                      Message: Messages.SentForApproval,
                      MessageType: MessageTypes.Success
                    });
                    this.onCancelClick();
                  });
                }
                if (action == 'approve') {
                  this.updateStatus(WorkFlowStatus.Approved);
                }
                else {
                  this.getProjectContractMasterDetails(this.projectMasterContractId);
                  this.IsViewMode = true;
                  this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.SavedSuccessFully,
                    MessageType: MessageTypes.Success
                  });
                }
              }
              else if (poId == -1) {
                this.confirmationServiceObj.confirm({
                  message: Messages.DuplicateSupplierInvoiceNumber,
                  header: Messages.PopupHeader,
                  rejectVisible: false,
                  acceptLabel: "OK"
                });
              }
            });
          },
          reject: () => {
          }
        });
      }
    }
    else {
      Object.keys(this.PaymentHistoryOrderForm.controls).forEach((key: string) => {
        if (this.PaymentHistoryOrderForm.controls[key].status == "INVALID" && this.PaymentHistoryOrderForm.controls[key].touched == false) {
          this.PaymentHistoryOrderForm.controls[key].markAsTouched();
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
            this.updateStatus(statusId, control.value);
            this.closeValidationPopUp();
            this.onCancelClick();
          },
          reject: () => {
          }
        });
      }
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
  updateStatus(statusId: number, rejectionRemarks: string = "") {
    let remarks = "";
    let successMessage = "";
    let formRemarks = this.PaymentHistoryOrderForm.get('ApprovalRemarks').value;
    if ((formRemarks == "" || formRemarks == null) && (statusId == WorkFlowStatus.AskedForClarification || statusId == WorkFlowStatus.WaitingForApproval)) {
      this.PaymentHistoryOrderForm.get('ApprovalRemarks').setErrors({ "required": true });
      this.PaymentHistoryOrderForm.get('ApprovalRemarks').markAsTouched();
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
    else if (statusId == WorkFlowStatus.Void) {
      if (rejectionRemarks != "" && rejectionRemarks != null) {
        remarks = rejectionRemarks;
      }
      else {
        remarks = "Voided";
      }
      successMessage = Messages.DocumentVoidRecord;
    }
    else {
      remarks = formRemarks;
      successMessage = Messages.SentForClarification;
    }
    let workFlowStatus: WorkFlowApproval = {
      DocumentId: this.selectedPPCDetails.PaymentContractId,
      UserId: this.userDetails.UserID,
      WorkFlowStatusId: statusId,
      Remarks: remarks,
      RequestUserId: this.selectedPPCDetails.CreatedBy,
      DocumentCode: this.selectedPPCDetails.DocumentCode,
      ProcessId: WorkFlowProcess.ProjectPaymentContract,
      CompanyId: this.sessionService.getCompanyId(),
      ApproverUserId: 0,
      IsReApproval: false
    };
    if (this.isApprovalPage) { //if it is workflow approval page...
      this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus).subscribe((data) => {
        this.PaymentHistoryOrderForm.get('ApprovalRemarks').setValue("");
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: successMessage,
          MessageType: MessageTypes.Success
        });
        this.onCancelClick();
        this.getProjectContractMasterDetails(this.projectMasterContractId);
      });
    }
    else if (statusId == WorkFlowStatus.Void) {
      workFlowStatus.ApproverUserId = this.selectedPPCDetails.CurrentApproverUserId;
      this.genericService.VoidDocument(workFlowStatus).subscribe((data) => {
        this.PaymentHistoryOrderForm.get('ApprovalRemarks').setValue("");
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: successMessage,
          MessageType: MessageTypes.Success
        });
        // this.onCancelClick();
        this.getProjectContractMasterDetails(this.projectMasterContractId);
      });
    }
    else {
      workFlowStatus.ApproverUserId = this.selectedPPCDetails.CurrentApproverUserId;
      this.sharedServiceObj.workFlowClarificationReply(workFlowStatus).subscribe((data) => {
        this.PaymentHistoryOrderForm.get('ApprovalRemarks').setValue("");
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: successMessage,
          MessageType: MessageTypes.Success
        });
        this.onCancelClick();
        this.getProjectContractMasterDetails(this.projectMasterContractId);
      });
    }
  }
  recallPoApproval(reason: string) {
    let approvalObj = {
      DocumentId: this.paymentContractId,
      CreatedBy: this.userDetails.UserID,
      DocumentCode: this.selectedPPCDetails.DocumentCode,
      DocumentValue: this.selectedPPCDetails.Certificate.CPGrandTotal,
      DocumentTypeId: WorkFlowProcess.ProjectPaymentContract,
      //Supplier: this.selectedPODetails.Supplier,
      TotalAmount: this.selectedPPCDetails.TotalAmount,
      CurrentApproverUserName: this.selectedPPCDetails.CurrentApproverUserName,
      CreatedByUserName: this.selectedPPCDetails.CreatedBy,
      CurrentApproverUserId: this.selectedPPCDetails.CurrentApproverUserId,
      CompanyId: this.selectedPPCDetails.CompanyId,
      DocumentWFStatusId: WorkFlowStatus.CancelledApproval,
      CurrencySymbol: this.selectedPPCDetails.ProjectMasterContract.CurrencySymbol,
      Remarks: reason
    };
    this.genericService.RecallDocumentApproval(approvalObj).subscribe(() => {
      this.getProjectContractMasterDetails(this.projectMasterContractId);
      this.closeValidationPopUp();
      this.onCancelClick();
    });
  }

  attachmentDelete(attachmentIndex: number) {

    this.confirmationServiceObj.confirm({
      message: Messages.AttachmentDeleteConfirmation,
      header: Messages.DeletePopupHeader,
      accept: () => {
        let attachmentRecord = this.selectedPPCDetails.Attachments[attachmentIndex];
        attachmentRecord.IsDelete = true;
        this.selectedPPCDetails.Attachments = this.selectedPPCDetails.Attachments.filter((obj, index) => index > -1);
      },
      reject: () => {
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

  initPaymentSummary() {
    let paymentSummary = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
    paymentSummary.controls = [];
    this.popHelperService.getPaymentDescriptions().forEach((data) => {
      paymentSummary.push(this.preparePaymentSummaryrows(data));
    });
    this.PrepareRetentions();
  }
  preparePaymentSummaryrows(description: string) {
    let gridCols = this.formbuilderObj.group({
      Description: description,
      PrevPaid: 0,
      Retentions: this.formbuilderObj.array([]),
      Total: 0,
      CurrentPayment: 0
    });
    return gridCols;
  }
  PrepareRetentions() {
    let retentions: number = this.PaymentHistoryOrderForm.get('NoOfRetentions').value;
    let itemGroupControl2 = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
    itemGroupControl2.controls.forEach((data, index) => {
      let retentionControl = <FormArray>data.get("Retentions");
      retentionControl.controls = [];
      this.totalFormat = '';
      for (let i = 1; i <= retentions; i++) {
        let obj = this.initRetentionColumns(i, true);
        this.totalFormat += obj.get('Code').value + '+';
        retentionControl.push(obj);
      }
      let obj = this.initRetentionColumns(0, false);
      retentionControl.push(obj);
      this.totalFormat += obj.get('Code').value;
      this.totalFormat = '(' + this.totalFormat + ')';
    });
  }
  SetRetentions() {
    let noRetentionIndex = this.selectedPPCDetails.PreviousCertificate.Retentions.length - 1;
    if (this.PaymentHistoryOrderForm.get('PaymentNo').value > 1) {
      (<FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary']).controls.forEach((item, index) => {
        (<FormArray>item.get('Retentions')).controls.forEach((retItem, retIndex) => {
          if (this.selectedPPCDetails.PreviousCertificate.Retentions[retIndex]) {
            if (retItem.get('IsRetention').value && this.selectedPPCDetails.PreviousCertificate.Retentions[retIndex].IsRetention) {
              retItem.get('RetentionPercentage').setValue(this.selectedPPCDetails.PreviousCertificate.Retentions[retIndex].RetentionPercentage);
              retItem.get('RetentionAmount').setValue(this.selectedPPCDetails.PreviousCertificate.Retentions[retIndex].RetentionAmount);
            }
          }
        });
        (<FormArray>item.get('Retentions')).controls[(<FormArray>item.get('Retentions')).controls.length - 1].get('RetentionPercentage').setValue(this.selectedPPCDetails.PreviousCertificate.Retentions[noRetentionIndex].RetentionPercentage);
        (<FormArray>item.get('Retentions')).controls[(<FormArray>item.get('Retentions')).controls.length - 1].get('RetentionAmount').setValue(this.selectedPPCDetails.PreviousCertificate.Retentions[noRetentionIndex].RetentionAmount);
      });
    }
  }
  initRetentionColumns(index: number, isRetention: boolean) {
    let code = isRetention ? "A" + index : "B";
    let gridCols = this.formbuilderObj.group({
      Code: code,
      ProjectPaymentRetentionId: 0,
      ProjectPaymentItemId: 0,
      PaymentContractId: 0,
      IsRetention: [isRetention],
      RetentionName: [isRetention ? "Subject to Retention (" + code + ")" : "No Retention (B)"],
      RetentionPercentage: [(isRetention) ? this.selectedPOPDetails.RetentionPercentage : 0],
      RetentionAmount: [0]
    });
    return gridCols;
  }
  onRetentionAmountChange() {
    this.CalculatePaymentSummary();
    this.validateRetention();
  }
  validateRetention(): boolean {
    debugger
    let isValid = true;
    // let itemGroupControl2 = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
    // if (this.selectedPOPDetails.IsRetentionApplicable) {
    //   let maxLimit = Number(this.selectedPOPDetails.RetentionMaxLimit);
    //   this.currentRetentionSum = 0;
    //   itemGroupControl2.controls.forEach((data, rowIndex) => {
    //     if (rowIndex == 1) {
    //       let retentionControl = <FormArray>data.get("Retentions");
    //       retentionControl.controls.forEach((ret, colIndex) => {
    //         this.currentRetentionSum += Number(ret.get('RetentionAmount').value);
    //         this.showValidationPopup = (maxLimit < this.selectedPPCDetails.PreviousRetentionSum + this.currentRetentionSum);
    //         isValid = !this.showValidationPopup;
    //       });
    //       return isValid;
    //     }
    //   });
    // }

    let itemGroupControl2 = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
    if (this.selectedPOPDetails.IsRetentionApplicable) {
      let maxLimit = Number(this.selectedPOPDetails.RetentionMaxLimit);
      this.currentRetentionSum = 0;
      this.previousRetentionSum = 0;
      let retentionSumValid: boolean = false;
      let retentionReleaseValid: boolean = false;
      itemGroupControl2.controls.forEach((data, rowIndex) => {
        if (rowIndex == 1) {
          this.currentRetentionSum += Number(data.get('Total').value);
          this.previousRetentionSum += Number(data.get('PrevPaid').value);
          this.showValidationPopup = (maxLimit < (this.currentRetentionSum));
          retentionSumValid = !this.showValidationPopup;
        }
        if (rowIndex == 2) {
          let currentRelease: number = Number(data.get('Total').value);
          this.showRetentionReleasePopup = (this.currentRetentionSum < currentRelease);
          this.RetentionValidationMessage = this.showRetentionReleasePopup ? Messages.RetentionLessThan : '';
          if (currentRelease < 0 && !this.showRetentionReleasePopup) {
            this.showRetentionReleasePopup = (currentRelease > this.previousRetentionSum);
            this.RetentionValidationMessage = this.showRetentionReleasePopup ? Messages.RetentionGreaterThan : '';
          }
          retentionReleaseValid = !this.showRetentionReleasePopup;
        }
      });
      isValid = retentionSumValid && retentionReleaseValid;
      return isValid;
    }
    else {
      return isValid;
    }
  }
  validateRetentionRelease(): boolean {
    debugger
    let isValid = true;
    let itemGroupControl2 = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
    if (this.selectedPOPDetails.IsRetentionApplicable) {
      this.currentRetentionSum = 0;
      this.previousRetentionSum = 0;
      itemGroupControl2.controls.forEach((data, rowIndex) => {
        if (rowIndex == 1) {
          this.currentRetentionSum = Number(data.get('Total').value);
        }
        if (rowIndex == 2) {
          this.previousRetentionSum = Number(data.get('PrevPaid').value);
          let currentRelease: number = Number(data.get('Total').value);
          this.showRetentionReleasePopup = (this.currentRetentionSum < (Math.abs(currentRelease)));
          this.RetentionValidationMessage = this.showRetentionReleasePopup ? Messages.RetentionLessThan : '';
          if (currentRelease < 0 && !this.showRetentionReleasePopup) {
            this.showRetentionReleasePopup = (currentRelease > this.previousRetentionSum);
            this.RetentionValidationMessage = this.showRetentionReleasePopup ? Messages.RetentionGreaterThan : '';
          }
          isValid = !this.showRetentionReleasePopup;
          return isValid;
        }
      });
    }
    return isValid;
  }
  closeValidationPopUp() {
    this.showValidationPopup = false;
    this.showVoidOrRejectPopup = false;
    this.showMandatoryPopup = false;
    this.showRetentionReleasePopup = false;
  }
  displayLogPopUp() {
    this.showLogPopUp = true;
  }
  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
  CalculatePaymentSummary() {
    let itemGroupControl2 = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
    let workDoneAmount: number = 0;
    let workDoneSum: number = 0;
    let retentionPercentage: number = 0;
    let retentionCalculated: number = 0;
    let retentionSum: number = 0;
    let retentionAmount: number = 0;
    let netRetention: number = 0;
    let amountDueUnderthisCert: number = 0;
    let GST: number = 0;
    let grandTotal: number = 0;
    let _retentionReleaseValue: number = 0;
    let amountPaid: number = 0;
    itemGroupControl2.controls.forEach((data, rowIndex) => {
      retentionAmount = 0;
      if (rowIndex == 0) {
        let retentionControl = <FormArray>data.get("Retentions");
        retentionControl.controls.forEach((ret, colIndex) => {
          workDoneAmount = Number(ret.get('RetentionAmount').value) || 0;
          retentionPercentage = Number(ret.get('RetentionPercentage').value) || 0;
          workDoneSum += workDoneAmount;
          let controls = (<FormArray>(itemGroupControl2.controls[rowIndex + 1]).get('Retentions'));
          if (<boolean>ret.get('IsRetention').value && workDoneAmount > 0 && retentionPercentage > 0) {
            retentionAmount = Number(((retentionPercentage * workDoneAmount) / 100).toFixed(2));
            controls.controls[colIndex].get('RetentionAmount').setValue(retentionAmount);
          }
          else {
            controls.controls[colIndex].get('RetentionAmount').setValue(0);
          }
        });
        data.get('Total').setValue(workDoneSum.toFixed(2));
      }
      if (rowIndex == 1) {
        let retentionControl = <FormArray>data.get("Retentions");
        retentionControl.controls.forEach((ret) => {
          retentionCalculated += Number(ret.get('RetentionAmount').value);
        });

        data.get('Total').setValue(retentionCalculated.toFixed(2));
      }
      // if (rowIndex == 1 || rowIndex == 2) {
      //   retentionSum += Number(data.get('Total').value);
      //   if (this.PaymentHistoryOrderForm.get('PaymentNo').value > 1 && rowIndex == 2) {
      //     let retentionSumPrevReleased = Number(data.get('PrevPaid').value);
      //     let retentionSumReleasedInTheMonth = Number(itemGroupControl2.controls[4].get('PrevPaid').value);
      //     data.get('Total').setValue((retentionSumPrevReleased + retentionSumReleasedInTheMonth).toFixed(2));
      //   }
      // }
      if (rowIndex == 2) {
        _retentionReleaseValue = Math.abs(Number(data.get('Total').value)) || 0;
        _retentionReleaseValue = _retentionReleaseValue > 0 ? (-(_retentionReleaseValue)) : _retentionReleaseValue;
        netRetention = retentionCalculated + _retentionReleaseValue;
        data.get('Total').setValue(_retentionReleaseValue);
      }
      if (rowIndex == 3) {
        data.get('Total').setValue(netRetention.toFixed(2));
      }
      if (rowIndex == 4) {
        amountPaid = workDoneSum - netRetention;
        data.get('Total').setValue(amountPaid.toFixed(2));
      }
      // if (rowIndex == 5) {
      //   data.get('Total').setValue(netRetention.toFixed(2));
      // }
      // if (rowIndex == 6) {
      //   let amountDueUnderThisCertificate = Number(itemGroupControl2.controls[7].get('PrevPaid').value);
      //   data.get('Total').setValue(amountDueUnderThisCertificate.toFixed(2));
      // }
      // if (rowIndex == 7) {
      //   amountDueUnderthisCert = workDoneSum - netRetention - Number(itemGroupControl2.controls[7].get('PrevPaid').value);
      //   data.get('Total').setValue(amountDueUnderthisCert.toFixed(2));
      // }
      if (rowIndex == 5) {
        let taxRate: number = Number(this.selectedPOPDetails.TaxAmount);
        GST = (amountPaid * taxRate) / 100;
        data.get('Total').setValue(GST.toFixed(2));
      }
      if (rowIndex == 6) {
        let _adjustment = data.get('Total');
        _adjustment.setErrors(null);
        if (Number(_adjustment.value) >= 1) {
          _adjustment.setErrors({ "required": true });
        }
        grandTotal = amountPaid + GST + Number(_adjustment.value);
      }
      if (rowIndex == 7) {
        data.get('Total').setValue(grandTotal.toFixed(2));
      }
      data.get('CurrentPayment').setValue(this.getCurrentPayment(data));
    });
    this.CalculateDistributionSummary();
    this.validatePaymentSummary();
  }

  getCurrentPayment(data: AbstractControl): number {
    return (data.get('Total').value || 0) - (data.get('PrevPaid').value || 0);
  }
  CalculateDistributionSummary() {
    let paymentSummary = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
    let totalBefTax = this.selectedPOPDetails.TotalBefTax;
    let netRetention = 0;
    let amountDueUnderthisCert = 0;
    let distributionPercentage: number = 0;
    this.distributionPercentageSum = 0;
    let certificationAmount: number = 0;
    this.certificationSum = 0;
    this.payContractSum = 0;
    this.retentionSum = 0;
    paymentSummary.controls.forEach((data, rowIndex) => {
      if (rowIndex == 5) {
        netRetention = Number(data.get('Total').value);
      }
      if (rowIndex == 7) {
        amountDueUnderthisCert = Number(data.get('Total').value);
      }
    });
    this.selectedPOPDetails.POPDistributionSummaryItems.forEach((data: POPDistributionSummary) => {
      distributionPercentage = Number(data.DistributionPercentage) || 0;
      if (amountDueUnderthisCert != 0) {
        certificationAmount = ((distributionPercentage * amountDueUnderthisCert) / 100);
        data.ThisCertification = Number(certificationAmount.toFixed(2));
      }
      data.PayContractAmount = Number(((distributionPercentage * totalBefTax) / 100)).toFixed(2);
      data.RetentionAmount = Number(((distributionPercentage * netRetention) / 100).toFixed(2));
      this.payContractSum += Number(data.PayContractAmount);
      this.distributionPercentageSum += distributionPercentage;
      this.certificationSum += Number(data.ThisCertification);
      this.retentionSum += Number(data.RetentionAmount);
    });
  }
  validatePaymentSummary() {
    let contractItems = <FormArray>this.PaymentHistoryOrderForm.controls['ProjectMasterContractItems'];
    let paymentSummary = <FormArray>this.PaymentHistoryOrderForm.controls['PaymentSummary'];
    let DiscountLineItems = <FormArray>this.PaymentHistoryOrderForm.controls['DiscountLineItems'];
    let workDoneSum = 0;
    let disSubTotal = 0;
    let contractSum = 0;
    (<FormArray>paymentSummary.controls[0].get("Retentions")).controls.forEach((ret) => {
      let val = Number(ret.get('RetentionAmount').value).toFixed(2);
      workDoneSum = parseFloat(Number(workDoneSum).toFixed(2)) + parseFloat(val);
    });
    if (contractItems != undefined) {
      contractItems.controls.forEach(data => {
        let val = Number(data.get('AccumulatedPayment').value).toFixed(2);
        contractSum = parseFloat(Number(contractSum).toFixed(2)) + parseFloat(val);
      });
    }
    if (DiscountLineItems != undefined) {
      DiscountLineItems.controls.forEach(data => {
        let val = Number(data.get('AccumulatedPayment').value).toFixed(2);
        disSubTotal = parseFloat(Number(disSubTotal).toFixed(2)) + parseFloat(val);
      });
    }
    if (contractSum == 0) {
      this.IsPaymentSummaryValid = true;
    }
    else {
      this.IsPaymentSummaryValid = (workDoneSum.toFixed(2) == (contractSum + disSubTotal).toFixed(2) && workDoneSum > 0) ? true : false;
    }
  }
  printRecord(paymentContractId: number) {
    this.router.navigate(['po/projectpaymentreport/' + this.projectMasterContractId + '/' + paymentContractId]);
  }
  exportRecord(paymentContractId: number) {
    this.reportParams = {
      UserId: this.userDetails.UserID,
      Type: 'export',
      DocumentsData: [{ POPId: this.projectMasterContractId, PaymentContractId: this.paymentContractId }]
    };
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
    this.projectContractPaymentServiceObj.getProjectPaymentReport(this.reportParams).subscribe((result: ProjectPaymentExport) => {
      if (result != null) {
        this.reportData = result;
        let invoiceIndex = 0;
        let invoiceDetailsIndex = 0;
        this.reportData.TypeOfCostLineItems.forEach((element) => {
          ws1DataDetails.push(this.bindInvoice(element, invoiceIndex, '1'));
          invoiceIndex = invoiceIndex + 1;
        });
        this.reportData.TypeOfCostLineItems.forEach((element) => {
          if (element.IsRetentionApplicable) {
            ws1DataDetails.push(this.bindInvoice(element, invoiceIndex, 'RT'));
            invoiceIndex = invoiceIndex + 1;
          }
        });
        this.reportData.TypeOfCostLineItems.forEach((element) => {
          ws2DataDetails.push(this.bindInvoiceDetails(element, invoiceDetailsIndex, '1'));
          invoiceDetailsIndex = invoiceDetailsIndex + 1;
        });
        this.reportData.TypeOfCostLineItems.forEach((element) => {
          if (element.IsRetentionApplicable) {
            ws2DataDetails.push(this.bindInvoiceDetails(element, invoiceDetailsIndex, 'RT'));
            invoiceDetailsIndex = invoiceDetailsIndex + 1;
          }
        });
        this.reportData.TypeOfCostLineItems.map((x) => {
          ws3DataDetails.push(this.bindInvoicePaymentSchedules(x));
        });
        this.reportData.TypeOfCostLineItems.map((x) => {
          ws4DataDetails.push(this.bindInvoiceOptionalDetails(x));
        });
        this.reportData.TypeOfCostLineItems.map((x) => {
          ws5DataDetails.push(this.bindInvoiceDetailsOptionalDetails(x));
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
          let ExcelExportFileName = "Exportinvoice_" + (new Date().getDate()) + ".xlsx";
          saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), ExcelExportFileName);
          let workFlowDetails: WorkFlowApproval = {
            ProcessId: WorkFlowProcess.ProjectPaymentContract,
            CompanyId: this.companyId,
            DocumentId: this.paymentContractId,
            WorkFlowStatusId: WorkFlowStatus.Exported,
            ApproverUserId: 0,
            DocumentCode: '',
            Remarks: '',
            UserId: this.userDetails.UserID
        };
          this.genericService.UpdateDocumentStatus(workFlowDetails).subscribe((x: boolean) => {
            this.getProjectContractMasterDetails(this.projectMasterContractId);
          });
        };
        req.send();
      }
    });
  }
  bindInvoice(element: TypeOfCostLineItem, index: number, type: string) {
    let BASETAX1: number = element.ADUCCurrentPayment;
    let AMTTAX1: number = element.GSTAMountCurrentPayment + element.GSTAdjustmentCurrentPayment;
    let AMTGROSDST: number = BASETAX1 + AMTTAX1;
    return {
      'CNTBTCH': '1',
      'CNTITEM': index + 1,
      'IDVEND': type == 'RT' ? element.RetentionSupplierId : element.PaymentSupplierId,
      'IDINVC': element.InvoiceDescription,
      'TEXTTRX': (element.TBTCurrentPayment == 0 && type == 'RT') ? '3' : '1',
      'ORDRNBR': '',
      'PONBR': element.PaymentDocumentCode,
      'INVCDESC': element.ExpInvoiceDescription,
      'INVCAPPLTO': '',
      'IDACCTSET': type == 'RT' ? element.RetentionAccountSetId : element.AccountSetId,
      'DATEINVC': element.SupplierInvoiceDate,
      'FISCYR': new Date().getFullYear(),
      'FISCPER': new Date().getMonth() + 1,
      'CODECURN': element.DocumentCurrency,
      'EXCHRATE': '',
      'TERMCODE': (element.TBTCurrentPayment == 0 && type == 'RT') ? '' : element.PaymentTerm,
      'DATEDUE': (element.TBTCurrentPayment == 0 && type == 'RT') ? element.SupplierInvoiceDate : element.InvoiceDueDate,
      'CODETAXGRP': type == 'RT' ? element.RetTaxGroup : element.TaxGroup,
      'TAXCLASS1': type == 'RT' ? element.RetTaxClass : element.TaxClass,
      'BASETAX1': type == 'RT' ? Math.abs(element.NRCurrentPayment).toFixed(2) : (BASETAX1).toFixed(2),
      'AMTTAX1': type == 'RT' ? 0 : (AMTTAX1).toFixed(2),
      'AMTTAXDIST': type == 'RT' ? 0 : (AMTTAX1).toFixed(2),
      'AMTINVCTOT': type == 'RT' ? Math.abs(element.NRCurrentPayment).toFixed(2) : (BASETAX1).toFixed(2),
      'AMTTOTDIST': type == 'RT' ? Math.abs(element.NRCurrentPayment).toFixed(2) : (BASETAX1).toFixed(2),
      'AMTGROSDST': type == 'RT' ? Math.abs(element.NRCurrentPayment).toFixed(2) : (AMTGROSDST).toFixed(2),
      'AMTDUE': type == 'RT' ? Math.abs(element.NRCurrentPayment).toFixed(2) : (AMTGROSDST).toFixed(2),
      'AMTTAXTOT': type == 'RT' ? 0 : (AMTTAX1).toFixed(2),
      'AMTGROSTOT': type == 'RT' ? Math.abs(element.NRCurrentPayment).toFixed(2) : (AMTGROSDST).toFixed(2)
    }
  }
  bindInvoiceDetails(element: TypeOfCostLineItem, index: number, type: string) {
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
  bindInvoicePaymentSchedules(x: TypeOfCostLineItem): any {
    return {
      'CNTBTCH': '',
      'CNTITEM': '',
      'CNTPAYM': '',
      'DATEDUE': '',
      'AMTDUE': ''

    };
  }
  bindInvoiceOptionalDetails(x: TypeOfCostLineItem) {
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
  bindInvoiceDetailsOptionalDetails(x: TypeOfCostLineItem) {
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
  setContractDate(endDate: Date, startDate: Date) {
    let contractTerms: string = this.utilService.getContractDuration(startDate, endDate);
    this.PaymentHistoryOrderForm.get('ContractTerms').setValue(contractTerms);
    this.selectedPOPDetails.ContractTerms = contractTerms;
  }
}
