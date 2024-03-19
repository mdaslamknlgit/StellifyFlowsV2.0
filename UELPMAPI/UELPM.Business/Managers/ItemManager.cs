using System.Collections.Generic;
using UELPM.Model.Models;
using UELPM.Service;

namespace UELPM.Business.Managers
{
    public class ItemManager :  ManagerBase, IItemManager
    {
        private readonly IItemRepository m_itemRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="itemRepository"></param>
        public ItemManager(IItemRepository itemRepository)
        {
            m_itemRepository = itemRepository;
        }

        public IEnumerable<Item> GetItems()
        {
            return m_itemRepository.GetItems();
        }       

        public int CreateItem(Item item)
        {
            return m_itemRepository.CreateItem(item);
        }

        public int UpdateItem(Item item)
        {
            return m_itemRepository.UpdateItem(item);
        }

        public bool DeleteItem(int itemId)
        {
            return m_itemRepository.DeleteItem(itemId);
        }
    }
}
