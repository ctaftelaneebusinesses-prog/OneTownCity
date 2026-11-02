use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::PgPool;
use tokio::sync::mpsc;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditJob {
    pub entity_type: String,
    pub entity_id: String,
    pub action: String,
    pub actor_id: Option<Uuid>,
    pub actor_role: String,
    pub payload: Value,
    pub simulate_dispatch: bool,
}

#[derive(Clone)]
pub struct WorkerHandle {
    sender: mpsc::Sender<AuditJob>,
}

impl WorkerHandle {
    pub fn new(sender: mpsc::Sender<AuditJob>) -> Self {
        Self { sender }
    }

    pub fn enqueue(&self, job: AuditJob) {
        match self.sender.try_send(job) {
            Ok(_) => {
                tracing::debug!("Audit worker task successfully enqueued");
            }
            Err(mpsc::error::TrySendError::Full(_)) => {
                tracing::warn!(
                    "Audit worker channel full (capacity: 100), shedding load to preserve HTTP latency budget"
                );
            }
            Err(mpsc::error::TrySendError::Closed(_)) => {
                tracing::error!("Audit worker channel is closed");
            }
        }
    }
}

pub fn start_worker(pool: PgPool) -> (WorkerHandle, tokio::task::JoinHandle<()>) {
    let (sender, mut receiver) = mpsc::channel::<AuditJob>(100);
    let handle = WorkerHandle::new(sender);

    let join_handle = tokio::spawn(async move {
        tracing::info!("Bounded async audit & notification worker started (capacity: 100)");
        while let Some(job) = receiver.recv().await {
            process_job(&pool, job).await;
        }
        tracing::info!("Bounded async audit worker shut down");
    });

    (handle, join_handle)
}

async fn process_job(pool: &PgPool, job: AuditJob) {
    let query_res = sqlx::query!(
        r#"
        INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_id, actor_role, payload, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, now())
        "#,
        Uuid::new_v4(),
        job.entity_type,
        job.entity_id,
        job.action,
        job.actor_id,
        job.actor_role,
        job.payload
    )
    .execute(pool)
    .await;

    if let Err(e) = query_res {
        tracing::error!("Failed to persist audit log entry: {}", e);
    }

    if job.simulate_dispatch {
        tracing::info!(
            entity = %job.entity_type,
            entity_id = %job.entity_id,
            action = %job.action,
            "Simulated background WhatsApp/Email notification dispatched successfully"
        );
    }
}
