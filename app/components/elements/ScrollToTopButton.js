'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 200)
        }

        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        isVisible && (
            <button
                onClick={scrollToTop}
                className="fixed bottom-5 right-5 p-3 bg-gray-800 text-white  border-2 border-white rounded-full shadow-md hover:bg-gray-700 transition-all z-50"
                aria-label="Scroll to top"
            >
                <ArrowUp size={20} />
            </button>
        )
    )
}

export default ScrollToTopButton
