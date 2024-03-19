export  class ServiceType
{
    ServiceTypeId;
    ServiceCategoryId:number;
    Name:string;   
    ServiceCategoryName:string;
    Description:string;
    CreatedBy:number;
    UpdatedBy:number;     
    CreatedDate:Date;
    UpdatedDate: Date;
}

export class ServiceTypeDisplayInput
{
    Skip:number;
    Take:number;
    Search:string;
}