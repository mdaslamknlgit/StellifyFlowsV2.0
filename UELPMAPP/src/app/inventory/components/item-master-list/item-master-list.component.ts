import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ItemMasterService } from '../../services/item-master.service';
import { ItemMaster, ItemMasterDisplayInput, ItemType, Locations } from '../../models/item-master.model';
import *  as moment from "moment";
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { ResponseStatusTypes, Messages, ResponseMessage, MessageTypes, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { Router } from '@angular/router';
@Component({
    selector: 'app-item-master-list',
    templateUrl: './item-master-list.component.html',
    styleUrls: ['./item-master-list.component.css'],
    providers: [ItemMasterService, { provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class ItemMasterListComponent implements OnInit {
    public selectedItems: any[];
    SelectedItems: string = '';
    TotalSelectedItems: number = 0;
    ExportTotalItems: boolean = false;

    slideactive: boolean = false;
    hidealert: boolean = false;
    leftsection: boolean = false;
    rightsection: boolean = false;
    signupForm: FormGroup;
    itemmasters: Array<ItemMaster> = [];
    itemtypes: Array<{ ItemTypeID: number, Name: string }>;
    searchItemtypes: Array<{ ItemTypeID: number, Name: string }>;
    categoryname: string;
    locationtypes: Array<{ LocationID: number, Name: string }>;
    searchLocationtypes: Array<{ LocationID: number, Name: string }>;
    uomtypes: Array<{ MeasurementUnitID: number, Name: string }>;
    selectedItemMasterRecord: ItemMaster;
    recordsToSkip: number = 0;
    recordsToFetch: number = 10;
    totalRecords: number = 0;
    isDisplayMode?: boolean = true;
    formSubmitAttempt: boolean = false;
    scrollbarOptions: any;

    isSearchApplied: boolean = false;
    filteredItemMasters: Array<ItemMaster> = [];
    filteredItemMastersCols: any[];
    @ViewChild('searchInput') searchInputRef: ElementRef;
    itemMasterFilterInfoForm: FormGroup;
    currentPage: number = 1;
    filterMessage: string = "";
    showfilters: boolean = true;
    showfilterstext: string = "Hide List";
    initDone = false;
    TotalRecords: number = 0;
    isFilterApplied: boolean = false;
    companyId: number = 0;
    itemMasterPagerConfig: PagerConfig;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild("ItemName") itemNameInput: ElementRef;
    @ViewChild('instructions') instructionsRef: ElementRef;
    @ViewChild('justifications') justificationsRef: ElementRef;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    importPermission: boolean;
    constructor(
        private router: Router,
        private itemmasterServiceObj: ItemMasterService,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        private renderer: Renderer,
        private fb: FormBuilder, public sessionService: SessionStorageService) {
        this.companyId = this.sessionService.getCompanyId();
        //this.selectedItemMasterRecord = new ItemMaster();
    }

    ResetPagerConfig() {
        this.itemMasterPagerConfig.RecordsToSkip = 0;
        this.itemMasterPagerConfig.RecordsToFetch = 25;

        this.currentPage = 1;
    }
    ngOnInit() {
        this.itemMasterPagerConfig = new PagerConfig();

        this.filteredItemMastersCols = [
            { field: 'ItemMasterCode', header: 'ItemMaster Code', width: '100px' },
            { field: 'Name', header: 'Name', width: '200px' },
            { field: 'CreatedDate', header: 'Created On', width: '150px' },
            { field: '', header: 'Action', width: '100px' },
        ];

        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "itemmaster")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
            this.importPermission = formRole.IsImport

        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true;
            this.importPermission = true;
        }
        this.specifiedparameter();
        this.initDone = true;
        this.signupForm = new FormGroup({
            'Name': new FormControl(null, [Validators.required]),
            'ItemMasterCode': new FormControl(null, [Validators.required]),
            'ExpiryDate': new FormControl(null, [Validators.required]),
            'LocationId': new FormControl(null, [Validators.required]),
            'ItemTypeID': new FormControl(null, [Validators.required]),
            'ItemCategoryName': new FormControl(null),
            'Price': new FormControl(null, [Validators.required]),
            'Description': new FormControl(null),
            'Status': new FormControl(""),
            'TrackInventory': new FormControl(""),
            'Manufacturer': new FormControl(null, [Validators.required]),
            'Brand': new FormControl(null, [Validators.required]),
            'GLCode': new FormControl(null, [Validators.required, Validators.maxLength(50)]),
            'OpeningStockValue': new FormControl(null, [Validators.required]),
            'MeasurementUnitID': new FormControl(null, [Validators.required]),
            'ReOrderLevel': new FormControl(null, [Validators.required]),
            'LowAlertQuantity': new FormControl(null, [Validators.required])
        });

        this.ResetPagerConfig();
        this.itemMasterFilterInfoForm = this.fb.group({
            ItemName: [''],
            ItemType: [''],
            ItemLocation: [''],
            ItemCode: ['']
        });

        this.getLocationList();
        this.getItemTypeList();
        this.getUomList();

        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                //debugger;
                //this.getItemMaster();
                //this.getLocationList();
            });

        debugger;
        this.getItemMaster();

        this.showfilters = true;
        this.showfilterstext = "Hide List";


        this.openDialog();
    }

    specifiedparameter() {
        this.selectedItemMasterRecord = {
            ItemMasterID: 0,
            ItemMasterCode: "",
            ItemTypeID: 0,
            ItemTypeName: "",
            ItemCategoryName: "",
            Name: "",
            Price: 0,
            AverageCost: 0,
            PurchasePrice:0,
            SalesPrice:0,
            Status: false,
            ExpiryDate: null,
            Manufacturer: "",
            Brand: "",
            OpeningStockValue: 0,
            Description: "",
            ReOrderLevel: 0,
            LowAlertQuantity: 0,
            GST: 7,
            CreatedBy: 0,
            ModifiedBy: 0,
            CreatedDate: null,
            LocationId: 0,
            LocationName: "",
            MeasurementUnitID: 0,
            UOMName: "",
            CompanyId: 0,
            GLCode: ""

        };
    }

    itemMasterInputFormater = (x: ItemType) => x.Name;

    itemMasterSearch = (text$: Observable<string>) =>
        text$.pipe(

            debounceTime(200),
            distinctUntilChanged(),
            map(term => term === '' ? []
                : this.searchItemtypes.filter(x => x.Name.toLowerCase().indexOf(term.toLowerCase()) !== -1))
        );

    itemMasterLocationInputFormater = (x: Locations) => x.Name;

    itemMasterLocationSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term === '' ? []
                : this.searchLocationtypes.filter(x => x.Name.toLowerCase().indexOf(term.toLowerCase()) !== -1))
        );

    onChange(event) {
        if (event > 0) {
            this.itemmasterServiceObj.GetItemcategorylist(event).subscribe((data: any) => {
                this.signupForm.controls["ItemCategoryName"].setValue(data[0].CategoryName);
            });
        }
        else {
            this.signupForm.controls["ItemCategoryName"].setValue(null);
        }
    }

