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


namespace UELPM.Service.Repositories
{
    public class ActivityRepository : IActivityRepository
    {
        string UELConnectionString = ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString;
        string QueryStr = "";
        string DeleteQueryStr = "";
        string InsertQueryStr = "";
        string CountQueryStr = "";

        private IDbConnection m_dbconnection = new SqlConnection(ConfigurationManager.ConnectionStrings["UELConnection"].ConnectionString);
        SharedRepository sharedRepository = null;

        public ActivityRepository(UserInfo MyUserInfo)
        {
            //TODO
        }

        public ActivityResults SearchActivities(UserInfo MyUserInfo, ActivitySearch activitySearch)
        {
            ActivityResults activityResults = new ActivityResults();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";
            QueryStr = @"Select * From ActivityDetails Where 1=1 ";

            

            CountQueryStr = @"Select Count(*) From ActivityDetails Where 1=1 ";
            CountQueryStr = CountQueryStr + string.Format(" And OwnerId= {0} ", MyUserInfo.UserId);

            if (!string.IsNullOrEmpty(activitySearch.ActivitySubject))
            {
                QueryStr = QueryStr + " \nAnd ( ActivitySubject like '%" + activitySearch.ActivitySubject + "%')";
                CountQueryStr = CountQueryStr + " \nAnd ( ActivitySubject like '%" + activitySearch.ActivitySubject + "%')";
            }
            if (!string.IsNullOrEmpty(activitySearch.ActivityDesc))
            {
                QueryStr = QueryStr + " \nAnd ( ActivityDesc like '%" + activitySearch.ActivityDesc + "%')";
                CountQueryStr = CountQueryStr + " \nAnd ( ActivityDesc like '%" + activitySearch.ActivityDesc + "%')";
            }

            QueryStr = QueryStr + string.Format(" And OwnerId = {0} ", MyUserInfo.UserId);
            if (activitySearch.Skip == 0 && activitySearch.Take == 0)
            {
                //Nothing To do
                QueryStr = QueryStr + " Order By LastModifiedDate Desc;";
            }
            if (activitySearch.Skip >= 0 && activitySearch.Take > 0)
            {
                QueryStr = QueryStr + " \nOrder By LastModifiedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", activitySearch.Skip, activitySearch.Take);
            }
            //Get Total Records



            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                //using (var result = this.m_dbconnection.QueryMultiple(QueryStr, new
                //{
                //    UserId = MyUserInfo.UserId

