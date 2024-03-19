import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ItemCategory, ItemCategoryDisplayInput } from "../../models/item-category.model";
import { ItemCategoryService } from "../../services/item-category.service";
import { ResponseStatusTypes, MessageTypes } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ResponseMessage, Messages } from "../../../shared/models/shared.model";
import { ConfirmationService } from "primeng/components/common/api";
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';

@Component({
    selector: 'app-item-category-old',
    templateUrl: './item-category-old.component.html',
    styleUrls: ['./item-category-old.component.css'],
    providers: [ItemCategoryService]
})
export class ItemCategoryOldComponent implements OnInit {


    //array to store list of item categories..
    itemCategories: Array<ItemCategory> = [];

    selectedItemCategoryRecord: ItemCategory;

    //hold the number of records to skip...
    recordsToSkip: number = 0;

    //hold the number of records to fetch ...while showing in the list view..
    recordsToFetch: number = 10;

    //holds the total number of category records..
    totalRecords: number = 0;

    //form for creating item category
    itemCategoryForm: FormGroup;

    //whether the item content we are displaying is in edit/display mode...
    isDisplayMode?: boolean = true;

    leftsection: boolean = false;

    rightsection: boolean = false;
    isSearchApplied: boolean = false;

    formSubmitAttempt: boolean = false;
    scrollbarOptions: any;
    @ViewChild('rightPanel') rightPanelRef;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;

    constructor(private itemCategoryServiceObj: ItemCategoryService,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        public sessionService: SessionStorageService) {



        this.itemCategoryForm = new FormGroup({
            Name: new FormControl("", [Validators.required]),
            Description: new FormControl(""),

        });

        this.itemCategoryForm.setErrors(null);
    }

    ngOnInit() {
        let roleAccessLevels = this.sessionService.getRolesAccess();
        debugger;
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {        
            // 
            //let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "itemcategory")[0];  
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "itemmaster")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
        }
        else{
            this.newPermission = true;     
            this.editPermission = true;
            this.deletePermission = true;    
          }

