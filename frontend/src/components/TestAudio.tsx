import { useState } from "react"



export function TestAudio(){

    const [isActive, setIsActive] = useState(false)

    async function testReq(){
        try{
            const response = await fetch("/api/test_audio",{
                method:"post",
                headers:{"ContentType":"application/json"}
            })

            if(response.ok){
                const data = await response.json()
                if(data["active"]){
                    setIsActive(true)
                }else{
                    setIsActive(false)
                }
            }

        }catch(error){
            console.log(error)
        }
    }
    
    const buttonStyle = (isActive? "bg-red-400 ": "bg-slate-400 ")+"p-3 rounded-xl mb-5 ml-5"

    return(
        <>
            <div className="fixed bottom-0">
                <div className="flex flex-row justify-center item-center w-99/100">
                    <button onClick={testReq} className={buttonStyle}>
                        {isActive? "Stop": "Test"}
                    </button>
                </div>
            </div>
        </>
    )
}