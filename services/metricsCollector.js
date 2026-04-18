// services/metricsCollector.js
// Collects server metrics from DigitalOcean and stores them to database.
// Runs every 5 minutes in the background.

const axios = require('axios');
const pool = require('../db');

const DIGITAL_OCEAN_TOKEN = process.env.DIGITALOCEAN_TOKEN;
const METRICS_RETENTION_DAYS = 30; // Keep 30 days of historical data
const METRIC_TYPES = ['cpu', 'memory_utilization_percent', 'filesystem_utilization'];

/**
 * Fetch a single metric type from DigitalOcean for a droplet.
 * Returns null if unavailable or error.
 */
async function fetchMetricFromDO(dropletId, metricType) {
  if (!DIGITAL_OCEAN_TOKEN) return null;

  try {
    const now = Math.floor(Date.now() / 1000);
    const start = now - 300; // last 5 minutes

    const response = await axios.get(
      `https://api.digitalocean.com/v2/monitoring/metrics/droplet/${metricType}`,
      {
        params: {
          host_id: String(dropletId),
          start,
          end: now,
        },
        headers: {
          Authorization: `Bearer ${DIGITAL_OCEAN_TOKEN}`,
        },
        timeout: 10000,
      }
    );

    // Extract most recent data point value from the Prometheus time-series response
    const result = response.data?.data?.result;
    if (result && result.length > 0) {
      const latestSeries = result[result.length - 1];
      if (latestSeries?.values?.length > 0) {
        const latestPair = latestSeries.values[latestSeries.values.length - 1];
        return parseFloat(latestPair[1]) || null;
      }
    }

    return null;
  } catch (err) {
    console.error(`[METRICS] Failed to fetch ${metricType} for droplet ${dropletId}:`, err.message);
    return null;
  }
}

/**
 * Collect metrics for all active servers and store to database.
 * Deletes metrics older than METRICS_RETENTION_DAYS.
 */
async function collectAndStoreMetrics() {
  try {
    // Get all active servers with droplet IDs
    const serversResult = await pool.query(
      `SELECT id, user_id, droplet_id FROM servers 
       WHERE status = 'running' AND droplet_id IS NOT NULL`
    );

    if (serversResult.rows.length === 0) {
      console.log('[METRICS] No active servers to collect metrics for');
      return;
    }

    console.log(`[METRICS] Collecting metrics for ${serversResult.rows.length} servers...`);

    let successCount = 0;

    for (const server of serversResult.rows) {
      try {
        // Fetch all three metrics in parallel
        const [cpu, memory, disk] = await Promise.all([
          fetchMetricFromDO(server.droplet_id, 'cpu'),
          fetchMetricFromDO(server.droplet_id, 'memory_utilization_percent'),
          fetchMetricFromDO(server.droplet_id, 'filesystem_utilization'),
        ]);

        // Only store if at least one metric is available
        if (cpu !== null || memory !== null || disk !== null) {
          await pool.query(
            `INSERT INTO server_metrics_history (server_id, user_id, cpu_percent, memory_percent, disk_percent)
             VALUES ($1, $2, $3, $4, $5)`,
            [server.id, server.user_id, cpu, memory, disk]
          );

          successCount++;
        }
      } catch (err) {
        console.error(`[METRICS] Error storing metrics for server ${server.id}:`, err.message);
        // Continue with next server on error
      }
    }

    console.log(`[METRICS] Successfully stored metrics for ${successCount}/${serversResult.rows.length} servers`);

    // Clean up old data (retention policy)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - METRICS_RETENTION_DAYS);

    const deleteResult = await pool.query(
      `DELETE FROM server_metrics_history WHERE created_at < $1`,
      [cutoffDate]
    );

    if (deleteResult.rowCount > 0) {
      console.log(`[METRICS] Cleaned up ${deleteResult.rowCount} old metrics records`);
    }
  } catch (err) {
    console.error('[METRICS] Collection error:', err.message);
  }
}

module.exports = { collectAndStoreMetrics };
