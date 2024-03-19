using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Exceptions;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class WorkFlowConfigurationRepository : IWorkFlowConfigurationRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        PurchaseOrderRequestRepository objPurchaseOrderRequestRepository = null;

        public IEnumerable<WorkFlowConfiguration> GetWorkFlowConfigurations(int companyId)
        {
            const string sql =
                @"SELECT  wc.WorkFlowConfigurationId, wc.CompanyId, wc.LocationID, wc.WorkFlowName, wc.ProcessId, wc.IsDeleted, wc.CreatedBy,wc.CreatedDate, wc.UpdatedBy,
                         wc.UpdatedDate,wpl.WorkFlowProcessId,wpl.WorkFlowConfigurationId, wpl.LevelOrder, wpl.ProcessIndex,
						 wl.WorkFlowLevelId, wl.WorkFlowProcessId, wl.FieldName, wl.Operator, wl.Value, wl.ApproverUserId, wl.RoleID, wl.IsCondition, wl.LevelIndex, 
                         wl.CreatedBy, wl.CreatedDate, wl.UpdatedBy, wl.UpdatedDate
                         FROM  WorkFlowConfiguration AS wc INNER JOIN
                         WorkFlowProcessLevel wpl ON wc.WorkFlowConfigurationId = wpl.WorkFlowConfigurationId
                         LEFT JOIN WorkFlowLevel wl ON wpl.WorkFlowProcessId = wl.WorkFlowProcessId                     
                         WHERE wc.CompanyId = @CompanyId AND wc.IsDeleted = 0";

            var parameters = new Dictionary<string, object>
            {
                {"Action", "SELECT"},
                {"CompanyId", companyId},
            };

            var workFlowConfigurationDictionary = new Dictionary<int, WorkFlowConfiguration>();

            var workFlowConfigurations = this.m_dbconnection.Query<WorkFlowConfiguration, WorkFlowProcessLevel, WorkFlowLevel, WorkFlowConfiguration>(sql,
                         (workFlowConfiguration, workFlowProcessLevel, workFlowLevel) =>
                         {
                             if (!workFlowConfigurationDictionary.TryGetValue(workFlowConfiguration.WorkFlowConfigurationId, out WorkFlowConfiguration wc))
                             {
                                 wc = workFlowConfiguration;
                                 wc.WorkFlowProcess = new List<WorkFlowProcessLevel>();
                                 workFlowConfigurationDictionary.Add(wc.WorkFlowConfigurationId, wc);
                             }

                             if (workFlowProcessLevel != null)
                             {

                                 if (wc.WorkFlowProcess.Count > 0)
                                 {
                                     bool alreadyExists = wc.WorkFlowProcess.Any(x => x.WorkFlowProcessId == workFlowProcessLevel.WorkFlowProcessId && x.WorkFlowConfigurationId == workFlowProcessLevel.WorkFlowConfigurationId);
                                     if (!alreadyExists)
                                     {
                                         workFlowProcessLevel.WorkFlowLevels = new List<WorkFlowLevel>();
                                         wc.WorkFlowProcess.Add(workFlowProcessLevel);
                                     }
                                 }
                                 else
                                 {
                                     workFlowProcessLevel.WorkFlowLevels = new List<WorkFlowLevel>();
                                     wc.WorkFlowProcess.Add(workFlowProcessLevel);
                                 }

                             }

                             if (workFlowLevel != null)
                             {
                                 var workProcess = (from wp in wc.WorkFlowProcess where wp.WorkFlowProcessId == workFlowLevel.WorkFlowProcessId select wp).FirstOrDefault();

                                 if (workProcess.WorkFlowLevels.Count > 0)
                                 {
                                     bool alreadyExists = workProcess.WorkFlowLevels.Any(x => x.WorkFlowProcessId == workFlowProcessLevel.WorkFlowProcessId && x.WorkFlowLevelId == workFlowLevel.WorkFlowLevelId);
                                     if (!alreadyExists)
                                     {
                                         workProcess.WorkFlowLevels.Add(workFlowLevel);
                                     }
                                 }
                                 else
                                 {
                                     workProcess.WorkFlowLevels.Add(workFlowLevel);
                                 }
                             }

                             return wc;
                         }, parameters, splitOn: "WorkFlowConfigurationId,WorkFlowProcessId, WorkFlowLevelId").Distinct().ToList();


            return workFlowConfigurations;

        }

        public WorkFlowConfigurationDisplayResult GetWorkFlowConfigurationsByCompany(GridDisplayInput workFlowInput)
        {
            try
            {
                IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
                WorkFlowConfigurationDisplayResult workFlowConfigurationDisplayResult = new WorkFlowConfigurationDisplayResult();
                using (var result = m_dbconnection.QueryMultiple("WorkFlowConfiguration_CRUD", new
                {
                    Action = "SELECT",
                    Search = "",
                    Skip = workFlowInput.Skip,
                    Take = workFlowInput.Take,
                    CompanyId = workFlowInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    workFlowConfigurationDisplayResult.WorkFlowConfigurations = result.Read<WorkFlowConfigurationList>().AsList();
                    workFlowConfigurationDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return workFlowConfigurationDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public WorkFlowConfigurationDisplayResult GetAllSearchWorkFlowConfigurations(WorkFlowSearch workFlowSearch)
        {
            WorkFlowConfigurationDisplayResult workFlowConfigurationDisplayResult = new WorkFlowConfigurationDisplayResult();
            string action = string.Empty;
            if (workFlowSearch.Search != null)
            {
                action = "SELECT";
            }
            else
            {
                action = "FILTER";
            }
            using (var result = this.m_dbconnection.QueryMultiple("WorkFlowConfiguration_CRUD", new
            {
                Action = action,
                Search = workFlowSearch.Search,
                Filter = workFlowSearch.Filter,
                Skip = workFlowSearch.Skip,
                Take = workFlowSearch.Take,
                ProcessName = workFlowSearch.ProcessName,
                WorkFlowName = workFlowSearch.WorkFlowName,
                Department = workFlowSearch.Department,
                Companyid = workFlowSearch.CompanyId

            }, commandType: CommandType.StoredProcedure))
            {
                workFlowConfigurationDisplayResult.WorkFlowConfigurations = result.Read<WorkFlowConfigurationList>().AsList();
                workFlowConfigurationDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
            }

            return workFlowConfigurationDisplayResult;

        }

        public IEnumerable<WorkFlowProcess> GetWorkFlowProcesses(string searchKey)
        {
            //return this.m_dbconnection.Query<WorkFlowProcess>("usp_GetWorkFlowProcesses", commandType: CommandType.StoredProcedure).ToList();
            return this.m_dbconnection.Query<WorkFlowProcess>("usp_GetWorkFlowProcesses", new
            {
                Search = searchKey
            }, commandType: CommandType.StoredProcedure);

        }

        public WorkFlowConfiguration GetWorkFlowConfiguration(int processId, int companyId, int locationId)
        {
            try
            {
                string sql =
                @"SELECT 
						 wc.IsFollowWorkflow,wfp.IsMandatoryFollowWorkflow, wc.WorkFlowConfigurationId, wc.CompanyId, wc.LocationID, wc.WorkFlowName, wc.ProcessId, wc.IsDeleted, wc.CreatedBy,wc.CreatedDate, wc.UpdatedBy,
                         wc.UpdatedDate,wpl.WorkFlowProcessId,wpl.WorkFlowConfigurationId, wpl.LevelOrder, wpl.ProcessIndex,
						 wl.WorkFlowLevelId, wl.WorkFlowProcessId, wl.FieldName, wl.Operator, wl.Value, wl.ApproverUserId, wl.RoleID, wl.IsCondition, wl.LevelIndex, 
                         wl.CreatedBy, wl.CreatedDate, wl.UpdatedBy, wl.UpdatedDate, dbo.checkSupplierVerifier(wl.ApproverUserId, wc.CompanyId) as IsVerifier
                         FROM  WorkFlowConfiguration AS wc
						 LEFT JOIN WorkFlowProcess as wfp on wc.ProcessId= wfp.ProcessId
						 left join WorkFlowProcessLevel wpl ON wc.WorkFlowConfigurationId = wpl.WorkFlowConfigurationId
                         LEFT JOIN WorkFlowLevel wl ON wpl.WorkFlowProcessId = wl.WorkFlowProcessId";

                if (locationId > 0)
                {
                    sql += " WHERE (wc.ProcessId = @ProcessId) AND (wc.CompanyId = @CompanyId) AND (wc.LocationID = @LocationId  OR wc.LocationID IS NULL) AND (wc.IsDeleted = 0)";
                }
                else
                {
                    sql += " WHERE (wc.ProcessId = @ProcessId) AND (wc.CompanyId = @CompanyId) AND (wc.IsDeleted = 0) AND wc.LocationID IS NULL order by ProcessIndex";
                }

                var parameters = new Dictionary<string, object>
                {
                    {"Action", "SELECT"},
                    {"ProcessId", processId},
                    {"CompanyId", companyId},
                    {"LocationId", locationId},
                };

                var workFlowConfigurationDictionary = new Dictionary<int, WorkFlowConfiguration>();

                var workFlowConfigurations = this.m_dbconnection.Query<WorkFlowConfiguration, WorkFlowProcessLevel, WorkFlowLevel, WorkFlowConfiguration>(sql,
                        (workFlowConfiguration, workFlowProcessLevel, workFlowLevel) =>
                        {
                            if (!workFlowConfigurationDictionary.TryGetValue(workFlowConfiguration.WorkFlowConfigurationId, out WorkFlowConfiguration wc))
                            {
                                wc = workFlowConfiguration;
                                wc.WorkFlowProcess = new List<WorkFlowProcessLevel>();
                                workFlowConfigurationDictionary.Add(wc.WorkFlowConfigurationId, wc);
                            }

                            if (workFlowProcessLevel != null)
                            {

                                if (wc.WorkFlowProcess.Count > 0)
                                {
                                    bool alreadyExists = wc.WorkFlowProcess.Any(x => x.WorkFlowProcessId == workFlowProcessLevel.WorkFlowProcessId && x.WorkFlowConfigurationId == workFlowProcessLevel.WorkFlowConfigurationId);
                                    if (!alreadyExists)
                                    {
                                        workFlowProcessLevel.WorkFlowLevels = new List<WorkFlowLevel>();
                                        wc.WorkFlowProcess.Add(workFlowProcessLevel);
                                    }
                                }
                                else
                                {
                                    workFlowProcessLevel.WorkFlowLevels = new List<WorkFlowLevel>();
                                    wc.WorkFlowProcess.Add(workFlowProcessLevel);
                                }

                            }

                            if (workFlowLevel != null)
                            {
                                var workProcess = (from wp in wc.WorkFlowProcess where wp.WorkFlowProcessId == workFlowLevel.WorkFlowProcessId select wp).FirstOrDefault();

                                if (workProcess.WorkFlowLevels.Count > 0)
                                {
                                    bool alreadyExists = workProcess.WorkFlowLevels.Any(x => x.WorkFlowProcessId == workFlowProcessLevel.WorkFlowProcessId && x.WorkFlowLevelId == workFlowLevel.WorkFlowLevelId);
                                    if (!alreadyExists)
                                    {
                                        workProcess.WorkFlowLevels.Add(workFlowLevel);
                                    }
                                }
                                else
                                {
                                    workProcess.WorkFlowLevels.Add(workFlowLevel);
                                }
                            }

                            return wc;
                        }, parameters, splitOn: "WorkFlowConfigurationId,WorkFlowProcessId, WorkFlowLevelId").FirstOrDefault();

                if (workFlowConfigurations != null)
                {
                    if (workFlowConfigurations.WorkFlowProcess != null && workFlowConfigurations.WorkFlowProcess.Count > 0)
                    {
                        workFlowConfigurations.WorkFlowProcess = workFlowConfigurations.WorkFlowProcess.OrderBy(x => x.ProcessIndex).ToList();
                    }
                }
                return workFlowConfigurations;
            }
            catch (Exception ex)
            {
                throw new InternalServerException(ex.Message.ToString());
            }

        }

        public IEnumerable<WorkFlow> GetDocumentWorkFlow(List<WorkFlowParameter> workFlowParameters, IDbTransaction dbTransactionObj = null, IDbConnection dbConnectionObj = null)
        {
            UserProfileRepository objUserRepository = new UserProfileRepository();
            List<GetItemDetails> getItemDetails = new List<GetItemDetails>();
            List<WorkFlow> objWorkFlowList = null;
            bool isValid = false;
            string result = string.Empty;
            int processId = workFlowParameters.Select(x => x.ProcessId).FirstOrDefault();
            int documentId = workFlowParameters.Select(x => x.DocumentId).FirstOrDefault();
            int companyId = workFlowParameters.Select(x => x.CompanyId).FirstOrDefault();
            int locationId = workFlowParameters.Select(x => x.LocationId).FirstOrDefault();
            int workFlowStatusId = workFlowParameters.Select(x => x.WorkFlowStatusId).FirstOrDefault();
            int curWorkflowStatusId = workFlowParameters.Select(x => x.CurrentWorkFlowStatusId).FirstOrDefault();
            string CoSupplierCode = workFlowParameters.Select(x => x.CoSupplierCode).FirstOrDefault();
            int approvalCount = 0;
            DateTime terminationDate = workFlowParameters.Select(x => x.TerminationDate).FirstOrDefault();
            int createdBy = workFlowParameters.Select(x => x.CreatedBy).FirstOrDefault();
            int newWorkFlowStatusId = 0;
            string poCode;
            int conditionCount = 0;
            string reasonsForVoid = workFlowParameters.Select(x => x.ReasonForVoid).FirstOrDefault();

            try
            {

                WorkFlowFieldNames filedNames;
                bool isNumerical = false;
                var workFlowDetails = GetWorkFlowConfiguration(processId, companyId, locationId);
                int order = 0;
                bool isBeforeCondition = false;
                if (workFlowDetails != null)
                {
                    objWorkFlowList = new List<WorkFlow>();

                    foreach (var workFlowParameter in workFlowParameters)
                    {

                        foreach (var workProcess in workFlowDetails.WorkFlowProcess)
                        {
                            WorkFlow objWorkFlow = null;
                            int conditions = workProcess.WorkFlowLevels.Where(x => x.IsCondition == true).Count();
                            foreach (var workLevel in workProcess.WorkFlowLevels)
                            {
                                objWorkFlow = new WorkFlow();
                                if (workLevel.IsCondition)
                                {
                                    conditionCount += 1;
                                }

                                if (conditionCount > 1 && workLevel.IsCondition)
                                {
                                    isBeforeCondition = false;
                                }
                                if ((workLevel.IsCondition) || (isBeforeCondition))
                                {
                                    isBeforeCondition = true;
                                    if (conditions > 0)
                                    {
                                        if (isValid && !workLevel.IsCondition)
                                        {
                                            order++;
                                            objWorkFlow.ProcessId = processId;
                                            //objWorkFlow.WorkFlowOrder = workLevel.LevelIndex;
                                            objWorkFlow.WorkFlowOrder = order;
                                            objWorkFlow.ApproverUserId = workLevel.ApproverUserId;
                                            objWorkFlow.Status = "1";
                                            objWorkFlow.DocumentId = documentId;
                                            objWorkFlowList.Add(objWorkFlow);
                                        }

                                        if (workLevel.IsCondition)
                                        {
                                            if (Enum.TryParse(workLevel.FieldName, out filedNames))
                                            {
                                                switch (filedNames)
                                                {
                                                    case WorkFlowFieldNames.TotalAmount:
                                                        isNumerical = IsNumbersOnly(workFlowParameter.Value);
                                                        if (isNumerical)
                                                        {
                                                            isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowParameter.Value), workLevel.Operator);
                                                        }
                                                        break;
                                                    case WorkFlowFieldNames.CreditLimit:
                                                        isNumerical = IsNumbersOnly(workFlowParameter.Value);
                                                        if (isNumerical)
                                                        {
                                                            isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowParameter.Value), workLevel.Operator);
                                                        }
                                                        break;
                                                    case WorkFlowFieldNames.ItemQty:
                                                        isNumerical = IsNumbersOnly(Convert.ToString(workFlowParameter.ItemQuantity));
                                                        if (isNumerical)
                                                        {
                                                            isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowParameter.ItemQuantity), workLevel.Operator);
                                                        }
                                                        break;
                                                    case WorkFlowFieldNames.AssetQty:
                                                        isNumerical = IsNumbersOnly(Convert.ToString(workFlowParameter.ItemQuantity));
                                                        if (isNumerical)
                                                        {
                                                            isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowParameter.ItemQuantity), workLevel.Operator);
                                                        }
                                                        break;
                                                    case WorkFlowFieldNames.ItemCategory:
                                                        if (!string.IsNullOrEmpty(workFlowParameter.ItemCategory))
                                                        {
                                                            if (workLevel.Value.Trim().ToLower() == workFlowParameter.ItemCategory.Trim().ToLower())
                                                            {
                                                                isValid = true;
                                                            }
                                                        }
                                                        break;
                                                    case WorkFlowFieldNames.Unitprice:
                                                        isNumerical = IsNumbersOnly(workFlowParameter.UnitPrice);
                                                        if (isNumerical)
                                                        {
                                                            isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowParameter.UnitPrice), workLevel.Operator);
                                                        }
                                                        break;
                                                    case WorkFlowFieldNames.ContractSum:
                                                        isNumerical = IsNumbersOnly(workFlowParameter.Value);
                                                        if (isNumerical)
                                                        {
                                                            isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowParameter.Value), workLevel.Operator);
                                                        }
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            }

                                        }
                                    }
                                    else
                                    {
                                        order++;
                                        objWorkFlow.ProcessId = processId;
                                        //objWorkFlow.WorkFlowOrder = workLevel.LevelIndex;
                                        objWorkFlow.WorkFlowOrder = order;
                                        objWorkFlow.ApproverUserId = workLevel.ApproverUserId;
                                        objWorkFlow.Status = "1";
                                        objWorkFlow.DocumentId = documentId;
                                        objWorkFlowList.Add(objWorkFlow);
                                    }
                                }
                                else
                                {
                                    if (!isBeforeCondition)
                                    {
                                        order++;
                                        objWorkFlow.ProcessId = processId;
                                        //objWorkFlow.WorkFlowOrder = workLevel.LevelIndex;
                                        objWorkFlow.WorkFlowOrder = order;
                                        objWorkFlow.ApproverUserId = workLevel.ApproverUserId;
                                        objWorkFlow.Status = "1";
                                        objWorkFlow.DocumentId = documentId;
                                        objWorkFlowList.Add(objWorkFlow);
                                    }
                                }

                            }
                        }
                    }

                    if (objWorkFlowList != null)
                    {
                        if (objWorkFlowList.Count > 0)
                        {
                            approvalCount = objWorkFlowList.Count;
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var workFlow in objWorkFlowList)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@DocumentId", workFlow.DocumentId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ProcessId", workFlow.ProcessId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CompanyId", companyId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ApproverUserId", workFlow.ApproverUserId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@WorkFlowOrder", workFlow.WorkFlowOrder, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@WorkFlowStatusId", workFlow.Status, DbType.Int32, ParameterDirection.Input);
                                itemToAdd.Add(itemObj);
                            }
                            var workFlowStatus = dbTransactionObj.Connection.Execute("WorkFlow_CRUD", itemToAdd, transaction: dbTransactionObj, commandType: CommandType.StoredProcedure);

                        }
                    }
                }

                string procedureName = new SharedRepository().GetProcedureName(processId);

                int updateResult = 0;
                newWorkFlowStatusId = (objWorkFlowList == null || objWorkFlowList.Count() == 0) ? Convert.ToInt32(WorkFlowStatus.Approved) : workFlowStatusId;
                //string poCode = (newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress)) ? SharedRepository.GetProcessCode(processId) : null;
                poCode = SharedRepository.GetProcessCode(processId);
                if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo)
                    || processId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO)
                    || processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo)
                    || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed)
                    || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable))
                {
                    if (workFlowStatusId == Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval))
                    {
                        newWorkFlowStatusId = (objWorkFlowList == null || objWorkFlowList.Count() == 0) ? Convert.ToInt32(WorkFlowStatus.PreTerminate) : workFlowStatusId;
                        updateResult = dbTransactionObj.Connection.Execute("ContractPurchaseOrderItem_CRUD", new
                        {
                            Action = "VOIDRECORDAPPROVAL",
                            WorkFlowStatusId = newWorkFlowStatusId,
                            CPOID = documentId,
                            ReasonstoVoid = reasonsForVoid,
                            PoDate = terminationDate,
                            CreatedBy = createdBy,
                            CreatedDate = DateTime.Now,
                            ProcessId = processId
                        }, transaction: dbTransactionObj, commandType: CommandType.StoredProcedure);

                        poCode = dbTransactionObj.Connection.Query<string>("ContractPurchaseOrderItem_CRUD", new
                        {
                            Action = "GETCPOCODE",
                            CPOID = documentId,
                        }, transaction: dbTransactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                        //if (newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.PreTerminate))
                        //{
                        //    var update = dbConnectionObj.Execute("ContractPurchaseOrderItem_CRUD", new
                        //    {
                        //        Action = "VOIDFUTUREPOCID",
                        //        CPOID = documentId
                        //    },
                        //    transaction: dbTransactionObj, commandType: CommandType.StoredProcedure);
                        //}
                    }
                    else
                    {
                        poCode = dbTransactionObj.Connection.Query<string>("PoApproval_CRUD", new
                        {
                            Action = "UPDATE",
                            CompanyId = companyId,
                            WorkFlowStatusId = newWorkFlowStatusId,
                            PurchaseOrderId = documentId,
                            PoCode = poCode,
                            ProcessId = processId,
                            SentForApproval = true,
                            CurrentWorkflowStatusId = curWorkflowStatusId
                        }, transaction: dbTransactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();


                    }
                }
                else if (processId == Convert.ToInt32(WorkFlowProcessTypes.Supplier))
                {
                    string supCode = null;

                    if (approvalCount == 0 && newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                    {
                        supCode = SharedRepository.GetProcessCode(processId);
                    }

                    else if (newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                    {
                        supCode = SharedRepository.GetProcessCode(processId);
                    }

                    result = dbTransactionObj.Connection.Query<string>(procedureName, new
                    {
                        Action = "UPDATEWORKFLOWSTATUS",
                        WorkFlowStatusId = newWorkFlowStatusId,
                        CompanyId = companyId,
                        DocumentId = documentId,
                        DocumentCode = poCode,
                        ProcessId = processId,
                        ApprovalCount = approvalCount,
                        CoSupplierCode = CoSupplierCode,
                        SupCode = supCode //(newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress)) ? SharedRepository.GetProcessCode(processId) : null,
                    }, transaction: dbTransactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();

                    //poCode = $"{poCode}{"-" + result}";
                    poCode = $"{result}";
                }
                else if ((objWorkFlowList == null || objWorkFlowList.Count() == 0) && processId == Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice))
                {
                    newWorkFlowStatusId = (objWorkFlowList == null || objWorkFlowList.Count() == 0) ? Convert.ToInt32(WorkFlowStatus.Completed) : workFlowStatusId;
                    poCode = dbTransactionObj.Connection.Query<string>(procedureName, new
                    {
                        Action = "UPDATEWORKFLOWSTATUS",
                        WorkFlowStatusId = newWorkFlowStatusId,
                        CompanyId = companyId,
                        DocumentId = documentId,
                        DocumentCode = poCode,
                        ProcessId = processId,
                        //SupCode = (newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress)) ? SharedRepository.GetProcessCode(processId) : null,
                        SentForApproval = true
                    }, transaction: dbTransactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();


                    int statusUpdateResult = dbTransactionObj.Connection.Execute(procedureName, new
                    {
                        Action = "UPDATEGRNSTATUS",
                        InvoiceId = documentId,
                        WorkFlowStatusId = WorkFlowStatus.Invoiced,
                    }, transaction: dbTransactionObj,
                     commandType: CommandType.StoredProcedure);


                }
                //else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPaymentContract))
                //{

                //}

                else
                {
                    poCode = dbTransactionObj.Connection.Query<string>(procedureName, new
                    {
                        Action = "UPDATEWORKFLOWSTATUS",
                        WorkFlowStatusId = newWorkFlowStatusId,
                        CompanyId = companyId,
                        DocumentId = documentId,
                        DocumentCode = poCode,
                        ProcessId = processId,
                        //SupCode = (newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress)) ? SharedRepository.GetProcessCode(processId) : null,
                        SentForApproval = true
                    }, transaction: dbTransactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault();
                }

                if (updateResult > 0 && (newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))) //calculating stock on self approval basis
                {
                    if (processId == Convert.ToInt32(WorkFlowProcessTypes.SalesOrder))
                    {
                        var getSalesItemDetails = this.m_dbconnection.Query<GetItemDetails>("SalesOrder_CRUD", new
                        {
                            Action = "GETITEMSDETAILS",
                            SalesOrderId = documentId,
                        }, commandType: CommandType.StoredProcedure);

                        getItemDetails = getSalesItemDetails.ToList();
                        if (getItemDetails.Count > 0)
                        {
                            List<DynamicParameters> dynamicParameters = new List<DynamicParameters>();
                            foreach (var record in getItemDetails)
                            {
                                DynamicParameters dynamicObj = new DynamicParameters();
                                dynamicObj.AddDynamicParams(new
                                {
                                    Action = "INSERT",
                                    DocumentId = documentId,
                                    RecordId = record.DocumentId,
                                    ItemMasterId = record.ItemMasterId,
                                    StockIn = 0,
                                    StockOut = record.Quantity,
                                    CreatedBy = workFlowDetails.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                    UpdatedBy = workFlowDetails.UpdatedBy,
                                    UpdatedDate = DateTime.Now
                                });
                            }
                            int StockDetailId = this.m_dbconnection.QueryFirstOrDefault<int>("ItemStock_CRUD", dynamicParameters, transaction: dbTransactionObj,
                                                 commandType: CommandType.StoredProcedure);
                        }
                    }
                    else if ((processId == Convert.ToInt32(WorkFlowProcessTypes.LocationTransfer) && (newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))))
                    {
                        var locationTransferDetails = new LocationTransferRepository().GetLocationTransferDetails(documentId);
                        UserProfile sender = objUserRepository.GetUserById(locationTransferDetails.CreatedBy);
                        var value = new LocationTransferRepository().CreateItemMasterThrowLocationTransfer(locationTransferDetails, sender);
                    }
                    if (processId == Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes))
                    {
                        var goodsReturnedNotesDetails = new GoodsReturnedNotesRepository().GetGoodsReturnedNotesDetails(documentId);
                        UserProfile sender = objUserRepository.GetUserById(goodsReturnedNotesDetails.CreatedBy);
                        var value = new GoodsReturnedNotesRepository().IncreaseQuantity(goodsReturnedNotesDetails, sender);
                    }

                }


                dbTransactionObj.Commit();
            }
            catch (Exception e)
            {
                throw e;
            }

            if (objWorkFlowList != null && objWorkFlowList.Count > 0)
            {
                //sending purchase order request mail to first approver
                var workFlow = objWorkFlowList.Single(x => x.WorkFlowOrder == 1);

                if (workFlow.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPurchaseRequest)
                    || workFlow.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.AssetPurchaseRequest)
                    || workFlow.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPurchaseRequest))
                {
                    objPurchaseOrderRequestRepository = new PurchaseOrderRequestRepository();
                    objPurchaseOrderRequestRepository.SendPurchaseOrderRequestMail(workFlow.ApproverUserId, (int)workFlow.DocumentId, workFlow.ProcessId);
                }
                else if (workFlow.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo)
                    || workFlow.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO)
                    || workFlow.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed)
                    || workFlow.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable)
                    || workFlow.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo))
                {
                    PurchaseOrderCreationRepository purchaseOrderCreationObj = new PurchaseOrderCreationRepository();
                    purchaseOrderCreationObj.SendPurchaseOrderMail(workFlow.ApproverUserId, (int)workFlow.DocumentId, workFlow.ProcessId, newWorkFlowStatusId, companyId);
                }
                else if (workFlow.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.SalesOrder))
                {
                    SalesOrderRepository salesOrderObj = new SalesOrderRepository();
                    salesOrderObj.SendSalesOrderMail((int)workFlow.ApproverUserId, (int)workFlow.DocumentId, workFlow.ProcessId);
                }
                else
                {
                    SharedRepository sharedRepositoryObj = new SharedRepository();
                    sharedRepositoryObj.SendDocumentRequestMail((int)workFlow.ApproverUserId, (int)workFlow.DocumentId, workFlow.ProcessId, companyId);
                }


                #region inserting record in notification
                try
                {
                    NotificationsRepository notificationObj = new NotificationsRepository();
                    notificationObj.CreateNotification(new Notifications()
                    {

                        NotificationId = 0,
                        NotificationType = SharedRepository.GetNotificationType(processId),
                        NotificationMessage = SharedRepository.GetNotificationMessage(processId, newWorkFlowStatusId),
                        ProcessId = processId,
                        ProcessName = "",
                        DocumentId = documentId,
                        UserId = Convert.ToInt32(workFlow.ApproverUserId),
                        IsRead = false,
                        CreatedBy = workFlowParameters.Select(x => x.CreatedBy).FirstOrDefault(),
                        CreatedDate = DateTime.Now,
                        IsNew = true,
                        CompanyId = companyId,
                        CompanyName = "",
                        IsforAll = false,
                        MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                        //DocumentCode = workFlowParameters.Select(x => x.DocumentCode).FirstOrDefault()
                        DocumentCode = poCode
                    });

                }
                catch (Exception e)
                {
                    throw e;
                }
                #endregion
            }
            else
            {
                if ((newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) && (processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable)))
                {
                    var ContractDetails = new ContractPurchaseOrderRepository().GetContractPurchaseOrderDetails(Convert.ToString(documentId));
                    var GeneratePoc = new ContractPurchaseOrderRepository().GeneratePoc(ContractDetails);
                }
            }
            return objWorkFlowList;
        }

        public void UpdateWorkflowStatus(WorkFlowApproval workFlowApproval, IDbConnection m_dbconnection, IDbTransaction transaction)
        {
            var count = m_dbconnection.Query<int>("WorkFlow_CRUD", new
            {
                Action = "UPDATE_WF_STATUS",
                DocumentId = workFlowApproval.DocumentId,
                CompanyId = workFlowApproval.CompanyId,
                ProcessId = workFlowApproval.ProcessId,
                ApproverUserId = workFlowApproval.ApproverUserId,
                WorkFlowStatusId = workFlowApproval.WorkFlowStatusId
            }, transaction, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        public void SetDocumentPendingStatus(WorkFlowApproval workFlowApproval, IDbConnection m_dbconnection, IDbTransaction transaction)
        {
            var count = m_dbconnection.Execute("WorkFlow_CRUD", new
            {
                Action = "SET_PENDING",
                //DocumentId = workFlowApproval.DocumentId,
                //CompanyId = workFlowApproval.CompanyId,
                //ProcessId = workFlowApproval.ProcessId,
                WorkFlowId = workFlowApproval.WorkflowId,
                //WorkFlowOrder = workFlowApproval.WorkFlowOrder,
                //ApproverUserId = workFlowApproval.NextApproverUserId
            }, transaction, commandType: CommandType.StoredProcedure);
        }

        public List<WorkFlow> GetDocumentWFUsers(WorkFlowApproval workFlowApprovals, IDbConnection m_dbconnection, IDbTransaction transaction)
        {
            return m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
            {
                Action = "SELECT_DOC_WF",
                DocumentId = workFlowApprovals.DocumentId,
                CompanyId = workFlowApprovals.CompanyId,
                ProcessId = workFlowApprovals.ProcessId
            }, transaction: transaction, commandType: CommandType.StoredProcedure).ToList();
        }

        public bool CheckIsWFVerifier(int companyId, int processId, int locationId, int UserId)
        {
            bool isWFVerifier = false;
            string pageName = Enum.GetName(typeof(WorkFlowProcessTypes), processId);
            isWFVerifier = this.m_dbconnection.ExecuteScalar<bool>("WorkFlow_CRUD", new
            {
                Action = "IS_WF_VERIFIER",
                LocationId = locationId,
                CompanyId = companyId,
                ApproverUserId = UserId,
                ProcessId = processId,
                PageName = pageName
            }, commandType: CommandType.StoredProcedure);
            return isWFVerifier;
        }

        public int CreateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration)
        {
            int configurationId = 0;
            int workFlowProcessId = 0;
            int workFlowLevelId = 0;
            try
            {
                this.m_dbconnection.Open();

                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        configurationId = transaction.Connection.Query<int>("WorkFlowConfiguration_CRUD",
                           new
                           {
                               Action = "INSERT",
                               WorkFlowConfigurationID = workFlowConfiguration.WorkFlowConfigurationId,
                               CompanyId = workFlowConfiguration.CompanyId,
                               LocationID = workFlowConfiguration.LocationID,
                               WorkFlowName = workFlowConfiguration.WorkFlowName,
                               ProcessId = workFlowConfiguration.ProcessId,
                               IsFollowWorkflow = workFlowConfiguration.IsFollowWorkflow,
                               //IsDeleted = workFlowConfiguration.IsDeleted,
                               CreatedBy = workFlowConfiguration.CreatedBy,
                               CreatedDate = DateTime.Now,
                               UpdatedBy = workFlowConfiguration.UpdatedBy,
                               UpdatedDate = DateTime.Now

                           },
                           transaction: transaction,
                           commandType: CommandType.StoredProcedure).FirstOrDefault();

                        if (configurationId > 0)
                        {
                            foreach (WorkFlowProcessLevel workFlowProcessLevel in workFlowConfiguration.WorkFlowProcess)
                            {
                                workFlowProcessId = transaction.Connection.Query<int>("WorkFlowProcessLevel_CRUD",
                                 new
                                 {
                                     Action = "INSERT",
                                     WorkFlowConfigurationId = configurationId,
                                     LevelOrder = workFlowProcessLevel.LevelOrder,
                                     ProcessIndex = workFlowProcessLevel.ProcessIndex
                                 },
                                 transaction: transaction,
                                 commandType: CommandType.StoredProcedure).FirstOrDefault();


                                if (workFlowProcessId > 0)
                                {
                                    foreach (WorkFlowLevel workFlowLevel in workFlowProcessLevel.WorkFlowLevels)
                                    {
                                        workFlowLevelId = transaction.Connection.Query<int>("WorkFlowLevel_CRUD",
                                        new
                                        {
                                            Action = "INSERT",
                                            WorkFlowProcessId = workFlowProcessId,
                                            FieldName = workFlowLevel.FieldName,
                                            Operator = workFlowLevel.Operator,
                                            Value = workFlowLevel.Value,
                                            ApproverUserId = workFlowLevel.ApproverUserId,
                                            RoleID = workFlowLevel.RoleID,
                                            IsCondition = workFlowLevel.IsCondition,
                                            LevelIndex = workFlowLevel.LevelIndex,
                                            CreatedBy = workFlowLevel.CreatedBy,
                                            CreatedDate = DateTime.Now,
                                        },
                                        transaction: transaction,
                                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                                    }
                                }
                            }

                            transaction.Commit();
                        }

                        return configurationId;
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

        public int UpdateWorkFlowConfiguration(WorkFlowConfiguration workFlowConfiguration)
        {
            try
            {
                int workFlowProcessId = 0;
                int workFlowLevelId = 0;

                this.m_dbconnection.Open();

                using (var transaction = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        int recordsEffected = transaction.Connection.Query<int>("WorkFlowConfiguration_CRUD",
                           new
                           {
                               Action = "UPDATE",
                               WorkFlowConfigurationId = workFlowConfiguration.WorkFlowConfigurationId,
                               CompanyId = workFlowConfiguration.CompanyId,
                               LocationID = workFlowConfiguration.LocationID,
                               WorkFlowName = workFlowConfiguration.WorkFlowName,
                               IsFollowWorkflow = workFlowConfiguration.IsFollowWorkflow,
                               ProcessId = workFlowConfiguration.ProcessId,
                               IsDeleted = workFlowConfiguration.IsDeleted,
                               UpdatedBy = workFlowConfiguration.UpdatedBy,
                               UpdatedDate = DateTime.Now,

                           },
                            transaction: transaction,
                           commandType: CommandType.StoredProcedure).FirstOrDefault();

                        List<DynamicParameters> parameters = new List<DynamicParameters>();

                        if (recordsEffected > 0)
                        {
                            foreach (WorkFlowProcessLevel workFlowProcessLevel in workFlowConfiguration.WorkFlowProcess)
                            {
                                if (workFlowProcessLevel.WorkFlowProcessId > 0)
                                {
                                    if (workFlowProcessLevel.IsDeleted)
                                    {
                                        foreach (WorkFlowLevel workFlowLevel in workFlowProcessLevel.WorkFlowLevels)
                                        {
                                            if (workFlowLevel.WorkFlowLevelId > 0)
                                            {
                                                if (workFlowLevel.IsDeleted)
                                                {
                                                    recordsEffected = transaction.Connection.Query<int>("WorkFlowLevel_CRUD",
                                                    new
                                                    {
                                                        Action = "DELETE",
                                                        WorkFlowLevelId = workFlowLevel.WorkFlowLevelId
                                                    },
                                                    transaction: transaction,
                                                    commandType: CommandType.StoredProcedure).FirstOrDefault();
                                                }
                                            }
                                        }

                                        recordsEffected = transaction.Connection.Query<int>("WorkFlowProcessLevel_CRUD",
                                           new
                                           {
                                               Action = "DELETE",
                                               WorkFlowProcessId = workFlowProcessLevel.WorkFlowProcessId
                                           },
                                           transaction: transaction,
                                           commandType: CommandType.StoredProcedure).FirstOrDefault();
                                    }

                                    else
                                    {
                                        recordsEffected = transaction.Connection.Query<int>("WorkFlowProcessLevel_CRUD",
                                           new
                                           {
                                               Action = "UPDATE",
                                               WorkFlowProcessId = workFlowProcessLevel.WorkFlowProcessId,
                                               WorkFlowConfigurationId = workFlowProcessLevel.WorkFlowConfigurationId,
                                               LevelOrder = workFlowProcessLevel.LevelOrder,
                                               ProcessIndex = workFlowProcessLevel.ProcessIndex
                                           },
                                           transaction: transaction,
                                           commandType: CommandType.StoredProcedure).FirstOrDefault();


                                        if (recordsEffected > 0)
                                        {
                                            foreach (WorkFlowLevel workFlowLevel in workFlowProcessLevel.WorkFlowLevels)
                                            {
                                                if (workFlowLevel.WorkFlowLevelId > 0)
                                                {
                                                    if (workFlowLevel.IsDeleted)
                                                    {
                                                        recordsEffected = transaction.Connection.Query<int>("WorkFlowLevel_CRUD",
                                                        new
                                                        {
                                                            Action = "DELETE",
                                                            WorkFlowLevelId = workFlowLevel.WorkFlowLevelId
                                                        },
                                                        transaction: transaction,
                                                        commandType: CommandType.StoredProcedure).FirstOrDefault();
                                                    }
                                                    else
                                                    {
                                                        workFlowLevelId = transaction.Connection.Query<int>("WorkFlowLevel_CRUD",
                                                      new
                                                      {
                                                          Action = "UPDATE",
                                                          WorkFlowLevelId = workFlowLevel.WorkFlowLevelId,
                                                          WorkFlowProcessId = workFlowLevel.WorkFlowProcessId,
                                                          FieldName = workFlowLevel.FieldName,
                                                          Operator = workFlowLevel.Operator,
                                                          Value = workFlowLevel.Value,
                                                          ApproverUserId = workFlowLevel.ApproverUserId,
                                                          RoleID = workFlowLevel.RoleID,
                                                          IsCondition = workFlowLevel.IsCondition,
                                                          LevelIndex = workFlowLevel.LevelIndex,
                                                          UpdatedBy = workFlowConfiguration.UpdatedBy,
                                                          UpdatedDate = DateTime.Now,
                                                      },
                                                      transaction: transaction,
                                                      commandType: CommandType.StoredProcedure).FirstOrDefault();
                                                    }
                                                }
                                                else
                                                {
                                                    workFlowLevelId = transaction.Connection.Query<int>("WorkFlowLevel_CRUD",
                                                    new
                                                    {
                                                        Action = "INSERT",
                                                        WorkFlowProcessId = workFlowProcessLevel.WorkFlowProcessId,
                                                        FieldName = workFlowLevel.FieldName,
                                                        Operator = workFlowLevel.Operator,
                                                        Value = workFlowLevel.Value,
                                                        ApproverUserId = workFlowLevel.ApproverUserId,
                                                        RoleID = workFlowLevel.RoleID,
                                                        IsCondition = workFlowLevel.IsCondition,
                                                        LevelIndex = workFlowLevel.LevelIndex,
                                                        CreatedBy = workFlowLevel.CreatedBy,
                                                        CreatedDate = DateTime.Now,
                                                    },
                                                    transaction: transaction,
                                                    commandType: CommandType.StoredProcedure).FirstOrDefault();
                                                }
                                            }
                                        }
                                    }

                                }
                                else
                                {
                                    workFlowProcessId = transaction.Connection.Query<int>("WorkFlowProcessLevel_CRUD",
                                        new
                                        {
                                            Action = "INSERT",
                                            WorkFlowConfigurationId = workFlowConfiguration.WorkFlowConfigurationId,
                                            LevelOrder = workFlowProcessLevel.LevelOrder,
                                            ProcessIndex = workFlowProcessLevel.ProcessIndex
                                        },
                                        transaction: transaction,
                                        commandType: CommandType.StoredProcedure).FirstOrDefault();


                                    if (workFlowProcessId > 0)
                                    {
                                        foreach (WorkFlowLevel workFlowLevel in workFlowProcessLevel.WorkFlowLevels)
                                        {
                                            if (workFlowLevel.FieldName != null || workFlowLevel.ApproverUserId != null)
                                            {
                                                workFlowLevelId = transaction.Connection.Query<int>("WorkFlowLevel_CRUD",
                                                new
                                                {
                                                    Action = "INSERT",
                                                    WorkFlowProcessId = workFlowProcessId,
                                                    FieldName = workFlowLevel.FieldName,
                                                    Operator = workFlowLevel.Operator,
                                                    Value = workFlowLevel.Value,
                                                    ApproverUserId = workFlowLevel.ApproverUserId,
                                                    RoleID = workFlowLevel.RoleID,
                                                    IsCondition = workFlowLevel.IsCondition,
                                                    LevelIndex = workFlowLevel.LevelIndex,
                                                    CreatedBy = workFlowLevel.CreatedBy,
                                                    CreatedDate = DateTime.Now,
                                                },
                                                transaction: transaction,
                                                commandType: CommandType.StoredProcedure).FirstOrDefault();
                                            }

                                        }
                                    }
                                }


                            }

                            transaction.Commit();
                        }

                        return recordsEffected;
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

        public void DeleteDocumentWorkflow(WorkFlowApproval workFlowApprovals, IDbConnection m_dbconnection, IDbTransaction transaction)
        {
            m_dbconnection.Execute("WorkFlow_CRUD", new
            {
                Action = "DELETE_DOC_WF",
                DocumentId = workFlowApprovals.DocumentId,
                ProcessId = workFlowApprovals.ProcessId,
                CompanyId = workFlowApprovals.CompanyId
            }, transaction, commandType: CommandType.StoredProcedure);
        }

        public int CreateWorkFlowResponse(WorkFlowResponse workFlowResponse)
        {
            try
            {
                return this.m_dbconnection.Query<int>("WorkFlowResponse_CRUD",
                new
                {
                    Action = "INSERT",
                    WorkFlowApproversID = workFlowResponse.WorkFlowApproversID,
                    ApproverResponse = workFlowResponse.ApproverResponse,
                    ApproverRemarks = workFlowResponse.ApproverRemarks

                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw new InternalServerException(ex.ToString());
            }
        }

        public int UpdateWorkFlowResponse(WorkFlowResponse workFlowResponse)
        {
            try
            {
                return this.m_dbconnection.Query<int>("WorkFlowResponse_CRUD",
               new
               {
                   Action = "UPDATE",
                   WorkFlowResponseID = workFlowResponse.WorkFlowResponseID,
                   WorkFlowApproversID = workFlowResponse.WorkFlowApproversID,
                   ApproverResponse = workFlowResponse.ApproverResponse,
                   ApproverRemarks = workFlowResponse.ApproverRemarks

               }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw new InternalServerException(ex.ToString());
            }
        }

        public bool DeleteWorkFlowConfiguration(int configId)
        {

            var count = m_dbconnection.Query<int>(
                "delete from WorkFlowLevel where WorkFlowProcessId in (select WorkFlowProcessId from WorkFlowProcessLevel where WorkFlowConfigurationId=@WorkFlowConfigurationId);delete from WorkFlowProcessLevel where WorkFlowConfigurationId = @WorkFlowConfigurationId", new
                {
                    WorkFlowConfigurationId = configId
                });


            return true;
        }

        public bool CompareConditon(double dbvalue, double value, string conditionOperator)
        {
            bool result = false;
            switch (conditionOperator)
            {
                case "<":
                    if (value < dbvalue)
                    {
                        result = true;
                    }
                    break;
                case "==":
                    if (dbvalue == value)
                    {
                        result = true;
                    }
                    break;
                case ">":
                    if (value > dbvalue)
                    {
                        result = true;
                    }
                    break;
                case "<=":
                    if (value <= dbvalue)
                    {
                        result = true;
                    }
                    break;
                case ">=":
                    if (value >= dbvalue)
                    {
                        result = true;
                    }
                    break;
                case "!=":
                    if (value != dbvalue)
                    {
                        result = true;
                    }

                    break;
            }


            return result;
        }

        /// <summary>
        /// Returns true only if string is wholy comprised of numerical digits
        /// </summary>
        private bool IsNumbersOnly(string s)
        {
            if (s == null || s == string.Empty)
                return false;

            try
            {
                double number = 0;
                if (double.TryParse(s, out number))
                {
                    return true;
                }
            }
            catch (Exception ex)
            {

                return false;
            }

            foreach (char c in s)
            {
                if (c == '.')
                {
                    continue;
                }
                if (c < '0' || c > '9') // Avoid using .IsDigit or .IsNumeric as they will return true for other characters
                    return false;
            }

            return true;
        }

        public IEnumerable<WorkFlow> GetWorkFlowApprovers(WorkFlowParameter workFlowData)
        {
            UserProfileRepository objUserRepository = new UserProfileRepository();
            List<GetItemDetails> getItemDetails = new List<GetItemDetails>();
            List<WorkFlow> objWorkFlowList = null;
            bool isValid = false;
            int conditionCount = 0;
            try
            {
                WorkFlowFieldNames filedNames;
                bool isNumerical = false;
                var workFlowDetails = GetWorkFlowConfiguration(workFlowData.ProcessId, workFlowData.CompanyId, workFlowData.LocationId);
                int order = 0;
                bool isBeforeCondition = false;
                WorkFlow objWorkFlow = null;
                if (workFlowDetails != null)
                {
                    objWorkFlowList = new List<WorkFlow>();

                    foreach (var workProcess in workFlowDetails.WorkFlowProcess)
                    {

                        int conditions = workProcess.WorkFlowLevels.Where(x => x.IsCondition == true).Count();
                        foreach (var workLevel in workProcess.WorkFlowLevels)
                        {
                            objWorkFlow = new WorkFlow();
                            objWorkFlow.IsCreditLimit = false;
                            if (workLevel.IsCondition)
                            {
                                conditionCount += 1;
                            }

                            if (conditionCount > 1 && workLevel.IsCondition)
                            {
                                isBeforeCondition = false;
                            }
                            if ((workLevel.IsCondition) || (isBeforeCondition))
                            {
                                isBeforeCondition = true;
                                if (conditions > 0)
                                {
                                    if (isValid && !workLevel.IsCondition)
                                    {
                                        order++;
                                        objWorkFlow.ProcessId = workFlowData.ProcessId;
                                        objWorkFlow.WorkFlowOrder = order;
                                        objWorkFlow.ApproverUserId = workLevel.ApproverUserId;
                                        objWorkFlow.Status = "1";
                                        objWorkFlow.DocumentId = workFlowData.DocumentId;
                                        objWorkFlow.IsVerifier = workLevel.IsVerifier;
                                        objWorkFlowList.Add(objWorkFlow);
                                    }

                                    if (workLevel.IsCondition)
                                    {
                                        if (Enum.TryParse(workLevel.FieldName, out filedNames))
                                        {
                                            switch (filedNames)
                                            {
                                                case WorkFlowFieldNames.TotalAmount:
                                                    isNumerical = IsNumbersOnly(workFlowData.Value);
                                                    if (isNumerical)
                                                    {
                                                        isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowData.Value), workLevel.Operator);
                                                    }
                                                    break;
                                                case WorkFlowFieldNames.ContractSum:
                                                    isNumerical = IsNumbersOnly(workFlowData.Value);
                                                    if (isNumerical)
                                                    {
                                                        isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowData.Value), workLevel.Operator);
                                                    }
                                                    break;
                                                case WorkFlowFieldNames.CreditLimit:
                                                    isNumerical = IsNumbersOnly(workFlowData.Value);
                                                    if (isNumerical)
                                                    {
                                                        isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowData.Value), workLevel.Operator);
                                                        if (isValid)
                                                        {
                                                            objWorkFlow.IsCreditLimit = true;
                                                        }
                                                    }
                                                    break;
                                                case WorkFlowFieldNames.ItemQty:
                                                    isNumerical = IsNumbersOnly(Convert.ToString(workFlowData.ItemQuantity));
                                                    if (isNumerical)
                                                    {
                                                        isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowData.ItemQuantity), workLevel.Operator);
                                                    }
                                                    break;
                                                case WorkFlowFieldNames.AssetQty:
                                                    isNumerical = IsNumbersOnly(Convert.ToString(workFlowData.ItemQuantity));
                                                    if (isNumerical)
                                                    {
                                                        isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowData.ItemQuantity), workLevel.Operator);
                                                    }
                                                    break;
                                                case WorkFlowFieldNames.ItemCategory:
                                                    if (!string.IsNullOrEmpty(workFlowData.ItemCategory))
                                                    {
                                                        if (workLevel.Value.Trim().ToLower() == workFlowData.ItemCategory.Trim().ToLower())
                                                        {
                                                            isValid = true;
                                                        }
                                                    }
                                                    break;
                                                case WorkFlowFieldNames.Unitprice:
                                                    isNumerical = IsNumbersOnly(workFlowData.UnitPrice);
                                                    if (isNumerical)
                                                    {
                                                        isValid = CompareConditon(double.Parse(workLevel.Value), double.Parse(workFlowData.UnitPrice), workLevel.Operator);
                                                    }
                                                    break;
                                                default:
                                                    break;
                                            }
                                        }

                                    }
                                }
                                else
                                {
                                    order++;
                                    objWorkFlow.ProcessId = workFlowData.ProcessId;
                                    objWorkFlow.WorkFlowOrder = order;
                                    objWorkFlow.ApproverUserId = workLevel.ApproverUserId;
                                    objWorkFlow.Status = "1";
                                    objWorkFlow.DocumentId = workFlowData.DocumentId;
                                    objWorkFlow.IsVerifier = workLevel.IsVerifier;
                                    objWorkFlowList.Add(objWorkFlow);
                                }

                            }
                            else
                            {
                                if (!isBeforeCondition)
                                {
                                    order++;
                                    objWorkFlow.ProcessId = workFlowData.ProcessId;
                                    objWorkFlow.WorkFlowOrder = order;
                                    objWorkFlow.ApproverUserId = workLevel.ApproverUserId;
                                    objWorkFlow.Status = "1";
                                    objWorkFlow.DocumentId = workFlowData.DocumentId;
                                    objWorkFlow.IsVerifier = workLevel.IsVerifier;
                                    objWorkFlowList.Add(objWorkFlow);
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }

            return objWorkFlowList;
        }
    }
}

