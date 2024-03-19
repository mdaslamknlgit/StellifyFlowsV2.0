using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IAssetRegisterRepository
    {
        AssetDetailsDisplayResult GetAllAssetsDetails(GridDisplayInput gridDisplayInput);

        AssetDetailsDisplayResult SearchAssets(AssetDetailsSearch assetMasterSearch);

        byte[] GetAssetRegisterPDFTemplate(AssetDetailsSearch displayInput);

        List<AssetDetails> PostedAssetDetails(int assetDetailId);
    }
}
