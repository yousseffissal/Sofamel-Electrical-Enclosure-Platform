<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;

class SystemHealthService
{
    /* ============================================================
     *  PUBLIC ENTRY POINT
     *  All metrics are cached individually so a slow metric
     *  never blocks the others.
     * ============================================================ */
    public function getAll(): array
    {
        return [
            'api'      => $this->apiStatus(),
            'database' => $this->databaseStatus(),
            'storage'  => $this->storageUsage(),
            'queue'    => $this->queueLoad(),
            'memory'   => $this->memoryUsage(),
            'cpu'      => $this->cpuLoad(),
            'uptime'   => $this->serverUptime(),
            'cache'    => $this->cacheHealth(),
        ];
    }

    /* ============================================================
     *  1. API STATUS  — TTL 10s
     * ============================================================ */
    private function apiStatus(): array
    {
        return Cache::remember('health:api', 10, function () {
            $start = hrtime(true);

            // A trivial SELECT 1 doubles as a lightweight round-trip
            // proxy for "is the app layer responding?"
            try {
                DB::select('SELECT 1');
                $latency = (int) round((hrtime(true) - $start) / 1_000_000); // ns → ms

                $status = match (true) {
                    $latency < 80  => 'Online',
                    $latency < 300 => 'Slow',
                    default        => 'Degraded',
                };

                return [
                    'status'      => $status,
                    'latency_ms'  => $latency,
                    'health_pct'  => min(100, max(0, 100 - $latency / 5)),
                ];
            } catch (\Throwable) {
                return ['status' => 'Offline', 'latency_ms' => null, 'health_pct' => 0];
            }
        });
    }

    /* ============================================================
     *  2. DATABASE STATUS  — TTL 15s
     * ============================================================ */
    private function databaseStatus(): array
    {
        return Cache::remember('health:database', 15, function () {
            try {
                $start = hrtime(true);
                DB::select('SELECT 1');
                $latency = (int) round((hrtime(true) - $start) / 1_000_000);

                $status = match (true) {
                    $latency < 50  => 'Healthy',
                    $latency < 200 => 'Slow',
                    default        => 'Degraded',
                };

                // Lightweight: fetch only the global status variable
                $dbStatus = DB::select("SHOW GLOBAL STATUS LIKE 'Threads_connected'");
                $connections = (int) ($dbStatus[0]->Value ?? 0);

                return [
                    'status'      => $status,
                    'latency_ms'  => $latency,
                    'connections' => $connections,
                    'health_pct'  => min(100, max(0, 100 - $latency / 3)),
                ];
            } catch (\Throwable) {
                return [
                    'status'      => 'Unreachable',
                    'latency_ms'  => null,
                    'connections' => null,
                    'health_pct'  => 0,
                ];
            }
        });
    }

    /* ============================================================
     *  3. STORAGE USAGE  — TTL 60s  (disk_free_space is cheap)
     * ============================================================ */
    private function storageUsage(): array
    {
        return Cache::remember('health:storage', 60, function () {
            try {
                $path  = storage_path();
                $free  = disk_free_space($path);
                $total = disk_total_space($path);

                if (!$free || !$total) {
                    throw new \RuntimeException('disk_* functions unavailable');
                }

                $used    = $total - $free;
                $usedPct = round(($used / $total) * 100, 1);

                $status = match (true) {
                    $usedPct < 70  => 'Healthy',
                    $usedPct < 85  => 'Warning',
                    default        => 'Critical',
                };

                return [
                    'status'      => $status,
                    'used_pct'    => $usedPct,
                    'used_gb'     => round($used / 1_073_741_824, 2),
                    'total_gb'    => round($total / 1_073_741_824, 2),
                    'free_gb'     => round($free / 1_073_741_824, 2),
                    'health_pct'  => round(100 - $usedPct, 1),
                ];
            } catch (\Throwable) {
                return [
                    'status'     => 'Unknown',
                    'used_pct'   => null,
                    'used_gb'    => null,
                    'total_gb'   => null,
                    'free_gb'    => null,
                    'health_pct' => null,
                ];
            }
        });
    }

