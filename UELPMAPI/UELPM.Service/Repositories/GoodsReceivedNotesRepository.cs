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
using UELPM.Util.FileOperations;
using UELPM.Util.PdfGenerator;
using UELPM.Service.Exceptions;

namespace UELPM.Service.Repositories
{
    public class GoodsReceivedNotesRepository : IGoodsReceivedNotesRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        SharedRepository sharedRepository = null;
        AssetDetailsRepository assetDetailsRepository = null;
        GenericRepository genericRepository = null;

        public GoodsReceivedNotesDisplayResult GetGoodsReceivedNotes(GridDisplayInput purchaseOrderInput)
        {
            try
            {
                GoodsReceivedNotesDisplayResult goodsReceivedDisplayResult = new GoodsReceivedNotesDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("GoodsReceivedNotes_CRUD", new
                {
                    Action = "SELECT",
                    Search = purchaseOrderInput.Search,
                    Skip = purchaseOrderInput.Skip,
                    userId = purchaseOrderInput.UserId,
                    Take = purchaseOrderInput.Take,
                    CompanyId = purchaseOrderInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    goodsReceivedDisplayResult.GoodsReceivedNotes = result.Read<GoodsReceivedNotes>().AsList();
                    goodsReceivedDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return goodsReceivedDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        //public GoodsReceivedNotesDisplayResult GetFilterGRN(GRNFilterDisplayInput gRNFilterDisplayInput)
        //{
        //    try
        //    {
        //        GoodsReceivedNotesDisplayResult goodsReceivedDisplayResult = new GoodsReceivedNotesDisplayResult();
        //        using (var result = this.m_dbconnection.QueryMultiple("GoodsReceivedNotes_CRUD", new
        //        {
        //            Action = "FILTER",
        //            GRNCodeFilter = gRNFilterDisplayInput.GRNCodeFilter,
        //            DoNumberFilter = gRNFilterDisplayInput.DoNumberFilter,
        //            PoNumberFilter = gRNFilterDisplayInput.PoNumberFilter,
        //            StatusFilter = gRNFilterDisplayInput.StatusFilter,
        //            FromDateFilter = gRNFilterDisplayInput.FromDateFilter,
        //            ToDateFilter = gRNFilterDisplayInput.ToDateFilter,
        //            SupplierNameFilter=gRNFilterDisplayInput.SupplierNameFilter,
        //            PoTypeIdFilter=gRNFilterDisplayInput.PoTypeIdFilter,
        //            Skip = gRNFilterDisplayInput.Skip,
        //            Take = gRNFilterDisplayInput.Take,
        //            CompanyId = gRNFilterDisplayInput.CompanyId
        //        }, commandType: CommandType.StoredProcedure))
        //        {
        //            goodsReceivedDisplayResult.GoodsReceivedNotes = result.Read<GoodsReceivedNotes>().AsList();
        //            goodsReceivedDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
        //        }
        //        return goodsReceivedDisplayResult;
        //    }
        //    catch (Exception ex)
        //    { throw ex; }
        //}


        public GoodsReceivedNotesDisplayResult GetFilterGRN(GRNFilterDisplayInput gRNFilterDisplayInput)
        {
            try
            {
                GoodsReceivedNotesDisplayResult goodsReceivedDisplayResult = new GoodsReceivedNotesDisplayResult();

                string whereCondition = @" from dbo.GoodsReceivedNote GRN
			                                left join WorkFlowStatus as WF on GRN.WorkFlowStatusId = WF.WorkFlowStatusId
                                            left join Supplier s on s.SupplierId=GRN.SupplierId";
                if (gRNFilterDisplayInput.DepartmentFilter != null && gRNFilterDisplayInput.DepartmentFilter != "null")
                {
                    whereCondition = $"{ whereCondition } left join PurchaseOrder PO on PO.PurchaseOrderId =GRN.PurchaseOrderId " +
                        $"left join FixedAssetPurchaseOrder APO on APO.FixedAssetPurchaseOrderId =GRN.PurchaseOrderId " +
                        $"left join ExpensesPurchaseOrder EXPO on EXPO.ExpensesPurchaseOrderId =GRN.PurchaseOrderId ";
                    // $"left join Location loc on loc.LocationID=PO.LocationID or loc.LocationID=APO.LocationID or loc.LocationID=EXPO.LocationID ";
                }

                whereCondition = $"{ whereCondition } where GRN.CompanyId=@CompanyId and GRN.Isdeleted=0 and (GRN.SupplierDoNumber LIKE CONCAT( '%',@DoNumberFilter,'%')" +
                                                 $"AND WF.Statustext LIKE CONCAT( '%',@StatusFilter,'%') AND S.SupplierName LIKE CONCAT( '%',@SupplierNameFilter,'%')" +
                                                 $"AND GRN.POTypeId LIKE CONCAT( '%',@PoTypeIdFilter,'%')AND GRN.PONO LIKE CONCAT( '%',@PoNumberFilter,'%')" +
                                                 $"AND S.SupplierCode LIKE CONCAT( '%',@SupplierCodeFilter,'%') ";
                if (gRNFilterDisplayInput.DepartmentFilter != null && gRNFilterDisplayInput.DepartmentFilter != "null")
                {
                    whereCondition = $"{ whereCondition } AND GRN.LocationId= @DepartmentFilter  ";
                }


                if (gRNFilterDisplayInput.GRNCodeFilter != null && gRNFilterDisplayInput.GRNCodeFilter != "null")
                {
                    char c = gRNFilterDisplayInput.GRNCodeFilter.FirstOrDefault();
                    if (c == 'D')
                    {
                        whereCondition = $"{ whereCondition } and (GRN.DraftCode LIKE CONCAT( '%',@GRNCodeFilter,'%')) ";
                    }
                    else
                    {
                        whereCondition = $"{ whereCondition } and (GRN.GRNCode LIKE CONCAT( '%',@GRNCodeFilter,'%')) ";
                    }
                }
                if (gRNFilterDisplayInput.FromDateFilter != null)
                {
                    whereCondition = $"{ whereCondition } and (GRN.CreatedDate BETWEEN @FromDateFilter and @ToDateFilter) ";
                }
                whereCondition = $"{ whereCondition } and GRN.LocationID in ( select DepartmentId from usercompanydepartments where userId=@userId and CompanyId=@CompanyId)";
                whereCondition = $"{ whereCondition } ) ";

                string itemsQuery = @"	select distinct
				                        GoodsReceivedNoteId,
				                        GRNCode,
				                        GRN.DraftCode,
				                        GRN.StatusId,
				                        WF.WorkFlowStatusId,
				                        WF.Statustext as WorkFlowStatusText,
				                        GRN.PurchaseOrderId,
				                        GRN.POTypeId,
				                        SupplierDoNumber,
				                        IsReturn,
				                        PONO as PurchaseOrderCode,
			                            GRN.Remarks as GRNRemarks,
				                        GRN.CreatedDate,
				                        S.SupplierName,
                                        S.SupplierCode,
                                        GRN.UpdatedDate";

                itemsQuery = $"{ itemsQuery } { whereCondition } order by GRN.UpdatedDate desc OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                itemsQuery = $"{ itemsQuery } select count(*) { whereCondition } ";

                using (var result = this.m_dbconnection.QueryMultiple(itemsQuery, new
                {
                    Action = "SELECT",
                    GRNCodeFilter = gRNFilterDisplayInput.GRNCodeFilter,
                    DoNumberFilter = gRNFilterDisplayInput.DoNumberFilter,
                    PoNumberFilter = gRNFilterDisplayInput.PoNumberFilter,
                    StatusFilter = gRNFilterDisplayInput.StatusFilter,
                    FromDateFilter = gRNFilterDisplayInput.FromDateFilter,
                    ToDateFilter = gRNFilterDisplayInput.ToDateFilter,
                    SupplierNameFilter = gRNFilterDisplayInput.SupplierNameFilter,
                    PoTypeIdFilter = gRNFilterDisplayInput.PoTypeIdFilter,
                    Skip = gRNFilterDisplayInput.Skip,
                    Take = gRNFilterDisplayInput.Take,
                    CompanyId = gRNFilterDisplayInput.CompanyId,
                    UserId = gRNFilterDisplayInput.UserId,
                    SupplierCodeFilter = gRNFilterDisplayInput.SupplierCodeFilter,
                    DepartmentFilter = gRNFilterDisplayInput.DepartmentFilter
                }, commandType: CommandType.Text))
                {
                    goodsReceivedDisplayResult.GoodsReceivedNotes = result.Read<GoodsReceivedNotes>().AsList();
                    goodsReceivedDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return goodsReceivedDisplayResult;
            }
            catch (Exception e)
            {

                throw e;
            }
        }





        public GoodsReceivedNotesDisplayResult GetDraftCount(int purchaseorderId, int poTypeId, int companyId)
        {
            try
            {
                GoodsReceivedNotesDisplayResult goodsReceivedDisplayResult = new GoodsReceivedNotesDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("GoodsReceivedNotes_CRUD", new
                {
                    Action = "DRAFTCOUNT",
                    PurchaseOrderId = purchaseorderId,
                    POTypeId = poTypeId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure))
                {
                    goodsReceivedDisplayResult.graftGRNlist = result.Read<DraftGRN>().AsList();
                }
                return goodsReceivedDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public GoodsReceivedNotes GetGoodsReceivedNotesDetails(int goodReceivedNoteId, int purchaseOrderId, int purchaseOrderTypeId)
        {
            try
            {
                GoodsReceivedNotes goodsReceivedDisplayResult = new GoodsReceivedNotes();

                using (var result = this.m_dbconnection.QueryMultiple("GoodsReceivedNotes_CRUD", new
                {
                    Action = "SELECTBYID",
                    GoodsReceivedNoteId = goodReceivedNoteId,
                    POTypeId = purchaseOrderTypeId
                }, commandType: CommandType.StoredProcedure))
                {
                    goodsReceivedDisplayResult = result.Read<GoodsReceivedNotes, Supplier, GoodsReceivedNotes>((Pc, Su) =>
                    {

                        Pc.Supplier = Su;
                        return Pc;
                    }, splitOn: "SupplierId").FirstOrDefault();

                    goodsReceivedDisplayResult.ItemsList = result.Read<GoodsReceivedNotesItems, GetItemMasters, AccountCode, AccountCodeCategory, GoodsReceivedNotesItems>((Pc, Su, Ac, Acc) =>
                     {
                         if (Su != null)
                         {
                             Pc.Item = Su;
                         }

                         decimal taxTotal = 0;
                         decimal itemTotalPrice = 0;
                         decimal totalPrice = 0;
                         decimal totalbefTax = 0;
                         if ((Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) && (goodsReceivedDisplayResult.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo)))
                         {
                             Pc.ItemType = "Item";
                         }
                         if ((Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) && (goodsReceivedDisplayResult.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo)))
                         {
                             Pc.ItemType = "Asset";
                         }
                         else if (Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                         {
                             Pc.ItemType = "Service";
                         }

                         if (Ac != null)
                         {
                             Pc.Service = Ac;
                             //if (Su != null)
                             //{
                             //    Pc.Service.Code = Pc.Item.ItemMasterCode;
                             //}
                         }

                         if (Acc != null && goodsReceivedDisplayResult.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                         {
                             Pc.ItemType = Acc.AccountCodeName;
                         }

                         SharedRepository.GetPurchaseOrderItemPrice(Pc.UnitPrice, Pc.OriginalQty,
                             Pc.TaxAmount, Pc.Discount, goodsReceivedDisplayResult.IsGstBeforeDiscount, out taxTotal, out itemTotalPrice, out totalPrice, out totalbefTax);
                         Pc.PurchaseValue = itemTotalPrice / Pc.OriginalQty;
                         return Pc;
                     }, splitOn: "ItemMasterId, AccountCodeId, AccountCodeCategoryId").ToList();

                    //list of assets details added after grn has been saved...
                    if (goodsReceivedDisplayResult.ItemsList != null && goodsReceivedDisplayResult.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                    {
                        var assetDetails = result.Read<AssetDetails, AssetMaster, AssetDetails>((AD, AM) =>
                        {
                            AD.Asset = AM;
                            return AD;
                        }, splitOn: "AssetId").ToList();

                        goodsReceivedDisplayResult.Assets = assetDetails;
                    }
                    this.sharedRepository = new SharedRepository();
                    DocumentAddress address = this.sharedRepository.GetDocumentAddress((int)WorkFlowProcessTypes.GoodRecievedNotes, goodReceivedNoteId, goodsReceivedDisplayResult.CompanyId);
                    if (genericRepository == null)
                        this.genericRepository = new GenericRepository();
                    goodsReceivedDisplayResult.HasPendingInvoice = this.genericRepository.checkPendingDocuments(new ProjectDocument
                    {
                        DocumentId = goodReceivedNoteId,
                        DocumentTypeId = (int)WorkFlowProcessTypes.SupplierInvoice
                    });
                    goodsReceivedDisplayResult.SupplierAddress = address == null ? string.Empty : address.Address;
                    var attachmentTypeId = 0;
                    if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                    {
                        attachmentTypeId = Convert.ToInt32(AttachmentType.InventoryPurchaseOrder);
                    }
                    else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                    {
                        attachmentTypeId = Convert.ToInt32(AttachmentType.FixedAssetPurchaseOrder);
                    }
                    else if ((purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed)) || purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                    {
                        attachmentTypeId = Convert.ToInt32(AttachmentType.ContractPurchaseOrder);
                    }
                    else if (purchaseOrderTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                    {
                        attachmentTypeId = Convert.ToInt32(AttachmentType.ExpensePurchaseOrder);
                    }
                    var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        RecordId = purchaseOrderId,
                        AttachmentTypeId = attachmentTypeId //static value need to change

                    }, commandType: CommandType.StoredProcedure);
                    goodsReceivedDisplayResult.Attachments = attachments.ToList();

                    var doattachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        RecordId = goodReceivedNoteId,
                        AttachmentTypeId = Convert.ToInt32(AttachmentType.GoodsReceivedNotes) //static value need to change
                    }, commandType: CommandType.StoredProcedure);
                    goodsReceivedDisplayResult.DOAttachments = doattachments.ToList();

                };
                return goodsReceivedDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateGoodsReceivedNote(GoodsReceivedNotes goodsReceivedNotes)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                int grtcount = 0;
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region Goods Received Notes Creation...
                        List<GetItemDetails> getItemDetails = new List<GetItemDetails>();
                        var paramaterObj = new DynamicParameters();
                        grtcount = transactionObj.Connection.QueryFirstOrDefault<int>("GoodsReceivedNotes_CRUD", new
                        {
                            Action = "COUNT",
                            CompanyId = goodsReceivedNotes.CompanyId
                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);

                        string DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        string grnCode = DraftCode + ModuleCodes.GoodsRecievedNotes + "-" + grtcount.ToString("D5");

                        int goodsReceivedNoteId = transactionObj.Connection.QueryFirstOrDefault<int>("GoodsReceivedNotes_CRUD", new
                        {
                            Action = "INSERT",
                            PurchaseOrderId = goodsReceivedNotes.PurchaseOrderId,
                            CompanyId = goodsReceivedNotes.CompanyId,
                            POTypeId = goodsReceivedNotes.POTypeId,
                            SupplierDoNumber = goodsReceivedNotes.SupplierDoNumber,
                            Remarks = goodsReceivedNotes.GRNRemarks,
                            GRNCode = grnCode,
                            CreatedBy = goodsReceivedNotes.CreatedBy,
                            CreatedDate = DateTime.Now,
                            WorkFlowStatusId = goodsReceivedNotes.WorkFlowStatusId,
                            StatusId = 0,
                            IsReturn = goodsReceivedNotes.IsReturn,
                            SupplierId = goodsReceivedNotes.SupplierId,
                            PurchaseOrderCode = goodsReceivedNotes.PurchaseOrderCode,
                            LocationId = goodsReceivedNotes.LocationID
                        },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                        #endregion
                        #region  we are saving GRN items...
                        if (goodsReceivedNoteId > 0)
                        {
                            goodsReceivedNotes.GoodsReceivedNoteId = goodsReceivedNoteId;
                            if (goodsReceivedNotes.ItemsList != null)
                            {
                                List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                foreach (var record in goodsReceivedNotes.ItemsList)
                                {
                                    if (record.TypeId == 0)
                                    {
                                        record.TypeId = null;
                                    }
                                    if (record.Category == 0)
                                    {
                                        record.Category = null;
                                    }
                                    int goodsReceivedRecordId = transactionObj.Connection.QueryFirstOrDefault<int>("GoodsReceivedNotes_CRUD", new
                                    {
                                        Action = "INSERTITEM",
                                        GRNItemId = record.GRNItemId,
                                        TypeId = record.TypeId,
                                        Category = record.Category,
                                        GoodsReceivedNoteId = goodsReceivedNoteId,
                                        PurchaseOrderId = goodsReceivedNotes.PurchaseOrderId,
                                        RecordId = record.RecordId,
                                        OriginalQty = record.OriginalQty,
                                        TotalQtyReceived = record.TotalReceivedQty,
                                        OpenQty = record.OpenQty,
                                        GRNQty = record.GRNQty,
                                        Discount = record.Discount
                                    },
                                    transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);

                                    if ((record.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) && (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed)) && (goodsReceivedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo)))
                                    {
                                        int stockRecordId = transactionObj.Connection.QueryFirstOrDefault<int>("ItemStock_CRUD", new
                                        {
                                            Action = "INSERT",
                                            DocumentId = goodsReceivedNoteId,
                                            RecordId = goodsReceivedRecordId,
                                            ItemMasterId = record.Item.ItemMasterId,
                                            StockIn = record.GRNQty,
                                            StockOut = 0,
                                            CreatedBy = goodsReceivedNotes.CreatedBy,
                                            CreatedDate = DateTime.Now
                                        },
                                        transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);
                                    }
                                }
                            }
                            if (goodsReceivedNotes.Assets != null && goodsReceivedNotes.Assets.Count>0)
                            {
                                this.assetDetailsRepository = new AssetDetailsRepository();

                                goodsReceivedNotes.Assets.ForEach(data =>
                                {
                                    data.Location = new Locations { LocationID = goodsReceivedNotes.LocationID };
                                    data.GoodsReceivedNoteId = goodsReceivedNoteId;
                                    data.CompanyId = goodsReceivedNotes.CompanyId;
                                });

                                var saveResult = this.assetDetailsRepository.SaveAssetDetails(goodsReceivedNotes.Assets.Where(j => j.AssetDetailsId == null || j.AssetDetailsId == 0).ToList(),
                                                                                              transactionObj.Connection, transactionObj, "INSERT");
                            }

                            #region
                            if (goodsReceivedNotes.files != null)
                            {
                                try
                                {
                                    //saving files in the folder...
                                    FileOperations fileOperationsObj = new FileOperations();
                                    bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                    {
                                        CompanyName = "UEL",
                                        ModuleName = AttachmentFolderNames.GoodsReceivedNotes,
                                        Files = goodsReceivedNotes.files,
                                        UniqueId = goodsReceivedNoteId.ToString()
                                    });
                                    List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                    for (var i = 0; i < goodsReceivedNotes.files.Count; i++)
                                    {
                                        var itemObj = new DynamicParameters();
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.GoodsReceivedNotes), DbType.Int32, ParameterDirection.Input);//static value need to change
                                        itemObj.Add("@RecordId", goodsReceivedNoteId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", goodsReceivedNotes.files[i].FileName, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", goodsReceivedNotes.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        fileToSave.Add(itemObj);
                                    }
                                    var invoiceFileSaveResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);
                                }
                                catch (Exception e)
                                {
                                    throw e;
                                }
                            }
                            #endregion





                            if (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            {

                                int status = transactionObj.Connection.Execute("usp_UpdatePurchaseOrderStatus", new
                                {
                                    Action = "GRN",
                                    PurchaseOrderId = goodsReceivedNotes.PurchaseOrderId,
                                    POTypeId = goodsReceivedNotes.POTypeId
                                },
                                transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);

                                int updateStatus = transactionObj.Connection.Execute("GoodsReceivedNotes_CRUD", new
                                {
                                    Action = "UPDATEWORKFLOWSTATUS",
                                    DocumentId = goodsReceivedNoteId,
                                    // UserId = workFlowApprovals.UserId,
                                    WorkFlowStatusId = goodsReceivedNotes.WorkFlowStatusId,
                                    CompanyId = goodsReceivedNotes.CompanyId,
                                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodRecievedNotes),
                                    DocumentCode = (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed)) ? SharedRepository.GetProcessCode(Convert.ToInt32(WorkFlowProcessTypes.GoodRecievedNotes)) : null
                                },
                                transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);



                            }



                        }
                        #endregion
                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = goodsReceivedNotes.SupplierAddress,
                            CompanyId = goodsReceivedNotes.CompanyId,
                            DocumentId = goodsReceivedNoteId,
                            ProcessId = (int)WorkFlowProcessTypes.GoodRecievedNotes
                        }, transactionObj);
                        #endregion
                        //commiting the transaction...
                        transactionObj.Commit();
                        if (goodsReceivedNoteId > 0)
                        {

                            DateTime now = DateTime.Now;
                            UserProfileRepository userProfileRepository = new UserProfileRepository();
                            var user = userProfileRepository.GetUserById(goodsReceivedNotes.CreatedBy);
                            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                            if (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Draft))
                            {
                                AuditLog.Info(WorkFlowProcessTypes.GoodRecievedNotes.ToString(), "create", goodsReceivedNotes.CreatedBy.ToString(), goodsReceivedNoteId.ToString(), "CreateGoodsReceivedNote", "Created by " + UserName + " on " + now + "", goodsReceivedNotes.CompanyId);
                                AuditLog.Info(WorkFlowProcessTypes.GoodRecievedNotes.ToString(), "create", goodsReceivedNotes.CreatedBy.ToString(), goodsReceivedNoteId.ToString(), "CreateGoodsReceivedNote", "Saved as Draft " + UserName + " on " + now + "", goodsReceivedNotes.CompanyId);
                            }
                            if (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            {
                                AuditLog.Info(WorkFlowProcessTypes.GoodRecievedNotes.ToString(), "submit", goodsReceivedNotes.CreatedBy.ToString(), goodsReceivedNoteId.ToString(), "CreateGoodsReceivedNote", "Submitted by " + UserName + " on " + now + "", goodsReceivedNotes.CompanyId);
                                this.LogPOAfterGRNSubmit(goodsReceivedNotes, UserName);
                            }

                            // }
                        }
                        return goodsReceivedNoteId;
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

        public int UpdateGoodsReceivedNote(GoodsReceivedNotes goodsReceivedNotes)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                int updateResult = 0;
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region goods received notes updation...

                        var paramaterObj = new DynamicParameters();

                        updateResult = transactionObj.Connection.Execute("GoodsReceivedNotes_CRUD", new
                        {
                            Action = "UPDATE",
                            GoodsReceivedNoteId = goodsReceivedNotes.GoodsReceivedNoteId,
                            SupplierDoNumber = goodsReceivedNotes.SupplierDoNumber,
                            Remarks = goodsReceivedNotes.GRNRemarks,
                            CreatedBy = goodsReceivedNotes.CreatedBy,
                            CreatedDate = DateTime.Now,
                            WorkFlowStatusId = goodsReceivedNotes.WorkFlowStatusId,
                            StatusId = goodsReceivedNotes.StatusId,
                            SupplierId = goodsReceivedNotes.Supplier.SupplierId
                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);

                        #endregion

                        #region we are saving goods received notes items...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in goodsReceivedNotes.ItemsList.Where(i => i.GRNItemId == 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@GRNItemId", record.GRNItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@TypeId", record.TypeId == 0 ? null : record.TypeId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Category", record.Category == 0 ? null : record.Category, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@GRNItemId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@GoodsReceivedNoteId", goodsReceivedNotes.GoodsReceivedNoteId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@PurchaseOrderId", goodsReceivedNotes.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@RecordId", record.RecordId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@OriginalQty", record.OriginalQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TotalQtyReceived", record.TotalReceivedQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@OpenQty", record.OpenQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@GRNQty", record.GRNQty, DbType.Decimal, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }

                        var purchaseOrderItemSaveResult = transactionObj.Connection.Execute("GoodsReceivedNotes_CRUD", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion

                        #region updating goods received note items...

                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();
                        List<DynamicParameters> assetDetailsToAdd = new List<DynamicParameters>();
                        List<DynamicParameters> assetDetailsToUpdate = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in goodsReceivedNotes.ItemsList.Where(i => i.GRNItemId > 0).Select(i => i))
                        {
                            if (record.TypeId == 0)
                            {
                                record.TypeId = null;
                            }

                            if (record.Category == 0)
                            {
                                record.Category = null;
                            }


                            int goodsReceivedRecordId = transactionObj.Connection.QueryFirstOrDefault<int>("GoodsReceivedNotes_CRUD", new
                            {
                                Action = "UPDATEITEM",
                                GRNItemId = record.GRNItemId,
                                TypeId = record.TypeId,
                                Category = record.Category,
                                GoodsReceivedNoteId = goodsReceivedNotes.GoodsReceivedNoteId,
                                PurchaseOrderId = goodsReceivedNotes.PurchaseOrderId,
                                RecordId = record.RecordId,
                                OriginalQty = record.OriginalQty,
                                TotalQtyReceived = record.TotalReceivedQty,
                                OpenQty = record.OpenQty,
                                GRNQty = record.GRNQty
                            },
                                transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }

                        if (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed) && goodsReceivedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                        {
                            List<GoodsReceivedNotesItems> getItemDetails = new List<GoodsReceivedNotesItems>();

                            var getGRNItemDetails = transactionObj.Connection.Query<GoodsReceivedNotesItems>("GoodsReceivedNotes_CRUD", new
                            {
                                Action = "GETITEMSDETAILS",
                                GoodsReceivedNoteId = goodsReceivedNotes.GoodsReceivedNoteId,
                            }, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                            getItemDetails = getGRNItemDetails.ToList();
                            if (getItemDetails.Count > 0)
                            {
                                foreach (var record in getItemDetails)
                                {
                                    if (record.GRNQty > 0)
                                    {
                                        int stockRecordId = transactionObj.Connection.QueryFirstOrDefault<int>("ItemStock_CRUD", new
                                        {
                                            Action = "INSERT",
                                            DocumentId = goodsReceivedNotes.GoodsReceivedNoteId,
                                            RecordId = record.GRNItemId,
                                            ItemMasterId = record.ItemMasterId,
                                            StockIn = record.GRNQty,
                                            StockOut = 0,
                                            CreatedBy = goodsReceivedNotes.CreatedBy,
                                            CreatedDate = DateTime.Now
                                        },
                                        transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);
                                    }
                                }
                            }
                        }

                        if (goodsReceivedNotes.Assets != null)
                        {
                            this.assetDetailsRepository = new AssetDetailsRepository();

                            goodsReceivedNotes.Assets.ForEach(data =>
                            {
                                data.Location = new Locations { LocationID = goodsReceivedNotes.LocationID };
                                data.GoodsReceivedNoteId = goodsReceivedNotes.GoodsReceivedNoteId;
                                data.CompanyId = goodsReceivedNotes.CompanyId;
                            });

                            var assetsToAdd = goodsReceivedNotes.Assets.Where(j => j.AssetDetailsId == 0).ToList();
                            if (assetsToAdd.Count > 0)
                            {
                                var saveResult = this.assetDetailsRepository.SaveAssetDetails(goodsReceivedNotes.Assets.Where(j => j.AssetDetailsId == 0).ToList(),
                                                                                              transactionObj.Connection,
                                                                                              transactionObj, "INSERT");
                            }

                            var assetsToUpdate = goodsReceivedNotes.Assets.Where(j => j.AssetDetailsId > 0).ToList();
                            if (assetsToUpdate.Count > 0)
                            {
                                var assetUpdateResult = this.assetDetailsRepository.SaveAssetDetails(goodsReceivedNotes.Assets.Where(j => j.AssetDetailsId > 0).ToList(),
                                                                transactionObj.Connection,
                                                                transactionObj, "UPDATE");
                            }
                        }

                        #region deleting attachments
                        //looping through attachments
                        List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                        for (var i = 0; i < goodsReceivedNotes.DOAttachments.Count; i++)
                        {
                            var fileObj = new DynamicParameters();
                            fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                            fileObj.Add("@AttachmentTypeId", goodsReceivedNotes.DOAttachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                            fileObj.Add("@RecordId", goodsReceivedNotes.GoodsReceivedNoteId, DbType.Int32, ParameterDirection.Input);
                            fileObj.Add("@AttachmentId", goodsReceivedNotes.DOAttachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                            fileToDelete.Add(fileObj);
                            var invoiceFileDeleteResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                  commandType: CommandType.StoredProcedure);
                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.GoodsReceivedNotes,
                                FilesNames = goodsReceivedNotes.DOAttachments.Select(j => j.FileName).ToArray(),
                                UniqueId = goodsReceivedNotes.GoodsReceivedNoteId.ToString()
                            });
                        }

                        #endregion

                        #region
                        try
                        {
                            List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                            for (var i = 0; i < goodsReceivedNotes.files.Count; i++)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.GoodsReceivedNotes), DbType.Int32, ParameterDirection.Input);//static value need to change
                                itemObj.Add("@RecordId", goodsReceivedNotes.GoodsReceivedNoteId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@FileName", goodsReceivedNotes.files[i].FileName, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", goodsReceivedNotes.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                fileToSave.Add(itemObj);
                            }
                            var invoiceFileSaveResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.GoodsReceivedNotes,
                                Files = goodsReceivedNotes.files,
                                UniqueId = goodsReceivedNotes.GoodsReceivedNoteId.ToString()
                            });

                        }
                        catch (Exception e)
                        {
                            throw e;
                        }

                        #endregion

                        if (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                        {
                            int status = transactionObj.Connection.Execute("usp_UpdatePurchaseOrderStatus", new
                            {
                                Action = "GRN",
                                PurchaseOrderId = goodsReceivedNotes.PurchaseOrderId,
                                POTypeId = goodsReceivedNotes.POTypeId,
                            },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);

                            int updateStatus = transactionObj.Connection.Execute("GoodsReceivedNotes_CRUD", new
                            {
                                Action = "UPDATEWORKFLOWSTATUS",
                                DocumentId = goodsReceivedNotes.GoodsReceivedNoteId,
                                // UserId = workFlowApprovals.UserId,
                                WorkFlowStatusId = goodsReceivedNotes.WorkFlowStatusId,
                                CompanyId = goodsReceivedNotes.CompanyId,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodRecievedNotes),
                                DocumentCode = (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed)) ? SharedRepository.GetProcessCode(Convert.ToInt32(WorkFlowProcessTypes.GoodRecievedNotes)) : null
                            },
                           transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);

                        }
                        #endregion

                        #region Save Document Address Details.
                        this.sharedRepository = new SharedRepository();
                        this.sharedRepository.PostDocumentAddress(new DocumentAddress
                        {
                            Address = goodsReceivedNotes.SupplierAddress,
                            CompanyId = goodsReceivedNotes.CompanyId,
                            DocumentId = goodsReceivedNotes.GoodsReceivedNoteId,
                            ProcessId = (int)WorkFlowProcessTypes.GoodRecievedNotes
                        }, transactionObj);
                        #endregion
                        //commiting the transaction...
                        transactionObj.Commit();
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        var user = userProfileRepository.GetUserById(goodsReceivedNotes.CreatedBy);
                        string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);

                        DateTime now = DateTime.Now;
                        // string grnCode_1 = GetGRNCode(goodsReceivedNotes.GoodsReceivedNoteId);
                        if (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            AuditLog.Info(WorkFlowProcessTypes.GoodRecievedNotes.ToString(), "submit", goodsReceivedNotes.CreatedBy.ToString(), goodsReceivedNotes.GoodsReceivedNoteId.ToString(), "CreateGoodsReceivedNote", "Submitted by " + UserName + " on " + now + "", goodsReceivedNotes.CompanyId);

                        //AuditLog.Info("GoodsReceivedNotes", "update", goodsReceivedNotes.CreatedBy.ToString(), goodsReceivedNotes.GoodsReceivedNoteId.ToString(), "UpdateGoodsReceivedNote", "GRN with draft status " + grnCode_1 + " updated by " + UserName + "",goodsReceivedNotes.CompanyId);
                        //else if (goodsReceivedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                        //        AuditLog.Info("GoodsReceivedNotes", "update", goodsReceivedNotes.CreatedBy.ToString(), goodsReceivedNotes.GoodsReceivedNoteId.ToString(), "UpdateGoodsReceivedNote", "GRN " + grnCode_1 + " submitted by " + UserName + "", goodsReceivedNotes.CompanyId);

                        this.LogPOAfterGRNSubmit(goodsReceivedNotes, UserName);
                        return updateResult;
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

        private void LogPOAfterGRNSubmit(GoodsReceivedNotes goodsReceivedNotes, string userName)
        {
            int poStatusId = 0;
            DateTime now = DateTime.Now;
            string grnStatus = string.Empty;
            string grnCode = goodsReceivedNotes.GRNCode;
            if (string.IsNullOrEmpty(grnCode))
            {
                grnCode = this.m_dbconnection.Query<string>("select GRNCode from GoodsReceivedNote where GoodsReceivedNoteId=" + goodsReceivedNotes.GoodsReceivedNoteId).FirstOrDefault();
            }
            if (goodsReceivedNotes.POTypeId == 1)
            {
                poStatusId = this.m_dbconnection.Query<int>("select WorkFlowStatusId from PurchaseOrder where PurchaseOrderId=" + goodsReceivedNotes.PurchaseOrderId).FirstOrDefault();
            }
            if (goodsReceivedNotes.POTypeId == 2)
            {
                poStatusId = this.m_dbconnection.Query<int>("select WorkFlowStatusId from FixedAssetPurchaseOrder where FixedAssetPurchaseOrderId=" + goodsReceivedNotes.PurchaseOrderId).FirstOrDefault();
            }
            if (goodsReceivedNotes.POTypeId == 3)
            {
                poStatusId = this.m_dbconnection.Query<int>("select WorkFlowStatusId from ExpensesPurchaseOrder where ExpensesPurchaseOrderId=" + goodsReceivedNotes.PurchaseOrderId).FirstOrDefault();
            }
            if (goodsReceivedNotes.POTypeId == 5 || goodsReceivedNotes.POTypeId == 6)
            {
                poStatusId = this.m_dbconnection.Query<int>("select WorkFlowStatusId from ContractPurchaseOrder where CPOID=" + goodsReceivedNotes.PurchaseOrderId).FirstOrDefault();
            }

            if (goodsReceivedNotes.WorkFlowStatusId == (int)WorkFlowStatus.Completed && poStatusId != 8)
            {
                grnStatus = "Received";
            }
            if (poStatusId == (int)WorkFlowStatus.PartiallyReceived)
            {
                grnStatus = "Partially Received";
            }
            AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), goodsReceivedNotes.POTypeId), "update", goodsReceivedNotes.CreatedBy.ToString(), goodsReceivedNotes.PurchaseOrderId.ToString(), "UpdateGoodsReceivedNote", string.Format("Goods Received ({0}) by {1} on {2}. Status = {3}", grnCode, userName , now, grnStatus), goodsReceivedNotes.CompanyId);
        }

        /*
            this method is used to delete the purchase order...
        */
        public bool DeleteGoodsReceievedNote(GoodsReceivedNotesDelete deleteReceivedNotes)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        #region delete purchase order...

                        var purchaseOrderDeleteResult = transactionObj.Connection.Execute("GoodsReceivedNotes_CRUD",
                                                                new
                                                                {
                                                                    Action = "DELETE",
                                                                    GoodsReceivedNoteId = deleteReceivedNotes.GoodsReceivedNoteId,
                                                                    CreatedBy = deleteReceivedNotes.ModifiedBy
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        #endregion

                        #region deleting purchase order items...
                        var purchaseOrderItemDeleteResult = transactionObj.Connection.Execute("GoodsReceivedNotes_CRUD", new
                        {

                            Action = "DELETEALL",
                            GoodsReceivedNoteId = deleteReceivedNotes.GoodsReceivedNoteId,
                            CreatedBy = deleteReceivedNotes.ModifiedBy,
                            CreatedDate = DateTime.Now
                        },
                                                            transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                        #endregion
                        //commiting the transaction...
                        transactionObj.Commit();
                        UserProfileRepository userProfileRepository = new UserProfileRepository();
                        string UserName = userProfileRepository.GetUserById(deleteReceivedNotes.ModifiedBy).UserName;
                        // int CompanyId = GetCompanyId(deleteReceivedNotes.GoodsReceivedNoteId);
                        AuditLog.Info("GoodsReceivedNotesCreation", "Delete", deleteReceivedNotes.ModifiedBy.ToString(), deleteReceivedNotes.GoodsReceivedNoteId.ToString(), "DeleteGoodsReceievedNote", "Delete Purchase Order with ID " + deleteReceivedNotes.GoodsReceivedNoteId + " deleted by " + UserName, 0);
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

        //public int GetCompanyId(int GoodsReceivedNoteId)
        //{
        //    int CompanyId = 0;
        //    try
        //    {
        //        CompanyId = this.m_dbconnection.Query<int>("select CompanyId from GoodsReceivedNote where GoodsReceivedNoteId=" + GoodsReceivedNoteId).FirstOrDefault();
        //    }
        //    catch (Exception e)
        //    {

        //    }

        //    return CompanyId;
        //}

        /*
         this method is used to delete the purchase order...
     */
        public List<GoodsReceivedNotesItems> GetTotalReceivedItemQuantity(int purchaseOrderId, int purchaseOrderTypeId)
        {
            try
            {
                var totalReceivedQty = this.m_dbconnection.Query<GoodsReceivedNotesItems>("GoodsReceivedNotes_CRUD",
                                                        new
                                                        {
                                                            Action = "RECEIVEDQTY",
                                                            PurchaseOrderId = purchaseOrderId,
                                                            POTypeId = purchaseOrderTypeId
                                                        },
                                                        commandType: CommandType.StoredProcedure).ToList();
                return totalReceivedQty;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GoodsReceivedNotesPrint(int goodsReceivedNotesId, int purchaseOrderTypeId, int companyId)
        {
            try
            {
                var result = GetGoodsReceivedNotesPDFTemplate(goodsReceivedNotesId, purchaseOrderTypeId, companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetGoodsReceivedNotesPDFTemplate(int goodsReceivedNotesId, int purchaseOrderTypeId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                GoodsReceivedNotes goodsReceivedNoteDetails = GetGoodsReceivedNotesDetails(goodsReceivedNotesId, 0, purchaseOrderTypeId);
                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();
                var result = pdfGeneratorObj.GetGoodsReceivedNotesPDFTemplate(goodsReceivedNoteDetails, companyDetails);
                return result;
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

        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();
                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.GoodsReceivedNotes,
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

        public int VoidGRN(GRNVoid gRNVoid)
        {
            try
            {

                var result = this.m_dbconnection.Execute("GoodsReceivedNotes_CRUD", new
                {

                    Action = "VOIDRECORD",
                    GoodsReceivedNoteId = gRNVoid.GoodsReceivedNoteId,
                    ReasonstoVoid = gRNVoid.Reasons.Trim(),
                    CreatedBy = gRNVoid.UserId,
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.Void),
                    CreatedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure);

                int status = this.m_dbconnection.Execute("usp_UpdatePurchaseOrderStatus", new
                {
                    Action = "GRN",
                    PurchaseOrderId = gRNVoid.PurchaseOrderId,
                    POTypeId = gRNVoid.POTypeId
                },
                commandType: CommandType.StoredProcedure);
                if (gRNVoid.POTypeId == 1)
                {
                    UserProfileRepository userProfileRepository = new UserProfileRepository();
                    string UserName = userProfileRepository.GetUserById(gRNVoid.UserId).UserName;
                    if (gRNVoid.ItemsList != null)
                    {
                        foreach (var record in gRNVoid.ItemsList)
                        {
                            int stockRecordId = this.m_dbconnection.QueryFirstOrDefault<int>("ItemStock_CRUD", new
                            {
                                Action = "DELETE",
                                DocumentId = gRNVoid.GoodsReceivedNoteId,
                                RecordId = record.GRNItemId,
                                ItemMasterId = record.Item.ItemMasterId,
                            },
                            commandType: CommandType.StoredProcedure);
                        }
                    }
                    // int CompanyId = GetCompanyId(gRNVoid.GoodsReceivedNoteId);

                    //if(purchaseorderStatusid== (int)WorkFlowStatus.Completed)
                }
                DateTime now = DateTime.Now;
                UserProfileRepository userProfileRepository1 = new UserProfileRepository();
                var user = userProfileRepository1.GetUserById(gRNVoid.UserId);
                string approver = string.Format("{0} {1}", user.FirstName, user.LastName);
                AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), gRNVoid.POTypeId), "void", gRNVoid.UserId.ToString(), gRNVoid.PurchaseOrderId.ToString(), "VoidGRN", "Goods Received by " + approver + " on " + now + " Status=Void", 0);
                if (gRNVoid.StatusId == (int)WorkFlowStatus.Completed)
                {
                    AuditLog.Info(WorkFlowProcessTypes.GoodRecievedNotes.ToString(), "void", gRNVoid.UserId.ToString(), gRNVoid.GoodsReceivedNoteId.ToString(), "VoidGRN", "Voided by " + approver + " on " + now + " " + gRNVoid.Reasons, 0);

                }
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public GoodsReceivedNotes GetEditGRNDetails(int GoodsReceivedNoteId, int purchaseOrderId, int POTypeId)
        {
            GoodsReceivedNotes goodsReceivedNotesobj = new GoodsReceivedNotes();
            try
            {
                this.m_dbconnection.Open();
                using (var result = this.m_dbconnection.QueryMultiple("GoodsReceivedNotes_CRUD", new
                {
                    Action = "EDIT",
                    GoodsReceivedNoteId = GoodsReceivedNoteId,
                    PurchaseOrderId = purchaseOrderId,
                    POTypeId = POTypeId
                }, commandType: CommandType.StoredProcedure))
                {
                    goodsReceivedNotesobj.gRNQtyTotal = result.Read<GRNQtyTotal>().ToList();
                }
                return goodsReceivedNotesobj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public string GetGRNCode(int grnOrderId)
        {
            // return this.m_dbconnection.Query<string>("select DraftCode from GoodsReceivedNote where GoodsReceivedNoteId=" + grnOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();

            string GRNCode = this.m_dbconnection.Query<string>("select (case  when  GRNCODE != null OR GRNCODE <> ''  then  GRNCode   ELSE DraftCode end) from GoodsReceivedNote  where GoodsReceivedNoteId=" + grnOrderId, commandType: CommandType.Text).FirstOrDefault().ToString();
            return GRNCode;
        }

        public int CheckGRNInInvoice(int GoodsReceivedNoteId)
        {
            try
            {
                int grtcount = 0;
                grtcount = this.m_dbconnection.QueryFirstOrDefault<int>("GoodsReceivedNotes_CRUD", new
                {
                    Action = "CHECKVOID",
                    GoodsReceivedNoteId = GoodsReceivedNoteId
                }, commandType: CommandType.StoredProcedure);

                return grtcount;

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }



    }
}
