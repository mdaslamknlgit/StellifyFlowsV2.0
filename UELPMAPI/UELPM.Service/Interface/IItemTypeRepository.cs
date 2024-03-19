using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IItemTypeRepository
    {
        ItemTypeDisplayResult GetItemType(ItemTypeDisplayInput itemTypeDisplayInput);
        string CreateItemType(ItemType user);
        string UpdateItemType(ItemType user);
        bool DeleteItemType(int userId);
        IEnumerable<ItemTypeCategorylist> GetCategoryList();
        ItemTypeDisplayResult GetAllItemType(ItemTypeDisplayInput itemTypeDisplayInput);
        int CheckExistingItemtype(int itemTypeId);
    }
}