    /* ============================================================
     *  4. QUEUE LOAD  — TTL 10s
     *     Works for both "database" and "redis" drivers.
     * ============================================================ */
    private function queueLoad(): array
    {
        return Cache::remember('health:queue', 10, function () {
            try {
                $driver = config('queue.default');

                if ($driver === 'database') {
                    // One cheap COUNT query — no table scan on indexed columns
                    $pending = DB::table('jobs')->count();
                    $failed  = DB::table('failed_jobs')->count();
                } elseif ($driver === 'redis') {
                    $redis   = app('redis')->connection();
                    $pending = (int) $redis->llen('queues:default');
                    $failed  = 0;
                } else {
                    // sync / null driver — nothing to measure
                    $pending = 0;
                    $failed  = 0;
                }

                // Soft thresholds: 0-10 = light, 11-50 = medium, 51+ = heavy
                $loadPct = min(100, (int) round($pending / 50 * 100));
                $status  = match (true) {
                    $pending <= 10 => 'Light',
                    $pending <= 50 => 'Medium',
                    default        => 'Heavy',
                };

                return [
                    'status'       => $status,
                    'pending_jobs' => $pending,
                    'failed_jobs'  => $failed,
                    'load_pct'     => $loadPct,
                    'health_pct'   => max(0, 100 - $loadPct),
                    'driver'       => $driver,
                ];
            } catch (\Throwable) {
                return [
                    'status'       => 'Unknown',
                    'pending_jobs' => null,
                    'failed_jobs'  => null,
                    'load_pct'     => null,
                    'health_pct'   => null,
                    'driver'       => config('queue.default'),
                ];
            }
        });
    }

    /* ============================================================
     *  5. MEMORY USAGE  — TTL 10s  (memory_get_usage is instant)
     * ============================================================ */
    private function memoryUsage(): array
    {
        return Cache::remember('health:memory', 10, function () {
            try {

                if (!is_readable('/proc/meminfo')) {
                    throw new \RuntimeException('/proc/meminfo unavailable');
                }

                $data = file('/proc/meminfo');

                $memInfo = [];

                foreach ($data as $line) {
                    [$key, $value] = explode(':', $line);
                    $memInfo[$key] = trim($value);
                }

                $totalKb = (int) filter_var($memInfo['MemTotal'], FILTER_SANITIZE_NUMBER_INT);
                $freeKb  = (int) filter_var($memInfo['MemAvailable'], FILTER_SANITIZE_NUMBER_INT);

                $usedKb = $totalKb - $freeKb;

                $totalMb = round($totalKb / 1024, 1);
                $usedMb  = round($usedKb / 1024, 1);
                $freeMb  = round($freeKb / 1024, 1);

                $usedPct = round(($usedKb / $totalKb) * 100, 1);

                $status = match (true) {
                    $usedPct < 60 => 'Healthy',
                    $usedPct < 80 => 'Warning',
                    default       => 'Critical',
                };

                return [
                    'status'      => $status,
                    'used_mb'     => $usedMb,
                    'free_mb'     => $freeMb,
                    'total_mb'    => $totalMb,
                    'used_pct'    => $usedPct,
                    'health_pct'  => round(100 - $usedPct, 1),
                ];
            } catch (\Throwable) {

                return [
                    'status'     => 'Unknown',
                    'used_mb'    => null,
                    'free_mb'    => null,
                    'total_mb'   => null,
                    'used_pct'   => null,
                    'health_pct' => null,
                ];
            }
        });
    }

