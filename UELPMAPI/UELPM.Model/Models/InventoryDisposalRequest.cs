using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class InventoryDisposalRequestModel
    {

       public int InventoryDisposalId { get; set; }
       public int ItemMasterId { get; set; }
       public string ItemMasterName { get; set; }
       public int ExistingQuantity { get; set; }
       public int InventoryDisposalQty { get; set; }
       public string ReasonForDisposal { get; set; }
       public int WorkFlowStatusId { get; set; }
       public string WorkFlowStatus { get; set; }
    }

    public class InventoryDisposalRequest
    {
        public int LocationId { get; set; }

        public int CreatedBy { get; set; }

        public List<InventoryDisposalRequestModel> InventoryReqToAdd { get; set; }

        public List<int> InventoryReqToDelete { get; set; }

        public List<InventoryDisposalRequestModel> InventoryReqToUpdate { get; set; }
    }

    public class InventoryDisposalRequestInput: GridDisplayInput
    {
        public int LocationId { get; set; }
    }

    public class InventoryDisposalRequestDisplayResult
    {
        public List<InventoryDisposalRequestModel> InventoryDisposalRequests { get; set; }
        public int TotalRecords { get; set; }
    }
}
