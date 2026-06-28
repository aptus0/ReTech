<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;

class CalendarEventController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start' => 'required|date',
            'end' => 'required|date',
            'all_day' => 'boolean',
            'color' => 'nullable|string',
        ]);

        CalendarEvent::create($validated + ['user_id' => auth()->id()]);

        return redirect()->back()->with('success', 'Not eklendi.');
    }

    public function destroy(CalendarEvent $calendarEvent)
    {
        if ($calendarEvent->user_id === auth()->id()) {
            $calendarEvent->delete();
        }

        return redirect()->back()->with('success', 'Not silindi.');
    }
}
