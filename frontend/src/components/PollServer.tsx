import { useState, useEffect, useRef } from "react"


export function PollServer(){
    const pollTimeout = useRef<ReturnType<typeof setTimeout>>(null);

    const targetStyle = "flex flex-row justify-between item-center"
    const buttonStyle = "p-3 rounded-xl mb-5 ml-5 bg-red-400"
    const [status, setStatus] = useState(false)
    const [engineStatus, setEngineStatus] = useState(false)

    async function pollServer(){
        try{
            const response = await fetch("/api/poll",{
                method:"post",
                headers: {"ContentType":"application/json"},
            })
            if(!response.ok){
                setStatus(false)
            }else{
                const fetchedData = await response.json()
                setEngineStatus(fetchedData["engine"])
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

    async function restartReq(){
        try{
            const response = await fetch("/api/restart_engine",{
                method:"post",
                headers:{"ContentType":"application/json"}
            })

            if(response.ok){
                const data = await response.json()
                console.log(data)
                window.location.reload()
            }

        }catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        pollServer()
    },[])

    function renderButton(){
        if(!status){return}
        if(engineStatus){return}
        return(
            <>
                <button className={buttonStyle} onClick={restartReq} > Restart </button>
            </>
        )
    }



    return(
        <>
            <div className="fixed w-full">
                <div className="flex flex-row justify-end item-center w-99/100">
                    <h2 className={targetStyle + (status? engineStatus? " text-green-700": " text-yellow-700": " text-red-700")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target-icon lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                        {status? engineStatus? "Online": "No Input Stream": "Offline"}
                    </h2>
                </div>
                {
                   renderButton()
                }
            </div>
        </>
    )
}