                //}, commandType: CommandType.Text))

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    activityResults.Status = "SUCCESS";
                    activityResults.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    activityResults.ActivityList = result.Read<ActivityDTO>().AsList();
                    //total number of purchase orders
                    activityResults.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return activityResults;
            }
            catch (Exception exp)
            {
                activityResults.Status = "ERROR";
                activityResults.Message = exp.ToString();
                activityResults.QueryStr = QueryStr;
            }
            return activityResults;

        }

        public ActivityResults SearchActivities(int ModuleId, int FormId, int ViewId, ActivitySearch activitySearch, UserInfo MyUserInfo)
        {
            string ViewSQL = "";
            AppViewsDTO appViewsDTO = new AppViewsDTO();
            ActivityResults activityResults  = new ActivityResults();
            //const string sql = @"SELECT  * from Leads  WHERE CreatedBy = @UserId;";

            AppViewsRepository appViewsRepository = new AppViewsRepository(MyUserInfo);

            appViewsDTO = appViewsRepository.GetAppViewsByModuleId(ModuleId, FormId, ViewId, MyUserInfo);

            ViewSQL = appViewsDTO.ViewSQL;

            QueryStr = ViewSQL;

            CountQueryStr = @"SELECT Count(*) FROM  ActivityDetails Where 1=1 And IsClose=0 ";

            CountQueryStr = CountQueryStr + string.Format(" And OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));

            if (!string.IsNullOrEmpty(activitySearch.ActivitySubject) && !string.IsNullOrEmpty(activitySearch.ActivityDesc))
            {
                QueryStr = QueryStr + " \nAnd ( ActivitySubject like '%" + activitySearch.ActivitySubject + "%')";
                //QueryStr = QueryStr + " Or ActivityDesc like '%" + activitySearch.ActivityDesc + "%')";

                CountQueryStr = CountQueryStr + " \nAnd ( ActivitySubject like '%" + activitySearch.ActivitySubject + "%')";
                //CountQueryStr = CountQueryStr + " Or ActivityDesc like '%" + activitySearch.ActivityDesc + "%')";

            }
            else
            {
                if (!string.IsNullOrEmpty(activitySearch.ActivitySubject))
                {
                    QueryStr = QueryStr + " \nAnd ( ActivitySubject like '%" + activitySearch.ActivitySubject + "%')";
                    //QueryStr = QueryStr + " Or ActivityDesc like '%" + activitySearch.ActivityDesc + "%')";

                    CountQueryStr = CountQueryStr + " \nAnd ( ActivitySubject like '%" + activitySearch.ActivitySubject + "%')";
                    //CountQueryStr = CountQueryStr + " Or ActivityDesc like '%" + activitySearch.ActivityDesc + "%')";

                }
                else
                {
                    if (!string.IsNullOrEmpty(activitySearch.ActivityDesc))
                    {
                        QueryStr = QueryStr + " \nAnd (ActivityDesc like '%" + activitySearch.ActivityDesc + "%')";

                        CountQueryStr = CountQueryStr + " \nAnd (ActivityDesc like '%" + activitySearch.ActivityDesc + "%')";

                    }
                }
            }

            if (activitySearch.RegardingId > 0)
            {
                QueryStr = QueryStr + " \nAnd ( RegardingId=" + activitySearch.RegardingId + ")";

                CountQueryStr = CountQueryStr + " \nAnd ( RegardingId=" + activitySearch.RegardingId + ")";

                if (activitySearch.RegarId > 0)
                {
                    QueryStr = QueryStr + " \nAnd ( RegarId=" + activitySearch.RegarId + ")";

                    CountQueryStr = CountQueryStr + " \nAnd ( RegarId=" + activitySearch.RegarId + ")";

                }
            }
            else
            {
                if (activitySearch.RegarId > 0)
                {
                    QueryStr = QueryStr + " \nAnd ( RegarId=" + activitySearch.RegarId + ")";

                    CountQueryStr = CountQueryStr + " \nAnd ( RegarId=" + activitySearch.RegarId + ")";

                }
            }


            //if (activitySearch.RegardingId > 0 && activitySearch.RegarId > 0)
            //{
            //    QueryStr = QueryStr + " \n And RegardingId =" + activitySearch.RegardingId;
            //    CountQueryStr = CountQueryStr + " \n And RegardingId = " + activitySearch.RegardingId;";
            //}


            QueryStr = QueryStr + string.Format(" And OwnerId In ({0}) ", string.Format("select data from dbo.Split(dbo.GetUserIds({0}),',')", MyUserInfo.UserId));

            if (activitySearch.Skip == 0 && activitySearch.Take == 0)
            {
                //Nothing To do
                //QueryStr = QueryStr + " Order By Leads.UpdatedDate Desc;";
                QueryStr = QueryStr + " Order By LastModifiedDate Desc;";
            }
            if (activitySearch.Skip >= 0 && activitySearch.Take > 0)
            {
                //QueryStr = QueryStr + " \nOrder By Leads.UpdatedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", leadsSearchInput.Skip, leadsSearchInput.Take);
                QueryStr = QueryStr + " \nOrder By LastModifiedDate Desc " + string.Format(" \nOFFSET {0} ROWS FETCH NEXT {1} ROWS ONLY;", activitySearch.Skip, activitySearch.Take);
            }
            //Get Total Records

            QueryStr = QueryStr + "\n" + CountQueryStr;
            try
            {

                //using (var result = this.m_dbconnection.QueryMultiple(QueryStr, new
                //{
                //    UserId = MyUserInfo.UserId

                //}, commandType: CommandType.Text))

                using (var result = this.m_dbconnection.QueryMultiple(QueryStr, commandType: CommandType.Text))
                {
                    //list of purchase orders..
                    activityResults.Status = "SUCCESS";
                    activityResults.Message = "SUCCESS";
                    //leadsResult.Message = QueryStr;
                    activityResults.ActivityList = result.Read<ActivityDTO>().AsList();
                    //total number of purchase orders
                    activityResults.TotalRecords = result.ReadFirstOrDefault<int>();
                    //leadsResult.TotalRecords = leadsResult.Leads.Count;
                }
                return activityResults;
            }
            catch (Exception exp)
            {
                activityResults.Status = "ERROR";
                activityResults.Message = exp.ToString();
                activityResults.QueryStr = QueryStr;
            }
            return activityResults;


            //IEnumerable<LeadsDTO> MyLeadsInfo = this.m_dbconnection.Query<LeadsDTO>(QueryStr, new Dictionary<string, object> { { "UserId", MyUserInfo.UserId } }).ToList();

            //leadsResult.Leads = MyLeadsInfo.ToList();
            //if (MyLeadsInfo.ToList().Count > 0)
            //{
            //    leadsResult.TotalRecords = MyLeadsInfo.Count();
            //}
            //else
            //{
            //    leadsResult.TotalRecords = 0;
            //}
            //return leadsResult;
        }

        public ActivityInfo GetActivityById(int ActivityId, UserInfo MyUserInfo)
        {
            ActivityInfo activityInfo = new ActivityInfo();

            QueryStr = @"Select * From ActivityDetails Where 1=1  And ActivityId=@ActivityId;";

            activityInfo = this.m_dbconnection.Query<ActivityInfo>(QueryStr, new Dictionary<string, object> { { "ActivityId", ActivityId } }).FirstOrDefault();
           
           return activityInfo;

        }

        public ActivityResults GetActivitiesByType(UserInfo MyUserInfo, int ActivityTypeId)
        {
            throw new NotImplementedException();
        }

        public ActivityResults GetActivitiesByUser(UserInfo MyUserInfo)
        {
            throw new NotImplementedException();
        }

        public ResultReponse CreateActivity(UserInfo MyUserInfo, ActivityInput activityDTO)
        {
            ResultReponse obj = new ResultReponse();
            int NewListId = 0;

            DateTime StartDate = DateTime.Now;
            DateTime EndDate = DateTime.Now;
            DateTime DueDate = DateTime.Now;

            string StartDateStr = "";
            string EndDateStr = "";
            string DueDateStr = "";

            string StartTime = "";
            string EndTime = "";
            string DueTime = "";

            try
            {

                try
                {
                    //Check Dates
                    StartDate =Convert.ToDateTime(activityDTO.StartDate);
                    EndDate = Convert.ToDateTime(activityDTO.EndDate);
                    DueDate = Convert.ToDateTime(activityDTO.DueDate);

                    StartDateStr = activityDTO.StartDate.ToString();
                    EndDateStr = activityDTO.EndDate.ToString();
                    DueDateStr = activityDTO.DueDate.ToString();

                    StartTime = activityDTO.StartTime;
                    EndTime = activityDTO.EndTime;
                    DueTime = activityDTO.DueTime;

                    var mStartDate = StartDateStr + ' ' + StartTime;
                    var mEndDate = EndDateStr + ' ' + EndTime;
                    var mDueDate = DueDateStr + ' ' + DueTime;

                    StartDate = Convert.ToDateTime(StartDate.ToString("yyyy/MM/dd") + ' ' + StartTime);
                    EndDate = Convert.ToDateTime(EndDate.ToString("yyyy/MM/dd") + ' ' + EndTime);
                    DueDate = Convert.ToDateTime(DueDate.ToString("yyyy/MM/dd") + ' ' + DueTime);


                }
                catch(Exception exxp)
                {
                    StartDate = Convert.ToDateTime(activityDTO.StartDate);
                    EndDate = Convert.ToDateTime(activityDTO.EndDate);
                    DueDate = Convert.ToDateTime(activityDTO.DueDate);

                }


                    string InsertActivitySQL = @"INSERT Activity
                    (ActivityTypeId,ActivitySubject,ActivityDesc,RegardingId,RegarId,PriorityId,
                     LeadID,OppID,QuoteID,InspID,AccountId,
                     ContactID,
                     StartDate,EndDate,DueDate,
                     StartTime,EndTime,DueTime,
                     Duration,
                     StatReasonId,
                     OwnerId,CreatedBy,CreatedDate,LastModifiedBy,LastModifiedDate,ActivityStatusId
                    ) 
                    values 
                    (@ActivityTypeId,@ActivitySubject,@ActivityDesc,@RegardingId,@RegarId,@PriorityId,
                     @LeadID,@OppID,@QuoteID,@InspID,@AccountId,
                     @ContactID,
                     @StartDate,@EndDate,@DueDate,
                     @StartTime,@EndTime,@DueTime,
                     @Duration,
                     @StatReasonId,
                     @OwnerId,@CreatedBy,@CreatedDate,@LastModifiedBy,@LastModifiedDate,@ActivityStatusId
                    );
                    SELECT SCOPE_IDENTITY();";


                    NewListId = this.m_dbconnection.QuerySingle<int>(InsertActivitySQL,
                                                    new
                                                    {
                                                        ActivityTypeId = activityDTO.ActivityTypeId,
                                                        ActivitySubject = activityDTO.ActivitySubject,
                                                        ActivityDesc = activityDTO.ActivityDesc,
                                                        RegardingId = activityDTO.RegardingId,
                                                        RegarId = activityDTO.RegarId,
                                                        PriorityId = activityDTO.PriorityId,
                                                        LeadID = activityDTO.LeadID ,
                                                        OppID = activityDTO.OppID,
                                                        QuoteID = activityDTO.QuoteID,
                                                        InspID = activityDTO.InspID,
                                                        AccountId = activityDTO.AccountId,
                                                        ContactID = activityDTO.ContactID,
                                                        StartDate = StartDate,
                                                        EndDate = EndDate,
                                                        DueDate = DueDate,
                                                        StartTime = activityDTO.StartTime,
                                                        EndTime = activityDTO.EndTime,
                                                        DueTime = activityDTO.DueTime,
                                                        Duration = activityDTO.Duration,
                                                        StatReasonId = activityDTO.StatReasonId,
                                                        OwnerId = activityDTO.CreatedBy,
                                                        createdBy = activityDTO.CreatedBy,
                                                        createdDate = DateTime.Now,
                                                        lastModifiedBy = activityDTO.CreatedBy,
                                                        LastModifiedDate = DateTime.Now          ,
                                                        ActivityStatusId= activityDTO.ActivityStatusId
                                                    });

                    if (NewListId > 0)
                    {
                        obj.Status = "SUCCESS";
                        obj.StatusCode = "SUCCESS";
                        obj.Message = "Activity Created Successfully ";
                        obj.Data = NewListId.ToString();

                    }
            }
            catch (Exception ex)
            {
                obj.Status = "ERROR";
                obj.StatusCode = "ERROR";
                obj.Message = "Error Occured While Inserting Activity";
                obj.ErrorMessage = ex.ToString();
                obj.Data = "0";
            }
            return obj;
        }

        public ResultReponse UpdateActivity(UserInfo MyUserInfo, ActivityInput activityDTO)
        {
            ResultReponse obj = new ResultReponse();
            int NewListId = 0;

            DateTime StartDate = DateTime.Now;
            DateTime EndDate = DateTime.Now;
            DateTime DueDate = DateTime.Now;

            string StartDateStr = "";
            string EndDateStr = "";
            string DueDateStr = "";

            string StartTime = "";
            string EndTime = "";
            string DueTime = "";

            try
            {

                try
                {
                    //Check Dates
                    StartDate = Convert.ToDateTime(activityDTO.StartDate);
                    EndDate = Convert.ToDateTime(activityDTO.EndDate);
                    DueDate = Convert.ToDateTime(activityDTO.DueDate);

                    StartDateStr = activityDTO.StartDate.ToString();
                    EndDateStr = activityDTO.EndDate.ToString();
                    DueDateStr = activityDTO.DueDate.ToString();

                    StartTime = activityDTO.StartTime;
                    EndTime = activityDTO.EndTime;
                    DueTime = activityDTO.DueTime;

                    var mStartDate = StartDateStr + ' ' + StartTime;
                    var mEndDate = EndDateStr + ' ' + EndTime;
                    var mDueDate = DueDateStr + ' ' + DueTime;

                    StartDate = Convert.ToDateTime(StartDate.ToString("yyyy/MM/dd") + ' ' + StartTime);
                    EndDate = Convert.ToDateTime(EndDate.ToString("yyyy/MM/dd") + ' ' + EndTime);
                    DueDate = Convert.ToDateTime(DueDate.ToString("yyyy/MM/dd") + ' ' + DueTime);


                }
                catch (Exception exxp)
                {
                    StartDate = Convert.ToDateTime(activityDTO.StartDate);
                    EndDate = Convert.ToDateTime(activityDTO.EndDate);
                    DueDate = Convert.ToDateTime(activityDTO.DueDate);

                }


                string UpdatetActivitySQL = @"Update Activity
                    Set ActivityTypeId      =  @ActivityTypeId, 
                        ActivitySubject     =  @ActivitySubject,
                        ActivityDesc        =  @ActivityDesc,
                        RegardingId         =  @RegardingId,
                        RegarId             =  @RegarId,
                        PriorityId          =  @PriorityId,
                        LeadID              =  @LeadID,
                        OppID               =  @OppID,
                        QuoteID             =  @QuoteID,
                        AccountId           =  @AccountId,
                        ContactID           =  @ContactID,
                        StartDate           =  @StartDate,
                        EndDate             =  @EndDate,
                        DueDate             =  @DueDate,
                        StartTime           =  @StartTime,
                        EndTime             =  @EndTime,
                        DueTime             =  @DueTime,
                        Duration            =  @Duration,
                        StatReasonId        =  @StatReasonId,
                        OwnerId             =  @OwnerId,
                        CreatedBy           =  @CreatedBy,
                        CreatedDate         =  @CreatedDate,
                        LastModifiedBy      =  @LastModifiedBy,
                        LastModifiedDate    =  @LastModifiedDate
                        Where ActivityId = @ActivityId;";


                NewListId = this.m_dbconnection.Execute(UpdatetActivitySQL, 
                                                new
                                                {                                                    
                                                    ActivityTypeId      = activityDTO.ActivityTypeId,
                                                    ActivitySubject     = activityDTO.ActivitySubject,
                                                    ActivityDesc        = activityDTO.ActivityDesc,
                                                    RegardingId         = activityDTO.RegardingId,
                                                    RegarId             = activityDTO.RegarId,
                                                    PriorityId          = activityDTO.PriorityId,
                                                    LeadID              = activityDTO.LeadID,
                                                    OppID               = activityDTO.OppID,
                                                    QuoteID             = activityDTO.QuoteID,
                                                    AccountId           = activityDTO.AccountId,
                                                    ContactID           = activityDTO.ContactID,
                                                    StartDate           = StartDate,
                                                    EndDate             = EndDate,
                                                    DueDate             = DueDate,
                                                    StartTime           = activityDTO.StartTime,
                                                    EndTime             = activityDTO.EndTime,
                                                    DueTime             = activityDTO.DueTime,
                                                    Duration            = activityDTO.Duration,
                                                    StatReasonId        = activityDTO.StatReasonId,
                                                    OwnerId             = activityDTO.CreatedBy,
                                                    CreatedBy           = activityDTO.CreatedBy,
                                                    CreatedDate         = DateTime.Now,
                                                    LastModifiedBy      = activityDTO.CreatedBy,
                                                    LastModifiedDate    = DateTime.Now,
                                                    ActivityId          = activityDTO.ActivityId,
                                                    ActivityStatusId    = activityDTO.ActivityStatusId
                                                }); 

                if (NewListId > 0)
                {
                    obj.Status = "SUCCESS";
                    obj.StatusCode = "SUCCESS";
                    obj.Message = "Activity Updated Successfully ";
                    obj.Data = NewListId.ToString();

                }
            }
            catch (Exception ex)
            {
                obj.Status = "ERROR";
                obj.StatusCode = "ERROR";
                obj.Message = "Error Occured While Updating Activity";
                obj.ErrorMessage = ex.ToString();
                obj.Data = "0";
            }
            return obj;
        }

        public IEnumerable<ActivityStatusDomainItem> GetActivityStatusDomainItem(UserInfo MyUserInfo)
        {
            const string sql = @"Select * From ActivityStatus Where ActivityStatusIsActive=1;";

            IEnumerable<ActivityStatusDomainItem> MyActivityStatusDomainItem = m_dbconnection.Query<ActivityStatusDomainItem>(sql).ToList();

            return MyActivityStatusDomainItem;
        }

        public IEnumerable<ContactDomainItems> GetContactDomainItems(UserInfo MyUserInfo)
        {
            QueryStr = @"Select Id ContactId,FirstName+' '+ LastName As FullName,FirstName,LastName From Contacts;";
            IEnumerable<ContactDomainItems> contactDomainItems = this.m_dbconnection.Query<ContactDomainItems>(QueryStr).ToList();

            return contactDomainItems;
        }

    }
}
