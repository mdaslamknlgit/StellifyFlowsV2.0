import { Component, OnInit, ViewChild, Renderer, ElementRef } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ItemType, ItemTypeDisplayInput } from '../../models/item-type.model';
import { ItemTypeService } from '../../services/item-type.service';
import { debug } from 'util';
import { ResponseStatusTypes, Messages, ResponseMessage, MessageTypes } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ConfirmationService } from "primeng/components/common/api";
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
@Component({
    selector: 'app-item-types-old',
    templateUrl: './item-types-old.component.html',
    styleUrls: ['./item-types-old.component.css'],
    providers: [ItemTypeService]
})
export class ItemTypesOldComponent implements OnInit {

    leftsection: boolean = false;
    rightsection: boolean = false;

    itemtypes: Array<ItemType> = [];
    itemcategorytypes: Array<{ ItemCategoryID: number, Name: string }>;

    selectedItemTypeRecord: ItemType;

    //hold the number of records to skip...
    recordsToSkip: number = 0;

    //hold the number of records to fetch ...while showing in the list view..
    recordsToFetch: number = 20;

    //holds the total number of category records..
    totalRecords: number = 0;

    //form for creating item category
    itemtypeForm: FormGroup;

    //whether the item content we are displaying is in edit/display mode...
    isDisplayMode?: boolean = true;

    formSubmitAttempt: boolean = false;

    scrollbarOptions: any;
    @ViewChild('rightPanel') rightPanelRef;

    isSearchApplied: boolean = false;
    filterMessage: string = "";
    initDone = false;
    isFilterApplied: boolean = false;
    itemtypeFilterInfoForm: FormGroup;
    filteredItemtype: Array<ItemType> = [];
    @ViewChild("ItemTypeName") itemtypenameInput: ElementRef;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;


    constructor(private itemtypeServiceObj: ItemTypeService,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        private renderer: Renderer,
        private fb: FormBuilder,
        public sessionService: SessionStorageService) {
        this.selectedItemTypeRecord = {
            ItemTypeID: 0,
            Name: "",
            Description: "",
            ItemCategoryID: 0,
            ItemCategoryName: "",
            CreatedBy: 0,
            CreatedDate: null,
            ModifiedBy: 0,
            ModifiedDate:new Date(),
        };
        this.itemtypeForm = new FormGroup({

            Name: new FormControl("", [Validators.required]),
            ItemCategoryID: new FormControl(0, [Validators.required]),
            Description: new FormControl(""),
        });

        this.itemtypeFilterInfoForm = this.fb.group({
            ItemTypeName: [''],
            ItemCategory: ['']
        });
        this.initDone = true;


        this.getItemTypes();
        this.getItemCategoryList();
    }

