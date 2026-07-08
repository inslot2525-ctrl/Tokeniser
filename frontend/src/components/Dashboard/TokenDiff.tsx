import { diffWords } from "diff";

import { useAgentContext } from "../../context/AgentContext";

export default function TokenDiff() {

    const { result } = useAgentContext();

    if (!result) return null;

    const changes = diffWords(

        result.original_prompt,

        result.processed_prompt

    );

    return (

        <div className="rounded-3xl border border-white/10 bg-[#101010] p-8">

            <h2 className="text-2xl font-bold mb-8">

                Prompt Diff

            </h2>

            <div className="leading-9 text-lg">

                {

                    changes.map((part,index)=>{

                        if(part.added){

                            return(

                                <span

                                    key={index}

                                    className="bg-green-500/20 text-green-400 px-1 rounded"

                                >

                                    {part.value}

                                </span>

                            )

                        }

                        if(part.removed){

                            return(

                                <span

                                    key={index}

                                    className="bg-red-500/20 text-red-400 line-through px-1 rounded"

                                >

                                    {part.value}

                                </span>

                            )

                        }

                        return(

                            <span

                                key={index}

                                className="text-gray-300"

                            >

                                {part.value}

                            </span>

                        )

                    })

                }

            </div>

        </div>

    );

}