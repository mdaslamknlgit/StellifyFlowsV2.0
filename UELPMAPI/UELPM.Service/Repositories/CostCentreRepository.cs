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
    public class CostCentreRepository : ICostCentreRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public CostCentreDisplayResult GetCostCentres(GridDisplayInput creditNoteInput)
        {
            try
            {
                CostCentreDisplayResult creditNotesDisplayResult = new CostCentreDisplayResult();
                //executing the stored procedure to get the list of credit notes
                using (var result = this.m_dbconnection.QueryMultiple("CostCenter_CRUD", new
                {
                    Action = "SELECT",
                    Skip = creditNoteInput.Skip,
                    Take = creditNoteInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    creditNotesDisplayResult.CostCentres = result.Read<CostCentre>().ToList();
                    creditNotesDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return creditNotesDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public CostCentre GetCostCentresById(int CostCenterId)
        {
            try
            {
                CostCentre costCentre = new CostCentre();
                //executing the stored procedure to get the list of credit notes
                using (var result = this.m_dbconnection.QueryMultiple("CostCenter_CRUD", new
                {
                    Action = "SELECTBYID",
                    CostCenterId= CostCenterId
                }, commandType: CommandType.StoredProcedure))
                {
                    costCentre = result.Read<CostCentre>().FirstOrDefault();
                }
                return costCentre;
            }
            catch (Exception e)
            {
                throw e;

            }
        }
        public CostCentreDisplayResult SearchCostCentres(GridDisplayInput creditNoteInput)
        {
            try
            {
                CostCentreDisplayResult creditNotesDisplayResult = new CostCentreDisplayResult();

                string costCentreQuery = "";

                string whereCondition = " and  ( CostCenterName LIKE concat('%',@Search,'%') or Description LIKE concat('%',@Search,'%') ) ";

                costCentreQuery = " select " +
                                   " CostCenterId, " +
                                   " CostCenterName, " +
                                   " Description " +
                                   " from " +
                                   "      dbo.CostCenter " +
                                   "  where " +
                                   "    IsDeleted = 0 ";
                costCentreQuery += whereCondition;

                costCentreQuery += "  order by " +
                                   "  UpdatedDate desc " +
                                   "   OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                costCentreQuery += " select " +
                                  "  count(*) " +
                                  " from " +
                                  "  dbo.CostCenter " +
                                  " where " +
                                  " IsDeleted = 0 ";
                costCentreQuery += whereCondition;


                //executing the stored procedure to get the list of credit notes
                using (var result = this.m_dbconnection.QueryMultiple(costCentreQuery, new
                {
                    Action = "SELECT",
                    Skip = creditNoteInput.Skip,
                    Take = creditNoteInput.Take,
                    Search = creditNoteInput.Search
                }, commandType: CommandType.Text))
                {
                    creditNotesDisplayResult.CostCentres = result.Read<CostCentre>().ToList();
                    creditNotesDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return creditNotesDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public CostCentre GetCostCentreDetails(int costCentreId)
        {
            try
            {
                //executing the stored procedure to get the list of credit notes
                var result = this.m_dbconnection.Query<CostCentre>("CostCenter_CRUD", new
                {
                    Action = "SELECTBYID",
                    CostCenterId = costCentreId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                return result;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public int CreateCostCentre(CostCentre costCentre)
        {
            try
            {
                return this.m_dbconnection.Query<int>("CostCenter_CRUD",
                    new
                    {
                        Action = "INSERT",
                        CostCenterName = costCentre.CostCenterName,
                        Description = costCentre.Description,
                        CreatedBy = costCentre.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch(Exception e)
            {
                throw e;
            }
        }

        public int UpdateCostCentre(CostCentre costCentre)
        {
            try
            {
                return this.m_dbconnection.Query<int>("CostCenter_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        CostCenterName = costCentre.CostCenterName,
                        Description = costCentre.Description,
                        CreatedBy = costCentre.CreatedBy,
                        CreatedDate = DateTime.Now,
                        CostCenterId = costCentre.CostCenterId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public int DeleteCostCentre(CostCentre costCentre)
        {
            try
            {
                return this.m_dbconnection.Query<int>("CostCenter_CRUD",
                    new
                    {
                        Action = "DELETE",
                        CreatedBy = costCentre.CreatedBy,
                        CreatedDate = DateTime.Now,
                        CostCenterId = costCentre.CostCenterId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ValidateCostCentreName(CostCentre costCentre)
        {
            try
            {
                return this.m_dbconnection.Query<int>("CostCenter_CRUD",
                    new
                    {
                        Action = "VALIDATE",
                        CostCenterId = costCentre.CostCenterId,
                        CostCenterName = costCentre.CostCenterName.Trim()
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
