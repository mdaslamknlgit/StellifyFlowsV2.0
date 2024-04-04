using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IGoodsReceivedNotesManager
    {
        GoodsReceivedNotesDisplayResult GetGoodsReceivedNotes(GridDisplayInput purchaseOrderInput);
        GoodsReceivedNotesDisplayResult GetDraftCount(int purchaseorderId, int poTypeId, int companyId);
        GoodsReceivedNotes GetGoodsReceivedNotesDetails(int goodReceivedNoteId, int purchaseOrderId,int purchaseOrderTypeId);
        GoodsReceivedNotesDisplayResult GetFilterGRN(GRNFilterDisplayInput gRNFilterDisplayInput);
        GoodsReceivedNotes GetEditGRNDetails(int GoodsReceivedNoteId, int purchaseOrderId, int POTypeId);
        int CreateGoodsReceivedNote(GoodsReceivedNotes goodsReceivedNotes);
        int UpdateGoodsReceivedNote(GoodsReceivedNotes goodsReceivedNotes);
        bool DeleteGoodsReceievedNote(GoodsReceivedNotesDelete deleteReceivedNotes);
        List<GoodsReceivedNotesItems> GetTotalReceivedItemQuantity(int purchaseOrderId, int purchaseOrderTypeId);
        byte[] GoodsReceivedNotesPrint(int goodsReceivedNotesId, int purchaseOrderTypeId, int companyId);
        byte[] DownloadFile(Attachments attachment);
        int VoidGRN(GRNVoid gRNVoid);
        int CheckGRNInInvoice(int GoodsReceivedNoteId);
    }
}
