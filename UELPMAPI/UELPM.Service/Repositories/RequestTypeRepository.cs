using Dapper;
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using UELPM.Model.Models;

namespace UELPM.Service.Repositories
{
    public class RequestTypeRepository : IRequestTypeRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public RequestTypeGrid GetRequestTypes(GridDisplayInput gridDisplayInput)
        {
            RequestTypeGrid requestTypeGrid = new RequestTypeGrid();
            using (var result = this.m_dbconnection.QueryMultiple("RequestType_CRUD", new
            {
                Action = "SELECT",
                Search = "",
                Skip = gridDisplayInput.Skip,
                Take = gridDisplayInput.Take              

            }, commandType: CommandType.StoredProcedure))
            {
                requestTypeGrid.RequestTypes = result.Read<RequestType>().AsList();
                requestTypeGrid.TotalRecords = result.ReadFirstOrDefault<int>();
            }

            return requestTypeGrid;
        }

        public RequestTypeGrid GetAllSearchRequestTypes(GridDisplayInput gridDisplayInput)
        {
            RequestTypeGrid requestTypeGrid = new RequestTypeGrid();
            using (var result = this.m_dbconnection.QueryMultiple("RequestType_CRUD", new
            {

                Action = "SELECT",
                Search = gridDisplayInput.Search,
                Skip = gridDisplayInput.Skip,
                Take = gridDisplayInput.Take                

            }, commandType: CommandType.StoredProcedure))
            {
                requestTypeGrid.RequestTypes = result.Read<RequestType>().AsList();
                requestTypeGrid.TotalRecords = result.ReadFirstOrDefault<int>();
            }

            return requestTypeGrid;

        }

        public RequestType GetRequestType(int requestTypeId)
        {
            var requestTypeDetails = this.m_dbconnection.Query<RequestType>("RequestType_CRUD",
                                   new
                                   {
                                       Action = "SELECTBYID",
                                       RequestTypeId = requestTypeId
                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();
           
            return requestTypeDetails;
        }

        public int CreateRequestType(RequestType requestType)
        {
            try
            {
                using (var result = this.m_dbconnection.QueryMultiple("RequestType_CRUD",
                new
                {
                    Action = "INSERT",
                    Name = requestType.Name,
                    Description = requestType.Description,
                    IsDeleted = requestType.IsDeleted,
                    CreatedBy = requestType.CreatedBy,
                    ModifiedBy = requestType.ModifiedBy,
                    CreatedDate = DateTime.Now,
                    ModifiedDate = DateTime.Now
                }, commandType: CommandType.StoredProcedure))
                {
                    return result.ReadFirstOrDefault<int>();
                }

            }
            catch (Exception ex)
            { throw ex; }
        }

        public int UpdateRequestType(RequestType requestType)
        {
            try
            {               
                using (var result = this.m_dbconnection.QueryMultiple("RequestType_CRUD",
                    new
                    {
                        Action = "UPDATE",
                        RequestTypeId = requestType.RequestTypeId,                      
                        Name = requestType.Name,
                        Description = requestType.Description,
                        IsDeleted = requestType.IsDeleted,
                        CreatedBy = requestType.CreatedBy,
                        ModifiedBy = requestType.ModifiedBy,
                        ModifiedDate = DateTime.Now
                    }, commandType: CommandType.StoredProcedure))
                {
                   return result.ReadFirstOrDefault<int>();                 
                }             
            }
            catch (Exception ex)
            { throw ex; }
        }

        public bool DeleteRequestType(int requestTypeId)
        {
            try
            {
                return this.m_dbconnection.Query<bool>("RequestType_CRUD", new { Action = "DELETE", RequestTypeId = requestTypeId }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }         
    }
}
