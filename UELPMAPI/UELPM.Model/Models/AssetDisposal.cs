using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class AssetDisposal
    {
        public int AssetDisposalId { get; set; }
        public string Remarks { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
        public int CreatedBy { get; set; }
        public string RequestedByUserName { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public string ApprovalRemarks { get; set; }
        public int CompanyId { get; set; }
        public Locations Location { get; set; }
        public List<int> SelectedAssets { get; set; }
        public List<int> DeletedAssets { get; set; }
        public List<AssetDetails> SelectedAssetDetails { get; set; }
    }
    public class AssetDisposalReqDisplayResult
    {
        public List<AssetDisposal> AssetDisposalReq { get; set; }
        public int TotalRecords { get; set; }
    }
    public class AssetDisposalSearch : GridDisplayInput
    {
        public bool IsApprovalPage { get; set; }
        public int AssetDisposalId { get; set; }
        public int FromLocationId { get; set; }
        public int RequestFromUserId { get; set; }
    }
}