    /* ============================================================
     *  6. CPU LOAD  — TTL 10s
     *     sys_getloadavg() is read-only /proc — zero side effects.
     *     Returns null gracefully on Windows/shared hosts.
     * ============================================================ */
    private function cpuLoad(): array
    {
        return Cache::remember('health:cpu', 10, function () {
            try {
                if (!function_exists('sys_getloadavg')) {
                    throw new \RuntimeException('sys_getloadavg unavailable');
                }

                $load    = sys_getloadavg();          // [1min, 5min, 15min]
                $cores   = $this->cpuCores();
                $load1   = round($load[0], 2);
                $usedPct = $cores > 0
                    ? (int) min(100, round(($load1 / $cores) * 100))
                    : null;

                $status = match (true) {
                    $usedPct === null => 'Unknown',
                    $usedPct < 60     => 'Normal',
                    $usedPct < 85     => 'High',
                    default           => 'Critical',
                };

                return [
                    'status'     => $status,
                    'load_1min'  => $load1,
                    'load_5min'  => round($load[1], 2),
                    'load_15min' => round($load[2], 2),
                    'cores'      => $cores,
                    'used_pct'   => $usedPct,
                    'health_pct' => $usedPct !== null ? max(0, 100 - $usedPct) : null,
                ];
            } catch (\Throwable) {
                return [
                    'status'     => 'Unknown',
                    'load_1min'  => null,
                    'load_5min'  => null,
                    'load_15min' => null,
                    'cores'      => null,
                    'used_pct'   => null,
                    'health_pct' => null,
                ];
            }
        });
    }

    /* ============================================================
     *  7. SERVER UPTIME  — TTL 60s
     * ============================================================ */
    private function serverUptime(): array
    {
        return Cache::remember('health:uptime', 60, function () {
            try {
                if (!is_readable('/proc/uptime')) {
                    throw new \RuntimeException('/proc/uptime not available');
                }

                $seconds = (float) explode(' ', file_get_contents('/proc/uptime'))[0];
                $days    = floor($seconds / 86400);
                $hours   = floor(($seconds % 86400) / 3600);
                $minutes = floor(($seconds % 3600) / 60);

                return [
                    'status'         => 'Running',
                    'uptime_seconds' => (int) $seconds,
                    'days'           => $days,
                    'hours'          => $hours,
                    'minutes'        => $minutes,
                    'human'          => "{$days}d {$hours}h {$minutes}m",
                ];
            } catch (\Throwable) {
                return [
                    'status'         => 'Unknown',
                    'uptime_seconds' => null,
                    'days'           => null,
                    'hours'          => null,
                    'minutes'        => null,
                    'human'          => null,
                ];
            }
        });
    }

    /* ============================================================
     *  8. CACHE HEALTH  — TTL 10s
     * ============================================================ */
    private function cacheHealth(): array
    {
        return Cache::remember('health:cache', 10, function () {
            try {
                $key   = '__health_probe_' . uniqid();
                $value = 'ok_' . time();

                Cache::put($key, $value, 5);
                $read = Cache::get($key);
                Cache::forget($key);

                $healthy = $read === $value;

                return [
                    'status'  => $healthy ? 'Healthy' : 'Degraded',
                    'driver'  => config('cache.default'),
                    'healthy' => $healthy,
                ];
            } catch (\Throwable) {
                return [
                    'status'  => 'Unhealthy',
                    'driver'  => config('cache.default'),
                    'healthy' => false,
                ];
            }
        });
    }

    /* ============================================================
     *  HELPERS
     * ============================================================ */
    private function parseIniBytes(string $val): int
    {
        $val  = trim($val);
        $last = strtolower($val[strlen($val) - 1]);
        $num  = (int) $val;

        return match ($last) {
            'g' => $num * 1_073_741_824,
            'm' => $num * 1_048_576,
            'k' => $num * 1_024,
            default => $num,
        };
    }

    private function cpuCores(): int
    {
        try {
            if (is_readable('/proc/cpuinfo')) {
                $count = substr_count(file_get_contents('/proc/cpuinfo'), 'processor');
                return max(1, $count);
            }
        } catch (\Throwable) {
        }
        return 1;
    }
}
