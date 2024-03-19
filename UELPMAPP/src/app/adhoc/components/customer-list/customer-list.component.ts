import { Component, OnInit } from '@angular/core';
import { CustomerListColumns } from '../../models/grid-columns';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { CustomerService } from '../../services/customer.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Messages, MessageTypes, UserDetails } from './../../../shared/models/shared.model';
import { SalesCustomerSearch } from '../../models/customer-master.model';
import { SharedService } from './../../../shared/services/shared.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';
import { CustomerTypeMaster, MasterProcess, MasterProcessTypes } from '../../models/adhoc-master.model';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  RemarksForm: FormGroup;
  showRemarksPopUp: boolean = false;
  moduleHeading: string = '';
  addPermission: boolean = false;
  importPermission: boolean = false;
  deletePersmission: boolean = false;
  scrollbarOptions: any
  companyId: number = 0;
  customers: any;
  FiltersForm: FormGroup;
  customerTypes: CustomerTypeMaster[] = [];
  CustomerListGridColumns: Array<{ field: string, header: string, width?: string }> = [];
  pageType: string = '';
  userDetails: UserDetails = null;
  isApprovalPage: boolean = false;
  fetchFilterData: boolean = false;
  requestConfig: SalesCustomerSearch = new SalesCustomerSearch();
  userRoles: any = [];
  rolesAccessList = [];
  constructor(private customerService: CustomerService,
    private sessionService: SessionStorageService,
    private adhocMasterService: AdhocMasterService,
    private sharedService: SharedService,
    private AdhocMasterService: AdhocMasterService,
    private fb: FormBuilder,
    private router: Router) {
    this.companyId = this.sessionService.getCompanyId();
    this.userDetails = <UserDetails>this.sessionService.getUser();
  }

  ngOnInit() {
    this.getRoles();
    this.pageType = this.router.url.indexOf('request') > 0 ? 'request' : 'approval';
    this.moduleHeading = this.pageType == "request" ? "Customer List" : "Customer Approval List";
    this.isApprovalPage = this.pageType == "approval" ? true : false;
    this.FiltersForm = this.fb.group({
      'CustomerName': [''],
      'CustomerId': [''],
      'CustomerTypeId': [0]
    });
    this.RemarksForm = this.fb.group({
      Reasons: new FormControl('', [Validators.required, ControlValidator.Validator]),
      DocumentId: [0],
      IsActive: ['']
    });
    this.CustomerListGridColumns = CustomerListColumns.filter(item => item);
    this.GetCustomerMasterType();
    this.GetCustomers();
  }
  getRoles() {
    if (this.companyId > 0) {
      this.sharedService.getUserRolesByCompany(this.userDetails.UserID, this.companyId).subscribe((roles: Array<Roles>) => {
        this.userRoles = roles;
        this.userDetails.Roles = this.userRoles;
        this.sessionService.setUser(this.userDetails);
        let roleIds = Array.prototype.map.call(this.userDetails.Roles, s => s.RoleID).toString();
        if (roleIds != '') {
          this.sharedService.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
            this.rolesAccessList = data;
            this.sessionService.setRolesAccess(this.rolesAccessList);
            let roleAccessLevels = this.sessionService.getRolesAccess();
            if (roleAccessLevels != null && roleAccessLevels.length > 0) {
              let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "customer")[0];
              this.addPermission = approvalRole.IsAdd;
              this.importPermission = approvalRole.IsImport;
              this.deletePersmission = approvalRole.IsDelete;
            }
          });
        }
      });
    }
  }
  GetCustomers() {
    this.requestConfig = {
      CompanyId: this.companyId,
      IsApprovalPage: this.isApprovalPage,
      UserId: this.userDetails.UserID,
      FetchFilterData: this.fetchFilterData,
      CustomerName: this.FiltersForm.get('CustomerName').value,
      CustomerId: this.FiltersForm.get('CustomerId').value,
      CustomerTypeId:this.FiltersForm.get('CustomerTypeId').value
    };
    this.customerService.GetCustomers(this.requestConfig).subscribe(data => {
      this.customers = data;
    })
  }
  GetCustomerMasterType() {
    this.AdhocMasterService.GetCustomerTypes().subscribe((data: CustomerTypeMaster[]) => { this.customerTypes = data });
  }
  RedirectCustomer(customerIPSId) {
    this.router.navigate([`/adhoc/customer/${this.pageType}/${customerIPSId}`]);
  }
  ImportCustomers(){
    this.router.navigate([`/adhoc/customer/import`]);
  }
  FilterData() {
    this.fetchFilterData = true;
    this.GetCustomers();
  }
  ChangeStatus() {
    if (this.RemarksForm.invalid) {
      this.RemarksForm.get('Reasons').markAsTouched();
      return;
    }
    let masterProcess: MasterProcess = {
      Status: this.RemarksForm.get('IsActive').value,
      Remarks: this.RemarksForm.get('Reasons').value,
      DocumentId: this.RemarksForm.get('DocumentId').value,
      ProcessId: MasterProcessTypes.CustomerMaster,
      UserId: this.userDetails.UserID
    };
    this.adhocMasterService.ChangeMasterProcessStatus(masterProcess).subscribe((data: boolean) => {
      if (data) {
        this.sharedService.showMessage({
          ShowMessage: true,
          Message: `Customer ${masterProcess.Status ? Messages.MasterProcessActiveOK : Messages.MasterProcessInActiveOK}`,
          MessageType: MessageTypes.Success
        });
      }
      this.resetFilters();
    });
  }
  ShowRemarksPopUp(value: any) {
    this.showRemarksPopUp = true;
    this.RemarksForm.patchValue({
      Reasons: "",
      DocumentId: value.CustomerIPSId,
      IsActive: !value.IsActive
    });
  }
  resetFilters() {
    this.FiltersForm.reset();
    this.RemarksForm.reset();
    this.fetchFilterData = false;
    this.showRemarksPopUp = false;
    this.GetCustomers();
  }
}
