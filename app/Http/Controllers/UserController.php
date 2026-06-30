<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->paginate(10);

        return inertia('settings/users/index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return inertia('settings/users/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'store_code' => 'required|string|max:255',
            'personnel_no' => 'required|string|max:255|unique:users',
            'role' => 'required|in:admin,manager,sales_consultant,warehouse,personnel',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $validated['password'] = bcrypt($validated['password']);

        User::create($validated);

        return redirect()->route('settings.users.index')->with('success', 'Kullanıcı başarıyla oluşturuldu.');
    }

    public function edit(User $user)
    {
        return inertia('settings/users/edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'store_code' => 'required|string|max:255',
            'personnel_no' => 'required|string|max:255|unique:users,personnel_no,'.$user->id,
            'role' => 'required|in:admin,manager,sales_consultant,warehouse,personnel',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('settings.users.index')->with('success', 'Kullanıcı başarıyla güncellendi.');
    }

    public function destroy(User $user)
    {
        if ($user->role === 'admin' && $user->email === 're@tech.com') {
            return redirect()->back()->with('error', 'Sistem yöneticisi silinemez.');
        }

        $user->delete();

        return redirect()->route('settings.users.index')->with('success', 'Kullanıcı başarıyla silindi.');
    }
}
