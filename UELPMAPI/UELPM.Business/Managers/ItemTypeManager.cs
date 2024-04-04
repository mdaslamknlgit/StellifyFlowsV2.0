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
    public class ItemTypeManager : ManagerBase, IItemTypeManager
    {
        private readonly IItemTypeRepository m_itemtypeRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userRepository"></param>
        public ItemTypeManager(IItemTypeRepository itemtypeRepository)
        {
            m_itemtypeRepository = itemtypeRepository;
        }

        public int CheckExistingItemtype(int itemTypeId)
        {
            return m_itemtypeRepository.CheckExistingItemtype(itemTypeId);
        }

        public string CreateItemType(ItemType itemtype)
        {
            return m_itemtypeRepository.CreateItemType(itemtype);
        }

        public bool DeleteItemType(int userId)
        {
            return m_itemtypeRepository.DeleteItemType(userId);
        }

        public ItemTypeDisplayResult GetAllItemType(ItemTypeDisplayInput itemTypeDisplayInput)
        {
            return m_itemtypeRepository.GetAllItemType(itemTypeDisplayInput);
        }

        public IEnumerable<ItemTypeCategorylist> GetCategoryList()
        {
            return m_itemtypeRepository.GetCategoryList();
        }

        public ItemTypeDisplayResult GetItemType(ItemTypeDisplayInput itemTypeDisplayInput)
        {
            return m_itemtypeRepository.GetItemType(itemTypeDisplayInput);
        }

        public string UpdateItemType(ItemType itemtype)
        {
            return m_itemtypeRepository.UpdateItemType(itemtype);
        }
    }
}
