﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IInventoryDisposalRequestManager
    {
        InventoryDisposalRequestDisplayResult GetInventoryDisposalRequest(InventoryDisposalRequestInput inventoryDisposalRequest);

        bool CreateInventoryDisposalRequest(InventoryDisposalRequest inventoryDisposalRequest);

    }
}
