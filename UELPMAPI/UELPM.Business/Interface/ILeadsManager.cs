
using UELPM.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace StellifyFlows.Business.Interface
{
    public interface ILeadsManager
    {
        LeadsInfoList GetLeadsGroupByStages(UserInfo MyUserInfo);

        IEnumerable<LeadsDTO> GetLeads(UserInfo MyUserInfo);

        LeadsResult GetLeadsByPagination(int skip, int take, UserInfo MyUserInfo);

        LeadsResult SearchLeads(UserInfo MyUserInfo, LeadsSearch leadsSearchInput);

        LeadsResult SearchLeads(int ModuleId, int FormId, int ViewId, LeadsSearch leadsSearchInput, UserInfo MyUserInfo);
        IEnumerable<LeadNames> SearchLeadNames(UserInfo MyUserInfo, LeadsSearch leadsSearchInput);
        LeadsDTO GetLeadsById(int id, UserInfo MyUserInfo);


        LeadInfo GetLeadById(int id, UserInfo MyUserInfo);
        ResultReponse ConvertToLead(List<EmailDTO> MyEmailList, UserInfo MyUserInfo);
        ResultReponse AddToQueue(List<EmailDTO> MyEmailList, UserInfo MyUserInfo);
        ResultReponse CreateLead(LeadsDTO MyLeadInfo, UserInfo MyUserInfo);
        ResultReponse ChangeLeadStatus(List<LeadsDTO> MyLeadList, UserInfo MyUserInfo);

        LeadQualifyResponse QualifyLead(LeadQualifyInput leadQualifyInput, UserInfo MyUserInfo);
        LeadQualifyRequest GetLeadInfoToConvert(LeadQualifyRequest leadQualifyRequest, UserInfo MyUserInfo);
        IEnumerable<LeadSourceDTO> GetLeadSource(UserInfo MyUserInfo);

        IEnumerable<SalutationDTO> GetSalutation(UserInfo MyUserInfo);
        IEnumerable<LeadSourceDTO> GetLeadSourceById(UserInfo MyUserInfo,int LeadSourceId);

        //ResultReponse GenerateLead(LeadsDTO MyLeadInfo, UserInfo MyUserInfo);

        ResultReponse UpdateLead(LeadsDTO MyLeadDTO, UserInfo MyUserInfo);
        ResultReponse DeleteLead(int Id, UserInfo MyUserInfo);

        IEnumerable<LeadsDTO> GetLeadsByRatingId(int RatingId, UserInfo MyUserInfo);
        IEnumerable<LeadsDTO> GetLeadsByindsId(int indsId, UserInfo MyUserInfo);
        IEnumerable<LeadsDTO> GetLeadsByCurId(int CurId, UserInfo MyUserInfo);
        IEnumerable<LeadsDTO> GetLeadsByPriceListId(int PriceListId, UserInfo MyUserInfo);
        IEnumerable<LeadsDTO> GetLeadsByUserId(int UserId, UserInfo MyUserInfo);
        IEnumerable<LeadsDTO> GetLeadsByOwnerId(int OwnerId, UserInfo MyUserInfo);
        IEnumerable<LeadsDTO> GetLeadsBySourceId(int SourceId, UserInfo MyUserInfo);
        IEnumerable<LeadsDTO> GetLeadsByStatus(int Status, UserInfo MyUserInfo);
        IEnumerable<LeadsDTO> GetLeadsByStatId(int StatId, UserInfo MyUserInfo);
        IEnumerable<JobQueueDTO> GetJobQueueList(UserInfo MyUserInfo);
        ResultReponse UpdateQueue(List<JobQueueDTO> MyQueueList, UserInfo MyUserInfo);

        LeadStatusRetults GetLeadStatus(UserInfo MyUserInfo);

        IEnumerable<LeadStatusDomainItem> GetLeadStatusDomainItem(UserInfo MyUserInfo);


        int UpdateContactGroupsOfLead(ContactGroups contactGroups, UserInfo MyUserInfo);

        int UpdateContactGroupsOfContact(ContactGroups contactGroups, UserInfo MyUserInfo);

        IEnumerable<LeadRatingDomainItem> GetLeadRatingDomainItems(UserInfo MyUserInfo);


    }
}
