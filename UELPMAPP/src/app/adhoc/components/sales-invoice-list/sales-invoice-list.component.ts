import { Component, OnInit } from '@angular/core';
import { CustomerListColumns, InvoiceListColumns, QuotationListColumns } from '../../models/grid-columns';
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
import { SalesInvoiceService } from '../../services/sales-Invoice.service';
import { SalesInvoiceSearch } from '../../models/sales-Invoice.model';

@Component({
  selector: 'app-sales-invoice-list',
  templateUrl: './sales-invoice-list.component.html',
  styleUrls: ['./sales-invoice-list.component.css']
})
 
export class SalesInvoiceListComponent implements OnInit {
  RemarksForm: FormGroup;
  showRemarksPopUp: boolean = false;
  moduleHeading: string = '';
  addPermission: boolean = false;
  importPermission: boolean = false;
  deletePersmission: boolean = false;
  scrollbarOptions: any
  companyId: number = 0;
  data: any;
  FiltersForm: FormGroup;
  customerTypes: CustomerTypeMaster[] = [];
  InvoiceListColumns: Array<{ field: string, header: string, width?: string }> = [];
  pageType: string = '';
  userDetails: UserDetails = null;
  isApprovalPage: boolean = false;
  fetchFilterData: boolean = false;
  requestConfig: SalesInvoiceSearch = new SalesInvoiceSearch();
  userRoles: any = [];
  rolesAccessList = [];
  constructor(private InvoiceService: SalesInvoiceService,
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
    this.moduleHeading = this.pageType == "request" ? "Sales Invoice List" : "Sales Invoice Approval List";
    this.isApprovalPage = this.pageType == "approval" ? true : false;
    this.FiltersForm = this.fb.group({
      'CustomerName': [''],
      'CustomerId': [''],
      'DocumentCode': ['']
    });
    this.RemarksForm = this.fb.group({
      Reasons: new FormControl('', [Validators.required, ControlValidator.Validator]),
      DocumentId: [0],
      IsActive: ['']
    });
    this.InvoiceListColumns = InvoiceListColumns.filter(item => item);
    this.GetCustomerMasterType();
    this.GetSalesInvoices();
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
              if (this.isApprovalPage) {
                let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "salesinvoiceapproval")[0];
                this.addPermission = approvalRole.IsAdd;
                this.importPermission = approvalRole.IsImport;
                this.deletePersmission = approvalRole.IsDelete;
              }
              if (!this.isApprovalPage) {
                let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "salesinvoice")[0];
                this.addPermission = approvalRole.IsAdd;
                this.importPermission = approvalRole.IsImport;
                this.deletePersmission = approvalRole.IsDelete;
              }
            }
          });
        }
      });
    }
  }
  GetSalesInvoices() {
    this.requestConfig = {
      CompanyId: this.companyId,
      IsApprovalPage: this.isApprovalPage,
      UserId: this.userDetails.UserID,
      FetchFilterData: this.fetchFilterData,
      CustomerName: this.FiltersForm.get('CustomerName').value,
      CustomerId: this.FiltersForm.get('CustomerId').value,
      DocumentCode:this.FiltersForm.get('DocumentCode').value
    };
    this.InvoiceService.GetSalesInvoices(this.requestConfig).subscribe(data => {
      this.data = data;
    })
  }
  GetCustomerMasterType() {
    this.AdhocMasterService.GetCustomerTypes().subscribe((data: CustomerTypeMaster[]) => { this.customerTypes = data });
  }
  RedirectCustomer(DocumentId) {
    this.router.navigate([`/adhoc/invoice/${this.pageType}/${DocumentId}`]);
  }
  FilterData() {
    this.fetchFilterData = true;
    this.GetSalesInvoices();
  }
  resetFilters() {
    this.FiltersForm.reset();
    this.RemarksForm.reset();
    this.fetchFilterData = false;
    this.showRemarksPopUp = false;
    this.GetSalesInvoices();
  }
}
