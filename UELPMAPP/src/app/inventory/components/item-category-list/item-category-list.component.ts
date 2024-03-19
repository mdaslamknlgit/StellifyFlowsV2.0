import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ItemCategory, ItemCategoryDisplayInput } from "../../models/item-category.model";
import { ItemCategoryService } from "../../services/item-category.service";
import { ResponseStatusTypes, MessageTypes, PagerConfig } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ResponseMessage, Messages } from "../../../shared/models/shared.model";
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { Router } from '@angular/router';
import { ExportToCsv } from 'export-to-csv';
import { ExcelJson } from '../../../../app/po/components/interfaces/excel-json.interface';
import { ExportService } from '../../../../app/po/services/export.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';  
import * as moment from 'moment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
    selector: 'app-item-category-list',
    templateUrl: './item-category-list.component.html',
    styleUrls: ['./item-category-list.component.css'],
    providers: [ItemCategoryService]
})
export class ItemCategoryListComponent implements OnInit {
    FileName:string="";
    FileNo:number=0;
    CurrentDate:string="";
    exportColumns;
    SelexportColumns;
    currentPage: number = 1;
    ItemCategoryListsPagerConfig: PagerConfig;
    ItemCategoryFilterForm: FormGroup;
    isFilterApplied: boolean = false;
    initDone = false;
    filterMessage: string = "";
    //array to store list of item categories..
    itemCategoriesList: Array<ItemCategory> = [];
    FilterItemCategoriesList: Array<ItemCategory> = [];

    itemCategoriesCols: any[];

    public selectedItems: any[];
    SelectedItemCategory: string = '';
    TotalSelectedItemCategory: number = 0;
    ExportTotalContacts: boolean = false;
    interval;

    selectedItemCategoryRecord: ItemCategory;


    //holds the total number of category records..
    TotalRecords:number=0;
    //form for creating item category
    itemCategoryForm: FormGroup;

    //whether the item content we are displaying is in edit/display mode...
    isDisplayMode?: boolean = true;

    leftsection: boolean = false;
    IsFilterDataArrive: boolean = false;
    rightsection: boolean = false;
    isSearchApplied: boolean = false;

    formSubmitAttempt: boolean = false;
    scrollbarOptions: any;
    @ViewChild('rightPanel') rightPanelRef;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    @BlockUI() blockUI: NgBlockUI;

   

