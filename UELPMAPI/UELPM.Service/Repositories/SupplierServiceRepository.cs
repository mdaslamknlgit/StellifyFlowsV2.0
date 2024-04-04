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
    public class  SupplierServiceRepository:ISupplierServiceRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        /*
            this method is used to get the list of supplier services
        */
        public SupplierServiceDisplayResult GetSupplierServices(GridDisplayInput displayInput)
        {
            try
            {
                SupplierServiceDisplayResult supplierCategoryDisplayResult = new SupplierServiceDisplayResult();
                //executing the stored procedure to get the list of supplier services....
                using (var result = this.m_dbconnection.QueryMultiple("SupplierService_CRUD", new
                {

                    Action = "SELECT",
                    Search="",
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of suppliers..
                    supplierCategoryDisplayResult.SupplierServices = result.Read<SupplierService>().AsList();
                    //total number of supplier service records.
                    supplierCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return supplierCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public SupplierServiceDisplayResult GetAllSupplierServices(GridDisplayInput displayInput)
        {
            try
            {
                SupplierServiceDisplayResult supplierCategoryDisplayResult = new SupplierServiceDisplayResult();
                //executing the stored procedure to get the list of supplier services....
                using (var result = this.m_dbconnection.QueryMultiple("SupplierService_CRUD", new
                {

                    Action = "SELECT",
                    Search = displayInput.Search,
                    Skip = displayInput.Skip,
                    Take = displayInput.Take

                }, commandType: CommandType.StoredProcedure))
                {
                    //list of suppliers..
                    supplierCategoryDisplayResult.SupplierServices = result.Read<SupplierService>().AsList();
                    //total number of supplier service records.
                    supplierCategoryDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return supplierCategoryDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public SupplierService GetSupplierServiceDetails(int supplierServiceId)
        {
            try
            {
                return this.m_dbconnection.Query<SupplierService>("SupplierService_CRUD",
                new
                {
                    Action = "SELECTBYID",
                    SupplierServiceID = supplierServiceId
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int CreateSupplierService(SupplierService supplierService)
        {
            try
            {
                return this.m_dbconnection.Query<int>("SupplierService_CRUD",
                new
                {
                    Action = "INSERT",
                    ServiceName = supplierService.ServiceName.Trim(),
                    ServiceDescription = supplierService.ServiceDescription,
                    ServiceCategory = supplierService.ServiceCategory,
                    CreatedBy = supplierService.CreatedBy,
                    CreatedDate = DateTime.Now,
                }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public int UpdateSupplierService(SupplierService supplierService)
        {
            try
            {
                return this.m_dbconnection.Query<int>("SupplierService_CRUD",
                                                   new
                                                   {
                                                       Action = "UPDATE",
                                                       ServiceName = supplierService.ServiceName,
                                                       ServiceDescription = supplierService.ServiceDescription,
                                                       ServiceCategory = supplierService.ServiceCategory,
                                                       CreatedBy = supplierService.CreatedBy,
                                                       CreatedDate = DateTime.Now,
                                                       SupplierServiceID = supplierService.SupplierServiceID
                                                   }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool DeleteSupplierService(SupplierService supplierService)
        {
            try
            {
                int result= this.m_dbconnection.Query<int>("SupplierService_CRUD",
                                        new
                                        {
                                            Action = "DELETE",
                                            SupplierServiceID = supplierService.SupplierServiceID,
                                            CreatedBy = supplierService.CreatedBy,
                                            CreatedDate = DateTime.Now
                                        },
                                        commandType: CommandType.StoredProcedure).FirstOrDefault();
                if (result==1)
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
        public int ValidateServiceName(SupplierService supplierService)
        {
            try
            {

                return this.m_dbconnection.Query<int>("SupplierService_CRUD",
                                         new
                                         {
                                             Action = "VALIDATE",
                                             SupplierServiceID = supplierService.SupplierServiceID,
                                             ServiceName = supplierService.ServiceName.Trim()
                                         },
                                           commandType: CommandType.StoredProcedure).FirstOrDefault();

            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public List<ServiceCategory> GetServiceCategories()
        {
           
            try
            {
                

                return this.m_dbconnection.Query<ServiceCategory>("ServiceCategories_CRUD",
                                        new
                                        {

                                            Action = "ALL"
                                           
                                        },
                                          commandType: CommandType.StoredProcedure).ToList();

            }
            catch (Exception e)
            {
                throw e;
            }

        }
    }
}
