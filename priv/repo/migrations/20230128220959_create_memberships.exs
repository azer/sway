defmodule Sway.Repo.Migrations.CreateMemberships do
  use Ecto.Migration

  def change do
    create table(:memberships) do
      add :is_admin, :boolean, default: false, null: false
      add :workspace_id, references(:workspaces, on_delete: :nothing), null: false
      add :user_id, references(:users, on_delete: :nothing), null: false

      timestamps()
    end

    create index(:memberships, [:workspace_id])
    create index(:memberships, [:user_id])
  end
end
