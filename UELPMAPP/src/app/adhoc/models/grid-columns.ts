import { PTableColumn } from "../../shared/models/shared.model";

export const QuotationListColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'DocumentCode', header: 'Document Code', width: '90px' },
    { field: 'CustomerName', header: 'Customer Name', width: '160px' },
    { field: 'CustomerId', header: 'Customer Id', width: '90px' },
    { field: 'Department', header: 'Department', width: '100px' },
    { field: 'Location', header: 'Location', width: '100px' },
    { field: 'Total', header: 'Total', width: '140px' },
    { field: 'WorkFlowStatus', header: 'Status', width: '140px' },
    { field: 'Option', header: 'Option', width: '60px' }
];

export const InvoiceListColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'DocumentCode', header: 'Document Code', width: '90px' },
    { field: 'CustomerName', header: 'Customer Name', width: '140px' },
    { field: 'CustomerId', header: 'Customer Id', width: '90px' },
    { field: 'Department', header: 'Department', width: '140px' },
    { field: 'Location', header: 'Location', width: '140px' },
    { field: 'Total', header: 'Total', width: '140px' },
    { field: 'WorkFlowStatus', header: 'Status', width: '140px' },
    { field: 'Option', header: 'Option', width: '60px' }
];

export const CustomerListColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'CustomerTypeName', header: 'Customer Type', width: '90px' },
    { field: 'CustomerName', header: 'Customer Name', width: '140px' },
    { field: 'CustomerId', header: 'Customer Id', width: '90px' },
    { field: 'Department', header: 'Department', width: '140px' },
    // { field: 'TenantTypeName', header: 'Tenant Type', width: '140px' },
    { field: 'Remarks', header: 'Remarks', width: '140px' },
    // { field: 'TypeOfBusiness', header: 'Type Of Business', width: '140px' },
    { field: 'Status', header: 'Status', width: '140px' },
    { field: 'Active', header: 'Active', width: '60px' },
    { field: 'Option', header: 'Option', width: '60px' }
];

export const CustomerImportColumns: PTableColumn[] = [
    { field: 'CustomerType', header: 'Customer Type', width: '90px' },
    { field: 'CustomerName', header: 'Customer Name', width: '140px' },
    { field: 'CustomerId', header: 'Customer Id', width: '90px' },
    { field: 'Department', header: 'Department', width: '140px' },
    { field: 'TenantType', header: 'Tenant Type', width: '140px' },
    { field: 'CurrencyCode', header: 'Currency Code', width: '140px' },
    { field: 'CreditTerm', header: 'Credit Term', width: '140px' },
    { field: 'TaxGroup', header: 'TaxGroup', width: '140px' },
    { field: 'TaxClass', header: 'TaxClass', width: '140px' }
];

export const BankListColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'BankName', header: 'Bank Name', width: '140px' },
    { field: 'BankAC', header: 'Bank A/C No', width: '140px' },
    { field: 'BankCode', header: 'Bank Code', width: '140px' },
    { field: 'BranchCode', header: 'Branch Code', width: '110px' },
    { field: 'SwiftCode', header: 'Swift Code', width: '110px' },
    { field: 'Miscinformation', header: 'Misc-1 Information', width: '140px' },
    { field: 'Status', header: 'Status', width: '70px' },
    { field: 'Default', header: 'Default', width: '80px' },
    { field: 'Option', header: 'Option', width: '80px' }
];

export const CustomerContactsColumns: PTableColumn[] = [
    { field: 'SNo', header: 'S.no.', width: '40px', hide: false },
    { field: 'Name', header: 'Name', width: '180px', hide: false },
    { field: 'Nationality', header: 'Nationality', width: '140px', hide: false },
    { field: 'ContactNo', header: 'Contact No', width: '140px', hide: false },
    { field: 'Purpose', header: 'Purpose', width: '140px', hide: false },
    { field: 'Designation', header: 'Designation', width: '140px', hide: false },
    { field: 'NRICPassportNo', header: 'NRIC / Passport No', width: '160px', hide: false },
    { field: 'Email', header: 'Email', width: '160px', hide: false },
    { field: 'IsDefault', header: 'Default', width: '50px', hide: false },
    { field: 'Option', header: 'Action', width: '50px', hide: true }
];

export const CustomerAddressColumns: PTableColumn[] = [
    { field: 'SNo', header: 'S.no.', width: '40px', hide: false },
    { field: 'AddressType', header: 'Address Type', width: '120px', hide: false },
    { field: 'AddressLine1', header: 'Address Line', width: '200px', hide: false },
    { field: 'Country', header: 'Country', width: '140px', hide: false },
    { field: 'City', header: 'City', width: '140px', hide: false },
    { field: 'PostalCode', header: 'Postal Code', width: '95px', hide: false },
    { field: 'Telephone', header: 'Telephone', width: '95px', hide: false },
    { field: 'Fax', header: 'Fax', width: '95px', hide: false },
    { field: 'Email', header: 'Email', width: '160px', hide: false },
    { field: 'Attention', header: 'Attention', width: '140px', hide: false },
    { field: 'Option', header: 'Action', width: '100px', hide: true }
];

