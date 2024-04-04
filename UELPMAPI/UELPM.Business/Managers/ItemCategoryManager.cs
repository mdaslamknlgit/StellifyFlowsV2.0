using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Service;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Business.Interface;

namespace UELPM.Business.Managers
{
    public class ItemCategoryManager: ManagerBase, IItemCategoryManager
    {
        private readonly IItemCategoryRepository m_itemRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="ItemCategoryManager"></param>
        public ItemCategoryManager(IItemCategoryRepository itemRepository)
        {
            m_itemRepository = itemRepository;
        }

        public ItemCategoryDisplayResult GetItemCategories(ItemCategoryDisplayInput itemCategory)
        {

            try
            {
                return m_itemRepository.GetItemCategories(itemCategory);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ItemCategory GetItemCategorById(int IntemCategoryId)
        {
            try
            {
                return m_itemRepository.GetItemCategorById(IntemCategoryId);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int CreateItemCategory(ItemCategory item)
        {
            try
            {


                return m_itemRepository.CreateItemCategory(item);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateItemCategory(ItemCategory item)
        {

            try
            {
                return m_itemRepository.UpdateItemCategory(item);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool DeleteItemCategory(ItemCategoryDelete categoryDelete)
        {
            try
            {
                return m_itemRepository.DeleteItemCategory(categoryDelete);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ValidateItemCategory(ValidateItemCategory validateItemCategory)
        {
            try
            {
                return m_itemRepository.ValidateItemCategoryName(validateItemCategory);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CheckExistingCategory(int itemCategoryId)
        {
            return m_itemRepository.CheckExistingCategory(itemCategoryId);
        }
    }
}
