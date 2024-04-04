import { Component, OnInit, Renderer, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { PagerConfig, Messages, MessageTypes, ResponseStatusTypes } from '../../../shared/models/shared.model';
import { AccountTypes, AccountTypesDisplayResult } from '../../models/coa-account-type.model';
import { AccountTypesApiService } from '../../services/coa-account-types.service';
import { FullScreen } from '../../../shared/shared';

@Component({
    selector: 'app-coa-account-type',
    templateUrl: './coa-account-type.component.html',
    styleUrls: ['./coa-account-type.component.css'],
    providers: [AccountTypesApiService]
})
export class CoaAccountTypeComponent implements OnInit {

    AccountTypePagerConfig: PagerConfig;
    AccountTypesList: Array<AccountTypes> = [];
    selectedaccountTypeRecord: AccountTypes;
    slideactive: number = 0;
    recordsToSkip: number = 0;
    recordsToFetch: number = 10;
    totalRecords: number = 0;
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    accountTypeFilterInfoForm: FormGroup;
    filterMessage: string = "";
    initSettingsDone = true;
    showRightPanelLoadingIcon: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    initDone = false;
    scrollbarOptions: any;
    isFilterApplied: boolean = false;
    AccountTypeForm: FormGroup;
    formSubmitAttempt: boolean = false;
    leftsection: boolean = false;
    rightsection: boolean = false;
    filteredAccountType = [];
    accountTypeSearchKey: string = null;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    public innerWidth: any;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('userName') private userRef: any;
    showfilters:boolean=true;
    showfilterstext:string="Show List" ;


    constructor(private formBuilderObj: FormBuilder,
        private accountTypesApiServiceObj: AccountTypesApiService,
        private confirmationServiceObj: ConfirmationService,
        private sharedServiceObj: SharedService,
        public sessionService: SessionStorageService,
        private renderer: Renderer) { }

    ngOnInit() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "coaaccounttype")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true;
        }

        this.AccountTypePagerConfig = new PagerConfig();
        this.AccountTypePagerConfig.RecordsToSkip = 0;
        this.selectedaccountTypeRecord = new AccountTypes();
        this.AccountTypePagerConfig.RecordsToFetch = 100;

        this.AccountTypeForm = this.formBuilderObj.group({
            'AccountType': [null, { validators: [Validators.required] }],
            'Description': [null]
        });

        this.getAccountTypes(0);

        this.showfilters =false;
        this.showfilterstext="Hide List" ;

    }



    onSearchInputChange(event: any) {
        if (this.accountTypeSearchKey != "") {
            if (this.accountTypeSearchKey.length >= 3) {
                this.getAllSearchAccountTypes(this.accountTypeSearchKey, 0);
            }
        }
        else {
            this.getAccountTypes(0);
        }
    }

    getAllSearchAccountTypes(searchKey: string, idToBeSelected: number) {
        let userListInput = {
            Skip: 0,
            Take: this.AccountTypePagerConfig.RecordsToFetch,
            Search: searchKey
        };
        this.accountTypesApiServiceObj.getAccountType(userListInput)
            .subscribe((data: AccountTypesDisplayResult) => {
                this.AccountTypesList = data.AccountTypesList
                this.AccountTypePagerConfig.TotalRecords = data.TotalRecords
                if (this.AccountTypesList.length > 0) {
                    if (idToBeSelected === 0) {
                        this.onRecordSelection(this.AccountTypesList[0].COAAccountTypeId);
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

    getAccountTypes(IdToBeSelected: number) {
        let displayInput = {
            Skip: this.AccountTypePagerConfig.RecordsToSkip,
            Take: this.AccountTypePagerConfig.RecordsToFetch,
            Search: ""
        };
        this.accountTypesApiServiceObj.getAccountType(displayInput)
            .subscribe((data: AccountTypesDisplayResult) => {
                this.AccountTypesList = data.AccountTypesList;
                this.AccountTypePagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.AccountTypesList.length > 0) {
                    if (IdToBeSelected == 0) {
                        this.onRecordSelection(this.AccountTypesList[0].COAAccountTypeId);

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

    onRecordSelection(Id: number) {
        this.split();
        this.accountTypesApiServiceObj.getAccountTypesDetails(Id)
            .subscribe((data: AccountTypes) => {
                this.selectedaccountTypeRecord = data;
                this.AccountTypeForm.patchValue(data);
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
        this.selectedaccountTypeRecord = new AccountTypes();
        this.AccountTypeForm.reset();
        this.AccountTypeForm.setErrors(null);
        this.showfilters =false;
    this.showfilterstext="Show List" ;
    }

    editRecord() {
        this.hideinput = true;
        this.hidetext = false;
        this.AccountTypeForm.reset();
        this.AccountTypeForm.setErrors(null);
        console.log(this.selectedaccountTypeRecord);
        this.AccountTypeForm.patchValue(this.selectedaccountTypeRecord);
    }

    cancelRecord() {
        this.AccountTypeForm.reset();
        this.AccountTypeForm.setErrors(null);
        this.formSubmitAttempt = false;
        if (this.AccountTypesList.length > 0 && this.selectedaccountTypeRecord != undefined) {
            if (this.selectedaccountTypeRecord.COAAccountTypeId == undefined || this.selectedaccountTypeRecord.COAAccountTypeId == 0) {
                this.onRecordSelection(this.AccountTypesList[0].COAAccountTypeId);
            }
            else {
                this.onRecordSelection(this.selectedaccountTypeRecord.COAAccountTypeId);
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
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let recordId = this.selectedaccountTypeRecord.COAAccountTypeId;
                this.accountTypesApiServiceObj.deleteAccountTypes(recordId).subscribe((data) => {
                    if(data==true)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.AccounttypeValidationMessage,
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

                    this.getAccountTypes(0);
                });
            },
            reject: () => {
            }
        });
    }

    saveRecord() {
        console.log(this.AccountTypeForm.value);
        let AccountTypeFormStatus = this.AccountTypeForm.status;
        if (AccountTypeFormStatus != "INVALID") {
            if (this.AccountTypeForm.get('AccountType').value.trim() == "" || this.AccountTypeForm.get('AccountType').value.trim() == null) {
                this.AccountTypeForm.get('AccountType').setErrors({
                    'EmptyAccountType': true
                });
                return;
            }

            let accounttypesmanagementDetails: AccountTypes = this.AccountTypeForm.value;


            if (this.selectedaccountTypeRecord.COAAccountTypeId == 0 || this.selectedaccountTypeRecord.COAAccountTypeId == null) {
                accounttypesmanagementDetails.COAAccountTypeId = 0;
                this.accountTypesApiServiceObj.createAccountTypes(accounttypesmanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        this.getAccountTypes(response.Value);
                    }
                    else if (response.Status == "Duplicate AccountType") {
                        this.AccountTypeForm.get('AccountType').setErrors({
                            'DuplicateAccountType': true
                        });
                    }
                });
            }
            else {
                accounttypesmanagementDetails.COAAccountTypeId = this.selectedaccountTypeRecord.COAAccountTypeId;

                this.accountTypesApiServiceObj.updateAccountTypes(accounttypesmanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;

                        this.getAccountTypes(accounttypesmanagementDetails.COAAccountTypeId);

                    }
                    else if (response.Status == "Duplicate AccountType") {
                        this.AccountTypeForm.get('AccountType').setErrors({
                            'DuplicateAccountType': true
                        });
                    }
                });
            }
        }
        else {
            Object.keys(this.AccountTypeForm.controls).forEach((key: string) => {
                if (this.AccountTypeForm.controls[key].status == "INVALID" && this.AccountTypeForm.controls[key].touched == false) {
                    this.AccountTypeForm.controls[key].markAsTouched();
                }
            });
        }
    }

     
  
    showLeftCol(event)
    {
        $(".leftdiv").removeClass("hideleftcol"); 
        $(".rightPanel").removeClass("showrightcol"); 
    }
    pageChange(accounttypesPageNumber: any) {
        this.AccountTypePagerConfig.RecordsToSkip = this.AccountTypePagerConfig.RecordsToFetch * (accounttypesPageNumber - 1);
        this.getAccountTypes(0);
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
