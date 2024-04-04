using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IGoodsReturnedNotesRepository
    {
        GoodsReturnedNotesDisplayResult GetGoodsReturnedNotes(GridDisplayInput goodsReceivedNotesInput);
        GoodsReturnedNotesDisplayResult GetGRTForApprovals(GridDisplayInput gridDisplayInput);
        GoodsReturnedNotesDisplayResult SearchGoodsReturnedNote(GoodsReturnedNoteSearch goodsReturnedNoteSearch);
        GoodsReturnedNotesDisplayResult GetFilterGoodsReturnNotes(GoodsReturnNoteFilterDisplayInput goodsReturnNoteFilterDisplayInput);
        int CreateGoodsReturnedNote(GoodsReturnedNotes goodsReturnedNotes);
        int UpdateGoodsReturnedNote(GoodsReturnedNotes goodsReturnedNotes);
        bool DeleteGoodsReturnedNote(GoodReturnedNotesDelete goodReturnedNotesDelete);
        byte[] GoodsReturnedNotesPrint(int goodsReturnedNotesId, int poTypeId, int companyId);
        GoodsReturnedNotes GetGRNDetails(int goodsReceivedNoteId, int POTypeId);
        GoodsReturnedNotes GetGoodsReturnedNotesDetails(int goodsReceivedNoteId, int loggedInUserId = 0);




    }
}
