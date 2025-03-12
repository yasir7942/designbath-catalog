


export const getImageUrl = (path) => {

  if (process.env.NEXT_PUBLIC_MODE == "dev") {
    if (path)
      return process.env.NEXT_PUBLIC_LOCAL_BASE_IMAGE_URL + path;
  }
  else {
    if (path)
      return process.env.NEXT_PUBLIC_ADMIN_BASE_URL + path;
  }
}