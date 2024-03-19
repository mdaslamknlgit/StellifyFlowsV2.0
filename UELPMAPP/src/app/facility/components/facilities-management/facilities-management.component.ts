import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { FacilityManagementModel, FacilityManagementDisplayResult, FacilityManagementList, TenantCustomer, OwnerCustomer } from '../../models/facility-management.model';
import { SharedService } from '../../../shared/services/shared.service';
import { GridDisplayInput, ResponseStatusTypes, Messages, ResponseMessage, MessageTypes, UserDetails, PagerConfig } from '../../../shared/models/shared.model';
import { FacilityManagementService } from '../../services/facility-management.service';
import { ConfirmationService } from 'primeng/components/common/api';
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { Customer } from '../../../administration/models/customer';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SupplierApiService } from '../../../po/services/supplier-api.service';
import { NUMBER_PATERN } from '../../../shared/constants/generic';


@Component({
    selector: 'app-facilities-management',
    templateUrl: './facilities-management.component.html',
    styleUrls: ['./facilities-management.component.css'],
    providers: [FacilityManagementService]
})
export class FacilitiesManagementComponent implements OnInit {

    FacilityPagerConfig: PagerConfig;   // facilityPagerConfig
    FacilityManagementList: Array<FacilityManagementList> = [];
    savedsucess: boolean = false;
    hidealert: boolean = false;
    leftsection: boolean = false;   // leftSection
    rightsection: boolean = false;
    slideactive: boolean = false;
    signupForm: FormGroup;

    results: Array<Customer> = [];
    formSubmitAttempt: boolean = false;
    recordsToSkip: number = 0;
    recordsToFetch: number = 10;
    totalRecords: number = 0;
    hidetext?: boolean = null;
    hideinput?: boolean = null;
    hideowner?: boolean = null;
    hidetenant?: boolean = null;
    selectedFacilityManagementRecord: FacilityManagementModel;
    facilitySearchKey: string = null;
    scrollbarOptions: any;
    companyId: number;
    facilityId: number = 0;
    FacilityFilterInfoForm: FormGroup;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('unitCode') private facilityRef: any;
    initDone = false;
    isFilterApplied: boolean = false;
    filteredFacility = [];
    filterMessage: string = "";
    initSettingsDone = true;
    showRightPanelLoadingIcon: boolean = false;
    showLeftPanelLoadingIcon: boolean = false;
    ownerId: number;
    ownerName: string;
    tenantId: number;
    tenantName: string;
    countries = [];
    checkOwner: number;
    checkTenant: number;
    ownerdetails: OwnerCustomer;
    tenantdetails: TenantCustomer;
    showfilters:boolean=false;
    showfilterstext:string="Show List" ;

    constructor(private sharedServiceObj: SharedService, private facilityManagementServiceObj: FacilityManagementService, public sessionService: SessionStorageService,
        private confirmationServiceObj: ConfirmationService, private formBuilderObj: FormBuilder, private renderer: Renderer,
        private supplierApiService: SupplierApiService) {
        this.companyId = this.sessionService.getCompanyId();

    }

