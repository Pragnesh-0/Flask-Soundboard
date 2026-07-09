import { SoundSettings } from "./components/SoundSettings"
import { SoundBoard } from "./components/SoundBoard"
import { TTSSection } from "./components/TTSSection"
import { SoundModulation } from "./components/SoundModulation"
import { PollServer } from "./components/PollServer"
import { TestAudio } from "./components/TestAudio"

export function App() {
  
  return (
    <>
      <PollServer />
      <TestAudio />
      <SoundSettings />
      <SoundModulation />
      <SoundBoard />
      <TTSSection />
    </>
  )
}
