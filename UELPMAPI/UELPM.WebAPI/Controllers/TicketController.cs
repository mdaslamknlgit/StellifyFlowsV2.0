using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;

namespace UELPM.WebAPI.Controllers
{
    public class TicketController : ApiController
    {
        private readonly ITicketManager m_ticketManager;

        public TicketController(ITicketManager ticketManager)
        {
            m_ticketManager = ticketManager;
        }

        [HttpGet]
        [Route("api/Tickets")]
        public IHttpActionResult GetTickets([FromUri] GridDisplayInput gridDisplayInput)
        {
            try
            {
                var result = m_ticketManager.GetTickets(gridDisplayInput);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/Tickets/Filter")]
        public IHttpActionResult GetFilterQuotationRequest([FromUri] TicketFilterDisplayInput ticketFilterDisplayInput)
        {
            try
            {
                var result = m_ticketManager.GetFilterTicket(ticketFilterDisplayInput);

                return Ok(result);

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        

        [HttpGet]
        [Route("api/Tickets/{ticketId}")]
        public IHttpActionResult GetTicketDetails(int ticketId)
        {
            try
            {
                var result = m_ticketManager.GetTicketDetails(ticketId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetTicketEngineer/{ticketId}")]
        public IHttpActionResult GetTicketEngineer(int ticketId)
        {
            try
            {
                var result = m_ticketManager.GetTicketEngineer(ticketId);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }



        [HttpPost]
        [Route("api/Tickets")]
        public IHttpActionResult CreateTicket()
        {
            ResponseStatus statusObj = new ResponseStatus();
            Ticket m_ticket = JsonConvert.DeserializeObject<Ticket>(HttpContext.Current.Request.Form["ticket"]);
            m_ticket.Files = HttpContext.Current.Request.Files;
            try
            {
                var result = m_ticketManager.CreateTicket(m_ticket);
                statusObj.Status = "success";
                statusObj.Value = result;

                return Ok(statusObj);
            }
            catch (Exception e)
            {
                statusObj.Status = "error";
                statusObj.Value = e.ToString();
                return Ok(statusObj);
            }
        }


        [HttpPost]
        [Route("api/TicketSendMessage")]
        public IHttpActionResult TicketSendMessage(TicketSendMessages ticketSendMessages)
        {
            var result = m_ticketManager.TicketSendMessage(ticketSendMessages);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/AssignEngineer")]
        public IHttpActionResult CreateAssignEngineer(List<EngineerAssignList> m_ticket)
        {
            ResponseStatus statusObj = new ResponseStatus();
            try
            {
                var result = m_ticketManager.CreateAssignEngineer(m_ticket);
                statusObj.Status = "success";
                statusObj.Value = result;
                return Ok(statusObj);
            }
            catch (Exception e)
            {
                statusObj.Status = "error";
                statusObj.Value = e.ToString();
                return Ok(statusObj);
            }
        }

        [HttpPut]
        [Route("api/Tickets")]
        public IHttpActionResult UpdateTicket()
        {
            ResponseStatus statusObj = new ResponseStatus();
            Ticket m_ticket = JsonConvert.DeserializeObject<Ticket>(HttpContext.Current.Request.Form["ticket"]);
            m_ticket.Files = HttpContext.Current.Request.Files;
            try
            {
                var result = m_ticketManager.UpdateTicket(m_ticket);
                statusObj.Status = "success";
                statusObj.Value = result;
                return Ok(statusObj);
            }
            catch (Exception e)
            {
                statusObj.Status = "error";
                statusObj.Value = e.ToString();
                return Ok(statusObj);
            }

        } 

        [HttpDelete]
        [Route("api/Tickets/{ticketid}/{userId}")]
        public IHttpActionResult DeleteTicket(int ticketid,int userId)
        {
            var result = m_ticketManager.DeleteTicket(new TicketDelete
            {
                TicketId = ticketid,
                UserID = userId,
                AttachmentTypeId= 2
            });
            return Ok(result);
        }

        [HttpGet]
        [Route("api/TicketQuotationFileDownload")]
        public HttpResponseMessage DownloadTicketQuotationFile([FromUri]TicketQuotationAttachments ticketQuotationAttachments)
        {
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            System.IO.MemoryStream stream = new MemoryStream(m_ticketManager.DownloadTicketQuotationFile(ticketQuotationAttachments));
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(ticketQuotationAttachments.FileName));
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("ticketQuotationAttachments")
            {
                FileName = ticketQuotationAttachments.FileName
            };
            result.Headers.Add("FileName", ticketQuotationAttachments.FileName);
            return result;
        }

        [HttpDelete]
        [Route("api/Tickets/{userId}")]
        public IHttpActionResult deleteEngineer(int userId)
        {
            var result = m_ticketManager.deleteEngineer(userId);
            return Ok(result);
        }

        [HttpPut]
        [Route("api/UpdateEngineerStatus")]
        public IHttpActionResult UpdateEngineerStatus(TicketManagement ticketManagement)
        {
            var result = m_ticketManager.UpdateEngineerStatus(ticketManagement);
            return Ok(result);
        }


        [HttpPost]
        [Route("api/DeleteUncheck")]
        public IHttpActionResult DeleteUnAssignEngineer(List<int> userId)
        {
            var result = m_ticketManager.DeleteUnAssignEngineer(userId);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/GetEngineerslist")]
        public IHttpActionResult GetEngineerslist([FromUri]GridDisplayInput gridDisplayInput)
        {
            try
            {
                var result = m_ticketManager.GetEngineerslist(gridDisplayInput);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetAllEngineerslist")]
        public IHttpActionResult GetAllEngineerslist()
        {
            try
            {
                var result = m_ticketManager.GetEngineerslist1();
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        [HttpGet]
        [Route("api/GetEngineerAssignListing")]
        public IHttpActionResult GetEngineerAssignListing([FromUri] EmployeeAssignDisplayInput empassignDisplayInput)
        {
            var result = m_ticketManager.GetEngineerAssignListing(empassignDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/EngineerAvailableStatus/{EngineerId}")]
        public IHttpActionResult EngineerAvailableStatus(int EngineerId)
        {
            var result = m_ticketManager.EngineerAvailableStatus(EngineerId);
            return Ok(result);
        }


        [HttpGet]
        [Route("api/TicketFileDownload")]
        public HttpResponseMessage DownloadFile([FromUri]Attachments attachment)
        {
            try
            {
                HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
                System.IO.MemoryStream stream = new MemoryStream(m_ticketManager.DownloadFile(attachment));
                result.Content = new StreamContent(stream);
                result.Content.Headers.ContentType = new MediaTypeHeaderValue(MimeMapping.GetMimeMapping(attachment.FileName));
                result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                {
                    FileName = attachment.FileName
                };
                result.Headers.Add("FileName", attachment.FileName);
                return result;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

    }
}
