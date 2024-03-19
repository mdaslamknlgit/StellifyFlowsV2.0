import { Suppliers } from "../../shared/models/shared.model";

export class AssetMaster
{
    public AssetId:number;
    public AssetName:string;
    public AssetCode:string;
    public Warranty:string;
    public AssetCategoryId:number;
    public AssetCategory:string;
    public BarCode:string;
    public PreferredSuppliers:Array<PreferredSupplier>;
    public CreatedBy:number;
}
export class PreferredSupplier
{
   public AssetPreferredSupplierId:number;
   public AssetId:number;
   public Supplier:Suppliers;
   public IsDeleted:boolean;
}