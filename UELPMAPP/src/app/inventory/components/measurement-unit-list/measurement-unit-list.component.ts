import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { MeasurementUnit, MeasurementUnitDisplayInput } from "../../models/uom.model";
import { UomService } from "../../services/uom.service";
import { ResponseStatusTypes, Messages, ResponseMessage, MessageTypes, PagerConfig, UserDetails } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { ConfirmationService, SortEvent } from "primeng/components/common/api";
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { ExportToCsv } from 'export-to-csv';
import { ExcelJson } from '../../../../app/po/components/interfaces/excel-json.interface';
import { ExportService } from '../../../../app/po/services/export.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';  
import * as moment from 'moment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
    selector: 'app-measurement-unit-list',
    templateUrl: './measurement-unit-list.component.html',
    styleUrls: ['./measurement-unit-list.component.css'],
    providers: [UomService]
})
export class MeasurementUnitListComponent implements OnInit {


    @ViewChild("Name") nameInput: ElementRef;
    @ViewChild('rightPanel') rightPanelRef;

    measurementUnitsList: Array<MeasurementUnit> = [];
    FilterMeasurementUnitsList: Array<MeasurementUnit> = [];
    MeasurementUnitsListCols: any[];

    showLeftPanelLoadingIcon: boolean = false;
    TotalRecords:number=0;

    public selectedItems: any[];
    SelectedUOM: string = '';
    TotalSelectedUOM: number = 0;
    ExportTotalContacts: boolean = false;
    
    interval;
    currentPage: number = 1;
    selectedRecord: MeasurementUnit;
    measurementUnitForm: FormGroup;
    isDisplayMode?: boolean = true;
    showMessage: boolean = false;
    message: string = "";
    leftsection: boolean = false;
    showfilters: boolean = true;
    rightsection: boolean = false;
    formSubmitAttempt: boolean = false;
    scrollbarOptions: any;
    isSearchApplied: boolean = false;
    filterMessage: string = "";
    initDone = false;
    isFilterApplied: boolean = false;
    uomFilterInfoForm: FormGroup;
    filteredUom: Array<MeasurementUnit> = [];
    errorMessage: string = Messages.NoRecordsToDisplay;
    measurementUnitsListPagerConfig: PagerConfig;
    
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    FileName:string="";
    FileNo:number=0;
    CurrentDate:string="";
    exportColumns;
    SelexportColumns;
   
    IsFilterDataArrive: boolean = false;
    @BlockUI() blockUI: NgBlockUI;
    MeasurementUnitFilterInfoForm: FormGroup;

