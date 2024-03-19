import { Component, OnInit } from '@angular/core';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ProjectPaymentMasterService } from '../../services/project-payment-history.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { PaymentColumns, PMCGridColumns, ProjectMasterContract, ProjectPayment, PTableColumn } from '../../models/project-payment-history.model';
import { Messages, PagerConfig, Suppliers, UserDetails, WorkFlowProcess } from '../../../shared/models/shared.model';
import { ProjectContractMasterService } from '../../services/project-contract-master.service';
import { Observable, of } from 'rxjs';
import * as moment from 'moment';
import { ProjectMasterContractDisplayResult } from '../../models/project-contract-master.model';
import { RequestConfig } from '../../models/RequestConfig';
import { SharedService } from '../../../shared/services/shared.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Locations } from '../../../inventory/models/item-master.model';
import { PageAccessLevel, Roles } from '../../../administration/models/role';
import { GenericService } from '../../../shared/sevices/generic.service';

@Component({
  selector: 'app-project-payment-list',
  templateUrl: './project-payment-list.component.html',
  styleUrls: ['./project-payment-list.component.css']
})
export class ProjectPaymentListComponent implements OnInit {
  importPaymentColumns: PTableColumn[] = [];
  purchaseOrderPagerConfig:PagerConfig;
  FiltersForm: FormGroup;
  payments: any[] = [];
  moduleHeading: string = "";
  isApprovalPage: boolean = false;
  pageType: string = "";
  companyId: number = 0;
  showContractDialog: boolean = false;
  pMCGridColumns: PTableColumn[] = [];
  projectPoList: ProjectMasterContract[] = [];
  userDetails: UserDetails = null;
  requestConfig: RequestConfig = new RequestConfig();
  fetchFilterData: boolean = false;
  showWFPopup: boolean = false;
  validationMessage: string = '';
  newPermission: boolean = false;
  userRoles = [];
  MastersFiltersForm: FormGroup;
  rolesAccessList = [];
  public screenWidth: any;
  constructor(private sessionService: SessionStorageService,
    private router: Router,
    private formbuilderObj: FormBuilder,
    public route: ActivatedRoute,
    private sharedServiceObj: SharedService,
    public projectContractPaymentServiceObj: ProjectPaymentMasterService,
    public genericService: GenericService,
    private projectContractMasterServiceObj: ProjectContractMasterService) {
    this.companyId = this.sessionService.getCompanyId();
    this.userDetails = <UserDetails>this.sessionService.getUser();
  }

  
  resetPagerConfig()
  {
      this.purchaseOrderPagerConfig.RecordsToSkip = 0;
      this.purchaseOrderPagerConfig.RecordsToFetch = 25;
  }

