using System.Web.Http;
using UELPM.Business;
using UELPM.Model.Models;

namespace UELPM.WebAPI.Controllers
{
    public class ItemController : ApiController
    {
        private readonly IItemManager m_itemManager;

        public ItemController(IItemManager itemManager)
        {
            m_itemManager = itemManager;
        }

        /// <summary>
        /// This method is used for getting all items
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("api/items")]
        public IHttpActionResult GetItems()
        {
            var result = m_itemManager.GetItems();
            return Ok(result);
        }

        /// <summary>
        /// This method is used to create item
        /// </summary>
        /// <param name="item">item</param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/items")]
        public IHttpActionResult CreateItem(Item item)
        {
            var result = m_itemManager.CreateItem(item);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to udpate item
        /// </summary>
        /// <param name="item">item</param>      
        /// <returns></returns>
        [HttpPut]
        [Route("api/items")]
        public IHttpActionResult UpdateItem(Item item)
        {
            var result = m_itemManager.UpdateItem(item);
            return Ok(result);
        }

        /// <summary>
        /// This method is used to delete item
        /// </summary>
        /// <param name="id">id</param>
        /// <returns></returns>

        [HttpDelete]
        [Route("api/items/{id}")]
        public IHttpActionResult DeleteItem(int id)
        {
            var result = m_itemManager.DeleteItem(id);
            return Ok(result);
        }
    }
}
