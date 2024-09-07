import Image from "next/image"
import { getImageUrl } from "../../libs/helpers"
import VideoFrame from "../layout/VideoFrame"
import ShareButton from "../elements/ShareButton"
import CopyButton from "../elements/CopyButton"


const ProductBlock = ({ product, pageNumber }) => {

    let discountedPrice = 0;
    let pagenumber = pageNumber>0? pageNumber : ""
 // console.log("-------------------------------------------------------------");
 //   console.log(product.brand.discount);
      if(product.useBrandDiscount && product.brand.discount !== null && product.brand.discount !== '')
     {
         const discount = Number(product.brand.discount) / 100;
          discountedPrice = (Number(product.price) - (Number(product.price) * discount)) | 0;
        
     }
     else if(!product.useBrandDiscount &&   product.salePrice !== null && product.salePrice !== '')
     {
          if(IsFixValueDiscount)
          {
            discountedPrice = Number(product.price) - Number(product.salePrice)
          }
          else
          {
            let percentageDiscount = Number(product.salePrice) / 100;
            discountedPrice = (Number(product.price) - (Number(product.price) * percentageDiscount)) | 0;

            }

     }
 
     const isDiscounted = discountedPrice > 0;


    return (
        <div className="w-full h-auto  mb-5  border-4 border-gray-500">
          
            <Image className='w-full ' src={getImageUrl(product.image.url)} width={1000} height={1000} alt={product.name} />
            <div className="w-full h-[1px] mt-5   " />

            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 p-5  mt-2 justify-start items-center bg-slate-100">
                <div className="flex flex-col justify-center text-left   md:pr-10 w-full md:w-1/2">
                    <div><strong>Product Name:</strong> {product.name}</div>
                    <div><strong>Model:</strong> {product.model}</div>
                    <div className="max-w-60"><strong>Product Details:</strong> <span className="font-light text-sm">{product.details}</span>  </div>
                    <div>
                    <strong className={isDiscounted ? 'line-through' : ''}>List Price:</strong> 
                    <span className={isDiscounted ? 'line-through' : ''}>{product.price}/-</span>
                    </div>
                    <div className={isDiscounted ? '' : 'hidden'}><strong>Discounted Price:</strong> {discountedPrice > 0 ? `${discountedPrice}/-` : 'N/A'}</div>
                    


                </div>
                 <div className="flex flex-col items-left space-y-3 ">

                 {product.videoLinks && product.videoLinks.length > 0 && (
                   <>
                      <div className="capitalize font-semibold "> {product.videoLinks? "Product Videos":"" }</div>
                      </>
                    )}
                      <div className=" grid  w-full md:w-1/2  grid-cols-5 items-center   gap-3   ">
                

                        {product.videoLinks?.map((links) => (
                  
                              <VideoFrame key={links.id} videoCode={links.videoCode} />
                
                            ))}
                    </div>
                 </div>
            </div>

            <div className="flex  flex-col justify-between p-5  items-center bg-slate-100">
              <div className="flex items-center capitalize font-light text-base text-red-600">
                    share this Product with other
              </div>
              <div className="flex  flex-row justify-between items-center space-x-7 mt-3">
                   <ShareButton slug={product.slug} productName={product.name} price={product.price} discount={discountedPrice} />   <CopyButton copyData={product.slug} />
              </div>

            </div>

            
            <div className="  w-full  text-right pr-2 justify-center    bg-slate-500 text-white font-bold ">
                {pagenumber}
            </div>
        </div>
    )
}

export default ProductBlock
