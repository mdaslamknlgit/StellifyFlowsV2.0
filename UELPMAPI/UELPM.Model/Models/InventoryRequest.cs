using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class InventoryRequest
    {
       public int InventoryRequestID { get; set; }
       public string Code { get; set; }
       public string Remarks { get; set; }
       public int RequestStatusId { get; set; }
       public string RequestStatus { get; set; }
       public int CreatedBy { get; set; }
       public List<InventoryRequestItems> ItemsList { get; set; }
       public List<int> ItemsToDelete { get; set; }
       public Locations Location { get; set; }
    }

    public class InventoryRequestItems
    {
      public int InventoryRequestDetailID { get; set; }
      public GetItemMasters Item { get; set; }
      public int QuantityRequired { get; set; }
    }

    public class InventoryRequestDisplayInput
    {
        public int Skip { get; set; }
        public int Take { get; set; }
        public string SortExpression { get; set; }
        public string SortDirection { get; set; }
    }

    public class InventoryRequestDetailInput : InventoryRequestDisplayInput
    {
        public int InventoryRequestId { get;set; }
    }

    public class InventoryRequestDisplayResult
    {
        public List<InventoryRequest> InventoryRequests { get; set; }
        public int TotalRecords { get; set; }
    }

    public class InventoryRequestDelete
    {
        public int InventoryRequestID { get; set; }
        public int ModifiedBy { get; set; }

    }
}
