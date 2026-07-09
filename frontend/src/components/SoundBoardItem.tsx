



export function SoundBoardItem({ name }: { name: string }){

    async function requestSound(name: string) {
        try{
            const response = await fetch("/api/play_audio",{
                method:"post",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({"value":name})
            })
            if(response.ok){
                const data = await response.json()
                console.log(data)
            }
        }catch(error){
            console.log(error)
        }
    }

    return(
        <>
            <div className="flex item-center justify-center">
                <button onClick={() => {requestSound(name)}} className="bg-slate-300 p-3 rounded-xl min-w-20 max-w-40">
                    {name}
                </button>
            </div>
        </>
    )
}