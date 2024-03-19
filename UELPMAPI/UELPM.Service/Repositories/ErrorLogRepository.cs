using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;
using UELPM.Service.Interface;
using Dapper;
namespace UELPM.Service.Repositories
{
    public class ErrorLogRepository : IErrrorLogRepository
    {
        private readonly IDbConnection _db;
        private string TenantName;
        private int TenantId;
        //string UELConnectionStr = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public ErrorLogRepository(UserInfo MyUserInfo)
        {
            m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        }

        public int SaveLog(string Message)
        {
            //SELECT SCOPE_IDENTITY()
            int NewListId = 0;
            //string insertUserSql = @"INSERT errorlog(tenantId,tenantName,message,createdDate) values (@tenantId,@tenantName, @message, @createdDate);
            //                        SELECT LAST_INSERT_ID();";

            string insertUserSql = @"INSERT errorlog(tenantId,tenantName,message,createdDate) values (@tenantId,@tenantName, @message, @createdDate);
                                    SELECT SCOPE_IDENTITY();";

            NewListId = this.m_dbconnection.QuerySingle<int>(insertUserSql,
                                            new
                                            {
                                                Id = 0,
                                                tenantId = TenantId,
                                                tenantName = TenantName,
                                                message = Message,
                                                createdDate = DateTime.Now
                                            });

            return NewListId;
        }
    }
}
