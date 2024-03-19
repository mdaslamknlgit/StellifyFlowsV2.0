import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ItemsListingService } from '../../services/item-listing.service';
import { ItemsListing, ItemsListingDisplayInput, ItemsListingFilterDisplayInput } from '../../models/items-listing.model';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ItemMaster, Location, ResponseStatusTypes, SortingOrderType, Messages, MessageTypes, Shared, PagerConfig, ItemMasters } from '../../../shared/models/shared.model';
import { SharedService } from '../../../shared/services/shared.service';
import { LazyLoadEvent, SortEvent } from 'primeng/components/common/api';
import { GridOperations } from "../../../shared/models/shared.model";
import { FullScreen, ExportToExcel } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ItemType } from '../../models/item-type.model';
import { ItemCategory } from '../../models/item-category.model';
import { utils } from 'protractor';
import { write } from 'fs';
import { ColInfo } from 'xlsx/types';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'app-items-listing',
    templateUrl: './items-listing.component.html',
    styleUrls: ['./items-listing.component.css'],
    providers: [ItemsListingService]
})
export class ItemsListingComponent implements OnInit {
    FileName:string="";
    FileNo:number=0;
    CurrentDate:string="";
    itemListingFilterForm: FormGroup;
    gridColumns: Array<{ field: string, header: string, width: string }> = [];
    inventoryListingRegisterPagerConfig: PagerConfig;
    itemslisting: Array<ItemsListing> = [];
    selectedItemListing:ItemsListing;
    searchKey: string = "";
    showFilterPopUp: boolean = false;
    isFilterApplied: boolean = false;
    filterMessage: string = "";
    rightSection: boolean = false; 
    companyId: number = 0;
    initDone = false;   
    public screenWidth: any;
    @ViewChild('itemName') private itemNameRef: any;
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    importPermission: boolean;
    isDisplayMode?: boolean = true;

    constructor(
        private router: Router,
        private sharedServiceObj: SharedService, 
        private itemsListingServiceObj: ItemsListingService,
        private formBuilderObj: FormBuilder, 
        public sessionService: SessionStorageService,
        private renderer:Renderer) {
        this.companyId = this.sessionService.getCompanyId();
    }
    ngOnInit() {
        this.gridColumns = [
            { field: 'Sno', header: 'S.no.', width: "5%" },
            { field: 'ItemMasterCode', header: 'ItemCode', width: "8%" },
            { field: 'Name', header: 'ItemName', width: "10%" },
            { field: 'LocationName', header: 'Department', width: "10%" },
            { field: 'ItemTypeName', header: 'Item Type', width: "10%" },
            { field: 'ItemCategoryName', header: 'Category', width: "10%" },
            { field: 'Manufacturer', header: 'Manufacturer', width: "10%" },
            { field: 'Brand', header: 'Brand', width: "10%" },
            { field: 'UOMName', header: 'UOM', width: "5%" },
            { field: 'ExpiryDate', header: 'Expiry Date', width: "8%" },
            { field: 'StatusName', header: 'Status', width: "5%" },
            { field: 'OpeningStockValue', header: 'Opening Value', width: "6%" },
            { field: 'LowAlertQuantity', header: 'Low Quanity Alert', width: "5%" },
            { field: 'ReOrderLevel', header: 'Re-Order', width: "5%" },
            { field: 'StockInhand', header: 'Stock Inhand', width: "10%" },
            { field: '', header: 'Actions', width: "10%" }
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
        this.itemListingFilterForm = this.formBuilderObj.group({
            'ItemName':[""],
            'ItemCategory':[""],
            'ItemType':[""],
            'Department':[""],
          });

        this.inventoryListingRegisterPagerConfig = new PagerConfig();
        this.inventoryListingRegisterPagerConfig.RecordsToSkip = 0;
        this.inventoryListingRegisterPagerConfig.RecordsToFetch = 25;

        this.sharedServiceObj.CompanyId$
            .subscribe((data) => {
                this.companyId = data;
                this.getItemListing("");
            });

        this.getItemListing("");

        if(window.innerWidth < 768){  
            this.screenWidth = window.innerWidth-150;
            }
    }

    departmentInputFormater = (x: Location) => x.Name;
    departmentSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getLocationByKey(
                     term, this.companyId
                ).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
    );

