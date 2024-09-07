 
 import { getImageUrl} from '../../libs/helpers'

 
import Image from 'next/image'
 

const CategoryBlock = ({ brand, type  }) => {

   

    return (   
        <a href={`/product-list/${type}/${brand.slug}`} >       
            <div className='flex flex-col h-full pb-3  justify-between items-center border border-gray-500'>
               <Image className='w-full ' src={getImageUrl(brand.logo.url)} width={300} height={300} alt={brand.name} />
                <h2 className='pt-3 px-3 text-sm font-bold'>{brand.name}</h2>
                <h3 className='text-sm px-3 text-center flex-grow'>{brand.details } {brand.slug}</h3>
            </div>
        </a>
    );
}

export default CategoryBlock;
