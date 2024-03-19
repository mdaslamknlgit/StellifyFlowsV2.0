import { Component, OnInit,ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators,FormBuilder} from '@angular/forms';
import { ItemMaster, Location, ResponseStatusTypes,SortingOrderType,Messages, MessageTypes  } from "../../../shared/models/shared.model";
import { SharedService } from "../../../shared/services/shared.service";
import { InventoryRequestItems, InventoryRequest, InventoryRequestDisplayInput,InventoryRequestDetailInput } from "../../models/inventory-request.model";
import { InventoryRequestService } from "../../services/inventory-request.service";
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged,  switchMap, catchError } from 'rxjs/operators';
import { GridOperations,PagerConfig } from "../../../shared/models/shared.model";
import { ConfirmationService,LazyLoadEvent } from 'primeng/components/common/api';
import { FullScreen } from "../../../shared/shared";
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';

@Component({
    selector: 'app-inventory-request',
    templateUrl: './inventory-request.component.html',
    styleUrls: ['./inventory-request.component.css'],
    providers: [InventoryRequestService]
})
export class InventoryRequestComponent implements OnInit {

    //whether the item content we are displaying is in edit/display mode...
    isDisplayMode?: boolean = true;
    selectedRecord: InventoryRequest;
    //this variable will hold the list of inventories....
    inventoryRequests: Array<InventoryRequest> = [];
    //form for creating inventory  record...
    inventoryRequestForm: FormGroup;
    //hold the number of records to skip...
    recordsToSkip: number = 0;
    //hold the number of records to fetch ...while showing in the list view..
    recordsToFetch: number = 10;
    //holds the total number of category records..
    totalRecords: number = 0;
    //this array will hold the list of columns to display in the grid..
    gridColumns: Array<{ field: string, header: string }> = [];
    rowInEditMode: number = -1;
    recordDescriptionInEdit: string = "";
    showSuccessMessage: boolean = false;
    leftsection: boolean = false;
    rightsection: boolean = false;
    deletedItems: Array<number> = [];
    successMessage: string = "";
    showfilters:boolean=false;
    showfilterstext:string="Show List" ;
    public screenWidth: any;
    //this will tell whether we are using add/edit/delete mode the grid..
    operation: string;
    sortingOrder:string="";
    sortingExpr:string="";
    gridItemConfig:PagerConfig;
    selectedLocation:Location;
    scrollbarOptions:any;
    showNoRecordsErrorMessage:boolean;
    gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
    companyId:number;
    @ViewChild('rightPanel') rightPanelRef;

