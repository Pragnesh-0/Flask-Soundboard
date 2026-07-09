import { useState, useRef, useEffect } from "react"

type OutputSettings = "volume" | "semitone"



export function SoundSettings(){

    const dataChangeCheck = useRef<ReturnType<typeof setTimeout>>(null);
    
    const [userSettings, setUserSettings] = useState<Map<OutputSettings, number>>(
        new Map<OutputSettings, number>()
        .set("volume", 1*10)
        .set("semitone", 0)
    )

    async function changeSettingsRequest(userSetting: OutputSettings, value: number){
        try{
            const response = await fetch("/api/set_settings",{
                method:"post",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({"setting":userSetting, "value":value})
            })
            if(response.ok){
                const data = await response.json()
                console.log(data)
            }
                
        }catch(error){
            console.log(error)
        }
    }

    function sliderChange(userSetting: OutputSettings, value: number){
        if(dataChangeCheck.current){
            clearTimeout(dataChangeCheck.current)
        }

        const newUserSettings = new Map(userSettings)
        newUserSettings.set(userSetting, value)
        const curData = value

        dataChangeCheck.current = setTimeout(()=>{
            if(curData == newUserSettings.get(userSetting)){
                changeSettingsRequest(userSetting, value)
                setUserSettings(new Map(newUserSettings))
            }
        },50)
    }

    async function getSettings(){
        try{
            const response = await fetch("/api/get_settings",{
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({"type":"voice"})
            })
            
            if(response.ok){
                const data = await response.json()

                if(data["success"]){
                    const voiceSettings = data["data"]
                    const newUserSettings = new Map(userSettings)
                    newUserSettings.set("volume",  voiceSettings["volume"])
                    newUserSettings.set("semitone", voiceSettings["semitone"])
                    setUserSettings(newUserSettings)
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
            <div className="flex flex-row item-center justify-around w-full p-5 max-sm:flex-col">
                <div className="flex flex-col item-center justify-center bg-gray-200 p-5 rounded-xl">
                    <h2 className="text-center text-4xl mb-5">Voice Settings</h2>
                    <div className="flex flex-row item-center justify-between m-2">
                        <h2 className="text-center min-w-40">Volume</h2>
                        <input type="range" min="0" max="10" value={(userSettings.get("volume")?? 1) * 10} onChange={(e) => { sliderChange("volume", Number(e.target.value)/10) }} className="slider" />
                    </div>
                    <div className="flex flex-row item-center justify-between m-2">
                        <h2 className="text-center min-w-40">Semitone</h2>
                        <input type="range" min="-12" max="12" value={userSettings.get("semitone")} onChange={(e) => { sliderChange("semitone", Number(e.target.value)) }} className="slider" />
                    </div>
                </div>
            </div>
        </>
    )
}