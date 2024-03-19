import { Component, OnInit, ViewChild, Renderer, ElementRef } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ServiceType, ServiceTypeDisplayInput } from '../../models/service-type.model';
import { ServiceTypeAPIService } from '../../services/service-type-api.service';
import { debug } from 'util';
import { ResponseStatusTypes, Messages, ResponseMessage, MessageTypes } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ConfirmationService } from "primeng/components/common/api";
import { FullScreen } from '../../../shared/shared';

@Component({
  selector: 'app-service-type',
  templateUrl: './service-type.component.html',
  styleUrls: ['./service-type.component.css']
})

export class ServiceTypeComponent implements OnInit {
  leftsection: boolean = false;
  rightsection: boolean = false;
  serviceTypes: Array<ServiceType> = [];
  serviceCategories = [];
  selectedServiceTypeRecord: ServiceType;
  recordsToSkip: number = 0;
  recordsToFetch: number = 20;
  totalRecords: number = 0;
  serviceTypeForm: FormGroup;
  isDisplayMode?: boolean = true;
  formSubmitAttempt: boolean = false;
  scrollbarOptions: any;
  @ViewChild('rightPanel') rightPanelRef;
  isSearchApplied: boolean = false;
  filterMessage: string = "";
  initDone = false;
  isFilterApplied: boolean = false;
  public innerWidth: any;
  serviceTypeFilterInfoForm: FormGroup;
  filteredServiceTypes: Array<ServiceType> = [];
 
  @ViewChild("ServiceTypeName") servicetypenameInput: ElementRef;

  constructor(private serviceTypeAPIService: ServiceTypeAPIService,
    private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService,
    private renderer: Renderer,
    private fb: FormBuilder) {

    this.serviceTypeForm = new FormGroup({
      Name: new FormControl("", [Validators.required]),
      ServiceCategoryId: new FormControl(0, [Validators.required]),
      Description: new FormControl(""),
    });

    this.serviceTypeFilterInfoForm = this.fb.group({
      ServiceTypeName: [''],
      ServiceCategory: ['']
    });

    this.initDone = true;
    this.setSelectedRecord();
  }

  ngOnInit() {   
    this.getserviceCategroies();
    this.getServiceTypes();
  }

  setSelectedRecord() {
    this.selectedServiceTypeRecord = {
      ServiceTypeId: 0,
      Name: "",
      Description: "",
      CreatedBy: 0,
      UpdatedBy: 0,
      ServiceCategoryId: 0,
      CreatedDate: null,
      UpdatedDate: null,
      ServiceCategoryName: ""
    };
  }

  getserviceCategroies(): void {
    let serviceCategoriesResult = <Observable<Array<any>>>this.sharedServiceObj.getServiceCategroies();
    serviceCategoriesResult.subscribe((data) => {  
      this.serviceCategories = data;
    });
  }

  getServiceTypes() {
    let displayInput: ServiceTypeDisplayInput = {
      Search: "",
      Skip: this.recordsToSkip,
      Take: this.recordsToFetch
    };

    this.serviceTypeAPIService.getServiceTypes(displayInput)
      .subscribe((data: { ServiceTypes: Array<ServiceType>, TotalRecords: number }) => {
        this.serviceTypes = data.ServiceTypes;
        this.totalRecords = data.TotalRecords;    
        if (this.serviceTypes != undefined && this.serviceTypes.length > 0) {
          this.selectedServiceTypeRecord = this.serviceTypes[0];
        }
        else {
          this.isDisplayMode = false;
          this.setSelectedRecord();
        }
      });
  }

  GetAllSearchServiceTypes(searchString: string): void {
    let displayServiceTypeGrid: ServiceTypeDisplayInput = {
      Search: searchString,
      Skip: this.recordsToSkip,
      Take: this.recordsToFetch
    };

    this.serviceTypeAPIService.GetAllServiceTypes(displayServiceTypeGrid)
      .subscribe((data: { ServiceTypes: Array<ServiceType>, TotalRecords: number }) => {     
        this.serviceTypes = data.ServiceTypes;
        this.filteredServiceTypes = this.serviceTypes;
        this.totalRecords = data.TotalRecords;
        if (this.serviceTypes != undefined && this.serviceTypes.length > 0) {
          this.selectedServiceTypeRecord = this.serviceTypes[0];
        }
        else {
          this.isDisplayMode = true;
        }
      });
  }

  openDialog() {
    this.initDone = true;
    this.servicetypenameInput.nativeElement.focus();
    this.renderer.invokeElementMethod(this.servicetypenameInput.nativeElement, 'focus');
  }

  filterData() {
    let name = "";
    let category = "";
    this.filterMessage = "";
    if (this.serviceTypeFilterInfoForm.get('ServiceTypeName').value != "") {
      name = this.serviceTypeFilterInfoForm.get('ServiceTypeName').value;
    }

    if (this.serviceTypeFilterInfoForm.get('ServiceCategory').value != "") {
      category = this.serviceTypeFilterInfoForm.get('ServiceCategory').value;
    }

    if (name === '' && category === '') {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }
      return;
    }

    if (name != '' && category != '') {
      this.filteredServiceTypes = this.serviceTypes.filter(x => x.Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 && x.ServiceCategoryName === category.toString());
    }

    if (name != '' && category != '') {
      this.filteredServiceTypes = this.serviceTypes.filter(x => x.Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 && x.ServiceCategoryName === category.toString());
    }

    if (name != '' && category === '') {
      this.filteredServiceTypes = this.serviceTypes.filter(x => x.Name.toLowerCase().indexOf(name.toLowerCase()) !== -1);
    }

