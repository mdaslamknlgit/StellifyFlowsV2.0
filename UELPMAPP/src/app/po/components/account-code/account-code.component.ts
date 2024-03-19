import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, AfterViewInit, Renderer } from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountCodeAPIService } from '../../services/account-code-api.service';
import { AccountCode, AccountCodeCategory, AccountType, AccountCodeList } from '../../models/account-code.model';
import { SharedService } from "../../../shared/services/shared.service";
import { ResponseMessage, Messages, MessageTypes, Taxes, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { NgbModal, NgbModalRef, ModalDismissReasons, NgbActiveModal, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, identity } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { AutofocusDirective } from '../../../shared/directives/focusdirective';
import { FullScreen } from "../../../shared/shared";
import { ConfirmationService } from 'primeng/primeng';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-code',
  templateUrl: './account-code.component.html',
  styleUrls: ['./account-code.component.css']
})
export class AccountCodeComponent implements OnInit {
  leftSection: boolean = false;
  rightSection: boolean = false;
  hideInput: boolean = false;
  scrollbarOptions: any;
  accountCodeList: Array<AccountCodeList> = [];
  accountDetails: Array<AccountCode> = [];
  accountCodeCategories = [];
  accountTypes = [];
  accountCodes: AccountCode[] = [];
  companies = [];
  accountCodesInfoForm: FormGroup;
  showGridErrorMessage: boolean = false;
  gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
  formSubmitAttempt: boolean = false;
  gridColumns: Array<{ field: string, header: string }> = [];
  errorMessage: string = Messages.NoRecordsToDisplay;
  companyId: number = 0;
  isSelected: boolean = false;
  isShow: boolean = false;
  defaultAccountType: string = "";
  userDetails: UserDetails;
  isChangedData: boolean = false;
  selectedCompanyId: number = 0;
  message: string = "";
  uploadedRecords: string = "";
  failedRecords: string = "";
  selectedAccountCodes: Array<AccountCode> = [];
  isNewRecord: boolean = false;
  newPermission: boolean;
  editPermission: boolean;
  importPermission: boolean;
  deletePermission: boolean;
  public screenWidth: any;
  constructor(private accountCodeAPIService: AccountCodeAPIService,
    private formBuilderObj: FormBuilder,
    private sharedServiceObj: SharedService,
    private renderer: Renderer,
    private confirmationServiceObj: ConfirmationService,
    public sessionService: SessionStorageService) {
    this.companyId = this.sessionService.getCompanyId();
  }

