import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ConfirmationService } from 'primeng/primeng';
import { SharedService } from '../../../shared/services/shared.service';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { PagerConfig, Messages, MessageTypes, ResponseStatusTypes } from '../../../shared/models/shared.model';
import { Currency, CurrencyDisplayResult } from '../../models/currencies';
import { CurrencyApiService } from '../../services/currency-api.service';
import { FullScreen } from '../../../shared/shared';
import { Router } from '@angular/router';

@Component({
  selector: 'app-currencies',
  templateUrl: './currencies-list.component.html',
  styleUrls: ['./currencies-list.component.css'],
  providers: [CurrencyApiService]
})
export class CurrenciesListComponent implements OnInit {

  CurrencyManagementListCols: any[];  
  CurrencyManagementPagerConfig: PagerConfig;  
  CurrencyManagementList: Array<Currency> = [];
  selectedCurrencyManagementRecord: Currency;
  slideactive:number=0;
  recordsToSkip: number = 0;
  recordsToFetch: number = 10;
  totalRecords: number = 0;
  hidetext?: boolean = null;
  hideinput?: boolean = null;
  CurrencyFilterInfoForm: FormGroup;
  filterMessage: string = "";
  initSettingsDone = true;
  showRightPanelLoadingIcon: boolean = false;
  showLeftPanelLoadingIcon: boolean = false;
  initDone = false;
  scrollbarOptions: any;
  isFilterApplied: boolean = false;
  currencyManagementForm: FormGroup;  
  formSubmitAttempt: boolean = false;
  leftsection: boolean = false;
  rightsection: boolean = false;
  filteredCurrency = [];
  currencySearchKey: string = null;  
  newPermission: boolean;
  editPermission: boolean;
  deletePermission: boolean;
  public innerWidth: any;
  
  showfilters:boolean=false;
  showfilterstext:string="Show List" ;
  @ViewChild('rightPanel') rightPanelRef;
  @ViewChild('userName') private userRef: any;

  constructor(private formBuilderObj: FormBuilder,
    private router: Router,
    private currencyApiServiceObj: CurrencyApiService,
    private confirmationServiceObj: ConfirmationService,
    private sharedServiceObj: SharedService,
    public sessionService: SessionStorageService,
    private renderer: Renderer) { }


