using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IItemCategoryRepository
    {
        ItemCategoryDisplayResult GetItemCategories(ItemCategoryDisplayInput itemCategory);

        ItemCategory GetItemCategorById(int IntemCategoryId);
        int CreateItemCategory(ItemCategory itemCategory);

        int UpdateItemCategory(ItemCategory itemCategory);

        bool DeleteItemCategory(ItemCategoryDelete itemCategoryDelete);

        int ValidateItemCategoryName(ValidateItemCategory itemCategory);
        int CheckExistingCategory(int itemCategoryId);
    }
}
