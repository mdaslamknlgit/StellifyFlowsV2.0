export class AccountCode {
    AccountCodeId: number;
    AccountCodeCategoryId:number;
    Code:number;
    CompanyId:number;
    AccountType: string;
    AccountCode: string;
    Description: string;
    CreatedBy: number;
    CreatedDate:Date;
    UpdatedBy:number;
    UpdatedDate:Date;
    AccountCodeCategoryName: string; 
}

export class AccountCodeMaster {
    AccountCodeId: number;
    Code: string;
    AccountCodeCategoryId:number;   
    AccountType: string;
    AccountCodeName: string;
    Description: string;  
    AccountCodeCategoryName:string;
}
export class AccountCodebyCat {
    AccountCodeId: number;
    Code: string;
    AccountCodeCategoryId:number;   
    AccountType: string;
    AccountCodeName: string;
    Description: string;  
}

export class AccountCodeCategory {
    AccountCodeCategoryId: number;   
    CompanyId:number;
    AccountCodeName: string;   
}
export class AccountType {
    AccountTypeId: number;
    AccountTypeName: string; 
}

export class AccountCodeList{
   AccountType:string;
   CompanyId:number;  
   AccountCodes:AccountCode[];
}


