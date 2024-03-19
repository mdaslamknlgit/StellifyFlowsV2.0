using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class EntityImport
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Title { get; set; }

        public string Department { get; set; }

        public string Email { get; set; }

        public string MobileNo { get; set; }

        public string CreatedDate { get; set; }

        public string Source { get; set; }

        public string AccountName { get; set; }

        public string Website { get; set; }

        public string AnnualRevenue { get; set; }

        public string Industry { get; set; }

        public string SubDomain { get; set; }

        public string LinkedInURL { get; set; }

        public string CompanyPhone { get; set; }

        public string Fax { get; set; }

        public string Street { get; set; }

        public string City { get; set; }

        public string Stage { get; set; }

        public string ZipCode { get; set; }

        public string Country { get; set; }

        public string Response { get; set; }

        public string Status { get; set; }

        public string Rating { get; set; }

        public string  MailSentDate { get; set; }

        public string FollowUp { get; set; }



    }


    public class EntityImportList
    {
        public int EntityId { get; set; }

        public string  EntityName { get; set; }

        public IEnumerable<EntityImport> EntityList { get; set; }
    }
}
