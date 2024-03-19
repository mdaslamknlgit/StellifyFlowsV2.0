using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class AssetDepreciation
    {
      public int AssetDepreciationId { get; set; }
      public int CreatedBy { get; set; }
      public string PostedUserName { get; set; }
      public int WorkFlowStatusId { get; set; }
      public string WorkFlowStatus { get; set; }
      public List<int> SelectedAssets { get; set; }
      public List<int> DeletedAssets { get; set; }
      public int CompanyId { get; set; }
      public int LocationId { get; set; }
      public string Location { get; set; }
      public int CurrentApproverUserId { get; set; }
      public string CurrentApproverUserName { get; set; }
      public DateTime CreatedDate { get; set; }
      public DateTime UpdatedDate { get; set; }
      public DateTime DateOfPosting { get; set; }
      public IList<WorkflowAuditTrail> WorkFlowComments { get; set; }
      public List<AssetDetails> AssetDetails { get; set; }
      public string RequestedByUserName { get; set; }
    }

    public class AssetDeprectionReqDisplayResult
    {
        public List<AssetDepreciation> AssetDepreciation { get; set; }
        public int TotalRecords { get; set; }
    }

    public class AssetDepreciationSearch : GridDisplayInput
    {
        public bool IsApprovalPage { get; set; }
        public int AssetDepreciationId { get; set; }
        public int FromLocationId { get; set; }
        public int RequestFromUserId { get; set; }
    }
}
