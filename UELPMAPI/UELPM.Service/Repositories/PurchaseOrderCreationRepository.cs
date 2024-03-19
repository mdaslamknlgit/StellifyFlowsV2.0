using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Service.Interface;
using UELPM.Model.Models;
using System.Data.SqlClient;
using System.Data;
using System.Configuration;
using Dapper;
using UELPM.Util.FileOperations;
using UELPM.Util.Templates.PurchaseOrder;
using UELPM.Util.PdfGenerator;
using System.Globalization;
//using UELPM.Business.Managers;
using UELPM.Service.Exceptions;

namespace UELPM.Service.Repositories
{
    public class PurchaseOrderCreationRepository : IPurchaseOrderCreationRepository

    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        WorkFlowConfigurationRepository workFlowConfigRepository = null;
        UserProfileRepository objUserRepository = null;
        SharedRepository sharedRepository = null;
        FixedAssetPurchaseOrderCreationRepository fixedPurchaseOrderRepository = null;
        ContractPurchaseOrderRepository contractPurchaseOrderRepository = null;
        /*
            this method is used to get the list of purchase orders....... 
        */

        public PurchaseOrderDisplayResult GetPurchaseOrders(GridDisplayInput purchaseOrderInput)
        {
            try
            {
                PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("PurchaseOrderCreation_CRUD", new
                {

                    Action = "SELECTALLTYPES",
                    //Search = purchaseOrderInput.Search,
                    Skip = purchaseOrderInput.Skip,
                    Take = purchaseOrderInput.Take,
                    CompanyId = purchaseOrderInput.CompanyId,
                    UserId = purchaseOrderInput.UserId
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

        public PurchaseOrderDisplayResult GetAllSearchPurchaseOrders(PurchaseOrderSearch purchaseOrderInput)
        {
            try
            {
                PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();

                string standardPurchaseOrderQuery = "";
                string fixedAssetPurchaseOrders = "";
                string contractPOSearchQuery = "";
                string unionQuery = "";
                string expenseQuery = "";
                List<int> allowedPos = new List<int>();
                if (purchaseOrderInput.CompanyId == 0)
                {
                    if (purchaseOrderInput.WorkFlowProcessId == 1)
                        purchaseOrderInput.CompanyId = this.m_dbconnection.Query<int>("select CompanyId from purchaseorder where PurchaseOrderId=" + purchaseOrderInput.PurchaseOrderId).FirstOrDefault();
                    if (purchaseOrderInput.WorkFlowProcessId == 2)
                        purchaseOrderInput.CompanyId = this.m_dbconnection.Query<int>("select CompanyId from FixedAssetPurchaseOrder where FixedAssetPurchaseOrderId=" + purchaseOrderInput.PurchaseOrderId).FirstOrDefault();
                    if (purchaseOrderInput.WorkFlowProcessId == 15)
                        purchaseOrderInput.CompanyId = this.m_dbconnection.Query<int>("select CompanyId from ExpensesPurchaseOrder where ExpensesPurchaseOrderId=" + purchaseOrderInput.PurchaseOrderId).FirstOrDefault();

                }

                //Note:this search code will be in purchase order,purchase order approval,supplier invoice and grn....any changes made to this will be refleted in these places..
                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo) || purchaseOrderInput.WorkFlowProcessId == 0)
                {
                    standardPurchaseOrderQuery = @"( select ";
                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        standardPurchaseOrderQuery += " distinct ";
                    }
                    standardPurchaseOrderQuery += " PO.PurchaseOrderCode, PO.PurchaseOrderId, PO.POTypeId, S.SupplierName,usr.FirstName,PO.TotalAmount,PO.CreatedDate, " +
                                                " PO.UpdatedDate,PO.CreatedBy,PO.WorkFlowStatusId,PO.StatusId as PurchaseOrderStatusId,WF.Statustext as WorkFlowStatusText, " +
                                                  " PO.DraftCode, WF.IsApproved AS IsDocumentApproved, PO.Supplierid " +
                                                   " from dbo.PurchaseOrder as PO " +
                                                   " join dbo.Supplier as S on PO.Supplierid = S.SupplierId " +
                                                   " join dbo.UserProfile as usr on usr.UserID=PO.RequestedBy " +
                                                   " join dbo.PurchaseOrderTypes as POT on PO.POTypeId = POT.PurchaseOrderTypeId " +
                                                   " left join WorkFlowStatus as WF on PO.WorkFlowStatusId = WF.WorkFlowStatusId ";
                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        standardPurchaseOrderQuery += " join GoodsReceivedNote as GRN on GRN.PurchaseOrderId=PO.PurchaseOrderId ";
                    }

                    standardPurchaseOrderQuery += " where ";

                    if (purchaseOrderInput.From == "GRN" || purchaseOrderInput.From == "SUPPLIERINVOICE")//to avoid displaying po's whose status is void...
                    {
                        if (purchaseOrderInput.From != "SUPPLIERINVOICE")
                        {
                            standardPurchaseOrderQuery += "  PO.WorkFlowStatusId != @PoStatusId and ";
                        }
                        if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                        {
                            //standardPurchaseOrderQuery += "GRN.PurchaseOrderId not in (select ipo.PurchaseOrderId from InvoicePOs ipo inner join invoicegrn invg on invg.invoiceid=ipo.invoiceid " +
                            //                              " inner join GoodsReceivedNote grn1 on grn1.PurchaseOrderId = ipo.PurchaseOrderId " +
                            //                              " and ipo.PurchaseOrderId = po.PurchaseOrderId) and GRN.WorkFlowStatusId != @PoStatusId and GRN.WorkFlowStatusId != @InvoiceStatusId and PO.POTypeId=@POTypeId and ";

                            standardPurchaseOrderQuery += " GRN.WorkFlowStatusId != @PoStatusId and GRN.WorkFlowStatusId != @InvoiceStatusId and GRN.WorkFlowStatusId != 6 and GRN.GRNInvoiceStatus=0 and PO.POTypeId=@POTypeId and ";
                        }
                        else if (purchaseOrderInput.From == "GRN")
                        {
                            standardPurchaseOrderQuery += " PO.WorkFlowStatusId != @GrnStatusId and ";
                        }
                    }
                    if (purchaseOrderInput.PurchaseOrderId > 0)
                    {
                        standardPurchaseOrderQuery += " PO.PurchaseOrderId=@PurchaseOrderId  and ";
                    }
                    else if (purchaseOrderInput.SupplierId > 0)
                    {
                        standardPurchaseOrderQuery += "PO.Supplierid = @SupplierId and ";
                        //standardPurchaseOrderQuery += " (PO.Supplierid = @SupplierId  OR PO.Supplierid = (SELECT ParentSupplierId FROM Supplier WHERE SupplierId = @SupplierId)) and ";
                    }


                    if (purchaseOrderInput.PoCode != "" && purchaseOrderInput.PoCode != null && purchaseOrderInput.PoCode != "null")
                    {
                        standardPurchaseOrderQuery += @"( 
                                                      PO.PurchaseOrderCode LIKE concat('%',@PoCode,'%') 
                                                      or
                                                      PO.DraftCode LIKE concat('%',@PoCode,'%')
                                                    ) 
                                                    and ";
                    }
                    if (purchaseOrderInput.SupplierName != "" && purchaseOrderInput.SupplierName != null && purchaseOrderInput.SupplierName != "null")
                    {
                        standardPurchaseOrderQuery += @"( 
                                                      S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                                    ) 
                                                   and ";
                    }
                    if (purchaseOrderInput.FromDate != null && purchaseOrderInput.ToDate != null)
                    {
                        standardPurchaseOrderQuery += @"( 
                                                      PO.CreatedDate BETWEEN @FromDate and @ToDate 
                                                    ) 
                                                   and ";
                    }

