from datetime import datetime

metrics = []


def log_request(
    prompt,
    route,
    difficulty,
    original_tokens,
    optimized_tokens,
    verification_score,
    estimated_cost,
):

    metrics.append({

        "timestamp":
            datetime.now().strftime(
                "%H:%M:%S"
            ),

        "route":
            route,

        "difficulty":
            difficulty,

        "original_tokens":
            original_tokens,

        "optimized_tokens":
            optimized_tokens,

        "tokens_saved":
            original_tokens
            - optimized_tokens,

        "verification_score":
            verification_score,

        "estimated_cost":
            estimated_cost,
    })


def get_dashboard():

    if len(metrics) == 0:

        return {
            "requests": 0
        }

    total_saved = sum(
        m["tokens_saved"]
        for m in metrics
    )

    total_cost = 0

    for m in metrics:

        try:

            total_cost += float(
                str(
                    m["estimated_cost"]
                ).replace("$", "")
            )

        except:

            pass

    local = sum(
        1
        for m in metrics
        if m["route"] == "Local"
    )

    remote = len(metrics) - local

    avg_score = round(

        sum(
            m["verification_score"]
            for m in metrics
        )

        / len(metrics),

        2,
    )

    return {

        "requests":
            len(metrics),

        "local_routes":
            local,

        "remote_routes":
            remote,

        "local_percentage":
            round(
                local
                / len(metrics)
                * 100,
                2,
            ),

        "tokens_saved":
            total_saved,

        "estimated_remote_cost":
            round(
                total_cost,
                5,
            ),

        "average_verification":
            avg_score,

        "history":
            metrics[-20:],
    }