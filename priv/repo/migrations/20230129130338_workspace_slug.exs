defmodule Sway.Repo.Migrations.WorkspaceSlug do
  use Ecto.Migration

  def change do
    alter table(:workspaces) do
      # index([:slug, :org_id])
      add :slug, :string, null: false
    end

    create unique_index(:workspaces, [:slug])
  end
end
