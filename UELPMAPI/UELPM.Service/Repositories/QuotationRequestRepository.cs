using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using UELPM.Util.PdfGenerator;

namespace UELPM.Service.Repositories
{
    public class QuotationRequestRepository : IQuotationRequestRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public QuotationRequestDisplayResult GetQuotationsRequest(GridDisplayInput quotationRequestInput)
        {
            try
            {
                QuotationRequestDisplayResult quotationRequestDisplayResult = new QuotationRequestDisplayResult();
                //executing the stored procedure to get the list of purchase orders Request
                using (var result = this.m_dbconnection.QueryMultiple("QuotationRequest_CRUD", new
                {
                    Action = "SELECT",
                    Search = "",
                    Skip = quotationRequestInput.Skip,
                    Take = quotationRequestInput.Take,
                    CompanyId = quotationRequestInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of purchase orders..
                    quotationRequestDisplayResult.QuotationRequest = result.Read<QuotationRequestList>().GroupBy(i => i.QuotationRequestId).Select(j => new QuotationRequestList
                    {
                        QuotationRequestId = j.Select(i => i.QuotationRequestId).FirstOrDefault(),
                        PurchaseOrderRequestId = j.Select(i => i.PurchaseOrderRequestId).FirstOrDefault(),
                        QuotationRequestCode = j.Select(i => i.QuotationRequestCode).FirstOrDefault(),
                        PurchaseOrderRequestCode= j.Select(i => i.PurchaseOrderRequestCode).FirstOrDefault(),
                        SupplierName = String.Join(",", j.Select(i => i.SupplierName).ToList()),
                        DraftCode = j.Select(i=>i.DraftCode).FirstOrDefault(),
                        IsDocumentApproved = j.Select(i=>i.IsDocumentApproved).FirstOrDefault()
                    }).ToList();
                    //total number of purchase orders
                    quotationRequestDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return quotationRequestDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public QuotationRequestDisplayResult GetAllSearchQuotationRequest(GridDisplayInput quotationRequestInput)
        {
            try
            {
                QuotationRequestDisplayResult quotationRequestDisplayResult = new QuotationRequestDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("QuotationRequest_CRUD", new
                {
                    Action = "SELECT",
                    Search = quotationRequestInput.Search,
                    Skip = quotationRequestInput.Skip,
                    Take = quotationRequestInput.Take,
                    CompanyId = quotationRequestInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    quotationRequestDisplayResult.QuotationRequest = result.Read<QuotationRequestList>().GroupBy(i => i.QuotationRequestId).Select(j => new QuotationRequestList
                    {
                        QuotationRequestId = j.Select(i => i.QuotationRequestId).FirstOrDefault(),
                        PurchaseOrderRequestId = j.Select(i => i.PurchaseOrderRequestId).FirstOrDefault(),
                        QuotationRequestCode = j.Select(i => i.QuotationRequestCode).FirstOrDefault(),
                        PurchaseOrderRequestCode = j.Select(i => i.PurchaseOrderRequestCode).FirstOrDefault(),
                        SupplierName = String.Join(",", j.Select(i => i.SupplierName).ToList()),
                        DraftCode = j.Select(i => i.DraftCode).FirstOrDefault(),
                        IsDocumentApproved = j.Select(i => i.IsDocumentApproved).FirstOrDefault()
                    }).ToList();
                    //total number of purchase orders
                    quotationRequestDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return quotationRequestDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }


        public QuotationRequestDisplayResult GetFilterQuotationRequest(QuotationFilterDisplayInput quotationFilterDisplayInput)
        {
            try
            {
                QuotationRequestDisplayResult quotationRequestDisplayResult = new QuotationRequestDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("QuotationRequest_CRUD", new
                {
                    Action = "FILTER",
                    QuotationRequestFilter = quotationFilterDisplayInput.QuotationRequestFilter,
                    SupplierNameFilter = quotationFilterDisplayInput.SupplierNameFilter,
                    PurchaseOrderRequestCodeFilter= quotationFilterDisplayInput.PurchaseOrderRequestCodeFilter,
                    Skip = quotationFilterDisplayInput.Skip,
                    Take = quotationFilterDisplayInput.Take,
                    CompanyId = quotationFilterDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    quotationRequestDisplayResult.QuotationRequest = result.Read<QuotationRequestList>().GroupBy(i => i.QuotationRequestId).Select(j => new QuotationRequestList
                    {
                        QuotationRequestId = j.Select(i => i.QuotationRequestId).FirstOrDefault(),
                        PurchaseOrderRequestId = j.Select(i => i.PurchaseOrderRequestId).FirstOrDefault(),
                        QuotationRequestCode = j.Select(i => i.QuotationRequestCode).FirstOrDefault(),
                        PurchaseOrderRequestCode = j.Select(i => i.PurchaseOrderRequestCode).FirstOrDefault(),
                        SupplierName = String.Join(",", j.Select(i => i.SupplierName).ToList()),
                        DraftCode = j.Select(i => i.DraftCode).FirstOrDefault(),
                        IsDocumentApproved = j.Select(i => i.IsDocumentApproved).FirstOrDefault()
                    }).ToList();
                    //total number of purchase orders
                    quotationRequestDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return quotationRequestDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        //public QuotationRequest GetPurchaseQuotationRequestDetails(int purchaseOrderRequestId)
        //{
        //    try
        //    {
        //        QuotationRequest quotationRequestDetailsObj = new QuotationRequest();
        //        using (var result = this.m_dbconnection.QueryMultiple("QuotationRequest_CRUD", new
        //        {

        //            Action = "SELECTBYPURCHASEID",
        //            purchaseOrderRequestId = purchaseOrderRequestId

        //        }, commandType: CommandType.StoredProcedure))
        //        {
        //            quotationRequestDetailsObj.PurchaseOrderRequest = result.Read<PurchaseOrderRequest, Suppliers, PurchaseOrderRequest>((Pc, Su) =>
        //            {

        //                Pc.Supplier = Su;
        //                return Pc;
        //            }, splitOn: "SupplierId").FirstOrDefault();


        //            quotationRequestDetailsObj.PurchaseOrderRequestItems = result.Read<PurchaseOrderRequestItems, GetItemMasters, PurchaseOrderRequestItems>((Pc, IM) =>
        //            {
        //                Pc.Item = IM;
        //                return Pc;
        //            }, splitOn: "ItemMasterId").ToList();

        //            var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
        //            {
        //                Action = "SELECT",
        //                RecordId = purchaseOrderRequestId,
        //                AttachmentTypeId = Convert.ToInt32(AttachmentType.PORQuotation) //static value need to change

        //            }, commandType: CommandType.StoredProcedure);

        //            quotationRequestDetailsObj.Attachments = attachments.ToList();
        //        }
        //        return quotationRequestDetailsObj;
        //    }
        //    catch (Exception e)
        //    {
        //        throw e;
        //    }
        //}


        public QuotationRequest GetQuotationRequestDetails(int quotationRequestId)
        {
            try
            {
                QuotationRequest quotationRequestDetailsObj = new QuotationRequest();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("QuotationRequest_CRUD", new
                {

                    Action = "SELECTBYID",
                    QuotationRequestId = quotationRequestId

                }, commandType: CommandType.StoredProcedure))
                {
                    //purchase order details..
                    quotationRequestDetailsObj = result.Read<QuotationRequest, Suppliers, QuotationRequest>((Qr, Su) =>
                    {

                        Qr.Supplier = Su;
                        return Qr;
                    }, splitOn: "SupplierId").FirstOrDefault();

                    if (quotationRequestDetailsObj != null)
                    {
                        quotationRequestDetailsObj.PurchaseOrderRequest = result.Read<PurchaseOrderRequest, Suppliers, PurchaseOrderRequest>((Pc, Su) =>
                        {

                            Pc.Supplier = Su;
                            return Pc;
                        }, splitOn: "SupplierId").FirstOrDefault();

                        //Quotation record
                        quotationRequestDetailsObj.QuotationRequestSupplier = result.Read<QuotationRequestSupplier, Suppliers, QuotationRequestSupplier>((Pcv, Su) =>
                        {
                            Pcv.QuotationSupplier = Su;
                            return Pcv;
                        }, splitOn: "SupplierId").ToList();

                        //purchase order items.
                        quotationRequestDetailsObj.PurchaseOrderRequestItems = result.Read<PurchaseOrderRequestItems, GetItemMasters, PurchaseOrderRequestItems>((Pc, IM) =>
                        {
                            Pc.Item = IM;
                            return Pc;
                        }, splitOn: "ItemMasterId").ToList();

                        quotationRequestDetailsObj.QuotationVendorItems = result.Read<QuotationVendorItems, Suppliers, QuotationVendorItems>((Pcv, Su) =>
                        {
                            Pcv.QuotationSupplier = Su;
                            return Pcv;
                        }, splitOn: "SupplierId").ToList();

                        var quotationattachment = this.m_dbconnection.Query<QuotationAttachments>("QuotationFileOperations_CRUD", new
                        {
                            Action = "SELECTQUOTATION",
                            QuotationRequestId = quotationRequestId,
                            //AttachmentTypeId = 3 //static value need to change

                        }, commandType: CommandType.StoredProcedure);

                        quotationRequestDetailsObj.QuotationAttachment = quotationattachment.ToList();

                        var quotationattachments = this.m_dbconnection.Query<Attachments>("QuotationFileOperations_CRUD", new
                        {
                            Action = "SELECTQUOTATIONREQUEST",
                            RecordId = quotationRequestId,
                            AttachmentTypeId = Convert.ToInt32(AttachmentType.PORQuotation) //static value need to change
                        }, commandType: CommandType.StoredProcedure);

                        quotationRequestDetailsObj.Attachments = quotationattachments.ToList();
                    }
                }
                return quotationRequestDetailsObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] QuotationRequestPrint(int quotationRequestId, int companyId)
        {
            try
            {
                var result = GetQuotationRequestPDFTemplate(quotationRequestId, companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetQuotationRequestPDFTemplate(int quotationRequestId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                QuotationRequest quotationRequestDetails = GetQuotationRequestDetails(quotationRequestId);
                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();
                var result = pdfGeneratorObj.GetPurchaseOrderRequestPDFTemplate(null, quotationRequestDetails, companyDetails);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool SendQuotationRequestMailtoSupplier(int quotationRequestId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                QuotationRequest quotationRequestDetails = GetQuotationRequestDetails(quotationRequestId);
                pdfGeneratorObj = new PdfGenerator();
                quotationRequestDetails.QuotationVendorItems = quotationRequestDetails.QuotationVendorItems.Where(o => o.IsMailSent == false).ToList();
                var companyDetails = GetCompanyDetails(companyId);
                var pdfResult = pdfGeneratorObj.GetPurchaseOrderRequestPDFTemplate(null, quotationRequestDetails, companyDetails);
                var result = Util.Email.PurchaseOrderEmailProvider.SendQuotationRequestMailtoSupplier(quotationRequestDetails, companyDetails, pdfResult);

                if (result)
                {
                    if (quotationRequestDetails.QuotationRequestSupplier != null)
                    {
                        foreach (var record in quotationRequestDetails.QuotationVendorItems)
                        {
                            int QuotationId = this.m_dbconnection.QueryFirstOrDefault<int>("QuotationRequest_CRUD", new
                            {
                                Action = "UPDATEMAILSTATUS",

                                QuotationId = record.QuotationId,

                            },

                                commandType: CommandType.StoredProcedure);
                        }
                    }
                }
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
        public int SelectQuotation(int QuotationRequestId, int QuotationId)
        {
            int result = 0;
            try
            {

                this.m_dbconnection.Open();
                result = this.m_dbconnection.QueryFirstOrDefault<int>("QuotationRequest_CRUD", new
                {
                    Action = "SELECTQUOTATION",
                    QuotationRequestId = QuotationRequestId,
                    QuotationId = QuotationId,

                },

              commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
            return result;
        }
        public int CreateQuotationRequest(QuotationRequest quotationRequest)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var paramaterObj = new DynamicParameters();
                        string QRCode = this.m_dbconnection.QueryFirstOrDefault<string>("QuotationRequest_CRUD", new
                        {
                            Action = "COUNT"
                        },
                       transaction: transactionObj,
                       commandType: CommandType.StoredProcedure);
                        int QuotationRequestId = this.m_dbconnection.QueryFirstOrDefault<int>("QuotationRequest_CRUD", new
                        {
                            Action = "INSERT",
                            QuotationRequestCode = "QR" + '-' + QRCode,
                            PurchaseOrderRequestId = quotationRequest.PurchaseOrderRequestId,
                            CompanyId = quotationRequest.CompanyId,
                            CreatedBy = quotationRequest.CreatedBy,
                            Remarks = quotationRequest.Remarks,
                            CreatedDate = DateTime.Now,
                        },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);

                        if (quotationRequest.QuotationRequestSupplier != null)
                        {
                            foreach (var record in quotationRequest.QuotationRequestSupplier)
                            {
                                int QuotationId = this.m_dbconnection.QueryFirstOrDefault<int>("QuotationRequest_CRUD", new
                                {
                                    Action = "INSERTSUPPLIER",
                                    QuotationSupplier = record.QuotationSupplier.SupplierId,
                                    QuotationRequestId = QuotationRequestId,
                                    CreatedBy = quotationRequest.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                },
                                    transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);
                            }
                        }

                        #region  we are saving purchase order request Quotation items..
                        if (quotationRequest.QuotationVendorItems != null)
                        {
                            FileOperations fileOperationsObj = new FileOperations();
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            int count = 0;
                            foreach (var record in quotationRequest.QuotationVendorItems)
                            {
                                int QuotationId = this.m_dbconnection.QueryFirstOrDefault<int>("QuotationRequest_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    QuotationSupplier = record.QuotationSupplier.SupplierId,
                                    QuotationRequestId = QuotationRequestId,
                                    PurchaseOrderRequestId = quotationRequest.PurchaseOrderRequestId,
                                    QuotatedAmount = record.QuotatedAmount,
                                    CreatedBy = quotationRequest.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                    IsSelected = record.IsSelected
                                },
                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);

                                for (var i = 0; i < quotationRequest.files.Count; i++)
                                {
                                    string[] name = quotationRequest.files[i].FileName.Split('@', '!');
                                    int RowID = Convert.ToInt32(name[1]);
                                    if (quotationRequest.files[i].FileName.Contains("Quotation@" + count))
                                    {
                                        string Filname = name[2];
                                        var itemObj = new DynamicParameters();
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@QuotationRequestId", QuotationRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@PurchaseOrderRequestId", quotationRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@QuotationId", QuotationId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", Filname, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", quotationRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        quotationItemToAdd.Add(itemObj);
                                    }
                                }
                                count++;

                            }
                            var purchaseOrderRequestItemSaveResult = this.m_dbconnection.Execute("QuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = "Quotations",
                                Files = quotationRequest.files,
                                UniqueId = QuotationRequestId.ToString()
                            });

                        }

                        #endregion




                        transactionObj.Commit();
                        return QuotationRequestId;
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

        public int UpdateQuotationRequest(QuotationRequest quotationRequest)
        {
            try
            {
                string check = null;
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        int QuotationRequestId = this.m_dbconnection.QueryFirstOrDefault<int>("QuotationRequest_CRUD", new
                        {
                            Action = "UpdateRemarks",
                            QuotationRequestId = quotationRequest.QuotationRequestId,
                            Remarks = quotationRequest.Remarks
                        },
                            transaction: transactionObj,
                            commandType: CommandType.StoredProcedure);

                        if (quotationRequest.QuotationRequestSupplier != null)
                        {
                            foreach (var record in quotationRequest.QuotationRequestSupplier)
                            {
                                int QuotationId = this.m_dbconnection.QueryFirstOrDefault<int>("QuotationRequest_CRUD", new
                                {
                                    Action = "INSERTSUPPLIER",
                                    QuotationSupplier = record.QuotationSupplier.SupplierId,
                                    QuotationRequestId = quotationRequest.QuotationRequestId,
                                    CreatedBy = quotationRequest.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                },
                                    transaction: transactionObj,
                                    commandType: CommandType.StoredProcedure);
                            }
                        }


                        #region  we are saving purchase order request Quotation items..
                        if (quotationRequest.QuotationVendorItems != null)
                        {
                            FileOperations fileOperationsObj = new FileOperations();
                            List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            int count = 0;
                            foreach (var record in quotationRequest.QuotationVendorItems.Where(j => j.QuotationId == 0).Select(j => j))
                            {
                                int QuotationId = this.m_dbconnection.QueryFirstOrDefault<int>("QuotationRequest_CRUD", new
                                {
                                    Action = "INSERTQUOTATIONITEM",
                                    QuotationSupplier = record.QuotationSupplier.SupplierId,
                                    QuotationRequestId = quotationRequest.QuotationRequestId,
                                    PurchaseOrderRequestId = quotationRequest.PurchaseOrderRequestId,
                                    QuotatedAmount = record.QuotatedAmount,
                                    CreatedBy = quotationRequest.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                    IsSelected = record.IsSelected
                                },
                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);

                                int countvalue = this.m_dbconnection.QueryFirstOrDefault<int>("QuotationRequest_CRUD", new
                                {
                                    Action = "FETCHQUOTATIONITEM",
                                    QuotationRequestId = quotationRequest.QuotationRequestId,
                                },
                                transaction: transactionObj,
                                                commandType: CommandType.StoredProcedure);
                                if (countvalue > 0)
                                {
                                    if (count == 0)
                                    {
                                        count = countvalue + 1;
                                    }
                                }
                                //countvalue = countvalue;
                                for (var i = 0; i < quotationRequest.files.Count; i++)
                                {
                                    string[] name = quotationRequest.files[i].FileName.Split('@', '!');
                                    int RowID = Convert.ToInt32(name[1]);
                                    if (quotationRequest.files[i].FileName.Contains("Quotation@" + count))
                                    {

                                        string Filname = name[2];
                                        var itemObj = new DynamicParameters();
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@QuotationRequestId", quotationRequest.QuotationRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@PurchaseOrderRequestId", quotationRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@QuotationId", QuotationId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", Filname, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", quotationRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        quotationItemToAdd.Add(itemObj);
                                    }
                                }
                                check += count + ",";
                                count++;
                            }
                            var purchaseOrderRequestItemSaveResult = this.m_dbconnection.Execute("QuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);



                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = "Quotations",
                                Files = quotationRequest.files,
                                UniqueId = quotationRequest.QuotationRequestId.ToString()
                            });

                        }

                        #endregion

                        #region  we are saving purchase order request Quotation items..
                        if (quotationRequest.QuotationVendorItems != null)
                        {
                            int add = 0;
                            int count = 0;

                            List<DynamicParameters> quotationItemToUpdate = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in quotationRequest.QuotationVendorItems.Where(k => k.QuotationId > 0).Select(k => k))
                            {
                                for (var i = 0; i < quotationRequest.files.Count; i++)
                                {
                                    string[] name = quotationRequest.files[i].FileName.Split('@', '!');
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
                                int updatequotationResult = this.m_dbconnection.Execute("QuotationRequest_CRUD", new
                                {
                                    Action = "UPDATEQUOTATIONITEM",
                                    QuotationId = record.QuotationId,
                                    QuotatedAmount = record.QuotatedAmount,
                                    CreatedBy = quotationRequest.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                    IsSelected = record.IsSelected
                                },
                                 transaction: transactionObj,
                                 commandType: CommandType.StoredProcedure);

                                for (var i = 0; i < quotationRequest.files.Count; i++)
                                {
                                    string[] name = quotationRequest.files[i].FileName.Split('@', '!');
                                    int RowID = Convert.ToInt32(name[1]);
                                    if (quotationRequest.files[i].FileName.Contains("Quotation@" + count))
                                    {
                                        string Filename = name[2];
                                        var itemObj1 = new DynamicParameters();
                                        itemObj1.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj1.Add("@QuotationRequestId", quotationRequest.QuotationRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@PurchaseOrderRequestId", quotationRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@QuotationId", record.QuotationId, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@FileName", Filename, DbType.String, ParameterDirection.Input);
                                        itemObj1.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@CreatedBy", quotationRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        quotationItemToUpdate.Add(itemObj1);
                                    }
                                }
                                //count++;
                                add++;

                            }
                            var purchaseOrderRequestVendorItemSaveResult = this.m_dbconnection.Execute("QuotationFileOperations_CRUD", quotationItemToUpdate, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                        }

                        #endregion


                        #region deleting Quotations...
                        List<DynamicParameters> quotationsitemsToDelete = new List<DynamicParameters>();


                        //looping through the list of purchase order items...
                        foreach (var record in quotationRequest.QuotationVendorItemsToDelete)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "DELETEQUOTATIONITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@QuotationId", record, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", quotationRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            //quotationsitemsToDelete.Add(itemObj);


                            var purchaseOrderrequestquotationDeleteResult = this.m_dbconnection.Query<string>("QuotationRequest_CRUD", itemObj, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = "Quotations",
                                FilesNames = purchaseOrderrequestquotationDeleteResult.ToArray(),
                                UniqueId = quotationRequest.QuotationRequestId.ToString()
                            });
                        }

                        #endregion

                        #region deleting quotation attachments
                        if (quotationRequest.QuotationAttachmentDelete != null)
                        {
                            for (var i = 0; i < quotationRequest.QuotationAttachmentDelete.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@QuotationAttachmentId", quotationRequest.QuotationAttachmentDelete[i].QuotationAttachmentId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@QuotationId", quotationRequest.QuotationAttachmentDelete[i].QuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", quotationRequest.QuotationAttachmentDelete[i].RowId, DbType.Int32, ParameterDirection.Input);
                                //fileObj.Add("@PurchaseOrderRequestId", quotationRequest.PurchaseOrderRequestId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@QuotationRequestId", quotationRequest.QuotationRequestId, DbType.Int32, ParameterDirection.Input);

                                var purchaseOrderrequestquotationFileDeleteResult = this.m_dbconnection.Query<string>("QuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                                   commandType: CommandType.StoredProcedure);

                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = "Quotations",
                                    FilesNames = purchaseOrderrequestquotationFileDeleteResult.ToArray(),
                                    UniqueId = quotationRequest.QuotationRequestId.ToString()
                                });

                            }
                        }

                        #endregion


                        #region deleting quotation attachments
                        if (quotationRequest.QuotationAttachmentUpdateRowId != null)
                        {
                            for (var i = 0; i < quotationRequest.QuotationAttachmentUpdateRowId.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "UPDATEROW", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@QuotationAttachmentId", quotationRequest.QuotationAttachmentUpdateRowId[i].QuotationAttachmentId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", quotationRequest.QuotationAttachmentUpdateRowId[i].RowId, DbType.Int32, ParameterDirection.Input);

                                var Quotationrowupdate = this.m_dbconnection.Query<string>("QuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                                   commandType: CommandType.StoredProcedure);
                            }
                        }

                        #endregion






                        List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();
                        if (quotationRequest.deletedQuotationSupplierItems != null)
                        {
                            //looping through the list of purchase order items...
                            foreach (var quotationRequestSupplierId in quotationRequest.deletedQuotationSupplierItems)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "DELETESUPPLIER", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@QuotationRequestSupplierId", quotationRequestSupplierId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", quotationRequest.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                itemsToUpdate.Add(itemObj);
                            }
                        }

                        var purchaseOrderRequestItemDeleteResult = this.m_dbconnection.Execute("QuotationRequest_CRUD", itemsToUpdate,
                                                                    transaction: transactionObj,
                                                                    commandType: CommandType.StoredProcedure);




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



        public bool DeleteQuotationRequest(QuotationRequestDelete quotationRequestDelete)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var quotationRequestDeleteResult = this.m_dbconnection.Execute("QuotationRequest_CRUD",
                                                               new
                                                               {
                                                                   Action = "DELETEALLITEMS",
                                                                   QuotationRequestId = quotationRequestDelete.QuotationRequestId,
                                                                   CreatedBy = quotationRequestDelete.ModifiedBy,
                                                                   CreatedDate = DateTime.Now
                                                               },
                                                               transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);

                        var parameterObj1 = new DynamicParameters();
                        parameterObj1.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                        parameterObj1.Add("@QuotationRequestId", quotationRequestDelete.QuotationRequestId, DbType.Int32, ParameterDirection.Input);

                        var deletedQuotationAttachmentNames = this.m_dbconnection.Query<string>("QuotationFileOperations_CRUD", parameterObj1, transaction: transactionObj,
                                                           commandType: CommandType.StoredProcedure);

                        FileOperations fileOperationsObj = new FileOperations();
                        bool quotationfileStatus = fileOperationsObj.DeleteFile(new FileSave
                        {
                            CompanyName = "UEL",
                            ModuleName = "Quotations",
                            FilesNames = deletedQuotationAttachmentNames.ToArray(),
                            UniqueId = quotationRequestDelete.QuotationRequestId.ToString()
                        });

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

    }
}
