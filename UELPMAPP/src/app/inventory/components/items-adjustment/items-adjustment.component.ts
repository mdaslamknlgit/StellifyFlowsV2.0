import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ItemAdjustmentService } from '../../services/item-adjustment.service';
import { SharedService } from '../../../shared/services/shared.service';
import { ItemAdjustment, ItemAdjustmentDisplayInput } from '../../models/item-adjustment.model';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ItemMaster,Location,ResponseStatusTypes,ResponseMessage, Messages,MessageTypes } from '../../../shared/models/shared.model';
import { ConfirmationService } from 'primeng/components/common/api';
import { FullScreen } from '../../../shared/shared';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';

@Component({
  selector: 'app-items-adjustment',
  templateUrl: './items-adjustment.component.html',
  styleUrls: ['./items-adjustment.component.css'],
  providers:[ItemAdjustmentService]
})
export class ItemsAdjustmentComponent implements OnInit {
    showfilters:boolean=false;
    showfilterstext:string="Show List" ;
    leftsection:boolean=false;
    rightsection:boolean=false;
    itemAdjustmentList:Array<ItemAdjustment> = [];

    //holds the selected location transfer record...
    selectedRecord:ItemAdjustment;

    //form for creating location transfer record...
    itemAdjustmentForm:FormGroup;
    
    //whether the item content we are displaying is in edit/display mode...
    isDisplayMode?:boolean = true;
    //hold the number of records to skip...
    recordsToSkip:number = 0;

    //hold the number of records to fetch ...while showing in the list view..
    recordsToFetch:number = 10;

    //holds the total number of category records..
    totalRecords:number = 0;

    formSubmitAttempt: boolean = false;
    scrollbarOptions:any;
    companyId:number;
    @ViewChild('rightPanel') rightPanelRef;
  constructor(private itemAdjustmentServiceObj:ItemAdjustmentService,private sharedServiceObj:SharedService,
              private confirmationServiceObj:ConfirmationService,public sessionService: SessionStorageService) {
                this.companyId = this.sessionService.getCompanyId();

      }

  ngOnInit() {
    this.DefaultValueParameter();
    this.itemAdjustmentForm = new FormGroup({

      ItemMasterId:new FormControl(0,[Validators.required]),
      AdjustedQty:new FormControl(0,[Validators.required]),
      ReasonForAdjustment:new FormControl(""),
      Location:new FormControl(0,[Validators.required])      
    });

    this.getItemAdjustments();
  }

  showFullScreen()
      {
          FullScreen(this.rightPanelRef.nativeElement);
      }

  DefaultValueParameter(){
      this.selectedRecord = {

        ItemAdjustmentId:0,       
        ItemMasterId:0,        
        ItemName:"",
        ItemMasterCode:"",
        ExistingQty:0,
        AdjustedQty:0,
        ReasonForAdjustment :0,
        WorkFlowStatus:"",
        WorkFlowStatusId:0,
        LocationId:0,
        LocationName:"",

    };
  }

  addRecord()
    {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;
       this.DefaultValueParameter();
        this.itemAdjustmentForm.reset();
        this.showfilters =false;
    this.showfilterstext="Show List" ;
    }

    cancelRecord(){
        this.formSubmitAttempt = false;
        if(this.selectedRecord.ItemAdjustmentId > 0)
        {
            this.isDisplayMode = true;
        }
        else if(this.itemAdjustmentList.length > 0)
        {
            this.selectedRecord = this.itemAdjustmentList[0];
            this.isDisplayMode = true;
        }
        else
        {
            this.isDisplayMode =null;
        }
    }
    onClickedOutside(e: Event) {
       // this.showfilters= false; 
      }

    split(){ 
        this.showfilters=!this.showfilters;
        if(this.showfilters == true){ 
            this.showfilterstext="Hide List" 
        }
            else{
                this.showfilterstext="Show List" 
    }
      }

