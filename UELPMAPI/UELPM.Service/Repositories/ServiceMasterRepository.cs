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
    public class ServiceMasterRepository   : IServiceMasterRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public ServiceMasterDisplayResult GetServices(ServiceMasterDisplayInput serviceMasterDisplayInput)
        {
            try
            {
                ServiceMasterDisplayResult serviceMasterDisplayResult = new ServiceMasterDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ServiceMaster_CRUD", new
                {
                    Action = "SELECT",
                    Search = "",
                    Skip = serviceMasterDisplayInput.Skip,
                    Take = serviceMasterDisplayInput.Take,
                    CompanyId = serviceMasterDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    serviceMasterDisplayResult.Services = result.Read<ServiceMaster>().AsList();
                    serviceMasterDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return serviceMasterDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public ServiceMasterDisplayResult GetAllSearchServices(ServiceMasterDisplayInput serviceMasterDisplayInput)
        {
            try
            {
                ServiceMasterDisplayResult serviceMasterDisplayResult = new ServiceMasterDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("ServiceMaster_CRUD", new
                {
                    Action = "SELECT",
                    Search = serviceMasterDisplayInput.Search,
                    Skip = serviceMasterDisplayInput.Skip,
                    Take = serviceMasterDisplayInput.Take,
                    CompanyId = serviceMasterDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    serviceMasterDisplayResult.Services = result.Read<ServiceMaster>().AsList();
                    serviceMasterDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return serviceMasterDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        public string CreateService(ServiceMaster serviceMaster)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("ServiceMaster_CRUD",
                new
                {
                    Action = "INSERT",
                    ServiceMasterCode = serviceMaster.ServiceMasterCode,
                    ServiceTypeId = serviceMaster.ServiceTypeId,
                    ServiceName = serviceMaster.ServiceName,
                    Price = serviceMaster.Price,
                    ServiceDescription = serviceMaster.ServiceDescription,                
                    IsDeleted = serviceMaster.IsDeleted,
                    CreatedBy = serviceMaster.CreatedBy,                 
                    CreatedDate = DateTime.Now,                                
                    CompanyId = serviceMaster.CompanyId
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

        public string UpdateService(ServiceMaster serviceMaster)
        {
            try
            {
                string status = "";
                using (var result = this.m_dbconnection.QueryMultiple("ServiceMaster_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        ServiceMasterId = serviceMaster.ServiceMasterId,
                        ServiceMasterCode = serviceMaster.ServiceMasterCode,
                        ServiceTypeId = serviceMaster.ServiceTypeId,
                        ServiceName = serviceMaster.ServiceName,
                        Price = serviceMaster.Price,
                        ServiceDescription = serviceMaster.ServiceDescription,
                        IsDeleted = serviceMaster.IsDeleted,
                        CreatedBy = serviceMaster.CreatedBy,
                        CreatedDate = DateTime.Now,
                        CompanyId = serviceMaster.CompanyId,                    
                        UpdatedBy = serviceMaster.UpdatedBy,
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

        public bool DeleteService(int serviceMasterId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("ServiceMaster_CRUD", new { Action = "DELETE", ServiceMasterId = serviceMasterId }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }

    }
}
