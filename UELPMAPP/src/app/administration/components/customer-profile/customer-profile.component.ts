import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, AfterViewInit, Renderer } from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerApiService } from '../../services/customer-api.service';
import { Customer, CustomerGrid } from "../../models/customer";
import { STRING_PATERN, ALPHA_NUMERIC, NUMBER_PATERN, EMAIL_PATTERN, MOBILE_NUMBER_PATTERN } from '../../../shared/constants/generic';
import { SharedService } from "../../../shared/services/shared.service";
import { ResponseMessage, Messages, MessageTypes, Taxes, PagerConfig } from "../../../shared/models/shared.model";
import { NgbModal, NgbModalRef, ModalDismissReasons, NgbActiveModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { AutofocusDirective } from '../../../shared/directives/focusdirective';
import { FullScreen } from "../../../shared/shared";
import { ConfirmationService } from 'primeng/primeng';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SupplierApiService } from '../../../po/services/supplier-api.service';
import { GridDisplayInput } from '../../../po/models/supplier';

@Component({
  selector: 'app-customer-profile',
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements OnInit {
  @ViewChild('filterContainer') private customerFilter: any;
  @ViewChild('searchInput') searchInputRef: ElementRef;
  @ViewChild("CustomerName") customerNameInput: ElementRef;
  @ViewChild('rightPanel') rightPanelRef: ElementRef;

  hideText: boolean = true;
  hideInput: boolean = false;
  savedsucess: boolean = false;
  hidealert: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  customerInfoForm: FormGroup;
  customerFilterInfoForm: FormGroup;
  customerCategroies = [];
  searchCategroies = [];
  filteredCustomers = [];
  taxGroups: Array<Taxes> = [];
  taxClass: Array<number> = [1, 2, 3, 4, 5];
  paymentTerms = [];
  countries = [];
  gststatus = [];
  currencies = [];
  formError: string = "";
  customers: Customer[] = [];
  defaultCustomer: Customer;
  formSubmitAttempt: boolean = false;
  customerId: number = 0;
  isExistingCustomer: boolean = false;
  message: string = "";
  isDisplayMode: boolean = false;
  closeResult: string;
  filterCriteria: string = "";
  filter = [];
  customerPagerConfig: PagerConfig;
  isFilterApplied: boolean = false;
  isSearchApplied: boolean = false;
  modalReference: NgbModalRef;
  filterMessage: string = "";
  scrollbarOptions: any;
  deletedContactsList: Array<number> = [];
  gridColumns: Array<{ field: string, header: string }> = [];
  gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
  initDone = false;
  linesToAdd: number = 1;
  companyId: number = 0;
  errorMessage: string = Messages.NoRecordsToDisplay;
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean;


  constructor(private fb: FormBuilder,
    private customerApiService: CustomerApiService,
    private confirmationServiceObj: ConfirmationService,
    public sessionService: SessionStorageService,
    private sharedServiceObj: SharedService, private modalService: NgbModal,
    private supplierApiService: SupplierApiService,
    private renderer: Renderer,
    config: NgbDropdownConfig) {

    this.companyId = this.sessionService.getCompanyId();
    this.defaultCustomer = new Customer();
    this.initDone = true;
    this.customerPagerConfig = new PagerConfig();
    this.customerPagerConfig.RecordsToSkip = 0;
    this.customerPagerConfig.RecordsToFetch = 5;
  }

  ngOnInit() {
    //getting role access levels  
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "customers")[0];

      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.deletePermission = formRole.IsDelete;
    }
    else {
      this.newPermission = true;
      this.editPermission = true;
      this.deletePermission = true;
    }

    this.customerInfoForm = this.fb.group({
      CustomerId: 0,
      CustomerName: ['', { validators: [Validators.required] }],
      CustomerShortName: ['', { validators: [Validators.required] }],
      CustomerCategoryId: ['', { validators: [Validators.required] }],
      CustomerEmail: ['', { validators: [Validators.pattern(EMAIL_PATTERN), Validators.required, Validators.email] }],
      CustomerCode: [''],
      CompanyId: [''],
      PaymentTermsId: ['', { validators: [Validators.required] }],
      TaxId: ['', { validators: [Validators.required] }],
      Status: 1,
      Remarks: [''],
      IsDeleted: false,
      BillingAddress: ['', { validators: [Validators.required] }],
      BillingCity: ['', { validators: [Validators.required] }],
      BillingCountryId: ['', { validators: [Validators.required] }],
      BillingZipcode: ['', { validators: [Validators.pattern(NUMBER_PATERN), Validators.required] }],
      BillingTelephone: ['', { validators: [Validators.required] }],
      BillingFax: [''],
      ShippingAddress: ['', { validators: [Validators.required] }],
      ShippingCity: ['', { validators: [Validators.required] }],
      ShippingCountryId: ['', { validators: [Validators.required] }],
      ShippingZipcode: ['', { validators: [Validators.pattern(NUMBER_PATERN), Validators.required] }],
      ShippingTelephone: ['', { validators: [Validators.required] }],
      ShippingFax: ['']
    });

    this.customerFilterInfoForm = this.fb.group({
      CustomerName: [''],
      CustomerCategory: [''],
      CustomerCity: ['']
    });


    this.isDisplayMode = true;

    this.getCustomerCategroies();
    this.getpaymentTerms();
    this.getCountries();
    this.getCurrenceis();
    this.getTaxGroups(1);
    this.getCustomers();
  }

  customerCategoryInputFormater = (x: CustomerCategories) => x.CategoryName;

  customerCategorySearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.searchCategroies.filter(x => x.CategoryName.toLowerCase().indexOf(term.toLowerCase()) !== -1))
    );

  customerInputFormater = (x: Customer) => x.CustomerName;
  //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
  customerSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.sharedServiceObj.getAllSearchCustomers({
          searchKey: term,
          customerCategoryId: 0,  //this.salesOrderForm.get('CustomerCategoryId').value,
          companyId: this.companyId
        }).pipe(
          catchError(() => {
            return of([]);
          }))
      )
    );

  getCustomers(): void {
    let customerGrid: GridDisplayInput = {
      Search: "",
      Skip: this.customerPagerConfig.RecordsToSkip,
      Take: this.customerPagerConfig.RecordsToFetch,
      CompanyId: this.companyId
    };

    let customerResult = <Observable<CustomerGrid>>this.customerApiService.getCustomers(customerGrid);
    customerResult.subscribe((data) => {
      if (data != null) {
        this.customers = data.Customers;
        if (this.customers.length > 0) {
          this.filteredCustomers = this.customers
          this.customerPagerConfig.TotalRecords = data.TotalRecords;
          this.onRecordSelected(this.customers[0]);
          if (this.isFilterApplied) {
            this.filterData();
          }
          if (this.isSearchApplied) {
            this.GetAllSearchCustomers(this.searchInputRef.nativeElement.value);
          }
        }
        else {
          this.defaultCustomer = new Customer();
          this.filteredCustomers = [];
          this.customerId = 0;
        }
      }
      else {
        this.defaultCustomer = new Customer();
        this.filteredCustomers = [];
        this.customerId = 0;
      }

    });
  }

  GetAllSearchCustomers(searchString: string): void {
    let customerGrid: GridDisplayInput = {
      Search: searchString,
      Skip: this.customerPagerConfig.RecordsToSkip,
      Take: this.customerPagerConfig.RecordsToFetch,
      CompanyId: this.companyId
    };

    let customerResult = <Observable<CustomerGrid>>this.customerApiService.GetAllSearchCustomers(customerGrid);
    customerResult.subscribe((data) => {
      this.customers = data.Customers;
      this.filteredCustomers = this.customers
      this.customerPagerConfig.TotalRecords = data.TotalRecords;
      this.defaultCustomer = this.customers[0];
      this.customerId = this.defaultCustomer.CustomerId;
    });
  }

  getCustomerCategroies(): void {
    let serviceCategoriesResult = <Observable<Array<any>>>this.customerApiService.getCustomerCategories();
    serviceCategoriesResult.subscribe((data) => {
      this.customerCategroies = data;
    });
  }

  getpaymentTerms(): void {
    let paymentTermsResult = <Observable<Array<any>>>this.sharedServiceObj.getPaymentTerms(this.sessionService.getCompanyId());
    paymentTermsResult.subscribe((data) => {
      this.paymentTerms = data;
    });
  }

  getCountries(): void {
    let countriesResult = <Observable<Array<any>>>this.supplierApiService.getCountries();
    countriesResult.subscribe((data) => {
      this.countries = data;
    });
  }

  getCurrenceis(): void {
    let currenciesResult = <Observable<Array<any>>>this.supplierApiService.getCurrencies();
    currenciesResult.subscribe((data) => {
      this.currencies = data;
    });
  }

  getTaxGroups(taxClass: number): void {
    let taxGroupsResult = <Observable<Array<any>>>this.sharedServiceObj.getTaxGroups(taxClass);
    taxGroupsResult.subscribe((data: Array<Taxes>) => {
      if (data != null && data.length > 0) {
        this.customerInfoForm.get('TaxId').setValue(data[0].TaxId);
      }
      this.taxGroups = data;
    });
  }

  validateControl(control: FormControl) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  closewindow(): void {
    this.savedsucess = false;
  }

  showFullScreen() {
    FullScreen(this.rightPanelRef.nativeElement);
  }

  editData() {
    if (this.customerId > 0) {
      this.hideText = false;
      this.hideInput = true;
      this.formError = "";
      this.message = "";
      this.isDisplayMode = false;
      this.isExistingCustomer = true;
      this.customerInfoForm.reset();
      this.customerInfoForm.setErrors(null);
      this.customerInfoForm.patchValue(this.defaultCustomer);
    }
  }

  addData() {
    this.hideText = false;
    this.hideInput = true;
    this.formError = "";
    this.message = "";
    this.isDisplayMode = false;
    this.isExistingCustomer = false;
    this.linesToAdd = 1;
    this.customerInfoForm.reset();
    this.customerInfoForm.patchValue({
      PaymentTermsId: this.paymentTerms[0].PaymentTermsId
    });
  }

  cancleData() {
    this.hideText = true;
    this.hideInput = false;
    this.formError = "";
    this.message = "";
    this.isExistingCustomer = false;
    this.isDisplayMode = true;
    this.formSubmitAttempt = false;
  }

  onChecked(event) {
    if (event.target.checked) {
      this.customerInfoForm.get('ShippingAddress').setValue(this.customerInfoForm.get('BillingAddress').value);
      this.customerInfoForm.get('ShippingCity').setValue(this.customerInfoForm.get('BillingCity').value);
      this.customerInfoForm.get('ShippingCountryId').setValue(this.customerInfoForm.get('BillingCountryId').value);
      this.customerInfoForm.get('ShippingZipcode').setValue(this.customerInfoForm.get('BillingZipcode').value);
      this.customerInfoForm.get('ShippingTelephone').setValue(this.customerInfoForm.get('BillingTelephone').value);
      this.customerInfoForm.get('ShippingFax').setValue(this.customerInfoForm.get('BillingFax').value);
    } else {
      this.customerInfoForm.get('ShippingAddress').setValue("");
      this.customerInfoForm.get('ShippingCity').setValue("");
      this.customerInfoForm.get('ShippingCountryId').setValue("");
      this.customerInfoForm.get('ShippingZipcode').setValue("");
      this.customerInfoForm.get('ShippingTelephone').setValue("");
      this.customerInfoForm.get('ShippingFax').setValue("");
    }
  }

  onRecordSelected(customer: Customer) {
    this.hideText = true;
    this.hideInput = false;
    this.isDisplayMode = true;
    let customerResult = <Observable<Customer>>this.customerApiService.getCustomerById(customer.CustomerId);
    customerResult.subscribe((data) => {
      if (data != null) {
        this.defaultCustomer = data;
        this.customerInfoForm.patchValue(this.defaultCustomer);
        this.customerId = this.defaultCustomer.CustomerId;
      }
    });
  }

  filterData() {
    let customerName = "";
    let customerCategoryId = 0;
    let customerCity = "";
    this.filterMessage = "";
    if (this.customerFilterInfoForm.get('CustomerName').value != "") {
      customerName = this.customerFilterInfoForm.get('CustomerName').value.CustomerName;
    }

    if (this.customerFilterInfoForm.get('CustomerCategory').value != "") {
      customerCategoryId = this.customerFilterInfoForm.get('CustomerCategory').value.CustomerCategoryId;
    }

    if (this.customerFilterInfoForm.get('CustomerCity').value != "") {
      customerCity = this.customerFilterInfoForm.get('CustomerCity').value;
    }

    if (customerName === '' && customerCategoryId === 0 && customerCity === '') {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }

      return;
    }

    if (customerName != '' && customerCategoryId != 0 && customerCity != '') {
      this.filteredCustomers = this.customers.filter(x => x.CustomerName.toLowerCase().indexOf(customerName.toLowerCase()) !== -1 && x.CustomerCategoryId === Number(customerCategoryId) && (x.BillingCity.toLowerCase().indexOf(customerCity.toLowerCase()) !== -1));
    }

    if (customerName != '' && customerCategoryId === 0 && customerCity === '') {
      this.filteredCustomers = this.customers.filter(x => x.CustomerName.toLowerCase().indexOf(customerName.toLowerCase()) !== -1);
    }

    if (customerName != '' && customerCategoryId != 0 && customerCity === '') {
      this.filteredCustomers = this.customers.filter(x => x.CustomerName.toLowerCase().indexOf(customerName.toLowerCase()) !== -1 && x.CustomerCategoryId === Number(customerCategoryId));
    }

    if (customerName != '' && customerCategoryId === 0 && customerCity != '') {
      this.filteredCustomers = this.customers.filter(x => x.CustomerName.toLowerCase().indexOf(customerName.toLowerCase()) !== -1 && (x.BillingCity.toLowerCase().indexOf(customerCity.toLowerCase()) !== -1));
    }

    if (customerName === '' && customerCategoryId != 0 && customerCity === '') {
      this.filteredCustomers = this.customers.filter(x => x.CustomerCategoryId === Number(customerCategoryId));
    }

    if (customerName === '' && customerCategoryId != 0 && customerCity != '') {
      this.filteredCustomers = this.customers.filter(x => x.CustomerCategoryId === Number(customerCategoryId) && (x.BillingCity.toLowerCase().indexOf(customerCity.toLowerCase()) !== -1));
    }

    if (customerName === '' && customerCategoryId === 0 && customerCity != '') {
      this.filteredCustomers = this.customers.filter(x => x.BillingCity.toLowerCase().indexOf(customerCity.toLowerCase()) !== -1);
    }

    if (this.filteredCustomers.length > 0) {
      this.customerPagerConfig.TotalRecords = this.filteredCustomers.length;
      this.defaultCustomer = this.filteredCustomers[0];
      this.customerId = this.defaultCustomer.CustomerId;
      this.isFilterApplied = true;
      if (open) {
        this.initDone = false;
      }

    }
    else {
      this.filterMessage = "No matching records are found";
      this.filteredCustomers = this.customers;
      this.customerPagerConfig.TotalRecords = this.filteredCustomers.length;
      if (this.filteredCustomers.length > 0) {
        this.defaultCustomer = this.filteredCustomers[0];
        this.customerId = this.defaultCustomer.CustomerId;
      }
    }
  }

  resetFilters() {
    this.customerFilterInfoForm.get('CustomerName').setValue("");
    this.customerFilterInfoForm.get('CustomerCategory').setValue("");
    this.customerFilterInfoForm.get('CustomerCity').setValue("");
    this.filterMessage = "";
    this.filteredCustomers = this.customers;
    this.customerPagerConfig.TotalRecords = this.filteredCustomers.length;

    if (this.filteredCustomers.length > 0) {
      this.defaultCustomer = this.filteredCustomers[0];
      this.customerId = this.defaultCustomer.CustomerId;
    }

    this.isFilterApplied = false;
    if (this.customerNameInput != undefined) {
      this.customerNameInput.nativeElement.focus();
      this.renderer.invokeElementMethod(this.customerNameInput.nativeElement, 'focus'); // NEW VERSION
    }
  }

  onApproverChange(event: any) {
  }

  onApprovalTypeChange(event: any) {
  }

  split() {
    this.leftsection = !this.leftsection;
    this.rightsection = !this.rightsection;
  }

  onChange(event: any) {
    if (event.target.value != "") {
      this.isSearchApplied = true;
      this.GetAllSearchCustomers(event.target.value);
    }
    else {
      this.isSearchApplied = false;
      this.getCustomers();
    }
  }

  openDialog() {
    this.initDone = true;
    let customerCategoriesResult = <Observable<Array<any>>>this.customerApiService.getCustomerCategories();
    customerCategoriesResult.subscribe((data) => {
      this.searchCategroies = data;
      this.customerNameInput.nativeElement.focus();
      this.renderer.invokeElementMethod(this.customerNameInput.nativeElement, 'focus'); // NEW VERSION     
    });
  }

  resetData() {
    this.isFilterApplied = false;
    this.initDone = false;
    this.resetFilters();
  }

  fullScreen() {
    FullScreen(this.rightPanelRef.nativeElement);
  }

  createCustomer(customer: any): void {
    const self = this;
    this.customerApiService.createCustomer(customer).subscribe(
      (data: any) => {
        this.hideText = true;
        this.hideInput = false;
        this.isDisplayMode = true;
        this.formSubmitAttempt = false;

        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.SavedSuccessFully,
          MessageType: MessageTypes.Success
        });

        this.getCustomers();

      },
      err => {
        this.hideText = false;
        this.hideInput = true;
      }
    );
  }

  updateCustomer(customer: any): void {
    const self = this;
    this.customerApiService.updateCustomer(customer).subscribe(
      (data: any) => {
        this.hideText = true;
        this.hideInput = false;
        this.isDisplayMode = true;
        this.formSubmitAttempt = false;

        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.UpdatedSuccessFully,
          MessageType: MessageTypes.Success
        });

        this.getCustomers();
      },
      err => {
        this.hideText = false;
        this.hideInput = true;
      }
    );
  }

  deleteRecord() {
    let recordId = this.defaultCustomer.CustomerId;
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.customerApiService.deleteCustomer(recordId).subscribe((data) => {
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.DeletedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.getCustomers();
        });

      },
      reject: () => {
      }
    });
  }

  onSubmit() {
    $(".toast-message-view").removeClass("slide-down-and-up");
    this.customerInfoForm.get('Status').setValue(1);
    this.customerInfoForm.get('IsDeleted').setValue(false);
    this.savedsucess = false;
    this.formError = "";
    this.formSubmitAttempt = true;

    if (!this.customerInfoForm.valid) {

      this.formError = "Please fill in the mandatory fields (marked in red) and then click on Save";
      return;
    }
    this.savedsucess = true;
    let customerFormDetails: Customer = this.customerInfoForm.value;
    customerFormDetails.CompanyId = this.companyId;

    if (this.isExistingCustomer) {
      this.updateCustomer(customerFormDetails);
    }
    else {
      this.createCustomer(customerFormDetails);
    }
  }

  pageChange(currentPageNumber: any) {
    this.customerPagerConfig.RecordsToSkip = this.customerPagerConfig.RecordsToFetch * (currentPageNumber - 1);
    this.getCustomers();
  }
}

export class CustomerCategories {
  CustomerCategoryId: number;
  CategoryName: string;
}
