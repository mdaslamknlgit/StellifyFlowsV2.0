import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { FullScreen, restrictMinus } from '../../../shared/shared';
import { PagerConfig, Messages, UserDetails, ResponseStatusTypes, MessageTypes, Assets, UserProfile, Companies, Suppliers, Invoices, Location, AssetSubCategory, AssetSubCategoryDetails } from '../../../shared/models/shared.model';
import { Asset, AssetFilter } from '../../models/asset.model';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { SharedService } from '../../../shared/services/shared.service';
import { AssetService } from '../../services/asset.service';
import { AssetMasterService } from "../../services/asset-master.service";
import { DepreciationService } from "../../services/depreciation.service";
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Depreciation } from '../../models/depreciation.model';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { Supplier } from '../../../po/models/supplier';
import { AssetRegisterService } from '../../services/asset-register.service';
@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css'],
  providers: [AssetService, AssetMasterService, DepreciationService, AssetRegisterService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class AssetsComponent implements OnInit {
  @ViewChild('rightPanel') rightPanelRef;
  @ViewChild('assetCategory') private assetCategoryRef: any;
  hideText: boolean = true;
  hideInput: boolean = false;
  leftSection: boolean = false;
  rightSection: boolean = false;
  scrollbarOptions: any;
  assetPagerConfig: PagerConfig;
  assetForm: FormGroup;
  assetFilterForm: FormGroup;
  showLeftPanelLoadingIcon: boolean = false;
  selectedRecordDetails: Asset;
  assetsList: Array<Asset> = [];
  showRightPanelLoadingIcon: boolean = false;
  currentPage: number = 1;
  searchKey: string = "";
  filterMessage: string = "";
  showFilterPopUp: boolean = false;
  isFilterApplied: boolean = false;
  supplierGridColumns: Array<{ field: string, header: string }> = [];
  linesToAdd: number = 2;
  gridSupplierRowId: number = 0;
  gridNoMessageToDisplay: string = Messages.NoItemsToDisplay;
  errorMessage = Messages.NoRecordsToDisplay;
  selectedRowId: number = 0;
  importPermission:boolean;
  depreciationMethods: Depreciation[] = [];
  companyId: number = 0;
  showImportAssetsVisible: boolean = false;
  assetSubcategoryDetails: AssetSubCategoryDetails[] = [];
  gridColumns: Array<{ field: string, header: string, width: string }> = [];
  showfilters:boolean=false;
  showfilterstext:string="Show List" ;
  constructor(private formBuilderObj: FormBuilder,
    public sessionService: SessionStorageService,
    private sharedServiceObj: SharedService,
    private confirmationServiceObj: ConfirmationService,
    private renderer: Renderer,
    private assetMasterService: AssetMasterService,
    private assetServiceObj: AssetService,
    private depreciationService: DepreciationService,
    private reqDateFormatPipe: RequestDateFormatPipe,
    private assetRegisterService: AssetRegisterService) {
    this.companyId = this.sessionService.getCompanyId();
    this.assetPagerConfig = new PagerConfig();
    this.assetPagerConfig.RecordsToSkip = 0;
    this.assetPagerConfig.RecordsToFetch = 10;
    this.assetForm = this.formBuilderObj.group({
      AssetDetailsId: [0],
      Asset: [null, [Validators.required]],
      AccountCode: [""],
      SerialNumber: ["", [Validators.required]],
      BarCode: [],
      PurchasedValue: [0, [Validators.required, Validators.min(0)]],
      PurchasedDate: [new Date(), [Validators.required]],
      // DepreciationId:[0,[Validators.required]],
      SalvageValue: [0, [Validators.required]],
      DepreciationYears: [0, [Validators.required]],
      Supplier: [null],
      Invoice: [null],
      ExpiryDate: [new Date()],
      Location: [0, [Validators.required]],
      CurrentValue: [0, [Validators.required]],
      UsedBy: [null],
      ManufacturedBy: [""],
      Warranty: [""],
      ManufacturedDate: [new Date()],
      GLCode: ["", [Validators.required, Validators.maxLength(50)]],
      PreferredSuppliers: this.formBuilderObj.array([])
    });
    this.assetFilterForm = this.formBuilderObj.group({
      'AssetName': [""],
      'Location': [null],
      'PurchasedDate': [null],
      'BarCode': [""]
    });
    this.supplierGridColumns = [
      { field: 'SNo', header: 'S.No' },
      { field: 'Name', header: 'Supplier Name' },
      { field: 'EmailId', header: 'Email' },
      { field: 'ContactNumber', header: 'Contact Number' }
    ];
    this.gridColumns = [
      { field: 'AssetSubcategory', header: 'Asset Subcategory', width: '30%' },
      { field: 'AccountCode', header: 'Account Code', width: '20%' },
      { field: 'Type', header: 'Type', width: '15%' },
      { field: 'Description', header: 'Description', width: '35%' }
    ];
    this.getDepreciationMethods();
  }
  initGridRows() {
    return this.formBuilderObj.group({
      'AssetPreferredSupplierId': 0,
      'AssetId': 0,
      'Supplier': [null, Validators.required],
      "IsDeleted": [false]
    });
  }

  ngOnInit() {
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
        let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "assets")[0];
       
        this.importPermission=formRole.IsImport

    }
    else {
       
        this.importPermission=true;
    }
    this.selectedRecordDetails = new Asset();
    this.sharedServiceObj.CompanyId$
      .subscribe((data) => {
        this.companyId = data;
        this.getAssets(0);
      });
    this.getAssets(0);

    this.showfilters =true;
    this.showfilterstext="Hide List" ;
    
  }

  getDepreciationMethods() {
    this.depreciationService.getDepreciations({
      Skip: 0,
      Take: 0
    }).subscribe((data: { Depreciations: Array<Depreciation>, TotalRecords: number }) => {

      this.depreciationMethods = data.Depreciations;
    });
  }

  getAssets(assetId: number) {
    let input = {
      Skip: this.assetPagerConfig.RecordsToSkip,
      Take: this.assetPagerConfig.RecordsToFetch,
      CompanyId: this.sessionService.getCompanyId()
    };
    this.showLeftPanelLoadingIcon = true;
    this.assetServiceObj.getAssets(input)
      .subscribe((data: { Assets: Array<Asset>, TotalRecords: number }) => {

        this.showLeftPanelLoadingIcon = false;
        this.assetsList = data.Assets;
        this.assetPagerConfig.TotalRecords = data.TotalRecords;
        if (this.assetsList.length > 0) {
          if (assetId > 0) {
            this.onRecordSelection(assetId);
          }
          else {
            this.onRecordSelection(this.assetsList[0].AssetDetailsId);
          }
        }
        else {
          this.selectedRecordDetails = new Asset();
        }
      }, () => {
        this.showLeftPanelLoadingIcon = false;
      });
  }

  searchForAssets(assetsFilterObj?: AssetFilter) {
    let input = {
      Skip: this.assetPagerConfig.RecordsToSkip,
      Take: this.assetPagerConfig.RecordsToFetch,
      AssetName: assetsFilterObj.AssetName == null ? "" : assetsFilterObj.AssetName,
      SerialNumber: assetsFilterObj.SerialNumber == null ? "" : assetsFilterObj.SerialNumber,
      BarCode: assetsFilterObj.BarCode == null ? "" : assetsFilterObj.BarCode,
      PurchasedDate: this.reqDateFormatPipe.transform(assetsFilterObj.PurchasedDate),
      CompanyId: this.sessionService.getCompanyId(),
      Search: this.searchKey,
      LocationId: assetsFilterObj.Location == null ? 0 : assetsFilterObj.Location.LocationID,
      SortExpression: this.assetPagerConfig.SortingExpr,
      SortDirection: this.assetPagerConfig.SortingOrder,
      IsRegister: false
    };
    this.showLeftPanelLoadingIcon = true;
    this.assetRegisterService.searchAsset(input)
      .subscribe((data: { Assets: Array<Asset>, TotalRecords: number }) => {

        this.showLeftPanelLoadingIcon = false;
        if (data.Assets.length > 0) {
          this.assetsList = data.Assets;
          this.assetPagerConfig.TotalRecords = data.TotalRecords;
          this.showFilterPopUp = false;
          this.onRecordSelection(this.assetsList[0].AssetDetailsId);
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
    this.assetForm.get('Asset').enable();
    this.showfilters =false;
    this.showfilterstext="Show List" ;
  }

  saveRecord() {
    let status = this.assetForm.status;
    if (status != "INVALID") {
      let assetMasterData: Asset = this.assetForm.value;
      let userDetails = <UserDetails>this.sessionService.getUser();
      assetMasterData.CreatedBy = userDetails.UserID;
      assetMasterData.PurchasedDate = this.reqDateFormatPipe.transform(assetMasterData.PurchasedDate);
      assetMasterData.CompanyId = this.sessionService.getCompanyId();
      if (assetMasterData.AssetDetailsId == null || assetMasterData.AssetDetailsId == 0) {
        assetMasterData.AssetDetailsId = 0;
        this.assetServiceObj.createAsset(assetMasterData).subscribe((data) => {

          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.SavedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.assetPagerConfig.RecordsToSkip = 0;
          this.currentPage = 1;
          this.getAssets(0);
        }, (data: HttpErrorResponse) => {
          if (data.error.Message == ResponseStatusTypes.Duplicate) {
            this.showDuplicateMessage();
          }
        });
      }
      else {
        assetMasterData.Asset = this.selectedRecordDetails.Asset;
        this.assetServiceObj.updateAsset(assetMasterData).subscribe((data) => {

          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.UpdatedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.assetPagerConfig.RecordsToSkip = 0;
          this.currentPage = 1;
          this.getAssets(0);

        }, (data: HttpErrorResponse) => {
          if (data.error.Message == ResponseStatusTypes.Duplicate) {
            this.showDuplicateMessage();
          }
        });
      }
    }
    else {
      Object.keys(this.assetForm.controls).forEach((key: string) => {
        if (this.assetForm.controls[key].status == "INVALID" && this.assetForm.controls[key].touched == false) {
          this.assetForm.controls[key].markAsTouched();
        }
      });
    }
  }

  showDuplicateMessage() {
    this.assetForm.get('AssetCategory').setErrors({ 'duplicate': true });
  }
  showImportAssets() {
    this.showImportAssetsVisible = true;
    this.assetServiceObj.getImportAssetsDetails(this.companyId).subscribe((data: any) => {
      this.assetSubcategoryDetails = data;
      if (this.assetSubcategoryDetails.length > 0) {
        this.assetSubcategoryDetails = data;
        this.getAssets(0);
      }
      else {
        this.gridNoMessageToDisplay = Messages.NoItemsToDisplay;
        this.assetSubcategoryDetails = [];
      }
    });
  }
  editRecord() {
    this.hideText = false;
    this.hideInput = true;
    this.clearForm();
    this.assetForm.patchValue(this.selectedRecordDetails);
    this.assetForm
    this.assetForm.get('PurchasedDate').setValue(new Date(this.selectedRecordDetails.PurchasedDate));
    this.assetForm.get('ManufacturedDate').setValue(new Date(this.selectedRecordDetails.ManufacturedDate));
    this.assetForm.get('ExpiryDate').setValue(new Date(this.selectedRecordDetails.ExpiryDate));
    this.assetForm.get('Asset').disable();
  }

  clearForm() {
    this.assetForm.reset();
  }

  onRecordSelection(assetDetailId: number) {
    this.split();
    this.showRightPanelLoadingIcon = true;
    this.assetServiceObj.getAssetDetails(assetDetailId)
      .subscribe((data: Asset) => {
        if (data != null) {
          this.showRightPanelLoadingIcon = false;
          this.selectedRecordDetails = data;
          this.assetForm.patchValue(data);
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
  onClickedOutside(e: Event) {
   // this.showfilters= false; 
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

  cancelRecord() {
    this.hideText = true;
    this.hideInput = false;
  }

  deleteRecord() {
    let recordId: number = this.selectedRecordDetails.AssetDetailsId;
    let userDetails = <UserDetails>this.sessionService.getUser();
    this.confirmationServiceObj.confirm({
      message: Messages.ProceedDelete,
      header: Messages.DeletePopupHeader,
      accept: () => {

        this.assetServiceObj.deleteAsset(recordId, userDetails.UserID).subscribe((data) => {
          this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.DeletedSuccessFully,
            MessageType: MessageTypes.Success
          });
          this.getAssets(0);
        });

      },
      reject: () => {
      }
    });
  }

  onSearch(event: any) {
    if (event.target.value != "") {
      let assetsFilterData = this.assetFilterForm.value
      // if (event.target.value.length >= 3) {
      this.searchForAssets(assetsFilterData);
      //}
    }
    else {
      this.getAssets(0);
    }
  }

  pageChange(currentPageNumber: number) {
    this.assetPagerConfig.RecordsToSkip = this.assetPagerConfig.RecordsToFetch * (currentPageNumber - 1);
    let assetsFilterData = this.assetFilterForm.value;
    if ((this.searchKey == null || this.searchKey == "") && (assetsFilterData.AssetName == "" && assetsFilterData.Location == null
      && assetsFilterData.PurchasedDate == null && assetsFilterData.BarCode == "")) {
      this.getAssets(0);
    }
    else {
      this.searchForAssets(assetsFilterData);
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
  resetPagerConfig() {
    this.assetPagerConfig.RecordsToSkip = 0;
    this.assetPagerConfig.RecordsToFetch = 10;
    this.currentPage = 1;
  }

  resetFilters() {
    this.assetFilterForm.reset();
    this.filterMessage = "";
    this.isFilterApplied = false;
    this.resetPagerConfig();
    this.getAssets(0);
    if (this.assetCategoryRef != undefined) {
      this.assetCategoryRef.nativeElement.focus();
      this.renderer.invokeElementMethod(this.assetCategoryRef.nativeElement, 'focus'); // NEW VERSION
    }
  }

  filterData() {
    this.filterMessage = "";
    let assetsFilterData = this.assetFilterForm.value;
    if ((assetsFilterData.AssetName == "" || assetsFilterData.AssetName == null)
      && assetsFilterData.Location == null
      && assetsFilterData.PurchasedDate == null
      && (assetsFilterData.BarCode == "" || assetsFilterData.BarCode == null)) {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }
      return;
    }
    this.isFilterApplied = true;
    this.resetPagerConfig();
    this.searchForAssets(assetsFilterData);
  }



  assestInputFormater = (x: Assets) => x.AssetName;

  assetSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.assetMasterService.searchAssetMaster({
          AssetName: term
        }).pipe(
          catchError(() => {

            return of([]);
          }))
      })
    );

  locationInputFormater = (x: Location) => x.Name;

  locationSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.sharedServiceObj.getLocationByKey(term, this.sessionService.getCompanyId()).pipe(
          catchError(() => {
            return of([]);
          }))
      })
    );


  userInputFormater = (x: UserProfile) => x.FirstName;

  userSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        return this.sharedServiceObj.getUsers(term, this.sessionService.getCompanyId()).pipe(
          catchError(() => {
            return of([]);
          }))
      })
    );

  //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
  supplierSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term == "") {
          this.assetForm.get('Invoice').setValue(null);
          return of([]);
        }
        return this.sharedServiceObj.getSuppliers({
          searchKey: term,
          supplierTypeId: 0,
          CompanyId: this.sessionService.getCompanyId()
        }).pipe(
          catchError(() => {
            return of([]);
          }))
      }
      )
    );
  supplierInputFormater = (x: Suppliers) => x.SupplierName;

  invoiceFormater = (x: Invoices) => x.InvoiceCode;
  //this mehtod will be called when user gives contents to the  "supplier" autocomplete...
  invoiceSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.sharedServiceObj.getINVRequest({
          Search: term,
          SupplierId: this.assetForm.get('Supplier').value == null ? 0 : this.assetForm.get('Supplier').value.SupplierId
        }).map((data: Array<any>) => {
          data.forEach((item, index) => {
            item.index = index;
          });
          return data;
        }).pipe(
          catchError(() => {
            return of([]);
          }))
      )
    );
  /**
   * this method will be called on the supplier dropdown change event.
   */
  onSupplierChange(event: any) {
    this.assetForm.get('Invoice').setValue(null);
  }

  restrictMinus(event: any) {
    restrictMinus(event);
  }
  // upload asset subcategories
  uploadFile(event) {
    if (event.target.files.length == 0) {
      return
    }

    let file: File = event.target.files[0];
    if (file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      let userDetails = <UserDetails>this.sessionService.getUser();
      this.assetServiceObj.UploadAssetSubcategory(userDetails.UserID, file)
        .subscribe((data: any) => {
          if (Number(data.UploadedRecords) > 0 && Number(data.FailedRecords) > 0) {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: data.UploadedRecords + Messages.AssetSubCategoryMessage + "," + data.FailedRecords + Messages.AssetSubcategoryFialedrecords,
              MessageType: MessageTypes.Success
            });
          }
          else if (Number(data.UploadedRecords) == 0 && Number(data.FailedRecords) > 0) {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: data.FailedRecords + Messages.AssetSubcategoryFialedrecords,
              MessageType: MessageTypes.Error
            });
          }
          else {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: data.UploadedRecords + Messages.AssetSubCategoryMessage,
              MessageType: MessageTypes.Success
            });
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
}
