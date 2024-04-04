import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeliveryTermsService } from "../../services/delivery-terms.service";
import { DeliveryTerms  } from "../../models/delivery-terms.model";
import { FullScreen } from '../../../shared/shared';
import { PagerConfig,Messages,MessageTypes, ResponseStatusTypes, UserDetails } from '../../../shared/models/shared.model';
import { SharedService } from '../../../shared/services/shared.service';
import { ConfirmationService } from 'primeng/primeng';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';

@Component({
  selector: 'app-delivery-terms',
  templateUrl: './delivery-terms.component.html',
  styleUrls: ['./delivery-terms.component.css'],
  providers:[DeliveryTermsService]
})
export class DeliveryTermsComponent implements OnInit {

    hidetext: boolean=true;
    hideInput: boolean=false;
    leftsection:boolean=false;
    rightsection:boolean=false;
    scrollbarOptions:any;
    deliveryTermsList:Array<DeliveryTerms>=[];
    deliveryTermForm: FormGroup;
    selectedDeliveryTerms:DeliveryTerms;  
    deliveryTermPagerConfig:PagerConfig;
    isSearchApplied: boolean = false;
    filterMessage: string = "";
    initDone = false;
    isFilterApplied: boolean = false;
    deliveryTermFilterInfoForm: FormGroup;
    filteredDeliveryTerm: Array<DeliveryTerms> = [];
    CompanyId:number;
    public innerWidth: any;
    @ViewChild("Code") nameInput: ElementRef;
    totalRecords:number = 0;
    @ViewChild('rightPanel') rightPanelRef;  
    errorMessage: string = Messages.NoRecordsToDisplay;

  constructor(private formBuilderObj:FormBuilder,
              private deliveryTermObj:DeliveryTermsService,
              private sharedServiceObj:SharedService,
              private confirmationServiceObj:ConfirmationService,
              private renderer: Renderer,
              public sessionService: SessionStorageService){ 

    this.deliveryTermPagerConfig = new PagerConfig();
    this.selectedDeliveryTerms = new DeliveryTerms();
    this.deliveryTermPagerConfig.RecordsToSkip =0;
    this.deliveryTermPagerConfig.RecordsToFetch = 10;
    this.deliveryTermForm = this.formBuilderObj.group({
      'Code':["",[Validators.required]], 
      'NoOfDays':[0,[Validators.required]],
      'Description':["",Validators.required],
      'DeliveryTermsId':[0]
    });
    this.deliveryTermFilterInfoForm = this.formBuilderObj.group({
        Code: [''],
        Days: ['']
    });
    this.initDone=true;


  }
  ngOnInit() {

    this.sharedServiceObj.CompanyId$
    .subscribe((data)=>{
        this.CompanyId = data;
        //getting the purchase orders list..
        this.getDeliveryTerms(0);
  });
    
  }
  trimSpaces(){
    this.deliveryTermForm.get('Description').setValue(this.deliveryTermForm.get('Description').value.trim());
   }
  getDeliveryTerms(selectedDeliveryTermId:number)
  {
    let deliveryTermsInput = {
      Search:"",
      CompanyId:this.CompanyId,
      Skip : this.deliveryTermPagerConfig.RecordsToSkip,
      Take : this.deliveryTermPagerConfig.RecordsToFetch
    };
    this.deliveryTermObj.getDeliveryTerms(deliveryTermsInput)
      .subscribe((data:{ DeliveryTerms:Array<DeliveryTerms>,TotalRecords:number })=>{
          this.deliveryTermsList = data.DeliveryTerms;
          this.deliveryTermPagerConfig.TotalRecords = data.TotalRecords;
          if(this.deliveryTermsList.length>0)
          {
            if(selectedDeliveryTermId==0)
            {
                this.onRecordSelection(this.deliveryTermsList[0].DeliveryTermsId);
            }
            else
            {
                this.onRecordSelection(selectedDeliveryTermId);
            }
          }
          else
          {
            this.addRecord();
          }             
      });
  }


