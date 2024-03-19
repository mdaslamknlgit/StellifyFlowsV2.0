using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public  class SupplierExportAll
    {
        public List<SupplierExport> supplierexport { get; set; }
        public List<SupplierContactPersonsExport> suppliercontactPersonsExport { get; set; }
        public List<SupplierSubCodeExport> suppliersubCodeExport { get; set; }
        public List<SupplierFinanceInfoExport> supplierfinanceInfoExport { get; set; }
        public List<SupplierServicesExport> supplierservicesExport { get; set; }
        public VendorsExport VendorsExports { get; set; }


    }
    public class SupplierExport
    {
        public string SupplierName { get; set; }
        public string SupplierShortName { get; set; }
        public string SupplierCategory { get; set; }
        public string CurrencyCode { get; set; }
        public string BillingAddress1 { get; set; }
        public string BillingAddress2 { get; set; }
        public string BillingAddress3 { get; set; }
        public string BillingCity { get; set; }
        public string BillingCountry { get; set; }
        public string BillingZipcode { get; set; }
        public string BillingTelephone { get; set; }
        public string BillingFax { get; set; }
        public string SupplierType { get; set; }
        public string CoSupplierCode { get; set; }
        public string SupplierEmail { get; set; }
        public string Remarks { get; set; }
        public string GSTStatus { get; set; }
        public string GSTNumber { get; set; }
        public string ShareCapital { get; set; }
    }
    public class SupplierContactPersonsExport
    {
        public string SupplierName { get; set; }
        public string CompanyCode { get; set; }
        public string Surname { get; set; }
        public string Name { get; set; }
        public string ContactNumber { get; set; }
        public string Email { get; set; }
        public string Saluation{ get; set; }
        public string Department { get; set; }
       
    }
    public class SupplierSubCodeExport
    {
        public string SupplierName { get; set; }
        public string CompanyCode { get; set; }
        public string SupplierCode { get; set; }
        public string SubCodeDescription { get; set; }
        public string SubCode { get; set; }
        public string AccountSet { get; set; }
        public string Department { get; set; }
    }
    public class SupplierServicesExport
    {
        public string SupplierName { get; set; }
        public string CompanyCode { get; set; }
        public string ServiceName { get; set; }
        public string ServiceCategory { get; set; }

    }
    public class SupplierFinanceInfoExport
    {
        public string SupplierName { get; set; }
        public string CompanyCode { get; set; }
        public string TaxGroup { get; set; }
        public string TaxClass { get; set; }
        public string GSTNumber { get; set; }
        public string RateType { get; set; }
        public string ShareCapital { get; set; }
        public string CreditLimit { get; set; }
        public string BankCode { get; set; }
        public string GLAccount { get; set; }
        public string ReviewedDate { get; set; }
        public string PaymentTermsCode { get; set; }
        public string PaymentTermsNoOfDays { get; set; }
        public string GstType { get; set; }
        public string TaxinPercentage { get; set; }
        public string Justification { get; set; }
        public string CurrencyCode { get; set; }
    }

    public class VendorsExport
    {
        public string VendorId { get; set; }
        public string IDGRP { get; set; }
        public string IDAcctSet { get; set; }
        public string VendName { get; set; }
        public string Textstre1 { get; set; }
        public string Textstre2 { get; set; }
        public string Textstre3 { get; set; }
        public string Textstre4 { get; set; }
        public string NameCity { get; set; }
        public string CodeStte { get; set; }
        public string CodeCtry { get; set; }
        public string NameCtac { get; set; }
        public string TextPhon1 { get; set; }
        public string TextPhon2 { get; set; }
        public string CurnCode { get; set; }
        public string CodeTaxGRP { get; set; }
        public string TaxClass1 { get; set; }
        public string Email1 { get; set; }
        public string Email2 { get; set; }
        public string CtacFax { get; set; }
        public string CtacPhone { get; set; }
        public string CodePstl { get; set; }
    }


   
}
