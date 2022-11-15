defmodule Bafa.Repo.Migrations.CreateStatuses do
  use Ecto.Migration

  def change do
    create table(:statuses) do
      add :status, :string
      add :message, :string
      add :started_at, :naive_datetime
      add :ended_at, :naive_datetime
      add :user_id, references(:users, on_delete: :nothing)
      add :org_id, references(:orgs, on_delete: :nothing)

      timestamps()
    end

    create index(:statuses, [:user_id])
    create index(:statuses, [:org_id])
  end
end
