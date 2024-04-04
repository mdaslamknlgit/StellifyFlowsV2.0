using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;
using UELPM.Service.Interface;
using Dapper;
using System.Configuration;
using System.Data.SqlClient;
using UELPM.Model.Models;

namespace UELPM.Service.Repositories
{
    public class DealsRepository : IDealsRepository
    {

        string QueryStr = "";
        string DeleteQueryStr = "";
        string InsertQueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public DealsRepository(UserInfo MyUserInfo)
        {
            //TODO
        }

        public DealsResult SearchDeals(int ModuleId, int FormId, int ViewId, DealsSearch dealsSearchInput, UserInfo MyUserInfo)
        {

            string ViewSQL = "";
            AppViewsDTO appViewsDTO = new AppViewsDTO();
            DealsResult dealsResult  = new DealsResult();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";

            AppViewsRepository appViewsRepository = new AppViewsRepository(MyUserInfo);

            appViewsDTO = appViewsRepository.GetAppViewsByModuleId(ModuleId, FormId, ViewId, MyUserInfo);

            ViewSQL = appViewsDTO.ViewSQL;

            QueryStr = ViewSQL;



            //QueryStr = @"SELECT *, LeadSource.SourceName, LeadSource.SourceDesc, LeadStatus.LeadStatName, Probability.Name As 'ProbabilityName', Probability.Colour
            //                    FROM     Leads LEFT OUTER JOIN
            //                    Probability ON ProbabilityId = Probability.Id LEFT OUTER JOIN
            //                    LeadSource ON LeadSourceId = LeadSource.LeadSourceId LEFT OUTER JOIN
            //                    LeadStatus ON LeadStatId = LeadStatus.LeadStatID
            //                    Where 1=1 And Converted=0 And IsQualified=0 ";

            CountQueryStr = @"SELECT Count(*) From DealDetails Where 1=1 ";

            //select Data from dbo.Split(@purchaseOrderId,',')
            //select data from dbo.Split(dbo.GetUserIds(685),',')
            //And OwnerId in(select data from dbo.Split(dbo.GetUserIds(685),','));

            //CountQueryStr = CountQueryStr + string.Format(" And OwnerId = {0} ", MyUserInfo.UserId);
            CountQueryStr = CountQueryStr + string.Format(" And OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));

            if (!string.IsNullOrEmpty(dealsSearchInput.DealName))
            {
                QueryStr = QueryStr + " \nAnd ( DealName like '%" + dealsSearchInput.DealName + "%')";

                CountQueryStr = CountQueryStr + " \nAnd ( DealName like '%" + dealsSearchInput.DealName + "%')";

            }


            if (dealsSearchInput.AccountId>0)
            {
                QueryStr = QueryStr + " And AccountId = " +  dealsSearchInput.AccountId;
                CountQueryStr = CountQueryStr + " And AccountId = " + dealsSearchInput.AccountId;
            }

            if (dealsSearchInput.ContactId>0)
            {
                QueryStr = QueryStr + " And ContactId =" + dealsSearchInput.ContactId;
                CountQueryStr = CountQueryStr + " And ContactId = " + dealsSearchInput.ContactId;
            }

            //if (!string.IsNullOrEmpty(dealsSearchInput.Email))
            //{
            //    QueryStr = QueryStr + " And ( EmailId like '%" + dealsSearchInput.Email + "%')";
            //    CountQueryStr = CountQueryStr + " And ( EmailId like '%" + dealsSearchInput.Email + "%')";
            //}


            //if (!string.IsNullOrEmpty(dealsSearchInput.CreatedDate))
            //{
            //    QueryStr = QueryStr + string.Format(" \nAnd convert(varchar, CreatedDate, 23) between '{0}' And '{1}'", dealsSearchInput.CreatedDate, dealsSearchInput.ToDate);
            //    CountQueryStr = CountQueryStr + string.Format(" \nAnd convert(varchar, CreatedDate, 23) between '{0}' And '{1}'", dealsSearchInput.FromDate, dealsSearchInput.ToDate);
            //}

            //CountQueryStr = CountQueryStr + string.Format(" And OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));

            //QueryStr = QueryStr + string.Format(" And OwnerId = {0} ", MyUserInfo.UserId);
            QueryStr = QueryStr + string.Format(" And OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));


            //Deal Stage
            if (!string.IsNullOrEmpty(dealsSearchInput.DealStageId))
            {
                //SELECT Id FROM [dbo].[Split] ('1,2,3',',')
                QueryStr = QueryStr + string.Format(" And DealStageId In (SELECT Data FROM [dbo].[Split] ('{0}',','))", dealsSearchInput.DealStageId);
                CountQueryStr = CountQueryStr + string.Format(" And DealStageId In (SELECT Data FROM [dbo].[Split] ('{0}',','))", dealsSearchInput.DealStageId);
            }

            //Check Lead Source is Selected By User
            if (!string.IsNullOrEmpty(dealsSearchInput.DealTypeId))
            {
                //SELECT Id FROM [dbo].[Split] ('1,2,3',',')
                QueryStr = QueryStr + string.Format(" And DealTypeId In (SELECT Data FROM [dbo].[Split] ('{0}',','))", dealsSearchInput.DealTypeId);
                CountQueryStr = CountQueryStr + string.Format(" And DealTypeId In (SELECT Data FROM [dbo].[Split] ('{0}',','))", dealsSearchInput.DealTypeId);
            }



            if (dealsSearchInput.Skip == 0 && dealsSearchInput.Take == 0)
            {
                //Nothing To do
                //QueryStr = QueryStr + " Order By UpdatedDate Desc;";
                QueryStr = QueryStr + " Order By LastModifiedDate Desc;";
            }
            if (dealsSearchInput.Skip >= 0 && dealsSearchInput.Take > 0)
            {
                //QueryStr = QueryStr + " \nOrder By UpdatedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", dealsSearchInput.Skip, dealsSearchInput.Take);
                QueryStr = QueryStr + " \nOrder By LastModifiedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", dealsSearchInput.Skip, dealsSearchInput.Take);
            }
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    dealsResult.Status = "SUCCESS";
                    dealsResult.Message = "SUCCESS";

                    dealsResult.Deals = result.Read<DealDTO>().AsList();
                    //total number of purchase orders
                    dealsResult.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Count;
                }
                return dealsResult;
            }
            catch (Exception exp)
            {
                dealsResult.Status = "ERROR";
                dealsResult.Message = exp.ToString();
            }
            return dealsResult;

        }

