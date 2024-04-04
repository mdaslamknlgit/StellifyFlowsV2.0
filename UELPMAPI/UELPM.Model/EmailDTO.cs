using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class EmailDTO
    {
        public int Id { get; set; }

        public int ListId { get; set; }
        public int EmaillistId { get; set; }

        public int LeadId { get; set; }

        public int AccountId { get; set; }

        public int ContactId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string AliasName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Mobile { get; set; }
        public string Title { get; set; }
        public string Company { get; set; }
        public string CompanyId { get; set; }
        public string Website { get; set; }
        public string Location { get; set; }
        public string Url { get; set; }
        public string PhotoUrl { get; set; }
        public string Profileid { get; set; }
        public int TypeId { get; set; }
        public string Degree { get; set; }
        public string Connectiontype { get; set; }
        public string CompanyURL { get; set; }

        public string Status { get; set; }

        public string MessageBody { get; set; }

        public Boolean ProfileView { set; get; }

        public string Campaigns { get; set; }
        public string CampaignIds { get; set; }
        public int IsPositive { get; set; }

        public string FullName { get; set; }

        public bool RecipientSelected { get; set; }

        public bool FromCampaign { get; set; }
        public string ListName { get; set; }
        public DateTime ExpiredDate { get; set; }
        public int ExpiredDays { get; set; }
        public string RecentTime { get; set; }


        public int CreateBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int UpdateBy { get; set; }
        public DateTime UpdatedDate { get; set; }
        public int DeleteBy { get; set; }
        public DateTime DeletedDate { get; set; }

        public string Country { get; set; }
        public string City { get; set; }
        public string Industry { get; set; }

        //public DateTime ConnectedOn { get; set; }

        public DateTime LastUpdated { get; set; }

        public int RegardingId { get; set; }

        public string Regarding { get; set; }

        public string Name { get; set; }
    }
}
