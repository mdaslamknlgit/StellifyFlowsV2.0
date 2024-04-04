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
using UELPM.Service.Exceptions;

namespace UELPM.Service.Repositories
{ 
    public class NotificationsRepository : INotificationsRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public NotificationisplayResult GetAllNotifications(NotificationDisplayInput notificationDisplayInput)
        {
            try
            {
                NotificationisplayResult notificationisplayResult = new NotificationisplayResult();
              
                using (var result = this.m_dbconnection.QueryMultiple("Notifications_CRUD", new
                {
                    Action = "GETBYUSERID",
                    UserId = notificationDisplayInput.UserId,
                    Skip = notificationDisplayInput.Skip,
                    Take = notificationDisplayInput.Take,
                    CompanyId= notificationDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    notificationisplayResult.Notifications = result.Read<Notifications>().AsList();              
                    notificationisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //notificationisplayResult.UnReadNotificationsCount = result.ReadFirstOrDefault<int>();
                }
                return notificationisplayResult;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public NotificationisplayResult GetNewNotifications(NotificationDisplayInput notificationDisplayInput)
        {
            try
            {
                NotificationisplayResult notificationisplayResult = new NotificationisplayResult();

                notificationisplayResult.Notifications = this.m_dbconnection.Query<Notifications>("Notifications_CRUD", new
                {
                    Action = "GETNEWNOTIFICATION",
                    UserId = notificationDisplayInput.UserId,
                    Skip = notificationDisplayInput.Skip,
                    Take = notificationDisplayInput.Take,
                    CompanyId = notificationDisplayInput.CompanyId,
                    IsNew = true
                }, commandType: CommandType.StoredProcedure).ToList();
                return notificationisplayResult;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void CreateNotification(Notifications notifications)
        {
            try
            {

                var result = this.m_dbconnection.QueryMultiple("Notifications_CRUD",
                                new
                                {
                                    Action = "INSERT",
                                    CompanyId = notifications.CompanyId,
                                    IsforAll = notifications.IsforAll,
                                    IsNew = notifications.IsNew,
                                    IsRead = notifications.IsRead,
                                    NotificationMessage = notifications.NotificationMessage,
                                    NotificationType = notifications.NotificationType,
                                    UserId = notifications.UserId,
                                    CreatedBy = notifications.CreatedBy,
                                    CreatedDate = DateTime.Now,
                                    ProcessId = notifications.ProcessId,
                                    DocumentId = notifications.DocumentId,
                                    MessageType = notifications.MessageType,
                                    DocumentCode = notifications.DocumentCode
                                }, commandType: CommandType.StoredProcedure);
                if (notifications != null && notifications.UserId > 0)
                {
                    UserProfileRepository userProfileRepository = new UserProfileRepository();
                    string approverName = userProfileRepository.GetUserById(notifications.UserId).UserName;
                    AuditLog.Info("Notifications", "create", notifications.CreatedBy.ToString(), notifications.DocumentId.ToString(), "create", "Notification sent to "+approverName+". "+ notifications.NotificationMessage + " " + notifications.DocumentCode, notifications.CompanyId);
                }
                else
                {
                    AuditLog.Info("Notifications", "create", notifications.CreatedBy.ToString(), notifications.DocumentId.ToString(), "create", notifications.NotificationMessage + " " + notifications.DocumentCode, notifications.CompanyId);
                }

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public int UpdateNotification(List<Notifications> notifications)
        {
            try
            {
                List<DynamicParameters> notificationsList = new List<DynamicParameters>();
                UserProfileRepository userProfileRepository = new UserProfileRepository();
                //looping through the list of purchase order items...
                int UserId = 0;
                if (notifications!=null && notifications.Count > 0)
                {
                    UserId = notifications[0].CreatedBy;
                }
                foreach (var record in notifications)
                {
                    string approverName = userProfileRepository.GetUserById(record.UserId).UserName;
                    var notificationToUpdate = new DynamicParameters();
                    notificationToUpdate.Add("@Action", "UPDATE", DbType.String, ParameterDirection.Input);
                    notificationToUpdate.Add("@NotificationId", record.NotificationId, DbType.Int32, ParameterDirection.Input);
                    notificationToUpdate.Add("@IsNew", record.IsNew, DbType.Boolean, ParameterDirection.Input);
                    notificationToUpdate.Add("@IsRead", record.IsRead, DbType.Boolean, ParameterDirection.Input);
                    notificationToUpdate.Add("@UpdatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                    notificationsList.Add(notificationToUpdate);
                    //if (!string.IsNullOrEmpty(approverName))
                    //{
                    //    AuditLog.Info("Notifications", "update", UserId.ToString(), record.DocumentId.ToString(), "update", "Notification sent to "+approverName+". "+ record.NotificationMessage + " " + record.DocumentCode);
                    //}
                    //else
                    //{
                    //    AuditLog.Info("Notifications", "update", UserId.ToString(), record.DocumentId.ToString(), "update", record.NotificationMessage + " " + record.DocumentCode);
                    //}
                }
                var result = this.m_dbconnection.Execute("Notifications_CRUD", notificationsList, commandType: CommandType.StoredProcedure);
                return result;
            }
            catch (Exception ex)
            { throw ex; }
        }

    }
}
