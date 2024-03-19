using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Service.Interface
{
    public interface IDeliveryTermsRepository
    {
        DeliveryTermsDisplayResult GetDeliveryTerms(GridDisplayInput gridDisplayInput);
        DeliveryTerms GetDeliveryTermsDetails(int deliveryTermsId);
        int CreateDeliveryTerm(DeliveryTerms deliveryTerm);
        int UpdateDeliveryTerm(DeliveryTerms deliveryTerm);
        bool DeleteDeliveryTerms(DeliveryTerms deliveryTerm);
        DeliveryTermsDisplayResult GetAllDeliveryTerms(GridDisplayInput gridDisplayInput);
        int ValidateDeliveryTerms(DeliveryTerms deliveryTerms);
    }
}
