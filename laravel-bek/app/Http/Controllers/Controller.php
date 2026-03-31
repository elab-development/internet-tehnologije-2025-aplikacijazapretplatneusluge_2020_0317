<?php

namespace App\Http\Controllers;
use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    description: "API dokumentacija za platformu za podršku kreatorima",
    title: "Patreon Clone API",
    contact: new OA\Contact(
        name: "API Support",
        url: "https://example.com/support",
        email: "support@example.com"
    )
)]
#[OA\Server(
    url: "http://localhost:8000",
    description: "Local development server"
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "sanctum"
)]
abstract class Controller
{
    //
}
