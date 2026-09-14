<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $demoPassword = 'Pilot2026!';
        $demoUsers = [
            ['name' => 'Demo Operator', 'email' => 'operator.demo@example.com', 'role' => 'operator'],
            ['name' => 'Demo Technician', 'email' => 'technician.demo@example.com', 'role' => 'technician'],
            ['name' => 'Demo Supervisor', 'email' => 'supervisor.demo@example.com', 'role' => 'supervisor'],
            ['name' => 'Demo QA', 'email' => 'qa.demo@example.com', 'role' => 'qa'],
            ['name' => 'Demo Admin', 'email' => 'admin.demo@example.com', 'role' => 'admin'],
        ];

        foreach ($demoUsers as $demoUser) {
            User::updateOrCreate(
                ['email' => $demoUser['email']],
                [...$demoUser, 'password' => $demoPassword],
            );
        }
    }
}
