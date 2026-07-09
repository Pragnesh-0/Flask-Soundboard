import { useState, useRef, useEffect } from "react"

type OutputSettings = "volume" | "semitone"



export function TTSSection(){
    const dataChangeCheck = useRef<ReturnType<typeof setTimeout>>(null);

    const maxLen = 2000
    const [text, setText] = useState("")
    const [h2Class, seth2Class] = useState("text-center")
    const [ttsSettings, setTTSSettings] = useState(new Map<OutputSettings, number>()
        .set("semitone", -12)
        .set("volume", 1)
    )
    

    function textChange(newText:string){
        if(newText.length > maxLen){
            seth2Class("text-center text-red-500")
        }else{
            seth2Class("text-center")
        }
        setText(newText)
    }

    async function requestTTS() {
        if(text.length > maxLen){
            return
        }
        try{
           const response = await fetch("/api/use_tts",{
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({"text":text})
            })

            const data = await response.json()
            console.log(data) 
        }catch(error){
            console.log(error)
        }
            
    }

    async function stopTTS() {
        try{
            const response = await fetch("/api/stop_tts",{
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({"text":text})
            })

            if(response.ok){
                const data = await response.json()
                console.log(data)
            }
        }catch(error){
            console.log(error)
        }
            
    }

    async function changeSettingsReq(type: OutputSettings,value: number) {
        try{
            const response = await fetch("/api/tts_settings",{
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({"setting":type, "value":value})
            })
            
            if(response.ok){
                const data = await response.json()
                console.log(data)
            }
                
        }catch(error){
            console.log(error)
        }
    }

    function changeSetting(type: OutputSettings,value: number){
        if(dataChangeCheck.current){
            clearTimeout(dataChangeCheck.current)
        }
            
        const newTTSSettings = new Map(ttsSettings)
        newTTSSettings.set(type, value)
        const curData = value

        dataChangeCheck.current = setTimeout(()=>{
            if(curData == newTTSSettings.get(type)){
                changeSettingsReq(type, value)
                setTTSSettings(newTTSSettings)
            }
        },50)
    }

    async function getSettings(){
        try{
            const response = await fetch("/api/get_settings",{
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({"type":"tts"})
            })

            if(response.ok){
                const data = await response.json()

                if(data["success"]){
                    const voiceSettings = data["data"]
                    const newTTSSettings = new Map(ttsSettings)
                    newTTSSettings.set("volume", voiceSettings["volume"])
                    newTTSSettings.set("semitone", voiceSettings["semitone"])
                    setTTSSettings(newTTSSettings)
                }
            }
                
        }catch(error){
            console.log(error)
        }
    }


    useEffect(()=>{
        getSettings()
    },[])

    return(
        <>
            <div className="flex flex-row item-center justify-center w-full p-5">
                <div className="flex flex-col w-9/10 p-5 bg-gray-200 rounded-xl">
                    <h2 className="text-center text-4xl mb-5">Text to speech</h2>
                    <div className="flex flex-row item-center justify-center w-full">
                        <textarea placeholder="text" onChange={(e)=>{textChange(e.target.value)}} className="p-2 resize-none bg-gray-50 w-1/2 h-50"></textarea> 
                    </div>
                    <h2 className={h2Class}>{maxLen - text.length}</h2>
                    <div className="flex flex-row item-center justify-center w-full">
                        <button onClick={requestTTS} className="bg-slate-400 p-3 rounded-xl mt-5 ml-5">
                            Send
                        </button>
                        <button onClick={stopTTS} className="bg-slate-400 p-3 rounded-xl mt-5 ml-5">
                            Stop
                        </button>
                    </div>
                    <div className="flex flex-row item-center justify-center mt-5 w-full">
                        <h2 className="text-center min-w-20">Volume</h2>
                        <input type="range" value={(ttsSettings.get("volume")?? 1) * 10} min="0" max="10" onChange={ (e)=>{ changeSetting("volume",Number(e.target.value)/10) } } />
                    </div>
                    <div className="flex flex-row item-center justify-center mt-5 w-full">
                        <h2 className="text-center min-w-20">Semitone</h2>
                        <input type="range" value={ttsSettings.get("semitone")} min="-12" max="12" onChange={ (e)=>{ changeSetting("semitone",Number(e.target.value)) } } />
                    </div>
                </div>
            </div>
        </>
    )
}