using Dapper;
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Service.Repositories
{
    public class ServiceTypeRepository : IServiceTypeRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public ServiceTypeDisplayResult GetServiceTypes(ServiceTypeDisplayInput serviceTypeDisplayInput)
        {
            try
            {
                ServiceTypeDisplayResult serviceTypeDisplayResult = new ServiceTypeDisplayResult();              
                using (var result = this.m_dbconnection.QueryMultiple("ServiceType_CRUD", new
                {
                    Action = "SELECT",
                    Search = "",
                    Skip = serviceTypeDisplayInput.Skip,
                    Take = serviceTypeDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {                  
                    serviceTypeDisplayResult.ServiceTypes = result.Read<ServiceType>().AsList();                  
                    serviceTypeDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return serviceTypeDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ServiceTypeDisplayResult GetAllServiceTypes(ServiceTypeDisplayInput serviceTypeDisplayInput)
        {
            try
            {
                ServiceTypeDisplayResult serviceTypeDisplayResult = new ServiceTypeDisplayResult();               
                using (var result = this.m_dbconnection.QueryMultiple("ServiceType_CRUD", new
                {
                    Action = "SELECT",
                    Search = serviceTypeDisplayInput.Search,
                    Skip = serviceTypeDisplayInput.Skip,
                    Take = serviceTypeDisplayInput.Take
                }, commandType: CommandType.StoredProcedure))
                {
                    serviceTypeDisplayResult.ServiceTypes = result.Read<ServiceType>().AsList();
                    serviceTypeDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return serviceTypeDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public string CreateServiceType(ServiceType serviceType)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("ServiceType_CRUD",
                new
                {
                    Action = "INSERT",
                    ServiceCategoryId = serviceType.ServiceCategoryId,
                    Name = serviceType.Name,
                    Description = serviceType.Description,
                    IsDeleted = serviceType.IsDeleted,
                    CreatedBy = serviceType.CreatedBy,
                    CreatedDate = DateTime.Now                 
                }, commandType: CommandType.StoredProcedure))
                {
                    int validateNameStatus = result.ReadFirstOrDefault<int>();
                    if (validateNameStatus == 0)
                    {
                        status = "Duplicate";
                    }
                }
                return status;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public string UpdateServiceType(ServiceType serviceType)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("ServiceType_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        ServiceTypeId = serviceType.ServiceTypeId,
                        ServiceCategoryId = serviceType.ServiceCategoryId,
                        Name = serviceType.Name,
                        Description = serviceType.Description,
                        IsDeleted = serviceType.IsDeleted,                     
                        UpdatedBy = serviceType.UpdatedBy,
                        UpdatedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure))
                {
                    int validateNameStatus = result.ReadFirstOrDefault<int>();
                    if (validateNameStatus == 0)
                    {
                        status = "Duplicate";
                    }
                }
                return status;

            }
            catch (Exception ex)
            { throw ex; }
        }

        public bool DeleteServiceType(int serviceTypeId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("ServiceType_CRUD", new { Action = "DELETE", ServiceTypeId = serviceTypeId }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }      
      
      
    }
}
