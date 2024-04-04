﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IAssetTypeRepository
    {
        AssetTypeDisplayResult GetAssetTypes(GridDisplayInput gridDisplayInput);
        AssetTypeDisplayResult SearchAssetTypes(GridDisplayInput gridDisplayInput);
        AssetTypes GetAssetTypeDetails(int assetTypeId);
        int CreateAssetType(AssetTypes assetTypes);
        int UpdateAssetType(AssetTypes assetTypes);
        int DeleteAssetType(AssetTypes assetTypes);
        int ValidateAssetType(AssetTypes assetTypes);
    }
}
