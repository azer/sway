defmodule Sway.Repo.Migrations.UserWorkspace do
  use Ecto.Migration

  def change do
    alter table(:users) do
      # index([:slug, :org_id])
      remove :org_id
    end

    alter table(:statuses) do
      add :workspace_id, references(:workspaces, on_delete: :delete_all), null: false
    end
  end
end
