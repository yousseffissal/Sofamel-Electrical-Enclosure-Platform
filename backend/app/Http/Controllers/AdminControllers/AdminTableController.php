<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;
use App\Contracts\FileStorageService;

class AdminTableController extends Controller
{
    public function __construct(
        private readonly FileStorageService $storage
    ) {}

    public function createAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins,email',
            'password' => 'required|string|min:6',
            'level_id' => 'required|exists:levels,id',
            'gender' => 'required|in:male,female',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',

        ]);

        $imageUrl      = null;
        $imagePublicId = null;

        if ($request->hasFile('image')) {
            $uploaded      = $this->storage->upload($request->file('image'), 'admins');
            $imageUrl      = $uploaded['url'];
            $imagePublicId = $uploaded['public_id'];
        }

        $admin = Admin::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'level_id' => $validated['level_id'],
            'gender' => $validated['gender'],
            'pictureURL' => $imageUrl,
            'imagePublicId' => $imagePublicId,
        ]);

        return response()->json([
            'message' => 'Admin created successfully',
            'user' => $admin->only(['id', 'name', 'email', 'pictureURL', 'level_id']),
        ], 200);
    }

    public function updateAdmin(Request $request, Admin $admin)
    {
        $validated = $request->validate([
            'name'     => 'sometimes|required|string|max:255',
            'email'    => 'sometimes|required|string|email|max:255|unique:admins,email,' . $admin->id,
            'password' => 'sometimes|required|string|min:6',
            'level_id' => 'sometimes|required|exists:levels,id',
            'gender'   => 'sometimes|required|in:male,female',
            'image'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        // Never let the raw validated array touch pictureURL directly
        unset($validated['image']);

        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        if ($request->hasFile('image')) {
            if ($admin->imagePublicId) {
                $this->storage->delete($admin->imagePublicId);
            }

            $uploaded = $this->storage->upload($request->file('image'), 'admins');
            $validated['pictureURL']    = $uploaded['url'];
            $validated['imagePublicId'] = $uploaded['public_id'];
        }

        $admin->update($validated);

        return response()->json([
            'message' => 'Admin updated successfully',
            'user'    => $admin->fresh()->only(['id', 'name', 'email', 'pictureURL', 'level_id']),
        ], 200);
    }

    public function deleteAdmin(Request $request)
    {
        $validated = $request->validate([
            'admin_id' => 'required|exists:admins,id',
        ]);

        $admin = Admin::findOrFail($validated['admin_id']);

        if ($admin->imagePublicId) {
            $this->storage->delete($admin->imagePublicId);
        };

        $admin->delete();

        return response()->json([
            'success' => true,
            'message' => 'Admin deleted successfully'
        ]);
    }
}
