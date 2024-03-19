import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../shared/services/shared.service';
import { FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ItemMaster,Location,ResponseStatusTypes,SortingOrderType, GridOperations, Shared, Messages, MessageTypes } from "../../../shared/models/shared.model";
import { InventoryCycleCountModel, InventoryCycleCountDisplayInput, InventoryCycleCountRequest } from '../../models/inventory-cycle-count.model';
import { InventoryCycleCountService } from '../../services/inventory-cycle-count.service';
import { LazyLoadEvent } from 'primeng/components/common/api';


@Component({
  selector: 'app-cycle-count',
  templateUrl: './cycle-count.component.html',
  styleUrls: ['./cycle-count.component.css'],
  providers:[InventoryCycleCountService]
})
export class CycleCountComponent implements OnInit {

  
  //this array will hold the list of columns to display in the grid..
  gridColumns:Array<{field:string,header:string}>= [];
  signupForm:FormGroup;
  operation:string;  
  selectedLocation:Location;
  recordInEditMode:number;
  inventoryCycleCount:Array<InventoryCycleCountModel>=[];
  formSubmitAttempt: boolean = false;
  status:boolean;
  deletedRecords:Array<number>=[];
  isLoading:boolean = false;
  recordsToSkip:number = 0;
  recordsToFetch:number = 10;
  sortingOrder:string="";
  sortingExpr:string="";
  inventorycyclecount:Array<InventoryCycleCountModel> = [];
  shareditems:Array<Shared> = [];
  totalRecords:number = 0;
  LocationItemId:number;
  savedsucess:boolean = false;
  leftsection:boolean=false;
  rightsection:boolean=false;
  public screenWidth: any;
  gridNoMessageToDisplay:string = Messages.NoItemsToDisplay;
  
  constructor(private sharedServiceObj:SharedService,private inventorycyclecountServiceObj:InventoryCycleCountService) {

   }

