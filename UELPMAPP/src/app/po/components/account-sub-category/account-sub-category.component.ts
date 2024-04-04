import { Component, OnInit, Renderer, ViewChild } from '@angular/core';
import { AccountSubCategoryApiService } from '../../services/account-sub-category-api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { PagerConfig, ResponseStatusTypes, Messages, MessageTypes, UserDetails } from '../../../shared/models/shared.model';
import { AccountCodeCategory, AccountCodeCategoryDisplayResult } from '../../models/account-sub-category.model';
import { FullScreen } from '../../../shared/shared';

@Component({
    selector: 'app-account-sub-category',
    templateUrl: './account-sub-category.component.html',
    styleUrls: ['./account-sub-category.component.css'],
    providers: [AccountSubCategoryApiService]
})
export class AccountSubCategoryComponent implements OnInit {

    accountCodeCategoryPagerConfig: PagerConfig;
    accountCodeCategoryList: Array<AccountCodeCategory> = [];
    selectedaccountCodeCategoryRecord: AccountCodeCategory;
    slideactive: number = 0;
    recordsToSkip: number = 0;
    recordsToFetch: number = 10;
    totalRecords: number = 0;
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    accountCodeCategoryFilterInfoForm: FormGroup;
    filterMessage: string = "";
    initSettingsDone = true;
    showRightPanelLoadingIcon: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    initDone = false;
    scrollbarOptions: any;
    isFilterApplied: boolean = false;
    accountCodeCategoryForm: FormGroup;
    formSubmitAttempt: boolean = false;
    leftsection: boolean = false;
    rightsection: boolean = false;
    filteredAccountCodeCategory = [];
    accountCodeCategorySearchKey: string = null;
    companyId: number;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    public innerWidth: any;
    showfilters:boolean=true;
    showfilterstext:string="Hide List" ;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('userName') private userRef: any;

    constructor(private formBuilderObj: FormBuilder,
        private accountSubCategoryApiServiceObj: AccountSubCategoryApiService,
        private confirmationServiceObj: ConfirmationService,
        private sharedServiceObj: SharedService,
        public sessionService: SessionStorageService,
        private renderer: Renderer) {
        this.companyId = this.sessionService.getCompanyId();

    }

