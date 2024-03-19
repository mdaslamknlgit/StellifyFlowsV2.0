export interface MeasurementUnit
{
    Name:string;
    Code:string;
    Description:string;
    Abbreviation:string;
    CreatedBy:number;
    CreatedOn:Date;
    ModifiedBy:number;
    MeasurementUnitID:number;
}

export  class MeasurementUnitDisplayInput
{
    Skip:number;
    Take:number;
    Search: string;
    Name?:string;
    Code?:string;
}
