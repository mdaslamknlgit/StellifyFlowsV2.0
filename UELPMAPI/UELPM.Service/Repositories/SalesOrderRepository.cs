using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using UELPM.Util.PdfGenerator;

namespace UELPM.Service.Repositories
{
    public class SalesOrderRepository : ISalesOrderRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        SalesInvoiceRepository salesInvoiceRepository = null;
        SharedRepository sharedRepository = null;
        UserProfileRepository objUserRepository = null;
        public SalesOrderDisplayResult GetSalesOrders(GridDisplayInput salesOrderInput)
        {
            try
            {
                SalesOrderDisplayResult salesOrderDisplayResult = new SalesOrderDisplayResult();              
                using (var result = this.m_dbconnection.QueryMultiple("SalesOrder_CRUD", new
                {
                    Action = "SELECTALLTYPES",                  
                    Skip = salesOrderInput.Skip,
                    Take = salesOrderInput.Take,
                    CompanyId = salesOrderInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {                 
                    salesOrderDisplayResult.SalesOrders = result.Read<SalesOrderList>().AsList();                  
                    salesOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return salesOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public SalesOrderDisplayResult GetAllSearchSalesOrders(SalesOrderSearch salesOrderInput)
    {
            try
            {
                SalesOrderDisplayResult salesOrderDisplayResult = new SalesOrderDisplayResult();

                string standardSalesOrderQuery = "";

                standardSalesOrderQuery = "(select SO.SalesOrderCode, SO.SalesOrderId,  C.CustomerName,usr.FirstName,SO.TotalAmount	,SO.CreatedDate, " +
                                                  " SO.UpdatedDate,SO.CreatedBy,SO.WorkFlowStatusId,SO.DraftCode,WF.IsApproved as IsDocumentApproved " +
                                                  "from " +
                                                  "dbo.SalesOrder as SO " +
                                                  "join dbo.Customer as C " +
                                                  "on " +
                                                  "SO.CustomerId = C.CustomerId " +
                                                   "left join dbo.Ticket as T " +
                                                   "on " +
                                                   "T.TicketId = So.TicketId " +
                                                   "left join dbo.Facility as F " +
                                                   "on " +
                                                   "F.FacilityId = T.FacilityID " +
                                                   "join dbo.UserProfile as usr " +
                                                   " on " +
                                                   " usr.UserID=SO.RequestedBy " +
                                                   "where ";
                if (salesOrderInput.SalesOrderId > 0)
                {
                    standardSalesOrderQuery += " SO.SalesOrderId=@SalesOrderId  and ";
                }
                else if (salesOrderInput.CustomerId > 0)
                {
                    standardSalesOrderQuery += "SO.CustomerId = @CustomerId and ";
                }


                if (salesOrderInput.SoCode != "" && salesOrderInput.SoCode != null)
                {
                    standardSalesOrderQuery += @"( 
                                                    SO.SalesOrderCode LIKE concat('%',@SoCode,'%') 
                                                    or
                                                    SO.DraftCode LIKE concat('%',@SoCode,'%') 
                                                 ) 
                                                 and ";
                }
                if (salesOrderInput.CustomerName != "" && salesOrderInput.CustomerName != null)
                {
                    standardSalesOrderQuery += "( " +
                                                    "C.CustomerName LIKE concat('%',@CustomerName,'%') " +
                                                ") " +
                                                "and ";
                }

                if (salesOrderInput.TicketNo != "" && salesOrderInput.TicketNo != null)
                {
                    standardSalesOrderQuery += "( " +
                                                    "T.TicketNo LIKE concat('%',@TicketNo,'%') " +
                                                    ") " +
                                                    "and ";                }
                if (!string.IsNullOrEmpty(salesOrderInput.UnitNumber))
                {
                    standardSalesOrderQuery += "F.UnitNumber = @UnitNumber and ";
                }

                if (salesOrderInput.Search != "" && salesOrderInput.Search != null)
                {
                    standardSalesOrderQuery += @"( 
                                                    SO.SalesOrderCode LIKE concat('%',@Search,'%')
                                                    or
                                                    SO.DraftCode LIKE concat('%',@Search,'%') 
                                                    or 
                                                    C.CustomerName LIKE concat('%',@Search,'%') 
                                                    or 
                                                    usr.FirstName LIKE concat('%',@Search,'%') 
                                                    or 
                                                    SO.TotalAmount LIKE concat('%',@Search,'%') 
                                                    or
                                                    T.TicketNo LIKE concat('%',@Search,'%') 
                                                    or 
                                                    F.UnitNumber LIKE concat('%',@Search,'%') 
                                                    or 
                                                    SO.CreatedDate LIKE concat('%',@Search,'%') 
                                                 ) 
                                                 and ";
                }


                if (salesOrderInput.WorkFlowStatusId > 0)
                {
                    standardSalesOrderQuery += " SO.WorkFlowStatusId = @WorkFlowStatusId and ";
                }

                standardSalesOrderQuery += " SO.Isdeleted = 0 and SO.CompanyId=@companyId )";

                string salesOrderSearchQuery = " select *,WF.Statustext as WorkFlowStatusText from " +
                                                   " ( ";
                salesOrderSearchQuery += standardSalesOrderQuery;

                salesOrderSearchQuery += " ) as SO ";
                salesOrderSearchQuery += " left join WorkFlowStatus as WF " +
                                            " on " +
                                            " SO.WorkFlowStatusId = WF.WorkFlowStatusId ";
                salesOrderSearchQuery += " order by ";
                salesOrderSearchQuery += " SO.UpdatedDate desc ";


                if (salesOrderInput.Take > 0)
                {
                    salesOrderSearchQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ";
                    salesOrderSearchQuery += " select COUNT(*) from ( ";
                    salesOrderSearchQuery += standardSalesOrderQuery;

                    salesOrderSearchQuery += " ) as SO ";
                }
                //executing the stored procedure to get the list of sales orders
                using (var result = this.m_dbconnection.QueryMultiple(salesOrderSearchQuery, new
                {
                    Action = "SELECT",
                    Skip = salesOrderInput.Skip,
                    Take = salesOrderInput.Take,
                    Search = salesOrderInput.Search,
                    CustomerId = salesOrderInput.SupplierId,
                    SalesOrderId = salesOrderInput.SalesOrderId,
                    WorkFlowStatusId = salesOrderInput.WorkFlowStatusId,
                    CompanyId = salesOrderInput.CompanyId,
                    SoCode = salesOrderInput.SoCode,
                    CustomerName = salesOrderInput.CustomerName,
                    TicketNo = salesOrderInput.TicketNo,
                    UnitNumber = salesOrderInput.UnitNumber

                }, commandType: CommandType.Text))
                {
                    //list of sales orders..
                    salesOrderDisplayResult.SalesOrders = result.Read<SalesOrderList>().AsList();
                    if (salesOrderInput.Take > 0)
                    {
                        //total number of sales orders
                        salesOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                    else
                    {
                        salesOrderDisplayResult.TotalRecords = salesOrderDisplayResult.SalesOrders.Count;
                    }
                }
                return salesOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public SalesOrder GetSalesOrderDetails(int salesOrderId)
        {          
            try
            {
                SalesOrder salesOrderDetails = new SalesOrder();
                //executing the stored procedure to get the list of sales orders
                using (var result = this.m_dbconnection.QueryMultiple("SalesOrder_CRUD", new
                {

                    Action = "SELECTBYID",
                    SalesOrderId = salesOrderId,
                    ProcessId = WorkFlowProcessTypes.SalesOrder

                }, commandType: CommandType.StoredProcedure))
                {
                    //sales order details..
                    salesOrderDetails = result.Read<SalesOrder, Customer, Ticket, SalesOrder>((So, Cu, Ti) => {

                        So.Customer = Cu;
                        So.Ticket = Ti;
                        return So;
                    }, splitOn: "CustomerId, TicketId").FirstOrDefault();                  

                    if (salesOrderDetails != null)
                    {
                        //sales order items.
                        salesOrderDetails.SalesOrderItems = result.Read<SalesOrderItems, GetItemMasters, SalesOrderItems>((Si, IM) =>
                        {
                            Si.Item = IM;
                            if (salesOrderDetails.IsGstBeforeDiscount == true)
                            {
                                Si.TaxTotal = ((Si.Unitprice * Si.ItemQty) * Si.TaxAmount / 100);
                            }
                            else
                            {
                                Si.TaxTotal = (((Si.Unitprice * Si.ItemQty) - Si.Discount) * Si.TaxAmount / 100);
                            }

                            Si.ItemTotalPrice = (Si.Unitprice * Si.ItemQty) + Si.TaxTotal - Si.Discount;
                            return Si;

                        }, splitOn: "ItemMasterId").ToList();

                        UserProfile currentApproverDetails = result.Read<UserProfile>().FirstOrDefault();
                        if (currentApproverDetails != null)
                        {
                            salesOrderDetails.CurrentApproverUserId = currentApproverDetails.UserID;
                            salesOrderDetails.CurrentApproverUserName = currentApproverDetails.UserName;
                        }
                        decimal subTotal = 0;
                        subTotal = salesOrderDetails.SalesOrderItems.Sum(i => i.ItemTotalPrice);
                        // var totalTax = (subTotal * salesOrderDetails.TaxRate / 100);
                        var totalTax = 0;
                        // salesOrderDetails.TotalTax = totalTax;
                        salesOrderDetails.SubTotal = subTotal;
                        salesOrderDetails.TotalAmount = (subTotal - salesOrderDetails.Discount) + totalTax + salesOrderDetails.ShippingCharges + salesOrderDetails.OtherCharges;

                        var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                        {
                            Action = "SELECT",
                            RecordId = salesOrderId,
                            AttachmentTypeId = Convert.ToInt32(AttachmentType.SalesOrder) //static value need to change

                        }, commandType: CommandType.StoredProcedure);

                        salesOrderDetails.Attachments = attachments.ToList();
                    }
                }
                return salesOrderDetails;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateSalesOrder(SalesOrder salesOrder)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        #region sales order creation...

                        var paramaterObj = new DynamicParameters();
                        string soCode = this.m_dbconnection.QueryFirstOrDefault<string>("SalesOrder_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        string DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        string salesOrderCode = ModuleCodes.SaleseOrder + "-" + soCode + "-" + DraftCode;
                        int salesOrderId = this.m_dbconnection.QueryFirstOrDefault<int>("SalesOrder_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentCode = salesOrderCode,
                            CompanyId = salesOrder.CompanyId,
                            LocationID = salesOrder.LocationId,
                            TicketId = salesOrder.Ticket==null ? (int?)null: salesOrder.Ticket.TicketId,
                            CustomerId = salesOrder.Customer.CustomerId,
                            RequestedBy = salesOrder.RequestedBy,
                            Discount = salesOrder.Discount,
                            TaxRate = salesOrder.TaxRate,
                            ShippingCharges = salesOrder.ShippingCharges,
                            OtherCharges = salesOrder.OtherCharges,
                            TotalAmount = salesOrder.TotalAmount,
                            CreatedBy = salesOrder.CreatedBy,
                            CreatedDate = DateTime.Now,
                            CostofServiceId = salesOrder.CostOfServiceId,                         
                            ExpectedDeliveryDate = salesOrder.ExpectedDeliveryDate,                           
                            CurrencyId = salesOrder.CurrencyId,
                            WorkFlowStatusId = salesOrder.WorkFlowStatusId,
                            StatusId = 8,
                            Instructions = salesOrder.Instructions,
                            Justifications = salesOrder.Justifications,
                            IsGstRequired = salesOrder.IsGstRequired,
                            DeliveryAddress = salesOrder.DeliveryAddress,
                            DeliveryTermId = salesOrder.DeliveryTermId,
                            Reasons = salesOrder.Reasons,
                            PaymentTermId = salesOrder.PaymentTermId,
                            IsGstBeforeDiscount = salesOrder.IsGstBeforeDiscount
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        #endregion

                        #region  saving sales order items...
                        if (salesOrder.SalesOrderItems != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of sales order items...
                            foreach (var record in salesOrder.SalesOrderItems)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@SalesOrderId", salesOrderId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", salesOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var salesOrderItemSaveResult = this.m_dbconnection.Execute("SalesOrder_CRUD", itemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion
                        #region saving files here...
                        if (salesOrder.files != null)
                        {
                            try
                            {
                                //saving files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.SalesOrder,
                                    Files = salesOrder.files,
                                    UniqueId = salesOrderId.ToString()
                                });
                                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                //looping through the list of sales order items...
                                for (var i = 0; i < salesOrder.files.Count; i++)
                                {
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.SalesOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemObj.Add("@RecordId", salesOrderId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@FileName", salesOrder.files[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", salesOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                    fileToSave.Add(itemObj);
                                }
                                var salesOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                            }
                            catch (Exception e)
                            {
                                throw e;
                            }

                        }
                        //commiting the transaction...
                       // transactionObj.Commit();
                        #endregion
                        #region
                        if (salesOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            salesOrder.SalesOrderId = salesOrderId;
                            salesOrder.SalesOrderCode = salesOrderCode;
                            SendForApproval(salesOrder, false, transactionObj, this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        return salesOrderId;
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

        public int UpdateSalesOrder(SalesOrder salesOrder)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region sales order updation...

                        var paramaterObj = new DynamicParameters();

                        int updateResult = this.m_dbconnection.Execute("SalesOrder_CRUD", new
                        {

                            Action = "UPDATE",
                            SalesOrderId = salesOrder.SalesOrderId,
                            CompanyId = salesOrder.CompanyId,                           
                            TicketId = salesOrder.Ticket == null ? (int?)null : salesOrder.Ticket.TicketId,
                            LocationId = salesOrder.LocationId,
                            CustomerId = salesOrder.Customer.CustomerId,
                            RequestedBy = salesOrder.RequestedBy,
                            Discount = salesOrder.Discount,
                            TaxRate = salesOrder.TaxRate,
                            ShippingCharges = salesOrder.ShippingCharges,
                            OtherCharges = salesOrder.OtherCharges,
                            TotalAmount = salesOrder.TotalAmount,                        
                            CostOfServiceId = salesOrder.CostOfServiceId,                           
                            ExpectedDeliveryDate = salesOrder.ExpectedDeliveryDate,                          
                            CurrencyId = salesOrder.CurrencyId,
                            WorkFlowStatusId = salesOrder.WorkFlowStatusId,
                            StatusId = 8,
                            Instructions = salesOrder.Instructions,
                            Justifications = salesOrder.Justifications,                          
                            IsGstRequired = salesOrder.IsGstRequired,
                            PaymentTermId = salesOrder.PaymentTermId,
                            DeliveryTermId = salesOrder.DeliveryTermId,
                            Reasons = salesOrder.Reasons,
                            DeliveryAddress = salesOrder.DeliveryAddress,
                            IsGstBeforeDiscount = salesOrder.IsGstBeforeDiscount,
                            UpdatedBy = salesOrder.UpdatedBy,
                            UpdatedDate = DateTime.Now,
                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);


                        #endregion

                        #region  saving sales order items...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of sales order items...
                        foreach (var record in salesOrder.SalesOrderItems.Where(i => i.SalesOrderItemId == 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@SalesOrderId", salesOrder.SalesOrderId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemQty", record.ItemQty, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", salesOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }


                        var salesOrderItemSaveResult = this.m_dbconnection.Execute("SalesOrder_CRUD", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);


                        #endregion

                        #region updating sales order items...

                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                        //looping through the list of sales order items...
                        foreach (var record in salesOrder.SalesOrderItems.Where(i => i.SalesOrderItemId > 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@SalesOrderItemId", record.SalesOrderItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", salesOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemsToUpdate.Add(itemObj);
                        }


                        var salesOrderItemUpdateResult = this.m_dbconnection.Execute("SalesOrder_CRUD", itemsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting sales order items...

                        List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                        if (salesOrder.SalesOrderItemsToDelete != null)
                        {
                            //looping through the list of sales order items...
                            foreach (var salesOrderItemId in salesOrder.SalesOrderItemsToDelete)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@SalesOrderItemId", salesOrderItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", salesOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToUpdate.Add(itemObj);
                            }
                        }

                        var salesOrderItemDeleteResult = this.m_dbconnection.Execute("SalesOrder_CRUD", itemsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting attachments
                        //looping through attachments
                        List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                        for (var i = 0; i < salesOrder.Attachments.Count; i++)
                        {
                            var fileObj = new DynamicParameters();
                            fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                            fileObj.Add("@AttachmentTypeId", salesOrder.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                            fileObj.Add("@RecordId", salesOrder.SalesOrderId, DbType.Int32, ParameterDirection.Input);
                            fileObj.Add("@AttachmentId", salesOrder.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                            fileToDelete.Add(fileObj);
                            var salesOrderFileDeleteResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                  commandType: CommandType.StoredProcedure);
                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.SalesOrder,
                                FilesNames = salesOrder.Attachments.Select(j => j.FileName).ToArray(),
                                UniqueId = salesOrder.SalesOrderId.ToString()
                            });
                        }

                        #endregion

                        #region saving files uploaded files...
                        try
                        {
                            List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                            //looping through the list of sales order items...
                            for (var i = 0; i < salesOrder.files.Count; i++)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AttachmentTypeId",Convert.ToInt32(AttachmentType.SalesOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                itemObj.Add("@RecordId", salesOrder.SalesOrderId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@FileName", salesOrder.files[i].FileName, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", salesOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                fileToSave.Add(itemObj);
                            }

                            var salesOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.SalesOrder,
                                Files = salesOrder.files,
                                UniqueId = salesOrder.SalesOrderId.ToString()
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        //commiting the transaction...
                        //transactionObj.Commit();
                        #region
                        if (salesOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            SendForApproval(salesOrder,false,transactionObj,this.m_dbconnection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
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

        public void SendForApproval(SalesOrder salesOrder, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null)
        {

            if (isFromUi == true)
            {
                dbConnection = this.m_dbconnection;
                dbConnection.Open();
                dbTransaction = this.m_dbconnection.BeginTransaction();
            }
            try
            {
                workFlowConfigRepository = new WorkFlowConfigurationRepository();
                string itemCategory = string.Empty;
                decimal totalQuantity = 0;
                if (salesOrder.SalesOrderItems != null)
                {
                    itemCategory = salesOrder.SalesOrderItems.Select(x => x.Item.ItemCategoryName).FirstOrDefault();
                    totalQuantity = salesOrder.SalesOrderItems.Sum(d => d.ItemQty);
                }

                IEnumerable<WorkFlow> workFlowConfig = workFlowConfigRepository.GetDocumentWorkFlow(new List<WorkFlowParameter>(){
                               new  WorkFlowParameter{
                                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SalesOrder),
                                    CompanyId = salesOrder.CompanyId,
                                    Value = Convert.ToString(salesOrder.TotalAmount),
                                    DocumentId = salesOrder.SalesOrderId,
                                    CreatedBy = salesOrder.CreatedBy,
                                    DocumentCode =salesOrder.SalesOrderCode,
                                    ItemCategory = itemCategory,
                                    ItemQuantity = totalQuantity.ToString(),
                                    WorkFlowStatusId = salesOrder.WorkFlowStatusId,
                                    LocationId = salesOrder.LocationId
                               }
                            }, dbTransaction, dbConnection);
                //int updateResult = this.m_dbconnection.Execute("SalesOrder_CRUD", new
                //{
                //    Action = "UPDATEWORKFLOWSTATUS",
                //    WorkFlowStatusId = (workFlowConfig == null || workFlowConfig.Count() == 0) ? Convert.ToInt32(WorkFlowStatus.Approved) : salesOrder.WorkFlowStatusId,
                //    SalesOrderId = salesOrder.SalesOrderId
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
    
        public int SalesOrderStatusUpdate(SalesOrderApproval requestApproval)  
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region inserting record in work flow table     

                        //changing the work flow order status from "Asked for clarification" to "Waiting for Approval"
                        WorkFlow nextWorkFlowDetails = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
                        {
                            Action = "UPDATESTATUS",
                            DocumentId = requestApproval.SalesOrderId,
                            ProcessId = requestApproval.ProcessId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId,
                            ApproverUserId = requestApproval.ApproverUserId,
                            CompanyId = requestApproval.CompanyId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                        #endregion                     

                        #region request status update..

                        int updateStatus = this.m_dbconnection.QueryFirstOrDefault<int>("SalesOrderApproval_CRUD", new
                        {
                            Action = "UPDATE",
                            SalesOrderId = requestApproval.SalesOrderId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId,
                            ProcessId = requestApproval.ProcessId,
                        },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);

                        #endregion

                        #region inserting record in work flow audit trial

                        int auditTrialStatus = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentId = requestApproval.SalesOrderId,
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
                        string notificationMessage = SharedRepository.GetNotificationMessage(requestApproval.ProcessId);
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
                                DocumentId = requestApproval.SalesOrderId,
                                UserId = requestApproval.ApproverUserId,
                                IsRead = false,
                                CreatedBy = requestApproval.UserId,
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = requestApproval.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                                DocumentCode = requestApproval.SalesOrderCode
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        //commiting the transaction...                      
                        transactionObj.Commit();

                        if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {

                            this.SendSalesOrderReplyMail(requestApproval.ApproverUserId, requestApproval.UserId, requestApproval.Remarks, requestApproval.SalesOrderId, requestApproval.SalesOrderCode);
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

        public bool DeleteSalesOrder(SalesOrderDelete salesOrderDelete)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {                      
                        var salesOrderDeleteResult = this.m_dbconnection.Execute("SalesOrder_CRUD",
                                                                new
                                                                {
                                                                    Action = "DELETE",
                                                                    SalesOrderId = salesOrderDelete.SalesOrderId,
                                                                    CreatedBy = salesOrderDelete.ModifiedBy,
                                                                    CreatedDate = DateTime.Now
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                      
                        var salesOrderItemDeleteResult = this.m_dbconnection.Execute("SalesOrder_CRUD", new
                        {

                            Action = "DELETEALLITEMS",
                            SalesOrderId = salesOrderDelete.SalesOrderId,
                            CreatedBy = salesOrderDelete.ModifiedBy,
                            CreatedDate = DateTime.Now
                        },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                      
                        try
                        {
                            var parameterObj = new DynamicParameters();
                            parameterObj.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                            parameterObj.Add("@RecordId", salesOrderDelete.SalesOrderId, DbType.Int32, ParameterDirection.Input);

                            var deletedAttachmentNames = this.m_dbconnection.Query<string>("FileOperations_CRUD", parameterObj, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.SalesOrder,
                                FilesNames = deletedAttachmentNames.ToArray(),
                                UniqueId = salesOrderDelete.SalesOrderId.ToString()
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                     
                        transactionObj.Commit();
                        return true;
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
        }
    
        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();

                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.SalesOrder,
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
   
        public byte[] SalesOrderPrint(int salesOrderId, int companyId, string type)
        {
            try
            {
                var result = GetSalesOrderPDFTemplate(salesOrderId, companyId, type);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }     

        public byte[] GetSalesOrderPDFTemplate(int salesOrderId, int companyId, string type)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                SalesOrder salesOrderDetails = null;
                SalesInvoice saelsInvoiceDetails = null;
                byte[] result;
                if (type.Trim().ToLower() != "invoice")
                {
                    salesOrderDetails = GetSalesOrderDetails(salesOrderId);
                }
                //else
                //{
                //    salesInvoiceRepository = new SalesInvoiceRepository();
                //    saelsInvoiceDetails = salesInvoiceRepository.GetSalesInvoiceDetails(salesOrderId);
                //}               
               
                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();

                //if (type.Trim().ToLower() != "invoice")
                //{
                    result = pdfGeneratorObj.GetSalesOrderPDFTemplate(salesOrderDetails, companyDetails);                  
                //}
                //else
                //{
                //    result = pdfGeneratorObj.GetSalesInvoicePDFTemplate(saelsInvoiceDetails, companyDetails);                   
                //}

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool SendSalesOrderMailtoCustomer(int salesOrderId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                SalesOrder salesOrderDetails = null;
                salesOrderDetails = GetSalesOrderDetails(salesOrderId);
                pdfGeneratorObj = new PdfGenerator();
                var companyDetails = GetCompanyDetails(companyId);
                //var pdfResult = pdfGeneratorObj.GetSalesOrderPDFTemplate(salesOrderDetails,  companyDetails);
                //var result = Util.Email.SalesOrderEmailProvider.SendSalesOrderMailtoCustomer(companyDetails, pdfResult, salesOrderDetails);
                var result = false;
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }   

        public SalesTicketDisplayResult GetAllSearchTickets(TicketSearch ticketSearchInput)
        {
            try
            {
                SalesTicketDisplayResult ticketDisplayResult = new SalesTicketDisplayResult();
                string ticketSearchQuery = "select T.TicketId, T.TicketNo,T.FacilityID, T.CreatedDate,T.BillAmount,CONCAT(usr.firstName,usr.LastName) as UserName, 	F.UnitNumber " +
                                                 "from " +
                                                 "dbo.Ticket as T " +
                                                    //"left join dbo.Customer as C " +
                                                    //"on " +
                                                    //"t.CustomerId = C.CustomerId " +

                                                     "left join dbo.Facility as F " +
                                                     "on " +
                                                     "F.FacilityId = T.FacilityID " +                                 

                                                     "join dbo.JobStatus as JS " +
                                                     "on " +
                                                     "t.JobStatus = JS.StatusId ";
               
                ticketSearchQuery += " join dbo.UserProfile as  usr on usr.UserID = T.CreatedBy ";
                
                ticketSearchQuery += "where ";
              
                if (ticketSearchInput.Search != "" && ticketSearchInput.Search != null)
                {
                    ticketSearchQuery += " ( " +
                                                      "T.TicketNo LIKE concat('%',@Search,'%') " +
                                                      //"or " +
                                                      //"S.SupplierName LIKE concat('%',@Search,'%') " +
                                                      "or " +
                                                      "JS.Status LIKE concat('%',@Search,'%') " +
                                                   " ) " +
                                                   "and ";
                }

                ticketSearchQuery += " T.Isdeleted = 0 and T.CompanyId=@companyId and not exists (select ticketId from dbo.SalesOrder where ticketId =  T.TicketId) order by " +
                                                   " T.UpdatedDate desc ";

                if (ticketSearchInput.Take > 0)
                {

                    ticketSearchQuery += "OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";
                }

                ticketSearchQuery += "select count(*) " +
                                                  "from " +
                                                  "dbo.Ticket as T " +
                                                     //"left join dbo.Supplier as S " +
                                                     //"on " +
                                                     //"POR.Supplierid = S.SupplierId " +
                                                   "left join dbo.Facility as F " +
                                                   "on " +
                                                   "F.FacilityId = T.FacilityID " +
                                                  "join dbo.JobStatus as JS " +
                                                  "on " +
                                                  "T.JobStatus = JS.StatusId " +

                                                  "where ";
              
                if (ticketSearchInput.Search != "")
                {
                    ticketSearchQuery += " ( " +
                                                      "T.TicketNo LIKE concat('%',@Search,'%') " +
                                                      //"or " +
                                                      //"S.SupplierName LIKE concat('%',@Search,'%') " +
                                                      "or " +
                                                      "JS.Status  LIKE concat('%',@Search,'%') " +
                                                   " ) " +
                                                   "and ";
                }
                ticketSearchQuery += " T.Isdeleted = 0 and T.CompanyId=@companyId and not exists (select ticketId from dbo.SalesOrder where ticketId =  T.TicketId)";

                //executing the stored procedure to get the list of tickets
                using (var result = this.m_dbconnection.QueryMultiple(ticketSearchQuery, new
                {
                    Action = "SELECT",
                    Skip = ticketSearchInput.Skip,
                    Take = ticketSearchInput.Take,
                    Search = ticketSearchInput.Search,                 
                    CompanyId = ticketSearchInput.CompanyId                 
                }, commandType: CommandType.Text))
                {
                    //list of tickets
                    ticketDisplayResult.Tickets = result.Read<SalesTicketList>().AsList();
                    //total number of tickets
                    ticketDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }

                return ticketDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        ///   this method is used to get the list of sales orders for approval
        /// </summary>
        /// <param name="salesOrderInput"></param>
        /// <returns></returns>
        public SalesOrderDisplayResult GetSalesOrdersForApproval(GridDisplayInput salesOrderInput)
        {
            try
            {
                SalesOrderDisplayResult salesOrderDisplayResult = new SalesOrderDisplayResult();              
                using (var result = this.m_dbconnection.QueryMultiple("SalesOrderApproval_CRUD", new
                {

                    Action = "SELECT",
                    Skip = salesOrderInput.Skip,
                    Take = salesOrderInput.Take,
                    CompanyId = salesOrderInput.CompanyId,
                    ApproverUserId = salesOrderInput.UserId,
                    SalesOrderProcessId = WorkFlowProcessTypes.SalesOrder                  
                }, commandType: CommandType.StoredProcedure))
                {
                    salesOrderDisplayResult.SalesOrders = result.Read<SalesOrderList>().AsList();
                    salesOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return salesOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// this method is used to get the list of sales orders for approval based on search
        /// </summary>
        /// <param name="salesOrderInput"></param>
        /// <returns></returns>
        public SalesOrderDisplayResult SearchSalesOrdersForApproval(SalesOrderSearch salesOrderInput)
        {
            try
            {
                SalesOrderDisplayResult salesOrderDisplayResult = new SalesOrderDisplayResult();
                string soApprovalQuery = "";
                string workFlowStatusQuery = " select distinct flow.DocumentId " +
                                       "         from " +
                                       "             dbo.WorkFlow as flow " +
                                       "         join " +
                                       "         dbo.WorkFlow as flow2 " +
                                       "      on " +
                                       "         flow.DocumentId = flow2.DocumentId " +
                                       "         and " +
                                       "             flow.ProcessId = flow2.ProcessId " +                                     
                                       "             and " +
                                       "             ( " +
                                       "                 ( " +
                                       "                     flow2.WorkFlowOrder = (flow.WorkFlowOrder - 1) " +
                                       "                    and " +
                                       "                     flow2.Status in (4, 5) " +
                                       "                 ) " +
                                       "                 or " +
                                       "                ( " +
                                       "                     flow.WorkFlowOrder = 1 " +
                                       "                     and " +
                                       "                      flow2.Status not in (4, 5) " +
                                       "                 ) " +
                                       "             ) " +
                                       "         where " +
                                       "             flow.ApproverUserId = @ApproverUserId ";

                string salesOrderQuery = @"  ( 
                                        select 
                                            SO.SalesOrderCode, 
                                            SO.DraftCode,
                                            WF.IsApproved as IsDocumentApproved,
                                            SO.SalesOrderId,
                                            C.CustomerName,
                                            SO.WorkFlowStatusId, 
                                            SO.UpdatedDate,
                                            SO.CreatedBy 
                                        from 
                                            dbo.SalesOrder as SO 
                                        join dbo.Customer  as C 
                                            on 
                                            SO.CustomerId = C.CustomerId 
                                         where 
                                            SO.Isdeleted = 0 ";
                if (salesOrderInput.CompanyId > 0)
                {
                    salesOrderQuery += "and SO.CompanyId = @CompanyId ";
                }

                if (salesOrderInput.SalesOrderId > 0)
                {
                    salesOrderQuery += "and SO.SalesOrderId=@SalesOrderId ";
                }
                else if (salesOrderInput.Search != null)
                {
                    salesOrderQuery += @"and ( 
                                         SO.SalesOrderCode LIKE concat('%',@Search,'%') 
                                         or
                                         SO.DraftCode LIKE concat('%',@Search,'%') 
                                         or 
                                         C.CustomerName LIKE concat('%',@Search,'%')                                     
                                      )";
                }

                salesOrderQuery += "     and " +
                                       "     SO.SalesOrderId in " +
                                       "     ( " +
                                       workFlowStatusQuery +
                                      " and " +
                                       " flow.ProcessId = @SalesOrderProcessId " +
                                       "  and " +
                                       "             flow.Status not in (4, 5)" +
                                       "     )" +
                                       "  )";

                soApprovalQuery += " select * from " +
                                       " ( ";               
                    soApprovalQuery += salesOrderQuery;               

                soApprovalQuery += " ) as SO " +
                                   " where " +
                                       "  WorkFlowStatusId not in (4, 5) " +
                                       " order by " +
                                       " SO.UpdatedDate desc " +
                                       " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";

                soApprovalQuery += " select count(*) from " +
                                      " ( ";
              
                soApprovalQuery += salesOrderQuery;
                   

                soApprovalQuery += " ) as SO " +
                                  " where " +
                                  "  WorkFlowStatusId not in (4, 5) ";
               
                using (var result = this.m_dbconnection.QueryMultiple(soApprovalQuery, new
                {

                    Action = "SELECT",
                    Skip = salesOrderInput.Skip,
                    Take = salesOrderInput.Take,
                    CompanyId = salesOrderInput.CompanyId,
                    SalesOrderProcessId = WorkFlowProcessTypes.SalesOrder,
                    Search = salesOrderInput.Search,
                    ApproverUserId = salesOrderInput.UserId,
                    SalesOrderId = salesOrderInput.SalesOrderId,

                }, commandType: CommandType.Text))
                {                   
                    salesOrderDisplayResult.SalesOrders = result.Read<SalesOrderList>().AsList();                   
                    salesOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }

                return salesOrderDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /// <summary>
        /// for updating the sales order created user  coments
        /// </summary>
        /// <param name="salesOrderApproval"></param>
        /// <returns></returns>
        public int UpdateSalesOrderStatus(SalesOrderApproval salesOrderApproval)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region inserting record in work flow table     

                        //changing the work flow order status from "Asked for clarification" to "Waiting for Approval"
                        WorkFlow nextWorkFlowDetails = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
                        {
                            Action = "UPDATESTATUS",
                            DocumentId = salesOrderApproval.SalesOrderId,
                            ProcessId = salesOrderApproval.ProcessId,
                            WorkFlowStatusId = salesOrderApproval.WorkFlowStatusId,
                            ApproverUserId = salesOrderApproval.ApproverUserId,
                            CompanyId = salesOrderApproval.CompanyId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                        #endregion                     

                        #region request status update..

                        int updateStatus = this.m_dbconnection.QueryFirstOrDefault<int>("SalesOrderApproval_CRUD", new
                        {
                            Action = "UPDATE",
                            SalesOrderId = salesOrderApproval.SalesOrderId,
                            WorkFlowStatusId = salesOrderApproval.WorkFlowStatusId,
                            ProcessId = salesOrderApproval.ProcessId,
                        },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);

                        #endregion

                        #region inserting record in work flow audit trial

                        int auditTrialStatus = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentId = salesOrderApproval.SalesOrderId,
                            ProcessId = salesOrderApproval.ProcessId,
                            Remarks = salesOrderApproval.Remarks,
                            StatusId = salesOrderApproval.WorkFlowStatusId,
                            UserId = salesOrderApproval.UserId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        #endregion

                        #region inserting record in notification

                        //if partially approved...
                        string notificationType = SharedRepository.GetNotificationType(salesOrderApproval.ProcessId);
                        string notificationMessage = SharedRepository.GetNotificationMessage(salesOrderApproval.ProcessId);
                        try
                        {
                            NotificationsRepository notificationObj = new NotificationsRepository();
                            notificationObj.CreateNotification(new Notifications()
                            {

                                NotificationId = 0,
                                NotificationType = notificationType,
                                NotificationMessage = notificationMessage,
                                ProcessId = salesOrderApproval.ProcessId,
                                ProcessName = "",
                                DocumentId = salesOrderApproval.SalesOrderId,
                                UserId = salesOrderApproval.ApproverUserId,
                                IsRead = false,
                                CreatedBy = salesOrderApproval.UserId,
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = salesOrderApproval.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                                DocumentCode = salesOrderApproval.SalesOrderCode
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion
                        //commiting the transaction...                      
                        transactionObj.Commit();

                        if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            this.SendSalesOrderReplyMail(salesOrderApproval.ApproverUserId, salesOrderApproval.UserId, salesOrderApproval.Remarks, salesOrderApproval.SalesOrderId, salesOrderApproval.SalesOrderCode);
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

        /// <summary>
        /// 
        /// </summary>
        /// <param name="salesOrderApproval"></param>
        /// <returns></returns>
        public int SalesOrderApprovalStatus(SalesOrderApproval salesOrderApproval)
        {
            try
            {
                List<GetItemDetails> getItemDetails = new List<GetItemDetails>();
                string status = string.Empty;
                this.m_dbconnection.Open();//opening the connection...
                int nextApproverUserId = 0;
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {                       
                        #region inserting record in work flow table                     
                        WorkFlow nextWorkFlowDetails = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD", new
                        {
                            Action = "UPDATESTATUS",
                            DocumentId = salesOrderApproval.SalesOrderId,
                            ProcessId = salesOrderApproval.ProcessId,
                            WorkFlowStatusId = salesOrderApproval.WorkFlowStatusId,
                            ApproverUserId = salesOrderApproval.UserId,
                            CompanyId = salesOrderApproval.CompanyId,
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                        #endregion                     

                        #region request status update..


                        int updateStatus = this.m_dbconnection.Execute("SalesOrder_CRUD", new
                        {
                            Action = "UPDATEWORKFLOWSTATUS",
                            DocumentId = salesOrderApproval.SalesOrderId,
                            ProcessId = salesOrderApproval.ProcessId,
                            WorkFlowStatusId = nextWorkFlowDetails.OverAllWorkFlowStatusId,
                            CompanyId = salesOrderApproval.CompanyId,
                            DocumentCode = (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) ? SharedRepository.GetProcessCode(salesOrderApproval.ProcessId) : null
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        #endregion

                        #region inserting record in work flow audit trial

                        int auditTrialStatus = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                        {
                            Action = "INSERT",
                            DocumentId = salesOrderApproval.SalesOrderId,
                            ProcessId = salesOrderApproval.ProcessId,
                            Remarks = salesOrderApproval.Remarks,
                            StatusId = salesOrderApproval.WorkFlowStatusId,
                            UserId = salesOrderApproval.UserId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        #endregion

                        #region inserting record in notification

                        //if partially approved...
                        string notificationType = SharedRepository.GetNotificationType(salesOrderApproval.ProcessId);
                        string notificationMessage = "";
                        int? notificationToUserId = 0;
                        int messageType = 0;
                        int notificationCreatedUserId = salesOrderApproval.UserId;
                        if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                        {
                            if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                            {
                                notificationMessage = "Request For Sales Order Approval";
                                notificationToUserId = nextWorkFlowDetails.ApproverUserId;
                                messageType = Convert.ToInt32(NotificationMessageTypes.Requested);
                                notificationCreatedUserId = salesOrderApproval.SalesOrderRequestUserId;
                            }
                            else if (nextWorkFlowDetails.OverAllWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                            {
                                notificationMessage = "Sales Order Approved";
                                notificationToUserId = salesOrderApproval.SalesOrderRequestUserId;  
                                messageType = Convert.ToInt32(NotificationMessageTypes.Approved);
                            }
                        }
                        else if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            notificationMessage = "Sales Order Rejected";
                            notificationToUserId = salesOrderApproval.SalesOrderRequestUserId; 
                            messageType = Convert.ToInt32(NotificationMessageTypes.Rejected);
                        }
                        else if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
                        {
                            notificationMessage = "Need Clarification";
                            notificationToUserId = salesOrderApproval.SalesOrderRequestUserId; 
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
                                ProcessId = salesOrderApproval.ProcessId,
                                ProcessName = "",
                                DocumentId = salesOrderApproval.SalesOrderId,
                                UserId = Convert.ToInt32(notificationToUserId),//notification to user id...
                                IsRead = false,
                                CreatedBy = notificationCreatedUserId,//notification from user id...
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = salesOrderApproval.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = messageType,
                                DocumentCode = salesOrderApproval.SalesOrderCode
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
                        if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                        {
                            nextApproverUserId = this.m_dbconnection.QueryFirstOrDefault<int>("WorkFlow_CRUD", new
                            {
                                Action = "SELECTNEXTLEVEL",
                                DocumentId = salesOrderApproval.SalesOrderId,
                                ProcessId = salesOrderApproval.ProcessId
                            },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                        }

                        #endregion                      
                        if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                        {
                            status = "Rejected";
                        }
                        else if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                        {
                            status = "Approved";
                        }
                        else if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
                        {
                            status = "Asked For Clarification";
                        }

                        if (nextApproverUserId > 0)
                        {
                            var result = SendSalesOrderMail(nextApproverUserId, salesOrderApproval.SalesOrderId, salesOrderApproval.ProcessId);
                            if (result)
                            {
                                status = "Waiting For Approval";
                                SendSalesOrderApprovalMail(salesOrderApproval.UserId, salesOrderApproval.SalesOrderId, status, salesOrderApproval.ProcessId, nextApproverUserId);

                            }
                        }
                        else
                        {
                            if (nextApproverUserId == 0 && salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved))
                            {
                                SendSalesOrderApprovalMail(salesOrderApproval.UserId, salesOrderApproval.SalesOrderId, status, salesOrderApproval.ProcessId, nextApproverUserId);
                                var getSalesItemDetails = this.m_dbconnection.Query<GetItemDetails>("SalesOrder_CRUD", new
                                {
                                    Action = "GETITEMSDETAILS",
                                    SalesOrderId = salesOrderApproval.SalesOrderId,
                                }, commandType: CommandType.StoredProcedure);

                                getItemDetails = getSalesItemDetails.ToList();
                                if(getItemDetails.Count>0)
                                {
                                    foreach (var record in getItemDetails)
                                    {
                                        int StockDetailId = this.m_dbconnection.QueryFirstOrDefault<int>("ItemStock_CRUD", new
                                        {
                                            Action = "INSERT",
                                            DocumentId = salesOrderApproval.SalesOrderId,
                                            RecordId= record.DocumentId,
                                            ItemMasterId = record.ItemMasterId,
                                            StockIn=0,
                                            StockOut= record.Quantity,
                                            CreatedBy = salesOrderApproval.UserId,
                                            CreatedDate = DateTime.Now,
                                            UpdatedBy = salesOrderApproval.UserId,
                                            UpdatedDate = DateTime.Now,
                                        },
                                            transaction: transactionObj,
                                            commandType: CommandType.StoredProcedure);
                                    }
                                }                       
                            }
                            else
                            {
                                if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.AskedForClarification))
                                {
                                    SendSalesOrderClarificationMail(salesOrderApproval.UserId, salesOrderApproval.SalesOrderRequestUserId, salesOrderApproval.Remarks, salesOrderApproval.SalesOrderId, salesOrderApproval.SalesOrderCode);
                                }
                                if (salesOrderApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Rejected))
                                {
                                    SendSalesOrderApprovalMail(salesOrderApproval.UserId, salesOrderApproval.SalesOrderId, status, salesOrderApproval.ProcessId, nextApproverUserId);
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

        private CompanyDetails GetCompanyDetails(int companyId)
        {
            sharedRepository = new SharedRepository();
            return sharedRepository.GetCompanyDetails(companyId);
        }
    
        public bool SendSalesOrderMail(int? approverUserId, int salesOrderId, int processId)
        {
            string type = string.Empty;
            bool result = false;
            objUserRepository = new UserProfileRepository();
            SalesOrderRequestMail salesOrderRequestMail = null;
            salesOrderRequestMail = new SalesOrderRequestMail();         

            salesOrderRequestMail = PrepareSalesOrderDataForMail(processId, salesOrderId, approverUserId);            

            if (salesOrderRequestMail != null)
            {
                type = "Sales Order";
                result = Util.Email.SalesOrderEmailProvider.SendSalesOrderMail(salesOrderRequestMail, type);
            }

            return result;
        }

        public bool SendSalesOrderApprovalMail(int? approverUserId, int salesOrderId, string status, int processId, int nextApprovalUserId)
        {
            bool result = false;
            string type = string.Empty;
            objUserRepository = new UserProfileRepository();
            SalesOrderRequestMail salesOrderRequestMail = null;
            salesOrderRequestMail = new SalesOrderRequestMail();          
            string previousApproverStatus = string.Empty;
         
            salesOrderRequestMail = PrepareSalesOrderDataForMail(processId, salesOrderId, approverUserId);
            if (nextApprovalUserId > 0)
            {
                var nextapprover = objUserRepository.GetUserById(nextApprovalUserId);
                previousApproverStatus = $"{"Approved by "}{ salesOrderRequestMail.ApproverName}";
                var currentApproverStatus = $"{status}{" [ "}{nextapprover.FirstName}{nextapprover.LastName}{" ] "}";
                if (nextapprover != null)
                {
                    status = $"{currentApproverStatus}";
                }
            }
            else
            {
                previousApproverStatus = status;
            }

            if (salesOrderRequestMail != null)
            {
                type = "Sales Order";
                Util.Email.SalesOrderEmailProvider.SendSalesOrderApprovalMail(salesOrderRequestMail, type, status, previousApproverStatus);
            }

            return result;

        }

        public void SendSalesOrderClarificationMail(int? approverUserId, int requesterId, string approverComments, int salesOrderId, string salesOrderCode)
        {
            string type = string.Empty;
            SalesOrderClarificationMail salesOrderClarficationMail = null;
            salesOrderClarficationMail = new SalesOrderClarificationMail();

            salesOrderClarficationMail = PrepareSalesOrderDataForClarificationMail(approverUserId, requesterId, approverComments, salesOrderId, salesOrderCode);
            if (salesOrderClarficationMail != null)
            {
                type = "Sales Order";
                Util.Email.SalesOrderEmailProvider.SendSalesOrderClarificationMail(salesOrderClarficationMail, type);
            }
        }

        public void SendSalesOrderReplyMail(int? approverUserId, int requesterId, string approverComments, int salesOrderId, string salesOrderCode)
        {
            string type = string.Empty;
            SalesOrderClarificationMail salesOrderClarficationMail = null;
            salesOrderClarficationMail = new SalesOrderClarificationMail();

            salesOrderClarficationMail = PrepareSalesOrderDataForClarificationMail(approverUserId, requesterId, approverComments, salesOrderId, salesOrderCode);
            if (salesOrderClarficationMail != null)
            {
                type = "Sales Order";
                Util.Email.SalesOrderEmailProvider.SendSalesOrderReplyMail(salesOrderClarficationMail, type);
            }
        }

        private SalesOrderRequestMail PrepareSalesOrderDataForMail(int processId, int salesOrderId, int? approverUserId)
        {
            SalesOrderRequestMail salesOrderRequestMail = null;
            salesOrderRequestMail = new SalesOrderRequestMail();
            SalesOrder salesOrderDetails = null;

            var approver = objUserRepository.GetUserById(approverUserId);
            if (approver != null)
            {
                salesOrderRequestMail.ApproverName = approver.FirstName;
                salesOrderRequestMail.ApproverEmail = approver.EmailId;
            }           

            if (processId == Convert.ToInt32(WorkFlowProcessTypes.SalesOrder))
            {
                salesOrderDetails = GetSalesOrderDetails(salesOrderId);
            }

            if (salesOrderDetails != null)
            {
                salesOrderRequestMail.RequestId = salesOrderDetails.SalesOrderId;
                salesOrderRequestMail.RequestCode = salesOrderDetails.SalesOrderCode;
                salesOrderRequestMail.SenderName = salesOrderDetails.RequestedByUserName;
                salesOrderRequestMail.Customer = salesOrderDetails.Customer.CustomerShortName;
                salesOrderRequestMail.CustomerEmail = salesOrderDetails.Customer.CustomerEmail;
                salesOrderRequestMail.CustomerContactNumber = salesOrderDetails.Customer.BillingTelephone;
                salesOrderRequestMail.DeliveryDate = salesOrderDetails.ExpectedDeliveryDate;
                salesOrderRequestMail.Department = salesOrderDetails.Location;
                salesOrderRequestMail.CustomerName = salesOrderDetails.Customer.CustomerName;
                salesOrderRequestMail.CustomerType = salesOrderDetails.Customer.CustomerCategoryName;
                salesOrderRequestMail.TotalAmount = $"{salesOrderDetails.TotalAmount.ToString("0,0.00", CultureInfo.InvariantCulture)}";
            }

            if (salesOrderDetails != null)
            {
                var sender = objUserRepository.GetUserById(salesOrderDetails.CreatedBy);
                if (sender != null)
                {
                    salesOrderRequestMail.SenderEmail = sender.EmailId;
                }
            }

            return salesOrderRequestMail;
        }

        private SalesOrderClarificationMail PrepareSalesOrderDataForClarificationMail(int? approverUserId, int requesterId, string approverComments, int salesOrderId, string salesOrderCode)
        {
            objUserRepository = new UserProfileRepository();
            SalesOrderClarificationMail salesOrderClarificationMail = null;
            salesOrderClarificationMail = new SalesOrderClarificationMail();
            var approver = objUserRepository.GetUserById(approverUserId);
            var requester = objUserRepository.GetUserById(requesterId);
            if (approver != null)
            {
                salesOrderClarificationMail.ApproverName = approver.FirstName;
                salesOrderClarificationMail.ApproverEmail = approver.EmailId;
            }

            if (requester != null)
            {
                salesOrderClarificationMail.RequesterName = requester.FirstName;
                salesOrderClarificationMail.RequesterEmail = requester.EmailId;
            }

            if (approver != null && requester != null)
            {
                salesOrderClarificationMail.RequestId = salesOrderId;
                salesOrderClarificationMail.ApproverComments = approverComments;
                salesOrderClarificationMail.SalesOrderNumber = salesOrderCode;
            }

            return salesOrderClarificationMail;
        }   
    }
}

