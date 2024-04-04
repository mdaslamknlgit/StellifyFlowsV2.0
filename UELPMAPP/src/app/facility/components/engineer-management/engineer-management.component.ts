import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { FullScreen } from '../../../shared/shared';
import { PagerConfig, Messages, Facilities, MessageTypes, UserDetails } from '../../../shared/models/shared.model';
import { ConfirmationService } from 'primeng/primeng';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SupplierServices } from '../../../po/models/supplier-service.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { EngineerManagementModel, EngineerManagementList, EngineerManagementDisplayResult, EngineerManagementFilterDisplayInput } from '../../models/engineer-management.model';
import { EngineerManagementService } from '../../services/engineer-management.service';
@Component({
    selector: 'app-engineer-management',
    templateUrl: './engineer-management.component.html',
    styleUrls: ['./engineer-management.component.css'],
    providers: [EngineerManagementService]
})
export class EngineerManagementComponent implements OnInit {
    hideText: boolean = true;
    hideInput: boolean = false;
    leftSection: boolean = false;
    rightSection: boolean = false;
    slideActive: boolean = false;
    selectedSupplierPaymentDetails: any;
    scrollbarOptions: any;
    EngineerManagementPagerConfig: PagerConfig;
    engineerManagementForm: FormGroup;
    engineerManagementFilterInfoForm: FormGroup;
    formSubmitAttempt: boolean = false;
    showRightPanelLoadingIcon: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    companyId: number;
    EngineerManagementList: Array<EngineerManagementList> = [];
    selectedEngineerManagementRecord: EngineerManagementModel;
    EngineerId: number;
    initDone = false;
    isFilterApplied: boolean = false;
    filteredEngineer = [];
    engineerSearchKey: string = null;
    filterMessage: string = "";
    initSettingsDone = true;
    dropdownList = [];
    dropdownSettings = {};
    facilitydropdownList = [];
    facilitydropdownSettings = {};
    showfilters:boolean=false;
    showfilterstext:string="Show List" ;



    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('engineerName') private engineerRef: any;

    constructor(private formBuilderObj: FormBuilder,
        private confirmationServiceObj: ConfirmationService,
        private engineerManagementServiceObj: EngineerManagementService,
        private sharedServiceObj: SharedService,
        public sessionService: SessionStorageService,
        private renderer: Renderer) {
        this.companyId = this.sessionService.getCompanyId();

    }

    ngOnInit() {
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        let userid = userDetails.UserID;
        this.EngineerManagementPagerConfig = new PagerConfig();
        this.EngineerManagementPagerConfig.RecordsToSkip = 0;
        this.selectedEngineerManagementRecord = new EngineerManagementModel();

        this.EngineerManagementPagerConfig.RecordsToFetch = 5;

        this.engineerManagementForm = this.formBuilderObj.group({
            'FirstName': [null, { validators: [Validators.required] }],
            'LastName': [null, { validators: [Validators.required] }],
            'JobCategory': [null, { validators: [Validators.required] }],
            'Facility': [null, { validators: [Validators.required] }],
            'IsActive': [null],
            'Contact': [null, { validators: [Validators.required, Validators.maxLength(20)] }],
            'AltContact': [null, Validators.maxLength(20)],
            'Email': [null, { validators: [Validators.required] }],
            'Address': [null, { validators: [Validators.required] }],
            'Category': [null]
        });

        this.engineerManagementFilterInfoForm = this.formBuilderObj.group({
            EngineerName: [''],
            EngineerCode: [''],
            JobCategory: [''],
            Facility: ['']
        });

        //multi select dropdown settings
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'SupplierServiceID',
            textField: 'ServiceName',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 3,
            allowSearchFilter: true
        };

        this.facilitydropdownSettings = {
            singleSelection: false,
            idField: 'FacilityId',
            textField: 'UnitNumber',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            itemsShowLimit: 3,
            allowSearchFilter: true
        };

