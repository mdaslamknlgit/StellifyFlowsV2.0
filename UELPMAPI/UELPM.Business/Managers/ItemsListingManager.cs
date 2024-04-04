using System.Collections.Generic;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class ItemsListingManager : ManagerBase, IItemsListingManager
    {
        private readonly IItemsListingRepository m_itemslistingRepository;

        public ItemsListingManager(IItemsListingRepository itemslistingRepository)
        {
            m_itemslistingRepository = itemslistingRepository;
        }
       
        public IEnumerable<Shared> GetExistingItemsListing(Shared shared)
        {
            return m_itemslistingRepository.GetExistingItemsListing(shared);
        }

        public ItemsListingDisplayResult GetFilterItemListing(ItemsListingFilterDisplayInput itemsListingFilterDisplayInput)
        {
            return m_itemslistingRepository.GetFilterItemListing(itemsListingFilterDisplayInput);
        }

        public ItemsListingDisplayResult GetItemsListing(GridDisplayInput gridDisplayInput)
        {
            return m_itemslistingRepository.GetItemsListing(gridDisplayInput);
        }
        
        public IEnumerable<ItemsListing> SearchItemListing(int locationID)
        {
            return m_itemslistingRepository.SearchItemListing(locationID);
        }

        public ItemsListingDisplayResult SearchItems(GridDisplayInput gridDisplayInput)
        {
            return m_itemslistingRepository.SearchItems(gridDisplayInput);
        }
    }
}
