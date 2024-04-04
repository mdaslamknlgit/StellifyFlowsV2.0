using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UELPM.Model;

namespace UELPM.Business.Interface
{
    public interface IProductsManager
    {
        ProductsListResult SearchProducts(UserInfo MyUserInfo, SearchProducts searchProducts);

        ProductsDTO GetProductByProductId(UserInfo MyUserInfo, int ProductId);

        IEnumerable<ProductsDomainItem> GetProductDomainItem(UserInfo MyUserInfo);

        ResultReponse CreateProduct(ProductsDTO productsDTO, UserInfo MyUserInfo);

        ResultReponse UpdateProduct(ProductsDTO productsDTO, UserInfo MyUserInfo);
    }
}
