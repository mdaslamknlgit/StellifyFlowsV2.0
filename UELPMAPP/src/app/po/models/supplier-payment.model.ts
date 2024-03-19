import { PaymentType, Suppliers } from "../../shared/models/shared.model";
import { Supplier } from "./supplier";

export class SupplierPayment
{
  SupplierPaymentId:number;
  SupplierPaymentCode:string;
  SupplierId:number;
  PaymentTypeId:number;
  SupplierEmail:string;
  ChequeNumber:string;
  ChequeDate:Date;
  CreditCardNo:number;
  ExpiryMonth:number;
  ExpiryYear:number;
  Remarks:string;
  CreatedBy :number;
  CreatedDate :Date;
  TotalAmountPaid:number;
  PaymentType:PaymentType;
  Supplier:Array<Suppliers>;
  TotalOutstanding:number;
  SupplierInvoiceDetails:Array<SupplierInvoiceDetails>;
  SupplierInvoiceTotal:Array< SupplierInvoiceTotal>;
  CompanyId:number;
  Name:string;
}
export class SupplierInvoiceDetails
{
  InvoicePaymentId:number;
  InvoiceId:number;
  InvoiceNo:string;
  InvoiceDate:Date;
  InvoiceAmount:number;
  OutstandingAmount:number;
  PaymentAmount:number;
  LastPayment:number;
  IsChanged?:boolean;
}

export class SupplierPaymentDisplayResult
{
    SupplierPayment: Array<SupplierPaymentList> ;
    TotalRecords:number;
}

export class SupplierPaymentList
{
    SupplierPaymentId :number;
    SupplierId:number;
    SupplierPaymentCode:string
    SupplierName :string;
    InvoiceCode:string;
}

export class editrecorddetail
{
  SupplierpaymenmtId:number;
  SupplierId:number;
}

export class SupplierInvoiceTotal
{
    Total:number;
    InvoiceId:number;
}
