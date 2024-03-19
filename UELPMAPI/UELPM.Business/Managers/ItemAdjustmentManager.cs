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
    public class ItemAdjustmentManager : ManagerBase, IItemAdjustmentManager
    {
        private readonly IItemAdjustmentRepository m_itemAdjustmentRepository;
       
        public ItemAdjustmentManager(IItemAdjustmentRepository itemAdjustmentRepository)
        {
            m_itemAdjustmentRepository = itemAdjustmentRepository;
        }

        public int CreateItemAdjustment(ItemAdjustment itemAdjustment)
        {
            return m_itemAdjustmentRepository.CreateItemAdjustment(itemAdjustment);
        }

        public bool DeleteItemAdjustment(int itemAdjustmentId)
        {
            return m_itemAdjustmentRepository.DeleteItemAdjustment(itemAdjustmentId);
        }

        public ItemAdjustmentDisplayResult GetItemAdjustment(ItemAdjustmentDisplayInput itemAdjustmentDisplayInput)
        {
            return m_itemAdjustmentRepository.GetItemAdjustment(itemAdjustmentDisplayInput);
        }

        public int UpdateItemAdjustment(ItemAdjustment itemAdjustment)
        {
            return m_itemAdjustmentRepository.UpdateItemAdjustment(itemAdjustment);
        }
    }
}