    constructor(
        private exportService: ExportService,
        private formBuilderObj: FormBuilder,
        private uomServiceObj: UomService,
        private router: Router,
        private headerServiceObj: SharedService,
        private confirmationServiceObj: ConfirmationService,
        private renderer: Renderer,
        private fb: FormBuilder,
        public sessionService: SessionStorageService) {
        //setting the default value for record selection.
        this.selectedRecord = {
            Name: "",
            Code: "",
            Description: "",
            Abbreviation: "",
            MeasurementUnitID: 0,
            CreatedBy: 0,
            CreatedOn:new Date(),
            ModifiedBy: 0
        };
        this.measurementUnitForm = new FormGroup({

            Name: new FormControl("", [Validators.required, Validators.maxLength(50)]),
            Code: new FormControl("", [Validators.required, Validators.maxLength(50)]),
            Abbreviation: new FormControl("", [Validators.required, Validators.maxLength(10)]),
            Description: new FormControl(""),
        });

        this.initDone = true;
        this.measurementUnitsListPagerConfig = new PagerConfig();
        this.measurementUnitsListPagerConfig.RecordsToSkip = 0;
        this.measurementUnitsListPagerConfig.RecordsToFetch = 20;

    }
    private InitFilterForm(): void {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
    
        this.uomFilterInfoForm = this.fb.group({
            Name: [''],
            Code: ['']
        });
      }
    ngOnInit() {
        this.InitFilterForm();
        this.MeasurementUnitsListCols = [
            { field: 'Code', header: 'Code', width: '100px' },
            { field: 'Name', header: 'Name', width: '200px' },
            { field: 'Abbreviation', header: 'Abbreviation', width: '150px' },
            { field: 'Description', header: 'Description', width: '150px' },
            { field: 'CreatedBy', header: 'CreatedBy', width: '150px' },
            { field: 'CreatedOn', header: 'CreatedOn', width: '150px' },
            { field: '', header: 'Action', width: '100px' },
        ];
        this.measurementUnitsListPagerConfig = new PagerConfig();
        this.ResetPagerConfig();

        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {
            let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "uom")[0];
            this.newPermission = formRole.IsAdd;
            this.editPermission = formRole.IsEdit;
            this.deletePermission = formRole.IsDelete;
        }
        else {
            this.newPermission = true;
            this.editPermission = true;
            this.deletePermission = true;
        }
        this.showfilters = true;
        this.GetAllUnits();


    }

    showFullScreen() {
        FullScreen(this.rightPanelRef.nativeElement);
    }


    GetAllSearchUOM(searchString: string, name: string = "", code: string = ""): void {
        let displayUOMGrid: MeasurementUnitDisplayInput = {
            Search: searchString,
            Skip: this.measurementUnitsListPagerConfig.RecordsToSkip,
            Take: this.measurementUnitsListPagerConfig.RecordsToFetch,
            Name: name,
            Code: code
        };

        this.uomServiceObj.getAllMeasurementUnits(displayUOMGrid)
            .subscribe((data: { MeasurementUnits: Array<MeasurementUnit>, TotalRecords: number }) => {
                debugger;
                this.measurementUnitsList = data.MeasurementUnits;
                this.FilterMeasurementUnitsList=data.MeasurementUnits;

                this.filteredUom = this.measurementUnitsList;
                this.measurementUnitsListPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                this.IsFilterDataArrive=true;
                if (this.measurementUnitsList.length > 0) {

                    this.selectedRecord = this.measurementUnitsList[0];
                }
                else {
                    this.isDisplayMode = true;
                }
            });
    }

    onSearch(event: any) {
        if (event.target.value != "") {
            this.isSearchApplied = true;
            this.GetAllSearchUOM(event.target.value);
        }
        else {
            this.isSearchApplied = false;
            this.GetAllUnits();
        }
    }

    openDialog() {
        this.initDone = true;
        this.nameInput.nativeElement.focus();
        this.renderer.invokeElementMethod(this.nameInput.nativeElement, 'focus');
    }

    filterData() {
        let name = "";
        let code = "";
        this.filterMessage = "";
        if (this.uomFilterInfoForm.get('Name').value != null) {
            name = this.uomFilterInfoForm.get('Name').value;
        }
        if (this.uomFilterInfoForm.get('Code').value != "") {
            code = this.uomFilterInfoForm.get('Code').value;
        }
        if (name === "" && code === "") {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }
        this.isFilterApplied = true;
        this.GetAllSearchUOM("", name, code);
        this.initDone = false;
    }

    resetFilters() {
        this.uomFilterInfoForm.get('Name').setValue("");
        this.uomFilterInfoForm.get('Code').setValue("");
        this.filterMessage = "";
        this.filteredUom = this.measurementUnitsList;
        this.measurementUnitsListPagerConfig.TotalRecords = this.filteredUom.length;
        if (this.measurementUnitsList.length > 0) {
            this.GetAllUnits();
        }
        else {
            this.isDisplayMode = null;
        }
        this.isFilterApplied = false;
        if (this.nameInput != undefined) {
            this.nameInput.nativeElement.focus();
            this.renderer.invokeElementMethod(this.nameInput.nativeElement, 'focus'); // NEW VERSION
        }

    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    /**
     * to get the item categories...
     */
    GetAllUnits() {
        let displayInput: MeasurementUnitDisplayInput = {
            Search: "",
            Skip: this.measurementUnitsListPagerConfig.RecordsToSkip,
            Take: this.measurementUnitsListPagerConfig.RecordsToFetch,
        };
        //calling the service method to get the list of item categories...
        this.uomServiceObj.getUnits(displayInput)
            .subscribe((data: { MeasurementUnits: Array<MeasurementUnit>, TotalRecords: number }) => {
                this.IsFilterDataArrive=true;
                this.FilterMeasurementUnitsList=data.MeasurementUnits;
                this.measurementUnitsList = data.MeasurementUnits;
                this.measurementUnitsListPagerConfig.TotalRecords = data.TotalRecords;
                this.TotalRecords=data.TotalRecords;
                //checking if the item category records length is more than 0
                if (this.measurementUnitsList.length > 0) {   //setting the first record as the selected record...
                    this.selectedRecord = this.measurementUnitsList[0];
                }
                else {
                    this.isDisplayMode = null;
                    this.selectedRecord = {
                        Name: "",
                        Code: "",
                        Description: "",
                        Abbreviation: "",
                        MeasurementUnitID: 0,
                        CreatedBy: 0,
                        CreatedOn:new Date(),
                        ModifiedBy: 0
                    };
                }
                if (this.isSearchApplied) {
                    //this.GetAllSearchmeasurementUnits(this.searchInputRef.nativeElement.value);
                }
            });
    }


    /**
     * to hide the category details and show in add mode..
     */
    ClickNewMeasurementUnit(e) {
        this.router.navigate([`/inventory/uom/${'NEW'}/${0}/1`]);
    }
    ClickEditMeasurementUnit(MeasurementUnitID: any) {
        this.router.navigate([`/inventory/uom/${'EDIT'}/${MeasurementUnitID}/1`]);
    }
    pageChange(currentPageNumber: any) {

        if (currentPageNumber != null && currentPageNumber != undefined) {
            this.measurementUnitsListPagerConfig.RecordsToSkip = this.measurementUnitsListPagerConfig.RecordsToFetch * (currentPageNumber - 1);
            debugger;
            this.GetAllUnits();
        }

    }
    addRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;
        this.selectedRecord = {
            Name: "",
            Code: "",
            Description: "",
            Abbreviation: "",
            MeasurementUnitID: 0,
            CreatedBy: 0,
            CreatedOn:new Date(),
            ModifiedBy: 0
        };
        //resetting the item category form..
        this.measurementUnitForm.reset();
        this.showfilters = false;

    }
    ResetPagerConfig() {
        this.measurementUnitsListPagerConfig.RecordsToSkip = 0;
        this.measurementUnitsListPagerConfig.RecordsToFetch = 25;

        this.currentPage = 1;
    }

    /**
     * to hide the category details and show in edit mode...
     */
    editRecord() {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;

        //resetting the item category form.
        this.measurementUnitForm.reset();

        //binding the selected record details to the form...
        this.measurementUnitForm.get('Name').setValue(this.selectedRecord.Name);
        this.measurementUnitForm.get('Code').setValue(this.selectedRecord.Code);
        this.measurementUnitForm.get('Abbreviation').setValue(this.selectedRecord.Abbreviation);
        this.measurementUnitForm.get('Description').setValue(this.selectedRecord.Description);
    }

    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }
    /**
     * to save the given item category details...
     */
    saveRecord() {
        this.formSubmitAttempt = true;
        //getting the status of the form
        let measurementUnitFormStatus = this.measurementUnitForm.status;
        if (measurementUnitFormStatus != "INVALID") {
            //getting the item category form details
            let measurementUnitDetails: MeasurementUnit = this.measurementUnitForm.value;
            //if measurement id is 0 then we are inserting a new record..
            if (this.selectedRecord.MeasurementUnitID == 0) {
                this.uomServiceObj.createUnit(measurementUnitDetails).subscribe((response) => {

                    this.headerServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.SavedSuccessFully,
                        MessageType: MessageTypes.Success
                    });
                    this.formSubmitAttempt = false;
                    this.showMessage = true;
                    //after save we will show details in display mode..so setting this variable to true...
                    this.isDisplayMode = true;
                    //pushing the record details into the array...
                    this.measurementUnitsList.unshift({
                        MeasurementUnitID: response,
                        Name: measurementUnitDetails.Name,
                        Code: measurementUnitDetails.Code,
                        Description: measurementUnitDetails.Description,
                        Abbreviation: measurementUnitDetails.Abbreviation,
                        CreatedBy: 1,
                        CreatedOn:new Date(),
                        ModifiedBy: 1
                    });
                    this.selectedRecord = this.measurementUnitsList[0];
                }, (data: HttpErrorResponse) => {
                    let message: string = data.error.Message;
                    if (message.includes("duplicate")) {
                        this.showDuplicateMessage(message);
                    }
                });
            }
            else//updating the record...
            {

                measurementUnitDetails.MeasurementUnitID = this.selectedRecord.MeasurementUnitID;

                this.uomServiceObj.updateUnit(measurementUnitDetails).subscribe((response) => {

                    this.headerServiceObj.showMessage({
                        ShowMessage: true,
                        Message: Messages.UpdatedSuccessFully,
                        MessageType: MessageTypes.Success
                    });
                    this.formSubmitAttempt = false;
                    this.showMessage = true;
                    this.isDisplayMode = true;
                    let measurementRecord = this.measurementUnitsList.find(data => data.MeasurementUnitID ==
                        this.selectedRecord.MeasurementUnitID);
                    measurementRecord.Name = measurementUnitDetails.Name;
                    measurementRecord.Code = measurementUnitDetails.Code;
                    measurementRecord.Abbreviation = measurementUnitDetails.Abbreviation;
                    measurementRecord.Description = measurementUnitDetails.Description;

                    this.measurementUnitsList = this.measurementUnitsList.filter(data => data.MeasurementUnitID > 0);
                    this.selectedRecord = measurementRecord;
                }, (data: HttpErrorResponse) => {
                    let message: string = data.error.Message;
                    if (message.includes("duplicate")) {
                        this.showDuplicateMessage(message);
                    }
                });
            }
        }
        else {
            this.measurementUnitForm.markAsUntouched();
        }

    }

    showDuplicateMessage(message: string) {
        if (message == "duplicatename") {
            //setting the error for the "Name" control..so as to show the duplicate validation message..
            this.measurementUnitForm.get('Name').setErrors({

                'Duplicate': true
            });
        }
        else if (message == "duplicatecode") {
            //setting the error for the "Code" control..so as to show the duplicate validation message..
            this.measurementUnitForm.get('Code').setErrors({
                'Duplicate': true
            });
        }
    }
    onClickedOutside(e: Event) {
        //  this.showfilters= false; 
        if (this.showfilters == false) {
            // this.showfilterstext="Show List"
        }
    }

    split() {
        this.showfilters = !this.showfilters;

        //  this.leftsection= !this.leftsection;
        //  this.rightsection= !this.rightsection;
    }

    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the category details on cancel button click event..
     */
    cancelRecord() {
        this.formSubmitAttempt = false;
        if (this.selectedRecord.MeasurementUnitID > 0) {
            this.isDisplayMode = true;
        }
        else if (this.measurementUnitsList.length > 0) {
            this.selectedRecord = this.measurementUnitsList[0];
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
                let recordId = this.selectedRecord.MeasurementUnitID;
                let userDetails = <UserDetails>this.sessionService.getUser();
                this.uomServiceObj.deleteUnit(recordId, userDetails.UserID).subscribe((data) => {
                    if (data == 0) {
                        this.headerServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.DeletedSuccessFully,
                            MessageType: MessageTypes.Success
                        });
                        let recordIndex = this.measurementUnitsList.findIndex(i => i.MeasurementUnitID == recordId);
                        this.measurementUnitsList.splice(recordIndex, 1);
                    }
                    else {
                        this.headerServiceObj.showMessage({
                            ShowMessage: true,
                            Message: Messages.ExistingRecord,
                            MessageType: MessageTypes.NoChange
                        });
                    }
                    if (this.measurementUnitsList.length > 0) {
                        this.selectedRecord = this.measurementUnitsList[0];
                    }
                    else {
                        this.isDisplayMode = null;
                        this.selectedRecord = {
                            Name: "",
                            Code: "",
                            Abbreviation: "",
                            Description: "",
                            MeasurementUnitID: 0,
                            CreatedBy: 0,
                            CreatedOn:new Date(),
                            ModifiedBy: 0
                        };
                    }
                });
            }
        });
    }
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
        this.SelectedUOM = "";
        //debugger;
        for (i = 0; i <= this.selectedItems.length - 1; i++) {
            if (this.SelectedUOM == "") {
                this.SelectedUOM = this.selectedItems[i].MeasurementUnitID;
            }
            else {
                this.SelectedUOM = this.SelectedUOM + "," + this.selectedItems[i].MeasurementUnitID;
            }
        }
        this.TotalSelectedUOM = this.selectedItems.length;
        if (this.TotalSelectedUOM == 0) {
            this.SelectedUOM = "";
        }
        //alert("Un Selected Leads : " + this.SelectedUOM + "\n Total Un Selected Leads : " + this.TotalSelectedUOM);
    }

    onRowSelect(event) {
        let i = 0;
        this.SelectedUOM = "";
        //debugger;
        for (i = 0; i <= this.selectedItems.length - 1; i++) {
            if (this.SelectedUOM == "") {
                this.SelectedUOM = this.selectedItems[i].MeasurementUnitID;
            }
            else {
                this.SelectedUOM = this.SelectedUOM + "," + this.selectedItems[i].MeasurementUnitID;
            }
        }
        this.TotalSelectedUOM = this.selectedItems.length;
        //alert("Selected Leads : " + this.SelectedUOM + "\n Total Selected Leads : " + this.TotalSelectedUOM);
    }
