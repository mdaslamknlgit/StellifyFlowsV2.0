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
  PTableColumn, User, UserDetails, WorkFlowApproval, WorkFlowProcess, WorkFlowStatus
} from '../../../../app/shared/models/shared.model';
import { SalesCustomer, SalesCustomerAddress, SalesCustomerContact } from '../../models/customer-master.model';
import { CustomerAddressColumns, CustomerContactsColumns } from '../../models/grid-columns';
import { AdhocMasterService } from '../../services/adhoc-master.service';
import { CreditTerm, CustomerTypeMaster, TaxGroup, TaxType, TenantType } from '../../models/adhoc-master.model';
import { CustomerService } from '../../services/customer.service';
import { Locations } from './../../../inventory/models/item-master.model';
import { AttachmentsComponent } from './../../../shared/components/attachments/attachments.component';
import { Company } from './../../../administration/models/company';
import { CompanyApiService } from './../../../administration/services/company-api.service';
import { PageAccessLevel, Roles } from './../../../administration/models/role';
import { ControlValidator } from './../../../shared/classes/control-validator';
import { GenericService } from './../../../shared/sevices/generic.service';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
  @ViewChild(AttachmentsComponent) childAttachmentsComponent: AttachmentsComponent;
  uploadedFiles: Array<File> = [];
  showRemarksPopUp: boolean = false;
  CustomerForm: FormGroup;
  AddressForm: FormGroup;
  showLogPopUp: boolean = false
  userDetails: UserDetails = null;
  showConstomerInfoDialog: boolean = false
  companyId: number;
  scrollbarOptions: any;
  CustomerIPSId: number = 0;
  IsViewMode: boolean = false;
  IsReverify: boolean = false;
  departments: Locations[] = [];
  pmoduleHeading: string = "";
  customerTypes: CustomerTypeMaster[] = [];
  creditTerms: CreditTerm[] = [];
  nationalities: Nationality[] = [];
  addressTypes: AddressType[] = [];
  currencyTypes: Currency[] = [];
  tenantTypes: TenantType[] = [];
  taxGroups: TaxGroup[] = [];
  taxTypes: TaxType[] = [];
  AddressRowIndex: number;
  approveCustomerDocument: boolean = false;
  HasTenantShow: boolean = false;
  RemarksForm: FormGroup;
  CustomerContactsColumns: PTableColumn[] = [];
  CustomerAddressColumns: PTableColumn[] = [];
  followWorkflow: boolean = false
  isApprovalPage: boolean = false;
  pageType: string = "";
  moduleHeading = "";
  approvePermission: boolean = false;
  verifyPermission: boolean = false;
  viewLogPermission: boolean = false;
  sendForApprovalPermission: boolean = false;
  reVerifyPermission: boolean = false;
  userRoles: any = []
  rolesAccessList = [];
  company: Company = null;
  workFlowStatus: any;
  ExistingVal: SalesCustomer;
  IsFormValueChanges: boolean = false;
  constructor(private fb: FormBuilder,
    private sharedService: SharedService,
    private ActivateRoute: ActivatedRoute,
    private route: Router,
    private sessionService: SessionStorageService,
    private AdhocMasterService: AdhocMasterService,
    private customerService: CustomerService,
    private reqDateFormatPipe: RequestDateFormatPipe,
    private genricService: GenericService,
    private supplierApiService: SupplierApiService,
    private companyApiService: CompanyApiService,
    private confirmationService: ConfirmationService,
  ) {
    this.companyId = this.sessionService.getCompanyId();
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.workFlowStatus = WorkFlowStatus;
  }
  get f() {
    return this.CustomerForm.controls;
  }
  get fAAddresses() {
    return <FormArray>this.CustomerForm.get('CustomerAddresses');
  }
  get fGAddresses() {
    return this.AddressForm.controls;
  }
  get fAContacts() {
    return (<FormArray>this.CustomerForm.get('CustomerContacts'));
  }
  ngOnInit() {
    this.GetMasterData();
    this.CustomerAddressColumns = CustomerAddressColumns.filter(item => item.hide == this.IsViewMode);
    this.CustomerContactsColumns = CustomerContactsColumns.filter(item => item.hide == this.IsViewMode);
    this.CustomerForm = this.fb.group({
      CustomerIPSId: [0],
      CompanyId: [this.companyId],
      DocumentCode: [''],
      CustomerType: new FormControl(null),
      CustomerName: [''],
      ShortName: ['', [Validators.maxLength(10)]],
      SystemNo: [''],
      CustomerId: [''],
      TenantType: new FormControl(null),
      Department: new FormControl(null),
      CreditTerm: new FormControl(null),
      Currency: new FormControl(null),
      Remarks: [''],
      TypeOfBusiness: [''],
      GLAccount: [''],
      BankCode: [''],
      CreditLimit: [0],
      TaxGroup: new FormControl(null),
      TaxMaster: new FormControl(null),
      TaxType: new FormControl(null),
      RateType: [''],
      URL: [''],
      ROC: [''],
      CustomerContacts: this.fb.array([]),
      CustomerAddresses: this.fb.array([]),
      AccountSetId: [''],
      MasterCustomerIPSId: [0],
      Attachments: [],
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
      UpdatedDate: '',
      ButtonPreferences: new ButtonPreferences(),
      CurrentApprover: new FormControl(null),
      WorkFlowComments: null,
      Reason: null
    });
    this.AddressForm = this.fb.group({
      Index: [0],
      CustomerAddressId: [0],
      CustomerIPSId: [0],
      AddressType: new FormControl(new AddressType(), Validators.required),
      FullAddress: [''],
      AddressLine1: ['', Validators.required],
      AddressLine2: ['', Validators.required],
      AddressLine3: [''],
      Telephone: ['', Validators.required],
      Fax: [''],
      Country: ['', Validators.required],
      City: [''],
      PostalCode: ['', Validators.required],
      Email: ['', Validators.email],
      Attention: [''],
    });
    this.RemarksForm = this.fb.group({
      Reasons: new FormControl('', [Validators.required, ControlValidator.Validator]),
      StatusId: [0]
    });
    this.ActivateRoute.paramMap.subscribe((param: ParamMap) => {
      this.CustomerIPSId = isNaN(Number(param.get('id'))) ? 0 : Number(param.get('id'));
      this.pageType = param.get('type');
      this.moduleHeading = this.pageType == "request" ? "Customer Management" : "Customer Management Approval";
      this.isApprovalPage = this.pageType == "approval" ? true : false;
    });
    this.ActivateRoute.queryParams.subscribe((params) => {
      this.CustomerIPSId = isNaN(Number(params['id'])) ? this.CustomerIPSId : Number(params['id']);
      if (params['cid'] != null && params['cid'] != undefined) {
        this.companyId = isNaN(Number(params['cid'])) ? this.companyId : Number(params['cid']);
      }
    });
    if (Number(this.CustomerIPSId) > 0) {
      this.IsViewMode = true;
      this.GetCustomer();
    } else {
      // this.ExistingVal = new SalesCustomer();
      this.edit();
    }
    // this.CustomerForm.valueChanges.subscribe((form: SalesCustomer) => {
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
  GetMasterData() {
    this.getCompanyDetails();
    this.getDepartments(this.companyId);
    this.GetCustomerMasterType();
    this.GetCreditTermMasterType();
    this.GetCurrencyType();
    this.GetTaxMasterType();
    this.GetTenantType();
    this.GetNationalities();
    this.GetAddressTypes();
  }

  initContactGridRows() {
    return this.fb.group({
      CustomerContactId: [0],
      CustomerIPSId: [0],
      Name: ['', [Validators.required]],
      Nationality: [''],
      ContactNo: [''],
      Purpose: [''],
      Designation: [''],
      NRICPassportNo: [''],
      Email: ['', [Validators.required, Validators.email]],
      IsDefault: [this.fAContacts.length == 0 ? true : false, [Validators.required]]
    })
  }
  initAddressGridRows() {
    return this.fb.group({
      Index: [this.fAContacts.controls.length],
      CustomerAddressId: [0],
      CustomerIPSId: [0],
      AddressType: null,
      FullAddress: [''],
      AddressLine1: [''],
      AddressLine2: [''],
      AddressLine3: [''],
      Telephone: [''],
      Fax: [''],
      Country: null,
      City: [''],
      PostalCode: [''],
      Email: [''],
      Attention: ['']
    })
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
                let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "customerapproval")[0];
                this.approvePermission = approvalRole.IsApprove;
                this.verifyPermission = approvalRole.IsVerify;
              }
              if (!this.isApprovalPage) {
                let approvalRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "customer")[0];
                // this.VoidPermission =  (approvalRole.IsVoid);
                // this.printPermission =   (approvalRole.IsPrint);
                this.reVerifyPermission = (approvalRole.IsVerify);
                this.sendForApprovalPermission = (approvalRole.IsApprove);
              }
            }
          });
        }
      });
    }
  }

  addGridRow() {
    this.fAContacts.push(this.initContactGridRows());
  }

  GetCustomer() {
    this.customerService.GetCustomer(this.CustomerIPSId).subscribe((data: SalesCustomer) => {
      this.resetFormData(data);
      this.onDeptChange();
    });
  }

  SaveRecord(value: string) {
    this.setControlValidator(value);
    if (this.CustomerForm.valid) {
      if (this.validateAttachments(value)) {
        if ((value == 'Send' || value == 'Save') && !this.IsReverify) {
          this.f.WorkflowStatus.setValue({
            WorkFlowStatusid: (value == 'Send') ? WorkFlowStatus.SendForApproval : (value == 'Save') ? WorkFlowStatus.Draft : 0,
            Statustext: ''
          });
        }
        this.PostCustomer();
      }
    }
    else {
      markAllAsTouched(this.CustomerForm);
    }
    console.log(this.CustomerForm.value);
  }
  validateAttachments(value: string): boolean {
    if ((value == 'Send' || value == 'Verify') && !this.IsReverify) {
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
    var currency = this.f.Currency;
    var creditTerm = this.f.CreditTerm;
    var customerName = this.f.CustomerName;
    var customerType = this.f.CustomerType;
    var customerId = this.f.CustomerId;
    var tenantType = this.f.TenantType;
    var dept = this.f.Department;
    var creditTerm = this.f.CreditTerm;
    var attachment = this.f.Attachments;
    var taxGroup = this.f.TaxGroup;
    var taxType = this.f.TaxType;
    var rateType = this.f.RateType;
    var accountSetId = this.f.AccountSetId;
    var bankCode = this.f.BankCode;
    var glAccount = this.f.GLAccount;
    attachment.clearValidators();
    customerId.clearValidators();
    customerType.setValidators([Validators.required]);
    customerName.setValidators([Validators.required]);
    creditTerm.setValidators([Validators.required]);
    dept.setValidators([Validators.required]);
    currency.setValidators([Validators.required]);
    this.fAAddresses.setValidators([Validators.required]);
    if (value == 'Send') {
    }
    if (value == 'Verify') {
      customerId.setValidators([Validators.required]);
      taxGroup.setValidators([Validators.required]);
      taxType.setValidators([Validators.required]);
      rateType.setValidators([Validators.required]);
      accountSetId.setValidators([Validators.required]);
      bankCode.setValidators([Validators.required]);
      glAccount.setValidators([Validators.required]);
    }
    taxGroup.updateValueAndValidity();
    taxType.updateValueAndValidity();
    rateType.updateValueAndValidity();
    accountSetId.updateValueAndValidity();
    bankCode.updateValueAndValidity();
    glAccount.updateValueAndValidity();
    customerId.updateValueAndValidity();
    attachment.updateValueAndValidity();
    customerType.updateValueAndValidity();
    currency.updateValueAndValidity();
    creditTerm.updateValueAndValidity();
    customerName.updateValueAndValidity();
    dept.updateValueAndValidity();
    this.fAAddresses.updateValueAndValidity();
    // this.isNameDup();
  }

  PostCustomer() {
    let customer: SalesCustomer = this.CustomerForm.value;
    this.uploadedFiles = this.childAttachmentsComponent.uploadedFiles;
    if (this.IsReverify && this.requiredFieldsChanged()) {
      customer.MasterCustomerIPSId = customer.CustomerIPSId;
      customer.CustomerIPSId = 0;
      customer.CustomerAddresses.forEach(x => x.CustomerAddressId = 0);
      customer.CustomerContacts.forEach(x => x.CustomerContactId = 0);
    }
    this.customerService.PostCustomer(customer, this.uploadedFiles).subscribe((Id: number) => {
      if (Id > 0) {
        if (this.approveCustomerDocument) {
          if (this.CustomerForm.valid) {
            this.ApproveDocument();
          }
        }
        this.CustomerForm.reset()
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.sharedService.showMessage({
          ShowMessage: true,
          Message: customer.CustomerIPSId == 0 ? Messages.SavedSuccessFully : Messages.UpdatedSuccessFully,
          MessageType: MessageTypes.Success
        });
        this.OnCancel();
      }
      else if (Id == -1) {
        this.f.CustomerId.setErrors({ 'duplicate': true });
      }
    });
  }
  requiredFieldsChanged(): boolean {
    debugger
    if (this.ExistingVal.CustomerName.toLowerCase().trim() != this.f.CustomerName.value.toLowerCase().trim())
      return true;
    if (this.ExistingVal.CustomerId.toLowerCase().trim() != this.f.CustomerId.value.toLowerCase().trim())
      return true;
    if (this.ExistingVal.CustomerAddresses.length != this.f.CustomerAddresses.value.length)
      return true;
    this.ExistingVal.CustomerAddresses.forEach((e, i) => {
      if (e.AddressType.AddressTypeId != this.f.CustomerAddresses.value[i].AddressType.AddressTypeId ||
        e.AddressLine1 != this.f.CustomerAddresses.value[i].AddressLine1 ||
        e.AddressLine2 != this.f.CustomerAddresses.value[i].AddressLine2 ||
        e.AddressLine3 != this.f.CustomerAddresses.value[i].AddressLine3 ||
        e.Country.Id != this.f.CustomerAddresses.value[i].Country.Id ||
        e.Attention != this.f.CustomerAddresses.value[i].Attention ||
        e.City != this.f.CustomerAddresses.value[i].City ||
        e.Email != this.f.CustomerAddresses.value[i].Email ||
        e.Fax != this.f.CustomerAddresses.value[i].Fax)
        return true;
    });
  }

  showAddress() {
    this.showConstomerInfoDialog = true;
    this.resetAddressForm(null);
    this.fAAddresses
  }
  OnAddressTypeChange() {
    if (this.fAAddresses.length > 0) {
      let cloneAddress = this.fAAddresses.controls[0].value;
      this.AddressForm.patchValue({
        Index: this.fAAddresses.length,
        CustomerAddressId: 0,
        CustomerIPSId: 0,
        AddressLine1: cloneAddress.AddressLine1,
        AddressLine2: cloneAddress.AddressLine2,
        AddressLine3: cloneAddress.AddressLine3,
        Telephone: cloneAddress.Telephone,
        Fax: cloneAddress.Fax,
        Country: cloneAddress.Country,
        City: cloneAddress.City,
        PostalCode: cloneAddress.PostalCode,
        Email: cloneAddress.Email,
        Attention: cloneAddress.Attention
      });
    }
  }
  AddCustomerInfoGrid() {
    this.isNameDup();
    if (this.AddressForm.valid) {
      let isExist = this.fAAddresses.controls.find(x => x.get('Index').value == this.AddressForm.get('Index').value);
      if (isExist == undefined) {
        let controls = this.initAddressGridRows();
        controls.setValue(this.AddressForm.value);
        this.fAAddresses.push(controls);
      }
      else {
        this.fAAddresses.controls.forEach(x => {
          if (x.get('Index').value == this.AddressForm.get('Index').value) {
            x.setValue(this.AddressForm.value);
          }
        });
      }
      this.resetAddressForm(null);
      this.showConstomerInfoDialog = false;
    }
    else {
      markAllAsTouched(this.AddressForm);
    }
  }
  resetAddressForm(data: SalesCustomerAddress) {
    this.AddressForm.reset();
    if (data == null) {
      data = {
        Index: this.fAAddresses.length,
        CustomerAddressId: 0,
        CustomerIPSId: 0,
        FullAddress: '',
        AddressLine1: '',
        AddressLine2: '',
        AddressLine3: '',
        AddressType: null,
        Attention: '',
        City: '',
        Country: null,
        Email: '',
        Fax: '',
        PostalCode: '',
        Telephone: ''
      };
    }
    this.AddressForm.setValue(data);
  }

  EditCustomerInfoDetails(index) {
    let addressData: SalesCustomerAddress = this.fAAddresses.controls[index].value;
    this.AddressForm.setValue(addressData);
    let selectedAT = this.addressTypes.find(x => x.AddressTypeId == addressData.AddressType.AddressTypeId);
    this.AddressForm.get('AddressType').setValue(selectedAT);
    this.showConstomerInfoDialog = true;
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

  /**
         * this method will be called on file close icon click event..
         */
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

  deleteRow(value: string, index) {
    if (value == 'Address')
      this.fAAddresses.removeAt(index);

    else if ('Contact')
      this.fAContacts.removeAt(index);
  }
  getCompanyDetails() {
    this.companyApiService.getCompanyById(this.companyId).subscribe((data: Company) => {
      if (data != null) {
        this.company = data;
      }
    });
  }
  getDepartments(companyId: number) {
    this.sharedService.getUserDepartments(companyId, WorkFlowProcess.CustomerMaster, this.userDetails.UserID).subscribe((data: Location[]) => {
      this.departments = data;
    });
  }
  GetCustomerMasterType() {
    this.AdhocMasterService.GetCustomerTypes().subscribe((data: CustomerTypeMaster[]) => { this.customerTypes = data });
  }
  GetTenantType() {
    this.AdhocMasterService.GetTenantTypes().subscribe((data: TenantType[]) => { this.tenantTypes = data });
  }
  GetCreditTermMasterType() {
    this.AdhocMasterService.GetCreditTerms(this.companyId).subscribe((data: CreditTerm[]) => { this.creditTerms = data });
  }
  GetCurrencyType() {
    this.supplierApiService.getCurrencies().subscribe((data: Currency[]) => {
      this.currencyTypes = data;
      if (this.CustomerIPSId == 0) {
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
      this.AdhocMasterService.GetTaxTypesByTaxGroupId(this.companyId, this.f.TaxGroup.value.TaxGroupId).subscribe((data: TaxType[]) => {
        this.taxTypes = data
        if (this.CustomerIPSId > 0) {  //set selected
          let selectedtc = this.taxTypes.find(x => x.TaxTypeId == this.f.TaxType.value.TaxTypeId);
          this.CustomerForm.get('TaxType').setValue(selectedtc);
        }
      });
    }
  }
  GetNationalities() {
    this.sharedService.GetNationalities().subscribe((result: Nationality[]) => { this.nationalities = result; });
  }
  GetAddressTypes() {
    this.sharedService.GetAddressTypes().subscribe((result: AddressType[]) => { this.addressTypes = result; });
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
  cancelCustomerInfo() {
    this.AddressForm.reset()
    this.showConstomerInfoDialog = false;
  }
  IsClicked(index) {
    this.fAContacts.controls.forEach((e, i) => {
      e.get('IsDefault').setValue((index == i) ? true : false);
    });
  }
  edit() {
    this.IsViewMode = false;
    this.CustomerAddressColumns = CustomerAddressColumns.filter(item => item);
    this.CustomerContactsColumns = CustomerContactsColumns.filter(item => item);
  }
  Reverify() {
    this.edit();
    this.IsReverify = true;
  }
  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
  resetFormData(data: SalesCustomer) {
    this.CustomerForm.reset();
    let user: User = {
      UserID: this.userDetails.UserID,
      UserName: this.userDetails.UserName
    }
    data.UpdatedBy = user;
    data.CustomerAddresses.forEach((x, i) => {
      x.Index = i;
      this.AddressForm.setValue(x);
      this.AddCustomerInfoGrid();
    });
    data.CustomerContacts.forEach((x: SalesCustomerContact, i: number) => {
      this.addGridRow();
    });
    this.fAContacts.setValue(data.CustomerContacts);
    this.CustomerForm.setValue(data);
    if (data.TaxGroup) {
      let selectedtg = this.taxGroups.find(x => x.TaxGroupId == data.TaxGroup.TaxGroupId);
      this.CustomerForm.get('TaxGroup').setValue(selectedtg);
    }
    this.GetTaxTypes();
    let selectedct = this.customerTypes.find(x => x.CustomerTypeId == data.CustomerType.CustomerTypeId);
    this.f.CustomerType.setValue(selectedct);
    if (data.TenantType) {
      let selectedtt = this.tenantTypes.find(x => x.TenantTypeId == data.TenantType.TenantTypeId);
      this.f.TenantType.setValue(selectedtt);
    }
    let selectedd = this.departments.find(x => x.LocationID == data.Department.LocationID);
    this.f.Department.setValue(selectedd);
    let selectedcdt = this.creditTerms.find(x => x.CreditTermId == data.CreditTerm.CreditTermId);
    this.f.CreditTerm.setValue(selectedcdt);
    let selectedcc = this.currencyTypes.find(x => x.Id == data.Currency.Id);
    this.f.Currency.setValue(selectedcc);
    data.CustomerContacts.forEach((x: SalesCustomerContact, i: number) => {
      this.fAContacts.controls.forEach((y, j) => {
        if (i == j) {
          if (x.Nationality) {
            let selectedn = this.nationalities.find(j => j.NationalityId == x.Nationality.NationalityId);
            y.get('Nationality').setValue(selectedn);
            return;
          }
        }
      });
    });
    console.log(this.CustomerForm.value);
    this.ExistingVal = this.CustomerForm.value;
  }
  OnCancel() {
    let result: boolean = true;
    if (this.IsFormValueChanges) {
      result = confirm(Messages.DiscardWarning);
    }
    if (result) {
      this.route.navigate([`/adhoc/customer/list/${this.pageType}`]);
    }

  }
  get(fc, prop?: any) {
    return this.f[fc].value == null ? '' : prop == null ? this.f[fc].value : this.f[fc].value[prop];
  }
  ShowRemarksPopUp(statusId: number) {
    switch (statusId) {
      case WorkFlowStatus.Rejected: {
        this.pmoduleHeading = "Customer Reject Reason";
        break;
      }
      case WorkFlowStatus.CancelledApproval: {
        this.pmoduleHeading = "Customer Cancel Approval Reason";
        break;
      }
      case WorkFlowStatus.Void: {
        this.pmoduleHeading = "Customer Void Reason";
        break;
      }
      case WorkFlowStatus.CancelDraft: {
        this.pmoduleHeading = "Customer Cancel Draft Reason";
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
      DocumentId: this.f.CustomerIPSId.value,
      UserId: this.userDetails.UserID,
      WorkFlowStatusId: WorkFlowStatus.Void,
      Remarks: this.RemarksForm.controls['Reasons'].value,
      RequestUserId: this.f.CreatedBy.value.UserID,
      DocumentCode: this.f.CustomerId.value,
      ProcessId: WorkFlowProcess.CustomerMaster,
      CompanyId: this.companyId,
      ApproverUserId: 0,
      IsReApproval: false
    };
    this.genricService.VoidDocument(workFlowStatus).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: 'Customer Status Changed to Void',
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
          DocumentId: this.f.CustomerIPSId.value,
          UserId: this.userDetails.UserID,
          WorkFlowStatusId: WorkFlowStatus.CancelDraft,
          Remarks: this.RemarksForm.get('Reasons').value,
          RequestUserId: this.f.CreatedBy.value.UserID,
          DocumentCode: `${this.f.CustomerName.value} ${this.f.CustomerId.value}`,
          ProcessId: WorkFlowProcess.CustomerMaster,
          CompanyId: this.companyId,
          ApproverUserId: 0,
          IsReApproval: false
        };
        this.genricService.CancelDraftDocument(workFlowStatus).subscribe((data) => {
          this.sharedService.showMessage({
            ShowMessage: true,
            Message: 'Customer Status Changed to Cancel Draft',
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
      this.approveCustomerDocument = true;
      this.SaveRecord('Verify');
    }
    else {
      this.ApproveDocument();
    }
  }
  ApproveDocument() {
    let workFlowDetails: WorkFlowApproval = {
      ProcessId: WorkFlowProcess.CustomerMaster,
      CompanyId: this.f.CompanyId.value,
      DocumentId: this.f.CustomerIPSId.value,
      WorkFlowStatusId: WorkFlowStatus.Approved,
      ApproverUserId: this.userDetails.UserID,
      DocumentCode: this.f.CustomerId.value,
      Remarks: '',
      UserId: this.userDetails.UserID,
      RequestUserId: this.f.CreatedBy.value.UserID,
      ReferenceDocumentId: 0,
      ReferenceProcessId: 0
    };
    this.genricService.ApproveDocument(workFlowDetails).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: 'Customer approved successfully.',
        MessageType: MessageTypes.Success
      });
      this.OnCancel();
      this.showRemarksPopUp = false;
    });
  }
  RejectDocument() {
    let workFlowDetails: WorkFlowApproval = {
      ProcessId: WorkFlowProcess.CustomerMaster,
      CompanyId: this.f.CompanyId.value,
      DocumentId: this.f.CustomerIPSId.value,
      WorkFlowStatusId: WorkFlowStatus.Rejected,
      ApproverUserId: this.userDetails.UserID,
      DocumentCode: this.f.CustomerId.value,
      Remarks: this.RemarksForm.get('Reasons').value,
      UserId: this.f.CreatedBy.value.UserID,
      RequestUserId: this.f.CreatedBy.value.UserID
    };
    this.genricService.RejectDocument(workFlowDetails).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: 'Customer Rejected',
        MessageType: MessageTypes.Success
      });
      this.OnCancel();
      this.showRemarksPopUp = false;
    });
  }
  CancelApprovalDocument() {
    let workFlowDetails: WorkFlowApproval = {
      ProcessId: WorkFlowProcess.CustomerMaster,
      CompanyId: this.f.CompanyId.value,
      DocumentId: this.f.CustomerIPSId.value,
      WorkFlowStatusId: WorkFlowStatus.CancelledApproval,
      ApproverUserId: this.f.CurrentApprover.value.UserID,
      DocumentCode: this.f.CustomerId.value,
      Remarks: this.RemarksForm.get('Reasons').value,
      UserId: this.userDetails.UserID,
      RequestUserId: this.f.CreatedBy.value.UserID
    };
    this.genricService.CancelApprovalDocument(workFlowDetails).subscribe((data) => {
      this.sharedService.showMessage({
        ShowMessage: true,
        Message: 'Customer approval cancelled.',
        MessageType: MessageTypes.Success
      });
      this.OnCancel();
      this.showRemarksPopUp = false;
    });
  }
  isNameDup() {
    var index: number = this.AddressForm.get('Index').value;
    var types: any[] = this.fAAddresses.value.filter(value => value.Index != index);
    if (types != undefined) {
      var names: any[] = types.map(value => value.AddressType.AddressTypeId);
      names.push(this.AddressForm.get('AddressType').value.AddressTypeId);
      const hasDuplicate = names.some((name, index) => names.indexOf(name, index + 1) != -1);
      if (hasDuplicate) {
        this.AddressForm.get('AddressType').setErrors({ 'incorrect': true });
        // this.AddressForm.updateValueAndValidity();
      }
    }
  }
}
