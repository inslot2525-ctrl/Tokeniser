import { useState } from "react";

import { runAgent } from "../services/api";

import { AgentResponse } from "../types/api";



export default function useAgent() {

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [data, setData] =

        useState<AgentResponse | null>(null);



    async function execute(prompt: string) {

        try {

            setLoading(true);

            setError("");



            const response = await runAgent(prompt);



            setData(response);



            return response;

        }

        catch (err: any) {

            console.error(err);



            setError(

                err?.response?.data?.detail ||

                "Unable to contact backend."

            );



            return null;

        }

        finally {

            setLoading(false);

        }

    }



    return {

        execute,

        loading,

        error,

        data,

    };

}