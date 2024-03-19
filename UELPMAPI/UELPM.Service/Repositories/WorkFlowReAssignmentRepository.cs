using Dapper;
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Service.Exceptions;
using UELPM.Util.PdfGenerator;
using System.Collections.Generic;

namespace UELPM.Service.Repositories
{
    public class WorkFlowReAssignmentRepository : IWorkFlowReAssignmentRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;
        UserProfileRepository objUserRepository = null;
        public WorkFlowReAssignment GetUserWorkFlowReAssignDetails(int userId, int companyId)
        {
            WorkFlowReAssignment workFlowReAssignmentDetails = new WorkFlowReAssignment();
            workFlowReAssignmentDetails.UserRoles = this.m_dbconnection.Query<Roles>("User_CRUD",
                                       new
                                       {
                                           Action = "GETUSERROLESBYCOMPANY",
                                           UserId = userId,
                                           CompanyId = companyId
                                       },
                                       commandType: CommandType.StoredProcedure).ToList();

            if (workFlowReAssignmentDetails != null)
            {
                workFlowReAssignmentDetails.WorkflowItems = this.m_dbconnection.Query<WorkflowItems>("WorkFlowReAssignment_CRUD",
                                   new
                                   {
                                       Action = "CURRENT_WORKFLOW",
                                       UserId = userId
                                   }, commandType: CommandType.StoredProcedure).ToList();

            }

            if (workFlowReAssignmentDetails != null)
            {
                workFlowReAssignmentDetails.Documents = this.m_dbconnection.Query<Documents>("WorkFlowReAssignment_CRUD",
                                   new
                                   {
                                       Action = "CURRENT_DOCUMENTS",
                                       UserId = userId
                                   }, commandType: CommandType.StoredProcedure).ToList();

            }

            return workFlowReAssignmentDetails;
        }

        public WorkFlowReAssignment GetUserAllWorkFlowReAssignDetails(int userId, int companyId)
        {
            WorkFlowReAssignment workFlowReAssignmentDetails = new WorkFlowReAssignment();
            workFlowReAssignmentDetails.UserRoles = this.m_dbconnection.Query<Roles>("User_CRUD",
                                       new
                                       {
                                           Action = "GETUSERROLESBYCOMPANY",
                                           UserId = userId,
                                           CompanyId = companyId
                                       },
                                       commandType: CommandType.StoredProcedure).ToList();

            if (workFlowReAssignmentDetails != null)
            {
                workFlowReAssignmentDetails.WorkflowItems = this.m_dbconnection.Query<WorkflowItems>("WorkFlowReAssignment_CRUD",
                                   new
                                   {
                                       Action = "WORKFLOWITEMS",
                                       UserId = userId
                                   }, commandType: CommandType.StoredProcedure).ToList();

            }

            if (workFlowReAssignmentDetails != null)
            {
                workFlowReAssignmentDetails.Documents = this.m_dbconnection.Query<Documents>("WorkFlowReAssignment_CRUD",
                                   new
                                   {
                                       Action = "DOCUMENTS",
                                       UserId = userId
                                   }, commandType: CommandType.StoredProcedure).ToList();

            }

            return workFlowReAssignmentDetails;
        }

        public int CreateWorkFlowReAssignment(WorkFlowReAssignment workFlowReAssignmentDetails)
        {
            int workFlowReassignmentLogId = 0;
            int workFlowReAssignmentStrucutreLogId = 0;
            int workFlowReAssignmentDocumentLogId = 0;
            try
            {
                this.m_dbconnection.Open();
                var WorkFlowReAssignment = this.GetUserAllWorkFlowReAssignDetails(workFlowReAssignmentDetails.CurrentApproverUserId, workFlowReAssignmentDetails.CompanyId);
                
                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        workFlowReassignmentLogId = transaction.Connection.Query<int>("WorkFlowReAssignmentLog_CRUD",
                           new
                           {
                               Action = "INSERT",
                               CurrentApproverUserId = workFlowReAssignmentDetails.CurrentApproverUserId,
                               AlternateApproverUserId = workFlowReAssignmentDetails.AlternateApproverUserId,
                               CompanyId = workFlowReAssignmentDetails.CompanyId,
                               CreatedBy = workFlowReAssignmentDetails.CreatedBy,
                               CreatedDate = DateTime.Now
                           },
                           transaction: transaction,
                           commandType: CommandType.StoredProcedure).FirstOrDefault();

                        if (workFlowReassignmentLogId > 0)
                        {
                            foreach (WorkflowItems workFlowItem in workFlowReAssignmentDetails.WorkflowItems)
                            {
                                workFlowReAssignmentStrucutreLogId = transaction.Connection.Query<int>("WorkFlowReAssignmentStrucutreLog_CRUD",
                                 new
                                 {
                                     Action = "INSERT",
                                     WorkFlowReAssignmentLogId = workFlowReassignmentLogId,
                                     ProcessName = workFlowItem.ProcessName,
                                     WorkFlowOrder = workFlowItem.LevelIndex,
                                     RoleName = workFlowItem.RoleName,
                                     CompanyName = workFlowItem.CompanyName,
                                     DepartmentName = workFlowItem.DepartmentName
                                 },
                                 transaction: transaction,
                                 commandType: CommandType.StoredProcedure).FirstOrDefault();

                            }

                            if (workFlowReassignmentLogId > 0)
                            {
                                foreach (Documents document in workFlowReAssignmentDetails.Documents)
                                {
                                    workFlowReAssignmentDocumentLogId = transaction.Connection.Query<int>("WorkFlowReAssignmentDocumentLog_CRUD",
                                    new
                                    {
                                        Action = "INSERT",
                                        WorkFlowReAssignmentLogId = workFlowReassignmentLogId,
                                        DocumentCode = document.DocumentCode,
                                        ProcessName = document.ProcessName,
                                        WorkFlowStatus = document.WorkFlowStatus,
                                        CompanyName = document.CompanyName
                                    },
                                    transaction: transaction,
                                    commandType: CommandType.StoredProcedure).FirstOrDefault();
                                }
                            }
                            workFlowReAssignmentDetails.WorkflowItems = WorkFlowReAssignment.WorkflowItems;
                            workFlowReAssignmentDetails.Documents = WorkFlowReAssignment.Documents;
                            foreach (WorkflowItems workFlowItem in workFlowReAssignmentDetails.WorkflowItems)
                            {
                                int result = transaction.Connection.Query<int>("WorkFlowReAssignment_CRUD",
                                 new
                                 {
                                     Action = "UPDATEWORKFLOWITEMS",
                                     CurrentApproverUserId = workFlowReAssignmentDetails.CurrentApproverUserId,
                                     AlternateApproverUserId = workFlowReAssignmentDetails.AlternateApproverUserId,
                                     WorkFlowLevelId = workFlowItem.WorkFlowLevelId
                                 },
                                 transaction: transaction,
                                 commandType: CommandType.StoredProcedure).FirstOrDefault();

                            }

                            foreach (Documents document in workFlowReAssignmentDetails.Documents)
                            {
                                int result = transaction.Connection.Query<int>("WorkFlowReAssignment_CRUD",
                                new
                                {
                                    Action = "UPDATEDOCUMENTS",
                                    AlternateApproverUserId = workFlowReAssignmentDetails.AlternateApproverUserId,
                                    WorkFlowId = document.WorkFlowId,
                                    DocumentId = document.DocumentId
                                },
                                transaction: transaction,
                                commandType: CommandType.StoredProcedure).FirstOrDefault();
                            }

                            transaction.Commit();
                        }

                        return workFlowReassignmentLogId;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw new InternalServerException(ex.ToString());
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InternalServerException(ex.ToString());
            }
        }

