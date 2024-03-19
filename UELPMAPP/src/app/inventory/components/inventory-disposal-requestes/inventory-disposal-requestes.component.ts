import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormBuilder,FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from "../../../shared/services/shared.service";
import { ItemMaster, Location, ResponseStatusTypes, SortingOrderType, Messages, MessageTypes } from "../../../shared/models/shared.model";
import { InventoryDisposalRequest, InventoryDisposalRequestInput, InventoryDisposalRequestModel } from "../../models/inventory-disposal-requests.model";
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, catchError } from 'rxjs/operators';
import { InventoryDisposalRequestService } from "../../services/inventory-disposal-request.service";
import { GridOperations } from "../../../shared/models/shared.model";
import { LazyLoadEvent, SortEvent } from 'primeng/components/common/api';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
@Component({

    selector: 'app-inventory-disposal-requestes',
    templateUrl: './inventory-disposal-requestes.component.html',
    styleUrls: ['./inventory-disposal-requestes.component.css'],
    providers: [InventoryDisposalRequestService]
})
export class InventoryDisposalRequestesComponent implements OnInit {
    hidetext: boolean = true;
    hideinput: boolean = false;
    savedsucess: boolean = false;
    leftsection: boolean = false;
    rightsection: boolean = false;
    gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
    //this array will hold the list of columns to display in the grid..
    gridColumns: Array<{ field: string, header: string }> = [];
    //this array will hold the list of inventory disposal requests
    inventoryDisposalRequests: Array<InventoryDisposalRequestModel> = [];
    //this variable will hold the disposal items form.
    disposalGridItemsForm: FormGroup;
    //this variable will hold the record in edit mode...
    recordInEditMode: number;
    //this will tell whether we are using add/edit/delete mode the grid..
    operation: string;
    selectedLocation: Location;    
    recordsToSkip: number = 0;
    recordsToFetch: number = 5;
    sortingOrder: string = "";
    sortingExpr: string = "";
    totalRecords: number = 0;
    deletedRecords: Array<number> = [];
    isLoading: boolean = false;
    formSubmitAttempt: boolean = false;
    status: boolean;
    companyId:number;
    public screenWidth: any;
    constructor(private sharedServiceObj: SharedService,
        private inventoryDisposalReqObj: InventoryDisposalRequestService,
        public sessionService: SessionStorageService) {

            this.companyId = this.sessionService.getCompanyId();


        this.gridColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'ItemMasterName', header: 'Item Name' },
            { field: 'ExistingQuantity', header: 'Qty. in hand' },
            { field: 'InventoryDisposalQty', header: 'Disposal Quantity' },
            { field: 'ReasonForDisposal', header: 'Reason' }
        ];


        this.disposalGridItemsForm = new FormGroup({
            "LocationId": new FormControl(null, [Validators.required]),
            "Item": new FormControl("", Validators.required),
            "ExistingQuantity": new FormControl(0),
            "InventoryDisposalQty": new FormControl(0, [Validators.required, Validators.min(1)]),
            "ReasonForDisposal": new FormControl("")
        });

    }
    ngOnInit() {
    this.screenWidth = window.innerWidth-180;
       
    }
    /**
     * this method is used to format the content to be display in the autocomplete textbox after selection..
     */
    locationInputFormater = (x: Location) => x.Name;

    /**
     * this mehtod will be called when user gives contents to the  "locsation" autocomplete...
    */
    locationSearch = (text$: Observable<string>) =>

        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getLocationByKey(term).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            )
        );

    /**
    * this method is used to format the content to be display in the autocomplete textbox after selection..
    */
    itemMasterInputFormater = (x: ItemMaster) => x.ItemName;

    /**
     * this mehtod will be called when user gives contents to the  "item master" autocomplete...
     */
    itemMasterSearch = (text$: Observable<string>) =>

        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getItemMasterByKey({
                    searchKey: term,
                    CompanyId:this.companyId,
                    LocationID: this.selectedLocation.LocationID
                }).pipe(
                    catchError(() => {

                        return of([]);
                    }))
            )
        );

    /**
     * this method will be called on "item master" autocomplete value selection.
     */
    itemMasterSelection(eventData: any) {
        //setting the existing qty based on user selection 
        this.disposalGridItemsForm.get('ExistingQuantity').setValue(eventData.item.ExistingQuantity);
    }

    /**
     * to add new record to the grid
     */
    addRecord() {
        if (this.operation == GridOperations.Add) {
            this.saveGridItem(this.recordInEditMode);
        }
        else if (this.operation == GridOperations.Edit) {
            this.updateGridItem(this.recordInEditMode);
        }

        let formStatus = this.disposalGridItemsForm.status;

        //if form status is not invalid....
        if (formStatus != "INVALID" || this.operation == GridOperations.Display) {
            //resetting the form to original values..
            //this.disposalGridItemsForm.reset();
            this.disposalGridItemsForm.patchValue({
                Item: "",
                InventoryDisposalQty: "",
                ReasonForDisposal: ""
            })

            if (this.operation != GridOperations.Add) {
                //pushing the inventory requests into the array...
                this.inventoryDisposalRequests.unshift({

                    InventoryDisposalId: 0,
                    ItemMasterId: 0,
                    ItemMasterName: "",
                    ExistingQuantity: 0,
                    InventoryDisposalQty: 0,
                    ReasonForDisposal: "",
                    WorkFlowStatusId: 0,
                    WorkFlowStatus: ""

                });
            }

            //setting the first row as in edit mode..
            this.recordInEditMode = 0;
            this.operation = GridOperations.Add;
        }
    }

    validateControl(control: any) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }


    /**
     * to push the grid details into the array...
     */
    saveGridItem(rowIndex: number) {

        let formStatus = this.disposalGridItemsForm.status;

        let inventoryFormDetails = this.disposalGridItemsForm.value;

        //if form status is not invalid....
        if (formStatus != "INVALID") {
            console.log(inventoryFormDetails, rowIndex);

            //updating the inventory record details....
            let inventoryRecord = this.inventoryDisposalRequests[rowIndex];
            inventoryRecord.ExistingQuantity = inventoryFormDetails.ExistingQuantity;
            inventoryRecord.InventoryDisposalQty = inventoryFormDetails.InventoryDisposalQty;
            inventoryRecord.ItemMasterId = inventoryFormDetails.Item.ItemMasterId;
            inventoryRecord.ItemMasterName = inventoryFormDetails.Item.ItemName;
            inventoryRecord.ReasonForDisposal = inventoryFormDetails.ReasonForDisposal;

            this.inventoryDisposalRequests = this.inventoryDisposalRequests.filter(i => i.ItemMasterId != null);

            //removing the edit mode
            this.recordInEditMode = -1;

            this.operation = GridOperations.Display;
            return true;
        }
        else {
            if (inventoryFormDetails.Item == null || inventoryFormDetails.InventoryDisposalQty == null) {
                if (inventoryFormDetails.Item == null) {
                    this.disposalGridItemsForm.get('Item').markAsTouched();
                }
                if (inventoryFormDetails.InventoryDisposalQty == null) {
                    this.disposalGridItemsForm.get('InventoryDisposalQty').markAsTouched();
                }
            }
            else if (inventoryFormDetails.InventoryDisposalQty > inventoryFormDetails.ExistingQuantity) {
                this.disposalGridItemsForm.get('InventoryDisposalQty').setErrors({
                    'invalidQty': true
                });
            }
            return false;
        }
    }


    editGridItem(rowIndex: number) {
        if (this.operation == GridOperations.Add && this.disposalGridItemsForm.status != "INVALID")//if current operation is addd.
        {
            //removing the top most record from the array...
            this.inventoryDisposalRequests.splice(0, 1);

            this.inventoryDisposalRequests = this.inventoryDisposalRequests.filter(i => i.ItemMasterId != null);

            rowIndex = rowIndex - 1;
        }
        else if (this.operation == GridOperations.Add) {
            this.saveGridItem(this.recordInEditMode);
        }
        else if (this.operation == GridOperations.Edit) {
            this.updateGridItem(this.recordInEditMode);
        }

        //setting the record in edit mode..
        this.recordInEditMode = rowIndex;

        //this.disposalGridItemsForm.reset();
        this.disposalGridItemsForm.patchValue({
            Item: "",
            ExistingQuantity: 0,
            InventoryDisposalQty: "",
            ReasonForDisposal: ""
        })

        let record = this.inventoryDisposalRequests[rowIndex];

        let itemObj: ItemMaster;

        record["Item"] = {

            ItemMasterId: record.ItemMasterId,
            ItemName: record.ItemMasterName,
            Description: record.ReasonForDisposal
        };

        this.disposalGridItemsForm.patchValue(record);

        this.operation = GridOperations.Edit;
    }


    /**
     * to update the grid record item....
     */
    updateGridItem(rowIndex: number) {

        let formStatus = this.disposalGridItemsForm.status;
        let formValue = this.disposalGridItemsForm.value;
        //if form status is not invalid....
        if (formStatus != "INVALID") {
            let record = this.inventoryDisposalRequests[rowIndex];

            record.IsModified = true;
            record.ItemMasterId = record["Item"].ItemMasterId;
            record.ItemMasterName = record["Item"].ItemName;
            record.ReasonForDisposal = formValue.ReasonForDisposal;
            record.InventoryDisposalQty = formValue.InventoryDisposalQty;

            this.inventoryDisposalRequests = this.inventoryDisposalRequests.filter(i => i.ItemMasterId != null);
            this.recordInEditMode = -1;
            this.operation = GridOperations.Display;
            return true;

        }
        else {
            if (formValue.Item == null || formValue.InventoryDisposalQty == null) {
                if (formValue.Item == null) {
                    this.disposalGridItemsForm.get('Item').markAsTouched();
                }
                if (formValue.InventoryDisposalQty == null) {
                    this.disposalGridItemsForm.get('InventoryDisposalQty').markAsTouched();
                }
            }
            else if (formValue.InventoryDisposalQty > formValue.ExistingQuantity) {
                this.disposalGridItemsForm.get('InventoryDisposalQty').setErrors({
                    'invalidQty': true
                });
            }
            return false;
        }

        // this.disposalGridItemsForm.reset();
        // this.recordInEditMode = -1;
        // this.operation = GridOperations.Display;
    }


    /**
     * to cancel the grid items....
     */
    cancelGridItem() {
        //if operation is in add mode..
        if (this.operation == GridOperations.Add)//if grid operation id "Add"
        {
            //removing the row at 0th index..
            this.inventoryDisposalRequests.splice(0, 1);
            this.inventoryDisposalRequests = this.inventoryDisposalRequests.filter(i => i.ItemMasterId != null);
        }
        // this.disposalGridItemsForm.reset();
        this.disposalGridItemsForm.patchValue({
            Item: "",
            ExistingQuantity: 0,
            InventoryDisposalQty: "",
            ReasonForDisposal: ""
        })
        this.recordInEditMode = -1;
        this.operation = GridOperations.Display;
    }



    /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex: number) {

        let record = this.inventoryDisposalRequests[rowIndex];

        this.deletedRecords.push(record.InventoryDisposalId);

        this.inventoryDisposalRequests.splice(rowIndex, 1);

        this.inventoryDisposalRequests = this.inventoryDisposalRequests.filter(i => i.ItemMasterId != null);
        this.status = true;

    }



    /**
     * this method will be called on location selection ...
     */
    onLocationSelection(event: any) {
        this.selectedLocation = event.item;
        //getting the inventory requests based on location selection..
        this.getInventoryDisposalRequests();
    }



    getInventoryDisposalRequests() {
        if (this.selectedLocation != undefined) {

            let requestObj: InventoryDisposalRequestInput = {

                LocationId: this.selectedLocation.LocationID,
                Skip: this.recordsToSkip,
                Take: this.recordsToFetch,
                SortDirection: this.sortingOrder,
                SortExpression: this.sortingExpr
            };

            this.isLoading = true;

            this.inventoryDisposalReqObj.getInventoryDisposalRequests(requestObj)
                .subscribe((data: { InventoryDisposalRequests: Array<InventoryDisposalRequestModel>, TotalRecords: number }) => {

                    this.inventoryDisposalRequests = data.InventoryDisposalRequests;

                    this.totalRecords = data.TotalRecords;

                    this.operation = GridOperations.Display;

                    this.isLoading = false;

                });
        }
    }


    /**
     * to save all the grid changes..
     */
    saveAllChanges() {

        this.formSubmitAttempt = true;
        //let status;
        if (this.selectedLocation != undefined) {
            if (this.operation == GridOperations.Add) {
                this.status = this.saveGridItem(this.recordInEditMode);
            }
            else if (this.operation == GridOperations.Edit) {
                this.status = this.updateGridItem(this.recordInEditMode);
            }
            if (this.status) {
                let inventoryReqObj: InventoryDisposalRequest = {

                    LocationId: this.selectedLocation.LocationID,
                    InventoryReqToAdd: this.inventoryDisposalRequests.filter(j => j.InventoryDisposalId == null || j.InventoryDisposalId == 0),
                    InventoryReqToDelete: this.deletedRecords,
                    InventoryReqToUpdate: this.inventoryDisposalRequests.filter(j => j.IsModified == true && j.InventoryDisposalId > 0),
                };

                if (inventoryReqObj.InventoryReqToAdd.length > 0 || inventoryReqObj.InventoryReqToDelete.length > 0 || inventoryReqObj.InventoryReqToUpdate.length > 0) {

                    this.inventoryDisposalReqObj.createInventoryDisposalRequest(inventoryReqObj).subscribe((data) => {

                        this.sharedServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.SavedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        //making the array empty...
                        this.deletedRecords = [];
                        this.formSubmitAttempt = false;
                        this.deletedRecords.length = 0;
                        this.getInventoryDisposalRequests();

                    });
                }
                else {
                    this.formSubmitAttempt = true;
                    this.sharedServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.NoChangesDetected,
                        MessageType: MessageTypes.NoChange
                    });
                }
            }
        }
        else {
            this.disposalGridItemsForm.markAsUntouched();
        }

    }


    /**
     * this method will be called on the change event on 
     * quantity numeric text box change event...
     * @param qtyChange 
     */
    qtyChange(qtyChange: any) {

        if (this.disposalGridItemsForm.get('Item').value != null) {

            let currentQty = this.disposalGridItemsForm.get('ExistingQuantity').value;

            let selectedQty = this.disposalGridItemsForm.get('InventoryDisposalQty').value;

            console.log(selectedQty, currentQty);
            if (selectedQty > currentQty) {

                this.disposalGridItemsForm.get('InventoryDisposalQty').setErrors({

                    'invalidQty': true

                });

            }
            else {
                this.disposalGridItemsForm.get('InventoryDisposalQty').setErrors(null);
            }
        }
    }


    /**
     * this method will be called on grid pager..next page click event...
     * @param event 
     */
    loadGridItems(event: LazyLoadEvent) {
        console.log("getting items...", event);

        this.recordsToSkip = event.first;

        if (event.sortOrder == 1) {
            this.sortingOrder = SortingOrderType.Ascending
        }
        else {
            this.sortingOrder = SortingOrderType.Descending
        }

        this.sortingExpr = event.sortField;
        this.getInventoryDisposalRequests();

    }
}