export const CustomerTypesColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'CustomerTypeName', header: 'Customer Type Name', width: '140px' },
    { field: 'Description', header: 'Description', width: '140px' },
    { field: 'Status', header: 'Status', width: '140px' },
    { field: 'Option', header: 'Option', width: '60px' }
];

export const TenantsTypesColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'TenantTypeName', header: 'Tenant Type Name', width: '140px' },
    { field: 'Description', header: 'Description', width: '140px' },
    { field: 'Status', header: 'Status', width: '140px' },
    { field: 'Option', header: 'Option', width: '60px' }
];

export const CreditTermsColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'CreditTermCode', header: 'Credit Term Code', width: '140px' },
    { field: 'Description', header: 'Description', width: '140px' },
    { field: 'Status', header: 'Status', width: '140px' },
    { field: 'ISDefault', header: 'Default', width: '80px' },
    { field: 'Option', header: 'Option', width: '60px' },
];

export const LocationColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'LocationName', header: 'Location Name', width: '140px' },
    { field: 'Description', header: 'Description', width: '140px' },
    { field: 'Status', header: 'Status', width: '140px' },
    { field: 'Option', header: 'Option', width: '60px' },
];

export const TaxGroupColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'TaxGroupName', header: 'TaxGroup Name', width: '140px' },
    { field: 'Description', header: 'Description', width: '140px' },
    { field: 'Status', header: 'Status', width: '140px' },
    { field: 'Option', header: 'Option', width: '60px' },
];

export const TaxMasterColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'TransactionType', header: 'Transaction Type', width: '140px' },
    { field: 'TaxGroup', header: 'Tax Group', width: '140px' },
    { field: 'TaxName', header: 'Tax Name', width: '140px' },
    { field: 'Status', header: 'Status', width: '140px' },
    { field: 'Option', header: 'Option', width: '60px' },
];

export const TaxTypeColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'TaxTypeName', header: 'Tax Type', width: '140px' },
    { field: 'TaxPercentage', header: 'Tax Percentage', width: '140px' },
    { field: 'TaxGroup', header: 'Tax Group', width: '140px' },
    { field: 'TaxClass', header: 'Tax Class', width: '140px' },
    { field: 'Status', header: 'Status', width: '140px' },
    { field: 'Default', header: 'Default', width: '80px' },
    { field: 'Option', header: 'Option', width: '60px' },
];

export const EmailConfigurationColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'DepartmentName', header: 'Department Name', width: '140px' },
    { field: 'DocumentType', header: 'Document Type', width: '140px' },
    { field: 'Users', header: 'Users', width: '140px' },
    { field: 'GroupEmail', header: 'Group Email', width: '30%' },
    { field: 'Option', header: 'Option', width: '60px' },
];
export const QuotationDetailsColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'ServiceType', header: 'GL - Code', width: '80px' },
    { field: 'Description', header: 'Description', width: '140px' },
    { field: 'Quantity', header: 'Qty.', width: '60px' },
    { field: 'UOM', header: 'UOM', width: '60px' },
    { field: 'UnitPrice', header: 'Unit Price', width: '60px' },
    { field: 'TotalBeforeDiscount', header: 'Total Before Discount', width: '60px' },
    { field: 'Discount', header: 'Discount', width: '60px' },
    { field: 'TotalBeforeTax', header: 'Total Before Tax', width: '60px' },
    { field: 'TaxType', header: 'Tax Type', width: '60px' },
    { field: 'TaxAmount', header: 'Tax Amount', width: '60px' },
    { field: 'TotalAfterTax', header: 'Total After Tax', width: '60px' },
    { field: 'Option', header: '', width: '30px' }
];
export const BillingColumns: PTableColumn[] = [
    { field: 'S.No.', header: 'S.No.', width: '40px' },
    { field: 'Narration', header: 'Short Narration to Appear on the Invoice', width: '100px' },
    { field: 'PercentageToBill', header: 'Percentage to Bill', width: '50px' },
    { field: 'AmountToBill', header: 'Amount to Bill (bef. Tax)', width: '65px' },
    { field: 'ExpectedBillingDate', header: 'Expected Billing Date', width: '100px' },
    { field: 'CreditTerm', header: 'Credit Term', width: '60px' },
    { field: 'Attachment', header: 'Attachment', width: '100px' },
    { field: 'InvoiceNo', header: 'Invoice No.', width: '40px' }
];

// export const PurchaseOrdersListColumns: PTableColumn[] = [
//     { field: 'S.No.', header: 'Record Name', width: '200px' },
//     { field: 'DocumentCode', header: 'Supplier', width: '200px' },
//     { field: 'CustomerName', header: 'PO Status', width: '200px' },
// ];