        public DealDTO GetDealById(int DealId, UserInfo MyUserInfo)
        {
            DealDTO dealDTO   = new DealDTO();

           QueryStr = @"Select * From DealDetails Where DealId= @DealId;";

            dealDTO = this.m_dbconnection.Query<DealDTO>(QueryStr, new Dictionary<string, object> { { "DealId", DealId } }).FirstOrDefault();

            return dealDTO;
        }

        public ResultReponse CreateDeal(DealForm dealForm , UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();
            string ErrorMessage = "";
            int NewDealId = 0;
            int SalesStageHisotyId = 0;
            string SalesStageInsertQuery = "";
            int UpdateResult = 0;
            try
            {
               
                    string InsertLeadSQL = @"INSERT Deal(DealName,AccountId,ContactId,NextStep,LeadSourceId,RatingId,Amount,
                    ClosingDate,PipelineId,DealStageId,Probability,ExpectedRevenue,CampaignSource,DealDescription,OwnerId,
                    CreatedBy,CreatedDate,LastModifiedBy,LastModifiedDate)
                    values 
                    (@DealName,@AccountId,@ContactId,@NextStep,@LeadSourceId,@RatingId,@Amount,
                    @ClosingDate, @PipelineId,@DealStageId,@Probability,@ExpectedRevenue,@CampaignSource,@DealDescription,@OwnerId,
                    @CreatedBy,@CreatedDate,@LastModifiedBy,@LastModifiedDate);
                    SELECT SCOPE_IDENTITY();";


                    NewDealId = this.m_dbconnection.QuerySingle<int>(InsertLeadSQL,
                                                    new
                                                    {
                                                        DealName = dealForm.DealName,
                                                        AccountId = dealForm.AccountId,
                                                        ContactId = dealForm.ContactId,
                                                        NextStep = dealForm.NextStep,
                                                        LeadSourceId = dealForm.LeadSourceId,
                                                        RatingId= dealForm.RatingId,
                                                        Amount = dealForm.Amount,
                                                        ClosingDate = dealForm.ClosingDate,
                                                        PipelineId = dealForm.PipelineId,
                                                        DealStageId = dealForm.DealStageId,
                                                        Probability = dealForm.Probability,
                                                        ExpectedRevenue = dealForm.ExpectedRevenue,
                                                        CampaignSource = dealForm.CampaignSource,
                                                        DealDescription = dealForm.DealDescription,
                                                        OwnerId = dealForm.OwnerId,                                                       
                                                        createdBy = dealForm.CreatedBy,
                                                        createdDate = DateTime.Now,
                                                        lastModifiedBy = dealForm.CreatedBy,
                                                        LastModifiedDate = DateTime.Now
                                                    });

                    if (NewDealId > 0)
                    {
                        //Add in to salesstagehistory of current date
                        SalesStageInsertQuery = @"INSERT salesstagehistory(leadId,oppId,probabilityId,startDate,userId) 
                                                    values (@leadId,@oppId,@probabilityId,@startDate,@userId);
                                                    SELECT SCOPE_IDENTITY();";

                        SalesStageHisotyId = this.m_dbconnection.QuerySingle<int>(SalesStageInsertQuery,
                                                    new
                                                    {
                                                        // Id = dealForm.Id,
                                                        leadId = NewDealId,
                                                        oppId = 0,
                                                        probabilityId = 1,
                                                        startDate = DateTime.Now,
                                                        userId = MyUserInfo.UserId
                                                    });


                        obj.Status = "SUCCESS";
                        obj.StatusCode = "SUCCESS";
                        obj.Message = "Deal Created Successfully ";
                        obj.Data = NewDealId.ToString();

                    }
                    else
                    {
                        obj.Status = "ERROR";
                        obj.StatusCode = "ERROR";
                        obj.Message = "Error Occured while inserting deal administrator";
                        obj.Data = "0";
                    }
                
            }
            catch (Exception ex)
            {
                obj.Status = "ERROR";
                obj.StatusCode = "ERROR";
                obj.Message = ex.ToString();
                obj.Data = "0";
                var Message = ex.ToString();
            }
            return obj;
        }
        public ResultReponse UpdateDeal(DealForm dealForm, UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();
            bool DealClose = true;
            bool DealLost = true;
            int DealStageId = 0;
            try
            {
                int result = 0;

                DealStageId = dealForm.DealStageId;

                //Get Deal Stages
                var DealStages = GetDealStage(MyUserInfo);

                var DealStageInfo = DealStages.Where(x => x.DealStageId == DealStageId).FirstOrDefault();

                if (DealStageInfo != null)
                {
                    DealClose = DealStageInfo.IsClose;
                    DealLost = DealStageInfo.IsLost;
                }

                string updateQuery = @"UPDATE Deal SET DealName = @DealName,
                                            AccountId = @AccountId,
                                            ContactId=@ContactId,
                                            DealTypeId=@DealTypeId,
                                            NextStep=@NextStep,
                                            LeadSourceId=@LeadSourceId,
                                            RatingId=@RatingId,
                                            Amount=@Amount,
                                            ClosingDate=@ClosingDate,
                                            PipelineId=@PipelineId,
                                            DealStageId=@DealStageId,
                                            Probability=@Probability,
                                            ExpectedRevenue=@ExpectedRevenue,
                                            CampaignSource=@CampaignSource,
                                            DealDescription=@DealDescription,   
                                            OwnerId=@OwnerId,
                                            updatedBy=@updatedBy,
                                            updatedDate=@updatedDate,
                                            LastModifiedBy=@updatedBy,
                                            LastModifiedDate=@updatedDate                                            
                                            WHERE DealId =@DealId";
                result = this.m_dbconnection.Execute(updateQuery, new
                {
                    DealName = dealForm.DealName,
                    AccountId = dealForm.AccountId,
                    ContactId = dealForm.ContactId,
                    DealTypeId = dealForm.DealTypeId,
                    NextStep = dealForm.NextStep,
                    LeadSourceId = dealForm.LeadSourceId,
                    RatingId = dealForm.RatingId,
                    Amount = dealForm.Amount,
                    ClosingDate = dealForm.ClosingDate,
                    PipelineId = dealForm.PipelineId,
                    DealStageId = dealForm.DealStageId,
                    Probability = dealForm.Probability,
                    ExpectedRevenue = dealForm.ExpectedRevenue,
                    CampaignSource = dealForm.CampaignSource,
                    DealDescription = dealForm.DealDescription,
                    OwnerId = dealForm.OwnerId,
                    updatedBy = dealForm.UpdatedBy,
                    updatedDate = DateTime.Now,
                    LastModifiedBy = dealForm.UpdatedBy,
                    LastModifiedDate = DateTime.Now,
                    DealId = dealForm.DealId
                });


                if (result > 0)
                {
                    obj.Status = "SUCCESS";
                    obj.StatusCode = "SUCCESS";
                    obj.Message = "Lead Updated Successfully ";
                    obj.Data = dealForm.DealId.ToString();

                }
                else
                {
                    obj.Status = "ERROR";
                    obj.StatusCode = "ERROR";
                    obj.Message = "Error Occured while Updateing contact administrator";
                    obj.Data = "0";
                }


            }
            catch (Exception ex)
            {
                obj.Status = "ERROR";
                obj.StatusCode = "ERROR";
                obj.Message = ex.ToString();
                obj.Data = "0";
                var Message = ex.ToString();
            }
            return obj;
        }
        public IEnumerable<DealTypeDomainItem> GetDealTypeDomainItem(UserInfo MyUserInfo)
        {
            const string sql = @" Select * from DealType where DealTypeActive=1;";


            IEnumerable<DealTypeDomainItem> MyDealTypeDomainItem = m_dbconnection.Query<DealTypeDomainItem>(sql).ToList();

            return MyDealTypeDomainItem;
        }

        public IEnumerable<LeadSourceDTO> GetLeadSource(UserInfo MyUserInfo)
        {

            const string sql = @" select * from leadsource where isactive=1;";


            IEnumerable<LeadSourceDTO> MyLeadSourceList = m_dbconnection.Query<LeadSourceDTO>(sql).ToList();

            return MyLeadSourceList;

        }

        public IEnumerable<DealStagesDTO> GetDealStage(UserInfo MyUserInfo)
        {

            const string sql = @" Select * From DealStages Where DealStageActive=1 Order By DealStageId Asc;";


            IEnumerable<DealStagesDTO> MyDealStagesList = m_dbconnection.Query<DealStagesDTO>(sql).ToList();

            return MyDealStagesList;

        }

        public IEnumerable<ContactsAccountDetailsDTO> GetContactsByAccountId(int AccountId,UserInfo MyUserInfo)
        {
            IEnumerable<ContactsAccountDetailsDTO> contactsAccountDetailsDTOs  = null;

            if (AccountId > 0)
            {
                QueryStr = string.Format("Select * from ContactsAccountDetails Where AccountId={0};", AccountId);
            }
            else
            {
                QueryStr = string.Format("Select * from ContactsAccountDetails;");
            }
            contactsAccountDetailsDTOs = this.m_dbconnection.Query<ContactsAccountDetailsDTO>(QueryStr).ToList();


            return contactsAccountDetailsDTOs;
        }


        public ResultReponse CreateQuickAccount(QuickAccount quickAccount, UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();
            string ErrorMessage = "";
            int NewAccountId = 0;
            int SalesStageHisotyId = 0;
            string SalesStageInsertQuery = "";
            int UpdateResult = 0;

            string ReturnStr = "";
            try
            {

                string InsertQuickAccountSQL = @"INSERT Accounts
                    (AccountName,MainPhone,Website,OwnerId,CreatedBy,CreatedDate,LastModifiedBy,LastModifiedDate)
                    values 
                    (@AccountName,@MainPhone,@Website,@OwnerId,@CreatedBy,@CreatedDate,@LastModifiedBy,@LastModifiedDate);
                    SELECT SCOPE_IDENTITY();";


                NewAccountId = this.m_dbconnection.QuerySingle<int>(InsertQuickAccountSQL,
                                                new
                                                {
                                                    AccountName = quickAccount.AccountName,
                                                    MainPhone = quickAccount.MainPhone,
                                                    Website = quickAccount.Website,                                                    
                                                    OwnerId = quickAccount.CreatedBy,
                                                    CreatedBy = quickAccount.CreatedBy,
                                                    CreatedDate = DateTime.Now,
                                                    LastModifiedBy = quickAccount.CreatedBy,
                                                    LastModifiedDate = DateTime.Now
                                                });

                if (NewAccountId > 0)
                {

                    ReturnStr = string.Format("{0}-{1}", NewAccountId, quickAccount.AccountName);

                    obj.Status = "SUCCESS";
                    obj.StatusCode = "SUCCESS";
                    obj.Message = "Deal Created Successfully ";
                    obj.Data = ReturnStr.ToString();

                }
                else
                {
                    obj.Status = "ERROR";
                    obj.StatusCode = "ERROR";
                    obj.Message = "Error Occured while inserting deal administrator";
                    ReturnStr = string.Format("{0}-{1}", NewAccountId, quickAccount.AccountName);
                    obj.Data = ReturnStr;
                }

            }
            catch (Exception ex)
            {
                obj.Status = "ERROR";
                obj.StatusCode = "ERROR";
                obj.Message = ex.ToString();
                obj.Data = "0";
                var Message = ex.ToString();
            }
            return obj;
        }

        public ResultReponse CreateQuickContact(QuickContact quickContact , UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();
            string ErrorMessage = "";
            int NewContactId = 0;
            int SalesStageHisotyId = 0;
            string SalesStageInsertQuery = "";
            int UpdateResult = 0;
            string ReturnStr = "";
            try
            {

                string InsertLeadSQL = @"INSERT Contacts
                    (FirstName,LastName,AccountId,EmailId,BusinessPhone,Mobile,ContactTypeId,
                    OwnerId,CreatedBy,CreatedDate,LastModifiedBy,LastModifiedDate)
                    values 
                    (@FirstName,@LastName,@AccountId,@EmailId,@BusinessPhone,@Mobile,@ContactTypeId,
                    @OwnerId,@CreatedBy,@CreatedDate,@LastModifiedBy,@LastModifiedDate);
                    SELECT SCOPE_IDENTITY();";


                NewContactId = this.m_dbconnection.QuerySingle<int>(InsertLeadSQL,
                                                new
                                                {
                                                    FirstName = quickContact.FirstName,
                                                    LastName = quickContact.LastName,
                                                    AccountId = quickContact.AccountId,
                                                    EmailId = quickContact.EmailId,
                                                    BusinessPhone = quickContact.BusinessPhone,
                                                    Mobile = quickContact.Mobile,
                                                    ContactTypeId = quickContact.ContactTypeId,
                                                    OwnerId = quickContact.CreatedBy,
                                                    CreatedBy = quickContact.CreatedBy,
                                                    CreatedDate = DateTime.Now,
                                                    LastModifiedBy = quickContact.CreatedBy,
                                                    LastModifiedDate = DateTime.Now
                                                });

                if (NewContactId > 0)
                {
                    ReturnStr = string.Format("{0}-{1}", NewContactId, quickContact.FirstName +' '+ quickContact.LastName);

                    obj.Status = "SUCCESS";
                    obj.StatusCode = "SUCCESS";
                    obj.Message = "Deal Created Successfully ";
                    obj.Data = ReturnStr.ToString();

                }
                else
                {
                    ReturnStr = string.Format("{0}-{1}", NewContactId, quickContact.FirstName + ' ' + quickContact.LastName);
                    obj.Status = "ERROR";
                    obj.StatusCode = "ERROR";
                    obj.Message = "Error Occured while inserting deal administrator";
                    obj.Data = ReturnStr;
                }

            }
            catch (Exception ex)
            {
                obj.Status = "ERROR";
                obj.StatusCode = "ERROR";
                obj.Message = ex.ToString();
                ReturnStr = string.Format("{0}-{1}", NewContactId, quickContact.FirstName + ' ' + quickContact.LastName);
                obj.Data = ReturnStr;
                var Message = ex.ToString();
            }
            return obj;
        }

        public ResultReponse CloseDeal(DealCloseForm dealCloseForm, UserInfo MyUserInfo)
        {
            ResultReponse obj = new ResultReponse();

            string CloseDealQuery = "";
            bool DealClose = true;
            bool DealLost = true;
            int DealStageId = 0;
            try
            {
                int result = 0;
                DealStageId = dealCloseForm.DealStageId;

                //Get Deal Stages
                var DealStages = GetDealStage(MyUserInfo);

                var DealStageInfo = DealStages.Where(x => x.DealStageId == DealStageId).FirstOrDefault();

                if (DealStageInfo != null)
                {
                    DealClose = DealStageInfo.IsClose;
                    DealLost = DealStageInfo.IsLost;
                }

                //if(dealCloseForm.DealStagename== "Closed Won")
                //{
                //    DealClose = true;
                //    DealLost = false;
                //}
                //else if (dealCloseForm.DealStagename== "Closed Lost" || dealCloseForm.DealStagename == "Closed-Lost to Competion")
                //{
                //    DealClose = true;
                //    DealLost = true;
                //}
                CloseDealQuery = @"UPDATE Deal SET 
                                            TotalAmount = @TotalAmount,
                                            UpfrontOrAdvance = @UpfrontOrAdvance,
                                            PoNumber=@PoNumber,
                                            Balance=@Balance,
                                            Remarks=@Remarks,   
                                            DealClose=@DealClose,
                                            DealLost=@DealLost,
                                            ClosingDate=@ClosingDate,
                                            updatedBy=@updatedBy,
                                            updatedDate=@updatedDate,
                                            LastModifiedBy=@updatedBy,
                                            LastModifiedDate=@updatedDate,
                                            DealStageId=@DealStageId,
                                            ClosedBy=@ClosedBy,
                                            ClosedDate=@ClosedDate,
                                            DealReasonId=@DealReasonId
                                            WHERE DealId =@DealId";
                result = this.m_dbconnection.Execute(CloseDealQuery, new
                {
                    TotalAmount = dealCloseForm.TotalAmount,
                    UpfrontOrAdvance = dealCloseForm.UpfrontOrAdvance,
                    PoNumber = dealCloseForm.PoNumber,
                    Balance = dealCloseForm.Balance,
                    Remarks = dealCloseForm.Remarks,
                    DealClose = DealClose,
                    DealLost = DealLost,
                    ClosingDate = dealCloseForm.ClosingDate,
                    updatedBy = dealCloseForm.UserId,
                    updatedDate = DateTime.Now,
                    LastModifiedBy = dealCloseForm.UserId,
                    LastModifiedDate = DateTime.Now,
                    DealStageId = dealCloseForm.DealStageId,
                    ClosedBy=dealCloseForm.UserId,
                    ClosedDate=DateTime.Now,
                    DealReasonId=dealCloseForm.DealReasonId,
                    DealId = dealCloseForm.DealId
                });



                if (result > 0)
                {
                    obj.Status = "SUCCESS";
                    obj.StatusCode = "SUCCESS";
                    obj.Message = "Deal Close Successfully ";
                    obj.Data = dealCloseForm.DealId.ToString();

                }
                else
                {
                    obj.Status = "ERROR";
                    obj.StatusCode = "ERROR";
                    obj.Message = "Error Occured while Updateing contact administrator";
                    obj.Data = "0";
                }


            }
            catch (Exception ex)
            {
                obj.Status = "ERROR";
                obj.StatusCode = "ERROR";
                obj.Message = ex.ToString();
                obj.Data = "0";
                var Message = ex.ToString();
            }
            return obj;
        }


        public IEnumerable<DealReasonForLossDTO> GetDealResonForLossDomainItems(UserInfo MyUserInfo)
        {
            const string sql = @"Select DealReasonId,DealReasonName From DealReasonForLoss Where DealReasonActive=1;";


            IEnumerable<DealReasonForLossDTO> MyDealReasonForLoss = m_dbconnection.Query<DealReasonForLossDTO>(sql).ToList();

            return MyDealReasonForLoss;
        }

        public IEnumerable<DealReasonForLossDTO> GetDealResonForLossList(UserInfo MyUserInfo)
        {
            const string sql = @"Select * From DealReasonForLoss Where DealReasonActive=1;";


            IEnumerable<DealReasonForLossDTO> MyDealReasonForLoss = m_dbconnection.Query<DealReasonForLossDTO>(sql).ToList();

            return MyDealReasonForLoss;
        }

        public DealReasonForLossDTO GetDealResonForLosById(int DealReasonId,UserInfo MyUserInfo)
        {
            QueryStr =string.Format("Select * From DealReasonForLoss Where DealReasonActive=1 And DealReasonId={0}", DealReasonId);


            DealReasonForLossDTO DealReasonForLossInfo = m_dbconnection.Query<DealReasonForLossDTO>(QueryStr).FirstOrDefault();

            return DealReasonForLossInfo;
        }

    }
}
