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
  AddressType, ButtonPreferences, Countries, Currency, Location, Messages, MessageTypes, Nationality,
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
import { SalesQuotationService } from '../../services/sales-quotation.service';
import { SalesQuotation, LineItem } from '../../models/sales-quotation.model';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from '../../services/customer.service';
import { SalesCustomer, SalesCustomerAddress, SalesCustomerSearch } from '../../models/customer-master.model';
import { QuotationLineItemsComponent } from '../quotation-line-items/quotation-line-items.component';
import { CurrencyMaskInputMode } from 'ngx-currency';
import { PurchaseOrderList } from './../../../po/models/po-creation.model';
import { environment } from './../../../../environments/environment';

@Component({
  selector: 'app-quotation',
  templateUrl: './quotation.component.html',
  styleUrls: ['./quotation.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class QuotationComponent implements OnInit {
  options2precision = { prefix: '', precision: 2, inputMode: CurrencyMaskInputMode.NATURAL };
  @ViewChild(AttachmentsComponent) childAttachmentsComponent: AttachmentsComponent;
  @ViewChild(QuotationLineItemsComponent) lineItemsComponent: QuotationLineItemsComponent;
  uploadedFiles: Array<File> = [];
  apiEndPoint: string;
  uploadedBillingFiles: Array<File> = [];
  showRemarksPopUp: boolean = false;
  QuotationForm: FormGroup;
  processId: number = WorkFlowProcess.SalesQuotation;
  showLogPopUp: boolean = false
  userDetails: UserDetails = null;
  showConstomerInfoDialog: boolean = false
  companyId: number;
  scrollbarOptions: any;
  QuotationId: number = 0;
  IsViewMode: boolean = false;
  EditBillingInfo: boolean = false;
  EditCustomerInfo: boolean = false;
  IsReverify: boolean = false;
  departments: Locations[] = [];
  locations: LocationMaster[] = [];
  pmoduleHeading: string = "";
  disableSaveBilling: boolean = true;
  billingTypes: string[] = [];
  customerTypes: CustomerTypeMaster[] = [];
  creditTerms: CreditTerm[] = [];
  addressTypes: AddressType[] = [];
  currencyTypes: Currency[] = [];
  banks: Bank[] = [];
  taxGroups: TaxGroup[] = [];
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
  printPermission: boolean = false;
  reVerifyPermission: boolean = false;
  userRoles: any = []
  rolesAccessList = [];
  company: Company = null;
  workFlowStatus: any;
  ExistingVal: SalesQuotation;
  IsFormValueChanges: boolean = false;
  IsMarkForBilling: boolean = false;
  customerAddresses: SalesCustomerAddress[]
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private ActivateRoute: ActivatedRoute,
    private route: Router,
    private sessionService: SessionStorageService,
    private AdhocMasterService: AdhocMasterService,
    private salesQuotationService: SalesQuotationService,
    private customerService: CustomerService,
    private reqDateFormatPipe: RequestDateFormatPipe,
    private genricService: GenericService,
    private supplierApiService: SupplierApiService,
    private companyApiService: CompanyApiService,
    private confirmationService: ConfirmationService,
  ) {
    this.companyId = this.sessionService.getCompanyId();
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.GetMasterData();
    this.workFlowStatus = WorkFlowStatus;
    // this.billingTypes = ['Full Billing', 'Progress Billing'];
    this.billingTypes = ['Full Billing'];
    this.apiEndPoint = environment.apiEndpoint;
    this.validityMinDate = {
      year: this.toDay.getFullYear(),
      month: this.toDay.getMonth() + 1,
      day: this.toDay.getDate()
    };
  }
  get f() {
    return this.QuotationForm.controls;
  }
  get fAQuotations() {
    return (<FormArray>this.lineItemsComponent.fAQuotations);
  }
  get fABillingInfo() {
    return (<FormArray>this.QuotationForm.get('BillingInfos'));
  }
  ngOnInit() {
    this.BillingColumns = BillingColumns.filter(item => item);
    this.QuotationForm = this.fb.group({
      QuotationId: [0],
      CustomerType: new FormControl(null),
      CompanyId: [this.companyId],
      DocumentCode: [''],
      Customer: [''],
      ValidityDate: [addDays(new Date(), 7)],
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
      Bank: new FormControl(null),
      Currency: new FormControl(null),
      TaxGroup: new FormControl(null),
      TaxMaster: new FormControl(null),
      TaxType: new FormControl(null),
      Subject: [''],
      CustomerRefNo: [''],
      CustomerAcceptanceDate: [''],
      PurchaseIncurred: [false],
      Supplier: [],
      PoRef: [''],
      POCode: [''],
      Remarks: [''],
      SalesQuotationItems: this.fb.array([]),
      MarkForBilling: [false],
      BillingInstruction: [''],
      FileDetails: [''],
      BillingInfos: this.fb.array([]),
      Attachments: [],
      TotalLineAmount: [0],
      Discount: [0],
      TotalBeforeTax: [0],
      TaxAmount: [0],
      Total: [0],
      JobSheetNo: [''],
      JobSheetStatus: [''],
      JobSheetDescription: [''],
      JobCompletedDate: [''],
      ShowMarkForBilling: [false],
      CanMarkForBilling: [false],
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
      this.QuotationId = isNaN(Number(param.get('id'))) ? 0 : Number(param.get('id'));
      this.pageType = param.get('type');
      this.moduleHeading = this.pageType == "request" ? "Sales Quotation" : "Sales Quotation Approval";
      this.isApprovalPage = this.pageType == "approval" ? true : false;
    });
    this.ActivateRoute.queryParams.subscribe((params) => {
      this.QuotationId = isNaN(Number(params['id'])) ? this.QuotationId : Number(params['id']);
      if (params['cid'] != null && params['cid'] != undefined) {
        this.companyId = isNaN(Number(params['cid'])) ? this.companyId : Number(params['cid']);
      }
    });
    if (Number(this.QuotationId) > 0) {
      this.IsViewMode = true;
      this.GetSalesQuotation();
    } else {
      // this.ExistingVal = new SalesCustomer();;
      this.AdhocMasterService.GetDefaultBank(this.companyId).subscribe((data: Bank) => {
        if (data != null) {
          let selectedb = this.banks.find(x => x.BankMasterId == data.BankMasterId);
          this.f.Bank.setValue(selectedb);
        }
      });
      this.addBillingRow();
      this.edit();
    }
    // this.QuotationForm.valueChanges.subscribe((form: SalesCustomer) => {
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
        let customerType = this.QuotationForm.get('CustomerType').value;
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
  GetMasterData() {
    this.getCompanyDetails();
    this.getDepartments();
    this.GetBanks();
    this.GetCurrencyType();
    this.getLocationMasters();
    this.GetCustomerMasterType();
    this.GetCreditTermMasterType();
    this.GetTaxMasterType();
    this.GetAddressTypes();

  }

  initBillingInfo(x) {
    let type = this.QuotationForm.get('BillingInstruction').value;
    let selectedcdt = this.creditTerms.find(x => x.CreditTermId == this.f.CreditTerm.value.CreditTermId);
    return this.fb.group({
      BillingInfoId: [0],
      QuotationId: [0],
      ShortNarration: [type == 'Full Billing' ? `${type}` : `Progressive Billing - ${this.fABillingInfo.controls.length + 1}`],
      PercentageToBill: [type == 'Full Billing' ? 100 : 0],
      AmountToBill: [type == 'Full Billing' ? this.get('TotalBeforeTax') : 0],
      ExpectedBillingDate: [new Date()],
      CreditTerm: [selectedcdt],
      Attachments: [''],
      InvoiceDocument: ['']
    });
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
                let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "salesquotationapproval")[0];
                this.approvePermission = approvalRole.IsApprove;
                this.verifyPermission = approvalRole.IsVerify;
              }
              if (!this.isApprovalPage) {
                let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "salesquotation")[0];
                // this.VoidPermission =  (approvalRole.IsVoid);
                // this.printPermission =   (approvalRole.IsPrint);
                this.reVerifyPermission = (approvalRole.IsVerify);
                this.sendForApprovalPermission = (approvalRole.IsApprove);
                this.printPermission = approvalRole.IsPrint;
              }
            }
          });
        }
      });
    }
  }

  addBillingRow(x?: any) {
    this.fABillingInfo.push(this.initBillingInfo(x));
  }

  GetSalesQuotation() {
    this.salesQuotationService.GetSalesQuotation(this.QuotationId).subscribe((data: SalesQuotation) => {
      this.resetFormData(data);
      this.onDeptChange();
    });
  }

  SaveRecord(value: string) {
    this.setControlValidator(value);
    if (this.QuotationForm.valid) {
      if (this.fAQuotations.valid) {
        if (this.validateAttachments(value)) {
          if ((value == 'Send' || value == 'Save') && !this.IsReverify) {
            this.f.WorkflowStatus.setValue({
              WorkFlowStatusid: (value == 'Send') ? WorkFlowStatus.SendForApproval : (value == 'Save') ? WorkFlowStatus.Draft : this.f.WorkflowStatus.value,
              Statustext: ''
            });
          }
          this.PostSalesQuotation();
        }
      }
      else {
        this.lineItemsComponent.markLinesTouched();
      }
    }
    else {
      markAllAsTouched(this.QuotationForm);
    }
    //console.log(this.QuotationForm.value);
  }
  validateAttachments(value: string): boolean {
    if (value == 'Send' || value == 'Verify' || this.IsReverify) {
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
    var creditTerm = this.f.CreditTerm;
    var bank = this.f.Bank;
    var customer = this.f.Customer;
    var dept = this.f.Department;
    var addressType = this.f.AddressType;
    var attachment = this.f.Attachments;
    var taxGroup = this.f.TaxGroup;
    var unitNo = this.f.UnitNo;
    var acceptanceDate = this.f.CustomerAcceptanceDate;
    var jobCompletedDate = this.f.JobCompletedDate;
    var subject = this.f.Subject;
    var supplier = this.f.Supplier;
    var poref = this.f.PoRef;
    acceptanceDate.setErrors(null);
    jobCompletedDate.setErrors(null);
    attachment.clearValidators();
    customer.clearValidators();
    unitNo.clearValidators();
    bank.clearValidators();
    addressType.clearValidators();
    subject.clearValidators();
    supplier.clearValidators();
    poref.clearValidators();
    customerType.setValidators([Validators.required]);
    bank.setValidators([Validators.required]);
    customer.setValidators([Validators.required]);
    creditTerm.setValidators([Validators.required]);
    dept.setValidators([Validators.required]);
    currency.setValidators([Validators.required]);
    addressType.setValidators([Validators.required]);
    subject.setValidators([Validators.required]);
    this.fAQuotations.setValidators([Validators.required]);
    this.fABillingInfo.controls.forEach(element => {
      element.get('ExpectedBillingDate').setErrors(null);
    });
    if (customerType.value != null && customerType.value.CustomerTypeName.toLowerCase().indexOf('tenant') > -1) {
      unitNo.setValidators([Validators.required]);
    }
    if (value == 'Send') { }
    if (value == 'Verify') { }
    if (value == 'markforbilling') {
      this.fABillingInfo.controls.forEach(element => {
        element.get('ExpectedBillingDate').setValidators([Validators.required]);
        element.get('ExpectedBillingDate').updateValueAndValidity();
        element.get('CreditTerm').setValidators([Validators.required]);
        element.get('CreditTerm').updateValueAndValidity();
      });
    }
    if (this.f.PurchaseIncurred.value) {
      supplier.setValidators([Validators.required]);
      poref.setValidators([Validators.required]);
    }
    supplier.updateValueAndValidity();
    poref.updateValueAndValidity();
    customerType.updateValueAndValidity();
    bank.updateValueAndValidity();
    taxGroup.updateValueAndValidity();
    customer.updateValueAndValidity();
    attachment.updateValueAndValidity();
    unitNo.updateValueAndValidity();
    currency.updateValueAndValidity();
    creditTerm.updateValueAndValidity();
    addressType.updateValueAndValidity();
    subject.updateValueAndValidity();
    dept.updateValueAndValidity();
    this.fAQuotations.updateValueAndValidity();
  }
  poSelection(eventData: any) {
    this.QuotationForm.get('POCode').setValue(eventData.item.PurchaseOrderCode);
  }
  SupplierSelection(eventData: any) {
    this.QuotationForm.get('PoRef').setValue(null);
  }
  PostSalesQuotation() {
    let quotation: SalesQuotation = this.QuotationForm.value;
    quotation.Customer
    quotation.LineItems = this.lineItemsComponent.fAQuotations.value;
    quotation.ValidityDate = this.reqDateFormatPipe.transformDateWithNull(this.get('ValidityDate'));
    quotation.CustomerAcceptanceDate = this.reqDateFormatPipe.transformDateWithNull(this.get('CustomerAcceptanceDate'));
    if ((this.f.WorkflowStatus.value.WorkFlowStatusid == WorkFlowStatus.Approved) && (this.EditCustomerInfo || this.EditBillingInfo)) {
      if (this.EditCustomerInfo) {
        this.PostSalesQuotationCustomerInfo(quotation);
      }
      else if (this.EditBillingInfo) {
        this.uploadedFiles = this.uploadedBillingFiles;
        this.fABillingInfo.controls.forEach((e, i) => {
          quotation.BillingInfos[i].ExpectedBillingDate = this.reqDateFormatPipe.transformDateWithNull(e.get('ExpectedBillingDate').value);
        });
        if (this.f.MarkForBilling.value) {
          this.confirmationService.confirm({
            message: "Are you sure that you want to generate the Invoice? ",
            header: Messages.DeletePopupHeader,
            accept: () => {
              this.PostSalesQuotationBillingInfo(quotation);
            },
            rejectVisible: true,
            acceptLabel: "Yes",
            reject: () => { }
          });
        }
        else {
          this.PostSalesQuotationBillingInfo(quotation);
        }
      }
    }
    else {
      this.uploadedFiles = this.childAttachmentsComponent.uploadedFiles;
      this.salesQuotationService.PostSalesQuotation(quotation, this.uploadedFiles).subscribe((Id: number) => {
        if (Id > 0) {
          if (this.approveDocument) {
            if (this.QuotationForm.valid) {
              this.ApproveDocument();
            }
          }
          this.sharedService.showMessage({
            ShowMessage: true,
            Message: quotation.QuotationId == 0 ? Messages.SavedSuccessFully : Messages.UpdatedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.QuotationForm.reset();
          this.uploadedFiles.length = 0;
          this.uploadedFiles = [];
          this.OnCancel();
        }
        // else if (Id == -1) {
        //   this.f.CustomerId.setErrors({ 'duplicate': true });
        // }
      });
    }
  }
  PostSalesQuotationBillingInfo(quotation: SalesQuotation) {
    this.salesQuotationService.PostSalesQuotationBillingInfo(quotation, this.uploadedFiles).subscribe((Id: number) => {
      if (Id > 0) {
        this.sharedService.showMessage({
          ShowMessage: true,
          Message: "Invoice auto generated and redirected you to invoice.",
          MessageType: MessageTypes.Success
        });
        this.redirectToSalesInvoice(Id);
      }
      else {
        this.sharedService.showMessage({
          ShowMessage: true,
          Message: quotation.QuotationId == 0 ? Messages.SavedSuccessFully : Messages.UpdatedSuccessFully,
          MessageType: MessageTypes.Success
        });
        this.QuotationForm.reset();
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.uploadedBillingFiles.length = 0;
        this.uploadedBillingFiles = [];
        this.OnCancel();
      }
    });
  }
  PostSalesQuotationCustomerInfo(quotation: SalesQuotation) {
    this.salesQuotationService.PostSalesQuotationCustomerInfo(quotation).subscribe((Id: number) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: "Customer acceptance details are updated.",
        MessageType: MessageTypes.Success
      });
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: quotation.QuotationId == 0 ? Messages.SavedSuccessFully : Messages.UpdatedSuccessFully,
        MessageType: MessageTypes.Success
      });
      this.QuotationForm.reset();
      this.OnCancel();
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
  supplierInputFormater = (x: Suppliers) => x.SupplierName;
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
      if (this.QuotationId == 0) {
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
  GetAddressTypes() {
    this.sharedService.GetAddressTypes().subscribe((result: AddressType[]) => { this.addressTypes = result; });
  }
  GetBanks() {
    this.AdhocMasterService.GetBanks(this.companyId).subscribe((data: Bank[]) => { this.banks = data });
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
  editMarkForBilling() {
    this.EditBillingInfo = true;
    this.QuotationForm.get('BillingInstruction').setValue(this.billingTypes[0]);
    this.addBillingRow();
  }
  editCustomerInfo() {
    this.EditCustomerInfo = true;
  }
  Reverify() {
    this.edit();
    this.IsReverify = true;
  }
  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
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
      try { this.f.Attention.setValue(data.CustomerContacts.filter(x => x.IsDefault)[0].Name); }
      catch { }
      let selectedAddressType;
      let selectedAddress;
      try {
        let mailing = data.CustomerAddresses.filter(x => x.AddressType.AddressTypeId == 3)[0];
        selectedAddressType = this.addressTypes.find(x => x.AddressTypeId == mailing.AddressType.AddressTypeId);
        selectedAddress = mailing.FullAddress;
      }
      catch {
        let other = data.CustomerAddresses[0];
        selectedAddressType = this.addressTypes.find(x => x.AddressTypeId == other.AddressType.AddressTypeId);
        selectedAddress = other.FullAddress;
      }
      //this.f.Customer.setValue(data);
      this.customerAddresses = data.CustomerAddresses;
      this.f.AddressType.setValue(selectedAddressType);
      this.f.Address.setValue(selectedAddress);
      try {
        this.f.CustomerEmail.setValue(data.CustomerContacts.find(x => x.IsDefault == true).Email);
      }
      catch { }
      // let selectedtt = this.taxTypes.find(x => x.TaxTypeId == data.TaxType.TaxTypeId);
      this.f.TaxType.setValue(data.TaxType);
      this.f.TaxMaster.setValue(data.TaxMaster);
      this.GetTaxTypes();
    }
  }
  resetFormData(data: SalesQuotation) {
    this.QuotationForm.reset();
    this.QuotationForm.patchValue({
      'QuotationId': data.QuotationId,
      'CompanyId': data.CompanyId,
      'DocumentCode': data.DocumentCode,
      'WorkflowStatus': data.WorkflowStatus,
      'CreatedBy': data.CreatedBy,
      'CreatedDate': data.CreatedDate,
      'TotalLineAmount': data.TotalLineAmount,
      'Discount': data.Discount,
      'TotalBeforeTax': data.TotalBeforeTax,
      'TaxAmount': data.TaxAmount,
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
      'ValidityDate': new Date(data.ValidityDate),
      'CustomerAcceptanceDate': data.CustomerAcceptanceDate == null ? '' : new Date(data.CustomerAcceptanceDate),
      'Supplier': data.Supplier,
      'POCode': data.POCode,
      'PoRef': { 'PurchaseOrderCode': data.POCode },
      'ButtonPreferences': data.ButtonPreferences,
      'CurrentApprover': data.CurrentApprover,
      'Attachments': data.Attachments,
      'AddressType': data.AddressType,
      'Currency': data.Currency,
      'CustomerType': data.CustomerType,
      'Department': data.Department,
      'CreditTerm': data.CreditTerm,
      'Location': data.Location,
      'JobSheetNo': data.JobSheetNo,
      'JobSheetStatus': data.JobSheetStatus,
      'JobSheetDescription': data.JobSheetDescription,
      'JobCompletedDate': data.JobCompletedDate == null ? '' : new Date(data.JobCompletedDate),
      'WorkFlowComments': data.WorkFlowComments,
      'CanMarkForBilling': data.CanMarkForBilling,
      'ShowMarkForBilling': data.ShowMarkForBilling,
      'MarkForBilling': data.MarkForBilling,
      'BillingInstruction': data.BillingInstruction,
      'FileDetails': data.FileDetails
    });
    debugger
    if (data.TaxGroup) {
      let selectedtg = this.taxGroups.find(x => x.TaxGroupId == data.TaxGroup.TaxGroupId);
      this.QuotationForm.get('TaxGroup').setValue(selectedtg);
    }
    this.TaxMasterTaxName = data.TaxMaster.TaxName;
    try {
      this.TaxPercentage = data.LineItems[0].TaxPercentage;
    }
    catch { }
    this.customerAddresses = data.CustomerData.CustomerAddresses;
    this.GetTaxTypes();
    let selectedat = this.addressTypes.find(x => x.AddressTypeId == data.AddressType.AddressTypeId);
    this.f.AddressType.setValue(selectedat);
    let selectedc = this.currencyTypes.find(x => x.Id == data.Currency.Id);
    this.f.Currency.setValue(selectedc);
    let selectedct = this.customerTypes.find(x => x.CustomerTypeId == data.CustomerType.CustomerTypeId);
    this.f.CustomerType.setValue(selectedct);
    console.log(JSON.stringify(this.departments));
    let selectedd = this.departments.find(x => x.LocationID == data.Department.LocationID);
    console.log(selectedd);
    this.f.Department.setValue(selectedd);
    let selectedcdt = this.creditTerms.find(x => x.CreditTermId == data.CreditTerm.CreditTermId);
    this.f.CreditTerm.setValue(selectedcdt);
    let selectedb = this.banks.find(x => x.BankMasterId == data.Bank.BankMasterId);
    this.f.Bank.setValue(selectedb);
    try {
      let selectedlm = this.locations.find(x => x.LocationMasterId == data.Location.LocationMasterId);
      this.f.Location.setValue(selectedlm);
    }
    catch { }
    data.LineItems.forEach(x => {
      this.lineItemsComponent.addGridRow(x);
    });
    if (data.MarkForBilling) {
      data.BillingInfos.forEach(x => {
        this.addBillingRow();
      });
      this.fABillingInfo.controls.forEach(x => {
        x.get('CreditTerm').setValue(data.BillingInfos[0].CreditTerm);
        x.get('InvoiceDocument').setValue(data.BillingInfos[0].InvoiceDocument);
        x.get('Attachments').setValue(data.BillingInfos[0].Attachments);
        this.f.CreditTerm.setValue(selectedcdt);
      });
    }
    //this.fABillingInfo.setValue(data.BillingInfos);
    this.f.UpdatedBy.setValue(this.userDetails);
    this.IsMarkForBilling = this.f.MarkForBilling.value;
    // console.log(this.QuotationForm.value);
    // this.ExistingVal = this.QuotationForm.value;
  }
  OnCancel() {
    let result: boolean = true;
    if (this.IsFormValueChanges) {
      result = confirm(Messages.DiscardWarning);
    }
    if (result) {
      this.route.navigate([`/adhoc/quotation/list/${this.pageType}`]);
    }
  }
  get(fc, prop?: any) {
    return this.f[fc].value == null ? '' : prop == null ? this.f[fc].value : this.f[fc].value[prop];
  }
  ShowRemarksPopUp(statusId: number) {
    switch (statusId) {
      case WorkFlowStatus.Rejected: {
        this.pmoduleHeading = "Sales Quotation Reject Reason";
        break;
      }
      case WorkFlowStatus.CancelledApproval: {
        this.pmoduleHeading = "Sales Quotation Cancel Approval Reason";
        break;
      }
      case WorkFlowStatus.Void: {
        this.pmoduleHeading = "Sales Quotation Void Reason";
        break;
      }
      case WorkFlowStatus.CancelDraft: {
        this.pmoduleHeading = "Sales Quotation Cancel Draft Reason";
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
          //this.VoidDocument();
          this.QuotationForm.get('Remarks').setValue(this.RemarksForm.controls['Reasons'].value);
          this.SaveRecord('markforbilling');
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
      DocumentId: this.f.QuotationId.value,
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
        Message: 'Sales Quotation Status Changed to Void',
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
          DocumentId: this.f.QuotationId.value,
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
            Message: 'Sales Quotation Status Changed to Cancel Draft',
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
      DocumentId: this.f.QuotationId.value,
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
        Message: 'Sales Quotation approved successfully.',
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
      DocumentId: this.f.QuotationId.value,
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
        Message: 'Sales Quotation Rejected',
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
      DocumentId: this.f.QuotationId.value,
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
        Message: 'Sales Quotation approval cancelled.',
        MessageType: MessageTypes.Success
      });
      this.OnCancel();
      this.showRemarksPopUp = false;
    });
  }
  enableSaveBillingInfo(type: boolean) {
    this.disableSaveBilling = false;
    this.IsMarkForBilling = type;
    this.f.MarkForBilling.setValue(type);
  }
  saveBillingInfo() {
    if (this.IsMarkForBilling)
      this.SaveRecord('markforbilling');
    else
      this.ShowRemarksPopUp(this.workFlowStatus.Void);
  }
  onBillingChange() {
    this.fABillingInfo.controls = [];
    this.addBillingRow();
  }
  updateTotal(e) {
    this.f.TotalLineAmount.setValue(e.SumTotalBefDiscount);
    this.f.Discount.setValue(e.SumDiscount);
    this.f.TotalBeforeTax.setValue(e.SumTotalBefTax);
    this.f.TaxAmount.setValue(e.SumTaxAmount);
    this.f.Total.setValue(e.SumTotal);
  }
  onFileUploadChangeBI(event: any) {
    let files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      let fileItem = files.item(i);
      if (ValidateFileType(fileItem.name)) {
        this.uploadedBillingFiles.push(fileItem);
      }
      else {
        event.preventDefault();
        break;
      }
    }
  }
  onFileCloseBI(fileIndex: number) {
    this.uploadedBillingFiles = this.uploadedFiles.filter((file, index) => index != fileIndex);
  }
  onPDFPrint() {
    this.genricService.PrintDocument(this.QuotationId, this.processId, this.companyId).subscribe((data) => {
      saveAs(new Blob([(data)], { type: 'application/pdf' }), "SalesQuotation" + this.get('DocumentCode') + ".pdf");
    });
  }
  SendDocumentEmail() {
    this.genricService.SendDocumentEmail(this.QuotationId, this.processId, this.companyId, this.get('Department', 'LocationID')).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: Messages.DocumentSentCustomer,
        MessageType: MessageTypes.Success
      });
    });
  }
  redirectToSalesInvoice(param: any) {
    this.route.navigate([`adhoc/invoice/request/${param}`], { queryParams: { from: 'sq' } });
  }
}
function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}