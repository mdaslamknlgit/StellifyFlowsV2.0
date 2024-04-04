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
    public class ServiceCategoryRepository : IServiceCategoryRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public ServiceCategoryDisplayResult GetServiceCategory(GridDisplayInput displayInput)
        {
            try
            {
                ServiceCategoryDisplayResult serviceCategoryDisplayResult = new ServiceCategoryDisplayResult();
                //executing the stored procedure to get the list of supplier services....
                using (var result = this.m_dbconnection.QueryMultiple("ServiceCategories_CRUD", new
                {

                    Action = "SELECT",
                    Search = displayInput.Search,
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of suppliers..
                    serviceCategoryDisplayResult.ServiceCategories = result.Read<ServiceCategory>().AsList();
                    //total number of supplier service records.
                    serviceCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return serviceCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public ServiceCategoryDisplayResult GetAllServiceCategory(GridDisplayInput displayInput)
        {
            try
            {
                ServiceCategoryDisplayResult serviceCategoryDisplayResult = new ServiceCategoryDisplayResult();
                //executing the stored procedure to get the list of supplier services....
                using (var result = this.m_dbconnection.QueryMultiple("ServiceCategories_CRUD", new
                {

                    Action = "SELECT",
                    Search = displayInput.Search,
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of suppliers..
                    serviceCategoryDisplayResult.ServiceCategories = result.Read<ServiceCategory>().AsList();
                    //total number of supplier service records.
                    serviceCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return serviceCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public ServiceCategory GetServiceCategory(int serviceCategoryId)
        {
            try
            {
                return this.m_dbconnection.Query<ServiceCategory>("ServiceCategories_CRUD",
                new
                {
                    Action = "SELECTBYID",
                    ServiceCategoryId = serviceCategoryId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateServiceCategory(ServiceCategory serviceCategory)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ServiceCategories_CRUD",
                new
                {
                    Action = "INSERT",
                    CategoryName = serviceCategory.CategoryName.Trim(),
                    CategoryDescription = serviceCategory.CategoryDescription.Trim(),
                    CreatedBy = serviceCategory.CreatedBy,
                    CreatedDate = DateTime.Now,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int UpdateServiceCategory(ServiceCategory serviceCategory)
        {
            try
            {
                return this.m_dbconnection.Query<int>("ServiceCategories_CRUD",
                                                   new
                                                   {
                                                       Action = "UPDATE",
                                                       CategoryName = serviceCategory.CategoryName.Trim(),
                                                       CategoryDescription = serviceCategory.CategoryDescription.Trim(),
                                                       CreatedBy = serviceCategory.CreatedBy,
                                                       CreatedDate = DateTime.Now,
                                                       ServiceCategoryId = serviceCategory.ServiceCategoryId
                                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool DeleteServiceCategory(ServiceCategory serviceCategory)
        {
            try
            {
                var result= this.m_dbconnection.Query<int>("ServiceCategories_CRUD",
                                        new
                                        {
                                            Action = "DELETE",
                                            ServiceCategoryId = serviceCategory.ServiceCategoryId,
                                            CreatedBy = serviceCategory.CreatedBy,
                                            CreatedDate = DateTime.Now
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
        public int ValidateServiceName(ServiceCategory serviceCategory)
        {
            try
            {

                return this.m_dbconnection.Query<int>("ServiceCategories_CRUD",
                                         new
                                         {

                                             Action = "VALIDATE",
                                             ServiceCategoryId = serviceCategory.ServiceCategoryId,
                                             CategoryName = serviceCategory.CategoryName.Trim()
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
