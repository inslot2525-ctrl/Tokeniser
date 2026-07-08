import {

    BarChart,

    Bar,

    XAxis,

    YAxis,

    Tooltip,

    ResponsiveContainer,

    PieChart,

    Pie,

    Cell,

} from "recharts";

import { useAgentContext } from "../../context/AgentContext";

const COLORS = [

    "#f97316",

    "#2563eb",

];

export default function TokenAnalytics() {

    const { result } = useAgentContext();

    if (!result) return null;

    const tokenData = [
        {
            name: "Original",
            tokens: result.original_prompt.split(/\s+/).length,
        },
        {
            name: "Optimized",
            tokens: result.processed_prompt.split(/\s+/).length,
        },
    ];

    const routeData = [

        {

            name: "Local",

            value:

                result.route === "Local"

                    ? 1

                    : 0,

        },

        {

            name: "Remote",

            value:

                result.route === "Gemini"

                    ? 1

                    : 0,

        },

    ];

    return (

        <div className="grid lg:grid-cols-2 gap-8">

            <div className="rounded-3xl bg-[#101010] border border-white/10 p-6">

                <h2 className="text-2xl font-bold mb-6">

                    Token Comparison

                </h2>

                <ResponsiveContainer

                    width="100%"

                    height={320}

                >

                    <BarChart

                        data={tokenData}

                    >

                        <XAxis

                            dataKey="name"

                        />

                        <YAxis />

                        <Tooltip />

                        <Bar

                            dataKey="tokens"

                            fill="#f97316"

                            radius={[8,8,0,0]}

                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

            <div className="rounded-3xl bg-[#101010] border border-white/10 p-6">

                <h2 className="text-2xl font-bold mb-6">

                    Routing

                </h2>

                <ResponsiveContainer

                    width="100%"

                    height={320}

                >

                    <PieChart>

                        <Pie

                            data={routeData}

                            dataKey="value"

                            outerRadius={100}

                        >

                            {

                                routeData.map(

                                    (

                                        _,

                                        index,

                                    )=>(

                                        <Cell

                                            key={index}

                                            fill={

                                                COLORS[

                                                    index

                                                ]

                                            }

                                        />

                                    )

                                )

                            }

                        </Pie>

                        <Tooltip/>

                    </PieChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}