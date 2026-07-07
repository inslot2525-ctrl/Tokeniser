import { User, Bot, Copy, Check } from "lucide-react";
import { useAgentContext } from "../../context/AgentContext";
import { useState } from "react";

export default function ChatWindow() {

    const { result } = useAgentContext();

    const [copied, setCopied] = useState(false);

    if (!result) return null;

    async function copyResponse() {

        await navigator.clipboard.writeText(

            result.response

        );

        setCopied(true);

        setTimeout(() => setCopied(false), 2000);

    }

    return (

        <div className="rounded-3xl border border-white/10 bg-[#101010] overflow-hidden">

            <div className="border-b border-white/10 px-8 py-5">

                <h2 className="text-2xl font-bold">

                    AI Conversation

                </h2>

            </div>

            <div className="space-y-8 p-8">

                {/* USER */}

                <div className="flex gap-5">

                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">

                        <User size={20}/>

                    </div>

                    <div className="flex-1">

                        <div className="text-sm text-gray-400 mb-2">

                            You

                        </div>

                        <div className="rounded-2xl bg-black border border-white/10 p-5 whitespace-pre-wrap">

                            {result.original_prompt}

                        </div>

                    </div>

                </div>

                {/* AI */}

                <div className="flex gap-5">

                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">

                        <Bot size={20}/>

                    </div>

                    <div className="flex-1">

                        <div className="flex justify-between items-center mb-2">

                            <span className="text-sm text-gray-400">

                                TokenWise AI

                            </span>

                            <button

                                onClick={copyResponse}

                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"

                            >

                                {

                                    copied

                                    ?

                                    <Check size={16}/>

                                    :

                                    <Copy size={16}/>

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

                        <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-blue-500/10 border border-white/10 p-6 whitespace-pre-wrap leading-8">

                            {result.response}

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}