    /**
     * this mehtod will be called when user gives contents to the  "item master" autocomplete...
     */
    itemMasterSearch = (text$: Observable<string>) =>

        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(term =>

                this.sharedServiceObj.getItemMasterByKey({                    
                  searchKey:term,
                  CompanyId:this.companyId,
                  LocationID:this.itemAdjustmentForm.get('Location').value==null?null:this.itemAdjustmentForm.get('Location').value["LocationID"]
              }).pipe(
                catchError(() => {
                    return of([]);
                }))
            )
    );


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
     * this method is used to format the content to be display in the autocomplete textbox after selection..
     */
    locationInputFormater = (x: Location) => x.Name;
/**
     * to set the location transfer record selection...
     */
    onRecordSelection(record:ItemAdjustment)
    {
        this.selectedRecord = record;
    }

      /**
     * to get the item categories...
     */
    getItemAdjustments()
    {

        let displayInput:ItemAdjustmentDisplayInput = {

            Skip : this.recordsToSkip,
            Take : this.recordsToFetch
        };
        //calling the service method to get the list of item categories...
        this.itemAdjustmentServiceObj.getItemAdjustment(displayInput)
            .subscribe((data:{ ItemAdjustment :Array<ItemAdjustment>,TotalRecords:number})=>{

                this.itemAdjustmentList = data.ItemAdjustment;                
                this.totalRecords =  data.TotalRecords;
                //checking if the item category records length is more than 0
                if(this.itemAdjustmentList.length > 0)
                {  
                    this.isDisplayMode = true;
                    this.selectedRecord = this.itemAdjustmentList[0];                
                }
                else
                {
                    this.DefaultValueParameter();                 
                }
            },
            (err)=>{
                console.log("came to error methods",err);
            });
    }

    onChange(event){  
    let data = event.item;
    this.selectedRecord.ExistingQty = data.ExistingQuantity;
    this.selectedRecord.ItemMasterCode =  data.ItemMasterCode;
};

    onChangeQty(event){
      if(this.itemAdjustmentForm.get('AdjustedQty').value>this.selectedRecord.ExistingQty)
      {
            this.itemAdjustmentForm.get('AdjustedQty').setErrors({
            "InValidQuantity":true
            });
      }
      else{
        this.itemAdjustmentForm.setErrors(null);
      }
    }

    /**
     * to save the given location transfer details...
     */
    saveRecord()
    {      
        this.formSubmitAttempt = true;
      //getting the status of the form
      let itemAdjustmentFormStatus = this.itemAdjustmentForm.status;
      if(itemAdjustmentFormStatus!="INVALID")
      {
          //getting the location tranfer form details
          let itemAdjustmentDetails:ItemAdjustment = this.itemAdjustmentForm.value; 
          let LocationDetails = itemAdjustmentDetails.Location;
          itemAdjustmentDetails.LocationId = LocationDetails.LocationID;
          let itemMasterDetails = itemAdjustmentDetails.ItemMasterId;
          itemAdjustmentDetails["ItemMasterId"] = itemMasterDetails["ItemMasterId"];   
          itemAdjustmentDetails["ExistingQty"] = this.selectedRecord.ExistingQty;
          itemAdjustmentDetails["ItemMasterCode"] = itemMasterDetails["ItemMasterCode"];
          if(this.selectedRecord.ItemAdjustmentId==0)
          {
              this.itemAdjustmentServiceObj.createItemAdjustmentRequest(itemAdjustmentDetails)
              .subscribe((itemAdjustmentId:number)=>{
                    this.sharedServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.SavedSuccessFully,
                        MessageType:MessageTypes.Success
                    });
                    this.formSubmitAttempt = false;
                  //after save we will show details in display mode..so setting this variable to true...
                  this.isDisplayMode = true;
                  //pushing the record details into the array...
                  this.itemAdjustmentList.unshift({        
                                  
                    ItemAdjustmentId:itemAdjustmentId,
                    ItemMasterId:itemAdjustmentDetails.ItemMasterId,                    
                    ItemName:itemMasterDetails["ItemName"],
                    ItemMasterCode:itemAdjustmentDetails.ItemMasterCode,
                    ExistingQty:itemAdjustmentDetails.ExistingQty,
                    AdjustedQty:itemAdjustmentDetails.AdjustedQty,                    
                    ReasonForAdjustment:itemAdjustmentDetails.ReasonForAdjustment,
                    WorkFlowStatus:"",
                    WorkFlowStatusId:1,
                    LocationId:itemAdjustmentDetails.LocationId,
                    LocationName:LocationDetails["Name"],                    
                  });
                  this.selectedRecord = this.itemAdjustmentList[0];
              },
              //error call back method..
              (err)=>{
              });
          }
          else//updating the record...
          {
            itemAdjustmentDetails.ItemAdjustmentId = this.selectedRecord.ItemAdjustmentId;
              this.itemAdjustmentServiceObj.updateItemAdjustmentRequest(itemAdjustmentDetails)
                    .subscribe((data)=>{

                        this.sharedServiceObj.showMessage({
                            ShowMessage:true,
                            Message:Messages.UpdatedSuccessFully,
                            MessageType:MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        //after save we will show details in display mode..so setting this variable to true...
                        this.isDisplayMode = true;
                        //updating the location transfer record here...
                        let itemAdjustmentRecord = this.itemAdjustmentList.find(data=>data.ItemAdjustmentId==
                                                                            this.selectedRecord.ItemAdjustmentId);

                        itemAdjustmentRecord.AdjustedQty = itemAdjustmentDetails.AdjustedQty;
                        itemAdjustmentRecord.ReasonForAdjustment = itemAdjustmentDetails.ReasonForAdjustment;
                        itemAdjustmentRecord.ItemMasterId = itemAdjustmentDetails.ItemMasterId;
                        itemAdjustmentRecord.LocationId =  itemAdjustmentDetails.LocationId;
                        itemAdjustmentRecord.ItemMasterId = itemAdjustmentDetails.ItemMasterId;
                        itemAdjustmentRecord.WorkFlowStatusId = 1;

                        this.itemAdjustmentList = this.itemAdjustmentList.filter(data=>data.ItemAdjustmentId > 0);
                        this.selectedRecord = itemAdjustmentRecord;

                    },(err)=>{
                    });
          }
      }
    }

    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
      }


