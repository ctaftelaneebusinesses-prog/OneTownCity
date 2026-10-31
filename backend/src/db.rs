use sqlx::PgPool;

/// Run any one-time database setup beyond migrations
pub async fn ensure_extensions(pool: &PgPool) -> anyhow::Result<()> {
    sqlx::query("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
        .execute(pool)
        .await?;
    Ok(())
}
