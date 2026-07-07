import axios from "axios";

const api = axios.create({

    baseURL: "http://127.0.0.1:8000",

    headers: {

        "Content-Type": "application/json",

    },

});

export default api;



export async function runAgent(prompt: string) {

    const response = await api.post(

        "/agent",

        {

            prompt,

        }

    );

    return response.data;

}



export async function tokenize(prompt: string) {

    const response = await api.post(

        "/tokenize",

        {

            prompt,

        }

    );

    return response.data;

}



export async function optimize(prompt: string) {

    const response = await api.post(

        "/optimize",

        {

            prompt,

        }

    );

    return response.data;

}



export async function enhance(prompt: string) {

    const response = await api.post(

        "/enhance",

        {

            prompt,

        }

    );

    return response.data;

}



export async function compress(prompt: string) {

    const response = await api.post(

        "/compress",

        {

            prompt,

        }

    );

    return response.data;

}



export async function smartOptimize(prompt: string) {

    const response = await api.post(

        "/smart-optimize",

        {

            prompt,

        }

    );

    return response.data;

}



export async function detectRisk(prompt: string) {

    const response = await api.post(

        "/detect-risk",

        {

            prompt,

        }

    );

    return response.data;

}



export async function route(prompt: string) {

    const response = await api.post(

        "/route",

        {

            prompt,

        }

    );

    return response.data;

}