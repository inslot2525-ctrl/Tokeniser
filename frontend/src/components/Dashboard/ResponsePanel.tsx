import {
    Copy,
    CheckCircle,
    Cpu,
    Route,
    DollarSign,
    Brain,
} from "lucide-react";

import { useState } from "react";

import { useAgentContext } from "../../context/AgentContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export default function ResponsePanel() {

    const { result } = useAgentContext();

    const [copied, setCopied] = useState(false);

    if (!result) {

        return (

            <div className="rounded-3xl border border-white/10 bg-[#101010] p-12 text-center">

                <Brain
                    size={60}
                    className="mx-auto text-gray-600"
                />

                <h2 className="text-2xl font-semibold mt-6">

                    AI Response

                </h2>

                <p className="text-gray-500 mt-3">

                    Optimize a prompt to view the result.

                </p>

            </div>

        );

    }

    async function copyText() {
        if (!result) return;
        await navigator.clipboard.writeText(result.response);

        setCopied(true);

        setTimeout(() => {

            setCopied(false);

        }, 2000);

    }

    return (

        <div className="rounded-3xl bg-[#101010] border border-white/10 p-8">

            <div className="flex justify-between items-center">

                <h2 className="text-3xl font-bold">

                    AI Response

                </h2>

                <button

                    onClick={copyText}

                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600"

                >

                    {

                        copied

                            ?

                            <CheckCircle size={18}/>

                            :

                            <Copy size={18}/>

                    }

                    {

                        copied

                            ?

                            "Copied"

                            :

                            "Copy"

                    }

                </button>

            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-8">

                <InfoCard

                    title="Model"

                    value={result.model}

                    icon={<Cpu size={18}/>}

                />

                <InfoCard

                    title="Route"

                    value={result.route}

                    icon={<Route size={18}/>}

                />

                <InfoCard

                    title="Confidence"

                    value={`${result.confidence}%`}

                    icon={<Brain size={18}/>}

                />

                <InfoCard

                    title="Estimated Cost"

                    value={result.estimated_remote_cost}

                    icon={<DollarSign size={18}/>}

                />

            </div>

            <Section

                title="Planner Reason"

                value={result.planner_reason}

            />

            <Section

                title="Optimized Prompt"

                value={result.processed_prompt}

            />

            <Section

                title="Final Response"

                value={result.response}

            />

            <div className="mt-8">

                <h3 className="text-xl font-semibold mb-4">

                    Processing Steps

                </h3>

                <div className="flex flex-wrap gap-3">

                    {

                        result.steps.map(
                            (step: string, index: number) => (

                                <div

                                    key={index}

                                    className="rounded-full px-4 py-2 bg-orange-500/20 border border-orange-500/40"

                                >

                                    ✓ {step}

                                </div>

                            )

                        )

                    }

                </div>

            </div>

        </div>

    );

}



function Section({

    title,

    value,

}:{

    title:string;

    value:string;

}){

    return(

        <div className="mt-8">

            <h3 className="font-semibold text-xl mb-3">

                {title}

            </h3>

            <div className="rounded-2xl bg-black border border-white/10 p-5 whitespace-pre-wrap leading-8">

                {value}

            </div>

        </div>

    );

}



function InfoCard({

    title,

    value,

    icon,

}:{

    title:string;

    value:string;

    icon:any;

}){

    return(

        <div className="rounded-2xl border border-white/10 bg-black p-5">

            <div className="flex items-center gap-2 text-gray-400">

                {icon}

                {title}

            </div>

            <div className="text-2xl font-bold mt-4">

                {value}

            </div>

        </div>

    );

}