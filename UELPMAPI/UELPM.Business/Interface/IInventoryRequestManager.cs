using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IInventoryRequestManager
    {
        InventoryRequestDisplayResult GetInventoryRequest(InventoryRequestDisplayInput inventoryRequest);

        List<InventoryRequestItems> GetInventoryRequestDetails(InventoryRequestDetailInput inventoryRequest);

        int CreateInventoryRequest(InventoryRequest inventoryRequest);

        int UpdateInventoryRequest(InventoryRequest inventoryRequest);

        bool DeleteInventoryRequest(InventoryRequestDelete categoryDelete);
    }
}
