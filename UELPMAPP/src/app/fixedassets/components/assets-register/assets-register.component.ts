import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgbDateAdapter, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { LazyLoadEvent, SortEvent } from 'primeng/primeng';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { PagerConfig, SortingOrderType ,Location, Companies, Messages, MessageTypes } from '../../../shared/models/shared.model';
import { Asset, AssetFilter } from '../../models/asset.model';
import { AssetRegisterService } from '../../services/asset-register.service';
import { SharedService } from '../../../shared/services/shared.service';
import { RequestDateFormatPipe } from '../../../shared/pipes/request-date-format.pipe';
import { SessionStorageService } from '../../../shared/services/sessionstorage.service';
import { ExportToExcel } from '../../../shared/shared';
import { DisplayDateFormatPipe } from '../../../shared/pipes/display-date-format.pipe';

@Component({
  selector: 'app-assets-register',
  templateUrl: './assets-register.component.html',
  styleUrls: ['./assets-register.component.css'],
  providers:[AssetRegisterService,{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}]
})
export class AssetsRegisterComponent implements OnInit {

  @ViewChild('assetName') private assetNameRef: any;
  assetFilterForm:FormGroup;
  gridColumns:Array<{field:string,header:string,width:string}>= [];
  assetRegisterPagerConfig:PagerConfig;
  assetsList:Array<Asset> =[];
  searchKey:string ="";
  showFilterPopUp:boolean=false;
  isFilterApplied:boolean=false;
  filterMessage:string="";
  rightsection:boolean=false;
  showPopUp:boolean = false;
  selectedAsset:Asset;
  gridNoMessageToDisplay: string;
  constructor(private assetService:AssetRegisterService,
              private renderer:Renderer,
              private formBuilderObj:FormBuilder,
              private sharedServiceObj:SharedService,
              private reqDateFormatPipe:RequestDateFormatPipe,
              private sessionServiceObj:SessionStorageService,
              private displayDateFormatPipe:DisplayDateFormatPipe)
  {
    this.gridColumns = [
      { field: 'Sno', header: 'S.no.',width:"5%" },
      { field: 'Asset', header: 'Asset Name',width:"7%" },
      { field: 'BarCode', header: 'Bar Code',width:"10%" },
      { field: 'PurchasedDate', header: 'Purchased Date',width:"10%" },
      { field: 'Supplier', header: 'Supplier',width:"10%" },
      { field: 'InvoiceId', header: 'Invoice Number',width:"10%" },  
      { field: 'Location', header: 'Location',width:"10%" },
      { field: 'PurchasedValue',header:'Purchase Value',width:"10%" },
      { field: 'SalvageValue', header: 'Salvage Value',width:"8%" },
      { field: 'CurrentValue', header: 'Current Value',width:"8%" },
      { field: '', header: '',width:"4%" }       
    ];
    this.assetRegisterPagerConfig = new PagerConfig();
    this.assetRegisterPagerConfig.RecordsToSkip = 0;
    this.assetRegisterPagerConfig.RecordsToFetch = 10;
    this.assetRegisterPagerConfig.SortingExpr = "CreatedDate",
    this.assetRegisterPagerConfig.SortingOrder = "1";
    this.assetFilterForm = this.formBuilderObj.group({
      'AssetName':[""],
      'Location':[null],
      'Company':[null],
      'PurchasedDate':[null],
      'BarCode':[""]
    });
  }

  ngOnInit()
  {
    this.getAssets();
    this.sharedServiceObj.CompanyId$
    .subscribe((data)=>{
        this.getAssets();
    });
  }

  openDialog() {
    this.showFilterPopUp = true;
    if (this.assetNameRef != undefined) {
        this.assetNameRef.nativeElement.focus();
        this.renderer.invokeElementMethod(this.assetNameRef.nativeElement, 'focus'); // NEW VERSION
    }
  }

  onSearch(event: any) {
    if (event.target.value != "") {

          this.searchForAssets();
    }
    else {
      this.getAssets();
    }
  }

