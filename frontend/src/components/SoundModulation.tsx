import { useState, useRef, useEffect } from "react";


type modulationType = "sine" |  "triangular"


export function SoundModulation(){

    const [freqData, setFreqData] = useState(new Map<modulationType, number>()
        .set("sine", 1)
        .set("triangular", 1)
    )
    const [activeMod, setActiveMod] = useState(new Map<modulationType, boolean>()
        .set("sine", false)
        .set("triangular", false)
    )

    const dataChangeCheck = useRef<ReturnType<typeof setTimeout>>(null);

    async function changeFrequencyRequest(freqType: modulationType, value:number) {
        try{
            const response = await fetch("/api/change_freq",{
                method: "post",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({"mod_type":freqType, "value":value})
            })
            if(response.ok){
                const data = await response.json()
                console.log(data)
            }
        }catch(error){
            console.log(error)
        }
    }

    function sliderChange(freqType: modulationType, value: number){
        if(dataChangeCheck.current){
            clearTimeout(dataChangeCheck.current)
        }

        const newFreqData = new Map(freqData)
        newFreqData.set(freqType, value)
        const curData = value

        dataChangeCheck.current = setTimeout(()=>{
            if(curData == newFreqData.get(freqType)){
                changeFrequencyRequest(freqType, value)
                setFreqData(new Map(newFreqData))
            }
        },50)
    }

    async function toggleModulation(modType: modulationType, value: boolean){

        const newActiveMod = new Map(activeMod)
        newActiveMod.set(modType, value)
        setActiveMod(newActiveMod)

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
                body: JSON.stringify({"type":"modulation"})
            })

            if(response.ok){
                const data = await response.json()
                if(data["success"]){
                    const sineData = data["data"]["sine"]
                    const triangularData = data["data"]["triangular"]

                    const newActiveMod = new Map(activeMod)
                    newActiveMod.set("sine", sineData["active"])
                    newActiveMod.set("triangular", triangularData["active"])
                    setActiveMod(newActiveMod)

                    const newFreqData = new Map(freqData)
                    newFreqData.set("sine", sineData["frequency"])
                    newFreqData.set("triangular", triangularData["frequency"])
                    setFreqData(newFreqData)
                }
            }
        }catch(error){
            console.log(error)
        }
    }

    useEffect(()=>{
        getSettings()
    },[])

    return (
        <>
            <div className="flex flex-row item-center justify-around w-full p-5 max-sm:flex-col">
                <div className="flex flex-col item-center justify-center bg-gray-200 p-5 rounded-xl">
                    <h2 className="text-center text-4xl mb-5">Audio Mod (Frequecy)</h2>
                    <div className="flex flex-row item-center justify-around m-2">
                        <h2 className="text-center min-w-20">Sine</h2>
                        <input type="range" min="1" max="5" value={freqData.get("sine")} onChange={(e) => { sliderChange("sine", Number(e.target.value)) }} className="slider" />
                        <input type="checkbox" checked={activeMod.get("sine")} onChange={(e) => { toggleModulation("sine", e.target.checked) }} />
                    </div>
                    <div className="flex flex-row item-center justify-around m-2">
                        <h2 className="text-center min-w-20">Triangular</h2>
                        <input type="range" min="1" max="5" value={freqData.get("triangular")} onChange={(e) => { sliderChange("triangular", Number(e.target.value)) }} className="slider" />
                        <input type="checkbox" checked={activeMod.get("triangular")} onChange={(e) => { toggleModulation("triangular", e.target.checked) }} />
                    </div>
                </div>
            </div>
        </>
    )
}