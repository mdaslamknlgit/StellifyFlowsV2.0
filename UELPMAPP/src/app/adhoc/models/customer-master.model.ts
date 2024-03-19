import { Locations } from "./../../inventory/models/item-master.model";
import { AddressType, ApprovalDocumentInfo, Countries, Currency, Nationality } from "../../shared/models/shared.model"
import { CreditTerm, CustomerTypeMaster, TaxGroup, TaxMaster, TaxType, TenantType } from "./adhoc-master.model";

export class SalesCustomer extends ApprovalDocumentInfo {
    CustomerIPSId: number;
    CompanyId: number;
    DocumentCode: string;
    CustomerType: CustomerTypeMaster;
    CustomerName: string;
    ShortName: string;
    SystemNo: string;
    CustomerId: string;
    TenantType: TenantType;
    Department: Locations;
    CreditTerm: CreditTerm;
    Currency: Currency;
    Remarks: string;
    TypeOfBusiness: string;
    URL: string;
    ROC: string;
    RateType: string;
    AccountSetId: string;
    TaxGroup: TaxGroup;
    TaxType: TaxType;
    TaxMaster: TaxMaster;
    CreditLimit: number;
    BankCode: string;
    GLAccount: string;
    IsDeleted: boolean;
    MasterCustomerIPSId: number;
    CustomerAddresses: SalesCustomerAddress[];
    CustomerContacts: SalesCustomerContact[];
}

export class SalesCustomerAddress {
    Index: number;
    CustomerAddressId: number;
    CustomerIPSId: number;
    AddressType: AddressType;
    FullAddress: string;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    Telephone: string;
    Fax: string;
    Country: Countries;
    City: string;
    PostalCode: string;
    Email: string;
    Attention: string;
}

export class SalesCustomerContact {
    CustomerContactId: number;
    CustomerIPSId: number;
    Name: string;
    Nationality: Nationality;
    ContactNo: string;
    Purpose: string;
    Designation: string;
    NRICPassportNo: string;
    Email: string;
    IsDefault: boolean;
}

export class SalesCustomerSearch {
    CompanyId?: number;
    IsApprovalPage: boolean;
    UserId: number;
    FetchFilterData?: boolean;
    CustomerName?: string;
    CustomerId?: string;
    CustomerTypeId?: number;
    SearchTerm?: string;
    FetchApproved?: boolean;
}