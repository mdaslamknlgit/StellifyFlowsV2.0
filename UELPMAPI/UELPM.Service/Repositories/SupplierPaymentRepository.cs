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
using UELPM.Util.PdfGenerator;

namespace UELPM.Service.Repositories
{
    public class SupplierPaymentRepository : ISupplierPaymentRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;
        public IEnumerable<Suppliers> GetAllSuppliersinSupplierPayment(string searchKey, int supplierTypeId,int companyId)
        {
            try
            {
                return this.m_dbconnection.Query<Suppliers>("usp_GetSuppliers", new
                {

                    SearchKey = searchKey,
                    SupplierTypeId = supplierTypeId,
                    CompanyId=companyId
                }, commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public SupplierPaymentDisplayResult GetSupplierPayment(GridDisplayInput supplierPaymentInput)
        {
            try
            {
                SupplierPaymentDisplayResult supplierPaymentDisplayResult = new SupplierPaymentDisplayResult();
                //executing the stored procedure to get the list of supplier Payment
                using (var result = this.m_dbconnection.QueryMultiple("SupplierPayment_CRUD", new
                {
                    Action = "SELECT",
                    Search = supplierPaymentInput.Search,
                    Skip = supplierPaymentInput.Skip,
                    Take = supplierPaymentInput.Take,
                    CompanyId=supplierPaymentInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of supplier Payment..
                    supplierPaymentDisplayResult.SupplierPayment = result.Read<SupplierPaymentList>().GroupBy(i => i.SupplierPaymentId).Select(j => new SupplierPaymentList
                    {
                        SupplierPaymentId = j.Select(i => i.SupplierPaymentId).FirstOrDefault(),
                        SupplierId = j.Select(i => i.SupplierId).FirstOrDefault(),
                        SupplierPaymentCode = j.Select(i => i.SupplierPaymentCode).FirstOrDefault(),
                        SupplierName = j.Select(i => i.SupplierName).FirstOrDefault(),
                        InvoiceCode = String.Join(",", j.Select(i => i.InvoiceCode).ToList())
                    }).ToList();

                    //total number of supplier Payment
                    supplierPaymentDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return supplierPaymentDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public SupplierPayment GetEditSupplierPaymentDetails(int SupplierPaymentId, int SupplierId)
        {
            SupplierPayment supplierPaymentDetailsDetailsObj = new SupplierPayment();
            //executing the stored procedure to get the list of supplier payment
            try
            {
                this.m_dbconnection.Open();
                using (var result = this.m_dbconnection.QueryMultiple("SupplierPayment_CRUD", new
                {

                    Action = "EDIT",
                    SupplierPaymentId = SupplierPaymentId,
                    SupplierId = SupplierId
                }, commandType: CommandType.StoredProcedure))
                {

                    supplierPaymentDetailsDetailsObj.SupplierInvoiceTotal = result.Read<SupplierInvoiceTotal>().ToList();
                }
                //total number of supplier Payment
                return supplierPaymentDetailsDetailsObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public SupplierPayment GetSupplierPaymentDetails(int supplierPaymentId)
        {
                 SupplierPayment supplierPaymentDetailsDetailsObj = new SupplierPayment();
                //executing the stored procedure to get the list of supplier payment
           try
            {
                using (var result = this.m_dbconnection.QueryMultiple("SupplierPayment_CRUD", new
                {

                    Action = "SELECTBYSPID",
                    SupplierPaymentId = supplierPaymentId
                }, commandType: CommandType.StoredProcedure))
                {
                    supplierPaymentDetailsDetailsObj = result.Read<SupplierPayment, Suppliers, SupplierPayment>((Pc, Su) =>
                    {
                        Pc.Supplier = Su;
                        return Pc;
                    }, splitOn: "SupplierId").FirstOrDefault();
                    if (supplierPaymentDetailsDetailsObj != null)
                    {
                        supplierPaymentDetailsDetailsObj.SupplierInvoiceDetails = result.Read<SupplierInvoiceDetails>().ToList();
                        //supplierPaymentDetailsDetailsObj.PaymentType = result.Read<PaymentType>().FirstOrDefault();
                        try
                        {
                            supplierPaymentDetailsDetailsObj.TotalOutstanding = result.Read<decimal>().FirstOrDefault();
                        }
                        catch { }
                    }
                }
                return supplierPaymentDetailsDetailsObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public SupplierPayment GetInvoicewithExistingSupplierdetails(int supplierId)
        {
            try
            {
                SupplierPayment supplierPaymentobj = new SupplierPayment();
                using (var result = this.m_dbconnection.QueryMultiple("SupplierPayment_CRUD", new
                {

                    Action = "SELECTBYEXISTID",
                    SupplierId = supplierId

                }, commandType: CommandType.StoredProcedure))
                {
                    supplierPaymentobj.SupplierInvoiceDetails = result.Read<SupplierInvoiceDetails, Suppliers, SupplierInvoiceDetails>((Pcv, Su) =>
                    {
                        return Pcv;
                    }, splitOn: "SupplierId").ToList();

                }
                return supplierPaymentobj;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public SupplierPayment GetInvoicewithSupplierdetails(int supplierId)
        {
            try
            {
                SupplierPayment supplierPaymentobj = new SupplierPayment();
                using (var result = this.m_dbconnection.QueryMultiple("SupplierPayment_CRUD", new
                {
                    Action = "SELECTBYID",
                    SupplierId = supplierId

                }, commandType: CommandType.StoredProcedure))
                {
                    supplierPaymentobj.SupplierInvoiceDetails = result.Read<SupplierInvoiceDetails>().ToList();
                    if (supplierPaymentobj.SupplierInvoiceDetails.Count > 0)
                    {
                        supplierPaymentobj.TotalOutstanding = result.Read<decimal>().FirstOrDefault();
                    }

                }
                //}
                return supplierPaymentobj;
            }
            catch (Exception e)
            {
                throw e;
            }

        }


        public int GetSupplier(int supplierId)
        {
            try
            {
                int SuppID = 0;
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        SuppID = this.m_dbconnection.QueryFirstOrDefault<int>("SupplierPayment_CRUD", new
                        {
                            Action = "SELECTBYSUPPLIERID",
                            supplierId = supplierId
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        transactionObj.Commit();
                        return SuppID;
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

        public int CreateSupplierPayment(SupplierPayment supplierPayment)
        {
            try
            {
                this.m_dbconnection.Open();
                int supplierPaymentId = 0;
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var paramaterObj = new DynamicParameters();                        
                        string SupplierPaymentCode = this.m_dbconnection.QueryFirstOrDefault<string>("SupplierPayment_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        supplierPaymentId = this.m_dbconnection.QueryFirstOrDefault<int>("SupplierPayment_CRUD", new
                        {
                            Action = "INSERT",
                            SupplierPaymentCode = "SP-"+SupplierPaymentCode, //SharedRepository.GenerateCode("SP"),
                            PaymentTypeId = supplierPayment.PaymentTypeId,
                            CompanyId= supplierPayment.CompanyId,
                            supplierId = supplierPayment.Supplier.SupplierId,
                            TotalAmountPaid = supplierPayment.TotalAmountPaid,
                            ChequeNumber = supplierPayment.ChequeNumber,
                            ChequeDate = supplierPayment.ChequeDate,
                            CreditCardNo = supplierPayment.CreditCardNo,
                            ExpiryMonth = supplierPayment.ExpiryMonth,
                            ExpiryYear = supplierPayment.ExpiryYear,
                            Remarks = supplierPayment.Remarks,
                            CreatedBy = supplierPayment.CreatedBy,
                            CreatedDate = DateTime.Now,
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        if (supplierPayment.SupplierInvoiceDetails != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in supplierPayment.SupplierInvoiceDetails)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@SupplierPaymentId", supplierPaymentId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@InvoiceId", record.InvoiceId, DbType.Int32, ParameterDirection.Input);
                                //itemObj.Add("@OutstandingAmount", record.OutstandingiAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@PaymentAmount", record.PaymentAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", supplierPayment.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@LastPayment", record.OutstandingAmount, DbType.Decimal, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var supplierpaymentItemSaveResult = this.m_dbconnection.Execute("SupplierPayment_CRUD", itemToAdd, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }

                        transactionObj.Commit();

                        //Creating payment vouchers


                        return supplierPaymentId;
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

        public int UpdateSupplierPayment(SupplierPayment supplierPayment)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        int updateResult = this.m_dbconnection.Execute("SupplierPayment_CRUD", new
                        {
                            Action = "UPDATE",
                            SupplierPaymentId = supplierPayment.SupplierPaymentId,
                            TotalAmountPaid = supplierPayment.TotalAmountPaid,
                            Remarks = supplierPayment.Remarks,
                            PaymentTypeId = supplierPayment.PaymentTypeId,
                            ChequeNumber= supplierPayment.ChequeNumber,
                            ChequeDate = supplierPayment.ChequeDate,
                            CreditCardNo = supplierPayment.CreditCardNo,
                            ExpiryMonth = supplierPayment.ExpiryMonth,
                            ExpiryYear = supplierPayment.ExpiryYear,
                            CreatedBy = supplierPayment.CreatedBy,
                            CreatedDate = DateTime.Now,
                        }, transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);

                        if (supplierPayment.SupplierInvoiceDetails != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                            //looping through the list of purchase order items...
                            foreach (var record in supplierPayment.SupplierInvoiceDetails)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@InvoicePaymentId", record.InvoicePaymentId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@PaymentAmount", record.PaymentAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", supplierPayment.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@LastPayment", record.OutstandingAmount, DbType.Decimal, ParameterDirection.Input);
                                itemToAdd.Add(itemObj);
                            }
                            var supplierpaymentItemSaveResult = this.m_dbconnection.Execute("SupplierPayment_CRUD", itemToAdd, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }

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

        public bool DeleteSupplierPayment(SupplierPaymentDelete supplierPaymentDelete)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var supplierPaymentDeleteResult = this.m_dbconnection.Execute("SupplierPayment_CRUD",
                                                               new
                                                               {

                                                                   Action = "DELETEALL",
                                                                   SupplierPaymentId = supplierPaymentDelete.SupplierPaymentId,
                                                                   CreatedBy = supplierPaymentDelete.ModifiedBy,
                                                                   CreatedDate = DateTime.Now
                                                               },
                                                               transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);

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

        public byte[] PaymentVoucherPrint(int supplierPaymentId, int companyId)
        {
            try
            {
                var result = GetPaymentVoucherPDFTemplate(supplierPaymentId, companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetPaymentVoucherPDFTemplate(int supplierPaymentId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;              
                pdfGeneratorObj = new PdfGenerator();
                SupplierPayment supplierPayment = null;
                supplierPayment = GetSupplierPaymentDetails(supplierPaymentId);
                var companyDetails = GetCompanyDetails(companyId);
                var result = pdfGeneratorObj.GetPaymentVoucherPDFTemplate(supplierPayment, companyDetails);
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
    }
}
