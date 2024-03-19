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
    public class ItemCategoryRepository: IItemCategoryRepository
    {

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);



        public ItemCategoryDisplayResult GetItemCategories(ItemCategoryDisplayInput itemCategory)
        {
            try
            {
                ItemCategoryDisplayResult categoryDisplayResult = new ItemCategoryDisplayResult();
                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple("ItemCategory_CRUD", new {

                    Action = "SELECT",
                    Skip = itemCategory.Skip,
                    Take = itemCategory.Take,
                    Search=itemCategory.Search

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of item categories..
                    categoryDisplayResult.ItemCategories = result.Read<ItemCategory>().AsList();
                    //total number of item categories.
                    categoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }

                return categoryDisplayResult;

            }
            catch(Exception e)
            {
                throw e;
            }
        }

        public ItemCategory GetItemCategorById(int IntemCategoryId)
        {
            try
            {
                ItemCategory itemCategory = new ItemCategory();
                //executing the stored procedure to get the list of item categories....
                using (var result = this.m_dbconnection.QueryMultiple("ItemCategory_CRUD", new
                {

                    Action = "SELECTBYID",
                    ItemCategoryId= IntemCategoryId

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of item categories..
                    itemCategory = result.Read<ItemCategory>().FirstOrDefault();
                  }

                return itemCategory;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateItemCategory(ItemCategory itemCategory)
        {
            try
            {


                return this.m_dbconnection.Query<int>("ItemCategory_CRUD",
                new
                {
                    Action = "INSERT",
                    Name = itemCategory.Name.Trim(),
                    Description = itemCategory.Description.Trim(),
                    CreatedBy = itemCategory.CreatedBy
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }


        /*
            this method is used to update the item category...
        */
        public int UpdateItemCategory(ItemCategory itemCategory)
        {
            this.m_dbconnection.Open();
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    int status = this.m_dbconnection.Query<int>("ItemCategory_CRUD",new
                                {
                                    Action = "UPDATE",
                                    ItemCategoryId = itemCategory.ItemCategoryID,
                                    Name = itemCategory.Name.Trim(),
                                    Description = itemCategory.Description.Trim(),
                                    ModifiedBy = itemCategory.CreatedBy,
                                }, commandType: CommandType.StoredProcedure, transaction: transactionObj).FirstOrDefault();
                    transactionObj.Commit();

                    return status;

                }
                catch (Exception ex)
                { throw ex; }
            }
        }

        /*
         this method is used to delete the item category...
        */
        public bool DeleteItemCategory(ItemCategoryDelete itemCategoryDelete)
        {

            try
            {

                return this.m_dbconnection.Query<bool>("ItemCategory_CRUD", 
                                         new {

                                                Action = "DELETE",
                                                ItemCategoryId = itemCategoryDelete.ItemCategoryID,
                                                ModifiedBy = itemCategoryDelete.ModifiedBy
                                             }, 
                                             commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }


        /*
          this method is used to check for duplicate item category name..
        */
        public int ValidateItemCategoryName(ValidateItemCategory itemCategory)
        {

            try
            {

                return this.m_dbconnection.Query<int>("ItemCategory_CRUD",
                                         new
                                         {

                                             Action = "VALIDATE",
                                             ItemCategoryId = itemCategory.ItemCategoryID,
                                             Name = itemCategory.Name
                                         },
                                           commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CheckExistingCategory(int itemCategoryId)
        {
            try
            {
                int count = 0;
                using (var result = this.m_dbconnection.QueryMultiple("ItemCategory_CRUD", new
                {
                    Action = "EXISTINGCATEGORY",
                    ItemCategoryId = itemCategoryId
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
