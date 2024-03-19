using Dapper;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using OfficeOpenXml;
using System.IO;
using System.Web;
using UELPM.Service.Exceptions;
using System.Globalization;
using UELPM.Service.Helpers;

namespace UELPM.Service.Repositories
{
    public class ContractPurchaseOrderRepository : IContractPurchaseOrderRepository
    {
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        CompanyRepository companyRepository = null;
        SharedRepository sharedRepository = null;
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        /*
            this method is used to get the list of purchase orders....... 
        */
        public ContractPurchaseOrderDisplayResult GetContractPurchaseOrders(PurchaseOrderSearch purchaseOrderInput)
        {
            try
            {
                ContractPurchaseOrderDisplayResult purchaseOrderDisplayResult = new ContractPurchaseOrderDisplayResult();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("ContractPurchaseOrderItem_CRUD", new
                {
                    Action = "SELECT",
                    IsSelectAll = purchaseOrderInput.IsSelectAll,
                    Skip = purchaseOrderInput.Skip,
                    Take = purchaseOrderInput.Take,
                    userId = purchaseOrderInput.UserId,
                    IsMasterPo = purchaseOrderInput.IsMasterPo,
                    CompanyId = purchaseOrderInput.CompanyId,
                    CPOID = purchaseOrderInput.CPOID
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of purchase orders..
                    purchaseOrderDisplayResult.PurchaseOrders = result.Read<ContractPurchaseOrder, Suppliers, ContractPurchaseOrder>((Pc, Su) =>
                    {

                        Pc.Supplier = Su;
                        if ((Pc.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) && Pc.IsMasterPO == false)
                        {
                            Pc.WorkFlowStatusText = "Open";
                        }
                        return Pc;
                    }, splitOn: "SupplierId").ToList();
                    //total number of purchase orders
                    purchaseOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }


                //GeneratePOCBySchedule();

                return purchaseOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public ContractPurchaseOrderDisplayResult GetCPOAccuralManagement(PurchaseOrderSearch purchaseOrderInput)
        {
            try
            {
                ContractPurchaseOrderDisplayResult purchaseOrderDisplayResult = new ContractPurchaseOrderDisplayResult();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("ContractPurchaseOrderItem_CRUD", new
                {
                    Action = "ACCURALMNGT",
                    Skip = purchaseOrderInput.Skip,
                    Take = purchaseOrderInput.Take,
                    IsMasterPo = purchaseOrderInput.IsMasterPo,
                    CompanyId = purchaseOrderInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of purchase orders..
                    purchaseOrderDisplayResult.PurchaseOrders = result.Read<ContractPurchaseOrder, Suppliers, ContractPurchaseOrder>((Pc, Su) =>
                    {
                        Pc.Supplier = Su;
                        if ((Pc.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) && Pc.IsMasterPO == false)
                        {
                            Pc.WorkFlowStatusText = "Open";
                        }
                        return Pc;
                    }, splitOn: "SupplierId").ToList();
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

        public ContractPurchaseOrderDisplayResult GetCPOAccuralReverse(PurchaseOrderSearch purchaseOrderInput)
        {
            try
            {
                ContractPurchaseOrderDisplayResult purchaseOrderDisplayResult = new ContractPurchaseOrderDisplayResult();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("ContractPurchaseOrderItem_CRUD", new
                {
                    Action = "ACCURALRVSE",
                    Skip = purchaseOrderInput.Skip,
                    Take = purchaseOrderInput.Take,
                    IsMasterPo = purchaseOrderInput.IsMasterPo,
                    CompanyId = purchaseOrderInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of purchase orders..
                    purchaseOrderDisplayResult.PurchaseOrders = result.Read<ContractPurchaseOrder, Suppliers, ContractPurchaseOrder>((Pc, Su) =>
                    {
                        Pc.Supplier = Su;
                        if ((Pc.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) && Pc.IsMasterPO == false)
                        {
                            Pc.WorkFlowStatusText = "Open";
                        }
                        return Pc;
                    }, splitOn: "SupplierId").ToList();
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


        public ContractPurchaseOrderDisplayResult GetAllSearchPurchaseOrders(PurchaseOrderSearch purchaseOrderInput)
        {
            try
            {
                ContractPurchaseOrderDisplayResult purchaseOrderDisplayResult = new ContractPurchaseOrderDisplayResult();
                string contractPOSearchQuery = "";
                List<int> allowedPos = new List<int>();

                //getting contract asset purchase orders...
                contractPOSearchQuery = @" 
                                        from 
                                        dbo.ContractPurchaseOrder as PO 
                                        join dbo.Supplier as S 
                                                on 
                                                PO.Supplierid = S.SupplierId 
                                        join dbo.PurchaseOrderTypes as POT 
                                                on 
                                                PO.POTypeId = POT.PurchaseOrderTypeId 
                                        join dbo.UserProfile as usr 
                                            on 
                                            usr.UserID=PO.RequestedBy 
                                        left join WorkFlowStatus as WF 
                                            on 
                                            PO.WorkFlowStatusId = WF.WorkFlowStatusId 
                                        where ";
                if (purchaseOrderInput.From == "GRN" || purchaseOrderInput.From == "SUPPLIERINVOICE")
                {
                    contractPOSearchQuery += " PO.WorkFlowStatusId != @PoStatusId and ";

                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        contractPOSearchQuery += " PO.WorkFlowStatusId != @InvoiceStatusId and ";
                    }
                }
                if (purchaseOrderInput.PurchaseOrderId > 0)
                {
                    contractPOSearchQuery += "PO.CPOID = @PurchaseOrderId  and ";
                }
                else if (purchaseOrderInput.SupplierId > 0)
                {
                    contractPOSearchQuery += "PO.Supplierid = @SupplierId and ";
                }

                if (purchaseOrderInput.PoCode != "" && purchaseOrderInput.PoCode != null && purchaseOrderInput.PoCode != "null")
                {
                    contractPOSearchQuery += @"( 
                                                PO.CPONumber LIKE concat('%',@PoCode,'%')
                                                or
                                                PO.DraftCode LIKE concat('%',@PoCode,'%')
                                            )
                                            and ";
                }
                if (purchaseOrderInput.SupplierName != "" && purchaseOrderInput.SupplierName != null && purchaseOrderInput.SupplierName != "null")
                {
                    contractPOSearchQuery += @"(
                                                S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                            ) 
                                            and ";
                }
                if (purchaseOrderInput.FromDate != null && purchaseOrderInput.ToDate != null)
                {
                    contractPOSearchQuery += @"( 
                                                    PO.CreatedDate BETWEEN @FromDate and @ToDate 
                                                ) 
                                                and ";

                    //contractPOSearchQuery += @"( 
                    //                                (CONVERT(NVARCHAR, PO.CreatedDate, 23) BETWEEN CAST(@FromDate AS datetime) and DATEADD(day, 1, CAST(@ToDate AS datetime)) )
                    //                            ) 
                    //                            and ";
                }
                if (purchaseOrderInput.Search != "" && purchaseOrderInput.Search != null && purchaseOrderInput.Search != "null")
                {
                    contractPOSearchQuery += @"( 
                                            PO.CPONumber LIKE concat('%',@Search,'%') 
                                            or 
                                            S.SupplierName LIKE concat('%',@Search,'%')
                                            or
                                            PO.DraftCode LIKE concat('%',@Search,'%')
                                            or 
                                            usr.FirstName LIKE concat('%',@Search,'%')
                                            or
                                            PO.TotalAmount LIKE concat('%',@Search,'%')
                                            or
                                            PO.CreatedDate LIKE concat('%',@Search,'%')
                                            or
                                            WF.Statustext LIKE concat('%',@Search,'%')
                                            ) and ";
                }
                if (purchaseOrderInput.WorkFlowStatusId > 0)
                {
                    contractPOSearchQuery += " PO.WorkFlowStatusId = @WorkFlowStatusId and ";
                }
                contractPOSearchQuery += " PO.Isdeleted = 0 ";
                if (purchaseOrderInput.CompanyId > 0)
                {
                    contractPOSearchQuery += " and PO.CompanyId=@companyId ";
                }

                contractPOSearchQuery += " and PO.IsMasterPO = @IsMaster ";

                contractPOSearchQuery += " and PO.LocationID in ( select DepartmentId from usercompanydepartments where userId=@userId and CompanyId=@CompanyId) ";
                string purchaseOrderSearchQuery = @" select PO.CPONumber,
				                                    PO.DraftCode,
				                                    PO.CPOID,
				                                    PO.POTypeId,
                                                    PO.CreatedDate,
				                                    PO.UpdatedDate,
                                                    PO.TotalAmount,
				                                    PO.ContractName,
                                                    PO.WorkFlowStatusId,
			                                    	PO.IsMasterPO,
				                                    WF.IsApproved AS IsDocumentApproved,
				                                    WF.Statustext as WorkFlowStatusText,
                                                    S.SupplierId,
                                                    S.SupplierName";

                purchaseOrderSearchQuery += contractPOSearchQuery;

                purchaseOrderSearchQuery += @"  order by PO.UpdatedDate desc, PO.CPOID desc   ";
                if (purchaseOrderInput.Take > 0)
                {
                    purchaseOrderSearchQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ;";
                    purchaseOrderSearchQuery += " select COUNT(*) ";
                    purchaseOrderSearchQuery += contractPOSearchQuery;
                }
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple(purchaseOrderSearchQuery, new
                {
                    Action = "SELECT",
                    Skip = purchaseOrderInput.Skip,
                    Take = purchaseOrderInput.Take,
                    Search = purchaseOrderInput.Search,
                    SupplierId = purchaseOrderInput.SupplierId,
                    PurchaseOrderId = purchaseOrderInput.PurchaseOrderId,
                    WorkFlowStatusId = purchaseOrderInput.WorkFlowStatusId,
                    CompanyId = purchaseOrderInput.CompanyId,
                    userId = purchaseOrderInput.UserId,
                    PoCode = purchaseOrderInput.PoCode,
                    SupplierName = purchaseOrderInput.SupplierName,
                    FromDate = purchaseOrderInput.FromDate,
                    ToDate = purchaseOrderInput.ToDate,
                    PoStatusId = Convert.ToInt32(WorkFlowStatus.Void),
                    InvoiceStatusId = Convert.ToInt32(WorkFlowStatus.Invoiced),
                    IsMaster = purchaseOrderInput.IsMasterPo

                }, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    purchaseOrderDisplayResult.PurchaseOrders = result.Read<ContractPurchaseOrder, Suppliers, ContractPurchaseOrder>((Pc, Su) =>
                    {

                        Pc.Supplier = Su;
                        if ((Pc.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) && Pc.IsMasterPO == false)
                        {
                            Pc.WorkFlowStatusText = "Open";
                        }
                        return Pc;
                    }, splitOn: "SupplierId").ToList();
                    if (purchaseOrderInput.Take > 0)
                    {
                        //total number of purchase orders
                        purchaseOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                    else
                    {
                        purchaseOrderDisplayResult.TotalRecords = purchaseOrderDisplayResult.PurchaseOrders.Count;
                    }
                }
                return purchaseOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        /*
         this method is used to get thE purchase order details....... 
        */
        public ContractPurchaseOrder GetContractPurchaseOrderDetails(string purchaseOrderId)
        {
            try
            {
                ContractPurchaseOrder purchaseOrderDetailsObj = new ContractPurchaseOrder();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("ContractPurchaseOrderItem_CRUD", new
                {

                    Action = "SELECTBYID",
                    CPOID = purchaseOrderId,
                    ProcessId = WorkFlowProcessTypes.ContractPOFixed,
                    ProcessIdVariable = WorkFlowProcessTypes.ContractPOVariable
                }, commandType: CommandType.StoredProcedure))
                {
                    //purchase order details..
                    purchaseOrderDetailsObj = result.Read<ContractPurchaseOrder, Suppliers, SupplierSubCode, ContractPurchaseOrder>((Pc, Su, Ssc) =>
                    {

                        Pc.Supplier = Su;
                        Pc.SupplierSubCode = Ssc;
                        return Pc;
                    }, splitOn: "SupplierId, SubCodeId").FirstOrDefault();
                    //purchase order items.

                    purchaseOrderDetailsObj.ContractPurchaseOrderItems = result.Read<ContractPurchaseOrderItems, AccountCode, ContractPurchaseOrderItems>((Pc, Ac) =>
                    {

                        if (Ac != null && Ac.AccountCodeId > 0)
                        {
                            Pc.Expense = Ac;
                        }
                        else
                        {
                            Pc.Expense = new AccountCode() { AccountCodeId = 0, Description = "" };
                        }
                        return Pc;
                    }, splitOn: "AccountCodeId").ToList();
                    // purchaseOrderDetailsObj.ContractPurchaseOrderItems = result.Read<ContractPurchaseOrderItems>().ToList();

                    if (purchaseOrderDetailsObj.IsMasterPO == false && purchaseOrderDetailsObj.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                    {
                        purchaseOrderDetailsObj.WorkFlowStatusText = "Open";//as we need to show Open status for child cpos which are approved..
                    }

                    UserProfile currentApproverDetails = result.Read<UserProfile>().FirstOrDefault();
                    if (currentApproverDetails != null)
                    {
                        //purchase order items.
                        purchaseOrderDetailsObj.CurrentApproverUserId = currentApproverDetails.UserID;
                        purchaseOrderDetailsObj.CurrentApproverUserName = currentApproverDetails.UserName;
                    }
                    //purchaseOrderDetailsObj.Supplier.ServiceName = String.Join(",", result.Read<string>().ToArray());
                    decimal subTotal = 0;
                    subTotal = purchaseOrderDetailsObj.ContractPurchaseOrderItems.Sum(i => i.Amount);
                    purchaseOrderDetailsObj.SubTotal = subTotal;
                    decimal? totalTax = ((subTotal - purchaseOrderDetailsObj.Discount) * purchaseOrderDetailsObj.TaxAmount / 100);
                    totalTax = totalTax != null ? Convert.ToDecimal(string.Format("{0:0.00}", totalTax)) : 0.00M;
                    purchaseOrderDetailsObj.TotalTax = totalTax;

                    purchaseOrderDetailsObj.TotalAmount = (subTotal - purchaseOrderDetailsObj.Discount) + (totalTax == null ? 0 : Convert.ToDecimal(totalTax)) + purchaseOrderDetailsObj.OtherCharges;

                }
                if (purchaseOrderDetailsObj != null)
                {
                    purchaseOrderDetailsObj.ContractTerms = GetContractTerms(purchaseOrderDetailsObj.StartDate, purchaseOrderDetailsObj.EndDate);
                    var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        RecordId = purchaseOrderId,
                        AttachmentTypeId = Convert.ToInt32(AttachmentType.ContractPurchaseOrder) //static value need to change

                    }, commandType: CommandType.StoredProcedure);

                    purchaseOrderDetailsObj.Attachments = attachments.ToList();
                    this.sharedRepository = new SharedRepository();
                    DocumentAddress address = this.sharedRepository.GetDocumentAddress(purchaseOrderDetailsObj.POTypeId, purchaseOrderDetailsObj.CPOID, purchaseOrderDetailsObj.CompanyId);
                    purchaseOrderDetailsObj.SupplierAddress = address == null ? string.Empty : address.Address;
                }
                return purchaseOrderDetailsObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
            this method is used to create the purchase order...
        */
        public int CreateContractPurchaseOrder(ContractPurchaseOrder purchaseOrder)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        string poCode = this.m_dbconnection.QueryFirstOrDefault<string>("ContractPurchaseOrderItem_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        string DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        string cpoCode = DraftCode + ModuleCodes.ContractPurchaseOrder + "-" + poCode;
                        #region purchase order creation...
                        var paramaterObj = new DynamicParameters();

                        int purchaseOrderId = this.m_dbconnection.QueryFirstOrDefault<int>("ContractPurchaseOrderItem_CRUD", new
                        {
                            Action = "INSERT",
                            CPONumber = cpoCode,
                            CompanyId = purchaseOrder.CompanyId,
                            LocationId = purchaseOrder.LocationID,
                            Supplierid = purchaseOrder.Supplier.SupplierId,
                            RequestedBy = purchaseOrder.RequestedBy,
                            TaxId = purchaseOrder.TaxId,
                            OtherCharges = purchaseOrder.OtherCharges,
                            TotalAmount = purchaseOrder.TotalAmount,
                            POTypeId = purchaseOrder.POTypeId,
                            ContractName = purchaseOrder.ContractName,
                            BillingFrequencyId = purchaseOrder.BillingFrequencyId,
                            StartDate = purchaseOrder.StartDate,
                            EndDate = purchaseOrder.EndDate,
                            TotalContractSum = purchaseOrder.TotalContractSum,
                            TenureAmount = purchaseOrder.TenureAmount,
                            IsFixed = purchaseOrder.IsFixed,
                            CurrencyId = purchaseOrder.CurrencyId,
                            Remarks = purchaseOrder.Remarks,
                            Instructions = purchaseOrder.Instructions,
                            Tolerance = purchaseOrder.Tolerance,
                            Discount = purchaseOrder.Discount,
                            IsMasterPO = true,
                            CreatedBy = purchaseOrder.CreatedBy,
                            CreatedDate = DateTime.Now,
                            PODate = purchaseOrder.PODate,
                            WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                            StatusId = Convert.ToInt32(PurchaseOrderStatus.Draft),
                            AccruetheExpense = purchaseOrder.AccruetheExpense,
                            SplitByMonthly = purchaseOrder.SplitByMonthly,
                            Margin = purchaseOrder.Margin,
                            ServiceType = purchaseOrder.ServiceType,
                            AccrualCode = purchaseOrder.AccrualCode,
                            //SupplierSubCodeId = purchaseOrder.SupplierSubCode == null ? (int?)null : purchaseOrder.SupplierSubCode.SubCodeId,
                            SupplierSubCodeId = purchaseOrder.SupplierSubCodeId,
                            TaxGroupId = purchaseOrder.TaxGroupId,
                            CPORemarks = purchaseOrder.CPORemarks
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        #endregion
                        #region  we are saving purchase order items...
                        if (purchaseOrder.ContractPurchaseOrderItems != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in purchaseOrder.ContractPurchaseOrderItems)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CPOID", purchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CPOItemId", record.CPOItemid, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Description", record.Description, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AccountCodeCategoryId", record.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                                if (record.Expense.AccountCodeId > 0)
                                {
                                    itemObj.Add("@ExpenseCategoryId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                }
                                //itemObj.Add("@ExpenseCategoryId", record.ExpenseCategoryId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Amount", record.Amount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@PaymentValuation", record.PaymentValuation, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var purchaseOrderItemSaveResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                        #region saving files here...
                        if (purchaseOrder.files != null)
                        {
                            try
                            {
                                //saving files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.ContractPurchaseOrder,
                                    Files = purchaseOrder.files,
                                    UniqueId = purchaseOrderId.ToString()
                                });
                                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ContractPurchaseOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemObj.Add("@RecordId", purchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@FileName", purchaseOrder.files[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                    fileToSave.Add(itemObj);
                                }
                                var purchaseOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                            }
                            catch (Exception e)
                            {
                                throw e;
                            }
                            #endregion
                        }
                        //commiting the transaction...
                        // transactionObj.Commit();
                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = purchaseOrder.SupplierAddress,
                            CompanyId = purchaseOrder.CompanyId,
                            DocumentId = purchaseOrderId,
                            ProcessId = purchaseOrder.POTypeId
                        }, transactionObj);
                        #endregion
                        #region
                        if (purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            purchaseOrder.CPOID = purchaseOrderId;
                            purchaseOrder.CPONumber = cpoCode;
                            SendForApproval(purchaseOrder, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        var user = userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                        string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        string CPONumber = GetCPONumber(purchaseOrderId);
                        DateTime now = DateTime.Now;
                        //if (string.IsNullOrEmpty(purchaseOrder.PurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrderCode))
                        //{
                        if (purchaseOrder.WorkFlowStatusId != (int)WorkFlowStatus.ApprovalInProgress)
                        {
                            AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), purchaseOrder.POTypeId), "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreatePurchaseOrder", "Created by " + UserName + " on " + now + "", purchaseOrder.CompanyId);
                            AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), purchaseOrder.POTypeId), "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreatePurchaseOrder", "Saved as Draft " + UserName + " on " + now + "", purchaseOrder.CompanyId);
                        }
                        // }
                        //if (!string.IsNullOrEmpty(CPONumber) && CPONumber.StartsWith("D"))
                        //{
                        //    AuditLog.Info("ContractPurchaseOrderCreation", "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreateContractPurchaseOrder", "Contract Purchase Order " + CPONumber + " with draft status  created by " + UserName + "", purchaseOrder.CompanyId);
                        //}
                        //else
                        //{
                        //    AuditLog.Info("ContractPurchaseOrderCreation", "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreateContractPurchaseOrder", "Contract Purchase Order " + CPONumber + " created by " + UserName + "", purchaseOrder.CompanyId);
                        //}
                        return purchaseOrderId;
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
        public int UpdateAccraulCode(ContractPurchaseOrder purchaseOrder)
        {
            try
            {
                ContractPurchaseOrder oldCPO = GetContractPurchaseOrderDetails(purchaseOrder.CPOID.ToString());
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var paramaterObj = new DynamicParameters();
                        int updateResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                        {
                            Action = "UPDATEACCRUALCODE",
                            CPOID = purchaseOrder.CPOID,
                            AccrualCode = purchaseOrder.AccrualCode,
                            SplitByMonthly = purchaseOrder.SplitByMonthly,
                            AccruetheExpense = purchaseOrder.AccruetheExpense,
                            //TaxAmount=purchaseOrder.TaxAmount,
                            //TotalTax=purchaseOrder.TotalTax,
                            TotalAmount = purchaseOrder.TotalAmount,
                            TaxId = purchaseOrder.TaxId,
                            TaxGroupId = purchaseOrder.TaxGroupId
                        }, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                        if (purchaseOrder.ContractPurchaseOrderItems != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            foreach (var record in purchaseOrder.ContractPurchaseOrderItems)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "EXPENSEUPDATE", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CPOID", purchaseOrder.CPOID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@AccountCodeCategoryId", record.Expense.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                                if (record.Expense.AccountCodeId > 0)
                                {
                                    itemObj.Add("@ExpenseCategoryId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                }
                                itemObj.Add("@CPOItemid", record.CPOItemid, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Description", record.Description, DbType.String, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var purchaseOrderItemSaveResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #region saving files uploaded files...
                        try
                        {
                            List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                            for (var i = 0; i < purchaseOrder.files.Count; i++)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ContractPurchaseOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                itemObj.Add("@RecordId", purchaseOrder.CPOID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@FileName", purchaseOrder.files[i].FileName, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                fileToSave.Add(itemObj);
                            }
                            var purchaseOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.ContractPurchaseOrder,
                                Files = purchaseOrder.files,
                                UniqueId = purchaseOrder.CPOID.ToString()
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        transactionObj.Commit();
                        LogCPOVerifierChanges(purchaseOrder, oldCPO);
                    }
                    catch (Exception e)
                    {
                        transactionObj.Rollback();
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return 1;
        }


        /*
         this method is used to update the purchase order...
       */
        public int UpdateContractPurchaseOrder(ContractPurchaseOrder purchaseOrder)
        {
            try
            {
                ContractPurchaseOrder poItem = GetContractPurchaseOrderDetails(purchaseOrder.CPOID.ToString());
                purchaseOrder.CurrentWorkFlowStatusId = poItem.WorkFlowStatusId;

                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region purchase order updation...

                        var paramaterObj = new DynamicParameters();

                        int updateResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                        {

                            Action = "UPDATE",
                            CPOID = purchaseOrder.CPOID,
                            CompanyId = purchaseOrder.CompanyId,
                            LocationId = purchaseOrder.LocationID,
                            Supplierid = purchaseOrder.Supplier.SupplierId,
                            RequestedBy = purchaseOrder.RequestedBy,
                            TaxId = purchaseOrder.TaxId,
                            OtherCharges = purchaseOrder.OtherCharges,
                            TotalAmount = purchaseOrder.TotalAmount,
                            POTypeId = purchaseOrder.POTypeId,
                            ContractName = purchaseOrder.ContractName,
                            BillingFrequencyId = purchaseOrder.BillingFrequencyId,
                            StartDate = purchaseOrder.StartDate,
                            EndDate = purchaseOrder.EndDate,
                            TotalContractSum = purchaseOrder.TotalContractSum,
                            TenureAmount = purchaseOrder.TenureAmount,
                            IsFixed = purchaseOrder.IsFixed,
                            CurrencyId = purchaseOrder.CurrencyId,
                            Remarks = purchaseOrder.Remarks,
                            Instructions = purchaseOrder.Instructions,
                            Tolerance = purchaseOrder.Tolerance,
                            Discount = purchaseOrder.Discount,
                            IsMasterPO = true,
                            CreatedBy = purchaseOrder.CreatedBy,
                            CreatedDate = DateTime.Now,
                            WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                            PODate = purchaseOrder.PODate,
                            StatusId = Convert.ToInt32(PurchaseOrderStatus.Draft),
                            AccruetheExpense = purchaseOrder.AccruetheExpense,
                            SplitByMonthly = purchaseOrder.SplitByMonthly,
                            Margin = purchaseOrder.Margin,
                            ServiceType = purchaseOrder.ServiceType,
                            AccrualCode = purchaseOrder.AccrualCode,
                            //SupplierSubCodeId = purchaseOrder.SupplierSubCode == null ? (int?)null : purchaseOrder.SupplierSubCode.SubCodeId,
                            SupplierSubCodeId = purchaseOrder.SupplierSubCodeId,
                            CurrentWorkFlowStatusId = poItem.WorkFlowStatusId,
                            TaxGroupId = purchaseOrder.TaxGroupId,
                            CPORemarks = purchaseOrder.CPORemarks
                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);


                        #endregion

                        #region we are saving purchase order items...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrder.ContractPurchaseOrderItems.Where(i => i.CPOItemid == 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CPOID", purchaseOrder.CPOID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CPOItemId", record.CPOItemid, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Description", record.Description, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AccountCodeCategoryId", record.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                            if (record.Expense.AccountCodeId > 0)
                            {
                                itemObj.Add("@ExpenseCategoryId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                            }
                            // itemObj.Add("@ExpenseCategoryId", record.ExpenseCategoryId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Amount", record.Amount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@PaymentValuation", record.PaymentValuation, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }


                        var purchaseOrderItemSaveResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);


                        #endregion

                        #region updating purchase order items...

                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrder.ContractPurchaseOrderItems.Where(i => i.CPOItemid > 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@CPOID", purchaseOrder.CPOID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CPOItemId", record.CPOItemid, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Description", record.Description, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@AccountCodeCategoryId", record.AccountCodeCategoryId, DbType.Int32, ParameterDirection.Input);
                            if (record.Expense != null && record.Expense.AccountCodeId > 0)
                            {
                                itemObj.Add("@ExpenseCategoryId", record.Expense.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                            }
                            //itemObj.Add("@ExpenseCategoryId", record.ExpenseCategoryId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Amount", record.Amount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@PaymentValuation", record.PaymentValuation, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemsToUpdate.Add(itemObj);
                        }


                        var purchaseOrderItemUpdateResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", itemsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting purchase order items...

                        List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                        if (purchaseOrder.PurchaseOrderItemsToDelete != null)
                        {
                            //looping through the list of purchase order items...
                            foreach (var purchaseOrderItemId in purchaseOrder.PurchaseOrderItemsToDelete)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CPOID", purchaseOrder.CPOID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CPOItemId", purchaseOrderItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToDelete.Add(itemObj);
                            }
                        }

                        var purchaseOrderItemDeleteResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", itemsToDelete,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting attachments
                        //looping through attachments
                        List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                        for (var i = 0; i < purchaseOrder.Attachments.Count; i++)
                        {
                            var fileObj = new DynamicParameters();
                            fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                            fileObj.Add("@AttachmentTypeId", purchaseOrder.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                            fileObj.Add("@RecordId", purchaseOrder.CPOID, DbType.Int32, ParameterDirection.Input);
                            fileObj.Add("@AttachmentId", purchaseOrder.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                            fileToDelete.Add(fileObj);
                            var purchaseOrderFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                  commandType: CommandType.StoredProcedure);
                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.ContractPurchaseOrder,
                                FilesNames = purchaseOrder.Attachments.Select(j => j.FileName).ToArray(),
                                UniqueId = purchaseOrder.CPOID.ToString()
                            });
                        }

                        #endregion

                        #region saving files uploaded files...
                        try
                        {
                            List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            for (var i = 0; i < purchaseOrder.files.Count; i++)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ContractPurchaseOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                itemObj.Add("@RecordId", purchaseOrder.CPOID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@FileName", purchaseOrder.files[i].FileName, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                fileToSave.Add(itemObj);
                            }

                            var purchaseOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.ContractPurchaseOrder,
                                Files = purchaseOrder.files,
                                UniqueId = purchaseOrder.CPOID.ToString()
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        //commiting the transaction...
                        // transactionObj.Commit();
                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = purchaseOrder.SupplierAddress,
                            CompanyId = purchaseOrder.CompanyId,
                            DocumentId = purchaseOrder.CPOID,
                            ProcessId = purchaseOrder.POTypeId
                        }, transactionObj);
                        #endregion
                        #region
                        if (purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            SendForApproval(purchaseOrder, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        var user = userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                        string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        string CPONumber = GetCPONumber(purchaseOrder.CPOID);

                        //if (string.IsNullOrEmpty(purchaseOrder.CPONumber) && !string.IsNullOrEmpty(purchaseOrder.DraftCode))
                        //{
                        if (poItem.TotalAmount != purchaseOrder.TotalAmount && (purchaseOrder.POTypeId == 5 || purchaseOrder.POTypeId == 6))
                        {
                            AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), purchaseOrder.POTypeId), "update", purchaseOrder.CreatedBy.ToString(), purchaseOrder.CPOID.ToString(), "UpdatePurchaseOrder", "Contract Master total recalculated, new total is " + string.Format(new CultureInfo("en-US"), "{0:C}", purchaseOrder.TotalAmount) + "", purchaseOrder.CompanyId);
                        }
                        //}
                        //else
                        //{
                        //    AuditLog.Info("ContractPurchaseOrderCreation", "update", purchaseOrder.CreatedBy.ToString(), purchaseOrder.CPOID.ToString(), "UpdatePurchaseOrder", "Contract Purchase Order " + CPONumber + " updated by " + UserName + "", purchaseOrder.CompanyId);
                        //}
                        return 1;
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

        /*
            this method is used to delete the purchase order...
        */
        public bool DeleteContractPurchaseOrder(ContractPurchaseOrderDelete purchaseOrderDelete)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region delete purchase order...
                        var purchaseOrderDeleteResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD",
                                                                new
                                                                {

                                                                    Action = "DELETE",
                                                                    CPOID = purchaseOrderDelete.CPOID,
                                                                    CreatedBy = purchaseOrderDelete.ModifiedBy
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        #endregion

                        #region deleting purchase order items...
                        var purchaseOrderItemDeleteResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                        {

                            Action = "DELETEALLITEMS",
                            CPOID = purchaseOrderDelete.CPOID,
                            CreatedBy = purchaseOrderDelete.ModifiedBy,
                            CreatedDate = DateTime.Now
                        },
                                                            transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                        #endregion
                        #region deleting all the files related to this purchase order
                        try
                        {

                            var parameterObj = new DynamicParameters();
                            parameterObj.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                            parameterObj.Add("@RecordId", purchaseOrderDelete.CPOID, DbType.Int32, ParameterDirection.Input);
                            parameterObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.ContractPurchaseOrder), DbType.Int32, ParameterDirection.Input);

                            var deletedAttachmentNames = this.m_dbconnection.Query<string>("FileOperations_CRUD", parameterObj, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.ContractPurchaseOrder,
                                FilesNames = deletedAttachmentNames.ToArray(),
                                UniqueId = purchaseOrderDelete.CPOID.ToString()
                            });


                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        //commiting the transaction...
                        transactionObj.Commit();
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        string UserName = userProfileRepository.GetUserById(purchaseOrderDelete.ModifiedBy).UserName;
                        // int CompanyId = GetCompanyId(purchaseOrderDelete.CPOID);

                        AuditLog.Info("ContractPurchaseOrderCreation", "Delete", purchaseOrderDelete.ModifiedBy.ToString(), purchaseOrderDelete.CPOID.ToString(), "DeleteContractPurchaseOrder", "Contract Purchase Order with ID " + purchaseOrderDelete.CPOID + " deleted by " + UserName, 0);
                        return true;
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

        //public int GetCompanyId(int cpoId)
        //{
        //    int CompanyId = 0;
        //    try
        //    {
        //        CompanyId = this.m_dbconnection.Query<int>("select CompanyId from ContractPurchaseOrder where CPOID="+cpoId).FirstOrDefault();
        //    }
        //    catch(Exception e)
        //    {

        //    }

        //    return CompanyId;
        //}

        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();

                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.ContractPurchaseOrder,
                    FilesNames = new string[] { attachment.FileName },
                    UniqueId = attachment.RecordId
                });
                return fileContent;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void SendForApproval(ContractPurchaseOrder purchaseOrder, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null)
        {
            string CPONumber = null;
            UserProfile currentUserRoles = new UserProfile();
            UserProfile nextUserRoles = new UserProfile();
            string currentUserRole = string.Empty;
            string nextUserRole = string.Empty;
            if (isFromUi == true)
            {
                dbConnection = this.m_dbconnection;
                dbConnection.Open();
                dbTransaction = this.m_dbconnection.BeginTransaction();
            }
            try
            {
                workFlowConfigRepository = new WorkFlowConfigurationRepository();
                IEnumerable<WorkFlow> workFlowConfig = workFlowConfigRepository.GetDocumentWorkFlow(new List<WorkFlowParameter>(){
                               new  WorkFlowParameter{
                                    ProcessId = purchaseOrder.POTypeId==Convert.ToInt32(PurchaseOrderType.ContractPoFixed)?Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed):Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable),
                                    CompanyId = purchaseOrder.CompanyId,
                                    Value = Convert.ToString(purchaseOrder.TotalContractSum),
                                    DocumentId = purchaseOrder.CPOID,
                                    CreatedBy = purchaseOrder.CreatedBy,
                                    DocumentCode =purchaseOrder.CPONumber,
                                    WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                                    LocationId = Convert.ToInt32(purchaseOrder.LocationID),
                                    TerminationDate = purchaseOrder.TerminationDate,
                                    ReasonForVoid  = purchaseOrder.ReasonstoVoid
                               }
                            }, dbTransaction, dbConnection);
                //if(isFromUi==true)
                //{
                CPONumber = GetCPONumber(purchaseOrder.CPOID);
                // }
                //else
                //{
                //    CPONumber = purchaseOrder.CPONumber;
                //}


                DateTime now = DateTime.Now;
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                nextUserRoles = userProfileRepository.GetUserRolesInCompany((int)workFlowConfig.First().ApproverUserId, purchaseOrder.CompanyId);
                nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                var user = userProfileRepository.GetUserById(workFlowConfig.First().ApproverUserId);
                string Workflowname = string.Format("{0} {1}", user.FirstName, user.LastName);

                //if (string.IsNullOrEmpty(purchaseOrder.PurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrder.DraftCode))
                //{

                if (purchaseOrder.POTypeId == 5 || purchaseOrder.POTypeId == 6)
                {
                    if (purchaseOrder.PurchaseOrderStatusId == (int)WorkFlowStatus.CancelledApproval)
                    {
                        AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), purchaseOrder.POTypeId), "resend for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.CPOID.ToString(), "SendForApproval", string.Format("Contract Master Resend for {0} to {1} on {2}", nextUserRole == "V" ? "Verification" : "Approval", Workflowname, now), purchaseOrder.CompanyId);
                    }
                    if (purchaseOrder.WorkFlowStatusId == (int)WorkFlowStatus.PendingForTerminationApproval)
                    {
                        AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), purchaseOrder.POTypeId), "TerminationApproval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.CPOID.ToString(), "TerminateSendForApproval", string.Format("Contract Master Termination request send for {0} to {1} on {2}", nextUserRole == "V" ? "Verification" : "Approval", Workflowname, now), purchaseOrder.CompanyId);

                    }
                    if (purchaseOrder.WorkFlowStatusId == (int)WorkFlowStatus.ApprovalInProgress && purchaseOrder.PurchaseOrderStatusId != 21)
                    {
                        AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), purchaseOrder.POTypeId), "sent for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.CPOID.ToString(), "SendForApproval", string.Format("Sent to {0} for {1} on {2}", Workflowname, nextUserRole == "V" ? "Verification" : "Approval", now), purchaseOrder.CompanyId);
                    }
                }
                //AuditLog.Info("ContractPurchaseOrder", "send for Approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.CPOID.ToString(), "SendForApproval", "Contract Purchase Order " + CPONumber + " sent for Approval.", purchaseOrder.CompanyId);
                //int updateResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                //{
                //    Action = "UPDATEWORKFLOWSTATUS",
                //    WorkFlowStatusId = (workFlowConfig == null || workFlowConfig.Count() == 0) ? Convert.ToInt32(WorkFlowStatus.Approved) : purchaseOrder.WorkFlowStatusId,
                //    CPOID = purchaseOrder.CPOID
                //}, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                if (isFromUi == true)
                {
                    dbTransaction.Rollback();
                    dbTransaction.Dispose();
                }
                throw e;
            }
        }


