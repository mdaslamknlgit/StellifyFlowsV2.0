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
    public class DeliveryTermsManager : ManagerBase, IDeliveryTermsManager
    {
        private readonly IDeliveryTermsRepository m_DeliveryTermRepository;

        public DeliveryTermsManager(IDeliveryTermsRepository deliveryTermRepository)
        {
            m_DeliveryTermRepository = deliveryTermRepository;
        }
        public DeliveryTermsDisplayResult GetDeliveryTerms(GridDisplayInput gridDisplayInput)
        {
            return m_DeliveryTermRepository.GetDeliveryTerms(gridDisplayInput);
        }
        public DeliveryTerms GetDeliveryTermsDetails(int deliveryTermsId)
        {
            return m_DeliveryTermRepository.GetDeliveryTermsDetails(deliveryTermsId);
        }
        public int CreateDeliveryTerm(DeliveryTerms deliveryTerm)
        {
            return m_DeliveryTermRepository.CreateDeliveryTerm(deliveryTerm);
        }
        public int UpdateDeliveryTerm(DeliveryTerms deliveryTerm)
        {
            return m_DeliveryTermRepository.UpdateDeliveryTerm(deliveryTerm);
        }
        public bool DeleteDeliveryTerms(DeliveryTerms deliveryTerm)
        {
            return m_DeliveryTermRepository.DeleteDeliveryTerms(deliveryTerm);
        }

        public DeliveryTermsDisplayResult GetAllDeliveryTerms(GridDisplayInput gridDisplayInput)
        {
            return m_DeliveryTermRepository.GetAllDeliveryTerms(gridDisplayInput);
        }
        public int ValidateDeliveryTerms(DeliveryTerms deliveryTerms)
        {
            return m_DeliveryTermRepository.ValidateDeliveryTerms(deliveryTerms);
        }
    }
}
