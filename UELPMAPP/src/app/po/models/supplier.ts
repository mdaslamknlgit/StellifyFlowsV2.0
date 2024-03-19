import { SupplierServices } from "./supplier-service.model";
import { WorkflowAuditTrail } from "./workflow-audittrail.model";
import { Attachments, SupplierCategory } from "../../shared/models/shared.model";
import { Company } from '../../administration/models/company';
import { SupplierWorkFlowParameter } from '../../administration/models/workflowcomponent';
import { NumberFormatStyle } from "../../../../node_modules/@angular/common";
export class Supplier {
    SupplierId: number;
    SupplierCode: string;
    LocationId: number;
    CreatedDate: Date;
    SupplierName: string;
    SupplierShortName: string;
    SupplierServiceID: number;
    SupplierCategoryID: number;
    SupplierAddress: string;
    ServiceName: string;
    CategoryName: string;
    PaymentTermCode: string;
    BillingCountry: string;
    Country: Countries;
    ShippingCountry: string;
    CurrencyCode: string;
    // PaymentTermsId: number;
    SupplierEmail: string;
    BillingAddress1: string;
    BillingAddress2: number;
    BillingCity: string;
    BillingCountryId: string;
    BillingZipcode: string;
    BillingTelephone: string;
    BillingAddress3: string;
    BillingFax: number;
    IsDeleted: boolean;
    IsGSTSupplier: boolean;
    TaxID: number;
    TaxName: string;
    TaxAmount: NumberFormatStyle
    SupplierTypeID: number
    // TaxClass:number;
    // RateType:number;
    // AccountSet:number;
    CoSupplierCode: string;
    // GSTNumber:string;
    Remarks: string;
    // ShareCapital:number;
    // CreditLimit:number;
    ContactPersons: Array<SupplierContactPerson>;
    GSTStatus: string;
    // GSTStatusId:number;
    CompanyId: number;
    WorkFlowStatus: string;
    WorkFlowStatusId: number;
    CreatedBy: number;
    AttachedBy: number;
    CurrentApproverUserId: number;
    CurrentApproverUserName: string;
    DraftCode: string;
    GSTStatusId: number;
    GSTNumber: string;
    ShareCapital: number;
    CurrencyId: number;
    IsAttached: boolean;
    SupplierCompanyDetails: SupplierCompanyDetails;
    SupplierApproval: SupplierApproval;
    SupplierSelectedServices: SupplierSelectedService[] = [];
    SupplierServices: Array<SupplierServices>;
    WorkFlowComments: Array<WorkflowAuditTrail>;
    Attachments: Attachments[];
    SubCodes: Array<SupplierSubCode>;
    IsSubCodeRequired: number;
    SubCodeCount: number;
    IsActive: boolean;
    ParentSupplierId: number;
    PreviousSupplierName: string;
    SupplierEntities: Company[] = [];
    SupplierAttachedCompanies: SupplierAttachedCompanies[] = [];
    AssociatedEntities: string;
    IsSupplierVerifier: boolean;
    WorkFlowDetails: SupplierWorkFlowParameter;
    OldSupplier: Supplier;
    IsFreezed: boolean;
    IsWorkFlowAssigned: boolean;
    TaxGroupId: number;
    Description: string;
    IsWFVerifier: boolean;
}

export class SupplierCompanyDetails {
    SupplierCompanyId: number;
    SupplierId: number;
    CompanyId: number;
    PaymentTermsId: number;
    // GSTStatusId:number;
    TaxId: number;
    TaxClass: string;
    // GSTNumber:string;
    RateType: string;
    // ShareCapital:number;
    CreditLimit: number;
    // AccountSet:number;      
    BankCode: string;
    GLAccount: string;
    ReviewedDate: Date;
    TaxGroupName: string;
    IsDetached: boolean;
    DetachedDate: Date;
}

export class SupplierSelectedService {
    SupplierSelectedServiceId: number;
    SupplierId: number;
    CompanyId: number;
    SupplierServiceID: number;
}

export class SupplierApproval {
    SupplierApprovalId: number;
    SupplierId: number;
    CompanyId: number;
    WorkFlowStatusId: number;
    WorkFlowStatus: string;
}


export class GridDisplayInput {
    Skip: number;
    Take: number;
    Search: string;
    CompanyId: number;
}

export class SupplierGridDisplayInput {
    Skip: number;
    Take: number;
    Search: string;
    CompanyId: number;
    RoleID: number;
    UserId: number;
}

export class SupplierGrid {
    Suppliers: Supplier[];
    TotalRecords: number;
}


export class SupplierContactPerson {
    ContactPersonId: number;
    Name: string;
    CompanyId: number;
    ContactNumber: string;
    EmailId: string;
    IsModified: boolean;
    Saluation: string;
    Surname: string;
    Department: string;
}

export class SupplierSubCode {
    SubCodeId: number;
    SupplierId: number;
    CompanyId: number;
    SubCodeDescription: string;
    SubCode: string;
    AccountSetId: string;
    IsDeleted: boolean;
}

export class SupplierAttachedCompanies {
    SupplierId: number;
    CompanyId: number;
}

export class SupplierFilterModel {
    public SupplierName?: string;
    public SupplierCity?: string;
    public SupplierCategoryID?: number;
    public WorkFlowStatusId?: number;
    public SupplierCategory: SupplierCategory;

    constructor() {
        this.SupplierCity = "";
        this.WorkFlowStatusId = 0;
        this.SupplierName = "";
        this.SupplierCategoryID = 0;
        this.SupplierCategory = new SupplierCategory();
    }
}

export class VendorDisplayResult {
    Vendor: Array<VendorsList>;
    TotalRecords: number;
}

export class VendorsList {
    VendorId: string;
    IDGRP: string;
    ShortName: string;
    BRN: string;
    AMTCRLIMT: string;
    IDAcctSet: string;
    VendName: string;
    Textstre1: string;
    Textstre2: string;
    Textstre3: string;
    Textstre4: string;
    NameCity: string;
    CodeStte: string;
    CodeCtry: string;
    NameCtac: string;
    TextPhon1: string;
    TextPhon2: string;
    CurnCode: string;
    CodeTaxGRP: string;
    TaxClass1: string;
    Email1: string;
    Email2: string;
    CtacPhone: string;
    CtacFax: string;
    CodePstl: string;
    SupplierId: number;
}

export class Countries {
    Id: number;
    Name: string;
    Code: string;
}