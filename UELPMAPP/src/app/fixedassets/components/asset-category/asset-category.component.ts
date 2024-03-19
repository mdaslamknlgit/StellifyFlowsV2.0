import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService } from 'primeng/primeng';
import { FullScreen } from '../../../shared/shared';
import { PagerConfig, UserDetails, ResponseStatusTypes, Messages, MessageTypes } from '../../../shared/models/shared.model';
import { AssetCategories } from '../../models/asset-category.model';
import { AssetCategoryService } from '../../services/asset-category.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { AssetTypes } from '../../models/asset-type.model';
import { AssetTypeService } from '../../services/asset-type.service';

@Component({
  selector: 'app-asset-category',
  templateUrl: './asset-category.component.html',
  styleUrls: ['./asset-category.component.css'],
  providers: [AssetCategoryService, AssetTypeService]
})
export class AssetCategoryComponent implements OnInit {

  @ViewChild('rightPanel') rightPanelRef;
  @ViewChild('assetCategory') private assetCategoryRef: any;
  hideText: boolean = true;
  hideInput: boolean = false;
  leftSection: boolean = false;
  rightSection: boolean = false;
  scrollbarOptions: any;
  assetCategoryPagerConfig: PagerConfig;
  assetCategoryForm: FormGroup;
  assetFilterForm: FormGroup;
  showLeftPanelLoadingIcon: boolean = false;
  selectedRecordDetails: AssetCategories;
  assetCategoryList: Array<AssetCategories> = [];
  assetTypes: Array<AssetTypes> = [];
  showRightPanelLoadingIcon: boolean = false;
  currentPage: number = 1;
  searchKey: string = "";
  filterMessage: string = "";
  showFilterPopUp: boolean = false;
  isFilterApplied: boolean = false;
  errorMessage = Messages.NoRecordsToDisplay;
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean;

  constructor(private formBuilderObj: FormBuilder,
    private assetCategoryServiceObj: AssetCategoryService,
    public sessionService: SessionStorageService,
    private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService,
    private assetTypeServiceObj: AssetTypeService,
    private renderer: Renderer) {

    this.assetCategoryPagerConfig = new PagerConfig();
    this.assetCategoryPagerConfig.RecordsToSkip = 0;
    this.assetCategoryPagerConfig.RecordsToFetch = 10;
    this.assetCategoryForm = this.formBuilderObj.group({
      'AssetCategoryId': [0],
      'AssetTypeId': [0, Validators.required],
      'AssetCategory': ["", [Validators.required]],
      'Description': [],
    });
    this.assetFilterForm = this.formBuilderObj.group({
      'AssetTypeId': [0],
      'AssetCategory': [""]
    });
  }

  ngOnInit() {  
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {     
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "assetcategory")[0];     
      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.deletePermission = formRole.IsDelete;
    }
    else{
      this.newPermission = true;     
      this.editPermission = true;
      this.deletePermission = true;    
    }

