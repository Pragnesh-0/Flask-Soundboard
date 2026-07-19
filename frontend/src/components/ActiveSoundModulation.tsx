


import { useState, useRef, useEffect } from "react";


type modulationType = "rebound";

export function ActiveSoundModulation(){
    
    const [sliderValue, setSliderValue] = useState(new Map<modulationType, number>()
        .set("rebound", 0.1)
    )

    const [modValue, setModValue] = useState(new Map<modulationType, boolean>()
        .set("rebound", false)
    )

    const dataChangeCheck = useRef<ReturnType<typeof setTimeout>>(null);

    async function changeValueRequest(modType: modulationType, value:number) {
        try{
            const response = await fetch("/api/change_mod_val",{
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({"mod_type":modType, "value":value})
            })
            if(response.ok){
                const data = await response.json()
                console.log(data)
            }
        }catch(error){
            console.log(error)
        }
    }

    async function sliderChange(mod: modulationType, value: number){
        if(dataChangeCheck.current){
            clearTimeout(dataChangeCheck.current)
        }

        const newSliderData = new Map(sliderValue)
        newSliderData.set(mod, value)
        const curData = value

        dataChangeCheck.current = setTimeout(()=>{
            if(curData == newSliderData.get(mod)){
                changeValueRequest(mod, value)
                setSliderValue(new Map(newSliderData))
            }
        },50)
    } 

    async function toggleModulation(modType: modulationType, value: boolean){

        const newActiveMod = new Map(modValue)
        newActiveMod.set(modType, value)
        setModValue(newActiveMod)

        try{
            const response = await fetch("/api/toggle_mod",{
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({"mod_type":modType, "value":value})
            })

            if(response.ok){
                const data = await response.json()
                console.log(data)
            }

        }catch(error){
            console.log(error)
        }
    }

    async function getSettings(){
        try{
            const response = await fetch("/api/get_settings",{
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({"type":"active_modulation"})
            })

            if(response.ok){
                const data = await response.json()
                if(data["success"]){
                    const reboundData = data["data"]["rebound"]

                    const newActiveMod = new Map(modValue)
                    newActiveMod.set("rebound", reboundData["active"])

                    const newValueData = new Map(sliderValue)
                    newValueData.set("rebound", reboundData["decay"])
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
                    <h2 className="text-center text-4xl mb-5">Active Audio Mod</h2>
                    <div className="flex flex-row item-center justify-around m-2">
                        <h2 className="text-center min-w-20">Rebound</h2>
                        <input type="range" min="1" max="9" value={(sliderValue.get("rebound")??0.1) * 10} onChange={(e) => { sliderChange("rebound", Number(e.target.value)/10) }} className="slider" />
                        <input type="checkbox" checked={modValue.get("rebound")} onChange={(e) => { toggleModulation("rebound", e.target.checked) }} />
                    </div>
                </div>
            </div>
        </>
    )
}