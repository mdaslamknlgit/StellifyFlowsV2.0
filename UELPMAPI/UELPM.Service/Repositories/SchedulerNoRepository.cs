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
    public class SchedulerNoRepository : ISchedulerNoRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public SchedulerNoDisplayResult GetSchedulerNo()
        {
            try
            {
                SchedulerNoDisplayResult SchedulerDisplayResult = new SchedulerNoDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("SP_SchedulerNoCRUD", new
                {
                    Action = "SELECT"
                }, commandType: CommandType.StoredProcedure))
                {
                    SchedulerDisplayResult.SchedulerNos = result.Read<SchedulerNo>().ToList();
                }
                return SchedulerDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public SchedulerNo GetSchedulerNoById(int SchedulerNoId)
        {
            SchedulerNo Scheduler = new SchedulerNo();

            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("SP_SchedulerNoCRUD", new
                {

                    Action = "SelectById",
                    SchedulerNoId = SchedulerNoId,
                }, commandType: CommandType.StoredProcedure))
                {
                    Scheduler = result.Read<SchedulerNo>().FirstOrDefault();
                }

                return Scheduler;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<SchedulerNo> GetSchedulerByType(string Type)
        {
            try
            {
                return this.m_dbconnection.Query<SchedulerNo>("SP_SchedulerNoCRUD", new
                {

                    Action = "SelectByType",
                    Type = Type
                }, commandType: CommandType.StoredProcedure).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int PostSchedulerNo(SchedulerNo schedulerObj)
        {
            int ReturnValue = 0;

            if (schedulerObj.SchedulerNoId == 0)
            {
                ReturnValue = this.CreateSchedulerNo(schedulerObj);
            }
            else
            {
                ReturnValue = this.UpdateSchedulerNo(schedulerObj);
            }
            return ReturnValue;
        }
        public int CreateSchedulerNo(SchedulerNo schedulerObj)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        #region SchedulerNo creation...
                        schedulerObj.SchedulerNoId = this.m_dbconnection.QueryFirstOrDefault<int>("SP_SchedulerNoCRUD", new
                        {
                            Action = "INSERT",
                            SchedulerNumber = schedulerObj.SchedulerNumber,
                            SchedulerDescription = schedulerObj.SchedulerDescription,
                            ScheduleCategoryId = schedulerObj.ScheduleCategoryId,
                            ScheduleTypeId = schedulerObj.ScheduleTypeId,
                            CreatedBy = schedulerObj.CreatedBy,
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                        #endregion

                        transactionObj.Commit();

                        return schedulerObj.SchedulerNoId;
                    }
                    catch (Exception e)
                    {
                        //rollback transaction..
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int UpdateSchedulerNo(SchedulerNo schedulerObj)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        #region SchedulerNo creation...
                        schedulerObj.SchedulerNoId = this.m_dbconnection.QueryFirstOrDefault<int>("SP_SchedulerNoCRUD", new
                        {
                            Action = "Update",
                            SchedulerNumber = schedulerObj.SchedulerNumber,
                            SchedulerDescription = schedulerObj.SchedulerDescription,
                            ScheduleCategoryId = schedulerObj.ScheduleCategoryId,
                            ScheduleTypeId = schedulerObj.ScheduleTypeId,
                            UpdatedBy = schedulerObj.UpdatedBy,
                            SchedulerNoId = schedulerObj.SchedulerNoId,

                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                        #endregion

                        transactionObj.Commit();

                        return schedulerObj.SchedulerNoId;
                    }
                    catch (Exception e)
                    {
                        //rollback transaction..
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool ChangeStatus(SchedulerNo schedulerObj)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {

                        schedulerObj.SchedulerNoId = this.m_dbconnection.QueryFirstOrDefault<int>("SP_SchedulerNoCRUD", new
                        {
                            Action = "CHANGE_STATUS",
                            IsActive = schedulerObj.IsActive,
                            UpdatedBy = schedulerObj.UpdatedBy,
                            SchedulerNoId = schedulerObj.SchedulerNoId,
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                        transactionObj.Commit();
                    }
                    catch (Exception e)
                    {
                        //rollback transaction..
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return true;
        }
        public int DeleteSchedulerNo(int SchedulerNoId, int? UpdatedBy)
        {
            SchedulerNo Scheduler = new SchedulerNo();

            try
            {
                int count = this.m_dbconnection.ExecuteScalar<int>("SP_SchedulerNoCRUD", new
                {
                    Action = "VERIFY_DEPENDENCY",
                    SchedulerNoId = SchedulerNoId,
                    UpdatedBy = UpdatedBy
                }, commandType: CommandType.StoredProcedure);
                if (count == 0)
                {
                    using (var result = this.m_dbconnection.QueryMultiple("SP_SchedulerNoCRUD", new
                    {

                        Action = "Delete",
                        SchedulerNoId = SchedulerNoId,
                        UpdatedBy = UpdatedBy
                    }, commandType: CommandType.StoredProcedure))
                        return 1;
                }
                else
                {
                    return 0;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public SchedulerNoDisplayResult CheckSchedulerNo(SchedulerNo schedulerObj)
        {
            try
            {
                SchedulerNoDisplayResult SchedulerDisplayResult = new SchedulerNoDisplayResult();
                //executing the stored procedure to get the list of Scheduler No
                using (var result = this.m_dbconnection.QueryMultiple("SP_SchedulerNoCRUD", new
                {
                    Action = "Check_Scheduler_No",
                    ScheduleCategoryId = schedulerObj.ScheduleCategoryId,
                    ScheduleTypeId = schedulerObj.ScheduleTypeId,
                    SchedulerNumber = schedulerObj.SchedulerNumber
                }, commandType: CommandType.StoredProcedure))
                {
                    SchedulerDisplayResult.SchedulerNos = result.Read<SchedulerNo>().ToList();
                }
                return SchedulerDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<ScheduleCategory> GetScheduleCategories()
        {
            try
            {
                return this.m_dbconnection.Query<ScheduleCategory>("select * from ScheduleCategory").ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public IEnumerable<ScheduleType> GetScheduleTypes()
        {
            try
            {
                return this.m_dbconnection.Query<ScheduleType>("select * from ScheduleType").ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
