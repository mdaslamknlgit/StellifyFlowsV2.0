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
    public class GoodsReturnedNotesManager : IGoodsReturnedNotesManager
    {
        private readonly IGoodsReturnedNotesRepository m_goodsReturnedNotesRepository;

        public GoodsReturnedNotesManager(IGoodsReturnedNotesRepository goodsReturnedNotesRepository)
        {
            m_goodsReturnedNotesRepository = goodsReturnedNotesRepository;
        }

        public int CreateGoodsReturnedNote(GoodsReturnedNotes goodsReturnedNotes)
        {
            return m_goodsReturnedNotesRepository.CreateGoodsReturnedNote(goodsReturnedNotes);
        }

        public bool DeleteGoodsReturnedNote(GoodReturnedNotesDelete goodReturnedNotesDelete)
        {
            return m_goodsReturnedNotesRepository.DeleteGoodsReturnedNote(goodReturnedNotesDelete);
        }

        public GoodsReturnedNotesDisplayResult GetGoodsReturnedNotes(GridDisplayInput goodsReceivedNotesInput)
        {
            return m_goodsReturnedNotesRepository.GetGoodsReturnedNotes(goodsReceivedNotesInput);
        }

        public GoodsReturnedNotes GetGRNDetails(int goodsReceivedNoteId, int POTypeId)
        {
            return m_goodsReturnedNotesRepository.GetGRNDetails(goodsReceivedNoteId, POTypeId);
        }
        

        public GoodsReturnedNotesDisplayResult GetGRTForApprovals(GridDisplayInput gridDisplayInput)
        {
            return m_goodsReturnedNotesRepository.GetGRTForApprovals(gridDisplayInput);
        }

        public byte[] GoodsReturnedNotesPrint(int goodsReturnedNotesId, int poTypeId, int companyId)
        {
            return m_goodsReturnedNotesRepository.GoodsReturnedNotesPrint(goodsReturnedNotesId,poTypeId, companyId);
        }

        public GoodsReturnedNotes GetGoodsReturnedNotesDetails(int goodsReturnedNoteId, int loggedInUserId = 0)
        {
            return m_goodsReturnedNotesRepository.GetGoodsReturnedNotesDetails(goodsReturnedNoteId, loggedInUserId);
        }

        public int UpdateGoodsReturnedNote(GoodsReturnedNotes goodsReturnedNotes)
        {
            return m_goodsReturnedNotesRepository.UpdateGoodsReturnedNote(goodsReturnedNotes);
        }

        public GoodsReturnedNotesDisplayResult SearchGoodsReturnedNote(GoodsReturnedNoteSearch goodsReturnedNoteSearch)
        {
            return m_goodsReturnedNotesRepository.SearchGoodsReturnedNote(goodsReturnedNoteSearch);
        }

        public GoodsReturnedNotesDisplayResult GetFilterGoodsReturnNotes(GoodsReturnNoteFilterDisplayInput goodsReturnNoteFilterDisplayInput)
        {
            return m_goodsReturnedNotesRepository.GetFilterGoodsReturnNotes(goodsReturnNoteFilterDisplayInput);
        }
    }
}
