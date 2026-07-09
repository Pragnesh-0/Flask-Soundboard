import { SoundSettings } from "./components/SoundSettings"
import { SoundBoard } from "./components/SoundBoard"
import { TTSSection } from "./components/TTSSection"
import { SoundModulation } from "./components/SoundModulation"
import { PollServer } from "./components/PollServer"

export function App() {
  
  return (
    <>
      <PollServer />
      <SoundSettings />
      <SoundModulation />
      <SoundBoard />
      <TTSSection />
    </>
  )
}
