import { GridDisplayInput } from "../../shared/models/shared.model";

export  class ItemsListing
{
     ItemMasterID:number;
     ItemCategoryName:string;
     ItemTypeName:string;        
     ExpiryDate :Date;
     ItemMasterCode :string;
     Name :string;
     StatusName :string;
     Manufacturer :string;
     Brand :string;
     OpeningStockValue:number;      
     LocationName :string;
     UOMName :string;
     IsSelected : boolean;
     LowAlertQuantity:number;
     ReOrderLevel:number;
     StockInhand:number;


}


export class ItemsListingDisplayInput
{
    Skip:number;
    Take:number;
}


export class ItemsListingFilterDisplayInput extends GridDisplayInput
{
    ItemNameFilter : string ;
    ItemCategoryFilter : string ;
    ItemTypeFilter : string ;
    DepartmentFilter : string ;
    CompanyId:number;
}