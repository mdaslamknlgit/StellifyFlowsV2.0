import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FullScreen, restrictMinus } from "../../../shared/shared";
import { CompanyApiService } from '../../services/company-api.service';
import { SharedService } from '../../../shared/services/shared.service';
import { Company, CompanyGrid, CompanyFilterModel } from '../../models/company';
import { Messages, MessageTypes, Taxes, PagerConfig, UserDetails, WorkFlowProcess, WorkFlowStatus, WorkFlowApproval, ResponseStatusTypes, Countries, Currency } from "../../../shared/models/shared.model";
import { GridDisplayInput } from '../../../po/models/supplier';
import { Observable, of } from 'rxjs';
import { ConfirmationService } from 'primeng/primeng';
import { EMAIL_PATTERN, NUMBER_PATERN, AMOUNT_PATERN } from '../../../shared/constants/generic';
import { NgbModal, NgbModalRef, ModalDismissReasons, NgbActiveModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, map, catchError, switchMap } from 'rxjs/operators';
import { SupplierApiService } from '../../../po/services/supplier-api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-companies-list',
  templateUrl: './companies-list.component.html',
  styleUrls: ['./companies-list.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class CompaniesListComponent implements OnInit {
  @ViewChild('rightPanel') rightPanelRef;
  @ViewChild('CompanyName') private CompanyName: any;
  hideText: boolean = true;
  hideRecords?: boolean = null;
  hideInput: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  isDisplayMode: boolean = true;
  savedsuccess: boolean = false;
  initDone = false;
  isExistingCompany: boolean = false;
  formError: string = "";
  message: string = "";
  linesToAdd: number = 1;
  formSubmitAttempt: boolean = false;
  signupForm: FormGroup;
  companyInfoForm: FormGroup;
  companyFilterInfoForm: FormGroup;
  companies: Company[] = [];
  countries = [];
  currencyTypes: Currency[] = [];
  defaultCompany: Company;
  companyId: number = 0;
  userId: number = 0;
  filteredCompanies = [];
  filteredCompaniesCols: any[];
  isFilterApplied: boolean = false;
  isSearchApplied: boolean = false;
  showFilterPopUp: boolean = false;
  filterMessage: string = "";
  companySearchKey: string;
  organizations = [];
  companiesList: Array<Company> = [];
  errorMessage: string = Messages.NoRecordsToDisplay;
  public scrollbarOptions = { axis: 'y', theme: 'minimal-dark' };
  companyPagerConfig: PagerConfig;
  gridColumns: Array<{ field: string, header: string }> = [];
  deletedContactsList: Array<number> = [];
  usersList = [];
  departmentsList = [];
  usersListSettings = {};
  departmentListSettings = {};
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean;
  approvePermission: boolean;
  showfilters:boolean=true;
  showfilterstext:string="Hide List" ;

  public innerWidth: any;
  public selectedItems: any[];
  constructor(private fb: FormBuilder,
    private router: Router,
    private companyApiService: CompanyApiService,
    private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService,
    private renderer: Renderer,
    private reqDateFormatPipe: RequestDateFormatPipe,
    private supplierApiService: SupplierApiService,
    public sessionService: SessionStorageService
  ) {
    this.userId = JSON.parse(sessionStorage.getItem('userDetails')).UserID;
    this.defaultCompany = new Company();
    this.companyPagerConfig = new PagerConfig();
    this.companyPagerConfig.RecordsToSkip = 0;
    this.companyPagerConfig.RecordsToFetch = 25;

    this.filteredCompaniesCols = [
      { field: 'SNo', header: '#' },
      { field: 'Saluation', header: 'Title' },
      { field: 'Surname', header: 'Surname' },
      { field: 'Name', header: 'First Name' },
      { field: 'ContactNumber', header: 'Contact Number' },
      { field: 'Department', header: 'Department' },
      { field: 'EmailId', header: 'Email' }
    ];


    this.filteredCompaniesCols = [
      { field: 'CompanyName', header: 'Company Name' },
      { field: 'CompanyShortName', header: 'Short Name' },
      { field: 'CompanyCode', header: 'Company Code' },
      { field: 'ZipCode', header: 'Postal Code' },
      { field: 'Telephone', header: 'Telephone' },
      { field: 'Email', header: 'Email' },
      { field: 'Website', header:'Website'},
      { field: '', header:'Actions'}
    ];
  }

  ngOnInit() {
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "companies")[0];
      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.deletePermission = formRole.IsDelete;
      this.approvePermission = formRole.IsApprove;
    }
    else {
      this.newPermission = true;
      this.editPermission = true;
      this.deletePermission = true;
      this.approvePermission = true;
    }

    this.companyInfoForm = this.fb.group({
      CompanyId: '0',
      OrganizationId: '',
      CompanyCode: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      CompanyName: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      CompanyShortName: '',
      CompanyDescription: '',
      CompanyRegistrationNumber: '',
      Address1: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      Address2: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      Address3: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      Address4: '',
      City: '',
      CountryName: ['', { validators: [Validators.required] }],
      Countries: ['', { validators: [Validators.required] }],
      Country: ['', { validators: [Validators.required] }],
      ZipCode: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      SupplierVerifier: '',
      SupplierVerifierName: '',
      InvoiceLimit: [0, { validators: [Validators.required] }],
      GST: '',
      GSTRegistrationNumber: '',
      UserNames: '',
      GLCodeUsersList: '',
      DepartmentList: '',
      Email: ['', { validators: [Validators.pattern(EMAIL_PATTERN), Validators.email] }],
      Website: '',
      MCSTOffice: '',
      Telephone: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      Mobilenumber: '',
      Fax: '',
      IsDeleted: false,
      ContactPersons: this.fb.array([]),
      Currency: ['', { validators: [Validators.required] }]
    });

    this.companyFilterInfoForm = this.fb.group({
      CompanyName: [''],
      CompanyCode: [''],
      Country: [''],
      FromDate: [],
      ToDate: []
    });
    this.usersListSettings = {
      singleSelection: false,
      idField: 'UserID',
      textField: 'UserName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.departmentListSettings = {
      singleSelection: false,
      idField: 'LocationID',
      textField: 'Name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    //this.getSupplierVerifiers();
    this.getAllDepartments();
    this.GetCurrencyType();
    this.getOrganizations();
    this.getCountries();
    this.getCompanies(); 
    this.showfilters =false;
    this.showfilterstext="Hide List" ;
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }


  initGridRows() {
    return this.fb.group({
      'ContactPersonId': [0],
      'Saluation': ["", [Validators.required, Validators.maxLength(150)]],
      'Surname': ["", [Validators.required, Validators.maxLength(150)]],
      'Name': ["", [Validators.required, Validators.maxLength(150)]],
      'ContactNumber': ["", [Validators.required]],
      'Department': ["", [Validators.required, Validators.maxLength(150)]],
      'EmailId': ["", { validators: [Validators.pattern(EMAIL_PATTERN), Validators.required, Validators.email] }]
    });
  }

  //adding row to the grid..
  addGridItem(noOfLines: number) {
    let contactGroupControl = <FormArray>this.companyInfoForm.controls['ContactPersons'];
    for (let i = 0; i < noOfLines; i++) {
      contactGroupControl.push(this.initGridRows());
    }
  }
  /**
   * to remove the grid item...
   */
  removeGridItem(rowIndex: number) {
    let contactGroupControl = <FormArray>this.companyInfoForm.controls['ContactPersons'];
    let contactPersonId = contactGroupControl.controls[rowIndex].get('ContactPersonId').value;
    if (contactPersonId > 0) {
      this.deletedContactsList.push(contactPersonId);
    }
    contactGroupControl.removeAt(rowIndex);
  }
  editData() {
    if (this.companyId > 0) {
      this.hideText = false;
      this.hideInput = true;
      this.formError = "";
      this.message = "";
      this.isDisplayMode = false;
      this.isExistingCompany = true;
      this.companyInfoForm.reset();
      this.companyInfoForm.get('ContactPersons').reset();
      this.companyInfoForm.setErrors(null);
      let itemGroupControl = <FormArray>this.companyInfoForm.controls['ContactPersons'];
      itemGroupControl.controls = [];
      itemGroupControl.controls.length = 0;
      this.linesToAdd = 1;
      if (this.defaultCompany.ContactPersons == null) {
        this.defaultCompany.ContactPersons = [];
      }
      this.addGridItem(this.defaultCompany.ContactPersons.length);
      this.companyInfoForm.patchValue(this.defaultCompany);
      let selectedCurrency = this.currencyTypes.find(x=>x.Id == this.defaultCompany.Currency.Id);
      this.companyInfoForm.get('Currency').setValue(selectedCurrency);
    }

  }
  

  onClickedOutside(e: Event) {
   // this.showfilters= false; 
    if(this.showfilters == false){ 
     // this.showfilterstext="Show List"
  }
  }