  ngOnInit() {


    this.CurrencyManagementListCols = [
        { field: 'Code', header: 'Code', width: '100px' },
        { field: 'Name', header: 'Name', width: '200px' },
        { field: 'Status', header: 'Status', width: '150px' },
        { field: 'Symbol', header: 'Symbol', width: '150px'  },
        { field: '', header: 'Action', width: '100px'  },
    ];

    //getting role access levels  
    let roleAccessLevels = this.sessionService.getRolesAccess();
    if (roleAccessLevels != null && roleAccessLevels.length > 0) {
      let formRole = roleAccessLevels.filter(x => x.PageName.replace(/\s/g, "").toLowerCase() == "currency")[0];

      this.newPermission = formRole.IsAdd;
      this.editPermission = formRole.IsEdit;
      this.deletePermission = formRole.IsDelete;
    }
    else {
      this.newPermission = true;
      this.editPermission = true;
      this.deletePermission = true;
    }
      this.CurrencyManagementPagerConfig = new PagerConfig();
      this.CurrencyManagementPagerConfig.RecordsToSkip = 0;
      this.selectedCurrencyManagementRecord = new Currency();
      this.CurrencyManagementPagerConfig.RecordsToFetch = 100;

      this.currencyManagementForm = this.formBuilderObj.group({  
        'Name': [null,{ validators: [Validators.required, this.noWhitespaceValidator]}],
        'Code': [null, { validators: [Validators.required, this.noWhitespaceValidator]}],
        'Symbol':[""],
        //'Status': 0,
      });

      this.getCurrency(0);
      this.showfilters =true;
      this.showfilterstext="Hide List" ;
  }
  
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }


  matselect(event){ 
        if(event.checked==1){
        this.slideactive=1;  
        }
        else{
          this.slideactive=0;   
        }
      }


  onSearchInputChange(event: any) { 
    if (this.currencySearchKey != "") {
        if (this.currencySearchKey.length >= 3) {
            this.getAllSearchCurrency(this.currencySearchKey, 0);
        }
    }
    else {
          this.getCurrency(0);
        }
    }

    getAllSearchCurrency(searchKey: string, idToBeSelected: number) {
        let userListInput = {
            Skip: 0,
            Take: this.CurrencyManagementPagerConfig.RecordsToFetch,
            Search: searchKey
        };
        this.currencyApiServiceObj.getCurrency(userListInput)
            .subscribe((data: CurrencyDisplayResult) => {
                this.CurrencyManagementList = data.CurrencyManagementList
                this.CurrencyManagementPagerConfig.TotalRecords = data.TotalRecords
                if (this.CurrencyManagementList.length > 0) {
                    // if (idToBeSelected === 0) {
                    //     this.onRecordSelection(this.CurrencyManagementList[0].Id);
                    // }
                    // else {
                    //     this.onRecordSelection(idToBeSelected);
                    // }
                }
                else {
                    this.addRecord();
                }
            });
    }

    getCurrency(IdToBeSelected: number) {
      let displayInput = {
          Skip: this.CurrencyManagementPagerConfig.RecordsToSkip,
          Take: this.CurrencyManagementPagerConfig.RecordsToFetch,
          Search: ""
      };
      this.currencyApiServiceObj.getCurrency(displayInput)
          .subscribe((data: CurrencyDisplayResult) => {           
            debugger;  
              this.CurrencyManagementList = data.CurrencyManagementList;
              this.CurrencyManagementPagerConfig.TotalRecords = data.TotalRecords;
              this.showLeftPanelLoadingIcon = false;
              if (this.CurrencyManagementList.length > 0) {
                //   if (IdToBeSelected == 0) {
                //       this.onRecordSelection(this.CurrencyManagementList[0].Id);

                //   }
                //   else {
                //       this.onRecordSelection(IdToBeSelected);
                //   }
              }
              else {
                  this.addRecord();
              }
          }, (error) => {
              this.showLeftPanelLoadingIcon = false;
          });
    }
    getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }
    onRecordSelection(Id: number) { 

        //this.router.navigate(['/po/contractpolist/master/'+ this.getRandomInt(100)]);
        this.router.navigate([`/admin/currencies/${Id}`]);

        this.split();
        this.currencyApiServiceObj.getCurrencyDetails(Id)
            .subscribe((data: Currency) => {
                this.selectedCurrencyManagementRecord = data;
                this.currencyManagementForm.patchValue(data);
                this.showRightPanelLoadingIcon = false;
                this.hidetext = true;
                this.hideinput = false;
                this.editRecord();
            }, (error) => {
                this.hidetext = true;
                this.hideinput = false;
                this.showRightPanelLoadingIcon = false;
            });
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
    addRecord() {
        this.router.navigate([`/admin/currencies/${0}`]);
        // this.innerWidth = window.innerWidth;
        // if (this.innerWidth < 550) {
        //     $(".leftdiv").addClass("hideleftcol");
        //     $(".rightPanel").addClass("showrightcol");
        // }
        // this.hidetext = false;
        // this.hideinput = true;
        // this.selectedCurrencyManagementRecord = new Currency();
        // this.currencyManagementForm.reset();
        // this.currencyManagementForm.setErrors(null);
        // this.showfilters = false;
        // this.showfilterstext = "Show List";
    }

    editRecord() {
        this.hideinput = true;
        this.hidetext = false;
        this.currencyManagementForm.reset();
        this.currencyManagementForm.setErrors(null);
        console.log(this.selectedCurrencyManagementRecord);
        this.currencyManagementForm.patchValue(this.selectedCurrencyManagementRecord);
        //this.Id=this.selectedCurrencyManagementRecord.Id;
    }

    cancelRecord() {
          this.currencyManagementForm.reset();
          this.currencyManagementForm.setErrors(null);
          this.formSubmitAttempt = false;
          if (this.CurrencyManagementList.length > 0 && this.selectedCurrencyManagementRecord != undefined) {
              if (this.selectedCurrencyManagementRecord.Id == undefined || this.selectedCurrencyManagementRecord.Id == 0) {
                  this.onRecordSelection(this.CurrencyManagementList[0].Id);
              }
              else {
                  this.onRecordSelection(this.selectedCurrencyManagementRecord.Id);
              }
              this.hideinput = false;
              this.hidetext = true;
          }
          else {
              this.hideinput = null;
              this.hidetext = null;
          }
      }

  
    deleteRecord() {    
        this.confirmationServiceObj.confirm({
            message: Messages.ProceedDelete,
            header: Messages.DeletePopupHeader,
            accept: () => {
                let recordId = this.selectedCurrencyManagementRecord.Id;
                this.currencyApiServiceObj.deleteCurrency(recordId).subscribe((data) => {
                    if(data==true)
          {
            this.sharedServiceObj.showMessage({
              ShowMessage: true,
              Message: Messages.CurrencyValidationMessage,
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

                    this.getCurrency(0);
                });
            },
            reject: () => {
            }
        });
    }


    saveRecord() {
          console.log(this.currencyManagementForm.value);
          let currencyManagementFormStatus = this.currencyManagementForm.status;
          if (currencyManagementFormStatus != "INVALID") {
              let currencymanagementDetails: Currency = this.currencyManagementForm.value;
              
              //currencymanagementDetails.Status=currencymanagementDetails.Status==1?1:0;
              console.log(currencymanagementDetails);

              if (this.selectedCurrencyManagementRecord.Id == 0 || this.selectedCurrencyManagementRecord.Id == null) {
                currencymanagementDetails.Id=0;
                  this.currencyApiServiceObj.createCurrency(currencymanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                      if (response.Status == ResponseStatusTypes.Success) {
                          this.hidetext = true;
                          this.hideinput = false;
                          this.sharedServiceObj.showMessage({
                              ShowMessage: true,
                              Message: Messages.SavedSuccessFully,
                              MessageType: MessageTypes.Success
                          });
                          this.formSubmitAttempt = false;
                          this.getCurrency(response.Value);
                      }
                      else if (response.Status == "Duplicate Currency") {
                          this.currencyManagementForm.get('Name').setErrors({
                              'DuplicateCurrency': true
                          });
                      }
                  });
              }
              else {
                currencymanagementDetails.Id = this.selectedCurrencyManagementRecord.Id;

                  this.currencyApiServiceObj.updateCurrency(currencymanagementDetails).subscribe((response: { Status: string, Value: any }) => {

                      if (response.Status == ResponseStatusTypes.Success) {
                          this.hidetext = true;
                          this.hideinput = false;
                          this.sharedServiceObj.showMessage({
                              ShowMessage: true,
                              Message: Messages.UpdatedSuccessFully,
                              MessageType: MessageTypes.Success
                          });
                          this.formSubmitAttempt = false;

                          this.getCurrency(currencymanagementDetails.Id);

                      }
                      else if (response.Status == "Duplicate Id") {
                        this.currencyManagementForm.get('UserProfile').setErrors({
                            'DuplicateUser': true
                        });
                    }
                  });
              }
          }
          else {            
              Object.keys(this.currencyManagementForm.controls).forEach((key: string) => {
                  if (this.currencyManagementForm.controls[key].status == "INVALID" && this.currencyManagementForm.controls[key].touched == false) {
                      this.currencyManagementForm.controls[key].markAsTouched();
                  }
              });
          }
      }


    pageChange(currentPageNumber: any) {
        this.CurrencyManagementPagerConfig.RecordsToSkip = this.CurrencyManagementPagerConfig.RecordsToFetch * (currentPageNumber - 1);
        this.getCurrency(0);
    }

    onClickedOutside(e: Event) {
      //  this.showfilters= false; 
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
    showFullScreen() {
        FullScreen(this.rightPanelRef.nativeElement);
    }

    
    openDialog() {
      this.initDone = true;
      if (this.userRef != undefined) {
          this.userRef.nativeElement.focus();
          this.renderer.invokeElementMethod(this.userRef.nativeElement, 'focus'); // NEW VERSION
      }
    }

    resetData() {
        this.isFilterApplied = false;
        this.initDone = true;
        //this.resetFilters();
    }




}
