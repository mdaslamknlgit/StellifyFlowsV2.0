using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class OpportunityProductsDTO
    {
        public int OpportunityProductId { get; set; }

        public int? OpportunityId { get; set; }

        public int? OpportunityProductType { get; set; }

        public string WritePName { get; set; }

        public string WritePAlias { get; set; }

        public string WritePDesc { get; set; }

        public int? ProductId { get; set; }

        public int? UnitsId { get; set; }

        public int? PricingType { get; set; }

        public decimal? PricePerUnit { get; set; }

        public decimal? VolDiscount { get; set; }

        public int? Qty { get; set; }

        public decimal? Amount { get; set; }

        public decimal? ManualDiscount { get; set; }

        public decimal? Tax { get; set; }

        public decimal? ExtendedAmount { get; set; }

        public DateTime? RequestDate { get; set; }

        public decimal? Price { get; set; }

        public decimal? DiscPer { get; set; }

        public int? PriceListId { get; set; }

        public bool? HasInspection { get; set; }

        public bool? HasCostSheet { get; set; }

        public decimal? CostSheetValue { get; set; }

        public int? CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public int? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public int? DeletedBy { get; set; }

        public DateTime? DeletedDate { get; set; }

    }
    public class OpportunityProductExist
    {
        public int OpportunityId { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }

        public int ProductId { get; set; }
    }
    public class OpportunityProductResults
    {
        public int OpportunityId { get; set; }

        public IEnumerable<OpportunityProductExist> OpportunityProductExists { get; set; }

        public string Status { get; set; }

        public string Message { get; set; }

        public string StatusCode { get; set; }

        public string Error { get; set; }

        public bool IsProductExists { get; set; }

        public int TotalProductsExists { get; set; }
    }


    public class OpportunityProductsInput
    {
        public int OpportunityId { get; set; }
        public int CreatedBy { get; set; }

        public List<OpportunityProductsDTO> opportunityProductsDTOs { get; set; }
    }

}
