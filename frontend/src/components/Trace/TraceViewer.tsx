import {

ChevronDown,

ChevronRight,

CheckCircle2,

Clock,

} from "lucide-react";

import { useState } from "react";

const trace=[

{

title:"Planner",

status:"Completed",

time:"18 ms",

output:"Enhance ✓ Compress ✓ Optimize ✓",

},

{

title:"Enhancer",

status:"Completed",

time:"34 ms",

output:"Grammar Improved",

},

{

title:"Compressor",

status:"Completed",

time:"16 ms",

output:"12 Tokens Removed",

},

{

title:"Smart Optimizer",

status:"Completed",

time:"123 ms",

output:"Prompt Optimized",

},

{

title:"Risk Detector",

status:"Safe",

time:"4 ms",

output:"No Jailbreak Found",

},

{

title:"Router",

status:"Gemini Flash",

time:"1 ms",

output:"Remote Route",

},

{

title:"Verifier",

status:"Passed",

time:"42 ms",

output:"Score 9.7",

}

];

export default function TraceViewer(){

const[open,setOpen]=useState<number|null>(0);

return(

<div className="rounded-3xl bg-[#101010] border border-white/10 p-8">

<h2 className="text-2xl font-bold mb-8">

Agent Trace

</h2>

<div className="space-y-4">

{

trace.map((step,index)=>(

<div

key={index}

className="rounded-2xl bg-[#171717]"

>

<button

onClick={()=>

setOpen(

open===index?null:index

)

}

className="flex w-full items-center justify-between p-5"

>

<div className="flex items-center gap-4">

<CheckCircle2

className="text-green-400"

/>

<div>

<div className="font-semibold">

{step.title}

</div>

<div className="text-gray-500 text-sm">

{step.status}

</div>

</div>

</div>

<div className="flex items-center gap-4">

<div className="flex items-center gap-2 text-sm text-gray-400">

<Clock size={14}/>

{step.time}

</div>

{

open===index?

<ChevronDown/>:

<ChevronRight/>

}

</div>

</button>

{

open===index&&(

<div className="border-t border-white/10 p-5">

<pre className="text-sm whitespace-pre-wrap text-orange-300">

{step.output}

</pre>

</div>

)

}

</div>

))

}

</div>

</div>

);

}