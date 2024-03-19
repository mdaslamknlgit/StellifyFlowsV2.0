using Dapper;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;

namespace UELPM.Service.Repositories
{
    public class ItemRepository : IItemRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public IEnumerable<Item> GetItems()
        {
            return this.m_dbconnection.Query<Item>("usp_GetItems", commandType: CommandType.StoredProcedure).ToList();
        }     

        public int CreateItem(Item item)
        {
            return this.m_dbconnection.Query<int>("usp_CreateItem",
                new
                {
                    ItemName = item.ItemName,
                    ItemCode = item.ItemCode,
                    ItemCategory = item.ItemCategory,
                    ItemDescription = item.ItemDescription,
                    ItemPrice = item.ItemPrice,
                    Status = item.Status
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }


        public int UpdateItem(Item item)
        {
            return this.m_dbconnection.Query<int>("usp_UpdateItem",
               new
               {
                   ItemId = item.Id,
                   ItemCode = item.ItemCode,
                   ItemCategory = item.ItemCategory,
                   ItemDescription = item.ItemDescription,
                   ItemPrice = item.ItemPrice,
                   Status = item.Status
               }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        public bool DeleteItem(int itemId)
        {        
            return this.m_dbconnection.Query<bool>("usp_DeleteItem", new { ItemId = itemId }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }
    }
}
