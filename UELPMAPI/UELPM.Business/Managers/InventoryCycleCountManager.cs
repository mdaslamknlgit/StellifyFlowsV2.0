using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class InventoryCycleCountManager : IInventoryCycleCountManager
    {
        private readonly IInventoryCycleCountRepository m_inventoryCycleCountRepository;

        public InventoryCycleCountManager(IInventoryCycleCountRepository inventoryCycleCountRepository)
        {
            m_inventoryCycleCountRepository = inventoryCycleCountRepository;
        }

        public bool CreateInventoryCycleCountRequest(InventoryCycleCount itemcyclecountRequest)
        {
            return m_inventoryCycleCountRepository.CreateInventoryCycleCountRequest(itemcyclecountRequest);
        }

        public IEnumerable<Shared> GetExistingInventoryCycleCount(Shared shared)
        {
            return m_inventoryCycleCountRepository.GetExistingInventoryCycleCount(shared);
        }

        public InventoryCycleCountDisplayResult GetInventoryCycleCount(GridDisplayInput inventoryCycleCountDisplayInput)
        {
            return m_inventoryCycleCountRepository.GetInventoryCycleCount(inventoryCycleCountDisplayInput);
        }

        public IEnumerable<GetItemMasters> GetItemsbasedLocationID(int? locationId, string searchKey)
        {
            return m_inventoryCycleCountRepository.GetItemsbasedLocationID(locationId, searchKey);
        }
    }
}
