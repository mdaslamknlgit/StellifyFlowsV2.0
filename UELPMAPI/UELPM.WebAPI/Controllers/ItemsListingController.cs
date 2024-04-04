using System;
using System.Web.Http;
using UELPM.Business.Interface;
using UELPM.Model.Models;
using UELPM.WebAPI.Filters;

namespace UELPM.WebAPI.Controllers
{
    public class ItemsListingController : ApiController
    {
        private readonly IItemsListingManager m_itemslistingManager;   // m_itemsListingManager

        public ItemsListingController(IItemsListingManager itemslistingManager)   
        {
            m_itemslistingManager = itemslistingManager;
        }

        
        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetItemsListing")]
        public IHttpActionResult GetItemsListing([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_itemslistingManager.GetItemsListing(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetSearchItems")]
        public IHttpActionResult GetSearchItems([FromUri] GridDisplayInput gridDisplayInput)
        {
            var result = m_itemslistingManager.SearchItems(gridDisplayInput);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/GetExistingItemsListing")]
        public IHttpActionResult GetExistingItemsListing([FromUri] Shared shared)
        {
            var result = m_itemslistingManager.GetExistingItemsListing(shared);
            return Ok(result);
        }


        

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/SearchItemListing/{locationID}")]
        public IHttpActionResult SearchItemListing(int locationID)
        {
            var result = m_itemslistingManager.SearchItemListing(locationID);
            return Ok(result);
        }

        [HttpGet]
        [CacheControl(MaxAge = 0)]
        [Route("api/ItemsListing/Filter")]
        public IHttpActionResult GetFilterItemListing([FromUri] ItemsListingFilterDisplayInput itemsListingFilterDisplayInput)
        {
            try
            {
                var result = m_itemslistingManager.GetFilterItemListing(itemsListingFilterDisplayInput);
                return Ok(result);
            }
            catch (Exception e)
            {
                throw e;
            }
        }





    }
}
