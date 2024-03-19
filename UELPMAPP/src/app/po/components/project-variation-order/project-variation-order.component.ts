import { Component, OnInit, ViewChild, Renderer, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgbDateAdapter, NgbDateNativeAdapter, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { ProjectMasterContract, ProjectMasterContractDisplayResult, CostTypes, POPCostCategory, ProjectContractMasterFilterModel, POPApportionment, ApportionmentDetails } from '../../models/project-contract-master.model';
import { SharedService } from '../../../shared/services/shared.service';
import { RequestDateFormatPipe } from "../../../shared/pipes/request-date-format.pipe";
import { Suppliers, PagerConfig, Messages, MessageTypes, UserDetails, WorkFlowStatus, WorkFlowStatusModel, Companies, Taxes, WorkFlowApproval, WorkFlowProcess } from '../../../shared/models/shared.model';
import { ProjectContractVariationApiService } from '../../services/project-contract-variation.api.service';
import { FullScreen, restrictMinus } from '../../../shared/shared';
import { AccountCode, AccountCodeMaster } from '../../models/account-code.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { CostCentre } from '../../../inventory/models/cost-centre.model';
import { WorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { TaxGroup } from '../../models/tax.model';
import { TaxService } from '../../services/tax.service';
import * as moment from 'moment';
import { ProjectContractMasterService } from '../../services/project-contract-master.service';
import { POPHelperService } from '../../helpers/pop-helper.service';
import { ProjectContractVariationOrder, ProjectContractVariationOrderItems, ProjectContractVariationOrderFilterModel, ProjectContractVariationOrderDisplayResult, VariationOrder } from '../../models/project-variation-order.model';
import { Router } from '@angular/router';
import { PageAccessLevel, Roles } from '../../../../app/administration/models/role';
import { PMCGridColumns } from '../../models/project-payment-history.model';
import { GenericService } from '../../../shared/sevices/generic.service';
import { ConfirmationService } from 'primeng/api';
import { AccountCodeAPIService } from '../../services/account-code-api.service';


@Component({
  selector: 'app-project-variation-order',
  templateUrl: './project-variation-order.component.html',
  styleUrls: ['./project-variation-order.component.css'],
  providers: [ProjectContractMasterService, TaxService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ProjectVariationOrderComponent implements OnInit {
  pageTitle = "Project Contract Variation Order";
  companyId: number = 0;
  currentPage: number = 0;
  pageType: string = '';
  errorMessage: string = Messages.NoRecordsToDisplay;
  selectedProjectContractVariationOrderId = 0;
  costTypes: Array<POPCostCategory> = [];
  apportionments: Array<POPApportionment> = [];
  expenses: Array<AccountCodeMaster> = [];
  projectContractVariationOrderList: Array<ProjectContractVariationOrder> = [];
  taxGroups: Array<TaxGroup> = [];
  taxTypes: Array<Taxes> = [];
  projectContractVariationColumns: Array<{ field: string, header: string, width?: string }> = [];
  projectContractVariationOrderForm: FormGroup;
  selectedPCVariationOrderDetails: ProjectContractVariationOrder;
  contractVariationOrderPagerConfig: PagerConfig;
  selectedVODetails: ProjectContractVariationOrder = new ProjectContractVariationOrder();
  contractVariationSearchKey: string = "";
  requestType: string = "";
  userRoles = [];
  rolesAccessList = [];
  workFlowStatus: any;
  isApprovalPage: boolean = false;
  showLeftPanelLoadingIcon: boolean = false;
  projectContractVariationFilterInfoForm: FormGroup;
  filterMessage: string = "";
  isFilterApplied: boolean = false;
  showFilterPopUp: boolean = false;
  leftSection: boolean = false;
  rightSection: boolean = false;
  scrollbarOptions: any;
  showGridErrorMessage: boolean = false;
  gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
  selectedProjectMasterContractDetails: ProjectMasterContract;
  workFlowStatuses: Array<WorkFlowStatusModel> = [];
  projectContractData: any[] = [];
  projectVariationContractData: any[] = [];
  projectContractSubTotalGST: any[] = [];
  todaydate = new Date();
  cureencySymbol: string = "S$ ";
  linesToAdd: number = 2;
  isExisted: boolean = false;
  editpermissions: boolean = false;
  CostTypes: any[] = [];
  ApportionMentsData: any[] = [];
  newRecord: boolean = false;
  public innerWidth: any;
  povariations = ['Test Contract'];
  model: any;
  moduleHeading: string = '';
  pMCGridColumns: Array<{ field: string, header: string }> = [];
  projectPoList: Array<ProjectMasterContract> = [];
  userDetails: UserDetails = null;
  selectedPODetails: ProjectMasterContract = new ProjectMasterContract();
  voId: number = 0;
  IsViewMode: boolean = true;
  projectMasterContractId: number = 0;
  WorkFlowStatusId: number = 0;
  doUpdate: boolean = false;
  showLogPopUp: boolean = false;
  verifyPermission: boolean = false;
  approvePermission: boolean = false;
  expenseAccountCodeCategories = [];
  accountCategoryId: number = 0;
  selectedRowId: number = -1;
  typeofCostCategaries = [];
  typeofApportionmentMethods = [];
  constructor(private formbuilderObj: FormBuilder,
    private sharedServiceObj: SharedService,
    private el: ElementRef,
    private projectContractVariationAPIService: ProjectContractVariationApiService,
    private projectContractMasterAPIService: ProjectContractMasterService,
    private sessionService: SessionStorageService,
    private taxService: TaxService,
    private reqDateFormatPipe: RequestDateFormatPipe,
    public activatedRoute: ActivatedRoute,
    public route: ActivatedRoute,
    private popHelperService: POPHelperService,
    private router: Router,
    private confirmationServiceObj: ConfirmationService,
    private genericService: GenericService,
    private accountCodeAPIService: AccountCodeAPIService,
    private renderer: Renderer) {
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.selectedPODetails = new ProjectMasterContract();
    this.projectContractVariationOrderForm = this.formbuilderObj.group({
      ProjectContractVariationOrderId: [0],
      POVariationOrderCode: [""],
      ProjectMasterContractId: [0],
      POPMasterCode: [""],
      ProjectName: [""],
      ContractStartDate: [new Date()],
      ContractEndDate: [new Date()],
      ContractTerms: [""],
      OriginalContractSum: [0],
      TotalVOSum: [0, Validators.required],
      AdjustedContractSum: [0],
      IsRetentionApplicable: [false],
      RetentionPercentage: [0],
      RetentionMaxLimit: [0],
      TaxAuthorityId: [0],
      TaxId: [0],
      TaxGroupId: [0],
      Remarks: [""],
      LocationId: [0],
      Departments: [[]],
      SupplierId: [''],
      SupplierSubCodes: [''],
      SupplierAddress: [''],
      TypeofService: [''],
      retentionSupplierId: [''],
      SupplierSubCodeId: [null],
      ServiceType: [null],
      RetentionSupplierCode: [""],
      ExpensesTypeId: [0],
      SupplierSubCode: [null],
      ApprovalRemarks: [""],
      TaxAmount: [0],
      TotalAmount: [0],
      TotalTax: [0],
      TaxRate: [0],
      RetentionTypeId: [0],
      ProjectMasterContract: [null],
      ProjectContractVariationOrderItems: this.formbuilderObj.array([]),
      ProjectContractVariationOrderDiscountItems: this.formbuilderObj.array([]),
      POPCostCategory: this.formbuilderObj.array([]),
      POPApportionment: this.formbuilderObj.array([]),
      CompanyId: [0],
      SubTotal: [0],
      Discount: [0],
      GST: [0],
      IsDeleted: false,
      SubTotalVOSum: [0],
      SubTotalRevisedContractValue: [0],
      TotalBefTaxRevisedContractValue: [0],
      TaxRevisedContractValue: [0],
      TotalRevisedContractValue: [0],
      WorkFlowStatusId: [0]
    });
    this.selectedPCVariationOrderDetails = new ProjectContractVariationOrder();
    this.workFlowStatus = WorkFlowStatus;
    this.contractVariationOrderPagerConfig = new PagerConfig();
    this.resetPagerConfig();

    this.projectContractVariationColumns = [
      { field: 'Sno', header: 'S.no.' },
      { field: 'ItemDescription', header: 'Description' },
      { field: 'AccountCodeName', header: 'Expense Category' },
      { field: 'AccountCode', header: 'Acccount Code' },
      { field: 'POPCostCategoryId', header: 'Type of Cost' },
      { field: 'POPApportionmentId', header: 'Apportionment Method' },
      { field: 'ContractValue', header: 'Original Contract Value' },
      { field: 'TotalVOSum', header: 'Total VO sum' },
      { field: 'RevisedContractValue', header: 'Revised Contract Value' }];

    this.companyId = this.sessionService.getCompanyId();
  }
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.companyId = isNaN(Number(params['cid'])) ? this.companyId : Number(params['cid']);
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
      debugger
      this.projectMasterContractId = Number(param.get('popid'));
      this.voId = Number(param.get('id'));
      this.pageType = param.get('type');
      this.moduleHeading = this.pageType == "request" ? "Project Variation Order List" : "Project Variation Order Approval List";
      this.isApprovalPage = this.pageType == "approval" ? true : false;
    });

    //this.getProjectContractVariationOrderList(0);

    this.sharedServiceObj.CompanyId$.subscribe((data) => {
      if (this.companyId != data) {
        this.companyId = data;
      }
    });
    this.getVODetailsbyId(this.projectMasterContractId);
    this.getAccountCodeCategories(this.companyId);
  }
  getVODetailsbyId(ProjectMasterContractId: any) {
    this.selectedVODetails = this.projectContractVariationOrderForm.value;
    this.projectMasterContractId = ProjectMasterContractId;
    this.IsViewMode = this.voId == 0 ? false : true;
    this.projectContractVariationAPIService.getVODetailsbyId(this.projectMasterContractId, this.voId).subscribe((result: ProjectContractVariationOrder) => {
      if (result != null) {
        this.projectMasterContractId = result.POPId == 0 ? this.projectMasterContractId : result.POPId;
        this.selectedPODetails = <ProjectMasterContract>result.ProjectMasterContract;
        debugger
        if (this.voId > 0 && this.projectMasterContractId > 0) {
          if (result.ProjectContractVariationOrderItems.length > 0 || result.ProjectContractVariationOrderItems.length == null) {
            this.addGridItem(result.ProjectContractVariationOrderItems.length, "ProjectContractVariationOrderItems");
          }
          if (this.selectedPODetails.DiscountLineItems.length > 0 || this.selectedPODetails.DiscountLineItems.length == null) {
            this.addGridItem(this.selectedPODetails.DiscountLineItems.length, "ProjectContractVariationOrderDiscountItems");
          }

          this.projectContractVariationOrderForm.patchValue({
            "ProjectContractVariationOrderItems": result.ProjectContractVariationOrderItems,
            "ProjectContractVariationOrderDiscountItems": this.selectedPODetails.DiscountLineItems
          });
          this.typeofCostCategaries = this.selectedPODetails.POPCostCategory.map(value => value.TypeOfCost);
          this.typeofApportionmentMethods = this.selectedPODetails.POPApportionment.map(value => value.Method);
        }
        else {
          if (result.ProjectMasterContract.ProjectMasterContractItems.length > 0 || result.ProjectMasterContract.ProjectMasterContractItems.length == null) {
            this.addGridItem(result.ProjectMasterContract.ProjectMasterContractItems.length, "ProjectContractVariationOrderItems");
          }
          if (this.selectedPODetails.DiscountLineItems.length > 0 || this.selectedPODetails.DiscountLineItems.length == null) {
            this.addGridItem(this.selectedPODetails.DiscountLineItems.length, "ProjectContractVariationOrderDiscountItems");
          }
          this.projectContractVariationOrderForm.patchValue({
            "ProjectContractVariationOrderItems": this.selectedPODetails.ProjectMasterContractItems,
            "ProjectContractVariationOrderDiscountItems": this.selectedPODetails.DiscountLineItems
          });
        }



        this.selectedVODetails = <ProjectContractVariationOrder>result;
        this.projectContractVariationOrderForm.get('ProjectContractVariationOrderId').setValue(this.selectedVODetails.ProjectContractVariationOrderId);


        this.calculateRevisedContractValue(0, null);
      }
    });


    // });
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
                let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectvariationorderapproval")[0];
                if (formRole != null) {
                  this.verifyPermission = formRole.IsVerify;
                  this.approvePermission = formRole.IsApprove;
                }
                else {
                  this.verifyPermission = false;
                  this.approvePermission = false;
                }
              }
              else {
                this.verifyPermission = false;
                this.approvePermission = false;
              }
            }
          });
        }
      });
    }
  }
  getWorkFlowStatus() {
    this.sharedServiceObj.getWorkFlowStatus(WorkFlowProcess.InventoryPO).subscribe((data: Array<WorkFlowStatusModel>) => {
      this.workFlowStatuses = data;
    });
  }

  getCostTypes(projectContractMasterId: number) {
    let costTypesResult = <Observable<Array<any>>>this.projectContractVariationAPIService.getProjectContractCostTypes(projectContractMasterId);
    costTypesResult.subscribe((data: Array<POPCostCategory>) => {
      if (data != null && data.length > 0) {
        this.costTypes = data;
      }
    });
  }

  getApportionmentMethods(projectContractMasterId: number) {
    let apportionmentMethosResult = <Observable<Array<any>>>this.projectContractVariationAPIService.getProjectContractCostTypes(projectContractMasterId);
    apportionmentMethosResult.subscribe((data: Array<POPApportionment>) => {
      if (data != null && data.length > 0) {
        this.apportionments = data;
      }
    });
  }

  resetPagerConfig() {
    this.contractVariationOrderPagerConfig.RecordsToSkip = 0;
    this.contractVariationOrderPagerConfig.RecordsToFetch = 10;
    this.currentPage = 1;
  }

  restrictMinusValue(e: any) {
    restrictMinus(e);
  }

  cancelRecord() {
    this.router.navigate(['po/projectvariationorderlist/' + this.pageType]);
  }
  onVerify() {
    this.editRecord();
    this.doUpdate = true;
  }

  getProjectPOList(projectMasterContractId: number) {
    this.projectContractMasterAPIService.GetProjectMasterApprovedDetails(this.companyId, this.userDetails.UserID).subscribe((data: ProjectMasterContractDisplayResult) => {
      if (data != null && data.ProjectMasterContractList.length > 0) {
        debugger
        this.projectPoList = data.ProjectMasterContractList;

      }

    });
  }




  removeGridItem(rowIndex: number) {
  }

  resetData() {
    this.projectContractVariationOrderForm.reset();
    this.projectContractVariationOrderForm.setErrors(null);
    let varioanOrderControl = <FormArray>this.projectContractVariationOrderForm.controls['ProjectContractVariationOrderItems'];
    varioanOrderControl.controls = [];
    varioanOrderControl.controls.length = 0;
  }
  onDatePickerFocus(element: NgbInputDatepicker, event: any) {
    if (!element.isOpen()) {
      element.open();
    }
  }
  editRecord() {
    this.IsViewMode = false;
  }

  recallPoApproval() {
    let approvalObj = {
      DocumentId: this.voId,
      CreatedBy: this.selectedVODetails.CreatedBy,
      DocumentCode: this.selectedVODetails.DocumentCode,
      DocumentTypeId: WorkFlowProcess.ProjectContractVariationOrder,
      TotalAmount: this.selectedVODetails.TotalAmount,
      CurrentApproverUserName: this.selectedVODetails.CurrentApproverUserName,
      CreatedByUserName: this.selectedVODetails.CreatedBy,
      CurrentApproverUserId: this.selectedVODetails.CurrentApproverUserId,
      CompanyId: this.selectedVODetails.CompanyId,
      DocumentWFStatusId: WorkFlowStatus.CancelledApproval
    };
    this.genericService.RecallDocumentApproval(approvalObj).subscribe(() => {
      this.getVODetailsbyId(this.projectMasterContractId);
    });
  }

  addGridItem(noOfLines: number, gridFAName: string) {
    //this.showGridErrorMessage = false;
    let contactGroupControl = <FormArray>this.projectContractVariationOrderForm.controls[gridFAName];
    for (let i = 0; i < noOfLines; i++) {
      if (gridFAName == "ProjectContractVariationOrderItems") {
        contactGroupControl.push(this.initGridRows());
      }
      else if (gridFAName == "ProjectContractVariationOrderDiscountItems") {
        contactGroupControl.push(this.initGridRows1());
      }
    }
  }

  projectContractInputFormater = (x: ProjectMasterContract) => x.POPMasterCode;
  projectContractSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term == "") {
          this.resetData();
          this.selectedPCVariationOrderDetails = new ProjectContractVariationOrder();
          this.selectedPCVariationOrderDetails.ProjectContractVariationOrderId = 0;

          return of([]);
        }
        return this.sharedServiceObj.getAllSearchProjectContracts({
          Search: term,
          CompanyId: this.companyId,
          RequestFrom: WorkFlowProcess.ProjectContractVariationOrder,
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

  // onProjectContractChange(event?: any) {
  //   let masterContractDetails: ProjectMasterContract;
  //   if (event != null && event != undefined) {
  //     masterContractDetails = event.item;
  //   }

  //   this.projectContractVariationOrderForm.patchValue({
  //     'ProjectMasterContractId': masterContractDetails.ProjectMasterContractId
  //   });

  //   //getting Project Contract Line times
  //   this.projectContractMasterAPIService.getProjectMasterContractDetails(masterContractDetails.ProjectMasterContractId).subscribe((data: ProjectMasterContract) => {

  //     if (data != null) {
  //       this.selectedProjectMasterContractDetails = data;
  //       this.selectedPCVariationOrderDetails.ProjectName = this.selectedProjectMasterContractDetails.ProjectName;
  //       this.selectedPCVariationOrderDetails.POPMasterCode = this.selectedProjectMasterContractDetails.POPMasterCode;
  //       this.selectedPCVariationOrderDetails.Supplier = this.selectedProjectMasterContractDetails.Supplier;
  //       this.selectedPCVariationOrderDetails.ProjectMasterContractId = this.selectedProjectMasterContractDetails.ProjectMasterContractId;
  //       this.costTypes = this.selectedProjectMasterContractDetails.POPCostCategory;
  //       this.apportionments = this.selectedProjectMasterContractDetails.POPApportionment;
  //       this.selectedPCVariationOrderDetails.CompanyId = this.companyId;
  //       //let projectVariationOrderItem: ProjectContractVariationOrderItems;
  //       this.selectedPCVariationOrderDetails.ProjectContractVariationOrderItems = [];
  //       this.selectedProjectMasterContractDetails.ProjectMasterContractItems.forEach(item => {      
  //         let projectVariationOrderItem: ProjectContractVariationOrderItems = {
  //           ProjectContractVariationOrderId: 0,
  //           ProjectMasterContractItemId: item.ProjectMasterContractItemId,
  //           ProjectContractVariationOrderItemId: 0,
  //           AccountCodeId: item.AccountCodeId,
  //           ContractValue: item.ContractValue,
  //           AccountCodeName: item.AccountCodeName,
  //           AccountCode: item.AccountCode,
  //           ItemDescription: item.ItemDescription,
  //           POPCostCategoryId: 0,
  //           TypeOfCostName: '',
  //           POPApportionmentId: 0,
  //           ApportionmentMethod: '',
  //           TotalVOSum: 0,
  //           RevisedContractValue: item.ContractValue,
  //           Discount: 0,
  //           TaxID: 0,
  //           TaxGroupId: 0,
  //           Expense:null
  //         };

  //         this.selectedPCVariationOrderDetails.ProjectContractVariationOrderItems.push(projectVariationOrderItem);
  //       });


  //       if (this.selectedPCVariationOrderDetails.ProjectContractVariationOrderItems != undefined) {
  //         this.addGridItem(this.selectedPCVariationOrderDetails.ProjectContractVariationOrderItems.length,null);
  //       }

  //       this.projectContractVariationOrderForm.patchValue(this.selectedPCVariationOrderDetails);

  //       let subTotal = this.getSubTotal();
  //       this.projectContractVariationOrderForm.get('SubTotal').setValue(subTotal);
  //       this.calculateTotalPrice();
  //     }
  //   });

  // }

  calculateRevisedContractValue(rowIndex: number, gridRow: any) {
    debugger
    let totalVOSubTotal = 0;
    let revisedSubTotal = 0;
    let totalDisRevValue = 0;
    let totlBefTaxValue = 0;
    let taxValue = 0;


    let contactGroupControl = <FormArray>this.projectContractVariationOrderForm.controls['ProjectContractVariationOrderItems'];
    let value = contactGroupControl.controls[rowIndex].get('ContractValue').value;
    let contractValue = contactGroupControl.controls[rowIndex].get('TotalVOSum').value;
    contactGroupControl.controls[rowIndex].get('RevisedContractValue').setValue(Number(contractValue) + Number(value));

    contactGroupControl.controls.forEach(data => {
      totalVOSubTotal = totalVOSubTotal + data.get('TotalVOSum').value;
      revisedSubTotal = revisedSubTotal + data.get('RevisedContractValue').value;
    });
    this.projectContractVariationOrderForm.get('SubTotalVOSum').setValue(totalVOSubTotal);
    this.projectContractVariationOrderForm.get('SubTotalRevisedContractValue').setValue(revisedSubTotal);

    let discountControl = <FormArray>this.projectContractVariationOrderForm.controls['ProjectContractVariationOrderDiscountItems'];
    discountControl.controls.forEach(data => {
      totalDisRevValue = totalDisRevValue + data.get('DiscountValue').value;
      totlBefTaxValue = this.projectContractVariationOrderForm.get('SubTotalRevisedContractValue').value - totalDisRevValue;
      this.projectContractVariationOrderForm.get('TotalBefTaxRevisedContractValue').setValue(totlBefTaxValue);

    });
    taxValue = (this.projectContractVariationOrderForm.get('TotalBefTaxRevisedContractValue').value * this.selectedPODetails.TaxAmount) / 100;
    this.projectContractVariationOrderForm.get('TaxRevisedContractValue').setValue(taxValue);


  }


  calculateTotalPrice() {
    let subTotal = this.getSubTotal();
    let discount = this.projectContractVariationOrderForm.get('Discount').value;
    let gst = this.projectContractVariationOrderForm.get('GST').value;
    let totalTax = 0;
    //this.purchaseOrderForm.get('TotalTax').setValue(totalTax);
    let totalPrice = (subTotal - discount) + totalTax + gst;
    this.projectContractVariationOrderForm.get('TotalAmount').setValue(totalPrice);
  }

  getSubTotal() {
    let contactGroupControl = <FormArray>this.projectContractVariationOrderForm.controls['ProjectContractVariationOrderItems'];

    if (contactGroupControl != undefined) {
      let subTotal = 0;
      contactGroupControl.controls.forEach(data => {
        subTotal = subTotal + (data.get('ContractValue').value + data.get('TotalVOSum').value);
      });
      return subTotal;
    }
  }

  getProjectContractVariationOrderList(ProjectContractVariationOrderId: number) {
    debugger
    let obj = {
      Skip: this.contractVariationOrderPagerConfig.RecordsToSkip,
      Take: this.contractVariationOrderPagerConfig.RecordsToFetch,
      CompanyId: this.companyId
    };
    this.projectContractVariationAPIService.getProjectContractVariationOrders(obj).subscribe((data: ProjectContractVariationOrderDisplayResult) => {
      if (data != null) {
        if (data.ProjectContractVariationOrderList != null && data.ProjectContractVariationOrderList.length > 0) {
          this.projectContractVariationOrderList = data.ProjectContractVariationOrderList;
          this.contractVariationOrderPagerConfig.TotalRecords = data.TotalRecords;
          if (ProjectContractVariationOrderId > 0) {
            this.isExisted = true;
            this.onRecordSelection(ProjectContractVariationOrderId);
          }
          else {
            this.onRecordSelection(this.projectContractVariationOrderList[0].ProjectContractVariationOrderId);
          }
        }
        else {
          this.projectContractVariationOrderForm.reset();
          this.selectedPCVariationOrderDetails = new ProjectContractVariationOrder();
          this.selectedPCVariationOrderDetails.ProjectContractVariationOrderItems = [];
          this.projectContractVariationOrderList = [];
          this.isExisted = false;
        }
      }
    });
  }

  getProjectContractVariationOrderForApprovals(ProjectContractVariationOrderId: number) {
    let userDetails = <UserDetails>this.sessionService.getUser();//logged in user details...
    let obj = {
      Skip: this.contractVariationOrderPagerConfig.RecordsToSkip,
      Take: this.contractVariationOrderPagerConfig.RecordsToFetch,
      CompanyId: this.companyId,
      UserId: userDetails.UserID
    };
    this.projectContractVariationAPIService.getProjectContractVariationApprovals(obj).subscribe((data: ProjectContractVariationOrderDisplayResult) => {

      if (data.ProjectContractVariationOrderList.length > 0) {
        this.projectContractVariationOrderList = data.ProjectContractVariationOrderList;
        this.contractVariationOrderPagerConfig.TotalRecords = data.TotalRecords;
        if (ProjectContractVariationOrderId > 0) {
          this.onRecordSelection(ProjectContractVariationOrderId);
        }
        else if (data.ProjectContractVariationOrderList.length > 0) {
          this.onRecordSelection(this.projectContractVariationOrderList[0].ProjectContractVariationOrderId);
        }

        this.isExisted = true;
      }
      else {
        this.projectContractVariationOrderForm.reset();
        this.selectedPCVariationOrderDetails = new ProjectContractVariationOrder();
        this.selectedPCVariationOrderDetails.ProjectContractVariationOrderItems = [];
        this.projectContractVariationOrderList = [];
        this.isExisted = false;
      }
    });
  }

  onRecordSelection(ProjectContractVariationOrderId: number) {
    this.projectContractVariationAPIService.getProjectContractVariationOrderById(ProjectContractVariationOrderId, this.companyId).subscribe((data: ProjectContractVariationOrder) => {
      this.selectedPCVariationOrderDetails = data;
      // this.costTypes = this.selectedPCVariationOrderDetails.CostCategories;
      // this.apportionments = this.selectedPCVariationOrderDetails.ApportionmentMethods;
      if (this.selectedPCVariationOrderDetails.ProjectContractVariationOrderItems != undefined) {
        this.addGridItem(this.selectedPCVariationOrderDetails.ProjectContractVariationOrderItems.length, null);
      }

      this.selectedProjectContractVariationOrderId = this.selectedPCVariationOrderDetails.ProjectContractVariationOrderId;
      this.isExisted = true;
      this.projectContractVariationOrderForm.patchValue(this.selectedPCVariationOrderDetails);
      let subTotal = this.getSubTotal();
      this.selectedPCVariationOrderDetails.SubTotal = subTotal;
      this.projectContractVariationOrderForm.get('SubTotal').setValue(subTotal);
    });
  }

  navigateToPage() {
    this.requestType = this.activatedRoute.snapshot.params.type;
    let pOPMasterCode = this.activatedRoute.snapshot.queryParamMap.get('code');
    let projectContractVariationOrderId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));

    let filterData: ProjectContractVariationOrderFilterModel = {
      DocumentCode: pOPMasterCode,
    };
    if (this.activatedRoute.snapshot.params.type == "request") {
      this.pageTitle = "Project Contract Variation Order";
      this.isApprovalPage = false;
      if (projectContractVariationOrderId > 0) {
        this.searchProjectContractVariationOrders(projectContractVariationOrderId, true, filterData);
      }
      else {
        this.getProjectContractVariationOrderList(0);
      }
    }
    else if (this.activatedRoute.snapshot.params.type == "approval") {
      this.pageTitle = "Project Contract Variation Order Approval";
      this.isApprovalPage = true;
      if (projectContractVariationOrderId > 0) {
        this.searchProjectContractVariationOrders(projectContractVariationOrderId, true, filterData);
      }
      else {
        this.getProjectContractVariationOrderForApprovals(0);
      }
    }
  }

  pageChange(currentPageNumber: any) {
    if (currentPageNumber != null && currentPageNumber != undefined) {
      this.contractVariationOrderPagerConfig.RecordsToSkip = this.contractVariationOrderPagerConfig.RecordsToFetch * (currentPageNumber - 1);
      let filterData: ProjectContractVariationOrderFilterModel = this.projectContractVariationOrderForm.value;
      if ((this.contractVariationSearchKey != "" && this.contractVariationSearchKey != null) ||
        (filterData.DocumentCode != "" || filterData.WorkFlowStatusId > 0
          || (filterData.ProjectName != ""))
      ) {
        this.searchProjectContractVariationOrders(0, false, filterData);
      }
      else {
        this.getProjectContractVariationOrderList(0);
      }
    }
  }

  initGridRows() {
    return this.formbuilderObj.group({
      'ProjectContractVariationOrderItemId': [0],
      'ProjectContractVariationOrderId': [0],
      'ProjectMasterContractItemId': [0],
      'ItemDescription': [""],
      'AccountCodeName': [""],
      'AccountCode': [0],
      'POPCostCategoryId': [0],
      'POPApportionmentId': [0],
      'ContractValue': [0],
      'TotalVOSum': [0],
      'RevisedContractValue': [0],
      'AccountCodeId': [0],
      'Expense': [0],
      'TypeOfCostName': [""],
      'ApportionmentMethod': [""],
      'AccountCodeCategoryId': [0],
    });
  }
  initGridRows1() {
    return this.formbuilderObj.group({
      'ProjectContractVariationOrderItemId': [0],
      'ProjectContractVariationOrderId': [0],
      'ProjectMasterContractItemId': [0],
      'AccountCodeName': [""],
      'AccountCode': [0],
      'POPCostCategoryId': [0],
      'POPApportionmentId': [0],
      'TotalVOSum': [0],
      'DisRevisedContractValue': [0],
      'AccountCodeId': [0],
      'Expense': [0],
      'AccountCodeCategoryId': [0],
      'DisItemDescription': [''],
      'DiscountValue': [0],
      'DisTypeOfCostName': [''],
      'DisApportionmentMethod': ['']

    });
  }

  filterData() {
    this.filterMessage = "";
    let pcVariationOrderFilterData: ProjectContractVariationOrderFilterModel = this.projectContractVariationFilterInfoForm.value;
    if ((pcVariationOrderFilterData.DocumentCode === '' || pcVariationOrderFilterData.DocumentCode === null)
      && (pcVariationOrderFilterData.WorkFlowStatusId === null || pcVariationOrderFilterData.WorkFlowStatusId === 0)
      && (pcVariationOrderFilterData.ProjectName === '' || pcVariationOrderFilterData.ProjectName === null)) {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }
      return;
    }

    this.searchProjectContractVariationOrders(0, false, pcVariationOrderFilterData);
    if (this.projectContractVariationOrderList.length > 0) {
      this.isFilterApplied = true;
      if (open) {
        this.showFilterPopUp = true;
      }
    }
  }

  onSearchInputChange(event: any) {
    this.resetPagerConfig();
    if (event.target.value != "") {
      this.contractVariationSearchKey = event.target.value;
      this.searchProjectContractVariationOrders(0);
    }
    else {
      this.getProjectContractVariationOrderList(0);
    }
  }

  reject(remarks: string) {
    this.updateStatus(WorkFlowStatus.Rejected, remarks);
  }

  searchProjectContractVariationOrders(projectContractVariationOrderId: number = 0, isNotification: boolean = false, filterData?: ProjectContractVariationOrderFilterModel) {
    let userDetails = <UserDetails>this.sessionService.getUser();
    let input = {
      Skip: this.contractVariationOrderPagerConfig.RecordsToSkip,
      Take: this.contractVariationOrderPagerConfig.RecordsToFetch,
      IsApprovalPage: this.isApprovalPage,//if it is approval page..
      Search: this.contractVariationSearchKey,
      ProjectContractVariationOrderId: isNotification == true ? projectContractVariationOrderId : 0,
      UserId: userDetails.UserID,
      CompanyId: this.isApprovalPage == true ? 0 : this.sessionService.getCompanyId()
    };

    if (filterData != null && filterData != undefined) {
      input["DocumentCode"] = (filterData.DocumentCode == null || filterData.DocumentCode == undefined) ? "" : filterData.DocumentCode;
      // input["SupplierName"] = poFilterData.SupplierName;
      input["WorkFlowStatusId"] = (filterData.WorkFlowStatusId == null || filterData.WorkFlowStatusId == undefined) ? "" : filterData.WorkFlowStatusId;
      input["ProjectName"] = (filterData.ProjectName == null || filterData.ProjectName == undefined) ? "" : filterData.ProjectName;

    }
    this.showLeftPanelLoadingIcon = true;
    this.projectContractVariationAPIService.GetAllSearchProjectContractVariationOrders(input)
      .subscribe((data: ProjectContractVariationOrderDisplayResult) => {
        this.showLeftPanelLoadingIcon = false;
        if (data.ProjectContractVariationOrderList.length > 0) {
          this.showFilterPopUp = false;
          this.projectContractVariationOrderList = data.ProjectContractVariationOrderList;
          this.contractVariationOrderPagerConfig.TotalRecords = data.TotalRecords;
          this.onRecordSelection(this.projectContractVariationOrderList[0].ProjectContractVariationOrderId);
          this.isExisted = true;
        }
        else {
          this.filterMessage = "No Records To Display";
        }
      }, () => {
        this.showLeftPanelLoadingIcon = false;
      });
  }

  updateStatus(statusId: number, rejectionRemarks: string = "") {
    debugger
    let remarks = "";
    let successMessage = "";
    let formRemarks = this.projectContractVariationOrderForm.get('ApprovalRemarks').value;
    if ((formRemarks == "" || formRemarks == null) && (statusId == WorkFlowStatus.AskedForClarification || statusId == WorkFlowStatus.WaitingForApproval)) {
      this.projectContractVariationOrderForm.get('ApprovalRemarks').setErrors({ "required": true });
      this.projectContractVariationOrderForm.get('ApprovalRemarks').markAsTouched();
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
      RequestUserId: this.selectedVODetails.CreatedBy,
      DocumentCode: this.selectedVODetails.DocumentCode,
      ProcessId: WorkFlowProcess.ProjectContractVariationOrder,
      CompanyId: this.sessionService.getCompanyId(),
      ApproverUserId: 0,
      IsReApproval: false
    };
    if (this.isApprovalPage) { //if it is workflow approval page...
      this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
        .subscribe((data) => {
          this.projectContractVariationOrderForm.get('ApprovalRemarks').setValue("");
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: successMessage,
            MessageType: MessageTypes.Success
          });
          this.getVODetailsbyId(this.projectMasterContractId);
        });
    }
    else {
      workFlowStatus.ApproverUserId = this.selectedVODetails.CurrentApproverUserId
      this.sharedServiceObj.workFlowClarificationReply(workFlowStatus)
        .subscribe((data) => {
          this.projectContractVariationOrderForm.get('ApprovalRemarks').setValue("");
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: successMessage,
            MessageType: MessageTypes.Success
          });
          this.getVODetailsbyId(this.projectMasterContractId);
        });
    }
  }

  prepareVariationOrderObject(action: string): ProjectContractVariationOrder {
    let projectVariationOrderDetails: ProjectContractVariationOrder = this.projectContractVariationOrderForm.value;
    projectVariationOrderDetails.Action = action;
    projectVariationOrderDetails.CompanyId = this.companyId;
    projectVariationOrderDetails.POPId = this.selectedPODetails.ProjectMasterContractId;
    projectVariationOrderDetails.VOSum = this.projectContractVariationOrderForm.get('SubTotalVOSum').value
    projectVariationOrderDetails.CreatedBy = this.userDetails.UserID;
    projectVariationOrderDetails.UpdatedBy = this.userDetails.UserID;
    projectVariationOrderDetails.IsVerifier = this.verifyPermission;
    projectVariationOrderDetails.WorkFlowStatusId = (action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval);
    projectVariationOrderDetails.CompanyId = this.sessionService.getCompanyId();
    projectVariationOrderDetails.LocationId = this.selectedPODetails.LocationId;
    if (this.voId > 0) {
      projectVariationOrderDetails.ProjectContractVariationOrderId = this.voId;
    }
    // projectVariationOrderDetails.ProjectContractVariationOrderItems= this.selectedPODetails.ProjectMasterContractItems;
    return projectVariationOrderDetails;
  }

  onApproveClick(status: string) {
    if (this.verifyPermission && this.isApprovalPage) {
      this.saveRecord(status);
    }
    else {
      this.updateStatus(WorkFlowStatus.Approved);
    }
  }
  validVOData(): boolean {
    let subtotalVOSum: number = Number(this.projectContractVariationOrderForm.get('SubTotalVOSum').value);
    return subtotalVOSum == 0 ? false : true;
  }
  saveRecord(action: string) {
    if (this.projectContractVariationOrderForm.valid && this.validVOData()) {
      let variationOrderObj: ProjectContractVariationOrder = this.prepareVariationOrderObject(action);
      this.projectContractVariationAPIService.createProjectContractVariationOrder(variationOrderObj,'').subscribe((poId: number) => {
        if (poId > 0) {
          this.voId = poId;
          this.IsViewMode = true;
          if (action == 'send' || action == 'approve' || action == 'verify') {
            let workFlowDetails: WorkFlowParameter = {
              ProcessId: WorkFlowProcess.ProjectContractVariationOrder,
              CompanyId: this.selectedPODetails.CompanyId,
              LocationId: this.selectedPODetails.LocationId,
              FieldName: "",
              Value: this.projectContractVariationOrderForm.get('SubTotalVOSum').value,
              DocumentId: this.voId,
              CreatedBy: this.userDetails.UserID,
              WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
              DocumentCode: this.selectedVODetails.DocumentCode,
              PurchaseOrderStatusId: this.selectedVODetails.WorkFlowStatusId
            };
            this.sharedServiceObj.sendForApproval(workFlowDetails).subscribe((data) => {
              this.getVODetailsbyId(this.projectMasterContractId);
              this.IsViewMode = true;
              if (action == 'approve') {
                this.updateStatus(WorkFlowStatus.Approved);
              }
              else {
                this.sharedServiceObj.showMessage({
                  ShowMessage: true,
                  Message: Messages.SentForApproval,
                  MessageType: MessageTypes.Success
                });
              }
            });
          }
          else {
            this.getVODetailsbyId(this.projectMasterContractId);
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
    else {
      Object.keys(this.projectContractVariationOrderForm.controls).forEach((key: string) => {
        if (this.projectContractVariationOrderForm.controls[key].status == "INVALID" && this.projectContractVariationOrderForm.controls[key].touched == false) {
          this.projectContractVariationOrderForm.controls[key].markAsTouched();
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
  getVODetails(voId: number, rowIndex: number) {
    this.selectedVODetails = this.projectContractVariationOrderForm.value;
    this.projectContractVariationAPIService.getVODetailsbyId(this.projectMasterContractId, this.voId).subscribe((result: ProjectContractVariationOrderItems) => {
      if (result != null) {
        let itemControl = <FormArray>this.projectContractVariationOrderForm.controls['ProjectContractVariationOrderItems'];

        this.projectContractVariationOrderForm.patchValue({
          "ProjectContractVariationOrderItems": result
        });
        this.calculateRevisedContractValue(0, null);
      }
    });
  }

  displayLogPopUp() {
    this.showLogPopUp = true;
  }
  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
  attachmentDelete(attachmentIndex: number) {

    this.confirmationServiceObj.confirm({
      message: Messages.AttachmentDeleteConfirmation,
      header: Messages.DeletePopupHeader,
      accept: () => {
        let attachmentRecord = this.selectedVODetails.Attachments[attachmentIndex];
        attachmentRecord.IsDelete = true;
        this.selectedVODetails.Attachments = this.selectedVODetails.Attachments.filter((obj, index) => index > -1);
      },
      reject: () => {
      }
    });

  }
  addVOItem(noOfLines: number, gridFAName: string) {
    let contactGroupControl = <FormArray>this.projectContractVariationOrderForm.controls[gridFAName];
    for (let i = 0; i < noOfLines; i++) {
      if (gridFAName == "ProjectContractVariationOrderItems") {
        let controls = this.initGridRows();
        contactGroupControl.push(controls);
        this.selectedPODetails.ProjectMasterContractItems.push(controls.value);
      }
      else if (gridFAName == "ProjectContractVariationOrderDiscountItems") {
        contactGroupControl.push(this.initGridRows1());
      }
    }
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
    let itemGroupControl = <FormArray>this.projectContractVariationOrderForm.controls['ProjectContractVariationOrderItems'];
    this.accountCategoryId = itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').value;

    let purchaseOrderItemId = itemGroupControl.controls[rowIndex].get('ProjectMasterContractItemId').value;


    if (itemGroupControl.controls[rowIndex] != undefined) {
      itemGroupControl.controls[rowIndex].reset();
    }

    itemGroupControl.controls[rowIndex].get('AccountCodeCategoryId').setValue(Number(this.accountCategoryId));
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
        let itemGroupControl = <FormArray>this.projectContractVariationOrderForm.controls['ProjectContractVariationOrderItems'];

        accountCategoryId = itemGroupControl.controls[this.selectedRowId].get('AccountCodeCategoryId').value;

        return this.sharedServiceObj.getServicesByKeyforExpense({
          searchKey: term,
          companyId: this.companyId,
          categoryId: accountCategoryId
        }).map((data: AccountCode[]) => {

          return this.getAccountCodeList(data);
          // return this.getDiscountAccountCodeList(data);

        }).pipe(
          catchError(() => {

            return of([]);
          }))
      })
    );
  }
  getAccountCodeList(data: AccountCode[]) {
    let itemGroupControl = <FormArray>this.projectContractVariationOrderForm.controls['ProjectContractVariationOrderItems'];
    itemGroupControl.controls.forEach((control, index) => {
      let item = <AccountCode>control.get('Expense').value;
    });
    return data;
  }
  // getDiscountAccountCodeList(data: AccountCode[]) {
  //   let itemGroupControl = <FormArray>this.projectContractVariationOrderForm.controls['DiscountLineItems'];
  //   itemGroupControl.controls.forEach((control, index) => {
  //     let item = <AccountCode>control.get('Expense').value;
  //   });
  //   return data;
  // }
  onExpenseChange(eventData: any, index: number) {

    let itemGroupControl = <FormArray>this.projectContractVariationOrderForm.controls['ProjectContractVariationOrderItems'];
    itemGroupControl.controls[index].patchValue({
      ItemDescription: eventData.item.Description

    });
  }
}