    ngOnInit() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "accountsubcategory")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true;
        }

        this.accountCodeCategoryPagerConfig = new PagerConfig();
        this.accountCodeCategoryPagerConfig.RecordsToSkip = 0;
        this.selectedaccountCodeCategoryRecord = new AccountCodeCategory();
        this.accountCodeCategoryPagerConfig.RecordsToFetch = 100;

        this.accountCodeCategoryForm = this.formBuilderObj.group({
            'AccountCodeName': [null, { validators: [Validators.required] }],
            'Description': [null]
        });
        this.getAccountSubCategory(0);
        this.showfilters =false;
        this.showfilterstext="Hide List" ;
    }


    onSearchInputChange(event: any) {
        if (this.accountCodeCategorySearchKey != "") {
            if (this.accountCodeCategorySearchKey.length >= 3) {
                this.getAllSearchAccountSubCategory(this.accountCodeCategorySearchKey, 0);
            }
        }
        else {
            this.getAccountSubCategory(0);
        }
    }

    getAllSearchAccountSubCategory(searchKey: string, idToBeSelected: number) {
        let userListInput = {
            Skip: 0,
            Take: this.accountCodeCategoryPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId: this.companyId
        };
        this.accountSubCategoryApiServiceObj.getAccountSubCategory(userListInput)
            .subscribe((data: AccountCodeCategoryDisplayResult) => {
                this.accountCodeCategoryList = data.AccountCodeCategoryList
                this.accountCodeCategoryPagerConfig.TotalRecords = data.TotalRecords
                if (this.accountCodeCategoryList.length > 0) {
                    if (idToBeSelected === 0) {
                        this.onRecordSelection(this.accountCodeCategoryList[0].AccountCodeCategoryId);
                    }
                    else {
                        this.onRecordSelection(idToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            });
    }

    getAccountSubCategory(IdToBeSelected: number) {
        let displayInput = {
            Skip: this.accountCodeCategoryPagerConfig.RecordsToSkip,
            Take: this.accountCodeCategoryPagerConfig.RecordsToFetch,
            Search: "",
            CompanyId: this.companyId
        };
        this.accountSubCategoryApiServiceObj.getAccountSubCategory(displayInput)
            .subscribe((data: AccountCodeCategoryDisplayResult) => {
                this.accountCodeCategoryList = data.AccountCodeCategoryList;
                this.accountCodeCategoryPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.accountCodeCategoryList.length > 0) {
                    if (IdToBeSelected == 0) {
                        this.onRecordSelection(this.accountCodeCategoryList[0].AccountCodeCategoryId);

                    }
                    else {
                        this.onRecordSelection(IdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }

    onRecordSelection(accountCodeCategoryId: number) {
      this.split();
        this.accountSubCategoryApiServiceObj.getAccountSubCategoryDetails(accountCodeCategoryId)
            .subscribe((data: AccountCodeCategory) => {
                this.selectedaccountCodeCategoryRecord = data;
                this.accountCodeCategoryForm.patchValue(data);
                this.showRightPanelLoadingIcon = false;
                this.hidetext = true;
                this.hideinput = false;
            }, (error) => {
                this.hidetext = true;
                this.hideinput = false;
                this.showRightPanelLoadingIcon = false;
            });
    }
    hidefilter(){
        this.innerWidth = window.innerWidth;       
        if(this.innerWidth < 550){      
        $(".filter-scroll tr").click(function() {       
        $(".leftdiv").addClass("hideleftcol");
        $(".rightPanel").addClass("showrightcol");  
        $(".rightcol-scrroll").height("100%");  
      }); 
      }
      }
    addRecord() {
        this.innerWidth = window.innerWidth;       
   if(this.innerWidth < 550){  
  $(".leftdiv").addClass("hideleftcol");
  $(".rightPanel").addClass("showrightcol");  
  }
        this.hidetext = false;
        this.hideinput = true;
        this.selectedaccountCodeCategoryRecord = new AccountCodeCategory();
        this.accountCodeCategoryForm.reset();
        this.accountCodeCategoryForm.setErrors(null);
        this.showfilters =false;
    this.showfilterstext="Show List" ;
    }

    editRecord() {
        this.hideinput = true;
        this.hidetext = false;
        this.accountCodeCategoryForm.reset();
        this.accountCodeCategoryForm.setErrors(null);
        console.log(this.selectedaccountCodeCategoryRecord);
        this.accountCodeCategoryForm.patchValue(this.selectedaccountCodeCategoryRecord);

    }

    cancelRecord() {
        this.accountCodeCategoryForm.reset();
        this.accountCodeCategoryForm.setErrors(null);
        this.formSubmitAttempt = false;
        if (this.accountCodeCategoryList.length > 0 && this.selectedaccountCodeCategoryRecord != undefined) {
            if (this.selectedaccountCodeCategoryRecord.AccountCodeCategoryId == undefined || this.selectedaccountCodeCategoryRecord.AccountCodeCategoryId == 0) {
                this.onRecordSelection(this.accountCodeCategoryList[0].AccountCodeCategoryId);
            }
            else {
                this.onRecordSelection(this.selectedaccountCodeCategoryRecord.AccountCodeCategoryId);
            }
            this.hideinput = false;
            this.hidetext = true;
        }
        else {
            this.hideinput = null;
            this.hidetext = null;
        }
    }


    deleteRecord() {
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let recordId = this.selectedaccountCodeCategoryRecord.AccountCodeCategoryId;
                this.accountSubCategoryApiServiceObj.deleteAccountSubCategory(recordId, userDetails.UserID, this.companyId).subscribe((data) => {
                    if(data==true)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.AccountsubValidationMessage,
              MessageType: MessageTypes.Error
            
            });
          }
          else
          {
              this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.DeletedSuccessFully,
              MessageType: MessageTypes.Success
            
            });
          }

                    this.getAccountSubCategory(0);
                });
            },
            reject: () => {
            }
        });
    }


    saveRecord() {
        console.log(this.accountCodeCategoryForm.value);
        let accountCodeCategoryFormStatus = this.accountCodeCategoryForm.status;
        if (accountCodeCategoryFormStatus != "INVALID") {
            if (this.accountCodeCategoryForm.get('AccountCodeName').value.trim() == "" || this.accountCodeCategoryForm.get('AccountCodeName').value.trim() == null) {
                this.accountCodeCategoryForm.get('AccountCodeName').setErrors({
                    'AccountCodeName': true
                });
                return;
            }


            let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
            let accountCodeCategoryDetails: AccountCodeCategory = this.accountCodeCategoryForm.value;
            console.log(accountCodeCategoryDetails);
            accountCodeCategoryDetails.CreatedBy = userDetails.UserID;
            accountCodeCategoryDetails.CompanyId = this.companyId;

            if (this.selectedaccountCodeCategoryRecord.AccountCodeCategoryId == 0 || this.selectedaccountCodeCategoryRecord.AccountCodeCategoryId == null) {
                accountCodeCategoryDetails.AccountCodeCategoryId = 0;

                this.accountSubCategoryApiServiceObj.createAccountSubCategory(accountCodeCategoryDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        this.getAccountSubCategory(response.Value);
                    }
                    else if (response.Status == "Duplicate AccountCode Name") {
                        this.accountCodeCategoryForm.get('AccountCodeName').setErrors({
                            'DuplicateAccountCode': true
                        });
                    }
                });
            }
            else {
                accountCodeCategoryDetails.AccountCodeCategoryId = this.selectedaccountCodeCategoryRecord.AccountCodeCategoryId;

                this.accountSubCategoryApiServiceObj.updateAccountSubCategory(accountCodeCategoryDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        this.getAccountSubCategory(accountCodeCategoryDetails.AccountCodeCategoryId);
                    }
                    else if (response.Status == "Duplicate AccountCode Name") {
                        this.accountCodeCategoryForm.get('AccountCodeName').setErrors({
                            'DuplicateAccountCode': true
                        });
                    }
                });
            }
        }
        else {
            Object.keys(this.accountCodeCategoryForm.controls).forEach((key: string) => {
                if (this.accountCodeCategoryForm.controls[key].status == "INVALID" && this.accountCodeCategoryForm.controls[key].touched == false) {
                    this.accountCodeCategoryForm.controls[key].markAsTouched();
                }
            });
        }
    }


    pageChange(currentPageNumber: any) {
        this.accountCodeCategoryPagerConfig.RecordsToSkip = this.accountCodeCategoryPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getAccountSubCategory(0);
    }

    onClickedOutside(e: Event) {
      //  this.showfilters= false; 
        if(this.showfilters == false){ 
         //   this.showfilterstext="Show List"
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

    
    showLeftCol(event)
    {
        $(".leftdiv").removeClass("hideleftcol"); 
        $(".rightPanel").removeClass("showrightcol"); 
    }
    showFullScreen() {
        this.innerWidth = window.innerWidth; 
 if(this.innerWidth > 1000){ 
        FullScreen(this.rightPanelRef.nativeElement);
 }

    }


    openDialog() {
        this.initDone = true;
        if (this.userRef != undefined) {
            this.userRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.userRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        //this.resetFilters();
    }


}
