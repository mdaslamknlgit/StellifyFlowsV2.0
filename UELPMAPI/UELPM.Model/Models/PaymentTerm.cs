using System;
using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class PaymentTerm
    {
        public int PaymentTermsId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int? NoOfDays { get; set; }
        public bool? Isdeleted { get; set; }  
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }       
        public int CompanyId { get; set; }
    }

    public class PaymentTermDisplayResult
    {
        public List<PaymentTerm> PaymentTerms { get; set; }
        public int TotalRecords { get; set; }
    }
}
