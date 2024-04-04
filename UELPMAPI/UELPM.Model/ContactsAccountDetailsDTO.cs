using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class ContactsAccountDetailsDTO
    {
        //select * from ContactsAccountDetails Where AccountId=1;

        public int ContactId { get; set; }

        public string ContactName { get; set; }

        public int AccountId { get; set; }

        public string AccountName { get; set; }


    }
}
