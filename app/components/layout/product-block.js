import Image from "next/image"
import { getImageUrl } from "../../libs/helpers"
import VideoFrame from "../layout/VideoFrame"
import ShareButton from "../elements/ShareButton"
import CopyButton from "../elements/CopyButton"


const ProductBlock = ({ product, pageNumber }) => {

  let discountedPrice = 0;
  let pagenumber = pageNumber > 0 ? pageNumber : ""
  // console.log("-------------------------------------------------------------");
  //   console.log(product.brand.discount);
  if (product.useBrandDiscount && product.brand.discount !== null && product.brand.discount !== '') {
    const discount = Number(product.brand.discount) / 100;
    discountedPrice = (Number(product.price) - (Number(product.price) * discount)) | 0;

  }
  else if (!product.useBrandDiscount && product.salePrice !== null && product.salePrice !== '') {
    if (IsFixValueDiscount) {
      discountedPrice = Number(product.price) - Number(product.salePrice)
    }
    else {
      let percentageDiscount = Number(product.salePrice) / 100;
      discountedPrice = (Number(product.price) - (Number(product.price) * percentageDiscount)) | 0;

    }

  }

  const isDiscounted = discountedPrice > 0;


  const productUrl = process.env.NEXT_PUBLIC_BASE_URL + '/product/' + product.slug;
  const ProductTitle = encodeURIComponent(product.name);

  const filterUrl = process.env.NEXT_PUBLIC_BASE_URL + '/product-list/filter/'





  return (
    <div className="flex flex-col justify-start items-center ">

      <div className="flex flex-col justify-start items-center w-full md:w-3/4 xl:w-2/4 h-auto    mb-5  border-4 border-gray-500 ">

        {product.image?.url ? (

          <Image
            className="w-full h-auto select-none"
            draggable={false}
            priority
            quality={100}
            src={getImageUrl(product.image.url)}
            width={1000}
            height={1000}
            alt={product.name}
          />
        ) : (
          <div></div>
        )}

        <div className="w-full h-[1px]  mt-5  " />

        <div className="flex flex-col md:flex-row w-full space-y-3 md:space-y-0 p-5  mt-2 justify-start items-center bg-slate-100">
          <div className="flex flex-col justify-center text-left   md:pr-10 w-full md:w-1/2">
            <div><strong>Product Name:</strong> {product.name}</div>
            <div><strong>Model:</strong> {product.model ? product.model : ""}</div>
            <div className="max-w-60"><strong>Product Details:</strong> <span className="font-light text-sm">{product.details ? product.details : ""}</span>  </div>
            <div>
              {product.haveStock !== null && product.haveStock !== undefined && (
                <div>
                  <div className="flex items-center">
                    <strong className="flex pr-2">Stock:</strong>
                    <div
                      className={`w-3 h-3 flex  rounded-full mr-2 ${product.haveStock ? 'bg-green-500' : 'bg-orange-500'}`}
                    ></div>
                  </div>
                </div>
              )}



              <strong className={isDiscounted ? 'line-through' : ''}>List Price:</strong>
              <span className={isDiscounted ? 'line-through' : ''}>{product.price}/-</span>
            </div>
            <div className={isDiscounted ? '' : 'hidden'}><strong>Discounted Price:</strong> {discountedPrice > 0 ? `${discountedPrice}/-` : 'N/A'}</div>



          </div>
          <div className="flex flex-col items-left space-y-3 ">

            {product.videoLinks && product.videoLinks.length > 0 && (
              <>
                <div className="capitalize font-semibold "> {product.videoLinks ? "Product Videos" : ""}</div>
              </>
            )}
            <div className=" grid  w-full md:w-1/2  grid-cols-5 items-center   gap-3   ">


              {product.videoLinks?.map((links) => (

                <VideoFrame key={links.id} videoCode={links.videoCode} />

              ))}
            </div>
          </div>
        </div>

        <div className="flex  flex-col w-full justify-between p-5  items-center bg-slate-100">
          <div className="flex items-center capitalize font-light text-base text-red-600">
            share this Product with other
          </div>
          <div className="flex  flex-row justify-between items-center space-x-7 mt-3 ">
            <ShareButton slug={product.slug} productName={product.name} price={product.price} discount={discountedPrice} />   <CopyButton copyData={product.slug} />


            <a href={`https://api.whatsapp.com/send?phone=923246669988&text=*${ProductTitle}*%0AList Price-${product.price}%0ADiscounted Price- ${discountedPrice}%0A${productUrl}`} target="_blank">
              <Image className="w-12 ml-3" src="/images/whatsapp-icon.png" width={200} height={200} alt={product.name} />
              <span className="text-sm font-light" >WhatsApp Us</span>
            </a>

          </div>
          <div className="flex flex-col w-full">
            {product.tags?.length > 0 && (
              <>
                <div className="text-sm font-bold">Related Products Links</div>
                <div className="flex flex-row space-x-4 mt-4">
                  {product.tags.map((tag) => (
                    <a key={tag.id} href={`${filterUrl}${tag.slug}`}>
                      <button className="px-6 py-2 border border-gray-500 text-gray-900 rounded hover:bg-gray-900 hover:text-white">
                        {tag.name}
                      </button>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>


        <div className="  w-full  text-right pr-2 justify-center    bg-slate-500 text-white font-bold ">
          {pagenumber}
        </div>
      </div>
    </div>
  )
}

export default ProductBlock