    constructor(private sharedServiceObj: SharedService,
                private inventoryRequestServiceObj: InventoryRequestService,
                private formBuilderObj:FormBuilder,
                private confirmationServiceObj:ConfirmationService,public sessionService: SessionStorageService ) 
    {
        this.companyId=this.sessionService.getCompanyId();
        this.gridItemConfig = {
            RecordsToSkip:0,
            TotalRecords:0,
            RecordsToFetch:5,
            SortingExpr:"",
            SortingOrder:""
        };
        this.gridColumns = [
            { field: 'SNo', header: 'S.no.' },
            { field: 'Name', header: 'Item Name' },
            { field: 'QtyReq', header: 'Qty Required' },
            { field: 'Description', header: 'Description' },
        ];
        //creating a new inventory request form..
        this.inventoryRequestForm = this.formBuilderObj.group({
            InventoryRequestID:[0],
            Location:[null,Validators.required],
            Remarks: [""],
            ItemsList:this.formBuilderObj.array([]),
        });
        this.setDefaultValueToSelectedRecord();
        //to get all the inventory requests
        this.getInventoryRequests();
    }
    ngOnInit() {
        
            this.screenWidth = window.innerWidth-180;
         
    }
    initGridRows() {
        return this.formBuilderObj.group({
            InventoryRequestDetailID:[0],
            Item:[null,Validators.required],
            QuantityRequired: [0, [Validators.required,Validators.min(1)]],
        });
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
            switchMap(term=>         
               this.inventoryRequestForm.get('Location').value==null?of([]): this.sharedServiceObj.getItemMasterByKey({                    
                    searchKey:term,
                    CompanyId:this.companyId,
                    LocationID:this.inventoryRequestForm.get('Location').value["LocationID"]
                }).pipe(
                catchError(() => {

                        return of([]);
                    }))
            )
    );
    /**
     * to get inventory requests...
    */
    getInventoryRequests() {
        let displayInput: InventoryRequestDisplayInput = {
            Skip: this.recordsToSkip,
            Take: this.recordsToFetch,
            SortDirection:this.sortingOrder,
            SortExpression:this.sortingExpr
        };
        //calling the service method to get the list of inventory requests...
        this.inventoryRequestServiceObj.getInventoryRequests(displayInput)
            .subscribe((data: { InventoryRequests: Array<InventoryRequest>, TotalRecords: number }) => {
                this.inventoryRequests = data.InventoryRequests;
                this.totalRecords = data.TotalRecords;
                //checking if the item category records length is more than 0
                if (this.inventoryRequests.length > 0) {
                    this.isDisplayMode = true;
                   //selecting the first record of the grid...
                    this.onRecordSelection(this.inventoryRequests[0]);
                }
                else {
                    this.setDefaultValueToSelectedRecord();
                }
            });
    }
    /**
     * to hide the inventory request details and show in add mode..
    */
    addRecord() {
        //setting this variable to false so as to show the inventory request details in edit mode
        this.isDisplayMode = false;
        // //resetting the item category form..
        this.inventoryRequestForm.reset();
        this.inventoryRequestForm.setErrors(null);
        this.inventoryRequestForm.patchValue({
            InventoryRequestID:0
        });
        let itemGroupControl = <FormArray>this.inventoryRequestForm.controls['ItemsList'];
        itemGroupControl.controls =[];
        itemGroupControl.controls.length =0;
        this.showfilters =false;
    this.showfilterstext="Show List" ;
    }
    /**
     * to hide inventory request details and show in edit mode...
     */ 
    editRecord()
    {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;
        let itemGroupControl = <FormArray>this.inventoryRequestForm.controls['ItemsList'];
        itemGroupControl.controls =[];
        itemGroupControl.controls.length =0;
        this.addItem(this.selectedRecord.ItemsList.length);
        this.inventoryRequestForm.patchValue(this.selectedRecord);

        console.log(this.inventoryRequestForm);
    }
    /**
     * to save the given inventory request details...
    */
    saveRecord() {
        this.showNoRecordsErrorMessage =false;
        let inventoryFormStatus = this.inventoryRequestForm.status;
        //getting the item category form details
        let inventoryRequestDetails:InventoryRequest = this.inventoryRequestForm.value;
        if(inventoryFormStatus=="VALID" && inventoryRequestDetails.ItemsList.length >0)
        {
            inventoryRequestDetails.ItemsList.forEach(i=>{
                if(i.InventoryRequestDetailID>0)
                {
                    let previousRecord = this.selectedRecord.ItemsList.find(j=>j.InventoryRequestDetailID==i.InventoryRequestDetailID);
                    if(i.InventoryRequestDetailID!=previousRecord.InventoryRequestDetailID|| 
                        i.QuantityRequired!=previousRecord.QuantityRequired)
                        {
                            i.IsChanged=true;
                        }
                }
                else
                {
                    i.InventoryRequestDetailID=0;
                }
            });
            inventoryRequestDetails.ItemsList = inventoryRequestDetails.ItemsList.filter(i=>i.InventoryRequestDetailID==0||i.InventoryRequestDetailID==null||i.IsChanged==true);
            //if inventory request id is 0 then we are inserting a new record..
            if (inventoryRequestDetails.InventoryRequestID == 0) {
                this.inventoryRequestServiceObj.createInventoryRequest(inventoryRequestDetails)
                    .subscribe((response: { Status: string, Value: any }) => {
                        //if status is success then we will insert a new record into the array...
                        if (response.Status == ResponseStatusTypes.Success) {

                            this.sharedServiceObj.showMessage({
                                ShowMessage:true,
                                Message:Messages.SavedSuccessFully,
                                MessageType:MessageTypes.Success
                            });
                            //after save we will show details in display mode..so setting this variable to true...
                            this.isDisplayMode = true;
                            this.getInventoryRequests();
                        }
                    });
            }
            else//updating the record...
            {
                inventoryRequestDetails.ItemsToDelete = this.deletedItems;
                this.inventoryRequestServiceObj.updateInventoryRequest(inventoryRequestDetails)
                    .subscribe((response: { Status: string, Value: any }) => {
                        //if status is success then we will insert a new record into the array...
                        if (response.Status == ResponseStatusTypes.Success) {

                            this.sharedServiceObj.showMessage({
                                ShowMessage:true,
                                Message:Messages.UpdatedSuccessFully,
                                MessageType:MessageTypes.Success
                            });
                            //after save we will show details in display mode..so setting this variable to true...
                            this.isDisplayMode = true;
                            this.selectedRecord.Remarks = inventoryRequestDetails.Remarks;
                            this.onRecordSelection(this.selectedRecord);
                        }
                    });
            }
        }
        else
        {
            Object.keys(this.inventoryRequestForm.controls).forEach((key:string) => {
                if(this.inventoryRequestForm.controls[key].status=="INVALID" && this.inventoryRequestForm.controls[key].touched==false)
                {
                   this.inventoryRequestForm.controls[key].markAsTouched();
                }
            });
            let itemGroupControl = <FormArray>this.inventoryRequestForm.controls['ItemsList'];
            itemGroupControl.controls.forEach(controlObj => {  
                Object.keys(controlObj["controls"]).forEach((key:string) => {
                    let itemGroupControl = controlObj.get(key);
                    if(itemGroupControl.status=="INVALID" && itemGroupControl.touched==false)
                    {
                        itemGroupControl.markAsTouched();
                    }
                }); 
            });  
            if(inventoryRequestDetails.ItemsList.length==0)
            {    
                this.showNoRecordsErrorMessage=true;
            }
        }
    }