    ngOnInit() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            //let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "itemtype")[0];
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "itemmaster")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true;
        }
    }

    getItemCategoryList() {
        this.itemtypeServiceObj.GetItemCategoryList().subscribe((data: Array<{ ItemCategoryID: number, Name: string }>) => {

            this.itemcategorytypes = data;

        });
    }

    GetAllSearchUOM(searchString: string): void {
        let displayitemtypeGrid: ItemTypeDisplayInput = {
            Search: searchString,
            Skip: this.recordsToSkip,
            Take: this.recordsToFetch
        };

        this.itemtypeServiceObj.GetAllItemType(displayitemtypeGrid)
            .subscribe((data: { ItemType: Array<ItemType>, TotalRecords: number }) => {
                this.itemtypes = data.ItemType;
                this.filteredItemtype = this.itemtypes;
                this.totalRecords = data.TotalRecords;
                if (this.itemtypes.length > 0) {
                    this.selectedItemTypeRecord = this.itemtypes[0];
                }
                else {
                    this.isDisplayMode = true;
                }
            });
    }

    openDialog() {
        this.initDone = true;
        this.itemtypenameInput.nativeElement.focus();
        this.renderer.invokeElementMethod(this.itemtypenameInput.nativeElement, 'focus');
    }

    filterData() {
        let Name = "";
        let Code = "";
        this.filterMessage = "";
        if (this.itemtypeFilterInfoForm.get('ItemTypeName').value != "") {
            Name = this.itemtypeFilterInfoForm.get('ItemTypeName').value;
        }

        if (this.itemtypeFilterInfoForm.get('ItemCategory').value != "") {
            Code = this.itemtypeFilterInfoForm.get('ItemCategory').value;
        }

        if (Name === '' && Code === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        if (Name != '' && Code != '') {
            this.filteredItemtype = this.itemtypes.filter(x => x.Name.toLowerCase().indexOf(Name.toLowerCase()) !== -1 && x.ItemCategoryName === Code.toString());
        }

        if (Name != '' && Code != '') {
            this.filteredItemtype = this.itemtypes.filter(x => x.Name.toLowerCase().indexOf(Name.toLowerCase()) !== -1 && x.ItemCategoryName === Code.toString());
        }

        if (Name != '' && Code === '') {
            this.filteredItemtype = this.itemtypes.filter(x => x.Name.toLowerCase().indexOf(Name.toLowerCase()) !== -1);
        }

        if (Name === '' && Code != '') {
            this.filteredItemtype = this.itemtypes.filter(x => x.ItemCategoryName.toLowerCase().indexOf(Code.toLowerCase()) !== -1);
        }

        if (this.filteredItemtype.length > 0) {
            this.totalRecords = this.filteredItemtype.length;
            this.itemtypes = this.filteredItemtype;
            this.selectedItemTypeRecord = this.itemtypes[0];
            this.isFilterApplied = true;
            if (open) {
                this.initDone = false;
            }

        }
        else {
            this.filterMessage = "No matching records are found";
            this.filteredItemtype = this.itemtypes;
            this.totalRecords = this.filteredItemtype.length;
            if (this.filteredItemtype.length > 0) {
                this.selectedItemTypeRecord = this.itemtypes[0];
            }
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    resetFilters() {
        this.itemtypeFilterInfoForm.get('ItemTypeName').setValue("");
        this.itemtypeFilterInfoForm.get('ItemCategory').setValue("");
        this.filterMessage = "";
        this.filteredItemtype = this.itemtypes;
        this.totalRecords = this.filteredItemtype.length;
        if (this.itemtypes.length > 0) {
            this.getItemTypes();
        }
        else {
            this.isDisplayMode = null;
        }
        this.isFilterApplied = false;
        if (this.itemtypenameInput != undefined) {
            this.itemtypenameInput.nativeElement.focus();
            this.renderer.invokeElementMethod(this.itemtypenameInput.nativeElement, 'focus'); // NEW VERSION
        }

    }

    /**
         * to get the item categories...
         */
    getItemTypes() {

        let displayInput: ItemTypeDisplayInput = {
            Search: "",
            Skip: this.recordsToSkip,
            Take: this.recordsToFetch
        };

        //calling the service method to get the list of item categories...
        this.itemtypeServiceObj.getItemTypes(displayInput)
            .subscribe((data: { ItemType: Array<ItemType>, TotalRecords: number }) => {

                this.itemtypes = data.ItemType;

                this.totalRecords = data.TotalRecords;
                //checking if the item category records length is more than 0
                if (this.itemtypes.length > 0) {   //setting the first record as the selected record...
                    this.selectedItemTypeRecord = this.itemtypes[0];
                    console.log(this.itemtypes);

                }
                else {
                    this.isDisplayMode = null;
                    this.selectedItemTypeRecord = {

                        ItemTypeID: 0,
                        Name: "",
                        Description: "",
                        ItemCategoryID: 0,
                        ItemCategoryName: "",
                        CreatedBy: 0,
                        CreatedDate: null,
                        ModifiedBy: 0,
                        ModifiedDate:new Date(),
                    };
                }
            });
    }
    /**
           * to set the selected item category record selection...
           */
    onItemRecordSelection(record: ItemType) {

        this.selectedItemTypeRecord = record;
        this.isDisplayMode = true;

    }

    onSearch(event: any) {
        if (event.target.value != "") {
            if (event.target.value.length >= 3) {
                this.isSearchApplied = true;
                this.GetAllSearchUOM(event.target.value);
            }
        }
        else {
            this.isSearchApplied = false;
            this.getItemTypes();
        }
    }

    /**
          * to hide the category details and show in add mode..
          */
    addRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;

        this.selectedItemTypeRecord = {
            ItemTypeID: 0,
            Name: "",
            Description: "",
            ItemCategoryID: 0,
            ItemCategoryName: "",
            CreatedBy: 0,
            CreatedDate: null,
            ModifiedBy: 0,
            ModifiedDate:new Date(),

        };

        //resetting the item category form..
        this.itemtypeForm.reset();
    }

    /**
           * to hide the category details and show in edit mode...
           */
    editRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;
        //resetting the item category form.
        this.itemtypeForm.reset();

        this.itemtypeForm.get('Name').setValue(this.selectedItemTypeRecord.Name);
        this.itemtypeForm.get('ItemCategoryID').setValue(this.selectedItemTypeRecord.ItemCategoryID);
        this.itemtypeForm.get('Description').setValue(this.selectedItemTypeRecord.Description);
    }

    /**
   * to save the given item category details...
   */
    saveRecord() {
        this.formSubmitAttempt = true;
        let itemCategoryFormStatus = this.itemtypeForm.status;
        if (itemCategoryFormStatus != "INVALID") {

            //getting the item category form details
            let itemtypeDetails: ItemType = this.itemtypeForm.value;

            if (this.selectedItemTypeRecord.ItemTypeID == 0) {

                this.itemtypeServiceObj.saveItemType(itemtypeDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {

                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        //after save we will show details in display mode..so setting this variable to true...
                        this.isDisplayMode = true;
                        //pushing the record details into the array...
                        this.itemtypes.unshift({

                            ItemTypeID: response.Value,
                            Name: itemtypeDetails.Name,
                            Description: itemtypeDetails.Description,
                            CreatedBy: itemtypeDetails.CreatedBy,
                            ModifiedBy: itemtypeDetails.ModifiedBy,
                            ModifiedDate:itemtypeDetails.ModifiedDate,
                            ItemCategoryID: itemtypeDetails.ItemCategoryID,
                            CreatedDate: itemtypeDetails.CreatedDate,
                            ItemCategoryName: this.itemcategorytypes.find(data => data.ItemCategoryID == itemtypeDetails.ItemCategoryID).Name

                        });

                        this.selectedItemTypeRecord = this.itemtypes[0];
                    }
                    else if (response.Status == "Duplicate") {
                        //setting the error for the "Name" control..so as to show the duplicate validation message..
                        this.itemtypeForm.get('Name').setErrors({
                            'Duplicate': true
                        });

                    }
                });
            }
            else {

                itemtypeDetails.ItemTypeID = this.selectedItemTypeRecord.ItemTypeID;
                itemtypeDetails.CreatedDate = this.selectedItemTypeRecord.CreatedDate;

                this.itemtypeServiceObj.updateItemType(itemtypeDetails).subscribe((response: { Status: string, Value: any }) => {

                    if (response.Status == ResponseStatusTypes.Success) {

                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        //after save we will show details in display mode..so setting this variable to true...
                        this.isDisplayMode = true;

                        //updating the category name and description here...
                        let itemTypeRecord = this.itemtypes.find(data => data.ItemTypeID ==
                            this.selectedItemTypeRecord.ItemTypeID);

                        itemTypeRecord.Name = itemtypeDetails.Name;
                        itemTypeRecord.ItemCategoryID = itemtypeDetails.ItemCategoryID;
                        itemTypeRecord.ItemCategoryName = this.itemcategorytypes.find(data => data.ItemCategoryID == itemTypeRecord.ItemCategoryID).Name;

                        itemTypeRecord.Description = itemtypeDetails.Description;

                        this.itemtypes = this.itemtypes.filter(data => data.ItemTypeID > 0);

                        this.selectedItemTypeRecord = itemTypeRecord;
                    }
                    else if (response.Status == "Duplicate") {
                        //setting the error for the "Name" control..so as to show the duplicate validation message..
                        this.itemtypeForm.get('Name').setErrors({
                            'Duplicate': true
                        });

                    }



                });
            }
        }
        else {
            this.itemtypeForm.markAsUntouched();
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
        FullScreen(this.rightPanelRef.nativeElement);
    }


    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the category details on cancel button click event..
     */
    cancelRecord() {
        //setting this variable to true so as to show the category details
        this.itemtypeForm.reset();
        this.itemtypeForm.setErrors(null);
        this.formSubmitAttempt = false;
        if (this.selectedItemTypeRecord.ItemTypeID > 0) {
            //setting this variable to true so as to show the category details
            this.isDisplayMode = true;
        }
        else if (this.itemtypes.length > 0) {
            this.selectedItemTypeRecord = this.itemtypes[0];
            //setting this variable to true so as to show the category details
            this.isDisplayMode = true;
        }
        else {
            this.isDisplayMode = null;
        }
    }


    /**
     * to delete the selected record...
     */
    deleteRecord() {
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let recordId = this.selectedItemTypeRecord.ItemTypeID;
                this.itemtypeServiceObj.deleteItemType(recordId).subscribe((data) => {
                    if (data == 0) {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.DeletedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        let recordIndex = this.itemtypes.findIndex(i => i.ItemTypeID == recordId);
                        this.itemtypes.splice(recordIndex, 1);
                    }
                    else {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.ExistingRecord,
                            MessageType: MessageTypes.NoChange
                        });
                    }


                    //checking if the itemCategory records exists...
                    if (this.itemtypes.length > 0) {
                        //if records exist then we will show the details of the first record...
                        this.selectedItemTypeRecord = this.itemtypes[0];
                    }
                    else {

                        this.isDisplayMode = null;

                        this.selectedItemTypeRecord = {

                            ItemTypeID: 0,
                            Name: "",
                            Description: "",
                            ItemCategoryID: 0,
                            ItemCategoryName: "",
                            CreatedBy: 0,
                            CreatedDate: null,
                            ModifiedBy: 0,
                            ModifiedDate:new Date(),
                        };
                    }
                });
            }
        });
    }

    closewindow() {


    }

}