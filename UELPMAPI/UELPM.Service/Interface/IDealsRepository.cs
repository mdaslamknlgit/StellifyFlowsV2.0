using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Service.Interface
{
    public interface IDealsRepository
    {

        DealsResult SearchDeals(int ModuleId, int FormId, int ViewId, DealsSearch dealsSearch , UserInfo MyUserInfo);

        DealDTO GetDealById(int DealId, UserInfo MyUserInfo);

        ResultReponse CreateDeal(DealForm dealForm , UserInfo MyUserInfo);

        ResultReponse UpdateDeal(DealForm dealForm, UserInfo MyUserInfo);

        IEnumerable<DealTypeDomainItem> GetDealTypeDomainItem(UserInfo MyUserInfo);

        IEnumerable<DealStagesDTO> GetDealStage(UserInfo MyUserInfo);

        IEnumerable<ContactsAccountDetailsDTO> GetContactsByAccountId(int AccountId, UserInfo MyUserInfo);

        ResultReponse CreateQuickAccount(QuickAccount quickAccount, UserInfo MyUserInfo);

        ResultReponse CreateQuickContact(QuickContact quickContact, UserInfo MyUserInfo);

        ResultReponse CloseDeal(DealCloseForm dealCloseForm, UserInfo MyUserInfo);

        IEnumerable<DealReasonForLossDTO> GetDealResonForLossDomainItems(UserInfo MyUserInfo);

        IEnumerable<DealReasonForLossDTO> GetDealResonForLossList(UserInfo MyUserInfo);

        DealReasonForLossDTO GetDealResonForLosById(int DealReasonId, UserInfo MyUserInfo);

    }
}
