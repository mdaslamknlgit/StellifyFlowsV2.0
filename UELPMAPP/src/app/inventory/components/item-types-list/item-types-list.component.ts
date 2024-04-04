import { Component, OnInit, ViewChild, Renderer, ElementRef } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ExportItemType, ItemType, ItemTypeDisplayInput } from '../../models/item-type.model';
import { ItemTypeService } from '../../services/item-type.service';
import { debug } from 'util';
import { ResponseStatusTypes, Messages, ResponseMessage, MessageTypes, PagerConfig } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { Router } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { ExcelJson } from '../../../po/components/interfaces/excel-json.interface';
import { ExportService } from '../../../po/services/export.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';  
import * as moment from 'moment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
    selector: 'app-item-types-list',
    templateUrl: './item-types-list.component.html',
    styleUrls: ['./item-types-list.component.css'],
    providers: [ItemTypeService]
})
export class ItemTypesListComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;

    FileName:string="";
    FileNo:number=0;
    CurrentDate:string="";
    exportColumns;
    SelexportColumns;


    ItemTypesPagerConfig: PagerConfig;
    currentPage: number = 1;
    leftsection: boolean = false;
    rightsection: boolean = false;

    itemtypes: Array<ItemType> = [];
    FilterItemtemTypes: Array<ItemType> = [];
    itemtypesCols: any[];
    

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

    itemCategoriesCols: any[];

    public selectedItems: any[];
    SelectedItemTypes: string = '';
    TotalSelectedItemTypes: number = 0;
    ExportTotalContacts: boolean = false;
    interval;
    IsFilterDataArrive: boolean = false;


    constructor(
        private exportService: ExportService,
        private router: Router,
        private itemtypeServiceObj: ItemTypeService,
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


    }

    ngOnInit() {
        this.ItemTypesPagerConfig = new PagerConfig();
        this.ResetPagerConfig();
        this.itemtypesCols = [
            { field: 'Name', header: 'Name', width: '400px' },
            { field: 'Description', header: 'Description', width: '150px' },
            { field: 'ItemCategoryName', header: 'Category', width: '150px' },            
            { field: 'CreatedDate', header: 'CreatedOn', width: '150px' },
            { field: '', header: 'Action', width: '100px' },
        ];
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
        this.getItemCategoryList();
        this.getItemTypes();
        
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

                this.IsFilterDataArrive=true;
                this.itemtypes = data.ItemType;
                this.FilterItemtemTypes=data.ItemType;
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


    //New Code Starts Here
    ResetPagerConfig() {
        this.ItemTypesPagerConfig.RecordsToSkip = 0;
        this.ItemTypesPagerConfig.RecordsToFetch = 100;

        this.currentPage = 1;
    }
    ClickNewItemTypes(e)
    {
        this.router.navigate([`inventory/itemtypes/${'NEW'}/${0}`]);
    }
    ClickEditItemTypes(ItemTypeID: any) {
        this.router.navigate([`inventory/itemtypes/${'EDIT'}/${ItemTypeID}`]);
    }
//*********************************************************************************************************************/
//Export Code Starts Here
//*********************************************************************************************************************/
ExportToCSV() {
    const self=this;
    debugger;
    
    //Set Records To Fetch
    this.ItemTypesPagerConfig.RecordsToSkip = 0;
    this.ItemTypesPagerConfig.RecordsToFetch = 1000;
  
    //this.filterData();
    this.filterData();

    this.interval = setTimeout(() => {
        //alert("Alert activated")
        //
        if (this.IsFilterDataArrive) {
            //
            this.ResetPagerConfig();
            if (this.FilterItemtemTypes.length > 0) {
                debugger;

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 20);
                this.FileName="ItemCategoryTypesList_" + this.CurrentDate+"_"+this.FileNo.toString();

                //alert("Total Records CSV : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                const options = {
                    fieldSeparator: ',',
                    quoteStrings: '"',
                    decimalSeparator: '.',
                    showLabels: true,
                    //showTitle: true,
                    //title: 'Contacts List',
                    useTextFile: false,
                    useBom: true,
                    filename:this.FileName,
                    headers: ["Id",'Name', 'Description','Category','CreatedBy','CreatedOn']
                };
                const csvExporter = new ExportToCsv(options);
                csvExporter.generateCsv(this.FilterItemtemTypes);
                this.stopTime();
            }
        }
    }, 1000);

}