                    if (purchaseOrderInput.Search != "" && purchaseOrderInput.Search != null && purchaseOrderInput.Search != "null")
                    {
                        standardPurchaseOrderQuery += @"( 
                                                    PO.PurchaseOrderCode LIKE concat('%',@Search,'%')
                                                    or
                                                    PO.DraftCode LIKE concat('%',@Search,'%')
                                                    or 
                                                    S.SupplierName LIKE concat('%',@Search,'%') 
                                                    or 
                                                    usr.FirstName LIKE concat('%',@Search,'%') 
                                                    or 
                                                    PO.TotalAmount LIKE concat('%',@Search,'%') 
                                                    or 
                                                    PO.CreatedDate LIKE concat('%',@Search,'%') 
                                                 )
                                                 and ";
                    }
                    if (purchaseOrderInput.WorkFlowStatusId > 0)
                    {
                        if ((purchaseOrderInput.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) && (purchaseOrderInput.From == "GRN" || purchaseOrderInput.From == "SUPPLIERINVOICE"))
                        {
                            standardPurchaseOrderQuery += " WF.IsApproved = 1 and ";
                            if (purchaseOrderInput.From == "GRN")
                            {
                                standardPurchaseOrderQuery += " PO.WorkFlowStatusId != 9 and ";
                            }
                        }
                        else
                        {
                            standardPurchaseOrderQuery += " PO.WorkFlowStatusId = @WorkFlowStatusId and ";
                        }
                    }

                    standardPurchaseOrderQuery += " PO.Isdeleted = 0 ";

                    if (purchaseOrderInput.CompanyId > 0)
                    {
                        standardPurchaseOrderQuery += " and PO.CompanyId=@companyId ";
                    }
                    standardPurchaseOrderQuery += " and po.LocationID in ( select DepartmentId from usercompanydepartments where userId=@userId and CompanyId=@companyId) )";
                }

                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO) || purchaseOrderInput.WorkFlowProcessId == 0)
                {
                    //getting fixed asset purchase orders...
                    fixedAssetPurchaseOrders = @"( select ";
                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        fixedAssetPurchaseOrders += " distinct ";
                    }
                    fixedAssetPurchaseOrders += @" PO.FixedAssetPurchaseOrderCode as PurchaseOrderCode,
                                                     PO.FixedAssetPurchaseOrderId as PurchaseOrderId, 
                                                     PO.POTypeId, 
                                                     S.SupplierName,
                                                     usr.FirstName,PO.TotalAmount ,PO.CreatedDate,PO.UpdatedDate,PO.CreatedBy,
                                                     PO.WorkFlowStatusId,PO.StatusId as PurchaseOrderStatusId,WF.Statustext as WorkFlowStatusText,
                                                     PO.DraftCode, WF.IsApproved AS IsDocumentApproved, PO.Supplierid
                                                from 
                                                dbo.FixedAssetPurchaseOrder as PO 
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
                                                     ";
                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        fixedAssetPurchaseOrders += " join GoodsReceivedNote as GRN on GRN.PurchaseOrderId=PO.FixedAssetPurchaseOrderId ";
                    }

                    fixedAssetPurchaseOrders += " where ";

                    if (purchaseOrderInput.From == "GRN" || purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        if (purchaseOrderInput.From != "SUPPLIERINVOICE")
                        {
                            fixedAssetPurchaseOrders += " PO.WorkFlowStatusId != @PoStatusId and ";
                        }
                        if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                        {
                            fixedAssetPurchaseOrders += " GRN.WorkFlowStatusId != @PoStatusId and GRN.WorkFlowStatusId != @InvoiceStatusId and GRN.WorkFlowStatusId != 6 and GRN.GRNInvoiceStatus=0 and PO.POTypeId=@POTypeId and ";
                        }
                        else if (purchaseOrderInput.From == "GRN")
                        {
                            fixedAssetPurchaseOrders += " PO.WorkFlowStatusId != @GrnStatusId and ";
                        }
                    }
                    if (purchaseOrderInput.PurchaseOrderId > 0)
                    {
                        fixedAssetPurchaseOrders += "PO.FixedAssetPurchaseOrderId=@PurchaseOrderId  and";
                    }
                    else if (purchaseOrderInput.SupplierId > 0)
                    {
                        fixedAssetPurchaseOrders += "PO.Supplierid = @SupplierId and ";
                        //fixedAssetPurchaseOrders += " (PO.Supplierid = @SupplierId  OR PO.Supplierid = (SELECT ParentSupplierId FROM Supplier WHERE SupplierId = @SupplierId)) and ";
                    }

                    if (purchaseOrderInput.PoCode != "" && purchaseOrderInput.PoCode != null && purchaseOrderInput.PoCode != "null")
                    {
                        fixedAssetPurchaseOrders += @"( 
                                                    PO.FixedAssetPurchaseOrderCode LIKE concat('%',@PoCode,'%') 
                                                    or
                                                    PO.DraftCode LIKE concat('%',@PoCode,'%')
                                                   ) 
                                                  and ";
                    }
                    if (purchaseOrderInput.SupplierName != "" && purchaseOrderInput.SupplierName != null && purchaseOrderInput.SupplierName != "null")
                    {
                        fixedAssetPurchaseOrders += @"( 
                                                    S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                                 ) 
                                                 and ";
                    }
                    if (purchaseOrderInput.FromDate != null && purchaseOrderInput.ToDate != null)
                    {
                        fixedAssetPurchaseOrders += @"( 
                                                      PO.CreatedDate BETWEEN @FromDate and @ToDate 
                                                    ) 
                                                   and ";
                    }
                    if (purchaseOrderInput.Search != "" && purchaseOrderInput.Search != null && purchaseOrderInput.Search != "null")
                    {
                        fixedAssetPurchaseOrders += @"( 
                                                    PO.FixedAssetPurchaseOrderCode LIKE concat('%',@Search,'%')
                                                    or
                                                    PO.DraftCode LIKE concat('%',@Search,'%')
                                                    or 
                                                    S.SupplierName LIKE concat('%',@Search,'%') 
                                                    or
                                                    usr.FirstName LIKE concat('%',@Search,'%') 
                                                    or 
                                                    PO.TotalAmount LIKE concat('%',@Search,'%')
                                                    or 
                                                    PO.CreatedDate LIKE concat('%',@Search,'%') 
                                             ) and ";
                    }

                    if (purchaseOrderInput.WorkFlowStatusId > 0)
                    {
                        if ((purchaseOrderInput.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) && (purchaseOrderInput.From == "GRN" || purchaseOrderInput.From == "SUPPLIERINVOICE"))
                        {
                            fixedAssetPurchaseOrders += " WF.IsApproved = 1 and ";
                            if (purchaseOrderInput.From == "GRN")
                            {
                                fixedAssetPurchaseOrders += " PO.WorkFlowStatusId != 9 and ";
                            }
                        }
                        else
                        {
                            fixedAssetPurchaseOrders += " PO.WorkFlowStatusId = @WorkFlowStatusId and ";
                        }
                    }
                    fixedAssetPurchaseOrders += " PO.Isdeleted = 0 ";

                    if (purchaseOrderInput.CompanyId > 0)
                    {
                        fixedAssetPurchaseOrders += " and PO.CompanyId=@companyId ";
                    }
                    fixedAssetPurchaseOrders += " and po.LocationID in ( select DepartmentId from usercompanydepartments where userId=@userId and CompanyId=@companyId) ) ";
                }

                if ((purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable) || purchaseOrderInput.WorkFlowProcessId == 0) && purchaseOrderInput.From == "SUPPLIERINVOICE")
                {
                    //getting contract asset purchase orders...
                    contractPOSearchQuery = @" ( select PO.CPONumber as PurchaseOrderCode,
                                             PO.CPOID as PurchaseOrderId, 
                                             PO.POTypeId, 
                                             S.SupplierName,
                                             usr.FirstName,PO.TotalAmount ,PO.CreatedDate,PO.UpdatedDate,PO.CreatedBy,PO.WorkFlowStatusId,PO.StatusId as PurchaseOrderStatusId,WF.Statustext as WorkFlowStatusText,
                                             PO.DraftCode, WF.IsApproved AS IsDocumentApproved, PO.Supplierid
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
                                            where po.LocationID in ( select DepartmentId from usercompanydepartments where userId=@userId and CompanyId=@companyId) and ";
                    if (purchaseOrderInput.From == "GRN" || purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        contractPOSearchQuery += " PO.WorkFlowStatusId != @PoStatusId and ";

                        if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                        {
                            contractPOSearchQuery += " PO.WorkFlowStatusId != @InvoiceStatusId and ";
                        }
                        else if (purchaseOrderInput.From == "GRN")
                        {
                            contractPOSearchQuery += " PO.WorkFlowStatusId != @GrnStatusId and ";
                        }
                    }
                    if (purchaseOrderInput.PurchaseOrderId > 0)
                    {
                        contractPOSearchQuery += "PO.CPOID = @PurchaseOrderId  and ";
                    }
                    else if (purchaseOrderInput.SupplierId > 0)
                    {
                        contractPOSearchQuery += "PO.Supplierid = @SupplierId and ";
                        //contractPOSearchQuery += " (PO.Supplierid = @SupplierId  OR PO.Supplierid = ( SELECT ParentSupplierId FROM Supplier WHERE SupplierId = @SupplierId)) and ";
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
                                             ) and ";
                    }
                    if (purchaseOrderInput.WorkFlowStatusId > 0)
                    {
                        if ((purchaseOrderInput.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) && (purchaseOrderInput.From == "GRN" || purchaseOrderInput.From == "SUPPLIERINVOICE"))
                        {
                            contractPOSearchQuery += " WF.IsApproved = 1 and ";
                            if (purchaseOrderInput.From == "GRN")
                            {
                                contractPOSearchQuery += " PO.WorkFlowStatusId != 9 and ";
                            }
                        }
                        else
                        {
                            contractPOSearchQuery += " PO.WorkFlowStatusId = @WorkFlowStatusId and ";
                        }
                    }
                    contractPOSearchQuery += " PO.Isdeleted = 0 ";

                    if (purchaseOrderInput.CompanyId > 0)
                    {
                        contractPOSearchQuery += " and PO.CompanyId=@companyId ";
                    }
                    contractPOSearchQuery += " and PO.MasterCPOID IS NULL ) ";
                }

                if ((purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo) || purchaseOrderInput.WorkFlowProcessId == 0))
                {

                    expenseQuery = @" ( select ";
                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        expenseQuery += " distinct ";
                    }
                    expenseQuery += @" PO.ExpensesPurchaseOrderCode as PurchaseOrderCode,
					                            PO.ExpensesPurchaseOrderId as PurchaseOrderId,
                                                PO.POTypeId, 
					                            S.SupplierName,
                                                usr.FirstName,PO.TotalAmount ,PO.CreatedDate,PO.UpdatedDate,PO.CreatedBy,PO.WorkFlowStatusId,PO.StatusId as PurchaseOrderStatusId,WF.Statustext as WorkFlowStatusText,
                                                PO.DraftCode, WF.IsApproved AS IsDocumentApproved, PO.Supplierid
				                            from
					                            dbo.ExpensesPurchaseOrder as PO
				                            left join dbo.Supplier  as S
					                            on
					                            PO.Supplierid = S.SupplierId
                                            join dbo.UserProfile as usr 
                                                 on 
                                                 usr.UserID=PO.RequestedBy 
				                            join dbo.PurchaseOrderTypes as POT
					                             on
					                             PO.POTypeId = POT.PurchaseOrderTypeId
                                            left join WorkFlowStatus as WF 
                                                 on 
                                                 PO.WorkFlowStatusId = WF.WorkFlowStatusId 
				                             ";

                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        expenseQuery += " join GoodsReceivedNote as GRN on GRN.PurchaseOrderId=PO.ExpensesPurchaseOrderId ";
                    }

                    expenseQuery += " where ";

                    if (purchaseOrderInput.From == "GRN" || purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        if (purchaseOrderInput.From != "SUPPLIERINVOICE")
                        {
                            expenseQuery += " PO.WorkFlowStatusId != @PoStatusId and ";
                        }
                        if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                        {
                            expenseQuery += " GRN.WorkFlowStatusId != @PoStatusId and GRN.WorkFlowStatusId != @InvoiceStatusId and GRN.WorkFlowStatusId != 6 and GRN.GRNInvoiceStatus=0 and PO.POTypeId=@POTypeId and ";
                        }
                        else if (purchaseOrderInput.From == "GRN")
                        {
                            expenseQuery += " PO.WorkFlowStatusId != @GrnStatusId and ";
                        }
                    }
                    if (purchaseOrderInput.CompanyId > 0)
                    {
                        expenseQuery += " PO.CompanyId = @CompanyId and ";
                    }

                    if (purchaseOrderInput.PurchaseOrderId > 0)
                    {
                        expenseQuery += " PO.ExpensesPurchaseOrderId = @PurchaseOrderId and";
                    }

                    else if (purchaseOrderInput.SupplierId > 0)
                    {
                        expenseQuery += "PO.Supplierid = @SupplierId and ";
                    }

                    if (purchaseOrderInput.PoCode != "" && purchaseOrderInput.PoCode != null && purchaseOrderInput.PoCode != "null")
                    {
                        expenseQuery += @"( 
                                                 PO.ExpensesPurchaseOrderCode LIKE concat('%',@PoCode,'%') 
                                                 or
                                                 PO.DraftCode LIKE concat('%',@PoCode,'%')
                                               )
                                             and ";
                    }
                    if (purchaseOrderInput.SupplierName != "" && purchaseOrderInput.SupplierName != null && purchaseOrderInput.SupplierName != "null")
                    {
                        expenseQuery += @"(
                                                   S.SupplierName LIKE concat('%',@SupplierName,'%') 
                                               ) 
                                              and ";
                    }
                    if (purchaseOrderInput.FromDate != null && purchaseOrderInput.ToDate != null)
                    {
                        expenseQuery += @"( 
                                                      PO.CreatedDate BETWEEN @FromDate and @ToDate 
                                                    ) 
                                                   and ";
                    }
                    if (purchaseOrderInput.Search != "" && purchaseOrderInput.Search != null && purchaseOrderInput.Search != "null")
                    {
                        expenseQuery += @" ( 
                                            PO.ExpensesPurchaseOrderCode LIKE concat('%',@Search,'%') 
                                            or
                                            PO.DraftCode LIKE concat('%',@Search,'%')
                                            or 
                                            S.SupplierName LIKE concat('%',@Search,'%')
                                           ) and ";
                    }
                    if (purchaseOrderInput.WorkFlowStatusId > 0)
                    {
                        if ((purchaseOrderInput.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)) && (purchaseOrderInput.From == "GRN" || purchaseOrderInput.From == "SUPPLIERINVOICE"))
                        {
                            expenseQuery += " WF.IsApproved = 1 and ";
                            if (purchaseOrderInput.From == "GRN")
                            {
                                expenseQuery += " PO.WorkFlowStatusId != 9 and ";
                            }
                        }
                        else
                        {
                            expenseQuery += " PO.WorkFlowStatusId = @WorkFlowStatusId and ";
                        }
                    }
                    expenseQuery += " PO.Isdeleted = 0 ";

                    if (purchaseOrderInput.CompanyId > 0)
                    {
                        expenseQuery += " and PO.CompanyId=@companyId ";
                    }
                    expenseQuery += " and po.LocationID in ( select DepartmentId from usercompanydepartments where userId=@userId and CompanyId=@companyId) ) ";
                }

                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo) || purchaseOrderInput.WorkFlowProcessId == 0)
                {
                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        if (!purchaseOrderInput.IsPOC)
                        {
                            unionQuery += standardPurchaseOrderQuery;
                            if (purchaseOrderInput.WorkFlowProcessId == 0)
                            {
                                unionQuery += "  UNION ALL ";
                            }
                        }
                    }
                    else
                    {
                        unionQuery += standardPurchaseOrderQuery;
                        if (purchaseOrderInput.WorkFlowProcessId == 0)
                        {
                            unionQuery += "  UNION ALL ";
                        }
                    }
                }
                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO) || purchaseOrderInput.WorkFlowProcessId == 0)
                {

                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        if (!purchaseOrderInput.IsPOC)
                        {
                            unionQuery += fixedAssetPurchaseOrders;
                            if (purchaseOrderInput.WorkFlowProcessId == 0)
                            {
                                unionQuery += "  UNION ALL ";
                            }
                        }
                    }
                    else
                    {
                        unionQuery += fixedAssetPurchaseOrders;
                        if (purchaseOrderInput.WorkFlowProcessId == 0)
                        {
                            unionQuery += "  UNION ALL ";
                        }
                    }
                }
                if ((purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable) || purchaseOrderInput.WorkFlowProcessId == 0) && purchaseOrderInput.From == "SUPPLIERINVOICE")
                {
                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        if (purchaseOrderInput.IsPOC)
                        {
                            unionQuery += contractPOSearchQuery;
                        }
                    }
                    else
                    {
                        unionQuery += contractPOSearchQuery;
                        if (purchaseOrderInput.WorkFlowProcessId == 0 && purchaseOrderInput.From != "SupplierInvoice")
                        {
                            unionQuery += "  UNION ALL ";
                        }
                    }

                }
                if (purchaseOrderInput.WorkFlowProcessId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo) || purchaseOrderInput.WorkFlowProcessId == 0)
                {
                    if (purchaseOrderInput.From == "SUPPLIERINVOICE")
                    {
                        if (!purchaseOrderInput.IsPOC)
                        {
                            unionQuery += expenseQuery;
                        }
                    }
                    else
                    {
                        unionQuery += expenseQuery;
                    }
                }

                string purchaseOrderSearchQuery = @" select (case when WorkFlowStatusText = 'Draft' then 1 else 2 end)  as WorkflowOrder,* from 
                                                    ( ";
                purchaseOrderSearchQuery += unionQuery;

                purchaseOrderSearchQuery += @" ) as PO 
                                                    order by 
                                                      WorkflowOrder,PO.CreatedDate desc ";
                if (purchaseOrderInput.Take > 0)
                {
                    purchaseOrderSearchQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ;";
                    purchaseOrderSearchQuery += " select COUNT(*) from ( ";
                    purchaseOrderSearchQuery += unionQuery;
                    purchaseOrderSearchQuery += " ) as PO ";
                }
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple(purchaseOrderSearchQuery, new
                {
                    Action = "SELECT",
                    Skip = purchaseOrderInput.Skip,
                    Take = purchaseOrderInput.Take,
                    userId = purchaseOrderInput.UserId,
                    Search = purchaseOrderInput.Search,
                    POTypeId = purchaseOrderInput.POTypeId,
                    SupplierId = purchaseOrderInput.SupplierId,
                    PurchaseOrderId = purchaseOrderInput.PurchaseOrderId,
                    WorkFlowStatusId = purchaseOrderInput.WorkFlowStatusId,
                    CompanyId = purchaseOrderInput.CompanyId,
                    PoCode = purchaseOrderInput.PoCode,
                    SupplierName = purchaseOrderInput.SupplierName,
                    FromDate = purchaseOrderInput.FromDate,
                    ToDate = purchaseOrderInput.ToDate,
                    PoStatusId = Convert.ToInt32(WorkFlowStatus.Void),
                    InvoiceStatusId = Convert.ToInt32(WorkFlowStatus.Invoiced),
                    GrnStatusId = Convert.ToInt32(WorkFlowStatus.Received)

                }, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    purchaseOrderDisplayResult.PurchaseOrders = result.Read<PurchaseOrderList>().AsList();
                    if (purchaseOrderInput.Take > 0)
                    {
                        //total number of purchase orders
                        purchaseOrderDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                    else
                    {
                        purchaseOrderDisplayResult.TotalRecords = purchaseOrderDisplayResult.PurchaseOrders.Count;
                    }
                    purchaseOrderDisplayResult.QueryStr = purchaseOrderSearchQuery;

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
        public PurchaseOrder GetPurchaseOrderDetails(string purchaseOrderId, int? companyId = null)
        {
            try
            {
                PurchaseOrder purchaseOrderDetailsObj = new PurchaseOrder();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("PurchaseOrderCreation_CRUD", new
                {

                    Action = "SELECTBYID",
                    PurchaseOrderId = purchaseOrderId,
                    ProcessId = WorkFlowProcessTypes.InventoryPo,
                    CompanyId = companyId

                }, commandType: CommandType.StoredProcedure))
                {
                    //purchase order details..
                    purchaseOrderDetailsObj = result.Read<PurchaseOrder, Suppliers, SupplierSubCode, PurchaseOrder>((Pc, Su, Ssc) =>
                     {
                         Pc.Supplier = Su;
                         Pc.SupplierSubCode = Ssc;
                         return Pc;
                     }, splitOn: "SupplierId, SubCodeId").FirstOrDefault();
                    if (purchaseOrderDetailsObj != null)
                    {
                        //purchase order items.
                        purchaseOrderDetailsObj.PurchaseOrderItems = result.Read<PurchaseOrderItems, GetItemMasters, AccountCode, PurchaseOrderItems>((Pc, IM, Ac) =>
                        {
                            decimal taxTotal = 0;
                            decimal itemTotalPrice = 0;
                            decimal totalPrice = 0;
                            decimal totalbefTax = 0;
                            if (IM != null && IM.ItemMasterId > 0)
                            {
                                Pc.Item = IM;
                            }
                            else
                            {
                                Pc.Item = new GetItemMasters() { ItemMasterId = 0, ItemName = Pc.ServiceText };
                            }

                            if ((Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) || (Pc.TypeId == 0))
                            {
                                Pc.ItemType = "Item";
                            }
                            if (Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                            {
                                Pc.ItemType = "Service";
                            }
                            if (Ac != null && Ac.AccountCodeId > 0)
                            {
                                Pc.Service = Ac;
                            }
                            else
                            {
                                Pc.Service = new AccountCode() { AccountCodeId = 0, Description = "" };
                            }
                            SharedRepository.GetPurchaseOrderItemPrice(Pc.Unitprice, Pc.ItemQty, Pc.TaxAmount, Pc.Discount, purchaseOrderDetailsObj.IsGstBeforeDiscount, out taxTotal, out itemTotalPrice, out totalPrice, out totalbefTax);
                            Pc.TaxTotal = taxTotal;
                            Pc.ItemTotalPrice = itemTotalPrice;
                            Pc.Totalprice = totalPrice;
                            Pc.TotalbefTax = totalbefTax;
                            return Pc;
                        }, splitOn: "ItemMasterId, AccountCodeId").ToList();

                        //purchaseOrderDetailsObj.SPOQuotationItem = result.Read<SPOQuotationItem, Suppliers, SPOQuotationItem>((Pc, IM) =>
                        //{
                        //    Pc.Supplier = IM;
                        //    return Pc;
                        //}, splitOn: "SupplierId").ToList();
                        purchaseOrderDetailsObj.SPOQuotationItem = result.Read<SPOQuotationItem>().ToList();

                        UserProfile currentApproverDetails = result.Read<UserProfile>().FirstOrDefault();
                        if (currentApproverDetails != null)
                        {
                            //purchase order items.
                            purchaseOrderDetailsObj.CurrentApproverUserId = currentApproverDetails.UserID;
                            purchaseOrderDetailsObj.CurrentApproverUserName = currentApproverDetails.UserName;
                        }
                        decimal subTotal = 0;
                        subTotal = purchaseOrderDetailsObj.PurchaseOrderItems.Sum(i => i.ItemTotalPrice);
                        // var totalTax = (subTotal * purchaseOrderDetailsObj.TaxRate / 100);
                        var totalTax = 0;
                        // purchaseOrderDetailsObj.TotalTax = totalTax;
                        purchaseOrderDetailsObj.SubTotal = subTotal;
                        purchaseOrderDetailsObj.TotalAmount = (subTotal - purchaseOrderDetailsObj.Discount) + totalTax + purchaseOrderDetailsObj.ShippingCharges + purchaseOrderDetailsObj.OtherCharges;
                        purchaseOrderDetailsObj.ContactPersons = result.Read<SupplierContactPerson>().ToList();
                        purchaseOrderDetailsObj.AmountinWords = SharedRepository.changeToWords(purchaseOrderDetailsObj.TotalAmount.ToString("0.00"), true);
                        var quotationattachment = this.m_dbconnection.Query<SPOQuotationAttachments>("SPOQuotationFileOperations_CRUD", new
                        {
                            Action = "SELECTSPOQUOTATION",
                            PurchaseOrderId = purchaseOrderId,
                            POTypeId = PurchaseOrderType.InventoryPo
                        }, commandType: CommandType.StoredProcedure);
                        purchaseOrderDetailsObj.SPOQuotationAttachment = quotationattachment.ToList();
                        var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                        {
                            Action = "SELECT",
                            RecordId = purchaseOrderId,
                            AttachmentTypeId = Convert.ToInt32(AttachmentType.InventoryPurchaseOrder) //static value need to change

                        }, commandType: CommandType.StoredProcedure);
                        if (purchaseOrderDetailsObj != null)
                        {
                            purchaseOrderDetailsObj.Attachments = attachments.ToList();
                        }
                        this.sharedRepository = new SharedRepository();
                        DocumentAddress address = this.sharedRepository.GetDocumentAddress(purchaseOrderDetailsObj.POTypeId, purchaseOrderDetailsObj.PurchaseOrderId, purchaseOrderDetailsObj.CompanyId);
                        purchaseOrderDetailsObj.SupplierAddress = address == null ? string.Empty : address.Address;
                    }
                    return purchaseOrderDetailsObj;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        /*
            this method is used to create the purchase order...
        */
        public int CreatePurchaseOrder(PurchaseOrder purchaseOrder)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region purchase order creation...
                        var paramaterObj = new DynamicParameters();
                        string poCode = transactionObj.Connection.QueryFirstOrDefault<string>("PurchaseOrderCreation_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        string DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        //string draftCodePrefix = ConfigurationManager.AppSettings["DraftCodePrefix"].ToString();
                        string purchaseOrderCode = DraftCode + ModuleCodes.InventoryPurchaseOrder + "-" + poCode;
                        int purchaseOrderId = transactionObj.Connection.QueryFirstOrDefault<int>("PurchaseOrderCreation_CRUD", new
                        {
                            Action = "INSERT",
                            PurchaseOrderCode = purchaseOrderCode,
                            CompanyId = purchaseOrder.CompanyId,
                            LocationId = purchaseOrder.LocationId,
                            Supplierid = purchaseOrder.Supplier.SupplierId,
                            RequestedBy = purchaseOrder.RequestedBy,
                            Discount = purchaseOrder.Discount,
                            TaxRate = purchaseOrder.TaxRate,
                            ShippingCharges = purchaseOrder.ShippingCharges,
                            OtherCharges = purchaseOrder.OtherCharges,
                            TotalAmount = purchaseOrder.TotalAmount,
                            CreatedBy = purchaseOrder.CreatedBy,
                            CreatedDate = DateTime.Now,
                            CostOfService = purchaseOrder.CostOfServiceId,
                            POTypeId = purchaseOrder.POTypeId,
                            ExpectedDeliveryDate = purchaseOrder.ExpectedDeliveryDate,
                            VendorReferences = purchaseOrder.VendorReferences,
                            CurrencyId = purchaseOrder.CurrencyId,
                            WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                            StatusId = Convert.ToInt32(PurchaseOrderStatus.Draft),
                            Instructions = purchaseOrder.Instructions,
                            Justifications = purchaseOrder.Justifications,
                            IsGstRequired = purchaseOrder.IsGstRequired,
                            DeliveryAddress = purchaseOrder.DeliveryAddress,
                            DeliveryTermId = purchaseOrder.DeliveryTermId,
                            Reasons = purchaseOrder.Reasons,
                            PaymentTermId = purchaseOrder.PaymentTermId,
                            IsGstBeforeDiscount = purchaseOrder.IsGstBeforeDiscount,
                            RemarksQuotation = purchaseOrder.RemarksQuotation,
                            //SupplierSubCodeId = purchaseOrder.SupplierSubCode == null ? (int?)null : purchaseOrder.SupplierSubCode.SubCodeId
                            SupplierSubCodeId = purchaseOrder.SupplierSubCodeId,
                            ContactPersonName = purchaseOrder.ContactPersonName,
                            ContactNo = purchaseOrder.ContactNo,
                            ContactEmail = purchaseOrder.ContactEmail,
                            InventoryRequestId = purchaseOrder.InventoryRequestId
                        },
                                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);
                        #endregion

                        #region  we are saving Sub contractor items...
                        if (purchaseOrder.SPOQuotationItem.Count > 0)
                        {
                            int count = 0;
                            FileOperations fileOperationsObj = new FileOperations();
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            foreach (var record in purchaseOrder.SPOQuotationItem)
                            {
                                int QuotationId = transactionObj.Connection.QueryFirstOrDefault<int>("PurchaseOrderCreation_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    SupplierId = 0,
                                    Supplier = record.Supplier.Trim(),
                                    PurchaseOrderId = purchaseOrderId,
                                    QuotationAmount = record.QuotationAmount,
                                    QuotationRemarks = record.QuotationRemarks,
                                    CreatedBy = purchaseOrder.CreatedBy,
                                    POTypeId = purchaseOrder.POTypeId,
                                    CreatedDate = DateTime.Now,
                                },
                                   transaction: transactionObj,
                                   commandType: CommandType.StoredProcedure);

                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    try
                                    {
                                        //if (purchaseOrder.files[i].FileName.Contains("SPOFiles@" + count))
                                        //{
                                        char[] chDelimiter = { '@', '!' };
                                        string[] name = purchaseOrder.files[i].FileName.Split(chDelimiter, 3);
                                        //string[] name = purchaseOrder.files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);

                                        if (record.RowIndex == RowID)
                                        {
                                            string Filname = name[2];
                                            var itemObj = new DynamicParameters();
                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@PurchaseOrderId", purchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@QuotationId", QuotationId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@FileName", Filname, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                            quotationItemToAdd.Add(itemObj);
                                        }
                                    }
                                    catch { }
                                }
                                count++;
                            }
                            var SPOQuotationItemSaveResult = transactionObj.Connection.Execute("SPOQuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        #endregion


                        #region  we are saving purchase order items...
                        if (purchaseOrder.PurchaseOrderItems != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in purchaseOrder.PurchaseOrderItems)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@PurchaseOrderId", purchaseOrderId, DbType.Int32, ParameterDirection.Input);

                                if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Item))
                                {
                                    itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ServiceText", record.Item.ItemMasterId == 0 ? record.Item.ItemName : "", DbType.String, ParameterDirection.Input);
                                }

                                if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                                {
                                    if (record.MeasurementUnitID > 0)
                                    {
                                        itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                                    }
                                    else
                                    {
                                        itemObj.Add("@MeasurementUnitId", null, DbType.Int32, ParameterDirection.Input);
                                    }

                                    itemObj.Add("@ItemMasterId", record.Service.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@ServiceText", record.Service.AccountCodeId == 0 ? record.Service.Description : "", DbType.String, ParameterDirection.Input);
                                }

                                itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var purchaseOrderItemSaveResult = transactionObj.Connection.Execute("PurchaseOrderCreation_CRUD", itemToAdd, transaction: transactionObj,
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
                                    ModuleName = AttachmentFolderNames.InventoryPurchaseOrder,
                                    Files = purchaseOrder.files,
                                    UniqueId = purchaseOrderId.ToString()
                                });
                                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    var itemObj = new DynamicParameters();
                                    if (!purchaseOrder.files[i].FileName.Contains("SPOFiles@"))
                                    {
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.InventoryPurchaseOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                        itemObj.Add("@RecordId", purchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", purchaseOrder.files[i].FileName, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        fileToSave.Add(itemObj);
                                    }
                                }
                                var purchaseOrderFileSaveResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                            }
                            catch (Exception e)
                            {
                                throw e;
                            }

                        }
                        //commiting the transaction...

                        #endregion
                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = purchaseOrder.SupplierAddress,
                            CompanyId = purchaseOrder.CompanyId,
                            DocumentId = purchaseOrderId,
                            ProcessId = (int)WorkFlowProcessTypes.InventoryPo
                        }, transactionObj);
                        #endregion

                        #region
                        if (purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            purchaseOrder.PurchaseOrderId = purchaseOrderId;
                            purchaseOrder.PurchaseOrderCode = purchaseOrderCode;

                            SendForApproval(purchaseOrder, false, transactionObj, transactionObj.Connection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        if (purchaseOrder.WorkFlowStatusId != Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            UserProfileRepository userProfileRepository = new UserProfileRepository();
                            var user = userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                            DateTime now = DateTime.Now;
                            if (string.IsNullOrEmpty(purchaseOrder.PurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrderCode))
                            {
                                AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreatePurchaseOrder", "Created by " + UserName + " on " + now + "", purchaseOrder.CompanyId);
                                AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreatePurchaseOrder", "Saved as Draft " + UserName + " on " + now + "", purchaseOrder.CompanyId);

                            }
                            else
                            {
                                AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "create", purchaseOrder.CreatedBy.ToString(), purchaseOrderId.ToString(), "CreatePurchaseOrder", "Purchase Order " + purchaseOrder.PurchaseOrderCode + " created by " + UserName + "", purchaseOrder.CompanyId);
                            }
                        }
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

        public void SendForApproval(PurchaseOrder purchaseOrder, bool isFromUi, IDbTransaction dbTransaction = null, IDbConnection dbConnection = null)
        {
            string UserName = "";
            if (isFromUi == true)
            {
                dbConnection = this.m_dbconnection;
                dbConnection.Open();
                dbTransaction = this.m_dbconnection.BeginTransaction();
            }
            try
            {
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                string nextUserRole = string.Empty;
                UserProfile nextUserRoles = new UserProfile();
                workFlowConfigRepository = new WorkFlowConfigurationRepository();
                string itemCategory = string.Empty;
                decimal totalQuantity = 0;
                if (purchaseOrder.PurchaseOrderItems != null)
                {
                    if (purchaseOrder.PurchaseOrderItems.Count > 0)
                    {
                        itemCategory = purchaseOrder.PurchaseOrderItems[0].Item != null ? purchaseOrder.PurchaseOrderItems.Select(x => x.Item.ItemCategoryName).FirstOrDefault() : string.Empty;
                        totalQuantity = purchaseOrder.PurchaseOrderItems.Sum(d => d.ItemQty);
                    }
                }


                IEnumerable<WorkFlow> workFlowConfig = workFlowConfigRepository.GetDocumentWorkFlow(new List<WorkFlowParameter>(){
                                   new  WorkFlowParameter{
                                        CompanyId = purchaseOrder.CompanyId,
                                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.InventoryPo),
                                        Value = Convert.ToString(purchaseOrder.TotalbefTaxSubTotal),
                                        DocumentId = purchaseOrder.PurchaseOrderId,
                                        CreatedBy = purchaseOrder.CreatedBy,
                                        DocumentCode =purchaseOrder.PurchaseOrderCode,
                                        ItemCategory = itemCategory,
                                        ItemQuantity = totalQuantity.ToString(),
                                        WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                                        LocationId = purchaseOrder.LocationId
                                   }
                                }, dbTransaction, dbConnection);

                var user = userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                if (user != null)
                {
                    UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                }
                
                DateTime now = DateTime.Now;
                nextUserRoles = userProfileRepository.GetUserRolesInCompany((int)workFlowConfig.First().ApproverUserId, purchaseOrder.CompanyId);
                nextUserRole = nextUserRoles.Roles.FindAll(x => x.RoleName.ToLower().Contains("verifier")).Count > 0 ? "V" : "A";
                var approver = userProfileRepository.GetUserById(workFlowConfig.First().ApproverUserId);
                string Workflowname = string.Format("{0} {1}", approver.FirstName, approver.LastName);
                //if (string.IsNullOrEmpty(purchaseOrder.PurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrder.DraftCode))
                //{
                if (purchaseOrder.PurchaseOrderStatusId == (int)WorkFlowStatus.CancelledApproval)
                    //AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "resend for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "SendForApproval", string.Format("Purchase Order Resend for {0} to {1} on {2} {3}", nextUserRole == "V" ? "Verification" : "Approval", Workflowname, now, purchaseOrder.RemarksQuotation), purchaseOrder.CompanyId);
                    AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "resend for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "SendForApproval", string.Format("Purchase Order Resend for {0} to {1} on {2}", nextUserRole == "V" ? "Verification" : "Approval", Workflowname, now), purchaseOrder.CompanyId);

                else
                    AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "sent for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "SendForApproval", string.Format("Sent to {0} for {1} on {2}", Workflowname, nextUserRole == "V" ? "Verification" : "Approval", now), purchaseOrder.CompanyId);
                //if (workFlowConfig.ToList().Count > 2)
                //{
                //    string Workflowname2 = userProfileRepository.GetUserById(workFlowConfig.ToList()[1].ApproverUserId).UserName;
                //    AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "sent for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "SendForApproval", "Consent by " + Workflowname + " and sent to " + Workflowname2 + "  consent on " + now + " ", purchaseOrder.CompanyId);

                //}
                //}
                //else
                //{
                //if (string.IsNullOrEmpty(purchaseOrder.PurchaseOrderCode))
                //{
                //    //get purchase order code based on purchase order id 
                //}
                //AuditLog.Info("PurchaseOrderCreation", "sent for approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "SendForApproval", "Sent to " + Workflowname + " for approver on " + now + "", purchaseOrder.CompanyId);
                //}
                //int updateResult = this.m_dbconnection.Execute("PurchaseOrderCreation_CRUD", new
                //{
                //    Action = "UPDATEWORKFLOWSTATUS",
                //    WorkFlowStatusId = (workFlowConfig==null|| workFlowConfig.Count()==0)?Convert.ToInt32(WorkFlowStatus.Approved):purchaseOrder.WorkFlowStatusId,
                //    PurchaseOrderId = purchaseOrder.PurchaseOrderId
                //},commandType:CommandType.StoredProcedure);
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
        /*
            this method is used to update the purchase order...
        */
        public int UpdatePurchaseOrder(PurchaseOrder purchaseOrder)
        {
            try
            {
                string check = null;

                PurchaseOrder poItem = GetPurchaseOrderDetails(purchaseOrder.PurchaseOrderId.ToString(), purchaseOrder.CompanyId);
                purchaseOrder.CurrentWorkFlowStatusId = poItem.WorkFlowStatusId;

                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region purchase order updation...

                        var paramaterObj = new DynamicParameters();

                        int updateResult = transactionObj.Connection.Execute("PurchaseOrderCreation_CRUD", new
                        {

                            Action = "UPDATE",
                            CompanyId = purchaseOrder.CompanyId,
                            LocationId = purchaseOrder.LocationId,
                            Supplierid = purchaseOrder.Supplier.SupplierId,
                            RequestedBy = purchaseOrder.RequestedBy,
                            Discount = purchaseOrder.Discount,
                            TaxRate = purchaseOrder.TaxRate,
                            ShippingCharges = purchaseOrder.ShippingCharges,
                            OtherCharges = purchaseOrder.OtherCharges,
                            TotalAmount = purchaseOrder.TotalAmount,
                            CreatedBy = purchaseOrder.CreatedBy,
                            CreatedDate = DateTime.Now,
                            CostOfService = purchaseOrder.CostOfServiceId,
                            POTypeId = purchaseOrder.POTypeId,
                            ExpectedDeliveryDate = purchaseOrder.ExpectedDeliveryDate,
                            VendorReferences = purchaseOrder.VendorReferences,
                            CurrencyId = purchaseOrder.CurrencyId,
                            WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                            StatusId = purchaseOrder.WorkFlowStatusId,
                            Instructions = purchaseOrder.Instructions,
                            Justifications = purchaseOrder.Justifications,
                            PurchaseOrderId = purchaseOrder.PurchaseOrderId,
                            IsGstRequired = purchaseOrder.IsGstRequired,
                            PaymentTermId = purchaseOrder.PaymentTermId,
                            DeliveryTermId = purchaseOrder.DeliveryTermId,
                            Reasons = purchaseOrder.Reasons,
                            DeliveryAddress = purchaseOrder.DeliveryAddress,
                            IsGstBeforeDiscount = purchaseOrder.IsGstBeforeDiscount,
                            RemarksQuotation = purchaseOrder.RemarksQuotation,
                            //SupplierSubCodeId = purchaseOrder.SupplierSubCode == null ? (int?)null : purchaseOrder.SupplierSubCode.SubCodeId
                            SupplierSubCodeId = purchaseOrder.SupplierSubCodeId,
                            ContactPersonName = purchaseOrder.ContactPersonName,
                            ContactNo = purchaseOrder.ContactNo,
                            ContactEmail = purchaseOrder.ContactEmail,
                            CurrentWorkFlowStatusId = poItem.WorkFlowStatusId,
                            InventoryRequestId = purchaseOrder.InventoryRequestId
                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);


                        #endregion

                        #region  we are saving Quotation items..
                        if (purchaseOrder.SPOQuotationItem != null)
                        {
                            FileOperations fileOperationsObj = new FileOperations();
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            int count = 0;
                            foreach (var record in purchaseOrder.SPOQuotationItem.Where(j => j.QuotationId == 0).Select(j => j))
                            {
                                int QuotationId = transactionObj.Connection.QueryFirstOrDefault<int>("PurchaseOrderCreation_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    SupplierId = 0,
                                    Supplier = record.Supplier.Trim(),
                                    PurchaseOrderId = purchaseOrder.PurchaseOrderId,
                                    QuotationAmount = record.QuotationAmount,
                                    QuotationRemarks = record.QuotationRemarks,
                                    CreatedBy = purchaseOrder.CreatedBy,
                                    POTypeId = purchaseOrder.POTypeId,
                                    CreatedDate = DateTime.Now
                                },
                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);

                                int countvalue = transactionObj.Connection.QueryFirstOrDefault<int>("SPOQuotationFileOperations_CRUD", new
                                {
                                    Action = "FETCHSPOQUOTATIONITEM",
                                    PurchaseOrderId = purchaseOrder.PurchaseOrderId,
                                    POTypeId = PurchaseOrderType.InventoryPo
                                },
                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);
                                //if (countvalue >= 0)
                                //{
                                //    if (count == 0)
                                //    {
                                //        count = countvalue + 1;
                                //    }
                                //}

                                //countvalue = countvalue;
                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    try
                                    {
                                        char[] chDelimiter = { '@', '!' };
                                        string[] name = purchaseOrder.files[i].FileName.Split(chDelimiter, 3);
                                        //string[] name = purchaseOrder.files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);
                                        //if (purchaseOrder.files[i].FileName.Contains("SPOFiles@" + count))
                                        //{
                                        if (record.RowIndex == RowID)
                                        {
                                            string Filname = name[2];
                                            var itemObj = new DynamicParameters();
                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@PurchaseOrderId", purchaseOrder.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@QuotationId", QuotationId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@FileName", Filname, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                            quotationItemToAdd.Add(itemObj);
                                        }
                                    }
                                    catch { }
                                }
                                check += count + ",";
                                count++;
                            }
                            var purchaseOrderRequestItemSaveResult = transactionObj.Connection.Execute("SPOQuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                        }

                        #endregion


                        #region  we are updating Quotation items..
                        if (purchaseOrder.SPOQuotationItem != null)
                        {
                            int add = 0;
                            int count = 0;

                            List<DynamicParameters> quotationItemToUpdate = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in purchaseOrder.SPOQuotationItem.Where(k => k.QuotationId > 0).Select(k => k))
                            {
                                for (var i = 0; i <= purchaseOrder.files.Count; i++)
                                {
                                    try
                                    {
                                        char[] chDelimiter = { '@', '!' };
                                        string[] name = purchaseOrder.files[i].FileName.Split(chDelimiter, 3);
                                        //string[] name = purchaseOrder.files[i].FileName.Split('@', '!');
                                        string RowID = (name[1]);
                                        if (check == null)
                                        {
                                            count = Convert.ToInt32(RowID);
                                            check += RowID + ",";
                                            break;
                                        }
                                        if (!check.Contains(RowID))
                                        {
                                            count = Convert.ToInt32(RowID);
                                            check += RowID + ",";
                                            break;
                                        }
                                    }
                                    catch { }
                                }
                                int updatequotationResult = transactionObj.Connection.Execute("PurchaseOrderCreation_CRUD", new
                                {
                                    Action = "UPDATEQUOTATIONITEM",
                                    QuotationId = record.QuotationId,
                                    QuotationRemarks = record.QuotationRemarks,
                                    SupplierId = 0,
                                    Supplier = record.Supplier.Trim(),
                                    QuotationAmount = record.QuotationAmount,
                                    POTypeId = purchaseOrder.POTypeId,
                                    CreatedBy = purchaseOrder.CreatedBy,
                                    CreatedDate = DateTime.Now
                                },
                                 transaction: transactionObj,
                                 commandType: CommandType.StoredProcedure);

                                for (var i = 0; i < purchaseOrder.files.Count; i++)
                                {
                                    try
                                    {
                                        char[] chDelimiter = { '@', '!' };
                                        string[] name = purchaseOrder.files[i].FileName.Split(chDelimiter, 3);
                                        //string[] name = purchaseOrder.files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);
                                        //if (purchaseOrder.files[i].FileName.Contains("SPOFiles@" + count))
                                        //{
                                        if (record.RowIndex == RowID)
                                        {
                                            string Filename = name[2];
                                            var itemObj1 = new DynamicParameters();
                                            itemObj1.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj1.Add("@PurchaseOrderId", purchaseOrder.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@QuotationId", record.QuotationId, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@FileName", Filename, DbType.String, ParameterDirection.Input);
                                            itemObj1.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                            itemObj1.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                            quotationItemToUpdate.Add(itemObj1);
                                        }
                                    }
                                    catch { }
                                }
                                //count++;
                                add++;

                            }
                            var purchaseOrderquotationItemSaveResult = transactionObj.Connection.Execute("SPOQuotationFileOperations_CRUD", quotationItemToUpdate, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                        }

                        #endregion



                        #region we are saving purchase order items...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrder.PurchaseOrderItems.Where(i => i.PurchaseOrderItemId == 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@PurchaseOrderId", purchaseOrder.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);

                            if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Item))
                            {
                                itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ServiceText", record.Item.ItemMasterId == 0 ? record.Item.ItemName : "", DbType.String, ParameterDirection.Input);
                            }

                            if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                            {
                                if (record.MeasurementUnitID > 0)
                                {
                                    itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                                }
                                else
                                {
                                    itemObj.Add("@MeasurementUnitId", null, DbType.Int32, ParameterDirection.Input);
                                }

                                itemObj.Add("@ItemMasterId", record.Service.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ServiceText", record.Service.AccountCodeId == 0 ? record.Service.Description : "", DbType.String, ParameterDirection.Input);
                            }

                            itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemQty", record.ItemQty, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);


                            itemToAdd.Add(itemObj);
                        }


                        var purchaseOrderItemSaveResult = transactionObj.Connection.Execute("PurchaseOrderCreation_CRUD", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);


                        #endregion

                        #region updating purchase order items...

                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in purchaseOrder.PurchaseOrderItems.Where(i => i.PurchaseOrderItemId > 0).Select(i => i))
                        {

                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@PurchaseOrderItemId", record.PurchaseOrderItemId, DbType.Int32, ParameterDirection.Input);

                            if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Item))
                            {
                                itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ServiceText", record.Item.ItemMasterId == 0 ? record.Item.ItemName : "", DbType.String, ParameterDirection.Input);
                            }

                            if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                            {
                                if (record.MeasurementUnitID > 0)
                                {
                                    itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                                }
                                else
                                {
                                    itemObj.Add("@MeasurementUnitId", null, DbType.Int32, ParameterDirection.Input);
                                }

                                itemObj.Add("@ItemMasterId", record.Service.AccountCodeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ServiceText", record.Service.AccountCodeId == 0 ? record.Service.Description : "", DbType.String, ParameterDirection.Input);
                            }

                            itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Discount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemsToUpdate.Add(itemObj);
                        }


                        var purchaseOrderItemUpdateResult = transactionObj.Connection.Execute("PurchaseOrderCreation_CRUD", itemsToUpdate,
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
                                itemObj.Add("@PurchaseOrderItemId", purchaseOrderItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToUpdate.Add(itemObj);
                            }
                        }

                        var purchaseOrderItemDeleteResult = transactionObj.Connection.Execute("PurchaseOrderCreation_CRUD", itemsToUpdate,
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
                            fileObj.Add("@RecordId", purchaseOrder.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            fileObj.Add("@AttachmentId", purchaseOrder.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                            fileToDelete.Add(fileObj);
                            var purchaseOrderFileDeleteResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                  commandType: CommandType.StoredProcedure);
                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.InventoryPurchaseOrder,
                                FilesNames = purchaseOrder.Attachments.Select(j => j.FileName).ToArray(),
                                UniqueId = purchaseOrder.PurchaseOrderId.ToString()
                            });
                        }

                        #endregion

                        #region deleting quotation items...

                        List<DynamicParameters> itemsToDelete2 = new List<DynamicParameters>();

                        if (purchaseOrder.SPOQuotationItemToDelete != null)
                        {
                            foreach (var quotationId in purchaseOrder.SPOQuotationItemToDelete)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "DELETEQUOTATIONITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@QuotationId", quotationId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemsToDelete2.Add(itemObj);
                            }
                        }

                        var SPOItemDeleteResult = transactionObj.Connection.Execute("PurchaseOrderCreation_CRUD", itemsToDelete2,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion


                        #region deleting quotation attachments
                        if (purchaseOrder.SPOQuotationAttachmentDelete != null)
                        {
                            for (var i = 0; i < purchaseOrder.SPOQuotationAttachmentDelete.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@SPOQuotationId", purchaseOrder.SPOQuotationAttachmentDelete[i].SPOQuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@QuotationId", purchaseOrder.SPOQuotationAttachmentDelete[i].QuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", purchaseOrder.SPOQuotationAttachmentDelete[i].RowId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@PurchaseOrderId", purchaseOrder.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                var spoquotationFileDeleteResult = transactionObj.Connection.Query<string>("SPOQuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                                   commandType: CommandType.StoredProcedure);

                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.InventoryPurchaseOrder,
                                    FilesNames = spoquotationFileDeleteResult.ToArray(),
                                    UniqueId = purchaseOrder.PurchaseOrderId.ToString()
                                });

                            }
                        }

                        #endregion

                        #region updating quotation attachments rowid
                        if (purchaseOrder.SPOQuotationAttachmentUpdateRowId != null)
                        {
                            for (var i = 0; i < purchaseOrder.SPOQuotationAttachmentUpdateRowId.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "UPDATEROW", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@SPOQuotationId", purchaseOrder.SPOQuotationAttachmentUpdateRowId[i].SPOQuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", purchaseOrder.SPOQuotationAttachmentUpdateRowId[i].RowId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@POTypeId", purchaseOrder.POTypeId, DbType.Int32, ParameterDirection.Input);
                                var Quotationrowupdate = transactionObj.Connection.Query<string>("SPOQuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                                   commandType: CommandType.StoredProcedure);
                            }
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
                                if (!purchaseOrder.files[i].FileName.Contains("SPOFiles@"))
                                {
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.InventoryPurchaseOrder), DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemObj.Add("@RecordId", purchaseOrder.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@FileName", purchaseOrder.files[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", purchaseOrder.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                    fileToSave.Add(itemObj);
                                }
                            }

                            var purchaseOrderFileSaveResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.InventoryPurchaseOrder,
                                Files = purchaseOrder.files,
                                UniqueId = purchaseOrder.PurchaseOrderId.ToString()
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                        #endregion

                        #region Update Document Address Details..
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = purchaseOrder.SupplierAddress,
                            CompanyId = purchaseOrder.CompanyId,
                            DocumentId = purchaseOrder.PurchaseOrderId,
                            ProcessId = purchaseOrder.POTypeId
                        }, transactionObj);
                        #endregion
                        //commiting the transaction...
                        //transactionObj.Commit();
                        #region
                        if (purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        {
                            SendForApproval(purchaseOrder, false, transactionObj, transactionObj.Connection);
                        }
                        else
                        {
                            transactionObj.Commit();
                        }
                        #endregion
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        var user = userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                        string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                        //if (string.IsNullOrEmpty(purchaseOrder.PurchaseOrderCode) && !string.IsNullOrEmpty(purchaseOrder.DraftCode))
                        //{
                        if (poItem.TotalAmount != purchaseOrder.TotalAmount)
                        {
                            AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "update", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "UpdatePurchaseOrder", "Purchase Order total recalculated, new total is " + string.Format(new CultureInfo("en-US"), "{0:C}", purchaseOrder.TotalAmount) + "", purchaseOrder.CompanyId);
                        }
                        //}
                        //else
                        //{
                        //AuditLog.Info("PurchaseOrderCreation", "update", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "UpdatePurchaseOrder", "Purchase Order " + purchaseOrder.PurchaseOrderCode + " updated by " + UserName + "", purchaseOrder.CompanyId);
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
         a)   a) for updating the purchase request created user  coments....
         b) 
         c) 
       */
        public int PurchaseOrderStatusUpdate(PurchaseOrderApproval requestApproval)
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
                        WorkFlow nextWorkFlowDetails = transactionObj.Connection.Query<WorkFlow>("WorkFlow_CRUD", new
                        {
                            Action = "UPDATESTATUS",
                            DocumentId = requestApproval.PurchaseOrderId,
                            ProcessId = requestApproval.ProcessId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId,
                            ApproverUserId = requestApproval.ApproverUserId,
                            CompanyId = requestApproval.CompanyId,
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                        #endregion                     

                        #region request status update..

                        int updateStatus = transactionObj.Connection.QueryFirstOrDefault<int>("PoApproval_CRUD", new
                        {
                            Action = "UPDATE",
                            PurchaseOrderId = requestApproval.PurchaseOrderId,
                            WorkFlowStatusId = requestApproval.WorkFlowStatusId,
                            ProcessId = requestApproval.ProcessId,
                            StatusId = Convert.ToInt32(PurchaseOrderStatus.Draft)
                        },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);

                        #endregion

                        #region inserting record in work flow audit trial

                        int auditTrialStatus = transactionObj.Connection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
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
                                DocumentId = requestApproval.PurchaseOrderId,
                                UserId = requestApproval.ApproverUserId,
                                IsRead = false,
                                CreatedBy = requestApproval.UserId,
                                CreatedDate = DateTime.Now,
                                IsNew = true,
                                CompanyId = requestApproval.CompanyId,
                                CompanyName = "",
                                IsforAll = false,
                                MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
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

                        if (requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress) || requestApproval.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ReturnForVoidClarifications))
                        {
                            UserProfileRepository userProfileRepository = new UserProfileRepository();
                            var user = userProfileRepository.GetUserById(requestApproval.UserId);
                            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                            DateTime now = DateTime.Now;

                            this.SendPurchaseOrderReplyMail(requestApproval.ApproverUserId, requestApproval.UserId, requestApproval.Remarks, requestApproval.PurchaseOrderId, requestApproval.PurchaseOrderCode, requestApproval.ProcessId, requestApproval.CompanyId);
                            if (requestApproval.ProcessId == 1)
                            {

                                AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderStatusUpdate", "Reply sent for clarification for the Purchase Order " + UserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);
                            }
                            if (requestApproval.ProcessId == 2)
                            {
                                AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderStatusUpdate", "Reply sent for clarification for the Purchase Order " + UserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);

                            }
                            if (requestApproval.ProcessId == 15)
                            {
                                AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderStatusUpdate", "Reply sent for clarification for the Purchase Order " + UserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);

                            }
                            if (requestApproval.ProcessId == 5)
                            {
                                AuditLog.Info(PurchaseOrderType.ContractPoFixed.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderStatusUpdate", "Reply sent for clarification for the Contract Master " + UserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);

                            }
                            if (requestApproval.ProcessId == 6)
                            {
                                AuditLog.Info(PurchaseOrderType.ContractPoVariable.ToString(), "Reply for clarification", requestApproval.UserId.ToString(), requestApproval.PurchaseOrderId.ToString(), "PurchaseOrderStatusUpdate", "Reply sent for clarification for the Contract Master " + UserName + " on " + now + " " + requestApproval.Remarks, requestApproval.CompanyId);

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

        /*
            this method is used to delete the purchase order...
        */
        public bool DeletePurchaseOrder(PurchaseOrderDelete purchaseOrderDelete)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        #region delete purchase order...

                        var purchaseOrderDeleteResult = transactionObj.Connection.Execute("PurchaseOrderCreation_CRUD",
                                                                new
                                                                {

                                                                    Action = "DELETE",
                                                                    PurchaseOrderId = purchaseOrderDelete.PurchaseOrderId,
                                                                    CreatedBy = purchaseOrderDelete.ModifiedBy,
                                                                    CreatedDate = DateTime.Now
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        #endregion

                        #region deleting purchase order items...
                        var purchaseOrderItemDeleteResult = transactionObj.Connection.Execute("PurchaseOrderCreation_CRUD", new
                        {

                            Action = "DELETEALLITEMS",
                            PurchaseOrderId = purchaseOrderDelete.PurchaseOrderId,
                            CreatedBy = purchaseOrderDelete.ModifiedBy,
                            CreatedDate = DateTime.Now
                        },
                                                            transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                        #endregion
                        #region deleting all the files related to this purchase order
                        try
                        {
                            var parameterObj1 = new DynamicParameters();
                            parameterObj1.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                            parameterObj1.Add("@PurchaseOrderId", purchaseOrderDelete.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            parameterObj1.Add("@POTypeId", PurchaseOrderType.InventoryPo, DbType.Int32, ParameterDirection.Input);

                            var deletedQuotationAttachmentNames = transactionObj.Connection.Query<string>("SPOQuotationFileOperations_CRUD", parameterObj1, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus1 = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.InventoryPurchaseOrder,
                                FilesNames = deletedQuotationAttachmentNames.ToArray(),
                                UniqueId = purchaseOrderDelete.PurchaseOrderId.ToString()
                            });

                            var parameterObj = new DynamicParameters();
                            parameterObj.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                            parameterObj.Add("@RecordId", purchaseOrderDelete.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            parameterObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.InventoryPurchaseOrder), DbType.Int32, ParameterDirection.Input);

                            var deletedAttachmentNames = transactionObj.Connection.Query<string>("FileOperations_CRUD", parameterObj, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.InventoryPurchaseOrder,
                                FilesNames = deletedAttachmentNames.ToArray(),
                                UniqueId = purchaseOrderDelete.PurchaseOrderId.ToString()
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
                        // int CompanyId = GetCompanyId(purchaseOrderDelete.PurchaseOrderId);
                        AuditLog.Info("PurchaseOrderCreation", "Delete", purchaseOrderDelete.ModifiedBy.ToString(), purchaseOrderDelete.PurchaseOrderId.ToString(), "DeletePurchaseOrder", "Purchase Order with ID " + purchaseOrderDelete.PurchaseOrderId + " is deleted by " + UserName, 0);
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

        //public int GetCompanyId(int PurchaseOrderId)
        //{
        //    int CompanyId = 0;
        //    try
        //    {
        //        CompanyId = this.m_dbconnection.Query<int>("select CompanyId from PurchaseOrder where PurchaseOrderId=" + PurchaseOrderId).FirstOrDefault();
        //    }
        //    catch (Exception e)
        //    {

        //    }

        //    return CompanyId;
        //}

        public IEnumerable<PurchaseOrderTypes> GetPurchaseOrderTypes()
        {
            try
            {
                PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();

                //executing the stored procedure to get the list of purchase order types
                var result = this.m_dbconnection.Query<PurchaseOrderTypes>("usp_GetPurchaseOrderTypes",
                                                commandType: CommandType.StoredProcedure);

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<CostOfServiceTypes> GetCostOfServiceTypes()
        {
            try
            {
                var result = this.m_dbconnection.Query<CostOfServiceTypes>("usp_CostOfService", commandType: CommandType.StoredProcedure);

                return result;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Locations> GetDepartments()
        {
            try
            {
                var result = this.m_dbconnection.Query<Locations>("usp_GetDepartments", commandType: CommandType.StoredProcedure);

                return result;
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
                    ModuleName = AttachmentFolderNames.InventoryPurchaseOrder,
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

        public string ConvertPurchaseOrderToPdf(int purchaseOrderId)
        {
            try
            {
                PurchaseOrder purchaseOrderDetails = GetPurchaseOrderDetails(purchaseOrderId.ToString());
                string template = PurchaseOrderTemplate.PurchaseOrderCreationTemplate(purchaseOrderDetails);
                return template;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool SendPurchaseOrderMail(int? approverUserId, int purchaseOrderId, int processId, int newWorkFlowStatusId, int companyId)
        {
            string type = string.Empty;
            bool result = false;
            objUserRepository = new UserProfileRepository();
            PurchaseOrderRequestMail objPurchaseOrderRequestMail = null;
            objPurchaseOrderRequestMail = new PurchaseOrderRequestMail();
            var approver = objUserRepository.GetUserById(approverUserId);
            PurchaseOrder purchaseOrderDetails = null;
            FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null;
            ContractPurchaseOrder contractPurchaseOrderDetails = null;
            ExpensesPurchaseOrder expensePurchaseOrderDetails = null;

            if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo))
            {
                purchaseOrderDetails = GetPurchaseOrderDetails(purchaseOrderId.ToString());
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO))
            {
                fixedPurchaseOrderRepository = new FixedAssetPurchaseOrderCreationRepository();
                fixedPurchaseOrderDetails = fixedPurchaseOrderRepository.GetFixedAssetPurchaseOrderDetails(purchaseOrderId.ToString(), companyId);
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable))
            {
                contractPurchaseOrderRepository = new ContractPurchaseOrderRepository();
                contractPurchaseOrderDetails = contractPurchaseOrderRepository.GetContractPurchaseOrderDetails(purchaseOrderId.ToString());
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo))
            {
                ExpensesPurchaseOrderCreationRepository expensesPurchaseOrderCreationRepository = new ExpensesPurchaseOrderCreationRepository();
                expensePurchaseOrderDetails = expensesPurchaseOrderCreationRepository.GetExpensesPurchaseOrderDetails(purchaseOrderId.ToString(), 0, companyId);
            }

            if (approver != null)
            {
                objPurchaseOrderRequestMail.ApproverName = approver.FirstName + " " + approver.LastName;
                objPurchaseOrderRequestMail.ApproverEmail = approver.EmailId;
            }

            if (purchaseOrderDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = purchaseOrderDetails.PurchaseOrderId;
                objPurchaseOrderRequestMail.RequestCode = purchaseOrderDetails.PurchaseOrderCode;
                objPurchaseOrderRequestMail.SenderName = purchaseOrderDetails.RequestedByUserName;
                objPurchaseOrderRequestMail.Supplier = purchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierName = purchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.SupplierEmail = purchaseOrderDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = purchaseOrderDetails.Supplier.BillingTelephone;
                objPurchaseOrderRequestMail.DeliveryDate = purchaseOrderDetails.ExpectedDeliveryDate;
                objPurchaseOrderRequestMail.PurchaseOrderType = purchaseOrderDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = purchaseOrderDetails.Location;
                objPurchaseOrderRequestMail.ProcessId = Convert.ToInt32(WorkFlowProcessTypes.InventoryPo);
                objPurchaseOrderRequestMail.TotalAmount = $"{purchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestMail.CompanyId = purchaseOrderDetails.CompanyId;
                objPurchaseOrderRequestMail.DocumentStatus = purchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestMail.DocumentCurrencySymbol = purchaseOrderDetails.CurrencySymbol;
            }
            else if (fixedPurchaseOrderDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = fixedPurchaseOrderDetails.FixedAssetPurchaseOrderId;
                objPurchaseOrderRequestMail.RequestCode = fixedPurchaseOrderDetails.FixedAssetPurchaseOrderCode;
                objPurchaseOrderRequestMail.SenderName = fixedPurchaseOrderDetails.RequestedByUserName;
                objPurchaseOrderRequestMail.Supplier = fixedPurchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierName = fixedPurchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.SupplierEmail = fixedPurchaseOrderDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = fixedPurchaseOrderDetails.Supplier.BillingTelephone;
                //the following line is commented, as it throws error for date>13 i.e 13-02-2019
                //string deliveryDate = Convert.ToString(String.Format("{0:dd-MM-yyyy}", fixedPurchaseOrderDetails.ExpectedDeliveryDate));
                //objPurchaseOrderRequestMail.DeliveryDate = Convert.ToDateTime(deliveryDate);
                objPurchaseOrderRequestMail.DeliveryDate = fixedPurchaseOrderDetails.ExpectedDeliveryDate ?? DateTime.MinValue;
                objPurchaseOrderRequestMail.PurchaseOrderType = fixedPurchaseOrderDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = fixedPurchaseOrderDetails.Location;
                objPurchaseOrderRequestMail.ProcessId = Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO);
                objPurchaseOrderRequestMail.TotalAmount = $"{fixedPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestMail.CompanyId = fixedPurchaseOrderDetails.CompanyId;
                objPurchaseOrderRequestMail.DocumentStatus = fixedPurchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestMail.DocumentCurrencySymbol = fixedPurchaseOrderDetails.CurrencySymbol;
            }
            else if (contractPurchaseOrderDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = contractPurchaseOrderDetails.CPOID;
                objPurchaseOrderRequestMail.RequestCode = contractPurchaseOrderDetails.CPONumber;
                objPurchaseOrderRequestMail.SenderName = contractPurchaseOrderDetails.FirstName + " " + contractPurchaseOrderDetails.LastName;
                objPurchaseOrderRequestMail.Supplier = contractPurchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierName = contractPurchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.SupplierEmail = contractPurchaseOrderDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = contractPurchaseOrderDetails.Supplier.BillingTelephone;
                objPurchaseOrderRequestMail.DeliveryDate = contractPurchaseOrderDetails.EndDate;
                objPurchaseOrderRequestMail.PurchaseOrderType = contractPurchaseOrderDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = contractPurchaseOrderDetails.Location;
                objPurchaseOrderRequestMail.ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed);
                objPurchaseOrderRequestMail.TotalAmount = $"{contractPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestMail.CompanyId = contractPurchaseOrderDetails.CompanyId;
                objPurchaseOrderRequestMail.ContractStartDate = contractPurchaseOrderDetails.StartDate;
                objPurchaseOrderRequestMail.ContractEndDate = contractPurchaseOrderDetails.EndDate;
                objPurchaseOrderRequestMail.DocumentStatus = contractPurchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestMail.DocumentCurrencySymbol = contractPurchaseOrderDetails.CurrencySymbol;
            }
            else if (expensePurchaseOrderDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = expensePurchaseOrderDetails.ExpensesPurchaseOrderId;
                objPurchaseOrderRequestMail.RequestCode = expensePurchaseOrderDetails.ExpensesPurchaseOrderCode;
                objPurchaseOrderRequestMail.SenderName = expensePurchaseOrderDetails.RequestedByUserName;
                objPurchaseOrderRequestMail.Supplier = expensePurchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierName = expensePurchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.SupplierEmail = expensePurchaseOrderDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = expensePurchaseOrderDetails.Supplier.BillingTelephone;
                objPurchaseOrderRequestMail.PurchaseOrderType = expensePurchaseOrderDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = expensePurchaseOrderDetails.Location;
                objPurchaseOrderRequestMail.ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo);
                objPurchaseOrderRequestMail.DeliveryDate = expensePurchaseOrderDetails.CreatedDate.AddDays(expensePurchaseOrderDetails.NoOfDays);
                objPurchaseOrderRequestMail.TotalAmount = $"{expensePurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestMail.CompanyId = expensePurchaseOrderDetails.CompanyId;
                objPurchaseOrderRequestMail.DocumentStatus = expensePurchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestMail.DocumentCurrencySymbol = expensePurchaseOrderDetails.CurrencySymbol;
            }

            if (objPurchaseOrderRequestMail != null)
            {
                objPurchaseOrderRequestMail.CompanyShortName = GetCompanyDetails(objPurchaseOrderRequestMail.CompanyId).CompanyShortName;
                if (newWorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval))
                {
                    type = "Contract Master";
                }
                else if (objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Fixed" || objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Variable")
                {
                    type = "Contract Master";
                }
                else
                {
                    type = "Purchase Order";
                }
                result = Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderMail(objPurchaseOrderRequestMail, type);
            }

            return result;
        }

        public bool SendPurchaseOrderApprovalMail(int? approverUserId, int purchaseOrderId, string status, int processId, int nextApprovalUserId, int companyId, int loggedInUserId = 0)
        {
            bool result = false;
            string type = string.Empty;
            objUserRepository = new UserProfileRepository();
            PurchaseOrderRequestMail objPurchaseOrderRequestMail = null;
            objPurchaseOrderRequestMail = new PurchaseOrderRequestMail();
            var approver = objUserRepository.GetUserById(approverUserId);
            PurchaseOrder purchaseOrderDetails = null;
            FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null;
            ContractPurchaseOrder contractPurchaseOrderDetails = null;
            ExpensesPurchaseOrder expensePurchaseOrderDetails = null;
            string previousApproverStatus = string.Empty;

            if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo))
            {
                purchaseOrderDetails = GetPurchaseOrderDetails(purchaseOrderId.ToString());
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO))
            {
                fixedPurchaseOrderRepository = new FixedAssetPurchaseOrderCreationRepository();
                fixedPurchaseOrderDetails = fixedPurchaseOrderRepository.GetFixedAssetPurchaseOrderDetails(purchaseOrderId.ToString(), companyId);
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable))
            {
                contractPurchaseOrderRepository = new ContractPurchaseOrderRepository();
                contractPurchaseOrderDetails = contractPurchaseOrderRepository.GetContractPurchaseOrderDetails(purchaseOrderId.ToString());
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo))
            {
                ExpensesPurchaseOrderCreationRepository expensePurchaseOrderRepository = new ExpensesPurchaseOrderCreationRepository();
                expensePurchaseOrderDetails = expensePurchaseOrderRepository.GetExpensesPurchaseOrderDetails(purchaseOrderId.ToString(), 0, companyId);
            }

            if (approver != null)
            {
                objPurchaseOrderRequestMail.ApproverName = approver.FirstName + " " + approver.LastName;
                objPurchaseOrderRequestMail.ApproverEmail = approver.EmailId;
            }

            if (purchaseOrderDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = purchaseOrderDetails.PurchaseOrderId;
                objPurchaseOrderRequestMail.RequestCode = purchaseOrderDetails.PurchaseOrderCode;
                objPurchaseOrderRequestMail.SenderName = purchaseOrderDetails.RequestedByUserName;
                objPurchaseOrderRequestMail.Supplier = purchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierEmail = purchaseOrderDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = purchaseOrderDetails.Supplier.BillingTelephone;
                objPurchaseOrderRequestMail.DeliveryDate = purchaseOrderDetails.ExpectedDeliveryDate;
                objPurchaseOrderRequestMail.PurchaseOrderType = purchaseOrderDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = purchaseOrderDetails.Location;
                objPurchaseOrderRequestMail.ProcessId = Convert.ToInt32(WorkFlowProcessTypes.InventoryPo);
                objPurchaseOrderRequestMail.SupplierName = purchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.TotalAmount = $"{purchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestMail.CompanyId = purchaseOrderDetails.CompanyId;
                objPurchaseOrderRequestMail.DocumentStatus = purchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestMail.DocumentCurrencySymbol = purchaseOrderDetails.CurrencySymbol;

                var sender = objUserRepository.GetUserById(purchaseOrderDetails.CreatedBy);
                if (sender != null)
                {
                    objPurchaseOrderRequestMail.SenderEmail = sender.EmailId;
                }
            }
            else if (fixedPurchaseOrderDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = fixedPurchaseOrderDetails.FixedAssetPurchaseOrderId;
                objPurchaseOrderRequestMail.RequestCode = fixedPurchaseOrderDetails.FixedAssetPurchaseOrderCode;
                objPurchaseOrderRequestMail.SenderName = fixedPurchaseOrderDetails.RequestedByUserName;
                objPurchaseOrderRequestMail.Supplier = fixedPurchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierEmail = fixedPurchaseOrderDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = fixedPurchaseOrderDetails.Supplier.BillingTelephone;
                string deliveryDate = Convert.ToString(String.Format("{0:dd-MM-yyyy}", fixedPurchaseOrderDetails.ExpectedDeliveryDate));
                objPurchaseOrderRequestMail.DeliveryDate = Convert.ToDateTime(deliveryDate);
                objPurchaseOrderRequestMail.PurchaseOrderType = fixedPurchaseOrderDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = fixedPurchaseOrderDetails.Location;
                objPurchaseOrderRequestMail.ProcessId = Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO);
                objPurchaseOrderRequestMail.SupplierName = fixedPurchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.TotalAmount = $"{fixedPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestMail.CompanyId = fixedPurchaseOrderDetails.CompanyId;
                objPurchaseOrderRequestMail.DocumentStatus = fixedPurchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestMail.DocumentCurrencySymbol = fixedPurchaseOrderDetails.CurrencySymbol;
                var sender = objUserRepository.GetUserById(fixedPurchaseOrderDetails.CreatedBy);
                if (sender != null)
                {
                    objPurchaseOrderRequestMail.SenderEmail = sender.EmailId;
                }
            }
            else if (contractPurchaseOrderDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = contractPurchaseOrderDetails.CPOID;
                objPurchaseOrderRequestMail.RequestCode = contractPurchaseOrderDetails.CPONumber;
                objPurchaseOrderRequestMail.SenderName = contractPurchaseOrderDetails.FirstName + " " + contractPurchaseOrderDetails.LastName;
                objPurchaseOrderRequestMail.Supplier = contractPurchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierEmail = contractPurchaseOrderDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = contractPurchaseOrderDetails.Supplier.BillingTelephone;
                objPurchaseOrderRequestMail.DeliveryDate = contractPurchaseOrderDetails.EndDate;
                objPurchaseOrderRequestMail.PurchaseOrderType = contractPurchaseOrderDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = contractPurchaseOrderDetails.Location;
                objPurchaseOrderRequestMail.ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed);
                objPurchaseOrderRequestMail.SupplierName = contractPurchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.TotalAmount = $"{contractPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestMail.CompanyId = contractPurchaseOrderDetails.CompanyId;
                objPurchaseOrderRequestMail.ContractStartDate = contractPurchaseOrderDetails.StartDate;
                objPurchaseOrderRequestMail.ContractEndDate = contractPurchaseOrderDetails.EndDate;
                objPurchaseOrderRequestMail.DocumentStatus = contractPurchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestMail.DocumentCurrencySymbol = contractPurchaseOrderDetails.CurrencySymbol;
                var sender = objUserRepository.GetUserById(contractPurchaseOrderDetails.CreatedBy);
                if (sender != null)
                {
                    objPurchaseOrderRequestMail.SenderEmail = sender.EmailId;
                }
            }
            else if (expensePurchaseOrderDetails != null)
            {
                objPurchaseOrderRequestMail.RequestId = expensePurchaseOrderDetails.ExpensesPurchaseOrderId;
                objPurchaseOrderRequestMail.RequestCode = expensePurchaseOrderDetails.ExpensesPurchaseOrderCode;
                objPurchaseOrderRequestMail.SenderName = expensePurchaseOrderDetails.RequestedByUserName;
                objPurchaseOrderRequestMail.Supplier = expensePurchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestMail.SupplierEmail = expensePurchaseOrderDetails.Supplier.SupplierEmail;
                objPurchaseOrderRequestMail.SupplierContactNumber = expensePurchaseOrderDetails.Supplier.BillingTelephone;
                objPurchaseOrderRequestMail.PurchaseOrderType = expensePurchaseOrderDetails.PurchaseOrderType;
                objPurchaseOrderRequestMail.Department = expensePurchaseOrderDetails.Location;
                objPurchaseOrderRequestMail.ProcessId = Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo);
                objPurchaseOrderRequestMail.SupplierName = expensePurchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestMail.DeliveryDate = expensePurchaseOrderDetails.CreatedDate.AddDays(expensePurchaseOrderDetails.NoOfDays);
                objPurchaseOrderRequestMail.TotalAmount = $"{expensePurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestMail.CompanyId = expensePurchaseOrderDetails.CompanyId;
                objPurchaseOrderRequestMail.DocumentStatus = expensePurchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestMail.DocumentCurrencySymbol = expensePurchaseOrderDetails.CurrencySymbol;
                var sender = objUserRepository.GetUserById(expensePurchaseOrderDetails.CreatedBy);
                if (sender != null)
                {
                    objPurchaseOrderRequestMail.SenderEmail = sender.EmailId;
                }
            }
            objPurchaseOrderRequestMail.CompanyShortName = GetCompanyDetails(objPurchaseOrderRequestMail.CompanyId).CompanyShortName;
            if (nextApprovalUserId > 0)
            {
                var nextapprover = objUserRepository.GetUserById(nextApprovalUserId);
                previousApproverStatus = $"{"Approved by "}{ objPurchaseOrderRequestMail.ApproverName}";
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

            if (loggedInUserId > 0)
            {
                var sender = objUserRepository.GetUserById(loggedInUserId);
                if (sender != null)
                {
                    objPurchaseOrderRequestMail.SenderName = sender.FirstName;
                }
            }

            if (objPurchaseOrderRequestMail != null)
            {
                if (objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Fixed" || objPurchaseOrderRequestMail.PurchaseOrderType == "Contract PO Variable")
                {
                    type = "Contract Master";
                }
                else
                {
                    type = "Purchase Order";
                }
                Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderRequestApprovalMail(objPurchaseOrderRequestMail, type, status, previousApproverStatus);
            }
            return result;
        }

        public void SendPurchaseOrderClarificationMail(int? approverUserId, int requesterId, string approverComments, int purchaseOrderId, string purchaseOrderNumber, int processId, int companyId)
        {
            string type = string.Empty;
            PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarficationMail = null;
            objPurchaseOrderRequestClarficationMail = new PurchaseOrderRequestClarificationMail();
            objPurchaseOrderRequestClarficationMail = PreparePurchaseOrderMailData(approverUserId, requesterId, approverComments, purchaseOrderId, purchaseOrderNumber);
            var DocumentCurrencyDetails = GetDocumentCurrencyDetails(purchaseOrderId, processId, companyId);
            if (objPurchaseOrderRequestClarficationMail != null)
            {
                if (processId == 5 || processId == 6)
                {
                    type = "Contract Master";
                }
                else
                {
                    type = "Purchase Order";
                }

                var result = PrepareMailData(processId, purchaseOrderId, companyId, objPurchaseOrderRequestClarficationMail);
                objPurchaseOrderRequestClarficationMail.Supplier = result.Supplier;
                objPurchaseOrderRequestClarficationMail.TotalAmount = result.TotalAmount;
                objPurchaseOrderRequestClarficationMail.WorkFlowStatus = result.WorkFlowStatus;
                objPurchaseOrderRequestClarficationMail.CompanyId = companyId;
                objPurchaseOrderRequestClarficationMail.CompanyShortName = GetCompanyDetails(companyId).CompanyShortName;
                objPurchaseOrderRequestClarficationMail.ProcessId = processId;
                objPurchaseOrderRequestClarficationMail.DocumentCurrencySymbol = DocumentCurrencyDetails.Symbol;
                Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderClarificationMail(objPurchaseOrderRequestClarficationMail, type);
            }
        }

        public void SendPurchaseOrderReplyMail(int? approverUserId, int requesterId, string approverComments, int purchaseOrderId, string purchaseOrderNumber, int processId, int companyId)
        {
            string type = string.Empty;
            PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarficationMail = null;
            objPurchaseOrderRequestClarficationMail = new PurchaseOrderRequestClarificationMail();
            objPurchaseOrderRequestClarficationMail = PreparePurchaseOrderMailData(approverUserId, requesterId, approverComments, purchaseOrderId, purchaseOrderNumber);
            var DocumentCurrencyDetails = GetDocumentCurrencyDetails(purchaseOrderId, processId, companyId);

            if (objPurchaseOrderRequestClarficationMail != null)
            {
                if (processId == 5 || processId == 6)
                {
                    type = "Contract Master";
                }
                else
                {
                    type = "Purchase Order";
                }
                var result = PrepareMailData(processId, purchaseOrderId, companyId, objPurchaseOrderRequestClarficationMail);
                objPurchaseOrderRequestClarficationMail.Supplier = result.Supplier;
                objPurchaseOrderRequestClarficationMail.TotalAmount = result.TotalAmount;
                objPurchaseOrderRequestClarficationMail.WorkFlowStatus = result.WorkFlowStatus;
                objPurchaseOrderRequestClarficationMail.CompanyId = companyId;
                objPurchaseOrderRequestClarficationMail.ProcessId = processId;
                objPurchaseOrderRequestClarficationMail.CompanyShortName = GetCompanyDetails(companyId).CompanyShortName;
                objPurchaseOrderRequestClarficationMail.DocumentCurrencySymbol = DocumentCurrencyDetails.Symbol;
                Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderReplyMail(objPurchaseOrderRequestClarficationMail, type);
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                string approverUserName = userProfileRepository.GetUserById(approverUserId).UserName;
                string requestorUserName = userProfileRepository.GetUserById(requesterId).UserName;
                AuditLog.Info("PurchaseOrderCreation", "Purchase Order Reply Mail", "0", purchaseOrderNumber, "SendPurchaseOrderReplyMail", "Purchase Order " + purchaseOrderNumber + " clarification reply sent by " + requestorUserName + " to " + approverUserName, companyId);
            }
        }

        private Currency GetDocumentCurrencyDetails(int documentId, int processId, int companyId)
        {
            return this.m_dbconnection.Query<Currency>("sp_getDocumentCurencyDetails",
                                 new
                                 {
                                     ProcessId = processId,
                                     DocumentId = documentId,
                                     CompanyId = companyId
                                 }, commandType: CommandType.StoredProcedure).FirstOrDefault();
        }

        private PurchaseOrderRequestClarificationMail PrepareMailData(int processId, int purchaseOrderId, int companyId, PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarficationMail)
        {
            PurchaseOrder purchaseOrderDetails = null;
            FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null;
            ContractPurchaseOrder contractPurchaseOrderDetails = null;
            ExpensesPurchaseOrder expensePurchaseOrderDetails = null;

            if (processId == Convert.ToInt32(WorkFlowProcessTypes.InventoryPo))
            {
                purchaseOrderDetails = GetPurchaseOrderDetails(purchaseOrderId.ToString());
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.FixedAssetPO))
            {
                fixedPurchaseOrderRepository = new FixedAssetPurchaseOrderCreationRepository();
                fixedPurchaseOrderDetails = fixedPurchaseOrderRepository.GetFixedAssetPurchaseOrderDetails(purchaseOrderId.ToString(), companyId);
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOFixed) || processId == Convert.ToInt32(WorkFlowProcessTypes.ContractPOVariable))
            {
                contractPurchaseOrderRepository = new ContractPurchaseOrderRepository();
                contractPurchaseOrderDetails = contractPurchaseOrderRepository.GetContractPurchaseOrderDetails(purchaseOrderId.ToString());
            }
            else if (processId == Convert.ToInt32(WorkFlowProcessTypes.ExpensesPo))
            {
                ExpensesPurchaseOrderCreationRepository expensePurchaseOrderRepository = new ExpensesPurchaseOrderCreationRepository();
                expensePurchaseOrderDetails = expensePurchaseOrderRepository.GetExpensesPurchaseOrderDetails(purchaseOrderId.ToString(), 0, companyId);
            }

            if (purchaseOrderDetails != null)
            {
                objPurchaseOrderRequestClarficationMail.Supplier = purchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestClarficationMail.SupplierShortName = purchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestClarficationMail.TotalAmount = $"{purchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestClarficationMail.WorkFlowStatus = purchaseOrderDetails.WorkFlowStatusText;
            }
            else if (fixedPurchaseOrderDetails != null)
            {
                objPurchaseOrderRequestClarficationMail.Supplier = fixedPurchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestClarficationMail.SupplierShortName = fixedPurchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestClarficationMail.TotalAmount = $"{fixedPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestClarficationMail.WorkFlowStatus = fixedPurchaseOrderDetails.WorkFlowStatusText;
            }
            else if (contractPurchaseOrderDetails != null)
            {
                objPurchaseOrderRequestClarficationMail.Supplier = contractPurchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestClarficationMail.SupplierShortName = contractPurchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestClarficationMail.WorkFlowStatus = contractPurchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestClarficationMail.TotalAmount = $"{contractPurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
                objPurchaseOrderRequestClarficationMail.ProcessId = contractPurchaseOrderDetails.POTypeId;
            }
            else if (expensePurchaseOrderDetails != null)
            {
                objPurchaseOrderRequestClarficationMail.Supplier = expensePurchaseOrderDetails.Supplier.SupplierName;
                objPurchaseOrderRequestClarficationMail.SupplierShortName = expensePurchaseOrderDetails.Supplier.SupplierShortName;
                objPurchaseOrderRequestClarficationMail.WorkFlowStatus = expensePurchaseOrderDetails.WorkFlowStatusText;
                objPurchaseOrderRequestClarficationMail.TotalAmount = $"{expensePurchaseOrderDetails.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}";
            }

            return objPurchaseOrderRequestClarficationMail;

        }

        public byte[] PurchaseOrderPrint(int purchaseOrderId, int purchaseOrderTypeId, int companyId)
        {
            try
            {
                var result = GetPurchaseOrderPDFTemplate(purchaseOrderId, purchaseOrderTypeId, companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] PurchaseOrdersPDFExport(GridDisplayInput purchaseOrderInput)
        {
            try
            {
                PurchaseOrderDisplayResult purchaseOrderDisplayResult = new PurchaseOrderDisplayResult();
                purchaseOrderDisplayResult = GetPurchaseOrders(purchaseOrderInput);

                var result = GetPurchaseOrdersListPDFTemplate(purchaseOrderDisplayResult);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public byte[] GetPurchaseOrderPDFTemplate(int purchaseOrderId, int purchaseOrderTypeId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                PurchaseOrder purchaseOrderDetails = null;
                ContractPurchaseOrder contractPurchaseOrderDetails = null;
                FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null;
                ExpensesPurchaseOrder expensesPurchaseOrder = null;
                if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                {
                    purchaseOrderDetails = GetPurchaseOrderDetails(purchaseOrderId.ToString());
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                {
                    fixedPurchaseOrderRepository = new FixedAssetPurchaseOrderCreationRepository();
                    fixedPurchaseOrderDetails = fixedPurchaseOrderRepository.GetFixedAssetPurchaseOrderDetails(purchaseOrderId.ToString(), companyId);
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                {
                    contractPurchaseOrderRepository = new ContractPurchaseOrderRepository();
                    contractPurchaseOrderDetails = contractPurchaseOrderRepository.GetContractPurchaseOrderDetails(purchaseOrderId.ToString());
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                {
                    ExpensesPurchaseOrderCreationRepository expensePurchaseOrderRepository = new ExpensesPurchaseOrderCreationRepository();
                    expensesPurchaseOrder = expensePurchaseOrderRepository.GetExpensesPurchaseOrderDetails(purchaseOrderId.ToString(), 0, companyId);
                }
                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();
                var result = pdfGeneratorObj.GetPurchaseOrderPDFTemplate(purchaseOrderDetails, fixedPurchaseOrderDetails, contractPurchaseOrderDetails, expensesPurchaseOrder, companyDetails, null);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetPurchaseOrdersListPDFTemplate(PurchaseOrderDisplayResult purchaseOrderDisplayResult)
        {
            int purchaseOrderTypeId = 0;
            int purchaseOrderId = 0;
            int companyId = 0;
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                PurchaseOrder purchaseOrderDetails = null;
                ContractPurchaseOrder contractPurchaseOrderDetails = null;
                FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null;
                ExpensesPurchaseOrder expensesPurchaseOrder = null;
               
                if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                {
                    purchaseOrderDetails = GetPurchaseOrderDetails(purchaseOrderId.ToString());
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                {
                    fixedPurchaseOrderRepository = new FixedAssetPurchaseOrderCreationRepository();
                    fixedPurchaseOrderDetails = fixedPurchaseOrderRepository.GetFixedAssetPurchaseOrderDetails(purchaseOrderId.ToString(), companyId);
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                {
                    contractPurchaseOrderRepository = new ContractPurchaseOrderRepository();
                    contractPurchaseOrderDetails = contractPurchaseOrderRepository.GetContractPurchaseOrderDetails(purchaseOrderId.ToString());
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                {
                    ExpensesPurchaseOrderCreationRepository expensePurchaseOrderRepository = new ExpensesPurchaseOrderCreationRepository();
                    expensesPurchaseOrder = expensePurchaseOrderRepository.GetExpensesPurchaseOrderDetails(purchaseOrderId.ToString(), 0, companyId);
                }

                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();
                var result = pdfGeneratorObj.GetPurchaseOrdersPDFTemplate(purchaseOrderDetails, fixedPurchaseOrderDetails, contractPurchaseOrderDetails, expensesPurchaseOrder, companyDetails, null);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool SendPurchaseOrderMailtoSupplier(int purchaseOrderId, int companyId, int purchaseOrderTypeId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                PurchaseOrder purchaseOrderDetails = null;
                FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null;
                ContractPurchaseOrder contractPurchaseOrderDetails = null;
                ExpensesPurchaseOrder expensePurchaseOrderDetails = null;
                string procedureName = "";
                if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                {
                    purchaseOrderDetails = GetPurchaseOrderDetails(purchaseOrderId.ToString());
                    procedureName = "PurchaseOrderCreation_CRUD";
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                {
                    fixedPurchaseOrderRepository = new FixedAssetPurchaseOrderCreationRepository();
                    fixedPurchaseOrderDetails = fixedPurchaseOrderRepository.GetFixedAssetPurchaseOrderDetails(purchaseOrderId.ToString(), companyId);
                    procedureName = "FixedAssetPurchaseOrderCreation_CRUD";
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                {
                    contractPurchaseOrderRepository = new ContractPurchaseOrderRepository();
                    contractPurchaseOrderDetails = contractPurchaseOrderRepository.GetContractPurchaseOrderDetails(purchaseOrderId.ToString());
                    procedureName = "ContractPurchaseOrderItem_CRUD";
                }
                else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                {
                    ExpensesPurchaseOrderCreationRepository expensePurchaseOrderRepository = new ExpensesPurchaseOrderCreationRepository();
                    expensePurchaseOrderDetails = expensePurchaseOrderRepository.GetExpensesPurchaseOrderDetails(purchaseOrderId.ToString(), 0, companyId);
                    procedureName = "ExpensePurchaserOrderCreation_CRUD";
                }

                var purchaseOrderResult = this.m_dbconnection.Execute(procedureName, new
                {
                    @Action = "UPDATEWORKFLOWSTATUS",
                    DocumentId = purchaseOrderId,
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.SendToSupplier)
                }, commandType: CommandType.StoredProcedure);

                pdfGeneratorObj = new PdfGenerator();
                var companyDetails = GetCompanyDetails(companyId);
                var pdfResult = pdfGeneratorObj.GetPurchaseOrderPDFTemplate(purchaseOrderDetails, fixedPurchaseOrderDetails, contractPurchaseOrderDetails, expensePurchaseOrderDetails, companyDetails, null);
                var result = Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderToSupplier(companyDetails, pdfResult, purchaseOrderDetails, fixedPurchaseOrderDetails, contractPurchaseOrderDetails, expensePurchaseOrderDetails);
                AuditLog.Info("PurchaseOrderCreation", "void", "0", purchaseOrderId.ToString(), "SendPurchaseOrderMailtoSupplier", "Mail sent to supplier with Purchase Order Id " + purchaseOrderId + "", companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private PurchaseOrderRequestClarificationMail PreparePurchaseOrderMailData(int? approverUserId, int requesterId, string approverComments, int purchaseOrderRequestId, string purchaseOrderNumber)
        {
            objUserRepository = new UserProfileRepository();
            PurchaseOrderRequestClarificationMail objPurchaseOrderRequestClarficationMail = null;
            objPurchaseOrderRequestClarficationMail = new PurchaseOrderRequestClarificationMail();
            var approver = objUserRepository.GetUserById(approverUserId);
            var requester = objUserRepository.GetUserById(requesterId);
            if (approver != null)
            {
                objPurchaseOrderRequestClarficationMail.ApproverName = approver.FirstName + " " + approver.LastName;
                objPurchaseOrderRequestClarficationMail.ApproverEmail = approver.EmailId;
            }

            if (requester != null)
            {
                objPurchaseOrderRequestClarficationMail.RequesterName = requester.FirstName + " " + requester.LastName;
                objPurchaseOrderRequestClarficationMail.RequesterEmail = requester.EmailId;
            }

            if (approver != null && requester != null)
            {
                objPurchaseOrderRequestClarficationMail.RequestId = purchaseOrderRequestId;
                objPurchaseOrderRequestClarficationMail.ApproverComments = approverComments;
                objPurchaseOrderRequestClarficationMail.PurchaseOrderNumber = purchaseOrderNumber;
            }

            return objPurchaseOrderRequestClarficationMail;
        }

        private CompanyDetails GetCompanyDetails(int companyId)
        {
            sharedRepository = new SharedRepository();
            return sharedRepository.GetCompanyDetails(companyId);
        }


        public int VoidPurchaseOrder(PurchaseOrderVoid purchaseOrder)
        {
            try
            {
                var recordCount = this.m_dbconnection.Query<int>("usp_GetPurchaseOrderVoidStatus", new
                {
                    PurchaseOrderId = purchaseOrder.PurchaseOrderId,
                    POTypeId = purchaseOrder.PoTypeId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                if (recordCount == 0)
                {
                    if ((purchaseOrder.PoTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || purchaseOrder.PoTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable)) && purchaseOrder.IsMasterCPO == true)
                    {

                        contractPurchaseOrderRepository = new ContractPurchaseOrderRepository();
                        if (purchaseOrder.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.PendingForTerminationApproval))
                        {
                            var result = contractPurchaseOrderRepository.UpdateTerminateDate(purchaseOrder.PurchaseOrderId, purchaseOrder.TerminationDate);
                            this.m_dbconnection.Execute("usp_UpdatePurchaseOrderStatus", new
                            {
                                Action = "RECALLPOAPPROVAL",
                                PurchaseOrderId = purchaseOrder.PurchaseOrderId,
                                ProcessId = purchaseOrder.PoTypeId
                            }, commandType: CommandType.StoredProcedure);
                        }

                        contractPurchaseOrderRepository.SendForApproval(new ContractPurchaseOrder()
                        {
                            TotalAmount = purchaseOrder.TotalAmount,
                            TotalContractSum = purchaseOrder.TotalContractSum,
                            CPOID = purchaseOrder.PurchaseOrderId,
                            CreatedBy = purchaseOrder.CreatedBy,
                            CPONumber = purchaseOrder.CPONumber,
                            WorkFlowStatusId = purchaseOrder.WorkFlowStatusId,
                            POTypeId = purchaseOrder.PoTypeId,
                            CompanyId = purchaseOrder.CompanyId,
                            LocationID = purchaseOrder.LocationID,
                            TerminationDate = purchaseOrder.TerminationDate,
                            ReasonstoVoid = purchaseOrder.Reasons
                        }, true);
                    }
                    else
                    {
                        this.m_dbconnection.Open();//opening the connection...
                        string procedureName = new SharedRepository().GetProcedureName(purchaseOrder.ProcessId);
                        using (var transactionObj = this.m_dbconnection.BeginTransaction())
                        {
                            try
                            {
                                DynamicParameters dynamicObj = new DynamicParameters();
                                dynamicObj.Add("CreatedBy", purchaseOrder.UserId);
                                dynamicObj.Add("ReasonstoVoid", purchaseOrder.Reasons);
                                dynamicObj.Add("CreatedDate", DateTime.Now);

                                string action = "VOIDRECORD";
                                int workFlowStatusId = Convert.ToInt32(WorkFlowStatus.Void);

                                if (purchaseOrder.PoTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                                {
                                    dynamicObj.Add("PurchaseOrderId", purchaseOrder.PurchaseOrderId);
                                }
                                else if (purchaseOrder.PoTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                                {
                                    dynamicObj.Add("FixedAssetPurchaseOrderId", purchaseOrder.PurchaseOrderId);
                                }
                                else if (purchaseOrder.PoTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                                {
                                    dynamicObj.Add("ExpensesPurchaseOrderId", purchaseOrder.PurchaseOrderId);
                                }
                                else if (purchaseOrder.PoTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || purchaseOrder.PoTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                                {
                                    action = "POCVOID";
                                    dynamicObj.Add("CPOID", purchaseOrder.PurchaseOrderId);
                                }
                                dynamicObj.Add("Action", action);
                                dynamicObj.Add("WorkFlowStatusId", workFlowStatusId);

                                var result = transactionObj.Connection.Execute(procedureName, dynamicObj, commandType: CommandType.StoredProcedure, transaction: transactionObj);

                                var auditTrailResult = transactionObj.Connection.Execute("WorkFlowAuditTrail_CRUD", new
                                {

                                    Action = "INSERT",
                                    DocumentId = purchaseOrder.PurchaseOrderId,
                                    ProcessId = purchaseOrder.ProcessId,
                                    UserId = purchaseOrder.UserId,
                                    Remarks = purchaseOrder.Reasons,
                                    CreatedDate = DateTime.Now

                                }, commandType: CommandType.StoredProcedure, transaction: transactionObj);

                                transactionObj.Commit();
                            }
                            catch (Exception e)
                            {
                                transactionObj.Rollback();
                                throw e;
                            }
                        }

                        //Sending notifications and Mails for approvers
                        SendVoidEmailNotifications(purchaseOrder);
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        string UserName = userProfileRepository.GetUserById(purchaseOrder.UserId).UserName;
                        #region Contract PO Void Log..
                        if (purchaseOrder.PoTypeId == (int)PurchaseOrderType.ContractPoFixed || purchaseOrder.PoTypeId == (int)PurchaseOrderType.ContractPoVariable)
                        {
                            var lastPOC = this.m_dbconnection.Query<ContractPurchaseOrder>("select * from ContractPurchaseOrder where CPOID=@CPOID", new { CPOID = purchaseOrder.PurchaseOrderId }).FirstOrDefault();
                            var user = userProfileRepository.GetUserById(purchaseOrder.UserId);
                            int masterCpoId = lastPOC.IsMasterPO ? lastPOC.CPOID : lastPOC.MasterCPOID;
                            AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), lastPOC.POTypeId), "POC Void", purchaseOrder.UserId.ToString(), masterCpoId.ToString(), "POCVoided", string.Format("POC : {0} voided by {1} {2} on {3}", lastPOC.CPONumber, user.FirstName, user.LastName, DateTime.Now), purchaseOrder.CompanyId);
                        }
                        else
                        {
                            var user = userProfileRepository.GetUserById(purchaseOrder.UserId);
                            string ReqUserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                            DateTime now = DateTime.Now;
                            AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), purchaseOrder.PoTypeId), "PO Void", purchaseOrder.UserId.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "VoidPurchaseOrder", "Purchase Order Voided by " + ReqUserName + " on " + now + " " + purchaseOrder.Reasons, purchaseOrder.CompanyId);

                        }
                        #endregion

                        //AuditLog.Info("PurchaseOrderCreation", "void", purchaseOrder.UserId.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "VoidPurchaseOrder", "POC with Id " + purchaseOrder.PurchaseOrderCode + " is voided by " + UserName + "", purchaseOrder.CompanyId);
                    }
                }
                return recordCount;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int RecallPoApproval(PurchaseOrder purchaseOrder)
        {
            try
            {
                int WorkFlowStatusId = 0;
                if (purchaseOrder.WorkFlowStatusId != 0)
                {
                    WorkFlowStatusId = purchaseOrder.WorkFlowStatusId;
                }
                else
                {
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.CancelledApproval);
                    purchaseOrder.PurchaseOrderStatusText = "Cancelled Approval";
                }
                var processId = SharedRepository.getWorkFlowProcessIdForPO(purchaseOrder.POTypeId, false);
                var result = this.m_dbconnection.Execute("usp_UpdatePurchaseOrderStatus", new
                {
                    Action = "RECALLPOAPPROVAL",
                    PurchaseOrderId = purchaseOrder.PurchaseOrderId,
                    POTypeId = purchaseOrder.POTypeId,
                    UpdatedBy = purchaseOrder.CreatedBy,
                    UpdatedDate = DateTime.Now,
                    ProcessId = processId,
                    Reasons = purchaseOrder.Reasons,
                    WorkFlowStatusId = WorkFlowStatusId//Convert.ToInt32(WorkFlowStatus.CancelledApproval)
                }, commandType: CommandType.StoredProcedure);

                UserProfile approverDetails = new UserProfileRepository().GetUserById(purchaseOrder.CurrentApproverUserId);
                UserProfile senderDetails = new UserProfileRepository().GetUserById(purchaseOrder.CreatedBy);
                string companyShortName = GetCompanyDetails(purchaseOrder.CompanyId).CompanyShortName;
                UserProfile userProfile = new UserProfileRepository().GetUserById(purchaseOrder.CreatedBy);
                var requestMail = new PurchaseOrderRequestMail()
                {
                    RequestCode = purchaseOrder.PurchaseOrderCode,
                    PurchaseOrderType = purchaseOrder.PurchaseOrderType,
                    CompanyShortName = companyShortName,
                    SupplierName = purchaseOrder.Supplier.SupplierName,
                    Supplier = purchaseOrder.Supplier.SupplierShortName,
                    TotalAmount = $"{purchaseOrder.TotalAmount.ToString("0,0.0000", CultureInfo.InvariantCulture)}",
                    DeliveryDate = purchaseOrder.ExpectedDeliveryDate,
                    ApproverName = purchaseOrder.CurrentApproverUserName,
                    SenderName = userProfile.FirstName + " " + userProfile.LastName,
                    ApproverEmail = approverDetails.EmailId,
                    DocumentCurrencySymbol = purchaseOrder.CurrencySymbol,
                    ContractStartDate = purchaseOrder.ContractStartDate,
                    ContractEndDate = purchaseOrder.ExpectedDeliveryDate
                };
                if (purchaseOrder.PurchaseOrderType == PurchaseOrderType.ProjectPo.ToString())
                {
                    ProjectMasterContractRepository projectMasterContractRepository = new ProjectMasterContractRepository();
                    ProjectMasterContract projectMasterContract = projectMasterContractRepository.GetProjectMasterContractDetails(purchaseOrder.PurchaseOrderId);
                    var mailStatus = Util.Email.ProjectMasterContractProvider.SendRecallApprovalMail(projectMasterContract, companyShortName, approverDetails, senderDetails);
                }
                else
                {
                    var mailStatus = Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderRecallApprovalMail(requestMail, purchaseOrder.PurchaseOrderStatusText);
                }
                //AuditLog.Info("PurchaseOrderCreation", "Recall Approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "RecallPoApproval", "Recalled Purchase Order Approval " + GetPurchaseOrderCode(purchaseOrder.PurchaseOrderId) +" by "+purchaseOrder.CreatedByUserName);
                #region inserting record in notification
                try
                {
                    NotificationsRepository notificationObj = new NotificationsRepository();
                    notificationObj.CreateNotification(new Notifications()
                    {
                        NotificationId = 0,
                        NotificationType = SharedRepository.GetNotificationType(processId),
                        NotificationMessage = SharedRepository.GetNotificationMessage(processId, 0, purchaseOrder.TerminateStatusId) + " has been recalled",
                        ProcessId = processId,
                        ProcessName = "",
                        DocumentId = purchaseOrder.PurchaseOrderId,
                        UserId = purchaseOrder.CurrentApproverUserId,
                        IsRead = false,
                        CreatedBy = purchaseOrder.CreatedBy,
                        CreatedDate = DateTime.Now,
                        IsNew = true,
                        CompanyId = purchaseOrder.CompanyId,
                        CompanyName = "",
                        IsforAll = false,
                        MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                        DocumentCode = purchaseOrder.PurchaseOrderCode
                    });
                }
                catch (Exception e)
                {
                    throw e;
                }
                DateTime now = DateTime.Now;
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                var user = userProfileRepository.GetUserById(purchaseOrder.CreatedBy);
                string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                if ((purchaseOrder.POTypeId == 6 || purchaseOrder.POTypeId == 5) && purchaseOrder.TerminateStatusId == (int)WorkFlowStatus.PendingForTerminationApproval)
                {
                    AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), purchaseOrder.POTypeId), "Terminate", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "Terminate", "Contract Master Cancel Termination Requested by " + UserName + " on " + now);

                }
                if (purchaseOrder.POTypeId == 1)
                {
                    AuditLog.Info(PurchaseOrderType.InventoryPo.ToString(), "Recall Approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "RecallPoApproval", "Purchase Order Cancelled Approval by " + UserName + " on " + now);
                }
                if (purchaseOrder.POTypeId == 2 && purchaseOrder.PurchaseOrderType == "Fixed Asset PO")
                {
                    AuditLog.Info(PurchaseOrderType.FixedAssetPo.ToString(), "Recall Approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "RecallPoApproval", "Purchase Order Cancelled Approval by " + UserName + " on " + now);

                }
                if (purchaseOrder.POTypeId == 3 && purchaseOrder.PurchaseOrderType == "Expense PO")
                {
                    AuditLog.Info(PurchaseOrderType.ExpensePo.ToString(), "Recall Approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "RecallPoApproval", "Purchase Order Cancelled Approval by " + UserName + " on " + now);

                }
                if (purchaseOrder.POTypeId == 5 && purchaseOrder.PurchaseOrderType == "Contract PO Fixed" && purchaseOrder.TerminateStatusId == 0)
                {
                    AuditLog.Info(PurchaseOrderType.ContractPoFixed.ToString(), "Recall Approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "RecallPoApproval", "Contract Master Cancelled Approval by " + UserName + " on " + now);

                }
                if (purchaseOrder.POTypeId == 6 && purchaseOrder.PurchaseOrderType == "Contract PO Variable" && purchaseOrder.TerminateStatusId == 0)
                {
                    AuditLog.Info(PurchaseOrderType.ContractPoVariable.ToString(), "Recall Approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "RecallPoApproval", "Contract Master Cancelled Approval by " + UserName + " on " + now);

                }
                if (purchaseOrder.POTypeId == 4 && purchaseOrder.PurchaseOrderType == "ProjectPo")
                {
                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "Recall Approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "RecallPoApproval", "Project Contract Master Cancelled Approval by " + UserName + " on " + now);
                    AuditLog.Info(WorkFlowProcessTypes.ProjectMasterContract.ToString(), "Recall Approval", purchaseOrder.CreatedBy.ToString(), purchaseOrder.PurchaseOrderId.ToString(), "RecallPoApproval", string.Format("Reason for cancel approval is : {0} ", purchaseOrder.Reasons));
                }
                #endregion
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] DownloadSPOQuotationFile(SPOQuotationAttachments sPOQuotationAttachments)
        {
            try
            {
                FileOperations fileOperationsObj = new FileOperations();
                var fileContent = fileOperationsObj.ReadQuotationFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.InventoryPurchaseOrder,
                    FilesNames = new string[] { sPOQuotationAttachments.FileName },
                    UniqueId = sPOQuotationAttachments.PurchaseOrderId.ToString() + "\\" + sPOQuotationAttachments.RowId
                });
                return fileContent;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private void SendVoidEmailNotifications(PurchaseOrderVoid purchaseOrder)
        {
            var approverList = this.m_dbconnection.Query<WorkFlow>("WorkFlow_CRUD",
                                  new
                                  {
                                      Action = "APPROVERS",
                                      DocumentId = purchaseOrder.PurchaseOrderId,
                                      ProcessId = purchaseOrder.ProcessId,
                                  }, commandType: CommandType.StoredProcedure).ToList();

            int workFlowStatusId = Convert.ToInt32(WorkFlowStatus.Void);

            foreach (var approver in approverList)
            {
                try
                {
                    NotificationsRepository notificationObj = new NotificationsRepository();
                    notificationObj.CreateNotification(new Notifications()
                    {

                        NotificationId = 0,
                        NotificationType = SharedRepository.GetNotificationType(purchaseOrder.ProcessId),
                        NotificationMessage = SharedRepository.GetNotificationMessage(purchaseOrder.ProcessId, workFlowStatusId),
                        ProcessId = purchaseOrder.ProcessId,
                        ProcessName = "",
                        DocumentId = purchaseOrder.PurchaseOrderId,
                        UserId = Convert.ToInt32(approver.ApproverUserId),
                        IsRead = false,
                        CreatedBy = purchaseOrder.UserId,
                        CreatedDate = DateTime.Now,
                        IsNew = true,
                        CompanyId = purchaseOrder.CompanyId,
                        CompanyName = "",
                        IsforAll = false,
                        MessageType = Convert.ToInt32(NotificationMessageTypes.Void),
                        DocumentCode = purchaseOrder.PurchaseOrderCode
                    });

                    SendPurchaseOrderApprovalMail(approver.ApproverUserId, purchaseOrder.PurchaseOrderId, "Voided", purchaseOrder.ProcessId, 0, purchaseOrder.UserId);

                }
                catch (Exception e)
                {
                    throw e;
                }

            }
        }
        public string GetPurchaseOrderCode(int purchaseOrderId, int PoTypeId)
        {
            string poCode = string.Empty;
            if (PoTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
            {
                poCode = this.m_dbconnection.Query<string>("select PurchaseOrderCode from PurchaseOrder where PurchaseOrderId = " + purchaseOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
            }
            if (PoTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
            {
                poCode = this.m_dbconnection.Query<string>("select FixedAssetPurchaseOrderCode from FixedAssetPurchaseOrder where FixedAssetPurchaseOrderId = " + purchaseOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
            }
            if (PoTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
            {
                poCode = this.m_dbconnection.Query<string>("select ExpensesPurchaseOrderCode from ExpensesPurchaseOrder where ExpensesPurchaseOrderId = " + purchaseOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
            }
            return poCode;
        }

        public bool SendPurchaseOrderMailtoSupplierContactPerson(EmailSupplier emailSupplier)
        {
            try
            {
                string poStatus = string.Empty;
                string purchaseOrderType = string.Empty;
                PdfGenerator pdfGeneratorObj = null;
                PurchaseOrder purchaseOrderDetails = null;
                FixedAssetPurchaseOrder fixedPurchaseOrderDetails = null;
                ContractPurchaseOrder contractPurchaseOrderDetails = null;
                ExpensesPurchaseOrder expensePurchaseOrderDetails = null;
                string procedureName = "";
                if (emailSupplier.PurchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                {

                    purchaseOrderDetails = GetPurchaseOrderDetails(emailSupplier.PurchaseOrderId.ToString());
                    poStatus = purchaseOrderDetails.WorkFlowStatusText;
                    procedureName = "PurchaseOrderCreation_CRUD";

                }
                else if (emailSupplier.PurchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                {
                    fixedPurchaseOrderRepository = new FixedAssetPurchaseOrderCreationRepository();
                    fixedPurchaseOrderDetails = fixedPurchaseOrderRepository.GetFixedAssetPurchaseOrderDetails(emailSupplier.PurchaseOrderId.ToString(), emailSupplier.CompanyId);
                    poStatus = fixedPurchaseOrderDetails.WorkFlowStatusText;
                    procedureName = "FixedAssetPurchaseOrderCreation_CRUD";
                }
                else if (emailSupplier.PurchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || emailSupplier.PurchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                {
                    contractPurchaseOrderRepository = new ContractPurchaseOrderRepository();
                    contractPurchaseOrderDetails = contractPurchaseOrderRepository.GetContractPurchaseOrderDetails(emailSupplier.PurchaseOrderId.ToString());
                    poStatus = contractPurchaseOrderDetails.WorkFlowStatusText;
                    procedureName = "ContractPurchaseOrderItem_CRUD";
                }
                else if (emailSupplier.PurchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                {
                    ExpensesPurchaseOrderCreationRepository expensePurchaseOrderRepository = new ExpensesPurchaseOrderCreationRepository();
                    expensePurchaseOrderDetails = expensePurchaseOrderRepository.GetExpensesPurchaseOrderDetails(emailSupplier.PurchaseOrderId.ToString(), 0, emailSupplier.CompanyId);
                    poStatus = expensePurchaseOrderDetails.WorkFlowStatusText;
                    procedureName = "ExpensePurchaserOrderCreation_CRUD";
                }

                var purchaseOrderResult = this.m_dbconnection.Execute(procedureName, new
                {
                    @Action = "UPDATEWORKFLOWSTATUS",
                    DocumentId = emailSupplier.PurchaseOrderId,
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.SendToSupplier)
                }, commandType: CommandType.StoredProcedure);

                pdfGeneratorObj = new PdfGenerator();
                var companyDetails = GetCompanyDetails(emailSupplier.CompanyId);
                var pdfResult = pdfGeneratorObj.GetPurchaseOrderPDFTemplate(purchaseOrderDetails, fixedPurchaseOrderDetails, contractPurchaseOrderDetails, expensePurchaseOrderDetails, companyDetails, emailSupplier.SupplierContactPersonList);
                var result = Util.Email.PurchaseOrderEmailProvider.SendPurchaseOrderToSupplierContactPersons(emailSupplier.SupplierContactPersonList, companyDetails, pdfResult, purchaseOrderDetails, fixedPurchaseOrderDetails, contractPurchaseOrderDetails, expensePurchaseOrderDetails);
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                string CPONumber = GetPurchaseOrderCode(emailSupplier.PurchaseOrderId, emailSupplier.PurchaseOrderTypeId);
                var user = userProfileRepository.GetUserById(emailSupplier.UserID);
                string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                DateTime now = DateTime.Now;
                if (poStatus == WorkFlowStatus.Approved.ToString())
                {

                    AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), emailSupplier.PurchaseOrderTypeId), "void", emailSupplier.UserID.ToString(), emailSupplier.PurchaseOrderId.ToString(), "SendPurchaseOrderMailtoContactPersons", "Sent to Supplier " + UserName + " on " + now, emailSupplier.CompanyId);

                }

                foreach (var item in emailSupplier.SupplierContactPersonList)
                {
                    AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), emailSupplier.PurchaseOrderTypeId), "void", emailSupplier.UserID.ToString(), emailSupplier.PurchaseOrderId.ToString(), "SendPurchaseOrderMailtoContactPersons", " Email Notification sent to " + item.Name + " and " + item.EmailId + " on " + now, emailSupplier.CompanyId);

                }


                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }




    }
}
