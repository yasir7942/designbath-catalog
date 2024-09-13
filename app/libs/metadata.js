// utils/metadata.js
 

export async function generateMetadata({  params }) {

  
  const {
    pageTitle,
    pageDescription,
    image,
  } = params;

    const imageUrl = process.env.NEXT_PUBLIC_ADMIN_BASE_URL + image
  
  return {
    
    title: pageTitle,
    
    description: pageDescription,
    
    openGraph: {
      images: [
        {
          "url": imageUrl,
          "alt": pageTitle,
           
        }
      ],
    },
    other: {
      'og:type': "website",
         "og:title" : pageTitle,
         "og:description":  pageDescription,
        "og:image": image,
    },
  };
}