    /**
     * to delete the selected record...
     */
    deleteRecord() {

        let recordId = this.selectedRecord.InventoryRequestID;

        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header:Messages.DeletePopupHeader,
            accept: () => {     

                this.inventoryRequestServiceObj.deleteInventoryRequest(recordId)
                .subscribe((data) => {
    
                    this.sharedServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.DeletedSuccessFully,
                        MessageType:MessageTypes.Success
                    });
                    this.getInventoryRequests();
                }, (err) => {
    
                });
            },
            reject: () => {
            }
        });
    }
    /**
     * to set default value to the selected record variable...
     */
    setDefaultValueToSelectedRecord() {
        this.isDisplayMode = null;
    }
    /**
     * a) this method will be called on cancel button click event..
     * b) we will show the category details on cancel button click event..
     */
    cancelRecord() {

        if(this.inventoryRequests.length==0)
        {
            this.addRecord();
        }
        else
        {
            //setting this variable to true so as to show the category details
            this.isDisplayMode = true;
            //to show table only in display mode...
            this.rowInEditMode = -1;
        }
    }

    /**
     * this method will be called on "item master" autocomplete value selection.
     */
    itemMasterSelection(eventData: any) {
        this.recordDescriptionInEdit = eventData.item.Description;
    }

    //adding row to the grid..
    addItem(noOfLines:number)
    {
        let itemGroupControl = <FormArray>this.inventoryRequestForm.controls['ItemsList'];
        for(let i=0;i<noOfLines;i++)
        {
            itemGroupControl.push(this.initGridRows());
        }
    }
    /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex:number)
    {
        let itemGroupControl = <FormArray>this.inventoryRequestForm.controls['ItemsList'];
        let InventoryRequestDetailID = itemGroupControl.controls[rowIndex].get('InventoryRequestDetailID').value;
        if(InventoryRequestDetailID > 0)
        {
            this.deletedItems.push(InventoryRequestDetailID);
        }
        itemGroupControl.removeAt(rowIndex);
    }

    /**
     * to set the selected inventory request record selection...
     */
    onRecordSelection(record: InventoryRequest) {
        this.selectedRecord = record;
        this.getInventoryRequestDetails();
    }

    getInventoryRequestDetails()
    {
        let inventoryReq:InventoryRequestDetailInput  = {
            InventoryRequestId: this.selectedRecord.InventoryRequestID,
            Skip:this.gridItemConfig.RecordsToSkip,
            Take:this.gridItemConfig.RecordsToFetch,
            SortDirection:this.gridItemConfig.SortingOrder,
            SortExpression:this.gridItemConfig.SortingExpr
        };
        //getting the inventory details of the selected request record...
        this.inventoryRequestServiceObj.getInventoryRequestDetails(inventoryReq)
            .subscribe((data: Array<InventoryRequestItems>) => {
                this.operation = GridOperations.Display;
                //setting the items list here...
                this.selectedRecord.ItemsList = data;
          });
    }

    /**
     * this method will be called on grid pager..next page click event...
     * @param event 
     */
    loadGridItems(event: LazyLoadEvent)
    {
        this.gridItemConfig.RecordsToSkip = event.first;
        if(event.sortOrder==1)
        {
            this.gridItemConfig.SortingOrder = SortingOrderType.Ascending
        }
        else
        { 
            this.gridItemConfig.SortingOrder = SortingOrderType.Descending
        }
        this.gridItemConfig.SortingExpr = event.sortField;
        this.getInventoryRequestDetails();
    }
    onClickedOutside(e: Event) {
       // this.showfilters= false; 
        if(this.showfilters == false){ 
           // this.showfilterstext="Show List"
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

    showFullScreen()
    {
        FullScreen(this.rightPanelRef.nativeElement);
    }

}
