using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IItemTypeManager
    {
        ItemTypeDisplayResult GetItemType(ItemTypeDisplayInput itemTypeDisplayInput);
        string CreateItemType(ItemType itemtype);
        string UpdateItemType(ItemType itemtype);
        bool DeleteItemType(int userId);
        IEnumerable<ItemTypeCategorylist> GetCategoryList();
        ItemTypeDisplayResult GetAllItemType(ItemTypeDisplayInput itemTypeDisplayInput);
        int CheckExistingItemtype(int itemTypeId);
    }
}
