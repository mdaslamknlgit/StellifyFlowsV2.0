import { Component, OnInit, Renderer, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { PagerConfig, Messages, MessageTypes, ResponseStatusTypes, UserDetails } from '../../../shared/models/shared.model';
import { DepartmentManagement, DepartmentManagementDisplayResult } from '../../models/department';
import { DepartmentApiService } from '../../services/department-api.service';
import { FullScreen } from '../../../shared/shared';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
    selector: 'app-department',
    templateUrl: './department.component.html',
    styleUrls: ['./department.component.css'],
    providers: [DepartmentApiService]
})
export class DepartmentComponent implements OnInit {

    departmentPagerConfig: PagerConfig;
    departmentManagementList: Array<DepartmentManagement> = [];
    selectedDepartmentManagementRecord: DepartmentManagement;
    slideactive: number = 0;
    recordsToSkip: number = 0;
    recordsToFetch: number = 100;
    totalRecords: number = 0;
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    departmentFilterInfoForm: FormGroup;
    filterMessage: string = "";
    initSettingsDone = true;
    showRightPanelLoadingIcon: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    initDone = false;
    scrollbarOptions: any;
    isFilterApplied: boolean = false;
    departmentForm: FormGroup;
    formSubmitAttempt: boolean = false;
    leftsection: boolean = false;
    rightsection: boolean = false;
    filteredDepartment = [];
    departmentSearchKey: string = null;
    companyId: number;
    newPermission: boolean;
    editPermission: boolean;
    showfilters: boolean = true;
    showfilterstext: string = "Hide List";
    FormMode: string;
    DeptId: any;

    public innerWidth: any;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('userName') private userRef: any;


    constructor(private formBuilderObj: FormBuilder,
        private router: Router,
        private departmentApiServiceObj: DepartmentApiService,
        private confirmationServiceObj: ConfirmationService,
        private sharedServiceObj: SharedService,
        public sessionService: SessionStorageService,
        public activatedRoute: ActivatedRoute,
        private renderer: Renderer) {
        this.companyId = this.sessionService.getCompanyId();

    }