  ngOnInit() {
    this.purchaseOrderPagerConfig = new PagerConfig();
    this.resetPagerConfig();
    this.FiltersForm = this.formbuilderObj.group({
      'FromDate': [new Date()],
      'ToDate': [new Date()],
      'POPDocumentCode': [''],
      'SupplierName': ['']
    });
    this.MastersFiltersForm = this.formbuilderObj.group({
      'StartDate': [new Date()],
      'EndDate': [new Date()],
      'ContractName': [''],
      'SupplierName': ['']
    });
    this.pMCGridColumns = PMCGridColumns.filter(item => item);
    this.importPaymentColumns = PaymentColumns.filter(item => item);
    this.route.paramMap.subscribe((param: ParamMap) => {
      this.pageType = param.get('type');
      this.moduleHeading = this.pageType == "request" ? "Project Invoice List" : "Project Invoice Approval List";
      this.isApprovalPage = this.pageType == "approval" ? true : false;
      this.getProjectPaymentContracts();
    });
    this.sharedServiceObj.CompanyId$.subscribe((data) => {
      this.companyId = data;
      this.getProjectPaymentContracts();
      this.getRoles();
    });
    this.getRoles();

    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-150;
      }

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
            if (this.rolesAccessList != null && this.rolesAccessList.length > 0) {
              let formRole = this.rolesAccessList.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "projectinvoice")[0];
              this.newPermission = formRole.IsAdd;
            }
            else {
              this.newPermission = false;
            }
          });
        }
      });
    }
  }
  supplierInputFormater = (x: Suppliers) => x.SupplierName;
  supplierSearch = (text$: Observable<string>) => text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => {
      if (term == "") {

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
  getProjectPaymentContracts() {
    let supplier = this.FiltersForm.get('SupplierName').value;
    let supplierName = '';
    if (supplier != null && supplier != undefined) {
      supplierName = supplier.SupplierName;
    }
    this.requestConfig = {
      CompanyId: this.companyId,
      IsApprovalPage: this.isApprovalPage,
      UserId: this.userDetails.UserID,
      FetchFilterData: this.fetchFilterData,
      FromTime: moment(this.FiltersForm.get('FromDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString(),
      ToTime: moment(this.FiltersForm.get('ToDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString(),
      SupplierName: supplierName,
      POPDocumentCode: this.FiltersForm.get('POPDocumentCode').value
    };
    this.projectContractPaymentServiceObj.getProjectPaymentContracts(this.requestConfig).subscribe((data: ProjectPayment[]) => {
      this.payments = data;
    });
  }
  addRecord() {
    this.MastersFiltersForm.reset();
    this.showContractDialog = true;
    this.getProjectPOList();
  }
  getProjectPOList() {
    this.projectContractMasterServiceObj.GetProjectMasterApprovedDetails(this.companyId, this.userDetails.UserID).subscribe((data: ProjectMasterContractDisplayResult) => {
      if (data != null && data.ProjectMasterContractList.length > 0) {
        this.projectPoList = data.ProjectMasterContractList;
      }
    });
  }
  viewRecord(payment: ProjectPayment) {
    this.router.navigate(['po/projectpaymenthistory/' + this.pageType + '/' + payment.POPId + '/' + payment.PaymentContractId]);
  }
  getMasterFilterData() {
    let supplier = this.MastersFiltersForm.get('SupplierName').value;
    let supplierName = '';
    if (supplier != null) {
      supplierName = supplier.SupplierName;
    }
    let displayInput = {
      ProjectName: this.MastersFiltersForm.get('ContractName').value,
      SupplierName: supplierName,
      CompanyId: this.companyId,
      CreatedBy: this.userDetails.UserID,
      StartDate: moment(this.MastersFiltersForm.get('StartDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString(),
      EndDate: moment(this.MastersFiltersForm.get('EndDate').value).subtract(1, 'months').format('YYYY-MM-DD').toLocaleString()
    };
    this.projectContractMasterServiceObj.getPaymentProjectMasterFilterData(displayInput).subscribe((data: ProjectMasterContractDisplayResult) => {
      if (data != null) {
        this.projectPoList = data.ProjectMasterContractList;
      }
    });
  }
  getProjectContractMasterDetails(data: ProjectMasterContract) {
    this.sharedServiceObj.getDepartmentsWorkFlow(this.companyId, WorkFlowProcess.ProjectPaymentContract).subscribe((res: Array<Locations>) => {
      let Departments = res.filter(item => item.Name != 'Inventory');
      var wfDepartment = Departments.filter(x => x.HasWorkflow && x.Name.toLowerCase() == data.Location.toLowerCase());
      if (wfDepartment.length == 0) {
        this.showWFPopup = true;
        this.validationMessage = 'Selected department ' + data.Location + ' does not have workflow.'
      }
      else {
        let document: any = {
          DocumentId: data.ProjectMasterContractId,
          DocumentTypeId: WorkFlowProcess.ProjectPaymentContract
        };
        this.genericService.checkPendingDocuments(document).subscribe((result: boolean) => {
          if (result) {
            this.showContractDialog = false;
            this.showWFPopup = true;
            this.validationMessage = Messages.PaymentsHasPendingDocuments;
          }
          else {
            this.router.navigate(['po/projectpaymenthistory/request/' + data.ProjectMasterContractId + '/0']);
          }
        });
      }
    });
  }
  getFilterData() {
    this.fetchFilterData = true;
    this.getProjectPaymentContracts();
  }
  resetFilters() {
    this.FiltersForm.reset();
    this.fetchFilterData = false;
    this.getProjectPaymentContracts();
  }
  closeValidationPopUp() {
    this.showWFPopup = false;
  }
}
