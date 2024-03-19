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
using UELPM.Util.FileOperations;

namespace UELPM.Service.Repositories
{
    public class TicketRepository : ITicketRepository
    {
        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);

        public TicketDisplayResult GetTickets(GridDisplayInput ticketInput)
        {
            try
            {
                TicketDisplayResult ticketDisplayResult = new TicketDisplayResult();
                //executing the stored procedure to get the list of purchase orders
                using (var result = this.m_dbconnection.QueryMultiple("TicketManagement_CRUD", new
                {
                    Action = "SELECT",
                    Skip = ticketInput.Skip,
                    Take = ticketInput.Take,
                    CompanyId=ticketInput.CompanyId,
                    Search=ticketInput.Search
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of purchase orders..
                    ticketDisplayResult.Tickets = result.Read<TicketList>().AsList();
                    //total number of purchase orders
                    ticketDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return ticketDisplayResult;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public TicketDisplayResult GetFilterTicket(TicketFilterDisplayInput ticketFilterDisplayInput)
        {
            try
            {
                TicketDisplayResult ticketDisplayResult = new TicketDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("TicketManagement_CRUD", new
                {
                    Action = "FILTER",
                    TicketNoFilter = ticketFilterDisplayInput.TicketNoFilter,
                    FacilityFilter = ticketFilterDisplayInput.FacilityFilter,
                    PriorityFilter = ticketFilterDisplayInput.PriorityFilter,
                    Skip = ticketFilterDisplayInput.Skip,
                    Take = ticketFilterDisplayInput.Take,
                    CompanyId = ticketFilterDisplayInput.CompanyId
                }, commandType: CommandType.StoredProcedure))
                {
                    //list of purchase orders..
                    ticketDisplayResult.Tickets = result.Read<TicketList>().AsList();
                    //total number of purchase orders
                    ticketDisplayResult.TotalRecords = result.ReadFirstOrDefault<int>();
                }
                return ticketDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }

        //public Ticket GetAssignEngineerlist()
        //{
        //    Ticket ticketManagementObj = new Ticket();
        //    try
        //    {
        //        using (var result = this.m_dbconnection.QueryMultiple("TicketManagement_CRUD", new
        //        {

        //            Action = "ENGINEERLIST",
        //            TicketId = ticketId
        //        }, commandType: CommandType.StoredProcedure))
        //        {
        //            ticketManagementObj.EngineerAssignList = result.Read<EngineerAssignList>().AsList();
        //        }
        //        return ticketManagementObj;
        //    }
        //    catch (Exception e)
        //    {
        //        throw e;
        //    }
        //}

        public Ticket GetTicketEngineer(int ticketId)
        {
            try
            {
                Ticket ticketObj = new Ticket();
                var EngineerAssign = this.m_dbconnection.Query<EngineerAssignList>("TicketManagement_CRUD", new
                {
                    Action = "SELECTENGINEERLIST",
                    TicketId = ticketId,
                }, commandType: CommandType.StoredProcedure);
                ticketObj.EngineerAssignList = EngineerAssign.ToList();
                return ticketObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public Ticket GetTicketDetails(int ticketId)
        {
            try
            {
                Ticket ticketManagementObj = new Ticket();

                using (var result = this.m_dbconnection.QueryMultiple("TicketManagement_CRUD", new
                {
                    Action = "SELECTBYID",
                    TicketId = ticketId
                }, commandType: CommandType.StoredProcedure))
                {
                    ticketManagementObj = result.Read<Ticket>().FirstOrDefault();
                    if (ticketManagementObj != null)
                    {
                        ticketManagementObj.EngineerAssignList = result.Read<EngineerAssignList>().ToList();
                        ticketManagementObj.InventoryItems = result.Read<InventoryItems, GetItemMasters, InventoryItems>((Pc, IM) =>
                        {
                            Pc.Item = IM;
                            Pc.ItemTotalPrice = (Pc.Price * Pc.ItemQty);
                            return Pc;
                        }, splitOn: "ItemMasterId").ToList();

                        ticketManagementObj.SubContractorItem = result.Read<SubContractorItem, Suppliers, SubContractorItem>((Pc, IM) =>
                        {
                            Pc.Supplier = IM;
                            return Pc;
                        }, splitOn: "SupplierId").ToList();


                        ticketManagementObj.TicketSendMessages = result.Read<TicketSendMessages>().ToList();
                        ticketManagementObj.OwnerDetails = result.Read<Customer>().FirstOrDefault();

                        decimal subTotal = 0;
                        subTotal = ticketManagementObj.InventoryItems.Sum(i => i.ItemTotalPrice);
                        ticketManagementObj.SubTotal = subTotal;
                        ticketManagementObj.TotalAmount = subTotal;
                        try
                        {
                            var quotationattachment = this.m_dbconnection.Query<TicketQuotationAttachments>("TicketQuotationFileOperations_CRUD", new
                            {
                                Action = "SELECTSUBCONTRACTORQUOTATION",
                                TicketId = ticketId
                            }, commandType: CommandType.StoredProcedure);

                            ticketManagementObj.TicketQuotationAttachment = quotationattachment.ToList();
                        }
                        catch { }
                        try
                        {
                            var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                            {
                                Action = "SELECT",
                                RecordId = ticketId,
                                AttachmentTypeId = AttachmentType.Ticket //static value need to change
                            }, commandType: CommandType.StoredProcedure);

                            ticketManagementObj.Attachments = attachments.ToList();
                        }
                        catch (Exception e)
                        {
                            throw e;
                        }


                    }
                }
                return ticketManagementObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool DeleteUnAssignEngineer(List<int> m_ticket)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    var paramaterObj = new DynamicParameters();
                    if (m_ticket.Count > 0)
                    {
                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                        foreach (var record in m_ticket)
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "DELETEUNASSIGN", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@TicketEngineerId", record, DbType.Int32, ParameterDirection.Input);
                            itemToAdd.Add(itemObj);
                        }
                        var purchaseOrderItemSaveResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }

                    transactionObj.Commit();
                    return true;
                }
                
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public bool CreateAssignEngineer(List<EngineerAssignList> m_ticket)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    var paramaterObj = new DynamicParameters();
                    if (m_ticket.Count > 0)
                    {
                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                        //looping through the list of engineer assign list...
                        foreach (var record in m_ticket.Where(i => i.TicketEngineerId == 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters(); 

                            itemObj.Add("@Action", "INSERTASSIGN", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@TicketId", 0, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@EngineerId", record.UserId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@IsAssigned", record.IsAssigned, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@AssignmentFromDateTime", record.AssignmentFromDateTime, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@AssignmentToDateTime", record.AssignmentToDateTime, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", record.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemToAdd.Add(itemObj);
                        }
                        var purchaseOrderItemSaveResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }

                    transactionObj.Commit();
                    return true;

                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<Engineer> GetEngineerslist1()
        {
            try
            {
                return this.m_dbconnection.Query<Engineer>("GetAllEngineerslist",
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        private CompanyDetails GetCompanyDetails(int companyId)
        {
            SharedRepository sharedRepository = new SharedRepository();
            return sharedRepository.GetCompanyDetails(companyId);
        }

        public bool SendTicketMailEngineer(int ticketId, int companyId)
        {
            try
            {
                Ticket m_ticket = GetTicketDetails(ticketId);
                var companyDetails = GetCompanyDetails(companyId);
                List<EngineerAssignList> engineerslist = new List<EngineerAssignList>();
                try
                {
                    var engineer = this.m_dbconnection.Query<EngineerAssignList>("FileOperations_CRUD", new
                    {
                        Action = "COUNTENGINEER",
                        Ticket = ticketId                     
                    }, commandType: CommandType.StoredProcedure);
                    engineerslist = engineer.ToList();
                }
                catch { }


                byte[] pdf = null;
                var result = Util.Email.PurchaseOrderEmailProvider.SendTicketMailtoEngineer(m_ticket, companyDetails, engineerslist, pdf);



                return result;

            }
            catch (Exception e)
            {
                throw e;
            }
        }





        public int TicketSendMessage(TicketSendMessages ticketSendMessages)
        {
            try
            {
                int TicketAuditTrailId = 0;
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    TicketAuditTrailId = this.m_dbconnection.QueryFirstOrDefault<int>("TicketManagement_CRUD", new
                    {
                        Action = "INSERTTICKETAUDIT",
                        TicketId = ticketSendMessages.TicketId,
                        Engineer_TenantId = ticketSendMessages.Engineer_TenantId,
                        UserId = ticketSendMessages.UserId,
                        Remarks = ticketSendMessages.Remarks,
                        ProcessId = ticketSendMessages.ProcessId,
                        CreatedDate = DateTime.Now
                    },
                     transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);

                    #region inserting record in notification
                    try
                    {
                        NotificationsRepository notificationObj = new NotificationsRepository();
                        notificationObj.CreateNotification(new Notifications()
                        {
                            NotificationId = 0,
                            NotificationType = SharedRepository.GetNotificationType(ticketSendMessages.ProcessId),
                            NotificationMessage = SharedRepository.GetNotificationMessage(ticketSendMessages.ProcessId),
                            ProcessId = ticketSendMessages.ProcessId,
                            ProcessName = "",
                            DocumentId = ticketSendMessages.TicketId,
                            UserId = ticketSendMessages.Engineer_TenantId,
                            IsRead = false,
                            CreatedBy = ticketSendMessages.UserId,
                            CreatedDate = DateTime.Now,
                            IsNew = true,
                            CompanyId = ticketSendMessages.CompanyId,
                            CompanyName = "",
                            IsforAll = false,
                            MessageType = Convert.ToInt32(NotificationMessageTypes.SentMessage),
                            DocumentCode = ticketSendMessages.TicketNo
                        });

                    }
                    catch (Exception e)
                    {
                        throw e;
                    }

                    #endregion



                    transactionObj.Commit();
                    return TicketAuditTrailId;
                }

            }
            catch (Exception e)
            {
                throw e;
            }
        }


        public int CreateTicket(Ticket m_ticket)
        {
            try
            {
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    var paramaterObj = new DynamicParameters();
                    string TicketCode = this.m_dbconnection.QueryFirstOrDefault<string>("TicketManagement_CRUD", new
                    {
                        Action = "COUNT",
                        CompanyId = m_ticket.CompanyId,
                    },
                    transaction: transactionObj,
                    commandType: CommandType.StoredProcedure);
                   int TicketId = this.m_dbconnection.QueryFirstOrDefault<int>("TicketManagement_CRUD", new
                    {
                        Action = "INSERT",
                        TicketNo = "TKT-" + TicketCode,
                        FacilityID = m_ticket.FacilityID,
                        CompanyId=m_ticket.CompanyId,
                        TicketPriority = m_ticket.TicketPriority,
                        PreferredServiceDatetime = m_ticket.PreferredServiceDatetime,
                        PrefferedFromTime = m_ticket.PrefferedFromTime,
                        PrefferedToTime = m_ticket.PrefferedToTime,
                        isBillable = m_ticket.isBillable,
                        IsbilltoTenant = m_ticket.IsbilltoTenant,
                        JobStatus = 1,
                        BillAmount = m_ticket.BillAmount,
                        JobDesciption = m_ticket.JobDesciption,
                        Statusid = 1,
                        Remarks = m_ticket.Remarks,
                        CreatedBy = m_ticket.CreatedBy,
                        CreatedDate = DateTime.Now,
                        Updatedby = m_ticket.CreatedBy,
                        UpdatedDate = DateTime.Now,
                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);


                    #region  we are saving Sub contractor items...
                    if (m_ticket.SubContractorItem.Count > 0)
                    {
                        int count = 0;
                        FileOperations fileOperationsObj = new FileOperations();
                        List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                        //looping through the list of contractor...
                        foreach (var record in m_ticket.SubContractorItem)
                        {
                            int SubContractorId = this.m_dbconnection.QueryFirstOrDefault<int>("TicketManagement_CRUD", new
                            {
                                Action = "INSERTCONTRACTORITEM",
                                SupplierId = record.Supplier.SupplierId,
                                TicketId = TicketId,
                                SupplierCategoryID = record.SupplierCategoryID,
                                QuotationAmount = record.QuotationAmount,
                                CreatedBy = m_ticket.CreatedBy,
                                CreatedDate = DateTime.Now,
                            },
                               transaction: transactionObj,
                               commandType: CommandType.StoredProcedure);

                            for (var i = 0; i < m_ticket.Files.Count; i++)
                            {
                                try
                                {                                   
                                    if (m_ticket.Files[i].FileName.Contains("TicketSubContractor@" + count))
                                    {
                                        string[] name = m_ticket.Files[i].FileName.Split('@', '!');
                                        int RowID = Convert.ToInt32(name[1]);
                                        string Filname = name[2];
                                        var itemObj = new DynamicParameters();
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@TicketId", TicketId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@SubContractorId", SubContractorId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", Filname, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        quotationItemToAdd.Add(itemObj);
                                    }
                                }
                                catch { }
                            }
                            count++;
                        }
                        var TicketQuotationItemSaveResult = this.m_dbconnection.Execute("TicketQuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }
                    #endregion







                    //Engineer Assign
                    #region  we are saving Engineer assign list...

                    if (m_ticket.EngineerAssignList != null)
                    {
                        List<DynamicParameters> itemToAdd = new List<DynamicParameters>();
                        //looping through the list of engineer assign list...
                        foreach (var record in m_ticket.EngineerAssignList)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERTASSIGN", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@TicketId", TicketId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@EngineerId", record.UserId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@EngineerStatusId", record.EngineerStatusId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@IsAssigned", record.IsAssigned, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@AssignmentFromDateTime", record.AssignmentFromDateTime, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@AssignmentToDateTime", record.AssignmentToDateTime, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", record.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemToAdd.Add(itemObj);
                        }
                        var purchaseOrderItemSaveResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemToAdd, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }
                    #endregion

                    #region  we are saving purchase order items...
                    if (m_ticket.InventoryItems != null)
                    {
                        List<DynamicParameters> itemToAdd1 = new List<DynamicParameters>();
                        //looping through the list of inventory items...
                        foreach (var record in m_ticket.InventoryItems)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@TicketId", TicketId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                            itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@Price", record.Price, DbType.Decimal, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemToAdd1.Add(itemObj);
                        }
                        var purchaseOrderRequestItemSaveResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemToAdd1, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                    }
                    #endregion



                    //Attachment
                    if (m_ticket.Files != null)
                    {
                        try
                        {
                            //saving files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = "Ticket",
                                Files = m_ticket.Files,
                                UniqueId = TicketId.ToString()
                            });

                            List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                            for (var i = 0; i < m_ticket.Files.Count; i++)
                            {
                                try
                                {
                                    var itemObj = new DynamicParameters();
                                    if (!m_ticket.Files[i].FileName.Contains("TicketSubContractor@"))
                                    {
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@AttachmentTypeId", AttachmentType.Ticket, DbType.Int32, ParameterDirection.Input);//static value need to change
                                        itemObj.Add("@RecordId", TicketId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", m_ticket.Files[i].FileName, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        fileToSave.Add(itemObj);
                                    }
                                }
                                catch { }
                            }
                            var purchaseOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                        }
                        catch (Exception e)
                        {
                            throw e;
                        }
                    }

                    transactionObj.Commit();
                    return TicketId;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool DeleteAllEngineer(int ticketid)
        {
            this.m_dbconnection.Open();//opening the connection...
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    var ticketDeleteResult = this.m_dbconnection.Execute("TicketManagement_CRUD",
                                                    new
                                                    {
                                                        Action = "DELETEENGINEER",
                                                        Ticketid = ticketid
                                                    },
                                                    transaction: transactionObj,
                                                    commandType: CommandType.StoredProcedure);

                    transactionObj.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                    throw ex;
                }
            }
        }

       

        public bool UpdateTicket(Ticket m_ticket)
        {
            try
            {
                string check = null;
                this.m_dbconnection.Open();
                using (var transactionObj = this.m_dbconnection.BeginTransaction())
                {
                    var paramaterObj = new DynamicParameters();
                    int TicketId = this.m_dbconnection.QueryFirstOrDefault<int>("TicketManagement_CRUD", new
                    {
                        Action = "UPDATE",
                        TicketId = m_ticket.TicketId,
                        FacilityID = m_ticket.FacilityID,
                        TicketPriority = m_ticket.TicketPriority,
                        PreferredServiceDatetime = m_ticket.PreferredServiceDatetime,
                        PrefferedFromTime = m_ticket.PrefferedFromTime,
                        PrefferedToTime = m_ticket.PrefferedToTime,
                        isBillable = m_ticket.isBillable,
                        IsbilltoTenant = m_ticket.IsbilltoTenant,
                        JobStatus = Convert.ToString(m_ticket.Statusid),
                        BillAmount = m_ticket.BillAmount,
                        JobDesciption = m_ticket.JobDesciption,
                        Statusid = 1,
                        Remarks = m_ticket.Remarks,
                        Updatedby = m_ticket.CreatedBy,
                        UpdatedDate = DateTime.Now,
                    },
                        transaction: transactionObj,
                        commandType: CommandType.StoredProcedure);


                    var ticketDeleteResult = this.m_dbconnection.Execute("TicketManagement_CRUD",
                                                 new
                                                 {
                                                     Action = "DELETEENGINEER",
                                                     Ticketid = m_ticket.TicketId
                                                 },
                                                 transaction: transactionObj,
                                                 commandType: CommandType.StoredProcedure);

                    #region  we are saving sub contractor Quotation items..
                    if (m_ticket.SubContractorItem != null)
                    {
                        FileOperations fileOperationsObj = new FileOperations();
                        List<DynamicParameters> quotationItemToAdd = new List<DynamicParameters>();
                        //looping through the list of purchase order items...
                        int count = 0;
                        foreach (var record in m_ticket.SubContractorItem.Where(j => j.SubContractorId == 0).Select(j => j))
                        {
                            int SubContractorId = this.m_dbconnection.QueryFirstOrDefault<int>("TicketManagement_CRUD", new
                            {
                                Action = "INSERTCONTRACTORITEM",
                                SupplierId = record.Supplier.SupplierId,
                                TicketId = TicketId,
                                SupplierCategoryID = record.SupplierCategoryID,
                                QuotationAmount = record.QuotationAmount,
                                CreatedBy = m_ticket.CreatedBy,
                                CreatedDate = DateTime.Now
                            },
                            transaction: transactionObj,
                                            commandType: CommandType.StoredProcedure);

                            int countvalue = this.m_dbconnection.QueryFirstOrDefault<int>("TicketQuotationFileOperations_CRUD", new
                            {
                                Action = "FETCHQUOTATIONITEM",
                                TicketId = m_ticket.TicketId,
                            },
                            transaction: transactionObj,
                                            commandType: CommandType.StoredProcedure);
                            if (countvalue > 0)
                            {
                                count = countvalue + 1;
                            }
                            //countvalue = countvalue;
                            for (var i = 0; i < m_ticket.Files.Count; i++)
                            {
                                try
                                {
                                    string[] name = m_ticket.Files[i].FileName.Split('@', '!');
                                    int RowID = Convert.ToInt32(name[1]);
                                    if (m_ticket.Files[i].FileName.Contains("TicketSubContractor@" + count))
                                    {

                                        string Filname = name[2];
                                        var itemObj = new DynamicParameters();
                                        itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@TicketId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@SubContractorId", SubContractorId, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@FileName", Filname, DbType.String, ParameterDirection.Input);
                                        itemObj.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        quotationItemToAdd.Add(itemObj);
                                    }
                                }
                                catch { }
                            }
                            check += count + ",";
                            count++;
                        }
                        var purchaseOrderRequestItemSaveResult = this.m_dbconnection.Execute("TicketQuotationFileOperations_CRUD", quotationItemToAdd, transaction: transactionObj,
                                                           commandType: CommandType.StoredProcedure);



                        bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                        {
                            CompanyName = "UEL",
                            ModuleName = "TicketSubContractor",
                            Files = m_ticket.Files,
                            UniqueId = m_ticket.TicketId.ToString()
                        });

                    }

                    #endregion


                    #region  we are saving sub contractor Quotation items..
                    if (m_ticket.SubContractorItem != null)
                    {
                        int add = 0;
                        int count = 0;

                        List<DynamicParameters> quotationItemToUpdate = new List<DynamicParameters>();
                        //looping through the list of purchase order items...
                        foreach (var record in m_ticket.SubContractorItem.Where(k => k.SubContractorId > 0).Select(k => k))
                        {
                            for (var i = 0; i <= m_ticket.Files.Count; i++)
                            {
                                try
                                {
                                    string[] name = m_ticket.Files[i].FileName.Split('@', '!');
                                    string RowID = (name[1]);
                                    if (check == null)
                                    {
                                        count = Convert.ToInt32(RowID);
                                        check += RowID + ",";
                                        break;
                                    }
                                    if (!check.Contains(RowID))
                                    {
                                        count = Convert.ToInt32(RowID);
                                        check += RowID + ",";
                                        break;
                                    }
                                }
                                catch { }
                            }
                            int updatequotationResult = this.m_dbconnection.Execute("TicketManagement_CRUD", new
                            {
                                Action = "UPDATECONTRACTORITEM",
                                SubContractorId = record.SubContractorId,
                                SupplierCategoryID = record.SupplierCategoryID,
                                SupplierId= record.Supplier.SupplierId,
                                QuotationAmount= record.QuotationAmount,
                                CreatedBy = m_ticket.CreatedBy,
                                CreatedDate = DateTime.Now
                            },
                             transaction: transactionObj,
                             commandType: CommandType.StoredProcedure);

                            for (var i = 0; i < m_ticket.Files.Count; i++)
                            {
                                try
                                {
                                    string[] name = m_ticket.Files[i].FileName.Split('@', '!');
                                    int RowID = Convert.ToInt32(name[1]);
                                    if (m_ticket.Files[i].FileName.Contains("TicketSubContractor@" + count))
                                    {
                                        string Filename = name[2];
                                        var itemObj1 = new DynamicParameters();
                                        itemObj1.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                        itemObj1.Add("@TicketId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@SubContractorId", record.SubContractorId, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@FileName", Filename, DbType.String, ParameterDirection.Input);
                                        itemObj1.Add("@RecordId", RowID, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                        itemObj1.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                        quotationItemToUpdate.Add(itemObj1);
                                    }
                                }
                                catch { }
                            }
                            //count++;
                            add++;

                        }
                        var purchaseOrderRequestVendorItemSaveResult = this.m_dbconnection.Execute("TicketQuotationFileOperations_CRUD", quotationItemToUpdate, transaction: transactionObj,
                                                           commandType: CommandType.StoredProcedure);
                    }

                    #endregion

                    

                    //Engineer Assign
                    #region  we are saving Engineer assign list...

                    if (m_ticket.EngineerAssignList != null)
                    {
                        List<DynamicParameters> itemToAdd1 = new List<DynamicParameters>();

                        foreach (var record in m_ticket.EngineerAssignList.Where(i => i.TicketEngineerId == 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "INSERTASSIGN", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@TicketId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CompanyId", record.CompanyId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@EngineerId", record.UserId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@EngineerStatusId", record.EngineerStatusId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@IsAssigned", record.IsAssigned, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@AssignmentFromDateTime", record.AssignmentFromDateTime, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@AssignmentToDateTime", record.AssignmentToDateTime, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", record.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                            itemToAdd1.Add(itemObj);
                        }
                        var purchaseOrderItemSaveResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemToAdd1, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                        List<DynamicParameters> itemsToUpdate1 = new List<DynamicParameters>();

                        foreach (var record in m_ticket.EngineerAssignList.Where(i => i.TicketEngineerId > 0).Select(i => i))
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "UPDATEASSIGN", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@TicketId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@EngineerId", record.UserId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@EngineerStatusId", record.EngineerStatusId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@IsAssigned", record.IsAssigned, DbType.Boolean, ParameterDirection.Input);
                            itemObj.Add("@AssignmentFromDateTime", record.AssignmentFromDateTime, DbType.DateTime, ParameterDirection.Input);
                            itemObj.Add("@AssignmentToDateTime", record.AssignmentToDateTime, DbType.DateTime, ParameterDirection.Input);
                            itemsToUpdate1.Add(itemObj);
                        }
                        var inventoryUpdateResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemsToUpdate1, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);
                     
                    }
                    #endregion


                    #region deleting engineer...

                    List<DynamicParameters> itemsToDelete = new List<DynamicParameters>();

                    if (m_ticket.EmployeeAssignToDelete != null)
                    {
                        //looping through the list of purchase order items...
                        foreach (var record in m_ticket.EmployeeAssignToDelete)
                        {
                            var itemObj = new DynamicParameters();
                            itemObj.Add("@Action", "DELETEASSIGN", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@TicketId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@EngineerId", record, DbType.Int32, ParameterDirection.Input);
                            itemsToDelete.Add(itemObj);
                        }
                    }

                    var purchaseOrderItemDeleteResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemsToDelete,
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                    #endregion

                    #region we are saving purchase order items...

                    List<DynamicParameters> itemToAdd = new List<DynamicParameters>();

                    //looping through the list of purchase order items...
                    foreach (var record in m_ticket.InventoryItems.Where(i => i.InventoryItemId == 0).Select(i => i))
                    {

                        var itemObj = new DynamicParameters();

                        itemObj.Add("@Action", "INSERTITEM", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@TicketId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@Price", record.Price, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);     
                        itemToAdd.Add(itemObj);
                    }


                    var inventoryItemSaveResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemToAdd,
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                    #endregion

                    #region  we are saving Sub contractor items...
                    
                        List<DynamicParameters> itemToAdd2 = new List<DynamicParameters>();
                    //looping through the list of purchase order items...
                    foreach (var record in m_ticket.SubContractorItem.Where(i => i.SubContractorId == 0).Select(i => i))
                    {
                        var itemObj = new DynamicParameters();

                        itemObj.Add("@Action", "INSERTCONTRACTORITEM", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@TicketId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@SupplierCategoryID", record.SupplierCategoryID, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@SupplierId", record.Supplier.SupplierId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@QuotationAmount", record.QuotationAmount, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                        itemToAdd2.Add(itemObj);
                    }
                    var SubContractorItemSaveResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemToAdd2, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                    #endregion




                    #region updating purchase order items...

                    List<DynamicParameters> itemsToUpdate = new List<DynamicParameters>();

                    //looping through the list of purchase order items...
                    foreach (var record in m_ticket.InventoryItems.Where(i => i.InventoryItemId > 0).Select(i => i))
                    {

                        var itemObj = new DynamicParameters();

                        itemObj.Add("@Action", "UPDATEITEM", DbType.String, ParameterDirection.Input);
                        itemObj.Add("@InventoryItemId", record.InventoryItemId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@MeasurementUnitId", record.MeasurementUnitID, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@ItemMasterId", record.Item.ItemMasterId, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@ItemDescription", record.ItemDescription, DbType.String, ParameterDirection.Input);
                        itemObj.Add("@ItemQty", record.ItemQty, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@Price", record.Price, DbType.Decimal, ParameterDirection.Input);
                        itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                        itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                        itemsToUpdate.Add(itemObj);
                    }


                    var purchaseOrderItemUpdateResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemsToUpdate,
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                    #endregion

                    #region deleting purchase order items...

                    List<DynamicParameters> itemsToDelete1 = new List<DynamicParameters>();

                    if (m_ticket.InventoryItemsToDelete != null)
                    {
                        //looping through the list of purchase order items...
                        foreach (var inventoryItemId in m_ticket.InventoryItemsToDelete)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "DELETEITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@inventoryItemId", inventoryItemId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemsToDelete1.Add(itemObj);
                        }
                    }

                    var purchaseOrderRequestItemDeleteResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemsToDelete1,
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                    #endregion

                    #region deleting sub contractor items...

                    List<DynamicParameters> itemsToDelete2 = new List<DynamicParameters>();

                    if (m_ticket.InventoryItemsToDelete != null)
                    {
                        //looping through the list of purchase order items...
                        foreach (var subContractorId in m_ticket.SubContractorItemToDelete)
                        {
                            var itemObj = new DynamicParameters();

                            itemObj.Add("@Action", "DELETECONTRACTORITEM", DbType.String, ParameterDirection.Input);
                            itemObj.Add("@SubContractorId", subContractorId, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                            itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

                            itemsToDelete2.Add(itemObj);
                        }
                    }

                    var SubContractorItemDeleteResult = this.m_dbconnection.Execute("TicketManagement_CRUD", itemsToDelete2,
                                                                transaction: transactionObj,
                                                                commandType: CommandType.StoredProcedure);
                    #endregion


                    #region deleting sub contractor quotation attachments
                    if (m_ticket.TicketQuotationAttachmentDelete != null)
                    {
                        for (var i = 0; i < m_ticket.TicketQuotationAttachmentDelete.Count; i++)
                        {
                            var fileObj = new DynamicParameters();
                            fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                            fileObj.Add("@SubContractorQuotationId", m_ticket.TicketQuotationAttachmentDelete[i].SubContractorQuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                            fileObj.Add("@SubContractorId", m_ticket.TicketQuotationAttachmentDelete[i].SubContractorId, DbType.Int32, ParameterDirection.Input);//static value need to change
                            fileObj.Add("@RecordId", m_ticket.TicketQuotationAttachmentDelete[i].RowId, DbType.Int32, ParameterDirection.Input);
                            fileObj.Add("@TicketId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);

                            var subcontractorquotationFileDeleteResult = this.m_dbconnection.Query<string>("TicketQuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);

                            //deleting files in the folder...
                            FileOperations fileOperationsObj = new FileOperations();
                            bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                            {
                                CompanyName = "UEL",
                                ModuleName = "TicketSubContractor",
                                FilesNames = subcontractorquotationFileDeleteResult.ToArray(),
                                UniqueId = m_ticket.TicketId.ToString()
                            });

                        }
                    }

                    #endregion

                    #region deleting quotation attachments
                    if (m_ticket.TicketQuotationAttachmentUpdateRowId != null)
                    {
                        for (var i = 0; i < m_ticket.TicketQuotationAttachmentUpdateRowId.Count; i++)
                        {
                            var fileObj = new DynamicParameters();
                            fileObj.Add("@Action", "UPDATEROW", DbType.String, ParameterDirection.Input);
                            fileObj.Add("@SubContractorQuotationId", m_ticket.TicketQuotationAttachmentUpdateRowId[i].SubContractorQuotationId, DbType.Int32, ParameterDirection.Input);//static value need to change
                            fileObj.Add("@RecordId", m_ticket.TicketQuotationAttachmentUpdateRowId[i].RowId, DbType.Int32, ParameterDirection.Input);

                            var Quotationrowupdate = this.m_dbconnection.Query<string>("QuotationFileOperations_CRUD", fileObj, transaction: transactionObj,
                                                               commandType: CommandType.StoredProcedure);
                        }
                    }

                    #endregion



                    #region deleting attachments
                    //looping through attachments
                    try
                    {
                        if (m_ticket.AttachmentsDelete != null)
                        {
                            List<DynamicParameters> fileToDelete = new List<DynamicParameters>();
                            for (var i = 0; i < m_ticket.AttachmentsDelete.Count; i++)
                            {
                                var fileObj = new DynamicParameters();
                                fileObj.Add("@Action", "DELETE", DbType.String, ParameterDirection.Input);
                                //fileObj.Add("@AttachmentTypeId", m_ticket.AttachmentsDelete[i].AttachmentTypeId, DbType.Int32, ParameterDirection.Input);//static value need to change
                                fileObj.Add("@RecordId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);
                                fileObj.Add("@AttachmentId", m_ticket.AttachmentsDelete[i].AttachmentId, DbType.Int32, ParameterDirection.Input);
                                fileToDelete.Add(fileObj);

                                var purchaseOrderFileDeleteResult = this.m_dbconnection.Query<string>("FileOperations_CRUD", fileObj, transaction: transactionObj,
                                                                   commandType: CommandType.StoredProcedure);
                                //deleting files in the folder...
                                FileOperations fileOperationsObj = new FileOperations();
                                bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                                {
                                    CompanyName = "UEL",
                                    ModuleName = "Ticket",
                                    FilesNames = purchaseOrderFileDeleteResult.ToArray(),//m_ticket.AttachmentsDelete.Select(j => j.FileName).ToArray(),
                                    UniqueId = m_ticket.TicketId.ToString()
                                });
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        throw e;
                    }


                    #endregion

                    #region saving files uploaded files...
                    try
                    {
                        List<DynamicParameters> fileToSave = new List<DynamicParameters>();
                        for (var i = 0; i < m_ticket.Files.Count; i++)
                        {
                            var itemObj = new DynamicParameters();
                            if (!m_ticket.Files[i].FileName.Contains("TicketSubContractor@"))
                            {
                                itemObj.Add("@Action", "INSERT", DbType.String, ParameterDirection.Input);
                                itemObj.Add("@AttachmentTypeId", AttachmentType.Ticket, DbType.Int32, ParameterDirection.Input);//static value need to change
                                itemObj.Add("@RecordId", m_ticket.TicketId, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@FileName", m_ticket.Files[i].FileName, DbType.String, ParameterDirection.Input);
                                itemObj.Add("@CreatedBy", m_ticket.CreatedBy, DbType.Int32, ParameterDirection.Input);
                                itemObj.Add("@CreatedDate", DateTime.Now, DbType.DateTime, ParameterDirection.Input);
                                fileToSave.Add(itemObj);
                            }
                        }
                        var purchaseOrderFileSaveResult = this.m_dbconnection.Execute("FileOperations_CRUD", fileToSave, transaction: transactionObj,
                                commandType: CommandType.StoredProcedure);

                        //saving files in the folder...
                        FileOperations fileOperationsObj = new FileOperations();
                        bool fileStatus = fileOperationsObj.SaveFile(new FileSave
                        {
                            CompanyName = "UEL",
                            ModuleName = "Ticket",
                            Files = m_ticket.Files,
                            UniqueId = m_ticket.TicketId.ToString()
                        });

                    }
                    catch (Exception e)
                    {
                        throw e;
                    }
                    #endregion


                    transactionObj.Commit();
                    return true;
                }

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public byte[] DownloadTicketQuotationFile(TicketQuotationAttachments ticketQuotationAttachments)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();
                var fileContent = fileOperationsObj.ReadQuotationFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = "TicketSubContractor",
                    FilesNames = new string[] { ticketQuotationAttachments.FileName },
                    UniqueId = ticketQuotationAttachments.TicketId.ToString() + "\\" + ticketQuotationAttachments.RowId
                });
                return fileContent;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

         public bool deleteEngineer(int userId)
        {
            this.m_dbconnection.Open();//opening the connection...
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    var ticketDeleteResult = this.m_dbconnection.Execute("TicketManagement_CRUD",
                                                    new
                                                    {
                                                        Action = "DELETEENGINEER",
                                                        userId = userId
                                                    },
                                                    transaction: transactionObj,
                                                    commandType: CommandType.StoredProcedure);

                    transactionObj.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                    throw ex;
                }
            }
        }
    
        public bool DeleteTicket(TicketDelete ticketDelete)
        {
            this.m_dbconnection.Open();//opening the connection...
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    var ticketDeleteResult = this.m_dbconnection.Execute("TicketManagement_CRUD",
                                                    new
                                                    {
                                                        Action = "DELETEALLITEMS",
                                                        TicketId = ticketDelete.TicketId,
                                                        Updatedby = ticketDelete.UserID,
                                                        UpdatedDate = DateTime.Now
                                                    },
                                                    transaction: transactionObj,
                                                    commandType: CommandType.StoredProcedure);
                 
                    #region deleting all the files related to this ticket
                    try
                    {
                        var parameterObj1 = new DynamicParameters();
                        parameterObj1.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                        parameterObj1.Add("@TicketId", ticketDelete.TicketId, DbType.Int32, ParameterDirection.Input);

                        var deletedQuotationAttachmentNames = this.m_dbconnection.Query<string>("TicketQuotationFileOperations_CRUD", parameterObj1, transaction: transactionObj,
                                                           commandType: CommandType.StoredProcedure);
                        //saving files in the folder...
                        FileOperations fileOperationsObj = new FileOperations();
                        bool fileStatus1 = fileOperationsObj.DeleteFile(new FileSave
                        {
                            CompanyName = "UEL",
                            ModuleName = "TicketSubContractor",
                            FilesNames = deletedQuotationAttachmentNames.ToArray(),
                            UniqueId = ticketDelete.TicketId.ToString()
                        });




                        var parameterObj = new DynamicParameters();
                        parameterObj.Add("@Action", "DELETEALL", DbType.String, ParameterDirection.Input);
                        parameterObj.Add("@RecordId", ticketDelete.TicketId, DbType.Int32, ParameterDirection.Input);
                        parameterObj.Add("@AttachmentTypeId", ticketDelete.AttachmentTypeId, DbType.Int32, ParameterDirection.Input);

                        var deletedAttachmentNames = this.m_dbconnection.Query<string>("FileOperations_CRUD", parameterObj, transaction: transactionObj,
                                                            commandType: CommandType.StoredProcedure);

                        //saving files in the folder...
                        bool fileStatus = fileOperationsObj.DeleteFile(new FileSave
                        {
                            CompanyName = "UEL",
                            ModuleName = "Ticket",
                            FilesNames = deletedAttachmentNames.ToArray(),
                            UniqueId = ticketDelete.TicketId.ToString()
                        });

                    }
                    catch (Exception e)
                    {
                        throw e;
                    }
                    #endregion

                    transactionObj.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                    throw ex;
                }
            }
        }

        public Ticket GetTicketAttachment(int ticketId)
        {
            try
            {
                Ticket ticketObj = new Ticket();
                var attachments = this.m_dbconnection.Query<Attachments>("FileOperations_CRUD", new
                {
                    Action = "SELECT",
                    RecordId = ticketId,
                    AttachmentTypeId = AttachmentType.Ticket 
                }, commandType: CommandType.StoredProcedure);
                ticketObj.Attachments = attachments.ToList();
                return ticketObj;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public IEnumerable<EngineerAssignList> GetEngineerslist(GridDisplayInput gridDisplayInput)
        {
            try
            {
                return this.m_dbconnection.Query<EngineerAssignList>("GetEngineerslist",
                                        new
                                        {
                                            FromTime= gridDisplayInput.FromTime,
                                            ToTime= gridDisplayInput.ToTime,
                                            TicketId=gridDisplayInput.TicketId
                                        },
                                         commandType: CommandType.StoredProcedure);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        

        public EngineerAssignDisplayResult GetEngineerAssignListing(EmployeeAssignDisplayInput empassignDisplayInput)
        {
            try
            {
                EngineerAssignDisplayResult empassignDisplayResult = new EngineerAssignDisplayResult();
                using (var result = this.m_dbconnection.QueryMultiple("TicketManagement_CRUD", new
                {
                    Action = "Assign",
                    Skip = empassignDisplayInput.Skip,
                    Take = empassignDisplayInput.Take,
                    UserId = empassignDisplayInput.UserId,
                    AssignDate = empassignDisplayInput.AssignDate,
                    FromTime = empassignDisplayInput.FromTime,
                    ToTime = empassignDisplayInput.ToTime,
                }, commandType: CommandType.StoredProcedure))
                {
                    empassignDisplayResult.Engineer = result.Read<Engineer>().AsList();
                }
                return empassignDisplayResult;
            }
            catch (Exception ex)
            { throw ex; }
        }


        public int EngineerAvailableStatus(int EngineerId)
        {
            try
            {
                return this.m_dbconnection.Query<int>("TicketManagement_CRUD", new { Action = "CHECKSTATUS", EngineerId = EngineerId }, commandType: CommandType.StoredProcedure).FirstOrDefault();
            }
            catch (Exception ex)
            { throw ex; }
        }

        public byte[] DownloadFile(Attachments attachment)
        {
            try
            {
                //saving files in the folder...
                FileOperations fileOperationsObj = new FileOperations();
                var fileContent = fileOperationsObj.ReadFile(new FileSave
                {
                    CompanyName = "UEL",
                    ModuleName = "Ticket",
                    FilesNames = new string[] { attachment.FileName },
                    UniqueId = attachment.RecordId
                });
                return fileContent;
            }
            catch (Exception e)
            {
                throw e;
            }
        }


        #region not implemented in angular

        public bool UpdateEngineerStatus(TicketManagement ticketManagement)
        {
            this.m_dbconnection.Open();//opening the connection...
            using (var transactionObj = this.m_dbconnection.BeginTransaction())
            {
                try
                {
                    var ticketDeleteResult = this.m_dbconnection.Execute("TicketManagement_CRUD",
                                                    new
                                                    {
                                                        Action = "ACCEPTORNOTACCEPTED",
                                                        Ticketid = ticketManagement.TicketId,
                                                        TicketEngineerId = ticketManagement.TicketEngineerId,
                                                        EngineerStatusId = ticketManagement.EngineerStatusId
                                                    },
                                                    transaction: transactionObj,
                                                    commandType: CommandType.StoredProcedure);

                    transactionObj.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    transactionObj.Rollback();
                    throw ex;
                }
            }
        }



        #endregion


    }
}
