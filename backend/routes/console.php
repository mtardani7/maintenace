<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\GenerateMonthlyMaintenanceReport;

Schedule::job(new GenerateMonthlyMaintenanceReport)
    ->monthlyOn(1, '00:05')
    ->withoutOverlapping();

Artisan::command('maintenance:monthly-report {--month= : Month to report in YYYY-MM format}', function (): void {
    GenerateMonthlyMaintenanceReport::dispatch($this->option('month') ?: null);
    $this->info('Monthly maintenance report queued.');
})->purpose('Queue the previous month maintenance report email');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