    if (name === '' && category != '') {
      this.filteredServiceTypes = this.serviceTypes.filter(x => x.ServiceCategoryName.toLowerCase().indexOf(category.toLowerCase()) !== -1);
    }

    if (this.filteredServiceTypes.length > 0) {
      this.totalRecords = this.filteredServiceTypes.length;
      this.serviceTypes = this.filteredServiceTypes;
      this.selectedServiceTypeRecord = this.serviceTypes[0];
      this.isFilterApplied = true;
      if (open) {
        this.initDone = false;
      }

    }
    else {
      this.filterMessage = "No matching records are found";
      this.filteredServiceTypes = this.serviceTypes;
      this.totalRecords = this.filteredServiceTypes.length;
      if (this.filteredServiceTypes.length > 0) {
        this.selectedServiceTypeRecord = this.serviceTypes[0];
      }
    }
  }

  resetData() {
    this.isFilterApplied = false;
    this.initDone = true;
    this.resetFilters();
  }

  resetFilters() {
    this.serviceTypeFilterInfoForm.get('ServiceTypeName').setValue("");
    this.serviceTypeFilterInfoForm.get('ServiceCategory').setValue("");
    this.filterMessage = "";
    this.filteredServiceTypes = this.serviceTypes;
    this.totalRecords = this.filteredServiceTypes.length;
    if (this.serviceTypes.length > 0) {
      this.getServiceTypes();
    }
    else {
      this.isDisplayMode = true;
    }
    this.isFilterApplied = false;
    if (this.servicetypenameInput != undefined) {
      this.servicetypenameInput.nativeElement.focus();
      this.renderer.invokeElementMethod(this.servicetypenameInput.nativeElement, 'focus'); // NEW VERSION
    }

  }

  onItemRecordSelection(record: ServiceType) {
    this.selectedServiceTypeRecord = record;
  }

  onSearch(event: any) {
    if (event.target.value != "") {
      if (event.target.value.length >= 3) {
        this.isSearchApplied = true;
        this.GetAllSearchServiceTypes(event.target.value);
      }
    }
    else {
      this.isSearchApplied = false;
      this.getServiceTypes();
    }
  }

  addRecord() {   
    this.isDisplayMode = false;
    this.setSelectedRecord();
    this.serviceTypeForm.reset();
  }

  editRecord() {   
    if (this.serviceTypes != undefined && this.serviceTypes.length > 0) {
      this.isDisplayMode = false;
      this.serviceTypeForm.reset();
      this.serviceTypeForm.get('Name').setValue(this.selectedServiceTypeRecord.Name);
      this.serviceTypeForm.get('ServiceCategoryId').setValue(this.selectedServiceTypeRecord.ServiceCategoryId);
      this.serviceTypeForm.get('Description').setValue(this.selectedServiceTypeRecord.Description);
    }
  }

  saveRecord() {  
    this.formSubmitAttempt = true;
    let seriveTypeFormStatus = this.serviceTypeForm.status;
    if (seriveTypeFormStatus != "INVALID") {
      let serviceTypeDetails: ServiceType = this.serviceTypeForm.value;
      if (this.selectedServiceTypeRecord.ServiceTypeId == 0) {
        this.serviceTypeAPIService.saveServiceType(serviceTypeDetails).subscribe((response: { Status: string, Value: any }) => {
          if (response.Status == ResponseStatusTypes.Success) {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.SavedSuccessFully,
              MessageType: MessageTypes.Success
            });

            this.formSubmitAttempt = false;
            this.isDisplayMode = true;
            this.getServiceTypes();
          }
          else if (response.Status == "Duplicate") {
            this.serviceTypeForm.get('Name').setErrors({
              'Duplicate': true
            });

          }
        });
      }
      else {

        serviceTypeDetails.ServiceTypeId = this.selectedServiceTypeRecord.ServiceTypeId;
        serviceTypeDetails.CreatedDate = this.selectedServiceTypeRecord.CreatedDate;

        this.serviceTypeAPIService.updateServiceType(serviceTypeDetails).subscribe((response: { Status: string, Value: any }) => {
          if (response.Status == ResponseStatusTypes.Success) {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.UpdatedSuccessFully,
              MessageType: MessageTypes.Success
            });
            this.formSubmitAttempt = false;
            //to show details in display mode
            this.isDisplayMode = true;
            this.getServiceTypes();

          }
          else if (response.Status == "Duplicate") {
            this.serviceTypeForm.get('Name').setErrors({
              'Duplicate': true
            });
          }
        });
      }
    }
    else {
      this.serviceTypeForm.markAsUntouched();
    }
  }

  validateControl(control: FormControl) {
    return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
  }

  split() {
    this.leftsection = !this.leftsection;
    this.rightsection = !this.rightsection;
  }

  showFullScreen() {
    this.innerWidth = window.innerWidth;       
 if(this.innerWidth > 1000){ 
    FullScreen(this.rightPanelRef.nativeElement);
 }
  }

  cancelRecord() {  
    this.serviceTypeForm.reset();
    this.serviceTypeForm.setErrors(null);
    this.formSubmitAttempt = false;
    if (this.selectedServiceTypeRecord.ServiceTypeId > 0) {
      this.isDisplayMode = true;
    }
    else if (this.serviceTypes != undefined && this.serviceTypes.length > 0) {
      this.selectedServiceTypeRecord = this.serviceTypes[0];
      this.isDisplayMode = true;
    }
    else {
      this.isDisplayMode = true;
    }
  }

  deleteRecord() {
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {
        let recordId = this.selectedServiceTypeRecord.ServiceTypeId;
        this.serviceTypeAPIService.deleteServiceType(recordId).subscribe((data) => {
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.DeletedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.getServiceTypes();
        });
      }
    });
  }
}