  ngOnInit() {

            this.gridColumns = [
            { field: 'Sno', header: 'S.no.' },
            { field: 'ItemMasterName', header: 'Item Name' },
            { field: 'SystemQty', header: 'System Quantity' },
            { field: 'PhysicalQty', header: 'Physical Quantity' },
            { field: 'LostQty', header: 'Lost Quantity' },
            { field: 'DamagedQty', header: 'Damaged Quantity' },
            { field: 'ExpiredQty', header: 'Expired Quantity' },
            { field: 'Reason', header: 'Reason' }
            ];

            this.signupForm = new FormGroup({
                "LocationId":new FormControl("",Validators.required),
                "Item":new FormControl("",Validators.required),
                "SystemQty":new FormControl(0),
                "PhysicalQty":new FormControl(0,[Validators.required,Validators.min(1)]),
                "LostQty":new FormControl(0,[Validators.required,Validators.min(1)]),
                "DamagedQty":new FormControl(0,[Validators.required,Validators.min(1)]),
                "ExpiredQty":new FormControl(0,[Validators.required,Validators.min(1)]),      
                "Reasons":new FormControl("")
        });

        
            this.screenWidth = window.innerWidth-180;
        

  }

  
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
            this.inventorycyclecountServiceObj.getItemsbasedLocationID({                    
                searchKey:term,
                LocationID:this.selectedLocation.LocationID
            }).pipe(
            catchError(() => {

                return of([]);
            }))
        )
    );




    itemMasterSelection(eventData:any){       
        this.LocationItemId=eventData.item.LocationItemIds; 
        let requestObj1:Shared = {
            ItemMasterId:eventData.item.ItemMasterId
        };
        this.inventorycyclecountServiceObj.getExistingInventoryCycleCount(requestObj1)
                  .subscribe((data:Array<Shared>)=>{

                      this.shareditems = data;
                      this.isLoading = false;
                        if( this.shareditems[0].LocationItemId==0)
                        {
                            this.signupForm.get('SystemQty').setValue(eventData.item.ExistingQuantity);                                 
                        }
                        else{
                            this.signupForm.patchValue({
                                SystemQty:0,
                                PhysicalQty:0,
                                LostQty:0,
                                DamagedQty:0,
                                ExpiredQty:0,
                                Reasons:""
                            })
                            this.signupForm.get('Item').setErrors({
                                'Duplicate':true
                            });   
                        }
                  });
    }


    onLocationSelection(event:any)
    {
        this.selectedLocation = event.item;
       // this.cancelGridItem();
        this.getInventoryCycleCount();
    }

    getInventoryCycleCount() {
        if(this.selectedLocation!=undefined)
        {
              let requestObj:InventoryCycleCountDisplayInput = {
                LocationId:this.selectedLocation.LocationID,                    
                Skip:this.recordsToSkip,
                Take:this.recordsToFetch,
                SortDirection:this.sortingOrder,
                SortExpression:this.sortingExpr
            };
            this.isLoading = true;
            this.inventorycyclecountServiceObj.getInventoryCycleCount(requestObj)
            .subscribe((data:{ InventoryCycleCount:Array<InventoryCycleCountModel>,TotalRecords:number })=>{

                this.inventorycyclecount = data.InventoryCycleCount;
                this.totalRecords = data.TotalRecords;
                this.operation = GridOperations.Display;
                this.isLoading = false;
            });
        }
    }

      /**
     * this method will be called on grid pager..next page click event...
     * @param event 
     */
    loadGridItems(event: LazyLoadEvent)
    {    
        console.log("getting items...",event);    
        this.recordsToSkip = event.first;
        if(event.sortOrder==1)
        {
            this.sortingOrder = SortingOrderType.Ascending
        }
        else
        { 
            this.sortingOrder = SortingOrderType.Descending
        }
        this.sortingExpr = event.sortField;
        this.getInventoryCycleCount();

    }


     /**
     * to add new record to the grid
     */
    addRecord()
    {
      if(this.selectedLocation!=undefined)
      {
        if(this.operation==GridOperations.Add)  
        {
          this.saveGridItem(this.recordInEditMode);
        }
        else if(this.operation==GridOperations.Edit)
        {
            this.updateGridItem(this.recordInEditMode);
        }
        let formStatus = this.signupForm.status;
        if(formStatus!="INVALID"||this.operation==GridOperations.Display)
        {
            this.signupForm.patchValue({
                Item:"",
                SystemQty:0,
                PhysicalQty:0,
                LostQty:0,
                DamagedQty:0,
                ExpiredQty:0,
                Reasons:""
            });
            if(this.operation!=GridOperations.Add)
            {
                this.inventorycyclecount.unshift({
                    InventoryCycleCountId:0,
                    ItemMasterId:0,
                    ItemMasterName:"",
                    LocationItemId:0,
                    SystemQty:0,
                    PhysicalQty:0,
                    LostQty:0,
                    DamagedQty:0,    
                    ExpiredQty:0,
                    Reasons:"",
                    WorkFlowStatusId:0,
                    WorkFlowStatus:"",
                    //IsModified?:boolean;
                });
            }
            this.recordInEditMode = 0;
            this.operation = GridOperations.Add;
        }
      }  
    }

    validateControl(control: any) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
      }

      cancelGridItem()
      {
          //if operation is in add mode..
              if(this.operation == GridOperations.Add)//if grid operation id "Add"
              {
              //removing the row at 0th index..
              this.inventorycyclecount.splice(0,1);
              this.inventorycyclecount = this.inventorycyclecount.filter(i=>i.ItemMasterId!=null);
              }
          // this.disposalGridItemsForm.reset();
              this.signupForm.patchValue({
                  Item:"",     
                  PhysicalQty:0,           
                  LostQty:0,
                  DamagedQty:0,
                  ExpiredQty:0,
                  Reasons:"",
                })
                this.recordInEditMode = -1;
                this.operation = GridOperations.Display;
      }

      saveAllChanges()
      {        
          this.formSubmitAttempt = true;
          if(this.selectedLocation!=undefined)
          {              
              if(this.operation==GridOperations.Add)
              {
                  this.status=this.saveGridItem(this.recordInEditMode);
              }
              else if(this.operation==GridOperations.Edit)
              {
                  this.status=this.updateGridItem(this.recordInEditMode);
              }          
              if(this.status)
              {
                  let inventorycyclecountObj:InventoryCycleCountRequest = {
  
                    InventoryCycleCountToAdd: this.inventorycyclecount.filter(j=>j.InventoryCycleCountId==null || j.InventoryCycleCountId==0),
                    InventoryCycleCountToDelete:this.deletedRecords,
                    InventoryCycleCountToUpdate:this.inventorycyclecount.filter(j=>j.IsModified==true && j.InventoryCycleCountId > 0),
                  };
  
                  if(inventorycyclecountObj.InventoryCycleCountToAdd.length > 0||inventorycyclecountObj.InventoryCycleCountToDelete.length > 0||inventorycyclecountObj.InventoryCycleCountToUpdate.length > 0)
                  {
  
                      this.inventorycyclecountServiceObj.createInventoryCycleCountRequest(inventorycyclecountObj).subscribe((data)=>{
  
                          this.sharedServiceObj.showMessage({
                              ShowMessage:true,
                              Message:Messages.SavedSuccessFully,
                              MessageType:MessageTypes.Success
                          });
                              //making the array empty...
                              this.formSubmitAttempt = false;
                              this.deletedRecords = [];
                              this.deletedRecords.length = 0;
                              this.getInventoryCycleCount();
  
                      });
                  }
                  else 
                  {         
                      this.sharedServiceObj.showMessage({
                              ShowMessage:true,
                              Message:Messages.NoChangesDetected,
                              MessageType:MessageTypes.NoChange
                          });
                          this.formSubmitAttempt = false;
                  }
              }
          }
          else{
              if(this.status==undefined){
              this.signupForm.markAsUntouched();
              }
              else{
                this.sharedServiceObj.showMessage({
                    ShowMessage:true,
                    Message:Messages.NoChangesDetected,
                    MessageType:MessageTypes.NoChange
                });
                this.formSubmitAttempt = false;
              }


          }
  
      }

      

      /**
     * to remove the grid item...
     */
    removeGridItem(rowIndex:number)
    {
        let record = this.inventorycyclecount[rowIndex];
        this.deletedRecords.push(record.InventoryCycleCountId);
        this.inventorycyclecount.splice(rowIndex,1);
        this.inventorycyclecount = this.inventorycyclecount.filter(i=>i.ItemMasterId!=null);
        this.status=true;
    }

    saveGridItem(rowIndex:number)
    {
        let formStatus = this.signupForm.status;
        let inventorycyclecountFormDetails = this.signupForm.value;

        //if form status is not invalid....
        if(formStatus!="INVALID")
        {
            console.log(inventorycyclecountFormDetails,rowIndex);
            //updating the inventory record details....
            let inventorycyclecountRecord = this.inventorycyclecount[rowIndex];
             inventorycyclecountRecord.LocationItemId = this.LocationItemId;
            // inventorycyclecountRecord.ItemMasterName = inventorycyclecountFormDetails.item.ItemMasterName;
            inventorycyclecountRecord.PhysicalQty = inventorycyclecountFormDetails.PhysicalQty;
            inventorycyclecountRecord.LostQty = inventorycyclecountFormDetails.LostQty;
            inventorycyclecountRecord.DamagedQty = inventorycyclecountFormDetails.DamagedQty;
            inventorycyclecountRecord.ExpiredQty = inventorycyclecountFormDetails.ExpiredQty;
            inventorycyclecountRecord.Reasons = inventorycyclecountFormDetails.Reasons;
            this.inventorycyclecount = this.inventorycyclecount.filter(i=>i.ItemMasterId!=null);
            //removing the edit mode
            this.recordInEditMode = -1;
            this.operation = GridOperations.Display;
            return true;
        }
        else 
        {
            //this.signupForm.markAsUntouched();          
            return false;
        }
    }

    updateGridItem(rowIndex:number)
    {       
        let formStatus = this.signupForm.status;      
        //if form status is not invalid....
        let formValue = this.signupForm.value;
        console.log(formStatus, this.signupForm);
        if(formStatus!="INVALID")
        {           
            let record = this.inventorycyclecount[rowIndex];            
            record.IsModified = true;
            
            record.ItemMasterId = record["Item"].ItemMasterId;
            record.ItemMasterName = record["Item"].ItemName;
            record.PhysicalQty = formValue.PhysicalQty;
            record.LostQty = formValue.LostQty;
            record.DamagedQty = formValue.DamagedQty;
            record.ExpiredQty = formValue.ExpiredQty;
            record.Reasons=formValue.Reasons;
            this.inventorycyclecount = this.inventorycyclecount.filter(i=>i.ItemMasterId!=null);
            this.recordInEditMode = -1;
            this.operation = GridOperations.Display;
            return true;
        }
        else
        {
           // this.signupForm.markAsUntouched();
            return false;
        }       
    }

    editGridItem(rowIndex:number)
    {

        if(this.operation ==  GridOperations.Add && this.signupForm.status!="INVALID")//if current operation is addd.
        {
            //removing the top most record from the array...
            this.inventorycyclecount.splice(0,1);
            this.inventorycyclecount = this.inventorycyclecount.filter(i=>i.ItemMasterId!=null);
            rowIndex = rowIndex - 1;
        }
        else if(this.operation==GridOperations.Add)
        {
          this.saveGridItem(this.recordInEditMode);
        }
        else if(this.operation==GridOperations.Edit)
        {
            this.updateGridItem(this.recordInEditMode);
        }
        //setting the record in edit mode..
        this.recordInEditMode = rowIndex;
        this.signupForm.patchValue({
            Item:"",
            PhysicalQty:0,
            LostQty:0,
            DamagedQty:0,
            ExpiredQty:0,
            Reason:"",
        });
        let record = this.inventorycyclecount[rowIndex];

        record["Item"] ={
            ItemMasterId:record.ItemMasterId,
            ItemName:record.ItemMasterName,
            Reason:record.Reasons
        };

        this.signupForm.patchValue(record);
        this.operation =  GridOperations.Edit;
    }


    qtyChange(qtyChange:any)
    {
        if(this.signupForm.get('Item').value!=null)
        {
            let currentQty = this.signupForm.get('SystemQty').value;
            let selectedQty = this.signupForm.get('PhysicalQty').value;
            console.log(selectedQty,currentQty);
            if(selectedQty > currentQty)
            {
                this.signupForm.get('PhysicalQty').setErrors({
                    'invalidQty':true
                });
            }
            else
            {
                this.signupForm.get('InventoryDisposalQty').setErrors(null);
            }
        }
    }


  

    








}
