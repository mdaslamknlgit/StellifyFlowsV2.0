using System.Collections.Generic;
using UELPM.Model.Models;

namespace UELPM.Business
{
    public interface IItemManager
    {
        IEnumerable<Item> GetItems();

        int CreateItem(Item item);

        int UpdateItem(Item item);

        bool DeleteItem(int itemId);
    }
}