    ngOnInit() {

        this.departmentForm = this.formBuilderObj.group({
            'Name': [null, { validators: [Validators.required] }],
            'Code': [null, [Validators.required]],
            'Description': [""],
            'IsDeleted': [null, [Validators.required]]
            // 'IsDepartment': 0,

        });
        //getting role access levels  
        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            if (param.get('mode') != undefined) {
                this.FormMode = param.get('mode');
            }
            if (param.get('Id') != undefined) {
                this.DeptId = param.get('Id');
            }


        });
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "department")[0];

            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
        }
        this.departmentPagerConfig = new PagerConfig();
        this.departmentPagerConfig.RecordsToSkip = 0;
        this.selectedDepartmentManagementRecord = new DepartmentManagement();
        this.departmentPagerConfig.RecordsToFetch = 100;



        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                //this.getDepartment(0);
            });

        if(this.FormMode=="EDIT")
        {
            this.getDepartment(this.DeptId);
        }
        this.showfilters = false;
        this.showfilterstext = "Hide List";
    }

    matselect(event) {
        if (event.checked == 1) {
            this.slideactive = 0;
        }
        else {
            this.slideactive = 1;
        }
    }

    retrievematselect(event) {
        if (event == 1) {
            this.slideactive = 0;
        }
        else {
            this.slideactive = 1;
        }
    }

    getDepartment(locationId: number) {
        this.split();
        this.departmentApiServiceObj.getDepartmentDetails(locationId)
            .subscribe((data: DepartmentManagement) => {
                debugger;
                this.selectedDepartmentManagementRecord = data;
                this.departmentForm.patchValue(data);
                this.showRightPanelLoadingIcon = false;
                this.hidetext = true;
                this.hideinput = false;
            }, (error) => {
                this.hidetext = true;
                this.hideinput = false;
                this.showRightPanelLoadingIcon = false;
            });
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

    addRecord() {

        this.innerWidth = window.innerWidth;
        if (this.innerWidth < 550) {
            $(".leftdiv").addClass("hideleftcol");
            $(".rightPanel").addClass("showrightcol");
        }

        this.hidetext = false;
        this.hideinput = true;
        this.selectedDepartmentManagementRecord = new DepartmentManagement();
        this.departmentForm.reset();
        this.departmentForm.setErrors(null);
        this.departmentForm.patchValue({
            // IsDepartment:0            
            IsDeleted: 0
        });
        this.showfilters = false;
        this.showfilterstext = "Hide List";
    }

    editRecord() {
        this.hideinput = true;
        this.hidetext = false;
        this.departmentForm.reset();
        this.departmentForm.setErrors(null);
        console.log(this.selectedDepartmentManagementRecord);
        this.departmentForm.patchValue(this.selectedDepartmentManagementRecord);
        // this.matselect(this.selectedDepartmentManagementRecord.IsDepartment)
        //this.retrievematselect(this.selectedDepartmentManagementRecord.IsDeleted)
    }

    cancelRecord() {
        this.router.navigate([`/admin/departments/`]);
    }


    deleteRecord() {
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let recordId = this.selectedDepartmentManagementRecord.LocationId;
                this.departmentApiServiceObj.deleteDepartment(recordId, userDetails.UserID).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });

                    this.getDepartment(0);
                });
            },
            reject: () => {
            }
        });
    }


    saveRecord() {
        console.log(this.departmentForm.value);
        let departmentFormStatus = this.departmentForm.status;
        if (departmentFormStatus != "INVALID") {
            if (this.departmentForm.get('Name').value.trim() == "" || this.departmentForm.get('Name').value.trim() == null) {
                this.departmentForm.get('Name').setErrors({
                    'EmptyDepartment': true
                });
                return;
            }
            if (this.departmentForm.get('Code').value.trim() == "" || this.departmentForm.get('Code').value.trim() == null) {
                this.departmentForm.get('Code').setErrors({
                    'EmptyCode': true
                });
                return;
            }
            let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
            let departmentmanagementDetails: DepartmentManagement = this.departmentForm.value;

            //   departmentmanagementDetails.IsDepartment=departmentmanagementDetails.IsDepartment==1?1:0;
            departmentmanagementDetails.IsDeleted = departmentmanagementDetails.IsDeleted == 1 ? 1 : 0;
            departmentmanagementDetails.CreatedBy = userDetails.UserID;
            departmentmanagementDetails.CompanyId = this.companyId;
            console.log(departmentmanagementDetails);

            if (this.selectedDepartmentManagementRecord.LocationId == 0 || this.selectedDepartmentManagementRecord.LocationId == null) {
                departmentmanagementDetails.LocationId = 0;
                this.departmentApiServiceObj.createDepartment(departmentmanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        this.getDepartment(response.Value);
                    }
                    else if (response.Status == "Duplicate Department Name") {
                        this.departmentForm.get('Name').setErrors({
                            'DuplicateDepartment': true
                        });
                    }
                });
            }
            else {
                departmentmanagementDetails.LocationId = this.selectedDepartmentManagementRecord.LocationId;

                this.departmentApiServiceObj.updateDepartment(departmentmanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;

                        this.getDepartment(departmentmanagementDetails.LocationId);

                    }
                    else if (response.Status == "Duplicate Department Name") {
                        this.departmentForm.get('Name').setErrors({
                            'DuplicateDepartment': true
                        });
                    }
                });
            }
        }
        else {
            Object.keys(this.departmentForm.controls).forEach((key: string) => {
                if (this.departmentForm.controls[key].status == "INVALID" && this.departmentForm.controls[key].touched == false) {
                    this.departmentForm.controls[key].markAsTouched();
                }
            });
        }
    }


    pageChange(currentPageNumber: any) {
        this.departmentPagerConfig.RecordsToSkip = this.departmentPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getDepartment(0);
        this.showfilters = false;
        this.showfilterstext = "Hide List";
    }

    onClickedOutside(e: Event) {
        //  this.showfilters= false; 
        if (this.showfilters == false) {
            //   this.showfilterstext="Show List"
        }
    }

    split() {
        this.showfilters = !this.showfilters;
        if (this.showfilters == false) {
            this.showfilterstext = "Hide List"
        }
        else {
            this.showfilterstext = "Show List"
        }
    }

    showLeftCol(event) {
        $(".leftdiv").removeClass("hideleftcol");
        $(".rightPanel").removeClass("showrightcol");
    }

    showFullScreen() {
        FullScreen(this.rightPanelRef.nativeElement);
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
