import { Component, OnInit, ViewChild, Renderer, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Tax, TaxDisplayInput, TaxFilterDisplayInput } from '../../models/tax.model';
import { SharedService } from '../../../shared/services/shared.service';
import { ConfirmationService, SortEvent } from 'primeng/primeng';
import { ResponseStatusTypes, Messages, MessageTypes, PagerConfig, UserDetails } from '../../../shared/models/shared.model';
import { FullScreen } from '../../../shared/shared';
import { TaxService } from '../../services/tax.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { Observable, of, identity } from 'rxjs';
import { Router } from '@angular/router';
interface People {
    firstname?: string;
    lastname?: string;
    age?: string;
}
@Component({
    selector: 'app-tax-list',
    templateUrl: './tax-list.component.html',
    styleUrls: ['./tax-list.component.css'],
    providers:[TaxService]
})
export class TaxListComponent implements OnInit {
    public selectedItems: any[];
    SelectedTaxes: string = '';
    TotalSelectedTaxes: number = 0;
    @ViewChild('rightPanel') rightPanelRef;
    @ViewChild('taxName') private taxNameRef: any;
    leftSection:boolean=false;
    rightSection:boolean=false;
    selectedTaxRecord : Tax
    taxFilterInfoForm:FormGroup;
    TaxesList:Array<Tax> = [];
    TaxesListCols: any[] = [];
    taxForm:FormGroup;
    taxSearchKey:string;
    taxclasses:Array<number> = [1,2,3,4,5];
    isDisplayMode?:boolean = true;
    formSubmitAttempt: boolean = false;
    scrollbarOptions:any;
    taxGroupPagerConfig: PagerConfig;
    filterMessage: string = "";
    filteredtax = [];
    totalRecords: number = 0;
    initDone = false;
    initSettingsDone = true;
    isFilterApplied: boolean = false;
    errorMessage: string = Messages.NoRecordsToDisplay;
    taxGroups = [];
    uploadedRecords: string = "";
    failedRecords: string = "";
    newPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
    printPermission: boolean;  
    public innerWidth: any;
    showfilters:boolean=false;
    showfilterstext:string="Show List" ;

    constructor(private taxServiceObj:TaxService,
        private router: Router,
    private sharedServiceObj:SharedService,
    private confirmationServiceObj:ConfirmationService,
    public sessionService: SessionStorageService,
    private renderer:Renderer, private   formBuilderObj:FormBuilder) {
  
        this.taxGroupPagerConfig = new PagerConfig();
        this.taxGroupPagerConfig.RecordsToSkip = 0;
        this.taxGroupPagerConfig.RecordsToFetch = 25;
        this.selectedTaxRecord = {
            TaxName:"",
            TaxAmount:0,                        
            CreatedBy:0,
            TaxId:0,
            TaxGroupId:0,
            // TaxAuthority:"",
            TaxType:1,
            TaxClass:1,
        };
        this.taxForm = new FormGroup({
            TaxId:new FormControl(0),
            TaxName:new FormControl("",[Validators.required,this.noWhitespaceValidator]),
            // TaxAuthority:new  FormControl("",[Validators.required]),
            TaxGroupId:new FormControl(0, [Validators.required]),
            TaxAmount:new FormControl(0,[Validators.required]),
            TaxType :new FormControl(0),
            TaxClass: new FormControl(0,[Validators.required]),
        });

        this.taxFilterInfoForm = this.formBuilderObj.group({
            TaxnameFilter: [''],
            AuthorityFilter: [''],
            TaxAmountFilter:['']
           });

        this.getTaxGroups();
        this.getTaxes();
   
    }

