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
    public class SupplierCategoryRepository: ISupplierCategoryRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        /*
            this method is used to get the list of supplier categories
        */
        public SupplierCategoryDisplayResult GetSupplierCategories(GridDisplayInput displayInput)
        {
            try
            {
                SupplierCategoryDisplayResult supplierCategoryDisplayResult = new SupplierCategoryDisplayResult();
                //executing the stored procedure to get the list of supplier categories....
                using (var result = this.m_dbconnection.QueryMultiple("SupplierCategory_CRUD", new
                {

                    Action = "SELECT",
                    Search=displayInput.Search,
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of supplier categories..
                    supplierCategoryDisplayResult.SupplierCategory = result.Read<SupplierCategory>().AsList();
                    //total number of supplier category records.
                    supplierCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return supplierCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public SupplierCategoryDisplayResult GetAllSupplierCategories(GridDisplayInput displayInput)
        {
            try
            {
                SupplierCategoryDisplayResult supplierCategoryDisplayResult = new SupplierCategoryDisplayResult();
                //executing the stored procedure to get the list of supplier categories....
                using (var result = this.m_dbconnection.QueryMultiple("SupplierCategory_CRUD", new
                {

                    Action = "SELECT",
                    Search= displayInput.Search,
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of supplier categories..
                    supplierCategoryDisplayResult.SupplierCategory = result.Read<SupplierCategory>().AsList();
                    //total number of supplier category records.
                    supplierCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return supplierCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public SupplierCategory GetSupplierCategoryDetails(int supplierCategoryId)
        {
            try
            {
                var result = this.m_dbconnection.QueryFirstOrDefault<SupplierCategory>("SupplierCategory_CRUD", new
                {
                    Action = "SELECTBYID",
                    SupplierCategoryID = supplierCategoryId
                }, commandType: CommandType.StoredProcedure);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int CreateSupplierCategory(SupplierCategory supplierCategory)
        {
            try
            {
                return this.m_dbconnection.Query<int>("SupplierCategory_CRUD",
                new
                {
                    Action = "INSERT",
                    CategoryText = supplierCategory.CategoryText!=null? supplierCategory.CategoryText.Trim():string.Empty,
                    Description = supplierCategory.Description != null? supplierCategory.Description.Trim(): string.Empty,
                    CreatedBy = supplierCategory.CreatedBy,
                    CreatedDate = DateTime.Now,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int UpdateSupplierCategory(SupplierCategory supplierCategory)
        {
            try
            {
                return this.m_dbconnection.Query<int>("SupplierCategory_CRUD",
                                                   new
                                                   {
                                                       Action = "UPDATE",
                                                       CategoryText = supplierCategory.CategoryText != null? supplierCategory.CategoryText.Trim() : string.Empty,
                                                       Description = supplierCategory.Description != null? supplierCategory.Description.Trim() : string.Empty,
                                                       CreatedBy = supplierCategory.CreatedBy,
                                                       CreatedDate = DateTime.Now,
                                                       SupplierCategoryID = supplierCategory.SupplierCategoryID
                                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool DeleteSupplierCategory(SupplierCategory supplierCategory)
        {
            try
            {
                var result= this.m_dbconnection.Query<int>("SupplierCategory_CRUD",
                                        new
                                        {
                                            Action = "DELETE",
                                            SupplierCategoryID = supplierCategory.SupplierCategoryID,
                                            CreatedBy = supplierCategory.CreatedBy,
                                            CreatedDate = DateTime.Now
                                        },
                                        commandType: CommandType.StoredProcedure).FirstOrDefault();
                if (result == 1)
                {
                    return false;
                }
                else
                    return true;

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int ValidateSupplierCategory(SupplierCategory supplierCategory)
        {
            try
            {
                return this.m_dbconnection.Query<int>("SupplierCategory_CRUD",
                                         new
                                         {
                                             Action = "VALIDATE",
                                             SupplierCategoryID = supplierCategory.SupplierCategoryID,
                                             CategoryText = supplierCategory.CategoryText != null ? supplierCategory.CategoryText : string.Empty
                                         },
                                         commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
