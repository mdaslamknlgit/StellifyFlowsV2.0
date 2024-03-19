using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IItemMasterManager
    {
        ItemMasterDisplayResult GetItemMaster(ItemMasterDisplayInput itemMasterDisplayInput);

        ItemMaster GetItemMasterById(int ItemMasterId, int CompanyId);
        ItemMasterDisplayResult GetAllSearchItemMasters(ItemMasterDisplayInput itemMasterDisplayInput);
        string CreateItemMaster(ItemMaster user);
        string UpdateItemMaster(ItemMaster user);
        bool DeleteItemMaster(int userId);
        IEnumerable<Locations> GetLocationList(int companyId);
        IEnumerable<ItemTypes> GetItemTypeList();
        IEnumerable<Shared> GetItemcategorylist(int itemTypeId);
        UploadResult UploadItems(string filePath, int userid);
    }
}
