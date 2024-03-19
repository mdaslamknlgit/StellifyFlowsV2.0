export class SupplierExportAll {
    SupplierExport: Array<SupplierExport>;
    SupplierContactPersonsExport: Array<SupplierContactPersonsExport>;
    suppliersubCodeExport: Array<SupplierSubCodeExport>;
    supplierfinanceInfoExport: Array<SupplierFinanceInfoExport>;
    supplierservicesExport: Array<SupplierServicesExport>;
    suppliersVendorsExport: Array<SupplierVendorsExport>;
}

export class SupplierExport {
    SupplierName: string;
    SupplierShortName: string;
    SupplierCategory: string;
    CurrencyCode: string;
    BillingAddress1: string;
    BillingAddress2: string;
    BillingAddress3: string;
    BillingCity: string;
    BillingCountry: string;
    BillingZipcode: string;
    BillingTelephone: string;
    BillingFax: string;
    SupplierType: string;
    SupplierCode: string;
    SupplierEmail: string;
    Remarks: string;
    GSTStatus: string;
    GSTNumber: string;
    ShareCapital: string;
    CoSupplierCode: string;
}
export class SupplierContactPersonsExport {
    SupplierName: string
    CompanyCode: string;
    Surname: string;
    Name: string;
    ContactNumber: string;
    Email: string;
    Saluation: string;
    Department: string;

}
export class SupplierSubCodeExport {
    SupplierName: string;
    CompanyCode: string;
    SupplierCode: string;
    SubCodeDescription: string;
    SubCode: string;
    AccountSet: string;

}
export class SupplierFinanceInfoExport {
    SupplierName: string;
    CompanyCode: string;
    TaxGroup: string;
    TaxClass: string;
    GstType: string;
    TaxinPercentage: string;
    GSTNumber: string;
    RateType: string;
    ShareCapital: string;
    CreditLimit: string;
    BankCode: string;
    GLAccount: string;
    ReviewedDate: string;
    PaymentTermsCode: string;
    CurrencyCode: string;
}
export class SupplierServicesExport {
    SupplierName: string;
    CompanyCode: string;
    serviceName: string;

}

export class SupplierVendorsExport {
    VendorId: string;
    IDGRP: string;
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
}


