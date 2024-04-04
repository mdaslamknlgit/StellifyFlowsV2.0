import { Component, OnInit, ViewChild, ElementRef, Renderer, EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup, Validators, MaxLengthValidator } from '@angular/forms';
import { SupplierApiService } from '../../services/supplier-api.service';
import { Supplier, GridDisplayInput, SupplierGridDisplayInput, SupplierGrid, SupplierCompanyDetails, SupplierSelectedService, SupplierApproval, SupplierSubCode, SupplierFilterModel, VendorsList, Countries } from '../../models/supplier';
import { NUMBER_PATERN, EMAIL_PATTERN } from '../../../shared/constants/generic';
import { SharedService } from "../../../shared/services/shared.service";
import { Messages, MessageTypes, Taxes, TaxGroup, PagerConfig, UserDetails, WorkFlowProcess, WorkFlowStatus, WorkFlowApproval, SupplierCategoryType, SubCodeOptions, ResponseStatusTypes, WorkFlowStatusModel, UploadResult } from "../../../shared/models/shared.model";
import { NgbModal, NgbModalRef, NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { FullScreen, HideFullScreen, ValidateFileType } from "../../../shared/shared";
import { ConfirmationService } from 'primeng/primeng';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierWorkFlowParameter } from '../../../administration/models/workflowcomponent';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { DEFAULT_CURRENCY_ID } from '../../../shared/constants/generic';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
import { NullInjector } from '@angular/core/src/di/injector';
import { Company } from '../../../administration/models/company';
import { NgxSpinnerService } from 'ngx-spinner';
import { WorkBook, utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { SupplierExportAll } from '../../models/SupplierExportAll';
import { PageAccessLevel, Roles } from "../../../administration/models/role";
import { WorkFlowApiService } from '../../../administration/services/workflow-api.service';
import * as XLSX from 'xlsx';
import { Locations } from '../../../inventory/models/item-master.model';

@Component({
  selector: 'app-suppliers-list',
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class SuppliersListComponent implements OnInit {
  @ViewChild('filterContainer') private supplierFilter: any;
  @ViewChild('searchInput') searchInputRef: ElementRef;
  @ViewChild("SupplierName") supplierNameInput: ElementRef;
  @ViewChild("selectedSupplierName") selectedSupplierNameInput: ElementRef;
  @ViewChild("SupplierServices") supplierServicesInput: ElementRef;
  IsSaved: boolean = false;
  @ViewChild('rightPanel') rightPanelRef;
  readListView: EventEmitter<{ SupplierId: number }> = new EventEmitter<{ SupplierId: number }>(); //creating an output event
  doApproveOrReject: boolean = true;
  FilterInfoForm: FormGroup;
  hideText: boolean = true;
  hideInput: boolean = false;
  savedsucess: boolean = false;
  hidealert: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  signupForm: FormGroup;
  suppliersInfoForm: FormGroup;
  supplierFilterInfoForm: FormGroup;
  serviceCategroies = [];
  searchCategroies = [];
  supplierServices = [];
  filteredSuppliers = [];
  filteredSuppliersCols: any[];

  taxGroups: Array<TaxGroup> = [];
  // taxClass: Array<number> = [1, 2, 3, 4, 5];
  taxClasses = [];
  paymentTerms = [];
  countries = [];
  gststatus = [];
  currencies = [];
  formError: string = "";
  suppliers: Supplier[] = [];
  supplierApproval: Supplier[] = [];
  departments: Locations[] = [];
  defaultSupplier: Supplier;
  oldSupplier: Supplier;
  formSubmitAttempt: boolean = false;
  supplierId: number = 0;
  isExistingSupplier: boolean = false;
  message: string = "";
  disableApprove: boolean = false;
  isDisplayMode: boolean = false;
  isSaveEnabled: boolean = false;
  closeResult: string;
  sendForApproveButtonText: string = "";
  filterCriteria: string = "";
  filter = [];
  supplierPagerConfig: PagerConfig;
  isFilterApplied: boolean = false;
  isSearchApplied: boolean = false;
  modalReference: NgbModalRef;
  filterMessage: string = "";
  scrollbarOptions: any = { axis: 'y', theme: 'dark-3' };
  deletedContactsList: Array<number> = [];
  gridColumns: Array<{ field: string, header: string }> = [];
  subGridColumns: Array<{ field: string, header: string }> = [];
  companyColumns: Array<{ field: string, header: string }> = [];
  gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
  IsAttachedPendingApproval: boolean = false;
  initDone = false;
  linesToAdd: number = 1;
  companyId: number = 0;
  requestType: string = "";
  workFlowStatus: any;
  errorMessage: string = Messages.NoRecordsToDisplay;
  isApprovalPage: boolean = false;
  requestSearchKey: string;
  moduleHeading: string;
  uploadedRecords: string = "";
  failedRecords: string = "";
  supplierCategoryType: Array<number> = [];
  supplierServicesdropdownSettings = {};
  isExisted: boolean = false;
  selectedSupplierId: number = 0;
  userDetails: UserDetails;
  showLeftPanelLoadingIcon: boolean = false;
  isNewRecord: boolean = false;
  isOtherCompanySupplier: boolean = false;
  showControl: boolean = false;
  showGridErrorMessage: boolean = false;
  uploadedFiles: Array<File> = [];
  apiEndPoint: string;
  routeSupplierId: number = 0;
  isSubCodeRequired: Array<number> = [];
  rowsToAdd: number = 1;
  defaultSubCode: SupplierSubCode;
  previousWorkFlowStatus: number;
  isApprovedClicked: boolean = false;
  supplierVerfierDetails: UserDetails;
  routeCompanyId: number = 0;
  isReApproval: boolean = false;
  NeedSupplierReApproval: boolean = false;
  isSupplierVerifier: boolean = false;
  isDuplicate: boolean = false;
  hideSupcode: boolean = true;
  showCodeErrorMessage: boolean = false;
  showCodeCountErrorMessage: boolean = false;
  workFlowStatuses: Array<WorkFlowStatusModel> = [];
  workFlowStatusesSupplierApproval: Array<WorkFlowStatusModel> = [];
  currentPage: number = 1;
  isTaxGroupSelected: boolean = false;
  isSupplierAttached: boolean = false;
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean;
  displayPermission: boolean;
  verifyPermission: boolean;
  approvePermission: boolean;
  isExistSupplierName: boolean = false;
  emailPermission: boolean;
  printPermission: boolean;
  importPermission: boolean;
  exportPermission: boolean;
  ShowToolBar:boolean=false;
  isVerifyButton: boolean = true;
  approvalVerifyPermission: boolean;
  isEditMode: boolean = true;
  supplierToDetach: Array<number> = [];
  supplierCompanyToDetach: SupplierCompanyDetails;
  showColumn: boolean = false;
  ExcelExportFileName: string;
  previousSupplierId: number;
  ExportSupplierId: number;
  selectedVendor: Array<VendorsList> = [];
  isCompanyChanged: boolean = false;
  oldCreditLimit: number = null;
  rolesAccessList: Array<PageAccessLevel> = [];
  singleCall: boolean = false;
  showUploadErrorDialog: boolean = false;
  uploadResult: UploadResult = new UploadResult();
  processId: number = 0;
  locationId: number = 0;
  companyName: string = '';
  showVoidPopUp: boolean = false;
  RejectReason: string = '';
  viewLogPermission: boolean = false;
  showLogPopUp: boolean = false;
  public innerWidth: any;
  isApproverUser: boolean = false;
  userRoles = [];
  IsNameChanged: boolean;
  showfilters:boolean=false;
  showfilterstext:string="Hide List" ;
  filtervar:boolean=true;
  TotalRecords: number = 0;
  public screenWidth: any;
  constructor(private fb: FormBuilder,
    private router: Router,
    private supplierApiService: SupplierApiService,
    private confirmationServiceObj: ConfirmationService,
    private workFlowApiService: WorkFlowApiService,
    public sessionService: SessionStorageService,
    private sharedServiceObj: SharedService, private modalService: NgbModal,
    private renderer: Renderer,
    public activatedRoute: ActivatedRoute,
    config: NgbDropdownConfig,
    private reqDateFormatPipe: RequestDateFormatPipe,
    private spinner: NgxSpinnerService) {
    this.companyId = this.sessionService.getCompanyId();
    this.userDetails = <UserDetails>this.sessionService.getUser();
    this.workFlowStatus = WorkFlowStatus;
    this.defaultSupplier = new Supplier();
    this.defaultSupplier.WorkFlowComments = [];
    this.defaultSupplier.SupplierCompanyDetails = new SupplierCompanyDetails();
    this.defaultSupplier.SupplierApproval = new SupplierApproval();
    this.defaultSupplier.Attachments = [];
    this.defaultSubCode = new SupplierSubCode();
    this.initDone = true;
    

    this.gridColumns = [
      { field: 'SNo', header: '#' },
      { field: 'Saluation', header: 'Title' },
      { field: 'Surname', header: 'Surname' },
      { field: 'Name', header: 'FirstName' },
      { field: 'ContactNumber', header: 'Contact Number' },
      { field: 'Department', header: 'Department' },
      { field: 'EmailId', header: 'Email' }
    ];

    this.subGridColumns = [
      { field: 'SNo', header: 'No.' },
      { field: 'SubCodeDescription', header: 'SubCode Description' },
      { field: 'SubCode', header: 'Sub-Code' },
      { field: 'AccountSetId', header: 'Account Set ID' }
    ];

    this.companyColumns = [
      { field: 'SNo', header: 'No.' },
      { field: 'CompanyName', header: 'Company Name' },
      { field: 'CompanyId', header: 'Company Id' },
      { field: 'Address1', header: 'Address' },
      { field: 'Telephone', header: 'Telephone' },
      { field: 'Email', header: 'Email' },
      { field: 'IsDetached', header: 'Detach' }
    ];
    this.getDepartments(this.companyId);

    this.supplierPagerConfig = new PagerConfig();
    this.supplierPagerConfig.RecordsToSkip = 0;
    this.supplierPagerConfig.RecordsToFetch = 25;
    this.currentPage = 1;
    this.supplierCategoryType = [SupplierCategoryType.Internal, SupplierCategoryType.External];
    this.isSubCodeRequired = [SubCodeOptions.NO, SubCodeOptions.YES];
    this.apiEndPoint = environment.apiEndpoint;
  }

  ngOnInit() {
    this.filteredSuppliersCols = [
      { field: 'SupplierCode', header: 'Supplier Code', width: '100px' },
      { field: 'SupplierName', header: 'Supplier', width: '200px' },
      { field: 'CategoryName', header: 'Category', width: '150px' },
      { field: 'WorkFlowStatus', header: 'Status', width: '150px' },
      { field: 'CreatedDate', header: 'Created On', width: '150px' },
      { field: '', header: 'Action', width: '100px' },
  ];

    this.suppliersInfoForm = this.fb.group({
      SupplierId: 0,
      CompanyId: 0,
      SupplierName: ['', { validators: [Validators.required] }],
      LocationId: [null, [Validators.required]],
      // Supplier: [null, [Validators.required]],
      SupplierShortName: [''],
      // SupplierServiceID: ['', { validators: [Validators.required] }],
      SupplierCategoryID: [null, { validators: [Validators.required] }],
      SupplierTypeID: [this.supplierCategoryType[1], { validators: [Validators.required] }], //modified
      // PaymentTermsId: ['', { validators: [Validators.required] }],
      SupplierEmail: ['', { validators: [Validators.pattern(EMAIL_PATTERN), Validators.email] }],
      BillingAddress1: ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      BillingAddress2: [''],
      BillingCity: [''],
      BillingCountry: ['', { validators: [Validators.required] }],
      Country: ['', { validators: [Validators.required] }],
      BillingCountryId: ['', { validators: [Validators.required] }],
      BillingZipcode: [''],
      BillingTelephone: [''],
      BillingAddress3: [''],
      BillingFax: '',
      // TaxClass: ['', { validators: [Validators.required] }],
      IsDeleted: false,
      IsGSTSupplier: '',
      CoSupplierCode: [''],
      // CoSupplierCode: [0, { Validators: [Validators.required] }],
      Remarks: [''],
      ApprovalRemarks: [''],
      BankCode: [''],
      GLAccount: [''],
      SupplierServices: [null, { validators: [Validators.required] }],
      GSTStatusId: [null, { validators: [Validators.required] }],
      GSTNumber: [''],
      ShareCapital: [0],
      IsAttached: [false],
      IsSubCodeRequired: [this.isSubCodeRequired[0]],
      'SupplierCompanyDetails': this.fb.group({
        SupplierCompanyId: 0,
        SupplierId: 0,
        CompanyId: '',
        // GSTStatusId: [0, { validators: [Validators.required] }],
        // TaxId: [0, { validators: [Validators.required] }],
        // TaxClass: ['', { validators: [Validators.required] }],
        TaxId: 0,
        TaxClass: '',
        // GSTNumber: [''],
        RateType: [0],
        Justification: [''],
        CurrencyId: [null, [Validators.required]],
        // ShareCapital: [0],
        CreditLimit: [null],
        // AccountSet: [0],
        BankCode: [''],
        GLAccount: [''],
        PaymentTermsId: [null, { validators: [Validators.required] }],
        ReviewedDate: [new Date()]
      }),
      'SupplierApproval': this.fb.group({
        SupplierApprovalId: 0,
        SupplierId: 0,
        CompanyId: '',
        WorkFlowStatusId: WorkFlowStatus.Draft,
      }),
      ContactPersons: this.fb.array([]),
      SubCodes: this.fb.array([]),
      SupplierEntities: this.fb.array([]),
      SupplierSelectedServices: []
    });

    this.supplierFilterInfoForm = this.fb.group({
      SupplierName: [''],
      SupplierCategory: [''],
      SupplierCity: [''],
      WorkFlowStatusId: [0]
    });

    this.isDisplayMode = true;
    this.isSaveEnabled = true;
    this.hideSupcode = true;
    this.sharedServiceObj.IsCompanyChanged$
      .subscribe((data) => {
        this.isCompanyChanged = data;
        if (this.isCompanyChanged) {

          //this.checkIsSupplierVerifier();
          this.getDepartments(this.companyId);
          this.getpaymentTerms();
          if (!this.isApprovalPage) {
            this.getSuppliers();
          }
          else {
            if (this.routeSupplierId === 0) {
              this.getSupplierApprovals(0, this.companyId);
            }
          }
          this.sharedServiceObj.updateCompany(false);
        }
      });


    this.sharedServiceObj.CompanyId$
      .subscribe((data) => {
        let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
        if (Number(companyId) != 0) {
          this.companyId = companyId
        }
        else
          this.companyId = data;

      });

    this.sharedServiceObj.companyName$
      .subscribe((data) => {
        this.companyName = data;

      });

    this.activatedRoute.paramMap.subscribe((data) => {
      debugger;
      this.onParamChange();
    });

    this.activatedRoute.queryParamMap.subscribe((data) => {
      debugger;
      if (this.activatedRoute.snapshot.queryParamMap.get('code') != null || Number(this.activatedRoute.snapshot.queryParamMap.get('id')) > 0) {
        this.onParamChange();
      }
    });

    this.supplierServicesdropdownSettings = {
      singleSelection: false,
      idField: 'SupplierServiceID',
      textField: 'ServiceName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    //this.getSuppliers();
    //this.checkIsSupplierVerifier();
    this.getserviceCategroies();
    this.getsupplierServices();
    this.getpaymentTerms();
    this.getCountries();
    this.getCurrenceis();
    //this.getTaxGroups(1);
    this.getTaxGroups();
    this.getGSTStaus();
    this.enableGSTNumber(1);
    this.getWorkFlowStatuses();

    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-150;
      }
 
      if (this.filtervar == true){
        setTimeout(()=>{   
        this.showfilters =true;
        this.showfilterstext="Hide List" ;
        this.filtervar=false;
      }, 1000);
      }

  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  getDepartments(companyId: number) {
    this.sharedServiceObj.getUserDepartments(companyId, WorkFlowProcess.Supplier, this.userDetails.UserID).subscribe((data: Array<Locations>) => {
      this.departments = data.filter(item => item.Name != 'Inventory');
    });
  }

  onDepChage(event: any, department: any) {

    this.locationId = event.target.value;
    this.getWorkFlowConfiguration();

  }

  onParamChange() {
    //getting role access levels  
    debugger;
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (this.activatedRoute.snapshot.params.type == "request") {
      if (roleAccessLevels != null && roleAccessLevels.length > 0) {
        let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "suppliers")[0];
        let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
        if (auditLogRole != null)
          this.viewLogPermission = auditLogRole.IsView;
        this.newPermission = formRole.IsAdd;
        this.editPermission = formRole.IsEdit;
        this.deletePermission = formRole.IsDelete;

        this.verifyPermission = formRole.IsVerify;

        this.approvePermission = formRole.IsApprove;
        this.emailPermission = formRole.IsEmail;
        this.printPermission = formRole.IsPrint;
        this.importPermission = formRole.IsImport;
        this.exportPermission = formRole.IsExport;
      }
      else {
        this.newPermission = true;
        this.editPermission = true;
        this.deletePermission = true;

        //this.verifyPermission = true;
        this.verifyPermission = false;
        this.approvePermission = true;
        this.emailPermission = true;
        this.printPermission = true;
        this.importPermission = true;
        this.exportPermission = true;
      }

      if (this.verifyPermission) {
        this.isSupplierVerifier = true;
        this.doApproveOrReject = false;
      }
    }
    else if (this.activatedRoute.snapshot.params.type == "approval") {
      let roleAccessLevels = this.sessionService.getRolesAccess();
      if (roleAccessLevels != false) {
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
          let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "supplierapproval")[0];
          let auditLogRole = roleAccessLevels.filter(x => x.PageName.toLowerCase() == "audit log")[0];
          if (auditLogRole != null)
            this.viewLogPermission = auditLogRole.IsView;
          this.approvalVerifyPermission = formRole.IsVerify;
          this.approvePermission = formRole.IsApprove;
        }
        else {
          // this.approvalVerifyPermission = true;
          this.approvalVerifyPermission = false;
          this.approvePermission = true;
        }

        if (this.approvalVerifyPermission) {
          this.isSupplierVerifier = true;
          this.doApproveOrReject = false;
        }
      }
      else {
        this.getRolesAccessLevel();
      }
    }

    this.defaultSupplier = new Supplier();
    this.defaultSupplier.WorkFlowComments = [];
    this.defaultSupplier.SupplierCompanyDetails = new SupplierCompanyDetails();
    this.defaultSupplier.SupplierApproval = new SupplierApproval();
    this.requestType = this.activatedRoute.snapshot.params.type;
    this.requestSearchKey = this.activatedRoute.snapshot.queryParamMap.get('code');
    let supplierId = Number(this.activatedRoute.snapshot.queryParamMap.get('id'));
    this.routeSupplierId = supplierId;
    let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
    this.routeCompanyId = companyId;
    if (this.activatedRoute.snapshot.params.type == "request") {
      this.moduleHeading = "Supplier List";
      let roleAccessLevels = this.sessionService.getRolesAccess();
      if (roleAccessLevels != null && roleAccessLevels.length > 0) {
        let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "suppliers")[0];

        this.newPermission = formRole.IsAdd;
        this.editPermission = formRole.IsEdit;
        this.deletePermission = formRole.IsDelete;

        this.verifyPermission = formRole.IsVerify;
        this.approvePermission = formRole.IsApprove;
        this.emailPermission = formRole.IsEmail;
        this.printPermission = formRole.IsPrint;
      }
      else {
        this.newPermission = true;
        this.editPermission = true;
        this.deletePermission = true;

        this.verifyPermission = false;
        this.approvePermission = true;
        this.emailPermission = true;
        this.printPermission = true;
      }

      this.isApprovalPage = false;
      if (supplierId > 0) {
        //this.GetAllSearchSuppliers(supplierId.toString());
        this.getSuppliers();

        this.companyId = companyId;
        this.selectedSupplierId = supplierId;


      }
      else {
        this.selectedSupplierId = 0;
        this.getSuppliers();
      }

      if (this.verifyPermission) {
        this.isSupplierVerifier = true;
        this.viewLogPermission = true;
        this.doApproveOrReject = false;
      }
    }

    else if (this.activatedRoute.snapshot.params.type == "approval") {
      this.moduleHeading = "Supplier Approval";
      this.isApprovalPage = true;
      let roleAccessLevels = this.sessionService.getRolesAccess();
      if (roleAccessLevels != false) {
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
          let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "supplierapproval")[0];

          this.approvalVerifyPermission = formRole.IsVerify;
          this.approvePermission = formRole.IsApprove;
        }
        else {

          this.approvalVerifyPermission = false;
          this.approvePermission = true;
        }
        if (this.approvalVerifyPermission) {
          this.isSupplierVerifier = true;
          this.doApproveOrReject = false;
        }
      }
      else {
        this.getRolesAccessLevel();
      }
      if (supplierId > 0) {
        //this.GetAllSearchSuppliers(supplierId.toString());
        this.getSupplierApprovals(supplierId, this.routeCompanyId);
      }
      else {
        this.getSupplierApprovals(0, this.companyId);
      }
    }
  }

  supplierCategoryInputFormater = (x: SupplierCategory) => x.CategoryText;

  supplierCategorySearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term === '' ? []
        : this.searchCategroies.filter(x => x.CategoryText.toLowerCase().indexOf(term.toLowerCase())))
    );


  //this method is used to format the content to be display in the autocomplete textbox after selection..
  supplierInputFormatter = (x: Supplier) => x.SupplierName;
  supplierNameSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        let displaySupplierGrid: SupplierGridDisplayInput = {
          Search: term,
          Skip: this.supplierPagerConfig.RecordsToSkip,
          Take: this.supplierPagerConfig.RecordsToFetch,
          CompanyId: this.companyId,
          RoleID: this.userDetails.RoleID,
          UserId: this.userDetails.UserID
        };
        return this.supplierApiService.getSuppliers(displaySupplierGrid)
          .map((data: SupplierGrid) => {
            return data.Suppliers;
          })
          .pipe(catchError(() => {
            return of([]);
          }))
      })
    );

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


  supplierSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term === "") {
          this.defaultSupplier = new Supplier();
          this.defaultSupplier.WorkFlowComments = [];
          this.defaultSupplier.SupplierCompanyDetails = new SupplierCompanyDetails();
          this.defaultSupplier.SupplierApproval = new SupplierApproval();
          this.defaultSupplier.SupplierServices = [];
          this.clearForm();
          this.suppliersInfoForm.enable();
          $(".selected-item").remove();
          this.suppliersInfoForm.patchValue({
            SupplierTypeID: this.supplierCategoryType[1] //modified
          });
          this.hideSupcode = false;  //modified
          // this.suppliersInfoForm.get('CoSupplierCode').setValidators([Validators.required]); //modified
          this.suppliersInfoForm.get('CoSupplierCode').updateValueAndValidity();
          this.isSaveEnabled = false;
          this.isDisplayMode = false;
          //$(".multiselect").remove();
          $(".multiselect div").removeClass('disablediv');
          this.showControl = true;
          this.addSubCodeGridItem(this.rowsToAdd);
          //setting default subcode here
          return of([]);
        }
        return this.sharedServiceObj.getOtherEntitySuppliers({
          searchKey: term,
          companyId: this.companyId
        }).map((data: Array<any>) => {

          data.forEach((item, index) => {
            item.index = index;
          });

          if (data.length === 0 && term != "") {
            this.suppliersInfoForm.patchValue({
              'SupplierName': term
            });
          }

          //this.showControl = false;
          return data;
        }).pipe(
          catchError((data) => {
            return of([]);
          }))
      })
    );

  getRolesAccessLevel() {
    let userDetails = <UserDetails>this.sessionService.getUser();
    let companyId = Number(this.activatedRoute.snapshot.queryParamMap.get('cid'));
    this.sharedServiceObj.getUserRolesByCompany(userDetails.UserID, companyId).subscribe((roles: Array<Roles>) => {
      this.userRoles = roles;
      userDetails.Roles = this.userRoles;
      this.sessionService.setUser(userDetails);
      let roleIds = Array.prototype.map.call(userDetails.Roles, s => s.RoleID).toString();
      this.sharedServiceObj.getRolesAccessByRoleId(roleIds).subscribe((data: Array<PageAccessLevel>) => {
        this.rolesAccessList = data;
        this.sessionService.setRolesAccess(this.rolesAccessList);
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != false) {
          if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "supplierapproval")[0];
            this.approvalVerifyPermission = formRole.IsVerify;
            this.approvePermission = formRole.IsApprove;
          }
          else {

            this.approvalVerifyPermission = false;
            this.approvePermission = true;
          }
          if (this.approvalVerifyPermission) {
            this.isSupplierVerifier = true;
            this.doApproveOrReject = false;
          }
        }

      });

    });

  }

  OnSupplierNameEdit(event: any) {
    // this.defaultSupplier.SupplierId > 0 &&
    var supplierId = this.defaultSupplier.SupplierId || 0;
    if (event.target.value != null && event.target.value !== '') {
      this.supplierApiService.CheckDuplicateSupplier(supplierId, event.target.value).subscribe((res: boolean) => {
        this.isExistSupplierName = res;
        if (res) {
          this.suppliersInfoForm.get('SupplierName').markAsTouched();
          this.suppliersInfoForm.get('SupplierName').setErrors({ 'incorrect': true });
          // this.suppliersInfoForm.get('SupplierName').updateValueAndValidity();
        }
      });
    }
    else {
      this.isExistSupplierName = false;
    }
  }

  onSupplierNameChanged(event: any) {
    if (event.target.value === "") {
      this.defaultSupplier = new Supplier();
      this.defaultSupplier.WorkFlowComments = [];
      this.defaultSupplier.SupplierCompanyDetails = new SupplierCompanyDetails();
      this.defaultSupplier.SupplierApproval = new SupplierApproval();
      this.defaultSupplier.SupplierServices = [];
      this.clearForm();
      this.suppliersInfoForm.enable();
      $(".selected-item").remove();
      this.suppliersInfoForm.patchValue({
        SupplierTypeID: this.supplierCategoryType[0]
      });

      this.hideSupcode = true;
      this.suppliersInfoForm.get('CoSupplierCode').setValidators([Validators.required]);
      this.suppliersInfoForm.get('CoSupplierCode').updateValueAndValidity();
      this.isSaveEnabled = false;
      this.isDisplayMode = false;
      this.showControl = true;
      this.isNewRecord = false;
      this.isExistSupplierName = false;
    }
  }

  getSuppliers(): void {
    this.showLeftPanelLoadingIcon = true;
    //this.spinner.show(); 
    let displaySupplierGrid: SupplierGridDisplayInput = {
      Search: "",
      Skip: this.supplierPagerConfig.RecordsToSkip,
      Take: this.supplierPagerConfig.RecordsToFetch,
      CompanyId: this.companyId,
      RoleID: this.userDetails.RoleID,
      UserId: this.userDetails.UserID
    };

    let supplierResult = <Observable<SupplierGrid>>this.supplierApiService.getSuppliers(displaySupplierGrid);
    supplierResult.subscribe((data) => {
      this.suppliers = data.Suppliers;
      this.filteredSuppliers = this.suppliers;
      this.isExisted = true;
      this.supplierPagerConfig.TotalRecords = data.TotalRecords;
      this.TotalRecords = data.TotalRecords;
      this.showLeftPanelLoadingIcon = false;
      //this.spinner.hide();
      // if (this.selectedSupplierId > 0) {
      //   this.onRecordSelected(this.selectedSupplierId);
      // }
      // else {
      // if (this.suppliers.length > 0 && this.selectedSupplierId != 0) {
      //   this.onRecordSelected(this.selectedSupplierId);

      // }
      // else
      // {
      //   this.onRecordSelected(this.suppliers[0].SupplierId);
      // }

      if (this.isFilterApplied) {
        this.filterData();
      }
      if (this.isSearchApplied) {
        this.GetAllSearchSuppliers(this.searchInputRef.nativeElement.value);
      }
      if (data.TotalRecords == 0 && data.Suppliers.length == 0) {
        this.defaultSupplier = new Supplier();
        this.defaultSupplier.WorkFlowComments = [];
        this.defaultSupplier.SupplierCompanyDetails = new SupplierCompanyDetails();
        this.defaultSupplier.SupplierApproval = new SupplierApproval();
        this.defaultSupplier.SupplierServices = [];
        this.clearForm();
      }
    });
  }

  getSupplierApprovals(selectedRecordId: number, companyId: number): void {
    //let userDetails = <UserDetails>this.sessionService.getUser();
    this.showLeftPanelLoadingIcon = true;
    //this.spinner.show();
    if (this.filteredSuppliers.length > 0) {
      selectedRecordId = 0;
    }
    let displaySupplierGrid = {
      search: "",
      Skip: this.supplierPagerConfig.RecordsToSkip,
      Take: this.supplierPagerConfig.RecordsToFetch,
      CompanyId: companyId,
      SupplierId: selectedRecordId,
      UserId: this.userDetails.UserID,
      RoleID: this.userDetails.RoleID
    };

    let supplierResult = <Observable<SupplierGrid>>this.supplierApiService.getSupplierApproval(displaySupplierGrid);
    supplierResult.subscribe((data) => {
      this.suppliers = data.Suppliers;
      this.filteredSuppliers = data.Suppliers;
      this.supplierPagerConfig.TotalRecords = data.TotalRecords;
      this.showLeftPanelLoadingIcon = false;
      //this.spinner.hide();
      if (data.TotalRecords > 0) {
        this.isExisted = true;
        // if (selectedRecordId > 0) {
        //   this.onRecordSelected(data.Suppliers.find(data => data.SupplierId == selectedRecordId).SupplierId);
        // }
        // else {
        //   this.onRecordSelected(data.Suppliers[0].SupplierId);
        // }
        if (this.isFilterApplied) {
          this.filterData();
        }

        if (this.isSearchApplied) {
          this.GetAllSearchSuppliers(this.searchInputRef.nativeElement.value);
        }
      }
      else {
        this.isExisted = false;
        this.resetFormControls();
        this.defaultSupplier = new Supplier();
        this.defaultSupplier.WorkFlowComments = [];
      }
    });
  }

  GetAllSearchSuppliers(searchString: string): void {
    this.showLeftPanelLoadingIcon = true;
    //this.spinner.show();
    if (this.activatedRoute.snapshot.params.type == "approval") {
      let displaySupplierGrid = {
        search: searchString,
        Skip: this.supplierPagerConfig.RecordsToSkip,
        Take: this.supplierPagerConfig.RecordsToFetch,
        CompanyId: this.companyId,
        SupplierId: 0,
        UserId: this.userDetails.UserID,
        RoleID: this.userDetails.RoleID
      };

      let supplierResult = <Observable<SupplierGrid>>this.supplierApiService.getSupplierApproval(displaySupplierGrid);
      supplierResult.subscribe((data) => {
        if (data.Suppliers.length > 0) {
          this.suppliers = data.Suppliers;
          this.filteredSuppliers = data.Suppliers;
          this.supplierPagerConfig.TotalRecords = data.TotalRecords;
          this.showLeftPanelLoadingIcon = false;
          //this.spinner.hide();
          
          //this.onRecordSelected(this.suppliers[0].SupplierId);
          
          //this.defaultSupplier = this.suppliers[0];
          //this.supplierId = this.defaultSupplier.SupplierId;
        }
        else {
          this.suppliers = [];
          this.filteredSuppliers = [];
          this.isExisted = false;
          this.showLeftPanelLoadingIcon = false;
          //this.spinner.hide();
          this.resetFormControls();
          this.defaultSupplier = new Supplier();
          this.defaultSupplier.WorkFlowComments = [];
        }
      });
    }
    else {
      let displaySupplierGrid: SupplierGridDisplayInput = {
        Search: searchString,
        Skip: this.supplierPagerConfig.RecordsToSkip,
        Take: this.supplierPagerConfig.RecordsToFetch,
        CompanyId: this.companyId,
        RoleID: this.userDetails.RoleID,
        UserId: this.userDetails.UserID
      };

      let supplierResult = <Observable<SupplierGrid>>this.supplierApiService.GetAllSearchSuppliers(displaySupplierGrid);
      supplierResult.subscribe((data) => {
        if (data.Suppliers.length > 0) {
          this.suppliers = data.Suppliers;
          this.filteredSuppliers = this.suppliers
          this.showLeftPanelLoadingIcon = false;
          //this.spinner.hide();
          this.supplierPagerConfig.TotalRecords = data.TotalRecords;

          //this.onRecordSelected(this.suppliers[0].SupplierId);
          
          //this.defaultSupplier = this.suppliers[0];
          //this.supplierId = this.defaultSupplier.SupplierId;
        }
        else {
          this.suppliers = [];
          this.filteredSuppliers = [];
          this.isExisted = false;
          this.showLeftPanelLoadingIcon = false;
          //this.spinner.hide();
          this.resetFormControls();
          this.defaultSupplier = new Supplier();
          this.defaultSupplier.WorkFlowComments = [];
        }
      });
    }
  }

  getserviceCategroies(): void {
    let serviceCategoriesResult = <Observable<Array<any>>>this.sharedServiceObj.getServiceCategroies();
    serviceCategoriesResult.subscribe((data) => {
      this.serviceCategroies = data;
    });
  }

  getsupplierServices(): void {
    let supplierServicesResult = <Observable<Array<any>>>this.supplierApiService.getSupplierServices();
    supplierServicesResult.subscribe((data) => {
      this.supplierServices = data;
    });
  }

  getWorkFlowStatuses(): void {
    this.sharedServiceObj.getWorkFlowStatus(WorkFlowProcess.Supplier).subscribe((data: Array<WorkFlowStatusModel>) => {
      this.workFlowStatuses = data;
      this.workFlowStatusesSupplierApproval = data.filter(data => data.WorkFlowStatusid != WorkFlowStatus.Draft && data.WorkFlowStatusid != WorkFlowStatus.Rejected && data.WorkFlowStatusid != WorkFlowStatus.Approved);
    });
  }


  // checkIsSupplierVerifier(): void {
  //   this.sharedServiceObj.checkIsSupplierVerifier(this.userDetails.UserID, this.companyId)
  //     .subscribe((data: boolean) => {
  //       this.isSupplierVerifier = data;
  //     });
  // }

  getCountries(): void {
    let countriesResult = <Observable<Array<any>>>this.supplierApiService.getCountries();
    countriesResult.subscribe((data) => {
      this.countries = data;
    });
  }
  getGSTStaus(): void {
    let gstResult = <Observable<Array<any>>>this.supplierApiService.getGSTStatus();
    gstResult.subscribe((data) => {
      this.gststatus = data;
    });
  }

  getCurrenceis(): void {
    let currenciesResult = <Observable<Array<any>>>this.supplierApiService.getCurrencies();
    currenciesResult.subscribe((data) => {
      this.currencies = data;
    });
  }

  getTaxGroups(): void {
    let taxGroupResult = <Observable<Array<any>>>this.sharedServiceObj.getTaxGroupList();
    taxGroupResult.subscribe((data) => {
      this.taxGroups = data;
    });
  }

  getTaxClasses(taxGroupId: number): void {
    this.taxClasses = [];
    let taxGroupsResult = <Observable<Array<any>>>this.sharedServiceObj.getTaxClasses(taxGroupId);
    taxGroupsResult.subscribe((data: Array<Taxes>) => {
      if (data != null && data.length > 0) {
        this.isTaxGroupSelected = true;
        if (this.isExistingSupplier) {
          this.suppliersInfoForm.get('SupplierCompanyDetails').get('TaxClass').setValue(this.defaultSupplier.SupplierCompanyDetails.TaxClass);
        }

        this.taxClasses = data;
      }
      else {
        this.isTaxGroupSelected = false;
      }
    });
  }

  getpaymentTerms(): void {
    let paymentTermsResult = <Observable<Array<any>>>this.sharedServiceObj.getPaymentTerms(this.sessionService.getCompanyId());
    paymentTermsResult.subscribe((data) => {
      this.paymentTerms = data;
      if (!this.isNewRecord) {
        this.suppliersInfoForm.get('SupplierCompanyDetails').get('PaymentTermsId').setValue(this.defaultSupplier.SupplierCompanyDetails.PaymentTermsId);
      }
    });
  }

  onCountryChange(event?: any) {
    let countryDetails: Countries;
    if (event != null && event != undefined) {
      countryDetails = event.item;
    }

    this.suppliersInfoForm.patchValue({
      'BillingCountry': countryDetails.Name,
      'Country': countryDetails,
      'BillingCountryId': countryDetails.Id
    });


  }

  onSupplierChange(event?: any) {
    let supplierDetails: Supplier;
    this.showControl = false;
    this.IsSaved = false;
    this.isExistSupplierName = false;
    if (event != null && event != undefined) {
      supplierDetails = event.item;
    }

    this.suppliersInfoForm.patchValue({
      'SupplierName': supplierDetails.SupplierName
    });


    if (supplierDetails != undefined) {
      let selectedSupplier = null;
      let loggedInUserDetails = <UserDetails>this.sessionService.getUser();
      let supplierResult = <Observable<Supplier>>this.supplierApiService.getSupplierById(supplierDetails.SupplierId, supplierDetails.CompanyId, loggedInUserDetails.UserID);
      supplierResult.subscribe((data) => {
        // this.defaultSupplier = data;
        selectedSupplier = data;
        let result = selectedSupplier.SupplierEntities.filter(x => x.CompanyId === this.companyId)[0];
        let isExisted = false;
        if (result != undefined && selectedSupplier.SupplierEntities.length > 1) {
          isExisted = true;
        }

        let selectedCompany = selectedSupplier.SupplierEntities.filter(x => x.CompanyId === selectedSupplier.CompanyId)[0];
        if (selectedSupplier.CompanyId != this.companyId && result === undefined) {

          if ((selectedSupplier.WorkFlowStatusId === WorkFlowStatus.Draft) || (selectedSupplier.WorkFlowStatusId === WorkFlowStatus.WaitingForApproval) || (selectedSupplier.WorkFlowStatusId === WorkFlowStatus.AskedForClarification)) {
            this.confirmationServiceObj.confirm({
              message: Messages.AttachWarningMessage + supplierDetails.WorkFlowStatus + " in company: " + selectedCompany.CompanyName,
              header: "Supplier attachment",
              acceptLabel: "OK",
              rejectVisible: false,
              accept: () => {
                this.selectedSupplierNameInput.nativeElement.value = '';
                this.suppliersInfoForm.patchValue({
                  'SupplierName': ""
                });

                this.supplierFilterInfoForm.reset();
              }
            });
          }
          else {
            this.confirmationServiceObj.confirm({
              message: Messages.CompanyAttachMessage,
              header: "Supplier attachment",
              acceptLabel: "OK",
              rejectLabel: "Cancel",
              rejectVisible: true,
              accept: () => {
                this.clearForm();
                this.showControl = true;
                // this.suppliersInfoForm.get('SupplierTypeID').disable();
                //this.defaultSupplier.SupplierId = 0;
                this.isExistingSupplier = true;
                this.isNewRecord = true;
                this.hideSupcode = false;
                this.isOtherCompanySupplier = true;
                //selectedSupplier.TaxClass = null;
                //selectedSupplier.PaymentTermsId = null;
                selectedSupplier.SupplierServices = [];
                //selectedSupplier.WorkFlowStatus = "Draft";
                //selectedSupplier.WorkFlowStatusId = WorkFlowStatus.Draft;
                let supplierCompanyDetails = selectedSupplier.SupplierCompanyDetails;
                selectedSupplier.SupplierCompanyDetails = new SupplierCompanyDetails();
                selectedSupplier.SupplierCompanyDetails.SupplierCompanyId = 0;
                selectedSupplier.SupplierCompanyDetails.SupplierId = supplierCompanyDetails.SupplierId;
                selectedSupplier.SupplierCompanyDetails.CompanyId = this.companyId;

                selectedSupplier.SupplierApproval = new SupplierApproval();
                selectedSupplier.SupplierApproval.SupplierApprovalId = 0;
                selectedSupplier.SupplierApproval.CompanyId = this.companyId
                selectedSupplier.SupplierApproval.SupplierId = supplierCompanyDetails.SupplierId;
                selectedSupplier.SupplierApproval.WorkFlowStatusId = WorkFlowStatus.Draft;
                selectedSupplier.ContactPersons = [];
                selectedSupplier.SubCodes = [];

                if (selectedSupplier.IsSubCodeRequired) {
                  selectedSupplier.IsSubCodeRequired = 1;
                }
                else {
                  selectedSupplier.IsSubCodeRequired = 0;
                }

                // this.defaultSupplier.ContactPersons.forEach(i => {
                //   i.ContactPersonId = 0;
                // });

                if (selectedSupplier.ContactPersons != undefined) {
                  this.addGridItem(selectedSupplier.ContactPersons.length);
                }

                this.rowsToAdd = 1;
                this.addSubCodeGridItem(this.rowsToAdd);

                let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
                for (let i = 0; i < subCodesControl.length; i++) {
                  subCodesControl.controls[i].get('SubCodeDescription').setValue("General");
                  subCodesControl.controls[i].get('SubCode').setValue("00");
                  subCodesControl.controls[i].get('AccountSetId').setValue("");
                }

                // if (selectedSupplier.SubCodes != undefined) {
                //   this.addSubCodeGridItem(selectedSupplier.SubCodes.length);
                // }

                this.suppliersInfoForm.patchValue(selectedSupplier);
                this.suppliersInfoForm.get('LocationId').setValue(null);
                this.defaultSupplier = selectedSupplier;

                this.enableGSTNumber(this.defaultSupplier.GSTStatusId);

                this.suppliersInfoForm.get("CoSupplierCode").setValidators(null);
                this.suppliersInfoForm.get("CoSupplierCode").setErrors(null);
                this.suppliersInfoForm.get("IsAttached").setValue(true);
                this.IsAttachedPendingApproval = true;
                this.sendForApproveButtonText = 'Send for approval';
              },
              reject: () => {
                this.selectedSupplierNameInput.nativeElement.value = '';
                this.suppliersInfoForm.patchValue({
                  'SupplierName': ""
                });
                this.resetFormControls();
              },
            });
          }

        }
        else {
          if (isExisted) {
            if (selectedSupplier.CompanyId != this.companyId) {

              this.confirmationServiceObj.confirm({
                message: Messages.AttachMessage,
                header: "Supplier attachment",
                acceptLabel: "OK",
                rejectVisible: false,
                accept: () => {
                  this.defaultSupplier = data;
                  this.populateData();
                  this.setData();
                }
              });
            }
            else {
              this.defaultSupplier = data;
              this.populateData();
              this.setData();
            }
          }
          else {
            this.defaultSupplier = data;
            this.populateData();
            this.setData();
          }
        }
      });
    }
  }
  resetFormControls() {
    this.suppliersInfoForm.reset();
    this.suppliersInfoForm.get("SupplierId").setValue(0);
    this.suppliersInfoForm.get("IsAttached").setValue(false);
    this.IsAttachedPendingApproval = false;
    this.suppliersInfoForm.get("SupplierApproval").get('WorkFlowStatusId').setValue(WorkFlowStatus.Draft);
  }

  setData() {
    this.hideText = false;
    this.hideInput = true;
    this.formError = "";
    this.message = "";
    this.hideSupcode = false;
    this.isExistingSupplier = true;
    this.isOtherCompanySupplier = false;
    if (this.isSupplierVerifier && this.defaultSupplier.WorkFlowStatusId === WorkFlowStatus.Approved) {
      this.isSaveEnabled = true;
    }
    else {
      this.isSaveEnabled = false;
    }

    if (this.defaultSupplier.WorkFlowStatusId === WorkFlowStatus.Approved || this.defaultSupplier.WorkFlowStatusId === WorkFlowStatus.WaitingForApproval || this.defaultSupplier.WorkFlowStatusId === WorkFlowStatus.AskedForClarification) {
      this.isDisplayMode = true;
      this.isSaveEnabled = true;
      this.suppliersInfoForm.disable();
      setTimeout(function () {
        $(".multiselect").append("<div class='disablediv'> </div>")
      }, 500);
      this.isSupplierAttached = false;

    }
    else {
      this.isDisplayMode = false;
      this.isSaveEnabled = false;
      this.suppliersInfoForm.enable();
      $(".multiselect").remove();
      this.isSupplierAttached = true;
    }

    this.showControl = true;
    if (this.defaultSupplier.IsSubCodeRequired) {
      this.defaultSupplier.IsSubCodeRequired = 1;
    }
    else {
      this.defaultSupplier.IsSubCodeRequired = 0;
    }

  }

  clearForm() {
    this.resetFormControls();
    this.suppliersInfoForm.setErrors(null);
    let contactPersons = <FormArray>this.suppliersInfoForm.controls['ContactPersons'];
    contactPersons.controls = [];
    contactPersons.controls.length = 0;

    let subCodes = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    subCodes.controls = [];
    subCodes.controls.length = 0;

    let supplierEntities = <FormArray>this.suppliersInfoForm.controls['SupplierEntities'];
    supplierEntities.controls = [];
    supplierEntities.controls.length = 0;

    this.suppliersInfoForm.get("SupplierServices").setValue([]);
  }

  enableGSTNumber(GSTStatus: number): void {
    if (GSTStatus == 1) {

      this.suppliersInfoForm.get('GSTNumber').enable();
    }
    else {
      this.suppliersInfoForm.get('GSTNumber').disable();
      this.suppliersInfoForm.get('GSTNumber').setValue('');
    }
  }

  validateControl(control: FormControl) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  closewindow(): void {
    this.savedsucess = false;
  }

  initGridRows() {
    return this.fb.group({
      'ContactPersonId': [0],
      'Saluation': ["", [Validators.required, Validators.maxLength(150)]],
      'Surname': ["", [Validators.required, Validators.maxLength(150)]],
      'Name': ["", [Validators.required, Validators.maxLength(150)]],
      'ContactNumber': ['', { validators: [Validators.pattern(NUMBER_PATERN), Validators.required] }],
      'Department': ["", [Validators.required, Validators.maxLength(150)]],
      'EmailId': ["", [Validators.maxLength(100), Validators.required, Validators.pattern(EMAIL_PATTERN)]]
    });
  }

  initSubCodesGridRows() {
    return this.fb.group({
      'SubCodeId': [0],
      'SubCodeDescription': ["", [Validators.required]],
      //'SubCodeDescription':[{ value:"",disabled:true }],
      'SubCode': ["", [Validators.required]],
      'SupplierId': [0],
      // 'AccountSetId': ["", [Validators.required, Validators.maxLength(150)]]
      // 'AccountSetId': ['', { validators: [Validators.required, this.noWhitespaceValidator] }],
      'AccountSetId': [''],
    });
  }

  initSupplierEntitiesGridRows() {
    return this.fb.group({
      'SupplierCompanyId': [0],
      'CompanyName': [""],
      'CompanyId': [0],
      'Address1': [""],
      'Telephone': [""],
      'Email': [''],
      'IsDetached': [false]
    });
  }

  //adding row to the grid..
  addGridItem(noOfLines: number) {
    //this.showGridErrorMessage = false;
    let contactGroupControl = <FormArray>this.suppliersInfoForm.controls['ContactPersons'];
    for (let i = 0; i < noOfLines; i++) {
      contactGroupControl.push(this.initGridRows());
    }
  }

  //adding row to the sub codes grid..
  addSubCodeGridItem(noOfLines: number) {
    let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    for (let i = 0; i < noOfLines; i++) {
      subCodesControl.push(this.initSubCodesGridRows());
      if (!this.isNewRecord) {
        if (subCodesControl != null) {
          subCodesControl.controls[i].get('SubCodeDescription').setValue("General");
          subCodesControl.controls[i].get('SubCode').setValue("00");
          subCodesControl.controls[i].get('AccountSetId').setValue("");
        }
      }
    }
  }

  //adding row to the supplier entities grid..
  addSupplierEntitiesGridItem(noOfLines: number) {
    let supplierEntitiesControl = <FormArray>this.suppliersInfoForm.controls['SupplierEntities'];
    for (let i = 0; i < noOfLines; i++) {
      supplierEntitiesControl.push(this.initSupplierEntitiesGridRows());
    }
  }

  removeGridItem(rowIndex: number) {
    let contactGroupControl = <FormArray>this.suppliersInfoForm.controls['ContactPersons'];
    let contactPersonId = contactGroupControl.controls[rowIndex].get('ContactPersonId').value;
    if (contactPersonId > 0) {
      this.deletedContactsList.push(contactPersonId);
    }
    contactGroupControl.removeAt(rowIndex);
  }

  editData() {
    this.hideText = false;
    this.hideInput = true;
    this.formError = "";
    this.message = "";
    if (this.isSupplierVerifier && this.defaultSupplier.SupplierApproval.WorkFlowStatusId == 4) {
      this.IsSaved = true;
    }
    this.hideSupcode = false;
    this.isDisplayMode = false;
    this.isExistingSupplier = true;
    this.isOtherCompanySupplier = false;
    this.isNewRecord = true;
    // this.suppliersInfoForm.get('SupplierTypeID').disable();
    this.getpaymentTerms();
    if (this.isSupplierVerifier && this.defaultSupplier.WorkFlowStatusId === WorkFlowStatus.Approved) {
      this.isSaveEnabled = true;
    }
    else {
      this.isSaveEnabled = false;
    }

    // if (this.isSupplierVerifier) {
    //   this.isSaveEnabled = true;
    //   this.isEditMode = true;
    // }
    // else {
    //   this.isSaveEnabled = false;
    //   this.isEditMode = false;
    // }

    this.showControl = true;
    //resetting the supplier form.
    this.suppliersInfoForm.enable();
    $(".multiselect").remove();
    this.populateData();

  }

  populateData() {
    this.resetFormControls();
    // this.suppliersInfoForm.get('SupplierTypeID').disable();
    this.suppliersInfoForm.get('ContactPersons').reset();
    this.suppliersInfoForm.get('SubCodes').reset();
    this.suppliersInfoForm.get('SupplierEntities').reset();
    this.suppliersInfoForm.setErrors(null);
    let itemGroupControl = <FormArray>this.suppliersInfoForm.controls['ContactPersons'];
    itemGroupControl.controls = [];
    itemGroupControl.controls.length = 0;

    let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    subCodesControl.controls = [];
    subCodesControl.controls.length = 0;
    this.linesToAdd = 1;
    this.rowsToAdd = 1;

    let supplierEntitiesControl = <FormArray>this.suppliersInfoForm.controls['SupplierEntities'];
    supplierEntitiesControl.controls = [];
    supplierEntitiesControl.controls.length = 0;

    //this.getTaxGroups(this.defaultSupplier.TaxClass);
    if (this.defaultSupplier.SupplierCompanyDetails.TaxId != null) {
      this.getTaxClasses(this.defaultSupplier.SupplierCompanyDetails.TaxId);
    }
    this.enableGSTNumber(this.defaultSupplier.GSTStatusId);
    if (this.defaultSupplier.ContactPersons == null) {
      this.defaultSupplier.ContactPersons = [];
    }

    if (this.defaultSupplier.SubCodes == null) {
      this.defaultSupplier.SubCodes = [];
    }
    this.addGridItem(this.defaultSupplier.ContactPersons.length);
    this.addSubCodeGridItem(this.defaultSupplier.SubCodes.length);
    this.addSupplierEntitiesGridItem(this.defaultSupplier.SupplierEntities.length);
    if (this.supplierId > 0) {
      this.suppliersInfoForm.patchValue(this.defaultSupplier);
    }

    this.suppliersInfoForm.get("CoSupplierCode").setValidators(null);
    this.suppliersInfoForm.get("CoSupplierCode").setErrors(null);
    if (this.defaultSupplier.SupplierCompanyDetails.ReviewedDate != null) {
      this.suppliersInfoForm.get('SupplierCompanyDetails').get('ReviewedDate').setValue(new Date(this.defaultSupplier.SupplierCompanyDetails.ReviewedDate));
    }
    this.IsAttachedPendingApproval = (this.defaultSupplier.WorkFlowStatusId != WorkFlowStatus.Approved && this.defaultSupplier.SupplierEntities.length > 1) ? true : false;
  }

  ClickNewSupplier(e)
  {
    this.router.navigate([`/po/suppliers/${this.requestType}/0`]);
  }
  addData(e) {

    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 550) {
      $(".leftdiv").addClass("hideleftcol");
      $(".rightPanel").addClass("showrightcol");
    }


    // this.getWorkFlowConfiguration();
    this.hideText = false;
    this.hideInput = true;
    this.formError = "";
    this.message = "";
    this.isNewRecord = false;
    this.showControl = true;
    this.isDisplayMode = false;
    this.isSaveEnabled = false;
    this.isExistingSupplier = false;
    this.isOtherCompanySupplier = false;
    this.linesToAdd = 1;
    this.rowsToAdd = 1;
    this.hideSupcode = false; //modified
    this.resetFormControls();
    this.clearForm();
    this.isSupplierAttached = false;
    this.suppliersInfoForm.enable();
    $(".multiselect").remove();
    this.isSupplierAttached = true;
    this.taxClasses = [];
    this.isTaxGroupSelected = false;
    if (this.isSupplierVerifier) {
      this.isEditMode = true;
    }
    else {
      this.isEditMode = false;
    }

    // let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];  
    // if (subCodesControl != null) {
    //   for (let i = 0; i < subCodesControl.length; i++) {
    //     subCodesControl.controls[i].get('SubCodeDescription').setValue("General");
    //     subCodesControl.controls[i].get('SubCode').setValue("00");
    //     subCodesControl.controls[i].get('AccountSetId').setValue("");
    //   }
    // }
    //this.addGridItem(this.linesToAdd);
    this.defaultSupplier = new Supplier();
    this.defaultSupplier.SupplierCompanyDetails = new SupplierCompanyDetails();
    this.defaultSupplier.SupplierApproval = new SupplierApproval();
    this.uploadedFiles.length = 0;
    this.uploadedFiles = [];
    this.suppliersInfoForm.patchValue({
      //PaymentTermsId: this.paymentTerms[0].PaymentTermsId,
      SupplierId: 0,
      IsDeleted: false,
      IsGSTSupplier: false,
      SupplierTypeID: this.supplierCategoryType[1], //modified
      IsSubCodeRequired: this.isSubCodeRequired[0],
      CurrencyId: DEFAULT_CURRENCY_ID
    });

    this.suppliersInfoForm.get('SupplierCompanyDetails').get('SupplierCompanyId').setValue(0);
    this.suppliersInfoForm.get('SupplierCompanyDetails').get('SupplierId').setValue(0);
    this.suppliersInfoForm.get('SupplierCompanyDetails').get('CompanyId').setValue(this.companyId);
    //this.suppliersInfoForm.get('SupplierCompanyDetails').get('ReviewedDate').setValue(new Date());

    this.suppliersInfoForm.get('SupplierApproval').get('SupplierApprovalId').setValue(0);
    this.suppliersInfoForm.get('SupplierApproval').get('SupplierId').setValue(0);
    this.suppliersInfoForm.get('SupplierApproval').get('CompanyId').setValue(this.companyId);

    this.suppliersInfoForm.get('IsSubCodeRequired').setValue(0);
    this.showCodeErrorMessage = false;
    this.showCodeCountErrorMessage = false;


    // this.suppliersInfoForm.get('CoSupplierCode').setValidators([Validators.required]); //modified
    //this.suppliersInfoForm.get('CoSupplierCode').updateValueAndValidity(); //modified

    this.addSubCodeGridItem(this.rowsToAdd);
    this.showfilters =false;
    this.showfilterstext="Show List" ;

  }
  getWorkFlowConfiguration() {
    this.processId = 13;
    let workFlowResult = <Observable<any>>this.workFlowApiService.getWorkFlowConfiguationId(this.processId, this.companyId, this.locationId);
    workFlowResult.subscribe((data) => {
      if (data != null) {
        if (data.WorkFlowProcess.length == 0) {

          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.WorkflowValidationMessage + this.companyName,
            MessageType: MessageTypes.Error

          });
          this.isSaveEnabled = true;
        }
        else {
          this.isSaveEnabled = false;

        }

      }
      else {
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.WorkflowValidationMessage + this.companyName,
          MessageType: MessageTypes.Error

        });
        this.isSaveEnabled = true;
      }
    });
  }



  supplierTypeInternalChange() {

    this.hideSupcode = true;
    this.suppliersInfoForm.get("CoSupplierCode").setValue("");
    this.showCodeErrorMessage = false;
    this.suppliersInfoForm.get("CoSupplierCode").setValidators([Validators.maxLength(4), Validators.required, Validators.pattern(NUMBER_PATERN)]);
    this.suppliersInfoForm.get("CoSupplierCode").markAsTouched();
  }

  supplierTypeExternalChange() {
    this.hideSupcode = false;
    this.showCodeCountErrorMessage = false;
    this.suppliersInfoForm.get("CoSupplierCode").setValue(null);
    this.suppliersInfoForm.get("CoSupplierCode").setValidators(null);
    this.suppliersInfoForm.get("CoSupplierCode").setErrors(null);
    this.suppliersInfoForm.get("CoSupplierCode").markAsUntouched();

  }

  supplierCodeChange() {
    var code: number = this.suppliersInfoForm.get("CoSupplierCode").value.length;
    if (code >= 4) {
      this.showCodeCountErrorMessage = false;
    }
    else {
      this.showCodeCountErrorMessage = true;
      this.showCodeErrorMessage = false;

    }
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
  showLeftCol(event) {
    $(".leftdiv").removeClass("hideleftcol");
    $(".rightPanel").removeClass("showrightcol");
  }
  cancelData() {
    this.router.navigate([`/po/supplierslist/${this.requestType}`]);
    // this.hideText = true;
    // this.hideInput = false;
    // this.formError = "";
    // this.message = "";
    // this.showControl = false;
    // this.isExistingSupplier = false;
    // this.isNewRecord = false;
    // this.isDisplayMode = true;
    // this.isSaveEnabled = true;
    // this.formSubmitAttempt = false;
    // this.isOtherCompanySupplier = false;
    // this.isApprovedClicked = false;
    // this.uploadedFiles.length = 0;
    // this.uploadedFiles = [];
    // this.filteredSuppliers = [];
    // this.errorMessage = "";
    // this.isReApproval = false;
    // this.isDuplicate = false;
    // this.hideSupcode = true;
    // this.isTaxGroupSelected = false;
    // this.enableGSTNumber(1);
    // this.taxClasses = [];
    // this.isSupplierAttached = true;
    // this.isEditMode = true;
    // this.isExistSupplierName = false;
    // this.IsSaved = false;
    // this.suppliersInfoForm.enable();
    // $(".multiselect").remove();
    // if (this.activatedRoute.snapshot.params.type == "approval") {
    //   if (this.routeSupplierId > 0) {
    //     //this.GetAllSearchSuppliers(supplierId.toString());
    //     this.getSupplierApprovals(this.routeSupplierId, this.routeCompanyId);
    //   }
    //   else {
    //     this.getSupplierApprovals(0, this.companyId);
    //   }
    // }
    // else {
    //   this.getSuppliers();
    // }
  }

  onClickedOutside(e: Event) {
   // this.showfilters= false; 
    if(this.showfilters == false){ 
     // this.showfilterstext="Show List"
  }
  }


  split() {

    this.showfilters = !this.showfilters;
    if (this.showfilters == true) {
      this.showfilterstext = "Hide List"
    }
    else {
      this.showfilterstext = "Show List"
    }

  }

  onItemSelect(item: any) {
    this.message = "";
  }

  onSelectAll(items: any) {
  }

  onChecked(checked) {
    if (checked) {
      this.suppliersInfoForm.get('ShippingAddress1').setValue(this.suppliersInfoForm.get('BillingAddress1').value);
      this.suppliersInfoForm.get('ShippingAddress2').setValue(this.suppliersInfoForm.get('BillingAddress2').value);
      this.suppliersInfoForm.get('ShippingCity').setValue(this.suppliersInfoForm.get('BillingCity').value);
      this.suppliersInfoForm.get('ShippingCountryId').setValue(this.suppliersInfoForm.get('BillingCountryId').value);
      this.suppliersInfoForm.get('ShippingZipcode').setValue(this.suppliersInfoForm.get('BillingZipcode').value);
      this.suppliersInfoForm.get('ShippingTelephone').setValue(this.suppliersInfoForm.get('BillingTelephone').value);
      this.suppliersInfoForm.get('ShippingMobile').setValue(this.suppliersInfoForm.get('BillingAddress3').value);
      this.suppliersInfoForm.get('ShippingFax').setValue(this.suppliersInfoForm.get('BillingFax').value);
    } else {
      this.suppliersInfoForm.get('ShippingAddress1').setValue("");
      this.suppliersInfoForm.get('ShippingAddress2').setValue("");
      this.suppliersInfoForm.get('ShippingCity').setValue("");
      this.suppliersInfoForm.get('ShippingCountryId').setValue("");
      this.suppliersInfoForm.get('ShippingZipcode').setValue("");
      this.suppliersInfoForm.get('ShippingTelephone').setValue("");
      this.suppliersInfoForm.get('ShippingMobile').setValue("");
      this.suppliersInfoForm.get('ShippingFax').setValue("");
    }
  }
  addRecord()
  {
    this.router.navigate([`/po/suppliers/${this.requestType}/${0}`]);
  }

  onRecordSelected(supplierId: number) 
  {
    //alert("Supplier Id : " + supplierId);
    this.router.navigate([`/po/suppliers/${this.requestType}/${supplierId}`]);
    // this.split();
    // this.oldCreditLimit = null;
    // this.hideText = true;
    // this.hideInput = false;
    // this.isDisplayMode = true;
    // this.isSaveEnabled = true;
    // this.showControl = false;
    // this.disableApprove = false;
    // //this.isTaxGroupSelected = false;
    // this.isSupplierAttached = true;
    // let loggedInUserDetails = <UserDetails>this.sessionService.getUser();
    // this.uploadedFiles = [];
    // this.uploadedFiles.length = 0;
    // let supplierResult = <Observable<Supplier>>this.supplierApiService.getSupplierById(supplierId, this.companyId, loggedInUserDetails.UserID);
    // supplierResult.subscribe((data) => {
    //   if (data != null) {
    //     this.defaultSupplier = new Supplier();
    //     this.defaultSupplier = data;
    //     this.sendForApproveButtonText = (data.WorkFlowStatusId == WorkFlowStatus.Approved) ? "Submit" : "Send for approval";
    //     this.IsAttachedPendingApproval = (data.WorkFlowStatusId != WorkFlowStatus.Approved && data.SupplierEntities.length > 1) ? true : false;
    //     this.isApproverUser = (data.CurrentApproverUserId == this.userDetails.UserID) ? true : false;
    //     this.ExportSupplierId = data.SupplierApproval.SupplierId;
    //     this.oldCreditLimit = this.defaultSupplier.SupplierCompanyDetails.CreditLimit;
    //     this.oldSupplier = data;
    //     if (this.defaultSupplier.IsSubCodeRequired) {
    //       this.defaultSupplier.IsSubCodeRequired = 1;
    //     }
    //     else {
    //       this.defaultSupplier.IsSubCodeRequired = 0;
    //     }

    //     if (this.defaultSupplier.ParentSupplierId != null && this.defaultSupplier.IsActive === false) {
    //       this.isReApproval = true;
    //     }
    //     else {
    //       this.isReApproval = false;
    //     }

    //     this.isExisted = true;
    //     this.isNewRecord = true;
    //     this.isEditMode = true;
    //     this.suppliersInfoForm.patchValue(this.defaultSupplier);
    //     this.supplierId = this.defaultSupplier.SupplierId;
    //     if (this.defaultSupplier.SupplierCompanyDetails.ReviewedDate != null) {
    //       this.suppliersInfoForm.get('SupplierCompanyDetails').get('ReviewedDate').setValue(new Date(this.defaultSupplier.SupplierCompanyDetails.ReviewedDate));
    //     }
    //     if (this.defaultSupplier.LocationId > 0 && this.defaultSupplier.LocationId != undefined) {
    //       let checkverifystatus = <Observable<boolean>>this.supplierApiService.CheckVerifystatus(this.companyId, this.userDetails.UserID, this.defaultSupplier.LocationId);
    //       checkverifystatus.subscribe((data) => {
    //         if (data == true) {
    //           this.isVerifyButton = true;
    //         }
    //         else {
    //           this.isVerifyButton = false;
    //         }
    //       });
    //     }
    //   }
    //   this.suppliersInfoForm.get("IsAttached").setValue(false);
    //   this.IsAttachedPendingApproval = false;
    // });


  }

  filterData() {
    let supplierName = "";
    let supplierCategoryId = 0;
    let supplierCity = "";
    this.filterMessage = "";
    let workFlowStatusId = 0;

    let supplierFilterData: SupplierFilterModel = this.supplierFilterInfoForm.value;
    supplierFilterData.SupplierCategoryID = 0;

    // if (this.supplierFilterInfoForm.get('SupplierName').value != "" && this.supplierFilterInfoForm.get('SupplierName').value != null) {
    //   supplierName = this.supplierFilterInfoForm.get('SupplierName').value;
    // }
    if (this.supplierFilterInfoForm.get('SupplierName').value != null) {
      supplierName = this.supplierFilterInfoForm.get('SupplierName').value.SupplierName;
      supplierFilterData.SupplierName = supplierName;
    }

    if (this.supplierFilterInfoForm.get('SupplierCategory').value != "" && this.supplierFilterInfoForm.get('SupplierCategory').value != null) {
      supplierCategoryId = this.supplierFilterInfoForm.get('SupplierCategory').value.SupplierCategoryID;
      supplierFilterData.SupplierCategoryID = supplierCategoryId;
    }

    if (this.supplierFilterInfoForm.get('SupplierCity').value != "" && this.supplierFilterInfoForm.get('SupplierCity').value != null) {
      supplierCity = this.supplierFilterInfoForm.get('SupplierCity').value;
    }

    if (this.supplierFilterInfoForm.get('WorkFlowStatusId').value != "") {
      workFlowStatusId = Number(this.supplierFilterInfoForm.get('WorkFlowStatusId').value);
    }
    // this.resetPagerConfig();
    if (supplierName === "" && supplierCategoryId === 0 && supplierCity === "" && workFlowStatusId === 0) {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }

      return;
    }
    else {
      this.getAllFilteredSuppliers(supplierFilterData);
    }

  }

  //to get list of purchase orders..
  getAllFilteredSuppliers(supplierFilterData?: SupplierFilterModel) {
    let supplierDisplayInput = {
      Skip: this.supplierPagerConfig.RecordsToSkip,
      Take: this.supplierPagerConfig.RecordsToFetch,
      RoleID: this.userDetails.RoleID,
      UserId: this.userDetails.UserID,
      CompanyId: this.companyId,
      SupplierCity: (supplierFilterData === undefined || supplierFilterData === null || supplierFilterData.SupplierCity === null) ? "" : supplierFilterData.SupplierCity,
      SupplierName: (supplierFilterData === undefined || supplierFilterData === null || supplierFilterData.SupplierName === null || supplierFilterData.SupplierName === undefined) ? "" : supplierFilterData.SupplierName,
      WorkFlowStatusId: (supplierFilterData === undefined || supplierFilterData === null || supplierFilterData.SupplierCategoryID === undefined || supplierFilterData.SupplierCategoryID === null) ? 0 : supplierFilterData.WorkFlowStatusId,
      SupplierCategoryID: (supplierFilterData === undefined || supplierFilterData === null) ? 0 : supplierFilterData.SupplierCategoryID
    };

    this.showLeftPanelLoadingIcon = true;
    let supplierResult = <Observable<SupplierGrid>>this.supplierApiService.getAllSearchSuppliers(supplierDisplayInput);
    supplierResult.subscribe((data) => {
      this.showLeftPanelLoadingIcon = false;
      this.filteredSuppliers = data.Suppliers;
      this.supplierPagerConfig.TotalRecords = data.TotalRecords;
      if (this.filteredSuppliers.length > 0) {
        this.isExisted = true;
        this.defaultSupplier = this.filteredSuppliers[0];
        this.supplierId = this.defaultSupplier.SupplierId;
        this.isFilterApplied = true;
        //this.onRecordSelected(this.supplierId);
        
        if (open) {
          this.initDone = false;
        }

      }
      else {
        this.filterMessage = "No matching records are found";
        this.filteredSuppliers = [];
        this.isExisted = false;
        this.supplierPagerConfig.TotalRecords = this.filteredSuppliers.length;
      }
    },
      (error) => {
        this.showLeftPanelLoadingIcon = false;
      });

  }
  resetPagerConfig() {
    this.supplierPagerConfig.RecordsToSkip = 0;
    this.supplierPagerConfig.RecordsToFetch = 25;
    this.currentPage = 1;
  }

  resetFilters() {
    this.supplierFilterInfoForm.reset();
    this.supplierFilterInfoForm.get('WorkFlowStatusId').setValue(0);
    this.filterMessage = "";
    if (this.activatedRoute.snapshot.params.type == "request") {
      this.getSuppliers();
    }
    else {
      this.getSupplierApprovals(0, this.companyId);
    }
    this.resetPagerConfig();
    this.isFilterApplied = false;
    if (this.supplierNameInput != undefined) {
      this.supplierNameInput.nativeElement.focus();
      this.renderer.invokeElementMethod(this.supplierNameInput.nativeElement, 'focus'); // NEW VERSION
    }
  }

  onChange(event: any) {
    if (event.target.value != "") {
      this.isSearchApplied = true;
      this.GetAllSearchSuppliers(event.target.value);
    }
    else {
      this.isSearchApplied = false;
      if (this.activatedRoute.snapshot.params.type == "approval") {
        this.getSupplierApprovals(0, this.companyId);
      }
      else {
        this.getSuppliers();
      }
    }
  }

  openDialog() {
    this.initDone = true;
    let serviceCategoriesResult = <Observable<Array<any>>>this.sharedServiceObj.getServiceCategroies();
    serviceCategoriesResult.subscribe((data) => {
      this.searchCategroies = data;
      this.supplierNameInput.nativeElement.focus();
      this.renderer.invokeElementMethod(this.supplierNameInput.nativeElement, 'focus'); // NEW VERSION
    });
  }

  resetData() {
    this.isFilterApplied = false;
    this.initDone = true;
    this.message = "";
    this.resetFilters();
  }

  fullScreen() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth > 1000) {
      FullScreen(this.rightPanelRef.nativeElement);
    }
  }

  isSubCodeChange(event) {
    let isSubCodeReuqired = event;
    let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    subCodesControl.controls = [];
    subCodesControl.controls.length = 0;

    if (isSubCodeReuqired === 0) {
      let defaultSubCode: SupplierSubCode = this.suppliersInfoForm.value.SubCodes.filter(x => x.SubCodeDescription.toLowerCase().indexOf("general") !== -1)[0];
      this.rowsToAdd = 1;
      this.addSubCodeGridItem(this.rowsToAdd);
      this.setDefaultData(subCodesControl.length, defaultSubCode);
    }
    else {
      if (this.isExistingSupplier) {
        if (this.isOtherCompanySupplier) {
          let defaultSubCode: SupplierSubCode = this.suppliersInfoForm.value.SubCodes.filter(x => x.SubCodeDescription.toLowerCase().indexOf("general") !== -1)[0];
          this.rowsToAdd = 1;
          this.addSubCodeGridItem(this.rowsToAdd);
          this.setDefaultData(subCodesControl.length, defaultSubCode);
        }
        else {
          let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
          this.addSubCodeGridItem(this.defaultSupplier.SubCodes.length);
          for (let i = 0; i < this.defaultSupplier.SubCodes.length; i++) {
            subCodesControl.controls[i].get('SubCodeId').setValue(this.defaultSupplier.SubCodes[i].SubCodeId);
            subCodesControl.controls[i].get('SupplierId').setValue(this.defaultSupplier.SubCodes[i].SupplierId);
            subCodesControl.controls[i].get('SubCodeDescription').setValue(this.defaultSupplier.SubCodes[i].SubCodeDescription);
            subCodesControl.controls[i].get('SubCode').setValue(this.defaultSupplier.SubCodes[i].SubCode);
            subCodesControl.controls[i].get('AccountSetId').setValue(this.defaultSupplier.SubCodes[i].AccountSetId);
          }
        }
      }
      else {
        let defaultSubCode: SupplierSubCode = this.suppliersInfoForm.value.SubCodes.filter(x => x.SubCodeDescription.toLowerCase().indexOf("general") !== -1)[0];
        this.rowsToAdd = 1;
        this.addSubCodeGridItem(this.rowsToAdd);
        this.setDefaultData(subCodesControl.length, defaultSubCode);
      }
    }
  }

  setDefaultData(length: number, defaultSubCode: SupplierSubCode) {
    let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    for (let i = 0; i < length; i++) {
      subCodesControl.controls[i].get('SubCodeId').setValue(defaultSubCode.SubCodeId);
      subCodesControl.controls[i].get('SupplierId').setValue(defaultSubCode.SupplierId);
      subCodesControl.controls[i].get('SubCodeDescription').setValue(defaultSubCode.SubCodeDescription);
      subCodesControl.controls[i].get('SubCode').setValue(defaultSubCode.SubCode);
      subCodesControl.controls[i].get('AccountSetId').setValue(defaultSubCode.AccountSetId);
    }
  }

  createSupplier(supplier: any, previousWorkFlowStatus: number): void {
    const self = this;

    this.supplierApiService.createSupplier(supplier, this.uploadedFiles).subscribe(
      (response: { Status: string, Value: any }) => {
        if (response.Status == ResponseStatusTypes.Success) {
          this.doApproveOrReject = true;
          this.hideText = true;
          this.hideInput = false;
          this.isDisplayMode = true;
          this.isSaveEnabled = true;
          this.formSubmitAttempt = false;
          this.uploadedFiles.length = 0;
          this.uploadedFiles = [];
          this.filteredSuppliers = [];
          //this.showGridErrorMessage = false;
          this.message = "";
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.SavedSuccessFully,
            MessageType: MessageTypes.Success
          });

          // if (this.filteredSuppliers.length > 0) {

          // }
          // else {

          if (this.isSupplierVerifier && previousWorkFlowStatus === WorkFlowStatus.Approved) {
            //sending for re-approval for next approver of supplier verifier.
            let workFlowDetails: SupplierWorkFlowParameter =
            {
              ProcessId: WorkFlowProcess.Supplier,
              CompanyId: this.companyId,
              LocationId: this.suppliersInfoForm.get("LocationId").value,
              FieldName: "",
              Value: supplier.SupplierCompanyDetails.CreditLimit != null ? supplier.SupplierCompanyDetails.CreditLimit : null,  //0,
              UserID: this.userDetails.UserID,
              RoleID: this.userDetails.RoleID,
              DocumentCode: supplier.SupplierCode,
              DocumentId: response.Value,
              ParentDocumentId: supplier.ParentSupplierId,
              CreatedBy: this.userDetails.UserID,
              CoSupplierCode: this.suppliersInfoForm.get("CoSupplierCode").value,
              WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
              IsCreditLimitChanged: false
            };

            this.sharedServiceObj.supplierVerificationApproval(workFlowDetails)
              .subscribe((data) => {
                this.sharedServiceObj.showMessage({
                  ShowMessage: true,
                  Message: Messages.SentForApproval,
                  MessageType: MessageTypes.Success
                });
                this.showLeftPanelLoadingIcon = false;
                //this.spinner.hide();
                this.getSuppliers();
              });
          }
          else {
            this.showLeftPanelLoadingIcon = false;
            //this.spinner.hide();
            this.getSuppliers();
          }
        }
        else if (response.Status == ResponseStatusTypes.Duplicate) {
          this.showCodeErrorMessage = true;
          this.showLeftPanelLoadingIcon = false;
        }
        else {
          this.showCodeErrorMessage = false;
        }
        //}

      },
      err => {
        this.hideText = false;
        this.hideInput = true;
      }

    );
  }

  updateSupplier(supplier: any): void {
    const self = this;
    // this.suppliersInfoForm.get('SupplierTypeID').enable();
    supplier.supplierTypeId = this.suppliersInfoForm.get('SupplierTypeID').value;
    supplier.ContactPersonsToDelete = this.deletedContactsList;
    this.supplierApiService.updateSupplier(supplier, this.uploadedFiles).subscribe(
      (data: any) => {
        this.doApproveOrReject = true;
        this.hideText = true;
        this.hideInput = false;
        this.isDisplayMode = true;
        this.isSaveEnabled = true;
        this.formSubmitAttempt = false;
        this.uploadedFiles.length = 0;
        this.uploadedFiles = [];
        this.filteredSuppliers = [];
        this.showLeftPanelLoadingIcon = false;
        //this.spinner.hide();
        //this.showGridErrorMessage = false;
        this.message = "";
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.UpdatedSuccessFully,
          MessageType: MessageTypes.Success
        });

        if (this.isSupplierVerifier && supplier.SupplierApproval.WorkFlowStatusId === WorkFlowStatus.WaitingForApproval) {
          if (this.activatedRoute.snapshot.params.type == "approval") {
            if (this.routeSupplierId > 0) {
              //this.GetAllSearchSuppliers(supplierId.toString());
              this.getSupplierApprovals(this.routeSupplierId, this.routeCompanyId);
            }
            else {
              this.getSupplierApprovals(0, this.companyId);
            }
          }

        }
        else {
          this.getSuppliers();
        }
      },
      err => {
        this.hideText = false;
        this.hideInput = true;
      }
    );
  }

  compareNameAndAddress(editedSupplier: Supplier, oldSupplier: Supplier): boolean {
    let isChanged: boolean = false;

    if ((oldSupplier.SupplierName != editedSupplier.SupplierName) || (oldSupplier.BillingAddress1 != editedSupplier.BillingAddress1) || (oldSupplier.BillingAddress2 != editedSupplier.BillingAddress2) ||
      (oldSupplier.BillingAddress3 != editedSupplier.BillingAddress3) || (oldSupplier.BillingCity != editedSupplier.BillingCity) || (oldSupplier.BillingCountryId != editedSupplier.BillingCountryId) ||
      (oldSupplier.BillingFax != editedSupplier.BillingFax) || (oldSupplier.BillingZipcode != editedSupplier.BillingZipcode) || (oldSupplier.BillingTelephone != editedSupplier.BillingTelephone) ||
      (oldSupplier.SupplierEmail != editedSupplier.SupplierEmail) || (oldSupplier.GSTStatusId != editedSupplier.GSTStatusId)) {
      isChanged = true;
    }

    return isChanged;
  }

  saveRecord(action: string) {
    debugger
    this.showLeftPanelLoadingIcon = true;
    let _currentStatus = this.defaultSupplier.SupplierApproval.WorkFlowStatus;
    let isJustCreatedSupplier: boolean = (_currentStatus == "Draft" || _currentStatus == "Cancelled Approval") ? true : false;
    this.setFinanceValidation();
    let status = this.suppliersInfoForm.status;
    let userDetails = <UserDetails>this.sessionService.getUser();
    let companyId = <number>this.sessionService.getCompanyId();
    let workFlowDetails: SupplierWorkFlowParameter =
    {
      ProcessId: WorkFlowProcess.Supplier,
      CompanyId: companyId,
      LocationId: this.suppliersInfoForm.get("LocationId").value,
      FieldName: "",
      Value: this.defaultSupplier.SupplierCompanyDetails.CreditLimit != null ? this.defaultSupplier.SupplierCompanyDetails.CreditLimit : null,   //0,
      UserID: this.userDetails.UserID,
      ParentDocumentId: 0,
      RoleID: this.userDetails.RoleID,
      DocumentCode: this.defaultSupplier.SupplierApproval.WorkFlowStatus === "Draft" ? this.defaultSupplier.DraftCode : this.defaultSupplier.SupplierCode,
      DocumentId: this.defaultSupplier.SupplierId,
      CreatedBy: userDetails.UserID,
      CoSupplierCode: this.suppliersInfoForm.get("CoSupplierCode").value,
      WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
      IsCreditLimitChanged: false
    };

    if (status != "INVALID") {
      let supplierDataforSave = this.suppliersInfoForm.value;
      supplierDataforSave.supplierTypeId = this.suppliersInfoForm.get('SupplierTypeID').value;
      let userDetails = <UserDetails>this.sessionService.getUser();
      supplierDataforSave.CreatedBy = supplierDataforSave.SupplierId == 0 ? userDetails.UserID : this.defaultSupplier.CreatedBy;
      supplierDataforSave.UpdatedBy = userDetails.UserID;
      supplierDataforSave.IsActive = true;
      supplierDataforSave.ParentSupplierId = null;
      this.isReApproval = false;
      this.NeedSupplierReApproval = this.compareNameAndAddress(supplierDataforSave, this.oldSupplier);
      this.IsNameChanged = this.IsSupplierNameChanged(supplierDataforSave, this.oldSupplier);
      if (this.isSupplierVerifier && supplierDataforSave.SupplierApproval.WorkFlowStatusId === WorkFlowStatus.Approved && this.NeedSupplierReApproval) {
        if (this.uploadedFiles.length == 0 && (this.NeedSupplierReApproval)) {
          this.confirmationServiceObj.confirm({
            message: "Please Attach file",
            header: Messages.DeletePopupHeader,
            accept: () => {
            },
            rejectVisible: false,
            acceptLabel: "Ok"
          });
          this.showLeftPanelLoadingIcon = false;
          return false;
        }
        if (this.IsNameChanged) {
          this.isReApproval = true;
          if (supplierDataforSave.SupplierCompanyDetails.CreditLimit == null) {
            supplierDataforSave.SupplierCompanyDetails.CreditLimit = 0;
          }
          this.previousSupplierId = supplierDataforSave.SupplierId;
          supplierDataforSave.ParentSupplierId = supplierDataforSave.SupplierId;
          supplierDataforSave.SupplierId = 0;
          this.previousWorkFlowStatus = supplierDataforSave.SupplierApproval.WorkFlowStatusId;
        }
      }

      if (!this.isOtherCompanySupplier) {
        supplierDataforSave.CompanyId = this.sessionService.getCompanyId();
        supplierDataforSave.SupplierApproval.CompanyId = supplierDataforSave.CompanyId;
        supplierDataforSave.SupplierCompanyDetails.CompanyId = supplierDataforSave.CompanyId;
      }

      if (this.isOtherCompanySupplier) {
        supplierDataforSave.SupplierCompanyDetails.CompanyId = this.sessionService.getCompanyId();
        supplierDataforSave.SupplierApproval.CompanyId = this.sessionService.getCompanyId();
      }

      if (supplierDataforSave.SupplierCompanyDetails.ReviewedDate != null) {
        supplierDataforSave.SupplierCompanyDetails.ReviewedDate = this.reqDateFormatPipe.transform(supplierDataforSave.SupplierCompanyDetails.ReviewedDate);
      }

      supplierDataforSave.SupplierServices.forEach(service => {
        service.CompanyId = this.companyId;
      });

      supplierDataforSave.SubCodes.forEach(subCode => {
        if (!this.isExistingSupplier) {
          subCode.SupplierId = 0;
        }
        else {
          if (subCode.SupplierId === 0) {
            subCode.SupplierId = supplierDataforSave.SupplierId;
          }
        }
        subCode.CompanyId = this.companyId;
      });

      supplierDataforSave.ContactPersons.forEach(i => {
        if (i.ContactPersonId > 0) {
          let previousRecord = this.defaultSupplier.ContactPersons.find(j => j.ContactPersonId == i.ContactPersonId);
          if (
            i.ContactNumber != previousRecord.ContactNumber ||
            i.EmailId != previousRecord.EmailId ||
            i.Name != previousRecord.Name ||
            i.Saluation != previousRecord.Saluation ||
            i.Surname != previousRecord.Surname ||
            i.Department != previousRecord.Department) {
            i.IsModified = true;
          }
        }
        else {
          i.ContactPersonId = 0;
          i.CompanyId = this.companyId;
        }

        if (this.isSupplierVerifier && this.previousWorkFlowStatus === WorkFlowStatus.Approved) {
          i.ContactPersonId = 0;
          i.CompanyId = this.companyId;
        }
      });

      if (!this.isSupplierVerifier) {
        supplierDataforSave.SupplierApproval.WorkFlowStatusId = action == 'save' ? WorkFlowStatus.Draft : WorkFlowStatus.WaitingForApproval;
      }

      if (this.isSupplierVerifier && this.previousWorkFlowStatus === WorkFlowStatus.Approved) {
        this.showLeftPanelLoadingIcon = false;
        this.confirmationServiceObj.confirm({
          message: `Do you want to ${this.sendForApproveButtonText} ?`,
          header: "Confirmation",
          acceptLabel: "Yes",
          rejectLabel: "No",
          rejectVisible: true,
          accept: () => {
            if (this.IsNameChanged) {
              this.RecreateSupplier(supplierDataforSave);
            }
            else {
              supplierDataforSave.ParentSupplierId = this.defaultSupplier.ParentSupplierId;
              supplierDataforSave.Attachments = this.defaultSupplier.Attachments.filter(i => i.IsDelete == true);
              this.updateSupplier(supplierDataforSave);
              //this.onRecordSelected(supplierDataforSave.SupplierId);
            }
            this.uploadedFiles.length = 0;
            this.uploadedFiles = [];
          },
          reject: () => {
            supplierDataforSave.SupplierId = this.previousSupplierId;
            this.showLeftPanelLoadingIcon = false;
          }
        });
      }
      else {
        if (workFlowDetails.Value != this.oldCreditLimit) {
          workFlowDetails.IsCreditLimitChanged = true;
        }
        supplierDataforSave.ParentSupplierId = this.defaultSupplier.ParentSupplierId;
        supplierDataforSave.Attachments = this.defaultSupplier.Attachments.filter(i => i.IsDelete == true);
        HideFullScreen(null);
        this.supplierApiService.updateSupplier(supplierDataforSave, this.uploadedFiles).subscribe((data: any) => {
          this.formSubmitAttempt = false;
          this.message = "";
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.UpdatedSuccessFully,
            MessageType: MessageTypes.Success
          });
          if (isJustCreatedSupplier || this.sendForApproveButtonText == 'Send for approval') {
            workFlowDetails.Value = supplierDataforSave.SupplierCompanyDetails.CreditLimit != null ? supplierDataforSave.SupplierCompanyDetails.CreditLimit : null
            this.sharedServiceObj.sendForApproval(workFlowDetails).subscribe((data) => {
              this.sharedServiceObj.showMessage({
                ShowMessage: true,
                Message: Messages.SentForApproval,
                MessageType: MessageTypes.Success
              });
              this.showLeftPanelLoadingIcon = false;
              this.getSuppliers();
            });
          }
          else {
            this.showLeftPanelLoadingIcon = false;
            this.getSuppliers();
          }
        },
          err => {
            this.hideText = false;
            this.hideInput = true;
          }
        );
      }
    }
    else {
      Object.keys(this.suppliersInfoForm.controls).forEach((key: string) => {

        let itemGroupControl = <FormArray>this.suppliersInfoForm.controls[key];
        if (itemGroupControl.controls != undefined) {
          Object.keys(itemGroupControl.controls).forEach((key: string) => {
            if (itemGroupControl.controls[key].status == "INVALID" && itemGroupControl.controls[key].touched == false) {
              itemGroupControl.controls[key].markAsTouched();
            }
          });
        }

        if (this.suppliersInfoForm.controls[key].status == "INVALID" && this.suppliersInfoForm.controls[key].touched == false) {
          this.suppliersInfoForm.controls[key].markAsTouched();
        }
      });

      //SupplierCompanyDetails

      let itemGroupControl = <FormArray>this.suppliersInfoForm.controls['ContactPersons'];
      if (itemGroupControl.controls.length > 0) {
        itemGroupControl.controls.forEach(controlObj => {
          Object.keys(controlObj["controls"]).forEach((key: string) => {
            let itemGroupControl = controlObj.get(key);
            if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
              itemGroupControl.markAsTouched();
            }
          });
        });
      }

      let subCodeControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
      if (subCodeControl.controls.length > 0) {
        subCodeControl.controls.forEach(controlObj => {
          Object.keys(controlObj["controls"]).forEach((key: string) => {
            let subCodeControl = controlObj.get(key);
            if (subCodeControl.status == "INVALID" && subCodeControl.touched == false) {
              subCodeControl.markAsTouched();
            }
          });
        });
      }

      this.showLeftPanelLoadingIcon = false;
      //this.spinner.hide();
    }
  }
  IsSupplierNameChanged(editedSupplier: any, oldSupplier: Supplier): boolean {
    let isChanged: boolean = false;
    if ((oldSupplier.SupplierName != editedSupplier.SupplierName)) {
      isChanged = true;
    }
    return isChanged;
  }

  RecreateSupplier(supplierDataforSave: any) {
    supplierDataforSave.SupplierCompanyDetails.SupplierId = 0;
    supplierDataforSave.IsActive = false;
    supplierDataforSave.SupplierApproval.SupplierApprovalId = 0;
    this.isExistingSupplier = false;
    supplierDataforSave.DraftCode = this.defaultSupplier.DraftCode;
    supplierDataforSave.SupplierCode = this.defaultSupplier.SupplierCode;
    supplierDataforSave.Attachments = this.defaultSupplier.Attachments;
    supplierDataforSave.OldSupplier = this.oldSupplier;
    this.showLeftPanelLoadingIcon = true;
    supplierDataforSave.Attachments.forEach(attachment => {
      if (!attachment.IsDelete && supplierDataforSave.ParentSupplierId === null) {
        attachment.AttachmentId = 0;
      }
    });
    HideFullScreen(null);
    this.supplierApiService.createSupplier(supplierDataforSave, this.uploadedFiles).subscribe((response: { Status: string, Value: any }) => {
      if (response.Status == ResponseStatusTypes.Success) {
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.SavedSuccessFully,
          MessageType: MessageTypes.Success
        });
        this.supplierPagerConfig.RecordsToSkip = 0;
        this.getSuppliers();
      }
      else if (response.Status == ResponseStatusTypes.Duplicate) {
        this.showCodeErrorMessage = true;
        this.showLeftPanelLoadingIcon = false;
      }
      else {
        this.showCodeErrorMessage = false;
      }
    });
  }

  deleteRecord() {
    let recordId = this.defaultSupplier.SupplierId;
    //let companyId = this.defaultSupplier.CompanyId;
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.supplierApiService.deleteSupplier(recordId, this.companyId).subscribe((data) => {
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.DeletedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.getSuppliers();
        });

      },
      reject: () => {
      }
    });
  }

  onDateSelect(event) {

  }

  onSubCodeDescriptionChanged(subCodeDescription: string, rowIndex: number, gridRow: any) {
    let rowpayment: number = 0;
    let grnDescriptionControl = gridRow.get('SubCodeDescription');
    let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    let subCodeDescpriton = subCodesControl.controls[rowIndex].get('SubCodeDescription').value;
    let isExisted = false;
    isExisted = this.CheckDuplicate("SubCodeDescription", rowIndex, subCodeDescpriton);
    if (isExisted) {
      grnDescriptionControl.setErrors({ 'duplicateError': true });
    }
  }

  onSubCodeChanged(subCodeDescription: string, rowIndex: number, gridRow: any) {
    let rowpayment: number = 0;
    let grnDescriptionControl = gridRow.get('SubCode');
    let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    let subCodeDescpriton = subCodesControl.controls[rowIndex].get('SubCode').value;
    let isExisted = false;
    isExisted = this.CheckDuplicate("SubCode", rowIndex, subCodeDescpriton);
    if (isExisted) {
      grnDescriptionControl.setErrors({ 'duplicateSubCodeError': true });
    }
  }

  onAccountSetChanged(subCodeDescription: string, rowIndex: number, gridRow: any) {
    let rowpayment: number = 0;
    let grnDescriptionControl = gridRow.get('AccountSetId');
    let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    let subCodeDescpriton = subCodesControl.controls[rowIndex].get('AccountSetId').value;
    let isExisted = false;
    if (subCodeDescpriton.trim() != "") {
      isExisted = this.CheckDuplicate("AccountSetId", rowIndex, subCodeDescpriton);
      if (isExisted) {
        grnDescriptionControl.setErrors({ 'duplicateAccountSetError': true });
      }
    }
  }

  CheckDuplicate(key: string, rowIndex: number, result: string): boolean {
    let isExisted = false;
    let count = 0;
    let subCodesControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    if (subCodesControl != null) {
      subCodesControl.controls.forEach((control, index) => {
        let description = <string>control.get(key).value;
        if (description.trim().toLowerCase() === result.trim().toLowerCase()) {
          count++;
        }
        if (count > 1) {
          isExisted = true;
          return;
        }
      });
    }

    return isExisted;
  }

  removeSubCodeGridItem(rowIndex: number) {
    let subCodeControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    let subCodeId = subCodeControl.controls[rowIndex].get('SubCodeId').value;
    subCodeControl.removeAt(rowIndex);
  }

  setFinanceValidation() {
    let _taxId = this.suppliersInfoForm.controls['SupplierCompanyDetails'].get('TaxId');
    let _taxClass = this.suppliersInfoForm.controls['SupplierCompanyDetails'].get('TaxClass');
    let _rateType = this.suppliersInfoForm.controls['SupplierCompanyDetails'].get('RateType');
    let _bankCode = this.suppliersInfoForm.controls['SupplierCompanyDetails'].get('BankCode');
    if (this.isSupplierVerifier && this.requestType == 'approval') {
      _taxId.setValidators(Validators.required);
      _taxId.markAsTouched();
      _taxClass.setValidators(Validators.required);
      _taxClass.markAsTouched();
      _rateType.setValidators(Validators.required);
      _rateType.markAsTouched();
      _bankCode.setValidators(Validators.required);
      _bankCode.markAsTouched();
    }
    else {
      _taxId.clearValidators();
      _taxClass.clearValidators();
      _rateType.clearValidators();
      _bankCode.clearValidators();
    }
    _taxId.updateValueAndValidity();
    _taxClass.updateValueAndValidity();
    _rateType.updateValueAndValidity();
    _bankCode.updateValueAndValidity();
    const basiccontrol = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
    if (basiccontrol != undefined) {
      Object.keys(basiccontrol.controls).forEach((key: string) => {
        let subItemGroupControl = <FormArray>basiccontrol.controls[key];
        if (subItemGroupControl.controls != undefined) {
          Object.keys(subItemGroupControl.controls).forEach((key: string) => {
            if (this.isSupplierVerifier && this.requestType == 'approval') {
              subItemGroupControl.controls[key].setValidators(Validators.required);
              subItemGroupControl.controls[key].markAsTouched();
            }
            else {
              subItemGroupControl.controls[key].clearValidators();
            }
            subItemGroupControl.controls[key].updateValueAndValidity();
          });
        }
      });
    }
  }

  onSubmit(action: string) {
    debugger
    //if (this.defaultSupplier.SupplierApproval.WorkFlowStatus !== "Draft" && this.defaultSupplier.SupplierApproval.WorkFlowStatus !== undefined) {
    this.setFinanceValidation();
    //}
    this.showLeftPanelLoadingIcon = true;
    //this.spinner.show()
    let role = this.userDetails.UserRole;
    if ((this.moduleHeading === "Supplier") && action == 'save' && (this.defaultSupplier.SupplierApproval.WorkFlowStatus === "Draft" || this.defaultSupplier.SupplierApproval.WorkFlowStatus === "Cancelled Approval" || this.defaultSupplier.SupplierApproval.WorkFlowStatus === undefined || this.isOtherCompanySupplier) || (this.moduleHeading.toLowerCase() === "supplier approval" && this.isSupplierVerifier && this.isApprovedClicked === false)) {
      $(".toast-message-view").removeClass("slide-down-and-up");
      this.savedsucess = false;
      this.formError = "";
      this.formSubmitAttempt = true;

      if (!this.suppliersInfoForm.valid) {
        Object.keys(this.suppliersInfoForm.controls).forEach((key: string) => {
          let itemGroupControl = <FormArray>this.suppliersInfoForm.controls[key];
          if (itemGroupControl.controls != undefined) {
            Object.keys(itemGroupControl.controls).forEach((key: string) => {
              if (itemGroupControl.controls[key].status == "INVALID" && itemGroupControl.controls[key].touched == false) {
                itemGroupControl.controls[key].markAsTouched();
              }
            });
          }

          if (this.suppliersInfoForm.controls[key].status == "INVALID" && this.suppliersInfoForm.controls[key].touched == false) {
            this.suppliersInfoForm.controls[key].markAsTouched();
          }
        });

        let itemGroupControl = <FormArray>this.suppliersInfoForm.controls['ContactPersons'];
        if (itemGroupControl.controls.length > 0) {
          itemGroupControl.controls.forEach(controlObj => {
            Object.keys(controlObj["controls"]).forEach((key: string) => {
              let itemGroupControl = controlObj.get(key);
              if (itemGroupControl.status == "INVALID" && itemGroupControl.touched == false) {
                itemGroupControl.markAsTouched();
              }
            });
          });
        }

        let subCodeControl = <FormArray>this.suppliersInfoForm.controls['SubCodes'];
        if (subCodeControl.controls.length > 0) {
          subCodeControl.controls.forEach(controlObj => {
            Object.keys(controlObj["controls"]).forEach((key: string) => {
              let subCodeControl = controlObj.get(key);
              if (subCodeControl.status == "INVALID" && subCodeControl.touched == false) {
                subCodeControl.markAsTouched();
              }
            });
          });
        }

        this.formError = "Please fill in the mandatory fields (marked in red) and then click on Save";
        this.showLeftPanelLoadingIcon = false;
        //this.spinner.hide()
        return;
      }


      this.savedsucess = true;
      let supplierFormDetails: Supplier = this.suppliersInfoForm.value;
      supplierFormDetails.IsActive = true;
      supplierFormDetails.IsDeleted = false;
      supplierFormDetails.ParentSupplierId = null;
      this.isReApproval = false;
      supplierFormDetails.IsSupplierVerifier = false;

      if (this.isSupplierVerifier && supplierFormDetails.SupplierApproval.WorkFlowStatusId === WorkFlowStatus.Approved) {
        supplierFormDetails.ParentSupplierId = supplierFormDetails.SupplierId;
        supplierFormDetails.SupplierId = 0;
        supplierFormDetails.SupplierCompanyDetails.SupplierId = 0;
        supplierFormDetails.IsActive = false;
        supplierFormDetails.SupplierApproval.SupplierApprovalId = 0;
        this.previousWorkFlowStatus = supplierFormDetails.SupplierApproval.WorkFlowStatusId;
        supplierFormDetails.SupplierApproval.WorkFlowStatusId = WorkFlowStatus.WaitingForApproval;
        this.isExistingSupplier = false;
        supplierFormDetails.DraftCode = this.defaultSupplier.DraftCode;
        supplierFormDetails.SupplierCode = this.defaultSupplier.SupplierCode;
        supplierFormDetails.Attachments = this.defaultSupplier.Attachments;
        this.isReApproval = true;
        supplierFormDetails.OldSupplier = this.oldSupplier;

      }

      if (!this.isOtherCompanySupplier) {
        supplierFormDetails.CompanyId = this.sessionService.getCompanyId();
        supplierFormDetails.SupplierApproval.CompanyId = supplierFormDetails.CompanyId;
        supplierFormDetails.SupplierCompanyDetails.CompanyId = supplierFormDetails.CompanyId;
      }

      if (this.isOtherCompanySupplier) {
        supplierFormDetails.SupplierCompanyDetails.CompanyId = this.sessionService.getCompanyId();
        supplierFormDetails.SupplierApproval.CompanyId = this.sessionService.getCompanyId();
      }
      //supplierFormDetails.WorkFlowStatusId = WorkFlowStatus.Draft;
      if (!this.isSupplierVerifier && supplierFormDetails.SupplierApproval.WorkFlowStatusId != WorkFlowStatus.CancelledApproval) {
        supplierFormDetails.SupplierApproval.WorkFlowStatusId = WorkFlowStatus.Draft;
      }

      supplierFormDetails.SupplierServices.forEach(service => {
        service.CompanyId = this.companyId;
      });

      supplierFormDetails.SubCodes.forEach(subCode => {
        if (!this.isExistingSupplier) {
          subCode.SupplierId = 0;
        }
        else {
          if (subCode.SupplierId === 0) {
            subCode.SupplierId = supplierFormDetails.SupplierId;
          }
        }

        subCode.CompanyId = this.companyId;
      });

      let userDetails = <UserDetails>this.sessionService.getUser();
      supplierFormDetails.CreatedBy = userDetails.UserID;
      if (supplierFormDetails.SupplierCompanyDetails.ReviewedDate != null) {
        supplierFormDetails.SupplierCompanyDetails.ReviewedDate = this.reqDateFormatPipe.transform(supplierFormDetails.SupplierCompanyDetails.ReviewedDate);
      }

      //supplierFormDetails.ContactPersons = supplierFormDetails.ContactPersons.filter(i => i.ContactPersonId == 0 || i.ContactPersonId == null || i.IsModified == true);

      if (this.isExistingSupplier) {
        supplierFormDetails.Attachments = this.defaultSupplier.Attachments.filter(i => i.IsDelete == true);
        if (this.isSupplierVerifier) {
          supplierFormDetails.IsSupplierVerifier = true;
          supplierFormDetails.SupplierCompanyDetails.CreditLimit = supplierFormDetails.SupplierCompanyDetails.CreditLimit != null ? supplierFormDetails.SupplierCompanyDetails.CreditLimit : 0;
          let workFlowDetails: SupplierWorkFlowParameter =
          {
            ProcessId: WorkFlowProcess.Supplier,
            CompanyId: this.companyId,
            LocationId: this.suppliersInfoForm.get("LocationId").value,
            FieldName: "",
            Value: supplierFormDetails.SupplierCompanyDetails.CreditLimit != null ? supplierFormDetails.SupplierCompanyDetails.CreditLimit : null,   //0,
            UserID: this.userDetails.UserID,
            RoleID: this.userDetails.RoleID,
            DocumentCode: supplierFormDetails.SupplierCode,
            DocumentId: supplierFormDetails.SupplierId,
            ParentDocumentId: 0,
            CreatedBy: this.userDetails.UserID,
            CoSupplierCode: this.suppliersInfoForm.get("CoSupplierCode").value,
            WorkFlowStatusId: WorkFlowStatus.WaitingForApproval,
            IsCreditLimitChanged: false
          };

          this.showLeftPanelLoadingIcon = false;
          supplierFormDetails.WorkFlowDetails = workFlowDetails;

          if (workFlowDetails.Value != this.oldCreditLimit) {
            workFlowDetails.IsCreditLimitChanged = true;
          }

          this.confirmationServiceObj.confirm({
            message: Messages.SupplierVerifierSaveMessage,
            header: "Confirmation",
            acceptLabel: "Yes",
            rejectLabel: "No",
            rejectVisible: true,
            accept: () => {
              this.showLeftPanelLoadingIcon = true;
              this.updateSupplier(supplierFormDetails);
              this.IsSaved = true;
            },
            reject: () => {
              this.showLeftPanelLoadingIcon = false;
            }
          });

        }
        else {
          this.updateSupplier(supplierFormDetails);
          this.IsSaved = true;
        }
      }
      else {
        supplierFormDetails.SupplierId = 0;
        supplierFormDetails.IsGSTSupplier = false;
        supplierFormDetails.IsSubCodeRequired = 0;
        supplierFormDetails.SupplierCompanyDetails.SupplierId = 0;
        supplierFormDetails.SupplierCompanyDetails.SupplierCompanyId = 0;
        supplierFormDetails.SupplierApproval.SupplierId = 0;
        supplierFormDetails.SupplierApproval.SupplierApprovalId = 0;
        this.createSupplier(supplierFormDetails, this.previousWorkFlowStatus);
        this.IsSaved = true;
      }
    }
    else {
      this.showLeftPanelLoadingIcon = false;
      //this.spinner.hide();
    }
  }

  onFileUploadChange(event: any) {
    this.errorMessage = "";
    let files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      let fileItem = files.item(i);
      if (ValidateFileType(fileItem.name)) {
        if (!this.checkDuplicateFile(fileItem.name)) {
          this.uploadedFiles.push(fileItem);
        }

      }
      else {
        event.preventDefault();
        break;
      }
    }
  }

  checkDuplicateFile(fileName: string): boolean {
    //let file = this.uploadedFiles.filter(i => i.name.toLowerCase() === fileName.toLowerCase())[0];
    if (this.isExistingSupplier) {
      if (this.defaultSupplier.Attachments != null) {
        let uploadFile;
        let attchmentile = this.defaultSupplier.Attachments.filter(i => i.FileName.toLowerCase() == fileName.toLowerCase())[0];
        // if (this.uploadedFiles.length > 0) {
        //   uploadFile = this.uploadedFiles.filter(i => i.name.toLowerCase() == fileName.toLowerCase())[0];
        // }

        if (attchmentile != null && attchmentile != undefined) {
          this.errorMessage = "File is already existed"
          this.isDuplicate = true;
          return true;
        }
        else {
          this.errorMessage = ""
          this.isDuplicate = false;
          return false;
        }
      }
      else {
        return false;
      }
    }
    else {
      if (this.uploadedFiles.length > 0) {
        let uploadFile = this.uploadedFiles.filter(i => i.name.toLowerCase() == fileName.toLowerCase())[0];
        if (uploadFile != null && uploadFile != undefined) {
          this.errorMessage = "File is already existed"
          this.isDuplicate = true;
          return true;
        }
        else {
          this.errorMessage = ""
          this.isDuplicate = false;
          return false;
        }
      }
      else {
        return false;
      }
    }
  }

  onFileClose(fileIndex: number) {
    this.uploadedFiles = this.uploadedFiles.filter((file, index) => index != fileIndex);
  }

  attachmentDelete(attachmentIndex: number) {
    this.confirmationServiceObj.confirm({
      message: Messages.AttachmentDeleteConfirmation,
      header: Messages.DeletePopupHeader,
      accept: () => {
        let attachmentRecord = this.defaultSupplier.Attachments[attachmentIndex];
        attachmentRecord.IsDelete = true;
        this.defaultSupplier.Attachments = this.defaultSupplier.Attachments.filter((obj, index) => index > -1);
      },
      reject: () => {
      }
    });
  }

  pageChange(currentPageNumber: any) {
    if (!isNaN(currentPageNumber)) {
      this.supplierPagerConfig.RecordsToSkip = this.supplierPagerConfig.RecordsToFetch * (currentPageNumber - 1);
      if (this.isApprovalPage) {
        this.getSupplierApprovals(0, this.companyId);
      }
      else {
        this.getSuppliers();
      }
    }

    this.showfilters =false;
    this.showfilterstext="Hide List" ;

  }

  patchSupplierData(): Supplier {
    let supplier: Supplier = this.suppliersInfoForm.value;
    supplier.IsActive = true;
    supplier.IsDeleted = false;
    supplier.Attachments = this.defaultSupplier.Attachments.filter(i => i.IsDelete == true);
    supplier.SupplierServices.forEach(service => {
      service.CompanyId = this.companyId;
    });

    supplier.SubCodes.forEach(subCode => {
      if (!this.isExistingSupplier) {
        subCode.SupplierId = 0;
      }
      else {
        if (subCode.SupplierId === 0) {
          subCode.SupplierId = supplier.SupplierId;
        }
      }
      subCode.CompanyId = this.companyId;
    });

    supplier.ContactPersons.forEach(i => {
      if (i.ContactPersonId > 0) {
        let previousRecord = this.defaultSupplier.ContactPersons.find(j => j.ContactPersonId == i.ContactPersonId);
        if (
          i.ContactNumber != previousRecord.ContactNumber ||
          i.EmailId != previousRecord.EmailId ||
          i.Name != previousRecord.Name ||
          i.Saluation != previousRecord.Saluation ||
          i.Surname != previousRecord.Surname ||
          i.Department != previousRecord.Department) {
          i.IsModified = true;
        }
      }
      else {
        i.ContactPersonId = 0;
        i.CompanyId = this.companyId;
      }

      if (this.isSupplierVerifier && this.previousWorkFlowStatus === WorkFlowStatus.Approved) {
        i.ContactPersonId = 0;
        i.CompanyId = this.companyId;
      }
    });
    return supplier;
  }

  rejectInvoice(reason) {
    this.RejectReason = reason;
    this.showVoidPopUp = false;
    this.updateStatus(WorkFlowStatus.Rejected);
  }

  showRejectPopup() {
    this.showVoidPopUp = true;
  }
  hideVoidPopUp() {
    this.showVoidPopUp = false;
  }
  displayLogPopUp() {
    this.showLogPopUp = true;
  }
  hideLogPopUp(hidePopUp: boolean) {
    this.showLogPopUp = false;
  }
  updateStatus(statusId: number) {
    //this.spinner.show();
    this.showLeftPanelLoadingIcon = true;
    this.isApprovedClicked = true;
    let remarks = "";
    let successMessage = "";
    //this. userDetails = <UserDetails>this.sessionService.getUser();
    if (statusId == WorkFlowStatus.Approved || statusId == WorkFlowStatus.Rejected) {
      // if (this.defaultSupplier.CreatedBy == this.defaultSupplier.CurrentApproverUserId &&
      //   this.defaultSupplier.CreatedBy == this.userDetails.UserID && this.defaultSupplier.CompanyId == this.companyId) {
      //   this.sharedServiceObj.showMessage({
      //     ShowMessage: true,
      //     Message: Messages.PoApprovesameValidationMessage,
      //     MessageType: MessageTypes.Error
      //   });
      //   return;
      // }
      // this.disableApprove = true;
    }
    let formRemarks = this.suppliersInfoForm.get('ApprovalRemarks').value;
    if ((formRemarks == "" || formRemarks == null) && (statusId == WorkFlowStatus.AskedForClarification || statusId == WorkFlowStatus.WaitingForApproval)) {
      this.suppliersInfoForm.get('ApprovalRemarks').setErrors({ "required": true });
      this.suppliersInfoForm.get('ApprovalRemarks').markAsTouched();
      return;
    }
    if (statusId == WorkFlowStatus.Approved) {
      this.setFinanceValidation();
      if (formRemarks != "" && formRemarks != null) {
        remarks = formRemarks;
      }
      else {
        remarks = "Approved";
        remarks = (this.isSupplierVerifier) ? "Verified" : "Approved";
      }
      successMessage = Messages.Approved;
    }
    else if (statusId == WorkFlowStatus.Rejected) {
      if (this.RejectReason != "" && this.RejectReason != null) {
        remarks = this.RejectReason;
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
    let userDetails = <UserDetails>this.sessionService.getUser();
    let workFlowStatus: WorkFlowApproval = {
      DocumentId: this.defaultSupplier.SupplierId,
      UserId: userDetails.UserID,
      WorkFlowStatusId: statusId,
      Remarks: remarks,
      RequestUserId: this.defaultSupplier.CreatedBy,
      // DocumentCode: this.defaultSupplier.SupplierId.toString(),//need to update to document coee
      DocumentCode: this.defaultSupplier.WorkFlowStatus === "Draft" ? this.defaultSupplier.DraftCode : this.defaultSupplier.SupplierCode,
      ProcessId: WorkFlowProcess.Supplier,
      CompanyId: this.sessionService.getCompanyId(),
      IsReApproval: this.isReApproval,
      ApproverUserId: 0,
      ParentSupplierId: this.defaultSupplier.ParentSupplierId
    };
    if (this.isApprovalPage == true) {//if it is workflow approval page...
      if (this.isSupplierVerifier && successMessage != Messages.SentForClarification && statusId != WorkFlowStatus.Rejected) {
        if (this.suppliersInfoForm.valid) {
          let supplier: Supplier = this.patchSupplierData();
          this.supplierApiService.updateSupplier(supplier, this.uploadedFiles).subscribe((x: any) => {
            this.showLeftPanelLoadingIcon = true;
            this.updateWorkFlowDocApprovalStatus(workFlowStatus, successMessage, statusId);
          })
        }
      }
      else {
        this.updateWorkFlowDocApprovalStatus(workFlowStatus, successMessage, statusId);
      }
    }
    else {
      workFlowStatus.ApproverUserId = this.defaultSupplier.CurrentApproverUserId
      this.sharedServiceObj.workFlowClarificationReply(workFlowStatus)
        .subscribe((data) => {
          this.suppliersInfoForm.get('ApprovalRemarks').setValue("");
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: successMessage,
            MessageType: MessageTypes.Success
          });
          this.requestSearchKey = "";
          this.isApprovedClicked = false;
          this.selectedSupplierId = workFlowStatus.DocumentId;
          //this.spinner.hide();
          this.showLeftPanelLoadingIcon = false;
          this.getSuppliers();
          //this.getSupplierApprovals(workFlowStatus.DocumentId);
        });
    }
  }
  updateWorkFlowDocApprovalStatus(workFlowStatus: WorkFlowApproval, successMessage: string, statusId: number) {
    this.sharedServiceObj.updateWorkFlowDocApprovalStatus(workFlowStatus)
      .subscribe((data) => {
        this.suppliersInfoForm.get('ApprovalRemarks').setValue("");
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: successMessage,
          MessageType: MessageTypes.Success
        });
        this.requestSearchKey = "";
        this.isApprovedClicked = false;
        //this.spinner.hide();
        this.showLeftPanelLoadingIcon = false;
        this.getSupplierApprovals((statusId == WorkFlowStatus.Approved || statusId == WorkFlowStatus.Rejected) ? 0 : workFlowStatus.DocumentId, this.companyId);
        //this.getSupplierApprovals(0, this.companyId);
      });
  }

  recallSupplierApproval() {
    this.showLeftPanelLoadingIcon = true;
    let userDetails = <UserDetails>this.sessionService.getUser();
    let supplierId = this.defaultSupplier.SupplierId;
    let approvalObj = {
      SupplierId: supplierId,
      ParentSupplierId: this.defaultSupplier.ParentSupplierId || 0,
      CreatedBy: userDetails.UserID,
      SupplierCode: this.defaultSupplier.SupplierCode,
      CurrentApproverUserName: this.defaultSupplier.CurrentApproverUserName,
      CreatedByUserName: userDetails.UserName,
      CurrentApproverUserId: this.defaultSupplier.CurrentApproverUserId,
      WorkFlowStatus: this.defaultSupplier.WorkFlowStatus,
      CompanyId: this.companyId
    };
    this.supplierApiService.recallPoApproval(approvalObj)
      .subscribe(() => {
        this.readListView.emit({ SupplierId: supplierId });
        this.getSuppliers();
      });

  }

  uploadFile(event) {
    if (event.target.files.length == 0) {
      return
    }
    let file: File = event.target.files[0];
    if (file.type.toLowerCase() == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      let userDetails = <UserDetails>this.sessionService.getUser();
      this.supplierApiService.uploadSupplier(this.companyId, userDetails.UserID, file)
        .subscribe((data: any) => {
          console.log(data);
          // if (Number(data.UploadedRecords) > 0) {
          //   this.sharedServiceObj.showMessage({
          //     ShowMessage: true,
          //     Message: "Imported Successfully",
          //     MessageType: MessageTypes.Success
          //   });
          //   this.getSuppliers();
          // }
          // else {
          //   this.sharedServiceObj.showMessage({
          //     ShowMessage: true,
          //     Message: "Already Imported",
          //     MessageType: MessageTypes.Success
          //   });
          // }
          this.getSuppliers();
          this.uploadResult = data;
          this.showUploadErrorDialog = true;

        });
    }
    else {
      this.sharedServiceObj.showMessage({
        ShowMessage: true,
        Message: Messages.AssetSubcategoryAcceptExcel,
        MessageType: MessageTypes.Error
      });
    }
  }

  detachSupplier(supplierCompanyToDetach: any, rowIndex: number): void {
    const self = this;
    this.supplierApiService.detachSupplier(supplierCompanyToDetach).subscribe(
      (data: any) => {
        if (data > 0) {
          this.showLeftPanelLoadingIcon = false;
          this.message = "";
          let supplierEntityControl = <FormArray>this.suppliersInfoForm.controls['SupplierEntities'];
          let companyId = supplierEntityControl.controls[rowIndex].get('CompanyId').value;
          supplierEntityControl.removeAt(rowIndex);
          if (supplierEntityControl.length === 0) {
            this.getSuppliers();
          }
          else if (this.companyId === companyId) {
            this.getSuppliers();
          }

          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.DetachedSuccessFully,
            MessageType: MessageTypes.Success
          });


        }
        else {
          if (data === -2) {
            this.showLeftPanelLoadingIcon = false;
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.SupplierDetachErrorMessage,
              MessageType: MessageTypes.Error
            });
          }
        }
      },
      err => {
        this.showLeftPanelLoadingIcon = false;
      }
    );
  }

  onDetachSupplier(rowIndex: number) {
    let supplierEntityControl = <FormArray>this.suppliersInfoForm.controls['SupplierEntities'];
    let supplierCompanyId = supplierEntityControl.controls[rowIndex].get('SupplierCompanyId').value;
    let companyName = supplierEntityControl.controls[rowIndex].get('CompanyName').value;
    let companyId = supplierEntityControl.controls[rowIndex].get('CompanyId').value;
    this.confirmationServiceObj.confirm({
      message: Messages.SupplierDetachMessage + " from Company: " + companyName + "?",
      header: "Confirmation",
      acceptLabel: "Yes",
      rejectLabel: "No",
      rejectVisible: true,
      accept: () => {
        this.showLeftPanelLoadingIcon = true;
        if (supplierCompanyId > 0) {
          //this.supplierToDetach.push(supplierCompanyId);
          //supplierEntityControl.removeAt(rowIndex);
          //Detaching supplier from selected company
          this.supplierCompanyToDetach = new SupplierCompanyDetails();
          this.supplierCompanyToDetach.SupplierCompanyId = supplierCompanyId;
          this.supplierCompanyToDetach.SupplierId = this.supplierId;
          this.supplierCompanyToDetach.CompanyId = companyId;
          this.supplierCompanyToDetach.IsDetached = true;
          this.detachSupplier(this.supplierCompanyToDetach, rowIndex);
        }
      },
      reject: () => {
        this.showLeftPanelLoadingIcon = false;
      }
    });
  }
  ExportAsExcel() {
    let supplierdetails: Array<SupplierExportAll> = new Array<SupplierExportAll>();
    this.supplierApiService.ExportSupplier().subscribe((data: Array<SupplierExportAll>) => {
      supplierdetails = data;
      const ws1_name = 'Supplier';
      const ws2_name = 'Supplier Contact Persons';
      const ws3_name = 'Supplier Subcode';
      const ws4_name = 'Supplier Finance Info';
      const ws5_name = 'Supplier Services';

      var ws1Data = supplierdetails['supplierexport'].map((x) => {
        return {
          'SupplierName': x.SupplierName,
          'SupplierShortName': x.SupplierShortName,
          'SupplierCategory': x.SupplierCategory,
          // 'CurrencyCode': x.CurrencyCode,
          'BillingAddress1': x.BillingAddress1,
          'BillingAddress2': x.BillingAddress2,
          'BillingAddress3': x.BillingAddress3,
          'BillingCity ': x.BillingCity,
          'BillingCountry': x.BillingCountry,
          'BillingZipcode': x.BillingZipcode,
          'BillingTelephone': x.BillingTelephone,
          'BillingFax': x.BillingFax,
          'SupplierType': x.SupplierType,
          'CoSupplierCode': x.CoSupplierCode,
          'SupplierEmail': x.SupplierEmail,
          'Remarks': x.Remarks,
          'GSTStatus': x.GSTStatus,
          'GSTNumber': x.GSTNumber,
          'ShareCapital': x.ShareCapital

        };
      })

      var ws2Data = supplierdetails['suppliercontactPersonsExport'].map((x) => {
        return {
          'SupplierName': x.SupplierName,
          'CompanyCode': x.CompanyCode,
          'Surname': x.Surname,
          'Name': x.Name,
          'ContactNumber': x.ContactNumber,
          'Email': x.Email,
          'Saluation': x.Saluation,
          'Department': x.Department,
        };
      })

      var ws3Data = supplierdetails['suppliersubCodeExport'].map((x) => {
        return {
          'SupplierName': x.SupplierName,
          'CompanyCode': x.CompanyCode,
          'SubCodeDescription': x.SubCodeDescription,
          'SubCode': x.SubCode,
          'AccountSet': x.AccountSet,
          'SupplierCode': x.SupplierCode,
        };
      })
      var ws4Data = supplierdetails['supplierfinanceInfoExport'].map((x) => {
        return {
          'SupplierName': x.SupplierName,
          'CompanyCode': x.CompanyCode,
          'CurrencyCode': x.CurrencyCode,
          'TaxGroup': x.TaxGroup,
          'TaxClass': x.TaxClass,
          'GstType': x.GstType,
          'TaxinPercentage': x.TaxinPercentage,
          // 'GSTNumber': x.GSTNumber,
          'RateType': x.RateType,
          // 'ShareCapital': x.ShareCapital,
          'CreditLimit': x.CreditLimit,
          'BankCode': x.BankCode,
          'GLAccount': x.GLAccount,
          'ReviewedDate': x.ReviewedDate,
          'PaymentTermsCode': x.PaymentTermsCode,
          'PaymentTermsNoOfDays': x.PaymentTermsNoOfDays
        };
      })

      var ws5Data = supplierdetails['supplierservicesExport'].map((x) => {
        return {
          'SupplierName': x.SupplierName,
          'CompanyCode': x.CompanyCode,
          'ServiceName': x.ServiceName,
          'ServiceCategory': x.ServiceCategory
        };
      })

      const wb: WorkBook = { SheetNames: [], Sheets: {} };
      const ws1: any = utils.json_to_sheet(ws1Data);
      const ws2: any = utils.json_to_sheet(ws2Data);
      const ws3: any = utils.json_to_sheet(ws3Data);
      const ws4: any = utils.json_to_sheet(ws4Data);
      const ws5: any = utils.json_to_sheet(ws5Data);

      wb.SheetNames.push(ws1_name);
      wb.SheetNames.push(ws2_name);
      wb.SheetNames.push(ws3_name);
      wb.SheetNames.push(ws4_name);
      wb.SheetNames.push(ws5_name);
      wb.Sheets[ws1_name] = ws1;
      wb.Sheets[ws2_name] = ws2;
      wb.Sheets[ws3_name] = ws3;
      wb.Sheets[ws4_name] = ws4;
      wb.Sheets[ws5_name] = ws5;


      const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
      this.ExcelExportFileName = "ExportSupplier" + ".xlsx";
      function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
          view[i] = s.charCodeAt(i) & 0xFF;
        };
        return buf;
      }
      saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), this.ExcelExportFileName);

    });
  }

  ExportToCSV()
  {
    console.log("ExportToCSV");
  }
  ExportToExcel()
  {
    console.log("ExportToExcel");
  }

  ExportToPDF()
  {
    console.log("ExportToPDF");
  }

  ExportAsVendorsExcel() {
    let VendorsDetails: Array<VendorsList> = new Array<VendorsList>();
    this.supplierApiService.exportVendorByNewCreateSup(this.ExportSupplierId, this.companyId).subscribe((data) => {
      VendorsDetails = data.Vendor;
      const ws1_name = 'Vendors';
      const ws2_name = 'Vendor_Optional_Field_Values';

      var vendorsData = VendorsDetails.map((x) => {
        return {
          'VENDORID': x.VendorId,
          'IDGRP': x.IDGRP,
          'SHORTNAME': x.ShortName,
          'BRN': x.BRN,
          'AMTCRLIMT': x.AMTCRLIMT,
          'IDACCTSET': x.IDAcctSet,
          'VENDNAME': x.VendName,
          'TEXTSTRE1': x.Textstre1,
          'TEXTSTRE2': x.Textstre2,
          'TEXTSTRE3': x.Textstre3,
          'TEXTSTRE4': x.Textstre4,
          'NAMECITY': x.NameCity,
          'CODESTTE': x.CodeStte,
          'CODEPSTL': x.CodePstl,
          'CODECTRY': x.CodeCtry,
          'NAMECTAC': x.NameCtac,
          'TEXTPHON1': x.TextPhon1,
          'TEXTPHON2': x.TextPhon2,
          'CURNCODE': x.CurnCode,
          'CODETAXGRP': x.CodeTaxGRP,
          'TAXCLASS1': x.TaxClass1,
          'EMAIL1': x.Email1,
          'EMAIL2': x.Email2,
          'CTACPHONE': x.CtacPhone,
          'CTACFAX': x.CtacFax

        };
      });

      var vendorsOptionalData = VendorsDetails.map((x) => {
        return {
          'VENDORID': '',
          'OPTFIELD': ''
        };
      });
      if (VendorsDetails.length > 0) {
        let url = "/assets/ExcelTemplates/Supplier.xlsx";
        let req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.responseType = "arraybuffer";
        req.onload = (e) => {
          let data = new Uint8Array(req.response);
          let wb = XLSX.read(data, { type: "array" });
          const ws1: any = utils.json_to_sheet(vendorsData);
          const ws2: any = utils.json_to_sheet(vendorsOptionalData);
          wb.Sheets[ws1_name] = ws1;
          wb.Sheets[ws2_name] = ws2;
          const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
          this.ExcelExportFileName = "VendorsExport" + ".xlsx";
          saveAs(new Blob([VendorsSave(wbout)], { type: 'application/octet-stream' }), this.ExcelExportFileName);
        };
        req.send();
      }
      else {
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.NoRecordsExport,
          MessageType: MessageTypes.Success
        });
      }
      function VendorsSave(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
          view[i] = s.charCodeAt(i) & 0xFF;
        };
        return buf;
      }
    });
  }
}


export class SupplierCategories {
  ServiceCategoryId: number;
  CategoryName: string;
}

export class SupplierCategory {
  SupplierCategoryID: number;
  CategoryText: string;
}