    ngOnInit() {
        this.TaxesListCols = [
            //{ field: '', header: '', width: '30px' },
            { field: 'TaxName', header: 'Tax Name', width: '100px' },
            { field: 'TaxAuthority', header: 'Authority', width: '100px' },
            { field: 'TaxAmount', header: 'Tax In %', width: '100px' },
            { field: '', header: 'Action', width: '50px' },
        ];
        let roleAccessLevels = this.sessionService.getRolesAccess();
        if (roleAccessLevels != null && roleAccessLevels.length > 0) {    
          let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "gsttype")[0];     
          this.newPermission = formRole.IsAdd;
          this.editPermission = formRole.IsEdit;
          this.deletePermission = formRole.IsDelete;
          this.printPermission=formRole.IsPrint;
        }
        else
        {
          this.newPermission = true;
          this.editPermission = true;
          this.deletePermission = true;
          this.printPermission=true;
        }
        this.showfilters =true;
        this.showfilterstext="Hide List" ;

    }
    public noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || '').trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : { 'whitespace': true };
      }
      
    getTaxes()
    {
        let displayInput:TaxDisplayInput = {
            Skip : this.taxGroupPagerConfig.RecordsToSkip,
            Take : this.taxGroupPagerConfig.RecordsToFetch,
            Search:""
        };
        //calling the service method to get the list of item categories...
        this.taxServiceObj.getTaxes(displayInput)
            .subscribe((data:{ Taxes :Array<Tax>,TotalRecords:number})=>{
                this.TaxesList = data.Taxes;
                this.taxGroupPagerConfig.TotalRecords =  data.TotalRecords;
                //checking if the item category records length is more than 0
                if(this.TaxesList.length > 0)
                {   //setting the first record as the selected record...                  
                    this.selectedTaxRecord = this.TaxesList[0];
                }
                else
                {
                    this.isDisplayMode = true;
                    this.selectedTaxRecord = {
                        TaxName:"",
                        TaxAmount:0,
                        CreatedBy:0,
                        TaxId:0,
                        // TaxAuthority:"",
                        TaxGroupId:0,
                        TaxType:1,
                        TaxClass:1,
                    };
                }
        });
    }

    getAllSearchTaxes(searchKey:string)
    {
        let displayInput:TaxDisplayInput = {
            Skip : this.taxGroupPagerConfig.RecordsToSkip,
            Take : this.taxGroupPagerConfig.RecordsToFetch,
            Search:searchKey
        };
        //calling the service method to get the list of item categories...
        this.taxServiceObj.getTaxes(displayInput)
            .subscribe((data:{ Taxes :Array<Tax>,TotalRecords:number})=>{
                this.TaxesList = data.Taxes;
                this.taxGroupPagerConfig.TotalRecords =  data.TotalRecords;
                //checking if the item category records length is more than 0
                if(this.TaxesList.length > 0)
                {   //setting the first record as the selected record...
                    this.selectedTaxRecord = this.TaxesList[0];
                }
                else
                {
                    this.isDisplayMode = true;
                    this.selectedTaxRecord = {
                        TaxName:"",
                        TaxAmount:0,                        
                        CreatedBy:0,
                        TaxId:0,
                        // TaxAuthority:"",
                        TaxGroupId:0,
                        TaxType:1,
                        TaxClass:1,
                    };
                }
        });
    }

 getTaxGroups(): void {
    let taxGroupResult = <Observable<Array<any>>>this.sharedServiceObj.getTaxGroupList();
    taxGroupResult.subscribe((data) => {
      this.taxGroups = data;
    });
  }

    openDialog() {
        this.initDone = true;
        if (this.taxNameRef != undefined) {
            this.taxNameRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.taxNameRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    resetFilters() {
        this.taxFilterInfoForm.get('TaxnameFilter').setValue("");
        this.taxFilterInfoForm.get('AuthorityFilter').setValue("");
        this.taxFilterInfoForm.get('TaxAmountFilter').setValue("");
        this.filterMessage = "";
        this.filteredtax = this.TaxesList;
        if (this.filteredtax.length > 0) {
            this.getTaxes();
        }

        this.isFilterApplied = false;
        if (this.taxNameRef != undefined) {
            this.taxNameRef.nativeElement.focus();
            this.renderer.invokeElementMethod(this.taxNameRef.nativeElement, 'focus'); // NEW VERSION
        }
    }

    filterData() {      
        let TaxnameFilter = "";
        let AuthorityFilter = "";
        let TaxAmountFilter = "";
        this.filterMessage = "";
        if (this.taxFilterInfoForm.get('TaxnameFilter').value != "") {
            TaxnameFilter = this.taxFilterInfoForm.get('TaxnameFilter').value;
        }

        if (this.taxFilterInfoForm.get('AuthorityFilter').value != "") {
            AuthorityFilter = this.taxFilterInfoForm.get('AuthorityFilter').value;
        }

        if (this.taxFilterInfoForm.get('TaxAmountFilter').value != "") {
            TaxAmountFilter = this.taxFilterInfoForm.get('TaxAmountFilter').value;
        }

        if (TaxnameFilter === '' && AuthorityFilter === '' && TaxAmountFilter === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        let displayFilterInput:TaxFilterDisplayInput = {
            Skip : this.taxGroupPagerConfig.RecordsToSkip,
            Take : this.taxGroupPagerConfig.RecordsToFetch,
            TaxnameFilter:TaxnameFilter,
            AuthorityFilter:AuthorityFilter,
            TaxAmountFilter:TaxAmountFilter,
        };
        //calling the service method to get the list of item categories...
        this.taxServiceObj.getFilterTaxes(displayFilterInput)
            .subscribe((data:{ Taxes :Array<Tax>,TotalRecords:number})=>{
               
                
                //checking if the item category records length is more than 0
                if( data.Taxes.length > 0)
                {   //setting the first record as the selected record...
                    this.TaxesList = data.Taxes;
                    this.taxGroupPagerConfig.TotalRecords =  data.TotalRecords;
                    this.selectedTaxRecord = this.TaxesList[0];
                    this.isFilterApplied = true;
                    if (open) {
                        this.initDone = false;
                    }
                }
                else
                {
                    this.filterMessage = "No matching records are found";
                }
        });
    }



onItemRecordSelection(record: Tax) {
    this.split();
    this.selectedTaxRecord = record;
    this.isDisplayMode = true;
}

AddNewTax(e) {
    this.router.navigate([`/po/taxes/${'NEW'}/${0}`]);
    // this.showfilters = false;
    // this.showfilterstext = "Show List";
    // this.innerWidth = window.innerWidth;
    // if (this.innerWidth < 550) {
    //     $(".leftdiv").addClass("hideleftcol");
    //     $(".rightPanel").addClass("showrightcol");
    // }

    // //setting this variable to false so as to show the category details in edit mode
    // this.isDisplayMode = false;
    // this.selectedTaxRecord = {
    //     TaxName: "",
    //     TaxAmount: 0,
    //     CreatedBy: 0,
    //     TaxId: 0,
    //     // TaxAuthority:"",
    //     TaxGroupId: 0,
    //     TaxType: 1,
    //     TaxClass: 1,
    // };
    // //resetting the item category form..
    // this.taxForm.reset();
}
EditTax(taxId:any)
{
    //this.split();
    //this.selectedTaxRecord = record;
    //this.isDisplayMode = true;

    this.router.navigate([`/po/taxes/${'EDIT'}/${taxId}`]);

}
    onSearchInputChange(event: any) {
        if (event.target.value != "") {
           this.getAllSearchTaxes(event.target.value); 
        }
        else {
            this.getTaxes();
        }
    }
    hidefilter(){
        this.innerWidth = window.innerWidth;       
        if(this.innerWidth < 550){      
        $(".filter-scroll tr").click(function() {       
        $(".leftdiv").addClass("hideleftcol");
        $(".rightPanel").addClass("showrightcol");  
        $(".rightcol-scrroll").height("100%");  
      }); 
      }
      }
     

    editRecord()
    {
        //setting this variable to false so as to show the category details in edit mode
        this.isDisplayMode = false;
        //resetting the item category form.
        this.taxForm.reset();

        this.taxForm.patchValue(this.selectedTaxRecord);

    }

    checkTaxClass(taxGroupId:number,taxClass:number){
        this.taxServiceObj.getTaxClassCount(taxGroupId,taxClass)
        .subscribe((data:number)=>{
            if(data>0){
                this.taxForm.get('Taxname').setErrors({'Duplicate':true});
                return data;
            }
        });
    }


    saveRecord()
    {      
        this.formSubmitAttempt = true;
        let taxFormStatus = this.taxForm.status;  
        
        if(taxFormStatus!="INVALID")
        {   
            // this.taxServiceObj.getTaxClassCount(this.taxForm.get("TaxGroupId").value,this.taxForm.get("TaxClass").value)
            // .subscribe((data:number)=>{
            //     if(data>0){                  
            //         this.taxForm.get('TaxClass').setErrors({'Duplicate':true});
            //         return ;
            //     }
            // });


           // var count=this.checkTaxClass(this.taxForm.get("TaxGroupId").value,this.taxForm.get("TaxClass").value);
           
            //getting the item category form details
            let taxDetails:Tax = this.taxForm.value; 
            let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();
            taxDetails.CreatedBy = userDetails.UserID;
            if(this.selectedTaxRecord.TaxId==0)
            {
                this.taxServiceObj.createTax(taxDetails).subscribe((taxId:number)=>{
                    this.sharedServiceObj.showMessage({
                        ShowMessage:true,
                        Message:Messages.SavedSuccessFully,
                        MessageType:MessageTypes.Success
                    });
                    this.formSubmitAttempt = false;
                    //after save we will show details in display mode..so setting this variable to true...
                    this.isDisplayMode = true;
                    this.getTaxes();



                    //pushing the record details into the array...
                    // this.taxes.unshift({
                    //     TaxId:taxId,
                    //     TaxName:taxDetails.TaxName,
                    //     TaxAmount:taxDetails.TaxAmount,
                    //     // TaxAuthority:taxDetails.TaxAuthority,
                    //     TaxGroupId:taxDetails.TaxGroupId,
                    //     TaxType:taxDetails.TaxType,
                    //     CreatedBy:1,
                    //     TaxClass:taxDetails.TaxClass,
                    // });
                    // this.selectedTaxRecord = this.taxes[0];
                   // console.log(this.taxes[0]);
                },(data:HttpErrorResponse)=>{
                    if(data.error.Message==ResponseStatusTypes.Duplicate)
                    {
                       this.showDuplicateMessage();
                    }
                  });
            }
            else
            {

                taxDetails.TaxId = this.selectedTaxRecord.TaxId;
                this.taxServiceObj.updateTax(taxDetails).subscribe((response)=>{
                    
                        this.sharedServiceObj.showMessage({
                            ShowMessage:true,
                            Message:Messages.UpdatedSuccessFully,
                            MessageType:MessageTypes.Success
                        });
                        this.formSubmitAttempt = false;
                        //after save we will show details in display mode..so setting this variable to true...
                        this.isDisplayMode = true;

                        this.getTaxes();
                        //updating the category name and description here...
                        // let taxRecord = this.taxes.find(data=>data.TaxId==this.selectedTaxRecord.TaxId);

                        // taxRecord.TaxName = taxDetails.TaxName;
                        // taxRecord.TaxAmount = taxDetails.TaxAmount;
                        // // taxRecord.TaxAuthority = taxDetails.TaxAuthority;
                        // taxRecord.TaxGroupId = taxDetails.TaxGroupId;
                        // taxRecord.TaxType = taxDetails.TaxType;
                        // taxRecord.CreatedBy = taxDetails.CreatedBy;
                        // taxRecord.TaxClass = taxDetails.TaxClass;

                        // this.taxes = this.taxes.filter(data=>data.TaxId>0);
                        // this.selectedTaxRecord = taxRecord;
                    
                      },(data:HttpErrorResponse)=>{
                    if(data.error.Message==ResponseStatusTypes.Duplicate)
                    {
                       this.showDuplicateMessage();
                    }
                });
            }
        }
        else
        {
            Object.keys(this.taxForm.controls).forEach((key: string) => {
                if (this.taxForm.controls[key].status == "INVALID" && this.taxForm.controls[key].touched == false) {
                    this.taxForm.controls[key].markAsTouched();
                  }
                });
            this.taxForm.markAsUntouched();
        }
    }
    validateControl(control: FormControl) {
        return ((control.invalid && control.touched) || (control.invalid && control.untouched && this.formSubmitAttempt));
    }

    onClickedOutside(e: Event) {
       // this.showfilters= false; 
        if(this.showfilters == false){ 
          //  this.showfilterstext="Show List"
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
    
  
    showLeftCol(event)
    {
        $(".leftdiv").removeClass("hideleftcol"); 
        $(".rightPanel").removeClass("showrightcol"); 
    }
    showFullScreen()
    {
        this.innerWidth = window.innerWidth;       
 
 if(this.innerWidth > 1000){ 
 
        FullScreen(this.rightPanelRef.nativeElement);
 }
    }
    showDuplicateMessage()
    {
    //   this.taxForm.get('Taxname').setErrors({'Duplicate':true});
    this.taxForm.get('TaxClass').setErrors({'Duplicate':true});
    }
    cancelRecord()
    {
        //setting this variable to true so as to show the category details
        this.taxForm.reset();
        this.taxForm.setErrors(null);
        this.formSubmitAttempt = false;
        if(this.selectedTaxRecord.TaxId > 0)
        {
            //setting this variable to true so as to show the category details
            this.isDisplayMode = true;
        }
        else if(this.TaxesList.length > 0)
        {
            this.selectedTaxRecord = this.TaxesList[0];
            //setting this variable to true so as to show the category details
            this.isDisplayMode = true;
        }
        else
        {
            this.isDisplayMode =null;
        }
    }
    deleteRecord()
    {        
     let userDetails:UserDetails = <UserDetails>this.sessionService.getUser();
     this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header:Messages.DeletePopupHeader,
        accept: () => {
                let recordId = this.selectedTaxRecord.TaxId;
                this.taxServiceObj.deleteTax(recordId,userDetails.UserID).subscribe((data)=>{
                    if(data==true)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.TaxValidationMessage,
              MessageType: MessageTypes.Error
            
            });
          }
          else
          {
              this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.DeletedSuccessFully,
              MessageType: MessageTypes.Success
            
            });
          }
                    //getting the index of the item in the array...
                    let recordIndex = this.TaxesList.findIndex(i=>i.TaxId==recordId);
                    //removing the record from the item categories list using index...
                    this.TaxesList.splice(recordIndex,1);
                    //checking if the itemCategory records exists...
                    if(this.TaxesList.length > 0)
                    {
                        //if records exist then we will show the details of the first record...
                        this.selectedTaxRecord = this.TaxesList[0];
                    }
                    else
                    {
                        this.isDisplayMode = null;
                        this.selectedTaxRecord = {
                            TaxName:"",
                            TaxAmount:0,                        
                            CreatedBy:0,
                            TaxId:0,
                            TaxGroupId:0,
                            // TaxAuthority:"",
                            TaxType:1,
                            TaxClass:1,
                        };
                    }
                });
            }
        });
    }
    pageChange(currentPageNumber:any)
    {
        this.taxGroupPagerConfig.RecordsToSkip = this.taxGroupPagerConfig.RecordsToFetch*(currentPageNumber-1);
        if(this.taxSearchKey!=null && this.taxSearchKey!="")
        {
            this.getAllSearchTaxes(this.taxSearchKey);
        }
        else{
        this.getTaxes();
        }
        this.showfilters =true;
        this.showfilterstext="Hide List" ;
    }

    uploadFile(event) {
        if (event.target.files.length == 0) {
          return
        }
       
        let file: File = event.target.files[0];
        let userDetails = <UserDetails>this.sessionService.getUser();
        this.taxServiceObj.uploadTaxes(userDetails.UserID, file)
          .subscribe((data: any) => {
            if (data != null) {
              this.uploadedRecords = "<b>Number of UploadedRecords: " + data.UploadedRecords + " </b>";
              this.failedRecords = "<b>Number of FailedRecords: " + data.FailedRecords + " </b>";
              this.errorMessage = data.Message;
              if (data.UploadedRecords > 0) {
                this.getTaxes();
              }
            }
          });
      }