    itemCategoryInputFormater = (x: ItemCategory) => x.Name;
    itemCategorySearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getItemCategorys(
                     { searchKey: term,}
                ).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
    );

    itemNameInputFormater = (x: ItemMasters) => x.Name;
    itemNameSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getItemMasterName({
                    searchKey: term
                }).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
    );

    itemTypeInputFormater = (x: ItemType) => x.Name;
    itemTypeSearch = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>
                this.sharedServiceObj.getItemTypes(
                     { searchKey: term}
                ).pipe(
                    catchError(() => {
                        return of([]);
                    }))
            )
    );




    getItemListing(searchKey: string) {
        let requestObj = {
            Search: searchKey,
            Skip: this.inventoryListingRegisterPagerConfig.RecordsToSkip,
            Take: this.inventoryListingRegisterPagerConfig.RecordsToFetch,
            CompanyId: this.companyId,
            SortExpression: this.inventoryListingRegisterPagerConfig.SortingExpr,
            SortDirection:this.inventoryListingRegisterPagerConfig.SortingOrder
        };
        this.itemsListingServiceObj.getItemsListing(requestObj)
            .subscribe((data: { ItemsListing: Array<ItemsListing>, TotalRecords: number }) => {
                this.itemslisting = data.ItemsListing;
                this.inventoryListingRegisterPagerConfig.TotalRecords = data.TotalRecords;
                this.isDisplayMode = true;
            });
    }

    onLazyLoad(event: LazyLoadEvent) {    
        console.log(event);
        if(event.sortField!="ItemMasterCode")
        {
            event.sortField="";
        }
        this.inventoryListingRegisterPagerConfig.RecordsToSkip = event.first;
        this.inventoryListingRegisterPagerConfig.SortingExpr = event.sortField;
        this.inventoryListingRegisterPagerConfig.SortingOrder = event.sortOrder==1?"asc":"desc";        
        if (this.searchKey == null || this.searchKey == "") {
            this.getItemListing("");
        }
    }


    openDialog() {
        this.showFilterPopUp = true;
        if (this.itemNameRef != undefined) {
            this.itemNameRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.itemNameRef.nativeElement, 'focus'); 
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.showFilterPopUp = true;
        this.resetFilters();
      }
      
      resetFilters() {
        this.itemListingFilterForm.reset();
        this.filterMessage = "";
        this.isFilterApplied = false;
        this.getItemListing("");
        if (this.itemNameRef != undefined) {
            this.itemNameRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.itemNameRef.nativeElement, 'focus');
        }
      }

      filterData() {      
        let itemName = "";
        let itemCategory = "";
        let itemType = "";
        let department = "";
        this.filterMessage = "";
        if (this.itemListingFilterForm.get('ItemName').value != "" && this.itemListingFilterForm.get('ItemName').value != null) {
            itemName = this.itemListingFilterForm.get('ItemName').value.Name;
        }
        if (this.itemListingFilterForm.get('ItemCategory').value != "" && this.itemListingFilterForm.get('ItemCategory').value != null) {
            itemCategory = this.itemListingFilterForm.get('ItemCategory').value.Name;
        }
        if (this.itemListingFilterForm.get('ItemType').value != "" && this.itemListingFilterForm.get('ItemType').value != null) {
            itemType = this.itemListingFilterForm.get('ItemType').value.Name;
        }
        if (this.itemListingFilterForm.get('Department').value != "" && this.itemListingFilterForm.get('Department').value != null) {
            department = this.itemListingFilterForm.get('Department').value.Name;
        }        

        if (itemName === '' && itemCategory === "" && itemType === '' && department === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }
        this.isFilterApplied = true;
        this.SearchandSort(itemName,itemCategory,itemType,department);

      }

    SearchandSort(itemName:string="",itemCategory:string="",itemType:string="",department:string=""){
        let itemsListingFilterDisplayInput: ItemsListingFilterDisplayInput = {
            Skip: this.inventoryListingRegisterPagerConfig.RecordsToSkip,
            Take: this.inventoryListingRegisterPagerConfig.RecordsToFetch,
            ItemNameFilter : itemName ,
            ItemCategoryFilter : itemCategory ,
            ItemTypeFilter : itemType ,
            DepartmentFilter : department ,
            CompanyId: this.companyId           
        };
        this.itemsListingServiceObj.getFilterItemListing(itemsListingFilterDisplayInput)
        .subscribe((data: { ItemsListing: Array<ItemsListing>, TotalRecords: number }) => {            
            if (data.TotalRecords > 0) {
                this.isFilterApplied = true;
                if (open) {
                    this.initDone = false;
                }
                this.showFilterPopUp = false;
                this.itemslisting = data.ItemsListing;
                this.inventoryListingRegisterPagerConfig.TotalRecords = data.TotalRecords;
            }
            else {
                this.filterMessage = "No matching records are found";
            }
        });
    }

    onSearch(event: any) {
        if (event.target.value != "") {
            if (event.target.value.length >= 1) {
                this.getItemListing(event.target.value);
            }
        }
        else {
            this.getItemListing("");
        }
    }


    customSort(sortEvent:SortEvent)
    {  
        console.log(sortEvent);
        this.inventoryListingRegisterPagerConfig.SortingExpr = sortEvent.field;
        this.inventoryListingRegisterPagerConfig.SortingOrder = sortEvent.order.toString();
        if(this.searchKey==null||this.searchKey=="")
        {
        this.getItemListing("");
        }
        else
        {
        this.SearchandSort();
        }
    }

    ExportAsExcel(e) {  
        let requestObj = {
            Search: "",
            Skip: this.inventoryListingRegisterPagerConfig.RecordsToSkip,
            Take: this.inventoryListingRegisterPagerConfig.RecordsToFetch,
            CompanyId: this.companyId
        };
        this.itemsListingServiceObj.getItemsListing(requestObj)
            .subscribe((data: { ItemsListing: Array<ItemsListing>, TotalRecords: number }) => {
                let headers:Array<{header:string,field:string}> = this.gridColumns.map(data=>{
                  return { header : data.header , field : data.field }
                });
                this.CurrentDate=moment().format('YYYYMMDD').toLocaleString();
                this.FileNo=Math.ceil(Math.random() * 10);
                this.FileName="ContactsLists_" + this.CurrentDate+"_"+this.FileNo.toString();

                ExportToExcel(data.ItemsListing,this.FileName,"Inventory List",headers,true);
            });
    }

    cellColour(lowLevel:number,reOrder:number,stockInhand:number){
         
         if(stockInhand<lowLevel && stockInhand>reOrder) {
            return 'orange';
         }
         else if(stockInhand<lowLevel && stockInhand<reOrder || stockInhand==0){
             return 'red';
         }
         else {
            return 'lightgreen';
         }

    }
    ClickNewItem(e) {
        this.router.navigate([`/inventory/itemmaster/${'NEW'}/0/2`]);
    }
    EditItem(ItemMasterId,e)
    {
        this.router.navigate([`/inventory/itemmaster/${'EDIT'}/${ItemMasterId}/2`]);
    }
    uploadFile(e)
    {
        console.log("Upload File");
    }

}
