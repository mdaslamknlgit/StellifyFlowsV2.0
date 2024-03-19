export class Customer
{
  CustomerId:number; 
  CustomerName:string;
  CustomerShortName:string;
  CustomerCategoryId:number;
  CustomerCategoryName:string;
  CurrencyCode:string;
  CustomerEmail:string;
  CustomerCode: string;
  CompanyId: number;
  PaymentTermsId: number;
  TaxId:number;
  Status: number;
  Remarks: string;
  IsDeleted:boolean;
  BillingAddress: string;
  BillingCity:string;
  BillingCountryId:number; 
  BillingZipcode:string;
  BillingTelephone:string; 
  BillingFax:string;
  BillingCountry:string;
  ShippingAddress: string;
  ShippingCity:string;
  ShippingCountryId:number; 
  ShippingZipcode:string;
  ShippingTelephone:string; 
  ShippingFax:string;
  ShippingCountry:string;
}

export class CustomerGrid {
  Customers: Customer[];
  TotalRecords: number;
}