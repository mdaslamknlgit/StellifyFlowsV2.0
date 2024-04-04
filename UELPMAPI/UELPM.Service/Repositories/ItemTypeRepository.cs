using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class ItemTypeRepository : IItemTypeRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public string CreateItemType(ItemType itemtype)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("ItemType_CRUD",
                new
                {
                    Action = "INSERT",
                    ItemCategoryID = itemtype.ItemCategoryID,
                    Name = itemtype.Name,
                    Description = itemtype.Description,
                    IsDeleted = itemtype.IsDeleted,
                    CreatedBy = itemtype.CreatedBy,
                    ModifiedBy = itemtype.ModifiedBy,
                    CreatedDate = DateTime.Now,
                    ModifiedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure))
                {
                    int validateNameStatus = result.ReadFirstOrDefault<int>();
                    if (validateNameStatus == 0)
                    {
                        status = "Duplicate";
                    }
                }
                return status;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public bool DeleteItemType(int itemtypeId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("ItemType_CRUD", new { Action = "DELETE", itemtypeId = itemtypeId }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ItemTypeDisplayResult GetItemType(ItemTypeDisplayInput itemTypeDisplayInput)
        {
            try
            {
                ItemTypeDisplayResult itemtypeDisplayResult = new ItemTypeDisplayResult();
                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple("ItemType_CRUD", new
                {
                    Action = "SELECT",
                    Search="",
                    Skip = itemTypeDisplayInput.Skip,
                    Take = itemTypeDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of item categories..
                    itemtypeDisplayResult.ItemType = result.Read<ItemType>().AsList();
                    //total number of item categories.
                    itemtypeDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return itemtypeDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ItemTypeDisplayResult GetAllItemType(ItemTypeDisplayInput itemTypeDisplayInput)
        {
            try
            {
                ItemTypeDisplayResult itemtypeDisplayResult = new ItemTypeDisplayResult();
                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple("ItemType_CRUD", new
                {
                    Action = "SELECT",
                    Search = itemTypeDisplayInput.Search,
                    Skip = itemTypeDisplayInput.Skip,
                    Take = itemTypeDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of item categories..
                    itemtypeDisplayResult.ItemType = result.Read<ItemType>().AsList();
                    //total number of item categories.
                    itemtypeDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return itemtypeDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public string UpdateItemType(ItemType itemtype)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("ItemType_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        ItemTypeID = itemtype.ItemTypeID,
                        ItemCategoryID = itemtype.ItemCategoryID,
                        Name = itemtype.Name,
                        Description = itemtype.Description,
                        IsDeleted = itemtype.IsDeleted,
                        CreatedBy = itemtype.CreatedBy,
                        ModifiedBy = itemtype.ModifiedBy,
                        ModifiedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure))
                {
                    int validateNameStatus = result.ReadFirstOrDefault<int>();
                    if (validateNameStatus == 0)
                    {
                        status = "Duplicate";
                    }
                }
                return status;

            }
            catch (Exception ex)
            { throw ex; }
        }


        public IEnumerable<ItemTypeCategorylist> GetCategoryList()
        {
            try
            {
                return this.m_dbconnection.Query<ItemTypeCategorylist>("usp_GetItemCategoryforItemType", commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception ex)
            { throw ex; }
        }

        public int CheckExistingItemtype(int itemTypeId)
        {
            try
            {
                int count = 0;
                using (var result = this.m_dbconnection.QueryMultiple("ItemType_CRUD", new
                {
                    Action = "EXISTINGITEMTYPE",
                    ItemTypeID = itemTypeId
                }, commandType: CommandType.StoredProcedure))
                {
                    count = result.ReadFirstOrDefault<int>();
                }

                return count;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

    }
}