    ngOnInit() {
        //this.specifiedparameter();
        let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();
        let userid = userDetails.UserID;
        this.FacilityPagerConfig = new PagerConfig();
        this.FacilityPagerConfig.RecordsToSkip = 0;
        this.selectedFacilityManagementRecord = new FacilityManagementModel();

        this.FacilityPagerConfig.RecordsToFetch = 100;
        this.signupForm = this.formBuilderObj.group({    //facilityForm
            'UnitNumber': [null, [Validators.required]],
            'OwnerName': [null, [Validators.required]],
            'OwnerDetails': [null, { validators: [Validators.required] }],
            'OwnerEmail': [null, [Validators.required]],
            'OwnerBillingAddress': ["", Validators.required],
            'OwnerBillingCountryId': ["", Validators.required],
            'OwnerCity': ["", Validators.required],
            'OwnerContactNo': ["", { validators: [Validators.pattern(NUMBER_PATERN), Validators.required, Validators.maxLength(12)] }],
            'TenantDetails': [null, { validators: [Validators.required] }],
            'TenantName': [null, Validators.required],
            'TenantEmail': ["", Validators.required],
            'TenantBillingAddress': [null, [Validators.required]],
            'TenantBillingCountryId': ["", Validators.required],
            'TenantCity': ["", Validators.required],
            'TenantContactNo': ["", { validators: [Validators.pattern(NUMBER_PATERN), Validators.required, Validators.maxLength(12)] }],
        });

        this.FacilityFilterInfoForm = this.formBuilderObj.group({
            UnitNo: [''],
            Owner: [''],
            Tenant: ['']
        });

        this.getCountries();
        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                this.getfacilityManagement(0);
            });

        this.getfacilityManagement(0);
    }

    showFullScreen() {
        FullScreen(this.rightPanelRef.nativeElement);
    }

    getCountries(): void {
        let countriesResult = <Observable<Array<any>>>this.supplierApiService.getCountries();
        countriesResult.subscribe((data) => {
            this.countries = data;
        });
    }

    customerInputFormater = (x: OwnerCustomer) => x.OwnerName;  // change name here
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    customerSearch = (text$: Observable<string>) =>   // change name here
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term => {
                return this.facilityManagementServiceObj.getOwnerForfacility({
                    searchKey: term,
                    CompanyId: this.companyId,
                    customerCategoryId: 1
                }).map((data: Array<any>) => {
                    this.hideowner = false;
                    data.forEach((item, index) => {
                        item.index = index;
                    });
                    if (data.length == 0 && term != "") {
                        this.hideowner = true;
                    }
                    return data;
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            })
        );

    tenantInputFormater = (x: TenantCustomer) => x.TenantName;
    //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
    tenantSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.facilityManagementServiceObj.getTenantForfacility({
                    searchKey: term,
                    CompanyId: this.companyId,
                    customerCategoryId: 2
                }).map((data: Array<any>) => {
                    this.hidetenant = false;
                    data.forEach((item, index) => {
                        item.index = index;
                        if (data.length == 0 && term != "") {
                            this.hidetenant = true;
                        }
                    })
                    return data;
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
        );

    newOwner() {
        this.hideowner = true;
        this.checkOwner = 1;
        this.ownerId = 0;
        this.ownerName = "";
        this.signupForm.get('OwnerDetails').setValue(new OwnerCustomer());
        this.signupForm.get('OwnerName').setValue(null, { Validators: [Validators.required] });
        this.signupForm.get('OwnerName').enable();
        this.signupForm.get('OwnerEmail').enable();
        this.signupForm.get('OwnerBillingAddress').enable();
        this.signupForm.get('OwnerBillingCountryId').enable();
        this.signupForm.get('OwnerCity').enable();
        this.signupForm.get('OwnerContactNo').enable();

        //this.signupForm.get('OwnerName').setValue('');
        this.signupForm.get('OwnerEmail').setValue('');
        this.signupForm.get('OwnerBillingAddress').setValue('');
        this.signupForm.get('OwnerBillingCountryId').setValue('');
        this.signupForm.get('OwnerCity').setValue('');
        this.signupForm.get('OwnerContactNo').setValue('');
    }

    existingOwner() {
        this.hideowner = false;
        this.checkOwner = 0;
    }

    newTenant() {
        this.hidetenant = true;
        this.checkTenant = 1;
        this.tenantId = 0;
        this.tenantName = "";
        this.signupForm.get('TenantDetails').setValue(new TenantCustomer());
        this.signupForm.get('TenantName').setValue('', { Validators: [Validators.required] });
        this.signupForm.get('TenantName').enable();
        this.signupForm.get('TenantEmail').enable();
        this.signupForm.get('TenantBillingAddress').enable();
        this.signupForm.get('TenantBillingCountryId').enable();
        this.signupForm.get('TenantCity').enable();
        this.signupForm.get('TenantContactNo').enable();

        this.signupForm.get('TenantEmail').setValue('');
        this.signupForm.get('TenantBillingAddress').setValue('');
        this.signupForm.get('TenantBillingCountryId').setValue('');
        this.signupForm.get('TenantCity').setValue('');
        this.signupForm.get('TenantContactNo').setValue('');
    }

    existingTenant() {
        this.hidetenant = false;
        this.checkTenant = 1;
    }

//remove commented code
    //  search(event) {
    //         
    //         this.sharedServiceObj.getAllCustomerForfacility({
    //             searchKey:event.query,
    //             CompanyId:this.companyId,
    //             customerCategoryId:2
    //         }).subscribe((data:Array<any>) => {
    //             // this.results = data;
    //             // console.log(data);
    //             // for(let i = 0; i < data.length; i++) {
    //             //     let brand = data[i];
    //             //     if(brand.index(event.query) == i) {
    //             //         this.results.push(brand);
    //             //     }
    //             // }
    //             data.forEach((item,index)=>{
    //                 item.index= index;
    //             });


    //         });
    //     }




    onCustomerChange(event?: any) {

        if (event != null && event != undefined) {
            this.ownerdetails = event.item;
            this.ownerId = event.item.CustomerId;
            this.ownerName = event.item.OwnerName;
            this.signupForm.patchValue({
                'OwnerEmail': event.item.CustomerEmail,
                'OwnerBillingAddress': event.item.BillingAddress,
                'OwnerBillingCountryId': event.item.BillingCountryId,
                'OwnerCity': event.item.BillingCity,
                'OwnerContactNo': event.item.BillingTelephone
            });

            this.signupForm.get('OwnerEmail').disable();
            this.signupForm.get('OwnerBillingAddress').disable();
            this.signupForm.get('OwnerBillingCountryId').disable();
            this.signupForm.get('OwnerCity').disable();
            this.signupForm.get('OwnerContactNo').disable();
            this.signupForm.get('OwnerName').setValue('');
        }
    }

    onTenantChange(event?: any) {
        if (event != null && event != undefined) {
            this.tenantdetails = event.item;
            this.tenantId = event.item.CustomerId;
            this.tenantName = event.item.TenantName;
            this.signupForm.patchValue({
                'TenantEmail': event.item.CustomerEmail,
                'TenantBillingAddress': event.item.BillingAddress,
                'TenantBillingCountryId': event.item.BillingCountryId,
                'TenantCity': event.item.BillingCity,
                'TenantContactNo': event.item.BillingTelephone
            });
            this.signupForm.get('TenantEmail').disable();
            this.signupForm.get('TenantBillingAddress').disable();
            this.signupForm.get('TenantBillingCountryId').disable();
            this.signupForm.get('TenantCity').disable();
            this.signupForm.get('TenantContactNo').disable();
            this.signupForm.get('TenantName').setValue('');
        }
    }

    onRecordSelection(facilityId: number) {
        this.facilityManagementServiceObj.getfacilityDetails(facilityId)
            .subscribe((data: FacilityManagementModel) => {
                this.selectedFacilityManagementRecord = data;
                //this.facilityId =  this.selectedFacilityManagementRecord.FacilityId;                 
                this.signupForm.patchValue(data);
                this.showRightPanelLoadingIcon = false;
                this.hidetext = true;
                this.hideinput = false;
                this.hideowner = false;
                this.hidetenant = false;
                this.showRightPanelLoadingIcon = false;
                // this.hideowner=false;
            }, (error) => {
                this.hidetext = true;
                this.hideinput = false;
                this.hideowner = false;
                this.hidetenant = false;
                //this.hideowner=false;
                this.showRightPanelLoadingIcon = false;
            });
    }

    openDialog() {
        this.initDone = true;
        if (this.facilityRef != undefined) {
            this.facilityRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.facilityRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }
    resetFilters() {
        this.FacilityFilterInfoForm.get('UnitNo').setValue("");
        this.FacilityFilterInfoForm.get('Owner').setValue("");
        this.FacilityFilterInfoForm.get('Tenant').setValue("");
        this.filterMessage = "";
        this.filteredFacility = this.FacilityManagementList;
        if (this.filteredFacility.length > 0) {
            this.getfacilityManagement(0);
        }

        this.isFilterApplied = false;
        if (this.facilityRef != undefined) {
            this.facilityRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.facilityRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    openSettingsMenu() {
        this.initSettingsDone = true;
    }

    filterData() {
        let unitCode = "";
        let owner = "";
        let tenant = "";
        this.filterMessage = "";
        if (this.FacilityFilterInfoForm.get('UnitNo').value != "") {
            unitCode = this.FacilityFilterInfoForm.get('UnitNo').value;
        }

        if (this.FacilityFilterInfoForm.get('Owner').value != "") {
            owner = this.FacilityFilterInfoForm.get('Owner').value;
        }

        if (this.FacilityFilterInfoForm.get('Tenant').value != "") {
            tenant = this.FacilityFilterInfoForm.get('Tenant').value;
        }

        if (unitCode === '' && owner === "" && tenant === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        if (unitCode != '' && owner != "" && tenant != '') {
            this.filteredFacility = this.FacilityManagementList.filter(x => x.UnitNumber.toLowerCase().indexOf(unitCode.toLowerCase()) !== -1 && x.OwnerName.toLowerCase().indexOf(owner.toLowerCase()) !== -1 && (x.TenantName.toLowerCase().indexOf(tenant.toLowerCase()) !== -1));
        }

        if (unitCode != '' && owner === "" && tenant === '') {
            this.filteredFacility = this.FacilityManagementList.filter(x => x.UnitNumber.toLowerCase().indexOf(unitCode.toLowerCase()) !== -1);
        }

        if (unitCode != '' && owner != "" && tenant === '') {
            this.filteredFacility = this.FacilityManagementList.filter(x => x.UnitNumber.toLowerCase().indexOf(unitCode.toLowerCase()) !== -1 && x.OwnerName.toLowerCase().indexOf(owner.toLowerCase()) !== -1);
        }

        if (unitCode === '' && owner != "" && tenant != '') {
            this.filteredFacility = this.FacilityManagementList.filter(x => x.OwnerName.toLowerCase().indexOf(owner.toLowerCase()) !== -1 && (x.TenantName.toLowerCase().indexOf(tenant.toLowerCase()) !== -1));
        }

        if (unitCode === '' && owner === "" && tenant != '') {
            this.filteredFacility = this.FacilityManagementList.filter(x => x.TenantName.toLowerCase().indexOf(tenant.toLowerCase()) !== -1);
        }


        if (unitCode != '' && owner === "" && tenant != '') {
            this.filteredFacility = this.FacilityManagementList.filter(x => x.TenantName.toLowerCase().indexOf(tenant.toLowerCase()) !== -1 && x.UnitNumber.toLowerCase().indexOf(unitCode.toLowerCase()) !== -1);
        }


        if (unitCode === '' && owner != "" && tenant === '') {
            this.filteredFacility = this.FacilityManagementList.filter(x => x.OwnerName.toLowerCase().indexOf(owner.toLowerCase()) !== -1);
        }


        if (this.filteredFacility.length > 0) {
            this.FacilityManagementList = this.filteredFacility;
            this.selectedFacilityManagementRecord.FacilityId = this.FacilityManagementList[0].FacilityId;
            this.onRecordSelection(this.FacilityManagementList[0].FacilityId);
            this.isFilterApplied = true;
            if (open) {
                this.initDone = false;
            }
        }
        else {
            this.filterMessage = "No matching records are found";
        }
    }

    getfacilityManagement(FacilityIdToBeSelected: number) {
        let displayInput = {
            Skip: this.FacilityPagerConfig.RecordsToSkip,
            Take: this.FacilityPagerConfig.RecordsToFetch,
            Search: "",
            CompanyId: this.companyId
        };
        this.facilityManagementServiceObj.getFacilityManagement(displayInput)
            .subscribe((data: FacilityManagementDisplayResult) => {
                //
                this.FacilityManagementList = data.FacilityManagementList;
                this.FacilityPagerConfig.TotalRecords = data.TotalRecords;
                this.showLeftPanelLoadingIcon = false;
                if (this.FacilityManagementList.length > 0) {
                    if (FacilityIdToBeSelected == 0) {
                        this.onRecordSelection(this.FacilityManagementList[0].FacilityId);

                    }
                    else {
                        this.onRecordSelection(FacilityIdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            }, (error) => {
                this.showLeftPanelLoadingIcon = false;
            });
    }

    addRecord() {
        this.hidetext = false;
        this.hideinput = true;
        this.hideowner = false;
        this.hidetenant = false;
        this.checkOwner = 0;
        this.checkTenant = 0;
        this.selectedFacilityManagementRecord = new FacilityManagementModel();
        this.signupForm.reset();
        this.signupForm.setErrors(null);
        //this.signupForm.get('BillingAddress').enable();
        this.showfilters =false;
        this.showfilterstext="Show List" ;
    }

    cancelRecord() {
        this.signupForm.reset();
        this.signupForm.setErrors(null);
        this.formSubmitAttempt = false;
        if (this.FacilityManagementList.length > 0 && this.selectedFacilityManagementRecord != undefined) {
            if (this.selectedFacilityManagementRecord.FacilityId == undefined || this.selectedFacilityManagementRecord.FacilityId == 0) {
                this.onRecordSelection(this.FacilityManagementList[0].FacilityId);
            }
            else {
                this.onRecordSelection(this.selectedFacilityManagementRecord.FacilityId);
            }
            //setting this variable to true so as to show the purchase details
            this.hideinput = false;
            this.hidetext = true;
            this.hideowner = false;
            this.hidetenant = false;
            // this.hideowner=false;
        }
        else {
            this.hideinput = null;
            this.hidetext = null;
            this.hideowner = null;
            this.hidetenant = null;
            //this.hideowner=null;
        }
    }

    saveRecord() {
        this.formSubmitAttempt = true;
        if (this.ownerId > 0) {
            this.signupForm.get('OwnerEmail').enable();
            this.signupForm.get('OwnerBillingAddress').enable();
            this.signupForm.get('OwnerBillingCountryId').enable();
            this.signupForm.get('OwnerCity').enable();
            this.signupForm.get('OwnerContactNo').enable();
            this.signupForm.get('OwnerName').setValue(this.ownerName);
        }
        if (this.tenantId > 0) {
            this.signupForm.get('TenantEmail').enable();
            this.signupForm.get('TenantBillingAddress').enable();
            this.signupForm.get('TenantBillingCountryId').enable();
            this.signupForm.get('TenantCity').enable();
            this.signupForm.get('TenantContactNo').enable();
            this.signupForm.get('TenantName').setValue(this.tenantName);
        }
        console.log(this.signupForm.value);
        let facilitymanagementFormStatus = this.signupForm.status;
        if (facilitymanagementFormStatus != "INVALID") {
            let facilitymanagementDetails: FacilityManagementModel = this.signupForm.value;
            let userDetails: UserDetails = <UserDetails>this.sessionService.getUser();

            facilitymanagementDetails.CreatedBy = userDetails.UserID;
            facilitymanagementDetails.CompanyId = this.companyId;
            facilitymanagementDetails.OwnerId = this.ownerId;
            facilitymanagementDetails.TenantId = this.tenantId;
            console.log(this.signupForm.value);

            if (this.selectedFacilityManagementRecord.FacilityId == 0 || this.selectedFacilityManagementRecord.FacilityId == null) {
                facilitymanagementDetails.FacilityId = 0;
                this.facilityManagementServiceObj.createFacilityManagement(facilitymanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.hideowner = false;
                        this.hidetenant = false;
                        //this.hideowner=false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        this.getfacilityManagement(response.Value);
                    }
                    else if (response.Status == "Duplicate UnitNumber") {
                        this.signupForm.get('UnitNumber').setErrors({
                            'DuplicateUnit': true
                        });
                        if (this.ownerId > 0) {
                            this.signupForm.get('OwnerName').setValue(this.ownerdetails);
                            this.signupForm.get('OwnerEmail').disable();
                            this.signupForm.get('OwnerBillingAddress').disable();
                            this.signupForm.get('OwnerBillingCountryId').disable();
                            this.signupForm.get('OwnerCity').disable();
                            this.signupForm.get('OwnerContactNo').disable();
                        }
                        if (this.tenantId > 0) {
                            this.signupForm.get('TenantName').setValue(this.tenantdetails);
                            this.signupForm.get('TenantEmail').disable();
                            this.signupForm.get('TenantBillingAddress').disable();
                            this.signupForm.get('TenantBillingCountryId').disable();
                            this.signupForm.get('TenantCity').disable();
                            this.signupForm.get('TenantContactNo').disable();
                        }
                    }
                    // else if(response.Status == "Duplicate OwnerName")
                    // {
                    //     this.signupForm.get('OwnerName').setErrors({
                    //         'DuplicateName':true
                    //     });
                    // }
                });
            }
            else {
                facilitymanagementDetails.FacilityId = this.selectedFacilityManagementRecord.FacilityId;

                this.facilityManagementServiceObj.updateFacilityManagement(facilitymanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {
                        this.hidetext = true;
                        this.hideinput = false;
                        this.hideowner = false;
                        this.hidetenant = false;
                        //this.hideowner=false;
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;

                        this.getfacilityManagement(facilitymanagementDetails.FacilityId);

                    }
                    else if (response.Status == "Duplicate UnitNumber") {
                        this.signupForm.get('UnitNumber').setErrors({
                            'DuplicateUnit': true
                        });
                        if (this.ownerId > 0) {
                            this.signupForm.get('OwnerName').setValue(this.ownerdetails);
                            this.signupForm.get('OwnerEmail').disable();
                            this.signupForm.get('OwnerBillingAddress').disable();
                            this.signupForm.get('OwnerBillingCountryId').disable();
                            this.signupForm.get('OwnerCity').disable();
                            this.signupForm.get('OwnerContactNo').disable();
                        }
                        if (this.tenantId > 0) {
                            this.signupForm.get('TenantName').setValue(this.tenantdetails);
                            this.signupForm.get('TenantEmail').disable();
                            this.signupForm.get('TenantBillingAddress').disable();
                            this.signupForm.get('TenantBillingCountryId').disable();
                            this.signupForm.get('TenantCity').disable();
                            this.signupForm.get('TenantContactNo').disable();
                        }
                    }
                    // else if(response.Status == "Duplicate OwnerName")
                    // {
                    //     this.signupForm.get('OwnerName').setErrors({
                    //         'DuplicateName':true
                    //     });
                    // }
                });
            }
        }
        else {
            if (this.ownerId > 0) {
                this.signupForm.get('OwnerName').setValue(this.ownerdetails);
                this.signupForm.get('OwnerEmail').disable();
                this.signupForm.get('OwnerBillingAddress').disable();
                this.signupForm.get('OwnerBillingCountryId').disable();
                this.signupForm.get('OwnerCity').disable();
                this.signupForm.get('OwnerContactNo').disable();
            }
            if (this.tenantId > 0) {
                this.signupForm.get('TenantName').setValue(this.tenantdetails);
                this.signupForm.get('TenantEmail').disable();
                this.signupForm.get('TenantBillingAddress').disable();
                this.signupForm.get('TenantBillingCountryId').disable();
                this.signupForm.get('TenantCity').disable();
                this.signupForm.get('TenantContactNo').disable();
            }


            Object.keys(this.signupForm.controls).forEach((key: string) => {
                if (this.signupForm.controls[key].status == "INVALID" && this.signupForm.controls[key].touched == false) {
                    this.signupForm.controls[key].markAsTouched();
                }
            });
        }
    }



    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }

    editRecord() {
        this.hideinput = true;
        this.hidetext = false;
        this.hideowner = false;
        this.hidetenant = false;
        this.signupForm.reset();
        this.signupForm.setErrors(null);
        this.signupForm.patchValue(this.selectedFacilityManagementRecord);
        this.ownerId = this.selectedFacilityManagementRecord.OwnerId;
        this.tenantId = this.selectedFacilityManagementRecord.TenantId;
        this.ownerName = this.selectedFacilityManagementRecord.OwnerName;
        this.tenantName = this.selectedFacilityManagementRecord.TenantName;

        this.signupForm.get('OwnerEmail').disable();
        this.signupForm.get('OwnerBillingAddress').disable();
        this.signupForm.get('OwnerBillingCountryId').disable();
        this.signupForm.get('OwnerCity').disable();
        this.signupForm.get('OwnerContactNo').disable();

        this.signupForm.get('TenantEmail').disable();
        this.signupForm.get('TenantBillingAddress').disable();
        this.signupForm.get('TenantBillingCountryId').disable();
        this.signupForm.get('TenantCity').disable();
        this.signupForm.get('TenantContactNo').disable();

        console.log(this.selectedFacilityManagementRecord);


    }

    onSearchInputChange(event: any) {   // remove event
        if (this.facilitySearchKey != "") {
            if (this.facilitySearchKey.length >= 3) {
                this.getAllSearchFacility(this.facilitySearchKey, 0);
            }
        }
        else {
            this.getfacilityManagement(0);
        }
    }


    getAllSearchFacility(searchKey: string, facilityIdToBeSelected: number) {
        //getting the list of purchase orders...
        let creditNoteListInput = {
            Skip: 0,
            Take: this.FacilityPagerConfig.RecordsToFetch,
            Search: searchKey,
            CompanyId: this.companyId
        };
        this.facilityManagementServiceObj.getFacilityManagement(creditNoteListInput)
            .subscribe((data: FacilityManagementDisplayResult) => {
                this.FacilityManagementList = data.FacilityManagementList
                this.FacilityPagerConfig.TotalRecords = data.TotalRecords
                if (this.FacilityManagementList.length > 0) {
                    if (facilityIdToBeSelected === 0) {
                        this.onRecordSelection(this.FacilityManagementList[0].FacilityId);
                    }
                    else {
                        this.onRecordSelection(facilityIdToBeSelected);
                    }
                }
                else {
                    this.addRecord();
                }
            });
    }


    deleteRecord() {
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let recordId = this.selectedFacilityManagementRecord.FacilityId;
                this.facilityManagementServiceObj.deleteFacilityManagement(recordId).subscribe((data) => {
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.DeletedSuccessFully,
                        MessageType: MessageTypes.Success
                    });

                    this.getfacilityManagement(0);
                });
            },
            reject: () => {
            }
        });
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

    matselect(event) {
        if (event.checked == true) {
            this.slideactive = true;
        }
        else {
            this.slideactive = false;
        }
    }

    pageChange(currentPageNumber: any) {
        this.FacilityPagerConfig.RecordsToSkip = this.FacilityPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getfacilityManagement(0);
    }
}