        this.getJobCategory();
        this.getFacility();

        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                this.getFacility();
                this.getEngineerManagement(0);
            });

        this.getEngineerManagement(0);
    }

    getJobCategory(): void {
        let jobCategoryResult = <Observable<Array<any>>>this.sharedServiceObj.getAllJobCategory({ searchKey: '' });
        jobCategoryResult.subscribe((data) => {
            this.dropdownList = data;
        });
    }

    getFacility(): void {
        let facilityResult = <Observable<Array<any>>>this.sharedServiceObj.getFacilities({ searchKey: '', companyId: this.companyId });
        facilityResult.subscribe((data) => {
            this.facilitydropdownList = data;
        });
    }

    showFullScreen() {
        FullScreen(this.rightPanelRef.nativeElement);
    }

    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }

    addRecord() {
        this.hideText = false;
        this.hideInput = true;
        this.selectedEngineerManagementRecord = new EngineerManagementModel();
        this.engineerManagementForm.reset();
        this.engineerManagementForm.setErrors(null);
        this.engineerManagementForm.patchValue({
            IsActive: true
        });

        this.showfilters =false;
    this.showfilterstext="Show List" ;

    }

    cancelRecord() {
        this.engineerManagementForm.reset();
        this.engineerManagementForm.setErrors(null);
        this.formSubmitAttempt = false;
        if (this.EngineerManagementList.length > 0) {
            if (this.selectedEngineerManagementRecord.EngineerId == undefined || this.selectedEngineerManagementRecord.EngineerId == 0) {
                this.onRecordSelection(this.EngineerManagementList[0].EngineerId);
            }
            else {
                this.onRecordSelection(this.selectedEngineerManagementRecord.EngineerId);
            }
        }
        this.hideInput = false;
        this.hideText = true;

    }

    saveRecord() {
        let engineerManagementFormStatus = this.engineerManagementForm.status;
        if (engineerManagementFormStatus != "INVALID") {
            let engineermanagementDetails: EngineerManagementModel = this.engineerManagementForm.value;
            let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
            engineermanagementDetails.CreatedBy = userDetails.UserID;
            engineermanagementDetails.CompanyId = this.companyId;

            console.log(this.engineerManagementForm.value);
            if (this.selectedEngineerManagementRecord.EngineerId == 0 || this.selectedEngineerManagementRecord.EngineerId == null) {
                this.engineerManagementServiceObj.createEngineerManagement(engineermanagementDetails)
                    .subscribe((engineerId: number) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.formSubmitAttempt = false;
                        this.getEngineerManagement(engineerId);
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                    });
            }
            else {
                engineermanagementDetails.EngineerId = this.selectedEngineerManagementRecord.EngineerId;
                this.engineerManagementServiceObj.updateEngineerManagement(engineermanagementDetails)
                    .subscribe((engineerId: number) => {
                        this.hideText = true;
                        this.hideInput = false;
                        this.formSubmitAttempt = false;
                        this.getEngineerManagement(engineerId);
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                    });
            }
        }
        else {
            Object.keys(this.engineerManagementForm.controls).forEach((key: string) => {
                if (this.engineerManagementForm.controls[key].status == "INVALID" && this.engineerManagementForm.controls[key].touched == false) {
                    this.engineerManagementForm.controls[key].markAsTouched();
                }
            });
        }
    }

    getEngineerManagement(UserIdToBeSelected: number) {
        let displayInput = {
            Skip: this.EngineerManagementPagerConfig.RecordsToSkip,
            Take: this.EngineerManagementPagerConfig.RecordsToFetch,
            Search: "",
            CompanyId: this.companyId
        };
        this.engineerManagementServiceObj.getEngineerManagement(displayInput)
            .subscribe((data: EngineerManagementDisplayResult) => {
                if (data != null) {
                    this.EngineerManagementList = data.EngineerManagementList;
                    this.EngineerManagementPagerConfig.TotalRecords = data.TotalRecords;
                    this.showLeftPanelLoadingIcon = false;
                    if (this.EngineerManagementList.length > 0) {
                        if (UserIdToBeSelected == 0) {
                            this.onRecordSelection(this.EngineerManagementList[0].EngineerId);

                        }
                        else {
                            this.onRecordSelection(UserIdToBeSelected);
                        }
                    }
                    else {
                        this.addRecord();
                    }
                }
                else {
                    this.addRecord();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }


    editRecord() {
        this.hideInput = true;
        this.hideText = false;
        this.engineerManagementForm.reset();
        this.engineerManagementForm.setErrors(null);
        this.engineerManagementForm.patchValue(this.selectedEngineerManagementRecord);
    }

    deleteRecord() {
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let recordId = this.selectedEngineerManagementRecord.EngineerId;
                this.engineerManagementServiceObj.deleteEngineerManagement(recordId, userDetails.UserID).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });

                    this.getEngineerManagement(0);
                });
            },
            reject: () => {
            }
        });
    }

    onRecordSelection(engineerId: number) {
        this.engineerManagementServiceObj.getEngineerDetails(engineerId)
            .subscribe((data: EngineerManagementModel) => {
                this.selectedEngineerManagementRecord = data;   //check with null exception
                this.engineerManagementForm.patchValue(data);
                this.showRightPanelLoadingIcon = false;
                this.hideText = true;
                this.hideInput = false;
            }, (error) => {
                this.hideText = true;
                this.hideInput = false;
                this.showRightPanelLoadingIcon = false;
            });
    }

    pageChange(currentPageNumber: any) {
        this.EngineerManagementPagerConfig.RecordsToSkip = this.EngineerManagementPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getEngineerManagement(0);
    }

    openDialog() {
        this.initDone = true;
        if (this.engineerRef != undefined) {
            this.engineerRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.engineerRef.nativeElement, 'focus');
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    resetFilters() {
        this.engineerManagementFilterInfoForm.get('EngineerName').setValue("");
        this.engineerManagementFilterInfoForm.get('EngineerCode').setValue("");
        this.engineerManagementFilterInfoForm.get('JobCategory').setValue("");
        this.engineerManagementFilterInfoForm.get('Facility').setValue("");
        this.filterMessage = "";
        this.filteredEngineer = this.EngineerManagementList;
        if (this.filteredEngineer.length > 0) {
            this.getEngineerManagement(0);
        }

        this.isFilterApplied = false;
        if (this.engineerRef != undefined) {
            this.engineerRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.engineerRef.nativeElement, 'focus');
        }
    }

    onSearchInputChange(event: any) {
        if (this.engineerSearchKey != "") {
            if (this.engineerSearchKey.length >= 3) {
                this.getAllSearchEngineer(this.engineerSearchKey, 0);
            }
        }
        else {
            this.getEngineerManagement(0);
        }
    }


    getAllSearchEngineer(searchKey: string, userIdToBeSelected: number) {
        let engineerListInput = {
            Skip: 0,
            Take: this.EngineerManagementPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId: this.companyId
        };
        this.engineerManagementServiceObj.getEngineerManagement(engineerListInput)
            .subscribe((data: EngineerManagementDisplayResult) => {
                this.EngineerManagementList = data.EngineerManagementList
                this.EngineerManagementPagerConfig.TotalRecords = data.TotalRecords
                if (this.EngineerManagementList.length > 0) {
                    if (userIdToBeSelected === 0) {
                        this.onRecordSelection(this.EngineerManagementList[0].EngineerId);
                    }
                    else {
                        this.onRecordSelection(userIdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            });
    }

    filterData() {

        let name = "";
        let engineerCode = "";
        let jobCategory = "";
        let facility = "";
        this.filterMessage = "";

        if (this.engineerManagementFilterInfoForm.get('EngineerName').value != "") {
            name = this.engineerManagementFilterInfoForm.get('EngineerName').value;
        }

        if (this.engineerManagementFilterInfoForm.get('EngineerCode').value != "") {
            engineerCode = this.engineerManagementFilterInfoForm.get('EngineerCode').value;
        }

        if (this.engineerManagementFilterInfoForm.get('JobCategory').value != "") {
            jobCategory = this.engineerManagementFilterInfoForm.get('JobCategory').value;
        }

        if (this.engineerManagementFilterInfoForm.get('Facility').value != "") {
            facility = this.engineerManagementFilterInfoForm.get('Facility').value;
        }

        if (name === '' && jobCategory === '' && facility === '' && engineerCode === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        let engineerManagementFilterDisplayInput: EngineerManagementFilterDisplayInput = {
            Skip: this.EngineerManagementPagerConfig.RecordsToSkip,
            Take: this.EngineerManagementPagerConfig.RecordsToFetch,
            NameFilter: name,
            EngineerCodeFilter: engineerCode,
            JobCategoryFilter: jobCategory,
            FacilityFilter: facility,
            CompanyId: this.companyId
        };
        this.engineerManagementServiceObj.getEngineerManagementFilter(engineerManagementFilterDisplayInput)

            .subscribe((data: EngineerManagementDisplayResult) => {
                if (data.TotalRecords > 0) {
                    this.isFilterApplied = true;
                    if (open) {
                        this.initDone = false;
                    }

                    this.EngineerManagementPagerConfig.TotalRecords = data.TotalRecords;
                    this.EngineerManagementList = data.EngineerManagementList;
                    this.onRecordSelection(this.EngineerManagementList[0].EngineerId);
                }
                else {
                    this.filterMessage = "No matching records are found";
                }
            }, (error) => {

                this.hideText = false;
                this.hideInput = true;
            });

    }

    openSettingsMenu() {
        this.initSettingsDone = true;
    }
    onClickedOutside(e: Event) {
      //  this.showfilters= false; 
        if(this.showfilters == false){ 
          //  this.showfilterstext="Show List"
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

    matselect(event) {
        if (event.checked) {
            this.slideActive = true;
        }
        else {
            this.slideActive = false;
        }
    }


}
