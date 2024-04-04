using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace UELPM.Model.Models
{
    public class CustomerType : AdhocMaster
    {
        public int CustomerTypeId { get; set; }
        private string customerTypeName;
        public string CustomerTypeName
        {
            get { return this.customerTypeName; }
            set { this.customerTypeName = value?.Trim(); }
        }
        public string Description { get; set; }
    }

    public class BankMaster : AdhocMaster
    {
        public int BankMasterId { get; set; }
        public string BankName { get; set; }
        public string BankACNo { get; set; }
        public string SwiftCode { get; set; }
        public string BankCode { get; set; }
        public string BranchCode { get; set; }
        public string BankInfo
        {
            get { return string.Concat(this.BankName,' ', this.BankCode,' ' ,this.BankACNo); }
        }
        public string Misc1Information { get; set; }
        public string Misc2Information { get; set; }
        public string ImageSource { get; set; }
        [NonSerialized]
        public HttpFileCollection QRImage;
        public bool IsDefault { get; set; }
        public object CompanyId { get; set; }
    }
    public class EmailConfigProcess
    {
        public int ProcessId { get; set; }
        public string ProcessName { get; set; }
    }
    public class UserEmail
    {
        //public int EmailConfigUserId { get; set; }
        //public int EmailConfigId { get; set; }
        public int UserId { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
    }

    public class EmailConfiguration : AdhocMaster
    {
        public int EmailConfigId { get; set; }
        public int CompanyId { get; set; }
        public Locations Department { get; set; }
        public EmailConfigProcess ProcessType { get; set; }
        public List<UserEmail> Users { get; set; }
        public string GroupEmail { get; set; }
        public EmailConfiguration()
        {
            Users = new List<UserEmail>();
        }
    }

    public class TenantType : AdhocMaster
    {
        public int TenantTypeId { get; set; }
        private string tenantTypeName;
        public string TenantTypeName
        {
            get { return this.tenantTypeName; }
            set { this.tenantTypeName = value?.Trim(); }
        }
        public string Description { get; set; }
    }

    public class CreditTerm : AdhocMaster
    {
        public int CreditTermId { get; set; }
        public int CompanyId { get; set; }
        private string creditTermCode;
        public string CreditTermCode
        {
            get { return this.creditTermCode; }
            set { this.creditTermCode = value?.Trim(); }
        }
        public int NoOfDays { get; set; }
        public string Description { get; set; }
        public bool IsDefault { get; set; }
    }

    public class Location : AdhocMaster
    {
        public int LocationId { get; set; }
        public int CompanyId { get; set; }
        private string locationName;
        public string LocationName
        {
            get { return this.locationName; }
            set { this.locationName = value?.Trim(); }
        }
        public string Description { get; set; }
    }

    public class SalesTaxGroup : AdhocMaster
    {
        public int CompanyId { get; set; }
        public int TaxGroupId { get; set; }
        private string taxGroupName;
        public string TaxGroupName
        {
            get { return this.taxGroupName; }
            set { this.taxGroupName = value?.Trim(); }
        }
        public string Description { get; set; }
    }

    public class TaxMaster : AdhocMaster
    {
        public int TaxMasterId { get; set; }
        public TransactionType TransactionType { get; set; }
        public SalesTaxGroup TaxGroup { get; set; }
        private string taxName;
        public string TaxName
        {
            get { return this.taxName; }
            set { this.taxName = value?.Trim(); }
        }
        public TaxMaster()
        {
            TransactionType = new TransactionType();
            TaxGroup = new SalesTaxGroup();
        }
    }
    public class TaxType : AdhocMaster
    {
        public int TaxTypeId { get; set; }
        private string taxTypeName;
        public string TaxTypeName
        {
            get { return this.taxTypeName; }
            set { this.taxTypeName = value?.Trim(); }
        }
        public decimal TaxPercentage { get; set; }
        public SalesTaxGroup TaxGroup { get; set; }
        public int TaxClass { get; set; }
        public bool IsDefault { get; set; }

    }
    public class Nationality
    {
        public int NationalityId { get; set; }
        public string NationalityName { get; set; }
    }
    public class AdhocMaster
    {
        public int CreatedBy { get; set; }
        public int UpdatedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
