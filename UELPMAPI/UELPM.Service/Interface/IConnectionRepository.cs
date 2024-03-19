using UELPM.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IConnectionRepository
    {
        IEnumerable<MarketingListDTO> GetList(UserInfo MyUserInfo);

        ListResult SearchConnections(UserInfo MyUserInfo, ListSearch listSearch);
        IEnumerable<MarketingListDTO> GetAllList();

        ConnectionsDisplayResult GetListWithEmailDetails(UserInfo MyUserInfo);

        ConnectionsDisplayResult GetMarketingListWithDetailsByListId(int ListId,UserInfo MyUserInfo);
        MarketingListDTO GetListInfo(int Id, UserInfo MyUserInfo);
        MarketingListDTO GetListDetails(int Id, UserInfo MyUserInfo);

        ResultReponse CreateList(MarketingListDTO listDTO, UserInfo MyUserInfo);

        ResultReponse UpdateList(MarketingListDTO listDTO, UserInfo MyUserInfo);
        int CreateListWithEmails(ListByEmail listDTO, UserInfo MyUserInfo);
        int UpdateListWithEmails(ListByEmail listbyemail, UserInfo MyUserInfo);
        int UpdateListWithNewConnections(ListByEmail listDTO, UserInfo MyUserInfo);
        
        int DeleteList(int Id, UserInfo MyUserInfo);
        int MoveToList(string EmailIds, int listId, UserInfo MyUserInfo);
        IEnumerable<MarketingListDTO> GetRecipients(UserInfo MyUserInfo, string RecipientsType);
        MarketingListDTO GetDefaultListId(UserInfo MyUserInfo);
    }

}
