﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IInventoryCycleCountManager
    {
        InventoryCycleCountDisplayResult GetInventoryCycleCount(GridDisplayInput inventoryCycleCountDisplayInput);
        bool CreateInventoryCycleCountRequest(InventoryCycleCount itemcyclecountRequest);
        IEnumerable<Shared> GetExistingInventoryCycleCount(Shared shared);
        IEnumerable<GetItemMasters> GetItemsbasedLocationID(int? locationId, string searchKey);
    }
}