split() {
this.showfilters=!this.showfilters;
if(this.showfilters == true){ 
this.showfilterstext="Hide List" 
}
else{
  this.showfilterstext="Show List" 
}
}

  showLeftCol(event) {
    $(".leftdiv").removeClass("hideleftcol");
    $(".rightPanel").removeClass("showrightcol");
  }
  AddCompany(e) {
    this.router.navigate([`/admin/companies/${'NEW'}/${0}`]);
    // this.showfilters =false;
    // this.showfilterstext="Show List" ;

    // this.innerWidth = window.innerWidth;
    // if (this.innerWidth < 550) {
    //   $(".leftdiv").addClass("hideleftcol");
    //   $(".rightPanel").addClass("showrightcol");
    // }

    // this.hideText = false;
    // this.hideInput = true;
    // this.formError = "";
    // this.message = "";
    // this.isDisplayMode = false;
    // this.isExistingCompany = false;
    // this.linesToAdd = 1;
    // this.companyInfoForm.reset();
    // this.companyInfoForm.patchValue({
    //   'Currency': null
    // })
  }
  cancleData() {
    this.hideText = true;
    this.hideInput = false;
    this.formError = "";
    this.message = "";
    this.isExistingCompany = false;
    this.isDisplayMode = true;
    this.formSubmitAttempt = false;
  }
  fullScreen() {
    FullScreen(this.rightPanelRef.nativeElement);
  }

  GetCurrencyType() {
    this.supplierApiService.getCurrencies().subscribe((data: Currency[]) => { this.currencyTypes = data });
  }

  onSubmit() { 
    $(".toast-message-view").removeClass("slide-down-and-up");
    this.savedsuccess = false;
    this.formError = "";
    this.formSubmitAttempt = true;
    //console.log(this.companyInfoForm);
    if (!this.companyInfoForm.valid) {
      this.formError = "Please fill in the mandatory fields (marked in red) and then click on Save";
      return;
    }
    this.savedsuccess = true; 
    let companyFormDetails: Company = this.companyInfoForm.value;
    //companyFormDetails.CompanyId = this.sessionService.getCompanyId();
    companyFormDetails.ContactPersons.forEach(i => {
      if (i.ContactPersonId > 0) {
        let previousRecord = this.defaultCompany.ContactPersons.find(j => j.ContactPersonId == i.ContactPersonId);
        if (
          i.ContactNumber != previousRecord.ContactNumber ||
          i.EmailId != previousRecord.EmailId ||
          i.Name != previousRecord.Name ||
          i.Saluation != previousRecord.Saluation ||
          i.Surname != previousRecord.Surname) {
          i.IsModified = true;
        }
      }
      else {
        i.ContactPersonId = 0;
      }
    });
    companyFormDetails.ContactPersons = companyFormDetails.ContactPersons.filter(i => i.ContactPersonId == 0 || i.ContactPersonId == null || i.IsModified == true);
    if (this.isExistingCompany) {
      this.updateCompany(this.companyInfoForm.value);
    }
    else {
      this.createCompany(this.companyInfoForm.value);
    }
  }

  updateCompany(company: any): void {
    company.ContactPersonsToDelete = this.deletedContactsList;
    company.UpdatedBy = this.userId;
    this.companyApiService.updateCompany(company).subscribe(
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

        this.getCompanies();
      },
      (data: HttpErrorResponse) => {
        if (data.error.Message == ResponseStatusTypes.Duplicate) {
          {
            this.showDuplicateMessage();
          }

          this.hideText = false;
          this.hideInput = true;
        }
        else if (data.error.Message == ResponseStatusTypes.Duplicate1) {
          this.showCompanyDuplicateMessage();

          this.hideText = false;
          this.hideInput = true;
        }

      }
    );
  }

  deleteRecord() {
    let recordId = this.defaultCompany.CompanyId;
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.companyApiService.deleteCompany(recordId).subscribe((data) => {
          if (data == true) {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.CompanyValidationMessage,
              MessageType: MessageTypes.Error

            });
          }
          else {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.DeletedSuccessFully,
              MessageType: MessageTypes.Success

            });
          }
          this.getCompanies();
        });

      },
      reject: () => {
      }
    });
  }


  getOrganizations() {
    let countriesResult = <Observable<Array<any>>>this.companyApiService.getOrganizations();
    countriesResult.subscribe((data) => {
      this.organizations = data;
    });
  }
  showDuplicateMessage() {
    this.companyInfoForm.get('CompanyCode').setErrors({
      'Duplicate': true
    });
  }
  showCompanyDuplicateMessage() {
    this.companyInfoForm.get('CompanyName').setErrors({
      'DuplicateCompanyName': true
    });
  }
  createCompany(company: any): void {
    company.CreatedBy = this.userId;
    this.companyApiService.createCompany(company).subscribe(
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

        this.getCompanies();
      },
      (data: HttpErrorResponse) => {
        if (data.error.Message == ResponseStatusTypes.Duplicate) {
          {
            this.showDuplicateMessage();
          }

          this.hideText = false;
          this.hideInput = true;
        }
        else if (data.error.Message == ResponseStatusTypes.Duplicate1) {
          this.showCompanyDuplicateMessage();

          this.hideText = false;
          this.hideInput = true;
        }

      }

    );
  }
  validateControl(control: FormControl) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  getCompanies(): void {

    let companyGrid: GridDisplayInput = {
      Search: "",
      Skip: this.companyPagerConfig.RecordsToSkip,
      Take: this.companyPagerConfig.RecordsToFetch,
      CompanyId: 0
    };

    let customerResult = <Observable<CompanyGrid>>this.companyApiService.getCompanies(companyGrid);
    customerResult.subscribe((data) => {
      if (data != null) {
        this.companies = data.Companies;
        if (this.companies.length > 0) {
          this.filteredCompanies = this.companies
          this.companyPagerConfig.TotalRecords = data.TotalRecords;
          //debugger;
          //this.onRecordSelected(this.companies[0].CompanyId);
          if (this.isFilterApplied) {
            this.filterData();
          }
          if (this.isSearchApplied) {
            this.getAllSearchCompaniesFilter(this.companySearchKey);
          }
        }
        else {
          this.defaultCompany = new Company();
          this.filteredCompanies = [];
          this.companyId = 0;
        }
      }
      else {
        this.defaultCompany = new Company();
        this.filteredCompanies = [];
        this.companyId = 0;
      }

    });
  }
  getCountries(): void {
    let countriesResult = <Observable<Array<any>>>this.sharedServiceObj.getCountries();
    countriesResult.subscribe((data) => {
      this.countries = data;
    });
  }
  getSupplierVerifiers(): void {
    let usersList = <Observable<Array<any>>>this.sharedServiceObj.getSupplierVerifiers();
    usersList.subscribe((data) => {
      this.usersList = data;
    });
  }

  getAllDepartments(): void {
    let departmentsList = <Observable<Array<any>>>this.sharedServiceObj.getAllUniqueDepartments();
    departmentsList.subscribe((data) => {
      this.departmentsList = data;
    });
  }

  // onRecordSelected(company: Company) {
  //   this.split();
  //   this.hideText = true;
  //   this.hideInput = false;
  //   this.isDisplayMode = true;
  //   let customerResult = <Observable<Company>>this.companyApiService.getCompanyById(company.CompanyId);
  //   customerResult.subscribe((data) => {
  //     if (data != null) {
  //       this.defaultCompany = data;
  //       this.companyInfoForm.patchValue(this.defaultCompany);
  //       this.companyId = this.defaultCompany.CompanyId;
  //     }
  //   });
  // }
  onRecordSelected(CompanyId: any) {

    this.router.navigate([`/admin/companies/${'EDIT'}/${CompanyId}`]);
  }
  hidefilter() {
  
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 550) {
      $(".filter-scroll tr").click(function () {
        $(".leftdiv").addClass("hideleftcol");
        $(".rightPanel").addClass("showrightcol");
        $(".rightcol-scrroll").height("100%");
      });
    }
  }
  getAllSearchCompanies(searchString: string): void {
    let companyGrid: GridDisplayInput = {
      Search: searchString,
      Skip: this.companyPagerConfig.RecordsToSkip,
      Take: this.companyPagerConfig.RecordsToFetch,
      CompanyId: 0
    };

    let customerResult = <Observable<CompanyGrid>>this.companyApiService.getAllSearchCompanies(companyGrid);
    customerResult.subscribe((data) => {
      this.companies = data.Companies;
      this.filteredCompanies = this.companies
      this.companyPagerConfig.TotalRecords = data.TotalRecords;
      this.defaultCompany = this.companies[0];
      this.companyId = this.defaultCompany.CompanyId;
    });
  }
  getAllSearchCompaniesFilter(searchKey: string, companyFilterData?: CompanyFilterModel): void {
    let companyDisplayInput = {
      Skip: this.companyPagerConfig.RecordsToSkip,
      Take: this.companyPagerConfig.RecordsToFetch,
      Search: (searchKey == null || searchKey == "null") ? "" : searchKey,
      CompanyId: this.companyId,
      CompanyCode: (companyFilterData == undefined || companyFilterData == null || companyFilterData.CompanyCode == null) ? "" : companyFilterData.CompanyCode,
      CompanyName: (companyFilterData == undefined || companyFilterData == null || companyFilterData.CompanyName == null) ? "" : companyFilterData.CompanyName,
      Country: (companyFilterData == undefined || companyFilterData == null || companyFilterData.Country == null) ? "" : companyFilterData.Country
    };

    // this.showLeftPanelLoadingIcon = true;
    this.companyApiService.getAllSearchCompaniesFilter(companyDisplayInput)
      .subscribe((data: CompanyGrid) => {
        this.companiesList = data.Companies;
        this.companyPagerConfig.TotalRecords = data.TotalRecords;
        //not from the latest, its from the existing
        this.companies = data.Companies;
        if (this.companies != null && this.companies.length > 0) {
          this.filteredCompanies = this.companies
          this.companyPagerConfig.TotalRecords = data.TotalRecords;

          if (open) {
            this.showFilterPopUp = false;
          }
          this.hideRecords = false;
          if (companyFilterData != null) {
            this.isFilterApplied = true;
          }
          this.defaultCompany = this.companies[0];
          this.companyId = this.defaultCompany.CompanyId;
          //this.onRecordSelected(this.companies[0].CompanyId);
        }
        else {
          this.filterMessage = "No matching records are found";
          this.isFilterApplied = true;
          this.hideRecords = false;
        }
        //end of re-using the code 
        // this.showLeftPanelLoadingIcon = false;
        // if(this.companiesList.length>0)
        // {
        //   if(purchaseOrderIdToBeSelected==0)
        //   {
        //       this.onRecordSelection(this.companiesList[0].PurchaseOrderId,this.companiesList[0].POTypeId);
        //   }
        //   else
        //   {
        //       this.onRecordSelection(purchaseOrderIdToBeSelected,this.companiesList[0].POTypeId);
        //   }
        // }
        // else
        // {
        //     this.hideText = true;
        //    //this.addRecord();
        // }             
      }, (error) => {
        //this.showLeftPanelLoadingIcon = false;
      });
    //this.getCompanies();



    // let companyGrid: GridDisplayInput = {
    //   Search: searchString,
    //   Skip: this.companyPagerConfig.RecordsToSkip,
    //   Take: this.companyPagerConfig.RecordsToFetch,
    //   CompanyId: 0
    // };

    // let customerResult = <Observable<CompanyGrid>>this.companyApiService.GetAllSearchCompanies(companyGrid);
    // customerResult.subscribe((data) => {
    //   this.companies = data.Companies;
    //   this.filteredCompanies = this.companies
    //   this.companyPagerConfig.TotalRecords = data.TotalRecords;
    //   this.defaultCompany = this.companies[0];
    //   this.companyId = this.defaultCompany.CompanyId;
    // });
  }
  onChange(event: any) {
    if (event.target.value != "") {
      this.isSearchApplied = true;
      this.getAllSearchCompanies(event.target.value);
    }
    else {
      this.isSearchApplied = false;
      this.getCompanies();
    }
  }
  openDialog() {
    this.showFilterPopUp = true;
    if (this.CompanyName != undefined) {
      this.CompanyName.nativeElement.focus();
      this.renderer.invokeElementMethod(this.CompanyName.nativeElement, 'focus'); // NEW VERSION
    }
  }
  filterData() {
    this.filterMessage = "";
    let companyFilterData: CompanyFilterModel = this.companyFilterInfoForm.value;
    if ((companyFilterData.CompanyCode == '' || companyFilterData.CompanyCode == null)
      && (companyFilterData.CompanyName == '' || companyFilterData.CompanyName == null)
      && (companyFilterData.Country == '' || companyFilterData.Country == null)) {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }
      return;
    }
    this.getAllSearchCompaniesFilter(this.companySearchKey, companyFilterData);


  }
  resetData() {
    this.isFilterApplied = false;
    this.resetFilters();
  }
  resetFilters() {
    this.companyFilterInfoForm.reset();
    this.showFilterPopUp = false;
    this.filterMessage = "";
    //this.getPurchaseOrders(0,0);
    this.getCompanies();
    this.hideRecords = false;
    this.isFilterApplied = false;
    if (this.CompanyName != undefined) {
      this.CompanyName.nativeElement.focus();
      this.renderer.invokeElementMethod(this.CompanyName.nativeElement, 'focus');
    }


    // this.companyFilterInfoForm.reset();
    // this.filterMessage = "";
    // this.filteredCompanies = this.companies;
    // this.companyPagerConfig.TotalRecords = this.filteredCompanies.length;

    // if (this.filteredCompanies.length > 0) {
    //   this.defaultCompany = this.filteredCompanies[0];
    //   this.companyId = this.defaultCompany.CompanyId;
    // }

    // this.isFilterApplied = false;
    // if (this.CompanyName != undefined) {
    //   this.CompanyName.nativeElement.focus();
    //   this.renderer.invokeElementMethod(this.CompanyName.nativeElement, 'focus'); 
    // }

  }
  pageChange(currentPageNumber: any) {
    this.companyPagerConfig.RecordsToSkip = this.companyPagerConfig.RecordsToFetch * (currentPageNumber - 1);
    this.getCompanies();
     this.showfilters =false;
    this.showfilterstext="Hide List" ;

  }
  restrictMinus(event: any) {
    restrictMinus(event);
  }

  countryInputFormatter = (x: Countries) => x.Name;
  countryNameSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.sharedServiceObj.getSearchCountries({
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

  onCountryChange(event?: any) {
    let countryDetails: Countries;
    if (event != null && event != undefined) {
      countryDetails = event.item;
    }

    this.companyInfoForm.patchValue({
      'CountryName': countryDetails.Name,
      'Countries': countryDetails,
      'Country': countryDetails.Id
    });


  }
}
