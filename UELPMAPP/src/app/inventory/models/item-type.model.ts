export  class ItemType
{
    ItemTypeID:number;
    Name:string;
    Description:string;
    ItemCategoryID:number;
    ItemCategoryName:string;
    CreatedBy:number;
    CreatedDate:Date;
    ModifiedBy:number;
    ModifiedDate:Date;
}

export class ItemTypeDisplayInput
{
    Skip:number;
    Take:number;
    Search:string;
}
export  class ExportItemType
{
    ItemTypeID:number;
    Name:string;
    Description:string;
    ItemCategoryID:number;
    ItemCategoryName:string;
    CreatedBy:number;
    CreatedDate:Date;
    ModifiedBy:number;
    ModifiedDate:Date;
    
    
}