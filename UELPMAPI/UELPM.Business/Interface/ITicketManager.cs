using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model.Models;

namespace UELPM.Business.Interface
{
    public interface ITicketManager
    {
        TicketDisplayResult GetTickets(GridDisplayInput ticketInput);
        int CreateTicket(Ticket m_ticket);
        bool UpdateTicket(Ticket m_ticket);
        bool DeleteTicket(TicketDelete ticketDelete);
        Ticket GetTicketAttachment(int ticketId);
        IEnumerable<EngineerAssignList> GetEngineerslist(GridDisplayInput gridDisplayInput);
        EngineerAssignDisplayResult GetEngineerAssignListing(EmployeeAssignDisplayInput empassignDisplayInput);
        Ticket GetTicketEngineer(int ticketId);
        int EngineerAvailableStatus(int EngineerId);
        byte[] DownloadFile(Attachments attachment);
        Ticket GetTicketDetails(int ticketId);
        TicketDisplayResult GetFilterTicket(TicketFilterDisplayInput ticketFilterDisplayInput);
        bool CreateAssignEngineer(List<EngineerAssignList> m_ticket);
        bool deleteEngineer(int userId);
        bool DeleteUnAssignEngineer(List<int> m_ticket);
        IEnumerable<Engineer> GetEngineerslist1();
        byte[] DownloadTicketQuotationFile(TicketQuotationAttachments ticketQuotationAttachments);
        int TicketSendMessage(TicketSendMessages ticketSendMessages);
        bool UpdateEngineerStatus(TicketManagement ticketManagement);
    }
}
