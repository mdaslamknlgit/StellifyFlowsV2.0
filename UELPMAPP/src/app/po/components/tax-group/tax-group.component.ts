import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { TaxGroupApiService } from '../../services/tax-group-api.service';
import { PagerConfig, Messages, MessageTypes, ResponseStatusTypes, UserDetails } from '../../../shared/models/shared.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TaxGroupManagement, TaxGroupManagementDisplayResult } from '../../models/tax-group.model';
import { ConfirmationService } from 'primeng/primeng';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { FullScreen } from '../../../shared/shared';

@Component({
    selector: 'app-tax-group',
    templateUrl: './tax-group.component.html',
    styleUrls: ['./tax-group.component.css'],
    providers: [TaxGroupApiService]
})
export class TaxGroupComponent implements OnInit {

    taxGroupPagerConfig: PagerConfig;
    taxGroupManagementList: Array<TaxGroupManagement> = [];
    selectedtaxGroupManagementRecord: TaxGroupManagement;
    slideactive: number = 0;
    recordsToSkip: number = 0;
    recordsToFetch: number = 10;
    totalRecords: number = 0;
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    taxGroupFilterInfoForm: FormGroup;
    filterMessage: string = "";
    initSettingsDone = true;
    showRightPanelLoadingIcon: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    initDone = false;
    scrollbarOptions: any;
    isFilterApplied: boolean = false;
    taxGroupForm: FormGroup;
    formSubmitAttempt: boolean = false;
    leftsection: boolean = false;
    rightsection: boolean = false;
    filteredTaxGroup = [];
    taxGroupSearchKey: string = null;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    public innerWidth: any;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('userName') private userRef: any;
    constructor(
        private formBuilderObj: FormBuilder,
        private taxGroupApiServiceObj: TaxGroupApiService,
        private confirmationServiceObj: ConfirmationService,
        private sharedServiceObj: SharedService,
        public sessionService: SessionStorageService,
        private renderer: Renderer
    ) { }