    this.selectedRecordDetails = new AssetCategories();
    this.getAssetTypes();
    this.getAssetCategories(0);
  }

  getAssetCategories(assetCategoryId: number) {
    let input = {
      Skip: this.assetCategoryPagerConfig.RecordsToSkip,
      Take: this.assetCategoryPagerConfig.RecordsToFetch
    };
    this.showLeftPanelLoadingIcon = true;
    this.assetCategoryServiceObj.getAssetCategory(input)
      .subscribe((data: { AssetCategories: Array<AssetCategories>, TotalRecords: number }) => {

        this.showLeftPanelLoadingIcon = false;
        this.assetCategoryList = data.AssetCategories;
        this.assetCategoryPagerConfig.TotalRecords = data.TotalRecords;
        if (this.assetCategoryList.length > 0) {
          if (assetCategoryId > 0) {
            this.onRecordSelection(assetCategoryId);
          }
          else {
            this.onRecordSelection(this.assetCategoryList[0].AssetCategoryId);
          }
        }
        else {
          this.selectedRecordDetails = new AssetCategories();
        }
      }, () => {
        this.showLeftPanelLoadingIcon = false;
      });
  }

  getAssetTypes() {
    let inputRecord = {
      Skip: 0,
      Take: 0
    };
    this.assetTypeServiceObj.searchAssetTypes(inputRecord)
      .subscribe((data: { AssetTypes: Array<AssetTypes>, TotalRecords: number }) => {
        this.assetTypes = data.AssetTypes;
      });
  }

  searchForAssetCategories(assetTypeId?: number, assetCategoryName?: string) {
    let input = {
      Skip: this.assetCategoryPagerConfig.RecordsToSkip,
      Take: this.assetCategoryPagerConfig.RecordsToFetch,
      Search: this.searchKey,
      AssetTypeId: (assetTypeId == null) ? 0 : assetTypeId,
      AssetCategory: (assetCategoryName == null || assetCategoryName == "null") ? "" : assetCategoryName
    };
    this.showLeftPanelLoadingIcon = true;
    this.assetCategoryServiceObj.searchAssetCategories(input)
      .subscribe((data: { AssetCategories: Array<AssetCategories>, TotalRecords: number }) => {

        this.showLeftPanelLoadingIcon = false;
        if (data.AssetCategories.length > 0) {
          this.showFilterPopUp = false;
          this.assetCategoryList = data.AssetCategories;
          this.assetCategoryPagerConfig.TotalRecords = data.TotalRecords;
          this.onRecordSelection(this.assetCategoryList[0].AssetCategoryId);
        }
        else {
          this.filterMessage = "No matching records are found";
        }
      }, () => {
        this.showLeftPanelLoadingIcon = false;
      });
  }

  addRecord() {
    this.hideText = false;
    this.hideInput = true;
    this.clearForm();
  }

  saveRecord() {
    let status = this.assetCategoryForm.status;
    if (status != "INVALID") {
      let assetCategoryData: AssetCategories = this.assetCategoryForm.value;
      let userDetails = <UserDetails>this.sessionService.getUser();
      assetCategoryData.CreatedBy = userDetails.UserID;
      if (assetCategoryData.AssetCategoryId == null || assetCategoryData.AssetCategoryId == 0) {
        assetCategoryData.AssetCategoryId = 0;
        this.assetCategoryServiceObj.createAssetCategory(assetCategoryData).subscribe((data) => {

          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.SavedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.assetCategoryPagerConfig.RecordsToSkip = 0;
          this.currentPage = 1;
          this.getAssetCategories(0);

        }, (data: HttpErrorResponse) => {
          if (data.error.Message == ResponseStatusTypes.Duplicate) {
            this.showDuplicateMessage();
          }
        });
      }
      else {
        this.assetCategoryServiceObj.updateAssetCategory(assetCategoryData).subscribe((data) => {

          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.UpdatedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.assetCategoryPagerConfig.RecordsToSkip = 0;
          this.currentPage = 1;
          this.getAssetCategories(0);

        }, (data: HttpErrorResponse) => {
          if (data.error.Message == ResponseStatusTypes.Duplicate) {
            this.showDuplicateMessage();
          }
        });
      }
    }
    else {
      Object.keys(this.assetCategoryForm.controls).forEach((key: string) => {
        if (this.assetCategoryForm.controls[key].status == "INVALID" && this.assetCategoryForm.controls[key].touched == false) {
          this.assetCategoryForm.controls[key].markAsTouched();
        }
      });
    }
  }

  showDuplicateMessage() {
    this.assetCategoryForm.get('AssetCategory').setErrors({ 'duplicate': true });
  }

  editRecord() {
    this.hideText = false;
    this.hideInput = true;
    this.clearForm();
    this.assetCategoryForm.patchValue(this.selectedRecordDetails);
  }

  clearForm() {
    this.assetCategoryForm.reset();
  }

  onRecordSelection(assetCategoryId: number) {
    this.showRightPanelLoadingIcon = true;
    this.assetCategoryServiceObj.getAssetCategoryDetails(assetCategoryId)
      .subscribe((data: AssetCategories) => {
        if (data != null) {
          this.showRightPanelLoadingIcon = false;
          this.selectedRecordDetails = data;
          this.assetCategoryForm.patchValue(data);
        }
        this.hideText = true;
        this.hideInput = false;

      }, () => {
        this.showRightPanelLoadingIcon = false;
      });
  }

  showFullScreen() {
    FullScreen(this.rightPanelRef.nativeElement);
  }

  split() {
    this.leftSection = !this.leftSection;
    this.rightSection = !this.rightSection;
  }

  cancelRecord() {
    this.hideText = true;
    this.hideInput = false;
  }

  deleteRecord() {
    let recordId: number = this.selectedRecordDetails.AssetCategoryId;
    let userDetails = <UserDetails>this.sessionService.getUser();
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {

        this.assetCategoryServiceObj.deleteAssetCategory(recordId, userDetails.UserID).subscribe((data) => {
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.DeletedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.getAssetCategories(0);
        });

      },
      reject: () => {
      }
    });
  }

  onSearch(event: any) {
    if (event.target.value != "") {
      // if (event.target.value.length >= 3) {
      this.searchForAssetCategories();
      //}
    }
    else {
      this.getAssetCategories(0);
    }
  }

  pageChange(currentPageNumber: number) {
    if (currentPageNumber != undefined && currentPageNumber != null) {
      this.assetCategoryPagerConfig.RecordsToSkip = this.assetCategoryPagerConfig.RecordsToFetch * (currentPageNumber - 1);
      let filterData = this.assetFilterForm.value;
      if ((this.searchKey == null || this.searchKey == "") && (filterData.AssetTypeId === 0 || filterData.AssetTypeId == null) && filterData.AssetCategory == '') {
        this.getAssetCategories(0);
      }
      else {
        this.searchForAssetCategories(filterData.AssetTypeId, filterData.AssetCategory);
      }
    }
  }

  openDialog() {
    this.showFilterPopUp = true;
    if (this.assetCategoryRef != undefined) {
      this.assetCategoryRef.nativeElement.focus();
      this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
    }
  }

  resetData() {
    this.isFilterApplied = false;
    this.showFilterPopUp = true;
    this.resetFilters();
  }

  resetFilters() {
    this.assetFilterForm.reset();
    this.filterMessage = "";
    this.isFilterApplied = false;
    this.getAssetCategories(0);
    if (this.assetCategoryRef != undefined) {
      this.assetCategoryRef.nativeElement.focus();
      this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
    }
  }

  filterData() {
    let assetTypeId = 0;
    let assetCategory = "";
    this.filterMessage = "";
    if (this.assetFilterForm.get('AssetTypeId').value != null) {
      assetTypeId = this.assetFilterForm.get('AssetTypeId').value;
    }
    if (this.assetFilterForm.get('AssetCategory').value != "") {
      assetCategory = this.assetFilterForm.get('AssetCategory').value;
    }
    if ((assetTypeId === 0 || assetTypeId == null) && (assetCategory == '' || assetCategory === null)) {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }
      return;
    }
    this.isFilterApplied = true;
    this.searchForAssetCategories(assetTypeId, assetCategory);
  }

}