  getAssets()
  {
    let input = {
      Skip:this.assetRegisterPagerConfig.RecordsToSkip,
      Take:this.assetRegisterPagerConfig.RecordsToFetch,
      CompanyId:this.sessionServiceObj.getCompanyId(),
      SortExpression:this.assetRegisterPagerConfig.SortingExpr,
      SortDirection:this.assetRegisterPagerConfig.SortingOrder==null||this.assetRegisterPagerConfig.SortingOrder==""?"1":this.assetRegisterPagerConfig.SortingOrder,
      IsRegister:true 
    };
    this.assetService.getAssetRegister(input)
        .subscribe((data:{ Assets:Array<Asset> ,TotalRecords:number })=>{
        this.assetsList = data.Assets;
        if(this.assetsList.length>0){
          this.assetsList = data.Assets;
          this.assetRegisterPagerConfig.TotalRecords = data.TotalRecords;
        }
        else
        {
          this.gridNoMessageToDisplay = Messages.NoItemsToDisplay;
          this.getAssets();
        }
        
    },()=>{

    });
  }

  searchForAssets(assetsFilterObj?:AssetFilter)
  {
    let input = {
      Skip:this.assetRegisterPagerConfig.RecordsToSkip,
      Take:this.assetRegisterPagerConfig.RecordsToFetch,
      AssetName:assetsFilterObj.AssetName==null?"":assetsFilterObj.AssetName,
      SerialNumber:assetsFilterObj.SerialNumber==null?"":assetsFilterObj.SerialNumber,
      BarCode:assetsFilterObj.BarCode==null?"":assetsFilterObj.BarCode,
      PurchasedDate:assetsFilterObj.PurchasedDate!= null ? this.reqDateFormatPipe.transform(assetsFilterObj.PurchasedDate): assetsFilterObj.PurchasedDate,
      CompanyId:assetsFilterObj.Company==null?this.sessionServiceObj.getCompanyId():assetsFilterObj.Company.CompanyId,
      Search:this.searchKey,
      LocationId:assetsFilterObj.Location==null?0:assetsFilterObj.Location.LocationID,
      SortExpression:this.assetRegisterPagerConfig.SortingExpr,
      SortDirection:this.assetRegisterPagerConfig.SortingOrder
    };
    this.assetService.searchAsset(input)
        .subscribe((data:{ Assets:Array<Asset>,TotalRecords:number })=>{
          if(data.Assets.length > 0)
          {
           this.showFilterPopUp = false;
           this.assetsList = data.Assets;
           this.assetRegisterPagerConfig.TotalRecords = data.TotalRecords;
          }
          else
          {
            this.filterMessage ="No Records To Display";
          }
        },()=>{

        });
  }

  onLazyLoad(event:LazyLoadEvent)
  {
    this.assetRegisterPagerConfig.RecordsToSkip = event.first;
    this.assetRegisterPagerConfig.SortingExpr = event.sortField;
    this.assetRegisterPagerConfig.SortingOrder = event.sortOrder.toString();
    let filterObj:AssetFilter = this.assetFilterForm.value;
    if((this.searchKey==null||this.searchKey=="") && (filterObj.AssetName == '' &&
        filterObj.Location == null &&
        filterObj.Company == null &&
        filterObj.PurchasedDate == null &&
        filterObj.BarCode == ''))
    {
      this.getAssets();
    }
    else
    {
      this.searchForAssets(filterObj);
    }
  }

  resetData() {
    this.isFilterApplied = false;
    this.showFilterPopUp = true;
    this.resetFilters();
  }
  
  resetFilters() {
    this.assetFilterForm.reset();
    this.filterMessage = "";
    this.isFilterApplied = false;
    this.getAssets();
    if (this.assetNameRef != undefined) {
        this.assetNameRef.nativeElement.focus();
        this.renderer.invokeElementMethod(this.assetNameRef.nativeElement, 'focus'); // NEW VERSION
    }
  }

  validateFilterFields()
  {
    
  }
  