    ngOnInit() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "taxgroup")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true;
        }

        this.taxGroupPagerConfig = new PagerConfig();
        this.taxGroupPagerConfig.RecordsToSkip = 0;
        this.selectedtaxGroupManagementRecord = new TaxGroupManagement();
        this.taxGroupPagerConfig.RecordsToFetch = 100;

        this.taxGroupForm = this.formBuilderObj.group({
            'TaxGroupName': [null, { validators: [Validators.required] }],
            'Description': [null]
        });
        this.getTaxgroup(0);
    }



    onSearchInputChange(event: any) {
        if (this.taxGroupSearchKey != "") {
            if (this.taxGroupSearchKey.length >= 3) {
                this.getAllSearchCurrency(this.taxGroupSearchKey, 0);
            }
        }
        else {
            this.getTaxgroup(0);
        }
    }

    getAllSearchCurrency(searchKey: string, idToBeSelected: number) {
        let userListInput = {
            Skip: 0,
            Take: this.taxGroupPagerConfig.RecordsToFetch,
            Search: searchKey
        };
        this.taxGroupApiServiceObj.getTaxGroup(userListInput)
            .subscribe((data: TaxGroupManagementDisplayResult) => {
                this.taxGroupManagementList = data.TaxGroupList
                this.taxGroupPagerConfig.TotalRecords = data.TotalRecords
                if (this.taxGroupManagementList.length > 0) {
                    if (idToBeSelected === 0) {
                        this.onRecordSelection(this.taxGroupManagementList[0].TaxGroupId);
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

    getTaxgroup(IdToBeSelected: number) {
        let displayInput = {
            Skip: this.taxGroupPagerConfig.RecordsToSkip,
            Take: this.taxGroupPagerConfig.RecordsToFetch,
            Search: ""
        };
        this.taxGroupApiServiceObj.getTaxGroup(displayInput)
            .subscribe((data: TaxGroupManagementDisplayResult) => {
                this.taxGroupManagementList = data.TaxGroupList;
                this.taxGroupPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.taxGroupManagementList.length > 0) {
                    if (IdToBeSelected == 0) {
                        this.onRecordSelection(this.taxGroupManagementList[0].TaxGroupId);

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

    onRecordSelection(taxgroupId: number) {
     
        this.taxGroupApiServiceObj.getTaxGroupDetails(taxgroupId)
            .subscribe((data: TaxGroupManagement) => {
                this.selectedtaxGroupManagementRecord = data;
                this.taxGroupForm.patchValue(data);
                this.showRightPanelLoadingIcon = false;
                this.hidetext = true;
                this.hideinput = false;
            }, (error) => {
                this.hidetext = true;
                this.hideinput = false;
                this.showRightPanelLoadingIcon = false;
            });
    }

    addRecord() {
        this.innerWidth = window.innerWidth;       
   if(this.innerWidth < 550){  
  $(".leftdiv").addClass("hideleftcol");
  $(".rightPanel").addClass("showrightcol");  
  }
        this.hidetext = false;
        this.hideinput = true;
        this.selectedtaxGroupManagementRecord = new TaxGroupManagement();
        this.taxGroupForm.reset();
        this.taxGroupForm.setErrors(null);
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
    editRecord() {
        this.hideinput = true;
        this.hidetext = false;
        this.taxGroupForm.reset();
        this.taxGroupForm.setErrors(null);
       // console.log(this.selectedtaxGroupManagementRecord);
        this.taxGroupForm.patchValue(this.selectedtaxGroupManagementRecord);

    }

    cancelRecord() {
        this.taxGroupForm.reset();
        this.taxGroupForm.setErrors(null);
        this.formSubmitAttempt = false;
        if (this.taxGroupManagementList.length > 0 && this.selectedtaxGroupManagementRecord != undefined) {
            if (this.selectedtaxGroupManagementRecord.TaxGroupId == undefined || this.selectedtaxGroupManagementRecord.TaxGroupId == 0) {
                this.onRecordSelection(this.taxGroupManagementList[0].TaxGroupId);
            }
            else {
                this.onRecordSelection(this.selectedtaxGroupManagementRecord.TaxGroupId);
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
                let recordId = this.selectedtaxGroupManagementRecord.TaxGroupId;
                this.taxGroupApiServiceObj.deleteTaxGroup(recordId, userDetails.UserID).subscribe((data) => {
                if(data==true)
                {
                    this.sharedServiceObj.showMessage({
                    ShowMessage: true,
                    Message: Messages.TaxgroupValidationMessage,
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

                 this.getTaxgroup(0);
                });
            },
            reject: () => {
            }
        });
    }


    saveRecord() {
       // console.log(this.taxGroupForm.value);
        let taxGroupFormStatus = this.taxGroupForm.status;
        if (taxGroupFormStatus != "INVALID") {
            if (this.taxGroupForm.get('TaxGroupName').value.trim() == "" || this.taxGroupForm.get('TaxGroupName').value.trim() == null) {
                this.taxGroupForm.get('TaxGroupName').setErrors({
                    'EmptyTaxGroupName': true
                });
                return;
            }
            let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
            let taxGroupmanagementDetails: TaxGroupManagement = this.taxGroupForm.value;
            //console.log(taxGroupmanagementDetails);
            taxGroupmanagementDetails.CreatedBy = userDetails.UserID;
            if (this.selectedtaxGroupManagementRecord.TaxGroupId == 0 || this.selectedtaxGroupManagementRecord.TaxGroupId == null) {
                taxGroupmanagementDetails.TaxGroupId = 0;
                this.taxGroupApiServiceObj.createTaxGroup(taxGroupmanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        this.getTaxgroup(response.Value);
                    }
                    else if (response.Status == "Duplicate TaxGroup Name") {
                        this.taxGroupForm.get('TaxGroupName').setErrors({
                            'DuplicateTaxGroup': true
                        });
                    }
                });
            }
            else {
                taxGroupmanagementDetails.TaxGroupId = this.selectedtaxGroupManagementRecord.TaxGroupId;

                this.taxGroupApiServiceObj.updateTaxGroup(taxGroupmanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;

                        this.getTaxgroup(taxGroupmanagementDetails.TaxGroupId);

                    }
                    else if (response.Status == "Duplicate Id") {
                        this.taxGroupForm.get('UserProfile').setErrors({
                            'DuplicateUser': true
                        });
                    }
                });
            }
        }
        else {
            Object.keys(this.taxGroupForm.controls).forEach((key: string) => {
                if (this.taxGroupForm.controls[key].status == "INVALID" && this.taxGroupForm.controls[key].touched == false) {
                    this.taxGroupForm.controls[key].markAsTouched();
                }
            });
        }
    }


    pageChange(currentPageNumber: any) {
        this.taxGroupPagerConfig.RecordsToSkip = this.taxGroupPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getTaxgroup(0);
    }

    split() {
        this.leftsection = !this.leftsection;
        this.rightsection = !this.rightsection;
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
