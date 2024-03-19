using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class OpportunityProductsListsDTO
    {
        public int OpportunityProductId { get; set; }

        public int OpportunityId { get; set; }

        public int OpportunityProductType { get; set; }

        public int ProductId { get; set; }

        public string ProductCode { get; set; }

        public string ProductSerialNo { get; set; }

        public string ProductName { get; set; }

        public int ProductFamilyId { get; set; }

        public string ProductDescription { get; set; }

        public bool ProductIsActive { get; set; }

        public int CategoryID { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public int UnitsId { get; set; }

        public int PricingType { get; set; }

        public decimal PricePerUnit { get; set; }

        public decimal VolDiscount { get; set; }

        public int Qty { get; set; }

        public decimal Amount { get; set; }

        public decimal ManualDiscount { get; set; }

        public decimal Tax { get; set; }

        public decimal ExtendedAmount { get; set; }

        public DateTime RequestDate { get; set; }

        public decimal Price { get; set; }

        public decimal DiscPer { get; set; }

        public int PriceListId { get; set; }

    }

    public class OpportunityProductsDetailsList
    {
        public List<OpportunityProductsListsDTO> OpportunityProductsLists { get; set; }
        public int TotalRecords { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }
    }

}
