import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SupplierApiService } from './../../../po/services/supplier-api.service';
import { RequestDateFormatPipe } from './../../../shared/pipes/request-date-format.pipe';
import { SessionStorageService } from './../../../shared/services/sessionstorage.service';
import { SharedService } from './../../../shared/services/shared.service';
import { markAllAsTouched, ValidateFileType } from './../../../shared/shared';
import {
  AddressType, ButtonPreferences, Countries, Currency, DocumentExportData, InvoiceSection, Location, Messages, MessageTypes, Nationality,
  PTableColumn, Suppliers, User, UserDetails, WorkFlowApproval, WorkFlowProcess, WorkFlowStatus
} from '../../../../app/shared/models/shared.model';
import { BillingColumns } from '../../models/grid-columns';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { Bank, CreditTerm, CustomerTypeMaster, LocationMaster, TaxGroup, TaxType, TenantType } from '../../models/adhoc-master.model';
import { Locations } from './../../../inventory/models/item-master.model';
import { AttachmentsComponent } from './../../../shared/components/attachments/attachments.component';
import { Company } from './../../../administration/models/company';
import { CompanyApiService } from './../../../administration/services/company-api.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { GenericService } from './../../../shared/sevices/generic.service';
import { SalesInvoiceService } from '../../services/sales-Invoice.service';
import { SalesInvoice, LineItem } from '../../models/sales-Invoice.model';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from '../../services/customer.service';
import { SalesCustomer, SalesCustomerAddress, SalesCustomerSearch } from '../../models/customer-master.model';
import { QuotationLineItemsComponent } from '../quotation-line-items/quotation-line-items.component';
import { CurrencyMaskInputMode } from 'ngx-currency';
import { PurchaseOrderList } from './../../../po/models/po-creation.model';
import { SalesQuotationService } from '../../services/sales-quotation.service';
import { SalesQuotation, SalesQuotationSearch } from '../../models/sales-quotation.model';
import { SchedulerNo } from './../../../po/models/scheduler-no.model';
import { SchedulerNoService } from './../../../po/services/scheduler-no.service';
import * as XLSX from 'xlsx';
import { WorkBook, utils, write } from 'xlsx';

