import React, { useEffect, useState } from 'react'
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';


const Search = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [isSearchPage,setIsSearchPage] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [ isMobile ] = useMobile()
    const params = useLocation()
    const searchText = params.search.slice(3)

    useEffect(()=>{
        const isSearch = location.pathname === "/search"
        setIsSearchPage(isSearch)
    },[location])


    const redirectToSearchPage = ()=>{
        navigate("/search")
    }

    const handleOnChange = (e)=>{
        const value = e.target.value
        const url = `/search?q=${value}`
        navigate(url)
    }

    const handleFocus = () => {
        setIsFocused(true)
    }

    const handleBlur = () => {
        setIsFocused(false)
    }

  return (
    <div className={`
        w-full min-w-[300px] lg:min-w-[420px] 
        h-12 lg:h-14 
        rounded-full lg:rounded-2xl
        overflow-hidden 
        flex items-center 
        transition-all duration-300 ease-in-out
        ${isFocused || isSearchPage 
            ? 'bg-white shadow-lg border-2 border-blue-500 scale-[1.02]' 
            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md'
        }
        group
    `}>
        <div className="flex items-center justify-center pl-4 lg:pl-5">
            {
                (isMobile && isSearchPage ) ? (
                    <Link 
                        to={"/"} 
                        className='flex justify-center items-center h-9 w-9 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-600 hover:text-gray-900'
                    >
                        <FaArrowLeft size={18}/>
                    </Link>
                ) :(
                    <button className={`
                        flex justify-center items-center 
                        h-10 w-10 
                        rounded-full
                        transition-all duration-200
                        ${isFocused || isSearchPage 
                            ? 'text-blue-600' 
                            : 'text-gray-400 group-hover:text-gray-600'
                        }
                    `}>
                        <IoSearch size={22}/>
                    </button>
                )
            }
        </div>
        <div className='flex-1 h-full'>
            {
                !isSearchPage ? (
                     //not in search page - show clickable placeholder
                     <div 
                        onClick={redirectToSearchPage} 
                        className='w-full h-full flex items-center px-2 cursor-text'
                    >
                        <span className="text-gray-400 text-sm lg:text-base">
                            Search products...
                        </span>
                     </div>
                ) : (
                    //when on search page
                    <div className='w-full h-full flex items-center'>
                        <input
                            type='text'
                            placeholder='Search products...'
                            autoFocus
                            defaultValue={searchText}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className='bg-transparent w-full h-full outline-none px-2 text-gray-900 placeholder:text-gray-400 text-sm lg:text-base'
                            onChange={handleOnChange}
                        />
                    </div>
                )
            }
        </div>
        
    </div>
  )
}

export default Search
