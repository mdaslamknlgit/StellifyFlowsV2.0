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
    public class AssetCategoryRepository : IAssetCategoryRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public int CreateAssetCategory(AssetCategories assetCategories)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetCategory_CRUD",
                    new
                    {
                        Action = "INSERT",
                        AssetTypeId = assetCategories.AssetTypeId,
                        AssetCategory = assetCategories.AssetCategory,
                        Description = assetCategories.Description,
                        CreatedBy = assetCategories.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int DeleteAssetCategory(AssetCategories assetCategories)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetCategory_CRUD",
                    new
                    {
                        Action = "DELETE",
                        CreatedBy = assetCategories.CreatedBy,
                        CreatedDate = DateTime.Now,
                        AssetCategoryId = assetCategories.AssetCategoryId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetCategoryDisplayResult GetAssetCategories(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetCategoryDisplayResult assetCategoryDisplayResult = new AssetCategoryDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("AssetCategory_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    assetCategoryDisplayResult.AssetCategories = result.Read<AssetCategories>().ToList();
                    assetCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return assetCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public AssetCategories GetAssetCategoryDetails(int assetCategoryId)
        {
            try
            {
                var result = this.m_dbconnection.Query<AssetCategories>("AssetCategory_CRUD", new
                {
                    Action = "SELECTBYID",
                    AssetCategoryId = assetCategoryId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                return result;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public AssetCategoryDisplayResult SearchAssetCategories(AssetCategorySearch gridDisplayInput)
        {
            try
            {
                AssetCategoryDisplayResult assetCategoryDisplayResult = new AssetCategoryDisplayResult();

                string assetCategoryQuery = "";
                string whereCondition = "";

                if (gridDisplayInput.AssetTypeId != null && gridDisplayInput.AssetTypeId > 0)
                {
                    whereCondition += " and  ( AC.AssetTypeId = @AssetTypeId )";
                }
                if(gridDisplayInput.AssetCategory!=null && gridDisplayInput.AssetCategory!="")
                {
                    whereCondition += " and  ( AC.AssetCategory LIKE concat('%',@AssetCategory,'%') )";
                }
                if(gridDisplayInput.Search!=null && gridDisplayInput.Search!="")
                {
                    whereCondition = " and  ( AC.AssetCategory LIKE concat('%',@Search,'%') or AC.Description LIKE concat('%',@Search,'%') or AT.AssetType LIKE concat('%',@Search,'%')  ) ";
                }
                          
                assetCategoryQuery = " select " +
                                  "  AC.AssetCategoryId, " +
                                  "  AC.AssetCategory, " +
                                  "  AC.Description, " +
                                  "  AC.AssetTypeId, " +
                                  "  AT.AssetType " +
                                  "  from " +
                                  "      dbo.AssetCategory as AC " +
                                  "  JOIN " +
                                  "      dbo.AssetType as AT " +
                                  "  ON " +
                                  "  AC.AssetTypeId = AT.AssetTypeId " +
                                  "  where " +
                                  "  AC.IsDeleted = 0 ";

                assetCategoryQuery += whereCondition;

                assetCategoryQuery += " order by " +
                                     "  AC.UpdatedDate desc ";
                if (gridDisplayInput.Take > 0)
                {
                    assetCategoryQuery += "  OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";
                }

                assetCategoryQuery += " select " +
                                   " count(*) " +
                                   " from " +
                                   " dbo.AssetCategory  as AC " +
                                   " JOIN " +
                                   "  dbo.AssetType as AT " +
                                   " ON " +
                                   " AC.AssetTypeId = AT.AssetTypeId " +
                                   " where " +
                                   " AC.IsDeleted = 0 ";
                assetCategoryQuery += whereCondition;

                using (var result = this.m_dbconnection.QueryMultiple(assetCategoryQuery, new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    Search = gridDisplayInput.Search,
                    AssetTypeId = gridDisplayInput.AssetTypeId,
                    AssetCategory = gridDisplayInput.AssetCategory
                }, commandType: CommandType.Text))
                {
                    assetCategoryDisplayResult.AssetCategories = result.Read<AssetCategories>().ToList();
                    if(gridDisplayInput.Take > 0)
                    { 
                        assetCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                }
                return assetCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateAssetCategory(AssetCategories assetCategories)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetCategory_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        AssetTypeId = assetCategories.AssetTypeId,
                        AssetCategoryId = assetCategories.AssetCategoryId,
                        AssetCategory = assetCategories.AssetCategory,
                        Description = assetCategories.Description,
                        CreatedBy = assetCategories.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ValidateAssetCategoryName(AssetCategories assetCategories)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetCategory_CRUD",
                    new
                    {
                        Action = "VALIDATE",
                        AssetCategoryId = assetCategories.AssetCategoryId,
                        AssetCategory = assetCategories.AssetCategory
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
