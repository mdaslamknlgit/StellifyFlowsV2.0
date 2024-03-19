using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.FileOperations;
using UELPM.Util.Templates;
using OfficeOpenXml;
using System.IO;
using System.Web;
using UELPM.Service.Exceptions;
using UELPM.Util.PdfGenerator;
using System.Globalization;

namespace UELPM.Service.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepositoryObj = null;
        AuditLogRepository auditlogRepository = null;

        public InvoiceDisplayResult GetInvoice(GridDisplayInput invoiceInput)
        {
            try
            {
                InvoiceDisplayResult invoiceDisplayResult = new InvoiceDisplayResult();
                //executing the stored procedure to get the list of Invoice
                using (var result = this.m_dbconnection.QueryMultiple("Invoice_CRUD", new
                {
                    Action = "SELECT",
                    Search = invoiceInput.Search,
                    Skip = invoiceInput.Skip,
                    Take = invoiceInput.Take,
                    userId = invoiceInput.UserId,
                    CompanyId = invoiceInput.CompanyId,
                    InvoiceId = invoiceInput.InvoiceId
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of Invoice..
                    invoiceDisplayResult.Invoice = result.Read<InvoiceList>().AsList();
                    foreach (InvoiceList inv in invoiceDisplayResult.Invoice)
                    {
                        if ((inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed)) || (inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)))
                        {
                            inv.WorkFlowStatusText = "Open";
                        }
                    }
                    //total number of Invoice
                    invoiceDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return invoiceDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public InvoiceDisplayResult GetExportInvoice(GridDisplayInput invoiceInput)
        {
            try
            {
                InvoiceDisplayResult invoiceDisplayResult = new InvoiceDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("Invoice_CRUD", new
                {
                    Action = "SELECTEXPORT",
                    Search = invoiceInput.Search,
                    Skip = invoiceInput.Skip,
                    Take = invoiceInput.Take,
                    CompanyId = invoiceInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of Invoice..
                    invoiceDisplayResult.Invoice = result.Read<InvoiceList>().AsList();
                    invoiceDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return invoiceDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public InvoiceDisplayResult GetInvoiceForApprovals(GridDisplayInput invoiceInput)
        {
            try
            {
                InvoiceDisplayResult invoiceDisplayResult = new InvoiceDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("Invoice_CRUD", new
                {
                    Action = "SELECTAPPROVALS",
                    Skip = invoiceInput.Skip,
                    Take = invoiceInput.Take,
                    UserId = invoiceInput.UserId,
                    Companyid = invoiceInput.CompanyId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                    InvoiceId = invoiceInput.InvoiceId
                }, commandType: CommandType.StoredProcedure))
                {
                    invoiceDisplayResult.Invoice = result.Read<InvoiceList>().AsList();
                    invoiceDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return invoiceDisplayResult;
            }
            catch (Exception e)
            {
                throw e;

            }
        }

        public InvoiceCount GetInvoiceCount(int invoiceId)
        {
            try
            {
                InvoiceCount invoiceCount = new InvoiceCount();
                using (var result = this.m_dbconnection.QueryMultiple("Invoice_CRUD", new
                {
                    Action = "CHECKINVOICE",
                    InvoiceId = invoiceId
                }, commandType: CommandType.StoredProcedure))
                {
                    invoiceCount.Count = result.Read<int>().FirstOrDefault();
                }

                return invoiceCount;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateGRNStatus(Invoice invoice)
        {
            try
            {
                //this.m_dbconnection.Open();
                int statusUpdateResult = 0;
                //using (var transactionObj = this.m_dbconnection.BeginTransaction())
                //{
                if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                {
                    if (invoice.POTypeId == 1 || invoice.POTypeId == 2 || invoice.POTypeId == 3)
                    {
                        foreach (var GRN in invoice.SelectedGRNs)
                        {
                            statusUpdateResult = this.m_dbconnection.Execute("GoodsReceivedNotes_CRUD", new
                            {
                                Action = "GRNInvoice",
                                DocumentId = GRN.GoodsReceivedNoteId,//invoice.SelectedGRNs[0].GoodsReceivedNoteId,
                                WorkFlowStatusId = WorkFlowStatus.Invoiced,
                            },
                        commandType: CommandType.StoredProcedure);
                        }
                    }
                }
                return statusUpdateResult;
                //}
            }
            catch (Exception e)
            {
                throw e;
            }
        }



        public int CreateInvoice(Invoice invoice)
        {
            try
            {
                this.m_dbconnection.Open();
                decimal discountsplitbyitemsCpo = 0;
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                SharedRepository sharedRepositoryObj = new SharedRepository();
                string InvoiceCode = string.Empty;

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        if (VerifyDocument(invoice, transactionObj))
                        {
                            #region Invoice...
                            CompanyDetails company = this.GetCompanyDetails(invoice.CompanyId);
                            var paramaterObj = new DynamicParameters();
                            string DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                            int invoiceId = transactionObj.Connection.QueryFirstOrDefault<int>("Invoice_CRUD", new
                            {
                                Action = "INSERT",
                                InvoiceCode = ModuleCodes.SupplierInvoice,
                                DraftCode = DraftCode,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                                PurchaseOrderId = invoice.PurchaseOrderId,
                                PurchaseOrderCode = invoice.PurchaseOrderCode,
                                CompanyId = invoice.CompanyId,
                                LocationId = invoice.LocationId,
                                Supplierid = invoice.Supplier.SupplierId,
                                RequestedBy = invoice.RequestedBy,
                                Discount = invoice.Discount,
                                TaxId = invoice.TaxId,
                                ShippingCharges = invoice.ShippingCharges,
                                OtherCharges = invoice.OtherCharges,
                                TotalAmount = invoice.TotalAmount,
                                CreatedBy = invoice.CreatedBy,
                                CreatedDate = DateTime.Now,
                                CurrencyId = invoice.CurrencyId,
                                WorkFlowStatusId = invoice.WorkFlowStatusId,
                                // StatusId = invoice.StatusId,//commented by alekhya as we are maintaning single status.
                                IsGstRequired = invoice.IsGstRequired,
                                DeliveryAddress = invoice.DeliveryAddress,
                                PaymentTermId = invoice.PaymentTermId,
                                POTypeId = invoice.POTypeId,
                                Adjustment = invoice.Adjustment,
                                InvoiceDescription = invoice.InvoiceDescription,
                                GSTAdjustment = invoice.GSTAdjustment,
                                SupplierRefNo = invoice.SupplierRefNo,
                                InvoiceDate = invoice.InvoiceDate,
                                IsGstBeforeDiscount = invoice.IsGstBeforeDiscount,
                                InvoiceTypeId = invoice.InvoiceTypeId,
                                SupplierSubCodeId = invoice.SupplierSubCodeId,
                                RemarksInvoice = invoice.RemarksInvoice,
                                SchedulerId = invoice.SchedulerId
                            },
                                transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);

                            #endregion
                            if (invoiceId > 0)
                            {
                                #region  we are saving purchase order items...
                                if (invoice.InvoiceItems != null)
                                {
                                    List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                                    //looping through the list of purchase order items...
                                    foreach (var record in invoice.InvoiceItems)
                                    {
                                        if (invoice.Discount != 0 && invoice.POTypeId == 5 || invoice.POTypeId == 6)
                                        {
                                            discountsplitbyitemsCpo = (invoice.Discount / (invoice.InvoiceItems.Count));
                                        }
                                        var itemObj = new DynamicParameters();

                                        itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@InvoiceId", invoiceId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                                        if (invoice.InvoiceTypeId == 2 && record.Item != null)
                                        {
                                            record.ItemType = "Item";
                                        }
                                        itemObj.Add("@ItemType", record.ItemType, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                                        if (invoice.POTypeId == 5 || invoice.POTypeId == 6)
                                        {
                                            itemObj.Add("@ItemDiscount", discountsplitbyitemsCpo, DbType.Decimal, ParameterDirection.Input);
                                        }
                                        else
                                        {
                                            itemObj.Add("@ItemDiscount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                                        }
                                        itemObj.Add("@CPOID", record.CPOID, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CPONumber", record.CPONumber, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@ItemTaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@ItemTaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", invoice.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@PurchaseOrderId", record.PurchaseOrderId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@POTypeId", invoice.POTypeId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@GSTAmount", record.TaxTotal, DbType.Decimal, ParameterDirection.Input);
                                        itemObj.Add("@CompanyId", invoice.CompanyId, DbType.Int32, ParameterDirection.Input);
                                        // AuditLog.Info("InvoiceRepository", "Create", invoice.CreatedBy.ToString(), record.InvoiceItemId.ToString(), "CreateInvoice", "Purchase Order Code : " + record.PurchaseOrderCode.ToString(), invoice.CompanyId);
                                        itemObj.Add("@PoCode", record.PurchaseOrderCode, DbType.String, ParameterDirection.Input);
                                        if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Item) && record.Item != null)
                                        {
                                            itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                                        }
                                        if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                                        {
                                            itemObj.Add("@ItemAccountCode", record.Service.AccountCodeId, DbType.String, ParameterDirection.Input);
                                        }
                                        if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Expense) && invoice.InvoiceTypeId == 2)
                                        {
                                            itemObj.Add("@ItemAccountCode", record.Service.AccountCodeId, DbType.String, ParameterDirection.Input);
                                        }
                                        if (invoice.POTypeId == 2 && record.TypeId == 1)
                                        {
                                            itemObj.Add("@ItemAccountCode", record.Service.AccountCodeId, DbType.String, ParameterDirection.Input);
                                        }

                                        //code for cpo case
                                        if ((invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable)) && record.AccountCode != null)
                                        {
                                            itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@WorkFlowStatusId", record.WorkFlowStatusId, DbType.Int32, ParameterDirection.Input);

                                        }

                                        itemToAdd.Add(itemObj);
                                    }


                                    var invoiceItemSaveResult = transactionObj.Connection.Execute("Invoice_CRUD", itemToAdd, transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);
                                }
                                #endregion

                                #region create PO in invoice 
                                if (invoice.SelectedPOs != null)
                                {
                                    foreach (var PO in invoice.SelectedPOs)
                                    {
                                        int insertinvoiceGrn = transactionObj.Connection.Execute("Invoice_CRUD", new
                                        {
                                            Action = "INSERTINVOICEPO",
                                            InvoiceId = invoiceId,
                                            PurchaseOrderId = PO.PurchaseOrderId,
                                            POTypeId = PO.POTypeId
                                        },
                                        transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);
                                    }
                                }

                                #endregion

                                #region create GRN in invoice and  updating GRN Status
                                if (invoice.SelectedGRNs != null)
                                {
                                    foreach (var GRN in invoice.SelectedGRNs)
                                    {
                                        int insertinvoiceGrn = transactionObj.Connection.Execute("Invoice_CRUD", new
                                        {
                                            Action = "INSERTINVOICEGRN",
                                            InvoiceId = invoiceId,
                                            GoodsReceivedNoteId = GRN.GoodsReceivedNoteId,
                                            CreatedBy = invoice.CreatedBy,
                                            CreatedDate = DateTime.Now,
                                            POTypeId = invoice.POTypeId
                                        },
                                        transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);

                                        int updateinvoiceGrn = transactionObj.Connection.Execute("Invoice_CRUD", new
                                        {
                                            Action = "UPDATEINVOICEINGRN",
                                            GoodsReceivedNoteId = GRN.GoodsReceivedNoteId,
                                            PoTypeId = invoice.POTypeId
                                        },
                                        transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);

                                        if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                                        {
                                            int statusUpdateResult = transactionObj.Connection.Execute("GoodsReceivedNotes_CRUD", new
                                            {
                                                Action = "GRNInvoice",
                                                DocumentId = GRN.GoodsReceivedNoteId,
                                                WorkFlowStatusId = WorkFlowStatus.Invoiced,
                                            },
                                            transaction: transactionObj,
                                            commandType: CommandType.StoredProcedure);
                                        }
                                    }
                                }
                                if (invoice.SelectedCPOs != null)
                                {
                                    foreach (var CPO in invoice.SelectedCPOs)
                                    {
                                        int insertinvoiceGrn = transactionObj.Connection.Execute("Invoice_CRUD", new
                                        {
                                            Action = "INSERTINVOICEGRN",
                                            InvoiceId = invoiceId,
                                            GoodsReceivedNoteId = CPO.CPOID,
                                            CreatedBy = invoice.CreatedBy,
                                            CreatedDate = DateTime.Now,
                                            POTypeId = invoice.POTypeId
                                        },
                                           transaction: transactionObj,
                                           commandType: CommandType.StoredProcedure);

                                        int updateinvoiceGrn = transactionObj.Connection.Execute("Invoice_CRUD", new
                                        {
                                            Action = "UPDATEINVOICEINCPO",
                                            CPOID = CPO.CPOID,
                                            PoTypeId = invoice.POTypeId
                                        },
                                        transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);


                                    }
                                }

                                #endregion

                                #region Save Document Address Details.
                                this.sharedRepositoryObj = new SharedRepository();
                                this.sharedRepositoryObj.PostDocumentAddress(new DocumentAddress
                                {
                                    Address = invoice.SupplierAddress,
                                    CompanyId = invoice.CompanyId,
                                    DocumentId = invoiceId,
                                    ProcessId = (int)WorkFlowProcessTypes.SupplierInvoice
                                }, transactionObj);
                                #endregion
                                #region saving files here...
                                if (invoice.files != null)
                                {
                                    try
                                    {
                                        //saving files in the folder...
                                        FileOperations fileOperationsObj = new FileOperations();
                                        bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                                        {
                                            CompanyName = "UEL",
                                            ModuleName = AttachmentFolderNames.Invoice,
                                            Files = invoice.files,
                                            UniqueId = invoiceId.ToString()
                                        });
                                        List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                        //looping through the list of purchase order items...
                                        for (var i = 0; i < invoice.files.Count; i++)
                                        {
                                            var itemObj = new DynamicParameters();
                                            itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.Invoice), DbType.Int32, ParameterDirection.Input);//static value need to change
                                            itemObj.Add("@RecordId", invoiceId, DbType.Int32, ParameterDirection.Input);
                                            itemObj.Add("@FileName", invoice.files[i].FileName, DbType.String, ParameterDirection.Input);
                                            itemObj.Add("@CreatedBy", invoice.CreatedBy, DbType.Int32, ParameterDirection.Input);
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
                            }

                            if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            {
                                foreach (InvoiceItems item in invoice.InvoiceItems)
                                {
                                    int resu = transactionObj.Connection.Execute("ContractPurchaseOrderItem_CRUD", new
                                    {
                                        Action = "UPDATEWORKFLOWSTATUS",
                                        DocumentId = item.CPOID,
                                        WorkFlowStatusId = WorkFlowStatus.Invoiced
                                    },
                                     transaction: transactionObj,
                                     commandType: CommandType.StoredProcedure);
                                }
                            }


                            if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            {
                                WorkFlowConfigurationRepository workFlowConfigRepository = new WorkFlowConfigurationRepository();
                                WorkFlowParameter workFlowParameter = new WorkFlowParameter()
                                {
                                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                                    CompanyId = invoice.CompanyId,
                                    DocumentId = invoiceId,
                                    LocationId = invoice.LocationId,
                                    CreatedBy = invoice.CreatedBy,
                                    WorkFlowStatusId = invoice.WorkFlowStatusId
                                };

                                var workFlowDetails = workFlowConfigRepository.GetWorkFlowConfiguration(Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice), invoice.CompanyId, invoice.LocationId);

                                if (workFlowDetails != null)
                                {
                                    if (workFlowDetails.WorkFlowProcess.Count > 0)
                                    {
                                        string previousApproverStatus = "Approved";
                                        int apuserid = (int)workFlowDetails.WorkFlowProcess.First().WorkFlowLevels.Where(x => x.IsCondition == false).FirstOrDefault().ApproverUserId;
                                        UserProfile sender = userProfileRepository.GetUserById(invoice.CreatedBy);
                                        UserProfile nextApprover = userProfileRepository.GetUserById(invoice.CreatedBy);
                                        string type = "Request for Invoice Approval";
                                        string status = "Approved";
                                        var ApuserName = userProfileRepository.GetUserById(invoice.CreatedBy);
                                        invoice.RequestedByUserName = string.Format("{0} {1}", ApuserName.FirstName, ApuserName.LastName);
                                        invoice.WorkFlowStatus = "Open";
                                        InvoiceCode = this.m_dbconnection.Query<string>("select InvoiceCode from Invoice where InvoiceId=" + invoiceId, transaction: transactionObj, commandType: CommandType.Text).FirstOrDefault().ToString();
                                        invoice.CurrencySymbol = this.m_dbconnection.Query<string>(string.Format("select Symbol from Currencies where Id = (select currencyid from Invoice where InvoiceId={0})", invoiceId), transaction: transactionObj, commandType: CommandType.Text).FirstOrDefault().ToString();
                                        invoice.InvoiceCode = InvoiceCode;

                                        foreach (var item in invoice.InvoiceItems)
                                        {

                                            item.ItemTotalPrice = (item.ItemQty * item.Unitprice) + item.TaxTotal;
                                        }


                                        Util.Email.InvoiceEmailProvider.SendInvoiceRequestApprovalMail(company.CompanyShortName, "INV", invoice, sender, type, status, previousApproverStatus, nextApprover);
                                    }
                                }
                            }


                            #region Approval
                            if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                            {
                                sharedRepositoryObj = new SharedRepository();
                                sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                                {
                                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                                    CompanyId = invoice.CompanyId,
                                    DocumentId = invoiceId,
                                    LocationId = invoice.LocationId,
                                    CreatedBy = invoice.CreatedBy,
                                    DocumentCode = DraftCode,
                                    Value = invoice.TotalbefTaxSubTotal.ToString(),
                                    WorkFlowStatusId = invoice.WorkFlowStatusId
                                }, false, transactionObj, transactionObj.Connection);
                            }
                            else
                            {
                                transactionObj.Commit();
                            }
                            #endregion



                            DateTime now = DateTime.Now;
                            var user = userProfileRepository.GetUserById(invoice.CreatedBy);
                            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);

                            InvoiceCode = GetInvoiceCode(invoiceId);
                            if (!string.IsNullOrEmpty(InvoiceCode))
                            {

                                if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Draft))
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "create", invoice.CreatedBy.ToString(), invoiceId.ToString(), "CreateInvoice", "Created by " + UserName + " on " + now + "", invoice.CompanyId);
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "create", invoice.CreatedBy.ToString(), invoiceId.ToString(), "CreateInvoice", "Saved as Draft " + UserName + " on " + now + "", invoice.CompanyId);
                                }
                                if (invoice.OldTotalAmount > 0 && (invoice.OldTotalAmount != invoice.TotalAmount))
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "update", invoice.CreatedBy.ToString(), invoiceId.ToString(), "UpdateInvoice", string.Format("Invoice amount(Previous Total Amount:{0} and New Total Amount:{1}) updated by {2} on {3}", string.Format(new CultureInfo("en-US"), "{0:C}", invoice.OldTotalAmount), string.Format(new CultureInfo("en-US"), "{0:C}", invoice.TotalAmount), UserName, now), invoice.CompanyId);
                                }


                                if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                                {
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "submitted", invoice.CreatedBy.ToString(), invoiceId.ToString(), "CreateInvoice", "Submitted Invoice by " + UserName + "  on " + now + "", invoice.CompanyId);
                                }
                                if (invoice.POTypeId == (int)PurchaseOrderType.ContractPoFixed || invoice.POTypeId == (int)PurchaseOrderType.ContractPoVariable)
                                {
                                    var MasterCPO = this.m_dbconnection.Query<ContractPurchaseOrder>("select * from ContractPurchaseOrder where MasterCPOID=@CPOID", new { CPOID = invoice.PurchaseOrderId }).FirstOrDefault();
                                    if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Draft))
                                        AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), invoice.POTypeId), "create", invoice.PurchaseOrderId.ToString(), invoice.InvoiceId.ToString(), "CreateInvoice", "Created Invoice " + InvoiceCode + " by " + UserName + "", invoice.CompanyId);
                                    else if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                                        AuditLog.Info(Enum.GetName(typeof(PurchaseOrderType), invoice.POTypeId), "create", invoice.CreatedBy.ToString(), invoice.PurchaseOrderId.ToString(), "CreateInvoice", "Submitted Invoice " + InvoiceCode + "  by " + UserName + "", invoice.CompanyId);

                                }
                            }
                            return invoiceId;
                        }
                        else
                        {
                            return -1;
                        }
                    }
                    catch (Exception e)
                    {
                        //rollback transaction..
                        transactionObj.Rollback();
                        AuditLog.ErrorLog("Invoice", "create", invoice.CreatedBy.ToString(), invoice.InvoiceId.ToString(), "CreateInvoice", "Submitted Invoice - begin transaction block ", e.Message.ToString());
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                AuditLog.ErrorLog("Invoice", "create", invoice.CreatedBy.ToString(), invoice.InvoiceId.ToString(), "CreateInvoice", "Submitted Invoice - code start block ", e.Message.ToString());
                throw e;
            }
        }

        private bool VerifyDocument(Invoice invoice, IDbTransaction transactionObj)
        {
            bool count = false;
            count = this.m_dbconnection.ExecuteScalar<bool>("Invoice_CRUD", new
            {
                Action = "CHECK_DUPLICATE",
                InvoiceId = invoice.InvoiceId,
                CompanyId = invoice.CompanyId,
                SupplierRefNo = invoice.SupplierRefNo
            }, transaction: transactionObj, commandType: CommandType.StoredProcedure);
            return count;
        }

        public string GetInvoiceCodeById(int InvoiceId, IDbTransaction transactionObj = null)
        {
            string InvoiceCode = null;
            //InvoiceCode= this.m_dbconnection.Query<string>("select InvoiceCode from Invoice where InvoiceId=" + InvoiceId, commandType: CommandType.Text).FirstOrDefault().ToString();
            //if(!InvoiceCode.Contains("-"))
            //{
            //    InvoiceCode = this.m_dbconnection.Query<string>("select DraftCode from Invoice where InvoiceId=" + InvoiceId, commandType: CommandType.Text).FirstOrDefault().ToString();
            //}
            InvoiceCode = this.m_dbconnection.Query<string>("select InvoiceCode from Invoice where InvoiceId=" + InvoiceId, transaction: transactionObj, commandType: CommandType.Text).FirstOrDefault().ToString();
            return InvoiceCode;
        }



        public int UpdateInvoice(Invoice invoice)
        {
            try
            {
                decimal discountsplitbyitemsCpoInsert = 0;
                decimal discountsplitbyitemsCpoupdate = 0;

                Invoice objInvoice = GetInvoiceDetails(invoice.InvoiceId, invoice.InvoiceTypeId, invoice.POTypeId, invoice.CompanyId);



                this.m_dbconnection.Open();//initiate the connection for new transaction

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        if (VerifyDocument(invoice, transactionObj))
                        {
                            CompanyDetails company = this.GetCompanyDetails(invoice.CompanyId);
                            #region Invoice updation...

                            string DraftCode = ConfigurationManager.AppSettings["DraftCode"].ToString();
                            var paramaterObj = new DynamicParameters();
                            int updateResult = transactionObj.Connection.Execute("Invoice_CRUD", new
                            {
                                Action = "UPDATE",
                                InvoiceCode = (!string.IsNullOrEmpty(objInvoice.InvoiceCode) && objInvoice.InvoiceCode.Contains('-')) ? objInvoice.InvoiceCode : ModuleCodes.SupplierInvoice,
                                DraftCode = DraftCode,
                                ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                                CompanyId = invoice.CompanyId,
                                LocationId = invoice.LocationId,
                                Supplierid = invoice.Supplier.SupplierId,
                                RequestedBy = invoice.RequestedBy,
                                Discount = invoice.Discount,
                                TaxId = invoice.TaxId,
                                ShippingCharges = invoice.ShippingCharges,
                                OtherCharges = invoice.OtherCharges,
                                TotalAmount = invoice.TotalAmount,
                                CreatedBy = invoice.CreatedBy,
                                CreatedDate = DateTime.Now,
                                POTypeId = invoice.POTypeId,
                                CurrencyId = invoice.CurrencyId,
                                WorkFlowStatusId = invoice.WorkFlowStatusId,
                                // StatusId = invoice.StatusId,commented by alekhya as we are maintaining single status...
                                invoiceId = invoice.InvoiceId,
                                IsGstRequired = invoice.IsGstRequired,
                                PaymentTermId = invoice.PaymentTermId,
                                DeliveryAddress = invoice.DeliveryAddress,
                                Adjustment = invoice.Adjustment,
                                InvoiceDescription = invoice.InvoiceDescription,
                                GSTAdjustment = invoice.GSTAdjustment,
                                SupplierRefNo = invoice.SupplierRefNo,
                                InvoiceDate = invoice.InvoiceDate,
                                IsGstBeforeDiscount = invoice.IsGstBeforeDiscount,
                                InvoiceTypeId = invoice.InvoiceTypeId,
                                CurrentWorkflowStatusId = objInvoice.WorkFlowStatusId,
                                GlDescription = invoice.GlDescription,
                                SupplierSubCodeId = invoice.SupplierSubCodeId,
                                RemarksInvoice = invoice.RemarksInvoice,
                                SchedulerId = invoice.SchedulerId
                            },
                              transaction: transactionObj,
                              commandType: CommandType.StoredProcedure);

                            #endregion

                            #region we are saving purchase order items...

                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                            //looping through the list of purchase order items...
                            foreach (var record in invoice.InvoiceItems.Where(i => i.InvoiceItemId == 0).Select(i => i))
                            {
                                if (invoice.Discount != 0 && invoice.POTypeId == 5 || invoice.POTypeId == 6)
                                {
                                    discountsplitbyitemsCpoInsert = (invoice.Discount / (invoice.InvoiceItems.Count));
                                }
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@InvoiceId", invoice.InvoiceId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GlDescription", record.GlDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemType", record.ItemType, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemQty", record.ItemQty, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CPONumber", record.CPONumber, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CPOID", record.CPOID, DbType.Int32, ParameterDirection.Input);
                                if (invoice.POTypeId == 5 || invoice.POTypeId == 6)
                                {
                                    itemObj.Add("@ItemDiscount", discountsplitbyitemsCpoInsert, DbType.Decimal, ParameterDirection.Input);
                                }
                                else
                                {
                                    itemObj.Add("@ItemDiscount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                                }
                                itemObj.Add("@ItemTaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemTaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", invoice.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                                // AuditLog.Info("InvoiceRepository", "Update - INSERTITEM", invoice.CreatedBy.ToString(), record.InvoiceItemId.ToString(), "UpdateInvoice", "Purchase Order Code : " + record.PurchaseOrderCode.ToString(), invoice.CompanyId);
                                itemObj.Add("@PoCode", record.PurchaseOrderCode, DbType.String, ParameterDirection.Input);
                                if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Item) && record.Item != null)
                                {
                                    itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                                }
                                if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                                {
                                    itemObj.Add("@ItemAccountCode", record.Service.AccountCodeId, DbType.String, ParameterDirection.Input);
                                }
                                if (invoice.POTypeId == 2 && record.TypeId == 1)
                                {
                                    itemObj.Add("@ItemAccountCode", record.Service.AccountCodeId, DbType.String, ParameterDirection.Input);
                                }
                                if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Expense) && invoice.InvoiceTypeId == 2)
                                {
                                    itemObj.Add("@ItemAccountCode", record.Service.AccountCodeId, DbType.String, ParameterDirection.Input);
                                }

                                //code for cpo case
                                if ((invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable)) && record.AccountCode != null)
                                {
                                    itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@WorkFlowStatusId", record.WorkFlowStatusId, DbType.Int32, ParameterDirection.Input);

                                }


                                itemToAdd.Add(itemObj);
                            }


                            var invoiceItemSaveResult = transactionObj.Connection.Execute("Invoice_CRUD", itemToAdd,
                                                                        transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);


                            #endregion

                            #region updating purchase order items...

                            List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                            //looping through the list of purchase order items...
                            foreach (var record in invoice.InvoiceItems.Where(i => i.InvoiceItemId > 0).Select(i => i))
                            {
                                if (invoice.Discount != 0 && invoice.POTypeId == 5 || invoice.POTypeId == 6)
                                {
                                    discountsplitbyitemsCpoupdate = (invoice.Discount / (invoice.InvoiceItems.Count));
                                }
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@invoiceItemId", record.InvoiceItemId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@GlDescription", record.GlDescription, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemType", record.ItemType, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@ItemQty", record.ItemQty, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@UnitPrice", record.Unitprice, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CPONumber", record.CPONumber, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CPOID", record.CPOID, DbType.Int32, ParameterDirection.Input);
                                if (invoice.POTypeId == 5 || invoice.POTypeId == 6)
                                {
                                    itemObj.Add("@ItemDiscount", discountsplitbyitemsCpoupdate, DbType.Decimal, ParameterDirection.Input);
                                }
                                else
                                {
                                    itemObj.Add("@ItemDiscount", record.Discount, DbType.Decimal, ParameterDirection.Input);
                                }
                                itemObj.Add("@ItemTaxGroupId", record.TaxGroupId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@ItemTaxID", record.TaxID, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", invoice.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@TypeId", record.TypeId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@GSTAmount", record.TaxTotal, DbType.Decimal, ParameterDirection.Input);
                                // AuditLog.Info("InvoiceRepository", "Update - UpdateItem", invoice.CreatedBy.ToString(), record.InvoiceItemId.ToString(), "UpdateInvoice", "Purchase Order Code : " + record.PurchaseOrderCode.ToString(), invoice.CompanyId);
                                itemObj.Add("@PoCode", record.PurchaseOrderCode, DbType.String, ParameterDirection.Input);
                                if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Item) && record.Item != null)
                                {
                                    itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                                }
                                if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Service))
                                {
                                    itemObj.Add("@ItemAccountCode", record.Service.AccountCodeId, DbType.String, ParameterDirection.Input);
                                }
                                if (invoice.POTypeId == 2 && record.TypeId == 1)
                                {
                                    itemObj.Add("@ItemAccountCode", record.Service.AccountCodeId, DbType.String, ParameterDirection.Input);
                                }
                                if (record.TypeId == Convert.ToInt32(PurchaseItemTypes.Expense) && invoice.InvoiceTypeId == 2)
                                {
                                    itemObj.Add("@ItemAccountCode", record.Service.AccountCodeId, DbType.String, ParameterDirection.Input);
                                }

                                //code for cpo case
                                if ((invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable)) && record.AccountCode != null)
                                {
                                    itemObj.Add("@ItemAccountCode", record.AccountCode, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@WorkFlowStatusId", record.WorkFlowStatusId, DbType.Int32, ParameterDirection.Input);

                                }

                                itemsToUpdate.Add(itemObj);
                            }

                            if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            {
                                foreach (InvoiceItems item in invoice.InvoiceItems)
                                {
                                    int resu = transactionObj.Connection.Execute("ContractPurchaseOrderItem_CRUD", new
                                    {
                                        Action = "UPDATEWORKFLOWSTATUS",
                                        DocumentId = item.CPOID,
                                        WorkFlowStatusId = WorkFlowStatus.Invoiced
                                    },
                                     transaction: transactionObj,
                                     commandType: CommandType.StoredProcedure);
                                }
                            }

                            var invoiceItemUpdateResult = transactionObj.Connection.Execute("Invoice_CRUD", itemsToUpdate,
                                                                        transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);
                            #endregion

                            #region deleting purchase order items...

                            List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                            if (invoice.InvoiceItemsToDelete != null)
                            {
                                //looping through the list of purchase order items...
                                foreach (var invoiceItemId in invoice.InvoiceItemsToDelete)
                                {
                                    var itemObj = new DynamicParameters();

                                    itemObj.Add("@Action", "DELETE_INVOICE_ITEM", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@invoiceItemId", invoiceItemId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", invoice.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                                    itemsToUpdate.Add(itemObj);
                                }
                            }

                            var invoiceItemDeleteResult = transactionObj.Connection.Execute("Invoice_CRUD", itemsToUpdate,
                                                                        transaction: transactionObj,
                                                                        commandType: CommandType.StoredProcedure);


                            #endregion

                            #region updating purchase order status
                            int workFlowStatusId = 0;
                            var invoiceQuery = "";
                            // var invoiceQuery = @"
                            //                     select
                            //                         sum(TotalAmount),sum(Discount),sum(ShippingCharges),sum(OtherCharges)
                            //                     from
                            //                         dbo.Invoice
                            //                     where
                            //                         PurchaseOrderId = @PurchaseOrderId
                            //                         and
                            //                         Isdeleted = 0 ;";
                            // if (invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                            // {
                            //     invoiceQuery += @"
                            //                      select
                            //          TotalAmount,Discount,ShippingCharges,OtherCharges
                            //         from
                            //          dbo.PurchaseOrder
                            //         where
                            //          PurchaseOrderId =@PurchaseOrderId
                            //          and
                            //          Isdeleted = 0 ";
                            // }
                            // else if (invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                            // {
                            //     invoiceQuery += @"
                            //                     select
                            // TotalAmount,Discount,ShippingCharges,OtherCharges
                            //from
                            // dbo.FixedAssetPurchaseOrder
                            //where
                            // FixedAssetPurchaseOrderId = @PurchaseOrderId
                            // and
                            // Isdeleted = 0 ";
                            // }
                            // else if (invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                            // {
                            //     invoiceQuery += @"
                            //                      select
                            // TotalAmount,Discount,ShippingCharges,OtherCharges
                            //from
                            // dbo.ExpensesPurchaseOrder
                            //where
                            // ExpensesPurchaseOrderId = @PurchaseOrderId
                            // and
                            // Isdeleted = 0	 ";
                            // }
                            if ((invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed)) || (invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable)))
                            {
                                //invoiceQuery += @"
                                //                 select
                                //  TotalAmount,Discount,OtherCharges
                                // from
                                //  dbo.ContractPurchaseOrder
                                // where
                                //  CPOID = @PurchaseOrderId
                                //  and
                                //  Isdeleted = 0 ";
                                if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                                {
                                    foreach (var record in invoice.InvoiceItems.Where(i => i.InvoiceItemId > 0).Select(i => i))
                                    {
                                        workFlowStatusId = Convert.ToInt32(WorkFlowStatus.Invoiced);

                                        int result = transactionObj.Connection.Execute("usp_UpdatePurchaseOrderStatus", new
                                        {
                                            PurchaseOrderId = record.CPOID,
                                            POTypeId = invoice.POTypeId,
                                            WorkFlowStatusId = workFlowStatusId
                                        },
                                       transaction: transactionObj,
                                       commandType: CommandType.StoredProcedure);
                                    }
                                }
                            }

                            //if ((invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo)) || (invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo)) || (invoice.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo)))
                            //{
                            //    PurchaseOrder purchaseOrderDetails = new PurchaseOrder();
                            //    PurchaseOrder invoiceDetails = new PurchaseOrder();
                            //    using (var result = m_dbconnection.QueryMultiple(invoiceQuery, new
                            //    {
                            //        PurchaseOrderId = invoice.PurchaseOrderId
                            //    }, commandType: CommandType.Text, transaction: transactionObj))
                            //    {
                            //        invoiceDetails = result.ReadFirstOrDefault<PurchaseOrder>();
                            //        purchaseOrderDetails = result.ReadFirstOrDefault<PurchaseOrder>();
                            //    }
                            //    if (invoiceDetails.TotalAmount >= purchaseOrderDetails.TotalAmount)
                            //    {
                            //        workFlowStatusId = Convert.ToInt32(WorkFlowStatus.Invoiced);
                            //    }
                            //    else
                            //    {
                            //        decimal differenceAmount = 0;
                            //        if (invoiceDetails.Discount != purchaseOrderDetails.Discount)
                            //        {
                            //            differenceAmount = invoiceDetails.Discount - purchaseOrderDetails.Discount;
                            //        }
                            //        if (invoiceDetails.ShippingCharges != purchaseOrderDetails.ShippingCharges)
                            //        {
                            //            differenceAmount += invoiceDetails.ShippingCharges - purchaseOrderDetails.ShippingCharges;
                            //        }
                            //        if (invoiceDetails.OtherCharges != purchaseOrderDetails.OtherCharges)
                            //        {
                            //            differenceAmount += invoiceDetails.OtherCharges - purchaseOrderDetails.OtherCharges;
                            //        }
                            //        if (invoiceDetails.TotalAmount >= (purchaseOrderDetails.TotalAmount + differenceAmount))
                            //        {
                            //            workFlowStatusId = Convert.ToInt32(WorkFlowStatus.Invoiced);
                            //        }
                            //        else
                            //        {
                            //            workFlowStatusId = Convert.ToInt32(WorkFlowStatus.PartiallyInvoiced);
                            //        }
                            //    }

                            //    int statusUpdateResult = this.m_dbconnection.Execute("usp_UpdatePurchaseOrderStatus", new
                            //    {
                            //        PurchaseOrderId = invoice.PurchaseOrderId,
                            //        POTypeId = invoice.POTypeId,
                            //        WorkFlowStatusId = workFlowStatusId
                            //    },
                            //    transaction: transactionObj,
                            //    commandType: CommandType.StoredProcedure);
                            //}


                            // #region updating GRN status
                            if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            {
                                if (invoice.SelectedGRNs != null)
                                {
                                    foreach (GoodsReceivedNotes GRN in invoice.SelectedGRNs)
                                    {
                                        int statusUpdateResult = transactionObj.Connection.Execute("GoodsReceivedNotes_CRUD", new
                                        {
                                            Action = "GRNInvoice",
                                            DocumentId = GRN.GoodsReceivedNoteId,
                                            WorkFlowStatusId = WorkFlowStatus.Invoiced,
                                        },
                                        transaction: transactionObj,
                                        commandType: CommandType.StoredProcedure);
                                    }
                                }
                            }
                            // #endregion


                            #endregion

                            #region Save Document Address Details.
                            this.sharedRepositoryObj = new SharedRepository();
                            this.sharedRepositoryObj.PostDocumentAddress(new DocumentAddress
                            {
                                Address = invoice.SupplierAddress,
                                CompanyId = invoice.CompanyId,
                                DocumentId = invoice.InvoiceId,
                                ProcessId = (int)WorkFlowProcessTypes.SupplierInvoice
                            }, transactionObj);
                            #endregion
                            #region deleting attachments
                            //looping through attachments
                            List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                            for (var i = 0; i < invoice.Attachments.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                fileObj.Add("@AttachmentTypeId", invoice.Attachments[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", invoice.InvoiceId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@AttachmentId", invoice.Attachments[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                                fileToDelete.Add(fileObj);
                                var invoiceFileDeleteResult = transactionObj.Connection.Execute("FileOperations_CRUD", fileToDelete, transaction: transactionObj,
                                      commandType: CommandType.StoredProcedure);
                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = AttachmentFolderNames.Invoice,
                                    FilesNames = invoice.Attachments.Select(j => j.FileName).ToArray(),
                                    UniqueId = invoice.InvoiceId.ToString()
                                });
                            }

                            #endregion

                            #region saving files uploaded files...
                            try
                            {
                                List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                                //looping through the list of purchase order items...
                                for (var i = 0; i < invoice.files.Count; i++)
                                {
                                    var itemObj = new DynamicParameters();
                                    itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.Invoice), DbType.Int32, ParameterDirection.Input);//static value need to change
                                    itemObj.Add("@RecordId", invoice.InvoiceId, DbType.Int32, ParameterDirection.Input);
                                    itemObj.Add("@FileName", invoice.files[i].FileName, DbType.String, ParameterDirection.Input);
                                    itemObj.Add("@CreatedBy", invoice.CreatedBy, DbType.Int32, ParameterDirection.Input);
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
                                    ModuleName = AttachmentFolderNames.Invoice,
                                    Files = invoice.files,
                                    UniqueId = invoice.InvoiceId.ToString()
                                });

                            }
                            catch (Exception e)
                            {
                                throw e;
                            }
                            #endregion

                            if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                            {
                                WorkFlowConfigurationRepository workFlowConfigRepository = new WorkFlowConfigurationRepository();
                                WorkFlowParameter workFlowParameter = new WorkFlowParameter()
                                {
                                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                                    CompanyId = invoice.CompanyId,
                                    DocumentId = invoice.InvoiceId,
                                    LocationId = invoice.LocationId,
                                    CreatedBy = invoice.CreatedBy,
                                    WorkFlowStatusId = invoice.WorkFlowStatusId
                                };

                                var workFlowDetails = workFlowConfigRepository.GetWorkFlowConfiguration(Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice), invoice.CompanyId, invoice.LocationId);

                                string previousApproverStatus = "Approved";
                                if (workFlowDetails != null)
                                {
                                    if (workFlowDetails.WorkFlowProcess.Count > 0)
                                    {
                                        int apuserid = (int)workFlowDetails.WorkFlowProcess.First().WorkFlowLevels.Where(x => x.IsCondition == false).FirstOrDefault().ApproverUserId;
                                        UserProfileRepository userProfileRepository1 = new UserProfileRepository();

                                        UserProfile sender = userProfileRepository1.GetUserById(invoice.CreatedBy);
                                        UserProfile nextApprover = userProfileRepository1.GetUserById(invoice.CreatedBy);
                                        string type = "Request for Invoice Approval";
                                        string status = "Approved";
                                        var ApuserName = userProfileRepository1.GetUserById(invoice.CreatedBy);
                                        objInvoice.RequestedByUserName = string.Format("{0} {1}", ApuserName.FirstName, ApuserName.LastName);
                                        invoice.InvoiceCode = invoice.InvoiceCode;
                                        invoice.CurrencySymbol = this.m_dbconnection.Query<string>(string.Format("select Symbol from Currencies where Id = (select currencyid from Invoice where InvoiceId={0})", invoice.InvoiceId), transaction: transactionObj, commandType: CommandType.Text).FirstOrDefault().ToString();
                                        objInvoice.WorkFlowStatus = "open";



                                        Util.Email.InvoiceEmailProvider.SendInvoiceRequestApprovalMail(company.CompanyShortName, "INV", objInvoice, sender, type, status, previousApproverStatus, nextApprover);
                                    }
                                }
                            }


                            //commiting the transaction...



                            #region Approval
                            if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.ApprovalInProgress))
                            {
                                sharedRepositoryObj = new SharedRepository();
                                sharedRepositoryObj.SendForApproval(new WorkFlowParameter()
                                {
                                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                                    CompanyId = invoice.CompanyId,
                                    DocumentId = invoice.InvoiceId,
                                    LocationId = invoice.LocationId,
                                    CreatedBy = invoice.CreatedBy,
                                    DocumentCode = DraftCode,
                                    Value = invoice.TotalbefTaxSubTotal.ToString(),
                                    WorkFlowStatusId = invoice.WorkFlowStatusId,
                                    CurrentWorkFlowStatusId = objInvoice.WorkFlowStatusId
                                }, false, transactionObj, transactionObj.Connection);
                            }
                            else
                            {
                                transactionObj.Commit();
                            }
                            #endregion
                            UserProfileRepository userProfileRepository = new UserProfileRepository();
                            var user = userProfileRepository.GetUserById(invoice.CreatedBy);
                            string UserName = user.FirstName + " " + user.LastName;
                            string InvoiceCode = GetInvoiceCode(invoice.InvoiceId);
                            if (!string.IsNullOrEmpty(invoice.InvoiceCode))
                            {
                                DateTime now = DateTime.Now;
                                //if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Draft))
                                //    AuditLog.Info("Invoice", "update", invoice.CreatedBy.ToString(), invoice.InvoiceId.ToString(), "UpdateInvoice", " Invoice amount("+ invoice.TotalAmount +  ")updated by  " + UserName + " on " + now + "",invoice.CompanyId);
                                //else
                                if (objInvoice.TotalAmount > 0 && objInvoice.TotalAmount != invoice.TotalAmount)
                                    AuditLog.Info("SupplierInvoice", "update", invoice.CreatedBy.ToString(), invoice.InvoiceId.ToString(), "UpdateInvoice", string.Format("Invoice amount(Previous Total Amount:{0} and New Total Amount:{1}) updated by {2} on {3}", string.Format(new CultureInfo("en-US"), "{0:C}", objInvoice.TotalAmount), string.Format(new CultureInfo("en-US"), "{0:C}", invoice.TotalAmount), UserName, now), invoice.CompanyId);
                                if (invoice.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed))
                                    AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "submit", invoice.CreatedBy.ToString(), invoice.InvoiceId.ToString(), "UpdateInvoice", "Submitted Invoice by " + UserName + " on " + now + "", invoice.CompanyId);
                            }
                            return 1;
                        }
                        else
                        {
                            return -1;
                        }
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

        public bool DeleteInvoice(InvoiceDelete invoiceDelete)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        #region delete invoice...
                        var invoiceDeleteResult = transactionObj.Connection.Execute("Invoice_CRUD",
                                                                new
                                                                {

                                                                    Action = "DELETE",
                                                                    InvoiceId = invoiceDelete.InvoiceId,
                                                                    CreatedBy = invoiceDelete.ModifiedBy,
                                                                    CreatedDate = DateTime.Now
                                                                },
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                        #endregion

                        #region deleting invoice items...
                        var invoiceItemDeleteResult = transactionObj.Connection.Execute("Invoice_CRUD", new
                        {

                            Action = "DELETEALLITEMS",
                            InvoiceId = invoiceDelete.InvoiceId,
                            CreatedBy = invoiceDelete.ModifiedBy,
                            CreatedDate = DateTime.Now
                        },
                                                            transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                        #endregion
                        #region deleting all the files related to this invoice
                        try
                        {

                            var parameterObj = new DynamicParameters();
                            parameterObj.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                            parameterObj.Add("@RecordId", invoiceDelete.InvoiceId, DbType.Int32, ParameterDirection.Input);
                            parameterObj.Add("@AttachmentTypeId", Convert.ToInt32(AttachmentType.Invoice), DbType.Int32, ParameterDirection.Input);

                            var deletedAttachmentNames = transactionObj.Connection.Query<string>("FileOperations_CRUD", parameterObj, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);

                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = AttachmentFolderNames.Invoice,
                                FilesNames = deletedAttachmentNames.ToArray(),
                                UniqueId = invoiceDelete.InvoiceId.ToString()
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
                        string UserName = userProfileRepository.GetUserById(invoiceDelete.ModifiedBy).UserName;
                        // int CompanyId = GetCompanyId(invoiceDelete.InvoiceId);                        
                        AuditLog.Info("Invoice", "Delete", invoiceDelete.ModifiedBy.ToString(), invoiceDelete.InvoiceId.ToString(), "DeleteInvoice", "Delete Invoice with ID " + invoiceDelete.InvoiceId + " deleted by " + UserName, 0);
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

        //public int GetCompanyId(int InvoiceId)
        //{
        //    int CompanyId = 0;
        //    try
        //    {
        //        CompanyId = this.m_dbconnection.Query<int>("select CompanyId from Invoice where InvoiceId=" + InvoiceId).FirstOrDefault();
        //    }
        //    catch (Exception e)
        //    {

        //    }

        //    return CompanyId;
        //}

        public IEnumerable<InvoiceTypes> GetInvoiceTypes()
        {
            try
            {
                InvoiceDisplayResult invoiceDisplayResult = new InvoiceDisplayResult();
                //executing the stored procedure to get the list of purchase order Request types
                var result = this.m_dbconnection.Query<InvoiceTypes>("usp_GetPurchaseOrderTypes",
                                                commandType: CommandType.StoredProcedure);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public IEnumerable<CostOfServiceTypes> InvoiceGetCostOfServiceTypes()
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


        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();
                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = AttachmentFolderNames.Invoice,
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


        public Invoice GetInvoiceDetails(int invoiceId, int invoiceTypeId, int? poTypeId, int? companyId)
        {
            try
            {
                Invoice invoiceDetailsObj = new Invoice();
                //executing the stored procedure to get the list of Invoice
                using (var result = this.m_dbconnection.QueryMultiple("Invoice_CRUD", new
                {

                    Action = "SELECTBYID",
                    InvoiceId = invoiceId,
                    InvoiceTypeId = invoiceTypeId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                    PoTypeId = poTypeId,
                    CompanyId = companyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //Invoice  details..
                    invoiceDetailsObj = result.Read<Invoice, Suppliers, SupplierSubCode, Invoice>((Inv, Su, Ssc) =>
                     {
                         if ((Inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed)) || (Inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)))
                         {
                             Inv.WorkFlowStatus = "Open";
                         }
                         Inv.Supplier = Su;
                         Inv.SupplierSubCode = Ssc;
                         return Inv;
                     }, splitOn: "SupplierId,SubCodeId").FirstOrDefault();

                    if (invoiceDetailsObj != null)
                    {

                        //InvoiceItems.
                        //if (invoiceTypeId == 1)
                        //{
                        //    invoiceDetailsObj.InvoiceItems = result.Read<InvoiceItems>().ToList();
                        //}
                        //else
                        //{
                        invoiceDetailsObj.InvoiceItems = result.Read<InvoiceItems, GetItemMasters, AccountCode, InvoiceItems>((Pc, IM, Ac) =>
                        {
                            if (IM != null && IM.ItemMasterId > 0)
                            {
                                Pc.Item = IM;
                            }
                            else
                            {
                                Pc.Item = new GetItemMasters() { ItemMasterId = 0, ItemName = Pc.ServiceText };
                            }

                            if ((Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) && Pc.ItemType == "item")
                            {
                                Pc.ItemType = "Item";
                            }
                            if (Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Service) && (poTypeId == 1 || poTypeId == 2))
                            {
                                Pc.ItemType = "Service";
                            }
                            if (Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Service) && (poTypeId == 3))
                            {
                                Pc.ItemType = Pc.AccountCodeName;
                            }
                            if ((Pc.TypeId == 1 && poTypeId == 2))
                            {
                                Pc.ItemType = "Asset";
                            }
                            //if ((Pc.TypeId == 3))
                            //{
                            //    Pc.ItemType = "Expense";
                            //}
                            if (Ac != null && Ac.AccountCodeId > 0)
                            {
                                Pc.Service = Ac;
                            }
                            else
                            {
                                Pc.Service = new AccountCode() { AccountCodeId = 0, Description = "" };
                            }
                            return Pc;
                        }, splitOn: "ItemMasterId, AccountCodeId").ToList();
                        // }

                        //invoiceDetailsObj.InvoiceItems = result.Read<InvoiceItems>().ToList();
                        invoiceDetailsObj.InvoiceItems.ForEach(Pc =>
                        {
                            if (invoiceDetailsObj.IsGstBeforeDiscount == true)
                            {
                                Pc.TaxTotal = (((Pc.Unitprice * Pc.ItemQty)) * Pc.TaxAmount / 100);
                            }
                            else
                            {
                                Pc.TaxTotal = (((Pc.Unitprice * Pc.ItemQty) - Pc.Discount) * Pc.TaxAmount / 100);
                            }
                            Pc.ItemTotalPrice = (Pc.Unitprice * Pc.ItemQty) + Pc.TaxTotal - Pc.Discount;
                            Pc.CurrentTaxTotal = Pc.TaxTotal;
                            Pc.CurrentTaxAmount = Pc.TaxAmount;
                            Pc.Totalprice = (Pc.ItemQty * Pc.Unitprice);
                            Pc.TotalbefTax = Pc.Totalprice - Pc.Discount;
                        });

                        decimal subTotal = 0;
                        if (invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                        {
                            var Total = invoiceDetailsObj.InvoiceItems.Sum(i => i.Unitprice);
                            subTotal = Total;
                        }
                        else
                        {
                            var Total = invoiceDetailsObj.InvoiceItems.Sum(i => i.ItemTotalPrice);
                            subTotal = Total;
                        }
                        //var subTotal = invoiceDetailsObj.InvoiceItems.Sum(i => i.ItemTotalPrice);
                        var totalTax = invoiceDetailsObj.InvoiceItems.Sum(i => i.TaxTotal);
                        invoiceDetailsObj.SubTotal = subTotal;
                        if (invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                        {
                            decimal taxamount = invoiceDetailsObj.InvoiceItems.FirstOrDefault().TaxAmount;
                            invoiceDetailsObj.TotalTax = (invoiceDetailsObj.SubTotal - invoiceDetailsObj.Discount) * taxamount / 100;
                        }
                        else
                        {
                            invoiceDetailsObj.TotalTax = totalTax;
                        }

                        if (poTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo) || poTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo) || poTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                        {
                            invoiceDetailsObj.NetTotal = (subTotal) + invoiceDetailsObj.ShippingCharges + invoiceDetailsObj.OtherCharges + invoiceDetailsObj.GSTAdjustment;
                        }
                        else if (invoiceTypeId == 2)
                        {
                            invoiceDetailsObj.NetTotal = (subTotal) + invoiceDetailsObj.ShippingCharges + invoiceDetailsObj.OtherCharges + invoiceDetailsObj.GSTAdjustment;
                        }
                        else
                        {
                            invoiceDetailsObj.NetTotal = (subTotal - invoiceDetailsObj.Discount) + invoiceDetailsObj.ShippingCharges + invoiceDetailsObj.OtherCharges + invoiceDetailsObj.GSTAdjustment + invoiceDetailsObj.TotalTax;
                        }
                        //invoiceDetailsObj.TotalAmount = invoiceDetailsObj.NetTotal + invoiceDetailsObj.Adjustment;
                        if (invoiceDetailsObj.InvoiceDate != null && invoiceDetailsObj.NoOfDays > 0)
                        {
                            invoiceDetailsObj.DueDate = invoiceDetailsObj.InvoiceDate.AddDays(invoiceDetailsObj.NoOfDays);
                            invoiceDetailsObj.DueDateString = invoiceDetailsObj.DueDate.ToString("dd-MM-yyyy");
                        }
                        invoiceDetailsObj.SelectedGRNs = result.Read<GoodsReceivedNotes>().ToArray();
                        if (invoiceTypeId == 1 && poTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || poTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                        {
                            invoiceDetailsObj.SelectedCPOs = result.Read<ContractPurchaseOrder>().ToArray();
                            ContractPurchaseOrderRepository repository = new ContractPurchaseOrderRepository();
                            invoiceDetailsObj.JVs = new List<ContractPurchaseOrder>();
                            foreach (var CPO in invoiceDetailsObj.SelectedCPOs)
                            {
                                if (CPO.IsCPOAccrued)
                                    invoiceDetailsObj.JVs.Add(repository.GetContractPurchaseOrderDetails(CPO.CPOID.ToString()));
                            }
                            //invoiceDetailsObj.CPOSelected = result.Read<ContractPurchaseOrder>().ToArray();
                            invoiceDetailsObj.CPOSelected = result.Read<ContractPurchaseOrderItems>().ToArray();
                            //Anuj code - 
                            //for (int i=0; i< invoiceDetailsObj.SelectedCPOs.Length;i++)
                            //{
                            //    try
                            //    {
                            //        invoiceDetailsObj.SelectedCPOs[i].AccountCodeName = invoiceDetailsObj.CPOSelected[i].AccountCodeName;
                            //    }
                            //    catch { }
                            //}
                        }
                        if (poTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo) || poTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo) || poTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                        {
                            invoiceDetailsObj.SelectedPOs = result.Read<PurchaseOrderList>().ToArray();
                            if (invoiceDetailsObj.SelectedPOs.Length > 0)
                            {
                                invoiceDetailsObj.PurchaseOrderCode = "";
                                invoiceDetailsObj.PurchaseOrderId = "";
                                foreach (var record in invoiceDetailsObj.SelectedPOs)
                                {
                                    invoiceDetailsObj.PurchaseOrderCode += record.PurchaseOrderCode + ", ";
                                    invoiceDetailsObj.PurchaseOrderId += record.PurchaseOrderId + ", ";
                                }
                                invoiceDetailsObj.PurchaseOrderCode = invoiceDetailsObj.PurchaseOrderCode.Remove(invoiceDetailsObj.PurchaseOrderCode.Length - 2);
                                invoiceDetailsObj.PurchaseOrderId = invoiceDetailsObj.PurchaseOrderId.Remove(invoiceDetailsObj.PurchaseOrderId.Length - 2);
                            }
                        }
                        UserProfile userProfile = result.Read<UserProfile>().FirstOrDefault();
                        if (userProfile != null)
                        {
                            invoiceDetailsObj.CurrentApproverUserId = userProfile.UserID;
                            invoiceDetailsObj.CurrentApproverUserName = userProfile.UserName;
                        }

                        //comments
                        invoiceDetailsObj.WorkFlowComments = new List<WorkflowAuditTrail>();
                        invoiceDetailsObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                        {
                            Documentid = invoiceDetailsObj.InvoiceId,
                            ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                            DocumentUserId = invoiceDetailsObj.CreatedBy,
                            UserId = Convert.ToInt32(invoiceDetailsObj.CreatedBy)
                        }).ToList();

                        var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                        {
                            Action = "SELECT",
                            RecordId = invoiceId,
                            AttachmentTypeId = Convert.ToInt32(AttachmentType.Invoice) //static value need to change
                        }, commandType: CommandType.StoredProcedure);
                        invoiceDetailsObj.Attachments = attachments.ToList();
                        this.sharedRepositoryObj = new SharedRepository();
                        DocumentAddress address = this.sharedRepositoryObj.GetDocumentAddress((int)WorkFlowProcessTypes.SupplierInvoice, invoiceDetailsObj.InvoiceId, invoiceDetailsObj.CompanyId);
                        invoiceDetailsObj.SupplierAddress = address == null ? string.Empty : address.Address;
                        if (invoiceDetailsObj.POTypeId == (int)WorkFlowProcessTypes.ContractPOFixed || invoiceDetailsObj.POTypeId == (int)WorkFlowProcessTypes.ContractPOVariable)
                        {
                            decimal poTotal = 0M;
                            invoiceDetailsObj.InvoiceItems.ForEach(Pc =>
                            {
                                var retrievesubTotal = this.m_dbconnection.Query<decimal>("Invoice_CRUD", new
                                {
                                    Action = "RETREIVESUBTOTAL",
                                    //InvoiceId=invoiceId,
                                    POTypeId = invoiceDetailsObj.POTypeId,
                                    PurchaseOrderId = Pc.CPOID,
                                    CompanyId = invoiceDetailsObj.CompanyId
                                }, commandType: CommandType.StoredProcedure);
                                poTotal = poTotal + retrievesubTotal.FirstOrDefault();
                            });
                            invoiceDetailsObj.SubTotalAmount = poTotal;
                        }
                        else
                        {
                            var retrievesubTotal = this.m_dbconnection.Query<decimal>("Invoice_CRUD", new
                            {
                                Action = "RETREIVESUBTOTAL",
                                //InvoiceId=invoiceId,
                                POTypeId = invoiceDetailsObj.POTypeId,
                                PurchaseOrderId = invoiceDetailsObj.PurchaseOrderId,
                                CompanyId = invoiceDetailsObj.CompanyId
                            }, commandType: CommandType.StoredProcedure);
                            invoiceDetailsObj.SubTotalAmount = retrievesubTotal.FirstOrDefault();
                        }
                        #region CreditNotes
                        CreditNoteRepository creditNoteRepository = new CreditNoteRepository();
                        invoiceDetailsObj.CreditNotes = creditNoteRepository.GetCreditNotesList(new GridDisplayInput
                        {
                            InvoiceCode = invoiceDetailsObj.InvoiceCode,
                            CompanyId = invoiceDetailsObj.CompanyId,
                            FetchFilterData = true
                        }).Where(x => x.WorkFlowStatus == "Open" || x.WorkFlowStatus == "Exported");
                        invoiceDetailsObj.CanVoid = this.m_dbconnection.ExecuteScalar<bool>("Invoice_CRUD", new
                        {
                            Action = "CHECK_CN",
                            InvoiceId = invoiceId
                        }, commandType: CommandType.StoredProcedure);
                        #endregion
                    }


                    //if (invoiceDetailsObj.PurchaseOrderId > 0)
                    //{
                    //    string purchaseOrderQuery = "";
                    //    if (invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo))
                    //    {
                    //        purchaseOrderQuery =
                    //                             @"  select 
                    //                                 PurchaseOrderCode 
                    //                               from 
                    //                                  dbo.PurchaseOrder
                    //                               where 
                    //                                   PurchaseOrderId = @purchaseOrderId";
                    //}
                    //else if (invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo))
                    //{
                    //    purchaseOrderQuery =
                    //                         @"  select 
                    //                                 FixedAssetPurchaseOrderCode 
                    //                               from 
                    //                                 dbo.FixedAssetPurchaseOrder
                    //                               where
                    //                                   FixedAssetPurchaseOrderId = @purchaseOrderId";
                    //}
                    //else if (invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                    //{
                    //    purchaseOrderQuery =
                    //                         @"  select 
                    //                                 CPONumber 
                    //                               from 
                    //                                  dbo.ContractPurchaseOrder 
                    //                               where 
                    //                                   CPOID = @purchaseOrderId";
                    //}
                    //else if (invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                    //{
                    //    purchaseOrderQuery =
                    //                         @"  select
                    //                                 ExpensesPurchaseOrderCode
                    //                                from
                    //                                 dbo.ExpensesPurchaseOrder
                    //                                where
                    //                                 ExpensesPurchaseOrderId =  @purchaseOrderId";
                    //    }
                    //    invoiceDetailsObj.PurchaseOrderCode = this.m_dbconnection.QueryFirstOrDefault<string>(purchaseOrderQuery, new
                    //    {
                    //        Action = "SELECT",
                    //        purchaseOrderId = invoiceDetailsObj.PurchaseOrderId
                    //    }, commandType: CommandType.Text);
                    //}
                    return invoiceDetailsObj;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public InvoiceDisplayResult GetAllSearchInvoice(GridDisplayInput invoiceInput)
        {
            try
            {
                InvoiceDisplayResult invoiceDisplayResult = new InvoiceDisplayResult();

                string invoiceSearchQuery = "select Inv.InvoiceCode,Inv.InvoiceId,S.SupplierName " +
                                                  "from " +
                                                  "dbo.Invoice as Inv " +
                                                  "join dbo.Supplier as S " +
                                                  "on " +
                                                  "POR.Supplierid = S.SupplierId " +
                                                  "where " +
                                                  "( " +
                                                      "Inv.InvoiceCode LIKE concat('%',@Search,'%') " +
                                                      "or " +
                                                      "S.SupplierName LIKE concat('%',@Search,'%') " +
                                                   ") " +
                                                   "and " +
                                                   "Inv.Isdeleted = 0 " +
                                                   "order by " +
                                                   "Inv.UpdatedDate " +
                                                   "OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                invoiceSearchQuery += "select count(*) " +
                                             "from " +
                                             "dbo.Invoice as Inv " +
                                             "join dbo.Supplier as S " +
                                             "on " +
                                             "Inv.Supplierid = S.SupplierId " +
                                             "where " +
                                             "( " +
                                                 "Inv.InvoiceCode LIKE concat('%',@Search,'%') " +
                                                 "or " +
                                                 "S.SupplierName  LIKE concat('%',@Search,'%')" +
                                             ") " +
                                             "and " +
                                             "Inv.Isdeleted = 0 ";

                //executing the stored procedure to get the list of invoice
                using (var result = this.m_dbconnection.QueryMultiple(invoiceSearchQuery, new
                {

                    Action = "SELECT",
                    Skip = invoiceInput.Skip,
                    Take = invoiceInput.Take,
                    Search = invoiceInput.Search
                }, commandType: CommandType.Text))
                {
                    //list of invoice..
                    invoiceDisplayResult.Invoice = result.Read<InvoiceList>().AsList();

                    //total number of invoice
                    invoiceDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }

                return invoiceDisplayResult;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string ConvertInvoiceToPdf(int invoiceId, int invoiceTypeId, int? poTypeId, int? companyId)
        {
            try
            {
                Invoice invoiceDetails = GetInvoiceDetails(invoiceId, invoiceTypeId, poTypeId, companyId);
                string template = SupplierInvoiceTemplate.SupplierInvoice(invoiceDetails);
                return template;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        //public List<GoodsReceivedNotes> GetGRNByPurchaseOrder(int purchaseOrderId,int purchaseOrderTypeId)
        public List<GoodsReceivedNotes> GetGRNByPurchaseOrder(string purchaseOrderId, int purchaseOrderTypeId)
        {
            try
            {
                string grnQuery = @"select 
	                                    GRN.GRNCode,
                                        GRN.SupplierDoNumber, 
	                                    GRN.GoodsReceivedNoteId,
                                        GRN.PONO,
                                        GRN.PurchaseOrderId,
                                        da.address as SupplierAddress
                                    from 
                                        dbo.GoodsReceivedNote as GRN
                                    inner join DocumentAddress as da on grn.GoodsReceivedNoteId = da.DocumentId and da.ProcessId=20 and grn.CompanyId = da.CompanyId
                                    where 
                                    PurchaseOrderId in (select Data from dbo.Split(@purchaseOrderId,','))
                                    and POTypeId =@purchaseOrderTypeId
                                    and
                                    IsDeleted = 0
                                    and
                                    WorkFlowStatusId = @WorkFlowStatusId
                                    and
                                    IsReturn = 0 AND GRN.GoodsReceivedNoteId NOT IN (SELECT GoodsReceivedNoteId FROM InvoiceGRN where IsDeleted=0 and POTypeId=@purchaseOrderTypeId);";

                grnQuery += @"       select  
                                            GRN.GoodsReceivedNoteId, 
                                            GRNI.RecordId, 
                                            GRNI.GRNQty,
                                            GRNI.OriginalQty,
                                            GRNI.Discount,
                                            GRN.PurchaseOrderId
                                        from 
                                            dbo.GoodsReceivedNote as GRN 
                                        join 
                                            dbo.GRNItems AS GRNI 
                                            on
                                            GRN.GoodsReceivedNoteId = GRNI.GoodsReceivedNoteId 
                                        where 
                                        GRN.PurchaseOrderId in (select Data from dbo.Split(@purchaseOrderId,',')) 
                                            and GRN.POTypeId =@purchaseOrderTypeId
                                        and
                                        GRN.IsDeleted = 0
                                        and
                                        GRN.WorkFlowStatusId = @WorkFlowStatusId
                                        and
                                        GRN.IsReturn = 0";

                List<GoodsReceivedNotes> grnNotes = new List<GoodsReceivedNotes>();

                //executing the stored procedure to get the list of  grns
                using (var result = this.m_dbconnection.QueryMultiple(grnQuery, new
                {
                    purchaseOrderId = purchaseOrderId,
                    purchaseOrderTypeId = purchaseOrderTypeId,
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.Completed)

                }, commandType: CommandType.Text))
                {
                    grnNotes = result.Read<GoodsReceivedNotes>().ToList();
                    var grnNotesList = result.Read<GoodsReceivedNotesItems>().ToList();
                    if (grnNotes != null)
                    {
                        grnNotes.ForEach(data =>
                        {
                            data.ItemsList = grnNotesList.Where(j => j.GoodsReceivedNoteId == data.GoodsReceivedNoteId).ToList();
                        });
                    }
                }
                return grnNotes;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public decimal CalculateInvoiceSubTotal(InvoiceSubTotal invoiceSubTotal)
        {
            try
            {
                decimal count = 0;
                using (var result = this.m_dbconnection.QueryMultiple("Invoice_CRUD", new
                {
                    Action = "SUBTOTAL",
                    PurchaseOrderId = invoiceSubTotal.PurchaseOrderId,
                    CompanyId = invoiceSubTotal.CompanyId,
                    InvoiceId = invoiceSubTotal.InvoiceId,
                    POTypeId = invoiceSubTotal.POTypeId,
                }, commandType: CommandType.StoredProcedure))
                {
                    try
                    {
                        count = result.Read<decimal>().FirstOrDefault();
                    }
                    catch { }
                }
                return count;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public int VoidInvoice(InvoiceVoid invoice)
        {
            try
            {
                //var recordCount = this.m_dbconnection.Query<int>("usp_GetPurchaseOrderVoidStatus", new
                //{
                //    InvoiceId = invoice.InvoiceId,
                //}, commandType: CommandType.StoredProcedure).FirstOrDefault();

                //if (recordCount == 0)
                //{
                var result = this.m_dbconnection.Execute("Invoice_CRUD", new
                {

                    Action = "VOIDRECORD",
                    InvoiceId = invoice.InvoiceId,
                    ReasonstoVoid = invoice.Reasons.Trim(),
                    CreatedBy = invoice.UserId,
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.Void),
                    CreatedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure);

                #region updating GRN Status
                if (invoice.POTypeId == 1 || invoice.POTypeId == 2 || invoice.POTypeId == 3)
                {
                    if (invoice.SelectedGRNs != null)
                    {
                        foreach (var GRN in invoice.SelectedGRNs)
                        {
                            int statusUpdateResult = this.m_dbconnection.Execute("GoodsReceivedNotes_CRUD", new
                            {
                                Action = "GRNInvoice",
                                DocumentId = GRN.GoodsReceivedNoteId,
                                WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.Completed),
                            },
                            commandType: CommandType.StoredProcedure);

                            int UpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                            {
                                Action = "UPDATEINVOICEGRNREJECT",
                                GoodsReceivedNoteId = GRN.GoodsReceivedNoteId,
                                POTypeId = invoice.POTypeId
                            },
                            commandType: CommandType.StoredProcedure);

                            int statusUpdateResult1 = this.m_dbconnection.Execute("Invoice_CRUD", new
                            {
                                Action = "DELETEINVOICEGRN",
                                GoodsReceivedNoteId = GRN.GoodsReceivedNoteId,
                                POTypeId = invoice.POTypeId
                            },
                            commandType: CommandType.StoredProcedure);
                        }
                    }
                }
                else if (invoice.POTypeId == 5 || invoice.POTypeId == 6)
                {
                    if (invoice.SelectedCPOs != null)
                    {
                        foreach (var CPO in invoice.SelectedCPOs)
                        {
                            int statusUpdateResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                            {
                                Action = "UPDATEWORKFLOWSTATUS",
                                DocumentId = CPO.CPOID,
                                WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.Approved),
                            },
                            commandType: CommandType.StoredProcedure);

                            int statusUpdateResult1 = this.m_dbconnection.Execute("Invoice_CRUD", new
                            {
                                Action = "DELETEINVOICEGRN",
                                GoodsReceivedNoteId = CPO.CPOID,
                                POTypeId = invoice.POTypeId
                            },
                            commandType: CommandType.StoredProcedure);

                            int UpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                            {
                                Action = "UPDATEINVOICECPOREJECT",
                                CPOID = CPO.CPOID,
                                POTypeId = invoice.POTypeId
                            },
                            commandType: CommandType.StoredProcedure);

                        }
                    }
                }

                if (invoice.SelectedPOs != null)
                {
                    foreach (var po in invoice.SelectedPOs)
                    {
                        int statusUpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "DELETEINVOICEPOs",
                            InvoiceId = invoice.InvoiceId,
                            PurchaseOrderId = po.PurchaseOrderId,
                            POTypeId = po.POTypeId,
                        },
                        commandType: CommandType.StoredProcedure);
                    }
                }

                #endregion
                //}
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                var user = userProfileRepository.GetUserById(invoice.UserId);
                string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                DateTime now = DateTime.Now;
                AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "void", invoice.UserId.ToString(), invoice.InvoiceId.ToString(), "VoidInvoice", "Voided by " + UserName + " on " + now + " " + invoice.Reasons, invoice.CompanyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int RejectInvoice(InvoiceVoid invoice)
        {
            try
            {
                var result = this.m_dbconnection.Execute("Invoice_CRUD", new
                {
                    Action = "REASONTOREJECT",
                    InvoiceId = invoice.InvoiceId,
                    ReasonToReject = invoice.Reasons.Trim(),
                    CreatedBy = invoice.UserId,
                    CreatedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure);

                if (invoice.SelectedGRNs != null)
                {
                    foreach (var GRN in invoice.SelectedGRNs)
                    {
                        int statusUpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "DELETEINVOICEGRN",
                            GoodsReceivedNoteId = GRN.GoodsReceivedNoteId,
                            POTypeId = invoice.POTypeId
                        },
                        commandType: CommandType.StoredProcedure);

                        int UpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "UPDATEINVOICEGRNREJECT",
                            GoodsReceivedNoteId = GRN.GoodsReceivedNoteId,
                            POTypeId = invoice.POTypeId
                        },
                        commandType: CommandType.StoredProcedure);
                    }
                }

                if (invoice.SelectedCPOs != null)
                {
                    foreach (var CPO in invoice.SelectedCPOs)
                    {
                        int statusUpdateResult = this.m_dbconnection.Execute("ContractPurchaseOrderItem_CRUD", new
                        {
                            Action = "UPDATEWORKFLOWSTATUS",
                            DocumentId = CPO.CPOID,
                            WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.Approved),
                        },
                        commandType: CommandType.StoredProcedure);

                        int statusUpdateResult1 = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "DELETEINVOICEGRN",
                            GoodsReceivedNoteId = CPO.CPOID,
                            POTypeId = invoice.POTypeId
                        },
                           commandType: CommandType.StoredProcedure);

                        int UpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "UPDATEINVOICECPOREJECT",
                            CPOID = CPO.CPOID,
                            POTypeId = invoice.POTypeId
                        },
                            commandType: CommandType.StoredProcedure);
                    }
                }


                if (invoice.SelectedPOs != null)
                {
                    foreach (var po in invoice.SelectedPOs)
                    {
                        int statusUpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "DELETEINVOICEPOs",
                            InvoiceId = invoice.InvoiceId,
                            PurchaseOrderId = po.PurchaseOrderId,
                            POTypeId = po.POTypeId,
                        },
                        commandType: CommandType.StoredProcedure);
                    }
                }

                UserProfileRepository userProfileRepository = new UserProfileRepository();
                string UserName = userProfileRepository.GetUserById(invoice.UserId).UserName;
                AuditLog.Info("Invoice", "reject", invoice.UserId.ToString(), invoice.InvoiceId.ToString(), "RejectInvoice", "Invoice " + invoice.InvoiceId + " reject by " + UserName + "", invoice.CompanyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ChangeInvoiceStatus(int invoiceId, int Workflowstatusid, int userId, int CurrentUserId)
        {
            try
            {

                var result = this.m_dbconnection.Execute("Invoice_CRUD", new
                {

                    Action = "CHANGEWORKFLOWSTATUS",
                    InvoiceId = invoiceId,
                    CreatedBy = userId,
                    WorkFlowStatusId = Workflowstatusid,
                    CreatedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure);
                UpdateInvoiceExportAuditLog(invoiceId, CurrentUserId);
                //}
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private void UpdateInvoiceExportAuditLog(int invoiceId, int userId)
        {
            string qry = @"select PurchaseOrderId,POTypeId,InvoiceCode from Invoice where InvoiceId=@invoiceId";
            var poDetails = this.m_dbconnection.Query<dynamic>(qry, new { invoiceId = invoiceId }).FirstOrDefault();
            if (poDetails != null)
            {
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                var currentApprover = userProfileRepository.GetUserById(userId);
                DateTime logTime = DateTime.Now;
                AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "sent for approval", userId.ToString(), invoiceId.ToString(), "SendForApproval", string.Format("Supplier Invoice Exported by {0} {1} on {2}", currentApprover.FirstName, currentApprover.LastName, logTime), 0);
                if (poDetails.PurchaseOrderId != null && poDetails.POTypeId > 0)
                {
                    // Invoice with PO and insert audit log
                    string str = ((PurchaseOrderType)(int)poDetails.POTypeId).ToString();
                    AuditLog.Info(((PurchaseOrderType)(int)poDetails.POTypeId).ToString(), "sent for approval", userId.ToString(), poDetails.PurchaseOrderId.ToString(), "SendForApproval", string.Format("Purchase order Invoice : {0} Exported by {1} {2} on {3}", poDetails.InvoiceCode, currentApprover.FirstName, currentApprover.LastName, logTime), 0);
                }
            }
        }
        public Invoice[] exportBulkInovice(InvoiceList[] invoiceList, int userId, int companyId)
        {
            List<Invoice> lst = new List<Invoice>();
            foreach (var invoice in invoiceList)
            {
                lst.Add(GetExportInvoiceDetails(invoice.InvoiceId, invoice.InvoiceTypeId, invoice.POTypeId, userId, companyId));
            }
            return lst.ToArray();
        }
        public bool BulkExportUpdateLog(InvoiceList[] invoiceList, int userId, int companyId)
        {
            bool IsUpdated = false;
            try
            {
                foreach (var invoice in invoiceList)
                {
                    UpdateInvoiceExportAuditLog(invoice.InvoiceId, userId);
                }
            }
            catch (Exception)
            {
            }
            return IsUpdated;
        }

        public Byte[] exportInvoice(Invoice invoice)
        {
            string fileName = "Export file (inv)-" + invoice.InvoiceCode + DateTime.Now.ToString("dd/MMM/yyyy HHmmss");
            using (ExcelPackage excel = new ExcelPackage())
            {
                excel.Workbook.Worksheets.Add("Invoices");
                excel.Workbook.Worksheets.Add("Invoice_Details");
                excel.Workbook.Worksheets.Add("Invoice_Payment_Schedules");
                excel.Workbook.Worksheets.Add("Invoice_Optional_Fields");
                excel.Workbook.Worksheets.Add("Invoice_Detail_Optional_Fields");

                //Sheet 1
                var excelWorksheet = excel.Workbook.Worksheets["Invoices"];

                List<string[]> headerRow1 = new List<string[]>(){
                  new string[] { "CNTBTCH", "CNTITEM", "IDVEND", "IDINVC", "TEXTTRX", "ORDRNBR", "PONBR", "INVCDESC", "'INVCAPPLTO", "'IDACCTSET", "'DATEINVC", "'FISCYR", "'FISCPER", "'CODECURN", "'TERMCODE", "'DATEDUE", "'CODETAXGRP", "'TAXCLASS1", "'BASETAX1",
                  "'AMTTAX1","'AMTTAXDIST","'AMTINVCTOT","'AMTTOTDIST","'AMTGROSDST","'AMTDUE","'AMTTAXTOT","'AMTGROSTOT"}
                };
                string headerRange1 = "A1:" + Char.ConvertFromUtf32(headerRow1[0].Length + 64) + "1";
                excelWorksheet.Cells[headerRange1].LoadFromArrays(headerRow1);
                var cellData = new List<object[]>()
                 {
                      new object[] {1,1, invoice.Supplier.SupplierCode,invoice.InvoiceCode,"","",invoice.PurchaseOrderCode,invoice.InvoiceDescription,string.Empty,"account Set",
                      DateTime.Now.Month,DateTime.Now.Year,invoice.CurrencyCode,invoice.PaymentTerms,string.Empty,"Tax Group","Tax Class",invoice.TotalAmount - invoice.TotalTax,
                      invoice.TotalTax,invoice.TotalTax,invoice.TotalAmount - invoice.TotalTax,invoice.TotalAmount,invoice.TotalAmount,invoice.TotalTax,invoice.TotalAmount,
                      invoice.TotalTax,invoice.TotalAmount
                      },

                 };
                excelWorksheet.Cells[2, 1].LoadFromArrays(cellData);
                //End of sheet 1

                //Sheet 2
                var excelWorksheet2 = excel.Workbook.Worksheets["Invoice_Details"];
                List<string[]> headerRow2 = new List<string[]>(){
                  new string[] { "'CNTBTCH", "CNTITEM", "'CNTLINE", "'IDDIST", "'TEXTDESC", "'AMTTOTTAX", "'BASETAX1", "'TAXCLASS1", "'RATETAX1", "'AMTTAX1", "'IDGLACCT", "AMTDIST", "COMMENT", "SWIBT"}
                };
                string headerRange2 = "A1:" + Char.ConvertFromUtf32(headerRow1[0].Length + 64) + "1";
                excelWorksheet2.Cells[headerRange2].LoadFromArrays(headerRow2);
                List<object[]> ItemCellData = new List<object[]>();
                int itemCount = 20;
                foreach (InvoiceItems item in invoice.InvoiceItems)

                {
                    object[] itm = new object[] { 1, 1, itemCount, string.Empty, item.ItemDescription, item.TaxTotal, (item.Unitprice * item.ItemQty), item.TaxName, item.TaxID, item.TaxTotal, item.AccountCode, item.TaxTotal, string.Empty, string.Empty };
                    ItemCellData.Add(itm);
                    itemCount *= 2;
                }
                excelWorksheet2.Cells[2, 1].LoadFromArrays(ItemCellData);
                //End of sheet 2.

                //Sheet 3
                var excelWorksheet3 = excel.Workbook.Worksheets["Invoice_Payment_Schedules"];
                List<string[]> headerRow3 = new List<string[]>(){
                  new string[] { "'CNTBTCH", "CNTITEM", "''CNTPAYM", "'DATEDUE", "''AMTDUE"}
                };
                string headerRange3 = "A1:" + Char.ConvertFromUtf32(headerRow3[0].Length + 64) + "1";
                excelWorksheet3.Cells[headerRange3].LoadFromArrays(headerRow3);
                //End of Sheet 3

                //Sheet 4
                var excelWorksheet4 = excel.Workbook.Worksheets["Invoice_Optional_Fields"];
                List<string[]> headerRow4 = new List<string[]>(){
                  new string[] { "'CNTBTCH", "CNTITEM", "'OPTFIELD", "'VALUE", "'TYPE", "'LENGTH", "'DECIMALS", "'ALLOWNULL", "'VALIDATE", "'VALINDEX", "'VALIFTEXT", "'VALIFMONEY", "'VALIFNUM", "'VALIFLONG", "'VALIFBOOL", "'VALIFDATE", "'VALIFTIME", "'FDESC", "'VDESC" }
                };
                string headerRange4 = "A1:" + Char.ConvertFromUtf32(headerRow4[0].Length + 64) + "1";
                excelWorksheet4.Cells[headerRange4].LoadFromArrays(headerRow4);
                //End of Sheet4

                //Sheet 5
                var excelWorksheet5 = excel.Workbook.Worksheets["Invoice_Detail_Optional_Fields"];
                List<string[]> headerRow5 = new List<string[]>(){
                  new string[] { "'CNTBTCH", "CNTITEM", "'CNTLINE", "'OPTFIELD", "'VALUE", "'TYPE", "'LENGTH", "'DECIMALS", "'ALLOWNULL", "'VALIDATE", "'VALINDEX", "'VALIFTEXT", "'VALIFMONEY", "'VALIFNUM", "'VALIFLONG", "'VALIFBOOL", "'VALIFDATE", "'VALIFTIME", "'FDESC", "'VDESC"}
                };
                string headerRange5 = "A1:" + Char.ConvertFromUtf32(headerRow5[0].Length + 64) + "1";
                excelWorksheet5.Cells[headerRange5].LoadFromArrays(headerRow5);
                //End of Sheet5
                string filePath = HttpContext.Current.Server.MapPath("~/ExportedInvoices/" + fileName + ".xlsx");
                FileInfo excelFile = new FileInfo(filePath);
                excel.SaveAs(excelFile);
                return excel.GetAsByteArray();
                //ChangeInvoiceStatus(invoice.InvoiceId, Convert.ToInt32(WorkFlowStatus.Exported));
            }

        }

        public List<ContractPurchaseOrder> GetContractPOCs(string purchaseOrderId, int purchaseOrderTypeId)
        {
            //= @purchaseOrderId
            try
            {
                string contractQuery = @"select 
                                        CPO2.CPONumber as CPONo,
                                        CPO.CPOID, 
	                                    CPO.CPONumber,    
                                        CPO.PODate,
	                                    CPO.MasterCPOID,
                                        CPO.POTypeId,
                                        CPO.MasterCPOID
                                    from 
                                        dbo.ContractPurchaseOrder as CPO 
                                        join ContractPurchaseOrder as CPO2 
                                        on CPO2.CPOID=CPO.MasterCPOID
	                                    join dbo.PurchaseOrderTypes as POT
				                        on
				                    CPO.POTypeId = POT.PurchaseOrderTypeId
                                    where CPO.MasterCPOID in (select Data from dbo.Split(@purchaseOrderId,','))                                
                                    and
                                    CPO.IsDeleted = 0
                                    and
                                    (CPO.WorkFlowStatusId = 16 or CPO.WorkFlowStatusId = 4)
                                    and  CPO.CPOID NOT IN (SELECT GoodsReceivedNoteId FROM InvoiceGRN where IsDeleted=0 and POTypeId=@purchaseOrderTypeId);";

                contractQuery += @"      select  
                                            CPOI.CPOID, 
                                            CPOI.CPOItemid as RecordId,
                                            CPOI.Description,
                                            CPO.CPONumber, 
                                            CPOI.CPOItemid,
                                            CPOI.Amount,
                                            (CPO.TotalAmount - CPOI.Amount)as TotalTax,
                                            T.TaxName,
											T.TaxAmount,
                                            CPO.TaxId as TaxID,
                                            ac.AccountType,
                                            acc.AccountCodeName,
                                            ac.AccountCode as AccountCode, 
	                                        ac.AccountCodeId,
                                            CPO.WorkFlowStatusId
                                        from 
                                            dbo.ContractPurchaseOrder as CPO 
                                        join 
                                            dbo.ContractPurchaseOrderItems AS CPOI 
                                            on
                                            CPO.CPOID = CPOI.CPOID 
                                        left join
											dbo.Taxes as T
											on
											CPO.TaxID = t.TaxId
                                        LEFT JOIN AccountCode as ac    
                                            on CPOI.ExpenseCategoryId = ac.AccountCodeId
                                         LEFT JOIN AccountCodeCategory as acc
                                             on ac.AccountCodeCategoryId = acc.AccountCodeCategoryId
                                        where 
                                         CPO.MasterCPOID  in (select Data from dbo.Split(@purchaseOrderId,','))   
                                        and
                                        CPO.IsDeleted = 0
                                        and
                                        (CPO.WorkFlowStatusId = 16 or CPO.WorkFlowStatusId = 4)
                                         order by CPOI.CPOItemid asc";

                List<ContractPurchaseOrder> contactSubPOCs = new List<ContractPurchaseOrder>();

                //executing the stored procedure to get the list of  grns
                using (var result = this.m_dbconnection.QueryMultiple(contractQuery, new
                {
                    purchaseOrderId = purchaseOrderId,
                    purchaseOrderTypeId = purchaseOrderTypeId,
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.Approved)

                }, commandType: CommandType.Text))
                {
                    contactSubPOCs = result.Read<ContractPurchaseOrder>().ToList();
                    var contractItems = result.Read<ContractPurchaseOrderItems>().ToList();
                    if (contactSubPOCs != null)
                    {
                        contactSubPOCs.ForEach(data =>
                        {
                            data.ContractPurchaseOrderItems = contractItems.Where(j => j.CPOID == data.CPOID).ToList();
                        });
                    }
                }
                return contactSubPOCs;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public string GetInvoiceCode(int InvoiceId)
        {
            string InvoiceCode = null;
            //InvoiceCode= this.m_dbconnection.Query<string>("select InvoiceCode from Invoice where InvoiceId=" + InvoiceId, commandType: CommandType.Text).FirstOrDefault().ToString();
            //if(!InvoiceCode.Contains("-"))
            //{
            //    InvoiceCode = this.m_dbconnection.Query<string>("select DraftCode from Invoice where InvoiceId=" + InvoiceId, commandType: CommandType.Text).FirstOrDefault().ToString();
            //}
            InvoiceCode = this.m_dbconnection.Query<string>("select (case  when  charindex('-', InvoiceCode) > 0  then  InvoiceCode  ELSE DraftCode end) from Invoice where InvoiceId=" + InvoiceId, commandType: CommandType.Text).FirstOrDefault().ToString();
            return InvoiceCode;
        }


        public int RecallInvoiceApproval(Invoice invoice)
        {
            try
            {
                var result = this.m_dbconnection.Execute("Invoice_CRUD", new
                {
                    Action = "RECALLPOAPPROVAL",
                    InvoiceId = invoice.InvoiceId,
                    PurchaseOrderId = invoice.PurchaseOrderId,
                    POTypeId = invoice.POTypeId,
                    CreatedBy = invoice.CreatedBy,
                    CreatedDate = DateTime.Now,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.CancelledApproval)
                }, commandType: CommandType.StoredProcedure);

                UserProfile sender = new UserProfileRepository().GetUserById(invoice.CurrentApproverUserId);
                UserProfile requestor = new UserProfileRepository().GetUserById(invoice.CreatedBy);
                CompanyDetails company = GetCompanyDetails(invoice.CompanyId);
                invoice.CreatedByUserName = requestor.FirstName + " " + requestor.LastName;
                var mailStatus = Util.Email.InvoiceEmailProvider.SendInvoiceRecallApprovalMail(new Invoice()
                {
                    InvoiceCode = invoice.InvoiceCode,
                    PurchaseOrderCode = invoice.PurchaseOrderCode,
                    PurchaseOrderType = invoice.PurchaseOrderType,
                    SupplierName = invoice.Supplier.SupplierName,
                    TotalAmount = invoice.TotalAmount,
                    CreatedDate = invoice.CreatedDate,
                    CurrentApproverUserName = invoice.CurrentApproverUserName,
                    CreatedByUserName = invoice.CreatedByUserName,
                    ApproverEmail = sender.EmailId,
                    CurrencySymbol = invoice.CurrencySymbol,
                    WorkFlowStatus = invoice.WorkFlowStatus
                }, company.CompanyShortName, invoice.Supplier.SupplierShortName, invoice.InvoiceStatusText);
                AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "Recall Approval", invoice.CreatedBy.ToString(), invoice.InvoiceId.ToString(), "RecallPoApproval", string.Format("Supplier Invoice Cancelled Approval by {0} {1} on {2}", requestor.FirstName, requestor.LastName, DateTime.Now), invoice.CompanyId);
                AuditLog.Info("Invoice", "Recall Approval", invoice.CreatedBy.ToString(), invoice.InvoiceId.ToString(), "RecallPoApproval", "Supplier Invoice " + GetInvoiceCode(invoice.InvoiceId) + " recalled by " + invoice.CreatedByUserName, invoice.CompanyId);
                #region inserting record in notification
                try
                {
                    NotificationsRepository notificationObj = new NotificationsRepository();
                    notificationObj.CreateNotification(new Notifications()
                    {
                        NotificationId = 0,
                        NotificationType = SharedRepository.GetNotificationType(Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice)),
                        NotificationMessage = SharedRepository.GetNotificationMessage(Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice)) + " has been recalled",
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                        ProcessName = "",
                        DocumentId = invoice.InvoiceId,
                        UserId = invoice.CurrentApproverUserId,
                        IsRead = false,
                        CreatedBy = invoice.CreatedBy,
                        CreatedDate = DateTime.Now,
                        IsNew = true,
                        CompanyId = invoice.CompanyId,
                        CompanyName = "",
                        IsforAll = false,
                        MessageType = Convert.ToInt32(NotificationMessageTypes.Requested),
                        DocumentCode = invoice.InvoiceCode
                    });
                }
                catch (Exception e)
                {
                    throw e;
                }
                #endregion
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public InvoiceDisplayResult SearchInvoice(InvoiceSearch invoiceSearch)
        {
            try
            {
                InvoiceDisplayResult objInvoiceDisplayResult = new InvoiceDisplayResult();

                string whereCondition = @" from dbo.Invoice Inv
				                            join Supplier S on Inv.Supplierid = S.SupplierId
				                            join WorkFlowStatus as WF on inv.WorkFlowStatusId = WF.WorkFlowStatusId
				                            join dbo.UserProfile as UP on Inv.CreatedBy = UP.UserID
				                            where
					                            Inv.IsDeleted = 0 ";
                if (invoiceSearch.CompanyId > 0)
                {
                    whereCondition = $"{ whereCondition } and Inv.CompanyId=@CompanyId ";
                }
                if (invoiceSearch.IsApprovalPage == true)
                {
                    whereCondition = $"{ whereCondition } and Inv.InvoiceId in ( SELECT * FROM  dbo.GetWorkFlowDocuments(@UserId, @ProcessId) )";
                }

                if (invoiceSearch.InvoiceId > 0)
                {
                    whereCondition = $"{ whereCondition } and Inv.InvoiceId = @InvoiceId ";
                }
                if (invoiceSearch.RequestFromUserId > 0)
                {
                    whereCondition = $"{ whereCondition } and CreatedBy = @RequestFromUserId ";
                }
                if (invoiceSearch.Search != null && invoiceSearch.Search != "null")
                {
                    whereCondition = $"{ whereCondition } and (Inv.InvoiceCode LIKE CONCAT( '%',@Search,'%') " +
                                                                $"OR UP.FirstName LIKE CONCAT( '%',@Search,'%') " +
                                                                $"OR WF.Statustext LIKE CONCAT( '%',@Search,'%')" +
                                                                $"OR Inv.InvoiceId LIKE CONCAT( '%',@Search,'%')" +
                                                                $"OR Inv.DraftCode LIKE CONCAT( '%',@Search,'%')) ";
                }
                string itemsQuery = @"	select 
					                    Inv.InvoiceId,
					                    Inv.InvoiceCode,
				                        Inv.DraftCode,
                                        Inv.POTypeId,
					                    Inv.InvoiceTypeId,
				                        Inv.TotalAmount,
				                        Inv.WorkFlowStatusId,
					                    WF.IsApproved as IsDocumentApproved,					                    
					                    UP.FirstName as RequestedByUserName,
					                    WF.Statustext as WorkFlowStatusText,    
                                        S.SupplierName";

                itemsQuery = $"{ itemsQuery } { whereCondition } order by Inv.UpdatedDate desc OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY; ";

                itemsQuery = $"{ itemsQuery } select count(*) { whereCondition } ";

                using (var result = this.m_dbconnection.QueryMultiple(itemsQuery, new
                {
                    Action = "SELECT",
                    Skip = invoiceSearch.Skip,
                    Take = invoiceSearch.Take,
                    UserId = invoiceSearch.UserId,
                    Search = invoiceSearch.Search,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                    InvoiceId = invoiceSearch.InvoiceId,
                    RequestFromUserId = invoiceSearch.RequestFromUserId,
                    CompanyId = invoiceSearch.CompanyId
                }, commandType: CommandType.Text))
                {
                    objInvoiceDisplayResult.Invoice = result.Read<InvoiceList>().AsList();
                    foreach (InvoiceList inv in objInvoiceDisplayResult.Invoice)
                    {
                        if ((inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed)) || (inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)))
                        {
                            inv.WorkFlowStatusText = "Open";
                        }
                    }
                    objInvoiceDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return objInvoiceDisplayResult;
            }
            catch (Exception e)
            {

                throw e;
            }
        }


        public int UpdateRemarksInvoice(InvoiceVoid invoice)
        {
            try
            {
                int AuditTrailId = 0;
                this.m_dbconnection.Open();

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    AuditTrailId = transactionObj.Connection.QueryFirstOrDefault<int>("WorkFlowAuditTrail_CRUD", new
                    {
                        Action = "INSERT",
                        DocumentId = invoice.InvoiceId,
                        ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                        Remarks = invoice.Reasons,
                        StatusId = invoice.StatusId,
                        UserId = invoice.UserId
                    },
                         transaction: transactionObj,
                         commandType: CommandType.StoredProcedure);

                    #region inserting record in notification
                    try
                    {
                        NotificationsRepository notificationObj = new NotificationsRepository();
                        notificationObj.CreateNotification(new Notifications()
                        {
                            NotificationId = 0,
                            NotificationType = SharedRepository.GetNotificationType(Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice)),
                            NotificationMessage = SharedRepository.GetNotificationMessage(Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice)),
                            ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                            ProcessName = "",
                            DocumentId = invoice.InvoiceId,
                            UserId = invoice.UserId,
                            IsRead = false,
                            CreatedBy = invoice.UserId,
                            CreatedDate = DateTime.Now,
                            IsNew = true,
                            CompanyId = invoice.CompanyId,
                            CompanyName = "",
                            IsforAll = false,
                            MessageType = Convert.ToInt32(NotificationMessageTypes.SentMessage),
                            DocumentCode = invoice.InvoiceCode
                        });




                    }
                    catch (Exception e)
                    {
                        throw e;
                    }

                    #endregion



                    transactionObj.Commit();
                    return AuditTrailId;
                }

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdateInvoiceType(int invoiceId)
        {
            try
            {
                int InvoiceTypeId = 0;
                this.m_dbconnection.Open();

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    InvoiceTypeId = transactionObj.Connection.QueryFirstOrDefault<int>("Invoice_CRUD", new
                    {
                        Action = "INVOICETYPE",
                        InvoiceId = invoiceId,
                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                    transactionObj.Commit();
                    return InvoiceTypeId;
                }

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int GetInvoicePOType(int invoiceId)
        {
            try
            {
                int InvoiceTypeId = 0;
                this.m_dbconnection.Open();

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    InvoiceTypeId = transactionObj.Connection.QueryFirstOrDefault<int>("Invoice_CRUD", new
                    {
                        Action = "INVOICEPOTYPE",
                        InvoiceId = invoiceId,
                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                    transactionObj.Commit();
                    return InvoiceTypeId;
                }

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public InvoiceDisplayResult GetFilterSIC(SINVFilterDisplayInput sICFilterDisplayInput)
        {
            try
            {
                InvoiceDisplayResult InvoiceDisplayResult = new InvoiceDisplayResult();
                string supplierInvoiceQuery = "";

                supplierInvoiceQuery = "(select Inv.InvoiceId,Inv.POTypeId,Inv.DraftCode,Inv.InvoiceCode,Inv.InvoiceTypeId,Inv.TotalAmount,Inv.CreatedDate, " +
                                          "Inv.WorkFlowStatusId,  WF.Statustext as WorkFlowStatusText,  S.SupplierName " +
                                                  "from " +
                                                  "dbo.Invoice as Inv " +
                                                  "join dbo.Supplier as S " +
                                                  "on " +
                                                  "S.SupplierId = Inv.Supplierid " + "join dbo.WorkFlowStatus as WF " + "on " + "Inv.WorkFlowStatusId = WF.WorkFlowStatusId " +
                                                   "where ";
                if (sICFilterDisplayInput.SupplierNameFilter != "" && sICFilterDisplayInput.SupplierNameFilter != null)
                {
                    supplierInvoiceQuery += "( " +
                                                    "S.SupplierName LIKE concat('%',@SupplierNameFilter,'%') " +
                                                    ") " +
                                                    "and ";
                }
                if (sICFilterDisplayInput.SINVCodeFilter != "" && sICFilterDisplayInput.SINVCodeFilter != null)
                {
                    supplierInvoiceQuery += "( " +
                                                    "Inv.InvoiceCode  LIKE concat('%',@SINVCodeFilter,'%') " +
                                                ") " +
                                                "and ";
                }
                if (sICFilterDisplayInput.PoNumberFilter != "" && sICFilterDisplayInput.PoNumberFilter != null)
                {
                    supplierInvoiceQuery += "( " +
                                                    "Inv.PurchaseOrderCode  LIKE concat('%',@PoNumberFilter,'%') " +
                                                ") " +
                                                "and ";
                }
                if (sICFilterDisplayInput.StatusFilter != "" && sICFilterDisplayInput.StatusFilter != null)
                {
                    supplierInvoiceQuery += "( " +
                                                    "WF.Statustext   LIKE concat('%',@StatusFilter,'%') " +
                                                ") " +
                                                "and ";
                }
                if (sICFilterDisplayInput.PoTypeIdFilter != "" && sICFilterDisplayInput.PoTypeIdFilter != null)
                {
                    supplierInvoiceQuery += "( " +
                                                    "Inv.POTypeId   LIKE concat('%',@PoTypeIdFilter,'%') " +
                                                ") " +
                                                "and ";
                }
                if (sICFilterDisplayInput.FromDateFilter != null && sICFilterDisplayInput.ToDateFilter != null)
                {
                    supplierInvoiceQuery += "( " +
                                                    "Inv.CreatedDate between @FromDateFilter and @ToDateFilter " +
                                                ") " +
                                                "and ";
                }

                supplierInvoiceQuery += " Inv.Isdeleted = 0 and Inv.CompanyId=@companyId and Inv.LocationID in ( select DepartmentId from usercompanydepartments where userId=@userId and CompanyId=@CompanyId) )";

                string SupplierInvoiceSearchResultQuery = " select * from " +
                                                   " ( ";
                SupplierInvoiceSearchResultQuery += supplierInvoiceQuery;

                SupplierInvoiceSearchResultQuery += " ) as Inv ";
                SupplierInvoiceSearchResultQuery += " order by ";
                SupplierInvoiceSearchResultQuery += " Inv.CreatedDate desc ";


                if (sICFilterDisplayInput.Take > 0)
                {
                    SupplierInvoiceSearchResultQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ";
                    SupplierInvoiceSearchResultQuery += " select COUNT(*) from ( ";
                    SupplierInvoiceSearchResultQuery += supplierInvoiceQuery;

                    SupplierInvoiceSearchResultQuery += " ) as Inv ";
                }



                using (var result = this.m_dbconnection.QueryMultiple(SupplierInvoiceSearchResultQuery, new
                {
                    Action = "FILTER",
                    PoNumberFilter = sICFilterDisplayInput.PoNumberFilter,
                    SINVCodeFilter = sICFilterDisplayInput.SINVCodeFilter,
                    StatusFilter = sICFilterDisplayInput.StatusFilter,
                    FromDateFilter = sICFilterDisplayInput.FromDateFilter,
                    ToDateFilter = sICFilterDisplayInput.ToDateFilter,
                    SupplierNameFilter = sICFilterDisplayInput.SupplierNameFilter,
                    PoTypeIdFilter = sICFilterDisplayInput.PoTypeIdFilter,
                    Skip = sICFilterDisplayInput.Skip,
                    Take = sICFilterDisplayInput.Take,
                    CompanyId = sICFilterDisplayInput.CompanyId,
                    userid = sICFilterDisplayInput.UserId
                }, commandType: CommandType.Text))
                {
                    InvoiceDisplayResult.Invoice = result.Read<InvoiceList>().AsList();
                    foreach (InvoiceList inv in InvoiceDisplayResult.Invoice)
                    {
                        if ((inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed)) || (inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)))
                        {
                            inv.WorkFlowStatusText = "Open";
                        }
                    }
                    InvoiceDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();


                }
                return InvoiceDisplayResult;

            }
            catch (Exception e)
            {

                throw e;
            }
        }

        public int Getsupplierdetails(int supplierId, int purchaseOrderId)
        {
            try
            {
                int status = 0;
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {

                    status = transactionObj.Connection.QueryFirstOrDefault<int>("Invoice_CRUD", new
                    {
                        Action = "GETSUPPLIER",
                        SupplierId = supplierId,
                        PurchaseOrderId = purchaseOrderId
                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                    transactionObj.Commit();
                    return status;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<GoodsReceivedNotes> GetGRNCountByPurchaseOrder(int purchaseOrderId, int purchaseOrderTypeId)
        {
            try
            {
                string grnQuery = @"select 
	                                    GRN.GRNCode,
                                        GRN.SupplierDoNumber, 
	                                    GRN.GoodsReceivedNoteId,
                                        GRN.PONO
                                    from 
                                        dbo.GoodsReceivedNote as GRN 
                                    where 
                                    PurchaseOrderId in (select Data from dbo.Split(@purchaseOrderId,','))
                                    and POTypeId =@purchaseOrderTypeId
                                    and
                                    IsDeleted = 0
                                    and
                                    WorkFlowStatusId = @WorkFlowStatusId
                                    and
                                    IsReturn = 0 AND GRN.GoodsReceivedNoteId NOT IN (SELECT GoodsReceivedNoteId FROM InvoiceGRN);";



                List<GoodsReceivedNotes> grnNotes = new List<GoodsReceivedNotes>();

                //executing the stored procedure to get the list of  grns
                using (var result = this.m_dbconnection.QueryMultiple(grnQuery, new
                {
                    purchaseOrderId = purchaseOrderId,
                    purchaseOrderTypeId = purchaseOrderTypeId,
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.Completed)

                }, commandType: CommandType.Text))
                {
                    grnNotes = result.Read<GoodsReceivedNotes>().ToList();
                }
                return grnNotes;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public Invoice GetExportInvoiceDetails(int invoiceId, int invoiceTypeId, int? poTypeId, int userId, int companyId)
        {
            try
            {
                Invoice invoiceDetailsObj = new Invoice();
                //executing the stored procedure to get the list of Invoice
                using (var result = this.m_dbconnection.QueryMultiple("USP_ExportBulkInvoice", new
                {

                    Action = "SELECTBYID",
                    InvoiceId = invoiceId,
                    InvoiceTypeId = invoiceTypeId,
                    ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                    PoTypeId = poTypeId,
                    WorkFlowStatusId = Convert.ToInt32(WorkFlowStatus.Exported),
                    CreatedBy = userId,
                    companyId = companyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //Invoice  details..
                    invoiceDetailsObj = result.Read<Invoice, Suppliers, SupplierSubCode, Invoice>((Inv, Su, Ssc) =>
                    {
                        if ((Inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Completed)) || (Inv.WorkFlowStatusId == Convert.ToInt32(WorkFlowStatus.Approved)))
                        {
                            Inv.WorkFlowStatus = "Open";
                        }
                        Inv.Supplier = Su;
                        Inv.SupplierSubCode = Ssc;
                        return Inv;
                    }, splitOn: "SupplierId, SubCodeId").FirstOrDefault();

                    if (invoiceDetailsObj != null)
                    {

                        invoiceDetailsObj.InvoiceItems = result.Read<InvoiceItems, GetItemMasters, AccountCode, InvoiceItems>((Pc, IM, Ac) =>
                        {
                            if (IM != null && IM.ItemMasterId > 0)
                            {
                                Pc.Item = IM;
                            }
                            else
                            {
                                Pc.Item = new GetItemMasters() { ItemMasterId = 0, ItemName = Pc.ServiceText };
                            }

                            if ((Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Item)) && Pc.ItemType == "item")
                            {
                                Pc.ItemType = "Item";
                            }
                            if (Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Service) && (poTypeId == 1 || poTypeId == 2))
                            {
                                Pc.ItemType = "Service";
                            }
                            if (Pc.TypeId == Convert.ToInt32(PurchaseItemTypes.Service) && (poTypeId == 3))
                            {
                                Pc.ItemType = Pc.AccountCodeName;
                            }

                            if (Ac != null && Ac.AccountCodeId > 0)
                            {
                                Pc.Service = Ac;
                            }
                            else
                            {
                                Pc.Service = new AccountCode() { AccountCodeId = 0, Description = "" };
                            }
                            return Pc;
                        }, splitOn: "ItemMasterId, AccountCodeId").ToList();
                        invoiceDetailsObj.InvoiceItems.ForEach(Pc =>
                        {
                            if (invoiceDetailsObj.IsGstBeforeDiscount == true)
                            {
                                Pc.TaxTotal = (((Pc.Unitprice * Pc.ItemQty)) * Pc.TaxAmount / 100);
                            }
                            else
                            {
                                Pc.TaxTotal = (((Pc.Unitprice * Pc.ItemQty) - Pc.Discount) * Pc.TaxAmount / 100);
                            }
                            Pc.ItemTotalPrice = (Pc.Unitprice * Pc.ItemQty) + Pc.TaxTotal - Pc.Discount;
                            Pc.CurrentTaxTotal = Pc.TaxTotal;
                            Pc.CurrentTaxAmount = Pc.TaxAmount;
                        });

                        decimal subTotal = 0;
                        if (invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                        {
                            var Total = invoiceDetailsObj.InvoiceItems.Sum(i => i.Unitprice);
                            subTotal = Total;
                        }
                        else
                        {
                            var Total = invoiceDetailsObj.InvoiceItems.Sum(i => i.ItemTotalPrice);
                            subTotal = Total;
                        }
                        var totalTax = invoiceDetailsObj.InvoiceItems.Sum(i => i.TaxTotal);
                        invoiceDetailsObj.SubTotal = subTotal;
                        if (invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || invoiceDetailsObj.POTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                        {
                            invoiceDetailsObj.TotalTax = (invoiceDetailsObj.SubTotal - invoiceDetailsObj.Discount) * invoiceDetailsObj.TaxRate / 100;
                        }
                        else
                        {
                            invoiceDetailsObj.TotalTax = totalTax;
                        }

                        if (poTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo) || poTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo) || poTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                        {
                            invoiceDetailsObj.NetTotal = (subTotal) + invoiceDetailsObj.ShippingCharges + invoiceDetailsObj.OtherCharges + invoiceDetailsObj.GSTAdjustment;
                        }
                        else if (invoiceTypeId == 2)
                        {
                            invoiceDetailsObj.NetTotal = (subTotal) + invoiceDetailsObj.ShippingCharges + invoiceDetailsObj.OtherCharges + invoiceDetailsObj.GSTAdjustment;
                        }
                        else
                        {
                            invoiceDetailsObj.NetTotal = (subTotal - invoiceDetailsObj.Discount) + invoiceDetailsObj.ShippingCharges + invoiceDetailsObj.OtherCharges + invoiceDetailsObj.GSTAdjustment + invoiceDetailsObj.TotalTax;
                        }
                        invoiceDetailsObj.TotalAmount = invoiceDetailsObj.NetTotal + invoiceDetailsObj.Adjustment;
                        if (invoiceDetailsObj.InvoiceDate != null && invoiceDetailsObj.NoOfDays > 0)
                        {
                            invoiceDetailsObj.DueDate = invoiceDetailsObj.InvoiceDate.AddDays(invoiceDetailsObj.NoOfDays);
                            invoiceDetailsObj.DueDateString = invoiceDetailsObj.DueDate.ToString("dd-MM-yyyy");
                        }
                        invoiceDetailsObj.SelectedGRNs = result.Read<GoodsReceivedNotes>().ToArray();
                        if (invoiceTypeId == 1 && poTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoFixed) || poTypeId == Convert.ToInt32(PurchaseOrderType.ContractPoVariable))
                        {
                            invoiceDetailsObj.SelectedCPOs = result.Read<ContractPurchaseOrder>().ToArray();
                            invoiceDetailsObj.CPOSelected = result.Read<ContractPurchaseOrderItems>().ToArray();
                            ContractPurchaseOrderRepository repository = new ContractPurchaseOrderRepository();
                            invoiceDetailsObj.JVs = new List<ContractPurchaseOrder>();
                            foreach (var CPO in invoiceDetailsObj.SelectedCPOs)
                            {
                                if (CPO.IsCPOAccrued)
                                    invoiceDetailsObj.JVs.Add(repository.GetContractPurchaseOrderDetails(CPO.CPOID.ToString()));
                            }
                        }
                        if (poTypeId == Convert.ToInt32(PurchaseOrderType.InventoryPo) || poTypeId == Convert.ToInt32(PurchaseOrderType.FixedAssetPo) || poTypeId == Convert.ToInt32(PurchaseOrderType.ExpensePo))
                        {
                            invoiceDetailsObj.SelectedPOs = result.Read<PurchaseOrderList>().ToArray();
                            if (invoiceDetailsObj.SelectedPOs.Length > 0)
                            {
                                invoiceDetailsObj.PurchaseOrderCode = "";
                                invoiceDetailsObj.PurchaseOrderId = "";
                                foreach (var record in invoiceDetailsObj.SelectedPOs)
                                {
                                    invoiceDetailsObj.PurchaseOrderCode += record.PurchaseOrderCode + ", ";
                                    invoiceDetailsObj.PurchaseOrderId += record.PurchaseOrderId + ", ";
                                }
                                invoiceDetailsObj.PurchaseOrderCode = invoiceDetailsObj.PurchaseOrderCode.Remove(invoiceDetailsObj.PurchaseOrderCode.Length - 2);
                                invoiceDetailsObj.PurchaseOrderId = invoiceDetailsObj.PurchaseOrderId.Remove(invoiceDetailsObj.PurchaseOrderId.Length - 2);
                            }
                        }
                        UserProfile userProfile = result.Read<UserProfile>().FirstOrDefault();
                        if (userProfile != null)
                        {
                            invoiceDetailsObj.CurrentApproverUserId = userProfile.UserID;
                            invoiceDetailsObj.CurrentApproverUserName = userProfile.UserName;
                        }

                        //comments
                        invoiceDetailsObj.WorkFlowComments = new List<WorkflowAuditTrail>();
                        invoiceDetailsObj.WorkFlowComments = new WorkflowAuditTrailRepository().GetWorkFlowAuditTrialDetails(new WorkflowAuditTrail()
                        {
                            Documentid = invoiceDetailsObj.InvoiceId,
                            ProcessId = Convert.ToInt32(WorkFlowProcessTypes.SupplierInvoice),
                            DocumentUserId = invoiceDetailsObj.CreatedBy,
                            UserId = Convert.ToInt32(invoiceDetailsObj.CreatedBy)
                        }).ToList();

                        var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                        {
                            Action = "SELECT",
                            RecordId = invoiceId,
                            AttachmentTypeId = Convert.ToInt32(AttachmentType.Invoice) //static value need to change
                        }, commandType: CommandType.StoredProcedure);
                        invoiceDetailsObj.Attachments = attachments.ToList();

                        var retrievesubTotal = this.m_dbconnection.Query<decimal>("Invoice_CRUD", new
                        {
                            Action = "RETREIVESUBTOTAL",
                            //InvoiceId=invoiceId,
                            POTypeId = invoiceDetailsObj.POTypeId,
                            PurchaseOrderId = invoiceDetailsObj.PurchaseOrderId,
                            CompanyId = invoiceDetailsObj.CompanyId
                        }, commandType: CommandType.StoredProcedure);
                        invoiceDetailsObj.SubTotalAmount = retrievesubTotal.FirstOrDefault();


                    }
                    AuditLog.Info("Invoice", "Export Invoice", userId.ToString(), invoiceId.ToString(), "Export Invoice", invoiceId.ToString(), companyId);
                    return invoiceDetailsObj;
                }
            }
            catch (Exception e)
            {
                AuditLog.ErrorLog("Invoice", "Export Invoice", userId.ToString(), e.Message.ToString(), invoiceId.ToString(), "Export Invoice Bulk Items", e.Message.ToString(), companyId);
                throw e;
            }
        }

        public int CancelDraftInvoice(InvoiceVoid invoice)
        {
            try
            {
                var result = this.m_dbconnection.Execute("Invoice_CRUD", new
                {
                    Action = "CancelDraft",
                    InvoiceId = invoice.InvoiceId,
                    WorkFlowStatusId = WorkFlowStatus.CancelDraft,
                }, commandType: CommandType.StoredProcedure);

                if (invoice.SelectedGRNs != null)
                {
                    foreach (var GRN in invoice.SelectedGRNs)
                    {
                        int statusUpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "DELETEINVOICEGRN",
                            GoodsReceivedNoteId = GRN.GoodsReceivedNoteId,
                            POTypeId = invoice.POTypeId
                        },
                        commandType: CommandType.StoredProcedure);

                        int UpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "UPDATEINVOICEGRNREJECT",
                            GoodsReceivedNoteId = GRN.GoodsReceivedNoteId,
                            POTypeId = invoice.POTypeId
                        },
                        commandType: CommandType.StoredProcedure);
                    }
                }

                if (invoice.SelectedCPOs != null)
                {
                    foreach (var cpo in invoice.SelectedCPOs)
                    {
                        int statusUpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "DELETEINVOICEGRN",
                            GoodsReceivedNoteId = cpo.CPOID,
                            POTypeId = invoice.POTypeId
                        },
                        commandType: CommandType.StoredProcedure);

                        int UpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "UPDATEINVOICECPOREJECT",
                            CPOID = cpo.CPOID,
                            POTypeId = invoice.POTypeId
                        },
                            commandType: CommandType.StoredProcedure);
                    }
                }


                if (invoice.SelectedPOs != null)
                {
                    foreach (var po in invoice.SelectedPOs)
                    {
                        int statusUpdateResult = this.m_dbconnection.Execute("Invoice_CRUD", new
                        {
                            Action = "DELETEINVOICEPOs",
                            InvoiceId = invoice.InvoiceId,
                            PurchaseOrderId = po.PurchaseOrderId,
                            POTypeId = po.POTypeId,
                        },
                        commandType: CommandType.StoredProcedure);
                    }
                }

                UserProfileRepository userProfileRepository = new UserProfileRepository();
                UserProfile user = userProfileRepository.GetUserById(invoice.UserId);
                string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                DateTime now = DateTime.Now;
                AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "Cancel Draft", invoice.UserId.ToString(), invoice.InvoiceId.ToString(), "Cancel Draft", string.Format("Cancelled draft by {0} on {1}", UserName, now), invoice.CompanyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int SaveInvoiceGlcode(InvoiceGlCode invoiceglcode)
        {
            try
            {
                this.m_dbconnection.Open();

                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        int insertGlcode = transactionObj.Connection.Execute("Ips_Sp_SaveInvoiceGlCode", new
                        {
                            InvoiceId = invoiceglcode.InvoiceId,
                            InvoiceItemId = invoiceglcode.InvoiceItemId,
                            TypeId = invoiceglcode.TypeId,
                            PoTypeId = invoiceglcode.PoTypeId,
                            ItemMasterId = invoiceglcode.ItemMasterId,
                            InvoiceTypeId = invoiceglcode.InvoiceTypeId

                        },
                                       transaction: transactionObj,
                                       commandType: CommandType.StoredProcedure);
                        transactionObj.Commit();

                        if (invoiceglcode.CurrentUserId > 0)
                        {
                            UserProfileRepository userProfileRepository = new UserProfileRepository();
                            var user = userProfileRepository.GetUserById(invoiceglcode.CurrentUserId);
                            string UserName = string.Format("{0} {1}", user.FirstName, user.LastName);
                            DateTime now = DateTime.Now;

                            AuditLog.Info(WorkFlowProcessTypes.SupplierInvoice.ToString(), "create", invoiceglcode.CurrentUserId.ToString(), invoiceglcode.InvoiceId.ToString(), "SaveGLCode", "GL code changed by " + UserName + " on " + now + "");
                        }
                        return insertGlcode;
                    }

                    catch (Exception e)
                    {
                        throw e;

                    }
                }

            }

            catch (Exception e)
            {
                throw e;

            }

        }


        public byte[] SupplierInvoicePrint(int InvoiceId, int InvoiceTypeId, int POTypeId, int companyId)
        {
            try
            {
                var result = GetSupplierInvoicePDFTemplate(InvoiceId, InvoiceTypeId, POTypeId, companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetSupplierInvoicePDFTemplate(int InvoiceId, int InvoiceTypeId, int POTypeId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                Invoice supplierInvoiceDetails = null;
                AuditLogRepository auditLogRepository = null;
                PaymentRepository paymentRepository = null;


                var InvoiceDetails = GetInvoiceDetails(InvoiceId, InvoiceTypeId, POTypeId, companyId);
                paymentRepository = new PaymentRepository();
                InvoiceDetails.InvoicePayments = paymentRepository.GetPaymentDetails(InvoiceId, companyId, (int)WorkFlowProcessTypes.SupplierInvoice);

                auditLogRepository = new AuditLogRepository();
                AuditLogSearch auditLogData = new AuditLogSearch();
                auditLogData.PageName = "SupplierInvoice";
                auditLogData.DocumentId = InvoiceId;
                var auditTrailData = auditLogRepository.GetAuditLogsByDocumentId(auditLogData);

                var companyDetails = GetCompanyDetails(companyId);
                pdfGeneratorObj = new PdfGenerator();
                InvoiceDetails.AuditLogData = auditTrailData;
                var result = pdfGeneratorObj.GetSupplierInvoicePDFTemplate(InvoiceDetails, companyDetails, null);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private CompanyDetails GetCompanyDetails(int companyId)
        {
            sharedRepositoryObj = new SharedRepository();
            return sharedRepositoryObj.GetCompanyDetails(companyId);
        }

        public int VerifyInvoice(Invoice invoice)
        {
            int returnValue = 0;
            this.m_dbconnection.Open();
            Invoice _oldInvoice = GetInvoiceDetails(invoice.InvoiceId, invoice.InvoiceTypeId, invoice.POTypeId, invoice.CompanyId);
            using (var transaction = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    //int updateResult = transactionObj.Connection.Execute("Invoice_CRUD", new
                    //{
                    //    Action = "VERIFY_INVOICE",
                    //    SupplierAddress = invoice.SupplierAddress

                    //}, transaction: transactionObj, commandType: CommandType.StoredProcedure);
                    this.sharedRepositoryObj = new SharedRepository();
                    this.sharedRepositoryObj.PostDocumentAddress(new DocumentAddress
                    {
                        Address = invoice.SupplierAddress,
                        CompanyId = invoice.CompanyId,
                        DocumentId = invoice.InvoiceId,
                        ProcessId = (int)WorkFlowProcessTypes.SupplierInvoice
                    }, transaction);
                    WorkFlowApproval document = new WorkFlowApproval
                    {
                        CompanyId = invoice.CompanyId,
                        ProcessId = (int)WorkFlowProcessTypes.SupplierInvoice,
                        DocumentId = invoice.InvoiceId,
                        UserId = Convert.ToInt32(invoice.UpdatedBy)
                    };
                    this.auditlogRepository = new AuditLogRepository();
                    this.auditlogRepository.LogVerifyDocument(_oldInvoice, invoice, document, transaction, this.m_dbconnection);
                    transaction.Commit();
                }
                catch (Exception)
                {
                    transaction.Rollback();
                }
            }
            return returnValue;
        }
    }
}




