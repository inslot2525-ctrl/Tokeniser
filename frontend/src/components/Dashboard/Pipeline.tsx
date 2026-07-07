import {
  Brain,
  Sparkles,
  Minimize2,
  Route,
  ShieldCheck,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import { useAgentContext } from "../../context/AgentContext";

const stages = [
  {
    title: "Planner",
    icon: Brain,
  },
  {
    title: "Enhancer",
    icon: Sparkles,
  },
  {
    title: "Optimizer",
    icon: Minimize2,
  },
  {
    title: "Router",
    icon: Route,
  },
  {
    title: "Verifier",
    icon: ShieldCheck,
  },
];

export default function Pipeline() {

  const { result } = useAgentContext();

  const [activeStage, setActiveStage] =
    useState(-1);

  useEffect(() => {

    if (!result) {

      setActiveStage(-1);

      return;

    }

    let current = 0;

    const interval = setInterval(() => {

      setActiveStage(current);

      current++;

      if (current >= stages.length) {

        clearInterval(interval);

      }

    }, 600);

    return () => clearInterval(interval);

  }, [result]);

  return (

    <div className="rounded-3xl bg-[#101010] border border-white/10 p-8">

      <h2 className="text-3xl font-bold mb-10">

        AI Processing Pipeline

      </h2>

      <div className="flex flex-col gap-5">

        {

          stages.map(

            (stage, index) => {

              const Icon = stage.icon;

              const completed =

                activeStage > index;

              const running =

                activeStage === index;

              return (

                <div

                  key={stage.title}

                  className="flex items-center gap-5"

                >

                  <div

                    className={`

                    w-14

                    h-14

                    rounded-full

                    flex

                    items-center

                    justify-center

                    transition-all

                    duration-500

                    ${completed
                        ? "bg-green-500"
                        : running
                          ? "bg-orange-500 animate-pulse"
                          : "bg-gray-800"}

                    `}

                  >

                    {

                      completed

                        ?

                        <CheckCircle2 size={26}/>

                        :

                        running

                          ?

                          <LoaderCircle

                            size={24}

                            className="animate-spin"

                          />

                          :

                          <Icon size={24}/>

                    }

                  </div>

                  <div>

                    <div className="text-xl font-semibold">

                      {stage.title}

                    </div>

                    <div className="text-gray-400">

                      {

                        completed

                          ?

                          "Completed"

                          :

                          running

                            ?

                            "Running..."

                            :

                            "Waiting"

                      }

                    </div>

                  </div>

                </div>

              );

            }

          )

        }

      </div>

    </div>

  );

}