  ngOnInit() {
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "accountcodes")[0];
      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.importPermission = formRole.IsImport;
      this.deletePermission = formRole.IsDelete;
    }
    else {
      this.newPermission = true;
      this.editPermission = true;
      this.importPermission = true;
      this.deletePermission = true;
    }
    this.sharedServiceObj.CompanyId$
      .subscribe((data) => {
        this.companyId = data;
        this.getCompanies();
        this.getAccountCodeCategories(this.companyId);
      });


    this.gridColumns = [
      { field: 'Sno', header: 'S.no' },
      { field: 'AccountCodeCategoryId', header: 'Sub Category' },
      { field: 'AccountCodeName', header: 'Account Code' },
      { field: 'Description', header: 'Description' },
      { field: 'Delete', header: 'Delete' }
    ];

    this.accountCodesInfoForm = this.formBuilderObj.group({
      'AccountCodeId': [null],
      'AccountCodeCategoryId': [null, { validators: [Validators.required] }],
      'AccountType': [null, { validators: [Validators.required] }],
      'AccountCodeName': [null],
      'CompanyId': [null, [Validators.required]],
      'AccountCodes': this.formBuilderObj.array([]),
      'SearchKey': [""],
      'Description': [null, { validators: [Validators.required] }],
      'CreatedBy': [],
      'UpdatedBy': [0],
      'AccountCodeCategoryName': [''],
      'Delete': ['']
    });

    this.getCompanies();
    this.getAccountCodeCategories(this.companyId);

    this.userDetails = <UserDetails>this.sessionService.getUser();

    if(window.innerWidth < 768){  
      this.screenWidth = window.innerWidth-150;
      }

  }
  prevent(event) {
    event.preventDefault();
  }
  getAccountCodeCategories(companyId: number): void {
    let accountCodeCategoriesResult = <Observable<Array<any>>>this.accountCodeAPIService.getAccountCodeCategories(companyId);
    accountCodeCategoriesResult.subscribe((data) => {
      if (data != null) {
        this.accountCodeCategories = data;
      }
    });
  }

  getAccountTypes(companyId: number): void {
    let accountTypesResult = <Observable<Array<AccountType>>>this.accountCodeAPIService.getAccountTypes(companyId);
    accountTypesResult.subscribe((data) => {
      if (data != null) {
        if (data.length > 0) {
          this.accountTypes = data;
          if (this.defaultAccountType === "") {
            this.defaultAccountType = this.accountTypes[0].AccountTypeName;
          }
          // this.accountCodesInfoForm.get('AccountType').setValue(this.defaultAccountType);
          this.GetAccountCodesByAccountType(this.defaultAccountType, companyId, "");
        }
        else {
          this.accountTypes = [];
          let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
          accountCodesControl.controls = [];
          accountCodesControl.controls.length = 0;
        }
      }
      else {
        this.accountTypes = [];
        let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
        accountCodesControl.controls = [];
        accountCodesControl.controls.length = 0;
      }
    });
  }

  getCompanies(): void {
    let companiesResult = <Observable<Array<any>>>this.sharedServiceObj.getCompaniesbykey("");
    companiesResult.subscribe((data) => {
      this.companies = data;
      if (this.companyId > 0) {
        this.accountCodesInfoForm.get('CompanyId').setValue(this.companyId);
        this.selectedCompanyId = this.companyId;
        this.getAccountTypes(this.companyId);
      }
    });
  }

  GetAccountCodesByAccountType(accountType: string, companyId: number, searchKey: string): void {
    let accountCodesDisplayInput = {
      AccountType: accountType,
      CompanyId: companyId,
      SearchKey: searchKey
    };
    let accountCodesResult = <Observable<Array<AccountCode>>>this.accountCodeAPIService.getAllSearchAccountCodes(accountCodesDisplayInput);
    accountCodesResult.subscribe((data) => {
      let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
      accountCodesControl.controls = [];
      accountCodesControl.controls.length = 0;
      if (data != null) {
        if (data.length > 0) {
          this.accountCodes = data;
          this.isSelected = true;
          //this.accountCodesInfoForm.get('AccountType').setValue(this.defaultAccountType);
          this.accountCodesInfoForm.get('CompanyId').setValue(this.selectedCompanyId);
          if (this.accountCodes != undefined && this.accountCodes != null) {
            this.addGridItem(this.accountCodes.length);
            this.accountCodesInfoForm.patchValue({
              AccountCodes: this.accountCodes,
              AccountType: this.defaultAccountType
            });
          }

        }
      }
    });
  }

  //adding row to the grid..
  addGridItem(noOfLines: number) {
    let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
    for (let i = 0; i < noOfLines; i++) {
      accountCodesControl.push(this.initGridRows());
    }
  }

  initGridRows() {
    return this.formBuilderObj.group({
      'AccountCodeId': 0,
      'CompanyId': '',
      'AccountType': 0,
      'AccountCodeCategoryId': 0,
      'CreatedBy': '',
      'CreatedDate': '',
      'UpdatedBy': this.userDetails.UserID,
      'AccountCodeName': '',
      'Description': '',
      'AccountCodeCategoryName': ''
    });
  }

  validateControl(control: any) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  onTypeSelection(accountType: any) {
    this.defaultAccountType = accountType;
    this.message = "";
    this.uploadedRecords = "";
    this.failedRecords = "";
    this.selectedAccountCodes = [];
    this.GetAccountCodesByAccountType(this.defaultAccountType, this.companyId, " ");
  }

  cancelData() {
    this.formSubmitAttempt = false;
    this.message = "";
    this.uploadedRecords = "";
    this.failedRecords = "";
    this.selectedAccountCodes = [];
    let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
    accountCodesControl.controls = [];
    accountCodesControl.controls.length = 0;
    this.accountCodesInfoForm.reset();
    this.accountCodesInfoForm.setErrors(null);
    this.isNewRecord = false;
    this.accountCodesInfoForm.get('AccountCodeCategoryId').clearValidators();
    this.accountCodesInfoForm.get('AccountCodeCategoryId').updateValueAndValidity();
    this.accountCodesInfoForm.get('AccountCodeName').clearValidators();
    this.accountCodesInfoForm.get('AccountCodeName').updateValueAndValidity();
    this.accountCodesInfoForm.get('Description').clearValidators();
    this.accountCodesInfoForm.get('Description').updateValueAndValidity();
    this.getCompanies();
    this.GetAccountCodesByAccountType(this.defaultAccountType, this.companyId, "");
    this.accountCodesInfoForm.get('AccountCodeCategoryId').setValue(null);
  }

  ResetData() {
    this.accountCodesInfoForm.reset();
    this.accountCodesInfoForm.setErrors(null);
    this.accountCodesInfoForm.get('AccountType').setValue(null);
    this.accountCodesInfoForm.get('AccountCodeCategoryId').setValue(null);
    this.accountCodesInfoForm.get('CompanyId').setValue(null);
    //this.ngOnInit();
    this.accountTypes = [];
    let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
    accountCodesControl.controls = [];
    accountCodesControl.controls.length = 0;
  }

  onCompanySelection(companyId: number) {
    this.selectedCompanyId = companyId;
    this.companyId = companyId;
    this.getAccountTypes(companyId);
    this.getAccountCodeCategories(this.companyId);
  }

  uploadFile(event) {
    if (event.target.files.length == 0) {
      return
    }
    let file: File = event.target.files[0];
    if (file.type.toLowerCase() == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      let userDetails = <UserDetails>this.sessionService.getUser();
      this.accountCodeAPIService.uploadAccountCodes(this.companyId, userDetails.UserID, file)
        .subscribe((data: any) => {
          if (data != null) {
            this.uploadedRecords = "<b>Number of UploadedRecords: " + data.UploadedRecords + " </b>";
            this.failedRecords = "<b>Number of FailedRecords: " + data.FailedRecords + " </b>";
            if (data.UploadedRecords > 0) {
              this.getAccountTypes(this.companyId);
              this.getAccountCodeCategories(this.companyId);
            }
          }
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

  fullScreen() {

  }
  showLeftCol(event) {
    $(".leftdiv").removeClass("hideleftcol");
    $(".rightPanel").removeClass("showrightcol");
  }
  onAccountCodesSearch(event: any) {
    let value = event.target.value;
    let searchKey = this.accountCodesInfoForm.get('SearchKey').value;
    let accountCodesDisplayInput = {
      AccountType: this.defaultAccountType,
      CompanyId: this.companyId,
      SearchKey: searchKey
    };

    let accountCodesResult = <Observable<Array<AccountCode>>>this.accountCodeAPIService.getAllSearchAccountCodes(accountCodesDisplayInput);
    accountCodesResult.subscribe((data) => {
      if (data != null) {
        if (data.length > 0) {
          this.accountCodes = data;
          this.isSelected = true;
          this.accountCodesInfoForm.get('AccountType').setValue(this.defaultAccountType);
          this.accountCodesInfoForm.get('CompanyId').setValue(this.selectedCompanyId);
          let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
          accountCodesControl.controls = [];
          accountCodesControl.controls.length = 0;
          //if (searchKey === "") {
          if (this.selectedAccountCodes != undefined) {
            if (this.selectedAccountCodes.length > 0) {
              this.selectedAccountCodes.forEach(accountCode => {
                let accountCide = this.accountCodes.find(data => data.AccountCodeId === accountCode.AccountCodeId);
                if (accountCide != null) {
                  accountCide.AccountCodeCategoryId = accountCode.AccountCodeCategoryId;
                }
              });
            }
          }
          // }
          if (this.accountCodes != undefined && this.accountCodes != null) {
            this.addGridItem(this.accountCodes.length);
            this.accountCodesInfoForm.patchValue({ AccountCodes: this.accountCodes });
          }

        }
        else {
          let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
          accountCodesControl.controls = [];
          accountCodesControl.controls.length = 0;
        }

      }

    });
    if (event.keycode == 13) {
      event.preventDefault();
      return false;
    }
  }

  onCategoryChange(categoryId: number, rowIndex: number, id: number) {
    this.isChangedData = true;
    if (this.selectedAccountCodes.findIndex(accountCode => accountCode.AccountCodeId == id) == -1) {
      let accountCode: AccountCode = new AccountCode();
      accountCode.AccountCodeId = id;
      accountCode.AccountCodeCategoryId = categoryId;
      this.selectedAccountCodes.push(accountCode);
    }
    else {
      this.selectedAccountCodes.forEach((element: AccountCode) => {
        if (element.AccountCodeId == id) {
          element.AccountCodeCategoryId = categoryId;
        }
      });
    }
  }
  onDescriptionChange(description: string, id: number) {
    this.isChangedData = true;
    if (this.selectedAccountCodes.findIndex(accountCode => accountCode.AccountCodeId == id) == -1) {
      let accountCode: AccountCode = new AccountCode();
      accountCode.AccountCodeId = id;
      accountCode.Description = description;
      this.selectedAccountCodes.push(accountCode);
    }
    else {
      this.selectedAccountCodes.forEach((element: AccountCode) => {
        if (element.AccountCodeId == id) {
          element.Description = description;
        }
      });
    }
  }

  onSubmit() {
    debugger
    this.formSubmitAttempt = true;
    let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
    let formStatus = accountCodesControl.status;
    if (formStatus != "INVALID") {
      if (!this.isNewRecord) {
        let accountCodes = this.accountCodesInfoForm.value;
        accountCodes.CompanyId = this.companyId;

        accountCodesControl.value.forEach(element => {
          element.UpdatedBy = this.userDetails.UserID;
        });

        this.updateAccountCodes(this.accountCodesInfoForm.value);
      }
      else {
        this.onCreate();
      }
    }

  }

  onCreate() {
    let formStatus = this.accountCodesInfoForm.status;
    if (formStatus != "INVALID") {
      let accountCode = this.accountCodesInfoForm.value;
      accountCode.CompanyId = this.companyId;
      accountCode.UpdatedBy = this.userDetails.UserID;
      accountCode.CreatedBy = this.userDetails.UserID;
      this.createAccountCode(accountCode);
    }
    else {
      this.message = "Please fill the fields mareked in red."
    }
  }

  createAccountCode(accountCode: any): void {
    const self = this;
    this.message = "";
    this.accountCodeAPIService.createAccountCode(accountCode).subscribe(
      (data: any) => {
        if (data === -1) {
          this.message = "Account Code is already existed...";
          return;
        }
        else {
          this.formSubmitAttempt = false;
          this.isNewRecord = false;
          this.accountCodesInfoForm.reset();
          this.accountCodesInfoForm.setErrors(null);
          this.GetAccountCodesByAccountType(this.defaultAccountType, this.companyId, "");
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.SavedSuccessFully,
            MessageType: MessageTypes.Success
          });
        }
      },
      err => {

      }
    );
    this.ngOnInit();
  }

  updateAccountCodes(accountCodes: any): void {
    const self = this;
    console.log(accountCodes);
    this.accountCodeAPIService.updateAccountCodes(accountCodes).subscribe(
      (data: any) => {
        this.formSubmitAttempt = false;
        this.selectedAccountCodes = [];
        this.GetAccountCodesByAccountType(this.defaultAccountType, this.companyId, "");
        this.sharedServiceObj.showMessage({
          ShowMessage: true,
          Message: Messages.UpdatedSuccessFully,
          MessageType: MessageTypes.Success
        });
      },
      err => {

      }
    );
  }

  addRecord() {
    this.isNewRecord = true;
    this.accountCodesInfoForm.get('AccountCodeCategoryId').setValidators([Validators.required]);
    this.accountCodesInfoForm.get('AccountCodeCategoryId').updateValueAndValidity();
    this.accountCodesInfoForm.get('AccountCodeName').setValidators([Validators.required]);
    this.accountCodesInfoForm.get('AccountCodeName').updateValueAndValidity();
    this.accountCodesInfoForm.get('Description').setValidators([Validators.required]);
    this.accountCodesInfoForm.get('Description').updateValueAndValidity();
  }

  /**
    * to remove the grid item...
    */
  removeGridItem(rowIndex: number) {
    let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
    let accountCodesControl = <FormArray>this.accountCodesInfoForm.controls['AccountCodes'];
    let accountcodecatId = accountCodesControl.controls[rowIndex].get('AccountCodeCategoryId').value;
    let accountcodeId = accountCodesControl.controls[rowIndex].get('AccountCodeId').value;
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {
        this.accountCodeAPIService.deleteAccountcodes(accountcodecatId, accountcodeId, this.selectedCompanyId, userDetails.UserID).subscribe((data) => {
          if (data == true) {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.AccountCodeValidationMessage,
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
          this.GetAccountCodesByAccountType(this.defaultAccountType, this.companyId, "");
        });
      },
      reject: () => {
      }
    });
  }

}
