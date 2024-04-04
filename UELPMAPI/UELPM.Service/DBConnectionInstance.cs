using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

namespace UELPM.Service
{
    public sealed class DBConnectionInstance
    {
        private DBConnectionInstance() { }
        private static readonly string ConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        private static IDbConnection dbConnection = new SqlConnection(ConnectionString);

        //public static IDbConnection UniqueDBConInstance
        //{
            
        //    get {
                
        //        if (dbConnection != null)
        //        {
        //            //lock (dbConnection)
        //            //{
        //                SqlConnection.ClearAllPools();
        //                dbConnection = new SqlConnection(ConnectionString);
                         
        //                    if (dbConnection.State == ConnectionState.Open)
        //                    {
        //                        dbConnection.Close();
        //                    //dbConnection.Dispose();
        //                    }

                       
        //                dbConnection.Open();
                     
        //            //}
        //        }
        //        return dbConnection;
        //    }
            
        //}
    }
}