  GetAllSearchDeliveryterm(searchString: string): void {       

    let purchaseOrderDisplayInput = {
        Search:searchString,  
        CompanyId:this.CompanyId,
        Skip : 0,
        Take : this.deliveryTermPagerConfig.RecordsToFetch
      };

    this.deliveryTermObj.getAllDeliveryTerms(purchaseOrderDisplayInput)
        .subscribe((data: { DeliveryTerms: Array<DeliveryTerms>, TotalRecords: number }) => {
            this.deliveryTermsList = data.DeliveryTerms;
            this.filteredDeliveryTerm = this.deliveryTermsList;
            this.totalRecords = data.TotalRecords;
            if (this.deliveryTermsList.length > 0) {
                this.selectedDeliveryTerms = this.deliveryTermsList[0];
            }
            else {
                this.hidetext=true;
                this.hideInput=false;                
            }
        });
}

  onSearch(event: any) {
    if (event.target.value != "") {
        
            this.isSearchApplied = true;
            this.GetAllSearchDeliveryterm(event.target.value);
       
    }
    else {
        this.isSearchApplied = false;
        this.getDeliveryTerms(0);
        }
    }

    openDialog() {
        this.initDone = true;       
        this.nameInput.nativeElement.focus();
        this.renderer.invokeElementMethod(this.nameInput.nativeElement, 'focus');
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        this.resetFilters();
    }

    filterData() {
        let Days = "";
        let Code = "";
        this.filterMessage = "";
        
        if (this.deliveryTermFilterInfoForm.get('Code').value != "") {
            Code = this.deliveryTermFilterInfoForm.get('Code').value;
        }
        if (this.deliveryTermFilterInfoForm.get('Days').value != "") {
            Days = this.deliveryTermFilterInfoForm.get('Days').value;
        }

        if (Days === '' &&  Code === '') {
            if (open) {
                this.filterMessage = "Please select any filter criteria";
            }
            return;
        }

        if (Days != '' && Code != '') {
            this.filteredDeliveryTerm = this.deliveryTermsList.filter(x => x.Code.toLowerCase().indexOf(Code.toLowerCase()) !== -1 && x.NoOfDays === Number(Days));
        }

        if (Days != '' && Code === '') {
            this.filteredDeliveryTerm = this.deliveryTermsList.filter(x => x.Code.toLowerCase().indexOf(Code.toLowerCase()) !== -1);
        }

        if (Days != '' && Code != '') {
            this.filteredDeliveryTerm = this.deliveryTermsList.filter(x => x.Code.toLowerCase().indexOf(Code.toLowerCase()) !== -1 && x.NoOfDays === Number(Days));
        }

        if (Days != '' && Code === '') {
            this.filteredDeliveryTerm = this.deliveryTermsList.filter(x=> x.NoOfDays === Number(Days));
        }

        if (Days === '' && Code != '') {
            this.filteredDeliveryTerm = this.deliveryTermsList.filter(x => x.Code.toLowerCase().indexOf(Code.toLowerCase()) !== -1);
        }

        if (this.filteredDeliveryTerm.length > 0) {
            this.totalRecords = this.filteredDeliveryTerm.length;
            this.deliveryTermsList=this.filteredDeliveryTerm;
            this.selectedDeliveryTerms=this.deliveryTermsList[0];
            this.isFilterApplied = true;
            if (open) {
                this.initDone = false;
            }

        }
        else {
            this.filterMessage = "No matching records are found";
            this.filteredDeliveryTerm = this.deliveryTermsList;
            this.totalRecords = this.filteredDeliveryTerm.length;
            if (this.filteredDeliveryTerm.length > 0) {
                this.selectedDeliveryTerms = this.deliveryTermsList[0];
            }
        }
    }



    resetFilters() {
        this.deliveryTermFilterInfoForm.get('Code').setValue("");
        this.deliveryTermFilterInfoForm.get('Days').setValue("");
        this.filterMessage = "";
        this.filteredDeliveryTerm = this.deliveryTermsList;
        this.totalRecords = this.filteredDeliveryTerm.length;
        if (this.filteredDeliveryTerm.length > 0) {
            this.getDeliveryTerms(0);
        }
        else {
            this.hidetext=true;
            this.hideInput=false;
        }
        this.isFilterApplied = false;
        if (this.nameInput != undefined) {
            this.nameInput.nativeElement.focus();
            this.renderer.invokeElementMethod(this.nameInput.nativeElement, 'focus'); // NEW VERSION
        }

    }