//************************************************************************************************************/    
//*********************************************************************************************************************/
//Export Code Starts Here
//*********************************************************************************************************************/
ExportToCSV() {
    const self=this;
    debugger;
    
    //Set Records To Fetch
    this.measurementUnitsListPagerConfig.RecordsToSkip = 0;
    this.measurementUnitsListPagerConfig.RecordsToFetch = 1000;
  
    //this.filterData();
    this.GetAllUnits();

    this.interval = setTimeout(() => {
        //alert("Alert activated")
        //
        if (this.IsFilterDataArrive) {
            //
            this.ResetPagerConfig();
            if (this.FilterMeasurementUnitsList.length > 0) {
                debugger;

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 20);
                this.FileName="MeasurementUnitsList_" + this.CurrentDate+"_"+this.FileNo.toString();

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
                    headers: ['Code', 'Name', 'Abbreviation', 'Description','CreatedBy','CreatedOn']
                };
                const csvExporter = new ExportToCsv(options);
                csvExporter.generateCsv(this.FilterMeasurementUnitsList);
                this.stopTime();
            }
        }
    }, 1000);

}
exportToExcel(): void {

    const edata: Array<ExcelJson> = [];
    const udt: ExcelJson = {
        data: [
            { A: 'Measurement Units Lists' }, // title
            { A: 'Code', B: 'Name', C: 'Abbreviation',D: 'Description',E: 'CreatedBy',F:'Created On' }, // table header
        ],
        skipHeader: true
    };
    this.FilterMeasurementUnitsList.forEach(contact => {
        udt.data.push({
            A: contact.Code,
            B: contact.Name,
            C: contact.Abbreviation,
            D: contact.Description,
            E: contact.CreatedBy,
            F: contact.CreatedOn
        });
    });
    edata.push(udt);

    this.exportService.exportJsonToExcel(edata, 'MeasurementUnitsList');
}
ExportToExcel() {
    const self=this;

    this.blockUI.start("Preparing Data...!!!"); // Start blocking
    this.GetAllUnits();
    this.interval = setTimeout(() => {
        //alert("Alert activated")
        
        if (this.IsFilterDataArrive) {
            
            this.blockUI.update("Exporting Data...!!!");
            this.blockUI.start("Exporting Data...!!!"); // Start blocking
            if (this.FilterMeasurementUnitsList.length > 0) {
                //alert("Total Records Excel : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);
                //this.exportToExcel();
                const edata: Array<ExcelJson> = [];
                const udt: ExcelJson = {
                    data: [
                        { A: 'Leads Lists' }, // title
                        { A: 'Code', B: 'Name', C: 'Abbreviation',D: 'Description',E: 'CreatedBy',F:'Created On' }, // table header
                    ],
                    skipHeader: true
                };
                this.FilterMeasurementUnitsList.forEach(polist => {
                    udt.data.push({
                        A: polist.Code,
                        B: polist.Name,
                        C: polist.Abbreviation,
                        D: polist.Description,
                        E: polist.CreatedBy,
                        F: polist.CreatedOn,
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
    this.GetAllUnits();

    this.interval = setTimeout(() => {
        //alert("Alert activated")
        
        if (this.IsFilterDataArrive) {
            
            if (this.FilterMeasurementUnitsList.length > 0) {
                //alert("Total Records PDF : " + this.FilterPurchaseOrderPagerConfig.TotalRecords);

                this.exportColumns = this.MeasurementUnitsListCols.map((col) => ({
                    title: col.header,
                    dataKey: col.field,
                }));

                //Remove Action Column
                this.SelexportColumns = this.exportColumns.filter(item => item.title !== "Action");
                const doc = new jsPDF('p', 'pt');
                doc['autoTable'](this.SelexportColumns, this.FilterMeasurementUnitsList);
                // doc.autoTable(this.exportColumns, this.products);

                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="MeasurementUnitsList_" + this.CurrentDate+"_"+this.FileNo.toString();

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
    this.showLeftPanelLoadingIcon = false;
    this.blockUI.start("Done Data...!!!"); // Start blocking
    this.blockUI.stop();
}
//*********************************************************************************************************************/
//Export Code Ends Here
//*********************************************************************************************************************/

}
