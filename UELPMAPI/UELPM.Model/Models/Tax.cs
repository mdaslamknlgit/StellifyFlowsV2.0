using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class Tax
    {
        public int TaxId { get; set; }
        public string TaxName { get; set; }
        public int TaxType { get; set; }
        public int TaxGroupId { get; set; }
        public decimal TaxAmount { get; set; }
        public string TaxAuthority { get; set; }
        public string TaxClass { get; set; }
        public int CreatedBy { get; set; }
        public string Description { get; set; }

    }
    public class TaxisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string Search { get; set; }

        public int TaxId { get; set; }
    }

    public class TaxFilterDisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string TaxnameFilter { get; set; }
        public string AuthorityFilter { get; set; }
        public string TaxAmountFilter { get; set; }
    }

    public class TaxDisplayResult
    {
        public List<Tax> Taxes { get; set; }
        public int TotalRecords { get; set; }
    }


    public class TaxDelete
    {
        public int TaxId { get; set; }
        public int ModifiedBy { get; set; }

    }

    public class TaxGroup
    {
        public int TaxGroupId { get; set; }
        public string TaxGroupName { get; set; }
    }

}