        public string GetCPONumber(int cpoId)
        {
            string CPONumber = null;
            try
            {
                CPONumber = this.m_dbconnection.Query<string>("  select (case when (charindex('-',isnull(CPONumber, 'xxx'))  <= 0 )   then DraftCode else CPONumber end)  from ContractPurchaseOrder  where CPOID=" + cpoId, commandType: CommandType.Text).FirstOrDefault().ToString();
                //if (!CPONumber.Contains("-"))
                //{
                //    CPONumber = this.m_dbconnection.Query<string>("select DraftCode from ContractPurchaseOrder where CPOID=" + cpoId, commandType: CommandType.Text).FirstOrDefault().ToString();
                //}
            }
            catch (Exception e)
            {

            }
            return CPONumber;
        }

        public ContractPurchaseOrderDisplayResult GetPocList(ContractPurchaseOrder purchaseOrder)
        //public List<ContractPurchaseOrder> GetPocList(ContractPurchaseOrder purchaseOrder)
        {
            try
            {
                ContractPurchaseOrderDisplayResult purchaseOrderDisplayResult = new ContractPurchaseOrderDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ContractPurchaseOrderItem_CRUD", new
                {
                    Action = "GETPOCLIST",
                    @CPOID = purchaseOrder.CPOID,
                    @WorkFlowStatusId = WorkFlowStatus.Void,
                    @PODate = purchaseOrder.TerminationDate.ToString("yyyy-MM-dd")
                }, commandType: CommandType.StoredProcedure))
                {
                    purchaseOrderDisplayResult.PurchaseOrders = result.Read<ContractPurchaseOrder, Suppliers, ContractPurchaseOrder>((Pc, Su) =>
                    {
                        Pc.Supplier = Su;
                        return Pc;
                    }, splitOn: "SupplierId").ToList();
                    purchaseOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return purchaseOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateTerminateDate(int PurchaseOrderId, DateTime dateTime)
        {
            try
            {
                var updateresult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                {
                    Action = "UPDATETERMINATIONDATE",
                    CPOID = PurchaseOrderId,
                    TerminationDate = dateTime,
                }, commandType: CommandType.StoredProcedure);

                return updateresult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        //public string GetContractTerms(DateTime StartDate, DateTime EndDate)
        //{
        //    var res = ((EndDate.Year - StartDate.Year) * 12) + StartDate.Month - EndDate.Month;
        //    var totalDays = EndDate.Subtract(StartDate).Days;
        //    var years = Math.Floor(totalDays / 365.25);
        //    var totalMonths = Math.Floor((double)totalDays / 30);
        //    var months = (totalMonths) - (years * 12);
        //    var contractTerms = "";
        //    if (years > 0)
        //    {
        //        contractTerms = years + (years == 1 ? " Year " : " Years ");
        //    }
        //    if (months > 0)
        //    {
        //        contractTerms += months + (months == 1 ? " Month " : " Months ");
        //    }
        //    return contractTerms;
        //}

        public string GetContractTerms(DateTime StartDate, DateTime EndDate)
        {
            EndDate = EndDate.AddDays(1);
            var months = Math.Abs(((StartDate.Year - EndDate.Year) * 12) + StartDate.Month - EndDate.Month);

            return months + (months == 1 ? " Month " : " Months ");
        }

        public int GeneratePoc(ContractPurchaseOrder purchaseOrder)
        {
            try
            {
                string PoDate = purchaseOrder.PODate.ToString("yyyy-MM-dd");
                #region generatepoc...
                var POCId = this.m_dbconnection.Query<int>("ContractPurchaseOrderItem_CRUD",
                                                new
                                                {
                                                    Action = "UPDATEPOC",
                                                    CPOID = purchaseOrder.CPOID,
                                                    CreatedBy = purchaseOrder.CreatedBy,
                                                    StartDate = purchaseOrder.StartDate,
                                                    EndDate = purchaseOrder.EndDate.AddDays(1),
                                                    PoDate = PoDate,// purchaseOrder.PODate,
                                                    SupplierSubCodeId = purchaseOrder.SupplierSubCodeId,
                                                    BillingFrequencyId = purchaseOrder.BillingFrequencyId,
                                                    SplitByMonthly = purchaseOrder.SplitByMonthly,
                                                    Discount = purchaseOrder.Discount,
                                                    POCGenerateDate = purchaseOrder.POCGenerateDate,
                                                    TaxGroupId = purchaseOrder.TaxGroupId,
                                                    Frequency = purchaseOrder.BillingFrequencyId == null ? 0 : getFrequencyInMonths(Convert.ToInt32(purchaseOrder.BillingFrequencyId), purchaseOrder.SplitByMonthly),
                                                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
                if (POCId > 0)
                {
                    var lastPOC = this.m_dbconnection.Query<ContractPurchaseOrder>("select * from ContractPurchaseOrder where CPOID=@CPOID", new { CPOID = POCId }).FirstOrDefault();
                    UpdateNextSchedulerDate(purchaseOrder);
                    UserProfileRepository userProfileRepository = new UserProfileRepository();
                    var user = userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                    int masterCpoId = lastPOC.IsMasterPO ? lastPOC.CPOID : lastPOC.MasterCPOID;
                    AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), lastPOC.POTypeId), "POC Generated", purchaseOrder.CreatedBy.ToString(), masterCpoId.ToString(), "POCGenerated", string.Format("POC : {0} generated by {1} {2} on {3}", lastPOC.CPONumber, user.FirstName, user.LastName, DateTime.Now), purchaseOrder.CompanyId);
                }

                return POCId;
                #endregion
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private void UpdateNextSchedulerDate(ContractPurchaseOrder purchaseOrder)
        {
            try
            {
                this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                {
                    Action = "UPDATE_NEXT_SCHEDULER_DATE",
                    CPOID = purchaseOrder.CPOID,
                    Frequency = purchaseOrder.BillingFrequencyId == null ? 0 : getFrequencyInMonths(Convert.ToInt32(purchaseOrder.BillingFrequencyId), purchaseOrder.SplitByMonthly),
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {

            }
        }

        public int getFrequencyInMonths(int frequencyId, bool spliltByMonthly)
        {
            var months = 0;
            if ((frequencyId == Convert.ToInt32(BillingFrequencyType.Monthly)) || spliltByMonthly == true)//monthly
            {
                months = 1;
            }
            else if (frequencyId == Convert.ToInt32(BillingFrequencyType.Quarterly))//Quarterly
            {
                months = 3;
            }
            else if (frequencyId == Convert.ToInt32(BillingFrequencyType.HalfYearly))//HalfYearly
            {
                months = 6;
            }
            else if (frequencyId == Convert.ToInt32(BillingFrequencyType.Yearly))//Yearly
            {
                months = 12;
            }
            else if (frequencyId == Convert.ToInt32(BillingFrequencyType.BiMonthly))//BiMonthly
            {
                months = 2;
            }
            return months;
        }

        public ContractPurchaseOrder[] exportAccrualGL(ContractPurchaseOrder[] contractPurchaseOrderList)
        {
            List<ContractPurchaseOrder> lstCPO = new List<ContractPurchaseOrder>();
            foreach (ContractPurchaseOrder cpo in contractPurchaseOrderList)
            {
                lstCPO.Add(GetContractPurchaseOrderDetails(cpo.CPOID.ToString()));
                var MasterCPO = this.m_dbconnection.Query<ContractPurchaseOrder>("select * from ContractPurchaseOrder where CPOID=@CPOID", new { CPOID = cpo.CPOID }).FirstOrDefault();
                AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), MasterCPO.POTypeId), "POC Generated", "0", MasterCPO.MasterCPOID.ToString(), "POCGenerated", string.Format("POC : {0} accrued on {1}", MasterCPO.CPONumber, DateTime.Now), cpo.CompanyId);
            }
            return lstCPO.ToArray();
        }

        public int ChangePOCStatus(List<ContractPurchaseOrder> contractPurchaseOrders, int workflowStatusId)
        {
            string qry = string.Empty;//clear CPOJVACode on accrual reverse
            int result = 0;
            foreach (var cpo in contractPurchaseOrders)
            {
                qry = string.Empty;
                if (workflowStatusId == (int)WorkFlowStatus.Approved)
                    qry = @"update ContractPurchaseOrder set WorkFlowStatusId = @WorkFlowStatusId , IsCPOAccrued = 0 where CPOID = @CPOID";
                else
                    qry = @"update ContractPurchaseOrder set WorkFlowStatusId = @WorkFlowStatusId , IsCPOAccrued = 1 where CPOID = @CPOID";

                result = this.m_dbconnection.Execute(qry,
                    new
                    {
                        WorkFlowStatusId = workflowStatusId,
                        CPOID = cpo.CPOID
                    }, commandType: CommandType.Text);
            }
            return result;
        }

        public async Task<bool> GeneratePOCBySchedule()
        {
            companyRepository = new CompanyRepository();
            var companies = companyRepository.GetAllCompanies();
            ContractPurchaseOrderDisplayResult purchaseOrderResult = null;
            PurchaseOrderSearch purchaseOrderInput = null;
            foreach (var company in companies)
            {
                purchaseOrderInput = new PurchaseOrderSearch();
                purchaseOrderInput.IsMasterPo = true;
                purchaseOrderInput.CompanyId = company.CompanyId;
                purchaseOrderInput.Skip = 0;
                purchaseOrderInput.Take = 20;
                purchaseOrderInput.IsSelectAll = true;
                purchaseOrderResult = GetContractPurchaseOrders(purchaseOrderInput);
                if (purchaseOrderResult.TotalRecords > 0) // != null)
                {
                    foreach (var purchaseOrder in purchaseOrderResult.PurchaseOrders)
                    {
                        DateTime now = DateTime.Now;
                        string month = now.ToString("MM");
                        string year = now.ToString("yyyy");
                        DateTime PODate = GetLastPODate(purchaseOrder.CPOID);
                        string pomonth = PODate.ToString("MM");
                        string poyear = PODate.ToString("yyyy");
                        if (month != pomonth)
                        {
                            //purchaseOrder.POCGenerateDate = DateTime.Now;
                            //Verifying condition to generate POC
                            GeneratePoc(purchaseOrder);
                        }
                    }
                }

            }

            return true;
        }
        public int GetPocCount(int CpoId)
        {
            try
            {

                var PocCount = this.m_dbconnection.Query<int>("ContractPurchaseOrderItem_CRUD",
                                                new
                                                {
                                                    Action = "SHOWLISTCOUNT",
                                                    CPOID = CpoId

                                                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                return PocCount;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public DateTime GetLastPODate(int cpoId)
        {
            try
            {
                DateTime PocCount = this.m_dbconnection.Query<DateTime>("ContractPurchaseOrderItem_CRUD",
                                                new
                                                {
                                                    Action = "GETLASTPOCDATE",
                                                    CPOID = cpoId
                                                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                return PocCount;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool UpdateJVACode(string CPONumber, string CPOJVACode)
        {
            bool isUpdated = false;
            try
            {
                this.m_dbconnection.Query<JVACode>("update ContractPurchaseOrder set CPOJVACode =@CPOJVACode where CPONumber=@CPONumber", new
                {
                    CPONumber = CPONumber,
                    CPOJVACode = CPOJVACode
                }, commandType: CommandType.Text);

                isUpdated = true;
            }
            catch (Exception e)
            {
                throw e;
            }
            return isUpdated;
        }


        private void LogCPOVerifierChanges(ContractPurchaseOrder purchaseOrder, ContractPurchaseOrder oldCPO)
        {
            UserProfileRepository userProfileRepository = new UserProfileRepository();
            var user = userProfileRepository.GetUserById(purchaseOrder.UpdatedBy);
            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
            AuditLogRepository auditLogRepository = new AuditLogRepository();
            ContractPurchaseOrder newCPO = GetContractPurchaseOrderDetails(purchaseOrder.CPOID.ToString());
            string changes = auditLogRepository.CheckAuditTrail(oldCPO, newCPO, purchaseOrder.POTypeId, null);
            string moduleName = Enum.GetName(typeof(PurchaseOrderType), purchaseOrder.POTypeId);
            string updatedBy = purchaseOrder.UpdatedBy.ToString();
            string documentId = purchaseOrder.CPOID.ToString();
            string message = "Document {0} by " + UserName + " on " + DateTime.Now + ". {1}";
            if (string.IsNullOrEmpty(changes))
            {
                message = purchaseOrder.WorkFlowStatusId == (int)WorkFlowStatus.Approved ? string.Format(message, "reverified", " ") : string.Format(message, "updated", "");
            }
            else
            {
                message = purchaseOrder.WorkFlowStatusId == (int)WorkFlowStatus.Approved ? string.Format(message, "reverified", "Below are the changes ") : string.Format(message, "updated", "Below are the changes ");
            }
            AuditLog.Info(moduleName, "VERIFY", updatedBy, documentId, "UpdatePurchaseOrder", message, purchaseOrder.CompanyId, changes);
        }
    }
}
