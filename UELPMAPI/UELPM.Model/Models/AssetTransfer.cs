using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace UELPM.Model.Models
{
    public class AssetTransfer
    {
        public int AssetTranferId { get; set; }
        public int FromLocationId { get; set; }
        public string FromLocation { get; set; }
        public int ToLocationId { get; set; }
        public string ToLocation { get; set; }
        public int FromCompanyId { get; set; }
        public string FromCompany { get; set; }
        public int ToCompanyId { get; set; }
        public string ToCompany { get; set; }
        public string ReasonForTransfer { get; set; }
        public int CreatedBy { get; set; }
        public string RequestedByUserName { get; set; }
        public int WorkFlowStatusId { get; set; }
        public string WorkFlowStatus { get; set; }
        public List<int> SelectedAssets { get; set; }
        public List<int> DeletedAssets { get; set; }
        public List<AssetDetails> SelectedAssetDetails { get; set; }
        public int CompanyId { get; set; }
        public int CurrentApproverUserId { get; set; }
        public string CurrentApproverUserName { get; set; }
        public List<WorkflowAuditTrail> WorkFlowComments { get; set; }
    }
    public class AssetTransferReqDisplayResult
    {
        public List<AssetTransfer> AssetTransferReq { get; set; }
        public int TotalRecords { get; set; }
    }

    //public class AssetTransferMail : AssetTransfer
    //{
    //    public string ApproverName { get; set; }
    //    public string ApproverEmail { get; set; }
    //}

    public class AssetTransferSearch : GridDisplayInput
    {
        public bool IsApprovalPage { get; set; }
        public int AssetTransferId { get; set; }
        public int FromLocationId { get; set; }
        public int RequestFromUserId { get; set; }
    }
}
