export  class ItemCategory
{
    Name:string;
    Description:string;
    CreatedBy:number;
    CreatedDate:Date;
    ModifiedBy:number;
    ItemCategoryID:number;
}

export class ItemCategoryDisplayInput
{
    Search:string;
    Skip:number;
    Take:number;
}