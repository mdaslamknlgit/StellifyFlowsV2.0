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
    public class WorkflowAuditTrailRepository : IWorkflowAuditTrailRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public WorkflowAuditTrailDisplayResult GetWorkFlowAuditTrails(GridDisplayInput displayInput)
        {
            try
            {
                WorkflowAuditTrailDisplayResult workflowAuditTrailDisplayResult = new WorkflowAuditTrailDisplayResult();
                //executing the stored procedure to get the list of supplier categories....
                using (var result = this.m_dbconnection.QueryMultiple("WorkflowAuditTrail_CRUD", new
                {

                    Action = "SELECT",
                    Search = "",
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of supplier categories..
                    workflowAuditTrailDisplayResult.WorkflowAuditTrails = result.Read<WorkflowAuditTrail>().AsList();
                    //total number of supplier category records.
                    workflowAuditTrailDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return workflowAuditTrailDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<WorkflowAuditTrail> GetWorkFlowAuditTrialDetails(WorkflowAuditTrail auditTrail)
        {
            try
            {
                var result = GetAuditTrialDetails(auditTrail, this.m_dbconnection);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<WorkflowAuditTrail> GetAuditTrialDetails(WorkflowAuditTrail auditTrail,IDbConnection connectionObj)
        {
            //executing the stored procedure to get the list of supplier categories....
            var result = this.m_dbconnection.Query<WorkflowAuditTrail>("WorkflowAuditTrail_CRUD", new
            {
                Action = "SELECTBYPROCESS",
                DocumentId = auditTrail.Documentid,
                ProcessId = auditTrail.ProcessId,
                UserId = auditTrail.UserId,
                DocumentUserId = auditTrail.DocumentUserId,
            }, commandType: CommandType.StoredProcedure);

            return result;
        }

        public int CreateWorkflowAuditTrail(WorkflowAuditTrail workflowAuditTrail)
        {
            try
            {
                return this.m_dbconnection.Query<int>("WorkflowAuditTrail_CRUD",
                new
                {
                    Action = "INSERT",
                    Documentid = workflowAuditTrail.Documentid,
                    UserId = workflowAuditTrail.UserId,
                    Remarks = workflowAuditTrail.Remarks,
                    Statusid = workflowAuditTrail.Statusid,
                    CreatedDate = DateTime.Now,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