        public byte[] GetWorkFlowReAssignmentPDFTemplate(WorkFlowReAssignment workFlowReAssignmentDetails)
        {
            PdfGenerator pdfGeneratorObj = null;
            WorkFlowReAssignment assignmentData = null;

            bool preview = workFlowReAssignmentDetails.preview;

            try
            {
                sharedRepository = new SharedRepository();
                objUserRepository = new UserProfileRepository();
                assignmentData = new WorkFlowReAssignment();
                var companyDetails = sharedRepository.GetCompanyDetails(workFlowReAssignmentDetails.CompanyId);

                if (!preview)
                {


                    if (workFlowReAssignmentDetails != null)
                    {
                        workFlowReAssignmentDetails.UserRoles = this.m_dbconnection.Query<Roles>("User_CRUD",
                                        new
                                        {
                                            Action = "GETUSERROLESBYCOMPANY",
                                            UserId = workFlowReAssignmentDetails.CurrentApproverUserId,
                                            CompanyId = workFlowReAssignmentDetails.CompanyId
                                        },
                                        commandType: CommandType.StoredProcedure).ToList();
                    }

                    if (workFlowReAssignmentDetails != null)
                    {
                        //workFlowReAssignmentDetails.WorkflowItems = new List<WorkflowItems>();
                        workFlowReAssignmentDetails.WorkflowItems = this.m_dbconnection.Query<WorkflowItems>("WorkFlowReAssignmentStrucutreLog_CRUD",
                                           new
                                           {
                                               Action = "SELECT",
                                               WorkFlowReAssignmentLogId = workFlowReAssignmentDetails.WorkFlowReAssignmentLogId
                                           }, commandType: CommandType.StoredProcedure).ToList();

                    }

                    if (workFlowReAssignmentDetails != null)
                    {
                        workFlowReAssignmentDetails.Documents = this.m_dbconnection.Query<Documents>("WorkFlowReAssignmentDocumentLog_CRUD",
                                           new
                                           {
                                               Action = "SELECT",
                                               WorkFlowReAssignmentLogId = workFlowReAssignmentDetails.WorkFlowReAssignmentLogId
                                           }, commandType: CommandType.StoredProcedure).ToList();

                    }

                    assignmentData = workFlowReAssignmentDetails;
                }
                else
                {
                    var data = GetUserWorkFlowReAssignDetails(workFlowReAssignmentDetails.CurrentApproverUserId, workFlowReAssignmentDetails.CompanyId);
                    data.AlternateApproverUserId = workFlowReAssignmentDetails.AlternateApproverUserId;
                    data.CurrentApproverUserId = workFlowReAssignmentDetails.CurrentApproverUserId;
                    data.AlternateApproverUserName = workFlowReAssignmentDetails.AlternateApproverUserName;
                    data.CurrentApproverUserName = workFlowReAssignmentDetails.CurrentApproverUserName;
                    assignmentData = data;
                }

                pdfGeneratorObj = new PdfGenerator();
                var result = pdfGeneratorObj.GetWorkFlowReAssignmentPDFTemplate(assignmentData, companyDetails);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string VerifyAlternateUser(int currentUserId, int alternateUserId)
        {
            string noaccessCompanies = string.Empty;
            try
            {
                List<string> companies = this.m_dbconnection.Query<string>("Workflowreassignment_crud",
                                         new
                                         {
                                             Action = "VERIFYALTERNATEUSER",
                                             currentUserId = currentUserId,
                                             alternateUserId = alternateUserId
                                         },
                                         commandType: CommandType.StoredProcedure).ToList();
                if (companies.Count > 0)
                {
                    noaccessCompanies = companies.Aggregate((a, x) => a + ", " + x);
                }
            }
            catch (Exception ex)
            {

                throw;
            }
            return noaccessCompanies;
        }

    }
}
