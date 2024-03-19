using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class ButtonPreferences
    {
        public bool CancelDraft { get; set; }
        public bool SendForApproval { get; set; }
        public bool Submit { get; set; }
        public bool Approve { get; set; }
        public bool Reject { get; set; }
        public bool CancelApproval { get; set; }
        public bool Void { get; set; }
        public bool SendForClarification { get; set; }
        public bool ReplyForClarification { get; set; }
        public bool Edit { get; set; }
        public bool Verify { get; set; }
        public bool ReVerify { get; set; }
        public bool Export { get; set; }
        public bool Print { get; set; }
    }
}
