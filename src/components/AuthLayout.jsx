import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import {useSelector} from "react-redux"
import {useNavigate} from "react-router-dom"

const Protected = ({children, authentication}) => {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()
  const[loader, setLoader] = useState(true)

  useEffect(() => {
    //authentication means this page requires authentication, and authStatus means you're logged in or not
    if(authentication && authStatus !== authentication){
      navigate("/PoeticOdyssey/login")
    }else if(!authentication && authStatus !== authentication){// this says that this page is visible to all i.e authentication ain't required, but you're logged in so redirect to home page
      navigate("/PoeticOdyssey")
    }

    setLoader(false)
  },[authStatus, authentication, navigate])

  
  return loader ? null : <>{children}</>
}

export default Protected
