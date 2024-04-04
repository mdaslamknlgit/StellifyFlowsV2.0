using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IItemsListingManager
    {
        ItemsListingDisplayResult GetItemsListing(GridDisplayInput gridDisplayInput);
        ItemsListingDisplayResult GetFilterItemListing(ItemsListingFilterDisplayInput itemsListingFilterDisplayInput);
        IEnumerable<ItemsListing> SearchItemListing(int locationID);       
        IEnumerable<Shared> GetExistingItemsListing(Shared shared);
        ItemsListingDisplayResult SearchItems(GridDisplayInput gridDisplayInput);
    }
}
