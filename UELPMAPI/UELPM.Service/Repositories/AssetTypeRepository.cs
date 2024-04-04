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
    public class AssetTypeRepository : IAssetTypeRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public int CreateAssetType(AssetTypes assetTypes)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetType_CRUD",
                    new
                    {
                        Action = "INSERT",
                        AssetType = assetTypes.AssetType,
                        Description = assetTypes.Description,
                        CreatedBy = assetTypes.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int DeleteAssetType(AssetTypes assetTypes)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetType_CRUD",
                    new
                    {
                        Action = "DELETE",
                        CreatedBy = assetTypes.CreatedBy,
                        CreatedDate = DateTime.Now,
                        AssetTypeId = assetTypes.AssetTypeId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetTypes GetAssetTypeDetails(int assetTypeId)
        {
            try
            {
                var result = this.m_dbconnection.Query<AssetTypes>("AssetType_CRUD", new
                {
                    Action = "SELECTBYID",
                    AssetTypeId = assetTypeId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public AssetTypeDisplayResult GetAssetTypes(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetTypeDisplayResult assetCategoryDisplayResult = new AssetTypeDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("AssetType_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    assetCategoryDisplayResult.AssetTypes = result.Read<AssetTypes>().ToList();
                    assetCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return assetCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public AssetTypeDisplayResult SearchAssetTypes(GridDisplayInput gridDisplayInput)
        {
            try
            {
                AssetTypeDisplayResult assetTypeDisplayResult = new AssetTypeDisplayResult();

                string assetTypeQuery = "";

                string whereCondition = " and  ( AssetType LIKE concat('%',@Search,'%') or Description LIKE concat('%',@Search,'%') ) ";

                assetTypeQuery = " select " +
                                 "   AssetTypeId, " +
                                 "   AssetType, " +
                                 "   Description " +
                                 " from " +
                                 "    dbo.AssetType " +
                                 " where " +
                                 " IsDeleted = 0 ";

                if(gridDisplayInput.Search!=null &&gridDisplayInput.Search!="")
                {
                    assetTypeQuery += whereCondition;

                    assetTypeQuery += " order by " +
                                     " UpdatedDate desc ";
                }

                if (gridDisplayInput.Take > 0)
                {

                    assetTypeQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                    assetTypeQuery += " select " +
                                      " count(*) " +
                                      " from " +
                                      "   dbo.AssetType " +
                                      " where " +
                                      " IsDeleted = 0 ";
                    if (gridDisplayInput.Search != null && gridDisplayInput.Search != "")
                    {
                       assetTypeQuery += whereCondition;
                    }
                }

                using (var result = this.m_dbconnection.QueryMultiple(assetTypeQuery, new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    Search = gridDisplayInput.Search
                }, commandType: CommandType.Text))
                {
                    assetTypeDisplayResult.AssetTypes = result.Read<AssetTypes>().ToList();

                    if(gridDisplayInput.Take > 0)
                    {
                       assetTypeDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                }
                return assetTypeDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateAssetType(AssetTypes assetTypes)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetType_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        AssetTypeId = assetTypes.AssetTypeId,
                        AssetType = assetTypes.AssetType,
                        Description = assetTypes.Description,
                        CreatedBy = assetTypes.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ValidateAssetType(AssetTypes assetTypes)
        {
            try
            {
                return this.m_dbconnection.Query<int>("AssetType_CRUD",
                    new
                    {
                        Action = "VALIDATE",
                        AssetTypeId = assetTypes.AssetTypeId,
                        AssetType = assetTypes.AssetType
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
