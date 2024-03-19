using System.Collections.Generic;

namespace UELPM.Model.Models
{
    public class Currency
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int? Status { get; set; }
        public string Symbol { get; set; }
    }

    public class CurrencyDisplayResult
    {
        public List<Currency> CurrencyManagementList { get; set; }
        public int TotalRecords { get; set; }
    }


    public class CurrencyFilterDisplayInput : GridDisplayInput
    {

    }

}
