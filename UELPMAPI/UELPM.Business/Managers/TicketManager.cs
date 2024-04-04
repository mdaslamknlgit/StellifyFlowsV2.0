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
    public class TicketManager : ITicketManager
    {
        private readonly ITicketRepository m_ticketRepository;

        public TicketManager(ITicketRepository ticketRepository)
        {
            m_ticketRepository = ticketRepository;
        }

        public int CreateTicket(Ticket m_ticket)
        {
            return m_ticketRepository.CreateTicket(m_ticket);
        }

        public bool DeleteTicket(TicketDelete ticketDelete)
        {
            return m_ticketRepository.DeleteTicket(ticketDelete);
        }

        public IEnumerable<EngineerAssignList> GetEngineerslist(GridDisplayInput gridDisplayInput)
        {
            return m_ticketRepository.GetEngineerslist(gridDisplayInput);
        }

        public EngineerAssignDisplayResult GetEngineerAssignListing(EmployeeAssignDisplayInput empassignDisplayInput)
        {
            return m_ticketRepository.GetEngineerAssignListing(empassignDisplayInput);
        }

        public Ticket GetTicketAttachment(int ticketId)
        {
            return m_ticketRepository.GetTicketAttachment(ticketId);
        }

        public TicketDisplayResult GetTickets(GridDisplayInput ticketInput)
        {
            return m_ticketRepository.GetTickets(ticketInput);
        }

        public bool UpdateTicket(Ticket m_ticket)
        {
            return m_ticketRepository.UpdateTicket(m_ticket);
        }

        public Ticket GetTicketEngineer(int ticketId)
        {
            return m_ticketRepository.GetTicketEngineer(ticketId);
        }

        public int EngineerAvailableStatus(int EngineerId)
        {
            return m_ticketRepository.EngineerAvailableStatus(EngineerId);
        }

        public byte[] DownloadFile(Attachments attachment)
        {
            return m_ticketRepository.DownloadFile(attachment);
        }

        public Ticket GetTicketDetails(int ticketId)
        {
            return m_ticketRepository.GetTicketDetails(ticketId);
        }

        public TicketDisplayResult GetFilterTicket(TicketFilterDisplayInput ticketFilterDisplayInput)
        {
            return m_ticketRepository.GetFilterTicket(ticketFilterDisplayInput);
        }

        public bool CreateAssignEngineer(List<EngineerAssignList> m_ticket)
        {
            return m_ticketRepository.CreateAssignEngineer(m_ticket);
        }

        public bool deleteEngineer(int userId)
        {
            return m_ticketRepository.deleteEngineer(userId);
        }

        public bool DeleteUnAssignEngineer(List<int> m_ticket)
        {
            return m_ticketRepository.DeleteUnAssignEngineer(m_ticket);
        }

        public IEnumerable<Engineer> GetEngineerslist1()
        {
            return m_ticketRepository.GetEngineerslist1();
        }

        public byte[] DownloadTicketQuotationFile(TicketQuotationAttachments ticketQuotationAttachments)
        {
            return m_ticketRepository.DownloadTicketQuotationFile(ticketQuotationAttachments);
        }

        public int TicketSendMessage(TicketSendMessages ticketSendMessages)
        {
            return m_ticketRepository.TicketSendMessage(ticketSendMessages);
        }

        public bool UpdateEngineerStatus(TicketManagement ticketManagement)
        {
            return UpdateEngineerStatus(ticketManagement);
        }
    }
}
