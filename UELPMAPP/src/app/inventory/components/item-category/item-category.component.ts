import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ItemCategory, ItemCategoryDisplayInput } from "../../models/item-category.model";
import { ItemCategoryService } from "../../services/item-category.service";
import { ResponseStatusTypes, MessageTypes, UserDetails } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ResponseMessage, Messages } from "../../../shared/models/shared.model";
import { ConfirmationService } from "primeng/components/common/api";
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
    selector: 'app-item-category',
    templateUrl: './item-category.component.html',
    styleUrls: ['./item-category.component.css'],
    providers: [ItemCategoryService]
})
export class ItemCategoryComponent implements OnInit {
    userDetails: UserDetails = null;
    UserId:number;
    public selectedItems: any[];
    SelectedUOM: string = '';
    TotalSelectedUOM: number = 0;
    ExportTotalContacts: boolean = false;

    //array to store list of item categories..
    itemCategories: Array<ItemCategory> = [];

    selectedItemCategoryRecord: ItemCategory;

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
    FormMode:string;
    ItemCategoryId:number;

    constructor(
        private router: Router,
        public activatedRoute: ActivatedRoute,
        private itemCategoryServiceObj: ItemCategoryService,
        private sharedServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        public sessionService: SessionStorageService) {

            this.userDetails = <UserDetails>this.sessionService.getUser();


    }

    IntializeForm()
    {
        this.itemCategoryForm = new FormGroup({
            Name: new FormControl("", [Validators.required]),
            Description: new FormControl(""),

        });

        this.itemCategoryForm.setErrors(null);
    }
    ngOnInit() {
        this.UserId=this.userDetails.UserID;
        this.IntializeForm();

        this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
            if (param.get('mode') != undefined) {
              this.FormMode = param.get('mode');
            }
            if (param.get('Id') != undefined) {
              this.ItemCategoryId = parseInt(param.get('Id'));
            }
            // if (param.get('return') != undefined) {
            //   this.ReturnLink = param.get('return');
            // }
          });

        let roleAccessLevels = this.sessionService.getRolesAccess();
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

        debugger;
        if(this.FormMode=="NEW")
        {
            this.addRecord();
        }
        else
        {
            //Get Item Category Info
            this.GetItemCategorById(this.ItemCategoryId)
        }
        
    }

    "GetItemCategorById"(ItemCategoryId: any) {
        //this.blockUI.start("Loading..."); // Start blocking
        //this.showLoadingIcon = true;
        let lead = <Observable<any>>this.itemCategoryServiceObj.GetItemCategorById(ItemCategoryId);
        lead.subscribe((ItemCategoryRes) => {
          debugger;
          this.selectedItemCategoryRecord = ItemCategoryRes;
    
          //this.isDisplayMode = false;

          this.itemCategoryForm.patchValue(ItemCategoryRes);
 
        //   this.itemCategoryForm.get('Name').setValue(this.selectedItemCategoryRecord.Name);
        //   this.itemCategoryForm.get('Description').setValue(this.selectedItemCategoryRecord.Description);
    
          setTimeout(() => {
            //this.blockUI.stop(); // Stop blocking
    
          }, 300);
        });
    
      }
    showFullScreen(e) {
        FullScreen(this.rightPanelRef.nativeElement);
    }
    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }
    saveRecord() {
        this.formSubmitAttempt = true;
        let itemCategoryFormStatus = this.itemCategoryForm.status;
        //console.log(this.itemCategoryForm);
        if (itemCategoryFormStatus != "INVALID") {

            //getting the item category form details
            let itemCategoryDetails: ItemCategory = this.itemCategoryForm.value;

            itemCategoryDetails.CreatedBy=this.UserId;

            if (this.selectedItemCategoryRecord.ItemCategoryID == 0) {
                this.itemCategoryServiceObj.saveItemCategory(itemCategoryDetails).subscribe((response: { Status: string, Value: any }) => {

                    //if status is success then we will insert a new record into the array...
                    if (response.Status == ResponseStatusTypes.Success) {
                        this.sharedServiceObj.showMessage({

                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.router.navigate([`inventory/itemcategory`]);
                        
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

                debugger;
                itemCategoryDetails.ItemCategoryID = this.selectedItemCategoryRecord.ItemCategoryID;
                itemCategoryDetails.ModifiedBy=this.UserId;
                itemCategoryDetails.CreatedBy=this.UserId;

                this.itemCategoryServiceObj.updateItemCategory(itemCategoryDetails).subscribe((response: { Status: string, Value: any }) => {

                    //if status is success then we will insert a new record into the array...
                    if (response.Status == ResponseStatusTypes.Success) {
                        this.sharedServiceObj.showMessage({

                            ShowMessage: true,
                            Message: Messages.UpdatedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        this.router.navigate([`inventory/itemcategory`]);
                        

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
    addRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;

        this.selectedItemCategoryRecord = {

            Name: "",
            Description: "",
            ItemCategoryID: 0,
            CreatedBy: 0,
            CreatedDate:new Date(),
            ModifiedBy:1

        };

        //resetting the item category form..
        this.itemCategoryForm.reset();
        this.itemCategoryForm.setErrors(null);
    }
    editRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;

        //resetting the item category form.
        this.itemCategoryForm.reset();
        this.itemCategoryForm.setErrors(null);

        this.itemCategoryForm.get('Name').setValue(this.selectedItemCategoryRecord.Name);
        this.itemCategoryForm.get('Description').setValue(this.selectedItemCategoryRecord.Description);
    }
    ClickBack(e)
    {
        this.router.navigate([`inventory/itemcategory`]);
    }



}
