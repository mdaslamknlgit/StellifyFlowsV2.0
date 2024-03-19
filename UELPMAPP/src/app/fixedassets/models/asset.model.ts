import { UserProfile,Location, Companies, Invoices } from "../../shared/models/shared.model";
import { AssetMaster } from "./asset-master.model";
import { Supplier } from "../../po/models/supplier";
import { InvoiceDetails } from "../../po/models/supplier-invoice.model";

export class Asset
{
    AssetDetailsId:number;
    Asset:AssetMaster;
    AccountCode:string;
    SerialNumber:string;
    BarCode:string;
    PurchasedValue:number;
    PurchasedDate:Date;
    DepreciationId:number;
    SalvageValue:number;
    Location: Location;
    CurrentValue:number;
    UsedBy:UserProfile;
    CreatedBy:number;
    CreatedDate:number;
    ManufacturedDate:Date;
    ManufacturedBy:string;
    IsSelected?:boolean;
    CompanyId:number;
    Supplier:Supplier;
    Invoice:Invoices;
    ExpiryDate:Date;
    DepreciationYears:number;
    GLCode:string;
    
}

export class AssetFilter
{
    AssetName:string;
    SerialNumber:string;
    BarCode:string;
    Company:Companies;
    Location:Location;
    PurchasedDate:any;
}