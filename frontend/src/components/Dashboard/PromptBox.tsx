import { useState } from "react";

import AnimatedButton from "../Layout/AnimatedButton";

export default function PromptBox(){

const [prompt,setPrompt]=useState("");

return(

<div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">

<h2 className="mb-6 text-xl font-semibold text-white">

Prompt

</h2>

<textarea

value={prompt}

onChange={(e)=>setPrompt(e.target.value)}

placeholder="Describe your task..."

className="h-60 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-5 text-white outline-none"

/>

<div className="mt-6 flex justify-end">

<AnimatedButton

text="Optimize & Execute"

/>

</div>

</div>

)

}