using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IItemsListingRepository
    {
        ItemsListingDisplayResult GetItemsListing(GridDisplayInput gridDisplayInput);
        ItemsListingDisplayResult GetFilterItemListing(ItemsListingFilterDisplayInput itemsListingFilterDisplayInput);
        IEnumerable<ItemsListing> SearchItemListing(int locationID);        
        IEnumerable<Shared> GetExistingItemsListing(Shared shared);
        ItemsListingDisplayResult SearchItems(GridDisplayInput gridDisplayInput);

    }
}