@Component({
  selector: 'app-sales-invoice',
  templateUrl: './sales-invoice.component.html',
  styleUrls: ['./sales-invoice.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})

export class SalesInvoiceComponent implements OnInit {
  options2precision = { prefix: '', precision: 2, inputMode: CurrencyMaskInputMode.NATURAL };
  @ViewChild(AttachmentsComponent) childAttachmentsComponent: AttachmentsComponent;
  @ViewChild(QuotationLineItemsComponent) lineItemsComponent: QuotationLineItemsComponent;
  uploadedFiles: Array<File> = [];
  showRemarksPopUp: boolean = false;
  InvoiceForm: FormGroup;
  processId: number = WorkFlowProcess.SalesInvoice;
  showLogPopUp: boolean = false
  userDetails: UserDetails = null;
  showConstomerInfoDialog: boolean = false
  companyId: number;
  reportData: any;
  scrollbarOptions: any;
  InvoiceId: number = 0;
  IsViewMode: boolean = false;
  IsReverify: boolean = false;
  departments: Locations[] = [];
  locations: LocationMaster[] = [];
  pmoduleHeading: string = "";
  billingTypes: string[] = [];
  customerTypes: CustomerTypeMaster[] = [];
  creditTerms: CreditTerm[] = [];
  addressTypes: AddressType[] = [];
  currencyTypes: Currency[] = [];
  taxGroups: TaxGroup[] = [];
  banks: Bank[] = [];
  schedulers: SchedulerNo[] = [];
  // taxTypes: TaxType[] = [];
  TaxMasterTaxName: string = '';
  TaxPercentage: number = 0;
  AddressRowIndex: number;
  approveDocument: boolean = false;
  HasTenantShow: boolean = false;
  RemarksForm: FormGroup;
  toDay = new Date();
  validityMinDate = undefined;
  BillingColumns: PTableColumn[] = [];
  followWorkflow: boolean = false
  isApprovalPage: boolean = false;
  pageType: string = "";
  moduleHeading = "";
  approvePermission: boolean = false;
  verifyPermission: boolean = false;
  viewLogPermission: boolean = false;
  sendForApprovalPermission: boolean = false;
  reVerifyPermission: boolean = false;
  printPermission: boolean = false;
  exportPermission: boolean = false;
  userRoles: any = []
  rolesAccessList = [];
  company: Company = null;
  workFlowStatus: any;
  ExistingVal: SalesInvoice;
  IsFormValueChanges: boolean = false;
  customerAddresses: SalesCustomerAddress[];
  constructor(private fb: FormBuilder,
    private sharedService: SharedService,
    private ActivateRoute: ActivatedRoute,
    private route: Router,
    private sessionService: SessionStorageService,
    private AdhocMasterService: AdhocMasterService,
    private salesInvoiceService: SalesInvoiceService,
    private salesQuotationService: SalesQuotationService,
    private customerService: CustomerService,
    private reqDateFormatPipe: RequestDateFormatPipe,
    private genricService: GenericService,
    private supplierApiService: SupplierApiService,
    private companyApiService: CompanyApiService,
    private confirmationService: ConfirmationService,
    private SchedulerMasterService: SchedulerNoService
  ) {
    this.companyId = this.sessionService.getCompanyId();
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.workFlowStatus = WorkFlowStatus;
    this.billingTypes = ['Full Billing', 'Progress Billing'];
    this.validityMinDate = {
      year: this.toDay.getFullYear(),
      month: this.toDay.getMonth() + 1,
      day: this.toDay.getDate()
    };
  }
  get f() {
    return this.InvoiceForm.controls;
  }
  get fAQuotations() {
    return (<FormArray>this.lineItemsComponent.fAQuotations);
  }
  get fABillingInfo() {
    return (<FormArray>this.InvoiceForm.get('BillingInformation'));
  }
  ngOnInit() {
    this.GetMasterData();
    this.BillingColumns = BillingColumns.filter(item => item);
    this.InvoiceForm = this.fb.group({
      InvoiceId: [0],
      CustomerType: new FormControl(null),
      InvoiceType: [2],
      Quotation: new FormControl(null),
      CompanyId: [this.companyId],
      DocumentCode: [''],
      QuotationCode: [''],
      Customer: [''],
      UnitNo: [''],
      Department: new FormControl(null),
      Reference: [''],
      Location: new FormControl(null),
      Attention: [''],
      ProjectName: [''],
      AddressType: new FormControl(null),
      Address: [''],
      CreditTerm: new FormControl(null),
      CustomerEmail: [''],
      InvoiceDetail: [''],
      Currency: new FormControl(null),
      TaxGroup: new FormControl(null),
      TaxType: new FormControl(null),
      Bank: new FormControl(null),
      Scheduler: new FormControl(null),
      SchedulerInfo: [''],
      Subject: [''],
      CustomerRefNo: [''],
      CustomerAcceptanceDate: [''],
      PurchaseIncurred: [false],
      Supplier: [],
      PoRef: [''],
      POCode: [''],
      Remarks: [''],
      Attachments: [],
      TotalLineAmount: [0],
      Discount: [0],
      TotalBeforeTax: [0],
      TaxAmount: [0],
      SubTotal: [0],
      TaxAdjustment: [0],
      NetTotal: [0],
      TotalAdjustment: [0],
      Total: [0],
      JobSheetNo: [''],
      JobSheetStatus: [''],
      JobSheetDescription: [''],
      JobCompletedDate: [''],
      WorkflowStatus: new FormControl({
        WorkFlowStatusid: WorkFlowStatus.Draft
      }),
      CreatedBy: {
        UserID: this.userDetails.UserID,
        UserName: this.userDetails.UserName
      },
      UpdatedBy: {
        UserID: this.userDetails.UserID,
        UserName: this.userDetails.UserName
      },
      CreatedDate: new Date(),
      // UpdatedDate: '',
      ButtonPreferences: new ButtonPreferences(),
      CurrentApprover: new FormControl(null),
      WorkFlowComments: null,
      Reason: null
    });
    this.RemarksForm = this.fb.group({
      Reasons: new FormControl('', [Validators.required, ControlValidator.Validator]),
      StatusId: [0]
    });
    this.ActivateRoute.paramMap.subscribe((param: ParamMap) => {
      this.InvoiceId = isNaN(Number(param.get('id'))) ? 0 : Number(param.get('id'));
      this.pageType = param.get('type');
      this.moduleHeading = this.pageType == "request" ? "Sales Invoice" : "Sales Invoice Approval";
      this.isApprovalPage = this.pageType == "approval" ? true : false;
    });
    this.ActivateRoute.queryParams.subscribe((params) => {
      this.InvoiceId = isNaN(Number(params['id'])) ? this.InvoiceId : Number(params['id']);
      if (params['cid'] != null && params['cid'] != undefined) {
        this.companyId = isNaN(Number(params['cid'])) ? this.companyId : Number(params['cid']);
      }
    });
    if (Number(this.InvoiceId) > 0) {
      this.IsViewMode = true;
      this.GetSalesInvoice();
    } else {
      // this.ExistingVal = new SalesCustomer();
      // this.addGridRow();
      // this.addBillingRow();
      this.AdhocMasterService.GetDefaultBank(this.companyId).subscribe((data: Bank) => {
        let selectedb = this.banks.find(x => x.BankMasterId == data.BankMasterId);
        this.f.Bank.setValue(selectedb);
      });
      this.edit();
    }
    // this.InvoiceForm.valueChanges.subscribe((form: SalesCustomer) => {
    //   debugger
    //   this.IsFormValueChanges = false;
    //   for (var key in this.ExistingVal) {
    //     var formcontrol = form[key];
    //     if (formcontrol != null) {
    //       var JsonFC;
    //       var JsonEV;
    //       JsonFC = formcontrol.toString().trim();
    //       JsonEV = this.ExistingVal[key].toString().trim();

    //       if (JsonFC == "[object Object]") {
    //         let newtg: TaxGroup = formcontrol;
    //         let oldtg: TaxGroup = this.ExistingVal[key];
    //         if (newtg.TaxGroupId != oldtg.TaxGroupId) {
    //           this.IsFormValueChanges = true;
    //           break;
    //         };
    //       }
    //       else if (JsonFC.trim() != JsonEV.trim()) {
    //         this.IsFormValueChanges = true;
    //         break;
    //       }
    //     }
    //   }
    // });
    this.getRoles();
  }
  CustomerNameInputFormatter = (x: any) => x.CustomerName;
  CustomerNameSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        let customerType = this.InvoiceForm.get('CustomerType').value;
        if (customerType != null) {
          let search: SalesCustomerSearch = {
            SearchTerm: term,
            CustomerTypeId: customerType.CustomerTypeId,
            IsApprovalPage: false,
            CompanyId: this.companyId,
            UserId: this.userDetails.UserID,
            FetchFilterData: true,
            FetchApproved: true
          };
          return this.customerService.GetCustomers(search).map((data) => {
            return data;
          }).pipe(catchError(() => {
            return of([]);
          }))
        }
      })
    );
  onCustomerSelectItem(event: any) {
    let selectedCustomerIPSId = event.item.CustomerIPSId;
    this.customerService.GetCustomer(selectedCustomerIPSId).subscribe((x: SalesCustomer) => {
      this.resetCustomerData(x);
      this.lineItemsComponent.GetTaxTypes(this.get('TaxGroup', 'TaxGroupId'));
    });
  }
  onAddressTypeChange() {
    var type = this.f.AddressType.value;
    var address: SalesCustomerAddress = this.customerAddresses.find(x => x.AddressType.AddressTypeId == type.AddressTypeId) || new SalesCustomerAddress();
    this.f.Address.setValue(address.FullAddress);
  }
  resetCustomerData(data: SalesCustomer) {
    if (data == null) {
      this.f.CreditTerm.reset();
      this.f.Currency.reset();
      this.f.TaxGroup.reset();
      this.f.TaxType.reset();
      this.f.Attention.reset();
      this.f.Customer.reset();
      this.f.AddressType.reset();
      this.f.Address.reset();
      this.f.CustomerEmail.reset();
    } else {
      let selectedcdt = this.creditTerms.find(x => x.CreditTermId == data.CreditTerm.CreditTermId);
      this.f.CreditTerm.setValue(selectedcdt);
      let selectedcc = this.currencyTypes.find(x => x.Id == data.Currency.Id);
      this.f.Currency.setValue(selectedcc);
      let selectedtg = this.taxGroups.find(x => x.TaxGroupId == data.TaxGroup.TaxGroupId);
      this.f.TaxGroup.setValue(selectedtg);
      let selectedAddressType;
      let selectedAddress;
      let mail;
      let attention;
      try {
        let billing = data.CustomerAddresses.filter(x => x.AddressType.AddressTypeId == 1)[0];
        selectedAddressType = this.addressTypes.find(x => x.AddressTypeId == billing.AddressType.AddressTypeId);
        selectedAddress = billing.FullAddress;
        mail = billing.Email;
        attention = billing.Attention;
      }
      catch {
        let other = data.CustomerAddresses[0];
        selectedAddressType = this.addressTypes.find(x => x.AddressTypeId == other.AddressType.AddressTypeId);
        selectedAddress = other.FullAddress;
        mail = other.Email;
        attention = other.Attention;
      }
      this.customerAddresses = data.CustomerAddresses;
      this.f.AddressType.setValue(selectedAddressType);
      this.f.Address.setValue(selectedAddress);
      this.f.CustomerEmail.setValue(mail);
      this.f.Attention.setValue(attention);
      // let selectedtt = this.taxTypes.find(x => x.TaxTypeId == data.TaxType.TaxTypeId);
      this.f.TaxType.setValue(data.TaxType);
      this.GetTaxTypes();
    }
  }
  GetMasterData() {
    this.getDepartments();
    this.getLocationMasters();
    this.GetCurrencyType();
    this.GetBanks();
    this.GetSchedulerTypes();
    this.getCompanyDetails();
    this.GetCustomerMasterType();
    this.GetCreditTermMasterType();
    this.GetTaxMasterType();
    this.GetAddressTypes();
  }


  initBillingInfo() {
    let type = this.InvoiceForm.get('BillingInstruction').value;
    return this.fb.group({
      BillingInfoId: [0],
      InvoiceId: [0],
      Narration: [type == 'Full Billing' ? `${type}` : `Progressive Billing - ${this.fABillingInfo.controls.length + 1}`],
      PercentageToBill: [type == 'Full Billing' ? 100 : 0],
      AmountToBill: [type == 'Full Billing' ? this.get('TotalBeforeTax') : 0],
      ExpectedBillingDate: [''],
      CreditTerm: [''],
      Attachment: [''],
      InvoiceNo: ['']
    })
  }
  OnPercentToBillChange(index: number) {
    let totalBefTax: number = this.get('TotalBeforeTax');
    this.fABillingInfo.controls.forEach((x, i) => {
      if (i == index) {
        let percentage = x.get('PercentageToBill').value;
        let amount = (totalBefTax * percentage) / 100;
        x.get('AmountToBill').setValue(amount);
        return;
      }
    });
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
              let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
              this.viewLogPermission = auditLogRole.IsView;
              if (this.isApprovalPage) {
                let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "salesinvoiceapproval")[0];
                this.approvePermission = approvalRole.IsApprove;
                this.verifyPermission = approvalRole.IsVerify;
              }
              if (!this.isApprovalPage) {
                let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "salesinvoice")[0];
                // this.VoidPermission =  (approvalRole.IsVoid);
                // this.printPermission =   (approvalRole.IsPrint);
                this.reVerifyPermission = (approvalRole.IsVerify);
                this.sendForApprovalPermission = (approvalRole.IsApprove);
                this.printPermission = approvalRole.IsPrint;
                this.exportPermission = approvalRole.IsExport;
              }
            }
          });
        }
      });
    }
  }

  addBillingRow() {
    this.fABillingInfo.push(this.initBillingInfo());
  }

  GetSalesInvoice() {
    this.salesInvoiceService.GetSalesInvoice(this.InvoiceId).subscribe((data: SalesInvoice) => {
      this.resetFormData(data);
      this.onDeptChange();
    });
  }

  SaveRecord(value: string) {
    this.setControlValidator(value);
    if (this.InvoiceForm.valid) {
      if (this.fAQuotations.valid) {
        if (this.validateAttachments(value)) {
          if ((value == 'Send' || value == 'Save') && !this.IsReverify) {
            this.f.WorkflowStatus.setValue({
              WorkFlowStatusid: (value == 'Send') ? WorkFlowStatus.SendForApproval : (value == 'Save') ? WorkFlowStatus.Draft : 0,
              Statustext: ''
            });
          }
          this.PostSalesInvoice();
        }
      }
      else {
        this.lineItemsComponent.markLinesTouched();
      }
    }
    else {
      markAllAsTouched(this.InvoiceForm);
    }
    console.log(this.InvoiceForm.value);
  }
  validateAttachments(value: string): boolean {
    if (value == 'Send') {
      var attachment = this.f.Attachments;
      attachment.setValidators([Validators.required]);
      if (this.childAttachmentsComponent.uploadedFiles.length > 0) {
        attachment.clearValidators();
      }
      attachment.updateValueAndValidity();
      if (attachment.invalid || (this.IsReverify && this.childAttachmentsComponent.uploadedFiles.length == 0)) {
        this.confirmationService.confirm({
          message: "Please Attach Original Attachment File(s)",
          header: Messages.DeletePopupHeader,
          accept: () => {
          },
          rejectVisible: false,
          acceptLabel: "Ok"
        });
        return false;
      }
    }
    return true;
  }
  setControlValidator(value: string) {
    var customerType = this.f.CustomerType;
    var currency = this.f.Currency;
    var invoiceDetail = this.f.InvoiceDetail;
    var creditTerm = this.f.CreditTerm;
    var customer = this.f.Customer;
    var dept = this.f.Department;
    var creditTerm = this.f.CreditTerm;
    var attachment = this.f.Attachments;
    var taxGroup = this.f.TaxGroup;
    var unitNo = this.f.UnitNo;
    var acceptanceDate = this.f.CustomerAcceptanceDate;
    var jobCompletedDate = this.f.JobCompletedDate;
    var bank = this.f.Bank;
    acceptanceDate.setErrors(null);
    jobCompletedDate.setErrors(null);
    attachment.clearValidators();
    customer.clearValidators();
    unitNo.clearValidators();
    invoiceDetail.clearValidators();
    bank.clearValidators();
    customerType.setValidators([Validators.required]);
    invoiceDetail.setValidators([Validators.required]);
    customer.setValidators([Validators.required]);
    creditTerm.setValidators([Validators.required]);
    dept.setValidators([Validators.required]);
    currency.setValidators([Validators.required]);
    bank.setValidators([Validators.required]);
    this.fAQuotations.setValidators([Validators.required]);
    if (customerType.value != null && customerType.value.CustomerTypeName.toLowerCase().indexOf('tenant') > -1) {
      unitNo.setValidators([Validators.required]);
    }
    if (value == 'Send') {
    }
    if (value == 'Verify') {

    }
    customerType.updateValueAndValidity();
    taxGroup.updateValueAndValidity();
    customer.updateValueAndValidity();
    attachment.updateValueAndValidity();
    unitNo.updateValueAndValidity();
    currency.updateValueAndValidity();
    creditTerm.updateValueAndValidity();
    dept.updateValueAndValidity();
    invoiceDetail.updateValueAndValidity();
    bank.updateValueAndValidity();
    this.fAQuotations.updateValueAndValidity();
  }
  poSelection(eventData: any) {
    this.InvoiceForm.get('POCode').setValue(eventData.item.PurchaseOrderCode);
  }
  PostSalesInvoice() {
    let Invoice: SalesInvoice = this.InvoiceForm.value;
    Invoice.LineItems = this.lineItemsComponent.fAQuotations.value;
    Invoice.JobCompletedDate = this.reqDateFormatPipe.transformDateWithNull(this.get('JobCompletedDate'));
    Invoice.CustomerAcceptanceDate = this.reqDateFormatPipe.transformDateWithNull(this.get('CustomerAcceptanceDate'));
    this.uploadedFiles = this.childAttachmentsComponent.uploadedFiles;
    this.salesInvoiceService.PostSalesInvoice(Invoice, this.uploadedFiles).subscribe((Id: number) => {
      if (Id > 0) {
        if (this.approveDocument) {
          if (this.InvoiceForm.valid) {
            this.ApproveDocument();
          }
        }
        this.sharedService.showMessage({
          ShowMessage: true,
          Message: Invoice.InvoiceId == 0 ? Messages.SavedSuccessFully : Messages.UpdatedSuccessFully,
          MessageType: MessageTypes.Success
        });
        this.InvoiceForm.reset();
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.OnCancel();
      }
      // else if (Id == -1) {
      //   this.f.CustomerId.setErrors({ 'duplicate': true });
      // }
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

  onDeptChange() {
    this.followWorkflow = false;
    var dept: any = this.departments.filter(x => x.LocationID == this.f.Department.value.LocationID);
    if (dept != null && dept.length > 0) {
      this.followWorkflow = (dept[0].IsFollowWorkflow && dept[0].HasWorkflow) ? true : false;
    }
  }

  onFileClose(fileIndex: number) {
    this.uploadedFiles = this.uploadedFiles.filter((file, index) => index != fileIndex);
  }

  attachmentDelete(attachmentIndex: number) {

    this.confirmationService.confirm({
      message: Messages.AttachmentDeleteConfirmation,
      header: Messages.DeletePopupHeader,
      accept: () => {
        // let attachmentRecord = this.CustomerMasterDetails.Attachments[attachmentIndex];
        // attachmentRecord.IsDelete = true;
        // this.CustomerMasterDetails.Attachments = this.CustomerMasterDetails.Attachments.filter((obj, index) => index > -1);
      },
      reject: () => {
      }
    });

  }
  poInputFormatter = (x: PurchaseOrderList) => x.PurchaseOrderCode;
  poSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term == "") {

          return of([]);
        }
        return this.sharedService.getAllSearchPurchaseOrders({
          Search: term,
          SupplierId: this.get('Supplier', 'SupplierId'),
          CompanyId: this.companyId,
          UserId: this.userDetails.UserID,
          From: "GRN",
          WorkFlowStatusId: WorkFlowStatus.Approved
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
  supplierInputFormater = (x: Suppliers) => x.WorkFlowStatus === "Approved" ? x.SupplierName : "";
  supplierSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term == "") {

          return of([]);
        }
        return this.sharedService.getSuppliers({
          searchKey: term,
          supplierTypeId: 0,
          CompanyId: this.companyId
        }).pipe(
          catchError(() => {
            return of([]);
          }))
      })
    );

  deleteRow(index) {
    this.fAQuotations.removeAt(index);
  }
  getCompanyDetails() {
    this.companyApiService.getCompanyById(this.companyId).subscribe((data: Company) => {
      if (data != null) {
        this.company = data;
      }
    });
  }
  getDepartments() {
    this.sharedService.getUserDepartments(this.companyId, this.processId, this.userDetails.UserID).subscribe((data: Location[]) => {
      this.departments = data;
    });
  }
  getLocationMasters() {
    this.AdhocMasterService.GetLocations(this.companyId).subscribe((data: LocationMaster[]) => {
      this.locations = data;
    });
  }
  GetCustomerMasterType() {
    this.AdhocMasterService.GetCustomerTypes().subscribe((data: CustomerTypeMaster[]) => { this.customerTypes = data });
  }
  GetCreditTermMasterType() {
    this.AdhocMasterService.GetCreditTerms(this.companyId).subscribe((data: CreditTerm[]) => { this.creditTerms = data });
  }
  GetCurrencyType() {
    this.supplierApiService.getCurrencies().subscribe((data: Currency[]) => {
      this.currencyTypes = data;
      if (this.InvoiceId == 0) {
        let selectedcc = this.currencyTypes.find(x => x.Id == this.company.Currency.Id);
        this.f.Currency.setValue(selectedcc);
      }
    });
  }
  GetTaxMasterType() {
    this.AdhocMasterService.GetTaxGroups(this.companyId).subscribe((data: TaxGroup[]) => { this.taxGroups = data });
  }
  GetTaxTypes() {
    if (this.f.TaxGroup.value != undefined) {
      this.lineItemsComponent.GetTaxTypes(this.get('TaxGroup', 'TaxGroupId'));
    }
  }
  GetBanks() {
    this.AdhocMasterService.GetBanks(this.companyId).subscribe((data: Bank[]) => { this.banks = data });
  }
  GetAddressTypes() {
    this.sharedService.GetAddressTypes().subscribe((result: AddressType[]) => { this.addressTypes = result; });
  }
  GetSchedulerTypes() {
    this.SchedulerMasterService.GetSchedulerByType('AR').subscribe((data: SchedulerNo[]) => { this.schedulers = data; });
  }
  countryInputFormater = (x: Countries) => x.Name;
  countryNameSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.sharedService.getSearchCountries({
          searchKey: term,
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

  edit() {
    this.IsViewMode = false;

  }
  Reverify() {
    this.IsReverify = true;
  }
  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
  resetQuotationData(data: SalesQuotation) {
    debugger
    this.f.UnitNo.reset();
    this.f.Reference.reset();
    if (data == null) {
      this.f.CreditTerm.reset();
      this.f.Currency.reset();
      this.f.TaxGroup.reset();
      this.f.TaxType.reset();
      this.f.Attention.reset();
      this.f.Customer.reset();
      this.f.AddressType.reset();
      this.f.Address.reset();
      this.f.CustomerEmail.reset();
    } else {
      let selectedcdt = this.creditTerms.find(x => x.CreditTermId == data.CreditTerm.CreditTermId);
      this.f.CreditTerm.setValue(selectedcdt);
      let selectedcc = this.currencyTypes.find(x => x.Id == data.Currency.Id);
      this.f.Currency.setValue(selectedcc);
      let selectedtg = this.taxGroups.find(x => x.TaxGroupId == data.TaxGroup.TaxGroupId);
      this.f.TaxGroup.setValue(selectedtg);
      let selectedAddressType = this.addressTypes.find(x => x.AddressTypeId == data.AddressType.AddressTypeId);
      this.f.UnitNo.setValue(data.UnitNo);
      this.f.Reference.setValue(data.Reference);
      this.f.Attention.setValue(data.Attention);
      this.f.AddressType.setValue(selectedAddressType);
      this.f.Address.setValue(data.Address);
      this.f.CustomerEmail.setValue(data.CustomerEmail);
      this.f.ProjectName.setValue(data.ProjectName);
      // let selectedtt = this.taxTypes.find(x => x.TaxTypeId == data.TaxType.TaxTypeId);
      this.f.TaxType.setValue(data.TaxType);
      this.GetTaxTypes();
    }
  }
  resetFormData(data: SalesInvoice) {
    this.InvoiceForm.reset();
    this.InvoiceForm.patchValue({
      'InvoiceId': data.InvoiceId,
      'CompanyId': data.CompanyId,
      'DocumentCode': data.DocumentCode,
      'QuotationCode': data.QuotationCode,
      'WorkflowStatus': data.WorkflowStatus,
      'CreatedBy': data.CreatedBy,
      'CreatedDate': data.CreatedDate,
      'TotalLineAmount': data.TotalLineAmount,
      'Discount': data.Discount,
      'TotalBeforeTax': data.TotalBeforeTax,
      'TaxAmount': data.TaxAmount,
      'SubTotal': data.SubTotal,
      'TaxAdjustment': data.TaxAdjustment,
      'NetTotal': data.NetTotal,
      'TotalAdjustment': data.TotalAdjustment,
      'Total': data.Total,
      'Remarks': data.Remarks,
      'PurchaseIncurred': data.PurchaseIncurred,
      'CustomerRefNo': data.CustomerRefNo,
      'ProjectName': data.ProjectName,
      'Subject': data.Subject,
      'CustomerEmail': data.CustomerEmail,
      'Address': data.Address,
      'Attention': data.Attention,
      'Reference': data.Reference,
      'UnitNo': data.UnitNo,
      'Customer': data.Customer,
      'CustomerAcceptanceDate': data.CustomerAcceptanceDate == null ? '' : new Date(data.CustomerAcceptanceDate),
      'Supplier': data.Supplier,
      'POCode': data.POCode,
      'ButtonPreferences': data.ButtonPreferences,
      'CurrentApprover': data.CurrentApprover,
      'Attachments': data.Attachments,
      'AddressType': data.AddressType,
      'Currency': data.Currency,
      'CustomerType': data.CustomerType,
      'Department': data.Department,
      'CreditTerm': data.CreditTerm,
      'Location': data.Location,
      'SchedulerInfo': data.SchedulerInfo,
      'InvoiceDetail': data.InvoiceDetail,
      'JobSheetNo': data.JobSheetNo,
      'JobSheetStatus': data.JobSheetStatus,
      'JobSheetDescription': data.JobSheetDescription,
      'JobCompletedDate': data.JobCompletedDate == null ? '' : new Date(data.JobCompletedDate),
      'WorkFlowComments': data.WorkFlowComments
    });
    if (data.TaxGroup) {
      let selectedtg = this.taxGroups.find(x => x.TaxGroupId == data.TaxGroup.TaxGroupId);
      this.InvoiceForm.get('TaxGroup').setValue(selectedtg);
    }
    this.GetTaxTypes();
    this.TaxMasterTaxName = data.TaxMaster.TaxName;
    try {
      this.TaxPercentage = data.LineItems[0].TaxPercentage;
    }
    catch { }
    this.customerAddresses = data.CustomerData.CustomerAddresses;
    let selectedat = this.addressTypes.find(x => x.AddressTypeId == data.AddressType.AddressTypeId);
    this.f.AddressType.setValue(selectedat);
    let selectedc = this.currencyTypes.find(x => x.Id == data.Currency.Id);
    this.f.Currency.setValue(selectedc);
    let selectedct = this.customerTypes.find(x => x.CustomerTypeId == data.CustomerType.CustomerTypeId);
    this.f.CustomerType.setValue(selectedct);
    let selectedd = this.departments.find(x => x.LocationID == data.Department.LocationID);
    this.f.Department.setValue(selectedd);
    let selectedcdt = this.creditTerms.find(x => x.CreditTermId == data.CreditTerm.CreditTermId);
    this.f.CreditTerm.setValue(selectedcdt);
    let selectedb = this.banks.find(x => x.BankMasterId == data.Bank.BankMasterId);
    this.f.Bank.setValue(selectedb);
    if (data.Scheduler) {
      let selectedSN = this.schedulers.find(x => x.SchedulerNoId == data.Scheduler.SchedulerNoId);
      this.f.Scheduler.setValue(selectedSN);
    }
    try {
      let selectedlm = this.locations.find(x => x.LocationMasterId == data.Location.LocationMasterId);
      this.f.Location.setValue(selectedlm);
    }
    catch { }
    data.LineItems.forEach(x => {
      this.lineItemsComponent.addGridRow(x);
    });
    this.f.UpdatedBy.setValue(this.userDetails);
    // console.log(this.InvoiceForm.value);
    // this.ExistingVal = this.InvoiceForm.value;
  }
  OnCancel() {
    // let result: boolean = true;
    // if (this.IsFormValueChanges) {
    //   result = confirm(Messages.DiscardWarning);
    // }
    // if (result) {
    //   this.route.navigate([`/adhoc/invoice/list/${this.pageType}`]);
    // }
    this.ActivateRoute.queryParams.subscribe((params) => {
      if (params['from'] == 'sq') {
        this.route.navigate([`/adhoc/quotation/list/${this.pageType}`]);
      }
      else {
        this.route.navigate([`/adhoc/invoice/list/${this.pageType}`]);
      }
    });
  }
  get(fc, prop?: any) {
    return this.f[fc].value == null ? '' : prop == null ? this.f[fc].value : this.f[fc].value[prop];
  }
  ShowRemarksPopUp(statusId: number) {
    switch (statusId) {
      case WorkFlowStatus.Rejected: {
        this.pmoduleHeading = "Sales Invoice Reject Reason";
        break;
      }
      case WorkFlowStatus.CancelledApproval: {
        this.pmoduleHeading = "Sales Invoice Cancel Approval Reason";
        break;
      }
      case WorkFlowStatus.Void: {
        this.pmoduleHeading = "Sales Invoice Void Reason";
        break;
      }
      case WorkFlowStatus.CancelDraft: {
        this.pmoduleHeading = "Sales Invoice Cancel Draft Reason";
        break;
      }
      default: {
        break;
      }
    };
    this.showRemarksPopUp = true;
    this.RemarksForm.patchValue({
      Reasons: "",
      StatusId: statusId
    });
  }
  ProceedRemarks() {
    if (this.RemarksForm.invalid) {
      this.RemarksForm.controls['Reasons'].markAsTouched()
      return;
    } else {
      switch (this.RemarksForm.get('StatusId').value) {
        case WorkFlowStatus.Rejected: {
          this.RejectDocument();
          break;
        }
        case WorkFlowStatus.Void: {
          this.VoidDocument();
          break;
        }
        case WorkFlowStatus.CancelledApproval: {
          this.CancelApprovalDocument();
          break;
        }
        case WorkFlowStatus.CancelDraft: {
          this.CancelDraftRecord();
          break;
        }
      }
      this.showRemarksPopUp = false;
    }
  }
  VoidDocument() {
    let workFlowStatus: WorkFlowApproval = {
      DocumentId: this.f.InvoiceId.value,
      UserId: this.userDetails.UserID,
      WorkFlowStatusId: WorkFlowStatus.Void,
      Remarks: this.RemarksForm.controls['Reasons'].value,
      RequestUserId: this.f.CreatedBy.value.UserID,
      DocumentCode: this.f.DocumentCode.value,
      ProcessId: this.processId,
      CompanyId: this.companyId,
      ApproverUserId: 0,
      IsReApproval: false
    };
    this.genricService.VoidDocument(workFlowStatus).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: 'Sales Invoice Status Changed to Void',
        MessageType: MessageTypes.Success
      });
      this.OnCancel();
      this.showRemarksPopUp = false;
    });
  }
  CancelDraftRecord() {
    this.confirmationService.confirm({
      message: "Do you really want to Cancel the Draft ?",
      header: 'Are you sure!',
      accept: () => {
        let workFlowStatus: WorkFlowApproval = {
          DocumentId: this.f.InvoiceId.value,
          UserId: this.userDetails.UserID,
          WorkFlowStatusId: WorkFlowStatus.CancelDraft,
          Remarks: this.RemarksForm.get('Reasons').value,
          RequestUserId: this.f.CreatedBy.value.UserID,
          DocumentCode: this.f.DocumentCode.value,
          ProcessId: this.processId,
          CompanyId: this.companyId,
          ApproverUserId: 0,
          IsReApproval: false
        };
        this.genricService.CancelDraftDocument(workFlowStatus).subscribe((data) => {
          this.sharedService.showMessage({
            ShowMessage: true,
            Message: 'Sales Invoice Status Changed to Cancel Draft',
            MessageType: MessageTypes.Success
          });
          this.showRemarksPopUp = false;
          this.OnCancel();
        });
      },
      rejectVisible: false,
      acceptLabel: "Ok"
    });
  }
  onApproveClick() {
    if (this.verifyPermission) {
      this.approveDocument = true;
      this.SaveRecord('Verify');
    }
    else {
      this.ApproveDocument();
    }
  }
  ApproveDocument() {
    let workFlowDetails: WorkFlowApproval = {
      ProcessId: this.processId,
      CompanyId: this.f.CompanyId.value,
      DocumentId: this.f.InvoiceId.value,
      WorkFlowStatusId: WorkFlowStatus.Approved,
      ApproverUserId: this.userDetails.UserID,
      DocumentCode: this.f.DocumentCode.value,
      Remarks: '',
      UserId: this.userDetails.UserID,
      RequestUserId: this.f.CreatedBy.value.UserID,
      ReferenceDocumentId: 0,
      ReferenceProcessId: 0
    };
    this.genricService.ApproveDocument(workFlowDetails).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: 'Sales Invoice approved successfully.',
        MessageType: MessageTypes.Success
      });
      this.OnCancel();
      this.showRemarksPopUp = false;
    });
  }
  RejectDocument() {
    let workFlowDetails: WorkFlowApproval = {
      ProcessId: this.processId,
      CompanyId: this.f.CompanyId.value,
      DocumentId: this.f.InvoiceId.value,
      WorkFlowStatusId: WorkFlowStatus.Rejected,
      ApproverUserId: this.userDetails.UserID,
      DocumentCode: this.f.DocumentCode.value,
      Remarks: this.RemarksForm.get('Reasons').value,
      UserId: this.f.CreatedBy.value.UserID,
      RequestUserId: this.f.CreatedBy.value.UserID
    };
    this.genricService.RejectDocument(workFlowDetails).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: 'Sales Invoice Rejected',
        MessageType: MessageTypes.Success
      });
      this.OnCancel();
      this.showRemarksPopUp = false;
    });
  }
  CancelApprovalDocument() {
    let workFlowDetails: WorkFlowApproval = {
      ProcessId: this.processId,
      CompanyId: this.f.CompanyId.value,
      DocumentId: this.f.InvoiceId.value,
      WorkFlowStatusId: WorkFlowStatus.CancelledApproval,
      ApproverUserId: this.f.CurrentApprover.value.UserID,
      DocumentCode: this.f.DocumentCode.value,
      Remarks: this.RemarksForm.get('Reasons').value,
      UserId: this.userDetails.UserID,
      RequestUserId: this.f.CreatedBy.value.UserID
    };
    this.genricService.CancelApprovalDocument(workFlowDetails).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: 'Sales Invoice approval cancelled.',
        MessageType: MessageTypes.Success
      });
      this.OnCancel();
      this.showRemarksPopUp = false;
    });
  }
  onBillingChange() {
    this.fABillingInfo.controls = [];
    this.addBillingRow();
  }
  updateTotal(e) {
    debugger
    let subTotal: number = Number(e.SumTotalBefTax) + Number(e.SumTaxAmount);
    let taxAdj: number = Number(this.f.TaxAdjustment.value);
    let netTotal: number = subTotal + taxAdj;
    let totalAdj: number = Number(this.f.TotalAdjustment.value);
    let total: number = Number(netTotal) + totalAdj;
    this.f.TotalLineAmount.setValue(e.SumTotalBefDiscount);
    this.f.Discount.setValue(e.SumDiscount);
    this.f.TotalBeforeTax.setValue(e.SumTotalBefTax);
    this.f.TaxAmount.setValue(e.SumTaxAmount);
    this.f.SubTotal.setValue(subTotal);
    this.f.NetTotal.setValue(netTotal);
    this.f.Total.setValue(total);
  }
  TotalAdjustment() {
    debugger
    this.f.TaxAdjustment.setErrors(null);
    this.f.TotalAdjustment.setErrors(null);
    let subTotal: number = Number(this.f.SubTotal.value);
    let taxAdj: number = Number(this.f.TaxAdjustment.value);
    if (taxAdj > 0.99) {
      this.f.TaxAdjustment.setErrors({ 'TaxAdjustErr': true });
    }
    else if (taxAdj < -0.99 && taxAdj != 0) {
      this.f.TaxAdjustment.setErrors({ 'TaxAdjustMinusErr': true });
    }
    let netTotal: number = Number(subTotal + taxAdj);
    this.f.NetTotal.setValue(netTotal);
    let totalAdj: number = Number(this.f.TotalAdjustment.value);
    if (totalAdj > 0.99) {
      this.f.TotalAdjustment.setErrors({ 'TotalAdjustErr': true });
    }
    else if (totalAdj < -0.99 && totalAdj != 0) {
      this.f.TotalAdjustment.setErrors({ 'TotalAdjustMinusErr': true });
    }
    let total: number = Number(totalAdj + netTotal);
    this.f.Total.setValue(total);
  }
  onPDFPrint() {
    this.genricService.PrintDocument(this.InvoiceId, this.processId, this.companyId).subscribe((data) => {
      saveAs(new Blob([(data)], { type: 'application/pdf' }), "SalesInvoice" + this.get('DocumentCode') + ".pdf");
    });
  }
  SendDocumentEmail() {
    this.genricService.SendDocumentEmail(this.InvoiceId, this.processId, this.companyId, this.get('Department', 'LocationID')).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: Messages.DocumentSentCustomer,
        MessageType: MessageTypes.Success
      });
    });
  }
  exportDocument() {
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
    this.salesInvoiceService.ExportSIDocument(this.InvoiceId, this.userDetails.UserID).subscribe((result: any) => {
      if (result != null) {
        this.reportData = result;
        this.reportData.Invoices.forEach((e: InvoiceSection, i) => {
          ws1DataDetails.push(e);
        });
        this.reportData.InvoiceDetails.forEach((e, i) => {
          ws2DataDetails.push(e);
        });
        this.reportData.InvoicePaymentScheduleSections.forEach((e, i) => {
          ws3DataDetails.push(e);
        });
        this.reportData.InvoiceOptinalFieldsSections.forEach((e, i) => {
          ws4DataDetails.push(e);
        });
        this.reportData.InvoiceDetailsOptinalFieldsSections.forEach((e, i) => {
          ws5DataDetails.push(e);
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
          let ExcelExportFileName = "ExportSalesInvoice" + (new Date().getDate()) + ".xlsx";
          saveAs(new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }), ExcelExportFileName);
          // let workFlowDetails: WorkFlowApproval = {
          //   ProcessId: this.processId,
          //   CompanyId: this.InvoiceForm.get('CompanyId').value,
          //   DocumentId: this.InvoiceForm.get('InvoiceId').value,
          //   WorkFlowStatusId: WorkFlowStatus.Exported,
          //   ApproverUserId: 0,
          //   DocumentCode: '',
          //   Remarks: '',
          //   UserId: this.userDetails.UserID
          // };
          //this.genricService.UpdateDocumentStatus(workFlowDetails).subscribe((x: boolean) => {
          this.GetSalesInvoice();
          //});
        };
        req.send();
      }
    });
  }
  s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    };
    return buf;
  }
}