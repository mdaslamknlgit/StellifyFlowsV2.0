using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model
{
    public class JobQueueDTO
    {
        public int Id { get; set; }
        public int EmailListId { get; set; }
        public int User { get; set; }
        public int CreatedBy { get; set; }
        public Boolean IsComplete { get; set; }
        public string ActionType { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string URL { get; set; }
        public string ProfileId { get; set; }
        public string StatusText { get; set; }

    }
}
