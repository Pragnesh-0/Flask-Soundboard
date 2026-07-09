import { useState, useEffect, useRef } from "react"


export function PollServer(){
    const pollTimeout = useRef<ReturnType<typeof setTimeout>>(null);

    const targetStyle = "flex flex-row justify-between item-center"
    const [status, setStatus] = useState(false)

    async function pollServer(){
        try{
            const response = await fetch("/api/poll",{
                method:"post",
                headers: {"ContentType":"application/json"},
            })
            if(!response.ok){
                setStatus(false)
            }else{
                setStatus(true)
            }
        }catch(error){
            pollTimeout.current = null
            console.log(error)
            setStatus(false)
        }finally{
            pollTimeout.current = setTimeout(pollServer, 4000)
        }
    }

    

    useEffect(()=>{
        pollServer()
    },[])



    return(
        <>
            <div className="fixed w-full">
                <div className="flex flex-row justify-end item-center w-99/100">
                    <h2 className={targetStyle + (status? " text-green-700": " text-red-700")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target-icon lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                        {status? "Online": "Offline"}
                    </h2>
                </div>
            </div>
        </>
    )
}