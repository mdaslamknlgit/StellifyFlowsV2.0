﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
   public interface IServiceCategoryRepository
    {
        ServiceCategoryDisplayResult GetServiceCategory(GridDisplayInput displayInput);
        ServiceCategoryDisplayResult GetAllServiceCategory(GridDisplayInput displayInput);
        ServiceCategory GetServiceCategory(int serviceCategoryId);
        int CreateServiceCategory(ServiceCategory serviceCategory);
        int UpdateServiceCategory(ServiceCategory serviceCategory);
        bool DeleteServiceCategory(ServiceCategory serviceCategory);
        int ValidateServiceName(ServiceCategory serviceCategory);
    }
}
