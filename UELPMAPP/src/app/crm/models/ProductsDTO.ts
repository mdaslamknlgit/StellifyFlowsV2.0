
export interface ProductsDTO {
    ProductID: number;
    ProductCode: string;
    ProductSerialNo: string;
    ProductName: string;
    ProductFamilyId: number;
    ProductDescription: string;
    ProductIsActive: boolean;
    CategoryID: number;
    CreatedBy: number;
    CreatedDate: string;
    UpdatedBy: number;
    UpdatedDate: string;
    DeletedBy: number;
    DeletedDate: string;
}


export class SearchProducts {
    ProductID: number;
    ProductCode: string;
    ProductSerialNo: string;
    ProductName: string;
    ProductFamilyId: number;
    ProductDescription: string;
    ProductIsActive: boolean;
    CategoryID: number;
    Skip: number;
    Take: number;
    CreatedBy: number;
    UserId: number;
    FromDate: string;
    ToDate: string;
    constructor()
    {
        
    }
}