'use client'

import dynamic from 'next/dynamic'

// Dynamically import your ScrollToTopButton with ssr: false
const ScrollToTopButton = dynamic(() => import('./ScrollToTopButton'), {
    ssr: false,
})

const ScrollToTopWrapper = () => {
    return <ScrollToTopButton />
}

export default ScrollToTopWrapper
