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
using UELPM.Service.Exceptions;

namespace UELPM.Service.Repositories
{
    public class PurchaseOrderApprovalRepository : IPurchaseOrderApprovalRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        /*
            this method is used to get the list of purchase orders for approval....... 
        */
        public PurchaseOrderDisplayResult GetPurchaseOrdersForApproval(GridDisplayInput purchaseOrderInput)
        {
            try
            {
                PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("PoApproval_CRUD", new
                {

                    Action = "SELECT",
                    Skip = purchaseOrderInput.Skip,
                    Take = purchaseOrderInput.Take,
                    CompanyId = purchaseOrderInput.CompanyId,
                    ApproverUserId = purchaseOrderInput.UserId,
                    InventoryPOProcessId = WorkFlowProcessTypes.InventoryPo,
                    FixedAssetPOProcessId = WorkFlowProcessTypes.FixedAssetPO,
                    ContractPOProcessId = WorkFlowProcessTypes.ContractPOFixed,
                    ContractPoVariableProcessId = WorkFlowProcessTypes.ContractPOVariable,
                    ExpensePoProcessId = WorkFlowProcessTypes.ExpensesPo
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of purchase orders..
                    purchaseOrderDisplayResult.PurchaseOrders = result.Read<PurchaseOrderList>().AsList();
                    //total number of purchase orders
                    purchaseOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return purchaseOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
         this method is used to get the list of purchase orders for approval based on search....... 
       */
        public PurchaseOrderDisplayResult SearchPurchaseOrdersForApproval(PurchaseOrderSearch purchaseOrderInput)
        {
            try
            {
                PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();
                string poApprovalQuery = "";
                string inventoryPoQuery = "";
                string fixedAssetPoQuery = "";
                string contractPoQuery = "";
                string unionQuery = "";
                string expenseQuery = "";
                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo) || purchaseOrderInput.WorkFlowProcessId == 0)
                {
                    inventoryPoQuery = @"  ( 
                                                select 
                                                   PO.PurchaseOrderCode, 
                                                   PO.PurchaseOrderId, 
                                                   PO.DraftCode,
                                                   WF.IsApproved AS IsDocumentApproved,                                                
                                                   S.SupplierName, 
                                                   PO.POTypeId, 
                                                   PO.WorkFlowStatusId,
                                                   PO.UpdatedDate, 
                                                   PO.CreatedBy 
                                              from
                                                dbo.PurchaseOrder as PO 
                                                join dbo.Supplier  as S
                                                on 
                                                PO.Supplierid = S.SupplierId
                                                join dbo.PurchaseOrderTypes as POT 
                                                on 
                                                PO.POTypeId = POT.PurchaseOrderTypeId 
                                                join WorkFlowStatus as WF 
                                                on 
                                                PO.WorkFlowStatusId = WF.WorkFlowStatusId 
                                                where 
                                            PO.Isdeleted = 0 ";

                    if (purchaseOrderInput.CompanyId > 0)
                    {
                        inventoryPoQuery += " and PO.CompanyId=@CompanyId  ";
                    }

                    if (purchaseOrderInput.POTypeId > 0)
                    {
                        inventoryPoQuery += "and PO.POTypeId=@POTypeId ";
                    }

                    if (purchaseOrderInput.PurchaseOrderId > 0)
                    {
                        inventoryPoQuery += " and PO.PurchaseOrderId=@PurchaseOrderId";
                    }

                    if (purchaseOrderInput.PoCode != "" && purchaseOrderInput.PoCode != null && purchaseOrderInput.PoCode != "null")
                    {
                        inventoryPoQuery += @" and ( 
                                                      PO.PurchaseOrderCode LIKE concat('%',@PoCode,'%') 
                                                      or
                                                      PO.DraftCode LIKE concat('%',@PoCode,'%')
                                                    ) 
                                                     ";

                    }
                    if (purchaseOrderInput.SupplierName != "" && purchaseOrderInput.SupplierName != null && purchaseOrderInput.SupplierName != "null")
                    {
                        inventoryPoQuery += @" and ( 
                                                      S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                                    ) 
                                                   ";

                    }
                    else if (purchaseOrderInput.Search != null)
                    {
                        inventoryPoQuery += @" and ( 
                                              PO.PurchaseOrderCode LIKE concat('%',@Search,'%') 
                                              or
                                              PO.DraftCode LIKE concat('%',@Search,'%')
                                              or 
                                              S.SupplierName LIKE concat('%',@Search,'%') 
                                           )   ";
                    }
                    inventoryPoQuery += $" and PO.PurchaseOrderId in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@ApproverUserId,str(@InventoryPOProcessId)) ) )  ";
                }

                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO) || purchaseOrderInput.WorkFlowProcessId == 0)
                {

                    fixedAssetPoQuery = @" ( select 
                                              PO.FixedAssetPurchaseOrderCode as PurchaseOrderCode, 
                                              PO.FixedAssetPurchaseOrderId as PurchaseOrderId,
                                              PO.DraftCode,
                                              WF.IsApproved AS IsDocumentApproved,
                                              S.SupplierName,
                                              PO.POTypeId, 
                                              PO.WorkFlowStatusId,
                                              PO.UpdatedDate,
                                              PO.CreatedBy
                                        from 
                                            dbo.FixedAssetPurchaseOrder as PO 
                                        join dbo.Supplier as S 
                                            on 
                                             PO.Supplierid = S.SupplierId 
                                       join dbo.PurchaseOrderTypes as POT 
                                              on 
                                              PO.POTypeId = POT.PurchaseOrderTypeId
                                       join WorkFlowStatus as WF 
                                                on 
                                                PO.WorkFlowStatusId = WF.WorkFlowStatusId 
                                        where 
                                             PO.Isdeleted = 0 ";

                    if (purchaseOrderInput.CompanyId > 0)
                    {
                        fixedAssetPoQuery += "and PO.CompanyId=@CompanyId  ";
                    }

                    if (purchaseOrderInput.POTypeId > 0)
                    {
                        fixedAssetPoQuery += " and PO.POTypeId=@POTypeId  ";
                    }
                    if (purchaseOrderInput.PurchaseOrderId > 0)
                    {
                        fixedAssetPoQuery += " and PO.FixedAssetPurchaseOrderId=@PurchaseOrderId ";
                    }

                    if (purchaseOrderInput.PoCode != "" && purchaseOrderInput.PoCode != null && purchaseOrderInput.PoCode != "null")
                    {
                        fixedAssetPoQuery += @" and ( 
                                                      PO.FixedAssetPurchaseOrderCode LIKE concat('%',@PoCode,'%') 
                                                      or
                                                      PO.DraftCode LIKE concat('%',@PoCode,'%')
                                                    ) 
                                                      ";
                    }
                    if (purchaseOrderInput.SupplierName != "" && purchaseOrderInput.SupplierName != null && purchaseOrderInput.SupplierName != "null")
                    {
                        fixedAssetPoQuery += @" and ( 
                                                      S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                                    ) 
                                                     ";
                    }
                    else if (purchaseOrderInput.Search != null)
                    {
                        fixedAssetPoQuery += @" and ( 
                                                 PO.FixedAssetPurchaseOrderCode LIKE concat('%',@Search,'%')
                                                 or
                                                 PO.DraftCode LIKE concat('%',@Search,'%')
                                                 or
                                                 S.SupplierName LIKE concat('%',@Search,'%') 
                                               )   ";
                    }
                    fixedAssetPoQuery += $" and PO.FixedAssetPurchaseOrderId in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@ApproverUserId,str(@FixedAssetPOProcessId)) ) ) ";
                }

                if ((purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable) || purchaseOrderInput.WorkFlowProcessId == 0))
                {

                    contractPoQuery = @" (  select 
                                                 PO.CPONumber as PurchaseOrderCode, 
                                                 PO.CPOID as PurchaseOrderId,
                                                 PO.DraftCode,
                                                 WF.IsApproved AS IsDocumentApproved,
                                                 S.SupplierName,
                                                 PO.POTypeId, 
                                                 PO.WorkFlowStatusId, 
                                                 PO.UpdatedDate, 
                                                 PO.CreatedBy
                                            from 
                                                dbo.ContractPurchaseOrder as PO
                                            join dbo.Supplier as S 
                                                on 
                                                 PO.Supplierid = S.SupplierId 
                                            join dbo.PurchaseOrderTypes as POT 
                                                 on  
                                                 PO.POTypeId = POT.PurchaseOrderTypeId
                                            join WorkFlowStatus as WF 
                                                on 
                                                PO.WorkFlowStatusId = WF.WorkFlowStatusId 
                                            where
                                                PO.Isdeleted = 0  ";

                    if (purchaseOrderInput.CompanyId > 0)
                    {
                        contractPoQuery += "and PO.CompanyId=@CompanyId  ";
                    }
                    if (purchaseOrderInput.POTypeId > 0)
                    {
                        contractPoQuery += " and PO.POTypeId=@POTypeId  ";
                    }

                    if (purchaseOrderInput.PurchaseOrderId > 0)
                    {
                        contractPoQuery += " and PO.CPOID=@PurchaseOrderId ";
                    }
                    if (purchaseOrderInput.PoCode != "" && purchaseOrderInput.PoCode != null && purchaseOrderInput.PoCode != "null")
                    {
                        contractPoQuery += @" and ( 
                                                      PO.CPONumber LIKE concat('%',@PoCode,'%') 
                                                      or
                                                      PO.DraftCode LIKE concat('%',@PoCode,'%')
                                                    ) 
                                                      ";
                    }
                    if (purchaseOrderInput.SupplierName != "" && purchaseOrderInput.SupplierName != null && purchaseOrderInput.SupplierName != "null")
                    {
                        contractPoQuery += @" and ( 
                                                      S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                                    ) 
                                                     ";
                    }

                    else if (purchaseOrderInput.Search != null)
                    {
                        contractPoQuery += @" and  ( 
                                                 PO.CPONumber LIKE concat('%',@Search,'%') 
                                                 or
                                                 PO.DraftCode LIKE concat('%',@Search,'%')
                                                 or 
                                                 S.SupplierName LIKE concat('%',@Search,'%')
                                              )   ";
                    }
                    contractPoQuery += $" and PO.CPOID in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@ApproverUserId,@contractPoProcessIds) ) )  ";
                }

                if ((purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo) || purchaseOrderInput.WorkFlowProcessId == 0))
                {

                    expenseQuery = @" (  select
					                            PO.ExpensesPurchaseOrderCode as PurchaseOrderCode,
					                            PO.ExpensesPurchaseOrderId as PurchaseOrderId,
                                                PO.DraftCode,
                                                WF.IsApproved AS IsDocumentApproved,
					                            S.SupplierName,
					                            PO.POTypeId,
					                            PO.WorkFlowStatusId,
					                            PO.UpdatedDate,
                                                PO.CreatedBy 
				                            from
					                            dbo.ExpensesPurchaseOrder as PO
				                            join dbo.Supplier  as S
					                            on
					                            PO.Supplierid = S.SupplierId
				                            join dbo.PurchaseOrderTypes as POT
					                             on
					                             PO.POTypeId = POT.PurchaseOrderTypeId
                                            join WorkFlowStatus as WF 
                                                on 
                                                PO.WorkFlowStatusId = WF.WorkFlowStatusId 
				                            where
					                            PO.Isdeleted=0   ";

                    if (purchaseOrderInput.CompanyId > 0)
                    {
                        expenseQuery += " and PO.CompanyId = @CompanyId  ";
                    }
                    if (purchaseOrderInput.POTypeId > 0)
                    {
                        expenseQuery += " and  PO.POTypeId=@POTypeId   ";
                    }

                    if (purchaseOrderInput.PurchaseOrderId > 0)
                    {
                        expenseQuery += " and PO.ExpensesPurchaseOrderId = @PurchaseOrderId ";
                    }
                    if (purchaseOrderInput.PoCode != "" && purchaseOrderInput.PoCode != null && purchaseOrderInput.PoCode != "null")
                    {
                        expenseQuery += @" and ( 
                                                      PO.ExpensesPurchaseOrderCode LIKE concat('%',@PoCode,'%') 
                                                      or
                                                      PO.DraftCode LIKE concat('%',@PoCode,'%')
                                                    ) 
                                                      ";
                    }
                    if (purchaseOrderInput.SupplierName != "" && purchaseOrderInput.SupplierName != null && purchaseOrderInput.SupplierName != "null")
                    {
                        expenseQuery += @" and ( 
                                                      S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                                    ) 
                                                     ";
                    }


                    else if (purchaseOrderInput.Search != null)
                    {
                        expenseQuery += @" and  ( 
                                                 PO.ExpensesPurchaseOrderCode LIKE concat('%',@Search,'%')
                                                 or
                                                 PO.DraftCode LIKE concat('%',@Search,'%')
                                                 or 
                                                 S.SupplierName LIKE concat('%',@Search,'%')
                                           )   ";
                    }
                    expenseQuery += $" and PO.ExpensesPurchaseOrderId in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@ApproverUserId,str(@ExpensePoProcessId)) ) ) ";
                }

                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo) || purchaseOrderInput.WorkFlowProcessId == 0)
                {
                    unionQuery += inventoryPoQuery;
                    if (purchaseOrderInput.WorkFlowProcessId == 0)
                    {
                        unionQuery += "  UNION ALL ";
                    }
                }
                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO) || purchaseOrderInput.WorkFlowProcessId == 0)
                {
                    unionQuery += fixedAssetPoQuery;
                    if (purchaseOrderInput.WorkFlowProcessId == 0)
                    {
                        unionQuery += "  UNION ALL ";
                    }
                }
                if ((purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable) || purchaseOrderInput.WorkFlowProcessId == 0) && purchaseOrderInput.From != "SupplierInvoice")
                {
                    unionQuery += contractPoQuery;
                    if (purchaseOrderInput.WorkFlowProcessId == 0 && purchaseOrderInput.From != "SupplierInvoice")
                    {
                        unionQuery += "  UNION ALL ";
                    }
                }
                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo) || purchaseOrderInput.WorkFlowProcessId == 0)
                {
                    unionQuery += expenseQuery;
                }


                poApprovalQuery = @" select * from 
                                       ( ";

                poApprovalQuery += unionQuery;

                poApprovalQuery += @" ) as PO 
                                     where 
                                        WorkFlowStatusId not in (4, 5) 
                                        order by 
                                        PO.UpdatedDate desc 
                                        OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ;";

                poApprovalQuery += " select count(*) from " +
                                      " ( ";

                poApprovalQuery += unionQuery;

                poApprovalQuery += " ) as PO " +
                                      " where " +
                                      "  WorkFlowStatusId not in (4, 5) ";
                string aa = string.Join(",", Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed), Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable));
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple(poApprovalQuery, new
                {
                    Action = "SELECT",
                    Skip = purchaseOrderInput.Skip,
                    Take = purchaseOrderInput.Take,
                    CompanyId = purchaseOrderInput.CompanyId,
                    InventoryPOProcessId = WorkFlowProcessTypes.InventoryPo,
                    FixedAssetPOProcessId = WorkFlowProcessTypes.FixedAssetPO,
                    ContractPOProcessId = WorkFlowProcessTypes.ContractPOFixed,
                    ContractPoVariableProcessId = WorkFlowProcessTypes.ContractPOVariable,
                    ExpensePoProcessId = WorkFlowProcessTypes.ExpensesPo,
                    Search = purchaseOrderInput.Search,
                    PoCode = purchaseOrderInput.PoCode,
                    SupplierName = purchaseOrderInput.SupplierName,
                    PoTypeId = purchaseOrderInput.POTypeId,
                    ApproverUserId = purchaseOrderInput.UserId,
                    PurchaseOrderId = purchaseOrderInput.PurchaseOrderId,
                    contractPoProcessIds = string.Join(",", Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed), Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable))
                }, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    purchaseOrderDisplayResult.PurchaseOrders = result.Read<PurchaseOrderList>().AsList();
                    //total number of purchase orders
                    purchaseOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return purchaseOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }



        public int PurchaseOrderRequestStatusUpdate(PurchaseOrderApproval requestApproval)
        {
            try
            {
                string status = string.Empty;
                this.m_dbconnection.Open();//opening the connection...
                int nextApproverUserId = 0;
                UserProfile currentUserRoles = new UserProfile();
                UserProfile nextUserRoles = new UserProfile();
                string currentUserRole = string.Empty;
                string nextUserRole = string.Empty;
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        currentUserRoles = userProfileRepository.GetUserRolesInCompany(requestApproval.UserId, requestApproval.CompanyId);
                        currentUserRole = currentUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                        #region inserting record in work flow table                     
                        WorkFlow nextWorkFlowDetails = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
                        {
                            Action = "UPDATESTATUS",
                            DocumentId = requestApproval.PurchaseOrderId,
                            ProcessId = requestApproval.ProcessId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId,
                            ApproverUserId = requestApproval.UserId,
                            CompanyId = requestApproval.CompanyId,
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();
                        #endregion                     

                        #region request status update..
                        int statusId = 0;
                        if (requestApproval.IsVoid == true)
                        {
                            statusId = nextWorkFlowDetails.OverAllWorkFlowStatusId;
                            if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                            {
                                if (requestApproval.IsAccept == true)
                                {
                                    statusId = Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval);
                                }
                            }
                            if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                            {
                                if (requestApproval.IsAccept == false)
                                {
                                    statusId = Convert.ToInt32(WorkFlowStatus.Approved);
                                }
                                else
                                {
                                    statusId = Convert.ToInt32(WorkFlowStatus.PreTerminate);
                                }
                            }
                            else if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected)
                                && requestApproval.WorkFlowStatusPTA == Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval))
                            {
                                statusId = Convert.ToInt32(WorkFlowStatus.Approved);
                            }
                            else if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                            {
                                statusId = Convert.ToInt32(WorkFlowStatus.Rejected);
                            }
                            

                            //if (statusId == Convert.ToInt32(WorkFlowStatus.PreTerminate))
                            //{
                            //    var update = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                            //    {
                            //        Action = "VOIDFUTUREPOCID",
                            //        CPOID = requestApproval.PurchaseOrderId
                            //    },
                            //    transaction: transactionObj,
                            //    commandType: CommandType.StoredProcedure);
                            //}


                            var result = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                            {
                                Action = "VOIDRECORD",
                                WorkFlowStatusId = statusId,
                                CPOID = requestApproval.PurchaseOrderId
                            },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                        }
                        else
                        {
                            int updateStatus = this.m_dbconnection.Execute("PoApproval_CRUD", new
                            {
                                Action = "UPDATE",
                                PurchaseOrderId = requestApproval.PurchaseOrderId,
                                ProcessId = requestApproval.ProcessId,
                                ApproverUserId = requestApproval.UserId,
                                WorkFlowStatusId = nextWorkFlowDetails.OverAllWorkFlowStatusId,
                                PoCode = (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) ? SharedRepository.GetProcessCode(requestApproval.ProcessId) : null,
                                StatusId = 0,
                                CompanyId = requestApproval.CompanyId
                            },
                                transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion

                        #region inserting record in work flow audit trial

                        int auditTrialStatus = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentId = requestApproval.PurchaseOrderId,
                            ProcessId = requestApproval.ProcessId,
                            Remarks = requestApproval.Remarks,
                            StatusId = requestApproval.WorkFlowStatusId,
                            UserId = requestApproval.UserId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        #endregion

                        #region inserting record in notification

                        //if partially approved...
                        string notificationType = SharedRepository.GetNotificationType(requestApproval.ProcessId);
                        string notificationMessage = "";
                        int? notificationToUserId = 0;
                        int messageType = 0;
                        int notificationCreatedUserId = requestApproval.UserId;
                        if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                        {
                            if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress) || statusId == Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval))
                            {
                                if (statusId == Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval))
                                {
                                    notificationMessage = "Request For Purchase Order Void Approval";
                                }
                                else
                                {
                                    notificationMessage = "Request For Purchase Order Approval";
                                }
                                notificationToUserId = nextWorkFlowDetails.ApproverUserId;
                                messageType = Convert.ToInt32(NotificationMessageTypes.Requested);
                                notificationCreatedUserId = requestApproval.PurchaseOrderRequestUserId;
                            }
                            else if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                            {
                                if (requestApproval.IsVoid == true)
                                {
                                    if (requestApproval.IsAccept == false)
                                    {
                                        notificationMessage = "Termination of Contract is Rejected";
                                    }
                                    else
                                    {
                                        notificationMessage = "Termination of Contract is Approved";
                                    }
                                }
                                else
                                {
                                    notificationMessage = "Purchase Order Approved";
                                }
                                notificationToUserId = requestApproval.PurchaseOrderRequestUserId;
                                messageType = Convert.ToInt32(NotificationMessageTypes.Approved);
                            }
                        }
                        else if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            if (requestApproval.IsVoid == true)
                            {
                                notificationMessage = "Purchase Order Void Rejected";
                            }
                            else
                            {
                                notificationMessage = "Purchase Order Rejected";
                            }
                            notificationToUserId = requestApproval.PurchaseOrderRequestUserId;
                            messageType = Convert.ToInt32(NotificationMessageTypes.Rejected);
                        }
                        else if ((requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification)) || (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ReturnForVoidClarifications)))
                        {
                            notificationMessage = "Need Clarification";
                            notificationToUserId = requestApproval.PurchaseOrderRequestUserId;
                            messageType = Convert.ToInt32(NotificationMessageTypes.AskedForClarification);
                        }
                        try
                        {
                            NotificationsRepository notificationObj = new NotificationsRepository();
                            notificationObj.CreateNotification(new Notifications()
                            {

                                NotificationId = 0,
                                NotificationType = notificationType,
                                NotificationMessage = notificationMessage,
                                ProcessId = requestApproval.ProcessId,
                                ProcessName = "",
                                DocumentId = requestApproval.PurchaseOrderId,
                                UserId = Convert.ToInt32(notificationToUserId),//notification to user id...
                                IsRead = false,
                                CreatedBy = notificationCreatedUserId,//notification from user id...
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = requestApproval.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = messageType,
                                DocumentCode = requestApproval.PurchaseOrderCode
                            });
                        }
                        catch (Exception e)
                        {
                            throw e;
                        }

                        #endregion
                        //commiting the transaction...                      
                        transactionObj.Commit();

                        #region sending mail to next approver  
                        if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                        {
                            nextApproverUserId = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlow_CRUD", new
                            {
                                Action = "SELECTNEXTLEVEL",
                                DocumentId = requestApproval.PurchaseOrderId,
                                ProcessId = requestApproval.ProcessId
                            },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                        }

                        #endregion
                        PurchaseOrderCreationRepository objPurchaseOrderRepository = new PurchaseOrderCreationRepository();
                        if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            status = "Rejected";
                        }
                        else if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                        {
                            status = "Approved";
                        }
                        else if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
                        {
                            status = "Asked For Clarification";
                        }

                        if (nextApproverUserId > 0)
                        {
                            nextUserRoles = userProfileRepository.GetUserRolesInCompany(nextApproverUserId, requestApproval.CompanyId);
                            nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                            var result = objPurchaseOrderRepository.SendPurchaseOrderMail(nextApproverUserId, requestApproval.PurchaseOrderId, requestApproval.ProcessId, requestApproval.WorkFlowStatusId, requestApproval.CompanyId);
                            if (result)
                            {
                                //UserProfileRepository userProfileRepository = new UserProfileRepository();
                                var user = userProfileRepository.GetUserById(nextApproverUserId);
                                string nextApproverUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                                status = "Waiting For Approval";
                                var previoususer = userProfileRepository.GetUserById(requestApproval.UserId);
                                string previoususername = string.Format("{0} {1}", previoususer.FirstName, previoususer.LastName);
                                objPurchaseOrderRepository.SendPurchaseOrderApprovalMail(requestApproval.UserId, requestApproval.PurchaseOrderId, status, requestApproval.ProcessId, nextApproverUserId, requestApproval.CompanyId);
                                DateTime now = DateTime.Now;
                                if (requestApproval.ProcessId == 1)
                                {
                                    AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), requestApproval.CompanyId);
                                    AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), requestApproval.CompanyId);
                                }
                                if (requestApproval.ProcessId == 2)
                                {
                                    AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), requestApproval.CompanyId);
                                    AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), requestApproval.CompanyId);
                                }
                                if (requestApproval.ProcessId == 15)
                                {
                                    AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), requestApproval.CompanyId);
                                    AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), requestApproval.CompanyId);
                                }
                                if (requestApproval.ProcessId == 5)
                                {
                                    AuditLog.Info(PurchaseOrderType.ContractPoFixed.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), requestApproval.CompanyId);
                                    AuditLog.Info(PurchaseOrderType.ContractPoFixed.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), requestApproval.CompanyId);
                                }
                                if (requestApproval.ProcessId == 6)
                                {
                                    AuditLog.Info(PurchaseOrderType.ContractPoVariable.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", previoususername, now), requestApproval.CompanyId);
                                    AuditLog.Info(PurchaseOrderType.ContractPoVariable.ToString(), "NextLevelApproval", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("Sent to {0} for {1} on {2}", nextApproverUserName, nextUserRole == "V" ? "Verification" : "Approval", now), requestApproval.CompanyId);
                                }
                            }
                        }
                        else
                        {
                            string type = string.Empty;

                            if (requestApproval.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo))
                            {
                                type = "Inventory Purchase Order ";
                            }
                            else if (requestApproval.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO))
                            {
                                type = "Fixed Asset Purchase Order ";
                            }
                            else if (requestApproval.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ProjectPO))
                            {
                                type = "Project Purchase Order ";
                            }
                            else if (requestApproval.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo))
                            {
                                type = "Expenses Purchase Order ";
                            }



                            if (nextApproverUserId == 0 && requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                            {
                                //UserProfileRepository userProfileRepository = new UserProfileRepository();
                                var user = userProfileRepository.GetUserById(requestApproval.ApproverUserId);
                                string approverUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                                objPurchaseOrderRepository.SendPurchaseOrderApprovalMail(requestApproval.UserId, requestApproval.PurchaseOrderId, status, requestApproval.ProcessId, nextApproverUserId, requestApproval.CompanyId);
                                DateTime now = DateTime.Now;
                                if ((statusId == 0 || statusId == Convert.ToInt32(WorkFlowStatus.Approved)) && (requestApproval.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || requestApproval.ProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable)))
                                {
                                    var ContractDetails = new ContractPurchaseOrderRepository().GetContractPurchaseOrderDetails(Convert.ToString(requestApproval.PurchaseOrderId));
                                    if (requestApproval.WorkFlowStatusPTA != Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval))
                                    {
                                        AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), requestApproval.ProcessId), "PORequestApproved", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), requestApproval.CompanyId);
                                        var GeneratePoc = new ContractPurchaseOrderRepository().GeneratePoc(ContractDetails);
                                    }
                                }
                                if(statusId == (int)WorkFlowStatus.PreTerminate)
                                {
                                    AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), requestApproval.ProcessId), "PORequestApproved", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Contract Master Termination Request Verified" : "Contract Master Termination Request Approved", approverUserName, now), requestApproval.CompanyId);
                                }
                                if (requestApproval.ProcessId == 1)
                                {
                                    AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "PORequestApproved", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), requestApproval.CompanyId);
                                }
                                if (requestApproval.ProcessId == 2)
                                {
                                    AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "PORequestApproved", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), requestApproval.CompanyId);
                                }
                                if (requestApproval.ProcessId == 15)
                                {
                                    AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "PORequestApproved", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", string.Format("{0} by {1} on {2}", currentUserRole == "V" ? "Verified" : "Approved", approverUserName, now), requestApproval.CompanyId);
                                }
                            }
                            else
                            {

                                //UserProfileRepository userProfileRepository = new UserProfileRepository();
                                var user = userProfileRepository.GetUserById(requestApproval.ApproverUserId);
                                string approverUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                                if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification) || requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ReturnForVoidClarifications))
                                {
                                    DateTime now = DateTime.Now;
                                    objPurchaseOrderRepository.SendPurchaseOrderClarificationMail(requestApproval.UserId, requestApproval.PurchaseOrderRequestUserId, requestApproval.Remarks, requestApproval.PurchaseOrderId, requestApproval.PurchaseOrderCode, requestApproval.ProcessId, requestApproval.CompanyId);
                                    if (requestApproval.ProcessId == 1)
                                    {
                                        AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "SendPurchaseOrderRequestClarificationMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", "Purchase Order Return for Clarification  by  " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);
                                    }
                                    if (requestApproval.ProcessId == 2)
                                    {
                                        AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "SendPurchaseOrderRequestClarificationMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", "Purchase Order Return for Clarification  by  " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);

                                    }
                                    if (requestApproval.ProcessId == 15)
                                    {
                                        AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "SendPurchaseOrderRequestClarificationMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", "Purchase Order Return for Clarification  by  " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);

                                    }
                                    if (requestApproval.ProcessId == 5)
                                    {
                                        AuditLog.Info(PurchaseOrderType.ContractPoFixed.ToString(), "SendPurchaseOrderRequestClarificationMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", "Contract Master Return for Clarification  by  " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);

                                    }

                                    if (requestApproval.ProcessId == 6)
                                    {
                                        AuditLog.Info(PurchaseOrderType.ContractPoVariable.ToString(), "SendPurchaseOrderRequestClarificationMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", "Contract Master Return for Clarification  by  " + approverUserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);

                                    }

                                }

                                if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                                {
                                    DateTime now = DateTime.Now;
                                    objPurchaseOrderRepository.SendPurchaseOrderApprovalMail(requestApproval.UserId, requestApproval.PurchaseOrderId, status, requestApproval.ProcessId, nextApproverUserId, requestApproval.CompanyId);


                                    if (requestApproval.ProcessId == 1)
                                    {
                                        var result = this.m_dbconnection.Query<PurchaseOrder>("select * from PurchaseOrder where PurchaseOrderId=" + requestApproval.PurchaseOrderId).FirstOrDefault();
                                        WorkFlowConfigurationRepository workFlowConfigurationRepository = new WorkFlowConfigurationRepository();
                                        var workflow = workFlowConfigurationRepository.GetWorkFlowConfiguration(requestApproval.ProcessId, requestApproval.CompanyId, result.LocationId);
                                        var purchaseUser = userProfileRepository.GetUserById(requestApproval.UserId);
                                        string UserName = string.Format("{0} {1}", purchaseUser.FirstName, purchaseUser.LastName);
                                        int lastUserId = Convert.ToInt32(workflow.WorkFlowProcess.Last().WorkFlowLevels.Last().ApproverUserId);
                                        if (lastUserId == requestApproval.UserId)
                                        {
                                            AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Rejected by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for rejection is : " + requestApproval.Remarks, requestApproval.CompanyId);

                                        }
                                        else
                                        {
                                            AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Disagreed  by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for disagreement is : " + requestApproval.Remarks, requestApproval.CompanyId);

                                        }


                                    }
                                    if (requestApproval.ProcessId == 2)
                                    {

                                        var result = this.m_dbconnection.Query<PurchaseOrder>("select * from FixedAssetPurchaseOrder where FixedAssetPurchaseOrderId=" + requestApproval.PurchaseOrderId).FirstOrDefault();
                                        WorkFlowConfigurationRepository workFlowConfigurationRepository = new WorkFlowConfigurationRepository();
                                        var workflow = workFlowConfigurationRepository.GetWorkFlowConfiguration(requestApproval.ProcessId, requestApproval.CompanyId, result.LocationId);
                                        var FixedUser = userProfileRepository.GetUserById(requestApproval.UserId);
                                        string UserName = string.Format("{0} {1}", FixedUser.FirstName, FixedUser.LastName);
                                        int lastUserId = Convert.ToInt32(workflow.WorkFlowProcess.Last().WorkFlowLevels.Last().ApproverUserId);
                                        if (lastUserId == requestApproval.UserId)
                                        {

                                            AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Rejected by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for rejection is : " + requestApproval.Remarks, requestApproval.CompanyId);
                                        }
                                        else
                                        {
                                            AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Disagreed by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for disagreement is : " + requestApproval.Remarks, requestApproval.CompanyId);

                                        }
                                    }
                                    if (requestApproval.ProcessId == 15)
                                    {
                                        var result = this.m_dbconnection.Query<PurchaseOrder>("select * from ExpensesPurchaseOrder where ExpensesPurchaseOrderId=" + requestApproval.PurchaseOrderId).FirstOrDefault();
                                        WorkFlowConfigurationRepository workFlowConfigurationRepository = new WorkFlowConfigurationRepository();
                                        var workflow = workFlowConfigurationRepository.GetWorkFlowConfiguration(requestApproval.ProcessId, requestApproval.CompanyId, result.LocationId);
                                        var expenseUser = userProfileRepository.GetUserById(requestApproval.UserId);
                                        string UserName = string.Format("{0} {1}", expenseUser.FirstName, expenseUser.LastName);
                                        int lastUserId = Convert.ToInt32(workflow.WorkFlowProcess.Last().WorkFlowLevels.Last().ApproverUserId);
                                        if (lastUserId == requestApproval.UserId)
                                        {
                                            AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Rejected by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for rejection is : " + requestApproval.Remarks, requestApproval.CompanyId);
                                        }
                                        else
                                        {
                                            AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Disagreed by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for disagreement is : " + requestApproval.Remarks, requestApproval.CompanyId);

                                        }
                                    }
                                    if (requestApproval.ProcessId == 5)
                                    {
                                        var result = this.m_dbconnection.Query<PurchaseOrder>("select * from ContractPurchaseOrder where CPOID=" + requestApproval.PurchaseOrderId).FirstOrDefault();
                                        WorkFlowConfigurationRepository workFlowConfigurationRepository = new WorkFlowConfigurationRepository();
                                        var workflow = workFlowConfigurationRepository.GetWorkFlowConfiguration(requestApproval.ProcessId, requestApproval.CompanyId, result.LocationId);
                                        var contractUser = userProfileRepository.GetUserById(requestApproval.UserId);
                                        string UserName = string.Format("{0} {1}", contractUser.FirstName, contractUser.LastName);
                                        int lastUserId = Convert.ToInt32(workflow.WorkFlowProcess.Last().WorkFlowLevels.Last().ApproverUserId);
                                        if (lastUserId == requestApproval.UserId)
                                        {
                                            AuditLog.Info(PurchaseOrderType.ContractPoFixed.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Rejected by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.ContractPoFixed.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for rejection is : " + requestApproval.Remarks, requestApproval.CompanyId);
                                        }
                                        else
                                        {
                                            AuditLog.Info(PurchaseOrderType.ContractPoFixed.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Disagreed by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.ContractPoFixed.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for disagreement is : " + requestApproval.Remarks, requestApproval.CompanyId);

                                        }
                                    }
                                    if (requestApproval.ProcessId == 6)
                                    {
                                        var result = this.m_dbconnection.Query<PurchaseOrder>("select * from ContractPurchaseOrder where CPOID=" + requestApproval.PurchaseOrderId).FirstOrDefault();
                                        WorkFlowConfigurationRepository workFlowConfigurationRepository = new WorkFlowConfigurationRepository();
                                        var workflow = workFlowConfigurationRepository.GetWorkFlowConfiguration(requestApproval.ProcessId, requestApproval.CompanyId, result.LocationId);
                                        var contractVariableUser = userProfileRepository.GetUserById(requestApproval.UserId);
                                        string UserName = string.Format("{0} {1}", contractVariableUser.FirstName, contractVariableUser.LastName);
                                        int lastUserId = Convert.ToInt32(workflow.WorkFlowProcess.Last().WorkFlowLevels.Last().ApproverUserId);
                                        if (lastUserId == requestApproval.UserId)
                                        {
                                            AuditLog.Info(PurchaseOrderType.ContractPoVariable.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Rejected by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.ContractPoVariable.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for rejection is : " + requestApproval.Remarks, requestApproval.CompanyId);
                                        }
                                        else
                                        {
                                            AuditLog.Info(PurchaseOrderType.ContractPoVariable.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Disagreed by " + UserName + " on " + now + " ", requestApproval.CompanyId);
                                            AuditLog.Info(PurchaseOrderType.ContractPoVariable.ToString(), "SendPurchaseOrderRejectionMail", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderRequestStatusUpdate", " Reason for disagreement is : " + requestApproval.Remarks, requestApproval.CompanyId);

                                        }
                                    }

                                }

                            }

                        }
                        return auditTrialStatus;
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
    }
}
