<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function csrfCookie(Request $request): Response
    {
        return response()->noContent()->withCookie(cookie(
            'XSRF-TOKEN',
            $request->session()->token(),
            120,
            '/',
            null,
            (bool) config('session.secure'),
            false,
            false,
            config('session.same_site', 'lax'),
        ));
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid email or password.'], 422);
        }

        $request->session()->regenerate();

        return response()->json($request->user());
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(null, 204);
    }
}
