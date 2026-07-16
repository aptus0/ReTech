<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MarketplaceReturnController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $returns = \App\Models\MarketplaceReturn::with(['marketplaceOrder', 'marketplaceAccount.marketplace'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return inertia('Marketplace/Returns', ['returns' => $returns]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
