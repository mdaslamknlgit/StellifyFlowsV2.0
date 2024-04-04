using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
     public interface IItemCategoryManager
    {

        ItemCategoryDisplayResult GetItemCategories(ItemCategoryDisplayInput itemCategory);

        ItemCategory GetItemCategorById(int IntemCategoryId);
        int CreateItemCategory(ItemCategory item);

        int UpdateItemCategory(ItemCategory item);

        bool DeleteItemCategory(ItemCategoryDelete categoryDelete);

        int ValidateItemCategory(ValidateItemCategory validateItemCategory);
        int CheckExistingCategory(int itemCategoryId);
    }
}