//************************************************************************************************************/
//Grid Functions Multiple Record Selection 
//************************************************************************************************************/
onRowSelect(event) {
    let i = 0;
    this.SelectedTaxes = "";
    debugger;
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedTaxes == "") {
            this.SelectedTaxes = this.selectedItems[i].TaxId;
        }
        else {
            this.SelectedTaxes = this.SelectedTaxes + "," + this.selectedItems[i].TaxId;
        }
    }
    this.TotalSelectedTaxes = this.selectedItems.length;
    //alert("Selected Leads : " + this.SelectedTaxes + "\n Total Selected Leads : " + this.TotalSelectedTaxes);
}
onRowUnselect(event) {
    let i = 0;
    this.SelectedTaxes = "";
    debugger;
    for (i = 0; i <= this.selectedItems.length - 1; i++) {
        if (this.SelectedTaxes == "") {
            this.SelectedTaxes = this.selectedItems[i].TaxId;
        }
        else {
            this.SelectedTaxes = this.SelectedTaxes + "," + this.selectedItems[i].TaxId;
        }
    }
    this.TotalSelectedTaxes = this.selectedItems.length;
    if (this.TotalSelectedTaxes == 0) {
        this.SelectedTaxes = "";
    }
    //alert("Un Selected Leads : " + this.SelectedTaxes + "\n Total Un Selected Leads : " + this.TotalSelectedTaxes);
}
//************************************************************************************************************/

//*************************************************************************************************************/
//Sorting Functions
//*************************************************************************************************************/
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
      
//*************************************************************************************************************/






}
