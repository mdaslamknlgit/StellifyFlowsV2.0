import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { faBuilding, faFileInvoiceDollar, faBox, faFileContract, faFileInvoice, faFileSignature, faCreditCard, faCartArrowDown } from '@fortawesome/free-solid-svg-icons';
import { faLaptop } from '@fortawesome/free-solid-svg-icons';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { UserDetails } from '../../../shared/models/shared.model';
import { PageAccessLevel, Roles } from '../../../administration/models/role';
import { SharedService } from "../../services/shared.service";
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  faArrowDown=faAngleDown;
  faCubes = faCubes;
  ViewModule=false;
  faBuilding = faBuilding;
  faLaptop = faLaptop;
  faHandshake = faHandshake;
  faUser = faUser;
  faFileInvoiceDollar = faFileInvoiceDollar;
  faBox = faBox;
  faFileContract = faFileContract;
  faFileInvoice = faFileInvoice;
  faCreditCard = faCreditCard;
  faCartArrowDown = faCartArrowDown;
  faFileSignature = faFileSignature;
  showsubmenu: boolean = false;
  inventory: boolean = false;
  asset: boolean = false;
  facility: boolean = false;
  system: boolean = false;
  fixedassets: boolean = false;
  po: boolean = false;
  user: boolean = false;
  CapEX: boolean = false;
  leasing: boolean = false;
  purchase: boolean = false;
  activeinventoryset: boolean = false;
  activecrmset: boolean = false;
  activefacilityset: boolean = false;
  activemanagement: boolean = false;
  activeassetset: boolean = false;
  activeassetmanagement: boolean = false;
  activeprojectset: boolean = false;
  activecapexset: boolean = false;
  activecapexmanagement: boolean = false;
  activepurchaseset: boolean = false;
  activepurchasemanagement: boolean = false;
  activepurchaseorder: boolean = false;
  activepopurchaseorder: boolean = false;
  activeuommanagement: boolean = false;
  activeprojectcosting: boolean = false;
  Project: boolean = false;
  viewPermission: boolean = false;
  userdetails: UserDetails;
  inventoryManagmentView: boolean = false;
  
  CRMView: boolean=false;
  crmReportsView:boolean=false;
  actionCRMReportsView:boolean=false;
  
  
  itemMasterView: boolean = false;
  uomView: boolean = false;
  assetView: boolean = false;
  assetManagmentView: boolean = false;
  purchaseManagementView: boolean = false;
  salesModuleView: boolean = false;
  salessettingsView: boolean = false;
  salesManagementView: boolean = false;
  serviceCategoryView: boolean = false;
  supplierCategoryView: boolean = false;
  customerTypeView: boolean = false;
  reportsView: boolean = false;
  userManagementView: boolean = false;
  scheduleNOView: boolean = false;
  supplierServicesView: boolean = false;
  coaAccountTypeView: boolean = false;
  accountSubcategoryView: boolean = false;
  accountCodesView: boolean = false;
  paymentTermsView: boolean = false;
  taxGroupView: boolean = false;
  gSTTypeView: boolean = false;
  vendorsExportView: boolean = false;
  suppliersView: boolean = false;
  supplierApprovalView: boolean = false;
  contractMasterView: boolean = false;
  purchaseOrderView: boolean = false;
  poView: boolean = false;
  pocView: boolean = false;
  purchaseOrderApprovalView: boolean = false;
  goodsReceivedNotesView: boolean = false;
  supplierInvoiceView: boolean = false;
  supplierInvoiceApprovalView: boolean = false;
  creditNoteView: boolean = false;
  creditNoteApprovalsView: boolean = false;
  exportInvoiceView: boolean = false;
  accrualManagementView: boolean = false;
  accrualReverseView: boolean = false;
  importPaymentsView: boolean = false;
  systemAdministrationView: boolean = false;
  changePasswordView: boolean = false;
  currencyView: boolean = false;
  departmentView: boolean = false;
  workflowView: boolean = false;
  workflowReassignmentView: boolean = false;
  auditLogView: boolean = false;
  companiesView: boolean = false;
  roleManagementView: boolean = false;
  lefnavshow: boolean = false;
  rolesAccessList: Array<PageAccessLevel> = [];
  hamburger: boolean = false;
  projectContractMasterView: boolean = false;
  projectContractMasterApprovalView: boolean = false;
  projectContractPaymentView: boolean = true;
  projectContractPaymentApprovalView: boolean = true;
  projectVOView: boolean = true;
  projectVOApprovalView: boolean = true;
  salesQuotationView: boolean = false;
  salesQuotationApprovalView: boolean = false;
  salesInvoiceView: boolean = false;
  salesInvoiceApprovalView: boolean = false;
  salesInvoiceExportView: boolean = false;
  reportSupplierView: boolean = false;
  reportPOView: boolean = false;
  reportPOCMasterView: boolean = false;
  reportPOCView: boolean = false;
  activeSalesManagement: boolean = false;
  activeSalesSettings: boolean = false;
  reportAPInvoiceView: boolean = false;
  reportAPCreditNoteView: boolean = false;
  reportCOAView: boolean = false;
  reportPOPMasterView: boolean = false;
  reportPOPInvoiceView: boolean = false;
  reportAdminWFView: boolean = false;
  bankMasterView: boolean = false;
  creditTermView: boolean = false;
  locationMasterView: boolean = false;
  emailConfigView: boolean = false;
  tenantsTypeView: boolean = false;
  serviceMasterView: boolean = false;
  serviceTypeCodeView: boolean = false;
  salestaxGroupView: boolean = false;
  taxMasterView: boolean = false;
  taxTypeView: boolean = false;
  customerView: boolean = false;
  lgmenu: boolean = false;
  showinventory: boolean = false;
  showCRM:boolean=false;
  showfixedassets: boolean = false;
  showpurchase: boolean = false;
  showsales: boolean = false;
  showfacility: boolean = false;
  showsystem: boolean = false;
  customerApprovalView: boolean = false;
  companyId: number = 0;
  userRoles = [];
  public scrollbarOptions = { axis: 'y', theme: 'minimal-dark' };

  @Input() isSelected: boolean = true;
  @Output() change = new EventEmitter;
  isActiveUser: any;

  constructor(private routerObj: Router,
    private sharedServiceObj: SharedService,
    private router: Router,
    private spinnerObj: NgxSpinnerService,
    public sessionService: SessionStorageService) {
    let userDetails = <UserDetails>this.sessionService.getUser();

    // this.routerObj.events.subscribe((val) => {
    //   // Filter the event type
    //   if (val instanceof NavigationStart) {
    //     // Hide the navbar
    //     //this.menuexpand(e);
        
    //     // Debug log
    //     //console.log('NavBar closed');
    //     alert("Nav Bar Closed");
    //   }
    // });

    //Get NavigationStart events
    routerObj.events.pipe(filter(e => e instanceof NavigationStart)).subscribe(e => {
      //const navigation = router.getCurrentNavigation();
      //tracingService.trace({ id: navigation.extras.state.tracingId });
      //alert("Navigation Start ");
      this.menuexpand(e);
    });

    routerObj.events.subscribe(event => {
      //debugger;
      this.onClickedOutside(null);
      if (event instanceof NavigationStart) {
        this.change.emit(false);
        this.spinnerObj.show();
      }
      else if (event instanceof NavigationEnd) {
        this.spinnerObj.hide();
      }
    });
  }
  getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  // getContractMasterLink
  // {
  //   return "['/po/contractpolist/master'/2]";
  // }
  ngOnInit() {
  
    //View permission logic 
    //debugger;
    let rolesuserDetails = <UserDetails>this.sessionService.getUser();
    let roleIds = Array.prototype.map.call(rolesuserDetails.Roles, Role => Role.RoleID).toString();
    this.getRolesAccessByRoleId(roleIds);
    this.sharedServiceObj.CompanyId$.subscribe((data) => {
      this.companyId = data;
      this.sharedServiceObj.getUserRolesByCompany(userDetails.UserID, this.companyId).subscribe((data: Array<Roles>) => {
        this.userRoles = data;
        let userDetails = <UserDetails>this.sessionService.getUser();
        userDetails.Roles = this.userRoles;
        this.sessionService.setUser(userDetails);
        let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
        this.getRolesAccessByRoleId(roleIds);

      });

    });

    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "suppliers")[0];
      this.viewPermission = formRole.IsView;
    }
    else {
      this.viewPermission = false;
    }
    let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
    this.isActiveUser = userDetails.isADUser;

    this.assetManagmentView=false;

  }

  getRolesAccessByRoleId(roleIds) {
    this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
      this.rolesAccessList = data;
      this.rolesAccessList.forEach(role => {
        //debugger;
        switch (role.PageCompareName.replace(/\s/g, "").toLowerCase()) {
          case 'itemmaster':
            this.itemMasterView = role.IsView;
            break;
          case 'uom':
            this.uomView = role.IsView;
            break;
          case 'assets':
            this.assetView = role.IsView;
            break;
          case 'servicecategory':
            this.serviceCategoryView = role.IsView;
            break;
          case 'suppliercategories':
            this.supplierCategoryView = role.IsView;
            break;
          case 'scheduleno':
            this.scheduleNOView = role.IsView;
            break;
          case 'supplierservices':
            this.supplierServicesView = role.IsView;
            break;
          case 'coaaccounttype':
            this.coaAccountTypeView = role.IsView;
            break;
          case 'accountsubcategory':
            this.accountSubcategoryView = role.IsView;
            break;
          case 'accountcodes':
            this.accountCodesView = role.IsView;
            break;
          case 'paymentterms':
            this.paymentTermsView = role.IsView;
            break;
          case 'taxgroup':
            this.taxGroupView = role.IsView;
            break;
          case 'gsttype':
            this.gSTTypeView = role.IsView;
            break;
          case 'vendorsexport':
            this.vendorsExportView = role.IsView;
            break;
          case 'suppliers':
            this.suppliersView = role.IsView;
            break;
          case 'supplierapproval':
            this.supplierApprovalView = role.IsView;
            break;
          case 'contractmaster':
            this.contractMasterView = role.IsView;
            break;
          case 'purchaseorder':
            this.purchaseOrderView = role.IsView;
            break;
          case 'po':
            this.poView = role.IsView;
            break;
          case 'poc':
            this.pocView = role.IsView;
            break;
          case 'purchaseorderapproval':
            this.purchaseOrderApprovalView = role.IsView;
            break;
          case 'goodsreceivednotes':
            this.goodsReceivedNotesView = role.IsView;
            break;
          case 'supplierinvoice':
            this.supplierInvoiceView = role.IsView;
            break;
          case 'supplierinvoiceapproval':
            this.supplierInvoiceApprovalView = role.IsView;
            break;
          case 'creditnotewithinvoice':
            this.creditNoteView = role.IsView;
            break;
          case 'creditnotewithoutinvoice':
            this.creditNoteView = this.creditNoteView ? this.creditNoteView : role.IsView;
            break;
          case 'creditnoteapprovals':
            this.creditNoteApprovalsView = role.IsView;
            break;
          case 'exportinvoice':
            this.exportInvoiceView = role.IsView;
            break;
          case 'accrualmanagement':
            this.accrualManagementView = role.IsView;
            break;
          case 'accrualreverse':
            this.accrualReverseView = role.IsView;
            break;
          case 'importpayments':
            this.importPaymentsView = role.IsView;
            break;
          case 'projectcontractmaster':
            if (role.IsView)
              this.purchaseManagementView = false;
            else
              this.projectContractMasterView = true;
            break;
          case 'projectcontractmasterapproval':
            if (role.IsView)
              this.purchaseManagementView = false;
            else
              this.projectContractMasterApprovalView = true;
            break;
          case 'projectcontractpayment':
            this.projectContractPaymentView = role.IsView;
            break;
          case 'projectcontractpaymentapproval':
            this.projectContractPaymentApprovalView = role.IsView;
            break;
          case 'projectvariationorder':
            this.projectVOView = role.IsView;
            break;
          case 'projectvariationorderapproval':
            this.projectVOApprovalView = role.IsView;
            break;
          case 'usermanagement':
            this.userManagementView = role.IsView;
            break;
          case 'changepassword':
            this.changePasswordView = role.IsView;
            break;
          case 'currency':
            this.currencyView = role.IsView;
            break;
          case 'department':
            this.departmentView = role.IsView;
            break;
          case 'workflow':
            this.workflowView = role.IsView;
            break;
          case 'workflowre-assignment':
            this.workflowReassignmentView = role.IsView;
            break;
          case 'auditlog':
            this.auditLogView = role.IsView;
            break;
          case 'companies':
            this.companiesView = role.IsView;
            break;
          case 'rolemanagement':
            this.roleManagementView = role.IsView;
            break;
          case 'customertype':
            //debugger;
            this.customerTypeView = role.IsView;
            break;
          case 'bankmaster':
            this.bankMasterView = role.IsView;
            break;
          case 'creditterm':
            this.creditTermView = role.IsView;
            break;
          case 'locationmaster':
            this.locationMasterView = role.IsView;
            break;
          case 'emailconfiguration':
            this.emailConfigView = role.IsView;
            break;
          case 'tenantstype':
            this.tenantsTypeView = role.IsView;
            break;
          case 'servicemaster':
            this.serviceMasterView = role.IsView;
            break;
          case 'servicetypecode':
            this.serviceTypeCodeView = role.IsView;
            break;
          case 'salestaxgroup':
            this.salestaxGroupView = role.IsView;
            break;
          case 'taxmaster':
            this.taxMasterView = role.IsView;
            break;
          case 'taxtype':
            this.taxTypeView = role.IsView;
            break;
          case 'customer':
            this.customerView = role.IsView;
            break;
          case 'customerapproval':
            this.customerApprovalView = role.IsView;
            break;
          case 'salesquotation':
            this.salesQuotationView = role.IsView;
            break;
          case 'salesquotationapproval':
            this.salesQuotationApprovalView = role.IsView;
            break;
          case 'salesinvoice':
            this.salesInvoiceView = role.IsView;
            break;
          case 'salesinvoiceapproval':
            this.salesInvoiceApprovalView = role.IsView;
            break;
          case 'salesinvoiceexport':
            this.salesInvoiceExportView = role.IsView;
            break;
          case 'supplier':
            this.reportSupplierView = role.IsView;
            break;
          case 'poreport':
            this.reportPOView = role.IsView;
            break;
          case 'poc-master':
            this.reportPOCMasterView = role.IsView;
            break;
          case 'pocreport':
            this.reportPOCView = role.IsView;
            break;
          case 'ap-invoice':
            this.reportAPInvoiceView = role.IsView;
            break;
          case 'ap-creditnote':
            this.reportAPCreditNoteView = role.IsView;
            break;
          case 'coa':
            this.reportCOAView = role.IsView;
            break;
          case 'pop-master':
            this.reportPOPMasterView = role.IsView;
            break;
          case 'pop-invoice':
            this.reportPOPInvoiceView = role.IsView;
            break;
          case 'admin-workflow':
            this.reportAdminWFView = role.IsView;
            break;
        }
      });
      this.inventoryManagmentView = (this.itemMasterView || this.uomView);
      this.CRMView=true;
      this.assetManagmentView = this.assetView;
      this.purchaseManagementView = (this.serviceCategoryView || this.supplierCategoryView || this.supplierServicesView
        || this.coaAccountTypeView || this.accountSubcategoryView || this.accountCodesView
        || this.paymentTermsView || this.taxGroupView || this.gSTTypeView || this.vendorsExportView
        || this.suppliersView || this.supplierApprovalView || this.contractMasterView
        || this.purchaseOrderView || this.poView || this.pocView || this.purchaseOrderApprovalView
        || this.goodsReceivedNotesView || this.supplierInvoiceView || this.supplierInvoiceApprovalView
        || this.creditNoteView || this.creditNoteApprovalsView || this.exportInvoiceView
        || this.accrualManagementView || this.accrualReverseView || this.importPaymentsView);
      this.systemAdministrationView = (this.userManagementView || this.changePasswordView
        || this.currencyView || this.departmentView || this.workflowView || this.workflowReassignmentView
        || this.auditLogView || this.companiesView || this.roleManagementView);

        //debugger;
      this.salessettingsView = (this.customerTypeView || this.bankMasterView || this.creditTermView || this.locationMasterView
        || this.emailConfigView || this.tenantsTypeView || this.salestaxGroupView || this.taxMasterView || this.taxTypeView
        || this.customerView || this.customerApprovalView);
      this.salesManagementView = (this.salesQuotationView || this.salesQuotationApprovalView || this.salesInvoiceView || this.salesInvoiceApprovalView || this.salesInvoiceExportView)
      this.salesModuleView = (this.salessettingsView || this.salesManagementView);
      this.reportsView = this.reportSupplierView || this.reportPOView || this.reportPOCMasterView || this.reportPOCView || this.reportAPInvoiceView || this.reportAPCreditNoteView
        || this.reportCOAView || this.reportPOPMasterView || this.reportPOPInvoiceView || this.reportAdminWFView;
      this.sessionService.setRolesAccess(this.rolesAccessList);
      let roleAccessLevels = this.sessionService.getRolesAccess();

      this.salessettingsView=true;
      this.salesManagementView=true;
      this.salesManagementView=true;
      this.salesModuleView=true;


      //Hide All Menus
      this.assetManagmentView=false;
      this.inventoryManagmentView=false;
      this.purchaseManagementView=false;
      this.salesManagementView=false;

    });
  }
  onClickedOutside(e: Event) {
   
    this.lgmenu=false;
    this.showCRM=false;
    this.showinventory=false;
    this.showfixedassets=false;
    this.showfacility=false;
    this.showpurchase=false;
    this.showsystem=false;
    this.showsales=false;
  }
  menuexpand (e){ 
    this.lgmenu= !this.lgmenu;
    if(this.lgmenu==false){
      this.showCRM=false;
      this.showinventory=false;
      this.showfixedassets=false;
      this.showfacility=false;
      this.showpurchase=false;
      this.showsystem=false;
    }
  }
  inventoryexpand(e){
    this.lgmenu=true;
    this.showinventory=!this.showinventory
  }
  CRMExpand(e)
  {
    this.lgmenu=true;
    this.showCRM=!this.showCRM;
  }
  assetsexpand(e){
    this.lgmenu= true;
    this.showfixedassets=!this.showfixedassets;
  }
  facilifyexpand(e){
    this.lgmenu= true;
    this.showfacility=!this.showfacility;
  }
  purchaseexpand(e){
    this.lgmenu=true;
    this.showpurchase=!this.showpurchase;
  }
  salesexpand(e){
    this.lgmenu=true;
    this.showsales=!this.showsales;
  }
  systemexpand(e){
    this.lgmenu= true;
    this.showsystem=!this.showsystem
  }
  toggleInventorySet(e) {
    this.activeinventoryset = !this.activeinventoryset;
    this.activemanagement = false;
    this.activefacilityset = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
  }
  togglecrmSet(e)
  {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
    this.activemanagement = false;
    this.activecrmset = !this.activecrmset;
  }

  toggleCRMManagement(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
    this.activemanagement = !this.activemanagement;
  }
  toggleCRMReports(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
    this.activemanagement = false;
    this.actionCRMReportsView=!this.actionCRMReportsView;
  }
  togglefacilityset(e) {
    this.activefacilityset = !this.activefacilityset;
    this.activeinventoryset = false;
    this.activemanagement = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
  }

  toggleManagement(e) {
    debugger;
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
    this.activemanagement = !this.activemanagement;
  }
  toggleassetSet(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activemanagement = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeassetset = !this.activeassetset;
  }
  toggleassetManagement(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activemanagement = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
    this.activeassetmanagement = !this.activeassetmanagement;
  }
  toggleprojectSet(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activemanagement = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeprojectcosting = false;
    this.activeuommanagement = false;
    this.activeprojectset = !this.activeprojectset;
  }
  togglepojectcost(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activemanagement = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeprojectset = false;
    this.activeuommanagement = false;
    this.activeprojectcosting = !this.activeprojectcosting
  }
  togglecapexSet(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activemanagement = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
    this.activecapexset = !this.activecapexset;
  }
  togglecapexManagement(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activemanagement = false;
    this.activeassetset = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
    this.activecapexmanagement = !this.activecapexmanagement;
  }
  togglepurchaseSet(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activemanagement = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchasemanagement = false;
    this.activeuommanagement = false;
    this.activepurchaseset = !this.activepurchaseset;
  }
  togglepurchaseManagement(e) {
    this.activeinventoryset = false;
    this.activefacilityset = false;
    this.activemanagement = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activeuommanagement = false;
    this.activepurchasemanagement = !this.activepurchasemanagement;

  }
  togglepurchaseorder(e) {

    this.activepurchaseorder = !this.activepurchaseorder;
  }
  togglepurchaseorderpo(e) {
    this.activepopurchaseorder = !this.activepopurchaseorder;
  }
  toggleuommanagement(e) {
    this.activeuommanagement = !this.activeuommanagement;
    this.activeinventoryset = false;
    this.activemanagement = false;
    this.activepopurchaseorder = false;
    this.activefacilityset = false;
    this.activeassetset = false;
    this.activecapexmanagement = false;
    this.activepurchaseset = false;
    this.activepurchasemanagement = true;
  }
   
  showLeftNav(e) {
    this.hamburger = !this.hamburger;
    this.lefnavshow = !this.lefnavshow;
  }
  hidenav(e) {
    this.lefnavshow = false;
    this.hamburger = false;
  }


  toggleSalesManagement() {
    this.activeSalesManagement = !this.activeSalesManagement;
    this.activeSalesSettings = false;
  }

  toggleSalesSettings() {
    this.activeSalesSettings = !this.activeSalesSettings;
    this.activeSalesManagement = false;
  }

  onClick(e) {
    this.isSelected = !this.isSelected;
    this.inventory = false;
    this.asset = false;
    this.facility = false;
    this.system = false;
    this.fixedassets = false;
    this.po = false;
    this.user = false;
  }

  ClickContractMaster()
  {
    // /po/contractpolist/master/1',this.getRandomInt(10)
    //alert("Contract Master");
    this.router.navigate([`/po/contractpolist/master/${this.getRandomInt(10)}`]);
  }

  ClickCurrencyList()
  {
        this.router.navigate([`/admin/currencieslist/${this.getRandomInt(10)}`]);
  }
  ClickPOC()
  {

    this.router.navigate([`/po/contractpolist/child/${this.getRandomInt(10)}`]);
  }
}


