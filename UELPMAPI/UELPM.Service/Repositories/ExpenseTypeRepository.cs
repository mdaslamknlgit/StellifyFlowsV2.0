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
    public class ExpenseTypeRepository:IExpenseTypeRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);


        public int CreateExpenseType(ExpenseType expenseType)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ExpenseType_CRUD",
                new
                {
                    Action = "INSERT",
                    ExpenseTypeName = expenseType.ExpenseTypeName.Trim(),
                    ExpenseTypeDescription = expenseType.ExpenseTypeDescription.Trim(),
                    CreatedBy = expenseType.CreatedBy,
                    CreatedDate = DateTime.Now,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ExpenseTypeDisplayResult GetExpenseType(GridDisplayInput displayInput)
        {
            try
            {
                ExpenseTypeDisplayResult expenseTypeDisplayResult = new ExpenseTypeDisplayResult();
                //executing the stored procedure to get the list of supplier services....
                using (var result = this.m_dbconnection.QueryMultiple("ExpenseType_CRUD", new
                {

                    Action = "SELECT",
                    Search = displayInput.Search,
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of suppliers..
                    expenseTypeDisplayResult.ExpenseTypes = result.Read<ExpenseType>().AsList();
                    //total number of supplier service records.
                    expenseTypeDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return expenseTypeDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public ExpenseTypeDisplayResult GetAllExpenseType(GridDisplayInput displayInput)
        {
            try
            {
                ExpenseTypeDisplayResult expenseTypeDisplayResult = new ExpenseTypeDisplayResult();
                //executing the stored procedure to get the list of supplier services....
                using (var result = this.m_dbconnection.QueryMultiple("ExpenseType_CRUD", new
                {

                    Action = "SELECT",
                    Search = displayInput.Search,
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of suppliers..
                    expenseTypeDisplayResult.ExpenseTypes = result.Read<ExpenseType>().AsList();
                    //total number of supplier service records.
                    expenseTypeDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return expenseTypeDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public ExpenseType GetExpenseType(int expenseTypeId)
        {
            try
            {
                return this.m_dbconnection.Query<ExpenseType>("ExpenseType_CRUD",
                new
                {
                    Action = "SELECTBYID",
                    ExpenseTypeId = expenseTypeId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateExpenseType(ExpenseType expenseType)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ExpenseType_CRUD",
                                                   new
                                                   {
                                                       Action = "UPDATE",
                                                       ExpenseTypeName = expenseType.ExpenseTypeName.Trim(),
                                                       ExpenseTypeDescription = expenseType.ExpenseTypeDescription.Trim(),
                                                       CreatedBy = expenseType.CreatedBy,
                                                       CreatedDate = DateTime.Now,
                                                       ExpenseTypeId = expenseType.ExpenseTypeId
                                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool DeleteExpenseType(ExpenseType expenseType)
        {
            try
            {
                var result = this.m_dbconnection.Query<int>("ExpenseType_CRUD",
                                        new
                                        {
                                            Action = "DELETE",
                                            ExpenseTypeId = expenseType.ExpenseTypeId,
                                            CreatedBy = expenseType.CreatedBy,
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
        public int ValidateExpenseType(ExpenseType expenseType)
        {
            try
            {

                return this.m_dbconnection.Query<int>("ExpenseType_CRUD",
                                         new
                                         {

                                             Action = "VALIDATE",
                                             ExpenseTypeId = expenseType.ExpenseTypeId,
                                             ExpenseTypeName = expenseType.ExpenseTypeName.Trim()
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
