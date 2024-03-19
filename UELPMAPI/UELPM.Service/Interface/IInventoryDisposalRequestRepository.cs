using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public  interface IInventoryDisposalRequestRepository
    {
        InventoryDisposalRequestDisplayResult GetInventoryDisposalRequest(InventoryDisposalRequestInput inventoryDisposalRequest);

        bool CreateInventoryDisposalRequest(InventoryDisposalRequest inventoryRequest);

    }
}
