using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Business.Interface
{
    public interface IMarketingListManager
    {
        ListResult GetList(UserInfo MyUserInfo);
        IEnumerable<MarketingListDTO> GetListWithEmailDetails(UserInfo MyUserInfo);
        MarketingListDTO GetListInfo(int Id, UserInfo MyUserInfo);
        MarketingListDTO GetListDetails(int Id, UserInfo MyUserInfo);
        int CreateList(MarketingListDTO listDTO, UserInfo MyUserInfo);
        int CreateListWithEmails(ListByEmail listDTO, UserInfo MyUserInfo);
        int UpdateListWithEmails(ListByEmail listbyemail, UserInfo MyUserInfo);
        int UpdateListWithNewConnections(ListByEmail listDTO, UserInfo MyUserInfo);
        int UpdateList(MarketingListDTO listDTO, UserInfo MyUserInfo);
        int DeleteList(int Id, UserInfo MyUserInfo);
        int MoveToList(string EmailIds, int listId, UserInfo MyUserInfo);
        IEnumerable<MarketingListDTO> GetRecipients(UserInfo MyUserInfo, string RecipientsType);
        MarketingListDTO GetDefaultListId(UserInfo MyUserInfo);
    }
}