    constructor(private itemCategoryServiceObj: ItemCategoryService,
        private exportService: ExportService,
        private router: Router,
        private sharedServiceObj: SharedService,
        private fb: FormBuilder,
        private confirmationServiceObj: ConfirmationService,
        public sessionService: SessionStorageService) {



        this.itemCategoryForm = new FormGroup({
            Name: new FormControl("", [Validators.required]),
            Description: new FormControl(""),

        });

        this.itemCategoryForm.setErrors(null);
    }
    ResetPagerConfig() {
        this.ItemCategoryListsPagerConfig.RecordsToSkip = 0;
        this.ItemCategoryListsPagerConfig.RecordsToFetch = 100;

        this.currentPage = 1;
    }
    private InitFilterForm(): void {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
    
        this.ItemCategoryFilterForm = this.fb.group({
            Name: [''],
            Description: ['']
        });
      }
    ngOnInit() {
        this.ItemCategoryListsPagerConfig = new PagerConfig();
        this.ResetPagerConfig();

        this.InitFilterForm();
        this.itemCategoriesCols = [
            { field: 'Name', header: 'Name', width: '400px' },
            { field: 'Description', header: 'Description', width: '150px' },
            { field: 'CreatedDate', header: 'CreatedOn', width: '150px' },
            { field: '', header: 'Action', width: '100px' },
        ];

        let roleAccessLevels = this.sessionService.getRolesAccess();
        //debugger;
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
            Skip: this.ItemCategoryListsPagerConfig.RecordsToSkip,
            Take: this.ItemCategoryListsPagerConfig.RecordsToFetch
        };
        //calling the service method to get the list of item categories...
        this.itemCategoryServiceObj.getItemCategories(displayInput)
            .subscribe((data: { ItemCategories: Array<ItemCategory>, TotalRecords: number }) => {

                this.IsFilterDataArrive=true;
                this.itemCategoriesList = data.ItemCategories;
                this.FilterItemCategoriesList=data.ItemCategories

                this.ItemCategoryListsPagerConfig.TotalRecords=data.TotalRecords;
                this.TotalRecords = data.TotalRecords;

                //checking if the item category records length is more than 0
                if (this.itemCategoriesList.length > 0) {   //setting the first record as the selected record...
                    this.selectedItemCategoryRecord = this.itemCategoriesList[0];

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

    pageChange(currentPageNumber: any) {

        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.ItemCategoryListsPagerConfig.RecordsToSkip = this.ItemCategoryListsPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            debugger;
            this.getItemCategories();
        }

    }
    ClickEditItemCategory(ItemCategoryId: any) {
        this.router.navigate([`inventory/itemcategory/${'EDIT'}/${ItemCategoryId}`]);
    }

    ClickNewItemCategory(e)
    {
        this.router.navigate([`inventory/itemcategory/${'NEW'}/${0}`]);
    }
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
                        this.itemCategoriesList.unshift({

                            ItemCategoryID: response.Value,
                            Name: itemCategoryDetails.Name,
                            Description: itemCategoryDetails.Description,
                            CreatedBy: 1,
                            CreatedDate:new Date(),
                            ModifiedBy:0
                        });

                        this.selectedItemCategoryRecord = this.itemCategoriesList[0];
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
                        let itemCategoryRecord = this.itemCategoriesList.find(data => data.ItemCategoryID ==
                            this.selectedItemCategoryRecord.ItemCategoryID);

                        itemCategoryRecord.Name = itemCategoryDetails.Name;

                        itemCategoryRecord.Description = itemCategoryDetails.Description;

                        this.itemCategoriesList = this.itemCategoriesList.filter(data => data.ItemCategoryID > 0);

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
            Skip: this.ItemCategoryListsPagerConfig.RecordsToSkip,
            Take: this.ItemCategoryListsPagerConfig.RecordsToFetch
        };
        this.itemCategoryServiceObj.getItemCategories(displayInput)
            .subscribe((data: { ItemCategories: Array<ItemCategory>, TotalRecords: number }) => {
                this.IsFilterDataArrive=true;
                this.itemCategoriesList = data.ItemCategories;
                this.FilterItemCategoriesList=data.ItemCategories
                this.TotalRecords = data.TotalRecords;
                this.ItemCategoryListsPagerConfig.TotalRecords=data.TotalRecords;
                if (this.itemCategoriesList.length > 0) {
                    this.selectedItemCategoryRecord = this.itemCategoriesList[0];
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
        else if (this.itemCategoriesList.length > 0) {
            this.selectedItemCategoryRecord = this.itemCategoriesList[0];
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
                        let recordIndex = this.itemCategoriesList.findIndex(i => i.ItemCategoryID == recordId);

                        //removing the record from the item categories list using index...
                        this.itemCategoriesList.splice(recordIndex, 1);
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
                    if (this.itemCategoriesList.length > 0) {
                        //if records exist then we will show the details of the first record...
                        this.selectedItemCategoryRecord = this.itemCategoriesList[0];
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
    filterData() {
        let name = "";
        let description = "";
        this.filterMessage = "";
        let SearchString="";

        debugger;
        if (this.ItemCategoryFilterForm.get('Name').value != "") {
            name = this.ItemCategoryFilterForm.get('Name').value;
        }
        if (this.ItemCategoryFilterForm.get('Description').value != "") {
            description = this.ItemCategoryFilterForm.get('Description').value;
        }
        if (name === "" && description === "") {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        if(name !="" && description!=""){
            SearchString=name+' '+description;;
        }
        else if(name !="" && description===""){
            SearchString=name;
        }
        else if(name ==="" && description!=""){
            SearchString=description;
        }


        this.isFilterApplied = true;
        this.GetAllSearchItemCategory(SearchString);
        this.initDone = false;
    }

    resetFilters() {
        this.ItemCategoryFilterForm.get('Name').setValue("");
        this.ItemCategoryFilterForm.get('Description').setValue("");
        this.filterMessage = "";
        this.FilterItemCategoriesList = this.itemCategoriesList;
        this.ItemCategoryListsPagerConfig.TotalRecords = this.FilterItemCategoriesList.length;
        if (this.itemCategoriesList.length > 0) {
            this.getItemCategories();
        }
        else {
            this.isDisplayMode = null;
        }
        this.isFilterApplied = false;
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
        this.ResetPagerConfig();
    }
//*********************************************************************************************************************/
//Export Code Starts Here
//*********************************************************************************************************************/
ExportToCSV() {
    const self=this;
    debugger;
    
    //Set Records To Fetch
    this.ItemCategoryListsPagerConfig.RecordsToSkip = 0;
    this.ItemCategoryListsPagerConfig.RecordsToFetch = 1000;
  
    //this.filterData();
    this.filterData();

    this.interval = setTimeout(() => {
        //alert("Alert activated")
        //
        if (this.IsFilterDataArrive) {
            //
            this.ResetPagerConfig();
            if (this.FilterItemCategoriesList.length > 0) {
                debugger;

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 20);
                this.FileName="ItemCategoryList_" + this.CurrentDate+"_"+this.FileNo.toString();

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
                    headers: ['Name', 'Description','CreatedBy','CreatedOn']
                };
                const csvExporter = new ExportToCsv(options);
                csvExporter.generateCsv(this.FilterItemCategoriesList);
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
            if (this.FilterItemCategoriesList.length > 0) {
                //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                //this.exportToExcel();
                const edata: Array<ExcelJson> = [];
                const udt: ExcelJson = {
                    data: [
                        { A: 'Item Category Lists' }, // title
                        { A: 'Name' ,B:  'Description',C: 'CreatedBy',D:'Created On' }, // table header
                    ],
                    skipHeader: true
                };
                this.FilterItemCategoriesList.forEach(polist => {
                    udt.data.push({
                        A: polist.Name,
                        B: polist.Description,
                        C: polist.CreatedBy,
                        D: polist.CreatedDate,
                    });
                });
                edata.push(udt);

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="MeasurementUnitsList__" + this.CurrentDate+"_"+this.FileNo.toString();

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
            
            if (this.FilterItemCategoriesList.length > 0) {
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

                let c=this.FilterItemCategoriesList;
                debugger;
                //Remove Action Column
                this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                const doc = new jsPDF('p', 'pt');
                doc['autoTable'](this.SelexportColumns, this.FilterItemCategoriesList);
                // doc.autoTable(this.exportColumns, this.products);

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="ItemCategoryList_" + this.CurrentDate+"_"+this.FileNo.toString();

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
    this.SelectedItemCategory = "";
    //debugger;
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedItemCategory == "") {
            this.SelectedItemCategory = this.selectedItems[i].ItemCategoryID;
        }
        else {
            this.SelectedItemCategory = this.SelectedItemCategory + "," + this.selectedItems[i].ItemCategoryID;
        }
    }
    this.TotalSelectedItemCategory = this.selectedItems.length;
    if (this.TotalSelectedItemCategory == 0) {
        this.SelectedItemCategory = "";
    }
    //alert("Un Selected Leads : " + this.SelectedItemCategory + "\n Total Un Selected Leads : " + this.TotalSelectedItemCategory);
}

onRowSelect(event) {
    let i = 0;
    this.SelectedItemCategory = "";
    //debugger;
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedItemCategory == "") {
            this.SelectedItemCategory = this.selectedItems[i].ItemCategoryID;
        }
        else {
            this.SelectedItemCategory = this.SelectedItemCategory + "," + this.selectedItems[i].ItemCategoryID;
        }
    }
    this.TotalSelectedItemCategory = this.selectedItems.length;
    //alert("Selected Leads : " + this.SelectedItemCategory + "\n Total Selected Leads : " + this.TotalSelectedItemCategory);
}
//************************************************************************************************************/    


}
