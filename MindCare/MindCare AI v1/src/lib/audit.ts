import pg from "pg";
import type { AuditAction, AuditResourceType } from "@/types";

let _pool: pg.Pool | null = null;
function getPool(): pg.Pool {
  if (!_pool) {
    _pool = new pg.Pool({
      connectionString: process.env.LOCAL_DATABASE_URL || "postgresql://bot@localhost:5432/mindcare",
      max: 5,
    });
  }
  return _pool;
}

export async function logAudit(params: {
  userId: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        params.userId,
        params.action,
        params.resourceType,
        params.resourceId,
        JSON.stringify(params.metadata || {}),
        params.ipAddress || null,
      ]
    );
  } catch (err) {
    // Audit logging should never break the main flow
    console.error("[audit] Failed to log:", err);
  }
}