ExportToExcel() {
    const self=this;

    this.blockUI.start("Preparing Data...!!!"); // Start blocking
    this.filterData();
    this.interval = setTimeout(() => {
        //alert("Alert activated")
        
        if (this.IsFilterDataArrive) {
            
            this.blockUI.update("Exporting Data...!!!");
            this.blockUI.start("Exporting Data...!!!"); // Start blocking
            if (this.FilterItemtemTypes.length > 0) {
                //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                //this.exportToExcel();
                const edata: Array<ExcelJson> = [];
                const udt: ExcelJson = {
                    data: [
                        { A: 'Item Category Types Lists' }, // title
                        { A: 'Name' ,B:  'Description',C: 'CreatedBy',D:'Created On' }, // table header
                    ],
                    skipHeader: true
                };
                this.FilterItemtemTypes.forEach(polist => {
                    udt.data.push({
                        A: polist.Name,
                        B: polist.Description,
                        C: polist.ItemCategoryName,
                        D: polist.CreatedBy,
                        E: polist.CreatedDate,
                    });
                });
                edata.push(udt);

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="ItemCategoryTypesList_" + this.CurrentDate+"_"+this.FileNo.toString();

                this.exportService.exportJsonToExcel(edata, this.FileName);
                this.stopTime();
            }
        }
    }, 1000);
}

ExportToPDF() {
    //Get Filter Data
    this.blockUI.start("Preparing Data...!!!"); // Start blocking
    this.filterData();

    this.interval = setTimeout(() => {
        //alert("Alert activated")
        
        if (this.IsFilterDataArrive) {
            
            if (this.FilterItemtemTypes.length > 0) {
                //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

                this.exportColumns = this.itemCategoriesCols.map((col) => ({
                    title: col.header,
                    dataKey: col.field,
                }));
                let a= this.itemCategoriesCols.map((col) => ({
                    title: col.header,
                    dataKey: col.field,
                }));
                let b = this.exportColumns.filter(item => item.title !== "Action");

                let c=this.FilterItemtemTypes;
                debugger;
                //Remove Action Column
                this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                const doc = new jsPDF('p', 'pt');
                doc['autoTable'](this.SelexportColumns, this.FilterItemtemTypes);
                // doc.autoTable(this.exportColumns, this.products);

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="ItemCategoryTypesList__" + this.CurrentDate+"_"+this.FileNo.toString();

                doc.save(this.FileName+ '.pdf');

                //doc.save('PurchaseOrdersList.pdf');
                this.IsFilterDataArrive = false;
                this.stopTime();
            }
        }
    }, 1000);
}
stopTime() {
    clearInterval(this.interval);
    //this.showLeftPanelLoadingIcon = false;
    this.blockUI.start("Done Data...!!!"); // Start blocking
    this.blockUI.stop();
}
//*********************************************************************************************************************/
//Export Code Ends Here
//*********************************************************************************************************************/
//************************************************************************************************************/
//Sorting Functions
//************************************************************************************************************/
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
//************************************************************************************************************/

//************************************************************************************************************/
//Grid Functions
//************************************************************************************************************/

onRowUnselect(event) {
    let i = 0;
    this.SelectedItemTypes = "";
    //debugger;
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedItemTypes == "") {
            this.SelectedItemTypes = this.selectedItems[i].ItemCategoryID;
        }
        else {
            this.SelectedItemTypes = this.SelectedItemTypes + "," + this.selectedItems[i].ItemCategoryID;
        }
    }
    this.TotalSelectedItemTypes = this.selectedItems.length;
    if (this.TotalSelectedItemTypes == 0) {
        this.SelectedItemTypes = "";
    }
    //alert("Un Selected Leads : " + this.SelectedItemTypes + "\n Total Un Selected Leads : " + this.TotalSelectedItemTypes);
}

onRowSelect(event) {
    let i = 0;
    this.SelectedItemTypes = "";
    //debugger;
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedItemTypes == "") {
            this.SelectedItemTypes = this.selectedItems[i].ItemCategoryID;
        }
        else {
            this.SelectedItemTypes = this.SelectedItemTypes + "," + this.selectedItems[i].ItemCategoryID;
        }
    }
    this.TotalSelectedItemTypes = this.selectedItems.length;
    //alert("Selected Leads : " + this.SelectedItemTypes + "\n Total Selected Leads : " + this.TotalSelectedItemTypes);
}
//************************************************************************************************************/    


    //New Code Ends Here

}