deleteRecord()
{
        this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header:Messages.DeletePopupHeader,
        accept: () => {

                let recordId = this.selectedRecord.ItemAdjustmentId;
                this.itemAdjustmentServiceObj.DeleteItemAdjustmentRequest(recordId)
                .subscribe((data)=>{
                    this.sharedServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.DeletedSuccessFully,
                        MessageType:MessageTypes.Success
                    });

                    let recordIndex = this.itemAdjustmentList.findIndex(i=>i.ItemAdjustmentId == recordId);
                    this.itemAdjustmentList.splice(recordIndex,1);
                    if(this.itemAdjustmentList.length > 0)
                    {
                        this.selectedRecord = this.itemAdjustmentList[0];
                    }
                    else
                    {
                        this.isDisplayMode = null;
                        this.DefaultValueParameter();
                    }
                },(err)=>{
                });
        }
    });
}

editRecord()
    {
        this.isDisplayMode = false;
        this.itemAdjustmentForm.reset();

        this.itemAdjustmentForm.get('Location').setValue({
          LocationID:this.selectedRecord.LocationId,
          Name:this.selectedRecord.LocationName
      });

        this.itemAdjustmentForm.get('ItemMasterId').setValue({
            ItemMasterId:this.selectedRecord.ItemMasterId,
            ItemName:this.selectedRecord.ItemName
        });        
       
        this.itemAdjustmentForm.get('AdjustedQty').setValue(this.selectedRecord.AdjustedQty);
        this.itemAdjustmentForm.get('ReasonForAdjustment').setValue(this.selectedRecord.ReasonForAdjustment);        
    }

    onSubmit(){
    }
 
}
