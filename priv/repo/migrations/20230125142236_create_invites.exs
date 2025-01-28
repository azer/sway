defmodule Sway.Repo.Migrations.CreateInvites do
  use Ecto.Migration

  def change do
    create table(:invites) do
      add :email, :string
      add :workspace_id, references(:workspaces, on_delete: :nothing)
      add :created_by, references(:users, on_delete: :nothing)

      timestamps()
    end

    create index(:invites, [:workspace_id])
    create index(:invites, [:created_by])
  end
end
