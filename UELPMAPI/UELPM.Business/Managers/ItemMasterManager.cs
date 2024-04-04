using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class ItemMasterManager : ManagerBase, IItemMasterManager
    {
        private readonly IItemMasterRepository m_itemmasterRepository;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="itemRepository"></param>
        public ItemMasterManager(IItemMasterRepository itemmasterRepository)
        {
            m_itemmasterRepository = itemmasterRepository;
        }

        public string CreateItemMaster(ItemMaster itemmaster)
        {
            return m_itemmasterRepository.CreateItemMaster(itemmaster);
        }

        public bool DeleteItemMaster(int itemmasterId)
        {
            return m_itemmasterRepository.DeleteItemMaster(itemmasterId);
        }
        
        public string UpdateItemMaster(ItemMaster itemmaster)
        {
            return m_itemmasterRepository.UpdateItemMaster(itemmaster);
        }

        public IEnumerable<Locations> GetLocationList(int companyId)
        {
            return m_itemmasterRepository.GetLocationList(companyId);
        }

        public IEnumerable<ItemTypes> GetItemTypeList()
        {
            return m_itemmasterRepository.GetItemTypeList();
        }

        public IEnumerable<Shared> GetItemcategorylist(int itemTypeId)
        {
            return m_itemmasterRepository.GetItemcategorylist(itemTypeId);
        }

        public ItemMasterDisplayResult GetItemMaster(ItemMasterDisplayInput itemMasterDisplayInput)
        {
            return m_itemmasterRepository.GetItemMaster(itemMasterDisplayInput);
        }

        public ItemMasterDisplayResult GetAllSearchItemMasters(ItemMasterDisplayInput itemMasterDisplayInput)
        {
            return m_itemmasterRepository.GetAllSearchItemMasters(itemMasterDisplayInput);
        }
        public UploadResult UploadItems(string filePath, int userid)
        {
            return m_itemmasterRepository.UploadItems(filePath, userid);
        }

        ItemMaster IItemMasterManager.GetItemMasterById(int ItemMasterId, int CompanyId)
        {
            return m_itemmasterRepository.GetItemMasterById(ItemMasterId,CompanyId);
        }
    }
}
