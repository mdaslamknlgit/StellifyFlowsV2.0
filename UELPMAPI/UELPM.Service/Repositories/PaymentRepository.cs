using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;
using UELPM.Service.ExcelUpload;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public bool SavePayments(int userId, List<Payment> payments)
        {
            bool IsSaved = false;
            try
            {
                this.m_dbconnection.Open();
                using (var objTransaction = this.m_dbconnection.BeginTransaction())
                {
                    string batchno = this.generateBatchNumber(objTransaction);
                    foreach (var item in payments)
                    {
                        item.BatchNo = batchno;
                        item.ImportedBy = userId;
                        //if (this.ValidatePayment(item, objTransaction).Status)
                        //{
                        IsSaved = this.SavePayment(item, objTransaction);
                        //}
                    }
                    if (IsSaved)
                        objTransaction.Commit();
                }
            }
            catch (Exception ex)
            {

                throw;
            }
            return IsSaved;
        }

        private string generateBatchNumber(IDbTransaction transactionObj)
        {
            string batchNo = string.Empty;
            try
            {
                batchNo = this.m_dbconnection.Query<string>("Paymentupdate", new { Action = "GENERATEBATCHNO" }, transaction: transactionObj, commandType: CommandType.StoredProcedure).FirstOrDefault().ToString();
            }
            catch (Exception ex)
            {

                throw;
            }
            return batchNo;
        }

        private bool SavePayment(Payment item, IDbTransaction objTransaction)
        {
            bool isSaved = false;
            try
            {
                int saveResult = this.m_dbconnection.Execute("Paymentupdate", new
                {
                    Action = "SAVEPAYMENT",
                    ProcessId = item.ProcessId,
                    CompanyId = item.CompanyId,
                    SupplierId = item.SupplierId,
                    DocumentId = item.DocumentId,
                    VendorId = item.VendorId,
                    BatchNo = item.BatchNo,
                    ChequeNo = item.ChequeNo,
                    ChequeDate = item.ChequeDate,
                    PaymentAmount = item.PaymentAmount,
                    Remarks = item.Remarks,
                    ImportedBy = item.ImportedBy
                }, transaction: objTransaction, commandType: CommandType.StoredProcedure);
                isSaved = saveResult > 0 ? true : false;
            }
            catch (Exception ex)
            {

                throw;
            }
            return isSaved;
        }

        public List<Payment> UploadPayments(string filePath)
        {
            List<Payment> payments = new List<Payment>();
            try
            {
                this.m_dbconnection.Open();
                using (var objTransaction = this.m_dbconnection.BeginTransaction())
                {
                    FileStream fs;
                    fs = File.Open(filePath, FileMode.Open, FileAccess.Read);
                    var excelReader = new ExcelReader(fs);
                    IEnumerable<DataRow> PaymentData = excelReader.GetData("Sheet1");
                    //var sameCheques = PaymentData.AsEnumerable().GroupBy(r => r["ChqNum"]).Where(gr => gr.Count() > 1).ToList();
                    //var sameSupplier = sameCheques.AsEnumerable().GroupBy(r => r["VendorID"]).Where(gr => gr.Count() > 1).ToList();
                    //if (sameSupplier.Count == 0)
                    //{
                    foreach (var row in PaymentData)
                    {
                        DateTime _ChequeDate = string.IsNullOrEmpty(row["ChqDate"].ToString()) ? DateTime.MinValue : Convert.ToDateTime(row["ChqDate"]);
                        DateTime _InvoiceDate = string.IsNullOrEmpty(row["InvDate"].ToString()) ? DateTime.MinValue : Convert.ToDateTime(row["InvDate"]);
                        decimal _paymentAmount = string.IsNullOrEmpty(row["PaymentAmt"].ToString()) ? 0 : Convert.ToDecimal(row["PaymentAmt"]);
                        Payment payment = new Payment
                        {
                            SupplierInvoiceRefNo = row["InvNumber"].ToString(),
                            VendorId = row["VendorID"].ToString(),
                            ChequeDate = _ChequeDate,
                            ChequeNo = row["ChqNum"].ToString(),
                            InvoiceDate = _InvoiceDate,
                            PaymentAmount = _paymentAmount
                        };
                        payment = ValidateFields(payment);
                        if (string.IsNullOrEmpty(payment.StatusText))
                            payment = ValidatePayment(payment, objTransaction);
                        payments.Add(payment);
                    }
                    var lookup = new Dictionary<string, string>();
                    decimal invoiceBalanceAmount = 0;
                    foreach (var item in payments)
                    {
                        if (item.Status)
                        {
                            item.IsOverPayment = (item.BalanceAmount < item.PaymentAmount);
                            invoiceBalanceAmount = item.BalanceAmount - item.PaymentAmount;
                            payments.Where(w => w.DocumentId == item.DocumentId).Select(s => { s.BalanceAmount = invoiceBalanceAmount; return s; }).ToList();


                            if (lookup.ContainsKey(item.ChequeNo))
                            {
                                if (!lookup[item.ChequeNo].Equals(item.VendorId))
                                {
                                    item.Status = false;
                                    item.StatusText = "Duplicate cheque number";
                                }
                            }
                            else
                            {
                                lookup.Add(item.ChequeNo, item.VendorId);
                            }
                        }
                    }
                    return payments;
                    //}
                    //else return new List<Payment>();
                }
            }
            catch (Exception ex)
            {
                return new List<Payment>();
            }
        }

        private Payment ValidateFields(Payment payment)
        {
            if (payment.PaymentAmount == 0)
                payment.StatusText = "Payment Amount Missing.";
            if (string.IsNullOrEmpty(payment.VendorId))
                payment.StatusText = "Vendor ID Missing.";
            if (payment.ChequeDate == DateTime.MinValue)
                payment.StatusText = "ChequeDate Missing.";
            if (string.IsNullOrEmpty(payment.ChequeNo))
                payment.StatusText = "ChequeNo Missing.";
            if (payment.InvoiceDate == DateTime.MinValue)
                payment.StatusText = "Supplier Invoice Date Missing.";
            if (string.IsNullOrEmpty(payment.SupplierInvoiceRefNo))
                payment.StatusText = "Supplier Invoice Number Missing.";
            return payment;
        }

        private Payment ValidatePayment(Payment payment, IDbTransaction objTransaction)
        {
            try
            {
                DateTime boundaryDate = new DateTime(2022, 1, 1);
                var invoices = this.m_dbconnection.Query<InvoiceData>("PaymentUpdate", new
                {
                    Action = "GET_INVOCES",
                    SupplierInvoice = payment.SupplierInvoiceRefNo,
                    VendorID = payment.VendorId,
                    InvoiceDate = payment.InvoiceDate
                }, objTransaction, commandType: CommandType.StoredProcedure).ToList();
                if (invoices.Count == 0)
                    payment.StatusText = "Invalid vendor Id or Invoice No. or Invoice Date";
                else
                {
                    var accurateInvoices = invoices.Where(x => x.WorkflowStatusId == (int)WorkFlowStatus.Exported ||
                    x.WorkflowStatusId == (int)WorkFlowStatus.PartiallyPaid).ToList();
                    var fullyPaidInvoices = invoices.Where(x => x.WorkflowStatusId == (int)WorkFlowStatus.FullyPaid).ToList();
                    if (accurateInvoices.Count == 0 && fullyPaidInvoices.Count == 0)
                        payment.StatusText = "Invoice status to be Exported.";
                    else if (fullyPaidInvoices.Count > 0)
                        payment.StatusText = "Invoice Fully Paid.";
                    else if (accurateInvoices.Count == 1)
                    {
                        if (accurateInvoices.FirstOrDefault().CreatedDate < boundaryDate)
                            payment.StatusText = "Supplier Invoice Creation date need to be greater than or equal to 1 Jan 2022";
                        //if (invoices.FirstOrDefault().BalanceAmount < payment.PaymentAmount)
                        //    payment.StatusText = "Payment amount is more than outstanding amount";
                        else
                        {
                            payment.DocumentNo = accurateInvoices.FirstOrDefault().DocumentCode;
                            payment.SupplierName = accurateInvoices.FirstOrDefault().SupplierName;
                            payment.SupplierId = accurateInvoices.FirstOrDefault().SupplierId;
                            payment.DocumentId = accurateInvoices.FirstOrDefault().DocumentId;
                            payment.ProcessId = accurateInvoices.FirstOrDefault().ProcessId;
                            payment.CompanyId = accurateInvoices.FirstOrDefault().CompanyId;
                            int prevCheques = this.m_dbconnection.ExecuteScalar<int>("PaymentUpdate", new
                            {
                                Action = "VALIDATE_CHEQUE",
                                VendorID = payment.VendorId,
                                SupplierId = payment.SupplierId,
                                ChequeNo = payment.ChequeNo
                            }, objTransaction, commandType: CommandType.StoredProcedure);
                            if (prevCheques == 0)
                            {
                                if (string.IsNullOrEmpty(payment.StatusText))
                                {
                                    payment.Status = true;
                                    payment.BalanceAmount = Decimal.Round(accurateInvoices.FirstOrDefault().BalanceAmount, 2);
                                }
                            }
                            else
                                payment.StatusText = "Cheque No. already exists";
                        }
                    }
                    else if (accurateInvoices.Count > 1)
                    {
                        payment.StatusText = $"{string.Join(",", accurateInvoices.Select(x => x.DocumentCode))} has duplicate Invoice Refrence No's.";
                        payment.SupplierName = accurateInvoices.FirstOrDefault().SupplierName;
                    }
                }
                return payment;
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        public InvoicePayments GetPaymentDetails(int InvoiceId, int companyId, int ProcessId)
        {
            InvoicePayments invoicePayments = new InvoicePayments();
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("Paymentupdate", new
                {
                    Action = "GETPAYMENTDETAILS",
                    DocumentId = InvoiceId,
                    companyId = companyId,
                    ProcessId = ProcessId
                }, commandType: CommandType.StoredProcedure))
                {
                    invoicePayments = result.Read<InvoicePayments>().FirstOrDefault();
                    invoicePayments.OutStandingTotal = Decimal.Round(invoicePayments.OutStandingTotal, 2);
                    invoicePayments.Payments = result.Read<Payment>().ToList();
                    invoicePayments.PaidTotal = invoicePayments.Payments.Sum(item => item.PaymentAmount);
                }
            }
            catch (Exception ex)
            {

            }
            return invoicePayments;
        }
    }
}
