defmodule Sway.Repo.Migrations.AddIsActiveAndUniqueConstraintToWorkspaces do
  use Ecto.Migration

  def change do
    alter table(:workspaces) do
      add :is_active, :boolean, default: true
    end
    create unique_index(:workspaces, [:domain, :is_active])
  end
end
