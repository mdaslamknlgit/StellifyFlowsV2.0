import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChange, SimpleChanges } from "@angular/core";
import { Asset } from "../../models/asset.model";
import { AssetRegisterService } from "../../services/asset-register.service";

@Component({
  selector:"asset-posting-details",
  templateUrl:"./asset-posting-details.component.html",
})
export class AssetPostingDetailsComponent implements OnInit,OnChanges
{
  @Input() assetRecord:Asset;
  @Output() hideVoidPopUp:EventEmitter<boolean> = new EventEmitter<boolean>();
  gridColumns:Array<{field:string,header:string,width:string}>= [];
  assetPostingDetails:Array<Asset> =[];
  showVoidPopUp:boolean = false;
  constructor(private assetRegisterService:AssetRegisterService)
  {
    this.gridColumns = [
        { field: 'BeginningValue', header: 'Beginning Value',width:"15%" },
        { field: 'SalvageValue', header: 'Salvage Value',width:"15%" },
        { field: 'DepreciationAmount', header: 'Depreciation Amount',width:"15%" },
        { field: 'AccDepreciationAmount', header: 'Accumulated Depreciation Amount',width:"15%" },
        { field: 'EndingValue', header: 'Ending Value',width:"15%" },
        { field: 'IsPosted', header: 'Is Posted',width:"10%" },
        { field: 'DateOfPosting', header: 'Date Of Posting',width:"10%" }    
    ];
  }
  ngOnInit()
  {

  }
  ngOnChanges(change:SimpleChanges)
  {
    this.showVoidPopUp = true;
    this.getAssetDetails();
  }

  onPopUpHide()
  {
    this.hideVoidPopUp.emit(true);
  }

  getAssetDetails()
  {
    this.assetRegisterService.getPostedDepDetails(this.assetRecord.AssetDetailsId)
        .subscribe((data:Array<Asset>)=>{
            this.assetPostingDetails = data;
        });
  }

}