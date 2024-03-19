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

namespace UELPM.Service.Repositories
{
    public class PaymentTermsRepostiory: IPaymentTermsRepository
    {

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        /*
            this method is used to get the list of payment terms
        */
        public PaymentTermDisplayResult GetPaymentTerm(GridDisplayInput displayInput)
        {
            try
            {
                PaymentTermDisplayResult paymentTermsResult = new PaymentTermDisplayResult();
                //executing the stored procedure to get the list of payment terms....
                using (var result = this.m_dbconnection.QueryMultiple("PaymentTerms_CRUD", new
                {

                    Action = "SELECT",
                    Search="",
                    CompanyId = displayInput.CompanyId,
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of payment terms..
                    paymentTermsResult.PaymentTerms = result.Read<PaymentTerm>().AsList();
                    //total number of payment terms records.
                    paymentTermsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return paymentTermsResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public PaymentTermDisplayResult GetAllPaymentTerm(GridDisplayInput displayInput)
        {
            try
            {
                PaymentTermDisplayResult paymentTermsResult = new PaymentTermDisplayResult();
                //executing the stored procedure to get the list of payment terms....
                using (var result = this.m_dbconnection.QueryMultiple("PaymentTerms_CRUD", new
                {

                    Action = "SELECT",
                    Search= displayInput.Search,
                    CompanyId = displayInput.CompanyId,
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of payment terms..
                    paymentTermsResult.PaymentTerms = result.Read<PaymentTerm>().AsList();
                    //total number of payment terms records.
                    paymentTermsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return paymentTermsResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public PaymentTerm GetPaymentTermDetails(int paymentTermsId)
        {
            try
            {
                PaymentTermDisplayResult paymentTermsResult = new PaymentTermDisplayResult();

                var result = this.m_dbconnection.QueryFirstOrDefault<PaymentTerm>("PaymentTerms_CRUD", new
                {

                    Action = "SELECTBYID",
                    PaymentTermsId = paymentTermsId
                }, commandType: CommandType.StoredProcedure);
                
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreatePaymentTerm(PaymentTerm paymentTerm)
        {
            try
            {
                return this.m_dbconnection.Query<int>("PaymentTerms_CRUD",
                new
                {
                    Action = "INSERT",
                    Code = paymentTerm.Code,
                    NoOfDays = paymentTerm.NoOfDays,
                    Description = paymentTerm.Description,
                    CompanyId = paymentTerm.CompanyId,
                    CreatedBy = paymentTerm.CreatedBy,
                    CreatedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int UpdatePaymentTerm(PaymentTerm paymentTerm)
        {
            try
            {
                var result = this.m_dbconnection.Query<int>("PaymentTerms_CRUD",
                        new
                        {
                            Action = "UPDATE",
                            Code = paymentTerm.Code,
                            PaymentTermsId = paymentTerm.PaymentTermsId,
                            NoOfDays = paymentTerm.NoOfDays,
                            Description = paymentTerm.Description,
                            UpdatedBy = paymentTerm.UpdatedBy,
                            CompanyId = paymentTerm.CompanyId,
                            UpdatedDate = DateTime.Now
                        }, commandType: CommandType.StoredProcedure).FirstOrDefault();

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool DeletePaymentTerms(PaymentTerm paymentTerm)
        {

            try
            {

                int result= this.m_dbconnection.Query<int>("PaymentTerms_CRUD",
                                        new
                                        {
                                            Action = "DELETE",
                                            PaymentTermsId = paymentTerm.PaymentTermsId,
                                            UpdatedBy = paymentTerm.UpdatedBy,
                                            UpdatedDate = DateTime.Now
                                        },
                                        commandType: CommandType.StoredProcedure).FirstOrDefault();

                if (result == 1)
                {
                    return false;
                }
                else
                    return true;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ValidatePaymentTerm(PaymentTerm paymentTerm)
        {
            try
            {
                return this.m_dbconnection.Query<int>("PaymentTerms_CRUD",
                new
                {
                    Action = "VALIDATE",
                    PaymentTermsId = paymentTerm.PaymentTermsId,
                    Code = paymentTerm.Code,
                    CompanyId = paymentTerm.CompanyId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string ConvertToPdf()
        {
            try
            {
                //executing the stored procedure to get the list of payment terms....
                List<PaymentTerm> result = this.m_dbconnection.Query<PaymentTerm>("PaymentTerms_CRUD", new
                                             {
                                                 Action = "SELECTALL"
                                             }, commandType: CommandType.StoredProcedure).ToList();

                StringBuilder templateObj = new StringBuilder();

                templateObj.Append("<div>");
                foreach (var data in result)
                {
                    templateObj.Append("<table style='margin-top:2%;'>");
                    templateObj.Append("<tr><td style='width:20%;'><label>Code:<label></td><td>"+data.Code+ "</td></tr>");
                    templateObj.Append("<tr><td><label>No of Days:<label></td><td>" + data.NoOfDays + "</td></tr>");
                    templateObj.Append("</table>");
                    templateObj.Append("<div><label style='text-decoration:underline;'>Description:<label></div><br><div>" + data.Description + "</div>");
                }
                templateObj.Append("</div>");

                return templateObj.ToString();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
