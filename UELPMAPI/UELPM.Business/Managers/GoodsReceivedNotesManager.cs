using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.Service.Interface;

namespace UELPM.Business.Managers
{
    public class GoodsReceivedNotesManager: IGoodsReceivedNotesManager
    {
        private readonly IGoodsReceivedNotesRepository m_goodReceivedNotesRepository;
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="purchaseOrderCreationRepository"></param>
        public GoodsReceivedNotesManager(IGoodsReceivedNotesRepository goodsReceivedNotesRepository)
        {
            m_goodReceivedNotesRepository = goodsReceivedNotesRepository;
        }
        public GoodsReceivedNotesDisplayResult GetGoodsReceivedNotes(GridDisplayInput purchaseOrderInput)
        {
            return m_goodReceivedNotesRepository.GetGoodsReceivedNotes(purchaseOrderInput);
        }
        public GoodsReceivedNotes GetGoodsReceivedNotesDetails(int goodReceivedNoteId, int purchaseOrderId,int purchaseOrderTypeId)
        {
            return m_goodReceivedNotesRepository.GetGoodsReceivedNotesDetails(goodReceivedNoteId,purchaseOrderId, purchaseOrderTypeId);
        }
        public int CreateGoodsReceivedNote(GoodsReceivedNotes goodsReceivedNotes)
        {
            return m_goodReceivedNotesRepository.CreateGoodsReceivedNote(goodsReceivedNotes);
        }
        public int UpdateGoodsReceivedNote(GoodsReceivedNotes goodsReceivedNotes)
        {
            return m_goodReceivedNotesRepository.UpdateGoodsReceivedNote(goodsReceivedNotes);
        }
        public bool DeleteGoodsReceievedNote(GoodsReceivedNotesDelete deleteReceivedNotes)
        {
            return m_goodReceivedNotesRepository.DeleteGoodsReceievedNote(deleteReceivedNotes);
        }
        public List<GoodsReceivedNotesItems> GetTotalReceivedItemQuantity(int purchaseOrderId, int purchaseOrderTypeId)
        {
            return m_goodReceivedNotesRepository.GetTotalReceivedItemQuantity(purchaseOrderId, purchaseOrderTypeId);
        }

        public byte[] GoodsReceivedNotesPrint(int goodsReceivedNotesId, int purchaseOrderTypeId, int companyId)
        {
            return m_goodReceivedNotesRepository.GoodsReceivedNotesPrint(goodsReceivedNotesId, purchaseOrderTypeId, companyId);
        }

        public GoodsReceivedNotesDisplayResult GetDraftCount(int purchaseorderId, int poTypeId, int companyId)
        {
            return m_goodReceivedNotesRepository.GetDraftCount(purchaseorderId, poTypeId, companyId);
        }

        public byte[] DownloadFile(Attachments attachment)
        {
            return m_goodReceivedNotesRepository.DownloadFile(attachment);
        }

        public int VoidGRN(GRNVoid gRNVoid)
        {
            return m_goodReceivedNotesRepository.VoidGRN(gRNVoid);
        }

        public GoodsReceivedNotesDisplayResult GetFilterGRN(GRNFilterDisplayInput gRNFilterDisplayInput)
        {
            return m_goodReceivedNotesRepository.GetFilterGRN(gRNFilterDisplayInput);
        }

        public GoodsReceivedNotes GetEditGRNDetails(int GoodsReceivedNoteId, int purchaseOrderId, int POTypeId)
        {
            return m_goodReceivedNotesRepository.GetEditGRNDetails(GoodsReceivedNoteId, purchaseOrderId, POTypeId);
        }

        public int CheckGRNInInvoice(int GoodsReceivedNoteId)
        {
            return m_goodReceivedNotesRepository.CheckGRNInInvoice(GoodsReceivedNoteId);
        }
    }
}
