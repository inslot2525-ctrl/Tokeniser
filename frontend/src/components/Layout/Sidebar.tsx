import {

    LayoutDashboard,

    Brain,

    BarChart3,

    ShieldCheck,

    History,

    Settings,

    Sparkles,

} from "lucide-react";

const items = [

    {

        icon: LayoutDashboard,

        title: "Dashboard",

    },

    {

        icon: Brain,

        title: "AI Optimizer",

    },

    {

        icon: BarChart3,

        title: "Analytics",

    },

    {

        icon: History,

        title: "History",

    },

    {

        icon: ShieldCheck,

        title: "Security",

    },

    {

        icon: Sparkles,

        title: "Agent",

    },

    {

        icon: Settings,

        title: "Settings",

    },

];

export default function Sidebar() {

    return (

        <aside className="w-72 bg-[#090909] border-r border-white/10 flex flex-col">

            <div className="px-8 py-8">

                <h1 className="text-3xl font-bold">

                    TokenWise

                </h1>

                <p className="text-gray-500 text-sm mt-2">

                    AI Prompt Intelligence

                </p>

            </div>

            <nav className="flex-1 px-4">

                {

                    items.map((item,index)=>{

                        const Icon=item.icon;

                        return(

                            <button

                                key={index}

                                className="w-full flex items-center gap-4 rounded-xl px-5 py-4 mb-3 text-gray-400 hover:bg-orange-500 hover:text-white transition"

                            >

                                <Icon size={20}/>

                                {item.title}

                            </button>

                        );

                    })

                }

            </nav>

            <div className="p-6 border-t border-white/10">

                <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-5">

                    <h3 className="font-bold">

                        Token Saved

                    </h3>

                    <div className="text-4xl font-bold mt-3">

                        18.2K

                    </div>

                    <p className="text-sm mt-2">

                        Total optimization

                    </p>

                </div>

            </div>

        </aside>

    );

}