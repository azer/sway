defmodule Sway.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :body, :text
      add :is_active, :boolean, default: false, null: false
      add :edited_at, :utc_datetime
      add :room_id, references(:rooms, on_delete: :nothing), null: false
      add :user_id, references(:users, on_delete: :nothing), null: false
      add :thread_id, references(:messages, on_delete: :nothing)

      timestamps()
    end

    create index(:messages, [:room_id])
    create index(:messages, [:user_id])
    create index(:messages, [:thread_id])
  end
end
