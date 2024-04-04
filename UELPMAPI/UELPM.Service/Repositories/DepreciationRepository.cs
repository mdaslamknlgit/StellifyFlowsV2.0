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
    public class DepreciationRepository : IDepreciationRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public int CreateDepreciation(Depreciation depreciation)
        {
            try
            {
                return this.m_dbconnection.Query<int>("Depreciation_CRUD",
                    new
                    {
                        Action = "INSERT",
                        Name = depreciation.Name,
                        Description = depreciation.Description,
                        CreatedBy = depreciation.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int DeleteDepreciation(Depreciation depreciation)
        {
            try
            {
                return this.m_dbconnection.Query<int>("Depreciation_CRUD",
                    new
                    {
                        Action = "DELETE",
                        CreatedBy = depreciation.CreatedBy,
                        CreatedDate = DateTime.Now,
                        DepreciationId = depreciation.DepreciationId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public Depreciation GetDepreciationDetails(int depreciationId)
        {
            try
            {
                var result = this.m_dbconnection.Query<Depreciation>("Depreciation_CRUD", new
                {
                    Action = "SELECTBYID",
                    DepreciationId = depreciationId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public DepreciationDisplayResult GetDepreciations(GridDisplayInput gridDisplayInput)
        {
            try
            {
                DepreciationDisplayResult assetCategoryDisplayResult = new DepreciationDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("Depreciation_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    assetCategoryDisplayResult.Depreciations = result.Read<Depreciation>().ToList();
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

        public DepreciationDisplayResult SearchDepreciations(GridDisplayInput gridDisplayInput)
        {
            try
            {
                DepreciationDisplayResult depreciationDisplayResult = new DepreciationDisplayResult();

                string depreciationQuery = "";

                string whereCondition = " and  ( Name LIKE concat('%',@Search,'%') or Description LIKE concat('%',@Search,'%') ) ";

                depreciationQuery = " select " +
                                 "   DepreciationId, " +
                                 "   Name, " +
                                 "   Description " +
                                 " from " +
                                 "    dbo.Depreciation " +
                                 " where " +
                                 " IsDeleted = 0 ";

                if (gridDisplayInput.Search != null && gridDisplayInput.Search != "")
                {
                    depreciationQuery += whereCondition;

                    depreciationQuery += " order by " +
                                     " UpdatedDate desc ";
                }

                if (gridDisplayInput.Take > 0)
                {

                    depreciationQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                    depreciationQuery += " select " +
                                      " count(*) " +
                                      " from " +
                                      "   dbo.Depreciation " +
                                      " where " +
                                      " IsDeleted = 0 ";
                    if (gridDisplayInput.Search != null && gridDisplayInput.Search != "")
                    {
                        depreciationQuery += whereCondition;
                    }
                }

                using (var result = this.m_dbconnection.QueryMultiple(depreciationQuery, new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    Search = gridDisplayInput.Search
                }, commandType: CommandType.Text))
                {
                    depreciationDisplayResult.Depreciations = result.Read<Depreciation>().ToList();

                    if (gridDisplayInput.Take > 0)
                    {
                        depreciationDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                }
                return depreciationDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateDepreciation(Depreciation depreciation)
        {
            try
            {
                return this.m_dbconnection.Query<int>("Depreciation_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        DepreciationId = depreciation.DepreciationId,
                        Name = depreciation.Name,
                        Description = depreciation.Description,
                        CreatedBy = depreciation.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ValidateDepreciationName(Depreciation depreciation)
        {
            try
            {
                return this.m_dbconnection.Query<int>("Depreciation_CRUD",
                    new
                    {
                        Action = "VALIDATE",
                        DepreciationId = depreciation.DepreciationId,
                        Name = depreciation.Name
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