onSearch(event: any) {
    debugger;
    if (event.target.value != "") {
        if (event.target.value.length >= 3) {
            this.isSearchApplied = true;
            this.GetAllSearchItemMasters(event.target.value);
        }
    }
    else {
        this.isSearchApplied = false;
        this.getItemMaster();
    }
}

    filterData() {
        let itemName = "";
        let itemTypeId = 0;
        let itemCode = "";
        let itemLocationId = 0;
        this.filterMessage = "";

        debugger;

        if (this.itemMasterFilterInfoForm.get('ItemName').value != "") {
            itemName = this.itemMasterFilterInfoForm.get('ItemName').value;
        }

        if (this.itemMasterFilterInfoForm.get('ItemType').value != "") {
            itemTypeId = this.itemMasterFilterInfoForm.get('ItemType').value.ItemTypeID;
        }

        if (this.itemMasterFilterInfoForm.get('ItemCode').value != "") {
            itemCode = this.itemMasterFilterInfoForm.get('ItemCode').value;
        }

        if (this.itemMasterFilterInfoForm.get('ItemLocation').value != "") {
            itemLocationId = this.itemMasterFilterInfoForm.get('ItemLocation').value.LocationID;
        }

        if (itemName === '' && itemTypeId === 0 && itemCode === '' && itemLocationId === 0) {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }

            return;
        }

        if (itemName != '' && itemTypeId != 0 && itemCode != '' && itemLocationId != 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.Name.toLowerCase().indexOf(itemName.toLowerCase()) !== -1 && x.ItemTypeID === Number(itemTypeId) && (x.ItemMasterCode.toLowerCase().indexOf(itemCode.toLowerCase()) !== -1) && x.LocationId === Number(itemLocationId));
        }

        if (itemName != '' && itemTypeId === 0 && itemCode === '' && itemLocationId === 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.Name.toLowerCase().indexOf(itemName.toLowerCase()) !== -1);
        }

        if (itemName != '' && itemTypeId != 0 && itemCode === '' && itemLocationId === 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.Name.toLowerCase().indexOf(itemName.toLowerCase()) !== -1 && x.ItemTypeID === Number(itemTypeId));
        }

        if (itemName != '' && itemTypeId != 0 && itemCode != '' && itemLocationId === 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.Name.toLowerCase().indexOf(itemName.toLowerCase()) !== -1 && (x.ItemTypeID === Number(itemTypeId) && (x.ItemMasterCode.toLowerCase().indexOf(itemCode.toLowerCase()) !== -1)));
        }

        if (itemName === '' && itemTypeId != 0 && itemCode === '' && itemLocationId === 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.ItemTypeID === Number(itemTypeId));
        }

        if (itemName === '' && itemTypeId != 0 && itemCode != '' && itemLocationId === 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.ItemTypeID === Number(itemTypeId) && (x.ItemMasterCode.toLowerCase().indexOf(itemCode.toLowerCase()) !== -1));
        }

        if (itemName === '' && itemTypeId != 0 && itemCode != '' && itemLocationId != 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.ItemTypeID === Number(itemTypeId) && x.ItemMasterCode.toLowerCase().indexOf(itemCode.toLowerCase()) !== -1 && x.LocationId === Number(itemLocationId));
        }

        if (itemName === '' && itemTypeId === 0 && itemCode != '' && itemLocationId != 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.ItemMasterCode.toLowerCase().indexOf(itemCode.toLowerCase()) !== -1 && x.LocationId === Number(itemLocationId));
        }

        if (itemName === '' && itemTypeId === 0 && itemCode != '' && itemLocationId === 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.ItemMasterCode.toLowerCase().indexOf(itemCode.toLowerCase()) !== -1);
        }

        if (itemName != '' && itemTypeId == 0 && itemCode != '' && itemLocationId === 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.ItemMasterCode.toLowerCase().indexOf(itemCode.toLowerCase()) !== -1 && x.Name.toLowerCase().indexOf(itemName.toLowerCase()) !== -1);
        }

        if (itemName === '' && itemTypeId === 0 && itemCode === '' && itemLocationId != 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.LocationId === Number(itemLocationId));
        }
        if (itemName != '' && itemTypeId === 0 && itemCode === '' && itemLocationId != 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.Name.toLowerCase().indexOf(itemName.toLowerCase()) !== -1 && x.LocationId === Number(itemLocationId));
        }

        if (itemName === '' && itemTypeId === 0 && itemCode != '' && itemLocationId === 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.ItemMasterCode.toLowerCase().indexOf(itemCode.toLowerCase()) !== -1);
        }

        if (itemName === '' && itemTypeId != 0 && itemCode === '' && itemLocationId === 0) {
            this.filteredItemMasters = this.itemmasters.filter(x => x.ItemTypeID === Number(itemTypeId));
        }


        if (this.filteredItemMasters.length > 0) {
            this.itemMasterPagerConfig.TotalRecords = this.filteredItemMasters.length;
            this.itemmasters = this.filteredItemMasters;
            this.selectedItemMasterRecord = this.itemmasters[0];
            this.isFilterApplied = true;
            if (open) {
                this.initDone = false;
            }

        }
        else {
            this.filterMessage = "No matching records are found";
            this.filteredItemMasters = this.itemmasters;
            this.itemMasterPagerConfig.TotalRecords = this.filteredItemMasters.length;
            this.itemMasterPagerConfig.TotalRecords = this.filteredItemMasters.length;
            if (this.filteredItemMasters.length > 0) {
                this.selectedItemMasterRecord = this.itemmasters[0];
            }
        }
    }

    resetFilters() {
        //debugger;
        this.itemMasterFilterInfoForm.get('ItemName').setValue("");
        this.itemMasterFilterInfoForm.get('ItemType').setValue("");
        this.itemMasterFilterInfoForm.get('ItemCode').setValue("");
        this.itemMasterFilterInfoForm.get('ItemLocation').setValue("");
        this.filterMessage = "";
        this.filteredItemMasters = this.itemmasters;
        this.itemMasterPagerConfig.TotalRecords = this.filteredItemMasters.length;
        if (this.itemmasters.length > 0) {
            debugger;
            this.getItemMaster();
            //this.selectedItemMasterRecord = this.itemmasters[0];
        }
        else {
            this.isDisplayMode = null;
        }

        this.isFilterApplied = false;
        if (this.itemNameInput != undefined) {
            this.itemNameInput.nativeElement.focus();
            this.renderer.invokeElementMethod(this.itemNameInput.nativeElement, 'focus'); // NEW VERSION
        }

    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }


    GetAllSearchItemMasters(searchString: string): void {
        let displayItemMasterGrid: ItemMasterDisplayInput = {
            Search: searchString,
            Skip: this.itemMasterPagerConfig.RecordsToSkip,
            Take: this.itemMasterPagerConfig.RecordsToFetch,
            CompanyId: this.companyId
        };

        this.itemmasterServiceObj.GetAllSearchItemMasters(displayItemMasterGrid)
            .subscribe((data: { ItemMaster: Array<ItemMaster>, TotalRecords: number }) => {
                this.itemmasters = data.ItemMaster;
                this.filteredItemMasters = this.itemmasters;
                this.itemMasterPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                console.log(this.itemMasterPagerConfig.TotalRecords);
                if (this.itemmasters.length > 0) {
                    this.selectedItemMasterRecord = this.itemmasters[0];
                }
                else {
                    this.isDisplayMode = true;
                }
            });
    }

    openDialog() {
        this.initDone = true;
        this.itemmasterServiceObj.GetItemTypeList().subscribe((data: Array<{ ItemTypeID: number, Name: string }>) => {
            this.itemtypes = data;
            this.searchItemtypes = data;
            this.itemNameInput.nativeElement.focus();
            this.renderer.invokeElementMethod(this.itemNameInput.nativeElement, 'focus');
        });
    }

    getLocationList() {
        this.itemmasterServiceObj.GetLocationsList(this.companyId).subscribe((data: Array<{ LocationID: number, Name: string }>) => {
            this.locationtypes = data;
        });
    }

    getUomList() {
        this.itemmasterServiceObj.GetUOMList().subscribe((data: Array<{ MeasurementUnitID: number, Name: string }>) => {
            this.uomtypes = data;
        });
    }

    getItemTypeList() {
        this.itemmasterServiceObj.GetItemTypeList().subscribe((data: Array<{ ItemTypeID: number, Name: string }>) => {
            this.itemtypes = data;
        });
    }

    cancledata() {
        this.isDisplayMode = true;
    }


    onClickedOutside(e: Event) {
        //  this.showfilters= false; 
        if (this.showfilters == false) {
            // this.showfilterstext="Show List"
        }
    }

    ClickNewItem(e) {
        this.router.navigate([`/inventory/itemmaster/${'NEW'}/0/1`]);
    }
    EditItem(ItemId, e) {
        this.router.navigate([`/inventory/itemmaster/${'EDIT'}/${ItemId}/1`]);
    }
    showFullScreen() {
        FullScreen(this.rightPanelRef.nativeElement);
        //  this.hideLeftPanel = true;
        // this.sharedServiceObj.hideAppBar(true);//hiding the app bar..
    }


    getItemMaster() {

        debugger;
        let displayInput: ItemMasterDisplayInput = {
            Search: "",
            Skip: this.itemMasterPagerConfig.RecordsToSkip,
            Take: this.itemMasterPagerConfig.RecordsToFetch,
            CompanyId: this.companyId
        };

        //calling the service method to get the list of item categories...
        this.itemmasterServiceObj.getItemMaster(displayInput)
            .subscribe((data: { ItemMaster: Array<ItemMaster>, TotalRecords: number }) => {
                this.itemmasters = data.ItemMaster;
                this.filteredItemMasters = this.itemmasters
                this.itemMasterPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                console.log(this.itemMasterPagerConfig.TotalRecords);
                //checking if the item category records length is more than 0
                // if (this.itemmasters.length > 0) {   //setting the first record as the selected record...
                //     this.selectedItemMasterRecord = this.itemmasters[0];

                // }
                // else {
                //     this.isDisplayMode = null;
                //     this.specifiedparameter();
                // }

                // if (this.isSearchApplied) {
                //     this.GetAllSearchItemMasters(this.searchInputRef.nativeElement.value);
                // }
            });
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
        this.itemMasterPagerConfig.RecordsToSkip = this.itemMasterPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        debugger;
        this.getItemMaster();
    }

    //***********************************************************************************************************/
    //Sorting Functions
    //***********************************************************************************************************/
    customSort(event: SortEvent) {
        event.data.sort((data1, data2) => {
            let value1 = data1[event.field];
            let value2 = data2[event.field];
            let result = null;
            if (value1 == null && value2 != null)
                result = -1;
            else if (value1 != null && value2 == null)
                result = 1;
            else if (value1 == null && value2 == null)
                result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string')
                result = value1.localeCompare(value2);
            else
                result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

            return (event.order * result);
        });
    }

    sortTableData(event) {
        event.data.sort((data1, data2) => {
            let value1 = data1[event.field];
            let value2 = data2[event.field];
            let result = null;
            if (value1 == null && value2 != null) result = -1;
            else if (value1 != null && value2 == null) result = 1;
            else if (value1 == null && value2 == null) result = 0;
            else if (typeof value1 === 'string' && typeof value2 === 'string')
                result = value1.localeCompare(value2);
            else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

            return event.order * result;
        });
    }

    onRowUnselect(event) {
        let i = 0;
        this.SelectedItems = "";
        for (i = 0; i <= this.selectedItems.length - 1; i++) {
            if (this.SelectedItems == "") {
                this.SelectedItems = this.selectedItems[i].ItemMasterID;
            }
            else {
                this.SelectedItems = this.SelectedItems + "," + this.selectedItems[i].ItemMasterID;
            }
        }
        this.TotalSelectedItems = this.selectedItems.length;
        if (this.TotalSelectedItems == 0) {
            this.SelectedItems = "";
        }
        //alert("Un Selected Leads : " + this.SelectedItems + "\n Total Un Selected Leads : " + this.TotalSelectedItems);
    }

    onRowSelect(event) {
        let i = 0;
        this.SelectedItems = "";
        for (i = 0; i <= this.selectedItems.length - 1; i++) {
            if (this.SelectedItems == "") {
                this.SelectedItems = this.selectedItems[i].ItemMasterID;
            }
            else {
                this.SelectedItems = this.SelectedItems + "," + this.selectedItems[i].ItemMasterID;
            }
        }
        this.TotalSelectedItems = this.selectedItems.length;
        //alert("Selected Leads : " + this.SelectedItems + "\n Total Selected Leads : " + this.TotalSelectedItems);
    }


    //***********************************************************************************************************/
    uploadFile(event) {
        if (event.target.files.length == 0) {
            return
        }

        let file: File = event.target.files[0];
        if (file.type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            let userDetails = <UserDetails>this.sessionService.getUser();
            this.itemmasterServiceObj.UploadItems(userDetails.UserID, file)
                .subscribe((data: any) => {
                    this.getItemMaster();          
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
    
    ExportToCSV(e)
    {
        console.log("ExportToCSV");
    }    
    ExportToExcel(e)
    {
        console.log("ExportToExcel");
    }

    ExportToPDF(e)
    {
        console.log("ExportToPDF");
    }

}