        this.getItemCategories();
    }

    showFullScreen(e) {
        FullScreen(this.rightPanelRef.nativeElement);
    }

    /**
     * to set the selected item category record selection...
     */
    onItemRecordSelection(record: ItemCategory) {

        this.selectedItemCategoryRecord = record;
        this.isDisplayMode =true;

    }


    /**
     * to get the item categories...
     */
    getItemCategories() {
        let displayInput: ItemCategoryDisplayInput = {
            Search: "",
            Skip: this.recordsToSkip,
            Take: this.recordsToFetch
        };
        //calling the service method to get the list of item categories...
        this.itemCategoryServiceObj.getItemCategories(displayInput)
            .subscribe((data: { ItemCategories: Array<ItemCategory>, TotalRecords: number }) => {

                this.itemCategories = data.ItemCategories;

                this.totalRecords = data.TotalRecords;

                //checking if the item category records length is more than 0
                if (this.itemCategories.length > 0) {   //setting the first record as the selected record...
                    this.selectedItemCategoryRecord = this.itemCategories[0];

                }
                else {
                    this.isDisplayMode = null;
                    this.selectedItemCategoryRecord = {
                        Name: "",
                        Description: "",
                        ItemCategoryID: 0,
                        CreatedBy: 0,
                        CreatedDate:new Date(),
                        ModifiedBy:0
                    };
                }
            });
    }


    /**
     * to hide the category details and show in add mode..
     */
    addRecord(e) {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;

        this.selectedItemCategoryRecord = {

            Name: "",
            Description: "",
            ItemCategoryID: 0,
            CreatedBy: 0,
            CreatedDate:new Date(),
            ModifiedBy:0

        };

        //resetting the item category form..
        this.itemCategoryForm.reset();
        this.itemCategoryForm.setErrors(null);
    }

    /**
     * to hide the category details and show in edit mode...
     */
    editRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;

        //resetting the item category form.
        this.itemCategoryForm.reset();
        this.itemCategoryForm.setErrors(null);

        this.itemCategoryForm.get('Name').setValue(this.selectedItemCategoryRecord.Name);
        this.itemCategoryForm.get('Description').setValue(this.selectedItemCategoryRecord.Description);
    }



    /**
     * to save the given item category details...
     */
    saveRecord() {
        this.formSubmitAttempt = true;
        let itemCategoryFormStatus = this.itemCategoryForm.status;
        //console.log(this.itemCategoryForm);
        if (itemCategoryFormStatus != "INVALID") {

            //getting the item category form details
            let itemCategoryDetails: ItemCategory = this.itemCategoryForm.value;

            if (this.selectedItemCategoryRecord.ItemCategoryID == 0) {
                this.itemCategoryServiceObj.saveItemCategory(itemCategoryDetails).subscribe((response: { Status: string, Value: any }) => {

                    //if status is success then we will insert a new record into the array...
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
                        this.itemCategories.unshift({

                            ItemCategoryID: response.Value,
                            Name: itemCategoryDetails.Name,
                            Description: itemCategoryDetails.Description,
                            CreatedBy: 1,
                            CreatedDate:new Date(),
                            ModifiedBy:0
                        });

                        this.selectedItemCategoryRecord = this.itemCategories[0];
                    }//if status is duplicate we will show duplicate category message..
                    else if (response.Status == ResponseStatusTypes.Duplicate) {
                        //setting the error for the "Name" control..so as to show the duplicate validation message..
                        this.itemCategoryForm.get('Name').setErrors({
                            'Duplicate': true
                        });

                    }

                });
            }
            else {

                itemCategoryDetails.ItemCategoryID = this.selectedItemCategoryRecord.ItemCategoryID;


                this.itemCategoryServiceObj.updateItemCategory(itemCategoryDetails).subscribe((response: { Status: string, Value: any }) => {

                    //if status is success then we will insert a new record into the array...
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
                        let itemCategoryRecord = this.itemCategories.find(data => data.ItemCategoryID ==
                            this.selectedItemCategoryRecord.ItemCategoryID);

                        itemCategoryRecord.Name = itemCategoryDetails.Name;

                        itemCategoryRecord.Description = itemCategoryDetails.Description;

                        this.itemCategories = this.itemCategories.filter(data => data.ItemCategoryID > 0);

                        this.selectedItemCategoryRecord = itemCategoryRecord;

                    }//if status is duplicate we will show duplicate category message..
                    else if (response.Status == ResponseStatusTypes.Duplicate) {

                        //setting the error for the "Name" control..so as to show the duplicate validation message..
                        this.itemCategoryForm.get('Name').setErrors({

                            'Duplicate': true
                        });

                    }
                });
            }
        }
        else {
            this.itemCategoryForm.markAsUntouched();
        }
    }

    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }


    splite() {

        this.leftsection = !this.leftsection;
        this.rightsection = !this.rightsection;
    }

    onSearch(event: any) {
        if (event.target.value != "") {
            if (event.target.value.length >= 3) {
                this.isSearchApplied = true;
                this.GetAllSearchItemCategory(event.target.value);
            }
        }
        else {
            this.isSearchApplied = false;
            this.getItemCategories();
        }
    }

    GetAllSearchItemCategory(searchString: string): void {
        let displayInput: ItemCategoryDisplayInput = {
            Search: searchString,
            Skip: this.recordsToSkip,
            Take: this.recordsToFetch
        };
        this.itemCategoryServiceObj.getItemCategories(displayInput)
            .subscribe((data: { ItemCategories: Array<ItemCategory>, TotalRecords: number }) => {
                this.itemCategories = data.ItemCategories;
                this.totalRecords = data.TotalRecords;
                if (this.itemCategories.length > 0) {
                    this.selectedItemCategoryRecord = this.itemCategories[0];
                }
                else {
                    this.isDisplayMode = null;
                    this.selectedItemCategoryRecord = {
                        Name: "",
                        Description: "",
                        ItemCategoryID: 0,
                        CreatedBy: 0,
                        CreatedDate:new Date(),
                        ModifiedBy:0
                    };
                }
            });
    }


    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the category details on cancel button click event..
     */
    cancelRecord() {
        //setting this variable to true so as to show the category details
        this.itemCategoryForm.reset();
        this.itemCategoryForm.setErrors(null);
        this.formSubmitAttempt = false;
        if (this.selectedItemCategoryRecord.ItemCategoryID > 0) {
            //setting this variable to true so as to show the category details
            this.isDisplayMode = true;
        }
        else if (this.itemCategories.length > 0) {
            this.selectedItemCategoryRecord = this.itemCategories[0];
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

        let recordId = this.selectedItemCategoryRecord.ItemCategoryID;

        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {

                this.itemCategoryServiceObj.deleteItemCategory(recordId).subscribe((data) => {
                    if (data == 0) {
                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.DeletedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        let recordIndex = this.itemCategories.findIndex(i => i.ItemCategoryID == recordId);

                        //removing the record from the item categories list using index...
                        this.itemCategories.splice(recordIndex, 1);
                    }
                    else {
                        this.sharedServiceObj.showMessage({

                            ShowMessage: true,
                            Message: Messages.ExistingRecord,
                            MessageType: MessageTypes.NoChange
                        });
                    }
                    //getting the index of the item in the array...



                    //checking if the itemCategory records exists...
                    if (this.itemCategories.length > 0) {
                        //if records exist then we will show the details of the first record...
                        this.selectedItemCategoryRecord = this.itemCategories[0];
                    }
                    else {

                        this.isDisplayMode = null;

                        this.selectedItemCategoryRecord = {

                            Name: "",
                            Description: "",
                            ItemCategoryID: 0,
                            CreatedBy: 0,
                            CreatedDate:new Date(),
                            ModifiedBy:0

                        };
                    }
                });
            },
            reject: () => {



            }
        });


    }



}