  filterData() {      
    this.filterMessage = "";
    let filterObj:AssetFilter = this.assetFilterForm.value;
    if((filterObj.AssetName == '' || filterObj.AssetName == null) && filterObj.Location == null && filterObj.Company == null && filterObj.PurchasedDate == null && (filterObj.BarCode == '' || filterObj.BarCode == null)) {
      if (open) {
        this.filterMessage = "Please select any filter criteria";
      }
      return;
    }
    this.isFilterApplied = true;
    this.searchForAssets(filterObj);
  }

  customSort(sortEvent:SortEvent)
  {  
    this.assetRegisterPagerConfig.SortingExpr = sortEvent.field;
    this.assetRegisterPagerConfig.SortingOrder = sortEvent.order.toString();
    //console.log("adfasdf");
    if(this.searchKey==null||this.searchKey=="")
    {
      this.getAssets();
    }
    else
    {
      this.searchForAssets();
    }
  }

  locationInputFormater = (x: Location) => x.Name;
    
  locationSearch = (text$: Observable<string>) =>
    text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>{
            let companyId = this.assetFilterForm.get('Company').value==null?this.sessionServiceObj.getCompanyId():this.assetFilterForm.get('Company').value.CompanyId
            return this.sharedServiceObj.getLocationByKey(term,companyId).pipe(
            catchError(() => {
                return of([]);
            }))
        })
  );

  companyInputFormater = (x:Companies) => x.CompanyName

  companySearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>{
          return this.sharedServiceObj.getCompaniesbykey(term).pipe(
          catchError(() => {
              return of([]);
          }))
      })
  );

  onPDFPrint(){             
    let data = {
      Skip:0,
      Take:0,
      CompanyId:this.assetFilterForm.value.Company==null?this.sessionServiceObj.getCompanyId():this.assetFilterForm.value.Company.CompanyId
    };
    let pdfDocument = this.assetService.printDetails(data);
    pdfDocument.subscribe((data) => {
        let result = new Blob([data], { type: 'application/pdf' });
        const fileUrl = URL.createObjectURL(result);
        let tab = window.open();
        tab.location.href = fileUrl;
    });
  }   
  ExportAsExcel() { 
    // let requestObj = {
    //     Search: "",
    //     Skip: this.assetRegisterPagerConfig.RecordsToSkip,
    //     Take: this.assetRegisterPagerConfig.RecordsToFetch,
    //     CompanyId: this.sessionServiceObj.getCompanyId()
    // };
    // this.assetService.getAssetRegister(requestObj)
    //     .subscribe((data: { Assets:Array<Asset> ,TotalRecords:number }) => {
            let headers:Array<{header:string,field:string}> = this.gridColumns.map(data=>{
              return { header : data.header , field : data.field }
            });
            let assets = [];
            this.assetsList.forEach(i=>{
              let assetObj ={};
              assetObj["S.no."] = i.SerialNumber;
              assetObj["Asset Name"] = i.Asset.AssetName;
              assetObj["Bar Code"] = i.BarCode;
              assetObj["Purchased Date"] = this.displayDateFormatPipe.transform(i.PurchasedDate);
              assetObj["Supplier"] = i.Supplier==null?"":i.Supplier.SupplierName;
              assetObj["Invoice Number"] = i.Invoice==null?"":i.Invoice.InvoiceCode;            
              assetObj["Location"] = i.Location==null?"": i.Location.Name;
              assetObj["Purchase Value"] = i.PurchasedValue;
              assetObj["Salvage Value"] = i.SalvageValue;
              assetObj["Current Value"] = i.CurrentValue;
              assets.push(assetObj);
            });
            //console.log(assets);
            if(assets.length>0)
            {
            ExportToExcel(assets,"Asset Register","Asset Register",headers,false);
            }
           else
    {
        this.sharedServiceObj.showMessage({
            ShowMessage: true,
            Message: Messages.NoRecordsExport,
            MessageType: MessageTypes.Success
          });
    }
          
        //});
  }

  showAssetPostingDetails(assetDetails:Asset)
  {
    this.showPopUp = true;
    this.selectedAsset = assetDetails;
  }
  hidePopUp()
  {
    this.showPopUp = false;
  }
}
