import { useEffect , useState } from "react"
import { SoundBoardItem } from "./SoundBoardItem"
import { SoundBoardSettings } from "./SoundBoardSettings"




export function SoundBoard(){
    const [items, setItems] = useState(new Array<string>())

    async function stopSoundboardAudio() {
        try{
            const response = await fetch("/api/stop_audio",{
                method:"post",
                headers: {"Content-Type":"application/json"}
            })

            if(response){
                const data = await response.json()
                console.log(data)
            }
        }catch(error){
            console.log(error)
        }
    }

    async function getSoundboardItems(){
        try{
           const response = await fetch("/api/get_audios",{
                method:"get",
                headers: {"Content-Type": "application/json"},
            })

            if(response.ok){
                const data = await response.json()
                setItems(data) 
            }
                
        }catch(error){
            console.log(error)
        }   
    }
    
    useEffect(()=>{
        getSoundboardItems()
    },[])
        

    return(
        <>
            <div className="flex flex-row item-center justify-center w-full p-5">
                <div className="flex flex-col w-9/10 p-5 bg-gray-200 rounded-xl">
                    <h2 className="text-center text-4xl mb-5">Sound Board</h2>
                    <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-2" >
                        {
                            items.map((value, index)=>(
                                <SoundBoardItem key={index} name={value} />
                            ))
                        }
                    </div>
                    <div className="flex item-center justify-center">
                        <button onClick={getSoundboardItems} className="bg-slate-400 p-3 rounded-xl mt-5">
                            Refresh
                        </button>
                        <button onClick={stopSoundboardAudio} className="bg-slate-400 p-3 rounded-xl mt-5 ml-5">
                            Stop
                        </button>
                    </div>
                    <SoundBoardSettings/>
                </div>
            </div>
        </>
    )
}