using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Data.SqlClient;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.PdfGenerator;

namespace UELPM.Service.Repositories
{
    public class GoodsReturnedNotesRepository : IGoodsReturnedNotesRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;
        AssetDetailsRepository assetDetailsRepository = null;

        public GoodsReturnedNotesDisplayResult GetGoodsReturnedNotes(GridDisplayInput goodsReceivedNotesInput)
        {
            try
            {
                GoodsReturnedNotesDisplayResult goodsReturnedNotesDisplayResult = new GoodsReturnedNotesDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("GoodsReturnedNotes_CRUD", new
                {
                    Action = "SELECT",
                    Search = goodsReceivedNotesInput.Search,
                    Skip = goodsReceivedNotesInput.Skip,
                    Take = goodsReceivedNotesInput.Take,
                    CompanyId = goodsReceivedNotesInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    goodsReturnedNotesDisplayResult.GoodsReturnNotesList = result.Read<GoodReturnNotesList>().AsList();
                    goodsReturnedNotesDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return goodsReturnedNotesDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public GoodsReturnedNotesDisplayResult GetFilterGoodsReturnNotes(GoodsReturnNoteFilterDisplayInput goodsReturnNoteFilterDisplayInput)
        {
            try
            {
                GoodsReturnedNotesDisplayResult goodsReturnedNotesDisplayResult = new GoodsReturnedNotesDisplayResult();
                //executing the stored procedure to get the list of credit notes
                using (var result = this.m_dbconnection.QueryMultiple("GoodsReturnedNotes_CRUD", new
                {
                    Action = "FILTER",
                    GRTCodeFilter = goodsReturnNoteFilterDisplayInput.GRTCodeFilter,
                    SupplierNameFilter = goodsReturnNoteFilterDisplayInput.SupplierNameFilter,
                    InvoiceCodeFilter = goodsReturnNoteFilterDisplayInput.InvoiceCodeFilter,
                    Skip = goodsReturnNoteFilterDisplayInput.Skip,
                    Take = goodsReturnNoteFilterDisplayInput.Take,
                    CompanyId = goodsReturnNoteFilterDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    goodsReturnedNotesDisplayResult.GoodsReturnNotesList = result.Read<GoodReturnNotesList>().AsList();
                    goodsReturnedNotesDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return goodsReturnedNotesDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateGoodsReturnedNote(GoodsReturnedNotes goodsReturnedNotes)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                int grtcount= 0;
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region Goods Received Notes Creation...
                        List<GetItemDetails> getItemDetails = new List<GetItemDetails>();
                        var paramaterObj = new DynamicParameters();
                        grtcount = transactionObj.Connection.QueryFirstOrDefault<int>("GoodsReturnedNotes_CRUD", new
                        {
                            Action = "COUNT",
                            CompanyId = goodsReturnedNotes.CompanyId
                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);

                        string DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                        string grtCode = DraftCode+ ModuleCodes.GoodsReturnedNotes + "-" + grtcount;
                        int goodsReturnedNoteId = transactionObj.Connection.QueryFirstOrDefault<int>("GoodsReturnedNotes_CRUD", new
                        {
                            Action = "INSERT",
                            CompanyId = goodsReturnedNotes.CompanyId,
                            GoodsReceivedNoteId = goodsReturnedNotes.GRN.GoodsReceivedNoteId,
                            GRNRemarks = goodsReturnedNotes.GRNRemarks,
                            GRTCode = grtCode,
                            CreatedBy = goodsReturnedNotes.CreatedBy,
                            CreatedDate = DateTime.UtcNow,
                            WorkFlowStatusId = goodsReturnedNotes.WorkFlowStatusId,
                            Status= goodsReturnedNotes.Status

                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);
                        #endregion
                        #region  we are saving purchase order items...
                        if (goodsReturnedNoteId > 0)
                        {
                            if (goodsReturnedNotes.ItemsList != null)
                            {
                                List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                                foreach (var record in goodsReturnedNotes.ItemsList)
                                {
                                    if (record.TypeId == 0)
                                    {
                                        record.TypeId = null;
                                    }
                                    if (record.Category == 0)
                                    {
                                        record.Category = null;
                                    }
                                    int goodsReceivedRecordId = transactionObj.Connection.QueryFirstOrDefault<int>("GoodsReturnedNotes_CRUD", new
                                    {
                                        Action = "INSERTITEM",                                        
                                        TypeId = record.TypeId,
                                        GoodsReceivedNoteId = goodsReturnedNoteId,
                                        Category = record.Category,
                                        RecordId = record.RecordId,
                                        OriginalQty = record.OriginalQty,
                                        TotalReceivedQty = record.TotalReceivedQty,
                                        GRNQty = record.RTNQty
                                    },
                                    transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);

                                    if (goodsReturnedNotes.Status == Convert.ToInt32(GoodsReceivedNotesStatus.Confirmed) && goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                                    {
                                        if (record.RTNQty > 0)
                                        {
                                            int stockRecordId = transactionObj.Connection.QueryFirstOrDefault<int>("ItemStock_CRUD", new
                                            {
                                                Action = "INSERT",
                                                DocumentId = goodsReturnedNoteId,
                                                RecordId = goodsReceivedRecordId,
                                                ItemMasterId = record.Item.ItemMasterId,
                                                StockIn = 0,
                                                StockOut = record.RTNQty,
                                                CreatedBy = goodsReturnedNotes.CreatedBy,
                                                CreatedDate = DateTime.Now
                                            },
                                        transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);
                                        }
                                    }

                                }
                            }  
                        }
                        if (goodsReturnedNotes.Status == Convert.ToInt32(GoodsReceivedNotesStatus.Confirmed))
                        {
                            int updateStatus = transactionObj.Connection.Execute("GoodsReturnedNotes_CRUD", new
                            {
                                Action = "UPDATEWORKFLOWSTATUS",
                                DocumentId = goodsReturnedNoteId,
                               // UserId = workFlowApprovals.UserId,
                                WorkFlowStatusId = 4,
                                CompanyId = goodsReturnedNotes.CompanyId,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes),
                                DocumentCode = (4 == Convert.ToInt32(WorkFlowStatus.Approved)) ? SharedRepository.GetProcessCode(Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes)) : null
                            },
                           transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                        }

                        #endregion

                        #region Approval coding
                        //if (goodsReturnedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                        //{
                        //    goodsReturnedNotes.GoodsReturnNoteId = goodsReturnedNoteId;
                        //    sharedRepository = new SharedRepository();
                        //    sharedRepository.SendForApproval(new WorkFlowParameter()
                        //    {
                        //        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes),
                        //        CompanyId = goodsReturnedNotes.CompanyId,
                        //        DocumentId = goodsReturnedNotes.GoodsReturnNoteId,
                        //        LocationId=goodsReturnedNotes.LocationID,
                        //        CreatedBy = goodsReturnedNotes.CreatedBy,
                        //        WorkFlowStatusId = goodsReturnedNotes.WorkFlowStatusId,
                        //        DocumentCode = grtCode,
                        //    }, false, transactionObj, transactionObj.Connection);
                        //}
                        //else
                        //{
                        //    transactionObj.Commit();
                        //}
                        #endregion

                        transactionObj.Commit();
                        return goodsReturnedNoteId;
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

        public bool DeleteGoodsReturnedNote(GoodReturnedNotesDelete goodReturnedNotesDelete)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    try
                    {
                        var goodreturnedDeleteResult = transactionObj.Connection.Execute("GoodsReturnedNotes_CRUD",
                                                                new
                                                                {
                                                                    Action = "DELETE",
                                                                    GoodsReturnNoteId = goodReturnedNotesDelete.GoodsReturnNoteId,
                                                                    CreatedBy = goodReturnedNotesDelete.ModifiedBy
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        #region deleting good returned items...
                        var purchaseOrderItemDeleteResult = transactionObj.Connection.Execute("GoodsReturnedNotes_CRUD", new
                        {

                            Action = "DELETEALL",
                            GoodsReturnNoteId = goodReturnedNotesDelete.GoodsReturnNoteId,
                            CreatedBy = goodReturnedNotesDelete.ModifiedBy,
                            CreatedDate = DateTime.Now
                        },
                                                            transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                        #endregion
                        //commiting the transaction...
                        transactionObj.Commit();
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

        public byte[] GoodsReturnedNotesPrint(int goodsReturnedNotesId, int poTypeId, int companyId)
        {
            try
            {
                var result = GetGoodsReturnedNotesPDFTemplate(goodsReturnedNotesId, poTypeId, companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetGoodsReturnedNotesPDFTemplate(int goodsReturnedNotesId, int poTypeId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                GoodsReturnedNotes goodsReturnedNoteDetails = GetGoodsReturnedNotesDetails(goodsReturnedNotesId,0);
                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();
                var result = pdfGeneratorObj.GetGoodsReturnedNotesPDFTemplate(goodsReturnedNoteDetails, companyDetails);
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

        public GoodsReturnedNotesDisplayResult GetGRTForApprovals(GridDisplayInput gridDisplayInput)
        {
            try
            {
                GoodsReturnedNotesDisplayResult goodsReturnedNotesDisplayResult = new GoodsReturnedNotesDisplayResult();

                using (var result = this.m_dbconnection.QueryMultiple("GoodsReturnedNotes_CRUD", new
                {
                    Action = "SELECTAPPROVALS",
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take,
                    UserId = gridDisplayInput.UserId,
                    Companyid = gridDisplayInput.CompanyId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes)
                }, commandType: CommandType.StoredProcedure))
                {
                    goodsReturnedNotesDisplayResult.GoodsReturnNotesList = result.Read<GoodReturnNotesList>().AsList();
                    goodsReturnedNotesDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return goodsReturnedNotesDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }
        
        public GoodsReturnedNotes GetGRNDetails(int goodsReceivedNoteId,int POTypeId)
        {
            try
            {
                GoodsReturnedNotes goodsReturnedNotes = new GoodsReturnedNotes();

                using (var result = this.m_dbconnection.QueryMultiple("GoodsReceivedNotes_CRUD", new
                {
                    Action = "SELECTBYID",
                    GoodsReceivedNoteId = goodsReceivedNoteId,
                    POTypeId= POTypeId
                }, commandType: CommandType.StoredProcedure))
                {
                    goodsReturnedNotes = result.Read<GoodsReturnedNotes, Supplier, GoodsReturnedNotes>((Pc, Su) => {

                        Pc.Supplier = Su;
                        return Pc;
                    }, splitOn: "SupplierId").FirstOrDefault();

                    goodsReturnedNotes.ItemsList = result.Read<GoodsReturnedNotesItems, GetItemMasters, AccountCode, AccountCodeCategory, GoodsReturnedNotesItems>((Pc, Su, Ac, Acc) =>
                    {
                        if (Su != null)
                        {
                            Pc.Item = Su;
                        }

                        decimal taxTotal = 0;
                        decimal itemTotalPrice = 0;
                        decimal totalPrice = 0;
                        decimal totalbefTax = 0;
                        if ((Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) && (goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo)))
                        {
                            Pc.ItemType = "Item";
                        }
                        if ((Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) && (goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo)))
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
                            if (Su != null)
                            {
                                Pc.Service.Code = Pc.Item.ItemMasterCode;
                            }
                        }

                        if (Acc != null && goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                        {
                            Pc.ItemType = Acc.AccountCodeName;
                        }

                        SharedRepository.GetPurchaseOrderItemPrice(Pc.UnitPrice, Pc.OriginalQty,
                            Pc.TaxAmount, Pc.Discount, goodsReturnedNotes.IsGstBeforeDiscount, out taxTotal, out itemTotalPrice, out totalPrice, out totalbefTax);
                        Pc.PurchaseValue = itemTotalPrice / Pc.OriginalQty;
                        return Pc;
                    }, splitOn: "ItemMasterId, AccountCodeId, AccountCodeCategoryId").ToList();                    

                    if (goodsReturnedNotes.ItemsList != null && goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                    {
                        var assetDetails = result.Read<AssetDetails, AssetMaster, AssetDetails>((AD, AM) =>
                        {
                            AD.Asset = AM;
                            return AD;
                        }, splitOn: "AssetId").ToList();

                        goodsReturnedNotes.Assets = assetDetails;
                    }
                    var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        RecordId = goodsReturnedNotes.PurchaseOrderid,
                        AttachmentTypeId = POTypeId
                    }, commandType: CommandType.StoredProcedure);

                    goodsReturnedNotes.Attachments = attachments.ToList();

                };
                return goodsReturnedNotes;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        
        public GoodsReturnedNotes GetGoodsReturnedNotesDetails(int goodsReturnedNoteId, int loggedInUserId = 0)
        {
            try
            {
                GoodsReturnedNotes goodsReturnedNotes = new GoodsReturnedNotes();

                using (var result = this.m_dbconnection.QueryMultiple("GoodsReturnedNotes_CRUD", new
                {
                    Action = "SELECTBYID",
                    GoodsReturnNoteId = goodsReturnedNoteId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes)
                }, commandType: CommandType.StoredProcedure))
                {
                    goodsReturnedNotes = result.Read<GoodsReturnedNotes, Supplier, GRNS, GoodsReturnedNotes>((Pc, Su, Grns) => {

                        Pc.Supplier = Su;
                        Pc.GRN = Grns;
                        return Pc;
                    }, splitOn: "SupplierId,GoodsReceivedNoteId").FirstOrDefault();
                    goodsReturnedNotes.ItemsList = result.Read<GoodsReturnedNotesItems, GetItemMasters, AccountCode, AccountCodeCategory, GoodsReturnedNotesItems>((Pc, Su, Ac, Acc) =>
                    {
                        if (Su != null)
                        {
                            Pc.Item = Su;
                        }

                        decimal taxTotal = 0;
                        decimal itemTotalPrice = 0;
                        decimal totalPrice = 0;
                        decimal totalbefTax = 0;
                        if ((Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) && (goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo)))
                        {
                            Pc.ItemType = "Item";
                        }
                        if ((Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) && (goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo)))
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
                            if (Su != null)
                            {
                                Pc.Service.Code = Pc.Item.ItemMasterCode;
                            }
                        }

                        if (Acc != null && goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                        {
                            Pc.ItemType = Acc.AccountCodeName;
                        }

                        SharedRepository.GetPurchaseOrderItemPrice(Pc.UnitPrice, Pc.OriginalQty,
                            Pc.TaxAmount, Pc.Discount, goodsReturnedNotes.IsGstBeforeDiscount, out taxTotal, out itemTotalPrice, out totalPrice, out totalbefTax);
                        Pc.PurchaseValue = itemTotalPrice / Pc.OriginalQty;
                        return Pc;
                    }, splitOn: "ItemMasterId, AccountCodeId, AccountCodeCategoryId").ToList();
                    UserProfile userProfile = result.Read<UserProfile>().FirstOrDefault();
                    if (userProfile != null)
                    {
                        goodsReturnedNotes.CurrentApproverUserId = userProfile.UserID;
                        goodsReturnedNotes.CurrentApproverUserName = userProfile.UserName;
                    }

                    if (loggedInUserId != 0)
                    {
                        goodsReturnedNotes.WorkFlowComments = new WorkflowAuditTrailRepository().GetAuditTrialDetails(new WorkflowAuditTrail()
                        {
                            Documentid = goodsReturnedNotes.GoodsReturnNoteId,
                            ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes),
                            UserId = loggedInUserId,
                            DocumentUserId = goodsReturnedNotes.CreatedBy
                        }, this.m_dbconnection).ToList();
                    }

                    var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                    {
                        Action = "SELECT",
                        RecordId = goodsReturnedNotes.PurchaseOrderid,
                        AttachmentTypeId = goodsReturnedNotes.POTypeId //static value need to change

                    }, commandType: CommandType.StoredProcedure);

                    goodsReturnedNotes.Attachments = attachments.ToList();

                    ////list of assets details added after grn has been saved...
                    //if (goodsReturnedNotes.ItemsList != null && goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                    //{
                    //    var assetDetails = result.Read<AssetDetails, AssetMaster, AssetDetails>((AD, AM) =>
                    //    {
                    //        AD.Asset = AM;
                    //        return AD;
                    //    }, splitOn: "AssetId").ToList();

                    //    goodsReturnedNotes.Assets = assetDetails;
                    //}


                };
                return goodsReturnedNotes;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public int UpdateGoodsReturnedNote(GoodsReturnedNotes goodsReturnedNotes)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region goods received notes updation...

                        var paramaterObj = new DynamicParameters();

                        int updateResult = transactionObj.Connection.Execute("GoodsReturnedNotes_CRUD", new
                        {
                            Action = "UPDATE",
                            GoodsReturnNoteId = goodsReturnedNotes.GoodsReturnNoteId,
                            GRNRemarks = goodsReturnedNotes.GRNRemarks,
                            CreatedBy = goodsReturnedNotes.CreatedBy,
                            CreatedDate = DateTime.Now,
                            WorkFlowStatusId = goodsReturnedNotes.WorkFlowStatusId,
                            Status = goodsReturnedNotes.Status,
                        },
                          transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);

                        #endregion

                        #region we are saving goods received notes items...

                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                        //looping through the list of purchase order items...
                        foreach (var record in goodsReturnedNotes.ItemsList.Where(i => i.GoodsReturnNoteItemId == 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@TypeId", record.TypeId == 0 ? null : record.TypeId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@Category", record.Category == 0 ? null : record.Category, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@GoodsReceivedNoteId", goodsReturnedNotes.GoodsReceivedNoteId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@RecordId", record.RecordId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@OriginalQty", record.OriginalQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@TotalReceivedQty ", record.TotalReceivedQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@GRNQty", record.RTNQty, DbType.Decimal, ParameterDirection.Input);

                            itemToAdd.Add(itemObj);
                        }

                        var purchaseOrderItemSaveResult = transactionObj.Connection.Execute("GoodsReturnedNotes_CRUD", itemToAdd,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);
                        #endregion


                        #region updating goods return note items...

                        foreach (var record in goodsReturnedNotes.ItemsList.Where(i => i.GoodsReturnNoteItemId > 0).Select(i => i))
                        {
                            if (record.TypeId == 0)
                            {
                                record.TypeId = null;
                            }
                            if (record.Category == 0)
                            {
                                record.Category = null;
                            }
                            int goodsReceivedRecordId = transactionObj.Connection.QueryFirstOrDefault<int>("GoodsReturnedNotes_CRUD", new
                            {
                                Action = "UPDATEITEM",
                                GoodsReturnNoteItemId = record.GoodsReturnNoteItemId,
                                GoodsReturnNoteId = goodsReturnedNotes.GoodsReturnNoteId,
                                RecordId = record.RecordId,
                                GRNQty = record.RTNQty,
                                Category = record.Category,

                            },
                                    transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);
                        }

                        if (goodsReturnedNotes.Status == Convert.ToInt32(GoodsReceivedNotesStatus.Confirmed) && goodsReturnedNotes.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                        {
                            List<GoodsReturnedNotesItems> getItemDetails = new List<GoodsReturnedNotesItems>();

                            var getGRNItemDetails = transactionObj.Connection.Query<GoodsReturnedNotesItems>("GoodsReturnedNotes_CRUD", new
                            {
                                Action = "GETITEMSDETAILS",
                                GoodsReturnNoteId = goodsReturnedNotes.GoodsReturnNoteId,
                            }, transaction: transactionObj, commandType: CommandType.StoredProcedure);

                            getItemDetails = getGRNItemDetails.ToList();
                            if (getItemDetails.Count > 0)
                            {
                                foreach (var record in getItemDetails)
                                {
                                    if (record.RTNQty > 0)
                                    {
                                        int stockRecordId = transactionObj.Connection.QueryFirstOrDefault<int>("ItemStock_CRUD", new
                                        {
                                            Action = "INSERT",
                                            DocumentId = goodsReturnedNotes.GoodsReturnNoteId,
                                            RecordId = record.GoodsReturnNoteItemId,
                                            ItemMasterId = record.ItemMasterId,
                                            StockIn = 0,
                                            StockOut = record.RTNQty,
                                            CreatedBy = goodsReturnedNotes.CreatedBy,
                                            CreatedDate = DateTime.Now
                                        },
                                        transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);
                                    }
                                }
                            }
                        }

                        if (goodsReturnedNotes.Status == Convert.ToInt32(GoodsReceivedNotesStatus.Confirmed))
                        {
                            int updateStatus = transactionObj.Connection.Execute("GoodsReturnedNotes_CRUD", new
                            {
                                Action = "UPDATEWORKFLOWSTATUS",
                                DocumentId = goodsReturnedNotes.GoodsReturnNoteId,
                                // UserId = workFlowApprovals.UserId,
                                WorkFlowStatusId = 4,
                                CompanyId = goodsReturnedNotes.CompanyId,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes),
                                DocumentCode = (4 == Convert.ToInt32(WorkFlowStatus.Approved)) ? SharedRepository.GetProcessCode(Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes)) : null
                            },
                           transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);
                        }


                            #endregion

                            #region
                            //if (goodsReturnedNotes.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                            //{
                            //    sharedRepository = new SharedRepository();
                            //    sharedRepository.SendForApproval(new WorkFlowParameter()
                            //    {
                            //        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes),
                            //        CompanyId = goodsReturnedNotes.CompanyId,
                            //        DocumentId = goodsReturnedNotes.GoodsReturnNoteId,
                            //        DocumentCode = goodsReturnedNotes.DraftCode,
                            //        CreatedBy = goodsReturnedNotes.CreatedBy,
                            //        WorkFlowStatusId = goodsReturnedNotes.WorkFlowStatusId
                            //    }, false, transactionObj, this.m_dbconnection);
                            //}
                            //else
                            //{
                            //    transactionObj.Commit();
                            //}
                            #endregion

                            transactionObj.Commit();
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

        public GoodsReturnedNotesDisplayResult SearchGoodsReturnedNote(GoodsReturnedNoteSearch goodsReturnedNoteSearch)
        {
            try
            {
                GoodsReturnedNotesDisplayResult goodsReturnedNotesDisplayResult = new GoodsReturnedNotesDisplayResult();

                string whereCondition = @" from dbo.GoodsReturnNotes GRT
				                            join GoodsReceivedNote GRN on GRN.GoodsReceivedNoteId=GRT.GoodsReceivedNoteId
				                            join dbo.WorkFlowStatus as WFS on GRT.WorkFlowStatusId = WFS.WorkFlowStatusid
				                            join dbo.UserProfile as UP on GRT.CreatedBy = UP.UserID
				                            where
					                            GRT.IsDeleted = 0 and GRT.CompanyId=@CompanyId";

                if (goodsReturnedNoteSearch.IsApprovalPage == true)
                {
                    whereCondition = $"{ whereCondition } and GRT.GoodsReturnNoteId in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@UserId, @ProcessId) )";
                }

                if (goodsReturnedNoteSearch.GoodsReturnNoteId > 0)
                {
                    whereCondition = $"{ whereCondition } and GRT.GoodsReturnNoteId = @GoodsReturnNoteId ";
                }
                if (goodsReturnedNoteSearch.RequestFromUserId > 0)
                {
                    whereCondition = $"{ whereCondition } and CreatedBy = @RequestFromUserId ";
                }
                if (goodsReturnedNoteSearch.Search != null && goodsReturnedNoteSearch.Search != "null")
                {
                    whereCondition = $"{ whereCondition } and (GRT.GRTCode LIKE CONCAT( '%',@Search,'%') " +
                                                                $"OR GRN.SupplierDoNumber LIKE CONCAT( '%',@Search,'%') " +
                                                                $"OR UP.FirstName LIKE CONCAT( '%',@Search,'%') " +
                                                                $"OR WFS.Statustext LIKE CONCAT( '%',@Search,'%')" +
                                                                $"OR GRT.GRNRemarks LIKE CONCAT( '%',@Search,'%')" +
                                                                $"OR GRT.GoodsReturnNoteId LIKE CONCAT( '%',@Search,'%')" +
                                                                $"OR GRT.DraftCode LIKE CONCAT( '%',@Search,'%')) ";
                }
                string itemsQuery = @"	select 
					                    GRT.GoodsReturnNoteId,
					                    GRT.GRTCode,
                                        GRT.DraftCode,
					                    GRN.SupplierDoNumber,			
                                        GRT.WorkFlowStatusId,
					                    WFS.IsApproved as IsDocumentApproved,
					                    GRT.GRNRemarks,
					                    UP.FirstName as RequestedByUserName,
					                    WFS.Statustext as WorkFlowStatus ";

                itemsQuery = $"{ itemsQuery } { whereCondition } order by GRT.UpdatedDate desc OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                itemsQuery = $"{ itemsQuery } select count(*) { whereCondition } ";

                using (var result = this.m_dbconnection.QueryMultiple(itemsQuery, new
                {
                    Action = "SELECT",
                    Skip = goodsReturnedNoteSearch.Skip,
                    Take = goodsReturnedNoteSearch.Take,
                    UserId = goodsReturnedNoteSearch.UserId,
                    Search = goodsReturnedNoteSearch.Search,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.GoodReturnNotes),
                    GoodsReturnNoteId = goodsReturnedNoteSearch.GoodsReturnNoteId,
                    RequestFromUserId = goodsReturnedNoteSearch.RequestFromUserId,
                    CompanyId = goodsReturnedNoteSearch.CompanyId
                }, commandType: CommandType.Text))
                {
                    goodsReturnedNotesDisplayResult.GoodsReturnNotesList = result.Read<GoodReturnNotesList>().AsList();
                    goodsReturnedNotesDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return goodsReturnedNotesDisplayResult;
            }
            catch (Exception e)
            {

                throw e;
            }
        }


        public int IncreaseQuantity(GoodsReturnedNotes goodsReturnedNotes, UserProfile userProfile)
        {
            this.m_dbconnection.Open();
            try
            {
                if (goodsReturnedNotes.POTypeId == 1)
                {
                    foreach (var record in goodsReturnedNotes.ItemsList)
                    {
                        // From Quantity Record saving record in stockdetail
                        if (record.RTNQty > 0)
                        {
                            int FromStockDetailId = this.m_dbconnection.QueryFirstOrDefault<int>("ItemStock_CRUD", new
                            {
                                Action = "INSERT",
                                DocumentId = goodsReturnedNotes.GoodsReturnNoteId,
                                RecordId = record.GoodsReturnNoteItemId,
                                ItemMasterId = record.Item.ItemMasterId,
                                StockIn = 0,
                                StockOut = record.RTNQty,
                                CreatedBy = userProfile.UserID,
                                CreatedDate = DateTime.Now,
                                UpdatedBy = userProfile.UserID,
                                UpdatedDate = DateTime.Now,
                            }, commandType: CommandType.StoredProcedure);
                        }

                    }
                }
                return 1;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }



    }
}
