using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IContactsManager
    {
        ContactsResults GetContactList(UserInfo MyUserInfo);

        ContactDTO GetContactDetailById(int Id, UserInfo MyUserInfo);

        ContactInfo GetContactByContactId(int Id, UserInfo MyUserInfo);
        ContactDTO GetContactAccountById(int Id, UserInfo MyUserInfo);

        ResultReponse CreateContact(ContactDTO contactDTO, UserInfo MyUserInfo);

        int UpdateContact(ContactDTO contactDTO, UserInfo MyUserInfo);

        ResultReponse DeleteContact(ContactDTO contactDTO, UserInfo MyUserInfo);

        IEnumerable<ContactDTO> GetPrimaryContactListById(int Id, UserInfo MyUserInfo);

        ContactsResults SearchContact(UserInfo MyUserInfo, ContactSearch contactSearch);

        IEnumerable<MaritalStatus> GetMaritalStatus(UserInfo MyUserInfo);

        MaritalStatus GetMaritalStatusById(int Id, UserInfo MyUserInfo);

        ContactsResults GetContactsByAccountId(int AcctId, UserInfo MyUserInfo);
    }
}
