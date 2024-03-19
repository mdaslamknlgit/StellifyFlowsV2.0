using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Business.Interface
{
    public interface IOpportunityManager
    {
        OpportunityResult SearchOpportunity(UserInfo MyUserInfo, SearchOpportunity searchOpportunity);
        IEnumerable<OpportunityDTO> GetOpportunityList(int TypeId, UserInfo MyUserInfo);

        OpportunityDTO GetOpportunityDetails(UserInfo MyUserInfo);

        ResultReponse CreateOpportunity(OpportunityDTO Opportunity, UserInfo MyUserInfo);

        ResultReponse UpdateOpportunity(OpportunityDTO Opportunity, UserInfo MyUserInfo);

        OpportunityDTO GetOpportunityInfo(int Id, UserInfo MyUserInfo);

        ResultReponse CloseOpportunity(CloseOpp closeOpp, UserInfo MyUserInfo);
        ResultReponse DeleteOpportunity(OpportunityDTO Opportunity, UserInfo MyUserInfo);

        IEnumerable<ProbabilityDomainItem> GetProbabilityDomainItem(UserInfo MyUserInfo);

        //OpportunityProductResults AddOpportunityProducts(IEnumerable<OpportunityProductsDTO> opportunityProductsDTOs, UserInfo MyUserInfo);
        OpportunityProductResults AddOpportunityProducts(OpportunityProductsInput opportunityProductsInput, UserInfo MyUserInfo);

        OpportunityProductsDetailsList GetOpportunityProductsDetailsList(int OpportunityId, UserInfo MyUserInfo);



    }
}
