import { Locations } from "./../../inventory/models/item-master.model";
import { TransactionType } from "./../../shared/models/shared.model";

export class CustomerTypeMaster {
    CustomerTypeId: number;
    CustomerTypeName: string;
    Description: string;
    IsActive: boolean;
    CreatedBy: number;
    UpdatedBy: number;
    constructor() {
        return {
            CustomerTypeId: 0,
            CreatedBy: 0,
            CustomerTypeName: '',
            Description: '',
            IsActive: true,
            UpdatedBy: 0
        }
    }
}

export class Bank {
    BankMasterId: number;
    CompanyId: number;
    BankName: string;
    BankACNo: String;
    BankCode: string;
    BranchCode: string;
    SwiftCode: string;
    Misc1Information: string;
    Misc2Information: string;
    ImageSource: string;
    CreatedBy: number;
    UpdatedBy: number;
    IsDefault: boolean;
    IsActive: boolean;
}

export class EmailConfiguration {
    EmailConfigId: number;
    CompanyId: number;
    Department: Locations;
    ProcessType: EmailConfigProcess;
    Users: UserEmail[];
    GroupEmail: string;
    CreatedBy: number;
    UpdatedBy: number;
    IsActive: boolean;
}

export class EmailConfigurationDisplayResult {
    EmailConfiguration: Array<EmailConfiguration>
    TotalRecords: number;
}

export class AdhocUser {
    AdhocUsersId: number
    ECId: number
    UserID: number
    Emailid: string
    UserName: string
}
export class LocationMaster {
    LocationMasterId: number
    LocationName: string
    LocationDescription: string
    CreatedBy: number;
    CreatedDate: Date
    UpdatedBy: number;
    UpdatedDate: Date;
    CompanyId: number
}
export class TaxMaster {
    TaxMasterId: number;
    TransactionType: TransactionType;
    TaxGroup: TaxGroup;
    TaxName: string;
    CreatedBy: number;
    UpdatedBy: number;
    IsActive: boolean;
}
export class TaxType {
    TaxTypeId: number;
    TaxTypeName: string;
    TaxPercentage: number;
    TaxGroup: TaxGroup;
    TaxClass: string;
    IsActive: boolean;
    IsDefault: boolean;
    CreatedBy: number;
    UpdatedBy: number;
}
export class TenantType {
    TenantTypeId: number;
    TenantTypeName: string;
    Description: string;
    CreatedBy: number;
    UpdatedBy: number;
    IsActive: boolean;
}

export class CreditTerm {
    CreditTermId: number;
    CompanyId?: number;
    CreditTermCode: string;
    NoOfDays?: number;
    Description?: string;
    IsActive?: boolean;
    CreatedBy?: number;
    UpdatedBy?: number;
    IsDefault?: boolean;
}

export class Location {
    LocationId: number;
    CompanyId: number;
    LocationName: string;
    Description: string;
    IsActive: boolean;
    CreatedBy: number;
    UpdatedBy: number;
}

export class TaxGroup {
    CompanyId: number;
    TaxGroupId: number;
    TaxGroupName: string;
    Description: string;
    IsActive: boolean;
    CreatedBy: number;
    UpdatedBy: number;
}

export class EmailConfigProcess {
    ProcessId: number;
    ProcessName: string;
}
export class UserEmail {
    UserId: number;
    Email: string;
    UserName: string;
}

export class MasterProcess {
    ProcessId: number;
    DocumentId: number;
    UserId: number;
    Status?: boolean;
    Remarks?: string;
    IsDefault?: boolean;
}

export enum MasterProcessTypes {
    CustomerType = 1,
    BankMaster = 2,
    TenantType = 3,
    CreditTerm = 4,
    Location = 5,
    TaxGroup = 6,
    TaxMaster = 7,
    TaxType = 8,
    EmailConfiguration = 9,
    CustomerMaster = 10
}