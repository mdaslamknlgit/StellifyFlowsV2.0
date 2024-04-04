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
    public class ExpenseMasterRepository : IExpenseMasterRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public int CreateExpenseMaster(ExpenseMaster expenseMaster)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ExpensesMaster_CRUD",
                    new
                    {
                        Action = "INSERT",
                        ExpensesDetails = expenseMaster.ExpensesDetail,
                        DepartmentId = expenseMaster.LocationID,
                        ExpensesTypeId = expenseMaster.ExpensesTypeId,
                        CreatedBy = expenseMaster.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int DeleteExpenseMaster(ExpenseMaster expenseMaster)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ExpensesMaster_CRUD",
                    new
                    {
                        Action = "DELETE",
                        CreatedBy = expenseMaster.CreatedBy,
                        CreatedDate = DateTime.Now,
                        ExpensesMasterId = expenseMaster.ExpensesMasterId
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ExpenseMaster GetExpenseMasterDetails(int expenseMasterId)
        {
            try
            {
                var result = this.m_dbconnection.Query<ExpenseMaster>("ExpensesMaster_CRUD", new
                {
                    Action = "SELECTBYID",
                    ExpensesMasterId = expenseMasterId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                return result;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public ExpenseMasterDisplayResult GetExpenseMasters(GridDisplayInput gridDisplayInput)
        {
            try
            {
                ExpenseMasterDisplayResult expenseMasterDisplayResult = new ExpenseMasterDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("ExpensesMaster_CRUD", new
                {
                    Action = "SELECT",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    expenseMasterDisplayResult.Expenses = result.Read<ExpenseMaster>().ToList();
                    expenseMasterDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return expenseMasterDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public ExpenseMasterDisplayResult SearchExpenseMasters(ExpenseMasterSearch gridDisplayInput)
        {

            ExpenseMasterDisplayResult expenseMasterDisplayResult = new ExpenseMasterDisplayResult();

            string expensesQuery = "";
            string whereCondition = @"
                                        from
                                            dbo.ExpensesMaster as EM
                                        join
                                            dbo.Location as LC
                                            on
                                            EM.DepartmentId = LC.LocationID
                                        join
                                            dbo.ExpensesType as ET
                                            on
                                            ET.ExpensesTypeId = EM.ExpensesTypeId
                                        where
                                            EM.IsDeleted = 0 ";

            if (gridDisplayInput.ExpensesTypeId > 0)
            {
                whereCondition = $" { whereCondition } and  ( ET.ExpensesTypeId = @ExpenseTypeId )";
            }
            if (gridDisplayInput.DepartmentId > 0 )
            {
                whereCondition = $" { whereCondition } and  ( LC.LocationID = @DepartmentId )";
            }
            if (gridDisplayInput.Search != null && gridDisplayInput.Search != "")
            {
                whereCondition = $" { whereCondition } and  ( ET.ExpensesType LIKE concat('%',@Search,'%') or LC.Name LIKE concat('%',@Search,'%') or EM.ExpensesDetail LIKE concat('%',@Search,'%')  ) ";
            }

            expensesQuery = @" select
                                    ExpensesMasterId,
			                        ExpensesDetail,
			                        ET.ExpensesTypeId,
			                        ET.ExpensesType,
			                        LC.LocationID,
			                        LC.Name as Location";

            expensesQuery += whereCondition;

            expensesQuery += " order by  EM.UpdatedDate desc ";

            if (gridDisplayInput.Take > 0)
            {
                expensesQuery += "  OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";
                expensesQuery += $" select count(*) { whereCondition }";
            }

            using (var result = this.m_dbconnection.QueryMultiple(expensesQuery, new
            {
                Action = "SELECT",
                Skip = gridDisplayInput.Skip,
                Take = gridDisplayInput.Take,
                Search = gridDisplayInput.Search,
                ExpenseTypeId = gridDisplayInput.ExpensesTypeId,
                DepartmentId = gridDisplayInput.DepartmentId
            }, commandType: CommandType.Text))
            {
                expenseMasterDisplayResult.Expenses = result.Read<ExpenseMaster>().ToList();
                if (gridDisplayInput.Take > 0)
                {
                    expenseMasterDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
            }
            return expenseMasterDisplayResult;
        }

        public int UpdateExpenseMaster(ExpenseMaster expenseMaster)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ExpensesMaster_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        ExpensesMasterId = expenseMaster.ExpensesMasterId,
                        ExpensesDetails = expenseMaster.ExpensesDetail,
                        DepartmentId = expenseMaster.LocationID,
                        ExpensesTypeId = expenseMaster.ExpensesTypeId,
                        CreatedBy = expenseMaster.CreatedBy,
                        CreatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
