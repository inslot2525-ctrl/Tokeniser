import {
    CheckCircle2,
    Sparkles,
    BrainCircuit,
    Route,
    ShieldCheck,
} from "lucide-react";

import { motion } from "framer-motion";

import { useAgentContext } from "../../context/AgentContext";

export default function ExecutionTimeline() {

    const { result } = useAgentContext();

    if (!result) return null;

    const timeline = [

        {
            title: "Planner",
            subtitle: result.planner_reason,
            icon: <BrainCircuit size={18}/>,
            color: "bg-blue-500",
        },

        ...(result.steps || []).map((step: string) => ({
            title: step,
            subtitle: "Completed",
            icon: <Sparkles size={18}/>,
            color: "bg-orange-500",
        })),

        {
            title: "Routing",
            subtitle: `${result.route} • ${result.model}`,
            icon: <Route size={18}/>,
            color: "bg-green-500",
        },

        {
            title: "Verification",
            subtitle: `${result.confidence}% confidence`,
            icon: <ShieldCheck size={18}/>,
            color: "bg-purple-500",
        }

    ];

    return (

        <div className="rounded-3xl border border-white/10 bg-[#101010] p-8">

            <h2 className="text-2xl font-bold mb-8">

                Agent Execution Timeline

            </h2>

            <div className="space-y-8">

                {

                    timeline.map((item,index)=>(

                        <motion.div

                            key={index}

                            initial={{

                                opacity:0,

                                x:-30

                            }}

                            whileInView={{

                                opacity:1,

                                x:0

                            }}

                            transition={{

                                delay:index*0.15

                            }}

                            className="flex gap-5"

                        >

                            <div className={`

                                w-12

                                h-12

                                rounded-full

                                flex

                                items-center

                                justify-center

                                ${item.color}

                            `}>

                                {item.icon}

                            </div>

                            <div className="flex-1">

                                <div className="flex justify-between">

                                    <h3 className="font-semibold">

                                        {item.title}

                                    </h3>

                                    <CheckCircle2

                                        size={18}

                                        className="text-green-400"

                                    />

                                </div>

                                <p className="text-gray-400 mt-1">

                                    {item.subtitle}

                                </p>

                            </div>

                        </motion.div>

                    ))

                }

            </div>

        </div>

    );

}