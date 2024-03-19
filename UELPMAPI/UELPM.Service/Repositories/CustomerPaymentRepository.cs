using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Interface;
using UELPM.Util.PdfGenerator;

namespace UELPM.Service.Repositories
{
    public class CustomerPaymentRepository : ICustomerPaymentRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public CustomerPaymentDisplayResult GetCustomerPayments(GridDisplayInput customerPaymentInput)
        {
            try
            {
                CustomerPaymentDisplayResult customerPaymentDisplayResult = new CustomerPaymentDisplayResult();             
                using (var result = this.m_dbconnection.QueryMultiple("CustomerPayment_CRUD", new
                {
                    Action = "SELECT",
                    Search = customerPaymentInput.Search,
                    Skip = customerPaymentInput.Skip,
                    Take = customerPaymentInput.Take,
                    CompanyId = customerPaymentInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    customerPaymentDisplayResult.CustomerPayment = result.Read<CustomerPaymentList>().GroupBy(i => i.CustomerPaymentId).Select(j => new CustomerPaymentList
                    {
                        CustomerPaymentId = j.Select(i => i.CustomerPaymentId).FirstOrDefault(),
                        CustomerId = j.Select(i => i.CustomerId).FirstOrDefault(),
                        CustomerPaymentCode = j.Select(i => i.CustomerPaymentCode).FirstOrDefault(),
                        CustomerName = j.Select(i => i.CustomerName).FirstOrDefault(),
                        SalesInvoiceCode = String.Join(",", j.Select(i => i.SalesInvoiceCode).ToList())
                    }).ToList();
                   
                    customerPaymentDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return customerPaymentDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public CustomerPayment GetCustomerPaymentDetails(int customerPaymentId)
        {
            CustomerPayment customerPaymentDetails = new CustomerPayment();         
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("CustomerPayment_CRUD", new
                {

                    Action = "SELECTBYCPID",
                    CustomerPaymentId = customerPaymentId
                }, commandType: CommandType.StoredProcedure))
                {
                    customerPaymentDetails = result.Read<CustomerPayment, Customer, CustomerPayment>((Cp, Cu) =>
                    {
                        Cp.Customer = Cu;
                        return Cp;
                    }, splitOn: "CustomerId").FirstOrDefault();
                    if (customerPaymentDetails != null)
                    {
                        customerPaymentDetails.CustomerInvoiceDetails = result.Read<CustomerInvoiceDetails>().ToList();                      
                        //customerPaymentDetails.TotalOutstanding = result.Read<int>().FirstOrDefault();
                    }
                }
                return customerPaymentDetails;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public CustomerPayment GetCustomerPaymentDeatilsForEdit(int customerPaymentId, int customerId)
        {
            CustomerPayment customerPaymentDetails = new CustomerPayment();
            try
            {
                this.m_dbconnection.Open();
                using (var result = this.m_dbconnection.QueryMultiple("CustomerPayment_CRUD", new
                {

                    Action = "EDIT",
                    CustomerPaymentId = customerPaymentId,
                    CustomerId = customerId
                }, commandType: CommandType.StoredProcedure))
                {

                    customerPaymentDetails.CustomerInvoiceTotal = result.Read<CustomerInvoiceTotal>().ToList();
                }
               
                return customerPaymentDetails;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    
        public CustomerPaymentDisplayResult GetAllSearchCustomerPayments(CustomerPaymentSearch customerPaymentSearch)
        {
            try
            {
                CustomerPaymentDisplayResult customerPaymentDisplayResult = new CustomerPaymentDisplayResult();

                string customerPaymentSearchQuery = "";

                customerPaymentSearchQuery = "(select cp.CustomerPaymentId, cp.CustomerId, cp.CustomerPaymentCode, cus.CustomerName, si.SalesInvoiceCode,  " +
                                                  "cp.UpdatedDate " +
                                                  "from " +
                                                  "dbo.CustomerPayment as cp " +
                                                  "join dbo.CustomerInvoicePayment as cip " +
                                                  "on " +
                                                  "cip.CustomerPaymentId=cp.CustomerPaymentId " +
                                                   "join dbo.Customer as cus " +
                                                   "on " +
                                                   "cus.CustomerId=cp.CustomerId " +
                                                   "join dbo.SalesInvoice as si " +
                                                   "on " +
                                                   "si.SalesInvoiceId=cip.SalesInvoiceId " +                                                
                                                   "where ";              

                if (customerPaymentSearch.CustomerPaymentCode != "" && customerPaymentSearch.CustomerPaymentCode != null)
                {
                    customerPaymentSearchQuery += "( " +
                                                    "cp.CustomerPaymentCode LIKE concat('%',@CustomerPaymentCode,'%') " +
                                                    ") " +
                                                    "and ";
                }
                if (customerPaymentSearch.CustomerName != "" && customerPaymentSearch.CustomerName != null)
                {
                    customerPaymentSearchQuery += "( " +
                                                    "cus.CustomerName LIKE concat('%',@CustomerName,'%') " +
                                                ") " +
                                                "and ";
                }

                if (customerPaymentSearch.SalesInvoiceCode != "" && customerPaymentSearch.SalesInvoiceCode != null)
                {
                    customerPaymentSearchQuery += "( " +
                                                    "si.SalesInvoiceCode LIKE concat('%',@SalesInvoiceCode,'%') " +
                                                    ") " +
                                                    "and ";
                }


                customerPaymentSearchQuery += " cp.Isdeleted = 0 and cp.CompanyId=@companyId )";

                string searchQuery = " select * from " +
                                                   " ( ";
                searchQuery += customerPaymentSearchQuery;

                searchQuery += " ) as cpm ";
                searchQuery += " order by ";
                searchQuery += " cpm.UpdatedDate desc ";


                if (customerPaymentSearch.Take > 0)
                {
                    searchQuery += " OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY ";
                    searchQuery += " select COUNT(*) from ( ";
                    searchQuery += customerPaymentSearchQuery;

                    searchQuery += " ) as cpm ";
                }
               
                using (var result = this.m_dbconnection.QueryMultiple(searchQuery, new
                {
                    Action = "SELECT",
                    Skip = customerPaymentSearch.Skip,
                    Take = customerPaymentSearch.Take,
                    CustomerName = customerPaymentSearch.CustomerName,
                    CustomerPaymentCode = customerPaymentSearch.CustomerPaymentCode,
                    SalesInvoiceCode = customerPaymentSearch.SalesInvoiceCode,
                    CompanyId = customerPaymentSearch.CompanyId                  

                }, commandType: CommandType.Text))
                {                   
                    customerPaymentDisplayResult.CustomerPayment = result.Read<CustomerPaymentList>().AsList();
                    if (customerPaymentSearch.Take > 0)
                    {                      
                        customerPaymentDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    }
                    else
                    {
                        customerPaymentDisplayResult.TotalRecords = customerPaymentDisplayResult.CustomerPayment.Count;
                    }
                }
                return customerPaymentDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public CustomerPayment GetInvoiceDetailsByCustomer(int customerid)
        {
            try
            {
                CustomerPayment customerPaymentDetails = new CustomerPayment();
                using (var result = this.m_dbconnection.QueryMultiple("CustomerPayment_CRUD", new
                {
                    Action = "SELECTBYID",
                    CustomerId = customerid

                }, commandType: CommandType.StoredProcedure))
                {
                    customerPaymentDetails.CustomerInvoiceDetails = result.Read<CustomerInvoiceDetails>().ToList();
                    if (customerPaymentDetails.CustomerInvoiceDetails.Count > 0)
                    {
                        customerPaymentDetails.TotalOutstanding = result.Read<decimal>().FirstOrDefault();
                    }

                }        
                
                return customerPaymentDetails;
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public int CreateCustomerPayment(CustomerPayment customerPayment)
        {
            try
            {
                this.m_dbconnection.Open();
                int customerPaymentId = 0;
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var paramaterObj = new DynamicParameters();
                        string customerPaymentCode = this.m_dbconnection.QueryFirstOrDefault<string>("CustomerPayment_CRUD", new
                        {
                            Action = "COUNT"
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);
                        customerPaymentId = this.m_dbconnection.QueryFirstOrDefault<int>("CustomerPayment_CRUD", new
                        {
                            Action = "INSERT",
                            CustomerPaymentCode = "CP-" + customerPaymentCode, //SharedRepository.GenerateCode("SP"),
                            PaymentTypeId = customerPayment.PaymentTypeId,
                            CompanyId = customerPayment.CompanyId,
                            CustomerId = customerPayment.Customer.CustomerId,
                            TotalAmountPaid = customerPayment.TotalAmountPaid,
                            ChequeNumber = customerPayment.ChequeNumber,
                            ChequeDate = customerPayment.ChequeDate,
                            CreditCardNo = customerPayment.CreditCardNo,
                            ExpiryMonth = customerPayment.ExpiryMonth,
                            ExpiryYear = customerPayment.ExpiryYear,
                            Remarks = customerPayment.Remarks,
                            CreatedBy = customerPayment.CreatedBy,
                            CreatedDate = DateTime.Now,
                        },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                        if (customerPayment.CustomerInvoiceDetails != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();                          
                            foreach (var record in customerPayment.CustomerInvoiceDetails)
                            {
                                var itemObj = new DynamicParameters();

                                itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CustomerPaymentId", customerPaymentId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@SalesInvoiceId", record.SalesInvoiceId, DbType.Int32, ParameterDirection.Input);                              
                                itemObj.Add("@PaymentAmount", record.PaymentAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", customerPayment.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@LastPayment", record.OutstandingAmount, DbType.Decimal, ParameterDirection.Input);

                                itemToAdd.Add(itemObj);
                            }
                            var result = this.m_dbconnection.Execute("CustomerPayment_CRUD", itemToAdd, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);
                        }

                        transactionObj.Commit();

                        return customerPaymentId;
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

        public int UpdateCustomerPayment(CustomerPayment customerPayment)
        {
            try
            {
                this.m_dbconnection.Open();//opening the connection...
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        int updateResult = this.m_dbconnection.Execute("CustomerPayment_CRUD", new
                        {
                            Action = "UPDATE",
                            CustomerPaymentId = customerPayment.CustomerPaymentId,
                            TotalAmountPaid = customerPayment.TotalAmountPaid,
                            Remarks = customerPayment.Remarks,
                            PaymentTypeId = customerPayment.PaymentTypeId,
                            ChequeNumber = customerPayment.ChequeNumber,
                            ChequeDate = customerPayment.ChequeDate,
                            CreditCardNo = customerPayment.CreditCardNo,
                            ExpiryMonth = customerPayment.ExpiryMonth,
                            ExpiryYear = customerPayment.ExpiryYear,
                            CreatedBy = customerPayment.CreatedBy,
                            CreatedDate = DateTime.Now,
                        }, transaction: transactionObj,
                          commandType: CommandType.StoredProcedure);

                        if (customerPayment.CustomerInvoiceDetails != null)
                        {
                            List<DynamicParameters> itemToAdd = new List<DynamicParameters>();                          
                            foreach (var record in customerPayment.CustomerInvoiceDetails)
                            {
                                var itemObj = new DynamicParameters();
                                itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CustomerInvoicePaymentId", record.CustomerInvoicePaymentId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@PaymentAmount", record.PaymentAmount, DbType.Decimal, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", customerPayment.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                itemObj.Add("@LastPayment", record.OutstandingAmount, DbType.Decimal, ParameterDirection.Input);
                                itemToAdd.Add(itemObj);
                            }
                            var result = this.m_dbconnection.Execute("CustomerPayment_CRUD", itemToAdd, transaction: transactionObj,
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

        public bool DeleteCustomerPayment(CustomerPaymentDelete customerPaymentDelete)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    try
                    {
                        var result = this.m_dbconnection.Execute("CustomerPayment_CRUD",
                                                               new
                                                               {

                                                                   Action = "DELETEALL",
                                                                   CustomerPaymentId = customerPaymentDelete.CustomerPaymentId,
                                                                   CreatedBy = customerPaymentDelete.ModifiedBy,
                                                                   CreatedDate = DateTime.Now
                                                               },
                                                               transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);

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

        public byte[] PaymentVoucherPrint(int customerPaymentId, int companyId)
        {
            try
            {
                var result = GetPaymentVoucherPDFTemplate(customerPaymentId, companyId);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] GetPaymentVoucherPDFTemplate(int customerPaymentId, int companyId)
        {
            try
            {
                PdfGenerator pdfGeneratorObj = null;
                pdfGeneratorObj = new PdfGenerator();
                CustomerPayment customerPayment = null;
                customerPayment = GetCustomerPaymentDetails(customerPaymentId);
                var companyDetails = GetCompanyDetails(companyId);
                var result = pdfGeneratorObj.GetCustomerPaymentVoucherPDFTemplate(customerPayment, companyDetails);
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
