using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IItemMasterRepository
    {
        string CreateItemMaster(ItemMaster user);
        string UpdateItemMaster(ItemMaster user);
        bool DeleteItemMaster(int userId);
        IEnumerable<Locations> GetLocationList(int companyId);
        IEnumerable<ItemTypes> GetItemTypeList();
        IEnumerable<Shared> GetItemcategorylist(int itemTypeId);
        ItemMasterDisplayResult GetItemMaster(ItemMasterDisplayInput itemMasterDisplayInput);

        ItemMaster GetItemMasterById(int ItemMasterId,int CompantId);
        ItemMasterDisplayResult GetAllSearchItemMasters(ItemMasterDisplayInput itemMasterDisplayInput);
        UploadResult UploadItems(string filePath, int userId);
    }
}
