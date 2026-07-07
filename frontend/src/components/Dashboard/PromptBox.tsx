import { useState } from "react";

import useAgent from "../../hooks/useAgent";

import { useAgentContext } from "../../context/AgentContext";

export default function PromptBox() {

    const [prompt, setPrompt] =
        useState("");

    const {

        execute,

        loading,

        error,

    } = useAgent();

    const {

        setResult,

    } = useAgentContext();

    async function handleSubmit() {

        if (!prompt.trim()) return;

        const response =
            await execute(prompt);

        if (response) {

            setResult(response);

        }

    }

    return (

        <div className="rounded-3xl border border-white/10 bg-[#101010] p-8">

            <h2 className="text-3xl font-bold mb-6">

                AI Prompt Optimizer

            </h2>

            <textarea

                value={prompt}

                onChange={(e) =>
                    setPrompt(e.target.value)
                }

                placeholder="Enter your prompt..."

                className="w-full h-56 resize-none rounded-2xl bg-black border border-white/10 p-5 text-white outline-none focus:border-orange-400"

            />

            <div className="flex justify-between items-center mt-5">

                <div className="text-gray-400">

                    Characters

                    {" "}

                    {prompt.length}

                </div>

                <div className="flex gap-3">

                    <button

                        onClick={() =>
                            setPrompt("")
                        }

                        className="px-5 py-3 rounded-xl border border-white/10 hover:bg-white/5"

                    >

                        Clear

                    </button>

                    <button

                        disabled={loading}

                        onClick={handleSubmit}

                        className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50"

                    >

                        {

                            loading

                                ? "Processing..."

                                : "Optimize"

                        }

                    </button>

                </div>

            </div>

            {

                error && (

                    <div className="text-red-400 mt-5">

                        {error}

                    </div>

                )

            }

        </div>

    );

}