export class Payment {
    PaymentID: number;
    ProcessId: number;
    CompanyId: number;
    SupplierInvoiceRefNo: string;
    InvoiceDate: string;
    ChequeNo: string;
    ChequeDate: string;
    VendorId: string;
    SupplierName: string;
    PaymentAmount: number;
    DocumentNo: string;
    Status: boolean;
    StatusText: string;
    Remarks: string;
    IsOverPayment: boolean;
    SupplierId: number;
    DocumentId: number;
}
export class InvoicePayments {
    Currency: string;
    InvoiceTotal: number;
    PaidTotal: number;
    OutStandingTotal: number;
    Payments: Payment[];
}