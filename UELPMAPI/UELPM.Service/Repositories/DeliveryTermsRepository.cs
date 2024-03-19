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
    public class DeliveryTermsRepository: IDeliveryTermsRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        /*
            this method is used to get the list of delivery terms
        */
        public DeliveryTermsDisplayResult GetDeliveryTerms(GridDisplayInput gridDisplayInput)
        {
            try
            {
                DeliveryTermsDisplayResult deliveryTermsResult = new DeliveryTermsDisplayResult();
                //executing the stored procedure to get the list of delivery terms....
                using (var result = this.m_dbconnection.QueryMultiple("DeliveryTerms_CRUD", new
                {

                    Action = "SELECT",
                    Search="",
                    CompanyId = gridDisplayInput.CompanyId,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of delivery terms..
                    deliveryTermsResult.DeliveryTerms = result.Read<DeliveryTerms>().AsList();

                    //total number of delivery terms records.
                    deliveryTermsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return deliveryTermsResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public DeliveryTermsDisplayResult GetAllDeliveryTerms(GridDisplayInput gridDisplayInput)
        {
            try
            {
                DeliveryTermsDisplayResult deliveryTermsResult = new DeliveryTermsDisplayResult();
                //executing the stored procedure to get the list of delivery terms....
                using (var result = this.m_dbconnection.QueryMultiple("DeliveryTerms_CRUD", new
                {

                    Action = "SELECT",
                    Search = gridDisplayInput.Search,
                    CompanyId = gridDisplayInput.CompanyId,
                    Skip = gridDisplayInput.Skip,
                    Take = gridDisplayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of delivery terms..
                    deliveryTermsResult.DeliveryTerms = result.Read<DeliveryTerms>().AsList();

                    //total number of delivery terms records.
                    deliveryTermsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return deliveryTermsResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public DeliveryTerms GetDeliveryTermsDetails(int deliveryTermsId)
        {
            try
            {
                DeliveryTermsDisplayResult deliveryTermsResult = new DeliveryTermsDisplayResult();

                var result = this.m_dbconnection.QueryFirstOrDefault<DeliveryTerms>("DeliveryTerms_CRUD", new
                {
                    Action = "SELECTBYID",
                    DeliveryTermsId = deliveryTermsId
                }, commandType: CommandType.StoredProcedure);

                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int CreateDeliveryTerm(DeliveryTerms deliveryTerm)
        {
            try
            {
                return this.m_dbconnection.Query<int>("DeliveryTerms_CRUD",
                new
                {
                    Action = "INSERT",
                    Code = deliveryTerm.Code,
                    NoOfDays = deliveryTerm.NoOfDays,
                    Description = deliveryTerm.Description,
                    CreatedBy = deliveryTerm.CreatedBy,
                    CompanyId = deliveryTerm.CompanyId,
                    CreatedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int UpdateDeliveryTerm(DeliveryTerms deliveryTerm)
        {
            try
            {
                return this.m_dbconnection.Query<int>("DeliveryTerms_CRUD",
                                                   new
                                                   {
                                                       Action = "UPDATE",
                                                       Code = deliveryTerm.Code,
                                                       DeliveryTermsId = deliveryTerm.DeliveryTermsId,
                                                       NoOfDays = deliveryTerm.NoOfDays,
                                                       Description = deliveryTerm.Description,
                                                       CreatedBy = deliveryTerm.CreatedBy,
                                                       CompanyId = deliveryTerm.CompanyId,
                                                       CreatedDate = DateTime.Now
                                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool DeleteDeliveryTerms(DeliveryTerms deliveryTerm)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("DeliveryTerms_CRUD",
                                        new
                                        {
                                            Action = "DELETE",
                                            DeliveryTermsId = deliveryTerm.DeliveryTermsId,
                                            CreatedBy = deliveryTerm.CreatedBy,
                                            CreatedDate = DateTime.Now
                                        },
                                        commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int ValidateDeliveryTerms(DeliveryTerms deliveryTerms)
        {

            try
            {

                return this.m_dbconnection.Query<int>("DeliveryTerms_CRUD",
                                         new
                                         {

                                             Action = "VALIDATE",
                                             DeliveryTermsId = deliveryTerms.DeliveryTermsId,
                                             Code = deliveryTerms.Code
                                         },
                                           commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
