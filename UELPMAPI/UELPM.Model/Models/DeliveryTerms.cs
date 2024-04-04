using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class DeliveryTerms
    {
        public int DeliveryTermsId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int? NoOfDays { get; set; }
        public bool? Isdeleted { get; set; }
        public int CreatedBy { get; set; }
        public int CompanyId { get; set; }
    }

    public class DeliveryTermsDisplayResult
    {
        public List<DeliveryTerms> DeliveryTerms { get; set; }
        public int TotalRecords { get; set; }
    }
}
