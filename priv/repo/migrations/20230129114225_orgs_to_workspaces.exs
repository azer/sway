defmodule Sway.Repo.Migrations.OrgsToWorkspaces do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      # index([:slug, :org_id])
      remove :org_id
      add :workspace_id, references(:workspaces, on_delete: :delete_all), null: false
    end

    alter table(:users) do
      add :is_superuser, :boolean, default: false, null: false
    end

    alter table(:invites) do
      add :is_active, :boolean, default: true, null: false
      add :is_admin, :boolean, default: false, null: false
    end

    create unique_index(:rooms, [:slug, :workspace_id])
  end
end