  onRecordSelection(selectedDeliveryTermId:number)
  {
    this.deliveryTermObj.getDeliveryTermDetails(selectedDeliveryTermId)
        .subscribe((data:DeliveryTerms)=>{

          this.selectedDeliveryTerms = data;
          this.deliveryTermForm.patchValue(data);
          this.hidetext=true;
          this.hideInput=false;

        },()=>{

        });
  }
  editRecord(){
      //setting this variable to false so as to show the category details in edit mode
      this.hideInput = true;
      this.hidetext = false;
      this.deliveryTermForm.reset();
      this.deliveryTermForm.setErrors(null);
      this.deliveryTermForm.patchValue(this.selectedDeliveryTerms);
  }
  saveRecord()
  {
      let formStatus = this.deliveryTermForm.status;
      if(formStatus!="INVALID")
      {
        let delieryTermDetails:DeliveryTerms = this.deliveryTermForm.value; 
        let userDetails = <UserDetails >this.sessionService.getUser()
        delieryTermDetails.CreatedBy = userDetails.UserID;
        delieryTermDetails.CompanyId = this.sessionService.getCompanyId();
        if(this.selectedDeliveryTerms.DeliveryTermsId==0||this.selectedDeliveryTerms.DeliveryTermsId==null)
        {
            this.deliveryTermObj.createDeliveryTerm(delieryTermDetails)
              .subscribe((savedRecordId:number)=>{
                      this.hidetext=true;
                      this.hideInput=false;
                      this.sharedServiceObj.showMessage({
                          ShowMessage:true,
                          Message:Messages.SavedSuccessFully,
                          MessageType:MessageTypes.Success
                      });
                      this.getDeliveryTerms(savedRecordId);
              },(data:HttpErrorResponse)=>{
                if(data.error.Message==ResponseStatusTypes.Duplicate)
                {
                   this.showDuplicateMessage();
                }
              });
        }
        else 
        {
            this.deliveryTermObj.updateDeliveryTerm(delieryTermDetails)
                .subscribe((response)=>{
                      this.hidetext=true;
                      this.hideInput=false;
                      this.sharedServiceObj.showMessage({
                          ShowMessage:true,
                          Message:Messages.UpdatedSuccessFully,
                          MessageType:MessageTypes.Success
                      });
                      this.getDeliveryTerms(delieryTermDetails.DeliveryTermsId);
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
          Object.keys(this.deliveryTermForm.controls).forEach((key:string) => {
              if(this.deliveryTermForm.controls[key].status=="INVALID" && this.deliveryTermForm.controls[key].touched==false)
              {
                  this.deliveryTermForm.controls[key].markAsTouched();
              }
          });  
      }
  }
  split(){ 
    this.leftsection= !this.leftsection;
    this.rightsection= !this.rightsection;
  }
  showDuplicateMessage()
  {
    this.deliveryTermForm.get('Code').setErrors({'duplicate':true});
  }
  cancelRecord(){ 
    this.hidetext=true;
    this.hideInput=false;
  }
  addRecord()
  {
      this.hidetext=false;
      this.hideInput=true;
      this.selectedDeliveryTerms = new DeliveryTerms();
      this.deliveryTermForm.reset();
      this.deliveryTermForm.setErrors(null);
  }
  deleteRecord()
  {
    let recordId = this.selectedDeliveryTerms.DeliveryTermsId;
    let userDetails = <UserDetails >this.sessionService.getUser();
    this.confirmationServiceObj.confirm({
        message: Messages.ProceedDelete,
        header:Messages.DeletePopupHeader,
        accept: () => {     

          this.deliveryTermObj.deleteDeliveryTerm(recordId, userDetails.UserID).subscribe((data)=>{
                this.sharedServiceObj.showMessage({
                    ShowMessage:true,
                    Message:Messages.DeletedSuccessFully,
                    MessageType:MessageTypes.Success
                });
                this.getDeliveryTerms(0);
          });
          
        },
        reject: () => {
        }
    });
  }
  showFullScreen()
  {
    this.innerWidth = window.innerWidth;       
    if(this.innerWidth > 1000){ 
      FullScreen(this.rightPanelRef.nativeElement);
    }
  }
  pageChange(currentPageNumber:any)
  {
      this.deliveryTermPagerConfig.RecordsToSkip = this.deliveryTermPagerConfig.RecordsToFetch*(currentPageNumber-1);
      this.getDeliveryTerms(0);
  }
}
