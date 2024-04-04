using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface IAssetRegisterManager
    {
        AssetDetailsDisplayResult GetAllAssetsDetails(GridDisplayInput gridDisplayInput);

        AssetDetailsDisplayResult SearchAssets(AssetDetailsSearch assetMasterSearch);

        byte[] GetAssetRegisterPDFTemplate(AssetDetailsSearch displayInput);

        List<AssetDetails> PostedAssetDetails(int assetDetailId);
    }
}
